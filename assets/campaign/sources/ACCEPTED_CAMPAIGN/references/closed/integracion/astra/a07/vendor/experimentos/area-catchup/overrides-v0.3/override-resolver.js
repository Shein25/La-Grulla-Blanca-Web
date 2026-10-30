// Laboratorio sintético: estado final por agenda + overrides, sin replay temporal.
function fail(message) { throw new TypeError(`Override catch-up: ${message}`); }

function record(value, fields, label) {
  try {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) fail(`${label} debe ser objeto plano`);
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) fail(`${label} tiene herencia`);
    const keys = Reflect.ownKeys(value);
    if (keys.length !== fields.length || keys.some(key => typeof key !== 'string' || !fields.includes(key))) fail(`${label} tiene campos inválidos`);
    const result = Object.create(null);
    for (const field of fields) {
      const descriptor = Object.getOwnPropertyDescriptor(value, field);
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) fail(`${label}.${field} falta o es accessor`);
      result[field] = descriptor.value;
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith('Override catch-up:')) throw error;
    fail(`${label} no admite inspección estructural`);
  }
}

function array(value, label) {
  try {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) fail(`${label} debe ser array ordinario`);
    const length = Object.getOwnPropertyDescriptor(value, 'length');
    if (!length || !Object.hasOwn(length, 'value')) fail(`${label} no tiene longitud válida`);
    const keys = Reflect.ownKeys(value);
    if (keys.length !== length.value + 1) fail(`${label} tiene huecos o propiedades extra`);
    const result = [];
    for (let index = 0; index < length.value; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) fail(`${label}[${index}] es hueco o accessor`);
      result.push(descriptor.value);
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.message.startsWith('Override catch-up:')) throw error;
    fail(`${label} no admite inspección estructural`);
  }
}

function nonblank(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} debe ser string no vacío ni sólo espacios`);
  return value;
}

function integer(value, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) fail(`${label} debe ser entero seguro >= ${minimum}`);
  return value;
}

function lexical(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function persistentOrder(a, b) { return a.startTurn - b.startTurn || b.priority - a.priority || lexical(a.id, b.id); }
function expiredOrder(a, b) { return a.endTurn - b.endTurn || lexical(a.entityId, b.entityId) || lexical(a.overrideId, b.overrideId); }

function baseSlot(turn, agenda) {
  const phase = Number((BigInt(turn) + BigInt(agenda.offset)) % BigInt(agenda.cycleLength));
  return agenda.slots.find(slot => slot.start <= phase && phase < slot.end);
}

function winnerAt(turn, overrides) {
  let winner = null;
  for (const override of overrides) {
    if (override.startTurn > turn || (override.endTurn !== null && turn >= override.endTurn)) continue;
    if (winner === null || override.priority > winner.priority ||
        (override.priority === winner.priority && override.startTurn > winner.startTurn) ||
        (override.priority === winner.priority && override.startTurn === winner.startTurn && override.id < winner.id)) winner = override;
  }
  return winner;
}

function positionAt(turn, agenda, overrides) {
  const slot = baseSlot(turn, agenda);
  const winner = winnerAt(turn, overrides);
  return { baseSlotId: slot.id, winningOverrideId: winner?.id ?? null,
    roomId: winner?.roomId ?? slot.roomId, activity: winner?.activity ?? slot.activity,
    sourceType: winner === null ? 'AGENDA' : 'OVERRIDE', sourceId: winner?.id ?? slot.id };
}

function snapshot(state, catchUp) {
  const source = record(state, ['version', 'areaId', 'syncedTurn', 'entities'], 'state');
  if (source.version !== 1) fail('version debe ser 1');
  nonblank(source.areaId, 'state.areaId');
  integer(source.syncedTurn, 'state.syncedTurn');
  const request = record(catchUp, ['areaId', 'fromTurn', 'toTurn', 'elapsedTurns'], 'catchUp');
  nonblank(request.areaId, 'catchUp.areaId');
  for (const field of ['fromTurn', 'toTurn', 'elapsedTurns']) integer(request[field], `catchUp.${field}`);
  if (request.areaId !== source.areaId || request.fromTurn !== source.syncedTurn ||
      request.toTurn <= request.fromTurn || request.elapsedTurns < 1 ||
      request.elapsedTurns !== request.toTurn - request.fromTurn) fail('catchUp no coincide con state');

  const ids = new Set();
  const entities = array(source.entities, 'entities').map((raw, index) => {
    const entity = record(raw, ['id', 'logicalRoomId', 'currentActivity', 'currentSourceType', 'currentSourceId', 'agenda', 'overrides'], `entities[${index}]`);
    for (const field of ['id', 'logicalRoomId', 'currentActivity', 'currentSourceId']) nonblank(entity[field], `entity.${field}`);
    if (entity.currentSourceType !== 'AGENDA' && entity.currentSourceType !== 'OVERRIDE') fail('entity.currentSourceType inválido');
    if (ids.has(entity.id)) fail('entity.id duplicado');
    ids.add(entity.id);
    const rawAgenda = record(entity.agenda, ['cycleLength', 'offset', 'slots'], 'agenda');
    integer(rawAgenda.cycleLength, 'agenda.cycleLength', 1);
    integer(rawAgenda.offset, 'agenda.offset');
    if (rawAgenda.offset >= rawAgenda.cycleLength) fail('agenda.offset fuera del ciclo');
    const slotIds = new Set();
    const slots = array(rawAgenda.slots, 'agenda.slots').map(rawSlot => {
      const slot = record(rawSlot, ['id', 'start', 'end', 'roomId', 'activity'], 'slot');
      for (const field of ['id', 'roomId', 'activity']) nonblank(slot[field], `slot.${field}`);
      if (slotIds.has(slot.id)) fail('slot.id duplicado');
      slotIds.add(slot.id);
      integer(slot.start, 'slot.start'); integer(slot.end, 'slot.end');
      if (slot.end <= slot.start || slot.end > rawAgenda.cycleLength) fail('slot fuera de rango');
      return { id: slot.id, start: slot.start, end: slot.end, roomId: slot.roomId, activity: slot.activity };
    });
    if (slots.length === 0) fail('agenda.slots vacío');
    slots.sort((a, b) => a.start - b.start);
    if (slots[0].start !== 0 || slots.at(-1).end !== rawAgenda.cycleLength ||
        slots.some((slot, i) => i > 0 && slots[i - 1].end !== slot.start)) fail('agenda no cubre el ciclo exactamente');
    const agenda = { cycleLength: rawAgenda.cycleLength, offset: rawAgenda.offset, slots };
    const overrideIds = new Set();
    const overrides = array(entity.overrides, 'entity.overrides').map(rawOverride => {
      const override = record(rawOverride, ['id', 'kind', 'priority', 'startTurn', 'endTurn', 'roomId', 'activity'], 'override');
      for (const field of ['id', 'kind', 'roomId', 'activity']) nonblank(override[field], `override.${field}`);
      if (overrideIds.has(override.id)) fail('override.id duplicado');
      overrideIds.add(override.id);
      integer(override.priority, 'override.priority'); integer(override.startTurn, 'override.startTurn');
      if (override.endTurn !== null) {
        integer(override.endTurn, 'override.endTurn');
        if (override.endTurn <= override.startTurn) fail('override intervalo vacío o regresivo');
        if (override.endTurn <= source.syncedTurn) fail('override expirado en snapshot');
      }
      return { id: override.id, kind: override.kind, priority: override.priority,
        startTurn: override.startTurn, endTurn: override.endTurn, roomId: override.roomId, activity: override.activity };
    });
    const initial = positionAt(source.syncedTurn, agenda, overrides);
    if (entity.logicalRoomId !== initial.roomId || entity.currentActivity !== initial.activity ||
        entity.currentSourceType !== initial.sourceType || entity.currentSourceId !== initial.sourceId) fail('snapshot contradice agenda y overrides');
    return { id: entity.id, logicalRoomId: entity.logicalRoomId, currentActivity: entity.currentActivity,
      currentSourceType: entity.currentSourceType, currentSourceId: entity.currentSourceId, agenda, overrides };
  });
  return { source, request, entities };
}

function resolveOverrideCatchUp(state, catchUp) {
  const { source, request, entities } = snapshot(state, catchUp);
  entities.sort((a, b) => lexical(a.id, b.id));
  const entityUpdates = [];
  const entitySummaries = [];
  const expiredOverrides = [];
  for (const entity of entities) {
    const previousRoomId = entity.logicalRoomId;
    const previousActivity = entity.currentActivity;
    const previousSourceType = entity.currentSourceType;
    const previousSourceId = entity.currentSourceId;
    const final = positionAt(request.toTurn, entity.agenda, entity.overrides);
    const remaining = [];
    for (const override of entity.overrides) {
      if (override.endTurn !== null && override.endTurn <= request.toTurn) {
        expiredOverrides.push({ entityId: entity.id, overrideId: override.id, kind: override.kind,
          priority: override.priority, startTurn: override.startTurn, endTurn: override.endTurn });
      } else remaining.push(override);
    }
    remaining.sort(persistentOrder);
    entity.overrides = remaining;
    entity.logicalRoomId = final.roomId;
    entity.currentActivity = final.activity;
    entity.currentSourceType = final.sourceType;
    entity.currentSourceId = final.sourceId;
    const fullCyclesElapsed = Number(BigInt(request.elapsedTurns) / BigInt(entity.agenda.cycleLength));
    entitySummaries.push({ entityId: entity.id, baseSlotId: final.baseSlotId,
      winningOverrideId: final.winningOverrideId, finalRoomId: final.roomId, finalActivity: final.activity,
      finalSourceType: final.sourceType, finalSourceId: final.sourceId, fullCyclesElapsed,
      remainingOverrides: remaining.length });
    const visibleChanged = previousRoomId !== final.roomId || previousActivity !== final.activity;
    const sourceChanged = previousSourceType !== final.sourceType || previousSourceId !== final.sourceId;
    if (visibleChanged || sourceChanged) entityUpdates.push({ entityId: entity.id,
      previousRoomId, roomId: final.roomId, previousActivity, activity: final.activity,
      previousSourceType, sourceType: final.sourceType, previousSourceId, sourceId: final.sourceId,
      visibleChanged, sourceChanged, finalBaseSlotId: final.baseSlotId,
      winningOverrideId: final.winningOverrideId });
  }
  expiredOverrides.sort(expiredOrder);
  return { status: 'OVERRIDE_CATCH_UP_APPLIED',
    state: { version: 1, areaId: source.areaId, syncedTurn: request.toTurn, entities },
    summary: { areaId: source.areaId, fromTurn: request.fromTurn, toTurn: request.toTurn,
      elapsedTurns: request.elapsedTurns, entityUpdates, entitySummaries, expiredOverrides } };
}

export { resolveOverrideCatchUp };
