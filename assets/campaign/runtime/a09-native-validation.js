import { validateAfflictionList, validateAfflictionOwnerEvent } from './a09-affliction-validation.js';
import { A09_ACTIONS, A09_PHASES } from './a09-selected-data.js';
import { createA09LifecycleOwner } from './a09-native-session.js';

function validateSourceBoundary(e,r,player){
 const fail=s=>{throw Error('A09_SOURCE_BOUNDARY_'+s);},same=(a,b)=>canonical(a)===canonical(b);
 if(e.engineContract!=='NEW_COMBAT_STATS_V0_1'||e.source!=='A08_PRIVATE_PLAYER_PORT'||e.actorId!==player.actorId||e.sourceUltimateUID!==r.ultimateCast?.uid||!Array.isArray(e.sourceDerivedPackets)||!e.sourceOwnerReplay)fail('SCOPE');
 const replay=e.sourceOwnerReplay,bank=globalThis.LGB_A09_SOURCE_BANK.create({uid:e.sourceUltimateUID,actorId:player.actorId,generation:player.generation,mode:replay.before.mode,saved:replay.before});let i=0,j=0;
 const args=structuredClone(replay.args);if(bank.key==='brasa'){args.anchorAlive=()=>replay.anchorAliveChecks[j++];args.resolveReaction=()=>replay.callbacks[i++];args.resolveClimax=()=>replay.callbacks[i++];}
 const allowed={mandato:'afterHostile',corazon:'afterHostile',brasa:'afterHostile',ciudadela:'afterHostile',espejo:'afterHostile',presa:'afterHostile',renacer:'hostileResolved',sepulcro:'hostileResolved',trono:'hostileResolved',desierto:'afterHostile',danza:'hostileResolved',loto:'afterHostile',rio:'hostileResolved'};if(replay.method!==allowed[bank.key])fail('METHOD');let result=bank.owner[replay.method](args);
 for(const call of replay.afterCalls||[]){if(!({presa:['debuff'],desierto:['controlResolved'],sepulcro:['endCycle','resolveClimax'],trono:['endCycle']}[bank.key]||[]).includes(call.method))fail('POST_CALL');const a=structuredClone(call.args);if(call.callback)a[0].resolve=()=>replay.callbacks[i++];const value=bank.owner[call.method](...a);if(call.replacesResult)result=value;}
 if(!same(result==null?{status:'INACTIVE'}:result,e.sourceHostileStep)||!same(bank.snapshot(),e.combat.sourceUltimateOwner)||i!==replay.callbacks.length||j!==(replay.anchorAliveChecks||[]).length)fail('ORIGINAL_OWNER_REPLAY');
 const total=e.sourceDerivedPackets.reduce((n,p)=>{if(!p.packet?.result||!Number.isFinite(p.physicalResult?.actualHPDamage)||p.physicalResult.actualHPDamage<0||p.physicalResult.actualHPDamage>p.packet.result.actualHPDamage)fail('PACKET');return n+p.physicalResult.actualHPDamage;},0);
 if(total!==e.result.actualHPDamage)fail('PACKET_TOTAL');
 const cause=r.journal.find(x=>x.round===e.round&&['NATIVE_BOSS_PHYSICAL','NATIVE_BOSS_EFFECT','NATIVE_BOSS_DENIED'].includes(x.type));if(!cause||cause.revision>=e.revision)fail('HOSTILE_CAUSE');
}
function validateSourceCapture(e,r,player){
 const fail=s=>{throw Error('A09_SOURCE_CAPTURE_'+s);},x=e.sourceCaptureReplay;if(!x||e.source!=='A08_PRIVATE_PLAYER_PORT'||e.engineContract!=='NEW_COMBAT_STATS_V0_1'||e.sourceUltimateUID!==r.ultimateCast?.uid||e.sourceUltimateUID!=='FIRE_LOTO_VAPOR_CONCORDANTE')fail('SCOPE');
 const bank=globalThis.LGB_A09_SOURCE_BANK.create({uid:e.sourceUltimateUID,actorId:player.actorId,generation:player.generation,mode:x.before.mode,saved:x.before}),result=bank.owner.beforeHostile(x.args);if(canonical(result)!==canonical(x.result)||canonical(bank.snapshot())!==canonical(e.combat.sourceUltimateOwner)||e.cancel!==(result.cancel===true)||x.args.actionId!==e.actionId||x.args.lifeId!=='grulla_blanca')fail('ORIGINAL_CAPTURE_REPLAY');
 const basic=A09_ACTIONS.slots.find(s=>s.phase===x.phase&&s.abilityId===x.basicAbilityId);if(!basic?.dice||x.basicAbilityId!==(x.phase===3?'grulla__picotazo_blanco':'grulla__golpe_ala'))fail('BASIC_SOURCE');
 if(!x.args.foreignPool){const [n,s,f]=basic.dice,p=x.args.power-basic.p4DamageFlat-f;if(!Number.isInteger(p)||p<n||p>n*s||x.rngAfter!==e.rngAfter)fail('BASIC_POWER');}
}

const cloneDots=x=>structuredClone(x);
function expectedTypedDotRemoval(dots,player,recipe){
 if(!['antidoto','ceniza'].includes(recipe))return dots;
 const data=(typeof ASTRA_A08_DATA==='undefined'?globalThis.ASTRA_A08_DATA:ASTRA_A08_DATA)?.conditionTaxonomyR64,requires=recipe==='antidoto'?{family:'POISON_DOT',treatmentFamily:'jade'}:{family:'BURN_DOT',treatmentFamily:'ceniza'};
 if(!data?.profiles||typeof data.sourceSHA256!=='string')fail('SPECIAL_TAXONOMY_AUTHORITY');
 return dots.filter(d=>{
  const species=player.lives?.find(l=>l.lifeId===d.source)?.id,src=data.profiles[species],typed=src&&{...src,sourceSHA256:data.sourceSHA256};
  return !(typed&&d.family===requires.family&&typed.family===requires.family&&typed.treatmentFamily===requires.treatmentFamily&&Number.isInteger(typed.grade)&&typed.grade>=0&&typed.grade<=1&&same(d.r64Condition,typed));
 });
}
const fail=s=>{throw Error('A09_SAVE_'+s);},canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),same=(a,b)=>canonical(a)===canonical(b);
function validateNativeA09Battle(r,player,module=globalThis.ASTRA_A08_BOSS_LIFECYCLE,current=true){
 if(!r||r.schema!=='A09_NATIVE_BATTLE_V1'||r.actorId!=='grulla_blanca'||typeof r.battleId!=='string'||typeof r.generation!=='string'||r.sourceSHA256!==A09_PHASES.sourceSHA256||!['ACTIVE','CEDIDO','FLED','DEFEATED'].includes(r.status)||!Number.isSafeInteger(r.round)||r.round<0||!Number.isSafeInteger(r.revision)||r.revision<0||!Array.isArray(r.journal)||r.journal.length!==r.revision||r.journal.length>20000||!Number.isInteger(r.rng)||r.rng<=0||r.rng>4294967295)fail('BATTLE_SCHEMA');
 if(r.resourcePolicy!==undefined&&!['NATIVE','QA_REFILL'].includes(r.resourcePolicy))fail('RESOURCE_POLICY');
 if(!module?.create)fail('NATIVE_LIFECYCLE_OWNER_REQUIRED');const identity={actorId:r.actorId,generation:r.generation,battleId:r.battleId};createA09LifecycleOwner({module,identity,saved:r.lifecycle,turn:r.round});
 let dots=cloneDots(r.initialPlayerDots||[]);validateAfflictionList(dots,player);let hp=150,phase=1,pact=false,resolved=0,denied=0,lastImpact=-1,lastBossTurn=-1;const ids=new Set(),playerRounds=new Set();
 for(const[eIndex,e]of r.journal.entries()){
  if(e.id!==r.battleId+':event:'+(eIndex+1)||e.revision!==eIndex+1||ids.has(e.id)||e.battleId!==r.battleId||e.bossGeneration!==r.generation||e.playerActorId!==player.actorId||e.playerGeneration!==player.generation||e.sourceSHA256!==r.sourceSHA256||!Number.isSafeInteger(e.round)||e.round<1||e.round>r.round)fail('JOURNAL_SCOPE');ids.add(e.id);
  if(e.sourcePhaseBoundary){const x=e.sourcePhaseBoundary;if(x.sameActor!==true||x.phaseFrom!==e.phase||x.phaseTo!==e.phase+1||e.phase>=3||e.result?.hpAfter!==0||x.physicalPhaseHPAfter!==0||x.ownerHPAfter!==A09_PHASES.phases[e.phase].stats.HP_MAX.value||x.laterDirectPacketSuppressed!==true||x.source!=='V031_CONTINUOUS_RESOLVE_AND_COMMIT_NO_SAME_MACRO_SPILL')fail('SOURCE_CONTINUOUS_PHASE_BOUNDARY');}
  if(e.type==='NATIVE_OWNER_AFFLICTION'){dots=validateAfflictionOwnerEvent(e,player,dots);continue;}
  if(e.ultimateTicks){if(e.type!=='NATIVE_TARGET_DOT'||e.sourceUltimateUID!==r.ultimateCast?.uid||!same(e.ultimateStateBefore?.uid,e.sourceUltimateUID))fail('ULTIMATE_VOLUNTARY_SCOPE');const state=cloneDots(e.ultimateStateBefore);let index=0;const ticks=globalThis.ASTRA_A08_ULTIMATES.voluntary(state,potency=>{const p=e.sourcePackets[index++];if(!p||p.potency!==potency||p.result.kind!=='DOT'||p.result.effectiveDefense!==0||p.result.critical!==false)fail('ULTIMATE_VOLUNTARY_PACKET_SOURCE');return p.result;});if(index!==e.sourcePackets.length||!same(ticks,e.ultimateTicks)||!same(state,e.ultimateStateAfter)||!same(state,e.bossEffectsAfter.ultimateState))fail('ULTIMATE_VOLUNTARY_OWNER_REPLAY');}
  if(e.sourceRecovery){if(e.type!=='NATIVE_PLAYER_ULTIMATE'||e.ultimateUID!=='WATER_OCEANO_INVERTIDO'||e.sourceRecovery.source!=='V262_OCEANO_NATIVE_RECOVERY'||!same(e.sourceRecovery.input.dots,dots))fail('OCEANO_RECOVERY_CAUSE');const q=globalThis.ASTRA_A08_OCEANO.recovery(e.sourceRecovery.input);if(!same(q,e.sourceRecovery.result)||q.hp!==e.playerHP||q.qi!==e.playerQI||!same(q.dots,e.combat.dots))fail('OCEANO_RECOVERY_SOURCE');dots=cloneDots(q.dots);}
  if(e.type==='NATIVE_PLAYER_CONSUMABLE'&&e.specialTreatment){
   const t=e.specialTreatment;if(t.source!=='R56_AUTHENTIC_CRAFTED_SPECIAL'||t.actionId!==e.actionId||t.itemId!==e.itemId||!['antidoto','ceniza','purificacion','meridianos'].includes(t.recipe)||!same(dots,t.dotsBefore)||!t.effect?.applied)fail('SPECIAL_JOURNAL_PROVENANCE');
   const newDots=expectedTypedDotRemoval(dots,player,t.recipe);
   if(!same(newDots,t.dotsAfter)||!same(newDots,e.combat?.dots)||(['antidoto','ceniza'].includes(t.recipe)&&(newDots.length===dots.length||t.effect.removed!==dots.length-newDots.length||t.effect.family!==(t.recipe==='antidoto'?'POISON_DOT':'BURN_DOT'))))fail('SPECIAL_DOT_SOURCE');
   if(['purificacion','meridianos'].includes(t.recipe)&&!same(t.dotsAfter,dots))fail('SPECIAL_NON_DOT_TREATMENT');
   dots=cloneDots(newDots);
  }
  if(e.type==='NATIVE_WORLD_CLOCK'){if(e.source!=='A08_ORIGINAL_ECOLOGICAL_ADVANCE'||e.after?.turn!==e.before?.turn+1||e.after?.ecology!==e.before?.ecology+1||e.errantsPausedDuringCombat!==true)fail('NATIVE_WORLD_CLOCK');continue;}
  if(e.type==='OWNER_AUTHORIZED_QA_RESOURCE_REFILL'){if(e.missionProgressGranted!==false||e.statisticsChanged!==false)fail('QA_REFILL_SCOPE');continue;}
  if(e.type.startsWith('NATIVE_PLAYER_')){if(playerRounds.has(e.round)||e.engineContract!=='NEW_COMBAT_STATS_V0_1'||e.source!=='A08_PRIVATE_PLAYER_PORT'||e.actorId!==player.actorId)fail('PLAYER_NATIVE_RECEIPT');playerRounds.add(e.round);}
  if(e.type==='NATIVE_SOURCE_CAPTURE'){validateSourceCapture(e,r,player);continue;}
  if(e.type==='NATIVE_BOSS_CAPTURED'){const capture=r.journal.find(p=>p.id===e.sourceCaptureEventId);if(!capture?.cancel||capture.round!==e.round||capture.revision>=e.revision||e.phase!==phase||e.lifecycleReceipt?.status!=='DENIED'||e.lifecycleReceipt?.pactReleased!==false||e.round<=lastBossTurn)fail('CAPTURE_DENIAL_SOURCE');denied++;lastBossTurn=e.round;continue;}
  if(e.type==='NATIVE_SOURCE_OWNER_BOUNDARY'){if(e.source!=='A08_PRIVATE_PLAYER_PORT'||e.sourceOwnerBoundary?.ownerKey!=='luna'||e.sourceOwnerBoundary?.templeRemoved!==true)fail('SOURCE_TARGET_BOUNDARY');continue;}
  if(e.type==='NATIVE_SOURCE_HOSTILE_BOUNDARY'){validateSourceBoundary(e,r,player);if(e.sourceHostileStep?.status==='REVIVAL'){if(e.combat.dots.length)fail('RENACER_SOURCE_DOT_CLEAR');dots=[];}if(!e.sourceDerivedPackets.length)continue;}
  if(['NATIVE_PLAYER_BASIC','NATIVE_PLAYER_TECHNIQUE','NATIVE_TARGET_DOT'].includes(e.type)||e.type==='NATIVE_PLAYER_ULTIMATE'&&e.offensive!==false||e.type==='NATIVE_SOURCE_HOSTILE_BOUNDARY'&&e.sourceDerivedPackets.length){
   const v=e.result;if(e.engineContract!=='NEW_COMBAT_STATS_V0_1'||e.source!=='A08_PRIVATE_PLAYER_PORT'||e.phase!==phase||e.targetId!=='grulla_blanca'||!Number.isFinite(v?.actualHPDamage)||v.actualHPDamage<0||v.hpAfter!==hp-v.actualHPDamage||e.targetRevision<=lastImpact||phase===3&&!pact&&v.hpAfter<1)fail('PHYSICAL_CAUSE');lastImpact=e.targetRevision;hp=v.hpAfter;if(hp===0&&phase<3){phase++;hp=[150,100,50][phase-1];}
  }else if(e.type==='NATIVE_PLAYER_ULTIMATE'&&e.offensive===false){if(e.result?.actualHPDamage!==0||e.ultimateUID!==r.ultimateCast?.uid||e.sourceActivation?.uid!==e.ultimateUID)fail('SELF_ULTIMATE_SOURCE');}else if(e.type==='NATIVE_BOSS_DENIED'){const proof=r.journal.find(p=>p.actionId===e.controlSourceActionId&&p.controlled===true);if(!proof||e.phase!==phase||e.lifecycleReceipt?.status!=='DENIED'||e.lifecycleReceipt?.pactReleased!==false||e.round<=lastBossTurn)fail('CONTROL_DENIAL_SOURCE');denied++;lastBossTurn=e.round;}else if(e.type==='NATIVE_BOSS_PHYSICAL'||e.type==='NATIVE_BOSS_EFFECT'){
   const spec=A09_ACTIONS.slots.find(s=>s.phase===phase&&s.abilityId===e.abilityId),l=e.lifecycleReceipt;if(!spec||e.phase!==phase||e.actorId!=='grulla_blanca'||e.effectAndLifecycleOneTransaction!==true||l?.status!=='RESOLVED'||l.phase!==phase||l.actionId!==e.actionId||e.round<=lastBossTurn)fail('RESOLVED_INTENT');
   if(e.actionId!==r.battleId+':'+r.generation+':grulla_blanca:attempt:'+(resolved+denied+1))fail('ACTION_ID');
   if(e.type==='NATIVE_BOSS_PHYSICAL'&&(!spec.dice||e.engineContract!=='NEW_COMBAT_STATS_V0_1'||e.source!=='A08_PRIVATE_PLAYER_PORT'||e.targetId!==player.actorId||!Number.isFinite(e.result?.actualHPDamage)||e.result.actualHPDamage<0))fail('NATIVE_ATTACK');
   if(e.type==='NATIVE_BOSS_EFFECT'&&(spec.dice||!same(e.appliedSemantics,spec.semantics)||e.source.sha256!==spec.source.sha256||e.resourceModel!=='NONE'||e.qiBefore!==null||e.qiAfter!==null))fail('NATIVE_EFFECT');
   const release=phase===3&&!pact;if(l.pactReleased!==release)fail('PACT_CAUSE');pact=pact||release;resolved++;lastBossTurn=e.round;
  }else if(!['NATIVE_PLAYER_GUARD','NATIVE_PLAYER_FLEE','NATIVE_PLAYER_DEFENSIVE','NATIVE_PLAYER_CONSUMABLE'].includes(e.type))fail('UNKNOWN_JOURNAL_EVENT');
 }
 if(!same(r.playerCombat.dots||[],dots)||current&&['ACTIVE','DEFEATED'].includes(r.status)&&!same(player.dots,dots))fail('PLAYER_AFFLICTION_PARITY');
 if(r.playerCombat.ultimateOceano)globalThis.LGB_A09_OCEANO_OWNER.create(r.playerCombat.ultimateOceano);
 if(r.playerCombat.sourceUltimateOwner){const x=r.playerCombat.sourceUltimateOwner;if(x.uid!==r.ultimateCast?.uid)fail('SOURCE_OWNER_CAST_UID');globalThis.LGB_A09_SOURCE_BANK.create({uid:x.uid,mode:x.mode,actorId:player.actorId,generation:player.generation,saved:x});}
 const l=r.lifecycle;if(l.phase!==phase||l.hp!==hp||l.pactReleased!==pact||l.resolved!==resolved||l.denied!==denied||l.lastImpactRevision!==lastImpact||l.lastTurn!==lastBossTurn||l.terminal!==(phase===3&&hp===0)||l.terminal!==(r.status==='CEDIDO'))fail('LIFECYCLE_JOURNAL_GRAPH');
 if(![0,3].includes(r.effects?.nextDEF)||![0,10].includes(r.effects?.nextEVA)||![0,-2,-4].includes(r.phaseModifiers?.DEF)||![0,-8].includes(r.phaseModifiers?.EVASION)||!Array.isArray(r.pools))fail('EFFECT_MAGNITUDE');
 for(const p of r.pools){if(p.ownerId!=='grulla_blanca'||!Number.isFinite(p.reserve)||p.reserve<0||p.source==='GRULLA_F3_WARD'&&(phase!==3||p.reserve>25||p.perHitCap!==25)||p.source==='GRULLA_CERRAR_ALAS'&&(phase!==2||p.reserve>6||p.perHitCap!==3)||!['GRULLA_F3_WARD','GRULLA_CERRAR_ALAS'].includes(p.source))fail('ABSORPTION_SOURCE');}
 if(r.status==='CEDIDO'){
  const t=r.terminalProof,last=r.journal.filter(e=>(['NATIVE_PLAYER_BASIC','NATIVE_PLAYER_TECHNIQUE','NATIVE_PLAYER_ULTIMATE','NATIVE_TARGET_DOT'].includes(e.type)&&e.offensive!==false||e.type==='NATIVE_SOURCE_HOSTILE_BOUNDARY'&&e.sourceDerivedPackets.length)).at(-1);if(!t||!last||!same(t.nativeReceipt,last)||t.nativeReceipt.result.hpAfter!==0||t.nativeReceipt.result.actualHPDamage<=0||!t.before.boss.pactReleased||t.before.boss.phase!==3||t.before.boss.terminal||!t.after.boss.terminal||t.after.boss.hp!==0||t.after.revision!==t.before.revision+1)fail('TERMINAL_PROOF');
 }else if(r.terminalProof!==null)fail('EARLY_TERMINAL');return true;
}
function validateNativeM18Final(d){
 const a=d.A09Boss,b=a?.battle,s=a?.postcombat,m=d.LIVMissions?.missions.M18,arc=d.World.flags?.arc1;
 return !!(b?.status==='CEDIDO'&&b.lifecycle.terminal&&b.lifecycle.phase===3&&b.lifecycle.hp===0&&b.lifecycle.pactReleased&&s?.stage==='DECIDED'&&['LIBERAR','CUSTODIAR'].includes(s.decisionFinal)&&s.battleId===b.battleId&&s.eventId==='M18:'+b.battleId+':VINCULO_CEDIDO'&&s.M18==='HECHA'&&m?.status==='hecha'&&m.evidence.a09Terminal?.eventId===s.eventId&&m.evidence.a09Decision?.choice===s.decisionFinal&&arc?.decisionFinal===s.decisionFinal&&arc.vinculoGrulla===s.vinculoGrulla&&d.World.quests.M18==='hecha');
}

export { validateNativeA09Battle, validateNativeM18Final };
