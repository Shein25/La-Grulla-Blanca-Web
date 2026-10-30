(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_ECONOMY=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {fail,copy,freeze}=S;
function createServiceDomain({offers,resolveContext,prepareTransaction,resolveWorldChain}){const tickets=new WeakMap();
 function evaluate(itemId,contextCap){const o=offers[itemId];if(!o)fail('A08_UNKNOWN_SERVICE');const c=resolveContext(contextCap);if(!c||c.npcId!==o.npc_id||!c.copresent||!c.authorized)fail('A08_A07_SERVICE_PERMISSION');
  if(typeof c.actorId!=='string'||typeof c.generation!=='string'||!Number.isSafeInteger(c.revision)||c.revision<0||!Number.isInteger(c.stageIndex)||c.stageIndex<0||c.stageIndex>3||!Number.isSafeInteger(c.stones)||c.stones<0||!Number.isSafeInteger(c.contribution)||c.contribution<0||!Array.isArray(c.completedMissions)||!Array.isArray(c.permissions)||!c.materialCounts)fail('A08_SERVICE_TYPED_CONTEXT_REQUIRED');
  if(c.stageIndex<['LianQi_I','LianQi_II','LianQi_III','LianQi_IV'].indexOf(o.required_stage))fail('A08_SERVICE_STAGE');
  if(!c.completedMissions.includes(o.source_mission)||(o.required_permission!==null&&!c.permissions.includes(o.required_permission))||c.contribution<o.contribution_minimum)fail('A08_SERVICE_GATES');
  const chain=resolveWorldChain(itemId,c);if(!chain?.nativeValidated||!chain.fauna||!chain.materials||!chain.save)fail('BLOCKED_WORLD_CHAIN');
  if(c.stones<o.stone_service_fee)fail('A08_SERVICE_STONES');for(const [id,n]of Object.entries(o.materials))if((c.materialCounts[id]||0)<n)fail('A08_SERVICE_MATERIALS');
  const ticket=Object.freeze({});tickets.set(ticket,{itemId,contextCap,revision:c.revision,actorId:c.actorId,generation:c.generation,used:false});return ticket;
 }
 function confirm(ticket){const t=tickets.get(ticket);if(!t||t.used)fail('A08_STALE_SERVICE_SELECTION');const fresh=evaluate(t.itemId,t.contextCap),f=tickets.get(fresh),c=resolveContext(t.contextCap);
  if(c.revision!==t.revision||c.actorId!==t.actorId||c.generation!==t.generation)fail('A08_SERVICE_CONTEXT_CHANGED');
  const prepared=prepareTransaction(freeze({itemId:t.itemId,offer:copy(offers[t.itemId]),context:copy(c)}));if(!prepared||typeof prepared.commit!=='function')fail('A08_SERVICE_ATOMIC_PORT_REQUIRED');
  if(typeof prepared.rollback!=='function'||typeof prepared.finalize!=='function')fail('A08_SERVICE_ATOMIC_PORT_REQUIRED');let published=false;try{const result=prepared.commit();if(!result?.nativeReceipt)fail('A08_SERVICE_RECEIPT_REQUIRED');const final=prepared.finalize(result);if(final?.published!==true)fail('A08_SERVICE_PUBLICATION_REQUIRED');published=true;t.used=true;return final;}catch(e){if(!published&&prepared.isPublished?.()!==true)prepared.rollback();throw e;}
 }
 return Object.freeze({evaluate,confirm,inspect:()=>freeze({offers:Object.keys(offers).length,mode:'MATERIAL_SERVICE_ONLY',contributionSpent:false})});
}
return Object.freeze({createServiceDomain});
});
