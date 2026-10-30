(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_A08_MANDATO=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail,number}=S,UID='METAL_MANDATO_MONTANA_HIERRO';
// V262 -> V257 -> V235.12 -> mass.sim_mandato M4_DEEP_STRATA_PARETO.
// Cimiento/stratum reserves persist in the encounter; only Nucleo expires.
function create(){let s={armed:false,cap:0,restoreLimit:0,nucleusCap:0,base:0,nucleus:0,hostiles:0,nucleusActions:0,pressure:0,nucleusGranted:false,closed:false,seen:[],lastOwner:null};
 function total(){return s.base+s.nucleus;}
 function arm(maxHP){number(maxHP,'MANDATO_MAX_HP');if(s.armed||maxHP<=0)fail('A08_MANDATO_ARM_SCOPE');s.armed=true;s.cap=s.base=Math.floor(maxHP*.35+.5);s.restoreLimit=Math.floor(maxHP*.15+.5);s.nucleusCap=Math.floor(maxHP*.4+.5);return total();}
 function consume(reserveAfter){number(reserveAfter,'MANDATO_RESERVE');if(reserveAfter>total())fail('A08_MANDATO_FOREIGN_POOL_GROWTH');let loss=total()-reserveAfter;const first=Math.min(s.base,loss);s.base-=first;loss-=first;s.nucleus-=loss;}
 function phase(){if(!s.armed||s.closed)return null;if(s.hostiles<3)return freeze({kind:'CIMIENTO_ESTRATO',index:s.hostiles,receivedPercent:[-45,-65,-65][s.hostiles],tenacityBonus:[30,35,40][s.hostiles]});return freeze({kind:'NUCLEO',index:3+s.nucleusActions,receivedPercent:-65,tenacityBonus:40});}
 function ownerResolved(actionId,reserveAfter){if(!s.armed)return;if(typeof actionId!=='string'||!actionId||s.lastOwner===actionId)fail('A08_MANDATO_OWNER_REPLAY');consume(reserveAfter);s.lastOwner=actionId;}
 function afterHostile({actionId,reserveBefore,reserveAfter,actualHPDamage,direct,playerAlive}){
  if(!s.armed)return freeze({status:'INACTIVE'});number(reserveBefore,'MANDATO_RESERVE');number(reserveAfter,'MANDATO_RESERVE');number(actualHPDamage,'MANDATO_HP_DAMAGE');if(typeof actionId!=='string'||!actionId||s.seen.includes(actionId)||typeof direct!=='boolean'||typeof playerAlive!=='boolean'||reserveBefore!==total())fail('A08_MANDATO_HOSTILE_EVIDENCE');
  const current=phase();s.seen.push(actionId);consume(reserveAfter);if(!current)return freeze({status:'POST_WINDOW_RESERVE_SYNC',reserve:total(),restored:0});
  if(!playerAlive){s.closed=true;s.base=s.nucleus=0;return freeze({status:'PLAYER_TERMINAL',reserve:0,restored:0,offensivePackets:0});}
  const qualified=direct&&(reserveBefore>reserveAfter||actualHPDamage>0);let restored=0;s.hostiles++;
  if(current.kind==='CIMIENTO_ESTRATO'){if(qualified)s.pressure++;restored=Math.min(s.restoreLimit,Math.max(0,s.cap-total()));s.base+=restored;if(s.hostiles===3){if(s.pressure===3){s.nucleus=s.nucleusCap;s.nucleusGranted=true;}else s.closed=true;}}
  else if(++s.nucleusActions===2){s.nucleus=0;s.closed=true;}
  return freeze({status:s.closed?'WINDOW_CLOSED':'WINDOW_ACTIVE',phase:current,qualified,pressure:s.pressure,restored,reserve:total(),nucleusGranted:s.nucleusGranted,nucleusActions:s.nucleusActions,nonDirectBoundary:!direct,offensivePackets:0,extraAction:false,extraQI:0,echoCreated:false});
 }
 return Object.freeze({serializeCombat(){return freeze({version:1,owner:'metal-mandato',state:copy(s),seen:[]});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'metal-mandato');s=copy(raw.state);},arm,phase,ownerResolved,afterHostile,reserve:total,ownsReserve:()=>s.armed&&(!s.closed||total()>0),checkpoint(){const before=copy(s);return()=>{s=before;};},inspect:()=>freeze(copy(s))});
}
return Object.freeze({UID,create});
});
