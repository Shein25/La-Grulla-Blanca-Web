import { realizeSelfIntroduction, auditSelfIntroduction } from '../a07.5b2.1r2/identity-surface.js';
import { validateSelfIntroductionPayload } from '../a07.5b2.1r2/public-bindings.js';
import { freeze, copy } from '../a07/safe-data.js';

/** Grammar corrections only; original public claims and R4.1 profiles stay authoritative. */
const predicates=Object.freeze({yao_fen:'instructora de Alquimia',mei_shufen:'herbolaria de Sauces',
 wei_jian:'responsable del Pabellón Marcial',chen_bo:'instructor de Examen',ren_bo:'patrullero veterano'});
const tails=Object.freeze({yao_fen:' También me encargo de la botica.',chen_bo:' Trabajo con anatomía y medicina.'});
function corrected(p,rule){
 const id=p.actorId,n=p.name,j=predicates[id],tail=tails[id]??'';
 if(id==='madre_wen'){
  const c='Me encargo de la vida cotidiana de los externos.';
  if(['CLIPPED','BRIEF'].includes(rule))return n+'. '+c;
  if(['PLAIN','ECHO'].includes(rule))return 'Soy '+n+'. '+c;
  if(rule==='ORAL')return 'Me llamo '+n+'. '+c;
  if(rule==='FORMAL')return 'Mi nombre es '+n+'. '+c;
  if(rule==='PREDICATE')return c+' Me llamo '+n+'.';
 }
 // These two R2 clauses only need repair for the mechanical double-Soy variant.
 if(['wei_jian','chen_bo'].includes(id)&&!['PLAIN','ECHO'].includes(rule))return null;
 if(id==='ren_bo'&&!['CLIPPED','BRIEF'].includes(rule))return null;
 if(!j)return null;
 if(['CLIPPED','BRIEF'].includes(rule))return n+'. Soy '+j+'.'+tail;
 if(['PLAIN','ECHO'].includes(rule))return 'Soy '+n+', '+j+'.'+tail;
 if(rule==='ORAL')return 'Me llamo '+n+'. Soy '+j+'.'+tail;
 if(rule==='FORMAL')return 'Mi nombre es '+n+'. Soy '+j+'.'+tail;
 if(rule==='PREDICATE')return 'Soy '+j+'.'+tail+' Me llamo '+n+'.';
 return null;
}
function realizeNaturalIdentity(raw,options){
 const p=validateSelfIntroductionPayload(raw),old=realizeSelfIntroduction(p,options),value=corrected(p,old.realization.closedRule);
 if(value===null||value===old.text)return old;
 return freeze({...copy(old),text:value,realization:{...copy(old.realization),surfaceLeaf:'SELF_INTRODUCTION:A07.5B2.2R1',
  clauseLinking:value.startsWith('Soy '+p.name+', ')?'apposition-and-complete-sentences':'complete-sentences',
  ellipsisTolerance:['CLIPPED','BRIEF'].includes(old.realization.closedRule)?'sourced-name-nominal-with-complete-predicate':'complete',
  grammarCorrection:true,newPersonalityDimensions:0}});
}
/** Independent closed inverse: exact public identity + individually authorized grammar. */
function auditNaturalIdentity(value,raw){
 const p=validateSelfIntroductionPayload(raw),n=p.name,id=p.actorId;
 if(!['madre_wen','ren_bo','yao_fen','mei_shufen','wei_jian','chen_bo'].includes(id))return auditSelfIntroduction(value,p);
 const allowed=[];
 if(id==='madre_wen'){
  const c='Me encargo de la vida cotidiana de los externos.';
  allowed.push(n+'. '+c,'Soy '+n+'. '+c,'Me llamo '+n+'. '+c,'Mi nombre es '+n+'. '+c,c+' Me llamo '+n+'.');
 }else {
  const role={ren_bo:'patrullero veterano',yao_fen:'instructora de Alquimia',mei_shufen:'herbolaria de Sauces',wei_jian:'responsable del Pabellón Marcial',chen_bo:'instructor de Examen'}[id];
  const extra=id==='yao_fen'?' También me encargo de la botica.':id==='chen_bo'?' Trabajo con anatomía y medicina.':'';
  allowed.push(n+'. Soy '+role+'.'+extra,'Soy '+n+', '+role+'.'+extra,'Me llamo '+n+'. Soy '+role+'.'+extra,
   'Mi nombre es '+n+'. Soy '+role+'.'+extra,'Soy '+role+'.'+extra+' Me llamo '+n+'.');
  if(['wei_jian','chen_bo','ren_bo'].includes(id)&&auditSelfIntroduction(value,p).valid&&!value.startsWith('Soy '+n+'. Soy '))allowed.push(value);
 }
 return freeze({valid:typeof value==='string'&&value.length<=240&&allowed.includes(value),actorId:id,firstEncounterAsserted:false});
}

export { auditNaturalIdentity, realizeNaturalIdentity };
