function conAtlasPrueba329(fn) {
 document.getElementById("atlas").close();
 try { return fn(); } finally { document.getElementById("atlas").close(); }
}
// 3C.1 — Fundación estructural. Fuente física única: Topologia_329_Estructurada_v2.json.
const SAVE_SCHEMA_VERSION = 2;
const MENSAJE_SAVE_INCOMPATIBLE = "Save incompatible con el mundo de 329 salas. No se importó ningún estado. Inicia una Nueva Partida.";
const GATES_329 = [
  {
    "id": "ATAJO_ALA_AGUAS",
    "extremos": [
      "aguas_conducto_antiguo",
      "ala_aguas_06"
    ]
  },
  {
    "id": "ATAJO_ALA_ARCHIVOS",
    "extremos": [
      "ala_archivos_06",
      "archivos_conducto_antiguo"
    ]
  },
  {
    "id": "ATAJO_ALA_CANTERA",
    "extremos": [
      "ala_cantera_06",
      "conducto_antiguo_cantera"
    ]
  },
  {
    "id": "ATAJO_ALA_FORMACIONES",
    "extremos": [
      "ala_formaciones_06",
      "formaciones_conducto_antiguo"
    ]
  },
  {
    "id": "ATAJO_ALA_JARDINES",
    "extremos": [
      "ala_jardines_06",
      "conducto_antiguo_jardines"
    ]
  },
  {
    "id": "ATAJO_ALA_MEDICINA",
    "extremos": [
      "ala_med_06",
      "sotano_conductos_medicina"
    ]
  },
  {
    "id": "PASO_MANTENIMIENTO",
    "extremos": [
      "ala_umbral_mantenimiento",
      "mantenimiento_acceso"
    ]
  },
  {
    "id": "SECTA_INTERIOR",
    "extremos": [
      "escalinata_interior",
      "interior_umbral_sur"
    ]
  },
  {
    "id": "M12",
    "extremos": [
      "formaciones_descenso_tecnico",
      "formaciones_sello_antiguo"
    ]
  },
  {
    "id": "PASO_NUCLEO",
    "extremos": [
      "mantenimiento_compuerta_nucleo",
      "nucleo_pozo_voto"
    ]
  },
  {
    "id": "PASO_PULSO",
    "extremos": [
      "nucleo_archivo_promesa",
      "nucleo_descenso_pulso"
    ]
  }
];
const ALOJAMIENTOS_329 = [
  "dormitorio_externos",
  "sala_recuperacion",
  "caseta_jardineros",
  "barracon_trabajadores",
  "puesto_valle",
  "bosque_refugio_patrulla",
  "barracon_canteros",
  "aguas_refugio_cauce",
  "sauces_casa_huespedes",
  "interior_cuartos_huespedes",
  "alturas_caseta_guardacumbre",
  "mantenimiento_dormitorio_turnos",
  "nucleo_sala_relevo"
];
const PENDIENTES_3C1 = Object.freeze({ alquimia: { sala: null, decision: "P03" }, sangre_huerto: { sala: null, decision: "P06" } });
function esSalidaRegional(origen, direccion, destino) {
  return origen === "mojon_regional" && direccion === "sur" && destino === "ruta_regional_arc2";
}
function crearEstadoGates() { return Object.fromEntries(GATES_329.map(g => [g.id, false])); }
function normalizarEstadoGates(estado = {}) {
  const limpio = crearEstadoGates();
  for (const id of Object.keys(limpio)) limpio[id] = estado?.[id] === true;
  if (!limpio.SECTA_INTERIOR) for (const id of Object.keys(limpio)) if (id === "M12" || id.startsWith("ATAJO_ALA_")) limpio[id] = false;
  return limpio;
}
function gateEntre(origen, destino) { return GATES_329.find(g => g.extremos.includes(origen) && g.extremos.includes(destino)); }
function pasoGateAbierto(origen, destino, estado) {
  const gate = gateEntre(origen, destino);
  return !gate || normalizarEstadoGates(estado)[gate.id] === true;
}
function recorrerMundo329(inicio = "patio_raices", estado = null, rooms = ROOMS) {
  const vistos = new Set(rooms[inicio] ? [inicio] : []), cola = [...vistos];
  for (let i = 0; i < cola.length; i++) for (const destino of Object.values(rooms[cola[i]].exits || {})) {
    if (!rooms[destino] || vistos.has(destino) || (estado && !pasoGateAbierto(cola[i], destino, estado))) continue;
    vistos.add(destino); cola.push(destino);
  }
  return vistos;
}
function auditarMundo329(rooms = ROOMS) {
  const errores = [], ids = Object.keys(rooms), areas = new Set(), externos = [], rotas = [], aisladas = [];
  let exits = 0;
  for (const [id, r] of Object.entries(rooms)) {
    areas.add(r.area);
    if (r.id !== id) errores.push("ID incoherente: " + id);
    if (!AREAS[r.area]) errores.push("Área inexistente: " + id);
    let internos = 0;
    for (const [d, dest] of Object.entries(r.exits || {})) {
      exits++;
      if (!DIRECCION_OPUESTA[d]) errores.push("Dirección inválida: " + id + "." + d);
      if (!rooms[dest]) { if (esSalidaRegional(id,d,dest)) externos.push({origen:id,direccion:d,destino:dest}); else errores.push("Destino interno inexistente: " + id + "." + d + " → " + dest); continue; }
      internos++;
      if (rooms[dest].exits?.[DIRECCION_OPUESTA[d]] !== id) rotas.push(id + "." + d);
    }
    if (!internos) aisladas.push(id);
  }
  let componentes = 0; const resto = new Set(ids);
  while (resto.size) { componentes++; for (const id of recorrerMundo329(resto.values().next().value,null,rooms)) resto.delete(id); }
  const abiertas = recorrerMundo329("patio_raices",null,rooms), cerradas = recorrerMundo329("patio_raices",crearEstadoGates(),rooms);
  const bloqueadasPorArea = {}; for (const id of ids) if (!cerradas.has(id)) bloqueadasPorArea[rooms[id].area] = (bloqueadasPorArea[rooms[id].area]||0)+1;
  for (const [actual,esperado,nombre] of [[ids.length,329,"rooms"],[areas.size,17,"áreas"],[exits,787,"exits"],[externos.length,1,"excepción externa"],[rotas.length,0,"reciprocidades rotas"],[aisladas.length,0,"aisladas"],[componentes,1,"componentes"],[abiertas.size,329,"alcanzables físicas"],[cerradas.size,185,"alcanzables iniciales"]]) if(actual!==esperado) errores.push(nombre+": "+actual+" / esperado "+esperado);
  const esperado = {primera_ala:41,alturas:20,archivos:16,formaciones:17,secta_interior:22,mantenimiento:15,nucleo:13};
  for(const area of new Set([...Object.keys(esperado),...Object.keys(bloqueadasPorArea)]))if(bloqueadasPorArea[area]!==esperado[area])errores.push("Distribución bloqueada: "+area);
  for (const id of ["patio_raices","descansillo","mirador_niebla","patio_practica","camino","puerta","registro","patio"]) if(!rooms[id])errores.push("Superviviente ausente: "+id);
  for(const g of GATES_329)if(!g.extremos.every((id,i)=>Object.values(rooms[id]?.exits||{}).includes(g.extremos[1-i])))errores.push("Gate sin conexión: "+g.id);
  if(GATES_329.filter(g=>g.id.startsWith("ATAJO_ALA_")).length!==6)errores.push("Atajos: se esperan 6");
  if(Object.values(rooms).filter(r=>r.alojamiento).length!==13||ALOJAMIENTOS_329.some(id=>!rooms[id]?.alojamiento))errores.push("Alojamientos: se esperan los 13 canónicos");
  if(Object.values(rooms.ala_camara_dos_alas?.exits||{}).includes("ala_galeria_distribucion")||Object.values(rooms.ala_galeria_distribucion?.exits||{}).includes("ala_camara_dos_alas"))errores.push("Conexión directa prohibida");
  return {ok:!errores.length,errores,rooms:ids.length,areas:areas.size,exits,externos,reciprocidadesRotas:rotas.length,aisladas:aisladas.length,componentes,alcanzablesFisicas:abiertas.size,alcanzablesIniciales:cerradas.size,bloqueadas:ids.length-cerradas.size,bloqueadasPorArea};
}
function validarSave329(data) {
  const errores = [];
  try {
    // La versión se inspecciona antes de cualquier otro campo, incluso con getters hostiles.
    if (data?.saveSchemaVersion !== SAVE_SCHEMA_VERSION) return [MENSAJE_SAVE_INCOMPATIBLE];
    const fail = p => errores.push(p + ": estructura o valor inválido");
    const plain = x => x !== null && typeof x === "object" && !Array.isArray(x) && [Object.prototype, null].includes(Object.getPrototypeOf(x));
    const obj = (x,p) => { if (!plain(x)) { fail(p); return {}; } return x; };
    const arr = (x,p) => { if (!Array.isArray(x)) { fail(p); return []; } return x; };
    const has = (o,k) => Object.hasOwn(o,k);
    const ref = (o,k) => typeof k === "string" && has(o,k);
    const num = (x,p,min=0) => { if (typeof x !== "number" || !Number.isFinite(x) || x < min) fail(p); };
    const integer = (x,p,min=0) => { num(x,p,min); if (!Number.isInteger(x)) fail(p); };
    const str = (x,p) => { if (typeof x !== "string") fail(p); };
    const bool = (x,p) => { if (typeof x !== "boolean") fail(p); };
    const keys = (x,expected,p) => { if (Object.keys(x).length !== expected.length || expected.some(k=>!has(x,k))) fail(p); };
    const references = (x,table,p) => arr(x,p).forEach(k=>{if(!ref(table,k))fail(p);});
    // Sólo JSON finito; sin ciclos ni claves capaces de modificar prototipos al copiar.
    const pending=[data], seen=new Set();
    while(pending.length){const x=pending.pop();if(x===null||typeof x==='string'||typeof x==='boolean')continue;
      if(typeof x==='number'){if(!Number.isFinite(x))fail('JSON');continue;}
      if(typeof x!=='object'||seen.has(x)){fail('JSON');continue;}seen.add(x);
      for(const k of Object.keys(x)){if(['__proto__','constructor','prototype'].includes(k))fail('JSON.'+k);pending.push(x[k]);}}
    obj(data,'save');
    const required=['saveSchemaVersion','gates','player','pos','flags','quests','salas','visitadas','atlas','saturacion','turnoGlobal','relojEcologico','respawnEn','interrupcionEn','errantes','cadaveres','objetosTirados','fecha'];
    const npcV1=has(data,'npc_version');
    keys(data,[...(npcV1 ? [...required,'npc_version','posicionNPC','conocimientoNPC'] : required),...(has(data,'playerIdentityKnowledge') ? ['playerIdentityKnowledge'] : [])],'save.campos');
    if(has(data,'playerIdentityKnowledge')){
      try { if(!ASTRA_NATIVE_IDENTITY)fail('playerIdentityKnowledge');
        else ASTRA_NATIVE_IDENTITY.validateIdentity(data.playerIdentityKnowledge); }
      catch { fail('playerIdentityKnowledge'); }
    }
    if(npcV1){
      if(data.npc_version!==1)fail('npc_version');
      const posiciones=obj(data.posicionNPC,'posicionNPC');
      const conocimientos=obj(data.conocimientoNPC,'conocimientoNPC');
      const ids=Object.keys(NPC_DEF),revelaciones=Array.from({length:10},(_,i)=>'R'+(i+1));
      const estados=new Set(['DESCONOCIDO','SOSPECHA','SABE','CONFIRMADO']);
      keys(posiciones,ids,'posicionNPC.ids');keys(conocimientos,ids,'conocimientoNPC.ids');
      for(const id of ids){
        const posicion=obj(posiciones[id],'posicionNPC.'+id),saber=obj(conocimientos[id],'conocimientoNPC.'+id);
        keys(posicion,['sala','anclaje'],'posicionNPC.'+id);
        const anclaje=posicion.anclaje;
        if(!ref(ROOMS,posicion.sala))fail('posicionNPC.'+id+'.sala');
        if(anclaje===null){if(!NPC_DEF[id].posicion_valida.includes(posicion.sala))fail('posicionNPC.'+id+'.territorio');}
        else {const a=obj(anclaje,'posicionNPC.'+id+'.anclaje');keys(a,['room','hasta'],'posicionNPC.'+id+'.anclaje');
          if(!ref(ROOMS,a.room)||posicion.sala!==a.room)fail('posicionNPC.'+id+'.anclaje.room');}
        keys(saber,revelaciones,'conocimientoNPC.'+id);
        for(const r of revelaciones)if(!estados.has(saber[r]))fail('conocimientoNPC.'+id+'.'+r);
      }
    }
    if(!ref(ROOMS,data.pos))fail('pos');
    integer(data.turnoGlobal,'turnoGlobal');integer(data.relojEcologico,'relojEcologico');num(data.fecha,'fecha');
    if(!Number.isFinite(new Date(data.fecha).getTime()))fail('fecha');
    const flags=obj(data.flags,'flags');
    if(has(flags,'arc1')&&!validarArc1(flags.arc1))fail('flags.arc1');
    for(const [k,v]of Object.entries(obj(data.quests,'quests')))if(typeof v!=='string')fail('quests.'+k);
    references(data.visitadas,ROOMS,'visitadas');
    const gates=obj(data.gates,'gates');keys(gates,GATES_329.map(g=>g.id),'gates');
    for(const [k,v]of Object.entries(gates))bool(v,'gates.'+k);
    if(gates.SECTA_INTERIOR===false&&(gates.M12===true||Object.keys(gates).some(k=>k.startsWith('ATAJO_ALA_')&&gates[k]===true)))fail('gates.invariante');
    const salas=obj(data.salas,'salas');keys(salas,Object.keys(ROOMS),'salas');
    for(const [id,raw]of Object.entries(salas)){const s=obj(raw,'salas.'+id);if(!ref(ROOMS,id))fail('salas.'+id);keys(s,['items','oculto'],'salas.'+id);references(s.items,ITEMS,id+'.items');references(s.oculto,ITEMS,id+'.oculto');}
    for(const field of ['saturacion','interrupcionEn'])for(const [id,v]of Object.entries(obj(data[field],field))){if(!ref(ROOMS,id))fail(field+'.'+id);num(v,field+'.'+id);}
    const fixed=new Set();for(const [id,r]of Object.entries(ROOMS)){const n={};for(const mid of r.mobs){n[mid]=(n[mid]||0)+1;fixed.add(`${id}:${mid}:${n[mid]}`);}}
    for(const [id,v]of Object.entries(obj(data.respawnEn,'respawnEn'))){if(!fixed.has(id))fail('respawnEn.'+id);num(v,'respawnEn.'+id);}
    if(!a08TerritorialRuntime?.validateWorld(data))fail('errantes.territorialVersion');
    for(const [id,raw]of Object.entries(obj(data.objetosTirados,'objetosTirados'))){if(!ref(ROOMS,id))fail('objetosTirados.'+id);
      for(const entry of arr(raw,'objetosTirados.'+id)){const e=obj(entry,'objetoTirado');if(!ref(ITEMS,e.mid))fail('objetoTirado.mid');num(e.desapareceEn,'objetoTirado.desapareceEn');}}
    for(const [id,raw]of Object.entries(obj(data.cadaveres,'cadaveres'))){if(!ref(ROOMS,id))fail('cadaveres.'+id);
      for(const entry of arr(raw,'cadaveres.'+id)){const e=obj(entry,'cadaver');if(!ref(MOBS,e.mob_id))fail('cadaver.mob_id');for(const k of ['name','corto','tipo'])str(e[k],'cadaver.'+k);num(e.caidoEn,'cadaver.caidoEn');num(e.desapareceEn,'cadaver.desapareceEn');
        if(has(e,'investigado'))arr(e.investigado,'cadaver.investigado').forEach(v=>str(v,'cadaver.investigado'));
        if(has(e,'examenProcedimientos'))for(const v of Object.values(obj(e.examenProcedimientos,'cadaver.examenProcedimientos')))str(v,'cadaver.procedimiento');}}
    const atlas=obj(data.atlas,'atlas');keys(atlas,['salas','personas','criaturas'],'atlas');
    for(const [id,raw]of Object.entries(obj(atlas.salas,'atlas.salas'))){const s=obj(raw,'atlas.sala');if(!ref(ROOMS,id))fail('atlas.sala.id');
      for(const pair of arr(s.salidas,'atlas.salidas')){if(!Array.isArray(pair)||pair.length!==2||!DIRECCIONES.includes(pair[0])||ROOMS[id]?.exits[pair[0]]!==pair[1])fail('atlas.salida');}
      references(s.items,ITEMS,'atlas.items');references(s.npcs,NOMBRES_NPC,'atlas.npcs');references(s.mobs,MOBS,'atlas.mobs');
      integer(s.turno,'atlas.turno');str(s.vena,'atlas.vena');bool(s.salvaje,'atlas.salvaje');bool(s.resentida,'atlas.resentida');
      if(s.alojamiento!==null){const l=obj(s.alojamiento,'atlas.alojamiento');str(l.nombre,'atlas.alojamiento.nombre');bool(l.purifica,'atlas.alojamiento.purifica');}}
    for(const [id,raw]of Object.entries(obj(atlas.personas,'atlas.personas'))){const p=obj(raw,'atlas.persona');if(!ref(NOMBRES_NPC,id)||!ref(ROOMS,p.sala))fail('atlas.persona');integer(p.turno,'atlas.persona.turno');}
    for(const [id,raw]of Object.entries(obj(atlas.criaturas,'atlas.criaturas'))){const c=obj(raw,'atlas.criatura');if(!ref(MOBS,id)||!ref(ROOMS,c.sala))fail('atlas.criatura');references(c.lugares,ROOMS,'atlas.lugares');integer(c.turno,'atlas.criatura.turno');bool(c.errante,'atlas.errante');bool(c.examinada,'atlas.examinada');
      if(has(c,'botin'))for(const [mid,v]of Object.entries(obj(c.botin,'atlas.botin'))){if(!ref(ITEMS,mid))fail('atlas.botin.id');obj(v,'atlas.botin.registro');}}
    const p=obj(data.player,'player');
    for(const [k,v]of Object.entries({cultivo_version:1,profesiones_version:6,facciones_version:1,meridianos_version:3,equipo_version:2,builds_version:2}))if(p[k]!==v)fail('player.'+k);
    for(const k of ['name','reino','raiz','origen','titulo','daño'])str(p[k],'player.'+k);
    if(!ref(RAICES,p.raiz)||!ref(ORIGENES,p.origen))fail('player.origen/raiz');
    for(const k of ['hp','max_hp','ataque','defensa','qi','qi_max','etapa','comprension','piedras','impurezas','heridas_meridianos','actividad_reposo','puntos_tecnica_total','build_seq'])num(p[k],'player.'+k,k==='hp'?-Infinity:0);
    references(p.inventario,ITEMS,'player.inventario');for(const mid of Object.values(obj(p.equipado,'player.equipado')))if(!ref(ITEMS,mid))fail('player.equipado.id');
    for(const id of Object.keys(obj(p.afinidad,'player.afinidad')))if(!ref(NOMBRES_NPC,id))fail('player.afinidad.id');
    const tecnicas=obj(p.tecnicas,'player.tecnicas');
    const ramas=(raw,path)=>{const v=obj(raw,path);for(const n of [1,2,3])if(![0,1,2,3].includes(v[n]))fail(path+'.'+n);};
    for(const [id,raw]of Object.entries(tecnicas)){const t=obj(raw,'tecnica');if(!ref(TECNICAS,id))fail('tecnica.id');for(const k of ['maestria','usos','practica'])num(t[k],'tecnica.'+k);ramas(t.ramas,'tecnica.ramas');}
    references(p.tecnicas_preparadas,tecnicas,'player.tecnicas_preparadas');
    for(const raw of arr(p.builds,'player.builds')){const b=obj(raw,'build');str(b.id,'build.id');str(b.nombre,'build.nombre');references(b.preparadas,tecnicas,'build.preparadas');for(const [tid,rs]of Object.entries(obj(b.ramas,'build.ramas'))){if(!ref(tecnicas,tid))fail('build.tecnica');ramas(rs,'build.ramas');}}
    if(p.build_activa!==null&&!arr(p.builds,'builds').some(b=>b?.id===p.build_activa))fail('build_activa');
    for(const raw of arr(p.aflicciones,'player.aflicciones')){const a=obj(raw,'afliccion');if(!TIPOS_AFLICCION_PERSISTENTE.has(a.tipo))fail('afliccion.tipo');for(const k of ['familia','nombre','daño','origen'])str(a[k],'afliccion.'+k);num(a.grado,'afliccion.grado',1);num(a.duracion,'afliccion.duracion',1);}
    const h=obj(p.historialAcciones,'historialAcciones');if(h.version!==HISTORIAL_ACCIONES_VERSION)fail('historialAcciones.version');integer(h.secuencia,'historialAcciones.secuencia');
    for(const raw of arr(h.eventos,'historialAcciones.eventos')){const e=obj(raw,'evento');str(e.id,'evento.id');if(!TIPOS_ACCION_VALIDOS.has(e.tipo))fail('evento.tipo');integer(e.orden,'evento.orden',1);num(e.importancia,'evento.importancia',1);arr(e.etiquetas,'evento.etiquetas').forEach(v=>str(v,'etiqueta'));obj(e.contexto,'evento.contexto');obj(e.consecuencias,'evento.consecuencias');const m=obj(e.momento,'evento.momento');str(m.reino,'momento.reino');for(const k of ['arco','etapa','turno'])num(m[k],'momento.'+k);}
    arr(p.historialReinos,'historialReinos');arr(p.historialArcos,'historialArcos');const ilu=obj(p.iluminacion,'iluminacion'),trib=obj(p.tribulacionCorazon,'tribulacionCorazon');bool(ilu.alcanzada,'iluminacion.alcanzada');bool(trib.superada,'tribulacion.superada');bool(trib.pendienteReintento,'tribulacion.pendienteReintento');bool(p.granPerfeccionLianQi,'granPerfeccionLianQi');
    for(const k of ['historialReinos','historialArcos'])for(const raw of arr(p[k],k)){const e=obj(raw,k+'.entrada');str(e.reino,k+'.reino');integer(e.arco,k+'.arco',1);}
    if(ilu.semillaCorazonDao!==null)str(ilu.semillaCorazonDao,'iluminacion.semillaCorazonDao');
    const fac=obj(p.facciones,'facciones');if(!ref(fac,p.faccion_principal))fail('faccion_principal');for(const [id,raw]of Object.entries(fac)){const f=obj(raw,'faccion');if(!ref(FACCIONES,id))fail('faccion.id');str(f.estado,'faccion.estado');for(const k of ['saldo','merito','gastos'])num(f[k],'faccion.'+k);num(f.reputacion,'faccion.reputacion',-Infinity);arr(f.historial,'faccion.historial').forEach(x=>obj(x,'faccion.movimiento'));}
    const prof=obj(p.profesiones,'profesiones');for(const id of ['examen','herboristeria','alquimia','forja','inscripcion']){const o=obj(prof[id],'profesiones.'+id);num(o.xp,id+'.xp');integer(o.rango,id+'.rango');bool(o.desbloqueada,id+'.desbloqueada');}
    for(const [id,fields]of Object.entries({examen:['materiales','hallazgos','descubrimientos','procedimientos'],herboristeria:['materiales','especies','procedimientos','nodos'],alquimia:['calidades','recetas']}))for(const k of fields)obj(prof[id]?.[k],id+'.'+k);
    for(const id of ['examen','herboristeria']){const o=plain(prof[id])?prof[id]:{};for(const k of ['materiales','procedimientos'])for(const v of Object.values(obj(o[k],id+'.'+k)))num(v,id+'.'+k);
      const records=id==='examen'?o.descubrimientos:o.especies;for(const raw of Object.values(obj(records,id+'.especies'))){const r=obj(raw,id+'.especie');num(r.observaciones,'especie.observaciones');num(r.exitos,'especie.exitos');obj(r.procedimientos,'especie.procedimientos');}}
    for(const [id,raw]of Object.entries(obj(prof.herboristeria?.nodos,'herboristeria.nodos'))){if(!ref(NODOS_HERBORISTERIA,id))fail('nodo.id');const n=obj(raw,'nodo');for(const v of Object.values(obj(n.partes,'nodo.partes')))num(v,'nodo.parte');for(const k of ['observaciones','exitos','cambios','muertaHasta'])num(n[k],'nodo.'+k);num(n.cambioObservado,'nodo.cambioObservado',-1);}
    for(const [id,raw]of Object.entries(obj(prof.alquimia?.recetas,'alquimia.recetas'))){if(!ref(RECETAS,id))fail('receta.id');const r=obj(raw,'receta');bool(r.conocida,'receta.conocida');num(r.validas,'receta.validas');if(r.mejor!==null&&!ref(CALIDADES_ALQUIMIA,r.mejor))fail('receta.mejor');obj(r.hitos,'receta.hitos');const ds=obj(r.dominios,'receta.dominios');for(const d of Object.values(ds)){const dr=obj(d,'receta.dominio');bool(dr.excepcional,'dominio.excepcional');if(dr.metodo!==null)arr(dr.metodo,'dominio.metodo').forEach(v=>{if(![1,2,3].includes(v))fail('dominio.metodo');});}for(const rawQ of arr(r.pulsos,'receta.pulsos')){const q=obj(rawQ,'pulso');obj(q.aciertos,'pulso.aciertos');arr(q.descartados,'pulso.descartados');if(q.confirmado!==null&&![1,2,3].includes(q.confirmado))fail('pulso.confirmado');}}
  } catch { errores.push("Estructura de save ilegible o inválida"); }
  return errores;
}
