import { bindSemantic, requireRestorePermit, semanticPort, clone } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { EVALUATION_BANK } from '../sources/ACCEPTED_CAMPAIGN/experimental/p2-evaluation-bank.js';
import { requireVerifiedPractice } from '../sources/ACCEPTED_CAMPAIGN/experimental/m03-foundation-domain-p2.js';
import { createEvaluationMotor } from '../sources/ACCEPTED_CAMPAIGN/experimental/p2-evaluation-motor.js';
import { createEvaluationDomain, requireEvaluationProof } from '../sources/ACCEPTED_CAMPAIGN/experimental/p2-evaluation-domain.js';

const institutional=new WeakMap();
function requireM03Institution(cap){const d=institutional.get(cap);if(!d||!d.current())throw Error('P3_M03_PRIVATE_PROOF_REQUIRED');return d;}
const installed=new WeakSet(),fail=c=>{throw Error(c);},copy=x=>structuredClone(x);
function connectM03Evaluation({runtime,readOwner,readLearning,foundation,fault=null,institutionTransaction=null}){
 if(installed.has(runtime)||typeof foundation?.capturePractice!=='function')fail('P2_PRIVATE_COMPOSITION');installed.add(runtime);
 const g=runtime;let question=null,serial=0,talkFrame=null,formalized=false,formalizing=false;
 const stats={formalizations:0};const tick=p=>{if(fault)fault(p);};
 const stamp=()=>JSON.stringify({room:g.pos,turn:g.turnoGlobal,quests:g.quests,flags:g.flags,positions:g.posicionNPC,ended:g.terminado,combat:!!g.combate});
 function common(){try{const o=readOwner().state,k=readLearning();if(!g.player||g.terminado!==false||g.combate!==null||g.quests?.M02!=='hecha'||g.quests?.M03!=='activa'||o.stage!=='LianQi_I'||o.actorId!=='player'||k.status!=='READY')return null;
  const proof=foundation.capturePractice(),p=requireVerifiedPractice(proof);if(p.actor!==g.player||p.generation!==k.generation)return null;
  return {actor:g.player,generation:k.generation,stamp:stamp(),practiceProof:proof};
 }catch{return null;}}
 function read(){const c=common();return c&&g.pos==='patio_respiracion'?c:null;}
 function publishEvaluation(cap,inspect,privateState){inspect(cap);const old=g.flags,a=copy(old);
  if(a.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA||a.arc1.evaluacionCirculacion==='SUPERADA')fail('P2_PUBLIC_EVALUATION_CONFLICT');
  a.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA=true;a.arc1.evaluacionCirculacion='SUPERADA';
  try{tick('EVAL_BEFORE_PUBLISH');g.flags=a;tick('EVAL_AFTER_FLAGS');privateState.publish();tick('EVAL_AFTER_PRIVATE');tick('EVAL_BEFORE_CONFIRM');}
  catch(e){g.flags=old;privateState.rollback();throw e;}
 }
 const motor=createEvaluationMotor({read}),domain=createEvaluationDomain({read,motor,commit:publishEvaluation});
 function cancel(clear=true){domain.cancel();serial++;if(clear&&question&&g.pregunta===question){g.pregunta=null;g.desactivarEleccionActiva();}question=null;}
 function ask(){let step;try{step=domain.step();}catch{cancel();return;}if(!step)return;
  const s=++serial;let q;g.preguntarEleccionMultiple({contexto:[step.scene],pregunta:step.question,opciones:step.options.map(o=>({valor:o.value,insignia:o.value+')',texto:o.text})).concat([{valor:'0',insignia:'0)',texto:EVALUATION_BANK.cancelOption.text}]),marcador:'(1/2/0)',hint:'1, 2 o 0',callback:value=>{
   if(s!==serial||question!==q||g.pregunta!==null)return;question=null;serial++;
   if(value.trim()==='0'){cancel(false);g.salida(EVALUATION_BANK.cancelText);return;}
   try{const option=step.options.find(o=>o.value===value.trim());if(!option)fail('P2_ACTION_NOT_AUTHORIZED');
    const result=motor.resolve(domain.attempt(),step.id,option.id);
    if(result.status==='CORRECTION'){domain.correction();g.salida(result.text);ask();return;}
    const outcome=domain.accept(result.receipt);
    if(outcome==='COMPLETED'){g.salida(EVALUATION_BANK.finalText,'destacado');return;}
    if(result.text)g.salida(result.text);ask();
   }catch{try{if(domain.step()){g.salida('La evaluación no se pudo acreditar. Puedes reintentar el paso.');ask();}else cancel();}catch{cancel();}}
  }});q=g.pregunta;question=q;
 }
 const oldMeditate=g.cmd_meditar;g.cmd_meditar=function(args=[]){
  if(this!==g||args.length||g.pos!=='patio_respiracion'||g.quests?.M03!=='activa')return oldMeditate.call(this,args);
  if(g.pregunta!==null)return 'Termina la interacción pendiente antes de evaluar los fundamentos.';
  const c=read();if(!c)return EVALUATION_BANK.missingPracticeText;
  if(domain.inspect().completed){
   try{requireEvaluationProof(domain.proof(c.actor,c.generation));if(!g.flags.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA||g.flags.arc1.evaluacionCirculacion!=='SUPERADA')fail('P2_MIRROR_CONFLICT');return EVALUATION_BANK.alreadyCompletedText;}catch{return 'La evaluación requiere una procedencia válida y coherente.';}
  }
  if(g.flags.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA||g.flags.arc1.evaluacionCirculacion==='SUPERADA')return 'La evaluación requiere una procedencia válida y coherente.';
  try{domain.begin();g.salida(EVALUATION_BANK.entryText);ask();return '';}catch{return EVALUATION_BANK.missingPracticeText;}
 };
 const oldTalk=g.cmd_hablar;g.cmd_hablar=function(...args){if(this!==g||g.pregunta!==null)return oldTalk.apply(this,args);
  const prior=talkFrame;talkFrame={used:false};try{return oldTalk.apply(this,args);}finally{talkFrame=prior;}};
 const oldMission=g.gestionarMisionesNpc;
 g.gestionarMisionesNpc=function(npc,...args){
  if(this!==g||npc!=='qiao_ren'||g.quests?.M03!=='activa')return oldMission.call(this,npc,...args);
  let acquired=false;try{
   if(formalizing)fail('P2_FORMALIZATION_REENTRANCY');const c=common();if(!c||!talkFrame||talkFrame.used||g.pos!=='pabellon_disciplina'||g.pregunta!==null||!g.npcPresente(npc,g.pos)||!g.npcsEnSala(g.pos).includes(npc)||formalized)fail('P2_QIAO_CONTEXT');
   requireEvaluationProof(domain.proof(c.actor,c.generation));if(!g.flags.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA||g.flags.arc1.evaluacionCirculacion!=='SUPERADA')fail('P2_QIAO_PROVENANCE');
   talkFrame.used=true;formalizing=true;acquired=true;
   // Run the original M03 handler once on a transaction draft. Preserve actual player identity and numeric fields on publication.
   const draft=Object.create(g);for(const k of ['flags','quests','player','posicionNPC','gates'])draft[k]=copy(g[k]);
   const result=oldMission.call(draft,npc,...args);
   if(result!=='Qiao Ren formaliza tu ingreso como discípulo externo.'||draft.quests.M03!=='hecha'||!draft.flags.arc1.hitos.M03_PROMOCION_FORMALIZADA)fail('P2_CANONICAL_FORMALIZATION_RESULT');
   const expectedPlayer=copy(g.player);expectedPlayer.facciones.grulla_blanca.estado='miembro';
   if(JSON.stringify(draft.player)!==JSON.stringify(expectedPlayer)||JSON.stringify(draft.gates)!==JSON.stringify(g.gates))fail('P2_UNEXPECTED_ORIGINAL_EFFECT');
   const old={flags:g.flags,quests:g.quests,posicionNPC:g.posicionNPC,facciones:g.player.facciones,formalized,count:stats.formalizations};
   const payout=institutionTransaction?.();
   try{tick('QIAO_BEFORE_PUBLISH');g.flags=draft.flags;tick('QIAO_AFTER_FLAGS');g.quests=draft.quests;tick('QIAO_AFTER_QUESTS');g.posicionNPC=draft.posicionNPC;tick('QIAO_AFTER_POSITIONS');g.player.facciones=draft.player.facciones;tick('QIAO_AFTER_FACTION');formalized=true;stats.formalizations++;tick('QIAO_AFTER_PRIVATE');payout?.commit();tick('R56_AFTER_PAYOUT_COMMIT');}
   catch(e){payout?.rollback();g.flags=old.flags;g.quests=old.quests;g.posicionNPC=old.posicionNPC;g.player.facciones=old.facciones;formalized=old.formalized;stats.formalizations=old.count;throw e;}
   return result;
  }catch{return 'Completa la práctica y medita en el patio de respiración.';}finally{if(acquired)formalizing=false;}
 };
 const oldEnter=g.entrarSala;g.entrarSala=function(...args){if(this===g){if(formalizing)fail('P2_FORMALIZATION_REENTRANCY');cancel();}return oldEnter.apply(this,args);};
 for(const name of ['nuevaPartida','crearPersonaje']){const old=g[name];g[name]=function(...args){if(this===g){if(formalizing)fail('P2_FORMALIZATION_REENTRANCY');cancel();domain.reset();formalized=false;stats.formalizations=0;}return old.apply(this,args);};}
 const api=Object.freeze({inspect:()=>Object.freeze({...domain.inspect(),formalizations:stats.formalizations}),captureInstitution(){const k=readLearning(),actor=g.player;if(!formalized||g.quests.M03!=='hecha'||k.status!=='READY')fail('P3_M03_PRIVATE_PROOF_REQUIRED');const ep=domain.proof(actor,k.generation);requireEvaluationProof(ep);const cap=Object.freeze({});institutional.set(cap,Object.freeze({actor,generation:k.generation,current:()=>{try{return formalized&&g.player===actor&&readLearning().generation===k.generation&&g.quests.M03==='hecha'&&!!requireEvaluationProof(ep);}catch{return false;}}}));return cap;}});
 bindSemantic(api,{capture(){return clone({version:1,evaluation:semanticPort(domain).capture(),formalized});},prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||d.formalized&&!d.evaluation.completed)throw Error('G08_M03_PROVENANCE');const p=semanticPort(domain).prepare(d.evaluation,c);return {apply(){const old={formalized,question,serial,talkFrame},undo=p.apply();formalized=d.formalized;question=null;serial++;talkFrame=null;return ()=>{undo();({formalized,question,serial,talkFrame}=old);};}};}});return api;
}

export { connectM03Evaluation, requireM03Institution };
