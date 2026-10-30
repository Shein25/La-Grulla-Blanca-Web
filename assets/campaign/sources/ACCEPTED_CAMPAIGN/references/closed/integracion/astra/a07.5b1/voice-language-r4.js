import { freeze, fail, copy, exact } from '../a07/safe-data.js';
import { SUBJECTS, STATES } from './grammar.js';
import { renderContextual, auditContextualText, validateSemanticRelations } from './contextual-language-r3.js';

/** R4 changes only discourse organization. The R3 graph/validator stay untouched. */
const cap=s=>s[0].toUpperCase()+s.slice(1),ref=c=>({kind:c.kind,subject:c.subject}),key=r=>r.kind+':'+r.subject;
const R4_MOLDS=freeze({
 CONTRASTS_WITH:['TARGET_FOCUS','BARE_TAIL','CONTRAST_SUBORDINATE','MIXED_FOCUS'],
 CAUSES:['BARE_CAUSE','CAUSAL_FRONT','RESULT_REASON'],
 CORRECTS:['SOURCE_PREFIX_JOIN','SOURCE_PREFIX_SPLIT','SOURCE_FOCUS','TARGET_SPLIT_FOCUS','BARE_CORRECTION'],
 QUALIFIES:['RESERVATION_FIRST'],SEQUENCE_BEFORE:['RESULT_SEQUENCE']
});
function phrases(c){
 const slot=SUBJECTS[c.subject],short=STATES[c.kind][c.state][slot.gender==='f'?1:0];
 const predicate=c.kind==='TASK_STATE'?(c.state==='COMPLETED'?'ha terminado':'queda pendiente'):c.kind==='OBSERVATION_STATE'?(c.state==='VISIBLE'?'se ve':'no se ve'):c.kind==='UNCERTAINTY_STATE'&&c.state==='UNCONFIRMED'?'está sin confirmar':short.startsWith('no ')?'no está '+short.slice(3):'está '+short;
 return {noun:slot.noun,full:slot.noun+' '+predicate,bare:slot.noun.replace(/^(el|la) /u,'')+' '+short,short,predicate};
}
function organizationOf(mold){
 const m=mold.split(':')[1];
 const order=['TARGET_FOCUS','RESULT_BECAUSE','RESULT_REASON','RESULT_SEQUENCE','REALITY_SPLIT','REALITY_JOIN','REALITY_FOCUS','TARGET_SPLIT_FOCUS','BARE_CORRECTION','ALTHOUGH_JOIN','EXPLICIT_RESERVATION','BARE_RESERVATION'].includes(m)?'target-source':'source-target';
 const compression=['BARE_TAIL','BARE_CAUSE','BARE_CORRECTION','BARE_CHANGE','BARE_THEN'].includes(m)?'both-compact':['MIXED_FOCUS','BARE_RESERVATION'].includes(m)?'one-compact':'full';
 const subordination=['CONTRAST_SUBORDINATE','CAUSAL_FRONT'].includes(m)?'source-subordinate-first':['RESULT_BECAUSE','RESULT_REASON'].includes(m)?'source-explanation-last':['ALTHOUGH_JOIN','BARE_RESERVATION'].includes(m)?'source-reservation-last':'parallel';
 const focus=['TARGET_FOCUS','MIXED_FOCUS','SOURCE_FOCUS','TARGET_SPLIT_FOCUS','REALITY_FOCUS'].includes(m)?'topic-predicate':'ordinary';
 return freeze({claimOrder:order,compression,subordination,focus});
}
/** Input is an immutable REALIZED R3 utterance, not an unvalidated caller payload. */
function renderVoiceR4(p,voice,n){
 const r=p.semanticRelations[0],selected=voice.discourseRules[n][r.kind];
 let mold=selected;
 const scoped=p.questionContext?.queries.length===2;
 const a=p.propositions.find(c=>key(c)===key(r.source)),b=p.propositions.find(c=>key(c)===key(r.target));
 if(!a||!b)fail('A075B1_R4_VERIFIED_CLAIMS_REQUIRED');
 if(!scoped&&['R4:BARE_TAIL','R4:BARE_CAUSE','R4:BARE_CORRECTION','R4:MIXED_FOCUS'].includes(mold))mold='R3:'+({CONTRASTS_WITH:'BUT_SPLIT',CAUSES:'CAUSE_SPLIT',CORRECTS:'REALITY_SPLIT'}[r.kind]);
 if(mold==='R4:RESULT_SEQUENCE'&&!(a.kind==='TASK_STATE'&&b.kind==='TASK_STATE'&&a.state==='COMPLETED'&&b.state==='COMPLETED'))mold='R3:FIRST_THEN';
 if(mold.startsWith('R3:'))return freeze({text:renderContextual(p,{richRules:[{[r.kind]:mold.slice(3)}]},0),mold,organization:organizationOf(mold)});
 if(!R4_MOLDS[r.kind]?.includes(mold.slice(3)))fail('A075B1_R4_MOLD');
 const x=phrases(a),y=phrases(b);let text;
 switch(mold.slice(3)){
  case 'TARGET_FOCUS':text=`${cap(y.full)}; ${x.noun}, en cambio, ${x.predicate}.`;break;
  case 'BARE_TAIL':text=`${cap(x.bare)}; ${y.bare}, en cambio.`;break;
  case 'CONTRAST_SUBORDINATE':text=`Aunque ${x.full}, ${y.full}.`;break;
  case 'MIXED_FOCUS':text=`${cap(x.full)}; ${y.noun}, en cambio, ${y.short}.`;break;
  case 'BARE_CAUSE':text=`${cap(x.bare)}; por eso, ${y.bare}.`;break;
  case 'CAUSAL_FRONT':text=`Como ${x.full}, ${y.full}.`;break;
  case 'RESULT_REASON':text=`${cap(y.full)}. La razón es que ${x.full}.`;break;
  case 'SOURCE_PREFIX_JOIN':text=`En realidad, ${x.full}; ${y.full}.`;break;
  case 'SOURCE_PREFIX_SPLIT':text=`En realidad, ${x.full}. ${cap(y.full)}.`;break;
  case 'SOURCE_FOCUS':text=`${cap(x.noun)}, en realidad, ${x.predicate}; ${y.full}.`;break;
  case 'TARGET_SPLIT_FOCUS':text=`${cap(y.full)}. ${cap(x.noun)}, en realidad, ${x.predicate}.`;break;
  case 'BARE_CORRECTION':text=`${cap(y.bare)}; ${x.bare}, en realidad.`;break;
  case 'RESERVATION_FIRST':text=`${cap(x.full)}. ${cap(y.full)}, con esa salvedad.`;break;
  case 'RESULT_SEQUENCE':text=`${cap(y.full)}; ${x.noun} terminó antes.`;break;
  default:fail('A075B1_R4_MOLD');
 }
 return freeze({text,mold,organization:organizationOf(mold)});
}
// Independent closed lexical decoder. It receives no expected facts, link or profile.
function atom(raw,q){
 const text=raw.toLowerCase(),found=[];
 for(const [subject,s]of Object.entries(SUBJECTS))for(const [state,forms]of Object.entries(STATES[s.kind])){
  const adjective=forms[s.gender==='f'?1:0],predicates=[adjective.startsWith('no ')?'no está '+adjective.slice(3):'está '+adjective];
  if(s.kind==='TASK_STATE')predicates.push(state==='COMPLETED'?'ha terminado':'queda pendiente');
  if(s.kind==='OBSERVATION_STATE')predicates.push(state==='VISIBLE'?'se ve':'no se ve');
  if(s.kind==='UNCERTAINTY_STATE'&&state==='UNCONFIRMED')predicates.push('está sin confirmar');
  const full=predicates.some(p=>text===s.noun+' '+p);
  const compact=q?.queries.length===2&&q.queries.some(r=>r.subject===subject&&r.kind===s.kind)&&[s.noun+' '+adjective,s.noun.replace(/^(el|la) /u,'')+' '+adjective].includes(text);
  if(full||compact)found.push({kind:s.kind,subject,state});
 }
 return found.length===1?found[0]:null;
}
function auditVoiceR4(text,raw){
 const bad=()=>freeze({valid:false,claims:[],relations:[],speechAct:null});let c;
 try{c=copy(raw);exact(c,['speechFrame','questionContext']);}catch{return bad();}
 const ordinary=auditContextualText(text,c);if(ordinary.valid)return ordinary;
 if(typeof text!=='string'||text.length>240||!text.endsWith('.')||!['STATUS_REPLY','LIMITED_CONFIRMATION'].includes(c.speechFrame))return bad();
 const q=c.questionContext;
 try{if(q!==null){exact(q,['form','queries']);if(!['STATUS_QUERY','DIRECT_REQUEST'].includes(q.form)||!Array.isArray(q.queries)||q.queries.length!==2)return bad();for(const r of q.queries){exact(r,['kind','subject']);if(SUBJECTS[r.subject]?.kind!==r.kind)return bad();}if(key(q.queries[0])===key(q.queries[1]))return bad();}}catch{return bad();}
 const t=text.slice(0,-1),candidates=[];
 function accept(left,right,kind,reverse=false,sequence=false){
  const a=atom(left,q),b=atom(right,q);if(!a||!b||a.subject===b.subject)return;
  if(sequence&&!(a.kind==='TASK_STATE'&&b.kind==='TASK_STATE'&&a.state==='COMPLETED'&&b.state==='COMPLETED'))return;
  const relation={kind,source:ref(reverse?b:a),target:ref(reverse?a:b)};let claims=[a,b];
  if(q!==null){if(q.queries.some(r=>!claims.some(p=>key(p)===key(r))))return;claims=q.queries.map(r=>claims.find(p=>key(p)===key(r)));}
  if(c.speechFrame==='LIMITED_CONFIRMATION'&&!claims.some(p=>p.kind==='UNCERTAINTY_STATE'))return;
  try{validateSemanticRelations({propositions:claims,semanticRelations:[relation],speechFrame:c.speechFrame});}catch{return;}
  candidates.push({claims,relations:[relation]});
 }
 let m;
 if((m=t.match(/^(.+); ((?:el|la) .+), en cambio, (.+)$/iu))){
  const second=m[2]+' '+m[3];
  // Predicate focus = target first; adjective-only focus = source first.
  if(/^(?:está |no está |ha terminado|queda pendiente|se ve|no se ve)/u.test(m[3]))accept(m[1],second,'CONTRASTS_WITH',true);
  else accept(m[1],second,'CONTRASTS_WITH');
 }
 if((m=t.match(/^(.+); (.+), en cambio$/u)))accept(m[1],m[2],'CONTRASTS_WITH');
 if((m=t.match(/^Aunque (.+), (.+)$/u)))accept(m[1],m[2],'CONTRASTS_WITH');
 if((m=t.match(/^(.+); por eso, (.+)$/u)))accept(m[1],m[2],'CAUSES');
 if((m=t.match(/^Como (.+), (.+)$/u)))accept(m[1],m[2],'CAUSES');
 if((m=t.match(/^(.+)\. La razón es que (.+)$/u)))accept(m[1],m[2],'CAUSES',true);
 for(const re of [/^En realidad, (.+); (.+)$/u,/^En realidad, (.+)\. (.+)$/u])if((m=t.match(re)))accept(m[1],m[2],'CORRECTS');
 if((m=t.match(/^((?:El|La) .+), en realidad, (.+); (.+)$/u)))accept(m[1]+' '+m[2],m[3],'CORRECTS');
 if((m=t.match(/^(.+)\. ((?:El|La) .+), en realidad, (.+)$/u)))accept(m[1],m[2]+' '+m[3],'CORRECTS',true);
 if((m=t.match(/^(.+); (.+), en realidad$/u)))accept(m[1],m[2],'CORRECTS',true);
 if((m=t.match(/^(.+)\. (.+), con esa salvedad$/u)))accept(m[1],m[2],'QUALIFIES');
 if((m=t.match(/^(.+); ((?:el|la) .+) terminó antes$/u)))accept(m[1],m[2]+' ha terminado','SEQUENCE_BEFORE',true,true);
 const distinct=new Map(candidates.map(x=>[JSON.stringify(x),x]));if(distinct.size!==1)return bad();
 return freeze({valid:true,...copy([...distinct.values()][0]),speechAct:'ASSERT'});
}

export { R4_MOLDS, auditVoiceR4, organizationOf, renderVoiceR4 };
