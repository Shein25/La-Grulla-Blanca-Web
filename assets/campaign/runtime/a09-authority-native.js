import { A09_SOURCE_BUNDLE, A09_PHASES } from './a09-selected-data.js';
import { createA09V34Authority } from '../sources/A09_NATIVE/A09_V34_PHASE_AUTHORITY.js';

const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const same=(a,b)=>canonical(a)===canonical(b),fail=s=>{throw Error('A09_AUTHORITY_'+s);};
async function verifyA09NumericAuthority({crypto=globalThis.crypto,bundle=A09_SOURCE_BUNDLE,source=A09_PHASES}={}){
 if(!crypto?.subtle)fail('CRYPTO_REQUIRED');const enc=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,'0')).join(''),verified=new Map();
 for(const expected of A09_SOURCE_BUNDLE){const item=bundle.find(x=>x.path===expected.path);if(!item||item.commit!==expected.commit||item.gitBlob!==expected.gitBlob)fail('SOURCE_IDENTITY');const bytes=enc.encode(item.raw);
  const sha=hex(await crypto.subtle.digest('SHA-256',bytes));if(sha!==expected.sha256)fail('SOURCE_SHA256:'+item.file);
  const prefix=enc.encode('blob '+bytes.length+'\0'),blob=new Uint8Array(prefix.length+bytes.length);blob.set(prefix);blob.set(bytes,prefix.length);
  if(hex(await crypto.subtle.digest('SHA-1',blob))!==expected.gitBlob)fail('SOURCE_GIT_BLOB:'+item.file);verified.set(item.file,{...expected,raw:item.raw});
 }
 const ledgerFile='A09_MATRIZ_33_PREHOST_CON_TRAZABILIDAD_2026-10-27.json',ratFile='A09_RATIFICACION_EXPRESA_18_CELDAS_2026-10-27.json',selectionFile='SELECCION_HUMANA_CANDIDATA_MEJOR_HOLDOUT_2026-10-27.md',ledger=JSON.parse(verified.get(ledgerFile).raw),rat=JSON.parse(verified.get(ratFile).raw);
 if(!same(source,A09_PHASES)||rat.authority!=='HUMAN_RATIFIED'||rat.nativeGate.ratifiedInThisFile!==18||ledger.phaseStatsCount!==33||source.sourceSHA256!==verified.get(ledgerFile).sha256)fail('RATIFICATION_LEDGER');
 const approved=new Map();let selectedCount=0,ratifiedCount=0;
 for(const p of source.phases)for(const[field,e]of Object.entries(p.stats)){
  const row=ledger.phases.find(x=>x.phase===p.phase)?.stats[field];if(!row||row.value!==e.value)fail('FIELD_VALUE:'+p.phase+':'+field);
  let proof;if(row.decisionState==='OWNER_RATIFIED_EXPLICIT_2026_10_27'){proof=verified.get(ratFile);if(rat.phases.find(x=>x.phase===p.phase)?.stats[field]!==e.value||row.source.sourceGitBlob!==proof.gitBlob)fail('RATIFIED_FIELD_PROVENANCE');ratifiedCount++;}
  else if(row.decisionState==='OWNER_SELECTED_NUMERIC_CANDIDATE_2026_10_27'){proof=verified.get(selectionFile);if(row.decisionSource.sourceGitBlob!==proof.gitBlob)fail('SELECTED_FIELD_PROVENANCE');selectedCount++;}
  else fail('FIELD_DECISION_STATE');
  if(e.authority!=='APPROVED_EXACT_SOURCE'||e.sourceGitBlob!==proof.gitBlob||e.sourceSHA256!==proof.sha256)fail('FIELD_HASH:'+field);approved.set(p.phase+':'+field,e);
 }
 if(selectedCount!==15||ratifiedCount!==18||approved.size!==33)fail('FIELD_COUNTS');
 // Issuers stay inside this closure. A JSON/DOM object is never the owner cap.
 function createPhaseBinding({bossActor,readPhase}){
  if(typeof bossActor?.createProvider!=='function'||typeof readPhase!=='function')fail('NATIVE_OWNER_PORTS');const ownerCapability=Object.freeze({});
  const host={verifyOwnerCapability:cap=>cap===ownerCapability,currentPhase:readPhase,
   verifyCanonicalSource:r=>r?.root? r.root===source.sourceSHA256&&same(approved.get(r.phase+':'+r.field),r.entry):same(r,source),
   verifyHumanApproval:r=>same(r,source)&&verified.get(ratFile).gitBlob===ledger.ratificationSource.sourceGitBlob&&verified.get(selectionFile).gitBlob===ledger.selectionSource.sourceGitBlob};
  const authority=createA09V34Authority({host,source,ownerCapability}),provider=bossActor.createProvider({resolveAuthority:cap=>authority.resolveAuthority(cap)});
  return Object.freeze({issue:context=>provider.issue(ownerCapability,context),resolve:provider.resolve,inspect:provider.inspect,checkOnly:authority.checkOnly});
 }
 return Object.freeze({status:'HOMOLOGATED_NUMERIC_AUTHORITY',fieldCount:33,selectedCount,ratifiedCount,unresolvedCells:0,sourceSHA256:source.sourceSHA256,worldApproved:false,createPhaseBinding});
}

export { verifyA09NumericAuthority };
