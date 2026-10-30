(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'),require('./combat.js'));else root.ASTRA_A08_COMETA=factory(root.ASTRA_A08_SHARED,root.ASTRA_A08_COMBAT);})(globalThis,function(S,C){
'use strict';const {copy,freeze,fail}=S,UID='WIND_COMETA_CARMESI_NUEVE_CIELOS';
// V262 -> V235.5 -> V031 sim_cometa_fixed. No macro runs future player turns.
function packet({frame,target,hp,absorption=0,imp=null,random,roll}){
 if(imp!==null&&(!Number.isInteger(imp)||imp<1||imp>3))fail('A08_COMETA_IMP');
 const opening=imp===null,[lo,hi]=opening?[18,26]:({1:[18,24],2:[26,36],3:[38,52]})[imp],amount=roll('1d'+(hi-lo+1)+'+'+(lo-1));
 const unavoidable=imp===3,precision=opening||unavoidable?20:0,hit=unavoidable||random()*100<C.hit(frame.stats.PRECISION.value+precision,target.evasion);
 let critical=false,result={actualHPDamage:0,hpAfter:hp,absorptionAfter:absorption,killed:false};
 if(hit){critical=random()*100<Math.min(100,frame.stats.CRIT_CHANCE.value+(unavoidable?15:0));result=C.direct({receiver:typeof target==='undefined'?(typeof nativeReceiver==='undefined'?undefined:nativeReceiver):target.r52NativeReceiver,portions:[{base:amount,flat:0,percents:[frame.rootDamagePercent+(frame.modifiers.technique_direct_damage_percent||[]).reduce((n,p)=>n+p.amount,0)],tags:['DIRECT','TECHNIQUE','ULTIMATE','VIENTO']}],received:{},critical,critMultiplier:frame.stats.CRIT_DAMAGE.value,defense:target.defense,shred:0,percentPen:frame.stats.PERCENT_PENETRATION.value,flatPen:frame.stats.FLAT_PENETRATION.value,absorption,currentHP:hp});}
 return freeze({hit,critical,result,range:[lo,hi],unavoidable,precisionBonus:precision,critBonus:unavoidable?15:0});
}
function create(){let state=null,seen=new Set();
 function arm({actionId,openingHit,cohort}){if(state||typeof actionId!=='string'||typeof openingHit!=='boolean'||!Array.isArray(cohort)||!cohort.length||cohort.length>3||new Set(cohort).size!==cohort.length||cohort.some(id=>typeof id!=='string'))fail('A08_COMETA_ARM');state={castActionId:actionId,cohort:copy(cohort),imp:openingHit?1:0,actions:0,supports:0,brasa:false,criticalGrants:0,brasaConsumptions:0,closed:false,climaxCount:0};seen.add(actionId);}
 const active=()=>!!state&&!state.closed;
 function legal(compiled,paidQI){return active()&&compiled?.root===['viento','fuego'][state.actions]&&compiled.targeting==='AOE'&&!compiled.defensive&&(Array.isArray(compiled.choices)&&compiled.choices.length>=1&&compiled.choices.length<=3)&&compiled.technique_id===['tijera_vendaval','circulo_cien_ascuas'][state.actions]&&paidQI>0;}
 function quote(compiled,paidQI){return freeze({eligible:legal(compiled,paidQI),damagePercent:legal(compiled,paidQI)&&state.brasa?10:0,expectedRoot:active()?['viento','fuego'][state.actions]:null});}
 function ownerResolved({actionId,compiled,paidQI,impacts,playerAlive}){if(!active())return freeze({status:'INACTIVE'});if(typeof actionId!=='string'||seen.has(actionId)||!Array.isArray(impacts)||typeof playerAlive!=='boolean')fail('A08_COMETA_RESOLVED_EVIDENCE');seen.add(actionId);
  // Designation is the first still-living ORIGINAL cohort actor, never highest damage.
  const designated=state.cohort.map(id=>impacts.find(p=>p.lifeId===id)).find(Boolean),eligible=legal(compiled,paidQI),consumed=eligible&&state.brasa;
  if(consumed){state.brasa=false;state.brasaConsumptions++;}if(eligible){state.supports++;if(designated?.hit)state.imp=Math.min(3,state.imp+1);if(designated?.critical){if(!designated.hit)fail('A08_COMETA_CRITICAL_WITHOUT_HIT');state.brasa=true;state.criticalGrants++;}}
  state.actions++;if(!playerAlive||state.actions===2)state.closed=true;
  const climax=state.closed&&playerAlive&&state.supports===2&&state.imp>0;if(climax){state.climaxCount++;state.brasa=false;}
  return freeze({status:climax?'CLIMAX_READY':state.closed?'WINDOW_CLOSED':'WINDOW_ACTIVE',imp:state.imp,eligible,supports:state.supports,actions:state.actions,brasaConsumed:consumed,cohort:copy(state.cohort),extraAction:false,extraQI:0,echoCreated:false});
 }
 return Object.freeze({serializeCombat(){return freeze({version:1,owner:'wind-cometa',state:copy(state),seen:[...seen]});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'wind-cometa');state=copy(raw.state);seen=new Set(raw.seen);},arm,active,quote,ownerResolved,inspect:()=>freeze(copy(state)),checkpoint(){const before=copy(state),ids=new Set(seen);return()=>{state=before;seen=ids;};}});
}
return Object.freeze({UID,create,packet});
});
