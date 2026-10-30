import { requireVisibleM03Continuation } from './m03-continuation-bridge.js';
import { fail, freeze } from '../references/closed/integracion/astra/a07/safe-data.js';
import { requireStatView, STAGES } from '../../../runtime/b3-campaign-stat-view.js';
import { requireLearningScope } from '../../../runtime/b2-player-learning-b14.js';
import { sealRootTruth } from './root-disclosure-broker.js';
import { requireTeachingPort } from '../../../runtime/b2-teaching-engine-b14.js';
import { requireV13Port } from '../../../runtime/b2-learned-v13-presenter.js';

const readers=new WeakMap(),ports=new WeakSet(),cachedPorts=new WeakMap(),continuations=new WeakMap();
function registerNewOwnerReader(runtime,read,learning,teaching,visual){if(readers.has(runtime)||typeof read!=='function')fail('F1_READER_ONCE');requireLearningScope(learning);requireTeachingPort(teaching);requireV13Port(visual);readers.set(runtime,{read,learning,teaching,visual});}
function requireServicePort(port){if(!ports.has(port))fail('F1_SERVICE_PORT_NOT_AUTHENTIC');return port;}
function createShenServicePort(runtime){
 if(cachedPorts.has(runtime))return cachedPorts.get(runtime);
 const port=Object.freeze({authorizeM03Continuation(cap){const d=requireVisibleM03Continuation(cap);if(d.runtime!==runtime||d.actorId!=='shen_baojun')fail('B15_PERMISSION_SCOPE');continuations.set(runtime,cap);},revokeM03Continuation(){continuations.delete(runtime);},visual(){return requireV13Port(readers.get(runtime).visual);},teaching(){return requireTeachingPort(readers.get(runtime).teaching);},captureRootTruth(actorId){if(this.capture(actorId).status!=='ALLOW')fail('RD_SERVICE_DENIED');const r=readers.get(runtime);return sealRootTruth(r.read().view,r.learning);},subscribeInvalidation(fn){const r=readers.get(runtime);if(!r)fail('B11_READER_MISSING');return r.learning.onInvalidation(fn);},capture(actorId){
  const deny=reason=>freeze({status:'DENY',reason,actorId,scope:'F1_ONLY'});
  try{
   if(actorId!=='shen_baojun')return deny('OTHER_ACTOR');
   if(!runtime.player||runtime.terminado!==false||runtime.combate!==null)return deny('UNAVAILABLE_CONTEXT');
   if(runtime.pos!=='sala_formas'||!runtime.npcPresente(actorId,runtime.pos)||!runtime.npcsEnSala(runtime.pos).includes(actorId))return deny('NOT_CO_PRESENT_IN_FORMS');
   const reader=readers.get(runtime);if(!reader)return deny('NEW_OWNER_SOURCE_MISSING');
   const v=reader.read();requireStatView(v.view);
   if(v.state.actorId!=='player'||v.view.actorId!=='player'||v.state.stage!==v.view.stage||v.state.root!==v.view.root||STAGES.indexOf(v.state.stage)<STAGES.indexOf('LianQi_I'))return deny('NEW_STAGE_NOT_VERIFIED');
   if(v.view.engine_contract!=='NEW_COMBAT_STATS_V0_1'||v.view.stats_status!=='READY')return deny('OWNER_NOT_AUTHENTIC_NEW');
   const a=runtime.flags?.arc1,qs=runtime.quests;if(!a||!qs||qs.P!=='hecha'||!['ADMITIDO','MIEMBRO'].includes(a.estadoAfiliacion))return deny('ADMISSION_REQUIRED');
   const membership=runtime.player.facciones?.grulla_blanca?.estado;if(typeof membership!=='string')return deny('MEMBERSHIP_SOURCE_MISSING');
   if(membership==='expulsado')return deny('EXPELLED');
   if(Object.hasOwn(qs,'M03')&&!['activa','hecha'].includes(qs.M03))return deny('M03_STATE_UNKNOWN');
   if(qs.M03==='activa'){try{const c=requireVisibleM03Continuation(continuations.get(runtime));if(c.runtime!==runtime||c.actorId!==actorId)return deny('B15_M03_AUTHORITY_MISMATCH');}catch{return deny('M03_REQUIRES_AUTHENTIC_VISIBLE_CONTINUATION');}}
   const eligibility=reader.learning.project(v.view);if(eligibility.status==='ALL_LEARNED')return deny('ALL_LEARNED');
   return freeze({status:'ALLOW',reason:'VERIFIED_B11_CONSULTATION',actorId,roomId:runtime.pos,stage:v.state.stage,eligibility,scope:'B1_B1_ONLY',rootDisclosure:'PRIVATE_RD_CONVERSATION_AUTHORITY_ONLY',teachingConnected:true});
  }catch{return deny('UNVERIFIED_SOURCE');}
 }});
 ports.add(port);cachedPorts.set(runtime,port);return port;
}

function captureTeachingContext(runtime){const port=createShenServicePort(runtime),permission=port.capture('shen_baojun');if(permission.status!=='ALLOW')return null;const p=readers.get(runtime),v=p.read(),k=p.learning.capture();return freeze({status:'ALLOW',actorId:'player',teacherId:'shen_baojun',roomId:runtime.pos,root:v.view.root,generation:k.generation,revision:k.knowledgeRevision,knownIds:k.knownIds,stamp:JSON.stringify({turn:runtime.turnoGlobal,room:runtime.pos,player:runtime.player,flags:runtime.flags,quests:runtime.quests,positions:runtime.posicionNPC,gates:runtime.gates,ended:runtime.terminado,combat:runtime.combate!==null})});}

export { captureTeachingContext, createShenServicePort, registerNewOwnerReader, requireServicePort };
