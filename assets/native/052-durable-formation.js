(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_FORMATION=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail,integer}=S;
// V286/V12 only. These fields never enter the global Concordance pool.
function createFormation({profile,initialEnemies,resolveAction}){integer(initialEnemies,'FORMATION_INITIAL_SIZE');if(initialEnemies>3)fail('BLOCKED_FORMATION_1V4_PLUS');
 let windows={},counts={},last={},seen=new Set();
 function expire(round){integer(round,'FORMATION_ROUND');for(const [root,w]of Object.entries(windows))if(w.expires<round)delete windows[root];}
 function attack(root,round){expire(round);return freeze(copy(windows[root]?profile.selected[root]:{}));}
 function defense({round,baseDefense,baseEvasion,currentDefense,currentEvasion}){expire(round);const active=Object.keys(windows).map(r=>profile.selected[r]);return freeze({defense:Math.max(currentDefense,baseDefense+Math.max(0,...active.map(c=>c.defense||0))),evasion:Math.max(currentEvasion,baseEvasion+Math.max(0,...active.map(c=>c.evasion||0)))});}
 function earn(cap){const a=resolveAction(cap);if(!a||a.nativePhysical!==true||!a.actionId||!Number.isSafeInteger(a.round)||!Array.isArray(a.impacts))fail('A08_FORMATION_AUTHENTIC_ACTION_REQUIRED');if(seen.has(a.actionId))fail('A08_FORMATION_REPLAY');seen.add(a.actionId);expire(a.round);
  if(initialEnemies!==3||a.kind!=='ORDINARY_AOE'||a.ultimate||a.echo||a.payments!==1||a.paidQI<=0||a.purchasedT3!==true||a.affinityOwned!==true||!profile.selected[a.root])return freeze({status:'NOT_EARNED'});
  const hits=new Set(a.impacts.filter(i=>i.actualHPDamage>0).map(i=>i.lifeId));if(hits.size<2||windows[a.root]||(counts[a.root]||0)>=4||last[a.root]!==undefined&&a.round-last[a.root]<2)return freeze({status:'NOT_EARNED'});
  windows[a.root]={actionId:a.actionId,nodeId:a.nodeId,earned:a.round,expires:a.round+2};counts[a.root]=(counts[a.root]||0)+1;last[a.root]=a.round;return freeze({status:'WINDOW_EARNED',root:a.root,...copy(windows[a.root]),activation:counts[a.root],distinctHPLossTargets:hits.size,extraActions:0,qiRefund:0});
 }
 return Object.freeze({serializeCombat(){return freeze({version:1,owner:'formation',state:{windows:copy(windows),counts:copy(counts),last:copy(last),initialEnemies},seen:[...seen]});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'formation');if(raw.state.initialEnemies!==initialEnemies)fail('COMBAT_FORMATION_COHORT');windows=copy(raw.state.windows);counts=copy(raw.state.counts);last=copy(raw.state.last);seen=new Set(raw.seen);},attack,defense,earn,checkpoint(){const old={windows:copy(windows),counts:copy(counts),last:copy(last),seen:new Set(seen)};return()=>({windows,counts,last,seen}=old);},inspect:()=>freeze({initialEnemies,windows:copy(windows),counts:copy(counts),last:copy(last),numericConcordanceBonus:0})});
}
return Object.freeze({createFormation});
});
