import { fail, freeze } from '../references/closed/integracion/astra/a07/safe-data.js';

const receipts=new WeakMap();
function requireVisibleM03Continuation(cap){const d=receipts.get(cap);if(!d||!d.current())fail('B15_MISSION_RECEIPT_NOT_AUTHENTIC_OR_CURRENT');return d;}
function createM03ContinuationBridge({runtime,scope,stamp,available,onBegin}){
 if(!runtime||[scope,stamp,available,onBegin].some(f=>typeof f!=='function'))fail('B15_PRIVATE_BRIDGE_PORT');
 let frame=null,pending=null,live=null,serial=0;const stats={missionCalls:0,canonicalRequests:0,confirmedDeliveries:0,rejectedDeliveries:0,offers:0,lastMissionResult:null,lastReason:null};
 const oldTalk=runtime.cmd_hablar,oldMission=runtime.gestionarMisionesNpc;
 function revoke(){frame=null;pending=null;live=null;serial++;}
 function current(d){return live===d.cap&&d.serial===serial&&scope()===d.scope&&runtime.pos==='sala_formas'&&runtime.quests?.M03==='activa'&&available()&&stamp()===d.stamp;}
 runtime.gestionarMisionesNpc=function(...args){const f=this===runtime?frame:null;const result=oldMission.apply(this,args);
  if(f){f.calls++;stats.missionCalls++;f.actorId=args[0];f.result=result;}
  return result;};
 runtime.cmd_hablar=function(...args){
  if(this!==runtime)return oldTalk.apply(this,args);
  const canCapture=runtime.pregunta===null&&runtime.quests?.M03==='activa'&&runtime.pos==='sala_formas'&&available();
  if(canCapture)onBegin();else revoke();
  const f={calls:0,actorId:null,result:null,scope:scope(),serial};frame=f;let result;
  try{result=oldTalk.apply(this,args);}finally{frame=null;}
  if(canCapture&&f.calls===1&&f.actorId==='shen_baojun'&&typeof result==='string'&&result.length&&result===f.result&&runtime.pregunta===null&&runtime.quests.M03==='activa'&&f.scope===scope()&&available()){
   pending={...f,result,stamp:stamp(),previousNode:runtime.contenido?.lastElementChild};stats.canonicalRequests++;stats.lastMissionResult=result;stats.lastReason='CANONICAL_RESULT_PENDING_VISIBLE_DELIVERY';
  }return result;
 };
 const api=Object.freeze({
  consume(raw){const p=pending;pending=null;if(!p)return null;
   const node=runtime.contenido?.lastElementChild;
   if(raw.runtime!==runtime||raw.text!==p.result||raw.previousNode!==p.previousNode||runtime.pregunta!==null||p.scope!==scope()||p.stamp!==stamp()||!available()||!node||node===p.previousNode||node.parentNode!==runtime.contenido||!node.isConnected||node.textContent!==p.result||node.checkVisibility?.({checkOpacity:true,checkVisibilityCSS:true})!==true||!node.getClientRects().length){
    stats.rejectedDeliveries++;stats.lastReason='MISSION_DELIVERY_NOT_CURRENT_OR_VISIBLE';return null;
   }
   const cap=Object.freeze({}),d=Object.freeze({cap,runtime,actorId:'shen_baojun',scope:p.scope,serial,stamp:p.stamp,originalResult:p.result,node,current:()=>current(d)});
   live=cap;receipts.set(cap,d);stats.confirmedDeliveries++;stats.lastReason='AUTHENTIC_CANONICAL_MISSION_VISIBLE';return cap;
  },
  offered(){stats.offers++;stats.lastReason='POSTLUDE_OFFERED_AFTER_CANONICAL_LINE';},
  revoke,
  inspect:()=>freeze({...stats,activeAuthority:!!live,history:0,persistence:false,timers:0})
 });return api;
}

export { createM03ContinuationBridge, requireVisibleM03Continuation };
