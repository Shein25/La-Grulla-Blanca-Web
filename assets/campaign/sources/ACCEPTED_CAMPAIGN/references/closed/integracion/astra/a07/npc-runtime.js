import { createWorldPerceptionAdapter } from '../a01/world-perception-adapter.js';
import { createKnowledgePermissionGuard } from '../a02/knowledge-permission-guard.js';
import { createNavigationAdapter } from '../a03/navigation-adapter.js';
import { createActionAdapter } from '../a04/action-adapter.js';
import { createLogisticsDomain } from '../a05/logistics-domain.js';
import { createArchiveDomain } from '../a05/archive-domain.js';
import { createMedicalDomain } from '../a05/medical-domain.js';
import { createFormationsDomain } from '../a05/formations-domain.js';
import { createSaveCodec } from '../a06/save-codec.js';
import { registrations, policyFor, registration } from './registry.js';
import { createController } from './controllers.js';
import { exact, freeze, copy, fail, source, text } from './safe-data.js';

/** A07.1: explicit actor evaluation only. No scheduler, motor dispatch, dialogue or UI. */

function createNpcRuntime(options){
  exact(options,['npcDefinitions','roomDefinitions','gateDefinitions'],['bindings','intentBindings','domainSources','saveConfiguration']);
  const {npcDefinitions,roomDefinitions}=options;
  const gateDefinitions=freeze(copy(options.gateDefinitions));
  const rows=registrations(),ids=Object.keys(npcDefinitions);
  if(ids.length!==32||ids.some(id=>!rows.some(r=>r.actorId===id)))fail('A07_CANONICAL_ACTORS');
  for(const row of rows){
    const raw=npcDefinitions[row.actorId],subset={};
    for(const key of Object.keys(row.canonical)){
      const d=Object.getOwnPropertyDescriptor(raw,key);if(!d||!Object.hasOwn(d,'value'))fail('A07_CANONICAL_FIELD');subset[key]=copy(d.value);
    }
    if(JSON.stringify(subset)!==JSON.stringify(row.canonical))fail('A07_CANONICAL_DRIFT');
  }
  const controllers=new Map(rows.map(r=>[r.actorId,createController(r,policyFor(r.actorId))]));
  const bindings=copy(options.bindings??[]),maps=copy(options.intentBindings??[]);
  if(bindings.length>256||maps.length>256)fail('A07_BINDING_BOUND');
  // This subblock cannot prepare productive dialogue, even if a host supplies a lineId.
  for(const b of bindings)if(!['MOVE_STEP','DOMAIN_INTENT'].includes(b.kind))fail('A07_DIALOGUE_NOT_AUTHORIZED');
  const guard=createKnowledgePermissionGuard(bindings.map(b=>b.policy));
  const navigation=createNavigationAdapter(roomDefinitions,gateDefinitions,npcDefinitions,guard);
  const actions=bindings.length?createActionAdapter({bindings,navigation}):null;
  const perception=createWorldPerceptionAdapter(npcDefinitions),frames=new WeakSet(),mapping=new Map();
  for(const m of maps){
    exact(m,['actorId','controllerIntentId','actionId','targetRoomId','purpose','source']);source(m.source);
    const c=controllers.get(m.actorId),b=bindings.find(b=>b.policy.actionId===m.actionId),key=m.actorId+':'+m.controllerIntentId;
    if(!c||!c.intentIds.includes(m.controllerIntentId)||!b||!b.policy.actorIds.includes(m.actorId)||mapping.has(key))fail('A07_INTENT_BINDING');
    if(b.kind==='MOVE_STEP'){
      if(!registration(m.actorId).canonical.posicion_valida.includes(m.targetRoomId)||!['DESTINATION','TECHNICAL_TRANSIT'].includes(m.purpose))fail('A07_MOVEMENT_BINDING');
    }else if(m.targetRoomId!==null||m.purpose!==null)fail('A07_DOMAIN_BINDING');
    mapping.set(key,freeze(m));
  }
  const domainFactories={LOGISTICS:createLogisticsDomain,ARCHIVE:createArchiveDomain,MEDICAL:createMedicalDomain,FORMATIONS:createFormationsDomain};
  const domainSources=options.domainSources??{};exact(domainSources,[],Object.keys(domainFactories));
  const domains=new Map(Object.entries(domainFactories).map(([id,f])=>{const adapter=f(roomDefinitions,domainSources[id]);return [id,{adapter,state:adapter.empty()}];}));
  const codec=options.saveConfiguration===undefined?null:createSaveCodec(options.saveConfiguration);
  function actorFrame(actorId,frame){registration(actorId);if(!frames.has(frame)||frame.snapshot.actor.id!==actorId)fail('A07_FOREIGN_FRAME');return frame;}
  function capture(runtime,actorId,context){
    registration(actorId);const c=copy(context);exact(c,['revision','permissions','gateStates']);text(c.revision);
    const snapshot=perception.snapshot(runtime,actorId);
    if(c.permissions!==null){
      exact(c.permissions,['schemaVersion','actorId','turn','entries']);
      if(c.permissions.schemaVersion!==1||c.permissions.actorId!==actorId||c.permissions.turn!==snapshot.turn||!Array.isArray(c.permissions.entries)||c.permissions.entries.length>32||c.permissions.entries.some(e=>e.actorId!==actorId))fail('A07_PERMISSION_SCOPE');
    }
    if(!c.gateStates||typeof c.gateStates!=='object'||Array.isArray(c.gateStates))fail('A07_GATE_CONTEXT');
    const visibleGates=new Set(gateDefinitions.filter(g=>g.extremos.every(r=>snapshot.territory.validPositions.includes(r))).map(g=>g.id));
    if([...visibleGates].some(id=>id==='M12'||id.startsWith('ATAJO_ALA_')))visibleGates.add('SECTA_INTERIOR');
    const gateStates={};
    for(const [id,value] of Object.entries(c.gateStates)){
      if(!gateDefinitions.some(g=>g.id===id)||typeof value!=='boolean')fail('A07_GATE_CONTEXT');
      if(visibleGates.has(id))gateStates[id]=value;
    }
    const frame=freeze({schemaVersion:1,revision:c.revision,snapshot,context:{schemaVersion:1,actorId,turn:snapshot.turn,permissions:c.permissions,gateStates}});
    frames.add(frame);return frame;
  }
  function decide(actorId,frame,projection=null,controllerState=undefined){
    actorFrame(actorId,frame);let data=null;
    if(projection!==null){
      const p=copy(projection);exact(p,['schemaVersion','actorId','turn','roomId','source','data']);source(p.source);
      if(p.schemaVersion!==1||p.actorId!==actorId||p.turn!==frame.snapshot.turn||p.roomId!==frame.snapshot.position.roomId)fail('A07_PROJECTION_SCOPE');data=p.data;
    }
    const c=controllers.get(actorId),decision=c.decide(frame.snapshot,data,controllerState);
    const intents=decision.intentIds.map(id=>{
      const m=mapping.get(actorId+':'+id);
      if(!m)return {controllerIntentId:id,status:'DEFERRED',reasons:['A07_ACTION_BINDING_NOT_CONNECTED'],intent:null,validation:null};
      const intent={schemaVersion:1,commandId:`A07:${actorId}:${frame.snapshot.turn}:${m.actionId}`,actionId:m.actionId,actorId,turn:frame.snapshot.turn,
        fromRoomId:frame.snapshot.position.roomId,targetRoomId:m.targetRoomId,purpose:m.purpose};
      const validation=actions.prepare(intent,frame);
      return {controllerIntentId:id,status:validation.status,reasons:[...validation.reasons],intent,validation};
    });
    return freeze({schemaVersion:1,actorId,architecture:c.architecture,turn:frame.snapshot.turn,roomId:frame.snapshot.position.roomId,
      status:decision.status==='DECIDED'?(intents.every(i=>i.status==='READY')?'PROPOSED':intents.some(i=>i.status==='REJECTED')?'REJECTED':'DEFERRED'):decision.status,
      reasons:[...decision.reasons,...new Set(intents.flatMap(i=>i.reasons))],controllerDecision:decision,intents,dispatched:false});
  }
  function planMovement(actorId,frame,request){actorFrame(actorId,frame);const r=copy(request);if(r.actorId!==actorId)fail('A07_REQUEST_SCOPE');return navigation.plan(frame.snapshot,frame.context,r);}
  function observeDomain(actorId,frame,domainId){
    actorFrame(actorId,frame);const d=domains.get(domainId);if(!d)fail('A07_DOMAIN');
    const reconciliation=d.adapter.reconcile(d.state);d.state=reconciliation.state;
    return d.adapter.snapshot(d.state,frame.snapshot,frame.context.permissions);
  }
  const deferred=()=>freeze({status:'DEFERRED',reasons:['A06_VERIFIED_SEMANTIC_PROJECTIONS'],runtimeConnected:false});
  return Object.freeze({
    list:()=>freeze(rows.map(r=>({actorId:r.actorId,architecture:r.architecture}))),
    describe:actorId=>{const r=registration(actorId),c=controllers.get(actorId);return freeze({actorId,architecture:r.architecture,policySource:copy(r.policySource),
      capabilities:{fsm:r.architecture==='FSM',bt:r.architecture==='BT',goap:r.architecture.includes('GOAP'),memoryRelations:r.architecture.startsWith('MEMORY'),dialogueEmitter:false,scheduler:false},
      intentIds:[...c.intentIds],factKeys:[...c.factKeys]});},
    initialState:actorId=>{registration(actorId);return controllers.get(actorId).initialState();},capture,decide,planMovement,observeDomain,
    encodeSave:(native,semantic)=>codec?codec.encode(native,semantic):deferred(),
    decodeSave:raw=>codec?codec.decode(raw):deferred(),
  });
}

export { createNpcRuntime };
