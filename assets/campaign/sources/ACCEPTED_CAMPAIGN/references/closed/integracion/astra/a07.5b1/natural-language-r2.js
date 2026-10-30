import { freeze, fail, exact, copy } from '../a07/safe-data.js';
import { proposition, SUBJECTS, STATES } from './grammar.js';

/** R2 closed conversation language. No world bindings or unverified question text. */
const SPEECH_FRAMES=freeze(['DIRECT_ANSWER','STATUS_REPLY','LIMITED_CONFIRMATION','WITHHOLD']);
const QUESTION_FORMS=freeze(['YES_NO','STATUS_QUERY','DIRECT_REQUEST']);
const WHOLE_FAMILIES=freeze(['BRIEF','CLIPPED','ORAL','PLAIN','FORMAL','ECHO','PREDICATE','DISTINGUISH']);
const NATURAL_REFUSALS=freeze({
 SHORT:['Eso no.','No hablaré de eso.','De eso no.','No.'],
 PLAIN:['No voy a hablar de eso.','Prefiero no responder.','De eso prefiero no hablar.','No voy a entrar en eso.'],
 FORMAL:['Prefiero no tratar ese asunto.','No entraré en ese asunto.','No hablaré de ese asunto.','Prefiero no responder a eso.'],
 RESERVED:['Prefiero no hablar de eso.','No voy a entrar en ese asunto.','Prefiero no responder.','De eso no voy a hablar.'],
 EVERYDAY:['Eso no te lo voy a responder.','De eso no voy a hablar.','No, de eso no.','Prefiero no hablar de eso.']
});
function validateSpeechContext(p,i){
 if(!SPEECH_FRAMES.includes(p.speechFrame))fail('A075B1_R2_SPEECH_FRAME');
 const q=p.questionContext;
 if(q!==null){
  exact(q,['form','queries']);
  if(!QUESTION_FORMS.includes(q.form)||!Array.isArray(q.queries)||q.queries.length>2)fail('A075B1_R2_QUESTION_FORM');
  for(const query of q.queries){
   if(q.form==='YES_NO')proposition(query);
   else {exact(query,['kind','subject']);if(SUBJECTS[query.subject]?.kind!==query.kind)fail('A075B1_R2_QUESTION_SUBJECT');}
  }
 }
 if(i.intentKind==='REFUSE'){
  if(p.speechFrame!=='WITHHOLD'||(q!==null&&(q.form!=='DIRECT_REQUEST'||q.queries.length)))fail('A075B1_R2_WITHHOLD_SCOPE');
  return;
 }
 if(p.speechFrame==='WITHHOLD')fail('A075B1_R2_FRAME_INTENT');
 if(i.intentKind==='INFORM'&&(q!==null||p.speechFrame==='DIRECT_ANSWER'))fail('A075B1_R2_INFORM_QUESTION');
 if(q!==null){
  if(i.intentKind!=='RESPOND'||i.reasonBasis.motive!=='DIRECT_REQUEST')fail('A075B1_R2_QUESTION_MOTIVE');
  if(q.queries.length!==p.propositions.length||q.queries.some((x,n)=>x.kind!==p.propositions[n].kind||x.subject!==p.propositions[n].subject))fail('A075B1_R2_QUESTION_SCOPE');
  if(q.form==='YES_NO'&&q.queries.length!==1)fail('A075B1_R2_YES_NO_BOUND');
 }
 if(p.speechFrame==='DIRECT_ANSWER'&&(q===null||!['YES_NO','DIRECT_REQUEST'].includes(q.form)||p.propositions.length!==1))fail('A075B1_R2_DIRECT_ANSWER_CONTEXT');
 if(p.speechFrame==='STATUS_REPLY'&&q?.form==='YES_NO')fail('A075B1_R2_STATUS_FRAME');
 if(p.speechFrame==='LIMITED_CONFIRMATION'&&!p.propositions.some(x=>x.kind==='UNCERTAINTY_STATE'))fail('A075B1_R2_UNCERTAINTY_NOT_IN_PAYLOAD');
}
const cap=x=>x[0].toUpperCase()+x.slice(1);
const positive=p=>['OPEN','READY','AVAILABLE','COMPLETED','VISIBLE','CONFIRMED'].includes(p.state);
function words(p){
 const s=SUBJECTS[p.subject],a=STATES[p.kind][p.state][s.gender==='f'?1:0];
 if(p.kind==='UNCERTAINTY_STATE'&&p.state==='UNCONFIRMED')return {predicate:'está sin confirmar',short:'sin confirmar'};
 if(p.kind==='OBSERVATION_STATE')return {predicate:p.state==='VISIBLE'?'se ve':'no se ve',short:a};
 return {predicate:a.startsWith('no ')?'no está '+a.slice(3):'está '+a,short:a};
}
const named=p=>SUBJECTS[p.subject].noun+' '+words(p).predicate;
const front=p=>words(p).predicate+' '+SUBJECTS[p.subject].noun;
/** Complete authored utterance molds; no lead/order/ending/join cross product. */
function renderNatural(p,rule,n){
 if(p.speechFrame==='WITHHOLD'){
  const lines=NATURAL_REFUSALS[rule.refusal];if(!lines||!Number.isInteger(n)||n<0||n>3)fail('A075B1_R2_REFUSAL_RULE');return lines[n];
 }
 const props=p.propositions.map(proposition),family=props.length===2?rule.two:props[0]?.kind==='UNCERTAINTY_STATE'?rule.uncertainty:rule.single;
 if(!WHOLE_FAMILIES.includes(family)||props.length<1||props.length>2)fail('A075B1_R2_WHOLE_RULE');
 if(props.length===2){
  const [a,b]=props;
  // These are whole two-claim molds. They never explain, advise or invent a third claim.
  if(family==='ORAL'||family==='PLAIN'||family==='ECHO')return `${cap(named(a))} y ${named(b)}.`;
  if(family==='FORMAL')return `${cap(named(a))}; ${named(b)}.`;
  if(family==='PREDICATE')return `${cap(front(a))}. ${cap(named(b))}.`;
  if(family==='DISTINGUISH'){
   const second=!positive(a)&&positive(b)&&!words(b).predicate.startsWith('se ve')?SUBJECTS[b.subject].noun+' sí '+words(b).predicate:named(b);
   return `${cap(named(a))}; ${second}.`;
  }
  return `${cap(named(a))}. ${cap(named(b))}.`;
 }
 const a=props[0],q=p.questionContext,hasReferent=q?.queries.length===1,yesNo=q?.form==='YES_NO';
 const answer=yesNo?(a.state===q.queries[0].state?'Sí':'No'):null;
 const w=words(a),negative=w.predicate.startsWith('no ');
 // An unasked INFORM always names its subject. A question never supplies knowledge.
 if(!hasReferent)return cap(family==='PREDICATE'?front(a):named(a))+'.';
 if(a.kind==='UNCERTAINTY_STATE'&&a.state==='UNCONFIRMED'){
  if(family==='BRIEF')return 'No está confirmado.';
  if(family==='CLIPPED')return 'Sin confirmar.';
  if(family==='ORAL')return 'Está sin confirmar.';
  if(family==='PREDICATE')return cap(named(a))+'.';
 }
 if(family==='BRIEF')return answer&&!(answer==='No'&&negative)?`${answer}. ${cap(w.predicate)}.`:cap(w.predicate)+'.';
 if(family==='CLIPPED'){
  if(a.kind==='OBSERVATION_STATE'||w.short.startsWith('no '))return cap(w.predicate)+'.';
  return answer?`${answer}, ${w.short}.`:cap(w.short)+'.';
 }
 if(family==='ORAL')return answer&&!(answer==='No'&&negative)?`${answer}, ${w.predicate}.`:cap(w.predicate)+'.';
 if(family==='ECHO')return `¿${cap(SUBJECTS[a.subject].noun)}? `+(answer&&!(answer==='No'&&negative)?`${answer.toLowerCase()}, ${w.predicate}.`:cap(w.predicate)+'.');
 if(family==='PREDICATE')return (answer?answer+', ':'')+(answer?front(a):cap(front(a)))+'.';
 if(family==='FORMAL')return (answer?answer+'. ':'')+cap(named(a))+'.';
 // Careful voices do not pad a simple fact with artificial caution.
 return (answer?answer+', ':'')+(answer?named(a):cap(named(a)))+'.';
}
function decodeAtom(text,q,allowEllipsis){
 const t=text[0]?.toLowerCase()+text.slice(1),matches=[];
 for(const [subject,s]of Object.entries(SUBJECTS))for(const [state,forms]of Object.entries(STATES[s.kind])){
  const a=forms[s.gender==='f'?1:0],negative=a.startsWith('no '),basic=negative?'no está '+a.slice(3):'está '+a;
  const predicates=[basic];if(s.kind==='UNCERTAINTY_STATE'&&state==='UNCONFIRMED')predicates.push('está sin confirmar');
  if(s.kind==='OBSERVATION_STATE')predicates.push(state==='VISIBLE'?'se ve':'no se ve');
  const explicit=predicates.flatMap(v=>[s.noun+' '+v,v+' '+s.noun]);
  const emphasis=positive({state})?predicates.map(v=>s.noun+' sí '+v):[];
  const contextual=allowEllipsis&&q?.queries.length===1&&q.queries[0].subject===subject&&q.queries[0].kind===s.kind;
  const clipped=[a,...(s.kind==='UNCERTAINTY_STATE'&&state==='UNCONFIRMED'?['sin confirmar']:[])];
  if(explicit.includes(t)||emphasis.includes(t)||(contextual&&(predicates.includes(t)||clipped.includes(t))))matches.push({claim:{kind:s.kind,subject,state},emphasis:emphasis.includes(t)});
 }
 return matches.length===1?matches[0]:null;
}
/** Independent decoder uses the verified question referent, never input semanticClaims. */
function auditNaturalText(text,raw){
 const bad=()=>freeze({valid:false,claims:[],speechAct:null});
 let speechFrame,questionContext;
 try{
  const c=copy(raw);exact(c,['speechFrame','questionContext']);({speechFrame,questionContext}=c);
  if(questionContext!==null){exact(questionContext,['form','queries']);if(!QUESTION_FORMS.includes(questionContext.form)||!Array.isArray(questionContext.queries)||questionContext.queries.length>2)return bad();for(const q of questionContext.queries){if(questionContext.form==='YES_NO')proposition(q);else {exact(q,['kind','subject']);if(SUBJECTS[q.subject]?.kind!==q.kind)return bad();}}}
 }catch{return bad();}
 if(questionContext?.form==='YES_NO'&&questionContext.queries.length!==1)return bad();
 if(typeof text!=='string'||text.length>240||!SPEECH_FRAMES.includes(speechFrame))return bad();
 if(speechFrame==='WITHHOLD')return (questionContext===null||(questionContext.form==='DIRECT_REQUEST'&&!questionContext.queries.length))&&Object.values(NATURAL_REFUSALS).flat().includes(text)?freeze({valid:true,claims:[],speechAct:'REFUSE'}):bad();
 let t=text,answer=null;
 if(t.startsWith('¿')){
  const end=t.indexOf('? ');if(end<0||questionContext?.queries.length!==1)return bad();
  const subject=questionContext.queries[0].subject;if(t.slice(1,end)!==cap(SUBJECTS[subject]?.noun??''))return bad();t=t.slice(end+2);
 }
 const mark=t.match(/^(Sí|No|sí|no)(?:\. |, )/);
 if(mark){if(questionContext?.form!=='YES_NO')return bad();answer=mark[1].toLowerCase()==='sí';t=t.slice(mark[0].length);}
 if(!t.endsWith('.'))return bad();t=t.slice(0,-1);
 const single=decodeAtom(t,questionContext,true);
 let claims;
 if(single&&!single.emphasis)claims=[single.claim];
 else {
  if(answer!==null)return bad();const found=[];
  for(const separator of ['. ','; ',' y ']){let at=t.indexOf(separator);while(at!==-1){const a=decodeAtom(t.slice(0,at),null,false),b=decodeAtom(t.slice(at+separator.length),null,false);if(a&&b&&a.claim.subject!==b.claim.subject&&!a.emphasis&&(!b.emphasis||(!positive(a.claim)&&positive(b.claim))))found.push([a.claim,b.claim]);at=t.indexOf(separator,at+1);}}
  const unique=new Map(found.map(c=>[JSON.stringify(c),c]));if(unique.size!==1)return bad();claims=[...unique.values()][0];
 }
 if(answer!==null&&(claims.length!==1||answer!==(claims[0].state===questionContext.queries[0].state)))return bad();
 if(questionContext!==null&&(questionContext.queries.length!==claims.length||questionContext.queries.some((q,n)=>q.kind!==claims[n].kind||q.subject!==claims[n].subject)))return bad();
 if(speechFrame==='DIRECT_ANSWER'&&(questionContext===null||claims.length!==1||!['YES_NO','DIRECT_REQUEST'].includes(questionContext.form)))return bad();
 if(speechFrame==='STATUS_REPLY'&&questionContext?.form==='YES_NO')return bad();
 if(speechFrame==='LIMITED_CONFIRMATION'&&!claims.some(c=>c.kind==='UNCERTAINTY_STATE'))return bad();
 return freeze({valid:true,claims:copy(claims),speechAct:'ASSERT'});
}

export { NATURAL_REFUSALS, QUESTION_FORMS, SPEECH_FRAMES, WHOLE_FAMILIES, auditNaturalText, renderNatural, validateSpeechContext };
