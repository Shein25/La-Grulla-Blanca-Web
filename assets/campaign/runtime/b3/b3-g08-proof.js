// B3 v2.5 – Focal durable critical-record projection. Does NOT certify a native issuer.
// Pure deterministic projection from a checkpoint that another trusted owner MUST validate.
const fail=s=>{throw Error('B3_G08_'+s);};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const qualities=new Set(['AGRIETADA','ESTABLE','IMPECABLE','CELESTIAL']);
function required(cond,code){if(!cond)fail(code);}
function itemCount(arr,id){required(Array.isArray(arr),'WORLD_INVENTORY');return arr.filter(x=>x===id).length;}
const safe=s=>typeof s==='string'&&s.length>=8&&s.length<256;
function foundationOutcome(e){
 const d=e?.domains, p=d?.Player?.state, b=d?.B3Foundation;
 required(p&&d?.World&&d?.Ascensions&&d?.LIVMissions&&d?.A09Boss,'GRAPH_INCOMPLETE');
 if(p.stage!=='ZhuJi'){
  required(p.foundation===undefined&&!b?.foundation,'FOUNDATION_WRONG_STAGE');return null;
 }
 const f=p.foundation,t=p.cultivation?.transitions?.at(-1),bt=b?.foundation;
 required(f?.version===1&&f.source==='G08_NATIVE_FOUNDATION'&&safe(f.commitId)&&qualities.has(f.quality)&&Number.isSafeInteger(f.score),'PRIVATE_FOUNDATION_SHAPE');
 required(f.actorId===p.actorId&&f.generation===p.generation&&b?.actorId===p.actorId&&b?.generation===p.generation,'OWNER_MISMATCH');
 required(bt&&bt.commitId===f.commitId&&bt.quality===f.quality&&bt.score===f.score&&bt.pillConsumed===f.pillConsumed,'B3_RECEIPT_MISMATCH');
 required(Array.isArray(b.comprehensionReceipts)&&b.tribulation?.success?.eventId&&safe(b.tribulation.success.eventId),'B3_EVIDENCE_MISSING');
 required(p.cultivation?.stage==='ZhuJi'&&t?.toStage==='ZhuJi'&&t.foundationQuality===f.quality&&t.foundationCommitId===f.commitId,'CULTIVATION_MISMATCH');
 required(d.World.player?.etapa===5&&d.World.quests?.M18==='hecha'&&d.LIVMissions.missions?.M18?.closed?.id&&d.A09Boss.postcombat?.stage==='DECIDED','NATIVE_M18_MISSING');
 required(f.pillConsumed===true||f.pillConsumed===false,'PILL_CHOICE');
 required(f.quality!=='CELESTIAL'||f.pillConsumed===true,'CELESTIAL_PILL_REQUIRED');
 const bands={AGRIETADA:[-Infinity,7],ESTABLE:[8,14],IMPECABLE:[15,19],CELESTIAL:[20,Infinity]};
 required(f.score>=bands[f.quality][0]&&(f.score<=bands[f.quality][1]||f.quality==='IMPECABLE'&&!f.pillConsumed&&f.score>=20),'FOUNDATION_SCORE_BAND');
 required(f.resourceBefore&&f.resourceAfter&&f.maxAfter,'RESOURCE_PROOF');
 for(const k of ['hp','qi']){
  const before=f.resourceBefore[k],after=f.resourceAfter[k],max=f.maxAfter[k];
  required(Number.isFinite(before)&&before>=0&&Number.isFinite(after)&&after>=0&&Number.isFinite(max)&&max>0&&after===Math.min(before,max),'NO_REFILL_'+k.toUpperCase());
 }
 // resourceAfter is the historical ASCENSION instant; later gameplay may damage HP or spend Qi.
 required(Number.isFinite(p.hp)&&p.hp>=0&&Number.isFinite(p.qi)&&p.qi>=0,'CURRENT_RESOURCES_INVALID');
 if(d.World.player.hp!==undefined)required(d.World.player.hp===p.hp,'WORLD_HP_PROJECTION');
 if(d.World.player.qi!==undefined)required(d.World.player.qi===p.qi,'WORLD_QI_PROJECTION');
 required(f.pillConsumed?d.A09Boss.foundation?.claimed===true&&d.A09Boss.foundation?.consumed===true:!d.A09Boss.foundation||d.A09Boss.foundation.claimed===true&&d.A09Boss.foundation.consumed===false,'A09_PILL_SPENT_LEDGER_MISMATCH');
 required(itemCount(d.World.player.inventario,'pildora_fundacion')===(f.pillConsumed?0:d.A09Boss.foundation?1:0),'PILL_INVENTORY_PROVENANCE');
 const sources=b.comprehensionReceipts.map(x=>x.eventId);
 required(sources.every(safe)&&new Set(sources).size===sources.length,'COMPREHENSION_RECEIPTS');
 return {kind:'B3_FOUNDATION_V1',commitId:f.commitId,actorId:p.actorId,generation:p.generation,quality:f.quality,score:f.score,pillConsumed:f.pillConsumed,tribulationProofId:b.tribulation.success.eventId,comprehensionProofIds:sources,worldM18ReceiptId:d.LIVMissions.missions.M18.closed.id,postcombatEventId:d.A09Boss.postcombat.eventId,resourceBefore:f.resourceBefore,resourceAfter:f.resourceAfter,maxAfter:f.maxAfter,stage:'ZhuJi'};
}
function assertFoundationDelta(before,after){
 const old=foundationOutcome(before),now=foundationOutcome(after);
 required(old===null&&now!==null,'NOT_FRESH_FOUNDATION');
 required(before.identity?.gameId===after.identity?.gameId&&before.identity?.persistentGeneration===after.identity?.persistentGeneration,'GAME_IDENTITY_CHANGED');
 const bp=before.domains.Player.state,ap=after.domains.Player.state,bw=before.domains.World.player,aw=after.domains.World.player;
 required(bp.stage==='LianQi_IV'&&bw.etapa===4,'WRONG_PRE_STAGE');
 required(bp.actorId===ap.actorId&&bp.generation===ap.generation,'PLAYER_IDENTITY_CHANGED');
 required(before.domains.World.quests.M18==='hecha'&&eq(before.domains.LIVMissions,after.domains.LIVMissions),'M18_OR_LIV_MODIFIED');
 const a09before=structuredClone(before.domains.A09Boss),a09after=structuredClone(after.domains.A09Boss);
 required(a09before.foundation?a09before.foundation.consumed===false&&a09after.foundation?.consumed===now.pillConsumed:!a09after.foundation&&!now.pillConsumed,'A09_PILL_CONSUMPTION_CHANGE');
 if(a09after.foundation)a09after.foundation.consumed=false;required(eq(a09before,a09after),'A09_OTHER_FIELD_MODIFIED');
 for(const name of Object.keys(before.domains))if(!['Player','World','Ascensions','B3Foundation','A09Boss'].includes(name))required(eq(before.domains[name],after.domains[name]),'FOREIGN_DOMAIN_MODIFIED:'+name);
 for(const field of Object.keys(bp))if(!['stage','hp','qi','foundation','cultivation','version','schema','inventory','revision','sequence'].includes(field))required(eq(bp[field],ap[field]),'FOREIGN_PLAYER_FIELD:'+field);
 for(const field of Object.keys(bw))if(!['etapa','hp','qi','max_hp','qi_max','inventario','reino','calidad_fundacion'].includes(field))required(eq(bw[field],aw[field]),'FOREIGN_WORLD_PLAYER_FIELD:'+field);
 for(const field of Object.keys(before.domains.World))if(field!=='player')required(eq(before.domains.World[field],after.domains.World[field]),'FOREIGN_WORLD_FIELD:'+field);
 required(Array.isArray(before.domains.Ascensions.transitions)&&after.domains.Ascensions.transitions.length===before.domains.Ascensions.transitions.length+1,'ASCENSION_RECEIPT_APPEND_ONE');
 required(eq(before.domains.Ascensions.transitions,after.domains.Ascensions.transitions.slice(0,-1)),'ASCENSION_HISTORY_CHANGED');
 required(after.domains.Ascensions.transitions.at(-1).foundationCommitId===now.commitId,'ASCENSION_RECEIPT_WRONG_COMMIT');
 const pill='pildora_fundacion',inv0=bw.inventario,inv1=aw.inventario;
 required(now.pillConsumed?itemCount(inv0,pill)===1:[0,1].includes(itemCount(inv0,pill)),'PILL_NOT_OWNED');
 const filter=x=>x.filter(i=>i!==pill);
 required(eq(filter(inv0),filter(inv1)),'OTHER_INVENTORY_CHANGED');
 required(itemCount(inv1,pill)===(now.pillConsumed?0:itemCount(inv0,pill)),'PILL_COUNT_MISMATCH');
 required(now.resourceBefore.hp===bp.hp&&now.resourceBefore.qi===bp.qi,'RESOURCES_BEFORE_MISMATCH');
 return now;
}
function assertFoundationCritical(prior,next){
 if(prior){required(next!==null&&eq(prior,next),'FOUNDATION_ROLLBACK_OR_CONTRADICTION');}
 return true;
}

export { assertFoundationCritical, assertFoundationDelta, foundationOutcome };
