import { deriveRelations } from '../motor-npc-vivo-v0.3.1-relaciones/relation-deriver.js';
import { chooseAction } from '../../utility-ai/motor-npc-vivo-v0.1.1/engine.js';
import { planGOAP } from '../../goap/motor-npc-vivo-v0.2-goap/goap.js';
import { GOALS, GOAL_RELEVANCE } from '../../goap/motor-npc-vivo-v0.2-goap/goal-selector.js';
import { GOAP_ACTIONS } from '../../goap/motor-npc-vivo-v0.2-goap/actions.js';

const NPC_FIELDS = Object.freeze([
  'id', 'name', 'role', 'traits', 'relationPlayer', 'knowledge', 'behaviorState',
]);
const CONTEXT_FIELDS = Object.freeze([
  'playerPresent', 'playerRequestsHelp', 'playerRank', 'dutyImportance',
  'danger', 'missionUrgency', 'anomalyPresent', 'awayFromPost',
  'superiorReachable', 'relevantKnowledge', 'dutyMode',
]);

const ACTION_TO_GOAL = Object.freeze({
  ayudar_jugador: 'HELP_PLAYER',
  investigar: 'INVESTIGATE_ANOMALY',
  informar_superior: 'REPORT_SUPERIOR',
  vigilar: 'FULFILL_DUTY',
  trabajar: 'FULFILL_DUTY',
  patrullar: 'FULFILL_DUTY',
  regresar_puesto: 'RETURN_POST',
  esperar: 'WAIT_SAFE',
  hablar_jugador: null,
});

function descriptorsOf(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} debe ser un objeto plano`);
  }
  try {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${label} debe ser un objeto plano`);
    }
    return Object.getOwnPropertyDescriptors(value);
  } catch (error) {
    if (error instanceof TypeError && error.message === `${label} debe ser un objeto plano`) throw error;
    throw new TypeError(`${label}: no se pudieron inspeccionar las propiedades`);
  }
}

function captureRequired(value, fields, label) {
  const descriptors = descriptorsOf(value, label);
  const snapshot = {};
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(descriptors, field)?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}.${field} debe ser propiedad de datos propia`);
    }
    Object.defineProperty(snapshot, field, {
      value: descriptor.value, enumerable: true, configurable: true, writable: true,
    });
  }
  return snapshot;
}

function captureWorld(world) {
  const descriptors = descriptorsOf(world, 'world');
  const keys = Reflect.ownKeys(descriptors);
  if (keys.some(key => typeof key !== 'string')) {
    throw new TypeError('world no admite claves Symbol');
  }
  const snapshot = {};
  for (const key of keys.sort()) {
    if (!key) throw new TypeError('world no admite claves vacías');
    const descriptor = Object.getOwnPropertyDescriptor(descriptors, key).value;
    if (!Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`world.${key} debe ser propiedad de datos propia`);
    }
    const value = descriptor.value;
    if (!(value === null || ['string', 'boolean', 'number'].includes(typeof value)) ||
        (typeof value === 'number' && !Number.isFinite(value))) {
      throw new TypeError(`world.${key} debe ser un primitivo finito o null`);
    }
    Object.defineProperty(snapshot, key, {
      value, enumerable: true, configurable: true, writable: true,
    });
  }
  return snapshot;
}

function capturePlannerOptions(options) {
  const descriptors = descriptorsOf(options, 'plannerOptions');
  const snapshot = {};
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string' || !['maxExpansions', 'maxFrontier'].includes(key)) {
      throw new TypeError('plannerOptions contiene una clave no admitida');
    }
    const descriptor = Object.getOwnPropertyDescriptor(descriptors, key).value;
    if (!Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`plannerOptions.${key} debe ser propiedad de datos propia`);
    }
    snapshot[key] = descriptor.value;
  }
  return snapshot;
}

function assertCoherent(context, world) {
  for (const key of ['playerPresent', 'playerNeedsHelp', 'playerHelped',
    'anomalyPresent', 'anomalyInvestigated']) {
    if (typeof world[key] !== 'boolean') throw new TypeError(`world.${key} debe ser boolean`);
  }
  if (typeof world.at !== 'string') throw new TypeError('world.at debe ser string');
  for (const key of ['dutyImportance', 'danger', 'urgency']) {
    if (typeof world[key] !== 'number' || !Number.isFinite(world[key])) {
      throw new TypeError(`world.${key} debe ser número finito`);
    }
  }
  const pairs = [
    ['playerPresent', context.playerPresent, world.playerPresent],
    ['playerRequestsHelp', context.playerRequestsHelp, world.playerNeedsHelp && !world.playerHelped],
    ['anomalyPresent', context.anomalyPresent, world.anomalyPresent && !world.anomalyInvestigated],
    ['awayFromPost', context.awayFromPost, world.at !== 'puesto'],
    ['dutyImportance', context.dutyImportance, world.dutyImportance],
    ['danger', context.danger, world.danger],
    ['missionUrgency', context.missionUrgency, world.urgency],
  ];
  for (const [name, actual, expected] of pairs) {
    if (actual !== expected) throw new TypeError(`context/world incoherentes: ${name}`);
  }
}

/** Deriva, decide y planifica sin mutar los inputs ni ejecutar el plan. */
function decideFromMemory(npc, memory, currentTurn, utilityContext, world, plannerOptions = {}) {
  const npcSnapshot = captureRequired(npc, NPC_FIELDS, 'npc');
  const contextSnapshot = captureRequired(utilityContext, CONTEXT_FIELDS, 'utilityContext');
  const worldSnapshot = captureWorld(world);
  const optionsSnapshot = capturePlannerOptions(plannerOptions);
  assertCoherent(contextSnapshot, worldSnapshot);

  const relationDerivation = deriveRelations(npcSnapshot.relationPlayer, memory, currentTurn);
  const temporaryNpc = { ...npcSnapshot, relationPlayer: relationDerivation.relations };
  const selected = chooseAction(temporaryNpc, contextSnapshot);
  // Utility usa -Infinity como centinela interno para acciones indisponibles.
  // En la traza pública, null expresa mejor que no existe un score numérico.
  const utilityDecision = {
    ...selected,
    ranking: selected.ranking.map(item => item.available ? item
      : { ...item, score: null, raw: null }),
  };
  if (!Object.hasOwn(ACTION_TO_GOAL, utilityDecision.action)) {
    throw new Error(`Acción Utility desconocida: ${utilityDecision.action}`);
  }
  const goalId = ACTION_TO_GOAL[utilityDecision.action];
  const mapping = { utilityAction: utilityDecision.action, goalId };
  if (goalId === null) {
    return {
      status: 'UTILITY_ACTION_UNMAPPED', relationDerivation, utilityDecision,
      mapping, goalId: null, goal: null, relevance: null, plan: null,
    };
  }

  const goal = { ...GOALS[goalId] };
  const relevance = { ...GOAL_RELEVANCE[goalId] };
  const planned = planGOAP(worldSnapshot, goal, GOAP_ACTIONS, optionsSnapshot);
  const status = planned.status === 'PLAN_FOUND' ? 'PLAN_READY'
    : ['SEARCH_LIMIT', 'FRONTIER_LIMIT', 'COST_OVERFLOW'].includes(planned.status)
      ? 'PLANNING_DEFERRED'
      : planned.status === 'NO_PLAN' ? 'NO_PLAN' : null;
  if (status === null) throw new Error(`Estado GOAP desconocido: ${planned.status}`);
  const plan = status === 'PLAN_READY'
    ? { ...planned, goal: { ...goal }, relevance: { ...relevance }, goalId,
      utilityAction: utilityDecision.action }
    : planned;
  return { status, relationDerivation, utilityDecision, mapping,
    goalId, goal, relevance, plan };
}

export { ACTION_TO_GOAL, decideFromMemory };
