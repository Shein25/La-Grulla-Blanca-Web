import { bindSemantic, requireRestorePermit, clone } from './g08-semantic.js';
import { turn, PILOT, fnv32, ACTION_ID } from '../references/closed/integracion/astra/a07.6.4c/data.js';
import { freeze, fail } from '../references/closed/integracion/astra/a07/safe-data.js';

const thresholds=Object.freeze({mei_lian:2500,guo_chen:4000});
// Ratified B0-compatible fingerprint preserves the 1000-action reference exactly.
// This prefix identifies an algorithm input, never a capability or numeric global canon.
function pilotMobilityGate(actorId,nativeTurn){
 turn(nativeTurn);if(!PILOT.includes(actorId))return freeze({eligible:false,bucket:null});
 const bucket=fnv32('B0_HASH_V1:'+actorId+':'+nativeTurn)%10000;
 return freeze({eligible:bucket<thresholds[actorId],bucket});
}
function createAmbientMobilityPolicy(topology){
 const cursors=new Map();let disposed=false;
 function candidate(facts){
  if(disposed)fail('A0764C_POLICY_DISPOSED');
  if(!PILOT.includes(facts.actorId))return freeze({status:'NO_BINDING',intent:null});
  // Native privileged guards; none of these are brain knowledge.
  if(facts.anchor!==null||facts.mode!=='RUTA'||facts.locks||!['PROLOGO','LI_INTEGRACION','LII_TERRITORIO','LIII_INVESTIGACION'].includes(facts.scope))
   return freeze({status:'VETO',intent:null});
  if(!pilotMobilityGate(facts.actorId,facts.turn).eligible)return freeze({status:'GATED',intent:null});
  const tour=topology.routes[facts.actorId],saved=cursors.get(facts.actorId);
  const at=saved!==undefined&&tour[saved]===facts.room? saved:tour.indexOf(facts.room);
  if(at<0)return freeze({status:'VETO',intent:null});
  const to=tour[(at+1)%tour.length];
  if(!topology.edges[facts.actorId][facts.room]?.includes(to))fail('A0764C_ROUTE_STEP');
  return freeze({status:'CANDIDATE',origin:'AMBIENT_MOBILITY',intent:{schemaVersion:1,
   commandId:'A0764C:'+facts.actorId+':'+facts.turn,actionId:ACTION_ID,actorId:facts.actorId,turn:facts.turn,
   fromRoomId:facts.room,targetRoomId:to,purpose:'DESTINATION'}});
 }
 function applied(actor,from,to){
  if(disposed)fail('A0764C_POLICY_DISPOSED');
  const tour=topology.routes[actor],saved=cursors.get(actor),at=saved!==undefined&&tour[saved]===from?saved:tour.indexOf(from);
  if(at<0||tour[(at+1)%tour.length]!==to)fail('A0764C_CURSOR_PROOF');
  cursors.set(actor,(at+1)%tour.length);
 }
 const api=Object.freeze({candidate,applied,inspect:()=>freeze({entries:cursors.size,cursors:Object.fromEntries(cursors),persistent:false}),
  dispose:()=>{disposed=true;cursors.clear();}});
 bindSemantic(api,{capture:()=>clone({version:1,cursors:[...cursors]}),prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||new Set(d.cursors.map(x=>x[0])).size!==d.cursors.length||d.cursors.some(([actor,index])=>!PILOT.includes(actor)||!Number.isSafeInteger(index)||index<0||index>=topology.routes[actor].length))throw Error("G08_A07_CURSOR");return {apply(){const old=new Map(cursors);cursors.clear();for(const[k,v]of d.cursors)cursors.set(k,v);return ()=>{cursors.clear();for(const[k,v]of old)cursors.set(k,v);};}};}});return api;
}

export { createAmbientMobilityPolicy, pilotMobilityGate };
