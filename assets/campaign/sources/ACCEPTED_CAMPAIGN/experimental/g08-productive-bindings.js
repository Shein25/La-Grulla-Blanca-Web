import { bindSemantic, requireRestorePermit, semanticPort, clone } from './g08-semantic.js';
import { createNpcRuntime } from '../references/closed/integracion/astra/a07/npc-runtime.js';
import { createAutonomousCycle } from './g08-autonomous-cycle.js';
import { createNpcSocialRuntimeHost } from '../references/closed/integracion/astra/a07.6.4b/npc-social-runtime-host.js';
import { createKnowledgePermissionGuard } from '../references/closed/integracion/astra/a02/knowledge-permission-guard.js';
import { createNavigationAdapter } from '../references/closed/integracion/astra/a03/navigation-adapter.js';
import { createActionAdapter } from '../references/closed/integracion/astra/a04/action-adapter.js';
import { PILOT, ACTION_ID, SOURCE } from '../references/closed/integracion/astra/a07.6.4c/data.js';
import { createPilotTopology } from '../references/closed/integracion/astra/a07.6.4c/pilot-topology.js';
import { createAmbientMobilityPolicy } from './g08-ambient-policy.js';
import { createNativeRuntimeAuthority } from '../references/closed/integracion/astra/a07.6.4c/native-runtime-port.js';
import { createNativeEnginePort } from '../references/closed/integracion/astra/a07.6.4c/native-engine-port.js';
import { createProductiveCycleWrapper } from '../references/closed/integracion/astra/a07.6.4c/productive-cycle-wrapper.js';
import { createFreshEpochProducer } from '../references/closed/integracion/astra/a07.6.4c/epoch-factory.js';
import { exact, freeze, copy } from '../references/closed/integracion/astra/a07/safe-data.js';

function createPilotProductiveMobilityBindings(options){
 exact(options,['runtime','npcDefinitions','roomDefinitions','gateDefinitions']);
 const {runtime,npcDefinitions:defs,roomDefinitions:rooms,gateDefinitions:gates}=options;
 const topology=createPilotTopology(defs,rooms),npc=createNpcRuntime({npcDefinitions:defs,roomDefinitions:rooms,gateDefinitions:gates});
 const bindings=freeze([{policy:{actionId:ACTION_ID,effect:'ROUTINE',channel:'DIRECT',actorIds:[...PILOT],knowledge:[],
  resourceId:null,requiresPlayer:false,source:'A07.6.4C-B1_AUTHORIZED_PILOT_AMBIENT_MOBILITY'},kind:'MOVE_STEP',lineId:null}]);
 const guard=createKnowledgePermissionGuard(bindings.map(b=>b.policy)),navigation=createNavigationAdapter(rooms,gates,defs,guard);
 const authority=createNativeRuntimeAuthority({runtime,npcRuntime:npc,topology,gateDefinitions:gates});
 const policy=createAmbientMobilityPolicy(topology),enginePort=createNativeEnginePort({runtime,npcRuntime:npc,authority,policy,bindings,navigation});
 const actions=createActionAdapter({bindings,navigation});
 const actual=createAutonomousCycle({npcRuntime:npc,areaIds:topology.areaIds,roomAreas:topology.roomAreas,areaSource:SOURCE,
  agendaBindings:topology.areaBindings,schedulerConfigurations:topology.schedulerConfigurations});
 const cycle=createProductiveCycleWrapper({cycle:actual,authority,npcRuntime:npc,policy,actions});
 let host=null,producer=null,epoch=null,disposed=false,quarantined=false;
 try{
  // Validation before allocation; an invalid construction never silently claims a live channel.
  authority.runtimePort.capture();
  producer=createFreshEpochProducer({npcRuntime:npc,bindings,navigation,enginePort,captureRuntime:authority.runtimePort.capture});
  epoch=producer.capabilities().epoch;
  host=createNpcSocialRuntimeHost({ownershipScope:runtime,runtimePort:authority.runtimePort,npcDefinitions:defs,roomDefinitions:rooms,
   autonomousCycle:cycle,socialMoveProducer:producer});
 }catch(error){cycle.dispose();enginePort.dispose();producer?.dispose();authority.dispose();throw error;}
 function inspect(){return freeze({phase:'A07.6.4C-B1',productiveBindingPackImplemented:true,productiveBindingsLiveConnected:false,
  runtimeConnected:false,htmlConnected:false,browserConnected:false,disposed,quarantined:quarantined||authority.inspect().blocked||host.inspect().state==='QUARANTINED',
  epoch,revision:authority.inspect(),route:policy.inspect(),engine:enginePort.inspect(),host:host.inspect(),timers:0,persistence:false});}
 function dispose(){if(!disposed){disposed=true;host.dispose();enginePort.dispose();authority.dispose();}}
 function tick(input){
  if(disposed||quarantined||authority.inspect().blocked)return freeze({status:'DEFERRED',reason:'A0764C_CHANNEL_UNAVAILABLE',runtimeConnected:false});
  try{
   const c=authority.runtimePort.capture();
   const out=host.tick(input??{turn:c.runtime.turnoGlobal,playerRoomId:c.runtime.pos});
   if(host.inspect().state==='QUARANTINED'||authority.inspect().blocked)quarantined=true;
   return out;
  }catch(error){quarantined=true;authority.quarantine();return freeze({status:'DEFERRED',reason:error.code??'A0764C_CAPTURE_UNVERIFIED',runtimeConnected:false});}finally{enginePort.finish();}
 }
 function restore(nativeSave){
  // Trusted modular boundary: call the native restore once, then validate the new state.
  // No HTML call site is connected. Boolean contents alone cannot trigger this path.
  if(disposed)return freeze({status:'REJECTED',reason:'DISPOSED',bindings:null});
  dispose();quarantined=true;
  try{
   if(runtime.deserializar(nativeSave)!==true)return freeze({status:'QUARANTINED',reason:'NATIVE_LOAD_NOT_RESTORED',bindings:null});
   const fresh=createPilotProductiveMobilityBindings({runtime,npcDefinitions:defs,roomDefinitions:rooms,gateDefinitions:gates});
   return Object.freeze({status:'RESTORED',bindings:fresh});
  }catch{return freeze({status:'QUARANTINED',reason:'RESTORED_STATE_NOT_VERIFIED',bindings:null});}
 }
 const api=Object.freeze({tick,inspect,dispose,restore,drainObservations:host.drainObservations,
  beforeSave:()=>{authority.clear();return host.beforeSave();},
  afterSave:(capability,result)=>{const out=host.afterSave(capability,result);if(out.status==='QUARANTINED')quarantined=true;return out;},
  // Host-only composition ports; never supplied to a controller or exported as DTO.
  ports:Object.freeze({runtimePort:authority.runtimePort,enginePort,autonomousCycle:cycle,socialMoveProducer:producer,npcRuntime:npc}),
  configuration:freeze({areaBindings:copy(topology.areaBindings),schedulerConfigurations:copy(topology.schedulerConfigurations),bindings:copy(bindings),
   origin:'AMBIENT_MOBILITY',cadence:'TECHNICAL_SCHEDULER_CADENCE_V1',scheduler:'S2',gate:'H2_B0_COMPATIBLE_FNV1A32',route:'P1_ROUTE_TOUR'})});
 bindSemantic(api,{capture(){return clone({version:1,cycle:semanticPort(actual).capture(),route:semanticPort(policy).capture()});},prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1)throw Error('G08_A07_PACK_VERSION');const cp=semanticPort(actual).prepare(d.cycle,c),rp=semanticPort(policy).prepare(d.route,c);return {apply(){const a=cp.apply(),b=rp.apply();return ()=>{b();a();};}};}});return api;
}

export { createPilotProductiveMobilityBindings };
