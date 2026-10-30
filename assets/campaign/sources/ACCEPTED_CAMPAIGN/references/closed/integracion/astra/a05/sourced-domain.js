import { createKnowledgePermissionGuard } from '../a02/knowledge-permission-guard.js';
import { DOMAIN_AUTHORITY } from './domain-authority.js';

/** Private shared validation; each domain owns a separate, fixed field state. */

const A05_LIMITS = Object.freeze({ bindings: 64, literals: 32, text: 128, path: 512 });
class DomainInputError extends TypeError {
  constructor(code) { super(code); this.name = 'DomainInputError'; this.code = code; }
}
const fail = code => { throw new DomainInputError(code); };
function own(x, key) {
  if (!x || typeof x !== 'object') fail('A05_EXPECTED_OBJECT');
  const d = Object.getOwnPropertyDescriptor(x, key);
  if (!d || !Object.hasOwn(d, 'value')) fail('A05_MISSING_OR_ACCESSOR_FIELD');
  return d.value;
}
function exact(x, keys) {
  if (!x || typeof x !== 'object' || Array.isArray(x)) fail('A05_EXPECTED_RECORD');
  if (Reflect.ownKeys(x).length !== keys.length || Reflect.ownKeys(x).some(k => !keys.includes(k))) fail('A05_UNEXPECTED_FIELDS');
  keys.forEach(k => own(x, k)); return x;
}
function text(x, max = A05_LIMITS.text) { if (typeof x !== 'string' || !x.length || x.length > max) fail('A05_INVALID_TEXT'); return x; }
function integer(x) { if (!Number.isSafeInteger(x) || x < 0) fail('A05_INVALID_INTEGER'); return x; }
function list(x, max) {
  if (!Array.isArray(x) || x.length > max) fail('A05_LIST_LIMIT');
  return Array.from({ length: x.length }, (_, i) => own(x, String(i)));
}
function freeze(x) { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; }
function sourceCopy(raw) {
  exact(raw, ['id', 'path', 'sha256', 'locator']);
  const sha256 = own(raw, 'sha256');
  if (typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(sha256)) fail('A05_SOURCE_HASH');
  return freeze({ id: text(own(raw, 'id')), path: text(own(raw, 'path'), A05_LIMITS.path), sha256, locator: text(own(raw, 'locator')) });
}
function syncFunction(x) {
  if (typeof x !== 'function' || ['AsyncFunction', 'GeneratorFunction', 'AsyncGeneratorFunction'].includes(x.constructor.name)) fail('A05_SYNCHRONOUS_SOURCE_REQUIRED');
  return x;
}
function scalar(x) {
  if (typeof x === 'string') return text(x);
  if (typeof x === 'boolean' || x === null) return x;
  if (typeof x === 'number' && Number.isFinite(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER) return x;
  fail('A05_LITERAL_VALUE_REQUIRED');
}

/** Called only by the four explicit domain factories. Configuration/feed are trusted host inputs. */
function createSourcedDomain(domainId, roomDefinitions, { bindings = [], feed = null } = {}) {
  const authority = DOMAIN_AUTHORITY.domains[domainId];
  if (!authority) fail('A05_UNKNOWN_DOMAIN');
  const rooms = new Set(Object.keys(roomDefinitions));
  if (!rooms.size || rooms.size > 467) fail('A05_ROOM_LIMIT');
  const registry = new Map(), recordKeys = new Set(), policies = [];
  for (const raw of list(bindings, A05_LIMITS.bindings)) {
    exact(raw, ['bindingId', 'field', 'recordId', 'roomId', 'actorIds', 'source', 'valueRule', 'sensitive', 'resourceId', 'knowledge']);
    const bindingId = text(own(raw, 'bindingId')), field = own(raw, 'field'), recordId = text(own(raw, 'recordId'));
    if (!authority.fields.includes(field) || registry.has(bindingId) || recordKeys.has(`${field}:${recordId}`)) fail('A05_BINDING_ID_OR_FIELD');
    const roomId = text(own(raw, 'roomId'));
    if (!rooms.has(roomId)) fail('A05_UNKNOWN_ROOM');
    const actorIds = list(own(raw, 'actorIds'), 32).map(x => text(x));
    if (!actorIds.length || new Set(actorIds).size !== actorIds.length || actorIds.some(id => !authority.actors.includes(id))) fail('A05_ACTOR_SCOPE');
    const source = sourceCopy(own(raw, 'source')), rule = own(raw, 'valueRule'), type = own(rule, 'type');
    let valueRule;
    if (type === 'COUNT') {
      exact(rule, ['type']);
      if (domainId !== 'LOGISTICS' || !['stock', 'reserved', 'deliveries'].includes(field)) fail('A05_COUNT_FIELD');
      valueRule = { type };
    } else if (type === 'LITERAL') {
      exact(rule, ['type', 'values']);
      const values = list(own(rule, 'values'), A05_LIMITS.literals).map(scalar);
      if (!values.length || new Set(values).size !== values.length) fail('A05_LITERAL_CATALOGUE');
      valueRule = { type, values };
    } else fail('A05_VALUE_RULE');
    const sensitive = own(raw, 'sensitive'), resourceId = own(raw, 'resourceId');
    if (typeof sensitive !== 'boolean' || (sensitive && domainId !== 'ARCHIVE')) fail('A05_SENSITIVE_DOMAIN');
    if (sensitive ? typeof resourceId !== 'string' || !resourceId.length || resourceId === '*' : resourceId !== null) fail('A05_RESOURCE_SCOPE');
    if (sensitive) text(resourceId);
    const binding = freeze({ bindingId, field, recordId, roomId, actorIds, source, valueRule, sensitive, resourceId });
    registry.set(bindingId, binding); recordKeys.add(`${field}:${recordId}`);
    policies.push({ actionId: bindingId, effect: sensitive ? 'ARCHIVE_READ' : 'ROUTINE', channel: 'DIRECT', actorIds,
      knowledge: own(raw, 'knowledge'), resourceId, requiresPlayer: false, source: source.id });
  }
  const guard = policies.length ? createKnowledgePermissionGuard(policies) : null;
  const capture = feed === null ? null : syncFunction(own(feed, 'capture'));
  const owned = new WeakSet();
  function state(turn, fields) {
    const out = freeze({ schemaVersion: 1, domainId, observedTurn: turn, ...fields }); owned.add(out); return out;
  }
  const emptyFields = () => Object.fromEntries(authority.fields.map(f => [f, []]));
  function requireState(s) { if (!owned.has(s)) fail('A05_FOREIGN_STATE'); }
  function reconcile(previous) {
    requireState(previous);
    const finish = (status, why, next = previous, deltas = []) => freeze({ schemaVersion: 1, domainId,
      status, reasons: why, state: next, deltas });
    if (!capture) return finish('DEFERRED', ['A05_VERIFIED_DOMAIN_FEED_NOT_CONNECTED']);
    let raw;
    try { raw = capture(domainId); } catch { return finish('REJECTED', ['DOMAIN_CAPTURE_FAILED']); }
    let observedTurn, fields;
    try {
      exact(raw, ['schemaVersion', 'domainId', 'observedTurn', 'facts']);
      if (own(raw, 'schemaVersion') !== 1 || own(raw, 'domainId') !== domainId) fail('A05_FEED_MISMATCH');
      observedTurn = integer(own(raw, 'observedTurn'));
      if (previous.observedTurn !== null && observedTurn < previous.observedTurn) return finish('REJECTED', ['DOMAIN_OBSERVATION_STALE']);
      fields = emptyFields(); const seen = new Set();
      for (const fact of list(own(raw, 'facts'), A05_LIMITS.bindings)) {
        exact(fact, ['bindingId', 'sourceId', 'evidenceId', 'value']);
        const bindingId = text(own(fact, 'bindingId')), binding = registry.get(bindingId);
        if (!binding || seen.has(bindingId) || own(fact, 'sourceId') !== binding.source.id) fail('A05_UNVERIFIED_DOMAIN_FACT');
        seen.add(bindingId);
        const value = scalar(own(fact, 'value'));
        if (binding.valueRule.type === 'COUNT') integer(value);
        else if (!binding.valueRule.values.includes(value)) fail('A05_VALUE_OUTSIDE_SOURCE_CATALOGUE');
        fields[binding.field].push({ recordId: binding.recordId, bindingId, value,
          provenance: { source: { ...binding.source }, evidenceId: text(own(fact, 'evidenceId')), observedTurn } });
      }
      authority.fields.forEach(f => fields[f].sort((a, b) => a.recordId < b.recordId ? -1 : a.recordId > b.recordId ? 1 : 0));
    } catch { return finish('REJECTED', ['INVALID_DOMAIN_OBSERVATION']); }
    const next = state(observedTurn, fields), deltas = [];
    for (const field of authority.fields) {
      const old = new Map(previous[field].map(r => [r.bindingId, r]));
      for (const row of next[field]) {
        const before = old.get(row.bindingId); old.delete(row.bindingId);
        if (!before || JSON.stringify(before) !== JSON.stringify(row)) deltas.push({ kind: 'OBSERVATION', field, recordId: row.recordId,
          before: before ? before.value : null, after: row.value, provenance: { ...row.provenance, source: { ...row.provenance.source } } });
      }
      // A missing observation is unavailable, never an inferred zero/death/destruction/repair.
      for (const row of old.values()) deltas.push({ kind: 'UNAVAILABLE', field, recordId: row.recordId, before: row.value, after: null, provenance: null });
    }
    if (JSON.stringify(next) === JSON.stringify(previous)) return finish('UNCHANGED', [], previous);
    return finish('RECONCILED', [], next, deltas);
  }
  function snapshot(s, actorSnapshot, permissions = null) {
    requireState(s);
    if (own(actorSnapshot, 'schemaVersion') !== 1) fail('A05_SNAPSHOT_VERSION');
    const actorId = text(own(own(actorSnapshot, 'actor'), 'id')), turn = integer(own(actorSnapshot, 'turn'));
    const roomId = text(own(own(actorSnapshot, 'position'), 'roomId')), fields = emptyFields();
    const finish = status => freeze({ schemaVersion: 1, domainId, actorId, turn, status, ...fields });
    if (!authority.actors.includes(actorId)) return finish('OUTSIDE_DOMAIN_SCOPE');
    if (s.observedTurn === null) return finish('UNAVAILABLE');
    if (s.observedTurn !== turn) return finish('STALE');
    for (const field of authority.fields) for (const row of s[field]) {
      const binding = registry.get(row.bindingId);
      if (binding.roomId !== roomId || !binding.actorIds.includes(actorId)) continue;
      const a = guard.assess(actorSnapshot, permissions, { candidateId: binding.bindingId, actionId: binding.bindingId, actorId, roomId });
      if (!a.eligible) continue;
      // Source path/hash/evidence are motor provenance, not NPC knowledge or a narrative grant.
      fields[field].push({ recordId: row.recordId, value: row.value });
    }
    return finish('CURRENT');
  }
  return Object.freeze({ empty: () => state(null, emptyFields()), reconcile, snapshot });
}

export { A05_LIMITS, DomainInputError, createSourcedDomain, exact, fail, freeze, integer, list, own, sourceCopy, syncFunction, text };
