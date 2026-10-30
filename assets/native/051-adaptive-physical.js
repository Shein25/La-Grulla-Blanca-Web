(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_ADAPTIVE_PHYSICAL=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail,number}=S;
function validateProfile(p){if(p?.engine_contract!=='NEW_COMBAT_STATS_V0_1'||p.stats_status!=='READY')fail('A08_ADAPTIVE_T0_NOT_READY');const t=p.technique;if(!t)return p;if(t.params_status!=='READY')fail('A08_ADAPTIVE_PARAMS_NOT_READY');
 for(const m of t.mechanics){if(!['DIRECT_DAMAGE','QI_DRAIN','POISON_DOT','BURN_DOT'].includes(m))fail('A08_UNKNOWN_MONSTER_MECHANIC');const q=t.params;if(m==='DIRECT_DAMAGE'&&typeof q.direct_damage!=='string')fail('A08_MONSTER_DIRECT_SOURCE');if(m==='QI_DRAIN')number(q.qi_drain,'MONSTER_QI_DRAIN');if(['POISON_DOT','BURN_DOT'].includes(m)){const d=m==='POISON_DOT'?q.poison:q.burn;if(!d||typeof d.damage!=='string'||!Number.isInteger(d.ticks)||d.ticks<1)fail('A08_MONSTER_DOT_SOURCE');}}
 return p;
}
function activate(state,spec){const s=copy(spec);if(!['EVADE_NEXT','DEFENSE_UP','MITIGATE_NEXT'].includes(s.kind))fail('A08_UNSUPPORTED_SURVIVAL_EFFECT');
 if(!Number.isInteger(s.cooldown_rounds)||s.cooldown_rounds<1)fail('A08_SURVIVAL_COOLDOWN_SOURCE');state.survival={...s,charges:s.kind==='EVADE_NEXT'?(s.charges===undefined?1:s.charges):1};state.survivalCooldown=s.cooldown_rounds;return freeze(copy(state.survival));}
function defensiveStats(stats,state){const s={...stats},a=state.survival;if(a?.kind==='EVADE_NEXT')s.evasion+=a.evasion_bonus;if(a?.kind==='DEFENSE_UP')s.defense+=a.defense_bonus;return s;}
function consume(state,connected){const a=state.survival;if(!a)return;if(a.kind==='MITIGATE_NEXT'&&!connected)return;if(--a.charges<=0)state.survival=null;}
function endRound(state){if(state.survivalCooldown>0)state.survivalCooldown--;}
function packet(dice,source,extra={}){if(typeof dice!=='string'||!dice)fail('A08_ADAPTIVE_PACKET_SOURCE');return {kind:'DIRECT',dice,scalar:1,source,...extra};}
function canonicalPackets(profile){validateProfile(profile);const t=profile.technique;if(!t)fail('A08_CANONICAL_TECHNIQUE_MISSING');const q=t.params,out=[];
 if(t.mechanics.includes('DIRECT_DAMAGE'))out.push(packet(q.direct_damage,'FROZEN_T0_TECHNIQUE'));
 const dot=q.poison||q.burn;if(dot)out.push({kind:'APPLY_DOT',dice:dot.damage,ticks:dot.ticks,source:'FROZEN_T0_TECHNIQUE',requiresOpeningHit:true});
 if(t.mechanics.includes('QI_DRAIN'))out.push({kind:'QI_DRAIN',amount:q.qi_drain,source:'FROZEN_T0_TECHNIQUE',requiresOpeningHit:true});return freeze(out);
}
function maturePackets(source,id,profile){validateProfile(profile);const c=source.astraMonsterContract(id);if(!c.tiersRatified)fail('A08_UNRATIFIED_ADAPTIVE_KIT');
 if(id==='rata_qi')return freeze([packet(profile.stats.basic_damage,'INSTANCE_BASIC'),packet('2d4','T4_LI_FOLLOWUP_CANONICAL_T0_2D4',{scalar:c.tierSource.t4.followup.scalar})]);
 if(['serpiente_qi','avispa_jade'].includes(id))return freeze([packet(profile.stats.basic_damage,'INSTANCE_BASIC'),{kind:'IMMEDIATE_DOT',dice:profile.technique.params.poison.damage,source:'INSTANCE_POISON_TICK',requiresOpeningHit:true,addsDuration:false}]);
 return canonicalPackets(profile);
}
function counterPackets(source,id,profile){validateProfile(profile);const c=source.astraMonsterContract(id);if(!c.tiersRatified)fail('A08_UNRATIFIED_ADAPTIVE_KIT');
 if(['serpiente_qi','avispa_jade'].includes(id))return freeze([{kind:'IMMEDIATE_DOT',dice:profile.technique.params.poison.damage,source:'INSTANCE_POISON_TICK',addsDuration:false}]);
 if(['mono_pildoras','lobo_espiritual'].includes(id))return canonicalPackets(profile);
 return freeze([packet(profile.stats.basic_damage,'INSTANCE_BASIC')]);
}
return Object.freeze({validateProfile,activate,defensiveStats,consume,endRound,canonicalPackets,maturePackets,counterPackets});
});
