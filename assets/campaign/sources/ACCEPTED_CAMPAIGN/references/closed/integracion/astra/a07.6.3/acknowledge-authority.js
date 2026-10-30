import { VOICES_R4 } from '../a07.5b1/voice-catalog-r4.js';
import { publicBindingRow, B21R2_AUTHORITY } from '../a07.5b2.1r2/public-bindings.js';
import { freeze, fail, copy } from '../a07/safe-data.js';

/** Read the ratified R4.1 profiles and R2 public names; never infer a role/trait. */
const actors = Object.freeze(['mei_lian', 'guo_chen']);
const originalHtml = 'docs/integracion/astra/fuentes-finales/runtime/grulla-blanca_ver76.html';
const ACKNOWLEDGE_REALIZATION_AUTHORITY = freeze({
  path: 'docs/integracion/astra/a07.6.3a/AUTORIZACION_A07_6_3A.md',
  sha256: '7d69f47114a1c50e2208596a756783f5cbf5c9edcd7742429218445ec23ea16c',
  locator: '3-8: unchanged R4.1 profile; R2 PUBLIC NAME; NAME_ONLY / SOFT_NOTICE'
});
function acknowledgeVoice(actorId) {
  if (!actors.includes(actorId)) fail('A0763A_PILOT_ACTOR');
  const voice = VOICES_R4.find(v => v.actorId === actorId);
  if (!voice || voice.readiness !== 'VOICE_READY' || voice.simpleRules.length !== 4 ||
      !voice.usedDimensions.includes('compression') || !voice.usedDimensions.includes('ellipsisTolerance')) fail('A0763A_VOICE_AUTHORITY');
  return voice; // Unchanged frozen catalog object, used only internally.
}
function acknowledgePublicIdentity(actorId) {
  if (!actors.includes(actorId)) fail('A0763A_PILOT_RECIPIENT');
  const row = publicBindingRow(actorId);
  if (row.nameStatus !== 'PUBLIC_SAFE' || !row.displayName || row.publicRoleCandidate !== null ||
      row.bindingKind !== 'NAME_ONLY_R2') fail('A0763A_PUBLIC_NAME_AUTHORITY');
  // The inherited name source describes the ORIGINAL b41 HTML. Point to the
  // byte-preserved import, not today's b096 HTML; no canonical field is changed.
  return freeze({ actorId, name: row.displayName, publicStatus: row.nameStatus,
    source: { ...copy(row.nameSource), path: originalHtml }, authority: copy(B21R2_AUTHORITY) });
}

export { ACKNOWLEDGE_REALIZATION_AUTHORITY, acknowledgePublicIdentity, acknowledgeVoice };
