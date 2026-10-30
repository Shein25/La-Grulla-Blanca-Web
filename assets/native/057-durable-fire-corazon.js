(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'),require('./combat.js'));else root.ASTRA_A08_CORAZON=factory(root.ASTRA_A08_SHARED,root.ASTRA_A08_COMBAT);})(globalThis,function(S,C){
'use strict';const {copy,freeze,fail,number}=S,UID='FIRE_CORAZON_MONTANA_ARDIENTE';
function eruption({frame,target,hp,absorption=0,pressure,violent,random}){number(pressure,'CORAZON_PRESSURE');if(hp<=0||typeof violent!=='boolean')fail('A08_CORAZON_PACKET_SCOPE');const base=Math.floor((6+1.35*pressure)*(violent?1.2:1)+.5),critical=random()*100<frame.stats.CRIT_CHANCE.value;
 const result=C.direct({receiver:typeof target==='undefined'?(typeof nativeReceiver==='undefined'?undefined:nativeReceiver):target.r52NativeReceiver,portions:[{base,flat:0,percents:[frame.rootDamagePercent+(frame.modifiers.technique_direct_damage_percent||[]).reduce((a,x)=>a+x.amount,0)],tags:['DIRECT','TECHNIQUE','ULTIMATE','FUEGO','SOURCE_DEFERRED_AOE']}],received:{},critical,critMultiplier:frame.stats.CRIT_DAMAGE.value,defense:target.defense,shred:0,percentPen:frame.stats.PERCENT_PENETRATION.value+25,flatPen:frame.stats.FLAT_PENETRATION.value,absorption,currentHP:hp});
 return freeze({base,critical,hit:true,result,accuracyRerolls:0,extraAction:false,extraQI:0,echoCreated:false});
}
function create(){let s={armed:false,capacity:0,reserve:0,pressure:0,hostiles:0,compressed:false,controlUsed:false,closed:false,violent:false,seen:[],ownerAction:null};
 function arm(maxHP){if(s.armed||!Number.isFinite(maxHP)||maxHP<=0)fail('A08_CORAZON_ARM_SCOPE');s.armed=true;s.capacity=s.reserve=Math.floor(.35*maxHP+.5);return s.reserve;}
 function ownerResolved(actionId,reserveAfter){if(!s.armed||s.closed)return;number(reserveAfter,'CORAZON_RESERVE');if(s.ownerAction===actionId||reserveAfter>s.reserve)fail('A08_CORAZON_OWNER_REPLAY_OR_POOL_MINT');s.ownerAction=actionId;s.reserve=reserveAfter;}
 function afterHostile({actionId,reserveBefore,reserveAfter,playerAlive}){if(!s.armed||s.closed)return freeze({status:'INACTIVE'});for(const n of [reserveBefore,reserveAfter])number(n,'CORAZON_RESERVE');if(typeof actionId!=='string'||!actionId||typeof playerAlive!=='boolean'||s.seen.includes(actionId)||reserveBefore!==s.reserve||reserveAfter>reserveBefore)fail('A08_CORAZON_HOSTILE_EVIDENCE');s.seen.push(actionId);s.pressure+=reserveBefore-reserveAfter;s.reserve=reserveAfter;s.hostiles++;if(s.pressure>=s.capacity*.5)s.compressed=true;
  if(!playerAlive){s.closed=true;s.reserve=0;return freeze({status:'PLAYER_TERMINAL',erupt:false});}
  if(s.reserve===0||s.hostiles===2){s.violent=s.reserve===0;s.closed=true;s.reserve=0;return freeze({status:'ERUPTION_DUE',erupt:true,pressure:s.pressure,violent:s.violent,hostiles:s.hostiles});}
  return freeze({status:'WINDOW_ACTIVE',erupt:false,hostiles:s.hostiles,pressure:s.pressure,compressed:s.compressed});
 }
 // One genuine incoming Control attempt, if its future native issuer is bound.
 // No invented attempt is created to consume this reduction.
 function controlPower({attemptId,base}){number(base,'CORAZON_CONTROL_BASE');if(!s.armed||s.closed||!s.compressed||s.controlUsed)return freeze({base,reduced:false});if(typeof attemptId!=='string'||!attemptId)fail('A08_CORAZON_CONTROL_EVIDENCE');s.controlUsed=true;return freeze({base:base*.5,reduced:true,attemptId});}
 return Object.freeze({serializeCombat(){return freeze({version:1,owner:'fire-corazon',state:copy(s),seen:[]});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'fire-corazon');s=copy(raw.state);},arm,ownerResolved,afterHostile,controlPower,active:()=>s.armed&&!s.closed,checkpoint(){const old=copy(s);return()=>{s=old;};},inspect:()=>freeze(copy(s))});
}
return Object.freeze({UID,eruption,create});
});
