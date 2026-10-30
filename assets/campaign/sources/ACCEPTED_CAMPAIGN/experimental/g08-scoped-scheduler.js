import { requireRestorePermit, clone } from './g08-semantic.js';
import { createSchedulerState, EVENT_KINDS, tickScheduler } from '../references/closed/integracion/astra/a07/vendor/experimentos/npc/scheduler/npc-lifecycle-v0.1/scheduler.js';
import { registrations } from '../references/closed/integracion/astra/a07/registry.js';
import { fail, copy, exact, source, freeze } from '../references/closed/integracion/astra/a07/safe-data.js';

const safe=x=>{if(!Number.isSafeInteger(x)||x<0)fail('A07_SCHEDULER_TURN');return x;};
function mergeReason(row,reason){
 const prior=row.pendingReasons.find(r=>r.kind===reason.kind);
 if(prior){const count=prior.count+reason.count;if(!Number.isSafeInteger(count))fail('A07_EVENT_COUNT_OVERFLOW');prior.count=count;prior.firstTurn=Math.min(prior.firstTurn,reason.firstTurn);prior.lastTurn=Math.max(prior.lastTurn,reason.lastTurn);}
 else row.pendingReasons.push({...reason});
}
function createScopedScheduler(configurations){
 const owned=new WeakSet(),configs=copy(configurations);
 if(configs.length!==32)fail('A07_SCHEDULER_ACTORS');
 for(const c of configs){exact(c,['config','source']);source(c.source);}
 const seed=createSchedulerState(configs.map(c=>c.config));
 if(seed.npcs.some(n=>!registrations().some(r=>r.actorId===n.id)))fail('A07_SCHEDULER_ACTORS');
 function own(x){freeze(x);owned.add(x);return x;}
 const initial=own({clock:null,rows:seed.npcs.map(row=>({clock:null,row})),queued:[]});
 function advance(state,turn,activeIds,events=[],maxDispatches=32){
  if(!owned.has(state))fail('A07_FOREIGN_SCHEDULER_STATE');safe(turn);
  if(state.clock!==null&&turn<=state.clock)fail('A07_SCHEDULER_MONOTONIC');
  if(!Number.isSafeInteger(maxDispatches)||maxDispatches<1||maxDispatches>32)fail('A07_DISPATCH_BOUND');
  const ids=copy(activeIds),captured=copy(events),known=new Set(seed.npcs.map(n=>n.id));
  if(ids.length>32||new Set(ids).size!==ids.length||ids.some(id=>!known.has(id))||captured.length>128)fail('A07_EVENT_BOUND');
  for(const e of captured){exact(e,['npcId','kind']);if(!known.has(e.npcId)||!EVENT_KINDS.includes(e.kind))fail('A07_SCHEDULER_EVENT');}
  const active=new Set(ids),next={clock:turn,rows:state.rows.map(s=>({clock:s.clock,row:structuredClone(s.row)})),queued:state.queued.map(q=>({...q}))};
  for(const event of captured.filter(e=>!active.has(e.npcId))){
   let q=next.queued.find(q=>q.npcId===event.npcId&&q.kind===event.kind);
   if(q){if(!Number.isSafeInteger(q.count+1))fail('A07_EVENT_COUNT_OVERFLOW');q.count++;q.lastTurn=turn;}
   else next.queued.push({npcId:event.npcId,kind:event.kind,firstTurn:turn,lastTurn:turn,count:1});
  }
  const activeRows=next.rows.filter(s=>active.has(s.row.id));let reconciliationCalls=0;
  for(const slot of activeRows){
   if(turn>0&&(slot.clock===null||slot.clock<turn-1)){
    // Closed arithmetic catch-up up to the preceding turn. Its dispatch is a
    // candidate: retain the pending reasons and original dispatch time.
    const last=slot.row.lastDispatchTurn,result=tickScheduler({version:1,clock:slot.clock,npcs:[slot.row]},turn-1,[],{maxDispatches:1});
    slot.row=result.state.npcs[0];if(result.dispatches.length){slot.row.pendingReasons=result.dispatches[0].reasons;slot.row.lastDispatchTurn=last;}
    slot.clock=turn-1;reconciliationCalls++;
   }
   for(const q of next.queued.filter(q=>q.npcId===slot.row.id))mergeReason(slot.row,{kind:q.kind,firstTurn:q.firstTurn,lastTurn:q.lastTurn,count:q.count});
  }
  next.queued=next.queued.filter(q=>!active.has(q.npcId));
  let scheduled={dispatches:[],eligibleCount:0,deferredCount:0,status:'DISPATCH_COMPLETE'};
  if(activeRows.length){
   scheduled=tickScheduler({version:1,clock:turn===0?null:turn-1,npcs:activeRows.map(s=>s.row)},turn,captured.filter(e=>active.has(e.npcId)),{maxDispatches});
   for(const row of scheduled.state.npcs){const slot=next.rows.find(s=>s.row.id===row.id);slot.row=row;slot.clock=turn;}
  }
  return freeze({status:scheduled.status,state:own(next),dispatches:scheduled.dispatches,eligibleCount:scheduled.eligibleCount,deferredCount:scheduled.deferredCount,
   work:{scheduledActors:activeRows.length,reconciliationCalls,dispatchCalls:activeRows.length?1:0,dormantScheduledActors:0,queuedKinds:next.queued.length}});
 }
 return Object.freeze({initialState:()=>initial,advance,restoreSemantic(d,c){requireRestorePermit(c.permit,c.envelope);const x=clone(d);exact(x,['clock','rows','queued']);if(x.rows.length!==32||new Set(x.rows.map(s=>s.row.id)).size!==32||x.rows.some(s=>!seed.npcs.some(n=>n.id===s.row.id))||x.queued.length>128)throw Error('G08_SCHEDULER_SCOPE');if(x.clock!==null){safe(x.clock);if(x.clock>c.envelope.domains.World.turnoGlobal)throw Error('G08_SCHEDULER_FUTURE');}return own(x);}});
}

export { createScopedScheduler };
