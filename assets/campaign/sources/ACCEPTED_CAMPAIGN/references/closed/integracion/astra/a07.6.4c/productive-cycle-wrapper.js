import { PILOT } from './data.js';
import { copy, freeze } from '../a07/safe-data.js';

/** One closed cycle/scheduler; controllerDecision is retained separately from orchestration. */
function createProductiveCycleWrapper({cycle,authority,npcRuntime,policy,actions}){
 let disposed=false;
 return Object.freeze({
  tick(runtime,input){
   const out=cycle.tick(runtime,input);if(out.status!=='CYCLE_COMPLETE')return out;
   const decisions=out.decisions.map(row=>{
    const brain=row.decision;
    if(!PILOT.includes(brain.actorId)||brain.intents.some(i=>i.status==='READY')||brain.status!=='DEFERRED')return row;
    const candidate=policy.candidate(authority.facts(brain.actorId));
    if(candidate.status!=='CANDIDATE')return row;
    const current=authority.runtimePort.capture();
    const frame=npcRuntime.capture(current.runtime,brain.actorId,{revision:current.revision,permissions:null,gateStates:{}});
    const validation=actions.prepare(candidate.intent,frame);
    if(validation.status!=='READY')return row;
    return {dispatch:row.dispatch,decision:{...brain,brainDecision:brain,origin:'AMBIENT_MOBILITY',status:'PROPOSED',
     intents:[{origin:'AMBIENT_MOBILITY',status:'READY',intent:copy(candidate.intent),validation}],dispatched:false}};
   });
   return freeze({...out,decisions});
  },
  inspect:()=>cycle.inspect(),dispose:()=>{if(!disposed){disposed=true;cycle.dispose();policy.dispose();authority.clear();}}
 });
}

export { createProductiveCycleWrapper };
