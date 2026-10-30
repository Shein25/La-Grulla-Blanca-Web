import { requireNativeCorpseObservation } from '../sources/ACCEPTED_CAMPAIGN/experimental/new-corpse-extraction.js';
import { clone, bindSemantic, requireRestorePermit } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { requireM03Institution } from './p2-evaluation-r56.js';
import { initial, createDomain, checkShape, LOOK04 } from './li-m05-domain.js';
import { LINES } from './li-dialogue-data.js';

const LI=new Set(['acceso','secta_exterior','medicina','jardines','produccion','reserva_aprendices_li']);
const NEW04='LI_NEW_M04_ORIENTACION';
const ARTICLES=new Set(['el','la','los','las','un','una','del','al','de']);
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/_/g,' ').trim().split(/\s+/).filter(x=>!ARTICLES.has(x)).join(' ');
function visibleQuestId(id){if(id==='ARC1_INJERTO_LIV_01')return 'M15';if(id===NEW04)return 'M04';if(id==='LI_NEW_M05_PRUEBA_CAMPO')return 'M05';const m=/^M(\d{2})$/.exec(id);return m&&Number(m[1])>=4?'M'+String(Number(m[1])+(Number(m[1])>=13?3:2)).padStart(2,'0'):id;}

// Mounted once by the native campaign composition. No public receipt writer.
function connectLiIntegration({runtime:g,bridge,input,roomDefinitions:rooms,npcResolver,questDefinitions,readInstitution}){
 let domain=null,scope=null,sequence=0;
 const receipts=new WeakMap();
 const owner=()=>bridge.herbalismIdentity();
 const stage=()=>bridge.read().state.stage;
 const institution=()=>{try{return requireM03Institution(readInstitution()).current()===true&&g.quests.M03==='hecha';}catch{return false;}};
 const valid=()=>input.current()&&g.player&&!g.terminado&&!g.combate&&!g.pregunta&&!(g.cbResultadoEl&&!g.cbResultadoEl.hidden);
 function ensure(){const o=owner(),key=o.actorId+':'+o.generation;
  if(scope!==key){scope=key;sequence=0;domain=make(initial(o.actorId,o.generation));}
  return domain;
 }
 function make(saved){let committed=clone(saved);return createDomain({actorId:saved.actorId,generation:saved.generation,initialState:saved,
  verifyReceipt:cap=>receipts.get(cap)||null,
  commitState(next,meta){const o=owner();
   if(!valid()||!institution()||stage()!=='LianQi_I'||next.actorId!==o.actorId||next.generation!==o.generation||meta.previousRevision!==committed.revision||next.revision!==committed.revision+1)throw Error('LI_NATIVE_COMMIT_STALE');
   checkShape(next);committed=clone(next);
  },
  mainM03Done:institution,stageVerified:()=>stage()==='LianQi_I'});}
 function dispatch(type,fields){if(!valid())return {status:'REJECTED_SCOPE'};const d=ensure(),o=owner(),cap=Object.freeze({});
  receipts.set(cap,Object.freeze({type,...fields,actorId:o.actorId,generation:o.generation,stage:stage(),eventId:'LI:'+o.generation+':'+(++sequence)+':'+crypto.randomUUID()}));
  try{return d.act(cap);}finally{receipts.delete(cap);}
 }
 const present=npc=>g.npcPresente(npc,g.pos)===true&&g.npcsEnSala(g.pos).includes(npc)&&g.posicionNPC[npc]?.sala===g.pos;
 function boundary(from,direction){const to=rooms[from]?.exits?.[direction];if(!to||!rooms[to])return null;
  try{if(stage()==='LianQi_I'&&!LI.has(rooms[to].area))return 'Esta ruta requiere LianQi II. Completa la preparación y el ascenso autorizado antes de salir del territorio de aprendices.';}catch{return 'No se pudo autenticar tu etapa de cultivo.';}
  return null;
 }
 const oldGate=g.bloqueoPaso;g.bloqueoPaso=function(from,direction){return oldGate.call(this,from,direction)||boundary(from,direction);};
 const oldMove=g.cmd_ir;g.cmd_ir=function(direction){const why=boundary(g.pos,direction);if(why){g.salida(why,'sistema');return false;}return oldMove.call(this,direction);};
 // The dispatcher otherwise charges a turn before cmd_ir. Reject before that point.
 const oldExecute=g.ejecutar;
 g.ejecutar=function(verb,args=[]){
  if(this===g&&!g.combate&&!g.pregunta&&!g.terminado){
   const why=boundary(g.pos,verb);if(why){g.salida(why,'sistema');return;}
   if(verb==='meditar'&&rooms[g.pos]?.area==='reserva_aprendices_li'){
    g.salida('La Reserva todavía no tiene una vena de meditación verificada. No se ha concedido Qi ni crédito de cultivo.','sistema');return;
   }
   if(verb==='examinar'&&rooms[g.pos]?.area==='reserva_aprendices_li'){
    const r=rooms[g.pos],focus=r.liFocus;
    if(!args.length){g.mostrarSala();return;}
    if(focus.aliases.some(a=>norm(a)===norm(args.join(' ')))){
     if(valid())dispatch('LOOK',{roomId:g.pos,focusId:focus.name,lookWasLocal:true,lookWasReadOnly:true});
     g.salida(focus.description);return;
    }
   }
  }
  return oldExecute.call(this,verb,args);
 };
 // Native mission channel runs before A07 socialization; no new NPC engine.
 let missionIntent=false;
 const oldTalk=g.cmd_hablar;g.cmd_hablar=function(args=[]){const explicit=['mision','misiones'].includes(norm(args.at(-1)||''));const clean=explicit?args.slice(0,-1):args;missionIntent=explicit;try{return oldTalk.call(this,clean);}finally{missionIntent=false;}};
 const oldMission=g.gestionarMisionesNpc;
 g.gestionarMisionesNpc=function(npc,...args){const canonical=oldMission.call(this,npc,...args);if(canonical)return canonical;
  if(this!==g||!valid()||!institution()||stage()!=='LianQi_I'||!present(npc))return canonical;
  const s=ensure().inspect(),b=s.m05;
  const talk=extra=>dispatch('NPC_TALK',{npcId:npc,roomId:g.pos,npcCopresent:true,canonicalAvailable:true,...extra});
  if(npc==='shen_baojun'&&g.pos==='sala_formas'){
   if(!s.m04.started){const r=talk();return r.status==='COMMITTED'?LINES.SHEN_M04_OFFER:canonical;}
   if(!s.m04.done)return LINES.SHEN_M04_IN_PROGRESS;
   if(!b.started){const r=talk();return r.status==='COMMITTED'?LINES.SHEN_M05_OFFER:canonical;}
   if(!missionIntent)return canonical; // Ordinary HABLAR keeps teaching/services available.
   if(b.done)return LINES.SHEN_M05_ALREADY;
   if(!b.briefed)return LINES.SHEN_M05_CHEN_REQUIRED;
   if(Object.values(b.kills).some((n,i)=>n<[5,7,8,6][i]))return LINES.SHEN_M05_QUOTAS_PENDING;
   if(!b.exam)return LINES.SHEN_M05_INSTRUCTIONS;
   if(!b.wolfWarning)return LINES.SHEN_M05_WARNING_PENDING;
   return b.wolf?LINES.SHEN_M05_INSTRUCTIONS:LINES.SHEN_M05_T1_WAIT;
  }
  if(npc==='chen_bo'&&g.pos==='sala_anatomica'&&b.started&&!b.done){
   if(!b.briefed){const r=talk({examProfessionNative:g.profesionDesbloqueada('examen')===true&&g.flags.arc1?.hitos.EXAMEN_ESPIRITUAL_APRENDIDO===true});return r.status==='COMMITTED'?LINES.CHEN_M05_BRIEF:LINES.SHEN_M05_CHEN_REQUIRED;}
   if(missionIntent)return b.exam?LINES.CHEN_M05_CORPSE_DONE:LINES.CHEN_M05_PROGRESS;
  }
  if(npc==='qiao_ren'&&g.pos==='pabellon_disciplina'&&b.started){
   if(b.done&&!b.qiaoValidated){const r=talk();if(r.status==='COMMITTED')return LINES.QIAO_M05_DONE;}
   if(missionIntent)return b.done?LINES.QIAO_M05_DONE:LINES.QIAO_M05_PENDING;
  }
  return canonical;
 };
 const oldHandin=g.cmd_entregar;
 g.cmd_entregar=function(args=[]){const npc=npcResolver(args.join(' '),g.npcsEnSala(g.pos));
  if(this!==g||npc!=='shen_baojun'||g.pos!=='sala_formas'||!valid()||!institution()||!present(npc)||stage()!=='LianQi_I')return oldHandin.call(this,args);
  const s=ensure().inspect();if(!s.m04.started)return oldHandin.call(this,args);
  const r=dispatch('NPC_HANDIN',{npcId:npc,roomId:g.pos,npcCopresent:true,canonicalAvailable:true});
  if(r.status==='COMMITTED')return r.reason==='M04_COMPLETED'?LINES.SHEN_M04_COMPLETE:LINES.SHEN_M05_COMPLETE;
  if(!s.m04.done)return LINES.SHEN_M04_HANDIN_BLOCKED;
  return s.m05.started?(s.m05.done?LINES.SHEN_M05_ALREADY:LINES.SHEN_M05_HANDIN_BLOCKED):LINES.SHEN_M04_ALREADY;
 };
 const oldRender=g.renderMisiones;
 function attachLiMissionCard(container,card,done){
  const title=done?'MISIONES COMPLETADAS':'MISIONES ACTIVAS';
  let group=[...container.querySelectorAll('details.mis-categoria')].find(el=>el.querySelector('summary')?.textContent.startsWith(title));
  if(!group){
   group=document.createElement('details');group.className='mis-categoria';group.open=!done;
   const head=document.createElement('summary');head.textContent=title;group.appendChild(head);
   const list=document.createElement('div');list.className='mis-lista';group.appendChild(list);
   if(done)container.appendChild(group);else container.insertBefore(group,container.firstChild);
  }
  const list=group.querySelector('.mis-lista');list.appendChild(card);
  group.querySelector('summary').textContent=title+' · '+list.querySelectorAll('.mis-entrada').length;
 }
 g.renderMisiones=function(...args){const result=oldRender.apply(this,args),container=document.getElementById('misContenido');
  // Existing entries are projections. QUESTS, flags and native mission owners stay unchanged.
  for(const element of container.querySelectorAll('.mis-nombre')){
   const qid=Object.keys(questDefinitions).find(id=>element.textContent.startsWith(questDefinitions[id].nombre));
   if(qid&&qid!=='P')element.prepend(document.createTextNode(visibleQuestId(qid)+' · '));
  }
  const s=ensure().inspect();if(!s.m04.started)return result;
  const card=document.createElement('details');card.className='mis-entrada '+(s.m04.done?'hecha':'activa');card.dataset.questId=NEW04;card.open=true;
  const title=document.createElement('summary');title.textContent='M04 · Los senderos del aprendiz'+(s.m04.done?' · Completada':'');card.appendChild(title);
  const info=document.createElement('p');info.textContent='Shen Baojun · Sala de Formas. Reconoce las señales de la Reserva de los Aprendices y entrega tu informe. Sin recompensa económica ni ascenso automático.';card.appendChild(info);
  const list=document.createElement('ul');for(const [id,focus]of Object.entries(LOOK04)){const item=document.createElement('li');item.textContent=(s.m04.looks[id]?'✓ ':'○ ')+rooms[id].name+' · MIRAR '+focus;list.appendChild(item);}card.appendChild(list);
  const next=document.createElement('p');next.textContent='SIGUIENTE PASO · '+(s.m04.done?'Reconocimiento registrado. HABLAR Shen Baojun MISIÓN para recibir la prueba de campo.':Object.values(s.m04.looks).every(Boolean)?'ENTREGAR Shen Baojun en Sala de Formas, cuando esté presente.':'Llega por Canal Principal → sur y examina las tres señales.');card.appendChild(next);attachLiMissionCard(container,card,s.m04.done);
  const b=s.m05;if(b.started){
   const entry=document.createElement('details');entry.className='mis-entrada '+(b.done?'hecha':'activa');entry.dataset.questId='LI_NEW_M05_PRUEBA_CAMPO';entry.open=true;
   const heading=document.createElement('summary');heading.textContent='M05 · La prueba del bosque interior'+(b.done?' · Completada':'');entry.appendChild(heading);
   const intro=document.createElement('p');intro.textContent='Shen Baojun · Sala de Formas. Chen Bo · Sala Anatómica. Sólo cuentan vidas auténticas vencidas en combates ganados dentro de la Reserva. No hay ascenso ni recompensa automática.';entry.appendChild(intro);
   const goals=document.createElement('ul');for(const [id,n]of Object.entries({rata_qi:5,serpiente_qi:7,avispa_jade:8,mono_pildoras:6})){const line=document.createElement('li');line.textContent=({rata_qi:'Ratas',serpiente_qi:'Serpientes',avispa_jade:'Avispas',mono_pildoras:'Macacos'})[id]+': '+b.kills[id]+'/'+n;goals.appendChild(line);}
   for(const [done,label]of [[b.briefed,'Instrucción de Chen Bo sobre Examen Espiritual'],[!!b.exam,'Examen auténtico de un cadáver de una victoria registrada'],[b.wolfWarning,'MIRAR marcas de orientación · Meseta del Agua Clara'],[!!b.wolf,'Lobo Espiritual de Tres Colas T1 certificado al comenzar el encuentro'],[b.done,'ENTREGAR Shen Baojun'],[b.qiaoValidated,'Informe validado por Qiao Ren sin ascenso']]){const line=document.createElement('li');line.textContent=(done?'✓ ':'○ ')+label;goals.appendChild(line);}entry.appendChild(goals);
   const step=document.createElement('p');step.textContent='SIGUIENTE PASO · '+(!b.briefed?'HABLAR Chen Bo en Sala Anatómica.':!b.wolfWarning?'MIRAR marcas de orientación en la Meseta del Agua Clara.':b.done?'HABLAR Qiao Ren para validar el informe.':'Completa las cacerías de la Reserva, examina un cadáver y presenta el resultado a Shen Baojun.');entry.appendChild(step);
   const hint=document.createElement('p');hint.textContent='HABLAR Shen Baojun MISIÓN consulta el encargo. HABLAR sin MISIÓN conserva el diálogo social y la enseñanza. EXAMEN usa el panel EXTRAER sobre un cadáver auténtico y local. Las derrotas no añaden victorias ni borran progreso legítimo. El ascenso requiere su píldora, cultivo y ritual originales; no se concede al cerrar la misión.';entry.appendChild(hint);attachLiMissionCard(container,entry,b.done);
  }
  const summary=document.getElementById('misResumen'),historical=Object.entries(g.quests).filter(([id])=>!id.startsWith('LI_NEW_')).map(([,status])=>status);
  const active=historical.filter(status=>status==='activa').length+Number(s.m04.started&&!s.m04.done)+Number(b.started&&!b.done);
  const completed=historical.filter(status=>status==='hecha').length+Number(s.m04.done)+Number(b.done);
  summary.textContent=active+' '+(active===1?'misión activa':'misiones activas')+' · '+completed+' completadas · Sólo se registra lo descubierto';return result;
 };
 function check(d){const saved=d.LIArc1,o=d.Player.state;checkShape(saved);
  if(saved.actorId!==o.actorId||saved.generation!==o.generation)throw Error('LI_SAVE_ACTOR_SCOPE');
  if(!LI.has(rooms[d.World.pos]?.area)&&o.stage==='LianQi_I')throw Error('LI_SAVE_POSITION_STAGE');
  if(saved.m04.started&&(!d.Institution.formalized||d.World.quests.M03!=='hecha'))throw Error('LI_SAVE_INSTITUTION');
  for(const v of [...saved.m05.victories,...(saved.m05.wolf?[saved.m05.wolf]:[])]){
   const life=o.lives.find(l=>l.lifeId===v.lifeId),proof=life?.liM05CombatOutcome;
   if(!life?.terminal||life.hp!==0||life.disposition!=='APPLIED'||life.id!==v.speciesId||!proof||proof.outcome!=='victoria'||proof.combatId!==v.combatId||proof.roomId!==v.roomId||proof.lifeId!==v.lifeId||rooms[v.roomId]?.area!=='reserva_aprendices_li')throw Error('LI_SAVE_COMBAT_OWNER_PROOF');
   if(v===saved.m05.wolf){const ecology=life.r60LastEncounter;if(ecology?.effectiveTier!==1||ecology.kind!=='NATIVE_POPULATION_TIER_AT_ENCOUNTER_START'||ecology.combatId!==v.combatId||ecology.sourceHash!==v.ecologySourceHash||ecology.populationId!==v.populationId)throw Error('LI_SAVE_WOLF_ECOLOGY_PROOF');}
  }
  if(saved.m05.exam){const exam=saved.m05.exam,corpse=d.Corpses.corpses.find(c=>c.lifeId===exam.lifeId);if(!corpse?.record.observed||corpse.record.roomId!==exam.roomId||corpse.record.generation!==exam.corpseGeneration||!d.Corpses.examPermission)throw Error('LI_SAVE_EXAM_OWNER_PROOF');}
  return true;
 }
 function observeVictory(cap){const d=bridge.resolveMissionVictory(cap);if(!d)return {status:'REJECTED_NATIVE_OUTCOME'};const e=d.ecology;
  return dispatch('COMBAT_VICTORY',{...d,eventId:undefined,effectiveTier:e?.effectiveTier??null,tierFromNativeEcology:!!e,ecologySource:e?.kind,ecologySourceHash:e?.sourceHash,populationId:e?.populationId,territoryId:e?.territoryId,pressure:e?.pressure});
 }
 function observeCorpse(cap){const d=requireNativeCorpseObservation(cap);return dispatch('AUTHENTIC_CORPSE_EXAM',{lifeId:d.lifeId,roomId:d.roomId,areaId:rooms[d.roomId].area,corpseGeneration:d.corpseGeneration,nativeExamSuccessful:true,corpseGenuine:true});}
 const api=Object.freeze({validate:check,observeVictory,observeCorpse,inspect:()=>({m04:ensure().inspect().m04,m05:ensure().inspect().m05,namespace:'grulla_campana_jugable_cuatro_lobos_20261026_v1',population:'NATIVE_MOBILE_AUTHORIZED',ascension:'APPROVED_ORIGINALS_NATIVE_OWNER_PORT',a09:'REFERENCE_V33_V34_WORLD_DISABLED_P4_NOT_FINAL'})});
 bindSemantic(api,{capture:()=>ensure().inspect(),prepare(saved,c){requireRestorePermit(c.permit,c.envelope);check(c.envelope.domains);const next=make(clone(saved));return {apply(){const old={domain,scope,sequence};domain=next;scope=saved.actorId+':'+saved.generation;sequence=saved.revision;return ()=>({domain,scope,sequence}=old);}};}});
 return api;
}

export { connectLiIntegration, visibleQuestId };
