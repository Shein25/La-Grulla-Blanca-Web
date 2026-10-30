(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'),require('./aoe-lower.js'));else root.ASTRA_A08_AOE_V12=factory(root.ASTRA_A08_SHARED,root.ASTRA_A08_AOE_LOWER);})(globalThis,function(S,L){
'use strict';const {copy,freeze,fail}=S;
// Encounter-local semantic effects from LIV15/V12. No imported E1 resolver,
// laboratory actors, tech_scalar, synthetic immunity, or independent RNG.
function create({data,readPurchased}){
 const lower=L.create({readPurchased});
 const designs=Object.fromEntries(data.design.nodes.map(n=>[n.id,n])),allowed=new Set(data.authority.fifteen_purchased_T3);
 if(allowed.size!==15||data.authority.human_ratification.decision!=='APPROVE_CODEX_AOE_V12_FOR_INTEGRATION')fail('A08_V12_AUTHORITY');
 let state={marks:{},tokens:{},burns:{},pulses:{},stats:{},shields:{},cooldowns:{},counts:{},thermal:{},seen:[]};
 function node(root){return [...allowed].find(id=>designs[id].root===root&&readPurchased().includes(id))||null;}
 function value(id,key){const revised={circulo_t3_dot:{pulse:2},marea_t3_debuff:{precision:14},lluvia_t3_direct:{crit:30},tijera_t3_direct:{direct:60}};if(Object.hasOwn(revised[id]||{},key))return revised[id][key];const p=designs[id]?.parameters;if(!p||!Object.hasOwn(p,key))fail('A08_V12_PARAMETER_SOURCE:'+id+'/'+key);return data.selected[id]==='B'&&Object.hasOwn(p,key+'_B')?p[key+'_B']:p[key];}
 function expire(round){for(const registry of [state.marks,state.tokens,state.pulses,state.stats])for(const [key,v]of Object.entries(registry))if(v.expires<round)delete registry[key];}
 const key=(id,lifeId)=>id+'|'+lifeId;
 function mark(id,lifeId,round,extra={}){state.marks[key(id,lifeId)]={node:id,lifeId,expires:round+4,...extra};}
 function stat(id,lifeId,round,field,amount,turns=2){state.stats[key(id,lifeId)+':'+field]={node:id,lifeId,field,amount,expires:round+turns-1};}
 function token(id,style,round,extra={}){const count=state.counts[id]||0,cap=designs[id].parameters.cap||3;if(state.tokens[id]||count>=cap)return;state.tokens[id]={node:id,style,expires:round+2,...extra};if(!['tijera_t3_direct','temblor_t3_prep'].includes(id))state.counts[id]=count+1;}
 function ready(id,round,cd){return round-(state.cooldowns[id]??-1000)>=cd;}
 function quote(compiled,{round,qi,maxQI}){const lq=lower.quote(compiled,{round}),out=copy(lq.compiled),id=node(out.root),t=state.tokens[id],style=out.targeting==='AOE'?'AOE':!out.choices?.length&&!out.defensive?'UNITARY':'OTHER',eligible=!!t&&t.expires>=round&&(t.style===style||t.style==='FLEX')&&!out.defensive;
  const used=[];if(eligible){let discount=t.discount||0,precision=t.precision||0;if(id==='marea_t3_eff'){const low=qi<=maxQI*.5;discount=low?value(id,'discount'):0;precision=low?0:value(id,'precision');}out.qi_cost=Math.max(1,out.qi_cost-discount);out.precision_mod+=precision;out.direct_pct+=t.direct||0;used.push(id);}
  const priorBurn=copy(state.burns);return {compiled:out,used,root:out.root,style,node:id,priorBurn,round,lower:{...lq,priorBurn}};
 }
 function paid(q,{actionId,actor}){expire(q.round);if(state.seen.includes(actionId))fail('A08_V12_ACTION_REPLAY');state.seen.push(actionId);if(state.seen.length>512)state.seen.shift();lower.paid(q.lower,actionId);for(const id of q.used){if(!state.tokens[id])fail('A08_V12_TOKEN_STALE');delete state.tokens[id];if(['tijera_t3_direct','temblor_t3_prep'].includes(id))state.counts[id]=(state.counts[id]||0)+1;if(q.style==='UNITARY'&&id==='temblor_t3_prep')actor('DEF',value(id,'defense')+2,2,id);if(q.style==='UNITARY'&&id==='tijera_t3_direct')actor('EVASION',12,2,id);}}
 function packet({compiled,lifeId,round,hp,maxHP,critChance,liveCount}){expire(round);const lowerPacket=lower.packet({compiled,lifeId,round,liveCount});const id=compiled.targeting==='AOE'?node(compiled.root):null,m=state.marks[key(id,lifeId)],out={precision:0,direct:0,flatPen:0,crit:0,critDamage:0,...lowerPacket};if(!id||!m)return out;
  if(id==='circulo_t3_direct'){out.direct+=value(id,'direct');if(hp/maxHP<=.6)out.flatPen=value(id,'penetration');}
  else if(id==='marea_t3_direct'){out.direct+=value(id,'direct');out.flatPen=value(id,'penetration');}
  else if(id==='lluvia_t3_direct'){out.crit=Math.min(value(id,'crit'),Math.max(0,35-critChance-(compiled.crit_pp||0)));out.critDamage=.35;}
  else if(id==='temblor_t3_direct'&&m.layers>=2){out.direct+=value(id,'direct');out.flatPen=value(id,'penetration');}
  else return out;
  delete state.marks[key(id,lifeId)];return out;
 }
 function after(q,{actionId,round,impacts,actorMaxHP,actor=()=>{},resolvePrior=()=>{fail('A08_PRIOR_BURN_RESOLVER_REQUIRED');},paidQI}){if(!state.seen.includes(actionId))fail('A08_V12_UNPAID_EVIDENCE');
  lower.after(q.lower,{actionId,round,impacts,actor,actorMaxHP,paidQI,burns:state.burns,shield:(id,n)=>{state.shields[id]=n;},putBurn:(life,id,burn)=>{(state.burns[life]||={})[id]=burn;},resolvePrior:(life,potency,source)=>{const r=resolvePrior(life,potency,source),p=impacts.find(p=>p.lifeId===life);if(p)p.hpAfter=r.hpAfter;return r;}});
  if(q.style!=='AOE'||!q.node)return;
  const id=q.node,hits=impacts.filter(p=>p.actualHPDamage>0&&p.hpAfter>0),multi=new Set(impacts.filter(p=>p.actualHPDamage>0).map(p=>p.lifeId)).size>=2;if(!multi)return;
  if(id==='circulo_t3_dot')for(const p of hits){const previous=q.priorBurn[p.lifeId]||{},current=state.burns[p.lifeId]||{},sources=Object.keys(previous).filter(s=>current[s]).sort();if(sources.length&&!state.pulses[p.lifeId])state.pulses[p.lifeId]={node:id,lifeId:p.lifeId,source:sources[0],bonus:value(id,'pulse'),expires:round+1};else if(!Object.keys(current).length)(state.burns[p.lifeId]||={})[id]={node:id,potency:2,ticks:2,actionId};}
  else if(id==='circulo_t3_direct'){const sorted=[...hits].sort((a,b)=>a.hpAfter-b.hpAfter||a.order-b.order);if(sorted.length){mark(id,sorted[0].lifeId,round);const second=sorted.filter(p=>p!==sorted[0]&&p.hpAfter<=p.maxHP*.6)[0];if(second)mark(id,second.lifeId,round);}}
  else if(id==='circulo_t3_eff'){if(ready(id,round,3)&&(state.counts[id]||0)<2){state.shields[id]=value(id,'shield');state.cooldowns[id]=round;state.counts[id]=(state.counts[id]||0)+1;state.thermal[id]={absorbed:0,rebate:false};}}
  else if(id==='marea_t3_debuff')for(const p of hits){if(state.marks[key(id,p.lifeId)])stat(id,p.lifeId,round,'precision',-value(id,'precision'));mark(id,p.lifeId,round,{wet:true});}
  else if(id==='marea_t3_direct'){const p=[...hits].sort((a,b)=>b.hpAfter-a.hpAfter||a.order-b.order)[0];if(p)mark(id,p.lifeId,round);}
  else if(id==='marea_t3_eff')token(id,'AOE',round);
  else if(id==='tijera_t3_int'){const previous=hits.filter(p=>state.marks[key(id,p.lifeId)]);if(previous.length>=2)state.marks[key(id,previous[0].lifeId)].redirectTo=previous.at(-1).lifeId;for(const p of hits){const old=state.marks[key(id,p.lifeId)];mark(id,p.lifeId,round,old?.redirectTo?{redirectTo:old.redirectTo}:{});}}
  else if(id==='tijera_t3_direct')token(id,'UNITARY',round,{direct:value(id,'direct'),precision:value(id,'precision'),discount:2});
  else if(id==='tijera_t3_flow')token(id,'FLEX',round,{discount:value(id,'discount')});
  else if(id==='lluvia_t3_break')for(const p of hits){const layers=Math.min(3,(state.marks[key(id,p.lifeId)]?.layers||0)+1);mark(id,p.lifeId,round,{layers});stat(id,p.lifeId,round,'defense',-layers*value(id,'defense'));}
  else if(id==='lluvia_t3_direct'){for(const p of hits)if(!p.critical)mark(id,p.lifeId,round);}
  else if(id==='lluvia_t3_eff'){if(hits.length>=2&&!hits.some(p=>p.critical)&&ready(id,round,4)){token(id,'AOE',round,{discount:value(id,'discount')});state.cooldowns[id]=round;}}
  else if(id==='temblor_t3_debuff')for(const p of hits){mark(id,p.lifeId,round,{weak:true});stat(id,p.lifeId,round,'evasion',-value(id,'evasion'));}
  else if(id==='temblor_t3_direct')for(const p of hits)mark(id,p.lifeId,round,{layers:Math.min(2,(state.marks[key(id,p.lifeId)]?.layers||0)+1)});
  else if(id==='temblor_t3_prep')token(id,'UNITARY',round,{precision:value(id,'precision'),discount:2});
 }
 function enemyStats(lifeId,stats,round){expire(round);const out=lower.enemyStats(lifeId,stats,round);for(const m of Object.values(state.stats))if(m.lifeId===lifeId)out[m.field]+=m.amount;return out;}
 function enemyStart(lifeId,round,resolveDot){expire(round);const events=[],burns=state.burns[lifeId]||{},pulse=state.pulses[lifeId];delete state.pulses[lifeId];for(const id of Object.keys(burns).sort()){const burn=burns[id],bonus=pulse?.source===id?pulse.bonus:0,result=resolveDot(burn.potency+bonus);events.push({node:id,bonus,result});burn.ticks--;if(burn.ticks<=0)delete burns[id];if(result.hpAfter===0)break;}return events;}
 function enemyRaw(lifeId,raw,round,{alive,collision}){expire(round);raw=lower.enemyRaw(lifeId,raw,round,{alive,collision});const wind=node('viento'),w=state.marks[key(wind,lifeId)];if(wind==='tijera_t3_int'&&w?.redirectTo){const to=w.redirectTo;delete w.redirectTo;if(to!==lifeId&&alive(to)){const moved=Math.min(raw*.25,value(wind,'redirect_cap'));collision(to,moved);raw-=moved;}}const earth=node('tierra'),e=state.marks[key(earth,lifeId)];if(earth==='temblor_t3_debuff'&&e?.weak){e.weak=false;raw-=Math.min(raw,value(earth,'raw_reduction'));}return raw;}
 function shield(){return Object.values(state.shields).reduce((a,n)=>a+n,0);}
 function absorb(amount,round){let remaining=amount,used=0;for(const id of Object.keys(state.shields)){const n=Math.min(remaining,state.shields[id]);state.shields[id]-=n;remaining-=n;used+=n;if(n&&id==='circulo_t3_eff'){const t=state.thermal[id];t.absorbed+=n;if(t.absorbed>=4&&!t.rebate&&!state.tokens[id]){t.rebate=true;state.tokens[id]={node:id,style:'AOE',discount:2,expires:round+2};}}}return used;}
 return Object.freeze({serializeCombat(){return freeze({version:1,owner:'aoe-v12',state:copy(state),seen:[],lower:lower.serializeCombat()});},restoreCombat(raw){globalThis.LGB_ORDINARY_CODEC.validateOwner(raw,'aoe-v12');state=copy(raw.state);lower.restoreCombat(raw.lower);},pressureAttempt:o=>lower.pressureAttempt(o),enemyVoluntary:(id,resolve)=>lower.voluntary(id,resolve),previousSumersion:id=>lower.previousSumersion(id),quote,paid,packet,after,enemyStats,enemyStart,enemyRaw,shield,absorb,basicQuote:round=>lower.basicQuote(round),paidBasic:(q,id)=>lower.paidBasic(q,id),enemyMiss:(id,round,refund)=>lower.enemyMiss(id,round,refund),endPhase(){state.shields={};lower.endPhase();},value,checkpoint(){const old=copy(state),undo=lower.checkpoint();return()=>{state=old;undo();};},inspect:()=>freeze({...copy(state),lower:lower.inspect()})});
}
return Object.freeze({create});
});
