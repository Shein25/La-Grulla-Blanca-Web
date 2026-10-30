import { evaluateZhujiPure } from './zhuji-preflight-puro.js';

// B3 experimental module. NO globals, no SAVE, no stage grant, no synthetic receipts.
// The caller must provide an authority verifier backed by the native G08 journal.

const CREDIT=Object.freeze({ORIGEN_ESCOLAR:2,M07:1,M11:1,M12:1,M13:1,M14:1,M15:1,M17:1,ILUMINACION:2});
const copy=x=>structuredClone(x);
const deepFreeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){for(const v of Object.values(o))deepFreeze(v);Object.freeze(o);}return o;};
const err=code=>{throw Error('B3_'+code);};
const ident=o=>o&&typeof o.actorId==='string'&&o.actorId.length>0&&typeof o.generation==='string'&&o.generation.length>0;
const allowedId=s=>typeof s==='string'&&s.length>4&&s.length<256;
const requireProof=(e,owner,verify,kind)=>{
 if(!ident(owner)||!e||e.actorId!==owner.actorId||e.generation!==owner.generation||!allowedId(e.eventId)||e.kind!==kind||!Number.isSafeInteger(e.turn)||e.turn<0)err('EVIDENCE_SHAPE');
 if(typeof verify!=='function'||verify(e)!==true)err('UNVERIFIED_NATIVE_RECEIPT');
};
function emptyB3State(owner){if(!ident(owner))err('OWNER');return {version:1,actorId:owner.actorId,generation:owner.generation,comprehensionReceipts:[],tribulation:{failures:[],retries:[],success:null,firstFailureGeneralCredit:false},foundation:null};}
function validateB3State(s){
 if(!s||s.version!==1||!ident(s)||!Array.isArray(s.comprehensionReceipts)||!s.tribulation||!Array.isArray(s.tribulation.failures)||!Array.isArray(s.tribulation.retries))err('SAVE_SHAPE');
 const ids=[];for(const r of s.comprehensionReceipts){if(r.actorId!==s.actorId||r.generation!==s.generation||r.kind!=='COMPREHENSION_CREDIT'||CREDIT[r.source]!==r.delta||!allowedId(r.eventId))err('SAVE_RECEIPT');ids.push(r.eventId);}
 if(new Set(ids).size!==ids.length||new Set(s.comprehensionReceipts.map(r=>r.source)).size!==s.comprehensionReceipts.length)err('SAVE_DUPLICATE');
 const t=s.tribulation;
 for(const f of t.failures){if(f.actorId!==s.actorId||f.generation!==s.generation||f.kind!=='TRIBULATION_FAILURE'||!allowedId(f.eventId))err('SAVE_TRIBULATION_FAILURE');ids.push(f.eventId);}
 for(const r of t.retries){if(r.actorId!==s.actorId||r.generation!==s.generation||r.kind!=='TRIBULATION_RETRY'||!t.failures.some(f=>f.eventId===r.failureEventId)||!allowedId(r.eventId)||!['PERSONAL_REFLECTION','TALK_TO_COMPANION'].includes(r.method))err('SAVE_TRIBULATION_RETRY');ids.push(r.eventId);}
 if(t.success){if(t.success.kind!=='TRIBULATION_SUCCESS'||t.success.actorId!==s.actorId||t.success.generation!==s.generation||!allowedId(t.success.eventId))err('SAVE_TRIBULATION_SUCCESS');ids.push(t.success.eventId);}
 if(new Set(ids).size!==ids.length||new Set(t.retries.map(r=>r.failureEventId)).size!==t.retries.length)err('SAVE_DUPLICATE');
 if(t.firstFailureGeneralCredit!==(t.failures.length>0)||t.success&&t.failures.length&&t.retries.length!==t.failures.length)err('SAVE_TRIBULATION_SEQUENCE');
 if(s.foundation&&(!allowedId(s.foundation.commitId)||!['AGRIETADA','ESTABLE','IMPECABLE','CELESTIAL'].includes(s.foundation.quality)))err('SAVE_FOUNDATION');
 return true;
}
const accept=s=>{validateB3State(s);return copy(s);};
function creditNativeComprehension(previous,receipt,verify){const s=accept(previous),source=receipt?.source;
 if(!(source in CREDIT)||CREDIT[source]!==receipt.delta)err('CREDIT_NOT_AUTHORIZED');
 requireProof(receipt,s,verify,'COMPREHENSION_CREDIT');
 if(s.comprehensionReceipts.some(r=>r.eventId===receipt.eventId||r.source===source))err('CREDIT_REPLAY');
 if(s.foundation)err('FOUNDATION_ALREADY_COMMITTED');
 s.comprehensionReceipts.push(copy(receipt));validateB3State(s);return s;
}
function eligibleComprehension(s){validateB3State(s);return s.comprehensionReceipts.reduce((n,r)=>n+r.delta,0);}
function tribulationNativeFailure(previous,receipt,verify){const s=accept(previous);requireProof(receipt,s,verify,'TRIBULATION_FAILURE');if(s.foundation||s.tribulation.success)err('AFTER_SUCCESS');
 if(s.tribulation.failures.some(f=>f.eventId===receipt.eventId))err('TRIBULATION_REPLAY');
 const t=s.tribulation;
 if(t.failures.length&&!t.retries.some(r=>r.failureEventId===t.failures.at(-1).eventId))err('RETRY_NOT_AUTHORIZED');
 const first=t.failures.length===0;
 t.failures.push(copy(receipt));t.firstFailureGeneralCredit=true;validateB3State(s);
 return {state:s,generalComprehensionDelta:first?1:0,eligibleFoundationDelta:0,pendingFailureId:receipt.eventId};
}
function authorizeNativeRetry(previous,receipt,context,verify){const s=accept(previous);requireProof(receipt,s,verify,'TRIBULATION_RETRY');const t=s.tribulation;
 const last=t.failures.at(-1);if(!last||t.success||t.retries.some(r=>r.failureEventId===last.eventId))err('NO_PENDING_FAILURE');
 if(context?.inCombat||context?.inQuestion||context?.actorGeneration!==s.generation)err('RETRY_NATIVE_CONTEXT');
 if(receipt.method==='PERSONAL_REFLECTION'){
  if(context.roomId!=='nucleo_sala_relevo'||receipt.command!=='REFLEXIONAR PROFUNDO')err('REFLECTION_LOCATION_OR_COMMAND');
 }else if(receipt.method==='TALK_TO_COMPANION'){
  if(context.companionPresent!==true||context.companionKnown!==true||context.appropriateDialogue!==true||receipt.companionId!==context.companionId)err('COMPANION_NOT_AUTHENTIC');
 }else err('RETRY_METHOD');
 t.retries.push({...copy(receipt),failureEventId:last.eventId});validateB3State(s);return s;
}
function tribulationNativeSuccess(previous,receipt,verify){const s=accept(previous);requireProof(receipt,s,verify,'TRIBULATION_SUCCESS');const t=s.tribulation;
 if(s.foundation||t.success)err('TRIBULATION_SUCCESS_REPLAY');
 if(t.failures.length&&t.retries.length!==t.failures.length)err('TRIBULATION_RETRY_REQUIRED');
 t.success=copy(receipt);validateB3State(s);return s;
}
function previewZhujiFromNative({b3,view,policy,pill,verifyNativePill,pillConsent=false}){
 validateB3State(b3);if(b3.foundation)err('FOUNDATION_ALREADY_COMMITTED');
 // Native G08 must attest the pill from M18; inventory alone is insufficient.
 const verified=!!pill&&pill.kind==='M18_FOUNDATION_PILL'&&pill.itemId==='pildora_fundacion'&&pill.claimed===true&&pill.consumed===false&&pill.actorId===b3.actorId&&pill.generation===b3.generation&&
  typeof verifyNativePill==='function'&&verifyNativePill(pill)===true;
 const state={stage:view?.stage,cultivationCredit:view?.credit,physicalQi:view?.qi,m18Closed:view?.m18Closed,grullaDecision:view?.grullaDecision,
  granPerfeccion:view?.granPerfeccion,iluminacion:view?.iluminacion,daoSeed:view?.daoSeed,
  tribulacionSuperada:!!b3.tribulation.success&&view?.tribulacionSuperada===true,meridianWounds:view?.meridianWounds,
  impurities:view?.impurities,eligibleComprehension:eligibleComprehension(b3),firstTribulationFailurePointIncludedInEligible:false,
  pill:verified?{authentic:true,claimed:true,consumed:false,id:'pildora_fundacion',eventId:pill.eventId}:null,pillConsent};
 const result=evaluateZhujiPure({policy,state});return {...result,comprehensionReceipts:b3.comprehensionReceipts.map(r=>({source:r.source,eventId:r.eventId})),tribulationProofId:b3.tribulation.success?.eventId||null,
  status:result.requirementsMet?'READY_FOR_G08_OWNER_TRANSACTION_NOT_COMMITTED':'BLOCKED_MISSING_EVIDENCE',nativeCommitAuthorized:false};
}
// This prepares a proof-carrying request ONLY. No native stage owner is present here.
// G08 must atomically transition private player+world+pill+quality, or reject the request.
function prepareZhujiRequest({b3,view,policy,pill,verifyNativePill,pillConsent,nonce}){
 if(!allowedId(nonce))err('COMMIT_NONCE_REQUIRED');
 const evaluation=previewZhujiFromNative({b3,view,policy,pill,verifyNativePill,pillConsent});
 if(!evaluation.requirementsMet)err('REQUIREMENTS_NOT_MET:'+evaluation.missing.join(','));
 const selected=pillConsent?evaluation.withPillIfConsented:evaluation.withoutPill;
 if(!selected)err('INVALID_PILL_CHOICE');
 if(selected.quality==='CELESTIAL'&&!pillConsent)err('CELESTIAL_MUST_CONSUME_PILL');
 return deepFreeze({kind:'B3_ZHUJI_FOUNDATION_REQUEST_V1',actorId:b3.actorId,generation:b3.generation,nonce,fromStage:'LianQi_IV',toStage:'ZhuJi',
  comprehensionProofIds:b3.comprehensionReceipts.map(r=>r.eventId),tribulationProofId:b3.tribulation.success.eventId,
  pillProofId:pillConsent?pill.eventId:null,consumePill:pillConsent===true,score:selected.score,quality:selected.quality,
  stats:copy(selected.stats),baseAttack:'1d4+11',directTechniqueScalar:1.5,
  qualityDamageBonusPct:selected.stats.direct_damage_bonus_pct??selected.stats.foundation_damage_bonus_pct,
  resourceRefillPolicy:'NO_REFILL_HP_QI_B3_V23_HUMAN_RATIFIED',
  commitStatus:'REQUIRES_NATIVE_G08_ZHUJI_STAGE_OWNER_AND_ATOMIC_SAVE'});
}
const B3_AUTHORIZED_CREDIT_SOURCES=Object.freeze(copy(CREDIT));

function validateB3RestoreAgainstG08(s,{verifyComprehension,verifyTribulation,verifyFoundation}){
 validateB3State(s);
 if(typeof verifyComprehension!=='function'||typeof verifyTribulation!=='function'||typeof verifyFoundation!=='function')err('RESTORE_NATIVE_VERIFIERS_REQUIRED');
 for(const r of s.comprehensionReceipts)if(verifyComprehension(r)!==true)err('RESTORE_CREDIT_UNVERIFIED');
 for(const r of [...s.tribulation.failures,...s.tribulation.retries,...(s.tribulation.success?[s.tribulation.success]:[])])if(verifyTribulation(r)!==true)err('RESTORE_TRIBULATION_UNVERIFIED');
 if(s.foundation&&verifyFoundation(s.foundation)!==true)err('RESTORE_FOUNDATION_UNVERIFIED');return true;
}

// A guarded delegation point. Cannot write a SAVE or grant a stage by itself.
// A real port MUST implement one atomic G08 transaction with proof replay protection.
async function submitZhujiToNativeG08(request,port){
 if(request?.kind!=='B3_ZHUJI_FOUNDATION_REQUEST_V1'||request.commitStatus!=='REQUIRES_NATIVE_G08_ZHUJI_STAGE_OWNER_AND_ATOMIC_SAVE')err('UNTRUSTED_PROPOSAL');
 if(port?.supportsZhujiStage!==true||port?.atomicOwner!==true||typeof port?.commitVerifiedFoundation!=='function')err('G08_ZHUJI_OWNER_NOT_CONNECTED');
 const result=await port.commitVerifiedFoundation(request);
 if(!result||!['DURABLE_AND_RESTORED','RECOVERY_REQUIRED'].includes(result.status)||!allowedId(result.commitId))err('G08_COMMIT_NOT_CONFIRMED');
 return result;
}

export { B3_AUTHORIZED_CREDIT_SOURCES, authorizeNativeRetry, creditNativeComprehension, eligibleComprehension, emptyB3State, prepareZhujiRequest, previewZhujiFromNative, submitZhujiToNativeG08, tribulationNativeFailure, tribulationNativeSuccess, validateB3RestoreAgainstG08, validateB3State };
