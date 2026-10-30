import { bindSemantic, requireRestorePermit, fail as fail$1, integer, unique, clone } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

// Semantic material ownership only; no equipment, currency, profession XP or SAVE.
const owners=new WeakSet(),consumptionProofs=new WeakMap();
const allowedPurpose=p=>p==='QIAO_FIRST_THRESHOLD_MATERIAL_DELIVERY'||p==='V201_EQUIPMENT_SERVICE'||p==='V201_MATERIAL_BUYBACK'||p==='P03_D4_ALCHEMY_RECIPE';
const fail=c=>{throw Error(c);};
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
function requireNewMaterialInventory(owner){if(!owners.has(owner))fail('MATERIAL_INVENTORY_NOT_AUTHENTIC');return owner;}
function requireMaterialConsumptionReceipt(cap){const d=consumptionProofs.get(cap);if(!d||!d.current())fail('MATERIAL_CONSUMPTION_RECEIPT_NOT_AUTHENTIC');return d;}
function createNewMaterialInventory({readContext,resolveExtraction,resolveConsumption=null,catalog}){
 if(typeof readContext!=='function'||typeof resolveExtraction!=='function')fail('MATERIAL_INVENTORY_PORT');
 const definitions=freeze(structuredClone(catalog));let revision=0,items=new Map(),sources=new Set(),consumed=new Set(),bound=null;
 let plans=new WeakMap(),usedConsumption=new WeakSet();
 function context(){const c=readContext();if(!c?.actor||!Number.isSafeInteger(c.generation)||c.generation<0||c.ready!==true)fail('MATERIAL_OWNER_UNAVAILABLE');
  if(bound&&(bound.actor!==c.actor||bound.generation!==c.generation))fail('MATERIAL_OWNER_CONTEXT_CHANGED');return c;}
 function same(a,b){return a.actor===b.actor&&a.generation===b.generation;}
 function plan(cap,kind){const p=plans.get(cap);if(!p||p.kind!==kind||p.status!=='PREPARED'||p.revision!==revision||!same(p.context,context()))fail('MATERIAL_PLAN_NOT_AUTHENTIC_OR_STALE');return p;}
 const api=Object.freeze({
  prepareExtraction(source){const c=context(),d=resolveExtraction(source);if(!d.current()||d.actor!==c.actor||d.generation!==c.generation||typeof d.success!=='boolean')fail('MATERIAL_EXTRACTION_SCOPE');
   if(typeof d.lifeId!=='string'||!d.lifeId||typeof d.speciesId!=='string'||!d.speciesId||typeof d.procedureId!=='string'||!d.procedureId||typeof d.catalogId!=='string'||typeof d.roomId!=='string'||!Number.isSafeInteger(d.birthSequence)||d.birthSequence<1||!Number.isSafeInteger(d.attemptId)||d.attemptId<1||!Number.isSafeInteger(d.quantity)||d.quantity<0||d.success!== (d.quantity>0))fail('MATERIAL_EXTRACTION_SHAPE');
   const key=JSON.stringify([c.generation,d.lifeId,d.speciesId,d.procedureId]);if(sources.has(key))fail('MATERIAL_SOURCE_ALREADY_COMMITTED');
   const definition=definitions[d.catalogId];if(!definition||definition.id!==d.catalogId||!definition.name)fail('MATERIAL_CATALOG_NOT_AUTHORIZED');
   const next=new Map(items);const added=[];
   for(let n=0;n<d.quantity;n++){const id=`material:${c.generation}:${d.attemptId}:${n+1}`;if(next.has(id)||consumed.has(id))fail('MATERIAL_INSTANCE_COLLISION');
    const item=freeze({instanceId:id,catalogId:d.catalogId,quantity:1,speciesId:d.speciesId,birthSequence:d.birthSequence,lifeId:d.lifeId,procedureId:d.procedureId,provenance:{kind:'AUTHENTIC_NEW_EXTRACTION',generation:c.generation,lifeId:d.lifeId,speciesId:d.speciesId,procedureId:d.procedureId,difficulty:d.difficulty,attemptId:d.attemptId,roomId:d.roomId}});next.set(id,item);added.push(item);
   }
   const cap=Object.freeze({});plans.set(cap,{kind:'EXTRACTION',source,key,context:c,revision,next,added,status:'PREPARED'});return cap;
  },
  commitExtraction(cap){const p=plan(cap,'EXTRACTION');const d=resolveExtraction(p.source);if(!d.current()||!same(p.context,context()))fail('MATERIAL_SOURCE_STALE');
   p.before={items,sources,bound,revision};items=p.next;sources=new Set(sources).add(p.key);bound=p.context;revision++;p.status='COMMITTED';return freeze(p.added.slice());},
  finalizeExtraction(cap){const p=plans.get(cap);if(!p||p.kind!=='EXTRACTION'||p.status!=='COMMITTED'||revision!==p.before.revision+1)fail('MATERIAL_FINALIZATION_STATE');p.status='FINALIZED';},
  rollbackExtraction(cap){const p=plans.get(cap);if(!p||p.kind!=='EXTRACTION')fail('MATERIAL_PLAN_NOT_AUTHENTIC');if(p.status==='PREPARED'){p.status='ROLLED_BACK';return;}
   if(p.status!=='COMMITTED'||revision!==p.before.revision+1)fail('MATERIAL_ROLLBACK_STALE');({items,sources,bound,revision}=p.before);p.status='ROLLED_BACK';},
  prepareConsumption(auth){if(typeof resolveConsumption!=='function')fail('P3_MATERIAL_CONSUMPTION_AUTHORITY_NOT_INSTALLED');
   const c=context(),d=resolveConsumption(auth);if(!d?.current()||d.actor!==c.actor||d.generation!==c.generation||!allowedPurpose(d.purpose)||d.active!==true||usedConsumption.has(auth))fail('MATERIAL_CONSUMPTION_SCOPE');
   if(!Array.isArray(d.instanceIds)||!d.instanceIds.length||new Set(d.instanceIds).size!==d.instanceIds.length)fail('MATERIAL_CONSUMPTION_IDS');
   const next=new Map(items),selected=[];for(const id of d.instanceIds){const item=next.get(id);if(!item||consumed.has(id))fail('MATERIAL_NOT_OWNED');selected.push(item);next.delete(id);}
   const cap=Object.freeze({});plans.set(cap,{kind:'CONSUMPTION',auth,context:c,revision,next,selected,status:'PREPARED'});return cap;
  },
  commitConsumption(cap){const p=plan(cap,'CONSUMPTION'),d=resolveConsumption(p.auth);if(!d.current()||d.active!==true||d.actor!==p.context.actor||d.generation!==p.context.generation||!allowedPurpose(d.purpose)||JSON.stringify(d.instanceIds)!==JSON.stringify(p.selected.map(i=>i.instanceId))||usedConsumption.has(p.auth))fail('MATERIAL_CONSUMPTION_STALE');
   p.before={items,consumed,revision};
   items=p.next;consumed=new Set([...consumed,...p.selected.map(i=>i.instanceId)]);usedConsumption.add(p.auth);revision++;p.status='COMMITTED';
   const receipt=Object.freeze({}),selected=freeze(p.selected.slice()),quantity=selected.reduce((n,i)=>n+i.quantity,0);
   consumptionProofs.set(receipt,Object.freeze({owner:api,actor:p.context.actor,generation:p.context.generation,purpose:d.purpose,items:selected,quantity,current:()=>{try{return p.status==='FINALIZED'&&same(p.context,context())&&selected.every(i=>consumed.has(i.instanceId));}catch{return false;}}}));
   p.result=Object.freeze({status:'CONSUMPTION_PREPARED_FOR_PUBLICATION',receipt,items:selected,quantity});return p.result;},
  finalizeConsumption(cap){const p=plans.get(cap);if(!p||p.kind!=='CONSUMPTION'||p.status!=='COMMITTED'||revision!==p.before.revision+1||!same(p.context,context()))fail('MATERIAL_CONSUMPTION_FINALIZATION_STATE');p.status='FINALIZED';return Object.freeze({...p.result,status:'CONSUMED'});},
  rollbackConsumption(cap){const p=plans.get(cap);if(!p||p.kind!=='CONSUMPTION')fail('MATERIAL_PLAN_NOT_AUTHENTIC');if(p.status==='PREPARED'){p.status='ROLLED_BACK';return;}
   if(p.status!=='COMMITTED'||revision!==p.before.revision+1)fail('MATERIAL_CONSUMPTION_ROLLBACK_STALE');({items,consumed,revision}=p.before);usedConsumption.delete(p.auth);p.status='ROLLED_BACK';},
  reset(){revision=0;items=new Map();sources=new Set();consumed=new Set();bound=null;plans=new WeakMap();usedConsumption=new WeakSet();},
  inspect(){let available=false;try{context();available=true;}catch{}const visible=available?[...items.values()]:[],counts={};for(const i of visible)counts[i.catalogId]=(counts[i.catalogId]||0)+i.quantity;
   return freeze({version:1,status:available?'READY':'UNAVAILABLE',revision,items:visible.map(i=>({...i,provenance:{...i.provenance}})),counts,totalQuantity:visible.reduce((n,i)=>n+i.quantity,0),consumedInstances:consumed.size,saveConnected:false,consumptionAuthorityInstalled:typeof resolveConsumption==='function'});},
  describe(){const s=api.inspect();if(s.status!=='READY')return 'El inventario de materiales no está disponible.';if(!s.totalQuantity)return 'No llevas materiales extraídos.';
   return ['Materiales que llevas:',...Object.entries(s.counts).map(([id,n])=>`  - ${definitions[id].name} × ${n}`)].join('\n');}
 });owners.add(api);
 bindSemantic(api,{previewConsumption(cap){const p=plan(cap,'CONSUMPTION');return clone({version:1,generation:context().generation,revision:revision+1,items:[...p.next.values()],sources:[...sources],consumed:[...consumed,...p.selected.map(i=>i.instanceId)]});},receipt(d,c){requireRestorePermit(c.permit,c.envelope);const cap=Object.freeze({}),actor=c.context.actor(),generation=c.envelope.domains.Materials.generation,selected=freeze(clone(d.items));consumptionProofs.set(cap,Object.freeze({owner:api,actor,generation,purpose:"QIAO_FIRST_THRESHOLD_MATERIAL_DELIVERY",items:selected,quantity:6,current:()=>bound?.actor===actor&&bound?.generation===generation&&selected.every(i=>consumed.has(i.instanceId))}));return cap;},capture(){context();return clone({version:1,generation:context().generation,revision,items:[...items.values()],sources:[...sources],consumed:[...consumed]});},
 prepare(d,{permit,envelope,context:ctx}){requireRestorePermit(permit,envelope);if(d.version!==1)fail$1('G08_MATERIAL_VERSION');integer(d.generation);integer(d.revision);unique(d.items.map(i=>i.instanceId));unique(d.sources);unique(d.consumed);
  for(const i of d.items){if(!definitions[i.catalogId]||i.quantity!==1||d.consumed.includes(i.instanceId)||i.provenance?.generation!==d.generation||i.provenance?.kind!=='AUTHENTIC_NEW_EXTRACTION'||i.provenance.lifeId!==i.lifeId||i.provenance.speciesId!==i.speciesId||i.provenance.procedureId!==i.procedureId||!d.sources.includes(JSON.stringify([d.generation,i.lifeId,i.speciesId,i.procedureId])))fail$1('G08_MATERIAL_PROVENANCE');}
  const next=new Map(d.items.map(i=>[i.instanceId,freeze(clone(i))]));return {apply(){const old={revision,items,sources,consumed,bound,plans,usedConsumption};revision=d.revision;items=next;sources=new Set(d.sources);consumed=new Set(d.consumed);bound={actor:ctx.actor(),generation:d.generation};plans=new WeakMap();usedConsumption=new WeakSet();return ()=>({revision,items,sources,consumed,bound,plans,usedConsumption}=old);}};
 }});return api;
}

export { createNewMaterialInventory, requireMaterialConsumptionReceipt, requireNewMaterialInventory };
