'use strict';
/** Derived WORLD reducer. Requires privileged driver.atomic commit to A08 save.
 * This module does not itself connect or authorize grulla_blanca in WORLD.
 */
function createA09V32WorldPort({driver,authority}){
 for(const f of ['read','atomic'])if(typeof driver?.[f]!=='function')throw Error('V32_WORLD_DRIVER_'+f);
 for(const f of ['cession','presentation','decision','exit'])if(typeof authority?.[f]!=='function')throw Error('V32_WORLD_AUTHORITY_'+f);
 const stages=new Set(['ACTIVE','CEDIDO','CHOICE_READY','DECIDED']);
 const init=id=>({battleId:id,eventId:null,stage:'ACTIVE',M18:'ACTIVA',revision:0});
 const read=async id=>(await driver.read(id))||init(id);
 const authorized=async(kind,cap,input)=>{
  if((await authority[kind](cap,input))!==true)throw Error('V32_WORLD_DENIED_'+kind.toUpperCase());
 };
 function assertRow(row,id){
  if(!row||row.battleId!==id||!stages.has(row.stage)||!Number.isSafeInteger(row.revision))throw Error('V32_WORLD_INVALID_STORED_ROW');
 }
 async function cedeOnce(input,cap){
  if(input?.event!=='VINCULO_CEDIDO'||input.actorId!=='grulla_blanca'||!input.battleId||
     input.eventId!==`M18:${input.battleId}:VINCULO_CEDIDO`||!input.actionId||
     input.death!==false||input.loot!==false||input.rewards!==false)throw Error('V32_WORLD_INVALID_CESSION');
  await authorized('cession',cap,input);
  return driver.atomic(input.battleId,old=>{
   const row=old||init(input.battleId);assertRow(row,input.battleId);
   if(['CEDIDO','CHOICE_READY','DECIDED'].includes(row.stage)){
    if(row.eventId!==input.eventId||row.actionId!==input.actionId)throw Error('V32_WORLD_CONFLICTING_TERMINAL');
    return row;
   }
   if(row.stage!=='ACTIVE')throw Error('V32_WORLD_WRONG_PHASE');
   return {...row,...input,stage:'CEDIDO',M18:'ACTIVA',revision:row.revision+1};
  });
 }
 async function completePresentation(input,cap){
  if(!input?.battleId||input.eventId!==`M18:${input.battleId}:VINCULO_CEDIDO`)throw Error('V32_WORLD_BAD_EVENT');
  await authorized('presentation',cap,input);
  return driver.atomic(input.battleId,old=>{
   const row=old||init(input.battleId);assertRow(row,input.battleId);
   if(row.eventId!==input.eventId||!['CEDIDO','CHOICE_READY','DECIDED'].includes(row.stage))throw Error('V32_WORLD_CESSION_NOT_FOUND');
   if(row.stage!=='CEDIDO')return row;
   return {...row,stage:'CHOICE_READY',revision:row.revision+1};
  });
 }
 async function commitDecision(input,cap){
  if(!input?.battleId||input.eventId!==`M18:${input.battleId}:VINCULO_CEDIDO`||
     !['LIBERAR','CUSTODIAR'].includes(input.choice)||!Number.isSafeInteger(input.expectedRevision))throw Error('V32_WORLD_INVALID_CHOICE');
  await authorized('decision',cap,input);
  return driver.atomic(input.battleId,old=>{
   const row=old||init(input.battleId);assertRow(row,input.battleId);
   if(row.stage==='DECIDED'){
    if(row.eventId!==input.eventId||row.decisionFinal!==input.choice)throw Error('V32_WORLD_IRREVERSIBLE_DECISION');
    return row;
   }
   if(row.stage!=='CHOICE_READY'||row.eventId!==input.eventId||row.revision!==input.expectedRevision)throw Error('V32_WORLD_STALE_OR_PREMATURE');
   // Single atomic WORLD save. No arc1.estado, no Gran Perfección, no drops.
   return {...row,stage:'DECIDED',revision:row.revision+1,decisionFinal:input.choice,
     vinculoGrulla:input.choice==='LIBERAR'?'LIBERADO':'CUSTODIADO',
     M18:'HECHA',sanctuaryForm:input.choice==='LIBERAR'?'PULSOS_DISPERSOS':'NEXO_RECONFIGURADO',
     continuation:'PENDING_SEPARATE_GATES'};
  });
 }
 async function recordExit(input,cap){
  if(!input?.battleId||!['HUIR','DERROTA'].includes(input.outcome)||input.M18!=='ACTIVA')throw Error('V32_WORLD_INVALID_EXIT');
  await authorized('exit',cap,input);
  return driver.atomic(input.battleId,old=>{
   const row=old||init(input.battleId);assertRow(row,input.battleId);
   if(row.stage!=='ACTIVE')throw Error('V32_WORLD_EXIT_AFTER_CESSION');
   return {...row,lastExit:input.outcome,M18:'ACTIVA',revision:row.revision+1};
  });
 }
 return Object.freeze({read,cedeOnce,completePresentation,commitDecision,recordExit});
}

export { createA09V32WorldPort };
