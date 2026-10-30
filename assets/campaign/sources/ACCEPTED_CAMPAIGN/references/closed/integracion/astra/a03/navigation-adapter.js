import { DIRECTION_ORDER, findRoute } from './vendor/pathfinder.js';
import { createKnowledgePermissionGuard } from '../a02/knowledge-permission-guard.js';

/** A03: immutable route/step proposals. Only the engine can move an actor. */

const A03_LIMITS = Object.freeze({ rooms: 467, actors: 32, gates: 11, exits: 1974, text: 128, searches: 4 });
class NavigationInputError extends TypeError {
  constructor(code) { super(code); this.name = 'NavigationInputError'; this.code = code; }
}
const fail = code => { throw new NavigationInputError(code); };
function record(x) { if (!x || typeof x !== 'object' || Array.isArray(x)) fail('A03_EXPECTED_RECORD'); return x; }
function own(x, key) {
  const d = Object.getOwnPropertyDescriptor(record(x), key);
  if (!d || !Object.hasOwn(d, 'value')) fail('A03_MISSING_OR_ACCESSOR_FIELD');
  return d.value;
}
function text(x) { if (typeof x !== 'string' || !x.length || x.length > A03_LIMITS.text) fail('A03_INVALID_TEXT'); return x; }
function bool(x) { if (typeof x !== 'boolean') fail('A03_INVALID_BOOLEAN'); return x; }
function integer(x) { if (!Number.isSafeInteger(x) || x < 0) fail('A03_INVALID_TURN'); return x; }
function list(x, max) {
  if (!Array.isArray(x) || x.length > max) fail('A03_LIST_LIMIT');
  const out = [];
  for (let i = 0; i < x.length; i++) {
    const d = Object.getOwnPropertyDescriptor(x, String(i));
    if (!d || !Object.hasOwn(d, 'value')) fail('A03_MISSING_OR_ACCESSOR_FIELD');
    out.push(d.value);
  }
  return out;
}
function ids(x, max) { const out = list(x, max).map(text); if (new Set(out).size !== out.length) fail('A03_DUPLICATE_ID'); return out; }
function freeze(x) { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; }
const pair = (a, b) => JSON.stringify([a, b].sort());
const edgeKey = e => JSON.stringify([e.from, e.direction]);
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const external = (from, direction, to) => from === 'mojon_regional' && direction === 'sur' && to === 'ruta_regional_arc2';

/** Canonical tables and taskGuard are trusted inputs, never supplied by an AI candidate. */
function createNavigationAdapter(roomDefinitions, gateDefinitions, npcDefinitions, taskGuard) {
  if (!taskGuard || typeof taskGuard.assess !== 'function') fail('A03_A02_GUARD_REQUIRED');
  const roomIds = Object.keys(record(roomDefinitions)).sort();
  if (!roomIds.length || roomIds.length > A03_LIMITS.rooms) fail('A03_ROOM_LIMIT');
  const roomSet = new Set(roomIds), edges = [], externalEdges = [];
  const graph = { version: 1, rooms: roomIds.map(id => {
    text(id); const raw = own(roomDefinitions, id);
    if (own(raw, 'id') !== id) fail('A03_ROOM_IDENTITY');
    const source = record(own(raw, 'exits')), exits = {};
    if (Object.keys(source).some(d => !DIRECTION_ORDER.includes(d))) fail('A03_INVALID_DIRECTION');
    for (const direction of DIRECTION_ORDER) {
      const d = Object.getOwnPropertyDescriptor(source, direction);
      if (!d) { exits[direction] = null; continue; }
      if (!Object.hasOwn(d, 'value')) fail('A03_MISSING_OR_ACCESSOR_FIELD');
      const to = text(d.value);
      if (!roomSet.has(to)) {
        if (!external(id, direction, to)) fail('A03_DANGLING_EXIT');
        externalEdges.push({ from: id, direction, to }); exits[direction] = null;
      } else { exits[direction] = to; edges.push({ from: id, direction, to }); }
    }
    return { id, exits };
  }) };
  freeze(graph);
  const gates = new Map(), gateIds = new Set();
  for (const raw of list(gateDefinitions, A03_LIMITS.gates)) {
    const id = text(own(raw, 'id')), endpoints = ids(own(raw, 'extremos'), 2);
    if (endpoints.length !== 2 || endpoints.some(r => !roomSet.has(r)) || gateIds.has(id) || gates.has(pair(...endpoints))) fail('A03_INVALID_GATE');
    if (!endpoints.every((r, i) => edges.some(e => e.from === r && e.to === endpoints[1 - i]))) fail('A03_GATE_WITHOUT_EDGE');
    gateIds.add(id); gates.set(pair(...endpoints), id);
  }
  if ([...gateIds].some(id => id === 'M12' || id.startsWith('ATAJO_ALA_')) && !gateIds.has('SECTA_INTERIOR')) fail('A03_MISSING_GATE_DEPENDENCY');
  const actorIds = Object.keys(record(npcDefinitions)).sort(), actors = new Map();
  if (!actorIds.length || actorIds.length > A03_LIMITS.actors) fail('A03_ACTOR_LIMIT');
  for (const id of actorIds) {
    text(id); const raw = own(npcDefinitions, id);
    if (own(raw, 'id') !== id) fail('A03_ACTOR_IDENTITY');
    const normal = ids(own(raw, 'territorio_normal'), A03_LIMITS.rooms);
    const transit = ids(own(raw, 'transito_tecnico'), A03_LIMITS.rooms);
    const valid = ids(own(raw, 'posicion_valida'), A03_LIMITS.rooms);
    const initial = text(own(raw, 'sala_inicial'));
    if (!valid.includes(initial) || [...normal, ...transit].some(r => !valid.includes(r)) || valid.some(r => !roomSet.has(r))) fail('A03_INVALID_CANONICAL_TERRITORY');
    actors.set(id, freeze({ normal, transit, valid, initial }));
  }
  // This technical binding reuses A02's closed permission type; it creates no grant.
  const passageGuard = createKnowledgePermissionGuard([{ actionId: 'A03_CHECK_PASO_PULSO', effect: 'PASO_PULSO_INTENT',
    channel: 'DIRECT', actorIds, knowledge: [], resourceId: 'PASO_PULSO', requiresPlayer: false, source: 'DT-M17-07' }]);

  function navigate(snapshot, context, request, mode) {
    if (own(snapshot, 'schemaVersion') !== 1 || own(context, 'schemaVersion') !== 1) fail('A03_VERSION');
    const actorId = text(own(own(snapshot, 'actor'), 'id')), actor = actors.get(actorId);
    if (!actor) fail('A03_UNKNOWN_ACTOR');
    const turn = integer(own(snapshot, 'turn')), position = own(snapshot, 'position');
    const fromRoomId = text(own(position, 'roomId')), anchored = bool(own(position, 'anchored'));
    const territory = own(snapshot, 'territory');
    if (!same(ids(own(territory, 'normal'), A03_LIMITS.rooms), actor.normal) ||
        !same(ids(own(territory, 'technicalTransit'), A03_LIMITS.rooms), actor.transit) ||
        !same(ids(own(territory, 'validPositions'), A03_LIMITS.rooms), actor.valid) || own(territory, 'initialRoomId') !== actor.initial) fail('A03_SNAPSHOT_TERRITORY_DRIFT');
    if (!roomSet.has(fromRoomId) || (!actor.valid.includes(fromRoomId) && !anchored)) fail('A03_INVALID_POSITION');
    const requestId = text(own(request, 'requestId')), goalRoomId = text(own(request, 'goalRoomId'));
    const actionId = text(own(request, 'actionId')), purpose = own(request, 'purpose'), maxVisited = integer(own(request, 'maxVisited'));
    if (!['DESTINATION', 'TECHNICAL_TRANSIT'].includes(purpose)) fail('A03_INVALID_PURPOSE');
    if (maxVisited < 1 || maxVisited > A03_LIMITS.rooms) fail('A03_SEARCH_LIMIT');
    const checks = { physical: 'NOT_EVALUATED', territory: 'NOT_EVALUATED', technicalTransit: 'NOT_EVALUATED',
      anchor: anchored ? 'HELD' : 'CLEAR', narrativeGates: 'NOT_EVALUATED' };
    const institutional = { intent: null, passage: null };
    const searches = [], gateDiagnostics = [];
    function finish(status, reasons = [], route = null) {
      const steps = route ? route.steps.map(s => ({ ...s, territoryKind: actor.normal.includes(s.to) ? 'NORMAL' : 'TECHNICAL_TRANSIT', gateId: gates.get(pair(s.from, s.to)) ?? null })) : [];
      return freeze({ schemaVersion: 1, requestId, actorId, turn, mode, fromRoomId, goalRoomId, purpose, status, reasons,
        checks: { ...checks }, institutional: { ...institutional }, gateDiagnostics: [...gateDiagnostics],
        pathfinding: { searches: [...searches] }, rooms: route ? [...route.rooms] : [], steps,
        distance: route ? route.distance : null, nextStep: steps.length ? { ...steps[0] } : null });
    }
    if (text(own(request, 'actorId')) !== actorId || text(own(request, 'fromRoomId')) !== fromRoomId) return finish('REQUEST_MISMATCH', ['REQUEST_MISMATCH']);
    if (text(own(context, 'actorId')) !== actorId) return finish('CONTEXT_ACTOR_MISMATCH', ['CONTEXT_ACTOR_MISMATCH']);
    if (integer(own(context, 'turn')) !== turn) return finish('CONTEXT_STALE', ['CONTEXT_STALE']);
    const permissions = own(context, 'permissions');
    const assessment = taskGuard.assess(snapshot, permissions, { candidateId: requestId, actionId, actorId, roomId: fromRoomId });
    institutional.intent = { eligible: assessment.eligible, reasons: [...assessment.reasons] };
    if (!assessment.eligible) return finish('INTENT_INELIGIBLE', ['A02_INTENT_DENIED']);
    if (fromRoomId === goalRoomId) {
      checks.physical = 'ALREADY_THERE'; checks.territory = actor.valid.includes(fromRoomId) ? 'CURRENT_VALID_POSITION' : 'CURRENT_ANCHOR_ONLY';
      checks.technicalTransit = actor.transit.includes(fromRoomId) ? 'CURRENT_TECHNICAL_TRANSIT' : 'NONE'; checks.narrativeGates = 'NO_CROSSING';
      return finish('ALREADY_THERE', [], { rooms: [fromRoomId], steps: [], distance: 0 });
    }
    if (anchored) return finish('ANCHOR_HELD', ['ANCHOR_HELD']);
    if (!roomSet.has(goalRoomId)) return finish(externalEdges.some(e => e.to === goalRoomId) ? 'EXTERNAL_TARGET_UNSUPPORTED' : 'UNKNOWN_TARGET', ['TARGET_OUTSIDE_INTERNAL_GRAPH']);
    const originEdges = edges.filter(e => e.from === fromRoomId);
    const direct = originEdges.find(e => e.to === goalRoomId);
    if (mode === 'STEP' && !direct) { checks.physical = 'NO_DIRECT_EXIT'; return finish('NO_PHYSICAL_STEP', ['NO_DIRECT_EXIT']); }
    const stepBlocks = mode === 'STEP' ? originEdges.filter(e => e !== direct) : [];
    function search(phase, blocked) {
      const dedup = new Map([...stepBlocks, ...blocked].map(e => [edgeKey(e), { from: e.from, direction: e.direction }]));
      const route = findRoute(graph, fromRoomId, goalRoomId, { maxVisited, blockedExits: [...dedup.values()] });
      searches.push({ phase, status: route.status, visitedCount: route.visitedCount });
      return route;
    }
    let route = search('PHYSICAL', []);
    checks.physical = route.status;
    if (route.status === 'SEARCH_LIMIT') return finish('SEARCH_LIMIT', ['PHYSICAL_SEARCH_LIMIT']);
    if (route.status === 'NO_ROUTE') return finish('NO_PHYSICAL_ROUTE', ['NO_PHYSICAL_ROUTE']);
    if (!actor.valid.includes(goalRoomId)) { checks.territory = 'INVALID_TARGET'; return finish('TARGET_OUTSIDE_TERRITORY', ['TARGET_OUTSIDE_TERRITORY']); }
    checks.technicalTransit = actor.transit.includes(goalRoomId) ? 'TECHNICAL_TARGET' : 'NORMAL_TARGET';
    if (purpose === 'DESTINATION' && !actor.normal.includes(goalRoomId)) return finish('TECHNICAL_TRANSIT_ONLY', ['NOT_A_NORMAL_DESTINATION']);
    if (purpose === 'TECHNICAL_TRANSIT' && !actor.transit.includes(goalRoomId)) return finish('NOT_TECHNICAL_TRANSIT', ['NOT_A_TECHNICAL_TRANSIT_TARGET']);
    const territoryBlocks = edges.filter(e => !actor.valid.includes(e.to));
    route = search('TERRITORY', territoryBlocks); checks.territory = route.status;
    if (route.status === 'SEARCH_LIMIT') return finish('SEARCH_LIMIT', ['TERRITORY_SEARCH_LIMIT']);
    if (route.status === 'NO_ROUTE') return finish('NO_TERRITORIAL_ROUTE', ['NO_ROUTE_WITHIN_VALID_POSITIONS']);
    const relevantGateIds = new Set(edges.filter(e => actor.valid.includes(e.from) && actor.valid.includes(e.to)).map(e => gates.get(pair(e.from, e.to))).filter(Boolean));
    const gateStates = record(own(context, 'gateStates')), states = new Map();
    function state(id) {
      if (states.has(id)) return states.get(id);
      const d = Object.getOwnPropertyDescriptor(gateStates, id);
      if (!d) { states.set(id, 'UNAVAILABLE'); return 'UNAVAILABLE'; }
      if (!Object.hasOwn(d, 'value')) fail('A03_MISSING_OR_ACCESSOR_FIELD');
      const value = bool(d.value) ? 'OPEN' : 'CLOSED'; states.set(id, value); return value;
    }
    for (const id of [...relevantGateIds].sort()) {
      let value = state(id);
      if (id === 'M12' || id.startsWith('ATAJO_ALA_')) {
        const dependency = state('SECTA_INTERIOR');
        if (dependency !== 'OPEN') value = dependency === 'UNAVAILABLE' ? 'DEPENDENCY_UNAVAILABLE' : 'DEPENDENCY_CLOSED';
      }
      states.set(id, value); gateDiagnostics.push({ id, state: value });
    }
    const gateBlocks = edges.filter(e => { const id = gates.get(pair(e.from, e.to)); return id && relevantGateIds.has(id) && states.get(id) !== 'OPEN'; });
    route = search('NARRATIVE_GATES', [...territoryBlocks, ...gateBlocks]); checks.narrativeGates = route.status;
    if (route.status === 'SEARCH_LIMIT') return finish('SEARCH_LIMIT', ['GATE_SEARCH_LIMIT']);
    if (route.status === 'NO_ROUTE') return finish('NARRATIVE_GATE_BLOCKED', ['NO_ROUTE_THROUGH_CURRENT_GATES']);
    if (relevantGateIds.has('PASO_PULSO')) {
      const a = passageGuard.assess(snapshot, permissions, { candidateId: requestId, actionId: 'A03_CHECK_PASO_PULSO', actorId, roomId: fromRoomId });
      institutional.passage = { eligible: a.eligible, reasons: [...a.reasons] };
      const permissionBlocks = a.eligible ? [] : edges.filter(e => gates.get(pair(e.from, e.to)) === 'PASO_PULSO');
      route = search('INSTITUTIONAL_PERMISSION', [...territoryBlocks, ...gateBlocks, ...permissionBlocks]);
      if (route.status === 'SEARCH_LIMIT') return finish('SEARCH_LIMIT', ['PERMISSION_SEARCH_LIMIT']);
      if (route.status === 'NO_ROUTE') return finish('INSTITUTIONAL_EDGE_DENIED', ['NO_ROUTE_WITH_CURRENT_PERMISSION']);
    }
    return finish('ROUTE_FOUND', [], route);
  }
  return Object.freeze({ plan: (s, c, r) => navigate(s, c, r, 'PLAN'), checkStep: (s, c, r) => navigate(s, c, r, 'STEP'),
    topology: freeze({ rooms: roomIds.length, internalExits: edges.length, externalExits: externalEdges.length, gates: gateIds.size, actors: actorIds.length }) });
}

export { A03_LIMITS, NavigationInputError, createNavigationAdapter };
