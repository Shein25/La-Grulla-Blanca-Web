const OPS = new Set(['EQ','NEQ','GT','GTE','LT','LTE','IN']);
const NUMERIC_OPS = new Set(['GT','GTE','LT','LTE']);
const NODE_TYPES = new Set(['selector','sequence','condition','action']);
const ACTION_STATUSES = new Set(['SUCCESS','FAILURE','RUNNING']);
const MAX_TREE_DEPTH = 32;
const MAX_TREE_NODES = 512;
const MAX_CHILDREN = 64;

class ContractError extends TypeError {
  constructor(message){ super(`BehaviorTree: ${message}`); this.name='ContractError'; }
}
function fail(message){ throw new ContractError(message); }

function isPlainObject(value,label='value'){
  if(value===null || typeof value!=='object') return false;
  let array;
  try { array=Array.isArray(value); } catch { fail(`${label} no se pudo inspeccionar`); }
  if(array) return false;
  let proto;
  try { proto=Object.getPrototypeOf(value); } catch { fail(`${label} no se pudo inspeccionar`); }
  return proto===Object.prototype || proto===null;
}
function ownKeysSafe(obj,label){ try { return Reflect.ownKeys(obj); } catch { fail(`${label} no se pudo inspeccionar`); } }
function ownData(obj,key,label){
  let d; try { d=Object.getOwnPropertyDescriptor(obj,key); } catch { fail(`${label}.${String(key)} no se pudo inspeccionar`); }
  if(!d) fail(`${label}.${String(key)} es obligatorio`);
  if(!('value' in d)) fail(`${label}.${String(key)} no admite accessors`);
  if(d.value===undefined) fail(`${label}.${String(key)} no puede ser undefined`);
  return d.value;
}
function hasOwnSafe(obj,key,label){ try { return Object.hasOwn(obj,key); } catch { fail(`${label}.${String(key)} no se pudo inspeccionar`); } }
function exactKeys(obj,allowed,label){
  if(!isPlainObject(obj,label)) fail(`${label} debe ser objeto plano`);
  const keys=ownKeysSafe(obj,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  for(const k of keys) if(!allowed.includes(k)) fail(`${label}.${k} no está permitido`);
  return keys;
}
function captureArray(input,label,{nonEmpty=false,max=Infinity}={}){
  let isArray; try { isArray=Array.isArray(input); } catch { fail(`${label} no se pudo inspeccionar`); }
  if(!isArray) fail(`${label} debe ser array`);
  const keys=ownKeysSafe(input,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  const length=ownData(input,'length',label);
  if(!Number.isSafeInteger(length)||length<0) fail(`${label}.length inválido`);
  if(nonEmpty && length===0) fail(`${label} no puede estar vacío`);
  if(length>max) fail(`${label} excede máximo ${max}`);
  for(const k of keys){
    if(k==='length') continue;
    if(!/^(0|[1-9]\d*)$/.test(k)) fail(`${label}.${k} no está permitido`);
    const idx=Number(k);
    if(!Number.isSafeInteger(idx)||idx<0||idx>=length) fail(`${label}.${k} no está permitido`);
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
function captureFacts(input,label='tick.facts'){
  if(!isPlainObject(input,label)) fail(`${label} debe ser objeto plano`);
  const out=Object.create(null);
  const keys=ownKeysSafe(input,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  for(const key of keys) out[key]=capturePrimitive(ownData(input,key,label),`${label}.${key}`);
  return out;
}
function captureCondition(input,label){
  exactKeys(input,['key','op','value'],label);
  const key=ownData(input,'key',label), op=ownData(input,'op',label), raw=ownData(input,'value',label);
  if(typeof key!=='string'||!key.trim()) fail(`${label}.key debe ser string no vacío`);
  if(!OPS.has(op)) fail(`${label}.op inválido`);
  if(op==='IN'){
    const items=captureArray(raw,`${label}.value`,{nonEmpty:true,max:256});
    return {key,op,value:items.map((v,i)=>capturePrimitive(v,`${label}.value[${i}]`))};
  }
  const value=capturePrimitive(raw,`${label}.value`);
  if(NUMERIC_OPS.has(op) && typeof value!=='number') fail(`${label}.value debe ser número para ${op}`);
  return {key,op,value};
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

function validateTree(input){
  exactKeys(input,['id','root'],'tree');
  const id=ownData(input,'id','tree'), rootInput=ownData(input,'root','tree');
  if(typeof id!=='string'||!id.trim()) fail('tree.id debe ser string no vacío');
  const seenIds=new Set();
  const active=new WeakSet();
  let nodeCount=0;
  const actionIds=new Set();

  function visit(node,label,depth){
    if(depth>MAX_TREE_DEPTH) fail(`${label} excede MAX_TREE_DEPTH=${MAX_TREE_DEPTH}`);
    if(!isPlainObject(node,label)) fail(`${label} debe ser objeto plano`);
    if(active.has(node)) fail(`${label} contiene ciclo de referencias`);
    active.add(node);
    nodeCount++;
    if(nodeCount>MAX_TREE_NODES) fail(`tree excede MAX_TREE_NODES=${MAX_TREE_NODES}`);
    const type=ownData(node,'type',label), nodeId=ownData(node,'id',label);
    if(typeof type!=='string'||!NODE_TYPES.has(type)) fail(`${label}.type inválido`);
    if(typeof nodeId!=='string'||!nodeId.trim()) fail(`${label}.id debe ser string no vacío`);
    if(seenIds.has(nodeId)) fail(`node.id duplicado: ${nodeId}`);
    seenIds.add(nodeId);

    let out;
    if(type==='selector'||type==='sequence'){
      exactKeys(node,['id','type','children'],label);
      const childrenIn=captureArray(ownData(node,'children',label),`${label}.children`,{nonEmpty:true,max:MAX_CHILDREN});
      const children=childrenIn.map((child,i)=>visit(child,`${label}.children[${i}]`,depth+1));
      out={id:nodeId,type,children};
    } else if(type==='condition'){
      exactKeys(node,['id','type','test'],label);
      const test=captureCondition(ownData(node,'test',label),`${label}.test`);
      out={id:nodeId,type,test};
    } else {
      exactKeys(node,['id','type','intent'],label);
      const intent=ownData(node,'intent',label);
      if(typeof intent!=='string'||!intent.trim()) fail(`${label}.intent debe ser string no vacío`);
      actionIds.add(nodeId);
      out={id:nodeId,type,intent};
    }
    active.delete(node);
    return out;
  }

  const root=visit(rootInput,'tree.root',0);
  return {id,root,actionIds:[...actionIds]};
}

function runtimeSnapshot(input,tree){
  exactKeys(input,['treeId','tick','runningAction'],'runtime');
  const treeId=ownData(input,'treeId','runtime'), tick=ownData(input,'tick','runtime'), runningAction=ownData(input,'runningAction','runtime');
  if(treeId!==tree.id) fail('runtime.treeId no coincide con tree.id');
  if(!Number.isSafeInteger(tick)||tick<0) fail('runtime.tick debe ser entero seguro >= 0');
  if(runningAction!==null && (typeof runningAction!=='string'||!tree.actionIds.includes(runningAction))) fail('runtime.runningAction desconocida');
  return {treeId,tick,runningAction};
}
function captureActionResults(input,tree,runtime,label='tick.actionResults'){
  if(!isPlainObject(input,label)) fail(`${label} debe ser objeto plano`);
  const keys=ownKeysSafe(input,label);
  if(keys.some(k=>typeof k!=='string')) fail(`${label} no admite Symbols`);
  if(keys.length>1) fail(`${label} admite como máximo un resultado`);
  const out=Object.create(null);
  for(const key of keys){
    if(!tree.actionIds.includes(key)) fail(`${label}.${key} no corresponde a action conocida`);
    if(runtime.runningAction===null || key!==runtime.runningAction) fail(`${label}.${key} no coincide con runtime.runningAction`);
    const status=ownData(input,key,label);
    if(typeof status!=='string'||!ACTION_STATUSES.has(status)) fail(`${label}.${key} status inválido`);
    out[key]=status;
  }
  return out;
}
function captureTick(input,tree,runtime){
  exactKeys(input,['facts','actionResults'],'tick');
  return {
    facts:captureFacts(ownData(input,'facts','tick')),
    actionResults:captureActionResults(ownData(input,'actionResults','tick'),tree,runtime)
  };
}
function incrementSaturated(value){ return value===Number.MAX_SAFE_INTEGER ? value : value+1; }

function createRuntime(treeInput){
  const tree=validateTree(treeInput);
  return {treeId:tree.id,tick:0,runningAction:null};
}

function tickBehaviorTree(treeInput,runtimeInput,tickInput){
  const tree=validateTree(treeInput);
  const runtime=runtimeSnapshot(runtimeInput,tree);
  const tick=captureTick(tickInput,tree,runtime);
  const emitted=[];
  let runningAction=null;

  function evalNode(node){
    if(node.type==='condition') return cmp(tick.facts[node.test.key],node.test.op,node.test.value) ? 'SUCCESS':'FAILURE';
    if(node.type==='action'){
      if(hasOwnSafe(tick.actionResults,node.id,'tick.actionResults')){
        const status=tick.actionResults[node.id];
        if(status==='RUNNING') runningAction=node.id;
        return status;
      }
      emitted.push(node.intent);
      runningAction=node.id;
      return 'RUNNING';
    }
    if(node.type==='sequence'){
      for(const child of node.children){
        const status=evalNode(child);
        if(status!=='SUCCESS') return status;
      }
      return 'SUCCESS';
    }
    for(const child of node.children){
      const status=evalNode(child);
      if(status!=='FAILURE') return status;
    }
    return 'FAILURE';
  }

  const status=evalNode(tree.root);
  if(emitted.length>1) fail('invariante interno: más de un intent emitido en un tick');
  const previousRunningAction=runtime.runningAction;
  const previousResult=previousRunningAction!==null && hasOwnSafe(tick.actionResults,previousRunningAction,'tick.actionResults')
    ? tick.actionResults[previousRunningAction]
    : null;
  const previousFinished=previousResult==='SUCCESS' || previousResult==='FAILURE';
  const preemptedAction=previousRunningAction!==null && previousRunningAction!==runningAction && !previousFinished
    ? previousRunningAction
    : null;
  const nextRuntime={treeId:runtime.treeId,tick:incrementSaturated(runtime.tick),runningAction};
  return {status,emitted:[...emitted],runningAction,previousRunningAction,preemptedAction,nextRuntime};
}

export { ContractError, MAX_CHILDREN, MAX_TREE_DEPTH, MAX_TREE_NODES, createRuntime, tickBehaviorTree, validateTree };
