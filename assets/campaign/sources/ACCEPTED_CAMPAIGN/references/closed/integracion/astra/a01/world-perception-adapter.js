/** A01: pure NPC observations. No runtime installation, writes or action API. */
const A01_LIMITS = Object.freeze({ actors: 32, territoryRooms: 467, idLength: 128, labelLength: 256 });
const TOPICS = Object.freeze(Array.from({ length: 10 }, (_, i) => `R${i + 1}`));
const KNOWLEDGE_LEVELS = new Set(['DESCONOCIDO', 'SOSPECHA', 'SABE', 'CONFIRMADO']);

class PerceptionInputError extends TypeError {
  constructor(code) { super(code); this.name = 'PerceptionInputError'; this.code = code; }
}
const fail = code => { throw new PerceptionInputError(code); };
const object = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) fail('A01_EXPECTED_RECORD');
  return value;
};
// Inspect only allowlisted own data fields. Never invoke accessors or runtime methods.
function own(record, key) {
  if (record === null || typeof record !== 'object') fail('A01_EXPECTED_RECORD');
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) fail('A01_MISSING_OR_ACCESSOR_FIELD');
  return descriptor.value;
}
function text(value, maximum = A01_LIMITS.idLength) {
  if (typeof value !== 'string' || value.length === 0 || value.length > maximum) fail('A01_INVALID_TEXT');
  return value;
}
function roomList(value) {
  if (!Array.isArray(value)) fail('A01_EXPECTED_ROOM_LIST');
  const length = own(value, 'length');
  if (length > A01_LIMITS.territoryRooms) fail('A01_ROOM_LIMIT');
  const copy = [];
  for (let i = 0; i < length; i++) copy.push(text(own(value, String(i))));
  if (new Set(copy).size !== length) fail('A01_DUPLICATE_ROOM');
  return copy;
}
function freeze(value) {
  // Only objects created inside A01 reach this function.
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function existingRoom(rooms, id) { object(own(rooms, id)); return id; }

/**
 * Compile a detached, bounded public subset of canonical NPC_DEF.
 * Input must be ordinary own-data objects (no Proxy or hostile reflection traps).
 * The returned closure retains copies only, not NPC_DEF or a runtime reference.
 */
function createWorldPerceptionAdapter(npcDefinitions) {
  const ids = Object.keys(object(npcDefinitions)).sort();
  if (!ids.length || ids.length > A01_LIMITS.actors) fail('A01_ACTOR_LIMIT');
  const canonical = new Map();
  for (const id of ids) {
    text(id);
    const source = object(own(npcDefinitions, id));
    if (own(source, 'id') !== id) fail('A01_IDENTITY_MISMATCH');
    const actor = {
      id, name: text(own(source, 'nombre'), A01_LIMITS.labelLength),
      role: text(own(source, 'rol'), A01_LIMITS.labelLength),
      category: text(own(source, 'categoria')),
    };
    const territory = {
      initialRoomId: text(own(source, 'sala_inicial')),
      mobility: text(own(source, 'movilidad')),
      normal: roomList(own(source, 'territorio_normal')),
      technicalTransit: roomList(own(source, 'transito_tecnico')),
      validPositions: roomList(own(source, 'posicion_valida')),
    };
    if (!territory.validPositions.includes(territory.initialRoomId) ||
        [...territory.normal, ...territory.technicalTransit].some(r => !territory.validPositions.includes(r))) {
      fail('A01_INVALID_CANONICAL_TERRITORY');
    }
    canonical.set(id, freeze({ actor, territory }));
  }

  function snapshot(runtime, actorId) {
    text(actorId);
    const definition = canonical.get(actorId);
    if (!definition) fail('A01_UNKNOWN_ACTOR');
    const turn = own(runtime, 'turnoGlobal');
    if (!Number.isSafeInteger(turn) || turn < 0) fail('A01_INVALID_TURN');
    const rooms = object(own(runtime, 'rooms'));
    const positions = object(own(runtime, 'posicionNPC'));
    const position = object(own(positions, actorId));
    const roomId = existingRoom(rooms, text(own(position, 'sala')));
    const anchor = own(position, 'anclaje');
    if (anchor === null) {
      if (!definition.territory.validPositions.includes(roomId)) fail('A01_INVALID_POSITION');
    } else if (text(own(anchor, 'room')) !== roomId) {
      fail('A01_ANCHOR_POSITION_MISMATCH');
    }
    // The existing actor-specific store is the ONLY revelation source.
    // No fallback to global truth, initial knowledge or another actor on missing data.
    const localKnowledge = object(own(object(own(runtime, 'conocimientoNPC')), actorId));
    const knowledge = {};
    for (const topic of TOPICS) {
      const level = own(localKnowledge, topic);
      if (!KNOWLEDGE_LEVELS.has(level)) fail('A01_INVALID_KNOWLEDGE');
      knowledge[topic] = level;
    }
    // ver76's presence model is room equality, not line of sight or personal familiarity.
    // Report co-presence explicitly, without exposing other actors' private data.
    const coPresentNpcIds = [];
    for (const id of ids) {
      if (id === actorId) continue;
      if (text(own(object(own(positions, id)), 'sala')) === roomId) coPresentNpcIds.push(id);
    }
    const playerRoom = text(own(runtime, 'pos'));
    const territory = definition.territory;
    return freeze({
      schemaVersion: 1,
      actor: { ...definition.actor },
      turn,
      position: { roomId, anchored: anchor !== null },
      territory: {
        initialRoomId: territory.initialRoomId, mobility: territory.mobility,
        normal: [...territory.normal], technicalTransit: [...territory.technicalTransit],
        validPositions: [...territory.validPositions],
      },
      knowledge,
      perception: { coPresentNpcIds, playerPresent: playerRoom === roomId },
    });
  }
  return Object.freeze({ snapshot });
}

export { A01_LIMITS, PerceptionInputError, createWorldPerceptionAdapter };
