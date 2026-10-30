const KNOWLEDGE = Object.freeze({
  DESCONOCIDO: 0,
  SOSPECHA: 1,
  SABE: 2,
  CONFIRMADO: 3,
});

const RANKS = Object.freeze({
  ASPIRANTE: 0,
  EXTERNO: 1,
  INTERNO: 2,
  PRIMERA_ALA: 3,
  INSTRUCTOR: 4,
  ANCIANO: 5,
  CONSEJO: 6,
});

const ACTION_ORDER = Object.freeze([
  'vigilar',
  'trabajar',
  'patrullar',
  'hablar_jugador',
  'ayudar_jugador',
  'investigar',
  'informar_superior',
  'regresar_puesto',
  'esperar',
]);

const DUTY_MODES = Object.freeze(['vigilar', 'trabajar', 'patrullar', 'ninguno']);

const REQUIRED_TRAITS = Object.freeze([
  'disciplina', 'sociabilidad', 'curiosidad', 'prudencia', 'lealtad_institucional', 'empatia',
]);
const REQUIRED_RELATION = Object.freeze([
  'afinidad', 'confianza', 'respeto', 'deuda', 'temor', 'rivalidad',
]);
const REQUIRED_KNOWLEDGE = Object.freeze(['R1', 'R2', 'R3']);
const REQUIRED_BEHAVIOR = Object.freeze(['lastAction', 'consecutiveTurns']);
const REQUIRED_ACTION_CONTEXT = Object.freeze([
  'playerPresent', 'playerRequestsHelp', 'playerRank', 'dutyImportance', 'danger', 'missionUrgency',
  'anomalyPresent', 'awayFromPost', 'superiorReachable', 'relevantKnowledge', 'dutyMode',
]);
const REQUIRED_DIALOGUE_CONTEXT = Object.freeze(['playerRank', 'topicSensitivity', 'formalRestriction']);
const KNOWLEDGE_STATES = Object.freeze(['DESCONOCIDO', 'SOSPECHA', 'SABE', 'CONFIRMADO']);

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const pct = n => clamp(n);
const rankNorm = rank => clamp(rank / 6 * 100);
const isKnowledgeState = state => typeof state === 'string' && KNOWLEDGE_STATES.includes(state);
const knowledgeNorm = state => clamp(KNOWLEDGE[state] / 3 * 100);

function isRecordObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  } catch {
    return false;
  }
}

function ownData(obj, key, path, errors) {
  let desc;
  try {
    desc = Object.getOwnPropertyDescriptor(obj, key);
  } catch {
    errors.push(`${path}: no se pudo inspeccionar el descriptor`);
    return { ok: false };
  }
  if (!desc) {
    errors.push(`Falta ${path}`);
    return { ok: false };
  }
  if (!Object.hasOwn(desc, 'value')) {
    errors.push(`${path} debe ser una propiedad de datos; accessors no permitidos`);
    return { ok: false };
  }
  if (desc.value === undefined) {
    errors.push(`${path} no puede ser undefined`);
    return { ok: false };
  }
  return { ok: true, value: desc.value };
}

function exactKeys(obj, required, path, errors) {
  if (!isRecordObject(obj)) {
    errors.push(`${path} inválido`);
    return false;
  }
  let keys;
  try {
    keys = Object.keys(obj).sort();
  } catch {
    errors.push(`${path}: no se pudieron inspeccionar las claves`);
    return false;
  }
  const expected = [...required].sort();
  if (keys.join('|') !== expected.join('|')) {
    const missing = expected.filter(k => !keys.includes(k));
    const extra = keys.filter(k => !expected.includes(k));
    if (missing.length) errors.push(`${path}: faltan ${missing.join(', ')}`);
    if (extra.length) errors.push(`${path}: sobran ${extra.join(', ')}`);
    return false;
  }
  return true;
}

function capturePctRecord(source, required, path, errors) {
  if (!isRecordObject(source)) {
    errors.push(`${path} inválido`);
    return null;
  }
  exactKeys(source, required, path, errors);
  const out = {};
  for (const key of required) {
    const read = ownData(source, key, `${path}.${key}`, errors);
    if (!read.ok) continue;
    const value = read.value;
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors.push(`${path}.${key} fuera de 0..100`);
      continue;
    }
    out[key] = value;
  }
  return out;
}

function captureKnowledge(source, errors) {
  if (!isRecordObject(source)) {
    errors.push('knowledge inválido');
    return null;
  }
  exactKeys(source, REQUIRED_KNOWLEDGE, 'knowledge', errors);
  const out = {};
  for (const key of REQUIRED_KNOWLEDGE) {
    const read = ownData(source, key, `knowledge.${key}`, errors);
    if (!read.ok) continue;
    if (!isKnowledgeState(read.value)) {
      errors.push(`knowledge.${key} inválido: ${read.value}`);
      continue;
    }
    out[key] = read.value;
  }
  return out;
}

function captureBehavior(source, errors) {
  if (!isRecordObject(source)) {
    errors.push('behaviorState inválido');
    return null;
  }
  exactKeys(source, REQUIRED_BEHAVIOR, 'behaviorState', errors);
  const last = ownData(source, 'lastAction', 'behaviorState.lastAction', errors);
  const turns = ownData(source, 'consecutiveTurns', 'behaviorState.consecutiveTurns', errors);
  const out = {};

  if (last.ok) {
    if (!(last.value === null || ACTION_ORDER.includes(last.value))) errors.push('behaviorState.lastAction inválido');
    else out.lastAction = last.value;
  }
  if (turns.ok) {
    if (!Number.isInteger(turns.value) || turns.value < 0) errors.push('behaviorState.consecutiveTurns inválido');
    else out.consecutiveTurns = turns.value;
  }
  if (last.ok && turns.ok) {
    if (last.value === null && turns.value !== 0) errors.push('behaviorState inconsistente: sin acción debe tener consecutiveTurns=0');
    if (last.value !== null && turns.value < 1) errors.push('behaviorState inconsistente: con acción debe tener consecutiveTurns>=1');
  }
  return out;
}

function captureNpc(npc) {
  const errors = [];
  if (!isRecordObject(npc)) return { errors: ['NPC inválido'], snapshot: null };

  const idR = ownData(npc, 'id', 'id', errors);
  const nameR = ownData(npc, 'name', 'name', errors);
  const roleR = ownData(npc, 'role', 'role', errors);
  const traitsR = ownData(npc, 'traits', 'traits', errors);
  const relationR = ownData(npc, 'relationPlayer', 'relationPlayer', errors);
  const knowledgeR = ownData(npc, 'knowledge', 'knowledge', errors);
  const behaviorR = ownData(npc, 'behaviorState', 'behaviorState', errors);

  if (idR.ok && (typeof idR.value !== 'string' || !idR.value.trim())) errors.push('id inválido');
  if (nameR.ok && (typeof nameR.value !== 'string' || !nameR.value.trim())) errors.push('name inválido');
  if (roleR.ok && (typeof roleR.value !== 'string' || !roleR.value.trim())) errors.push('role inválido');

  const traits = traitsR.ok ? capturePctRecord(traitsR.value, REQUIRED_TRAITS, 'traits', errors) : null;
  const relationPlayer = relationR.ok ? capturePctRecord(relationR.value, REQUIRED_RELATION, 'relationPlayer', errors) : null;
  const knowledge = knowledgeR.ok ? captureKnowledge(knowledgeR.value, errors) : null;
  const behaviorState = behaviorR.ok ? captureBehavior(behaviorR.value, errors) : null;

  const snapshot = errors.length ? null : {
    id: idR.value,
    name: nameR.value,
    role: roleR.value,
    traits,
    relationPlayer,
    knowledge,
    behaviorState,
  };
  return { errors, snapshot };
}

function captureActionContext(context) {
  const errors = [];
  if (!isRecordObject(context)) return { errors: ['Contexto inválido'], snapshot: null };
  const values = {};

  for (const key of REQUIRED_ACTION_CONTEXT) {
    const read = ownData(context, key, `context.${key}`, errors);
    if (read.ok) values[key] = read.value;
  }

  for (const key of ['playerPresent', 'playerRequestsHelp', 'anomalyPresent', 'awayFromPost', 'superiorReachable']) {
    if (Object.hasOwn(values, key) && typeof values[key] !== 'boolean') errors.push(`context.${key} debe ser boolean`);
  }
  for (const key of ['dutyImportance', 'danger', 'missionUrgency']) {
    if (Object.hasOwn(values, key) && (!Number.isFinite(values[key]) || values[key] < 0 || values[key] > 100)) {
      errors.push(`context.${key} fuera de 0..100`);
    }
  }
  if (Object.hasOwn(values, 'playerRank') && (!Number.isInteger(values.playerRank) || values.playerRank < 0 || values.playerRank > 6)) {
    errors.push('context.playerRank fuera de 0..6');
  }
  if (Object.hasOwn(values, 'relevantKnowledge') && !isKnowledgeState(values.relevantKnowledge)) {
    errors.push('context.relevantKnowledge inválido');
  }
  if (Object.hasOwn(values, 'dutyMode') && !DUTY_MODES.includes(values.dutyMode)) {
    errors.push('context.dutyMode inválido');
  }

  return { errors, snapshot: errors.length ? null : values };
}

function captureDialogueContext(context) {
  const errors = [];
  if (!isRecordObject(context)) return { errors: ['Contexto de diálogo inválido'], snapshot: null };
  const values = {};

  for (const key of REQUIRED_DIALOGUE_CONTEXT) {
    const read = ownData(context, key, `dialogue.${key}`, errors);
    if (read.ok) values[key] = read.value;
  }

  if (Object.hasOwn(values, 'playerRank') && (!Number.isInteger(values.playerRank) || values.playerRank < 0 || values.playerRank > 6)) {
    errors.push('dialogue.playerRank fuera de 0..6');
  }
  for (const key of ['topicSensitivity', 'formalRestriction']) {
    if (Object.hasOwn(values, key) && (!Number.isFinite(values[key]) || values[key] < 0 || values[key] > 100)) {
      errors.push(`dialogue.${key} fuera de 0..100`);
    }
  }

  return { errors, snapshot: errors.length ? null : values };
}

function validateNpc(npc) {
  return captureNpc(npc).errors;
}

function validateActionContext(context) {
  return captureActionContext(context).errors;
}

function validateDialogueContext(context) {
  return captureDialogueContext(context).errors;
}

function requireNpcSnapshot(npc) {
  const captured = captureNpc(npc);
  if (captured.errors.length) throw new TypeError(`NPC inválido: ${captured.errors.join(' · ')}`);
  return captured.snapshot;
}

function requireActionSnapshot(context) {
  const captured = captureActionContext(context);
  if (captured.errors.length) throw new TypeError(`Contexto inválido: ${captured.errors.join(' · ')}`);
  return captured.snapshot;
}

function requireDialogueSnapshot(context) {
  const captured = captureDialogueContext(context);
  if (captured.errors.length) throw new TypeError(`Contexto de diálogo inválido: ${captured.errors.join(' · ')}`);
  return captured.snapshot;
}

function trait(npc, key) { return pct(npc.traits[key]); }
function rel(npc, key) { return pct(npc.relationPlayer[key]); }
function ctx(context, key) { return pct(context[key]); }

function score(name, base, parts = [], available = true, reasonUnavailable = '') {
  if (!available) return { name, available: false, score: -Infinity, raw: -Infinity, contributions: [], reasonUnavailable };
  const contributions = parts.map(([label, value]) => ({ label, value }));
  const raw = base + contributions.reduce((sum, x) => sum + x.value, 0);
  if (!Number.isFinite(raw) || contributions.some(x => !Number.isFinite(x.value))) {
    throw new RangeError(`Utilidad no finita en acción ${name}`);
  }
  return { name, available: true, raw, score: clamp(raw), contributions };
}

function inertiaBonus(npc, action) {
  const state = npc.behaviorState;
  if (state.lastAction !== action || state.consecutiveTurns < 1) return 0;
  return Math.max(0, 8 - state.consecutiveTurns * 2);
}

function addInertia(npc, action, parts) {
  const bonus = inertiaBonus(npc, action);
  if (bonus > 0) parts.push(['inercia decreciente', bonus]);
  return parts;
}

function compareEvaluated(a, b) {
  if (a.available !== b.available) return a.available ? -1 : 1;
  if (!a.available && !b.available) return ACTION_ORDER.indexOf(a.name) - ACTION_ORDER.indexOf(b.name);
  if (b.score !== a.score) return b.score - a.score;
  if (b.raw !== a.raw) return b.raw - a.raw;
  return ACTION_ORDER.indexOf(a.name) - ACTION_ORDER.indexOf(b.name);
}

function evaluateActionsFromSnapshot(npc, context) {
  const playerPresent = context.playerPresent;
  const playerRequestsHelp = context.playerRequestsHelp && playerPresent;
  const anomalyPresent = context.anomalyPresent;
  const awayFromPost = context.awayFromPost;
  const superiorReachable = context.superiorReachable;

  const discipline = trait(npc, 'disciplina');
  const sociability = trait(npc, 'sociabilidad');
  const curiosity = trait(npc, 'curiosidad');
  const prudence = trait(npc, 'prudencia');
  const institutional = trait(npc, 'lealtad_institucional');
  const empathy = trait(npc, 'empatia');

  const affinity = rel(npc, 'afinidad');
  const trust = rel(npc, 'confianza');
  const respect = rel(npc, 'respeto');
  const debt = rel(npc, 'deuda');
  const fear = rel(npc, 'temor');
  const rivalry = rel(npc, 'rivalidad');

  const duty = ctx(context, 'dutyImportance');
  const danger = ctx(context, 'danger');
  const urgency = ctx(context, 'missionUrgency');
  const playerRank = rankNorm(context.playerRank);
  const relevantKnowledge = knowledgeNorm(context.relevantKnowledge);

  const scores = [];
  scores.push(score('vigilar', 8, addInertia(npc, 'vigilar', [
    ['disciplina', discipline * 0.34], ['lealtad institucional', institutional * 0.24],
    ['importancia del puesto', duty * 0.30], ['prudencia', prudence * 0.10], ['urgencia externa', -urgency * 0.12],
  ]), context.dutyMode === 'vigilar', 'No tiene una guardia activa asignada.'));

  scores.push(score('trabajar', 7, addInertia(npc, 'trabajar', [
    ['disciplina', discipline * 0.27], ['lealtad institucional', institutional * 0.19],
    ['importancia de la tarea', duty * 0.27], ['urgencia externa', -urgency * 0.08],
  ]), context.dutyMode === 'trabajar', 'No tiene una tarea de trabajo activa asignada.'));

  scores.push(score('patrullar', 6, addInertia(npc, 'patrullar', [
    ['disciplina', discipline * 0.22], ['prudencia', prudence * 0.16], ['importancia del puesto', duty * 0.13],
    ['peligro', danger * 0.13], ['curiosidad', curiosity * 0.08],
  ]), context.dutyMode === 'patrullar', 'No tiene una patrulla activa asignada.'));

  scores.push(score('hablar_jugador', 5, addInertia(npc, 'hablar_jugador', [
    ['sociabilidad', sociability * 0.27], ['afinidad', affinity * 0.17], ['confianza', trust * 0.18],
    ['respeto', respect * 0.11], ['rango del jugador', playerRank * 0.08],
    ['conocimiento relevante', relevantKnowledge * 0.08], ['rivalidad', -rivalry * 0.10], ['temor', -fear * 0.05],
  ]), playerPresent, 'El jugador no está presente.'));

  scores.push(score('ayudar_jugador', 4, addInertia(npc, 'ayudar_jugador', [
    ['empatía', empathy * 0.29], ['afinidad', affinity * 0.22], ['confianza', trust * 0.24], ['deuda', debt * 0.20],
    ['respeto', respect * 0.10], ['rango del jugador', playerRank * 0.07], ['urgencia', urgency * 0.23],
    ['importancia del puesto', -duty * 0.25], ['prudencia ante peligro', -prudence * danger / 500], ['rivalidad', -rivalry * 0.12],
  ]), playerRequestsHelp, 'El jugador no está presente o no pidió ayuda.'));

  scores.push(score('investigar', 5, addInertia(npc, 'investigar', [
    ['curiosidad', curiosity * 0.48], ['audacia', (100 - prudence) * 0.19], ['urgencia', urgency * 0.13],
    ['peligro', danger * 0.08], ['deber institucional', institutional * 0.06],
  ]), anomalyPresent, 'No hay una anomalía que investigar.'));

  scores.push(score('informar_superior', 4, addInertia(npc, 'informar_superior', [
    ['prudencia', prudence * 0.24], ['disciplina', discipline * 0.20], ['lealtad institucional', institutional * 0.20],
    ['peligro', danger * 0.20], ['urgencia', urgency * 0.18],
  ]), superiorReachable && (anomalyPresent || danger >= 35 || urgency >= 50), 'No existe motivo suficiente o el superior no es alcanzable.'));

  scores.push(score('regresar_puesto', 10, addInertia(npc, 'regresar_puesto', [
    ['disciplina', discipline * 0.38], ['lealtad institucional', institutional * 0.24],
    ['importancia del puesto', duty * 0.25], ['prudencia', prudence * 0.08],
  ]), awayFromPost, 'El NPC ya está en su puesto/territorio de referencia.'));

  scores.push(score('esperar', 3, addInertia(npc, 'esperar', [
    ['prudencia', prudence * 0.18], ['baja curiosidad', (100 - curiosity) * 0.08],
    ['baja urgencia', (100 - urgency) * 0.06], ['bajo peligro', (100 - danger) * 0.04],
  ])));

  return scores;
}

function chooseFromSnapshots(npc, context) {
  const scores = evaluateActionsFromSnapshot(npc, context);
  const available = scores.filter(x => x.available).sort(compareEvaluated);
  if (!available.length) throw new Error('No hay acciones disponibles.');
  const selected = available[0];
  return {
    action: selected.name,
    score: selected.score,
    raw: selected.raw,
    ranking: scores.slice().sort(compareEvaluated),
    explanation: selected.contributions.slice().sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
    tieBreak: 'score > raw > ACTION_ORDER',
  };
}

function evaluateActions(npc, context) {
  return evaluateActionsFromSnapshot(requireNpcSnapshot(npc), requireActionSnapshot(context));
}

function chooseAction(npc, context) {
  return chooseFromSnapshots(requireNpcSnapshot(npc), requireActionSnapshot(context));
}

function evaluateDialogueTopic(npc, topicId, context) {
  const npcSnapshot = requireNpcSnapshot(npc);
  const dialogueSnapshot = requireDialogueSnapshot(context);

  if (typeof topicId !== 'string' || !Object.hasOwn(npcSnapshot.knowledge, topicId)) {
    throw new RangeError(`Tema no definido para el laboratorio: ${topicId}`);
  }

  const state = npcSnapshot.knowledge[topicId];
  const level = KNOWLEDGE[state];
  const trust = rel(npcSnapshot, 'confianza');
  const affinity = rel(npcSnapshot, 'afinidad');
  const respect = rel(npcSnapshot, 'respeto');
  const debt = rel(npcSnapshot, 'deuda');
  const rivalry = rel(npcSnapshot, 'rivalidad');
  const prudence = trait(npcSnapshot, 'prudencia');
  const sociability = trait(npcSnapshot, 'sociabilidad');
  const rank = rankNorm(dialogueSnapshot.playerRank);
  const sensitivity = pct(dialogueSnapshot.topicSensitivity);
  const formalRestriction = pct(dialogueSnapshot.formalRestriction);

  if (level === KNOWLEDGE.DESCONOCIDO) {
    return {
      topicId, state, mode: 'NO_SABE', disclosure: 0, raw: 0,
      explanation: ['El NPC no posee este conocimiento. Nunca puede revelarlo.'],
    };
  }

  const contributions = [
    ['confianza', trust * 0.30], ['afinidad', affinity * 0.14], ['respeto', respect * 0.13], ['deuda', debt * 0.16],
    ['rango del jugador', rank * 0.12], ['sociabilidad', sociability * 0.08], ['rivalidad', -rivalry * 0.17],
    ['prudencia', -prudence * 0.13], ['sensibilidad del tema', -sensitivity * 0.22],
    ['restricción institucional', -formalRestriction * 0.25], ['certeza propia', level * 8],
  ];
  const raw = 30 + contributions.reduce((sum, [, value]) => sum + value, 0);
  if (!Number.isFinite(raw) || contributions.some(([, value]) => !Number.isFinite(value))) {
    throw new RangeError('Disclosure no finito');
  }
  const disclosure = clamp(raw);

  let mode;
  if (state === 'SOSPECHA') mode = disclosure >= 42 ? 'INSINUA' : 'RESERVA';
  else if (disclosure >= 65) mode = 'COMPARTE';
  else if (disclosure >= 42) mode = 'INSINUA';
  else mode = 'RESERVA';

  return {
    topicId, state, mode, disclosure, raw,
    explanation: contributions.map(([label, value]) => ({ label, value })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
  };
}

function simulateTurn(npc, context) {
  const npcSnapshot = requireNpcSnapshot(npc);
  const contextSnapshot = requireActionSnapshot(context);
  const decision = chooseFromSnapshots(npcSnapshot, contextSnapshot);
  const nextNpc = structuredClone(npcSnapshot);
  const previous = nextNpc.behaviorState;

  if (previous.lastAction === decision.action) previous.consecutiveTurns += 1;
  else {
    previous.lastAction = decision.action;
    previous.consecutiveTurns = 1;
  }

  return {
    npcId: npcSnapshot.id,
    action: decision.action,
    actionScore: decision.score,
    actionRaw: decision.raw,
    actionRanking: decision.ranking,
    actionExplanation: decision.explanation,
    nextNpc,
  };
}

export { ACTION_ORDER, DUTY_MODES, KNOWLEDGE, RANKS, chooseAction, evaluateActions, evaluateDialogueTopic, simulateTurn, validateActionContext, validateDialogueContext, validateNpc };
