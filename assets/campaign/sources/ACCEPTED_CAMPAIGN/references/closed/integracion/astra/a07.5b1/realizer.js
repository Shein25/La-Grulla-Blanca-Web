import { freeze, fail, copy, exact, source } from '../a07/safe-data.js';
import { VOICES, VOICE_AUTHORITY } from './voice-catalog.js';
import { proposition, renderRefusal, renderFacts, auditText, claimKey } from './grammar.js';
import { VOICES_R2, VOICE_AUTHORITY_R2 } from './voice-catalog-r2.js';
import { validateSpeechContext, renderNatural, auditNaturalText } from './natural-language-r2.js';
import { VOICES_R3, VOICE_AUTHORITY_R3 } from './voice-catalog-r3.js';
import { validateSemanticRelations, renderContextual, auditContextualText, relationKey, SEMANTIC_RELATIONS_R3 } from './contextual-language-r3.js';

/** A07.5B1: local linguistic realization only. No runtime, UI, controller or memory imports. */
const REALIZER_LIMITS=freeze({actors:32,propositions:2,variantsPerIntent:4,maxText:240,history:0,timers:0});
const identifier=x=>{if(typeof x!=='string'||!/^[A-Za-z0-9_:.@/-]{1,128}$/.test(x))fail('A075B1_IDENTIFIER');return x;};
const no=(status,reason)=>freeze({status,reason,utterance:null});
function payload(raw,intent,natural,rich){
 const p=copy(raw);exact(p,rich?['semanticKey','topicRefs','route','propositions','speechFrame','questionContext','semanticRelations']:natural?['semanticKey','topicRefs','route','propositions','speechFrame','questionContext']:['semanticKey','topicRefs','route','propositions']);identifier(p.semanticKey);
 if(!['AUTONOMOUS','CANONICAL'].includes(p.route)||!Array.isArray(p.topicRefs)||p.topicRefs.length>1||!Array.isArray(p.propositions)||p.propositions.length>2)fail('A075B1_PAYLOAD_BOUND');
 p.topicRefs.forEach(identifier);
 if(intent.intentKind==='REFUSE'){if(p.propositions.length||p.topicRefs.length)fail('A075B1_REFUSAL_CONTENT');}
 else {
  if(p.propositions.length<1)fail('A075B1_PROPOSITION_REQUIRED');
  const topic=intent.topicBasis?.kind==='KNOWLEDGE'?intent.topicBasis.topicId:intent.topicBasis?.kind;
  if(p.topicRefs.length!==1||p.topicRefs[0]!==topic)fail('A075B1_TOPIC_SCOPE');
  p.propositions=p.propositions.map(proposition);
  if(new Set(p.propositions.map(x=>x.subject)).size!==p.propositions.length)fail('A075B1_DUPLICATE_OR_CONTRADICTORY_SUBJECT');
 }
 if(natural)validateSpeechContext(p,intent);
 if(rich)validateSemanticRelations(p);
 return p;
}
/** Canonical receipt binding, not a cryptographic grant or a world-truth evaluator. */
function contentSignature(raw){
 const p=copy(raw);exact(p,['semanticKey','topicRefs','route','propositions'],['speechFrame','questionContext','semanticRelations']);
 const framed=Object.hasOwn(p,'speechFrame');if(framed!==Object.hasOwn(p,'questionContext'))fail('A075B1_R2_FRAME_BINDING');
 const data=[p.semanticKey,p.topicRefs,p.route,p.propositions.map(x=>[x.kind,x.subject,x.state])];
 if(framed)data.push({speechFrame:p.speechFrame,questionContext:p.questionContext});
 if(Object.hasOwn(p,'semanticRelations')){if(!framed)fail('A075B1_R3_FRAME_BINDING');data.push({semanticRelations:p.semanticRelations});}
 return JSON.stringify(data);
}
function basis(raw,kind,i,signature){
 if(raw===null)return null;
 exact(raw,['kind','actorId','recipientId','intentKind','bindingId','eventId','contextRevision','contentSignature','evidenceId','source']);
 if(!kind.includes(raw.kind)||raw.actorId!==i.actorId||raw.recipientId!=='player'||raw.intentKind!==i.intentKind||raw.bindingId!==i.reasonBasis.bindingId||raw.eventId!==i.reasonBasis.eventId||raw.contextRevision!==i.guard.revision||raw.contentSignature!==signature)return null;
 identifier(raw.evidenceId);source(raw.source);return raw;
}
function variant(actor,kind,key,revision,seed){
 // Integer FNV-1a. No clock, global entropy, cache or mutable conversation history.
 let h=2166136261;for(const ch of JSON.stringify([actor,kind,key,revision,seed]))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h%4;
}
function createNpcPlayerRealizer(options){
 return createValidatedRealizer(options,'R1');
}
/** R2 compatibility entry; current contextual surface is R3. */
function createNpcPlayerNaturalRealizer(options){
 return createValidatedRealizer(options,'R2');
}
/** Current R3 entry; R1/R2 constructors are unchanged compatibility surfaces. */
function createNpcPlayerContextualRealizer(options){return createValidatedRealizer(options,'R3');}
function createValidatedRealizer(options,mode){
 const natural=mode!=='R1',rich=mode==='R3';
 exact(options,['validationPort']);exact(options.validationPort,['revalidate']);
 if(typeof options.validationPort.revalidate!=='function')fail('A075B1_VALIDATION_PORT');
 const revalidate=options.validationPort.revalidate.bind(options.validationPort),profiles=rich?VOICES_R3:natural?VOICES_R2:VOICES,authority=rich?VOICE_AUTHORITY_R3:natural?VOICE_AUTHORITY_R2:VOICE_AUTHORITY;let busy=false;
 function realize(raw){
  if(busy)fail('A075B1_REENTRANT');exact(raw,['intent','contentPayload','contextRevision'],['seed']);
  const original=raw.intent,i=copy(original);exact(i,['schemaVersion','actorId','counterpartId','intentKind','topicBasis','reasonBasis','relationBasis','reputationBasis','guard']);
  if(!Object.isFrozen(original)||i.schemaVersion!==1)fail('A075B1_A074_INTENT_REQUIRED');
  const voice=profiles.find(v=>v.actorId===i.actorId);if(!voice)fail('A075B1_ACTOR');
  if(i.counterpartId!=='player')return no('NO_UTTERANCE','NPC_PLAYER_ONLY');
  if(!['RESPOND','INFORM','REFUSE'].includes(i.intentKind))fail('A075B1_INTENT_KIND');
  exact(i.reasonBasis,['bindingId','eventId','motive','observedTurn','source']);identifier(i.reasonBasis.bindingId);identifier(i.reasonBasis.eventId);
  exact(i.guard,['revision','turn','roomId','activeAreaId']);identifier(i.guard.revision);identifier(i.guard.roomId);identifier(i.guard.activeAreaId);
  if(!Number.isSafeInteger(i.guard.turn)||i.guard.turn<0)fail('A075B1_TURN');
  identifier(raw.contextRevision);if(raw.contextRevision!==i.guard.revision)return no('STALE','REVISION_CHANGED');
  const seed=raw.seed??0;if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)fail('A075B1_SEED');
  const p=payload(raw.contentPayload,i,natural,rich),signature=contentSignature(p);
  if(p.route==='CANONICAL')return no('DEFER_TO_CANONICAL_DIALOGUE','CANONICAL_ROUTE');
  // This grammar asserts facts; it cannot promote suspicion or verbalize advanced memories.
  if(i.topicBasis?.kind==='ENCOUNTER_CONTEXT')return no('DEFERRED','MEMORY_REALIZATION_RULE_NOT_CONNECTED');
  if(i.topicBasis?.kind==='KNOWLEDGE'&&(i.topicBasis.use!=='ASSERT'||!['SABE','CONFIRMADO'].includes(i.topicBasis.level)))return no('DEFERRED','ASSERTION_NOT_AUTHORIZED');
  busy=true;
  try{
   // Trusted composition root closes over A074/current actor-scoped evidence. No global state crosses this port.
   const checked=copy(revalidate(Object.freeze({intent:original,contentPayload:freeze(copy(p)),contentSignature:signature,contextRevision:raw.contextRevision})));
   if(checked.status!=='VALID'){
    exact(checked,['status'],['reason']);
    if(!['STALE','INVALID','DEFERRED'].includes(checked.status))fail('A075B1_VALIDATION_STATUS');
    return no(checked.status==='DEFERRED'?'DEFERRED':'STALE','INTENT_OR_CONTEXT_NOT_VALID');
   }
   exact(checked,['status','actorId','recipientId','contextRevision','turn','roomId','activeAreaId','actorPresent','recipientPresent','contentSignature','routing','contextBasis','knowledgeBasis','disclosureBasis']);
   if(checked.actorId!==i.actorId||checked.recipientId!=='player'||checked.contextRevision!==i.guard.revision||checked.turn!==i.guard.turn||checked.roomId!==i.guard.roomId||checked.activeAreaId!==i.guard.activeAreaId||checked.actorPresent!==true||checked.recipientPresent!==true||checked.contentSignature!==signature)return no('STALE','SCOPED_CONTEXT_CHANGED');
   if(checked.routing==='CANONICAL_ONLY')return no('DEFER_TO_CANONICAL_DIALOGUE','CANONICAL_AUTHORITY');
   if(checked.routing!=='AUTONOMOUS_AUTHORIZED')return no('DEFERRED','AUTONOMOUS_CONTENT_NOT_AUTHORIZED');
   const context=basis(checked.contextBasis,['VERIFIED_CONTEXT'],i,signature);
   if(!context)return no('DEFERRED','VERIFIED_CONTEXT_REQUIRED');
   let knowledge=null,disclosure=null;
   if(i.intentKind!=='REFUSE'){
    knowledge=basis(checked.knowledgeBasis,['ACTOR_OBSERVATION','VERIFIED_COMMUNICATION'],i,signature);
    disclosure=basis(checked.disclosureBasis,['EXPLICIT_DISCLOSURE'],i,signature);
    if(!knowledge)return no('DEFERRED','ACTOR_VERIFIED_KNOWLEDGE_REQUIRED');
    if(!disclosure)return no('DEFERRED','EXPLICIT_DISCLOSURE_REQUIRED');
   }
   const n=variant(i.actorId,i.intentKind,p.semanticKey,i.guard.revision,seed);
   const responseToRequest=i.intentKind==='RESPOND'&&i.reasonBasis.motive==='DIRECT_REQUEST';
   const text=rich?renderContextual(p,voice,n):natural?renderNatural(p,voice.rules[n],n):i.intentKind==='REFUSE'?renderRefusal(voice.refusalStyles[n],n):renderFacts(p.propositions,voice.patterns[n],responseToRequest?'RESPOND':'INFORM');
   const audit=rich?auditContextualText(text,{speechFrame:p.speechFrame,questionContext:p.questionContext}):natural?auditNaturalText(text,{speechFrame:p.speechFrame,questionContext:p.questionContext}):auditText(text),expected=p.propositions.map(claimKey);
   if(!audit.valid||JSON.stringify(rich?audit.claims.map(claimKey).sort():audit.claims.map(claimKey))!==JSON.stringify(rich?[...expected].sort():expected)||(i.intentKind==='REFUSE')!==(audit.speechAct==='REFUSE')||text.length>REALIZER_LIMITS.maxText)fail('A075B1_FACTUAL_AUDIT');
   if(rich&&JSON.stringify(audit.relations.map(relationKey))!==JSON.stringify(p.semanticRelations.map(relationKey)))fail('A075B1_R3_RELATION_AUDIT');
   return freeze({status:'REALIZED',reason:null,utterance:{schemaVersion:1,actorId:i.actorId,recipientId:'player',intentKind:i.intentKind,text,semanticKey:p.semanticKey,topicRefs:copy(p.topicRefs),semanticClaims:copy(audit.claims),...(rich?{semanticRelations:copy(audit.relations)}:{}),...(natural?{speechFrame:p.speechFrame,questionContext:copy(p.questionContext)}:{}),voiceProfileRevision:voice.revision,contextRevision:i.guard.revision,sourceBasis:{context:copy(context),knowledge:copy(knowledge),disclosure:copy(disclosure),voiceEvidenceIds:copy(voice.evidenceIds)},realization:{ruleId:`${i.actorId}:${i.intentKind}:${n}`+(rich?':R3':natural?':R2':''),catalogRevision:rich?'A075B1-R3':natural?'A075B1-R2':'A075B1-R1',variant:n}}});
  }finally{busy=false;}
 }
 return Object.freeze({realize,profiles:()=>profiles,capabilities:()=>freeze({phase:rich?'A07.5B1-R3':natural?'A07.5B1-R2':'A07.5B1',freeAiText:false,limits:REALIZER_LIMITS,voiceAuthority:rich?authority.voiceAuthorityParent:authority.parent,...(rich?{semanticRelationSupport:SEMANTIC_RELATIONS_R3}:{}),intentKinds:['RESPOND','INFORM','REFUSE'],relationModulation:false,memoryVerbalization:false,worldEffects:false,uiWrites:false,persistence:false})});
}

export { REALIZER_LIMITS, contentSignature, createNpcPlayerContextualRealizer, createNpcPlayerNaturalRealizer, createNpcPlayerRealizer };
