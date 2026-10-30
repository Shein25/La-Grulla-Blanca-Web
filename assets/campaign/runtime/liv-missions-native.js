import { validateNativeM18Final } from './a09-native-validation.js';
import { a09Requirements } from './a09-native-gates.js';
import { clone, canonical, bindSemantic, requireRestorePermit } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { visibleMissionLabel } from './m15-visibility.js';

const COUNCIL=['ji_xueying','qiao_ren','he_zhen','lan_meihua','song_rui'];
const FRONTS={MEDICINA:{area:'medicina',leader:'lan_meihua',support:['chen_bo','yao_fen','mei_lian'],prepare:['M10'],room:'sala_recuperacion'},RUTAS:{area:'bosques',leader:'jiang_rui',support:['ren_bo','lin_yue','guo_chen'],prepare:['M04','M05'],room:'bosque_refugio_patrulla'},FORMACIONES:{area:'formaciones',leader:'he_zhen',support:['wen_tao','zhao_wen','luo_yan'],prepare:['M08','M11','M12'],room:'formaciones_camara_central'},RECURSOS:{area:'produccion',leader:'duan_shibo',support:['ma_qiren','lu_cheng','han_qiao','guo_chen'],prepare:['M13'],room:'almacen_materiales'},SAUCES:{area:'sauces',leader:'xu_an',support:['mei_lian','mei_shufen'],prepare:['M05'],room:'sauces_canal_bajo'},JARDINES:{area:'jardines',leader:'su_lian',support:['mei_lian'],prepare:[],room:'canal_principal'}};
const visibleText=text=>String(text).replace(/\bM(0[4-9]|1[0-8])\b/g,(_,n)=>visibleMissionLabel('M'+n));
function connectLivMissions({runtime:g,bridge,input,definitions:quests,source,rooms,a09=null,m15Completed=()=>false}){
 const specs=new Map(source.missions.filter(m=>/^M(13|14|15|16|17|18)$/.test(m.id)).map(m=>[m.id,m]));let state=null,explicit=false;
 function ensure(){const o=bridge.herbalismIdentity();if(state?.generation!==o.generation)state={version:1,actorId:o.actorId,generation:o.generation,missions:{},permissions:{},receipts:[],council:null,crisis:null};return state;}
 const encounterRequirements=()=>a09?.requirements()||a09Requirements({stage:bridge.read().state.stage,room:g.pos,quests:g.quests,revelations:g.flags.arc1.revelaciones});
 const current=()=>input.current()&&g.player&&!g.terminado&&!g.combate&&!g.pregunta&&bridge.read().state.stage==='LianQi_IV';
 const present=npc=>g.npcPresente(npc,g.pos)&&g.npcsEnSala(g.pos).includes(npc);
 const mission=id=>ensure().missions[id];
 function receipt(type,extra={}){const s=ensure(),r={id:s.generation+':LIV:'+s.receipts.length,type,actorId:s.actorId,generation:s.generation,room:g.pos,turn:g.turnoGlobal,...extra};s.receipts.push(r);return r;}
 function mark(id,key,extra={}){const m=mission(id);if(!m||m.status!=='activa'||m.evidence[key])return false;m.evidence[key]=receipt('MISSION_EVIDENCE',{missionId:id,key,...extra});return true;}
 function start(id){if(mission(id))return mission(id);const m=ensure().missions[id]={status:'activa',evidence:{},started:receipt('MISSION_STARTED',{missionId:id})};g.quests[id]='activa';return m;}
 function project(){if(!state||!g.player)return;for(const[id,m]of Object.entries(state.missions))g.quests[id]=m.status;const a=g.flags.arc1,p=state.permissions;
  if(bridge.read().state.stage==='LianQi_IV')a.estado=state.missions.M18?.status==='hecha'?'EPILOGO':state.crisis?'LIV_CRISIS':'LIV_REVELACION';
  if(p.MANTENIMIENTO_INVESTIGACION)g.gates.PASO_MANTENIMIENTO=true;if(p.NUCLEO_SUPERIOR)g.gates.PASO_NUCLEO=true;if(p.NUCLEO_PROFUNDO)g.gates.PASO_PULSO=true;
  if(state.crisis)for(const[id,f]of Object.entries(state.crisis.fronts))if(f.result!=='PENDIENTE')a.hitos['crisis_'+id.toLowerCase()+'_resuelta']=true;
 }
 const oldNormalize=g.normalizarArc1;g.normalizarArc1=function(...args){const result=oldNormalize.apply(this,args);project();return result;};
 const has=(id,...keys)=>keys.every(k=>!!mission(id)?.evidence[k]);
 function ready(id){const m=mission(id);if(!m||m.status!=='activa')return false;
  if(id==='M13')return has(id,'duanBrief','heBrief','descent','warmConduits','recentSediment','advancedCounter','modernComparison');
  if(id==='M14')return !!state.permissions.NUCLEO_SUPERIOR&&has(id,'descent','voluntaryPact');
  if(id==='M15')return has(id,'threeDeferrals','posture');
  if(id==='M16')return !!state.crisis&&Object.values(state.crisis.fronts).every(f=>f.result!=='PENDIENTE');
  if(id==='M17')return !!state.permissions.NUCLEO_PROFUNDO&&has(id,'descent','R7','sentinel','relayRoom','R10');
  return false; // M18 requires the separate, authentic A09 terminal and choice.
 }
 function reward(id){const m=mission(id);if(m.status==='hecha')return [];m.status='hecha';m.closed=receipt('MISSION_CLOSED',{missionId:id});const reveal={M13:['R6'],M14:['R8'],M15:['R9'],M17:['R7','R10']}[id]||[];for(const r of reveal)g.flags.arc1.revelaciones[r]='CONFIRMADO';
  if(['M13','M14','M15','M17'].includes(id))g.player.comprension=(g.player.comprension||0)+1;
  if(id==='M16'){state.permissions.EMERGENCIA_SECTA=null;releaseCrisis();}
  project();return [visibleText(specs.get(id).condicion_finalizacion)];
 }
 for(const[id,spec]of specs)quests[id]={id,nombre:spec.nombre,desc:visibleText(spec.condicion_activacion),objetivo:visibleText(spec.condicion_finalizacion),listo:()=>ready(id),progreso:()=>spec.objetivos_obligatorios.map(visibleText).join('\n'),recompensa:()=>reward(id)};
 function complete(id){if(!ready(id))return false;const before=clone(ensure());try{const result=g.completarMision(id);if(g.quests[id]!=='hecha')return false;g.salida(result.join('\n'));return true;}catch(e){state=before;project();throw e;}}
 function authorize(permission,id,npc){if(state.permissions[permission])return;state.permissions[permission]=receipt('INSTITUTIONAL_PERMISSION',{permission,missionId:id,issuer:npc});project();}
 function callCouncil(id){start(id);if(state.council)return;const origins={};for(const npc of COUNCIL){const p=g.posicionNPC[npc];if(p){origins[npc]=clone(p);g.anclarArc1(npc,id,'interior_sala_consejo','COUNCIL_'+id+'_HECHO');}}state.council={missionId:id,origins};g.salida('El Consejo se reunirá en la Sala del Consejo.');}
 function releaseCouncil(){const c=state.council;if(!c)return;g.flags.arc1.hitos['COUNCIL_'+c.missionId+'_HECHO']=true;for(const[npc,p]of Object.entries(c.origins))g.liberarArc1(npc,c.missionId,p.sala);state.council=null;}
 function anchorCrisis(){const c=state.crisis;for(const[id,f]of Object.entries(FRONTS)){const p=g.posicionNPC[f.leader];if(p&&rooms[p.sala]?.area===f.area&&!c.origins[f.leader]){c.origins[f.leader]=clone(p);g.anclarArc1(f.leader,'M16',p.sala,'CRISIS_SECTA_RESUELTA');}}}
 function releaseCrisis(){const c=state.crisis;if(!c)return;g.flags.arc1.hitos.CRISIS_SECTA_RESUELTA=true;for(const[npc,p]of Object.entries(c.origins))g.liberarArc1(npc,'M16',p.sala);}
 function activateCrisis(npc){if(state.crisis)return;start('M16');state.crisis={source:'T281',startedBy:npc,origins:{},interventions:[],selected:null,fronts:Object.fromEntries(Object.keys(FRONTS).map(k=>[k,{result:'PENDIENTE',observed:false,intervened:false,factors:null}]))};authorize('EMERGENCIA_SECTA','M16',npc);receipt('CRISIS_SIGNALS_RECEIVED',{missionId:'M16',source:'T281'});anchorCrisis();project();g.salida(visibleText(specs.get('M16').condicion_activacion));}
 function chooseFront(){const c=state.crisis;if(!c||c.interventions.length>=2)return;const available=Object.keys(FRONTS).filter(k=>!c.interventions.includes(k)),actor=g.player,room=g.pos;let used=false;
  g.preguntarEleccionMultiple({pregunta:'¿Dónde podés ser más útil?',opciones:[...available.map((id,i)=>({valor:String(i+1),texto:id})),{valor:'0',texto:'Volver'}],callback:v=>{if(used||actor!==g.player||room!==g.pos||!input.current())return;used=true;const id=available[Number(v)-1];if(!id)return;c.selected=id;receipt('CRISIS_PERSONAL_INTERVENTION_SELECTED',{missionId:'M16',front:id});g.salida('Dirígete a '+rooms[FRONTS[id].room].name+'. Investiga lo que ocurre y luego INTERVENIR para ayudar al sector.');}});
 }
 function resolveCrisis(){const c=state.crisis;if(!c||c.interventions.length<2)return;for(const[id,spec]of Object.entries(FRONTS)){const f=c.fronts[id];if(f.result!=='PENDIENTE')continue;
   const responsible=!!g.posicionNPC[spec.leader],preparation=spec.prepare.length?spec.prepare.every(k=>g.quests[k]==='hecha'):g.profesionDesbloqueada('herboristeria')===true;
   const support=spec.support.filter(n=>rooms[g.posicionNPC[n]?.sala]?.area===spec.area);
   const intervention=f.intervened;f.factors={responsible,preparation,support,intervention};
   f.result=intervention&&responsible&&(preparation||support.length)?'ESTABLE':!intervention&&responsible&&preparation&&support.length?'ESTABLE':responsible||preparation||support.length?'COSTOSO':'DAÑADO';f.minorDamageAlways=true;f.resolution=receipt('CRISIS_FRONT_RESOLVED',{missionId:'M16',front:id,result:f.result,factors:clone(f.factors)});
  }complete('M16');
 }
 const oldTalk=g.cmd_hablar;g.cmd_hablar=function(args=[]){explicit=['mision','misiones'].includes(String(args.at(-1)||'').toLowerCase());try{return oldTalk.call(this,args);}finally{explicit=false;}};
 const oldMission=g.gestionarMisionesNpc;g.gestionarMisionesNpc=function(npc,...args){const canonical=oldMission.call(this,npc,...args);if(!current()||!present(npc))return canonical;ensure();
  if(g.quests.M12==='hecha'&&m15Completed()===true&&!['activa','hecha'].includes(g.quests.M13)&&['duan_shibo','he_zhen'].includes(npc)&&!mission('M13'))start('M13');
  if(mission('M13')?.status==='activa'){
   if(npc==='duan_shibo')mark('M13','duanBrief',{npcId:npc});if(npc==='he_zhen')mark('M13','heBrief',{npcId:npc});
   if(has('M13','duanBrief','heBrief'))authorize('MANTENIMIENTO_INVESTIGACION','M13','duan_shibo/he_zhen');
   if(['duan_shibo','ma_qiren','lu_cheng','song_rui'].includes(npc)&&has('M13','warmConduits','recentSediment','advancedCounter'))mark('M13','modernComparison',{npcId:npc});
   if(complete('M13'))return visibleText(specs.get('M13').condicion_finalizacion);
   if(explicit&&['duan_shibo','he_zhen','ma_qiren','lu_cheng','song_rui'].includes(npc))return specs.get('M13').objetivos_obligatorios.map(visibleText).join('\n');
  }
  if(g.quests.M13==='hecha'&&!mission('M14')&&npc==='qiao_ren'){callCouncil('M14');return visibleText(specs.get('M14').condicion_activacion);}
  if(g.quests.M16==='hecha'&&!mission('M17')&&npc==='qiao_ren'){callCouncil('M17');return visibleText(specs.get('M17').condicion_activacion);}
  if(state.council&&g.pos==='interior_sala_consejo'&&npc==='ji_xueying'&&present('qiao_ren')){const id=state.council.missionId;authorize(id==='M14'?'NUCLEO_SUPERIOR':'NUCLEO_PROFUNDO',id,'ji_xueying/qiao_ren');if(id==='M17')g.flags.arc1.hitos.NUCLEO_PROFUNDO_AUTORIZADO=true;releaseCouncil();return 'La autorización queda registrada. Podés continuar el descenso indicado en el diario.';}
  if(g.quests.M15==='hecha'&&!mission('M16')&&Object.values(FRONTS).some(f=>f.leader===npc)){activateCrisis(npc);chooseFront();return '';}
  if(mission('M16')?.status==='activa'&&Object.values(FRONTS).some(f=>f.leader===npc)&&explicit){chooseFront();return '';}
  return canonical;
 };
 function investigate(){if(!current())return false;ensure();let changed=false;
  if(mission('M13')?.status==='activa'){const key={mantenimiento_galeria_conductos:'warmConduits',mantenimiento_cisterna:'recentSediment',mantenimiento_registro_consumo:'advancedCounter'}[g.pos];if(key&&state.permissions.MANTENIMIENTO_INVESTIGACION)changed=mark('M13',key)||changed;}
  if(mission('M14')?.status==='activa'&&state.permissions.NUCLEO_SUPERIOR&&g.pos==='nucleo_pozo_voto'){mark('M14','voluntaryPact',{source:'T289',evidence:'inscripciones/formacion/testigos/memoria_qi'});complete('M14');changed=true;}
  if(g.quests.M14==='hecha'&&!mission('M15')&&g.pos==='nucleo_archivo_promesa')start('M15');
  if(mission('M15')?.status==='activa'&&g.pos==='nucleo_archivo_promesa'){
   mark('M15','threeDeferrals',{source:'T289',sequence:['PROTOTIPO_INSUFICIENTE','RUPTURA_PRIMERA_ALA','NORMALIZACION_MANTENIMIENTO']});const actor=g.player,room=g.pos;let used=false;
   g.preguntarEleccionMultiple({contexto:[visibleText(specs.get('M15').condicion_finalizacion)],pregunta:'¿Cómo presentás el hallazgo?',opciones:[{valor:'1',texto:'Como deuda'},{valor:'2',texto:'Como riesgo técnico'},{valor:'3',texto:'Ambas cosas'}],callback:v=>{if(used||actor!==g.player||g.pos!==room||!input.current())return;const posture={1:'DEUDA',2:'RIESGO_TECNICO',3:'AMBAS'}[v];if(!posture)return;used=true;mark('M15','posture',{posture,source:'T289_HISTORY'});complete('M15');}});return true;
  }
  const c=state.crisis;if(mission('M16')?.status==='activa'&&c?.selected){const f=c.fronts[c.selected],spec=FRONTS[c.selected];if(g.pos===spec.room){f.observed=true;receipt('CRISIS_SECTOR_OBSERVED',{missionId:'M16',front:c.selected});changed=true;}}
  if(mission('M17')?.status==='activa'&&state.permissions.NUCLEO_PROFUNDO){if(['nucleo_galeria_pulso','nucleo_camara_regulacion'].includes(g.pos))changed=mark('M17','R7',{source:'T290',revelation:'DEPENDENCIA_VIVA'})||changed;
   if(g.pos==='nucleo_exterior_ancla'&&has('M17','R7','sentinel','relayRoom')){mark('M17','R10',{source:'T290',revelation:'MISMA_GRULLA'});complete('M17');changed=true;}}
  if(changed)g.salida('La evidencia queda registrada en el diario.');return changed;
 }
 function protocol(){if(!current()||mission('M17')?.status!=='activa'||!state.permissions.NUCLEO_PROFUNDO||g.pos!=='nucleo_camara_regulacion'||!has('M17','R7')||g.quests.M14!=='hecha'||g.quests.M15!=='hecha')return false;
  mark('M17','sentinel',{resolution:'PROTOCOLO',source:'T290',knowledge:['R8','R9']});g.flags.arc1.hitos.CENTINELA_RESUELTO_POR_PROTOCOLO=true;g.salida('El protocolo reconoce el conocimiento del pacto y del relevo aplazado. El paso queda resuelto, sin reliquia ni cadáver.');return true;
 }
 function intervene(){if(!current())return false;ensure();const c=state.crisis;
  if(mission('M16')?.status==='activa'&&c?.selected){const id=c.selected,f=c.fronts[id];if(g.pos!==FRONTS[id].room||!f.observed)return false;if(!f.intervened){f.intervened=true;c.interventions.push(id);receipt('CRISIS_SECTOR_INTERVENED',{missionId:'M16',front:id,source:'T281'});}c.selected=null;if(c.interventions.length<2)g.salida('Llegan nuevos avisos de los equipos. Consultá a una autoridad de la crisis para continuar.');resolveCrisis();return true;}
  if(g.quests.M17==='hecha'&&g.pos==='nucleo_santuario_vinculo'){if(!mission('M18'))start('M18');const r=a09?a09.requestEncounter().requirements:encounterRequirements();g.salida('M21: el encuentro sigue bloqueado. '+[...r.missing,...r.dependencies.map(d=>d.detail)].join(' · '));return true;}return false;
 }
 const oldExecute=g.ejecutar;g.ejecutar=function(verb,args=[]){if(verb==='investigar'&&investigate())return;if(verb==='protocolo'&&protocol())return;if(verb==='intervenir'&&intervene())return;return oldExecute.call(this,verb,args);};
 const oldMove=g.cmd_ir;g.cmd_ir=function(...args){const before=g.pos,result=oldMove.apply(this,args);if(current()&&before!==g.pos){ensure();if(mission('M13')?.status==='activa'&&g.pos==='mantenimiento_acceso'&&state.permissions.MANTENIMIENTO_INVESTIGACION)mark('M13','descent');if(mission('M14')?.status==='activa'&&g.pos==='nucleo_pozo_voto'&&state.permissions.NUCLEO_SUPERIOR)mark('M14','descent');if(mission('M17')?.status==='activa'&&state.permissions.NUCLEO_PROFUNDO){if(g.pos==='nucleo_descenso_pulso')mark('M17','descent');if(g.pos==='nucleo_sala_relevo'&&has('M17','sentinel'))mark('M17','relayRoom');}anchorCrisisSafe();}return result;};
 function anchorCrisisSafe(){if(state?.crisis&&mission('M16')?.status==='activa')anchorCrisis();}
 const deep=new Set(['nucleo_descenso_pulso','nucleo_galeria_pulso','nucleo_camara_regulacion','nucleo_sala_relevo','nucleo_exterior_ancla','nucleo_camara_memoria','nucleo_umbral_santuario','nucleo_santuario_vinculo']);
 function gate(from,to){if(!g.player)return null;const p=ensure().permissions;
  if(rooms[to]?.area==='mantenimiento'&&!p.MANTENIMIENTO_INVESTIGACION)return 'Mantenimiento requiere la autorización de investigación.';
  if(rooms[to]?.area==='nucleo'&&!p.NUCLEO_SUPERIOR)return 'El Núcleo Superior requiere autorización del Consejo.';
  if((deep.has(to)||to?.startsWith('l4_nuc_'))&&!p.NUCLEO_PROFUNDO)return 'El Núcleo Profundo requiere la excepción autorizada después de la crisis.';
  if(from==='nucleo_camara_regulacion'&&to==='nucleo_sala_relevo'&&!has('M17','sentinel'))return 'El Centinela custodia el paso. Resolvé su protocolo con el conocimiento del pacto.';
  if(to==='nucleo_exterior_ancla'&&!has('M17','R7','relayRoom'))return 'Antes de seguir, investigá la regulación y reconocé la Sala de Relevo.';
  return null;
 }
 const oldGate=g.bloqueoPaso;g.bloqueoPaso=function(from,direction){const to=rooms[from]?.exits?.[direction];return oldGate.call(this,from,direction)||gate(from,to);};
 const evidenceLabels={duanBrief:'Informe de Duan Shibo',heBrief:'Informe de He Zhen',descent:'Descenso autorizado',warmConduits:'Conducciones templadas',recentSediment:'Sedimento reciente',advancedCounter:'Contador avanzado',modernComparison:'Comparación moderna',voluntaryPact:'Pacto voluntario',threeDeferrals:'Tres aplazamientos',posture:'Postura expresada',R7:'Dependencia viva',sentinel:'Centinela resuelto',relayRoom:'Sala de Relevo conocida',R10:'Identidad del Ancla'};
 const oldRender=g.renderMisiones;g.renderMisiones=function(...args){const result=oldRender.apply(this,args);if(!g.player)return result;const host=document.getElementById('misContenido');if(!host)return result;for(const[id,m]of Object.entries(ensure().missions)){const card=document.createElement('details');card.dataset.questId=id;card.open=true;const title=document.createElement('summary');title.textContent=visibleMissionLabel(id)+' · '+specs.get(id).nombre+' · '+m.status;card.append(title);for(const[key,r]of Object.entries(m.evidence)){const line=document.createElement('p');line.textContent='✓ '+(evidenceLabels[key]||key)+' · '+rooms[r.room].name;card.append(line);}if(id==='M16'&&state.crisis)for(const[front,f]of Object.entries(state.crisis.fronts)){const line=document.createElement('p');line.textContent=front+' · '+(f.result==='PENDIENTE'?'Avisos en curso':f.result);card.append(line);}if(id==='M18'){const line=document.createElement('p');line.textContent='A09 pendiente: selección P4_CORREGIDA + ARMOR30_D2 + V25-C + V24-A cerrada; 33 valores documentados y homologación nativa en curso. No hay cierre, recompensa ni ascenso por INTERVENIR.';card.append(line);}host.append(card);}return result;};
 function validate(d){const s=d.LIVMissions,p=d.Player.state;if(!s||s.version!==1||s.actorId!==p.actorId||s.generation!==p.generation||!Array.isArray(s.receipts)||new Set(s.receipts.map(r=>r.id)).size!==s.receipts.length)throw Error('LIV_MISSION_SAVE_SCOPE');for(const[id,m]of Object.entries(s.missions)){if(!specs.has(id)||!['activa','hecha'].includes(m.status)||d.World.quests[id]!==m.status)throw Error('LIV_MISSION_SAVE_STATUS');if(m.status==='hecha'&&!s.receipts.some(r=>r.type==='MISSION_CLOSED'&&r.missionId===id))throw Error('LIV_MISSION_SAVE_COMPLETION');}
  for(const r of s.receipts)if(r.actorId!==p.actorId||r.generation!==p.generation||!rooms[r.room]||!Number.isSafeInteger(r.turn))throw Error('LIV_MISSION_SAVE_RECEIPT');
  if(s.permissions.NUCLEO_SUPERIOR&&s.missions.M13?.status!=='hecha'||s.permissions.NUCLEO_PROFUNDO&&s.missions.M16?.status!=='hecha')throw Error('LIV_MISSION_SAVE_PERMISSION_ORDER');
  if(s.missions.M16?.status==='hecha'&&(!s.crisis||Object.values(s.crisis.fronts).some(f=>f.result==='PENDIENTE')||s.permissions.EMERGENCIA_SECTA))throw Error('LIV_M16_SAVE_UNRESOLVED');
  if(s.missions.M17?.evidence.R10){const a=s.missions.M17.evidence;if(!a.R7||!a.relayRoom||a.R10.turn<a.R7.turn||a.R10.turn<a.relayRoom.turn)throw Error('LIV_M17_SAVE_REVELATION_ORDER');}
  if(Object.keys(s.missions).length&&!(p.stage==='LianQi_IV'||p.stage==='ZhuJi'&&d.B3Foundation?.foundation?.commitId===p.foundation?.commitId))throw Error('LIV_MISSION_SAVE_STAGE');
  const required={M13:['duanBrief','heBrief','descent','warmConduits','recentSediment','advancedCounter','modernComparison'],M14:['descent','voluntaryPact'],M15:['threeDeferrals','posture'],M17:['descent','R7','sentinel','relayRoom','R10']};
  const linked=r=>r&&s.receipts.some(x=>x.id===r.id&&canonical(x)===canonical(r));
  for(const[id,m]of Object.entries(s.missions)){
   const previous='M'+String(Number(id.slice(1))-1).padStart(2,'0');if(d.World.quests[previous]!=='hecha')throw Error('LIV_MISSION_SAVE_DEPENDENCY');
   if(!linked(m.started)||m.started.type!=='MISSION_STARTED'||m.started.missionId!==id)throw Error('LIV_MISSION_SAVE_START');
   for(const[key,r]of Object.entries(m.evidence))if(!linked(r)||r.type!=='MISSION_EVIDENCE'||r.missionId!==id||r.key!==key||r.turn<m.started.turn)throw Error('LIV_MISSION_SAVE_EVIDENCE');
   if(m.status==='hecha'&&(!linked(m.closed)||(required[id]||[]).some(k=>!m.evidence[k])))throw Error('LIV_MISSION_SAVE_REQUIRED_EVIDENCE');
  }
  const permissions={MANTENIMIENTO_INVESTIGACION:'M13',NUCLEO_SUPERIOR:'M14',NUCLEO_PROFUNDO:'M17',EMERGENCIA_SECTA:'M16'};
  for(const[key,r]of Object.entries(s.permissions))if(r&&(!linked(r)||r.type!=='INSTITUTIONAL_PERMISSION'||r.permission!==key||r.missionId!==permissions[key]))throw Error('LIV_MISSION_SAVE_PERMISSION_PROOF');
  if(s.crisis){const c=s.crisis;if(c.interventions.length>2||new Set(c.interventions).size!==c.interventions.length||Object.keys(c.fronts).sort().join()!==Object.keys(FRONTS).sort().join())throw Error('LIV_M16_SAVE_INTERVENTIONS');for(const[id,f]of Object.entries(c.fronts))if(!['PENDIENTE','ESTABLE','COSTOSO','DAÑADO'].includes(f.result)||f.intervened!==c.interventions.includes(id)||f.result!=='PENDIENTE'&&(!linked(f.resolution)||f.resolution.front!==id||f.resolution.result!==f.result))throw Error('LIV_M16_SAVE_FRONT_PROOF');}
  if(s.missions.M18?.status==='hecha'&&!validateNativeM18Final(d))throw Error('A09_NATIVE_TERMINAL_AND_CHOICE_REQUIRED');return true;
 }
 const api=Object.freeze({validate,inspect:()=>clone(ensure()),gate,ready,a09Requirements:encounterRequirements});bindSemantic(api,{capture:()=>clone(ensure()),prepare(saved,c){requireRestorePermit(c.permit,c.envelope);validate(c.envelope.domains);return {apply(){const before=state;state=clone(saved);project();return ()=>{state=before;project();};}};}});return api;
}

export { connectLivMissions };
