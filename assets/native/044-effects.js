(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_EFFECTS=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,fail}=S;
// Effect state only. All hits, crits, DEF, absorption and life damage go through
// combat.js. Coefficients originate in the frozen compiled specifications.
function activate(c,compiled,maxHP){const d=copy(compiled.defensive);if(!d)fail('A08_DEFENSIVE_SPEC_REQUIRED');d.turns_left=d.duration;
 if(d.kind==='FIRE_BARRIER'){c.absorption=d.absorption_pct*maxHP;c.absorptionMax=c.absorption;c.heat=0;}
 else if(d.kind==='WATER_MIRROR'){c.absorption=d.reserve_pct*maxHP;c.absorptionMax=c.absorption;d.reconstructed=false;}
 else if(d.kind==='METAL_PLATES'){d.max_plates=d.plates;d.control_recovery_used=false;}
 else if(d.kind==='EARTH_SKIN')Object.assign(d,{arraigo:d.initial_arraigo,large_hit_used:false,max_extension_used:false,stratum:false,rock_guard:false,reach_heal_used:false,low_heal_used:false,control_extension_used:false,control_precision_used:false});
 else if(d.kind==='WIND_STEP')d.response_created=false;else fail('A08_UNKNOWN_DEFENSE_MODEL');
 c.defensive=d;return d;
}
function playerStats(c,frame){const s=Object.fromEntries(Object.entries(frame.stats).map(([k,v])=>[k,v.value]));const d=c.defensive;
 for(const e of c.effects||[])s[e.stat]+=e.amount;
 if(!d)return s;
 if(d.kind==='METAL_PLATES'){if(d.plates>0)s.DEF+=d.plate_def*(d.r64bPlate?.hits===1?1.25:1);s.TENACITY+=d.adapt_tenacity;}
 if(d.kind==='EARTH_SKIN'){s.DEF+=d.activation_defense+d.arraigo_defense[d.arraigo]+(d.stratum?d.stratum_defense:0)+(d.rock_guard?d.rock_guard_defense:0);s.TENACITY+=d.tenacity_per_arraigo*d.arraigo+(d.arraigo>=2?d.extra_tenacity_at_2:0)+(d.arraigo>=1?d.extra_tenacity:0);}
 if(d.kind==='WIND_STEP')s.EVASION+=d.evasion;return s;
}
function afterIncoming(c,result,hit,maxHP,emit=()=>{}){const d=c.defensive;if(!d||c.hp<=0)return;
 if(!hit){if(d.kind==='WIND_STEP'&&d.response_count&&!d.response_created){c.nextWind={precision:d.response_precision,crit_pp:d.response_crit_pp};d.response_created=true;}return;}
 if(d.kind==='METAL_PLATES'&&d.plates>0&&!(result.damageAfterDefense===0&&d.no_consume_zero)){if(d.r64bPlate?.hits===0){d.r64bPlate.hits=1;emit('PLACA_FIRST_PRESERVED',{plates:d.plates,ownDEF:d.plate_def});}else{if(d.r64bPlate)emit('PLACA_SECOND_CONSUMED',{platesBefore:d.plates,ownDEF:d.plate_def,fortifiedOwnDEF:d.plate_def*1.25});d.plates--;delete d.r64bPlate;}}
 if(d.kind==='EARTH_SKIN'){d.stratum=false;d.rock_guard=false;}
 if(d.kind==='FIRE_BARRIER'&&(result.techniqueAbsorbed??result.absorbed)>0&&d.heat_rate>0)c.heat=Math.min(d.heat_cap_pct*maxHP,(c.heat||0)+(result.techniqueAbsorbed??result.absorbed)*d.heat_rate);
 if(d.kind==='EARTH_SKIN'&&result.actualHPDamage>0){let gain=1;if(!d.large_hit_used&&result.actualHPDamage>=d.large_hit_ratio*maxHP){gain=2;d.large_hit_used=true;}const old=d.arraigo;d.arraigo=Math.min(d.max_arraigo,old+gain);
  if(d.stratum_defense&&d.arraigo>old&&[2,3].includes(d.arraigo))d.stratum=true;
  if(old<d.max_arraigo&&d.arraigo===d.max_arraigo){if(!d.max_extension_used){d.turns_left+=d.reach_max_duration_extension;d.max_extension_used=true;}if(!d.reach_heal_used&&d.reach_max_heal_pct>0){c.hp=Math.min(maxHP,c.hp+d.reach_max_heal_pct*maxHP);d.reach_heal_used=true;}}
  if(d.low_hp_threshold&&c.hp>0&&c.hp/maxHP<d.low_hp_threshold&&!d.low_heal_used){c.hp=Math.min(maxHP,c.hp+d.low_hp_heal_pct*maxHP);d.low_heal_used=true;}}
}
function turnStart(c,emit=()=>{}){const d=c.defensive;if(!d)return;
 if(d.kind==='WATER_MIRROR'&&d.turns_left>0){if(c.absorption>0){const wanted=d.reflow_pct*c.absorptionMax,actual=Math.min(c.absorptionMax-c.absorption,wanted);c.absorption+=actual;if(d.r64bEmbalse){const before=d.r64bEmbalse.reserve;d.r64bEmbalse.reserve=Math.min(d.r64bEmbalse.max,before+wanted-actual);if(d.r64bEmbalse.reserve>before)emit('EMBALSE_OVERFLOW_STORED',{wanted,actual,stored:d.r64bEmbalse.reserve-before,reserve:d.r64bEmbalse.reserve,max:d.r64bEmbalse.max});}}else if(d.reconstruct_pct>0&&!d.reconstructed){c.absorption=d.reconstruct_pct*c.absorptionMax;d.reconstructed=true;delete d.r64bEmbalse;}}
 if(d.kind==='EARTH_SKIN'&&d.turns_left>0&&d.arraigo===d.max_arraigo&&d.rock_guard_defense)d.rock_guard=true;
}
function endRound(c,maxQI){const d=c.defensive;if(d&&--d.turns_left<=0){if(d.kind==='WATER_MIRROR'&&c.absorption>0&&d.restore_qi_on_natural_expire)c.qi=Math.min(maxQI,c.qi+d.restore_qi_on_natural_expire);if(['FIRE_BARRIER','WATER_MIRROR'].includes(d.kind)){c.absorption=0;c.absorptionMax=0;}c.defensive=null;}
 c.controlStability=null;
 c.effects=(c.effects||[]).map(e=>({...e,turns:e.turns-1})).filter(e=>e.turns>0);
}
function replaceEffect(actor,stat,amount,turns,tag){actor.effects=(actor.effects||[]).filter(e=>e.tag!==tag);actor.effects.push({stat,amount,turns,tag});}
function enemyStats(life,stats){const s={...stats};for(const e of life.effects||[])s[e.stat]+=e.amount;if(life.peso?.duration>0)s.evasion-=life.peso.stacks*life.peso.per_stack;if(life.arrastrePrecision)s.precision-=life.arrastrePrecision;return globalThis.ASTRA_A08_LIV_T0?.enemyStats(life,s)||s;}
// The owner clock is preserved from the closed technique lifecycle. Numerical
// damage is supplied exclusively by V284; this module never rolls or applies DEF.
function tickDots(actor,resolve){const results=[];
 for(const dot of actor.dots||[]){if(actor.hp<=0)break;if(!Number.isInteger(dot.ticks_left)||dot.ticks_left<1)fail('A08_INVALID_DOT_LIFETIME');
  const result=resolve(copy(dot));if(!result||result.kind!=='DOT'||!Number.isFinite(result.hpAfter)||result.hpAfter<0||result.hpAfter>actor.hp)fail('A08_DOT_RESOLVER_RESULT');
  actor.hp=result.hpAfter;if(actor.absorption!==undefined)actor.absorption=result.ownerAbsorptionAfter??result.absorptionAfter;dot.ticks_left--;results.push({dot:copy(dot),result});}
 actor.dots=(actor.dots||[]).filter(d=>d.ticks_left>0);return results;
}
function monsterConnected(c,profile,lifeId,treatment=null){const t=profile.technique;if(t?.params_status!=='READY')fail('A08_MONSTER_PARAMS_NOT_READY');const q=t.params;
 if(c.hp<=0)return {dot:null,qiDrained:0};let applied=null;
 for(const [mechanic,key]of [['POISON_DOT','poison'],['BURN_DOT','burn']])if(t.mechanics.includes(mechanic)){
  const d=q[key];if(!d||typeof d.damage!=='string'||!Number.isInteger(d.ticks)||d.ticks<1)fail('A08_MONSTER_DOT_SOURCE');
  applied={family:mechanic,source:lifeId,dice:d.damage,ticks_left:d.ticks,duration_unit:'OWNER_TURNS',persists_out_of_combat:true,persists_room_change:true,persists_save:true,out_of_combat_min_hp:1};if(treatment?.family===mechanic)applied.r64Condition=copy(treatment);(c.dots||=[]).push(applied);}
 let qiDrained=0;if(t.mechanics.includes('QI_DRAIN')){if(!Number.isFinite(q.qi_drain)||q.qi_drain<0)fail('A08_MONSTER_QI_DRAIN_SOURCE');qiDrained=Math.min(c.qi,q.qi_drain);c.qi-=qiDrained;}
 return {dot:applied?copy(applied):null,qiDrained};
}
function afterOutgoing(c,life,compiled,controlRoll,playerControl,enemyTenacity){if(!compiled)return null;
 if(compiled.dot){life.dots||=[];const d=compiled.dot,same=()=>life.dots.filter(x=>x.family===d.family&&x.source===compiled.technique_id);while(same().length>=d.max_stacks){const old=same()[0];life.dots=life.dots.filter(x=>x!==old);}life.dots.push({family:d.family,source:compiled.technique_id,flat:d.flat_per_tick,ticks_left:d.ticks});}
 if(compiled.debuff){const d=compiled.debuff;replaceEffect(life,d.stat,d.amount,d.turns,compiled.technique_id+':'+d.stat);}
 let controlled=null;if(compiled.control){const ctl=compiled.control;if(!(ctl.anti_lock&&life.arrastreLocked)){const chance=Math.min(100,Math.max(5,ctl.base+ctl.bonus+playerControl-enemyTenacity));controlled=controlRoll()*100<chance;if(controlled){life.skipNext=true;life.arrastreLocked=true;life.arrastrePrecision=ctl.precision_debuff_on_success;if(ctl.next_precision)life.nextLatigazo=ctl.next_precision;}}}
 if(compiled.model==='EARTH_OFFENSE'){const p=compiled.peso,old=life.peso?.stacks||0;life.peso={per_stack:p.evasion_per_stack,max:p.max_stacks,stacks:Math.min(p.max_stacks,old+1),duration:p.duration};const s=compiled.self_stability;if(s.tenacity)replaceEffect(c,'TENACITY',s.tenacity,1,'golpe:tenacity');if(s.defense)replaceEffect(c,'DEF',s.defense,1,'golpe:defense');if(s.next_precision_on_control_fail)c.controlStability={precision:s.next_precision_on_control_fail};}
 return controlled;
}
// Only the private dispatcher may unwrap a real committed Control result.
function afterControl(c,domain,cap,observe=()=>{}){return domain.consumeResult(cap,r=>{observe(r);if(r.kind!=='HOSTILE_CONTROL'||r.success||r.immune||c.hp<=0)return [];
 const applied=[],d=c.defensive;
 if(c.controlStability){c.nextGolpeStability=c.controlStability.precision;c.controlStability=null;applied.push('golpe_t3_stab');}
 if(d?.turns_left>0&&d.kind==='METAL_PLATES'&&d.recover_on_control_fail&&!d.control_recovery_used){d.control_recovery_used=true;const before=d.plates;d.plates=Math.min(d.max_plates,d.plates+1);if(d.plates>before)applied.push('armadura_t3_adapt');}
 if(d?.turns_left>0&&d.kind==='EARTH_SKIN'){
  if(d.control_fail_extension&&!d.control_extension_used){d.control_extension_used=true;d.turns_left+=d.control_fail_extension;applied.push('piel_t2_stab');}
  if(d.next_golpe_precision&&d.arraigo===d.max_arraigo&&!d.control_precision_used){d.control_precision_used=true;c.nextGolpe=d.next_golpe_precision;applied.push('piel_t3_stab');}
 }
 return applied;
});}
function absorbPools(c,result,externalAbsorbed=0,emit=()=>{}){const remaining=Math.max(0,(result.absorbed||0)-externalAbsorbed),techniqueAbsorbed=Math.min(c.absorption||0,remaining),gearAbsorbed=Math.min(c.gearAbsorption||0,remaining-techniqueAbsorbed);c.absorption=Math.max(0,(c.absorption||0)-techniqueAbsorbed);c.gearAbsorption=Math.max(0,(c.gearAbsorption||0)-gearAbsorbed);const e=c.defensive?.r64bEmbalse;if(e&&techniqueAbsorbed>0){if(c.absorption===0)delete c.defensive.r64bEmbalse;else{const released=Math.min(e.reserve,c.absorptionMax-c.absorption);e.reserve-=released;c.absorption+=released;if(released>0)emit('EMBALSE_POST_LOSS_RELEASED',{released,reserve:e.reserve,absorption:c.absorption,incomingHPDamage:result.actualHPDamage});}}return {...result,ownerAbsorptionAfter:c.absorption,techniqueAbsorbed,gearAbsorbed,externalAbsorbed};}
function gearAfterDamage(c,worn,catalog,maxHP){if(c.gearAbsorptionTriggered||c.hp<=0)return null;for(const item of worn){const e=catalog[item.itemId]?.effect;if(e?.type!=='HP_THRESHOLD_ABSORPTION')continue;if(e.uses!==1||!Number.isFinite(e.threshold_pct)||!Number.isFinite(e.absorption_max_hp_percent))fail('A08_GEAR_EFFECT_SOURCE');if(c.hp/maxHP<=e.threshold_pct/100){c.gearAbsorption=e.absorption_max_hp_percent/100*maxHP;c.gearAbsorptionTriggered=true;return {itemId:item.itemId,instanceId:item.instanceId,reserve:c.gearAbsorption,threshold:e.threshold_pct,source:'V201_HP_THRESHOLD_ABSORPTION'};}}return null;}
return Object.freeze({activate,playerStats,afterIncoming,turnStart,endRound,replaceEffect,enemyStats,afterOutgoing,tickDots,monsterConnected,afterControl,absorbPools,gearAfterDamage});
});
