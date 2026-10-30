import { clone, canonical } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

function createB1DurableTransactionPort({store,capture,preflight,restoreStored,validate,storage}){
 let active=false;const fail=k=>{throw Error('B1_G08_'+k);};
 return Object.freeze({async commit(proposal){if(active||!['B1_RECOVERY','B1_PILL','B1_FAILURE','B1_BUYBACK'].includes(proposal?.kind)||typeof proposal.stage!=='function'||typeof proposal.current!=='function')fail('PRIVATE_PROPOSAL');const fence=storage.begin();active=true;let written=false;
  try{await new Promise(r=>setTimeout(r,0));if(!proposal.current())fail('STALE');const before=capture(),after=clone(before),kind=proposal.kind;proposal.stage(after,storage.inspect().revision+1);
   if(canonical(before.identity)!==canonical(after.identity))fail('IDENTITY');
   const domains=kind==='B1_RECOVERY'?['B1Actions','Player','World','Lifecycle','A09Boss']:kind==='B1_PILL'?['B1Actions','Player','World','Ascensions']:kind==='B1_BUYBACK'?['B1Actions','Player','World','Materials']:['B1Actions'];
   for(const n of Object.keys(before.domains))if(!domains.includes(n)&&canonical(before.domains[n])!==canonical(after.domains[n]))fail('FOREIGN_DOMAIN:'+n);
   const bp=before.domains.Player.state,ap=after.domains.Player.state,pk=kind==='B1_RECOVERY'?['hp','qi','revision','sequence']:['B1_PILL','B1_BUYBACK'].includes(kind)?['stones','revision','sequence','serviceTransactions']:[];
   for(const k of Object.keys(bp))if(!pk.includes(k)&&canonical(bp[k])!==canonical(ap[k]))fail('PLAYER_FIELD:'+k);
   if(kind!=='B1_FAILURE'&&(ap.revision!==bp.revision+1||ap.sequence!==bp.sequence+1))fail('PLAYER_REVISION');
   if(kind==='B1_PILL'&&ap.stones!==bp.stones-30)fail('EXACT_30_REQUIRED');
   if(['B1_PILL','B1_BUYBACK'].includes(kind)){const prior=bp.serviceTransactions||[],next=ap.serviceTransactions||[];if(next.length!==prior.length+1||prior.some((t,i)=>canonical(t)!==canonical(next[i])))fail('LEDGER_APPEND_ONLY');const tx=next.at(-1);if(kind==='B1_PILL'&&(tx.kind!=='FIRST_UMBRAL_REPLACEMENT'||tx.fee!==30||tx.credit!==0))fail('PILL_LEDGER_DELTA');if(kind==='B1_BUYBACK'&&(ap.stones!==bp.stones+1||tx.kind!=='BUYBACK'||tx.npcId!=='yao_fen'||tx.itemId!=='grasa_qi_roida'||tx.credit!==1||tx.fee!==0))fail('YAO_EXACT_BUYBACK_DELTA');}
   if(kind==='B1_BUYBACK'){const bm=before.domains.Materials,am=after.domains.Materials,removed=bm.items.filter(i=>!am.items.some(j=>j.instanceId===i.instanceId));if(am.revision!==bm.revision+1||am.generation!==bm.generation||canonical(am.sources)!==canonical(bm.sources)||removed.length!==4||removed.some(i=>i.catalogId!=='grasa_qi_roida'||i.quantity!==1)||am.items.length!==bm.items.length-4||am.items.some(i=>!bm.items.some(j=>canonical(j)===canonical(i)))||am.consumed.length!==bm.consumed.length+4||bm.consumed.some(id=>!am.consumed.includes(id))||removed.some(i=>!am.consumed.includes(i.instanceId)))fail('YAO_MATERIAL_DELTA');}
   const bw=before.domains.World,aw=after.domains.World,wk=kind==='B1_RECOVERY'?['hp','qi']:['B1_PILL','B1_BUYBACK'].includes(kind)?['piedras']:[];
   for(const k of Object.keys(bw.player))if(!wk.includes(k)&&canonical(bw.player[k])!==canonical(aw.player[k]))fail('WORLD_PLAYER_FIELD:'+k);
   for(const k of Object.keys(bw))if(k!=='player'&&!(kind==='B1_RECOVERY'&&k==='pos')&&canonical(bw[k])!==canonical(aw[k]))fail('WORLD_FIELD:'+k);
   if(kind==='B1_RECOVERY'){for(const k of Object.keys(before.domains.Lifecycle))if(k!=='room'&&canonical(before.domains.Lifecycle[k])!==canonical(after.domains.Lifecycle[k]))fail('LIFECYCLE_FIELD');if(aw.pos!=='nucleo_sala_relevo'||after.domains.Lifecycle.room!==aw.pos||bp.hp!==0)fail('RECOVERY_LOCATION');}
   if(kind==='B1_PILL')for(const k of Object.keys(before.domains.Ascensions))if(k!=='replacementPills'&&canonical(before.domains.Ascensions[k])!==canonical(after.domains.Ascensions[k]))fail('ASCENSION_FIELD:'+k);
   validate(after.domains,after.identity);preflight(await store.candidate(after));const slots=await store.list();if(!storage.current(fence)||!proposal.current()||canonical(capture())!==canonical(before))fail('FENCE_CHANGED');const s=storage.inspect(),result=await store.write(after,{slotId:'a',expectedRevision:s.loadedGame===after.identity.gameId?s.revision:0,expectedSlotVersion:slots.find(x=>x.slotId==='a')?.slotVersion||0});written=true;storage.committed(after.identity.gameId,result);proposal.retire?.();
   if(result.acknowledgementPending){storage.recovery('B1_ACK_PENDING');return {status:'RECOVERY_REQUIRED',commitId:result.commitId};}try{restoreStored(result.cap);}catch(e){storage.recovery('B1_RESTORE:'+e.message);return {status:'RECOVERY_REQUIRED',commitId:result.commitId};}return {status:'DURABLE_AND_RESTORED',revision:result.revision,commitId:result.commitId};
  }catch(e){if(written)storage.recovery('B1_COMMITTED_RECOVERY');throw e;}finally{active=false;storage.end(fence);}
 }});
}

export { createB1DurableTransactionPort };
