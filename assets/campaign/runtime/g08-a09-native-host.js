import { connectG08TransferUI } from './g08-transfer-ui.js';
import { createOrdinaryDefeatDurable } from './ordinary-defeat-durable.js';
import { createB3NativeTransactions } from './b3-durable-native.js';
import { createB1DurableTransactionPort } from './b1-durable-transaction.js';
import { createM15DurableTransactionPort } from './m15-durable-transaction.js';
import { createA09DurableTransactionPort } from './a09-durable-transaction.js';
import { createDurableStore, requireStoredCheckpoint } from './g08-a09-native-store.js';
import { fail, clone, semanticPort } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

function connectA09NativeDurable({runtime:g,roomDefinitions,capture,preflight,restoreStored,validate,qiao,visual}){
 let b3Verifier=null;let busy=false,recoveryRequired=false,epoch=0,revision=0,loadedGame=null,lastError=null,lastCommit=null,menuRevision=0;
 const fault=phase=>{if(globalThis.__G08_QA_ENABLE__===true&&globalThis.__G08C_QA_FAULT__===phase)throw Error('G08C_TEST_FAULT:'+phase);};
 const store=createDurableStore({validate,fault,preflightProtected:preflight,onBlocked:()=>output('El almacén espera a otra pestaña. Pulsa GUARDAR o CARGAR para cancelar la espera; se liberará automáticamente en 8 segundos.')});
 const output=s=>{g.salida(s,'sistema');if(g.combate)g.registrarSalidaCombate(s);};
 connectG08TransferUI({runtime:g,exportArchive:async()=>{if(blocked()||recoveryRequired||(g.player&&g.pregunta))fail('G08_TRANSFER_INTERACTION_ACTIVE');setBusy(true);try{return await store.exportArchive();}finally{setBusy(false);}},importArchive:async archive=>{if(blocked()||recoveryRequired||g.player)fail('G08_TRANSFER_STARTUP_ONLY');setBusy(true);try{return await store.importArchive(archive);}finally{setBusy(false);}}});
 function setBusy(value){busy=value;const el=globalThis.document?.getElementById?.('entrada');if(el)el.disabled=value;}
 function blocked(){if(visual.inspect().active){output('Cierra la ceremonia antes de guardar o cargar.');return true;}if(busy){output('Hay una operación NEW de almacenamiento en curso.');return true;}return false;}
 function token(){return {epoch,actor:g.player};}function current(t){return epoch===t.epoch&&g.player===t.actor;}
 function inspect(){return clone({phase:'G08_D2',backend:'INDEXEDDB',busy,recoveryRequired,revision,loadedGame,lastCommit,lastError,certifiedRestart:false,legacyStorage:false,normalDurable:true,midCombatDurable:true,normalCommits,normalObserved,normalLastSkip});}
 async function save(slotId,slotVersion){if(blocked()||recoveryRequired)fail('G08C_SAVE_UNAVAILABLE');const t=token();setBusy(true);
  try{const e=capture(),candidate=await store.candidate(e);preflight(candidate);if(!current(t))fail('G08C_CONTEXT_CHANGED');const expected=e.identity.gameId===loadedGame?revision:0,result=await store.write(e,{slotId,expectedRevision:expected,expectedSlotVersion:slotVersion});if(current(t)){loadedGame=e.identity.gameId;revision=result.revision;lastCommit=result.commitId;lastError=null;output('Partida guardada en el espacio '+slotId+'.');}return result;}
  catch(error){if(current(t)){lastError=String(error);output('No se pudo guardar NEW: '+(error.message||error)+'. El último commit confirmado se conserva.');}throw error;}
  finally{if(epoch===t.epoch)setBusy(false);}
 }
 async function load(slotId,latestHead=false,gameId=null){if(blocked())fail('G08C_LOAD_UNAVAILABLE');const t=token();setBusy(true);
  try{let r=gameId===null?await store.read(slotId,{latestHead}):await store.readGame(gameId);const selected=requireStoredCheckpoint(r.cap);if(!latestHead&&(selected.envelope.domains.Player.state.ordinaryCombat||selected.envelope.domains.Player.state.combatArchives)){const head=await store.readGame(selected.gameId);if(head.revision>r.revision){r=head;output('Hay un guardado posterior confirmado. Se recupera el progreso más reciente para no repetir acciones.');}}preflight(r.cap);if(!current(t))fail('G08C_CONTEXT_CHANGED');const state=restoreStored(r.cap),d=requireStoredCheckpoint(r.cap);loadedGame=d.gameId;revision=r.revision;lastCommit=r.commitId;recoveryRequired=false;lastError=null;output('Partida cargada correctamente.');
   // Historical A10 can contain an already sealed ordinary defeat. Loading must
   // offer the same approved R5 relocation as a new defeat, without restoring HP.
   const recovered=capture(),lastArchive=recovered.domains.Player.state.combatArchives?.at(-1);
   if(recovered.domains.Player.state.hp===0&&lastArchive?.outcome==='derrota'&&!recovered.domains.Player.state.ordinaryCombat){const actor=g.player,loadEpoch=epoch;queueMicrotask(()=>{if(epoch===loadEpoch&&g.player===actor&&!busy&&!recoveryRequired)g.muerte();});}
   return state;}
  catch(error){if(current(t)){lastError=String(error);output('Carga NEW rechazada: '+(error.message||error)+'. La partida vigente permanece intacta.');}throw error;}
  finally{if(epoch===t.epoch)setBusy(false);}
 }
 function maintenanceMenu(){
  if(blocked()||recoveryRequired)return;const t=token(),serial=++menuRevision;let used=false;
  g.preguntar('Mantenimiento de partidas: retirar sólo copias de guardado obsoletas. Se conservan heads y recibos Qiao. 1 confirmar · 0 cancelar',answer=>{
   if(!current(t)||used||serial!==menuRevision)return;used=true;if(answer.trim()!=='1'){output('Mantenimiento cancelado.');return;}
   setBusy(true);void store.maintain().then(r=>{if(current(t)){lastError=null;output('Mantenimiento NEW confirmado: '+r.removed+' snapshots obsoletos retirados. Heads y recibos críticos conservados.');}}).catch(error=>{if(current(t)){lastError=String(error);output('Mantenimiento NEW rechazado; se conserva el estado anterior.');}}).finally(()=>{if(current(t))setBusy(false);});
  },'1 / 0');
 }
 function menu(kind,startup=false){if(busy){if(store.cancelOpen())output('Espera de apertura NEW cancelada. Ningún commit confirmado se revierte.');else output('La transacción está en curso; espera su resultado confirmado.');return;}if(blocked())return;if(!startup&&g.pregunta){output('Termina la interacción pendiente antes de '+(kind==='SAVE'?'guardar.':'cargar.'));return;}
  if(kind==='SAVE'&&!g.player){output('Crea primero un personaje.');return;}const t=token(),serial=++menuRevision;let used=false;setBusy(true);
  void Promise.all([store.list(),kind==='LOAD'?store.listGames():Promise.resolve([])]).then(([rows,games])=>{if(!current(t)||serial!==menuRevision)return;setBusy(false);
   if(kind==='SAVE'){const list=['1','2','3'].map(id=>{const r=rows.find(r=>r.slotId===id);return id+') '+(r?`${r.name} · ${r.root} · revisión ${r.revision}`:'VACÍO');});output('— GUARDAR PARTIDA —\n'+list.join('\n')+'\nM) Mantenimiento de snapshots');g.preguntar('Elegí el espacio donde guardar (1/2/3 · M mantenimiento · 0 cancelar)',answer=>{if(!current(t)||used||serial!==menuRevision)return;used=true;const id=answer.trim().toLowerCase();if(id==='m'){maintenanceMenu();return;}if(!['1','2','3'].includes(id)){output('Guardado cancelado.');return;}void save(id,rows.find(r=>r.slotId===id)?.slotVersion||0).catch(()=>{});},'1 / 2 / 3 / 0');}
   else {if(!rows.length&&!games.length){if(startup)return;output('No hay partidas guardadas.');return;}output('— CARGAR PARTIDA —\n'+rows.map(r=>`${r.slotId}) ${r.name} · ${r.root} · revisión ${r.revision}`).concat(games.map((r,i)=>r.status==='UNAVAILABLE'?`G${i+1}) Partida no verificable · NO DISPONIBLE`:`G${i+1}) ${r.name} · ${r.root} · última revisión ${r.revision}`)).join('\n'));g.preguntar('Elegí una partida (a/1/2/3/Gn · 0 '+(startup?'nueva partida':'cancelar')+')',answer=>{if(!current(t)||used||serial!==menuRevision)return;used=true;const id=answer.trim().toLowerCase();if(id==='0'){if(startup)g.nuevaPartida();else output('Carga cancelada.');return;}if(/^g[1-8]$/.test(id)){const game=games[Number(id.slice(1))-1];if(!game){output('Partida NEW inválida.');return;}if(game.status==='UNAVAILABLE'){lastError=game.error;output('La partida seleccionada no es verificable. Las demás partidas siguen disponibles.');return;}void load(null,true,game.gameId).catch(()=>{});return;}if(!rows.some(r=>r.slotId===id)){output('Slot NEW inválido.');return;}void load(id,recoveryRequired).catch(()=>{});},'a / 1 / 2 / 3 / 0');}
  }).catch(error=>{if(current(t)){setBusy(false);lastError=String(error);output('Almacenamiento NEW no disponible. No se usará SAVE legacy.');}});
 }
 g.menuGuardar=function(){menu('SAVE');};g.cmd_guardar=function(){menu('SAVE');return '';};g.menuCargar=function(){menu('LOAD');};g.cmd_cargar=function(){menu('LOAD');return '';};
 // Do not put a Promise under escribirSlot/deserializar: A07's original synchronous callers remain synchronous.
 g.autoguardar=()=>false;g.escribirSlot=()=>false;g.deserializar=()=>false;
 const execute=g.ejecutar;g.ejecutar=function(...args){if(busy||recoveryRequired){if(args[0]==='cargar'&&!busy){menu('LOAD');return;}output(recoveryRequired?'Carga el último head NEW para recuperar el commit confirmado.':'Espera a que termine la operación NEW.');return;}return execute.apply(this,args);};
 const ordinaryDefeat=createOrdinaryDefeatDurable({store,capture,preflight,restoreStored,roomDefinitions,storage:{inspect,
  begin(){if(blocked()||recoveryRequired)fail('ORDINARY_DEFEAT_STORAGE_UNAVAILABLE');const t=token();setBusy(true);return t;},current,
  committed(gameId,result){loadedGame=gameId;revision=result.revision;lastCommit=result.commitId;lastError=null;},
  recovery(reason){recoveryRequired=true;lastError=reason;},end(t){if(epoch===t.epoch)setBusy(false);}}});
 g.muerte=function(){output('Has caído en combate. Las consecuencias y los consumos confirmados se conservan.');
  void ordinaryDefeat.commit().then(r=>{
   if(r.status==='DURABLE_AND_RESTORED'){
    output('Te trasladan a un alojamiento seguro previamente visitado. No has recuperado vida; utiliza DORMIR para reponerte.');
    try{g.sincronizarVistaAtlas?.();g.actualizarPanel?.();g.mostrarSala?.();}catch(error){lastError='ORDINARY_DEFEAT_VIEW:'+error.message;}
   }else if(r.status==='NO_CERTIFIED_SHELTER')output('Todavía no consta un alojamiento seguro asignado y visitado. Se conserva la derrota; no se inventará un destino.');
   else if(r.status==='ALREADY_AT_SHELTER')output('Ya te encuentras en un alojamiento seguro.');
   else output('El traslado quedó confirmado o pendiente de reconocimiento; CARGAR recuperará el head duradero.');
  }).catch(error=>{lastError=String(error);output('No se completó el traslado seguro: '+error.message+'. Podés recuperar únicamente el último guardado confirmado.');});
 };
 const newGame=g.nuevaPartida;g.nuevaPartida=function(...args){epoch++;menuRevision++;store.cancelOpen();setBusy(false);recoveryRequired=false;revision=0;loadedGame=null;lastCommit=null;lastError=null;return newGame.apply(this,args);};
 const newMenu=g.menuNueva;g.menuNueva=function(...args){if(blocked()||recoveryRequired)return;return newMenu.apply(this,args);};
 const start=g.arranque;g.arranque=function(){start.call(this);if(globalThis.indexedDB)menu('LOAD',true);else lastError='G08C_STORAGE_UNAVAILABLE';};
 qiao.connectDurable((cap,species)=>{
  if(blocked()||recoveryRequired)throw Error('G08C_DELIVERY_UNAVAILABLE');const proposal=semanticPort(qiao).propose(cap,species),e=capture();e.domains.Materials=clone(proposal.materials);e.domains.Qiao=clone(proposal.qiao);validate(e.domains);const t=token();setBusy(true);
  return (async()=>{let committed=false;
   try{const c=await store.candidate(e);preflight(c);if(!current(t)||!proposal.current())fail('G08C_CONTEXT_CHANGED');const rows=await store.list();if(!current(t)||!proposal.current())fail('G08C_CONTEXT_CHANGED');
    const result=await store.write(e,{slotId:'a',expectedRevision:e.identity.gameId===loadedGame?revision:0,expectedSlotVersion:rows.find(r=>r.slotId==='a')?.slotVersion||0});committed=true;proposal.retire();
    if(!current(t))fail('G08C_RECOVERY_REQUIRED_OLD_GAME');loadedGame=e.identity.gameId;revision=result.revision;lastCommit=result.commitId;
    fault('AFTER_DURABLE_BEFORE_MEMORY');restoreStored(result.cap);lastError=null;return {status:'DELIVERED_DURABLE',receipt:semanticPort(qiao).receipt(),quantity:6};
   }catch(error){if(!committed){proposal.cancel();lastError=String(error);throw error;}if(epoch===t.epoch){recoveryRequired=true;lastError=String(error);}throw Error('G08C_RECOVERY_REQUIRED');}
   finally{if(epoch===t.epoch)setBusy(false);}
  })();
 });
 if(globalThis.__G08_QA_ENABLE__===true)Object.defineProperty(globalThis,'ASTRA_G08C_QA',{value:Object.freeze({capture,save,load,store,createTestStore:options=>createDurableStore({...options,validate}),inspect}),configurable:false});
 const a09Transactions=createA09DurableTransactionPort({store,capture,preflight,restoreStored,validate,storage:{inspect,
  begin(){if(blocked()||recoveryRequired)fail('A09_G08_STORAGE_UNAVAILABLE');const t=token();setBusy(true);return t;},current,
  committed(gameId,result){loadedGame=gameId;revision=result.revision;lastCommit=result.commitId;lastError=null;},
  recovery(reason){recoveryRequired=true;lastError=reason;},end(t){if(epoch===t.epoch)setBusy(false);}}}); const m15Transactions=createM15DurableTransactionPort({store,capture,preflight,restoreStored,validate,storage:{inspect,
  begin(){if(blocked()||recoveryRequired)fail('A09_G08_STORAGE_UNAVAILABLE');const t=token();setBusy(true);return t;},current,
  committed(gameId,result){loadedGame=gameId;revision=result.revision;lastCommit=result.commitId;lastError=null;},
  recovery(reason){recoveryRequired=true;lastError=reason;},end(t){if(epoch===t.epoch)setBusy(false);}}}); const b1Transactions=createB1DurableTransactionPort({store,capture,preflight,restoreStored,validate,storage:{inspect,
  begin(){if(blocked()||recoveryRequired)fail('A09_G08_STORAGE_UNAVAILABLE');const t=token();setBusy(true);return t;},current,
  committed(gameId,result){loadedGame=gameId;revision=result.revision;lastCommit=result.commitId;lastError=null;},
  recovery(reason){recoveryRequired=true;lastError=reason;},end(t){if(epoch===t.epoch)setBusy(false);}}}); const b3Transactions=createB3NativeTransactions({verifyProposal:(proposal,before,after)=>b3Verifier?.(proposal,before,after)===true,store,capture,preflight,restoreStored,validate,storage:{inspect,
  begin(){if(blocked()||recoveryRequired)fail('A09_G08_STORAGE_UNAVAILABLE');const t=token();setBusy(true);return t;},current,
  committed(gameId,result){loadedGame=gameId;revision=result.revision;lastCommit=result.commitId;lastError=null;},
  recovery(reason){recoveryRequired=true;lastError=reason;},end(t){if(epoch===t.epoch)setBusy(false);}}});
 // Extend the existing G08 coordinator. Native commands stay synchronous; the
 // authenticated event is sealed after its handlers, while input is suspended
 // for the same durable CAS/ACK protocol used by the mission transactions.
 let normalQueued=false,normalBefore=null,normalCommits=0,normalObserved=0,normalLastSkip=null;
 const canonicalNormal=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 const relevantNormal=e=>{const d=e.domains,p=d.Player.state,w=d.World.player;return canonicalNormal([p.ordinaryCombat,p.hp,p.qi,p.progression,p.branches,p.inventory,p.medicineReceipts,p.serviceTransactions,p.b3Narrative,p.cultivation,p.stones,p.dots,d.Materials,w.inventario,w.profesiones,w.heridas_meridianos,w.impurezas,w.actividad_reposo,d.World.saturacion,d.World.relojEcologico,d.Lifecycle.clock,d.World.quests,d.UpperMissions,d.LIVMissions,d.M15,d.Ascensions]);};
 const snapshotNormal=()=>{try{if(!g.player||g.pregunta||visual.inspect().active){normalLastSkip='NATIVE_INTERACTION_ACTIVE';return null;}return capture();}catch(error){normalLastSkip=error.message;return null;}};
 async function flushNormal(before){
  if(busy||recoveryRequired||!g.player||g.pregunta||g.cbResultadoEl&&!g.cbResultadoEl.hidden||visual.inspect().active)return;
  let after=snapshotNormal();
  // The pre-combat head is durable before another action is accepted. Ordinary
  // combat practice remains pending until its real exit; its use-counter RNG is
  // deterministic across reloads. No mid-combat SAVE is fabricated.
  if(!after&&g.combate){recoveryRequired=true;lastError='G08C_COMBAT_BOUNDARY_CAPTURE_FAILED:'+normalLastSkip;output(lastError);return;}
  if(!after||before&&relevantNormal(after)===relevantNormal(before))return;
  const t=token();setBusy(true);
  try{const candidate=await store.candidate(after);preflight(candidate);if(!current(t))fail('NORMAL_G08_CONTEXT_CHANGED');const rows=await store.list();if(!current(t))fail('NORMAL_G08_CONTEXT_CHANGED');const options={slotId:'a',expectedRevision:after.identity.gameId===loadedGame?revision:0,expectedSlotVersion:rows.find(r=>r.slotId==='a')?.slotVersion||0};let result;try{result=await store.write(after,options);}catch(error){if(error.message!=='G08C_CAPACITY_STORE')throw error;await store.maintain();if(!current(t))fail('NORMAL_G08_CONTEXT_CHANGED');result=await store.write(after,options);}fault('AFTER_DURABLE_COMMIT');if(!current(t))fail('NORMAL_G08_RECOVERY_REQUIRED');loadedGame=after.identity.gameId;revision=result.revision;lastCommit=result.commitId;lastError=null;normalCommits++;
  }catch(error){if(current(t)){recoveryRequired=true;lastError=String(error);output('G08: el cambio requiere recuperar el head confirmado mediante CARGAR. '+(error.message||error));}}
  finally{if(epoch===t.epoch)setBusy(false);}
 }
 const observeNormalEvent=e=>{
  if(!e.isTrusted||!g.player)return;
  normalObserved++;
  if(busy||recoveryRequired){if(e.type==='click'&&!e.target?.closest?.('#btnCargar')){e.preventDefault();e.stopImmediatePropagation();}return;}
  if(!normalQueued){normalBefore=snapshotNormal();normalQueued=true;setTimeout(()=>{const before=normalBefore;normalBefore=null;normalQueued=false;void flushNormal(before);},0);}
 };
 document.addEventListener('submit',observeNormalEvent,true);
 document.addEventListener('click',observeNormalEvent,true);

 return Object.freeze({inspect,connectB3Verifier(fn){if(b3Verifier||typeof fn!=='function')fail('B3_VERIFIER_ONCE');b3Verifier=fn;},commitB3:b3Transactions.commit,commitB1:b1Transactions.commit,commitM15:m15Transactions.commit,commitA09:a09Transactions.commit,async commitMutantFailure(event){if(busy||recoveryRequired)fail('R64B_DURABLE_BUSY');setBusy(true);try{return await store.commitMutantFailure(event);}finally{setBusy(false);}}});
}

export { connectA09NativeDurable };
