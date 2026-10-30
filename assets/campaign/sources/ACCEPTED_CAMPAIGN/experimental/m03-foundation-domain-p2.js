import { bindSemantic, requireRestorePermit, fail as fail$1, integer, canonical, clone } from './g08-semantic.js';

// P1 only: situated non-elemental curriculum. No Learning, combat, resource or cultivation authority.
const FOUNDATION_STEPS=Object.freeze([
 Object.freeze({id:'PREPARATION',scene:'Ante el muñeco, preparas el cuerpo antes de iniciar el ejercicio.',question:'¿Cómo preparas la postura y la respiración?',options:Object.freeze([
  Object.freeze({id:'SET_AND_BREATHE',text:'Acomodo los apoyos y dejo que la respiración encuentre un ritmo tranquilo.'}),
  Object.freeze({id:'RUSH_AND_HOLD',text:'Me acerco deprisa y contengo el aliento para no moverme.'})]),accepted:'SET_AND_BREATHE',correction:'Sin empezar todavía, afloja la tensión y vuelve a preparar los apoyos. No necesitas contener el aliento.'}),
 Object.freeze({id:'EXECUTION',scene:'El muñeco sirve de referencia. Realizas un movimiento corto de acercamiento y regreso, sin golpearlo.',question:'¿Cómo coordinas el movimiento?',options:Object.freeze([
  Object.freeze({id:'ARMS_FIRST',text:'Adelanto los brazos y recupero el equilibrio al terminar.'}),
  Object.freeze({id:'COORDINATE',text:'Coordino el paso con el cuerpo y la respiración; regreso sin precipitarme.'})]),accepted:'COORDINATE',correction:'Vuelve al inicio. El cuerpo y los apoyos deben acompañar el movimiento, no llegar después.'}),
 Object.freeze({id:'CORRECTION',scene:'Al repetir el movimiento notas que adelantas el cuerpo y tensas la respiración.',question:'¿Qué corriges antes de repetir?',options:Object.freeze([
  Object.freeze({id:'CORRECT_AND_REPEAT',text:'Recupero los apoyos, suelto la tensión y repito coordinando el movimiento.'}),
  Object.freeze({id:'FORCE_REPEAT',text:'Mantengo el gesto y lo repito con más fuerza para terminarlo.'})]),accepted:'CORRECT_AND_REPEAT',correction:'No necesitas más fuerza. Revisa los apoyos y la tensión antes de repetir.'})
]);
const practiceProofs=new WeakMap();
function requireVerifiedPractice(proof){const d=practiceProofs.get(proof);if(!d||!d.current())throw Error('P2_P1_PRIVATE_PROOF_REQUIRED');return d;}
const fail=c=>{const e=new Error(c);e.code=c;throw e;};
const freeze=x=>Object.freeze(x);
function createFoundationDomain({read,commitInstruction,commitPractice}){
 if([read,commitInstruction,commitPractice].some(x=>typeof x!=='function'))fail('P1_PORT_REQUIRED');
 let instruction=null,lease=null,completed=null;let serial=0,busy=false;const idle=()=>{if(busy)fail('P1_REENTRANCY');};const receipts=new WeakMap(),used=new WeakSet();
 const counters={instructions:0,practiceCommits:0,corrections:0,rejected:0,cancellations:0};
 const inc=k=>counters[k]=Math.min(1000000,counters[k]+1);
 function ctx(kind){const c=read(kind);if(!c||c.status!=='VALID')fail('P1_CONTEXT_NOT_AUTHENTIC');return c;}
 function matches(a,b){return a.actor===b.actor&&a.generation===b.generation&&a.stamp===b.stamp&&a.dummy===b.dummy;}
 function verify(l){const c=ctx('PRACTICE');if(lease!==l||l.serial!==serial||!matches(l.context,c))fail('P1_STALE_CONTEXT');return c;}
 function cancel(){idle();lease=null;serial++;inc('cancellations');}
 const api=freeze({
  instruct(){idle();const c=ctx('INSTRUCTION');if(instruction&&instruction.actor===c.actor&&instruction.generation===c.generation)return 'REMINDER';
   const cap=freeze({}),d=freeze({kind:'INSTRUCTION',context:c});receipts.set(cap,d);
   busy=true;try{commitInstruction(cap,api.consume);}finally{busy=false;}used.add(cap);instruction=freeze({actor:c.actor,generation:c.generation});inc('instructions');return 'INSTRUCTED';},
  begin(){idle();const c=ctx('PRACTICE');if(!instruction||instruction.actor!==c.actor||instruction.generation!==c.generation)fail('P1_INSTRUCTION_REQUIRED');
   if(completed&&completed.actor===c.actor&&completed.generation===c.generation)return null;
   cancel();lease={context:c,serial,stage:0};return freeze({});},
  step(){if(!lease)return null;verify(lease);return FOUNDATION_STEPS[lease.stage];},
  answer(id){idle();const l=lease;if(!l)fail('P1_NO_SESSION');verify(l);const step=FOUNDATION_STEPS[l.stage];if(!step.options.some(o=>o.id===id))fail('P1_OPTION_NOT_AUTHORIZED');
   if(id!==step.accepted){inc('corrections');return freeze({status:'CORRECTION',text:step.correction});}
   if(l.stage<2){l.stage++;return freeze({status:'CONTINUE'});}
   const cap=freeze({}),d=freeze({kind:'PRACTICE',context:l.context,lease:l,evidence:Object.freeze(FOUNDATION_STEPS.map(s=>s.accepted))});receipts.set(cap,d);
   // World publication must return successfully before capability is consumed or session is completed.
   busy=true;try{commitPractice(cap,api.consume);}finally{busy=false;}used.add(cap);completed=freeze({actor:l.context.actor,generation:l.context.generation,steps:FOUNDATION_STEPS.map(s=>({stepId:s.id,actionId:s.accepted}))});
   lease=null;serial++;inc('practiceCommits');return freeze({status:'COMPLETED'});
  },
  consume(cap,kind){const d=receipts.get(cap);if(!d||used.has(cap)||d.kind!==kind)fail('P1_RECEIPT_NOT_AUTHENTIC');
   if(kind==='INSTRUCTION'){const c=ctx(kind);if(!matches(c,d.context))fail('P1_STALE_CONTEXT');}
   else {verify(d.lease);if(d.lease.stage!==2||d.evidence.length!==3)fail('P1_INCOMPLETE_EVIDENCE');}
   return d;},
  cancel,reset(){idle();instruction=null;completed=null;lease=null;serial++;for(const k of Object.keys(counters))counters[k]=0;},
  practiceProof(actor,generation){if(!completed||completed.actor!==actor||completed.generation!==generation)fail('P2_P1_PRIVATE_PROOF_REQUIRED');const record=completed,proof=freeze({});practiceProofs.set(proof,freeze({actor,generation,current:()=>completed===record}));return proof;},
  inspect:()=>freeze({...counters,stage:lease?FOUNDATION_STEPS[lease.stage].id:null,active:!!lease,completed:!!completed,history:0,persistence:false,timers:0})
 });
 bindSemantic(api,{capture(){return clone({version:1,instruction:instruction?{generation:instruction.generation}:null,completed:completed?{generation:completed.generation,steps:completed.steps}:null,serial});},
 prepare(d,{permit,envelope,context:ctx}){requireRestorePermit(permit,envelope);if(d.version!==1)fail$1('G08_P1_VERSION');integer(d.serial);
  if(d.completed&&(!d.instruction||canonical(d.completed.steps)!==canonical(FOUNDATION_STEPS.map(s=>({stepId:s.id,actionId:s.accepted})))||d.completed.generation!==d.instruction.generation))fail$1('G08_P1_EVIDENCE');
  return {apply(){const old={instruction,completed,lease,serial,busy};instruction=d.instruction?freeze({actor:ctx.actor(),generation:d.instruction.generation}):null;completed=d.completed?freeze({...clone(d.completed),actor:ctx.actor()}):null;lease=null;serial=d.serial+1;busy=false;return ()=>({instruction,completed,lease,serial,busy}=old);}};
 }});return api;
}

export { FOUNDATION_STEPS, createFoundationDomain, requireVerifiedPractice };
