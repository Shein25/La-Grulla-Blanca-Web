'use strict';
/** B18.4 integration: presentation only; privileged host attests animation and click confirmation.
 * Deliberately never writes WORLD, never parses terminal commands, never generates battle logs.
 */
function createA09V32B18Presenter({domain,host,view}){
 for(const fn of ['read','completePresentation','selectDecision','cancelDecision','confirmDecision'])if(typeof domain?.[fn]!=='function')throw Error('V32_M18_DOMAIN_REQUIRED:'+fn);
 for(const fn of ['attestCompletedB18Ceremony','captureExplicitDecision'])if(typeof host?.[fn]!=='function')throw Error('V32_TRUSTED_VISUAL_HOST_REQUIRED:'+fn);
 for(const fn of ['bind','showWaiting','playCeding','showChoices','showConfirmation','showOutcome','showError','disableControls'])if(typeof view?.[fn]!=='function')throw Error('V32_B18_VIEW_REQUIRED:'+fn);
 let unsubscribe=null,pending=null,playing=false,busy=false,closed=false;
 const safe=async work=>{
  if(closed||busy)return;
  busy=true;view.disableControls(true);
  try{return await work()}catch(e){view.showError(String(e?.message||e));throw e}
  finally{busy=false;view.disableControls(false);}
 };
 async function refresh(){
  if(closed||playing)return;
  const row=await domain.read();
  if(!row||row.stage==='ACTIVE'){
   pending=null;view.showWaiting();return;
  }
  if(row.stage==='CEDIDO'){
   playing=true;
   try{
    // Uses B18.4's 3200ms ceding animation; only WORLD/host can certify completion.
    const visualReceipt=await view.playCeding({eventId:row.eventId});
    const animationReceipt=await host.attestCompletedB18Ceremony({eventId:row.eventId,visualReceipt});
    await domain.completePresentation({animationReceipt});
    if(!closed)view.showChoices();
   }finally{playing=false;}
  }else if(row.stage==='CHOICE_READY'){
   if(pending)view.showConfirmation(pending);else view.showChoices();
  }else if(row.stage==='DECIDED'){
   pending=null;await view.showOutcome({choice:row.decisionFinal,sanctuaryForm:row.sanctuaryForm,persistent:true});
  }else throw Error('V32_UNKNOWN_WORLD_STAGE');
 }
 const choose=choice=>safe(async()=>{
  const receipt=await domain.selectDecision(choice);
  pending=receipt.choice;view.showConfirmation(pending);
 });
 const back=()=>safe(async()=>{
  await domain.cancelDecision();pending=null;view.showChoices();
 });
 const confirm=()=>safe(async()=>{
  if(!pending)throw Error('V32_CONFIRM_WITHOUT_SELECTION');
  const choice=pending;
  // Host must attest a separate physical confirmation; DOM click alone is not authority.
  const confirmationReceipt=await host.captureExplicitDecision({eventId:domain.eventId,choice});
  const result=await domain.confirmDecision({choice,confirmationReceipt});
  pending=null;await view.showOutcome({choice:result.decisionFinal,sanctuaryForm:result.sanctuaryForm,persistent:true});
 });
 async function start(){
  if(unsubscribe)throw Error('V32_PRESENTER_ALREADY_STARTED');
  unsubscribe=view.bind({choose,back,confirm});
  try{await refresh();}catch(e){if(typeof unsubscribe==='function')unsubscribe();unsubscribe=null;throw e}
  return Object.freeze({refresh,stop});
 }
 function stop(){closed=true;if(typeof unsubscribe==='function')unsubscribe();unsubscribe=null;}
 return Object.freeze({start,refresh,stop});
}
function createA09V32B18DOM({doc,wait}){
 if(!doc?.getElementById||!doc?.body)throw Error('V32_DOCUMENT_REQUIRED');
 if(typeof wait!=='function')throw Error('V32_TIMER_REQUIRED');
 const el=id=>{const n=doc.getElementById(id);if(!n)throw Error('V32_MISSING_B18_NODE:'+id);return n};
 const ids=['finalStage','finalChoices','finalConfirm','finalEpilogue','finalTitle','finalKicker',
  'finalSummary','finalConfirm','confirmTitle','confirmSummary','finalEpilogue','epilogueTitle',
  'epilogueDescription','pactIndicator','btnLiberar','btnCustodiar','btnConfirm','btnBack'];
 for(const id of ids)el(id);
 const endings={
  LIBERAR:{name:'LIBERAR EL VÍNCULO',summary:'Los pulsos del Santuario se dispersarán.',
   finale:'El Vínculo queda liberado. Los pulsos del Santuario se dispersan.'},
  CUSTODIAR:{name:'CUSTODIAR EL VÍNCULO',summary:'El nexo adoptará una nueva configuración.',
   finale:'El Vínculo continúa bajo una custodia provisional; el nexo se reconfigura.'}
 };
 let locked=false;
 const setStage=stage=>{doc.body.dataset.finale=stage;el('finalStage').hidden=stage==='idle';};
 const hidePanels=()=>{for(const id of ['finalChoices','finalConfirm','finalEpilogue'])el(id).hidden=true;};
 const disableControls=disabled=>{
  locked=disabled;
  for(const id of ['btnLiberar','btnCustodiar','btnConfirm','btnBack'])el(id).disabled=disabled;
 };
 function showWaiting(){hidePanels();setStage('idle');doc.body.dataset.decision='';}
 async function playCeding({eventId}){
  if(typeof eventId!=='string'||!eventId.includes('VINCULO_CEDIDO'))throw Error('V32_BAD_SCENE_EVENT');
  hidePanels();setStage('ceding');
  el('finalKicker').textContent='M18 · EL ÚLTIMO SELLO';
  el('finalTitle').textContent='VÍNCULO CEDIDO';
  el('finalSummary').textContent='La Grulla permanece. El Vínculo que la retenía ha cedido.';
  await wait(3200);
  return Object.freeze({eventId,scene:'B18.4_CEDING_FINISHED_VISUAL_ONLY'});
 }
 function showChoices(){
  hidePanels();setStage('choice');
  el('finalKicker').textContent='LA PROMESA HA LLEGADO A SU LÍMITE';
  el('finalTitle').textContent='LA GRULLA PERMANECE';
  el('finalSummary').textContent='El combate terminó. La elección todavía no fue confirmada.';
  el('finalChoices').hidden=false;
 }
 function showConfirmation(choice){
  if(!endings[choice])throw Error('V32_BAD_CHOICE_VIEW');
  hidePanels();setStage('confirm');
  el('confirmTitle').textContent=endings[choice].name;
  el('confirmSummary').textContent=endings[choice].summary+' Confirmar es irreversible.';
  el('finalConfirm').hidden=false;
 }
 async function showOutcome({choice,sanctuaryForm,persistent}){
  const expected=choice==='LIBERAR'?'PULSOS_DISPERSOS':'NEXO_RECONFIGURADO';
  if(!endings[choice]||sanctuaryForm!==expected||persistent!==true)throw Error('V32_NO_WORLD_OUTCOME');
  hidePanels();doc.body.dataset.decision=choice;setStage('outcome');
  el('pactIndicator').textContent=choice==='LIBERAR'?'VÍNCULO LIBERADO · M18':'VÍNCULO CUSTODIADO · M18';
  await wait(2550);
  setStage('epilogue');el('finalEpilogue').hidden=false;
  el('finalTitle').textContent=choice==='LIBERAR'?'EL VÍNCULO ES LIBRE':'EL VÍNCULO CONTINÚA';
  el('finalSummary').textContent=endings[choice].finale;
  el('epilogueTitle').textContent=choice==='LIBERAR'?'Pulsos dispersos':'Nexo reconfigurado';
  el('epilogueDescription').textContent=endings[choice].finale;
 }
 function showError(message){
  const target=doc.getElementById('a09V32Feedback');if(target)target.textContent=message;
 }
 function bind({choose,back,confirm}){
  const handlers=[['btnLiberar',()=>choose('LIBERAR')],['btnCustodiar',()=>choose('CUSTODIAR')],
   ['btnBack',()=>back()],['btnConfirm',()=>confirm()]];
  for(const [id,cb]of handlers)el(id).addEventListener('click',cb);
  return ()=>{for(const [id,cb]of handlers)el(id).removeEventListener('click',cb);};
 }
 return Object.freeze({bind,showWaiting,playCeding,showChoices,showConfirmation,showOutcome,showError,disableControls});
}

export { createA09V32B18DOM, createA09V32B18Presenter };
