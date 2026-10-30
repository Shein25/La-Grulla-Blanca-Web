const ENTRY_FIELDS = Object.freeze([
  'key','kind','subject','value','importance','confidence',
  'firstTurn','lastTurn','count','expiresTurn'
]);

const EVENT_REQUIRED = Object.freeze([
  'key','kind','subject','value','importance','confidence','turn'
]);

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const proto=Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  } catch {
    return false;
  }
}

function descriptor(value,key,label) {
  try {
    return Object.getOwnPropertyDescriptor(value,key);
  } catch {
    throw new TypeError(`${label}.${key}: no se pudo inspeccionar el descriptor`);
  }
}

function ownData(value, key, label) {
  const desc=descriptor(value,key,label);
  if (!desc) throw new TypeError(`${label}.${key} es obligatorio`);
  if (!Object.hasOwn(desc,'value')) {
    throw new TypeError(`${label}.${key} debe ser una propiedad de datos propia`);
  }
  if (desc.value === undefined) throw new TypeError(`${label}.${key} no puede ser undefined`);
  return desc.value;
}

function optionalOwnData(value,key,label) {
  const desc=descriptor(value,key,label);
  if (!desc) return {present:false,value:undefined};
  if (!Object.hasOwn(desc,'value')) {
    throw new TypeError(`${label}.${key} debe ser una propiedad de datos propia`);
  }
  if (desc.value === undefined) throw new TypeError(`${label}.${key} no puede ser undefined`);
  return {present:true,value:desc.value};
}

function stringField(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${label} debe ser string no vacío`);
  }
  return value;
}

function boundedInt(value, label, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new TypeError(`${label} debe ser entero seguro entre ${min} y ${max}`);
  }
  return value;
}

function nonNegativeInt(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} debe ser entero seguro >= 0`);
  }
  return value;
}

function primitive(value, label) {
  if (value === null) return value;
  const type = typeof value;
  if (!['string','number','boolean'].includes(type)) {
    throw new TypeError(`${label} debe ser primitivo`);
  }
  if (type === 'number' && !Number.isFinite(value)) {
    throw new TypeError(`${label} debe ser finito`);
  }
  return value;
}

function captureEntry(raw, label='memory entry') {
  if (!isPlainObject(raw)) throw new TypeError(`${label} debe ser objeto plano`);
  const out = {};
  for (const field of ENTRY_FIELDS) out[field] = ownData(raw,field,label);
  out.key = stringField(out.key,`${label}.key`);
  out.kind = stringField(out.kind,`${label}.kind`);
  out.subject = stringField(out.subject,`${label}.subject`);
  out.value = primitive(out.value,`${label}.value`);
  out.importance = boundedInt(out.importance,`${label}.importance`,0,100);
  out.confidence = boundedInt(out.confidence,`${label}.confidence`,0,100);
  out.firstTurn = nonNegativeInt(out.firstTurn,`${label}.firstTurn`);
  out.lastTurn = nonNegativeInt(out.lastTurn,`${label}.lastTurn`);
  out.count = nonNegativeInt(out.count,`${label}.count`);
  if (out.count < 1) throw new TypeError(`${label}.count debe ser >= 1`);
  if (out.lastTurn < out.firstTurn) throw new TypeError(`${label}.lastTurn no puede preceder firstTurn`);
  if (out.expiresTurn !== null) {
    out.expiresTurn = nonNegativeInt(out.expiresTurn,`${label}.expiresTurn`);
    if (out.expiresTurn < out.lastTurn) throw new TypeError(`${label}.expiresTurn no puede preceder lastTurn`);
  }
  return out;
}

function captureEntriesArray(entries) {
  if (!Array.isArray(entries)) throw new TypeError('memory.entries debe ser array');
  const length=ownData(entries,'length','memory.entries');
  if (!Number.isSafeInteger(length) || length < 0) throw new TypeError('memory.entries.length inválido');
  const out=[];
  for(let i=0;i<length;i++) {
    const raw=ownData(entries,String(i),'memory.entries');
    out.push(captureEntry(raw,`memory.entries[${i}]`));
  }
  return out;
}

function captureMemory(memory) {
  if (!isPlainObject(memory)) throw new TypeError('memory debe ser objeto plano');
  const version = ownData(memory,'version','memory');
  const clockRaw = ownData(memory,'clock','memory');
  const entriesRaw = ownData(memory,'entries','memory');
  if (version !== 1) throw new TypeError('memory.version debe ser 1');
  const clock = clockRaw === null ? null : nonNegativeInt(clockRaw,'memory.clock');
  const captured = captureEntriesArray(entriesRaw);
  if (clock === null && captured.length) throw new TypeError('memory.clock no puede ser null si existen entries');
  const keys = new Set();
  for (const entry of captured) {
    if (keys.has(entry.key)) throw new TypeError(`memory contiene key duplicada: ${entry.key}`);
    keys.add(entry.key);
    if (clock !== null && entry.lastTurn > clock) {
      throw new TypeError(`memory entry ${entry.key} está en el futuro respecto de memory.clock`);
    }
  }
  return {version:1,clock,entries:captured};
}

function captureEvent(event) {
  if (!isPlainObject(event)) throw new TypeError('event debe ser objeto plano');
  const out = {};
  for (const field of EVENT_REQUIRED) out[field] = ownData(event,field,'event');
  const expiry = optionalOwnData(event,'expiresTurn','event');
  out.expiresTurn = expiry.present ? expiry.value : null;
  out.key = stringField(out.key,'event.key');
  out.kind = stringField(out.kind,'event.kind');
  out.subject = stringField(out.subject,'event.subject');
  out.value = primitive(out.value,'event.value');
  out.importance = boundedInt(out.importance,'event.importance',0,100);
  out.confidence = boundedInt(out.confidence,'event.confidence',0,100);
  out.turn = nonNegativeInt(out.turn,'event.turn');
  if (out.expiresTurn !== null) {
    out.expiresTurn = nonNegativeInt(out.expiresTurn,'event.expiresTurn');
    if (out.expiresTurn < out.turn) throw new TypeError('event.expiresTurn no puede preceder event.turn');
  }
  return out;
}

function cloneEntry(entry) {
  return {...entry};
}

function compareRetention(a,b) {
  if (a.importance !== b.importance) return b.importance-a.importance;
  if (a.confidence !== b.confidence) return b.confidence-a.confidence;
  if (a.lastTurn !== b.lastTurn) return b.lastTurn-a.lastTurn;
  if (a.key === b.key) return 0;
  return a.key < b.key ? -1 : 1;
}

function canonical(entries) {
  return [...entries].sort((a,b)=>a.key===b.key?0:(a.key<b.key?-1:1));
}

function notExpiredAt(entry, turn) {
  return entry.expiresTurn === null || entry.expiresTurn >= turn;
}

function assertCurrentTurn(state,currentTurn) {
  const turn=nonNegativeInt(currentTurn,'currentTurn');
  if (state.clock !== null && turn < state.clock) {
    throw new TypeError('currentTurn no puede preceder memory.clock');
  }
  return turn;
}

function normalizedOptions(options={}) {
  if (!isPlainObject(options)) throw new TypeError('options debe ser objeto plano');
  const read=optionalOwnData(options,'maxEntries','options');
  const maxEntries = boundedInt(read.present?read.value:32,'options.maxEntries',1,1024);
  return {maxEntries};
}

function createMemoryState() {
  return {version:1,clock:null,entries:[]};
}

function pruneMemory(memory, currentTurn) {
  const state = captureMemory(memory);
  const turn = assertCurrentTurn(state,currentTurn);
  return {
    version:1,
    clock:turn,
    entries:canonical(state.entries.filter(entry=>notExpiredAt(entry,turn)).map(cloneEntry)),
  };
}

function recordMemory(memory, event, options={}) {
  const state = captureMemory(memory);
  const incoming = captureEvent(event);
  const {maxEntries} = normalizedOptions(options);
  if (state.clock !== null && incoming.turn < state.clock) {
    throw new TypeError('event.turn no puede preceder memory.clock');
  }
  const live = state.entries.filter(entry=>notExpiredAt(entry,incoming.turn));
  const index = live.findIndex(entry=>entry.key===incoming.key);

  if (index >= 0) {
    const previous = live[index];
    if (previous.kind !== incoming.kind || previous.subject !== incoming.subject) {
      throw new TypeError(`event.key ${incoming.key} contradice la identidad semántica existente`);
    }
    if (previous.count === Number.MAX_SAFE_INTEGER) {
      throw new RangeError(`memory count overflow para ${incoming.key}`);
    }
    live[index] = {
      key:previous.key,
      kind:previous.kind,
      subject:previous.subject,
      value:incoming.value,
      importance:incoming.importance,
      confidence:incoming.confidence,
      firstTurn:previous.firstTurn,
      lastTurn:incoming.turn,
      count:previous.count+1,
      expiresTurn:incoming.expiresTurn,
    };
  } else {
    live.push({
      key:incoming.key,
      kind:incoming.kind,
      subject:incoming.subject,
      value:incoming.value,
      importance:incoming.importance,
      confidence:incoming.confidence,
      firstTurn:incoming.turn,
      lastTurn:incoming.turn,
      count:1,
      expiresTurn:incoming.expiresTurn,
    });
  }

  const retained = [...live].sort(compareRetention).slice(0,maxEntries);
  return {version:1,clock:incoming.turn,entries:canonical(retained).map(cloneEntry)};
}

function captureQuery(query) {
  if (!isPlainObject(query)) throw new TypeError('query debe ser objeto plano');
  const out={};
  for (const field of ['key','kind','subject']) {
    const read=optionalOwnData(query,field,'query');
    if (read.present) out[field]=stringField(read.value,`query.${field}`);
  }
  for (const field of ['minImportance','minConfidence']) {
    const read=optionalOwnData(query,field,'query');
    if (read.present) out[field]=boundedInt(read.value,`query.${field}`,0,100);
  }
  const limit=optionalOwnData(query,'limit','query');
  if (limit.present) out.limit=boundedInt(limit.value,'query.limit',1,1024);
  return out;
}

function recallMemory(memory, currentTurn, query={}) {
  const state = captureMemory(memory);
  const turn = assertCurrentTurn(state,currentTurn);
  const q = captureQuery(query);
  let entries = state.entries.filter(entry=>notExpiredAt(entry,turn));
  if (q.key !== undefined) entries=entries.filter(entry=>entry.key===q.key);
  if (q.kind !== undefined) entries=entries.filter(entry=>entry.kind===q.kind);
  if (q.subject !== undefined) entries=entries.filter(entry=>entry.subject===q.subject);
  if (q.minImportance !== undefined) entries=entries.filter(entry=>entry.importance>=q.minImportance);
  if (q.minConfidence !== undefined) entries=entries.filter(entry=>entry.confidence>=q.minConfidence);
  entries=[...entries].sort(compareRetention);
  if (q.limit !== undefined) entries=entries.slice(0,q.limit);
  return entries.map(cloneEntry);
}

function forgetMemory(memory, key) {
  const state = captureMemory(memory);
  const target = stringField(key,'key');
  return {
    version:1,
    clock:state.clock,
    entries:canonical(state.entries.filter(entry=>entry.key!==target)).map(cloneEntry),
  };
}

function memoryStats(memory, currentTurn) {
  const state = captureMemory(memory);
  const turn = assertCurrentTurn(state,currentTurn);
  let active=0, expired=0;
  for (const entry of state.entries) notExpiredAt(entry,turn)?active++:expired++;
  return {total:state.entries.length,active,expired};
}

export { createMemoryState, forgetMemory, memoryStats, pruneMemory, recallMemory, recordMemory };
