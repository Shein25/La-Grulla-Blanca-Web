import { createWorldPerceptionAdapter } from '../a01/world-perception-adapter.js';
import { registrations } from '../a07/registry.js';
import { copy, exact } from '../a07/safe-data.js';
import { RELATIONS } from './relation-authority.js';
import { createActiveCycleReader } from './active-cycle-reader.js';
import { createNativeContextReader } from './native-context-reader.js';
import { fail, own, id, method, freeze, turn } from './readonly-data.js';

/** A07.6.1A: structural candidates only. No intention, response or execution. */

function createPairEligibility({ npcDefinitions, roomDefinitions, runtimePort, cycle = null, scopedAuthority = null }) {
  const rows = registrations(), ids = new Set(rows.map(r => r.actorId));
  if (Object.keys(npcDefinitions).length !== 32 || Object.keys(npcDefinitions).some(k => !ids.has(k))) fail('CANONICAL_IDS');
  for (const row of rows) {
    const definition = own(npcDefinitions, row.actorId), subset = {};
    for (const key of Object.keys(row.canonical)) subset[key] = copy(own(definition, key));
    if (JSON.stringify(subset) !== JSON.stringify(row.canonical)) fail('CANONICAL_DRIFT');
  }
  const roomIds = Object.keys(roomDefinitions), roomAreas = new Map();
  if (!roomIds.length || roomIds.length > 467) fail('ROOM_BOUND');
  for (const key of roomIds) {
    const areaId = own(own(roomDefinitions, key), 'area');
    if (!id(key) || !id(areaId)) fail('ROOM_AREA_AUTHORITY');
    roomAreas.set(key, areaId);
  }
  const snapshot = createWorldPerceptionAdapter(npcDefinitions).snapshot;
  const capture = method(runtimePort, 'capture');
  const activity = createActiveCycleReader(cycle), context = createNativeContextReader(scopedAuthority);
  function evaluate(input) {
    let request;
    try {
      request = copy(input); exact(request, ['actorA', 'actorB', 'revision']);
      if (!id(request.revision)) fail('REVISION_REQUIRED');
    } catch { return freeze({ schemaVersion: 1, actorA: null, actorB: null, status: 'UNAVAILABLE', roomId: null,
      areaId: null, activeAreaId: null, relationEdgeIds: [], revision: null, turn: null, reasons: ['INVALID_REQUEST'] }); }
    const { actorA, actorB, revision } = request;
    const out = { schemaVersion: 1, actorA: id(actorA) ? actorA : null, actorB: id(actorB) ? actorB : null,
      status: 'UNAVAILABLE', roomId: null, areaId: null, activeAreaId: null, relationEdgeIds: [], revision, turn: null, reasons: [] };
    const finish = (status, reason, edges = []) => freeze({ ...out, status, relationEdgeIds: [...edges], reasons: reason ? [reason] : [] });
    if (!ids.has(actorA) || !ids.has(actorB)) return finish('INELIGIBLE', 'NON_CANONICAL_ACTOR');
    if (actorA === actorB) return finish('INELIGIBLE', 'SAME_ACTOR');
    function read() {
      const captured = capture(), runtime = own(captured, 'runtime');
      if (own(captured, 'revision') !== revision) fail('STALE_REVISION');
      const currentTurn = own(runtime, 'turnoGlobal'), playerRoom = own(runtime, 'pos');
      if (!turn(currentTurn) || !roomAreas.has(playerRoom)) fail('INVALID_NATIVE_CONTEXT');
      const nativeRooms = own(runtime, 'rooms'), positions = own(runtime, 'posicionNPC');
      const a = own(own(positions, actorA), 'sala'), b = own(own(positions, actorB), 'sala');
      if (!roomAreas.has(a) || !roomAreas.has(b)) fail('INVALID_NATIVE_POSITION');
      for (const room of [playerRoom, a, b])
        if (own(own(nativeRooms, room), 'area') !== roomAreas.get(room)) fail('NATIVE_AREA_DRIFT');
      const base = { turn: currentTurn, a, b, playerRoom, areaA: roomAreas.get(a), areaB: roomAreas.get(b) };
      if (a !== b) return { ...base, status: 'INELIGIBLE', reason: 'NOT_COPRESENT' };
      const active = activity.read(currentTurn, roomAreas.get(playerRoom), actorA, actorB, base.areaA);
      if (active.status !== 'ACTIVE') return { ...base, active, status: active.status === 'DORMANT' ? 'INELIGIBLE' : 'UNAVAILABLE', reason: active.reason };
      const aFrame = snapshot(runtime, actorA), bFrame = snapshot(runtime, actorB);
      if (aFrame.turn !== currentTurn || bFrame.turn !== currentTurn || aFrame.position.roomId !== a || bFrame.position.roomId !== b ||
          !aFrame.perception.coPresentNpcIds.includes(actorB) || !bFrame.perception.coPresentNpcIds.includes(actorA)) fail('INCOHERENT_A01_PERCEPTION');
      const edges = RELATIONS.filter(e => e.actorA === actorA && e.actorB === actorB || e.symmetric && e.actorA === actorB && e.actorB === actorA);
      if (!edges.length) return { ...base, active, aFrame, bFrame, status: 'INELIGIBLE', reason: 'NO_VERIFIED_RELATION' };
      const scopes = [...new Set(edges.map(e => e.scope))].sort();
      const ctx = context.read(runtime, { actorA, actorB, revision, turn: currentTurn, roomId: a }, scopes);
      if (ctx.locked) return { ...base, active, aFrame, bFrame, ctx, status: 'INELIGIBLE', reason: 'NATIVE_INTERACTION_LOCK' };
      const applicable = edges.filter(e => ctx.states[e.scope] === 'ACTIVE').map(e => e.id);
      const missing = scopes.some(s => ctx.states[s] === 'UNAVAILABLE');
      return { ...base, active, aFrame, bFrame, ctx, edges: applicable,
        status: applicable.length ? 'ELIGIBLE_CANDIDATE' : missing ? 'UNAVAILABLE' : 'INELIGIBLE',
        reason: applicable.length ? null : missing ? 'SCOPED_AUTHORITY_UNAVAILABLE' : 'RELATION_SCOPE_INACTIVE' };
    }
    try {
      // Synchronous double capture detects revision/position/locks/activity/reader drift.
      // No cache, retained runtime reference, clock, controller or semantic state.
      const first = read(), second = read();
      if (JSON.stringify(first) !== JSON.stringify(second)) return finish('UNAVAILABLE', 'INCOHERENT_REVISION');
      out.turn = first.turn; out.roomId = first.a === first.b ? first.a : null;
      out.areaId = first.areaA === first.areaB ? first.areaA : null;
      out.activeAreaId = first.active?.activeAreaId ?? null;
      return finish(first.status, first.reason, first.edges);
    } catch { return finish('UNAVAILABLE', 'CURRENT_AUTHORITY_UNAVAILABLE'); }
  }
  return Object.freeze({ evaluate });
}

export { createPairEligibility };
