import { bindSemantic, requireRestorePermit, fail as fail$1, clone } from './g08-semantic.js';
import { requireResolvedMonsterDeath, requireCombatOwner, requireNativeM02Binding } from '../../../runtime/m02-v284-authority.js';
import { requireCanonicalM02Activation, requireM02WorldPort } from './m02-native-world-port.js';
import { fail, freeze } from '../references/closed/integracion/astra/g03/data/safe-data.js';

const ports=new WeakSet();
function requireM02DomainPort(p){if(!ports.has(p))fail('M02_DOMAIN_NOT_AUTHENTIC');return p;}
const signature=c=>JSON.stringify(['mob_id','name','corto','elemento','tipo','caidoEn','desapareceEn','arc1_tutorial'].map(k=>{const d=Object.getOwnPropertyDescriptor(c,k);if(!d||!Object.hasOwn(d,'value')||!['string','number','boolean','object'].includes(typeof d.value)||d.value!==null&&typeof d.value==='object')fail('M02_CORPSE_ACCESSOR_OR_VALUE');return d.value;}));
function createM02EncounterDomain({runtime}){
 if(!runtime)fail('M02_RUNTIME_REQUIRED');
 let world=null,binding=null,actor=null,generation=0,attempt=null,accepted=null,pending=null,busy=false;
 let corpses=new WeakMap();const stats={activations:0,deathCommits:0,corpseCreations:0,restorations:0,rejections:0,blocked:0,lastReason:null};
 function eligible(){return !!actor&&!!attempt&&attempt.actor===actor&&attempt.generation===generation&&runtime.quests?.M02==='activa'&&runtime.quests?.M01==='hecha'&&runtime.quests?.P==='hecha'&&runtime.flags?.arc1&&['ADMITIDO','MIEMBRO'].includes(runtime.flags.arc1.estadoAfiliacion)&&runtime.player?.facciones?.grulla_blanca?.estado!=='expulsado'&&runtime.terminado===false&&runtime.combate===null;}
 const api=Object.freeze({
  connect(w,b){if(world||binding)fail('M02_CONNECT_ONCE');world=requireM02WorldPort(w);binding=requireNativeM02Binding(b);},
  attachActor(p){requireCombatOwner(p);if(p.snapshot().actorId!=='player')fail('M02_ACTOR');actor=p;},
  activationBasis:()=>Object.freeze({actorOwner:actor,generation}),
  activate(cap){try{const d=requireCanonicalM02Activation(cap);if(d.runtime!==runtime||d.generation!==generation||d.actorOwner!==actor||!actor||runtime.quests.M02!=='activa'||attempt)fail('M02_ACTIVATION_SCOPE');
   attempt={token:Object.freeze({}),actor,generation};stats.activations++;stats.lastReason='M02_ACTIVATED_AUTHENTICALLY';return true;}catch(e){stats.blocked++;stats.lastReason=e.code||e.message;return false;}},
  mayBirth(id,g,room){return eligible()&&g===generation&&room==='deposito_comun'&&id.instanceId==='errant:rata_despensa'&&id.speciesId==='rata_qi'&&!accepted&&!pending&&!busy;},
  deliver(cap,p){
   try{if(!world||!binding)fail('M02_NOT_CONNECTED');const d=requireResolvedMonsterDeath(cap);
    if(p!==actor||d.attackerOwner!==actor||!actor||d.actorId!=='player')fail('M02_OLD_ACTOR');
    if(accepted?.cap===cap){stats.rejections++;stats.lastReason='M02_REPLAY_NOOP';return freeze({status:'ALREADY_APPLIED'});}
    if(busy)fail('M02_REENTRANT');const c=binding.deathContext(d);
    if(c.generation!==generation)fail('M02_OLD_GENERATION');
    if(d.identity.instanceId!=='errant:rata_despensa'||d.identity.speciesId!=='rata_qi')fail('M02_OTHER_TARGET');
    if(!eligible()||d.roomId!=='deposito_comun'){binding.mark(d,'INELIGIBLE');stats.rejections++;stats.lastReason='M02_INELIGIBLE_DEATH';return freeze({status:'IGNORED',reason:stats.lastReason});}
    if(actor.snapshot().revision!==d.actorRevision||accepted||runtime.pregunta!==null)fail('M02_STALE_ACTOR_OR_WORLD');
    // This valid death cannot be hidden by replacing its terminal life.
    binding.mark(d,'PENDING_VALID');pending={cap,d,birth:c.birth,attempt:attempt.token,generation};busy=true;
    try{const plan=world.prepare(c),prepared=world.preparedCorpse(plan),digest=signature(prepared),corpse=world.commit(plan);
     accepted={cap,d,corpse,digest,birth:c.birth,attempt:attempt.token,generation,actor};corpses.set(corpse,accepted);pending=null;binding.mark(d,'APPLIED');
     stats.deathCommits++;stats.corpseCreations++;stats.lastReason='M02_DOMAIN_APPLIED';return freeze({status:'APPLIED',milestone:'M02_RATA_RESUELTA'});
    }catch(e){stats.blocked++;stats.lastReason=e.code||e.message||'M02_ATOMIC_BLOCKED';return freeze({status:'BLOCKED',reason:stats.lastReason});}finally{busy=false;}
   }catch(e){stats.rejections++;stats.lastReason=e.code||e.message||'M02_REJECTED';return freeze({status:'REJECTED',reason:stats.lastReason});}
  },
  isControlledCorpse:c=>!!c&&corpses.has(c),
  allowsCorpse(c){const rec=c&&corpses.get(c);if(!rec||rec!==accepted||rec.actor!==actor||rec.generation!==generation||!attempt||rec.attempt!==attempt.token||runtime.pos!=='deposito_comun'||!['activa','hecha'].includes(runtime.quests?.M02))return false;
   try{return signature(c)===rec.digest;}catch{return false;}},
  restoreProjection(){if(!accepted||busy||!world)return;try{if(world.restore(accepted.corpse)){stats.restorations++;stats.lastReason='M02_SAME_CORPSE_PROJECTION_RESTORED';}}catch(e){stats.blocked++;stats.lastReason=e.code||e.message;}},
  reset(){generation++;actor=null;attempt=null;accepted=null;pending=null;busy=false;corpses=new WeakMap();for(const k of ['activations','deathCommits','corpseCreations','restorations','rejections','blocked'])stats[k]=0;stats.lastReason='NEW_GENERATION';},
  inspect:()=>freeze({generation,attemptActive:!!attempt,applied:!!accepted,pendingValidDeath:!!pending,busy,...stats,history:0,corpsesBound:1,saveConnected:false,otherTargetsChanged:false})
 });ports.add(api);
 bindSemantic(api,{capture(){if(pending)fail$1('G08_M02_PENDING_DEATH_BLOCKED');return clone({version:1,generation,activated:!!attempt,accepted:accepted?{corpse:accepted.corpse,digest:accepted.digest,identity:accepted.d.identity}:null});},
 prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||d.accepted&&!d.activated)fail$1('G08_M02_PROVENANCE');if(d.accepted&&signature(d.accepted.corpse)!==d.accepted.digest)fail$1('G08_M02_CORPSE_SIGNATURE');
  return {apply(){const old={generation,actor,attempt,accepted,pending,busy,corpses};generation=d.generation;actor=c.context.owner();attempt=d.activated?{token:Object.freeze({}),actor,generation}:null;pending=null;busy=false;corpses=new WeakMap();accepted=null;
   if(d.accepted){const projected=(runtime.cadaveres.deposito_comun||[]).find(x=>x.arc1_tutorial&&signature(x)===d.accepted.digest),corpse=projected||clone(d.accepted.corpse);accepted={cap:Object.freeze({}),d:{identity:clone(d.accepted.identity)},corpse,digest:d.accepted.digest,birth:Object.freeze({}),attempt:attempt.token,generation,actor};corpses.set(corpse,accepted);}
   return ()=>({generation,actor,attempt,accepted,pending,busy,corpses}=old);}};
 }});return api;
}

export { createM02EncounterDomain, requireM02DomainPort };
