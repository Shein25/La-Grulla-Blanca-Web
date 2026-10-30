import { isAuthenticRootUtterance } from './root-disclosure-broker.js';
import { isAuthenticServiceUtterance } from '../../../runtime/b2-shen-elemental-service-catalog-b14.js';
import { isAuthenticSocialUtterance } from '../../../runtime/social-context-native.js';
import { exact, fail, freeze, copy } from '../references/closed/integracion/astra/a07/safe-data.js';
import { claimKey } from '../references/closed/integracion/astra/a07.5b1/grammar.js';
import { relationKey } from '../references/closed/integracion/astra/a07.5b1/contextual-language-r3.js';
import { createNpcPlayerVoiceRealizerR4 } from '../references/closed/integracion/astra/a07.5b1/voice-realizer-r4.js';
import { VOICES_R4 } from '../references/closed/integracion/astra/a07.5b1/voice-catalog-r4.js';
import { renderVoiceR4_1, auditVoiceR4_1 } from '../references/closed/integracion/astra/a07.5b1/voice-language-r4-1.js';

const claimsKey=a=>JSON.stringify(a.map(claimKey).sort()),linksKey=a=>JSON.stringify(a.map(relationKey));
function createNpcPlayerVoiceRealizerR4_1(options){
 exact(options,['validationPort'],['authoredPort']);
 // Optional authored surface is supplied only by a trusted composition root.
 // The factual R4 kernel and its signature/audit remain the unchanged default.
 const authored=options.authoredPort??null;
 if(authored){exact(authored,['resolve']);if(typeof authored.resolve!=='function')fail('A075B1_AUTHORED_PORT');}
 const base=createNpcPlayerVoiceRealizerR4({validationPort:options.validationPort});let busy=false;
 function realize(raw){
  if(busy)fail('A075B1_R4_1_REENTRANT');busy=true;
  try{
   if(Object.hasOwn(raw,'authoredPayload')){
    exact(raw,['intent','authoredPayload','contextRevision'],['seed']);
    if(!authored)return freeze({status:'DEFERRED',reason:'AUTHORED_AUTHORITY_UNAVAILABLE',utterance:null});
    const verified=authored.resolve(raw);
    if(verified?.status!=='REALIZED')return freeze({status:'DEFERRED',reason:verified?.reason??'AUTHORED_AUTHORITY_NOT_VERIFIED',utterance:null});
    const u=verified.utterance,voice=VOICES_R4.find(v=>v.actorId===raw.intent?.actorId);
    if(!voice||!Object.isFrozen(raw.intent)||!Object.isFrozen(u)||u.actorId!==voice.actorId||u.recipientId!=='player'||
      u.intentKind!==raw.intent.intentKind||u.contextRevision!==raw.contextRevision||u.voiceProfileRevision!==voice.revision||
      typeof u.text!=='string'||!u.text.length||u.text.length>240||(u.realization?.catalogRevision!=='A079-FROZEN-AUTHORING-V1'&&!isAuthenticServiceUtterance(u)&&!isAuthenticRootUtterance(u)&&!isAuthenticSocialUtterance(u)))fail('A075B1_AUTHORED_SCOPE');
    return verified;
   }
   const verified=base.realize(raw);if(verified.status!=='REALIZED')return verified;
   const u=verified.utterance,voice=VOICES_R4.find(v=>v.actorId===u.actorId),n=u.realization.variant;
   const p={propositions:u.semanticClaims,semanticRelations:u.semanticRelations,speechFrame:u.speechFrame,questionContext:u.questionContext};
   // Also restore grammar in inherited nominal molds of otherwise unchanged profiles.
   // Their catalog and resolved selections remain the original R4 selections.
   const rendered=u.semanticRelations.length?renderVoiceR4_1(p,voice,n):{text:u.text,mold:'R3:PRESERVED'};
   const audit=auditVoiceR4_1(rendered.text,{speechFrame:u.speechFrame,questionContext:u.questionContext});
   if(!audit.valid||claimsKey(audit.claims)!==claimsKey(u.semanticClaims)||linksKey(audit.relations)!==linksKey(u.semanticRelations)||audit.speechAct!==(u.intentKind==='REFUSE'?'REFUSE':'ASSERT')||rendered.text.length>240)fail('A075B1_R4_1_REALIZATION_AUDIT');
   return freeze({status:'REALIZED',reason:null,utterance:{...copy(u),text:rendered.text,realization:{...copy(u.realization),ruleId:`${u.actorId}:${u.intentKind}:${n}:R4_1:${rendered.mold}`,catalogRevision:'A075B1-R4.1'}}});
  }finally{busy=false;}
 }
 return Object.freeze({realize,profiles:()=>VOICES_R4,capabilities:()=>freeze({...copy(base.capabilities()),phase:'A07.5B1-R4.1',linguisticBase:'R4_UNMODIFIED',newPersonalityDimensions:0})});
}

export { createNpcPlayerVoiceRealizerR4_1 };
