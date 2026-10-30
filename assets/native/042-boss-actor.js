(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_BOSS_ACTOR=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail,number,integer}=S;
const FIELDS=['HP_MAX','PRECISION','EVASION','DEF','CONTROL','TENACITY','CRIT_CHANCE','CRIT_DAMAGE','PERCENT_PENETRATION','FLAT_PENETRATION','LIFESTEAL_PERCENT'];
// External, certified phase profiles never enter the 37-species shared catalog.
// There is deliberately no historical/P4 profile and no missing-stat default.
function createProvider({resolveAuthority}){const actors=new WeakMap();
 function issue(authorityCap,context){const p=resolveAuthority?.(authorityCap),c=copy(context);
  if(!p||p.engineContract!=='NEW_COMBAT_STATS_V0_1'||p.statsStatus!=='READY'||p.resourceModel!=='NONE'||!p.profileId||typeof p.profileId!=='string'||p.owner!=='A09'||p.phase!==c.phase||p.authority!=='HUMAN_RATIFIED')fail('A08_BOSS_APPROVED_PHASE_AUTHORITY_REQUIRED');
  for(const k of ['actorId','generation','battleId'])if(typeof c[k]!=='string'||!c[k])fail('A08_BOSS_ACTOR_CONTEXT');if(!Number.isInteger(c.phase)||c.phase<1||c.phase>3)fail('A08_BOSS_ACTOR_PHASE');integer(c.revision,'BOSS_ACTOR_REVISION');number(c.currentHP,'BOSS_CURRENT_HP');
  const stats={};for(const k of FIELDS){const s=p.stats?.[k];if(!s||s.authority!=='APPROVED_EXACT_SOURCE'||typeof s.source!=='string'||!s.source||!(/^[a-f0-9]{40}$/.test(s.sourceGitBlob||'')||/^[a-f0-9]{64}$/.test(s.sourceSHA256||'')))fail('A08_BOSS_UNSOURCED_FIELD:'+k);number(s.value,'BOSS_'+k);stats[k]=copy(s);}
  if(stats.HP_MAX.value<=0||c.currentHP>stats.HP_MAX.value||p.qiCurrent!==null||p.qiMax!==null)fail('A08_BOSS_RESOURCE_CONTRACT');
  const frame=freeze({id:c.actorId,actorId:c.actorId,generation:c.generation,battleId:c.battleId,phase:c.phase,profileId:p.profileId,engineContract:p.engineContract,kind:'MONSTER',resourceModel:'NONE',revision:c.revision,complete:true,resources:{HP_CURRENT:c.currentHP,QI_CURRENT:null,QI_MAX:null},stats,sourceOwner:'A09'}),cap=Object.freeze({});actors.set(cap,frame);return cap;
 }
 function resolve(cap){const f=actors.get(cap);if(!f)fail('A08_BOSS_FORGED_ACTOR');return f;}
 return Object.freeze({issue,resolve,inspect:cap=>freeze(copy(resolve(cap)))});
}
return Object.freeze({createProvider,FIELDS:Object.freeze(FIELDS)});
});
