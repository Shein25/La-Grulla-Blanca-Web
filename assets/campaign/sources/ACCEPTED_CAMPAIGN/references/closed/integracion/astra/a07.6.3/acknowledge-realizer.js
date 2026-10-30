import { freeze, exact, fail, text, copy } from '../a07/safe-data.js';
import { validateAcknowledgeIntent } from '../a07.6.2/acknowledge-contract.js';
import { isAcknowledgeValidationBridge } from './acknowledge-validation-bridge.js';
import { isReciprocalValidationBridge, validateReciprocalIntent } from '../a07.6.3c/reciprocal-adapter.js';
import { ACKNOWLEDGE_MAX_TEXT, renderAcknowledgeSurface, ACKNOWLEDGE_CATALOG_REVISION } from './acknowledge-language.js';

/** Standalone internal utterance only. No text is emitted to the player or world. */
const capabilities = freeze({ phase: 'A07.6.3A', freeAiText: false, intentKinds: ['ACKNOWLEDGE'],
  recipientKinds: ['NPC'], maxText: ACKNOWLEDGE_MAX_TEXT, semanticClaims: 0, worldEffects: false,
  uiWrites: false, persistence: false, recipientDecision: false, history: 0, backlog: 0, timers: 0, listeners: 0 });
function createAcknowledgeRealizer(options) {
  exact(options, ['validationBridge']);
  const bridge = options.validationBridge;
  const reciprocal = isReciprocalValidationBridge(bridge);
  if (!isAcknowledgeValidationBridge(bridge) && !reciprocal) fail('A0763A_OWNED_VALIDATION_BRIDGE_REQUIRED');
  let busy = false, disposed = false;
  const no = reason => freeze({ status: 'NO_UTTERANCE', reason, utterance: null });
  function realize(raw) {
    if (disposed) return no('A0763A_DISPOSED');
    if (busy) return no('A0763A_REENTRANT');
    busy = true;
    try {
      exact(raw, ['intent', 'revision']); text(raw.revision);
      // Pass the ORIGINAL object to the owning closed adapter. A detached DTO,
      // valid schema, source hash or foreign instance cannot pass this boundary.
      const validated = bridge.revalidate(raw.intent, { revision: raw.revision });
      if (validated.status !== 'VALID') return no('A0763A_INTENT_' + validated.status);
      const intent = reciprocal ? validateReciprocalIntent(raw.intent) : validateAcknowledgeIntent(raw.intent);
      const rendered = renderAcknowledgeSurface(intent);
      // Everything after revalidate is synchronous pure data over frozen sources.
      return freeze({ status: 'REALIZED', reason: null, utterance: {
        schemaVersion: 1, actorId: intent.actorId, recipientId: intent.counterpartId,
        speechAct: 'ACKNOWLEDGE', text: rendered.text, topicRefs: [], semanticClaims: [], semanticRelations: [],
        contextRevision: intent.guard.revision, voiceProfileRevision: rendered.voiceProfileRevision,
        sourceBasis: { acknowledgeIntent: intent, publicIdentity: copy(rendered.publicIdentity), voiceEvidenceIds: copy(rendered.voiceEvidenceIds) },
        realization: { mold: rendered.mold, deterministicVariant: rendered.deterministicVariant, catalogRevision: ACKNOWLEDGE_CATALOG_REVISION }
      } });
    } catch { return no('A0763A_CURRENT_AUTHORITY_OR_SURFACE_NOT_VERIFIED'); }
    finally { busy = false; }
  }
  function dispose() { if (busy) fail('A0763A_REENTRANT_DISPOSAL'); disposed = true; }
  return Object.freeze({ realize, dispose, capabilities: () => capabilities,
    inspect: () => freeze({ disposed, history: 0, backlog: 0, persistentUtterances: 0, retainedUtterances: 0, timers: 0, listeners: 0 }) });
}

export { createAcknowledgeRealizer };
