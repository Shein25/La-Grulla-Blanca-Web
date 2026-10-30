import { fail, exact, copy, text, freeze } from '../a07/safe-data.js';
import { SOCIAL_SOURCE_ID, SOCIAL_EVENT_TYPE, SOCIAL_SOURCE } from '../a07/social-move-producer.js';
import { ACKNOWLEDGE_ACTORS, ACKNOWLEDGE_SOURCE, ACKNOWLEDGE_EDGE, ACKNOWLEDGE_RELATION_AUTHORITY } from './acknowledge-authority.js';

/** Structural/cross-field validation is NOT source authority or proposal ownership. */

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const integer = x => { if (!Number.isSafeInteger(x) || x < 0) fail('A0762B_INTEGER'); };
function constant(actual, expected) {
  // Closed sources are exact own-data objects; compare keys independent of order.
  if (actual && expected && typeof actual === 'object' && typeof expected === 'object') {
    exact(actual, Object.keys(expected));
    for (const key of Object.keys(expected)) constant(actual[key], expected[key]);
  } else if (actual !== expected) fail('A0762B_AUTHORITY_MISMATCH');
}

function validateAcknowledgeIntent(raw) {
  const intent = copy(raw);
  exact(intent, ['schemaVersion', 'actorId', 'counterpartId', 'intentKind', 'topicBasis',
    'reasonBasis', 'relationBasis', 'reputationBasis', 'guard']);
  if (intent.schemaVersion !== 2 || intent.intentKind !== 'ACKNOWLEDGE' || intent.topicBasis !== null)
    fail('A0762B_INTENT_KIND_OR_TOPIC');
  if (!ACKNOWLEDGE_ACTORS.includes(intent.actorId) ||
      intent.counterpartId !== ACKNOWLEDGE_ACTORS.find(id => id !== intent.actorId)) fail('A0762B_PILOT_PAIR');
  const reason = intent.reasonBasis, relation = intent.relationBasis, guard = intent.guard;
  exact(reason, ['motive', 'observedTurn', 'sourceEvent', 'source']);
  if (reason.motive !== 'SOCIAL_ACKNOWLEDGEMENT') fail('A0762B_MOTIVE');
  constant(reason.source, ACKNOWLEDGE_SOURCE);
  exact(guard, ['revision', 'turn', 'roomId', 'activeAreaId']);
  for (const key of ['revision', 'roomId', 'activeAreaId']) text(guard[key]);
  integer(guard.turn); integer(reason.observedTurn);
  if (reason.observedTurn !== guard.turn) fail('A0762B_TURN');
  const event = reason.sourceEvent;
  exact(event, ['sourceId', 'typeId', 'epoch', 'generation', 'firstSequence', 'throughSequence', 'sequence',
    'occurredTurn', 'commandId', 'revisionBefore', 'revisionAfter', 'fromRoomId', 'toRoomId', 'acquisition', 'source']);
  for (const key of ['epoch', 'commandId', 'revisionBefore', 'revisionAfter', 'fromRoomId', 'toRoomId']) text(event[key]);
  for (const key of ['generation', 'firstSequence', 'throughSequence', 'sequence', 'occurredTurn']) integer(event[key]);
  if (event.sourceId !== SOCIAL_SOURCE_ID || event.typeId !== SOCIAL_EVENT_TYPE ||
      event.acquisition !== 'PARTICIPATED' || event.firstSequence < 1 ||
      event.sequence < event.firstSequence || event.sequence > event.throughSequence ||
      event.occurredTurn !== guard.turn || event.revisionAfter !== guard.revision ||
      event.revisionBefore === event.revisionAfter || event.fromRoomId === event.toRoomId ||
      event.toRoomId !== guard.roomId) fail('A0762B_ARRIVAL_SCOPE');
  constant(event.source, SOCIAL_SOURCE);
  exact(relation, ['kind', 'edgeId', 'actorId', 'counterpartId', 'scope', 'relationType', 'classification', 'source', 'authority']);
  if (relation.kind !== 'VERIFIED_RELATION_EDGE' || relation.edgeId !== ACKNOWLEDGE_EDGE.id ||
      relation.actorId !== intent.actorId || relation.counterpartId !== intent.counterpartId ||
      relation.scope !== ACKNOWLEDGE_EDGE.scope || relation.relationType !== ACKNOWLEDGE_EDGE.relationType ||
      relation.classification !== ACKNOWLEDGE_EDGE.classification ||
      !equal(relation.source, ACKNOWLEDGE_EDGE.source)) fail('A0762B_RELATION');
  constant(relation.authority, ACKNOWLEDGE_RELATION_AUTHORITY);
  constant(intent.reputationBasis, { status: 'UNAVAILABLE', reason: 'NOT_REQUIRED_FOR_PURE_ACKNOWLEDGEMENT' });
  return freeze(intent);
}

export { validateAcknowledgeIntent };
