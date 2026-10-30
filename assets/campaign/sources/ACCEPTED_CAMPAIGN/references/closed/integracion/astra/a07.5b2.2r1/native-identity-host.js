import { createNativeSelfIntroductionHost } from '../a07.5b2.2/native-self-introduction-host.js';
import { projectIdentity, knowsIdentity, proposeIdentity } from './player-identity-knowledge.js';
import { realizeNaturalIdentity, auditNaturalIdentity } from './natural-identity-surface.js';
import { freeze, fail, copy, exact } from '../a07/safe-data.js';

/** Trusted native delivery boundary. Proposals never adopt semantic state or write UI. */
const no=reason=>freeze({handled:false,text:null,deferReason:reason,utterance:null,trace:{phase:'A07.5B2.2R1',canonicalHandled:false,
 acquaintanceState:reason==='KNOWN_NO_REPEAT_NO_AUTHORIZED_NEUTRAL_RESPONSE'?'KNOWN':null,payload:null}});
function own(g,k){const d=Object.getOwnPropertyDescriptor(g,k);if(!d||!Object.hasOwn(d,'value'))fail('R1_CURRENT_NATIVE_DATA');return d.value;}
function stamp(g){return JSON.stringify(copy({turn:own(g,'turnoGlobal'),room:own(g,'pos'),positions:own(g,'posicionNPC'),
 knowledge:own(g,'conocimientoNPC'),player:own(g,'player'),quests:own(g,'quests'),gates:own(g,'gates'),flags:own(g,'flags'),
 question:own(g,'pregunta')===null,combat:own(g,'combate')===null,finished:own(g,'terminado'),identity:projectIdentity(g)}));}
function createNativeIdentityHost(){
 const base=createNativeSelfIntroductionHost();const pending=new WeakMap();let busy=false;
 const cancelPending=g=>{pending.delete(g);};
 function respond(raw){
  exact(raw,['runtime','npcDefinitions','npcId','nativeMissionResult']);cancelPending(raw.runtime);
  if(busy)return no('R1_REENTRANT');busy=true;
  try{
   if(raw.nativeMissionResult!=='')return no('NATIVE_CANONICAL_RESULT_NOT_EMPTY');
   if(knowsIdentity(raw.runtime,raw.npcId))return no('KNOWN_NO_REPEAT_NO_AUTHORIZED_NEUTRAL_RESPONSE');
   const r=base.respond(raw);if(!r.handled)return r;
   const u=realizeNaturalIdentity(r.trace.payload,{revision:r.trace.contextRevision,seed:0});
   if(!auditNaturalIdentity(u.text,r.trace.payload).valid)return no('R1_VOICE_NOT_VERIFIED');
   const candidate=proposeIdentity(projectIdentity(raw.runtime),raw.npcId);
   pending.set(raw.runtime,{text:u.text,stamp:stamp(raw.runtime),candidate,npcId:raw.npcId});
   return freeze({...copy(r),text:u.text,utterance:{...copy(r.utterance),...copy(u)},
    trace:{...copy(r.trace),phase:'A07.5B2.2R1',identityMeaning:'PLAYER_KNOWS_NPC_IDENTITY',acquaintanceState:'UNKNOWN',identityWrite:false}});
  }catch{return no('CURRENT_NATIVE_SOURCE_NOT_VERIFIED');}finally{busy=false;}
 }
 function consumeVisibleOutput(raw){
  exact(raw,['runtime','text','previousNode']);const g=raw.runtime,p=pending.get(g);pending.delete(g);
  if(!p)return null;
  try{
   if(raw.text!==p.text||stamp(g)!==p.stamp)return null;
   const container=own(g,'contenido'),node=container?.lastElementChild;
   if(!node||node===raw.previousNode||node.parentNode!==container||node.isConnected!==true||node.textContent!==p.text)return null;
   if(typeof node.checkVisibility!=='function'||!node.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||node.getClientRects().length===0)return null;
   return freeze({status:'IDENTITY_DELIVERY_CONFIRMED',npcId:p.npcId,...copy(p.candidate)});
  }catch{return null;}
 }
 return Object.freeze({respond,cancelPending,consumeVisibleOutput,capabilities:()=>freeze({phase:'A07.5B2.2R1',
  canonicalHandlerCalls:0,uiWrites:false,worldWrites:false,identityAdoptionBy:'NATIVE_ENGINE_ONLY',
  semanticMeaning:'PLAYER_KNOWS_NPC_IDENTITY',identityBound:32,ephemeralPendingPerRuntime:1,timers:0,history:0,
  copresenceUsedAsIdentity:false,relationshipsChanged:false})});
}

export { createNativeIdentityHost };
