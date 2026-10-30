import { isSocialMoveProducer, SOCIAL_SOURCE_ID, SOCIAL_EVENT_TYPE, SOCIAL_SOURCE } from '../a07/social-move-producer.js';
import { copy, exact } from '../a07/safe-data.js';
import { RELATIONS, RELATION_SOURCE } from './relation-authority.js';
import { fail, method, id, turn, freeze, own } from './readonly-data.js';

/** A07.6.1B: consume a confirmed arrival, never create one or speak. Host capability. */

const PILOT = Object.freeze(['mei_lian', 'guo_chen']);
const relation = RELATIONS.find(e => e.actorA === PILOT[0] && e.actorB === PILOT[1] &&
  e.symmetric && e.relationType === 'AMISTAD' && e.classification === 'VERIFIED_EXPLICIT');
if (!relation || relation.scope !== 'ARC1') fail('PILOT_RELATION_AUTHORITY');

function createPilotMotivationFeed({ producer, pairEligibility, runtimePort }) {
  if (!isSocialMoveProducer(producer)) fail('VERIFIED_ARRIVAL_PRODUCER_REQUIRED');
  const evaluatePair = method(pairEligibility, 'evaluate'), capture = method(runtimePort, 'capture');
  const cutover = producer.head();
  if (cutover.sourceId !== SOCIAL_SOURCE_ID || !id(cutover.epoch) ||
      !turn(cutover.throughSequence) || !turn(cutover.throughTurn)) fail('INVALID_LIVE_CUTOVER');
  const epoch = cutover.epoch;
  let frontier = cutover.throughSequence, generation = null, blocked = false, busy = false, disposed = false;
  const no = (status, reason) => freeze({ schemaVersion: 1, status, reasons: [reason], motivation: null });

  function evaluate(event, rawRequest) {
    if (disposed || blocked) return no('UNAVAILABLE', 'SOURCE_LIVE_CUTOVER_REQUIRED');
    if (busy) return no('UNAVAILABLE', 'REENTRANT_MOTIVATION_READ');
    let request;
    try { request = copy(rawRequest); exact(request, ['revision']); if (!id(request.revision)) fail('REVISION_REQUIRED'); }
    catch { return no('UNAVAILABLE', 'INVALID_REQUEST'); }
    busy = true;
    try {
      // Tickets, source generation and receipt come from the intact privileged
      // host handoff of producer.execute(). They are never an NPC-authored DTO.
      exact(event, ['status', 'result', 'ticket']);
      if (own(event, 'status') !== 'CONFIRMED_SOCIAL_SOURCE_EVENT') return no('NO_MOTIVATION', 'NO_CONFIRMED_ARRIVAL');
      const proof = producer.proof(own(event, 'ticket'));
      if (proof.sourceId !== SOCIAL_SOURCE_ID || proof.epoch !== epoch || !producer.isCurrent(proof)) return no('UNAVAILABLE', 'STALE_SOURCE_PROOF');
      if (!turn(proof.sequence) || !turn(proof.firstSequence) || proof.firstSequence > proof.sequence || !turn(proof.turn)) fail('INVALID_SOURCE_SEQUENCE');
      if (generation !== null && proof.generation !== generation) {
        blocked = true; return no('UNAVAILABLE', 'SOURCE_GENERATION_CHANGED');
      }
      if (proof.sequence <= frontier) return no('NO_MOTIVATION', 'ALREADY_CONSUMED_EVENT');
      const head = producer.head();
      if (head.epoch !== epoch || head.sourceId !== SOCIAL_SOURCE_ID || proof.sequence !== head.throughSequence) return no('UNAVAILABLE', 'NOT_CURRENT_ARRIVAL_EVENT');
      const result = copy(own(event, 'result')), validation = result.validation, command = validation?.command, receipt = result.receipt;
      if (result.status !== 'SUCCEEDED' || result.dispatched !== true || validation?.status !== 'READY' ||
          command?.kind !== 'MOVE_STEP' || receipt?.status !== 'APPLIED' || command.schemaVersion !== 1 ||
          result.actorId !== command.actorId || result.commandId !== command.commandId || result.actionId !== command.actionId ||
          command.turn !== proof.turn || validation.revision !== command.expectedRevision ||
          receipt.revisionAfter === command.expectedRevision || receipt.revisionAfter !== request.revision ||
          receipt.delta?.fromRoomId !== command.operation?.fromRoomId || receipt.delta?.toRoomId !== command.operation?.toRoomId ||
          command.operation.fromRoomId === command.operation.toRoomId ||
          !['DESTINATION', 'TECHNICAL_TRANSIT'].includes(command.operation.purpose)) fail('UNVERIFIED_ARRIVAL_RECEIPT');
      const before = capture();
      if (own(before, 'revision') !== request.revision || own(own(before, 'runtime'), 'turnoGlobal') !== proof.turn ||
          head.throughTurn !== proof.turn) fail('STALE_ARRIVAL_CONTEXT');
      // Consume even a vetoed/dormant event. Waking or unlocking later cannot
      // replay that arrival as a social catch-up. One scalar frontier, no history.
      frontier = proof.sequence; generation = proof.generation;
      const actorId = command.actorId;
      if (!PILOT.includes(actorId)) return no('NO_MOTIVATION', 'OUTSIDE_PILOT');
      const recipientId = PILOT.find(id => id !== actorId);
      const gate = copy(evaluatePair({ actorA: actorId, actorB: recipientId, revision: request.revision }));
      if (gate.status !== 'ELIGIBLE_CANDIDATE') return no(gate.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'NO_MOTIVATION',
        gate.reasons?.includes('DORMANT_AREA') ? 'DORMANT_AREA' : 'PAIR_NOT_ELIGIBLE');
      if (gate.schemaVersion !== 1 || gate.actorA !== actorId || gate.actorB !== recipientId ||
          gate.revision !== request.revision || gate.turn !== proof.turn || gate.areaId !== gate.activeAreaId ||
          !id(gate.roomId) || !id(gate.activeAreaId) || !Array.isArray(gate.relationEdgeIds) ||
          !gate.relationEdgeIds.includes(relation.id)) return no('NO_MOTIVATION', 'PILOT_RELATION_NOT_APPLICABLE');
      // Only now inspect the bounded actor observations; no costly social work
      // or private knowledge reader is invoked for a dormant/denied pair.
      if (!Array.isArray(proof.candidates) || proof.candidates.length > 62) fail('SOURCE_BATCH_BOUND');
      const participation = proof.candidates.filter(x => x.observerId === actorId && x.record.counterpartId === recipientId &&
        x.record.typeId === SOCIAL_EVENT_TYPE && x.record.sourceId === SOCIAL_SOURCE_ID &&
        x.record.acquisition === 'PARTICIPATED' && x.record.occurredTurn === proof.turn && x.record.acquiredTurn === proof.turn);
      const witness = proof.candidates.filter(x => x.observerId === recipientId && x.record.counterpartId === actorId &&
        x.record.typeId === SOCIAL_EVENT_TYPE && x.record.sourceId === SOCIAL_SOURCE_ID &&
        x.record.acquisition === 'WITNESSED' && x.record.occurredTurn === proof.turn && x.record.acquiredTurn === proof.turn);
      if (participation.length !== 1 || witness.length !== 1 ||
          participation[0].record.sequence < proof.firstSequence || participation[0].record.sequence > proof.sequence ||
          command.operation.toRoomId !== gate.roomId) return no('NO_MOTIVATION', 'NO_NEW_ARRIVAL_WITH_STATIONARY_RECIPIENT');
      const after = capture(), runtime = own(after, 'runtime');
      if (own(after, 'revision') !== request.revision || own(runtime, 'turnoGlobal') !== proof.turn ||
          [actorId, recipientId].some(id => own(own(own(runtime, 'posicionNPC'), id), 'sala') !== gate.roomId) ||
          !producer.isCurrent(proof) || producer.head().throughSequence !== proof.sequence) return no('UNAVAILABLE', 'CONTEXT_CHANGED_DURING_EVALUATION');
      return freeze({ schemaVersion: 1, status: 'MOTIVATION_AVAILABLE', reasons: [], motivation: {
        type: 'SOCIAL_ACKNOWLEDGEMENT', actorId, recipientId, scope: relation.scope, revision: request.revision, turn: proof.turn,
        sourceEvent: { sourceId: proof.sourceId, typeId: SOCIAL_EVENT_TYPE, epoch, generation: proof.generation,
          firstSequence: proof.firstSequence, throughSequence: proof.sequence, sequence: participation[0].record.sequence,
          occurredTurn: proof.turn, commandId: command.commandId, revisionBefore: command.expectedRevision,
          revisionAfter: receipt.revisionAfter, fromRoomId: command.operation.fromRoomId, toRoomId: command.operation.toRoomId,
          acquisition: 'PARTICIPATED', source: copy(SOCIAL_SOURCE) },
        relationEdgeId: relation.id, relationType: relation.relationType, classification: relation.classification,
        source: [...relation.source], relationAuthority: copy(RELATION_SOURCE)
      } });
    } catch { return no('UNAVAILABLE', 'CURRENT_VERIFIED_ARRIVAL_REQUIRED'); }
    finally { busy = false; }
  }
  return Object.freeze({ evaluate, inspect: () => freeze({ sourceId: SOCIAL_SOURCE_ID, epoch, throughSequence: frontier,
    generation, blocked, disposed, retainedFrontiers: 1, historyEntries: 0, timers: 0, persisted: false }),
    dispose: () => { if (busy) fail('REENTRANT_MOTIVATION_READ'); disposed = true; } });
}

export { createPilotMotivationFeed };
