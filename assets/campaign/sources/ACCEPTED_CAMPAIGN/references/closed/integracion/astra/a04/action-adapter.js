import { createKnowledgePermissionGuard } from '../a02/knowledge-permission-guard.js';

/** A04: AI proposes; a trusted synchronous engine port alone resolves effects. */

const A04_LIMITS = Object.freeze({ bindings: 256, text: 128, reasons: 32 });
class ActionInputError extends TypeError {
  constructor(code) { super(code); this.name = 'ActionInputError'; this.code = code; }
}
const fail = code => { throw new ActionInputError(code); };
function record(x) { if (!x || typeof x !== 'object' || Array.isArray(x)) fail('A04_EXPECTED_RECORD'); return x; }
function own(x, key) {
  if (!x || typeof x !== 'object') fail('A04_EXPECTED_OBJECT');
  const d = Object.getOwnPropertyDescriptor(x, key);
  if (!d || !Object.hasOwn(d, 'value')) fail('A04_MISSING_OR_ACCESSOR_FIELD');
  return d.value;
}
function exact(x, keys) {
  record(x);
  if (Reflect.ownKeys(x).length !== keys.length || Reflect.ownKeys(x).some(k => !keys.includes(k))) fail('A04_UNEXPECTED_FIELDS');
  keys.forEach(k => own(x, k)); return x;
}
function text(x) { if (typeof x !== 'string' || !x.length || x.length > A04_LIMITS.text) fail('A04_INVALID_TEXT'); return x; }
function integer(x) { if (!Number.isSafeInteger(x) || x < 0) fail('A04_INVALID_TURN'); return x; }
function freeze(x) { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; }
function reasons(x) {
  if (!Array.isArray(x) || x.length > A04_LIMITS.reasons) fail('A04_REASON_LIMIT');
  return Array.from({ length: x.length }, (_, i) => text(own(x, String(i))));
}
const INTENT_FIELDS = ['schemaVersion', 'commandId', 'actionId', 'actorId', 'turn', 'fromRoomId', 'targetRoomId', 'purpose'];
function intentCopy(raw) {
  exact(raw, INTENT_FIELDS);
  if (own(raw, 'schemaVersion') !== 1) fail('A04_INTENT_VERSION');
  const target = own(raw, 'targetRoomId'), purpose = own(raw, 'purpose');
  if (purpose !== null && !['DESTINATION', 'TECHNICAL_TRANSIT'].includes(purpose)) fail('A04_INVALID_PURPOSE');
  return freeze({ schemaVersion: 1, commandId: text(own(raw, 'commandId')), actionId: text(own(raw, 'actionId')),
    actorId: text(own(raw, 'actorId')), turn: integer(own(raw, 'turn')), fromRoomId: text(own(raw, 'fromRoomId')),
    targetRoomId: target === null ? null : text(target), purpose });
}

/** Bindings/policies, A03 and enginePort are host authority, never AI-supplied callbacks. */
function createActionAdapter({ bindings, navigation, enginePort = null }) {
  if (!Array.isArray(bindings) || !bindings.length || bindings.length > A04_LIMITS.bindings) fail('A04_BINDING_LIMIT');
  const registry = new Map(), policies = [];
  for (let i = 0; i < bindings.length; i++) {
    const raw = exact(own(bindings, String(i)), ['policy', 'kind', 'lineId']);
    const policy = own(raw, 'policy'), actionId = text(own(policy, 'actionId'));
    const kind = own(raw, 'kind'), effect = own(policy, 'effect'), channel = own(policy, 'channel'), lineId = own(raw, 'lineId');
    if (registry.has(actionId)) fail('A04_DUPLICATE_ACTION');
    if (kind === 'MOVE_STEP') {
      if (effect !== 'ROUTINE' || channel !== 'DIRECT' || lineId !== null) fail('A04_MOVE_POLICY');
    } else if (kind === 'SIMPLE_DIALOGUE') {
      if (effect !== 'DIALOGUE' || channel !== 'DIRECT') fail('A04_DIALOGUE_POLICY');
      text(lineId);
    } else if (kind === 'DOMAIN_INTENT') {
      if (effect !== 'ROUTINE' || channel !== 'FULFILL_DUTY' || lineId !== null) fail('A04_DOMAIN_POLICY');
    } else fail('A04_UNSUPPORTED_KIND');
    registry.set(actionId, freeze({ kind, lineId })); policies.push(policy);
  }
  // Reuse A02 verbatim; registration couples the execution kind to its actual guarded effect.
  const guard = createKnowledgePermissionGuard(policies);
  const checkStep = own(navigation, 'checkStep');
  if (typeof checkStep !== 'function') fail('A04_A03_REQUIRED');
  let capture = null, resolve = null;
  if (enginePort !== null) {
    capture = own(enginePort, 'capture'); resolve = own(enginePort, 'resolve');
    if (typeof capture !== 'function' || typeof resolve !== 'function' ||
        [capture, resolve].some(f => ['AsyncFunction', 'GeneratorFunction', 'AsyncGeneratorFunction'].includes(f.constructor.name))) fail('A04_SYNCHRONOUS_ENGINE_PORT_REQUIRED');
  }

  function validate(intent, frame) {
    if (own(frame, 'schemaVersion') !== 1) fail('A04_FRAME_VERSION');
    const revision = text(own(frame, 'revision')), snapshot = own(frame, 'snapshot'), context = own(frame, 'context');
    const finish = (status, why, checks = { eligibility: null, navigation: null }, command = null) => freeze({
      schemaVersion: 1, phase: 'VALIDATION', commandId: intent.commandId, actorId: intent.actorId,
      actionId: intent.actionId, status, reasons: [...why], revision, checks, command });
    if (own(snapshot, 'schemaVersion') !== 1 || own(context, 'schemaVersion') !== 1) fail('A04_OBSERVATION_VERSION');
    const actorId = text(own(own(snapshot, 'actor'), 'id')), turn = integer(own(snapshot, 'turn'));
    if (actorId !== intent.actorId || own(context, 'actorId') !== actorId) return finish('REJECTED', ['ACTOR_MISMATCH']);
    if (turn !== intent.turn || own(context, 'turn') !== turn) return finish('REPLAN_REQUIRED', ['TURN_CHANGED']);
    if (text(own(own(snapshot, 'position'), 'roomId')) !== intent.fromRoomId) return finish('REPLAN_REQUIRED', ['POSITION_CHANGED']);
    const binding = registry.get(intent.actionId);
    if (!binding) return finish('REJECTED', ['UNREGISTERED_ACTION']);
    if (binding.kind === 'MOVE_STEP' ? intent.targetRoomId === null || intent.purpose === null : intent.targetRoomId !== null || intent.purpose !== null) return finish('REJECTED', ['INTENT_SHAPE_MISMATCH']);
    const assessment = guard.assess(snapshot, own(context, 'permissions'), {
      candidateId: intent.commandId, actionId: intent.actionId, actorId, roomId: intent.fromRoomId });
    const checks = { eligibility: { eligible: assessment.eligible, reasons: reasons(assessment.reasons) }, navigation: null };
    if (!assessment.eligible) return finish('REJECTED', ['A02_DENIED', ...checks.eligibility.reasons], checks);
    if (binding.kind === 'DOMAIN_INTENT') return finish('DEFERRED', ['A05_DOMAIN_NOT_CONNECTED'], checks);
    let operation;
    if (binding.kind === 'MOVE_STEP') {
      const step = checkStep(snapshot, context, { requestId: intent.commandId, actorId, fromRoomId: intent.fromRoomId,
        goalRoomId: intent.targetRoomId, actionId: intent.actionId, purpose: intent.purpose, maxVisited: 467 });
      checks.navigation = { status: step.status, reasons: reasons(step.reasons) };
      if (step.status === 'ALREADY_THERE') return finish('NO_OP', ['ALREADY_THERE'], checks);
      if (step.status !== 'ROUTE_FOUND' || !step.nextStep || step.steps.length !== 1) return finish('REJECTED', ['A03_DENIED', ...checks.navigation.reasons], checks);
      operation = { fromRoomId: intent.fromRoomId, toRoomId: intent.targetRoomId, direction: step.nextStep.direction, purpose: intent.purpose };
    } else {
      // Direct, co-present player dialogue. Never cmd_hablar()/gestionarMisionesNpc().
      if (own(own(snapshot, 'perception'), 'playerPresent') !== true) return finish('REJECTED', ['PLAYER_NOT_PRESENT'], checks);
      const normal = own(own(snapshot, 'territory'), 'normal');
      if (!Array.isArray(normal) || normal.length > 467) fail('A04_TERRITORY_LIMIT');
      if (!Array.from({ length: normal.length }, (_, i) => text(own(normal, String(i)))).includes(intent.fromRoomId)) return finish('REJECTED', ['DIALOGUE_OUTSIDE_NORMAL_TERRITORY'], checks);
      operation = { roomId: intent.fromRoomId, recipient: 'PLAYER', lineId: binding.lineId };
    }
    return finish('READY', [], checks, { schemaVersion: 1, commandId: intent.commandId, actorId, actionId: intent.actionId,
      kind: binding.kind, turn, expectedRevision: revision, operation });
  }

  function receiptCopy(raw, command) {
    exact(raw, ['schemaVersion', 'commandId', 'actorId', 'actionId', 'kind', 'status', 'expectedRevision', 'revisionAfter', 'reason', 'delta']);
    if (own(raw, 'schemaVersion') !== 1 || ['commandId', 'actorId', 'actionId', 'kind', 'expectedRevision'].some(k => own(raw, k) !== command[k])) fail('A04_RECEIPT_MISMATCH');
    const status = own(raw, 'status'), revisionAfter = text(own(raw, 'revisionAfter'));
    if (!['APPLIED', 'REJECTED', 'STALE', 'CANCELLED'].includes(status)) fail('A04_RECEIPT_STATUS');
    const reason = own(raw, 'reason'), delta = own(raw, 'delta');
    if (status !== 'APPLIED') {
      if (delta !== null) fail('A04_NON_APPLIED_DELTA');
      if (!/^[A-Z][A-Z0-9_]*$/.test(text(reason))) fail('A04_REASON_CODE_REQUIRED');
      return { status, revisionAfter, reason, delta: null };
    }
    if (reason !== null) fail('A04_APPLIED_REASON');
    let resolved;
    if (command.kind === 'MOVE_STEP') {
      exact(delta, ['fromRoomId', 'toRoomId']);
      if (own(delta, 'fromRoomId') !== command.operation.fromRoomId || own(delta, 'toRoomId') !== command.operation.toRoomId || revisionAfter === command.expectedRevision) fail('A04_MOVE_DELTA_MISMATCH');
      resolved = { fromRoomId: command.operation.fromRoomId, toRoomId: command.operation.toRoomId };
    } else {
      exact(delta, ['roomId', 'recipient', 'lineId']);
      if (Object.keys(command.operation).some(k => own(delta, k) !== command.operation[k])) fail('A04_DIALOGUE_DELTA_MISMATCH');
      resolved = { ...command.operation };
    }
    return { status, revisionAfter, reason: null, delta: resolved };
  }

  function execute(rawIntent, cancelled = false) {
    let intent = null, validation = null;
    const result = (status, why, dispatched = false, mayHaveApplied = false, receipt = null) => freeze({ schemaVersion: 1,
      phase: 'RESULT', commandId: intent?.commandId ?? null, actorId: intent?.actorId ?? null,
      actionId: intent?.actionId ?? null, status, reasons: [...why], validation, dispatched, mayHaveApplied, receipt });
    try { intent = intentCopy(rawIntent); if (typeof cancelled !== 'boolean') fail('A04_INVALID_CANCELLATION'); }
    catch { return result('REJECTED', ['INVALID_INTENT']); }
    if (cancelled) return result('CANCELLED', ['CANCELLED_BEFORE_CAPTURE']);
    if (!capture) return result('DEFERRED', ['A04_ENGINE_PORT_NOT_CONNECTED']);
    let frame;
    try { frame = capture(intent.actorId); } catch { return result('FAILED', ['ENGINE_CAPTURE_FAILED']); }
    try { validation = validate(intent, frame); } catch { return result('REJECTED', ['INVALID_CURRENT_FRAME']); }
    if (validation.status !== 'READY') return result(validation.status, validation.reasons);
    // No yield, AI callback, token replay or symbolic applyEffects between validation and dispatch.
    let rawReceipt;
    try { rawReceipt = resolve(validation.command); }
    catch { return result('UNKNOWN_OUTCOME', ['ENGINE_RESOLVE_THROW'], true, true); }
    let receipt;
    try { receipt = receiptCopy(rawReceipt, validation.command); }
    catch { return result('UNKNOWN_OUTCOME', ['UNVERIFIED_ENGINE_RESULT'], true, true); }
    const status = { APPLIED: 'SUCCEEDED', STALE: 'REPLAN_REQUIRED', REJECTED: 'FAILED', CANCELLED: 'CANCELLED' }[receipt.status];
    return result(status, receipt.reason === null ? [] : [receipt.reason], true, receipt.status === 'APPLIED', receipt);
  }
  return Object.freeze({ prepare: (intent, frame) => validate(intentCopy(intent), frame), execute });
}

export { A04_LIMITS, ActionInputError, createActionAdapter };
