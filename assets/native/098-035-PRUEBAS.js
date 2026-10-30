const PRUEBAS = {
  casos: [],
  registrar(nombre, fn) { this.casos.push({ nombre, fn }); },

  // Un Juego aislado: personaje hecho, mundo limpio y toda la salida silenciada.
  banco({ raiz = Object.keys(RAICES)[0], origen = Object.keys(ORIGENES)[0], pos = "camino" } = {}) {
    const j = new Juego();
    const mudos = ["addLine", "salida", "eco", "abajo", "avisoAuto", "actualizarBarra",
      "actualizarPanel", "actualizarVitales", "actualizarMinimapa", "actualizarBotonMisiones",
      "recordarAtlas", "autoguardar", "mostrarHoja", "mostrarEquipo", "mostrarAccionesCombate",
      "mostrarSala", "renderMisiones", "renderMeridianos", "renderAtlas", "renderOficios", "renderCultivo",
      "preguntar", "bloque", "mostrarConsagracion", "mostrarQiAgotado"];
    for (const m of mudos) j[m] = () => {};
    j.rooms = JSON.parse(JSON.stringify(ROOMS));
    j.crearPersonaje("Probeta", raiz, origen);
    j.pos = pos;
    return j;
  },

  correr(filtro = null) {
    const lineas = [];
    let fallos = 0, total = 0;
    const semillaPrevia = Azar.semilla;
    for (const caso of this.casos) {
      if (filtro && !caso.nombre.toLowerCase().includes(filtro.toLowerCase())) continue;
      total++;
      let problemas;
      const fixtures = [MAPA_POS, MAPA_ETIQ, MAPA_CAPA_SALA].map(x => JSON.parse(JSON.stringify(x)));
      try { problemas = caso.fn() || []; }
      catch (ex) { problemas = ["excepción: " + ex.message]; }
      finally { [MAPA_POS, MAPA_ETIQ, MAPA_CAPA_SALA].forEach((tabla,i) => { for (const k of Object.keys(tabla)) delete tabla[k]; Object.assign(tabla, fixtures[i]); }); }
      if (problemas.length) {
        fallos++;
        lineas.push("  FALLA  " + caso.nombre);
        for (const p of problemas.slice(0, 8)) lineas.push("          · " + p);
        if (problemas.length > 8) lineas.push(`          · (y ${problemas.length - 8} más)`);
      } else {
        lineas.push("  ok     " + caso.nombre);
      }
    }
    Azar.semilla = semillaPrevia;
    return { total, fallos, lineas };
  },
};

// ---------- cultivo: rangos, hitos y normalización ----------

// 3C.4 REV2: pruebas de regresión de atracción, identidad y relojes.
const TEST_3C4 = {
  fijo() {
    const j = PRUEBAS.banco({ pos:"bosque_mirador_alto" });
    const c = j.buscarCandidatosAtraccion().find(x => x.tipo === "fijo");
    afirmar(!!c, "fixture fijo sin candidato real");
    return {j,c};
  },
  errante() {
    const j = PRUEBAS.banco({ pos:"tablon_encargos" });
    const c = j.buscarCandidatosAtraccion().find(x => x.tipo === "errante");
    afirmar(!!c, "fixture errante sin candidato real");
    return {j,c};
  },
  cuerpo(exito) {
    const j = PRUEBAS.banco({ pos:"bosque_senda_niebla" });
    j.desbloquearProfesion("examen");
    const cuerpo = {mob_id:"serpiente_qi",name:MOBS.serpiente_qi.name,corto:"serpiente",elemento:"agua",tipo:"cadáver",desapareceEn:j.turnoGlobal+1};
    j.cadaveres[j.pos] = [cuerpo];
    const signal = []; j.atraerHostilVecino = s => { signal.push(s); return null; };
    const before = j.turnoGlobal, random = Azar.random;
    try { Azar.random = () => exito ? 0 : 1; j.recolectarCadaver(0,"extraer glándula de jade"); }
    finally { Azar.random = random; }
    return {j,cuerpo,before,signal};
  }
};

PRUEBAS.registrar("3C.4 A: identidad XOR, save v2 y roundtrip sin campos nuevos", () => {
  const {j,c} = TEST_3C4.fijo(), m=j.materializarCandidatoAtraccion(c);
  afirmar(!!m && !!m.fijo_id && !m.errante_id && m.fijo_id===c.fijoId,"fijo anónimo o ID ajeno");
  const keys=Object.keys(j.serializar()).sort().join();
  afirmar(SAVE_SCHEMA_VERSION===2 && j.serializar().saveSchemaVersion===2,"schema cambió");
  j.vivos=[m]; j.entrarCombate(m,m.mob_id); m.hp=0;
  j.combate.turno("hoja",[]); j.combate=null;
  afirmar(j.respawnEn[c.fijoId]>j.relojEcologico,"muerte sin cooldown canónico de origen");
  const s=j.serializar(); afirmar(validarSave329(s).length===0,"save rechazado: "+validarSave329(s).join(", "));
  const k=PRUEBAS.banco(); afirmar(k.deserializar(s),"roundtrip rechazado");
  afirmar(Object.keys(k.serializar()).sort().join()===keys,"claves persistidas adicionales");
  afirmar(k.respawnEn[c.fijoId]===s.respawnEn[c.fijoId],"cooldown perdido al cargar");
  return [];
});

PRUEBAS.registrar("3C.4 B: vecinos, área, puerta y cooldown filtran candidatos", () => {
  const {j,c}=TEST_3C4.fijo(), base=j.buscarCandidatosAtraccion();
  afirmar(base.every(x=>x.roomOrigen!==j.pos && Object.values(ROOMS[j.pos].exits).includes(x.roomOrigen) && ROOMS[x.roomOrigen].area===ROOMS[j.pos].area),"candidato no contiguo o de otra área");
  j.respawnEn[c.fijoId]=j.relojEcologico+10;
  afirmar(!j.buscarCandidatosAtraccion().some(x=>x.fijoId===c.fijoId),"fijo en cooldown candidato");
  j.respawnEn[c.fijoId]=0;
  const gate={id:"TEST_3C4_GATE",extremos:[j.pos,c.roomOrigen]};
  GATES_329.push(gate); j.gates[gate.id]=false;
  try {
    afirmar(!j.buscarCandidatosAtraccion().some(x=>x.roomOrigen===c.roomOrigen),"puerta cerrada deja candidato");
    j.gates[gate.id]=true;
    afirmar(j.buscarCandidatosAtraccion().some(x=>x.fijoId===c.fijoId),"puerta abierta bloquea candidato");
  } finally { GATES_329.pop(); delete j.gates[gate.id]; }
  const u=Object.entries(ROOMS).flatMap(([rid,r])=>Object.values(r.exits||{}).map(dest=>({rid,dest}))).find(({rid,dest})=>ROOMS[dest]?.area===ROOMS[rid].area && (ROOMS[dest].mobs||[]).some(id=>MOBS[id]?.unico));
  afirmar(!!u,"fixture único ausente");
  const ju=PRUEBAS.banco({pos:u.rid}), uniqueId=ROOMS[u.dest].mobs.find(id=>MOBS[id]?.unico);
  ju.flags["muerto_"+uniqueId]=true;
  afirmar(!ju.buscarCandidatosAtraccion().some(x=>x.roomOrigen===u.dest&&x.mobId===uniqueId),"único muerto candidato");
  const {j:je,c:ce}=TEST_3C4.errante();
  je.errantes.find(x=>x.id===ce.erranteId).muertoHasta=je.relojEcologico+10;
  afirmar(!je.buscarCandidatosAtraccion().some(x=>x.erranteId===ce.erranteId),"errante muerto candidato");
  return [];
});

PRUEBAS.registrar("3C.4 C: fijo sobreviviente retorna al origen sin duplicarse", () => {
  const {j,c}=TEST_3C4.fijo(),m=j.materializarCandidatoAtraccion(c);
  afirmar(!!m && m.fijo_id===c.fijoId,"identidad de fijo atraído");
  j.vivos=[m]; j.entrarCombate(m,m.mob_id);
  const old=Azar.random; try {Azar.random=()=>0; const [,estado]=j.combate.turno("huir",[]); afirmar(estado==="huiste","no pudo huir");} finally {Azar.random=old;}
  afirmar(!j.vivos.includes(m),"fijo temporal persiste en vivos");
  afirmar(!j.respawnEn[c.fijoId],"se creó cooldown sin muerte");
  j.combate=null; j.pos=c.roomOrigen; j.entrarSala();
  afirmar(j.vivos.some(x=>x.fijo_id===c.fijoId),"no reaparece en origen");
  afirmar(j.vivos.filter(x=>x.fijo_id===c.fijoId).length===1,"fijo duplicado");
  return [];
});

PRUEBAS.registrar("3C.4 D: errante real permanece en la sala tras huir", () => {
  const {j,c}=TEST_3C4.errante(), e=j.errantes.find(x=>x.id===c.erranteId),m=j.materializarCandidatoAtraccion(c);
  afirmar(!!m && m.errante_id===c.erranteId && !m.fijo_id,"errante anónimo");
  afirmar(e.sala===j.pos,"errante no se trasladó");
  j.vivos=[m]; j.entrarCombate(m,m.mob_id);
  const old=Azar.random; try {Azar.random=()=>0; afirmar(j.combate.turno("huir",[])[1]==="huiste","no pudo huir");} finally {Azar.random=old;}
  afirmar(e.sala===j.pos && j.vivos.includes(m),"se aplicó retorno de fijo a errante");
  return [];
});

PRUEBAS.registrar("3C.4 D/G: SANGRE materializa identidad real con infraestructura común", () => {
  const {j,c}=TEST_3C4.errante(), old=Azar.random;
  try {Azar.random=()=>0; const m=j.atraerHostilVecino("SANGRE");
    afirmar(!!m && m.errante_id===c.erranteId && !m.fijo_id,"SANGRE inició mob anónimo");
    afirmar(j.combate?.e===m,"SANGRE no abrió combate con ese errante");
  } finally {Azar.random=old;}
  return [];
});

PRUEBAS.registrar("3C.4 E: vagabundeo local y cooldown global", () => {
  const j=PRUEBAS.banco({pos:"bosque_mirador_alto"}), area=ROOMS[j.pos].area;
  afirmar(j.errantes.length===11,"cambió número de errantes");
  afirmar(j.errantes.every(e=>e.territorio.every(r=>ROOMS[r]?.area===ROOMS[e.sala]?.area)),"territorio transárea");
  const remote=j.errantes.filter(e=>ROOMS[e.sala].area!==area).map(e=>[e,e.sala]);
  const local=j.errantes.filter(e=>ROOMS[e.sala].area===area).map(e=>[e,e.sala]);
  afirmar(local.length>0,"fixture sin errantes locales");
  const old=Azar.random; try {Azar.random=()=>0; j.moverErrantes();} finally {Azar.random=old;}
  afirmar(remote.every(([e,sala])=>e.sala===sala),"errante remoto se movió");
  afirmar(local.some(([e,sala])=>e.sala!==sala),"ningún errante del área activa se movió");
  const e=remote[0][0]; e.muertoHasta=j.relojEcologico+1; j.relojEcologico+=1; j.actualizarErrantes();
  afirmar(e.muertoHasta===0,"cooldown remoto no avanzó");
  return [];
});

PRUEBAS.registrar("3C.4 F: QI usa un candidato real y no fabrica mobs", () => {
  const {j}=TEST_3C4.fijo(); j.player.qi=0; j.vivos=[];
  const old=Azar.random; try {Azar.random=()=>0; j.cmd_meditar([]);} finally {Azar.random=old;}
  afirmar(!!j.combate,"QI favorable no inició combate");
  afirmar(j.combate.e && (!!j.combate.e.fijo_id!==!!j.combate.e.errante_id),"QI inició combate anónimo");
  const k=PRUEBAS.banco({pos:"bosque_mirador_alto"}); k.player.qi=0; k.vivos=[];
  k.buscarCandidatosAtraccion=()=>[];
  try {Azar.random=()=>0; k.cmd_meditar([]);} finally {Azar.random=old;}
  afirmar(!k.combate && k.vivos.length===0,"QI fabricó enemigo sin candidato");
  afirmar(!Juego.prototype.cmd_meditar.toString().includes("crearMob("),"spawn anónimo en meditación");
  return [];
});

PRUEBAS.registrar("3C.4 G: EXTRAER conserva vida en éxito, consume una en fallo", () => {
  const ok=TEST_3C4.cuerpo(true), bad=TEST_3C4.cuerpo(false);
  afirmar(ok.j.turnoGlobal===ok.before+1 && ok.cuerpo.desapareceEn-ok.j.turnoGlobal===1,"éxito no compensó el turno");
  afirmar(bad.j.turnoGlobal===bad.before+1 && bad.cuerpo.desapareceEn-bad.j.turnoGlobal===0,"fallo no consumió exactamente un turno");
  afirmar(ok.j.cadaveresEnSala().includes(ok.cuerpo),"cadáver exitoso expiró");
  afirmar(!bad.j.cadaveresEnSala().includes(bad.cuerpo),"cadáver fallido no expiró");
  afirmar(ok.signal.length===0 && bad.signal.join()==="SANGRE","señal SANGRE fuera de fallo");
  afirmar(PROB_ATRACCION_QI>0 && PROB_ATRACCION_SANGRE>0 && Juego.prototype.atraerHostilVecino.toString().includes("PROB_ATRACCION_QI") && Juego.prototype.atraerHostilVecino.toString().includes("PROB_ATRACCION_SANGRE"),"probabilidades no separadas");
  return [];
});

PRUEBAS.registrar("3C.4 H: guard defensivo y retiro de interrupción legacy", () => {
  const {j,c}=TEST_3C4.fijo();
  afirmar(j.materializarCandidatoAtraccion({...c,fijoId:"inventado"})===null,"aceptó ID fijo falso");
  afirmar(j.materializarCandidatoAtraccion({...c,roomOrigen:j.pos})===null,"aceptó autoatracción");
  afirmar(!("puedeInterrumpirMeditacion" in Juego.prototype),"helper legacy activo");
  return [];
});

PRUEBAS.registrar("3C.4 I/J: herboristería usa turnoGlobal y dormir no lo adelanta", () => {
  const procedimientos=Object.values(PLANTAS_ESPIRITUALES).flatMap(p=>p.procedimientos);
  afirmar(procedimientos.length===16,"número de procedimientos cambiado");
  const alojamiento=Object.keys(ROOMS).find(id=>ROOMS[id].alojamiento),j=PRUEBAS.banco({pos:alojamiento}), before=j.turnoGlobal,eco=j.relojEcologico;
  afirmar(!!alojamiento,"fixture sin alojamiento");
  j.player.hp=1;
  j.cmd_dormir();
  afirmar(j.player.hp===j.player.max_hp && j.relojEcologico>eco,"dormir no se ejecutó en fixture");
  afirmar(j.turnoGlobal===before,"dormir avanzó turnoGlobal");
  const her=Juego.prototype.recolectarPlanta.toString();
  afirmar(her.includes("turnoGlobal"),"deadline vegetal no usa turnoGlobal");
  const sleep=Juego.prototype.cmd_dormir.toString().toLowerCase();
  afirmar(!/respiración nocturna|paso de las horas|primera luz|amanecer|día\/noche/.test(sleep),"tiempo diegético en dormir");
  return [];
});

PRUEBAS.registrar("3C.4 ver72a: EXTRAER fallido abre combate SANGRE sin modal encima", () => {
  const j=PRUEBAS.banco({pos:"bosque_mirador_alto"}),dlg=document.getElementById("interaccionOficio");
  const cuerpo={mob_id:"serpiente_qi",name:MOBS.serpiente_qi.name,corto:"serpiente",elemento:"agua",tipo:"cadáver",caidoEn:0,desapareceEn:999};
  j.desbloquearProfesion("examen"); j.cadaveres[j.pos]=[cuerpo];
  const candidato=j.buscarCandidatosAtraccion()[0];
  afirmar(candidato?.tipo==="fijo","fixture sin fijo vecino elegible");
  const random=Azar.random,render=j.renderInteraccionOficio,turno=j.turnoGlobal;
  let tiradas=0,rendersTrasClick=0;
  try {
    if(dlg.open) dlg.close();
    j.abrirInteraccionOficio("examen",[]);
    afirmar(dlg.open,"EXTRAER no abrió el diálogo");
    const cabecera=dlg.querySelector(".ofi-parte-cabecera");
    afirmar(!!cabecera,"no se mostró el procedimiento");
    cabecera.click();
    const boton=[...dlg.querySelectorAll("button")].find(b=>b.textContent.trim()==="EXTRAER");
    afirmar(!!boton,"no se mostró el botón EXTRAER");
    j.renderInteraccionOficio=function(...args){rendersTrasClick++;return render.apply(this,args);};
    Azar.random=()=>++tiradas===1?1:0; // fallo anatómico; SANGRE y selección favorables.
    boton.click(); // handler real de la interfaz, sin sustituir atraerHostilVecino/entrarCombate.
    afirmar(!!j.combate,"SANGRE no inició combate");
    const mob=j.combate.e;
    afirmar(!!mob && (!!mob.fijo_id!==!!mob.errante_id),"enemigo sin identidad exclusiva");
    afirmar(mob.fijo_id===candidato.fijoId,"fijo_id no corresponde a la sala de origen");
    afirmar(!dlg.open,"modal EXTRAER quedó abierto sobre el combate");
    afirmar(rendersTrasClick===0,"EXTRAER volvió a renderizar tras abrir combate");
    afirmar(j.cbEl.hidden===false && j.zonaEl.classList.contains("en-combate"),"interfaz de combate inaccesible");
    afirmar(j.combate.e===mob && j.vivos.filter(x=>x===mob).length===1,"combate o criatura duplicados");
    afirmar(j.turnoGlobal===turno+1 && cuerpo.examenProcedimientos.glandula_jade==="fallo","estado del cadáver alterado o duplicado");
  } finally {
    Azar.random=random; j.renderInteraccionOficio=render;
    if(dlg.open) dlg.close();
    if(!j.cbEl.hidden) j.cerrarInterfazCombate();
  }
  return [];
});

// 3C.2: matriz de persistencia; fixtures aislados, sin modificar el contenido del mundo.
const SAVE_3C2_TEST = {
  clone: x => JSON.parse(JSON.stringify(x)),
  snapshot(j) { const s=j.serializar();delete s.fecha;return JSON.stringify(s); },
  atomic(data) {
    const j=PRUEBAS.banco(),antes=this.snapshot(j),refs=Object.fromEntries(['player','rooms','gates','visitadas','atlas','errantes','cadaveres','objetosTirados','saturacion','flags','quests'].map(k=>[k,j[k]]));
    const input=JSON.stringify(data),errors=validarSave329(data);
    afirmar(errors.length>0,'Validador aceptó inválido');afirmar(JSON.stringify(data)===input,'Validador mutó payload');
    afirmar(j.deserializar(data)===false,'Carga aceptó inválido');afirmar(this.snapshot(j)===antes,'Carga parcial');
    for(const [k,v]of Object.entries(refs))afirmar(j[k]===v,'Sustituyó identidad '+k);
  },
  storage(fn) {
    const keys=[CLAVE_VIEJA,CLAVE_AUTO,...Array.from({length:NSLOTS},(_,i)=>CLAVE_SLOT(i+1))],prev=keys.map(k=>localStorage.getItem(k));
    try {keys.forEach(k=>localStorage.removeItem(k));return fn();}finally{keys.forEach((k,i)=>{if(prev[i]===null)localStorage.removeItem(k);else localStorage.setItem(k,prev[i]);});}
  },
  ui() {const j=PRUEBAS.banco();j.out=[];j.salida=t=>j.out.push(t);j.preguntar=(t,callback)=>{j.out.push(t);j.pregunta={callback};};return j;},
  answer(j,s){const q=j.pregunta;afirmar(q,'Falta pregunta');j.pregunta=null;q.callback(s);},
  rich() {
    const j=bancoBuilds();j.pos='patio';j.turnoGlobal=20;j.relojEcologico=7;j.player.actividad_reposo=6;
    j.gates.SECTA_INTERIOR=true;j.establecerGate('M12',true);j.establecerGate('ATAJO_ALA_AGUAS',true);
    j.player.inventario.push('espada_madera');j.player.equipado.arma='espada_madera';
    j.elegirRama('palma',1,2);j.prepararTecnica('palma');j.guardarBuildActual('Persistencia');
    j.otorgarContribucion(12,'Prueba de persistencia');j.normalizarProfesiones();
    j.player.profesiones.examen.xp=3;j.player.profesiones.herboristeria.xp=7;
    j.player.profesiones.herboristeria.nodos.claridad_bambu_1={partes:{hojas:24},observaciones:1,exitos:1,cambios:1,cambioObservado:0,muertaHasta:0};
    j.aplicarAfliccion({tipo:'veneno',familia:'jade',grado:1,nombre:'Prueba',daño:'1',turnos:3},'prueba');
    j.registrarAccion('ROBAR',{clave:'save_rico',contexto:{recurso:'prueba'}});j.flags.prueba_persistencia=true;
    j.rooms.patio.items.push('pocion');(j.rooms.patio.oculto ||= []).push('pocion');j.visitadas.add('patio');
    Juego.prototype.recordarAtlas.call(j);j.recordarCriatura(crearMob('rata_qi',MOBS.rata_qi),true);
    j.saturacion.patio=2;j.interrupcionEn.patio=12;
    const [rid,room]=Object.entries(ROOMS).find(([,r])=>r.mobs.some(mid=>!MOBS[mid].unico));const mid=room.mobs.find(mid=>!MOBS[mid].unico);
    j.respawnEn[`${rid}:${mid}:${room.mobs.slice(0,room.mobs.indexOf(mid)+1).filter(x=>x===mid).length}`]=30;
    j.errantes[0].muertoHasta=12;j.errantes[0].desde=null;j.errantes[0].movidoEn=19;
    j.registrarCadaver(crearMob('rata_qi',MOBS.rata_qi));j.cadaveres.patio[0].investigado=['observado'];j.cadaveres.patio[0].examenProcedimientos={pelo:'exito'};
    j.objetosTirados.patio=[{mid:'pocion',desapareceEn:40}];return j;
  }
};
for(const version of [undefined,0,1,'2',3,-1]) PRUEBAS.registrar('3C.2 A: barrera antes de payload '+String(version),()=>{
  const j=PRUEBAS.banco(),d={saveSchemaVersion:version};let accessed=0;
  for(const k of ['player','pos','salas','rooms','atlas','gates'])Object.defineProperty(d,k,{get(){accessed++;throw Error('Payload leído');}});
  const before=SAVE_3C2_TEST.snapshot(j);afirmar(validarSave329(d).length>0,'Versión aceptada');afirmar(j.deserializar(d)===false,'Versión cargada');afirmar(accessed===0,'Leyó payload');afirmar(SAVE_3C2_TEST.snapshot(j)===before,'Mutó estado');
});
const SAVE_3C2_MUTATIONS = {
  'visitadas objeto':s=>s.visitadas={},'salas array':s=>s.salas=[],
  'items número':s=>s.salas.patio.items=123,'oculto objeto':s=>s.salas.patio.oculto={},
  'atlas null':s=>s.atlas=null,'atlas salidas extra':s=>s.atlas.salidas={},
  'atlas criatura null':s=>s.atlas.criaturas.rata_qi=null,
  'atlas salidas objeto':s=>s.atlas.salas.patio={salidas:{}},
  'errantes objeto':s=>s.errantes={},'player null':s=>s.player=null,
  'profesiones cadena':s=>s.player.profesiones='x','facciones número':s=>s.player.facciones=17,
  'técnica número':s=>s.player.tecnicas.palma=7,
  'sala faltante':s=>delete s.salas.patio,'sala extra':s=>s.salas.inexistente={items:[],oculto:[]},
  'sala inválida':s=>s.salas.patio=null,'item inexistente':s=>s.salas.patio.items.push('inexistente'),
  'gate número':s=>s.gates.M12=1,'gate faltante':s=>delete s.gates.M12,'gate extra':s=>s.gates.otra=false,
  'gate M12 sin interior':s=>s.gates.M12=true,
  'atajo sin interior':s=>s.gates[Object.keys(s.gates).find(k=>k.startsWith('ATAJO_ALA_'))]=true,
  'turno fraccionario':s=>s.turnoGlobal=0.5,'reloj negativo':s=>s.relojEcologico=-1,
  'respawn clave inválida':s=>s.respawnEn.inexistente=3,'respawn negativo':s=>s.respawnEn['patio:rata_qi:1']=-1,
  'saturación negativa':s=>s.saturacion.patio=-1,'interrupción room inválida':s=>s.interrupcionEn.inexistente=3,
  'objeto tirado null':s=>s.objetosTirados.patio=[null], 'objeto tirado expiración':s=>s.objetosTirados.patio=[{mid:'pocion',desapareceEn:'x'}],
  'cadáver null':s=>s.cadaveres.patio=[null],'cadáver mob inválido':s=>s.cadaveres.patio=[{mob_id:'inexistente'}],
  'errante null':s=>s.errantes[0]=null,'errante duplicado':s=>s.errantes[0]=s.errantes[1],
  'errante territorio':s=>s.errantes[0].territorio=['patio'],'errante origen':s=>s.errantes[0].origen='patio',
  'build null':s=>s.player.builds=[null],'aflicción null':s=>s.player.aflicciones=[null],
  'historial evento null':s=>s.player.historialAcciones.eventos=[null],
  'historial arco null':s=>s.player.historialArcos=[null],
  'historial reino null':s=>s.player.historialReinos=[null],
  'historial version':s=>delete s.player.historialAcciones.version,
  'afinidad array':s=>s.player.afinidad=[],'equipado array':s=>s.player.equipado=[],
  'fecha inválida':s=>s.fecha=1e20,'pos inexistente':s=>s.pos='inexistente',
  'nodo corrupto':s=>s.player.profesiones.herboristeria.nodos.claridad_bambu_1=null,
  'receta corrupta':s=>s.player.profesiones.alquimia.recetas.sangre=null,
  'facción historial corrupto':s=>s.player.facciones.grulla_blanca.historial='x'
};
for(const [name,mutate]of Object.entries(SAVE_3C2_MUTATIONS))PRUEBAS.registrar('3C.2 B/D/E/F/G: '+name,()=>{const s=PRUEBAS.banco().serializar();mutate(s);SAVE_3C2_TEST.atomic(s);});
for(const v of [null,[],{},0,'x',true])PRUEBAS.registrar('3C.2 B: JSON raíz '+JSON.stringify(v),()=>SAVE_3C2_TEST.atomic(v));
for(const field of ['gates','player','pos','flags','quests','salas','visitadas','atlas','saturacion','turnoGlobal','relojEcologico','respawnEn','interrupcionEn','errantes','cadaveres','objetosTirados','fecha'])PRUEBAS.registrar('3C.2 C/G: obligatorio '+field,()=>{const s=PRUEBAS.banco().serializar();delete s[field];SAVE_3C2_TEST.atomic(s);});
for(const field of ['cultivo_version','profesiones_version','facciones_version','meridianos_version','equipo_version','builds_version'])PRUEBAS.registrar('3C.2 F/G: marcador '+field,()=>{const s=PRUEBAS.banco().serializar();delete s.player[field];SAVE_3C2_TEST.atomic(s);});
PRUEBAS.registrar('3C.2 H: roundtrip rico exacto y cancelación de transitorios',()=>{
  const source=SAVE_3C2_TEST.rich(),a=source.serializar();afirmar(validarSave329(a).length===0,JSON.stringify(validarSave329(a)));
  const j=PRUEBAS.banco();j.elaboracion={elecciones:[1]};j.alquimiaResultado={texto:'anterior'};j.pregunta={callback(){}};
  afirmar(j.deserializar(a),'Carga falló');const b=j.serializar();delete a.fecha;delete b.fecha;
  afirmar(JSON.stringify(a)===JSON.stringify(b),'Payload no idéntico');afirmar(j.elaboracion===null&&j.alquimiaResultado===null&&j.pregunta===null&&j.combate===null,'No canceló transitorios');
});
PRUEBAS.registrar('3C.2 G: rollback de excepción inesperada en render conserva identidades',()=>{
  const j=PRUEBAS.banco(),before=SAVE_3C2_TEST.snapshot(j),p=j.player,rooms=j.rooms;
  j.actualizarBarra=()=>{throw Error('Fallo simulado');};
  afirmar(j.deserializar(SAVE_3C2_TEST.rich().serializar())===false,'No rechazó fallo');
  afirmar(j.player===p&&j.rooms===rooms&&SAVE_3C2_TEST.snapshot(j)===before,'Rollback incompleto');
});
PRUEBAS.registrar('3C.2 I/L: clasificación y lectura sin escrituras',()=>SAVE_3C2_TEST.storage(()=>{
  const j=PRUEBAS.banco(),valid=j.serializar(),legacy={...valid,saveSchemaVersion:1};
  for(const [raw,estado]of [[null,'VACÍO'],[JSON.stringify(legacy),'INCOMPATIBLE'],[JSON.stringify(valid),'VÁLIDO'],['{"saveSchemaVersion":2}','CORRUPTO/INVÁLIDO'],['{roto','CORRUPTO/INVÁLIDO']]){
    if(raw===null)localStorage.removeItem(CLAVE_SLOT(1));else localStorage.setItem(CLAVE_SLOT(1),raw);
    const r=j.leerSlotDetallado(CLAVE_SLOT(1));afirmar(r.estado===estado,r.estado+' != '+estado);j.describirSlot(r);j.infoPartida(r.data);
    afirmar(localStorage.getItem(CLAVE_SLOT(1))===raw,'Reescribió slot');
  }
}));
for(const kind of ['válido','schema1','inválido','JSON roto'])PRUEBAS.registrar('3C.2 J: muerte auto '+kind,()=>SAVE_3C2_TEST.storage(()=>{
  const j=SAVE_3C2_TEST.ui(),s=j.serializar();let raw=JSON.stringify(s);if(kind==='schema1')raw=JSON.stringify({...s,saveSchemaVersion:1});if(kind==='inválido')raw='{"saveSchemaVersion":2}';if(kind==='JSON roto')raw='{';
  localStorage.setItem(CLAVE_AUTO,raw);j.muerte();const offered=j.out.some(t=>t.includes('(c)argar'));afirmar(offered===(kind==='válido'),'Oferta incorrecta');SAVE_3C2_TEST.answer(j,'c');
  afirmar(j.out.some(t=>t.includes('retrocedes al último autoguardado'))===(kind==='válido'),'Mensaje falso de éxito');
  afirmar(localStorage.getItem(CLAVE_AUTO)===raw,'Reescribió auto');
}));
PRUEBAS.registrar('3C.2 J: muerte no anuncia éxito si deserializar falla',()=>SAVE_3C2_TEST.storage(()=>{
  const j=SAVE_3C2_TEST.ui();localStorage.setItem(CLAVE_AUTO,JSON.stringify(j.serializar()));j.deserializar=()=>false;j.muerte();SAVE_3C2_TEST.answer(j,'c');afirmar(!j.out.some(t=>t.includes('retrocedes al último autoguardado')),'Falso éxito');
}));
for(const via of ['comando','botón'])for(const operation of ['guardar','cargar'])for(const action of ['éxito','cancelar','fallo'])PRUEBAS.registrar(`3C.2 K/L: ${via} ${operation} ${action}`,()=>SAVE_3C2_TEST.storage(()=>{
  const j=SAVE_3C2_TEST.ui();j.turnoGlobal=20;j.relojEcologico=7;j.player.actividad_reposo=4;
  j.registrarCadaver(crearMob('rata_qi',MOBS.rata_qi));j.objetosTirados[j.pos]=[{mid:'pocion',desapareceEn:21}];
  localStorage.setItem(CLAVE_SLOT(1),JSON.stringify(j.serializar()));const before=SAVE_3C2_TEST.snapshot(j);
  const original=Storage.prototype.setItem;
  if(operation==='guardar'&&action==='fallo')Storage.prototype.setItem=()=>{throw Error('Quota');};
  try{
    if(via==='comando')j.ejecutar(operation,[]);
    else {const name=operation==='guardar'?'menuGuardar':'menuCargar',old=juego[name];try{juego[name]=()=>j[name]();document.getElementById(operation==='guardar'?'btnGuardar':'btnCargar').click();}finally{juego[name]=old;}}
    if(operation==='cargar'&&action==='fallo')localStorage.setItem(CLAVE_SLOT(1),'{');
    SAVE_3C2_TEST.answer(j,action==='cancelar'?'0':'1');
    afirmar(SAVE_3C2_TEST.snapshot(j)===before,'Meta consumió turno o alteró estado');
    if(action==='fallo')afirmar(j.out.some(t=>/No se pudo guardar|Carga rechazada/.test(t)),'No informó fallo');
  }finally{Storage.prototype.setItem=original;}
}));
PRUEBAS.registrar('3C.2 I/L: arranque con sólo slots no cargables conserva datos y pide nueva',()=>SAVE_3C2_TEST.storage(()=>{
  const j=SAVE_3C2_TEST.ui();localStorage.setItem(CLAVE_SLOT(1),'{');localStorage.setItem(CLAVE_AUTO,'{"saveSchemaVersion":1}');let nueva=0;j.nuevaPartida=()=>nueva++;j.arranque();afirmar(nueva===1&&!j.pregunta,'Ofreció carga inválida');afirmar(localStorage.getItem(CLAVE_SLOT(1))==='{','Borró corrupto');
}));
PRUEBAS.registrar('3C.2 L: Nueva Partida no borra slots',()=>SAVE_3C2_TEST.storage(()=>{
  const j=SAVE_3C2_TEST.ui(),raw='{"saveSchemaVersion":1}';localStorage.setItem(CLAVE_SLOT(1),raw);j.nuevaPartida();afirmar(localStorage.getItem(CLAVE_SLOT(1))===raw,'Borró slot');
}));
PRUEBAS.registrar('3C.2 K: guardar y cargar en combate no consumen turno',()=>{
  const j=SAVE_3C2_TEST.ui();j.combate={turno(){throw Error('Ejecutó combate');}};for(const op of ['guardar','cargar']){const b=SAVE_3C2_TEST.snapshot(j);j.ejecutar(op,[]);afirmar(SAVE_3C2_TEST.snapshot(j)===b,'Avanzó combate');}
});
PRUEBAS.registrar('3C.2 L: serializar es puro incluso con objetos expirados',()=>{
  const j=PRUEBAS.banco();j.turnoGlobal=20;j.objetosTirados[j.pos]=[{mid:'pocion',desapareceEn:1}];const obj=j.objetosTirados,antes=JSON.stringify(obj);const s=j.serializar();afirmar(j.objetosTirados===obj&&JSON.stringify(obj)===antes,'Podó objetos');s.player.name='copia';afirmar(j.player.name!=='copia','Snapshot comparte referencias');
});
PRUEBAS.registrar('3C.2 B: fuzz determinista de tipos sin excepciones ni mutación',()=>{
  const valid=PRUEBAS.banco().serializar(),values=[null,[],{},false,true,0,-1,1.5,'x'];
  for(const field of Object.keys(valid))for(const value of values){const s=SAVE_3C2_TEST.clone(valid);s[field]=value;const before=JSON.stringify(s);afirmar(Array.isArray(validarSave329(s)),'No devolvió errores como lista');afirmar(JSON.stringify(s)===before,'Mutación en fuzz');}
});
PRUEBAS.registrar('3C.2 F: versiones internas incorrectas no se actualizan',()=>{
  for(const k of ['cultivo_version','profesiones_version','facciones_version','meridianos_version','equipo_version','builds_version']){const s=PRUEBAS.banco().serializar();s.player[k]=99;SAVE_3C2_TEST.atomic(s);}
  const s=PRUEBAS.banco().serializar();s.player.historialAcciones.version=0;SAVE_3C2_TEST.atomic(s);
});
PRUEBAS.registrar('3C.2 L: cuota de autoguardado informa error sin alterar estado',()=>SAVE_3C2_TEST.storage(()=>{
  const j=SAVE_3C2_TEST.ui(),before=SAVE_3C2_TEST.snapshot(j),old=Storage.prototype.setItem;
  try{Storage.prototype.setItem=()=>{throw Error('Quota');};afirmar(Juego.prototype.autoguardar.call(j)===false,'Autoguardado afirmó éxito');afirmar(j.out.some(t=>t.includes('No se pudo autoguardar')),'No informó error');afirmar(SAVE_3C2_TEST.snapshot(j)===before,'Alteró estado');}finally{Storage.prototype.setItem=old;}
}));
PRUEBAS.registrar('3C.2 I/L: error de lectura no rompe menús',()=>{
  const j=SAVE_3C2_TEST.ui(),old=Storage.prototype.getItem;
  try{Storage.prototype.getItem=()=>{throw Error('Storage bloqueado');};afirmar(j.leerSlotDetallado(CLAVE_AUTO).estado==='CORRUPTO/INVÁLIDO','Lectura sin clasificar');j.menuCargar();afirmar(!j.pregunta,'Ofreció carga');j.menuGuardar();}finally{Storage.prototype.getItem=old;}
});
PRUEBAS.registrar('3C.2 C: escribirSlot rechaza snapshot incompleto sin reescribir',()=>SAVE_3C2_TEST.storage(()=>{
  const j=PRUEBAS.banco();localStorage.setItem(CLAVE_SLOT(1),'preservar');afirmar(!j.escribirSlot(CLAVE_SLOT(1),{saveSchemaVersion:2}),'Escribió incompleto');afirmar(localStorage.getItem(CLAVE_SLOT(1))==='preservar','Reescribió');
}));

// 3C.1R: auditor de textos/código activos. Excluye el corpus de pruebas.
// Las palabras genéricas de fauna y los IDs canónicos no son destinos funcionales retirados.
function auditarTextosActivos3C1R(textos = null) {
  const muestras = [];
  const recoger = (v, ruta) => {
    if (typeof v === "string" || typeof v === "function") muestras.push({ruta,texto:String(v)});
    else if (v && typeof v === "object") for (const [k,d] of Object.entries(v)) recoger(d, `${ruta}.${k}`);
  };
  if (textos !== null) recoger(textos, "muestra");
  else {
    for (const [k,v] of Object.entries({AYUDA_SECCIONES,ROOMS,MOBS,ITEMS,QUESTS,NOMBRES_NPC,DESCS_NPC,ORIGENES,RAICES})) recoger(v,k);
    for (const k of Object.getOwnPropertyNames(Juego.prototype)) {
      if (k === "constructor") continue;
      const d = Object.getOwnPropertyDescriptor(Juego.prototype,k);
      for (const f of [d.value,d.get,d.set]) if (typeof f === "function") recoger(f,`Juego.${k}`);
    }
  }
  const reglas = [
    ["NPC retirado", /\b(?:Anciana\s+Kang|Fan\s+Ji)\b/i],
    ["proveedor retirado", /\bmercader\b/i],
    ["biblioteca como destino funcional", /(?:\b(?:ESTUDIAR|ESTUDIA)\s+(?:EL\s+)?INJERTO\b.{0,120}\b(?:en|a|hacia)\s+(?:la\s+)?biblioteca\b|["']biblioteca["'])/i],
    ["estanque como destino funcional", /(?:\b(?:MEDITA|MEDITAR)\b.{0,120}\b(?:en|al|hacia)\s+(?:el\s+)?estanque\b|["']estanque["'])/i],
    ["quest retirada", /(?:quests|QUESTS|activarMision|completarMision)\s*(?:\?\.)?\s*[\[(]\s*["'](?:ratas|duelo|hierbas|origen_personal|huerto_jade|jade|veta_y_horno|peces_lunares|devoradores|memorias_verticales|reliquias_verticales|cazadores_verticales|guardianes_ocultos)["']/],
    ["quest retirada por propiedad", /\bquests\.(?:ratas|duelo|hierbas|origen_personal|huerto_jade|jade|veta_y_horno|peces_lunares|devoradores|memorias_verticales|reliquias_verticales|cazadores_verticales|guardianes_ocultos)\b/],
  ];
  const fallos = [];
  for (const {ruta,texto} of muestras) {
    // Nombre ecológico conservado: no ofrece el estanque como destino.
    if (ruta === "MOBS.sombra_ahogada.name" && texto === "sombra ahogada del estanque") continue;
    for (const [regla,patron] of reglas) if (patron.test(texto)) fallos.push({ruta,regla});
  }
  if (textos === null && (Object.keys(QUESTS).length!==8||Object.keys(QUESTS).some(id=>!['P','M01','M02','M03','M04','M05','M06','M07'].includes(id))))
    fallos.push({ruta:"QUESTS",regla:"sólo se admiten P–M07"});
  return {ok:fallos.length === 0, muestras:muestras.length, fallos};
}

PRUEBAS.registrar("3C.1R: auditor de textos activos sin referencias funcionales retiradas", () => {
  const r = auditarTextosActivos3C1R();
  afirmar(r.ok, JSON.stringify(r.fallos));
});
PRUEBAS.registrar("3C.1R: auditor detecta regresiones sin bloquear términos genéricos", () => {
  const prohibidos = [
    "Anciana Kang", "Fan Ji", "mercader 8p",
    "ESTUDIAR INJERTO en la biblioteca", "Estudia el injerto en la biblioteca",
    "Medita en el estanque", "MEDITAR hacia el estanque",
    '"biblioteca"', "'biblioteca'", '"estanque"', "'estanque'",
    'this.quests["ratas"]', 'activarMision("jade")',
  ];
  for (const t of prohibidos)
    afirmar(!auditarTextosActivos3C1R([t]).ok, "No detectó: " + t);
  const permitidos = [
    "estanque_riego", "una biblioteca que nadie recuerda llena", "ratas en la vegetación", "jade espiritual",
    "Un canal trae agua al estanque y disipa parte de su fuerza antes de mezclarla con la reserva.",
    "Un tramo de infraestructura de riego más antiguo que los canales visibles desciende junto al estanque hasta una obra de piedra.",
    "La disposición favorece trabajo prolongado sin convertir el lugar en biblioteca ni archivo.",
  ];
  for (const t of permitidos)
    afirmar(auditarTextosActivos3C1R([t]).ok, "Confundió término genérico con contenido retirado: " + t);
});
PRUEBAS.registrar("3C.1R: historial nuevo, normalización e ida y vuelta conservan hechos actuales", () => {
  const j=PRUEBAS.banco();
  afirmar(Object.keys(j.player.historialAcciones).sort().join() === "eventos,secuencia,version", "Esquema inesperado del historial");
  j.registrarAccion("ROBAR", {clave:"prueba_3c1r",contexto:{recurso:"prueba"}});
  const antes=JSON.stringify(j.player.historialAcciones);
  j.player.historialAcciones.marcaRetirada = true;
  j.normalizarHistorialAcciones(); afirmar(JSON.stringify(j.player.historialAcciones)===antes,"Alteró historial");
  const copia=PRUEBAS.banco(); afirmar(copia.deserializar(JSON.parse(JSON.stringify(j.serializar()))),"No cargó save actual");
  afirmar(JSON.stringify(copia.player.historialAcciones)===antes,"Perdió hechos actuales");
});
PRUEBAS.registrar("3C.1R: normalización no reinterpreta ramas ni acredita contribución externa", () => {
  const j=PRUEBAS.banco(), p=j.player, tid=Object.keys(p.tecnicas)[0];
  p.tecnicas[tid].ramas={1:1,2:2,3:0}; j.normalizarMeridianos();
  afirmar(p.tecnicas[tid].ramas[1]===1 && p.tecnicas[tid].ramas[2]===2,"Reinterpretó ramas");
  p.facciones.grulla_blanca.saldo=7;p.facciones.grulla_blanca.merito=12;p.contribucion=999;
  j.normalizarFacciones();
  afirmar(p.facciones.grulla_blanca.saldo===7 && p.facciones.grulla_blanca.merito===12 && p.contribucion===7,"Importó saldo externo");
});

PRUEBAS.registrar("cultivo: CULTIVO_REINOS es coherente", () => {
  const malas = [];
  const ordenes = new Set();
  for (const [id, r] of Object.entries(CULTIVO_REINOS)) {
    if (r.id !== id) malas.push(`${id}: el campo id dice "${r.id}"`);
    if (!Number.isFinite(r.orden) || r.orden < 1) malas.push(`${id}: orden inválido`);
    if (ordenes.has(r.orden)) malas.push(`${id}: orden ${r.orden} duplicado`);
    ordenes.add(r.orden);
    if (!Number.isFinite(r.arco)) malas.push(`${id}: arco inválido`);
    if (r.siguienteReino && !CULTIVO_REINOS[r.siguienteReino]) malas.push(`${id}: siguienteReino "${r.siguienteReino}" no existe`);
  }
  if (Object.keys(CULTIVO_REINOS).length !== 8) malas.push("deberían ser 8 reinos");
  if (CULTIVO_REINOS.Dacheng.siguienteReino !== null) malas.push("Dacheng no debe tener siguienteReino");
  // Sólo LianQi es jugable hoy; los demás son entradas mínimas sin mecánica.
  for (const [id, r] of Object.entries(CULTIVO_REINOS)) {
    if (id !== "LianQi" && r.jugable !== false) malas.push(`${id}: no debería ser jugable todavía`);
    if (id !== "LianQi" && (r.etapas || []).length) malas.push(`${id}: no debe declarar etapas jugables`);
  }
  return malas;
});

PRUEBAS.registrar("cultivo: el vaso de LianQi conserva sus valores", () => {
  const malas = [];
  const esperados = { 1: 25, 2: 45, 3: 75, 4: 110 };
  for (const et of CULTIVO_REINOS.LianQi.etapas) {
    if (et.vasoQi !== esperados[et.n]) malas.push(`etapa ${et.n}: vaso ${et.vasoQi}, esperaba ${esperados[et.n]}`);
    if (et.vasoQi !== VASO_ETAPA[et.n]) malas.push(`etapa ${et.n}: desincronizada de VASO_ETAPA`);
  }
  if (totalEtapas("LianQi") !== 4) malas.push("LianQi debería tener 4 etapas");
  return malas;
});

PRUEBAS.registrar("cultivo: reinoAlMenos y reinoExacto", () => {
  const malas = [];
  const lianqi = { reino: "LianQi" }, zhuji = { reino: "ZhuJi" }, jindan = { reino: "Jindan" };
  if (!reinoAlMenos(lianqi, "LianQi")) malas.push("LianQi debería alcanzar LianQi");
  if (reinoAlMenos(lianqi, "ZhuJi")) malas.push("LianQi no debería alcanzar ZhuJi");
  if (!reinoAlMenos(zhuji, "ZhuJi") || !reinoAlMenos(zhuji, "LianQi")) malas.push("ZhuJi debería alcanzar LianQi y ZhuJi");
  // El punto del refactor: el contenido de ZhuJi sigue disponible más adelante.
  if (!reinoAlMenos(jindan, "ZhuJi")) malas.push("Jindan debería seguir cumpliendo los requisitos de ZhuJi");
  if (reinoExacto(jindan, "ZhuJi")) malas.push("reinoExacto no debería aceptar Jindan como ZhuJi");
  if (rangoDe("NoExiste") !== 0) malas.push("un reino desconocido debería dar rango 0");
  if (reinoAlMenos({ reino: "NoExiste" }, "LianQi")) malas.push("un reino desconocido no debería alcanzar LianQi");
  return malas;
});

PRUEBAS.registrar("cultivo: requisitos de reino en técnicas por rango", () => {
  const malas = [];
  const zhuji = { reino: "ZhuJi" }, jindan = { reino: "Jindan" }, lianqi = { reino: "LianQi" };
  if (!cumpleRequisitoReino(lianqi, null)) malas.push("sin requisito debería pasar siempre");
  if (cumpleRequisitoReino(lianqi, { reino: "ZhuJi" })) malas.push("LianQi no debería cumplir un requisito de ZhuJi");
  if (!cumpleRequisitoReino(zhuji, { reino: "ZhuJi" })) malas.push("ZhuJi debería cumplirlo");
  if (!cumpleRequisitoReino(jindan, { reino: "ZhuJi" })) malas.push("Jindan debería seguir cumpliéndolo");
  if (cumpleRequisitoReino(jindan, { reino: "ZhuJi", alcance: "exacto" })) malas.push("alcance exacto debería excluir a Jindan");
  // Las técnicas siguen siendo datos puros: ninguna debe llevar funciones.
  for (const [tid, t] of Object.entries(TECNICAS)) {
    if (t.req?.reino && !CULTIVO_REINOS[t.req.reino]) malas.push(`${tid}: req.reino "${t.req.reino}" no existe`);
    if (typeof t.req === "function") malas.push(`${tid}: req no debería ser una función`);
  }
  return malas;
});

PRUEBAS.registrar("cultivo: la Gran Perfección exige LianQi IV con el vaso al tope", () => {
  const malas = [];
  const base = () => ({ reino: "LianQi", etapa: 4, qi: VASO_ETAPA[4], granPerfeccionLianQi: false,
                        iluminacion: { alcanzada: false, semillaCorazonDao: null }, tribulacionCorazon: { superada: false } });
  if (!puedeAlcanzarGranPerfeccion(base())) malas.push("con etapa 4 y vaso lleno debería poder alcanzarse");
  if (puedeAlcanzarGranPerfeccion({ ...base(), qi: VASO_ETAPA[4] - 1 })) malas.push("no debería alcanzarse sin el vaso al tope");
  if (puedeAlcanzarGranPerfeccion({ ...base(), etapa: 3, qi: VASO_ETAPA[3] })) malas.push("no debería alcanzarse en etapa 3");
  if (puedeAlcanzarGranPerfeccion({ ...base(), reino: "ZhuJi" })) malas.push("no debería alcanzarse fuera de LianQi");
  // Hito irreversible: una vez fijado no vuelve a ofrecerse.
  if (puedeAlcanzarGranPerfeccion({ ...base(), granPerfeccionLianQi: true })) malas.push("no debería reofrecerse una vez alcanzada");
  return malas;
});

PRUEBAS.registrar("cultivo: Iluminación y Tribulación respetan su orden", () => {
  const malas = [];
  const p = { reino: "LianQi", etapa: 4, qi: VASO_ETAPA[4], granPerfeccionLianQi: false,
              iluminacion: { alcanzada: false, semillaCorazonDao: null }, tribulacionCorazon: { superada: false } };
  if (puedeBuscarIluminacion(p)) malas.push("la Iluminación no debería poder buscarse antes de la Gran Perfección");
  if (puedeIniciarTribulacion(p)) malas.push("la Tribulación no debería poder iniciarse antes de la Iluminación");

  p.granPerfeccionLianQi = true;
  if (!puedeBuscarIluminacion(p)) malas.push("tras la Gran Perfección debería poder buscarse la Iluminación");
  if (puedeIniciarTribulacion(p)) malas.push("la Tribulación sigue necesitando la Iluminación");

  p.iluminacion.alcanzada = true;
  if (puedeBuscarIluminacion(p)) malas.push("la Iluminación no debería repetirse");
  if (!puedeIniciarTribulacion(p)) malas.push("tras la Iluminación debería poder iniciarse la Tribulación");

  p.tribulacionCorazon.superada = true;
  if (puedeIniciarTribulacion(p)) malas.push("la Tribulación superada no debería reofrecerse");
  return malas;
});

PRUEBAS.registrar("cultivo: normalización de campos ausentes sin alterar progreso", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  // Save viejo: sin ninguno de los campos nuevos, con progreso real que NO debe tocarse.
  const p = j.player;
  delete p.granPerfeccionLianQi; delete p.iluminacion; delete p.tribulacionCorazon;
  delete p.historialReinos; delete p.historialArcos; delete p.cultivo_version;
  p.etapa = 3; p.qi = 61; p.qi_max = VASO_ETAPA[3]; p.comprension = 7;
  p.impurezas = 2; p.heridas_meridianos = 1; p.calidad_fundacion = null;

  j.normalizarCultivo();

  if (p.cultivo_version !== 1) malas.push("cultivo_version debería quedar en 1");
  if (p.granPerfeccionLianQi !== false) malas.push("granPerfeccionLianQi debería ser false");
  if (!p.iluminacion || p.iluminacion.alcanzada !== false) malas.push("iluminacion debería iniciarse sin alcanzar");
  if (p.iluminacion.semillaCorazonDao !== null) malas.push("la semilla debería iniciarse en null");
  if (!p.tribulacionCorazon || p.tribulacionCorazon.superada !== false) malas.push("tribulacionCorazon debería iniciarse sin superar");
  if (!Array.isArray(p.historialReinos) || p.historialReinos.length) malas.push("historialReinos debería ser un array vacío");
  if (!Array.isArray(p.historialArcos) || p.historialArcos.length) malas.push("historialArcos debería ser un array vacío");
  // Lo existente queda intacto.
  if (p.etapa !== 3 || p.qi !== 61 || p.comprension !== 7) malas.push("la normalización no debe tocar el progreso existente");
  if (p.impurezas !== 2 || p.heridas_meridianos !== 1) malas.push("la normalización no debe tocar impurezas ni heridas");
  return malas;
});

PRUEBAS.registrar("cultivo: normalización idempotente de datos actuales", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const p = j.player;
  p.granPerfeccionLianQi = true;
  p.iluminacion = { alcanzada: true, semillaCorazonDao: "libertad" };
  p.tribulacionCorazon = { superada: true };
  p.historialArcos = [{ arco: 1, reino: "LianQi" }];
  p.cultivo_version = 1;

  j.normalizarCultivo();

  if (p.granPerfeccionLianQi !== true) malas.push("no debería revertir la Gran Perfección");
  if (p.iluminacion.semillaCorazonDao !== "libertad") malas.push("no debería borrar la semilla");
  if (p.tribulacionCorazon.superada !== true) malas.push("no debería revertir la Tribulación");
  if (p.historialArcos.length !== 1) malas.push("no debería vaciar el historial");
  return malas;
});

PRUEBAS.registrar("cultivo: etapaInfo y arcoActual derivan de player", () => {
  const malas = [];
  const lianqi = { reino: "LianQi", etapa: 1 };
  if (etapaInfo(lianqi)?.nombre !== "Percepción") malas.push("etapa 1 debería ser Percepción");
  if (etapaInfo({ reino: "LianQi", etapa: 4 })?.nombre !== "Refinamiento") malas.push("etapa 4 debería ser Refinamiento");
  // ZhuJi no tiene etapas: la interfaz debe recibir null, nunca una etapa inventada.
  if (etapaInfo({ reino: "ZhuJi", etapa: 1 }) !== null) malas.push("ZhuJi debería devolver null");
  if (etapaInfo({ reino: "LianQi", etapa: 9 }) !== null) malas.push("una etapa fuera de rango debería dar null");
  if (arcoActual(lianqi) !== 1) malas.push("LianQi debería ser el arco 1");
  if (arcoActual({ reino: "ZhuJi" }) !== 2) malas.push("ZhuJi debería ser el arco 2");
  if (arcoActual({ reino: "NoExiste" }) !== 1) malas.push("un reino desconocido debería caer al arco 1");
  return malas;
});

PRUEBAS.registrar("cultivo: etiquetas cualitativas de meridianos", () => {
  const malas = [];
  const esperado = { 0: "Estables", 1: "Resentidos", 2: "Dañados", 3: "Críticos" };
  for (const [n, txt] of Object.entries(esperado)) {
    if (estadoMeridianos(Number(n)) !== txt) malas.push(`${n} debería ser "${txt}"`);
  }
  if (estadoMeridianos(99) !== "Críticos") malas.push("por encima del rango debería saturar en Críticos");
  if (estadoMeridianos(undefined) !== "Estables") malas.push("sin valor debería asumir Estables");
  return malas;
});

PRUEBAS.registrar("cultivo: la escalera del Arco 1 marca un solo hito actual", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const p = j.player;

  p.etapa = 2; p.qi = 0;
  let hitos = j.cultHitosArco1(p);
  let actuales = hitos.filter(h => h.estado === "actual");
  if (actuales.length !== 1) malas.push(`en etapa 2 debería haber 1 hito actual, hay ${actuales.length}`);
  if (actuales[0] && !actuales[0].nombre.includes("Circulación")) malas.push("el hito actual debería ser Circulación");
  if (hitos[0].estado !== "hecho") malas.push("el Despertar de la Raíz siempre está hecho");

  // Al cerrar el arco, todo LianQi queda completado y ZhuJi marcado.
  p.reino = "ZhuJi"; p.etapa = 1;
  p.granPerfeccionLianQi = true;
  p.iluminacion = { alcanzada: true, semillaCorazonDao: "libertad" };
  p.tribulacionCorazon = { superada: true };
  hitos = j.cultHitosArco1(p);
  if (hitos.some(h => h.estado !== "hecho")) malas.push("con el Arco 1 cerrado todos los hitos deberían estar completados");
  return malas;
});



PRUEBAS.registrar("cultivo: la Semilla del Dao se infiere por temas, no por moral", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  // Clasificación determinista: gana el tema con más puntos acumulados.
  if (j.semillaDesdeTemas({ libertad: 5, poder: 2 }) !== "libertad") malas.push("debería ganar libertad");
  if (j.semillaDesdeTemas({ proteccion: 4, pertenencia: 3 }) !== "proteccion") malas.push("debería ganar proteccion");
  // Empate resuelto por ORDEN_DESEMPATE_DAO, no por azar ni por orden de llegada.
  const empate = j.semillaDesdeTemas({ poder: 3, determinacion: 3 });
  if (empate !== "determinacion") malas.push(`empate mal resuelto: dio ${empate}`);
  const empate2 = j.semillaDesdeTemas({ pertenencia: 2, armonia: 2 });
  if (empate2 !== "armonia") malas.push(`empate mal resuelto: dio ${empate2}`);
  // Reproducible: la misma entrada da siempre lo mismo.
  const entrada = { conocimiento: 4, superacion: 4, libertad: 1 };
  if (j.semillaDesdeTemas(entrada) !== j.semillaDesdeTemas(entrada)) malas.push("la inferencia no es determinista");
  if (!TEMAS_DAO[j.semillaDesdeTemas({})]) malas.push("sin respuestas debería caer en un tema válido");
  return malas;
});

PRUEBAS.registrar("cultivo: datos de Iluminación y Tribulación bien formados", () => {
  const malas = [];
  const temasValidos = new Set(Object.keys(TEMAS_DAO));
  if (ORDEN_DESEMPATE_DAO.length !== temasValidos.size) malas.push("el orden de desempate debe cubrir todos los temas");
  for (const t of ORDEN_DESEMPATE_DAO) if (!temasValidos.has(t)) malas.push(`desempate: tema desconocido "${t}"`);

  for (const q of PREGUNTAS_ILUMINACION) {
    if (!q.opciones || !q.opciones.length) { malas.push(`${q.id}: sin opciones`); continue; }
    // Debe quedar siempre al menos una opción incondicional, o el jugador
    // podría encontrarse una pregunta sin ninguna respuesta disponible.
    if (!q.opciones.some(op => !op.si)) malas.push(`${q.id}: todas las opciones son condicionales`);
    for (const op of q.opciones) {
      if (!op.temas || !Object.keys(op.temas).length) malas.push(`${q.id}: una opción no aporta temas`);
      for (const [t, peso] of Object.entries(op.temas || {})) {
        if (!temasValidos.has(t)) malas.push(`${q.id}: tema desconocido "${t}"`);
        // Prohibido puntuar bueno/malo: los pesos son afinidad, siempre positivos.
        if (peso <= 0) malas.push(`${q.id}/${t}: peso ${peso} parece una puntuación moral`);
      }
    }
  }

  // Cada semilla posible debe tener su propio conflicto en la Tribulación.
  for (const tema of temasValidos) {
    const c = CONFLICTOS_TRIBULACION[tema];
    if (!c) { malas.push(`falta conflicto de Tribulación para "${tema}"`); continue; }
    if (!c.escena) malas.push(`${tema}: conflicto sin escena`);
    if (!c.opciones.some(o => o.coherente)) malas.push(`${tema}: sin ninguna salida coherente`);
    if (!c.opciones.some(o => !o.coherente)) malas.push(`${tema}: sin ninguna salida incoherente`);
  }
  if (!PRESION_TRIBULACION.opciones.some(o => o.coherente)) malas.push("la presión común no tiene salida coherente");
  return malas;
});

PRUEBAS.registrar("cultivo: la Tribulación confronta la semilla concreta", () => {
  const malas = [];
  // El conflicto mostrado debe depender realmente de la semilla, no ser genérico.
  const escenas = new Set(Object.values(CONFLICTOS_TRIBULACION).map(c => c.escena));
  if (escenas.size !== Object.keys(CONFLICTOS_TRIBULACION).length) malas.push("hay conflictos repetidos entre semillas");
  if (CONFLICTOS_TRIBULACION.libertad.escena === CONFLICTOS_TRIBULACION.proteccion.escena) {
    malas.push("Libertad y Protección deberían confrontar cosas distintas");
  }
  return malas;
});

PRUEBAS.registrar("cultivo: fracasar la Tribulación no destruye ni borra la Semilla", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const p = j.player;
  p.granPerfeccionLianQi = true;
  p.iluminacion = { alcanzada: true, semillaCorazonDao: "libertad" };
  p.tribulacionCorazon = { superada: false };
  const hpAntes = p.hp, comprensionAntes = p.comprension;

  j.resolverTribulacionCorazon(0, "libertad");

  if (p.tribulacionCorazon.superada !== false) malas.push("no superarla debería dejar el flag en false");
  if (p.iluminacion.semillaCorazonDao !== "libertad") malas.push("la Semilla no debe borrarse al fallar");
  if (p.iluminacion.alcanzada !== true) malas.push("la Iluminación no debe revertirse al fallar");
  if (p.hp < hpAntes) malas.push("fallar no debería dañar al personaje");
  if (p.comprension <= comprensionAntes) malas.push("fallar debería dejar algo aprendido");
  if (!p.tribulacionCorazon.pendienteReintento) malas.push("fallar debería marcar pendienteReintento");
  if (puedeIniciarTribulacion(p)) malas.push("no debería reintentarse de inmediato en el siguiente MEDITAR");
  return malas;
});

PRUEBAS.registrar("cultivo: superar la Tribulación habilita la Fundación", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const p = j.player;
  p.granPerfeccionLianQi = true;
  p.iluminacion = { alcanzada: true, semillaCorazonDao: "proteccion" };
  p.tribulacionCorazon = { superada: false };

  j.resolverTribulacionCorazon(2, "proteccion");

  if (p.tribulacionCorazon.superada !== true) malas.push("con respuestas coherentes debería superarse");
  if (puedeIniciarTribulacion(p)) malas.push("superada, no debería volver a ofrecerse");
  return malas;
});

PRUEBAS.registrar("cultivo: el cierre del Arco 1 registra historial sin guardar el presente", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const p = j.player;
  p.etapa = 4; p.qi_max = VASO_ETAPA[4]; p.qi = VASO_ETAPA[4];
  p.comprension = UMBRAL_COMPRENSION_FUNDACION;
  p.granPerfeccionLianQi = true;
  p.iluminacion = { alcanzada: true, semillaCorazonDao: "armonia" };
  p.tribulacionCorazon = { superada: true };

  j.triunfoZhuji();

  if (p.reino !== "ZhuJi") malas.push("debería quedar en ZhuJi");
  if (!p.calidad_fundacion) malas.push("debería registrarse una calidad de Fundación");
  if (!CULTIVO_REINOS.ZhuJi.calidadesFundacion.includes(p.calidad_fundacion)) {
    malas.push(`calidad "${p.calidad_fundacion}" fuera del vocabulario existente`);
  }
  if (p.historialArcos.length !== 1) malas.push("debería haber exactamente un arco cerrado");
  const entrada = p.historialArcos[0] || {};
  if (entrada.arco !== 1) malas.push("el arco cerrado debería ser el 1");
  if (entrada.reino !== "LianQi") malas.push("el reino cerrado debería ser LianQi");
  if (entrada.semilla !== "armonia") malas.push("debería conservar la Semilla obtenida");
  if (entrada.iluminacion !== true) malas.push("debería registrar que hubo Iluminación");
  // Nunca una entrada "actual": el presente se deriva de player.
  if (p.historialArcos.some(e => e.estado === "actual")) malas.push("el historial no debe guardar el arco actual");
  if (arcoActual(p) !== 2) malas.push("tras fundar, el arco actual debería derivarse como 2");
  return malas;
});

PRUEBAS.registrar("cultivo: la Píldora de Fundación se consume al fundar", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const p = j.player;
  p.etapa = 4; p.qi_max = VASO_ETAPA[4]; p.qi = VASO_ETAPA[4];
  p.comprension = 0;
  p.inventario.push("pildora_fundacion");
  if (!j.puedeIntentar()) malas.push("con la píldora debería poder intentarse la Fundación");
  p.granPerfeccionLianQi = true;
  p.iluminacion = { alcanzada: true, semillaCorazonDao: "poder" };
  p.tribulacionCorazon = { superada: true };

  j.triunfoZhuji();

  if (p.inventario.includes("pildora_fundacion")) malas.push("la píldora debería haberse consumido al fundar");
  return malas;
});

PRUEBAS.registrar("referencias: salidas de salas", () => {
return Object.entries(ROOMS).flatMap(([id,r])=>Object.entries(r.exits).filter(([d,to])=>!ROOMS[to]&&!esSalidaRegional(id,d,to)).map(([d,to])=>id+"."+d+" → "+to));
});

PRUEBAS.registrar("mapa v38: contrato topológico completo", () => auditarTopologiaMapa());

PRUEBAS.registrar("mapa v38: toda vertical vuelve, con o sin cambio de capa", () => {
for(const [id,r] of Object.entries(ROOMS))for(const [d,to] of Object.entries(r.exits))if(DIRECCIONES_VERTICALES.includes(d))afirmar(ROOMS[to]?.exits[DIRECCION_OPUESTA[d]]===id,"Vertical sin retorno: "+id); return conAtlasPrueba329(()=>{afirmar(capaMapaDeSala("formaciones_sello_antiguo")!==capaMapaDeSala("formaciones_descenso_tecnico"),"Las capas de prueba se mezclan");});
});

PRUEBAS.registrar("referencias: objetos de salas", () => {
  const malas = [];
  for (const [rid, r] of Object.entries(ROOMS))
    for (const lista of ["items", "oculto"])
      for (const id of r[lista] || [])
        if (!ITEMS[id]) malas.push(`${rid}.${lista}: "${id}" no está en ITEMS`);
  return malas;
});

PRUEBAS.registrar("referencias: criaturas de salas", () => {
  const malas = [];
  for (const [rid, r] of Object.entries(ROOMS)) {
    for (const id of r.mobs || []) if (!MOBS[id]) malas.push(`${rid}.mobs: "${id}" no está en MOBS`);
  }
  return malas;
});

PRUEBAS.registrar("referencias: NPC de salas", () => {
  const malas = [];
  for (const [rid, r] of Object.entries(ROOMS))
    for (const n of r.npcs || [])
      if (!NOMBRES_NPC[n] && !DESCS_NPC[n]) malas.push(`${rid}.npcs: "${n}" sin nombre ni descripción`);
  return malas;
});

PRUEBAS.registrar("referencias: botín, recetas y catálogo", () => {
  const malas = [];
  for (const [mid, m] of Object.entries(MOBS))
    for (const d of m.loot || [])
      if (!ITEMS[d.item]) malas.push(`MOBS.${mid}.loot: "${d.item}" no está en ITEMS`);
  for (const [rid, rec] of Object.entries(RECETAS)) {
    for (const ing of Object.keys(rec.ingredientes || {}))
      if (!ITEMS[ing]) malas.push(`RECETAS.${rid}: ingrediente "${ing}" no está en ITEMS`);
    if (!ITEMS[rec.resultado]) malas.push(`RECETAS.${rid}: resultado "${rec.resultado}" no está en ITEMS`);
  }
  for (const id of CATALOGO) if (!ITEMS[id]) malas.push(`CATALOGO: "${id}" no está en ITEMS`);
  for (const [iid, it] of Object.entries(ITEMS))
    if (it.tecnica && !TECNICAS[it.tecnica]) malas.push(`ITEMS.${iid}: enseña la técnica "${it.tecnica}", que no existe`);
  return malas;
});

PRUEBAS.registrar("referencias: elementos de técnicas y criaturas", () => {
  const malas = [];
  for (const [tid, t] of Object.entries(TECNICAS))
    if (t.elemento && !ELEMENTOS.includes(t.elemento)) malas.push(`TECNICAS.${tid}: elemento "${t.elemento}" desconocido`);
  for (const [mid, m] of Object.entries(MOBS))
    if (m.elemento && !ELEMENTOS.includes(m.elemento)) malas.push(`MOBS.${mid}: elemento "${m.elemento}" desconocido`);
  return malas;
});

// El contrato de RAMAS se verifica solo: ninguna opción puede repetir, dominar
// ni leerse igual que otra del mismo tramo. Si agregás un arte y esta prueba
// falla, la ambigüedad está en RAMAS, no en el auditor.
PRUEBAS.registrar("ramas: ninguna opción repite, domina ni imita a otra", () => auditarRamas());

PRUEBAS.registrar("ramas: cada arte declara sus tres tramos completos", () => {
  const malas = [];
  for (const tid of Object.keys(TECNICAS)) {
    for (let n = 1; n <= 3; n++) {
      const ops = RAMAS[tid]?.[n];
      if (!Array.isArray(ops) || ops.length !== 3) { malas.push(`${tid} tramo ${n}: faltan opciones`); continue; }
      for (const o of ops) if (!o || !o.nombre || !o.mod) malas.push(`${tid} tramo ${n}: opción incompleta`);
    }
  }
  return malas;
});

PRUEBAS.registrar("ramas: todas se pueden aplicar y describir sin romperse", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  for (const tid of Object.keys(TECNICAS)) {
    j.player.tecnicas[tid] = { maestria: 3, usos: 99, practica: 99, ramas: { 1: 0, 2: 0, 3: 0 } };
    for (let opcion = 1; opcion <= 3; opcion++) {
      const conf = j.statsTecnica(tid, { 1: opcion, 2: opcion, 3: opcion });
      if (!(conf.coste >= 1)) malas.push(`${tid} opción ${opcion}: coste inválido (${conf.coste})`);
      if (TECNICAS[tid].daño && !conf.daño) malas.push(`${tid} opción ${opcion}: perdió su daño`);
      if (!(conf.duracion >= 1)) malas.push(`${tid} opción ${opcion}: duración inválida`);
      for (let n = 1; n <= 3; n++) {
        const texto = j.textoModMeridiano(RAMAS[tid][n][opcion - 1].mod, tid);
        if (!texto || texto.startsWith("Sin mejora")) malas.push(`${tid} tramo ${n} opción ${opcion}: no se describe`);
      }
    }
    delete j.player.tecnicas[tid];
  }
  return malas;
});

// ---------- builds y técnicas preparadas ----------
PRUEBAS.registrar("builds: la técnica inicial nace preparada sin gastar meridianos", () => {
  const malas = [];
  for (const raiz of Object.keys(RAICES)) {
    const j = PRUEBAS.banco({ raiz });
    const tid = RAICES[raiz].tecnica;
    if (!j.player.tecnicas?.[tid]) malas.push(`${raiz}: no aprendió la técnica inicial ${tid}`);
    if (!j.estaPreparada(tid)) malas.push(`${raiz}: la técnica inicial no quedó preparada`);
    if (j.puntosTecnicaGastados(tid) !== 0) malas.push(`${raiz}: preparar la técnica inicial gastó puntos`);
    if (!j.tecnicasPreparadasActuales().includes(tid)) malas.push(`${raiz}: no aparece en tecnicasPreparadasActuales()`);
  }
  return malas;
});

// Banco con varias artes aprendidas, reino alto y puntos de sobra: así las
// ramas se pueden mover sin chocar con requisitos de etapa o maestría.
function bancoBuilds(tids = ["palma", "latigo", "paso_nube"]) {
  const j = PRUEBAS.banco({ pos: "camino" });
  j.visitadas.add("camino");
  // Este banco prueba operaciones explícitas de preparar/despreparar, así que
  // parte deliberadamente con el loadout vacío aunque un personaje real no.
  j.player.tecnicas_preparadas = [];
  j.player.reino = "ZhuJi";
  j.player.etapa = 4;
  for (const tid of tids) {
    if (!TECNICAS[tid]) continue;
    j.player.tecnicas[tid] = { maestria: 3, usos: 99, practica: 99, ramas: { 1: 0, 2: 0, 3: 0 } };
  }
  j.player.puntos_tecnica_total = 12;
  j.normalizarBuilds();
  return j;
}

PRUEBAS.registrar("3C.1R: normalizar builds no concede técnicas preparadas", () => {
  const j = bancoBuilds(), p = j.player;
  p.tecnicas_preparadas = []; p.builds = null; p.build_seq = -1;
  const tecnicas = JSON.stringify(p.tecnicas);
  j.normalizarBuilds();
  afirmar(p.tecnicas_preparadas.length === 0, "Preparó una técnica no elegida");
  afirmar(Array.isArray(p.builds) && p.builds.length === 0 && p.build_seq === 0, "No normalizó builds");
  afirmar(JSON.stringify(p.tecnicas) === tecnicas, "Alteró técnicas aprendidas");
  const antes = JSON.stringify(p); j.normalizarBuilds();
  afirmar(JSON.stringify(p) === antes, "Normalización no idempotente");
});


PRUEBAS.registrar("builds: preparar y despreparar sólo tocan el loadout", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2);
  const ramasAntes = JSON.stringify(j.player.tecnicas.palma.ramas);
  const maestriaAntes = j.player.tecnicas.palma.maestria;
  const puntosAntes = j.puntosTecnicaDisponibles();
  if (!j.prepararTecnica("palma").ok) malas.push("preparar una técnica conocida falló");
  if (!j.estaPreparada("palma")) malas.push("la técnica no quedó preparada");
  if (j.prepararTecnica("palma").ok) malas.push("preparar dos veces duplicó la entrada");
  if (j.player.tecnicas_preparadas.filter(t => t === "palma").length !== 1) malas.push("hay ids duplicados en preparadas");
  if (j.prepararTecnica("no_existe").ok) malas.push("aceptó una técnica inexistente");
  if (j.player.tecnicas.marea_circular) malas.push("el banco no debería conocer marea_circular");
  if (j.prepararTecnica("marea_circular").ok) malas.push("aceptó una técnica no aprendida");
  if (JSON.stringify(j.player.tecnicas.palma.ramas) !== ramasAntes) malas.push("preparar modificó las ramas");
  if (j.player.tecnicas.palma.maestria !== maestriaAntes) malas.push("preparar modificó la maestría");
  if (j.puntosTecnicaDisponibles() !== puntosAntes) malas.push("preparar consumió puntos");
  if (!j.despreprararTecnica("palma").ok) malas.push("despreparar falló");
  if (j.estaPreparada("palma")) malas.push("la técnica siguió preparada");
  if (!j.player.tecnicas.palma) malas.push("despreparar desaprendió la técnica");
  if (j.despreprararTecnica("palma").ok) malas.push("despreparar dos veces no debería tener efecto");
  if (j.despreprararTecnica("no_existe").ok) malas.push("despreparar algo inexistente no debería decir ok");
  return malas;
});

PRUEBAS.registrar("builds: preparar está bloqueado durante un combate", () => {
  const malas = [];
  const j = bancoBuilds();
  j.combate = { falso: true };
  const res = j.prepararTecnica("palma");
  if (res.ok) malas.push("dejó preparar en combate");
  if (!/combate/i.test(res.texto)) malas.push("no explica que el motivo es el combate");
  if (j.estaPreparada("palma")) malas.push("la técnica quedó preparada igualmente");
  j.player.tecnicas_preparadas = ["palma"];
  if (j.despreprararTecnica("palma").ok) malas.push("dejó despreparar en combate");
  j.combate = null;
  if (!j.prepararTecnica("latigo").ok) malas.push("fuera de combate sigue bloqueado");
  return malas;
});

PRUEBAS.registrar("builds: el snapshot guarda preparadas y ramas, nunca stats", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2);
  j.elegirRama("latigo", 2, 1);
  j.prepararTecnica("palma");
  const snap = j.snapshotConfiguracionActual();
  if (!snap.preparadas.includes("palma")) malas.push("el snapshot no incluye las preparadas");
  if (snap.ramas.palma?.[1] !== 2) malas.push("el snapshot no incluye las ramas");
  // latigo no está preparada pero sí especializada: su configuración se conserva.
  if (snap.ramas.latigo?.[2] !== 1) malas.push("el snapshot pierde técnicas especializadas no preparadas");
  for (const clave of ["daño", "coste", "precision", "maestria", "stats", "puntosUsados"])
    if (clave in snap) malas.push(`el snapshot almacena un derivado: ${clave}`);
  if (j.puntosDeSnapshot(snap) !== 2) malas.push(`puntos del snapshot mal calculados (${j.puntosDeSnapshot(snap)})`);
  return malas;
});

PRUEBAS.registrar("builds: guardar crea id, nombre, snapshot y deja la build activa", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2);
  j.prepararTecnica("palma"); j.prepararTecnica("latigo");
  const res = j.guardarBuildActual("  Cazador Bestia  ");
  if (!res.ok) malas.push("guardar falló: " + res.texto);
  const b = j.player.builds[0];
  if (!b?.id) malas.push("la build no recibió id");
  if (b.nombre !== "Cazador Bestia") malas.push("el nombre no se limpió de espacios");
  if (JSON.stringify(b.preparadas) !== JSON.stringify(["palma", "latigo"])) malas.push("no guardó las preparadas en orden");
  if (b.ramas.palma?.[1] !== 2) malas.push("no guardó las ramas");
  if (j.player.build_activa !== b.id) malas.push("la nueva build no quedó activa");
  if (j.estadoBuild(b) !== "activa") malas.push("la build recién guardada no figura como activa");
  if (j.guardarBuildActual("cazador bestia").ok) malas.push("permitió un nombre duplicado ignorando mayúsculas");
  if (j.guardarBuildActual("   ").ok) malas.push("permitió un nombre vacío");
  for (let i = 0; i < 6; i++) j.guardarBuildActual(`Preset ${i}`);
  if (j.player.builds.length !== MAX_BUILDS) malas.push(`superó el máximo de builds (${j.player.builds.length})`);
  const ids = new Set(j.player.builds.map(x => x.id));
  if (ids.size !== j.player.builds.length) malas.push("hay ids repetidos");
  return malas;
});

PRUEBAS.registrar("builds: activar restaura preparadas y ramas sin desaprender nada", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2); j.elegirRama("paso_nube", 3, 1);
  j.prepararTecnica("palma"); j.prepararTecnica("paso_nube");
  const guardada = j.guardarBuildActual("Cazador");
  // Cambia todo y aprende algo nuevo con puntos propios.
  j.elegirRama("palma", 1, 0); j.elegirRama("paso_nube", 3, 0);
  j.despreprararTecnica("paso_nube"); j.prepararTecnica("latigo");
  j.elegirRama("latigo", 1, 3);
  const tecnicasAntes = Object.keys(j.player.tecnicas).sort().join(",");
  const res = j.activarBuild(guardada.id);
  if (!res.ok) malas.push("activar falló: " + res.texto);
  if (j.player.tecnicas.palma.ramas[1] !== 2) malas.push("no restauró las ramas guardadas");
  if (j.player.tecnicas.paso_nube.ramas[3] !== 1) malas.push("no restauró todas las técnicas del snapshot");
  // §44: una técnica ausente del snapshot vuelve a cero, pero sigue aprendida.
  if (j.player.tecnicas.latigo.ramas[1] !== 0) malas.push("no devolvió a cero una técnica ausente del snapshot");
  if (JSON.stringify(j.player.tecnicas_preparadas) !== JSON.stringify(["palma", "paso_nube"])) malas.push("no restauró las preparadas");
  if (Object.keys(j.player.tecnicas).sort().join(",") !== tecnicasAntes) malas.push("activar desaprendió o inventó técnicas");
  if (j.player.build_activa !== guardada.id) malas.push("no fijó build_activa");
  if (j.estadoBuild(j.buildPorId(guardada.id)) !== "activa") malas.push("tras activar no figura como activa");
  return malas;
});

PRUEBAS.registrar("builds: una activación inválida es atómica y no toca nada", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2);
  j.prepararTecnica("palma");
  const guardada = j.guardarBuildActual("Cara");
  // Una build que pide los nueve tramos: más de lo que el progreso concede.
  const build = j.buildPorId(guardada.id);
  build.ramas = { palma: { 1: 1, 2: 1, 3: 1 }, latigo: { 1: 1, 2: 1, 3: 1 }, paso_nube: { 1: 1, 2: 1, 3: 1 } };
  j.player.puntos_tecnica_total = j.puntosTecnicaPorProgreso();
  // Sólo importan ramas y preparadas: la maestría se toca aparte más abajo.
  const foto = () => JSON.stringify([j.snapshotConfiguracionActual().ramas, j.player.tecnicas_preparadas]);
  const antes = foto();
  const res = j.activarBuild(guardada.id);
  if (res.ok) malas.push("aplicó una build que no puede pagar");
  if (foto() !== antes) malas.push("dejó cambios parciales tras fallar");
  if (!/puntos/i.test(res.texto)) malas.push("no explica que faltan puntos");
  // Un tramo bloqueado por maestría también detiene la activación entera.
  build.ramas = { palma: { 1: 1, 2: 1, 3: 0 } };
  j.player.tecnicas.palma.maestria = 1;
  const porMaestria = j.activarBuild(guardada.id);
  if (porMaestria.ok) malas.push("aplicó una build con un tramo bloqueado por maestría");
  if (foto() !== antes) malas.push("dejó cambios parciales tras el bloqueo de maestría");
  j.player.tecnicas.palma.maestria = 3;
  // Un lugar inseguro usa el bloqueo existente, sin definiciones nuevas.
  j.player.puntos_tecnica_total = 12;
  j.pos = "bosque_paso_hundido";
  const bloqueado = j.activarBuild(guardada.id);
  if (bloqueado.ok) malas.push("activó una build en zona salvaje");
  if (bloqueado.texto !== j.bloqueoReconfigurar()) malas.push("no reutiliza el motivo de bloqueoReconfigurar");
  j.pos = "camino";
  j.combate = { falso: true };
  if (j.activarBuild(guardada.id).ok) malas.push("activó una build en combate");
  return malas;
});

PRUEBAS.registrar("builds: el estado modificada se calcula, nunca se guarda", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2);
  j.prepararTecnica("palma");
  const guardada = j.guardarBuildActual("Cazador");
  const b = j.buildPorId(guardada.id);
  if ("modificada" in b) malas.push("la build almacena un flag modificada");
  if (j.estadoBuild(b) !== "activa") malas.push("recién guardada no figura activa");
  j.elegirRama("palma", 2, 1);
  if (j.estadoBuild(b) !== "modificada") malas.push("cambiar una rama no marcó modificada");
  j.elegirRama("palma", 2, 0);
  if (j.estadoBuild(b) !== "activa") malas.push("deshacer el cambio no devolvió el estado activa");
  j.prepararTecnica("latigo");
  if (j.estadoBuild(b) !== "modificada") malas.push("preparar otra técnica no marcó modificada");
  j.despreprararTecnica("latigo");
  if (j.estadoBuild(b) !== "activa") malas.push("despreparar no restableció la coincidencia");
  return malas;
});

PRUEBAS.registrar("builds: actualizar y restaurar sólo operan sobre la build activa", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2); j.prepararTecnica("palma");
  const uno = j.guardarBuildActual("Uno");
  j.elegirRama("latigo", 1, 1);
  const dos = j.guardarBuildActual("Dos");          // Dos queda activa
  if (j.actualizarBuild(uno.id).ok) malas.push("sobrescribió una build inactiva");
  if (j.restaurarBuild(uno.id).ok) malas.push("restauró una build inactiva");
  j.elegirRama("paso_nube", 1, 1);
  const bDos = j.buildPorId(dos.id);
  if (j.estadoBuild(bDos) !== "modificada") malas.push("no detectó la modificación");
  const restaurada = j.restaurarBuild(dos.id);
  if (!restaurada.ok) malas.push("restaurar falló: " + restaurada.texto);
  if (j.player.tecnicas.paso_nube.ramas[1] !== 0) malas.push("restaurar no recuperó el snapshot");
  if (j.estadoBuild(bDos) !== "activa") malas.push("tras restaurar sigue modificada");
  j.elegirRama("paso_nube", 1, 1);
  if (!j.actualizarBuild(dos.id).ok) malas.push("no dejó actualizar la build activa modificada");
  if (j.buildPorId(dos.id).ramas.paso_nube?.[1] !== 1) malas.push("actualizar no guardó la configuración actual");
  if (j.estadoBuild(bDos) !== "activa") malas.push("tras actualizar sigue modificada");
  return malas;
});

PRUEBAS.registrar("builds: renombrar, duplicar y eliminar", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2); j.prepararTecnica("palma");
  const uno = j.guardarBuildActual("Cazador Bestia");
  const b = j.buildPorId(uno.id);
  const snapAntes = JSON.stringify([b.preparadas, b.ramas]);
  if (!j.renombrarBuild(uno.id, "Guardián Río").ok) malas.push("renombrar falló");
  if (j.buildPorId(uno.id) !== b) malas.push("renombrar cambió el id");
  if (JSON.stringify([b.preparadas, b.ramas]) !== snapAntes) malas.push("renombrar tocó la configuración");
  if (j.player.build_activa !== uno.id) malas.push("renombrar cambió la build activa");
  const copia = j.duplicarBuild(uno.id);
  if (!copia.ok) malas.push("duplicar falló");
  const c = j.buildPorId(copia.id);
  if (c.id === b.id) malas.push("la copia reutiliza el id");
  if (JSON.stringify([c.preparadas, c.ramas]) !== snapAntes) malas.push("la copia no reproduce el snapshot");
  if (j.player.build_activa === c.id) malas.push("duplicar activó la copia");
  if (j.renombrarBuild(copia.id, "Guardián Río").ok) malas.push("permitió renombrar a un nombre duplicado");
  // Eliminar una build inactiva no toca la configuración.
  const configAntes = JSON.stringify(j.snapshotConfiguracionActual());
  if (!j.eliminarBuild(copia.id).ok) malas.push("eliminar falló");
  if (JSON.stringify(j.snapshotConfiguracionActual()) !== configAntes) malas.push("eliminar cambió la configuración");
  // Eliminar la activa deja build_activa en null pero conserva todo lo demás.
  if (!j.eliminarBuild(uno.id).ok) malas.push("eliminar la activa falló");
  if (j.player.build_activa !== null) malas.push("build_activa no quedó en null");
  if (JSON.stringify(j.snapshotConfiguracionActual()) !== configAntes) malas.push("eliminar la activa cambió ramas o preparadas");
  if (!j.player.tecnicas.palma) malas.push("eliminar desaprendió una técnica");
  return malas;
});

PRUEBAS.registrar("builds: sobreviven a serializar y deserializar", () => {
  const malas = [];
  const j = bancoBuilds();
  j.elegirRama("palma", 1, 2); j.prepararTecnica("palma"); j.prepararTecnica("latigo");
  const guardada = j.guardarBuildActual("Cazador Bestia");
  const copia = PRUEBAS.banco();
  copia.deserializar(JSON.parse(JSON.stringify(j.serializar())));
  if (copia.player.builds.length !== 1) malas.push("las builds no sobrevivieron");
  if (copia.player.builds[0].nombre !== "Cazador Bestia") malas.push("el nombre no sobrevivió");
  if (copia.player.builds[0].ramas.palma?.[1] !== 2) malas.push("las ramas guardadas no sobrevivieron");
  if (copia.player.build_activa !== guardada.id) malas.push("la build activa no sobrevivió");
  if (JSON.stringify(copia.player.tecnicas_preparadas) !== JSON.stringify(["palma", "latigo"])) malas.push("las preparadas no sobrevivieron");
  if (copia.estadoBuild(copia.buildPorId(guardada.id)) !== "activa") malas.push("tras cargar no figura como activa");
  return malas;
});

PRUEBAS.registrar("builds: la normalización limpia datos corruptos sin romper", () => {
  const malas = [];
  const j = bancoBuilds();
  j.player.tecnicas_preparadas = ["palma", "palma", "no_existe", "marea", 7, null];
  j.player.builds = [
    { id: "build_1", nombre: "Uno", preparadas: ["palma", "fantasma"], ramas: { palma: { 1: 9, 2: 1, 3: 0 }, fantasma: { 1: 1 } } },
    { id: "build_1", nombre: "uno", preparadas: null, ramas: null },
    "basura",
    { nombre: "  ", preparadas: [], ramas: {} },
  ];
  j.player.build_activa = "build_inexistente";
  delete j.player.build_seq;
  j.normalizarBuilds();
  if (j.player.tecnicas_preparadas.join(",") !== "palma") malas.push(`preparadas mal filtradas: ${j.player.tecnicas_preparadas}`);
  const ids = j.player.builds.map(b => b.id);
  if (new Set(ids).size !== ids.length) malas.push("quedaron ids repetidos");
  if (j.player.builds.length !== 3) malas.push(`builds mal filtradas (${j.player.builds.length})`);
  if (j.player.builds[0].preparadas.includes("fantasma")) malas.push("conservó una técnica desconocida en preparadas");
  if ("fantasma" in j.player.builds[0].ramas) malas.push("conservó ramas de una técnica desconocida");
  if (j.player.builds[0].ramas.palma?.[1] !== 0) malas.push("no saneó un valor de rama inválido");
  if (j.player.build_activa !== null) malas.push("no descartó una build_activa inexistente");
  if (!Number.isFinite(j.player.build_seq)) malas.push("no reconstruyó build_seq");
  const nombres = j.player.builds.map(b => b.nombre.toLowerCase());
  if (new Set(nombres).size !== nombres.length) malas.push("quedaron nombres duplicados");
  return malas;
});

PRUEBAS.registrar("builds: híbridas y técnicas sin puntos pueden prepararse", () => {
  const malas = [];
  const hibrida = Object.keys(TECNICAS).find(tid => TECNICAS[tid].elementos);
  const j = bancoBuilds(["palma", "latigo", "paso_nube", hibrida].filter(Boolean));
  if (!j.prepararTecnica("latigo").ok) malas.push("no dejó preparar una técnica sin puntos invertidos");
  if (j.puntosTecnicaGastados("latigo") !== 0) malas.push("preparar invirtió puntos");
  if (hibrida) {
    if (!j.prepararTecnica(hibrida).ok) malas.push("no dejó preparar una técnica híbrida");
    const guardada = j.guardarBuildActual("Confluencia");
    if (!j.buildPorId(guardada.id).preparadas.includes(hibrida)) malas.push("la build no guardó la híbrida");
  }
  const preparadas = j.tecnicasPreparadasActuales();
  if (preparadas.some(tid => !TECNICAS[tid] || !j.player.tecnicas[tid])) malas.push("tecnicasPreparadasActuales devuelve ids inválidos");
  return malas;
});

// ---------- interfaz de combate (presentación) ----------
// Estas pruebas no dependen de estilos ni de pixeles: verifican el contrato
// de presentación (§95) sobre el DOM simulado que ya usa este arnés.
function bancoCombate(mobId = "escarabajo_hierro") {
  const j = PRUEBAS.banco({ pos: "camino" });
  j.visitadas.add("camino");
  j.player.tecnicas_preparadas = [];
  j.player.tecnicas.palma = { maestria: 3, usos: 99, practica: 99, ramas: { 1: 0, 2: 0, 3: 0 } };
  j.prepararTecnica("palma");
  const mob = crearMob(mobId, MOBS[mobId]);
  j.vivos = [mob];
  j.entrarCombate(mob, mobId);
  return j;
}

PRUEBAS.registrar("interfaz de combate: entrar abre la ventana y oculta el lateral", () => {
  const malas = [];
  const j = bancoCombate();
  if (!j.combate) malas.push("entrarCombate no dejó this.combate activo");
  if (!j.zonaEl.classList.contains("en-combate")) malas.push("no marcó #zona.en-combate");
  if (j.cbEl.hidden) malas.push("combateUI sigue oculto");
  if (!j.combateVista) malas.push("no se creó combateVista");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: la terminal no recibe turnos", () => {
  const malas = [];
  const j = bancoCombate();
  const contenidoAntes = document.getElementById("contenido").children.length;
  j.ejecutar("atacar", []);
  if (document.getElementById("contenido").children.length !== contenidoAntes)
    malas.push("#contenido creció durante un turno de combate");
  if (!j.combateVista.log.length) malas.push("el registro de la ventana no recibió el texto del turno");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: el registro filtra vitales legacy sin perder acciones", () => {
  const malas = [];
  const j = bancoCombate();
  j.registrarSalidaCombate("   TÚ ♥ [████] 10/10   │   enemigo ♥ [██] 2/5\n   OTRO · avispa ♥ [█] 1/3\n   GRULLA ♥ [██] 2/9\n   JEFE FINAL · FASE 2/3 · Alas\n   Tú atacas: 3 de daño");
  const log = j.combateVista.log;
  if (log.some(l => /^TÚ ♥|^OTRO · .*♥|^GRULLA ♥|^JEFE FINAL · FASE \d+\/3 ·/.test(l)))
    malas.push("el registro conserva una línea visual legacy de vitales/fase");
  if (!log.some(l => /Tú atacas: 3 de daño/.test(l)))
    malas.push("el filtro eliminó una acción real del combate");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: técnicas rápidas vienen de tecnicasPreparadasActuales, nunca de build_activa", () => {
  const malas = [];
  const j = bancoCombate();
  j.player.tecnicas.latigo = { maestria: 1, usos: 0, practica: 0, ramas: { 1: 0, 2: 0, 3: 0 } };
  // latigo queda APRENDIDA pero NO preparada: no debe aparecer en el drawer.
  j.guardarBuildActual("Otra");
  j.player.build_activa = "build_que_no_existe"; // ni siquiera una build activa inválida debe leerse
  j.renderDrawerTecnicas();
  const cuerpo = j.renderDrawerTecnicas.toString();
  if (cuerpo.includes("build_activa") || cuerpo.includes("player.tecnicas)"))
    malas.push("el drawer de técnicas referencia build_activa o todas las conocidas");
  const nombres = Array.from(j.cbDrawerEl.querySelectorAll("button")).flatMap(b => Array.from(b.children).map(x => x.textContent));
  if (!nombres.includes("Palma Ardiente") && !nombres.includes("Palma")) malas.push("no muestra la técnica preparada");
  if (nombres.includes("Látigo de Agua") || nombres.includes("Látigo")) malas.push("mostró una técnica conocida pero no preparada");
  return malas;
});

PRUEBAS.registrar("combate estados: evasión, defensa y absorción coexisten sin pisarse", () => {
  const malas = [];
  const j = bancoCombate();
  const c = j.combate;
  c.aplicar("jugador", { tipo: "esquiva", duracion: 2, params: { bono: 15 } });
  c.aplicar("jugador", { tipo: "defensa", duracion: 3, params: { bono: 4 } });
  c.aplicar("jugador", { tipo: "guardia", duracion: 2, params: { reduccion: 3 } });
  const tipos = c.estados.jugador.map(s => s.tipo).sort();
  for (const tipo of ["esquiva", "defensa", "guardia"]) if (!tipos.includes(tipo)) malas.push(`faltó ${tipo} tras aplicar los tres buffs`);
  if (c.estados.jugador.length !== 3) malas.push(`esperaba 3 categorías simultáneas y hay ${c.estados.jugador.length}`);
  c.aplicar("jugador", { tipo: "defensa", duracion: 5, params: { bono: 6 } });
  if (c.estados.jugador.length !== 3) malas.push("refrescar defensa eliminó o duplicó otra categoría");
  if (c.estadoDe("jugador", "defensa")?.params?.bono !== 6) malas.push("la defensa no se refrescó con el nuevo valor");
  if (!c.estadoDe("jugador", "esquiva") || !c.estadoDe("jugador", "guardia")) malas.push("refrescar defensa pisó evasión o absorción");
  c.aplicar("jugador", { tipo: "dano", duracion: 2, params: { bono: 20, porcentaje: true } });
  if (!c.estadoDe("jugador", "dano") || c.estados.jugador.length !== 4) malas.push("la categoría futura DAÑO no puede coexistir con los buffs actuales");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: panel contextual inicia en técnicas y cambia a objetos", () => {
  const malas = [];
  const j = bancoCombate();
  j.actualizarVistaCombate();
  if (j.combateVista.drawer !== "tecnicas") malas.push("el panel no inicia en técnicas");
  if (j.cbDrawerEl.dataset.panel !== "tecnicas") malas.push("la columna lateral no renderizó técnicas al entrar");
  j.player.inventario.push("pocion");
  j.seleccionarPanelCombate("objetos");
  if (j.combateVista.drawer !== "objetos") malas.push("OBJETOS no cambió el modo contextual");
  if (j.cbDrawerEl.dataset.panel !== "objetos") malas.push("la columna lateral no renderizó objetos");
  j.seleccionarPanelCombate("tecnicas");
  if (j.cbDrawerEl.dataset.panel !== "tecnicas") malas.push("TÉCNICAS no restauró la vista lateral");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: el registro limita el DOM y no crece indefinidamente", () => {
  const malas = [];
  const j = bancoCombate();
  for (let i = 0; i < MAX_LINEAS_LOG_COMBATE + 40; i++) j.registrarSalidaCombate(`línea ${i}`);
  if (j.combateVista.log.length > MAX_LINEAS_LOG_COMBATE) malas.push("el historial lógico supera el límite");
  if (j.cbLogEl.children.length > MAX_LINEAS_LOG_COMBATE) malas.push("el DOM del registro supera el límite");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: estados propios y enemigos se renderizan como chips", () => {
  const malas = [];
  const j = bancoCombate();
  j.combate.aplicar("jugador", { tipo: "esquiva", nombre: "Paso", duracion: 2, params: { bono: 15 } });
  j.combate.aplicar("jugador", { tipo: "defensa", nombre: "Espejo", duracion: 3, params: { bono: 4 } });
  j.combate.aplicarAMob(j.combate.e, { tipo: "debil", duracion: 2, params: { ataque: -2 } });
  j.renderJugadorCombate();
  j.renderCombatientes();
  const propios = j.cbJugadorEl.querySelectorAll(".combate-estado-chip");
  const enemigos = j.cbCombatientesEl.querySelectorAll(".combate-estado-chip");
  if (propios.length < 2) malas.push("no mostró simultáneamente los buffs del jugador");
  if (!enemigos.length) malas.push("no mostró el debuff del enemigo");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: victoria acumula recompensas reales, cadáver y descubrimiento", () => {
  const malas = [];
  const j = bancoCombate();
  j.combate.e.defensa = -999; j.combate.e.ataque = -999; j.combate.e.hp = j.combate.e.max_hp = 1; j.combate.e.tecnica = null;
  delete j.atlas.criaturas.escarabajo_hierro; // fuerza que el próximo drop sea "nuevo descubrimiento"
  let estadoFinal = null, resumenCapturado = null;
  const original = j.mostrarResultadoCombate.bind(j);
  j.mostrarResultadoCombate = (estado, postAccion) => { estadoFinal = estado; resumenCapturado = j.combateVista.acumulador; original(estado, postAccion); };
  let vueltas = 0;
  while (j.combate && vueltas < 20) { j.ejecutar("atacar", []); vueltas++; }
  if (estadoFinal !== "victoria") malas.push("no terminó en victoria (azar adverso en la prueba: revisar)");
  if (!resumenCapturado || !resumenCapturado.enemigosDerrotados.length) malas.push("el acumulador no registró al enemigo derrotado");
  if (!resumenCapturado.cadaveres.length) malas.push("no se registró el cadáver en el acumulador");
  if (!j.cbResultadoEl.hidden === false && j.cbResultadoEl.hidden) malas.push("el panel de resultado no se mostró");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: derrota difiere muerte() hasta pulsar CONTINUAR", () => {
  const malas = [];
  const j = bancoCombate();
  j.combate.e.ataque = 999; j.combate.e.daño = "50d1"; j.player.hp = 1;
  let muerteLlamada = false;
  j.muerte = () => { muerteLlamada = true; };
  let vueltas = 0;
  while (j.combate && vueltas < 10) { j.ejecutar("defender", []); vueltas++; }
  if (muerteLlamada) malas.push("muerte() se ejecutó antes de pulsar CONTINUAR");
  if (j.cbResultadoEl.hidden) malas.push("no se mostró el panel de derrota");
  const boton = Array.from(j.cbResultadoPanelEl.children).find(c => c.textContent === "CONTINUAR");
  if (!boton) malas.push("no hay botón CONTINUAR en la derrota");
  else boton.click();
  if (!muerteLlamada) malas.push("muerte() nunca se ejecutó tras CONTINUAR");
  if (j.zonaEl.classList.contains("en-combate")) malas.push("la ventana no se cerró tras CONTINUAR");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: huida exitosa cierra la ventana y no deja combate a medias", () => {
  const malas = [];
  const j = bancoCombate();
  const originalRandom = Azar.random;
  Azar.random = () => 0; // huir() compara < 0.5: garantiza éxito
  j.ejecutar("huir", []);
  Azar.random = originalRandom;
  if (j.combate) malas.push("el motor sigue activo tras huir con éxito");
  if (j.cbResultadoEl.hidden) malas.push("no se mostró el resultado de huida");
  const boton = Array.from(j.cbResultadoPanelEl.children).find(c => c.textContent === "CONTINUAR");
  boton?.click();
  if (j.zonaEl.classList.contains("en-combate")) malas.push("la ventana no se cerró tras la huida");
  if (!j.zonaEl || j.cbEl.hidden === false) { /* ok: cerrada */ }
  return malas;
});

PRUEBAS.registrar("interfaz de combate: varios enemigos, cambio de objetivo y tarjetas", () => {
  const malas = [];
  const j = bancoCombate();
  const otro = crearMob("larva_medula", MOBS.larva_medula || MOBS.escarabajo_hierro);
  j.combate.combatientes.push(otro);
  j.combate.estadosEnemigos.set(otro, []);
  j.renderCombatientes();
  if (j.cbCombatientesEl.children.length !== 2) malas.push(`no renderizó las 2 tarjetas (vi ${j.cbCombatientesEl.children.length})`);
  const tarjetaOtro = Array.from(j.cbCombatientesEl.children).find(b => !b.classList.contains("is-objetivo"));
  if (!tarjetaOtro) malas.push("no hay tarjeta para el enemigo que no es objetivo");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: hostiles sueltos en la sala se muestran aparte de los trabados", () => {
  const malas = [];
  const j = bancoCombate();
  const suelto = crearMob("escarabajo_hierro", MOBS.escarabajo_hierro);
  j.vivos.push(suelto);
  j.renderCombatientes();
  if (!/1 hostil/.test(j.cbSueltosEl.textContent || j.cbSueltosEl._text || ""))
    malas.push("no reporta el hostil no trabado");
  if (j.combate.combatientes.includes(suelto)) malas.push("el suelto ya aparece como combatiente sin razón");
  return malas;
});

PRUEBAS.registrar("interfaz de combate: clasificación de líneas del registro (crítico, fallo, muerte)", () => {
  const malas = [];
  const j = bancoCombate();
  const casos = [
    ["Palma Ardiente golpea a escarabajo: 6 de daño. ¡CRÍTICO!", "cl-critico"],
    ["Escarabajo ataca a Shein... y falla.", "cl-falla"],
    ["¡Escarabajo de hierro espiritual ha caído!", "cl-cae"],
    ["¡Rata qi se suma al combate!", "cl-union"],
  ];
  for (const [linea, esperado] of casos) {
    const clase = j.clasificarLineaCombate(linea);
    if (clase !== esperado) malas.push(`"${linea}" clasificó como "${clase}", esperaba "${esperado}"`);
  }
  return malas;
});



// Mismo espíritu que las pruebas de RAMAS: el índice de AYUDA se verifica
// solo, así que un alias repetido o una sección huérfana se detecta antes
// de llegar al jugador.
PRUEBAS.registrar("ayuda: índice sin alias duplicados ni vacíos", () => auditarAyuda());
PRUEBAS.registrar("misiones: descripciones completas y con frase de entrega", () => auditarMisiones());

PRUEBAS.registrar("ayuda: cada sección responde por número y por nombre", () => {
  const malas = [];
  for (let i = 0; i < AYUDA_SECCIONES.length; i++) {
    const sec = AYUDA_SECCIONES[i];
    if (buscarSeccionAyuda(String(i + 1)).seccion !== sec) malas.push(`AYUDA ${i + 1} no abre «${sec.nombre}»`);
    if (buscarSeccionAyuda(sec.nombre).seccion !== sec) malas.push(`AYUDA ${sec.nombre} no se abre a sí misma`);
  }
  // Una consulta que no existe no debe romper nada ni devolver una sección al azar.
  const nada = buscarSeccionAyuda("xyzzy_inexistente");
  if (nada.seccion || nada.candidatas) malas.push('una consulta sin sentido ("xyzzy_inexistente") devolvió algo');
  return malas;
});

PRUEBAS.registrar("ayuda: AYUDA y AYUDA <sección> no gastan turno", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const antes = j.turnoGlobal;
  j.ejecutar("ayuda", []);
  if (j.turnoGlobal !== antes) malas.push(`AYUDA movió turnoGlobal de ${antes} a ${j.turnoGlobal}`);
  j.ejecutar("ayuda", ["combate"]);
  if (j.turnoGlobal !== antes) malas.push(`AYUDA COMBATE movió turnoGlobal de ${antes} a ${j.turnoGlobal}`);
  return malas;
});

PRUEBAS.registrar("referencias: el mundo es alcanzable desde el camino", () => {
  const vistas = new Set(["camino"]);
  const cola = ["camino"];
  while (cola.length) {
    const rid = cola.pop();
    for (const destino of Object.values(ROOMS[rid].exits || {}))
      if (ROOMS[destino] && !vistas.has(destino)) { vistas.add(destino); cola.push(destino); }
  }
  return Object.keys(ROOMS).filter(rid => !vistas.has(rid)).map(rid => `sala "${rid}" sin camino de ida desde el inicio`);
});


PRUEBAS.registrar("tutorial: nuevas salas y conexiones válidas", () => {
for(const [a,d,b] of [["patio_raices","norte","descansillo"],["descansillo","este","mirador_niebla"],["descansillo","oeste","patio_practica"],["descansillo","norte","sendero_pinos"],["sendero_pinos","norte","camino"],["camino","norte","puerta"],["puerta","norte","registro"],["registro","norte","sala_jade"],["sala_jade","norte","patio"]]) afirmar(ROOMS[a].exits[d]===b&&ROOMS[b].exits[DIRECCION_OPUESTA[d]]===a,"Conexión incorrecta: "+a);
});

PRUEBAS.registrar("tutorial: personaje nuevo empieza antes de la puerta", () => {
  const j = PRUEBAS.banco();
  j.crearPersonaje("InicioReal", "fuego", "campesino");
  return j.pos === "patio_raices" ? [] : [`inicio esperado patio_raices, quedó ${j.pos}`];
});



PRUEBAS.registrar("tutorial: veterano puede cruzar por la ruta central sin desvíos", () => {
const j=PRUEBAS.banco({pos:"patio_raices"}); for(let i=0;i<7;i++)j.cmd_ir("norte"); afirmar(j.pos==="patio","Ruta canónica incompleta");afirmar(j.quests.P==='activa'&&Object.keys(j.quests).length===1,"Prólogo alterado durante tránsito");
});





PRUEBAS.registrar("tutorial: guardado viejo no retrocede a la entrada", () => {
const j=PRUEBAS.banco(),antes=JSON.stringify(j.serializar());let accedido=false;const legacy={get player(){accedido=true;throw Error("Accedió player legacy");}};afirmar(j.deserializar(legacy)===false,"No rechazó save sin versión");afirmar(!accedido,"Leyó estado legacy");afirmar(JSON.stringify(j.serializar()).replace(/"fecha":\d+/,"")===antes.replace(/"fecha":\d+/,""),"Mutó estado");
});







// ---------- reglas de turno ----------

PRUEBAS.registrar("turno: una orden inválida no consume turno", () => {
  const j = PRUEBAS.banco();
  const antes = j.turnoGlobal;
  j.ejecutar("asdfgh", []);
  j.ejecutar("zzzz", ["algo"]);
  if (j.turnoGlobal !== antes) return [`dos órdenes inválidas movieron turnoGlobal de ${antes} a ${j.turnoGlobal}`];
  return [];
});

PRUEBAS.registrar("turno: una orden válida consume exactamente uno", () => {
  const j = PRUEBAS.banco();
  const antes = j.turnoGlobal;
  j.ejecutar("inventario", []);
  if (j.turnoGlobal !== antes + 1) return [`"inventario" movió turnoGlobal de ${antes} a ${j.turnoGlobal}`];
  return [];
});

PRUEBAS.registrar("turno: los cadáveres no envejecen con órdenes inválidas", () => {
  const j = PRUEBAS.banco();
  j.registrarCadaver(crearMob("rata_qi", MOBS.rata_qi));
  const antes = j.cadaveresEnSala().length;
  for (let i = 0; i < DURACION_CADAVER + 5; i++) j.ejecutar("nada_de_esto_existe", []);
  const despues = j.cadaveresEnSala().length;
  if (despues !== antes) return [`${antes} cadáver(es) antes, ${despues} después de ${DURACION_CADAVER + 5} órdenes inválidas`];
  return [];
});

// ---------- combate aislado ----------

PRUEBAS.registrar("combate: una pelea entera contra cada criatura", () => {
  const malas = [];
  for (const mid of Object.keys(MOBS)) {
    Azar.sembrar(20250915);
    const j = PRUEBAS.banco();
    j.player.hp = j.player.max_hp = 9999;
    j.player.ataque = 50;
    try {
      const c = new Combate(j, crearMob(mid, MOBS[mid]), mid);
      j.combate = c;
      let rondas = 0, estado = "continua";
      while (estado === "continua" && rondas < 400) { estado = c.turno("atacar", [])[1]; rondas++; }
      if (estado === "continua") malas.push(`${mid}: 400 rondas sin resolverse`);
    } catch (ex) {
      malas.push(`${mid}: ${ex.message}`);
    }
  }
  return malas;
});

PRUEBAS.registrar("combate: el daño de cada criatura está dentro de su rango", () => {
  const malas = [];
  for (const [mid, m] of Object.entries(MOBS)) {
    if (!m.daño) { malas.push(`${mid}: sin daño declarado`); continue; }
    if (!/^\d+d\d+([+-]\d+)?$/.test(m.daño)) malas.push(`${mid}: daño "${m.daño}" con formato raro`);
    if (!(m.hp > 0)) malas.push(`${mid}: hp ${m.hp}`);
  }
  return malas;
});

// ---------- misiones ----------

// Intenta dejar una misión en condiciones de entregarse, leyendo su propia
// condición `listo`: banderas que consulta, contadores que cuenta y objetos que
// pide en el inventario. Es una heurística: si no alcanza, la prueba no exige
// la entrega, sólo que nada explote por el camino.
PRUEBAS.satisfacer = function (j, qid, q) {
  const fuente = typeof q.listo === "function" ? q.listo.toString() : "";
  for (const contador of q.contadores || []) j.flags[contador] = 999;
  for (const m of fuente.matchAll(/flags\.([A-Za-z0-9_]+)/g)) j.flags[m[1]] = true;
  for (const m of fuente.matchAll(/x === "([A-Za-z0-9_]+)"/g))
    for (let i = 0; i < 10; i++) j.player.inventario.push(m[1]);
  return typeof q.listo !== "function" || !!q.listo(j);
};

PRUEBAS.registrar("misiones: cada una se puede activar y completar", () => {
  const malas = [];
  for (const [qid, q] of Object.entries(QUESTS)) {
    const j = PRUEBAS.banco();
    try {
      j.activarMision(qid);
      if (j.quests[qid] !== "activa") { malas.push(`${qid}: no quedó activa`); continue; }
      const lista = PRUEBAS.satisfacer(j, qid, q);
      if (typeof q.progreso === "function") q.progreso(j);
      if (typeof q.pistas === "function") q.pistas(j);
      if (!lista) continue;   // no se pudo preparar sola; ya comprobamos que no rompe
      j.completarMision(qid);
      if (j.quests[qid] !== "hecha") malas.push(`${qid}: cumplida su condición, completarMision la dejó en "${j.quests[qid]}"`);
    } catch (ex) {
      malas.push(`${qid}: ${ex.message}`);
    }
  }
  return malas;
});

// ---------- oficios: rangos, tramos y normalización ----------

PRUEBAS.registrar("oficios v3: umbrales 0/50/180 y rango formal separado de XP", () => {
  const j = PRUEBAS.banco();
  j.desbloquearProfesion("examen");
  const malas = [];
  let r = j.rangoProfesion("examen");
  if (r.nombre !== "Iniciado" || r.xp !== 0) malas.push(`inicio esperado Iniciado 0 XP; quedó ${r.nombre} ${r.xp}`);
  j.sumarExperienciaProfesion("examen", 49);
  r = j.rangoProfesion("examen");
  if (r.apto) malas.push("49 XP marcó apto para Novicio");
  j.sumarExperienciaProfesion("examen", 1);
  r = j.rangoProfesion("examen");
  if (!r.apto || r.nombre !== "Iniciado") malas.push("50 XP debe habilitar reconocimiento sin ascenso automático");
  const texto = j.promoverProfesion("examen");
  r = j.rangoProfesion("examen");
  if (r.nombre !== "Novicio") malas.push(`promoción a Novicio falló: ${texto}`);
  j.sumarExperienciaProfesion("examen", 500);
  const bloqueo = j.promoverProfesion("examen");
  r = j.rangoProfesion("examen");
  if (r.nombre !== "Novicio") malas.push("Arco 1 permitió subir por encima de Novicio");
  if (!bloqueo.includes("arco posterior")) malas.push("el bloqueo del rango superior no explicó el requisito de arco");
  return malas;
});

PRUEBAS.registrar("oficios v3: tramos de aprendizaje comunes", () => {
  const esperados = new Map([[1,1],[2,.75],[3,.4],[5,.4],[6,.15],[10,.15],[11,0],[99,0]]);
  const malas = [];
  for (const [n, esperado] of esperados) {
    const actual = factorAprendizaje(n);
    if (Math.abs(actual - esperado) > 1e-9) malas.push(`${n} éxito(s): ${actual}, esperado ${esperado}`);
  }
  if (Math.abs(xpPracticaPorDificultad("examen", "normal", 2) - 1.5) > 1e-9)
    malas.push("Examen normal, segundo éxito, debería dar 1.5 XP");
  if (Math.abs(xpPracticaPorDificultad("alquimia", "muy_dificil", 6) - .75) > 1e-9)
    malas.push("Alquimia muy difícil, sexto éxito, debería dar 0.75 XP");
  return malas;
});

PRUEBAS.registrar("3C.1R: profesiones conserva datos actuales sin acreditar formatos retirados", () => {
  const j = PRUEBAS.banco(), p = j.player;
  p.profesiones.examen = { xp: 23.5, rango: 1, materiales: {aguijon_jade:4}, desbloqueada:false,
    descubrimientos: { serpiente_qi:{observaciones:2,exitos:1,procedimientos:{}}, avispa_jade:true } };
  delete p.profesiones.alquimia; p.alquimia = 99;
  j.normalizarProfesiones();
  const e = p.profesiones.examen, a = p.profesiones.alquimia;
  afirmar(e.xp === 23.5 && e.materiales.aguijon_jade === 4 && e.descubrimientos.serpiente_qi.exitos === 1, "Perdió progreso actual");
  afirmar(!e.descubrimientos.avispa_jade, "Acreditó observación desde booleano");
  afirmar(!e.desbloqueada && !a.desbloqueada && a.xp === 0 && a.elaboraciones === 0, "Concedió oficio o progreso sin registro actual");
  afirmar(p.profesiones.herboristeria.desbloqueada, "Perdió soporte provisional");
  const antes = JSON.stringify(p.profesiones); j.normalizarProfesiones();
  afirmar(JSON.stringify(p.profesiones) === antes, "Normalización no idempotente");
});


// ---------- Extracción Espiritual · Etapa 2 ----------

PRUEBAS.registrar("examen v4: todos los procedimientos declaran contrato válido", () => {
  const malas = [];
  const dificultades = new Set(Object.keys(EXITO_BASE_EXAMEN));
  for (const [mobId, tabla] of Object.entries(HALLAZGOS_CADAVER)) {
    if (!MOBS[mobId]) malas.push(`${mobId}: especie inexistente`);
    const ids = new Set();
    for (const h of tabla.hallazgos || []) {
      if (!h.id) malas.push(`${mobId}: procedimiento sin id`);
      if (ids.has(h.id)) malas.push(`${mobId}: id repetido ${h.id}`);
      ids.add(h.id);
      if (!ITEMS[h.item]) malas.push(`${mobId}.${h.id}: item ${h.item} inexistente`);
      if (ITEMS[h.item]?.tipo !== "material") malas.push(`${mobId}.${h.id}: ${h.item} no es material`);
      if (!dificultades.has(h.dificultad)) malas.push(`${mobId}.${h.id}: dificultad ${h.dificultad} inválida`);
      if (!(h.cantidad >= 1)) malas.push(`${mobId}.${h.id}: cantidad inválida`);
      if (!h.metodo) malas.push(`${mobId}.${h.id}: método vacío`);
    }
  }
  const vegetalesProhibidos = new Set(["raiz_sangre", "hierba_claridad", "musgo_lunar"]);
  for (const [mobId, tabla] of Object.entries(HALLAZGOS_CADAVER))
    for (const h of tabla.hallazgos || []) if (vegetalesProhibidos.has(h.item)) malas.push(`${mobId}.${h.id}: cadáver produce material vegetal ${h.item}`);
  return malas;
});

PRUEBAS.registrar("examen v4: probabilidades dependen de dificultad y rango formal", () => {
  const j = PRUEBAS.banco();
  j.desbloquearProfesion("examen");
  const malas = [];
  const esperado = { simple:.75, normal:.60, dificil:.40, muy_dificil:.25 };
  for (const [d, base] of Object.entries(esperado)) {
    const h = { dificultad:d };
    if (Math.abs(j.probabilidadExamen(h, 0) - base) > 1e-9) malas.push(`${d}: base incorrecta`);
    if (Math.abs(j.probabilidadExamen(h, 1) - Math.min(.9, base + .05)) > 1e-9) malas.push(`${d}: bono Novicio incorrecto`);
    if (Math.abs(j.probabilidadExamen(h, 2) - Math.min(.9, base + .10)) > 1e-9) malas.push(`${d}: bono Aprendiz incorrecto`);
  }
  return malas;
});

PRUEBAS.registrar("examen v4: observar informa pero nunca concede XP", () => {
  const j = PRUEBAS.banco({ pos:"bosque_claro_raices" });
  j.desbloquearProfesion("examen");
  j.cadaveres = { bosque_claro_raices: [{ mob_id:"serpiente_qi", name:MOBS.serpiente_qi.name, corto:"serpiente", elemento:"agua", tipo:"cadáver", desapareceEn:99 }] };
  const antes = j.player.profesiones.examen.xp;
  const t1 = j.observarCadaver(0);
  const medio = j.player.profesiones.examen.xp;
  const t2 = j.observarCadaver(0);
  const despues = j.player.profesiones.examen.xp;
  const reg = j.player.profesiones.examen.descubrimientos.serpiente_qi;
  const malas = [];
  if (medio !== antes || despues !== antes) malas.push(`examinar cambió XP ${antes} -> ${despues}`);
  if (reg?.observaciones !== 1) malas.push(`revisar el mismo cadáver contó ${reg?.observaciones} observaciones; esperado 1`);
  if (!t1.ok || !t2.ok) malas.push("observar el cuerpo falló");
  return malas;
});

PRUEBAS.registrar("examen v4: éxito concede material, bonos únicos y tramos", () => {
  const j = PRUEBAS.banco({ pos:"bosque_claro_raices" });
  j.desbloquearProfesion("examen");
  const viejoRandom = Azar.random;
  Azar.random = () => 0;
  const malas = [];
  try {
    const nuevo = () => ({ mob_id:"serpiente_qi", name:MOBS.serpiente_qi.name, corto:"serpiente", elemento:"agua", tipo:"cadáver", desapareceEn:999 });
    j.cadaveres = { bosque_claro_raices:[nuevo()] };
    const r1 = j.recolectarCadaver(0, "extraer glándula de jade");
    const xp1 = j.player.profesiones.examen.xp;
    if (Math.abs(xp1 - 5) > 1e-9) malas.push(`primer éxito normal dio ${xp1} XP; esperado 5 (2 práctica +2 especie +1 procedimiento)`);
    if (j.player.inventario.filter(x => x === "aguijon_jade").length !== 1) malas.push("primer éxito no entregó aguijón de jade");
    if (!r1.includes("+5 XP")) malas.push("el resultado no informó +5 XP");
    j.cadaveres.bosque_claro_raices = [nuevo()];
    j.recolectarCadaver(0, "extraer glándula de jade");
    const xp2 = j.player.profesiones.examen.xp;
    if (Math.abs(xp2 - 6.5) > 1e-9) malas.push(`segundo éxito acumuló ${xp2}; esperado 6.5`);
    if (j.player.profesiones.examen.procedimientos["serpiente_qi:glandula_jade"] !== 2) malas.push("no registró dos éxitos del procedimiento estable");
  } finally { Azar.random = viejoRandom; }
  return malas;
});

PRUEBAS.registrar("examen v4: fallar da 0 XP y consume sólo ese procedimiento", () => {
  const j = PRUEBAS.banco({ pos:"bosque_claro_raices" });
  j.desbloquearProfesion("examen");
  j.cadaveres = { bosque_claro_raices: [{ mob_id:"serpiente_qi", name:MOBS.serpiente_qi.name, corto:"serpiente", elemento:"agua", tipo:"cadáver", desapareceEn:999 }] };
  const viejoRandom = Azar.random;
  Azar.random = () => 1;
  const malas = [];
  try {
    const antes = j.player.profesiones.examen.xp;
    const fallo = j.recolectarCadaver(0, "separar membrana meridiana");
    const despues = j.player.profesiones.examen.xp;
    if (despues !== antes) malas.push(`fallo cambió XP ${antes} -> ${despues}`);
    if (j.player.inventario.includes("membrana_serpentina")) malas.push("fallo entregó material");
    if (!fallo.includes("0 XP")) malas.push("fallo no informa 0 XP");
    Azar.random = () => 0;
    const repetido = j.recolectarCadaver(0, "separar membrana meridiana");
    if (!repetido.includes("ya fue intentado")) malas.push("permitió reintentar una estructura arruinada");
    const otro = j.recolectarCadaver(0, "extraer glándula de jade");
    if (!otro.startsWith("Extracción espiritual:")) malas.push("fallar una estructura bloqueó indebidamente otro procedimiento del mismo cadáver");
  } finally { Azar.random = viejoRandom; }
  return malas;
});

PRUEBAS.registrar("examen v4: botín automático no concede XP ni cuenta como extracción", () => {
  const j = PRUEBAS.banco();
  j.desbloquearProfesion("examen");
  const viejoRandom = Azar.random;
  Azar.random = () => 0;
  const malas = [];
  try {
    const antesXP = j.player.profesiones.examen.xp;
    const antesTotal = j.player.profesiones.examen.total;
    j.recompensas("serpiente_qi", { qi_recompensa:0, loot:[{ item:"aguijon_jade", prob:1 }], unico:false });
    if (j.player.profesiones.examen.xp !== antesXP) malas.push("botín automático concedió XP de Examen");
    if (j.player.profesiones.examen.total !== antesTotal) malas.push("botín automático contó como material extraído");
    if (!j.player.inventario.includes("aguijon_jade")) malas.push("la corrección profesional rompió el botín normal");
  } finally { Azar.random = viejoRandom; }
  return malas;
});

PRUEBAS.registrar("examen v4: familiaridad exige observación y procedimientos reales", () => {
  const j = PRUEBAS.banco();
  j.desbloquearProfesion("examen");
  const reg = j.registroEspecieExamen("serpiente_qi", true);
  const malas = [];
  if (j.familiaridadExamen("serpiente_qi").nombre !== "Observada") malas.push("registro recién creado no quedó Observada");
  reg.observaciones = 2;
  if (j.familiaridadExamen("serpiente_qi").nombre !== "Estudiada") malas.push("dos observaciones no dieron Estudiada");
  reg.observaciones = 6;
  reg.procedimientos.glandula_jade = 1;
  if (j.familiaridadExamen("serpiente_qi").nombre === "Comprendida") malas.push("Comprendida sin dominar todos los procedimientos");
  reg.procedimientos.membrana_meridiana = 1;
  if (j.familiaridadExamen("serpiente_qi").nombre !== "Comprendida") malas.push("seis observaciones + todos los procedimientos no dieron Comprendida");
  return malas;
});

PRUEBAS.registrar("herboristería v5: catálogo y nodos usan contratos válidos", () => {
  const malas = [];
  for (const [especieId, planta] of Object.entries(PLANTAS_ESPIRITUALES)) {
    if (!planta.procedimientos?.length) malas.push(`${especieId}: sin procedimientos`);
    const ids = new Set();
    for (const p of planta.procedimientos || []) {
      if (!p.id || ids.has(p.id)) malas.push(`${especieId}: id de procedimiento ausente/repetido ${p.id}`);
      ids.add(p.id);
      if (!ITEMS[p.item] || ITEMS[p.item].tipo !== "material") malas.push(`${especieId}:${p.id}: material inválido ${p.item}`);
      if (!(p.dificultad in EXITO_BASE_HERBORISTERIA)) malas.push(`${especieId}:${p.id}: dificultad inválida ${p.dificultad}`);
      if (!(p.recuperacionExito > 0) || !(p.recuperacionFallo > 0)) malas.push(`${especieId}:${p.id}: recuperación no positiva`);
    }
  }
  for (const [nodoId,nodo] of Object.entries(NODOS_HERBORISTERIA)) {
    if (!PLANTAS_ESPIRITUALES[nodo.especie]) malas.push(`${nodoId}: especie inexistente ${nodo.especie}`);
    if (!(nodoId === "sangre_huerto" && nodo.sala === null && nodo.pendiente === "P06") && !ROOMS[nodo.sala]) malas.push(`${nodoId}: sala inexistente ${nodo.sala}`);
  }
  return malas;
});

PRUEBAS.registrar("herboristería v5: examinar da 0 XP y no se puede farmear observación", () => {
  const j = PRUEBAS.banco({ pos:"bosque_claro_raices" });
  j.desbloquearProfesion("herboristeria");
  const antes = j.player.profesiones.herboristeria.xp;
  const t1 = j.recolectarPlanta(0,"examinar");
  const reg = j.player.profesiones.herboristeria.especies.claridad;
  const obs1 = reg?.observaciones || 0;
  const t2 = j.recolectarPlanta(0,"examinar");
  const malas = [];
  if (j.player.profesiones.herboristeria.xp !== antes) malas.push("examinar cambió XP");
  if (obs1 !== 1 || reg?.observaciones !== 1) malas.push(`observaciones repetibles sin cambio ecológico: ${obs1} -> ${reg?.observaciones}`);
  if (!t1.includes("0 XP") || !t2.includes("0 XP")) malas.push("los mensajes no explican 0 XP");
  return malas;
});

PRUEBAS.registrar("herboristería v5: éxito concede material, bonos y recuperación", () => {
  const sala = NODOS_HERBORISTERIA.claridad_bambu_1.sala;
  const j = PRUEBAS.banco({ pos:sala });
  j.desbloquearProfesion("herboristeria");
  const viejoRandom = Azar.random; Azar.random = () => 0;
  const malas=[];
  try {
    j.recolectarPlanta(0,"examinar");
    const r1=j.recolectarPlanta(0,"cortar hojas exteriores");
    const xp=j.player.profesiones.herboristeria.xp;
    if (Math.abs(xp-4)>1e-9) malas.push(`primer éxito simple dio ${xp}; esperado 4 (1+2+1)`);
    if (!j.player.inventario.includes("hierba_claridad")) malas.push("no entregó hoja de claridad");
    if (!r1.includes("+4 XP")) malas.push("mensaje no informó +4 XP");
    const disp=j.estadoPartePlanta("claridad_bambu_1", PLANTAS_ESPIRITUALES.claridad.procedimientos[0]);
    if (disp.disponible || disp.espera <= 0) malas.push("la parte no entró en recuperación");
  } finally { Azar.random=viejoRandom; }
  return malas;
});

PRUEBAS.registrar("herboristería v5: fallo da 0 XP y altera el nodo", () => {
  const sala=NODOS_HERBORISTERIA.jade_huerto.sala;
  const j=PRUEBAS.banco({pos:sala});
  j.desbloquearProfesion("herboristeria");
  const viejoRandom=Azar.random; Azar.random=()=>1;
  const malas=[];
  try {
    const plantas=j.plantasEnSala();
    const idx=plantas.findIndex(n=>n.especie==="jade");
    const antes=j.player.profesiones.herboristeria.xp;
    const r=j.recolectarPlanta(idx,"cortar zarcillo flexible");
    if (j.player.profesiones.herboristeria.xp!==antes) malas.push("fallo dio XP");
    if (j.player.inventario.includes("fibra_jade")) malas.push("fallo entregó material");
    if (!r.includes("0 XP")) malas.push("fallo no informa 0 XP");
    const disp=j.estadoPartePlanta("jade_huerto", PLANTAS_ESPIRITUALES.jade.procedimientos[0]);
    if (disp.disponible) malas.push("fallo no puso la parte en recuperación");
  } finally { Azar.random=viejoRandom; }
  return malas;
});

PRUEBAS.registrar("herboristería v5: destructivo bloquea la planta completa", () => {
  const j=PRUEBAS.banco({pos:"bosque_cauce_oculto"});
  j.desbloquearProfesion("herboristeria");
  const viejoRandom=Azar.random; Azar.random=()=>0;
  const malas=[];
  try {
    const plantas=j.plantasEnSala();
    const idx=plantas.findIndex(n=>n.especie==="sangre");
    j.recolectarPlanta(idx,"extraer corona de sangre");
    const nodo=plantas[idx];
    const otro=PLANTAS_ESPIRITUALES.sangre.procedimientos.find(p=>p.id==="lateral");
    const disp=j.estadoPartePlanta(nodo.id,otro);
    if (disp.disponible || disp.planta) malas.push("procedimiento destructivo no bloqueó la planta completa");
  } finally { Azar.random=viejoRandom; }
  return malas;
});

PRUEBAS.registrar("herboristería v5: familiaridad no exige procedimientos destructivos", () => {
  const j=PRUEBAS.banco({pos:"bosque_claro_humedo"});
  j.desbloquearProfesion("herboristeria");
  const reg=j.registroEspecieHerboristeria("sangre",true);
  reg.observaciones=6; reg.exitos=1; reg.procedimientos.lateral=1;
  const fam=j.familiaridadHerboristeria("sangre");
  return fam.nombre === "Comprendida" ? [] : [`esperado Comprendida sin arrancar corona; quedó ${fam.nombre}`];
});

PRUEBAS.registrar("herboristería v5: materiales sueltos no otorgan XP profesional", () => {
  const j=PRUEBAS.banco({pos:"bosque_claro_raices"});
  j.desbloquearProfesion("herboristeria");
  const antes=j.player.profesiones.herboristeria.xp;
  j.player.inventario.push("hierba_claridad");
  const despues=j.player.profesiones.herboristeria.xp;
  return despues===antes ? [] : [`objeto agregado al inventario cambió XP ${antes}->${despues}`];
});



PRUEBAS.registrar("herboristería v5: el estado ecológico sobrevive guardado/carga", () => {
  const sala=NODOS_HERBORISTERIA.claridad_bambu_1.sala;
  const j=PRUEBAS.banco({pos:sala});
  j.desbloquearProfesion("herboristeria");
  const viejoRandom=Azar.random; Azar.random=()=>0;
  try { j.recolectarPlanta(0,"cortar hojas exteriores"); } finally { Azar.random=viejoRandom; }
  const antes=j.estadoNodoHerboristeria("claridad_bambu_1",false);
  const copia=PRUEBAS.banco({pos:sala});
  copia.deserializar(JSON.parse(JSON.stringify(j.serializar())));
  const despues=copia.estadoNodoHerboristeria("claridad_bambu_1",false);
  const malas=[];
  if (!antes || !despues) malas.push("se perdió el nodo al guardar/cargar");
  else if (JSON.stringify(antes.partes)!==JSON.stringify(despues.partes) || antes.cambios!==despues.cambios) malas.push("cambió el estado ecológico del nodo");
  return malas;
});

// ---------- guardados y validación ----------



PRUEBAS.registrar("alquimia v6: la estación depende de propiedad de room", () => {
const j=PRUEBAS.banco({pos:"patio"});afirmar(!j.tieneEstacionAlquimia(),"Estación inventada");j.rooms.patio.estaciones={alquimia:true};afirmar(j.tieneEstacionAlquimia(),"Ignoró propiedad de estación de fixture");delete j.rooms.patio.estaciones;afirmar(!Object.values(ROOMS).some(r=>r.estaciones?.alquimia),"P03 resuelta sin decisión");
});
PRUEBAS.registrar("alquimia v6: fallo da 0 XP y no avanza práctica", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones(); j.pos="cocina_comunal";
  j.player.inventario.push("musgo_lunar","musgo_lunar","hierba_claridad"); const st=j.estadoRecetaAlquimia("purificacion"), xp=j.player.profesiones.alquimia.xp;
  j.elaboracion={rid:"purificacion",elecciones:[3,3,1]}; j.resolverElaboracion();
  if (j.player.profesiones.alquimia.xp!==xp) malas.push("fallo concedió XP"); if(st.validas!==0) malas.push("fallo avanzó válidas"); return malas;
});
PRUEBAS.registrar("alquimia v6: precisión perfecta respeta techo de práctica", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones(); j.pos="cocina_comunal";
  j.player.inventario.push("raiz_sangre","hierba_claridad"); j.elaboracion={rid:"sangre",elecciones:[2,2,2]}; const q=j.resolverElaboracion();
  if(q!=="superior") malas.push(`primera sencilla perfecta debía ser superior, fue ${q}`); return malas;
});
PRUEBAS.registrar("alquimia v6: bitácora confirma un pulso tras dos señales positivas", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones();
  j.registrarObservacionesAlquimia("sangre",[2,2,2]); j.registrarObservacionesAlquimia("sangre",[2,2,2]);
  if(j.estadoRecetaAlquimia("sangre").pulsos[0].confirmado!==2) malas.push("no confirmó fuego medio"); return malas;
});
PRUEBAS.registrar("alquimia v6: recetas no conocidas permanecen ocultas", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones(); j.actualizarRecetasAlquimia();
  if(!j.estadoRecetaAlquimia("sangre").conocida) malas.push("sangre no quedó inicial"); if(j.estadoRecetaAlquimia("tempestad").conocida) malas.push("tempestad se reveló sin rango/material"); return malas;
});

PRUEBAS.registrar("alquimia v41: CALDERO es alias de ALQUIMIA", () => {
  const [verbo,args]=parse("caldero sangre");
  const malas=[];
  if(verbo!=="alquimia") malas.push(`caldero resolvió ${verbo}`);
  if(args[0]!=="sangre") malas.push("perdió el nombre de la receta");
  return malas;
});

PRUEBAS.registrar("alquimia v41: la Bitácora no ejecuta crafteo", () => {
  const cuerpo=Juego.prototype.renderAlquimia.toString();
  const malas=[];
  if(cuerpo.includes("iniciarElaboracion(")) malas.push("renderAlquimia todavía inicia elaboraciones");
  if(!cuerpo.includes("Bitácora")) malas.push("la sección dejó de identificarse como Bitácora");
  return malas;
});

PRUEBAS.registrar("alquimia v58: el resultado se integra en el panel central sin reemplazar la interfaz", () => {
  const j=PRUEBAS.banco({pos:"cocina_comunal"}), malas=[]; j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones(); j.rooms[j.pos].estaciones={alquimia:true}; // fixture temporal, no resuelve P03

  j.estadoRecetaAlquimia("sangre").validas=1;
  j.player.inventario.push("raiz_sangre","hierba_claridad");
  j.elaboracion={rid:"sangre",variante:"base",elecciones:[2,2,2],rapida:false};
  j.resolverElaboracion();
  j.interaccionOficioTipo="alquimia";
  const cont=document.getElementById("interaccionDetalle"), previo=cont.innerHTML;
  try {
    j.renderInteraccionOficio();
    const panel=cont.querySelector(".alq-layout main .alq-resultado");
    if(!panel) return ["el resultado no aparece dentro del panel central"];
    if(!cont.querySelector(".alq-layout aside")) malas.push("la interfaz de alquimia desapareció al mostrar el resultado");
    const filas=[...panel.querySelectorAll(".alq-resultado-fila b")].map(b=>b.textContent);
    if(filas.join("|")!=="Calidad|Cantidad|XP de Alquimia") malas.push("la tabla debe ser Calidad, Cantidad, XP (sin Tipo): "+filas.join("|"));
    if(!panel.querySelector(".alq-resultado-efecto")) malas.push("falta el bloque de efecto conseguido");
    if(panel.querySelector("h3")?.textContent!==capitalizarUI(ITEMS[j.alquimiaResultado.itemId].name)) malas.push("el título no es el ítem obtenido");
    if(cont.querySelector(".alq-etapa,.alq-acciones .principal")) malas.push("siguen visibles las etapas/acciones bajo el resultado");
  } finally { cont.innerHTML=previo; }
  return malas;
});

PRUEBAS.registrar("alquimia v41: elaboración rápida permanece bloqueada sin Excepcional", () => {
  const j=PRUEBAS.banco({pos:"cocina_comunal"}); j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones();
  j.player.inventario.push("raiz_sangre","hierba_claridad");
  const antes=j.player.inventario.length;
  const ok=j.iniciarElaboracion("sangre",{rapida:true});
  const malas=[];
  if(ok!==false) malas.push("permitió elaboración rápida sin dominio excepcional");
  if(j.player.inventario.length!==antes) malas.push("consumió ingredientes al rechazar elaboración rápida");
  return malas;
});

PRUEBAS.registrar("alquimia v41: Excepcional desbloquea método rápido por variante", () => {
  const j=PRUEBAS.banco({pos:"cocina_comunal"}); j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones();
  const st=j.estadoRecetaAlquimia("sangre"); st.validas=1;
  j.player.inventario.push("raiz_sangre","hierba_claridad");
  j.elaboracion={rid:"sangre",variante:"base",elecciones:[2,2,2],rapida:false};
  const calidad=j.resolverElaboracion(), malas=[];
  if(calidad!=="excepcional") malas.push(`esperaba excepcional, obtuvo ${calidad}`);
  if(!j.alquimiaDominada("sangre","base")) malas.push("no marcó dominio excepcional");
  if(!j.alquimiaResultado?.desbloqueoRapido) malas.push("no anunció desbloqueo rápido en el primer excepcional");
  const metodo=j.dominioAlquimia("sangre","base")?.metodo;
  if(JSON.stringify(metodo)!==JSON.stringify([2,2,2])) malas.push("no conservó el método dominado");
  return malas;
});

PRUEBAS.registrar("alquimia v41: método rápido repite la variante dominada", () => {
  const j=PRUEBAS.banco({pos:"cocina_comunal"}); j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones(); j.rooms[j.pos].estaciones={alquimia:true}; // fixture temporal, no resuelve P03

  const st=j.estadoRecetaAlquimia("sangre"); st.validas=2; j.registrarDominioExcepcionalAlquimia("sangre",[2,2,2],"base");
  j.player.inventario.push("raiz_sangre","hierba_claridad");
  const calidad=j.iniciarElaboracion("sangre",{rapida:true,variante:"base"}), malas=[];
  if(calidad!=="excepcional") malas.push(`rápida no reprodujo excepcional: ${calidad}`);
  if(j.alquimiaResultado?.modo!=="rapida") malas.push("el resultado no registra modo rápido");
  if(!j.player.inventario.includes("pocion_refinada_excepcional")) malas.push("no creó la variante excepcional");
  return malas;
});

PRUEBAS.registrar("alquimia v41: curas de veneno y quemadura pertenecen a Purificación", () => {
  const malas=[];
  for(const rid of ["antidoto","ceniza","purificacion"]) if(RECETAS[rid].categoria!=="purificacion") malas.push(`${rid}: categoría ${RECETAS[rid].categoria}`);
  return malas;
});

PRUEBAS.registrar("ecología v6: nodos trasladados conservan ids y hábitats nuevos", () => {
  const esperado={
    claridad_bambu_1:"bosque_cauce_oculto", claridad_acantilado:"bosque_mirador_alto",
    sangre_bambu:"bosque_cauce_oculto", jade_huerto:"bosque_cauce_oculto",
    ceniza_quebrada:"desvio_termal", medula_cueva:"sima_resonante",
    lunar_sumidero:"aguas_terraza_humeda", niebla_galeria:"bosque_mirador_alto", trueno_nido:"alturas_aguja_piedra"
  };
  for(const [nid,rid] of Object.entries(esperado)){
    if(NODOS_HERBORISTERIA[nid]?.sala!==rid) throw new Error(`${nid}: esperado ${rid}`);
  }
  if(Object.keys(NODOS_HERBORISTERIA).length!==12) throw new Error("la redistribución no debe inflar el número de nodos en esta etapa");
});

PRUEBAS.registrar("ecología v6: nuevas salas no rompen referencias de exits ni mobs", () => {
for(const [id,r] of Object.entries(ROOMS)){afirmar(typeof r.desc==="string"&&r.desc.length>0,"Sin descripción/marcador: "+id);for(const mid of r.mobs||[])afirmar(!!MOBS[mid],"Mob inexistente");} afirmar(!auditarReferenciasMundo({conectividad:true}).length,"Referencias rotas");
});

// ---------- Etapa 6 · aflicciones persistentes ----------
PRUEBAS.registrar("aflicciones v7: familias y grados de Arco 1 están declarados", () => {
  const malas=[];
  for (const mid of ["serpiente_qi","avispa_jade"]) {
    const v=MOBS[mid]?.tecnica?.veneno;
    if (!v || v.familia!=="jade" || v.grado!==1) malas.push(`${mid}: veneno no es jade I`);
  }
  for (const mid of ["sapo_ceniza","sapo_caldera"]) {
    const q=MOBS[mid]?.tecnica?.quemadura;
    if (!q || q.familia!=="ceniza" || q.grado!==1) malas.push(`${mid}: quemadura no es ceniza I`);
  }
  return malas;
});
