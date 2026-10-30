(function(root){'use strict';
const plain=(v,depth=0)=>{if(depth>70)throw Error('COMBAT_CODEC_DEPTH');if(v===null||typeof v==='string'||typeof v==='boolean')return;if(typeof v==='number'&&Number.isFinite(v))return;if(!v||typeof v!=='object'||Object.getPrototypeOf(v)!==Object.prototype&&!Array.isArray(v))throw Error('COMBAT_CODEC_NON_DATA');if(Array.isArray(v)&&v.length>40000)throw Error('COMBAT_CODEC_BOUND');for(const[k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('COMBAT_CODEC_KEY');plain(x,depth+1);}};
function validateOwner(raw,name){plain(raw);if(raw.version!==1||raw.owner!==name||!Object.hasOwn(raw,'state')||!Array.isArray(raw.seen)||new Set(raw.seen).size!==raw.seen.length||raw.seen.some(x=>typeof x!=='string'))throw Error('COMBAT_OWNER_CODEC:'+name);return true;}
function seal(data){plain(data);return globalThis.ASTRA_A08_CONCORDANCE_BUS.sha256(globalThis.ASTRA_A08_CONCORDANCE_BUS.canonical(data));}
root.LGB_ORDINARY_CODEC=Object.freeze({plain,validateOwner,seal});
})(globalThis);
