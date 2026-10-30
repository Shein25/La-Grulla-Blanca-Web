const LIMITS=Object.freeze({rata_qi:5,serpiente_qi:7,avispa_jade:8,mono_pildoras:6});
const LOOK04=Object.freeze({l1_reserva_03:'inscripción del hito',l1_reserva_08:'canalillos de la piedra',l1_reserva_14:'señal del abrigo'});
const clone=x=>structuredClone(x),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const scoped=s=>typeof s.actorId==='string'&&s.actorId&&typeof s.generation==='string'&&s.generation;
function initial(actorId,generation){const s={schema:'LI_ARC1_M04_M05_OWNER_V3',version:3,actorId,generation,revision:0,m04:{started:false,looks:Object.fromEntries(Object.keys(LOOK04).map(k=>[k,false])),done:false},m05:{started:false,briefed:false,kills:Object.fromEntries(Object.keys(LIMITS).map(k=>[k,0])),victories:[],exam:null,wolfWarning:false,wolf:null,done:false,qiaoValidated:false},seen:[]};if(!scoped(s))throw Error('LI_IDENTITY');return s;}
const beforeWolf=s=>s.m05.briefed&&Object.entries(LIMITS).every(([k,n])=>s.m05.kills[k]===n)&&!!s.m05.exam&&s.m05.wolfWarning;
function checkShape(s){
 if(!s||s.schema!=='LI_ARC1_M04_M05_OWNER_V3'||s.version!==3||!scoped(s)||!Array.isArray(s.seen)||s.seen.length>64||new Set(s.seen).size!==s.seen.length||s.revision!==s.seen.length)throw Error('LI_SAVE_SCHEMA');
 const a=s.m04,b=s.m05;if(!a||!b||!Array.isArray(b.victories)||b.victories.length>26||Object.keys(a.looks).sort().join()!==Object.keys(LOOK04).sort().join())throw Error('LI_SAVE_COLLECTIONS');
 for(const value of [a.started,a.done,...Object.values(a.looks),b.started,b.briefed,b.wolfWarning,b.done,b.qiaoValidated])if(typeof value!=='boolean')throw Error('LI_SAVE_BOOLEAN');
 if(a.done&&(!a.started||!Object.values(a.looks).every(Boolean))||!a.started&&Object.values(a.looks).some(Boolean)||b.started&&!a.done||!b.started&&(b.briefed||b.victories.length||b.exam||b.wolfWarning||b.wolf||b.done||b.qiaoValidated))throw Error('LI_SAVE_CAUSAL_ORDER');
 const lives=new Set(),events=new Set();for(const v of b.victories){if(!Object.hasOwn(LIMITS,v.speciesId)||!v.lifeId?.startsWith(s.generation+':life:')||typeof v.combatId!=='string'||!v.combatId||lives.has(v.lifeId)||events.has(v.eventId)||v.areaId!=='reserva_aprendices_li'||!v.roomId?.startsWith('l1_reserva_'))throw Error('LI_SAVE_VICTORY_PROVENANCE');lives.add(v.lifeId);events.add(v.eventId);}
 for(const[k,n]of Object.entries(LIMITS))if(!Number.isInteger(b.kills[k])||b.kills[k]<0||b.kills[k]>n||b.kills[k]!==b.victories.filter(v=>v.speciesId===k).length)throw Error('LI_SAVE_COUNTER');
 if(b.exam&&(!lives.has(b.exam.lifeId)||!b.exam.roomId?.startsWith('l1_reserva_')||b.exam.profession!=='examen'))throw Error('LI_SAVE_EXAM_PROVENANCE');
 if(b.wolf&&(!beforeWolf(s)||b.wolf.speciesId!=='lobo_espiritual'||b.wolf.effectiveTier!==1||b.wolf.ecologySource!=='NATIVE_POPULATION_TIER_AT_ENCOUNTER_START'||lives.has(b.wolf.lifeId)||!b.wolf.lifeId?.startsWith(s.generation+':life:')||b.wolf.areaId!=='reserva_aprendices_li'))throw Error('LI_SAVE_WOLF_PROVENANCE');
 if(b.done&&(!b.started||!b.wolf)||b.qiaoValidated&&!b.done)throw Error('LI_SAVE_FALSE_COMPLETE');
 const expected=Number(a.started)+Object.values(a.looks).filter(Boolean).length+Number(a.done)+Number(b.started)+Number(b.briefed)+b.victories.length+Number(!!b.exam)+Number(b.wolfWarning)+Number(!!b.wolf)+Number(b.done)+Number(b.qiaoValidated);
 if(s.revision!==expected)throw Error('LI_SAVE_REVISION');return s;
}
function createDomain({actorId,generation,initialState=null,verifyReceipt,commitState,mainM03Done,stageVerified}){
 let state=checkShape(initialState?clone(initialState):initial(actorId,generation)),busy=false;
 if(state.actorId!==actorId||state.generation!==generation)throw Error('LI_SAVE_ACTOR');
 const npc=(e,id,room)=>e.npcId===id&&e.roomId===room&&e.npcCopresent===true&&e.canonicalAvailable===true;
 return Object.freeze({inspect:()=>clone(state),act(cap){if(busy)throw Error('LI_REENTRANT');busy=true;try{
  const e=verifyReceipt(cap);if(!e||e.actorId!==actorId||e.generation!==generation||e.stage!=='LianQi_I'||!mainM03Done()||!stageVerified()||typeof e.eventId!=='string'||!e.eventId)return {status:'REJECTED_SCOPE'};
  if(state.seen.includes(e.eventId))return {status:'DUPLICATE'};
  const n=clone(state),a=n.m04,b=n.m05;let reason=null;
  if(e.type==='NPC_TALK'){
   if(npc(e,'shen_baojun','sala_formas')){if(!a.started){a.started=true;reason='M04_STARTED';}else if(a.done&&!b.started){b.started=true;reason='M05_STARTED';}}
   if(npc(e,'chen_bo','sala_anatomica')&&b.started&&!b.briefed&&e.examProfessionNative===true){b.briefed=true;reason='M05_BRIEFED';}
   if(npc(e,'qiao_ren','pabellon_disciplina')&&b.done&&!b.qiaoValidated){b.qiaoValidated=true;reason='M05_QIAO_VALIDATED';}
  }else if(e.type==='LOOK'&&e.lookWasLocal&&e.lookWasReadOnly){
   if(a.started&&!a.done&&LOOK04[e.roomId]===e.focusId&&!a.looks[e.roomId]){a.looks[e.roomId]=true;reason='M04_LOOK_CONFIRMED';}
   if(b.started&&b.briefed&&!b.done&&!b.wolfWarning&&e.roomId==='l1_reserva_25'&&e.focusId==='marcas de orientación'){b.wolfWarning=true;reason='M05_WOLF_SIGNS_CONFIRMED';}
  }else if(e.type==='COMBAT_VICTORY'&&b.started&&b.briefed&&!b.done&&e.genuineVictory===true&&e.areaId==='reserva_aprendices_li'&&e.wasNaturalEncounter===true&&e.isUnique===false&&e.isMissionRat===false&&!b.victories.some(v=>v.lifeId===e.lifeId)&&b.wolf?.lifeId!==e.lifeId){
   const proof={eventId:e.eventId,lifeId:e.lifeId,combatId:e.combatId,speciesId:e.speciesId,roomId:e.roomId,areaId:e.areaId};
   if(Object.hasOwn(LIMITS,e.speciesId)&&(e.isNormal===true||e.role==='NORMAL')&&b.kills[e.speciesId]<LIMITS[e.speciesId]){b.kills[e.speciesId]++;b.victories.push(proof);reason='M05_NORMAL_KILL';}
   else if(e.speciesId==='lobo_espiritual'&&['NORMAL','APEX_BRIDGE'].includes(e.role)&&e.effectiveTier===1&&e.tierFromNativeEcology===true&&e.ecologySource==='NATIVE_POPULATION_TIER_AT_ENCOUNTER_START'&&beforeWolf(n)&&!b.wolf){b.wolf={...proof,effectiveTier:1,ecologySource:e.ecologySource,ecologySourceHash:e.ecologySourceHash,populationId:e.populationId,territoryId:e.territoryId,pressure:e.pressure};reason='M05_AUTHENTIC_WOLF_T1';}
  }else if(e.type==='AUTHENTIC_CORPSE_EXAM'&&b.started&&b.briefed&&!b.done&&!b.exam&&e.areaId==='reserva_aprendices_li'&&e.nativeExamSuccessful&&e.corpseGenuine&&b.victories.some(v=>v.lifeId===e.lifeId)){
   b.exam={lifeId:e.lifeId,roomId:e.roomId,profession:'examen',corpseGeneration:e.corpseGeneration};reason='M05_EXAM_CONFIRMED';
  }else if(e.type==='NPC_HANDIN'&&npc(e,'shen_baojun','sala_formas')){
   if(a.started&&!a.done&&Object.values(a.looks).every(Boolean)){a.done=true;reason='M04_COMPLETED';}
   else if(b.started&&!b.done&&beforeWolf(n)&&b.wolf){b.done=true;reason='M05_COMPLETED';}
  }
  if(!reason)return {status:'NOT_READY'};
  n.seen.push(e.eventId);n.revision++;checkShape(n);commitState(clone(n),{previousRevision:state.revision,reason});state=n;return {status:'COMMITTED',reason};
 }finally{busy=false;}}});
}

export { LIMITS, LOOK04, beforeWolf, checkShape, createDomain, initial };
