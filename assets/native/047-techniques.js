(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_TECHNIQUES=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail}=S;
const modernAoeNodes=new Set(['circulo_t1_direct','circulo_t1_eff','circulo_t2_direct','marea_t1_direct','marea_t1_eff','marea_t2_direct','lluvia_t1_direct','lluvia_t1_eff','lluvia_t2_direct','lluvia_t2_eff','temblor_t1_direct','temblor_t2_direct','tijera_t2_direct']);
const lowerAoeNodes=new Set(['circulo_t1_dot','circulo_t2_dot','circulo_t2_eff','temblor_t1_debuff','temblor_t1_prep','temblor_t2_debuff','temblor_t2_prep','tijera_t1_int','tijera_t1_direct','tijera_t1_flow','tijera_t2_int','marea_t1_debuff','lluvia_t1_break','marea_t2_debuff','lluvia_t2_break','marea_t2_eff','tijera_t2_flow']);
const connectedControlHooks=Object.freeze({golpe_t3_stab:'next_precision_on_control_fail',armadura_t3_adapt:'recover_on_control_fail',piel_t2_stab:'control_fail_extension',piel_t3_stab:'next_golpe_precision'});
const pendingHooks=Object.freeze({});
function nodeConnected(D,nodeId){const skill=D.skillRegistry.find(s=>s.tiers.some(t=>t.nodes.some(n=>n.id===nodeId)));return !!skill&&!Object.hasOwn(pendingHooks,nodeId)&&(D.skills[skill.id].targeting!=='AOE'||modernAoeNodes.has(nodeId)||lowerAoeNodes.has(nodeId)||D.aoeV12?.authority.fifteen_purchased_T3.includes(nodeId));}
function compile(D,{skillId,choices,stage,principalRoot}){
 if(!Object.hasOwn(D.skills,skillId)||!Array.isArray(choices)||choices.some(x=>![0,1,2].includes(x))||choices.length>3)fail('A08_SKILL_SPEC_SCOPE');
 const spec=D.compiledSkills[skillId][choices.join('')]?.[principalRoot.toLowerCase()];if(!spec)fail('A08_COMPILED_SPEC_NOT_FOUND');const c=copy(spec);
 c.source_git_blob=D.source.skills;c.stage=stage;
 if(c.targeting==='AOE'){
  // V112/V269 supersede the old shared families. Start from the unchanged
  // zero-node specification; no legacy T3 or wind-bleed/link can leak through.
  const skill=D.skillRegistry.find(s=>s.id===skillId),nodes=choices.map((v,i)=>skill.tiers[i].nodes[v]);
  if(nodes.some(n=>!nodeConnected(D,n.id)))fail('A08_MODERN_AOE_NODE_PORT_PENDING');
  const base=copy(D.compiledSkills[skillId][''][principalRoot.toLowerCase()]);Object.assign(c,base,{choices:copy(choices),families:nodes.map(n=>n.source_family),source_git_blob:D.source.skills,stage,modernNodeIds:nodes.map(n=>n.id)});
  c.blockedSubfields=nodes.some(n=>n.id==='marea_t2_debuff')?['PRESSURE_CONTROL_BASE_NOT_RECOVERED']:[];let raw=D.skills[skillId].base.qi_cost;if(['fuego','agua','metal'].includes(c.root)&&choices[0]===2)raw-=1;
  if(c.root!=='viento'&&choices[0]===1)c.direct_pct+=15;if(choices[1]===1){c.direct_pct+=20;raw+=c.root==='fuego'?2:1;}
  if(c.root==='metal'&&choices[1]===2)raw*=.9;
  if(c.root==='tierra'&&choices[1]===0)c.debuff=copy(D.compiledSkills[skillId][choices.slice(0,2).join('')][principalRoot.toLowerCase()].debuff);
  if(choices[0]===1&&choices[1]===1&&c.root!=='viento'){const prior=D.compiledSkills[skillId][choices.slice(0,2).join('')][principalRoot.toLowerCase()];c.crit_pp=prior.crit_pp;c.crit_damage_add=prior.crit_damage_add;}
  if(principalRoot==='AGUA')raw*=.9;c.qi_cost_raw=raw;c.qi_cost=Math.max(3,Math.floor(raw+.5)-Math.floor(1.5*choices.length+.5));c.precision_mod+=Math.min(choices.length,2)*3;
 }
 // Explicit V38 scope is II ONLY. Do not spread its 5 Qi to I or III–IV.
 if(stage==='LianQi_II'&&['lanza_nubes','paso_nube'].includes(skillId)){
  const r=D.windV38;if(r.status!=='HUMAN_RATIFIED_NUMERIC_DESIGN__PENDING_RUNTIME_INTEGRATION')fail('A08_V38_AUTHORITY');
  c.source_git_blob=D.source.windV38;
  if(skillId==='lanza_nubes'){
   // Recompute from exact cost operations; never apply the T1 discount twice.
   let cost=r.base_qi_cost.after;if(choices[0]===2)cost-=1;if(choices[1]===1)cost+=D.skills[skillId].model_params.direct_t2_qi_add;
   if(choices[1]===2)cost*=D.skills[skillId].model_params.eff.t2_mult;if(choices[2]===2)cost*=D.skills[skillId].model_params.eff.t3_mult;
   if(principalRoot==='AGUA')cost*=.9;c.qi_cost_raw=cost;c.qi_cost=Math.floor(cost+.5);
   if(choices[0]===0){c.damage_dice=r.prev_ratified_v36.lanza_t1_prec_damage_dice;c.nominal_damage=9;}
   if(choices[0]===1)c.direct_pct+=r.prev_ratified_v36.lanza_t1_direct_percent-D.skills[skillId].model_params.direct_pct[0];
  }else if(choices[0]===0)c.defensive.evasion=r.prev_ratified_v36.paso_t1_eva+(choices.slice(1).filter(x=>x===0).length*D.skills[skillId].model_params.evasion_each);
 }
 return freeze(c);
}
return Object.freeze({compile,nodeConnected,pendingHooks,connectedControlHooks});
});
