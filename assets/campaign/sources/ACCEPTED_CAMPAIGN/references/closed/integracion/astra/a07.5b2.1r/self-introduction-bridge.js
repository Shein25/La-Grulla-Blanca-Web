import { createWorldPerceptionAdapter } from '../a01/world-perception-adapter.js';
import { createSafePlayerDialogueAdapter } from '../a07.5b2/safe-player-dialogue-adapter.js';
import { registration } from '../a07/registry.js';
import { SOCIAL_SOURCE_ID, SOCIAL_EVENT_TYPE } from '../a07/social-move-producer.js';
import { freeze, exact, fail, copy, text } from '../a07/safe-data.js';
import { verifyCanonicalDefinitions, identityPayload, publicIdentityRow } from './public-identity.js';
import { projectIdentitySurface, auditIdentitySurface } from './identity-surface.js';

/** Disconnected sourced payload/surface preparation. Productive dispatch remains gated. */
const no=reason=>freeze({status:'DEFERRED',reason,payload:null,candidate:null,productiveHandled:false});
function createSelfIntroductionBridge(options){
 exact(options,['npcDefinitions','captureRuntime'],['socialContinuity','entrypointPort']);verifyCanonicalDefinitions(options.npcDefinitions);if(typeof options.captureRuntime!=='function')fail('INTRO_RUNTIME_ACCESSOR');
 const definitions=options.npcDefinitions,captureRuntime=options.captureRuntime,a01=createWorldPerceptionAdapter(definitions),social=options.socialContinuity??null;
 if(social&&['capture','reader'].some(k=>typeof social[k]!=='function'))fail('INTRO_SOCIAL_READ_PORT');
 const canonical=createSafePlayerDialogueAdapter(options.entrypointPort?{entrypointPort:options.entrypointPort}:{});let busy=false;
 function acquaintance(runtime,actorId,revision,turn){
  // No authority establishes a complete encounter history or a negative NEVER_MET.
  if(!social||actorId==='lin_yue')return freeze({state:'UNKNOWN',reason:actorId==='lin_yue'?'LIN_ADVANCED_FIRST_CONTACT_PROJECTION_UNAVAILABLE':'SOCIAL_CONTINUITY_NOT_CONNECTED',source:null});
  const q=copy(social.reader(social.capture(runtime,actorId,{revision})).mostRecent('player'));
  if(q.status!=='AVAILABLE')return freeze({state:'UNKNOWN',reason:'VERIFIED_SOCIAL_SOURCE_UNAVAILABLE',source:null});
  if(q.observerId!==actorId||q.counterpartId!=='player'||!Array.isArray(q.entries)||q.entries.length>1)fail('INTRO_ACQUAINTANCE_SCOPE');
  if(!q.entries.length)return freeze({state:'UNKNOWN',reason:'EMPTY_BOUNDED_MEMORY_IS_NOT_NEVER_MET',source:null});const e=q.entries[0];
  exact(e,['counterpartId','sourceId','sequence','typeId','occurredTurn','acquiredTurn','acquisition']);
  if(e.counterpartId!=='player'||e.sourceId!==SOCIAL_SOURCE_ID||e.typeId!==SOCIAL_EVENT_TYPE||!Number.isSafeInteger(e.sequence)||e.sequence<1||!Number.isSafeInteger(e.occurredTurn)||e.occurredTurn<0||!Number.isSafeInteger(e.acquiredTurn)||e.acquiredTurn<e.occurredTurn||e.acquiredTurn>turn||!['PARTICIPATED','WITNESSED'].includes(e.acquisition))fail('INTRO_ACQUAINTANCE_NOT_OWN');
  if(e.occurredTurn===turn)return freeze({state:'UNKNOWN',reason:'CURRENT_COPRESENCE_IS_NOT_PRIOR_ACQUAINTANCE',source:null});
  return freeze({state:'KNOWN',reason:'OWN_VERIFIED_PRIOR_COPRESENCE_NOT_FRIENDSHIP',source:copy(e)});
 }
 function prepare(raw){exact(raw,['actorId','revision'],['seed']);registration(text(raw.actorId));text(raw.revision);const seed=raw.seed??0;if(!Number.isSafeInteger(seed)||seed<0||seed>3)fail('INTRO_SEED_BOUND');if(busy)return no('INTRO_REENTRANT');busy=true;
  try{verifyCanonicalDefinitions(definitions);const runtime=captureRuntime(),s=a01.snapshot(runtime,raw.actorId);if(!s.perception.playerPresent)return no('ACTOR_OR_RECIPIENT_NOT_PRESENT');
   const known=acquaintance(runtime,raw.actorId,raw.revision,s.turn);if(known.state==='KNOWN')return freeze({...no('KNOWN_NO_REPEAT_NO_AUTHORIZED_NEUTRAL_RESPONSE'),acquaintance:known});
   const payload=identityPayload(raw.actorId),candidate=projectIdentitySurface(payload,{revision:raw.revision,seed});if(!auditIdentitySurface(candidate.text,payload).valid)fail('INTRO_SURFACE_AUDIT');
   const current=captureRuntime();verifyCanonicalDefinitions(definitions);const now=a01.snapshot(current,raw.actorId),knownNow=acquaintance(current,raw.actorId,raw.revision,now.turn);
   if(JSON.stringify([s.actor,s.turn,s.position,s.perception.playerPresent,known])!==JSON.stringify([now.actor,now.turn,now.position,now.perception.playerPresent,knownNow]))return no('INTRO_READ_CONTEXT_CHANGED');
   return freeze({status:'SELF_INTRO_PAYLOAD_READY_BUT_FIRST_CONTACT_BLOCKED',reason:'UNKNOWN_NOT_NEVER_MET_AND_PRODUCTIVE_COMPOSITION_UNCONNECTED',payload,candidate,acquaintance:known,guard:{actorId:raw.actorId,recipientId:'player',turn:s.turn,roomId:s.position.roomId,revision:raw.revision,activeAreaId:null},publicFieldStatus:{NAME:'PUBLIC_SAFE',PUBLIC_ROLE:publicIdentityRow(raw.actorId).publicRoleStatus,PUBLIC_AFFILIATION:'NO_SOURCE',PUBLIC_POSITION:'NO_SOURCE'},productiveHandled:false,firstContactSupported:false});
  }catch{return no('CURRENT_IDENTITY_OR_SOCIAL_SOURCE_UNAVAILABLE');}finally{busy=false;}
 }
 function revalidate(raw){exact(raw,['request','prepared']);const p=copy(raw.prepared);if(p.status!=='SELF_INTRO_PAYLOAD_READY_BUT_FIRST_CONTACT_BLOCKED'||p.productiveHandled!==false)return freeze({status:'INVALID',reason:'NOT_A_PREPARED_NONPRODUCTIVE_PAYLOAD'});const now=prepare(raw.request);return freeze({status:now.status===p.status&&JSON.stringify(now)===JSON.stringify(p)?'CURRENT':'STALE',reason:JSON.stringify(now)===JSON.stringify(p)?null:'IDENTITY_PRESENCE_OR_CONTACT_CHANGED'});}
 // Only existing negative safe-route behavior is exposed. No SELF_INTRO capability is
 // forged for A074/R4.1; their closed topic/claim schemas require future composition.
 const respond=raw=>canonical.respond(raw);
 return Object.freeze({prepare,revalidate,respond,capabilities:()=>freeze({actors:32,claims:2,textLimit:240,variants:4,freeAiText:false,payloadAndClosedSurfaceReady:true,newVoiceCatalogue:false,newPersonalityDimensions:0,firstContactNegativeAuthority:false,neverMetProduced:false,canonicalReceiptProducer:false,eventProducer:false,activeAreaProducer:false,productiveConnectionInstalled:false,uiWrites:false,worldEffects:false,persistence:false,timers:0,caches:0})});
}

export { createSelfIntroductionBridge };
