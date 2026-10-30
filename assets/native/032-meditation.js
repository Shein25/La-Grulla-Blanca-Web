(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_MEDITATION=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {fail,integer,number,exact,copy,freeze}=S;
function initial(stage){return {version:1,stage,credit:0,commits:0,lastActionId:null};}
function validate(policy,raw,stage,generation){const s=copy(raw);exact(s,['version','stage','credit','commits','lastActionId']);if(s.version!==1||s.stage!==stage||!policy.cultivationTargets[stage])fail('A08_CULTIVATION_SCHEMA');integer(s.credit,'CULTIVATION_CREDIT');integer(s.commits,'MEDITATION_COMMITS');if(s.credit>policy.cultivationTargets[stage]||s.credit>0&&s.commits===0||s.commits===0&&s.lastActionId!==null||s.commits>0&&s.lastActionId!==generation+':meditation:'+s.commits)fail('A08_CULTIVATION_CAUSE');return s;}
function credit(policy,state,{stage,generation,actionId,gain,success,interrupted}){const s=validate(policy,state,stage,generation);integer(gain,'MEDITATION_GAIN');if(!gain||success!==true||interrupted!==false||actionId!==generation+':meditation:'+(s.commits+1))fail('A08_MEDITATION_COMMIT_REQUIRED');s.credit=Math.min(policy.cultivationTargets[stage],s.credit+gain);s.commits++;s.lastActionId=actionId;return freeze(s);}
// Pure, source-derived arithmetic. No turns, RNG, grants or public flags here.
function resolve(policy,{root,vein,saturation,hp,qi,maxHP,maxQI,wounds,impurities,methodBonus=0,equipmentBonus=0,deep=false,random,roll}){
 const rate=policy.rates[root];if(!rate)fail('BLOCKED_MEDITATION_ROOT_RATE:'+root);
 for(const [k,v]of Object.entries({hp,qi,maxHP,maxQI,wounds,impurities,methodBonus,equipmentBonus,saturation}))number(v,'MEDITATION_'+k);if(!Number.isInteger(saturation)||hp<=0||hp>maxHP||qi>maxQI||typeof deep!=='boolean')fail('A08_MEDITATION_CONTEXT');
 const v=policy.veins[vein];if(!v)fail('A08_MEDITATION_VEIN_SOURCE');
 const base=Math.round(rate.qi*v.mult),satIndex=Math.min(saturation,policy.saturation.length-1),sat=policy.saturation[satIndex];
 const unchanged={hpAfter:hp,qiAfter:qi,gain:0,physicalGain:0,healing:0,creditable:false,saturationAfter:saturation,deep,base,saturationMultiplier:sat};
 if(v.diente){const damage=random()<policy.risk.hostileBite?1+Math.floor(random()*2):0;return freeze({...unchanged,status:'HOSTILE_VEIN',hpAfter:Math.max(1,hp-damage),damage});}
 if(base===0)return freeze({...unchanged,status:'NO_QI_SOURCE'});
 if(sat===0)return freeze({...unchanged,status:'VEIN_EXHAUSTED'});
 let gain=Math.max(1,Math.round(base*sat))+methodBonus+equipmentBonus;if(wounds>0)gain=Math.max(1,gain-wounds);
 if(deep){const risk=Math.min(policy.risk.maximum,policy.risk.base+policy.risk.impurity*impurities);if(random()*100<risk){const loss=Math.min(Math.floor(qi*.3),qi),damage=qi>0?roll('1d4'):0;return freeze({...unchanged,status:'FAILED_DEEP_MEDITATION',risk,qiAfter:qi-loss,hpAfter:Math.max(1,hp-damage),loss,damage});}gain+=Math.max(1,Math.round(base*sat));}
 const qiAfter=Math.min(maxQI,qi+gain),physicalGain=qiAfter-qi,healing=physicalGain>0?Math.min(maxHP-hp,rate.hp):0;
 return freeze({...unchanged,status:'COMMITTED',gain,qiAfter,physicalGain,hpAfter:hp+healing,healing,creditable:true,saturationAfter:satIndex+1});
}
return Object.freeze({initial,validate,credit,resolve});
});
