(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_PLAYER_SAVE=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const KEYS=['version','schema','gameId','actorId','generation','stage','root','ecology','stones','ultiCooldown','hp','qi','absorption','dots','revision','sequence','nextLife','inventory','serviceTransactions','groundClaims','groundItems','manuals','additionalKnown','lives','progression','cultivation','branches'];
function validate(raw,{verifyFoundation=null}={}){const d=S.copy(raw);
 const zhuji=d.stage==='ZhuJi';
 if(zhuji){
  if(d.version!==5||d.schema!=='B3_ZHUJI_PRIVATE_PLAYER_V5'||!d.foundation)S.fail('B3_ZHUJI_SAVE_V5_REQUIRED');
  const f=d.foundation;
  S.exact(f,['version','commitId','actorId','generation','quality','score','pillConsumed','source','resourceBefore','resourceAfter','maxAfter']);
  if(f.version!==1||f.actorId!==d.actorId||f.generation!==d.generation||f.source!=='G08_NATIVE_FOUNDATION'||
   typeof f.commitId!=='string'||f.commitId.length<8||!['AGRIETADA','ESTABLE','IMPECABLE','CELESTIAL'].includes(f.quality)||
   !Number.isSafeInteger(f.score)||typeof f.pillConsumed!=='boolean')S.fail('B3_ZHUJI_FOUNDATION_RECEIPT');
  const range={AGRIETADA:[-Infinity,7],ESTABLE:[8,14],IMPECABLE:[15,19],CELESTIAL:[20,Infinity]}[f.quality];
  if(f.score<range[0]||f.score>range[1]&&!(f.quality==='IMPECABLE'&&!f.pillConsumed&&f.score>=20)||f.quality==='CELESTIAL'&&!f.pillConsumed)S.fail('B3_ZHUJI_QUALITY_POLICY');
  for(const k of ['resourceBefore','resourceAfter','maxAfter']){
   S.exact(f[k],['hp','qi']);for(const axis of ['hp','qi'])S.number(f[k][axis],'B3_'+k+'_'+axis);
  }
  if(f.resourceBefore.hp<=0||f.resourceAfter.hp!==Math.min(f.resourceBefore.hp,f.maxAfter.hp)||
   f.resourceAfter.qi!==Math.min(f.resourceBefore.qi,f.maxAfter.qi))S.fail('B3_ZHUJI_NO_REFILL_V23');
  if(d.cultivation?.stage!=='ZhuJi'||!Array.isArray(d.cultivation?.transitions)||
   d.cultivation.transitions.at(-1)?.toStage!=='ZhuJi'||d.cultivation.transitions.at(-1)?.foundationQuality!==f.quality)S.fail('B3_ZHUJI_CULTIVATION_PROVENANCE');
  if(typeof verifyFoundation!=='function'||verifyFoundation(f,d)!==true)S.fail('B3_ZHUJI_G08_PRIVATE_VERIFICATION_REQUIRED');
 }else if(d.version!==4||d.schema!=='V284_V306_PRIVATE_PLAYER_V4'||d.foundation!==undefined)S.fail('B3_ZHUJI_SAVE_STAGE_VERSION_CONFLICT');S.exact(d,[...KEYS,...(d.combatArchives===undefined?[]:['combatArchives']),...(d.ordinaryCombat===undefined?[]:['ordinaryCombat']),...(d.b3Narrative===undefined?[]:['b3Narrative']),...(d.medicineReceipts===undefined?[]:['medicineReceipts']),...(d.causalHistory===undefined?[]:['causalHistory']),...(d.populationEcology===undefined?[]:['populationEcology']),...(d.structuralReceipts===undefined?[]:['structuralReceipts']),...(d.mutantFailures===undefined?[]:['mutantFailures']),...(zhuji?['foundation']:[])]);if(d.causalHistory!==undefined&&(!Array.isArray(d.causalHistory)||d.causalHistory.length>4))S.fail('R51_CLOSED_DIAGNOSTIC_HISTORY');if(d.medicineReceipts!==undefined){if(!Array.isArray(d.medicineReceipts)||d.medicineReceipts.length>20000||new Set(d.medicineReceipts.map(r=>r.actionId)).size!==d.medicineReceipts.length)S.fail('R50_MEDICINE_LEDGER');for(const r of d.medicineReceipts)if(r.actorId!==d.actorId||r.generation!==d.generation||r.cultivationCredit!==0||!['HP','QI'].includes(r.family)||!Number.isFinite(r.before)||!Number.isFinite(r.after)||r.actualRecovery!==r.after-r.before||r.after<r.before||r.after>r.maximum)S.fail('R50_MEDICINE_RECEIPT');}if(!zhuji&&(d.version!==4||d.schema!=='V284_V306_PRIVATE_PLAYER_V4'))S.fail('A08_PLAYER_SAVE_VERSION');if(!UUID.test(d.gameId)||!UUID.test(d.generation)||d.actorId!=='player:'+d.generation)S.fail('A08_PLAYER_SAVE_IDENTITY');
 if(d.structuralReceipts!==undefined){if(!Array.isArray(d.structuralReceipts)||d.structuralReceipts.length>20000||new Set(d.structuralReceipts.map(r=>r.id)).size!==d.structuralReceipts.length)S.fail('R64B_STRUCTURAL_HISTORY_BOUND_OR_REPLAY');for(const r of d.structuralReceipts)if(r.actorId!==d.actorId||r.generation!==d.generation||!String(r.kind).startsWith('CONCORDANCE_')||typeof r.combatId!=='string')S.fail('R64B_STRUCTURAL_HISTORY_OWNER');}
 if(d.mutantFailures!==undefined&&(!Array.isArray(d.mutantFailures)||d.mutantFailures.length>20000||new Set(d.mutantFailures.map(e=>e.combatId)).size!==d.mutantFailures.length||d.mutantFailures.some(e=>e.gameId!==d.gameId||e.generation!==d.generation)))S.fail('R64B_FAILURE_HISTORY_OWNER_OR_REPLAY');
 for(const key of ['ecology','stones','ultiCooldown','revision','sequence','nextLife'])S.integer(d[key],'PLAYER_SAVE_'+key);for(const key of ['hp','qi','absorption'])S.number(d[key],'PLAYER_SAVE_'+key);
 if(!d.ordinaryCombat&&d.absorption!==0||d.ultiCooldown>40)S.fail('A08_PLAYER_SAVE_QUIESCENT_RESOURCES');
 for(const key of ['dots','serviceTransactions','groundClaims','groundItems','manuals','additionalKnown','lives'])if(!Array.isArray(d[key]))S.fail('A08_PLAYER_SAVE_COLLECTION');
 if(d.lives.length>20000||d.serviceTransactions.length>20000)S.fail('A08_PLAYER_SAVE_BOUND');
 for(const l of d.lives){const n=typeof l.lifeId==='string'&&l.lifeId.startsWith(d.generation+':life:')?Number(l.lifeId.slice((d.generation+':life:').length)):NaN;if(!Number.isSafeInteger(n)||n<1||n>d.nextLife)S.fail('A08_PLAYER_SAVE_LIFE_SEQUENCE');}
 if(d.branches?.mode==='GAMEPLAY'&&(d.inventory?.items||[]).some(i=>i.provenance?.source==='QA_FIXTURE'))S.fail('R50_QA_SAVE_FORBIDDEN');return d;
}
return Object.freeze({validate,version:5,schema:'B3_ZHUJI_PRIVATE_PLAYER_V5',legacyVersion:4,legacySchema:'V284_V306_PRIVATE_PLAYER_V4',namespace:'grulla_arco1_a10_20261029_v1'});
});
