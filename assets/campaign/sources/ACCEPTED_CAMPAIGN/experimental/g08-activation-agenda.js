import { requireRestorePermit, clone } from './g08-semantic.js';
import { createAreaActivationState, activatePlayerArea } from '../references/closed/integracion/astra/a07/vendor/experimentos/area-activation/dormancy-v0.1/area-activation.js';
import { resolveAgendaCatchUp } from '../references/closed/integracion/astra/a07/vendor/experimentos/area-catchup/agenda-v0.2/agenda-resolver.js';
import { resolveOverrideCatchUp } from '../references/closed/integracion/astra/a07/vendor/experimentos/area-catchup/overrides-v0.3/override-resolver.js';
import { registration } from '../references/closed/integracion/astra/a07/registry.js';
import { copy, freeze, exact, source, fail, text } from '../references/closed/integracion/astra/a07/safe-data.js';

const resolve=(binding,state,request)=>binding.mode==='AGENDA'?resolveAgendaCatchUp(state,request):resolveOverrideCatchUp(state,request);
function createActivationAgendaBridge({areaIds,roomAreas,agendaBindings=[]}){
 const areas=copy(areaIds),rooms=freeze(copy(roomAreas)),bindings=new Map(),owned=new WeakSet();
 const activation=createAreaActivationState(areas.map(id=>({id}))),allActors=new Set();
 for(const raw of agendaBindings){
  const b=copy(raw);exact(b,['mode','state','source','missionAnchorIds']);source(b.source);
  if(!['AGENDA','OVERRIDES'].includes(b.mode)||!Array.isArray(b.missionAnchorIds))fail('A07_AGENDA_MODE');
  const s=b.state;if(!areas.includes(s.areaId)||bindings.has(s.areaId)||s.syncedTurn!==0)fail('A07_AGENDA_BINDING');
  // The closed resolver validates initial coherence even for an empty entity list.
  resolve(b,s,{areaId:s.areaId,fromTurn:0,toTurn:1,elapsedTurns:1});
  if(s.entities.length>32||b.missionAnchorIds.length>32)fail('A07_AGENDA_BOUND');
  const seen=new Set();
  for(const e of s.entities){
   const actor=registration(e.id);if(seen.has(e.id)||allActors.has(e.id)||e.agenda.slots.length>64||(e.overrides?.length??0)>32)fail('A07_AGENDA_BOUND');seen.add(e.id);allActors.add(e.id);
   const positions=[e.logicalRoomId,...e.agenda.slots.map(slot=>slot.roomId),...(e.overrides??[]).map(o=>o.roomId)];
   if(positions.some(room=>rooms[room]!==s.areaId||!actor.canonical.posicion_valida.includes(room)))fail('A07_AGENDA_TERRITORY');
  }
  const marked=new Set();for(const mark of b.missionAnchorIds){
   exact(mark,['actorId','overrideId']);const key=mark.actorId+':'+mark.overrideId;
   const e=s.entities.find(e=>e.id===mark.actorId),o=e?.overrides?.find(o=>o.id===mark.overrideId);
   if(b.mode!=='OVERRIDES'||!o||marked.has(key)||e.overrides.some(other=>other.id!==o.id&&other.priority>=o.priority))fail('A07_ANCHOR_PRECEDENCE');marked.add(key);
  }
  bindings.set(s.areaId,freeze(b));
 }
 function own(state){freeze(state);owned.add(state);return state;}
 const initial=own({activation,summaries:Object.fromEntries([...bindings].map(([id,b])=>[id,copy(b.state)]))});
 function advance(state,currentTurn,playerAreaId){
  if(!owned.has(state))fail('A07_FOREIGN_ACTIVATION_STATE');text(playerAreaId);
  const transition=activatePlayerArea(state.activation,currentTurn,playerAreaId);
  const ids=[...new Set([transition.previousAreaId,transition.activeAreaId].filter(Boolean))];
  const missing=ids.filter(id=>!bindings.has(id));
  if(missing.length)return freeze({status:'DEFERRED',state,reasons:['A07_CANONICAL_AGENDA_AREA_BINDINGS'],missingAreas:missing,transition:null,summaries:[]});
  const nextSummaries={...state.summaries},summaries=[];
  // Reconcile the area leaving at its deactivation boundary, then the target.
  // ALREADY_ACTIVE does not update lastSimulatedTurn in Activation v0.1.
  for(const id of ids){
   const prior=state.summaries[id],elapsedTurns=currentTurn-prior.syncedTurn;
   if(elapsedTurns>0){
    const request={areaId:id,fromTurn:prior.syncedTurn,toTurn:currentTurn,elapsedTurns};
    if(id===transition.activeAreaId&&transition.catchUp&&JSON.stringify(request)!==JSON.stringify(transition.catchUp))fail('A07_CATCHUP_BOUNDARY');
    const result=resolve(bindings.get(id),prior,request);nextSummaries[id]=result.state;
    summaries.push({areaId:id,result});
   }
  }
  // A failure above leaves the previously owned state untouched.
  return freeze({status:'READY',state:own({activation:transition.state,summaries:nextSummaries}),reasons:[],transition,summaries});
 }
 return Object.freeze({initialState:()=>initial,advance,restoreSemantic(d,c){requireRestorePermit(c.permit,c.envelope);const x=clone(d);exact(x,['activation','summaries']);if(x.activation.activeAreaId!==null&&!areas.includes(x.activation.activeAreaId))throw Error('G08_ACTIVATION_AREA');if(JSON.stringify(Object.keys(x.summaries).sort())!==JSON.stringify([...bindings.keys()].sort()))throw Error('G08_AGENDA_BINDINGS');for(const[id,s]of Object.entries(x.summaries))if(s.areaId!==id||!Number.isSafeInteger(s.syncedTurn)||s.syncedTurn<0||s.syncedTurn>c.envelope.domains.World.turnoGlobal)throw Error('G08_AGENDA_CLOCK');return own(x);}});
}

export { createActivationAgendaBridge };
