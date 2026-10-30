import { M15_ROOTS } from './m15-domain.js';

/* M15 authored quest dialogue bridge, A07 compatible. Not A07.9 free-form or AI dialogue.
 * Astra must mount on the native gestionarMisionesNpc/INVESTIGAR host after checking
 * original mission priority; must route all durable mutations via privileged G08.
 */
const fail=k=>{throw Error('M15_PORT_'+k);};
const npcRooms={he_zhen:'formaciones_sala_control',lan_meihua:'consultorio_meridianos',qiao_ren:'pabellon_disciplina'};
function option(id,text){return {id,text};}
function createM15QuestPort({domain,readContext,certify,readVerifiedGraftCommit}){
 if(!domain||typeof readContext!=='function'||typeof certify!=='function'||typeof readVerifiedGraftCommit!=='function')fail('DEPENDENCIES');
 const stamp=(ctx,where)=>({actorId:ctx.actorId,generation:ctx.generation,room:ctx.room,where,revision:domain.inspect().revision,turn:ctx.turn});
 const view=(kind,line,choices,ctx)=>({owner:'ARC1_M15_QUEST_CANONICAL',kind,missionId:domain.id,text:line,options:choices,stamp:stamp(ctx,kind)});
 function presentNpc(npcId){const ctx=readContext();if(!domain.eligible(ctx)||!(npcId in npcRooms)||ctx.room!==npcRooms[npcId]||ctx.npcId!==npcId||ctx.npcPresent!==true)return null;
  let s=domain.inspect();if(s.phase==='LOCKED'&&npcId==='he_zhen') {domain.start(ctx);s=domain.inspect();}
  if(s.phase==='LOCKED')return null;
  if(npcId==='he_zhen')return view('NPC',s.phase==='FORMATIONS'?'Volviste con una pregunta que merece una medida. ¿Qué diferencia aprendiste entre el principio Dos Alas y el fracaso de Segunda Rama?':s.formed?'Formaciones ya dejó constancia de la separación de cauces. No reemplaza la evaluación de Medicina.':'Primero tengo que ver las medidas.',s.phase==='FORMATIONS'?[option('HE_COEXIST','Cada corriente conserva sus límites dentro de un principio compartido.'),option('HE_REPLACE','Una corriente debe imponerse sobre la otra.'),option('HE_SKILL','Basta con aprender una técnica de otra raíz.'),option('CLOSE','Hablar después.')]:[],ctx);
  if(npcId==='lan_meihua')return view('NPC',s.phase==='MEDICAL'?'Conozco los cuerpos que fallaron en Segunda Rama. Si el ensayo no consigue estabilizarse, ¿qué vas a hacer?':!s.formed?'Sin el estudio de Formaciones sería irresponsable comenzar un examen.':s.medical?'Mi evaluación ya quedó en el expediente. Ahora le corresponde decidir a Disciplina.':'Primero presentá una constancia verificable de Formaciones.',s.phase==='MEDICAL'?[option('LAN_STOP','Interrumpir y preservar la primera corriente.'),option('LAN_FORCE','Insistir aunque los límites cedan.'),option('CLOSE','Volver después.')]:[],ctx);
  if(npcId==='qiao_ren')return view('NPC',s.phase==='DISCIPLINE'?'Con la lectura de Formaciones y la evaluación médica puedo examinar un permiso. No equivale a poseer el injerto.':!s.medical?'No autorizo ensayos por insistencia. Necesito las dos constancias firmes.':s.permission?'La autorización para el único ensayo consta en el registro. La Cámara decidirá si soporta la sintonización.':'Todavía no hay expediente suficiente.',s.phase==='DISCIPLINE'?[option('QIAO_AUTH','Solicitar autorización institucional para el ensayo.'),option('CLOSE','Volver después.')]:[],ctx);
  return null;
 }
 function presentChamber(){const ctx=readContext();if(!domain.eligible(ctx)||ctx.room!=='ala_camara_dos_alas')return null;
  const s=domain.inspect();if(!s.permission)return view('WORLD','Las marcas de Dos Alas permanecen inmóviles. Hace falta una autorización médica e institucional auténtica.',[],ctx);
  if(s.phase==='CHAMBER'){
   const ps=[{line:'Primer cauce: ¿qué debe conservarse?',choices:[option('CHAMBER:KEEP_PRINCIPAL','La raíz natal no se sustituye.'),option('CHAMBER:REPLACE_PRINCIPAL','La raíz natal debe borrarse.')]},{line:'Segundo cauce: ¿cómo impedir la colisión?',choices:[option('CHAMBER:KEEP_BOUNDARIES','Mantener límites independientes.'),option('CHAMBER:FORCE','Forzar que recorran exactamente el mismo cauce.')]},{line:'Sello de coexistencia: ¿cómo circulan las corrientes?',choices:[option('CHAMBER:COEXIST','Coexisten sin confundirse.'),option('CHAMBER:MERGE','La nueva corriente domina a la primera.')]}];return view('WORLD',ps[s.formationStep].line,ps[s.formationStep].choices,ctx);
  }
  if(s.phase==='DEFERRED')return view('WORLD','Decidiste mantener una sola raíz. El permiso de ensayo no se transforma en injerto. Podés volver mientras permanezcas en LianQi IV.',[option('REOPEN','Retomar la elección del injerto.'),option('CLOSE','Conservar el permiso y salir.')],ctx);
  if(s.phase==='COMMITTED')return view('WORLD','Dos corrientes distintas se han asentado. El Registro del Destino conserva el comprobante de un solo injerto.',[],ctx);
  if(s.phase==='CHOICE'){const roots=M15_ROOTS.filter(x=>x!==s.principalRoot);if(!s.selectedRoot)return view('WORLD','La formación está estable. Elegí una segunda raíz distinta de la natal o posponé el procedimiento.',[...roots.map(x=>option('ROOT:'+x,x)),option('DEFER','Posponer sin perder la investigación.')],ctx);
   return view('WORLD','Vas a conservar '+s.principalRoot+' y añadir '+s.selectedRoot+'. Esta decisión requiere confirmación verificable y es de un único uso.',[option('CONFIRM','Confirmar injerto de '+s.selectedRoot+'.'),option('CHANGE','Cambiar elección.'),option('DEFER','Posponer.')],ctx);
  }
  return null;
 }
 function apply(selection,visibleStamp){if(!visibleStamp||typeof selection!=='string')fail('INPUT');const ctx=readContext();const now=domain.inspect();if(ctx.actorId!==visibleStamp.actorId||ctx.generation!==visibleStamp.generation||ctx.room!==visibleStamp.room||now.revision!==visibleStamp.revision||ctx.turn!==visibleStamp.turn||!ctx.active||!ctx.noCombat||!ctx.noQuestion)fail('STALE_CHOICE');
  if(selection==='CLOSE')return {status:'CANCELLED',state:now};
  if(selection==='HE_COEXIST'||selection==='HE_REPLACE'||selection==='HE_SKILL'){const correct=selection==='HE_COEXIST';const proof=correct?certify('FORMATIONS_VERIFIED',ctx):null;return {status:correct?'CERTIFIED':'CORRECTION',...domain.choose('HE_ANSWER',correct?'COEXISTENCE':'WRONG',ctx,proof)};}
  if(selection==='LAN_STOP'||selection==='LAN_FORCE'){const correct=selection==='LAN_STOP';const proof=correct?certify('MEDICAL_VERIFIED',ctx):null;return {status:correct?'CERTIFIED':'CORRECTION',...domain.choose('LAN_ANSWER',correct?'STOP_AND_PRESERVE':'WRONG',ctx,proof)};}
  if(selection==='QIAO_AUTH')return {status:'AUTHORIZED',...domain.choose('QIAO_PERMISSION','YES',ctx,certify('INSTITUTIONAL_PERMISSION',ctx))};
  if(selection.startsWith('CHAMBER:')){const ans=selection.slice(8);const proof=ans==='COEXIST'?certify('FORMATION_STABLE',ctx):null;return {status:'CHAMBER_STEP',...domain.choose('CHAMBER_STEP',ans,ctx,proof)};}
  if(selection.startsWith('ROOT:'))return {status:'ROOT_SELECTED',...domain.choose('ROOT_SELECT',selection.slice(5),ctx)};
  if(selection==='REOPEN')return {status:'REOPEN',...domain.choose('REOPEN',null,ctx)};
  if(selection==='DEFER')return {status:'DEFERRED',...domain.choose('DEFER',null,ctx)};
  if(selection==='CHANGE')return {status:'CHOOSE_AGAIN',...domain.choose('ROOT_CLEAR',null,ctx)};
  if(selection==='CONFIRM'){
   if(!now.selectedRoot)fail('NO_SELECTION');
   // Emit an intent; only the privileged host can commit graft + G08. No browser-side mutation.
   return {status:'NATIVE_COMMIT_REQUIRED',intent:{missionId:domain.id,root:now.selectedRoot,actorId:ctx.actorId,generation:ctx.generation,expectedQuestRevision:now.revision}};
  }
  fail('OPTION_UNKNOWN');
 }
 function observeNativeCommitted(intent){const ctx=readContext(),s=domain.inspect();if(!intent||intent.missionId!==domain.id||intent.root!==s.selectedRoot||intent.actorId!==ctx.actorId||intent.generation!==ctx.generation||intent.expectedQuestRevision!==s.revision)fail('PENDING_MISMATCH');const proof=readVerifiedGraftCommit(intent);return {status:'GRAFT_COMMITTED',...domain.choose('GRAFT_RESULT',intent.root,ctx,proof)}; }
 return Object.freeze({presentNpc,presentChamber,apply,observeNativeCommitted,inspect:()=>domain.inspect()});
}

export { createM15QuestPort };
