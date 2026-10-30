import { bindSemantic, requireRestorePermit, semanticPort, clone } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { createStagingRuntime } from './g08-staging-runtime-prepromotion.js';
import { createPilotProductiveMobilityBindings } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-productive-bindings.js';
import { exact, freeze, copy } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07/safe-data.js';
import { createLocalPresentation } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07.7b/local-presentation.js';

const owners=new WeakMap();
function connectNativeSession(options,compositionPort=null){
 exact(options,['runtime','npcDefinitions','roomDefinitions','gateDefinitions']);
 if(compositionPort){exact(compositionPort,['connected','retired']);if(['connected','retired'].some(k=>typeof compositionPort[k]!=='function'))throw Error('CC_PRIVATE_COMPOSITION_PORT');}
 const game=options.runtime;
 if(!game||typeof game!=='object')throw Error('CC_NATIVE_RUNTIME_REQUIRED');
 if(owners.has(game))return Object.freeze({status:'REJECTED',reason:'CC_DUPLICATE_BOOTSTRAP',session:null});
 const actionNames=['ejecutar','recolectarCadaver','recolectarPlanta','resolverElaboracion'];
 const names=[...actionNames,'escribirSlot','deserializar','nuevaPartida','crearPersonaje','terminar'];
 const original=Object.fromEntries(names.map(k=>[k,game[k]]));
 if(names.some(k=>typeof original[k]!=='function'))throw Error('CC_NATIVE_METHODS_REQUIRED');
 let pack=null,state='WAITING_CHARACTER',depth=0,lastTurn=game.turnoGlobal,busyBoundary=false,boundaryGeneration=0;
 let ticks=0,skipped=0,bootstraps=1,rebuilds=0,saves=0,loads=0,saveRejected=0,loadRejected=0,lastOutcome=null;
 let presentation=null,presentationFailure=null;
 const disposePack=()=>{try{compositionPort?.retired();}catch{}presentation?.dispose();presentation=null;pack?.dispose();pack=null;};
 function quarantine(){disposePack();state='QUARANTINED';}
 function rebuild(){
  disposePack();
  try{
   pack=createPilotProductiveMobilityBindings(options);lastTurn=game.turnoGlobal;state='LIVE';rebuilds++;
   // A host-only read/evaluation composition port; never a window/DOM DTO.
   // Failure of player dialogue cannot poison the previously closed social host.
   try{compositionPort?.connected(Object.freeze({npcRuntime:pack.ports.npcRuntime,cycle:pack.ports.autonomousCycle,epoch:pack.inspect().epoch}));}catch{}
   try{presentation=createLocalPresentation({drainObservations:pack.drainObservations,npcDefinitions:options.npcDefinitions,
    addLine:(text,clase)=>game.addLine(text,clase)});presentationFailure=null;}
   catch{presentationFailure='A077B_PRESENTATION_UNAVAILABLE';}
  }catch{quarantine();}
 }
 function inspect(){
  const p=pack?.inspect();
  return freeze({phase:'A07.6.4C-C',state,bootstraps,rebuilds,ticks,skipped,lastTurn,saves,loads,saveRejected,loadRejected,lastOutcome:copy(lastOutcome),
   nativeRuntimeConnected:state==='LIVE',owners:1,packs:pack?1:0,epoch:p?.epoch??null,
   live:copy(p?.host.live??{cycle:0,producer:0,exchange:0,activeCycleReader:0,dispatcher:0}),
   hostState:p?.host.state??null,peaks:copy(p?.host.peaks??{}),
   counters:copy(p?.host.counters??{}),revision:p?{pendingSnapshots:p.revision.pendingSnapshots,currentSnapshot:p.revision.currentSnapshot,
    peakRecords:p.revision.peakRecords}:null,route:p?{entries:p.route.entries}:null,
   pending:p?{tickets:p.host.pendingTickets,receipts:p.host.pendingReceipts,intents:p.host.pendingIntents}:null,
   visibility:copy(presentation?.inspect()??{owners:0,pending:0,history:0,persistence:false,lastReason:presentationFailure}),
   observer:p?copy(p.host.observer):null,
   timers:0,history:0,persistence:false,uiWrites:true});
 }
 function finishAction(before,blocked,failed,generation){
  if(failed){quarantine();return;}
  if(game.terminado){disposePack();state='TERMINATED';return;}
  if(generation!==boundaryGeneration){skipped++;return;}
  const turn=game.turnoGlobal;
  if(!Number.isSafeInteger(before)||before<0||!Number.isSafeInteger(turn)||turn<before||turn<lastTurn){quarantine();return;}
  if(turn<=before||turn<=lastTurn){skipped++;return;}
  lastTurn=turn;
  // A native interaction that began under a lock cannot acquire a social action afterward.
  if(blocked||game.combate!==null||game.pregunta!==null||state!=='LIVE'||busyBoundary){skipped++;return;}
  const outcome=pack.tick();ticks++;lastOutcome={status:outcome.status,reason:outcome.reason??null};
  if(pack.inspect().quarantined||!['TURN_COMPLETE','SKIPPED'].includes(outcome.status))quarantine();
  else if(outcome.status==='TURN_COMPLETE'){
   // Trusted synchronous consumer AFTER host unwind. No new action/tick/receipt or UI ingress.
   try{if(presentation){const shown=presentation.present();if(shown.lines>0)game.abajo();}else pack.drainObservations();}
   catch{presentationFailure='A077B_PRESENTATION_FAILED';try{pack.drainObservations();}catch{}}
  }
 }
 for(const name of actionNames){
  game[name]=function(...args){
   if(this!==game)return original[name].apply(this,args);
   const outer=depth++===0,before=game.turnoGlobal,blocked=game.combate!==null||game.pregunta!==null||game.terminado,generation=boundaryGeneration;
   let failed=false;
   try{return original[name].apply(this,args);}catch(error){failed=true;throw error;}
   finally{depth--;if(outer)finishAction(before,blocked,failed,generation);}
  };
 }
 game.escribirSlot=function(...args){
  if(this!==game)return original.escribirSlot.apply(this,args);
  // The pure serializar() projection is not a save. This is the real native storage operation.
  let boundary=null,result;
  try{
   busyBoundary=true;saves++;
   if(pack&&state==='LIVE'){
    boundary=pack.beforeSave();
    if(boundary.status!=='BOUNDARY_READY')quarantine();
   }
   result=original.escribirSlot.apply(this,args);
   if(result!==true&&result!==false)quarantine();
   else if(pack&&boundary?.status==='BOUNDARY_READY'){
    const ended=pack.afterSave(boundary.capability,{status:result?'ENCODED':'REJECTED'});
    if(ended.status!=='LIVE')quarantine();
   }
   if(result===false)saveRejected++;
   return result;
  }catch(error){quarantine();throw error;}finally{boundary=null;busyBoundary=false;}
 };
 game.deserializar=function(...args){
  if(this!==game)return original.deserializar.apply(this,args);
  // All native load paths call this method. Dispose first; never restore twice or retry.
  boundaryGeneration++;busyBoundary=true;loads++;disposePack();state='LOADING';
  try{
   const result=original.deserializar.apply(this,args);
   if(result===true)rebuild();else {loadRejected++;quarantine();}
   return result;
  }catch(error){loadRejected++;quarantine();throw error;}finally{busyBoundary=false;}
 };
 game.nuevaPartida=function(...args){
  if(this!==game)return original.nuevaPartida.apply(this,args);
  boundaryGeneration++;disposePack();state='WAITING_CHARACTER';lastTurn=0;
  try{return original.nuevaPartida.apply(this,args);}catch(error){quarantine();throw error;}
 };
 game.crearPersonaje=function(...args){
  if(this!==game)return original.crearPersonaje.apply(this,args);
  boundaryGeneration++;disposePack();state='WAITING_CHARACTER';
  try{const result=original.crearPersonaje.apply(this,args);rebuild();return result;}
  catch(error){quarantine();throw error;}
 };
 game.terminar=function(...args){
  if(this!==game)return original.terminar.apply(this,args);
  boundaryGeneration++;disposePack();state='TERMINATED';return original.terminar.apply(this,args);
 };
 const session=Object.freeze({inspect});owners.set(game,session);
 bindSemantic(session,{capture(){if(!pack||state!=='LIVE'||depth||busyBoundary)throw Error('G08_A07_NOT_QUIESCENT');return clone({version:1,lastTurn,pack:semanticPort(pack).capture()});},
 prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||!Number.isSafeInteger(d.lastTurn)||d.lastTurn>c.envelope.domains.World.turnoGlobal)throw Error('G08_A07_LAST_TURN');
  const staging=createStagingRuntime(game,c.envelope.domains.World,options.roomDefinitions);let proposed=null;
  try{proposed=createPilotProductiveMobilityBindings({...options,runtime:staging.runtime});semanticPort(proposed).prepare(d.pack,c).apply();}catch(error){proposed?.dispose();throw error;}
  let previous=null,applied=false;
  return {apply(){previous={pack,state,lastTurn,boundaryGeneration,lastOutcome};staging.publish();pack=proposed;state='LIVE';lastTurn=d.lastTurn;boundaryGeneration++;lastOutcome=null;applied=true;
   return ()=>{staging.retire();proposed.dispose();({pack,state,lastTurn,boundaryGeneration,lastOutcome}=previous);applied=false;};},
   finalize(){if(!applied)throw Error('G08_A07_NOT_PUBLISHED');previous.pack?.dispose();compositionPort?.retired();compositionPort?.connected(Object.freeze({npcRuntime:proposed.ports.npcRuntime,cycle:proposed.ports.autonomousCycle,epoch:proposed.inspect().epoch}));presentation?.dispose();presentation=createLocalPresentation({drainObservations:proposed.drainObservations,npcDefinitions:options.npcDefinitions,addLine:(text,clase)=>game.addLine(text,clase)});},
   abort(){if(!applied)proposed.dispose();}};
 }});
 if(game.player&&game.pregunta===null&&!game.terminado)rebuild();
 return Object.freeze({status:'CONNECTED',session});
}

export { connectNativeSession };
