(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./shared.js'));else root.ASTRA_R58_ECOLOGY=factory(root.ASTRA_A08_SHARED);})(globalThis,function(S){
'use strict';const {copy,freeze,fail}=S,THRESHOLDS=[20,45,70,90],FLOORS=[0,1,1,2,3];
const int=(n,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const id=x=>typeof x==='string'&&x.trim()===x&&x.length>0&&x.length<=512;
function advancePopulation({populationState,now,event=null,speciesConfig}){
 const p=copy(populationState),c=speciesConfig;S.exact(p,['populationId','speciesId','territoryId','pressure','lastUpdate','recentEventIds','maxTierReached']);
 if(!id(p.populationId)||!id(p.speciesId)||!id(p.territoryId)||!int(p.pressure,100)||!int(p.lastUpdate)||!int(p.maxTierReached,4)||!int(now)||now<p.lastUpdate)fail('R58_ECOLOGY_STATE_CLOCK');
 if(!c||(!int(c.pressurePerKill)||c.pressurePerKill===0)||!int(c.decayPerTimeUnit)||!int(c.dedupWindowSize,20000)||c.dedupWindowSize<1)fail('R58_ECOLOGY_CONFIG_REQUIRED');
 if(!Array.isArray(p.recentEventIds)||p.recentEventIds.length>c.dedupWindowSize||p.recentEventIds.some(x=>!id(x))||new Set(p.recentEventIds).size!==p.recentEventIds.length)fail('R58_ECOLOGY_FIFO');
 // Locality is checked before decay, deduplication, or any evolution.
 if(event){S.exact(event,['eventId','type','populationId','occurredAt']);if(!id(event.eventId)||event.type!=='SPECIES_KILLED'||event.populationId!==p.populationId)fail('R58_ECOLOGY_EVENT_LOCALITY');}
 const elapsed=now-p.lastUpdate,decay=elapsed*c.decayPerTimeUnit;
 // No overflowing multiplication is needed to compute a clamped pressure.
 p.pressure=decay>=p.pressure?0:p.pressure-decay;p.lastUpdate=now;
 let applied=false;if(event&&!p.recentEventIds.includes(event.eventId)){p.pressure=Math.min(100,p.pressure+c.pressurePerKill);p.recentEventIds=[...p.recentEventIds,event.eventId].slice(-c.dedupWindowSize);applied=true;}
 const pressureTier=THRESHOLDS.filter(t=>p.pressure>=t).length;p.maxTierReached=Math.max(p.maxTierReached,pressureTier);const effectiveTier=Math.max(pressureTier,FLOORS[p.maxTierReached]);
 return freeze({populationState:p,pressureTier,effectiveTier,applied});
}
function create({resolveDeath,resolvePopulation,configBySpecies,readClock,readGeneration,sourceHash}){
 let populations=new Map(),credited=new Set(),observed=new Set();
 function kill(cap){const d=resolveDeath(cap);if(!d||d.generation!==readGeneration()||!d.life?.terminal||d.life.hp!==0||d.life.lifeId!==d.lifeId||!id(d.actionId))fail('R58_ECOLOGY_PRIVATE_COMMITTED_DEATH');if(observed.has(d.lifeId))fail('R58_ECOLOGY_HISTORICAL_REPLAY');
  const mapping=resolvePopulation(d),config=configBySpecies[d.life.id];
  if(!mapping||!config){observed.add(d.lifeId);return freeze({status:'BLOCKED_CONFIG_FIELDS',lifeId:d.lifeId,speciesId:d.life.id,missing:[...(!mapping?['canonicalTerritoryPopulationBinding']:[]),...(!config?['pressurePerKill','decayPerTimeUnit','dedupWindowSize']:[])],pressureCredited:false});}
  const now=readClock(),populationId=mapping.populationId;if(!id(populationId)||!id(mapping.territoryId))fail('R58_ECOLOGY_BINDING');
  const prior=populations.get(populationId)||{populationId,speciesId:d.life.id,territoryId:mapping.territoryId,pressure:0,lastUpdate:now,recentEventIds:[],maxTierReached:0};if(prior.speciesId!==d.life.id||prior.territoryId!==mapping.territoryId)fail('R58_ECOLOGY_POPULATION_ALIAS');
  const event={eventId:'kill:'+d.lifeId,type:'SPECIES_KILLED',populationId,occurredAt:now},result=advancePopulation({populationState:prior,now,event,speciesConfig:config});populations.set(populationId,copy(result.populationState));credited.add(d.lifeId);observed.add(d.lifeId);return freeze({status:'APPLIED',lifeId:d.lifeId,event,...result});
 }
 function tier(life){const mapping=resolvePopulation({life});if(!mapping)return 0;const p=populations.get(mapping.populationId),config=configBySpecies[life.id];if(!p||!config)return 0;return advancePopulation({populationState:p,now:readClock(),speciesConfig:config}).effectiveTier;}
 function snapshot(){return freeze({version:1,sourceHash,generation:readGeneration(),populations:[...populations.values()].map(copy),creditedLifeIds:[...credited]});}
 function restore(raw,lives){S.exact(raw,['version','sourceHash','generation','populations','creditedLifeIds']);if(raw.version!==1||raw.generation!==readGeneration()||raw.sourceHash!==sourceHash||!Array.isArray(raw.populations)||raw.populations.length>20000||!Array.isArray(raw.creditedLifeIds)||raw.creditedLifeIds.length>20000||new Set(raw.creditedLifeIds).size!==raw.creditedLifeIds.length)fail('R58_ECOLOGY_RESTORE');const next=new Map();for(const p of raw.populations){if(next.has(p.populationId)||!configBySpecies[p.speciesId])fail('R58_ECOLOGY_RESTORE_CONFIG');advancePopulation({populationState:p,now:readClock(),speciesConfig:configBySpecies[p.speciesId]});next.set(p.populationId,copy(p));}for(const id of raw.creditedLifeIds){const l=lives.find(l=>l.lifeId===id);if(!l?.terminal||l.hp!==0||!l.r58EcologyDeath||l.r58EcologyDeath.status!=='APPLIED')fail('R58_ECOLOGY_CREDIT_PROVENANCE');}populations=next;credited=new Set(raw.creditedLifeIds);observed=new Set(lives.filter(l=>l.terminal&&l.r58EcologyDeath).map(l=>l.lifeId));}
 function checkpoint(){const p=copy([...populations]),ids=new Set(credited),seen=new Set(observed);return ()=>{populations=new Map(p);credited=new Set(ids);observed=new Set(seen);};}
 return freeze({kill,tier,snapshot,restore,checkpoint});
}
return freeze({advancePopulation,create,THRESHOLDS,FLOORS});
});
