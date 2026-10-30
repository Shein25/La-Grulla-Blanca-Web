import { registration } from './registry.js';
import { fail, copy, exact, freeze, text, source } from './safe-data.js';

/** A07.3 trusted, actor-scoped feed DTOs. Source references are not proof. */
const RELATION_FIELDS=Object.freeze(['afinidad','confianza','respeto','deuda','temor','rivalidad']);
const SOCIAL_LIMITS=Object.freeze({memoryEntries:32,eventBindings:64,relationshipBindings:1024,reputationBindings:32,episodesPerBatch:64,learningPerBatch:10});
function actor(id){if(id!=='player')registration(id);return id;}
function turn(value){if(!Number.isSafeInteger(value)||value<0)fail('A073_TURN');return value;}
function baseRelations(raw){const values=copy(raw);exact(values,RELATION_FIELDS);if(Object.values(values).some(v=>typeof v!=='number'||v<0||v>100))fail('A073_RELATION_RANGE');return freeze(values);}
function scoped(raw,frame,targetActorId=null){
 const dto=copy(raw);const required=['schemaVersion','actorId','turn','roomId','revision'];
 if(dto.schemaVersion!==1||dto.actorId!==frame.snapshot.actor.id||dto.turn!==frame.snapshot.turn||dto.roomId!==frame.snapshot.position.roomId||dto.revision!==frame.revision)fail('A073_FEED_SCOPE');
 if(targetActorId!==null&&dto.targetActorId!==targetActorId)fail('A073_PAIR_SCOPE');return {dto,required};
}
function observation(raw,frame,{witnessOnly=false}={}){
 const o=copy(raw),id=frame.snapshot.actor.id,currentTurn=frame.snapshot.turn;
 if(o.kind==='WITNESSED'){
  exact(o,['kind','observerActorId','observedTurn','roomId','authorized']);
  if(o.observerActorId!==id||o.observedTurn!==currentTurn||o.roomId!==frame.snapshot.position.roomId||o.authorized!==true)fail('A073_NOT_OWN_OBSERVATION');
  return {kind:o.kind,sourceActorId:id,observedTurn:o.observedTurn};
 }
 if(o.kind==='AUTHORIZED_COMMUNICATION'&&!witnessOnly){
  exact(o,['kind','recipientActorId','senderActorId','observedTurn','receivedTurn','transport','authorized']);actor(o.senderActorId);turn(o.observedTurn);
  if(o.recipientActorId!==id||o.senderActorId===id||o.observedTurn>currentTurn||o.receivedTurn!==currentTurn||o.authorized!==true||!['DIRECT','VERIFIED_DELIVERY'].includes(o.transport))fail('A073_INVALID_DELIVERY');
  if(o.transport==='DIRECT'&&(o.senderActorId==='player'?!frame.snapshot.perception.playerPresent:!frame.snapshot.perception.coPresentNpcIds.includes(o.senderActorId)))fail('A073_SENDER_NOT_PRESENT');
  return {kind:o.kind,sourceActorId:o.senderActorId,observedTurn:o.observedTurn};
 }
 fail('A073_OBSERVATION_SOURCE');
}
function bindings(raw,limit,fields,validate){
 if(!Array.isArray(raw)||raw.length>limit)fail('A073_BINDING_BOUND');const map=new Map();
 for(const item of raw){const b=copy(item);exact(b,fields);text(b.bindingId);source(b.source);registration(b.actorId);if(map.has(b.bindingId))fail('A073_DUPLICATE_BINDING');validate(b);map.set(b.bindingId,freeze(b));}return map;
}
function feed(raw){if(raw===undefined||raw===null)return null;exact(raw,['capture']);if(typeof raw.capture!=='function')fail('A073_FEED_PORT');return Object.freeze({capture:raw.capture.bind(raw)});}

export { RELATION_FIELDS, SOCIAL_LIMITS, actor, baseRelations, bindings, feed, observation, scoped, turn };
