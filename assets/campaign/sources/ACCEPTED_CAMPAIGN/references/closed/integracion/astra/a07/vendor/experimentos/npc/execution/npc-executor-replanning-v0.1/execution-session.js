import { executeNext } from '../../goap/motor-npc-vivo-v0.2-goap/executor.js';
import { planGOAP, factsMatch } from '../../goap/motor-npc-vivo-v0.2-goap/goap.js';

function fail(message) { throw new TypeError(`Execution session: ${message}`); }

function record(value, fields, label, exact = true) {
  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) fail(`${label} debe ser objeto plano`);
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) fail(`${label} tiene herencia`);
    const keys = Reflect.ownKeys(value);
    if (keys.some(key => typeof key !== 'string' || !fields.includes(key)) || (exact && keys.length !== fields.length)) fail(`${label} tiene campos inválidos`);
    const entries = [];
    for (const field of fields) {
      const descriptor = Object.getOwnPropertyDescriptor(value, field);
      if (!descriptor) {
        if (exact) fail(`${label}.${field} falta`);
        continue;
      }
      if (!Object.hasOwn(descriptor, 'value')) fail(`${label}.${field} es accessor`);
      entries.push([field, descriptor.value]);
    }
    return Object.fromEntries(entries);
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith('Execution session:')) throw error;
    fail(`${label} no admite inspección estructural`);
  }
}

function facts(value, label) {
  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) fail(`${label} debe ser objeto plano`);
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) fail(`${label} tiene herencia`);
    const entries = [];
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string' || key.length === 0) fail(`${label} tiene clave inválida`);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) fail(`${label}.${key} es accessor`);
      const item = descriptor.value;
      if (item !== null && !['boolean', 'string', 'number'].includes(typeof item)) fail(`${label}.${key} debe ser primitivo GOAP`);
      if (typeof item === 'number' && !Number.isFinite(item)) fail(`${label}.${key} debe ser finito`);
      entries.push([key, item]);
    }
    return Object.fromEntries(entries);
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith('Execution session:')) throw error;
    fail(`${label} no admite inspección estructural`);
  }
}

function plan(value, label) {
  try {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) fail(`${label} debe ser array ordinario`);
    const length = Object.getOwnPropertyDescriptor(value, 'length');
    if (!length || !Object.hasOwn(length, 'value')) fail(`${label} no tiene longitud válida`);
    if (Reflect.ownKeys(value).length !== length.value + 1) fail(`${label} tiene huecos o propiedades extra`);
    const result = [];
    for (let index = 0; index < length.value; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) fail(`${label}[${index}] es hueco o accessor`);
      if (typeof descriptor.value !== 'string' || descriptor.value.trim().length === 0) fail(`${label}[${index}] debe ser ID no vacío`);
      result.push(descriptor.value);
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith('Execution session:')) throw error;
    fail(`${label} no admite inspección estructural`);
  }
}

function nonblank(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} debe ser string no vacío`);
  return value;
}

function counter(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) fail(`${label} debe ser entero seguro >= 0`);
  return value;
}

function increment(value, label) {
  if (value === Number.MAX_SAFE_INTEGER) throw new RangeError(`${label} excede entero seguro`);
  return value + 1;
}

function sessionSnapshot(value) {
  const s = record(value, ['version', 'mode', 'goalId', 'goal', 'relevance', 'plan', 'stepCount', 'replanCount'], 'session');
  if (s.version !== 1 || !['ACTIVE', 'REPLAN_PENDING'].includes(s.mode)) fail('session.version o mode inválido');
  nonblank(s.goalId, 'session.goalId');
  s.goal = facts(s.goal, 'session.goal');
  s.relevance = facts(s.relevance, 'session.relevance');
  if (s.mode === 'ACTIVE') s.plan = plan(s.plan, 'session.plan');
  else if (s.plan !== null) fail('session REPLAN_PENDING requiere plan null');
  counter(s.stepCount, 'session.stepCount');
  counter(s.replanCount, 'session.replanCount');
  return s;
}

function optionsSnapshot(value) {
  const options = record(value, ['maxExpansions', 'maxFrontier'], 'plannerOptions', false);
  if (Object.hasOwn(options, 'maxExpansions') && (!Number.isInteger(options.maxExpansions) || options.maxExpansions < 0)) fail('maxExpansions debe ser entero >= 0');
  if (Object.hasOwn(options, 'maxFrontier') && (!Number.isInteger(options.maxFrontier) || options.maxFrontier < 1)) fail('maxFrontier debe ser entero >= 1');
  return options;
}

function output(status, session, world, executed, reason, goalObsolete, replan, counters) {
  return { status, session, world, executed, reason, goalObsolete, replan, counters };
}

function attemptReplan(session, world, actions, plannerOptions, reason) {
  const replanCount = increment(session.replanCount, 'replanCount');
  const planned = planGOAP(world, session.goal, actions, plannerOptions);
  const replan = { attempted: true, plannerStatus: planned.status, cost: planned.cost,
    expansions: planned.expansions, generated: planned.generated, maxFrontier: planned.maxFrontier };
  if (planned.status === 'PLAN_FOUND') {
    const next = { ...session, mode: 'ACTIVE', plan: [...planned.plan], replanCount };
    return output('REPLAN_READY', next, world, null, reason, false, replan,
      { stepCount: next.stepCount, replanCount });
  }
  if (planned.status === 'NO_PLAN' || ['SEARCH_LIMIT', 'FRONTIER_LIMIT', 'COST_OVERFLOW'].includes(planned.status)) {
    const next = { ...session, mode: 'REPLAN_PENDING', plan: null, replanCount };
    return output(planned.status === 'NO_PLAN' ? 'NO_PLAN_FOR_GOAL' : 'PLANNING_DEFERRED',
      next, world, null, reason, false, replan, { stepCount: next.stepCount, replanCount });
  }
  throw new Error(`Estado GOAP inesperado: ${planned.status}`);
}

function createExecutionSession(input) {
  const initial = record(input, ['goalId', 'goal', 'relevance', 'plan'], 'create input');
  return { version: 1, mode: 'ACTIVE', goalId: nonblank(initial.goalId, 'goalId'),
    goal: facts(initial.goal, 'goal'), relevance: facts(initial.relevance, 'relevance'),
    plan: plan(initial.plan, 'plan'), stepCount: 0, replanCount: 0 };
}

function advanceExecutionSession(session, world, actions, plannerOptions = {}) {
  const current = sessionSnapshot(session);
  const currentWorld = facts(world, 'world');
  const options = optionsSnapshot(plannerOptions);
  if (current.mode === 'REPLAN_PENDING') {
    if (factsMatch(currentWorld, current.goal)) return output('GOAL_REACHED', null, currentWorld, null,
      'Goal satisfecho externamente.', false, null, { stepCount: current.stepCount, replanCount: current.replanCount });
    if (!factsMatch(currentWorld, current.relevance)) return output('INTENT_REEVALUATION_REQUIRED', null,
      currentWorld, null, 'El objetivo dejó de ser relevante.', true, null,
      { stepCount: current.stepCount, replanCount: current.replanCount });
    return attemptReplan(current, currentWorld, actions, options, 'Retry desde REPLAN_PENDING.');
  }

  const boundPlan = { status: 'PLAN_FOUND', plan: current.plan, goal: current.goal,
    relevance: current.relevance, goalId: current.goalId };
  const execution = executeNext(boundPlan, currentWorld, undefined, actions, undefined);
  if (execution.status === 'STEP_APPLIED' || execution.status === 'GOAL_REACHED') {
    const stepCount = execution.executed === null ? current.stepCount : increment(current.stepCount, 'stepCount');
    const counters = { stepCount, replanCount: current.replanCount };
    if (execution.status === 'GOAL_REACHED') return output('GOAL_REACHED', null, execution.world,
      execution.executed, execution.executed === null ? 'Goal satisfecho externamente.' : 'Goal alcanzado.',
      false, null, counters);
    const next = { ...current, mode: 'ACTIVE', plan: [...execution.remainingPlan], stepCount };
    return output('STEP_APPLIED', next, execution.world, execution.executed, 'Paso aplicado.', false, null, counters);
  }
  if (execution.status === 'REPLAN_REQUIRED') {
    if (execution.goalObsolete) return output('INTENT_REEVALUATION_REQUIRED', null,
      execution.world, null, execution.reason, true, null,
      { stepCount: current.stepCount, replanCount: current.replanCount });
    return attemptReplan(current, execution.world, actions, options, execution.reason);
  }
  throw new Error(`Estado Executor inesperado: ${execution.status}`);
}

export { advanceExecutionSession, createExecutionSession };
