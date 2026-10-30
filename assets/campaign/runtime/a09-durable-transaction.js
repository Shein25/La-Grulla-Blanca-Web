import { canonical, clone } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

const fail=s=>{throw Error('A09_G08_'+s);};
// The source-owner craft receipt is the only allowed metadata mutation in A09.
// No direct medicine grant, conversion, or treatment without an authenticated combat event.
function verifyA09SpecialAlchemyDelta(before,after){
 const prior=before.domains.A09Boss?.battle,now=after.domains.A09Boss?.battle;
 const newEvents=now?.journal?.slice(prior?.journal?.length||0)||[];
 const medicines=newEvents.filter(e=>e.type==='NATIVE_PLAYER_CONSUMABLE'&&e.specialTreatment);
 if(medicines.length>1)fail('MULTIPLE_SPECIAL_TREATMENTS_PER_STEP');
 const old=before.domains.World.player,next=after.domains.World.player;
 if(!medicines.length){for(const k of ['profesiones','impurezas','heridas_meridianos'])if(Object.hasOwn(old,k)!==Object.hasOwn(next,k)||Object.hasOwn(old,k)&&canonical(old[k])!==canonical(next[k]))fail('UNAUTHORIZED_SPECIAL_METADATA:'+k);return true;}
 const event=medicines[0],t=event.specialTreatment;
 if(t.source!=='R56_AUTHENTIC_CRAFTED_SPECIAL'||t.actionId!==event.actionId||t.itemId!==event.itemId||!['antidoto','ceniza','purificacion','meridianos'].includes(t.recipe)||typeof t.craftActionId!=='string')fail('SPECIAL_SOURCE');
 const oldAlchemy=old.profesiones?.alquimia,newAlchemy=next.profesiones?.alquimia;
 if(!oldAlchemy||!newAlchemy||!Array.isArray(oldAlchemy.craftsR56)||!Array.isArray(newAlchemy.craftsR56))fail('SPECIAL_CRAFT_LIST');
 const originals=oldAlchemy.craftsR56,updated=newAlchemy.craftsR56;
 const index=originals.findIndex(p=>p.actionId===t.craftActionId);
 if(index<0||originals[index].consumed!==false||originals[index].recipe!==t.recipe||originals[index].itemId!==t.itemId||updated.length!==originals.length)fail('SPECIAL_CRAFT_ORIGIN');
 const expectedProf=clone(old.profesiones);expectedProf.alquimia.craftsR56[index].consumed=true;
 if(canonical(next.profesiones)!==canonical(expectedProf))fail('SPECIAL_CRAFT_METADATA_OVERREACH');
 const inv=clone(old.inventario),at=inv.indexOf(t.itemId);if(at<0)fail('SPECIAL_ITEM_MISSING');inv.splice(at,1);
 if(canonical(inv)!==canonical(next.inventario))fail('SPECIAL_INVENTORY_ONE_DEBIT');
 for(const [key,recipe]of [['impurezas','purificacion'],['heridas_meridianos','meridianos']])if(t.recipe!==recipe&&(Object.hasOwn(old,key)!==Object.hasOwn(next,key)||Object.hasOwn(old,key)&&canonical(old[key])!==canonical(next[key])))fail('UNRELATED_TREATMENT_METADATA:'+key);
 const impurity=old.impurezas||0,wounds=old.heridas_meridianos||0,eff=t.effect;
 if(!eff?.applied||!Number.isSafeInteger(eff.removed)||eff.removed<=0)fail('SPECIAL_TREATMENT_EFFECT');
 const targetImpurity=t.recipe==='purificacion'?impurity-Math.min(3,impurity):impurity;
 const targetWounds=t.recipe==='meridianos'?wounds-1:wounds;
 if(t.recipe==='purificacion'&&(impurity<=0||eff.family!=='IMPURITY'||eff.removed!==Math.min(3,impurity))||t.recipe==='meridianos'&&(wounds<=0||eff.family!=='MERIDIAN_INJURY'||eff.removed!==1))fail('SPECIAL_TREATMENT_AMOUNT');
 if((next.impurezas||0)!==targetImpurity||(next.heridas_meridianos||0)!==targetWounds)fail('SPECIAL_TREATMENT_METADATA');
 return true;
}
function createA09DurableTransactionPort({store,capture,preflight,restoreStored,validate,storage}){
 for(const k of ['inspect','begin','current','committed','recovery','end'])if(typeof storage[k]!=='function')fail('PRIVATE_STORAGE_OWNER_REQUIRED');
 let active=false;
 async function commit(proposal){
  if(active||typeof proposal?.stage!=='function'||typeof proposal.current!=='function'||!proposal.kind?.startsWith('A09_'))fail('PRIVATE_PROPOSAL_REQUIRED');
  const fence=storage.begin();active=true;let written=false;
  try{
   // Retain the native input lease, but let A07 finish its input boundary.
   await new Promise(resolve=>setTimeout(resolve,0));
   if(!proposal.current())fail('STALE_NATIVE_PROPOSAL');const before=capture(),after=clone(before);proposal.stage(after);
   if(canonical(before.identity)!==canonical(after.identity))fail('IDENTITY_MUTATION');
   for(const name of Object.keys(before.domains))if(!['A09Boss','Player','World','LIVMissions','Lifecycle'].includes(name)&&canonical(before.domains[name])!==canonical(after.domains[name]))fail('FOREIGN_DOMAIN_MUTATION:'+name);
   for(const key of Object.keys(before.domains.Lifecycle))if(key!=='clock'&&canonical(before.domains.Lifecycle[key])!==canonical(after.domains.Lifecycle[key]))fail('FOREIGN_LIFECYCLE_MUTATION');
   const bp=before.domains.Player.state,ap=after.domains.Player.state;
   for(const k of Object.keys(bp))if(!['hp','qi','absorption','dots','revision','sequence','progression','inventory','medicineReceipts','ecology','ultiCooldown'].includes(k)&&canonical(bp[k])!==canonical(ap[k]))fail('PLAYER_FIELD_MUTATION:'+k);
   for(const key of ['known','purchased','mastered','equippedUltis','budget','available'])if(canonical(bp.progression[key])!==canonical(ap.progression[key]))fail('TECHNIQUE_BUDGET_OR_SELECTION_MUTATION:'+key);
   const bw=before.domains.World,aw=after.domains.World;
   verifyA09SpecialAlchemyDelta(before,after);
   for(const k of Object.keys(bw.player))if(!['hp','qi','inventario','profesiones','impurezas','heridas_meridianos'].includes(k)&&canonical(bw.player[k])!==canonical(aw.player[k]))fail('PLAYER_METADATA_REWARD_OR_STAT_MUTATION:'+k);
   for(const id of Object.keys(bw.quests))if(id!=='M18'&&bw.quests[id]!==aw.quests[id])fail('FOREIGN_MISSION_MUTATION:'+id);
   if(Object.keys(bp).sort().join()!==Object.keys(ap).sort().join())fail('PLAYER_V4_FIELDS_CHANGED');
   validate(after.domains,after.identity);const candidate=await store.candidate(after);preflight(candidate);
   const slots=await store.list();if(!storage.current(fence)||!proposal.current()||canonical(capture())!==canonical(before))fail('SAVE_FENCE_CHANGED');
   const s=storage.inspect(),result=await store.write(after,{slotId:'a',expectedRevision:s.loadedGame===after.identity.gameId?s.revision:0,expectedSlotVersion:slots.find(r=>r.slotId==='a')?.slotVersion||0});written=true;
   storage.committed(after.identity.gameId,result);proposal.retire?.();
   if(result.acknowledgementPending){storage.recovery('ACK_PENDING');return {status:'RECOVERY_REQUIRED_ACK_PENDING',commitId:result.commitId};}
   try{restoreStored(result.cap);}catch(e){storage.recovery('RESTORE_FAILED:'+e.message);return {status:'RECOVERY_REQUIRED_MEMORY',commitId:result.commitId};}
   return {status:'DURABLE_AND_RESTORED',commitId:result.commitId,revision:result.revision};
  }catch(e){if(written)storage.recovery('COMMIT_REQUIRES_RECOVERY:'+e.message);throw e;}
  finally{active=false;storage.end(fence);}
 }
 return Object.freeze({commit,blocked:()=>active});
}

export { createA09DurableTransactionPort, verifyA09SpecialAlchemyDelta };
