(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'),require('./combat.js'));else root.ASTRA_A08_TORMENTA=factory(root.ASTRA_A08_SHARED,root.ASTRA_A08_COMBAT);})(globalThis,function(S,C){
'use strict';const {freeze,fail}=S,UID='METAL_TORMENTA_HORIZONTE_PARTIDO';
// V262 -> V242 original multi bridge -> V03.1 Context -> mass.sim_tormenta.
// FULL template omits PEN_SWEEP: exact source defaults are 10 / 15 pp.
// No 0.65 single-target reduction, no simulated future monster turns.
function opening({frame,target,hp,absorption=0,random,roll}){
 if(!(hp>0))fail('A08_TORMENTA_LIVING_TARGET_REQUIRED');
 const packets=[],bleeds=[];let remainingHP=hp,reserve=absorption,opened=false;
 for(let wave=1;wave<=3&&remainingHP>0;wave++){
  const precision=wave===2?15+(opened?10:0):0,penetration=wave===3?(opened?15:10):0;
  const expression=wave===1?'1d7+10':wave===2?'1d7+8':'1d9+12';
  const hit=random()*100<C.hit(frame.stats.PRECISION.value+precision,target.evasion);
  let critical=false,result={actualHPDamage:0,hpAfter:remainingHP,absorptionAfter:reserve,killed:false};
  if(hit){const base=roll(expression);critical=random()*100<frame.stats.CRIT_CHANCE.value;
   result=C.direct({receiver:typeof target==='undefined'?(typeof nativeReceiver==='undefined'?undefined:nativeReceiver):target.r52NativeReceiver,portions:[{base,flat:0,percents:[frame.rootDamagePercent+(frame.modifiers.technique_direct_damage_percent||[]).reduce((a,x)=>a+x.amount,0)],tags:['DIRECT','TECHNIQUE','ULTIMATE','METAL','SOURCE_AOE_WAVE']}],received:{},critical,critMultiplier:frame.stats.CRIT_DAMAGE.value,defense:target.defense,shred:0,percentPen:frame.stats.PERCENT_PENETRATION.value+penetration,flatPen:frame.stats.FLAT_PENETRATION.value,absorption:reserve,currentHP:remainingHP});}
  packets.push({wave,expression,precisionBonus:precision,extraPenetration:penetration,scale:1,hit,critical,result});remainingHP=result.hpAfter;reserve=result.absorptionAfter;
  if(wave===1&&result.actualHPDamage>0)opened=true;
 }
 if(opened&&remainingHP>0)bleeds.push({source:UID,potency:3,activations:3,triggered:0,firstBonus:0});
 return freeze({uid:UID,packets,hpAfter:remainingHP,absorptionAfter:reserve,actualHPDamage:hp-remainingHP,killed:remainingHP===0,bleeds,metalPending:false,costQI:Math.floor(15*frame.rootQICostMultiplier+.5),echoCreated:false,concordanceTriggered:false,formationCreated:false,extraHostileActions:0});
}
return Object.freeze({UID,opening});
});
