// FOCAL experimental: atomic ordinary-defeat relocation via the existing G08 store.
// No combat rollback, HP grant, slot resurrection, or historical SAVE mutation.
// Only destinations with a real, reachable-in-history sleeping room are eligible.
// 'visitadas' is the native visited-room registry; it is not a travel path
// or proof of recent occupancy. Prefer a known shelter within the area of
// the defeat, otherwise the certified M01 dorm, otherwise the most recently
// first-discovered legitimate shelter. No bed, gate or entitlement is created.
const ROOM = 'dormitorio_externos';
function chooseOrdinaryShelter(world, roomDefinitions) {
 if(!world||!roomDefinitions||typeof roomDefinitions!=='object'||!Array.isArray(world.visitadas))fail('SHELTER_GRAPH');
 const current=roomDefinitions[world.pos];
 if(!current)fail('UNKNOWN_DEFEAT_ROOM');
 const assignedDorm=world.quests?.M01==='hecha'&&world.flags?.arc1?.hitos?.M01_ALOJAMIENTO_ASIGNADO===true;
 const unique=new Set();const eligible=[];
 for(const id of world.visitadas){
  if(typeof id!=='string'||unique.has(id))continue;
  unique.add(id);const room=roomDefinitions[id];
  if(!room?.alojamiento)continue;
  if(id===ROOM&&!assignedDorm)continue;
  // The ordinary sleep command already accepts these native beds without
  // additional payment or claims. Mere rooms without beds are excluded.
  eligible.push(id);
 }
 if(!eligible.length)return null;
 const sameArea=eligible.filter(id=>roomDefinitions[id].area===current.area);
 if(sameArea.length)return sameArea.at(-1);
 if(eligible.includes(ROOM))return ROOM;
 return eligible.at(-1);
}
const fail = code => { throw new Error('ORDINARY_DEFEAT_'+code); };
const canonical = value => JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const copy = value => structuredClone(value);
function planOrdinaryDefeatRelocation(envelope,roomDefinitions) {
 const domains=envelope?.domains, world=domains?.World, player=domains?.Player?.state, lifecycle=domains?.Lifecycle;
 if(!envelope?.identity||!world||!player||!lifecycle)fail('MISSING_OWNER');
 if(player.ordinaryCombat||player.hp!==0||world.player?.hp!==0||world.terminado===true)fail('NOT_DEFEATED_QUIESCENT');
 if(world.pos==='nucleo_santuario_vinculo'||domains.A09Boss?.battle?.status==='ACTIVE')fail('BOSS_SCOPE');
 const a=player.combatArchives?.at(-1);
 if(!a||a.outcome!=='derrota'||typeof a.combatId!=='string'||!a.combatId||!a.seal)fail('NO_SEALED_DEFEAT');
 if(!Array.isArray(world.vivos)||!Array.isArray(world.visitadas)||lifecycle.room!==world.pos)fail('WORLD_GRAPH');
 const room=chooseOrdinaryShelter(world,roomDefinitions);
 if(!room)return {status:'NO_CERTIFIED_SHELTER',combatId:a.combatId};
 if(world.pos===room&&lifecycle.room===room)return {status:'ALREADY_AT_SHELTER',combatId:a.combatId,room};
 const after=copy(envelope);
 after.domains.World.pos=room;
 after.domains.World.vivos=[];
 after.domains.Lifecycle.room=room;
 // Assert only the three authorized properties changed. The store and preflight
 // verify the entire resulting envelope, including archive seal and player stats.
 const original=copy(envelope);
 original.domains.World.pos=room;original.domains.World.vivos=[];original.domains.Lifecycle.room=room;
 if(canonical(original)!==canonical(after))fail('FOREIGN_CHANGE');
 if(canonical(after.domains.Player)!==canonical(domains.Player)||canonical(after.identity)!==canonical(envelope.identity))fail('PLAYER_MUTATION');
 return {status:'RELOCATE',after,combatId:a.combatId,room};
}
function createOrdinaryDefeatDurable({store,capture,preflight,restoreStored,storage,roomDefinitions}) {
 let active=false;
 async function commit(){
  if(active)fail('ALREADY_IN_FLIGHT');
  const fence=storage.begin();active=true;let written=false;
  try{
   await new Promise(resolve=>setTimeout(resolve,0));
   const before=capture(),plan=planOrdinaryDefeatRelocation(before,roomDefinitions);
   if(plan.status!=='RELOCATE')return plan;
   const candidate=await store.candidate(plan.after);preflight(candidate);
   const rows=await store.list();
   if(!storage.current(fence)||canonical(capture())!==canonical(before))fail('STALE_CAS_CONTEXT');
   const s=storage.inspect(),result=await store.write(plan.after,{slotId:'a',expectedRevision:s.loadedGame===plan.after.identity.gameId?s.revision:0,expectedSlotVersion:rows.find(r=>r.slotId==='a')?.slotVersion||0});
   written=true;storage.committed(plan.after.identity.gameId,result);
   if(result.acknowledgementPending){storage.recovery('ORDINARY_DEFEAT_ACK_PENDING');return {status:'RECOVERY_REQUIRED_ACK_PENDING',combatId:plan.combatId,commitId:result.commitId};}
   try{restoreStored(result.cap);}catch(error){storage.recovery('ORDINARY_DEFEAT_RESTORE_FAILED:'+error.message);return {status:'RECOVERY_REQUIRED_MEMORY',combatId:plan.combatId,commitId:result.commitId};}
   return {status:'DURABLE_AND_RESTORED',combatId:plan.combatId,commitId:result.commitId};
  }catch(error){if(written)storage.recovery('ORDINARY_DEFEAT_COMMIT_UNKNOWN:'+error.message);throw error;}
  finally{active=false;storage.end(fence);}
 }
 return Object.freeze({commit,blocked:()=>active});
}

export { ROOM, chooseOrdinaryShelter, createOrdinaryDefeatDurable, planOrdinaryDefeatRelocation };
