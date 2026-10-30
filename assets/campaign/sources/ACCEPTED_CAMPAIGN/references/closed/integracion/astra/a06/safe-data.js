class SaveInputError extends TypeError {
  constructor(code) { super(code); this.name = 'SaveInputError'; this.code = code; }
}
const fail = code => { throw new SaveInputError(code); };
const A06_LIMITS = Object.freeze({ bytes: 4 * 1024 * 1024, nodes: 150000, depth: 64, string: 65536,
  populations: 512, patterns: 32, recentEvents: 64, overrides: 16 });
function freeze(x) { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; }
function exact(x, required, optional = []) {
  if (!x || typeof x !== 'object' || Array.isArray(x)) fail('A06_OBJECT_REQUIRED');
  const keys = Object.keys(x);
  if (required.some(k => !Object.hasOwn(x,k)) || keys.some(k => !required.includes(k) && !optional.includes(k))) fail('A06_FIELDS');
}
function integer(x, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(x) || x < 0 || x > max) fail('A06_INTEGER'); return x;
}
function text(x) { if (typeof x !== 'string' || !x.trim() || x.length > 256) fail('A06_IDENTIFIER'); return x; }
function list(x, limit) { if (!Array.isArray(x) || x.length > limit) fail('A06_ARRAY_BOUND'); return x; }
function unique(xs) { if (new Set(xs).size !== xs.length) fail('A06_DUPLICATE'); }
// Inspect data descriptors before copying: never invoke getters or toJSON.
// Proxies are outside the trusted host contract; persisted input is JSON text.
function capture(raw) {
  const seen = new Set(); let count = 0;
  function copy(x, depth) {
    if (++count > A06_LIMITS.nodes || depth > A06_LIMITS.depth) fail('A06_JSON_BOUND');
    if (x === null || typeof x === 'boolean') return x;
    if (typeof x === 'string') { if (x.length > A06_LIMITS.string) fail('A06_JSON_BOUND'); return x; }
    if (typeof x === 'number') { if (!Number.isFinite(x)) fail('A06_NONFINITE'); return x; }
    if (!x || typeof x !== 'object' || seen.has(x)) fail('A06_NON_JSON_OR_ALIAS');
    const array = Array.isArray(x), proto = Object.getPrototypeOf(x);
    if (!array && proto !== Object.prototype && proto !== null) fail('A06_NONPLAIN');
    seen.add(x); const keys = Reflect.ownKeys(x), out = array ? [] : {};
    let length = 0;
    if (array) {
      const d = Object.getOwnPropertyDescriptor(x,'length');
      if (!d || !Object.hasOwn(d,'value')) fail('A06_ACCESSOR');
      length = integer(d.value,A06_LIMITS.nodes);
      if (keys.length !== length + 1) fail('A06_SPARSE_OR_EXTRA_ARRAY');
    }
    for (const k of keys) {
      if (array && k === 'length') continue;
      if (typeof k !== 'string' || ['__proto__','constructor','prototype'].includes(k)) fail('A06_UNSAFE_KEY');
      if (array && (!/^(0|[1-9]\d*)$/.test(k) || Number(k) >= length)) fail('A06_SPARSE_OR_EXTRA_ARRAY');
      const d = Object.getOwnPropertyDescriptor(x,k);
      if (!d || !Object.hasOwn(d,'value') || !d.enumerable) fail('A06_ACCESSOR_OR_HIDDEN');
      out[k] = copy(d.value,depth+1);
    }
    return out;
  }
  return copy(raw,0);
}
function bytes(x) { return new TextEncoder().encode(x).length; }
function source(x) {
  exact(x,['path','sha256','locator']); text(x.path); text(x.locator);
  if (!/^[a-f0-9]{64}$/.test(x.sha256)) fail('A06_SOURCE');
}
function sync(fn) {
  if (typeof fn !== 'function' || Object.prototype.toString.call(fn) !== '[object Function]') fail('A06_SYNC_PORT'); return fn;
}

export { A06_LIMITS, SaveInputError, bytes, capture, exact, fail, freeze, integer, list, source, sync, text, unique };
