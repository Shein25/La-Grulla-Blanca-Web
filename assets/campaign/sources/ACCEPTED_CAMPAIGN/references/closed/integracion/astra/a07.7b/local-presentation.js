import { isObservationDrain, isOwnedObservationBatch } from '../a07.6.4b/npc-social-runtime-host.js';
import { registrations } from '../a07/registry.js';
import { exact, freeze } from '../a07/safe-data.js';
import { own } from '../a07.6.1/readonly-data.js';

/** Trusted output consumer only. No event ingress, command, semantic write or saved state. */
const fields=['sessionEpoch','eventOrdinal','exchangeOrdinal','turn','roomId','playerRoomId','speakerId','recipientId','direction','text'];
const names=new Map(registrations().map(r=>[r.actorId,r.canonical.nombre]));
const label=x=>typeof x==='string'&&x.length>0&&x.length<=128;
function createLocalPresentation(options){
 exact(options,['drainObservations','npcDefinitions','addLine']);
 const drain=options.drainObservations,defs=options.npcDefinitions,append=options.addLine;
 if(!isObservationDrain(drain)||typeof append!=='function')throw Error('A077B_OWNED_DRAIN_REQUIRED');
 let disposed=false,busy=false;
 const stats={lines:0,exchanges:0,wrongRoom:0,duplicateDrops:0,failedBatches:0,lastReason:null,peakBatch:0};
 const bump=(k,n=1)=>{stats[k]=Math.min(Number.MAX_SAFE_INTEGER,stats[k]+n);};
 const failed=reason=>{bump('failedBatches');stats.lastReason=reason;return freeze({status:'PRESENTATION_DROPPED',reason});};
 function present(){
  if(arguments.length)return failed('A077B_NO_EVENT_INGRESS');
  if(disposed||busy)return freeze({status:'PRESENTATION_SKIPPED',reason:disposed?'DISPOSED':'REENTRANT'});
  busy=true;const created=[];
  try{
   const batch=drain();
   if(!Array.isArray(batch)||!Object.isFrozen(batch)||batch.length>4||!isOwnedObservationBatch(batch,drain))return failed('A077B_INVALID_BATCH');
   stats.peakBatch=Math.max(stats.peakBatch,batch.length);
   const seen=new Map(),groups=new Map();let epoch=null,currentTurn=null;
   for(const e of batch){
    exact(e,fields);
    if(!Object.isFrozen(e)||!label(e.sessionEpoch)||!label(e.roomId)||!label(e.playerRoomId)||
       !names.has(e.speakerId)||!names.has(e.recipientId)||e.speakerId===e.recipientId||
       !['ROOT','RECIPROCAL'].includes(e.direction)||typeof e.text!=='string'||!e.text.length||e.text.length>40||
       ![e.eventOrdinal,e.exchangeOrdinal].every(n=>Number.isSafeInteger(n)&&n>0)||!Number.isSafeInteger(e.turn)||e.turn<0)
      return failed('A077B_INVALID_EVENT');
    epoch??=e.sessionEpoch;currentTurn??=e.turn;
    if(epoch!==e.sessionEpoch||currentTurn!==e.turn)return failed('A077B_MIXED_BOUNDARY');
    const key=e.sessionEpoch+':'+e.eventOrdinal;
    if(seen.has(key)){if(JSON.stringify(seen.get(key))!==JSON.stringify(e))return failed('A077B_CONFLICTING_EVENT_ID');bump('duplicateDrops');continue;}
    seen.set(key,e);
    if(!groups.has(e.exchangeOrdinal))groups.set(e.exchangeOrdinal,[]);groups.get(e.exchangeOrdinal).push(e);
   }
   const blocks=[];
   for(const rows of [...groups.entries()].sort(([a],[b])=>a-b).map(([,v])=>v)){
    const root=rows.find(e=>e.direction==='ROOT'),reply=rows.find(e=>e.direction==='RECIPROCAL');
    if(!root||rows.length>2||rows.filter(e=>e.direction==='ROOT').length!==1||rows.filter(e=>e.direction==='RECIPROCAL').length>1)
      return failed('A077B_INVALID_EXCHANGE');
    if(reply&&(reply.speakerId!==root.recipientId||reply.recipientId!==root.speakerId||reply.roomId!==root.roomId||
       reply.playerRoomId!==root.playerRoomId||reply.eventOrdinal<=root.eventOrdinal))return failed('A077B_INVALID_RECIPROCAL');
    if(root.playerRoomId!==root.roomId){bump('wrongRoom',rows.length);continue;}
    const block=[];
    for(const e of [root,...(reply?[reply]:[])]){
     const name=own(own(defs,e.speakerId),'nombre');
     if(name!==names.get(e.speakerId))return failed('A077B_PUBLIC_NAME_NOT_VERIFIED');
     block.push(name+': «'+e.text+'»'); // Exact substring from original REALIZED object; no re-realization.
    }
    blocks.push(block);
   }
   for(const block of blocks)for(const line of block){
    if(disposed)throw Error('A077B_RETIRED_PRESENTATION');
    const node=append(line,'dialogo');if(node)created.push(node);
    if(disposed||!node||node.textContent!==line||node.className!=='dialogo')throw Error('A077B_APPEND_NOT_EXACT');
   }
   bump('lines',blocks.reduce((n,b)=>n+b.length,0));bump('exchanges',blocks.length);
   return freeze({status:'PRESENTED',lines:blocks.reduce((n,b)=>n+b.length,0),exchanges:blocks.length});
  }catch{
   // UI rollback only. Never roll back movement, repeat IA or quarantine the social world.
   for(const node of created)try{node.remove?.();}catch{}
   return failed('A077B_PRESENTATION_FAILED');
  }finally{busy=false;}
 }
 return Object.freeze({present,dispose:()=>{disposed=true;},inspect:()=>freeze({...stats,disposed,busy,phase:'A07.7B',
  sameRoomVisibility:true,atomicGrouping:true,eventDedup:true,semanticSuppression:false,remoteVisibility:false,
  owners:disposed?0:1,cap:4,pending:0,history:0,persistence:false,timers:0,interaction:false})});
}

export { createLocalPresentation };
