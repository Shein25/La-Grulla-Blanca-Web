import { freeze, exact, fail, text, copy, source } from '../a07/safe-data.js';
import { VOICES_R4 } from '../a07.5b1/voice-catalog-r4.js';
import { createNpcPlayerVoiceRealizerR4_1 } from '../../../../../experimental/voice-realizer-r4-1-b14.js';

/** B2 consumer boundary. No native entrypoint, factual producer or new voice engine. */
const B2_LIMITS=freeze({responsesPerCall:1,maxText:240,claims:2,semanticRelations:1,history:0,retainedTraces:0,timers:0});
const B2_NATIVE_CONTRACT=freeze({path:'grulla-blanca_ver76.html',sha256:'b41c12431f076790b2e2fb0e9e485fb35d3b8c7a834d7b1222e9105518eb270a',locator:'cmd_hablar/gestionarMisionesNpc/dialogo'});
// These are technical classifications, not a grant that an arbitrary empty string
// proves the absence of every canonical interaction in a productive host.
function classifyNativeMissionResult(value){
 return typeof value!=='string'?'UNVERIFIED':value===''?'MISSION_NOT_HANDLED':'MISSION_HANDLED';
}
function port(raw,name){exact(raw,['revalidate']);if(typeof raw.revalidate!=='function')fail(name);return raw.revalidate.bind(raw);}
function createSafePlayerDialogueAdapter(options={}){
 exact(options,[],['entrypointPort','validationPort']);
 const check=options.entrypointPort==null?null:port(options.entrypointPort,'A075B2_ENTRYPOINT_PORT');
 const realizer=options.validationPort==null?null:createNpcPlayerVoiceRealizerR4_1({validationPort:options.validationPort});
 let busy=false;
 function respond(raw){
  if(busy)fail('A075B2_REENTRANT');busy=true;
  try{
   exact(raw,['command','npcId'],['eventId','contextRevision','realizerInput']);
   if(raw.command!=='HABLAR')fail('A075B2_HABLAR_ONLY');
   const npcId=text(raw.npcId),voice=VOICES_R4.find(v=>v.actorId===npcId);if(!voice)fail('A075B2_CANONICAL_NPC_REQUIRED');
   const no=(reason,decision='DEFER')=>freeze({handled:false,text:null,deferReason:reason,trace:{npcId,command:'HABLAR',canonicalDecision:decision,realizerVersion:'A075B1-R4.1',realized:false}});
   if(!check)return no('ENTRYPOINT_AUTHORITY_UNAVAILABLE');
   if(!raw.eventId||!raw.contextRevision)return no('CURRENT_EVENT_CONTEXT_UNAVAILABLE');
   const eventId=text(raw.eventId),contextRevision=text(raw.contextRevision),request=freeze({command:'HABLAR',npcId,recipientId:'player',eventId,contextRevision});
   function route(){
    try{
    const receipt=copy(check(request));
    if(receipt===null)return {allowed:false,reason:'ENTRYPOINT_AUTHORITY_UNAVAILABLE'};
    if(['UNAVAILABLE','STALE'].includes(receipt.status)){exact(receipt,['status'],['reason']);return {allowed:false,reason:receipt.status==='STALE'?'CANONICAL_CONTEXT_STALE':'ENTRYPOINT_AUTHORITY_UNAVAILABLE'};}
    exact(receipt,['status','npcId','recipientId','eventId','contextRevision','nativeMissionResult','source']);source(receipt.source);
    if(receipt.npcId!==npcId||receipt.recipientId!=='player'||receipt.eventId!==eventId||receipt.contextRevision!==contextRevision)return {allowed:false,reason:'CANONICAL_SCOPE_CHANGED'};
    if(['path','sha256','locator'].some(k=>receipt.source[k]!==B2_NATIVE_CONTRACT[k]))return {allowed:false,reason:'NATIVE_CONTRACT_NOT_AUDITED'};
    const classified=classifyNativeMissionResult(receipt.nativeMissionResult);
    if(receipt.status==='CANONICAL_HANDLED'&&classified==='MISSION_HANDLED')return {allowed:false,reason:'CANONICAL_PRIORITY',decision:'CANONICAL_HANDLED'};
    if(receipt.status!=='NO_CANONICAL_INTERACTION'||classified!=='MISSION_NOT_HANDLED')return {allowed:false,reason:'NO_CANONICAL_INTERACTION_NOT_VERIFIED'};
    // Only a trusted current host may issue this broader route classification.
    // B2 supplies its consumer contract, NOT a producer from missions/global flags.
    return {allowed:true};
    }catch{return {allowed:false,reason:'ENTRYPOINT_RECEIPT_NOT_VERIFIED'};}
   }
   const first=route();if(!first.allowed)return no(first.reason,first.decision);
   if(!realizer)return no('A075B1_SCOPED_CONTENT_VALIDATION_PORT_UNAVAILABLE');
   if(!raw.realizerInput)return no('VERIFIED_INTENT_PAYLOAD_QUESTION_UNAVAILABLE');
   exact(raw.realizerInput,['intent','contentPayload','contextRevision'],['seed']);
   // Retain the original A07.4 capability object. Cloning it is not an authorization.
   const i=raw.realizerInput.intent,detached=copy(i);
   if(detached.actorId!==npcId||detached.counterpartId!=='player'||detached.reasonBasis?.eventId!==eventId||detached.guard?.revision!==contextRevision||raw.realizerInput.contextRevision!==contextRevision)return no('REALIZER_SCOPE_CHANGED');
   const input={intent:i,contentPayload:freeze(copy(raw.realizerInput.contentPayload)),contextRevision,...(Object.hasOwn(raw.realizerInput,'seed')?{seed:raw.realizerInput.seed}:{})};
   let realized;try{realized=realizer.realize(input);}catch{return no('FACTUAL_VALIDATION_FAILED');}
   if(realized.status!=='REALIZED')return no(realized.reason??realized.status,realized.status==='DEFER_TO_CANONICAL_DIALOGUE'?'CANONICAL_HANDLED':'DEFER');
   const u=realized.utterance;
   // A source changing the canonical route during factual validation cancels output.
   const final=route();if(!final.allowed)return no(final.reason,final.decision);
   if(u.actorId!==npcId||u.recipientId!=='player'||u.contextRevision!==contextRevision||u.sourceBasis.context.eventId!==eventId) return no('REALIZED_SCOPE_CHANGED');
   return freeze({handled:true,text:u.text,deferReason:null,trace:{npcId,command:'HABLAR',canonicalDecision:'NO_CANONICAL_INTERACTION',realized:true,eventId,contextRevision,intent:u.intentKind,payloadId:u.semanticKey,claims:copy(u.semanticClaims),semanticRelations:copy(u.semanticRelations),speechFrame:u.speechFrame,questionContext:copy(u.questionContext),contentSignature:u.sourceBasis.context.contentSignature,voiceProfile:{actorId:npcId,revision:u.voiceProfileRevision},realizerVersion:'A075B1-R4.1',variant:u.realization.variant}});
  }finally{busy=false;}
 }
 return Object.freeze({respond,capabilities:()=>freeze({phase:'A07.5B2',freeAiText:false,limits:copy(B2_LIMITS),profiles:32,productiveEntrypointInstalled:false,entrypointProducerAdded:false,factualProducerAdded:false,worldEffects:false,uiWrites:false,persistence:false,memoryWrites:false,relationshipWrites:false,reputationWrites:false,commerce:false,spontaneousConversation:false})});
}

export { B2_LIMITS, B2_NATIVE_CONTRACT, classifyNativeMissionResult, createSafePlayerDialogueAdapter };
