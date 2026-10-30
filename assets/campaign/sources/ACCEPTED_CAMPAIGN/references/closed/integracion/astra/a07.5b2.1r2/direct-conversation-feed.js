import { B2_NATIVE_CONTRACT, classifyNativeMissionResult } from '../a07.5b2/safe-player-dialogue-adapter.js';
import { registration } from '../a07/registry.js';
import { copy, exact, fail, text, freeze, source } from '../a07/safe-data.js';
import { B21R2_AUTHORITY } from './public-bindings.js';

/** HUMAN meaning binding; current canonical absence must still come from the host. */
function conversationRequest(raw){
 const r=copy(raw);exact(r,['command','npcId','eventId','contextRevision'],['seed']);
 if(r.command!=='HABLAR')fail('B21R2_HABLAR_ONLY');registration(text(r.npcId));text(r.eventId);text(r.contextRevision);
 const seed=r.seed??0;if(!Number.isSafeInteger(seed)||seed<0||seed>3)fail('B21R2_SEED_BOUND');
 return freeze({...r,seed});
}
function createDirectConversationFeed(options={}){
 exact(options,[],['entrypointPort']);
 const port=options.entrypointPort??null;
 if(port){exact(port,['revalidate']);if(typeof port.revalidate!=='function')fail('B21R2_ENTRYPOINT_PORT');}
 const check=port?.revalidate.bind(port);let busy=false;
 function capture(raw){
  const r=conversationRequest(raw),no=(reason,status='DEFER')=>freeze({status,reason,motivation:null});
  if(!check)return no('ENTRYPOINT_AUTHORITY_UNAVAILABLE');if(busy)return no('B21R2_ENTRYPOINT_REENTRANT');busy=true;
  try{
   const request=freeze({command:'HABLAR',npcId:r.npcId,recipientId:'player',eventId:r.eventId,contextRevision:r.contextRevision}),receipt=copy(check(request));
   if(receipt===null)return no('ENTRYPOINT_AUTHORITY_UNAVAILABLE');
   if(['STALE','UNAVAILABLE'].includes(receipt.status)){exact(receipt,['status'],['reason']);return no(receipt.status==='STALE'?'CANONICAL_CONTEXT_STALE':'ENTRYPOINT_AUTHORITY_UNAVAILABLE');}
   exact(receipt,['status','npcId','recipientId','eventId','contextRevision','nativeMissionResult','source']);source(receipt.source);
   if(['npcId','recipientId','eventId','contextRevision'].some(k=>receipt[k]!==request[k]))return no('CANONICAL_SCOPE_CHANGED');
   if(['path','sha256','locator'].some(k=>receipt.source[k]!==B2_NATIVE_CONTRACT[k]))return no('NATIVE_CONTRACT_NOT_AUDITED');
   const result=classifyNativeMissionResult(receipt.nativeMissionResult);
   if(receipt.status==='CANONICAL_HANDLED'&&result==='MISSION_HANDLED')return no('CANONICAL_PRIORITY','CANONICAL_HANDLED');
   if(receipt.status!=='NO_CANONICAL_INTERACTION'||result!=='MISSION_NOT_HANDLED')return no('NO_CANONICAL_INTERACTION_NOT_VERIFIED');
   return freeze({status:'AVAILABLE',reason:null,motivation:{kind:'DIRECT_REQUEST_CONVERSATION',actorId:r.npcId,recipientId:'player',eventId:r.eventId,contextRevision:r.contextRevision,
    allowedFunctions:['SELF_INTRODUCTION'],topic:null,questionContext:null,sourceFact:copy(receipt.source),humanBinding:copy(B21R2_AUTHORITY)}});
  }catch{return no('ENTRYPOINT_RECEIPT_NOT_VERIFIED');}finally{busy=false;}
 }
 return Object.freeze({capture,capabilities:()=>freeze({phase:'A07.5B2.1R2',functions:['SELF_INTRODUCTION'],canonicalReceiptProducer:false,topicProducer:false,questionProducer:false,persistence:false,history:0,timers:0})});
}

export { conversationRequest, createDirectConversationFeed };
