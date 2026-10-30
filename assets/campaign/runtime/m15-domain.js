/* La Grulla Blanca, M15 (visible), ARC1_INJERTO_LIV_01.
 * PREINTEGRATION, fail closed. No NPC utterance is a proof; no A08 capability is minted here.
 * Privileged host owns approvals, graft execution, CAS and G08 persistence.
 */
const M15_ID = 'ARC1_INJERTO_LIV_01';
const M15_ROOTS = Object.freeze(['FUEGO','METAL','AGUA','TIERRA','VIENTO']);
const copy = x => structuredClone(x);
const fail = k => { throw Error('M15_'+k); };
const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
function createM15Domain({actorId,generation,principalRoot,verifyEvidence,verifyGraftCommit,verifyRestorePermit}) {
 if(typeof actorId!=='string'||!actorId||typeof generation!=='string'||!generation||!M15_ROOTS.includes(principalRoot)||typeof verifyEvidence!=='function'||typeof verifyGraftCommit!=='function'||typeof verifyRestorePermit!=='function')fail('PORTS_REQUIRED');
 let s={schema:'LGB_M15_V1',missionId:M15_ID,actorId,generation,principalRoot,revision:0,phase:'LOCKED',formed:false,medical:false,permission:false,formationStep:0,attempts:0,selectedRoot:null,chosenRoot:null,questCompleted:false,deferred:false,graftCommitted:false,commitEvidenceId:null,evidence:[]};
 const statuses=['LOCKED','FORMATIONS','MEDICAL','DISCIPLINE','CHAMBER','CHOICE','DEFERRED','COMMITTED'];
 function validate(raw){if(!raw||raw.schema!=='LGB_M15_V1'||raw.missionId!==M15_ID||raw.actorId!==actorId||raw.generation!==generation||raw.principalRoot!==principalRoot)fail('SAVE_IDENTITY');
  if(Object.keys(raw).sort().join('|')!==Object.keys(s).sort().join('|'))fail('SAVE_SCHEMA');
  if(!statuses.includes(raw.phase)||!Number.isSafeInteger(raw.revision)||raw.revision<0||!Number.isSafeInteger(raw.formationStep)||raw.formationStep<0||raw.formationStep>3||!Number.isSafeInteger(raw.attempts)||raw.attempts<0||!Array.isArray(raw.evidence)||!['boolean'].every(t=>typeof raw.formed===t&&typeof raw.medical===t&&typeof raw.permission===t&&typeof raw.questCompleted===t&&typeof raw.deferred===t&&typeof raw.graftCommitted===t))fail('SAVE_SHAPE');
  if(raw.formed&&!raw.evidence.some(x=>x.type==='FORMATIONS_VERIFIED')||raw.medical&&!raw.formed||raw.permission&&!raw.medical||['CHAMBER','CHOICE','DEFERRED','COMMITTED'].includes(raw.phase)&&!raw.permission||raw.questCompleted&&!['CHOICE','DEFERRED','COMMITTED'].includes(raw.phase)||raw.graftCommitted&&(raw.phase!=='COMMITTED'||!raw.commitEvidenceId||raw.chosenRoot!==raw.selectedRoot)||raw.deferred&&raw.phase!=='DEFERRED')fail('SAVE_SEQUENCE');
  if((raw.selectedRoot!==null&&(!M15_ROOTS.includes(raw.selectedRoot)||raw.selectedRoot===principalRoot))||(raw.chosenRoot!==null&&(!M15_ROOTS.includes(raw.chosenRoot)||raw.chosenRoot===principalRoot)))fail('SAVE_ROOT');
  if(new Set(raw.evidence.map(x=>x.id)).size!==raw.evidence.length||raw.evidence.some(x=>!x||typeof x.id!=='string'||!x.id||typeof x.type!=='string'||!x.type||x.actorId!==actorId||x.generation!==generation||!Number.isSafeInteger(x.revision)||x.revision<=0||x.revision>raw.revision))fail('SAVE_EVIDENCE');
  if(raw.revision<raw.evidence.length)fail('SAVE_REVISION');return true;}
 function inspect(){return copy(s);}
 function eligible(ctx){return !!ctx&&ctx.actorId===actorId&&ctx.generation===generation&&ctx.principalRoot===principalRoot&&ctx.stage==='LianQi_IV'&&ctx.quests?.M12==='hecha'&&ctx.quests?.M11==='hecha'&&ctx.quests?.M10==='hecha'&&ctx.noCombat===true&&ctx.noQuestion===true&&ctx.active===true&&ctx.worldGeneration===generation;}
 function canStart(ctx){return eligible(ctx)&&!ctx.branchGraftRoot;}
 function guard(ctx){if(!eligible(ctx))fail('CONTEXT');if(s.graftCommitted)return false;return true;}
 function stamp(type,data={}){const r={id:generation+':M15:'+(s.revision+1)+':'+type,type,actorId,generation,revision:s.revision+1,...data};s.revision++;s.evidence.push(r);return r;}
 function expectRoom(ctx,room,npc=null){if(ctx.room!==room||npc&&(ctx.npcId!==npc||ctx.npcPresent!==true))fail('LOCATION_OR_NPC');}
 function trusted(type,ctx,proof,extra={}){if(!proof||verifyEvidence({type,proof,ctx,state:inspect(),...extra})!==true)fail('SOURCE_UNVERIFIED');}
 function start(ctx){if(s.phase!=='LOCKED')return inspect();if(!canStart(ctx))fail('START_GATE');s.phase='FORMATIONS';stamp('M15_STARTED');return inspect();}
 function talk(npc,ctx){guard(ctx);const needed={he_zhen:'formaciones_sala_control',lan_meihua:'consultorio_meridianos',qiao_ren:'pabellon_disciplina'};if(!own(needed,npc))fail('NPC_UNKNOWN');expectRoom({...ctx,npcId:npc},needed[npc],npc);if(ctx.npcPresent!==true)fail('NPC_NOT_PRESENT');const k=npc==='he_zhen'?'he':npc==='lan_meihua'?'lan':'qiao';return {key:k,phase:s.phase,state:inspect()};}
 function choose(kind,answer,ctx,proof=null){guard(ctx);if(typeof kind!=='string')fail('ACTION');switch(kind){
 case 'HE_ANSWER':
  expectRoom(ctx,'formaciones_sala_control','he_zhen');if(s.phase!=='FORMATIONS')fail('ORDER');if(answer!=='COEXISTENCE')return {correct:false,state:inspect()};trusted('FORMATIONS_VERIFIED',ctx,proof);s.formed=true;s.phase='MEDICAL';stamp('FORMATIONS_VERIFIED',{proofId:proof.id,source:proof.source,room:ctx.room,npcId:ctx.npcId,turn:ctx.turn});return {correct:true,state:inspect()};
 case 'LAN_ANSWER':
  expectRoom(ctx,'consultorio_meridianos','lan_meihua');if(s.phase!=='MEDICAL')fail('ORDER');if(answer!=='STOP_AND_PRESERVE')return {correct:false,state:inspect()};trusted('MEDICAL_VERIFIED',ctx,proof);s.medical=true;s.phase='DISCIPLINE';stamp('MEDICAL_VERIFIED',{proofId:proof.id,source:proof.source,room:ctx.room,npcId:ctx.npcId,turn:ctx.turn});return {correct:true,state:inspect()};
 case 'QIAO_PERMISSION':
  expectRoom(ctx,'pabellon_disciplina','qiao_ren');if(s.phase!=='DISCIPLINE')fail('ORDER');trusted('INSTITUTIONAL_PERMISSION',ctx,proof);s.permission=true;s.phase='CHAMBER';stamp('INSTITUTIONAL_PERMISSION',{proofId:proof.id,source:proof.source,room:ctx.room,npcId:ctx.npcId,turn:ctx.turn});return {correct:true,state:inspect()};
 case 'CHAMBER_STEP':
  expectRoom(ctx,'ala_camara_dos_alas');if(s.phase!=='CHAMBER')fail('ORDER');{
   const sequence=['KEEP_PRINCIPAL','KEEP_BOUNDARIES','COEXIST'];if(answer!==sequence[s.formationStep]){s.formationStep=0;s.attempts++;stamp('CHAMBER_RETRY');return {correct:false,state:inspect()};}
   if(s.formationStep===2){trusted('FORMATION_STABLE',ctx,proof);s.formationStep=3;s.phase='CHOICE';stamp('FORMATION_STABLE',{proofId:proof.id,source:proof.source,room:ctx.room,npcId:ctx.npcId,turn:ctx.turn});return {correct:true,state:inspect()};}
   s.formationStep++;stamp('CHAMBER_STEP',{index:s.formationStep});return {correct:true,state:inspect()};}
 case 'ROOT_CLEAR':
  expectRoom(ctx,'ala_camara_dos_alas');if(s.phase!=='CHOICE')fail('ORDER');s.selectedRoot=null;stamp('ROOT_SELECTION_CLEARED');return {correct:true,state:inspect()};
 case 'REOPEN':
  expectRoom(ctx,'ala_camara_dos_alas');if(s.phase!=='DEFERRED')fail('ORDER');s.phase='CHOICE';s.deferred=false;s.selectedRoot=null;stamp('GRAFT_CHOICE_REOPENED');return {correct:true,state:inspect()};
 case 'ROOT_SELECT':
  expectRoom(ctx,'ala_camara_dos_alas');if(!['CHOICE','DEFERRED'].includes(s.phase)||!M15_ROOTS.includes(answer)||answer===principalRoot)fail('ROOT_INVALID');s.phase='CHOICE';s.deferred=false;s.selectedRoot=answer;stamp('ROOT_SELECTED',{root:answer});return {correct:true,state:inspect()};
 case 'DEFER':
  expectRoom(ctx,'ala_camara_dos_alas');if(s.phase!=='CHOICE')fail('ORDER');s.phase='DEFERRED';s.deferred=true;s.questCompleted=true;s.selectedRoot=null;stamp('M15_COMPLETED_DEFERRED');return {correct:true,state:inspect()};
 case 'GRAFT_RESULT':
  expectRoom(ctx,'ala_camara_dos_alas');if(s.phase!=='CHOICE'||!s.selectedRoot||answer!==s.selectedRoot)fail('GRAFT_CHOICE_MISMATCH');if(!proof||verifyGraftCommit({proof,ctx,state:inspect(),root:answer})!==true)fail('GRAFT_NOT_NATIVE_COMMITTED');
  // Observe a native+durable result from privileged host: this reducer NEVER calls branch.graft itself.
  if(proof.actorId!==actorId||proof.generation!==generation||proof.root!==answer||proof.kind!=='GRAFT_PERMISSION_COMMITTED'||typeof proof.evidenceId!=='string'||!proof.evidenceId||!proof.g08Revision)fail('GRAFT_PROOF_SHAPE');
  s.graftCommitted=true;s.questCompleted=true;s.chosenRoot=answer;s.phase='COMMITTED';s.commitEvidenceId=proof.evidenceId;stamp('M15_COMPLETED_GRAFT',{nativeEvidenceId:proof.evidenceId,g08Revision:proof.g08Revision});return {correct:true,state:inspect()};
 default:fail('ACTION_UNKNOWN');}
 }
 function restore(raw,ctx,permit){if(!ctx||ctx.actorId!==actorId||ctx.generation!==generation||ctx.worldGeneration!==generation||verifyRestorePermit({permit,ctx,raw})!==true)fail('RESTORE_AUTHORITY');validate(raw);s=copy(raw);return inspect();}
 return Object.freeze({id:M15_ID,start,talk,choose,inspect,validate,restore,eligible,canStart});
}

export { M15_ID, M15_ROOTS, createM15Domain };
