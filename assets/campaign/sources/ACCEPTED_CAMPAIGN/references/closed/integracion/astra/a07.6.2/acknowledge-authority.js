import { RELATIONS, RELATION_SOURCE } from '../a07.6.1/relation-authority.js';
import { freeze, fail } from '../a07/safe-data.js';

/** Ratified semantic binding only; neither a new relation nor disclosure authority. */

const ACKNOWLEDGE_ACTORS = freeze(['mei_lian', 'guo_chen']);
const ACKNOWLEDGE_EDGE = RELATIONS.find(edge => edge.id === 'REL_mei_lian_guo_chen');
if (!ACKNOWLEDGE_EDGE || ACKNOWLEDGE_EDGE.actorA !== ACKNOWLEDGE_ACTORS[0] ||
    ACKNOWLEDGE_EDGE.actorB !== ACKNOWLEDGE_ACTORS[1] || !ACKNOWLEDGE_EDGE.symmetric ||
    ACKNOWLEDGE_EDGE.scope !== 'ARC1' || ACKNOWLEDGE_EDGE.relationType !== 'AMISTAD' ||
    ACKNOWLEDGE_EDGE.classification !== 'VERIFIED_EXPLICIT') fail('A0762B_PILOT_AUTHORITY');
const ACKNOWLEDGE_RELATION_AUTHORITY = RELATION_SOURCE;
const ACKNOWLEDGE_SOURCE = freeze({
  path: 'docs/integracion/astra/a07.6.2b/AUTORIZACION_A07_6_2B.md',
  sha256: 'c9382ee83fb762e0b52c3a5bfb4286a7a3938145014c105aea1eb5dd393c79f2',
  locator: 'Sections 1-8: ratified ACKNOWLEDGE pilot, null topic, no factual content'
});
const ACKNOWLEDGE_LIMITS = freeze({
  pendingProposals: 1, retainedMotiveProofs: 1, historyEntries: 0,
  backlog: 0, persistentIntents: 0, timers: 0, listeners: 0
});

export { ACKNOWLEDGE_ACTORS, ACKNOWLEDGE_EDGE, ACKNOWLEDGE_LIMITS, ACKNOWLEDGE_RELATION_AUTHORITY, ACKNOWLEDGE_SOURCE };
