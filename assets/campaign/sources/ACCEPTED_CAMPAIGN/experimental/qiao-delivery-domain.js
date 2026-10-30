import { bindSemantic, requireRestorePermit, fail, semanticPort, clone } from './g08-semantic.js';
import { requireMaterialConsumptionReceipt, requireNewMaterialInventory } from '../../../runtime/material-inventory-v306.js';
import { createQiaoMaterialDeliveryBoundary } from './qiao-material-delivery-boundary.js';
import { requireM03Institution } from '../../../runtime/p2-evaluation-r56.js';

const deliveryProofs=new WeakMap();
function requireQiaoDeliveryReceipt(cap){const d=deliveryProofs.get(cap);if(!d||!d.current())throw Error('QIAO_DELIVERY_RECEIPT_NOT_AUTHENTIC');requireMaterialConsumptionReceipt(d.consumptionReceipt);return d;}
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
function createQiaoDeliveryDomain({readContext,fault=null}){
 let inventory=null,boundary=null,session=null,accepted=null,busy=false,sequence=0,authorizations=new WeakMap();let durableDelivery=null;const stats={commits:0,cancellations:0,blocked:0,postCommitErrors:0};
 function context(){const c=readContext();if(!c||!c.actor||!Number.isSafeInteger(c.generation)||c.stage!=='LianQi_I'||c.roomId!=='pabellon_disciplina'||!c.presence||!c.permission||!c.m03)throw Error('QIAO_DELIVERY_INELIGIBLE');return Object.freeze({...c});}
 function match(a,b){return a.actor===b.actor&&a.generation===b.generation&&a.epoch===b.epoch&&a.roomId===b.roomId;}
 function current(s){try{return session===s&&!s.used&&match(s.context,context());}catch{return false;}}
 function eligibleItem(i,c){return i.quantity===1&&typeof i.instanceId==='string'&&i.provenance?.kind==='AUTHENTIC_NEW_EXTRACTION'&&i.provenance.generation===c.generation&&i.provenance.lifeId===i.lifeId&&i.provenance.speciesId===i.speciesId&&i.provenance.procedureId===i.procedureId&&['dificil','muy_dificil'].includes(i.provenance.difficulty);}
 const api=Object.freeze({
  connectDurable(fn){if(durableDelivery||typeof fn!=='function')throw Error('G08C_DELIVERY_CONNECT_ONCE');durableDelivery=fn;},
  deliver(cap,species){return durableDelivery?durableDelivery(cap,species):api.commit(cap,species);},
  connect(owner){if(inventory)throw Error('QIAO_INVENTORY_CONNECT_ONCE');inventory=requireNewMaterialInventory(owner);boundary=createQiaoMaterialDeliveryBoundary(owner);},
  eligible(){try{context();return !!inventory&&!accepted&&!busy;}catch{return false;}},
  begin(){if(!api.eligible())throw Error('QIAO_DELIVERY_UNAVAILABLE');const c=context(),s={context:c,used:false,token:Object.freeze({}),revision:inventory.inspect().revision};session=s;return s.token;},
  choices(cap){const s=session;if(!s||s.token!==cap||!current(s))throw Error('QIAO_SESSION_STALE');const groups={};for(const i of inventory.inspect().items)if(eligibleItem(i,s.context))(groups[i.speciesId]||=[]).push(i);return freeze(Object.entries(groups).filter(([,items])=>items.length>=3).map(([speciesId,items])=>({speciesId,available:items.length,items:items.map(i=>({...i,provenance:{...i.provenance}}))})));},
  resolveAuthorization(cap){const a=authorizations.get(cap);if(!a||a.used||!current(a.session)||inventory.inspect().revision!==a.revision)throw Error('QIAO_CONSUMPTION_AUTHORITY_NOT_AUTHENTIC');return Object.freeze({actor:a.session.context.actor,generation:a.session.context.generation,purpose:'QIAO_FIRST_THRESHOLD_MATERIAL_DELIVERY',active:true,instanceIds:Object.freeze(a.ids.slice()),current:()=>{try{return !a.used&&current(a.session)&&inventory.inspect().revision===a.revision;}catch{return false;}}});},
  commit(cap,species){if(busy)throw Error('QIAO_DELIVERY_REENTRANT');const s=session;if(!s||s.token!==cap||!current(s)||accepted||inventory.inspect().revision!==s.revision)throw Error('QIAO_DELIVERY_STALE');
   if(!Array.isArray(species)||species.length!==2||new Set(species).size!==2)throw Error('QIAO_TWO_SPECIES_REQUIRED');
   const groups=api.choices(cap),selected=species.flatMap(id=>{const g=groups.find(g=>g.speciesId===id);if(!g)throw Error('QIAO_THREE_ITEMS_PER_SPECIES_REQUIRED');return g.items.slice(0,3);});
   const ids=selected.map(i=>i.instanceId);if(selected.length!==6||new Set(ids).size!==6||selected.some(i=>!eligibleItem(i,s.context)))throw Error('QIAO_SIX_AUTHENTIC_ITEMS_REQUIRED');
   const auth=Object.freeze({}),authority={session:s,ids,revision:s.revision,used:false};authorizations.set(auth,authority);
   let plan=null,pending=null,finalized=false,receipt=Object.freeze({});const record={actor:s.context.actor,generation:s.context.generation,recipientId:'qiao_ren',deliveryId:'qiao-delivery:'+s.context.generation+':'+(++sequence),quantity:6,species:species.slice(),items:selected,consumptionReceipt:null,current:()=>{try{return accepted?.receipt===receipt&&readContext()?.actor===record.actor&&readContext()?.generation===record.generation;}catch{return false;}}};
   busy=true;
   try{fault?.('BEFORE_CONSUMPTION_PREPARE');plan=boundary.prepare(auth);fault?.('AFTER_CONSUMPTION_PREPARE');pending=boundary.commit(plan);record.consumptionReceipt=pending.receipt;fault?.('AFTER_CONSUMPTION_COMMIT');
    if(pending.quantity!==6||JSON.stringify(pending.items.map(i=>i.instanceId))!==JSON.stringify(ids))throw Error('QIAO_CONSUMPTION_MISMATCH');
    fault?.('AFTER_RECEIVER_PREPARE');fault?.('BEFORE_JOINT_FINALIZATION');boundary.finalize(plan);finalized=true;
    accepted={receipt,record};deliveryProofs.set(receipt,Object.freeze(record));s.used=true;authority.used=true;session=null;stats.commits++;
    try{fault?.('AFTER_JOINT_PUBLICATION');}catch{stats.postCommitErrors++;}
    return Object.freeze({status:'DELIVERED',receipt,quantity:6,recipientId:'qiao_ren'});
   }catch(error){if(!finalized){if(plan)boundary.rollback(plan);authority.used=true;s.used=true;session=null;stats.blocked++;throw error;}
    // Finalized stock must always have its matching private receiver outcome.
    if(!accepted){accepted={receipt,record};deliveryProofs.set(receipt,Object.freeze(record));stats.commits++;}s.used=true;authority.used=true;session=null;stats.postCommitErrors++;return Object.freeze({status:'DELIVERED',receipt,quantity:6,recipientId:'qiao_ren'});
   }finally{busy=false;}
  },
  cancel(){if(session){session.used=true;session=null;stats.cancellations++;}},
  reset(){session=null;accepted=null;busy=false;sequence=0;authorizations=new WeakMap();for(const k of Object.keys(stats))stats[k]=0;},
  inspect(){let scope=null;try{scope=context();}catch{}return freeze({...stats,pending:!!session,busy,received:!!accepted,quantity:accepted?.record.quantity||0,items:accepted?accepted.record.items.map(i=>({...i,provenance:{...i.provenance}})):[],recipientId:'qiao_ren',generation:scope?.generation??null,missionActive:false,recognitionActive:false,pillConnected:false,stageIssuerInstalled:false,saveConnected:false});}
 });
 bindSemantic(api,{receipt(){if(!accepted)fail('G08C_RECEIPT_ABSENT');return accepted.receipt;},propose(cap,species){const s=session;if(busy||!s||s.token!==cap||!current(s)||accepted||inventory.inspect().revision!==s.revision)fail('G08C_DELIVERY_STALE');if(!Array.isArray(species)||species.length!==2||new Set(species).size!==2)fail('G08C_TWO_SPECIES');const groups=api.choices(cap),selected=species.flatMap(id=>{const row=groups.find(x=>x.speciesId===id);if(!row)fail('G08C_STOCK');return row.items.slice(0,3);});const ids=selected.map(i=>i.instanceId);if(ids.length!==6||new Set(ids).size!==6||selected.some(i=>!eligibleItem(i,s.context)))fail('G08C_SIX_ITEMS');const auth=Object.freeze({}),a={session:s,ids,revision:s.revision,used:false};authorizations.set(auth,a);const plan=boundary.prepare(auth);let retired=false;const value=clone({version:1,sequence:sequence+1,accepted:{generation:s.context.generation,recipientId:'qiao_ren',deliveryId:'qiao-delivery:'+s.context.generation+':'+(sequence+1),quantity:6,species:species.slice(),items:selected}});return Object.freeze({qiao:value,materials:semanticPort(inventory).previewConsumption(plan),current:()=>!retired&&current(s)&&inventory.inspect().revision===s.revision,cancel(){if(retired)return;retired=true;try{boundary.rollback(plan);}catch{}a.used=true;s.used=true;if(session===s)session=null;},retire(){retired=true;a.used=true;s.used=true;}});},capture(){if(busy)fail('G08_QIAO_BUSY');return clone({version:1,sequence,accepted:accepted?Object.fromEntries(Object.entries(accepted.record).filter(([k])=>!['actor','current','consumptionReceipt'].includes(k))):null});},
 prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1)fail('G08_QIAO_VERSION');if(d.accepted){const a=d.accepted,mat=c.envelope.domains.Materials;if(a.quantity!==6||a.recipientId!=='qiao_ren'||a.items.length!==6||new Set(a.items.map(i=>i.instanceId)).size!==6||a.items.some(i=>!mat.consumed.includes(i.instanceId)||mat.items.some(x=>x.instanceId===i.instanceId))||a.species.length!==2||a.species.some(s=>a.items.filter(i=>i.speciesId===s).length!==3)||!c.envelope.domains.Institution.formalized)fail('G08_QIAO_CONSUMPTION');}
  return {apply(){const old={accepted,session,busy,sequence,authorizations};accepted=null;session=null;busy=false;sequence=d.sequence;authorizations=new WeakMap();if(d.accepted){const receipt=Object.freeze({}),record={...clone(d.accepted),actor:c.context.actor(),consumptionReceipt:semanticPort(inventory).receipt(d.accepted,c),current:()=>accepted?.receipt===receipt&&readContext()?.actor===record.actor&&readContext()?.generation===record.generation};accepted={receipt,record};deliveryProofs.set(receipt,Object.freeze(record));}return ()=>({accepted,session,busy,sequence,authorizations}=old);}};
 }});return api;
}

function connectQiaoNativeDelivery({runtime:g,domain,input,npcResolver,questDefinitions,monsterDefinitions,readNew,readM3,readMaterialContext}){
 let epoch=0,lease=null,issuing=false;const oldCommand=g.cmd_entregar;
 const names=Object.fromEntries(Object.entries(monsterDefinitions).map(([id,d])=>[id,d.name]));
 function clear(){domain.cancel();if(lease&&g.pregunta===lease.question){g.pregunta=null;g.desactivarEleccionActiva();}lease=null;}
 function capture(){const material=readMaterialContext(),n=readNew(),m=readM3(),d=requireM03Institution(m);if(!d.current()||d.actor!==g.player)throw Error('QIAO_M03_PROOF_REQUIRED');return {actor:g.player,generation:material.generation,epoch,roomId:g.pos,stage:n.stage,presence:g.npcPresente('qiao_ren',g.pos)===true&&g.npcsEnSala(g.pos).includes('qiao_ren'),permission:g.player?.facciones?.grulla_blanca?.estado==='miembro'&&g.terminado===false&&g.combate===null,m03:true};}
 function ask(cap,phase,species=[]){const choices=domain.choices(cap).filter(c=>!species.includes(c.speciesId));const options=phase==='CONFIRM'?[{valor:'1',texto:'Entregar estas seis piezas.'}]:choices.map((c,n)=>({valor:String(n+1),texto:(names[c.speciesId]||c.speciesId)+' · '+c.available+' piezas difíciles'}));options.push({valor:'0',texto:'Cancelar entrega.'});
  const l={cap,phase,species,choices,question:null,used:false,epoch};lease=l;issuing=true;
  try{g.preguntarEleccionMultiple({titulo:'Qiao Ren · Entrega de materiales',pregunta:phase==='CONFIRM'?'Entregar tres piezas de cada especie seleccionada.':phase==='FIRST'?'Elige la primera especie.':'Elige una segunda especie distinta.',opciones:options,callback:value=>{
   if(lease!==l||l.used||!input.current()||g.pregunta!==null||epoch!==l.epoch)return;
   l.used=true;lease=null;try{capture();if(value==='0'){domain.cancel();g.salida('Entrega cancelada. Conservas tus materiales.','sistema');return;}
    if(phase==='CONFIRM'){const emit=result=>{requireQiaoDeliveryReceipt(result.receipt);try{g.salida('Qiao Ren recibe las seis piezas entregadas.','sistema');}catch{}};const result=domain.deliver(cap,species);if(result&&typeof result.then==='function'){void result.then(emit).catch(error=>{domain.cancel();try{g.salida(error?.message?.includes('RECOVERY_REQUIRED')?'La entrega está guardada; carga el último estado NEW para completar su recuperación.':'La entrega no se guardó. Conservas tus materiales; consulta tu inventario.','sistema');}catch{}});return;}emit(result);return;}
    const selected=choices[Number(value)-1];if(!selected)throw Error('QIAO_INVALID_SELECTION');ask(cap,phase==='FIRST'?'SECOND':'CONFIRM',species.concat(selected.speciesId));
   }catch{domain.cancel();g.salida('La entrega no pudo validarse; consulta tu inventario.','sistema');}
  }});l.question=g.pregunta;}finally{issuing=false;}
 }
 g.cmd_entregar=function(args){if(this!==g)return oldCommand.call(this,args);const present=g.npcsEnSala(g.pos),target=args?.length?npcResolver(args.join(' '),present):present.length===1?present[0]:null;
  if(target!=='qiao_ren')return oldCommand.call(this,args);
  // Existing canonical delivery missions retain priority; no handler is reinvoked or result discarded.
  if(Object.keys(g.quests).some(id=>g.quests[id]==='activa'&&questDefinitions[id]&&g.valorMision(questDefinitions[id],'entrega',null)==='qiao_ren'))return oldCommand.call(this,args);
  if(!input.current()||g.pregunta||g.combate)return 'La entrega no está disponible en este contexto.';
  try{capture();if(!domain.eligible())return 'No hay una entrega de materiales disponible.';const cap=domain.begin(),choices=domain.choices(cap);if(choices.length<2){domain.cancel();return 'Necesitas tres piezas difíciles de cada una de dos especies distintas.';}ask(cap,'FIRST');}catch{return 'Completa primero tu formalización y consulta a Qiao en el Pabellón de Disciplina.';}
 };
 for(const name of ['preguntar','preguntarEleccionMultiple']){const old=g[name];g[name]=function(...args){if(this===g&&!issuing)clear();return old.apply(this,args);};}
 const enter=g.entrarSala;g.entrarSala=function(...args){if(this===g){epoch++;clear();}return enter.apply(this,args);};
 const fresh=g.nuevaPartida;g.nuevaPartida=function(...args){if(this===g){epoch++;clear();domain.reset();}return fresh.apply(this,args);};
 return Object.freeze({capture});
}

export { connectQiaoNativeDelivery, createQiaoDeliveryDomain, requireQiaoDeliveryReceipt };
