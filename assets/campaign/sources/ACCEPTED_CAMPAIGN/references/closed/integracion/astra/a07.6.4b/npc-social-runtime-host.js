import { SOCIAL_SOURCE_ID, isSocialMoveProducer } from '../a07/social-move-producer.js';
import { createOneHopExchange } from '../a07.6.3c/one-hop-exchange.js';
import { createActiveCycleReader } from '../a07.6.1/active-cycle-reader.js';
import { createPairEligibility } from '../a07.6.1/pair-eligibility.js';
import { ACKNOWLEDGE_ACTORS } from '../a07.6.2/acknowledge-authority.js';
import { registrations } from '../a07/registry.js';
import { freeze, exact, fail, copy } from '../a07/safe-data.js';
import { own, id, turn, method } from '../a07.6.1/readonly-data.js';

/** A07.6.4B. Native ESM orchestration only; no HTML, UI, semantic writes or external event ingress. */

// Unique ownership within the canonical ESM module instance. No public mint/register API.
const scopes=new WeakMap(),sources=new WeakMap(),cycles=new WeakMap(),runtimes=new WeakMap();
// Output-only provenance. A cloned/JSON batch or a foreign drain is never authority.
const observationDrains=new WeakSet(),observationBatches=new WeakMap();
const isObservationDrain=value=>observationDrains.has(value);
const isOwnedObservationBatch=(batch,drain)=>observationDrains.has(drain)&&observationBatches.get(batch)===drain;
const ids=new Set(registrations().map(r=>r.actorId));
const object=x=>x!==null&&typeof x==='object';
const no=(status,reason)=>freeze({status,reason,runtimeConnected:false,productiveBindingsConnected:false});
function createNpcSocialRuntimeHost(options){
  exact(options,['ownershipScope','runtimePort','npcDefinitions','roomDefinitions'],['autonomousCycle','socialMoveProducer','scopedAuthority']);
  let scope=options.ownershipScope;let configuration={npcDefinitions:options.npcDefinitions,roomDefinitions:options.roomDefinitions,scopedAuthority:options.scopedAuthority};if(!object(scope))fail('A0764B_SCOPE');
  if(scopes.has(scope))fail('A0764B_OWNERSHIP_SCOPE_IN_USE');
  const lease=Object.freeze({});scopes.set(scope,lease);
  let cycle=options.autonomousCycle??null,producer=options.socialMoveProducer??null,runtimePort=options.runtimePort;
  let capture=null,tickCycle=null,reader=null,exchange=null,leasedRuntime=null;
  let state='UNAVAILABLE',busy=false,cancel=null,boundary=null,lastTick=null,frontier=null;
  const dispatched=new Map(),areas=new Map();
  const counters={ticks:0,executions:0,confirmed:0,claims:0,prepareRoot:0,realizeRoot:0,receipt:0,evaluateRecipient:0,
    realizeReciprocal:0,roots:0,responses:0,dormant:0,aborts:0,cutovers:0};
  let pendingTickets=0,pendingReceipts=0,pendingIntents=0;
  let stagedObservations=[],publishedObservations=[],observationOrdinal=0,observationFailed=false;
  const observer={cap:4,peak:0,droppedBatches:0,lastReason:null};
  function clearObservations(){stagedObservations=[];publishedObservations=[];}
  function failPresentation(reason){clearObservations();observationFailed=true;observer.lastReason=reason;
    observer.droppedBatches=Math.min(Number.MAX_SAFE_INTEGER,observer.droppedBatches+1);}
  function stageObservation(utterance,direction,proof,f){
    if(observationFailed)return;
    try{
      if(stagedObservations.length>=observer.cap||observationOrdinal>=Number.MAX_SAFE_INTEGER)return failPresentation('A077B_OBSERVATION_BOUND');
      if(utterance.speechAct!=='ACKNOWLEDGE'||typeof utterance.text!=='string'||!utterance.text.length||utterance.text.length>40||
        !ACKNOWLEDGE_ACTORS.includes(utterance.actorId)||!ACKNOWLEDGE_ACTORS.includes(utterance.recipientId)||
        utterance.actorId===utterance.recipientId||f[utterance.actorId]!==f[utterance.recipientId])return failPresentation('A077B_OBSERVATION_OUTPUT');
      stagedObservations.push(freeze({sessionEpoch:'A077B:'+proof.epoch,eventOrdinal:++observationOrdinal,
        exchangeOrdinal:proof.sequence,turn:f.turn,roomId:f[utterance.actorId],playerRoomId:f.playerRoom,
        speakerId:utterance.actorId,recipientId:utterance.recipientId,direction,text:utterance.text}));
      observer.peak=Math.max(observer.peak,stagedObservations.length);
    }catch{failPresentation('A077B_OBSERVATION_OUTPUT');}
  }
  function drainObservations(){
    if(busy||state!=='LIVE')return freeze([]);
    const batch=freeze(publishedObservations);publishedObservations=[];
    observationBatches.set(batch,drainObservations);return batch;
  }
  observationDrains.add(drainObservations);
  const peaks={tickets:0,receipts:0,intents:0,depth:0,hop:0};
  const count=k=>{counters[k]=Math.min(Number.MAX_SAFE_INTEGER,counters[k]+1);};
  function release(map,key){if(key&&map.get(key)===lease)map.delete(key);}
  function reserve(map,key){if(map.has(key)&&map.get(key)!==lease)fail('A0764B_AUTHORITY_ALREADY_OWNED');map.set(key,lease);}
  function checkCancel(){if(cancel)fail('A0764B_LIFECYCLE_CANCELLED');}
  function nativeFrame(){
    const c=capture();exact(c,['runtime','revision']);const r=own(c,'runtime');
    if(!object(r)||!id(c.revision))fail('A0764B_NATIVE_FRAME');
    const currentTurn=own(r,'turnoGlobal'),playerRoom=own(r,'pos'),rooms=own(r,'rooms'),positions=own(r,'posicionNPC');
    if(!turn(currentTurn)||!areas.has(playerRoom))fail('A0764B_NATIVE_FRAME');
    const frame={revision:c.revision,turn:currentTurn,playerRoom,playerArea:areas.get(playerRoom)};
    for(const actor of ACKNOWLEDGE_ACTORS){
      const room=own(own(positions,actor),'sala');if(!areas.has(room))fail('A0764B_NATIVE_FRAME');
      frame[actor]=room;frame[actor+'Area']=areas.get(room);
    }
    for(const room of [playerRoom,...ACKNOWLEDGE_ACTORS.map(a=>frame[a])])
      if(own(own(rooms,room),'area')!==areas.get(room))fail('A0764B_AREA_DRIFT');
    if(leasedRuntime&&r!==leasedRuntime)fail('A0764B_RESTORE_BOUNDARY_REQUIRED');
    return {runtime:r,frame};
  }
  function retireExchange(){clearObservations();if(exchange){exchange.dispose();exchange=null;}pendingTickets=pendingReceipts=pendingIntents=0;}
  function cutover(){
    const h=producer.head();
    if(h.sourceId!==SOCIAL_SOURCE_ID||!id(h.epoch)||!turn(h.throughSequence)||!turn(h.throughTurn))fail('A0764B_SOURCE_HEAD');
    const pair=createPairEligibility({npcDefinitions:configuration.npcDefinitions,roomDefinitions:configuration.roomDefinitions,runtimePort,cycle,
      ...(configuration.scopedAuthority===undefined?{}:{scopedAuthority:configuration.scopedAuthority})});
    reader=createActiveCycleReader(cycle);
    exchange=createOneHopExchange({producer,pairEligibility:pair,runtimePort});
    frontier={sourceId:h.sourceId,epoch:h.epoch,sequence:h.throughSequence,generation:null};
    count('cutovers');
  }
  function attach(){
    capture=method(runtimePort,'capture');
    const f=nativeFrame();reserve(runtimes,f.runtime);leasedRuntime=f.runtime;
    if(producer){if(!isSocialMoveProducer(producer))fail('A0764B_CLOSED_PRODUCER_REQUIRED');reserve(sources,producer);}
    if(cycle){tickCycle=method(cycle,'tick');method(cycle,'inspect');method(cycle,'dispose');reserve(cycles,cycle);}
    if(!cycle||!producer){state='UNAVAILABLE';return;}
    cutover();state='LIVE';
  }
  function releaseAll(){
    retireExchange();if(cycles.get(cycle)===lease)cycle.dispose();if(sources.get(producer)===lease)producer.dispose();
    release(cycles,cycle);release(sources,producer);release(runtimes,leasedRuntime);release(scopes,scope);
    cycle=producer=reader=leasedRuntime=capture=tickCycle=runtimePort=frontier=null;
    dispatched.clear();areas.clear();configuration=null;options=null;scope=null;boundary=null;pendingTickets=pendingReceipts=pendingIntents=0;state='DISPOSED';
  }
  try{
    const roomKeys=Object.keys(options.roomDefinitions);
    if(!roomKeys.length||roomKeys.length>467)fail('A0764B_ROOM_BOUND');
    for(const room of roomKeys){const area=own(own(options.roomDefinitions,room),'area');if(!id(room)||!id(area))fail('A0764B_ROOM_AREA');areas.set(room,area);}
    attach();options=null;
  }catch(error){
    // Construction failure does not dispose caller-owned authorities.
    exchange?.dispose();release(cycles,cycle);release(sources,producer);release(runtimes,leasedRuntime);release(scopes,scope);throw error;
  }
  function sameFrame(expected){
    checkCancel();const f=nativeFrame().frame;checkCancel();
    if(JSON.stringify(f)!==JSON.stringify(expected))fail('A0764B_FRAME_CHANGED');
    const active=reader.read(f.turn,f.playerArea,ACKNOWLEDGE_ACTORS[0],ACKNOWLEDGE_ACTORS[1],f[ACKNOWLEDGE_ACTORS[0]+'Area']);
    checkCancel();if(active.status!=='ACTIVE')fail('A0764B_ACTIVITY_CHANGED');
    return f;
  }
  function current(proof,expected){
    sameFrame(expected);const h=producer.head();checkCancel();
    if(!producer.isCurrent(proof)||h.sourceId!==proof.sourceId||h.epoch!==proof.epoch||
      h.throughSequence!==proof.sequence||h.throughTurn!==proof.turn)fail('A0764B_SOURCE_CHANGED');
  }
  function handoff(event,preMove){
    // This function is private and receives ONLY the intact return of our execute call.
    const proof=producer.proof(event.ticket),h=producer.head();
    if(proof.sourceId!==frontier.sourceId||proof.epoch!==frontier.epoch||!producer.isCurrent(proof)||
      !turn(proof.firstSequence)||!turn(proof.sequence)||proof.firstSequence!==frontier.sequence+1||
      proof.sequence<proof.firstSequence||h.sourceId!==proof.sourceId||h.epoch!==proof.epoch||
      h.throughSequence!==proof.sequence||h.throughTurn!==proof.turn||
      frontier.generation!==null&&frontier.generation!==proof.generation)fail('A0764B_STALE_SOURCE');
    const f=nativeFrame().frame;
    if(f.playerRoom!==preMove.playerRoom||f.turn!==proof.turn||f.revision!==event.result.receipt.revisionAfter)fail('A0764B_STALE_FRAME');
    frontier={sourceId:proof.sourceId,epoch:proof.epoch,sequence:proof.sequence,generation:proof.generation};
    count('claims');checkCancel(); // claimed before area filter, veto, or any social call
    const trace={sequence:proof.sequence,claimed:true,status:'NO_EXCHANGE',rootActorId:null,responseActorId:null,depth:0,hop:0};
    const mover=event.result.validation.command.actorId;
    if(!ACKNOWLEDGE_ACTORS.includes(mover)){trace.reason='OUTSIDE_PILOT';return trace;}
    const other=ACKNOWLEDGE_ACTORS.find(a=>a!==mover);
    if(f[mover]!==f[other]){trace.reason='NOT_COPRESENT';return trace;}
    const activity=reader.read(f.turn,f.playerArea,mover,other,f[mover+'Area']);checkCancel();
    if(activity.status==='DORMANT'){count('dormant');trace.reason='DORMANT';return trace;}
    if(activity.status!=='ACTIVE')fail('A0764B_ACTIVITY_UNAVAILABLE');
    current(proof,f);count('prepareRoot');
    const root=exchange.prepareRoot(event,{revision:f.revision});current(proof,f);
    if(root.status!=='PROPOSED'){trace.reason=root.reasons?.[0]??'NO_ROOT';return trace;}
    pendingIntents=1;peaks.intents=1;
    if(root.intent.actorId!==mover||root.intent.counterpartId!==other)fail('A0764B_ROOT_ACTOR');
    count('realizeRoot');const output=exchange.realizeRoot(root.intent,{revision:f.revision});pendingIntents=0;current(proof,f);
    if(output.status!=='REALIZED'){trace.reason='NO_ROOT_UTTERANCE';return trace;}
    count('roots');trace.rootActorId=mover;trace.depth=1;peaks.depth=Math.max(peaks.depth,1);
    stageObservation(output.utterance,'ROOT',proof,f);
    count('receipt');const r=exchange.receiptFor(output.utterance,{recipientId:other,revision:f.revision});current(proof,f);
    if(r.status!=='RECEIPT_AVAILABLE'){trace.reason='NO_RECEIPT';return trace;}
    pendingReceipts=1;peaks.receipts=1;
    count('evaluateRecipient');const response=exchange.evaluateRecipient(r.receipt,{actorId:other,revision:f.revision});current(proof,f);
    if(response.status!=='PROPOSED'){pendingReceipts=0;trace.reason='NO_RECIPROCAL_INTENT';return trace;}
    pendingIntents=1;peaks.intents=1;
    if(response.intent.actorId!==other||response.intent.counterpartId!==mover||response.intent.reasonBasis.hop!==1)fail('A0764B_RECIPROCAL_ACTOR');
    count('realizeReciprocal');const answer=exchange.realizeReciprocal(response.intent,{revision:f.revision});current(proof,f);
    pendingReceipts=pendingIntents=0;
    if(answer.status==='REALIZED'){
      count('responses');trace.responseActorId=other;trace.depth=2;trace.hop=1;trace.status='TERMINAL_EXCHANGE';
      stageObservation(answer.utterance,'RECIPROCAL',proof,f);
      peaks.depth=2;peaks.hop=1;
    }else trace.reason='NO_RECIPROCAL_UTTERANCE';
    return trace; // no utterance/capability/runtime reference escapes
  }
  function proposals(out,input){
    if(out.status!=='CYCLE_COMPLETE'||out.executed!==false||out.runtimeConnected!==false||
      !Array.isArray(out.decisions)||out.decisions.length>32)fail('A0764B_CYCLE_CONTRACT');
    const selected=[],seenActors=new Set(),commands=new Set();
    for(const row of out.decisions){
      const d=row.decision;
      if(!ids.has(d.actorId)||d.dispatched!==false||d.actorId!==row.dispatch.npcId||!Array.isArray(d.intents)||d.intents.length>32)fail('A0764B_DECISION_CONTRACT');
      for(const proposal of d.intents){
        if(proposal.status!=='READY'||proposal.validation?.status!=='READY'||proposal.validation.command?.kind!=='MOVE_STEP')continue;
        const intent=copy(proposal.intent),command=proposal.validation.command;
        exact(intent,['schemaVersion','commandId','actionId','actorId','turn','fromRoomId','targetRoomId','purpose']);
        if(intent.actorId!==d.actorId||intent.turn!==input.turn||command.commandId!==intent.commandId||
          command.actorId!==intent.actorId||seenActors.has(intent.actorId)||commands.has(intent.commandId))fail('A0764B_DUPLICATE_OR_FOREIGN_DISPATCH');
        seenActors.add(intent.actorId);commands.add(intent.commandId);selected.push(intent);
      }
    }
    return selected;
  }
  function sourceCurrent(){
    try{const h=producer.head();checkCancel();
      if(h.sourceId!==frontier.sourceId||h.epoch!==frontier.epoch||h.throughSequence!==frontier.sequence||
        frontier.generation!==null&&!producer.isCurrent(frontier))fail('A0764B_SOURCE_CHANGED_BEFORE_DISPATCH');
    }catch(error){if(!cancel)state='QUARANTINED';throw error;}
  }
  function tick(raw){
    if(busy)return no('REJECTED','A0764B_REENTRANT_WORK');
    if(state!=='LIVE')return no('DEFERRED',state==='UNAVAILABLE'?'A0764_VERIFIED_PRODUCTIVE_BINDINGS':state);
    clearObservations();observationFailed=false;busy=true;const moves=[];let outcome;
    try{
      const input=copy(raw);exact(input,['turn','playerRoomId'],['schedulerEvents','maxDispatches','actorInputs']);
      const before=nativeFrame();checkCancel();
      if(!turn(input.turn)||input.turn!==before.frame.turn||input.playerRoomId!==before.frame.playerRoom||lastTick!==null&&input.turn<=lastTick)fail('A0764B_ALREADY_TICKED_OR_STALE_TURN');
      sourceCurrent();lastTick=input.turn;count('ticks');
      const out=tickCycle(before.runtime,input);checkCancel();
      if(JSON.stringify(nativeFrame().frame)!==JSON.stringify(before.frame))fail('A0764B_CYCLE_MUTATION');
      checkCancel();
      if(out.status==='DEFERRED'){outcome=no('DEFERRED',out.reasons?.[0]??'A0764_VERIFIED_PRODUCTIVE_BINDINGS');return outcome;}
      const selected=proposals(out,input);
      for(const intent of selected){
        checkCancel();const currentFrame=nativeFrame().frame;checkCancel();
        if(currentFrame.turn!==input.turn||currentFrame.playerRoom!==before.frame.playerRoom)fail('A0764B_DISPATCH_FRAME');
        const previous=dispatched.get(intent.actorId);
        if(previous&&previous.turn>=intent.turn)fail('A0764B_DUPLICATE_DISPATCH');
        dispatched.set(intent.actorId,{turn:intent.turn,commandId:intent.commandId});
        sourceCurrent();
        count('executions');const event=producer.execute(intent);
        const move={actorId:intent.actorId,commandId:intent.commandId,movementStatus:event.status,social:null};moves.push(move);
        if(event.status==='DEFERRED_SOURCE_RECONCILIATION'){state='QUARANTINED';fail('A0764B_SOURCE_RECONCILIATION_REQUIRED');}
        if(event.status==='CONFIRMED_SOCIAL_SOURCE_EVENT'){
          count('confirmed');pendingTickets=1;peaks.tickets=1;
          move.social=handoff(event,currentFrame);pendingTickets=0;
        }
        checkCancel();
      }
      outcome=freeze({status:'TURN_COMPLETE',reason:null,runtimeConnected:false,productiveBindingsConnected:false,
        turn:input.turn,schedulerExecuted:false,moves:copy(moves)});
      return outcome;
    }catch(error){
      count('aborts');outcome=no('ABORTED',error.code??error.message??'A0764B_INVALID_WORK');
      // Malformed API input before tick/dispatch does not poison a live source.
      if(moves.length||cancel||state==='QUARANTINED')state='QUARANTINED';
      return outcome;
    }finally{
      unwind();
      if(outcome?.status==='TURN_COMPLETE'&&state==='LIVE'&&!observationFailed){publishedObservations=stagedObservations;stagedObservations=[];}
      else clearObservations();
    }
  }
  function unwind(){
    busy=false;pendingTickets=pendingReceipts=pendingIntents=0;
    if(cancel){const requested=cancel;cancel=null;retireExchange();
      if(requested==='DISPOSE')releaseAll();else {state='SUSPENDED';boundary={kind:requested,capability:null};}}
    else if(state==='QUARANTINED')retireExchange();
  }
  function before(kind){
    if(state==='DISPOSED'||state==='QUARANTINED'||state==='UNAVAILABLE')return no('DEFERRED',state);
    if(busy){cancel=cancel==='DISPOSE'?'DISPOSE':kind;return no('DEFERRED','A0764B_BUSY_LIFECYCLE_REQUESTED');}
    if(boundary?.capability||state==='SUSPENDED'&&boundary?.kind!==kind)return no('REJECTED','A0764B_BOUNDARY_IN_PROGRESS');
    retireExchange();state='SUSPENDED';const capability=Object.freeze({});boundary={kind,capability};
    return Object.freeze({status:'BOUNDARY_READY',capability});
  }
  function afterSave(capability,result){
    if(busy)return no('REJECTED','A0764B_REENTRANT_WORK');
    if(!boundary||boundary.kind!=='SAVE'||boundary.capability!==capability||state!=='SUSPENDED')return no('REJECTED','A0764B_FOREIGN_BOUNDARY');
    busy=true;
    try{
      const status=own(result,'status');boundary=null;
      if(!['ENCODED','REJECTED'].includes(status)){state='QUARANTINED';return no('QUARANTINED','A0764B_UNKNOWN_SAVE');}
      checkCancel();cutover();checkCancel();state='LIVE';return no('LIVE','NEW_SAVE_LIVE_CUTOVER');
    }catch{state='QUARANTINED';return no('QUARANTINED','A0764B_SAVE_CUTOVER_FAILED');}
    finally{unwind();}
  }
  function afterLoad(capability,result,replacement=null){
    if(busy)return no('REJECTED','A0764B_REENTRANT_WORK');
    if(!boundary||boundary.kind!=='LOAD'||boundary.capability!==capability||state!=='SUSPENDED')return no('REJECTED','A0764B_FOREIGN_BOUNDARY');
    busy=true;
    try{
      boundary=null;
      if(own(result,'status')!=='RESTORED'){state='QUARANTINED';return no('QUARANTINED','A0764B_LOAD_NOT_VERIFIED_RESTORED');}
      exact(replacement,['autonomousCycle','socialMoveProducer','runtimePort']);
      if(replacement.autonomousCycle===cycle||replacement.socialMoveProducer===producer||
        !isSocialMoveProducer(replacement.socialMoveProducer))fail('A0764B_FRESH_AUTHORITIES_REQUIRED');
      // Validate leases before touching the old authorities; no active duplicate owner.
      for(const [map,key] of [[cycles,replacement.autonomousCycle],[sources,replacement.socialMoveProducer]])
        if(!object(key)||map.has(key))fail('A0764B_AUTHORITY_ALREADY_OWNED');
      const read=method(replacement.runtimePort,'capture'),next=read();exact(next,['runtime','revision']);
      if(!object(next.runtime)||runtimes.has(next.runtime)&&runtimes.get(next.runtime)!==lease)fail('A0764B_RUNTIME_ALREADY_OWNED');
      checkCancel();
      cycle.dispose();producer.dispose();release(cycles,cycle);release(sources,producer);release(runtimes,leasedRuntime);
      cycle=replacement.autonomousCycle;producer=replacement.socialMoveProducer;runtimePort=replacement.runtimePort;
      leasedRuntime=null;frontier=null;lastTick=null;dispatched.clear();attach();checkCancel();
      return no('LIVE','NEW_RESTORE_LIVE_CUTOVER');
    }catch{state='QUARANTINED';return no('QUARANTINED','A0764B_RESTORE_AUTHORITY_NOT_VERIFIED');}
    finally{unwind();}
  }
  return Object.freeze({
    tick,drainObservations,beforeSave:()=>before('SAVE'),afterSave,beforeLoad:()=>before('LOAD'),afterLoad,
    dispose:()=>{if(busy){cancel='DISPOSE';return no('DEFERRED','A0764B_DISPOSE_ON_UNWIND');}releaseAll();return no('DISPOSED',null);},
    inspect:()=>freeze({phase:'A07.6.4B',state,busy,modularHostImplemented:true,productiveBindingsConnected:false,runtimeConnected:false,
      live:{cycle:cycle?1:0,producer:producer?1:0,exchange:exchange?1:0,activeCycleReader:reader?1:0,dispatcher:state==='DISPOSED'?0:1},
      frontier:frontier?copy(frontier):null,dispatchRows:dispatched.size,lastTick,counters:copy(counters),peaks:copy(peaks),
      observer:{cap:observer.cap,peak:observer.peak,pending:stagedObservations.length+publishedObservations.length,
        droppedBatches:observer.droppedBatches,lastReason:observer.lastReason},
      pendingTickets,pendingReceipts,pendingIntents,history:0,backlog:0,timers:0,uiWrites:false,persistence:false})
  });
}

export { createNpcSocialRuntimeHost, isObservationDrain, isOwnedObservationBatch };
