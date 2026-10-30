import { freeze, fail, copy, exact } from '../a07/safe-data.js';
import { acknowledgeVoice, acknowledgePublicIdentity } from './acknowledge-authority.js';

/** Two ratified vocative molds. No factual grammar, generated prose or renderer port. */
const ACKNOWLEDGE_CATALOG_REVISION = 'A0763A-ACKNOWLEDGE-R4.1';
const ACKNOWLEDGE_MAX_TEXT = 40;
const ACKNOWLEDGE_MOLDS = freeze(['NAME_ONLY', 'SOFT_NOTICE']);
const voseo = /(?:^|[^\p{L}])(?:vos|tenés|sabés|querés|podés|venís|decime|hablá)(?=$|[^\p{L}])/iu;
function deterministicVariant(intent) {
  const sequence = intent.reasonBasis.motive === 'DIRECT_SOCIAL_ADDRESS'
    ? intent.reasonBasis.rootSequence : intent.reasonBasis.sourceEvent.sequence;
  const key = JSON.stringify([intent.actorId, intent.counterpartId, intent.guard.revision,
    intent.guard.turn, sequence]);
  let value = 2166136261;
  for (const character of key) value = Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0;
  return value % 4;
}
/** Linguistic surface only. Calling this pure function grants no intent authority. */
function renderAcknowledgeSurface(intent) {
  const voice = acknowledgeVoice(intent.actorId), identity = acknowledgePublicIdentity(intent.counterpartId);
  const variant = deterministicVariant(intent), rule = voice.simpleRules[variant].single;
  // Project the closed single-clause oral rule only. BRIEF/PLAIN remain name-only.
  if (!['ORAL', 'BRIEF', 'PLAIN'].includes(rule)) fail('A0763A_UNSUPPORTED_VOICE_RULE');
  const mold = rule === 'ORAL' ? 'SOFT_NOTICE' : 'NAME_ONLY';
  const text = mold === 'NAME_ONLY' ? identity.name + '.' : 'Ah, ' + identity.name + '.';
  if (!auditAcknowledgeSurface(text, identity).valid) fail('A0763A_SURFACE_AUDIT');
  return freeze({ text, mold, deterministicVariant: variant,
    voiceProfileRevision: voice.revision, publicIdentity: copy(identity), voiceEvidenceIds: copy(voice.evidenceIds) });
}
/** Exact closed surface decoder; no profile, expected intent or factual claims. */
function auditAcknowledgeSurface(text, rawIdentity) {
  const bad = () => freeze({ valid: false, mold: null, claims: [], topics: [], relations: [] });
  try {
    const identity = copy(rawIdentity);
    exact(identity, ['actorId', 'name', 'publicStatus', 'source', 'authority']);
    if (JSON.stringify(identity) !== JSON.stringify(acknowledgePublicIdentity(identity.actorId))) return bad();
    if (typeof text !== 'string' || text.length > ACKNOWLEDGE_MAX_TEXT || voseo.test(text)) return bad();
    const mold = text === identity.name + '.' ? 'NAME_ONLY' : text === 'Ah, ' + identity.name + '.' ? 'SOFT_NOTICE' : null;
    return mold ? freeze({ valid: true, mold, claims: [], topics: [], relations: [] }) : bad();
  } catch { return bad(); }
}

export { ACKNOWLEDGE_CATALOG_REVISION, ACKNOWLEDGE_MAX_TEXT, ACKNOWLEDGE_MOLDS, auditAcknowledgeSurface, deterministicVariant, renderAcknowledgeSurface };
