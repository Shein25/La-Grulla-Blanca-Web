import { emptyB3State, creditNativeComprehension } from './b3-zhuji-domain.js';

// V26: read-only bridge to REAL campaign journals. It never mints Tribulation/Illumination receipts.
const fail=x=>{throw Error('B3_EVENT_LINK_'+x);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const UPPER=['M11','M12'], LIV=['M13','M14','M15','M17'];
const M07_PAYOUT=4; // Fuente: runtime-data.json commerce.missionPayouts.M07; no concede piedras nuevas.
const owner=e=>{const p=e?.domains?.Player?.state;if(!p?.actorId||!p?.generation)fail('NO_NATIVE_PLAYER');return {actorId:p.actorId,generation:p.generation};};
function nativeMissionCredits(envelope,{validateNativeCampaign}={}){
 if(typeof validateNativeCampaign!=='function'||validateNativeCampaign(envelope.domains,envelope.identity)!==true)fail('FULL_G08_GRAPH_VALIDATOR_REQUIRED');
 const e=envelope,d=e.domains,o=owner(e),receipts=[];
 // M07 ya se cerró con el dueño NATIVE P.cerrarArc1 y dejó MISSION_REWARD persistente.
 // Validado por el coordinador G08 + ledger privado R56; NO inferir desde un flag HUD.
 const completedM07=d.World?.quests?.M07==='hecha';
 const m07Rows=(d.Player?.state?.serviceTransactions||[]).filter(t=>t?.missionId==='M07'&&t?.kind==='MISSION_REWARD');
 if(completedM07){
  if(m07Rows.length!==1)fail('M07_PERSISTENT_OWNER_RECEIPT_REQUIRED');
  const t=m07Rows[0];
  if(t.actorId!==o.actorId||t.generation!==o.generation||t.source!=='R56_NATIVE_QUEST_COMPLETION'||t.credit!==M07_PAYOUT||t.fee!==0||!Array.isArray(t.materials)||t.materials.length!==0||typeof t.receiptId!=='string'||!t.receiptId.startsWith('institution:'+o.generation+':')||!/^\d+$/.test(t.receiptId.slice(('institution:'+o.generation+':').length)))fail('M07_PRIVATE_LEDGER_PROVENANCE');
  // Legacy R56 no guarda el turno de emisión en MISSION_REWARD.
  // turn=0 es un sentinel de tiempo DESCONOCIDO, jamás el turno real inventado.
  receipts.push(Object.freeze({...o,kind:'COMPREHENSION_CREDIT',source:'M07',delta:1,eventId:t.receiptId,turn:0,timeSource:'LEGACY_R56_EVENT_TIME_UNRECORDED'}));
 }else if(m07Rows.length)fail('M07_LEDGER_WITHOUT_CLOSED_MISSION');
 for(const id of UPPER){const row=d.UpperMissions?.missions?.[id];if(row?.status!=='hecha'||d.World.quests?.[id]!=='hecha')continue;
  if(!Number.isSafeInteger(row.closedAt)||row.closedAt<0||!Array.isArray(row.tasks?Object.values(row.tasks):null))fail('UPPER_RECEIPT_INCOMPLETE');
  receipts.push(Object.freeze({...o,kind:'COMPREHENSION_CREDIT',source:id,delta:1,eventId:`${o.generation}:UPPER:${id}:CLOSED:${row.closedAt}`,turn:row.closedAt}));
 }
 for(const id of LIV){const row=d.LIVMissions?.missions?.[id];if(row?.status!=='hecha'||d.World.quests?.[id]!=='hecha')continue;
  const proof=row.closed;if(proof?.type!=='MISSION_CLOSED'||proof.missionId!==id||proof.actorId!==o.actorId||proof.generation!==o.generation||typeof proof.id!=='string'||!Number.isSafeInteger(proof.turn))fail('LIV_RECEIPT_INCOMPLETE');
  receipts.push(Object.freeze({...o,kind:'COMPREHENSION_CREDIT',source:id,delta:1,eventId:proof.id,turn:proof.turn}));
 }
 // M07 read from authenticated R56 payout; ILUMINACION and ORIGEN_ESCOLAR still need native emitters.
 // A quest flag, an origin string, or the HUD comprehension counter alone are insufficient.
 return Object.freeze(receipts);
}
function reconcileNativeMissionCredits(previous,envelope,verifyGraph){
 const list=nativeMissionCredits(envelope,{validateNativeCampaign:verifyGraph});
 let state=previous||emptyB3State(owner(envelope));
 for(const item of list){const old=state.comprehensionReceipts.find(r=>r.source===item.source);if(old){if(!same(old,item))fail('MISSION_PROOF_CHANGED:'+item.source);continue;}
  state=creditNativeComprehension(state,item,receipt=>list.some(x=>same(x,receipt)));
 }
 return Object.freeze({state,available:list.map(x=>x.source),pending:['ILUMINACION','ORIGEN_ESCOLAR'],nativeTribulationEmitterConnected:false});
}
function authenticFoundationPill(envelope,{validateNativeCampaign}={}){
 if(typeof validateNativeCampaign!=='function'||validateNativeCampaign(envelope.domains,envelope.identity)!==true)fail('FULL_G08_GRAPH_VALIDATOR_REQUIRED');
 const {Player,World,A09Boss,LIVMissions}=envelope.domains,o=owner(envelope),f=A09Boss?.foundation,pc=A09Boss?.postcombat;
 if(!f)return null;
 if(Player.state.stage!=='LianQi_IV'&&Player.state.stage!=='ZhuJi')fail('PILL_WRONG_STAGE');
 if(Player.state.stage==='ZhuJi'&&(!Player.state.foundation||Player.state.foundation.source!=='G08_NATIVE_FOUNDATION'))fail('PILL_CONSUMPTION_PARITY');
 if(f.schema!=='A09_FOUNDATION_PILL_V1'||f.itemId!=='pildora_fundacion'||f.playerGeneration!==o.generation||f.roomId!=='nucleo_primer_pacto'||f.source!=='ONE_POST_M18_GRULLA_WORLD_LEGACY_BOTH_CHOICES'||f.eventId!==pc?.eventId+':FOUNDATION_PILL'||f.claimed!==true||typeof f.consumed!=='boolean'||World.quests?.M18!=='hecha'||LIVMissions.missions?.M18?.status!=='hecha')fail('PILL_NOT_AUTHENTIC_A09');
 const count=World.player.inventario.filter(x=>x==='pildora_fundacion').length;
 if(count!==(f.consumed?0:1)||f.consumed!==(Player.state.stage==='ZhuJi'&&Player.state.foundation?.pillConsumed===true))fail('PILL_CONSUMPTION_PARITY');
 return Object.freeze({kind:'M18_FOUNDATION_PILL',actorId:o.actorId,generation:o.generation,itemId:'pildora_fundacion',eventId:f.eventId,claimed:true,consumed:f.consumed,source:'AUTHENTIC_A09_POSTCOMBAT_OWNER'});
}
function nativeTribulationProof(envelope,{validateNativeTribulationJournal}={}){
 // No native Tribulation journal emitter exists in the reviewed checkpoint. Do NOT trust the HUD flag.
 // Only a separate, genuinely connected owner may provide the journal and its private verifier.
 if(typeof validateNativeTribulationJournal!=='function')fail('TRIBULATION_NATIVE_OWNER_NOT_CONNECTED');
 const proof=validateNativeTribulationJournal(envelope);if(proof?.kind!=='TRIBULATION_SUCCESS'||proof.actorId!==owner(envelope).actorId||proof.generation!==owner(envelope).generation||typeof proof.eventId!=='string'||proof.eventId.length<8)fail('TRIBULATION_NATIVE_PROOF_INVALID');
 return Object.freeze({...proof});
}

export { authenticFoundationPill, nativeMissionCredits, nativeTribulationProof, reconcileNativeMissionCredits };
