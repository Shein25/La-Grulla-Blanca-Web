import { fail, freeze, copy } from '../a07/safe-data.js';
import { createNpcPlayerContextualRealizer } from './realizer.js';
import { claimKey } from './grammar.js';
import { relationKey } from './contextual-language-r3.js';
import { VOICES_R4, VOICE_AUTHORITY_R4 } from './voice-catalog-r4.js';
import { renderVoiceR4, auditVoiceR4 } from './voice-language-r4.js';

/** A linguistic projection over the actual validated R3 result. No second truth port. */
const claimsKey=a=>JSON.stringify(a.map(claimKey).sort()),linksKey=a=>JSON.stringify(a.map(relationKey));
function createNpcPlayerVoiceRealizerR4(options){
 const base=createNpcPlayerContextualRealizer(options);let busy=false;
 function realize(raw){
  if(busy)fail('A075B1_R4_REENTRANT');busy=true;
  try{
   const verified=base.realize(raw);if(verified.status!=='REALIZED')return verified;
   const u=verified.utterance,voice=VOICES_R4.find(v=>v.actorId===u.actorId),n=u.realization.variant;
   const p={propositions:u.semanticClaims,semanticRelations:u.semanticRelations,speechFrame:u.speechFrame,questionContext:u.questionContext};
   // Preserve every simple answer, refusal and untouched/minimal profile exactly.
   const rendered=u.semanticRelations.length&&voice.organizationAdjusted?renderVoiceR4(p,voice,n):{text:u.text,mold:'R3:PRESERVED'};
   const audit=auditVoiceR4(rendered.text,{speechFrame:u.speechFrame,questionContext:u.questionContext});
   if(!audit.valid||claimsKey(audit.claims)!==claimsKey(u.semanticClaims)||linksKey(audit.relations)!==linksKey(u.semanticRelations)||audit.speechAct!==(u.intentKind==='REFUSE'?'REFUSE':'ASSERT')||rendered.text.length>240)fail('A075B1_R4_REALIZATION_AUDIT');
   // Semantic DTOs, signature, evidence and guards remain exactly those issued by R3.
   return freeze({status:'REALIZED',reason:null,utterance:{...copy(u),text:rendered.text,realization:{...copy(u.realization),ruleId:`${u.actorId}:${u.intentKind}:${n}:R4:${rendered.mold}`,catalogRevision:'A075B1-R4'}}});
  }finally{busy=false;}
 }
 return Object.freeze({realize,profiles:()=>VOICES_R4,capabilities:()=>freeze({...copy(base.capabilities()),phase:'A07.5B1-R4',voiceAuthority:VOICE_AUTHORITY_R4.voiceAuthorityParent,newPersonalityDimensions:0,validationKernel:'R3_UNMODIFIED'})});
}

export { createNpcPlayerVoiceRealizerR4 };
