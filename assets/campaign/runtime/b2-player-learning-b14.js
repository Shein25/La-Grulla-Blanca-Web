import { bindSemantic, requireRestorePermit, fail as fail$1, integer, clone } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { requireCompletedRoot } from '../sources/ACCEPTED_ROOT_SELECTOR/integracion/astra/g03/core/root-selector.js';
import { requireStatView } from './b3-campaign-stat-view.js';
import { freeze, fail } from '../sources/ACCEPTED_CAMPAIGN/references/closed/integracion/astra/a07/safe-data.js';

const PRIMARY=freeze({FUEGO:'palma_ardiente',METAL:'destello_plata',AGUA:'latigazo_marea',TIERRA:'golpe_montana',VIENTO:'lanza_nubes'});
const DEFENSIVES=freeze(["cuerpo_horno", "armadura_plata", "espejo_luna", "piel_cobre", "paso_nube"]);
const BASICS=freeze([...Object.values(PRIMARY),...DEFENSIVES]);
const scopes=new WeakSet(),snapshots=new WeakMap(),learnedReceipts=new WeakMap();
function requireLearnedReceipt(cap){const d=learnedReceipts.get(cap);if(!d||!d.current())fail('B13_RECEIPT_NOT_AUTHENTIC');return freeze({...d.data});}
function requireLearningScope(scope){if(!scopes.has(scope))fail('B11_LEARNING_SCOPE_NOT_AUTHENTIC');return scope;}
function requireLearningSnapshot(snapshot){const s=snapshots.get(snapshot);if(!s||!s.current())fail('B11_LEARNING_SNAPSHOT_NOT_AUTHENTIC');return snapshot;}
function validateScopedIds(root,ids){
 if(!Object.hasOwn(PRIMARY,root)||!Array.isArray(ids)||ids.length>10||new Set(ids).size!==ids.length||ids.some(id=>!BASICS.includes(id)))fail('B11_LEARNING_IDENTITIES');
 if(ids.length&&!ids.includes(PRIMARY[root]))fail('B11_PRIMARY_ORDER_INVALID');
 return true;
}
/** Trusted composition module only; no issuer is installed in B1-B1 product. */
function createLearningScope({actorId='player',completionResolver=null}={}){
 if(actorId!=='player'||(completionResolver!==null&&typeof completionResolver!=='function'))fail('B11_LEARNING_PORT');
 let generation=0,live=null,busy=false;const prepared=new WeakMap(),used=new WeakSet(),invalidators=new Set();
 const unavailable=()=>freeze({status:'UNAVAILABLE',actorId,generation,knowledgeRevision:null,knownIds:null});
 function snapshot(){
  if(!live)return unavailable();
  const value=freeze({status:'READY',learningSchemaVersion:1,actorId,generation,knowledgeRevision:live.revision,knownIds:[...live.ids],provenance:live.provenance.map(x=>({...x}))});
  const state=live;snapshots.set(value,{current:()=>live===state&&generation===state.generation&&live.revision===value.knowledgeRevision});return value;
 }
 function need(){if(!live)fail('B11_LEARNING_UNAVAILABLE');}
 function project(view){
  need();requireStatView(view);
  if(view.actorId!==actorId||view.root!==live.root||view.engine_contract!=='NEW_COMBAT_STATS_V0_1'||view.stats_status!=='READY')fail('B11_ROOT_AUTHORITY_MISMATCH');
  validateScopedIds(live.root,[...live.ids]);
  const eligible=live.ids.has(PRIMARY[live.root])?BASICS.filter(id=>!live.ids.has(id)&&(!DEFENSIVES.includes(id)||view.stage!=='LianQi_I')):[PRIMARY[live.root]];
  return freeze({status:eligible.length?'AVAILABLE':'ALL_LEARNED',actorId,generation,knowledgeRevision:live.revision,eligibleIds:eligible,policyRevision:'PRIMARY_ELEMENTAL_FOUNDATION_FIRST_V1'});
 }
 const api=Object.freeze({
  prepare(rootCapability){
   if(live)fail('B11_LEARNING_ALREADY_INITIALIZED');
   const {root}=requireCompletedRoot(rootCapability);if(!Object.hasOwn(PRIMARY,root))fail('B11_ROOT_AUTHORITY_UNAVAILABLE');
   const cap=Object.freeze({});prepared.set(cap,{generation,root,used:false});return cap;
  },
  publish(cap,view){
   const p=prepared.get(cap);if(!p||p.used||p.generation!==generation||live)fail('B11_CREATION_CAPABILITY_REQUIRED');
   requireStatView(view);
   if(view.actorId!==actorId||view.root!==p.root||view.stage!=='LianQi_I'||view.engine_contract!=='NEW_COMBAT_STATS_V0_1'||view.stats_status!=='READY')fail('B11_CREATION_OWNERS_MISMATCH');
   live={generation,root:p.root,ids:new Set(),provenance:[],revision:0};p.used=true;return snapshot();
  },
  abort(cap){const p=prepared.get(cap);if(p)p.used=true;},
  reset(){generation++;live=null;busy=false;},
  capture:snapshot,project,
  /** Infrastructure port, inaccessible on window. Teaching producer absent in product. */
  commit(cap,expectedRevision){
   need();if(busy)fail('B11_LEARNING_REENTRANT');
   if(expectedRevision!==live.revision)fail('B11_LEARNING_STALE');
   if(!cap||typeof cap!=='object'||used.has(cap)||completionResolver===null)fail('B11_TEACHING_NOT_CONNECTED');
   const d=completionResolver(cap);
   if(!d||d.actorId!==actorId||d.generation!==generation||d.sourceKind!=='SHEN_TEACHING_COMPLETED'||!BASICS.includes(d.techniqueId)||d.policyRevision!=='PRIMARY_ELEMENTAL_FOUNDATION_FIRST_V1')fail('B11_GRANT_NOT_AUTHENTIC');
   if(DEFENSIVES.includes(d.techniqueId)&&!['LianQi_II','LianQi_III','LianQi_IV'].includes(d.stage))fail('P4_NATIVE_STAGE_REQUIRED');const next=new Set(live.ids);if(next.has(d.techniqueId)){used.add(cap);return freeze({status:'ALREADY_KNOWN'});}
   next.add(d.techniqueId);validateScopedIds(live.root,[...next]);busy=true;
   try{live.ids=next;live.revision++;live.provenance.push({techniqueId:d.techniqueId,sourceKind:d.sourceKind,policyRevision:d.policyRevision,criterionSourceSHA256:d.criterionSourceSHA256});used.add(cap);
    // Always invalidate before returning a post-commit result. No visual publisher is installed.
    for(const invalidate of invalidators)try{invalidate();}catch{}
    const receipt=Object.freeze({}),state=live,revision=live.revision,id=d.techniqueId,born=generation;learnedReceipts.set(receipt,{data:{actorId,generation:born,revision,techniqueId:id,sourceKind:'SHEN_TEACHING_COMPLETED'},current:()=>live===state&&generation===born&&live.revision===revision&&live.ids.has(id)});
    return freeze({status:'LEARNED',snapshot:snapshot(),receipt});
   }finally{busy=false;}
  },
  onInvalidation(fn){if(typeof fn!=='function'||invalidators.size>=8)fail('B11_INVALIDATION_PORT');invalidators.add(fn);return ()=>invalidators.delete(fn);},
  capabilities:()=>freeze({scope:'B1_B1_EMPTY_LEARNING',teachingConnected:completionResolver!==null,knownBound:10,saveConnected:false,presentationConnected:false})
 });scopes.add(api);
 bindSemantic(api,{capture(){need();return clone({version:1,generation,root:live.root,revision:live.revision,knownIds:[...live.ids],provenance:live.provenance});},
 prepare(d,{permit,envelope}){requireRestorePermit(permit,envelope);if(d.version!==1)fail$1('G08_LEARNING_VERSION');integer(d.generation);integer(d.revision);validateScopedIds(d.root,d.knownIds);if(envelope.domains.Player.state.stage==='LianQi_I'&&d.knownIds.some(id=>DEFENSIVES.includes(id)))fail$1('P4_DEFENSIVE_BEFORE_NATIVE_LII');
  if(d.provenance.length!==d.knownIds.length||d.provenance.some((p,i)=>p.techniqueId!==d.knownIds[i]||p.sourceKind!=='SHEN_TEACHING_COMPLETED'||p.policyRevision!=='PRIMARY_ELEMENTAL_FOUNDATION_FIRST_V1'||typeof p.criterionSourceSHA256!=='string'))fail$1('G08_LEARNING_PROVENANCE');
  const next={generation:d.generation,root:d.root,ids:new Set(d.knownIds),provenance:clone(d.provenance),revision:d.revision};return {apply(){const old={generation,live,busy};generation=d.generation;live=next;busy=false;return ()=>({generation,live,busy}=old);}};
 }});return api;
}

export { BASICS, DEFENSIVES, PRIMARY, createLearningScope, requireLearnedReceipt, requireLearningScope, requireLearningSnapshot, validateScopedIds };
