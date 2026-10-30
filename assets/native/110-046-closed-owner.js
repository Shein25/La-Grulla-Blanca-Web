(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.LGB_MUTANT_TIER_V14=factory();
})(globalThis,function(){'use strict';
const FIELDS=Object.freeze(['defense','evasion','precision','tenacity']);
const EXPECTED_TIERS=Object.freeze([0,1,2,3,4]);
function fail(msg){throw Error('LGB_MUTANT_TIER_V14:'+msg);}
function clone(v){return JSON.parse(JSON.stringify(v));}
function hpFor(birthHp,tier){
  if(!Number.isSafeInteger(birthHp)||birthHp<=0)fail('INVALID_BIRTH_HP');
  if(!EXPECTED_TIERS.includes(tier))fail('INVALID_ECOLOGICAL_TIER');
  // Exactly integer half-up; avoids floating-point .5 edge cases.
  return Math.floor((birthHp*(100+5*tier)+50)/100);
}
function dicePlus(dice,delta){
  if(typeof dice!=='string'||!Number.isSafeInteger(delta)||delta<0||delta>4)fail('INVALID_DIRECT_DICE');
  const m=/^(\d+)d(\d+)([+-]\d+)?$/.exec(dice);
  if(!m)fail('INVALID_DIRECT_DICE:'+dice);
  const n=Number(m[1]),sides=Number(m[2]),flat=Number(m[3]||0);
  if(!Number.isSafeInteger(n)||n<1||n>100||!Number.isSafeInteger(sides)||sides<2||sides>100||!Number.isSafeInteger(flat))fail('INVALID_DICE_VALUES');
  const adjusted=flat+delta;
  return `${n}d${sides}${adjusted>=0?'+':''}${adjusted}`;
}
function create({eligibleSpecies}){
  if(!Array.isArray(eligibleSpecies)||eligibleSpecies.length!==29||new Set(eligibleSpecies).size!==29)fail('CENSUS_NOT_29');
  const eligible=new Set(eligibleSpecies);
  function isEligible(life,profile){
    return !!profile&&!!life&&eligible.has(profile.id)&&life.id===profile.id&&
      !profile.unique&&!profile.requiresSpecialStateMachine&&life.encounterId===null;
  }
  function apply(life,birthProfile,tier){
    if(!EXPECTED_TIERS.includes(tier))fail('INVALID_ECOLOGICAL_TIER');
    if(!birthProfile?.stats||!isEligible(life,birthProfile)||!life.r58Individual?.mutant){return birthProfile;}
    if(life.r58Individual.lifeId!==life.lifeId||life.r58Individual.speciesId!==life.id)fail('MUTANT_LIFE_SCOPE');
    // Input must be the ORIGINAL variance-derived birth profile on every call.
    const p=clone(birthProfile),birth=p.stats;
    p.stats.hp=hpFor(birth.hp,tier);
    for(const field of FIELDS){
      if(!Number.isSafeInteger(birth[field])||birth[field]<0)fail('INVALID_BIRTH_STAT_'+field);
      p.stats[field]=birth[field]+tier;
    }
    p.stats.basic_damage=dicePlus(birth.basic_damage,tier);
    if(p.technique?.params?.direct_damage!==undefined&&p.technique.params.direct_damage!==null){
      p.technique.params.direct_damage=dicePlus(birthProfile.technique.params.direct_damage,tier);
    }
    return Object.freeze(p);
  }
  function adjustCurrentHpAtEncounter({life,birthProfile,tier,combatId}){
    if(!isEligible(life,birthProfile)||!life.r58Individual?.mutant)return null;
    if(typeof combatId!=='string'||!combatId)fail('COMBAT_ID_REQUIRED');
    if(!Number.isSafeInteger(life.hp)||life.hp<0)fail('INVALID_CURRENT_HP');
    const birthMax=birthProfile.stats.hp;
    const target=hpFor(birthMax,tier);
    const before=life.mutantV14Encounter||null;
    if(before){
      if(before.lifeId!==life.lifeId||before.birthMax!==birthMax||!EXPECTED_TIERS.includes(before.tier)||before.max!==hpFor(birthMax,before.tier))fail('RESTORED_ENCOUNTER_SCOPE');
      if(before.combatId===combatId){if(before.tier!==tier)fail('MID_ENCOUNTER_TIER_CHANGE');return before;}
      // Preserve missing HP across separate encounters, do not heal wounds.
      life.hp=Math.max(0,Math.min(target,life.hp+target-before.max));
    }else{
      // New life: preserve pre-existing damage in absolute units.
      life.hp=Math.max(0,Math.min(target,life.hp+target-birthMax));
    }
    life.mutantV14Encounter={version:1,lifeId:life.lifeId,birthMax,tier,max:target,combatId};
    return life.mutantV14Encounter;
  }
  function tierFromLife(life,readTier){
    if(typeof readTier!=='function')fail('POPULATION_TIER_READER_REQUIRED');
    const t=readTier(life);
    if(!EXPECTED_TIERS.includes(t))fail('INVALID_POPULATION_TIER');
    return t;
  }
  return Object.freeze({eligibleSpecies:Object.freeze([...eligible]),isEligible,apply,adjustCurrentHpAtEncounter,tierFromLife,hpFor,dicePlus});
}
return Object.freeze({create,hpFor,dicePlus});
});
