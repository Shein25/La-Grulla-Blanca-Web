(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ASTRA_R60_POPULATION_MEMORY=factory();})(globalThis,function(){
const{reconcilePopulationAdaptation}=(function(){
const ADAPTIVE_ECOLOGY_MILESTONE_STATUS='EXPERIMENTAL_V02_MILESTONE_FLOOR';

function tier(v,label){
  if(!Number.isInteger(v)||v<0||v>4)throw new RangeError(label+' debe ser entero 0..4');
  return v;
}

/**
 * Trinquete evolutivo:
 * maxReached 0 -> floor 0
 * maxReached 1 -> floor 1
 * maxReached 2 -> floor 1
 * maxReached 3 -> floor 2
 * maxReached 4 -> floor 3
 */
function consolidatedFloorFromMaxReached(maxTierReached){
  const max=tier(maxTierReached,'maxTierReached');
  if(max===0)return 0;
  if(max===1)return 1;
  return max-1;
}

function registerReachedTier({maxTierReached,reachedTier}){
  const max=tier(maxTierReached,'maxTierReached');
  const reached=tier(reachedTier,'reachedTier');
  return Math.max(max,reached);
}

function effectiveTierAfterDecay({pressureTier,maxTierReached}){
  const pressure=tier(pressureTier,'pressureTier');
  const max=tier(maxTierReached,'maxTierReached');
  const floor=consolidatedFloorFromMaxReached(max);
  return Math.max(pressure,floor);
}

function reconcilePopulationAdaptation({pressureTier,maxTierReached,reachedTier=pressureTier}){
  const nextMax=registerReachedTier({maxTierReached,reachedTier});
  const floorTier=consolidatedFloorFromMaxReached(nextMax);
  const effectiveTier=effectiveTierAfterDecay({pressureTier,maxTierReached:nextMax});
  return Object.freeze({
    pressureTier:tier(pressureTier,'pressureTier'),
    maxTierReached:nextMax,
    floorTier,
    effectiveTier
  });
}

return {reconcilePopulationAdaptation};})();
/**
 * LIV V157 — isolated territorial population-memory contract, NOT production.
 *
 * Population identity = [territoryId, speciesId]. No playerId, individualId,
 * spawnId, roomId or global species memory key. Territory comes from the
 * authoritative world resolver; this module never infers boundaries.
 *
 * Pressures and ecological tiers are supplied by the authorized Adaptive
 * Ecology subsystem. This lab DOES NOT invent thresholds, survival XP,
 * kill-based increments, timers, numerical buffs or combat probabilities.
 *
 * Resolved encounter observations are kept for subsequent specimens in
 * the SAME territory and species. No modifications to E1/HTML/Event Bus.
 */


const V157_POPULATION_GATE='LAB_ONLY_TERRITORY_SPECIES_NOT_RUNTIME';
const V157_RECENT_EVENT_LIMIT=512;
const V157_OBSERVATION_LIMIT=8;
const categories=new Set([
 'PLAYER_BASIC','PLAYER_UNITARGET_TECHNIQUE',
 'PLAYER_AOE_TECHNIQUE','PLAYER_DEFENSIVE_TECHNIQUE'
]);
const assert=(cond,msg)=>{if(!cond)throw new Error('V157_'+msg);};
function id(value,field) {
 assert(typeof value==='string'&&value.trim()===value&&value.length>0&&value.length<=256,
   'INVALID_'+field);
 return value;
}
function tier(value,field){
 assert(Number.isInteger(value)&&value>=0&&value<=4,'INVALID_'+field);
 return value;
}
function pressure(value){
 assert(Number.isFinite(value)&&value>=0&&value<=100,'INVALID_PRESSURE');
 return value;
}
const keyOf=(territoryId,speciesId)=>JSON.stringify([id(territoryId,'TERRITORY'),id(speciesId,'SPECIES')]);
const clone=x=>JSON.parse(JSON.stringify(x));
function validateObservations(value){
 assert(Array.isArray(value)&&value.length<=V157_OBSERVATION_LIMIT,
   'OBSERVATIONS_LIMIT_OR_SHAPE');
 return value.map(entry=>{
  assert(entry&&typeof entry==='object'&&!Array.isArray(entry),'INVALID_OBSERVATION');
  assert(Object.keys(entry).sort().join(',')==='category,effective',
     'OBSERVATION_EXTRA_FIELDS');
  assert(categories.has(entry.category)&&typeof entry.effective==='boolean',
     'INVALID_RESOLVED_OBSERVATION');
  return {category:entry.category,effective:entry.effective};
 });
}
function validateState(s){
 assert(s&&typeof s==='object'&&!Array.isArray(s),'STATE_OBJECT');
 keyOf(s.territoryId,s.speciesId);
 pressure(s.pressure);tier(s.maxTierReached,'MAX_REACHED');
 tier(s.effectiveTier,'EFFECTIVE');
 assert(Array.isArray(s.recentEventIds)&&s.recentEventIds.length<=V157_RECENT_EVENT_LIMIT,
  'STATE_EVENTS_INVALID');
 assert(new Set(s.recentEventIds).size===s.recentEventIds.length,'STATE_EVENTS_DUPLICATED');
 s.recentEventIds.forEach(x=>id(x,'EVENT'));
 validateObservations(s.recentResolvedActions);
 return clone(s);
}
function natural(territoryId,speciesId){
 return {territoryId,speciesId,pressure:0,maxTierReached:0,effectiveTier:0,
  recentEventIds:[],recentResolvedActions:[]};
}
class V157TerritorialPopulationMemoryLab{
 #populations=new Map();
 constructor(snapshot=null){
  if(snapshot===null)return;
  assert(snapshot?.schema==='GRULLA_V157_TERRITORIAL_POPULATION_LAB_SNAPSHOT',
   'BAD_SNAPSHOT_SCHEMA');
  assert(Array.isArray(snapshot.populations),'BAD_SNAPSHOT_POPULATIONS');
  for(const raw of snapshot.populations){
   const state=validateState(raw),k=keyOf(state.territoryId,state.speciesId);
   assert(!this.#populations.has(k),'DUPLICATE_POPULATION_KEY');
   this.#populations.set(k,state);
  }
 }
 view(territoryId,speciesId){
  const k=keyOf(territoryId,speciesId);
  return clone(this.#populations.get(k)??natural(territoryId,speciesId));
 }
 applyResolvedEncounter(event){
  assert(event&&typeof event==='object'&&!Array.isArray(event),'BAD_EVENT');
  const expected=['eventId','territoryId','speciesId','resolved','pressure',
    'pressureTier','reachedTier','observations'];
  assert(Object.keys(event).sort().join(',')===expected.sort().join(','),
    'EVENT_FIELDS_MISMATCH');
  id(event.eventId,'EVENT');
  const territoryId=id(event.territoryId,'TERRITORY');
  const speciesId=id(event.speciesId,'SPECIES');
  assert(event.resolved===true,'UNRESOLVED_ENCOUNTER_FORBIDDEN');
  const nextPressure=pressure(event.pressure);
  const pressureTier=tier(event.pressureTier,'PRESSURE_TIER');
  const reachedTier=tier(event.reachedTier,'REACHED_TIER');
  assert(reachedTier>=pressureTier,'REACHED_TIER_MUST_COVER_PRESSURE_TIER');
  const observations=validateObservations(event.observations);
  const k=keyOf(territoryId,speciesId);
  const previous=this.view(territoryId,speciesId);
  if(previous.recentEventIds.includes(event.eventId))
   return Object.freeze({applied:false,reason:'DUPLICATE_EVENT_SAME_POPULATION',
     population:this.view(territoryId,speciesId)});
  const reconciled=reconcilePopulationAdaptation({
   pressureTier,maxTierReached:previous.maxTierReached,reachedTier
  });
  const next={
   territoryId,speciesId,pressure:nextPressure,
   maxTierReached:reconciled.maxTierReached,
   effectiveTier:reconciled.effectiveTier,
   recentEventIds:[...previous.recentEventIds,event.eventId].slice(-V157_RECENT_EVENT_LIMIT),
   recentResolvedActions:[...previous.recentResolvedActions,...observations]
    .slice(-V157_OBSERVATION_LIMIT)
  };
  this.#populations.set(k,next);
  return Object.freeze({applied:true,population:clone(next)});
 }
 snapshot(){
  return {schema:'GRULLA_V157_TERRITORIAL_POPULATION_LAB_SNAPSHOT',
   status:V157_POPULATION_GATE,
   populations:[...this.#populations.values()].map(clone)
    .sort((a,b)=>keyOf(a.territoryId,a.speciesId)
     .localeCompare(keyOf(b.territoryId,b.speciesId)))};
 }
}

return Object.freeze({V157TerritorialPopulationMemoryLab,V157_RECENT_EVENT_LIMIT,V157_OBSERVATION_LIMIT});
});
