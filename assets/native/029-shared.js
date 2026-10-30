(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ASTRA_A08_SHARED=factory();})(globalThis,function(){
'use strict';
function fail(code,details){const e=new Error(code);e.code=code;e.details=details;throw e;}
function plain(v,depth=0){if(depth>64)fail('A08_DATA_DEPTH');if(v===null||['string','boolean'].includes(typeof v))return v;
 if(typeof v==='number'){if(!Number.isFinite(v))fail('A08_NONFINITE');return v;}
 if(!v||typeof v!=='object'||(!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype))fail('A08_NONPLAIN');
 const out=Array.isArray(v)?[]:{};if(Object.keys(v).length>50000)fail('A08_DATA_BOUND');
 for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))fail('A08_DANGEROUS_KEY');const d=Object.getOwnPropertyDescriptor(v,k);if(!Object.hasOwn(d,'value'))fail('A08_ACCESSOR');out[k]=plain(d.value,depth+1);}return out;}
function freeze(v){if(v&&typeof v==='object'){Object.freeze(v);for(const x of Object.values(v))freeze(x);}return v;}
const copy=plain;
function exact(o,keys){if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).length!==keys.length||keys.some(k=>!Object.hasOwn(o,k)))fail('A08_SCHEMA');}
function number(x,name,{signed=false}={}){if(typeof x!=='number'||!Number.isFinite(x)||(!signed&&x<0))fail('A08_INVALID_'+name);return x;}
function integer(x,name){number(x,name);if(!Number.isSafeInteger(x))fail('A08_INTEGER_'+name);return x;}
const norm=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function resolve(query,candidates,definitions){const q=norm(query);if(!q)return null;const ids=[...new Set(candidates)];const direct=ids.filter(id=>norm(id)===q||norm(definitions[id]?.name||'')===q);if(direct.length===1)return direct[0];
 const words=q.replace(/_/g,' ').split(/\s+/);const matched=ids.filter(id=>{const t=norm(id+' '+(definitions[id]?.name||'')).replace(/_/g,' ');return words.every(w=>t.includes(w));});
 if(matched.length>1)fail('A08_AMBIGUOUS_ITEM',matched);return matched[0]||null;}
return Object.freeze({fail,plain,copy,freeze,exact,number,integer,norm,resolve});
});
