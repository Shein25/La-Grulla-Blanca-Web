(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_CONCORDANCES=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {fail,copy,freeze}=S;
function createEchoDomain({routes,resolveAction,resolveOperation,actorId=null,combatId=null}){const slots=new Map(),actions=new Set();
 function select(origin,destination,role,receiver){const row=routes.find(r=>r.origin===origin&&r.destination===destination);if(!row||!row.roles[role])return freeze({status:'NO_RELATION'});
  if(!receiver||!Array.isArray(receiver.concordance_hooks)||receiver.verifiedPurchased!==true)return freeze({status:'DENIED_RECEIVER_AUTHORITY'});
  for(const p of [...row.roles[role]].sort((a,b)=>a.priority-b.priority)){if(p.ambiguous&&receiver.concordance_hooks.some(x=>[p.hook,...String(p.qualifier||'').matchAll(/[A-Z][A-Z_]+/g)].flatMap(v=>Array.isArray(v)?[v[0]]:[v]).includes(x)))return freeze({status:'DENIED_AMBIGUOUS_HOOK'});
   if(receiver.concordance_hooks.includes(p.hook))return freeze({status:p.ambiguous?'DENIED_AMBIGUOUS_HOOK':'SELECTED_NO_NATIVE_EFFECT',origin,destination,role,hook:p.hook,priority:p.priority,numericScale:null});}
  return freeze({status:'NO_DECLARED_RECEIVER'});
 }
 function observe(cap){const a=resolveAction(cap);if(!a||a.status!=='RESOLVED'||!a.nativePaid||!a.pure||a.ultimate||a.hybrid||!a.realized)fail('A08_ECHO_ACTION_NOT_AUTHENTIC');if(typeof a.actorId!=='string'||!a.actorId||a.actionId===undefined||actorId!==null&&a.actorId!==actorId||combatId!==null&&a.combatId!==combatId)fail('R51_ECHO_OWNER_SCOPE');const actionKey=JSON.stringify([a.actorId,a.combatId??null,a.actionId]);if(actions.has(actionKey))fail('A08_ECHO_REPLAY');
  // The creator must be an actual technique action. Formation and Ultis cannot mint Echo.
  if(a.kind==='FORMATION'||a.kind!=='TECHNIQUE')fail('A08_ECHO_SOURCE_KIND');
  const old=slots.get(a.actorId),selection=old?select(old.element,a.element,a.role,a.receiver):freeze({status:'NO_PRIOR_ECHO'});
  const operation=selection.status==='SELECTED_NO_NATIVE_EFFECT'?resolveOperation?.(cap,selection):null;
  if(operation){if(operation.authority!=='V290_VERIFIED_NATIVE_STRUCTURAL_OPERATION'||operation.numericConcordanceBonus!==false)fail('A08_NUMERIC_CONCORDANCE_FORBIDDEN');
   const result=operation.commit();if(!result?.resolved||!result.realPhysicalDelta)fail('A08_ECHO_ZERO_DELTA');slots.delete(a.actorId);actions.add(actionKey);return freeze({status:'STRUCTURAL_RESOLVED',selection,echoConsumed:true,concordanceApplied:true,physicalDelta:copy(result.delta)});}
  actions.add(actionKey);
  // V290 commit_from_combat replaces the slot after a valid resolved creator,
  // even when no native structural receiver exists. Replacement is not a
  // concordance consumption and cannot manufacture a mechanical bonus.
  slots.set(a.actorId,{element:a.element,actionId:a.actionId});return freeze({status:'ECHO_CREATED',selection,echoConsumed:false,concordanceApplied:false});
 }
 return Object.freeze({serializeCombat(){return freeze({version:1,owner:'concordances',state:{slots:copy([...slots])},seen:[...actions]});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'concordances');slots.clear();actions.clear();for(const[k,v]of raw.state.slots)slots.set(k,copy(v));for(const id of raw.seen)actions.add(id);},select,observe,checkpoint(){const previousSlots=[...slots].map(([k,v])=>[k,copy(v)]),previousActions=[...actions];return()=>{slots.clear();actions.clear();for(const [k,v]of previousSlots)slots.set(k,v);for(const id of previousActions)actions.add(id);};},inspect:()=>freeze({numericScale:null,slots:copy(Object.fromEntries(slots)),actionCount:actions.size}),endCombat(){slots.clear();actions.clear();}});
}
return Object.freeze({createEchoDomain});
});
