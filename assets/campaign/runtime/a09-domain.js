import { verifyA09NumericAuthority } from './a09-authority-native.js';
import { alchemyPortFor } from './normal-alchemy-native-r56.js';
import { canonical, clone, bindSemantic, requireRestorePermit } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { A09_PHASES, A09_ACTIONS, A09_DATA_HASHES } from './a09-selected-data.js';
import '../sources/A09_NATIVE/A09_V34_PHASE_AUTHORITY.js';
import { a09Requirements } from './a09-native-gates.js';
import { createNativeA09Battle, advanceNativeA09Battle } from './a09-native-session.js';
import { validateNativeA09Battle, validateNativeM18Final } from './a09-native-validation.js';
import { connectNativeA09Postcombat } from './a09-postcombat-native.js';
import { createNativeA09UI } from './a09-native-ui.js';

const SCHEMA='A09_NATIVE_CAMPAIGN_DOMAIN_V1';
const fields=['schema','version','playerActorId','playerGeneration','selectionCommit','ratificationCommit','numericSourceSHA256','attempts','battle','postcombat'];
const fail=s=>{throw Error('A09_NATIVE_'+s);};
function initialA09Domain(player){return {schema:SCHEMA,version:1,playerActorId:player.actorId,playerGeneration:player.generation,selectionCommit:'d2161b13a0dd2ec94fe572b4c86f758dcfdc5925',ratificationCommit:'1e342a68f26ff707a5d18316ec146aa886ed78e7',numericSourceSHA256:A09_PHASES.sourceSHA256,attempts:[],battle:null,postcombat:null};}
function validateA09Domain(domains){
 const s=domains.A09Boss,p=domains.Player.state;
 if(!s){if(domains.World.quests.M18==='hecha')fail('LEGACY_FINAL_WITHOUT_TERMINAL');return true;}
 if(canonical(Object.keys(s).sort())!==canonical([...fields,...(Object.hasOwn(s,'foundation')?['foundation']:[])].sort())||s.schema!==SCHEMA||s.version!==1||s.playerActorId!==p.actorId||s.playerGeneration!==p.generation||s.selectionCommit!=='d2161b13a0dd2ec94fe572b4c86f758dcfdc5925'||s.ratificationCommit!=='1e342a68f26ff707a5d18316ec146aa886ed78e7'||s.numericSourceSHA256!==A09_PHASES.sourceSHA256)fail('SAVE_SCOPE');
 if(!Array.isArray(s.attempts))fail('ATTEMPT_SCOPE');for(const b of s.attempts)validateNativeA09Battle(b,p,undefined,false);
 if(s.battle!==null)validateNativeA09Battle(s.battle,p);
 if(s.postcombat!==null){const row=s.postcombat,b=s.battle;if(!b||row.battleId!==b.battleId||!['ACTIVE','CEDIDO','CHOICE_READY','DECIDED'].includes(row.stage)||!Number.isSafeInteger(row.revision)||row.revision<0)fail('POSTCOMBAT_SCOPE');if(row.stage!=='ACTIVE'&&(b.status!=='CEDIDO'||row.eventId!=='M18:'+b.battleId+':VINCULO_CEDIDO'||row.actionId!==b.terminalProof.nativeReceipt.actionId||row.death!==false||row.loot!==false||row.rewards!==false))fail('POSTCOMBAT_NATIVE_TERMINAL');if(row.stage==='DECIDED'&&!validateNativeM18Final(domains))fail('M18_ATOMIC_FINAL');}
 if(s.foundation!==undefined&&s.foundation!==null){const f=s.foundation;if(f.schema!=='A09_FOUNDATION_PILL_V1'||f.itemId!=='pildora_fundacion'||f.roomId!=='nucleo_primer_pacto'||f.playerGeneration!==p.generation||f.source!=='ONE_POST_M18_GRULLA_WORLD_LEGACY_BOTH_CHOICES'||f.eventId!==s.postcombat?.eventId+':FOUNDATION_PILL'||f.claimed!==true||typeof f.consumed!=='boolean'||f.consumed&&!(p.stage==='ZhuJi'&&p.foundation?.pillConsumed===true&&domains.B3Foundation?.foundation?.commitId===p.foundation.commitId)||!validateNativeM18Final(domains)||domains.World.player.inventario.filter(id=>id==='pildora_fundacion').length!==(f.consumed?0:1))fail('FOUNDATION_PILL_AUTHENTIC_UNIQUE_SOURCE');}
 if(domains.World.quests.M18==='hecha'&&!validateNativeM18Final(domains))fail('M18_AUTHENTIC_TERMINAL_REQUIRED');
 return true;
}
function upgradeA09StoredRecord(verified){
 // Called only after the original G08 capability reader has authenticated the
 // checkpoint. Adds an inactive domain to a copy, never rewrites stored bytes.
 const r=clone(verified),d=r.envelope.domains;validateA09Domain(d);
 if(!Object.hasOwn(d,'A09Boss'))d.A09Boss=initialA09Domain(d.Player.state);
 return r;
}
function connectA09Domain({runtime:g,bridge,input,rooms={}}){
 let state=null,numeric=null,authorityError=null,commitNative=null,pc=null,pcBattle=null,ui=null,localBusy=false;
 const playerPort=bridge.createA09PlayerPort?bridge.createA09PlayerPort({resolveBoss(){fail('UNBOUND_BOSS');},resolveSlot:(phase,id)=>{const s=A09_ACTIONS.slots.find(s=>s.phase===phase&&s.abilityId===id);if(!s)fail('ACTION_SOURCE');return s;},resolveCraftedSpecial:id=>alchemyPortFor(g)?.prepareA09Special(id)||null}):null;
 const authorityReady=verifyA09NumericAuthority().then(n=>{numeric=n;return n;}).catch(e=>{authorityError=e.message;return null;});
 function ensure(){const id=bridge.herbalismIdentity();if(state?.playerGeneration!==id.generation)state=initialA09Domain(id);return state;}
 function requirements(){const r=a09Requirements({stage:bridge.read().state.stage,room:g.pos,quests:g.quests,revelations:g.flags.arc1.revelaciones});if(numeric)r.dependencies=r.dependencies.filter(d=>d.id!=='A09_APPROVED_PHASE_PROFILES');return {...r,selection:A09_PHASES.selection,selectedKnownValues:15,explicitlyRatifiedValues:18,unresolved:A09_PHASES.unresolved.map(({phase,field,unit})=>({phase,field,unit})),dataHashes:{...A09_DATA_HASHES}};}
 function requestEncounter(){
  if(!input.current()||!g.player||g.combate||g.pregunta||g.terminado)fail('EXPLICIT_QUIESCENT_INPUT_REQUIRED');
  const r=requirements();if(!r.ok)return {started:false,requirements:r};
  fail('WORLD_REMAINS_BLOCKED_UNTIL_COMPLETE_NATIVE_QA');
 }
 const active=()=>!!state?.battle&&(['ACTIVE','CEDIDO'].includes(state.battle.status)&&state.postcombat?.stage!=='DECIDED');
 function project(){const row=state?.postcombat;if(row?.stage==='DECIDED'&&g.flags?.arc1){g.flags.arc1.estado='EPILOGO';const room='nucleo_santuario_vinculo',base=rooms[room];if(base&&g.rooms?.[room])g.rooms={...g.rooms,[room]:{...g.rooms[room],desc:base.desc+'\n\n'+(row.decisionFinal==='LIBERAR'?'Los pulsos del Santuario se dispersan.':'El nexo se reconfigura bajo una custodia provisional.')}};const primer=rooms.nucleo_primer_pacto;if(primer&&g.rooms?.nucleo_primer_pacto){const text=state.foundation?.claimed?'El receptáculo del Primer Pacto ya fue recogido.':'En el receptáculo del Primer Pacto se conserva la Píldora de Fundación.';g.rooms={...g.rooms,nucleo_primer_pacto:{...g.rooms.nucleo_primer_pacto,desc:primer.desc+'\n\n'+text,scenery:{...primer.scenery,receptaculo:text}}};}}}
 async function commitState(next,kind,mutate=null,lease=null){if(!commitNative)fail('G08_OWNER_REQUIRED');const expected=canonical(ensure()),generation=ensure().playerGeneration;
  return commitNative({kind,current:()=>g.player&&bridge.herbalismIdentity().generation===generation&&canonical(ensure())===expected&&(!lease||playerPort.current(lease)),retire:()=>{if(lease)playerPort.retire(lease);},stage(e){if(canonical(e.domains.A09Boss)!==expected)fail('STALE_DOMAIN_PROPOSAL');e.domains.A09Boss=clone(next);mutate?.(e);}});
 }
 async function claimFoundationPill(){
  if(!input.current()||!g.player||g.combate||g.pregunta||g.terminado||localBusy||g.pos!=='nucleo_primer_pacto')fail('FOUNDATION_NATIVE_SOURCE_INPUT');const previous=clone(ensure());if(previous.postcombat?.stage!=='DECIDED'||g.quests.M18!=='hecha'||previous.battle?.status!=='CEDIDO')fail('FOUNDATION_REQUIRES_AUTHENTIC_CONFIRMED_M21');if(previous.foundation?.claimed){g.salida('El receptáculo ya fue recogido. Conservás la misma Píldora de Fundación.');return;}if(g.player.inventario.includes('pildora_fundacion'))fail('FOUNDATION_EXISTING_PILL_WITHOUT_AUTHENTIC_SOURCE');
  const next=clone(previous);next.foundation={schema:'A09_FOUNDATION_PILL_V1',itemId:'pildora_fundacion',roomId:'nucleo_primer_pacto',playerGeneration:previous.playerGeneration,eventId:previous.postcombat.eventId+':FOUNDATION_PILL',source:'ONE_POST_M18_GRULLA_WORLD_LEGACY_BOTH_CHOICES',claimed:true,consumed:false};localBusy=true;try{await commitState(next,'A09_FOUNDATION_CLAIM',e=>{if(e.domains.World.pos!=='nucleo_primer_pacto'||e.domains.World.quests.M18!=='hecha'||e.domains.World.player.inventario.includes('pildora_fundacion'))fail('FOUNDATION_STALE_SOURCE');e.domains.World.player.inventario.push('pildora_fundacion');});g.salida('Recogés la Píldora de Fundación del receptáculo del Primer Pacto. Se conserva hasta fundar; no concede un ascenso automático.');}finally{localBusy=false;}
 }
 function postcombat(){const s=ensure();if(!s.battle)return null;if(pcBattle!==s.battle.battleId){pcBattle=s.battle.battleId;pc=connectNativeA09Postcombat({getState:()=>ensure(),commitState,runtime:g,bridge});}return pc;}
 function render(){if(!globalThis.document||!g.player)return;if(!state?.battle){ui?.dispose();ui=null;pc=null;pcBattle=null;return;}if(!ui)ui=createNativeA09UI({runtime:g,playerPort,getState:()=>ensure(),runAction:performQA});ui.render(state.battle.status==='CEDIDO'?postcombat():null);if(state.battle.status==='DEFEATED'&&g.player.hp<=0)setTimeout(()=>{if(g.player&&ensure().battle?.status==='DEFEATED'&&g.player.hp<=0&&!g.pregunta)g.muerte();},0);}
 async function performQA(verb,event=null,args=[]){
  if(globalThis.LGB_A09_QA_ENABLED!==true)fail('QA_SCENARIO_NOT_ENABLED_WORLD_STAYS_CLOSED');if(localBusy)fail('ACTION_PENDING');if(!numeric||!playerPort)fail(authorityError||'NATIVE_NUMERIC_OWNER_NOT_READY');
  const req=requirements();if(req.missing.length)fail('NARRATIVE_REQUIREMENTS:'+req.missing.join(' · '));const lease=playerPort.begin(event),before=clone(ensure());localBusy=true;
  try{
   if(verb==='ensayo_a09'){
    if(active()||before.postcombat?.stage==='DECIDED')fail('NATIVE_ENCOUNTER_ALREADY_ACTIVE_OR_DECIDED');const next=clone(before);if(next.battle)next.attempts.push(next.battle);next.postcombat=null;next.battle=createNativeA09Battle({module:globalThis.ASTRA_A08_BOSS_LIFECYCLE,identity:{actorId:'grulla_blanca',generation:crypto.randomUUID(),battleId:crypto.randomUUID()},seed:crypto.getRandomValues(new Uint32Array(1))[0]||1});next.battle.initialPlayerDots=clone(playerPort.read(lease).state.dots);next.battle.playerCombat.dots=clone(next.battle.initialPlayerDots);next.battle.resourcePolicy=args.join(' ')==='sin_relleno'?'NATIVE':'QA_REFILL';
    await commitState(next,'A09_START',null,lease);g.salida('Comienza el ensayo nativo de la Grulla. El HP interno representa el Vínculo; WORLD continúa bloqueado.');
   }else {
    if(before.battle?.status!=='ACTIVE')fail('NO_ACTIVE_NATIVE_BATTLE');const result=advanceNativeA09Battle({module:globalThis.ASTRA_A08_BOSS_LIFECYCLE,numeric,bossActor:globalThis.ASTRA_A08_BOSS_ACTOR,playerPort,lease,record:before.battle,verb,args}),next=clone(before);next.battle=result.record;
    await commitState(next,'A09_COMBAT_STEP',e=>{playerPort.stagePhysical(lease,e,{hp:result.playerHP,qi:result.playerQI,proofCaps:result.proofCaps});playerPort.stageWorldClock(lease,e);},lease);
    const b=ensure().battle;g.salida('Grulla · fase '+b.lifecycle.phase+' · Vínculo '+b.lifecycle.hp+' · '+b.status+'.');
    if(b.status==='CEDIDO')await postcombat().domain.recover();else if(['FLED','DEFEATED'].includes(b.status))await postcombat().domain.recordExit({outcome:b.status==='FLED'?'HUIR':'DERROTA',exitReceipt:{}});if(b.status==='DEFEATED')g.muerte();
   }
   render();
  }finally{localBusy=false;}
 }
 const oldExecute=g.ejecutar;g.ejecutar=function(verb,args=[]){if(g.player&&state?.battle?.status==='DEFEATED'&&g.player.hp<=0&&!['cargar','guardar','ayuda','misiones','mirar'].includes(verb)){g.salida('La derrota de A09 está registrada. Usá mirar para consultar la recuperación ratificada; no se conceden acciones ni progreso con HP 0.');return;}const foundationRequested=['pildora_fundacion','pildora fundacion','pildora de fundacion'].includes(args.join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));if(g.player&&state?.foundation?.claimed&&g.quests.M18==='hecha'&&foundationRequested&&['tirar','soltar','beber','usar','vender'].includes(verb)){g.salida('La Píldora de Fundación se conserva para su consumo auténtico al fundar. Usá FUNDAR: la píldora sólo se consume mediante la transacción G08 de Fundación.');return;}if(verb==='tomar'&&foundationRequested&&g.pos==='nucleo_primer_pacto'){void claimFoundationPill().catch(e=>{if(globalThis.LGB_A09_QA_ENABLED===true)console.error(e.stack);g.salida(e.message);});return;}if(verb==='ensayo_a09'||active()&&['atacar','tecnica','defender','huir','beber','ulti','responder'].includes(verb)){if(args.length&&!['tecnica','beber','ulti','ensayo_a09'].includes(verb)){g.salida('Usá la acción sin un objetivo adicional en este encuentro.');return;}void performQA(verb,null,args).catch(e=>{if(globalThis.LGB_A09_QA_ENABLED===true)console.error(e.stack);g.salida(e.message);});return;}if(active()&&!['guardar','cargar','misiones','mirar','ayuda','cultivo'].includes(verb)){g.salida('El encuentro del Vínculo sigue abierto. Guardá, cargá o resolvé la intervención antes de continuar.');return;}return oldExecute.call(this,verb,args);};
 const api=Object.freeze({active,connectDurable(fn){if(commitNative||typeof fn!=='function')fail('DURABLE_OWNER_BINDING');commitNative=fn;},requirements,requestEncounter,validate:validateA09Domain,inspect:()=>({...(g.player?clone(ensure()):{schema:SCHEMA,battle:null,postcombat:null}),worldActivated:false,selection:A09_PHASES.selection,knownFields:33,missingCells:0,numericAuthority:numeric?{status:numeric.status,fieldCount:numeric.fieldCount,worldApproved:false}:null,authorityError,slots:A09_ACTIONS.slots.length,nativeEncounterCertified:false,playerPorts:['ATTACK','UNITARGET_TECHNIQUE','AOE','DOT','DEFENSIVE_TECHNIQUE','PREEXISTING_PLAYER_DOT_OWNER_SLOT','OWNED_BOUND_MEDICINE','CALDERA_NO_FOREIGN_POOL','GUARD','FLEE'],sourceUltimatePorts:25,specialAlchemyTransactionConnected:true,pendingPlayerPorts:[],pendingNativeTests:['UNEXECUTED_SOURCE_ULTIMATE_EFFECT_CASES','AUTHENTIC_TYPED_POISON_BURN_AND_POSITIVE_MERIDIAN_PATIENTS'],nativeCertificationIsNotImplied:true})});
 bindSemantic(api,{capture:()=>clone(ensure()),prepare(saved,c){requireRestorePermit(c.permit,c.envelope);validateA09Domain(c.envelope.domains);const next=clone(saved);return {apply(){const previous=state,oldRooms=g.rooms;state=next;project();return ()=>{state=previous;g.rooms=oldRooms;};},finalize(){queueMicrotask(()=>{project();render();});}};}});
 return api;
}

export { connectA09Domain, initialA09Domain, upgradeA09StoredRecord, validateA09Domain };
