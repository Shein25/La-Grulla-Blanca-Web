import { createPilotMotivationFeed } from '../a07.6.1/pilot-motivation.js';
import { method, id, own, turn } from '../a07.6.1/readonly-data.js';
import { exact, fail, freeze, copy } from '../a07/safe-data.js';
import { isSocialMoveProducer } from '../a07/social-move-producer.js';
import { validateAcknowledgeIntent } from './acknowledge-contract.js';
import { ACKNOWLEDGE_EDGE, ACKNOWLEDGE_ACTORS, ACKNOWLEDGE_SOURCE, ACKNOWLEDGE_LIMITS } from './acknowledge-authority.js';

/** A07.6.2B: one source-owned motive -> one ephemeral proposal. No execution. */

function createAcknowledgeIntentAdapter(options) {
  exact(options, ['producer', 'pairEligibility', 'runtimePort']);
  const { producer, pairEligibility, runtimePort } = options;
  if (!isSocialMoveProducer(producer)) fail('A0762B_VERIFIED_PRODUCER_REQUIRED');
  const capture = method(runtimePort, 'capture'), evaluatePair = method(pairEligibility, 'evaluate');
  // Private composition is the provenance boundary. Arbitrary motive DTOs and
  // caller-supplied feeds cannot enter it; the closed feed consumes exactly once.
  const feed = createPilotMotivationFeed({ producer, pairEligibility, runtimePort });
  let owned = new WeakMap(), pending = null, busy = false, disposed = false, requiresLiveCutover = false;
  const proposal = (status, reason = null, intent = null) =>
    freeze({ status, reasons: reason ? [reason] : [], intent });
  const validity = (status, reason = null) => freeze({ status, reasons: reason ? [reason] : [] });
  function clear() { owned = new WeakMap(); pending = null; }
  function quarantine() { clear(); requiresLiveCutover = true; feed.dispose(); }
  function request(raw) {
    const value = copy(raw); exact(value, ['revision']);
    if (!id(value.revision)) fail('A0762B_REVISION_REQUIRED');
    return value;
  }
  function frame(actorId, counterpartId) {
    const captured = capture(); exact(captured, ['runtime', 'revision']);
    const runtime = own(captured, 'runtime'), revision = own(captured, 'revision');
    const currentTurn = own(runtime, 'turnoGlobal'), positions = own(runtime, 'posicionNPC');
    const roomId = own(own(positions, actorId), 'sala'), recipientRoomId = own(own(positions, counterpartId), 'sala');
    if (!id(revision) || !turn(currentTurn) || !id(roomId) || !id(recipientRoomId)) fail('A0762B_CURRENT_FRAME');
    // Return only scalars, never the runtime or any global object.
    return { revision, turn: currentTurn, roomId, recipientRoomId };
  }
  function headMatches(proof) {
    const head = copy(producer.head());
    exact(head, ['sourceId', 'epoch', 'throughSequence', 'throughTurn']);
    if (head.sourceId !== proof.sourceId || head.epoch !== proof.epoch ||
        head.throughSequence !== proof.sequence || head.throughTurn !== proof.turn) fail('A0762B_SOURCE_HEAD_DRIFT');
  }
  function current(actorId, counterpartId, proof, expectedRevision) {
    headMatches(proof);
    const before = frame(actorId, counterpartId);
    if (before.revision !== expectedRevision || before.turn !== proof.turn ||
        before.roomId !== before.recipientRoomId) fail('A0762B_CONTEXT_DRIFT');
    const gate = copy(evaluatePair({ actorA: actorId, actorB: counterpartId, revision: expectedRevision }));
    exact(gate, ['schemaVersion', 'actorA', 'actorB', 'status', 'roomId', 'areaId',
      'activeAreaId', 'relationEdgeIds', 'revision', 'turn', 'reasons']);
    if (gate.schemaVersion !== 1 || gate.status !== 'ELIGIBLE_CANDIDATE' || gate.actorA !== actorId ||
        gate.actorB !== counterpartId || gate.revision !== expectedRevision || gate.turn !== before.turn ||
        gate.roomId !== before.roomId || !id(gate.activeAreaId) || gate.areaId !== gate.activeAreaId ||
        JSON.stringify(gate.relationEdgeIds) !== JSON.stringify([ACKNOWLEDGE_EDGE.id]) ||
        !Array.isArray(gate.reasons) || gate.reasons.length) fail('A0762B_PAIR_NOT_ELIGIBLE');
    const after = frame(actorId, counterpartId);
    if (JSON.stringify(before) !== JSON.stringify(after)) fail('A0762B_CONTEXT_DRIFT');
    headMatches(proof);
    if (producer.isCurrent(proof) !== true) fail('A0762B_SOURCE_NOT_CURRENT');
    return { revision: after.revision, turn: after.turn, roomId: after.roomId, activeAreaId: gate.activeAreaId };
  }
  function prepare(event, rawRequest) {
    if (disposed || requiresLiveCutover) return proposal('DEFERRED', 'A0762B_NEW_LIVE_INSTANCE_REQUIRED');
    if (busy) return proposal('DEFERRED', 'A0762B_REENTRANT_READ');
    if (pending && producer.isCurrent(owned.get(pending)) !== true) {
      quarantine(); return proposal('DEFERRED', 'A0762B_NEW_LIVE_INSTANCE_REQUIRED');
    }
    let input;
    try { input = request(rawRequest); } catch { return proposal('DEFERRED', 'A0762B_INVALID_REQUEST'); }
    busy = true;
    try {
      // Only the result of THIS private closed feed is authoritative.
      const result = feed.evaluate(event, input);
      if (result.status !== 'MOTIVATION_AVAILABLE') return proposal(
        result.status === 'NO_MOTIVATION' ? 'NO_CONVERSATIONAL_INTENT' : 'DEFERRED', result.reasons[0]);
      const motive = result.motivation, proof = producer.proof(own(event, 'ticket'));
      if (!ACKNOWLEDGE_ACTORS.includes(motive.actorId) ||
          motive.recipientId !== ACKNOWLEDGE_ACTORS.find(id => id !== motive.actorId) ||
          motive.type !== 'SOCIAL_ACKNOWLEDGEMENT' || motive.scope !== ACKNOWLEDGE_EDGE.scope ||
          motive.relationEdgeId !== ACKNOWLEDGE_EDGE.id || motive.relationType !== ACKNOWLEDGE_EDGE.relationType ||
          motive.classification !== ACKNOWLEDGE_EDGE.classification) fail('A0762B_MOTIVE_AUTHORITY');
      const guard = current(motive.actorId, motive.recipientId, proof, input.revision);
      const intent = validateAcknowledgeIntent({
        schemaVersion: 2, actorId: motive.actorId, counterpartId: motive.recipientId,
        intentKind: 'ACKNOWLEDGE', topicBasis: null,
        reasonBasis: { motive: motive.type, observedTurn: motive.turn, sourceEvent: copy(motive.sourceEvent), source: copy(ACKNOWLEDGE_SOURCE) },
        relationBasis: { kind: 'VERIFIED_RELATION_EDGE', edgeId: motive.relationEdgeId,
          actorId: motive.actorId, counterpartId: motive.recipientId, scope: motive.scope,
          relationType: motive.relationType, classification: motive.classification,
          source: copy(motive.source), authority: copy(motive.relationAuthority) },
        reputationBasis: { status: 'UNAVAILABLE', reason: 'NOT_REQUIRED_FOR_PURE_ACKNOWLEDGEMENT' },
        guard
      });
      // Replacing the WeakMap releases EVERY old private association even when
      // the host retains old public DTOs. At most one proof exists in this slot.
      clear(); owned.set(intent, proof); pending = intent;
      return proposal('PROPOSED', null, intent);
    } catch {
      clear(); return proposal('DEFERRED', 'A0762B_CURRENT_AUTHORITY_NOT_VERIFIED');
    } finally { busy = false; }
  }
  function revalidate(intent, rawRequest) {
    if (disposed || requiresLiveCutover) return validity('INVALID', 'A0762B_INVALIDATED_INSTANCE');
    if (busy) return validity('INVALID', 'A0762B_REENTRANT_READ');
    const proof = owned.get(intent);
    if (!proof || intent !== pending) return validity('INVALID', 'A0762B_FOREIGN_OR_INVALIDATED_INTENT');
    busy = true;
    try {
      if (producer.isCurrent(proof) !== true) {
        quarantine(); return validity('INVALID', 'A0762B_SOURCE_GENERATION_OR_AVAILABILITY_CHANGED');
      }
      const input = request(rawRequest), guard = current(intent.actorId, intent.counterpartId, proof, input.revision);
      if (JSON.stringify(guard) !== JSON.stringify(intent.guard)) fail('A0762B_CONTEXT_DRIFT');
      // No feed.evaluate(), proof(ticket), arrival execution or motive recreation.
      return validity('VALID');
    } catch {
      if (producer.isCurrent(proof) !== true) {
        quarantine(); return validity('INVALID', 'A0762B_SOURCE_GENERATION_OR_AVAILABILITY_CHANGED');
      }
      clear(); return validity('STALE', 'A0762B_CURRENT_CONTEXT_NOT_VERIFIED');
    } finally { busy = false; }
  }
  function invalidate() {
    if (busy) fail('A0762B_REENTRANT_INVALIDATION');
    if (!disposed) quarantine();
  }
  function dispose() {
    if (busy) fail('A0762B_REENTRANT_DISPOSAL');
    clear(); feed.dispose(); disposed = true;
  }
  function inspect() {
    if (!busy && pending && producer.isCurrent(owned.get(pending)) !== true) quarantine();
    return freeze({ disposed, requiresLiveCutover, pendingProposals: pending ? 1 : 0,
      retainedMotiveProofs: pending ? 1 : 0, historyEntries: 0, backlog: 0,
      persistentIntents: 0, timers: 0, listeners: 0, limits: copy(ACKNOWLEDGE_LIMITS) });
  }
  return Object.freeze({ prepare, revalidate, invalidate, dispose, inspect });
}

export { createAcknowledgeIntentAdapter };
