import { method, freeze, own, fail, id, turn } from './readonly-data.js';
import { registrations } from '../a07/registry.js';

/** Thin A07.2 inspection. No tick, scheduler, clock, wake or dispatch API. */
const CANONICAL_IDS = new Set(registrations().map(r => r.actorId));

function createActiveCycleReader(cycle = null) {
  const inspect = cycle === null ? null : method(cycle, 'inspect');
  function read(currentTurn, playerAreaId, actorA, actorB, pairAreaId) {
    const unavailable = reason => freeze({ status: 'UNAVAILABLE', activeAreaId: null, reason });
    if (!inspect) return unavailable('A0760_ACTIVE_CYCLE_PRODUCTIVE_BINDING');
    try {
      const state = inspect();
      if (own(state, 'disposed') !== false) fail('DISPOSED_CYCLE');
      const activeAreaId = own(state, 'activeAreaId');
      if (!id(activeAreaId)) fail('MISSING_ACTIVE_AREA');
      const activation = own(own(state, 'activation'), 'activation');
      const scheduler = own(state, 'scheduler');
      if (own(activation, 'version') !== 1 || own(activation, 'activeAreaId') !== activeAreaId ||
          !turn(currentTurn) || own(activation, 'clock') !== currentTurn ||
          own(scheduler, 'clock') !== currentTurn || activeAreaId !== playerAreaId) fail('STALE_ACTIVE_CYCLE');
      // This rejects dormant pairs before A01 knowledge/perception or any brain.
      if (pairAreaId !== activeAreaId) return freeze({ status: 'DORMANT', activeAreaId, reason: 'DORMANT_AREA' });
      const rows = own(scheduler, 'rows');
      if (!Array.isArray(rows) || own(rows, 'length') !== 32) fail('INVALID_SCHEDULER_ROWS');
      const seen = new Set(); let found = 0;
      for (let i = 0; i < 32; i++) {
        const slot = own(rows, String(i)), actorId = own(own(slot, 'row'), 'id');
        if (!CANONICAL_IDS.has(actorId) || seen.has(actorId)) fail('INVALID_SCHEDULER_ROWS');
        seen.add(actorId);
        if (actorId === actorA || actorId === actorB) {
          if (own(slot, 'clock') !== currentTurn) fail('STALE_ACTOR_ACTIVITY');
          found++;
        }
      }
      if (found !== 2) fail('MISSING_ACTOR_ACTIVITY');
      return freeze({ status: 'ACTIVE', activeAreaId, reason: null });
    } catch {
      return unavailable('A0761_INCOHERENT_ACTIVE_CYCLE');
    }
  }
  return Object.freeze({ read });
}

export { createActiveCycleReader };
