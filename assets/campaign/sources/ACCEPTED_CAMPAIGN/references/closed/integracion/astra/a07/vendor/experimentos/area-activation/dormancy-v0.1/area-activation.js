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

function exactRecord(input, fields, label) {
  const all = descriptors(input, label);
  const keys = Reflect.ownKeys(all);
  if (keys.length !== fields.length || keys.some(key =>
    typeof key !== 'string' || !fields.includes(key))) {
    throw new TypeError(`${label} debe contener exactamente: ${fields.join(', ')}`);
  }
  const result = {};
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(all, field)?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}.${field} debe ser propiedad de datos propia`);
    }
    result[field] = descriptor.value;
  }
  return result;
}

function arrayItems(input, label, allowEmpty = false) {
  const all = descriptors(input, label, true);
  const lengthDescriptor = Object.getOwnPropertyDescriptor(all, 'length')?.value;
  if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor, 'value')) {
    throw new TypeError(`${label}.length inválido`);
  }
  const length = lengthDescriptor.value;
  if (!Number.isSafeInteger(length) || length < (allowEmpty ? 0 : 1) ||
      Reflect.ownKeys(all).length !== length + 1) {
    throw new TypeError(`${label} contiene holes, símbolos, propiedades adicionales o está vacío`);
  }
  const items = [];
  for (let index = 0; index < length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(all, String(index))?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}[${index}] debe ser propiedad de datos propia`);
    }
    items.push(descriptor.value);
  }
  return items;
}

function areaId(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${label} debe ser string no vacío`);
  }
  return value;
}
function turn(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} debe ser entero seguro >= 0`);
  }
  return value;
}
function compareId(a, b) { return a === b ? 0 : a < b ? -1 : 1; }

function createAreaActivationState(configs) {
  const source = arrayItems(configs, 'configs');
  const areas = [];
  const ids = new Set();
  for (let index = 0; index < source.length; index++) {
    const config = exactRecord(source[index], ['id'], `configs[${index}]`);
    areaId(config.id, `configs[${index}].id`);
    if (ids.has(config.id)) throw new TypeError(`area id duplicado: ${config.id}`);
    ids.add(config.id);
    areas.push({ id: config.id, lastSimulatedTurn: 0 });
  }
  areas.sort((a, b) => compareId(a.id, b.id));
  return { version: 1, clock: null, activeAreaId: null, areas };
}

function captureState(state) {
  const top = exactRecord(state, ['version', 'clock', 'activeAreaId', 'areas'], 'state');
  if (top.version !== 1) throw new TypeError('state.version debe ser 1');
  if (top.clock !== null) turn(top.clock, 'state.clock');
  if (top.activeAreaId !== null) areaId(top.activeAreaId, 'state.activeAreaId');
  if (top.clock === null && top.activeAreaId !== null) {
    throw new TypeError('state inicial no puede tener área activa');
  }
  const source = arrayItems(top.areas, 'state.areas');
  const areas = [];
  const ids = new Set();
  for (let index = 0; index < source.length; index++) {
    const area = exactRecord(source[index], ['id', 'lastSimulatedTurn'],
      `state.areas[${index}]`);
    areaId(area.id, `state.areas[${index}].id`);
    turn(area.lastSimulatedTurn, `state.areas[${index}].lastSimulatedTurn`);
    if (top.clock === null && area.lastSimulatedTurn !== 0) {
      throw new TypeError('state inicial exige lastSimulatedTurn=0');
    }
    if (top.clock !== null && area.lastSimulatedTurn > top.clock) {
      throw new TypeError('lastSimulatedTurn no puede superar state.clock');
    }
    if (ids.has(area.id)) throw new TypeError(`state area id duplicado: ${area.id}`);
    ids.add(area.id);
    areas.push(area);
  }
  if (top.activeAreaId !== null && !ids.has(top.activeAreaId)) {
    throw new TypeError('state.activeAreaId inexistente');
  }
  areas.sort((a, b) => compareId(a.id, b.id));
  return { version: 1, clock: top.clock, activeAreaId: top.activeAreaId, areas };
}

/** Devuelve una transición candidata; un futuro caller adoptará state tras resolver catchUp. */
function activatePlayerArea(state, currentTurn, playerAreaId) {
  const nextState = captureState(state);
  turn(currentTurn, 'currentTurn');
  if (nextState.clock !== null && currentTurn <= nextState.clock) {
    throw new TypeError('currentTurn debe superar state.clock');
  }
  areaId(playerAreaId, 'playerAreaId');
  const byId = new Map(nextState.areas.map(area => [area.id, area]));
  if (!byId.has(playerAreaId)) throw new TypeError(`playerAreaId inexistente: ${playerAreaId}`);
  const previousAreaId = nextState.activeAreaId;

  if (previousAreaId === playerAreaId) {
    nextState.clock = currentTurn;
    return {
      status: 'ALREADY_ACTIVE', state: nextState,
      previousAreaId, activeAreaId: playerAreaId,
      deactivation: null, activation: null, catchUp: null,
    };
  }

  const previous = previousAreaId === null ? null : byId.get(previousAreaId);
  const target = byId.get(playerAreaId);
  const fromTurn = target.lastSimulatedTurn;
  const elapsedTurns = currentTurn - fromTurn;
  if (!Number.isSafeInteger(elapsedTurns) || elapsedTurns < 0) {
    throw new RangeError('elapsedTurns fuera de entero seguro');
  }
  const deactivation = previous === null ? null
    : { areaId: previous.id, atTurn: currentTurn };
  if (previous !== null) previous.lastSimulatedTurn = currentTurn;
  target.lastSimulatedTurn = currentTurn;
  nextState.activeAreaId = playerAreaId;
  nextState.clock = currentTurn;
  const activation = { areaId: playerAreaId, atTurn: currentTurn };
  const catchUp = elapsedTurns === 0 ? null
    : { areaId: playerAreaId, fromTurn, toTurn: currentTurn, elapsedTurns };
  return {
    status: previousAreaId === null ? 'INITIAL_ACTIVATION' : 'AREA_SWITCHED',
    state: nextState, previousAreaId, activeAreaId: playerAreaId,
    deactivation, activation, catchUp,
  };
}

export { activatePlayerArea, createAreaActivationState };
