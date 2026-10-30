(function () {
  'use strict';

  // Monster Combat AI v0.1 — Deterministic Decision Kernel
  // "La IA decide. El motor resuelve." — este archivo SOLO decide.
  //
  // No modifica HP, estados, cooldowns, memoria, snapshot, catálogos ni el monstruo.
  // No usa Math.random(). Toda aleatoriedad llega por `rng` inyectado.
  //
  // Ver README.md para el contrato completo (scoring, elegibilidad, tie-break,
  // memoria por profundidad, contexto social, hardening).

  const STATUS = Object.freeze({
    INTENT_SELECTED: 'INTENT_SELECTED',
    NO_ELIGIBLE_INTENT: 'NO_ELIGIBLE_INTENT'
  });

  const TIE_TOLERANCE = 1e-9;

  class ContractError extends Error {
    constructor(message, code) {
      super(message);
      this.name = 'ContractError';
      this.code = code || 'CONTRACT_ERROR';
    }
  }

  function fail(code, message) {
    throw new ContractError(message, code);
  }

  function isFiniteNumber(x) {
    return typeof x === 'number' && Number.isFinite(x);
  }

  function isPlainObject(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
  }

  function isNonEmptyString(x) {
    return typeof x === 'string' && x.length > 0;
  }

  function deepFreeze(value, seen = new WeakSet()) {
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return value;
    seen.add(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze(value[key], seen);
    }
    return Object.freeze(value);
  }

  // ---------------------------------------------------------------------------
  // Validación de fronteras (hardening). Errores contractuales para input
  // malformado; NO_ELIGIBLE_INTENT queda reservado para estado válido sin
  // acciones disponibles (ver sección 15 del prompt).
  // ---------------------------------------------------------------------------

  function validateProfiles(profiles) {
    if (!isPlainObject(profiles)) fail('INVALID_PROFILES', 'profiles debe ser un objeto');
    for (const [key, p] of Object.entries(profiles)) {
      if (!isPlainObject(p)) fail('INVALID_PROFILE', `perfil ${key} inválido`);
      const { memoryDepth, repetitionPenalty, jitter, usesMemory, usesSocial } = p;
      if (!Number.isInteger(memoryDepth) || memoryDepth < 0) {
        fail('INVALID_PROFILE', `memoryDepth inválido en perfil ${key}`);
      }
      if (!isFiniteNumber(repetitionPenalty) || repetitionPenalty < 0) {
        fail('INVALID_PROFILE', `repetitionPenalty inválido en perfil ${key}`);
      }
      if (!isFiniteNumber(jitter) || jitter < 0) {
        fail('INVALID_PROFILE', `jitter inválido en perfil ${key}`);
      }
      if (typeof usesMemory !== 'boolean' || typeof usesSocial !== 'boolean') {
        fail('INVALID_PROFILE', `usesMemory/usesSocial inválidos en perfil ${key}`);
      }
    }
  }

  function validateWeightMap(map, label) {
    if (map === undefined) return;
    if (!isPlainObject(map)) fail('INVALID_ABILITY', `${label} debe ser un objeto`);
    for (const [k, v] of Object.entries(map)) {
      if (!isFiniteNumber(v)) fail('INVALID_ABILITY', `${label}.${k} no es finito`);
    }
  }

  function validateAbilities(abilities) {
    if (!isPlainObject(abilities)) fail('INVALID_ABILITIES', 'abilities debe ser un objeto {id: def}');
    for (const [key, def] of Object.entries(abilities)) {
      if (!isPlainObject(def)) fail('INVALID_ABILITY', `habilidad ${key} inválida`);
      if (def.id !== key) fail('INVALID_ABILITY', `habilidad ${key}: id no coincide con la clave del catálogo`);
      if (!isNonEmptyString(def.id)) fail('INVALID_ABILITY', `habilidad ${key}: id inválido`);
      if (!isNonEmptyString(def.intentCategory)) {
        fail('INVALID_ABILITY', `habilidad ${key}: intentCategory inválido`);
      }
      if (def.tags !== undefined && !Array.isArray(def.tags)) {
        fail('INVALID_ABILITY', `habilidad ${key}: tags debe ser array`);
      }
      if (!isNonEmptyString(def.telegraph)) {
        fail('INVALID_ABILITY', `habilidad ${key}: telegraph inválido`);
      }
      if (def.requirements !== undefined) {
        if (!isPlainObject(def.requirements)) fail('INVALID_ABILITY', `habilidad ${key}: requirements inválido`);
        if (def.requirements.signalsAll !== undefined && !Array.isArray(def.requirements.signalsAll)) {
          fail('INVALID_ABILITY', `habilidad ${key}: requirements.signalsAll debe ser array`);
        }
      }
      if (!isPlainObject(def.utility)) fail('INVALID_ABILITY', `habilidad ${key}: utility requerido`);
      if (!isFiniteNumber(def.utility.base)) fail('INVALID_ABILITY', `habilidad ${key}: utility.base no es finito`);
      validateWeightMap(def.utility.signalWeights, `habilidad ${key}: utility.signalWeights`);
      validateWeightMap(def.utility.memoryWeights, `habilidad ${key}: utility.memoryWeights`);
      validateWeightMap(def.utility.socialWeights, `habilidad ${key}: utility.socialWeights`);
    }
  }

  function validateMonster(monster, profiles) {
    if (!isPlainObject(monster)) fail('INVALID_MONSTER', 'monster debe ser un objeto');
    if (!isNonEmptyString(monster.id)) fail('INVALID_MONSTER', 'monster.id inválido');
    if (!isNonEmptyString(monster.profileId) || !profiles[monster.profileId]) {
      fail('UNKNOWN_PROFILE', `profileId desconocido: ${monster.profileId}`);
    }
    if (!Array.isArray(monster.effectiveKit)) fail('INVALID_MONSTER', 'monster.effectiveKit debe ser array');
    const seen = new Set();
    for (const id of monster.effectiveKit) {
      if (!isNonEmptyString(id)) fail('INVALID_MONSTER', 'effectiveKit contiene un id inválido');
      if (seen.has(id)) fail('DUPLICATE_KIT_ID', `id duplicado en effectiveKit: ${id}`);
      seen.add(id);
    }
    if (monster.preferences !== undefined) {
      if (!isPlainObject(monster.preferences)) fail('INVALID_MONSTER', 'monster.preferences debe ser un objeto');
      for (const [k, v] of Object.entries(monster.preferences)) {
        if (!isFiniteNumber(v)) fail('INVALID_MONSTER', `monster.preferences.${k} no es finito`);
      }
    }
    if (monster.recentAbilityIds !== undefined) {
      if (!Array.isArray(monster.recentAbilityIds)) fail('INVALID_MONSTER', 'monster.recentAbilityIds debe ser array');
      for (const id of monster.recentAbilityIds) {
        if (typeof id !== 'string') fail('INVALID_MONSTER', 'recentAbilityIds contiene un elemento no-string');
      }
    }
    if (monster.cooldowns !== undefined) {
      if (!isPlainObject(monster.cooldowns)) {
        fail('INVALID_MONSTER', 'monster.cooldowns debe ser un objeto {cooldownKey: boolean}');
      }
      // Contrato estricto: sólo se aceptan los booleanos true/false. Ningún
      // valor "truthy" alternativo (1, "false", [], {}, NaN, -1, ...) es
      // válido: aceptarlos silenciosamente ocultaría bugs de integración
      // futuros (REV2, corrección #2).
      for (const [cdKey, cdValue] of Object.entries(monster.cooldowns)) {
        if (cdValue !== true && cdValue !== false) {
          fail(
            'INVALID_COOLDOWN',
            `monster.cooldowns.${cdKey} debe ser estrictamente true o false (recibido: ${JSON.stringify(cdValue)})`
          );
        }
      }
    }
  }

  function validateCombat(combat) {
    if (!isPlainObject(combat)) fail('INVALID_COMBAT', 'combat debe ser un objeto');
    if (!Number.isInteger(combat.round) || combat.round < 0) {
      fail('INVALID_COMBAT', 'combat.round debe ser un entero >= 0');
    }
    if (!isPlainObject(combat.self)) fail('INVALID_COMBAT', 'combat.self requerido');
    if (!isPlainObject(combat.player)) fail('INVALID_COMBAT', 'combat.player requerido');
    for (const side of ['self', 'player']) {
      const hp = combat[side].hpRatio;
      if (!isFiniteNumber(hp) || hp < 0 || hp > 1) {
        fail('INVALID_COMBAT', `combat.${side}.hpRatio fuera de rango [0,1]`);
      }
    }
    if (combat.signals !== undefined) {
      if (!isPlainObject(combat.signals)) fail('INVALID_COMBAT', 'combat.signals debe ser un objeto');
      for (const [k, v] of Object.entries(combat.signals)) {
        if (v !== 0 && v !== 1 && v !== true && v !== false) {
          fail('INVALID_COMBAT', `combat.signals.${k} debe ser booleano o 0/1`);
        }
      }
    }
  }

  function validateMemory$1(memory) {
    if (memory === undefined) return;
    if (!Array.isArray(memory)) fail('INVALID_MEMORY', 'memory debe ser un array');
    for (const ev of memory) {
      if (!isPlainObject(ev)) fail('INVALID_MEMORY', 'evento de memoria inválido');
      if (!isNonEmptyString(ev.category)) fail('INVALID_MEMORY', 'evento de memoria sin category válida');
      if (ev.result !== undefined && typeof ev.result !== 'string') {
        fail('INVALID_MEMORY', 'evento de memoria: result debe ser string');
      }
      if (ev.round !== undefined && (!Number.isInteger(ev.round) || ev.round < 0)) {
        fail('INVALID_MEMORY', 'evento de memoria: round inválido');
      }
    }
  }

  function validateSocial(social) {
    if (social === undefined) return;
    if (!isPlainObject(social)) fail('INVALID_SOCIAL', 'social debe ser un objeto');
    if (social.alliesAlive !== undefined && (!Number.isInteger(social.alliesAlive) || social.alliesAlive < 0)) {
      fail('INVALID_SOCIAL', 'social.alliesAlive inválido');
    }
    if (social.sameSpeciesAllies !== undefined && (!Number.isInteger(social.sameSpeciesAllies) || social.sameSpeciesAllies < 0)) {
      fail('INVALID_SOCIAL', 'social.sameSpeciesAllies inválido');
    }
    if (social.outnumbersPlayer !== undefined && typeof social.outnumbersPlayer !== 'boolean') {
      fail('INVALID_SOCIAL', 'social.outnumbersPlayer inválido');
    }
  }

  function makeRngGate(rng) {
    if (!isPlainObject(rng) || typeof rng.random !== 'function') {
      fail('INVALID_RNG', 'rng.random debe ser una función');
    }
    return function next() {
      const v = rng.random();
      if (!isFiniteNumber(v) || v < 0 || v >= 1) {
        fail('INVALID_RNG', `rng.random() devolvió un valor fuera de [0,1): ${v}`);
      }
      return v;
    };
  }

  // ---------------------------------------------------------------------------
  // Elegibilidad
  // ---------------------------------------------------------------------------

  function isOnCooldown(ability, monster) {
    if (!ability.cooldownKey) return false;
    const cooldowns = monster.cooldowns || {};
    // validateMonster ya garantizó que todo valor presente es estrictamente
    // true/false; una clave ausente equivale a "no está en cooldown".
    return cooldowns[ability.cooldownKey] === true;
  }

  function meetsRequirements(ability, signals) {
    const required = (ability.requirements && ability.requirements.signalsAll) || [];
    for (const signalName of required) {
      const v = signals[signalName];
      if (!(v === 1 || v === true)) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Contexto social: flags derivados y declarativos (ver README sección 10).
  // ---------------------------------------------------------------------------

  function computeSocialFlags(socialProfileId, social, signals) {
    const alliesAlive = social.alliesAlive || 0;
    const sameSpeciesAllies = social.sameSpeciesAllies || 0;
    const allyPresent = alliesAlive > 0 || signals.ALLY_PRESENT === 1 || signals.ALLY_PRESENT === true;
    const outnumber = social.outnumbersPlayer === true || signals.OUTNUMBER_PLAYER === 1 || signals.OUTNUMBER_PLAYER === true;
    const playerLowHp = signals.PLAYER_LOW_HP === 1 || signals.PLAYER_LOW_HP === true;
    const selfLowHp = signals.SELF_LOW_HP === 1 || signals.SELF_LOW_HP === true;

    return {
      MANADA_WITH_ALLY: socialProfileId === 'MANADA' && allyPresent,
      COLONIA_WITH_ALLY: socialProfileId === 'COLONIA' && (sameSpeciesAllies > 0 || allyPresent),
      OPORTUNISTA_LOW_HP: socialProfileId === 'OPORTUNISTA' && playerLowHp,
      REBAÑO_SELF_LOW_HP: socialProfileId === 'REBAÑO' && selfLowHp,
      TERRITORIAL_SOLO: socialProfileId === 'TERRITORIAL' && alliesAlive === 0,
      OUTNUMBER_PLAYER: outnumber
    };
  }

  // ---------------------------------------------------------------------------
  // Memoria: sólo eventos dentro de la ventana permitida por el perfil.
  // Se asume `memory` en orden cronológico ascendente (más reciente al final),
  // tal como lo entrega el snapshot ya resuelto (ver sección 4.2 del prompt).
  // ---------------------------------------------------------------------------

  function windowedMemory(memory, memoryDepth, usesMemory) {
    if (!usesMemory || memoryDepth <= 0) return [];
    if (!memory || memory.length === 0) return [];
    return memory.slice(Math.max(0, memory.length - memoryDepth));
  }

  function memoryResultSign(result) {
    if (result === 'EFECTIVA') return 1;
    if (result === 'FALLIDA') return -1;
    return 0;
  }

  // ---------------------------------------------------------------------------
  // Preferencias: modificador pequeño y acotado sobre intentCategory.
  // ---------------------------------------------------------------------------

  const PREFERENCE_SCALE = 20;
  const PREFERENCE_DEFAULT = 1;
  const PREFERENCE_MIN = 0;
  const PREFERENCE_MAX = 2;

  function preferenceModifier(preferences, ability) {
    const raw = preferences ? preferences[ability.intentCategory] : undefined;
    const clamped = isFiniteNumber(raw)
      ? Math.min(PREFERENCE_MAX, Math.max(PREFERENCE_MIN, raw))
      : PREFERENCE_DEFAULT;
    return (clamped - PREFERENCE_DEFAULT) * PREFERENCE_SCALE;
  }

  // ---------------------------------------------------------------------------
  // Scoring: base + preferencias + señales + memoria + social - repetición + jitter
  // ---------------------------------------------------------------------------

  function scoreAbility({ ability, monster, profile, combat, memoryWindow, socialFlags, nextRandom }) {
    let score = ability.utility.base;
    const breakdown = { base: ability.utility.base };

    breakdown.preference = preferenceModifier(monster.preferences, ability);
    score += breakdown.preference;

    let signalContribution = 0;
    const signalWeights = ability.utility.signalWeights || {};
    const signals = combat.signals || {};
    for (const [signalName, weight] of Object.entries(signalWeights)) {
      const active = signals[signalName] === 1 || signals[signalName] === true;
      if (active) signalContribution += weight;
    }
    breakdown.signals = signalContribution;
    score += signalContribution;

    let memoryContribution = 0;
    const memoryWeights = ability.utility.memoryWeights || {};
    for (const ev of memoryWindow) {
      const w = memoryWeights[ev.category];
      if (w === undefined) continue;
      memoryContribution += w * memoryResultSign(ev.result);
    }
    breakdown.memory = memoryContribution;
    score += memoryContribution;

    let socialContribution = 0;
    const socialWeights = ability.utility.socialWeights || {};
    for (const [flagName, active] of Object.entries(socialFlags)) {
      if (!active) continue;
      const w = socialWeights[flagName];
      if (w === undefined) continue;
      socialContribution += w;
    }
    breakdown.social = socialContribution;
    score += socialContribution;

    const occurrences = monster.recentAbilityIds
      ? monster.recentAbilityIds.filter((id) => id === ability.id).length
      : 0;
    const repetitionPenalty = occurrences * profile.repetitionPenalty;
    breakdown.repetitionPenalty = -repetitionPenalty;
    score -= repetitionPenalty;

    let jitter = 0;
    if (profile.jitter > 0) {
      jitter = (nextRandom() * 2 - 1) * profile.jitter;
    }
    breakdown.jitter = jitter;
    score += jitter;

    if (!isFiniteNumber(score)) {
      fail('NON_FINITE_SCORE', `score no finito para habilidad ${ability.id}`);
    }

    return { score, breakdown };
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------

  function chooseMonsterIntent(input) {
    if (!isPlainObject(input)) fail('INVALID_INPUT', 'input debe ser un objeto');
    const { monster, profiles, abilities, combat, memory, social, rng } = input;

    validateProfiles(profiles);
    validateAbilities(abilities);
    validateMonster(monster, profiles);
    validateCombat(combat);
    validateMemory$1(memory);
    validateSocial(social);
    const nextRandom = makeRngGate(rng);

    const profile = profiles[monster.profileId];
    const socialProfileId = monster.socialProfileId;
    const socialCtx = social || { alliesAlive: 0, sameSpeciesAllies: 0, outnumbersPlayer: false };
    const signals = combat.signals || {};

    const memoryWindow = windowedMemory(memory, profile.memoryDepth, profile.usesMemory);
    const socialFlags = profile.usesSocial
      ? computeSocialFlags(socialProfileId, socialCtx, signals)
      : {};

    // -------------------------------------------------------------------------
    // Fase 1 — Elegibilidad. Recorre effectiveKit en el orden que llegó (no
    // consume RNG: la elegibilidad es puramente determinista a partir de
    // catálogo/cooldowns/requirements, así que este orden es inofensivo).
    // -------------------------------------------------------------------------
    const entriesByAbilityId = new Map();
    const eligibleAbilities = [];

    for (const abilityId of monster.effectiveKit) {
      const ability = abilities[abilityId];
      const entry = { abilityId, eligible: false, reason: null, score: null };

      if (!ability) {
        entry.reason = 'UNKNOWN_ABILITY_IN_KIT';
      } else if (ability.disabled === true) {
        entry.reason = 'DISABLED';
      } else if (isOnCooldown(ability, monster)) {
        entry.reason = 'COOLDOWN';
      } else if (!meetsRequirements(ability, signals)) {
        entry.reason = 'REQUIREMENTS_NOT_MET';
      } else {
        entry.eligible = true;
        eligibleAbilities.push(ability);
      }

      entriesByAbilityId.set(abilityId, entry);
    }

    // -------------------------------------------------------------------------
    // Fase 2 — Scoring. REV2 (corrección #1): el consumo de RNG (jitter) debe
    // depender exclusivamente del CONJUNTO de habilidades elegibles, nunca del
    // orden en que effectiveKit o el catálogo `abilities` las enumeran. Por
    // eso se puntúa en un orden canónico (id ascendente) en vez del orden de
    // iteración de effectiveKit: así, reordenar effectiveKit o abilities no
    // cambia qué valor de rng.random() recibe cada habilidad.
    // -------------------------------------------------------------------------
    const canonicalOrder = [...eligibleAbilities].sort(
      (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    );

    const eligibleScored = [];
    for (const ability of canonicalOrder) {
      const { score, breakdown } = scoreAbility({
        ability, monster, profile, combat, memoryWindow, socialFlags, nextRandom
      });
      const entry = entriesByAbilityId.get(ability.id);
      entry.score = score;
      entry.breakdown = breakdown;
      eligibleScored.push({ ability, score });
    }

    // `considered` se expone en el orden original de effectiveKit (es
    // información de diagnóstico; no participa del cálculo).
    const considered = monster.effectiveKit.map((id) => entriesByAbilityId.get(id));

    const scoreByAbility = {};
    for (const c of considered) scoreByAbility[c.abilityId] = c.score;

    const debugBase = {
      considered,
      scoreByAbility,
      activeMemory: memoryWindow.map((ev) => ({ category: ev.category, result: ev.result, round: ev.round })),
      tieBrokenByRng: false
    };

    if (eligibleScored.length === 0) {
      return deepFreeze({
        status: STATUS.NO_ELIGIBLE_INTENT,
        monsterId: monster.id,
        reason: 'NO_ELIGIBLE_ABILITY',
        debug: debugBase
      });
    }

    const maxScore = Math.max(...eligibleScored.map((e) => e.score));
    const candidates = eligibleScored
      .filter((e) => Math.abs(e.score - maxScore) <= TIE_TOLERANCE)
      .sort((a, b) => (a.ability.id < b.ability.id ? -1 : a.ability.id > b.ability.id ? 1 : 0));

    let chosen;
    let tieBrokenByRng = false;
    if (candidates.length === 1) {
      chosen = candidates[0];
    } else {
      tieBrokenByRng = true;
      const idx = Math.floor(nextRandom() * candidates.length);
      chosen = candidates[Math.min(idx, candidates.length - 1)];
    }

    debugBase.tieBrokenByRng = tieBrokenByRng;

    return deepFreeze({
      status: STATUS.INTENT_SELECTED,
      monsterId: monster.id,
      abilityId: chosen.ability.id,
      intent: {
        id: chosen.ability.id,
        telegraph: chosen.ability.telegraph
      },
      debug: debugBase
    });
  }

  // Perfiles cognitivos y sociales sintéticos — Monster Combat AI v0.1
  //
  // Los perfiles cognitivos NO conocen nada del motor de combate real.
  // Son puramente parámetros de decisión: memoria, anti-repetición, jitter.

  const PROFILES = Object.freeze({
    INSTINTIVO: Object.freeze({
      id: 'INSTINTIVO',
      memoryDepth: 0,
      repetitionPenalty: 3,
      jitter: 4,
      usesMemory: false,
      usesSocial: false
    }),
    REACTIVO_1: Object.freeze({
      id: 'REACTIVO_1',
      memoryDepth: 1,
      repetitionPenalty: 5,
      jitter: 3,
      usesMemory: true,
      usesSocial: false
    }),
    CAZADOR_2: Object.freeze({
      id: 'CAZADOR_2',
      memoryDepth: 2,
      repetitionPenalty: 8,
      jitter: 2,
      usesMemory: true,
      usesSocial: true
    }),
    TACTICO_3: Object.freeze({
      id: 'TACTICO_3',
      memoryDepth: 3,
      repetitionPenalty: 12,
      jitter: 1.5,
      usesMemory: true,
      usesSocial: true
    }),
    MASTER_4: Object.freeze({
      id: 'MASTER_4',
      memoryDepth: 4,
      repetitionPenalty: 16,
      jitter: 1,
      usesMemory: true,
      usesSocial: true
    })
  });

  // Los perfiles sociales v0.1 son sólo identificadores declarativos: el
  // engine deriva flags booleanos (ver computeSocialFlags en engine.mjs) a
  // partir de socialProfileId + contexto social + señales. No hay
  // coordinación real, refuerzos, ni formación espacial (ver sección 10 del
  // prompt maestro).
  const SOCIAL_PROFILES = Object.freeze({
    SOLITARIO: Object.freeze({ id: 'SOLITARIO' }),
    TERRITORIAL: Object.freeze({ id: 'TERRITORIAL' }),
    MANADA: Object.freeze({ id: 'MANADA' }),
    COLONIA: Object.freeze({ id: 'COLONIA' }),
    OPORTUNISTA: Object.freeze({ id: 'OPORTUNISTA' }),
    RED: Object.freeze({ id: 'RED' }),
    'REBAÑO': Object.freeze({ id: 'REBAÑO' })
  });

  const ASSIGNMENT_STATUS='EXPERIMENTAL_NON_CANONICAL';

  const pref=(ofensiva=1,control=1)=>Object.freeze({OFENSIVA:ofensiva,CONTROL:control});

  const CANDIDATE_ASSIGNMENTS=Object.freeze({
    rata_qi:Object.freeze({profileId:'INSTINTIVO',socialProfileId:'COLONIA',preferences:pref(1,1),rationale:'fauna menor sin técnica; perfil mínimo de laboratorio'}),
    serpiente_qi:Object.freeze({profileId:'REACTIVO_1',socialProfileId:'SOLITARIO',preferences:pref(0.9,1.1),rationale:'técnica de veneno; reacción simple'}),
    lobo_espiritual:Object.freeze({profileId:'CAZADOR_2',socialProfileId:'MANADA',preferences:pref(1.05,1),rationale:'depredador descrito como cazador multidireccional'}),
    eco_caido:Object.freeze({profileId:'REACTIVO_1',socialProfileId:'SOLITARIO',preferences:pref(1,1),rationale:'conducta descrita como hábito persistente; sin técnica canónica'}),
    pez_lunar:Object.freeze({profileId:'CAZADOR_2',socialProfileId:'SOLITARIO',preferences:pref(1.05,1),rationale:'caza siguiendo el pulso del qi'}),
    sombra_ahogada:Object.freeze({profileId:'TACTICO_3',socialProfileId:'SOLITARIO',preferences:pref(0.9,1.1),rationale:'única, control por Ahogo y descripción asociada a memoria'}),
    centinela_pluma:Object.freeze({profileId:'REACTIVO_1',socialProfileId:'TERRITORIAL',preferences:pref(1.05,1),rationale:'guardián construido para custodiar'}),
    devorador_niebla:Object.freeze({profileId:'TACTICO_3',socialProfileId:'SOLITARIO',preferences:pref(1.05,1),rationale:'depredador de qi; representante táctico de alta cognición'}),
    avispa_jade:Object.freeze({profileId:'INSTINTIVO',socialProfileId:'COLONIA',preferences:pref(0.9,1.1),rationale:'insecto menor con picadura de control'}),
    mono_pildoras:Object.freeze({profileId:'CAZADOR_2',socialProfileId:'OPORTUNISTA',preferences:pref(0.9,1.15),rationale:'robo selectivo de píldoras y drenaje de qi'}),
    sapo_ceniza:Object.freeze({profileId:'INSTINTIVO',socialProfileId:'TERRITORIAL',preferences:pref(0.9,1.1),rationale:'fauna elemental de hábitat localizado'}),
    sapo_caldera:Object.freeze({profileId:'REACTIVO_1',socialProfileId:'TERRITORIAL',preferences:pref(0.9,1.1),rationale:'criatura única con patrón de fuego periódico'}),
    escarabajo_hierro:Object.freeze({profileId:'INSTINTIVO',socialProfileId:'COLONIA',preferences:pref(1.1,1),rationale:'canon: embiste antes de pensarlo dos veces'}),
    rey_escarabajo:Object.freeze({profileId:'CAZADOR_2',socialProfileId:'COLONIA',preferences:pref(1.05,1),rationale:'único, mayor de su especie y asociado a diagrama defensivo'}),
    anguila_estelar:Object.freeze({profileId:'REACTIVO_1',socialProfileId:'SOLITARIO',preferences:pref(0.9,1.1),rationale:'técnica de drenaje de qi con patrón simple'}),
    guardian_coral:Object.freeze({profileId:'TACTICO_3',socialProfileId:'TERRITORIAL',preferences:pref(0.9,1.1),rationale:'guardián memorioso con técnica de drenaje'}),
    halcon_tormenta:Object.freeze({profileId:'CAZADOR_2',socialProfileId:'SOLITARIO',preferences:pref(1.1,1),rationale:'depredador aéreo descrito como cazador'}),
    mantis_nube:Object.freeze({profileId:'MASTER_4',socialProfileId:'SOLITARIO',preferences:pref(1.1,1),rationale:'única; precisión extrema y representante MASTER de máxima cognición'})
  });

  function candidateAssignment(mobId){
    return CANDIDATE_ASSIGNMENTS[mobId]||null;
  }

  const TACTICAL_OVERLAY_STATUS='EXPERIMENTAL_NON_CANONICAL_REUSE_AUDITED_WEIGHTS';

  function cloneAbility(a){
    return {
      ...a,
      tags:[...(a.tags||[])],
      requirements:{...(a.requirements||{}),signalsAll:[...((a.requirements||{}).signalsAll||[])]},
      utility:{
        ...a.utility,
        signalWeights:{...(a.utility?.signalWeights||{})},
        memoryWeights:{...(a.utility?.memoryWeights||{})},
        socialWeights:{...(a.utility?.socialWeights||{})}
      }
    };
  }

  function applyTacticalOverlay(mobId,catalog){
    const assignment=candidateAssignment(mobId);
    if(!assignment)throw new RangeError(`sin asignación candidata para ${mobId}`);
    const out={};

    for(const [id,raw] of Object.entries(catalog)){
      const a=cloneAbility(raw);
      const isBasic=a.tags.includes('CANON_BASE_ATTACK');
      const isTechnique=a.tags.includes('CANON_TECHNIQUE');

      if(isBasic && a.intentCategory==='OFENSIVA'){
        a.utility.signalWeights.PLAYER_LOW_HP=5;
      }

      if(isTechnique && a.intentCategory==='OFENSIVA'){
        a.utility.signalWeights.PLAYER_LOW_HP=6;
      }

      if(isTechnique && a.intentCategory==='CONTROL'){
        a.utility.memoryWeights.DEFENSA_ABSORCION=-8;
      }

      if(isTechnique && assignment.socialProfileId==='MANADA'){
        a.utility.socialWeights.MANADA_WITH_ALLY=5;
      }

      if(isTechnique && assignment.socialProfileId==='OPORTUNISTA'){
        a.utility.socialWeights.OPORTUNISTA_LOW_HP=15;
      }

      out[id]=a;
    }

    return out;
  }

  const requireOk=(b,code)=>{if(!b)throw Error('A08_T0_INTENT_'+code);};
  function catalogForT0(p){
   requireOk(p?.engine_contract==='NEW_COMBAT_STATS_V0_1'&&p.stats_status==='READY','SOURCE_READY');
   requireOk(typeof p.id==='string'&&typeof p.name==='string'&&p.ai&&PROFILES[p.ai.cognition]&&SOCIAL_PROFILES[p.ai.social],'IDENTITY');
   requireOk(!p.id.startsWith('grulla')&&p.id!=='custodio_eco_petreo','SPECIAL_BRAIN_SEPARATE');
   requireOk(!p.technique||p.technique.params_status==='READY'&&Number.isSafeInteger(p.technique.params.cadence)&&p.technique.params.cadence>=1,'PARAMS');
   // Same 40/60, categories and effect tags as canonical-combat-adapter. The
   // extra CANON_* provenance tags bridge the overlay's mismatched tag spelling;
   // no old 18-only numeric schema, fallback profile or statistics is imported.
   const ids={basic:p.id+'__basic',technique:p.id+'__technique'},ability=(id,category,tags,telegraph,base)=>({id,intentCategory:category,tags,telegraph,requirements:{signalsAll:[]},utility:{base,signalWeights:{},memoryWeights:{},socialWeights:{}}});
   let catalog={[ids.basic]:ability(ids.basic,'OFENSIVA',['BASE_ATTACK','CANON_BASE_ATTACK'],'Ataque básico de '+p.name+'.',40)};
   if(p.technique){const m=p.technique.mechanics,effects=[];if(m.includes('POISON_DOT'))effects.push('VENENO');if(m.includes('BURN_DOT'))effects.push('QUEMADURA');if(m.includes('QI_DRAIN'))effects.push('DRENA_QI');catalog[ids.technique]=ability(ids.technique,effects.length?'CONTROL':'OFENSIVA',['MONSTER_TECHNIQUE','CANON_TECHNIQUE',...effects],p.technique.name+'.',60);}
   const assignment=candidateAssignment(p.id);
   if(assignment){requireOk(assignment.profileId===p.ai.cognition&&assignment.socialProfileId===p.ai.social,'ASSIGNMENT_CONFLICT');catalog=applyTacticalOverlay(p.id,catalog);}
   return {ids,catalog,preferences:assignment?{...assignment.preferences}:{OFENSIVA:1,CONTROL:1,DEFENSIVA:1},overlay:!!assignment};
  }
  function selectT0({profile,round,memory=[],recent=[],selfHP,playerHP,social,rng}){
   requireOk(Number.isSafeInteger(round)&&round>=1,'ROUND');requireOk(Array.isArray(recent)&&recent.length<=4&&recent.every(id=>[profile.id+'__basic',profile.id+'__technique'].includes(id)),'RECENT');
   const {ids,catalog,preferences,overlay}=catalogForT0(profile),due=!!profile.technique&&round%profile.technique.params.cadence===0,effectiveKit=[due?ids.technique:ids.basic];
   const selection=chooseMonsterIntent({monster:{id:profile.id,profileId:profile.ai.cognition,socialProfileId:profile.ai.social,effectiveKit,preferences,recentAbilityIds:recent,cooldowns:{}},abilities:catalog,profiles:PROFILES,memory,combat:{round,self:{hpRatio:selfHP,statuses:[]},player:{hpRatio:playerHP,visibleStates:[]},signals:{}},social,rng});
   requireOk(selection.status===STATUS.INTENT_SELECTED&&selection.abilityId===effectiveKit[0],'CADENCE_SELECTION');
   return Object.freeze({selection,canonicalTechniqueDue:due,ledgerAbilityId:due?'CANONICAL_TECHNIQUE':'BASIC',effectiveKit:Object.freeze(effectiveKit),tacticalOverlaySourceApplied:overlay,physicalDamageResolved:false});
  }

  var nativeIntent = /*#__PURE__*/Object.freeze({
    __proto__: null,
    catalogForT0: catalogForT0,
    selectT0: selectT0
  });

  /**
   * A08 role-bound monster cognition selector, LI–LIII, not production.
   * One declared binding per species; cognitive suffixes are NOT ecological tiers.
   * Never writes legacy sources or changes numeric status.
   */

  const data={"schema":"A08_LI_III_MONSTER_PROFILE_BINDINGS_V01","date":"2026-10-13","status":"EXPERIMENTAL_READY_GATE_PRESERVED","source_references":{"catalog":"experimentos/balance_nuevo/CATALOGO_CANONICO_MONSTRUOS_ARCO1_V3.json","historical_registry":"experimentos/balance_nuevo/monster_arc1_registry.json","legacy_ai":"experimentos/monstruos/monster-canonical-behavior-lab-v0.1/profiles/candidate-assignments.mjs","lii_numeric":"experimentos/balance_nuevo/pre_a08_cierre_normales_v35/FINAL_NUMERIC_TARGETS_SIX_NORMALS_V35.json","liii_selection":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/SELECCION_T0_SEIS_REPETIBLES_LIII_V67_2026-10-10.json"},"guarantees":{"noNewCognitiveIDs":true,"noAutomaticTierPromotion":true,"noNumericAutoready":true,"noStatEdits":true,"historicalAIExact":true,"notEnabledInHTML":true,"notRatifiedForNewSpecies":true},"species":[{"id":"rata_qi","stage":"LianQi_I","role":"NORMAL","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"INSTINTIVO","social":"COLONIA","preferences":{"OFENSIVA":1,"CONTROL":1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"READY_E1"},{"id":"serpiente_qi","stage":"LianQi_I","role":"NORMAL","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"REACTIVO_1","social":"SOLITARIO","preferences":{"OFENSIVA":0.9,"CONTROL":1.1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"READY_E1"},{"id":"lobo_espiritual","stage":"LianQi_I","role":"APEX_BRIDGE","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"CAZADOR_2","social":"MANADA","preferences":{"OFENSIVA":1.05,"CONTROL":1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"READY_E1"},{"id":"pez_lunar","stage":"LianQi_III","role":"NORMAL","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"CAZADOR_2","social":"SOLITARIO","preferences":{"OFENSIVA":1.05,"CONTROL":1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"HISTORICAL_SCHEMA_CONFLICT_NO_E1"},{"id":"avispa_jade","stage":"LianQi_I","role":"NORMAL","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"INSTINTIVO","social":"COLONIA","preferences":{"OFENSIVA":0.9,"CONTROL":1.1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"READY_E1"},{"id":"mono_pildoras","stage":"LianQi_I","role":"SKIRMISHER","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"CAZADOR_2","social":"OPORTUNISTA","preferences":{"OFENSIVA":0.9,"CONTROL":1.15},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"READY_E1"},{"id":"sapo_ceniza","stage":"LianQi_II","role":"NORMAL","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"INSTINTIVO","social":"TERRITORIAL","preferences":{"OFENSIVA":0.9,"CONTROL":1.1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"READY_E1"},{"id":"escarabajo_hierro","stage":"LianQi_II","role":"TANK","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"INSTINTIVO","social":"COLONIA","preferences":{"OFENSIVA":1.1,"CONTROL":1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"READY_E1"},{"id":"anguila_estelar","stage":"LianQi_III","role":"SKIRMISHER","original_class":"LEGACY_18_AUTHORIZED_PROFILE","cognitive":"REACTIVO_1","social":"SOLITARIO","preferences":{"OFENSIVA":0.9,"CONTROL":1.1},"origin":"HISTORICAL_REGISTRY_AUTHORITATIVE","rationale":"Identidad cognitiva y social exacta del registro histórico, preferencias del candidato experimental existente","numeric_gate":"HISTORICAL_SCHEMA_CONFLICT_NO_E1"},{"id":"jabali_pizarra","stage":"LianQi_II","role":"BRUISER","original_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","cognitive":"REACTIVO_1","social":"TERRITORIAL","preferences":{"OFENSIVA":1.15,"CONTROL":0.85},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"BRUISER: embiste y reacciona al contacto","numeric_gate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING"},{"id":"buho_niebla_gris","stage":"LianQi_II","role":"PRECISION","original_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","cognitive":"CAZADOR_2","social":"SOLITARIO","preferences":{"OFENSIVA":1.1,"CONTROL":0.9},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"PRECISION: observación y puntería de presa","numeric_gate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING"},{"id":"zorro_bancales","stage":"LianQi_II","role":"SKIRMISHER","original_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","cognitive":"CAZADOR_2","social":"SOLITARIO","preferences":{"OFENSIVA":1.08,"CONTROL":0.92},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"SKIRMISHER: busca aperturas y evita intercambios","numeric_gate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING"},{"id":"cangrejo_cauce","stage":"LianQi_II","role":"GUARDIAN","original_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","cognitive":"REACTIVO_1","social":"TERRITORIAL","preferences":{"OFENSIVA":0.9,"CONTROL":1.1},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"GUARDIAN: defensa del territorio y respuesta a amenaza","numeric_gate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING"},{"id":"murcielago_resonante","stage":"LianQi_II","role":"DISRUPTOR","original_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","cognitive":"TACTICO_3","social":"SOLITARIO","preferences":{"OFENSIVA":0.9,"CONTROL":1.1},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"DISRUPTOR: lectura de patrones y uso selectivo de drenaje Qi","numeric_gate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING"},{"id":"arana_veta_sombria","stage":"LianQi_II","role":"AFFLICTOR","original_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","cognitive":"REACTIVO_1","social":"TERRITORIAL","preferences":{"OFENSIVA":0.86,"CONTROL":1.14},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"AFFLICTOR: espera ventanas para veneno; no se presupone cognición avanzada","numeric_gate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING"},{"id":"garza_bruma_roca","stage":"LianQi_III","role":"NORMAL","original_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","cognitive":"CAZADOR_2","social":"SOLITARIO","preferences":{"OFENSIVA":1.08,"CONTROL":0.92},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"Ataque preciso de ave depredadora","numeric_gate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING"},{"id":"cangrejo_laja_humeda","stage":"LianQi_III","role":"NORMAL","original_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","cognitive":"REACTIVO_1","social":"TERRITORIAL","preferences":{"OFENSIVA":0.94,"CONTROL":1.06},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"Defensa de caparazón territorial","numeric_gate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING"},{"id":"sanguijuela_remanso_turbio","stage":"LianQi_III","role":"NORMAL","original_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","cognitive":"REACTIVO_1","social":"SOLITARIO","preferences":{"OFENSIVA":0.85,"CONTROL":1.15},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"Acecho y aplicación de veneno oportunista","numeric_gate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING"},{"id":"salamandra_filtracion_tibia","stage":"LianQi_III","role":"NORMAL","original_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","cognitive":"INSTINTIVO","social":"TERRITORIAL","preferences":{"OFENSIVA":0.92,"CONTROL":1.08},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"Exudado quemante instintivo, sin memoria cognitiva supuesta","numeric_gate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING"},{"id":"rana_cascajo_barranco","stage":"LianQi_III","role":"NORMAL","original_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","cognitive":"CAZADOR_2","social":"SOLITARIO","preferences":{"OFENSIVA":1.08,"CONTROL":0.92},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"Salto ofensivo en aperturas del terreno","numeric_gate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING"},{"id":"carpa_lamina_reflejo","stage":"LianQi_III","role":"NORMAL","original_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","cognitive":"REACTIVO_1","social":"SOLITARIO","preferences":{"OFENSIVA":0.9,"CONTROL":1.1},"origin":"A08_ROLE_BASED_EXPERIMENTAL_PROPOSAL","rationale":"Drenaje de Qi reactivo al contacto","numeric_gate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING"}]};
  const map=new Map(data.species.map(s=>[s.id,Object.freeze({...s,preferences:Object.freeze({...s.preferences})})]));
  if(map.size!==21||data.species.length!==21)throw new Error('A08_PROFILE_ROSTER_DRIFT');
  for(const item of data.species){
    if(!PROFILES[item.cognitive])throw new Error('A08_UNKNOWN_COGNITIVE: '+item.id);
    if(!SOCIAL_PROFILES[item.social])throw new Error('A08_UNKNOWN_SOCIAL: '+item.id);
    if(!['READY_E1','HISTORICAL_SCHEMA_CONFLICT_NO_E1','RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING','DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING'].includes(item.numeric_gate))
      throw new Error('A08_INVALID_GATE');
  }
  const PROFILE_BINDING_STATUS='EXPERIMENTAL_A08_ROLE_BINDING_NO_AUTO_READY';
  const ROSTER=Object.freeze([...map.values()]);
  function a08Assignment(id){
    const a=map.get(id);
    if(!a)throw new RangeError('A08_UNMAPPED_SPECIES: '+id);
    return a;
  }
  function assertReadyA08Monster(def){
    if(!def || typeof def!=='object')throw new TypeError('missing monster profile');
    const a=a08Assignment(def.id);
    if(a.numeric_gate!=='READY_E1')throw new Error('A08_NUMERIC_GATE_NOT_READY: '+a.id);
    if(def.engine_contract!=='NEW_COMBAT_STATS_V0_1'||def.stats_status!=='READY')
      throw new Error('A08_UNREADY_E1_SOURCE: '+a.id);
    if(def.technique && def.technique.params_status!=='READY')
      throw new Error('A08_UNREADY_TECHNIQUE: '+a.id);
    if(def.ai?.cognition!==a.cognitive || def.ai?.social!==a.social)
      throw new Error('A08_HISTORICAL_IDENTITY_MISMATCH: '+a.id);
    return a;
  }
  /** Single source of cognitive assignment, whether physical duel or cognition-only QA. */
  function a08MonsterIntentInput(id,effectiveKit,recentAbilityIds=[]){
    const a=a08Assignment(id);
    if(!Array.isArray(effectiveKit)||!Array.isArray(recentAbilityIds))throw new TypeError('invalid kit/memory');
    return {
      id,profileId:a.cognitive,socialProfileId:a.social,
      effectiveKit:[...effectiveKit],preferences:{...a.preferences},
      recentAbilityIds:[...recentAbilityIds],cooldowns:{}
    };
  }

  /**
   * A08: frozen adaptive arsenal → effective action decision, LI(T1–T4)/LII(T1–T2).
   * Contract-gated, no HTML, no numeric retune, no T5; input events only.
   * The resolver (E1) and NOT this module executes physical packets.
   */
  const c2={"schema_version":"li-t2-recognition-v1.0","status":"HUMAN_RATIFIED_FROZEN","frozen_on":"2026-10-06","authority":{"t0":"T0_LI_EXHAUSTIVE_PASS_2026-10-06","t1":"T1_LI_FINAL_FREEZE_2026-10-06","variance":"monster-individual-variance-v0.4","mutant_suffix":"MUTANT_SUFFIX_CONTRACT_V1","final_gate":"LI_MONSTER_T2_FINAL_ALL_FIVE_GATE_V03","review_sha256":"d140b9e3fafe744df2b512df3ba15bf80184deea1d97eb54fa92161ae2ab0e72","represented_combat_fights":147200},"identity":"RECOGNITION","recognition":{"memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"forbidden_inputs":["player.root","player.build_id","future RNG","hidden technique metadata"]},"anticipation":{"hp_ratio_lte":0.4,"received_hit_ratio_gte":0.15,"preserve_due_canonical_technique":true,"t1_natural_trigger_priority":true},"semantics":{"t2_adds_new_active_ability":false,"t2_reuses_frozen_t1_survival":true,"t1_magnitude_cooldown_charges_unchanged":true,"no_universal_stat_scaling":true,"adaptive_tier_applies_after_individual_variance_and_suffix":true},"t1_natural_trigger":{"hp_ratio_lte":0.3,"received_hit_ratio_gte":0.2},"species":["rata_qi","serpiente_qi","avispa_jade","mono_pildoras","lobo_espiritual"],"guards":{"no_root_build_inspection":true,"no_new_clock_timer":true,"no_t3_t4_execution":true,"no_player_winrate_target":true,"no_canonical_runtime_activation":true}};
  const c3={"schema_version":"li-t3-species-counter-v1.0","status":"HUMAN_RATIFIED_FROZEN","frozen_on":"2026-10-06","authority":{"t0":"T0_LI_EXHAUSTIVE_PASS_2026-10-06","t1":"T1_LI_FINAL_FREEZE_2026-10-06","t2":"T2_LI_FINAL_FREEZE_2026-10-06","mutant_suffix":"MUTANT_SUFFIX_CONTRACT_V1","final_gate":"LI_MONSTER_T3_FINAL_DUAL_STAGE_GATE_V03","review_sha256":"ba9c8ef20c5155af0064f337b7eda7ff6cafcc79da8900e303a432849a0461d2","represented_combat_fights":294400},"common_trigger":{"t2_prediction_must_be_confirmed":true,"t1_must_be_active":true,"t1_must_be_causally_responsible":true,"evasion_counter_rule":"same hit roll would connect against natural EVA and fail only after frozen T1 EVA bonus","defense_counter_rule":"same connected damage packet must have >0 damage prevented by frozen T1 DEF bonus","natural_miss_never_counts":true,"hidden_root_build_forbidden":true,"future_rng_forbidden":true},"species":{"rata_qi":{"counter":"R1_INSTANCE_BASIC","effect":"immediate normal direct-damage packet using current instance basic_damage","extra_limit":"NONE"},"serpiente_qi":{"counter":"S1_INSTANCE_POISON_TICK","effect":"one immediate poison-damage tick using current instance poison damage; no new duration"},"avispa_jade":{"counter":"A2_INSTANCE_POISON_TICK","effect":"one immediate poison-damage tick using current instance poison damage; no new duration"},"mono_pildoras":{"counter":"M2_INSTANCE_MANOTAZO_PACKET","effect":"immediate normal direct-damage packet using current instance technique direct damage plus existing Qi drain 6; does not consume normal technique cadence"},"lobo_espiritual":{"counter":"L2_INSTANCE_EMBOSCADA_DAMAGE","effect":"immediate normal direct-damage packet using current instance Emboscada direct damage; does not consume normal technique cadence"}},"semantics":{"no_universal_stat_scaling":true,"no_new_clock_timer":true,"no_t4_execution":true,"adaptive_tier_applies_after_individual_variance_and_suffix":true,"player_winrate_is_diagnostic_only":true},"guards":{"false_counter_rate_must_be_zero":true,"no_degenerate_loops":true,"no_canonical_runtime_activation":true,"no_t5":true}};
  const c4={"schema_version":"li-t4-mature-adaptation-v1.0","status":"HUMAN_RATIFIED_FROZEN","frozen_on":"2026-10-06","authority":{"t0":"T0_LI_EXHAUSTIVE_PASS_2026-10-06","t1":"T1_LI_FINAL_FREEZE_2026-10-06","t2":"T2_LI_FINAL_FREEZE_2026-10-06","t3":"T3_LI_FINAL_FREEZE_2026-10-06","mutant_suffix":"MUTANT_SUFFIX_CONTRACT_V1","final_gate":"LI_MONSTER_T4_FINAL_DUAL_STAGE_GATE_V03","review_sha256":"b5ca5163b3c099820c7d85b1ba039994956b4e30e5650aaf0d3e697a87b88eee","represented_combat_fights":294400},"tier":{"name":"T4","semantic":"ADAPTACION_MADURA","second_species_response":true,"highest_tier":true,"t5_exists":false},"common_activation":{"rule":"REPLACE_BASIC_WHEN_READY","cooldown_rounds":7,"priority":["T1_SURVIVAL","CANONICAL_TECHNIQUE_DUE","T4_IF_READY","BASIC"],"only_replaces_real_basic":true,"decay_below_t4_disables":true,"survival_displacement_forbidden":true,"due_technique_displacement_forbidden":true},"species":{"rata_qi":{"name":"Mordisco Frenetico","arm":"R4A_HISTORIC_CANONICAL_HALF_CD7","identity":"PHYSICAL_INSTINCTIVE_MULTI_HIT","opening":{"source":"INSTANCE_BASIC","scalar":1,"precision":"INDEPENDENT_ROLL","critical":"NORMAL_INDEPENDENT_CRIT"},"followup":{"source":"CANONICAL_T0_BASIC_2D4","scalar":0.5,"precision":"INDEPENDENT_ROLL","critical":"NORMAL_INDEPENDENT_CRIT"},"packet_pipeline":"NORMAL_DIRECT_DAMAGE_PER_PACKET"},"serpiente_qi":{"arm":"S4A_BASIC_POISON_ON_OPEN_HIT_CD7","identity":"SUSTAINED_POISON_PRESSURE","opening":"INSTANCE_BASIC","followup_on_opening_hit":"ONE_IMMEDIATE_INSTANCE_POISON_TICK","adds_poison_duration":false},"avispa_jade":{"arm":"A4A_BASIC_POISON_ON_OPEN_HIT_CD7","identity":"MOBILITY_STING_POISON","opening":"INSTANCE_BASIC","followup_on_opening_hit":"ONE_IMMEDIATE_INSTANCE_POISON_TICK","adds_poison_duration":false},"mono_pildoras":{"arm":"M4B_MANOTAZO_REPLACE_CD7","identity":"DANTIAN_QI_PRESSURE","packet":"INSTANCE_MANOTAZO_DIRECT_DAMAGE","qi_drain_on_hit":6,"consumes_canonical_technique_cadence":false},"lobo_espiritual":{"arm":"L4A_EMBOSCADA_REPLACE_CD7","identity":"APEX_EMBOSCADA_PRESSURE","packet":"INSTANCE_EMBOSCADA_DIRECT_DAMAGE","consumes_canonical_technique_cadence":false}},"frozen_interactions":{"t3_must_remain_causal":true,"acechante_precision_bonus":"+20 PREC to next monster attack only","individual_variance_before_adaptation":true,"mutant_does_not_grant_tier":true,"no_universal_stat_scaling":true},"forbidden":["Definitivas","root/build inspection","future RNG inspection","universal tier stat scaling","new persistent timers","T5"],"guards":{"no_runtime_canonical_activation":true,"no_t5":true,"no_win_rate_target":true,"t3_false_counter_rate_must_be_zero":true,"acechante_precision_drift_must_be_zero":true,"no_degenerate_loops":true}};
  const lii1={"schema_version":"lii-t1-reactive-freeze-v1.0","status":"T1_LII_REACTIVE_HUMAN_RATIFIED","frozen_on":"2026-10-07","evidence":{"review_sha256":"cbf0c0e4994ed9a6cbe7a58a84981e73ae4f578d0ff073e5afd998b6c45c4867","represented_combat_fights":186880,"result_document":"experimentos/balance_nuevo/adaptive_six_revalidation_v0.1/RESULT_LII_T1_REACTIVE_V03_FINAL_RECOMMENDATION_2026-10-07.md"},"t0_authority":"experimentos/balance_nuevo/t0_lii/T0_LII_FREEZE_MANIFEST_2026-10-07.json","semantics":{"activation":"REACTIVE","consumes_monster_turn":false,"natural_trigger":{"hp_ratio_lte":0.3,"received_hit_ratio_gte":0.2},"cooldown_lifecycle":"existing monster_survival_cd decremented by engine end_round(); no new timer"},"species":{"sapo_ceniza":{"candidate_id":"3f30ec963d6b5614","ability":{"kind":"MITIGATE_NEXT","damage_reduction_pct":60,"cooldown_rounds":3,"consumption":"NEXT_CONNECTED_DIRECT_PACKET","persists_through_miss":true,"affects_dot":false},"hrs":{"t0_player_win_rate":0.7328125,"t1_player_win_rate":0.630078125,"delta_pp":-10.2734375}},"escarabajo_hierro":{"candidate_id":"37ac83cfdd4c6973","ability":{"kind":"DEFENSE_UP","defense_bonus":4,"cooldown_rounds":3,"consumption":"NEXT_PLAYER_OFFENSIVE_ACTION","normal_penetration_defense_pipeline":true},"hrs":{"t0_player_win_rate":0.69140625,"t1_player_win_rate":0.59609375,"delta_pp":-9.53125}}},"next_state":"READY_FOR_T2_RECOGNITION_VALIDATION","guards":{"no_li_changes":true,"no_t0_changes":true,"no_t3_t4_until_t2_close":true,"no_t5":true,"no_main":true,"no_merge":true}};
  const lii2={"schema_version":"lii-t2-recognition-freeze-v1.0","status":"T2_LII_RECOGNITION_HUMAN_RATIFIED","frozen_on":"2026-10-07","human_decision":"Approve T2 as tested; preserve current recognition and anticipation semantics without retuning.","authority":{"t0":"experimentos/balance_nuevo/t0_lii/T0_LII_FREEZE_MANIFEST_2026-10-07.json","t1":"experimentos/balance_nuevo/t1_lii/T1_LII_REACTIVE_FREEZE_2026-10-07.json","plan":"experimentos/balance_nuevo/adaptive_six_revalidation_v0.1/LII_T2_RECOGNITION_GATE_V01_PLAN_2026-10-07.md"},"evidence":{"input_gate_sha256":"0a982fbf34a6235849729069e86a127aa27b6004a38f12c3a8574b7de2e3586d","notebook_sha256":"7237acb37be3a80be628c567311301d2bcbe62c54c3791f307877d784441dc02","runner_sha256":"6dc81b2a1c1ff4dfc0eba4029f8136e0999a96b9bb5e91d302fd0685c1949457","review_filename":"LII_T2_RECOGNITION_GATE_V01_REVIEW.zip","review_sha256":"aec7c2c40dd8c29b2d22d3ae70c62e2966ae067803bd673bcb841036b0227fd0","represented_combat_fights":61440,"contexts":240,"paired_base_contexts":120,"fights_per_context":256,"timeouts":0,"nan_inf":0,"issues":[],"diagnostics":[]},"candidate":{"canonical_id":"T2_R2_SHORT_THREAT_40_15_PRESERVE_DUE","evidence_alias":"T2_R2_SHORT_THREAT_40_15_PRESERVE_DUE_REACTIVE","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false,"anticipation":{"hp_ratio_lte":0.4,"received_hit_ratio_gte":0.15},"priority":["NATURAL_T1_HP_30_OR_HIT_20","T2_ANTICIPATION_HP_40_OR_HIT_15"],"consumes_monster_turn":false,"changes_t1_magnitude_or_cooldown":false,"preserve_due_canonical_technique":true},"frozen_t1":{"sapo_ceniza":{"kind":"MITIGATE_NEXT","magnitude_pct":60,"cooldown_rounds":3,"activation":"REACTIVE","consumes_monster_turn":false},"escarabajo_hierro":{"kind":"DEFENSE_UP","defense_bonus":4,"cooldown_rounds":3,"activation":"REACTIVE","consumes_monster_turn":false}},"audit_summary":{"overall_t1_player_win_rate":0.5359049479166667,"overall_t2_player_win_rate":0.51376953125,"overall_delta_player_win_rate_pp":-2.213541666666667,"sapo_delta_pp":-1.9140625,"escarabajo_delta_pp":-2.5130208333333335,"contexts_t2_more_than_2pp_easier":0,"max_t2_easier_delta_pp":0.390625,"hrs_drop_over_8pp_contexts":0,"worst_hrs_delta_pp":-7.421875,"t2_anticipatory_activations_total":18006,"due_with_t2_activation_total":5580,"canonical_due_missed_with_t2_activation":0,"recognition_nonzero_in_all_t2_contexts":true,"anticipation_nonzero_in_all_t2_contexts":true},"watchpoints":[{"monster":"sapo_ceniza","gear":"CARRY_OVER_FLOOR","root":"viento","policy":"DEFENSE_OPEN","delta_player_win_rate_pp":-10.15625},{"monster":"sapo_ceniza","gear":"CARRY_OVER_FLOOR","root":"agua","policy":"UNITARGET_FIRST","delta_player_win_rate_pp":-8.59375},{"monster":"sapo_ceniza","gear":"CARRY_OVER_FLOOR","root":"viento","policy":"UNITARGET_FIRST","delta_player_win_rate_pp":-8.59375}],"next_state":{"sapo_ceniza":"READY_FOR_T3_RECALIBRATION","escarabajo_hierro":"READY_FOR_T3_RECALIBRATION","t4":"BLOCKED_UNTIL_T3_CLOSE"},"guards":{"no_li_changes":true,"no_t0_changes":true,"no_t1_changes":true,"no_t4_before_t3_close":true,"no_t5":true,"no_main":true,"no_merge":true}};
  const registry={"schema_version":"arc1-monsters-v1","status":"NEW_ENGINE_ONLY","engine_contract":"NEW_COMBAT_STATS_V0_1","authority":{"numeric_contract":"docs/experimentos/CONTRATO_COMBATE_ESTADISTICAS_DOT_V0_1.md","universal_registry":"docs/experimentos/REGISTRO_UNIVERSAL_ESTADISTICAS_PROPIEDADES_COMBATE_V0_1.md","event_effect_contract":"docs/experimentos/CONTRATO_MOTOR_EVENTOS_EFECTOS_V0_1.md"},"rules":{"profile_count":18,"pending_profiles_must_not_run":true,"t0_required_before_adaptive_tiers":true,"definitives_in_monster_balance":false,"arc1_monster_resource_model":"NONE","arc1_monster_qi_semantics":"qi_max=null is authoritative N/A for Arc 1 monsters and does not block T0 READY","ready_profiles":["rata_qi","avispa_jade","serpiente_qi","mono_pildoras","lobo_espiritual","sapo_ceniza","escarabajo_hierro"],"li_t0_freeze":"T0_LI_EXHAUSTIVE_PASS_2026-10-06","adaptive_expected_bands":{"note":"Guidance only; not hard gates. Valid pressure may push a population beyond the expected band.","LianQi_I":"T0-T1 expected","LianQi_II":"T1-T2 expected","LianQi_III":"T2 expected/advanced overreach possible","LianQi_IV":"T3-T4 intended replayability/endgame"},"adaptive_overreach_policy":"ALLOWED_NATURAL_LIMIT_BY_COMBAT_AND_DECAY","lii_t0_freeze":"T0_LII_HUMAN_RATIFIED_2026-10-07","lii_t1_freeze":"T1_LII_REACTIVE_HUMAN_RATIFIED_2026-10-07","lii_t2_freeze":"T2_LII_RECOGNITION_HUMAN_RATIFIED_2026-10-07"},"profiles":{"rata_qi":{"id":"rata_qi","name":"rata de qi","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"secta_exterior","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":45,"qi_max":null,"precision":84,"evasion":0,"defense":2,"tenacity":0,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"2d4+3"},"technique":null,"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"serpiente_qi":{"id":"serpiente_qi","name":"serpiente de qi verdosa","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"bosques","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":57,"precision":94,"evasion":11,"defense":0,"tenacity":5,"basic_damage":"1d2+2","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Colmillos Venenosos","mechanics":["POISON_DOT"],"params_status":"READY","params":{"cadence":2,"poison":{"damage":"1d2+2","ticks":3}}},"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"lobo_espiritual":{"id":"lobo_espiritual","name":"lobo espiritual de tres colas","native_stage":"LianQi_I","native_stage_index":1,"role":"APEX_BRIDGE","region":"bosques","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":53,"precision":100,"evasion":12,"defense":1,"tenacity":20,"basic_damage":"2d4+2","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Emboscada de las Tres Colas","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":4,"direct_damage":"2d6+1"}},"ai":{"cognition":"CAZADOR_2","social":"MANADA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"eco_caido":{"id":"eco_caido","name":"Eco del Caído","native_stage":"LianQi_II","native_stage_index":2,"role":"ELITE","region":"cantera_vetas","element":null,"unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":null,"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"pez_lunar":{"id":"pez_lunar","name":"pez de luna sin ojos","native_stage":"LianQi_III","native_stage_index":3,"role":"NORMAL","region":"aguas_barrancos","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mordida de Corriente","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"sombra_ahogada":{"id":"sombra_ahogada","name":"sombra ahogada del estanque","native_stage":"LianQi_III","native_stage_index":3,"role":"ELITE","region":"aguas_barrancos","element":"agua","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Velo de Ahogo","mechanics":["POISON_DOT"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"centinela_pluma":{"id":"centinela_pluma","name":"centinela de plumas petrificadas","native_stage":"LianQi_IV","native_stage_index":4,"role":"BOSS","region":"alturas","element":"metal","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Aleteo de Cuchillas","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"devorador_niebla":{"id":"devorador_niebla","name":"devorador de niebla","native_stage":"LianQi_IV","native_stage_index":4,"role":"NORMAL","region":"alturas","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Exhalación Vacía","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"avispa_jade":{"id":"avispa_jade","name":"avispa de jade dentado","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"bosques","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":42,"precision":102,"evasion":22,"defense":2,"tenacity":7,"basic_damage":"1d2+1","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Picadura de Esmeralda","mechanics":["POISON_DOT"],"params_status":"READY","params":{"cadence":2,"poison":{"damage":"1d3+2","ticks":2}}},"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"mono_pildoras":{"id":"mono_pildoras","name":"macaco ladrón de píldoras","native_stage":"LianQi_I","native_stage_index":1,"role":"SKIRMISHER","region":"bosques","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":59,"qi_max":null,"precision":91,"evasion":28,"defense":2,"tenacity":12,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Manotazo al Dantian","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"READY","params":{"cadence":2,"direct_damage":"1d2+3","qi_drain":6}},"ai":{"cognition":"CAZADOR_2","social":"OPORTUNISTA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"sapo_ceniza":{"id":"sapo_ceniza","name":"sapo de ceniza caliente","native_stage":"LianQi_II","native_stage_index":2,"role":"NORMAL","region":"cantera_vetas","element":"fuego","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":55,"qi_max":null,"precision":98,"evasion":11,"defense":0,"tenacity":6,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+4","burn":{"damage":"1d2+2","ticks":3}}},"ai":{"cognition":"INSTINTIVO","social":"TERRITORIAL"},"adaptive":{"status":"READY_FOR_T3_RECALIBRATION","rule":"T0 LII frozen. T1 human-ratified as reactive MITIGATE_NEXT 60% / CD3 with natural trigger HP<=30% OR received hit>=20% maxHP. T2 human-ratified as recognition memory2/repeat2, EFECTIVA-only, anticipation HP<=40% OR received hit>=15% maxHP, natural T1 priority, no monster-turn cost, and canonical due preserved. T3 may now be recalibrated; T4 remains sequentially gated."},"resource_model":"NONE"},"sapo_caldera":{"id":"sapo_caldera","name":"Sapo Caldera de Tres Gargantas","native_stage":"LianQi_II","native_stage_index":2,"role":"BOSS","region":"cantera_vetas","element":"fuego","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Eructo del Horno Hundido","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"escarabajo_hierro":{"id":"escarabajo_hierro","name":"escarabajo de hierro espiritual","native_stage":"LianQi_II","native_stage_index":2,"role":"TANK","region":"cantera_vetas","element":"metal","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":75,"qi_max":null,"precision":90,"evasion":14,"defense":2,"tenacity":24,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+8"}},"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T3_RECALIBRATION","rule":"T0 LII frozen. T1 human-ratified as reactive DEFENSE_UP +4 / CD3 with natural trigger HP<=30% OR received hit>=20% maxHP. T2 human-ratified as recognition memory2/repeat2, EFECTIVA-only, anticipation HP<=40% OR received hit>=15% maxHP, natural T1 priority, no monster-turn cost, and canonical due preserved. T3 may now be recalibrated; T4 remains sequentially gated."},"resource_model":"NONE"},"rey_escarabajo":{"id":"rey_escarabajo","name":"Rey Escarabajo de la Veta Negra","native_stage":"LianQi_II","native_stage_index":2,"role":"BOSS","region":"cantera_vetas","element":"metal","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mandíbula de Yunque","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"COLONIA"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"anguila_estelar":{"id":"anguila_estelar","name":"anguila de constelación rota","native_stage":"LianQi_III","native_stage_index":3,"role":"SKIRMISHER","region":"aguas_barrancos","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mordida del Meridiano Azul","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"guardian_coral":{"id":"guardian_coral","name":"guardián de coral memorioso","native_stage":"LianQi_III","native_stage_index":3,"role":"BOSS","region":"aguas_barrancos","element":"agua","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Marea de los Nombres Hundidos","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"halcon_tormenta":{"id":"halcon_tormenta","name":"halcón de tormenta joven","native_stage":"LianQi_IV","native_stage_index":4,"role":"SKIRMISHER","region":"alturas","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Picado del Relámpago","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"mantis_nube":{"id":"mantis_nube","name":"mantis de nube cortante","native_stage":"LianQi_IV","native_stage_index":4,"role":"BOSS","region":"alturas","element":"viento","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Tijera del Horizonte","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"MASTER_4","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"}}}.profiles;
  const ARSENAL_STATUS='A08_EXPERIMENTAL_FROZEN_ARSENAL_DECISION_BRIDGE';
  const STAGES=Object.freeze({LianQi_I:4,LianQi_II:2});
  const LI_T1=Object.freeze({
    rata_qi:{kind:'EVADE_NEXT',evasion_bonus:70,charges:1,cooldown_rounds:6},
    serpiente_qi:{kind:'EVADE_NEXT',evasion_bonus:90,charges:1,cooldown_rounds:4},
    avispa_jade:{kind:'EVADE_NEXT',evasion_bonus:80,charges:1,cooldown_rounds:4},
    mono_pildoras:{kind:'EVADE_NEXT',evasion_bonus:75,charges:2,cooldown_rounds:6},
    lobo_espiritual:{kind:'DEFENSE_UP',defense_bonus:10,cooldown_rounds:3}
  });
  const names=new Set(['T0','T1','T2','T3','T4']);
  const validFloat=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1;
  function ensureFinite(n,msg){if(typeof n!=='number'||!Number.isFinite(n)||n<0)throw Error(msg);return n}
  function info(id,tier){
   const a=a08Assignment(id);
   if(!names.has(tier))throw Error('INVALID_ECOLOGICAL_TIER');
   const t=Number(tier.at(1));
   const max=STAGES[a.stage];
   if(max===undefined || a.numeric_gate!=='READY_E1')throw Error('ARSENAL_NUMERIC_NOT_READY');
   if(t>max)throw Error('ARSENAL_TIER_NOT_FROZEN_FOR_SPECIES');
   if(a.stage==='LianQi_I' && !LI_T1[id])throw Error('UNKNOWN_LI_SURVIVAL');
   if(a.stage==='LianQi_II' && !lii1.species[id])throw Error('UNKNOWN_LII_SURVIVAL');
   if(registry[id]?.stats_status!=='READY')throw Error('E1_REGISTRY_NOT_READY');
   return {a,t,def:registry[id]};
  }
  function events(hist,window=2){
   if(!Array.isArray(hist))throw Error('HISTORY_NOT_STRUCTURED');
   const allowed=new Set(c2.recognition.observable_categories);
   return hist.slice(-window).map(x=>{
    if(!x||!allowed.has(x.category)||!['EFECTIVA','FALLIDA'].includes(x.result))
     throw Error('INVALID_OBSERVED_PLAYER_EVENT');
    return x;
   });
  }
  function recognize(id,tier,hist){
   const {a,t}=info(id,tier);
   if(t<2)return null;
   const h=events(hist);
   if(h.length!==2||h[0].result!=='EFECTIVA'||h[1].result!=='EFECTIVA'||h[0].category!==h[1].category)return null;
   return h[0].category;
  }
  function signals$2(x){
   if(!validFloat(x.selfHpRatio)||!validFloat(x.playerHpRatio))throw Error('INVALID_OBSERVED_HP_RATIO');
   ensureFinite(x.lastReceivedHitRatio,'INVALID_OBSERVED_HIT_RATIO');
   return {natural:x.selfHpRatio<=.3||x.lastReceivedHitRatio>=.2,
           anticipatory:x.selfHpRatio<=.4||x.lastReceivedHitRatio>=.15};
  }
  function t1Spec(a){
   return a.stage==='LianQi_I'?LI_T1[a.id]:lii1.species[a.id].ability;
  }
  function adaptiveKit(x){
   const {a,t,def}=info(x.id,x.tier);
   if(!Number.isSafeInteger(x.round)||x.round<=0)throw Error('INVALID_ROUND');
   if(!Number.isSafeInteger(x.survivalCooldown)||x.survivalCooldown<0)throw Error('BAD_T1_COOLDOWN');
   if(!Number.isSafeInteger(x.nextT4Round)||x.nextT4Round<1)throw Error('BAD_T4_READY_ROUND');
   const sig=signals$2(x),prediction=recognize(x.id,x.tier,x.history||[]);
   const gate=x.survivalCooldown===0&&!x.survivalActive;
   const triggered=gate&&(sig.natural||(t>=2&&prediction!==null&&sig.anticipatory));
   const t1=t1Spec(a);
   // LII T1 is reactive and has no right to displace canonical cadence.
   const reactive=a.stage==='LianQi_II'&&t>=1&&triggered;
   const liSurvival=a.stage==='LianQi_I'&&t>=1&&triggered;
   const due=Boolean(def.technique&&x.round%def.technique.params.cadence===0);
   const t4Allowed=a.stage==='LianQi_I'&&t>=4&&!x.skipNextAction&&!liSurvival&&!due&&x.round>=x.nextT4Round;
   const regular=x.skipNextAction?'SKIPPED':liSurvival?'SURVIVAL_T1':due?'CANONICAL_TECHNIQUE':t4Allowed?'MATURE_T4':'BASIC';
   return Object.freeze({
    id:x.id,tier:x.tier,stage:a.stage,round:x.round,
    regular,reactiveT1:reactive,liSurvivalT1:liSurvival,
    survivalSpec:t>=1?t1:null,
    prediction,recognitionActive:t>=2&&prediction!==null,
    T3Available:t>=3&&a.stage==='LianQi_I',
    T4Available:t4Allowed,
    T3Packet:t>=3&&a.stage==='LianQi_I'?c3.species[x.id]:null,
    T4Packet:t>=4&&a.stage==='LianQi_I'?c4.species[x.id]:null,
    cooldownT4:t4Allowed?c4.common_activation.cooldown_rounds:null,
    canonicalTechniqueDue:due,
    sourceCognition:a.cognitive
   });
  }
  /** Causal outcome is from SAME already-resolved physical player hit RNG; no build/future access. */
  function t3AfterResolvedHit(x){
   const {a,t}=info(x.id,x.tier);
   if(t<3||a.stage!=='LianQi_I')return {counter:false,reason:'T3_NOT_ENABLED'};
   if(!x||typeof x!=='object'||!x.resolved||typeof x.resolved!=='object')throw Error('MISSING_RESOLVED_HIT');
   const r=x.resolved;
   for(const k of ['t1ActiveOnHit','predictionConfirmed','naturalWouldHit','boostedWouldHit','defensePreventedByT1'])
    if(typeof r[k]!=='boolean'&&k!=='defensePreventedByT1')throw Error('INVALID_CAUSAL_EVIDENCE');
   if(!Number.isFinite(r.defensePreventedByT1)||r.defensePreventedByT1<0)throw Error('INVALID_CAUSAL_DEFENSE_DELTA');
   const matched=Boolean(r.t1ActiveOnHit&&r.predictionConfirmed);
   const causal=(a.id==='lobo_espiritual') ? r.defensePreventedByT1>0 :
     (r.naturalWouldHit===true&&r.boostedWouldHit===false);
   return Object.freeze({counter:matched&&causal,reason:matched&&causal?'T1_CAUSAL_T2_CONFIRMED':'NO_CAUSAL_COUNTER',
    packet:c3.species[x.id]});
  }
  /** T0 routine actions still flow through original Monster Combat AI; single legal action under CADENCE_COMPAT. */
  function decideRoutineViaAI(id,regular,{rngFloat=.5,round=1,memory=[]}={}){
   const {a,def}=info(id,'T0');
   if(!['BASIC','CANONICAL_TECHNIQUE'].includes(regular))throw Error('NOT_ROUTINE_AI_WINDOW');
   const technique=regular==='CANONICAL_TECHNIQUE';
   if(technique&&!def.technique)throw Error('TECHNIQUE_NOT_DEFINED');
   const abilityId=id+'__'+(technique?'technique':'basic');
   const abilities={[abilityId]:{
    id:abilityId,intentCategory:'OFENSIVA',tags:['E1_CADENCE_COMPAT'],
    telegraph:technique?def.technique.name:'Ataque básico',
    requirements:{signalsAll:[]},
    utility:{base:40,signalWeights:{},memoryWeights:{},socialWeights:{}}
   }};
   if(!Number.isFinite(rngFloat)||rngFloat<0||rngFloat>=1)throw Error('INVALID_AI_RNG');
   const d=chooseMonsterIntent({
    monster:{id,profileId:a.cognitive,socialProfileId:a.social,
     effectiveKit:[abilityId],preferences:{...a.preferences},recentAbilityIds:[],cooldowns:{}},
    profiles:PROFILES,abilities,memory,combat:{round,self:{hpRatio:.5,statuses:[]},
     player:{hpRatio:.5,visibleStates:[]},signals:{}},
    social:{alliesAlive:0,sameSpeciesAllies:0,outnumbersPlayer:false},rng:{random:()=>rngFloat}
   });
   if(d.status!==STATUS.INTENT_SELECTED||d.abilityId!==abilityId)throw Error('MONSTER_AI_ROUTINE_PARITY_FAILED');
   return Object.freeze({regular,abilityId,decision:d.status,profile:a.cognitive});
  }

  /**
   * A08 12 new repeatables LIΙ/LIII — source-locked experimental connector.
   * Human-approved V35 LII: 6 numeric DELTAS, NO complete E1 profile, no combat.
   * V67 LIII: 6 selected T0 candidate profiles, Control=0 still unratified.
   * All 12 receive cognition-only bindings. Exactly 6 LIII may enter SHADOW T0
   * comparison with E1; no promotion of any authoritative stats_status to READY.
   */
  const v35={"schema":"GRULLA_PRE_A08_LII_SIX_NORMALS_V35_FINAL_NUMERIC_DESIGN","date":"2026-10-09","status":"NUMERIC_DESIGN_CLOSED_PER_USER__PENDING_INTEGRATION_RUNTIME_PARITY","authority":"User direction after Wind audit; V33 candidates supported by V34 + V35","changes":[{"monster":"jabali_pizarra","field":"technique.params.direct_damage","from":"1d3+6","to":"1d3+8"},{"monster":"buho_niebla_gris","field":"technique.params.direct_damage","from":"1d2+7","to":"1d2+8"},{"monster":"zorro_bancales","field":"stats.evasion","from":19,"to":21},{"monster":"cangrejo_cauce","field":"technique.params.direct_damage","from":"1d2+7","to":"1d2+8"},{"monster":"murcielago_resonante","field":"technique.params.direct_damage","from":"1d2+5","to":"1d2+6"},{"monster":"arana_veta_sombria","field":"stats.hp","from":71,"to":75}],"obsolete_excluded":["V19 cangrejo DEFENSE_UP +3 to +2","V19 jabali MITIGATE_NEXT 40 to 35","V34 ROLE_STRONG all monsters"],"armor_original":{"item_id":"sobretunica_patrulla","defense":2,"hp_max":2},"scope":"Only six LII normal monster numeric knobs, NOT elites/bosses/adaptation/runtime","no_runtime_write":true,"no_a07":true,"no_prices":true};
  const v07v35={"schema":"A08_LII_V07_BASE_V35_APPROVED_DELTAS_SHADOW_V01","status":"EXPERIMENTAL_E1_T0_SHADOW_ONLY_NOT_RUNTIME_READY","provenance":{"archive_name":"GRULLA_PRE_A08_V33_MONSTER_BALANCE_FINALISTS_2026-10-09.zip","archive_sha256":"97abd380cc48388431ed4887e1da63c3bd7027f349171f17d8c113109be23800","v07_source_relpath":"v32_equip_progression/grulla_v21_work/GRULLA_LII_TRAMO1_BALANCE_V07/source_lab/source/FAUNA_T0_FOCAL_PROFILES_V03.json","v07_source_sha256":"2bc18dc8ee871798f266f79ac8d9582636c31e0f2943670c3bafaaa137b61f8d","selection_file_sha256":"5be7859bc71545376aabfdcf5c63f72f3bd179e25e0c84653f633ee425d124ff","source_selection":"fauna_exhaustiva.py SELECTED","human_change_file":"experimentos/balance_nuevo/pre_a08_cierre_normales_v35/FINAL_NUMERIC_TARGETS_SIX_NORMALS_V35.json"},"species":{"jabali_pizarra":{"selected":"F1","stats":{"hp":67,"qi_max":null,"precision":93,"evasion":11,"defense":1,"tenacity":17,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Embestida de Pizarra","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":4,"direct_damage":"1d3+8"}},"delta":{"path":"technique.params.direct_damage","from":"1d3+6","to":"1d3+8"}},"buho_niebla_gris":{"selected":"F3","stats":{"hp":62,"qi_max":null,"precision":97,"evasion":23,"defense":0,"tenacity":8,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Picado del Velo Gris","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+8"}},"delta":{"path":"technique.params.direct_damage","from":"1d2+7","to":"1d2+8"}},"zorro_bancales":{"selected":"F1","stats":{"hp":66,"qi_max":null,"precision":95,"evasion":21,"defense":0,"tenacity":12,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Asalto de los Bancales","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+6"}},"delta":{"path":"stats.evasion","from":19,"to":21}},"cangrejo_cauce":{"selected":"F1","stats":{"hp":84,"qi_max":null,"precision":89,"evasion":8,"defense":2,"tenacity":25,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Pinza del Cauce","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":4,"direct_damage":"1d2+8"}},"delta":{"path":"technique.params.direct_damage","from":"1d2+7","to":"1d2+8"}},"murcielago_resonante":{"selected":"F1","stats":{"hp":68,"qi_max":null,"precision":91,"evasion":22,"defense":0,"tenacity":11,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Pulso Resonante","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+6","qi_drain":6}},"delta":{"path":"technique.params.direct_damage","from":"1d2+5","to":"1d2+6"}},"arana_veta_sombria":{"selected":"F3","stats":{"hp":75,"qi_max":null,"precision":95,"evasion":15,"defense":0,"tenacity":12,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+4"},"technique":{"name":"Veneno de la Veta Sombría","mechanics":["POISON_DOT"],"params_status":"READY","params":{"cadence":3,"poison":{"damage":"1d2+3","ticks":2}}},"delta":{"path":"stats.hp","from":71,"to":75}}}};
  const v67={"schema":"GRULLA_LIII_SIX_REPEATABLES_V67_SELECTED_NUMERIC_BASELINES","date":"2026-10-10","authority":"USER_REQUEST_TO_CLOSE_EXISTING_LIII_BALANCE_WITH_V45_V48_V63_EVIDENCE","selection_status":"T0_DESIGN_BASELINE_SELECTED_PENDING_EVENT_PARITY_AND_FORMAL_ADAPTIVE_RATIFICATION","is_prod_ready":false,"canonical_identity_v3":"experimentos/balance_nuevo/CATALOGO_CANONICO_MONSTRUOS_ARCO1_V3.json","source_primary":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","source_additional":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md","validation":["V45_T0_219240_PHYSICAL_1v1_QA_PASS","V47_48000_T0_TO_T4_EXPERIMENTAL","V48_R64_2054400_MIXED_LII_LIII_EXPERIMENTAL","V63_129024_EIGHT_LIII_MONSTER_CANDIDATE_PASS"],"limits":["NO_NEW_SIM_FOR_V45_SIX_REQUIRED_UNLESS_CAUSAL_BUG","DO_NOT_OVERRIDE_OLD_RATIFIED_PE Z_ANGUILA","T1_T4_NOT_READY","MUTANT_ENVELOPE_NOT_READY","AOE_2PLUS_NOT_TESTED","NO_RATIFIED_CONTROL_SOURCE_FOR_V45_BEYOND_ASSUMED_ZERO"],"profiles":[{"id":"garza_bruma_roca","name":"Garza de Bruma de Roca","stage":"LianQi_III","role":"NORMAL","unique":false,"resource_model":"NONE","stats":{"hp":75,"precision":109,"evasion":31,"defense":0,"tenacity":14,"basic_damage":"1d2+6","qi_max":null,"control":{"value":0,"previous_status":"V45_HYPOTHESIS","selection_status":"NUMERIC_DESIGN_ASSUMPTION_SELECTED_PENDING_GAME_SOURCE_PARITY"},"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Pico de Niebla Cortante","mechanics":["DIRECT_DAMAGE"],"direct_damage":"1d3+8","cadence":3},"approved_as_design_identity":true,"source_v45_t0_status":"CANDIDATE_TESTED_V45","selection":"CURRENT_DESIGN_BASELINE_SELECTED_2026_10_10","ready_in_production":false,"adaptive_t1_t4":"NOT_RATIFIED_BY_THIS_SELECTION","spawn_status":"PREVIEW_ONLY"},{"id":"cangrejo_laja_humeda","name":"Cangrejo de Laja Húmeda","stage":"LianQi_III","role":"NORMAL","unique":false,"resource_model":"NONE","stats":{"hp":90,"precision":98,"evasion":9,"defense":3,"tenacity":28,"basic_damage":"1d2+6","qi_max":null,"control":{"value":0,"previous_status":"V45_HYPOTHESIS","selection_status":"NUMERIC_DESIGN_ASSUMPTION_SELECTED_PENDING_GAME_SOURCE_PARITY"},"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Tenaza de Pizarra","mechanics":["DIRECT_DAMAGE"],"direct_damage":"1d3+8","cadence":4},"approved_as_design_identity":true,"source_v45_t0_status":"CANDIDATE_TESTED_V45","selection":"CURRENT_DESIGN_BASELINE_SELECTED_2026_10_10","ready_in_production":false,"adaptive_t1_t4":"NOT_RATIFIED_BY_THIS_SELECTION","spawn_status":"PREVIEW_ONLY"},{"id":"sanguijuela_remanso_turbio","name":"Sanguijuela de Remanso Turbio","stage":"LianQi_III","role":"NORMAL","unique":false,"resource_model":"NONE","stats":{"hp":78,"precision":103,"evasion":16,"defense":1,"tenacity":16,"basic_damage":"1d2+6","qi_max":null,"control":{"value":0,"previous_status":"V45_HYPOTHESIS","selection_status":"NUMERIC_DESIGN_ASSUMPTION_SELECTED_PENDING_GAME_SOURCE_PARITY"},"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Mordida de Limo Frío","mechanics":["DIRECT_DAMAGE","POISON_DOT"],"direct_damage":"1d2+7","cadence":3,"dot":{"family":"POISON_DOT","damage":"1d2+2","ticks":2}},"approved_as_design_identity":true,"source_v45_t0_status":"CANDIDATE_TESTED_V45","selection":"CURRENT_DESIGN_BASELINE_SELECTED_2026_10_10","ready_in_production":false,"adaptive_t1_t4":"NOT_RATIFIED_BY_THIS_SELECTION","spawn_status":"PREVIEW_ONLY"},{"id":"salamandra_filtracion_tibia","name":"Salamandra de Filtración Tibia","stage":"LianQi_III","role":"NORMAL","unique":false,"resource_model":"NONE","stats":{"hp":79,"precision":103,"evasion":16,"defense":2,"tenacity":22,"basic_damage":"1d2+6","qi_max":null,"control":{"value":0,"previous_status":"V45_HYPOTHESIS","selection_status":"NUMERIC_DESIGN_ASSUMPTION_SELECTED_PENDING_GAME_SOURCE_PARITY"},"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Salpicadura Irritante","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"direct_damage":"1d2+7","cadence":4,"dot":{"family":"BURN_DOT","damage":"1d2+1","ticks":2}},"approved_as_design_identity":true,"source_v45_t0_status":"CANDIDATE_TESTED_V45","selection":"CURRENT_DESIGN_BASELINE_SELECTED_2026_10_10","ready_in_production":false,"adaptive_t1_t4":"NOT_RATIFIED_BY_THIS_SELECTION","spawn_status":"PREVIEW_ONLY"},{"id":"rana_cascajo_barranco","name":"Rana de Cascajo del Barranco","stage":"LianQi_III","role":"NORMAL","unique":false,"resource_model":"NONE","stats":{"hp":84,"precision":100,"evasion":17,"defense":2,"tenacity":23,"basic_damage":"1d2+6","qi_max":null,"control":{"value":0,"previous_status":"V45_HYPOTHESIS","selection_status":"NUMERIC_DESIGN_ASSUMPTION_SELECTED_PENDING_GAME_SOURCE_PARITY"},"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Salto de Cascajo","mechanics":["DIRECT_DAMAGE"],"direct_damage":"1d3+8","cadence":3},"approved_as_design_identity":true,"source_v45_t0_status":"CANDIDATE_TESTED_V45","selection":"CURRENT_DESIGN_BASELINE_SELECTED_2026_10_10","ready_in_production":false,"adaptive_t1_t4":"NOT_RATIFIED_BY_THIS_SELECTION","spawn_status":"PREVIEW_ONLY"},{"id":"carpa_lamina_reflejo","name":"Carpa de Lámina Reflejada","stage":"LianQi_III","role":"NORMAL","unique":false,"resource_model":"NONE","stats":{"hp":78,"precision":104,"evasion":26,"defense":1,"tenacity":13,"basic_damage":"1d2+6","qi_max":null,"control":{"value":0,"previous_status":"V45_HYPOTHESIS","selection_status":"NUMERIC_DESIGN_ASSUMPTION_SELECTED_PENDING_GAME_SOURCE_PARITY"},"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Succión de Corriente","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"direct_damage":"1d3+7","cadence":3,"qi_drain_on_hit":3},"approved_as_design_identity":true,"source_v45_t0_status":"CANDIDATE_TESTED_V45","selection":"CURRENT_DESIGN_BASELINE_SELECTED_2026_10_10","ready_in_production":false,"adaptive_t1_t4":"NOT_RATIFIED_BY_THIS_SELECTION","spawn_status":"PREVIEW_ONLY"}]};
  const catalog={"schema":"la-grulla-blanca-monstruos-canon-arco1-v3","authority_date":"2026-10-10","authority":"HUMAN_RATIFIED_LII_AND_LIII_ADDITIONS_WITH_V45_V46_SOURCE_RECONCILIATION","status":"CANONICAL_DESIGN_MASTER_INDEX_VERIFIED_31_IDS__NUMERIC_GATES_INDIVIDUALLY_TRACKED","supersedes":"CATALOGO_CANONICO_MONSTRUOS_ARCO1_V2.json__PARTIAL_25; LEGACY_FIXED_COUNT_18","summary":{"total_canonical_identities":31,"legacy_historical_profiles":18,"added_new_repeatables_lianqi_ii":6,"added_new_repeatables_lianqi_iii":6,"added_new_guardian_lianqi_iii":1,"identities_by_native_or_design_stage":{"LianQi_I":5,"LianQi_II":11,"LianQi_III":11,"LianQi_IV":4},"repeated_species_native_liii":8,"notes":"Verified documented canon Arco 1 as of 2026-10-10. 31 is the count of currently reconciled identities, not a permanently fixed limit and not proof of HTML integration or all actual spawns."},"precedence_rules":{"canonical_inventory_source":"experimentos/balance_nuevo/CATALOGO_CANONICO_MONSTRUOS_ARCO1_V3.json","old_18_profile_count":"DEPRECATED_AS_GLOBAL_TOTAL","old_monster_arc1_registry":"HISTORICAL_NUMERIC_SOURCE_ONLY_NOT_FULL_ROSTER","new_lii_monsters":"CANONICAL_ENTITIES_AND_APPROVED_NUMERIC_DESIGN","new_liii_guardian":"CANONICAL_IDENTITY_ONLY_T0_AND_SPAWN_PENDING","unverified_additional_species":"NOT_AUTO_INVENTED","historic_encounter_stage_tags":"NATIVE_STAGE_NOT_LEGAL_ENCOUNTER_STAGE","new_liii_repeatables":"HUMAN_APPROVED_DESIGNS_V46; T0_V45_AND_T1_T4_V46_REMAIN_UNRATIFIED_NUMERICALLY","total_monsters":"31_VERIFIED_AS_OF_2026_10_10__CAN_GROW"},"sources":{"legacy_18":{"commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"six_new_lii":{"ref":"experiment/lii-tramo1-multirraiz-v08-2026-10-08","candidates_path":"experimentos/balance_nuevo/pre_a08_monstruos_v33/CANDIDATOS_BALANCE_MONSTRUOS_V33.json","candidates_blob_sha":"9e698d1ba2750ef087631fe8957a5f1444e66251","decision_path":"experimentos/balance_nuevo/handoffs/CIERRE_RATIFICADO_VIENTO_Y_NORMALES_2026-10-09/DECISION_HUMANA_CIERRE_LII_NORMAL_Y_VIENTO_2026-10-09.json","decision_blob_sha":"d4416b603b6f5086c5c816fe678407de768075ea"},"earth_guardian":{"path":"experimentos/balance_nuevo/adaptive_six_revalidation_v0.1/DECISION_HUMANA_GUARDIANES_AOE_IDENTIDADES_UBICACIONES_2026-10-07.md"},"six_new_liii":{"design_authority":"DICTAMEN_V46_CADENA_ADAPTATIVA_MUTANTES.md confirms user approved six V45 identities and designs","v45_archived":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","v46_archived":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md","original_v45_file_title":"DICTAMEN_V45_NUEVA_FAUNA_LIII_2026-10-09.md","original_v46_file_title":"DICTAMEN_V46_CADENA_ADAPTATIVA_MUTANTES.md"}},"constraints":["NO_MUTATION_OF_HISTORICAL_T0","NO_HTML_RUNTIME_INTEGRATION_BY_THIS_INDEX","NO_MAIN_OR_MERGE","NO_SPAWN_MANUAL_GATE_INFERENCE","NO_AUTO_ADAPTATION_FOR_UNIQUE_MONSTERS"],"entities":[{"id":"rata_qi","name":"rata de qi","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_I","role":"NORMAL","repeatable":true,"unique":false,"element":null,"region_historical":"secta_exterior","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"ADAPTIVE_CHAIN_T0_T4_CLOSED","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"serpiente_qi","name":"serpiente de qi verdosa","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_I","role":"NORMAL","repeatable":true,"unique":false,"element":"agua","region_historical":"bosques","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"READY_FOR_T1_RECALIBRATION","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"lobo_espiritual","name":"lobo espiritual de tres colas","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_I","role":"APEX_BRIDGE","repeatable":true,"unique":false,"element":null,"region_historical":"bosques","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"READY_FOR_T1_RECALIBRATION","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"eco_caido","name":"Eco del Caído","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_II","role":"ELITE","repeatable":false,"unique":true,"element":null,"region_historical":"cantera_vetas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"UNIQUE_T0_CLOSED_NO_T1_T4","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":"Superseding HUMAN design decision: Eco elite HP84 (old HP51 retained only as historical source); V69 elite abilities experimental and no HTML integration.","new_unique_encounter_ability_work":{"authority_date":"2026-10-10","human_authorized":"ADD_NEW_ELITE_ABILITIES_AND_TARGET_PLAYER_WR_NOT_ABOVE_70","design_candidate_ids":["ECO_VETA_RESENTIDA","ECO_LAMENTO_DEL_CAIDO","ECO_REVERBERACION_AGRAVIO"],"numeric_candidate_status":"V69_LAB_PASS_NOT_RUNTIME_READY","authoritative_candidate_path":"experimentos/balance_nuevo/handoffs/V69_ECO_ELITE_NUEVAS_HABILIDADES_2026-10-10/ECO_DEL_CAIDO_HABILIDADES_V69_CANDIDATO.json","lab_report":"experimentos/balance_nuevo/handoffs/V69_ECO_ELITE_NUEVAS_HABILIDADES_2026-10-10/DICTAMEN_BALANCE_ECO_V69_2026-10-10.md","t0_authority_conflict":"HISTORICAL_HP51_READY_VS_PRE_A08_E8_HP84_PENDING__NO_REPLACEMENT","unique_no_t1_t4_mutants":true,"html_integration":false,"current_version":"V70","status":"NUMERIC_LAB_CLOSED_NOT_RUNTIME_INTEGRATED","previous_V69_experiment":"SUPERSEDED_E8_HP84_FOR_NUMERIC_ECO_BALANCE","selected_t0":{"authority_commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","hp":51,"precision":102,"evasion":24,"defense":1,"tenacity":24,"basic_damage":"1d3+6","historical_closed_preserved":true},"selected_ability_design":["ECO_VETA_RESENTIDA","ECO_LAMENTO_DEL_CAIDO","ECO_REVERBERACION_AGRAVIO"],"numeric_closure":"experimentos/balance_nuevo/handoffs/V70_ECO_CIERRE_T0_51HP_LII_2026-10-10/V70_ECO_CIERRE_NUMERICO_CANDIDATO.json","technical_report":"experimentos/balance_nuevo/handoffs/V70_ECO_CIERRE_T0_51HP_LII_2026-10-10/DICTAMEN_CIERRE_ECO_V70_2026-10-10.md","verified_qa":"experimentos/balance_nuevo/handoffs/V70_ECO_CIERRE_T0_51HP_LII_2026-10-10/QA_V70_CIERRE_ECO_2026-10-10.json","tested_player_stage":"LianQi_II","no_liii_equipment":true,"selected_player_win_pct":49.3937,"capped_70_scope":"GLOBAL_AND_MARGINAL_ONLY","production_integration_status":"BLOCKED_REAL_TELEGRAPH_AND_LI_ACCESS_VER76"},"current_design_t0_override":{"approved_by":"HUMAN_2026_10_10","hp":84,"overrides_historical_hp":51,"old_source_still_immutable":true,"scope":"DESIGN_CANON__HTML_NOT_MODIFIED","base_reference":"V39_E8_CANDIDATE","abilities_lab_ref":"experimentos/balance_nuevo/handoffs/V69_ECO_ELITE_NUEVAS_HABILIDADES_2026-10-10/ECO_DEL_CAIDO_HABILIDADES_V69_CANDIDATO.json","approval_record":"experimentos/balance_nuevo/handoffs/V71_ECO84_SOMBRA_URGENTE_2026-10-10/DECISION_HUMANA_ECO_HP84_Y_REAPERTURA_SOMBRA.md","numeric_skill_params_status":"V69_EXPERIMENTAL_PENDING_RUNTIME_PARITY","no_t1_t4":true}},{"id":"pez_lunar","name":"pez de luna sin ojos","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_III","role":"NORMAL","repeatable":true,"unique":false,"element":"agua","region_historical":"aguas_barrancos","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"ADAPTIVE_CHAIN_T0_T4_CLOSED","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"sombra_ahogada","name":"sombra ahogada del estanque","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_III","role":"ELITE","repeatable":false,"unique":true,"element":"agua","region_historical":"aguas_barrancos","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"UNIQUE_T0_CLOSED_NO_T1_T4","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":" V72: Sombra rebalanced design HP110 (human request >100), Velo cadence4 ticks2, Espejo absorb8; V71 history retained; no runtime change.","t0_design_rebalance":{"human_directive":"2026-10-10: REBALANCE_SOMBRA_LIII_TO_HP_GREATER_THAN_100","priority":"V72_SUPERSEDES_V71_CANDIDATE_ONLY","hp":110,"defense":1,"precision":106,"evasion":20,"tenacity":19,"basic_damage":"1d2+7","velo_de_ahogo":{"cadence":4,"poison_damage":"1d2+2","poison_ticks":2,"reason":"Balance higher HP by weakening periodic venom, not an unchanged historical technique"},"unique_mechanic":{"id":"SOMBRA_ESPEJO_REMANSO","trigger":"After first actual >=16 HP damage received in single player action while Sombra lives","absorption_points":8,"once_per_fight":true,"not_retroactive":true},"status":"V77_HUMAN_CLOSED_NUMERIC_DESIGN_LIII_HP110__NOT_RUNTIME_READY","validation":{"n_final_duels":34560,"player_win_pct":50.611,"independent_cohorts":2,"parity_pairs":405,"parity_differences":0},"source":"experimentos/balance_nuevo/handoffs/V72_SOMBRA_HP110_BALANCE_LIII_2026-10-10/SOMBRA_T0_V72_HP110_CANDIDATO.json","report":"experimentos/balance_nuevo/handoffs/V72_SOMBRA_HP110_BALANCE_LIII_2026-10-10/DICTAMEN_REBALANCE_SOMBRA_V72_2026-10-10.md","warning":"Original historical T0 not modified; V72 design selection is not runtime HTML parity. LIII optional set can exceed 70%.","design_closed_by":"User 2026-10-10: 'cerramos el jefe este, pasamos a testear ... AOE usando concordancia'","closed_scope":"SOMBRA_ELITE_UNIQUE_1V1_NUMERIC_DESIGN_ONLY","open_checks":["V72_T0_RUNTIME_HTML_PARITY","V73_ULTIS_ADAPTER_EXPERIMENTAL","AOE_CONCORDANCE_NATIVE_MULTITARGET_UNIMPLEMENTED","REAL_MANUAL_AND_EQUIPMENT_ACQUISITION"]},"t0_design_rebalance_v71_history":{"source_historical_hp":51,"human_reopened":"2026-10-10","status":"V71_NEW_T0_CANDIDATE_REQUIRES_HUMAN_NUMERIC_APPROVAL","hp":90,"defense":1,"stats_except_hp_identical_to_M11":true,"poison_m11_unchanged":true,"new_unique_reactive_mechanic":{"id":"SOMBRA_ESPEJO_REMANSO","label":"Espejo del Remanso","trigger":"One actual player offensive action removing at least 16 HP from Sombra, after that damage resolves, while Sombra survives","absorption_reserve":16,"uses_per_combat":1,"not_retroactive":true,"dot_respects_absorption":true,"telegraph_needed_in_html":true},"lab_result_player_win_pct":58.11,"lab_note":"Holdout N12960 physical PRE_AOE 1v1; not runtime or guaranteed all cross strata.","source_lab":"experimentos/balance_nuevo/handoffs/V71_ECO84_SOMBRA_URGENTE_2026-10-10/DICTAMEN_REBALANCE_SOMBRA_V71_2026-10-10.md"}},{"id":"centinela_pluma","name":"centinela de plumas petrificadas","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_IV","role":"BOSS","repeatable":false,"unique":true,"element":"metal","region_historical":"alturas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"UNIQUE_T0_CLOSED_NO_T1_T4","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"devorador_niebla","name":"devorador de niebla","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_IV","role":"NORMAL","repeatable":true,"unique":false,"element":"viento","region_historical":"alturas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"ADAPTIVE_CHAIN_T0_T4_CLOSED","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"avispa_jade","name":"avispa de jade dentado","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_I","role":"NORMAL","repeatable":true,"unique":false,"element":"viento","region_historical":"bosques","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"READY_FOR_T1_RECALIBRATION","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"mono_pildoras","name":"macaco ladrón de píldoras","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_I","role":"SKIRMISHER","repeatable":true,"unique":false,"element":null,"region_historical":"bosques","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"READY_FOR_T1_RECALIBRATION","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"sapo_ceniza","name":"sapo de ceniza caliente","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_II","role":"NORMAL","repeatable":true,"unique":false,"element":"fuego","region_historical":"cantera_vetas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"ADAPTIVE_CHAIN_T0_T4_CLOSED","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"sapo_caldera","name":"Sapo Caldera de Tres Gargantas","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_II","role":"BOSS","repeatable":false,"unique":true,"element":"fuego","region_historical":"cantera_vetas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"UNIQUE_T0_CLOSED_NO_T1_T4","legal_guardian_aoe_stage":"LianQi_III","runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":"AOE guardian encounter legal in LIII regardless of historical native stage"},{"id":"escarabajo_hierro","name":"escarabajo de hierro espiritual","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_II","role":"TANK","repeatable":true,"unique":false,"element":"metal","region_historical":"cantera_vetas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"ADAPTIVE_CHAIN_T0_T4_CLOSED","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"rey_escarabajo","name":"Rey Escarabajo de la Veta Negra","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_II","role":"BOSS","repeatable":false,"unique":true,"element":"metal","region_historical":"cantera_vetas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"UNIQUE_T0_CLOSED_NO_T1_T4","legal_guardian_aoe_stage":"LianQi_III","runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":"AOE guardian encounter legal in LIII regardless of historical native stage"},{"id":"anguila_estelar","name":"anguila de constelación rota","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_III","role":"SKIRMISHER","repeatable":true,"unique":false,"element":"agua","region_historical":"aguas_barrancos","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"ADAPTIVE_CHAIN_T0_T4_CLOSED","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"guardian_coral","name":"guardián de coral memorioso","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_III","role":"BOSS","repeatable":false,"unique":true,"element":"agua","region_historical":"aguas_barrancos","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"UNIQUE_T0_CLOSED_NO_T1_T4","legal_guardian_aoe_stage":"LianQi_III","runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":"AOE guardian encounter legal in LIII regardless of historical native stage"},{"id":"halcon_tormenta","name":"halcón de tormenta joven","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_IV","role":"SKIRMISHER","repeatable":true,"unique":false,"element":"viento","region_historical":"alturas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"ADAPTIVE_CHAIN_T0_T4_CLOSED","legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":null},{"id":"mantis_nube","name":"mantis de nube cortante","source_class":"LEGACY_18_AUTHORIZED_PROFILE","design_canon":true,"native_stage_historical":"LianQi_IV","role":"BOSS","repeatable":false,"unique":true,"element":"viento","region_historical":"alturas","numeric_source":{"status":"READY","commit":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","path":"experimentos/balance_nuevo/monster_arc1_registry.json","blob_sha":"0261dd2b254ee0db0d28256b37e54fd7756790c7"},"adaptive_source_status":"UNIQUE_T0_CLOSED_NO_T1_T4","legal_guardian_aoe_stage":"LianQi_III","runtime_integration_status":"NOT_VALIDATED_IN_THIS_CATALOG","notes":"AOE guardian encounter legal in LIII regardless of historical native stage"},{"id":"jabali_pizarra","name":"Jabalí de Pizarra","source_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","design_canon":true,"native_stage_historical":"LianQi_II","role":"BRUISER","repeatable":true,"unique":false,"element":null,"region_historical":null,"numeric_source":{"status":"NUMERIC_DESIGN_HUMAN_RATIFIED_NOT_RUNTIME_PATCH","source_ref":"experiment/lii-tramo1-multirraiz-v08-2026-10-08","authority_path":"experimentos/balance_nuevo/handoffs/CIERRE_RATIFICADO_VIENTO_Y_NORMALES_2026-10-09/DECISION_HUMANA_CIERRE_LII_NORMAL_Y_VIENTO_2026-10-09.json","source_blob_sha":"d4416b603b6f5086c5c816fe678407de768075ea","approved_change":{"id":"jabali_pizarra","path":"technique.params.direct_damage","from":"1d3+6","to":"1d3+8"}},"adaptive_source_status":"DO_NOT_INFER_T0_T4_FROM_LEGACY_REGISTRY","legal_guardian_aoe_stage":null,"runtime_integration_status":"PENDING_RUNTIME_PARITY","notes":"Monster exists in approved new LII catalog; LIII encounter accessibility requires room/spawn verification."},{"id":"buho_niebla_gris","name":"Búho de la Niebla Gris","source_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","design_canon":true,"native_stage_historical":"LianQi_II","role":"PRECISION","repeatable":true,"unique":false,"element":null,"region_historical":null,"numeric_source":{"status":"NUMERIC_DESIGN_HUMAN_RATIFIED_NOT_RUNTIME_PATCH","source_ref":"experiment/lii-tramo1-multirraiz-v08-2026-10-08","authority_path":"experimentos/balance_nuevo/handoffs/CIERRE_RATIFICADO_VIENTO_Y_NORMALES_2026-10-09/DECISION_HUMANA_CIERRE_LII_NORMAL_Y_VIENTO_2026-10-09.json","source_blob_sha":"d4416b603b6f5086c5c816fe678407de768075ea","approved_change":{"id":"buho_niebla_gris","path":"technique.params.direct_damage","from":"1d2+7","to":"1d2+8"}},"adaptive_source_status":"DO_NOT_INFER_T0_T4_FROM_LEGACY_REGISTRY","legal_guardian_aoe_stage":null,"runtime_integration_status":"PENDING_RUNTIME_PARITY","notes":"Monster exists in approved new LII catalog; LIII encounter accessibility requires room/spawn verification."},{"id":"zorro_bancales","name":"Zorro de los Bancales","source_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","design_canon":true,"native_stage_historical":"LianQi_II","role":"SKIRMISHER","repeatable":true,"unique":false,"element":null,"region_historical":null,"numeric_source":{"status":"NUMERIC_DESIGN_HUMAN_RATIFIED_NOT_RUNTIME_PATCH","source_ref":"experiment/lii-tramo1-multirraiz-v08-2026-10-08","authority_path":"experimentos/balance_nuevo/handoffs/CIERRE_RATIFICADO_VIENTO_Y_NORMALES_2026-10-09/DECISION_HUMANA_CIERRE_LII_NORMAL_Y_VIENTO_2026-10-09.json","source_blob_sha":"d4416b603b6f5086c5c816fe678407de768075ea","approved_change":{"id":"zorro_bancales","path":"stats.evasion","from":19,"to":21}},"adaptive_source_status":"DO_NOT_INFER_T0_T4_FROM_LEGACY_REGISTRY","legal_guardian_aoe_stage":null,"runtime_integration_status":"PENDING_RUNTIME_PARITY","notes":"Monster exists in approved new LII catalog; LIII encounter accessibility requires room/spawn verification."},{"id":"cangrejo_cauce","name":"Cangrejo del Cauce Pétreo","source_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","design_canon":true,"native_stage_historical":"LianQi_II","role":"GUARDIAN","repeatable":true,"unique":false,"element":null,"region_historical":null,"numeric_source":{"status":"NUMERIC_DESIGN_HUMAN_RATIFIED_NOT_RUNTIME_PATCH","source_ref":"experiment/lii-tramo1-multirraiz-v08-2026-10-08","authority_path":"experimentos/balance_nuevo/handoffs/CIERRE_RATIFICADO_VIENTO_Y_NORMALES_2026-10-09/DECISION_HUMANA_CIERRE_LII_NORMAL_Y_VIENTO_2026-10-09.json","source_blob_sha":"d4416b603b6f5086c5c816fe678407de768075ea","approved_change":{"id":"cangrejo_cauce","path":"technique.params.direct_damage","from":"1d2+7","to":"1d2+8"}},"adaptive_source_status":"DO_NOT_INFER_T0_T4_FROM_LEGACY_REGISTRY","legal_guardian_aoe_stage":null,"runtime_integration_status":"PENDING_RUNTIME_PARITY","notes":"Monster exists in approved new LII catalog; LIII encounter accessibility requires room/spawn verification."},{"id":"murcielago_resonante","name":"Murciélago Resonante","source_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","design_canon":true,"native_stage_historical":"LianQi_II","role":"DISRUPTOR","repeatable":true,"unique":false,"element":null,"region_historical":null,"numeric_source":{"status":"NUMERIC_DESIGN_HUMAN_RATIFIED_NOT_RUNTIME_PATCH","source_ref":"experiment/lii-tramo1-multirraiz-v08-2026-10-08","authority_path":"experimentos/balance_nuevo/handoffs/CIERRE_RATIFICADO_VIENTO_Y_NORMALES_2026-10-09/DECISION_HUMANA_CIERRE_LII_NORMAL_Y_VIENTO_2026-10-09.json","source_blob_sha":"d4416b603b6f5086c5c816fe678407de768075ea","approved_change":{"id":"murcielago_resonante","path":"technique.params.direct_damage","from":"1d2+5","to":"1d2+6"}},"adaptive_source_status":"DO_NOT_INFER_T0_T4_FROM_LEGACY_REGISTRY","legal_guardian_aoe_stage":null,"runtime_integration_status":"PENDING_RUNTIME_PARITY","notes":"Monster exists in approved new LII catalog; LIII encounter accessibility requires room/spawn verification."},{"id":"arana_veta_sombria","name":"Araña de la Veta Sombría","source_class":"NEW_LII_REPEATABLE_V35_HUMAN_RATIFIED","design_canon":true,"native_stage_historical":"LianQi_II","role":"AFFLICTOR","repeatable":true,"unique":false,"element":null,"region_historical":null,"numeric_source":{"status":"NUMERIC_DESIGN_HUMAN_RATIFIED_NOT_RUNTIME_PATCH","source_ref":"experiment/lii-tramo1-multirraiz-v08-2026-10-08","authority_path":"experimentos/balance_nuevo/handoffs/CIERRE_RATIFICADO_VIENTO_Y_NORMALES_2026-10-09/DECISION_HUMANA_CIERRE_LII_NORMAL_Y_VIENTO_2026-10-09.json","source_blob_sha":"d4416b603b6f5086c5c816fe678407de768075ea","approved_change":{"id":"arana_veta_sombria","path":"stats.hp","from":71,"to":75}},"adaptive_source_status":"DO_NOT_INFER_T0_T4_FROM_LEGACY_REGISTRY","legal_guardian_aoe_stage":null,"runtime_integration_status":"PENDING_RUNTIME_PARITY","notes":"Monster exists in approved new LII catalog; LIII encounter accessibility requires room/spawn verification."},{"id":"custodio_eco_petreo","name":"El Custodio del Eco Pétreo","source_class":"NEW_LIII_AOE_GUARDIAN_HUMAN_IDENTITY_RATIFIED","design_canon":true,"native_stage_historical":null,"design_encounter_stage":"LianQi_III","role":"BOSS","repeatable":false,"unique":true,"element":"tierra","region_historical":null,"proposed_room":"bosque_rocas_blancas","numeric_source":{"status":"T0_NOT_RATIFIED_NO_NUMERIC_STATS"},"adaptive_source_status":"UNIQUE_NO_PERSISTENT_T1_T4","legal_guardian_aoe_stage":"LianQi_III","runtime_integration_status":"NO_RUNTIME_SPAWN_OR_MANUAL","notes":"Identity and name are approved; do not invent T0, stats, spawn or manual delivery."},{"id":"garza_bruma_roca","name":"Garza de Bruma de Roca","source_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","design_canon":true,"design_approval":"V46_HUMAN_APPROVED_IDENTITIES_AND_DESIGNS","native_stage_historical":"LianQi_III","role":"NORMAL","repeatable":true,"unique":false,"element":null,"region_historical":"aguas_barrancos","numeric_source":{"status":"V67_NUMERIC_T0_BASELINE_SELECTED_BUT_NOT_FINAL_SCHEMA_READY","stats_status":"PENDING_RUNTIME_PARITY_AND_CONTROL_0_SOURCE","technique_params_status":"PENDING_RUNTIME_PARITY_AND_FINAL_GATE","crit_chance_proposed":5,"crit_damage_proposed":1.5,"qi_max":null,"control":"LAB_HYPOTHESIS_0_NOT_RATIFIED","stats_proposed":{"hp":75,"precision":109,"evasion":31,"defense":0,"tenacity":14,"basic_damage":"1d2+6"},"technique_proposed":{"name":"Pico de Niebla Cortante","mechanics":["DIRECT_DAMAGE"],"direct_damage":"1d3+8","cadence":3},"selection_ref":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/SELECCION_T0_SEIS_REPETIBLES_LIII_V67_2026-10-10.json"},"adaptive_source_status":"V46_V47_EXPERIMENTAL_NO_SEQUENTIAL_RATIFICATION","t1_hypothesis":"EVADE_NEXT +8; proposed","proposed_rooms_only":["aguas_cauce_alto","aguas_paso_piedras"],"legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_MATERIALIZED_STAGE_GATE_PENDING","source_documents":["experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md"],"notes":"Human approved creature identity/design in V46; V45 numeric values/rooms are candidate-only, and V46 T1-T4/mutant proposals are not production-ready."},{"id":"cangrejo_laja_humeda","name":"Cangrejo de Laja Húmeda","source_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","design_canon":true,"design_approval":"V46_HUMAN_APPROVED_IDENTITIES_AND_DESIGNS","native_stage_historical":"LianQi_III","role":"NORMAL","repeatable":true,"unique":false,"element":null,"region_historical":"aguas_barrancos","numeric_source":{"status":"V67_NUMERIC_T0_BASELINE_SELECTED_BUT_NOT_FINAL_SCHEMA_READY","stats_status":"PENDING_RUNTIME_PARITY_AND_CONTROL_0_SOURCE","technique_params_status":"PENDING_RUNTIME_PARITY_AND_FINAL_GATE","crit_chance_proposed":5,"crit_damage_proposed":1.5,"qi_max":null,"control":"LAB_HYPOTHESIS_0_NOT_RATIFIED","stats_proposed":{"hp":90,"precision":98,"evasion":9,"defense":3,"tenacity":28,"basic_damage":"1d2+6"},"technique_proposed":{"name":"Tenaza de Pizarra","mechanics":["DIRECT_DAMAGE"],"direct_damage":"1d3+8","cadence":4},"selection_ref":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/SELECCION_T0_SEIS_REPETIBLES_LIII_V67_2026-10-10.json"},"adaptive_source_status":"V46_V47_EXPERIMENTAL_NO_SEQUENTIAL_RATIFICATION","t1_hypothesis":"DEFENSE_UP +2; proposed","proposed_rooms_only":["aguas_garganta_norte","aguas_pasarela_roca"],"legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_MATERIALIZED_STAGE_GATE_PENDING","source_documents":["experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md"],"notes":"Human approved creature identity/design in V46; V45 numeric values/rooms are candidate-only, and V46 T1-T4/mutant proposals are not production-ready."},{"id":"sanguijuela_remanso_turbio","name":"Sanguijuela de Remanso Turbio","source_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","design_canon":true,"design_approval":"V46_HUMAN_APPROVED_IDENTITIES_AND_DESIGNS","native_stage_historical":"LianQi_III","role":"NORMAL","repeatable":true,"unique":false,"element":null,"region_historical":"aguas_barrancos","numeric_source":{"status":"V67_NUMERIC_T0_BASELINE_SELECTED_BUT_NOT_FINAL_SCHEMA_READY","stats_status":"PENDING_RUNTIME_PARITY_AND_CONTROL_0_SOURCE","technique_params_status":"PENDING_RUNTIME_PARITY_AND_FINAL_GATE","crit_chance_proposed":5,"crit_damage_proposed":1.5,"qi_max":null,"control":"LAB_HYPOTHESIS_0_NOT_RATIFIED","stats_proposed":{"hp":78,"precision":103,"evasion":16,"defense":1,"tenacity":16,"basic_damage":"1d2+6"},"technique_proposed":{"name":"Mordida de Limo Frío","mechanics":["DIRECT_DAMAGE","POISON_DOT"],"direct_damage":"1d2+7","cadence":3,"dot":{"family":"POISON_DOT","damage":"1d2+2","ticks":2}},"selection_ref":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/SELECCION_T0_SEIS_REPETIBLES_LIII_V67_2026-10-10.json"},"adaptive_source_status":"V46_V47_EXPERIMENTAL_NO_SEQUENTIAL_RATIFICATION","t1_hypothesis":"MITIGATE_NEXT 35%; proposed","proposed_rooms_only":["aguas_poza_profunda","aguas_cascada_velada"],"legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_MATERIALIZED_STAGE_GATE_PENDING","source_documents":["experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md"],"notes":"Human approved creature identity/design in V46; V45 numeric values/rooms are candidate-only, and V46 T1-T4/mutant proposals are not production-ready."},{"id":"salamandra_filtracion_tibia","name":"Salamandra de Filtración Tibia","source_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","design_canon":true,"design_approval":"V46_HUMAN_APPROVED_IDENTITIES_AND_DESIGNS","native_stage_historical":"LianQi_III","role":"NORMAL","repeatable":true,"unique":false,"element":null,"region_historical":"aguas_barrancos","numeric_source":{"status":"V67_NUMERIC_T0_BASELINE_SELECTED_BUT_NOT_FINAL_SCHEMA_READY","stats_status":"PENDING_RUNTIME_PARITY_AND_CONTROL_0_SOURCE","technique_params_status":"PENDING_RUNTIME_PARITY_AND_FINAL_GATE","crit_chance_proposed":5,"crit_damage_proposed":1.5,"qi_max":null,"control":"LAB_HYPOTHESIS_0_NOT_RATIFIED","stats_proposed":{"hp":79,"precision":103,"evasion":16,"defense":2,"tenacity":22,"basic_damage":"1d2+6"},"technique_proposed":{"name":"Salpicadura Irritante","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"direct_damage":"1d2+7","cadence":4,"dot":{"family":"BURN_DOT","damage":"1d2+1","ticks":2}},"selection_ref":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/SELECCION_T0_SEIS_REPETIBLES_LIII_V67_2026-10-10.json"},"adaptive_source_status":"V46_V47_EXPERIMENTAL_NO_SEQUENTIAL_RATIFICATION","t1_hypothesis":"MITIGATE_NEXT 35%; proposed","proposed_rooms_only":["aguas_filtraciones_cantera","aguas_paso_alto"],"legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_MATERIALIZED_STAGE_GATE_PENDING","source_documents":["experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md"],"notes":"Human approved creature identity/design in V46; V45 numeric values/rooms are candidate-only, and V46 T1-T4/mutant proposals are not production-ready."},{"id":"rana_cascajo_barranco","name":"Rana de Cascajo del Barranco","source_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","design_canon":true,"design_approval":"V46_HUMAN_APPROVED_IDENTITIES_AND_DESIGNS","native_stage_historical":"LianQi_III","role":"NORMAL","repeatable":true,"unique":false,"element":null,"region_historical":"aguas_barrancos","numeric_source":{"status":"V67_NUMERIC_T0_BASELINE_SELECTED_BUT_NOT_FINAL_SCHEMA_READY","stats_status":"PENDING_RUNTIME_PARITY_AND_CONTROL_0_SOURCE","technique_params_status":"PENDING_RUNTIME_PARITY_AND_FINAL_GATE","crit_chance_proposed":5,"crit_damage_proposed":1.5,"qi_max":null,"control":"LAB_HYPOTHESIS_0_NOT_RATIFIED","stats_proposed":{"hp":84,"precision":100,"evasion":17,"defense":2,"tenacity":23,"basic_damage":"1d2+6"},"technique_proposed":{"name":"Salto de Cascajo","mechanics":["DIRECT_DAMAGE"],"direct_damage":"1d3+8","cadence":3},"selection_ref":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/SELECCION_T0_SEIS_REPETIBLES_LIII_V67_2026-10-10.json"},"adaptive_source_status":"V46_V47_EXPERIMENTAL_NO_SEQUENTIAL_RATIFICATION","t1_hypothesis":"DEFENSE_UP +2; proposed","proposed_rooms_only":["aguas_garganta_sur","aguas_desvio_sauces"],"legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_MATERIALIZED_STAGE_GATE_PENDING","source_documents":["experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md"],"notes":"Human approved creature identity/design in V46; V45 numeric values/rooms are candidate-only, and V46 T1-T4/mutant proposals are not production-ready."},{"id":"carpa_lamina_reflejo","name":"Carpa de Lámina Reflejada","source_class":"NEW_LIII_REPEATABLE_V45_V46_HUMAN_RATIFIED_DESIGN","design_canon":true,"design_approval":"V46_HUMAN_APPROVED_IDENTITIES_AND_DESIGNS","native_stage_historical":"LianQi_III","role":"NORMAL","repeatable":true,"unique":false,"element":null,"region_historical":"aguas_barrancos","numeric_source":{"status":"V67_NUMERIC_T0_BASELINE_SELECTED_BUT_NOT_FINAL_SCHEMA_READY","stats_status":"PENDING_RUNTIME_PARITY_AND_CONTROL_0_SOURCE","technique_params_status":"PENDING_RUNTIME_PARITY_AND_FINAL_GATE","crit_chance_proposed":5,"crit_damage_proposed":1.5,"qi_max":null,"control":"LAB_HYPOTHESIS_0_NOT_RATIFIED","stats_proposed":{"hp":78,"precision":104,"evasion":26,"defense":1,"tenacity":13,"basic_damage":"1d2+6"},"technique_proposed":{"name":"Succión de Corriente","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"direct_damage":"1d3+7","cadence":3,"qi_drain_on_hit":3},"selection_ref":"experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/SELECCION_T0_SEIS_REPETIBLES_LIII_V67_2026-10-10.json"},"adaptive_source_status":"V46_V47_EXPERIMENTAL_NO_SEQUENTIAL_RATIFICATION","t1_hypothesis":"EVADE_NEXT +8; proposed","proposed_rooms_only":["aguas_manantial_entrada","aguas_rama_clara"],"legal_guardian_aoe_stage":null,"runtime_integration_status":"NOT_MATERIALIZED_STAGE_GATE_PENDING","source_documents":["experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V45_NUEVA_FAUNA_LIII_2026-10-09.md","experimentos/balance_nuevo/handoffs/V67_CIERRE_GUARDIANES_ULTIS_2026-10-10/FUENTE_IMPORTADA_V46_CADENA_ADAPTATIVA_LIII_2026-10-09.md"],"notes":"Human approved creature identity/design in V46; V45 numeric values/rooms are candidate-only, and V46 T1-T4/mutant proposals are not production-ready."}]}.entities;
  const oldRegistry={"schema_version":"arc1-monsters-v1","status":"NEW_ENGINE_ONLY","engine_contract":"NEW_COMBAT_STATS_V0_1","authority":{"numeric_contract":"docs/experimentos/CONTRATO_COMBATE_ESTADISTICAS_DOT_V0_1.md","universal_registry":"docs/experimentos/REGISTRO_UNIVERSAL_ESTADISTICAS_PROPIEDADES_COMBATE_V0_1.md","event_effect_contract":"docs/experimentos/CONTRATO_MOTOR_EVENTOS_EFECTOS_V0_1.md"},"rules":{"profile_count":18,"pending_profiles_must_not_run":true,"t0_required_before_adaptive_tiers":true,"definitives_in_monster_balance":false,"arc1_monster_resource_model":"NONE","arc1_monster_qi_semantics":"qi_max=null is authoritative N/A for Arc 1 monsters and does not block T0 READY","ready_profiles":["rata_qi","avispa_jade","serpiente_qi","mono_pildoras","lobo_espiritual","sapo_ceniza","escarabajo_hierro"],"li_t0_freeze":"T0_LI_EXHAUSTIVE_PASS_2026-10-06","adaptive_expected_bands":{"note":"Guidance only; not hard gates. Valid pressure may push a population beyond the expected band.","LianQi_I":"T0-T1 expected","LianQi_II":"T1-T2 expected","LianQi_III":"T2 expected/advanced overreach possible","LianQi_IV":"T3-T4 intended replayability/endgame"},"adaptive_overreach_policy":"ALLOWED_NATURAL_LIMIT_BY_COMBAT_AND_DECAY","lii_t0_freeze":"T0_LII_HUMAN_RATIFIED_2026-10-07","lii_t1_freeze":"T1_LII_REACTIVE_HUMAN_RATIFIED_2026-10-07","lii_t2_freeze":"T2_LII_RECOGNITION_HUMAN_RATIFIED_2026-10-07"},"profiles":{"rata_qi":{"id":"rata_qi","name":"rata de qi","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"secta_exterior","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":45,"qi_max":null,"precision":84,"evasion":0,"defense":2,"tenacity":0,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"2d4+3"},"technique":null,"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"serpiente_qi":{"id":"serpiente_qi","name":"serpiente de qi verdosa","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"bosques","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":57,"precision":94,"evasion":11,"defense":0,"tenacity":5,"basic_damage":"1d2+2","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Colmillos Venenosos","mechanics":["POISON_DOT"],"params_status":"READY","params":{"cadence":2,"poison":{"damage":"1d2+2","ticks":3}}},"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"lobo_espiritual":{"id":"lobo_espiritual","name":"lobo espiritual de tres colas","native_stage":"LianQi_I","native_stage_index":1,"role":"APEX_BRIDGE","region":"bosques","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":53,"precision":100,"evasion":12,"defense":1,"tenacity":20,"basic_damage":"2d4+2","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Emboscada de las Tres Colas","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":4,"direct_damage":"2d6+1"}},"ai":{"cognition":"CAZADOR_2","social":"MANADA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"eco_caido":{"id":"eco_caido","name":"Eco del Caído","native_stage":"LianQi_II","native_stage_index":2,"role":"ELITE","region":"cantera_vetas","element":null,"unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":null,"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"pez_lunar":{"id":"pez_lunar","name":"pez de luna sin ojos","native_stage":"LianQi_III","native_stage_index":3,"role":"NORMAL","region":"aguas_barrancos","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mordida de Corriente","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"sombra_ahogada":{"id":"sombra_ahogada","name":"sombra ahogada del estanque","native_stage":"LianQi_III","native_stage_index":3,"role":"ELITE","region":"aguas_barrancos","element":"agua","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Velo de Ahogo","mechanics":["POISON_DOT"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"centinela_pluma":{"id":"centinela_pluma","name":"centinela de plumas petrificadas","native_stage":"LianQi_IV","native_stage_index":4,"role":"BOSS","region":"alturas","element":"metal","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Aleteo de Cuchillas","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"devorador_niebla":{"id":"devorador_niebla","name":"devorador de niebla","native_stage":"LianQi_IV","native_stage_index":4,"role":"NORMAL","region":"alturas","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Exhalación Vacía","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"avispa_jade":{"id":"avispa_jade","name":"avispa de jade dentado","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"bosques","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":42,"precision":102,"evasion":22,"defense":2,"tenacity":7,"basic_damage":"1d2+1","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Picadura de Esmeralda","mechanics":["POISON_DOT"],"params_status":"READY","params":{"cadence":2,"poison":{"damage":"1d3+2","ticks":2}}},"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"mono_pildoras":{"id":"mono_pildoras","name":"macaco ladrón de píldoras","native_stage":"LianQi_I","native_stage_index":1,"role":"SKIRMISHER","region":"bosques","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":59,"qi_max":null,"precision":91,"evasion":28,"defense":2,"tenacity":12,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Manotazo al Dantian","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"READY","params":{"cadence":2,"direct_damage":"1d2+3","qi_drain":6}},"ai":{"cognition":"CAZADOR_2","social":"OPORTUNISTA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"sapo_ceniza":{"id":"sapo_ceniza","name":"sapo de ceniza caliente","native_stage":"LianQi_II","native_stage_index":2,"role":"NORMAL","region":"cantera_vetas","element":"fuego","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":55,"qi_max":null,"precision":98,"evasion":11,"defense":0,"tenacity":6,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+4","burn":{"damage":"1d2+2","ticks":3}}},"ai":{"cognition":"INSTINTIVO","social":"TERRITORIAL"},"adaptive":{"status":"READY_FOR_T3_RECALIBRATION","rule":"T0 LII frozen. T1 human-ratified as reactive MITIGATE_NEXT 60% / CD3 with natural trigger HP<=30% OR received hit>=20% maxHP. T2 human-ratified as recognition memory2/repeat2, EFECTIVA-only, anticipation HP<=40% OR received hit>=15% maxHP, natural T1 priority, no monster-turn cost, and canonical due preserved. T3 may now be recalibrated; T4 remains sequentially gated."},"resource_model":"NONE"},"sapo_caldera":{"id":"sapo_caldera","name":"Sapo Caldera de Tres Gargantas","native_stage":"LianQi_II","native_stage_index":2,"role":"BOSS","region":"cantera_vetas","element":"fuego","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Eructo del Horno Hundido","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"escarabajo_hierro":{"id":"escarabajo_hierro","name":"escarabajo de hierro espiritual","native_stage":"LianQi_II","native_stage_index":2,"role":"TANK","region":"cantera_vetas","element":"metal","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":75,"qi_max":null,"precision":90,"evasion":14,"defense":2,"tenacity":24,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+8"}},"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T3_RECALIBRATION","rule":"T0 LII frozen. T1 human-ratified as reactive DEFENSE_UP +4 / CD3 with natural trigger HP<=30% OR received hit>=20% maxHP. T2 human-ratified as recognition memory2/repeat2, EFECTIVA-only, anticipation HP<=40% OR received hit>=15% maxHP, natural T1 priority, no monster-turn cost, and canonical due preserved. T3 may now be recalibrated; T4 remains sequentially gated."},"resource_model":"NONE"},"rey_escarabajo":{"id":"rey_escarabajo","name":"Rey Escarabajo de la Veta Negra","native_stage":"LianQi_II","native_stage_index":2,"role":"BOSS","region":"cantera_vetas","element":"metal","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mandíbula de Yunque","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"COLONIA"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"anguila_estelar":{"id":"anguila_estelar","name":"anguila de constelación rota","native_stage":"LianQi_III","native_stage_index":3,"role":"SKIRMISHER","region":"aguas_barrancos","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mordida del Meridiano Azul","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"guardian_coral":{"id":"guardian_coral","name":"guardián de coral memorioso","native_stage":"LianQi_III","native_stage_index":3,"role":"BOSS","region":"aguas_barrancos","element":"agua","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Marea de los Nombres Hundidos","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"halcon_tormenta":{"id":"halcon_tormenta","name":"halcón de tormenta joven","native_stage":"LianQi_IV","native_stage_index":4,"role":"SKIRMISHER","region":"alturas","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Picado del Relámpago","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"mantis_nube":{"id":"mantis_nube","name":"mantis de nube cortante","native_stage":"LianQi_IV","native_stage_index":4,"role":"BOSS","region":"alturas","element":"viento","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Tijera del Horizonte","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"MASTER_4","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"}}}.profiles;
  const cmap=new Map(catalog.map(c=>[c.id,c]));
  const ii=new Map(v35.changes.map(x=>[x.monster,x]));
  const recoveredII=new Map(Object.entries(v07v35.species));
  if(recoveredII.size!==6||v07v35.status!=='EXPERIMENTAL_E1_T0_SHADOW_ONLY_NOT_RUNTIME_READY'||
   v07v35.provenance.archive_sha256!=='97abd380cc48388431ed4887e1da63c3bd7027f349171f17d8c113109be23800'||
   v07v35.provenance.v07_source_sha256!=='2bc18dc8ee871798f266f79ac8d9582636c31e0f2943670c3bafaaa137b61f8d')
   throw new Error('LII_RECOVERED_SOURCE_PROVENANCE_DRIFT');
  const iii=new Map(v67.profiles.map(x=>[x.id,x]));
  if(ii.size!==6||iii.size!==6||v67.is_prod_ready!==false||
     v67.selection_status!=='T0_DESIGN_BASELINE_SELECTED_PENDING_EVENT_PARITY_AND_FORMAL_ADAPTIVE_RATIFICATION')
   throw new Error('NEW_SPECIES_SOURCE_STATUS_CHANGED');
  if(v35.status!=='NUMERIC_DESIGN_CLOSED_PER_USER__PENDING_INTEGRATION_RUNTIME_PARITY')
   throw new Error('LII_NUMERIC_DESIGN_AUTHORITY_CHANGED');
  const STATUS_GATE='A08_NEW_REPEATABLES_PREVIEW_ONLY_NO_NUMERIC_READY';
  const LII_IDS=Object.freeze([...ii.keys()]);
  const LIII_IDS=Object.freeze([...iii.keys()]);
  function sourceFor(id){
   const species=cmap.get(id),a=a08Assignment(id);
   if(!species||!species.repeatable||species.unique)throw new Error('NEW_MONSTER_NOT_REPEATABLE');
   if(oldRegistry[id]||(!ii.has(id)&&!iii.has(id)))throw new Error('NEW_MONSTER_NOT_IN_NEW_SOURCE');
   if(species.native_stage_historical!==a.stage)throw new Error('STAGE_BINDING_DRIFT');
   if(ii.has(id)){
    if(a.stage!=='LianQi_II'||a.numeric_gate!=='RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING'||
       species.numeric_source?.status!=='NUMERIC_DESIGN_HUMAN_RATIFIED_NOT_RUNTIME_PATCH')
      throw new Error('LII_RUNTIME_GATE_CHANGED');
    const x=ii.get(id),target=species.numeric_source.approved_change;
    if(x.field!==target.path||x.from!==target.from||x.to!==target.to)
      throw new Error('LII_V35_NUMERIC_TARGET_MISMATCH');
    const recovered=recoveredII.get(id);
    if(!recovered || recovered.delta.path!==x.field || recovered.delta.from!==x.from ||
       recovered.delta.to!==x.to || !['F1','F3'].includes(recovered.selected))
      throw new Error('LII_V07_V35_PROFILE_MISMATCH');
    let cur=recovered;
    for(const key of x.field.split('.'))cur=cur[key];
    if(cur!==x.to)throw new Error('LII_APPROVED_DELTA_NOT_APPLIED');
    if(recovered.stats.qi_max!==null||recovered.stats.control!==0 ||
       recovered.technique.params_status!=='READY'||recovered.technique.params.cadence<2)
      throw new Error('LII_SOURCE_T0_SCHEMA_DRIFT');
    return Object.freeze({id,stage:a.stage,role:a.role,cognitive:a.cognitive,social:a.social,
     status:'LII_V07_F1_F3_PLUS_V35_T0_SHADOW_NOT_CANON_READY',verifiedTarget:Object.freeze({...x}),
     source:recovered,physicalAllowed:false,shadowT0Allowed:true,adaptiveAllowed:false});
   }
   if(a.stage!=='LianQi_III'||a.numeric_gate!=='DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING'||
     species.numeric_source?.status!=='V67_NUMERIC_T0_BASELINE_SELECTED_BUT_NOT_FINAL_SCHEMA_READY')
    throw new Error('LIII_RUNTIME_GATE_CHANGED');
   const x=iii.get(id);
   if(x.ready_in_production!==false||x.adaptive_t1_t4!=='NOT_RATIFIED_BY_THIS_SELECTION'||
      x.stats.control?.value!==0||x.stats.control?.previous_status!=='V45_HYPOTHESIS'||
      x.source_v45_t0_status!=='CANDIDATE_TESTED_V45')
    throw new Error('LIII_V67_CANDIDATE_GATE_CHANGED');
   if(JSON.stringify(species.numeric_source.stats_proposed)!==
      JSON.stringify(Object.fromEntries(['hp','precision','evasion','defense','tenacity','basic_damage'].map(k=>[k,x.stats[k]]))))
    throw new Error('LIII_CATALOG_V67_STATS_CONFLICT');
   return Object.freeze({id,stage:a.stage,role:a.role,cognitive:a.cognitive,social:a.social,
    status:'LIII_V67_T0_SHADOW_CANDIDATE_CONTROL_UNRATIFIED',source:x,
    physicalAllowed:false,shadowT0Allowed:true,adaptiveAllowed:false});
  }
  function decide({id,tier='T0',mode,round=1,selfHpRatio=.5,playerHpRatio=.5,randomFloat=.5,memory=[]}){
   if(tier!=='T0')throw new Error('NEW_SPECIES_ADAPTATION_NOT_RATIFIED');
   if(!Number.isSafeInteger(round)||round<1)throw new Error('BAD_ROUND');
   if(!Number.isFinite(randomFloat)||randomFloat<0||randomFloat>=1)throw new Error('BAD_AI_RNG');
   const s=sourceFor(id),a=a08Assignment(id);
   const preview=mode==='PREVIEW_ONLY';
   if(!preview&&!['V67_T0_SHADOW','V35_T0_SHADOW'].includes(mode))throw new Error('EXPLICIT_MODE_REQUIRED');
   if(!preview && ((s.stage==='LianQi_II'&&mode!=='V35_T0_SHADOW') ||
                   (s.stage==='LianQi_III'&&mode!=='V67_T0_SHADOW')))
    throw new Error('SHADOW_MODE_STAGE_MISMATCH');
   let basic=id+'__basic',special=id+'__technique';
   const cadence=s.stage==='LianQi_II'?s.source.technique.params.cadence:s.source.technique.cadence;
   let due=preview?null:round%cadence===0;
   let kit=preview?[basic,special]:[due?special:basic];
   const abilities={};
   for(const [abilityId,kind] of [[basic,'BASIC'],[special,'TECHNIQUE']]){
    abilities[abilityId]={id:abilityId,intentCategory:kind==='BASIC'?'OFENSIVA':'CONTROL',
     tags:[preview?'COGNITION_ONLY_NO_STATS':mode],
     telegraph:preview?'A08 perfil experimental':kind==='BASIC'?'Ataque básico':s.source.technique.name,
     requirements:{signalsAll:[]},utility:{base:kind==='BASIC'?40:42,
      signalWeights:{},memoryWeights:{},socialWeights:{}}};
   }
   const monster={id,profileId:a.cognitive,socialProfileId:a.social,
    effectiveKit:kit,preferences:{...a.preferences},recentAbilityIds:[],cooldowns:{}};
   const selection=chooseMonsterIntent({monster,profiles:PROFILES,abilities,memory,
    combat:{round,self:{hpRatio:selfHpRatio,statuses:[]},player:{hpRatio:playerHpRatio,visibleStates:[]},signals:{}},
    social:{alliesAlive:0,sameSpeciesAllies:0,outnumbersPlayer:false},rng:{random:()=>randomFloat}});
   if(selection.status!==STATUS.INTENT_SELECTED)throw Error('AI_INTENT_NOT_SELECTED');
   const kind=selection.abilityId===special?'TECHNIQUE':'BASIC';
   if(!preview&&kind!==(due?'TECHNIQUE':'BASIC'))throw Error('CADENCE_DRIFT');
   return {id,mode,tier,kind,profile:a.cognitive,selectedId:selection.abilityId,
    considered:selection.debug.considered.length,sourceStatus:s.status,
    physicalReady:false,shadowOnly:!preview,memoryUsed:selection.debug.activeMemory.length};
  }
  const newMonsterIntent=decide;
  for(const id of [...LII_IDS,...LIII_IDS])sourceFor(id);

  /**
   * A08 unified 21 repeatables adaptive ARSENAL CONTRACT BRIDGE, NO runtime writes.
   * Five LI use their ratified old resolver, four historic LII/LIII use a signed
   * historical T0–T4 contract, twelve NEW use explicitly noncanonical candidate modes.
   * AI is deliberately NOT allowed to override T1/T3 causal reactions or T4 priority.
   */
  const HISTORY={"schema_version":"monster-adaptive-six-v0.1","status":"ADAPTIVE_CHAINS_T0_T4_HUMAN_RATIFIED_CLOSED","ratified_on":"2026-10-01","source_branch":"experiment/parallel-balance-npc-equipment-v0.1","source_head":"c7b87b84a80e0a42e20eec7574f860123685c782","evidence":{"heavy_result_sha256":"37218486409b05e336c8dc0a3ee8561614384322813f161a8baef7b5470f91fa","heavy_fights":243000,"sapo_escarabajo_refinement":{"fights":40500,"workflow_run_id":36940041359,"artifact_sha256":"7a86b7fdda970d7564b7e8cc5fb68611121c4a43c7a55f43adab81f61f35d60d"},"paired_t0_policy_baseline":{"fights":12000,"workflow_run_id":36940260810,"artifact_sha256":"22947941d32223a97ec4cf9371ae566b479b670871b595fdefe884caaf3bf20e"}},"methodology":{"target_win_rate_objective":false,"paired_t0_relative_review":true,"hard_guards":{"timeout_rate_max":0.02,"root_or_loadout_or_policy_polarization_max":0.75,"identity_must_express":true},"review_rule":"The 50 pp spread marker is diagnostic, not an automatic adaptive-tier failure when the paired T0 already exhibits the same policy/loadout/root sensitivity. Compare the tier delta against matched T0 and reject material multi-axis worsening.","no_hidden_player_build_inspection":true,"no_future_rng":true},"species":{"sapo_ceniza":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"sapo_ceniza-b01-cf7f63c920","source_results_sha256":"7851366c9b61f899b913a7e7e6a6f1f7bad96fe23f10a14af7dffb81015527a4","stats":{"hp":49,"qi_max":null,"precision":97,"evasion":11,"defense":0,"tenacity":5,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params":{"cadence":3,"direct_damage":"1d2+4","burn":{"damage":"1d2+2","ticks":3}}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"MITIGATE_NEXT","damage_reduction_pct":10,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_CONNECTED_WITH_T1_MITIGATION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Nube de Hollín","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":12,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"escarabajo_hierro":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"escarabajo_hierro-m14-6996f62d4a","source_results_sha256":"d5cc200a85c41014db8fea00fcc442996865718b89a9a4d2090c12fff81fd923","stats":{"hp":75,"qi_max":null,"precision":90,"evasion":14,"defense":2,"tenacity":24,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":3,"direct_damage":"1d2+8"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"DEFENSE_UP","defense_bonus":2,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_CONNECTED_AND_T1_DEFENSE_PREVENTED_DAMAGE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Carga de Caparazón","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":8,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"pez_lunar":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"pez_lunar-b00-8a7474198a","source_results_sha256":"bcba2b003fa2d03d0447fb13bb0c45ccc85aa6f7a3de22115bbb94c1dda32c9f","stats":{"hp":42,"qi_max":null,"precision":90,"evasion":29,"defense":2,"tenacity":13,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+8"},"technique":{"name":"Mordida de Corriente","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":4,"direct_damage":"2d4+9"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":20,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"pez_lunar__T1_0_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Mordida de Corriente","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"anguila_estelar":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"anguila_estelar-b09-4f1d8e046c","source_results_sha256":"836f54456aade744b37c27dc04d171316bc637d24b17f7d3e3faa76c39605a14","stats":{"hp":37,"qi_max":null,"precision":92,"evasion":36,"defense":1,"tenacity":16,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d3+6"},"technique":{"name":"Mordida del Meridiano Azul","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params":{"cadence":4,"direct_damage":"2d6+9","qi_drain":6}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":35,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"anguila_estelar__T1_1_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Mordida del Meridiano Azul","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"devorador_niebla":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"devorador_niebla-b00-6f4bffd772","source_results_sha256":"bcba2b003fa2d03d0447fb13bb0c45ccc85aa6f7a3de22115bbb94c1dda32c9f","stats":{"hp":46,"qi_max":null,"precision":93,"evasion":28,"defense":2,"tenacity":14,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+9"},"technique":{"name":"Exhalación Vacía","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":4,"direct_damage":"3d4+8"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":20,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"devorador_niebla__T1_0_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Exhalación Vacía","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"halcon_tormenta":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"halcon_tormenta-b03-27f18b5b64","source_results_sha256":"836f54456aade744b37c27dc04d171316bc637d24b17f7d3e3faa76c39605a14","stats":{"hp":43,"qi_max":null,"precision":89,"evasion":30,"defense":2,"tenacity":22,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d3+6"},"technique":{"name":"Picado del Relámpago","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":3,"direct_damage":"3d6+8"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":35,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"halcon_tormenta__T1_1_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Picado del Relámpago","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}}},"guards":{"unique_species_excluded":true,"rata_chain_unchanged":true,"no_t5":true,"no_automatic_reopen":true,"no_canonical_numeric_change_without_explicit_human_reopen":true}};
  const newer={"schema_version":"six-repeatable-t0-variance-authority-v0.1","status":"LII_T2_RECOGNITION_HUMAN_RATIFIED_2026_10_07","created_on":"2026-10-06","source":{"t0_and_historical_adaptive_branch":"experiment/variance-six-repeatables-v0.1","t0_and_historical_adaptive_contract":"experimentos/balance_nuevo/monster_adaptive_six_v0.1/MONSTER_ADAPTIVE_SIX_CONTRACT_V0_1.json","historical_variance_branch":"experiment/variance-six-repeatables-v0.1","historical_variance_config":"experimentos/balance_nuevo/individual_variance_v0.1/monster_individual_variance_v0.1.json","variance_closure_head":"17c16f66dc929a91d3ebab5e5c4bb9ac17b92e5e","variance_heavy_fights":420000,"note":"LII Sapo/Escarabajo T0 floors and reactive T1 remain frozen. T2 recognition was human-ratified on 2026-10-07 after the 61,440-fight paired gate; ordinary T0 variance remains collapsed to floor through this T2 freeze. LIII/LIV remain historical inputs pending stage-by-stage revalidation."},"mutant":{"distribution":"UNIFORM_0_1","target_incidence":0.0075,"maximum_incidence":0.01,"threshold_by_variable_axis_count":{"1":0.9925,"2":0.9387627564,"3":0.8814368899,"4":0.8371611094,"5":0.8041703275,"6":0.779195057,"7":0.7595352057,"8":0.7434948144,"9":0.73008977}},"species":{"sapo_ceniza":{"native_stage":"LianQi_II","t0":{"status":"READY_HUMAN_RATIFIED_PROGRESSIVE_FREEZE_2026_10_07","source_candidate":"SAPO_FLOOR_FIXED_V04_ACCEPTED_BY_HUMAN","source_results_sha256":null,"stats":{"hp":55,"qi_max":null,"precision":98,"evasion":11,"defense":0,"tenacity":6,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params":{"cadence":3,"direct_damage":"1d2+4","burn":{"damage":"1d2+2","ticks":3}}}},"variance":{"status":"ORDINARY_VARIANCE_COLLAPSED_TO_FLOOR_THROUGH_T2_VALIDATION","base":{"source_candidate":"SAPO_FLOOR_FIXED_V04_ACCEPTED_BY_HUMAN","hp":55,"defense":0,"evasion":11,"precision":98,"tenacity":6},"upper_envelope":{"hp":55,"defense":0,"evasion":11,"precision":98,"tenacity":6},"attacks":{"basic_damage":{"ladder":["1d2+5"],"sources":["LII_PROGRESSIVE_FREEZE_2026_10_07"]},"technique_direct_damage":{"ladder":["1d2+4"],"sources":["LII_PROGRESSIVE_FREEZE_2026_10_07"]}},"fixed_technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"cadence":3},"historical_upper_evidence":{"base":{"source_candidate":"sapo_ceniza-b01-cf7f63c920","hp":49,"defense":0,"evasion":11,"precision":97,"tenacity":5},"upper_envelope":{"source_axes":{"hp":"sapo_ceniza-b10-f851070241","defense":"sapo_ceniza-b03-0151582d7e","evasion":"sapo_ceniza-b07-4e68c838f4","precision":"sapo_ceniza-b10-f851070241","tenacity":"sapo_ceniza-b07-4e68c838f4"},"hp":52,"defense":3,"evasion":33,"precision":100,"tenacity":19},"attacks":{"basic_damage":{"ladder":["1d2+5","1d3+5","1d3+6","1d2+7"],"sources":["sapo_ceniza-b00-878c225026","sapo_ceniza-b10-f851070241","sapo_ceniza-b04-29a65445b7","sapo_ceniza-b02-55ce04b200"]},"technique_direct_damage":{"ladder":["1d2+4","1d2+5","1d2+8"],"sources":["sapo_ceniza-b01-cf7f63c920","sapo_ceniza-b00-878c225026","sapo_ceniza-b09-7dc3aa8399"]}},"fixed_technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"cadence":3},"source_note":"CLEAN-only per-axis envelope. Burn 1d2+2 x3 remains fixed at ratified T0 because no stronger CLEAN same-cadence burn axis was measured."},"source_note":"Human froze the LII T0 floor and reactive T1. Ordinary T0 variance remains collapsed to the accepted floor through the human-ratified T2 recognition freeze; stronger historical envelopes remain evidence for later exceptional/mutant review."},"historical_adaptive_anchor":{"status":"STALE_NUMERIC_AUTHORITY_ANCHOR_ONLY","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"MITIGATE_NEXT","damage_reduction_pct":10,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_CONNECTED_WITH_T1_MITIGATION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Nube de Hollín","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":12,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"t1":{"status":"READY_HUMAN_RATIFIED_REACTIVE_FREEZE_2026_10_07","source_candidate":"3f30ec963d6b5614","source_results_sha256":"cbf0c0e4994ed9a6cbe7a58a84981e73ae4f578d0ff073e5afd998b6c45c4867","ability":{"kind":"MITIGATE_NEXT","damage_reduction_pct":60,"cooldown_rounds":3,"activation":"REACTIVE","consumes_monster_turn":false,"consumption":"NEXT_CONNECTED_DIRECT_PACKET","persists_through_miss":true,"affects_dot":false},"signals":{"self_low_hp_ratio":0.3,"heavy_hit_ratio":0.2},"hrs_evidence":{"t0_player_win_rate":0.7328125,"t1_player_win_rate":0.630078125,"delta_pp":-10.2734375,"root_spread_policy_averaged_t0":0.130859375,"root_spread_policy_averaged_t1":0.12890625}},"t2":{"status":"READY_HUMAN_RATIFIED_RECOGNITION_FREEZE_2026_10_07","canonical_candidate_id":"T2_R2_SHORT_THREAT_40_15_PRESERVE_DUE","evidence_candidate_id":"T2_R2_SHORT_THREAT_40_15_PRESERVE_DUE_REACTIVE","source_results_sha256":"aec7c2c40dd8c29b2d22d3ae70c62e2966ae067803bd673bcb841036b0227fd0","represented_combat_fights":61440,"recognition":{"identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"anticipation":{"hp_ratio_lte":0.4,"received_hit_ratio_gte":0.15,"natural_t1_priority":true},"semantics":{"consumes_monster_turn":false,"t1_magnitude_cooldown_unchanged":true,"preserve_due_canonical_technique":true},"paired_evidence":{"mean_delta_player_win_rate_pp":-1.9140625,"global_gate_delta_player_win_rate_pp":-2.213541666666667,"contexts_t2_more_than_2pp_easier":0,"hrs_drop_over_8pp_contexts":0,"canonical_due_missed_with_t2_activation":0},"next_state":"READY_FOR_T3_RECALIBRATION"}},"escarabajo_hierro":{"native_stage":"LianQi_II","t0":{"status":"READY_HUMAN_RATIFIED_PROGRESSIVE_FREEZE_2026_10_07","source_candidate":"E0_FLOOR_FIXED_V04_ACCEPTED_BY_HUMAN","source_results_sha256":null,"stats":{"hp":75,"qi_max":null,"precision":90,"evasion":14,"defense":2,"tenacity":24,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":3,"direct_damage":"1d2+8"}}},"variance":{"status":"ORDINARY_VARIANCE_COLLAPSED_TO_FLOOR_THROUGH_T2_VALIDATION","base":{"source_candidate":"E0_FLOOR_FIXED_V04_ACCEPTED_BY_HUMAN","hp":75,"defense":2,"evasion":14,"precision":90,"tenacity":24},"upper_envelope":{"hp":75,"defense":2,"evasion":14,"precision":90,"tenacity":24},"attacks":{"basic_damage":{"ladder":["1d2+3"],"sources":["LII_PROGRESSIVE_FREEZE_2026_10_07"]},"technique_direct_damage":{"ladder":["1d2+8"],"sources":["LII_PROGRESSIVE_FREEZE_2026_10_07"]}},"fixed_technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"cadence":3},"historical_upper_evidence":{"base":{"source_candidate":"escarabajo_hierro-m14-6996f62d4a","hp":75,"defense":2,"evasion":14,"precision":90,"tenacity":24},"upper_envelope":{"source_axes":{"hp":"escarabajo_hierro-b04-d2b395945f","defense":"escarabajo_hierro-b04-d2b395945f","evasion":"escarabajo_hierro-b03-28afd52077","precision":"escarabajo_hierro-b05-4dea609a12","tenacity":"escarabajo_hierro-b03-28afd52077"},"hp":82,"defense":5,"evasion":22,"precision":98,"tenacity":34},"attacks":{"basic_damage":{"ladder":["1d2+3","1d2+4","1d2+6"],"sources":["escarabajo_hierro-m10-50f2acebee","escarabajo_hierro-b03-28afd52077","escarabajo_hierro-b04-d2b395945f"]},"technique_direct_damage":{"ladder":["1d2+8","1d4+9"],"sources":["escarabajo_hierro-m10-50f2acebee","escarabajo_hierro-b04-d2b395945f"]}},"fixed_technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"cadence":3},"source_note":"CLEAN-only envelope combines broad T0 and focused micro-lab evidence; cross-axis/T4 interaction validated in 420k heavy run."},"source_note":"Human froze the LII T0 floor and reactive T1. Ordinary T0 variance remains collapsed to the accepted floor through the human-ratified T2 recognition freeze; stronger historical envelopes remain evidence for later exceptional/mutant review."},"historical_adaptive_anchor":{"status":"STALE_NUMERIC_AUTHORITY_ANCHOR_ONLY","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"DEFENSE_UP","defense_bonus":2,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_CONNECTED_AND_T1_DEFENSE_PREVENTED_DAMAGE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Carga de Caparazón","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":8,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"t1":{"status":"READY_HUMAN_RATIFIED_REACTIVE_FREEZE_2026_10_07","source_candidate":"37ac83cfdd4c6973","source_results_sha256":"cbf0c0e4994ed9a6cbe7a58a84981e73ae4f578d0ff073e5afd998b6c45c4867","ability":{"kind":"DEFENSE_UP","defense_bonus":4,"cooldown_rounds":3,"activation":"REACTIVE","consumes_monster_turn":false,"consumption":"NEXT_PLAYER_OFFENSIVE_ACTION","normal_penetration_defense_pipeline":true},"signals":{"self_low_hp_ratio":0.3,"heavy_hit_ratio":0.2},"hrs_evidence":{"t0_player_win_rate":0.69140625,"t1_player_win_rate":0.59609375,"delta_pp":-9.53125,"root_spread_policy_averaged_t0":0.134765625,"root_spread_policy_averaged_t1":0.181640625}},"t2":{"status":"READY_HUMAN_RATIFIED_RECOGNITION_FREEZE_2026_10_07","canonical_candidate_id":"T2_R2_SHORT_THREAT_40_15_PRESERVE_DUE","evidence_candidate_id":"T2_R2_SHORT_THREAT_40_15_PRESERVE_DUE_REACTIVE","source_results_sha256":"aec7c2c40dd8c29b2d22d3ae70c62e2966ae067803bd673bcb841036b0227fd0","represented_combat_fights":61440,"recognition":{"identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"anticipation":{"hp_ratio_lte":0.4,"received_hit_ratio_gte":0.15,"natural_t1_priority":true},"semantics":{"consumes_monster_turn":false,"t1_magnitude_cooldown_unchanged":true,"preserve_due_canonical_technique":true},"paired_evidence":{"mean_delta_player_win_rate_pp":-2.5130208333333335,"global_gate_delta_player_win_rate_pp":-2.213541666666667,"contexts_t2_more_than_2pp_easier":0,"hrs_drop_over_8pp_contexts":0,"canonical_due_missed_with_t2_activation":0},"next_state":"READY_FOR_T3_RECALIBRATION"}},"pez_lunar":{"native_stage":"LianQi_III","t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"pez_lunar-b00-8a7474198a","source_results_sha256":"bcba2b003fa2d03d0447fb13bb0c45ccc85aa6f7a3de22115bbb94c1dda32c9f","stats":{"hp":42,"qi_max":null,"precision":90,"evasion":29,"defense":2,"tenacity":13,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+8"},"technique":{"name":"Mordida de Corriente","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":4,"direct_damage":"2d4+9"}}},"variance":{"base":{"source_candidate":"pez_lunar-b00-8a7474198a","hp":42,"defense":2,"evasion":29,"precision":90,"tenacity":13},"upper_envelope":{"source_axes":{"hp":"pez_lunar-b09-3ab2de73ee","defense":"pez_lunar-b11-b9b698a11a","evasion":"pez_lunar-b09-3ab2de73ee","precision":"pez_lunar-b09-3ab2de73ee","tenacity":"pez_lunar-b04-06d07824c6"},"hp":44,"defense":3,"evasion":32,"precision":98,"tenacity":25},"attacks":{"basic_damage":{"ladder":["1d2+8","1d4+9","1d5+9"],"sources":["pez_lunar-b00-8a7474198a","pez_lunar-b08-6da7bf1260","pez_lunar-b06-046b84b3cd"]},"technique_direct_damage":{"ladder":["2d4+9"],"sources":["pez_lunar-b00-8a7474198a"]}},"fixed_technique":{"name":"Mordida de Corriente","mechanics":["DIRECT_DAMAGE"],"cadence":4},"source_note":"Technique damage remains fixed; only measured CLEAN basic-damage variance is enabled offensively."},"historical_adaptive_anchor":{"status":"STALE_NUMERIC_AUTHORITY_ANCHOR_ONLY","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":20,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"pez_lunar__T1_0_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Mordida de Corriente","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}}},"anguila_estelar":{"native_stage":"LianQi_III","t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"anguila_estelar-b09-4f1d8e046c","source_results_sha256":"836f54456aade744b37c27dc04d171316bc637d24b17f7d3e3faa76c39605a14","stats":{"hp":37,"qi_max":null,"precision":92,"evasion":36,"defense":1,"tenacity":16,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d3+6"},"technique":{"name":"Mordida del Meridiano Azul","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params":{"cadence":4,"direct_damage":"2d6+9","qi_drain":6}}},"variance":{"base":{"source_candidate":"anguila_estelar-b09-4f1d8e046c","hp":37,"defense":1,"evasion":36,"precision":92,"tenacity":16},"upper_envelope":{"source_axes":{"hp":"anguila_estelar-b09-4f1d8e046c","defense":"anguila_estelar-b06-b4069c35a1","evasion":"anguila_estelar-b00-5d0b938a1d","precision":"anguila_estelar-b06-b4069c35a1","tenacity":"anguila_estelar-b09-4f1d8e046c"},"hp":37,"defense":3,"evasion":39,"precision":107,"tenacity":16},"attacks":{"basic_damage":{"ladder":["1d3+6","1d3+7","1d3+9"],"sources":["anguila_estelar-b09-4f1d8e046c","anguila_estelar-b00-5d0b938a1d","anguila_estelar-b06-b4069c35a1"]},"technique_direct_damage":{"ladder":["2d6+9"],"sources":["anguila_estelar-b09-4f1d8e046c"]}},"fixed_technique":{"name":"Mordida del Meridiano Azul","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"cadence":4,"qi_drain":6},"source_note":"HP and TEN remain fixed because no stronger CLEAN T0-compatible ceiling was measured; QI_DRAIN 6 is identity-fixed."},"historical_adaptive_anchor":{"status":"STALE_NUMERIC_AUTHORITY_ANCHOR_ONLY","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":35,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"anguila_estelar__T1_1_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Mordida del Meridiano Azul","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}}},"devorador_niebla":{"native_stage":"LianQi_IV","t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"devorador_niebla-b00-6f4bffd772","source_results_sha256":"bcba2b003fa2d03d0447fb13bb0c45ccc85aa6f7a3de22115bbb94c1dda32c9f","stats":{"hp":46,"qi_max":null,"precision":93,"evasion":28,"defense":2,"tenacity":14,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+9"},"technique":{"name":"Exhalación Vacía","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":4,"direct_damage":"3d4+8"}}},"variance":{"base":{"source_candidate":"devorador_niebla-b00-6f4bffd772","hp":46,"defense":2,"evasion":28,"precision":93,"tenacity":14},"upper_envelope":{"source_axes":{"hp":"devorador_niebla-b10-9f78bb9154","defense":"devorador_niebla-b09-a0b98e82bb","evasion":"devorador_niebla-b02-11f4b8fea7","precision":"devorador_niebla-b09-a0b98e82bb","tenacity":"devorador_niebla-b07-fcaae7da3a"},"hp":52,"defense":4,"evasion":42,"precision":107,"tenacity":26},"attacks":{"basic_damage":{"ladder":["1d2+9","1d3+9","1d4+9"],"sources":["devorador_niebla-b00-6f4bffd772","devorador_niebla-b01-1a19d77359","devorador_niebla-b10-9f78bb9154"]},"technique_direct_damage":{"ladder":["3d4+8"],"sources":["devorador_niebla-b00-6f4bffd772"]}},"fixed_technique":{"name":"Exhalación Vacía","mechanics":["DIRECT_DAMAGE"],"cadence":4},"source_note":"Technique damage remains fixed; survival/basic axes use CLEAN measured ceilings."},"historical_adaptive_anchor":{"status":"STALE_NUMERIC_AUTHORITY_ANCHOR_ONLY","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":20,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"devorador_niebla__T1_0_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Exhalación Vacía","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}}},"halcon_tormenta":{"native_stage":"LianQi_IV","t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"halcon_tormenta-b03-27f18b5b64","source_results_sha256":"836f54456aade744b37c27dc04d171316bc637d24b17f7d3e3faa76c39605a14","stats":{"hp":43,"qi_max":null,"precision":89,"evasion":30,"defense":2,"tenacity":22,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d3+6"},"technique":{"name":"Picado del Relámpago","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":3,"direct_damage":"3d6+8"}}},"variance":{"base":{"source_candidate":"halcon_tormenta-b03-27f18b5b64","hp":43,"defense":2,"evasion":30,"precision":89,"tenacity":22},"upper_envelope":{"source_axes":{"hp":"halcon_tormenta-b08-9110a266eb","defense":"halcon_tormenta-b04-91ab45bf6d","evasion":"halcon_tormenta-b09-75c2c800ba","precision":"halcon_tormenta-b05-8fe0e7e408","tenacity":"halcon_tormenta-b08-9110a266eb"},"hp":51,"defense":3,"evasion":52,"precision":110,"tenacity":31},"attacks":{"basic_damage":{"ladder":["1d3+6","1d2+7","1d3+7","1d2+8","1d3+8","1d2+9","1d3+9","1d4+9"],"sources":["halcon_tormenta-b03-27f18b5b64","halcon_tormenta-b01-eec52a9ca0","halcon_tormenta-b08-9110a266eb","halcon_tormenta-b00-7d59ea6c94","halcon_tormenta-b04-91ab45bf6d","halcon_tormenta-b02-9329dbc763","halcon_tormenta-b11-f3042d7dbb","halcon_tormenta-b07-0c4c6898a5"]},"technique_direct_damage":{"ladder":["3d6+8","2d10+9"],"sources":["halcon_tormenta-b03-27f18b5b64","halcon_tormenta-b01-eec52a9ca0"]}},"fixed_technique":{"name":"Picado del Relámpago","mechanics":["DIRECT_DAMAGE"],"cadence":3},"source_note":"CLEAN-only envelope; high EVA/PREC convergence was explicitly exercised with T4 in heavy validation."},"historical_adaptive_anchor":{"status":"STALE_NUMERIC_AUTHORITY_ANCHOR_ONLY","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":35,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"halcon_tormenta__T1_1_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Picado del Relámpago","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}}}}};
  const CANDIDATES={"schema":"A08_T1_T4_SHADOW_MATRIX_12_NEW_SPECIES_V01","status":"V95_V46_PROPOSALS_LAB_ONLY_NO_HUMAN_TIER_FREEZE","sources":["GRULLA_V95_LII_T34_8_ESPECIES_DATOS_Y_FUENTES_2026-10-12.zip::v95_lii_t34/v95_eight_v35.py","GRULLA_V96_LII_T3_T4_CIERRE_NUMERICO_LAB_2026-10-12.zip::GRULLA_V96_LII_T3_T4_CIERRE_NUMERICO_DE_LAB_2026-10-12.md","GRULLA_V96_LII_T3_T4_CIERRE_NUMERICO_LAB_2026-10-12.zip::V96_REPRO/v95_lii_t34/V66/sources/physical_source/SPECIES_T0_T4_MATRIX_V46.json","GRULLA_V67_SELECCION_T0_LIII_2026-10-10.json (GitHub mirrored)"],"scope":"REPEATABLE_ONLY","tiers":{"t2":{"memory_window":2,"same_category_effective":2,"anticipation_hp_ratio":0.4,"anticipation_heavy_hit_ratio":0.15},"t3":{"identity":"T2_CONFIRMED_T1_CAUSAL_BASIC_COUNTER","no_dot":true,"no_qi_drain":true,"no_control":true},"t4":{"identity":"FROZEN_EXISTING_TECHNIQUE_REUSE","canonical_due_before_t4":true,"no_global_stat_buff":true}},"species":{"jabali_pizarra":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.4,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":10,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"buho_niebla_gris":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.3,"cooldown_rounds":4,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":9,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"zorro_bancales":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.25,"cooldown_rounds":2,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":8,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"cangrejo_cauce":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"DEFENSE_UP","value":3,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":10,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"murcielago_resonante":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.3,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":9,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"arana_veta_sombria":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":4,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":10,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"garza_bruma_roca":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"EVADE_NEXT","value":8,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"cangrejo_laja_humeda":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"DEFENSE_UP","value":2,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"sanguijuela_remanso_turbio":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"salamandra_filtracion_tibia":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"rana_cascajo_barranco":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"DEFENSE_UP","value":2,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"carpa_lamina_reflejo":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"EVADE_NEXT","value":8,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}}}};
  const register={"schema_version":"arc1-monsters-v1","status":"NEW_ENGINE_ONLY","engine_contract":"NEW_COMBAT_STATS_V0_1","authority":{"numeric_contract":"docs/experimentos/CONTRATO_COMBATE_ESTADISTICAS_DOT_V0_1.md","universal_registry":"docs/experimentos/REGISTRO_UNIVERSAL_ESTADISTICAS_PROPIEDADES_COMBATE_V0_1.md","event_effect_contract":"docs/experimentos/CONTRATO_MOTOR_EVENTOS_EFECTOS_V0_1.md"},"rules":{"profile_count":18,"pending_profiles_must_not_run":true,"t0_required_before_adaptive_tiers":true,"definitives_in_monster_balance":false,"arc1_monster_resource_model":"NONE","arc1_monster_qi_semantics":"qi_max=null is authoritative N/A for Arc 1 monsters and does not block T0 READY","ready_profiles":["rata_qi","avispa_jade","serpiente_qi","mono_pildoras","lobo_espiritual","sapo_ceniza","escarabajo_hierro"],"li_t0_freeze":"T0_LI_EXHAUSTIVE_PASS_2026-10-06","adaptive_expected_bands":{"note":"Guidance only; not hard gates. Valid pressure may push a population beyond the expected band.","LianQi_I":"T0-T1 expected","LianQi_II":"T1-T2 expected","LianQi_III":"T2 expected/advanced overreach possible","LianQi_IV":"T3-T4 intended replayability/endgame"},"adaptive_overreach_policy":"ALLOWED_NATURAL_LIMIT_BY_COMBAT_AND_DECAY","lii_t0_freeze":"T0_LII_HUMAN_RATIFIED_2026-10-07","lii_t1_freeze":"T1_LII_REACTIVE_HUMAN_RATIFIED_2026-10-07","lii_t2_freeze":"T2_LII_RECOGNITION_HUMAN_RATIFIED_2026-10-07"},"profiles":{"rata_qi":{"id":"rata_qi","name":"rata de qi","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"secta_exterior","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":45,"qi_max":null,"precision":84,"evasion":0,"defense":2,"tenacity":0,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"2d4+3"},"technique":null,"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"serpiente_qi":{"id":"serpiente_qi","name":"serpiente de qi verdosa","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"bosques","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":57,"precision":94,"evasion":11,"defense":0,"tenacity":5,"basic_damage":"1d2+2","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Colmillos Venenosos","mechanics":["POISON_DOT"],"params_status":"READY","params":{"cadence":2,"poison":{"damage":"1d2+2","ticks":3}}},"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"lobo_espiritual":{"id":"lobo_espiritual","name":"lobo espiritual de tres colas","native_stage":"LianQi_I","native_stage_index":1,"role":"APEX_BRIDGE","region":"bosques","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":53,"precision":100,"evasion":12,"defense":1,"tenacity":20,"basic_damage":"2d4+2","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Emboscada de las Tres Colas","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":4,"direct_damage":"2d6+1"}},"ai":{"cognition":"CAZADOR_2","social":"MANADA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"eco_caido":{"id":"eco_caido","name":"Eco del Caído","native_stage":"LianQi_II","native_stage_index":2,"role":"ELITE","region":"cantera_vetas","element":null,"unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":null,"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"pez_lunar":{"id":"pez_lunar","name":"pez de luna sin ojos","native_stage":"LianQi_III","native_stage_index":3,"role":"NORMAL","region":"aguas_barrancos","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mordida de Corriente","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"sombra_ahogada":{"id":"sombra_ahogada","name":"sombra ahogada del estanque","native_stage":"LianQi_III","native_stage_index":3,"role":"ELITE","region":"aguas_barrancos","element":"agua","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Velo de Ahogo","mechanics":["POISON_DOT"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"centinela_pluma":{"id":"centinela_pluma","name":"centinela de plumas petrificadas","native_stage":"LianQi_IV","native_stage_index":4,"role":"BOSS","region":"alturas","element":"metal","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Aleteo de Cuchillas","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"devorador_niebla":{"id":"devorador_niebla","name":"devorador de niebla","native_stage":"LianQi_IV","native_stage_index":4,"role":"NORMAL","region":"alturas","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Exhalación Vacía","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"avispa_jade":{"id":"avispa_jade","name":"avispa de jade dentado","native_stage":"LianQi_I","native_stage_index":1,"role":"NORMAL","region":"bosques","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":42,"precision":102,"evasion":22,"defense":2,"tenacity":7,"basic_damage":"1d2+1","qi_max":null,"control":0,"crit_chance":5,"crit_damage":1.5},"technique":{"name":"Picadura de Esmeralda","mechanics":["POISON_DOT"],"params_status":"READY","params":{"cadence":2,"poison":{"damage":"1d3+2","ticks":2}}},"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"mono_pildoras":{"id":"mono_pildoras","name":"macaco ladrón de píldoras","native_stage":"LianQi_I","native_stage_index":1,"role":"SKIRMISHER","region":"bosques","element":null,"unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":59,"qi_max":null,"precision":91,"evasion":28,"defense":2,"tenacity":12,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Manotazo al Dantian","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"READY","params":{"cadence":2,"direct_damage":"1d2+3","qi_drain":6}},"ai":{"cognition":"CAZADOR_2","social":"OPORTUNISTA"},"adaptive":{"status":"READY_FOR_T1_RECALIBRATION","rule":"T0 frozen from exhaustive LI validation; T1 may now be calibrated. T2-T4 remain sequentially gated."},"resource_model":"NONE"},"sapo_ceniza":{"id":"sapo_ceniza","name":"sapo de ceniza caliente","native_stage":"LianQi_II","native_stage_index":2,"role":"NORMAL","region":"cantera_vetas","element":"fuego","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":55,"qi_max":null,"precision":98,"evasion":11,"defense":0,"tenacity":6,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+4","burn":{"damage":"1d2+2","ticks":3}}},"ai":{"cognition":"INSTINTIVO","social":"TERRITORIAL"},"adaptive":{"status":"READY_FOR_T3_RECALIBRATION","rule":"T0 LII frozen. T1 human-ratified as reactive MITIGATE_NEXT 60% / CD3 with natural trigger HP<=30% OR received hit>=20% maxHP. T2 human-ratified as recognition memory2/repeat2, EFECTIVA-only, anticipation HP<=40% OR received hit>=15% maxHP, natural T1 priority, no monster-turn cost, and canonical due preserved. T3 may now be recalibrated; T4 remains sequentially gated."},"resource_model":"NONE"},"sapo_caldera":{"id":"sapo_caldera","name":"Sapo Caldera de Tres Gargantas","native_stage":"LianQi_II","native_stage_index":2,"role":"BOSS","region":"cantera_vetas","element":"fuego","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Eructo del Horno Hundido","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"escarabajo_hierro":{"id":"escarabajo_hierro","name":"escarabajo de hierro espiritual","native_stage":"LianQi_II","native_stage_index":2,"role":"TANK","region":"cantera_vetas","element":"metal","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"READY","stats":{"hp":75,"qi_max":null,"precision":90,"evasion":14,"defense":2,"tenacity":24,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"params_status":"READY","params":{"cadence":3,"direct_damage":"1d2+8"}},"ai":{"cognition":"INSTINTIVO","social":"COLONIA"},"adaptive":{"status":"READY_FOR_T3_RECALIBRATION","rule":"T0 LII frozen. T1 human-ratified as reactive DEFENSE_UP +4 / CD3 with natural trigger HP<=30% OR received hit>=20% maxHP. T2 human-ratified as recognition memory2/repeat2, EFECTIVA-only, anticipation HP<=40% OR received hit>=15% maxHP, natural T1 priority, no monster-turn cost, and canonical due preserved. T3 may now be recalibrated; T4 remains sequentially gated."},"resource_model":"NONE"},"rey_escarabajo":{"id":"rey_escarabajo","name":"Rey Escarabajo de la Veta Negra","native_stage":"LianQi_II","native_stage_index":2,"role":"BOSS","region":"cantera_vetas","element":"metal","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mandíbula de Yunque","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"COLONIA"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"anguila_estelar":{"id":"anguila_estelar","name":"anguila de constelación rota","native_stage":"LianQi_III","native_stage_index":3,"role":"SKIRMISHER","region":"aguas_barrancos","element":"agua","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Mordida del Meridiano Azul","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"REACTIVO_1","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"guardian_coral":{"id":"guardian_coral","name":"guardián de coral memorioso","native_stage":"LianQi_III","native_stage_index":3,"role":"BOSS","region":"aguas_barrancos","element":"agua","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Marea de los Nombres Hundidos","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"TACTICO_3","social":"TERRITORIAL"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"halcon_tormenta":{"id":"halcon_tormenta","name":"halcón de tormenta joven","native_stage":"LianQi_IV","native_stage_index":4,"role":"SKIRMISHER","region":"alturas","element":"viento","unique":false,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Picado del Relámpago","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"CAZADOR_2","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"},"mantis_nube":{"id":"mantis_nube","name":"mantis de nube cortante","native_stage":"LianQi_IV","native_stage_index":4,"role":"BOSS","region":"alturas","element":"viento","unique":true,"engine_contract":"NEW_COMBAT_STATS_V0_1","stats_status":"PENDING_INTEGRAL_REBALANCE","stats":{"hp":null,"qi_max":null,"precision":null,"evasion":null,"defense":null,"tenacity":null,"control":null,"crit_chance":5,"crit_damage":1.5,"basic_damage":null},"technique":{"name":"Tijera del Horizonte","mechanics":["DIRECT_DAMAGE"],"params_status":"PENDING_INTEGRAL_REBALANCE","params":null},"ai":{"cognition":"MASTER_4","social":"SOLITARIO"},"adaptive":{"status":"BLOCKED_UNTIL_T0_READY","rule":"T1-T4 are applied only after this T0 profile is READY."},"resource_model":"NONE"}}}.profiles;
  const LI$1=Object.freeze(['rata_qi','serpiente_qi','avispa_jade','mono_pildoras','lobo_espiritual']);
  const EXTERNAL=Object.freeze(['sapo_ceniza','escarabajo_hierro','pez_lunar','anguila_estelar']);
  const NEW_IDS=Object.freeze(Object.keys(CANDIDATES.species));
  if(HISTORY.status!=='ADAPTIVE_CHAINS_T0_T4_HUMAN_RATIFIED_CLOSED'||
   CANDIDATES.status!=='V95_V46_PROPOSALS_LAB_ONLY_NO_HUMAN_TIER_FREEZE'||
   NEW_IDS.length!==12||Object.keys(register).length!==18)
   throw Error('A08_ARSENAL_SOURCE_STATUS_DRIFT');
  const MAX=4;const ti=t=>Number(t.slice(1));
  function ensureNumber(x,name){if(typeof x!=='number'||!Number.isFinite(x)||x<0)throw Error(name);}
  function validateHist(h){
   if(!Array.isArray(h))throw Error('INVALID_ECOLOGICAL_HISTORY');
   const categories=new Set(['PLAYER_BASIC','PLAYER_UNITARGET_TECHNIQUE','PLAYER_AOE_TECHNIQUE','PLAYER_DEFENSIVE_TECHNIQUE']);
   for(const o of h){if(!o||!categories.has(o.category)||!['EFECTIVA','FALLIDA'].includes(o.result))throw Error('INVALID_RESOLVED_EVENT');}
  }
  const ARSENAL_ROSTER=Object.freeze([...LI$1,...EXTERNAL,...NEW_IDS]);
  if(new Set(ARSENAL_ROSTER).size!==21)throw Error('A08_21_ROSTER_DRIFT');
  function authority(id){
   const a=a08Assignment(id);
   if(LI$1.includes(id))return Object.freeze({id,stage:a.stage,status:'HUMAN_RATIFIED_LI_T0_T4',ratified:true,
    t0:register[id],t1:null,t4:null,precedence:'LI_T1_TURN>CANONICAL_DUE>T4>BASIC'});
   if(EXTERNAL.includes(id)){
    const k=HISTORY.species[id];
    if(!k||['t0','t1','t2','t3','t4'].some(t=>k[t]?.status!=='READY_HUMAN_RATIFIED'))throw Error('HISTORIC_TIER_NOT_RATIFIED');
    if(newer.species[id]?.t0?.stats?.basic_damage!==k.t0.stats.basic_damage)throw Error('HISTORIC_T0_NUMERIC_CONFLICT');
    const updated=['sapo_ceniza','escarabajo_hierro'].includes(id)?newer.species[id]:null;
    const t1=updated?updated.t1.ability:k.t1.ability;
    const sourceStats=updated?updated.t0:k.t0;
    return Object.freeze({id,stage:a.stage,status:'HUMAN_RATIFIED_SIX_HISTORIC_T0_T4',
     ratified:true,t0:sourceStats,t1,
     t1_signal:updated?updated.t1.signals:k.t1.signals,
     t4:k.t4,precedence:'T1_REACTIVE_AND_T3_COUNTER>CANONICAL_DUE>T4>BASIC'});
   }
   const candidate=CANDIDATES.species[id];
   if(!candidate)throw Error('A08_UNKNOWN_REPEATABLE');
   const src=sourceFor(id);
   if(candidate.stage!==src.stage||candidate.human_ratified!==false||src.adaptiveAllowed!==false)
    throw Error('A08_NEW_SOURCE_AUTHORITY_MISMATCH');
   return Object.freeze({id,stage:a.stage,status:'EXPERIMENTAL_T1_T4_SHADOW_NOT_RATIFIED',
    ratified:false,t0:src.source,t1:candidate.t1,t1_signal:{self_low_hp_ratio:.3,heavy_hit_ratio:.2},
    t4:candidate.t4,precedence:'T1_REACTIVE_AND_T3_COUNTER>CANONICAL_DUE>T4>BASIC'});
  }
  function planAdaptive(input){
   if(!input||!/^T[0-4]$/.test(input.tier))throw Error('TIER_INVALID_OR_T5');
   const auth=authority(input.id),lvl=ti(input.tier);
   if(!auth.ratified&&input.mode!=='SHADOW_UNRATIFIED_EXPLICIT')throw Error('UNRATIFIED_SHADOW_MODE_REQUIRED');
   if(!Number.isSafeInteger(input.round)||input.round<1)throw Error('INVALID_ROUND');
   if(!Number.isSafeInteger(input.survivalCooldown)||input.survivalCooldown<0)throw Error('INVALID_SURVIVAL_CD');
   if(!Number.isSafeInteger(input.nextT4Round)||input.nextT4Round<1)throw Error('INVALID_T4_READY');
   for(const name of ['selfHpRatio','playerHpRatio','lastReceivedHitRatio'])ensureNumber(input[name],name);
   if(input.selfHpRatio>1||input.playerHpRatio>1)throw Error('HP_RATIO_TOO_LARGE');
   validateHist(input.history);
   if(LI$1.includes(input.id)){
    const p=adaptiveKit({...input});
    return Object.freeze({...p,ratified:true,authorityStatus:auth.status,stage:auth.stage});
   }
   const record=auth.t0;
   const technique=auth.ratified?record.technique:
     auth.stage==='LianQi_II'?record.technique:
       {params:{cadence:record.technique.cadence}};
   const cadence=technique.params?.cadence;
   if(!Number.isSafeInteger(cadence)||cadence<2)throw Error('SOURCE_CADENCE_INVALID');
   const h=input.history.slice(-2);
   const recognized=lvl>=2&&h.length===2&&h.every(v=>v.result==='EFECTIVA')&&
    h[0].category===h[1].category?h[0].category:null;
   const priorHits=input.lastReceivedHitRatio;
   const threshold=auth.t1_signal;
   const natural=input.selfHpRatio<=threshold.self_low_hp_ratio||priorHits>=threshold.heavy_hit_ratio;
   const anticipation=lvl>=2&&recognized!==null&&
     input.currentPlayerCategory===recognized&&
     (input.selfHpRatio<=.4||priorHits>=.15);
   const newT1=lvl>=1&&!input.survivalActive&&input.survivalCooldown===0&&
     (natural||anticipation);
   const skip=Boolean(input.skipNextAction);
   const due=(input.round%cadence===0);
   const t4=lvl===4&&!skip&&!due&&input.round>=input.nextT4Round;
   const regular=skip?'SKIPPED':due?'CANONICAL_TECHNIQUE':t4?'MATURE_T4':'BASIC';
   const cd=auth.t4?.cooldown_rounds;
   if(!Number.isInteger(cd)||cd<=0)throw Error('T4_COOLDOWN_NOT_SOURCE_DEFINED');
   return Object.freeze({
    id:input.id,stage:auth.stage,tier:input.tier,round:input.round,
    regular,reactiveT1:newT1,liSurvivalT1:false,survivalSpec:lvl>=1?auth.t1:null,
    prediction:recognized,recognitionActive:recognized!==null,
    T3Available:lvl>=3,T4Available:t4,canonicalTechniqueDue:due,
    cooldownT4:t4?cd:null,
    status:auth.status,ratified:auth.ratified,
    futureT4Ready:t4?input.round+cd:input.nextT4Round,
    requiresProofForT3:true,
    sourceCognition:a08Assignment(input.id).cognitive
   });
  }
  /** Only resolved causal evidence can trigger an ecological counter. */
  function counterAfterResolved(id,tier,proof,{mode}={}){
   const a=authority(id);
   if(!/^T[0-4]$/.test(tier))throw Error('INVALID_TIER');
   if(!a.ratified&&mode!=='SHADOW_UNRATIFIED_EXPLICIT')throw Error('UNRATIFIED_SHADOW_MODE_REQUIRED');
   if(LI$1.includes(id))return t3AfterResolvedHit({id,tier,resolved:proof});
   if(ti(tier)<3)return {counter:false,reason:'T3_NOT_ENABLED'};
   if(!proof||typeof proof!=='object'||!['PLAYER_BASIC','PLAYER_UNITARGET_TECHNIQUE','PLAYER_AOE_TECHNIQUE'].includes(proof.category))
    throw Error('UNRESOLVED_OFFENSIVE_EVIDENCE');
   for(const k of ['t1ActiveOnHit','predictionConfirmed','naturalWouldHit','boostedWouldHit'])
    if(typeof proof[k]!=='boolean')throw Error('INVALID_CAUSAL_EVIDENCE');
   ensureNumber(proof.defensePreventedByT1,'INVALID_DEFENSE_DELTA');
   const kind=a.t1.kind;
   const causal=kind==='EVADE_NEXT'?(proof.naturalWouldHit&&!proof.boostedWouldHit):
    (proof.naturalWouldHit&&proof.boostedWouldHit&&proof.defensePreventedByT1>0);
   return Object.freeze({counter:Boolean(proof.t1ActiveOnHit&&proof.predictionConfirmed&&causal),
    sourceKind:kind,packet:'INSTANCE_T0_BASIC',noDot:true,noQiDrain:true,
    status:a.status});
  }
  for(const id of ARSENAL_ROSTER)authority(id);

  /**
   * ASTRA / A08: public integration facade for all 21 repeatable monsters, LI–LIII.
   * READ-ONLY, NOT an HTML or population/runtime adapter. No damage resolution.
   *
   * Mechanics authority and experimental mode are enforced by the existing
   * a08-all-tiers-bridge; this facade translates them into a stable contract
   * suitable for an eventual Event Bus adapter authored by Astra.
   */
  const audit={"schema":"GRULLA_A08_21_MONSTERS_T1_T4_E1_CONNECTION_STATUS_V01","date":"2026-10-13","authority_source_head":"45c3a9c240ea74208a0d8fd4d5be187bc817df35","status":"ALL_21_CONNECTED_TO_EXPERIMENTAL_E1__12_TIER_DESIGNS_UNRATIFIED","QA":{"ci":"https://github.com/Shein25/La-Grulla-Blanca/actions/runs/38494781902","li_current_5_full_in_existing_suite":"372 fights LI five T0-T4 plus LII two T0-T2","lii_liii_extended_fights":1600,"per_extended_species":100,"extended_t0_exact_regressions":320,"extended_t1_events":1698,"extended_t2_anticipations":612,"extended_t3_proofs_eligible":391,"extended_t3_resolved":385,"extended_t3_terminal_cancellations":6,"extended_t4_executions":381},"source_integrity":{"v95_zip_sha256":"3c3368b0beed414983f8b648e8f84d53937a773ab3ae7c9c6fd7c920be07b257","v96_zip_sha256":"54e3023ff6b304ba897c544927627ec97c26e7b88e2f7129de83104d575320bf","v95_six_candidates_py_sha256":"eabdf20e65e168e8266b3c44132d1e91c856bd63ce89a680d5270ca6cf68459d","v46_tier_proposals_sha256":"0f4ffe96aded4a84638ba8adf5da25d9522d7735a0ffad72500dbdbef9d6f1f9"},"gates":{"productionRuntime":false,"eventBusParity":false,"populationUnlock":false,"fullV47HistoricalParity":false,"mutantSuffixes":false,"originalCognitionT0Preserved":true,"noMain":true,"noHtml":true,"noNewStatsFromTier":true},"species":[{"id":"rata_qi","stage":"LianQi_I","cognitiveBase":"INSTINTIVO","social":"COLONIA","role":"NORMAL","status":"HUMAN_RATIFIED_LI_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_LI_T0_T4","T1":"HUMAN_RATIFIED_LI_T0_T4","T2":"HUMAN_RATIFIED_LI_T0_T4","T3":"HUMAN_RATIFIED_LI_T0_T4","T4":"HUMAN_RATIFIED_LI_T0_T4"},"t1Mode":"TURN_COST_FROZEN","t1":null,"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":true,"numericGate":"READY_E1","requiresHumanTierRatification":false,"actionPriority":"SURVIVAL_TURN>CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"serpiente_qi","stage":"LianQi_I","cognitiveBase":"REACTIVO_1","social":"SOLITARIO","role":"NORMAL","status":"HUMAN_RATIFIED_LI_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_LI_T0_T4","T1":"HUMAN_RATIFIED_LI_T0_T4","T2":"HUMAN_RATIFIED_LI_T0_T4","T3":"HUMAN_RATIFIED_LI_T0_T4","T4":"HUMAN_RATIFIED_LI_T0_T4"},"t1Mode":"TURN_COST_FROZEN","t1":null,"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":true,"numericGate":"READY_E1","requiresHumanTierRatification":false,"actionPriority":"SURVIVAL_TURN>CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"lobo_espiritual","stage":"LianQi_I","cognitiveBase":"CAZADOR_2","social":"MANADA","role":"APEX_BRIDGE","status":"HUMAN_RATIFIED_LI_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_LI_T0_T4","T1":"HUMAN_RATIFIED_LI_T0_T4","T2":"HUMAN_RATIFIED_LI_T0_T4","T3":"HUMAN_RATIFIED_LI_T0_T4","T4":"HUMAN_RATIFIED_LI_T0_T4"},"t1Mode":"TURN_COST_FROZEN","t1":null,"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":true,"numericGate":"READY_E1","requiresHumanTierRatification":false,"actionPriority":"SURVIVAL_TURN>CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"pez_lunar","stage":"LianQi_III","cognitiveBase":"CAZADOR_2","social":"SOLITARIO","role":"NORMAL","status":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T1":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T2":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T3":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T4":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":20,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"pez_lunar__T1_0_EVADE_NEXT"},"t4Cooldown":5,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"HISTORICAL_SCHEMA_CONFLICT_NO_E1","requiresHumanTierRatification":false,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"avispa_jade","stage":"LianQi_I","cognitiveBase":"INSTINTIVO","social":"COLONIA","role":"NORMAL","status":"HUMAN_RATIFIED_LI_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_LI_T0_T4","T1":"HUMAN_RATIFIED_LI_T0_T4","T2":"HUMAN_RATIFIED_LI_T0_T4","T3":"HUMAN_RATIFIED_LI_T0_T4","T4":"HUMAN_RATIFIED_LI_T0_T4"},"t1Mode":"TURN_COST_FROZEN","t1":null,"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":true,"numericGate":"READY_E1","requiresHumanTierRatification":false,"actionPriority":"SURVIVAL_TURN>CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"mono_pildoras","stage":"LianQi_I","cognitiveBase":"CAZADOR_2","social":"OPORTUNISTA","role":"SKIRMISHER","status":"HUMAN_RATIFIED_LI_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_LI_T0_T4","T1":"HUMAN_RATIFIED_LI_T0_T4","T2":"HUMAN_RATIFIED_LI_T0_T4","T3":"HUMAN_RATIFIED_LI_T0_T4","T4":"HUMAN_RATIFIED_LI_T0_T4"},"t1Mode":"TURN_COST_FROZEN","t1":null,"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":true,"numericGate":"READY_E1","requiresHumanTierRatification":false,"actionPriority":"SURVIVAL_TURN>CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"sapo_ceniza","stage":"LianQi_II","cognitiveBase":"INSTINTIVO","social":"TERRITORIAL","role":"NORMAL","status":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T1":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T2":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T3":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T4":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"MITIGATE_NEXT","damage_reduction_pct":10,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t4Cooldown":12,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":true,"numericGate":"READY_E1","requiresHumanTierRatification":false,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"escarabajo_hierro","stage":"LianQi_II","cognitiveBase":"INSTINTIVO","social":"COLONIA","role":"TANK","status":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T1":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T2":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T3":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T4":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"DEFENSE_UP","defense_bonus":2,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t4Cooldown":8,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":true,"numericGate":"READY_E1","requiresHumanTierRatification":false,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"anguila_estelar","stage":"LianQi_III","cognitiveBase":"REACTIVO_1","social":"SOLITARIO","role":"SKIRMISHER","status":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","tiers":{"T0":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T1":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T2":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T3":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4","T4":"HUMAN_RATIFIED_HISTORIC_SIX_T0_T4"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":35,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"anguila_estelar__T1_1_EVADE_NEXT"},"t4Cooldown":5,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"HISTORICAL_SCHEMA_CONFLICT_NO_E1","requiresHumanTierRatification":false,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"jabali_pizarra","stage":"LianQi_II","cognitiveBase":"REACTIVO_1","social":"TERRITORIAL","role":"BRUISER","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"MITIGATE_NEXT","value":0.4,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":10,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"buho_niebla_gris","stage":"LianQi_II","cognitiveBase":"CAZADOR_2","social":"SOLITARIO","role":"PRECISION","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"MITIGATE_NEXT","value":0.3,"cooldown_rounds":4,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":9,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"zorro_bancales","stage":"LianQi_II","cognitiveBase":"CAZADOR_2","social":"SOLITARIO","role":"SKIRMISHER","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"MITIGATE_NEXT","value":0.25,"cooldown_rounds":2,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":8,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"cangrejo_cauce","stage":"LianQi_II","cognitiveBase":"REACTIVO_1","social":"TERRITORIAL","role":"GUARDIAN","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"DEFENSE_UP","value":3,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":10,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"murcielago_resonante","stage":"LianQi_II","cognitiveBase":"TACTICO_3","social":"SOLITARIO","role":"DISRUPTOR","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"MITIGATE_NEXT","value":0.3,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":9,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"arana_veta_sombria","stage":"LianQi_II","cognitiveBase":"REACTIVO_1","social":"TERRITORIAL","role":"AFFLICTOR","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":4,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":10,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"RATIFIED_NUMERIC_DESIGN_RUNTIME_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"garza_bruma_roca","stage":"LianQi_III","cognitiveBase":"CAZADOR_2","social":"SOLITARIO","role":"NORMAL","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"EVADE_NEXT","value":8,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"cangrejo_laja_humeda","stage":"LianQi_III","cognitiveBase":"REACTIVO_1","social":"TERRITORIAL","role":"NORMAL","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"DEFENSE_UP","value":2,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"sanguijuela_remanso_turbio","stage":"LianQi_III","cognitiveBase":"REACTIVO_1","social":"SOLITARIO","role":"NORMAL","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"salamandra_filtracion_tibia","stage":"LianQi_III","cognitiveBase":"INSTINTIVO","social":"TERRITORIAL","role":"NORMAL","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"rana_cascajo_barranco","stage":"LianQi_III","cognitiveBase":"CAZADOR_2","social":"SOLITARIO","role":"NORMAL","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"DEFENSE_UP","value":2,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"},{"id":"carpa_lamina_reflejo","stage":"LianQi_III","cognitiveBase":"REACTIVO_1","social":"SOLITARIO","role":"NORMAL","status":"EXPERIMENTAL_ONLY_NOT_RATIFIED","tiers":{"T0":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T1":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T2":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T3":"EXPERIMENTAL_ONLY_NOT_RATIFIED","T4":"EXPERIMENTAL_ONLY_NOT_RATIFIED"},"t1Mode":"REACTION_NOT_MONSTER_TURN","t1":{"kind":"EVADE_NEXT","value":8,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4Cooldown":7,"physicalE1_20261013":"EXPERIMENTAL_FULL_FIGHT_PASS","productionReady":false,"numericGate":"DESIGN_SELECTED_T0_SOURCE_PARITY_PENDING","requiresHumanTierRatification":true,"actionPriority":"REACTIVE_T1+CAUSAL_T3;CANONICAL_TECHNIQUE>T4>BASIC"}]};
  const oldSix={"schema_version":"monster-adaptive-six-v0.1","status":"ADAPTIVE_CHAINS_T0_T4_HUMAN_RATIFIED_CLOSED","ratified_on":"2026-10-01","source_branch":"experiment/parallel-balance-npc-equipment-v0.1","source_head":"c7b87b84a80e0a42e20eec7574f860123685c782","evidence":{"heavy_result_sha256":"37218486409b05e336c8dc0a3ee8561614384322813f161a8baef7b5470f91fa","heavy_fights":243000,"sapo_escarabajo_refinement":{"fights":40500,"workflow_run_id":36940041359,"artifact_sha256":"7a86b7fdda970d7564b7e8cc5fb68611121c4a43c7a55f43adab81f61f35d60d"},"paired_t0_policy_baseline":{"fights":12000,"workflow_run_id":36940260810,"artifact_sha256":"22947941d32223a97ec4cf9371ae566b479b670871b595fdefe884caaf3bf20e"}},"methodology":{"target_win_rate_objective":false,"paired_t0_relative_review":true,"hard_guards":{"timeout_rate_max":0.02,"root_or_loadout_or_policy_polarization_max":0.75,"identity_must_express":true},"review_rule":"The 50 pp spread marker is diagnostic, not an automatic adaptive-tier failure when the paired T0 already exhibits the same policy/loadout/root sensitivity. Compare the tier delta against matched T0 and reject material multi-axis worsening.","no_hidden_player_build_inspection":true,"no_future_rng":true},"species":{"sapo_ceniza":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"sapo_ceniza-b01-cf7f63c920","source_results_sha256":"7851366c9b61f899b913a7e7e6a6f1f7bad96fe23f10a14af7dffb81015527a4","stats":{"hp":49,"qi_max":null,"precision":97,"evasion":11,"defense":0,"tenacity":5,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+5"},"technique":{"name":"Nube de Hollín","mechanics":["DIRECT_DAMAGE","BURN_DOT"],"params":{"cadence":3,"direct_damage":"1d2+4","burn":{"damage":"1d2+2","ticks":3}}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"MITIGATE_NEXT","damage_reduction_pct":10,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_CONNECTED_WITH_T1_MITIGATION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Nube de Hollín","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":12,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"escarabajo_hierro":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"escarabajo_hierro-m14-6996f62d4a","source_results_sha256":"d5cc200a85c41014db8fea00fcc442996865718b89a9a4d2090c12fff81fd923","stats":{"hp":75,"qi_max":null,"precision":90,"evasion":14,"defense":2,"tenacity":24,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+3"},"technique":{"name":"Carga de Caparazón","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":3,"direct_damage":"1d2+8"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"DEFENSE_UP","defense_bonus":2,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source":"REFINEMENT_SAPO_ESCARABAJO_T1_T4_V01"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_CONNECTED_AND_T1_DEFENSE_PREVENTED_DAMAGE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Carga de Caparazón","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":8,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"pez_lunar":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"pez_lunar-b00-8a7474198a","source_results_sha256":"bcba2b003fa2d03d0447fb13bb0c45ccc85aa6f7a3de22115bbb94c1dda32c9f","stats":{"hp":42,"qi_max":null,"precision":90,"evasion":29,"defense":2,"tenacity":13,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+8"},"technique":{"name":"Mordida de Corriente","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":4,"direct_damage":"2d4+9"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":20,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"pez_lunar__T1_0_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Mordida de Corriente","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"anguila_estelar":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"anguila_estelar-b09-4f1d8e046c","source_results_sha256":"836f54456aade744b37c27dc04d171316bc637d24b17f7d3e3faa76c39605a14","stats":{"hp":37,"qi_max":null,"precision":92,"evasion":36,"defense":1,"tenacity":16,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d3+6"},"technique":{"name":"Mordida del Meridiano Azul","mechanics":["DIRECT_DAMAGE","QI_DRAIN"],"params":{"cadence":4,"direct_damage":"2d6+9","qi_drain":6}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":35,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"anguila_estelar__T1_1_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Mordida del Meridiano Azul","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"devorador_niebla":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"devorador_niebla-b00-6f4bffd772","source_results_sha256":"bcba2b003fa2d03d0447fb13bb0c45ccc85aa6f7a3de22115bbb94c1dda32c9f","stats":{"hp":46,"qi_max":null,"precision":93,"evasion":28,"defense":2,"tenacity":14,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d2+9"},"technique":{"name":"Exhalación Vacía","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":4,"direct_damage":"3d4+8"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":20,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"devorador_niebla__T1_0_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Exhalación Vacía","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}},"halcon_tormenta":{"t0":{"status":"READY_HUMAN_RATIFIED","source_candidate":"halcon_tormenta-b03-27f18b5b64","source_results_sha256":"836f54456aade744b37c27dc04d171316bc637d24b17f7d3e3faa76c39605a14","stats":{"hp":43,"qi_max":null,"precision":89,"evasion":30,"defense":2,"tenacity":22,"control":0,"crit_chance":5,"crit_damage":1.5,"basic_damage":"1d3+6"},"technique":{"name":"Picado del Relámpago","mechanics":["DIRECT_DAMAGE"],"params":{"cadence":3,"direct_damage":"3d6+8"}}},"t1":{"status":"READY_HUMAN_RATIFIED","ability":{"kind":"EVADE_NEXT","evasion_bonus":35,"cooldown_rounds":5},"signals":{"self_low_hp_ratio":0.35,"heavy_hit_ratio":0.2},"source_arm":"halcon_tormenta__T1_1_EVADE_NEXT"},"t2":{"status":"READY_HUMAN_RATIFIED","identity":"RECOGNITION","memory_window":2,"repeated_same_category_required":2,"count_results":["EFECTIVA"],"observable_categories":["PLAYER_BASIC","PLAYER_UNITARGET_TECHNIQUE","PLAYER_AOE_TECHNIQUE","PLAYER_DEFENSIVE_TECHNIQUE"],"hidden_root_or_build_inspection":false,"future_rng_inspection":false},"t3":{"status":"READY_HUMAN_RATIFIED","identity":"SPECIES_COUNTER","trigger":{"label":"CONFIRMED_PATTERN_T1_CAUSAL_INTERACTION","requires_t2_recognition_active":true,"requires_prediction_confirmed":true,"requires_t1_active":true,"offensive_player_action_required":true,"causal_rule":"PLAYER_ATTACK_MISS_WITH_T1_EVASION_ACTIVE"},"damage":{"mode":"INSTANCE_T0_BASIC","source":"resolved individual T0 basic_damage","direct_damage_pipeline":true},"guards":{"no_qi_drain":true,"no_dot":true,"no_control":true,"no_hidden_player_build_inspection":true,"no_artificial_once_per_fight_limit":true}},"t4":{"status":"READY_HUMAN_RATIFIED","identity":"EXISTING_T0_TECHNIQUE_REUSE","technique_name":"Picado del Relámpago","activation":"REPLACE_NORMAL_MONSTER_TURN_WHEN_READY_AND_T1_NOT_SELECTED","cooldown_rounds":5,"params_source":"FROZEN_T0_TECHNIQUE","numeric_buff":false,"direct_damage_pipeline":true,"guards":{"t0_technique_numbers_frozen":true,"no_new_mechanic_family":true,"no_t5":true}}}},"guards":{"unique_species_excluded":true,"rata_chain_unchanged":true,"no_t5":true,"no_automatic_reopen":true,"no_canonical_numeric_change_without_explicit_human_reopen":true}};
  const newTiers={"schema":"A08_T1_T4_SHADOW_MATRIX_12_NEW_SPECIES_V01","status":"V95_V46_PROPOSALS_LAB_ONLY_NO_HUMAN_TIER_FREEZE","sources":["GRULLA_V95_LII_T34_8_ESPECIES_DATOS_Y_FUENTES_2026-10-12.zip::v95_lii_t34/v95_eight_v35.py","GRULLA_V96_LII_T3_T4_CIERRE_NUMERICO_LAB_2026-10-12.zip::GRULLA_V96_LII_T3_T4_CIERRE_NUMERICO_DE_LAB_2026-10-12.md","GRULLA_V96_LII_T3_T4_CIERRE_NUMERICO_LAB_2026-10-12.zip::V96_REPRO/v95_lii_t34/V66/sources/physical_source/SPECIES_T0_T4_MATRIX_V46.json","GRULLA_V67_SELECCION_T0_LIII_2026-10-10.json (GitHub mirrored)"],"scope":"REPEATABLE_ONLY","tiers":{"t2":{"memory_window":2,"same_category_effective":2,"anticipation_hp_ratio":0.4,"anticipation_heavy_hit_ratio":0.15},"t3":{"identity":"T2_CONFIRMED_T1_CAUSAL_BASIC_COUNTER","no_dot":true,"no_qi_drain":true,"no_control":true},"t4":{"identity":"FROZEN_EXISTING_TECHNIQUE_REUSE","canonical_due_before_t4":true,"no_global_stat_buff":true}},"species":{"jabali_pizarra":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.4,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":10,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"buho_niebla_gris":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.3,"cooldown_rounds":4,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":9,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"zorro_bancales":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.25,"cooldown_rounds":2,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":8,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"cangrejo_cauce":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"DEFENSE_UP","value":3,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":10,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"murcielago_resonante":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.3,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":9,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"arana_veta_sombria":{"stage":"LianQi_II","provenance":"V95 proposal; T0 only V35 approved","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":4,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":10,"status":"EXPERIMENTAL_V95_CD_NOT_APPROVED"}},"garza_bruma_roca":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"EVADE_NEXT","value":8,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"cangrejo_laja_humeda":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"DEFENSE_UP","value":2,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"sanguijuela_remanso_turbio":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"salamandra_filtracion_tibia":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"MITIGATE_NEXT","value":0.35,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"rana_cascajo_barranco":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"DEFENSE_UP","value":2,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}},"carpa_lamina_reflejo":{"stage":"LianQi_III","provenance":"V46 mechanical proposal matched to V67 chosen T0 profile; NOT authority for numbers","human_ratified":false,"t1":{"kind":"EVADE_NEXT","value":8,"cooldown_rounds":3,"consumes_monster_turn":false,"activation":"REACTIVE"},"t4":{"cooldown_rounds":7,"status":"EXPERIMENTAL_V46_CD_NOT_APPROVED"}}}};
  const liT4={"schema_version":"li-t4-mature-adaptation-v1.0","status":"HUMAN_RATIFIED_FROZEN","frozen_on":"2026-10-06","authority":{"t0":"T0_LI_EXHAUSTIVE_PASS_2026-10-06","t1":"T1_LI_FINAL_FREEZE_2026-10-06","t2":"T2_LI_FINAL_FREEZE_2026-10-06","t3":"T3_LI_FINAL_FREEZE_2026-10-06","mutant_suffix":"MUTANT_SUFFIX_CONTRACT_V1","final_gate":"LI_MONSTER_T4_FINAL_DUAL_STAGE_GATE_V03","review_sha256":"b5ca5163b3c099820c7d85b1ba039994956b4e30e5650aaf0d3e697a87b88eee","represented_combat_fights":294400},"tier":{"name":"T4","semantic":"ADAPTACION_MADURA","second_species_response":true,"highest_tier":true,"t5_exists":false},"common_activation":{"rule":"REPLACE_BASIC_WHEN_READY","cooldown_rounds":7,"priority":["T1_SURVIVAL","CANONICAL_TECHNIQUE_DUE","T4_IF_READY","BASIC"],"only_replaces_real_basic":true,"decay_below_t4_disables":true,"survival_displacement_forbidden":true,"due_technique_displacement_forbidden":true},"species":{"rata_qi":{"name":"Mordisco Frenetico","arm":"R4A_HISTORIC_CANONICAL_HALF_CD7","identity":"PHYSICAL_INSTINCTIVE_MULTI_HIT","opening":{"source":"INSTANCE_BASIC","scalar":1,"precision":"INDEPENDENT_ROLL","critical":"NORMAL_INDEPENDENT_CRIT"},"followup":{"source":"CANONICAL_T0_BASIC_2D4","scalar":0.5,"precision":"INDEPENDENT_ROLL","critical":"NORMAL_INDEPENDENT_CRIT"},"packet_pipeline":"NORMAL_DIRECT_DAMAGE_PER_PACKET"},"serpiente_qi":{"arm":"S4A_BASIC_POISON_ON_OPEN_HIT_CD7","identity":"SUSTAINED_POISON_PRESSURE","opening":"INSTANCE_BASIC","followup_on_opening_hit":"ONE_IMMEDIATE_INSTANCE_POISON_TICK","adds_poison_duration":false},"avispa_jade":{"arm":"A4A_BASIC_POISON_ON_OPEN_HIT_CD7","identity":"MOBILITY_STING_POISON","opening":"INSTANCE_BASIC","followup_on_opening_hit":"ONE_IMMEDIATE_INSTANCE_POISON_TICK","adds_poison_duration":false},"mono_pildoras":{"arm":"M4B_MANOTAZO_REPLACE_CD7","identity":"DANTIAN_QI_PRESSURE","packet":"INSTANCE_MANOTAZO_DIRECT_DAMAGE","qi_drain_on_hit":6,"consumes_canonical_technique_cadence":false},"lobo_espiritual":{"arm":"L4A_EMBOSCADA_REPLACE_CD7","identity":"APEX_EMBOSCADA_PRESSURE","packet":"INSTANCE_EMBOSCADA_DIRECT_DAMAGE","consumes_canonical_technique_cadence":false}},"frozen_interactions":{"t3_must_remain_causal":true,"acechante_precision_bonus":"+20 PREC to next monster attack only","individual_variance_before_adaptation":true,"mutant_does_not_grant_tier":true,"no_universal_stat_scaling":true},"forbidden":["Definitivas","root/build inspection","future RNG inspection","universal tier stat scaling","new persistent timers","T5"],"guards":{"no_runtime_canonical_activation":true,"no_t5":true,"no_win_rate_target":true,"t3_false_counter_rate_must_be_zero":true,"acechante_precision_drift_must_be_zero":true,"no_degenerate_loops":true}};
  const sourceByID=new Map(audit.species.map(x=>[x.id,x]));
  const LI=new Set(['rata_qi','serpiente_qi','avispa_jade','mono_pildoras','lobo_espiritual']);
  const SIX=new Set(['sapo_ceniza','escarabajo_hierro','pez_lunar','anguila_estelar']);
  const CATEGORIES=new Set(['PLAYER_BASIC','PLAYER_UNITARGET_TECHNIQUE','PLAYER_AOE_TECHNIQUE','PLAYER_DEFENSIVE_TECHNIQUE']);
  const ACTIONS=new Set(['SKIPPED','SURVIVAL_T1','CANONICAL_TECHNIQUE','MATURE_T4','BASIC']);
  const SHADOW='SHADOW_UNRATIFIED_EXPLICIT';
  const jsonClone=x=>JSON.parse(JSON.stringify(x));
  const freeze$1=x=>Object.freeze(x);
  const ASTRA_A08_VERSION='ASTRA_A08_HANDOFF_API_V01';
  const ASTRA_A08_SHADOW_MODE=SHADOW;
  const ASTRA_A08_DEPLOYMENT_ALLOWED=false;
  const ASTRA_A08_ROSTER=freeze$1([...ARSENAL_ROSTER]);

  if(audit.status!=='ALL_21_CONNECTED_TO_EXPERIMENTAL_E1__12_TIER_DESIGNS_UNRATIFIED'||
     audit.species.length!==21||sourceByID.size!==21||ARSENAL_ROSTER.length!==21)
    throw Error('ASTRA_SOURCE_STATUS_OR_ROSTER_CHANGED');
  for(const id of ARSENAL_ROSTER){
   const s=sourceByID.get(id),a=authority(id),binding=a08Assignment(id);
   if(!s||s.stage!==binding.stage||s.cognitiveBase!==binding.cognitive ||
      s.social!==binding.social||s.numericGate!==binding.numeric_gate ||
      s.requiresHumanTierRatification===a.ratified)
    throw Error('ASTRA_CONTRACT_SOURCE_IDENTITY_DRIFT: '+id);
   if(!LI.has(id)&&!SIX.has(id)&&!Object.hasOwn(newTiers.species,id))
    throw Error('ASTRA_NEW_SPECIES_WITHOUT_PROVENANCE: '+id);
  }

  function checkedAuthority(id){
   const a=authority(id);
   const s=sourceByID.get(id);
   if(!s)throw Error('ASTRA_NOT_IN_21_REPEATABLES');
   return {a,s,b:a08Assignment(id)};
  }

  /** Authoritative per-species T0-T4 descriptor, no mutation or runtime grant. */
  function astraMonsterContract(id){
   const {a,s,b}=checkedAuthority(id);
   const legacy=LI.has(id),hist=SIX.has(id);
   const source=legacy?'LI_FROZEN_T0_T4':hist?'HISTORICAL_SIX_HUMAN_RATIFIED':'NEW_TIER_SHADOW_V95_V46';
   const tierSource=legacy?
    {t1:LI_T1[id],t4:liT4.species[id],t4Cooldown:7}:
    hist?{t1:a.t1,t4:a.t4,t4Cooldown:a.t4.cooldown_rounds,
          frozenHistory:oldSix.species[id].t1.status==='READY_HUMAN_RATIFIED'}:
    {t1:newTiers.species[id].t1,t4:newTiers.species[id].t4,
     t4Cooldown:newTiers.species[id].t4.cooldown_rounds};
   if(!Number.isSafeInteger(tierSource.t4Cooldown)||tierSource.t4Cooldown<1)
    throw Error('ASTRA_INVALID_SOURCE_T4_CD');
   return freeze$1({
    schema:ASTRA_A08_VERSION,id,stage:a.stage,role:b.role,baseCognitive:b.cognitive,
    social:b.social,numericGate:b.numeric_gate,authorityStatus:a.status,
    sourceFamily:source,tier0NumericSourceVerified:b.numeric_gate==='READY_E1',
    fiveTierLaboratoryConnected:true,
    tiersRatified:a.ratified,modeRequired:a.ratified?null:SHADOW,
    humanTierRatificationRequired:!a.ratified,
    sourceReadyForProduction:false, // explicit: Astra must implement/approve HTML separately
    t1Mode:legacy?'CONSUMES_MONSTER_TURN':'REACTIVE_NO_TURN_COST',
    t3RequiresResolvedPhysicalProof:true,
    t4MandatoryOnLegalBasicTurn:true,t4Cooldown:tierSource.t4Cooldown,
    tierSource:freeze$1(jsonClone(tierSource)),
    capabilities:freeze$1({
     intentScoring:true,physicalDamageExecution:false,populationTierResolution:false,
     htmlEventBusIntegration:false,debugShadowModes:!a.ratified
    })
   });
  }
  function validateMode(contract,mode){
   if(contract.modeRequired===SHADOW && mode!==SHADOW)
    throw Error('ASTRA_UNRATIFIED_TIER_NEEDS_EXPLICIT_SHADOW_MODE');
   if(contract.modeRequired===null && mode===SHADOW)
    throw Error('ASTRA_RATIFIED_SPECIES_NOT_SHADOW_CANDIDATE');
  }
  /**
   * Prepare next action. The caller owns State, RNG, tier and side-effects.
   * Do not dispatch anything returned here to HTML until Astra's parity gate passes.
   */
  function astraPrepareTurn(x){
   if(!x||typeof x!=='object')throw Error('ASTRA_INVALID_TURN_INPUT');
   const contract=astraMonsterContract(x.id);
   validateMode(contract,x.mode);
   const p=planAdaptive(x);
   if(!ACTIONS.has(p.regular))throw Error('ASTRA_UNKNOWN_RESOLVER_ACTION');
   const action=freeze$1({
    kind:p.regular,readOnly:true,physicalResolutionRequired:true,
    nonCanonicalShadow:!contract.tiersRatified,
    takesTurn:p.regular!=='SKIPPED' && p.regular!=='SURVIVAL_T1' ? true :
               p.regular==='SURVIVAL_T1', // T1 LI uses a turn; SKIPPED is engine skip
    consumesBasicSlot:p.regular==='MATURE_T4',
    canonicalTechniquePriority:p.canonicalTechniqueDue,
    requiresE1Resolution:true
   });
   return freeze$1({
    schema:ASTRA_A08_VERSION,id:x.id,tier:x.tier,round:x.round,
    authorityStatus:contract.authorityStatus,
    humanTierRatificationRequired:!contract.tiersRatified,
    deploymentAllowed:false,
    selection:action,reactiveT1:Boolean(p.reactiveT1),
    survivalSpec:p.survivalSpec?freeze$1(jsonClone(p.survivalSpec)):null,
    prediction:p.prediction??null,
    t3RequiresResolvedPhysicalProof:p.T3Available===true,
    t4CooldownOnUse:p.regular==='MATURE_T4'?contract.t4Cooldown:null,
    effectiveKit:freeze$1([p.regular]),
    sourceCognitive:contract.baseCognitive,
    sourceSocial:contract.social
   });
  }
  /**
   * Append only already resolved E1/Event Bus observations to the ecological
   * history. Never infer effectiveness from user intent or uncommitted HP.
   */
  function astraAppendResolvedObservation(history,event){
   if(!Array.isArray(history)||!event||typeof event!=='object')throw Error('ASTRA_BAD_RESOLVED_EVENT');
   if(event.eventType!=='PLAYER_ACTION_RESOLVED' || event.resolved!==true ||
      !['E1_RESOLVER','EVENT_BUS_VERIFIED'].includes(event.source) ||
      !CATEGORIES.has(event.category) ||
      !['EFECTIVA','FALLIDA'].includes(event.result) ||
      !Number.isSafeInteger(event.round)||event.round<1)
     throw Error('ASTRA_UNVERIFIED_OBSERVATION');
   const cleaned=history.map(v=>{
    if(!v||!CATEGORIES.has(v.category)||!['EFECTIVA','FALLIDA'].includes(v.result))
     throw Error('ASTRA_BAD_PRIOR_OBSERVATION');
    return {category:v.category,result:v.result};
   });
   return freeze$1([...cleaned,{category:event.category,result:event.result}].slice(-8).map(freeze$1));
  }
  /**
   * T3 causal decision is only possible from a fully resolved comparison.
   * The caller must compare the SAME committed physics with/without T1 effect.
   * This function returns a recommendation, NOT extra damage or a timer.
   */
  function astraCounterFromResolvedHit({id,tier,mode,event}={}){
   const contract=astraMonsterContract(id);validateMode(contract,mode);
   if(!event||event.eventType!=='PLAYER_HIT_RESOLVED'||event.resolved!==true||
      !['E1_RESOLVER','EVENT_BUS_VERIFIED'].includes(event.source) ||
      !Number.isSafeInteger(event.round)||event.round<1)
    throw Error('ASTRA_T3_REQUIRES_RESOLVED_HIT');
   const proof=event.proof;
   if(!proof||typeof proof!=='object'||!CATEGORIES.has(proof.category))
    throw Error('ASTRA_T3_MISSING_CAUSAL_PROOF');
   for(const key of ['t1ActiveOnHit','predictionConfirmed','naturalWouldHit','boostedWouldHit'])
    if(typeof proof[key]!=='boolean')throw Error('ASTRA_T3_BAD_CAUSAL_FLAGS');
   if(typeof proof.defensePreventedByT1!=='number'||
      !Number.isFinite(proof.defensePreventedByT1)||proof.defensePreventedByT1<0)
    throw Error('ASTRA_T3_BAD_PREVENTED_DAMAGE');
   if(proof.category==='PLAYER_DEFENSIVE_TECHNIQUE')
    throw Error('ASTRA_T3_NOT_OFFENSIVE');
   const result=counterAfterResolved(id,tier,proof,{mode});
   return freeze$1({
    schema:ASTRA_A08_VERSION,id,tier,round:event.round,
    eligible:Boolean(result.counter),reason:result.reason??'CAUSE_CHECKED',
    physicalResolutionRequired:Boolean(result.counter),
    physicalPacketReference:result.counter?'INSTANCE_T0_BASIC_OR_FROZEN_LI_COUNTER':null,
    noArtificialExtraTurn:true,nonCanonicalShadow:!contract.tiersRatified,
    deploymentAllowed:false
   });
  }

  var arsenal = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ASTRA_A08_DEPLOYMENT_ALLOWED: ASTRA_A08_DEPLOYMENT_ALLOWED,
    ASTRA_A08_ROSTER: ASTRA_A08_ROSTER,
    ASTRA_A08_SHADOW_MODE: ASTRA_A08_SHADOW_MODE,
    ASTRA_A08_VERSION: ASTRA_A08_VERSION,
    astraAppendResolvedObservation: astraAppendResolvedObservation,
    astraCounterFromResolvedHit: astraCounterFromResolvedHit,
    astraMonsterContract: astraMonsterContract,
    astraPrepareTurn: astraPrepareTurn
  });

  const ADAPTIVE_ECOLOGY_MILESTONE_STATUS='EXPERIMENTAL_V02_MILESTONE_FLOOR';

  function tier$1(v,label){
    if(!Number.isInteger(v)||v<0||v>4)throw new RangeError(label+' debe ser entero 0..4');
    return v;
  }

  /**
   * Trinquete evolutivo:
   * maxReached 0 -> floor 0
   * maxReached 1 -> floor 1
   * maxReached 2 -> floor 1
   * maxReached 3 -> floor 2
   * maxReached 4 -> floor 3
   */
  function consolidatedFloorFromMaxReached(maxTierReached){
    const max=tier$1(maxTierReached,'maxTierReached');
    if(max===0)return 0;
    if(max===1)return 1;
    return max-1;
  }

  function registerReachedTier({maxTierReached,reachedTier}){
    const max=tier$1(maxTierReached,'maxTierReached');
    const reached=tier$1(reachedTier,'reachedTier');
    return Math.max(max,reached);
  }

  function effectiveTierAfterDecay({pressureTier,maxTierReached}){
    const pressure=tier$1(pressureTier,'pressureTier');
    const max=tier$1(maxTierReached,'maxTierReached');
    const floor=consolidatedFloorFromMaxReached(max);
    return Math.max(pressure,floor);
  }

  function reconcilePopulationAdaptation({pressureTier,maxTierReached,reachedTier=pressureTier}){
    const nextMax=registerReachedTier({maxTierReached,reachedTier});
    const floorTier=consolidatedFloorFromMaxReached(nextMax);
    const effectiveTier=effectiveTierAfterDecay({pressureTier,maxTierReached:nextMax});
    return Object.freeze({
      pressureTier:tier$1(pressureTier,'pressureTier'),
      maxTierReached:nextMax,
      floorTier,
      effectiveTier
    });
  }

  var floor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ADAPTIVE_ECOLOGY_MILESTONE_STATUS: ADAPTIVE_ECOLOGY_MILESTONE_STATUS,
    consolidatedFloorFromMaxReached: consolidatedFloorFromMaxReached,
    effectiveTierAfterDecay: effectiveTierAfterDecay,
    reconcilePopulationAdaptation: reconcilePopulationAdaptation,
    registerReachedTier: registerReachedTier
  });

  const ADAPTIVE_LEARNING_CEILING_STATUS='EXPERIMENTAL_V03_NATURAL_OVERREACH';

  const ADAPTIVE_PRESSURE_THRESHOLDS=Object.freeze({
    T1:20,
    T2:45,
    T3:70,
    T4:90,
    MAX:100
  });

  function tier(v,label){
    if(!Number.isInteger(v)||v<0||v>4)throw new RangeError(label+' debe ser entero 0..4');
    return v;
  }

  function pressure(v){
    if(!Number.isFinite(v)||v<0||v>100)throw new RangeError('pressure debe estar entre 0 y 100');
    return v;
  }

  function pressureTierFromPressure(value){
    const p=pressure(value);
    if(p>=ADAPTIVE_PRESSURE_THRESHOLDS.T4)return 4;
    if(p>=ADAPTIVE_PRESSURE_THRESHOLDS.T3)return 3;
    if(p>=ADAPTIVE_PRESSURE_THRESHOLDS.T2)return 2;
    if(p>=ADAPTIVE_PRESSURE_THRESHOLDS.T1)return 1;
    return 0;
  }

  /**
   * Compatibilidad de API.
   *
   * Desde la autoridad humana 2026-10-06 la etapa del jugador NO impone un
   * hard cap sobre la presión. El ceiling histórico se conserva únicamente como
   * banda esperada/orientativa. Por eso cualquier ceiling devuelve MAX=100.
   */
  function pressureCapForAdaptiveCeiling(ceilingTier){
    tier(ceilingTier,'ceilingTier');
    return ADAPTIVE_PRESSURE_THRESHOLDS.MAX;
  }

  /**
   * Compatibilidad de API: ya no recorta pressure.
   *
   * Si el jugador consigue producir presión válida más allá de su banda
   * esperada, la población puede seguir adaptándose. El muro natural es la
   * dificultad del combate + decay, no una prohibición de etapa.
   */
  function clampPressureToAdaptiveCeiling({pressure:value,ceilingTier}){
    tier(ceilingTier,'ceilingTier');
    return pressure(value);
  }

  function reconcileLearningWithCeiling({
    pressure:value,
    maxTierReached,
    ceilingTier
  }){
    const expectedTier=tier(ceilingTier,'ceilingTier');
    const currentPressure=pressure(value);
    const pressureTier=pressureTierFromPressure(currentPressure);
    const reconciled=reconcilePopulationAdaptation({
      pressureTier,
      maxTierReached,
      reachedTier:pressureTier
    });

    return Object.freeze({
      rawPressure:currentPressure,
      pressure:currentPressure,
      pressureWasCapped:false,
      pressureTier,
      maxTierReached:reconciled.maxTierReached,
      floorTier:reconciled.floorTier,
      earnedTier:reconciled.effectiveTier,
      // Campo histórico conservado por compatibilidad. Es ORIENTATIVO, no gate.
      capabilityCeilingTier:expectedTier,
      expectedCapabilityTier:expectedTier,
      effectiveAdaptiveTier:reconciled.effectiveTier,
      overreachedExpectedBand:reconciled.effectiveTier>expectedTier
    });
  }

  var ceiling = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ADAPTIVE_LEARNING_CEILING_STATUS: ADAPTIVE_LEARNING_CEILING_STATUS,
    ADAPTIVE_PRESSURE_THRESHOLDS: ADAPTIVE_PRESSURE_THRESHOLDS,
    clampPressureToAdaptiveCeiling: clampPressureToAdaptiveCeiling,
    pressureCapForAdaptiveCeiling: pressureCapForAdaptiveCeiling,
    pressureTierFromPressure: pressureTierFromPressure,
    reconcileLearningWithCeiling: reconcileLearningWithCeiling
  });

  const GRULLA_BRAIN_STATUS='EXPERIMENTAL_NON_CANONICAL_GRULLA_BRAIN_V01';

  const GRULLA_PHASES=Object.freeze({
    VOTO_INMOVIL:1,
    ALAS_RECUERDAN:2,
    CAMPANA_SIN_DUENO:3
  });

  const GRULLA_ABILITIES=Object.freeze({
    GOLPE_ALA:'grulla__golpe_ala',
    CAMPANADA_PICO:'grulla__campanada_pico',
    PATA_INMOVIL:'grulla__pata_inmovil',
    TORMENTA_MIL_PLUMAS:'grulla__tormenta_mil_plumas',
    CERRAR_ALAS:'grulla__cerrar_alas',
    RECORDAR_FILO:'grulla__recordar_filo',
    ECO_MERIDIANO:'grulla__eco_meridiano',
    PICOTAZO_BLANCO:'grulla__picotazo_blanco',
    CAMPANA_SIN_DUENO:'grulla__campana_sin_dueno',
    ALA_VACIA:'grulla__ala_vacia',
    SILENCIO_ENTRE_CAMPANAS:'grulla__silencio_entre_campanas',
    ROMPER_RITMO:'grulla__romper_ritmo',
    BUSCAR_PULSO:'grulla__buscar_pulso'
  });

  const GRULLA_COUNTER_RESPONSES=Object.freeze({
    ofensiva:Object.freeze({
      id:'TRAZO_VACIO',
      label:'Trazo Vacío',
      telegraph:'La Grulla deja de seguir el golpe: ya conoce exactamente dónde termina.',
      primarySuppression:'DAMAGE_AND_SECONDARY'
    }),
    esquiva:Object.freeze({
      id:'PULSO_FIJADO',
      label:'Pulso Fijado',
      telegraph:'La mirada abandona tu silueta y escucha el pulso que mueve tus pasos.',
      primarySuppression:'EVASION'
    }),
    guardia:Object.freeze({
      id:'RESONANCIA_INTERNA',
      label:'Resonancia Interior',
      telegraph:'La campana cambia de tono hasta resonar dentro de la misma guardia.',
      primarySuppression:'GUARD'
    }),
    fortificacion:Object.freeze({
      id:'CAMPANA_INVERSA',
      label:'Campana Inversa',
      telegraph:'El eco encuentra las mismas juntas cada vez que endureces la postura.',
      primarySuppression:'DEFENSE_BUFF'
    }),
    control:Object.freeze({
      id:'ANCLA_DEL_VOTO',
      label:'Ancla del Voto',
      telegraph:'La pata inmóvil fija el vínculo. El mismo lazo ya no encuentra dónde cerrar.',
      primarySuppression:'CONTROL'
    }),
    desconocida:Object.freeze({
      id:'PATRON_COMPRENDIDO',
      label:'Patrón Comprendido',
      telegraph:'La Grulla reconoce la circulación exacta de esa técnica.',
      primarySuppression:'FULL_EFFECT'
    })
  });

  const A=GRULLA_ABILITIES;
  const PHASE1_CYCLE=Object.freeze([A.GOLPE_ALA,A.GOLPE_ALA,A.CAMPANADA_PICO,A.PATA_INMOVIL]);
  const TELEGRAPH=Object.freeze({
    [A.GOLPE_ALA]:'Un ala blanca se tensa para golpear.',
    [A.CAMPANADA_PICO]:'Las campanas del ancla vibran al unísono.',
    [A.PATA_INMOVIL]:'La Grulla hunde una pata y cierra su postura.',
    [A.TORMENTA_MIL_PLUMAS]:'Las plumas recuerdan una tormenta que ya ocurrió.',
    [A.CERRAR_ALAS]:'Las alas se cierran sobre el vínculo.',
    [A.RECORDAR_FILO]:'La mirada repasa exactamente cómo has atacado.',
    [A.ECO_MERIDIANO]:'La campana responde al pulso de tu qi.',
    [A.PICOTAZO_BLANCO]:'El pico encuentra una línea directa.',
    [A.CAMPANA_SIN_DUENO]:'El silencio se hunde antes de una campanada sin dueño.',
    [A.ALA_VACIA]:'El contorno de un ala deja de ocupar el mismo lugar.',
    [A.SILENCIO_ENTRE_CAMPANAS]:'La Grulla deja un hueco deliberado en el ritmo.',
    [A.ROMPER_RITMO]:'El hueco se cierra sobre el patrón que repetiste.',
    [A.BUSCAR_PULSO]:'La cabeza se inclina, escuchando tu circulación.'
  });

  const VALID_ACTION_TYPES=new Set(['BASIC','TECHNIQUE','CONTROL','DEFEND','RECOVER','UTILITY']);
  const VALID_TECHNIQUE_ROLES=new Set(['ofensiva','guardia','fortificacion','esquiva','control']);
  const MAX_HISTORY=8;

  function plain$1(x,label){
    if(!x||typeof x!=='object'||Array.isArray(x))throw new TypeError(label+' debe ser objeto');
  }
  function phaseOk(phase){
    if(![1,2,3].includes(phase))throw new RangeError('phase debe ser 1..3');
  }
  function freezeState(s){
    return Object.freeze({
      ...s,
      history:Object.freeze(s.history.map(x=>Object.freeze({...x}))),
      recentIntents:Object.freeze([...s.recentIntents]),
      phaseMemory:Object.freeze({...s.phaseMemory}),
      plan:s.plan?Object.freeze({...s.plan}):null,
      techniqueCounter:s.techniqueCounter?Object.freeze({...s.techniqueCounter}):null
    });
  }
  function actionCopy(a){
    plain$1(a,'playerAction');
    if(!VALID_ACTION_TYPES.has(a.type))throw new TypeError('playerAction.type inválido: '+a.type);
    if(a.techniqueId!==undefined&&typeof a.techniqueId!=='string')throw new TypeError('techniqueId inválido');
    if(a.techniqueRole!==undefined&&a.techniqueRole!==null&&!VALID_TECHNIQUE_ROLES.has(a.techniqueRole)){
      throw new TypeError('techniqueRole inválido: '+a.techniqueRole);
    }
    if(a.element!==undefined&&typeof a.element!=='string')throw new TypeError('element inválido');
    if(a.qiSpent!==undefined&&(!Number.isFinite(a.qiSpent)||a.qiSpent<0))throw new TypeError('qiSpent inválido');
    if(a.damageBand!==undefined&&!['NONE','LOW','NORMAL','HEAVY'].includes(a.damageBand))throw new TypeError('damageBand inválido');
    return Object.freeze({
      type:a.type,
      techniqueId:a.techniqueId??null,
      techniqueRole:a.techniqueRole??(a.type==='CONTROL'?'control':null),
      element:a.element??null,
      qiSpent:Number(a.qiSpent||0),
      damageBand:a.damageBand??'NONE'
    });
  }
  function tail(a,n){return a.slice(Math.max(0,a.length-n));}
  function same(values){return values.length>1&&values[0]!=null&&values.every(v=>v===values[0]);}
  function recent(state,id,depth=1){return state.recentIntents.slice(-depth).includes(id);}

  function initialGrullaBrainState({phase=1,phaseMemory={}}={}){
    phaseOk(phase);plain$1(phaseMemory,'phaseMemory');
    return freezeState({phase,turn:0,history:[],recentIntents:[],phaseMemory:{...phaseMemory},plan:null,techniqueCounter:null});
  }

  function summarize(history){
    const t=new Map(),e=new Map();
    let offense=0,defend=0,recover=0,control=0,qiActions=0,techniqueUses=0,nonTechniqueActions=0,basicUses=0;
    for(const a of history){
      if(['BASIC','TECHNIQUE','CONTROL'].includes(a.type))offense++;
      if(a.type==='BASIC')basicUses++;
      if(a.type==='DEFEND')defend++;
      if(a.type==='RECOVER')recover++;
      if(a.type==='CONTROL')control++;
      if(a.qiSpent>0)qiActions++;
      if(a.techniqueId){techniqueUses++;t.set(a.techniqueId,(t.get(a.techniqueId)||0)+1);}
      else nonTechniqueActions++;
      if(a.element)e.set(a.element,(e.get(a.element)||0)+1);
    }
    const dominant=map=>[...map.entries()].sort((x,y)=>y[1]-x[1]||x[0].localeCompare(y[0]))[0]?.[0]||null;
    const dominantTechnique=dominant(t);
    const dominantTechniqueRole=history.findLast?.(a=>a.techniqueId===dominantTechnique)?.techniqueRole
      ?? [...history].reverse().find(a=>a.techniqueId===dominantTechnique)?.techniqueRole
      ?? null;
    // Fase I es una fase completa de observación: dos exposiciones a una única
    // técnica, sin mostrar jamás un ataque básico/alternativa real, bastan para
    // que Fase II nazca recordándola. Dentro de Fase II/III el lock normal
    // sigue exigiendo tres usos consecutivos.
    const singleSkillReliance=techniqueUses>=2&&t.size===1&&basicUses===0;
    return {
      dominantTechnique,dominantTechniqueRole,dominantElement:dominant(e),
      offense,defend,recover,control,qiActions,
      techniqueUses,uniqueTechniques:t.size,nonTechniqueActions,basicUses,
      singleSkillReliance,
      pureSingleSkillSpam:singleSkillReliance&&nonTechniqueActions===0
    };
  }

  function enterGrullaPhase(state,phase){
    plain$1(state,'state');phaseOk(phase);
    const memory={...state.phaseMemory};
    if(state.phase===1)memory.phase1=summarize(state.history);
    if(state.phase===2)memory.phase2=summarize(state.history);

    let techniqueCounter=state.techniqueCounter?{...state.techniqueCounter}:null;
    if(phase===2&&memory.phase1?.singleSkillReliance){
      techniqueCounter={
        techniqueId:memory.phase1.dominantTechnique,
        techniqueRole:memory.phase1.dominantTechniqueRole??null,
        locked:true,
        source:'PHASE1_SINGLE_SKILL_RELIANCE'
      };
    }

    return freezeState({phase,turn:0,history:[],recentIntents:[],phaseMemory:memory,plan:null,techniqueCounter});
  }

  function signals$1(state,context){
    const h=tail(state.history,state.phase===3?4:3);
    const l2=tail(h,2),l3=tail(h,3);
    return {
      techniqueRepeat:same(l2.map(x=>x.techniqueId)),
      elementRepeat:same(l2.map(x=>x.element)),
      offenseStreak:l2.length===2&&l2.every(x=>['BASIC','TECHNIQUE','CONTROL'].includes(x.type)),
      qiStreak:l2.length===2&&l2.every(x=>x.qiSpent>0),
      controlRecent:l3.some(x=>x.type==='CONTROL'),
      recoverRecent:l2.some(x=>x.type==='RECOVER'),
      heavyRecent:l2.some(x=>x.damageBand==='HEAVY'),
      playerLowHp:context.playerHpRatio!==undefined&&context.playerHpRatio<=.30,
      selfLowHp:context.selfHpRatio!==undefined&&context.selfHpRatio<=.30,
      playerQiLow:context.playerQiRatio!==undefined&&context.playerQiRatio<=.25,
      playerQiHigh:context.playerQiRatio!==undefined&&context.playerQiRatio>=.65,
      last:h.at(-1)||null
    };
  }
  function choose(entries,rng){
    const next=typeof rng==='function'?rng:()=>.5;
    return entries
      .map(e=>({...e,score:e.score+(Number(next())-.5)*e.jitter}))
      .sort((x,y)=>y.score-x.score||x.id.localeCompare(y.id))[0];
  }
  function intent(id,brain,extra={}){
    return Object.freeze({id,telegraph:TELEGRAPH[id],brain,...extra});
  }
  function remember(state,id,extra={}){
    return freezeState({...state,turn:state.turn+1,recentIntents:[...state.recentIntents,id].slice(-4),...extra});
  }

  function chooseGrullaIntent({state,context={},rng=()=>.5}){
    plain$1(state,'state');plain$1(context,'context');phaseOk(state.phase);
    const s=signals$1(state,context);

    if(state.phase===1){
      const id=PHASE1_CYCLE[state.turn%PHASE1_CYCLE.length];
      return {intent:intent(id,'PROGRAMADA',{reason:'CICLO_INMOVIL'}),state:remember(state,id)};
    }

    if(state.phase===3&&state.plan?.armed&&state.plan.followup){
      const id=state.plan.followup;
      return {intent:intent(id,'MAESTRA',{reason:'PLAN_COMPROMETIDO',planId:state.plan.id,committed:true}),state:remember(state,id)};
    }

    if(state.phase===2){
      const inherited=state.phaseMemory?.phase1||{};
      const inheritedRepeat=(inherited.dominantTechnique&&s.last?.techniqueId===inherited.dominantTechnique)?1:0;
      const entries=[
        {id:A.GOLPE_ALA,score:30,jitter:1},
        {id:A.TORMENTA_MIL_PLUMAS,score:28+(s.playerQiHigh?12:0)+(s.playerLowHp?10:0)-(recent(state,A.TORMENTA_MIL_PLUMAS,2)?40:0),jitter:1},
        {id:A.CERRAR_ALAS,score:18+(s.offenseStreak?18:0)+(s.heavyRecent?20:0)+(s.selfLowHp?16:0)-(recent(state,A.CERRAR_ALAS,2)?35:0),jitter:.8},
        {id:A.RECORDAR_FILO,score:12+(s.techniqueRepeat?38:0)+(s.elementRepeat?18:0)+inheritedRepeat*8-(recent(state,A.RECORDAR_FILO,2)?42:0),jitter:.6},
        {id:A.ECO_MERIDIANO,score:12+(s.qiStreak?34:0)+(s.playerQiLow?8:0)+(s.recoverRecent?6:0)-(recent(state,A.ECO_MERIDIANO,2)?40:0),jitter:.6}
      ];
      if(s.controlRecent)entries.find(x=>x.id===A.CERRAR_ALAS).score+=8;
      const c=choose(entries,rng);
      return {intent:intent(c.id,'ADAPTATIVA',{reason:'UTILITY_MEMORY'}),state:remember(state,c.id)};
    }

    const entries=[
      {id:A.PICOTAZO_BLANCO,score:25+(s.playerLowHp?8:0),jitter:.5},
      {id:A.CAMPANA_SIN_DUENO,score:24+(s.playerLowHp?24:0)+(s.playerQiHigh?8:0)-(recent(state,A.CAMPANA_SIN_DUENO,2)?45:0),jitter:.5},
      {id:A.ALA_VACIA,score:16+(s.offenseStreak?17:0)+(s.heavyRecent?14:0)-(recent(state,A.ALA_VACIA,2)?30:0),jitter:.4},
      {id:A.PATA_INMOVIL,score:15+(s.selfLowHp?15:0)+(s.controlRecent?10:0)-(recent(state,A.PATA_INMOVIL,2)?30:0),jitter:.4},
      {id:A.SILENCIO_ENTRE_CAMPANAS,score:10+(s.techniqueRepeat?32:0)+(s.elementRepeat?18:0)-(recent(state,A.SILENCIO_ENTRE_CAMPANAS,3)?50:0),jitter:.2},
      {id:A.BUSCAR_PULSO,score:10+(s.qiStreak?28:0)+(s.playerQiHigh?10:0)-(recent(state,A.BUSCAR_PULSO,3)?50:0),jitter:.2}
    ];
    const c=choose(entries,rng);
    let plan=null;
    if(c.id===A.SILENCIO_ENTRE_CAMPANAS){
      const ref=tail(state.history,1)[0]||null;
      plan={id:'ROMPER_REPETICION',armed:false,followup:A.ROMPER_RITMO,referenceTechnique:ref?.techniqueId||null,referenceElement:ref?.element||null};
    }else if(c.id===A.BUSCAR_PULSO){
      plan={id:'CAZAR_CIRCULACION',armed:false,followup:A.CAMPANA_SIN_DUENO};
    }
    return {intent:intent(c.id,'MAESTRA',{reason:'UTILITY_PLANIFICADA',planId:plan?.id||null}),state:remember(state,c.id,{plan})};
  }

  function counterResponseFor(role){
    return GRULLA_COUNTER_RESPONSES[role]||GRULLA_COUNTER_RESPONSES.desconocida;
  }

  function grullaCounterAnnouncement(state){
    plain$1(state,'state');
    const counter=state.techniqueCounter;
    if(!counter?.locked)return null;
    const response=counterResponseFor(counter.techniqueRole);
    return Object.freeze({
      techniqueId:counter.techniqueId,
      techniqueRole:counter.techniqueRole??null,
      counterMode:response.id,
      counterLabel:response.label,
      telegraph:response.telegraph,
      source:counter.source
    });
  }

  function grullaTechniqueEffectiveness(state,playerAction){
    plain$1(state,'state');
    const action=actionCopy(playerAction);
    const counter=state.techniqueCounter;
    const blocked=!!(
      state.phase>=2&&
      counter?.locked&&
      action.techniqueId&&
      action.techniqueId===counter.techniqueId
    );
    const role=counter?.techniqueRole??action.techniqueRole??null;
    const response=counterResponseFor(role);
    return Object.freeze({
      multiplier:blocked?0:1,
      blocked,
      consumeQi:true,
      refundQi:false,
      suppressEffects:blocked,
      suppressDamage:blocked,
      suppressControl:blocked,
      suppressAfflictions:blocked,
      suppressResourceEffects:blocked,
      suppressGuard:blocked&&role==='guardia',
      suppressDefenseBuff:blocked&&role==='fortificacion',
      suppressEvasion:blocked&&role==='esquiva',
      techniqueId:action.techniqueId,
      techniqueRole:role,
      counteredTechniqueId:counter?.techniqueId??null,
      counterMode:blocked?response.id:null,
      counterLabel:blocked?response.label:null,
      telegraph:blocked?response.telegraph:null,
      primarySuppression:blocked?response.primarySuppression:null,
      reason:blocked?'TECHNIQUE_FULLY_READ':'NORMAL'
    });
  }

  function nextTechniqueCounter(state,action,nextHistory){
    if(state.phase<2)return state.techniqueCounter?{...state.techniqueCounter}:null;

    const current=state.techniqueCounter?{...state.techniqueCounter}:null;
    if(current?.locked){
      if(action.techniqueId===current.techniqueId)return current;

      // Defender, curarse o una utility sin técnica NO hacen olvidar una skill
      // ya comprendida. Para romper el conocimiento hay que mostrar una
      // alternativa táctica real: otra técnica/control o un ataque básico.
      const meaningfulVariation=
        action.type==='BASIC'||
        (action.techniqueId&&action.techniqueId!==current.techniqueId);

      return meaningfulVariation?null:current;
    }

    const last3=tail(nextHistory,3);
    if(
      last3.length===3&&
      last3.every(x=>x.techniqueId&&x.techniqueId===last3[0].techniqueId)
    ){
      return {
        techniqueId:last3[0].techniqueId,
        techniqueRole:last3[0].techniqueRole??null,
        locked:true,
        source:'THREE_CONSECUTIVE_SAME_SKILL'
      };
    }
    return null;
  }

  function observeResolvedPlayerAction(state,playerAction){
    plain$1(state,'state');
    const action=actionCopy(playerAction);
    let plan=state.plan?{...state.plan}:null;
    let event='NONE';
    const nextHistory=[...state.history,action].slice(-MAX_HISTORY);
    const previousCounter=state.techniqueCounter;
    const techniqueCounter=nextTechniqueCounter(state,action,nextHistory);

    if(state.phase===3&&plan&&!plan.armed){
      if(plan.id==='ROMPER_REPETICION'){
        const repeatsTechnique=plan.referenceTechnique&&action.techniqueId===plan.referenceTechnique;
        const repeatsElement=plan.referenceElement&&action.element===plan.referenceElement&&['TECHNIQUE','CONTROL'].includes(action.type);
        if(repeatsTechnique||repeatsElement){plan.armed=true;event='PLAN_ARMED';}
        else {plan=null;event='PLAN_BROKEN_BY_VARIATION';}
      }else if(plan.id==='CAZAR_CIRCULACION'){
        if(action.qiSpent>0&&['TECHNIQUE','CONTROL'].includes(action.type)){plan.armed=true;event='PLAN_ARMED';}
        else {plan=null;event='PLAN_BROKEN_BY_RESOURCE_DISCIPLINE';}
      }
    }else if(state.phase===3&&plan?.armed){
      plan=null;
      event='PLAN_COMPLETED';
    }

    if(!previousCounter?.locked&&techniqueCounter?.locked&&event==='NONE'){
      event='TECHNIQUE_COUNTER_LOCKED';
    }else if(previousCounter?.locked&&!techniqueCounter&&event==='NONE'){
      event='TECHNIQUE_COUNTER_BROKEN_BY_VARIATION';
    }

    return {
      state:freezeState({...state,history:nextHistory,plan,techniqueCounter}),
      event
    };
  }

  function interruptGrullaPlan(state){
    plain$1(state,'state');
    return freezeState({...state,plan:null});
  }

  function grullaCapabilitySnapshot(state,context={}){
    plain$1(state,'state');
    const s=signals$1(state,context);
    return Object.freeze({
      phase:state.phase,
      turn:state.turn,
      brain:state.phase===1?'PROGRAMADA':state.phase===2?'ADAPTATIVA':'MAESTRA',
      memoryDepth:state.phase===1?0:4,
      signals:Object.freeze({...s,last:undefined}),
      plan:state.plan?Object.freeze({...state.plan}):null,
      techniqueCounter:state.techniqueCounter?Object.freeze({...state.techniqueCounter}):null,
      phaseMemory:Object.freeze({...state.phaseMemory})
    });
  }

  var grulla = /*#__PURE__*/Object.freeze({
    __proto__: null,
    GRULLA_ABILITIES: GRULLA_ABILITIES,
    GRULLA_BRAIN_STATUS: GRULLA_BRAIN_STATUS,
    GRULLA_COUNTER_RESPONSES: GRULLA_COUNTER_RESPONSES,
    GRULLA_PHASES: GRULLA_PHASES,
    chooseGrullaIntent: chooseGrullaIntent,
    enterGrullaPhase: enterGrullaPhase,
    grullaCapabilitySnapshot: grullaCapabilitySnapshot,
    grullaCounterAnnouncement: grullaCounterAnnouncement,
    grullaTechniqueEffectiveness: grullaTechniqueEffectiveness,
    initialGrullaBrainState: initialGrullaBrainState,
    interruptGrullaPlan: interruptGrullaPlan,
    observeResolvedPlayerAction: observeResolvedPlayerAction
  });

  const SEMANTIC_MEMORY_STATUS='EXPERIMENTAL_RECORDER_V01';

  const TYPES=Object.freeze({
    PLAYER_ABSORPTION_RESOLVED:'DEFENSA_ABSORCION',
    PLAYER_RECOVERY_RESOLVED:'RECUPERACION'
  });

  function plain(x){
    if(!x||typeof x!=='object'||Array.isArray(x))throw new TypeError('outcome debe ser objeto plano');
    const p=Object.getPrototypeOf(x);
    if(p!==Object.prototype&&p!==null)throw new TypeError('outcome debe ser objeto plano');
    return x;
  }
  function roundOf$1(v,label='round'){
    if(!Number.isInteger(v)||v<0)throw new TypeError(`${label} debe ser entero >= 0`);
    return v;
  }
  function validateMemory(memory){
    if(!Array.isArray(memory))throw new TypeError('memory debe ser array');
    let prev=-1;
    return memory.map((e,i)=>{
      plain(e);
      const keys=Object.keys(e).sort().join('|');
      if(keys!=='category|result|round')throw new TypeError(`memory[${i}] shape inválido`);
      const round=roundOf$1(e.round,`memory[${i}].round`);
      if(round<prev)throw new TypeError('memory debe estar en orden cronológico ascendente');
      prev=round;
      if(typeof e.category!=='string'||!e.category)throw new TypeError('memory.category inválida');
      if(!['EFECTIVA','FALLIDA','NEUTRA'].includes(e.result))throw new TypeError('memory.result inválido');
      return {category:e.category,result:e.result,round};
    });
  }
  function freezeEvent(e){return Object.freeze({...e});}

  function semanticEventFromOutcome(outcome){
    const o=plain(outcome);
    const allowed=['type','round','effective'];
    const keys=Object.keys(o);
    for(const k of keys)if(!allowed.includes(k))throw new TypeError(`outcome campo no permitido: ${k}`);
    if(typeof o.type!=='string'||!o.type)throw new TypeError('outcome.type inválido');
    const category=TYPES[o.type];
    if(!category)return null;
    const round=roundOf$1(o.round);
    if(typeof o.effective!=='boolean')throw new TypeError('outcome.effective debe ser boolean');
    return freezeEvent({category,result:o.effective?'EFECTIVA':'FALLIDA',round});
  }

  function recordSemanticOutcome(memory,outcome){
    const current=validateMemory(memory);
    const event=semanticEventFromOutcome(outcome);
    if(!event)return Object.freeze(current.map(freezeEvent));
    const last=current.at(-1);
    if(last&&event.round<last.round)throw new TypeError('outcome no puede preceder la memoria existente');
    return Object.freeze([...current.map(freezeEvent),event]);
  }

  var memory = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SEMANTIC_MEMORY_STATUS: SEMANTIC_MEMORY_STATUS,
    recordSemanticOutcome: recordSemanticOutcome,
    semanticEventFromOutcome: semanticEventFromOutcome
  });

  const RESOLVED_COMBAT_SIGNAL_ADAPTER_STATUS='EXPERIMENTAL_NEW_ENGINE_ADAPTER_V02';

  function plainExact(input, fields, label) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new TypeError(`${label} debe ser objeto plano`);
    }
    const proto=Object.getPrototypeOf(input);
    if (proto!==Object.prototype && proto!==null) throw new TypeError(`${label} debe ser objeto plano`);
    const keys=Reflect.ownKeys(input);
    if (keys.some(k=>typeof k!=='string')) throw new TypeError(`${label} no admite Symbols`);
    const sorted=[...keys].sort();
    const expected=[...fields].sort();
    if (sorted.join('|')!==expected.join('|')) throw new TypeError(`${label} shape inválido`);
    const out={};
    for (const key of fields) {
      const d=Object.getOwnPropertyDescriptor(input,key);
      if (!d || !Object.hasOwn(d,'value')) throw new TypeError(`${label}.${key} debe ser propiedad de datos propia`);
      out[key]=d.value;
    }
    return out;
  }
  function roundOf(v){
    if (!Number.isSafeInteger(v) || v<0) throw new TypeError('round debe ser entero seguro >= 0');
    return v;
  }
  function nonNegative(v,label){
    if (typeof v!=='number' || !Number.isFinite(v) || v<0) throw new TypeError(`${label} debe ser número finito >= 0`);
    return v;
  }
  function freeze(x){return Object.freeze(x);}

  /**
   * Adapta un resultado estructurado ya resuelto por el motor nuevo.
   * No calcula impacto, daño, DEF ni Absorción: sólo traduce el resultado a memoria semántica.
   */
  function absorptionOutcomeFromResolvedHit(input) {
    const x=plainExact(input,['round','absorbido'],'absorption');
    const round=roundOf(x.round);
    const absorbido=nonNegative(x.absorbido,'absorption.absorbido');
    return freeze({
      type:'PLAYER_ABSORPTION_RESOLVED',
      round,
      effective:absorbido>0
    });
  }

  /**
   * Adapta deltas de recuperación ya resueltos por el motor nuevo.
   * No infiere valores desde logs ni vuelve a calcular curación/Qi.
   */
  function recoveryOutcomeFromResolvedDelta(input) {
    const x=plainExact(input,['round','vidaRecuperada','qiRecuperado'],'recovery');
    const round=roundOf(x.round);
    const vidaRecuperada=nonNegative(x.vidaRecuperada,'recovery.vidaRecuperada');
    const qiRecuperado=nonNegative(x.qiRecuperado,'recovery.qiRecuperado');
    return freeze({
      type:'PLAYER_RECOVERY_RESOLVED',
      round,
      effective:(vidaRecuperada+qiRecuperado)>0
    });
  }

  var signals = /*#__PURE__*/Object.freeze({
    __proto__: null,
    RESOLVED_COMBAT_SIGNAL_ADAPTER_STATUS: RESOLVED_COMBAT_SIGNAL_ADAPTER_STATUS,
    absorptionOutcomeFromResolvedHit: absorptionOutcomeFromResolvedHit,
    recoveryOutcomeFromResolvedDelta: recoveryOutcomeFromResolvedDelta
  });

  globalThis.ASTRA_A08_AI=Object.freeze({chooseMonsterIntent,STATUS,PROFILES,SOCIAL_PROFILES,...nativeIntent});
  globalThis.ASTRA_A08_ADAPTIVE=Object.freeze({...arsenal,ceiling:Object.freeze(ceiling),floor:Object.freeze(floor),memory:Object.freeze(memory),signals:Object.freeze(signals)});
  // Deliberately separate from the shared monster kernel and ecological tiers.
  globalThis.ASTRA_A08_GRULLA_BRAIN=Object.freeze(grulla);

})();
