(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_AOE_LOWER=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail}=S;
// Exact observable V269/V112 I/II rules. No V228 T3 numbers, V276 test
// variants, old Wind Bleed, wrongly reassigned Metal Link or immunity default.
const connected=Object.freeze(['circulo_t1_dot','circulo_t2_dot','circulo_t2_eff','temblor_t1_debuff','temblor_t1_prep','temblor_t2_debuff','temblor_t2_prep','tijera_t1_int','tijera_t1_direct','tijera_t1_flow','tijera_t2_int','marea_t1_debuff','lluvia_t1_break','marea_t2_debuff','lluvia_t2_break','marea_t2_eff','tijera_t2_flow']);
function create({readPurchased}){
 let s={phase:{},charges:{},cooldowns:{},windReady:false,windFirstKill:false,windEligible:[],sumersion:{},metalBleeds:{},filaments:{},pressurePrior:{},pressureImmunity:{},pressureControls:{},windRitmo:null,metalLink:null,seen:[]};
 const own=id=>readPurchased().includes(id),ready=(key,round,cd)=>round-(s.cooldowns[key]??-1000)>=cd;
 function active(t,round){return t&&(t.expires===null||t.expires>=round);}
 function eligible(t,c,style){return t.style==='OFFENSIVE'||t.style==='EARTH'&&c.root==='tierra'||t.style==='UNITARY'&&style==='UNITARY';}
 function quote(c,{round}){const out=copy(c),style=c.targeting==='AOE'?'AOE':!c.choices?.length&&!c.defensive?'UNITARY':'OTHER',used=[];for(const [id,t]of Object.entries(s.charges))if(active(t,round)&&eligible(t,c,style)){out.precision_mod+=t.precision||0;out.direct_pct+=t.direct||0;out.qi_cost=Math.max(1,out.qi_cost-(t.discount||0));used.push(id);}if(c.root==='viento'&&c.targeting!=='AOE'&&!c.defensive&&s.windRitmo){out.qi_cost=Math.max(1,out.qi_cost-1);used.push('R56_WIND_RITMO');}const rafaga=style==='AOE'&&c.root==='viento'&&s.windReady&&(own('tijera_t1_int')||own('tijera_t1_direct'));if(rafaga)out.direct_pct+=45;return {compiled:out,used,rafaga,round};}
 function paid(q,actionId){if(s.seen.includes(actionId))fail('A08_LOWER_AOE_REPLAY');s.pressurePrior={};if(q.compiled.root==='agua'&&q.compiled.targeting==='AOE'&&own('marea_t2_debuff')){s.pressurePrior=copy(s.sumersion);s.sumersion={};}s.seen.push(actionId);if(s.seen.length>512)s.seen.shift();for(const id of q.used){if(id==='R56_WIND_RITMO'){if(!s.windRitmo)fail('R56_RITMO_CHARGE_STALE');s.windRitmo=null;continue;}if(!active(s.charges[id],q.round))fail('A08_LOWER_AOE_STALE_TOKEN');delete s.charges[id];}if(q.rafaga){if(!s.windReady)fail('A08_LOWER_WIND_WINDOW_STALE');s.windReady=false;}}
 function basicQuote(round){const t=s.charges.temblor_t2_prep;return freeze({round,id:active(t,round)?'temblor_t2_prep':null,direct:active(t,round)?t.direct:0});}
 function paidBasic(q,actionId){if(!q.id)return;if(s.seen.includes(actionId)||!active(s.charges[q.id],q.round))fail('A08_LOWER_BASIC_STALE');s.seen.push(actionId);if(s.seen.length>512)s.seen.shift();delete s.charges[q.id];}
 function phase(id,kind,round){(s.phase[id]||={})[kind]=round;}
 function after(q,{actionId,round,impacts,actor,actorMaxHP,shield,putBurn,resolvePrior,burns,paidQI}){
  if(!s.seen.includes(actionId))fail('A08_LOWER_UNPAID_ACTION');const c=q.compiled;
  // Remate is checked against the pre-action book, before replacing a burn.
  if(c.targeting==='AOE'&&c.root==='fuego'&&own('circulo_t2_dot'))for(const p of impacts.filter(p=>p.actualHPDamage>0&&p.hpAfter>0))for(const [source,prior]of Object.entries(q.priorBurn?.[p.lifeId]||{})){const current=burns[p.lifeId]?.[source];if(current&&prior.actionId!==actionId){const r=resolvePrior(p.lifeId,prior.potency,source);current.ticks--;if(current.ticks<=0)delete burns[p.lifeId][source];if(r.hpAfter===0)break;}}
  const multi=new Set(impacts.filter(p=>p.actualHPDamage>0).map(p=>p.lifeId)).size>=2,survivors=impacts.filter(p=>p.actualHPDamage>0&&p.hpAfter>0);
  if(c.root==='viento'&&own('tijera_t2_int')&&!s.windFirstKill&&impacts.some(p=>p.actualHPDamage>0&&p.hpAfter===0&&s.windEligible.includes(p.lifeId))){s.windFirstKill=true;s.charges.tijera_t2_int={style:'UNITARY',direct:20,discount:2,expires:round+3};}
  if(c.targeting!=='AOE'||!multi)return;
  if(c.root==='fuego'){
   if(own('circulo_t1_dot'))for(const p of survivors){putBurn(p.lifeId,'circulo_t1_dot',{potency:5,ticks:3,actionId,node:'circulo_t1_dot'});phase(p.lifeId,'firePrecision',round);}
   if(own('circulo_t2_eff')){for(const p of survivors)phase(p.lifeId,'rescoldo',round);if(ready('fireShield',round,2)){shield('circulo_t2_eff',12);s.cooldowns.fireShield=round;}}
  }else if(c.root==='agua'){
   if(own('marea_t1_debuff')||own('marea_t2_debuff'))for(const p of survivors)s.sumersion[p.lifeId]={actionId,source:own('marea_t1_debuff')?'marea_t1_debuff':'marea_t2_debuff'};
  }else if(c.root==='metal'){
   if(own('lluvia_t1_break'))for(const p of survivors){s.filaments[p.lifeId]={actionId};s.metalBleeds[p.lifeId]={actionId,potency:1,remaining:2,source:'metal_lluvia'};}
   if(own('lluvia_t2_break')){if(!Number.isFinite(actorMaxHP)||actorMaxHP<=0)fail('A08_METAL_SOURCE_MAX_HP');if(ready('metalShield',round,3)){shield('lluvia_t2_break',actorMaxHP*.05);s.cooldowns.metalShield=round;}s.metalLink={actionId,targets:survivors.map(p=>p.lifeId),expires:round+2};}
  }else if(c.root==='viento'){
   if(own('tijera_t2_flow')&&paidQI>0&&!s.windRitmo&&ready('R56_RITMO',round,2)){s.windRitmo={actionId,round,discount:1};s.cooldowns.R56_RITMO=round;}if(own('tijera_t1_int')||own('tijera_t1_direct'))s.windReady=true;
   if(own('tijera_t1_int')||own('tijera_t1_flow'))actor('EVASION',22,1,'LOWER_EYE');
   if(own('tijera_t2_int'))for(const p of survivors){phase(p.lifeId,'corrientes',round);if(!s.windEligible.includes(p.lifeId))s.windEligible.push(p.lifeId);}
  }else if(c.root==='tierra'){
   if(own('temblor_t1_debuff'))for(const p of survivors)phase(p.lifeId,'terreno',round);
   if(own('temblor_t1_prep'))s.charges.temblor_t1_prep={style:'EARTH',precision:5,expires:null};
   if(own('temblor_t2_prep'))for(const p of survivors)phase(p.lifeId,'contrapeso',round);
  }
 }
 function enemyStats(id,stats,round){const out={...stats},p=s.phase[id]||{};if(p.firePrecision===round)out.precision-=25;if(p.terreno===round)out.precision*=.7;return out;}
 function enemyMiss(id,round,refund){const p=s.phase[id]||{};if(p.contrapeso===round){delete p.contrapeso;s.charges.temblor_t2_prep={style:'OFFENSIVE',direct:15,expires:null};}if(p.rescoldo===round&&ready('fireRefund',round,3)){refund(2,'circulo_t2_eff');s.cooldowns.fireRefund=round;}}
 function enemyRaw(id,raw,round,{alive,collision}){const p=s.phase[id]||{};if(s.filaments[id]){delete s.filaments[id];raw*=.8;}if(p.corrientes===round&&ready('windRedirect',round,3)){const to=Object.keys(s.phase).sort().find(k=>k!==id&&s.phase[k].corrientes===round&&alive(k));if(to){collision(to,raw*.4);raw*=.6;s.cooldowns.windRedirect=round;}}return raw;}
 function voluntary(lifeId,resolve){const bleed=s.metalBleeds[lifeId];if(!bleed)return [];const result=resolve(bleed.potency);if(!result||!Number.isFinite(result.actualHPDamage)||!Number.isFinite(result.hpAfter))fail('A08_METAL_BLEED_REAL_RESOLVER');bleed.remaining--;const event={node:'lluvia_t1_break',source:bleed.source,originActionId:bleed.actionId,result,remaining:bleed.remaining};if(bleed.remaining===0||result.hpAfter===0)delete s.metalBleeds[lifeId];return freeze([event]);}
 // A T1 mark is semantic evidence, never an automatic Control or a LAB T1 buff.
 function previousSumersion(lifeId){return s.sumersion[lifeId]?freeze(copy(s.sumersion[lifeId])):null;}
 function packet({compiled,lifeId,round,liveCount}){const out={direct:0,relativeDirect:0,pressure:false,metalLink:false};if(compiled.root==='agua'&&compiled.targeting==='AOE'&&own('marea_t2_debuff')&&s.pressurePrior[lifeId]){delete s.pressurePrior[lifeId];out.direct=65;out.pressure=true;out.controlBase=35;}
  if(compiled.root==='agua'&&compiled.targeting!=='AOE'&&!compiled.defensive&&own('marea_t2_eff')&&s.sumersion[lifeId]){out.relativeDirect=.2;out.cauce=true;delete s.sumersion[lifeId];}if(compiled.root==='metal'&&compiled.targeting!=='AOE'&&!compiled.defensive&&!compiled.choices?.length&&own('lluvia_t2_break')&&s.metalLink?.expires>=round&&s.metalLink.targets.includes(lifeId)&&liveCount<=2){out.relativeDirect=.2;out.metalLink=true;s.metalLink=null;}return freeze(out);}
 function pressureAttempt({lifeId,round,actionId,base,resolve}){
  if(!own('marea_t2_debuff')||typeof lifeId!=='string'||!s.seen.includes(actionId)||s.pressureControls[actionId]?.includes(lifeId))fail('R56_PRESSURE_PRIVATE_PAID_CONTEXT');
  if((s.pressureImmunity[lifeId]??-1)>=round)return freeze({status:'IMMUNE',attempted:false});
  if(!ready('R56_PRESSURE',round,3)&&s.cooldowns.R56_PRESSURE!==round)return freeze({status:'COOLDOWN',attempted:false});
  const targets=s.pressureControls[actionId]||=[];if(targets.length>=3)return freeze({status:'CAP_THREE',attempted:false});
  if(!Number.isFinite(base))return freeze({status:'BLOCKED_AUTH_CONTROL_BASE',attempted:false,immunityRounds:3});
  const result=resolve(base);if(typeof result?.success!=='boolean')fail('R56_PRESSURE_RESOLVER');targets.push(lifeId);s.cooldowns.R56_PRESSURE=round;
  if(result.success)s.pressureImmunity[lifeId]=round+3;
  return freeze({...result,status:result.success?'APPLIED':'RESISTED',attempted:true,immunityThroughRound:s.pressureImmunity[lifeId]??null});
 }
 return Object.freeze({serializeCombat(){return freeze({version:1,owner:'aoe-lower',state:copy(s),seen:[]});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'aoe-lower');s=copy(raw.state);},pressureAttempt,packet,voluntary,previousSumersion,quote,paid,basicQuote,paidBasic,after,enemyStats,enemyMiss,enemyRaw,endPhase(){s.phase={};},checkpoint(){const before=copy(s);return()=>{s=before;};},inspect:()=>freeze(copy(s))});
}
return Object.freeze({connected,create});
});
