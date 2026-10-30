(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ASTRA_R58_VARIANCE_ADAPTER=factory();})(globalThis,function(){
// Experimental runtime adapter for ratified intra-species variance.
//
// This module is intentionally data-driven: numeric envelopes live only in
// monster_individual_variance_v0.1.json. It never mutates canonical profiles,
// never grants adaptive tiers, and never applies reward multipliers itself.

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertFinite01(x, label) {
  if (!Number.isFinite(x) || x < 0 || x > 1) {
    throw new RangeError(`${label} must be in [0,1]`);
  }
}

function ladderPick(ladder, q) {
  if (!Array.isArray(ladder) || ladder.length < 1) {
    throw new TypeError("non-empty attack ladder required");
  }
  if (ladder.length === 1) return ladder[0];
  const idx = Math.min(ladder.length - 1, Math.floor(q * ladder.length));
  return ladder[idx];
}

function lerpInt(base, upper, q) {
  if (upper < base) throw new RangeError("upper envelope cannot be below T0 floor");
  return Math.round(base + q * (upper - base));
}

function variableAxes(spec, variableStats) {
  const axes = [];
  for (const key of variableStats) {
    if (spec.upper_envelope[key] < spec.base[key]) {
      throw new RangeError(`${key}: upper envelope below T0 floor`);
    }
    if (spec.upper_envelope[key] !== spec.base[key]) axes.push(key);
  }
  for (const [key, rule] of Object.entries(spec.attacks || {})) {
    if ((rule.ladder || []).length > 1) axes.push(key);
  }
  return axes;
}

function applyAttacksToProfile(profile, attacks) {
  if (Object.hasOwn(attacks, "basic_damage")) {
    profile.stats.basic_damage = attacks.basic_damage;
  }
  if (!profile.technique) return;

  const params = profile.technique.params;
  if (Object.hasOwn(attacks, "technique_direct_damage")) {
    params.direct_damage = attacks.technique_direct_damage;
  }
  if (Object.hasOwn(attacks, "poison_damage")) {
    if (!params.poison) throw new Error("poison attack axis without poison technique");
    params.poison.damage = attacks.poison_damage;
  }
  if (Object.hasOwn(attacks, "poison_ticks")) {
    if (!params.poison) throw new Error("poison tick axis without poison technique");
    params.poison.ticks = Number(attacks.poison_ticks);
  }
}

function instantiateMonsterVariance({
  speciesId,
  canonicalProfile,
  varianceConfig,
  random = Math.random,
  instanceId = null,
}) {
  if (!varianceConfig || varianceConfig.status !== "HUMAN_RATIFIED_FOR_EXPERIMENTAL_RUNTIME_INTEGRATION") {
    throw new Error("individual variance config is not human-ratified for integration");
  }
  if (varianceConfig.axis_distribution !== "UNIFORM_0_1") {
    throw new Error("runtime adapter only accepts ratified UNIFORM_0_1");
  }
  if (!canonicalProfile || canonicalProfile.id !== speciesId) {
    throw new Error("canonical profile/species mismatch");
  }
  if (canonicalProfile.stats_status !== "READY") {
    throw new Error(`${speciesId}: canonical T0 must be READY`);
  }

  const spec = varianceConfig.species?.[speciesId];
  if (!spec?.base || !spec?.upper_envelope || !spec?.attacks) {
    throw new Error(`${speciesId}: variance envelope missing`);
  }

  const axes = variableAxes(spec, varianceConfig.variable_stats);
  const qByAxis = {};
  const stats = {};
  const attacks = {};

  const nextQ = label => {
    const q = Number(random());
    assertFinite01(q, label);
    return q;
  };

  for (const key of varianceConfig.variable_stats) {
    const a = Number(spec.base[key]);
    const b = Number(spec.upper_envelope[key]);
    if (b === a) {
      stats[key] = a;
    } else {
      const q = nextQ(key);
      qByAxis[key] = q;
      stats[key] = lerpInt(a, b, q);
    }
  }

  for (const [key, rule] of Object.entries(spec.attacks)) {
    const ladder = rule.ladder;
    if (ladder.length === 1) {
      attacks[key] = ladder[0];
    } else {
      const q = nextQ(key);
      qByAxis[key] = q;
      attacks[key] = ladderPick(ladder, q);
    }
  }

  const powerScore = axes.length
    ? axes.reduce((sum, key) => sum + qByAxis[key], 0) / axes.length
    : 0;

  const threshold = axes.length
    ? Number(varianceConfig.mutant.threshold_by_variable_axis_count[String(axes.length)])
    : null;
  if (axes.length && !Number.isFinite(threshold)) {
    throw new Error(`missing Mutante threshold for ${axes.length} axes`);
  }

  const mutant = axes.length ? powerScore >= threshold : false;
  const profile = deepClone(canonicalProfile);

  for (const [key, value] of Object.entries(stats)) {
    profile.stats[key] = value;
  }
  applyAttacksToProfile(profile, attacks);

  // Identity-bearing technique parameters are asserted against the variance
  // contract, rather than rewritten by random rolls.
  if (spec.fixed_technique && profile.technique) {
    const fixed = spec.fixed_technique;
    if (profile.technique.name !== fixed.name) throw new Error("technique identity drift");
    if (profile.technique.params.cadence !== fixed.cadence) throw new Error("cadence drift");
    if (Object.hasOwn(fixed, "qi_drain") && profile.technique.params.qi_drain !== fixed.qi_drain) {
      throw new Error("QI_DRAIN identity drift");
    }
  }

  const baseName = canonicalProfile.name;
  const displayName = mutant ? `${baseName} Mutante` : baseName;

  return {
    instance_id: instanceId,
    species_id: speciesId,
    display_name: displayName,
    mutant,
    suffix: mutant ? varianceConfig.mutant.suffix : null,
    individual_power_score: powerScore,
    individual_axis_quality: qByAxis,
    stats,
    attacks,
    combat_profile: profile,
    rewards: {
      loot_multiplier: mutant ? varianceConfig.mutant.loot_multiplier : 1.0,
      combat_xp_multiplier: mutant ? varianceConfig.mutant.xp_multiplier : 1.0,
      unique_drop_probability_multiplier: 1.0,
      apply_to_profession_xp: false,
      scale_legacy_drop_probability: false,
    },
    adaptive: {
      tier_granted_by_variance: null,
      maxTierReached_modified: false,
    },
  };
}

return Object.freeze({instantiateMonsterVariance});
});
