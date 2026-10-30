// Selected A09 action drafts. No native receipt or player mutation is emitted here.
// The host must attest sources and commit the draft with lifecycle in G08.
const copy=x=>structuredClone(x),fail=s=>{throw Error('A09_ACTION_'+s);};
function selectedSlot(catalog,phase,id){const s=catalog.slots.find(s=>s.phase===phase&&s.abilityId===id);if(!s)fail('PHASE_SLOT');return s;}
function proposeOffensivePacket(catalog,{phase,abilityId,rolls,round,observablePlayerDEF}){
 const s=selectedSlot(catalog,phase,abilityId);if(!s.dice)fail('OFFENSIVE_SLOT_REQUIRED');
 const [count,sides,flat]=s.dice;if(!Array.isArray(rolls)||rolls.length!==count||rolls.some(n=>!Number.isInteger(n)||n<1||n>sides))fail('NATIVE_DICE_REQUIRED');
 const armor=catalog.armorReply,armorReply=[2,3].includes(phase)&&round>=armor.min_round&&Number.isFinite(observablePlayerDEF)&&observablePlayerDEF>=armor.min_effective_player_def&&abilityId===armor.ability_by_phase['F'+phase];
 return {kind:'A09_SELECTED_PACKET_DRAFT',phase,abilityId,base:rolls.reduce((a,b)=>a+b,0)+flat+s.p4DamageFlat+(armorReply?armor.damage_flat:0),attackBonus:s.attack_bonus,additionalPercentPenetration:armorReply?armor.percent_penetration_pp:0,flatPenetration:null,qiDrainAfterPositiveHP:s.qi_drain_on_damage||0,costQI:0,armorReply,nativeAuthorized:false,source:s.source};
}
function initialSelectedEffects(){return {nextDEF:0,nextEVA:0,guard:null,resonance:false,plan:null,f1Opened:false,f3Opened:false,f3ZeroHPHits:0};}
function proposeNonOffensiveEffect(catalog,raw,attempt,{previousPlayerAction=null,planProposal=null}={}){
 const s=selectedSlot(catalog,attempt.phase,attempt.abilityId);if(s.dice)fail('NON_OFFENSIVE_SLOT_REQUIRED');const next=copy(raw),out={next,playerQIDrain:0,semantics:copy(s.semantics),requiresAtomicLifecycle:true,nativeReceipt:null};
 if(s.defense_bonus!==undefined){next.nextDEF=s.defense_bonus;if(attempt.phase===1)next.resonance=true;}
 if(s.evasion_bonus!==undefined)next.nextEVA=s.evasion_bonus;
 if(s.guard_capacity!==undefined)next.guard={source:'GRULLA_CERRAR_ALAS',reserve:s.guard_capacity,perHitCap:s.guard_per_hit,expires:'END_NEXT_COMPLETE_PLAYER_OFFENSIVE_ACTION'};
 if(s.qi_drain!==undefined&&previousPlayerAction?.resolved===true&&previousPlayerAction.qiSpent>0)out.playerQIDrain=s.qi_drain;
 if(s.kind==='PLAN_PREP'){if(!planProposal)fail('SELECTED_PLAN_DRAFT_REQUIRED');next.plan=copy(planProposal);}
 return out;
}
function finishPlayerOffensiveAction(raw,{resolved,complete}){const next=copy(raw);if(resolved&&complete){next.nextDEF=0;next.nextEVA=0;next.guard=null;}return next;}
function afterSelectedBossResolution(catalog,raw,before,receipt){
 const next=copy(raw),deltas={DEF:0,EVASION:0};if(receipt?.status!=='RESOLVED')return {next,deltas,playerQIDrain:0};
 const f1=catalog.guardOpenF1;if(before.phase===1&&before.round>=f1.minRound&&before.bossHP>=f1.minimumBossHP&&before.playerHP<=before.playerHPMax*f1.maximumPlayerHPRatio&&!next.f1Opened){next.f1Opened=true;deltas.DEF=f1.ownDEFDelta;}
 const spec=selectedSlot(catalog,before.phase,receipt.abilityId);
 if(before.phase===3&&spec.dice){if(receipt.hit===true&&receipt.actualHPDamage===0)next.f3ZeroHPHits++;else if(receipt.hit===true&&receipt.actualHPDamage>0)next.f3ZeroHPHits=0;
  const f3=catalog.guardOpenF3;if(before.round>=f3.minRound&&next.f3ZeroHPHits>=f3.zeroHPConnectedHitThreshold&&!next.f3Opened){next.f3Opened=true;deltas.DEF=f3.ownDEFDelta;deltas.EVASION=f3.ownEVADelta;}}
 return {next,deltas,playerQIDrain:receipt.hit===true&&receipt.actualHPDamage>0?(spec.qi_drain_on_damage||0):0};
}
function enterSelectedEffectsPhase(raw){const next=initialSelectedEffects();next.f1Opened=raw.f1Opened;return next;}

export { afterSelectedBossResolution, enterSelectedEffectsPhase, finishPlayerOffensiveAction, initialSelectedEffects, proposeNonOffensiveEffect, proposeOffensivePacket, selectedSlot };
