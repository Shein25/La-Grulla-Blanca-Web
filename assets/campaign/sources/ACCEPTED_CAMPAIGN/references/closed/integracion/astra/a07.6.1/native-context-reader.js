import { copy, source, exact } from '../a07/safe-data.js';
import { own, method, fail, freeze } from './readonly-data.js';

/** Privileged structural reads; no global facts are exported to either NPC. */

// Exact states accepted by ver76 validarArc1(), not a new narrative vocabulary.
const ARC1_STATES = new Set(['PROLOGO', 'LI_INTEGRACION', 'LII_TERRITORIO', 'LIII_INVESTIGACION']);

function createNativeContextReader(scopedAuthority = null) {
  // Optional future host authority, never an implemented motive/disclosure feed.
  let inspect = null, provenance = null;
  if (scopedAuthority !== null) {
    provenance = copy(own(scopedAuthority, 'source')); source(provenance);
    inspect = method(scopedAuthority, 'inspect');
  }
  function read(runtime, request, scopes) {
    const combat = own(runtime, 'combate'), question = own(runtime, 'pregunta'), finished = own(runtime, 'terminado');
    if (typeof finished !== 'boolean' || (combat !== null && typeof combat !== 'object') ||
        (question !== null && typeof question !== 'object')) fail('INVALID_NATIVE_LOCK_CONTEXT');
    const locked = combat !== null || question !== null || finished;
    const states = {};
    for (const scope of scopes) {
      if (scope === 'GLOBAL') states[scope] = 'ACTIVE';
      else if (scope === 'ARC1') {
        try { states[scope] = ARC1_STATES.has(own(own(own(runtime, 'flags'), 'arc1'), 'estado')) ? 'ACTIVE' : 'UNAVAILABLE'; }
        catch { states[scope] = 'UNAVAILABLE'; }
      } else if (/^MISSION:M\d{2}$/u.test(scope)) {
        try {
          const value = own(own(runtime, 'quests'), scope.slice(8));
          // Native quest states audited in the accepted runtime.
          states[scope] = value === 'activa' ? 'ACTIVE' : value === 'hecha' ? 'INACTIVE' : 'UNAVAILABLE';
        } catch { states[scope] = 'UNAVAILABLE'; }
      } else states[scope] = 'UNAVAILABLE';
    }
    const unresolved = scopes.filter(s => states[s] === 'UNAVAILABLE');
    if (inspect && unresolved.length) {
      const query = freeze({ schemaVersion: 1, ...request, scopes: [...unresolved] });
      const frame = copy(inspect(query));
      exact(frame, ['schemaVersion', 'revision', 'turn', 'actorA', 'actorB', 'roomId', 'source', 'entries']);
      if (frame.schemaVersion !== 1 || ['revision', 'turn', 'actorA', 'actorB', 'roomId'].some(k => frame[k] !== request[k]) ||
          JSON.stringify(frame.source) !== JSON.stringify(provenance) || !Array.isArray(frame.entries) ||
          frame.entries.length !== unresolved.length) fail('INVALID_SCOPED_AUTHORITY');
      const seen = new Set();
      for (const entry of frame.entries) {
        exact(entry, ['scope', 'status', 'evidenceId']);
        if (!unresolved.includes(entry.scope) || seen.has(entry.scope) ||
            !['ACTIVE', 'INACTIVE', 'UNAVAILABLE'].includes(entry.status) ||
            typeof entry.evidenceId !== 'string' || !entry.evidenceId.length || entry.evidenceId.length > 128) fail('INVALID_SCOPED_AUTHORITY');
        seen.add(entry.scope); states[entry.scope] = entry.status;
      }
    }
    return freeze({ locked, states });
  }
  return Object.freeze({ read });
}

export { createNativeContextReader };
