(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_BOSS_LIFECYCLE=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {fail,copy,freeze,exact,integer,number}=S;
const KINDS=['ATTACK','ATTACK_RESOURCE','SELF_DEFENSE','RESOURCE_PRESSURE','ADAPTIVE_PREP','PLAN_PREP','PLAN_FINISHER'];
// Transaction participant, not a brain or a source of statistics/effect values.
// Ports are installed by the trusted host; serializable projections are never
// execution, selection, denial, damage or restoration capabilities.
function create({actorId,generation,battleId,phaseHP,slots,readContext,resolveSelection,resolveExecution,resolveImpact,resolveDenial,resolveRestore}){
 for(const x of [actorId,generation,battleId])if(typeof x!=='string'||!x.length)fail('A08_BOSS_IDENTITY');
 if(!Array.isArray(phaseHP)||phaseHP.length!==3||phaseHP.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<=0))fail('A08_BOSS_PHASE_SOURCE');
 if(!Array.isArray(slots)||!slots.length||slots.some(s=>!Number.isInteger(s.phase)||s.phase<1||s.phase>3||typeof s.abilityId!=='string'||!s.abilityId||!KINDS.includes(s.kind))||new Set(slots.map(s=>s.phase+':'+s.abilityId)).size!==slots.length)fail('A08_BOSS_SLOT_SOURCE');
 const hp=copy(phaseHP),catalog=copy(slots),ids={actorId,generation,battleId};let pending=null,busy=false;
 let state={version:1,...ids,phase:1,hp:hp[0],terminal:false,pactReleased:false,pactReleases:0,attemptSequence:0,lastTurn:-1,lastImpactRevision:-1,resolved:0,denied:0,invalidated:0};
 function context(){const c=readContext();if(!c||c.actorId!==actorId||c.generation!==generation||c.battleId!==battleId||c.phase!==state.phase||!Number.isSafeInteger(c.turn)||c.turn<0||c.terminal!==state.terminal)fail('A08_BOSS_CONTEXT_EXPIRED');return c;}
 function scope(p){if(!p||p.actorId!==actorId||p.generation!==generation||p.battleId!==battleId)fail('A08_BOSS_PRIVATE_PROVENANCE');return p;}
 function current(cap){const c=context();if(!pending||pending.cap!==cap||pending.phase!==state.phase||c.turn!==pending.turn)fail('A08_BOSS_STALE_ATTEMPT');return pending;}
 function locked(fn){if(busy)fail('A08_BOSS_REENTRANT');busy=true;try{return fn();}finally{busy=false;}}
 function select(selectionCap){return locked(()=>{const c=context();if(state.terminal||pending)fail('A08_BOSS_PENDING_OR_TERMINAL');const p=scope(resolveSelection?.(selectionCap));const slot=catalog.find(s=>s.phase===state.phase&&s.abilityId===p.abilityId);
  if(!slot||slot.kind!==p.kind||p.phase!==state.phase||p.turn!==c.turn||p.turn<=state.lastTurn)fail('A08_BOSS_SELECTION_SCOPE');
  const sequence=state.attemptSequence+1,cap=Object.freeze({}),actionId=battleId+':'+generation+':'+actorId+':attempt:'+sequence;
  pending={cap,...ids,phase:state.phase,turn:c.turn,sequence,abilityId:slot.abilityId,kind:slot.kind,actionId};state={...state,attemptSequence:sequence,lastTurn:c.turn};return cap;
 });}
 function settle(cap,executionCap){return locked(()=>{const a=current(cap),p=scope(resolveExecution?.(executionCap));
  if(p.status!=='RESOLVED'||p.actionId!==a.actionId||p.abilityId!==a.abilityId||p.kind!==a.kind||p.phase!==a.phase||p.turn!==a.turn||p.resourceModel!=='NONE'||p.qiBefore!==null||p.qiAfter!==null)fail('A08_BOSS_EXECUTION_RECEIPT_REQUIRED');
  const release=state.phase===3&&!state.pactReleased;state={...state,resolved:state.resolved+1,pactReleased:state.pactReleased||release,pactReleases:state.pactReleases+(release?1:0)};pending=null;return freeze({actionId:a.actionId,status:'RESOLVED',pactReleased:release,phase:state.phase,resourceModel:'NONE',qiBefore:null,qiAfter:null});
 });}
 function deny(cap,denialCap){return locked(()=>{const a=current(cap),p=scope(resolveDenial?.(denialCap));if(p.status!=='DENIED'||p.actionId!==a.actionId||p.turn!==a.turn||p.phase!==a.phase)fail('A08_BOSS_DENIAL_RECEIPT_REQUIRED');state={...state,denied:state.denied+1};pending=null;return freeze({actionId:a.actionId,status:'DENIED',pactReleased:false});});}
 function applyImpact(impactCap){return locked(()=>{context();if(state.terminal)fail('A08_BOSS_TERMINAL');const p=resolveImpact?.(impactCap);
  if(!p||p.targetId!==actorId||p.generation!==generation||p.battleId!==battleId||p.phase!==state.phase||p.engineContract!=='NEW_COMBAT_STATS_V0_1'||!Number.isSafeInteger(p.targetRevision)||p.targetRevision<=state.lastImpactRevision)fail('A08_BOSS_PRIVATE_IMPACT_REQUIRED');
  const r=p.result;number(r?.actualHPDamage,'BOSS_ACTUAL_DAMAGE');number(r.hpAfter,'BOSS_HP_AFTER');if(r.actualHPDamage>state.hp||r.hpAfter!==state.hp-r.actualHPDamage)fail('A08_BOSS_IMPACT_DELTA');
  // The physical owner must apply this floor BEFORE publishing its impact.
  // Rejecting a mismatch participates in the owner's rollback transaction.
  if(state.phase===3&&!state.pactReleased&&r.hpAfter<1)fail('A08_BOSS_PACT_PHYSICAL_FLOOR_REQUIRED');
  let phase=state.phase,nextHP=r.hpAfter,terminal=false,invalidated=0;
  if(nextHP===0){if(phase<3){phase++;nextHP=hp[phase-1];if(pending){pending=null;invalidated=1;}}else terminal=true;}
  state={...state,phase,hp:nextHP,terminal,lastImpactRevision:p.targetRevision,invalidated:state.invalidated+invalidated};return freeze({phase,hp:nextHP,terminal,transition:phase!==p.phase,overkillTransferred:0,invalidatedAttempts:invalidated});
 });}
 function validate(raw){const n=copy(raw);exact(n,Object.keys(state));scope(n);if(n.version!==1||!Number.isInteger(n.phase)||n.phase<1||n.phase>3||typeof n.terminal!=='boolean'||typeof n.pactReleased!=='boolean')fail('A08_BOSS_RESTORE_SCHEMA');number(n.hp,'BOSS_RESTORE_HP');
  for(const k of ['pactReleases','attemptSequence','resolved','denied','invalidated'])integer(n[k],'BOSS_'+k);
  if(!Number.isSafeInteger(n.lastTurn)||n.lastTurn< -1||!Number.isSafeInteger(n.lastImpactRevision)||n.lastImpactRevision< -1||n.hp>hp[n.phase-1]||n.terminal!==(n.hp===0)||n.terminal&&n.phase!==3||n.pactReleases!==(n.pactReleased?1:0)||n.pactReleased&&(n.phase!==3||n.resolved<1)||n.phase>1&&n.lastImpactRevision<0||n.terminal&&!n.pactReleased||n.attemptSequence!==n.resolved+n.denied+n.invalidated||n.attemptSequence===0&&n.lastTurn!==-1||n.attemptSequence>0&&n.lastTurn<0)fail('A08_BOSS_RESTORE_CAUSE');return n;
 }
 function snapshot(){if(pending||busy)fail('A08_BOSS_SAVE_PENDING_ATTEMPT');return freeze(copy(state));}
 function restore(cap){return locked(()=>{if(pending)fail('A08_BOSS_RESTORE_PENDING_ATTEMPT');const n=validate(resolveRestore?.(cap));if(n.attemptSequence<state.attemptSequence||n.lastImpactRevision<state.lastImpactRevision||n.phase<state.phase||state.pactReleased&&!n.pactReleased)fail('A08_BOSS_RESTORE_ROLLBACK');state=n;});}
 return Object.freeze({select,settle,deny,applyImpact,snapshot,restore,inspectAttempt:cap=>freeze(copy((({cap,...rest})=>rest)(current(cap)))),physicalBoundary:()=>freeze({phase:state.phase,currentHP:state.hp,minimumHP:state.phase===3&&!state.pactReleased?1:0,terminal:state.terminal,resourceModel:'NONE',qiCurrent:null,qiMax:null}),checkpoint(){if(busy)fail('A08_BOSS_REENTRANT');const before=copy(state),attempt=pending;return()=>{if(state.attemptSequence!==before.attemptSequence||state.resolved!==before.resolved||state.denied!==before.denied)fail('A08_BOSS_CHECKPOINT_ACTION_BOUNDARY');state=before;pending=attempt;};}});
}
return Object.freeze({create,KINDS:Object.freeze(KINDS)});
});
