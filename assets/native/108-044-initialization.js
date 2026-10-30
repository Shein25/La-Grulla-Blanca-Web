(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.LGB_MORTAL_RANDOM=factory();})(globalThis,function(){
'use strict';
// A counter stream owned by the authenticated actor/skill ledger. Reloading an
// old combat cannot resample its next practice ordinal with a different hit RNG.
function draw({actorId,generation,skillId,ordinal}){if(typeof actorId!=='string'||typeof generation!=='string'||typeof skillId!=='string'||!Number.isSafeInteger(ordinal)||ordinal<1)throw Error('MORTAL_COUNTER_SCOPE');const key=JSON.stringify(['MORTAL_90_70_50_V1',actorId,generation,skillId,ordinal]);let seed=2166136261;for(let i=0;i<key.length;i++)seed=Math.imul(seed^key.charCodeAt(i),16777619)>>>0;let state=seed||1;state=(state^(state<<13))>>>0;state=(state^(state>>>17))>>>0;state=(state^(state<<5))>>>0;return Object.freeze({algorithm:'FNV1A32_XORSHIFT32_COUNTER_V1',ordinal,seed,state,roll:state/4294967296});}
return Object.freeze({draw});
});

(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../project/runtime/water-oceano.js'));else root.LGB_A09_OCEANO_OWNER=factory(root.ASTRA_A08_OCEANO);})(globalThis,function(Source){
'use strict';const clone=x=>structuredClone(x),canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
function create(saved=null){const owner=Source.create(),calls=clone(saved?.calls||[]);if(saved&&(saved.version!==1||!Array.isArray(saved.calls)||saved.calls.length>3))throw Error('A09_OCEANO_OWNER_SCHEMA');
function apply(method,args){if(!['arm','ownerResolved'].includes(method)||!args||typeof args.actionId!=='string'||method==='arm'&&(args.anchor!=='grulla_blanca'||args.failedTargets.some(x=>x!=='grulla_blanca')))throw Error('A09_OCEANO_OWNER_SOURCE');return owner[method](clone(args));}
for(const call of calls){const r=apply(call.method,call.args);if(canonical(r??null)!==canonical(call.result))throw Error('A09_OCEANO_OWNER_REPLAY_MISMATCH');}
return Object.freeze({active:owner.active,quote:owner.quote,stats:owner.stats,inspect:owner.inspect,call(method,args){const result=apply(method,args);calls.push({method,args:clone(args),result:clone(result??null)});if(calls.length>3)throw Error('A09_OCEANO_OWNER_BOUND');return result;},snapshot:()=>({version:1,calls:clone(calls)})});}
return Object.freeze({create});
});
