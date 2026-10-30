(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'),require('./monster-profiles.js'));else root.ASTRA_A08_STATS=factory(root.ASTRA_A08_SHARED,root.ASTRA_A08_MONSTER_PROFILES);})(globalThis,function(S,Profiles){
'use strict';const {freeze,copy,fail,number}=S;
const FIELDS=['HP_CURRENT','HP_MAX','QI_CURRENT','QI_MAX','PRECISION','EVASION','DEF','PERCENT_PENETRATION','FLAT_PENETRATION','CRIT_CHANCE','CRIT_DAMAGE','CONTROL','TENACITY','LIFESTEAL_PERCENT'];
const mapping={hp_max:'HP_MAX',qi_max:'QI_MAX',precision:'PRECISION',evasion:'EVASION',defense:'DEF',percent_penetration_pp:'PERCENT_PENETRATION',crit_chance_pp:'CRIT_CHANCE',control:'CONTROL',tenacity:'TENACITY',crit_damage_pp:'CRIT_DAMAGE'};
function createProvider(data,{resolveIndividual=()=>null,resolveFoundation=()=>null}={}){
 // ZhuJi requires a PRIVATE native owner capability. A textual quality alone cannot authorize stats.
 const ratified=data.zhujiStatsRatified;
 const qualityMap=ratified?.status==='HUMAN_RATIFIED_DESIGN_ONLY__NOT_NATIVE'&&ratified?.zhuji?.foundation_qualities?.length===4?
  Object.fromEntries(ratified.zhuji.foundation_qualities.map(q=>[q.id,q])):null;
 const issued=new WeakSet();
 function player({actorId,generation,stage,root,current,equipment,foundationCap=null}){
  let foundation=null,base=data.stageResources.stages[stage];
  if(stage==='ZhuJi'){
   foundation=resolveFoundation(foundationCap,{actorId,generation,stage});
   if(!foundationCap||!foundation||foundation.actorId!==actorId||foundation.generation!==generation||foundation.stage!=='ZhuJi'||
    typeof foundation.commitId!=='string'||foundation.commitId.length<8||foundation.verified!==true||
    !qualityMap||!Object.hasOwn(qualityMap,foundation.quality))fail('B3_ZHUJI_PRIVATE_FOUNDATION_CAP_REQUIRED');
   const authorized=qualityMap[foundation.quality];
   base={HP_MAX:authorized.hp_max,QI_MAX:authorized.qi_max};
  }else if(foundationCap!==null)fail('B3_FOUNDATION_CAP_IN_NON_ZHUJI_STAGE');
  if(!base||!data.roots.includes(root)||typeof actorId!=='string'||typeof generation!=='string')fail('A08_STAGE_OR_ROOT');
  number(current.hp,'CURRENT_HP');number(current.qi,'CURRENT_QI');const stats={},modifiers={};
  for(const key of FIELDS)stats[key]={value:null,source:null,authority:'BLOCKED_SOURCE',version:'V284',modifiers:[]};
  function set(k,v,source,blob,authority='APPROVED_EXACT_SOURCE'){stats[k]={...stats[k],value:v,source,source_git_blob:blob,approval_git_blob:'19613fe3e8c5d4509e830961ed08139543b6b34b',scope:{actorId,generation,stage,root,field:k},authority,version:source};}
  const resourceSource=foundation?'B3_ZHUJI_QUALITY_HUMAN_RATIFIED_V01':'V297',resourceBlob=foundation?'zhuji-stats-ratified.json':'27885976dab098919a87778d84fdb1fbec45ed25';
  set('HP_MAX',base.HP_MAX,resourceSource,resourceBlob);set('QI_MAX',base.QI_MAX,resourceSource,resourceBlob);
  set('CRIT_CHANCE',5,'V284_UNIVERSAL_CRITICAL_RULE','62f86b92289e9c9b98d92399684f46a1e5338d14');set('CRIT_DAMAGE',1.5,'V284_UNIVERSAL_CRITICAL_RULE','62f86b92289e9c9b98d92399684f46a1e5338d14');
  for(const [k,v]of Object.entries({PRECISION:100,EVASION:5,DEF:1,CONTROL:0,TENACITY:0,PERCENT_PENETRATION:0,FLAT_PENETRATION:0}))set(k,v,'V307_PLAYER_BASE_EXACT_TEST_SOURCE','dce2bd573fabc42ef33d6f8a3ddcdd66c43478d0');
  set('LIFESTEAL_PERCENT',0,'V284_PREPARED_ARC1_NO_ACTIVE_GRANT','62f86b92289e9c9b98d92399684f46a1e5338d14','NO_ACTIVE_EFFECT_SOURCE');
  // Closed root clauses are read from V284, NOT the deprecated E1 ROOTS table.
  if(root==='TIERRA')stats.HP_MAX.value=Math.floor(base.HP_MAX*1.10+0.5);
  if(root==='FUEGO')stats.CRIT_CHANCE.value+=5;
  if(root==='VIENTO')stats.CRIT_DAMAGE.value+=0.05;
  if(root==='VIENTO')stats.EVASION.value=10; // V284 innate base; not E1's generic 5 + ROOTS 10.
  if(root==='METAL'){stats.PRECISION.value+=5;stats.PERCENT_PENETRATION.value+=10;}
  if(root==='AGUA')stats.CONTROL.value+=5;
  if(root==='TIERRA')stats.TENACITY.value+=5;
  const worn=new Set();
  for(const item of equipment){const d=data.items[item.itemId];if(!d||d.tipo!=='equipo'||worn.has(item.instanceId))fail('A08_UNKNOWN_EQUIPPED_STAT_SOURCE');worn.add(item.instanceId);
   for(const [k,amount]of Object.entries(d.stats)){number(amount,'EQUIPMENT_MODIFIER',{signed:true});const mapped=mapping[k];
    if(!mapped){if(!['basic_attack_flat','technique_direct_damage_percent'].includes(k))fail('A08_UNMAPPED_EQUIPMENT_STAT');(modifiers[k]||=[]).push({amount,itemId:item.itemId,instanceId:item.instanceId,source:'V201',source_git_blob:data.equipmentBlob});continue;}
    const m={amount:k==='crit_damage_pp'?amount/100:amount,itemId:item.itemId,instanceId:item.instanceId,source:'V201',source_git_blob:data.equipmentBlob};stats[mapped].modifiers.push(m);if(stats[mapped].value!==null)stats[mapped].value+=m.amount;
   }}
  stats.HP_MAX.value=Math.floor(stats.HP_MAX.value+0.5);stats.QI_MAX.value=Math.floor(stats.QI_MAX.value+0.5);
  set('HP_CURRENT',current.hp,'VALIDATED_NATIVE_RESOURCE','NATIVE_RESOURCE_COMMIT');set('QI_CURRENT',current.qi,'VALIDATED_NATIVE_RESOURCE','NATIVE_RESOURCE_COMMIT');
  if(current.hp>stats.HP_MAX.value||current.qi>stats.QI_MAX.value)fail('A08_RESOURCE_ABOVE_RATIFIED_MAX');
  const frame=freeze({actorId,generation,stage,root,stats,modifiers,complete:FIELDS.every(k=>stats[k].value!==null),missing:FIELDS.filter(k=>stats[k].value===null),rootDamagePercent:root==='FUEGO'?10:0,rootQICostMultiplier:root==='AGUA'?0.9:1,sourcePolicy:foundation?'B3_ZHUJI_RATIFIED_STATS_EXPERIMENTAL_NOT_G08':'V307_EXACT_FIELD_RECONCILIATION',foundation:foundation?{quality:foundation.quality,commitId:foundation.commitId,directDamageBonusPercent:qualityMap[foundation.quality].foundation_damage_bonus_pct,techniqueBaseScalar:ratified.zhuji.direct_technique_base_scalar,basicAttack:ratified.zhuji.basic_attack}:null});issued.add(frame);return frame;
 }
 function monster({id,encounterId=null,actorId,generation,lifeId,currentHP,individualLife=null}){const individual=individualLife?resolveIndividual(individualLife,{id,encounterId,lifeId}):null;if(individualLife&&!individual)fail('R58_UNAUTHORIZED_INDIVIDUAL_STAT_FRAME');const p=individual?.profile||Profiles.resolve(data,{id,encounterId}),profileSource=Profiles.source(data,{id,encounterId}),provenance=encounterId?{source_git_blob:null,source_artifact_sha256:data.encounterProfiles[encounterId].authorityCandidateSHA256,profile_sha256:profileSource,source_scope:'M02_ACCEPTED_NEW_COMPLETE_PROFILE'}:p.ratification?{source_git_blob:null,source_artifact_sha256:p.sourceArtifactSHA256,approval_artifact_sha256:p.ratification.authoritySHA256,source_scope:'OWNER_RATIFIED_R52_T0_V136'}:p.experimentalScope==='R52_QA_T0_V136'?{source_git_blob:null,source_artifact_sha256:p.sourceArtifactSHA256,source_scope:'R52_QA_V136_NOT_RATIFIED'}:{source_git_blob:profileSource};if(!p||p.stats_status!=='READY'||!data.source.monsters)fail('BLOCKED_SOURCE_MONSTER:'+id);const m=p.stats;if(individual)Object.assign(provenance,{individual_source_sha256:individual.sourceHash,individual_life_id:lifeId});
  const names={HP_MAX:'hp',PRECISION:'precision',EVASION:'evasion',DEF:'defense',CONTROL:'control',TENACITY:'tenacity',CRIT_CHANCE:'crit_chance',CRIT_DAMAGE:'crit_damage'},stats={};
  for(const [field,key]of Object.entries(names)){number(m[key],'MONSTER_'+key);stats[field]={value:m[key],source:'SCOPED_NEW_MONSTER_T0',...provenance,authority:p.experimentalScope==='R52_QA_T0_V136'?'EXPERIMENTAL_V136_QA_NOT_RATIFIED':'APPROVED_EXACT_SOURCE',version:'V284/V307',scope:{actorId,generation,lifeId,id,encounterId,field},modifiers:[]};}
  number(currentHP,'MONSTER_CURRENT_HP');if(currentHP>m.hp)fail('A08_MONSTER_HP_ABOVE_MAX');stats.HP_CURRENT={...stats.HP_MAX,value:currentHP,source:'NATIVE_LIFE_OWNER'};
  if(p.resource_model!=='NONE'||m.qi_max!==null)fail('A08_MONSTER_RESOURCE_SCOPE');for(const k of ['QI_CURRENT','QI_MAX'])stats[k]={value:null,source:'ARC1_MONSTER_RESOURCE_MODEL_NONE',source_git_blob:data.source.monsters,authority:'AUTHORITATIVE_NOT_APPLICABLE',version:'V284',scope:{actorId,generation,lifeId,id,field:k},modifiers:[]};
  for(const k of ['PERCENT_PENETRATION','FLAT_PENETRATION','LIFESTEAL_PERCENT'])stats[k]={value:0,source:'NO_ACTIVE_T0_GRANT_IN_SCOPED_PROFILE',...provenance,authority:'NO_ACTIVE_EFFECT_SOURCE',version:'V284',scope:{actorId,generation,lifeId,id,field:k},modifiers:[]};
  const frame=freeze({actorId,generation,lifeId,id,encounterId,stage:p.native_stage,stats,complete:true});issued.add(frame);return frame;}
 return Object.freeze({player,monster,assertFrame(frame,scope){if(!issued.has(frame)||Object.keys(scope).some(k=>frame[k]!==scope[k]))fail('A08_FORGED_OR_OUT_OF_SCOPE_STAT_FRAME');return frame;},FIELDS:freeze(copy(FIELDS))});
}
return Object.freeze({createProvider,FIELDS:freeze(FIELDS)});
});
