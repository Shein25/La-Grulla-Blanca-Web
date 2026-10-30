import { bindSemantic, requireRestorePermit, semanticPort, clone } from './g08-semantic.js';
import { createFoundationDomain } from './m03-foundation-domain-p2.js';

const installed=new WeakSet();
const fail=c=>{const e=new Error(c);e.code=c;throw e;};
const copy=x=>structuredClone(x);
function connectM03Foundation({runtime,readOwner,readLearning,fault=null}){
 if(installed.has(runtime)||typeof readOwner!=='function'||typeof readLearning!=='function'||(fault!==null&&typeof fault!=='function'))fail('P1_SINGLE_PRIVATE_PORT');installed.add(runtime);
 const g=runtime;let frame=null,currentQuestion=null,questionSerial=0,births=new WeakMap(),birthSerial=0;
 const tick=name=>{if(fault)fault(name);};
 const stamp=()=>JSON.stringify({room:g.pos,turn:g.turnoGlobal,quests:g.quests,flags:g.flags,positions:g.posicionNPC,ended:g.terminado,combat:!!g.combate});
 function base(){
  let o,k;try{o=readOwner().state;k=readLearning();}catch{return null;}if(!g.player||g.terminado!==false||g.combate!==null||g.quests?.M03!=='activa'||g.quests?.M02!=='hecha'||o.stage!=='LianQi_I'||o.actorId!=='player'||k.status!=='READY')return null;
  return {actor:g.player,generation:k.generation,stamp:stamp(),dummy:null};
 }
 function read(kind){const c=base();if(!c)return null;
  if(kind==='INSTRUCTION'){
   if(!frame||frame.used||g.pregunta!==null||g.pos!=='sala_formas'||!g.npcPresente('shen_baojun',g.pos)||!g.npcsEnSala(g.pos).includes('shen_baojun'))return null;
   return {...c,status:'VALID'};
  }
  if(g.pos!=='patio_marcial'||!g.flags.arc1?.hitos.M03_FUNDAMENTOS_INSTRUIDOS||g.flags.arc1?.hitos.M03_PRACTICA_MUNECO_COMPLETADA)return null;
  const ds=g.vivos.filter(d=>births.has(d)&&d.arc1_muneco===true&&d.mob_id==='muneco_practica'&&d.hp>0);
  if(ds.length!==1)return null;const d=ds[0],b=births.get(d);
  if(b.actor!==c.actor||b.generation!==c.generation)return null;
  return {...c,dummy:d,status:'VALID'};
 }
 function atomic(flags,positions=null){const oldFlags=g.flags,oldPos=g.posicionNPC;
  try{tick('BEFORE_PUBLISH');g.flags=flags;tick('AFTER_FLAGS');if(positions){g.posicionNPC=positions;tick('AFTER_POSITIONS');}tick('BEFORE_CONFIRM');}
  catch(e){g.flags=oldFlags;g.posicionNPC=oldPos;throw e;}
 }
 function instructionCommit(cap,consume){consume(cap,'INSTRUCTION');const a=copy(g.flags),p=copy(g.posicionNPC),arc=a.arc1;
  if(arc.hitos.M03_FUNDAMENTOS_INSTRUIDOS)fail('P1_UNSOURCED_INSTRUCTION_FLAG');
  if(arc.anclajePropietario.shen_baojun!=='M03'||!p.shen_baojun||!p.qiao_ren)fail('P1_CANONICAL_ANCHOR_REQUIRED');
  const owner=arc.anclajePropietario.qiao_ren;if(owner&&owner!=='M03'&&g.quests[owner]==='activa')fail('P1_FOREIGN_ANCHOR');
  arc.hitos.M03_FUNDAMENTOS_INSTRUIDOS=true;delete arc.anclajePropietario.shen_baojun;p.shen_baojun={sala:p.shen_baojun.sala,anclaje:null};
  arc.anclajePropietario.qiao_ren='M03';p.qiao_ren={sala:'pabellon_disciplina',anclaje:{room:'pabellon_disciplina',hasta:'M03_PROMOCION_FORMALIZADA'}};
  atomic(a,p);
 }
 function practiceCommit(cap,consume){consume(cap,'PRACTICE');const a=copy(g.flags);if(a.arc1.hitos.M03_PRACTICA_MUNECO_COMPLETADA)fail('P1_DUPLICATE_PRACTICE');a.arc1.hitos.M03_PRACTICA_MUNECO_COMPLETADA=true;atomic(a);}
 const domain=createFoundationDomain({read,commitInstruction:instructionCommit,commitPractice:practiceCommit});
 function cancel(clear=true){domain.cancel();questionSerial++;if(clear&&currentQuestion&&g.pregunta===currentQuestion){g.pregunta=null;g.desactivarEleccionActiva();}currentQuestion=null;}
 function ask(){
  let step;try{step=domain.step();}catch{cancel();return;}
  if(!step)return;const serial=++questionSerial;let q;
  g.preguntarEleccionMultiple({contexto:[step.scene],pregunta:step.question,opciones:step.options.map((o,i)=>({valor:String(i+1),insignia:String(i+1)+')',texto:o.text})).concat([{valor:'0',insignia:'0)',texto:'Dejar la práctica por ahora.'}]),marcador:'(1/2/0)',hint:'1, 2 o 0',callback:r=>{
   // Native input consumes and clears precisely this question before invoking its callback.
   if(serial!==questionSerial||currentQuestion!==q||g.pregunta!==null)return;
   currentQuestion=null;questionSerial++;
   if(r.trim()==='0'){cancel(false);g.salida('Dejas el ejercicio sin acreditar una práctica.');return;}
   const index=Number(r.trim())-1,id=step.options[index]?.id;
   try{if(!id)fail('P1_OPTION_NOT_AUTHORIZED');const result=domain.answer(id);
    if(result.status==='COMPLETED'){g.salida('Completas la preparación, el movimiento coordinado y su corrección ante el muñeco. La práctica básica queda registrada. No has aprendido una técnica elemental.','destacado');return;}
    if(result.status==='CORRECTION')g.salida(result.text);ask();
   }catch(e){try{if(domain.step()){g.salida('La práctica no se pudo acreditar. Revisa el ejercicio antes de reintentarlo.');ask();}else cancel();}catch{cancel();}}
  }});
  q=g.pregunta;currentQuestion=q;
 }
 const oldTalk=g.cmd_hablar;g.cmd_hablar=function(...args){if(this!==g)return oldTalk.apply(this,args);
  if(currentQuestion||g.pregunta!==null)return oldTalk.apply(this,args);
  frame={used:false};try{return oldTalk.apply(this,args);}finally{frame=null;}};
 const oldMission=g.gestionarMisionesNpc;g.gestionarMisionesNpc=function(npc,...args){
  if(this===g&&npc==='shen_baojun'&&g.quests?.M03==='activa'&&g.pos==='sala_formas'){
   try{const result=domain.instruct();frame.used=true;return result==='REMINDER'?'Practica los fundamentos de postura, respiración y coordinación ante el muñeco del Patio Marcial.':
    'Shen Baojun te enseña a preparar los apoyos, mantener una respiración serena y coordinar el movimiento. Examina el muñeco del Patio Marcial para practicar estos fundamentos.';}
   catch(e){return 'La instrucción básica requiere un encuentro válido con Shen Baojun.';}
  }return oldMission.call(this,npc,...args);};
 const oldEnter=g.entrarSala;g.entrarSala=function(...args){if(this!==g)return oldEnter.apply(this,args);cancel();const before=new Set(g.vivos||[]);const value=oldEnter.apply(this,args),c=base();
  if(c&&g.pos==='patio_marcial'&&!g.flags.arc1.hitos.M03_PRACTICA_MUNECO_COMPLETADA){
   const spawned=g.vivos.filter(d=>!before.has(d)&&d.mob_id==='muneco_practica'&&d.arc1_muneco===true);
   if(spawned.length===1)births.set(spawned[0],Object.freeze({actor:c.actor,generation:c.generation,birth:++birthSerial}));
  }return value;};
 const oldExam=g.cmd_examinar;g.cmd_examinar=function(args){
  if(this!==g)return oldExam.call(this,args);
  const normalized=args.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  if(g.pos==='patio_marcial'&&['muneco','muneco de practica','muneco articulado','muneco articulado de practica'].includes(normalized)){
   if(g.pregunta!==null)return 'Termina la interacción pendiente antes de practicar.';
   if(g.flags.arc1?.hitos.M03_PRACTICA_MUNECO_COMPLETADA)return 'La práctica básica de este ejercicio ya está registrada.';
   try{domain.begin();ask();return '';}catch{return 'Necesitas la instrucción legítima de Shen y un muñeco de práctica presente para comenzar.';}
  }return oldExam.call(this,args);};
 for(const name of ['nuevaPartida','crearPersonaje']){const old=g[name];g[name]=function(...args){if(this===g){cancel();domain.reset();births=new WeakMap();birthSerial=0;}return old.apply(this,args);};}
 const port=Object.freeze({inspect:()=>domain.inspect(),capturePractice(){const c=base();if(!c||!g.flags.arc1?.hitos.M03_FUNDAMENTOS_INSTRUIDOS||!g.flags.arc1?.hitos.M03_PRACTICA_MUNECO_COMPLETADA)fail('P2_P1_PRIVATE_PROOF_REQUIRED');return domain.practiceProof(c.actor,c.generation);}});
 bindSemantic(port,{capture(){return clone({...semanticPort(domain).capture(),birthHighwater:birthSerial,dummyBirths:(g.vivos||[]).flatMap((d,index)=>{const b=births.get(d);return b?[{index,mobId:d.mob_id,generation:b.generation,birth:b.birth}]:[];})});},prepare(d,c){requireRestorePermit(c.permit,c.envelope);const plan=semanticPort(domain).prepare(d,c);
  const roster=c.envelope.domains.World?.vivos??g.vivos;if(d.dummyBirths.some(b=>roster[b.index]?.mob_id!==b.mobId||b.mobId!=='muneco_practica'||roster[b.index]?.arc1_muneco!==true||b.birth>d.birthHighwater))throw Error('G08_P1_DUMMY_SOURCE');
  return {apply(){const old={births,birthSerial,currentQuestion,questionSerial,frame},undo=plan.apply();births=new WeakMap();birthSerial=d.birthHighwater;currentQuestion=null;questionSerial++;frame=null;for(const b of d.dummyBirths)births.set(g.vivos[b.index],Object.freeze({actor:c.context.actor(),generation:b.generation,birth:b.birth}));return ()=>{undo();({births,birthSerial,currentQuestion,questionSerial,frame}=old);};}};
 }});return port; // Private restoration binding; never a writer on window.
}

export { connectM03Foundation };
