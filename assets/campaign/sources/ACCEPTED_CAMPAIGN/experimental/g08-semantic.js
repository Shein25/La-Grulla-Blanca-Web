// Internal semantic boundary; not a save backend or a global writer.
const ports=new WeakMap(),permits=new WeakMap();
const fail=c=>{throw Error(c);};
function plain(value,depth=0){if(depth>64)fail('G08_DEPTH');if(value===null||typeof value==='boolean'||typeof value==='string')return value;
 if(typeof value==='number'){if(!Number.isFinite(value))fail('G08_NONFINITE');return value;}
 if(typeof value!=='object'||(!Array.isArray(value)&&Object.getPrototypeOf(value)!==Object.prototype))fail('G08_NON_DATA');
 if(Array.isArray(value)){if(value.length>100000)fail('G08_BOUND');return value.map(x=>plain(x,depth+1));}
 const out={};for(const k of Object.keys(value).sort()){if(['__proto__','prototype','constructor'].includes(k))fail('G08_KEY');const d=Object.getOwnPropertyDescriptor(value,k);if(!d||!Object.hasOwn(d,'value'))fail('G08_ACCESSOR');out[k]=plain(d.value,depth+1);}return out;}
const clone=x=>plain(x);
const canonical=x=>JSON.stringify(plain(x));
function bindSemantic(owner,port){if(!owner||ports.has(owner)||!port||['capture','prepare'].some(k=>typeof port[k]!=='function'))fail('G08_PRIVATE_PORT');ports.set(owner,port);return owner;}
function relaySemantic(owner,from){const p=ports.get(from);if(!p)fail('G08_RELAY');return bindSemantic(owner,p);}
function semanticPort(owner){const p=ports.get(owner);if(!p)fail('G08_SEMANTIC_PORT_ABSENT');return p;}
function requireRestorePermit(cap,record){if(permits.get(cap)!==canonical(record))fail('G08_RESTORE_AUTHORITY_REQUIRED');}
function integer(x,max=Number.MAX_SAFE_INTEGER){if(!Number.isSafeInteger(x)||x<0||x>max)fail('G08_INTEGER');}
function unique(xs){if(!Array.isArray(xs)||new Set(xs).size!==xs.length)fail('G08_DUPLICATE');}

function createMemoryCoordinator({identity,required,validate=()=>{},context=()=>({}),fault=null,storedResolver=null}){
 const attached=new Map(),issued=new Map();let incarnation=0,busy=false,last=null,terminalFloor=null;
 function graph(){if(required.some(k=>!attached.has(k)))fail('G08_REQUIRED_DOMAIN_BLOCKED');return Object.fromEntries(required.map(k=>[k,semanticPort(attached.get(k)).capture()]));}
 function check(e,external=false){if(e.format!=='GRULLA_NEW_MEMORY_CHECKPOINT'||e.version!==1||(!external&&canonical(e.identity)!==canonical(identity)))fail('G08_IDENTITY_OR_VERSION');if(canonical(Object.keys(e.domains).sort())!==canonical([...required].sort()))fail('G08_DOMAIN_SET');validate(e.domains);}
 function staged(e,external=false,destination=null,destinationContext=null){
  check(e,external);const sameGame=e.identity.gameId===identity.gameId;
  const currentQiao=attached.has('Qiao')?semanticPort(attached.get('Qiao')).capture().accepted:null;
  if(sameGame&&currentQiao&&canonical(e.domains.Qiao?.accepted)!==canonical(currentQiao))fail('G08_DELIVERY_ROLLBACK');
  if(sameGame&&terminalFloor&&canonical(e.domains.Qiao?.accepted)!==terminalFloor)fail('G08_DELIVERY_ROLLBACK');
  const recipients=destination??attached;if(!(recipients instanceof Map)||canonical([...recipients.keys()].sort())!==canonical([...required].sort()))fail('G08_DESTINATION_SET');
  const cap=Object.freeze({});permits.set(cap,canonical(e));const ctx=destinationContext??context(),plans=[];
  try{for(const k of required)plans.push(semanticPort(recipients.get(k)).prepare(e.domains[k],{permit:cap,envelope:e,context:ctx}));}
  catch(error){for(const p of plans)p.abort?.();permits.delete(cap);throw error;}
  return {abort(){for(const p of plans)p.abort?.();permits.delete(cap);},commit(){
   const undo=[],oldIdentity=clone(identity);busy=true;
   try{for(let i=0;i<plans.length;i++){fault?.('BEFORE_'+required[i]);const rollback=plans[i].apply();if(typeof rollback!=='function')fail('G08_ROLLBACK_REQUIRED');undo.push(rollback);fault?.('AFTER_'+required[i]);}
    if(external){for(const k of Object.keys(identity))delete identity[k];Object.assign(identity,clone(e.identity));issued.clear();terminalFloor=null;}
    incarnation++;last=external?'RESTORED_STORED_CHECKPOINT':'RESTORED_MEMORY_ONLY';if(e.domains.Qiao?.accepted)terminalFloor=canonical(e.domains.Qiao.accepted);
    let presentationPending=false;for(const p of plans)try{p.finalize?.();}catch{presentationPending=true;}return {status:last,incarnation,presentationPending};
   }catch(error){for(const f of undo.reverse())f();for(const p of plans)p.abort?.();for(const k of Object.keys(identity))delete identity[k];Object.assign(identity,oldIdentity);throw error;}
   finally{busy=false;permits.delete(cap);}
  }};
 }
 function stored(cap,preflight=false){if(!storedResolver)fail('G08_DURABLE_READER_ABSENT');const d=storedResolver(cap);if(!d||(!preflight&&d.kind!=='STORED'))fail('G08_STORED_SOURCE_REQUIRED');return clone(d.envelope);}
 return Object.freeze({attach(name,owner){if(!required.includes(name)||attached.has(name))fail('G08_ATTACH');semanticPort(owner);attached.set(name,owner);},
  capture(){if(busy)fail('G08_BUSY');const e=clone({format:'GRULLA_NEW_MEMORY_CHECKPOINT',version:1,identity,domains:graph()});check(e);const text=canonical(e);if(text.length>10000000)fail('G08_CHECKPOINT_BOUND');issued.set(text,true);while(issued.size>8)issued.delete(issued.keys().next().value);return e;},
  restore(input,destination=null,destinationContext=null){if(busy)fail('G08_BUSY');const e=clone(input);check(e);if(!issued.has(canonical(e)))fail('G08_UNVERIFIED_MEMORY_SOURCE');return staged(e,false,destination,destinationContext).commit();},
  preflightStored(cap){if(busy)fail('G08_BUSY');const p=staged(stored(cap,true),true);p.abort();return {status:'VALIDATED_ALL_DOMAINS'};},
  restoreStored(cap){if(busy)fail('G08_BUSY');return staged(stored(cap),true).commit();},
  invalidate(){issued.clear();terminalFloor=null;incarnation++;},
  inspect:()=>({backend:storedResolver?'MEMORY_AND_PRIVATE_DURABLE_READER':'MEMORY_ONLY',durable:!!storedResolver,required:[...required],attached:[...attached.keys()],incarnation,last})
 });
}

export { bindSemantic, canonical, clone, createMemoryCoordinator, fail, integer, plain, relaySemantic, requireRestorePermit, semanticPort, unique };
