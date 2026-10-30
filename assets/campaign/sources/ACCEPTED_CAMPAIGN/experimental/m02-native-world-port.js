import { fail } from '../references/closed/integracion/astra/g03/data/safe-data.js';

const ports=new WeakSet(),activations=new WeakMap();
function requireM02WorldPort(p){if(!ports.has(p))fail('M02_WORLD_NOT_AUTHENTIC');return p;}
function requireCanonicalM02Activation(cap){const d=activations.get(cap);if(!d)fail('M02_ACTIVATION_NOT_AUTHENTIC');return d;}
function value(o,k){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,'value'))fail('M02_ACCESSOR_OR_MISSING_'+k);return d.value;}
function writable(o,k){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,'value')||!d.writable)fail('M02_NON_WRITABLE_'+k);}
function clone(x,seen=new WeakMap(),depth=0,budget={n:0}){if(++budget.n>20000||depth>32)fail('M02_DRAFT_BOUND');if(x===null||['string','number','boolean','undefined'].includes(typeof x))return x;
 if(typeof x!=='object'||![Object.prototype,Array.prototype,null].includes(Object.getPrototypeOf(x)))fail('M02_NONPLAIN_DRAFT');
 if(seen.has(x))return seen.get(x);const out=Array.isArray(x)?[]:{};seen.set(x,out);for(const k of Object.keys(x))out[k]=clone(value(x,k),seen,depth+1,budget);return out;}
function connectM02NativeWorld({runtime,domain,fault=null}){
 if(!runtime||!domain||(fault!==null&&typeof fault!=='function'))fail('M02_WORLD_PORT');
 const checkpoint=n=>fault?.(n);
 const registrar=runtime.registrarCadaver,hito=runtime.registrarHitoArc1,oldMission=runtime.gestionarMisionesNpc,oldEnter=runtime.entrarSala,oldNew=runtime.nuevaPartida,describe=runtime.describirCadaver,observe=runtime.observarCadaver;
 if([registrar,hito,oldMission,oldEnter,oldNew,describe,observe].some(x=>typeof x!=='function'))fail('M02_NATIVE_METHODS');
 const plans=new WeakMap();
 runtime.gestionarMisionesNpc=function(...args){const before=this===runtime?{m02:this.quests?.M02,m01:this.quests?.M01,pos:this.pos,basis:domain.activationBasis()}:null;
  const result=oldMission.apply(this,args);
  if(before&&args[0]==='tao_ming'&&before.pos==='oficina_servicios'&&before.m01==='hecha'&&!before.m02&&this.quests.M02==='activa'&&typeof result==='string'&&result.length&&before.basis.actorOwner){
   const cap=Object.freeze({});activations.set(cap,Object.freeze({...before.basis,runtime,roomId:before.pos,originalResult:result}));
   domain.activate(cap);
  }return result;};
 runtime.entrarSala=function(...args){if(this===runtime)domain.restoreProjection();return oldEnter.apply(this,args);};
 runtime.nuevaPartida=function(...args){if(this===runtime)domain.reset();return oldNew.apply(this,args);};
 runtime.describirCadaver=function(c,...args){if(this===runtime&&(Object.getOwnPropertyDescriptor(c||{},'arc1_tutorial')?.value===true||domain.isControlledCorpse(c))&&!domain.allowsCorpse(c))return 'No hay un cadáver tutorial auténtico disponible en este contexto.';
  return describe.call(this,c,...args);};
 runtime.observarCadaver=function(i=0,...args){if(this===runtime){const c=this.cadaveresEnSala()[Number(i)||0];if(c&&(Object.getOwnPropertyDescriptor(c,'arc1_tutorial')?.value===true||domain.isControlledCorpse(c))&&!domain.allowsCorpse(c))return {ok:false,texto:'No hay un cadáver tutorial auténtico disponible en este contexto.'};}return observe.call(this,i,...args);};
 const api=Object.freeze({
  prepare(context){checkpoint('PREPARE_START');
   for(const k of ['flags','cadaveres','vivos'])writable(runtime,k);
   if(runtime.pos!=='deposito_comun'||runtime.quests?.M02!=='activa'||runtime.combate!==null||runtime.terminado!==false||runtime.pregunta!==null)fail('M02_WORLD_CONTEXT');
   const e=(runtime.errantes||[]).find(x=>x.id==='rata_despensa'&&x.mobId==='rata_qi');if(!e||!runtime.vivos.includes(context.mob)||e.sala!==runtime.pos)fail('M02_EXACT_RAT_MISSING');writable(e,'muertoHasta');
   if(runtime.flags.arc1.hitos.M02_RATA_RESUELTA||runtime.flags.arc1.hitos.M02_CADAVER_OBSERVADO||runtime.flags.arc1.hitos.SERVICIO_DESPENSA_VALIDADO)fail('M02_UNSOURCED_PREEXISTING_PROGRESS');
   const descriptor={};for(const k of ['mob_id','name','corto','elemento','errante_id']){const d=Object.getOwnPropertyDescriptor(context.mob,k);if(d&&!Object.hasOwn(d,'value'))fail('M02_COLD_ACCESSOR');descriptor[k]=d?.value;}
   if(descriptor.mob_id!=='rata_qi'||descriptor.errante_id!=='rata_despensa'||typeof descriptor.name!=='string'||!descriptor.name)fail('M02_COLD_IDENTITY');
   const before={flags:runtime.flags,cadaveres:runtime.cadaveres,vivos:runtime.vivos,retirement:e.muertoHasta,e,quests:runtime.quests,player:runtime.player,pos:runtime.pos,turn:runtime.turnoGlobal,gates:runtime.gates};
   const draft=Object.create(runtime);draft.flags=clone(runtime.flags);draft.quests=clone(runtime.quests);draft.player=clone(runtime.player);draft.gates=clone(runtime.gates);
   draft.cadaveres=Object.fromEntries(Object.entries(runtime.cadaveres||{}).map(([id,a])=>[id,a.slice()]));
   draft.cerrarArc1=()=>fail('M02_UNEXPECTED_MISSION_CLOSE');draft.salida=()=>fail('M02_UNEXPECTED_NARRATIVE');draft.autoguardar=()=>false;
   const prior=draft.cadaveres.deposito_comun?.length??0;registrar.call(draft,descriptor);checkpoint('PREPARE_CORPSE');
   const corpse=draft.cadaveres.deposito_comun?.at(-1);if(!corpse||draft.cadaveres.deposito_comun.length!==prior+1||!corpse.arc1_tutorial||corpse.desapareceEn!==Number.MAX_SAFE_INTEGER)fail('M02_CORPSE_PROJECTION');
   hito.call(draft,'M02_RATA_RESUELTA');checkpoint('PREPARE_HITO');
   const expected=clone(runtime.flags);expected.arc1.hitos.M02_RATA_RESUELTA=true;
   if(JSON.stringify(draft.flags)!==JSON.stringify(expected)||JSON.stringify(draft.player)!==JSON.stringify(runtime.player)||JSON.stringify(draft.quests)!==JSON.stringify(runtime.quests)||JSON.stringify(draft.gates)!==JSON.stringify(runtime.gates))fail('M02_OUT_OF_SCOPE_DRAFT_DELTA');
   const cap=Object.freeze({});plans.set(cap,{before,flags:draft.flags,cadaveres:draft.cadaveres,vivos:runtime.vivos.filter(x=>x!==context.mob),corpse,used:false});return cap;
  },
  commit(cap){const p=plans.get(cap);if(!p||p.used)fail('M02_WORLD_PLAN_REPLAY');const b=p.before;
   if(runtime.flags!==b.flags||runtime.cadaveres!==b.cadaveres||runtime.vivos!==b.vivos||runtime.quests!==b.quests||runtime.player!==b.player||runtime.pos!==b.pos||runtime.turnoGlobal!==b.turn||b.e.muertoHasta!==b.retirement)fail('M02_WORLD_PLAN_STALE');
   checkpoint('BEFORE_WORLD_COMMIT');try{
    runtime.cadaveres=p.cadaveres;checkpoint('AFTER_CORPSE_WRITE');
    runtime.vivos=p.vivos;checkpoint('AFTER_ROSTER_WRITE');
    b.e.muertoHasta=Number.MAX_SAFE_INTEGER;checkpoint('AFTER_RETIREMENT_WRITE');
    runtime.flags=p.flags;checkpoint('AFTER_HITO_WRITE');checkpoint('BEFORE_AUTHORITY_PUBLICATION');
    p.used=true;return p.corpse;
   }catch(error){runtime.flags=b.flags;b.e.muertoHasta=b.retirement;runtime.vivos=b.vivos;runtime.cadaveres=b.cadaveres;p.used=true;throw error;}
  },
  preparedCorpse(cap){const p=plans.get(cap);if(!p||p.used)fail('M02_WORLD_PLAN_REPLAY');return p.corpse;},
  restore(corpse){if(!domain.allowsCorpse(corpse)||runtime.flags.arc1.hitos.M02_CADAVER_OBSERVADO||runtime.quests.M02!=='activa')return false;
   const current=runtime.cadaveres?.deposito_comun||[];if(current.includes(corpse))return false;
   if(Object.values(runtime.cadaveres||{}).some(a=>a.includes(corpse)))fail('M02_CORPSE_WRONG_ROOM_PROJECTION');
   for(const k of ['flags','cadaveres'])writable(runtime,k);
   const flags=clone(runtime.flags);flags.arc1.hitos.M02_CADAVER_RECREADO=true;
   runtime.cadaveres={...runtime.cadaveres,deposito_comun:current.concat([corpse])};runtime.flags=flags;return true;
  }
 });ports.add(api);return api;
}

export { connectM02NativeWorld, requireCanonicalM02Activation, requireM02WorldPort };
