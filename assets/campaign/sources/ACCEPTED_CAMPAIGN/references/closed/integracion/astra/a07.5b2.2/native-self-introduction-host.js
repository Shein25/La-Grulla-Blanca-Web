import { createSelfIntroductionBindings } from '../a07.5b2.1r2/self-introduction-bindings.js';
import { classifyNativeMissionResult, B2_NATIVE_CONTRACT } from '../a07.5b2/safe-player-dialogue-adapter.js';
import { freeze, fail, copy, exact } from '../a07/safe-data.js';

/** B2.2: consumes the real native empty result once; never reruns mission effects. */
const no=reason=>freeze({handled:false,text:null,deferReason:reason,utterance:null,trace:{phase:'A07.5B2.2',canonicalHandled:false,acquaintanceState:reason==='KNOWN_NO_REPEAT_NO_AUTHORIZED_NEUTRAL_RESPONSE'?'KNOWN':null,payload:null}});
function own(record,key){const d=record&&Object.getOwnPropertyDescriptor(record,key);if(!d||!Object.hasOwn(d,'value'))fail('B22_OWN_CURRENT_NATIVE_DATA');return d.value;}
function canonicalStamp(game){
 const flags=own(game,'flags'),arc1=own(flags,'arc1');
 if(!arc1||typeof arc1!=='object'||Array.isArray(arc1))fail('B22_NATIVE_CANONICAL_CONTEXT_REQUIRED');
 if(own(game,'pregunta')!==null||own(game,'combate')!==null||own(game,'terminado')!==false)fail('B22_NATIVE_INTERACTION_UNAVAILABLE');
 const state=copy({turn:own(game,'turnoGlobal'),room:own(game,'pos'),player:own(game,'player'),
  quests:own(game,'quests'),gates:own(game,'gates'),arc1,positions:own(game,'posicionNPC')});
 if(!Number.isSafeInteger(state.turn)||state.turn<0)fail('B22_CURRENT_TURN');
 const value=JSON.stringify(state);if(value.length>131072)fail('B22_NATIVE_CONTEXT_BOUND');
 return value;
}
const revision=stamp=>{let h=2166136261;for(const ch of stamp)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return 'B22:'+h.toString(16);};
function createNativeSelfIntroductionHost(options={}){
 exact(options,[],['socialContinuity']);
 // No history, introduced flags, counters, retained receipts or relation writes.
 let busy=false;
 function respond(raw){
  exact(raw,['runtime','npcDefinitions','npcId','nativeMissionResult']);if(busy)return no('B22_REENTRANT');busy=true;
  let adapter;
  try{
   if(classifyNativeMissionResult(raw.nativeMissionResult)!=='MISSION_NOT_HANDLED')return no('NATIVE_CANONICAL_RESULT_NOT_EMPTY');
   const game=raw.runtime,observed=canonicalStamp(game),turn=own(game,'turnoGlobal'),contextRevision=revision(observed),
    eventId='HABLAR:'+raw.npcId+':'+turn;
   // The hash is only a short technical label. Authorization compares the entire
   // current stamp, never trusts that hash or a caller-provided absence flag.
   const entrypointPort={revalidate:request=>{
    if(request.command!=='HABLAR'||request.npcId!==raw.npcId||request.recipientId!=='player'||request.eventId!==eventId||request.contextRevision!==contextRevision)return {status:'STALE'};
    if(canonicalStamp(game)!==observed)return {status:'STALE'};
    return {status:'NO_CANONICAL_INTERACTION',npcId:raw.npcId,recipientId:'player',eventId,contextRevision,
     nativeMissionResult:raw.nativeMissionResult,source:copy(B2_NATIVE_CONTRACT)};
   }};
   adapter=createSelfIntroductionBindings({npcDefinitions:raw.npcDefinitions,captureRuntime:()=>game,entrypointPort,
    ...(options.socialContinuity?{socialContinuity:options.socialContinuity}:{})});
   const prepared=adapter.prepare({command:'HABLAR',npcId:raw.npcId,eventId,contextRevision,seed:0});
   if(prepared.status!=='PROPOSED')return no(prepared.reason);
   const result=adapter.realize({prepared});
   if(!result.handled)return no(result.deferReason);
   return freeze({...copy(result),connectionInstalled:true,trace:{phase:'A07.5B2.2',canonicalHandled:false,
    actorId:raw.npcId,recipientId:'player',eventId,contextRevision,acquaintanceState:prepared.payload.acquaintanceState,
    payload:copy(prepared.payload),voiceProfile:copy(result.utterance.voiceProfile),variant:result.utterance.realization.variant,
    canonicalSourceBasis:copy(B2_NATIVE_CONTRACT),canonicalSourceMeaning:'Audited PRE authority; preserved native mission handler. Not a claim that modified HTML bytes retain PRE hash.'}});
  }catch{return no('CURRENT_NATIVE_SOURCE_NOT_VERIFIED');}
  finally{adapter?.dispose();busy=false;}
 }
 return Object.freeze({respond,capabilities:()=>freeze({phase:'A07.5B2.2',functions:['SELF_INTRODUCTION'],freeAiText:false,
  canonicalHandlerCalls:0,uiWrites:false,worldWrites:false,memoryWrites:false,persistence:false,knownAuthorityAdded:false,neverMetProduced:false,history:0,timers:0})});
}

export { createNativeSelfIntroductionHost };
