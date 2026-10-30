PRUEBAS.registrar("aflicciones v7: persisten, hacen daño y expiran fuera de combate", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.hp=10;
  j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"1",turnos:2},"prueba");
  j.avanzarAflicciones(1);
  if (j.player.hp!==9) malas.push(`primer tick dejó hp ${j.player.hp}`);
  if (j.player.aflicciones[0]?.duracion!==1) malas.push("duración no bajó a 1");
  j.avanzarAflicciones(1);
  if (j.player.hp!==8) malas.push(`segundo tick dejó hp ${j.player.hp}`);
  if (j.player.aflicciones.length) malas.push("no expiró tras dos acciones");
  return malas;
});

PRUEBAS.registrar("aflicciones v7: fuera de combate no rematan; en combate sí", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.hp=1;
  j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"3",turnos:2});
  j.avanzarAflicciones(1);
  if (j.player.hp!==1) malas.push(`fuera de combate debía quedar a 1, quedó ${j.player.hp}`);
  j.player.hp=1; j.player.aflicciones=[];
  j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"3",turnos:2});
  j.avanzarAflicciones(1,{combate:true});
  if (j.player.hp>0) malas.push(`en combate debía ser letal, quedó ${j.player.hp}`);
  return malas;
});

PRUEBAS.registrar("aflicciones v7: antídoto cura sólo jade grado I y no se desperdicia", () => {
  const j=PRUEBAS.banco(), malas=[];
  j.player.inventario.push("antidoto_jade");
  j.aplicarAfliccion({tipo:"veneno",familia:"marea",grado:2,nombre:"Ahogo de Marea II",daño:"1",turnos:2});
  let [msgs, usado]=j.beber(["antidoto","jade"]);
  if (usado) malas.push("consumió antídoto incompatible");
  if (!j.player.inventario.includes("antidoto_jade")) malas.push("perdió antídoto incompatible");
  j.player.aflicciones=[];
  j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"1",turnos:2});
  [msgs, usado]=j.beber(["antidoto","jade"]);
  if (!usado) malas.push("no usó antídoto compatible");
  if (j.player.aflicciones.length) malas.push("veneno jade I no fue curado");
  return malas;
});

PRUEBAS.registrar("aflicciones v7: bálsamo cura ceniza I pero no otros grados", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.inventario.push("balsamo_ceniza");
  j.aplicarAfliccion({tipo:"quemadura",familia:"ceniza",grado:2,nombre:"Quemadura de Ceniza II",daño:"1",turnos:2});
  let [,usado]=j.beber(["balsamo","ceniza"]);
  if (usado) malas.push("bálsamo menor curó ceniza II");
  j.player.aflicciones=[];
  j.aplicarAfliccion({tipo:"quemadura",familia:"ceniza",grado:1,nombre:"Quemadura de Ceniza I",daño:"1",turnos:2});
  [,usado]=j.beber(["balsamo","ceniza"]);
  if (!usado || j.player.aflicciones.length) malas.push("bálsamo no curó ceniza I");
  return malas;
});

PRUEBAS.registrar("aflicciones v7: guardado y carga conservan familia grado y duración", () => {
  const j=PRUEBAS.banco(), malas=[];
  j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"1d2",turnos:3},"avispa_jade");
  const copia=PRUEBAS.banco(); copia.deserializar(JSON.parse(JSON.stringify(j.serializar())));
  const a=copia.player.aflicciones?.[0];
  if (!a) malas.push("aflicción desapareció al cargar");
  else if (a.familia!=="jade" || a.grado!==1 || a.duracion!==3 || a.daño!=="1d2") malas.push(`aflicción se restauró mal: ${JSON.stringify(a)}`);
  return malas;
});

PRUEBAS.registrar("aflicciones v7: caminar avanza el estado pero consultar inventario no", () => {
  const j=PRUEBAS.banco({pos:"camino"}), malas=[];
  j.player.aflicciones=[]; j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"1",turnos:3});
  const d0=j.player.aflicciones[0].duracion;
  j.ejecutar("inventario",[]);
  if (j.player.aflicciones[0]?.duracion!==d0) malas.push("INVENTARIO avanzó la aflicción");
  const dir=Object.keys(j.rooms[j.pos].exits||{})[0];
  j.cmd_ir(dir);
  if (j.player.aflicciones[0]?.duracion!==d0-1) malas.push("caminar no avanzó la aflicción");
  return malas;
});

PRUEBAS.registrar("aflicciones v7: una técnica enemiga deja estado persistente fuera de Combate", () => {
  const j=PRUEBAS.banco(), malas=[]; j.player.hp=j.player.max_hp=200; j.player.defensa=-50;
  const mob=crearMob("serpiente_qi", MOBS.serpiente_qi); mob.ataque=100; mob.tecnica={...mob.tecnica,cada:1};
  const c=new Combate(j,mob,"serpiente_qi"); j.combate=c;
  c.turno("defender",[]);
  const af=j.player.aflicciones.find(a=>a.tipo==="veneno"&&a.familia==="jade");
  if(!af) malas.push("la técnica no dejó Veneno de Jade persistente");
  j.combate=null;
  if(!j.player.aflicciones.some(a=>a.familia==="jade")) malas.push("el estado desapareció al terminar Combate");
  return malas;
});

PRUEBAS.registrar("aflicciones v7: oficios y alquimia consumen tiempo de aflicción", () => {
  const malas=[];
  // Examen: una intervención real consume 1 acción de la aflicción.
  {
    const j=PRUEBAS.banco(); j.player.profesiones.examen.desbloqueada=true; j.normalizarProfesiones();
    j.registrarCadaver(crearMob("rata_qi",MOBS.rata_qi)); const cad=j.cadaveresEnSala()[0];
    j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"0",turnos:3});
    Azar.sembrar(1); const metodo=HALLAZGOS_CADAVER[cad.mob_id].hallazgos[0].id; j.recolectarCadaver(0,metodo); Azar.libre();
    if(j.player.aflicciones[0]?.duracion!==2) malas.push("Examen no consumió 1 acción de aflicción");
  }
  // Herboristería: una cosecha real consume 1.
  {
    const nodo=Object.values(NODOS_HERBORISTERIA)[0]; const j=PRUEBAS.banco({pos:nodo.sala});
    j.player.profesiones.herboristeria.desbloqueada=true; j.normalizarProfesiones();
    j.recolectarPlanta(0,"examinar"); j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"0",turnos:3});
    Azar.sembrar(1); j.recolectarPlanta(0,PLANTAS_ESPIRITUALES[nodo.especie].procedimientos[0].id); Azar.libre();
    if(j.player.aflicciones[0]?.duracion!==2) malas.push("Herboristería no consumió 1 acción de aflicción");
  }
  // Alquimia: la elaboración completa consume 2.
  {
    const j=PRUEBAS.banco({pos:"cocina_comunal"}); j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones();
    j.player.inventario.push("raiz_sangre","hierba_claridad");
    j.aplicarAfliccion({tipo:"veneno",familia:"jade",grado:1,nombre:"Veneno de Jade I",daño:"0",turnos:4});
    j.elaboracion={rid:"sangre",elecciones:[2,2,2]}; j.resolverElaboracion();
    if(j.player.aflicciones[0]?.duracion!==2) malas.push("Alquimia no consumió 2 acciones de aflicción");
  }
  return malas;
});


// ---------- Etapa 7 · balance integral ----------
PRUEBAS.registrar("balance v8: botín automático no suplanta materiales profesionales", () => {
  const malas=[];
  const profesionales=new Set();
  for(const planta of Object.values(PLANTAS_ESPIRITUALES)) for(const p of planta.procedimientos) profesionales.add(p.item);
  for(const especie of Object.values(HALLAZGOS_CADAVER)) for(const h of especie.hallazgos) profesionales.add(h.item);
  for(const [mobId,mob] of Object.entries(MOBS)) for(const drop of (mob.loot||[]))
    if(profesionales.has(drop.item)) malas.push(`${mobId} entrega automáticamente ${drop.item}`);
  return malas;
});

PRUEBAS.registrar("balance v8: toda receta tiene una fuente real para cada ingrediente", () => {
  const malas=[], fuentes=new Set();
  for(const planta of Object.values(PLANTAS_ESPIRITUALES)) for(const p of planta.procedimientos) fuentes.add(p.item);
  for(const especie of Object.values(HALLAZGOS_CADAVER)) for(const h of especie.hallazgos) fuentes.add(h.item);
  for(const room of Object.values(ROOMS)) for(const item of (room.items||[])) fuentes.add(item);
  for(const mob of Object.values(MOBS)) for(const drop of (mob.loot||[])) fuentes.add(drop.item);
  for(const fac of Object.values(FACCIONES)) for(const serv of Object.values(fac.servicios||{})) if(serv.item) fuentes.add(serv.item);
  for(const [rid,rec] of Object.entries(RECETAS)) for(const item of Object.keys(rec.ingredientes||{}))
    if(!fuentes.has(item)) malas.push(`${rid}: ${item} no tiene fuente en el mundo`);
  return malas;
});

PRUEBAS.registrar("balance v8: segunda elaboración válida usa el tramo 75%", () => {
  const j=PRUEBAS.banco(), malas=[];
  j.player.profesiones.alquimia.desbloqueada=true; j.normalizarProfesiones();
  const st=j.estadoRecetaAlquimia("antidoto"); st.validas=1;
  st.hitos={valida:true,estable:true,superior:true,excepcional:true};
  const info=j.xpAlquimiaPorResultado("antidoto","impura");
  const esperado=XP_BASE_DIFICULTAD.alquimia.normal*.75;
  if(Math.abs(info.xp-esperado)>1e-9) malas.push(`segunda válida: ${info.xp} XP, esperaba ${esperado}`);
  return malas;
});

PRUEBAS.registrar("balance v8: bonos de descubrimiento no regalan Novicio", () => {
  const malas=[];
  if(BONO_PRIMERA_ESPECIE_EXAMEN!==2 || BONO_PRIMER_PROCEDIMIENTO_EXAMEN!==1) malas.push("Examen no usa bonos 2/1");
  if(BONO_PRIMERA_ESPECIE_HERBORISTERIA!==2 || BONO_PRIMER_PROCEDIMIENTO_HERBORISTERIA!==1) malas.push("Herboristería no usa bonos 2/1");
  return malas;
});

PRUEBAS.registrar("balance v8: rocío de niebla es un medio normal y la flor completa sigue siendo difícil", () => {
  const malas=[], ps=PLANTAS_ESPIRITUALES.niebla?.procedimientos||[];
  const rocio=ps.find(p=>p.id==="rocio"), flor=ps.find(p=>p.id==="flor");
  if(rocio?.dificultad!=="normal") malas.push(`rocío=${rocio?.dificultad}`);
  if(flor?.dificultad!=="dificil") malas.push(`flor=${flor?.dificultad}`);
  return malas;
});

// ---------- Etapa 8 · integración narrativa y ayuda ----------
PRUEBAS.registrar("integración v9: AYUDA contiene aflicciones persistentes y reglas esenciales", () => {
  const sec=buscarSeccionAyuda("aflicciones").seccion, malas=[];
  if(!sec) return ["AYUDA AFLICCIONES no existe"];
  const t=quitaAcentos(sec.texto||"").toLowerCase();
  for(const palabra of ["familia","grado","fuera de combate","no la consume","antidoto de jade","balsamo de ceniza"])
    if(!t.includes(quitaAcentos(palabra))) malas.push(`falta regla: ${palabra}`);
  return malas;
});

PRUEBAS.registrar("integración v9: la primera aflicción enseña dónde releer la regla una sola vez", () => {
  const j=PRUEBAS.banco(), malas=[];
  const a=j.pistaPrimeraAfliccion(), b=j.pistaPrimeraAfliccion();
  if(!a || !quitaAcentos(a).toLowerCase().includes("ayuda aflicciones")) malas.push("primer aviso no remite a AYUDA AFLICCIONES");
  if(b!==null) malas.push("el aviso de primera aflicción se repitió");
  return malas;
});





function afirmar(condicion, mensaje) { if (!condicion) throw new Error(mensaje); }

PRUEBAS.registrar("mapa v35: las capas macro preservan descensos locales y entre hojas", () => {
return conAtlasPrueba329(()=>{afirmar(capaMapaDeSala("formaciones_sello_antiguo")!==capaMapaDeSala("formaciones_descenso_tecnico"),"No separó primer nivel");afirmar(capaMapaDeSala("ala_vestibulo")===capaMapaDeSala("formaciones_descenso_tecnico"),"Fragmentó descenso dentro de profundo");});
});

PRUEBAS.registrar("mapa v35: toda sala pertenece a una sección válida", () => {
  const malas = [];
  for (const rid of Object.keys(ROOMS)) {
    const capa = capaMapaDeSala(rid);
    if (!MAPA_CAPAS[capa]) malas.push(`${rid}: sección ${capa} inexistente`);
  }
  return malas;
});

PRUEBAS.registrar("mapa v43: la auditoría detecta líneas que atraviesan salas ajenas o se cruzan", () => {
const pos=JSON.parse(JSON.stringify(MAPA_POS));pos.mirador_niebla=[12,6];
afirmar(auditarCartografia329({pos}).fallos.some(x=>x.includes("encima")),"No detectó línea sobre sala ajena");
});

PRUEBAS.registrar("mapa v43: sólo se dibuja la sección actual; la flecha marca el puente y cruzarlo cambia de sección", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"formaciones_sello_antiguo",visitadas:["formaciones_sello_antiguo","formaciones_descenso_tecnico"]});j.gates.SECTA_INTERIOR=true;j.establecerGate("M12",true);j.abrirAtlas();afirmar(!!j.mapaSvg.querySelector('[data-map-target="formaciones_descenso_tecnico"]'),"Falta transición vertical");j.cmd_ir("abajo");afirmar(j.pos==="formaciones_descenso_tecnico"&&j.atlasCapaVista==="profundo","No sincronizó capa");});
});

PRUEBAS.registrar("atlas v60: el mapa se arrastra, se centra al abrir y CENTRAR lo devuelve", ()=>conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","sala_jade"]});j.abrirAtlas();j.atlasCamara={x:200,y:200};j.atlasCamaraManual=true;j.centrarCapaAtlas();afirmar(!j.atlasCamaraManual,"CENTRAR no restauró cámara");afirmar(j.pos==="registro","CENTRAR movió personaje");}));

PRUEBAS.registrar("mapa v35: las transiciones verticales conocidas se reflejan en ambos extremos", () => {
const j=ATLAS_2B.lab({pos:"formaciones_sello_antiguo",visitadas:["formaciones_sello_antiguo"]});j.atlas.salas.formaciones_sello_antiguo.salidas=[["abajo","formaciones_descenso_tecnico"]];const d=j.datosMapaAtlas();afirmar(d.transiciones.get("formaciones_descenso_tecnico").some(t=>t.destino==="formaciones_sello_antiguo"&&t.dir==="arriba"),"Falta retorno inferido");
});

// ---------- áreas y referencias del mundo (ver67 · Auditoría 2, Etapa 2A) ----------

const AREAS_CANONICAS = ["acceso", "secta_exterior", "medicina", "jardines", "produccion", "bosques",
  "cantera_vetas", "aguas_barrancos", "valle", "sauces", "secta_interior", "archivos", "formaciones",
  "alturas", "primera_ala", "mantenimiento", "nucleo"];

// Validación de las 17 áreas del mundo canónico de 329 salas.


PRUEBAS.registrar("areas v1: AREAS declara exactamente las 17 áreas canónicas, en orden", () => {
  const malas = [], ids = Object.keys(AREAS);
  if (ids.length !== 17) malas.push(`hay ${ids.length} áreas y deberían ser 17`);
  if (ids.join(",") !== AREAS_CANONICAS.join(",")) malas.push(`ids u orden distintos: ${ids.join(", ")}`);
  for (const [id, a] of Object.entries(AREAS)) {
    if (!a.nombre?.trim()) malas.push(`${id}: sin nombre`);
    if (!/^#[0-9a-f]{6}$/i.test(a.color || "")) malas.push(`${id}: color inválido`);
  }
  if (new Set(Object.values(AREAS).map(a => a.color.toLowerCase())).size !== ids.length) malas.push("hay colores repetidos");
  return malas;
});

PRUEBAS.registrar("areas v1: toda room declara un area existente y no existe el campo nivel", () => {
  const malas = [];
  for (const [rid, sala] of Object.entries(ROOMS)) {
    if (typeof sala.area !== "string" || !AREAS[sala.area]) malas.push(`${rid}: area inválida «${sala.area}»`);
    if ("nivel" in sala) malas.push(`${rid}: la capa vertical sale de MAPA_CAPA_SALA, no de un campo nivel`);
  }
  return malas;
});





PRUEBAS.registrar("areas v1: areaDeSala lee el área estática de ROOMS", () => {
  const malas = [];
  for (const rid of Object.keys(ROOMS)) if (areaDeSala(rid) !== ROOMS[rid].area) malas.push(`${rid}: areaDeSala no coincide con ROOMS`);
  if (areaDeSala("no_existe") !== null) malas.push("una room inexistente debe dar null");
  if (areaDeSala(undefined) !== null) malas.push("undefined debe dar null");
  return malas;
});

PRUEBAS.registrar("areas v1: ROOMS.exits conserva destinos en forma de string", () => {
  const malas = [];
  for (const [rid, sala] of Object.entries(ROOMS)) for (const [dir, destino] of Object.entries(sala.exits || {})) {
    if (typeof destino !== "string") malas.push(`${rid}.exits.${dir}: el destino no es un string`);
  }
  return malas;
});

PRUEBAS.registrar("areas v1: auditarAreas() no encuentra fallos y tolera áreas sin rooms", () => {
afirmar(!auditarAreas({exigirSalas:true}).length,"Auditor falla");const prev=ROOMS.mojon_regional.area;try{AREAS.prueba_vacia={nombre:"Prueba",color:"#abcdef"};afirmar(!auditarAreas().length,"Rechaza área vacía opcional");afirmar(auditarAreas({exigirSalas:true}).some(x=>x.includes("prueba_vacia")),"No detecta área vacía exigida");}finally{delete AREAS.prueba_vacia;}
});

PRUEBAS.registrar("areas v1: auditarAreas detecta room sin area, area inexistente, subzona y nivel incoherentes", () => {
  const malas = [], deberia = (fallos, texto, motivo) => { if (!fallos.some(f => f.includes(texto))) malas.push(`no detectó ${motivo}`); };
  const previo = { camino: ROOMS.camino.area, patio: ROOMS.patio.area };
  const colorAcceso = AREAS.acceso.color, nombreBosques = AREAS.bosques.nombre, colorBosques = AREAS.bosques.color;
  try {
    delete ROOMS.camino.area;
    deberia(auditarAreas(), "camino: no tiene area", "una room sin area");
    ROOMS.camino.area = previo.camino;
    ROOMS.patio.area = "no_existe";
    deberia(auditarAreas(), "patio: area «no_existe»", "un area inexistente");
    ROOMS.patio.area = previo.patio;
    ROOMS.puerta.subzona = "zona_x"; ROOMS.tablon_encargos.subzona = "zona_x";
    deberia(auditarAreas(), "la subzona «zona_x» aparece en las áreas", "una subzona repartida en dos áreas");
    delete ROOMS.puerta.subzona; delete ROOMS.tablon_encargos.subzona;
    ROOMS.bosque_paso_hundido.subzona = "Mal Formada";
    deberia(auditarAreas(), "bosque_paso_hundido: subzona inválida", "una subzona mal formada");
    delete ROOMS.bosque_paso_hundido.subzona;
    ROOMS.bosque_claro_raices.nivel = 1;
    deberia(auditarAreas(), "bosque_claro_raices: el campo «nivel»", "un campo nivel");
    delete ROOMS.bosque_claro_raices.nivel;
    AREAS.acceso.color = "rojo";
    deberia(auditarAreas(), "AREAS.acceso: color inválido", "un color inválido");
    AREAS.acceso.color = colorAcceso; AREAS.bosques.color = colorAcceso;
    deberia(auditarAreas(), "AREAS.bosques: comparte el color", "un color repetido");
    AREAS.bosques.color = colorBosques; AREAS.bosques.nombre = "";
    deberia(auditarAreas(), "AREAS.bosques: falta el nombre", "un nombre vacío");
    AREAS.bosques.nombre = nombreBosques;
    AREAS.superior = { nombre: "Choque", color: "#123456" };
    deberia(auditarAreas(), "AREAS.superior: el id coincide con una sección vertical", "un id de área que coincide con una capa");
    MAPA_POS.fantasma = [0, 0];
    deberia(auditarAreas(), "MAPA_POS.fantasma", "una entrada huérfana de MAPA_POS");
  } finally {
    ROOMS.camino.area = previo.camino; ROOMS.patio.area = previo.patio;
    for (const [rid, campo] of [["puerta", "subzona"], ["tablon_encargos", "subzona"], ["bosque_paso_hundido", "subzona"], ["bosque_claro_raices", "nivel"]]) delete ROOMS[rid][campo];
    AREAS.acceso.color = colorAcceso; AREAS.bosques.color = colorBosques; AREAS.bosques.nombre = nombreBosques;
    delete AREAS.superior; delete MAPA_POS.fantasma;
  }
  const despues = auditarAreas();
  if (despues.length) malas.push(`tras restaurar los datos persisten fallos: ${despues.join(" | ")}`);
  return malas;
});

PRUEBAS.registrar("areas v1: clasificarSalidaAtlas separa interna / area / vertical / vertical_area sin tocar exits", () => {
const antes=JSON.stringify(ROOMS);const cuenta={interna:0,area:0,vertical:0,vertical_area:0};let externa=0;for(const [id,r]of Object.entries(ROOMS))for(const [dir,to]of Object.entries(r.exits)){if(esSalidaRegional(id,dir,to)){externa++;continue;}const tipo=clasificarSalidaAtlas(id,dir,to);afirmar(tipo in cuenta,"Salida física sin clasificación");cuenta[tipo]++;}afirmar(Object.values(cuenta).reduce((a,b)=>a+b,externa)===787,"Total de exits incorrecto");afirmar(JSON.stringify(ROOMS)===antes,"Atlas mutó exits");
});

PRUEBAS.registrar("areas v1: clasificarSalidaAtlas rechaza salidas inválidas y reconoce cada tipo aunque cambie el reparto", () => {
afirmar(clasificarSalidaAtlas("registro","norte","sala_jade")==="area","Enlace entre áreas");afirmar(clasificarSalidaAtlas("patio_raices","norte","descansillo")==="interna","Enlace interno");afirmar(clasificarSalidaAtlas("formaciones_sello_antiguo","abajo","formaciones_descenso_tecnico")==="vertical","Vertical interna");afirmar(clasificarSalidaAtlas("formaciones_descenso_tecnico","abajo","ala_vestibulo")==="vertical_area","Vertical entre áreas");afirmar(clasificarSalidaAtlas("puerta","norte","patio")===null,"Aceptó enlace retirado");
});

PRUEBAS.registrar("areas v1: serializar() no incorpora estado de áreas ni copia el área en los snapshots", () => {
  const malas = [], j = PRUEBAS.banco({ pos: "patio" });
  const s = j.serializar();
  const esperadas = ["saveSchemaVersion", "gates", "player", "pos", "flags", "quests", "salas", "visitadas", "atlas", "saturacion", "turnoGlobal",
    "relojEcologico", "respawnEn", "interrupcionEn", "errantes", "cadaveres", "objetosTirados", "fecha", "npc_version", "posicionNPC", "conocimientoNPC"];
  const claves = Object.keys(s);
  for (const k of claves) if (!esperadas.includes(k)) malas.push(`serializar() ganó la clave «${k}»`);
  for (const k of esperadas) if (!claves.includes(k)) malas.push(`serializar() perdió la clave «${k}»`);
  const prohibida = /^(area|subzona|atlasAreaVista|atlasAcordeones)$/;
  const recorrer = (obj, ruta) => {
    if (!obj || typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj)) { if (prohibida.test(k)) malas.push(`${ruta}.${k}: estado de áreas dentro de un guardado`); recorrer(v, `${ruta}.${k}`); }
  };
  recorrer(s.salas, "salas"); recorrer(s.atlas, "atlas");
  for (const [rid, snap] of Object.entries(s.salas)) for (const k of Object.keys(snap)) if (!["items", "oculto"].includes(k)) malas.push(`salas.${rid}.${k}: el snapshot sólo guarda items y oculto`);
  if (j.rooms.patio.area !== "secta_exterior") malas.push("la copia de trabajo de ROOMS debería conservar el área estática");
  return malas;
});

PRUEBAS.registrar("referencias mundo v1: auditarReferenciasMundo() no encuentra referencias rotas", () => {
  return auditarReferenciasMundo().map(f => `auditarReferenciasMundo: ${f}`);
});

PRUEBAS.registrar("referencias mundo v1: detecta errantes, nodos de herboristería y salas de misión rotos", () => {
const e=ERRANTES_INICIALES[0],n=NODOS_HERBORISTERIA.claridad_bambu_1,antes=e.sala,prev=n.sala;try{e.sala="inexistente";n.sala="inexistente";SALAS_MISIONES_ATLAS.prueba=["inexistente"];const f=auditarReferenciasMundo();afirmar(f.some(x=>x.includes("ERRANTES"))&&f.some(x=>x.includes("NODOS"))&&f.some(x=>x.includes("SALAS_MISIONES")),"No detectó referencias negativas");}finally{e.sala=antes;n.sala=prev;delete SALAS_MISIONES_ATLAS.prueba;}
});

PRUEBAS.registrar("referencias mundo v1: la conectividad de territorios de errantes es una comprobación opcional", () => {
const e=ERRANTES_INICIALES[0],prev={...e};try{e.territorio=["patio_raices","mojon_regional"];e.sala=e.origen="patio_raices";afirmar(!auditarReferenciasMundo().length,"Conectividad debería ser opcional");afirmar(auditarReferenciasMundo({conectividad:true}).length>0,"No detectó territorio desconectado");}finally{Object.assign(e,prev);}
});





PRUEBAS.registrar("areas v1: GB exporta AREAS y los auditores nuevos", () => {
  const malas = [];
  if (GB.DATOS.AREAS !== AREAS) malas.push("GB.DATOS.AREAS no expone AREAS");
  if (GB.DATOS.SALAS_MISIONES_ATLAS !== SALAS_MISIONES_ATLAS) malas.push("GB.DATOS.SALAS_MISIONES_ATLAS no expone la constante");
  for (const nombre of ["areaDeSala", "clasificarSalidaAtlas", "areasSinSalas", "auditarAreas", "auditarReferenciasMundo"]) {
    if (typeof GB[nombre] !== "function") malas.push(`GB.${nombre} no es una función`);
  }
  return malas;
});

// ---------- Atlas por áreas (ver68 · Etapa 2B) ----------

const ATLAS_2B = {
  // Juego de laboratorio con el render REAL del Atlas. Registra a mano las rooms visitadas.
  lab({ pos = "patio", visitadas = [] } = {}) {
    const j = PRUEBAS.banco({ pos });
    delete j.renderAtlas; delete j.recordarAtlas;
    j.visitadas = new Set(visitadas);
    j.turnoGlobal = 10;
    for (const rid of visitadas) { j.turnoGlobal++; j.pos = rid; j.recordarAtlas(); }
    j.pos = pos;
    j.reiniciarVistaAtlas();
    return j;
  },
  nodos: () => [...document.querySelectorAll("#mapaSvg .mapa-nodo")].map(e => e.dataset.room),
  marca: (dir, destino) => document.querySelector(`#mapaSvg .mapa-transicion[data-dir="${dir}"][data-map-target="${destino}"]`),
  clic: el => el.dispatchEvent(new Event("click", { bubbles: true })),
  cabeceras: () => [...document.querySelectorAll("#atlasLista .atlas-area-cab")],
  entradas: (area = null) => [...document.querySelectorAll(area ? `#atlasLista .atlas-area-cuerpo[aria-label="${AREAS[area].nombre}"] .atlas-entrada` : "#atlasLista .atlas-entrada")],
  limpiarBusqueda: () => { document.getElementById("atlasBusqueda").value = ""; },
};

PRUEBAS.registrar("atlas 2B: abrir el Atlas parte del área, la capa y la sala físicas del jugador", () => {
  const malas = [], j = ATLAS_2B.lab({ pos: "bosque_claro_raices", visitadas: ["camino", "patio", "bosque_claro_raices", "aguas_poza_clara"] });
  j.atlasAreaVista = "acceso"; j.atlasCapaVista = "superior"; j.atlasSeleccion = "camino"; j.atlasPestana = "personas";
  j.reiniciarVistaAtlas();
  if (j.atlasAreaVista !== "bosques") malas.push(`área vista ${j.atlasAreaVista}, esperaba bosques`);
  if (j.atlasCapaVista !== "principal") malas.push(`capa vista ${j.atlasCapaVista}, esperaba principal`);
  if (j.atlasSeleccion !== "bosque_claro_raices") malas.push("la selección inicial no es la sala física");
  if (j.atlasPestana !== "mapa") malas.push("abrir el Atlas no vuelve a la pestaña MAPA");
  for (const clave of ["lugares", "personas", "bestiario"]) {
    const abiertos = [...j.atlasAcordeones[clave]];
    if (abiertos.join() !== "bosques") malas.push(`acordeones ${clave} abiertos al iniciar: ${abiertos.join() || "ninguno"}; esperaba sólo bosques`);
  }
  if (!Juego.prototype.abrirAtlas.toString().includes("reiniciarVistaAtlas")) malas.push("abrirAtlas no usa reiniciarVistaAtlas");
  j.renderAtlas();
  const migas = document.getElementById("atlasMigas").textContent;
  if (!migas.includes("Grulla Blanca") || !migas.includes("Bosques")) malas.push(`las migas no muestran la jerarquía: «${migas}»`);
  if (!document.getElementById("atlasNivelNombre").textContent.includes(MAPA_CAPAS.principal.nombre)) malas.push("la barra no indica la capa vertical");
  if (!document.getElementById("atlasCentrar").hidden) malas.push("MI ZONA no debería verse al abrir en tu propia zona");
  return malas;
});

PRUEBAS.registrar("atlas 2B: el selector sólo lista áreas conocidas y se oculta con una sola", () => {
  const malas = [], sel = () => document.getElementById("atlasArea");
  let j = ATLAS_2B.lab({ pos: "puerta", visitadas: ["camino", "puerta"] });
  j.renderAtlas();
  if (!sel().hidden) malas.push("con una sola área conocida el selector debe estar oculto");
  if ([...sel().options].map(o => o.value).join() !== "acceso") malas.push("el selector debería ofrecer sólo acceso");
  j = ATLAS_2B.lab({ pos: "puerta", visitadas: ["camino", "puerta", "bosque_claro_raices", "patio"] });
  j.renderAtlas();
  if (sel().hidden) malas.push("con varias áreas conocidas el selector debe verse");
  const valores = [...sel().options].map(o => o.value).join();
  if (valores !== "acceso,secta_exterior,bosques") malas.push(`áreas del selector: ${valores}; esperaba acceso,secta_exterior,bosques (orden canónico)`);
  for (const o of sel().options) if (!o.textContent.startsWith(AREAS[o.value].nombre)) malas.push(`la opción ${o.value} no usa AREAS[id].nombre`);
  if (!Object.values(j.areasConocidas()).length || j.areasConocidas().includes("medicina")) malas.push("areasConocidas incluye un área sin rooms visitadas");
  return malas;
});

PRUEBAS.registrar("atlas 2B: navegar el Atlas a otra área no mueve al jugador", () => {
  const malas = [], j = ATLAS_2B.lab({ pos: "puerta", visitadas: ["camino", "puerta", "patio", "tablon_encargos"] });
  j.renderAtlas();
  if (!j.elegirAreaAtlas("secta_exterior")) malas.push("no permitió consultar un área conocida");
  if (j.pos !== "puerta") malas.push(`consultar el Atlas movió al jugador a ${j.pos}`);
  if (j.atlasAreaVista !== "secta_exterior") malas.push("no cambió atlasAreaVista");
  if (ATLAS_2B.nodos().some(r => areaDeSala(r) !== "secta_exterior")) malas.push("el mapa mezcla rooms de otra área");
  if (document.getElementById("atlasCentrar").hidden) malas.push("MI ZONA debería verse al consultar otra área");
  if (!document.getElementById("atlasNivelEstado").textContent.includes("no lo mueve")) malas.push("la barra no aclara que consultar no mueve al personaje");
  j.cambiarVistaAtlas({ area: "acceso", capa: "principal", seleccion: "camino" });
  if (j.pos !== "puerta") malas.push("cambiarVistaAtlas movió al jugador");
  return malas;
});

PRUEBAS.registrar("atlas 2B: un área desconocida no revela su nombre ni se puede consultar", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro"]});j.abrirAtlas();const t=j.mapaSvg.querySelector('[data-map-target="sala_jade"]');afirmar(t&&t.getAttribute("aria-disabled")==="true","No protegió área desconocida");afirmar(!t.textContent.includes(AREAS.secta_exterior.nombre),"Reveló nombre de área");j.elegirAreaAtlas("secta_exterior");afirmar(j.atlasAreaVista==="acceso","Consultó área desconocida");});
});

PRUEBAS.registrar("atlas 2B: una transición hacia un área conocida cambia atlasAreaVista y no la posición", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","sala_jade"]});j.abrirAtlas();const t=j.mapaSvg.querySelector('[data-map-target="sala_jade"]');afirmar(!!t,"Falta transición");t.dispatchEvent(new Event("click",{bubbles:true}));afirmar(j.atlasAreaVista==="secta_exterior"&&j.pos==="registro","Navegación: " + j.atlasAreaVista + " / " + j.pos);});
});

PRUEBAS.registrar("atlas 2B: la transición hacia un área desconocida por vía vertical tampoco revela nada", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"formaciones_descenso_tecnico",visitadas:["formaciones_descenso_tecnico"]});j.abrirAtlas();const t=j.mapaSvg.querySelector('[data-map-target="ala_vestibulo"]');afirmar(t?.getAttribute("aria-disabled")==="true","Vertical desconocida consultable");afirmar(!t.textContent.includes(AREAS.primera_ala.nombre),"Nombre revelado");});
});

PRUEBAS.registrar("atlas 2B: el filtro área+capa no mezcla rooms de otra área ni de otra capa", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"registro",visitadas:Object.keys(ROOMS)});j.abrirAtlas();for(const area of Object.keys(AREAS))for(const capa of Object.keys(MAPA_CAPAS)){if(!j.hojaAtlasNavegable(area,capa))continue;j.atlasAreaVista=area;j.atlasCapaVista=capa;j.renderAtlas();for(const el of j.mapaSvg.querySelectorAll('[data-room]'))afirmar(areaDeSala(el.dataset.room)===area&&capaMapaDeSala(el.dataset.room)===capa,"Filtro mezcló salas");}});
});

PRUEBAS.registrar("atlas 2B: MI ZONA restaura área, capa y sala físicas", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","sala_jade","formaciones_descenso_tecnico"]});j.abrirAtlas();j.cambiarVistaAtlas({area:"formaciones",capa:"profundo",seleccion:"formaciones_descenso_tecnico"});afirmar(!document.getElementById("atlasCentrar").hidden,"MI ZONA no aparece");j.centrarCapaAtlas();afirmar(j.atlasAreaVista==="acceso"&&j.atlasSeleccion==="registro"&&j.pos==="registro","MI ZONA incorrecta");});
});

PRUEBAS.registrar("atlas 2B: cmd_ir sincroniza la vista del Atlas con el área y la capa del destino", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro"]});j.cmd_ir("norte");afirmar(j.pos==="sala_jade"&&j.atlasAreaVista==="secta_exterior","No sincronizó área física");j.pos="formaciones_sello_antiguo";j.gates.SECTA_INTERIOR=true;j.establecerGate("M12",true);j.cmd_ir("abajo");afirmar(j.atlasCapaVista==="profundo","No sincronizó capa física");});
});

PRUEBAS.registrar("atlas 2B: LUGARES se agrupa por area y sólo muestra lo descubierto", () => {
  const malas = [], visitadas = ["camino", "puerta", "patio", "tablon_encargos", "bosque_claro_raices"];
  const j = ATLAS_2B.lab({ pos: "puerta", visitadas });
  j.atlasPestana = "lugares"; j.renderAtlas();
  const cabs = ATLAS_2B.cabeceras();
  if (cabs.map(c => c.dataset.area).join() !== "acceso,secta_exterior,bosques") malas.push(`grupos: ${cabs.map(c => c.dataset.area).join()}`);
  for (const c of cabs) {
    if (c.style.getPropertyValue("--area") !== AREAS[c.dataset.area].color) malas.push(`la cabecera ${c.dataset.area} no usa el color de AREAS`);
    for (const e of ATLAS_2B.entradas(c.dataset.area)) if (ROOMS[e.dataset.id].area !== c.dataset.area) malas.push(`${e.dataset.id} aparece bajo ${c.dataset.area}`);
  }
  if (ATLAS_2B.entradas().length !== visitadas.length) malas.push(`hay ${ATLAS_2B.entradas().length} entradas y ${visitadas.length} rooms visitadas`);
  const expandido = cabs.map(c => `${c.dataset.area}:${c.getAttribute("aria-expanded")}`).join();
  if (expandido !== "acceso:true,secta_exterior:false,bosques:false") malas.push(`estado inicial de los acordeones: ${expandido}`);
  const visibles = document.getElementById("atlasLista").textContent;
  for (const [id, area] of Object.entries(AREAS)) if (!["acceso", "secta_exterior", "bosques"].includes(id) && visibles.includes(area.nombre)) malas.push(`aparece el área no descubierta ${area.nombre}`);
  return malas;
});

PRUEBAS.registrar("atlas 2B: PERSONAS se agrupa por area sin duplicar el registro canónico", () => {
const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","patio"]});j.atlasPestana="personas";
const antes=JSON.stringify(j.atlas.personas);
afirmar(j.registrosAtlas().length===Object.keys(j.atlas.personas).length,"Duplicó personas observadas");
j.renderAtlas();afirmar(JSON.stringify(j.atlas.personas)===antes,"Render alteró avistamientos");
});

PRUEBAS.registrar("atlas 2B: BESTIARIO se agrupa por area sin duplicar el registro canónico", () => {
  const malas = [], mob = Object.keys(MOBS)[0];
  const j = ATLAS_2B.lab({ pos: "patio", visitadas: ["camino", "patio", "bosque_paso_hundido"] });
  j.atlas.criaturas[mob] = { sala: "bosque_paso_hundido", turno: 20, lugares: ["patio", "bosque_paso_hundido"], errante: false, examinada: false };
  j.atlas.salas.camino.mobs = [mob];      // otra fuente derivable: las criaturas anotadas por sala
  const antes = JSON.stringify(j.atlas.criaturas[mob]);
  j.atlasPestana = "bestiario"; j.atlasSeleccion = mob; j.atlasAcordeones.bestiario = new Set(["acceso", "secta_exterior", "bosques"]);
  j.renderAtlas();
  const copias = [...document.querySelectorAll(`#atlasLista .atlas-entrada[data-id="${mob}"]`)];
  if (copias.length !== 3) malas.push(`la criatura aparece ${copias.length} veces y debería aparecer bajo sus 3 áreas`);
  const registros = j.registrosAtlas().filter(r => r.id === mob);
  if (registros.length !== 1 || registros[0].areas.join() !== "acceso,secta_exterior,bosques") malas.push(`registro/áreas derivadas: ${registros.length} · ${registros[0]?.areas.join()}`);
  if (JSON.stringify(j.atlas.criaturas[mob]) !== antes) malas.push("consultar el Bestiario modificó el registro canónico");
  if (!document.getElementById("atlasDetalle").textContent.includes("ÁREAS DONDE LA VISTE")) malas.push("la ficha no lista las áreas");
  return malas;
});

PRUEBAS.registrar("atlas 2B: un registro sin área derivable va a un último grupo y nunca desaparece", () => {
const j=ATLAS_2B.lab();const reg={id:"prueba_sin_area",nombre:"Registro de prueba",areas:[]};const grupos=j.agruparRegistrosAtlas([reg]);afirmar(JSON.stringify(grupos).includes("prueba_sin_area"),"Perdió registro sin área");
});

PRUEBAS.registrar("atlas 2B: los acordeones son estado de interfaz y la búsqueda sigue siendo global", () => {
  const malas = [], j = ATLAS_2B.lab({ pos: "puerta", visitadas: ["camino", "puerta", "patio", "bosque_claro_raices"] });
  j.atlasPestana = "lugares"; j.renderAtlas();
  const cabecera = area => ATLAS_2B.cabeceras().find(c => c.dataset.area === area);
  if (cabecera("bosques").getAttribute("aria-expanded") !== "false") malas.push("bosques debería empezar cerrado");
  const guardado = JSON.stringify({ ...j.serializar(), fecha: 0 });
  ATLAS_2B.clic(cabecera("bosques"));
  if (cabecera("bosques").getAttribute("aria-expanded") !== "true") malas.push("pulsar la cabecera no abre el acordeón");
  ATLAS_2B.clic(cabecera("bosques"));
  if (cabecera("bosques").getAttribute("aria-expanded") !== "false") malas.push("pulsar de nuevo no lo cierra");
  const nombre = ROOMS.bosque_claro_raices.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  try {
    document.getElementById("atlasBusqueda").value = nombre; j.renderAtlas();
    const hallada = ATLAS_2B.entradas("bosques").find(e => e.dataset.id === "bosque_claro_raices");
    if (!hallada) malas.push("la búsqueda no encontró una room de un acordeón cerrado");
    else if (hallada.closest(".atlas-area-cuerpo").hidden) malas.push("la coincidencia no abrió su área");
    if (j.atlasAcordeones.lugares.has("bosques")) malas.push("buscar modificó el estado manual de los acordeones");
    const cabs = ATLAS_2B.cabeceras().map(c => c.dataset.area);
    if (cabs.some(a => a !== "bosques")) malas.push(`la búsqueda muestra áreas sin coincidencias: ${cabs.join()}`);
  } finally { ATLAS_2B.limpiarBusqueda(); }
  j.renderAtlas();
  if (cabecera("bosques").getAttribute("aria-expanded") !== "false") malas.push("al borrar la búsqueda el acordeón no recuperó su estado");
  const nombreArea = AREAS.bosques.nombre.toLowerCase();
  try {
    document.getElementById("atlasBusqueda").value = nombreArea; j.renderAtlas();
    if (ATLAS_2B.entradas().some(e => !norm2B(ROOMS[e.dataset.id].name).includes(norm2B(nombreArea)))) malas.push("la búsqueda coincide con el nombre del área (esta etapa sólo busca por nombre del registro)");
  } finally { ATLAS_2B.limpiarBusqueda(); }
  if (JSON.stringify({ ...j.serializar(), fecha: 0 }) !== guardado) malas.push("los acordeones alteraron lo que se guarda");
  return malas;
});
function norm2B(t) { return String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

PRUEBAS.registrar("atlas 2B: la capa inicial de un área elegida es la de su room visitada más reciente, con fallback determinista", () => {
return conAtlasPrueba329(()=>{const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","formaciones_sello_antiguo","formaciones_descenso_tecnico"]});j.atlas.salas.formaciones_sello_antiguo.turno=1;j.atlas.salas.formaciones_descenso_tecnico.turno=2;j.elegirAreaAtlas("formaciones");afirmar(j.atlasCapaVista==="profundo"&&j.atlasSeleccion==="formaciones_descenso_tecnico","No tomó sala reciente");});
});

PRUEBAS.registrar("atlas 2B: datosMapaAtlas clasifica aristas internas y transiciones sin tocar exits", () => {
const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","patio_raices","formaciones_sello_antiguo","formaciones_descenso_tecnico"]});const antes=JSON.stringify(ROOMS),d=j.datosMapaAtlas();afirmar(d.transiciones.get("registro").some(t=>t.destino==="sala_jade"&&t.tipo==="area"),"Sin transición de área");afirmar(d.transiciones.get("formaciones_descenso_tecnico").some(t=>t.destino==="ala_vestibulo"&&t.tipo==="vertical_area"),"Sin vertical de área");afirmar(d.aristas.some(([a,b])=>a==="patio_raices"&&b==="descansillo"),"Sin arista interna");afirmar(JSON.stringify(ROOMS)===antes,"Mutó grafo");
});

PRUEBAS.registrar("atlas 2B: la ficha ofrece saltos entre áreas sólo hacia áreas conocidas", () => {
const j=ATLAS_2B.lab({pos:"registro",visitadas:["registro","sala_jade"]});j.atlasPestana="mapa";j.atlasSeleccion="registro";j.detalleAtlas();afirmar(document.getElementById("atlasDetalle").textContent.includes(AREAS.secta_exterior.nombre),"No ofrece área conocida");j.visitadas.delete("sala_jade");j.detalleAtlas();afirmar(!document.getElementById("atlasDetalle").textContent.includes("Ver "+AREAS.secta_exterior.nombre),"Ofrece área desconocida");
});

PRUEBAS.registrar("atlas 2B: atlasAreaVista y atlasAcordeones son sólo interfaz y no entran en el guardado", () => {
  const malas = [], j = ATLAS_2B.lab({ pos: "puerta", visitadas: ["camino", "puerta", "patio", "bosque_claro_raices"] });
  const antes = JSON.stringify({ ...j.serializar(), fecha: 0 });
  j.elegirAreaAtlas("bosques"); j.alternarAcordeonAtlas("lugares", "acceso"); j.cambiarPestanaAtlas("Personas"); j.cambiarPestanaAtlas("Bestiario"); j.cambiarPestanaAtlas("Mapa");
  const s = j.serializar(), texto = JSON.stringify({ ...s, fecha: 0 });
  if (texto !== antes) malas.push("consultar el Atlas cambió lo que se guarda");
  for (const clave of ["atlasAreaVista", "atlasAcordeones", "atlasCapaVista"]) {
    if (texto.includes(`"${clave}"`)) malas.push(`«${clave}» aparece en el guardado`);
    if (Object.keys(s).includes(clave)) malas.push(`serializar() ganó la clave ${clave}`);
  }
  const claves = [];
  const recorrer = obj => { if (obj && typeof obj === "object") for (const [k, v] of Object.entries(obj)) { claves.push(k); recorrer(v); } };
  recorrer(s.salas); recorrer(s.atlas);
  if (claves.some(k => k === "area" || k === "subzona")) malas.push("ROOM.area/subzona se duplicó dentro del guardado");
  for (const snap of Object.values(s.salas)) if (Object.keys(snap).some(k => !["items", "oculto"].includes(k))) malas.push("un snapshot de sala guarda algo más que items y oculto");
  // Cargar reconstruye el Atlas desde ROOMS y la posición física.
  const k = PRUEBAS.banco({ pos: "camino" });
  k.deserializar(JSON.parse(JSON.stringify(s)));
  k.reiniciarVistaAtlas();
  if (k.atlasAreaVista !== areaDeSala(k.pos) || k.atlasCapaVista !== capaMapaDeSala(k.pos)) malas.push("al cargar, el Atlas no se reconstruye desde la posición física");
  if (k.registrosAtlas.call({ ...k, atlasPestana: "lugares", visitadas: k.visitadas, atlas: k.atlas, indiceAreasAtlas: k.indiceAreasAtlas.bind(k) }).length !== j.visitadas.size) malas.push("tras cargar, LUGARES no recupera las rooms visitadas");
  return malas;
});

PRUEBAS.registrar("atlas 2B: MAPA_CAPAS.principal se llama Superficie y conserva su id", () => {
afirmar(MAPA_CAPAS.principal.nombre==="Superficie","Cambió capa principal");afirmar(Object.keys(MAPA_CAPAS).length===5,"Cambió catálogo de capas");afirmar(Object.keys(MAPA_POS).length===329,"Falta cartografía congelada");
});

PRUEBAS.registrar("atlas 2B: los auditores de topología, áreas y referencias siguen limpios", () => {
  return [...auditarTopologiaMapa().map(f => `topología: ${f}`), ...auditarAreas().map(f => `áreas: ${f}`), ...auditarReferenciasMundo().map(f => `referencias: ${f}`)];
});

PRUEBAS.registrar("atlas 2B: la lista compartida de salas ocultas conserva el comportamiento de salidasAtlas y actualizarPanel", () => {
const j=ATLAS_2B.lab({pos:"camino",visitadas:[]});for(const sentido of [false,true]){j.tieneSentido=()=>sentido;for(const id of Object.keys(ROOMS)){const esperadas=Object.entries(ROOMS[id].exits).filter(([,to])=>ROOMS[to]&&(!ROOMS[to].oculta||(sentido&&SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO.includes(to))));afirmar(JSON.stringify(j.salidasAtlas(id))===JSON.stringify(esperadas),"Salidas ocultas incorrectas: "+id);}}
});

PRUEBAS.registrar("atlas 2B: el título de la sala y el minimapa llevan la identidad del área", () => {
  const malas = [], el = document.createElement("div");
  aplicarAreaUI(el, "bosques");
  if (el.dataset.area !== "bosques" || el.style.getPropertyValue("--area") !== AREAS.bosques.color) malas.push("aplicarAreaUI no estampa data-area y --area");
  aplicarAreaUI(el, "no_existe");
  if (el.dataset.area || el.style.getPropertyValue("--area")) malas.push("aplicarAreaUI no limpia con un área inexistente");
  const j = PRUEBAS.banco({ pos: "bosque_claro_raices" });
  delete j.addLine; delete j.mostrarSala; delete j.actualizarMinimapa;
  const cont = j.contenido, marca = cont.lastChild, mini = j.mapaSalaEl;
  const guardado = { html: mini.innerHTML, area: mini.dataset.area, css: mini.style.cssText };
  try {
    j.mostrarSala();
    const titulos = [...cont.querySelectorAll(".titulo")], titulo = titulos[titulos.length - 1];
    if (!titulo || titulo.dataset.area !== "bosques" || titulo.style.getPropertyValue("--area") !== AREAS.bosques.color) malas.push("el título de la sala no lleva el color de su área");
    j.pos = "aguas_poza_clara"; j.mostrarSala();
    const nuevos = [...cont.querySelectorAll(".titulo")];
    if (nuevos[nuevos.length - 2]?.dataset.area !== "bosques") malas.push("un título anterior cambió al viajar a otra área");
    if (nuevos[nuevos.length - 1]?.dataset.area !== "aguas_barrancos") malas.push("el título nuevo no lleva su propia área");
    j.actualizarMinimapa();
    if (mini.dataset.area !== "aguas_barrancos" || !mini.querySelector(".mapa-sala-area")?.textContent.includes(AREAS.aguas_barrancos.nombre)) malas.push("el minimapa no muestra el área actual");
  } finally {
    while (cont.lastChild !== marca) cont.removeChild(cont.lastChild);
    mini.innerHTML = guardado.html; mini.style.cssText = guardado.css;
    if (guardado.area) mini.dataset.area = guardado.area; else delete mini.dataset.area;
  }
  const cuerpo = Juego.prototype.mostrarSala.toString();
  if ((cuerpo.match(/aplicarAreaUI\(/g) || []).length !== 1) malas.push("mostrarSala sólo debe estampar el área en el título, no en las líneas semánticas");
  return malas;
});

PRUEBAS.registrar("atlas 2B: los colores de área son legibles sobre el mapa y no sustituyen colores semánticos", () => {
  const malas = [];
  const lum = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for (const [id, area] of Object.entries(AREAS)) {
    if (contraste(area.color, "#0b100d") < 4.5) malas.push(`${id}: contraste ${contraste(area.color, "#0b100d").toFixed(2)} contra el fondo del mapa (mín. 4.5)`);
    if (contraste(area.color, "#263f2f") < 3) malas.push(`${id}: contraste ${contraste(area.color, "#263f2f").toFixed(2)} contra el disco de un nodo (mín. 3)`);
  }
  // Estilo CALCULADO sobre nodos de prueba dentro del <svg> real: el trazo de un nodo explorado
  // sigue a --area, mientras que el nodo actual (oro), el sin explorar y el anillo de selección
  // conservan sus colores propios (estos son semánticos).
  const svg = document.getElementById("mapaSvg"), previa = svg.style.getPropertyValue("--area");
  const sonda = clase => {
    const g = elSVG("g", { class: `mapa-nodo ${clase}` }), c = elSVG("circle", { class: "mapa-disco" });
    g.appendChild(c); svg.appendChild(g); return { g, c, estilo: getComputedStyle(c) };
  };
  const sondas = [];
  try {
    svg.style.setProperty("--area", "#123456");
    const explorado = sonda(""), actual = sonda("actual"), oculto = sonda("sin-explorar");
    sondas.push(explorado.g, actual.g, oculto.g);
    if (explorado.estilo.stroke !== "rgb(18, 52, 86)" && !(explorado.estilo.stroke === "var(--area, #a7c9a9)" && svg.style.getPropertyValue("--area") === "#123456")) malas.push(`el trazo de un nodo explorado es ${explorado.estilo.stroke}, no el color de --area`);
    if (actual.estilo.stroke !== "rgb(243, 216, 148)" || actual.estilo.fill !== "rgb(213, 173, 99)") malas.push("el nodo actual perdió su color oro");
    if (oculto.estilo.stroke !== "rgb(138, 145, 132)") malas.push("el nodo sin explorar perdió su trazo gris");
    const anillo = elSVG("circle", { class: "mapa-seleccion" }); svg.appendChild(anillo); sondas.push(anillo);
    if (getComputedStyle(anillo).stroke !== "rgb(231, 199, 130)") malas.push("el anillo de selección perdió su color oro");
    svg.style.removeProperty("--area");
    if (!["rgb(167, 201, 169)", "var(--area, #a7c9a9)"].includes(sonda("").estilo.stroke)) malas.push("sin --area el nodo debe conservar su trazo de siempre");
  } finally {
    for (const g of [...svg.querySelectorAll(".mapa-nodo")].filter(n => !n.dataset.room)) g.remove();
    for (const el of sondas) el.remove();
    if (previa) svg.style.setProperty("--area", previa);
  }
  return malas;
});

PRUEBAS.registrar("nombres v34: personaje valida en consola sin truncar la entrada nueva", () => {
  const malas = [];
  const limpio = limpiarNombrePersonaje("  Lúcio-99 del Río!!!  ");
  if (limpio !== "Lúcio del Río") malas.push(`la normalización dejó "${limpio}"`);
  const largo = limpiarNombrePersonaje("Abcdefghijklmnopqrstuvwxyz");
  if (Array.from(largo).length !== MAX_NOMBRE_PERSONAJE) malas.push(`la normalización quedó en ${Array.from(largo).length} caracteres`);
  if (nombrePersonajeValido("Lucas2")) malas.push("aceptó números en un nombre de personaje");
  if (nombrePersonajeValido("Lucas!")) malas.push("aceptó signos en un nombre de personaje");
  if (!nombrePersonajeValido("Lúcio Río")) malas.push("rechazó letras Unicode y espacios válidos");
  const exceso = errorNombrePersonaje("123456789012345678901");
  if (!/más de 20 caracteres/i.test(exceso)) malas.push(`el exceso no devuelve el aviso específico: ${exceso}`);
  const cuerpo = Juego.prototype.pedirNombrePersonaje.toString();
  if (cuerpo.includes("maxLength") || cuerpo.includes("soloLetras")) malas.push("la barra de comandos sigue recibiendo límites o filtro visual");
  return malas;
});

PRUEBAS.registrar("nombres v34: build admite caracteres y números, avisa al superar 15", () => {
  const j = PRUEBAS.banco(), malas = [];
  const nombre = j.limpiarNombreBuild("Build #12 / PvE ++ muy largo");
  if (nombre !== "Build #12 / PvE") malas.push(`la normalización dejó "${nombre}"`);
  if (Array.from(nombre).length > MAX_NOMBRE_BUILD) malas.push("la normalización de build superó 15 caracteres");
  const exceso = j.errorNombreBuild("Build #12 / PvE +");
  if (!/más de 15 caracteres/i.test(exceso)) malas.push(`el exceso no devuelve el aviso específico: ${exceso}`);
  if (j.errorNombreBuild("B#12 PvE") !== "") malas.push("rechazó signos o números válidos en una build");
  const usados = j.player.builds = [
    { id:"b1", nombre:"123456789012345", preparadas:[], ramas:{} },
    { id:"b2", nombre:"123456789012345", preparadas:[], ramas:{} },
  ];
  j.normalizarBuilds();
  if (usados.some(b => Array.from(b.nombre).length > MAX_NOMBRE_BUILD)) malas.push("la normalización de builds superó 15 caracteres");
  if (new Set(usados.map(b => b.nombre.toLowerCase())).size !== usados.length) malas.push("la normalización dejó nombres de build duplicados");
  const formulario = Juego.prototype.formularioBuild.toString();
  if (formulario.includes("maxLength")) malas.push("el campo de build sigue truncando antes de poder avisar");
  return malas;
});

PRUEBAS.registrar("builds v34: activar normaliza el guardado y permite cambiar sólo el loadout fuera de combate", () => {
  const malas = [];
  const j = bancoBuilds();
  j.prepararTecnica("palma");
  const uno = j.guardarBuildActual("Uno");
  j.despreprararTecnica("palma");
  j.prepararTecnica("latigo");
  const dos = j.guardarBuildActual("Dos");
  // Volvemos al snapshot de Dos y desde una zona salvaje pedimos Uno. Como
  // las ramas son idénticas y sólo cambia lo preparado, no debe exigir reposo.
  j.pos = "bosque_paso_hundido";
  const res = j.activarBuild(uno.id);
  if (!res.ok) malas.push(`no activó una build que sólo cambia loadout: ${res.texto}`);
  if (j.player.build_activa !== uno.id) malas.push("no fijó la build seleccionada como activa");
  if (JSON.stringify(j.player.tecnicas_preparadas) !== JSON.stringify(["palma"])) malas.push("no restauró el loadout guardado");
  // Si la build exige tocar meridianos, la zona salvaje sigue bloqueando.
  j.pos = "camino";
  j.elegirRama("palma", 1, 2);
  const tres = j.guardarBuildActual("Tres");
  j.elegirRama("palma", 1, 0);
  j.pos = "bosque_paso_hundido";
  const bloqueada = j.activarBuild(tres.id);
  if (bloqueada.ok) malas.push("permitió reorganizar meridianos en zona salvaje");
  return malas;
});

PRUEBAS.registrar("técnicas v34: doble clic conmuta el punto de una evolución", () => {
  const j = bancoBuilds(["palma"]), malas = [];
  j.renderMeridianos = () => {};
  j.elegirRama("palma", 1, 2);
  j.activarRamaDoble("palma", 1, 2);
  if (j.player.tecnicas.palma.ramas[1] !== 0) malas.push("doble clic sobre la activa no devolvió el punto");
  j.activarRamaDoble("palma", 1, 2);
  if (j.player.tecnicas.palma.ramas[1] !== 2) malas.push("doble clic sobre la inactiva no asignó el punto");
  const cuerpo = Juego.prototype.renderMeridianos.toString();
  if (!cuerpo.includes("setTimeout") || cuerpo.includes('addEventListener("dblclick"'))
    malas.push("el árbol todavía rerenderiza antes de reconocer de forma fiable el doble clic");
  return malas;
});

PRUEBAS.registrar("interfaz v33: filtros estrictos no confunden objetos con plantas o cuerpos", () => {
  const j = PRUEBAS.banco(), malas = [];
  j.plantasEnSala = () => [{ id:"loto_prueba", especie:"loto", planta:{ nombre:"Loto de prueba" } }];
  j.cadaveresEnSala = () => [{ mob_id:"serpiente_qi", name:"Serpiente de Qi", corto:"serpiente", tipo:"cadáver", desapareceEn:999 }];
  if (j.plantasInteraccion("espada de madera").length) malas.push("RECOLECTAR aceptó un objetivo que no es planta");
  if (j.cadaveresInteraccion("espada de madera").length) malas.push("EXTRAER aceptó un objetivo que no es cuerpo");
  if (j.plantasInteraccion("loto").length !== 1) malas.push("RECOLECTAR no encontró una planta válida");
  if (j.cadaveresInteraccion("serpiente").length !== 1) malas.push("EXTRAER no encontró un cuerpo válido");
  return malas;
});

PRUEBAS.registrar("interfaz v10: OFICIOS no contiene acciones contextuales de plantas o cadáveres", () => {
  const cuerpoHerb = Juego.prototype.renderHerboristeria.toString();
  const cuerpoExam = Juego.prototype.renderExamen.toString();
  afirmar(!cuerpoHerb.includes("plantasEnSala"), "Herboristería en OFICIOS no debe consultar nodos de la sala");
  afirmar(!cuerpoExam.includes("cadaveresEnSala"), "Examen en OFICIOS no debe consultar cadáveres de la sala");
});

PRUEBAS.registrar("interfaz v10: las interacciones contextuales consultan el mundo presente", () => {
  afirmar(Juego.prototype.plantasInteraccion.toString().includes("plantasEnSala"), "RECOLECTAR debe leer sólo plantas de la sala");
  afirmar(Juego.prototype.cadaveresInteraccion.toString().includes("cadaveresEnSala"), "EXTRAER debe leer sólo cuerpos de la sala");
});

PRUEBAS.registrar("salas: ninguna planta recolectable aparece en «Ves:»", () => {
  const malas = [];
  for (const [rid, sala] of Object.entries(ROOMS)) {
    for (const mid of [...(sala.items || []), ...(sala.oculto || [])]) {
      if (MATERIALES_RECOLECTABLES.has(mid))
        malas.push(`${rid} declara "${mid}" como objeto suelto; es material de planta`);
    }
  }
  const cuerpo = Juego.prototype.itemsNaturalesVisibles.toString();
  if (!cuerpo.includes("MATERIALES_RECOLECTABLES"))
    malas.push("itemsNaturalesVisibles ya no filtra materiales de planta");
  return malas;
});

PRUEBAS.registrar("interfaz: plantas en verde, objetos en morado", () => {
  const malas = [];
  const cuerpo = Juego.prototype.mostrarSala.toString();
  if (!/"Plantas: "[^;]*sala-plantas/.test(cuerpo))
    malas.push("la línea Plantas: no usa la clase verde sala-plantas");
  if (!/"Ves: "[^;]*sala-objetos/.test(cuerpo))
    malas.push("la línea Ves: no usa la clase morada sala-objetos");
  if (!/"En el suelo: "[^;]*sala-objetos/.test(cuerpo))
    malas.push("la línea En el suelo: no usa la clase morada sala-objetos");
  if (/"Plantas: "[^;]*sala-objetos/.test(cuerpo))
    malas.push("las plantas siguen pintadas como objetos");
  return malas;
});

PRUEBAS.registrar("interfaz v10: abrir interacción no ejecuta procedimientos por sí solo", () => {
  const cuerpo = Juego.prototype.abrirInteraccionOficio.toString();
  afirmar(!cuerpo.includes("recolectarPlanta("), "abrir RECOLECTAR no debe cosechar automáticamente");
  afirmar(!cuerpo.includes("recolectarCadaver("), "abrir EXTRAER no debe ejecutar una extracción automáticamente");
});

PRUEBAS.registrar("interfaz v11: acordeones de recolección empiezan compactos y conservan estado", () => {
  const j = PRUEBAS.banco(), malas = [];
  const herb = j.estadoUIParteHerb("nodo_prueba", "parte_prueba");
  const exam = j.estadoUIParteExamen("cuerpo_prueba", "parte_prueba");
  if (!herb.colapsado) malas.push("una parte vegetal nueva no empieza colapsada");
  if (!exam.colapsado) malas.push("una estructura de cadáver nueva no empieza colapsada");
  herb.colapsado = false; herb.resultado = { fallo:false, texto:"ok" };
  if (j.estadoUIParteHerb("nodo_prueba", "parte_prueba") !== herb || j.estadoUIParteHerb("nodo_prueba", "parte_prueba").colapsado)
    malas.push("el estado abierto de una parte vegetal no se conserva entre renders");
  exam.colapsado = false; exam.resultado = { fallo:false, texto:"ok" };
  if (j.estadoUIParteExamen("cuerpo_prueba", "parte_prueba") !== exam || j.estadoUIParteExamen("cuerpo_prueba", "parte_prueba").colapsado)
    malas.push("el estado abierto de una estructura de cadáver no se conserva entre renders");
  return malas;
});

PRUEBAS.registrar("interfaz v11: cosechar y extraer no fuerzan el cierre del acordeón", () => {
  const malas = [];
  const herb = Juego.prototype.renderInteraccionHerboristeria.toString();
  const exam = Juego.prototype.renderInteraccionExamen.toString();
  if (!herb.includes("ui.colapsado=false")) malas.push("la cosecha ya no deja abierta la parte intervenida");
  if (!exam.includes("ui.colapsado=false")) malas.push("la extracción ya no deja abierta la estructura intervenida");
  if (!exam.includes("estadoUIParteExamen")) malas.push("Examen no usa el mismo patrón de acordeón persistente");
  return malas;
});

PRUEBAS.registrar("interfaz v46: EXTRAER con varios cuerpos pide elegir y no abre la interfaz", () => {
  const j = PRUEBAS.banco({ pos:"bosque_cauce_oculto" }), malas = [];
  j.desbloquearProfesion("examen");
  const mk = (id, corto) => ({ mob_id:id, name:MOBS[id].name, corto, elemento:"agua", tipo:"cadáver", caidoEn:0, desapareceEn:9999 });
  j.cadaveres = { bosque_cauce_oculto: [mk("serpiente_qi","serpiente"), mk("rata_qi","rata")] };
  const mensajes = [];
  j.salida = (t) => mensajes.push(String(t));
  j.contenido = document.createElement("div"); // bloque de elección aislado del registro real
  const dlg = document.getElementById("interaccionOficio");
  const abiertoAntes = dlg.open;
  try {
    j.abrirInteraccionOficio("examen", []);
    if (dlg.open && !abiertoAntes) malas.push("EXTRAER a secas abrió la interfaz con varios cuerpos");
    const pregunta = j.contenido.querySelector(".mc-pregunta")?.textContent || "";
    if (!pregunta.startsWith("Debes seleccionar el cuerpo que desees trabajar"))
      malas.push("no apareció el recordatorio de elegir un cuerpo");
    if (j.contenido.querySelectorAll("button.mc-opcion").length !== 2)
      malas.push("el bloque de elección no muestra una fila por cuerpo");
    const txt = mensajes.join(" ") + " " + j.contenido.textContent;
    if (!txt.includes(MOBS.serpiente_qi.name) || !txt.includes(MOBS.rata_qi.name))
      malas.push("el recordatorio no lista los cuerpos disponibles en la sala");
    if (j.candidatosInteraccionOficio("examen", "serpiente").length !== 1) malas.push("«serpiente» debería elegir un único cuerpo");
    if (j.candidatosInteraccionOficio("examen", "cuerpo").length !== 2) malas.push("un término genérico debería seguir siendo ambiguo");
  } finally { if (dlg.open && !abiertoAntes) j.cerrarInteraccionOficio(); }
  return malas;
});

PRUEBAS.registrar("interfaz v57: victoria agrupa por especie y la elección de cuerpo numera cada fila", () => {
  const j = PRUEBAS.banco({ pos:"bosque_cauce_oculto" }), malas = [];
  const g = j.agruparDerrotas({ derrotas: [
    { nombre:"avispa de jade dentado", errante:false }, { nombre:"avispa de jade dentado", errante:false },
    { nombre:"macaco ladrón de píldoras", errante:false }, { nombre:"avispa de jade dentado", errante:true },
    { nombre:"macaco ladrón de píldoras", errante:true } ] });
  if (g.length !== 2 || g[0].n !== 3 || g[0].errantes !== 1 || g[1].n !== 2 || g[1].errantes !== 1) malas.push("no agrupó las derrotas por especie");
  const alt = j.agruparDerrotas({ enemigosDerrotados: ["rata #1", "rata #2 (errante)"] });
  if (alt.length !== 1 || alt[0].n !== 2 || alt[0].errantes !== 1) malas.push("el respaldo por texto no agrupó bien");
  j.contenido = document.createElement("div");
  j.mostrarResumenVictoria({ derrotas: [{ nombre:"rata", errante:false }, { nombre:"rata", errante:false }], items: new Map([["pocion_sangre", 1]]) });
  const filas = j.contenido.querySelectorAll(".victoria-fila");
  if (filas.length !== 2 || !filas[0].textContent.includes("×2")) malas.push("el resumen de victoria no muestra ×2 en una sola fila");
  const mk = (id, corto) => ({ mob_id:id, name:MOBS[id].name, corto, elemento:"agua", tipo:"cadáver", caidoEn:0, desapareceEn:9999 });
  j.desbloquearProfesion("examen");
  j.cadaveres = { bosque_cauce_oculto: [mk("serpiente_qi","serpiente"), mk("rata_qi","rata"), mk("serpiente_qi","serpiente")] };
  j.contenido = document.createElement("div");
  j.mostrarSeleccionInteraccionOficio("examen", j.candidatosInteraccionOficio("examen", "serpiente"));
  const nums = [...j.contenido.querySelectorAll(".mc-opcion-insignia")].map(e => e.textContent);
  if (nums.join(",") !== "Nº 1,Nº 3") malas.push("las filas no usan el número real de la sala: " + nums.join(","));
  return malas;
});

PRUEBAS.registrar("interfaz v59: el resumen de victoria separa Derrotados, Recompensas y Botín", () => {
  const j = PRUEBAS.banco({ pos:"bosque_cauce_oculto" }), malas = [];
  j.contenido = document.createElement("div");
  j.mostrarResumenVictoria({ derrotas:[{ nombre:"rata", errante:false }], qiGanado:5, piedrasGanadas:2, items:new Map([["pocion_sangre",1]]) });
  const secs = [...j.contenido.querySelectorAll(".victoria-sec")].map(x => x.querySelector(".victoria-etq").textContent + ":" + x.querySelectorAll(".victoria-fila").length);
  if (secs.join("|") !== "Derrotados:1|Recompensas:2|Botín:1") malas.push("secciones inesperadas: " + secs.join("|"));
  j.contenido = document.createElement("div");
  j.mostrarResumenVictoria({ derrotas:[{ nombre:"rata", errante:false }], qiGanado:0, piedrasGanadas:0, items:new Map() });
  if (j.contenido.querySelectorAll(".victoria-sec").length !== 1) malas.push("sin qi, piedras ni botín solo debía haber la sección Derrotados");
  return malas;
});

PRUEBAS.registrar("interfaz v46: un cuerpo ya agotado no cuenta como opción en la siguiente extracción", () => {
  const j = PRUEBAS.banco({ pos:"bosque_cauce_oculto" }), malas = [];
  j.desbloquearProfesion("examen");
  const mk = (id, corto) => ({ mob_id:id, name:MOBS[id].name, corto, elemento:"agua", tipo:"cadáver", caidoEn:0, desapareceEn:9999 });
  j.cadaveres = { bosque_cauce_oculto: [mk("rata_qi","rata"), mk("serpiente_qi","serpiente")] };
  for (const h of HALLAZGOS_CADAVER.rata_qi.hallazgos) j.cadaveres.bosque_cauce_oculto[0].examenProcedimientos = { ...(j.cadaveres.bosque_cauce_oculto[0].examenProcedimientos || {}), [h.id]:"exito" };
  j.ofiUltimoResultadoExamen = { indice:0, fallo:false, texto:"sesión anterior" };
  const dlg = document.getElementById("interaccionOficio"), abiertoAntes = dlg.open;
  try {
    j.abrirInteraccionOficio("examen", []);
    const vistos = j.entidadesInteraccionRender("examen");
    if (!dlg.open || vistos.length !== 1 || vistos[0].cuerpo.mob_id !== "serpiente_qi")
      malas.push("con un cuerpo agotado y otro disponible debía abrirse directamente el disponible");
  } finally { if (dlg.open && !abiertoAntes) j.cerrarInteraccionOficio(); }
  return malas;
});

PRUEBAS.registrar("interfaz v46: cuerpos con el mismo nombre se distinguen por número", () => {
  const j = PRUEBAS.banco({ pos:"bosque_cauce_oculto" }), malas = [];
  j.desbloquearProfesion("examen");
  const mk = (id, corto) => ({ mob_id:id, name:MOBS[id].name, corto, elemento:"agua", tipo:"cadáver", caidoEn:0, desapareceEn:9999 });
  j.cadaveres = { bosque_cauce_oculto: [mk("serpiente_qi","serpiente"), mk("serpiente_qi","serpiente"), mk("rata_qi","rata")] };
  const dos = j.candidatosInteraccionOficio("examen", "serpiente");
  if (dos.length !== 2) malas.push(`«serpiente» debía dar 2 candidatas y dio ${dos.length}`);
  const texto = j.textoSeleccionInteraccionOficio("examen", dos);
  if (!texto.includes("[nº 1]") || !texto.includes("[nº 2]")) malas.push("el recordatorio no numera los cuerpos repetidos");
  const segundo = j.candidatosInteraccionOficio("examen", "2");
  if (segundo.length !== 1 || segundo[0].indice !== 1) malas.push("el número 2 no eligió el segundo cuerpo de la sala");
  // El número coincide con el que muestra la tarjeta aunque haya un cuerpo agotado delante.
  for (const h of HALLAZGOS_CADAVER.serpiente_qi.hallazgos) j.cadaveres.bosque_cauce_oculto[0].examenProcedimientos = { ...(j.cadaveres.bosque_cauce_oculto[0].examenProcedimientos || {}), [h.id]:"exito" };
  const tras = j.candidatosInteraccionOficio("examen", "2");
  if (tras.length !== 1 || tras[0].cuerpo !== j.cadaveresEnSala()[1]) malas.push("con un cuerpo agotado delante, el número ya no coincide con el de la tarjeta");
  return malas;
});

PRUEBAS.registrar("interfaz v46: RECOLECTAR con varias plantas pide elegir y no abre la interfaz", () => {
  const j = PRUEBAS.banco({ pos:"bosque_cauce_oculto" }), malas = [];
  j.desbloquearProfesion("herboristeria");
  const plantas = j.plantasEnSala();
  if (plantas.length < 2) return ["la sala de prueba ya no tiene varias plantas"];
  const mensajes = [];
  j.salida = (t) => mensajes.push(String(t));
  j.contenido = document.createElement("div"); // bloque de elección aislado del registro real
  const dlg = document.getElementById("interaccionOficio");
  const abiertoAntes = dlg.open;
  try {
    j.abrirInteraccionOficio("herboristeria", []);
    if (dlg.open && !abiertoAntes) malas.push("RECOLECTAR a secas abrió la interfaz con varias plantas");
    const txt = mensajes.join(" ") + " " + j.contenido.textContent;
    const pregunta = j.contenido.querySelector(".mc-pregunta")?.textContent || "";
    if (!pregunta.startsWith("Debes seleccionar la planta que desees recolectar")) malas.push("no apareció el recordatorio de elegir una planta");
    if (j.contenido.querySelectorAll("button.mc-opcion").length !== plantas.length) malas.push("el bloque de elección no muestra una fila por planta");
    for (const n of plantas) if (!txt.includes(capitalizarUI(n.planta.nombre))) malas.push(`el recordatorio no lista «${n.planta.nombre}»`);
    if (j.candidatosInteraccionOficio("herboristeria", plantas[0].planta.nombre).length !== 1) malas.push("nombrar una planta debería elegir sólo esa");
    if (j.candidatosInteraccionOficio("herboristeria", "2").length !== 1) malas.push("el número 2 debería elegir una sola planta");
  } finally { if (dlg.open && !abiertoAntes) j.cerrarInteraccionOficio(); }
  return malas;
});

PRUEBAS.registrar("interfaz v46: una sola entidad se muestra sola y sigue siendo la misma al re-renderizar", () => {
  const j = PRUEBAS.banco({ pos:"bosque_cauce_oculto" }), malas = [];
  j.desbloquearProfesion("examen"); j.desbloquearProfesion("herboristeria");
  const mk = (id, corto) => ({ mob_id:id, name:MOBS[id].name, corto, elemento:"agua", tipo:"cadáver", caidoEn:0, desapareceEn:9999 });
  j.cadaveres = { bosque_cauce_oculto: [mk("serpiente_qi","serpiente"), mk("rata_qi","rata")] };
  j.interaccionOficioObjetivo = j.cadaveresEnSala()[1];
  const vistos = j.entidadesInteraccionRender("examen");
  if (vistos.length !== 1 || vistos[0].cuerpo.mob_id !== "rata_qi") malas.push("la interfaz no muestra únicamente el cuerpo elegido");
  // Si otro cuerpo desaparece de la sala, el elegido sigue siendo el mismo (no se corre el índice).
  j.cadaveres.bosque_cauce_oculto[0].desapareceEn = -1;
  const despues = j.entidadesInteraccionRender("examen");
  if (despues.length !== 1 || despues[0].cuerpo.mob_id !== "rata_qi") malas.push("al cambiar la sala la interfaz saltó a otro cuerpo");
  const nodo = j.plantasEnSala()[1];
  j.interaccionOficioObjetivo = nodo.id;
  const plantaVista = j.entidadesInteraccionRender("herboristeria");
  if (plantaVista.length !== 1 || plantaVista[0].nodo.id !== nodo.id) malas.push("la interfaz no muestra únicamente la planta elegida");
  return malas;
});

PRUEBAS.registrar("interfaz v46: la ventana de EXTRAER/RECOLECTAR no cambia de tamaño y conserva su scroll", () => {
  const malas = [];
  const css = [...document.querySelectorAll("style")].map(e => e.textContent).join("\n");
  const regla = css.match(/^\s*#interaccionOficio\s*\{[^}]*\}/gm)?.find(r => /height:/.test(r)) || "";
  const h = regla.match(/[^-]height:\s*([^;]+);/)?.[1]?.trim(), mh = regla.match(/max-height:\s*([^;]+);/)?.[1]?.trim();
  if (!h || h !== mh) malas.push(`la altura de la ventana no es fija (height: ${h} · max-height: ${mh})`);
  if (!/#interaccionDetalle\s*\{[^}]*overflow-y:\s*auto/.test(css)) malas.push("el contenido de la ventana ya no se desplaza por dentro");
  if (!/#interaccionDetalle\s*\{[^}]*scrollbar-gutter:\s*stable/.test(css)) malas.push("la barra de scroll puede reflotar el texto al aparecer");
  const render = Juego.prototype.renderInteraccionOficio.toString();
  if (!render.includes("scrollPrevio") || !render.includes("cont.scrollTop = scrollPrevio")) malas.push("re-renderizar ya no conserva la posición de scroll");
  return malas;
});

PRUEBAS.registrar("guardados: ida y vuelta sin pérdida", () => {
  const j = PRUEBAS.banco();
  j.flags.prueba_ida_vuelta = true;
  j.pos = "patio";
  j.turnoGlobal = 17;
  const copia = PRUEBAS.banco();
  copia.deserializar(JSON.parse(JSON.stringify(j.serializar())));
  const malas = [];
  if (copia.pos !== "patio") malas.push(`pos: "patio" -> "${copia.pos}"`);
  if (!copia.flags.prueba_ida_vuelta) malas.push("se perdió una bandera");
  if (copia.turnoGlobal !== 17) malas.push(`turnoGlobal: 17 -> ${copia.turnoGlobal}`);
  return malas;
});

PRUEBAS.registrar("guardados: rechazo atómico de una partida sin versión", () => {
const j=PRUEBAS.banco(),antes=JSON.stringify(j.serializar());let accedido=false;const legacy={get player(){accedido=true;throw Error("Accedió player legacy");}};afirmar(j.deserializar(legacy)===false,"No rechazó save sin versión");afirmar(!accedido,"Leyó estado legacy");afirmar(JSON.stringify(j.serializar()).replace(/"fecha":\d+/,"")===antes.replace(/"fecha":\d+/,""),"Mutó estado");
});

// ---------- reproducibilidad ----------

PRUEBAS.registrar("azar: la misma semilla da la misma secuencia", () => {
  const tanda = () => { Azar.sembrar(777); return Array.from({ length: 40 }, () => tirar("1d20")); };
  const a = tanda(), b = tanda();
  Azar.libre();
  if (a.join(",") !== b.join(",")) return ["dos tandas con la semilla 777 dieron resultados distintos"];
  if (new Set(a).size < 5) return ["la secuencia sembrada apenas varía: " + a.slice(0, 10).join(",")];
  return [];
});

PRUEBAS.registrar("azar: sin sembrar, el juego sigue siendo impredecible", () => {
  Azar.libre();
  const a = Array.from({ length: 40 }, () => tirar("1d20")).join(",");
  const b = Array.from({ length: 40 }, () => tirar("1d20")).join(",");
  return a === b ? ["dos tandas libres dieron exactamente lo mismo"] : [];
});

PRUEBAS.registrar("combate: ciclo de ventaja elemental es simétrico y cierra en 5", () => {
  const malas = [];
  const ciclo = [["fuego", "metal"], ["metal", "viento"], ["viento", "tierra"], ["tierra", "agua"], ["agua", "fuego"]];
  for (const [a, b] of ciclo) {
    if (relacionElemental(a, b) !== 1) malas.push(`${a} debería superar a ${b}`);
    if (relacionElemental(b, a) !== -1) malas.push(`${b} debería ser superado por ${a}`);
  }
  if (relacionElemental("fuego", "fuego") !== 0) malas.push("un elemento no tiene ventaja sobre sí mismo");
  if (relacionElemental("fuego", "tierra") !== 0) malas.push("fuego y tierra no deberían tener relación directa");
  if (relacionElemental(null, "agua") !== 0 || relacionElemental("agua", null) !== 0) malas.push("sin elemento en algún lado, no hay relación");
  return malas;
});

// ---------- concordancia (bonos porcentuales) y Definitivas · v49 ----------
// Banco de laboratorio: un combate contra un rival que no puede herir ni esquivar,
// con qi de sobra. El azar se fija por bloque para que cada número salga exacto.
function conAzarFijo(valor, fn) {
  const original = Azar.random;
  Azar.random = () => valor;
  try { return fn(); } finally { Azar.random = original; }
}
function bancoConcordancia({ elementoMob = null, conocidas = [] } = {}) {
  const j = bancoCombate();
  for (const tid of conocidas) j.player.tecnicas[tid] = { maestria: 3, usos: 99, practica: 99, ramas: { 1: 0, 2: 0, 3: 0 } };
  j.player.qi = j.player.qi_max = 999;
  Object.assign(j.combate.e, { hp: 1e6, max_hp: 1e6, defensa: -999, ataque: -999, tecnica: null, elemento: elementoMob });
  return { j, p: j.player, c: j.combate };
}
// Lanza una técnica y devuelve { daño causado, texto del turno }.
function usarTecnicaEnBanco(b, tid) {
  const antes = b.c.e.hp;
  const [texto] = b.c.turno("tecnica", [tid]);
  return { dano: antes - b.c.e.hp, texto };
}

// ---------- absorción como burbuja con reserva · v52 ----------
// La absorción (guardia) es una burbuja: sólo se gasta con el daño que absorbe, nunca por rondas
// ni por número de impactos. Evasión y fortificación siguen durando turnos. Estas pruebas fijan el
// azar (tirada de 11) para que el enemigo conecte siempre que tiene ataque y falle siempre que no.
function bancoAbsorcion({ conocidas = ["piel_cobre"], golpea = false, daño = "5d1" } = {}) {
  const b = bancoConcordancia({ conocidas });
  b.p.hp = b.p.max_hp = 500;
  Object.assign(b.c.e, { ataque: golpea ? 999 : -999, daño });
  return b;
}

PRUEBAS.registrar("absorción: la reserva nace como golpe × duración y no baja con el paso de las rondas", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    const b = bancoAbsorcion();
    const conf = b.j.statsTecnica("piel_cobre");
    if (conf.capacidad !== conf.guardia * conf.duracion) malas.push(`statsTecnica: reserva ${conf.capacidad}, esperaba ${conf.guardia * conf.duracion}`);
    b.c.turno("tecnica", ["piel_cobre"]);
    let gu = b.c.estadoDe("jugador", "guardia");
    if (!gu) { malas.push("la técnica no dejó la burbuja"); return; }
    if (gu.params.capacidad !== conf.guardia * conf.duracion) malas.push(`la burbuja nació con reserva ${gu.params.capacidad}`);
    if (gu.params.capacidadMax !== gu.params.capacidad) malas.push("capacidadMax no recuerda la reserva inicial");
    for (let i = 0; i < 8; i++) b.c.turno("atacar", []);
    gu = b.c.estadoDe("jugador", "guardia");
    if (!gu) malas.push("la burbuja desapareció por el paso de 9 rondas sin recibir golpes");
    else if (gu.params.capacidad !== conf.guardia * conf.duracion) malas.push(`la burbuja se gastó sin recibir golpes (reserva ${gu.params.capacidad})`);
  });
  return malas;
});

PRUEBAS.registrar("absorción: cada golpe real gasta la reserva; al llegar a 0 se disipa y lo anuncia", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    const b = bancoAbsorcion({ golpea: true, daño: "5d1" });
    const hp0 = b.p.hp;
    const [t1] = b.c.turno("tecnica", ["piel_cobre"]);        // Piel de Cobre: 3 por golpe, reserva 6
    const gu = b.c.estadoDe("jugador", "guardia");
    if (!gu || gu.params.capacidad !== 3) malas.push(`tras el 1.er golpe esperaba reserva 3, hay ${gu?.params.capacidad}`);
    if (hp0 - b.p.hp !== 2) malas.push(`el 1.er golpe (5) debía dejar pasar 2 y dejó ${hp0 - b.p.hp}`);
    if (/se disipa/.test(t1)) malas.push("anunció que se disipaba con reserva todavía disponible");
    const [t2] = b.c.turno("atacar", []);
    if (b.c.estadoDe("jugador", "guardia")) malas.push("la burbuja sobrevivió con la reserva agotada");
    if (!/Tu protección se disipa/.test(t2)) malas.push("no anunció que la burbuja se disipaba");
    if (hp0 - b.p.hp !== 4) malas.push(`tras 2 golpes de 5 esperaba 4 de daño recibido y hubo ${hp0 - b.p.hp}`);
    b.c.turno("atacar", []);
    if (hp0 - b.p.hp !== 9) malas.push(`con la burbuja rota el 3.er golpe debía entrar completo (total 9) y el total es ${hp0 - b.p.hp}`);
  });
  return malas;
});

PRUEBAS.registrar("absorción: no cuenta impactos; los golpes pequeños sólo la gastan por lo que absorben", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    // Golpes de 2 contra Piel de Cobre (3 por golpe, reserva 6): absorbe 2+2+2 y recién entonces se rompe.
    let b = bancoAbsorcion({ golpea: true, daño: "2d1" });
    b.c.turno("tecnica", ["piel_cobre"]);
    b.c.turno("atacar", []);
    let gu = b.c.estadoDe("jugador", "guardia");
    if (!gu || gu.params.capacidad !== 2) malas.push(`tras 2 golpes de 2 esperaba reserva 2 y hay ${gu?.params.capacidad} (¿sigue contando impactos?)`);
    b.c.turno("atacar", []);
    if (b.c.estadoDe("jugador", "guardia")) malas.push("con la reserva en 0 la burbuja debía disiparse");
    if (b.p.hp !== b.p.max_hp) malas.push("golpes de 2 contra 3 de absorción no debían causar daño");

    // Reserva parcial: 5 por golpe pero sólo quedan 7 de reserva → absorbe 5 y luego 2, y el segundo golpe deja pasar 3.
    b = bancoAbsorcion({ golpea: false, daño: "5d1" });
    b.c.aplicar("jugador", { tipo: "guardia", nombre: "Burbuja de prueba", duracion: 1, params: { reduccion: 5, capacidad: 7, capacidadMax: 7 }, expira: "Se disipa." });
    b.c.e.ataque = 999;
    const hp0 = b.p.hp;
    b.c.turno("atacar", []);
    if (hp0 - b.p.hp !== 0) malas.push(`1.er golpe: la burbuja debía absorber los 5 (recibió ${hp0 - b.p.hp})`);
    const [txt] = b.c.turno("atacar", []);
    if (hp0 - b.p.hp !== 3) malas.push(`2.º golpe: con 2 de reserva debían pasar 3 y pasaron ${hp0 - b.p.hp}`);
    if (b.c.estadoDe("jugador", "guardia")) malas.push("con la reserva en 0 la burbuja debía desaparecer");
    if (!/Se disipa\./.test(txt)) malas.push("no anunció el texto de expiración de la burbuja");
  });
  return malas;
});

PRUEBAS.registrar("absorción: una absorción sin reserva declarada recibe golpe × duración y tampoco decae por rondas", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    const b = bancoAbsorcion();
    b.c.aplicar("jugador", { tipo: "guardia", duracion: 3, params: { reduccion: 4 } });
    const gu = b.c.estadoDe("jugador", "guardia");
    if (gu?.params.capacidad !== 12 || gu?.params.capacidadMax !== 12) malas.push(`reserva por defecto ${gu?.params.capacidad}, esperaba 12`);
    for (let i = 0; i < 5; i++) b.c.turno("atacar", []);
    if (b.c.estadoDe("jugador", "guardia")?.params.capacidad !== 12) malas.push("la absorción perdió reserva sin recibir golpes");
  });
  return malas;
});

PRUEBAS.registrar("absorción: DEFENDER protege los próximos 2 golpes reales, no las próximas 2 rondas", () => {
  const malas = [];
  conAzarFijo(0.5, () => {   // 35 + ⌊0.5·16⌋ = 43% el primero · 25 + ⌊0.5·16⌋ = 33% el segundo
    const b = bancoAbsorcion({ golpea: false, daño: "20d1" });
    b.c.turno("defender", []);
    for (let i = 0; i < 3; i++) b.c.turno("atacar", []);
    const gu = b.c.estadoDe("jugador", "guardia");
    if (gu?.duracion !== 2) malas.push(`tras 3 rondas sin golpes DEFENDER debía conservar 2 golpes y tiene ${gu?.duracion}`);
    b.c.e.ataque = 999;
    const hp0 = b.p.hp;
    b.c.turno("atacar", []);
    if (hp0 - b.p.hp !== 12) malas.push(`1.er golpe de 20 con 43%: debían pasar 12 y pasaron ${hp0 - b.p.hp}`);
    b.c.turno("atacar", []);
    if (hp0 - b.p.hp !== 26) malas.push(`2.º golpe de 20 con 33%: debían pasar 14 más (total 26) y el total es ${hp0 - b.p.hp}`);
    if (b.c.estadoDe("jugador", "guardia")) malas.push("DEFENDER siguió activo tras sus 2 golpes");
    b.c.turno("atacar", []);
    if (hp0 - b.p.hp !== 46) malas.push(`el 3.er golpe debía entrar completo (total 46) y el total es ${hp0 - b.p.hp}`);
  });
  return malas;
});

PRUEBAS.registrar("absorción: la fortificación y la evasión siguen decayendo por turnos mientras la burbuja no", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    const b = bancoAbsorcion({ conocidas: ["piel_cobre", "espejo_luna", "paso_nube"] });
    b.c.turno("tecnica", ["espejo_luna"]);
    b.c.turno("tecnica", ["paso_nube"]);
    b.c.turno("tecnica", ["piel_cobre"]);
    const duracionDefensa = b.j.statsTecnica("espejo_luna").duracion;
    if (duracionDefensa !== 2) { malas.push(`la prueba supone defensa de 2 turnos y son ${duracionDefensa}`); return; }
    if (b.c.estadoDe("jugador", "defensa")) malas.push("la fortificación debía haberse apagado tras 2 turnos");
    for (let i = 0; i < 3; i++) b.c.turno("atacar", []);
    if (b.c.estadoDe("jugador", "esquiva")) malas.push("la evasión debía haberse disipado por turnos");
    if (!b.c.estadoDe("jugador", "guardia")) malas.push("la burbuja se disipó por turnos sin recibir un solo golpe");
  });
  return malas;
});

PRUEBAS.registrar("absorción: chips y registros muestran la reserva, no turnos ni impactos", () => {
  const malas = [];
  const b = bancoAbsorcion();
  b.c.aplicar("jugador", { tipo: "guardia", nombre: "Piel de Cobre", duracion: 2, params: { reduccion: 3, capacidad: 4, capacidadMax: 6 } });
  const gu = b.c.estadoDe("jugador", "guardia");
  const d = descriptorEstadoCombate(gu);
  if (!/4\/6/.test(d.texto)) malas.push(`el chip no muestra la reserva restante: "${d.texto}"`);
  if (/\dT\b|imp\./.test(d.texto) || /turno|golpes? restante/.test(d.titulo)) malas.push(`la burbuja todavía habla de turnos o impactos: "${d.texto}" / "${d.titulo}"`);
  if (restoEstadoActivo(gu) !== "4/6") malas.push(`el registro de estados activos muestra "${restoEstadoActivo(gu)}"`);
  const defender = descriptorEstadoCombate({ tipo: "guardia", nombre: "Defender", duracion: 2, params: { reduccionInicial: 43, reduccionSegundo: 33 } });
  if (!/43%/.test(defender.texto) || !/2 imp\./.test(defender.texto)) malas.push(`DEFENDER debía mostrar su porcentaje y sus golpes: "${defender.texto}"`);
  const defensa = descriptorEstadoCombate({ tipo: "defensa", duracion: 3, params: { bono: 4 } });
  if (!/3T/.test(defensa.texto)) malas.push("la fortificación dejó de mostrar sus turnos");
  b.j.actualizarVistaCombate();
  b.j.renderJugadorCombate();
  const chips = Array.from(b.j.cbJugadorEl.querySelectorAll(".combate-estado-chip")).map(x => x.textContent).join(" | ");
  if (!/ABS 4\/6/.test(chips)) malas.push(`el panel visual no muestra la reserva: ${chips}`);
  return malas;
});

PRUEBAS.registrar("absorción: los textos de las técnicas de absorción hablan de reserva, no de rondas ni de impactos", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  for (const tid of Object.keys(TECNICAS).filter(k => TECNICAS[k].tipo === "guardia")) {
    j.player.tecnicas[tid] = { maestria: 3, usos: 99, practica: 99, ramas: { 1: 0, 2: 0, 3: 0 } };
    const c = j.statsTecnica(tid);
    const textos = {
      explicacionTecnica: j.explicacionTecnica(tid, c),
      resumenMeridiano: j.resumenMeridiano(tid, c),
      tecnicaResumen: j.tecnicaResumen(tid),
      guia: Object.values(GUIA_TECNICAS[tid] || {}).join(" "),
    };
    for (const [nombre, texto] of Object.entries(textos)) {
      if (/ronda|turno/i.test(texto.replace(/no se gasta con el paso de las rondas|no con el paso de las rondas|no por rondas/gi, ""))) malas.push(`${tid} · ${nombre} todavía habla de rondas o turnos: "${texto}"`);
      if (/número de impactos|contador|aguanta/i.test(texto)) malas.push(`${tid} · ${nombre} todavía habla de un contador de impactos: "${texto}"`);
      if (!/reserva/i.test(texto)) malas.push(`${tid} · ${nombre} no menciona la reserva: "${texto}"`);
    }
    if (!(c.capacidad >= c.guardia)) malas.push(`${tid}: reserva inválida (${c.capacidad})`);
    for (let n = 1; n <= 3; n++) for (const r of RAMAS[tid][n]) {
      const texto = j.textoModMeridiano(r.mod, tid);
      if (r.mod.duracionExtra && (/ronda/i.test(texto) || !/reserva/i.test(texto))) malas.push(`${tid} tramo ${n} "${r.nombre}": la duración extra no se describe como reserva ("${texto}")`);
    }
    for (let opcion = 1; opcion <= 3; opcion++) {
      const f = j.statsTecnica(tid, { 1: opcion, 2: opcion, 3: opcion });
      if (f.capacidad !== f.guardia * f.duracion) malas.push(`${tid} opción ${opcion}: reserva ${f.capacidad} ≠ ${f.guardia} × ${f.duracion}`);
    }
    delete j.player.tecnicas[tid];
  }
  // Y el resto de buffs conserva su lenguaje de turnos.
  const cEsp = j.statsTecnica("espejo_luna");
  if (!/rondas/.test(j.explicacionTecnica("espejo_luna", cEsp))) malas.push("la explicación de la fortificación dejó de hablar de rondas");
  if (/reserva/i.test(GUIA_TECNICAS.espejo_luna.proposito + GUIA_TECNICAS.espejo_luna.limite)) malas.push("la guía de la fortificación habla de reserva de absorción");
  return malas;
});

PRUEBAS.registrar("combate: cada secuencia declara un bono válido y todo elemento puede recibir una", () => {
  const malas = [];
  for (const [par, s] of Object.entries(SECUENCIAS_ELEMENTALES)) {
    const [desde, hacia] = par.split(":");
    if (!ELEMENTOS.includes(desde) || !ELEMENTOS.includes(hacia) || desde === hacia) malas.push(`secuencia ${par}: elementos inválidos`);
    if (!s.nombre) malas.push(`secuencia ${par}: sin nombre`);
    if (!(s.bono in PRIORIDAD_BONO)) malas.push(`secuencia ${par}: bono "${s.bono}" desconocido`);
    if (s.daño !== undefined || s.ataque !== undefined || s.qi !== undefined) malas.push(`secuencia ${par}: conserva un bono plano viejo`);
  }
  for (const el of ELEMENTOS)
    if (!Object.keys(SECUENCIAS_ELEMENTALES).some(par => par.endsWith(`:${el}`)))
      malas.push(`ninguna secuencia termina en ${el}: sus técnicas jamás podrían recibir concordancia`);
  return malas;
});

PRUEBAS.registrar("combate: la concordancia de daño es porcentual y se suma a la ventaja elemental", () => {
  const malas = [];
  // Daño base alto y fijo: con números chicos, sumar y multiplicar redondean igual y la prueba no distingue.
  const palma = TECNICAS.palma, dañoOriginal = palma.daño;
  palma.daño = "100";
  try { conAzarFijo(0.5, () => {
    const solo = bancoConcordancia({ conocidas: ["paso_nube"] });
    const base = tirar(solo.j.statsTecnica("palma").daño);
    const sinCombo = usarTecnicaEnBanco(solo, "palma").dano;
    if (sinCombo !== base) malas.push(`sin concordancia esperaba ${base} y salió ${sinCombo}`);

    const combo = bancoConcordancia({ conocidas: ["paso_nube"] });
    combo.c.turno("tecnica", ["paso_nube"]);
    const r = usarTecnicaEnBanco(combo, "palma");
    const esperado = Math.max(1, Math.round(base * (1 + CONCORDANCIA.daño)));
    if (r.dano !== esperado) malas.push(`viento→fuego: esperaba ${esperado} (+${porcentajeUI(CONCORDANCIA.daño)}% de ${base}) y salió ${r.dano}`);
    if (!/Concordancia: Avivar las brasas/.test(r.texto)) malas.push("el turno no anunció la concordancia");

    // Con ventaja elemental (fuego > metal) los dos porcentajes se SUMAN, no se multiplican.
    const ambos = bancoConcordancia({ conocidas: ["paso_nube"], elementoMob: "metal" });
    ambos.c.turno("tecnica", ["paso_nube"]);
    const conAmbos = usarTecnicaEnBanco(ambos, "palma").dano;
    const aditivo = Math.max(1, Math.round(base * (1 + BONO_ELEMENTAL + CONCORDANCIA.daño)));
    if (conAmbos !== aditivo) malas.push(`ventaja + concordancia: esperaba ${aditivo} (aditivo) y salió ${conAmbos}`);
    if (aditivo === Math.round(base * (1 + BONO_ELEMENTAL) * (1 + CONCORDANCIA.daño))) malas.push("la prueba no distingue entre sumar y multiplicar: subir el daño base");
  }); } finally { palma.daño = dañoOriginal; }
  return malas;
});

PRUEBAS.registrar("combate: la concordancia de precisión baja el umbral de crítico en 1", () => {
  const malas = [];
  conAzarFijo(0.9, () => {   // el d20 sale 19: sólo es crítico si el umbral bajó a 19
    const solo = bancoConcordancia({ conocidas: ["piel_cobre", "filo"] });
    const conf = solo.j.statsTecnica("filo");
    if (conf.critMin !== 20) { malas.push(`la prueba supone critMin 20 y Filo tiene ${conf.critMin}`); return; }
    const base = tirar(conf.daño);
    const sin = usarTecnicaEnBanco(solo, "filo");
    if (/CRÍTICO/.test(sin.texto) || sin.dano !== base) malas.push(`sin concordancia no debía haber crítico (daño ${sin.dano}, base ${base})`);

    const combo = bancoConcordancia({ conocidas: ["piel_cobre", "filo"] });
    combo.c.turno("tecnica", ["piel_cobre"]);
    const r = usarTecnicaEnBanco(combo, "filo");
    if (!/CRÍTICO/.test(r.texto)) malas.push("tierra→metal no convirtió la tirada de 19 en crítico");
    if (r.dano !== Math.ceil(base * conf.critMult)) malas.push(`el crítico esperaba ${Math.ceil(base * conf.critMult)} y salió ${r.dano}`);
  });
  return malas;
});

PRUEBAS.registrar("combate: la concordancia de qi devuelve un porcentaje del coste, con mínimo 1", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    const b = bancoConcordancia({ conocidas: ["paso_nube", "latigo"] });
    b.c.turno("tecnica", ["paso_nube"]);
    const coste = b.j.statsTecnica("latigo").coste;
    const antes = b.p.qi;
    b.c.turno("tecnica", ["latigo"]);
    const esperado = -coste + Math.max(1, Math.round(coste * CONCORDANCIA.qi));
    if (b.p.qi - antes !== esperado) malas.push(`viento→agua: el qi cambió ${b.p.qi - antes} y esperaba ${esperado}`);
  });
  for (const coste of [1, 2, 5, 6]) {
    const dev = Math.max(1, Math.round(coste * CONCORDANCIA.qi));
    if (dev < 1) malas.push(`coste ${coste}: la devolución cayó por debajo de 1`);
  }
  return malas;
});

PRUEBAS.registrar("combate: las técnicas de apoyo cobran +25% de su efecto según su rol, hacia arriba y con piso 1", () => {
  const malas = [];
  const sube = (base) => Math.max(1, Math.ceil(base * CONCORDANCIA.apoyo));
  if (bonoApoyoConcordancia("guardia", { guardia: 1 }) !== 1) malas.push("el piso de +1 no se cumple");
  if (bonoApoyoConcordancia("guardia", { guardia: 5 }) !== 2) malas.push("5 de absorción debía subir +2 (1.25 hacia arriba)");
  if (bonoApoyoConcordancia("ataque", { guardia: 5 }) !== 0) malas.push("un rol desconocido no debe cobrar bono");
  conAzarFijo(0.5, () => {
    // absorción · fuego → tierra
    let b = bancoConcordancia({ conocidas: ["piel_cobre"] });
    b.c.turno("tecnica", ["palma"]);
    let conf = b.j.statsTecnica("piel_cobre");
    b.c.turno("tecnica", ["piel_cobre"]);
    let est = b.c.estadoDe("jugador", "guardia");
    if (est?.params.reduccion !== conf.guardia + sube(conf.guardia)) malas.push(`absorción: esperaba ${conf.guardia + sube(conf.guardia)} y quedó ${est?.params.reduccion}`);
    // La duración no se toca: se compara contra la misma técnica lanzada sin secuencia.
    const control = bancoConcordancia({ conocidas: ["piel_cobre"] });
    control.c.turno("tecnica", ["piel_cobre"]);
    const duracionControl = control.c.estadoDe("jugador", "guardia")?.duracion;
    if (est && est.duracion !== duracionControl) malas.push(`la duración cambió (${est.duracion} en vez de ${duracionControl})`);
    if (control.c.estadoDe("jugador", "guardia")?.params.reduccion !== conf.guardia) malas.push("sin secuencia la absorción debía quedar en su valor base");
    // evasión · agua → viento
    b = bancoConcordancia({ conocidas: ["latigo", "paso_nube"] });
    b.c.turno("tecnica", ["latigo"]);
    conf = b.j.statsTecnica("paso_nube");
    b.c.turno("tecnica", ["paso_nube"]);
    est = b.c.estadoDe("jugador", "esquiva");
    if (est?.params.bono !== conf.esquiva + sube(conf.esquiva)) malas.push(`evasión: esperaba ${conf.esquiva + sube(conf.esquiva)} y quedó ${est?.params.bono}`);
    // defensa · viento → agua (un par de bono "qi": el apoyo cobra igual por su rol)
    b = bancoConcordancia({ conocidas: ["paso_nube", "espejo_luna"] });
    b.c.turno("tecnica", ["paso_nube"]);
    conf = b.j.statsTecnica("espejo_luna");
    b.c.turno("tecnica", ["espejo_luna"]);
    est = b.c.estadoDe("jugador", "defensa");
    if (est?.params.bono !== conf.defensa + sube(conf.defensa)) malas.push(`defensa: esperaba ${conf.defensa + sube(conf.defensa)} y quedó ${est?.params.bono}`);
    // precisión de control · viento → agua
    b = bancoConcordancia({ conocidas: ["paso_nube", "filamento"] });
    conf = b.j.statsTecnica("filamento");
    let visto = null;
    const original = b.c.intentarControl.bind(b.c);
    b.c.intentarControl = (mob, cf, dur, frase) => { visto = cf.controlBono; return original(mob, cf, dur, frase); };
    b.c.turno("tecnica", ["paso_nube"]);
    b.c.turno("tecnica", ["filamento"]);
    if (visto !== conf.controlBono + sube(conf.controlBono)) malas.push(`control: esperaba ${conf.controlBono + sube(conf.controlBono)} y usó ${visto}`);
  });
  return malas;
});

PRUEBAS.registrar("combate: completar una secuencia reinicia el contador y no se puede explotar", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    const b = bancoConcordancia({ conocidas: ["paso_nube"] });
    b.c.turno("tecnica", ["paso_nube"]);
    if (b.c.ecoElemental?.elemento !== "viento") malas.push("una técnica pura no dejó su eco");
    const uno = usarTecnicaEnBanco(b, "palma");
    if (!/Concordancia:/.test(uno.texto)) malas.push("la primera secuencia no se anunció");
    if (b.c.ecoElemental !== null) malas.push("tras completar la secuencia el eco debía quedar en cero");
    const dos = usarTecnicaEnBanco(b, "palma");
    if (/Concordancia:/.test(dos.texto)) malas.push("repetir la segunda técnica reutilizó la concordancia sin preparar de nuevo");
    if (dos.dano >= uno.dano) malas.push("el segundo golpe no debía llevar bono");
    // Y sin secuencia, defender rompe la preparación.
    const c2 = bancoConcordancia({ conocidas: ["paso_nube"] });
    c2.c.turno("tecnica", ["paso_nube"]);
    c2.c.turno("defender", []);
    if (c2.c.ecoElemental !== null) malas.push("defender no rompió la preparación");
  });
  return malas;
});

PRUEBAS.registrar("definitivas: el coste sale de una sola constante y rinden más por lanzamiento, menos por qi", () => {
  const malas = [];
  const hibridas = Object.entries(TECNICAS).filter(([, t]) => t.elementos);
  if (!hibridas.length) return ["no hay híbridas"];
  for (const [tid, t] of hibridas) {
    if (!t.definitiva) malas.push(`${tid}: no está marcada como Definitiva`);
    if (t.coste !== costeDefinitiva(t.costeBase, t.elementos.length)) malas.push(`${tid}: el coste ${t.coste} no sale del recargo`);
    if (t.coste <= t.costeBase) malas.push(`${tid}: la Definitiva no cuesta más que su coste base`);
    if (!Number.isFinite(t.enfriamiento) || t.enfriamiento < 0) malas.push(`${tid}: falta el campo enfriamiento`);
  }
  if (costeDefinitiva(10, 3) <= costeDefinitiva(10, 2)) malas.push("un tercer elemento debe encarecer más");
  const puras = ["lanza_nube", "sello"].map(tid => TECNICAS[tid]);
  // Daño medio de una notación de dados ("3d8+3" → 16.5). dadoARango devuelve texto, no números.
  const medio = t => String(t.daño).replace(/ /g, "").split("+").reduce((suma, parte) => {
    if (!parte.includes("d")) return suma + (parseInt(parte, 10) || 0);
    const [n, caras] = parte.split("d").map(x => parseInt(x, 10));
    return suma + (n || 1) * (caras + 1) / 2;
  }, 0);
  if (medio({ daño: "3d8+3" }) !== 16.5) malas.push("el promedio de dados está mal calculado");
  const mejorPuro = Math.max(...puras.map(medio));
  const rendimientoPuro = Math.min(...puras.map(t => medio(t) / t.coste));
  for (const [tid, t] of hibridas.filter(([, t]) => t.tipo === "ofensiva")) {
    if (medio(t) <= mejorPuro) malas.push(`${tid}: pega ${medio(t)} de media y no supera a la mejor pura (${mejorPuro})`);
    if (medio(t) / t.coste >= rendimientoPuro) malas.push(`${tid}: rinde ${(medio(t) / t.coste).toFixed(2)} por qi y debía rendir menos que ${rendimientoPuro.toFixed(2)}`);
  }
  return malas;
});

PRUEBAS.registrar("definitivas: reciben la concordancia con cualquiera de sus elementos y no preparan eco", () => {
  const malas = [];
  conAzarFijo(0.5, () => {
    const casos = [
      // eco previo, Definitiva, secuencia esperada (la de mejor bono entre sus elementos)
      ["latigo", "brasa_vendaval", "Vapor súbito"],     // agua → fuego (daño) gana a agua → viento (crítico)
      ["paso_nube", "loto_vapor", "Avivar las brasas"], // viento → fuego (daño) gana a viento → agua (qi)
      ["palma", "coraza_crisol", "Cimiento cocido"],    // fuego → tierra, por su segundo elemento
    ];
    for (const [previa, definitiva, nombre] of casos) {
      const b = bancoConcordancia({ conocidas: [previa, definitiva] });
      b.c.turno("tecnica", [previa]);
      const r = b.c.turno("tecnica", [definitiva])[0];
      if (!r.includes(`Concordancia: ${nombre}`)) malas.push(`${previa} → ${definitiva}: esperaba "${nombre}"`);
      if (b.c.ecoElemental !== null) malas.push(`${definitiva} dejó un eco: una Definitiva cierra la cadena`);
    }
    const sinPar = bancoConcordancia({ conocidas: ["palma", "aguja_aluvial"] });
    sinPar.c.turno("tecnica", ["palma"]);
    sinPar.c.turno("tecnica", ["aguja_aluvial"]);
    if (sinPar.c.ecoElemental !== null) malas.push("una Definitiva sin secuencia tampoco debe dejar eco");
  });
  return malas;
});

PRUEBAS.registrar("definitivas: la ventaja elemental usa el mejor de sus dos elementos", () => {
  const malas = [];
  const t = TECNICAS.brasa_vendaval;   // fuego + viento
  const casos = [["metal", 1], ["tierra", 1], ["agua", 0], ["viento", 0], ["fuego", 0], [null, 0]];
  for (const [mob, esperada] of casos)
    if (relacionElementalTecnica(t, mob) !== esperada) malas.push(`fuego+viento contra ${mob}: relación ${relacionElementalTecnica(t, mob)}, esperaba ${esperada}`);
  conAzarFijo(0.5, () => {
    for (const [mob, relacion] of [["metal", 1], ["agua", 0]]) {
      const b = bancoConcordancia({ conocidas: ["brasa_vendaval"], elementoMob: mob });
      const base = tirar(b.j.statsTecnica("brasa_vendaval").daño);
      const r = usarTecnicaEnBanco(b, "brasa_vendaval");
      const esperado = Math.max(1, Math.round(base * (1 + relacion * BONO_ELEMENTAL)));
      if (r.dano !== esperado) malas.push(`Brasa contra ${mob}: esperaba ${esperado} y salió ${r.dano}`);
    }
  });
  return malas;
});

PRUEBAS.registrar("definitivas: el campo de enfriamiento ya funciona aunque hoy valga 0", () => {
  const malas = [];
  const t = TECNICAS.aguja_aluvial, original = t.enfriamiento;
  try {
    conAzarFijo(0.5, () => {
      let b = bancoConcordancia({ conocidas: ["aguja_aluvial"] });
      b.c.turno("tecnica", ["aguja_aluvial"]);
      if (b.c.cooldownTecnica("aguja_aluvial") !== 0) malas.push("con enfriamiento 0 no debía quedar en espera");
      t.enfriamiento = 2;
      b = bancoConcordancia({ conocidas: ["aguja_aluvial"] });
      b.c.turno("tecnica", ["aguja_aluvial"]);
      if (b.c.cooldownTecnica("aguja_aluvial") !== 2) malas.push(`con enfriamiento 2 quedó en ${b.c.cooldownTecnica("aguja_aluvial")}`);
      const antes = b.p.qi;
      b.c.turno("tecnica", ["aguja_aluvial"]);
      if (b.p.qi !== antes) malas.push("una Definitiva en enfriamiento gastó qi");
    });
  } finally { t.enfriamiento = original; }
  return malas;
});

PRUEBAS.registrar("interfaz de combate: las híbridas se agrupan bajo DEFINITIVAS", () => {
  const malas = [];
  const j = bancoCombate();
  j.player.tecnicas.aguja_aluvial = { maestria: 0, usos: 0, practica: 0, ramas: { 1: 0, 2: 0, 3: 0 } };
  j.player.tecnicas_preparadas.push("aguja_aluvial");
  j.renderDrawerTecnicas();
  const titulos = Array.from(j.cbDrawerEl.querySelectorAll(".combate-drawer-grupo")).map(x => x.textContent);
  if (!titulos.includes("DEFINITIVAS")) malas.push(`los grupos del panel son ${JSON.stringify(titulos)}`);
  if (titulos.some(x => /CONFLUENCIA/i.test(x))) malas.push("el panel todavía habla de Confluencias");
  return malas;
});

PRUEBAS.registrar("acciones: historial canónico independiente del contenido", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const h = j.normalizarHistorialAcciones();
  if (!h || h.version !== HISTORIAL_ACCIONES_VERSION) malas.push("historial no inicializado/versionado");
  const a = j.registrarAccion(TIPOS_ACCION_NARRATIVA.PERDONAR, {
    clave: "prueba_perdon", importancia: 4, etiquetas: ["violencia", "rival_derrotado"],
    contexto: { objetivo: "rival_derrotado", teniaAlternativa: true },
  });
  if (!a || a.tipo !== "PERDONAR") malas.push("no registró acción canónica");
  if (Object.prototype.hasOwnProperty.call(a, "temas") || Object.prototype.hasOwnProperty.call(a, "dao")) malas.push("la acción contiene interpretación de Dao");
  // El hecho debe sobrevivir aunque desaparezcan por completo los flags/NPC/misión que lo originaron.
  j.flags = {};
  if (!j.tieneAccion(TIPOS_ACCION_NARRATIVA.PERDONAR, { contexto: { objetivo: "rival_derrotado" } })) malas.push("la consulta depende del contenido/flags");
  const mismo = j.registrarAccion(TIPOS_ACCION_NARRATIVA.PERDONAR, { clave: "prueba_perdon", importancia: 5 });
  if (!mismo || mismo.id !== a.id || j.obtenerAcciones({ tipo: "PERDONAR" }).length !== 1) malas.push("clave idempotente duplicó una acción");
  return malas;
});

PRUEBAS.registrar("acciones: filtros, importancia y recuerdos", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  j.registrarAccion(TIPOS_ACCION_NARRATIVA.ROBAR, { clave: "a1", importancia: 2, etiquetas: ["propiedad"] });
  j.registrarAccion(TIPOS_ACCION_NARRATIVA.RESTAURAR, { clave: "a2", importancia: 4, etiquetas: ["memoria"], contexto: { objetoConceptual: "memoria_borrada" } });
  j.registrarAccion(TIPOS_ACCION_NARRATIVA.AYUDAR, { clave: "a3", importancia: 5, etiquetas: ["vinculo"] });
  if (j.obtenerAcciones({ importanciaMinima: 4 }).length !== 2) malas.push("filtro por importancia incorrecto");
  if (j.obtenerAcciones({ etiquetas: "memoria" }).length !== 1) malas.push("filtro por etiqueta incorrecto");
  if (j.obtenerAcciones({ contexto: { objetoConceptual: "memoria_borrada" } }).length !== 1) malas.push("filtro por contexto incorrecto");
  const recuerdos = j.obtenerRecuerdosParaIluminacion({ limite: 1 });
  if (recuerdos.length !== 1 || recuerdos[0].tipo !== "AYUDAR") malas.push("recuerdos no priorizan hechos importantes");
  return malas;
});



// ============================================================================
//  SECCIÓN 9 · CAPA DE INTERFAZ
//  Eventos del navegador, historial de comandos y arranque.
// ============================================================================


// Pruebas de aceptación 3C.1. No implementan progreso narrativo.
PRUEBAS.registrar("3C.1: mundo físico 329 y gates 185/144", () => {
  const r=auditarMundo329(); afirmar(r.ok,r.errores.join(" · "));
});
PRUEBAS.registrar("3C.1: seis atajos y entrada oficial respetan SECTA_INTERIOR", () => {
  const j=PRUEBAS.banco(), antes=JSON.stringify(ROOMS);
  for(const g of GATES_329.filter(g=>g.id==="M12"||g.id.startsWith("ATAJO_ALA_"))){
    afirmar(!j.establecerGate(g.id,true),"Abrió antes de Secta Interior: "+g.id);
    j.gates[g.id]=true;
    afirmar(!pasoGateAbierto(...g.extremos,j.gates),"Estado manipulado eludió invariante");
  }
  j.establecerGate("SECTA_INTERIOR",true);
  for(const g of GATES_329)afirmar(j.establecerGate(g.id,true),"No abre infraestructura autorizada");
  afirmar(recorrerMundo329("patio_raices",j.gates).size===329,"Gates abiertos no alcanzan 329");
  j.establecerGate("SECTA_INTERIOR",false);
  for(const [id,abierto]of Object.entries(j.gates))if(id==="M12"||id.startsWith("ATAJO_ALA_"))afirmar(!abierto,"No cerró dependiente: "+id);
  afirmar(JSON.stringify(ROOMS)===antes,"Gates alteraron topología física");
});
PRUEBAS.registrar("3C.1: cada gate bloquea ambos sentidos sin consumir ecología", () => {
  for(const g of GATES_329)for(const origen of g.extremos){
    const j=PRUEBAS.banco({pos:origen}),dest=g.extremos.find(x=>x!==origen),dir=Object.keys(ROOMS[origen].exits).find(d=>ROOMS[origen].exits[d]===dest),reloj=j.relojEcologico;
    j.cmd_ir(dir);afirmar(j.pos===origen&&j.relojEcologico===reloj,"Paso cerrado permitió movimiento");
    j.establecerGate("SECTA_INTERIOR",true);j.establecerGate(g.id,true);j.cmd_ir(dir);afirmar(j.pos===dest,"Paso abierto no permite movimiento");
  }
});
PRUEBAS.registrar("3C.1: salida regional documentada, no room ni teletransporte", () => {
  afirmar(!ROOMS.ruta_regional_arc2,"Se creó una room externa");
  const j=PRUEBAS.banco({pos:"mojon_regional"}),antes=j.relojEcologico;let mensaje="";j.salida=t=>mensaje=t;j.cmd_ir("sur");
  afirmar(j.pos==="mojon_regional"&&j.relojEcologico===antes,"Transición externa mutó estado");afirmar(mensaje.includes("Arco 2"),"Falta explicación externa");
  const copia=JSON.parse(JSON.stringify(ROOMS));copia.camino.exits.sur="inexistente";afirmar(auditarMundo329(copia).errores.some(e=>e.includes("Destino interno inexistente")),"Excepción permitió destino falso");
});
PRUEBAS.registrar("3C.1: no hay registros, aliases ni estados de NPC o quests legacy", () => {
  const j=PRUEBAS.banco();for(const c of [DESCS_NPC,SALAS_MISIONES_ATLAS,j.player.afinidad])afirmar(Object.keys(c).length===0,"Colección legacy no vacía");
  afirmar(Object.keys(QUESTS).join()===ARC1_IDS.join()&&j.quests.P==='activa',"Catálogo canónico P–M07 ausente");
  afirmar(Object.keys(NOMBRES_NPC).length===32&&Object.keys(NPC_ALIASES).length===32,"Falta catálogo NPC 3C.5");
  for(const r of Object.values(ROOMS))afirmar(!r.npcs.length,"NPC legacy en room");
  afirmar(!j.npcPresente("inexistente"),"Aceptó NPC no registrado");
  afirmar(j.cmd_hablar([]).includes("No hay"),"Sala vacía rompe diálogo");
});
PRUEBAS.registrar("3C.1: Herboristería conserva 12 nodos, P06 seguro y recolección operativa", () => {
  const j=PRUEBAS.banco({pos:"bosque_cauce_oculto"});afirmar(Object.keys(NODOS_HERBORISTERIA).length===12,"Perdió nodos");
  afirmar(NODOS_HERBORISTERIA.sangre_huerto.sala===null&&NODOS_HERBORISTERIA.sangre_huerto.pendiente==="P06","Resolvió P06");
  afirmar(j.plantasEnSala(null).length===0,"Nodo pendiente disponible");
  afirmar(j.profesionDesbloqueada("herboristeria"),"Sistema depende de quest eliminada");
  const idx=j.plantasEnSala().findIndex(n=>n.especie==="claridad"),antes=j.player.inventario.length;
  const prev=Azar.random;try{Azar.random=()=>0;j.recolectarPlanta(idx,"examinar");afirmar(j.player.profesiones.herboristeria.xp===0,"Examinar da XP");j.recolectarPlanta(idx,"cortar hojas exteriores");}finally{Azar.random=prev;}
  afirmar(j.player.inventario.length>antes,"Recolección sin material");afirmar(j.quests.P==='activa'&&Object.keys(j.quests).length===1,"Recolección creó quest");
});
PRUEBAS.registrar("3C.1: rechazo atómico sin leer estado de versiones incompatibles", () => {
  const j=PRUEBAS.banco(),identidades=[j.player,j.rooms,j.atlas,j.flags,j.quests,j.visitadas,j.errantes];
  for(const version of [undefined,0,-1,1,3,"2"]){let tocado=false;const data={saveSchemaVersion:version};for(const k of ["player","pos","quests","salas","visitadas","atlas","errantes"])Object.defineProperty(data,k,{get(){tocado=true;throw Error("Leyó legacy");}});
    afirmar(j.deserializar(data)===false,"Aceptó versión incompatible");afirmar(!tocado,"Accedió al payload legacy");
    afirmar([j.player,j.rooms,j.atlas,j.flags,j.quests,j.visitadas,j.errantes].every((v,i)=>v===identidades[i]),"Reemplazó estado antes de validar");
  }
});
PRUEBAS.registrar("3C.1: leerSlot no migra ni reescribe un save antiguo", () => {
  const j=PRUEBAS.banco(),clave="grulla_prueba_3c1",anterior=localStorage.getItem(clave),raw=JSON.stringify({player:{name:"Nombre antiguo largo sin transformar"},pos:"retirada"});
  try{localStorage.setItem(clave,raw);const d=j.leerSlot(clave);afirmar(localStorage.getItem(clave)===raw,"Reescribió save");afirmar(j.infoPartida(d).includes("Nueva Partida"),"No muestra incompatibilidad");afirmar(j.deserializar(d)===false,"Importó save");}finally{if(anterior===null)localStorage.removeItem(clave);else localStorage.setItem(clave,anterior);}
});
PRUEBAS.registrar("3C.1: save nuevo conserva gates y rechaza posición inválida sin fallback", () => {
  const j=PRUEBAS.banco({pos:"patio"});j.establecerGate("SECTA_INTERIOR",true);j.establecerGate("ATAJO_ALA_CANTERA",true);const d=JSON.parse(JSON.stringify(j.serializar())),k=PRUEBAS.banco();
  afirmar(k.deserializar(d),"Rechazó esquema nuevo");afirmar(k.pos==="patio"&&k.gates.ATAJO_ALA_CANTERA,"Perdió estado de gates");const prev=k.player;d.pos="retirada";
  afirmar(!k.deserializar(d)&&k.player===prev&&k.pos==="patio","Fallback o importación parcial");
});
