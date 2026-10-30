/** Detached bounded data. Reads descriptors, never executes getters. G03 only. */
class StatInputError extends TypeError {
  constructor(code) { super(code); this.name='StatInputError'; this.code=code; }
}
const fail=code=>{throw new StatInputError(code);};
function copyData(raw) {
  const seen=new Set(); let nodes=0;
  function visit(x,depth) {
    if(++nodes>4096 || depth>16) fail('DATA_BOUND');
    if(x===null || typeof x==='boolean') return x;
    if(typeof x==='number') { if(!Number.isFinite(x)) fail('NONFINITE'); return x; }
    if(typeof x==='string') { if(x.length>1024) fail('DATA_BOUND'); return x; }
    if(!x || typeof x!=='object' || seen.has(x)) fail('NON_DATA_OR_ALIAS');
    const array=Array.isArray(x), proto=Object.getPrototypeOf(x);
    if(proto!==(array?Array.prototype:Object.prototype) && !(proto===null&&!array)) fail('NONPLAIN');
    seen.add(x);
    const keys=Reflect.ownKeys(x), out=array?[]:{};
    const length=array?Object.getOwnPropertyDescriptor(x,'length').value:0;
    if(array && (length>128 || keys.length!==length+1)) fail('ARRAY_BOUND');
    for(const key of keys) {
      if(array && key==='length') continue;
      if(typeof key!=='string' || ['__proto__','constructor','prototype'].includes(key)) fail('UNSAFE_KEY');
      if(array && (!/^(0|[1-9]\d*)$/.test(key)||Number(key)>=length)) fail('ARRAY_BOUND');
      const descriptor=Object.getOwnPropertyDescriptor(x,key);
      if(!descriptor || !Object.hasOwn(descriptor,'value') || !descriptor.enumerable) fail('ACCESSOR_OR_HIDDEN');
      out[key]=visit(descriptor.value,depth+1);
    }
    return out;
  }
  return visit(raw,0);
}
function exact(x,keys) {
  if(!x || typeof x!=='object' || Array.isArray(x) || Object.keys(x).length!==keys.length || keys.some(k=>!Object.hasOwn(x,k))) fail('FIELDS');
}
function freeze(x) {
  if(x && typeof x==='object') { Object.values(x).forEach(freeze); Object.freeze(x); }
  return x;
}
function number(x) {
  if(typeof x!=='number' || !Number.isFinite(x) || Math.abs(x)>1e9) fail('NUMERIC_BOUND');
  return x;
}
function identifier(x) {
  if(typeof x!=='string' || !/^[A-Za-z0-9_:.-]{1,128}$/.test(x)) fail('IDENTIFIER');
  return x;
}

export { StatInputError, copyData, exact, fail, freeze, identifier, number };
