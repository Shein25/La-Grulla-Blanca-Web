import { createWorldPerceptionAdapter } from '../a01/world-perception-adapter.js';
import { createSelfIntroductionBridge } from '../a07.5b2.1r/self-introduction-bridge.js';
import { freeze, exact, fail, copy } from '../a07/safe-data.js';
import { selfIntroductionPayload } from './public-bindings.js';
import { createDirectConversationFeed, conversationRequest } from './direct-conversation-feed.js';
import { realizeSelfIntroduction, auditSelfIntroduction } from './identity-surface.js';
import { verifyCanonicalDefinitions } from '../a07.5b2.1r/public-identity.js';

/** Command-directed typed composition, disconnected from HTML/UI and autonomous AI. */
const deferred=(reason,canonicalDecision='DEFER')=>freeze({status:'DEFER',reason,canonicalDecision,intent:null,payload:null});
function createSelfIntroductionBindings(options){
 exact(options,['npcDefinitions','captureRuntime'],['entrypointPort','socialContinuity']);
 verifyCanonicalDefinitions(options.npcDefinitions);if(typeof options.captureRuntime!=='function')fail('B21R2_RUNTIME_ACCESSOR');
 const definitions=options.npcDefinitions,capture=options.captureRuntime,perception=createWorldPerceptionAdapter(definitions);
 const contact=createSelfIntroductionBridge({npcDefinitions:definitions,captureRuntime:capture,...(options.socialContinuity?{socialContinuity:options.socialContinuity}:{})});
 const motivationFeed=createDirectConversationFeed(options.entrypointPort?{entrypointPort:options.entrypointPort}:{});
 // Ephemeral instance capabilities only; weak keys, no event ledger/cache or save.
 let proofs=new WeakMap(),busy=false,disposed=false;
 function open(){if(disposed)fail('B21R2_DISPOSED');if(busy)fail('B21R2_REENTRANT');}
 function context(r){
  verifyCanonicalDefinitions(definitions);const s=perception.snapshot(capture(),r.npcId);
  if(!s.perception.playerPresent)return null;
  return {actorId:s.actor.id,turn:s.turn,roomId:s.position.roomId,anchored:s.position.anchored,recipientId:'player',revision:r.contextRevision};
 }
 function compute(r){
  const feed=motivationFeed.capture(r);if(feed.status!=='AVAILABLE')return deferred(feed.reason,feed.status);
  const first=context(r);if(first===null)return deferred('ACTOR_OR_RECIPIENT_NOT_PRESENT');
  // Reuse the closed own positive-contact reader; R1's negative gate is not used.
  const q=contact.prepare({actorId:r.npcId,revision:r.contextRevision,seed:r.seed});
  if(q.acquaintance?.state==='KNOWN')return deferred('KNOWN_NO_REPEAT_NO_AUTHORIZED_NEUTRAL_RESPONSE');
  if(q.acquaintance?.state!=='UNKNOWN')return deferred('CURRENT_IDENTITY_OR_SOCIAL_SOURCE_UNAVAILABLE');
  const payload=selfIntroductionPayload(r.npcId,q.acquaintance.state),guard=context(r);
  if(JSON.stringify(first)!==JSON.stringify(guard))return deferred('IDENTITY_OR_PRESENCE_CHANGED_DURING_READ');
  return freeze({status:'PROPOSED',reason:null,canonicalDecision:'NO_CANONICAL_INTERACTION',
   intent:{schemaVersion:1,kind:'SELF_INTRODUCTION',actorId:r.npcId,recipientId:'player',
    motivation:copy(feed.motivation),guard,acquaintanceState:'UNKNOWN',firstEncounterAsserted:false},
   payload});
 }
 function prepare(raw){
  open();const r=conversationRequest(raw);busy=true;
  try{const p=compute(r);if(p.status==='PROPOSED')proofs.set(p,{request:r,signature:JSON.stringify(p)});return p;}
  catch{return deferred('CURRENT_IDENTITY_OR_SOCIAL_SOURCE_UNAVAILABLE');}finally{busy=false;}
 }
 function current(p){
  const proof=proofs.get(p);if(!proof)return {status:'INVALID',reason:'FOREIGN_OR_INVALIDATED_PROPOSAL'};
  const now=compute(proof.request);
  if(now.status!=='PROPOSED'||JSON.stringify(now)!==proof.signature){proofs.delete(p);return {status:'STALE',reason:now.reason??'SELF_INTRO_CONTEXT_CHANGED',canonicalDecision:now.canonicalDecision};}
  return {status:'CURRENT',proof};
 }
 function revalidate(raw){
  open();exact(raw,['prepared']);busy=true;
  try{const c=current(raw.prepared);return freeze({status:c.status,reason:c.reason??null});}
  catch{proofs.delete(raw.prepared);return freeze({status:'STALE',reason:'CURRENT_CONTEXT_NOT_VERIFIED'});}finally{busy=false;}
 }
 function realize(raw){
  open();exact(raw,['prepared']);busy=true;
  const no=(reason,decision='DEFER')=>freeze({handled:false,text:null,deferReason:reason,canonicalDecision:decision,utterance:null});
  try{
   const c=current(raw.prepared);if(c.status!=='CURRENT')return no(c.reason,c.canonicalDecision);
   const p=raw.prepared,r=c.proof.request,u=realizeSelfIntroduction(p.payload,{revision:r.contextRevision,seed:r.seed});
   if(!auditSelfIntroduction(u.text,p.payload).valid)return no('SELF_INTRO_SURFACE_NOT_VERIFIED');
   const final=current(p);if(final.status!=='CURRENT')return no(final.reason,final.canonicalDecision);
   return freeze({handled:true,text:u.text,deferReason:null,canonicalDecision:'NO_CANONICAL_INTERACTION',
    utterance:{actorId:r.npcId,recipientId:'player',eventId:r.eventId,contextRevision:r.contextRevision,kind:'SELF_INTRODUCTION',
     acquaintanceState:'UNKNOWN',...copy(u)},connectionInstalled:false});
  }catch{return no('CURRENT_CONTEXT_NOT_VERIFIED');}finally{busy=false;}
 }
 function respond(raw){const p=prepare(raw);return p.status==='PROPOSED'?realize({prepared:p}):freeze({handled:false,text:null,deferReason:p.reason,canonicalDecision:p.canonicalDecision,utterance:null});}
 return Object.freeze({prepare,revalidate,realize,respond,motivationFeed,
  invalidate:()=>{open();proofs=new WeakMap();},dispose:()=>{open();disposed=true;proofs=new WeakMap();},
  capabilities:()=>freeze({phase:'A07.5B2.1R2',actors:32,claims:2,textLimit:240,variants:4,freeAiText:false,semanticRelations:0,
   typedSelfIntroduction:true,unknownAllowed:true,knownSuppressesFullIntro:true,neverMetProduced:false,firstEncounterAsserted:false,
   newVoiceCatalogue:false,newPersonalityDimensions:0,oldA074CapabilitiesForged:false,generalA074SchemaChanged:false,
   canonicalReceiptProducer:false,productiveConnectionInstalled:false,uiWrites:false,worldEffects:false,persistence:false,
   memoryWrites:false,commerce:false,timers:0,history:0,cache:0})});
}

export { createSelfIntroductionBindings };
