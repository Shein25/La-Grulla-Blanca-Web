import { alchemyPortFor, ALCHEMY_SOURCE } from './normal-alchemy-native-r56.js';
import { herbalismPortFor, HERBALISM_SOURCE } from './herbalism-native-r54.js';
import { commercePortFor } from './b1-native-services.js';
import { socialAnswer, SOCIAL_CONTEXT_SOURCE, SOCIAL_CONTEXT_REVISION, sealSocialUtterance, socialTopicsFor, socialFollowUpFor } from './social-context-native.js';
import { createM03ContinuationBridge, requireVisibleM03Continuation } from '../sources/ACCEPTED_CAMPAIGN/experimental/m03-continuation-bridge.js';
import { createConversationalIntent } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07/conversation-intent.js';
import { createNpcPlayerVoiceRealizerR4_1 } from '../sources/ACCEPTED_CAMPAIGN/experimental/voice-realizer-r4-1-b14.js';
import { createNativeIdentityHost } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07.5b2.2r1/native-identity-host.js';
import { knowsIdentity } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07.5b2.2r1/player-identity-knowledge.js';
import { createAuthoredCatalog } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07.9/catalog.js';
import { INTEGRATION_AUTHORITY } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07.9/data/frozen-corpus.js';
import { freeze, copy, exact, fail } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07/safe-data.js';
import { serviceLine, SERVICE_CATALOG, SERVICE_SOURCE, sealServiceUtterance } from './b2-shen-elemental-service-catalog-b14.js';
import { requireServicePort } from '../sources/ACCEPTED_CAMPAIGN/experimental/shen-service-availability-b15.js';
import { createRootDisclosureBroker } from '../sources/ACCEPTED_CAMPAIGN/experimental/root-disclosure-broker.js';
import { ROOT_SOURCE } from '../sources/ACCEPTED_CAMPAIGN/experimental/root-disclosure-catalog.js';

const no=reason=>freeze({handled:false,text:null,utterance:null,deferReason:reason});
function createGeneralConversationHost(){
 const catalog=createAuthoredCatalog(),identity=createNativeIdentityHost();
 let game=null,defs=null,rooms=null,roomAreas=null,scope=null,a074=null,voice=null,event=null,lease=null,permit=null,pending=null,sequence=0,issuing=false,disposed=false;
 let plans=new WeakMap(),utterances=new WeakMap();
 let missionBridge=null,missionSession=null;
 let service=null,lastServiceDelivery=null,unsubscribeLearning=null,rootDisclosure=null,rootTalkStamp=null;const serviceStats={offers:0,consultations:0,cancellations:0,returns:0,denials:0};
 const stats={intents:0,realizations:0,deliveries:0,offers:0,selections:0,stale:0,knownOpenings:0,lastActor:null,lastEntry:null,lastLine:null,lastReason:null};
 function stamp(){return JSON.stringify(copy({turn:game.turnoGlobal,room:game.pos,positions:game.posicionNPC,player:game.player,
  quests:game.quests,gates:game.gates,flags:game.flags,knowledge:game.conocimientoNPC,ended:game.terminado,combat:game.combate!==null}));}
 function available(actorId){
  return !disposed&&scope!==null&&a074!==null&&game.player&&game.terminado===false&&game.combate===null&&
   catalog.actors().includes(actorId)&&game.npcPresente(actorId,game.pos)===true&&game.npcsEnSala(game.pos).includes(actorId)&&
   game.rooms[game.pos]?.area===roomAreas[game.pos]&&game.posicionNPC[actorId]?.sala===game.pos;
 }
 function validEvent(){return event!==null&&event.epoch===scope?.epoch&&available(event.actorId)&&stamp()===event.stamp&&
  (event.kind==='HABLAR'?game.pregunta===null:event.kind==='PLAYER_ENTRY'&&game.pregunta===null);}
 function retire(reason){
  if(reason!=='B11_LEARNING_CHANGED'){missionSession=null;missionBridge?.revoke();service?.revokeM03Continuation();}
  rootDisclosure?.revoke();rootTalkStamp=null;service?.teaching().cancel();
  const l=lease;lease=null;permit=null;pending=null;event=null;plans=new WeakMap();utterances=new WeakMap();
  identity.cancelPending(game);stats.lastReason=reason;
  if(l&&game.pregunta===l.question){game.pregunta=null;game.desactivarEleccionActiva();}
 }
 function context(){return {revision:event.revision,permissions:null,gateStates:{}};}
 function configure(options){
  exact(options,['runtime','npcDefinitions','roomDefinitions','gateDefinitions'],['servicePort']);
  service=options.servicePort??null;if(service!==null){requireServicePort(service);unsubscribeLearning=service.subscribeInvalidation(()=>retire('B11_LEARNING_CHANGED'));}
  if(game)fail('A079_SINGLE_OWNER');game=options.runtime;defs=options.npcDefinitions;rooms=options.roomDefinitions;
  rootDisclosure=createRootDisclosureBroker({captureTruth:()=>requireServicePort(service).captureRootTruth('shen_baojun'),current:()=>!disposed&&scope!==null&&rootTalkStamp===stamp()&&available('shen_baojun')&&serviceAllowed('shen_baojun'),emitPlayer:emitRootPlayer});
  roomAreas=Object.fromEntries(Object.entries(rooms).map(([id,r])=>[id,r.area]));
  missionBridge=createM03ContinuationBridge({runtime:game,scope:()=>scope,stamp,available:()=>available('shen_baojun'),onBegin:()=>retire('B15_NEW_CANONICAL_REQUEST')});
  // Lifecycle hooks retire only our owned lease. Foreign native questions survive.
  for(const name of ['escribirSlot','deserializar','nuevaPartida','crearPersonaje','muerte','terminar']){
   const original=game[name];game[name]=function(...args){if(this===game)retire(name);return original.apply(this,args);};
  }
  const ask=game.preguntar;
  game.preguntar=function(...args){if(this===game&&!issuing)retire('QUESTION_REPLACED');return ask.apply(this,args);};
 }
 function connected(nativeScope){
  retired();scope=nativeScope;
  const bindings=catalog.actors().map(actorId=>({bindingId:'A079:'+actorId,actorId,counterpartIds:['player'],motive:'DIRECT_REQUEST',
   topic:{kind:'ROLE'},handling:'DISCUSS',permission:null,source:copy(INTEGRATION_AUTHORITY)}));
  const directRequestPort=Object.freeze({verify:r=>r.runtime===game&&validEvent()&&r.actorId===event.actorId&&r.turn===game.turnoGlobal&&
   r.roomId===game.pos&&r.playerRoomId===game.pos&&r.activeAreaId===roomAreas[game.pos]});
  const motivationFeed=Object.freeze({capture:r=>validEvent()&&r.actorId===event.actorId&&r.counterpartId==='player'&&r.revision===event.revision&&
   r.turn===game.turnoGlobal&&r.roomId===game.pos?freeze({...r,entries:[{bindingId:'A079:'+r.actorId,eventId:event.eventId,
    observation:{kind:'WITNESSED',observerActorId:r.actorId,observedTurn:r.turn,roomId:r.roomId,authorized:true}}]}):null});
  a074=createConversationalIntent({npcRuntime:nativeScope.npcRuntime,cycle:nativeScope.cycle,roomAreas,areaSource:INTEGRATION_AUTHORITY,
   bindings,motivationFeed,directRequestPort});
  voice=createNpcPlayerVoiceRealizerR4_1({validationPort:{revalidate:()=>({status:'DEFERRED',reason:'NO_FREE_FACTUAL_FEED'})},authoredPort:{resolve:resolveAuthored}});
 }
 function retired(){retire('SESSION_RETIRED');a074?.dispose();a074=null;voice=null;scope=null;}
 function issue(actorId,kind,entryId=null){
  if(!available(actorId)||sequence>=0x7fffffff)return false;
  const n=++sequence;event=Object.freeze({actorId,kind,entryId,epoch:scope.epoch,stamp:stamp(),revision:'A079:R'+n,eventId:'A079:E'+n});return true;
 }
 // Only called from the lexical native cmd_hablar branch AFTER its actual
 // gestionarMisionesNpc result. This authority is never exposed on window.
 function authorizeSpeak(runtime,actorId,nativeMissionResult){
  retire('NEW_NATIVE_REQUEST');
  if(runtime!==game||nativeMissionResult!==''||game.pregunta!==null||!issue(actorId,'HABLAR'))return false;
  if(actorId==='shen_baojun'){rootTalkStamp=stamp();rootDisclosure.begin();}
  return true;
 }
 function makePlan(intent,data){const capability=Object.freeze({});plans.set(capability,{intent,data,event});return capability;}
 function resolveAuthored(raw){
  try{
   const p=plans.get(raw.authoredPayload);
   if(!p||p.intent!==raw.intent||p.event!==event||raw.contextRevision!==event.revision||!validEvent()||
     a074.revalidate(game,raw.intent,context()).status!=='VALID')return {status:'UNAVAILABLE',reason:'AUTHORED_OR_INTENT_AUTHORITY_NOT_CURRENT'};
   const d=p.data,id=event.actorId,profile=catalog.describe(id).voice;
   if(d.type==='REPLY'){
    const r=catalog.response(id,event.entryId);
    if(event.kind!=='PLAYER_ENTRY'||r.status!=='AVAILABLE_ON_VERIFIED_COMMUNICATION'||r.line.id!==d.lineId||r.line.text!==d.text||
      !r.entry.alternativeIds.includes(d.lineId)||r.entry.id!==event.entryId)return {status:'UNAVAILABLE',reason:'AUTHORED_ENTRY_SCOPE'};
   }else if(d.type==='OPENING'){
    if(event.kind!=='HABLAR'||catalog.opening(id)?.id!==d.lineId||catalog.opening(id)?.text!==d.text)return {status:'UNAVAILABLE',reason:'OPENING_SOURCE'};
   }else if(d.type==='IDENTITY'){
    if(event.kind!=='HABLAR'||d.base.utterance.actorId!==id||d.base.utterance.kind!=='SELF_INTRODUCTION'||d.base.text!==d.text||knowsIdentity(game,id))return {status:'UNAVAILABLE',reason:'IDENTITY_SOURCE'};
   }else if(d.type==='R6_SOCIAL'){
    const expected=socialAnswer(id,d.lineId,d.priorTopic,game.quests);
    if(event.kind!=='PLAYER_ENTRY'||event.entryId!==d.lineId||!expected||expected.text!==d.text||
       d.source!==SOCIAL_CONTEXT_SOURCE)return {status:'UNAVAILABLE',reason:'R6_SOCIAL_CURRENT_CONTEXT_NOT_AUTHORIZED'};
   }else if(d.type==='RD_ROOT'){
    if(id!=='shen_baojun'||event.kind!=='PLAYER_ENTRY'||!serviceAllowed(id))return {status:'UNAVAILABLE',reason:'RD_EVENT_SCOPE'};
    const verified=rootDisclosure.describe(d.rootPlan);if(verified.text!==d.text||JSON.stringify(verified.semanticClaims)!==JSON.stringify(d.claims))return {status:'UNAVAILABLE',reason:'RD_SEMANTIC_SOURCE'};
   }else if(d.type==='F1_SERVICE'){
    const line=serviceLine(d.lineId);
    if(!line||id!=='shen_baojun'||event.kind!=='PLAYER_ENTRY'||event.entryId!==line.lessonId||d.text!==line.text||!eligibleLessons(id).some(l=>l.lessonId===line.lessonId))return {status:'UNAVAILABLE',reason:'F1_SERVICE_SOURCE'};
   }else return {status:'UNAVAILABLE',reason:'UNRECOGNIZED_AUTHORED_SURFACE'};
   let u=freeze({schemaVersion:1,kind:d.type==='IDENTITY'?'SELF_INTRODUCTION':'AUTHORED_DIALOGUE',actorId:id,recipientId:'player',
    intentKind:raw.intent.intentKind,text:d.text,semanticKey:d.lineId,topicRefs:[],semanticClaims:d.type==='RD_ROOT'?d.claims:d.type==='IDENTITY'?[{kind:'PUBLIC_IDENTITY',actorId:id,name:defs[id].nombre}]:[],
    semanticRelations:[],contextRevision:event.revision,voiceProfileRevision:profile.revision,
    sourceBasis:{context:INTEGRATION_AUTHORITY,authored:d.type==='RD_ROOT'?ROOT_SOURCE:d.type==='F1_SERVICE'?SERVICE_SOURCE:d.source??INTEGRATION_AUTHORITY,entryId:event.entryId,
     knowledgeMeaning:d.type==='REPLY'?'CURRENT_PLAYER_STATEMENT_RECEIVED_NOT_VERIFIED_AS_TRUE':'CURRENT_DIRECT_REQUEST',voiceEvidenceIds:profile.evidenceIds},
    realization:{ruleId:(d.type==='F1_SERVICE'?'F1:':'A079:')+d.lineId,catalogRevision:d.type==='RD_ROOT'?'ROOT-DISCLOSURE-V1':d.type==='F1_SERVICE'?SERVICE_CATALOG.revision:d.type==='R6_SOCIAL'?SOCIAL_CONTEXT_REVISION:'A079-FROZEN-AUTHORING-V1',linguisticBase:'R4.1_AUTHENTICATED_AUTHORED_SURFACE',variant:0}});
   if(d.type==='R6_SOCIAL')u=sealSocialUtterance(u);
   if(d.type==='F1_SERVICE')u=sealServiceUtterance(u);
   if(d.type==='RD_ROOT')u=rootDisclosure.seal(d.rootPlan,u);
   utterances.set(u,{event,plan:p});stats.realizations++;return freeze({status:'REALIZED',reason:null,utterance:u});
  }catch{return {status:'UNAVAILABLE',reason:'SOURCE_NOT_VERIFIED'};}
 }
 function realize(data){
  const prepared=a074.prepare(game,event.actorId,context());if(prepared.status!=='PROPOSED')return null;stats.intents++;
  const result=voice.realize({intent:prepared.intent,authoredPayload:makePlan(prepared.intent,data),contextRevision:event.revision});
  return result.status==='REALIZED'?result.utterance:null;
 }
 function respond(raw){
  try{
   exact(raw,['runtime','npcDefinitions','npcId','nativeMissionResult']);
   if(raw.runtime!==game||raw.npcDefinitions!==defs||raw.nativeMissionResult!==''||event?.kind!=='HABLAR'||event.actorId!==raw.npcId||!validEvent())return no('PRIVATE_NATIVE_REQUEST_REQUIRED');
   const base=identity.respond(raw);let data;
   if(base.handled)data={type:'IDENTITY',lineId:'OWN_IDENTITY:'+raw.npcId,text:base.text,base};
   else if(knowsIdentity(game,raw.npcId)){
    const opening=catalog.opening(raw.npcId);if(!opening)return no('KNOWN_NO_SOURCED_OPENING');
    data={type:'OPENING',lineId:opening.id,text:opening.text};stats.knownOpenings++;
   }else {stats.lastReason=base.deferReason??'IDENTITY_UNAVAILABLE';return no(stats.lastReason);}
   const u=realize(data);if(!u)return no('A074_OR_AUTHORED_REALIZATION_UNAVAILABLE');
   pending={utterance:u,type:data.type,event};stats.lastActor=raw.npcId;return freeze({handled:true,text:u.text,utterance:u,trace:{phase:'A07.9',actorId:u.actorId,intentKind:u.intentKind,realizer:'A075-R4.1-AUTHORED',acquaintanceState:data.type==='IDENTITY'?'UNKNOWN':'KNOWN'}});
  }catch(error){stats.lastReason=error.code??error.message??'A079_CURRENT_SOURCE_UNAVAILABLE';return no('A079_CURRENT_SOURCE_UNAVAILABLE');}
 }
 // A KNOWN actor needs no repeated identity or invented greeting. The native
 // cmd_hablar boundary can present sourced player entries directly when no
 // context-free NPC opening exists. This consumes a real A074 proposal; it
 // does not claim an NPC utterance was realized or delivered. The selected
 // entry subsequently produces its own A074 + R4.1 authenticated response.
 function openKnownOptions(runtime,actorId){
  try{
   if(runtime!==game||event?.kind!=='HABLAR'||event.actorId!==actorId||!validEvent()||
      !knowsIdentity(game,actorId)||catalog.opening(actorId))return false;
   const p=a074.prepare(game,actorId,context());
   if(p.status!=='PROPOSED'||a074.revalidate(game,p.intent,context()).status!=='VALID')return false;
   stats.intents++;offer(actorId,game.playerIdentityKnowledge);
   return lease!==null;
  }catch{retire('KNOWN_OPTIONS_UNAVAILABLE');return false;}
 }
 function confirmedNode(raw){const node=game.contenido?.lastElementChild;return node&&node!==raw.previousNode&&node.parentNode===game.contenido&&node.isConnected===true&&node.textContent===raw.text&&node.checkVisibility?.({checkOpacity:true,checkVisibilityCSS:true})===true&&node.getClientRects().length>0;}
 function consumeVisibleOutput(raw){
  const missionCap=missionBridge?.consume(raw);
  if(missionCap){
   try{
    const proof=requireVisibleM03Continuation(missionCap);
    service.authorizeM03Continuation(missionCap);
    const permission=service.capture('shen_baojun');
    if(permission.status!=='ALLOW'&&permission.reason!=='ALL_LEARNED'){retire('B15_PERMISSION_DENIED');return null;}
    missionSession=missionCap;rootTalkStamp=stamp();rootDisclosure.begin();
    offer('shen_baojun',game.playerIdentityKnowledge);
    if(lease){missionBridge.offered();stats.lastReason='B15_POST_CANONICAL_MISSION_OFFERED';}
   }catch{retire('B15_POSTLUDE_NOT_CURRENT');}
   return null;
  }
  const p=pending;pending=null;
  try{
   if(raw.runtime!==game||!p||p.event!==event||!utterances.has(p.utterance)||raw.text!==p.utterance.text||!validEvent()||!confirmedNode(raw))return null;
   const delivery=p.type==='IDENTITY'?identity.consumeVisibleOutput(raw):null;
   if(p.type==='IDENTITY'&&delivery?.status!=='IDENTITY_DELIVERY_CONFIRMED')return null;
   stats.deliveries++;
   const state=delivery?.state??game.playerIdentityKnowledge;
   offer(event.actorId,state);return delivery;
  }catch{retire('DELIVERY_UNAVAILABLE');return null;}
 }
 function offer(actorId,identityAfter){
  if(!available(actorId)||game.pregunta!==null)return;
  // Context-free A07.9 player claims are archived, not presented as real events.
  // These authored role/method topics never claim a past action or an NPC memory.
  const choices=[...socialTopicsFor(actorId,game.quests)];
  if(serviceAllowed(actorId))choices.push({id:SERVICE_CATALOG.entryId,text:SERVICE_CATALOG.entryText});
  if(herbalismPortFor(game)?.available(actorId))choices.push({id:'DOMAIN:HERBALISM',text:'Herboristería'});
  if(alchemyPortFor(game)?.available(actorId))choices.push({id:'DOMAIN:ALCHEMY',text:'Alquimia'});
  if(commercePortFor(game)?.available(actorId))choices.push({id:'DOMAIN:COMMERCE',text:'Comercio y servicios'});
  if(!choices.length)return;
  const l={actorId,identityAfter,epoch:scope.epoch,stamp:stamp(),learningStamp:eligibilityStamp(actorId),options:new Map(choices.map((e,n)=>[String(n+1),e.id])),question:null};
  l.flow='SOCIAL';l.missionCap=missionSession;lease=l;issuing=true;
  try{
   game.preguntarEleccionMultiple({opciones:choices.map((e,n)=>({valor:String(n+1),texto:e.text})),callback:value=>choose(l,value)});
   l.question=game.pregunta;Object.freeze(l.question.multipleChoice.opciones.map(Object.freeze));Object.freeze(l.question.multipleChoice.opciones);Object.freeze(l.question.multipleChoice);Object.freeze(l.question);
   stats.offers++;stats.lastReason='OFFERED';
  }catch{retire('OFFER_UNAVAILABLE');}finally{issuing=false;}
 }
 function validMissionLease(l){try{return l.actorId==='shen_baojun'&&l.missionCap&&requireVisibleM03Continuation(l.missionCap).runtime===game;}catch{return false;}}
 function finishMissionContinuation(){missionSession=null;missionBridge?.revoke();service?.revokeM03Continuation();}
 function validLease(l,consumed=false){return lease===l&&available(l.actorId)&&l.epoch===scope.epoch&&stamp()===l.stamp&&
  game.playerIdentityKnowledge===l.identityAfter&&(knowsIdentity(game,l.actorId)||validMissionLease(l))&&
  (consumed?game.pregunta===null:game.pregunta===l.question)&&(!consumed||permit?.lease===l)&&
   (l.learningStamp===eligibilityStamp(l.actorId))&&(l.flow==='SOCIAL'||l.flow==='TOPIC_FOLLOW_UP'||serviceAllowed(l.actorId));}
 function beginInput(runtime,raw){
  permit=null;if(runtime!==game||!lease)return 'NOT_HANDLED';
  try{if(!validLease(lease)){stats.stale++;retire('STALE_INPUT');return 'INVALIDATED';}
   const value=typeof raw==='string'?raw.trim():null;if(lease.options.has(value))permit={lease,value};return 'OWNED';
  }catch{retire('INPUT_UNAVAILABLE');return 'INVALIDATED';}
 }
 function deliver(u,playerText){
  const proof=utterances.get(u);if(!proof||proof.event!==event||!validEvent())return false;
  // One-shot output capability is consumed before UI execution. Revalidation
  // and delivery are synchronous; no world writer or task is interleaved.
  utterances.delete(u);const nodes=[];
  try{
   for(const text of ['Tú: «'+playerText+'»',defs[u.actorId].nombre+': «'+u.text+'»']){
    if(!validEvent())throw Error('STALE_DELIVERY');const node=game.addLine(text,'dialogo');nodes.push(node);
    if(!node||node.textContent!==text||node.className!=='dialogo'||!node.isConnected)throw Error('OUTPUT_NOT_EXACT');
   }
   game.abajo();stats.deliveries++;return true;
  }catch{for(const node of nodes)try{node?.remove?.();}catch{}return false;}
 }
 function contextSpeech(actorId,topicId,priorTopic=null){
  const answer=socialAnswer(actorId,topicId,priorTopic,game.quests);
  if(!answer||!issue(actorId,'PLAYER_ENTRY',topicId))return false;
  // R6 is realized through the SAME A07.4 / R4.1 authenticated voice gate
  // and one-shot native delivery as all archived A07.9 conversations.
  const utterance=realize({type:'R6_SOCIAL',lineId:topicId,
   priorTopic,text:answer.text,source:SOCIAL_CONTEXT_SOURCE});
  if(!utterance||!deliver(utterance,answer.question))return false;
  stats.selections++;stats.lastActor=actorId;
  stats.lastEntry=topicId;stats.lastReason='SITUATED_SOCIAL_TOPIC';return true;
 }
 function contextFollowUp(actorId,priorTopic){
  if(!available(actorId)||game.pregunta!==null)return false;
  const choices=socialFollowUpFor(actorId).filter(choice=>priorTopic!=='TOPIC:CURRENT'||choice.id!=='TOPIC:EXAMPLE');
  if(!choices.length)return false;
  const l={actorId,identityAfter:game.playerIdentityKnowledge,epoch:scope.epoch,
    stamp:stamp(),learningStamp:eligibilityStamp(actorId),
    options:new Map(choices.map((choice,index)=>[String(index+1),choice.id])),
    flow:'TOPIC_FOLLOW_UP',priorTopic,question:null};
  lease=l;issuing=true;
  try{
   game.preguntarEleccionMultiple({titulo:defs[actorId].nombre,
    pregunta:'¿Querés seguir conversando?',
    opciones:choices.map((choice,index)=>({valor:String(index+1),texto:choice.text})),
    callback:value=>choose(l,value)});
   l.question=game.pregunta;stats.offers++;return true;
  }catch{retire('SOCIAL_FOLLOWUP_UNAVAILABLE');return false;}finally{issuing=false;}
 }
 function choose(l,raw){
  if(lease!==l){stats.stale++;return;} // Never retire a newer owned question from a stale callback.
  try{
   if(!validLease(l,true)||typeof raw!=='string'||raw.trim()!==permit.value){stats.stale++;retire('STALE_SELECTION');return;}
   const entryId=l.options.get(permit.value);
   if((l.flow==='SOCIAL'||l.flow==='TOPIC_FOLLOW_UP')&&entryId==='TOPIC:EXIT'){
    lease=null;permit=null;pending=null;event=null;
    rootDisclosure?.revoke();rootTalkStamp=null;finishMissionContinuation();
    stats.lastReason='SOCIAL_CLOSED_BY_PLAYER';return;
   }
   if(l.flow==='SOCIAL'&&(entryId==='TOPIC:ROLE'||entryId==='TOPIC:METHOD'||entryId==='TOPIC:CURRENT')){
    lease=null;permit=null;pending=null;event=null;
    if(!contextSpeech(l.actorId,entryId)){stats.lastReason='SOCIAL_TOPIC_UNAVAILABLE';return;}
    event=null;contextFollowUp(l.actorId,entryId);return;
   }
   if(l.flow==='TOPIC_FOLLOW_UP'){
    const prior=l.priorTopic;
    lease=null;permit=null;pending=null;event=null;
    if(entryId==='TOPIC:OTHER'){offer(l.actorId,game.playerIdentityKnowledge);return;}
    if(entryId==='TOPIC:EXAMPLE'){
     if(!contextSpeech(l.actorId,entryId,prior)){stats.lastReason='SOCIAL_EXAMPLE_UNAVAILABLE';return;}
     event=null;offer(l.actorId,game.playerIdentityKnowledge);return;
    }
    stats.lastReason='SOCIAL_OPTION_UNAVAILABLE';return;
   }
   if(l.flow==='SOCIAL'&&entryId==='DOMAIN:ALCHEMY'){lease=null;permit=null;pending=null;event=null;alchemyPortFor(game)?.open(l.actorId,()=>{if(available(l.actorId)&&game.pregunta===null)offer(l.actorId,game.playerIdentityKnowledge);},()=>{if(!scope||!available('yao_fen'))fail('R56_ALCHEMY_A07_SCOPE');const revision='R56:ALCHEMY:'+sequence+':'+game.turnoGlobal,frame=scope.npcRuntime.capture(game,'yao_fen',{revision,permissions:null,gateStates:{}});return scope.npcRuntime.decide('yao_fen',frame,{schemaVersion:1,actorId:'yao_fen',turn:game.turnoGlobal,roomId:game.pos,source:ALCHEMY_SOURCE,data:{facts:{medicineCrisis:game.quests.M16==='activa',alchemyLesson:true},actionResults:{}}});});return;}
   if(l.flow==='SOCIAL'&&entryId==='DOMAIN:HERBALISM'){
    lease=null;permit=null;pending=null;event=null;
    herbalismPortFor(game)?.open(l.actorId,()=>{if(available(l.actorId)&&game.pregunta===null)offer(l.actorId,game.playerIdentityKnowledge);},()=>{
     if(!scope||!available('su_lian'))fail('R54_HERBALISM_A07_SCOPE');
     const revision='R54:HERBALISM:'+sequence+':'+game.turnoGlobal,frame=scope.npcRuntime.capture(game,'su_lian',{revision,permissions:null,gateStates:{}});
     return scope.npcRuntime.decide('su_lian',frame,{schemaVersion:1,actorId:'su_lian',turn:game.turnoGlobal,roomId:game.pos,source:HERBALISM_SOURCE,data:{facts:{gardenCrisis:game.quests.M16==='activa',tutorialDue:true},actionResults:{}}});
    });return;
   }
   if(l.flow==='SOCIAL'&&entryId==='DOMAIN:COMMERCE'){lease=null;permit=null;pending=null;event=null;commercePortFor(game)?.open(l.actorId,()=>{if(available(l.actorId)&&game.pregunta===null)offer(l.actorId,game.playerIdentityKnowledge);});return;}
   if(l.flow!=='SOCIAL'||entryId===SERVICE_CATALOG.entryId){
    lease=null;permit=null;pending=null;event=null;
    chooseService(l,entryId);return;
   }
   const r=catalog.response(l.actorId,entryId);
   lease=null;permit=null;pending=null;event=null; // consume before intention/realization/output
   if(r.status!=='AVAILABLE_ON_VERIFIED_COMMUNICATION'||!issue(l.actorId,'PLAYER_ENTRY',entryId))return;
   const u=realize({type:'REPLY',lineId:r.line.id,text:r.line.text,source:r.source});
   if(!u||!deliver(u,r.entry.text)){stats.lastReason='RESPONSE_UNAVAILABLE';return;}
   stats.selections++;stats.lastActor=l.actorId;stats.lastEntry=entryId;stats.lastLine=r.line.id;stats.lastReason='TERMINAL';rootDisclosure?.revoke();rootTalkStamp=null;finishMissionContinuation();
  }catch{stats.lastReason='RESPONSE_UNAVAILABLE';}
  finally{event=null;plans=new WeakMap();utterances=new WeakMap();a074?.invalidate();}
 }
 
 
 function emitRootPlayer(text){
  if(!validEvent()||event.actorId!=='shen_baojun')return false;
  const previous=game.contenido.lastElementChild,line='Tú: «'+text+'»',node=game.addLine(line,'dialogo');game.abajo();
  return !!node&&node!==previous&&node.parentNode===game.contenido&&node.isConnected===true&&node.textContent===line&&
   node.checkVisibility?.({checkOpacity:true,checkVisibilityCSS:true})===true&&node.getClientRects().length>0&&validEvent();
 }
 function deliverRoot(u){
  const proof=utterances.get(u);if(!proof||proof.event!==event||!validEvent())return false;
  utterances.delete(u);const text=defs[u.actorId].nombre+': «'+u.text+'»',previous=game.contenido.lastElementChild;
  const node=game.addLine(text,'dialogo');game.abajo();
  if(!node||node===previous||node.parentNode!==game.contenido||!node.isConnected||node.textContent!==text||
   node.checkVisibility?.({checkOpacity:true,checkVisibilityCSS:true})!==true||!node.getClientRects().length||!validEvent())return false;
  stats.deliveries++;return true;
 }
 function explainRoot(kind){
  const cap=rootDisclosure.prepareExplanation(kind);if(!cap)return true;
  const d=rootDisclosure.describe(cap),u=realize({type:'RD_ROOT',lineId:'RD:'+kind,rootPlan:cap,text:d.text,claims:d.semanticClaims});
  if(!u||!deliverRoot(u)){rootDisclosure.revoke();return false;}
  rootDisclosure.delivered(cap);return true;
 }

 function eligibilityStamp(actorId){try{const p=requireServicePort(service).capture(actorId);return p.status==='ALLOW'?JSON.stringify(p.eligibility):null;}catch{return null;}}
 function eligibleLessons(actorId){try{const p=requireServicePort(service).capture(actorId);return p.status==='ALLOW'?SERVICE_CATALOG.lessons.filter(l=>p.eligibility.eligibleIds.includes(l.techniqueId)):[];}catch{return [];}}
 function serviceAllowed(actorId){
  if(actorId!=='shen_baojun'||service===null||!available(actorId))return false;
  try{return requireServicePort(service).capture(actorId).status==='ALLOW';}catch{return false;}
 }
 function serviceProposal(actorId,entryId){
  if(!serviceAllowed(actorId)||!issue(actorId,'PLAYER_ENTRY',entryId))return false;
  const p=a074.prepare(game,actorId,context());
  if(p.status!=='PROPOSED'||a074.revalidate(game,p.intent,context()).status!=='VALID')return false;
  stats.intents++;return true;
 }
 function serviceQuestion(actorId,flow,lessonId=null,teachingCap=null,feedback=null){
  if(!serviceAllowed(actorId)||game.pregunta!==null){serviceStats.denials++;return false;}
  let teachingQuestion=null,teachingData=null;
  if(flow==='TEACHING'){teachingQuestion=service.teaching().question(teachingCap);teachingData=service.teaching().describeQuestion(teachingCap,teachingQuestion);}
  const opts=flow==='TEACHING'
   ?teachingData.options.map((o,n)=>({valor:String(n+1),texto:o.text,key:o.id})).concat([{valor:'0',texto:SERVICE_CATALOG.finishText,key:'CANCEL'}])
   :flow==='LESSONS'
   ?eligibleLessons(actorId).map((r,n)=>({valor:String(n+1),texto:r.name,key:r.lessonId})).concat(rootDisclosure.option()?[{valor:'2',texto:rootDisclosure.option(),key:'RD:DECLARE'}]:[]).concat([{valor:'0',texto:SERVICE_CATALOG.cancelText,key:'CANCEL'}])
   :[{valor:'1',texto:SERVICE_CATALOG.backText,key:'RETURN'}].concat(service.teaching().canBegin(lessonId)?[{valor:'2',texto:'Comenzar la lección.',key:'B12:BEGIN'}]:[]).concat([{valor:'0',texto:SERVICE_CATALOG.finishText,key:'CANCEL'}]);
  const l={actorId,identityAfter:game.playerIdentityKnowledge,epoch:scope.epoch,stamp:stamp(),learningStamp:eligibilityStamp(actorId),flow,lessonId,teachingCap,teachingQuestion,missionCap:missionSession,
   options:new Map(opts.map(o=>[o.valor,o.key])),question:null};
  lease=l;issuing=true;
  try{
   game.preguntarEleccionMultiple({titulo:defs[actorId].nombre+' · '+(flow==='LESSONS'?'Lecciones elementales':'Consulta de lección'),
    contextoEnBloque:flow==='TEACHING',contexto:flow==='TEACHING'?[...(feedback?[feedback]:[]),...(teachingData.demonstration?[teachingData.demonstration]:[]),teachingData.scene]:[],
    pregunta:flow==='TEACHING'?'¿Cómo actúas?':flow==='LESSONS'?'¿Qué lección quieres consultar?':'¿Cómo quieres continuar?',
    opciones:opts.map(({valor,texto})=>({valor,texto})),callback:value=>choose(l,value)});
   l.question=game.pregunta;Object.freeze(l.question.multipleChoice.opciones.map(Object.freeze));
   Object.freeze(l.question.multipleChoice.opciones);Object.freeze(l.question.multipleChoice);Object.freeze(l.question);
   serviceStats.offers++;stats.lastReason='F1_'+flow;return true;
  }catch{retire('F1_QUESTION_FAILED');return false;}finally{issuing=false;}
 }
 function chooseService(l,key){
  if(!serviceAllowed(l.actorId)){serviceStats.denials++;stats.lastReason='F1_PERMISSION_DENIED';return;}
  if(key==='CANCEL'){service.teaching().cancel();rootDisclosure.revoke();finishMissionContinuation();serviceStats.cancellations++;stats.lastReason='F1_CANCELLED';return;}
  if(key===SERVICE_CATALOG.entryId){
   if(serviceProposal(l.actorId,key)){if(!explainRoot('NEUTRAL'))return;serviceQuestion(l.actorId,'LESSONS');}return;
  }
  if(l.flow==='PREVIEW'&&key==='B12:BEGIN'){
   if(!serviceProposal(l.actorId,'B12:BEGIN'))return;
   const cap=service.teaching().begin(l.lessonId);serviceQuestion(l.actorId,'TEACHING',l.lessonId,cap);return;
  }
  if(l.flow==='TEACHING'){
   if(!serviceProposal(l.actorId,'B12:EVIDENCE'))return;
   const result=service.teaching().answer(l.teachingCap,l.teachingQuestion,key);
   if(result.status==='RETRY'){serviceQuestion(l.actorId,'TEACHING',l.lessonId,l.teachingCap,result.feedback);return;}
   if(result.status==='NEXT'){serviceQuestion(l.actorId,'TEACHING',l.lessonId,l.teachingCap);return;}
   if(result.status==='COMPLETE'){
    const receipt=service.teaching().commit(l.teachingCap,result.completion);
    if(receipt.status==='LEARNED'){
     // Learning published and invalidated all old leases before this line.
     // This is native system feedback from the private receipt, never an issuer.
     game.salida('Has aprendido la forma básica de '+receipt.name+'.','sistema');
     if(serviceAllowed(l.actorId)){
      if(serviceQuestion(l.actorId,'LESSONS'))if(!['cuerpo_horno','armadura_plata','espejo_luna','piel_cobre','paso_nube'].includes(receipt.techniqueId))service.visual().present(receipt.receipt);
     }else if(service.capture(l.actorId).reason==='ALL_LEARNED'){
      // Close only the basic teaching service. The same host offers its original social entries.
      offer(l.actorId,game.playerIdentityKnowledge);
      if(lease?.flow==='SOCIAL')if(!['cuerpo_horno','armadura_plata','espejo_luna','piel_cobre','paso_nube'].includes(receipt.techniqueId))service.visual().present(receipt.receipt);
     }
    }
    return;
   }
   return;
  }
  if(l.flow==='PREVIEW'&&key==='RETURN'){
   if(serviceProposal(l.actorId,'F1:RETURN')){serviceStats.returns++;serviceQuestion(l.actorId,'LESSONS');}return;
  }
  if(l.flow==='LESSONS'&&key==='RD:DECLARE'){
   if(!serviceProposal(l.actorId,key))return;
   const text=rootDisclosure.option();if(!text)return;
   const ticket=rootDisclosure.prepareDeclaration(text);rootDisclosure.deliverPlayer(ticket);
   if(explainRoot('PERSONAL'))serviceQuestion(l.actorId,'LESSONS');return;
  }
  if(l.flow!=='LESSONS')return;
  const line=eligibleLessons(l.actorId).find(x=>x.lessonId===key);if(!line||!issue(l.actorId,'PLAYER_ENTRY',line.lessonId))return;
  const u=realize({type:'F1_SERVICE',lineId:line.semanticKey,text:line.text,source:SERVICE_SOURCE});
  if(!u||!deliver(u,line.name)){stats.lastReason='F1_REALIZATION_OR_DELIVERY_FAILED';return;}
  lastServiceDelivery=freeze({status:'REALIZED_AND_NATIVE_DELIVERED',actorId:u.actorId,lessonId:line.lessonId,text:u.text,
   semanticKey:u.semanticKey,contextRevision:u.contextRevision,catalogRevision:u.realization.catalogRevision,
   sourceSHA256:SERVICE_SOURCE.sha256,worldWrites:0,grants:0});
  serviceStats.consultations++;stats.lastReason='F1_PREVIEW';serviceQuestion(l.actorId,'PREVIEW',line.lessonId);
 }

 const cancelPending=runtime=>{if(runtime===game){pending=null;event=null;identity.cancelPending(game);}};
 const inspect=()=>freeze({...stats,missionContinuation:missionBridge?.inspect()??null,rootDisclosure:rootDisclosure?.inspect()??null,service:{scope:'B1_B1_ONLY',...serviceStats,flow:lease?.flow??null,lastDelivery:lastServiceDelivery,permission:service?.capture('shen_baojun')??null,learning:'AUTHENTIC_NEW_FIRST_ACQUISITION',grants:service?.teaching().inspect().commits??0},phase:'A07.9',actors:32,counts:catalog.counts(),pending:lease?1:0,epoch:scope?.epoch??null,
  timers:0,history:0,persistence:false,freeAiText:false,worldWrites:0,autonomousTicks:0,activeAreaId:game&&roomAreas?roomAreas[game.pos]??null:null});
 return Object.freeze({configure,connected,retired,authorizeSpeak,openKnownOptions,respond,consumeVisibleOutput,beginInput,cancelPending,inspect,
  capabilities:()=>freeze({phase:'A07.9',actors:32,experimentalService:'SHEN_ELEMENTAL_BASIC_CONSULTATION_B1_B1',freeAiText:false,authoredSurface:'FROZEN_A079B_V1',directRequest:true,uiWritesBy:'NATIVE_ENGINE',history:0,timers:0,persistence:false}),
  dispose:()=>{unsubscribeLearning?.();retired();disposed=true;}});
}

export { createGeneralConversationHost };
