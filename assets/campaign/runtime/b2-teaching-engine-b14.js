import { fail, freeze } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07/safe-data.js';
import { BANK_SOURCE, BANK } from './b2-teaching-bank.js';
import { requireLearningSnapshot, requireLearningScope, validateScopedIds, PRIMARY } from './b2-player-learning-b14.js';

const ports=new WeakSet();
function requireTeachingPort(p){if(!ports.has(p))fail('B12_TEACHING_PORT_NOT_AUTHENTIC');return p;}
function createTeachingEngine({readContext,getLearning}){
 if(typeof readContext!=='function'||typeof getLearning!=='function')fail('B12_TEACHING_PRIVATE_PORT');
 let session=null,sequence=0,lastReceipt=null,issued=0,commits=0,questionNonce=0;
 const sessions=new WeakMap(),questions=new WeakMap(),completions=new WeakMap();
 const fingerprint=c=>JSON.stringify({generation:c.generation,revision:c.revision,root:c.root,stage:c.stage,roomId:c.roomId,stamp:c.stamp});
 function context(){const c=readContext();if(!c||c.status!=='ALLOW'||c.actorId!=='player'||c.teacherId!=='shen_baojun')fail('B12_CONTEXT_UNAVAILABLE');
  const k=requireLearningSnapshot(requireLearningScope(getLearning()).capture());validateScopedIds(c.root,c.knownIds);
  if(k.status!=='READY'||k.actorId!==c.actorId||k.generation!==c.generation||k.knowledgeRevision!==c.revision||JSON.stringify(k.knownIds)!==JSON.stringify(c.knownIds))fail('B14_CONTEXT_LEARNING_MISMATCH');return c;}
 function eligible(c,l){return !!l&&(!l.defensive||['LianQi_II','LianQi_III','LianQi_IV'].includes(c.stage))&&!c.knownIds.includes(l.techniqueId)&&(c.knownIds.includes(PRIMARY[c.root])||(!c.knownIds.length&&PRIMARY[c.root]===l.techniqueId));}
 function current(s){
  if(!s||session!==s||!['ACTIVE','COMPLETE','COMMITTING'].includes(s.state))fail('B12_SESSION_NOT_CURRENT');
  const c=context();if(fingerprint(c)!==s.fingerprint||!eligible(c,s.lesson))fail('B12_TEACHING_STALE');return c;
 }
 function lookup(cap){const s=sessions.get(cap);current(s);return s;}
 function cancel(){if(session&&session.state!=='COMMITTING')session.state='CANCELLED';if(session?.state!=='COMMITTING')session=null;}
 const api=Object.freeze({
  canBegin(lessonId){try{const c=context(),l=BANK.find(l=>l.lessonId===lessonId);return eligible(c,l);}catch{return false;}},
  begin(lessonId){
   cancel();const c=context(),lesson=BANK.find(l=>l.lessonId===lessonId);
   if(!eligible(c,lesson))fail('B14_UNKNOWN_ELIGIBLE_LESSON_REQUIRED');
   const cap=Object.freeze({});session={id:++sequence,cap,lesson,state:'ACTIVE',fingerprint:fingerprint(c),generation:c.generation,revision:c.revision,evidences:[],step:0};sessions.set(cap,session);return cap;
  },
  question(cap){
   const s=lookup(cap);if(s.state!=='ACTIVE')fail('B12_NOT_A_CHECKPOINT');
   const ev=s.lesson.evidence[s.step],q=Object.freeze({});questions.set(q,{s,step:s.step,nonce:++questionNonce,used:false});s.activeQuestion=q;
   return q;
  },
  describeQuestion(cap,qcap){
   const s=lookup(cap),q=questions.get(qcap);if(!q||q.used||q.s!==s||q.step!==s.step||s.activeQuestion!==qcap)fail('B12_QUESTION_NOT_AUTHENTIC');
   const e=s.lesson.evidence[s.step];
   return freeze({lessonId:s.lesson.lessonId,techniqueId:s.lesson.techniqueId,checkpoint:s.step+1,evidenceId:e.id,demonstration:s.step===0?s.lesson.demonstration:null,scene:e.scene,options:e.options.map(o=>({...o})),source:BANK_SOURCE});
  },
  answer(cap,qcap,optionId){
   const s=lookup(cap),q=questions.get(qcap);if(!q||q.used||q.s!==s||q.step!==s.step||s.activeQuestion!==qcap||s.state!=='ACTIVE')fail('B12_OLD_CHECKPOINT');
   const e=s.lesson.evidence[s.step];if(!e.options.some(o=>o.id===optionId))fail('B12_OPTION_NOT_AUTHORIZED');q.used=true;
   if(optionId!==e.accepted)return freeze({status:'RETRY',feedback:e.feedback});
   s.evidences.push(Object.freeze({id:e.id,optionId,nonce:q.nonce}));
   s.step++;
   if(s.step<2)return freeze({status:'NEXT'});
   if(s.evidences.length!==2||s.evidences.some((v,i)=>v.id!==s.lesson.evidence[i].id||v.optionId!==s.lesson.evidence[i].accepted))fail('B12_EVIDENCE_SEQUENCE');
   s.state='COMPLETE';const completion=Object.freeze({});completions.set(completion,{s,used:false});issued++;
   return freeze({status:'COMPLETE',completion});
  },
  resolveCompletion(cap){
   const p=completions.get(cap);if(!p||p.used||p.s.state!=='COMPLETE')return null;
   try{const c=current(p.s);return freeze({actorId:'player',generation:c.generation,sourceKind:'SHEN_TEACHING_COMPLETED',stage:c.stage,techniqueId:p.s.lesson.techniqueId,policyRevision:'PRIMARY_ELEMENTAL_FOUNDATION_FIRST_V1',criterionSourceSHA256:p.s.lesson.sourceHTMLSHA256||BANK_SOURCE.sha256,evidenceIds:p.s.evidences.map(e=>e.id)});}catch{return null;}
  },
  commit(cap,completion){
   const s=lookup(cap),p=completions.get(completion);if(!p||p.s!==s||p.used||s.state!=='COMPLETE')fail('B12_COMPLETION_NOT_AUTHENTIC');
   current(s);
   // Keep state COMPLETE for the synchronous Learning resolver. Host invalidation
   // may cancel the session only after Learning has committed; there is no rollback.
   const result=getLearning().commit(completion,s.revision);
   p.used=true;s.state='COMMITTED';session=null;
   if(result.status==='LEARNED'){commits++;lastReceipt=freeze({status:'LEARNED',techniqueId:s.lesson.techniqueId,lessonId:s.lesson.lessonId,sourceKind:'SHEN_TEACHING_COMPLETED',evidenceIds:s.evidences.map(e=>e.id),bankSHA256:BANK_SOURCE.sha256,knowledgeRevision:result.snapshot.knowledgeRevision,generation:result.snapshot.generation});}
   return freeze({status:result.status,techniqueId:s.lesson.techniqueId,name:s.lesson.name,snapshot:result.snapshot??null,receipt:result.receipt??null});
  },
  cancel,reset(){cancel();session=null;lastReceipt=null;issued=0;commits=0;sequence=0;questionNonce=0;},
  inspect(){return freeze({scope:'B1_B4_FIVE_BASIC_LESSONS',active:session?.state==='ACTIVE'||session?.state==='COMPLETE',state:session?.state??null,checkpoint:session?.step??null,evidenceCount:session?.evidences.length??0,issuedAuthorizations:issued,commits,lastReceipt,history:0,saveConnected:false,V13Connected:true});}
 });ports.add(api);return api;
}

export { createTeachingEngine, requireTeachingPort };
