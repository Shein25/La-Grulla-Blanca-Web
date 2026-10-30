import { fail, integer, clone, canonical } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

const verified=new WeakMap();
function requireStoredCheckpoint(cap){const r=verified.get(cap);if(!r||r.kind!=='STORED')fail('G08C_STORED_CAPABILITY_REQUIRED');return r;}
function requireStoreCandidate(cap){const r=verified.get(cap);if(!r)fail('G08C_STORE_CAPABILITY_REQUIRED');return r;}
const LIMITS=Object.freeze({snapshotBytes:10000000,totalBytes:64000000,snapshots:64,games:8});
const request=q=>new Promise((resolve,reject)=>{q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
const done=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('G08C_TX_ABORTED'));tx.onerror=()=>{};});
function createDurableStore({indexedDB=globalThis.indexedDB,crypto=globalThis.crypto,name='grulla_arco1_a10_20261029_v1',validate=()=>{},fault=null,limits=LIMITS,openTimeoutMs=8000,onBlocked=()=>{},preflightProtected=null}={}){
 let connection=null,opening=null;const source='9f0bbde077e39edffda1ab75c70f0de85a40df7a51bba4e92fccc5d63b469f43';
 const bytes=s=>new TextEncoder().encode(s).byteLength;
 async function hash(s){if(!crypto?.subtle)fail('G08C_CRYPTO_UNAVAILABLE');return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
 function check(e){if(e?.format!=='GRULLA_NEW_MEMORY_CHECKPOINT'||e.version!==1||e.identity?.actorId!=='player'||e.identity.sourceSHA256!==source||typeof e.identity.gameId!=='string'||e.identity.gameId.length<8)fail('G08C_ENVELOPE_VERSION_OR_IDENTITY');integer(e.identity.persistentGeneration);validate(e.domains,e.identity);}
 function outcome(e){const a=e.domains.Qiao?.accepted;return a?{deliveryId:a.deliveryId,accepted:clone(a),consumed:clone(e.domains.Materials.consumed)}:null;}
 function b3Outcome(e){const b=e.domains.B3Foundation,n=e.domains.Player.state.b3Narrative;if(!b||!(b.comprehensionReceipts.length||b.tribulation.failures.length||b.tribulation.success||b.foundation||n))return null;return clone({...b,narrative:n||null});}
 function b3Prefix(a,b){const pref=(x,y)=>Array.isArray(y)&&x.length<=y.length&&x.every((v,i)=>canonical(v)===canonical(y[i]));if(!b||a.actorId!==b.actorId||a.generation!==b.generation||!pref(a.comprehensionReceipts,b.comprehensionReceipts)||!pref(a.tribulation.failures,b.tribulation.failures)||!pref(a.tribulation.retries,b.tribulation.retries)||a.tribulation.success&&canonical(a.tribulation.success)!==canonical(b.tribulation.success)||a.foundation&&canonical(a.foundation)!==canonical(b.foundation))return false;const n=a.narrative,m=b.narrative;if(n&&(!m||n.origin&&canonical(n.origin)!==canonical(m.origin)||n.illumination&&canonical(n.illumination)!==canonical(m.illumination)||!pref(n.tribulations,m.tribulations)||!pref(n.retries,m.retries)))return false;return true;}
 function b1Outcome(e){const b=e.domains.B1Actions;return b?.receipts?.length?clone({generation:b.generation,receipts:b.receipts}):null;}
 function b1Prefix(a,b){return !!b&&a.generation===b.generation&&a.receipts.length<=b.receipts.length&&a.receipts.every((r,i)=>canonical(r)===canonical(b.receipts[i]));}
 function m15Outcome(e){const m=e.domains.M15Graft;if(!m?.graftCommitted)return null;return clone({missionId:m.missionId,generation:m.generation,principalRoot:m.principalRoot,chosenRoot:m.chosenRoot,commitEvidenceId:m.commitEvidenceId,graft:e.domains.Player.state.branches.graft});}
 function a09Outcome(e){const a=e.domains.A09Boss,row=a?.postcombat;if(row?.stage!=='DECIDED')return null;return clone({battleId:row.battleId,eventId:row.eventId,decisionFinal:row.decisionFinal,vinculoGrulla:row.vinculoGrulla,playerGeneration:a.playerGeneration,nativeTerminalActionId:a.battle.terminalProof.nativeReceipt.actionId,missionClosedReceiptId:e.domains.LIVMissions.missions.M18.closed.id,history:row.history});}
 async function open(){
  if(connection)return connection;if(opening)return opening.promise;if(!indexedDB)fail('G08C_STORAGE_UNAVAILABLE');
  const operation={blocked:false,settled:false,cancel:null,promise:null};opening=operation;
  operation.promise=new Promise((resolve,reject)=>{
   let q;const finish=(error,db)=>{if(operation.settled){db?.close();return;}operation.settled=true;clearTimeout(timer);if(opening===operation)opening=null;
    if(error){reject(error);return;}connection=db;db.onversionchange=()=>{db.close();if(connection===db)connection=null;};resolve(db);
   };
   const timer=setTimeout(()=>finish(Error('G08D1_OPEN_TIMEOUT')),openTimeoutMs);
   operation.cancel=()=>{if(operation.settled)return false;try{q?.transaction?.abort();}catch{}finish(Error('G08D1_OPEN_CANCELLED'));return true;};
   try{q=indexedDB.open(name,1);}catch(error){finish(error);return;}
   q.onblocked=()=>{if(operation.settled)return;operation.blocked=true;try{onBlocked();}catch{}};
   q.onupgradeneeded=()=>{if(operation.settled){q.transaction.abort();return;}const db=q.result;for(const n of ['heads','slots','snapshots','critical','meta'])db.createObjectStore(n);q.transaction.objectStore('meta').put({version:1,bytes:0,count:0,games:0},'usage');};
   q.onerror=()=>finish(q.error||Error('G08D1_OPEN_ERROR'));q.onsuccess=()=>finish(null,q.result);
  });return operation.promise;
 }
 function cancelOpen(){return opening?.cancel?.()||false;}
 async function candidate(input){const e=clone(input);check(e);const payload=canonical(e),length=bytes(payload);if(length>limits.snapshotBytes)fail('G08C_CAPACITY_SNAPSHOT');const checksum=await hash(payload),cap=Object.freeze({});verified.set(cap,{kind:'CANDIDATE',envelope:e,payload,length,checksum});return cap;}
 async function list(){const db=await open(),tx=db.transaction(['slots'],'readonly'),completed=done(tx),rows=await request(tx.objectStore('slots').getAll());await completed;return rows.map(x=>clone(x));}
 async function write(input,{slotId,expectedRevision=0,expectedSlotVersion=0}={}){
  if(!['a','1','2','3'].includes(String(slotId)))fail('G08C_SLOT');integer(expectedRevision);integer(expectedSlotVersion);
  const cap=await candidate(input),c=verified.get(cap),e=c.envelope,gameId=e.identity.gameId,commitId=crypto.randomUUID(),revision=expectedRevision+1;
  integer(revision);
  fault?.('BEFORE_TRANSACTION');const db=await open(),tx=db.transaction(['heads','slots','snapshots','critical','meta'],'readwrite',{durability:'strict'}),completed=done(tx);
  try{
   const heads=tx.objectStore('heads'),slots=tx.objectStore('slots'),snapshots=tx.objectStore('snapshots'),critical=tx.objectStore('critical'),meta=tx.objectStore('meta');
   const [head,slot,priorOutcome,usage,priorA09,priorM15,priorB1,priorB3]=await Promise.all([request(heads.get(gameId)),request(slots.get(String(slotId))),request(critical.get(gameId)),request(meta.get('usage')),request(critical.get('a09:'+gameId)),request(critical.get('m15:'+gameId)),request(critical.get('b1:'+gameId)),request(critical.get('b3:'+gameId))]);
   if((head?.revision||0)!==expectedRevision)fail('G08C_REVISION_CONFLICT');if((slot?.slotVersion||0)!==expectedSlotVersion)fail('G08C_SLOT_CONFLICT');
   if(!usage||usage.version!==1)fail('G08C_META_CORRUPT');for(const k of ['bytes','count','games'])integer(usage[k]);
   const nextOutcome=outcome(e);if(priorOutcome&&canonical(priorOutcome.outcome)!==canonical(nextOutcome))fail('G08C_CRITICAL_ROLLBACK');const nextB3=b3Outcome(e);if(priorB3&&!b3Prefix(priorB3.outcome,nextB3))fail('B3_G08_NARRATIVE_OR_FOUNDATION_ROLLBACK');const nextB1=b1Outcome(e);if(priorB1&&!b1Prefix(priorB1.outcome,nextB1))fail('B1_G08_ACTION_ROLLBACK');const nextM15=m15Outcome(e);if(priorM15&&canonical(priorM15.outcome)!==canonical(nextM15))fail('M15_G08_GRAFT_ROLLBACK');const nextA09=a09Outcome(e);if(priorA09&&canonical(priorA09.outcome)!==canonical(nextA09))fail('A09_G08_FINAL_ROLLBACK_OR_CONTRADICTION');
   if(usage.bytes+c.length>limits.totalBytes||usage.count+1>limits.snapshots||usage.games+(head?0:1)>limits.games)fail('G08C_CAPACITY_STORE');
   const record={format:'GRULLA_NEW_DURABLE_SAVE',version:1,gameId,actorId:e.identity.actorId,persistentGeneration:e.identity.persistentGeneration,revision,commitId,parentCommitId:head?.commitId||null,checksum:c.checksum,bytes:c.length,payload:c.payload};
   snapshots.add(record,commitId);fault?.('AFTER_SNAPSHOT_REQUEST');heads.put({gameId,revision,commitId,checksum:c.checksum,name:e.domains.World.player?.name||'Discípulo',root:e.domains.Player.state.root},gameId);
   slots.put({slotId:String(slotId),slotVersion:expectedSlotVersion+1,gameId,revision,commitId,name:e.domains.World.player?.name||'Discípulo',root:e.domains.Player.state.root},String(slotId));
   if(nextOutcome&&!priorOutcome)critical.add({gameId,revision,commitId,outcome:nextOutcome},gameId);if(nextB3)critical.put({kind:'B3_FOUNDATION_AND_NARRATIVE_V1',gameId,revision,commitId,outcome:nextB3},'b3:'+gameId);if(nextB1)critical.put({kind:'B1_AUTHORIZED_ACTIONS_V1',gameId,revision,commitId,outcome:nextB1},'b1:'+gameId);if(nextM15&&!priorM15)critical.add({kind:'M15_GRAFT_V1',gameId,revision,commitId,outcome:nextM15},'m15:'+gameId);if(nextA09&&!priorA09)critical.add({kind:'A09_FINAL_V1',gameId,revision,commitId,outcome:nextA09},'a09:'+gameId);
   meta.put({version:1,bytes:usage.bytes+c.length,count:usage.count+1,games:usage.games+(head?0:1)},'usage');fault?.('BEFORE_DURABLE_COMMIT');
   await completed;
   const stored=Object.freeze({});verified.set(stored,{kind:'STORED',envelope:e,revision,commitId,gameId,slotId:String(slotId),checksum:c.checksum});
   // After-commit faults cannot be interpreted as an abort. Return the acknowledged durable truth.
   let acknowledgementPending=false;try{fault?.('AFTER_DURABLE_COMMIT');}catch{acknowledgementPending=true;}
   return {cap:stored,revision,commitId,slotVersion:expectedSlotVersion+1,acknowledgementPending};
  }catch(error){try{tx.abort();}catch{}await completed.catch(()=>{});throw error;}
 }

 async function failureLedger(gameId){const db=await open(),tx=db.transaction('critical','readonly'),completed=done(tx),r=await request(tx.objectStore('critical').get('mutants:'+gameId));await completed;if(!r)return null;if(r.kind!=='MUTANT_FAILURES_V1'||r.gameId!==gameId||await hash(canonical({gameId:r.gameId,events:r.events,revision:r.revision}))!==r.hash)fail('R64B_FAILURE_LEDGER_CORRUPT');globalThis.ASTRA_R64B_RETREAT.view(r.events);return r;}
 async function commitMutantFailure(event){globalThis.ASTRA_R64B_RETREAT.validateEvent(event);const prior=await failureLedger(event.gameId),events=globalThis.ASTRA_R64B_RETREAT.merge(prior?.events||[],event);if(prior&&canonical(events)===canonical(prior.events))return clone(prior);const body={gameId:event.gameId,events,revision:(prior?.revision||0)+1},record={kind:'MUTANT_FAILURES_V1',...body,hash:await hash(canonical(body))};record.bytes=0;for(let i=0;i<5;i++){const n=bytes(canonical(record));if(n===record.bytes)break;record.bytes=n;}const db=await open(),tx=db.transaction(['critical','meta'],'readwrite',{durability:'strict'}),completed=done(tx);try{const old=await request(tx.objectStore('critical').get('mutants:'+event.gameId)),usage=await request(tx.objectStore('meta').get('usage'));if(canonical(old||null)!==canonical(prior))fail('R64B_FAILURE_CONCURRENCY');const delta=record.bytes-(prior?.bytes||0);if(!usage||usage.bytes+delta>limits.totalBytes)fail('G08C_CAPACITY_STORE');tx.objectStore('critical').put(record,'mutants:'+event.gameId);tx.objectStore('meta').put({...usage,bytes:usage.bytes+delta},'usage');fault?.('BEFORE_MUTANT_DURABLE_COMMIT');await completed;return clone(record);}catch(e){try{tx.abort();}catch{}await completed.catch(()=>{});throw e;}}
 async function read(slotId,{latestHead=false,gameId=null}={}){
  if(gameId===null&&!['a','1','2','3'].includes(String(slotId)))fail('G08C_SLOT');if(gameId!==null&&(typeof gameId!=='string'||gameId.length<8))fail('G08D1_GAME_ID');const db=await open(),tx=db.transaction(['slots','heads','snapshots','critical'],'readonly'),completed=done(tx);
  const initialHead=gameId===null?null:await request(tx.objectStore('heads').get(gameId));const slot=gameId===null?await request(tx.objectStore('slots').get(String(slotId))):(initialHead?{...initialHead,slotVersion:0}:null);if(!slot){await completed;fail('G08C_SLOT_EMPTY');}
  const [head,critical,a09Critical,m15Critical,b1Critical,b3Critical]=await Promise.all([request(tx.objectStore('heads').get(slot.gameId)),request(tx.objectStore('critical').get(slot.gameId)),request(tx.objectStore('critical').get('a09:'+slot.gameId)),request(tx.objectStore('critical').get('m15:'+slot.gameId)),request(tx.objectStore('critical').get('b1:'+slot.gameId)),request(tx.objectStore('critical').get('b3:'+slot.gameId))]);
  if(!head||head.gameId!==slot.gameId)fail('G08C_HEAD_MISSING');
  integer(head.revision);integer(slot.revision);integer(slot.slotVersion);
  if(b3Critical&&slot.revision<b3Critical.revision&&!latestHead){await completed;fail('B3_G08_SLOT_BEFORE_VERIFIED_COMMIT');}if(b1Critical&&slot.revision<b1Critical.revision&&!latestHead){await completed;fail('B1_G08_SLOT_BEFORE_ACTION');}if(m15Critical&&slot.revision<m15Critical.revision&&!latestHead){await completed;fail('M15_G08_SLOT_BEFORE_GRAFT');}if(a09Critical&&slot.revision<a09Critical.revision&&!latestHead){await completed;fail('A09_G08_SLOT_BEFORE_FINAL');}if(critical&&slot.revision<critical.revision&&!latestHead){await completed;fail('G08C_SLOT_BEFORE_CRITICAL_COMMIT');}
  if(slot.revision<head.revision&&!latestHead){await completed;fail('G08C_SLOT_NOT_CURRENT_HEAD');}
  const pointer=latestHead?head:slot,record=await request(tx.objectStore('snapshots').get(pointer.commitId));await completed;
  if(!record||record.format!=='GRULLA_NEW_DURABLE_SAVE'||record.version!==1||record.commitId!==pointer.commitId||record.gameId!==slot.gameId||record.revision!==pointer.revision||typeof record.payload!=='string'||bytes(record.payload)!==record.bytes||record.bytes>limits.snapshotBytes)fail('G08C_RECORD_INVALID');
  integer(record.revision);integer(record.persistentGeneration);if(record.revision===head.revision&&record.checksum!==head.checksum)fail('G08C_HEAD_CHECKSUM');
  if(await hash(record.payload)!==record.checksum)fail('G08C_CHECKSUM_MISMATCH');let e;try{e=JSON.parse(record.payload);}catch{fail('G08C_PAYLOAD_INVALID');}check(e);const failures=await failureLedger(e.identity.gameId);if(failures){e=globalThis.ASTRA_R64B_RETREAT.overlay(e,failures.events);check(e);}
  if(e.identity.gameId!==record.gameId||e.identity.actorId!==record.actorId||e.identity.persistentGeneration!==record.persistentGeneration)fail('G08C_RECORD_IDENTITY');
  if(critical&&canonical(critical.outcome)!==canonical(outcome(e)))fail('G08C_CRITICAL_ROLLBACK');if(b3Critical&&!b3Prefix(b3Critical.outcome,b3Outcome(e)))fail('B3_G08_PROVENANCE');if(b1Critical&&!b1Prefix(b1Critical.outcome,b1Outcome(e)))fail('B1_G08_ACTION_PROVENANCE');if(m15Critical&&canonical(m15Critical.outcome)!==canonical(m15Outcome(e)))fail('M15_G08_GRAFT_PROVENANCE');if(a09Critical&&canonical(a09Critical.outcome)!==canonical(a09Outcome(e)))fail('A09_G08_FINAL_READ_PROVENANCE');
  const cap=Object.freeze({});verified.set(cap,{kind:'STORED',envelope:clone(e),revision:record.revision,commitId:record.commitId,gameId:record.gameId,slotId:String(slotId),checksum:record.checksum});return {cap,revision:record.revision,commitId:record.commitId,slotVersion:slot.slotVersion};
 }
 async function listGames(){
  const db=await open(),tx=db.transaction('heads','readonly'),completed=done(tx),keys=await request(tx.objectStore('heads').getAllKeys());await completed;
  const result=[];for(const gameId of keys){try{const r=await read(null,{gameId,latestHead:true}),d=requireStoredCheckpoint(r.cap);result.push({status:'AVAILABLE',gameId:d.gameId,revision:d.revision,name:d.envelope.domains.World.player?.name||'Discípulo',root:d.envelope.domains.Player.state.root});}
   catch(error){if(/OPEN_|STORAGE_UNAVAILABLE|CRYPTO_UNAVAILABLE|VersionError|AbortError/.test(String(error)))throw error;result.push({status:'UNAVAILABLE',gameId,revision:null,name:'Partida no verificable',root:null,error:String(error)});}}
  return result;
 }
 const readGame=gameId=>read(null,{gameId,latestHead:true});
 async function maintenanceState(db,mode='readonly'){
  const tx=db.transaction(['heads','slots','snapshots','critical','meta'],mode,mode==='readwrite'?{durability:'strict'}:undefined),completed=done(tx);
  const [headKeys,heads,criticalKeys,critical,snapshots,usage]=await Promise.all([request(tx.objectStore('heads').getAllKeys()),request(tx.objectStore('heads').getAll()),request(tx.objectStore('critical').getAllKeys()),request(tx.objectStore('critical').getAll()),request(tx.objectStore('snapshots').getAll()),request(tx.objectStore('meta').get('usage'))]);
  return {tx,completed,state:{headKeys,heads,criticalKeys,critical,snapshots,usage}};
 }
 async function verifyProtected(record,pointer){
  if(!record||record.format!=='GRULLA_NEW_DURABLE_SAVE'||record.version!==1||record.commitId!==pointer.commitId||record.gameId!==pointer.gameId||record.revision!==pointer.revision||typeof record.payload!=='string'||bytes(record.payload)!==record.bytes||record.bytes>limits.snapshotBytes)fail('G08D2_PROTECTED_RECORD_INVALID');
  integer(record.revision);integer(record.persistentGeneration);if(pointer.checksum!==undefined&&pointer.checksum!==record.checksum)fail('G08D2_PROTECTED_HEAD_CHECKSUM');if(await hash(record.payload)!==record.checksum)fail('G08D2_PROTECTED_CHECKSUM');
  let e;try{e=JSON.parse(record.payload);}catch{fail('G08D2_PROTECTED_PAYLOAD');}check(e);if(e.identity.gameId!==record.gameId||e.identity.actorId!==record.actorId||e.identity.persistentGeneration!==record.persistentGeneration)fail('G08D2_PROTECTED_IDENTITY');if(preflightProtected){const cap=Object.freeze({});verified.set(cap,{kind:'CANDIDATE',envelope:clone(e)});preflightProtected(cap);}return e;
 }
 async function maintain(){
  const db=await open(),prior=await maintenanceState(db);await prior.completed;const baseline=prior.state;
  const {headKeys,heads,criticalKeys,critical:allCritical,snapshots,usage}=baseline,critical=allCritical.filter(c=>c.kind!=='MUTANT_FAILURES_V1'),mutantLedgers=allCritical.filter(c=>c.kind==='MUTANT_FAILURES_V1');for(const r of mutantLedgers)await failureLedger(r.gameId);if(!usage||usage.version!==1)fail('G08C_META_CORRUPT');for(const k of ['bytes','count','games'])integer(usage[k]);
  const byId=new Map(snapshots.map(x=>[x.commitId,x])),keep=new Set([...heads,...critical].map(x=>x.commitId)),envelopes=new Map();
  for(let i=0;i<heads.length;i++){const h=heads[i];if(h.gameId!==headKeys[i])fail('G08D2_PROTECTED_HEAD_IDENTITY');envelopes.set(h.gameId,await verifyProtected(byId.get(h.commitId),h));}
  for(let i=0;i<critical.length;i++){const c=critical[i],head=heads.find(h=>h.gameId===c.gameId);if((c.kind==='B3_FOUNDATION_AND_NARRATIVE_V1'?'b3:'+c.gameId:c.kind==='B1_AUTHORIZED_ACTIONS_V1'?'b1:'+c.gameId:c.kind==='M15_GRAFT_V1'?'m15:'+c.gameId:c.kind==='A09_FINAL_V1'?'a09:'+c.gameId:c.gameId)!==criticalKeys[allCritical.indexOf(c)]||!head||c.revision>head.revision)fail('G08D2_PROTECTED_CRITICAL_IDENTITY');const e=await verifyProtected(byId.get(c.commitId),c);if(canonical(c.kind==='B3_FOUNDATION_AND_NARRATIVE_V1'?b3Outcome(e):c.kind==='B1_AUTHORIZED_ACTIONS_V1'?b1Outcome(e):c.kind==='M15_GRAFT_V1'?m15Outcome(e):c.kind==='A09_FINAL_V1'?a09Outcome(e):outcome(e))!==canonical(c.outcome)||canonical(c.kind==='B3_FOUNDATION_AND_NARRATIVE_V1'?b3Outcome(envelopes.get(c.gameId)):c.kind==='B1_AUTHORIZED_ACTIONS_V1'?b1Outcome(envelopes.get(c.gameId)):c.kind==='M15_GRAFT_V1'?m15Outcome(envelopes.get(c.gameId)):c.kind==='A09_FINAL_V1'?a09Outcome(envelopes.get(c.gameId)):outcome(envelopes.get(c.gameId)))!==canonical(c.outcome))fail('G08D2_PROTECTED_CRITICAL_OUTCOME');}
  // Hashing runs before the write transaction. Re-read and compare within its lock:
  // no promise of crypto may auto-commit the transaction before deletion/metadata writes.
  const current=await maintenanceState(db,'readwrite'),{tx,completed}=current;
  try{
   if(canonical(current.state)!==canonical(baseline))fail('G08D2_MAINTENANCE_CONFLICT');
   let retainedBytes=mutantLedgers.reduce((n,r)=>n+r.bytes,0),retainedCount=0,removed=0;for(const snap of snapshots){integer(snap.bytes);if(keep.has(snap.commitId)){retainedBytes+=snap.bytes;retainedCount++;}else {tx.objectStore('snapshots').delete(snap.commitId);removed++;}}
   tx.objectStore('meta').put({version:1,bytes:retainedBytes,count:retainedCount,games:heads.length},'usage');fault?.('BEFORE_MAINTENANCE_COMMIT');await completed;
   return {removed,retained:retainedCount,bytes:retainedBytes,games:heads.length,criticalLedgersRetained:critical.length};
  }catch(error){try{tx.abort();}catch{}await completed.catch(()=>{});throw error;}
 }
 // A transfer preserves the complete durable database, including critical ledgers.
 // Only an empty destination can accept it; no merge, rollback or silent overwrite.
 const transferStores=['heads','slots','snapshots','critical','meta'];
 async function archiveRows(){const db=await open(),tx=db.transaction(transferStores,'readonly'),completed=done(tx),rows={};await Promise.all(transferStores.map(async n=>{const st=tx.objectStore(n),[keys,values]=await Promise.all([request(st.getAllKeys()),request(st.getAll())]);rows[n]=keys.map((key,i)=>[key,values[i]]);}));await completed;return rows;}
 async function validateArchiveRows(rows){
  if(!rows||canonical(Object.keys(rows).sort())!==canonical([...transferStores].sort()))fail('G08_TRANSFER_STORES');
  const maps={};for(const n of transferStores){if(!Array.isArray(rows[n]))fail('G08_TRANSFER_ROWS');maps[n]=new Map();for(const pair of rows[n]){if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||maps[n].has(pair[0]))fail('G08_TRANSFER_KEY');maps[n].set(pair[0],pair[1]);}}
  if(rows.snapshots.length>limits.snapshots||rows.heads.length>limits.games)fail('G08_TRANSFER_CAPACITY');
  const envelopes=new Map();let size=0;
  for(const [key,r]of maps.snapshots){if(key!==r.commitId)fail('G08_TRANSFER_SNAPSHOT_KEY');envelopes.set(key,await verifyProtected(r,{commitId:r.commitId,gameId:r.gameId,revision:r.revision,checksum:r.checksum}));size+=r.bytes;}
  for(const [key,h]of maps.heads){if(key!==h.gameId)fail('G08_TRANSFER_HEAD_KEY');const r=maps.snapshots.get(h.commitId);if(!r||r.gameId!==h.gameId||r.revision!==h.revision||r.checksum!==h.checksum)fail('G08_TRANSFER_HEAD');for(const record of maps.snapshots.values())if(record.gameId===key&&record.revision>h.revision)fail('G08_TRANSFER_ROLLBACK');}
  for(const [key,slot]of maps.slots){integer(slot.slotVersion);const r=maps.snapshots.get(slot.commitId),h=maps.heads.get(slot.gameId);if(!['a','1','2','3'].includes(key)||key!==slot.slotId||!h||!r||r.gameId!==slot.gameId||r.revision!==slot.revision||slot.revision>h.revision)fail('G08_TRANSFER_SLOT');}
  for(const [key,c]of maps.critical){
   const h=maps.heads.get(c.gameId);if(!h)fail('G08_TRANSFER_CRITICAL_GAME');
   if(c.kind==='MUTANT_FAILURES_V1'){if(key!=='mutants:'+c.gameId||await hash(canonical({gameId:c.gameId,events:c.events,revision:c.revision}))!==c.hash)fail('G08_TRANSFER_MUTANT_HASH');globalThis.ASTRA_R64B_RETREAT.view(c.events);integer(c.bytes);size+=c.bytes;continue;}
   const selector=c.kind==='B3_FOUNDATION_AND_NARRATIVE_V1'?b3Outcome:c.kind==='B1_AUTHORIZED_ACTIONS_V1'?b1Outcome:c.kind==='M15_GRAFT_V1'?m15Outcome:c.kind==='A09_FINAL_V1'?a09Outcome:!c.kind?outcome:null;
   const prefix=c.kind==='B3_FOUNDATION_AND_NARRATIVE_V1'?'b3:':c.kind==='B1_AUTHORIZED_ACTIONS_V1'?'b1:':c.kind==='M15_GRAFT_V1'?'m15:':c.kind==='A09_FINAL_V1'?'a09:':'';
   const r=maps.snapshots.get(c.commitId);if(!selector||key!==prefix+c.gameId||!r||r.gameId!==c.gameId||r.revision!==c.revision||c.revision>h.revision||canonical(selector(envelopes.get(c.commitId)))!==canonical(c.outcome)||canonical(selector(envelopes.get(h.commitId)))!==canonical(c.outcome))fail('G08_TRANSFER_CRITICAL_ROLLBACK');
  }
  const usage=maps.meta.get('usage');if(maps.meta.size!==1||!usage||usage.version!==1||usage.count!==maps.snapshots.size||usage.games!==maps.heads.size||usage.bytes!==size||size>limits.totalBytes)fail('G08_TRANSFER_USAGE');
  return {games:maps.heads.size,snapshots:maps.snapshots.size,bytes:size};
 }
 async function exportArchive(){const rows=await archiveRows();await validateArchiveRows(rows);const body={schema:'LGB_G08_ORIGIN_ARCHIVE_V1',namespace:name,stores:rows};return {...body,checksum:await hash(canonical(body))};}
 async function importArchive(input){
  const a=clone(input);if(a?.schema!=='LGB_G08_ORIGIN_ARCHIVE_V1'||a.namespace!==name||canonical(Object.keys(a).sort())!==canonical(['schema','namespace','stores','checksum'].sort()))fail('G08_TRANSFER_FORMAT');
  const body={schema:a.schema,namespace:a.namespace,stores:a.stores};if(await hash(canonical(body))!==a.checksum)fail('G08_TRANSFER_CHECKSUM');const result=await validateArchiveRows(a.stores);
  const db=await open(),tx=db.transaction(transferStores,'readwrite',{durability:'strict'}),completed=done(tx);
  try{const current=await Promise.all(transferStores.map(n=>request(tx.objectStore(n).getAllKeys())));for(let i=0;i<current.length;i++){const n=transferStores[i];if(n==='meta'){if(canonical(current[i])!==canonical(['usage']))fail('G08_TRANSFER_DESTINATION_NOT_EMPTY');const u=await request(tx.objectStore(n).get('usage'));if(u?.bytes!==0||u.count!==0||u.games!==0)fail('G08_TRANSFER_DESTINATION_NOT_EMPTY');}else if(current[i].length)fail('G08_TRANSFER_DESTINATION_NOT_EMPTY');}
   fault?.('BEFORE_TRANSFER_WRITE');for(const n of transferStores)for(const[key,value]of a.stores[n])tx.objectStore(n).put(value,key);fault?.('BEFORE_TRANSFER_COMMIT');await completed;return result;
  }catch(error){try{tx.abort();}catch{}await completed.catch(()=>{});throw error;}
 }

 return Object.freeze({exportArchive,importArchive,candidate,write,read,readGame,commitMutantFailure,failureLedger,list,listGames,maintain,cancelOpen,close(){cancelOpen();connection?.close();connection=null;},inspect:()=>({backend:'INDEXEDDB',database:name,limits:clone(limits),durability:'strict',checksum:'ACCIDENTAL_CORRUPTION_ONLY',legacyStorage:false,opening:!!opening,blocked:opening?.blocked||false,openTimeoutMs})});
}

export { LIMITS, createDurableStore, requireStoreCandidate, requireStoredCheckpoint };
