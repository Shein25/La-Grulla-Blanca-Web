import { recallMemory } from '../motor-npc-vivo-v0.3-memory/memory.js';

const RELATION_FIELDS = Object.freeze([
  'afinidad', 'confianza', 'respeto', 'deuda', 'temor', 'rivalidad',
]);

const SOCIAL_RULES = Object.freeze({
  PLAYER_HELPED_ME: Object.freeze({ afinidad:12, confianza:10, deuda:8 }),
  PLAYER_LIED: Object.freeze({ confianza:-18, respeto:-6, rivalidad:12 }),
});

function captureBaseRelations(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('baseRelations debe ser un objeto plano');
  }

  let prototype;
  let descriptors;
  try {
    prototype = Object.getPrototypeOf(input);
    descriptors = Object.getOwnPropertyDescriptors(input);
  } catch {
    throw new TypeError('baseRelations no permite inspeccionar sus propiedades');
  }
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('baseRelations debe ser un objeto plano');
  }

  const ownKeys = Reflect.ownKeys(descriptors);
  if (ownKeys.length !== RELATION_FIELDS.length ||
      ownKeys.some(key => !RELATION_FIELDS.includes(key))) {
    throw new TypeError('baseRelations debe contener exactamente las seis relaciones');
  }

  const snapshot = {};
  for (const field of RELATION_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(descriptors, field)?.value;
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`baseRelations.${field} debe ser propiedad de datos propia`);
    }
    const value = descriptor.value;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      throw new TypeError(`baseRelations.${field} debe ser número finito entre 0 y 100`);
    }
    snapshot[field] = value;
  }
  return snapshot;
}

function emptyDeltas() {
  return Object.fromEntries(RELATION_FIELDS.map(field => [field, 0]));
}

function byMemoryKey(a, b) {
  return a.key === b.key ? 0 : a.key < b.key ? -1 : 1;
}

function clamp(value) {
  return Math.min(100, Math.max(0, value));
}

/** Deriva un snapshot; nunca escribe en las relaciones base ni en la memoria. */
function deriveRelations(baseRelations, memory, currentTurn) {
  const base = captureBaseRelations(baseRelations);
  // recallMemory valida la memoria y el reloj, filtra expirados y entrega copias.
  const active = recallMemory(memory, currentTurn).sort(byMemoryKey);
  const rawDeltas = emptyDeltas();
  const contributions = [];
  const ignoredMemories = [];

  for (const entry of active) {
    const rule = Object.hasOwn(SOCIAL_RULES, entry.kind) ? SOCIAL_RULES[entry.kind] : null;
    if (!rule) {
      ignoredMemories.push({ memoryKey:entry.key, kind:entry.kind, reason:'NO_SOCIAL_RULE' });
      continue;
    }
    if (entry.value !== true) {
      ignoredMemories.push({ memoryKey:entry.key, kind:entry.kind, reason:'VALUE_NOT_TRUE' });
      continue;
    }

    const factor = (entry.importance / 100) * (entry.confidence / 100);
    const deltas = emptyDeltas();
    for (const field of RELATION_FIELDS) {
      deltas[field] = (rule[field] ?? 0) * factor;
      rawDeltas[field] += deltas[field];
    }
    contributions.push({ memoryKey:entry.key, kind:entry.kind, factor, deltas });
  }

  const relations = {};
  for (const field of RELATION_FIELDS) {
    relations[field] = rawDeltas[field] === 0 ? base[field] : clamp(base[field] + rawDeltas[field]);
  }

  return { relations, rawDeltas, contributions, ignoredMemories };
}

export { deriveRelations };
