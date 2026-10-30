import { requireRestorePermit } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';

const ports=new WeakMap(),copy=x=>structuredClone(x),fail=s=>{throw Error(s);};
const HERBALISM_SOURCE=Object.freeze({path:'sources/R54_AUTHORITY/R54_AUDIT/R54_LI_NO_NEW_OBJECTS/HANDOFF_R54_LI_NO_NEW_OBJECTS.md',sha256:'981d9d8e28f9843094f5298231c2ab7b9f1fdf59784470ee2f1a7cf6f0d4740b',locator:'TEACH_HERBALISM → profesión original; autorización humana R54 2026-10-23'});
const herbalismPortFor=g=>ports.get(g)||null;
function connectNativeHerbalism({runtime:g,bridge,visual}){
 const learned=new WeakMap(),usedEvents=new WeakSet(),original={};for(const k of ['profesionDesbloqueada','desbloquearProfesion','abrirInteraccionOficio','cerrarInteraccionOficio','renderInteraccionOficio'])original[k]=g[k];
 let busy=false,granting=false,panel=null,buttons=[],serial=0,lastError=null;const buttonProofs=new WeakMap(),records=[];
 const event=()=>bridge.herbalismEvent(),identity=()=>bridge.herbalismIdentity(),herb=()=>g.player?.profesiones?.herboristeria;
 function known(){const r=learned.get(g.player);return !!r&&herb()?.desbloqueada===true&&JSON.stringify(r)===JSON.stringify(herb().aprendizaje);}
 function present(){return g.npcPresente('su_lian',g.pos)===true&&g.npcsEnSala(g.pos).includes('su_lian')&&g.posicionNPC.su_lian?.sala===g.pos;}
 function quiescent(){return !!event()&&g.player&&!g.terminado&&!g.combate&&!g.pregunta&&!visual.inspect().active&&!busy&&identity().hp>0;}
 function allowed(){return !!g.player&&!g.terminado&&!g.combate&&g.quests.P==='hecha'&&['ADMITIDO','MIEMBRO'].includes(g.flags.arc1?.estadoAfiliacion)&&present();}
 function validateRecord(r,owner){if(!r)return;const keys=['version','intent','teacherId','actorId','generation','sourceSHA256'];if(JSON.stringify(Object.keys(r).sort())!==JSON.stringify(keys.sort())||r.version!==1||r.intent!=='TEACH_HERBALISM'||r.teacherId!=='su_lian'||r.actorId!==owner.actorId||r.generation!==owner.generation||r.sourceSHA256!==HERBALISM_SOURCE.sha256)fail('R54_HERBALISM_STORED_AUTHORITY');}
 g.profesionDesbloqueada=function(id){return this===g&&id==='herboristeria'?known():original.profesionDesbloqueada.call(this,id);};
 g.desbloquearProfesion=function(id){if(this===g&&id==='herboristeria'&&!granting)return 'Consulta a Su Lian para aprender Herboristería.';return original.desbloquearProfesion.call(this,id);};
 g.azarHerboristeria=function(){if(this!==g||!busy||!event())fail('R54_HERBALISM_RANDOM_AUTHORITY');return bridge.random();};
 const stamp=()=>({actor:g.player,generation:identity().generation,room:g.pos});
 const current=s=>s&&s.actor===g.player&&s.generation===identity().generation&&s.room===g.pos;
 g.abrirInteraccionOficio=function(tipo,...args){if(this===g&&tipo==='herboristeria'){if(!quiescent())return;panel=stamp();buttons=[];}return original.abrirInteraccionOficio.call(this,tipo,...args);};
 g.cerrarInteraccionOficio=function(...args){if(this===g){panel=null;buttons=[];}return original.cerrarInteraccionOficio.apply(this,args);};
 g.renderInteraccionOficio=function(...args){const result=original.renderInteraccionOficio.apply(this,args);if(this===g&&g.interaccionOficioTipo==='herboristeria'&&current(panel)){buttons=[...document.querySelectorAll('#interaccionOficio button')];for(const b of buttons)buttonProofs.set(b,panel);}return result;};
 const api=Object.freeze({
  available:npc=>npc==='su_lian'&&allowed(),
  initializeNew(){if(!g.player)return;g.normalizarProfesiones();herb().desbloqueada=false;delete herb().aprendizaje;panel=null;buttons=[];},
  validateWorld(player,owner){validateRecord(player.profesiones?.herboristeria?.aprendizaje,owner);},
  prepareRestore(player,owner,permit,envelope){requireRestorePermit(permit,envelope);const r=player.profesiones?.herboristeria?.aprendizaje;validateRecord(r,owner);return {apply(){const actor=g.player,previous=learned.get(actor);if(r)learned.set(actor,copy(r));else learned.delete(actor);panel=null;buttons=[];return ()=>{if(previous)learned.set(actor,previous);else learned.delete(actor);};}};},
  captureCheck(){if(herb()?.aprendizaje&&!known())fail('R54_HERBALISM_CAPTURE_AUTHORITY');},
  open(npc,back,propose){if(npc!=='su_lian'||!allowed()||!quiescent())return false;if(known()){g.abrirOficios('herboristeria');return true;}const actor=g.player,room=g.pos,gen=identity().generation,id=++serial;let used=false;
   g.preguntarEleccionMultiple({contexto:['Herboristería',bridge.definitions().herbalism.profession.descripcion||'Reconocer las plantas antes de intervenir.'],pregunta:'¿Quieres aprender este oficio?',opciones:[{valor:'1',texto:'Aprender herboristería'},{valor:'0',texto:'Cancelar'},{valor:'R',texto:'Volver a la conversación'}],callback:v=>{if(used)return;used=true;if(!quiescent()||g.player!==actor||g.pos!==room||identity().generation!==gen||id!==serial||!allowed())return;if(v!=='1'){if(v==='R')back();return;}let tx;try{
    const decision=propose();if(decision?.actorId!=='su_lian'||decision.turn!==g.turnoGlobal||decision.roomId!==g.pos||!decision.controllerDecision?.intentIds.includes('TEACH_HERBALISM'))fail('R54_TEACHING_A07_INTENT');
    tx=bridge.prepareHerbalismAction();busy=true;granting=true;herb().desbloqueada=false;const result=original.desbloquearProfesion.call(g,'herboristeria'),owner=identity(),r={version:1,intent:'TEACH_HERBALISM',teacherId:'su_lian',actorId:owner.actorId,generation:owner.generation,sourceSHA256:HERBALISM_SOURCE.sha256};herb().aprendizaje=r;learned.set(g.player,copy(r));
    tx.publish('TEACH_HERBALISM',{teacherId:'su_lian',xpGranted:0,source:HERBALISM_SOURCE});records.push({kind:'TEACH_HERBALISM',turn:g.turnoGlobal,actorId:owner.actorId});if(records.length>32)records.shift();busy=false;granting=false;g.salida(result);g.actualizarPanel();
   }catch(e){tx?.rollback();learned.delete(actor);lastError=e.message;g.salida('No se completó la enseñanza: '+e.message);}finally{busy=false;granting=false;}}});return true;
  },
  examine(args){const q=args.join(' '),matches=g.candidatosInteraccionOficio('herboristeria',q);if(matches.length!==1)return null;return g.recolectarPlanta(matches[0].indice,'examinar');},
  harvest(kernel,args){const e=event();if(!quiescent()||!known())return 'Herboristería requiere enseñanza auténtica de Su Lian y una interacción nativa vigente.';
   if(e.type==='click'&&(!current(panel)||!buttons.some(b=>b.contains(e.target)&&buttonProofs.get(b)===panel)||!document.getElementById('interaccionOficio')?.open))return 'La selección de recolección ya no pertenece a este contexto.';
   const plants=g.plantasEnSala(),index=Number(args[0]??0),node=plants[index];if(!Number.isInteger(index)||index<0||!node)return 'No hay una planta espiritual con ese número en esta sala.';
   const method=String(args[1]||'examinar').toLowerCase().trim(),observe=['examinar','observar','mirar'].includes(method);if(!observe&&usedEvents.has(e))return 'Esta intervención ya fue resuelta.';
   if(!observe)usedEvents.add(e);let tx;try{tx=bridge.prepareHerbalismAction();busy=true;const beforeXP=herb().xp,turn=g.turnoGlobal,result=kernel.apply(g,args),afterXP=herb().xp;if(g.turnoGlobal!==turn||observe)tx.publish('HERBALISM_ACTION_COMMITTED',{nodeId:node.id,speciesId:node.especie,method,observed:observe,xpGranted:afterXP-beforeXP,success:result.startsWith('Herboristería espiritual:'),source:HERBALISM_SOURCE});busy=false;return result;
   }catch(error){tx?.rollback();lastError=error.message;return 'No se completó la intervención: '+error.message;}finally{busy=false;}
  },
  inspect:()=>Object.freeze({known:known(),busy,lastError,source:HERBALISM_SOURCE,records:copy(records),newItemIds:0,newRecipes:0})
 });ports.set(g,api);return api;
}

export { HERBALISM_SOURCE, connectNativeHerbalism, herbalismPortFor };
