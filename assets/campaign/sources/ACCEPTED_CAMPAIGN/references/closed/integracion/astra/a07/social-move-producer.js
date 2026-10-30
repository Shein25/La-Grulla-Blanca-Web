import { createActionAdapter } from '../a04/action-adapter.js';
import { freeze, fail, exact, sync, integer, capture } from '../a06/safe-data.js';
import { registrations } from './registry.js';

/** Confirmed physical copresence only. Host capability; never an NPC-facing API. */
const SOCIAL_SOURCE_ID='A04_MOVE_COPRESENCE';
const SOCIAL_EVENT_TYPE='CONFIRMED_ARRIVAL_COPRESENCE';
const SOCIAL_SOURCE=freeze({path:'integracion/astra/a04/action-adapter.mjs',sha256:'4352847cd28114a941fe22bd031857d7851120e7f12b57845b47f3dce1121cad',locator:'execute -> SUCCEEDED; MOVE_STEP APPLIED + own A01 before/after presence'});
const ids=registrations().map(r=>r.actorId),eligible=ids.filter(id=>id!=='lin_yue');
const branded=new WeakSet();
const isSocialMoveProducer=value=>branded.has(value);
const identifier=x=>{if(typeof x!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/.test(x))fail('A073B_SOURCE_ID');};

function createSocialMoveProducer(options){
 exact(options,['epoch','npcRuntime','bindings','navigation','enginePort','captureRuntime']);identifier(options.epoch);
 const epoch=options.epoch,npc=options.npcRuntime,read=sync(options.captureRuntime);
 if(!npc||typeof npc.capture!=='function'||JSON.stringify(npc.list().map(r=>r.actorId))!==JSON.stringify(ids))fail('A073B_RUNTIME_PORT');
 if(!Array.isArray(options.bindings)||options.bindings.some(b=>b.kind!=='MOVE_STEP'))fail('A073B_MOVE_SOURCE_ONLY');
 const actions=createActionAdapter({bindings:options.bindings,navigation:options.navigation,enginePort:options.enginePort});
 let sequence=0,lastTurn=null,generation=0,busy=false,blocked=false,disposed=false;
 const tickets=new WeakMap(),resumePlans=new WeakMap();
 function available(){if(disposed)fail('A073B_SOURCE_DISPOSED');if(busy)fail('A073B_SOURCE_REENTRANT');if(blocked)fail('A073B_SOURCE_RECONCILIATION_REQUIRED');}
 function current(){const f=read();exact(f,['runtime','revision']);if(typeof f.revision!=='string'||!f.revision.length)fail('A073B_SOURCE_REVISION');integer(f.runtime.turnoGlobal);return f;}
 function observations(f){return new Map(ids.map(id=>[id,npc.capture(f.runtime,id,{revision:f.revision,permissions:null,gateStates:{}}).snapshot]));}
 function execute(intent){
  available();busy=true;
  try{
   const before=current(),beforeRevision=before.revision,beforeTurn=before.runtime.turnoGlobal,beforePlayerRoom=before.runtime.pos;
   if(lastTurn!==null&&beforeTurn<lastTurn)fail('A073B_SOURCE_TIME_REWIND');
   const prior=observations(before),result=actions.execute(intent);
   if(result.status!=='SUCCEEDED'){
    if(result.mayHaveApplied){blocked=true;return freeze({status:'DEFERRED_SOURCE_RECONCILIATION',reasons:['A073B_UNKNOWN_ENGINE_OUTCOME'],result,ticket:null});}
    return freeze({status:'NO_SOCIAL_EVENT',result,ticket:null});
   }
   try{
    const after=current(),now=observations(after),v=result.validation,c=v.command,r=result.receipt;
    if(c.kind!=='MOVE_STEP'||v.revision!==beforeRevision||r.status!=='APPLIED'||r.revisionAfter!==after.revision||
      c.turn!==beforeTurn||after.runtime.turnoGlobal!==c.turn||after.runtime.pos!==beforePlayerRoom||
      prior.get(c.actorId)?.position.roomId!==c.operation.fromRoomId||now.get(c.actorId)?.position.roomId!==c.operation.toRoomId)fail('A073B_UNVERIFIED_MOVE');
    for(const id of ids){const pre=prior.get(id),post=now.get(id);
     if(post.turn!==beforeTurn||pre.turn!==beforeTurn||pre.position.anchored!==post.position.anchored||
       (id!==c.actorId&&pre.position.roomId!==post.position.roomId)||
       ['actor','territory','knowledge'].some(k=>JSON.stringify(pre[k])!==JSON.stringify(post[k])))fail('A073B_UNRELATED_RUNTIME_DELTA');
    }
    const candidates=[],mover=now.get(c.actorId),turn=c.turn;
    if(c.actorId!=='lin_yue'){
     for(const target of [...mover.perception.coPresentNpcIds,...(mover.perception.playerPresent?['player']:[])])
      candidates.push({observerId:c.actorId,record:{counterpartId:target,sourceId:SOCIAL_SOURCE_ID,sequence:0,typeId:SOCIAL_EVENT_TYPE,occurredTurn:turn,acquiredTurn:turn,acquisition:'PARTICIPATED'}});
    }
    for(const id of eligible){
     if(id===c.actorId)continue;const pre=prior.get(id),post=now.get(id);
     if(pre.position.roomId===c.operation.toRoomId&&post.position.roomId===pre.position.roomId&&
       !pre.perception.coPresentNpcIds.includes(c.actorId)&&post.perception.coPresentNpcIds.includes(c.actorId))
      candidates.push({observerId:id,record:{counterpartId:c.actorId,sourceId:SOCIAL_SOURCE_ID,sequence:0,typeId:SOCIAL_EVENT_TYPE,occurredTurn:turn,acquiredTurn:turn,acquisition:'WITNESSED'}});
    }
    // A06.1 identities are sourceId + sequence per observer, not per counterpart.
    // One physical receipt therefore proves a contiguous, indivisible fact batch.
    const span=Math.max(1,candidates.length);
    if(candidates.length>62||sequence>Number.MAX_SAFE_INTEGER-span)fail('A073B_SOURCE_BOUND');
    const firstSequence=sequence+1,next=sequence+span;
    for(const [offset,x] of candidates.entries())x.record.sequence=firstSequence+offset;
    const proof=freeze({sourceId:SOCIAL_SOURCE_ID,epoch,firstSequence,sequence:next,turn,generation,candidates});
    const ticket=Object.freeze({});tickets.set(ticket,proof);sequence=next;lastTurn=turn;
    return freeze({status:'CONFIRMED_SOCIAL_SOURCE_EVENT',result,ticket});
   }catch(error){blocked=true;return freeze({status:'DEFERRED_SOURCE_RECONCILIATION',reasons:[error.code??'A073B_POST_RESOLUTION_PROOF_FAILED'],result,ticket:null});}
  }finally{busy=false;}
 }
 function proof(ticket){if(disposed)fail('A073B_SOURCE_DISPOSED');const p=tickets.get(ticket);if(!p)fail('A073B_FOREIGN_EVENT_PROOF');return p;}
 function head(){available();const f=current();if(lastTurn!==null&&f.runtime.turnoGlobal<lastTurn)fail('A073B_SOURCE_TIME_REWIND');return freeze({sourceId:SOCIAL_SOURCE_ID,epoch,throughSequence:sequence,throughTurn:f.runtime.turnoGlobal});}
 function prepareResume(raw){available();const h=capture(raw);exact(h,['sourceId','epoch','throughSequence','throughTurn']);
  if(h.sourceId!==SOCIAL_SOURCE_ID||h.epoch!==epoch)fail('A073B_SOURCE_EPOCH');integer(h.throughSequence);integer(h.throughTurn);
  const plan=Object.freeze({});resumePlans.set(plan,{head:h,sequence,generation});return plan;
 }
 function commitResume(plan){available();const p=resumePlans.get(plan);if(!p||p.sequence!==sequence||p.generation!==generation)fail('A073B_STALE_SOURCE_RESTORE');
  if(generation===Number.MAX_SAFE_INTEGER)fail('A073B_SOURCE_BOUND');sequence=p.head.throughSequence;lastTurn=p.head.throughTurn;generation++;resumePlans.delete(plan);
 }
 const bindings=()=>freeze(eligible.map(observerId=>({observerId,sourceId:SOCIAL_SOURCE_ID,epoch,
  counterpartIds:['player',...ids.filter(id=>id!==observerId)],typeIds:[SOCIAL_EVENT_TYPE],acquisitions:['PARTICIPATED','WITNESSED'],source:capture(SOCIAL_SOURCE)})));
 const port=Object.freeze({execute,proof,head,prepareResume,commitResume,persistenceBindings:bindings,
  isCurrent:p=>!disposed&&!blocked&&p.generation===generation,
  capabilities:()=>freeze({eligibleObserverIds:[...eligible],advancedObserverId:'lin_yue',sourceId:SOCIAL_SOURCE_ID,epoch,typeIds:[SOCIAL_EVENT_TYPE],communicated:false,relationEffects:false,timers:0,listeners:0}),
  dispose:()=>{if(busy)fail('A073B_SOURCE_REENTRANT');disposed=true;}});
 branded.add(port);return port;
}

export { SOCIAL_EVENT_TYPE, SOCIAL_SOURCE, SOCIAL_SOURCE_ID, createSocialMoveProducer, isSocialMoveProducer };
