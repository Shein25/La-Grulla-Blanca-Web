import { PILOT, own, turn, label, fnv32, same } from './data.js';
import { fail, copy, freeze } from '../a07/safe-data.js';

/** Host-owned structural authority. Only runtimePort is supplied to B4; not NPCs. */
function createNativeRuntimeAuthority({runtime,npcRuntime,topology,gateDefinitions,fingerprint=fnv32}){
 let last=null,blocked=false,disposed=false,peak=0;const pending=new Map();
 const routeRooms=[...new Set(PILOT.flatMap(a=>topology.routes[a]))];
 const neededGates=gateDefinitions.filter(g=>g.extremos.every(r=>routeRooms.includes(r))).map(g=>g.id).sort();
 function snapshot(){
  if(disposed||blocked)fail('A0764C_RUNTIME_UNAVAILABLE');
  const positions=own(runtime,'posicionNPC'),flags=own(runtime,'flags'),arc=own(flags,'arc1');
  const currentTurn=turn(own(runtime,'turnoGlobal')),playerRoom=label(own(runtime,'pos')),nativeRooms=own(runtime,'rooms');
  if(!topology.roomIds.includes(playerRoom))fail('A0764C_PLAYER_ROOM');
  const actorRows=topology.ids.map(actor=>{
   const p=own(positions,actor),room=label(own(p,'sala')),rawAnchor=own(p,'anclaje');
   if(!topology.roomIds.includes(room))fail('A0764C_ACTOR_ROOM');
   const anchor=rawAnchor===null?null:{room:label(own(rawAnchor,'room')),hasta:label(own(rawAnchor,'hasta'))};
   if(anchor&&anchor.room!==room)fail('A0764C_ANCHOR_DRIFT');
   const frame=npcRuntime.capture(runtime,actor,{revision:'A0764C_STRUCTURE',permissions:null,gateStates:{}});
   return {actor,room,anchor,knowledge:copy(frame.snapshot.knowledge)};
  });
  const relevantRooms=[...new Set([playerRoom,...actorRows.map(r=>r.room),...routeRooms])].sort();
  const areas=relevantRooms.map(room=>{
   const r=own(nativeRooms,room),area=label(own(r,'area'));
   if(area!==topology.roomAreas[room])fail('A0764C_AREA_DRIFT');
   let exits=null;
   if(routeRooms.includes(room)){
    const x=own(r,'exits'),keys=Object.keys(x).sort();if(keys.length>12)fail('A0764C_EXITS_BOUND');
    exits=Object.fromEntries(keys.map(k=>[label(k),label(own(x,k))]));
    for(const actor of PILOT)for(const next of topology.edges[actor][room]??[])
     if(!Object.values(exits).includes(next))fail('A0764C_EDGE_DRIFT');
   }
   return {room,area,exits};
  });
  const gates=Object.fromEntries(neededGates.map(id=>{const value=own(own(runtime,'gates'),id);if(typeof value!=='boolean')fail('A0764C_GATE_STATE');return [id,value];}));
  const ended=own(runtime,'terminado');if(typeof ended!=='boolean')fail('A0764C_LOCK_STATE');
  const owners=own(arc,'anclajePropietario');
  const ownership=Object.fromEntries(topology.ids.map(id=>{
   const d=Object.getOwnPropertyDescriptor(owners,id);if(!d)return [id,null];return [id,label(own(owners,id))];
  }));
  return freeze({turn:currentTurn,playerRoom,actors:actorRows,areas,gates,
   locks:{combat:own(runtime,'combate')!==null,question:own(runtime,'pregunta')!==null,ended},
   scope:label(own(arc,'estado')),ownership});
 }
 function read(){
  const state=snapshot(),serialized=JSON.stringify(state),fingerprintValue=fingerprint(serialized);
  if(!Number.isInteger(fingerprintValue)||fingerprintValue<0||fingerprintValue>0xffffffff)fail('A0764C_FINGERPRINT_VALUE');
  const revision='A0764C_R:'+String(fingerprintValue);
  for(const row of [...pending.values(),...(last?[last]:[])])
   if(row.revision===revision&&!same(row.state,state)){blocked=true;pending.clear();last=null;fail('A0764C_REVISION_COLLISION');}
  last=freeze({revision,state});peak=Math.max(peak,pending.size+1);return last;
 }
 const runtimePort=Object.freeze({capture(){const row=read();return {runtime,revision:row.revision};}});
 function hold(actor){
  if(!PILOT.includes(actor))fail('A0764C_ENGINE_ACTOR');
  const row=read();pending.set(actor,row);peak=Math.max(peak,pending.size+1);return row;
 }
 function take(actor,revision){const row=pending.get(actor);pending.delete(actor);if(!row||row.revision!==revision)return null;const now=read();return same(row.state,now.state)?row:null;}
 function facts(actor){
  const row=read(),p=row.state.actors.find(r=>r.actor===actor);
  if(!p||!PILOT.includes(actor))return freeze({actorId:actor,mode:null,anchor:null});
  return freeze({actorId:actor,turn:row.state.turn,room:p.room,area:topology.roomAreas[p.room],mode:'RUTA',
   anchor:copy(p.anchor),locks:Object.values(row.state.locks).some(Boolean),scope:row.state.scope,canonicalRoute:[...topology.routes[actor]]});
 }
 return Object.freeze({runtimePort,read,hold,take,facts,retirePending:()=>pending.clear(),clear:()=>{pending.clear();last=null;},
  quarantine:()=>{blocked=true;pending.clear();last=null;},dispose:()=>{disposed=true;pending.clear();last=null;},
  inspect:()=>freeze({pendingSnapshots:pending.size,currentSnapshot:last?1:0,peakRecords:peak,blocked,disposed,history:0,necessaryGateIds:[...neededGates]})});
}

export { createNativeRuntimeAuthority };
