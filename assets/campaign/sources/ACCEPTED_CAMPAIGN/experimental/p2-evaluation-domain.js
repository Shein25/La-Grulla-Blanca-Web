import { bindSemantic, requireRestorePermit, canonical, fail as fail$1, clone } from './g08-semantic.js';
import { EVALUATION_BANK } from './p2-evaluation-bank.js';
import { requireVerifiedPractice } from './m03-foundation-domain-p2.js';

const fail=c=>{throw Error(c);},proofs=new WeakMap();
function requireEvaluationProof(cap){const d=proofs.get(cap);if(!d||!d.current())fail('P2_PRIVATE_EVALUATION_REQUIRED');return d;}
function createEvaluationDomain({read,motor,commit}){
 let lease=null,completed=null,busy=false;const commits=new WeakMap();
 const stats={attempts:0,corrections:0,evaluationCommits:0};const inc=k=>stats[k]=Math.min(1000000,stats[k]+1);
 function idle(){if(busy)fail('P2_REENTRANCY');}
 function context(){const c=read();if(!c)fail('P2_DOMAIN_CONTEXT');const p=requireVerifiedPractice(c.practiceProof);if(p.actor!==c.actor||p.generation!==c.generation)fail('P2_PRACTICE_SCOPE');return c;}
 const api=Object.freeze({
  begin(){idle();if(lease)fail('P2_ATTEMPT_ALREADY_ACTIVE');const c=context();if(completed)fail('P2_ALREADY_COMPLETED');motor.cancel();lease={context:c,attempt:motor.begin(),stage:0,evidence:[]};inc('attempts');},
  step(){if(!lease)return null;context();return EVALUATION_BANK.steps[lease.stage];},
  attempt(){if(!lease)fail('P2_NO_ATTEMPT');return lease.attempt;},
  accept(receipt){idle();if(!lease)fail('P2_NO_ATTEMPT');const c=context(),l=lease,d=motor.available(receipt),step=EVALUATION_BANK.steps[l.stage];
   if(l.context.actor!==c.actor||l.context.generation!==c.generation||l.context.stamp!==c.stamp||d.attempt!==l.attempt||d.stepId!==step.id||d.actionId!==step.accepted)fail('P2_ACTION_SCOPE');
   if(l.stage<2){motor.consume(receipt);l.evidence.push(receipt);l.stage++;return 'CONTINUE';}
   const cap=Object.freeze({}),records=l.evidence.concat(receipt);commits.set(cap,{context:c,lease:l,records});
   const old=completed,record=Object.freeze({actor:c.actor,generation:c.generation,actions:records.map(r=>{const e=motor.inspect(r);return {stepId:e.stepId,actionId:e.actionId};})});
   busy=true;try{commit(cap,api.inspectCommit,{publish(){completed=record;},rollback(){completed=old;}});}finally{busy=false;}
   motor.consumeCommitted(receipt);lease=null;motor.cancel();inc('evaluationCommits');return 'COMPLETED';
  },
  inspectCommit(cap){const d=commits.get(cap),c=context();if(!d||lease!==d.lease||d.context.actor!==c.actor||d.context.generation!==c.generation||d.context.stamp!==c.stamp||d.records.length!==3)fail('P2_COMPLETION_RECEIPT_NOT_AUTHENTIC');
   d.records.forEach((r,i)=>{const a=motor.inspect(r);if(a.attempt!==d.lease.attempt||a.stepId!==EVALUATION_BANK.steps[i].id||a.actionId!==EVALUATION_BANK.steps[i].accepted)fail('P2_INCOMPLETE_ACTION_EVIDENCE');});return d;
  },
  correction(){inc('corrections');},
  cancel(){idle();lease=null;motor.cancel();},
  proof(actor,generation){if(!completed||completed.actor!==actor||completed.generation!==generation)fail('P2_PRIVATE_EVALUATION_REQUIRED');const record=completed,cap=Object.freeze({});proofs.set(cap,Object.freeze({actor,generation,current:()=>completed===record}));return cap;},
  reset(){idle();lease=null;completed=null;motor.cancel();for(const k of Object.keys(stats))stats[k]=0;},
  inspect:()=>Object.freeze({...stats,stage:lease?EVALUATION_BANK.steps[lease.stage].id:null,evidenceCount:lease?lease.evidence.length:0,completed:!!completed,active:!!lease,history:0,persistence:false,timers:0})
 });
 bindSemantic(api,{capture(){return clone({version:1,completed:completed?{generation:completed.generation,actions:completed.actions}:null});},prepare(d,{permit,envelope,context:ctx}){requireRestorePermit(permit,envelope);if(d.version!==1||d.completed&&canonical(d.completed.actions)!==canonical(EVALUATION_BANK.steps.map(s=>({stepId:s.id,actionId:s.accepted}))))fail$1('G08_P2_EVIDENCE');
 return {apply(){const old={completed,lease,busy};completed=d.completed?Object.freeze({...clone(d.completed),actor:ctx.actor()}):null;lease=null;busy=false;return ()=>({completed,lease,busy}=old);}};}});return api;
}

export { createEvaluationDomain, requireEvaluationProof };
