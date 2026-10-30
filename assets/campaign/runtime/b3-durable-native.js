import { clone, canonical } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

// Native B3 transaction: original IndexedDB writer/CAS, detached actor and journal.
function createB3NativeTransactions({store,capture,preflight,restoreStored,validate,storage,verifyProposal}){
 let busy=false;const fail=s=>{throw Error('B3_NATIVE_G08_'+s);};
 return Object.freeze({async commit(proposal){
  if(busy||!['B3_NARRATIVE','B3_FOUNDATION'].includes(proposal?.kind)||typeof verifyProposal!=='function')fail('PRIVATE_PROPOSAL');
  const fence=storage.begin();busy=true;let written=false;
  try{
   await new Promise(r=>setTimeout(r,0));if(!proposal.current())fail('STALE_ACTOR');const before=capture(),after=clone(before);proposal.stage(after);
   if(!verifyProposal(proposal,before,after)||canonical(before.identity)!==canonical(after.identity))fail('UNVERIFIED_PHYSICAL_PROPOSAL');
   validate(after.domains,after.identity);preflight(await store.candidate(after));const slots=await store.list();
   if(!storage.current(fence)||!proposal.current()||canonical(capture())!==canonical(before))fail('FENCE_CHANGED');
   const st=storage.inspect(),result=await store.write(after,{slotId:'a',expectedRevision:st.loadedGame===after.identity.gameId?st.revision:0,expectedSlotVersion:slots.find(x=>x.slotId==='a')?.slotVersion||0});written=true;
   storage.committed(after.identity.gameId,result);proposal.retire();
   if(result.acknowledgementPending){storage.recovery('B3_ACK_PENDING');return {status:'RECOVERY_REQUIRED',commitId:result.commitId};}
   try{restoreStored(result.cap);}catch(e){storage.recovery('B3_RESTORE:'+e.message);return {status:'RECOVERY_REQUIRED',commitId:result.commitId};}
   return {status:'DURABLE_AND_RESTORED',commitId:result.commitId,revision:result.revision};
  }catch(e){if(written)storage.recovery('B3_COMMITTED_RECOVERY');throw e;}finally{busy=false;storage.end(fence);}
 }});
}

export { createB3NativeTransactions };
