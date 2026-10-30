import { freeze, exact, fail, copy } from '../a07/safe-data.js';
import { SUBJECTS, STATES } from './grammar.js';
import { renderNatural, auditNaturalText } from './natural-language-r2.js';

/** Closed R3 semantic links. Hypothetical QA only until a verified producer exists. */
const SEMANTIC_RELATIONS_R3=freeze(['CONTRASTS_WITH','CAUSES','SEQUENCE_BEFORE','CORRECTS','QUALIFIES']);
const RICH_MOLDS_R3=freeze({
 CONTRASTS_WITH:['BUT_SPLIT','BUT_JOIN','CHANGE_JOIN','BARE_CHANGE'],
 CAUSES:['CAUSE_SPLIT','CAUSE_JOIN','RESULT_BECAUSE','ORAL_RESULT'],
 SEQUENCE_BEFORE:['SEQUENCE_SPLIT','SEQUENCE_JOIN','FIRST_THEN','BARE_THEN'],
 CORRECTS:['REALITY_SPLIT','REALITY_JOIN','REALITY_FOCUS'],
 QUALIFIES:['ALTHOUGH_JOIN','EXPLICIT_RESERVATION','BARE_RESERVATION']
});
const cap=x=>x[0].toUpperCase()+x.slice(1),ref=p=>({kind:p.kind,subject:p.subject}),refKey=r=>r.kind+':'+r.subject;
function relationKey(r){return JSON.stringify([r.kind,refKey(r.source),refKey(r.target)]);}
function checkedRef(raw){exact(raw,['kind','subject']);if(SUBJECTS[raw.subject]?.kind!==raw.kind)fail('A075B1_R3_RELATION_REF');return raw;}
function validateSemanticRelations(p){
 if(!Array.isArray(p.semanticRelations)||p.semanticRelations.length>1)fail('A075B1_R3_RELATION_BOUND');
 for(const r of p.semanticRelations){
  exact(r,['kind','source','target']);if(!SEMANTIC_RELATIONS_R3.includes(r.kind))fail('A075B1_R3_RELATION_KIND');checkedRef(r.source);checkedRef(r.target);
  if(p.propositions.length!==2||refKey(r.source)===refKey(r.target)||![r.source,r.target].every(x=>p.propositions.some(c=>refKey(c)===refKey(x))))fail('A075B1_R3_RELATION_SCOPE');
  if(p.speechFrame==='WITHHOLD'||p.speechFrame==='DIRECT_ANSWER')fail('A075B1_R3_RELATION_FRAME');
  if(r.kind==='QUALIFIES'&&!p.propositions.some(c=>refKey(c)===refKey(r.source)&&c.kind==='UNCERTAINTY_STATE'))fail('A075B1_R3_EXPLICIT_CERTAINTY_REQUIRED');
 }
}
function lexical(p){
 const s=SUBJECTS[p.subject],a=STATES[p.kind][p.state][s.gender==='f'?1:0];
 if(p.kind==='OBSERVATION_STATE')return {predicate:p.state==='VISIBLE'?'se ve':'no se ve',short:a};
 if(p.kind==='UNCERTAINTY_STATE'&&p.state==='UNCONFIRMED')return {predicate:'está sin confirmar',short:'sin confirmar'};
 if(p.kind==='TASK_STATE')return {predicate:p.state==='COMPLETED'?'ha terminado':'queda pendiente',short:a};
 return {predicate:a.startsWith('no ')?'no está '+a.slice(3):'está '+a,short:a};
}
const full=p=>SUBJECTS[p.subject].noun+' '+lexical(p).predicate;
const bare=p=>SUBJECTS[p.subject].noun.replace(/^(?:el|la) /u,'')+' '+lexical(p).short;
/** Each mold expresses the supplied link; no unmarked cause or implied advice. */
function renderContextual(p,voice,n){
 if(!p.semanticRelations.length)return renderNatural(p,voice.simpleRules[n],n);
 const r=p.semanticRelations[0],from=p.propositions.find(c=>refKey(c)===refKey(r.source)),to=p.propositions.find(c=>refKey(c)===refKey(r.target)),m=voice.richRules[n][r.kind];
 if(!RICH_MOLDS_R3[r.kind]?.includes(m))fail('A075B1_R3_RICH_MOLD');
 const scoped=p.questionContext?.queries.length===2;
 const a=cap(full(from)),b=full(to),first=cap(full(to)),second=full(from);
 switch(m){
  case 'BUT_SPLIT':return `${a}. Pero ${b}.`;
  case 'BUT_JOIN':return `${a}, pero ${b}.`;
  case 'CHANGE_JOIN':return `${a}; en cambio, ${b}.`;
  case 'BARE_CHANGE':return scoped?`${cap(bare(from))}; en cambio, ${bare(to)}.`:`${a}; en cambio, ${b}.`;
  case 'CAUSE_SPLIT':return `${a}. Por eso ${b}.`;
  case 'CAUSE_JOIN':return `${a}, por eso ${b}.`;
  case 'RESULT_BECAUSE':return `${first} porque ${second}.`;
  case 'ORAL_RESULT':return `${a}, así que ${b}.`;
  case 'SEQUENCE_SPLIT':return `${a}. Después, ${b}.`;
  case 'SEQUENCE_JOIN':return `${a}, y después ${b}.`;
  case 'FIRST_THEN':return `Primero, ${full(from)}; después, ${b}.`;
  case 'BARE_THEN':return scoped?`${cap(bare(from))}; después, ${bare(to)}.`:`${a}; después, ${b}.`;
  // CORRECTS is an explicitly authorized corrective discourse link, not a retraction
  // of its still-asserted anchor or an invented account of someone previously speaking.
  case 'REALITY_SPLIT':return `${first}. En realidad, ${second}.`;
  case 'REALITY_JOIN':return `${first}; en realidad, ${second}.`;
  case 'REALITY_FOCUS':return `${first}; ${SUBJECTS[from.subject].noun}, en realidad, ${lexical(from).predicate}.`;
  case 'ALTHOUGH_JOIN':return `${first}, aunque ${second}.`;
  case 'EXPLICIT_RESERVATION':return `${first}, con una salvedad: ${second}.`;
  case 'BARE_RESERVATION':return scoped?`${cap(bare(to))}, aunque ${second}.`:`${first}, aunque ${second}.`;
  default:fail('A075B1_R3_RICH_MOLD');
 }
}
function decodeClause(text,q){
 const s=text[0]?.toUpperCase()+text.slice(1),a=auditNaturalText(s+'.',{speechFrame:'STATUS_REPLY',questionContext:null});
 if(a.valid&&a.claims.length===1)return a.claims[0];
 for(const [subject,slot]of Object.entries(SUBJECTS))if(slot.kind==='TASK_STATE'){
  for(const [state,verb]of [['COMPLETED','ha terminado'],['PENDING','queda pendiente']])if(text.toLowerCase()===slot.noun+' '+verb)return {kind:'TASK_STATE',subject,state};
 }
 // Bare nouns require both explicit question targets. No general subject-free ellipsis.
 if(q?.form!=='STATUS_QUERY'&&q?.form!=='DIRECT_REQUEST')return null;
 if(q.queries.length!==2)return null;
 const candidates=[];
 for(const target of q.queries){const noun=SUBJECTS[target.subject]?.noun;if(!noun||SUBJECTS[target.subject].kind!==target.kind)continue;
  for(const [state,forms]of Object.entries(STATES[target.kind])){
   const short=forms[SUBJECTS[target.subject].gender==='f'?1:0],variants=[short];if(target.kind==='UNCERTAINTY_STATE'&&state==='UNCONFIRMED')variants.push('sin confirmar');
   if(variants.some(v=>text.toLowerCase()===noun.replace(/^(?:el|la) /u,'')+' '+v))candidates.push({kind:target.kind,subject:target.subject,state});
  }
 }
 return candidates.length===1?candidates[0]:null;
}
/** Independent surface decoder. No factual payload, expected link, profile or renderer. */
function auditContextualText(text,raw){
 const bad=()=>freeze({valid:false,claims:[],relations:[],speechAct:null});let context;
 try{context=copy(raw);exact(context,['speechFrame','questionContext']);}catch{return bad();}
 const ordinary=auditNaturalText(text,context);if(ordinary.valid)return freeze({...ordinary,relations:[]});
 if(typeof text!=='string'||text.length>240||!text.endsWith('.')||!['STATUS_REPLY','LIMITED_CONFIRMATION'].includes(context.speechFrame))return bad();
 // Use the existing strict context validator independently of any input facts.
 const q=context.questionContext;
 try{if(q!==null){exact(q,['form','queries']);if(!['STATUS_QUERY','DIRECT_REQUEST'].includes(q.form)||!Array.isArray(q.queries)||q.queries.length!==2)return bad();q.queries.forEach(checkedRef);if(refKey(q.queries[0])===refKey(q.queries[1]))return bad();}}catch{return bad();}
 const textBody=text.slice(0,-1),candidates=[];
 function accept(left,right,kind,reverse=false){
  const a=decodeClause(left,q),b=decodeClause(right,q);if(!a||!b||a.subject===b.subject)return;
  const source=ref(reverse?b:a),target=ref(reverse?a:b);
  if(kind==='QUALIFIES'&&(reverse?b:a).kind!=='UNCERTAINTY_STATE')return;
  let claims=[a,b];
  if(q!==null){if(q.queries.some(t=>!claims.some(c=>refKey(c)===refKey(t))))return;claims=q.queries.map(t=>claims.find(c=>refKey(c)===refKey(t)));}
  if(context.speechFrame==='LIMITED_CONFIRMATION'&&!claims.some(c=>c.kind==='UNCERTAINTY_STATE'))return;
  candidates.push({claims,relations:[{kind,source,target}]});
 }
 // Marker grammar defined separately from the renderer; ambiguity is rejected.
 for(const [separator,kind,reverse]of [
  [', pero ','CONTRASTS_WITH',false],['. Pero ','CONTRASTS_WITH',false],['; en cambio, ','CONTRASTS_WITH',false],
  [', por eso ','CAUSES',false],['. Por eso ','CAUSES',false],[' porque ','CAUSES',true],[', así que ','CAUSES',false],
  ['. Después, ','SEQUENCE_BEFORE',false],[', y después ','SEQUENCE_BEFORE',false],['; después, ','SEQUENCE_BEFORE',false],
  ['. En realidad, ','CORRECTS',true],['; en realidad, ','CORRECTS',true],
  [', aunque ','QUALIFIES',true],[', con una salvedad: ','QUALIFIES',true]
 ]){
  const at=textBody.indexOf(separator);if(at<0||textBody.indexOf(separator,at+separator.length)>=0)continue;
  let left=textBody.slice(0,at);if(kind==='SEQUENCE_BEFORE'&&left.startsWith('Primero, '))left=left.slice(9);
  accept(left,textBody.slice(at+separator.length),kind,reverse);
 }
 const focus=textBody.match(/^(.+); (el .+|la .+), en realidad, (.+)$/u);
 if(focus)accept(focus[1],focus[2]+' '+focus[3],'CORRECTS',true);
 const distinct=new Map(candidates.map(x=>[JSON.stringify(x),x]));if(distinct.size!==1)return bad();
 return freeze({valid:true,...copy([...distinct.values()][0]),speechAct:'ASSERT'});
}

export { RICH_MOLDS_R3, SEMANTIC_RELATIONS_R3, auditContextualText, relationKey, renderContextual, validateSemanticRelations };
