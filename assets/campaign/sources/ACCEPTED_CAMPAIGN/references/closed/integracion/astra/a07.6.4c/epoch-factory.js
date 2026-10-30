import { createSocialMoveProducer } from '../a07/social-move-producer.js';
import './data.js';
import { fail } from '../a07/safe-data.js';

let ordinal=0;
function nextEpochOrdinal(value){if(!Number.isSafeInteger(value)||value<0||value>=Number.MAX_SAFE_INTEGER)fail('A0764C_EPOCH_EXHAUSTED');return value+1;}
/** Allocation can only accompany successful construction of a closed producer. */
function createFreshEpochProducer(options){
 const next=nextEpochOrdinal(ordinal),producer=createSocialMoveProducer({...options,epoch:'A0764S:'+next});
 ordinal=next;return producer;
}

export { createFreshEpochProducer, nextEpochOrdinal };
