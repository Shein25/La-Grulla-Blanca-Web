import { bindSemantic, requireRestorePermit, fail, clone } from './g08-semantic.js';
import { createNewMaterialInventory } from '../../../runtime/material-inventory-v306.js';
import { requireResolvedMonsterDeath } from '../../../runtime/m02-v284-authority.js';

const observationCaps=new WeakMap();
function requireNativeCorpseObservation(cap){const r=observationCaps.get(cap);if(!r||!r.current())throw Error('LI_FORGED_OR_STALE_CORPSE_OBSERVATION');return r;}
const proofs=new WeakMap(),preparedSources=new WeakMap();
function requireExtractionReceipt(cap){const d=proofs.get(cap);if(!d||!d.current())throw Error('EXTRACTION_RECEIPT_NOT_AUTHENTIC');return d;}
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
function connectNewCorpseExtraction({runtime:g,targets,m02Domain,definitions,materialDefinitions,ttl,random,input,readOwner,onNativeObservation=null,resolveConsumption=null,fault=null}){
 if(!Number.isSafeInteger(ttl)||ttl<1||typeof random!=='function')throw Error('CORPSE_AUTHORITY_MISSING');
 const tables=freeze(structuredClone(definitions));let generation=0,serial=0,corpses=new WeakMap(),receipts=[],attempts=0,failures=0,successes=0,busy=false,postCommitFailures=0;const postCommitNotes=[];let corpseLedger=new Map();
 const catalog={};for(const table of Object.values(tables))for(const h of table.hallazgos){const m=materialDefinitions?.[h.item];if(!m||m.tipo!=='material'||typeof m.name!=='string'||!m.name)throw Error('MATERIAL_CATALOG_SOURCE_MISSING:'+h.item);catalog[h.item]={id:h.item,name:m.name};}
 function readyContext(){let ready=false;try{ready=readOwner()?.state?.actorId==='player';}catch{}return {actor:g.player,generation,ready};}
 const materialOwner=createNewMaterialInventory({readContext:readyContext,catalog,resolveConsumption,resolveExtraction:cap=>{const x=preparedSources.get(cap);if(!x||x.status!=='PREPARED'||!x.record.current())throw Error('MATERIAL_PREPARED_SOURCE_NOT_AUTHENTIC');return x.record;}});
 const ordinaryInventory=g.cmd_inventario;
 if(typeof ordinaryInventory!=='function')throw Error('ORDINARY_INVENTORY_COMMAND_MISSING');
 g.cmd_inventario=function(...args){const ordinary=ordinaryInventory.apply(this,args);return this===g?`${ordinary}\n\nMateriales de extracción:\n${materialOwner.describe()}`:ordinary;};
 const oldList=g.cadaveresEnSala,oldObserve=g.observarCadaver,oldDescribe=g.describirCadaver,oldExtract=g.recolectarCadaver,oldNew=g.nuevaPartida,oldMission=g.gestionarMisionesNpc;
 let examPermission=null;
 g.gestionarMisionesNpc=function(...args){
  const eligible=this===g&&input.current()&&args[0]==='chen_bo'&&g.pos==='sala_anatomica'&&m02Domain.inspect().applied&&!g.flags.arc1.hitos.EXAMEN_ESPIRITUAL_APRENDIDO;
  const result=oldMission.apply(this,args);
  if(eligible&&typeof result==='string'&&result.length&&g.flags.arc1.hitos.EXAMEN_ESPIRITUAL_APRENDIDO&&g.profesionDesbloqueada('examen'))examPermission=Object.freeze({actor:g.player,generation,rank:g.rangoProfesion('examen').nivel});
  return result;
 };
 const allowed=()=>examPermission?.actor===g.player&&examPermission?.generation===generation;
 function live(c){const d=corpses.get(c);return d&&d.generation===generation&&d.actor===g.player&&d.roomId===g.pos&&g.turnoGlobal<d.expires&&c.mob_id===d.speciesId&&c.caidoEn===d.turn&&c.desapareceEn===d.expires;}
 g.cadaveresEnSala=function(rid=this.pos){const a=oldList.call(this,rid);if(this!==g)return a;return a.filter(c=>c.arc1_tutorial||live(c));};
 g.describirCadaver=function(c,...args){if(corpses.has(c)){if(!live(c))return 'No hay un cuerpo NEW auténtico disponible.';return `${c.tipo==='restos'?'Los restos':'El cadáver'} de ${c.name} permanecen donde cayó. Puedes examinarlos mediante EXTRAER.`;}return oldDescribe.call(this,c,...args);};
 g.observarCadaver=function(i=0,...args){const c=this.cadaveresEnSala()[Number(i)||0],d=corpses.get(c);if(!d)return oldObserve.call(this,i,...args);
  if(!live(c)||!allowed()||!this.profesionDesbloqueada('examen'))return {ok:false,texto:'Examen auténtico no disponible.'};
  const table=tables[d.speciesId];if(!table)return {ok:false,texto:'No hay procedimiento anatómico autorizado para este cuerpo.'};
  const nuevo=!d.observed;d.observed=true;c.investigado=['observado'];
  if(input.current()&&!g.pregunta&&!g.combate&&!g.terminado){const cap=Object.freeze({}),actor=g.player,gen=generation;observationCaps.set(cap,Object.freeze({lifeId:d.lifeId,speciesId:d.speciesId,roomId:d.roomId,corpseGeneration:gen,profession:'examen',current:()=>actor===g.player&&generation===gen&&live(c)&&allowed()}));try{onNativeObservation?.(cap);}finally{observationCaps.delete(cap);}}
  return {ok:true,cuerpo:c,tabla:table,nuevo};
 };
 g.recolectarCadaver=function(i=0,method=''){
  const c=this.cadaveresEnSala()[Number(i)||0],d=corpses.get(c);if(!d)return oldExtract.call(this,i,method);
  if(busy)return 'Hay una extracción en resolución; espera a que termine.';
  if(!input.current()||!live(c)||!allowed()||this.pregunta||this.combate||this.terminado||!this.profesionDesbloqueada('examen'))return 'Extracción no autorizada en este contexto.';
  const table=tables[d.speciesId],h=table?.hallazgos.find(x=>[x.id,x.id.replaceAll('_',' '),x.metodo].includes(String(method).trim().toLowerCase()));
  if(!h)return 'No reconoces ese procedimiento anatómico exacto.';
  if(d.used.has(h.id))return 'Ese procedimiento ya fue intentado en este cadáver.';
  if(!Number.isSafeInteger(h.cantidad)||h.cantidad<1||typeof h.item!=='string')return 'Parámetros anatómicos no autorizados.';
  let tick;try{tick=targets.prepareExtractionTick();for(const k of ['examenProcedimientos','desapareceEn']){const desc=Object.getOwnPropertyDescriptor(c,k);if(!desc?.writable||!Object.hasOwn(desc,'value'))throw Error('CORPSE_WRITE_PROTECTED');}}catch{return 'Extracción bloqueada por contexto o proyección no válida.';}
  const o=readOwner();if(!o?.state)return 'Owner NEW no disponible.';
  const prob=this.probabilidadExamen(h,examPermission.rank),roll=random();if(!Number.isFinite(prob)||prob<0||prob>1||!Number.isFinite(roll)||roll<0||roll>=1)return 'Probabilidad no válida.';
  const success=roll<=prob,cap=Object.freeze({}),gen=generation,actor=g.player,attemptId=serial+1;
  const rec=Object.freeze({generation:gen,actor,speciesId:d.speciesId,birthSequence:d.birthSequence,lifeId:d.lifeId,procedureId:h.id,catalogId:h.item,roomId:d.roomId,attemptId,difficulty:h.dificultad,success,probability:prob,quantity:success?h.cantidad:0,current:()=>generation===gen&&g.player===actor});
  const prepared={record:rec,status:'PREPARED'};preparedSources.set(cap,prepared);
  const before={used:d.used,expires:d.expires,projection:c.examenProcedimientos,projectionExpiry:c.desapareceEn,serial,attempts,successes,failures,receipts};let materialPlan=null,materialCommitted=false,published=false;
  const text=success?`Extracción espiritual: obtienes ${h.cantidad} ${catalog[h.item].name} mediante ${h.metodo}.`:`La intervención falla y arruina ${h.metodo}. No obtienes material. Esa estructura ya no puede intentarse en este cadáver.`;
  busy=true;
  try{
   materialPlan=materialOwner.prepareExtraction(cap);
   try{
    fault?.('BEFORE_EXTRACTION_COMMIT');tick.commit();fault?.('AFTER_EXTRACTION_TICK');
    d.used=new Map(d.used).set(h.id,success?'exito':'fallo');d.expires=before.expires+(success?1:0);c.examenProcedimientos=Object.fromEntries(d.used);c.desapareceEn=d.expires;fault?.('AFTER_CORPSE_PROJECTION');
    materialOwner.commitExtraction(materialPlan);materialCommitted=true;fault?.('AFTER_MATERIAL_INVENTORY_WRITE');fault?.('BEFORE_EXTRACTION_PUBLICATION');
    serial=attemptId;attempts++;if(success)successes++;else failures++;proofs.set(cap,rec);receipts=receipts.concat(cap);
    materialOwner.finalizeExtraction(materialPlan);prepared.status='PUBLISHED';published=true;
   }catch(error){
    if(!published){if(materialPlan)materialOwner.rollbackExtraction(materialPlan);tick.rollback();d.used=before.used;d.expires=before.expires;c.examenProcedimientos=before.projection;c.desapareceEn=before.projectionExpiry;({serial,attempts,successes,failures,receipts}=before);proofs.delete(cap);prepared.status='ABORTED';}
    throw error;
   }
   // No presentation or bookkeeping callback can undo a published semantic result.
   const post=(phase,fn)=>{try{fn();}catch(error){postCommitFailures++;if(postCommitNotes.length<32)postCommitNotes.push(Object.freeze({attemptId,phase,error:String(error?.message||error)}));}};
   post('AFTER_EXTRACTION_PUBLICATION',()=>fault?.('AFTER_EXTRACTION_PUBLICATION'));
   post('ACTIVITY',()=>this.registrarActividadReposo(1));
   post('BAR',()=>this.actualizarBarra());post('PANEL',()=>this.actualizarPanel());
   return text;
  }finally{busy=false;}
 };
 g.nuevaPartida=function(...args){generation++;serial=0;corpseLedger=new Map();examPermission=null;corpses=new WeakMap();receipts=[];materialOwner.reset();postCommitFailures=0;postCommitNotes.length=0;busy=false;attempts=failures=successes=0;return oldNew.apply(this,args);};
 const api=Object.freeze({
  prepare(cap,context){const death=requireResolvedMonsterDeath(cap);if(death.targetOwner!==context.owner||death.identity.instanceId==='errant:rata_despensa')throw Error('CORPSE_DEATH_SCOPE');
   if(['eco_caido','sombra_ahogada'].includes(death.identity.speciesId))return {commit(){},rollback(){}};
   const speciesId=death.identity.speciesId,m=context.mob,turn=g.turnoGlobal,actor=g.player,gen=generation;
   const c={mob_id:speciesId,name:m.name,corto:m.corto||m.name,elemento:m.elemento||null,tipo:['centinela_pluma','guardian_coral','rey_escarabajo'].includes(speciesId)?'restos':'cadáver',caidoEn:turn,desapareceEn:turn+ttl,investigado:[],examenProcedimientos:{}};
   const prior=g.cadaveres,next={...prior,[g.pos]:(prior[g.pos]||[]).concat([c])};
   const d={generation:gen,actor,roomId:g.pos,speciesId,birthSequence:context.sequence,lifeId:context.lifeId,turn,expires:turn+ttl,observed:false,used:new Map()};let published=false;
   return {commit(){if(g.player!==actor||generation!==gen||g.cadaveres!==prior)throw Error('CORPSE_STALE');fault?.('BEFORE_CORPSE_COMMIT');g.cadaveres=next;corpses.set(c,d);corpseLedger.set(d.lifeId,{corpse:c,record:d});published=true;},rollback(){if(published){g.cadaveres=prior;corpses.delete(c);corpseLedger.delete(d.lifeId);}}};
  },
  inspect:()=>freeze({generation,examPermission:allowed(),examRank:examPermission?.rank??null,attempts,successes,failures,inventory:materialOwner.inspect().items,materialInventory:materialOwner.inspect(),postCommitFailures,postCommitNotes:postCommitNotes.slice(),busy,receipts:receipts.map(c=>{const d=proofs.get(c);return {speciesId:d.speciesId,birthSequence:d.birthSequence,procedureId:d.procedureId,success:d.success,difficulty:d.difficulty,quantity:d.quantity};}),saveConnected:false,questCredits:0,professionXPConnected:false}),
  materialInventory:()=>materialOwner,
  materialContext:readyContext,
  receipts:()=>Object.freeze(receipts.slice())
 });
 bindSemantic(api,{capture(){if(busy)fail('G08_EXTRACTION_BUSY');return clone({version:1,generation,serial,examPermission:examPermission?{generation:examPermission.generation,rank:examPermission.rank}:null,
 corpses:[...corpseLedger].map(([id,x])=>({corpseId:'corpse:'+generation+':'+id,projectionIndex:(g.cadaveres[x.record.roomId]||[]).indexOf(x.corpse),lifeId:id,corpse:x.corpse,record:{generation:x.record.generation,roomId:x.record.roomId,speciesId:x.record.speciesId,birthSequence:x.record.birthSequence,lifeId:x.record.lifeId,turn:x.record.turn,expires:x.record.expires,observed:x.record.observed,used:[...x.record.used]}})),attempts:receipts.map(cap=>{const d=proofs.get(cap);return Object.fromEntries(Object.entries(d).filter(([k])=>!['actor','current'].includes(k)));})});},
 prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1)fail('G08_CORPSE_VERSION');const lives=new Set(c.envelope.domains.Lifecycle.records.map(r=>r.lifeId).concat(c.envelope.domains.Lifecycle.retired.map(r=>r.identity.lifeId).filter(Boolean)));
  if(new Set(d.corpses.map(x=>x.corpseId)).size!==d.corpses.length)fail('G08_CORPSE_DUPLICATE');const projections=new Set();for(const x of d.corpses){if(x.corpseId!=='corpse:'+d.generation+':'+x.lifeId)fail('G08_CORPSE_ID');if(x.projectionIndex>=0){const key=x.record.roomId+':'+x.projectionIndex;if(projections.has(key))fail('G08_CORPSE_ALIAS');projections.add(key);const body=c.envelope.domains.World?.cadaveres?.[x.record.roomId]?.[x.projectionIndex];if(!body||body.arc1_tutorial||body.mob_id!==x.record.speciesId||body.caidoEn!==x.record.turn)fail('G08_CORPSE_PROJECTION');}}
  for(const x of d.corpses)if(!lives.has(x.lifeId)||x.record.lifeId!==x.lifeId||x.record.speciesId!==x.corpse.mob_id||x.record.generation!==d.generation)fail('G08_CORPSE_LIFE');
  for(const a of d.attempts)if(a.generation!==d.generation||!d.corpses.some(x=>x.lifeId===a.lifeId&&x.record.used.some(([id,result])=>id===a.procedureId&&result===(a.success?'exito':'fallo'))))fail('G08_ATTEMPT_SOURCE');
  return {apply(){const old={generation,serial,examPermission,corpses,corpseLedger,receipts,busy};generation=d.generation;serial=d.serial;examPermission=d.examPermission?Object.freeze({...d.examPermission,actor:g.player}):null;corpses=new WeakMap();corpseLedger=new Map();receipts=[];busy=false;
   for(const x of d.corpses){const body=(x.projectionIndex>=0?(g.cadaveres[x.record.roomId]||[])[x.projectionIndex]:null)||clone(x.corpse),record={...clone(x.record),actor:g.player,used:new Map(x.record.used)};corpses.set(body,record);corpseLedger.set(x.lifeId,{corpse:body,record});}
   for(const a of d.attempts){const cap=Object.freeze({}),actor=g.player,gen=generation,record=Object.freeze({...clone(a),actor,current:()=>g.player===actor&&generation===gen});proofs.set(cap,record);receipts.push(cap);}
   return ()=>({generation,serial,examPermission,corpses,corpseLedger,receipts,busy}=old);}};
 }});return api;
}

export { connectNewCorpseExtraction, requireExtractionReceipt, requireNativeCorpseObservation };
