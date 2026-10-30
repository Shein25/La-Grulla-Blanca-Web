import { exact, text, fail, freeze, copy } from '../a07/safe-data.js';
import { identityPayload } from '../a07.5b2.1r/public-identity.js';
import { introductionProfiles, identityVariant, projectIdentitySurface } from '../a07.5b2.1r/identity-surface.js';
import { validateSelfIntroductionPayload, publicBindingRow } from './public-bindings.js';

/** Narrow R2 extension of the existing identity leaf, using unchanged R4.1 rules. */
function selection(p,options){
 exact(options,['revision','seed']);text(options.revision);
 if(!Number.isSafeInteger(options.seed)||options.seed<0||options.seed>3)fail('B21R2_SEED_BOUND');
 const voice=introductionProfiles().find(v=>v.actorId===p.actorId),variant=identityVariant(p.actorId,options.revision,options.seed);
 const rule=voice.simpleRules[variant].single;
 return {voice,variant,rule};
}
function humanText(name,clause,rule){
 if(['CLIPPED','BRIEF'].includes(rule))return name+'. '+clause;
 if(['PLAIN','ECHO'].includes(rule))return 'Soy '+name+'. '+clause;
 if(rule==='ORAL')return 'Me llamo '+name+'. '+clause;
 if(rule==='FORMAL')return 'Mi nombre es '+name+'. '+clause;
 if(rule==='PREDICATE')return clause+' Me llamo '+name+'.';
 fail('B21R2_UNSUPPORTED_R41_RULE');
}
function realizeSelfIntroduction(raw,options){
 const p=validateSelfIntroductionPayload(raw),row=publicBindingRow(p.actorId),s=selection(p,options);
 if(row.bindingKind!=='HUMAN_RATIFIED_R2'){
  const old=projectIdentitySurface(identityPayload(p.actorId),options);
  return freeze({...copy(old),claims:copy(p.claims),realization:{...copy(old.realization),surfaceLeaf:'SELF_INTRODUCTION:A07.5B2.1R2'}});
 }
 const value=humanText(p.name,row.authorizedRoleClause,s.rule);if(value.length>240)fail('B21R2_TEXT_BOUND');
 return freeze({text:value,claims:copy(p.claims),voiceProfile:{actorId:s.voice.actorId,revision:s.voice.revision,evidenceIds:copy(s.voice.evidenceIds),organizationGuideIds:copy(s.voice.organizationGuideIds),usedDimensions:copy(s.voice.usedDimensions)},
  realization:{catalogue:'A075B1-R4.1',surfaceLeaf:'SELF_INTRODUCTION:A07.5B2.1R2',variant:s.variant,closedRule:s.rule,
   style:['CLIPPED','BRIEF'].includes(s.rule)?'NOMINAL':s.rule==='ECHO'?'PLAIN':s.rule,compression:['CLIPPED','BRIEF'].includes(s.rule)?'compact':'full',
   clauseLinking:'complete-sentences',explanationOrder:s.rule==='PREDICATE'?'role-name':'name-role',formality:s.rule==='FORMAL'?'FORMAL':'UNCHANGED_R41_SIMPLE_RULE',
   certaintyHandling:'N/A_IDENTITY_CERTAIN',correctionStyle:'N/A_NO_CORRECTION',refusalClosure:'N/A_NO_REFUSAL',
   ellipsisTolerance:['CLIPPED','BRIEF'].includes(s.rule)?'sourced-name-nominal':'complete',questionContext:null,semanticRelations:[],newPersonalityDimensions:0},
  freeAiText:false,firstEncounterAsserted:false});
}
/** Closed independent inverse: an authorized role sentence is not free text. */
function auditSelfIntroduction(value,raw){
 const p=validateSelfIntroductionPayload(raw),row=publicBindingRow(p.actorId);
 let allowed;
 if(row.bindingKind==='HUMAN_RATIFIED_R2'){
  const n=p.name,c=row.authorizedRoleClause;
  allowed=[n+'. '+c,'Soy '+n+'. '+c,'Me llamo '+n+'. '+c,'Mi nombre es '+n+'. '+c,c+' Me llamo '+n+'.'];
 }else {
  const n=p.name,j=p.publicRole? p.publicRole[0].toLocaleLowerCase('es')+p.publicRole.slice(1):null;
  allowed=j?[n+', '+j+'.','Soy '+n+', '+j+'.','Me llamo '+n+'. Soy '+j+'.','Mi nombre es '+n+'. Soy '+j+'.','Soy '+j+'. Me llamo '+n+'.']:[n+'.','Soy '+n+'.','Me llamo '+n+'.','Mi nombre es '+n+'.'];
 }
 return freeze({valid:typeof value==='string'&&value.length<=240&&allowed.includes(value),actorId:p.actorId,firstEncounterAsserted:false});
}

export { auditSelfIntroduction, introductionProfiles, realizeSelfIntroduction };
