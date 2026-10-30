import { createActionAdapter } from '../a04/action-adapter.js';
import { ACTION_ID, PILOT, same } from './data.js';
import { fail, copy, freeze, exact } from '../a07/safe-data.js';

/** Only this trusted resolver calls the native physical writer. No AI callback in commit. */
function createNativeEnginePort({runtime,npcRuntime,authority,policy,bindings,navigation}){
 const validation=createActionAdapter({bindings,navigation}),appliedTurns=new Map();
 let busy=false,disposed=false,applies=0,resolves=0;
 const nativeCanMove=runtime.puedeMoverNPC,nativeApply=runtime.aplicarMovimientoNPC;
 if(typeof nativeCanMove!=='function'||typeof nativeApply!=='function')fail('A0764C_NATIVE_METHODS');
 function capture(actor){
  if(disposed||busy)fail('A0764C_ENGINE_UNAVAILABLE');
  const row=authority.hold(actor);
  return npcRuntime.capture(runtime,actor,{revision:row.revision,permissions:null,gateStates:copy(row.state.gates)});
 }
 function resolve(raw){
  if(disposed||busy)fail('A0764C_ENGINE_UNAVAILABLE');
  busy=true;resolves++;
  let command;
  const reply=(status,reason,revisionAfter,delta=null)=>freeze({schemaVersion:1,commandId:command.commandId,actorId:command.actorId,actionId:command.actionId,
   kind:command.kind,status,expectedRevision:command.expectedRevision,revisionAfter,reason,delta});
  try{
   command=copy(raw);exact(command,['schemaVersion','commandId','actorId','actionId','kind','turn','expectedRevision','operation']);
   exact(command.operation,['fromRoomId','toRoomId','direction','purpose']);
   if(command.schemaVersion!==1||command.kind!=='MOVE_STEP'||command.actionId!==ACTION_ID||!PILOT.includes(command.actorId))fail('A0764C_ENGINE_COMMAND');
   const prior=authority.take(command.actorId,command.expectedRevision),now=authority.read();
   if(!prior)return reply('STALE','REVISION_CHANGED',now.revision);
   const facts=authority.facts(command.actorId),proposal=policy.candidate(facts);
   if(facts.turn!==command.turn||facts.room!==command.operation.fromRoomId)return reply('STALE','POSITION_OR_TURN_CHANGED',now.revision);
   if(appliedTurns.get(command.actorId)===command.turn)return reply('REJECTED','DUPLICATE_APPLY',now.revision);
   if(proposal.status!=='CANDIDATE'||proposal.intent.targetRoomId!==command.operation.toRoomId||proposal.intent.commandId!==command.commandId)
    return reply('REJECTED','AMBIENT_POLICY_VETO',now.revision);
   const frame=npcRuntime.capture(runtime,command.actorId,{revision:now.revision,permissions:null,gateStates:copy(now.state.gates)});
   const checked=validation.prepare(proposal.intent,frame);
   if(checked.status!=='READY'||!same(checked.command,command))return reply('REJECTED','A03_A02_REVALIDATION',now.revision);
   if(!same(authority.read().state,prior.state))return reply('STALE','STRUCTURE_CHANGED',authority.read().revision);
   if(!nativeCanMove.call(runtime,command.actorId,command.operation.fromRoomId,command.operation.toRoomId))
    return reply('REJECTED','NATIVE_MOVE_REJECTED',now.revision);
   // Native methods are trusted synchronous motor authorities, never policy callbacks.
   // Guard may not mutate between read and apply.
   if(!same(authority.read().state,prior.state))return reply('STALE','NATIVE_GUARD_DRIFT',authority.read().revision);
   const applied=nativeApply.call(runtime,command.actorId,command.operation.toRoomId);
   const after=authority.read();
   if(applied===false&&same(after.state,prior.state))return reply('REJECTED','NATIVE_MOVE_REJECTED',after.revision);
   const expected=copy(prior.state);
   expected.actors.find(r=>r.actor===command.actorId).room=command.operation.toRoomId;
   // All pilot rooms already belong to the bounded projection, so room lists remain stable.
   if(applied!==true||!same(after.state,expected)||after.revision===command.expectedRevision){
    authority.quarantine();fail('A0764C_UNKNOWN_NATIVE_OUTCOME');
   }
   appliedTurns.set(command.actorId,command.turn);applies++;
   policy.applied(command.actorId,command.operation.fromRoomId,command.operation.toRoomId);
   return reply('APPLIED',null,after.revision,{fromRoomId:command.operation.fromRoomId,toRoomId:command.operation.toRoomId});
  }catch(error){authority.clear();authority.quarantine();throw error;}finally{busy=false;}
 }
 return Object.freeze({capture,resolve,finish:()=>authority.retirePending(),cancel:()=>authority.clear(),
  inspect:()=>freeze({applies,resolves,appliedActorRows:appliedTurns.size,pending:authority.inspect().pendingSnapshots,disposed}),
  dispose:()=>{disposed=true;authority.clear();appliedTurns.clear();}});
}

export { createNativeEnginePort };
