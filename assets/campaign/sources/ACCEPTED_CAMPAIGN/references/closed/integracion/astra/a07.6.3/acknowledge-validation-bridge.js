import { createAcknowledgeIntentAdapter } from '../a07.6.2/acknowledge-intent-adapter.js';
import { freeze } from '../a07/safe-data.js';

/** Own the unchanged A07.6.2B instance; no DTO/token can mint this host port. */
const bridges = new WeakSet();
const isAcknowledgeValidationBridge = value => bridges.has(value);
function createAcknowledgeValidationBridge(options) {
  const adapter = createAcknowledgeIntentAdapter(options);
  const bridge = Object.freeze({
    prepare: (event, request) => adapter.prepare(event, request),
    revalidate: (intent, request) => adapter.revalidate(intent, request),
    invalidate: () => adapter.invalidate(),
    dispose: () => adapter.dispose(),
    inspect: () => freeze({ ...adapter.inspect(), phase: 'A07.6.3A', ownsClosedA0762B: true })
  });
  bridges.add(bridge);
  return bridge;
}

export { createAcknowledgeValidationBridge, isAcknowledgeValidationBridge };
