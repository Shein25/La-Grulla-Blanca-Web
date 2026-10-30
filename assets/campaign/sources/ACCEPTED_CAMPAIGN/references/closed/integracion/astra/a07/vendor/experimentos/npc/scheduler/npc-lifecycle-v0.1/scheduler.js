const EVENT_KINDS = Object.freeze([
  'PLAN_INVALIDATED', 'ACTION_FINISHED', 'MEMORY_CHANGED', 'WORLD_CHANGED',
]);
const REASON_ORDER = Object.freeze([...EVENT_KINDS, 'PERIODIC']);
const REASON_PRIORITY = Object.freeze({
  PLAN_INVALIDATED: 100,
  ACTION_FINISHED: 80,
  MEMORY_CHANGED: 60,
  WORLD_CHANGED: 50,
  PERIODIC: 10,
});

const MAX = Number.MAX_SAFE_INTEGER;
const CONFIG_FIELDS = Object.freeze(['id', 'interval', 'minGap', 'firstPeriodicTurn']);
const STATE_NPC_FIELDS = Object.freeze([
  'id', 'interval', 'minGap', 'nextPeriodicTurn', 'lastDispatchTurn', 'pendingReasons',
]);
const REASON_FIELDS = Object.freeze(['kind', 'firstTurn', 'lastTurn', 'count']);

function descriptors(input, label, array = false) {
  if (array ? !Array.isArray(input)
    : input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError(`${label} debe ser ${array ? 'array' : 'objeto plano'}`);
  }
  try {
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== (array ? Array.prototype : Object.prototype) &&
        !(prototype === null && !array)) {
      throw new TypeError(`${label} debe ser ${array ? 'array' : 'objeto plano'}`);
    }
    return Object.getOwnPropertyDescriptors(input);
  } catch {
    throw new TypeError(`${label}: no se pudieron capturar propiedades propias`);
  }
}

function record(input, fields, label) {
  const all = descriptors(input, label);
  const keys = Reflect.ownKeys(all);
  if (keys.length !== fields.length || keys.some(key =>
    typeof key !== 'string' || !fields.includes(key))) {
    throw new TypeError(`${label} debe contener exactamente: ${fields.join(', ')}`);
  }
  const out = {};
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(all, field)?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}.${field} debe ser propiedad de datos propia`);
    }
    out[field] = descriptor.value;
  }
  return out;
}

function arrayItems(input, label) {
  const all = descriptors(input, label, true);
  const lengthDescriptor = Object.getOwnPropertyDescriptor(all, 'length')?.value;
  if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor, 'value')) {
    throw new TypeError(`${label}.length inválido`);
  }
  const length = lengthDescriptor.value;
  if (!Number.isSafeInteger(length) || length < 0 || Reflect.ownKeys(all).length !== length + 1) {
    throw new TypeError(`${label} contiene holes, símbolos o propiedades adicionales`);
  }
  const out = [];
  for (let index = 0; index < length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(all, String(index))?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}[${index}] debe ser propiedad de datos propia`);
    }
    out.push(descriptor.value);
  }
  return out;
}

function id(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} debe ser string no vacío`);
  return value;
}
function safeInt(value, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(`${label} debe ser entero seguro >= ${minimum}`);
  }
  return value;
}
function addSafe(a, b, label) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a > MAX - b) {
    throw new RangeError(`${label}: overflow de entero seguro`);
  }
  return a + b;
}
function compareString(a, b) { return a === b ? 0 : a < b ? -1 : 1; }
function compareReasons(a, b) {
  return REASON_PRIORITY[b.kind] - REASON_PRIORITY[a.kind] ||
    REASON_ORDER.indexOf(a.kind) - REASON_ORDER.indexOf(b.kind);
}
function sortedReasons(reasons) { return reasons.sort(compareReasons); }

function createSchedulerState(configs) {
  const captured = arrayItems(configs, 'configs');
  const npcs = [];
  const ids = new Set();
  for (let index = 0; index < captured.length; index++) {
    const config = record(captured[index], CONFIG_FIELDS, `configs[${index}]`);
    id(config.id, `configs[${index}].id`);
    safeInt(config.interval, `configs[${index}].interval`, 1);
    safeInt(config.minGap, `configs[${index}].minGap`);
    safeInt(config.firstPeriodicTurn, `configs[${index}].firstPeriodicTurn`);
    if (ids.has(config.id)) throw new TypeError(`id duplicado: ${config.id}`);
    ids.add(config.id);
    npcs.push({
      id: config.id, interval: config.interval, minGap: config.minGap,
      nextPeriodicTurn: config.firstPeriodicTurn,
      lastDispatchTurn: null, pendingReasons: [],
    });
  }
  npcs.sort((a, b) => compareString(a.id, b.id));
  return { version: 1, clock: null, npcs };
}

function captureState(state) {
  const top = record(state, ['version', 'clock', 'npcs'], 'state');
  if (top.version !== 1) throw new TypeError('state.version debe ser 1');
  if (top.clock !== null) safeInt(top.clock, 'state.clock');
  const sourceNpcs = arrayItems(top.npcs, 'state.npcs');
  const npcs = [];
  const ids = new Set();
  for (let index = 0; index < sourceNpcs.length; index++) {
    const raw = record(sourceNpcs[index], STATE_NPC_FIELDS, `state.npcs[${index}]`);
    id(raw.id, `state.npcs[${index}].id`);
    safeInt(raw.interval, `state.npcs[${index}].interval`, 1);
    safeInt(raw.minGap, `state.npcs[${index}].minGap`);
    safeInt(raw.nextPeriodicTurn, `state.npcs[${index}].nextPeriodicTurn`);
    if (top.clock !== null && raw.nextPeriodicTurn <= top.clock) {
      throw new TypeError(`state.npcs[${index}].nextPeriodicTurn debe superar clock`);
    }
    if (raw.lastDispatchTurn !== null) {
      safeInt(raw.lastDispatchTurn, `state.npcs[${index}].lastDispatchTurn`);
      if (top.clock === null || raw.lastDispatchTurn > top.clock) {
        throw new TypeError(`state.npcs[${index}].lastDispatchTurn futuro`);
      }
    }
    if (ids.has(raw.id)) throw new TypeError(`state id duplicado: ${raw.id}`);
    ids.add(raw.id);
    const pendingReasons = [];
    const kinds = new Set();
    for (const [reasonIndex, item] of arrayItems(raw.pendingReasons,
      `state.npcs[${index}].pendingReasons`).entries()) {
      const reason = record(item, REASON_FIELDS,
        `state.npcs[${index}].pendingReasons[${reasonIndex}]`);
      if (!REASON_ORDER.includes(reason.kind)) throw new TypeError('pending reason kind inválido');
      safeInt(reason.firstTurn, 'pending.firstTurn');
      safeInt(reason.lastTurn, 'pending.lastTurn');
      safeInt(reason.count, 'pending.count', 1);
      if (reason.firstTurn > reason.lastTurn || top.clock === null || reason.lastTurn > top.clock) {
        throw new TypeError('pending reason turns inválidos');
      }
      if (kinds.has(reason.kind)) throw new TypeError('pending reason kind duplicado');
      kinds.add(reason.kind);
      pendingReasons.push(reason);
    }
    npcs.push({
      id: raw.id, interval: raw.interval, minGap: raw.minGap,
      nextPeriodicTurn: raw.nextPeriodicTurn,
      lastDispatchTurn: raw.lastDispatchTurn,
      pendingReasons: sortedReasons(pendingReasons),
    });
  }
  npcs.sort((a, b) => compareString(a.id, b.id));
  return { version: 1, clock: top.clock, npcs };
}

function captureEvents(events, ids) {
  const source = arrayItems(events, 'events');
  const out = [];
  for (let index = 0; index < source.length; index++) {
    const event = record(source[index], ['npcId', 'kind'], `events[${index}]`);
    id(event.npcId, `events[${index}].npcId`);
    if (!ids.has(event.npcId)) throw new TypeError(`events[${index}]: NPC inexistente`);
    if (!EVENT_KINDS.includes(event.kind)) throw new TypeError(`events[${index}].kind inválido`);
    out.push(event);
  }
  return out;
}

function captureOptions(options) {
  const all = descriptors(options, 'options');
  const keys = Reflect.ownKeys(all);
  if (keys.some(key => key !== 'maxDispatches')) {
    throw new TypeError('options contiene campo no permitido');
  }
  if (!keys.length) return { maxDispatches: 64 };
  const descriptor = Object.getOwnPropertyDescriptor(all, 'maxDispatches')?.value;
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
    throw new TypeError('options.maxDispatches debe ser propiedad de datos propia');
  }
  return { maxDispatches: safeInt(descriptor.value, 'options.maxDispatches', 1) };
}

function upsertReason(npc, kind, firstTurn, lastTurn, count) {
  const existing = npc.pendingReasons.find(reason => reason.kind === kind);
  if (existing) {
    existing.firstTurn = Math.min(existing.firstTurn, firstTurn);
    existing.lastTurn = Math.max(existing.lastTurn, lastTurn);
    existing.count = addSafe(existing.count, count, 'pending.count');
  } else {
    npc.pendingReasons.push({ kind, firstTurn, lastTurn, count });
  }
}

function advancePeriodic(npc, currentTurn) {
  const next = npc.nextPeriodicTurn;
  if (currentTurn < next) return;
  const count = Math.floor((currentTurn - next) / npc.interval) + 1;
  if (!Number.isSafeInteger(count)) throw new RangeError('PERIODIC.count overflow');
  const lastTurn = next + (count - 1) * npc.interval;
  const nextTurn = next + count * npc.interval;
  if (!Number.isSafeInteger(lastTurn) || !Number.isSafeInteger(nextTurn)) {
    throw new RangeError('nextPeriodicTurn overflow');
  }
  upsertReason(npc, 'PERIODIC', next, lastTurn, count);
  npc.nextPeriodicTurn = nextTurn;
}

function compareEligible(a, b) {
  const urgentA = a.pendingReasons.some(reason => reason.kind === 'PLAN_INVALIDATED');
  const urgentB = b.pendingReasons.some(reason => reason.kind === 'PLAN_INVALIDATED');
  if (urgentA !== urgentB) return urgentA ? -1 : 1;
  const priority = REASON_PRIORITY[b.pendingReasons[0].kind] -
    REASON_PRIORITY[a.pendingReasons[0].kind];
  if (priority) return priority;
  const oldestA = a.pendingReasons.reduce((oldest, reason) => Math.min(oldest, reason.firstTurn), MAX);
  const oldestB = b.pendingReasons.reduce((oldest, reason) => Math.min(oldest, reason.firstTurn), MAX);
  return oldestA - oldestB || compareString(a.id, b.id);
}

/** Emite solicitudes de reevaluación; no ejecuta IA ni modifica los inputs. */
function tickScheduler(state, currentTurn, events = [], options = {}) {
  const nextState = captureState(state);
  safeInt(currentTurn, 'currentTurn');
  if (nextState.clock !== null && currentTurn <= nextState.clock) {
    throw new TypeError('currentTurn debe superar state.clock');
  }
  const byId = new Map(nextState.npcs.map(npc => [npc.id, npc]));
  const capturedEvents = captureEvents(events, new Set(byId.keys()));
  const { maxDispatches } = captureOptions(options);

  for (const event of capturedEvents) {
    upsertReason(byId.get(event.npcId), event.kind, currentTurn, currentTurn, 1);
  }
  for (const npc of nextState.npcs) {
    advancePeriodic(npc, currentTurn);
    sortedReasons(npc.pendingReasons);
  }

  const eligible = nextState.npcs.filter(npc => {
    if (!npc.pendingReasons.length) return false;
    if (npc.pendingReasons.some(reason => reason.kind === 'PLAN_INVALIDATED')) return true;
    return npc.lastDispatchTurn === null ||
      currentTurn - npc.lastDispatchTurn >= npc.minGap;
  }).sort(compareEligible);
  const dispatches = [];
  for (const npc of eligible.slice(0, maxDispatches)) {
    const reasons = npc.pendingReasons.map(reason => ({ ...reason }));
    dispatches.push({
      npcId: npc.id, turn: currentTurn,
      dominantReason: reasons[0].kind, reasons,
    });
    npc.pendingReasons = [];
    npc.lastDispatchTurn = currentTurn;
  }
  nextState.clock = currentTurn;
  const deferredCount = nextState.npcs.filter(npc => npc.pendingReasons.length).length;
  return {
    status: eligible.length > maxDispatches ? 'BUDGET_EXHAUSTED' : 'DISPATCH_COMPLETE',
    state: nextState, dispatches, eligibleCount: eligible.length, deferredCount,
  };
}

export { EVENT_KINDS, REASON_ORDER, REASON_PRIORITY, createSchedulerState, tickScheduler };
