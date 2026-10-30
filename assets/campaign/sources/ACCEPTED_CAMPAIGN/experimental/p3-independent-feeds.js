import { bindSemantic, requireRestorePermit, clone } from './g08-semantic.js';
import { requireResolvedMonsterDeath, requireNativeM02Binding, requireCombatOwner } from '../../../runtime/m02-v284-authority.js';
import { requireM03Institution } from '../../../runtime/p2-evaluation-r56.js';

const visitProofs=new WeakMap(),deathProofs=new WeakMap();
const fail=c=>{throw Error(c);};
function requireVisitObservation(cap){const d=visitProofs.get(cap);if(!d||!d.current())fail('P3_VISIT_PROOF_NOT_AUTHENTIC');return d;}
function requireDeathObservation(cap){const d=deathProofs.get(cap);if(!d||!d.current())fail('P3_DEATH_PROOF_NOT_AUTHENTIC');return d;}
function createP3IndependentFeeds({runtime,roomDefinitions,readInstitution=null}){
 const g=runtime;let actor=null,generation=0,targets=null,epoch=0,moveFrame=null,institutionReader=readInstitution;
 let deaths=new WeakSet(),visited=new Map();const counts={newDeathsObserved:0,tutorialOrPreM03Deaths:0,postM03Defeats:0,firstRoomTransitions:0,replaysRejected:0};
 function active(){return !!actor&&g.player&&g.terminado===false&&g.combate===null&&actor.snapshot().stage==='LianQi_I';}
 function institution(){if(!institutionReader)fail('P3_INSTITUTION_READER_MISSING');const cap=institutionReader(),d=requireM03Institution(cap);if(d.actor!==g.player)fail('P3_INSTITUTION_ACTOR');return d;}
 function scope(){return {actorOwner:actor,generation,actor:g.player};}
 function reset(){actor=null;generation++;epoch++;deaths=new WeakSet();visited=new Map();for(const k of Object.keys(counts))counts[k]=0;}
 const oldNew=g.nuevaPartida;g.nuevaPartida=function(...args){if(this===g)reset();return oldNew.apply(this,args);};
 const oldIr=g.cmd_ir,oldEnter=g.entrarSala;
 g.entrarSala=function(...args){const f=this===g?moveFrame:null,result=oldEnter.apply(this,args);if(f&&g.pos===f.to)f.enters++;return result;};
 g.cmd_ir=function(direction){if(this!==g)return oldIr.call(this,direction);
  const from=g.pos,to=roomDefinitions[from]?.exits?.[direction],pre=scope();
  const legitimate=active()&&typeof to==='string'&&roomDefinitions[to]&&g.bloqueoPaso(from,direction)===null&&g.pregunta===null;
  const f={from,to,direction,enters:0};moveFrame=f;let result;try{result=oldIr.call(this,direction);}finally{moveFrame=null;}
  if(legitimate&&actor===pre.actorOwner&&generation===pre.generation&&g.player===pre.actor&&g.pos===to&&f.enters===1&&active()){
   epoch++;try{institution();}catch{return result;}
   if(!visited.has(to)){const cap=Object.freeze({}),record=Object.freeze({...pre,from,to,direction,areaId:roomDefinitions[to].area,epoch,current:()=>actor===pre.actorOwner&&generation===pre.generation&&g.player===pre.actor});
    visitProofs.set(cap,record);visited.set(to,cap);counts.firstRoomTransitions++;
   }
  }return result;
 };
 const api=Object.freeze({
  attachActor(owner){requireCombatOwner(owner);if(owner.snapshot().actorId!=='player')fail('P3_ACTOR_OWNER');actor=owner;},
  attachTargets(binding){if(targets||typeof binding?.deathContext!=='function')fail('P3_TARGET_BINDING');targets=requireNativeM02Binding(binding);},
  setInstitutionReader(fn){if(institutionReader||typeof fn!=='function')fail('P3_INSTITUTION_PORT');institutionReader=fn;},
  observeDeath(cap,owner){if(deaths.has(cap)){counts.replaysRejected++;return null;}const d=requireResolvedMonsterDeath(cap);
   if(owner!==actor||d.attackerOwner!==actor||!targets||!active()||actor.snapshot().revision!==d.actorRevision)fail('P3_DEATH_ACTOR_OR_CONTEXT');
   const context=targets.deathContext(d);if(!d.targetOwner.snapshot().terminal)fail('P3_DEATH_NOT_TERMINAL');deaths.add(cap);counts.newDeathsObserved++;
   let afterM03=false;try{institution();afterM03=true;}catch{}
   if(!afterM03||d.identity.instanceId==='errant:rata_despensa'){counts.tutorialOrPreM03Deaths++;return null;}
   const p=scope(),proof=Object.freeze({}),record=Object.freeze({...p,identity:d.identity,targetOwner:d.targetOwner,birth:context.birth,roomId:d.roomId,epoch:d.epoch,current:()=>actor===p.actorOwner&&generation===p.generation&&g.player===p.actor});
   deathProofs.set(proof,record);counts.postM03Defeats++;return proof;
  },
  firstVisits(){return Object.freeze([...visited.values()]);},
  inspect:()=>Object.freeze({...counts,generation,roomsObserved:Object.freeze([...visited.keys()]),questActive:false,questCredits:0,recognition:false,pillOwnerConnected:false,cultivationConnected:false,stageIssuerInstalled:false,historyBoundedByCanonicalRooms:true,saveConnected:false,
   blockers:Object.freeze(['P3_GENERAL_ENCOUNTER_LIFECYCLE_NOT_CONNECTED','P3_NEW_CORPSE_EXTRACTION_INVENTORY_NOT_CONNECTED','P3_QUANTITIES_PROVISIONAL_NOT_ACTIVATED','P3_REPLENISHMENT_COST_NOT_RATIFIED']),P4:'BLOCKED_NO_AUTHENTIC_NEW_II'})
 });bindSemantic(api,{capture(){return clone({version:1,generation,rooms:[...visited.values()].map(cap=>Object.fromEntries(Object.entries(visitProofs.get(cap)).filter(([k])=>!["actor","actorOwner","current"].includes(k))))});},prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||d.rooms.some(record=>!roomDefinitions[record.to]||!roomDefinitions[record.from]))throw Error('G08_VISIT_SOURCE');return {apply(){const old={actor,generation,epoch,deaths,visited};actor=c.context.owner();generation=d.generation;epoch++;deaths=new WeakSet();visited=new Map();for(const saved of d.rooms){const to=saved.to;const cap=Object.freeze({}),a=g.player,p=actor,gen=generation;visitProofs.set(cap,Object.freeze({...clone(saved),actorOwner:p,actor:a,generation:gen,to,current:()=>actor===p&&g.player===a&&generation===gen}));visited.set(to,cap);}return ()=>({actor,generation,epoch,deaths,visited}=old);}};}});return api;
}

export { createP3IndependentFeeds, requireDeathObservation, requireVisitObservation };
