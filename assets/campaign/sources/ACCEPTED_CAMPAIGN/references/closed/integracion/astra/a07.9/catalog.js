import { BATCHES, QUARANTINES, SOURCE_HASHES, CONDITION_POLICIES } from './data/frozen-corpus.js';
import { registrations } from '../a07/registry.js';
import { VOICES_R4 } from '../a07.5b1/voice-catalog-r4.js';
import { freeze, fail } from '../a07/safe-data.js';

/** Frozen authoring data is content authority, never observation or permission. */
function createAuthoredCatalog(){
 freeze(BATCHES);freeze(QUARANTINES);freeze(SOURCE_HASHES);freeze(CONDITION_POLICIES);
 const actors=new Map(),lines=new Map(),entries=new Map(),blocked=new Set(QUARANTINES.map(q=>q.id));
 for(const [batchIndex,b] of BATCHES.entries())for(const a of b.actors){
  if(actors.has(a.actorId)||!registrations().some(r=>r.actorId===a.actorId&&r.canonical.nombre===a.displayName)||!VOICES_R4.some(v=>v.actorId===a.actorId))fail('A079_ACTOR_BINDING');
  actors.set(a.actorId,freeze({...a,batch:batchIndex+1}));
  for(const l of a.lines){if(lines.has(l.id)||l.engineAction!==false||l.semanticWorldWrite!==false||l.socialMemoryWrite!==false||l.contextIsCanonicalEvent!==false||typeof l.text!=='string'||l.text.length>240)fail('A079_LINE_BOUND');lines.set(l.id,{actorId:a.actorId,line:freeze(l)});}
  for(const e of a.playerEntries){if(entries.has(e.id)||!e.alternativeIds.length||e.alternativeIds.length>2)fail('A079_ENTRY');entries.set(e.id,{actorId:a.actorId,entry:freeze(e)});}
 }
 if(actors.size!==32||lines.size!==501||entries.size!==84||blocked.size!==10)fail('A079_FROZEN_COUNTS');
 for(const [id,{actorId,entry}] of entries)if(entry.alternativeIds.some(l=>lines.get(l)?.actorId!==actorId))fail('A079_FOREIGN_ALTERNATIVE');
 for(const q of QUARANTINES)if(q.ratified!==false||lines.get(q.id)?.line.text!==q.text)fail('A079_QUARANTINE');
 function describe(actorId){const a=actors.get(actorId);if(!a)fail('A079_UNKNOWN_ACTOR');return freeze({actorId,voice:VOICES_R4.find(v=>v.actorId===actorId),npcLines:a.lines.length,playerEntries:a.playerEntries.length,
  sheetGap:a.authoringSheet?.status?.includes('GAP')??false,quarantines:a.lines.filter(l=>blocked.has(l.id)).map(l=>l.id)});}
 function assess(actorId,lineId){
  const item=lines.get(lineId);if(!item||item.actorId!==actorId)return freeze({status:'UNAVAILABLE',reason:'ACTOR_LINE_SCOPE'});
  if(blocked.has(lineId))return freeze({status:'UNAVAILABLE',reason:'QUARANTINE'});
  const policy=CONDITION_POLICIES[lineId];
  // An unknown contextual condition can never be converted into a fact or a
  // public dialogue permission by a caller-supplied DTO or missing value.
  if(!policy||policy.mode!=='DIRECT_COMMUNICATION_ONLY')return freeze({status:'UNAVAILABLE',reason:policy?.reason??'SOURCE_VERIFIED_CONTEXT_NOT_CONNECTED'});
  return freeze({status:'AVAILABLE_ON_VERIFIED_COMMUNICATION',lineId,actorId});
 }
 function availableEntries(actorId){const a=actors.get(actorId);if(!a)fail('A079_UNKNOWN_ACTOR');return freeze(a.playerEntries.filter(e=>e.alternativeIds.some(id=>assess(actorId,id).status==='AVAILABLE_ON_VERIFIED_COMMUNICATION')));}
 function response(actorId,entryId){const item=entries.get(entryId);if(!item||item.actorId!==actorId)return freeze({status:'UNAVAILABLE',reason:'ACTOR_ENTRY_SCOPE'});
  const lineId=item.entry.alternativeIds.find(id=>assess(actorId,id).status==='AVAILABLE_ON_VERIFIED_COMMUNICATION');
  return lineId?freeze({status:'AVAILABLE_ON_VERIFIED_COMMUNICATION',actorId,entry:item.entry,line:lines.get(lineId).line,source:SOURCE_HASHES[actors.get(actorId).batch-1]}):freeze({status:'UNAVAILABLE',reason:'NO_AUTHORIZED_ALTERNATIVE'});
 }
 return Object.freeze({describe,availableEntries,response,assess,opening:actorId=>actors.get(actorId)?.lines.find(l=>CONDITION_POLICIES[l.id]?.use==='OPENING'&&assess(actorId,l.id).status==='AVAILABLE_ON_VERIFIED_COMMUNICATION')??null,actors:()=>freeze([...actors.keys()]),counts:()=>freeze({actors:actors.size,lines:lines.size,entries:entries.size,quarantines:blocked.size}),
  line:(actorId,id)=>lines.get(id)?.actorId===actorId?lines.get(id).line:null,entry:(actorId,id)=>entries.get(id)?.actorId===actorId?entries.get(id).entry:null});
}

export { createAuthoredCatalog };
