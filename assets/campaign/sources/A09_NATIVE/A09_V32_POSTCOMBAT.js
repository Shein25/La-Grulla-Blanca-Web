'use strict';
/** A09 V32: privileged postcombat adapter, NO production authority and NO browser ownership.
 * Wraps unmodified V31; host verifies A08 ledger, WORLD performs atomic CAS.
 */
function createA09V32Postcombat({gateway,host,world,identity}){
 for(const k of ['submitPlayerPhysicalHit','UIReadOnlySnapshot'])if(typeof gateway?.[k]!=='function')throw Error('V32_GATEWAY_'+k);
 for(const k of ['verifyTerminalProof','readCommittedTerminal','verifyPresentationCompletion','verifyExplicitConfirmation','verifyExit'])if(typeof host?.[k]!=='function')throw Error('V32_HOST_'+k);
 for(const k of ['read','cedeOnce','completePresentation','commitDecision','recordExit'])if(typeof world?.[k]!=='function')throw Error('V32_WORLD_'+k);
 if(identity?.actorId!=='grulla_blanca'||!identity.battleId||!identity.generation)throw Error('V32_BAD_IDENTITY');
 const eventId=`M18:${identity.battleId}:VINCULO_CEDIDO`;
 let pending=null,q=Promise.resolve();
 const serialize=fn=>{const result=q.then(fn);q=result.catch(()=>{});return result};
 const read=async()=>{const s=await world.read(identity.battleId);if(s&&(s.battleId!==identity.battleId||(s.eventId&&s.eventId!==eventId)))throw Error('V32_CROSS_BATTLE');return s};
 function validate(p){
  const {before:a,after:b,nativeReceipt:r,transition:t}=p||{};
  if(a?.battleId!==identity.battleId||b?.battleId!==identity.battleId||
     a.boss?.actorId!=='grulla_blanca'||b.boss?.actorId!=='grulla_blanca'||
     a.boss.phase!==3||b.boss.phase!==3||a.boss.pactReleased!==true||b.boss.pactReleased!==true||
     a.boss.terminal!==false||b.boss.terminal!==true||b.boss.hp!==0||
     t?.phase!==3||t.terminal!==true||t.hp!==0||
     r?.targetId!=='grulla_blanca'||typeof r.actionId!=='string'||!r.actionId||
     r.result?.hpAfter!==0||!(r.result.actualHPDamage>0)||
     !Number.isSafeInteger(a.revision)||b.revision!==a.revision+1)throw Error('V32_FALSE_TERMINAL');
  return p;
 }
 const cede=async p=>{
  const verified=validate(p);
  const cap=await host.verifyTerminalProof({identity,...verified});
  if(!cap)throw Error('V32_NO_A08_LEDGER_PROOF');
  return world.cedeOnce({battleId:identity.battleId,generation:identity.generation,
   eventId,actorId:'grulla_blanca',event:'VINCULO_CEDIDO',engine:'V284',
   actionId:verified.nativeReceipt.actionId,death:false,loot:false,rewards:false},cap);
 };
 const submitPlayerPhysicalHit=({playerActionCap})=>serialize(async()=>{
  if(['CEDIDO','CHOICE_READY','DECIDED'].includes((await read())?.stage))throw Error('V32_ALREADY_CEDED');
  const before=gateway.UIReadOnlySnapshot(),physical=gateway.submitPlayerPhysicalHit({playerActionCap}),after=gateway.UIReadOnlySnapshot();
  if(physical?.transition?.terminal!==true)return {physical,m18:await read()};
  return {physical,m18:await cede({before,after,nativeReceipt:physical.nativeReceipt,transition:physical.transition})};
 });
 const recover=()=>serialize(async()=>{
  const state=await read();
  if(['CEDIDO','CHOICE_READY','DECIDED'].includes(state?.stage))return state;
  const journal=await host.readCommittedTerminal({...identity});
  return journal?cede(journal):state;
 });
 const completePresentation=({animationReceipt})=>serialize(async()=>{
  const s=await read();
  if(['CHOICE_READY','DECIDED'].includes(s?.stage))return s;
  if(s?.stage!=='CEDIDO'||s.event!=='VINCULO_CEDIDO')throw Error('V32_EARLY_PRESENTATION');
  const cap=await host.verifyPresentationCompletion({identity,eventId,animationReceipt});
  if(!cap)throw Error('V32_UNVERIFIED_PRESENTATION');
  return world.completePresentation({battleId:identity.battleId,eventId},cap);
 });
 const selectDecision=choice=>serialize(async()=>{
  if(!['LIBERAR','CUSTODIAR'].includes(choice))throw Error('V32_CHOICE_INVALID');
  const s=await read();
  if(s?.stage==='DECIDED')throw Error('V32_IRREVERSIBLE');
  if(s?.stage!=='CHOICE_READY')throw Error('V32_CHOICE_TOO_EARLY');
  pending={eventId,choice};return Object.freeze({eventId,choice,confirmationRequired:true});
 });
 const cancelDecision=()=>serialize(async()=>{pending=null;return read()});
 const confirmDecision=({choice,confirmationReceipt})=>serialize(async()=>{
  if(!['LIBERAR','CUSTODIAR'].includes(choice))throw Error('V32_CHOICE_INVALID');
  const s=await read();
  if(s?.stage==='DECIDED'){if(s.decisionFinal!==choice)throw Error('V32_CONTRADICTION');return s}
  if(s?.stage!=='CHOICE_READY'||pending?.eventId!==eventId||pending.choice!==choice)throw Error('V32_UNSELECTED');
  const cap=await host.verifyExplicitConfirmation({identity,eventId,choice,confirmationReceipt,worldRevision:s.revision});
  if(!cap)throw Error('V32_UNVERIFIED_CONFIRMATION');
  const done=await world.commitDecision({battleId:identity.battleId,eventId,choice,expectedRevision:s.revision},cap);
  if(done?.stage!=='DECIDED'||done.decisionFinal!==choice||done.M18!=='HECHA'||
     done.vinculoGrulla!==(choice==='LIBERAR'?'LIBERADO':'CUSTODIADO'))throw Error('V32_BAD_WORLD_RECEIPT');
  pending=null;return done;
 });
 const recordExit=({outcome,exitReceipt})=>serialize(async()=>{
  if(!['HUIR','DERROTA'].includes(outcome))throw Error('V32_INVALID_EXIT');
  if(['CEDIDO','CHOICE_READY','DECIDED'].includes((await read())?.stage))throw Error('V32_EXIT_AFTER_VICTORY');
  const cap=await host.verifyExit({identity,outcome,exitReceipt});
  if(!cap)throw Error('V32_UNVERIFIED_EXIT');
  pending=null;return world.recordExit({battleId:identity.battleId,eventId,outcome,M18:'ACTIVA'},cap);
 });
 return Object.freeze({eventId,read,submitPlayerPhysicalHit,recover,completePresentation,selectDecision,cancelDecision,confirmDecision,recordExit});
}

export { createA09V32Postcombat };
