/** Own-data reads only. Trusted host ports must be synchronous and read-only. */
const freeze = value => {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};
const fail = code => { throw new TypeError(code); };
function own(value, key) {
  if (!value || typeof value !== 'object') fail('MISSING_AUTHORITY');
  const d = Object.getOwnPropertyDescriptor(value, key);
  if (!d || !Object.hasOwn(d, 'value')) fail('MISSING_AUTHORITY');
  return d.value;
}
const id = value => typeof value === 'string' && value.length > 0 && value.length <= 128;
const turn = value => Number.isSafeInteger(value) && value >= 0;
function method(port, key) {
  const fn = own(port, key);
  if (typeof fn !== 'function' || fn.constructor.name === 'AsyncFunction') fail('INVALID_READ_PORT');
  return fn.bind(port);
}

export { fail, freeze, id, method, own, turn };
