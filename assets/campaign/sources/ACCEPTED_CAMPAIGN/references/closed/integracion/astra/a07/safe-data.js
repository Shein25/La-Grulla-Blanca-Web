/** Bounded detached integration DTOs; no getters, functions, cycles or runtime references. */
class NpcInputError extends TypeError {
  constructor(code){super(code);this.name='NpcInputError';this.code=code;}
}
const fail=code=>{throw new NpcInputError(code);};
const LIMITS=Object.freeze({nodes:4096,depth:32,string:1024,plannerExpansions:5000,plannerFrontier:10000});
function copy(raw){
  const seen=new Set();let count=0;
  function visit(x,depth){
    if(++count>LIMITS.nodes||depth>LIMITS.depth)fail('A07_DATA_BOUND');
    if(x===null||typeof x==='boolean')return x;
    if(typeof x==='string'){if(x.length>LIMITS.string)fail('A07_DATA_BOUND');return x;}
    if(typeof x==='number'){if(!Number.isFinite(x))fail('A07_NONFINITE');return x;}
    if(!x||typeof x!=='object'||seen.has(x))fail('A07_NON_DATA_OR_ALIAS');
    const array=Array.isArray(x),proto=Object.getPrototypeOf(x);
    if(proto!==(array?Array.prototype:Object.prototype)&&!(proto===null&&!array))fail('A07_NONPLAIN');
    seen.add(x);const keys=Reflect.ownKeys(x),out=array?[]:{};
    let length=0;
    if(array){const d=Object.getOwnPropertyDescriptor(x,'length');length=d?.value;
      if(!Number.isSafeInteger(length)||length<0||length>LIMITS.nodes||keys.length!==length+1)fail('A07_ARRAY_BOUND');}
    for(const key of keys){
      if(array&&key==='length')continue;
      if(typeof key!=='string'||['__proto__','constructor','prototype'].includes(key))fail('A07_UNSAFE_KEY');
      if(array&&(!/^(0|[1-9]\d*)$/.test(key)||Number(key)>=length))fail('A07_ARRAY_BOUND');
      const d=Object.getOwnPropertyDescriptor(x,key);
      if(!d||!Object.hasOwn(d,'value')||!d.enumerable)fail('A07_ACCESSOR_OR_HIDDEN');
      out[key]=visit(d.value,depth+1);
    }
    return out;
  }
  return visit(raw,0);
}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
function exact(x,required,optional=[]){
  if(!x||typeof x!=='object'||Array.isArray(x))fail('A07_RECORD');
  const keys=Reflect.ownKeys(x);
  if(required.some(k=>!Object.hasOwn(x,k))||keys.some(k=>!required.includes(k)&&!optional.includes(k)))fail('A07_FIELDS');
  for(const k of keys)if(!Object.hasOwn(Object.getOwnPropertyDescriptor(x,k),'value'))fail('A07_ACCESSOR_OR_HIDDEN');
}
function text(x){if(typeof x!=='string'||!x.trim()||x.length>128)fail('A07_IDENTIFIER');return x;}
function source(x){exact(x,['path','sha256','locator']);text(x.path);text(x.locator);if(!/^[a-f0-9]{64}$/.test(x.sha256))fail('A07_SOURCE');}
function plannerOptions(x){
  exact(x,[],['maxExpansions','maxFrontier']);
  if(Object.hasOwn(x,'maxExpansions')&&(!Number.isSafeInteger(x.maxExpansions)||x.maxExpansions<0||x.maxExpansions>LIMITS.plannerExpansions))fail('A07_PLANNER_BOUND');
  if(Object.hasOwn(x,'maxFrontier')&&(!Number.isSafeInteger(x.maxFrontier)||x.maxFrontier<1||x.maxFrontier>LIMITS.plannerFrontier))fail('A07_PLANNER_BOUND');return x;
}

export { LIMITS, NpcInputError, copy, exact, fail, freeze, plannerOptions, source, text };
