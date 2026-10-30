/** A02: standalone eligibility checks. No grants, knowledge writes, navigation or execution. */
const A02_LIMITS = Object.freeze({ policies: 256, actors: 32, topics: 10, permissions: 32, rooms: 467, text: 128 });
const TOPICS = Object.freeze(Array.from({ length: 10 }, (_, i) => `R${i + 1}`));
const LEVELS = Object.freeze(['DESCONOCIDO', 'SOSPECHA', 'SABE', 'CONFIRMADO']);
const EFFECTS = new Set(['ROUTINE', 'DIALOGUE', 'ARCHIVE_READ', 'ARCHIVE_INTERACT', 'PASO_PULSO_INTENT',
  'QUEST_CLOSE', 'KNOWLEDGE_UPDATE', 'REVELATION', 'AUTHORIZE', 'FINAL_CHOICE']);
const NARRATIVE = new Set(['QUEST_CLOSE', 'KNOWLEDGE_UPDATE', 'REVELATION', 'AUTHORIZE', 'FINAL_CHOICE']);

class GuardInputError extends TypeError {
  constructor(code) { super(code); this.name = 'GuardInputError'; this.code = code; }
}
const fail = code => { throw new GuardInputError(code); };
function record(x) {
  if (x === null || typeof x !== 'object' || Array.isArray(x)) fail('A02_EXPECTED_RECORD');
  return x;
}
function own(x, key) {
  record(x);
  const d = Object.getOwnPropertyDescriptor(x, key);
  if (!d || !Object.hasOwn(d, 'value')) fail('A02_MISSING_OR_ACCESSOR_FIELD');
  return d.value;
}
function text(x) {
  if (typeof x !== 'string' || !x.length || x.length > A02_LIMITS.text) fail('A02_INVALID_TEXT');
  return x;
}
function integer(x) {
  if (!Number.isSafeInteger(x) || x < 0) fail('A02_INVALID_TURN');
  return x;
}
function bool(x) { if (typeof x !== 'boolean') fail('A02_INVALID_BOOLEAN'); return x; }
function list(x, maximum) {
  if (!Array.isArray(x) || x.length > maximum) fail('A02_LIST_LIMIT');
  const out = [];
  for (let i = 0; i < x.length; i++) {
    const d = Object.getOwnPropertyDescriptor(x, String(i));
    if (!d || !Object.hasOwn(d, 'value')) fail('A02_MISSING_OR_ACCESSOR_FIELD');
    out.push(d.value);
  }
  return out;
}
function ids(x, maximum) {
  const out = list(x, maximum).map(text);
  if (new Set(out).size !== out.length) fail('A02_DUPLICATE_ID');
  return out;
}
function freeze(x) {
  if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); }
  return x;
}
function level(x) { if (!LEVELS.includes(x)) fail('A02_INVALID_KNOWLEDGE'); return x; }
function observation(snapshot) {
  if (own(snapshot, 'schemaVersion') !== 1) fail('A02_SNAPSHOT_VERSION');
  const actorId = text(own(own(snapshot, 'actor'), 'id')), turn = integer(own(snapshot, 'turn'));
  const knowledge = {};
  for (const topic of TOPICS) knowledge[topic] = level(own(own(snapshot, 'knowledge'), topic));
  const roomId = text(own(own(snapshot, 'position'), 'roomId'));
  const territory = own(snapshot, 'territory');
  const normal = ids(own(territory, 'normal'), A02_LIMITS.rooms);
  const transit = ids(own(territory, 'technicalTransit'), A02_LIMITS.rooms);
  const valid = ids(own(territory, 'validPositions'), A02_LIMITS.rooms);
  if ([...normal, ...transit].some(r => !valid.includes(r))) fail('A02_INVALID_TERRITORY');
  const anchored = bool(own(own(snapshot, 'position'), 'anchored'));
  if (!valid.includes(roomId) && !anchored) fail('A02_INVALID_POSITION');
  const playerPresent = bool(own(own(snapshot, 'perception'), 'playerPresent'));
  return { actorId, turn, knowledge, roomId, playerPresent };
}

/** Trusted policy registry: the candidate cannot specify its effect or requirements. */
function createKnowledgePermissionGuard(policyDefinitions) {
  const policies = new Map();
  for (const raw of list(policyDefinitions, A02_LIMITS.policies)) {
    const actionId = text(own(raw, 'actionId'));
    if (policies.has(actionId)) fail('A02_DUPLICATE_POLICY');
    const effect = own(raw, 'effect');
    if (!EFFECTS.has(effect)) fail('A02_INVALID_EFFECT');
    const channel = own(raw, 'channel');
    if (!['DIRECT', 'FULFILL_DUTY'].includes(channel)) fail('A02_INVALID_CHANNEL');
    const actorIds = ids(own(raw, 'actorIds'), A02_LIMITS.actors);
    if (!actorIds.length) fail('A02_EMPTY_ACTORS');
    const knowledge = list(own(raw, 'knowledge'), A02_LIMITS.topics).map(r => {
      const topic = own(r, 'topic'), minLevel = level(own(r, 'minLevel')), use = own(r, 'use');
      if (!TOPICS.includes(topic) || !['SPECULATE', 'ASSERT', 'REQUIRE'].includes(use) ||
          minLevel === 'DESCONOCIDO' || (use === 'ASSERT' && LEVELS.indexOf(minLevel) < 2)) fail('A02_INVALID_REQUIREMENT');
      return { topic, minLevel, use };
    });
    if (new Set(knowledge.map(r => r.topic)).size !== knowledge.length) fail('A02_DUPLICATE_TOPIC');
    if (effect === 'DIALOGUE' && (!knowledge.length || knowledge.some(r => r.use === 'REQUIRE'))) fail('A02_DIALOGUE_REQUIREMENTS');
    const resourceId = own(raw, 'resourceId');
    if (['ARCHIVE_READ', 'ARCHIVE_INTERACT'].includes(effect)) {
      text(resourceId);
      if (resourceId === '*') fail('A02_PERMISSION_SCOPE');
    }
    else if (effect === 'PASO_PULSO_INTENT') {
      if (resourceId !== 'PASO_PULSO') fail('A02_PERMISSION_SCOPE');
    } else if (resourceId !== null) fail('A02_UNEXPECTED_RESOURCE');
    const requiresPlayer = bool(own(raw, 'requiresPlayer'));
    // Source is a traceability reference, not a runtime authority or granting event.
    const source = text(own(raw, 'source'));
    policies.set(actionId, freeze({ actionId, effect, channel, actorIds, knowledge, resourceId, requiresPlayer, source }));
  }

  function assess(snapshot, permissionProjection, candidate) {
    const { actorId, turn, knowledge, roomId, playerPresent } = observation(snapshot);
    const candidateId = text(own(candidate, 'candidateId')), actionId = text(own(candidate, 'actionId'));
    const reasons = [];
    const deny = code => { if (!reasons.includes(code)) reasons.push(code); };
    if (text(own(candidate, 'actorId')) !== actorId) deny('ACTOR_MISMATCH');
    if (text(own(candidate, 'roomId')) !== roomId) deny('ROOM_MISMATCH');
    const policy = policies.get(actionId);
    if (!policy) deny('UNKNOWN_ACTION');
    else {
      if (!policy.actorIds.includes(actorId)) deny('ACTOR_NOT_ALLOWED');
      if (policy.requiresPlayer && !playerPresent) deny('PLAYER_NOT_PRESENT');
      for (const r of policy.knowledge) {
        if (LEVELS.indexOf(knowledge[r.topic]) < LEVELS.indexOf(r.minLevel)) deny(`KNOWLEDGE_${r.topic}_INSUFFICIENT`);
      }
      if (NARRATIVE.has(policy.effect)) {
        deny(policy.channel === 'FULFILL_DUTY' ? 'GENERIC_DUTY_NARRATIVE_FORBIDDEN' : 'NARRATIVE_EVALUATOR_REQUIRED');
      }
      if (['ARCHIVE_READ', 'ARCHIVE_INTERACT', 'PASO_PULSO_INTENT'].includes(policy.effect)) {
        checkPermission(permissionProjection, actorId, turn, policy, deny);
      }
    }
    const eligible = reasons.length === 0;
    // Transient assessment only: it cannot teach, grant, unlock, move or execute.
    return freeze({ schemaVersion: 1, actorId, candidateId, actionId, turn, eligible, reasons,
      guardToken: eligible ? { purpose: 'ELIGIBILITY_ONLY', actorId, candidateId, actionId, turn } : null });
  }
  return Object.freeze({ assess, assessLearning });
}

/** Assess one trusted actor-scoped evidence projection; never apply the proposed change. */
function assessLearning(snapshot, evidence) {
  const { actorId, turn, knowledge } = observation(snapshot);
  if (own(evidence, 'schemaVersion') !== 1) fail('A02_EVIDENCE_VERSION');
  const eventId = text(own(evidence, 'eventId')), topic = own(evidence, 'topic');
  if (!TOPICS.includes(topic)) fail('A02_INVALID_REQUIREMENT');
  const proposedLevel = level(own(evidence, 'proposedLevel')), sourceLevel = level(own(evidence, 'sourceLevel'));
  const kind = text(own(evidence, 'kind')), channel = text(own(evidence, 'channel'));
  const reasons = [];
  if (text(own(evidence, 'actorId')) !== actorId) reasons.push('EVIDENCE_ACTOR_MISMATCH');
  if (integer(own(evidence, 'turn')) !== turn) reasons.push('EVIDENCE_SNAPSHOT_STALE');
  if (integer(own(evidence, 'observedTurn')) > turn) reasons.push('EVIDENCE_FROM_FUTURE');
  if (channel !== 'EVIDENCE') reasons.push('LEARNING_CHANNEL_FORBIDDEN');
  if (!bool(own(evidence, 'authorized'))) reasons.push('EVIDENCE_NOT_AUTHORIZED');
  if (kind === 'WITNESSED') {
    if (text(own(evidence, 'witnessActorId')) !== actorId) reasons.push('EVIDENCE_NOT_WITNESSED_BY_ACTOR');
  } else if (kind === 'AUTHORIZED_COMMUNICATION') {
    const senderId = text(own(evidence, 'senderId'));
    if (senderId === actorId) reasons.push('EVIDENCE_INVALID_SENDER');
  } else reasons.push('EVIDENCE_SOURCE_UNSUPPORTED');
  if (LEVELS.indexOf(proposedLevel) > LEVELS.indexOf(sourceLevel)) reasons.push('EVIDENCE_CERTAINTY_EXCEEDED');
  if (LEVELS.indexOf(proposedLevel) <= LEVELS.indexOf(knowledge[topic])) reasons.push('LEARNING_NOT_ADVANCING');
  const eligible = reasons.length === 0;
  return freeze({ schemaVersion: 1, actorId, eventId, turn, topic, eligible, reasons,
    transition: eligible ? { from: knowledge[topic], to: proposedLevel } : null,
    guardToken: eligible ? { purpose: 'LEARNING_ELIGIBILITY_ONLY', actorId, eventId, turn, topic } : null });
}

function checkPermission(projection, actorId, turn, policy, deny) {
  if (projection === null) { deny('PERMISSION_MISSING'); return; }
  if (own(projection, 'schemaVersion') !== 1) fail('A02_PERMISSION_VERSION');
  if (text(own(projection, 'actorId')) !== actorId) { deny('PERMISSION_ACTOR_MISMATCH'); return; }
  if (integer(own(projection, 'turn')) !== turn) { deny('PERMISSION_SNAPSHOT_STALE'); return; }
  const permissionId = policy.effect === 'PASO_PULSO_INTENT' ? 'NUCLEO_PROFUNDO' : 'ARCHIVO_RESTRINGIDO';
  const entries = list(own(projection, 'entries'), A02_LIMITS.permissions);
  const seen = new Set(); let match = null;
  for (const entry of entries) {
    // Only the requested permission is inspected beyond its id. Foreign payloads stay private.
    const id = text(own(entry, 'id'));
    if (id !== permissionId) continue;
    const scope = own(entry, 'scope');
    const operation = text(own(scope, 'operation')), resourceId = text(own(scope, 'resourceId'));
    const key = JSON.stringify([operation, resourceId]);
    if (seen.has(key)) fail('A02_AMBIGUOUS_PERMISSION');
    seen.add(key);
    if (operation === policy.effect && resourceId === policy.resourceId) match = entry;
  }
  if (!match) { deny('PERMISSION_MISSING_OR_SCOPE'); return; }
  if (text(own(match, 'actorId')) !== actorId) deny('PERMISSION_ACTOR_MISMATCH');
  const source = own(match, 'source');
  const fuente = text(own(source, 'fuente')), origen = text(own(source, 'origen'));
  const issuerId = text(own(source, 'issuerId'));
  text(own(source, 'evidenceId'));
  // M09 is a normalized institutional grant, not an asserted legacy runtime shape.
  const expected = permissionId === 'NUCLEO_PROFUNDO' ? ['ORDEN', 'M17'] : ['AUTORIZACION_INSTITUCIONAL', 'M09'];
  if (fuente !== expected[0] || origen !== expected[1] || issuerId !== 'qiao_ren') deny('PERMISSION_PROVENANCE');
  if (!bool(own(match, 'active'))) deny('PERMISSION_INACTIVE');
  const issuedTurn = integer(own(match, 'issuedTurn')), expiresTurn = own(match, 'expiresTurn');
  if (expiresTurn !== null && integer(expiresTurn) < issuedTurn) fail('A02_INVALID_LIFETIME');
  if (issuedTurn > turn) deny('PERMISSION_NOT_YET_VALID');
  if (expiresTurn !== null && turn >= expiresTurn) deny('PERMISSION_EXPIRED');
  if (permissionId === 'ARCHIVO_RESTRINGIDO' && bool(own(match, 'm09Closed'))) deny('PERMISSION_M09_CLOSED');
}

export { A02_LIMITS, GuardInputError, createKnowledgePermissionGuard };
