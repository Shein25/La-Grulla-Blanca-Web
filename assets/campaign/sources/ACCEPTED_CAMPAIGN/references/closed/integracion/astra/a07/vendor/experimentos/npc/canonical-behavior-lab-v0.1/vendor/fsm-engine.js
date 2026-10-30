const OPS = new Set(['EQ','NEQ','GT','GTE','LT','LTE','IN']);
const NUMERIC_OPS = new Set(['GT','GTE','LT','LTE']);
const SOURCES = new Set(['event','runtime']);
const RUNTIME_GUARD_KEYS = new Set(['machineId','state','stateAge','step']);
const RUNTIME_NUMERIC_KEYS = new Set(['stateAge','step']);
const MAX_GUARD_DEPTH = 32;

class ContractError extends TypeError {
  constructor(message){ super(`ReactiveRoutineFSM: ${message}`); this.name='ContractError'; }
}

function fail(message){ throw new ContractError(message); }

function isPlainObject(value,label='valor'){
  if(value===null || typeof value!=='object') return false;
  let array;
  try { array=Array.isArray(value); }
  catch { fail(`${label} no se pudo inspeccionar`); }
  if(array) return false;
  let p;
  try { p=Object.getPrototypeOf(value); }
  catch { fail(`${label} no se pudo inspeccionar`); }
  return p===Object.prototype || p===null;
}

function ownKeysSafe(obj,label){
  try { return Reflect.ownKeys(obj); }
  catch { fail(`${label} no se pudo inspeccionar`); }
}

function hasOwnSafe(obj,key,label){
  try { return Object.hasOwn(obj,key); }
  catch { fail(`${label}.${String(key)} no se pudo inspeccionar`); }
}

function ownData(obj,key,label){
  let d;
  try { d=Object.getOwnPropertyDescriptor(obj,key); }
  catch { fail(`${label}.${String(key)} no se pudo inspeccionar`); }
  if(!d) fail(`${label}.${String(key)} es obligatorio`);
  if(!('value' in d)) fail(`${label}.${String(key)} no admite accessors`);
  if(d.value===undefined) fail(`${label}.${String(key)} no puede ser undefined`);
  return d.value;
}

function exactKeys(obj, allowed, label){
  if(!isPlainObject(obj,label)) fail(`${label} debe ser objeto plano`);
  const keys=ownKeysSafe(obj,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  for(const k of keys) if(!allowed.includes(k)) fail(`${label}.${k} no est? permitido`);
  return keys;
}

function captureArray(input,label,{nonEmpty=false}={}){
  let isArray;
  try { isArray=Array.isArray(input); }
  catch { fail(`${label} no se pudo inspeccionar`); }
  if(!isArray) fail(`${label} debe ser array`);

  const keys=ownKeysSafe(input,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  const length=ownData(input,'length',label);
  if(!Number.isSafeInteger(length) || length<0) fail(`${label}.length inv?lido`);
  if(nonEmpty && length===0) fail(`${label} debe ser array no vac?o`);

  for(const key of keys){
    if(key==='length') continue;
    if(!/^(0|[1-9]\d*)$/.test(key)) fail(`${label}.${key} no est? permitido`);
    const index=Number(key);
    if(!Number.isSafeInteger(index) || index<0 || index>=length) fail(`${label}.${key} no est? permitido`);
  }

  const out=[];
  for(let i=0;i<length;i++) out.push(ownData(input,String(i),label));
  return out;
}

function capturePrimitive(value,label){
  if(value===null) return null;
  if(['string','number','boolean'].includes(typeof value)){
    if(typeof value==='number' && !Number.isFinite(value)) fail(`${label} debe ser finito`);
    return value;
  }
  fail(`${label} debe ser primitivo JSON`);
}

function captureFacts(input,label='event.facts'){
  if(!isPlainObject(input,label)) fail(`${label} debe ser objeto plano`);
  const out=Object.create(null);
  const keys=ownKeysSafe(input,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  for(const key of keys){
    const value=ownData(input,key,label);
    out[key]=capturePrimitive(value,`${label}.${key}`);
  }
  return out;
}

function captureEvent(input){
  exactKeys(input,['type','facts'],'event');
  const type=ownData(input,'type','event');
  const facts=ownData(input,'facts','event');
  if(typeof type!=='string' || !type.trim()) fail('event.type debe ser string no vac?o');
  return {type, facts:captureFacts(facts)};
}

function captureGuard(g,label='guard',depth=0){
  if(depth>MAX_GUARD_DEPTH) fail(`${label} excede MAX_GUARD_DEPTH=${MAX_GUARD_DEPTH}`);
  if(g===null) return null;
  if(!isPlainObject(g,label)) fail(`${label} debe ser objeto plano`);
  const keys=ownKeysSafe(g,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  const hasAll=hasOwnSafe(g,'all',label), hasAny=hasOwnSafe(g,'any',label), hasNot=hasOwnSafe(g,'not',label);
  const compoundCount=[hasAll,hasAny,hasNot].filter(Boolean).length;
  if(compoundCount){
    if(compoundCount!==1 || keys.length!==1) fail(`${label} compuesto debe tener exactamente all, any o not`);
    if(hasNot) return {not:captureGuard(ownData(g,'not',label),`${label}.not`,depth+1)};
    const field=hasAll?'all':'any';
    const items=captureArray(ownData(g,field,label),`${label}.${field}`,{nonEmpty:true});
    return {[field]:items.map((x,i)=>captureGuard(x,`${label}.${field}[${i}]`,depth+1))};
  }

  exactKeys(g,['source','key','op','value'],label);
  const source=ownData(g,'source',label), key=ownData(g,'key',label), op=ownData(g,'op',label), rawValue=ownData(g,'value',label);
  if(!SOURCES.has(source)) fail(`${label}.source inv?lido`);
  if(typeof key!=='string' || !key) fail(`${label}.key debe ser string no vac?o`);
  if(source==='runtime' && !RUNTIME_GUARD_KEYS.has(key)) fail(`${label}.key no permitido para source runtime`);
  if(!OPS.has(op)) fail(`${label}.op inv?lido`);

  if(op==='IN'){
    const items=captureArray(rawValue,`${label}.value`,{nonEmpty:true});
    return {source,key,op,value:items.map((v,i)=>capturePrimitive(v,`${label}.value[${i}]`))};
  }

  const value=capturePrimitive(rawValue,`${label}.value`);
  if(NUMERIC_OPS.has(op) && typeof value!=='number') fail(`${label}.value debe ser n?mero para ${op}`);
  if(NUMERIC_OPS.has(op) && source==='runtime' && !RUNTIME_NUMERIC_KEYS.has(key)) fail(`${label}.key no es num?rica para ${op}`);
  return {source,key,op,value};
}

function captureEmit(value,label){
  if(value===undefined) return [];
  const items=captureArray(value,label);
  const out=[]; const seen=new Set();
  for(let i=0;i<items.length;i++){
    const x=items[i];
    if(typeof x!=='string' || !x.trim()) fail(`${label}[${i}] debe ser string no vac?o`);
    if(seen.has(x)) fail(`${label} no admite intents duplicados`);
    seen.add(x); out.push(x);
  }
  return out;
}

function validateMachine(input){
  exactKeys(input,['id','initialState','states'],'machine');
  const id=ownData(input,'id','machine'), initialState=ownData(input,'initialState','machine'), statesIn=ownData(input,'states','machine');
  if(typeof id!=='string' || !id.trim()) fail('machine.id debe ser string no vac?o');
  if(typeof initialState!=='string' || !initialState.trim()) fail('machine.initialState debe ser string no vac?o');
  if(!isPlainObject(statesIn,'machine.states')) fail('machine.states debe ser objeto plano');
  const stateNames=ownKeysSafe(statesIn,'machine.states');
  if(stateNames.length===0 || stateNames.some(k=>typeof k!=='string' || !k)) fail('machine.states debe tener estados con IDs string');
  if(!stateNames.includes(initialState)) fail('machine.initialState no existe en states');

  const states=Object.create(null);
  for(const stateName of stateNames){
    const state=ownData(statesIn,stateName,'machine.states');
    exactKeys(state,['on'],`machine.states.${stateName}`);
    const onIn=ownData(state,'on',`machine.states.${stateName}`);
    if(!isPlainObject(onIn,`machine.states.${stateName}.on`)) fail(`machine.states.${stateName}.on debe ser objeto plano`);
    const on=Object.create(null);
    const eventTypes=ownKeysSafe(onIn,`machine.states.${stateName}.on`);
    if(eventTypes.some(k=>typeof k!=='string' || !k)) fail(`machine.states.${stateName}.on tiene event type inv?lido`);
    for(const eventType of eventTypes){
      const rawTransitions=ownData(onIn,eventType,`machine.states.${stateName}.on`);
      const transitionItems=captureArray(rawTransitions,`machine.states.${stateName}.on.${eventType}`,{nonEmpty:true});
      const priorities=new Set();
      const transitions=transitionItems.map((t,i)=>{
        const label=`machine.states.${stateName}.on.${eventType}[${i}]`;
        exactKeys(t,['priority','target','guard','emit'],label);
        const priority=ownData(t,'priority',label), target=ownData(t,'target',label);
        if(!Number.isSafeInteger(priority)) fail(`${label}.priority debe ser entero seguro`);
        if(priorities.has(priority)) fail(`${stateName}/${eventType} tiene priority duplicada ${priority}`);
        priorities.add(priority);
        if(typeof target!=='string' || !stateNames.includes(target)) fail(`${label}.target desconocido`);
        const guard=hasOwnSafe(t,'guard',label) ? captureGuard(ownData(t,'guard',label),`${label}.guard`,0) : null;
        const emit=hasOwnSafe(t,'emit',label) ? captureEmit(ownData(t,'emit',label),`${label}.emit`) : [];
        return {priority,target,guard,emit};
      });
      transitions.sort((a,b)=>b.priority-a.priority);
      on[eventType]=transitions;
    }
    states[stateName]={on};
  }
  return {id,initialState,states};
}

function runtimeSnapshot(input,machine){
  exactKeys(input,['machineId','state','stateAge','step'],'runtime');
  const machineId=ownData(input,'machineId','runtime'), state=ownData(input,'state','runtime'), stateAge=ownData(input,'stateAge','runtime'), step=ownData(input,'step','runtime');
  if(machineId!==machine.id) fail('runtime.machineId no coincide con machine.id');
  if(typeof state!=='string' || !Object.hasOwn(machine.states,state)) fail('runtime.state desconocido');
  if(!Number.isSafeInteger(stateAge) || stateAge<0) fail('runtime.stateAge debe ser entero >= 0');
  if(!Number.isSafeInteger(step) || step<0) fail('runtime.step debe ser entero >= 0');
  return {machineId,state,stateAge,step};
}

function getSourceValue(cond,event,runtime){
  if(cond.source==='event') return event.facts[cond.key];
  if(cond.source==='runtime') return runtime[cond.key];
  return undefined;
}

function cmp(actual,op,expected){
  if(op==='EQ') return Object.is(actual,expected);
  if(op==='NEQ') return !Object.is(actual,expected);
  if(op==='GT') return typeof actual==='number' && actual>expected;
  if(op==='GTE') return typeof actual==='number' && actual>=expected;
  if(op==='LT') return typeof actual==='number' && actual<expected;
  if(op==='LTE') return typeof actual==='number' && actual<=expected;
  if(op==='IN') return expected.some(v=>Object.is(v,actual));
  return false;
}

function guardMatches(g,event,runtime){
  if(g===null) return true;
  if(g.all) return g.all.every(x=>guardMatches(x,event,runtime));
  if(g.any) return g.any.some(x=>guardMatches(x,event,runtime));
  if(g.not) return !guardMatches(g.not,event,runtime);
  return cmp(getSourceValue(g,event,runtime),g.op,g.value);
}

function incrementSaturated(value){
  return value===Number.MAX_SAFE_INTEGER ? value : value+1;
}

function createRuntime(machineInput){
  const machine=validateMachine(machineInput);
  return {machineId:machine.id,state:machine.initialState,stateAge:0,step:0};
}

function stepFSM(machineInput,runtimeInput,eventInput){
  const machine=validateMachine(machineInput);
  const runtime=runtimeSnapshot(runtimeInput,machine);
  const event=captureEvent(eventInput);
  const candidates=machine.states[runtime.state].on[event.type] || [];
  const chosen=candidates.find(t=>guardMatches(t.guard,event,runtime)) || null;
  const next={
    machineId:runtime.machineId,
    state:chosen ? chosen.target : runtime.state,
    stateAge:chosen ? 0 : incrementSaturated(runtime.stateAge),
    step:incrementSaturated(runtime.step),
  };
  return {
    transitioned:Boolean(chosen),
    from:runtime.state,
    to:next.state,
    eventType:event.type,
    emitted:chosen ? [...chosen.emit] : [],
    nextRuntime:next,
  };
}

export { ContractError, MAX_GUARD_DEPTH, createRuntime, stepFSM, validateMachine };
