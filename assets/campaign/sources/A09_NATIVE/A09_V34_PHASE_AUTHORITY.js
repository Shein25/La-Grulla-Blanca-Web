'use strict';
/** Pre-binding verification, NOT human approval. In production, document/root
 * authorization and SHA bytes MUST be provided by the privileged A08 owner. */
const FIELDS=Object.freeze(['HP_MAX','PRECISION','EVASION','DEF','CONTROL','TENACITY','CRIT_CHANCE','CRIT_DAMAGE','PERCENT_PENETRATION','FLAT_PENETRATION','LIFESTEAL_PERCENT']);
const HP=Object.freeze([150,100,50]);
const SHA=/^[a-f0-9]{64}$/;const BLOB=/^[a-f0-9]{40}$/;
const fail=code=>{throw Error('A09_V34_AUTH_'+code)};
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function validatePhaseSet(source,host){
 if(!isObj(source)||source.owner!=='A09'||source.authority!=='HUMAN_RATIFIED'||source.status!=='READY'||source.engineContract!=='NEW_COMBAT_STATS_V0_1'||source.resourceModel!=='NONE'||source.qiCurrent!==null||source.qiMax!==null||!SHA.test(source.sourceSHA256||'')||typeof source.approvalRef!=='string'||!source.approvalRef)fail('RATIFICATION_MISSING');
 if(typeof host?.verifyCanonicalSource!=='function'||typeof host.verifyHumanApproval!=='function')fail('OWNER_PORT_MISSING');
 if(host.verifyCanonicalSource(source)!==true||host.verifyHumanApproval(source)!==true)fail('OWNER_REJECTED');
 if(!Array.isArray(source.phases)||source.phases.length!==3)fail('PHASES');
 const seen=new Set();
 const result=source.phases.map((p,i)=>{
  if(!isObj(p)||p.phase!==i+1||!p.profileId||seen.has(p.profileId)||!isObj(p.stats)||Object.keys(p.stats).sort().join(',')!==[...FIELDS].sort().join(','))fail('PHASE_OR_FIELDS');
  seen.add(p.profileId);
  const stats={};for(const field of FIELDS){const s=p.stats[field];
   if(!isObj(s)||s.authority!=='APPROVED_EXACT_SOURCE'||!Number.isFinite(s.value)||typeof s.source!=='string'||!s.source||!(SHA.test(s.sourceSHA256||'')||BLOB.test(s.sourceGitBlob||'')))fail('UNSOURCED_FIELD:'+field);
   if(!host.verifyCanonicalSource({root:source.sourceSHA256,phase:p.phase,field,entry:s}))fail('FIELD_HASH_REJECTED:'+field);
   stats[field]=Object.freeze({...s});
  }
  if(stats.HP_MAX.value!==HP[i])fail('PHASE_HP_CONFLICT');
  return Object.freeze({owner:'A09',authority:'HUMAN_RATIFIED',statsStatus:'READY',resourceModel:'NONE',engineContract:'NEW_COMBAT_STATS_V0_1',profileId:p.profileId,phase:p.phase,qiCurrent:null,qiMax:null,stats:Object.freeze(stats)});
 });
 return Object.freeze(result);
}
/** Resolution must be requested from A08 with a private capability. No browser
 * data may ever serve as authority. */
function createA09V34Authority({host,source,ownerCapability}){
 if(!ownerCapability||typeof ownerCapability!=='object'||typeof host?.verifyOwnerCapability!=='function'||host.verifyOwnerCapability(ownerCapability)!==true)fail('PRIVATE_OWNER_CAP_REQUIRED');
 const profiles=validatePhaseSet(source,host);
 return Object.freeze({resolveAuthority(cap){if(cap!==ownerCapability)fail('CAPABILITY_INVALID');const requested=host.currentPhase?.();if(!Number.isInteger(requested)||requested<1||requested>3)fail('CURRENT_PHASE_REQUIRED');return profiles[requested-1];},checkOnly(){return {status:'RATIFIED_SOURCE_VERIFIED',phaseCount:3,fieldCount:33,sourceSHA256:source.sourceSHA256};}});
}

export { FIELDS, HP, createA09V34Authority, validatePhaseSet };
