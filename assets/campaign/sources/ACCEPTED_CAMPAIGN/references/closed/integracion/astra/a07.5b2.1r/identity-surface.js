import { createNpcPlayerVoiceRealizerR4_1 } from '../../../../../experimental/voice-realizer-r4-1-b14.js';
import { exact, text, fail, freeze, copy } from '../a07/safe-data.js';
import { validateIntroductionPayload } from './public-identity.js';

/** Authorized SELF_INTRODUCTION surface leaf using the actual closed R4.1 profiles.
 * No second voice catalogue, new traits, questions, grammar-world mappings or free text. */
// Profile inspection through the real factory. Absent factual authority stays null;
// this instance never realizes legacy claims and never issues a VALID receipt.
const r41=createNpcPlayerVoiceRealizerR4_1({validationPort:{revalidate:()=>null}}),profiles=r41.profiles();
const introductionProfiles=()=>profiles;
const lower=s=>s[0].toLocaleLowerCase('es')+s.slice(1);
const styles=Object.freeze({CLIPPED:'NOMINAL',BRIEF:'NOMINAL',PLAIN:'PLAIN',ORAL:'ORAL',FORMAL:'FORMAL',PREDICATE:'POSITION_FIRST',ECHO:'PLAIN'});
function identityVariant(actorId,revision,seed){let h=2166136261;for(const ch of JSON.stringify([actorId,'RESPOND','SELF_INTRODUCTION',revision,seed]))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h%4;}
function projectIdentitySurface(raw,options){
 const p=validateIntroductionPayload(raw);exact(options,['revision','seed']);text(options.revision);if(!Number.isSafeInteger(options.seed)||options.seed<0||options.seed>3)fail('INTRO_SEED_BOUND');
 const voice=profiles.find(v=>v.actorId===p.actorId),variant=identityVariant(p.actorId,options.revision,options.seed),closedRule=voice.simpleRules[variant].single,style=styles[closedRule];if(!style)fail('INTRO_UNSUPPORTED_R41_RULE');
 const name=p.claims[0].value,role=p.claims[1]?.value,job=role?lower(role):null;
 let value;if(style==='NOMINAL')value=job?`${name}, ${job}.`:`${name}.`;
 if(style==='PLAIN')value=job?`Soy ${name}, ${job}.`:`Soy ${name}.`;
 if(style==='ORAL')value=job?`Me llamo ${name}. Soy ${job}.`:`Me llamo ${name}.`;
 if(style==='FORMAL')value=job?`Mi nombre es ${name}. Soy ${job}.`:`Mi nombre es ${name}.`;
 if(style==='POSITION_FIRST')value=job?`Soy ${job}. Me llamo ${name}.`:`Soy ${name}.`;
 if(value.length>240)fail('INTRO_TEXT_BOUND');
 return freeze({text:value,claims:copy(p.claims),voiceProfile:{actorId:voice.actorId,revision:voice.revision,evidenceIds:copy(voice.evidenceIds),organizationGuideIds:copy(voice.organizationGuideIds),usedDimensions:copy(voice.usedDimensions)},realization:{catalogue:'A075B1-R4.1',surfaceLeaf:'SELF_INTRODUCTION:B21R',variant,closedRule,style,compression:style==='NOMINAL'?'compact':'full',clauseLinking:job?(style==='PLAIN'||style==='NOMINAL'?'apposition':'complete-sentences'):'single-claim',explanationOrder:style==='POSITION_FIRST'&&job?'role-name':'name-role',formality:closedRule==='FORMAL'?'FORMAL':'UNCHANGED_R41_SIMPLE_RULE',certaintyHandling:'N/A_IDENTITY_CERTAIN',correctionStyle:'N/A_NO_CORRECTION',refusalClosure:'N/A_NO_REFUSAL',ellipsisTolerance:style==='NOMINAL'?'sourced-name-title-nominal':'complete',questionContext:null,semanticRelations:[],newPersonalityDimensions:0},freeAiText:false,firstEncounterAsserted:false});
}
// Independent closed inverse projection: only exact sourced identity spans and five molds.
function auditIdentitySurface(value,raw){
 const p=validateIntroductionPayload(raw),name=p.claims[0].value,job=p.claims[1]?lower(p.claims[1].value):null;
 const allowed=job?[`${name}, ${job}.`,`Soy ${name}, ${job}.`,`Me llamo ${name}. Soy ${job}.`,`Mi nombre es ${name}. Soy ${job}.`,`Soy ${job}. Me llamo ${name}.`]:[`${name}.`,`Soy ${name}.`,`Me llamo ${name}.`,`Mi nombre es ${name}.`];
 return freeze({valid:typeof value==='string'&&value.length<=240&&allowed.includes(value),actorId:p.actorId,claims:allowed.includes(value)?copy(p.claims):[],firstEncounterAsserted:false});
}

export { auditIdentitySurface, identityVariant, introductionProfiles, projectIdentitySurface };
