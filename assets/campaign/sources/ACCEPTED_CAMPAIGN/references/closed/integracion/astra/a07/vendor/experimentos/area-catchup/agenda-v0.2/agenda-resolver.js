// Resolver de agenda sintética: calcula el estado final sin reproducir turns ni ciclos.
function fail(message) { throw new TypeError(`Agenda catch-up: ${message}`); }

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
    if (error instanceof TypeError && error.message.startsWith('Agenda catch-up:')) throw error;
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
    if (error instanceof TypeError && error.message.startsWith('Agenda catch-up:')) throw error;
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

function phaseAt(turn, agenda) {
  return Number((BigInt(turn) + BigInt(agenda.offset)) % BigInt(agenda.cycleLength));
}

function slotAt(phase, slots) {
  // La cobertura se validó antes: existe exactamente un slot para cada fase.
  return slots.find(slot => slot.start <= phase && phase < slot.end);
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
    const entity = record(raw, ['id', 'logicalRoomId', 'currentActivity', 'agenda'], `entities[${index}]`);
    nonblank(entity.id, 'entity.id');
    nonblank(entity.logicalRoomId, 'entity.logicalRoomId');
    nonblank(entity.currentActivity, 'entity.currentActivity');
    if (ids.has(entity.id)) fail('entity.id duplicado');
    ids.add(entity.id);
    const rawAgenda = record(entity.agenda, ['cycleLength', 'offset', 'slots'], 'agenda');
    integer(rawAgenda.cycleLength, 'agenda.cycleLength', 1);
    integer(rawAgenda.offset, 'agenda.offset');
    if (rawAgenda.offset >= rawAgenda.cycleLength) fail('agenda.offset fuera del ciclo');
    const slotIds = new Set();
    const slots = array(rawAgenda.slots, 'agenda.slots').map(rawSlot => {
      const slot = record(rawSlot, ['id', 'start', 'end', 'roomId', 'activity'], 'slot');
      nonblank(slot.id, 'slot.id');
      nonblank(slot.roomId, 'slot.roomId');
      nonblank(slot.activity, 'slot.activity');
      if (slotIds.has(slot.id)) fail('slot.id duplicado');
      slotIds.add(slot.id);
      integer(slot.start, 'slot.start');
      integer(slot.end, 'slot.end');
      if (slot.end <= slot.start || slot.end > rawAgenda.cycleLength) fail('slot fuera de rango');
      return { id: slot.id, start: slot.start, end: slot.end, roomId: slot.roomId, activity: slot.activity };
    });
    if (slots.length === 0) fail('agenda.slots vacío');
    slots.sort((a, b) => a.start - b.start);
    if (slots[0].start !== 0 || slots.at(-1).end !== rawAgenda.cycleLength ||
        slots.some((slot, i) => i > 0 && slots[i - 1].end !== slot.start)) fail('agenda no cubre el ciclo exactamente');
    const agenda = { cycleLength: rawAgenda.cycleLength, offset: rawAgenda.offset, slots };
    const initialSlot = slotAt(phaseAt(source.syncedTurn, agenda), slots);
    if (entity.logicalRoomId !== initialSlot.roomId || entity.currentActivity !== initialSlot.activity) fail('snapshot contradice agenda');
    return { id: entity.id, logicalRoomId: entity.logicalRoomId, currentActivity: entity.currentActivity, agenda };
  });
  return { source, request, entities };
}

function resolveAgendaCatchUp(state, catchUp) {
  const { source, request, entities } = snapshot(state, catchUp);
  entities.sort((a, b) => lexical(a.id, b.id));
  const entityUpdates = [];
  const cycleSummaries = [];
  for (const entity of entities) {
    const fromPhase = phaseAt(request.fromTurn, entity.agenda);
    const finalPhase = phaseAt(request.toTurn, entity.agenda);
    const fromSlot = slotAt(fromPhase, entity.agenda.slots);
    const toSlot = slotAt(finalPhase, entity.agenda.slots);
    const fullCyclesElapsed = Number(BigInt(request.elapsedTurns) / BigInt(entity.agenda.cycleLength));
    cycleSummaries.push({ entityId: entity.id, fromSlotId: fromSlot.id, toSlotId: toSlot.id,
      finalPhase, fullCyclesElapsed });
    const previousRoomId = entity.logicalRoomId;
    const previousActivity = entity.currentActivity;
    entity.logicalRoomId = toSlot.roomId;
    entity.currentActivity = toSlot.activity;
    if (previousRoomId !== entity.logicalRoomId || previousActivity !== entity.currentActivity) {
      entityUpdates.push({ entityId: entity.id, fromSlotId: fromSlot.id, toSlotId: toSlot.id,
        previousRoomId, roomId: entity.logicalRoomId, previousActivity, activity: entity.currentActivity,
        finalPhase, fullCyclesElapsed });
    }
  }
  return { status: 'AGENDA_CATCH_UP_APPLIED',
    state: { version: 1, areaId: source.areaId, syncedTurn: request.toTurn, entities },
    summary: { areaId: source.areaId, fromTurn: request.fromTurn, toTurn: request.toTurn,
      elapsedTurns: request.elapsedTurns, entityUpdates, cycleSummaries } };
}

export { resolveAgendaCatchUp };
