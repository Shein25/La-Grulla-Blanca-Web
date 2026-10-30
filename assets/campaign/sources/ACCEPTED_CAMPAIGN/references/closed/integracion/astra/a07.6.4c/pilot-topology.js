import { registrations } from '../a07/registry.js';
import { own, PILOT, same, SOURCE } from './data.js';
import { fail, copy, freeze } from '../a07/safe-data.js';

function createPilotTopology(defs,rooms){
 const ids=registrations().map(r=>r.actorId),keys=Object.keys(defs);
 if(keys.length!==32||keys.some(id=>!ids.includes(id)))fail('A0764C_CANONICAL_IDS');
 const roomIds=Object.keys(rooms);if(!roomIds.length||roomIds.length>467)fail('A0764C_ROOMS_BOUND');
 const roomAreas=Object.fromEntries(roomIds.map(id=>[id,own(own(rooms,id),'area')]));
 const areaIds=[...new Set(Object.values(roomAreas))].sort();
 if(areaIds.length!==22)fail('A0764C_AREA_IDS');
 const routes={},edges={};
 for(const actor of PILOT){
  const def=own(defs,actor),canonical=registrations().find(r=>r.actorId===actor).canonical;
  const data=copy({routes:own(def,'rutas'),valid:own(def,'posicion_valida'),mode:own(def,'movilidad'),initial:own(def,'sala_inicial')});
  if(data.mode!=='RUTA'||!same(data.routes,canonical.rutas)||!same(data.valid,canonical.posicion_valida))fail('A0764C_PILOT_ROUTE_DRIFT');
  const neighbors={};let edgeCount=0;
  for(const pair of data.routes){
   if(pair.length!==2||pair[0]===pair[1])fail('A0764C_ROUTE_SHAPE');
   const [a,b]=pair;for(const [from,to] of [[a,b],[b,a]]){
    if(!data.valid.includes(from)||!data.valid.includes(to)||!Object.values(own(own(rooms,from),'exits')).includes(to))fail('A0764C_ROUTE_EDGE');
    (neighbors[from]??=[]).push(to);
   }edgeCount++;
  }
  if(edgeCount!==2||Object.keys(neighbors).length!==3||Object.values(neighbors).some(a=>new Set(a).size!==a.length))fail('A0764C_ROUTE_SHAPE');
  const tour=[data.initial],seen=new Set(tour);
  function visit(room){for(const next of neighbors[room]??[]){if(seen.has(next))continue;seen.add(next);tour.push(next);visit(next);tour.push(room);}}
  visit(data.initial);tour.pop();
  if(tour.length!==4||seen.size!==3)fail('A0764C_ROUTE_SHAPE');
  routes[actor]=tour;edges[actor]=neighbors;
 }
 return freeze({ids,roomIds,roomAreas,areaIds,routes,edges,
  areaBindings:areaIds.map(areaId=>({mode:'AGENDA',state:{version:1,areaId,syncedTurn:0,entities:[]},missionAnchorIds:[],source:copy(SOURCE)})),
  schedulerConfigurations:ids.map(id=>({config:{id,interval:2,minGap:0,firstPeriodicTurn:1},source:{...SOURCE,locator:'TECHNICAL_SCHEDULER_CADENCE_V1 / S2; not mobility or personality'}}))});
}

export { createPilotTopology };
