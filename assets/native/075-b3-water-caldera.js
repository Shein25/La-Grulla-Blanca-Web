(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'),require('./combat.js'));else root.ASTRA_A08_CALDERA=factory(root.ASTRA_A08_SHARED,root.ASTRA_A08_COMBAT);})(globalThis,function(S,C){
'use strict';const {freeze,fail}=S,UID='WATER_CALDERA_SOL_SUMERGIDO';
function opening({frame,target,hp,absorption=0,absoluteImmune=false,random,roll}){
 if(typeof absoluteImmune!=='boolean'||(frame.root!=='AGUA'&&!frame.authorizedUltimates?.includes(UID)))fail('A08_CALDERA_AUTHORITY_SCOPE');
 const q=frame.foundation,qualityBonus=q?q.directDamageBonusPercent:0;if(q&&(frame.stage!=='ZhuJi'||typeof q.commitId!=='string'||q.commitId.length<8||{"AGRIETADA": 0, "ESTABLE": 3, "IMPECABLE": 6, "CELESTIAL": 9}[q.quality]!==qualityBonus))fail('B3_CALDERA_FOUNDATION_FRAME_SCOPE');
 if(absorption!==0)fail('BLOCKED_CALDERA_FOREIGN_TARGET_POOL');
 const initialHP=hp,packets=[];let current=hp,pressure=0,scald=false;
 function phase(dice,name,precision=0,pen=0,critBonus=0){
  if(current<=0)return freeze({name,status:'NOT_RESOLVED_TARGET_TERMINAL',hit:false,critical:false,result:null});
  const amount=roll(dice),hit=random()*100<C.hit(frame.stats.PRECISION.value+precision,target.evasion);let critical=false,result={kind:'DIRECT',actualHPDamage:0,hpAfter:current,absorptionAfter:0,killed:false};
  if(hit){critical=random()*100<Math.min(100,Math.max(0,frame.stats.CRIT_CHANCE.value+critBonus));result=C.direct({receiver:typeof target==='undefined'?(typeof nativeReceiver==='undefined'?undefined:nativeReceiver):target.r52NativeReceiver,portions:[{base:amount,flat:0,percents:[qualityBonus+frame.rootDamagePercent+(frame.modifiers.technique_direct_damage_percent||[]).reduce((n,m)=>n+m.amount,0)],tags:['DIRECT','TECHNIQUE','ULTIMATE','AGUA']}],received:{},critical,critMultiplier:frame.stats.CRIT_DAMAGE.value,defense:target.defense,shred:0,percentPen:frame.stats.PERCENT_PENETRATION.value+pen,flatPen:frame.stats.FLAT_PENETRATION.value,absorption:0,currentHP:current});}
  const p=freeze({name,hit,critical,rolled:amount,precisionBonus:precision,penetrationBonus:pen,criticalBonus:critBonus,result});packets.push(p);current=result.hpAfter;return p;
 }
 phase('1d7+9','CALDERA_1');
 const effectiveTenacity=current>0&&!absoluteImmune&&target.controlTenacity?target.controlTenacity():target.tenacity,probability=C.control(80,frame.stats.CONTROL.value,effectiveTenacity),attempted=current>0,controlRoll=attempted&&!absoluteImmune?random()*100:null,success=attempted&&!absoluteImmune&&controlRoll<probability,control=freeze({base:80,actorControl:frame.stats.CONTROL.value,modifiers:0,tenacity:effectiveTenacity,probability,roll:controlRoll,success,absoluteImmune,attempted,authority:'HUMAN_SPECIFIC_20261021_CALDERA_ONLY'});
 if(success)pressure++;
 const second=phase('1d7+11','CALDERA_2',20);
 if(second.result?.actualHPDamage>0){pressure++;scald=true;}
 const dice=pressure>=2?'1d9+24':pressure===1?'1d8+19':'1d7+15';
 phase(dice,'CALDERA_3',0,40,pressure>=2?20:pressure===1?10:0);
 return freeze({uid:UID,packets,hpAfter:current,absorptionAfter:0,actualHPDamage:initialHP-current,killed:initialHP>0&&current===0,bleeds:[],metalPending:false,caldera:true,control,pressure,scald:scald?{family:'SCALD',flat:3,ticks_left:2,source:UID}:null,costQI:Math.floor(15*frame.rootQICostMultiplier+.5),echoCreated:false,concordanceTriggered:false,formationCreated:false,phasesAreOneAction:true,extraHostileTurns:0});
}
return Object.freeze({UID,opening});
});
