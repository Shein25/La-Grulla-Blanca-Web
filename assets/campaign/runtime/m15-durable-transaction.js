import { clone, canonical } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

// Same original G08 writer and CAS; independent allowlist from A09 combat.
function createM15DurableTransactionPort({store,capture,preflight,restoreStored,validate,storage}){
 let active=false;const fail=k=>{throw Error('M15_G08_'+k);};
 return Object.freeze({async commit(proposal){
  if(active||!proposal?.kind?.startsWith('M15_')||typeof proposal.stage!=='function')fail('PRIVATE_PROPOSAL');
  const fence=storage.begin();active=true;let written=false;
  try{
   await new Promise(r=>setTimeout(r,0));if(!proposal.current())fail('STALE_INPUT');
   const before=capture(),after=clone(before),revision=storage.inspect().revision+1;proposal.stage(after,revision);
   if(canonical(before.identity)!==canonical(after.identity))fail('IDENTITY');
   for(const name of Object.keys(before.domains))if(!['M15Graft','Player'].includes(name)&&canonical(before.domains[name])!==canonical(after.domains[name]))fail('FOREIGN_DOMAIN:'+name);
   const bp=before.domains.Player.state,ap=after.domains.Player.state;
   for(const k of Object.keys(bp))if(!['branches','revision','sequence'].includes(k)&&canonical(bp[k])!==canonical(ap[k]))fail('PLAYER_FIELD:'+k);
   const bb=bp.branches,ab=ap.branches;
   for(const k of Object.keys(bb))if(!['graft','revision'].includes(k)&&canonical(bb[k])!==canonical(ab[k]))fail('BRANCH_FIELD:'+k);
   const grafted=canonical(bb)!==canonical(ab);
   if(grafted&&(bb.graft||!ab.graft||ab.revision!==bb.revision+1||ap.revision!==bp.revision+1||ap.sequence!==bp.sequence+1||!after.domains.M15Graft.graftCommitted))fail('GRAFT_DELTA');
   if(!grafted&&(ap.revision!==bp.revision||ap.sequence!==bp.sequence))fail('UNEXPECTED_PLAYER_REVISION');
   validate(after.domains,after.identity);preflight(await store.candidate(after));
   const slots=await store.list();if(!storage.current(fence)||!proposal.current()||canonical(capture())!==canonical(before))fail('FENCE_CHANGED');
   const st=storage.inspect(),result=await store.write(after,{slotId:'a',expectedRevision:st.loadedGame===after.identity.gameId?st.revision:0,expectedSlotVersion:slots.find(s=>s.slotId==='a')?.slotVersion||0});written=true;
   storage.committed(after.identity.gameId,result);proposal.retire?.();
   if(result.acknowledgementPending){storage.recovery('M15_ACK_PENDING');return {status:'RECOVERY_REQUIRED',commitId:result.commitId};}
   try{restoreStored(result.cap);}catch(e){storage.recovery('M15_RESTORE:'+e.message);return {status:'RECOVERY_REQUIRED',commitId:result.commitId};}
   return {status:'DURABLE_AND_RESTORED',revision:result.revision,commitId:result.commitId};
  }catch(e){if(written)storage.recovery('M15_COMMITTED_RECOVERY');throw e;}finally{active=false;storage.end(fence);}
 }});
}

export { createM15DurableTransactionPort };
