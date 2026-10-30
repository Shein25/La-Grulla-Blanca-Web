PRUEBAS.registrar("iluminacion: ESPEJO consume acciones canónicas y no flags de contenido", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  j.flags = {}; // El Espejo debe funcionar aunque desaparezcan todos los flags antiguos.
  j.player.historialAcciones = { version: HISTORIAL_ACCIONES_VERSION, secuencia: 0, eventos: [] };
  j.registrarAccion(TIPOS_ACCION_NARRATIVA.PERDONAR, {
    clave: "prueba_espejo_perdon", importancia: 5,
    etiquetas: ["violencia"], contexto: { objetivo: "rival_derrotado" }
  });
  const base = PREGUNTAS_ILUMINACION.find(q => q.id === "espejo");
  const resuelta = j.resolverPreguntaIluminacion(base);
  if (!resuelta.id.includes("clemencia")) malas.push(`esperaba memoria de clemencia y obtuvo ${resuelta.id}`);
  if (!resuelta.contexto.join(" ").includes("derrotado")) malas.push("la escena no nació del recuerdo canónico");
  if (resuelta.opciones.length <= base.opciones.length) malas.push("no añadió una interpretación específica del recuerdo");
  return malas;
});

PRUEBAS.registrar("iluminacion: historias distintas producen Espejos distintos", () => {
  const malas = [];
  const base = PREGUNTAS_ILUMINACION.find(q => q.id === "espejo");

  const a = PRUEBAS.banco();
  a.player.historialAcciones = { version: HISTORIAL_ACCIONES_VERSION, secuencia: 0, eventos: [] };
  a.registrarAccion(TIPOS_ACCION_NARRATIVA.EJECUTAR, { clave: "hist_a", importancia: 5 });
  const ea = a.resolverPreguntaIluminacion(base);

  const b = PRUEBAS.banco();
  b.player.historialAcciones = { version: HISTORIAL_ACCIONES_VERSION, secuencia: 0, eventos: [] };
  b.registrarAccion(TIPOS_ACCION_NARRATIVA.RESTAURAR, { clave: "hist_b", importancia: 5 });
  const eb = b.resolverPreguntaIluminacion(base);

  if (ea.id === eb.id) malas.push("dos historiales distintos resolvieron el mismo Espejo");
  if (!ea.id.includes("ejecucion")) malas.push(`historial de ejecución resolvió ${ea.id}`);
  if (!eb.id.includes("memoria_restaurada")) malas.push(`historial de restauración resolvió ${eb.id}`);
  return malas;
});

PRUEBAS.registrar("iluminacion: cierre conserva las respuestas para arcos futuros", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  const respuestas = [
    { id: "porque", texto: "Una respuesta de prueba.", temas: { libertad: 3 } },
    { id: "espejo:clemencia", texto: "Otra respuesta.", temas: { proteccion: 2 }, recuerdoAcciones: ["accion_1"] },
  ];
  j.cerrarIluminacion({ libertad: 3, proteccion: 2 }, respuestas);
  if (!Array.isArray(j.player.iluminacion?.respuestas)) malas.push("no guardó respuestas");
  if (j.player.iluminacion.respuestas?.length !== 2) malas.push("cantidad de respuestas incorrecta");
  if (j.player.iluminacion.respuestas?.[1]?.id !== "espejo:clemencia") malas.push("perdió la identidad del recuerdo");
  return malas;
});

PRUEBAS.registrar("ui: Iluminación mantiene el contexto dentro del bloque de elección", () => {
  const malas = [];
  const j = PRUEBAS.banco();
  let configCapturada = null;
  j.preguntarEleccionMultiple = cfg => { configCapturada = cfg; };
  j.preguntaIluminacion(0, {}, []);
  if (!configCapturada?.contextoEnBloque) malas.push("Iluminación no pidió contexto integrado");
  if (!String(configCapturada?.titulo || "").includes("ORIGEN")) malas.push("falta el título de la reflexión");
  if ((configCapturada?.contexto || []).length < 2) malas.push("el contexto compacto no llegó al renderer");
  return malas;
});


// 3C.3B: pruebas contra el renderer real y copias del auditor, sin alterar producción.
const TEST_3C3B={
 copia:()=>JSON.parse(JSON.stringify({rooms:ROOMS,pos:MAPA_POS,etiquetas:MAPA_ETIQ,capas:MAPA_CAPA_SALA,rutas:MAPA_RUTAS,crossovers:MAPA_CROSSOVERS,gates:GATES_329})),
 lab(area="secta_exterior",capa="principal",todos=true){
   const pos=Object.keys(ROOMS).find(id=>areaDeSala(id)===area&&capaMapaDeSala(id)===capa);
   const j=ATLAS_2B.lab({pos,visitadas:todos?Object.keys(ROOMS):[pos]});
   for(const g of GATES_329)j.gates[g.id]=true;
   return j;
 },
 ui(fn){document.getElementById("atlas").close();document.getElementById("atlasBusqueda").value="";try{return fn();}finally{document.getElementById("atlas").close();}},
 sinFecha(j){const d=j.serializar();delete d.fecha;return JSON.stringify(d);}
};
PRUEBAS.registrar("3C.3B A/B/D/I/P: auditor completo y conjuntos físicos",()=>{
 const a=auditarCartografia329();afirmar(a.ok,a.fallos.join("; "));
 afirmar(a.conteos.representadas===355&&a.conteos.rectas===349&&a.conteos.routes===6&&a.conteos.cruces===2,"Cobertura incorrecta");
 afirmar(auditarTopologiaMapa().length===0,"Topología sucia");
});
PRUEBAS.registrar("3C.3B C: escala 12=56, negativos y media celda 42",()=>{
 afirmar(JSON.stringify(puntoMapa(12,-12))==="[56,-56]","Escala incorrecta");
 afirmar(JSON.stringify(puntoMapa(42,0))==="[196,0]","Redondeó waypoint 42");
});
for(const k of Object.keys(MAPA_RUTAS))PRUEBAS.registrar("3C.3B D: route congelada "+k,()=>TEST_3C3B.ui(()=>{
 const r=MAPA_RUTAS[k],j=TEST_3C3B.lab(areaDeSala(r.from),capaMapaDeSala(r.from));j.abrirAtlas();
 const path=[...j.mapaSvg.querySelectorAll('[data-edge]')].find(el=>el.dataset.edge===k);
 afirmar(!!path,"No renderizó route");
 for(const p of r.waypoints)afirmar(path.getAttribute("d").includes(puntoMapa(...p).join(" ")),"Perdió waypoint");
 afirmar(path.tagName.toLowerCase()==="path"&&!path.hasAttribute("tabindex"),"Route interactiva o recta");
}));
for(const c of MAPA_CROSSOVERS)PRUEBAS.registrar("3C.3B E: descubrimiento no filtra "+c.id,()=>TEST_3C3B.ui(()=>{
 const j=TEST_3C3B.lab(c.area,c.capa),inferior=c.arista_inferior.split("|"),superior=c.arista_superior.split("|");
 j.visitadas=new Set(inferior);j.pos=inferior[0];
 for(const id of inferior)j.atlas.salas[id].salidas=Object.entries(ROOMS[id].exits).filter(([,to])=>claveAristaMapa(id,to)===c.arista_inferior);
 j.abrirAtlas();
 const path=()=>[...j.mapaSvg.querySelectorAll('[data-edge]')].find(el=>el.dataset.edge===c.arista_inferior);
 afirmar(path()&&!path().hasAttribute("data-crossovers")&&(path().getAttribute("d").match(/M /g)||[]).length===1,"Hueco revela superior oculta");
 j.visitadas=new Set([...inferior,...superior]);for(const id of j.visitadas)j.atlas.salas[id].salidas=Object.entries(ROOMS[id].exits);
 j.renderAtlas();afirmar(path().dataset.crossovers===c.id,"No aplicó hueco");
 afirmar((path().getAttribute("d").match(/M /g)||[]).length===2,"Hueco incorrecto");
 for(const p of c.renderer.extremos_interrupcion)afirmar(path().getAttribute("d").includes(puntoMapa(...p).join(" ")),"Extremo hueco alterado");
 afirmar(!j.mapaSvg.querySelector('[data-crossover],.junction'),"Creó nodo crossover");
 afirmar([...j.mapaSvg.querySelectorAll('[data-edge]')].every(el=>!el.hasAttribute("tabindex")&&!el.hasAttribute("role")),"Conectividad interactiva en paths");
}));
PRUEBAS.registrar("3C.3B F/G: 22 hojas completas sin fugas ni cartografía pendiente",()=>TEST_3C3B.ui(()=>{
 const j=TEST_3C3B.lab();j.abrirAtlas();const hojas=[...new Set(Object.keys(ROOMS).map(id=>areaDeSala(id)+"|"+capaMapaDeSala(id)))],edges=new Set();
 afirmar(hojas.length===22,"Hojas");
 for(const h of hojas){const [area,capa]=h.split("|");afirmar(j.cambiarVistaAtlas({area,capa}),"Rechazó hoja conocida");
  const visibles=[...j.mapaSvg.querySelectorAll('[data-room]')];afirmar(visibles.length===Object.keys(ROOMS).filter(id=>areaDeSala(id)===area&&capaMapaDeSala(id)===capa).length,"Cobertura de nodos incompleta");
  for(const el of visibles)afirmar(areaDeSala(el.dataset.room)===area&&capaMapaDeSala(el.dataset.room)===capa,"Fuga de hoja");
  for(const el of j.mapaSvg.querySelectorAll('[data-edge]')){edges.add(el.dataset.edge);for(const id of el.dataset.edge.split("|"))afirmar(areaDeSala(id)===area&&capaMapaDeSala(id)===capa,"Fuga de arista");}
  afirmar(!document.getElementById("atlasLista").textContent.includes("Cartografía pendiente"),"Fallback");
 }
 afirmar(edges.size===355,"Render no cubre exactamente 355");
}));
PRUEBAS.registrar("3C.3B F/L: límites sólo usan geometría visible y incluyen negativos",()=>TEST_3C3B.ui(()=>{
 for(const area of ["aguas_barrancos","valle"]){document.getElementById("atlas").close();const j=TEST_3C3B.lab(area);j.abrirAtlas();afirmar(j.atlasLimites.minY===-56,"Recortó route negativa");if(area==="aguas_barrancos")afirmar(j.atlasLimites.minX===-56,"Recortó col negativa");}
 document.getElementById("atlas").close();
 const j=TEST_3C3B.lab("aguas_barrancos","principal",false);j.atlas.salas[j.pos].salidas=[];j.abrirAtlas();
 const p=posicionDibujoMapa(j.pos);afirmar(j.atlasLimites.minX===p[0]&&j.atlasLimites.minY===p[1],"Geometría desconocida expande cámara");
}));
PRUEBAS.registrar("3C.3B H: hoja desconocida del mismo área y de área conocida bloqueada",()=>TEST_3C3B.ui(()=>{
 const j=ATLAS_2B.lab({pos:"formaciones_camara_central",visitadas:["formaciones_camara_central","interior_umbral_sur"]});j.abrirAtlas();
 afirmar(j.hojaAtlasNavegable("formaciones","principal")&&!j.hojaAtlasNavegable("formaciones","sumergido"),"Conocimiento por área excesivo");
 afirmar(!j.cambiarVistaAtlas({area:"formaciones",capa:"sumergido"}),"Cargó hoja no visitada");
 const t=j.mapaSvg.querySelector('[data-map-target="formaciones_sala_mapas"]');afirmar(t&&t.getAttribute("aria-disabled")==="true","Vertical desconocida consultable");
 afirmar(!t.textContent.includes("Nivel inferior"),"Reveló capa desconocida");
 j.pos="interior_umbral_sur";j.sincronizarVistaAtlas();afirmar(!j.cambiarVistaAtlas({area:"formaciones",capa:"sumergido"}),"Área conocida permite capa desconocida");
 j.pos="formaciones_sala_mapas";afirmar(j.hojaAtlasNavegable("formaciones","sumergido"),"Hoja física no navegable");
}));
PRUEBAS.registrar("3C.3B H/M: selector secundario sólo capas conocidas",()=>TEST_3C3B.ui(()=>{
 const j=ATLAS_2B.lab({pos:"terraza_cantera",visitadas:["terraza_cantera"]});j.abrirAtlas();
 const sel=document.getElementById("atlasCapa");afirmar(sel.hidden,"Selector con una capa");
 j.visitadas.add("camara_hierro");j.renderAtlas();afirmar(!sel.hidden&&sel.options.length===2,"Capas conocidas incorrectas");
 afirmar(![...sel.options].some(o=>o.value==="profundo"||o.value==="superior"),"Revela hoja desconocida/vacía");
 const p=j.pos,t=j.turnoGlobal;afirmar(j.elegirCapaAtlas("sumergido")&&j.pos===p&&j.turnoGlobal===t,"Selector mueve jugador");j.centrarCapaAtlas();afirmar(j.atlasCapaVista==="principal","MI ZONA");
}));
for(const g of GATES_329.filter(g=>g.id.startsWith("ATAJO_ALA_")))PRUEBAS.registrar("3C.3B K: cuatro estados "+g.id,()=>TEST_3C3B.ui(()=>{
 const profundo=g.extremos.find(id=>areaDeSala(id)==="primera_ala"),sup=g.extremos.find(id=>id!==profundo);
 const j=ATLAS_2B.lab({pos:sup,visitadas:[sup]});j.abrirAtlas();
 afirmar(!j.mapaSvg.querySelector(`[data-map-target="${profundo}"]`),"Atajo cerrado visible superficie");
 afirmar(!document.getElementById("atlasDetalle").textContent.includes("Primera Ala"),"Filtra Primera Ala");
 j.pos=profundo;j.visitadas=new Set([profundo]);j.atlas.salas={};j.recordarAtlas();j.reiniciarVistaAtlas();j.renderAtlas();
 let el=j.mapaSvg.querySelector(`[data-map-target="${sup}"]`);afirmar(el&&el.getAttribute("aria-label").includes("Paso cerrado"),"Profundo sin paso cerrado");
 afirmar(!el.textContent.includes(ROOMS[sup].name)&&el.getAttribute("aria-disabled")==="true","Destino cerrado revelado");
 j.gates.SECTA_INTERIOR=true;j.establecerGate(g.id,true);j.renderAtlas();el=j.mapaSvg.querySelector(`[data-map-target="${sup}"]`);
 afirmar(el&&el.textContent.includes("zona sin explorar")&&el.getAttribute("aria-disabled")==="true","Abrir gate descubre hoja");
 j.visitadas.add(sup);j.renderAtlas();el=j.mapaSvg.querySelector(`[data-map-target="${sup}"]`);const p=j.pos,t=j.turnoGlobal;
 el.dispatchEvent(new Event("click",{bubbles:true}));afirmar(j.pos===p&&j.turnoGlobal===t&&j.atlasAreaVista===areaDeSala(sup),"Consulta mueve o no cambia vista");
 j.establecerGate("SECTA_INTERIOR",false);afirmar(!j.gates.M12&&GATES_329.filter(x=>x.id.startsWith("ATAJO_ALA_")).every(x=>!j.gates[x.id]),"Invariante global gate");
}));
PRUEBAS.registrar("3C.3B J/N: gate normal, consulta y save sin estado visual",()=>TEST_3C3B.ui(()=>{
 const g=GATES_329.find(g=>g.id==="SECTA_INTERIOR"),j=ATLAS_2B.lab({pos:g.extremos[0],visitadas:g.extremos});
 const antes=TEST_3C3B.sinFecha(j),exits=JSON.stringify(ROOMS);j.abrirAtlas();
 const el=j.mapaSvg.querySelector(`[data-map-target="${g.extremos[1]}"]`);afirmar(el.getAttribute("aria-label").includes("Paso cerrado"),"Estado gate ausente");
 const pos=j.pos,turno=j.turnoGlobal;el.dispatchEvent(new Event("click",{bubbles:true}));
 afirmar(j.pos===pos&&j.turnoGlobal===turno,"Consulta cruzó físicamente gate");
 afirmar(TEST_3C3B.sinFecha(j)===antes&&JSON.stringify(ROOMS)===exits,"Consulta muta save/topología");
 const d=j.serializar();afirmar(SAVE_SCHEMA_VERSION===2&&validarSave329(d).length===0,"Save schema2 inválido");
 const k=PRUEBAS.banco();delete k.renderAtlas;afirmar(k.deserializar(d),"Load rechazado");k.reiniciarVistaAtlas();k.renderAtlas();afirmar(k.atlasAreaVista===areaDeSala(k.pos)&&k.atlasCapaVista===capaMapaDeSala(k.pos),"Load no vuelve a hoja física");
}));
PRUEBAS.registrar("3C.3B L: cámara real, ancla, pan, reveal, resize y MI ZONA",()=>TEST_3C3B.ui(()=>{
 const j=TEST_3C3B.lab("aguas_barrancos");j.abrirAtlas();j.ajustarCamaraAtlas();
 const vista=document.getElementById("atlasVista"),rect=vista.getBoundingClientRect(),antes=TEST_3C3B.sinFecha(j);
 afirmar(rect.width>0&&j.atlasVentana.vw>0,"Cámara sin dimensiones reales");
 const mundo=()=>[j.atlasCamara.cx-j.atlasVentana.vw/2+rect.width*.4/j.atlasEscala,j.atlasCamara.cy-j.atlasVentana.vh/2+rect.height*.4/j.atlasEscala];
 const ancla=mundo();j.zoomMapaAtlas(1.35,rect.left+rect.width*.4,rect.top+rect.height*.4);
 afirmar(mundo().every((x,i)=>Math.abs(x-ancla[i])<1e-6),"Zoom pierde ancla");
 const cx=j.atlasCamara.cx;j.desplazarMapaAtlas(20,10);afirmar(j.atlasCamara.cx!==cx&&j.atlasCamaraManual,"Pan no mueve cámara");
 j.desplazarMapaAtlas(100000,100000);let vb=j.mapaSvg.getAttribute("viewBox").split(" ").map(Number);
 afirmar(vb[0]<=-56&&vb[1]<=-56&&vb[0]+vb[2]>=-56&&vb[1]+vb[3]>=-56,"Extremos negativos inaccesibles");
 const el=j.mapaSvg.querySelector('[data-room="aguas_senda_cauce"]')||j.mapaSvg.querySelector('[data-room]');j.revelarEnMapaAtlas(el);
 const bb=el.getBBox();vb=j.mapaSvg.getAttribute("viewBox").split(" ").map(Number);
 afirmar(bb.x>=vb[0]&&bb.y>=vb[1]&&bb.x+bb.width<=vb[0]+vb[2]&&bb.y+bb.height<=vb[1]+vb[3],"Reveal deja nodo fuera");
 const ancho=vista.style.width;vista.style.width="420px";j.ajustarCamaraAtlas();afirmar(Math.abs(j.atlasVentana.vw*j.atlasEscala-vista.clientWidth)<1e-6,"Resize desajustado");vista.style.width=ancho;
 j.centrarCapaAtlas();afirmar(!j.atlasCamaraManual&&j.atlasSeleccion===j.pos,"MI ZONA no centra");
 afirmar(TEST_3C3B.sinFecha(j)===antes,"Cámara altera partida");
}));
const NEGATIVOS_3C3B=[
 ["room ausente",d=>delete d.pos.patio],
 ["label duplicado",d=>d.etiquetas.registro=d.etiquetas.camino],
 ["coordenada duplicada",d=>d.pos.registro=d.pos.camino],
 ["route diagonal",d=>d.rutas['granero_valle|terrazas_sur'].waypoints[0][0]++],
 ["route huérfana",d=>d.rutas['camino|patio']=d.rutas['granero_valle|terrazas_sur']],
 ["route sobre room",d=>d.pos.aguas_senda_bosque=[24,0]],
 ["dirección inicial",d=>d.rutas['granero_valle|terrazas_sur'].waypoints[0]=[48,30]],
 ["entrada final",d=>d.rutas['granero_valle|terrazas_sur'].waypoints[3]=[12,12]],
 ["crossover ausente/cruce no declarado",d=>d.crossovers.pop()],
 ["crossover extra",d=>d.crossovers.push({...d.crossovers[0],id:'EXTRA'})],
 ["crossover duplicado",d=>d.crossovers.push(d.crossovers[0])],
 ["crossover coordenada falsa",d=>d.crossovers[0].coordenada=[25,0]],
 ["crossover en room/endpoint",d=>d.crossovers[0].coordenada=d.pos.aguas_paso_piedras],
 ["falso junction",d=>d.crossovers[0].crea_conectividad=true],
 ["gate alterado",d=>d.gates[0].extremos[0]='patio'],
 ["capa alterada",d=>d.capas.registro='superior'],
 ["externa convertida en room",d=>d.rooms.ruta_regional_arc2={area:'valle',exits:{norte:'mojon_regional'}}],
 ["tramo compartido",d=>d.rutas['aguas_cauce_alto|aguas_paso_piedras'].waypoints=[[24,24],[24,0],[30,0],[30,-12],[-12,-12],[-12,0]]]
];
for(const [nombre,mutar]of NEGATIVOS_3C3B)PRUEBAS.registrar("3C.3B P negativo: "+nombre,()=>{
 const d=TEST_3C3B.copia();mutar(d);const a=auditarCartografia329(d);afirmar(!a.ok&&a.fallos.length>0,"Auditor aceptó "+nombre);
});
for(const [nombre,mutar]of [
 ["exit no recíproco",d=>delete d.rooms.camino.exits.norte],
 ["dirección inválida",d=>d.rooms.camino.exits.noreste='registro'],
 ["destino inexistente",d=>d.rooms.camino.exits.norte='fantasma'],
 ["cardinal intra-área cambia capa",d=>d.capas.camino='superior']
])PRUEBAS.registrar("3C.3B O negativo: "+nombre,()=>{
 const d=TEST_3C3B.copia();mutar(d);afirmar(auditarTopologiaMapa(d).length>0,"Topología aceptó "+nombre);
});

// 3C.5: regresión del núcleo NPC y de las dos formas exactas de persistencia.
PRUEBAS.registrar("3C.5: matriz REV3, tránsito por NPC y rutas físicas", () => {
  const defs=Object.values(NPC_DEF),categorias={},clasificacion={};
  afirmar(defs.length===32 && new Set(defs.map(n=>n.id)).size===32,"Identidades");
  for(const n of defs){
    categorias[n.categoria]=(categorias[n.categoria]||0)+1;
    clasificacion[n.sala_inicial_clasificacion]=(clasificacion[n.sala_inicial_clasificacion]||0)+1;
    afirmar(!!ROOMS[n.sala_inicial] && n.posicion_valida.includes(n.sala_inicial),n.id+": origen inválido");
    afirmar(!n.transito_tecnico.includes(n.sala_inicial),n.id+": origen es tránsito");
    afirmar(n.transito_tecnico.every(r=>!n.territorio_normal.includes(r)),n.id+": tránsito superpuesto");
    afirmar(new Set([...n.territorio_normal,...n.transito_tecnico]).size===n.posicion_valida.length &&
      n.posicion_valida.every(r=>n.territorio_normal.includes(r)||n.transito_tecnico.includes(r)),n.id+": posiciones");
    const internos=n.rutas.flatMap(r=>r.slice(1,-1));
    afirmar(n.transito_tecnico.every(r=>internos.includes(r)),n.id+": tránsito sin ruta interna");
    for(const ruta of n.rutas){
      afirmar(ruta.every(r=>n.posicion_valida.includes(r)),n.id+": ruta fuera de territorio");
      for(let i=1;i<ruta.length;i++)afirmar(Object.values(ROOMS[ruta[i-1]].exits).includes(ruta[i]),n.id+": tramo sin salida");
    }
    afirmar(Object.keys(n.conocimiento_inicial).sort().join()===Array.from({length:10},(_,i)=>'R'+(i+1)).sort().join(),n.id+": revelaciones");
  }
  afirmar(JSON.stringify(categorias)===JSON.stringify({autoridad:7,intermedio:7,funcional:12,companero:6}),"Categorías REV3");
  afirmar(clasificacion['CANÓNICO']===14 && clasificacion.ELECCION_TECNICA_3C5===18,"Salas iniciales REV3");
  afirmar(NPC_DEF.wei_jian.transito_tecnico.includes('pabellon_disciplina') && NPC_DEF.qiao_ren.sala_inicial==='pabellon_disciplina',"Tránsito compartido pabellón");
  afirmar(NPC_DEF.gao_shun.transito_tecnico.includes('patio') && NPC_DEF.mei_lian.sala_inicial==='patio',"Tránsito compartido patio");
});
PRUEBAS.registrar("3C.5: alias exacto, presencia única, comandos y Atlas observado", () => {
  const j=PRUEBAS.banco({pos:'pabellon_disciplina'}),id='qiao_ren',origen=j.pos;
  afirmar(Object.keys(j.posicionNPC).length===32 && Object.keys(j.conocimientoNPC).length===32,"Runtime incompleto");
  afirmar(resolverNPC('HAN')==='han_qiao' && resolverNPC('Mei_Shufen')==='mei_shufen',"Aliases válidos");
  for(const token of ['qiao','ren','rui','wen','tao','lian','chen','bo','shun','ma','luo','mei'])
    afirmar(resolverNPC(token)===null,token+": token ambiguo");
  afirmar(resolverNPC('Qiao Ren')===id && resolverNPC('QIAO_REN')===id,"Normalización del nombre");
  afirmar(resolverNPC('qiao ren extra')===null,"Coincidencia parcial");
  afirmar(j.npcPresente(id,origen) && j.npcsEnSala(origen).includes(id),"Presencia inicial");
  afirmar(j.cmd_hablar(['qiao']).includes('Aquí puedes hablar'),"Alias ambiguo habló");
  afirmar(j.cmd_entregar(['qiao']).includes('no hay nadie'),"Alias ambiguo recibió");
  const desc=j.cmd_examinar(['qiao','ren']);afirmar(desc.includes(NOMBRES_NPC[id]) && desc.includes(NPC_DEF[id].rol),"Examinar sin descripción cerrada");
  j.visitadas.add(origen);Juego.prototype.recordarAtlas.call(j);
  afirmar(j.atlas.personas[id].sala===origen,"Último avistamiento");
  const destino='corredor_norte';afirmar(j.aplicarMovimientoNPC(id,destino),"Paso físico");
  afirmar(!j.npcPresente(id,origen) && j.npcPresente(id,destino) && !j.npcsEnSala(origen).includes(id),"Presencia duplicada");
  afirmar(j.atlas.personas[id].sala===origen && j.atlas.salas[origen].npcs.includes(id),"Movimiento filtró al Atlas");
  j.pos=destino;j.visitadas.add(destino);Juego.prototype.recordarAtlas.call(j);
  afirmar(j.atlas.personas[id].sala===destino && j.atlas.salas[destino].npcs.includes(id),"Nueva observación");
});
PRUEBAS.registrar("3C.5: movimiento explícito, gates y anclaje", () => {
  const j=PRUEBAS.banco(),id='qiao_ren';j.posicionNPC[id].sala='escalinata_interior';
  afirmar(!j.puedeMoverNPC(id,'pabellon_disciplina','interior_umbral_sur'),"Origen falso");
  afirmar(!j.aplicarMovimientoNPC(id,'interior_umbral_sur'),"Cruzó SECTA_INTERIOR cerrado");
  j.establecerGate('SECTA_INTERIOR',true);
  afirmar(j.puedeMoverNPC(id,'escalinata_interior','interior_umbral_sur'),"Gate abierto bloqueado");
  afirmar(!j.aplicarMovimientoNPC(id,'interior_sala_consejo'),"Teletransporte permitido");
  afirmar(j.aplicarMovimientoNPC(id,'interior_umbral_sur'),"Paso abierto falló");
  j.posicionNPC[id].anclaje={room:'interior_umbral_sur',hasta:{evento:'opaco'}};
  afirmar(!j.aplicarMovimientoNPC(id,'interior_patio_blanco'),"Anclaje ignorado");
  j.posicionNPC.wei_jian.sala='escalinata_interior';j.establecerGate('SECTA_INTERIOR',false);
  afirmar(!j.aplicarMovimientoNPC('wei_jian','interior_umbral_sur'),"Wei Jian cruzó gate cerrado");
  afirmar(!j.aplicarMovimientoNPC('inexistente','patio'),"ID fantasma");
});
PRUEBAS.registrar("3C.5: save NPC v1, legacy puro y corrupción atómica", () => {
  const j=PRUEBAS.banco(),s=j.serializar(),clone=x=>JSON.parse(JSON.stringify(x));
  afirmar(SAVE_SCHEMA_VERSION===2 && s.npc_version===1 && validarSave329(s).length===0,"Save NPC v1");
  s.conocimientoNPC.qiao_ren.R1='CONFIRMADO';s.posicionNPC.qiao_ren.anclaje={room:s.posicionNPC.qiao_ren.sala,hasta:{evento:'futuro'}};
  afirmar(j.conocimientoNPC.qiao_ren.R1!=='CONFIRMADO' && j.posicionNPC.qiao_ren.anclaje===null,"Snapshot compartido");
  const cargado=PRUEBAS.banco();afirmar(cargado.deserializar(s),"Carga NPC v1");
  afirmar(cargado.conocimientoNPC.qiao_ren.R1==='CONFIRMADO' && cargado.posicionNPC.qiao_ren.anclaje.hasta.evento==='futuro',"Roundtrip NPC v1");
  const legacy=clone(s);delete legacy.npc_version;delete legacy.posicionNPC;delete legacy.conocimientoNPC;
  const antes=JSON.stringify(legacy);afirmar(validarSave329(legacy).length===0,"Legacy rechazado");
  afirmar(cargado.deserializar(legacy) && JSON.stringify(legacy)===antes,"Legacy mutado");
  afirmar(cargado.conocimientoNPC.qiao_ren.R1===NPC_DEF.qiao_ren.conocimiento_inicial.R1 && cargado.posicionNPC.qiao_ren.anclaje===null,"Defaults legacy");
  const pruebas=[
    d=>delete d.npc_version,d=>delete d.posicionNPC,d=>delete d.conocimientoNPC,d=>d.npc_version=2,
    d=>delete d.posicionNPC.qiao_ren,d=>d.posicionNPC.fantasma={sala:'patio',anclaje:null},
    d=>d.posicionNPC.qiao_ren.sala='inexistente',d=>d.posicionNPC.qiao_ren.sala='patio_raices',
    d=>d.posicionNPC.qiao_ren.anclaje={room:'patio',hasta:null},d=>d.posicionNPC.qiao_ren.anclaje={room:'inexistente',hasta:null},
    d=>delete d.conocimientoNPC.qiao_ren.R1,d=>d.conocimientoNPC.qiao_ren.R11='SABE',
    d=>d.conocimientoNPC.qiao_ren.R1='RUMOR',d=>d.extra=true
  ];
  for(const [i,mutar] of pruebas.entries()){
    const malo=clone(s),estado=JSON.stringify(cargado.serializar());mutar(malo);
    afirmar(validarSave329(malo).length>0,'Corrupción '+i+' aceptada');
    afirmar(!cargado.deserializar(malo),'Corrupción '+i+' cargada');
    const nuevo=cargado.serializar();delete nuevo.fecha;
    const previo=JSON.parse(estado);delete previo.fecha;
    afirmar(JSON.stringify(nuevo)===JSON.stringify(previo),'Corrupción '+i+' mutó estado');
  }
});

// 3C.6 · regresiones con partidas aisladas, sin mutar la sesión real.
PRUEBAS.registrar('3C.6: mundo, admisión, equipo y diagnóstico determinista',()=>{
  const mundo=auditarMundo329();afirmar(mundo.ok&&mundo.rooms===329&&mundo.areas===17&&mundo.exits===787,'Topología alterada');
  const j=PRUEBAS.banco({pos:'patio_raices'});afirmar(j.quests.P==='activa'&&j.player.facciones.grulla_blanca.estado==='inactivo','Prólogo ausente');
  afirmar(!j.player.inventario.includes('uniforme')&&!j.player.inventario.includes('espada_madera'),'Equipo prematuro');
  j.pos='descansillo';j.entrarSala();j.entrarSala();
  afirmar(j.player.inventario.filter(x=>x==='uniforme').length===1&&j.player.inventario.filter(x=>x==='espada_madera').length===1,'Equipo duplicado');
  j.pos='registro';j.cmd_hablar(['tao','ming']);afirmar(j.quests.P==='hecha'&&j.quests.M01==='activa','Admisión fallida');
  let indice=0;const decisiones=['1','2','3','2'];j.preguntarEleccionMultiple=({callback})=>callback(decisiones[indice++]);
  j.creacionRaiz('Prueba','campesino');afirmar(indice===4&&j.player.raiz==='metal','Desempate raíz');
});
PRUEBAS.registrar('3C.6: M01–M03 físico, cadáver tutorial y evaluación con vaso lleno',()=>{
  const j=PRUEBAS.banco();j.pos='registro';j.cmd_hablar(['tao','ming']);
  j.pos='sala_jade';j.cmd_examinar(['muro']);j.pos='patio_cabanas';j.cmd_hablar(['madre','wen']);
  j.pos='dormitorio_externos';j.entrarSala();afirmar(j.quests.M01==='hecha','M01 sin entrada física');
  j.pos='oficina_servicios';j.cmd_hablar(['tao','ming']);
  j.pos='deposito_comun';j.entrarSala();const rata=j.vivos.find(m=>m.errante_id==='rata_despensa');afirmar(!!rata,'Rata ausente');
  Juego.prototype.recordarAtlas.call(j);
  afirmar(!j.atlas.criaturas.rata_qi&&!j.atlas.salas.deposito_comun.mobs.includes('rata_qi'),
    'La rata tutorial filtró al Atlas o bestiario');
  j.registrarCadaver(rata);j.recompensas('rata_qi',rata);
  afirmar(j.flags.arc1.hitos.M02_RATA_RESUELTA&&rata.loot.length===0,'Rata reaparece o deja botín');
  delete j.cadaveres.deposito_comun;j.entrarSala();const cuerpo=j.cadaveresEnSala()[0];
  afirmar(!!cuerpo?.arc1_tutorial&&j.flags.arc1.hitos.M02_CADAVER_RECREADO,'No recuperó cadáver');
  afirmar(j.recolectarCadaver(0,'pelo').includes('no se extrae'),'Extracción tutorial permitida');
  j.pos='sala_anatomica';j.cmd_hablar(['chen','bo']);j.pos='deposito_comun';j.cmd_examinar(['cadaver']);
  j.pos='oficina_servicios';j.cmd_hablar(['tao','ming']);
  afirmar(j.quests.M02==='hecha'&&j.player.facciones.grulla_blanca.saldo===1&&j.player.facciones.grulla_blanca.merito===0,'Cierre M02');
  j.pos='sala_formas';j.cmd_hablar(['shen','baojun']);j.pos='patio_marcial';j.entrarSala();
  const doll=j.vivos.find(m=>m.arc1_muneco);afirmar(!!doll&&j.player.tecnicas_preparadas.includes('piel_cobre'),'Muñeco o técnica ausente');
  j.registrarUso('piel_cobre',[],1,doll);j.pos='patio_respiracion';j.vivos=[];j.player.qi=j.player.qi_max;
  afirmar(!j.compruebaPuerta(2).ok,'Consagró antes de evaluación y promoción');j.cmd_meditar([]);
  afirmar(j.flags.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA&&j.player.etapa===1,'Evaluación no se disparó antes de vaso lleno');
  j.pos='pabellon_disciplina';j.cmd_hablar(['qiao','ren']);j.pos='patio_respiracion';j.vivos=[];j.cmd_meditar([]);
  afirmar(j.quests.M03==='hecha'&&j.player.etapa===2&&j.player.qi===25&&j.flags.arc1.estado==='LII_TERRITORIO','Promoción y qi');
  afirmar(!validarSave329(j.serializar()).length,'Save después de M03');
});
PRUEBAS.registrar('3C.6: M04–M07, evidencia inmediata, economía y tercera etapa',()=>{
  const j=PRUEBAS.banco();j.quests={P:'hecha',M01:'hecha',M02:'hecha',M03:'hecha'};
  const a=j.flags.arc1;a.rangoInstitucional='DISCIPULO_EXTERNO';a.estadoAfiliacion='MIEMBRO';a.primerServicioFormal=true;a.evaluacionCirculacion='SUPERADA';
  j.player.etapa=2;j.player.qi_max=45;j.reconciliarProgresionArc1();
  j.pos='puesto_valle';j.gestionarMisionesNpc('jiang_rui');j.pos='puerta';j.gestionarMisionesNpc('gao_shun');
  j.pos='bosque_refugio_patrulla';j.entrarSala();j.examinarEscenaArc1(j.pos,'registro');
  j.pos='puesto_valle';j.gestionarMisionesNpc('jiang_rui');afirmar(j.quests.M04==='hecha'&&j.player.facciones.grulla_blanca.merito===1,'M04');
  j.pos='oficina_logistica';j.gestionarMisionesNpc('duan_shibo');j.pos='mercado_valle';j.entrarSala();
  j.pos='sauces_casa_comunal';j.gestionarMisionesNpc('xu_an');j.examinarEscenaArc1(j.pos,'registros');
  j.pos='sauces_casa_huespedes';j.entrarSala();afirmar(j.quests.M05==='hecha'&&j.player.inventario.filter(x=>x==='pildora_consolidacion').length===1,'M05');
  j.registrarEvidenciaArc1('bosque_collado_alto','huellas');afirmar(j.quests.M06==='activa','Primera evidencia no activó M06');
  j.registrarEvidenciaArc1('aguas_senda_bosque','vegetacion');afirmar(j.quests.M06==='activa'&&a.evidenciaTerritorial.sospechaFuerte,'Dos tipos cierran antes de tiempo');
  j.registrarEvidenciaArc1('aguas_cauce_alto','corriente');afirmar(j.quests.M06==='hecha'&&a.evidenciaTerritorial.nivel==='SUFICIENTE','Tres tipos no cerraron M06');
  j.pos='pabellon_disciplina';j.preguntarEleccionMultiple=({callback})=>callback('2');j.gestionarMisionesNpc('qiao_ren');
  afirmar(j.quests.M07==='hecha'&&a.informe.corregida&&a.informe.formulacionFinal==='CAUTA','Informe fuerte corregido');
  const f=j.player.facciones.grulla_blanca;afirmar(f.saldo===11&&f.merito===5&&j.player.comprension>=1,'Recompensa aislada (sin M02 en fixture)');
  const antes=[f.saldo,f.merito,j.player.comprension,j.player.inventario.length];j.reconciliarProgresionArc1();j.reconciliarProgresionArc1();
  afirmar(JSON.stringify(antes)===JSON.stringify([f.saldo,f.merito,j.player.comprension,j.player.inventario.length]),'Recompensas duplicadas');
  j.player.qi=45;j.pos='patio_respiracion';j.vivos=[];j.cmd_meditar([]);
  afirmar(j.player.etapa===3&&j.player.qi===45&&a.estado==='LIII_INVESTIGACION'&&j.gates.SECTA_INTERIOR,'Consagración LIII');
  afirmar(!j.player.inventario.includes('pildora_consolidacion')&&!j.gates.M12&&
    Object.keys(j.gates).filter(x=>x.startsWith('ATAJO_ALA_')).every(x=>!j.gates[x]),'Gate o píldora tras consagrar');
});
PRUEBAS.registrar('3C.6: migración legacy tres etapas e interior previo',()=>{
  for(const etapa of [1,2,3]){
    const j=PRUEBAS.banco();const legacy=j.serializar();delete legacy.flags.arc1;legacy.quests={};
    legacy.player.etapa=etapa;legacy.player.qi_max=VASO_ETAPA[etapa];legacy.player.qi=10;
    legacy.player.facciones.grulla_blanca.saldo=7;legacy.player.facciones.grulla_blanca.merito=2;
    if(etapa===3){legacy.gates.SECTA_INTERIOR=true;legacy.gates.M12=true;}
    const k=PRUEBAS.banco(),antes=JSON.stringify(legacy);afirmar(k.deserializar(legacy),'Rechazó legacy '+etapa);
    afirmar(JSON.stringify(legacy)===antes&&k.player.qi===10&&k.player.etapa===etapa,'Mutó legacy '+etapa);
    afirmar(['P','M01','M02','M03'].every(id=>k.quests[id]==='hecha')&&
      k.player.facciones.grulla_blanca.saldo===7&&k.player.facciones.grulla_blanca.merito===2,'Premió dos veces '+etapa);
    afirmar(k.player.tecnicas.piel_cobre&&k.player.profesiones.examen.desbloqueada,'Habilidades legacy '+etapa);
    if(etapa===3)afirmar(k.flags.arc1.cultivoLIIIPreexistente&&k.flags.arc1.legacySectaInteriorPrevia&&
      !k.gates.SECTA_INTERIOR&&!k.gates.M12,'Gates legacy');
    afirmar(!validarSave329(k.serializar()).length,'Save migrado '+etapa);
  }
});
PRUEBAS.registrar('3C.6: normalización, corrupción y rechazo atómico',()=>{
  const j=PRUEBAS.banco(),clone=x=>JSON.parse(JSON.stringify(x));let d=j.serializar();
  d.quests.FANTASMA='hecha';d.quests.M07='hecha';
  d.flags.arc1.evidenciaTerritorial={tipos:['DESPLAZAMIENTO_FAUNA'],nivel:'CONCLUYENTE',sospechaFuerte:false};
  afirmar(j.deserializar(d),'Normalizador rechazó datos saneables');
  afirmar(!j.quests.FANTASMA&&!j.quests.M07&&!j.flags.arc1.informeFronteraAceptado&&
    j.flags.arc1.evidenciaTerritorial.nivel==='INSUFICIENTE','Promoción o evidencia inventada');
  const antes=j.serializar();d=clone(antes);d.flags.arc1.hitos='mal';
  afirmar(!j.deserializar(d)&&JSON.stringify(j.serializar()).replace(/"fecha":\d+/,"")===
    JSON.stringify(antes).replace(/"fecha":\d+/,""),'Arc1 corrupto importado');
  d=clone(antes);d.flags.arc1.anclajePropietario.fantasma='M01';afirmar(!j.deserializar(d),'Owner desconocido importado');
});
PRUEBAS.registrar('3C.6: saves intermedios P–M07 sin promociones por carga',()=>{
  for(const id of ARC1_IDS){
    const j=PRUEBAS.banco(),idx=ARC1_IDS.indexOf(id);
    j.quests=Object.fromEntries(ARC1_IDS.slice(0,idx).map(x=>[x,'hecha']));j.quests[id]='activa';
    if(idx>=4){j.flags.arc1.rangoInstitucional='DISCIPULO_EXTERNO';j.flags.arc1.estadoAfiliacion='MIEMBRO';
      j.flags.arc1.primerServicioFormal=true;j.flags.arc1.evaluacionCirculacion='SUPERADA';j.player.etapa=2;j.player.qi_max=45;j.reconciliarProgresionArc1();}
    if(id==='M06'||id==='M07'){
      j.flags.PATRULLA_TERRITORIAL=true;j.flags.arc1.evidenciaTerritorial.tipos=
        id==='M06'?['DESPLAZAMIENTO_FAUNA']:['DESPLAZAMIENTO_FAUNA','ALTERACION_VEGETAL','ALTERACION_HIDRICA'];
      j.reconciliarProgresionArc1();
    }
    const d=j.serializar(),k=PRUEBAS.banco();afirmar(!validarSave329(d).length&&k.deserializar(d),'No guardó mitad '+id);
    afirmar(k.quests[id]==='activa'&&k.player.etapa===j.player.etapa,'Load promovió '+id);
  }
});
PRUEBAS.registrar('3C.6: formulaciones M07 y conocimiento NPC monotónico',()=>{
  for(const [n,op,final,corregida] of [[3,'CAUTA','CAUTA',false],[3,'FUERTE','CAUTA',true],[4,'FUERTE','FUERTE',false]]){
    const j=PRUEBAS.banco(),a=j.flags.arc1;
    j.quests={P:'hecha',M01:'hecha',M02:'hecha',M03:'hecha',M04:'hecha',M05:'hecha',M06:'hecha',M07:'activa'};
    a.evidenciaTerritorial.tipos=ARC1_TIPOS.slice(0,n);j.reconciliarProgresionArc1();
    afirmar(j.formularInformeArc1(op),'Informe '+n+'/'+op);
    afirmar(j.quests.M07==='hecha'&&a.informe.formulacionFinal===final&&a.informe.corregida===corregida,'Corrección institucional');
    afirmar(a.revelaciones.R1==='CONFIRMADO'&&j.conocimientoNPC.jiang_rui.R1==='CONFIRMADO'&&
      j.conocimientoNPC.qiao_ren.R1==='CONFIRMADO'&&j.conocimientoNPC.he_zhen.R1!=='PARCIAL','Conocimiento R1');
    const antes=j.conocimientoNPC.jiang_rui.R1;j.elevarConocimientoArc1('jiang_rui','SOSPECHA');
    afirmar(j.conocimientoNPC.jiang_rui.R1===antes,'Conocimiento retrocedió');
  }
});
PRUEBAS.registrar('3C.6: píldora protegida, reemisión única y carga repetida',()=>{
  const j=PRUEBAS.banco(),a=j.flags.arc1;j.player.etapa=2;
  a.hitos.PILDORA_CONSOLIDACION_OTORGADA=true;j.quests={P:'hecha',M01:'hecha',M02:'hecha',M03:'hecha',M04:'hecha',M05:'hecha'};
  j.player.inventario.push('pildora_consolidacion');
  afirmar(j.cmd_soltar(['pildora','consolidacion']).includes('reservada')&&
    j.beber(['pildora','consolidacion'])[1]===false,'Píldora consumible antes de consagrar');
  j.player.inventario=j.player.inventario.filter(x=>x!=='pildora_consolidacion');
  afirmar(j.reemitirPildoraArc1()&&!j.reemitirPildoraArc1(),'Reemisión repetida');
  const d=j.serializar(),k=PRUEBAS.banco();afirmar(k.deserializar(d)&&!k.reemitirPildoraArc1()&&
    k.player.inventario.filter(x=>x==='pildora_consolidacion').length===1,'Reemisión se duplicó al cargar');
  k.player.inventario=k.player.inventario.filter(x=>x!=='pildora_consolidacion');
  afirmar(!k.reemitirPildoraArc1(),'Tercera píldora concedida');
});
PRUEBAS.registrar('3C.6: saldo y mérito independientes y canjes 8/20',()=>{
  const j=PRUEBAS.banco(),f=j.player.facciones.grulla_blanca;
  j.otorgarContribucion(30);afirmar(f.saldo===30&&f.merito===0,'Contribución concedió mérito');
  j.cambiarEstadoFaccion('grulla_blanca','miembro');
  afirmar(j.cmd_canjear(['claridad']).includes('mérito 8')&&j.cmd_canjear(['consolidacion']).includes('mérito 20')&&f.saldo===30,'Canje sin mérito');
  j.otorgarMerito(8);afirmar(j.cmd_canjear(['claridad']).includes('Retiras')&&f.saldo===26&&f.merito===8,'Canje 8');
  j.otorgarMerito(12);afirmar(j.cmd_canjear(['consolidacion']).includes('Retiras')&&f.saldo===18&&f.merito===20,'Canje 20');
  j.cambiarEstadoFaccion('grulla_blanca','expulsado');
  j.otorgarContribucion(5);j.otorgarMerito(5);afirmar(f.saldo===18&&f.merito===20,'Expulsado cobró recompensas');
  afirmar(f.historial.some(x=>x.tipo==='merito')&&f.historial.some(x=>x.tipo==='contribucion'),'Historial indistinto');
});
PRUEBAS.registrar('3C.6: hitos físicos posteriores, evidencia adelantada y requisito desconocido',()=>{
  const j=PRUEBAS.banco(),a=j.flags.arc1;
  j.quests={P:'hecha',M01:'hecha',M02:'hecha',M03:'hecha',M04:'activa'};
  a.rangoInstitucional='DISCIPULO_EXTERNO';a.primerServicioFormal=true;a.evaluacionCirculacion='SUPERADA';
  j.player.etapa=2;j.player.qi_max=45;
  j.visitadas.add('bosque_refugio_patrulla');j.visitadas.add('mercado_valle');
  afirmar(!a.hitos.M04_REFUGIO_ALCANZADO,'Visita histórica contó M04');
  j.registrarHitoArc1('M04_ASIGNADA');j.registrarHitoArc1('M04_CONTROL_PUERTA');
  j.pos='bosque_refugio_patrulla';j.entrarSala();j.registrarHitoArc1('M04_RETORNO_INFORMADO');
  afirmar(j.quests.M04==='hecha','M04 no cerró por evento');
  j.quests.M05='activa';afirmar(!a.hitos.M05_VALLE_LOGISTICA_REVISADA,'Visita histórica contó M05');
  for(const [r,k] of [['bosque_collado_alto','huellas'],['aguas_senda_bosque','vegetacion'],['aguas_cauce_alto','corriente']])
    j.registrarEvidenciaArc1(r,k);
  afirmar(!j.quests.M06&&a.evidenciaTerritorial.nivel==='SUFICIENTE','M06 activada antes de M05');
  for(const h of ['M05_VALLE_LOGISTICA_REVISADA','M05_XU_AN_CONTACTADO','M05_CIRCUITO_REGISTRADO','M05_HOSPEDAJE_VISITADO'])j.registrarHitoArc1(h);
  afirmar(j.quests.M05==='hecha'&&j.quests.M06==='hecha','Evidencia previa no cerró M06 en mismo evento');
  j.registrarEvidenciaArc1('bosque_refugio_patrulla','registro');
  afirmar(a.evidenciaTerritorial.nivel==='CONCLUYENTE'&&a.evidenciaTerritorial.tipos.length===4,'Cuarto tipo antes de M07');
  j.quests.M07='activa';j.formularInformeArc1('FUERTE');
  const old=PUERTAS[3].logros;try{
    PUERTAS[3].logros=['CONDICION_DESCONOCIDA'];j.player.qi=45;
    const antes=j.player.inventario.filter(x=>x==='pildora_consolidacion').length;
    afirmar(!j.compruebaPuerta(3).ok&&j.compruebaPuerta(3).faltan.some(x=>x.includes('desconocido')),'Requisito desconocido abierto');
    j.pos='patio_respiracion';j.vivos=[];j.cmd_meditar([]);
    afirmar(j.player.etapa===2&&j.player.inventario.filter(x=>x==='pildora_consolidacion').length===antes,'Consumió recurso al bloquear');
  }finally{PUERTAS[3].logros=old;}
});
PRUEBAS.registrar('3C.6: legacy etapa 3 completa territorio sin píldora retroactiva',()=>{
  const j=PRUEBAS.banco(),old=j.serializar();delete old.flags.arc1;old.quests={};
  old.player.etapa=3;old.player.qi=31;old.player.qi_max=75;
  afirmar(j.deserializar(old)&&j.flags.arc1.estado==='LII_TERRITORIO','Legacy abrió LIII temprano');
  j.quests.M04='activa';j.registrarHitoArc1('M04_RETORNO_INFORMADO');
  j.quests.M05='activa';for(const h of ['M05_VALLE_LOGISTICA_REVISADA','M05_XU_AN_CONTACTADO','M05_CIRCUITO_REGISTRADO','M05_HOSPEDAJE_VISITADO'])j.registrarHitoArc1(h);
  for(const [r,k] of [['bosque_collado_alto','huellas'],['aguas_senda_bosque','vegetacion'],['aguas_cauce_alto','corriente']])j.registrarEvidenciaArc1(r,k);
  j.quests.M07='activa';j.formularInformeArc1('CAUTA');
  afirmar(j.flags.arc1.estado==='LIII_INVESTIGACION'&&j.gates.SECTA_INTERIOR&&j.player.etapa===3&&j.player.qi===31,
    'Legacy no completó transición oficial');
});

// H-1 (auditoría 3C.6, commit 748bd44): cargar una partida no debe producir
// los efectos de ENTRAR a la sala (hitos de misión, entrega de equipo,
// recreación del cadáver tutorial, marcar la sala como visitada). Sólo debe
// reconstruir `vivos`/cooldown para poder renderizar. Estas pruebas fallaban
// en Chromium antes de mover la copia de estado persistente a ANTES de
// `temporal.entrarSala()` en deserializar().
const H1_SNAP = d => { const s = JSON.parse(JSON.stringify(d)); delete s.fecha; return JSON.stringify(s); };
PRUEBAS.registrar('3C.6 H1: cargar no muta visitadas ni estado cuando la posición actual no estaba visitada', () => {
  const j = PRUEBAS.banco({ pos: 'sala_jade' });
  afirmar(!j.visitadas.has('sala_jade'), 'Fixture inválida: la sala ya figuraba visitada');
  const data = j.serializar();
  afirmar(!data.visitadas.includes('sala_jade'), 'Fixture inválida: el save ya incluía la sala');
  const antes = H1_SNAP(data);
  const k = PRUEBAS.banco();
  afirmar(k.deserializar(data), 'Carga rechazada');
  afirmar(H1_SNAP(k.serializar()) === antes, 'Cargar alteró el estado serializado (visitadas u otro campo)');
  afirmar(!k.visitadas.has('sala_jade'), 'Cargar marcó como visitada una sala que no lo estaba en el save');
});
PRUEBAS.registrar('3C.6 H1: entrarSala() durante la carga no materializa hitos/equipo/cadáver de misión', () => {
  // Cada fixture se construye jugando de verdad (mismas llamadas que usan los
  // tests 3C.6 históricos: cmd_hablar/cmd_examinar/entrarSala/cmd_meditar),
  // deteniéndose justo ANTES del efecto de entrada bajo prueba. Luego se fija
  // `j.pos` en la sala objetivo y se llama a normalizarArc1() una única vez
  // -exactamente lo que deserializar() hace en la fase de normalización- para
  // que el fixture ya esté en la misma forma estable que produciría la carga.
  // Así cualquier diferencia posterior sólo puede venir de entrarSala().
  const casos = [];

  casos.push({ nombre: 'descansillo · equipo inicial del Prólogo', pos: 'descansillo', j: (() => {
    const j = PRUEBAS.banco({ pos: 'patio_raices' });
    j.pos = 'descansillo'; j.normalizarArc1();
    afirmar(j.quests.P === 'activa' && !j.flags.arc1.hitos.equipoInicialEntregado, 'Fixture no llegó al punto esperado');
    return j;
  })() });

  casos.push({ nombre: 'dormitorio_externos · confirmación de alojamiento M01', pos: 'dormitorio_externos', j: (() => {
    const j = PRUEBAS.banco(); j.pos = 'registro'; j.cmd_hablar(['tao', 'ming']);
    j.pos = 'sala_jade'; j.cmd_examinar(['muro']);
    j.pos = 'patio_cabanas'; j.cmd_hablar(['madre', 'wen']);
    j.pos = 'dormitorio_externos'; j.normalizarArc1();
    afirmar(j.quests.M01 === 'activa' && !j.flags.arc1.hitos.ALOJAMIENTO_CONFIRMADO, 'Fixture no llegó al punto esperado');
    return j;
  })() });

  casos.push({ nombre: 'deposito_comun · cadáver tutorial perdido en M02', pos: 'deposito_comun', visitadaPrevia: true, j: (() => {
    const j = PRUEBAS.banco(); j.pos = 'registro'; j.cmd_hablar(['tao', 'ming']);
    j.pos = 'sala_jade'; j.cmd_examinar(['muro']);
    j.pos = 'patio_cabanas'; j.cmd_hablar(['madre', 'wen']);
    j.pos = 'dormitorio_externos'; j.entrarSala();
    j.pos = 'oficina_servicios'; j.cmd_hablar(['tao', 'ming']);
    j.pos = 'deposito_comun'; j.entrarSala();
    const rata = j.vivos.find(m => m.errante_id === 'rata_despensa');
    afirmar(!!rata, 'Fixture sin rata tutorial');
    j.registrarCadaver(rata); j.recompensas('rata_qi', rata);
    delete j.cadaveres.deposito_comun;
    j.normalizarArc1();
    afirmar(j.quests.M02 === 'activa' && j.flags.arc1.hitos.M02_RATA_RESUELTA &&
      !j.flags.arc1.hitos.M02_CADAVER_RECREADO && !j.flags.arc1.hitos.M02_CADAVER_OBSERVADO,
      'Fixture no llegó al punto esperado');
    return j;
  })() });

  const avanzarHastaM04Puerta = () => {
    const j = PRUEBAS.banco(); j.pos = 'registro'; j.cmd_hablar(['tao', 'ming']);
    j.pos = 'sala_jade'; j.cmd_examinar(['muro']);
    j.pos = 'patio_cabanas'; j.cmd_hablar(['madre', 'wen']);
    j.pos = 'dormitorio_externos'; j.entrarSala();
    j.pos = 'oficina_servicios'; j.cmd_hablar(['tao', 'ming']);
    j.pos = 'deposito_comun'; j.entrarSala();
    const rata = j.vivos.find(m => m.errante_id === 'rata_despensa');
    j.registrarCadaver(rata); j.recompensas('rata_qi', rata);
    j.pos = 'sala_anatomica'; j.cmd_hablar(['chen', 'bo']);
    j.pos = 'deposito_comun'; j.cmd_examinar(['cadaver']);
    j.pos = 'oficina_servicios'; j.cmd_hablar(['tao', 'ming']);
    j.pos = 'sala_formas'; j.cmd_hablar(['shen', 'baojun']);
    j.pos = 'patio_marcial'; j.entrarSala();
    const doll = j.vivos.find(m => m.arc1_muneco);
    j.registrarUso('piel_cobre', [], 1, doll);
    j.pos = 'patio_respiracion'; j.vivos = []; j.player.qi = j.player.qi_max; j.cmd_meditar([]);
    j.pos = 'pabellon_disciplina'; j.cmd_hablar(['qiao', 'ren']);
    j.pos = 'patio_respiracion'; j.vivos = []; j.cmd_meditar([]);
    afirmar(j.quests.M03 === 'hecha' && j.player.etapa === 2, 'Fixture no llegó a LII');
    j.pos = 'puesto_valle'; j.gestionarMisionesNpc('jiang_rui');
    j.pos = 'puerta'; j.gestionarMisionesNpc('gao_shun');
    afirmar(j.quests.M04 === 'activa' && j.flags.arc1.hitos.M04_CONTROL_PUERTA, 'Fixture no llegó a M04_CONTROL_PUERTA');
    return j;
  };

  casos.push({ nombre: 'bosque_refugio_patrulla · refugio alcanzado M04', pos: 'bosque_refugio_patrulla', j: (() => {
    const j = avanzarHastaM04Puerta();
    j.pos = 'bosque_refugio_patrulla'; j.normalizarArc1();
    afirmar(j.quests.M04 === 'activa' && !j.flags.arc1.hitos.M04_REFUGIO_ALCANZADO, 'Fixture no llegó al punto esperado');
    return j;
  })() });

  const avanzarHastaM05 = () => {
    const j = avanzarHastaM04Puerta();
    j.pos = 'bosque_refugio_patrulla'; j.entrarSala(); j.examinarEscenaArc1(j.pos, 'registro');
    j.pos = 'puesto_valle'; j.gestionarMisionesNpc('jiang_rui');
    afirmar(j.quests.M04 === 'hecha', 'Fixture no cerró M04');
    j.pos = 'oficina_logistica'; j.gestionarMisionesNpc('duan_shibo');
    afirmar(j.quests.M05 === 'activa', 'Fixture no activó M05');
    return j;
  };

  casos.push({ nombre: 'mercado_valle · logística del valle M05', pos: 'mercado_valle', j: (() => {
    const j = avanzarHastaM05();
    j.pos = 'mercado_valle'; j.normalizarArc1();
    afirmar(j.quests.M05 === 'activa' && !j.flags.arc1.hitos.M05_VALLE_LOGISTICA_REVISADA, 'Fixture no llegó al punto esperado');
    return j;
  })() });

  casos.push({ nombre: 'sauces_casa_huespedes · hospedaje visitado M05', pos: 'sauces_casa_huespedes', j: (() => {
    const j = avanzarHastaM05();
    j.pos = 'sauces_casa_huespedes'; j.normalizarArc1();
    afirmar(j.quests.M05 === 'activa' && !j.flags.arc1.hitos.M05_HOSPEDAJE_VISITADO, 'Fixture no llegó al punto esperado');
    return j;
  })() });

  for (const { nombre, pos, j, visitadaPrevia } of casos) {
    afirmar(!!j.visitadas.has(pos) === !!visitadaPrevia,
      `[${nombre}] fixture inválida: estado de 'visitadas' inesperado para la sala`);
    const data = j.serializar();
    afirmar(!!data.visitadas.includes(pos) === !!visitadaPrevia,
      `[${nombre}] fixture inválida: el save no refleja el estado esperado de 'visitadas'`);
    const antes = H1_SNAP(data);
    const k = PRUEBAS.banco();
    afirmar(k.deserializar(data), `[${nombre}] carga rechazada`);
    afirmar(H1_SNAP(k.serializar()) === antes,
      `[${nombre}] cargar equivalió a entrar de nuevo a la sala (hito/equipo/cadáver/visitadas cambió)`);
  }
});
