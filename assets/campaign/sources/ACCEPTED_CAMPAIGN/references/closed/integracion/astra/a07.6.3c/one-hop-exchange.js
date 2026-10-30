import { createReceiptHost } from './receipt-host.js';
import { createReciprocalValidationBridge } from './reciprocal-adapter.js';
import { createAcknowledgeRealizer } from '../a07.6.3/acknowledge-realizer.js';
import { freeze, copy, exact } from '../a07/safe-data.js';

/** Standalone host composition. No scheduler tick, UI or product HTML connection. */
function createOneHopExchange(options){
  const host=createReceiptHost(options),recipient=createReciprocalValidationBridge({receiptHost:host});
  const realizer=createAcknowledgeRealizer({validationBridge:recipient});
  return Object.freeze({
    prepareRoot:host.prepareRoot,realizeRoot:host.realizeRoot,receiptFor:host.receiptFor,
    evaluateRecipient:recipient.prepare,checkReciprocal:recipient.check,
    realizeReciprocal:(intent,raw)=>{
      try{const request=copy(raw);exact(request,['revision']);return realizer.realize({intent,revision:request.revision});}
      catch{return freeze({status:'NO_UTTERANCE',reason:'A0763C_INVALID_REALIZATION_REQUEST',utterance:null});}
    },
    invalidate:recipient.invalidate,
    dispose:()=>{recipient.dispose();realizer.dispose();},
    inspect:()=>freeze({phase:'A07.6.3C',receiptHost:host.inspect(),recipient:recipient.inspect(),
      reciprocalRealizer:realizer.inspect(),maxHop:1,maxDepth:2,history:0,backlog:0,timers:0,uiWrites:false,persistence:false})
  });
}

export { createOneHopExchange };
