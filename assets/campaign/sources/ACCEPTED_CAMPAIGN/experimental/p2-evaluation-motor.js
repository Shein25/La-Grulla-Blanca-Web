import { EVALUATION_BANK } from './p2-evaluation-bank.js';

const fail=c=>{throw Error(c);};
function createEvaluationMotor({read}){
 const attempts=new WeakMap(),actions=new WeakMap(),consumed=new WeakSet();let active=null;
 function valid(token){const a=attempts.get(token),c=read();if(!a||active!==token||!c||a.actor!==c.actor||a.generation!==c.generation||a.stamp!==c.stamp)fail('P2_MOTOR_STALE_ATTEMPT');return a;}
 return Object.freeze({
  begin(){const c=read();if(!c)fail('P2_MOTOR_CONTEXT');const token=Object.freeze({});attempts.set(token,c);active=token;return token;},
  resolve(token,stepId,actionId){const a=valid(token),step=EVALUATION_BANK.steps.find(s=>s.id===stepId);if(!step||!step.options.some(o=>o.id===actionId))fail('P2_MOTOR_ACTION_NOT_AUTHORIZED');
   if(actionId!==step.accepted)return Object.freeze({status:'CORRECTION',text:step.correction});
   // Resolution is a situated native narrative action; no Qi measurement, resource effect or caller success flag.
   const receipt=Object.freeze({});actions.set(receipt,Object.freeze({attempt:token,actor:a.actor,generation:a.generation,stamp:a.stamp,stepId,actionId}));
   return Object.freeze({status:'RESOLVED',receipt,text:step.successFeedback});
  },
  inspect(receipt){const d=actions.get(receipt);if(!d)fail('P2_MOTOR_RECEIPT_NOT_AUTHENTIC');valid(d.attempt);return d;},
  available(receipt){if(consumed.has(receipt))fail('P2_MOTOR_RECEIPT_REPLAY');return this.inspect(receipt);},
  consume(receipt){this.available(receipt);consumed.add(receipt);},
  consumeCommitted(receipt){const d=actions.get(receipt);if(!d||d.attempt!==active||consumed.has(receipt))fail('P2_COMMITTED_RECEIPT_INVALID');consumed.add(receipt);},
  cancel(){active=null;}
 });
}

export { createEvaluationMotor };
