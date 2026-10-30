import { bindSemantic, requireRestorePermit, clone } from './g08-semantic.js';
import { createActivationAgendaBridge } from './g08-activation-agenda.js';
import { createScopedScheduler } from './g08-scoped-scheduler.js';
import { exact, source, copy, freeze, fail, text } from '../references/closed/integracion/astra/a07/safe-data.js';
import { registrations } from '../references/closed/integracion/astra/a07/registry.js';

function createAutonomousCycle(options){
 exact(options,['npcRuntime','areaIds','roomAreas','areaSource'],['agendaBindings','schedulerConfigurations']);source(copy(options.areaSource));
 const npc=options.npcRuntime,areas=copy(options.areaIds),rooms=freeze(copy(options.roomAreas));
 if(!npc||['capture','decide','list'].some(k=>typeof npc[k]!=='function')||JSON.stringify(npc.list())!==JSON.stringify(registrations().map(r=>({actorId:r.actorId,architecture:r.architecture}))))fail('A07_RUNTIME_PORT');
 if(Object.values(rooms).some(id=>!areas.includes(id)))fail('A07_ROOM_AREA_BINDING');
 const activation=createActivationAgendaBridge({areaIds:areas,roomAreas:rooms,agendaBindings:options.agendaBindings??[]});
 const scheduler=options.schedulerConfigurations===undefined?null:createScopedScheduler(options.schedulerConfigurations);
 let state={activation:activation.initialState(),scheduler:scheduler?.initialState()??null},disposed=false,running=false;
 function tick(runtime,input){
  if(disposed)fail('A07_DISPOSED');if(running)fail('A07_REENTRANT_CYCLE');
  const meta=copy(input);exact(meta,['turn','playerRoomId'],['schedulerEvents','maxDispatches','actorInputs']);text(meta.playerRoomId);
  if(!Number.isSafeInteger(meta.turn)||meta.turn<0)fail('A07_SCHEDULER_TURN');
  // Do not read any flags/quests/resources. Match the two explicit native fields.
  for(const [key,value] of [['turnoGlobal',meta.turn],['pos',meta.playerRoomId]]){
   const d=Object.getOwnPropertyDescriptor(runtime,key);if(!d||!Object.hasOwn(d,'value')||d.value!==value)fail('A07_NATIVE_CYCLE_CONTEXT');
  }
  if(!Object.hasOwn(rooms,meta.playerRoomId))fail('A07_UNKNOWN_PLAYER_AREA');
  function physicalArea(room){
   const container=Object.getOwnPropertyDescriptor(runtime,'rooms');
   const entry=container&&Object.hasOwn(container,'value')?Object.getOwnPropertyDescriptor(container.value,room):null;
   const area=entry&&Object.hasOwn(entry,'value')?Object.getOwnPropertyDescriptor(entry.value,'area'):null;
   if(!area||!Object.hasOwn(area,'value')||area.value!==rooms[room])fail('A07_NATIVE_AREA_DRIFT');return area.value;
  }
  const playerArea=physicalArea(meta.playerRoomId);
  if(!scheduler)return freeze({status:'DEFERRED',reasons:['A07_VERIFIED_SCHEDULER_BINDINGS'],activeAreaId:state.activation.activation.activeAreaId,decisions:[],runtimeConnected:false});
  running=true;
  try{
   const activated=activation.advance(state.activation,meta.turn,playerArea);
   if(activated.status==='DEFERRED')return freeze({status:'DEFERRED',reasons:activated.reasons,activeAreaId:state.activation.activation.activeAreaId,missingAreas:activated.missingAreas,decisions:[],runtimeConnected:false});
   const activeAreaId=activated.state.activation.activeAreaId,frames=new Map(),activeIds=[],inputs=meta.actorInputs??[];
   if(!Array.isArray(inputs)||inputs.length>32)fail('A07_ACTOR_INPUT_BOUND');
   const byId=new Map();for(const a of inputs){exact(a,['actorId','context','projection']);if(byId.has(a.actorId)||!registrations().some(r=>r.actorId===a.actorId))fail('A07_ACTOR_INPUT_SCOPE');byId.set(a.actorId,a);}
   for(const row of registrations()){
    const positions=Object.getOwnPropertyDescriptor(runtime,'posicionNPC');
    const position=positions&&Object.hasOwn(positions,'value')?Object.getOwnPropertyDescriptor(positions.value,row.actorId):null;
    const sala=position&&Object.hasOwn(position,'value')?Object.getOwnPropertyDescriptor(position.value,'sala'):null;
    if(!sala||!Object.hasOwn(sala,'value')||!Object.hasOwn(rooms,sala.value))fail('A07_UNKNOWN_ACTOR_AREA');
    if(physicalArea(sala.value)!==activeAreaId)continue;
    const input=byId.get(row.actorId),context=input?.context??{revision:`A07.2:${meta.turn}`,permissions:null,gateStates:{}};
    const frame=npc.capture(runtime,row.actorId,context);
    if(frame.snapshot.position.roomId!==sala.value||frame.snapshot.turn!==meta.turn)fail('A07_NATIVE_CYCLE_CONTEXT');
    activeIds.push(row.actorId);frames.set(row.actorId,frame);
   }
   const scheduled=scheduler.advance(state.scheduler,meta.turn,activeIds,meta.schedulerEvents??[],meta.maxDispatches??32);
   const decisions=scheduled.dispatches.map(dispatch=>({dispatch,decision:npc.decide(dispatch.npcId,frames.get(dispatch.npcId),byId.get(dispatch.npcId)?.projection??null)}));
   // No controller state/session is retained or adopted. All operations above
   // must succeed before committing these technical lifecycle candidates.
   state={activation:activated.state,scheduler:scheduled.state};
   return freeze({status:'CYCLE_COMPLETE',reasons:[],activeAreaId,activation:activated.transition,logicalSummaries:activated.summaries,
    scheduling:{status:scheduled.status,eligibleCount:scheduled.eligibleCount,deferredCount:scheduled.deferredCount,work:scheduled.work},decisions,executed:false,runtimeConnected:false});
  }finally{running=false;}
 }
 const api=Object.freeze({tick,inspect:()=>freeze({disposed,activeAreaId:state.activation?.activation.activeAreaId??null,activation:state.activation,scheduler:state.scheduler}),
  dispose:()=>{if(running)fail('A07_REENTRANT_CYCLE');disposed=true;state={activation:null,scheduler:null};}});bindSemantic(api,{capture(){if(running||disposed)throw Error('G08_A07_CYCLE_BUSY_OR_DISPOSED');return clone({version:1,state});},prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1)throw Error('G08_A07_CYCLE_VERSION');const next={activation:activation.restoreSemantic(d.state.activation,c),scheduler:scheduler?scheduler.restoreSemantic(d.state.scheduler,c):null};return {apply(){const old=state;state=next;return ()=>{state=old;};}};}});return api;
}

export { createAutonomousCycle };
