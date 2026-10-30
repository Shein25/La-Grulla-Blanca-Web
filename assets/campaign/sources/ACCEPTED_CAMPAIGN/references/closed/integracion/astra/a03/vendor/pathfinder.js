const DIRECTION_ORDER = Object.freeze([
  'norte', 'este', 'sur', 'oeste', 'arriba', 'abajo',
]);

function ownDescriptors(input, label, array = false) {
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
  const descriptors = ownDescriptors(input, label);
  const keys = Reflect.ownKeys(descriptors);
  if (keys.length !== fields.length || keys.some(key =>
    typeof key !== 'string' || !fields.includes(key))) {
    throw new TypeError(`${label} debe contener exactamente: ${fields.join(', ')}`);
  }
  const snapshot = {};
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(descriptors, field)?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}.${field} debe ser propiedad de datos propia`);
    }
    snapshot[field] = descriptor.value;
  }
  return snapshot;
}

function captureArray(input, label, allowEmpty) {
  const descriptors = ownDescriptors(input, label, true);
  const lengthDescriptor = Object.getOwnPropertyDescriptor(descriptors, 'length')?.value;
  if (!lengthDescriptor || !Object.hasOwn(lengthDescriptor, 'value')) {
    throw new TypeError(`${label}.length inválido`);
  }
  const length = lengthDescriptor.value;
  if (!Number.isSafeInteger(length) || length < (allowEmpty ? 0 : 1)) {
    throw new TypeError(`${label} debe contener ${allowEmpty ? 'cero o más' : 'una o más'} entradas`);
  }
  if (Reflect.ownKeys(descriptors).length !== length + 1) {
    throw new TypeError(`${label} contiene holes, símbolos o propiedades adicionales`);
  }
  const entries = [];
  for (let index = 0; index < length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(descriptors, String(index))?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${label}[${index}] debe ser propiedad de datos propia`);
    }
    entries.push(descriptor.value);
  }
  return entries;
}

function roomId(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${label} debe ser string no vacío`);
  }
  return value;
}

function captureGraph(graph) {
  const top = exactRecord(graph, ['version', 'rooms'], 'graph');
  if (top.version !== 1) throw new TypeError('graph.version debe ser 1');
  const sourceRooms = captureArray(top.rooms, 'graph.rooms', false);
  const rooms = new Map();
  for (let index = 0; index < sourceRooms.length; index++) {
    const room = exactRecord(sourceRooms[index], ['id', 'exits'], `graph.rooms[${index}]`);
    const id = roomId(room.id, `graph.rooms[${index}].id`);
    if (rooms.has(id)) throw new TypeError(`room id duplicado: ${id}`);
    const sourceExits = exactRecord(room.exits, DIRECTION_ORDER,
      `graph.rooms[${index}].exits`);
    const exits = {};
    for (const direction of DIRECTION_ORDER) {
      const target = sourceExits[direction];
      if (target !== null) roomId(target, `graph.rooms[${index}].exits.${direction}`);
      exits[direction] = target;
    }
    rooms.set(id, exits);
  }
  for (const [id, exits] of rooms) {
    for (const direction of DIRECTION_ORDER) {
      const target = exits[direction];
      if (target !== null && !rooms.has(target)) {
        throw new TypeError(`Salida ${id}/${direction} apunta a room inexistente: ${target}`);
      }
    }
  }
  return rooms;
}

function validateGraph(graph) {
  captureGraph(graph);
  return true;
}

function captureOptions(options, rooms) {
  const descriptors = ownDescriptors(options, 'options');
  const captured = {};
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string' || !['maxVisited', 'blockedExits'].includes(key)) {
      throw new TypeError('options contiene una propiedad no permitida');
    }
    const descriptor = Object.getOwnPropertyDescriptor(descriptors, key).value;
    if (!Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`options.${key} debe ser propiedad de datos propia`);
    }
    captured[key] = descriptor.value;
  }
  const maxVisited = Object.hasOwn(captured, 'maxVisited') ? captured.maxVisited : 10000;
  if (!Number.isSafeInteger(maxVisited) || maxVisited < 1) {
    throw new TypeError('options.maxVisited debe ser entero seguro >= 1');
  }
  const rawBlocked = Object.hasOwn(captured, 'blockedExits')
    ? captureArray(captured.blockedExits, 'options.blockedExits', true) : [];
  const blocked = new Set();
  for (let index = 0; index < rawBlocked.length; index++) {
    const entry = exactRecord(rawBlocked[index], ['from', 'direction'],
      `options.blockedExits[${index}]`);
    roomId(entry.from, `options.blockedExits[${index}].from`);
    if (!rooms.has(entry.from)) throw new TypeError(`blockedExit room inexistente: ${entry.from}`);
    if (!DIRECTION_ORDER.includes(entry.direction)) {
      throw new TypeError(`blockedExit dirección inválida: ${String(entry.direction)}`);
    }
    const key = JSON.stringify([entry.from, entry.direction]);
    if (blocked.has(key)) throw new TypeError('blockedExit duplicado');
    blocked.add(key);
  }
  return { maxVisited, blocked };
}

function result(status, startRoomId, goalRoomId, visitedCount,
  rooms = [], steps = [], distance = null) {
  return { status, startRoomId, goalRoomId, rooms, steps, distance, visitedCount };
}

function reconstruct(parents, startRoomId, goalRoomId, visitedCount) {
  const steps = [];
  let cursor = goalRoomId;
  while (cursor !== startRoomId) {
    const parent = parents.get(cursor);
    steps.push({ from: parent.from, direction: parent.direction, to: cursor });
    cursor = parent.from;
  }
  steps.reverse();
  const rooms = [startRoomId, ...steps.map(step => step.to)];
  return result('ROUTE_FOUND', startRoomId, goalRoomId,
    visitedCount, rooms, steps, steps.length);
}

/** BFS sobre un snapshot dirigido; jamás modifica grafo ni opciones. */
function findRoute(graph, startRoomId, goalRoomId, options = {}) {
  const rooms = captureGraph(graph);
  roomId(startRoomId, 'startRoomId');
  roomId(goalRoomId, 'goalRoomId');
  if (!rooms.has(startRoomId)) throw new TypeError(`startRoomId inexistente: ${startRoomId}`);
  if (!rooms.has(goalRoomId)) throw new TypeError(`goalRoomId inexistente: ${goalRoomId}`);
  const { maxVisited, blocked } = captureOptions(options, rooms);
  if (startRoomId === goalRoomId) {
    return result('ALREADY_THERE', startRoomId, goalRoomId, 1, [startRoomId], [], 0);
  }

  const queue = [startRoomId];
  const seen = new Set([startRoomId]);
  const parents = new Map();
  let head = 0;
  let visitedCount = 0;
  while (head < queue.length) {
    if (visitedCount >= maxVisited) {
      return result('SEARCH_LIMIT', startRoomId, goalRoomId, visitedCount);
    }
    const from = queue[head++];
    visitedCount++;
    if (from === goalRoomId) {
      return reconstruct(parents, startRoomId, goalRoomId, visitedCount);
    }
    const exits = rooms.get(from);
    for (const direction of DIRECTION_ORDER) {
      if (blocked.has(JSON.stringify([from, direction]))) continue;
      const to = exits[direction];
      if (to === null || seen.has(to)) continue;
      seen.add(to);
      parents.set(to, { from, direction });
      queue.push(to);
    }
  }
  return result('NO_ROUTE', startRoomId, goalRoomId, visitedCount);
}

export { DIRECTION_ORDER, findRoute, validateGraph };
