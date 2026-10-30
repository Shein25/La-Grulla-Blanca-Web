import { freeze, copy, exact } from '../a07/safe-data.js';
import { SUBJECTS, STATES } from './grammar.js';
import { renderVoiceR4, auditVoiceR4 } from './voice-language-r4.js';

/** Oral grammar hotfix only. The R4 catalog, selections and graph remain authoritative. */
const CORRECTED_MOLDS_R4_1=freeze([
 'R4:BARE_TAIL','R4:BARE_CAUSE','R4:BARE_CORRECTION','R3:BARE_CHANGE',
 'R3:BARE_THEN','R3:BARE_RESERVATION','R4:MIXED_FOCUS'
]);
const cap=s=>s[0].toUpperCase()+s.slice(1),key=c=>c.kind+':'+c.subject;
function clause(c){
 const s=SUBJECTS[c.subject],adjective=STATES[c.kind][c.state][s.gender==='f'?1:0];
 const predicate=c.kind==='TASK_STATE'?(c.state==='COMPLETED'?'ha terminado':'queda pendiente'):c.kind==='OBSERVATION_STATE'?(c.state==='VISIBLE'?'se ve':'no se ve'):c.kind==='UNCERTAINTY_STATE'&&c.state==='UNCONFIRMED'?'está sin confirmar':adjective.startsWith('no ')?'no está '+adjective.slice(3):'está '+adjective;
 return {noun:s.noun,predicate,full:s.noun+' '+predicate};
}
/** Same resolved mold/variant as R4, including its questionless and sequence fallbacks. */
function renderVoiceR4_1(p,voice,n){
 const original=renderVoiceR4(p,voice,n);
 if(!CORRECTED_MOLDS_R4_1.includes(original.mold))return freeze({...copy(original),changed:false});
 const r=p.semanticRelations[0],x=clause(p.propositions.find(c=>key(c)===key(r.source))),y=clause(p.propositions.find(c=>key(c)===key(r.target)));
 let text;
 switch(original.mold){
  case 'R4:BARE_TAIL':text=`${cap(x.full)}. En cambio, ${y.full}.`;break;
  case 'R4:BARE_CAUSE':text=`${cap(x.full)}. Por eso ${y.full}.`;break;
  case 'R4:BARE_CORRECTION':text=`${cap(y.full)}. En realidad, ${x.full}.`;break;
  case 'R3:BARE_CHANGE':text=`${cap(x.full)}; en cambio, ${y.full}.`;break;
  case 'R3:BARE_THEN':text=`${cap(x.full)}; después, ${y.full}.`;break;
  case 'R3:BARE_RESERVATION':text=`${cap(y.full)}, aunque ${x.full}.`;break;
  // Full target predicate, ordinary sentence boundary and original target topic focus.
  // This also remains distinguishable from TARGET_FOCUS's reversed directed graph.
  case 'R4:MIXED_FOCUS':text=`${cap(x.full)}. ${cap(y.noun)}, en cambio, ${y.predicate}.`;break;
 }
 return freeze({text,mold:original.mold,organization:{...copy(original.organization),compression:'full'},changed:text!==original.text});
}
/** Surface decoder only. No expected claims/graph/profile and no naturalness filter. */
function auditVoiceR4_1(text,raw){
 const bad=()=>freeze({valid:false,claims:[],relations:[],speechAct:null});let c;
 try{c=copy(raw);exact(c,['speechFrame','questionContext']);}catch{return bad();}
 const old=auditVoiceR4(text,c);if(old.valid)return old;
 if(typeof text!=='string'||text.length>240||!text.endsWith('.'))return bad();
 const t=text.slice(0,-1);let m,normalized;
 // These two closed oral clause forms express source -> target contrast.
 if((m=t.match(/^(.+)\. En cambio, (.+)$/u)))normalized=`${m[1]}; en cambio, ${m[2]}.`;
 else if((m=t.match(/^(.+)\. ((?:El|La) .+), en cambio, (.+)$/u)))normalized=`${m[1]}; en cambio, ${m[2].toLowerCase()} ${m[3]}.`;
 else return bad();
 const decoded=auditVoiceR4(normalized,c);
 return decoded.valid&&decoded.relations.length===1&&decoded.relations[0].kind==='CONTRASTS_WITH'?decoded:bad();
}

export { CORRECTED_MOLDS_R4_1, auditVoiceR4_1, renderVoiceR4_1 };
