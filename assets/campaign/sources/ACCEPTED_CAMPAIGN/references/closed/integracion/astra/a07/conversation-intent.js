import { createKnowledgePermissionGuard } from '../a02/knowledge-permission-guard.js';
import { registration, registrations } from './registry.js';
import { freeze, fail, exact, copy, source, text } from './safe-data.js';
import { RELATION_FIELDS, observation } from './social-evidence.js';
import { SOCIAL_SOURCE_ID, SOCIAL_EVENT_TYPE } from './social-move-producer.js';

/** A07.4: one bounded semantic proposal, never a dialogue/action executor. */

const CONVERSATION_LIMITS=freeze({bindings:128,bindingsPerActor:4,motivesPerEvaluation:4,intentsPerEvaluation:1});
const CONVERSATIONAL_INTENT_KINDS=freeze(['RESPOND','INFORM','REFUSE']);
const levels=['DESCONOCIDO','SOSPECHA','SABE','CONFIRMADO'];
const own=(o,k)=>{const d=o&&Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,'value'))fail('A074_OWN_DATA_REQUIRED');return d.value;};
const turn=t=>{if(!Number.isSafeInteger(t)||t<0)fail('A074_TURN');return t;};
function counterpart(id,actorId){if(id!=='player')registration(id);if(id===actorId)fail('A074_SELF_COUNTERPART');return id;}
const emptyBasis=reason=>({status:'UNAVAILABLE',reason});

/** Trusted source bindings describe eligibility, never personality or completed effects. */
function createConversationalIntent(options){
 exact(options,['npcRuntime','cycle','roomAreas','areaSource'],['bindings','motivationFeed','socialContinuity','socialAdapter','directRequestPort']);
 const npc=options.npcRuntime,cycle=options.cycle,areas=freeze(copy(options.roomAreas));source(copy(options.areaSource));
 if(!npc||typeof npc.capture!=='function'||JSON.stringify(npc.list())!==JSON.stringify(registrations().map(r=>({actorId:r.actorId,architecture:r.architecture}))))fail('A074_RUNTIME_PORT');
 if(!cycle||typeof cycle.inspect!=='function')fail('A074_CYCLE_PORT');
 if(Object.entries(areas).length>467||Object.values(areas).some(id=>typeof id!=='string'||!id))fail('A074_AREA_BINDINGS');
 const social=options.socialContinuity??null,relations=options.socialAdapter??null;
 if(social&&['capture','reader'].some(k=>typeof social[k]!=='function'))fail('A074_SOCIAL_PORT');
 if(relations&&['capture','relationship','institutionalReputation'].some(k=>typeof relations[k]!=='function'))fail('A074_RELATION_PORT');
 const input=copy(options.bindings??[]),bindings=new Map(),counts=new Map(),policies=[];
 if(!Array.isArray(input)||input.length>CONVERSATION_LIMITS.bindings)fail('A074_BINDING_BOUND');
 for(const b of input){
  exact(b,['bindingId','actorId','counterpartIds','motive','topic','handling','permission','source']);text(b.bindingId);registration(b.actorId);source(b.source);
  if(bindings.has(b.bindingId)||!Array.isArray(b.counterpartIds)||b.counterpartIds.length>32||!b.counterpartIds.length||new Set(b.counterpartIds).size!==b.counterpartIds.length)fail('A074_BINDING_SCOPE');
  b.counterpartIds.forEach(id=>counterpart(id,b.actorId));
  if(!['DIRECT_REQUEST','SOURCED_DUTY'].includes(b.motive)||!['DISCUSS','WITHHOLD','CANONICAL_ONLY'].includes(b.handling)||b.motive==='SOURCED_DUTY'&&b.handling==='WITHHOLD')fail('A074_BINDING_SEMANTICS');
  exact(b.topic,['kind'],b.topic.kind==='KNOWLEDGE'?['topicId','minLevel','use']:[]);
  if(!['ROLE','ENCOUNTER_CONTEXT','KNOWLEDGE'].includes(b.topic.kind))fail('A074_TOPIC_KIND');
  if(b.topic.kind==='KNOWLEDGE'){
   if(!/^R([1-9]|10)$/.test(b.topic.topicId)||!['SOSPECHA','SABE','CONFIRMADO'].includes(b.topic.minLevel)||!['SPECULATE','ASSERT'].includes(b.topic.use)||b.topic.use==='ASSERT'&&levels.indexOf(b.topic.minLevel)<2)fail('A074_KNOWLEDGE_POLICY');
   policies.push({actionId:b.bindingId,effect:'DIALOGUE',channel:'DIRECT',actorIds:[b.actorId],knowledge:[{topic:b.topic.topicId,minLevel:b.topic.minLevel,use:b.topic.use}],resourceId:null,requiresPlayer:false,source:'A074_EXPLICIT_ACTOR_TOPIC_BINDING'});
  }
  if(b.permission!==null){
   exact(b.permission,['resourceId','source']);text(b.permission.resourceId);source(b.permission.source);
   policies.push({actionId:'P:'+b.bindingId,effect:'ARCHIVE_READ',channel:'DIRECT',actorIds:[b.actorId],knowledge:[],resourceId:b.permission.resourceId,requiresPlayer:false,source:'A074_READ_ONLY_ARCHIVE_PERMISSION_REQUIREMENT'});
  }
  const count=(counts.get(b.actorId)??0)+1;if(count>CONVERSATION_LIMITS.bindingsPerActor)fail('A074_ACTOR_BINDING_BOUND');counts.set(b.actorId,count);bindings.set(b.bindingId,freeze(b));
 }
 const guard=createKnowledgePermissionGuard(policies);
 const feed=options.motivationFeed??null;if(feed){exact(feed,['capture']);if(typeof feed.capture!=='function')fail('A074_MOTIVATION_PORT');}
 const captureMotive=feed?.capture.bind(feed);
 const direct=options.directRequestPort??null;
 if(direct){exact(direct,['verify']);if(typeof direct.verify!=='function')fail('A074_DIRECT_REQUEST_PORT');}
 let proposals=new WeakMap(),disposed=false,running=false;
 function open(){if(disposed)fail('A074_DISPOSED');if(running)fail('A074_REENTRANT');}
 function eligibility(runtime,id){
  const t=turn(own(runtime,'turnoGlobal')),roomId=text(own(own(own(runtime,'posicionNPC'),id),'sala'));
  const room=own(own(runtime,'rooms'),roomId),actorArea=own(room,'area'),playerRoom=text(own(runtime,'pos'));
  if(!Object.hasOwn(areas,roomId)||actorArea!==areas[roomId]||!Object.hasOwn(areas,playerRoom)||own(own(own(runtime,'rooms'),playerRoom),'area')!==areas[playerRoom])fail('A074_NATIVE_AREA_DRIFT');
  // A synchronous native player request is not an autonomous dispatch. The
  // trusted host verifies its private, current command/choice capability.
  // No synthetic scheduler row, clock advance, catch-up or world event is minted.
  if(direct?.verify(Object.freeze({runtime,actorId:id,turn:t,roomId,playerRoomId:playerRoom,activeAreaId:areas[playerRoom]}))===true){
   if(roomId!==playerRoom||actorArea!==areas[playerRoom])return {allowed:false,reason:'DIRECT_REQUEST_NOT_COPRESENT'};
   return {allowed:true,turn:t,roomId,activeAreaId:actorArea};
  }
  const life=cycle.inspect();
  if(life.disposed||life.activeAreaId===null||life.scheduler===null)return {allowed:false,reason:'A072_ELIGIBILITY_UNAVAILABLE'};
  if(life.scheduler.clock!==t||areas[playerRoom]!==life.activeAreaId)return {allowed:false,reason:'A072_CURRENT_DISPATCH_REQUIRED'};
  if(actorArea!==life.activeAreaId)return {allowed:false,reason:'DORMANT_ACTOR'};
  const row=life.scheduler.rows.find(r=>r.row.id===id);
  if(!row||row.clock!==t||row.row.lastDispatchTurn!==t)return {allowed:false,reason:'ACTOR_NOT_DISPATCHED'};
  return {allowed:true,turn:t,roomId,activeAreaId:life.activeAreaId};
 }
 function candidate(snapshot,id,actionId){return {candidateId:'A074:'+id,actionId,actorId:snapshot.actor.id,roomId:snapshot.position.roomId};}
 function silent(reason,status='NO_CONVERSATIONAL_INTENT'){return {status,reasons:[reason],intent:null};}
 function relationBasis(runtime,id,target,revision){
  if(!relations)return {relation:emptyBasis('A073_VERIFIED_RELATION_SOURCE'),reputation:emptyBasis('A073_KNOWN_REPUTATION_SOURCE')};
  const frame=relations.capture(runtime,id,{revision}),r=copy(relations.relationship(frame,target)),p=copy(relations.institutionalReputation(frame,target));
  let relation=emptyBasis('VERIFIED_RELATION_UNAVAILABLE'),reputation=emptyBasis('KNOWN_REPUTATION_UNAVAILABLE');
  if(r.status==='AVAILABLE'){
   if(r.actorId!==id||r.targetActorId!==target||r.classification!=='VERIFIED_DOMAIN_FACT'){
    if(r.classification==='EXPERIMENTAL_NON_CANONICAL')relation=emptyBasis('EXPERIMENTAL_RELATION_NOT_CANON');else fail('A074_RELATION_SCOPE');
   }else {
    exact(r.values,RELATION_FIELDS);if(Object.values(r.values).some(v=>typeof v!=='number'||v<0||v>100))fail('A074_RELATION_VALUES');source(r.source);
    relation={status:'AVAILABLE',values:copy(r.values),source:copy(r.source)};
   }
  }
  if(p.status==='AVAILABLE'){
   if(p.actorId!==id||p.targetActorId!==target||target!=='player'||p.institutionId!=='grulla_blanca'||typeof p.value!=='number'||!Number.isFinite(p.value))fail('A074_REPUTATION_SCOPE');source(p.source);
   reputation={status:'AVAILABLE',institutionId:p.institutionId,value:p.value,source:copy(p.source)};
  }
  return {relation,reputation};
 }
 function compute(runtime,id,context,target){
  const e=eligibility(runtime,id);if(!e.allowed)return silent(e.reason);
  const frame=npc.capture(runtime,id,context),s=frame.snapshot;
  if(s.turn!==e.turn||s.position.roomId!==e.roomId)fail('A074_FRAME_SCOPE');
  if(target==='player'?!s.perception.playerPresent:!s.perception.coPresentNpcIds.includes(target))return silent('COUNTERPART_NOT_PERCEIVED');
  if(!captureMotive)return silent('A074_VERIFIED_MOTIVATION_FEED_UNAVAILABLE');
  const request=freeze({schemaVersion:1,actorId:id,counterpartId:target,turn:s.turn,roomId:s.position.roomId,revision:frame.revision});
  const raw=captureMotive(request);if(raw===null)return silent('A074_VERIFIED_MOTIVATION_UNAVAILABLE','DEFERRED');
  const dto=copy(raw);exact(dto,['schemaVersion','actorId','counterpartId','turn','roomId','revision','entries']);
  if(['schemaVersion','actorId','counterpartId','turn','roomId','revision'].some(k=>dto[k]!==request[k]))fail('A074_MOTIVATION_SCOPE');
  if(!Array.isArray(dto.entries)||dto.entries.length>CONVERSATION_LIMITS.motivesPerEvaluation)fail('A074_MOTIVATION_BOUND');
  const seen=new Set(),motives=[];
  for(const item of dto.entries){
   exact(item,['bindingId','eventId','observation']);text(item.eventId);
   const b=bindings.get(item.bindingId);if(!b||b.actorId!==id||!b.counterpartIds.includes(target)||seen.has(item.bindingId))fail('A074_MOTIVATION_BINDING');seen.add(item.bindingId);
   observation(item.observation,frame,{witnessOnly:true});motives.push({b,item});
  }
  // Stable semantic focus, not a presentation ranking or a disclosure score.
  motives.sort((a,b)=>(a.b.motive==='DIRECT_REQUEST'?0:1)-(b.b.motive==='DIRECT_REQUEST'?0:1)||(a.b.bindingId<b.b.bindingId?-1:1));
  if(motives.some(m=>m.b.handling==='CANONICAL_ONLY'))return silent('CANONICAL_DIALOGUE_ROUTE_REQUIRED','DEFERRED');
  let rejection='NO_VERIFIED_CONVERSATIONAL_MOTIVE';
  for(const {b,item} of motives){
   let topicBasis;
   if(b.topic.kind==='KNOWLEDGE'){
    const assessed=guard.assess(s,frame.context.permissions,candidate(s,item.eventId,b.bindingId));
    if(!assessed.eligible){rejection='LOCAL_KNOWLEDGE_INSUFFICIENT';continue;}
    topicBasis={kind:'KNOWLEDGE',topicId:b.topic.topicId,level:s.knowledge[b.topic.topicId],use:b.topic.use};
   }else if(b.topic.kind==='ROLE')topicBasis={kind:'ROLE',role:s.actor.role};
   else {
    if(id==='lin_yue'){rejection='LIN_ADVANCED_MEMORY_ONLY';continue;}
    if(!social){rejection='A073B_OWN_ENCOUNTER_SOURCE_UNAVAILABLE';continue;}
    const local=social.reader(social.capture(runtime,id,{revision:frame.revision})).mostRecent(target),q=copy(local);
    if(q.status!=='AVAILABLE'){rejection='NO_OWN_VERIFIED_ENCOUNTER';continue;}
    if(!Array.isArray(q.entries)||q.entries.length>1)fail('A074_MEMORY_BOUND');
    if(!q.entries.length){rejection='NO_OWN_VERIFIED_ENCOUNTER';continue;}
    const record=q.entries[0];
    exact(record,['counterpartId','sourceId','sequence','typeId','occurredTurn','acquiredTurn','acquisition']);
    turn(record.occurredTurn);turn(record.acquiredTurn);
    if(!Number.isSafeInteger(record.sequence)||record.sequence<1)fail('A074_MEMORY_SEQUENCE');
    if(q.observerId!==id||q.counterpartId!==target||record.counterpartId!==target||record.sourceId!==SOCIAL_SOURCE_ID||record.typeId!==SOCIAL_EVENT_TYPE||record.acquiredTurn>s.turn||record.occurredTurn>record.acquiredTurn||!['PARTICIPATED','WITNESSED'].includes(record.acquisition))fail('A074_MEMORY_SCOPE');
    topicBasis={kind:'ENCOUNTER_CONTEXT',sourceId:record.sourceId,typeId:record.typeId,sequence:record.sequence,occurredTurn:record.occurredTurn,acquiredTurn:record.acquiredTurn,acquisition:record.acquisition};
   }
   if(b.permission!==null&&!guard.assess(s,frame.context.permissions,candidate(s,item.eventId,'P:'+b.bindingId)).eligible){rejection='INSTITUTIONAL_PERMISSION_UNAVAILABLE';continue;}
   const bases=relationBasis(runtime,id,target,frame.revision);
   const data={schemaVersion:1,actorId:id,counterpartId:target,intentKind:b.handling==='WITHHOLD'?'REFUSE':b.motive==='DIRECT_REQUEST'?'RESPOND':'INFORM',
    topicBasis:b.handling==='WITHHOLD'?null:topicBasis,reasonBasis:{bindingId:b.bindingId,eventId:item.eventId,motive:b.motive,observedTurn:s.turn,source:copy(b.source)},
    relationBasis:bases.relation,reputationBasis:bases.reputation,
    guard:{revision:frame.revision,turn:s.turn,roomId:s.position.roomId,activeAreaId:e.activeAreaId}};
   // Guards retain own local dependencies privately, not a global snapshot in the DTO.
   const refreshed=npc.capture(runtime,id,context),currentEligibility=eligibility(runtime,id);
   if(!currentEligibility.allowed||currentEligibility.turn!==e.turn||currentEligibility.roomId!==e.roomId||currentEligibility.activeAreaId!==e.activeAreaId||JSON.stringify(refreshed)!==JSON.stringify(frame))fail('A074_CONTEXT_CHANGED_DURING_READ');
   const signature=JSON.stringify({data,snapshot:s,context:frame.context});
   return {status:'PROPOSED',reasons:[],intent:data,signature};
  }
  return silent(rejection);
 }
 function argumentsFor(id,context,target){registration(id);counterpart(target,id);const c=copy(context);exact(c,['revision','permissions','gateStates']);text(c.revision);return c;}
 function prepare(runtime,id,context,target='player'){
  open();const c=argumentsFor(id,context,target);running=true;
  try{const computed=compute(runtime,id,c,target),result=freeze({status:computed.status,reasons:computed.reasons,intent:computed.intent});
   if(result.intent)proposals.set(result.intent,{signature:computed.signature});return result;
  }finally{running=false;}
 }
 function revalidate(runtime,intent,context){
  open();const proof=proposals.get(intent);if(!proof)return freeze({status:'INVALID',reasons:['FOREIGN_OR_INVALIDATED_INTENT']});
  const c=argumentsFor(intent.actorId,context,intent.counterpartId);running=true;
  try{
   let now;try{now=compute(runtime,intent.actorId,c,intent.counterpartId);}catch{proposals.delete(intent);return freeze({status:'STALE',reasons:['CURRENT_CONTEXT_NOT_VERIFIED']});}
   if(now.status!=='PROPOSED'||now.signature!==proof.signature){proposals.delete(intent);return freeze({status:'STALE',reasons:['CONVERSATIONAL_CONTEXT_CHANGED']});}
   return freeze({status:'VALID',reasons:[]});
  }finally{running=false;}
 }
 return Object.freeze({prepare,revalidate,invalidate:()=>{open();proposals=new WeakMap();},dispose:()=>{open();disposed=true;proposals=new WeakMap();},
  capabilities:()=>freeze({actors:32,intentKinds:[...CONVERSATIONAL_INTENT_KINDS],limits:copy(CONVERSATION_LIMITS),textGenerated:false,actionsExecuted:false,knowledgeApplied:false,memoryApplied:false,relationApplied:false,persistenceAdded:false,timers:0,listeners:0,personalityContribution:'UNAVAILABLE',numericRelationDecisionRules:'UNAVAILABLE'})});
}

export { CONVERSATIONAL_INTENT_KINDS, CONVERSATION_LIMITS, createConversationalIntent };
