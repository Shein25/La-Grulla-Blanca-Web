class Juego {

  // ------------------------------------------------------------------------
  //  7.1  CICLO DE VIDA · construcción del personaje, arranque y final de la
  //       partida
  //
  //  Índice por tema (no por orden en el archivo):
  //    arranque y creación   constructor, arranque, nuevaPartida,
  //                          creacionOrigen, creacionRaiz, crearPersonaje,
  //    entrada de texto      preguntar
  //    final de partida      muerte, flujoSalir, terminar
  // ------------------------------------------------------------------------

  constructor() {
    this.contenido = document.getElementById("contenido");
    this.terminal = document.getElementById("terminal");
    this.barra = document.getElementById("barra");
    this.avisoEl = document.getElementById("avisoSave");
    this.mapaSvg = document.getElementById("mapaSvg");
    // Ventana de combate: capa dentro de #zona, nunca un dialog modal (#form/#entrada siguen vivos).
    this.zonaEl = document.getElementById("zona");
    this.cbEl = document.getElementById("combateUI");
    this.cbJugadorEl = document.getElementById("cbJugador");
    this.cbCombatientesEl = document.getElementById("cbCombatientes");
    this.cbSueltosEl = document.getElementById("cbSueltos");
    this.cbIntencionEl = document.getElementById("cbIntencion");
    this.cbLogEl = document.getElementById("cbLog");
    this.cbDrawerEl = document.getElementById("cbDrawer");
    this.cbAccionesEl = document.getElementById("cbAcciones");
    this.cbResumenPreparadasEl = document.getElementById("cbResumenPreparadas");
    this.cbTituloEl = document.getElementById("cbTitulo");
    this.cbRondaEl = document.getElementById("cbRonda");
    this.cbResultadoEl = document.getElementById("cbResultado");
    this.cbResultadoPanelEl = document.getElementById("cbResultadoPanel");
    this.mapaSalaEl = document.getElementById("mapaSala");
    this.panelInfoEl = document.getElementById("panelInfo");
    this.vitalesEl = document.getElementById("vitales");
    this.rooms = null; this.player = null;
    this.flags = {arc1:crearArc1()}; this.quests = {P:'activa'}; this.gates = crearEstadoGates();
    this.pos = "camino"; this.vivos = []; this.cadaveres = {}; this.objetosTirados = {};
    this.combate = null; this.terminado = false; this.pregunta = null;
    this.eleccionActivaEl = null;
    this.visitadas = new Set();
    this.atlas = { salas: {}, personas: {}, criaturas: {} };
    this.atlasCapaVista = null;
    // Estado SÓLO de interfaz (ver68 · Etapa 2B). Ninguno de los dos entra en serializar()
    // ni en deserializar(): el Atlas se reconstruye al abrirse desde la posición física.
    this.atlasAreaVista = null;
    this.atlasAcordeones = { lugares: new Set(), personas: new Set(), bestiario: new Set() };
    this.ofiSeleccion = "examen";
    this.ofiReceta = "sangre";
    this.elaboracion = null;
    this.alquimiaResultado = null;
    this.alquimiaCategoriaAbierta = "vitalidad";
    this.alquimiaRecetasAbiertas = new Set(); // Bitácora: fichas de receta desplegadas (por defecto, todas contraídas)
    this.ofiUltimoResultado = null;
    this.ofiUltimoResultadoHerboristeria = null;
    this.ofiUltimoResultadoExamen = null;
    this.saturacion = {};
    this.turnoGlobal = 0;
    this.relojEcologico = 0;
    this.respawnEn = {};
    this.interrupcionEn = {};
    this.errantes = JSON.parse(JSON.stringify(ERRANTES_INICIALES));
    this.posicionNPC = crearPosicionNPC();
    this.conocimientoNPC = crearConocimientoNPC();
    this.playerIdentityKnowledge = {version:1,npcIds:[]};
    globalThis.ASTRA_SELF_INTRODUCTION_B22?.cancelPending?.(this);
    this._tAviso = null;
    this.misionesNuevas = new Set();
    this.misionAbierta = null;
    this.categoriasMisionesAbiertas = new Set(["activas", "rumores"]);
  }

  // ---------- salida ----------

  arranque() {
    const claves=[CLAVE_AUTO,...Array.from({length:NSLOTS},(_,i)=>CLAVE_SLOT(i+1))];
    const slots=claves.map(k=>this.leerSlotDetallado(k));
    const vieja=this.leerSlotDetallado(CLAVE_VIEJA);
    if(vieja.estado!=="VACÍO")this.salida(MENSAJE_SAVE_INCOMPATIBLE,"sistema");
    if(slots.some(s=>s.estado!=="VACÍO"&&s.estado!=="VÁLIDO"))this.salida("Hay slots incompatibles o corruptos. Se conservan sin cambios; sólo pueden cargarse los VÁLIDOS.","sistema");
    if(slots.some(s=>s.estado==="VÁLIDO"))this.preguntar("Hay partidas válidas. ¿(c)argar o (n)ueva?",r=>{if(r.trim().toLowerCase().startsWith("c"))this.menuCargar();else this.nuevaPartida();},"(c/n)");
    else { if(slots.some(s=>s.estado!=="VACÍO"))this.salida("Inicia una Nueva Partida.");this.nuevaPartida(); }
  }

  nuevaPartida() {
    this.atlas = { salas: {}, personas: {}, criaturas: {} };
    this.rooms = JSON.parse(JSON.stringify(ROOMS));
    this.flags = {arc1:crearArc1()}; this.quests = {P:'activa'}; this.gates = crearEstadoGates();
    this.combate = null; this.vivos = []; this.cadaveres = {}; this.objetosTirados = {}; this.terminado = false;
    this.visitadas = new Set();
    this.saturacion = {};
    this.turnoGlobal = 0;
    this.relojEcologico = 0;
    this.respawnEn = {};
    this.interrupcionEn = {};
    this.errantes = JSON.parse(JSON.stringify(ERRANTES_INICIALES));
    this.posicionNPC = crearPosicionNPC();
    this.conocimientoNPC = crearConocimientoNPC();
    this.playerIdentityKnowledge = {version:1,npcIds:[]};
    globalThis.ASTRA_SELF_INTRODUCTION_B22?.cancelPending?.(this);
    this.misionesNuevas = new Set();
    this.misionAbierta = null;
    this.categoriasMisionesAbiertas = new Set(["activas", "rumores"]);
    this.actualizarBotonMisiones();

    const div = document.createElement("div");
    div.className = "intro";
    div.innerHTML = `
      <div class="intro-kanji">${INTRO.kanji}</div>
      <div class="intro-titulo">${INTRO.titulo}</div>
      <div class="intro-sub">${INTRO.sub}</div>
      <div class="intro-texto">${INTRO.texto.split(/\n\n/).map((parrafo, i) =>
        `<p class="intro-parrafo${i === 2 ? ' intro-giro' : i === 9 ? ' intro-cierre' : ''}">${i === 0
          ? '<strong class="intro-apertura">' + parrafo.replace('\n', '</strong><br>') : parrafo}</p>`
      ).join('')}</div>`;
    this.contenido.appendChild(div);
    this.abajo();

    this.pedirNombrePersonaje();
  }

  pedirNombrePersonaje() {
    this.preguntar("Tu nombre:", (r) => {
      const error = errorNombrePersonaje(r);
      if (error) {
        this.salida(error, "error");
        this.pedirNombrePersonaje();
        return;
      }
      const nombre = String(r ?? "").replace(/\s+/g, " ").trim();
      this.creacionOrigen(nombre);
    });
  }

  creacionOrigen(nombre) {
    this.preguntarEleccionMultiple({
      contexto: ["\nAntes de la piedra, el examinador te mira por primera vez:"],
      pregunta: "«Los nombres aquí no me dicen nada. Dime de dónde vienes.»",
      opciones: [
        { valor: "1", insignia: "1)", texto: "«De la tierra. Del arrozal que ya no nos pertenece.»" },
        { valor: "2", insignia: "2)", texto: "«De la academia. Del examen que no me quiso.»" },
        { valor: "3", insignia: "3)", texto: "«De la calle. Del mercado sur de Anling.»" },
      ],
      marcador: "(1/2/3)",
      hint: "1, 2 o 3",
      callback: (r) => {
        const origen = { "1": "campesino", "2": "escolar", "3": "callejero" }[r.trim()] || "campesino";
        this.salida("\n" + ORIGENES[origen].texto, "destacado");
        this.creacionRaiz(nombre, origen);
      }
    });
  }

  creacionRaiz(nombre, origen) {
    this.creacionRaizDecision(nombre,origen,{fuego:0,metal:0,agua:0},0);
  }

  creacionRaizDecision(nombre,origen,puntos,paso){
    const preguntas=[
      ['La Piedra de las Raíces responde al primer contacto. ¿Qué impulso sigues?',
        ['Avanzar aunque arda','Sostener la presión sin ceder','Escuchar el pulso antes de actuar']],
      ['Aparece una grieta de luz entre tus dedos. ¿Qué haces?',
        ['La atraviesas con decisión','Alineas sus bordes','Dejas que encuentre su cauce']],
      ['El eco de la piedra te devuelve un recuerdo. ¿Qué conservas?',
        ['La chispa del comienzo','La forma que resistió','El movimiento que siguió']],
    ];
    const [pregunta,opciones]=preguntas[paso],raices=['fuego','metal','agua'];
    this.preguntarEleccionMultiple({
      contexto: [paso===0?'\nEl examinador tiende la PIEDRA DE LAS RAÍCES.':'\nLa Piedra aún no termina de leerte.'],
      pregunta,
      opciones: opciones.map((texto,i)=>({valor:String(i+1),insignia:`${i+1})`,texto})),
      marcador: `(1/2/3 · ${paso+1}/3)`,
      hint: "1, 2 o 3",
      callback: (r) => {
        puntos[raices[Number(r.trim())-1]||'agua']++;
        if(paso<2)return this.creacionRaizDecision(nombre,origen,puntos,paso+1);
        const mayor=Math.max(...Object.values(puntos));
        const empate=raices.filter(id=>puntos[id]===mayor);
        if(empate.length===1)return this.crearPersonaje(nombre,empate[0],origen);
        this.preguntarEleccionMultiple({
          contexto:['La Piedra vacila entre dos pulsos. Una última reacción inclina la lectura.'],
          pregunta:'¿Qué sensación dejas prevalecer?',
          opciones:empate.map((id,i)=>({valor:String(i+1),insignia:`${i+1})`,texto:RAICES[id].nombre})),
          marcador:'(reacción final)',hint:empate.map((_,i)=>i+1).join('/'),
          callback:eleccion=>this.crearPersonaje(nombre,empate[Number(eleccion.trim())-1]||empate[0],origen),
        });
      }
    });
  }

  crearPersonaje(nombre, raiz, origen) {
    const r = RAICES[raiz], o = ORIGENES[origen];
    this.salida("\n" + r.texto, "destacado");
    const p = {
      name: nombre, es_jugador: true, mob_id: "", unico: false,
      hp: 16, max_hp: 16, ataque: 1 + r.ataque, defensa: 10 + r.defensa, esquiva: ESQUIVA_INNATA, daño: "1d3",
      qi_recompensa: 0, loot: [],
      raiz, raiz_secundaria: null, reino: "LianQi", etapa: 1, qi: 0, qi_max: VASO_ETAPA[1],
      comprension: 0, piedras: 0, impurezas: 0, origen, metodo: null,
      contribucion: 0, prestigio: 0, titulo: "aspirante aceptado", calidad_fundacion: null,
      // --- cultivo (ver CONTRATO UI · CULTIVO) ---
      // granPerfeccionLianQi es un HITO IRREVERSIBLE, no un valor derivado: se
      // fija una vez al consagrar formalmente la Gran Perfección y no se vuelve
      // a evaluar. Si se calculara como qi === qi_max, gastar qi en una técnica
      // "revertiría" narrativamente un hito que ya ocurrió.
      granPerfeccionLianQi: false,
      iluminacion: { alcanzada: false, semillaCorazonDao: null },
      tribulacionCorazon: { superada: false, pendienteReintento: false },
      // Ambos historiales guardan SOLO lo ya cerrado, nunca el presente: el
      // arco/reino actual se calcula siempre con arcoActual(p) y p.reino/p.etapa.
      historialReinos: [],
      historialArcos: [],
      cultivo_version: 1,
      // Biografía narrativa canónica. No contiene moralidad ni afinidad de Dao.
      historialAcciones: { version: HISTORIAL_ACCIONES_VERSION, secuencia: 0, eventos: [] },
      alquimia: 0, fallos_alquimia: 0, heridas_meridianos: 0,
      aflicciones: [],
      profesiones: {
        examen: { xp: 0, rango: 0, materiales: {}, total: 0, cadaveres: 0, hallazgos: {}, descubrimientos: {}, procedimientos: {}, desbloqueada: false },
        // PROVISIONAL_3C1 · REVISAR_EN_PROLOGO_M01: acceso práctico, sin concesión narrativa.
        herboristeria: { xp: 0, rango: 0, materiales: {}, total: 0, especies: {}, procedimientos: {}, nodos: {}, desbloqueada: true },
        alquimia: { xp: 0, rango: 0, elaboraciones: 0, calidades: {}, recetas: {}, desbloqueada: false },
        forja: { xp: 0, rango: 0, desbloqueada: false }, inscripcion: { xp: 0, rango: 0, desbloqueada: false },
      },
      profesiones_version: 6,
      facciones: {
        grulla_blanca: { estado: "inactivo", saldo: 0, merito: 0, reputacion: 0, gastos: 0, historial: [] },
      },
      faccion_principal: "grulla_blanca",
      facciones_version: 1,
      actividad_reposo: ACCIONES_DORMIR,
      afinidad: {},
      // PROVISIONAL_3C1 · REVISAR_EN_PROLOGO_M01: uniforme y espada para usar el estado intermedio.
      inventario: ["pocion"],
      equipado: {},
      tecnicas: {}, puntos_tecnica_total: 1, meridianos_version: 3, equipo_version: 2,
      // Configuración de combate y presets. Ver CONTRATO DE DISEÑO · BUILDS Y COMBATE.
      // La técnica concedida por la raíz empieza preparada, pero SIN invertir
      // puntos ni elegir ramas: preparar es loadout, no especialización.
      tecnicas_preparadas: [r.tecnica], builds: [], build_activa: null, build_seq: 0, builds_version: 2,
    };
    p.tecnicas[r.tecnica] = { maestria: 0, usos: 0, practica: 0, ramas: { 1: 0, 2: 0, 3: 0 } };
    const perk = [];
    if (origen === "campesino") {
      p.max_hp += 2; p.hp = p.max_hp;
      p.inventario.push("pocion", "pocion");
      perk.push("Manos de campo: +2 de vida máxima. Las pociones de tu madre viajan contigo.");
    } else if (origen === "escolar") {
      p.comprension = 2;
      perk.push("Tres exámenes fracasados enseñan a leer el mundo: empiezas con comprensión 2.");
    } else if (origen === "callejero") {
      p.inventario.push("cuchillo_hueso");
      p.piedras = 4;
      perk.push("El cuchillo de hueso de Anling sigue contigo; podrás elegirlo en lugar de la espada de práctica. Piedras rescatadas de la ruina: +4.");
    }
    this.player = p;
    this.flags.arc1.hitos.raizDiagnosticada=true;
    this.anclarArc1('tao_ming','P','registro','REGISTRO_INICIAL_COMPLETADO');
    this.gates = crearEstadoGates();
    this.pos = "patio_raices";
    // El examen termina antes de la puerta: el tutorial exterior empieza físicamente aquí.
    this.visitadas.add(this.pos);
    this.recordarAtlas();
    this.salida(`\n«${nombre}, ${o.nombre}, raíz de ${r.nombre}.» El examinador anota el resultado en una tablilla provisional.`);
    if (perk.length) this.salida(perk.join("\n"), "destacado");
    this.salida("La Piedra ha dictado su diagnóstico. Sigue el sendero hasta el registro; tu equipo te espera en el descansillo.");
    this.entrarSala();
    this.actualizarBarra();
  }

  // ---------- historial de acciones narrativas ----------

  tipoAccionCanonico(tipo) {
    return String(tipo ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  }

  datosNarrativosPlanos(valor, defecto = {}) {
    if (!valor || typeof valor !== "object" || Array.isArray(valor)) return { ...defecto };
    try { return JSON.parse(JSON.stringify(valor)); }
    catch { return { ...defecto }; }
  }

  normalizarHistorialAcciones() {
    const p = this.player;
    if (!p) return null;
    if (!p.historialAcciones || typeof p.historialAcciones !== "object" || Array.isArray(p.historialAcciones)) {
      p.historialAcciones = { version: HISTORIAL_ACCIONES_VERSION, secuencia: 0, eventos: [] };
    }
    const h = p.historialAcciones;
    if (!Array.isArray(h.eventos)) h.eventos = [];
    if (!Number.isFinite(h.secuencia) || h.secuencia < 0) h.secuencia = 0;

    const limpios = [];
    const claves = new Set();
    for (const bruto of h.eventos) {
      if (!bruto || typeof bruto !== "object") continue;
      const tipo = this.tipoAccionCanonico(bruto.tipo);
      if (!TIPOS_ACCION_VALIDOS.has(tipo)) continue;
      const clave = String(bruto.clave ?? "").trim();
      if (clave && claves.has(clave)) continue;
      if (clave) claves.add(clave);
      const ordenBruto = Number(bruto.orden);
      const orden = Number.isFinite(ordenBruto) && ordenBruto > 0 ? Math.floor(ordenBruto) : ++h.secuencia;
      h.secuencia = Math.max(h.secuencia, orden);
      const importancia = Math.max(1, Math.min(5, Math.round(Number(bruto.importancia) || 1)));
      const etiquetas = [...new Set((Array.isArray(bruto.etiquetas) ? bruto.etiquetas : [])
        .map(x => String(x ?? "").trim().toLowerCase()).filter(Boolean))];
      const momentoBruto = this.datosNarrativosPlanos(bruto.momento);
      limpios.push({
        id: String(bruto.id || `accion_${orden}`),
        orden, tipo, importancia, etiquetas,
        contexto: this.datosNarrativosPlanos(bruto.contexto),
        consecuencias: this.datosNarrativosPlanos(bruto.consecuencias),
        momento: {
          arco: Number.isFinite(Number(momentoBruto.arco)) ? Number(momentoBruto.arco) : (arcoActual(p) || 1),
          reino: String(momentoBruto.reino || p.reino || "LianQi"),
          etapa: Number.isFinite(Number(momentoBruto.etapa)) ? Number(momentoBruto.etapa) : (Number(p.etapa) || 1),
          turno: Number.isFinite(Number(momentoBruto.turno)) ? Number(momentoBruto.turno) : 0,
        },
        ...(clave ? { clave } : {}),
      });
    }
    h.eventos = limpios.sort((a, b) => a.orden - b.orden);
    h.version = HISTORIAL_ACCIONES_VERSION;
    // Esquema actual cerrado: no conservar metadatos ajenos a los hechos registrados.
    p.historialAcciones = { version: h.version, secuencia: h.secuencia, eventos: h.eventos };
    return p.historialAcciones;
  }

  registrarAccion(tipo, datos = {}) {
    const p = this.player;
    if (!p) return null;
    const canonico = this.tipoAccionCanonico(tipo);
    if (!TIPOS_ACCION_VALIDOS.has(canonico)) {
      console.warn(`[La Grulla Blanca] Acción narrativa desconocida: ${canonico || "(vacía)"}`);
      return null;
    }
    const h = this.normalizarHistorialAcciones();
    const clave = String(datos.clave ?? "").trim();
    if (clave) {
      const existente = h.eventos.find(e => e.clave === clave);
      if (existente) return existente;
    }
    const orden = ++h.secuencia;
    const importancia = Math.max(1, Math.min(5, Math.round(Number(datos.importancia) || 1)));
    const etiquetas = [...new Set((Array.isArray(datos.etiquetas) ? datos.etiquetas : [])
      .map(x => String(x ?? "").trim().toLowerCase()).filter(Boolean))];
    const momentoDado = this.datosNarrativosPlanos(datos.momento);
    const evento = {
      id: `accion_${orden}`,
      orden,
      tipo: canonico,
      importancia,
      etiquetas,
      contexto: this.datosNarrativosPlanos(datos.contexto),
      consecuencias: this.datosNarrativosPlanos(datos.consecuencias),
      momento: {
        arco: Number.isFinite(Number(momentoDado.arco)) ? Number(momentoDado.arco) : (arcoActual(p) || 1),
        reino: String(momentoDado.reino || p.reino || "LianQi"),
        etapa: Number.isFinite(Number(momentoDado.etapa)) ? Number(momentoDado.etapa) : (Number(p.etapa) || 1),
        turno: Number.isFinite(Number(momentoDado.turno)) ? Number(momentoDado.turno) : (Number(this.turnoGlobal) || 0),
      },
      ...(clave ? { clave } : {}),
    };
    // Defensa de arquitectura: una acción no puede almacenar interpretación de Dao.
    // Sólo hechos. Los pesos temáticos pertenecen a la reflexión posterior.
    h.eventos.push(evento);
    return evento;
  }

  obtenerAcciones(filtro = {}) {
    const h = this.normalizarHistorialAcciones();
    if (!h) return [];
    const tiposFiltro = filtro.tipos ?? filtro.tipo;
    const tipos = tiposFiltro == null ? null : new Set((Array.isArray(tiposFiltro) ? tiposFiltro : [tiposFiltro])
      .map(x => this.tipoAccionCanonico(x)).filter(x => TIPOS_ACCION_VALIDOS.has(x)));
    const etiquetas = filtro.etiquetas == null ? [] : (Array.isArray(filtro.etiquetas) ? filtro.etiquetas : [filtro.etiquetas])
      .map(x => String(x ?? "").trim().toLowerCase()).filter(Boolean);
    const importanciaMinima = Math.max(1, Math.min(5, Number(filtro.importanciaMinima) || 1));
    const contexto = this.datosNarrativosPlanos(filtro.contexto);
    return h.eventos.filter(e => {
      if (tipos && !tipos.has(e.tipo)) return false;
      if (e.importancia < importanciaMinima) return false;
      if (filtro.arco != null && Number(e.momento?.arco) !== Number(filtro.arco)) return false;
      if (filtro.reino != null && String(e.momento?.reino) !== String(filtro.reino)) return false;
      if (etiquetas.length && !etiquetas.every(tag => e.etiquetas.includes(tag))) return false;
      for (const [k, v] of Object.entries(contexto)) if (e.contexto?.[k] !== v) return false;
      return true;
    });
  }

  tieneAccion(tipo, filtro = {}) {
    return this.obtenerAcciones({ ...filtro, tipo }).length > 0;
  }

  obtenerAccionesImportantes({ importanciaMinima = 3, limite = null } = {}) {
    const acciones = this.obtenerAcciones({ importanciaMinima })
      .slice().sort((a, b) => (b.importancia - a.importancia) || (a.orden - b.orden));
    return Number.isFinite(Number(limite)) ? acciones.slice(0, Math.max(0, Number(limite))) : acciones;
  }

  obtenerRecuerdosParaIluminacion({ limite = 4 } = {}) {
    // Deliberadamente devuelve hechos crudos. La Iluminación decidirá después
    // cómo convertirlos en escenas y qué significado les atribuye el jugador.
    return this.obtenerAccionesImportantes({ importanciaMinima: 3, limite });
  }





  // ---------- técnicas ----------

  // ---------- técnicas ----------

  // ----------------------------------------------------------------------
  // CONTRATO · ELECCIONES MÚLTIPLES
  // Toda decisión cerrada (2 o más alternativas fijas) debe renderizarse con
  // este sistema. La escena puede añadir contexto narrativo antes del bloque,
  // pero la pregunta y sus opciones deben salir juntas mediante el renderer
  // .mc-* para que futuras IA/programadores mantengan el mismo criterio visual.
  // ----------------------------------------------------------------------
  desactivarEleccionActiva() {
    if (!this.eleccionActivaEl) return;
    this.eleccionActivaEl.classList.add("mc-inactiva");
    this.eleccionActivaEl.querySelectorAll("button.mc-opcion").forEach(btn => {
      btn.disabled = true;
      btn.setAttribute("aria-disabled", "true");
    });
    this.eleccionActivaEl = null;
  }

  mostrarEleccionMultiple(marcador, config = {}) {
    const bloque = document.createElement("div");
    bloque.className = "mc-bloque";

    if (config.titulo) {
      const titulo = document.createElement("div");
      titulo.className = "mc-titulo";
      titulo.textContent = String(config.titulo);
      bloque.appendChild(titulo);
    }

    const contexto = Array.isArray(config.contexto) ? config.contexto : [];
    if (contexto.length) {
      const caja = document.createElement("div");
      caja.className = "mc-contexto";
      for (const linea of contexto) {
        if (linea == null || String(linea).trim() === "") continue;
        const p = document.createElement("p");
        p.textContent = String(linea);
        caja.appendChild(p);
      }
      if (caja.childNodes.length) bloque.appendChild(caja);
    }

    if (config.pregunta) {
      const pregunta = document.createElement("div");
      pregunta.className = "mc-pregunta";
      pregunta.textContent = capitalizarUI(config.pregunta);
      bloque.appendChild(pregunta);
    }

    const lista = document.createElement("div");
    lista.className = "mc-opciones";
    const opciones = Array.isArray(config.opciones) ? config.opciones : [];
    for (const op of opciones) {
      const valor = String(op?.valor ?? "").trim();
      if (!valor) continue;
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "mc-opcion";
      boton.dataset.valor = valor;
      boton.setAttribute("aria-label", `${op?.insignia || valor}: ${op?.texto || valor}`);
      const insignia = document.createElement("span");
      insignia.className = "mc-opcion-insignia";
      insignia.textContent = op?.insignia || valor.toUpperCase();
      const texto = document.createElement("span");
      texto.className = "mc-opcion-texto";
      texto.textContent = capitalizarUI(op?.texto || valor);
      boton.append(insignia, texto);
      boton.addEventListener("click", () => {
        if (!this.pregunta) return;
        enviarComando(valor);
      });
      lista.appendChild(boton);
    }
    bloque.appendChild(lista);

    const pie = document.createElement("div");
    pie.className = "mc-pie";
    pie.textContent = capitalizarUI(config.marcador || marcador || "");
    bloque.appendChild(pie);

    this.contenido.appendChild(bloque);
    this.eleccionActivaEl = bloque;
    this.abajo();
  }

  preguntarEleccionMultiple({ contexto = [], titulo = "", contextoEnBloque = false, pregunta = "", opciones = [], callback, marcador = "", hint, maxLength } = {}) {
    const lineas = (Array.isArray(contexto) ? contexto : [contexto])
      .filter(linea => linea != null && String(linea).trim() !== "")
      .map(linea => String(linea));
    if (!contextoEnBloque) {
      for (const linea of lineas) this.salida(linea);
    }
    const marcadorFinal = marcador || `(${opciones.map(op => String(op?.valor ?? "").trim()).filter(Boolean).join("/")})`;
    const hintFinal = hint || opciones.map(op => String(op?.valor ?? "").trim()).filter(Boolean).join(", ").replace(/, ([^,]+)$/u, " o $1");
    this.preguntar(marcadorFinal, callback, hintFinal, {
      maxLength,
      multipleChoice: {
        titulo,
        contexto: contextoEnBloque ? lineas : [],
        pregunta,
        opciones,
        marcador: marcadorFinal
      }
    });
  }

  preguntar(texto, callback, hint, opciones = {}) {
    this.desactivarEleccionActiva();
    this.pregunta = { callback, ...opciones };
    if (opciones.multipleChoice) this.mostrarEleccionMultiple(texto, opciones.multipleChoice);
    else this.addLine(texto, "pregunta");
    entrada.placeholder = hint || "respuesta…";
    if (Number.isFinite(opciones.maxLength)) entrada.maxLength = Math.max(1, Math.floor(opciones.maxLength));
    else entrada.removeAttribute("maxlength");
    this.abajo();
  }

  muerte() {
    this.salida("\nTu qi se dispersa como leche vertida en un río. HAS CAÍDO.","error");
    const hay=this.leerSlotDetallado(CLAVE_AUTO).estado==="VÁLIDO";
    const ops=hay?"(c)argar el último autoguardado, (n)ueva o (s)alir":"(n)ueva o (s)alir";
    this.preguntar(`¿${ops}?`,r=>{
      const s=r.trim().toLowerCase();
      if(s.startsWith("c")){
        const actual=this.leerSlotDetallado(CLAVE_AUTO);
        if(!hay||actual.estado!=="VÁLIDO"){this.salida("No hay un autoguardado válido. Inicia una Nueva Partida.","error");return;}
        if(this.deserializar(actual.data))this.salida("El qi vuelve a circular: retrocedes al último autoguardado. El corazón demoníaco espera tu regreso.");
      } else if(s.startsWith("s"))this.terminar();else this.nuevaPartida();
    },hay?"(c/n/s)":"(n/s)");
  }

  flujoSalir() {
    this.preguntar("¿Autoguardar antes de salir? (s/n)", (r) => {
      if (r.trim().toLowerCase() === "s") this.autoguardar(true);
      this.terminar();
    }, "(s/n)");
  }

  terminar() {
    this.terminado = true;
    this.salida("\nEl mundo mortal te reclama. Hasta la próxima.\n(Recarga la página para volver a la montaña.)", "destacado");
  }


  // ------------------------------------------------------------------------
  //  7.2  PERSISTENCIA · guardado, carga, slots y validación de partidas
  //       viejas
  //
  //  Índice por tema:
  //    slots (bajo nivel)    leerSlot, escribirSlot, infoPartida
  //    serialización         serializar, deserializar, autoguardar
  //    menús                 menuGuardar, menuCargar, menuNueva
  // ------------------------------------------------------------------------

  leerSlot(clave) {
try { const raw = localStorage.getItem(clave); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  escribirSlot(clave, data) {
    try {
      if (validarSave329(data).length) return false;
      localStorage.setItem(clave, JSON.stringify(data)); return true;
    } catch { return false; }
  }

  serializar() {
    // Snapshot puro: guardar no poda recursos ni adelanta contadores. Sin estado UI.
    const salas = {};
    for (const [rid, s] of Object.entries(this.rooms)) salas[rid] = { items: s.items || [], oculto: s.oculto || [] };
    const identity=ASTRA_NATIVE_IDENTITY.projectIdentity(this);
    return JSON.parse(JSON.stringify({ saveSchemaVersion: SAVE_SCHEMA_VERSION,
      gates: this.gates, player: this.player, pos: this.pos, flags: this.flags, quests: this.quests,
      salas, visitadas: [...this.visitadas], atlas: this.atlas, saturacion: this.saturacion,
      turnoGlobal: this.turnoGlobal, relojEcologico: this.relojEcologico, respawnEn: this.respawnEn,
      interrupcionEn: this.interrupcionEn, a08TerritoryVersion:2, errantes: this.errantes, cadaveres: this.cadaveres,
      objetosTirados: this.objetosTirados, npc_version: 1,
      posicionNPC: this.posicionNPC, conocimientoNPC: this.conocimientoNPC,
      ...(identity.npcIds.length ? {playerIdentityKnowledge:identity} : {}), fecha: Date.now() }));
  }

  deserializar(data) {
    globalThis.ASTRA_SELF_INTRODUCTION_B22?.cancelPending?.(this);
    if (data?.saveSchemaVersion !== SAVE_SCHEMA_VERSION) { this.salida(MENSAJE_SAVE_INCOMPATIBLE, "error"); return false; }
    const fallos = validarSave329(data);
    if (fallos.length) { this.salida("Partida CORRUPTA/INVÁLIDA: " + fallos.join(" · ") + ". Inicia una Nueva Partida.", "error"); return false; }
    let estado, preservado, vivos, huboCooldown;
    try {
      const copia = JSON.parse(JSON.stringify(data));
      if (validarSave329(copia).length) throw new Error("Snapshot inválido");
      const preparar = c => {
        const rooms = JSON.parse(JSON.stringify(ROOMS));
        for (const [rid, s] of Object.entries(c.salas)) { rooms[rid].items = s.items; rooms[rid].oculto = s.oculto; }
        const e = { rooms, visitadas: new Set(c.visitadas),
          posicionNPC: c.npc_version === 1 ? c.posicionNPC : crearPosicionNPC(),
          conocimientoNPC: c.npc_version === 1 ? c.conocimientoNPC : crearConocimientoNPC(),
          playerIdentityKnowledge: Object.hasOwn(c,'playerIdentityKnowledge') ? ASTRA_NATIVE_IDENTITY.validateIdentity(c.playerIdentityKnowledge) : {version:1,npcIds:[]} };
        for (const k of ["player","pos","flags","quests","gates","atlas","saturacion","turnoGlobal","relojEcologico","respawnEn","interrupcionEn","errantes","cadaveres","objetosTirados"]) e[k] = c[k];
        return e;
      };
      // Migración y reconciliación en un objeto aislado; el payload original
      // permanece intacto y un fallo no puede importar un estado parcial.
      const temporal = Object.assign(Object.create(Object.getPrototypeOf(this)), this, preparar(JSON.parse(JSON.stringify(copia))));
      for (const m of ["mostrarSala","recordarAtlas","actualizarMinimapa","actualizarPanel","salida"]) temporal[m] = () => {};
      // NORMALIZACIÓN/MIGRACIÓN PERSISTENTE: normalizarArc1() puede migrar un
      // save legado (agrega hitos, gates, y hasta salas a `visitadas` de forma
      // legítima). Esas mutaciones SÍ deben conservarse, así que se copian
      // aquí, antes de tocar la sala.
      temporal.normalizarArc1();
      for(const k of ['player','flags','quests','gates','posicionNPC','conocimientoNPC','cadaveres'])
        copia[k]=JSON.parse(JSON.stringify(temporal[k]));
      copia.visitadas=[...temporal.visitadas];
      // MATERIALIZACIÓN DERIVADA DE SALA: entrarSala() sólo se llama para
      // reconstruir `vivos` y el aviso de cooldown, algo que no se persiste
      // en el save. Su ejecución también puede disparar efectos de entrada
      // (hitos de misión, entrega de equipo, recreación del cadáver
      // tutorial, `visitadas.add(pos)`): cargar una partida no es lo mismo
      // que volver a entrar a la sala, así que esos efectos se descartan
      // íntegramente — no se copia nada de `temporal` después de esta
      // llamada, salvo `vivos`/`_huboMobsEnCooldown`.
      temporal.entrarSala(); vivos = temporal.vivos; huboCooldown = temporal._huboMobsEnCooldown;
      estado = preparar(JSON.parse(JSON.stringify(copia)));
      preservado = preparar(copia);
    } catch { this.salida("Partida CORRUPTA/INVÁLIDA. No se cargó ningún estado.", "error"); return false; }
    const anteriores = Object.getOwnPropertyDescriptors(this);
    try {
      Object.assign(this, estado, { vivos, _huboMobsEnCooldown: huboCooldown,
        combate: null, pregunta: null, terminado: false, elaboracion: null, alquimiaResultado: null,
        ofiUltimoResultado: null, ofiUltimoResultadoHerboristeria: null, ofiUltimoResultadoExamen: null,
        misionesNuevas: new Set(), misionAbierta: null, categoriasMisionesAbiertas: new Set(["activas","rumores"]),
        atlasAreaVista: null, atlasCapaVista: null, atlasAcordeones: { lugares:new Set(), personas:new Set(), bestiario:new Set() } });
      this.mostrarSala(); this.actualizarBarra(); this.actualizarPanel(); this.actualizarMinimapa();
      // Consultar UI puede normalizar/podar sobre la copia de render. El save restaura exactamente su estado.
      Object.assign(this, preservado);
      return true;
    } catch {
      for (const k of Object.keys(this)) if (!Object.hasOwn(anteriores,k)) delete this[k];
      Object.defineProperties(this, anteriores);
      this.salida("No se pudo cargar la partida. El estado anterior se conserva.", "error");
      return false;
    }
  }

  infoPartida(d) {
    const estado = this.clasificarPartida(d);
    if (estado === "INCOMPATIBLE") return estado + " · " + MENSAJE_SAVE_INCOMPATIBLE;
    if (estado !== "VÁLIDO") return estado + " · No se puede cargar. Inicia una Nueva Partida.";
    const p = d.player, fecha = new Date(d.fecha);
    return `VÁLIDO · ${p.name} · ${p.reino} etapa ${p.etapa} · ${ROOMS[d.pos].name} · ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`;
  }

  autoguardar(verbose = false) {
    if (!this.player || this.combate || this.terminado) return false;
    if (!this.escribirSlot(CLAVE_AUTO, this.serializar())) {
      this.salida("No se pudo autoguardar. El almacenamiento no está disponible o la partida no es válida.", "error");
      return false;
    }
    this.avisoAuto();
    if (verbose) this.salida("   · partida autoguardada.");
    return true;
  }

  menuGuardar() {
    if (this.terminado || !this.player) return;
    if (this.combate) { this.salida("No se puede guardar en pleno combate."); return; }
    if (this.pregunta) { this.salida("Responde antes a la pregunta pendiente."); return; }
    const out = ["— GUARDAR PARTIDA —"];
    for(let i=1;i<=NSLOTS;i++)out.push(`  ${i}) ${this.describirSlot(this.leerSlotDetallado(CLAVE_SLOT(i)))}`);
    this.salida(out.join("\n"));
    this.preguntar("¿En qué slot guardamos? (1/"+NSLOTS+" · 0 para cancelar)", r => {
      const n=Number(r.trim());
      if(!Number.isInteger(n)||n<1||n>NSLOTS){this.salida("Guardado cancelado.");return;}
      if(this.escribirSlot(CLAVE_SLOT(n),this.serializar()))this.salida(`Partida guardada en el slot ${n}.`);
      else this.salida("No se pudo guardar. El almacenamiento no está disponible o está lleno.","error");
    },"1 / 2 / 3 / 0");
  }

  menuCargar() {
    if (this.terminado) return;
    if (this.combate) { this.salida("No se puede cargar en pleno combate."); return; }
    if (this.pregunta) { this.salida("Responde antes a la pregunta pendiente."); return; }
    const slots=[{op:"a",clave:CLAVE_AUTO},...Array.from({length:NSLOTS},(_,i)=>({op:String(i+1),clave:CLAVE_SLOT(i+1)}))];
    const lecturas=slots.map(s=>({...s,...this.leerSlotDetallado(s.clave)}));
    this.salida(["— CARGAR PARTIDA —",...lecturas.map(s=>`  ${s.op}) ${this.describirSlot(s)}`)].join("\n"));
    if(!lecturas.some(s=>s.estado==="VÁLIDO")){this.salida("No hay partidas válidas para cargar. Inicia una Nueva Partida. Los slots se conservan.");return;}
    this.preguntar("¿Cuál partida VÁLIDA cargamos? (a = autoguardado · 0 para cancelar)",r=>{
      const op=r.trim().toLowerCase(),slot=slots.find(s=>s.op===(op==="auto"?"a":op));
      if(!slot){this.salida("Carga cancelada.");return;}
      const actual=this.leerSlotDetallado(slot.clave);
      if(actual.estado!=="VÁLIDO"){this.salida("Carga rechazada: "+actual.estado+". El slot se conserva.","error");return;}
      if(this.deserializar(actual.data))this.salida("El qi vuelve a circular. Partida cargada.");
    },"a / 1 / 2 / 3 / 0");
  }

  menuNueva() {
    if (this.terminado) return;
    if (this.pregunta) { this.salida("Responde antes a la pregunta pendiente."); return; }
    this.preguntar("¿Empezar una partida nueva? (Los slots guardados se conservan.) (s/n)", (r) => {
      if (r.trim().toLowerCase() === "s") this.nuevaPartida();
      else this.salida("Nada cambia. La montaña sigue esperando.");
    }, "(s/n)");
  }

  // ---------- arranque ----------


  // ------------------------------------------------------------------------
  //  7.3  MUNDO · salas, ecología, fauna errante, cadáveres, objetos tirados
  //       y botín
  //
  //  Índice por tema:
  //    saturación / pacing    saturacionDe, airarSaturacion, actividadReposo,
  //                           registrarActividadReposo,
  //                           reiniciarActividadReposo
  //    ecología / meditación  avanzarEcologia, intentarPulsoMeditacion,
  //                           buscarCandidatosAtraccion, atraerHostilVecino,
  //                           registrarInterrupcionMeditacion,
  //                           airearVenaLocal
  //    mobs errantes          moverErrantesTrasReposo, actualizarErrante,
  //                           actualizarErrantes, moverErrante,
  //                           moverErrantes
  //    salas                  venaActual, entrarSala, mostrarSala, cumple,
  //                           npcPresente
  //    objetos en el suelo    itemsNaturalesVisibles, objetosTiradosEnSala,
  //                           itemsVisibles, resumenObjetosTirados,
  //                           resolverItem, quitarItems
  //    cadáveres y botín      registrarCadaver, cadaveresEnSala,
  //                           etiquetaCadaver, resolverCadaver,
  //                           describirCadaver, recompensas,
  //                           porcentajeBotin, registrarBotinDescubierto
  //    atlas (memoria del     salidasAtlas, recordarAtlas, recordarCriatura,
  //    jugador sobre el mundo) registrosAtlas, indiceAreasAtlas,
  //                           agruparRegistrosAtlas
  // ------------------------------------------------------------------------

  saturacionDe(rid) { return this.saturacion[rid] || 0; }

  airarSaturacion() { this.saturacion = {}; }

  actividadReposo() {
    if (!this.player) return 0;
    const valor = Number.isFinite(this.player.actividad_reposo) ? this.player.actividad_reposo : ACCIONES_DORMIR;
    return Math.max(0, Math.min(ACCIONES_DORMIR, valor));
  }

  registrarActividadReposo(cantidad = 1) {
    if (!this.player || cantidad <= 0) return;
    this.player.actividad_reposo = Math.min(ACCIONES_DORMIR, this.actividadReposo() + cantidad);
  }

  reiniciarActividadReposo() {
    if (this.player) this.player.actividad_reposo = 0;
  }

  // ========================================================================
  //  CONTRATO DE DISEÑO · INTEGRACIÓN NARRATIVA Y AYUDA (Etapa 8)
  //  ------------------------------------------------------------------------
  //  Toda mecánica nueva debe explicar tres cosas dentro del propio juego:
  //    1) cómo se descubre o aprende en ficción (NPC, hallazgo o consecuencia);
  //    2) qué comando permite actuar y qué consultas NO consumen tiempo;
  //    3) dónde puede releerse la regla en AYUDA/OFICIOS/MISIONES.
  //  Si una expansión mueve un nodo, criatura o estación, revisa también textos
  //  de misión, diálogos y AYUDA: ninguna pista debe apuntar a una ubicación vieja.
  //  No uses términos reservados antes de tiempo (p. ej. núcleos internos) ni
  //  prometas XP por observar, fallar, loot automático o materiales comprados.
  //  Las condiciones persistentes necesitan aviso la primera vez y una entrada
  //  estable en AYUDA con tipo/familia/grado, avance temporal y tratamiento.
  // ========================================================================

  pistaPrimeraAfliccion() {
    if (this.flags.ayuda_aflicciones_vista) return null;
    this.flags.ayuda_aflicciones_vista = true;
    return "   [Nueva condición persistente] El efecto seguirá contigo fuera del combate y avanzará cuando pase tiempo. ESTADO muestra su duración; AYUDA AFLICCIONES explica familias, grados y tratamientos.";
  }

  normalizarAflicciones() {
    if (!this.player) return [];
    if (!Array.isArray(this.player.aflicciones)) this.player.aflicciones = [];
    this.player.aflicciones = this.player.aflicciones.filter(a => a && TIPOS_AFLICCION_PERSISTENTE.has(a.tipo)).map(a => ({
      tipo: a.tipo,
      familia: String(a.familia || "desconocida"),
      grado: Math.max(1, Math.floor(Number(a.grado) || 1)),
      nombre: a.nombre || `${a.tipo === "veneno" ? "Veneno" : "Quemadura"} de ${capitalizarUI(String(a.familia || "origen desconocido"))}`,
      daño: String(a.daño || a.params?.daño || "1"),
      duracion: Math.max(1, Math.floor(Number(a.duracion) || 1)),
      origen: a.origen || "desconocido",
    }));
    return this.player.aflicciones;
  }

  aplicarAfliccion(conf = {}, origen = "desconocido") {
    if (!this.player || !TIPOS_AFLICCION_PERSISTENTE.has(conf.tipo)) return null;
    const lista = this.normalizarAflicciones();
    const nueva = {
      tipo: conf.tipo,
      familia: String(conf.familia || "desconocida"),
      grado: Math.max(1, Math.floor(Number(conf.grado) || 1)),
      nombre: conf.nombre || `${conf.tipo === "veneno" ? "Veneno" : "Quemadura"} de ${capitalizarUI(String(conf.familia || "origen desconocido"))}`,
      daño: String(conf.daño || "1"),
      duracion: Math.max(1, Math.floor(Number(conf.turnos ?? conf.duracion) || 1)),
      origen,
    };
    const idx = lista.findIndex(a => a.tipo === nueva.tipo && a.familia === nueva.familia);
    if (idx < 0) {
      lista.push(nueva);
      return nueva;
    }
    const actual = lista[idx];
    const reemplaza = nueva.grado > actual.grado || (nueva.grado === actual.grado && promedioDado(nueva.daño) > promedioDado(actual.daño));
    if (reemplaza) {
      nueva.duracion = Math.max(actual.duracion, nueva.duracion);
      lista[idx] = nueva;
      return nueva;
    }
    actual.duracion = Math.max(actual.duracion, nueva.duracion);
    return actual;
  }

  avanzarAflicciones(pulsos = 1, { combate = false } = {}) {
    if (!this.player || !Number.isFinite(pulsos) || pulsos <= 0) return [];
    const out = [];
    this.normalizarAflicciones();
    const pasos = Math.max(0, Math.floor(pulsos));
    for (let paso = 0; paso < pasos && this.player.aflicciones.length; paso++) {
      const supervivientes = [];
      for (const af of this.player.aflicciones) {
        const d = Math.max(0, tirar(af.daño));
        const antes = this.player.hp;
        this.player.hp = combate ? this.player.hp - d : Math.max(1, this.player.hp - d);
        const real = Math.max(0, antes - this.player.hp);
        if (real > 0) out.push(`${af.nombre} te causa ${real} de daño${!combate && this.player.hp === 1 && d > real ? " (fuera de combate no puede rematarte)" : ""}.`);
        af.duracion -= 1;
        if (af.duracion <= 0) out.push(`${af.nombre} se disipa.`);
        else supervivientes.push(af);
      }
      this.player.aflicciones = supervivientes;
      if (combate && this.player.hp <= 0) break;
    }
    return out;
  }

  tratarAfliccion(cura = {}) {
    const lista = this.normalizarAflicciones();
    const gradoMax = Math.max(0, Math.floor(Number(cura.gradoMax) || 0));
    const compatibles = lista.map((a, i) => ({ a, i })).filter(({a}) => a.tipo === cura.tipo && a.familia === cura.familia && a.grado <= gradoMax);
    if (!compatibles.length) {
      const mismoTipo = lista.find(a => a.tipo === cura.tipo);
      if (mismoTipo) return { ok:false, mensaje:`La medicina no responde a ${mismoTipo.nombre}: requiere familia ${cura.familia} y grado ≤${gradoMax}. No la consumes.` };
      return { ok:false, mensaje:`No padeces una ${cura.tipo} compatible de la familia ${cura.familia}. Guardas la medicina.` };
    }
    compatibles.sort((x,y) => y.a.grado - x.a.grado || y.a.duracion - x.a.duracion);
    const elegido = compatibles[0];
    lista.splice(elegido.i, 1);
    return { ok:true, afliccion:elegido.a, mensaje:`${elegido.a.nombre} cede por completo.` };
  }

  resumenAflicciones() {
    const lista = this.normalizarAflicciones();
    return lista.length ? lista.map(a => `${a.nombre} · ${a.duracion} acción${a.duracion === 1 ? "" : "es"}`).join(" · ") : "Ninguna";
  }

  avanzarEcologia(pulsos = 1) {
    if (!Number.isFinite(pulsos) || pulsos <= 0) return;
    this.relojEcologico = (Number.isFinite(this.relojEcologico) ? this.relojEcologico : 0) + pulsos;
    this.actualizarErrantes();
  }

  intentarPulsoMeditacion() {
    if (Azar.random() >= PROB_PULSO_MEDITACION) return false;
    this.avanzarEcologia(1);
    return true;
  }



  registrarInterrupcionMeditacion() {
    this.interrupcionEn ||= {};
    this.interrupcionEn[this.pos] = this.relojEcologico + COOLDOWN_INTERRUPCION;
  }

  airearVenaLocal() {
    const actual = this.saturacionDe(this.pos);
    if (actual <= 1) delete this.saturacion[this.pos];
    else this.saturacion[this.pos] = actual - 1;
    return { antes: actual, despues: Math.max(0, actual - 1) };
  }

  moverErrantesTrasReposo(out) {
    this.moverErrantes();
    const presentes = (this.errantes || []).filter(e => e.muertoHasta === 0 && e.sala === this.pos && a08ErranteLocalValido(e,this));
    for (const e of presentes) {
      if (this.vivos.some(m => m.errante_id === e.id && m.hp > 0)) continue;
      const mob = crearMob(e.mobId, MOBS[e.mobId], {
        erranteId: e.id, erranteDesde: e.desde, erranteMovidoEn: e.movidoEn,
      });
      this.vivos.push(mob);
      out.push(`Al levantar la mirada, descubres que ${mob.name} ha entrado en la zona mientras bajabas la guardia.`);
    }
    const totales = {};
    for (const mob of this.vivos.filter(m => m.hp > 0)) totales[mob.mob_id] = (totales[mob.mob_id] || 0) + 1;
    const vistos = {};
    for (const mob of this.vivos.filter(m => m.hp > 0)) {
      mob.indice_especie = (vistos[mob.mob_id] || 0) + 1;
      vistos[mob.mob_id] = mob.indice_especie;
      mob.total_especie = totales[mob.mob_id];
    }
  }

  // ---------- mobs errantes (array: cada uno con su propio territorio y estado) ----------

  actualizarErrante(e) {
    if(this.combate)return;
    if (e.muertoHasta > 0 && this.relojEcologico >= e.muertoHasta) {
      // El cooldown terminó. Respawnear desde el origen sin crear otro individuo.
      const areaReaparicion = ROOMS[e.origen]?.area;
      const balancearReaparicion = e.legal_stage === 'LianQi_II' && (areaReaparicion === 'valle' || areaReaparicion === 'sauces' || areaReaparicion === 'cantera_vetas');
      let salaReaparicion = e.origen;
      if (balancearReaparicion) {
        const candidatas = a08TerritorioEfectivo(e,this);
        const cupo = id => (this.errantes || []).filter(x => x.id !== e.id && x.legal_stage === 'LianQi_II' && x.area_id === areaReaparicion && x.sala === id && x.muertoHasta === 0).length < 2;
        salaReaparicion = [e.origen, ...candidatas].find((id, i, arr) => arr.indexOf(id) === i && cupo(id));
        if (!salaReaparicion) return; // Reintentar en el proximo pulso; sin duplicar ni superar el cupo.
      }
      e.sala = salaReaparicion;
      e.muertoHasta = 0;
      e.desde = null;
      e.movidoEn = this.turnoGlobal;
    }
    if (e.muertoHasta > 0 || a08ErranteLocalValido(e,this)) return;
    // Algunos errantes históricos nacían en la sala de un jefe todavía vivo.
    // Reubicarlos en su vecindad histórica segura, antes de que puedan actuar.
    const lugares=a08TerritorioEfectivo(e,this);
    const seguro=lugares.find(id=>!A08_RECOLONIZATION_BOSS_ROOMS[id]);
    if (seguro && e.sala===e.origen && A08_RECOLONIZATION_BOSS_ROOMS[e.origen]) {
      e.sala=seguro;
      e.desde=null;
      e.movidoEn=this.turnoGlobal;
    }
  }

  actualizarErrantes() {
    for (const e of this.errantes || []) this.actualizarErrante(e);
  }

  moverErrante(e) {
    if(this.combate)return;
    this.actualizarErrante(e);
    if (e.muertoHasta > 0) return; // en cooldown: no vaga
    if (Azar.random() >= PROB_MOVIMIENTO_ERRANTE) return; // no le tocó moverse este turno
    const salaActual = ROOMS[e.sala];
    if (!salaActual) return;
    if (!a08ErranteLocalValido(e,this)) return;
    const area=ROOMS[e.origen].area;
    const permitido=a08TerritorioEfectivo(e,this);
    // Experimental V7: avoid stacking >2 living LianQi II roamers in Valley / Sauces / Quarry.
    const limitarDensidadLII = e.legal_stage === 'LianQi_II' && (area === 'valle' || area === 'sauces' || area === 'cantera_vetas');
    const hayCupoLII = destino => !limitarDensidadLII ||
      (this.errantes || []).filter(x => x.id !== e.id && x.legal_stage === 'LianQi_II' && x.area_id === area && x.sala === destino && x.muertoHasta === 0).length < 2;
    const vecinos = [...new Set([...Object.values(salaActual.exits || {}),...(LGB_INTEGRATION_DATA.named[e.sala]||[])])].filter(d =>
      ROOMS[d]?.area===area && permitido.includes(d) && hayCupoLII(d) && a08TerritorialRuntime.step(e,this,d));
    if (!vecinos.length) return;
    const anterior = e.sala;
    e.sala = vecinos[Math.floor(Azar.random() * vecinos.length)];
    e.desde = anterior;
    e.movidoEn = this.turnoGlobal;
  }

  moverErrantes() {
    const area = ROOMS[this.pos]?.area;
    if (!area) return;
    for (const e of this.errantes || []) {
      if (ROOMS[e.origen]?.area===area && a08ErranteLocalValido(e,this)) this.moverErrante(e);
    }
  }

  venaActual(sala) {
    if (sala.vena === "resentida" && this.flags.muerto_eco_caido) return VENAS.normal;
    return VENAS[sala.vena] || VENAS.normal;
  }

  // ---------- vitales ----------

  entrarSala() {
    const sala = this.rooms[this.pos];
    this.vivos = [];
    this._huboMobsEnCooldown = false;
    if(this.pos==='deposito_comun'&&this.quests.M02==='activa'&&
       !this.flags.arc1.hitos.M02_RATA_RESUELTA){
      const rata=this.errantes.find(e=>e.id==='rata_despensa');
      if(rata){rata.sala='deposito_comun';rata.muertoHasta=0;}
    }
    if(this.pos==='deposito_comun'&&this.quests.M02==='activa'&&
       this.flags.arc1.hitos.M02_RATA_RESUELTA&&!this.flags.arc1.hitos.M02_CADAVER_OBSERVADO&&
       !this.cadaveresEnSala().some(c=>c.arc1_tutorial)&&!this.flags.arc1.hitos.M02_CADAVER_RECREADO){
      this.flags.arc1.hitos.M02_CADAVER_RECREADO=true;
      this.registrarCadaver({...crearMob('rata_qi',MOBS.rata_qi),errante_id:'rata_despensa'});
    }
    const ordinalFijo = {};
    for (const mid of sala.mobs || []) {
      if (!a08PuedeManifestarse(this,mid)) continue;
      const plant = MOBS[mid];
      ordinalFijo[mid] = (ordinalFijo[mid] || 0) + 1;
      const fijoId = `${this.pos}:${mid}:${ordinalFijo[mid]}`;
      if (plant.unico && this.flags["muerto_" + mid]) continue; if(mid==="centinela_pluma"&&this.flags.arc1?.hitos.CENTINELA_RESUELTO_POR_PROTOCOLO)continue;
      if (!plant.unico) {
        const claveVieja = this.pos + ":" + mid;
        const espera = [this.respawnEn[fijoId], this.respawnEn[claveVieja]].filter(v => v !== undefined);
        if (espera.some(listo => this.relojEcologico < listo)) { this._huboMobsEnCooldown = true; continue; }
      }
      this.vivos.push(crearMob(mid, plant, { fijoId }));
    }
    // mobs errantes: viven fuera de las listas fijas, se materializan según su ubicación actual
    for (const errante of this.errantes || []) {
      if (!a08TerritorioEfectivo(errante,this).includes(this.pos)) continue;
      this.actualizarErrante(errante);
      if (a08ErranteLocalValido(errante,this) && errante.muertoHasta === 0 && errante.sala === this.pos) {
        this.vivos.push(crearMob(errante.mobId, MOBS[errante.mobId], {
          erranteId: errante.id,
          erranteDesde: errante.desde,
          erranteMovidoEn: errante.movidoEn,
        }));
      } else if (errante.muertoHasta > 0) {
        this._huboMobsEnCooldown = true;
      }
    }
    if(this.quests.M03==='activa'&&this.pos==='patio_marcial'&&
       !this.flags.arc1.hitos.M03_PRACTICA_MUNECO_COMPLETADA){
      const muneco=crearMob('muneco_practica',MOBS.muneco_practica);
      muneco.arc1_muneco=true;this.vivos.push(muneco);
    }
    if(this.pos==='descansillo'&&this.quests.P==='activa'&&!this.flags.arc1.hitos.equipoInicialEntregado){
      this.flags.arc1.hitos.equipoInicialEntregado=true;
      this.player.inventario.push('uniforme','espada_madera');
      this.salida('Recibes tu uniforme y una espada de madera para el camino.','destacado');
    }
    if(this.pos==='dormitorio_externos'&&this.quests.M01==='activa'&&this.flags.arc1.hitos.M01_ALOJAMIENTO_ASIGNADO)
      this.registrarHitoArc1('ALOJAMIENTO_CONFIRMADO');
    if(this.pos==='bosque_refugio_patrulla'&&this.quests.M04==='activa'&&this.flags.arc1.hitos.M04_CONTROL_PUERTA)
      this.registrarHitoArc1('M04_REFUGIO_ALCANZADO');
    if(['mercado_valle','granero_valle'].includes(this.pos)&&this.quests.M05==='activa')
      this.registrarHitoArc1('M05_VALLE_LOGISTICA_REVISADA');
    if(this.pos==='sauces_casa_huespedes'&&this.quests.M05==='activa')
      this.registrarHitoArc1('M05_HOSPEDAJE_VISITADO');
    const totales = {};
    for (const mob of this.vivos) totales[mob.mob_id] = (totales[mob.mob_id] || 0) + 1;
    const vistos = {};
    for (const mob of this.vivos) {
      mob.indice_especie = (vistos[mob.mob_id] || 0) + 1;
      vistos[mob.mob_id] = mob.indice_especie;
      mob.total_especie = totales[mob.mob_id];
    }
    this.mostrarSala();
    this.visitadas.add(this.pos);

    this.recordarAtlas();
    this.actualizarMinimapa();
    this.actualizarPanel();
  }

  mostrarSala() {
    const sala = this.rooms[this.pos];
    // El marco del título lleva el color del área. Se estampa en cada línea porque el
    // registro conserva los títulos anteriores: no deben cambiar al viajar.
    aplicarAreaUI(this.addLine(sala.name, "titulo"), areaDeSala(this.pos));
    const plantasSala = this.plantasEnSala();
    const todasAgotadas = plantasSala.length > 0 && plantasSala.every(n => this.nodoHerboristeriaAgotado(n));
    this.addLine((todasAgotadas && sala.descAgotada) ? sala.descAgotada : sala.desc, "descripcion-sala");
    for (const det of sala.detalles || []) {
      if (this.cumple(det.req || {})) this.addLine(det.text, "detalle-sala");
    }
    if (this.tieneSentido() && sala.sentido) this.addLine(`(sentido divino) ${sala.sentido}`, "sentido");
    const items = this.itemsNaturalesVisibles();
    if (items.length) {
      this.addLine("Ves: " + agruparObjetos(items).map(({ mid, cantidad }) => capitalizarUI(nombreCantidad(mid, cantidad))).join(", "), "sala-meta sala-objetos");
    }
    const plantas = plantasSala.filter(n => !this.nodoHerboristeriaAgotado(n));
    if (plantas.length) {
      const nombres = plantas.map(n => {
        const st = this.estadoNodoHerboristeria(n.id, true);
        const espera = Math.max(0, Math.ceil((st?.muertaHasta || 0) - this.turnoGlobal));
        return `${capitalizarUI(n.planta.nombre)}${espera ? ` (regenerando: ${espera})` : ""}`;
      });
      this.addLine("Plantas: " + nombres.join(", "), "sala-meta sala-plantas");
    }
    const tirados = this.resumenObjetosTirados();
    if (tirados.length) {
      this.addLine("En el suelo: " + tirados.join(", "), "sala-meta sala-objetos");
    }
    const criaturasVivas = this.vivos.filter(m => m.hp > 0);
    const cadaveres = this.cadaveresEnSala().filter(c => !this.cuerpoExamenAgotado(c));
    if (criaturasVivas.length) this.addLine("Criaturas: " + criaturasVivas.map(m => capitalizarUI(etiquetaMob(m))).join(", "), "sala-meta sala-criaturas");
    if (cadaveres.length) {
      const grupos = new Map();
      for (const c of cadaveres) {
        const nombre = this.etiquetaCadaver(c);
        grupos.set(nombre, (grupos.get(nombre) || 0) + 1);
      }
      const nombres = [...grupos].map(([nombre, cantidad]) => capitalizarUI(nombre) + (cantidad > 1 ? ` (${cantidad})` : ""));
      this.addLine("Restos: " + nombres.join(", "), "sala-meta sala-restos");
    } else if (!criaturasVivas.length && this._huboMobsEnCooldown) {
      this.addLine("No hay nada aquí ahora: lo que fuera que rondaba se movió hace poco.", "sala-meta sala-movimiento");
    }
    const recienLlegados = criaturasVivas.filter(m => m.errante_id && m.errante_desde && m.errante_movido_en === this.turnoGlobal);
    if (recienLlegados.length) {
      this.addLine("Movimiento reciente: " + recienLlegados.map(m => `${capitalizarUI(etiquetaMob(m))} llegó desde ${ROOMS[m.errante_desde].name}`).join("; ") + ".", "sala-meta sala-movimiento");
    }
    const npcs = this.npcsEnSala(this.pos);
    if (npcs.length) this.addLine("Gente: " + npcs.map(n => capitalizarUI(NOMBRES_NPC[n])).join(", "), "sala-meta sala-gente");
    this.addLine("Salidas: " + Object.keys(sala.exits || {}).map(capitalizarUI).join(", "), "sala-meta sala-salidas");
    this.abajo();
  }

  cumple(req) {
    if (req.comprension && this.player.comprension < req.comprension) return false;
    if (req.flag && !this.flags[req.flag]) return false;
    if (req.no_flag && this.flags[req.no_flag]) return false;
    return true;
  }

  npcsEnSala(rid) {
    if (!Object.hasOwn(ROOMS,rid)) return [];
    return Object.keys(NPC_DEF).filter(id => this.posicionNPC?.[id]?.sala === rid);
  }

  npcPresente(id, rid=this.pos) {
    return Object.hasOwn(NPC_DEF,id) && Object.hasOwn(ROOMS,rid) && this.posicionNPC?.[id]?.sala === rid;
  }

  // Un paso explícito; la dirección/cadencia futura queda sin definir.
  puedeMoverNPC(id, origen, destino) {
    if (!this.npcPresente(id,origen) || !Object.hasOwn(ROOMS,destino)) return false;
    const actual=this.posicionNPC[id];
    if (actual.anclaje !== null) return false;
    if (!NPC_DEF[id].posicion_valida.includes(destino)) return false;
    if (!Object.values(ROOMS[origen].exits).includes(destino)) return false;
    return pasoGateAbierto(origen,destino,this.gates);
  }

  aplicarMovimientoNPC(id, destino) {
    const origen=this.posicionNPC?.[id]?.sala;
    if (!this.puedeMoverNPC(id,origen,destino)) return false;
    this.posicionNPC[id]={...this.posicionNPC[id],sala:destino};
    return true; // No altera Atlas: sólo observar actualiza el último avistamiento.
  }

  // ---------- bucle ----------

  itemsNaturalesVisibles() {
    const sala = this.rooms[this.pos];
    const vis = [...(sala.items || [])];
    if (this.tieneSentido()) vis.push(...(sala.oculto || []));
    // Guardarraíl: ningún material de planta recolectable puede colarse en "Ves:".
    // Si una sala declara uno por error, se ignora aquí en vez de mostrarse como
    // objeto suelto (las plantas viven en NODOS_HERBORISTERIA y salen en "Plantas:").
    return vis.filter(mid => !MATERIALES_RECOLECTABLES.has(mid));
  }

  objetosTiradosEnSala(rid = this.pos) {
    this.objetosTirados ||= {};
    const activos = (this.objetosTirados[rid] || []).filter(reg =>
      reg && ITEMS[reg.mid] && Number.isFinite(reg.desapareceEn) && this.turnoGlobal < reg.desapareceEn);
    if (activos.length) this.objetosTirados[rid] = activos;
    else delete this.objetosTirados[rid];
    return activos;
  }

  itemsVisibles() {
    return [...this.itemsNaturalesVisibles(), ...this.objetosTiradosEnSala().map(reg => reg.mid)];
  }

  resumenObjetosTirados() {
    const grupos = new Map();
    for (const reg of this.objetosTiradosEnSala()) {
      const previo = grupos.get(reg.mid) || { mid: reg.mid, cantidad: 0, min: Infinity, max: 0 };
      const quedan = Math.max(0, reg.desapareceEn - this.turnoGlobal);
      previo.cantidad++;
      previo.min = Math.min(previo.min, quedan);
      previo.max = Math.max(previo.max, quedan);
      grupos.set(reg.mid, previo);
    }
    return [...grupos.values()].map(g => {
      const tiempo = g.min === g.max ? `${g.min} turnos` : `${g.min}–${g.max} turnos`;
      return `${capitalizarUI(nombreCantidad(g.mid, g.cantidad))} · ${tiempo}`;
    });
  }

  resolverItem(args, ambito = "ambos") {
    if (!args || !args.length) return null;
    const texto = args.join("_");
    let candidatos = [];
    if (ambito === "tienda") {
      candidatos = [...CATALOGO];
    } else {
      if (ambito === "sala" || ambito === "ambos") candidatos = candidatos.concat(this.itemsVisibles());
      if (ambito === "inv" || ambito === "ambos") candidatos = candidatos.concat(this.player.inventario);
    }
    if (candidatos.includes(texto)) return texto;
    for (const c of candidatos) {
      if (!ITEMS[c]) continue;
      const nombre = quitaAcentos(ITEMS[c].name.toLowerCase());
      if (args.every(w => nombre.includes(w) || c.includes(w))) return c;
    }
    return null;
  }

  quitarItems(mid, n) {
    if(mid==='pildora_consolidacion'&&this.pildoraProtegidaArc1())return 0;
    let retirados=0;
    for (let i = 0; i < n; i++) {
      const idx = this.player.inventario.indexOf(mid);
      if (idx >= 0) {this.player.inventario.splice(idx, 1);retirados++;}
    }
    return retirados;
  }

  registrarCadaver(mob) {
    // Ecos y sombras se disuelven como parte de su propia derrota; no dejan un cuerpo falso.
    if (!mob || ["eco_caido", "sombra_ahogada"].includes(mob.mob_id)) return;
    this.cadaveres ||= {};
    const tipo = ["centinela_pluma", "guardian_coral", "rey_escarabajo"].includes(mob.mob_id) ? "restos" : "cadáver";
    const tutorial=this.pos==='deposito_comun'&&mob.errante_id==='rata_despensa'&&this.quests.M02==='activa';
    (this.cadaveres[this.pos] ||= []).push({
      mob_id: mob.mob_id,
      name: mob.name,
      corto: mob.corto || mob.name,
      elemento: mob.elemento || null,
      tipo,
      caidoEn: this.turnoGlobal,
      desapareceEn: tutorial?Number.MAX_SAFE_INTEGER:this.turnoGlobal + DURACION_CADAVER,
      ...(tutorial?{arc1_tutorial:true}:{}),
    });
  }

  cadaveresEnSala(rid = this.pos) {
    this.cadaveres ||= {};
    const vigentes = (this.cadaveres[rid] || []).filter(c =>
      c && c.mob_id && (!Number.isFinite(c.desapareceEn) || this.turnoGlobal < c.desapareceEn));
    if (vigentes.length) this.cadaveres[rid] = vigentes;
    else delete this.cadaveres[rid];
    return vigentes;
  }

  etiquetaCadaver(c) {
    return c.tipo === "restos" ? `restos de ${c.name}` : `cadáver de ${c.name}`;
  }

  resolverCadaver(args) {
    if (!args?.length) return null;
    const texto = quitaAcentos(args.join("_").toLowerCase());
    const generico = ["cadaver", "cuerpo", "restos", "muerto"].some(p => texto.includes(p));
    return this.cadaveresEnSala().find(c => {
      if (generico && this.cadaveresEnSala().length === 1) return true;
      const nombres = [c.mob_id, c.name, c.corto].map(n => quitaAcentos(String(n).toLowerCase()));
      return nombres.some(n => n.includes(texto) || texto.includes(n) || n.split(/[ _]/).some(p => p.length > 3 && texto.includes(p)));
    }) || null;
  }

  describirCadaver(c) {
    if(c.arc1_tutorial&&this.pos==='deposito_comun'&&this.quests.M02==='activa'&&
       this.flags.arc1.hitos.EXAMEN_ESPIRITUAL_APRENDIDO)
      this.registrarHitoArc1('M02_CADAVER_OBSERVADO');
    const inicio = c.tipo === "restos"
      ? `Los restos de ${c.name} permanecen donde cayó.`
      : `El cadáver de ${c.name} yace inmóvil donde terminó el combate.`;
    const huella = c.elemento === "fuego" ? "El calor espiritual abandona lentamente su carne."
      : c.elemento === "agua" ? "La humedad de su qi vuelve poco a poco a la tierra."
      : c.elemento === "metal" ? "Su qi metálico pierde tensión y se apaga."
      : c.elemento === "viento" ? "El aire ya no responde alrededor de su cuerpo."
      : "El qi que lo animaba ya se dispersó.";
    return `${inicio} ${huella}\n(El botín útil ya fue recogido al vencerlo; estos restos desaparecerán con el paso de los turnos.)`;
  }

  // ---------- salas ----------

  recompensas(mobId, e) {
    const out = [], p = this.player;
    const rataM02=e.errante_id==='rata_despensa'&&this.pos==='deposito_comun'&&this.quests.M02==='activa';
    if(rataM02){
      e.loot=[];
      const rata=this.errantes.find(x=>x.id==='rata_despensa');
      if(rata)rata.muertoHasta=Number.MAX_SAFE_INTEGER;
      this.registrarHitoArc1('M02_RATA_RESUELTA');
    }
    if (e.qi_recompensa) {
      const antes = p.qi;
      p.qi = Math.min(p.qi + e.qi_recompensa, p.qi_max);
      const ganado = p.qi - antes;
      const nota = ganado === e.qi_recompensa ? "" : " (lo demás se disipa: estás al tope)";
      out.push(`   Absorbes el qi del combate: +${ganado}.${nota}`);
    }
    const botinesNuevos = [];
    let cantidadBotines = 0;
    for (const drop of e.loot || []) {
      if (Azar.random() < (drop.prob ?? 1)) {
        const it = ITEMS[drop.item];
        if (!it) continue;
        cantidadBotines++;
        if (this.registrarBotinDescubierto(mobId, drop.item)) botinesNuevos.push(it.name);
        if (it.piedras) {
          p.piedras += it.piedras;
          out.push(`   Botín: ${it.name} (+${it.piedras} piedras espirituales).`);
        } else {
          p.inventario.push(drop.item);
          out.push(`   Botín: ${it.name}.`);
        }
      }
    }
    if ((e.loot || []).length && cantidadBotines === 0) out.push("   No encuentras botín material esta vez.");
    if (botinesNuevos.length) out.push(`   ✦ Bestiario actualizado: ${botinesNuevos.map(capitalizarUI).join(", ")}.`);
    if (e.unico) this.flags["muerto_" + mobId] = true;
    else {
      this.flags["kills_" + mobId] = (this.flags["kills_" + mobId] || 0) + 1;
      const cd = (MOBS[mobId] && MOBS[mobId].respawnCooldown) || RESPAWN_COOLDOWN_DEFAULT;
      const errante = e.errante_id
        ? (this.errantes || []).find(er => er.id === e.errante_id)
        : null;
      if (errante) {
        errante.muertoHasta = this.relojEcologico + cd;
      } else {
        this.respawnEn[e.fijo_id || (this.pos + ":" + mobId)] = this.relojEcologico + cd;
      }
    }
    this.registroLogro("combate");
    if (mobId === "eco_caido") {
      out.push("El qi resentido que ahogaba el campo de entrenamiento se aquieta. La vena respira limpia.");
    }
    if (mobId === "sapo_caldera") {
      out.push("Al enfriarse, la piel de ceniza de sus tres gargantas conserva cien puntos encendidos. No llevaba un manual: su respiración se había convertido en uno.");
    }
    if (mobId === "rey_escarabajo") {
      out.push("Las placas del rey se separan siguiendo una secuencia precisa. Unidas por sus articulaciones, forman el diagrama metálico de una técnica que la mina enseñó al revés.");
    }
    if (mobId === "guardian_coral") {
      out.push("Una lámina de coral inscrita se desprende sin quebrarse. Las corrientes grabadas en ella solo forman palabras cuando la haces girar.");
    }
    if (mobId === "mantis_nube") {
      out.push("En el centro del nido, dos plumas dobladas se abren y los cortes de viento de la mantis quedan suspendidos como escritura. La bestia había cultivado el método con cada tijeretazo.");
    }
    this.marcarProgresoMisiones();
    return out;
  }

  porcentajeBotin(probabilidad) {
    const valor = Math.max(0, Math.min(100, (probabilidad ?? 1) * 100));
    return `${Number.isInteger(valor) ? valor : Math.round(valor * 10) / 10}%`;
  }

  registrarBotinDescubierto(mobId, itemId) {
    const plantilla = MOBS[mobId];
    if (!plantilla || !plantilla.loot?.some(drop => drop.item === itemId)) return false;
    if (!this.atlas.criaturas[mobId]) this.recordarCriatura({ ...crearMob(mobId, plantilla), mob_id: mobId });
    const criatura = this.atlas.criaturas[mobId];
    criatura.botin ||= {};
    const previo = criatura.botin[itemId];
    criatura.botin[itemId] = {
      veces: Math.max(0, previo?.veces || 0) + 1,
      descubiertoEn: previo?.descubiertoEn ?? this.turnoGlobal,
    };
    return !previo;
  }

  salidasAtlas(rid) {
    return Object.entries((this.rooms[rid] || {}).exits || {}).filter(([, dest]) => {
      if (!ROOMS[dest]) return false;
      if (this.visitadas.has(dest)) return true;

      return !ROOMS[dest].oculta || (this.tieneSentido() && SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO.includes(dest));
    });
  }

  recordarAtlas() {
    if (!this.player || !this.rooms || !this.visitadas.has(this.pos)) return;
    const s = this.rooms[this.pos];
    const previo = this.atlas.salas[this.pos] || {};
    const npcs = this.npcsEnSala(this.pos);
    const mobs = this.vivos.filter(m => m.hp > 0 && !(m.errante_id==='rata_despensa'&&
      this.quests.M02==='activa'&&this.pos==='deposito_comun'));
    this.atlas.salas[this.pos] = {
      turno: this.turnoGlobal, vena: this.venaActual(s).label,
      salvaje: !!s.salvaje, resentida: !!this.venaActual(s).diente,
      alojamiento: s.alojamiento ? { nombre: s.alojamiento.nombre, purifica: !!s.alojamiento.purifica } : null,
      salidas: this.salidasAtlas(this.pos),
      // El atlas recuerda hallazgos del mundo, no objetos que el propio jugador dejó caer.
      items: [...new Set([...(previo.items || []), ...this.itemsNaturalesVisibles()])],
      npcs: [...new Set([...(previo.npcs || []), ...npcs])],
      mobs: [...new Set([...(previo.mobs || []), ...mobs.map(m => m.mob_id)])],
    };
    for (const n of npcs) {
      const viejo = this.atlas.personas[n] || {};
      this.atlas.personas[n] = { ...viejo, sala: this.pos, turno: this.turnoGlobal };
    }
    for (const m of mobs) this.recordarCriatura(m);
  }

  recordarCriatura(m, examinada = false) {
    if(m.errante_id==='rata_despensa'&&this.quests.M02==='activa'&&this.pos==='deposito_comun')return;
    if (!m.mob_id || !MOBS[m.mob_id]) return;
    const viejo = this.atlas.criaturas[m.mob_id] || {};
    this.atlas.criaturas[m.mob_id] = {
      ...viejo, sala: this.pos, turno: this.turnoGlobal,
      lugares: [...new Set([...(viejo.lugares || []), this.pos])],
      errante: !!(viejo.errante || m.errante_id),
      examinada: !!(viejo.examinada || examinada),
    };
    const sala = this.atlas.salas[this.pos];
    if (sala && !sala.mobs.includes(m.mob_id)) sala.mobs.push(m.mob_id);
  }

  // Lista plana y global de registros de la pestaña actual. `areas` se DERIVA (no se guarda):
  //   · lugares/mapa  → ROOMS[id].area
  //   · personas      → salas donde atlas.salas[rid].npcs lo incluye, más la última sala vista
  //   · criaturas     → atlas.criaturas[id].lugares, atlas.salas[rid].mobs y la última sala
  // Un mismo registro puede pertenecer a varias áreas; sigue habiendo UN solo registro.
  registrosAtlas() {
    const mapa = this.atlasPestana === "mapa" || this.atlasPestana === "lugares";
    const ids = mapa ? [...this.visitadas].filter(id => ROOMS[id])
      : Object.keys(this.atlasPestana === "personas" ? this.atlas.personas : this.atlas.criaturas);
    const indice = mapa ? null : this.indiceAreasAtlas();
    const areasDe = id => mapa ? [areaDeSala(id)].filter(a => a && AREAS[a])
      : (this.atlasPestana === "personas" ? indice.personas : indice.criaturas)[id] || [];
    return ids.map(id => ({ id, areas: areasDe(id), nombre: mapa ? ROOMS[id].name
      : capitalizarUI(this.atlasPestana === "personas" ? NOMBRES_NPC[id] || id : (MOBS[id] || {}).name || id) }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }

  // Áreas (ordenadas como AREAS) donde consta cada persona y cada criatura. Limitación
  // conocida: atlas.personas[id].sala sólo guarda el ÚLTIMO avistamiento; las demás áreas
  // salen de atlas.salas[rid].npcs, que acumula. Una ficha incompleta puede no
  // tener más que esa última sala. No se modela todavía la movilidad de los NPC.
  indiceAreasAtlas() {
    const npcsPorSala = {}, mobsPorSala = {};
    for (const [rid, r] of Object.entries(this.atlas.salas)) {
      if (!ROOMS[rid]) continue;
      for (const n of r.npcs || []) (npcsPorSala[n] ||= []).push(rid);
      for (const m of r.mobs || []) (mobsPorSala[m] ||= []).push(rid);
    }
    const ordenadas = salas => {
      const halladas = new Set(salas.map(areaDeSala).filter(a => a && AREAS[a]));
      return Object.keys(AREAS).filter(a => halladas.has(a));
    };
    const personas = {}, criaturas = {};
    for (const [id, reg] of Object.entries(this.atlas.personas)) personas[id] = ordenadas([...(npcsPorSala[id] || []), reg.sala]);
    for (const [id, reg] of Object.entries(this.atlas.criaturas)) criaturas[id] = ordenadas([...(mobsPorSala[id] || []), ...(reg.lugares || []), reg.sala]);
    return { personas, criaturas };
  }

  // Agrupa por área, en el orden canónico de AREAS. Sólo salen las áreas con registros
  // (así ni se listan áreas vacías ni se revelan nombres). Lo que no tenga área derivable
  // va a un último grupo `area: null`.
  agruparRegistrosAtlas(registros) {
    const grupos = [];
    for (const area of Object.keys(AREAS)) {
      const propios = registros.filter(r => r.areas.includes(area));
      if (propios.length) grupos.push({ area, nombre: AREAS[area].nombre, registros: propios });
    }
    const sinArea = registros.filter(r => !r.areas.length);
    if (sinArea.length) grupos.push({ area: null, nombre: "Sin ubicación conocida", registros: sinArea });
    return grupos;
  }


  // ------------------------------------------------------------------------
  //  7.4  PROGRESIÓN · técnicas, meridianos, misiones, facciones y oficios
  //
  //  Índice por tema (el bloque más grande de la clase; agrupado en 6 áreas):
  //    cultivo / etapas       compruebaPuerta, progresoFundacion,
  //                           registroLogro, logros, entregarRecompensa,
  //                           ajustarAfinidad, tituloActual,
  //                           evaluarFundacion, efectivo, tieneSentido
  //    meridianos / técnicas  opcionMeridiano, puntosTecnicaPorProgreso,
  //                           puntosTecnicaGastados,
  //                           puntosTecnicaDisponibles,
  //                           sincronizarPuntosTecnica, normalizarMeridianos,
  //                           bloqueoRama, bloqueoReconfigurar,
  //                           bloqueoEleccion, elegirRama,
  //                           activarRamaDoble, tecnicasDescubiertas,
  //                           textoModMeridiano,
  //                           resumenPotenciadoresMeridianos,
  //                           explicacionTecnica, resumenMeridiano,
  //                           afinidadTecnica, ritmoTecnica, progresoTecnica,
  //                           riesgoTecnica, perfilTecnica, dominaElemento,
  //                           desbloquearHibridas, resolverTecnica,
  //                           statsTecnica, registrarUso, tecnicaResumen,
  //                           puedeIntentar
  //    misiones               claveInicioMision, avanceMision, activarMision,
  //                           completarMision,
  //                           gestionarMisionesNpc, descubrirMisionesSala,
  //                           marcarProgresoMisiones, valorMision,
  //                           consecuenciaMision
  //    facciones              normalizarFacciones, afiliarFaccion,
  //                           cambiarEstadoFaccion, ajustarReputacionFaccion,
  //                           registroFaccion, rangoFaccion,
  //                           otorgarContribucion, gastarContribucion
  //    oficios / alquimia     normalizarProfesiones, profesionDesbloqueada,
  //                           desbloquearProfesion, rangoProfesion,
  //                           sumarExperienciaProfesion,
  //                           registrarMaterialProfesion, recolectarCadaver,
  //                           recolectarPlanta, familiaridadHerboristeria,
  //                           materialesFaltantes, iniciarElaboracion,
  //                           elegirPulsoAlquimia, resolverElaboracion
  //    injerto / promoción    requisitosInjerto, iniciarPromocion
  // ------------------------------------------------------------------------

  compruebaPuerta(siguienteEtapa) {
    const puerta = PUERTAS[siguienteEtapa];
    if (!puerta) return { ok: false, faltan: ["Requisito desconocido de etapa " + siguienteEtapa] };
    const faltan = [];
    const tiene = this.player.inventario.filter(x => x === "pildora_consolidacion").length;
    if (tiene < puerta.pildoras) {
      faltan.push(`${puerta.pildoras - tiene} píldoras de consolidación`);
    }
    const arc=this.flags.arc1;
    if(siguienteEtapa===2 && arc &&
      (arc.rangoInstitucional!=='DISCIPULO_EXTERNO'||!arc.primerServicioFormal||arc.evaluacionCirculacion!=='SUPERADA'))
      faltan.push('promoción y evaluación de M03');
    if(siguienteEtapa===3 && arc && !arc.cultivoLIIIPreexistente){
      if(this.quests.M04!=='hecha'||this.quests.M05!=='hecha')faltan.push('servicios M04 y M05');
      if(!['SUFICIENTE','CONCLUYENTE'].includes(arc.evidenciaTerritorial.nivel))faltan.push('evidencia suficiente');
      if(!arc.informeFronteraAceptado)faltan.push('informe M07 aceptado');
    }
    const L = this.logros();
    for (const req of puerta.logros) {
      if (req === "combate" && L.combate < 1 && !(siguienteEtapa===2 && arc?.primerServicioFormal)) faltan.push("haber ganado un combate");
      if (req.startsWith("comprension:") && !(siguienteEtapa===3 && arc)) {
        const min = parseInt(req.split(":")[1], 10);
        if (L.comprension < min) faltan.push(`comprensión ${min} (tienes ${L.comprension})`);
      }
      if(req!=="combate"&&!req.startsWith("comprension:"))faltan.push('requisito desconocido: '+req);
    }
    return { ok: faltan.length === 0, faltan };
  }

  // Resumen legible de qué falta para avanzar de etapa dentro de LianQi, o para
  // establecer la Fundación (ZhuJi) una vez en el cuello de botella. Se usa en
  // HOJA y en el aviso de MEDITAR, para que el umbral (10 de comprensión, o la
  // Píldora de Fundación) sea siempre el mismo número visible en ambos lados.
  progresoFundacion() {
    const p = this.player;
    if (!reinoExacto(p, "LianQi")) return null;
    if (p.etapa < 4) {
      const siguiente = p.etapa + 1;
      const { ok, faltan } = this.compruebaPuerta(siguiente);
      return {
        titulo: `Próxima puerta: Etapa ${siguiente}/${totalEtapas(p.reino)}`,
        detalle: ok ? "Requisitos cumplidos. MEDITA con el qi al tope para cruzar." : "Falta: " + faltan.join(" · ") + ".",
      };
    }
    const tienePildora = p.inventario.includes("pildora_fundacion");
    const faltaComprension = Math.max(0, UMBRAL_COMPRENSION_FUNDACION - p.comprension);
    const listo = tienePildora || faltaComprension === 0;
    return {
      titulo: "Cuello de botella: Establecimiento de Fundación",
      detalle: listo
        ? "Requisitos cumplidos. MEDITA con el qi al tope para intentar la tribulación."
        : `Falta: la Píldora de Fundación o comprensión ${UMBRAL_COMPRENSION_FUNDACION} (tienes ${p.comprension}).`,
    };
  }

  registroLogro(tipo) {
    this.flags["logro_" + tipo] = (this.flags["logro_" + tipo] || 0) + 1;
  }

  logros() {
    return {
      combate: this.flags["logro_combate"] || 0,
      comprension: this.player ? this.player.comprension : 0,
    };
  }

  entregarRecompensa(piedras, qi, comprension, contribucion = 0) {
    const out = [], p = this.player;
    if (piedras) { p.piedras += piedras; out.push(`   +${piedras} piedras espirituales.`); }
    if (qi) { const antes = p.qi; p.qi = Math.min(p.qi + qi, p.qi_max); out.push(`   +${p.qi - antes} qi.`); }
    if (comprension) { p.comprension += comprension; out.push(`   +${comprension} comprensión.`); }
    if (contribucion) {
      const registro = this.otorgarContribucion(contribucion, "Encargo completado");
      if (registro) {
        out.push(`   +${contribucion} contribución de la Grulla Blanca. Disponible ${registro.saldo} · mérito ${registro.merito}.`);
        if (registro.rangoNuevo) out.push(`   ✦ Rango de facción: ${registro.rangoNuevo}.`);
      }
    }
    return out;
  }

  ajustarAfinidad(npc, cantidad) {
    const p = this.player;
    if (!p.afinidad) p.afinidad = {};
    p.afinidad[npc] = (p.afinidad[npc] || 0) + cantidad;
    return p.afinidad[npc];
  }

  tituloActual() {
    const p = this.player;
    if (p.promovido) return `discípulo interno · senda de ${p.maestro || "la montaña"}`;
    if (reinoExacto(p, "ZhuJi")) return `cultivador ZhuJi · Fundación ${p.calidad_fundacion || "sin evaluar"}`;

    return p.titulo || "aspirante aceptado";
  }

  evaluarFundacion() {
    const p = this.player;
    let puntos = p.comprension + Math.min(6, this.logros().combate);
    puntos -= (p.impurezas || 0) * 2;
    const calidad = puntos >= 22 ? "Celestial" : puntos >= 15 ? "Impecable" : puntos >= 8 ? "Estable" : "Agrietada";
    return { puntos, calidad };
  }

  efectivo() {
    const p = this.player;
    let atk = p.ataque, dfn = p.defensa, dmg = "1d2";
    for (const [slot, mid] of Object.entries(p.equipado)) {
      const it = ITEMS[mid];
      atk += it.ataque || 0;
      dfn += it.defensa || 0;
      if (slot === "mano" && it.daño) dmg = it.daño;
    }
    return { ...p, ataque: atk, defensa: dfn, daño: dmg };
  }

  tieneSentido() { return !!this.player && reinoAlMenos(this.player, "ZhuJi"); }

  opcionMeridiano(tid, n, opcion) {
    // Fuente única: RAMAS[tid][tramo][opción−1]. Ver CONTRATO DE DISEÑO.
    return RAMAS[tid]?.[n]?.[opcion - 1] || null;
  }

  puntosTecnicaPorProgreso() {
    const p = this.player;
    if (!p) return 0;
    // Uno inicial; uno por cada consagración de LianQi;
    // y dos al fundar ZhuJi. El cálculo por hitos evita premios duplicados.
    const consagracionesLianQi = totalEtapas("LianQi") - 1;
    const etapasLianQi = reinoAlMenos(p, "ZhuJi")
      ? consagracionesLianQi
      : Math.max(0, Math.min(totalEtapas("LianQi"), p.etapa || 1) - 1);
    return 1 + etapasLianQi + (reinoAlMenos(p, "ZhuJi") ? 2 : 0);
  }

  puntosTecnicaGastados(tid = null) {
    if (!this.player) return 0;
    const entradas = tid ? [[tid, this.player.tecnicas[tid]]] : Object.entries(this.player.tecnicas || {});
    return entradas.reduce((total, [id, rec]) => total + (rec
      ? [1, 2, 3].filter(n => this.opcionMeridiano(id, n, rec.ramas?.[n])).length : 0), 0);
  }

  puntosTecnicaDisponibles() {
    return Math.max(0, (this.player?.puntos_tecnica_total || 0) - this.puntosTecnicaGastados());
  }

  sincronizarPuntosTecnica() {
    if (!this.player) return 0;
    const antes = Number.isFinite(this.player.puntos_tecnica_total) ? this.player.puntos_tecnica_total : 0;
    this.player.puntos_tecnica_total = Math.max(antes, this.puntosTecnicaPorProgreso(), this.puntosTecnicaGastados());
    return this.player.puntos_tecnica_total - antes;
  }

  normalizarMeridianos() {
    const p = this.player; if (!p) return;
    for (const rec of Object.values(p.tecnicas)) {
      const ramas = rec.ramas || {};
      // CONSERVAR_NORMALIZACION_ACTUAL: validar elecciones sin reinterpretar su valor.
      rec.ramas = Object.fromEntries([1, 2, 3].map(n => {
        return [n, [1, 2, 3].includes(ramas[n]) ? ramas[n] : 0];
      }));
    }
    p.meridianos_version = 3;
    this.sincronizarPuntosTecnica();
  }

  // CONSERVAR_NORMALIZACION_ACTUAL: completar campos de CULTIVO. Mismo patrón que
  // normalizarMeridianos(): se llama al cargar partida. Sólo AGREGA campos
  // ausentes con valores por defecto seguros; nunca resetea ni borra datos
  // existentes (reino, etapa, qi, comprension, calidad_fundacion, impurezas y
  // heridas_meridianos se dejan intactos).
  normalizarCultivo() {
    const p = this.player; if (!p) return;
    if (Number(p.cultivo_version || 0) >= 1) return;

    if (typeof p.granPerfeccionLianQi !== "boolean") p.granPerfeccionLianQi = false;

    const ilu = (p.iluminacion && typeof p.iluminacion === "object") ? p.iluminacion : {};
    p.iluminacion = {
      alcanzada: ilu.alcanzada === true,
      semillaCorazonDao: ilu.semillaCorazonDao ?? null,
    };

    const trib = (p.tribulacionCorazon && typeof p.tribulacionCorazon === "object") ? p.tribulacionCorazon : {};
    p.tribulacionCorazon = { superada: trib.superada === true, pendienteReintento: trib.pendienteReintento === true };

    if (!Array.isArray(p.historialReinos)) p.historialReinos = [];
    if (!Array.isArray(p.historialArcos)) p.historialArcos = [];

    p.cultivo_version = 1;
  }

  bloqueoRama(tid, n) {
    const p = this.player, t = TECNICAS[tid];
    if (!p || !t || !p.tecnicas[tid]) return "Aprende primero la técnica mediante su enseñanza o manual.";
    if (![1, 2, 3].includes(n)) return "Tramo desconocido.";
    // Rango, no igualdad: el tramo 3 y las técnicas de ZhuJi siguen disponibles
    // en los reinos posteriores cuando existan (ver §14.2 del contrato).
    if ((t.req?.reino === "ZhuJi" || n === 3) && !reinoAlMenos(p, "ZhuJi")) return "Requiere ZhuJi: establece tu Fundación.";
    if (!reinoAlMenos(p, "ZhuJi") && p.etapa < n + 1) return `Requiere LianQi, etapa ${n + 1}.`;
    if ((p.tecnicas[tid].maestria || 0) < n) return `Requiere maestría ${MAESTRIA_NOMBRES[n]} (${umbralesTecnica(tid)[n - 1]} usos efectivos).`;
    return "";
  }

  bloqueoReconfigurar() {
    if (!this.player || !this.visitadas.size) return "Crea o carga un personaje.";
    if (this.terminado || this.player.hp <= 0) return "No puedes reorganizar los meridianos ahora.";
    if (this.combate) return "Termina el combate para reorganizar los meridianos.";
    if (this.pregunta) return "Responde primero al diálogo pendiente.";
    if (this.rooms[this.pos]?.salvaje || this.vivos.some(m => m.hp > 0)) return "Busca un lugar seguro, sin criaturas hostiles.";
    return "";
  }

  bloqueoEleccion(tid, n, opcion) {
    this.sincronizarPuntosTecnica();
    if (![0, 1, 2, 3].includes(opcion) || (opcion !== 0 && !this.opcionMeridiano(tid, n, opcion))) return "Elección desconocida.";
    if (!this.player?.tecnicas?.[tid]) return "Aprende primero la técnica mediante su enseñanza o manual.";
    const actual = this.player.tecnicas[tid].ramas?.[n] || 0;
    let motivo = this.bloqueoRama(tid, n) || this.bloqueoReconfigurar();
    if (motivo) return motivo;
    if (opcion !== 0 && actual === 0 && this.puntosTecnicaDisponibles() < 1)
      return "No tienes puntos de técnica disponibles. Retira un punto de otra especialización o consigue uno al progresar.";
    return "";
  }

  elegirRama(tid, n, opcion) {
    const motivo = this.bloqueoEleccion(tid, n, opcion);
    if (motivo) return { ok: false, texto: motivo };
    this.normalizarMeridianos();
    const anterior = this.player.tecnicas[tid].ramas[n] || 0;
    this.player.tecnicas[tid].ramas[n] = opcion;
    this.autoguardar(); this.actualizarPanel();
    const nombre = opcion ? this.opcionMeridiano(tid, n, opcion)?.nombre : "técnica base";
    const movimiento = anterior === opcion ? "Ya estaba aplicada."
      : opcion === 0 ? "Punto devuelto; este tramo vuelve a quedar sin especializar."
      : anterior === 0 ? "Punto invertido; queda activa permanentemente."
      : "El punto cambia de cauce; la elección anterior queda sustituida.";
    return { ok: true, texto: `${TECNICAS[tid].name}: ${nombre}. ${movimiento}` };
  }

  // Atajo del árbol de meridianos: un clic compara; doble clic actúa como
  // interruptor. Sobre un cauce inactivo asigna/cambia el punto y sobre el
  // cauce que ya está activo devuelve el punto, dejando el tramo base.
  activarRamaDoble(tid, n, opcion) {
    const rec = this.player?.tecnicas?.[tid];
    const actual = rec?.ramas?.[n] || 0;
    const destino = actual === opcion ? 0 : opcion;
    const res = this.elegirRama(tid, n, destino);
    this.merVista = res.ok ? null : { n, op: opcion };
    this.renderMeridianos();
    const aviso = document.getElementById("merAviso");
    if (aviso) aviso.textContent = res.texto;
  }

  tecnicasDescubiertas() {
    if (!this.player || !this.visitadas.size) return [];
    return Object.keys(this.player.tecnicas).filter(tid => TECNICAS[tid]);
  }

  // ------------------------------------------------------------------------
  //  TÉCNICAS PREPARADAS Y BUILDS  ·  ver CONTRATO DE DISEÑO · BUILDS Y COMBATE
  //
  //  Índice por tema:
  //    datos              normalizarBuilds, tecnicasPreparadasActuales,
  //                       estaPreparada
  //    loadout            bloqueoPreparacion, prepararTecnica,
  //                       despreprararTecnica
  //    snapshot           snapshotConfiguracionActual, snapshotDeBuild,
  //                       claveConfiguracion, configuracionCoincideBuild,
  //                       puntosDeSnapshot
  //    aplicación         validarSnapshotBuild, aplicarSnapshotBuild
  //    presets            guardarBuildActual, activarBuild, actualizarBuild,
  //                       restaurarBuild, renombrarBuild, duplicarBuild,
  //                       eliminarBuild, estadoBuild
  // ------------------------------------------------------------------------

  // Repara sin romper: arrays ausentes, ids repetidos, técnicas olvidadas,
  // valores de rama inválidos, build_activa fantasma y contador de ids perdido.
  normalizarBuilds() {
    const p = this.player; if (!p) return;
    const conocida = tid => typeof tid === "string" && !!TECNICAS[tid] && !!p.tecnicas?.[tid];
    const limpiarRamas = (tid, ramas) => {
      const fila = {};
      let usa = false;
      for (const n of [1, 2, 3]) {
        const v = ramas?.[n];
        // Un cauce que ya no existe en RAMAS vuelve a 0 en vez de invalidar la build entera.
        const valor = [1, 2, 3].includes(v) && this.opcionMeridiano(tid, n, v) ? v : 0;
        fila[n] = valor;
        if (valor) usa = true;
      }
      return usa ? fila : null;
    };
    const vistas = new Set();
    p.tecnicas_preparadas = (Array.isArray(p.tecnicas_preparadas) ? p.tecnicas_preparadas : [])
      .filter(tid => conocida(tid) && !vistas.has(tid) && (vistas.add(tid), true));
    // CONSERVAR_NORMALIZACION_ACTUAL: una selección vacía permanece vacía.
    p.builds_version = 2;
    const brutas = (Array.isArray(p.builds) ? p.builds : []).filter(b => b && typeof b === "object");
    let seq = Number.isFinite(p.build_seq) ? Math.max(0, Math.floor(p.build_seq)) : 0;
    for (const b of brutas) {
      const m = /^build_(\d+)$/.exec(typeof b.id === "string" ? b.id : "");
      if (m) seq = Math.max(seq, Number(m[1]));
    }
    p.build_seq = seq;
    const ids = new Set(), nombres = new Set(), limpias = [];
    for (const b of brutas) {
      if (limpias.length >= MAX_BUILDS) break;
      let id = typeof b.id === "string" ? b.id.trim() : "";
      if (!id || ids.has(id)) id = `build_${++p.build_seq}`;
      ids.add(id);
      let nombre = this.limpiarNombreBuild(b.nombre) || this.limpiarNombreBuild(`Configuración ${limpias.length + 1}`);
      if (nombres.has(nombre.toLowerCase())) {
        let i = 2, candidato = this.nombreBuildConSufijo(nombre, i);
        while (nombres.has(candidato.toLowerCase())) candidato = this.nombreBuildConSufijo(nombre, ++i);
        nombre = candidato;
      }
      nombres.add(nombre.toLowerCase());
      const preparadasVistas = new Set();
      const preparadas = (Array.isArray(b.preparadas) ? b.preparadas : [])
        .filter(tid => conocida(tid) && !preparadasVistas.has(tid) && (preparadasVistas.add(tid), true));
      const ramas = {};
      for (const [tid, fila] of Object.entries(b.ramas && typeof b.ramas === "object" ? b.ramas : {})) {
        if (!conocida(tid)) continue;
        const limpia = limpiarRamas(tid, fila);
        if (limpia) ramas[tid] = limpia;
      }
      // Se repara el objeto existente en vez de crear uno nuevo: cualquier
      // referencia tomada antes de normalizar sigue apuntando a la misma build.
      b.id = id; b.nombre = nombre; b.preparadas = preparadas; b.ramas = ramas;
      limpias.push(b);
    }
    p.builds = limpias;
    if (!ids.has(p.build_activa)) p.build_activa = null;
  }

  // Única fuente para el futuro combate: sólo ids existentes y aprendidos.
  tecnicasPreparadasActuales() {
    const p = this.player; if (!p) return [];
    const vistas = new Set();
    return (Array.isArray(p.tecnicas_preparadas) ? p.tecnicas_preparadas : [])
      .filter(tid => TECNICAS[tid] && p.tecnicas?.[tid] && !vistas.has(tid) && (vistas.add(tid), true));
  }

  estaPreparada(tid) { return this.tecnicasPreparadasActuales().includes(tid); }

  // Preparar no toca meridianos, así que no exige lugar seguro: sólo prohíbe
  // reorganizar el loadout en mitad de un combate.
  bloqueoPreparacion() {
    if (!this.player) return "Crea o carga un personaje.";
    if (this.combate) return "No puedes reorganizar tus técnicas preparadas durante un combate.";
    return "";
  }

  prepararTecnica(tid) {
    const motivo = this.bloqueoPreparacion();
    if (motivo) return { ok: false, texto: motivo };
    if (!TECNICAS[tid]) return { ok: false, texto: "Esa técnica no existe." };
    if (!this.player.tecnicas?.[tid]) return { ok: false, texto: "Aprende primero la técnica mediante su enseñanza o manual." };
    this.normalizarBuilds();
    if (this.estaPreparada(tid)) return { ok: false, texto: `${TECNICAS[tid].name} ya estaba preparada.` };
    this.player.tecnicas_preparadas.push(tid);
    if (this.combateVista) this.actualizarVistaCombate();
    this.autoguardar();
    return { ok: true, texto: `${TECNICAS[tid].name} queda preparada para tu configuración de combate.` };
  }

  despreprararTecnica(tid) {
    const motivo = this.bloqueoPreparacion();
    if (motivo) return { ok: false, texto: motivo };
    this.normalizarBuilds();
    if (!this.estaPreparada(tid)) return { ok: false, texto: "Esa técnica no está preparada." };
    this.player.tecnicas_preparadas = this.player.tecnicas_preparadas.filter(id => id !== tid);
    if (this.combateVista) this.actualizarVistaCombate();
    this.autoguardar();
    return { ok: true, texto: `${TECNICAS[tid].name} deja de estar preparada. Conserva maestría, progreso y meridianos.` };
  }

  // Fotografía canónica de la configuración actual: preparadas + elecciones.
  // Nunca stats derivados. Las técnicas sin ningún punto no ocupan sitio.
  snapshotConfiguracionActual() {
    const p = this.player;
    if (!p) return { preparadas: [], ramas: {} };
    this.normalizarBuilds();
    const ramas = {};
    for (const [tid, rec] of Object.entries(p.tecnicas || {})) {
      if (!TECNICAS[tid]) continue;
      const fila = {};
      let usa = false;
      for (const n of [1, 2, 3]) {
        const v = [1, 2, 3].includes(rec?.ramas?.[n]) ? rec.ramas[n] : 0;
        fila[n] = v;
        if (v) usa = true;
      }
      if (usa) ramas[tid] = fila;
    }
    return { preparadas: [...this.tecnicasPreparadasActuales()], ramas };
  }

  snapshotDeBuild(build) {
    if (!build) return { preparadas: [], ramas: {} };
    const ramas = {};
    for (const [tid, fila] of Object.entries(build.ramas || {})) {
      const limpia = {};
      let usa = false;
      for (const n of [1, 2, 3]) {
        const v = [1, 2, 3].includes(fila?.[n]) ? fila[n] : 0;
        limpia[n] = v;
        if (v) usa = true;
      }
      if (usa) ramas[tid] = limpia;
    }
    return { preparadas: [...(build.preparadas || [])], ramas };
  }

  // Clave textual comparable: el orden de preparadas importa; el de las
  // técnicas con ramas, no.
  claveConfiguracion(snap) {
    const ramas = Object.keys(snap.ramas || {}).sort()
      .map(tid => [tid, [1, 2, 3].map(n => snap.ramas[tid][n] || 0)]);
    return JSON.stringify({ preparadas: snap.preparadas || [], ramas });
  }

  // El estado MODIFICADA se calcula siempre; nunca existe un flag guardado.
  configuracionCoincideBuild(build) {
    if (!build) return false;
    return this.claveConfiguracion(this.snapshotConfiguracionActual())
      === this.claveConfiguracion(this.snapshotDeBuild(build));
  }

  puntosDeSnapshot(snap) {
    return Object.entries(snap?.ramas || {}).reduce((total, [tid, fila]) =>
      total + [1, 2, 3].filter(n => this.opcionMeridiano(tid, n, fila[n])).length, 0);
  }

  // Valida TODO antes de tocar nada: reutiliza bloqueoReconfigurar y bloqueoRama
  // en vez de reescribir los requisitos de reino, etapa y maestría.
  validarSnapshotBuild(snap) {
    const p = this.player;
    if (!p) return "Crea o carga un personaje.";
    if (!snap) return "Esa configuración no existe.";

    // No toda activación de build reorganiza meridianos. Si las ramas del
    // snapshot ya coinciden con las actuales y sólo cambia el loadout de
    // técnicas preparadas, se aplican las reglas de PREPARAR (bloqueo sólo en
    // combate). La exigencia de un lugar seguro queda reservada a cambios
    // reales de meridianos.
    const actual = this.snapshotConfiguracionActual();
    const claveRamas = ramas => JSON.stringify(Object.keys(ramas || {}).sort().map(tid =>
      [tid, [1, 2, 3].map(n => ramas[tid]?.[n] || 0)]));
    const cambianRamas = claveRamas(actual.ramas) !== claveRamas(snap.ramas);
    const cambianPreparadas = JSON.stringify(actual.preparadas || []) !== JSON.stringify(snap.preparadas || []);
    const bloqueoEntorno = cambianRamas ? this.bloqueoReconfigurar()
      : cambianPreparadas ? this.bloqueoPreparacion()
      : "";
    if (bloqueoEntorno) return bloqueoEntorno;
    for (const tid of snap.preparadas || []) {
      if (!TECNICAS[tid]) return "La configuración menciona una técnica que ya no existe.";
      if (!p.tecnicas?.[tid]) return `Todavía no conoces ${TECNICAS[tid].name}.`;
    }
    for (const [tid, fila] of Object.entries(snap.ramas || {})) {
      if (!TECNICAS[tid]) return "La configuración menciona una técnica que ya no existe.";
      if (!p.tecnicas?.[tid]) return `Todavía no conoces ${TECNICAS[tid].name}.`;
      for (const n of [1, 2, 3]) {
        const op = fila[n] || 0;
        if (![0, 1, 2, 3].includes(op)) return "La configuración contiene una elección desconocida.";
        if (!op) continue;
        if (!this.opcionMeridiano(tid, n, op)) return "La configuración contiene un cauce desconocido.";
        const bloqueo = this.bloqueoRama(tid, n);
        if (bloqueo) return `${TECNICAS[tid].name}, tramo ${n}: ${bloqueo}`;
      }
    }
    this.sincronizarPuntosTecnica();
    const necesarios = this.puntosDeSnapshot(snap);
    if (necesarios > (p.puntos_tecnica_total || 0))
      return `Esta configuración necesita ${necesarios} puntos de técnica y solo tienes ${p.puntos_tecnica_total}.`;
    return "";
  }

  // Aplicación atómica: se construye el destino completo y sólo entonces se
  // escribe. Nunca deja estados intermedios y nunca desaprende una técnica.
  aplicarSnapshotBuild(snap) {
    const motivo = this.validarSnapshotBuild(snap);
    if (motivo) return { ok: false, texto: motivo };
    const p = this.player;
    const destino = {};
    for (const tid of Object.keys(p.tecnicas || {})) {
      if (!TECNICAS[tid]) continue;
      destino[tid] = { 1: 0, 2: 0, 3: 0 };
    }
    for (const [tid, fila] of Object.entries(snap.ramas || {})) {
      destino[tid] = { 1: fila[1] || 0, 2: fila[2] || 0, 3: fila[3] || 0 };
    }
    for (const [tid, fila] of Object.entries(destino)) p.tecnicas[tid].ramas = fila;
    p.tecnicas_preparadas = [...(snap.preparadas || [])];
    this.sincronizarPuntosTecnica();
    this.normalizarBuilds();
    if (this.combateVista) this.actualizarVistaCombate();
    return { ok: true, texto: "" };
  }

  limpiarNombreBuild(nombre) {
    const limpio = String(nombre ?? "").replace(/\s+/g, " ").trim();
    return Array.from(limpio).slice(0, MAX_NOMBRE_BUILD).join("").trim();
  }

  nombreBuildConSufijo(base, numero) {
    const sufijo = ` ${numero}`;
    const limiteBase = Math.max(1, MAX_NOMBRE_BUILD - Array.from(sufijo).length);
    const raiz = Array.from(this.limpiarNombreBuild(base) || "Build").slice(0, limiteBase).join("").trimEnd();
    return `${raiz}${sufijo}`;
  }

  nombreBuildLibre(base) {
    const p = this.player;
    const usados = new Set((p?.builds || []).map(b => this.limpiarNombreBuild(b.nombre).toLowerCase()));
    const nombre = this.limpiarNombreBuild(base) || "Configuración";
    if (!usados.has(nombre.toLowerCase())) return nombre;
    let i = 2, candidato = this.nombreBuildConSufijo(nombre, i);
    while (usados.has(candidato.toLowerCase())) candidato = this.nombreBuildConSufijo(nombre, ++i);
    return candidato;
  }

  errorNombreBuild(nombre, excluirId = null) {
    const crudo = String(nombre ?? "").replace(/\s+/g, " ").trim();
    if (!crudo) return "Escribe un nombre para la build.";
    if (Array.from(crudo).length > MAX_NOMBRE_BUILD)
      return `No puedes poner más de ${MAX_NOMBRE_BUILD} caracteres para el nombre de una build.`;
    const limpio = this.limpiarNombreBuild(crudo);
    const choca = (this.player?.builds || []).some(b => b.id !== excluirId && b.nombre.toLowerCase() === limpio.toLowerCase());
    if (choca) return "Ya existe una build con ese nombre.";
    return "";
  }

  buildPorId(id) { return (this.player?.builds || []).find(b => b.id === id) || null; }

  // Activa / Modificada / Guardada: siempre derivado, nunca almacenado.
  estadoBuild(build) {
    if (!build || this.player?.build_activa !== build.id) return "guardada";
    return this.configuracionCoincideBuild(build) ? "activa" : "modificada";
  }

  guardarBuildActual(nombre) {
    const p = this.player;
    if (!p) return { ok: false, texto: "Crea o carga un personaje." };
    this.normalizarBuilds();
    if (p.builds.length >= MAX_BUILDS) return { ok: false, texto: `Has alcanzado el máximo de ${MAX_BUILDS} builds guardadas.` };
    const error = this.errorNombreBuild(nombre);
    if (error) return { ok: false, texto: error };
    const snap = this.snapshotConfiguracionActual();
    const build = { id: `build_${++p.build_seq}`, nombre: this.limpiarNombreBuild(nombre), preparadas: snap.preparadas, ramas: snap.ramas };
    p.builds.push(build);
    // La configuración actual coincide exactamente con el preset recién creado.
    p.build_activa = build.id;
    this.autoguardar();
    return { ok: true, texto: `Build «${build.nombre}» guardada.`, id: build.id };
  }

  activarBuild(id) {
    // Una build con datos incompletos se repara antes de resolver
    // el id y aplicar su snapshot. Así la activación no depende de haber abierto
    // previamente la pestaña BUILDS, que también normaliza estos datos.
    this.normalizarBuilds();
    const build = this.buildPorId(id);
    if (!build) return { ok: false, texto: "Esa build ya no existe." };
    const res = this.aplicarSnapshotBuild(this.snapshotDeBuild(build));
    if (!res.ok) return res;
    this.player.build_activa = build.id;
    this.autoguardar(); this.actualizarPanel();
    return { ok: true, texto: `Build «${build.nombre}» activada.` };
  }

  restaurarBuild(id) {
    const build = this.buildPorId(id);
    if (!build) return { ok: false, texto: "Esa build ya no existe." };
    if (this.player.build_activa !== build.id) return { ok: false, texto: "Sólo puedes restaurar la build activa." };
    const res = this.aplicarSnapshotBuild(this.snapshotDeBuild(build));
    if (!res.ok) return res;
    this.autoguardar(); this.actualizarPanel();
    return { ok: true, texto: "Configuración restaurada." };
  }

  actualizarBuild(id) {
    const build = this.buildPorId(id);
    if (!build) return { ok: false, texto: "Esa build ya no existe." };
    if (this.player.build_activa !== build.id)
      return { ok: false, texto: "Sólo puedes sobrescribir la build activa. Actívala antes de actualizarla." };
    const snap = this.snapshotConfiguracionActual();
    const destino = this.buildPorId(id) || build;
    destino.preparadas = snap.preparadas;
    destino.ramas = snap.ramas;
    this.autoguardar();
    return { ok: true, texto: `Build «${destino.nombre}» actualizada con tu configuración actual.` };
  }

  renombrarBuild(id, nombre) {
    const build = this.buildPorId(id);
    if (!build) return { ok: false, texto: "Esa build ya no existe." };
    const error = this.errorNombreBuild(nombre, build.id);
    if (error) return { ok: false, texto: error };
    const antes = build.nombre;
    build.nombre = this.limpiarNombreBuild(nombre);
    this.autoguardar();
    return { ok: true, texto: `«${antes}» pasa a llamarse «${build.nombre}».` };
  }

  duplicarBuild(id) {
    const p = this.player;
    const build = this.buildPorId(id);
    if (!build) return { ok: false, texto: "Esa build ya no existe." };
    if (p.builds.length >= MAX_BUILDS) return { ok: false, texto: `Has alcanzado el máximo de ${MAX_BUILDS} builds guardadas.` };
    const copia = {
      id: `build_${++p.build_seq}`,
      nombre: this.nombreBuildLibre(`${build.nombre} (copia)`),
      preparadas: [...(build.preparadas || [])],
      ramas: JSON.parse(JSON.stringify(build.ramas || {})),
    };
    p.builds.push(copia);
    this.autoguardar();
    return { ok: true, texto: `Copia guardada como «${copia.nombre}». No se ha activado.`, id: copia.id };
  }

  // Eliminar no cambia la configuración actual: sólo desaparece el preset.
  eliminarBuild(id) {
    const p = this.player;
    const build = this.buildPorId(id);
    if (!build) return { ok: false, texto: "Esa build ya no existe." };
    p.builds = p.builds.filter(b => b.id !== id);
    if (p.build_activa === id) p.build_activa = null;
    this.autoguardar();
    return { ok: true, texto: `Build «${build.nombre}» eliminada. Tu configuración actual no ha cambiado.` };
  }

  // ==========================================================================
  //  CONTRATO DE DISEÑO · INTERFAZ DE COMBATE
  //
  //   1. Combate contiene reglas, no DOM.
  //   2. La terminal de exploración no recibe turnos de combate.
  //   3. combateUI representa el encuentro actual; combateVista es su estado
  //      de PRESENTACIÓN (log, drawer, acumulador de recompensas) — nunca se
  //      serializa y nunca condiciona bloqueoReconfigurar/bloqueoPreparacion.
  //   4. #form sigue siendo el único input textual: los botones de la ventana
  //      llaman a enviarComando() con el mismo verbo que el parser acepta.
  //   5. El lateral (#minimapa) se oculta durante la pelea; no se reescribe.
  //   6. Las técnicas rápidas vienen de tecnicasPreparadasActuales(), nunca de
  //      Object.keys(player.tecnicas) ni de player.build_activa directamente.
  //   7. Los drops se conceden por recompensas()/registrarCadaver() ya
  //      existentes; el resumen de victoria sólo observa lo que ya ocurrió
  //      (diff de qi/inventario/piedras), nunca recalcula ni reparsea texto.
  //   8. Cadáveres no son loot: aparecen en su propia sección, nunca se
  //      añaden al inventario desde el panel.
  //   9. Al terminar el motor (this.combate = null) la ventana puede seguir
  //      abierta en estado "victoria"/"derrota"/"huida"; los resolutores
  //      narrativos (resolverDuelo, triunfoZhuji, resolverPractica, muerte)
  //      se disparan al pulsar CONTINUAR, cuando el terminal ya es visible
  //      de nuevo — nunca mientras el overlay tapa la pregunta que hacen.
  //  10. Escape no cierra el combate. No hay botón «X»: sólo ATACAR/HUIR/
  //      victoria/derrota real cierran la ventana.
  // ==========================================================================

  // ---------- ciclo de vida de la ventana ----------

  // Único punto de entrada a un combate real: sustituye a los 5 sitios que
  // antes hacían `this.combate = new Combate(...)` a mano.
  entrarCombate(enemigo, mobId, especial = null, buff = 0, permitirHuir = true) {
    this.combate = new Combate(this, enemigo, mobId, especial, buff, permitirHuir);
    this.combateVista = {
      log: [], drawer: "tecnicas", autoscroll: true,
      acumulador: { enemigosDerrotados: [], derrotas: [], qiGanado: 0, piedrasGanadas: 0, items: new Map(), cadaveres: [], descubrimientos: [], consecuencias: [] },
    };
    this.abrirInterfazCombate();
    this.actualizarVistaCombate();
    return this.combate;
  }

  abrirInterfazCombate() {
    if (!this.zonaEl || !this.cbEl) return;
    this.zonaEl.classList.add("en-combate");
    this.cbEl.hidden = false;
    if (this.cbResultadoEl) this.cbResultadoEl.hidden = true;
    if (this.cbLogEl) this.cbLogEl.replaceChildren();
  }

  // Restaura exactamente el estado previo: minimapa, terminal, panel normal,
  // foco. No queda ninguna clase residual de modo combate.
  cerrarInterfazCombate() {
    if (this.zonaEl) this.zonaEl.classList.remove("en-combate");
    if (this.cbEl) this.cbEl.hidden = true;
    if (this.cbResultadoEl) this.cbResultadoEl.hidden = true;
    this.combateVista = null;
    this.actualizarPanel();
    const entrada = document.getElementById("entrada");
    if (entrada) entrada.focus({ preventScroll: true });
  }

  // ---------- registro (log) ----------

  // Las barras textuales pertenecen a la presentación antigua del combate.
  // El motor puede seguir generándolas para conservar compatibilidad, pero la
  // ventana nueva ya representa esos datos con medidores y tarjetas propias.
  esLineaVitalLegacyCombate(linea) {
    return /^TÚ ♥/.test(linea)
      || /^OTRO · .*♥/.test(linea)
      || /^GRULLA ♥/.test(linea)
      || /^JEFE FINAL · FASE \d+\/3 ·/.test(linea);
  }

  // Sustituye a `this.salida(texto)` mientras hay combate: el texto nunca
  // llega a #contenido, sólo al registro propio de la ventana.
  registrarSalidaCombate(texto) {
    const vista = this.combateVista;
    if (!vista || !this.cbLogEl) return;
    const cont = this.cbLogEl;
    const estabaAbajo = cont.scrollHeight - cont.scrollTop - cont.clientHeight < 12;
    for (const cruda of String(texto).split("\n")) {
      const linea = cruda.replace(/^\s+/, "");
      if (!linea || this.esLineaVitalLegacyCombate(linea)) continue;
      vista.log.push(linea);
      cont.appendChild(this.nodoLineaCombate(linea));
    }
    // El registro es una ventana, no una pila infinita: conservar un historial
    // suficiente para leer hacia atrás sin permitir que el DOM crezca sin límite.
    while (vista.log.length > MAX_LINEAS_LOG_COMBATE) vista.log.shift();
    while (cont.children.length > MAX_LINEAS_LOG_COMBATE) cont.firstElementChild?.remove();
    // Autoscroll normal; si el jugador ya había subido a leer, no lo forzamos
    // de vuelta hasta que él mismo regrese abajo.
    if (estabaAbajo || vista.autoscroll) cont.scrollTop = cont.scrollHeight;
  }

  // Clasificación por forma de línea (mismo espíritu que salida() ya usa para
  // la terminal de exploración): una clase por línea, y dentro de ella un
  // resaltado puntual de la técnica y la cifra de daño. Nada de emoji por
  // palabra ni una paleta nueva — sólo las variables elementales existentes.
  nodoLineaCombate(linea) {
    const div = document.createElement("div");
    div.className = "combate-registro-linea " + this.clasificarLineaCombate(linea);
    const tecnica = this.tecnicaMencionadaEn(linea);
    if (tecnica) {
      const idx = linea.indexOf(tecnica.name);
      div.append(linea.slice(0, idx));
      const fuerte = document.createElement("strong");
      fuerte.className = `combate-elemento-${tecnica.clave}`;
      fuerte.textContent = tecnica.name;
      div.appendChild(fuerte);
      linea = linea.slice(idx + tecnica.name.length);
    }
    const m = linea.match(/\d+ (?:de )?daño/);
    if (m) {
      div.append(linea.slice(0, m.index));
      const span = document.createElement("span");
      span.className = "cl-danio";
      span.textContent = m[0];
      div.appendChild(span);
      div.append(linea.slice(m.index + m[0].length));
    } else {
      div.append(linea);
    }
    return div;
  }

  tecnicaMencionadaEn(linea) {
    this._tecnicasPorNombre ||= Object.values(TECNICAS)
      .map(t => ({ name: t.name, clave: t.elementos ? "mixta" : t.elemento }))
      .sort((a, b) => b.name.length - a.name.length);
    return this._tecnicasPorNombre.find(t => linea.includes(t.name)) || null;
  }

  clasificarLineaCombate(linea) {
    if (/\bfalla\b/.test(linea)) return "cl-falla";
    if (/CRÍTICO/.test(linea)) return "cl-critico";
    if (/ha caído!$/.test(linea)) return "cl-cae";
    if (/^\s*Concordancia:/.test(linea)) return "cl-combo";
    if (/^\s*¡Ventaja elemental!/.test(linea)) return "cl-ventaja";
    if (/golpeas con menos fuerza\.\)\s*$/.test(linea)) return "cl-desventaja";
    if (/se suma al combate|entra al combate|queda atrapad[oa] en la formación/.test(linea)) return "cl-union";
    if (/^══ FASE/.test(linea)) return "cl-fase";
    if (/^Botín:|^No encuentras botín|^Absorbes el qi|^✦ Bestiario/.test(linea)) return "cl-botin";
    if (/^⚠|entra en tus meridianos|se aferra a tu piel|estados activos/.test(linea)) return "cl-estado";
    return "";
  }

  // ---------- render de la ventana ----------

  actualizarVistaCombate() {
    const c = this.combate, vista = this.combateVista;
    if (!c || !vista) return;
    if (!['tecnicas', 'objetos'].includes(vista.drawer)) vista.drawer = 'tecnicas';
    if (this.cbTituloEl) {
      this.cbTituloEl.textContent = `COMBATE · ${this.rooms[this.pos]?.name || ""}`;
    }
    if (this.cbRondaEl) {
      this.cbRondaEl.textContent = `RONDA ${c.round}`;
    }
    this.renderJugadorCombate();
    this.renderCombatientes();
    this.renderIntencionCombate();
    this.renderAccionesCombate();
    this.renderResumenPreparadasCombate();
    if (vista.drawer === "objetos") this.renderDrawerObjetos();
    else this.renderDrawerTecnicas();
  }

  crearChipEstadoCombate(st, { afliccion = false } = {}) {
    const d = descriptorEstadoCombate(st, { afliccion });
    const chip = document.createElement('span');
    chip.className = `combate-estado-chip is-${d.clase}`;
    chip.textContent = d.texto;
    chip.title = d.titulo;
    chip.setAttribute('aria-label', d.titulo);
    return chip;
  }

  renderChipsEstadoCombate(contenedor, entradas, limite = 6) {
    if (!contenedor) return;
    const visibles = entradas.slice(0, limite);
    for (const entrada of visibles) {
      if (entrada?.tenacidad) {
        contenedor.appendChild(this.crearChipEstadoCombate({ tipo: 'tenacidad', nombre: 'Tenacidad', duracion: entrada.tenacidad }));
      } else {
        const st = entrada?.estado || entrada;
        if (st) contenedor.appendChild(this.crearChipEstadoCombate(st, { afliccion: !!entrada?.afliccion }));
      }
    }
    const restantes = entradas.length - visibles.length;
    if (restantes > 0) {
      const mas = document.createElement('span');
      mas.className = 'combate-estado-chip is-mas';
      mas.textContent = `+${restantes}`;
      mas.title = `${restantes} estado${restantes === 1 ? '' : 's'} adicional${restantes === 1 ? '' : 'es'}`;
      contenedor.appendChild(mas);
    }
  }

  renderJugadorCombate() {
    const cont = this.cbJugadorEl, p = this.player, c = this.combate;
    if (!cont || !p) return;
    cont.replaceChildren();
    const etapa = reinoExacto(p, "LianQi") ? `Etapa ${p.etapa}/${totalEtapas(p.reino)}` : "Fundación Establecida";
    const nombre = document.createElement("div");
    nombre.className = "combate-jugador-nombre";
    nombre.textContent = `${capitalizarUI(p.name)} · ${p.reino} · ${etapa}`;
    cont.appendChild(nombre);
    const medidor = (etiqueta, actual, max, clase) => {
      const fila = document.createElement("div");
      fila.className = "combate-jugador-medidor";
      fila.setAttribute("role", "meter");
      fila.setAttribute("aria-label", `${etiqueta} ${Math.max(0, actual)} de ${max}`);
      fila.setAttribute("aria-valuenow", String(Math.max(0, actual)));
      fila.setAttribute("aria-valuemin", "0");
      fila.setAttribute("aria-valuemax", String(max));
      const et = document.createElement("span"); et.className = "combate-jugador-etiqueta"; et.textContent = etiqueta;
      const pista = document.createElement("span"); pista.className = "combate-jugador-pista";
      const relleno = document.createElement("span"); relleno.className = "combate-jugador-relleno " + clase;
      relleno.style.width = `${max > 0 ? Math.max(0, Math.min(100, Math.max(0, actual) / max * 100)) : 0}%`;
      pista.appendChild(relleno);
      const cifra = document.createElement("span"); cifra.className = "combate-jugador-cifra"; cifra.textContent = `${Math.max(0, actual)}/${max}`;
      fila.append(et, pista, cifra);
      cont.appendChild(fila);
    };
    medidor("VIDA", p.hp, p.max_hp, "hp");
    medidor("QI", p.qi, p.qi_max, "qi");
    const estados = [
      ...c.estados.jugador.map(estado => ({ estado })),
      ...(p.aflicciones || []).map(estado => ({ estado, afliccion: true })),
    ];
    if (estados.length) {
      const caja = document.createElement("div");
      caja.className = "combate-jugador-estados";
      this.renderChipsEstadoCombate(caja, estados, 6);
      cont.appendChild(caja);
    }
  }

  renderCombatientes() {
    const cont = this.cbCombatientesEl, sueltosEl = this.cbSueltosEl, c = this.combate;
    if (!cont) return;
    cont.replaceChildren();
    for (const mob of c.combatientes) {
      const b = document.createElement("button");
      b.type = "button";
      const esObjetivo = mob === c.e;
      b.className = "combate-tarjeta" + (esObjetivo ? " is-objetivo" : "") + (mob.hp <= 0 ? " is-caido" : "");
      if (esObjetivo) b.setAttribute("aria-current", "true");
      if (mob.hp <= 0) b.disabled = true;
      const fila = document.createElement("div");
      fila.className = "combate-tarjeta-nombre";
      if ((mob.total_especie || 0) > 1) {
        const indice = document.createElement("span");
        indice.className = "combate-tarjeta-indice";
        indice.textContent = mob.indice_especie;
        fila.appendChild(indice);
      }
      const nombre = document.createElement("strong"); nombre.textContent = capitalizarUI(etiquetaMob(mob));
      fila.appendChild(nombre);
      if (esObjetivo) { const et = document.createElement("span"); et.className = "combate-tarjeta-objetivo"; et.textContent = "OBJETIVO ACTUAL"; fila.appendChild(et); }
      b.appendChild(fila);
      const medidor = document.createElement("div");
      medidor.className = "combate-tarjeta-medidor";
      medidor.setAttribute("role", "meter");
      medidor.setAttribute("aria-label", `Vida de ${etiquetaMob(mob)}: ${Math.max(0, mob.hp)} de ${mob.max_hp}`);
      const pista = document.createElement("span"); pista.className = "combate-tarjeta-pista";
      const relleno = document.createElement("span"); relleno.className = "combate-tarjeta-relleno";
      relleno.style.width = `${mob.max_hp > 0 ? Math.max(0, Math.min(100, Math.max(0, mob.hp) / mob.max_hp * 100)) : 0}%`;
      pista.appendChild(relleno);
      const cifra = document.createElement("span"); cifra.className = "combate-tarjeta-cifra"; cifra.textContent = `${Math.max(0, mob.hp)}/${mob.max_hp}`;
      medidor.append(pista, cifra);
      b.appendChild(medidor);

      const activos = (c.estadosEnemigos.get(mob) || []).map(estado => ({ estado }));
      const tenacidad = c.tenacidadDe(mob);
      if (tenacidad) activos.push({ tenacidad });
      if (activos.length) {
        const filaMeta = document.createElement("div");
        filaMeta.className = "combate-tarjeta-estados";
        this.renderChipsEstadoCombate(filaMeta, activos, 3);
        b.appendChild(filaMeta);
      }
      // Sólo el objetivo despliega el panel grande de INTENCIÓN; el resto,
      // si de verdad está preparando algo, lo dice en una línea discreta.
      if (mob !== c.e && mob.hp > 0 && mob.tecnica) {
        const reloj = c.round;
        if ((reloj + 1) % mob.tecnica.cada === 0) {
          const prep = document.createElement("div");
          prep.className = "combate-tarjeta-prepara";
          prep.textContent = `Prepara: ${mob.tecnica.name}`;
          b.appendChild(prep);
        }
      }
      if (mob.hp > 0) {
        b.addEventListener("click", () => {
          if (mob === c.e) return;
          const numero = (mob.total_especie || 0) > 1 ? ` ${mob.indice_especie}` : "";
          enviarComando(`atacar ${mob.mob_id}${numero}`);
        });
      }
      cont.appendChild(b);
    }
    if (sueltosEl) {
      const sueltos = (this.vivos || []).filter(m => m.hp > 0 && !c.combatientes.includes(m));
      sueltosEl.replaceChildren();
      if (sueltos.length) {
        sueltosEl.textContent = `+ ${sueltos.length} hostil${sueltos.length === 1 ? "" : "es"} no trabado${sueltos.length === 1 ? "" : "s"} en la sala `;
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = sueltosEl.dataset.expandido === "1" ? "ocultar" : "ver quiénes";
        b.addEventListener("click", () => {
          sueltosEl.dataset.expandido = sueltosEl.dataset.expandido === "1" ? "0" : "1";
          this.renderCombatientes();
        });
        sueltosEl.appendChild(b);
        if (sueltosEl.dataset.expandido === "1") {
          const detalle = document.createElement("span");
          detalle.textContent = " (" + sueltos.map(m => etiquetaMob(m)).join(", ") + ")";
          sueltosEl.appendChild(detalle);
        }
      }
    }
  }

  // Deriva la intención sin inventar nada nuevo: la misma condición
  // (`(reloj+1) % cada === 0`) que hoy dispara el aviso «reúne qi» en turno().
  renderIntencionCombate() {
    const cont = this.cbIntencionEl, c = this.combate;
    if (!cont) return;
    cont.replaceChildren();
    const titulo = document.createElement("span");
    titulo.className = "combate-intencion-titulo";
    titulo.textContent = "INTENCIÓN";
    cont.appendChild(titulo);
    const obj = c.e;
    const nombre = document.createElement("span");
    nombre.className = "combate-intencion-nombre";
    nombre.textContent = obj && obj.hp > 0 ? capitalizarUI(etiquetaMob(obj)) : "—";
    cont.appendChild(nombre);
    const texto = document.createElement("span");
    texto.className = "combate-intencion-texto";
    let prepara = false;
    if (!obj || obj.hp <= 0 || !obj.tecnica) {
      texto.textContent = "Sin preparación especial anunciada.";
    } else {
      const reloj = c.round;
      prepara = (reloj + 1) % obj.tecnica.cada === 0;
      texto.textContent = prepara
        ? `Reúne qi → prepara ${obj.tecnica.name}.`
        : "Sin preparación especial anunciada.";
    }
    cont.appendChild(texto);
    // Resplandor de aviso: se activa la ronda antes de que el objetivo suelte la técnica anunciada.
    cont.classList.toggle("combate-intencion-aviso", prepara);
  }

  // Sólo los cinco verbos principales del §32. HOJA/EQUIPO/MAPA siguen
  // existiendo por comando de texto. TÉCNICAS y OBJETOS no abren una ventana:
  // seleccionan el contenido de la columna contextual derecha.
  renderAccionesCombate() {
    const cont = this.cbAccionesEl, c = this.combate, vista = this.combateVista, p = this.player;
    if (!cont) return;
    cont.replaceChildren();
    const boton = (etiqueta, activo, deshabilitado, motivo, accion, tipo) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "combate-accion-boton" + (tipo ? ` combate-accion-${tipo}` : "");
      b.textContent = etiqueta;
      b.disabled = !!deshabilitado;
      if (deshabilitado && motivo) { b.title = motivo; b.setAttribute("aria-label", `${etiqueta}: ${motivo}`); }
      if (activo !== undefined) b.setAttribute("aria-expanded", String(activo));
      b.addEventListener("click", accion);
      cont.appendChild(b);
      return b;
    };
    const impacto = c.e ? probabilidadImpacto(c.ef().ataque, c.e.defensa, 20, c.e.esquiva ?? ESQUIVA_INNATA) : 0;
    boton(`ATACAR · ${impacto}%`, undefined, !c.e || c.e.hp <= 0, "No hay objetivo.", () => enviarComando("atacar"), "atacar");
    boton("DEFENDER", undefined, false, "", () => enviarComando("defender"), "defender");
    boton("TÉCNICAS", vista.drawer === "tecnicas", this.tecnicasPreparadasActuales().length === 0,
      "No tienes técnicas preparadas. Prepáralas en el Mapa de Meridianos.", () => this.seleccionarPanelCombate("tecnicas"), "tecnicas");
    const consumibles = (p.inventario || []).some(mid => ITEMS[mid]?.tipo === "consumible");
    boton("OBJETOS", vista.drawer === "objetos", !consumibles, "No llevas consumibles.", () => this.seleccionarPanelCombate("objetos"), "objetos");
    boton("HUIR", undefined, !c.permitirHuir, c.permitirHuir ? "" : "No hay adónde huir.", () => enviarComando("huir"), "huir");
  }

  seleccionarPanelCombate(cual) {
    const vista = this.combateVista;
    if (!vista || !["tecnicas", "objetos"].includes(cual)) return;
    vista.drawer = cual;
    this.renderAccionesCombate();
    if (cual === "objetos") this.renderDrawerObjetos();
    else this.renderDrawerTecnicas();
  }

  // Alias conservado para llamadas viejas: ya no colapsa el panel lateral.
  alternarDrawerCombate(cual) { this.seleccionarPanelCombate(cual); }

  colorElementoCombate(clave) {
    return `var(--${clave === "fuego" ? "cinabrio" : clave === "agua" ? "agua" : clave === "viento" ? "jade-claro" : clave === "metal" ? "papel" : clave === "mixta" ? "loto" : "oro"})`;
  }

  cabeceraPanelCombate(texto) {
    const h = document.createElement("div");
    h.className = "combate-panel-cabecera";
    h.textContent = texto;
    return h;
  }

  // Fuente única: tecnicasPreparadasActuales(). La build activa sólo puede
  // cambiar esa fuente; la interfaz nunca lee directamente el snapshot guardado.
  renderDrawerTecnicas() {
    const cont = this.cbDrawerEl, c = this.combate, p = this.player;
    if (!cont) return;
    cont.hidden = false;
    cont.dataset.panel = "tecnicas";
    cont.replaceChildren(this.cabeceraPanelCombate("TÉCNICAS PREPARADAS"));
    const ids = this.tecnicasPreparadasActuales();
    if (!ids.length) {
      const v = document.createElement("div");
      v.className = "combate-drawer-vacio";
      v.textContent = "Sin técnicas preparadas.";
      cont.appendChild(v);
      return;
    }
    const grupos = new Map();
    for (const tid of ids) {
      const t = TECNICAS[tid]; if (!t) continue;
      const clave = t.elementos ? "mixta" : t.elemento;
      (grupos.get(clave) || grupos.set(clave, []).get(clave)).push(tid);
    }
    for (const clave of [...ELEMENTOS, "mixta"]) {
      const lista = grupos.get(clave); if (!lista?.length) continue;
      const color = this.colorElementoCombate(clave);
      const titulo = document.createElement("div");
      titulo.className = "combate-drawer-grupo";
      titulo.style.setProperty("--elemento", color);
      titulo.textContent = clave === "mixta" ? "DEFINITIVAS" : ELEMENTO_UI[clave].nombre.toUpperCase();
      cont.appendChild(titulo);
      const grid = document.createElement("div");
      grid.className = "combate-drawer-grid";
      for (const tid of lista) {
        const t = TECNICAS[tid], conf = this.statsTecnica(tid);
        const cd = c.cooldownTecnica(tid);
        const sinQi = p.qi < conf.coste;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "combate-drawer-item";
        b.style.setProperty("--elemento", color);
        b.disabled = !!cd || sinQi;
        let precision = "";
        if (t.tipo === "ofensiva" && c.e) precision = `${probabilidadImpacto(c.ef().ataque + conf.ataqueBono, c.e.defensa, conf.critMin, c.e.esquiva ?? ESQUIVA_INNATA)}%`;
        else if (t.tipo === "control" && c.e) {
          const ten = c.tenacidadDe(c.e);
          precision = ten ? `TEN ${ten}` : `${c.probabilidadControl(conf, c.e)}%`;
        }
        const nombre = document.createElement("strong");
        nombre.textContent = t.corto || t.name;
        const sub = document.createElement("span");
        const estado = cd ? `CD ${cd}` : sinQi ? "SIN QI" : precision;
        sub.textContent = `${conf.coste} qi${estado ? ` · ${estado}` : ""}`;
        b.append(nombre, sub);
        b.title = `${t.name} · ${ROL_TECNICA[t.tipo] || t.tipo} · ${conf.coste} qi${cd ? ` · Enfriamiento ${cd}` : sinQi ? ` · Necesitas ${conf.coste} qi y tienes ${p.qi}` : precision ? ` · ${precision}` : ""}`;
        b.addEventListener("click", () => enviarComando(`tecnica ${tid}`));
        grid.appendChild(b);
      }
      cont.appendChild(grid);
    }
  }

  // Categorías visuales de consumibles de combate: cada una tiene su propio
  // color (coherente con el de las técnicas) para que se puedan distinguir
  // de un vistazo, sin depender de leer el nombre completo.
  CATEGORIAS_OBJETO_COMBATE = [
    { clave: "vida", titulo: "RESTAURAN VIDA", color: "var(--cinabrio)", test: it => !!it.cura },
    { clave: "qi", titulo: "RESTAURAN QI", color: "var(--agua)", test: it => !!it.recupera_qi },
    { clave: "afliccion", titulo: "TRATAN AFLICCIONES", color: "var(--jade-claro)", test: it => !!it.cura_afliccion },
    { clave: "meridianos", titulo: "REPARAN MERIDIANOS", color: "var(--oro)", test: it => !!it.remienda },
    { clave: "purifica", titulo: "PURIFICAN", color: "var(--loto)", test: it => !!it.purifica },
    { clave: "otro", titulo: "OTROS", color: "var(--tenue)", test: () => true },
  ];

  renderDrawerObjetos() {
    const cont = this.cbDrawerEl, p = this.player;
    if (!cont) return;
    cont.hidden = false;
    cont.dataset.panel = "objetos";
    cont.replaceChildren(this.cabeceraPanelCombate("OBJETOS UTILIZABLES"));
    const consumibles = agruparObjetos((p.inventario || []).filter(mid => ITEMS[mid]?.tipo === "consumible"));
    if (!consumibles.length) {
      const v = document.createElement("div");
      v.className = "combate-drawer-vacio";
      v.textContent = "No llevas consumibles.";
      cont.appendChild(v);
      return;
    }
    const categorias = this.CATEGORIAS_OBJETO_COMBATE;
    const grupos = new Map();
    for (const entrada of consumibles) {
      const cat = categorias.find(c => c.test(ITEMS[entrada.mid]));
      (grupos.get(cat.clave) || grupos.set(cat.clave, []).get(cat.clave)).push(entrada);
    }
    for (const cat of categorias) {
      const lista = grupos.get(cat.clave); if (!lista?.length) continue;
      const titulo = document.createElement("div");
      titulo.className = "combate-drawer-grupo";
      titulo.style.setProperty("--elemento", cat.color);
      titulo.textContent = cat.titulo;
      cont.appendChild(titulo);
      const grid = document.createElement("div");
      grid.className = "combate-drawer-grid";
      for (const { mid, cantidad } of lista) {
        const it = ITEMS[mid];
        // La calidad de alquimia se guarda en el nombre ("· calidad excepcional");
        // se separa para que el nombre no se corte y la calidad se vea como
        // una etiqueta propia en vez de texto perdido con "...".
        const nombreBase = it.name.replace(/\s*·\s*calidad\s+\S+$/i, "");
        const b = document.createElement("button");
        b.type = "button";
        b.className = "combate-drawer-item combate-objeto-item";
        b.style.setProperty("--elemento", cat.color);
        const nombre = document.createElement("strong");
        nombre.textContent = `${nombreBase} ×${cantidad}`;
        let blurb = "Consumible";
        if (it.cura) blurb = `VIDA +${dadoARango(it.cura)}`;
        else if (it.recupera_qi) blurb = `QI +${dadoARango(String(it.recupera_qi))}`;
        else if (it.cura_afliccion) blurb = "Trata aflicción";
        else if (it.remienda) blurb = "Repara meridianos";
        else if (it.purifica) blurb = "Reduce impurezas";
        const sub = document.createElement("span");
        sub.className = "combate-objeto-monto";
        sub.textContent = blurb;
        b.append(nombre, sub);
        if (it.calidad && it.calidad !== "Estable") {
          const badge = document.createElement("span");
          badge.className = `combate-objeto-calidad calidad-${it.calidad.toLowerCase()}`;
          badge.textContent = it.calidad;
          b.appendChild(badge);
        }
        b.title = `${capitalizarUI(nombreBase)}${it.calidad ? ` · calidad ${it.calidad.toLowerCase()}` : ""} · ${blurb}`;
        b.addEventListener("click", () => enviarComando(`beber ${mid}`));
        grid.appendChild(b);
      }
      cont.appendChild(grid);
    }
  }

  renderResumenPreparadasCombate() {
    const cont = this.cbResumenPreparadasEl;
    if (!cont) return;
    cont.replaceChildren();
    const activa = this.player?.build_activa ? this.buildPorId(this.player.build_activa) : null;
    const b1 = document.createElement("b");
    b1.textContent = activa ? "Build: " : "Configuración: ";
    cont.appendChild(b1);
    if (activa) {
      const estado = this.estadoBuild(activa);
      cont.appendChild(document.createTextNode(`${activa.nombre}${estado === "modificada" ? " · MODIFICADA" : ""}`));
    } else {
      cont.appendChild(document.createTextNode("manual"));
    }
  }

  // ---------- acumulador de recompensas (presentación pura) ----------

  // Instrumentación llamada desde Combate.turno() justo donde ya se concede
  // la recompensa real: sólo OBSERVA el diff de qi/inventario/piedras y el
  // registro nuevo de Bestiario. No otorga nada, no recalcula nada.
  registrarRecompensaVisual(mob, antes, botinAntesConocido, lineasRecompensa) {
    const acc = this.combateVista?.acumulador;
    if (!acc) return;
    const p = this.player;
    acc.enemigosDerrotados.push(etiquetaMob(mob));
    (acc.derrotas ||= []).push({ nombre: mob.name, errante: !!mob.errante_id });
    const qiGanado = p.qi - antes.qi;
    if (qiGanado) acc.qiGanado += qiGanado;
    const piedrasGanadas = p.piedras - antes.piedras;
    if (piedrasGanadas) acc.piedrasGanadas += piedrasGanadas;
    const cuenta = arr => arr.reduce((m, id) => (m.set(id, (m.get(id) || 0) + 1), m), new Map());
    const antesM = cuenta(antes.inv), despuesM = cuenta(p.inventario);
    for (const [id, n] of despuesM) {
      const ganado = n - (antesM.get(id) || 0);
      if (ganado > 0) acc.items.set(id, (acc.items.get(id) || 0) + ganado);
    }
    const botinAhora = Object.keys(this.atlas.criaturas[mob.mob_id]?.botin || {});
    for (const id of botinAhora) if (!botinAntesConocido.has(id)) acc.descubrimientos.push(id);
    const conocidas = [/^Absorbes el qi/, /^Botín: /, /^No encuentras botín/, /^✦ Bestiario/];
    for (const l of lineasRecompensa) {
      const limpia = l.trim();
      if (limpia && !conocidas.some(re => re.test(limpia))) acc.consecuencias.push(limpia);
    }
    const cad = this.cadaveresEnSala().find(c => c.mob_id === mob.mob_id && c.caidoEn === this.turnoGlobal && !acc.cadaveres.includes(c));
    if (cad) acc.cadaveres.push(cad);
  }

  // ---------- presentación agrupada de derrotas ----------

  // Agrupa lo derrotado por especie conservando el orden de aparición:
  // [{ nombre, n, errantes }]. Es presentación pura: no toca combate ni botín.
  agruparDerrotas(acc) {
    const grupos = new Map();
    const fuente = (acc?.derrotas?.length ? acc.derrotas : (acc?.enemigosDerrotados || []).map(t => ({
      nombre: String(t).replace(/\s*\(errante\)$/, "").replace(/\s+#\d+$/, ""),
      errante: /\(errante\)$/.test(String(t)),
    })));
    for (const d of fuente) {
      const g = grupos.get(d.nombre) || { nombre: d.nombre, n: 0, errantes: 0 };
      g.n++; if (d.errante) g.errantes++;
      grupos.set(d.nombre, g);
    }
    return [...grupos.values()];
  }

  // Marca de fila compartida por el registro y la ventana de resultado. Reutiliza los
  // símbolos que el juego ya usa en su barra: ☠ cuerpos · 氣 qi · ◆ piedras · ✦ hallazgos.
  marcaVictoria(glifo) {
    const m = document.createElement("i");
    m.className = "victoria-marca"; m.textContent = glifo; m.setAttribute("aria-hidden", "true");
    return m;
  }

  // Bloque compacto del registro tras CONTINUAR:
  // Derrotados (por especie) · Recompensas (qi, piedras) · Botín (objetos).
  mostrarResumenVictoria(acc) {
    const grupos = this.agruparDerrotas(acc);
    if (!grupos.length) return;
    const total = grupos.reduce((t, g) => t + g.n, 0);
    const bloque = document.createElement("div");
    bloque.className = "victoria-resumen";
    const titulo = document.createElement("div");
    titulo.className = "victoria-titulo";
    titulo.textContent = `Victoria · ${total} ${total === 1 ? "criatura derrotada" : "criaturas derrotadas"}`;
    bloque.appendChild(titulo);
    const fila = (lista, glifo, izq, der, nota) => {
      const f = document.createElement("div"); f.className = "victoria-fila";
      const a = document.createElement("span"); a.append(this.marcaVictoria(glifo), document.createTextNode(izq));
      if (nota) { const n = document.createElement("small"); n.textContent = nota; a.appendChild(n); }
      const b = document.createElement("span"); b.className = "victoria-cant"; b.textContent = der;
      f.append(a, b); lista.appendChild(f);
    };
    const seccion = (etiqueta, tono) => {
      const sec = document.createElement("div"); sec.className = `victoria-sec ${tono}`;
      const e = document.createElement("div"); e.className = "victoria-etq"; e.textContent = etiqueta;
      sec.appendChild(e); bloque.appendChild(sec); return sec;
    };
    const secD = seccion("Derrotados", "derrotados");
    for (const g of grupos) {
      const nota = g.errantes ? `${g.errantes} ${g.errantes === 1 ? "errante" : "errantes"}` : "";
      fila(secD, "☠", capitalizarUI(g.nombre), `×${g.n}`, nota);
    }
    if (acc.qiGanado || acc.piedrasGanadas) {
      const secR = seccion("Recompensas", "recompensas");
      if (acc.qiGanado) fila(secR, "氣", "Qi absorbido", `+${acc.qiGanado}`);
      if (acc.piedrasGanadas) fila(secR, "◆", "Piedras espirituales", `+${acc.piedrasGanadas}`);
    }
    const items = [...(acc.items || [])];
    if (items.length) {
      const secB = seccion("Botín", "botin");
      for (const [mid, n] of items) fila(secB, "✦", capitalizarUI(ITEMS[mid]?.name || mid), `×${n}`);
    }
    this.contenido.appendChild(bloque);
    this.abajo();
  }

  // ---------- resultado final ----------

  // Se llama cuando turno() ya no devuelve "continua". El motor ya está en
  // null; esta función SÓLO pinta. postAccion (resolverDuelo/triunfoZhuji/
  // resolverPractica/muerte/genérico) se ejecuta al pulsar CONTINUAR.
  mostrarResultadoCombate(estado, postAccion) {
    const vista = this.combateVista;
    if (!vista || !this.cbResultadoEl || !this.cbResultadoPanelEl) { postAccion(); return; }
    const panel = this.cbResultadoPanelEl;
    panel.replaceChildren();
    panel.className = "combate-resultado" + (estado === "derrota" ? " es-derrota" : estado === "huiste" ? " es-huida" : "");
    const acc = vista.acumulador;
    const h2 = document.createElement("h2");
    h2.textContent = estado === "victoria" ? "VICTORIA" : estado === "derrota" ? "DERROTA" : "HUIDA";
    panel.appendChild(h2);
    const sub = document.createElement("p");
    sub.className = "combate-resultado-sub";
    sub.textContent = estado === "victoria"
      ? (acc.enemigosDerrotados.length === 0 ? "El encuentro termina."
          : acc.enemigosDerrotados.length === 1 ? acc.enemigosDerrotados[0] + " vencido"
          : `${acc.enemigosDerrotados.length} criaturas vencidas`)
      : estado === "derrota" ? "Tu qi se dispersa." : "El combate queda atrás.";
    panel.appendChild(sub);
    if (estado === "victoria") {
      const crearSeccion = titulo => {
        const sec = document.createElement("div"); sec.className = "combate-resultado-sec";
        const h3 = document.createElement("h3"); h3.textContent = titulo; sec.appendChild(h3);
        panel.appendChild(sec); return sec;
      };
      const crearFila = (sec, tono, glifo, nombre, valor) => {
        const fila = document.createElement("div"); fila.className = `combate-resultado-fila ${tono}`;
        const izq = document.createElement("span"); izq.append(this.marcaVictoria(glifo), document.createTextNode(nombre));
        const der = document.createElement("span"); der.textContent = valor;
        fila.append(izq, der); sec.appendChild(fila);
      };
      if (acc.enemigosDerrotados.length > 1) {
        const secDerrotados = crearSeccion("DERROTADOS");
        for (const g of this.agruparDerrotas(acc)) {
          const extra = g.errantes ? ` (${g.errantes} ${g.errantes === 1 ? "errante" : "errantes"})` : "";
          crearFila(secDerrotados, "oro", "☠", capitalizarUI(g.nombre) + extra, `×${g.n}`);
        }
      }
      if (acc.qiGanado || acc.piedrasGanadas) {
        const secRec = crearSeccion("RECOMPENSAS");
        if (acc.qiGanado) crearFila(secRec, "oro", "氣", "Qi absorbido", `+${acc.qiGanado}`);
        if (acc.piedrasGanadas) crearFila(secRec, "oro", "◆", "Piedras espirituales", `+${acc.piedrasGanadas}`);
      }
      const secBotin = crearSeccion("BOTÍN");
      if (acc.items.size) {
        for (const [mid, cantidad] of acc.items)
          crearFila(secBotin, "jade", "✦", ITEMS[mid]?.name ? capitalizarUI(ITEMS[mid].name) : mid, `×${cantidad}`);
      } else {
        const nota = document.createElement("div"); nota.className = "combate-resultado-nota"; nota.textContent = "No encontraste botín material.";
        secBotin.appendChild(nota);
      }
      if (acc.descubrimientos.length) {
        const d = document.createElement("div");
        d.className = "combate-resultado-descubrimiento";
        d.textContent = `NUEVO DESCUBRIMIENTO — ${acc.descubrimientos.map(mid => capitalizarUI(ITEMS[mid]?.name || mid)).join(", ")} añadido al Bestiario.`;
        panel.appendChild(d);
      }
      if (acc.cadaveres.length) {
        const secRestos = document.createElement("div");
        secRestos.className = "combate-resultado-sec";
        const h3r = document.createElement("h3"); h3r.textContent = "RESTOS EN LA SALA"; secRestos.appendChild(h3r);
        for (const c of acc.cadaveres) {
          const fila = document.createElement("div"); fila.className = "combate-resultado-nota";
          fila.textContent = capitalizarUI(this.etiquetaCadaver(c));
          secRestos.appendChild(fila);
        }
        panel.appendChild(secRestos);
      }
      if (acc.consecuencias.length) {
        const secCons = document.createElement("div");
        secCons.className = "combate-resultado-sec";
        const h3c = document.createElement("h3"); h3c.textContent = "CONSECUENCIA"; secCons.appendChild(h3c);
        for (const texto of acc.consecuencias) {
          const p = document.createElement("div"); p.className = "combate-resultado-nota"; p.textContent = texto;
          secCons.appendChild(p);
        }
        panel.appendChild(secCons);
      }
    }
    const continuar = document.createElement("button");
    continuar.type = "button";
    continuar.className = "combate-resultado-continuar";
    continuar.textContent = "CONTINUAR";
    continuar.addEventListener("click", () => this.cerrarResultadoCombate(estado, postAccion));
    panel.appendChild(continuar);
    this.cbResultadoEl.hidden = false;
    setTimeout(() => continuar.focus(), 0);
  }

  // CONTINUAR: no concede nada, no consume turno, no recalcula drops.
  // Sólo cierra la ventana, restaura la interfaz normal y entonces dispara
  // la consecuencia narrativa real (idéntica a la que ya existía).
  cerrarResultadoCombate(estado, postAccion) {
    const acc = this.combateVista?.acumulador;
    const hayResumen = estado === "victoria" && !!acc?.enemigosDerrotados.length;
    this.cerrarInterfazCombate();
    if (hayResumen) this.mostrarResumenVictoria(acc);
    postAccion();
    this.actualizarBarra();
  }

  textoModMeridiano(mod, tid = null) {
  const partes = [];
    if (mod.daño) {
      const notacion = String(mod.daño).trim();
      const signo = notacion.startsWith("-") ? "−" : "+";
      partes.push(`Daño adicional ${signo}${dadoARango(notacion.replace(/^[+-]/, ""))}`);
    }
    if (mod.coste) partes.push(mod.coste < 0 ? `Reduce el coste en ${Math.abs(mod.coste)} qi` : `Aumenta el coste en ${mod.coste} qi`);
    if (mod.ataque) partes.push(`Precisión +${porcentajePrecision(mod.ataque)}%`);
    if (mod.critMin) partes.push(`Probabilidad de crítico ${probabilidadCritico(mod.critMin)}%`);
    if (mod.critMult) partes.push(`Daño crítico ${multiplicadorUI(mod.critMult)}`);
    if (mod.control) partes.push(`Precisión de control +${porcentajePrecision(mod.control)}%`);
    if (mod.quemadura) partes.push(`Al impactar: quemadura de ${dadoARango(mod.quemadura.daño)} por ronda durante ${mod.quemadura.turnos} ronda${mod.quemadura.turnos === 1 ? "" : "s"}`);
    if (mod.debil) partes.push(`Reduce el ataque enemigo en ${Math.abs(mod.debil.ataque)} durante ${mod.debil.turnos} ronda${mod.debil.turnos === 1 ? "" : "s"}`);
    if (mod.guardia) partes.push(`Absorbe hasta ${mod.guardia} de daño por golpe`);
    if (mod.esquiva) partes.push(`Esquiva +${mod.esquiva}% mientras dure la técnica`);
    if (mod.defensa) partes.push(`Defensa +${mod.defensa} mientras dure la técnica`);
    // En las burbujas de absorción la "duración" no son rondas: amplía la reserva total
    // en tantos golpes de protección como se sumen (reserva = golpe × duración).
    const esBarrera = TECNICAS[tid]?.tipo === "guardia";
    const etiquetaDur = esBarrera ? "Reserva" : "Duración";
    const unidadDur = n => esBarrera ? `golpe${n === 1 ? "" : "s"} de absorción` : `ronda${n === 1 ? "" : "s"}`;
    if (mod.duracion) {
      const delta = mod.duracion - (TECNICAS[tid]?.duracion || 2);
      if (delta > 0) partes.push(`${etiquetaDur} +${delta} ${unidadDur(delta)}`);
      if (delta < 0) partes.push(`${etiquetaDur} −${Math.abs(delta)} ${unidadDur(Math.abs(delta))}`);
    }
    if (mod.duracionExtra) partes.push(`${etiquetaDur} +${mod.duracionExtra} ${unidadDur(mod.duracionExtra)}`);
    if (mod.atadura || mod.ataduraGolpe) partes.push(`Impide actuar durante ${mod.atadura || mod.ataduraGolpe} ronda(s)`);
    if (mod.dañoAtar) partes.push(`Al atar: ${dadoARango(mod.dañoAtar)} de daño`);
    return partes.join(" · ") || "Sin mejora adicional en este tramo.";
  }

  resumenPotenciadoresMeridianos(tid, actual, base) {
    const t = TECNICAS[tid], partes = [];
    if (t.tipo === "ofensiva" && actual.daño !== base.daño) partes.push(`daño final ${dadoARango(actual.daño)}`);
    if (actual.quemadura && JSON.stringify(actual.quemadura) !== JSON.stringify(base.quemadura))
      partes.push(`quemadura de ${dadoARango(actual.quemadura.daño)} por ronda durante ${actual.quemadura.turnos} rondas`);
    if (actual.debil && JSON.stringify(actual.debil) !== JSON.stringify(base.debil))
      partes.push(`ataque enemigo reducido en ${Math.abs(actual.debil.ataque)} durante ${actual.debil.turnos} rondas`);
    if (actual.ataduraGolpe !== base.ataduraGolpe) partes.push(`atadura al impactar durante ${actual.ataduraGolpe} ronda${actual.ataduraGolpe === 1 ? "" : "s"}`);
    if (actual.dañoAtar !== base.dañoAtar && actual.dañoAtar) partes.push(`corte de ${dadoARango(actual.dañoAtar)} al atar`);
    if (actual.ataqueBono !== base.ataqueBono) partes.push(`Precisión +${porcentajePrecision(actual.ataqueBono)}%`);
    if (actual.critMin !== base.critMin) partes.push(`probabilidad de crítico ${probabilidadCritico(actual.critMin)}%`);
    if (actual.critMult !== base.critMult) partes.push(`daño crítico ${multiplicadorUI(actual.critMult)}`);
    if (actual.controlBono !== base.controlBono) partes.push(`Precisión de control +${porcentajePrecision(actual.controlBono - base.controlBono)}%`);
    if (t.tipo === "guardia" && actual.guardia !== base.guardia) partes.push(`protección final ${actual.guardia} por golpe`);
    if (t.tipo === "guardia" && actual.capacidad !== base.capacidad) partes.push(`reserva final de ${actual.capacidad} de daño`);
    if (t.tipo === "fortificacion" && actual.defensa !== base.defensa) partes.push(`Defensa final +${actual.defensa}`);
    if (t.tipo === "esquiva" && actual.esquiva !== base.esquiva) partes.push(`Esquiva final +${actual.esquiva}%`);
    if (t.tipo === "control" && actual.atadura !== base.atadura) partes.push(`atadura final de ${actual.atadura} rondas`);
    if (t.tipo !== "guardia" && actual.duracion !== base.duracion) partes.push(`duración final ${actual.duracion} rondas`);
    if (actual.coste !== base.coste) partes.push(actual.coste < base.coste ? `coste reducido a ${actual.coste} qi` : `coste aumentado a ${actual.coste} qi`);
    if (!partes.length) return "";
    return `+ ${partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`}.`;
  }

  explicacionTecnica(tid, c) {
    const t = TECNICAS[tid];
    if (!t || !c) return "No hay información suficiente para explicar esta técnica.";
    if (t.tipo === "ofensiva") {
      const objetivo = c.area
        ? "intenta impactar por separado a todos los enemigos presentes"
        : "intenta impactar al enemigo que hayas seleccionado";
      const area = c.area
        ? " Si sólo hay un enemigo, el daño final se reduce al 65%; por eso es una técnica pensada para grupos."
        : "";
      const secundarios = [];
      if (c.quemadura) secundarios.push(`un impacto también aplica una quemadura de ${dadoARango(c.quemadura.daño)} durante ${c.quemadura.turnos} rondas`);
      if (c.debil) secundarios.push(`un impacto reduce el ataque del afectado en ${Math.abs(c.debil.ataque)} durante ${c.debil.turnos} rondas`);
      if (c.ataduraGolpe) secundarios.push(`un impacto impide responder durante ${c.ataduraGolpe} ronda${c.ataduraGolpe === 1 ? "" : "s"}`);
      const extra = secundarios.length ? ` Además, ${secundarios.join(" y ")}.` : "";
      return `Gastas ${c.coste} qi y la técnica ${objetivo}. Cada acierto causa ${dadoARango(c.daño)} de daño, con un promedio de ${promedioDado(c.daño)}. Tiene ${probabilidadCritico(c.critMin)}% de golpe crítico y esos golpes causan ${multiplicadorUI(c.critMult)} de daño. Su bonificación de Precisión es +${porcentajePrecision(c.ataqueBono)}%.${extra}${area}`;
    }
    if (t.tipo === "guardia") {
      return `Gastas ${c.coste} qi y te envuelves en una burbuja que absorbe hasta ${c.guardia} de daño por golpe, con una reserva total de ${c.capacidad} de daño. No se gasta con el paso de las rondas: sólo con el daño que absorbe (los ataques que fallan no la desgastan) y se disipa cuando la reserva llega a 0. Si un golpe supera esa protección, recibes solamente lo que reste. Activarla no causa daño.`;
    }
    if (t.tipo === "fortificacion") {
      return `Gastas ${c.coste} qi y obtienes +${c.defensa} de Defensa durante ${c.duracion} rondas. La fortificación dificulta que los ataques conecten, pero no absorbe el daño de aquellos que logren superarla.`;
    }
    if (t.tipo === "esquiva") {
      return `Gastas ${c.coste} qi y obtienes +${c.esquiva}% de Esquiva durante ${c.duracion} rondas. Esto aumenta directamente la posibilidad de evitar por completo cada ataque, pero no reduce el daño de los golpes que consigan alcanzarte.`;
    }
    if (t.tipo === "control") {
      const corte = c.dañoAtar ? ` Esta forma también corta al cerrar el lazo y causa ${dadoARango(c.dañoAtar)} de daño.` : " La forma actual no causa daño.";
      const acciones = c.atadura === 1 ? "pierde su próxima acción" : `pierde sus próximas ${c.atadura} acciones`;
      return `Gastas ${c.coste} qi e intentas atar al enemigo seleccionado: si supera la prueba de control, ${acciones}. La técnica tiene una bonificación de Precisión de control de +${porcentajePrecision(c.controlBono)}%; al usarla entra en enfriamiento según la duración. Un jefe sólo puede perder una acción y después obtiene Tenacidad durante 2 rondas: mientras dure, resiste por completo todo control.${corte}`;
    }
    return `Gastas ${c.coste} qi para ejecutar esta técnica.`;
  }

  resumenMeridiano(tid, c) {
    const t = TECNICAS[tid], partes = [`${c.coste} qi`];
    if (t.tipo === "ofensiva") {
      partes.push(`${dadoARango(c.daño)} de daño (promedio ${promedioDado(c.daño)})`, `Precisión +${porcentajePrecision(c.ataqueBono)}%`, `Crítico ${probabilidadCritico(c.critMin)}%`, `Daño crítico ${multiplicadorUI(c.critMult)}`);
      if (c.area) partes.push("AOE: todos los hostiles; 65% de daño contra uno solo");
    }
    if (t.tipo === "guardia") partes.push(`Absorbe ${c.guardia} por golpe`, `Reserva ${c.capacidad} de daño`);
    if (t.tipo === "fortificacion") partes.push(`Defensa +${c.defensa} durante ${c.duracion} rondas`);
    if (t.tipo === "esquiva") partes.push(`Esquiva +${c.esquiva}% durante ${c.duracion} rondas`);
    if (t.tipo === "control") partes.push(`Atadura ${c.atadura} ronda(s)`, `Precisión de control +${porcentajePrecision(c.controlBono)}%`, `Enfriamiento ${c.atadura} ronda(s)`, "Jefes: máximo 1 acción y Tenacidad 2");
    if (c.quemadura) partes.push(`Quemadura ${dadoARango(c.quemadura.daño)} × ${c.quemadura.turnos} rondas`);
    if (c.debil) partes.push(`Ataque enemigo ${c.debil.ataque} × ${c.debil.turnos} rondas`);
    if (c.ataduraGolpe) partes.push(`Atadura al impactar ${c.ataduraGolpe}`);
    if (c.dañoAtar) partes.push(`Corte al atar ${dadoARango(c.dañoAtar)}`);
    return partes.join(" · ");
  }

  afinidadTecnica(tid) {
    const t = TECNICAS[tid], p = this.player;
    if (t.elementos) {
      const raices = new Set([p.raiz, p.raiz_secundaria].filter(Boolean));
      const coincidencias = t.elementos.filter(e => raices.has(e)).length;
      return coincidencias >= 2 ? "confluencia" : coincidencias === 1 ? "parcial" : "híbrida ajena";
    }
    if (t.elemento === p.raiz) return "principal";
    if (t.elemento === p.raiz_secundaria) return "secundaria";
    return "ajena";
  }

  ritmoTecnica(tid) {
    const afin = this.afinidadTecnica(tid);
    if (afin === "ajena") return 0.75;
    if (afin === "secundaria") return 0.9;
    if (afin === "parcial") return 0.8;
    if (afin === "híbrida ajena") return 0.65;
    return 1;
  }

  progresoTecnica(tid) {
    const rec = this.player.tecnicas[tid] || {};
    return Math.round(((rec.practica ?? rec.usos ?? 0) + Math.floor(this.player.comprension / 2)) * 100) / 100;
  }

  riesgoTecnica(tid) {
    const t = TECNICAS[tid], p = this.player;
    if (t.elementos) {
      if (this.afinidadTecnica(tid) !== "híbrida ajena") return 0;
      const maestria = p.tecnicas[tid]?.maestria || 0;
      return Math.max(5, 18 - maestria * 3 - Math.min(4, Math.floor(p.comprension / 3)));
    }
    if (t.rango === "mortal" || this.afinidadTecnica(tid) !== "ajena") return 0;
    if (!ELEMENTOS_INCOMPATIBLES.some(par => par.includes(p.raiz) && par.includes(t.elemento))) return 0;
    const maestria = p.tecnicas[tid]?.maestria || 0;
    return Math.max(2, 12 - maestria * 3 - Math.min(3, Math.floor(p.comprension / 4)));
  }

  perfilTecnica(tid) {
    const t = TECNICAS[tid], c = this.statsTecnica(tid);
    const elemento = (t.elementos || [t.elemento]).join(" + ");
    const afinidad = this.afinidadTecnica(tid);
    const circulacion = c.riesgo ? `circulación inestable ${c.riesgo}%` : afinidad === "parcial" ? "confluencia parcial segura" : "circulación segura";
    return `${elemento} · ${afinidad} · aprendizaje ${Math.round(this.ritmoTecnica(tid) * 100)}% · ${circulacion}`;
  }

  dominaElemento(elemento) {
    return Object.entries(this.player.tecnicas).some(([tid, rec]) =>
      TECNICAS[tid] && !TECNICAS[tid].elementos && TECNICAS[tid].elemento === elemento && rec.maestria >= 2);
  }

  desbloquearHibridas(out) {
    if (!reinoAlMenos(this.player, "ZhuJi")) return;
    for (const [tid, t] of Object.entries(TECNICAS)) {
      if (!t.elementos || this.player.tecnicas[tid] || !t.elementos.every(e => this.dominaElemento(e))) continue;
      this.player.tecnicas[tid] = { maestria: 0, usos: 0, practica: 0, ramas: { 1: 0, 2: 0, 3: 0 } };
      const estado = this.riesgoTecnica(tid) ? "La Definitiva nace inestable para tus raíces" : "La Definitiva encuentra un cauce seguro";
      out.push(`   ✦ Comprendes cómo unir ${t.elementos.join(" y ")}: ${t.name}. ${estado}; TECNICA ${tid}.`);
    }
  }

  resolverTecnica(args) {
    if (!args || !args.length) return null;
    const frase = args.join(" ");
    for (const tid of Object.keys(this.player.tecnicas)) {
      if (tid.includes(args[0])) return tid;
      const t = TECNICAS[tid];
      if (!t) continue;
      const name = quitaAcentos(t.name.toLowerCase());
      if (name.includes(frase) || name.split(" ").includes(args[0])) return tid;
    }
    return null;
  }

  statsTecnica(tid, ramasPrevistas = null) {
    const t = TECNICAS[tid], p = this.player;
    const rec = p.tecnicas[tid];
    const nivel = (rec && typeof rec.maestria === "number") ? rec.maestria : 0;
    const conf = {
      tid, nivel,
      coste: t.coste,
      daño: t.daño || null,
      ataqueBono: 0,
      controlBono: 2 + nivel,
      critMin: 20,
      critMult: t.critMult || MULTIPLICADOR_CRITICO,
      defensa: t.defensa || 3,
      esquiva: t.esquiva || 15,
      guardia: t.guardia || 3,
      atadura: t.atadura || 1,
      duracion: t.duracion || 2,
      area: !!t.area,
      enfriamiento: t.enfriamiento || 0,
      quemadura: null, debil: null, ataduraGolpe: 0, dañoAtar: null,
    };
    const sumarEfecto = (actual, nuevo) => {
      if (!actual) return { ...nuevo };
      return {
        daño: actual.daño && nuevo.daño ? `${actual.daño}+${nuevo.daño}` : actual.daño || nuevo.daño,
        // El daño por ronda sí se acumula; la duración es una ventana compartida
        // y toma la mayor, para que dos mejoras no creen una duración accidentalmente enorme.
        turnos: Math.max(1, actual.turnos || 0, nuevo.turnos || 0),
        ataque: (actual.ataque || 0) + (nuevo.ataque || 0),
      };
    };
    // Balance global: cada tramo suma modificaciones a la forma base. Los campos
    // "duracion" de las ramas son valores de referencia y se convierten en delta;
    // así una mejora no reemplaza las anteriores. El coste conserva un suelo abajo.
    const duracionBase = t.duracion || 2;
    for (let n = 1; n <= nivel; n++) {
      const ramas = ramasPrevistas || rec?.ramas || {};
      const opcion = ramas[n] || 0;
      const eleccion = this.opcionMeridiano(tid, n, opcion);
      if (!eleccion || this.bloqueoRama(tid, n)) continue;
      const m = eleccion.mod || {};
      if (m.coste) conf.coste += m.coste;
      if (m.daño) conf.daño = (conf.daño || "") + m.daño;
      if (m.ataque) conf.ataqueBono += m.ataque;
      if (m.critMin) conf.critMin = Math.min(conf.critMin, m.critMin);
      if (m.critMult) conf.critMult += m.critMult - MULTIPLICADOR_CRITICO;
      if (m.control) conf.controlBono += m.control;
      if (m.quemadura) conf.quemadura = sumarEfecto(conf.quemadura, m.quemadura);
      if (m.debil) conf.debil = sumarEfecto(conf.debil, m.debil);
      if (m.duracion) conf.duracion += m.duracion - duracionBase;
      if (m.duracionExtra) conf.duracion += m.duracionExtra;
      if (m.esquiva) conf.esquiva += m.esquiva - (t.esquiva || 15);
      if (m.defensa) conf.defensa += m.defensa - (t.defensa || 3);
      if (m.guardia) conf.guardia += m.guardia - (t.guardia || 3);
      if (m.atadura) conf.atadura += m.atadura - (t.atadura || 1);
      if (m.ataduraGolpe) conf.ataduraGolpe += m.ataduraGolpe;
      if (m.dañoAtar) conf.dañoAtar = conf.dañoAtar ? `${conf.dañoAtar}+${m.dañoAtar}` : m.dañoAtar;
    }
    // Suelos y techos de seguridad: las ramas pueden apilarse, pero nunca
    // producen una técnica rota por duración cero, control infinito o crítico desmedido.
    conf.duracion = Math.max(1, conf.duracion);
    // Absorción: la reserva total de la burbuja es golpe × duración de la técnica.
    if (t.tipo === "guardia") conf.capacidad = capacidadGuardia(conf.guardia, conf.duracion);
    conf.atadura = Math.max(1, Math.min(3, conf.atadura));
    conf.critMin = Math.max(CRIT_MIN_TOPE, conf.critMin);
    conf.critMult = Math.min(2.5, Math.max(1, conf.critMult));
    conf.coste = Math.max(1, conf.coste);
    const afin = this.afinidadTecnica(tid);
    conf.afinidad = afin === "principal" || afin === "secundaria";
    conf.riesgo = this.riesgoTecnica(tid);
    if (conf.afinidad) {
      conf.coste = Math.max(1, conf.coste - 1);
      if (t.tipo === "ofensiva" && conf.daño) conf.daño += "+1";
    }
    // Ninguna combinación de ramas puede trivializar el qi: incluso una forma
    // especializada conserva al menos el 70% del coste original del arte.
    conf.coste = Math.max(Math.ceil(t.coste * 0.7), conf.coste);
    return conf;
  }

  registrarUso(tid, out, calidad = 1, objetivo = null) {
    const p = this.player, rec = p.tecnicas[tid];
    if (!rec) return;
    let factorEncuentro = 1;
    if (objetivo?.unico) factorEncuentro = 1.25;
    else if (objetivo && (this.flags[`kills_${objetivo.mob_id}`] || 0) >= 3 && objetivo.max_hp < p.max_hp * 0.6) factorEncuentro = 0.25;
    const incremento = Math.round(this.ritmoTecnica(tid) * Math.max(0, Math.min(1, calidad)) * factorEncuentro * 100) / 100;
    rec.practica = Math.round(((rec.practica ?? rec.usos ?? 0) + incremento) * 100) / 100;
    rec.usos = (rec.usos || 0) + 1;
    const cap = reinoAlMenos(p, "ZhuJi") ? 3 : 2;
    const efectivos = this.progresoTecnica(tid);
    const umbrales = umbralesTecnica(tid);
    if (rec.maestria < cap && efectivos >= umbrales[rec.maestria]) {
      rec.maestria++;
      out.push(`   ✦ Entre golpes, algo se asienta: ${TECNICAS[tid].name} alcanza maestría ${MAESTRIA_NOMBRES[rec.maestria].toUpperCase()}.`);
      out.push("   TÉCNICAS muestra las formas disponibles y sus requisitos de cultivo.");
    } else if (rec.maestria < cap) {
      const nota = factorEncuentro < 1 ? " · rival demasiado débil" : calidad < 1 ? " · ejecución sin efecto pleno" : objetivo?.unico ? " · comprensión contra un rival excepcional" : "";
      out.push(`   ◇ Práctica efectiva +${incremento}: ${efectivos}/${umbrales[rec.maestria]}${nota}.`);
    }
    this.desbloquearHibridas(out);
  }

  tecnicaResumen(tid) {
    const t = TECNICAS[tid];
    if (!t) return "";
    const c = this.statsTecnica(tid);
    if (t.tipo === "ofensiva") return `${dadoARango(c.daño)} de daño${c.area ? " a todos los enemigos trabados (65% contra uno solo)" : ""}`;
    if (t.tipo === "esquiva") return `+${c.esquiva}% de Esquiva durante ${c.duracion} turnos`;
    if (t.tipo === "fortificacion") return `+${c.defensa} de Defensa durante ${c.duracion} turnos`;
    if (t.tipo === "guardia") return `absorbe ${c.guardia} de daño por golpe, hasta agotar una reserva de ${c.capacidad}`;
    if (t.tipo === "control") return `roba ${c.atadura} turno(s) al enemigo`;
    return "";
  }

  // ---------- utilidades ----------

  puedeIntentar() {
    return this.player.inventario.includes("pildora_fundacion") || this.player.comprension >= UMBRAL_COMPRENSION_FUNDACION;
  }

  claveInicioMision(qid, contador) { return `inicio_mision_${qid}_${contador}`; }

  avanceMision(qid, contador) {
    return Math.max(0, (this.flags[contador] || 0) - (this.flags[this.claveInicioMision(qid, contador)] || 0));
  }

  activarMision(qid, estado = "activa") {
    const q = QUESTS[qid], anterior = this.quests[qid];
    if (!q || anterior === "hecha" || anterior === "fallida") return false;
    if (estado === "rumor") {
      if (anterior) return false;
      this.quests[qid] = "rumor";
    } else {
      if (anterior === "activa") return false;
      for (const contador of q.contadores || []) this.flags[this.claveInicioMision(qid, contador)] = this.flags[contador] || 0;
      this.quests[qid] = "activa";
    }
    this.misionesNuevas.add(qid);
    this.actualizarBotonMisiones();
    this.autoguardar();
    return true;
  }

  completarMision(qid) {
    const q = QUESTS[qid];
    if (!q || this.quests[qid] !== "activa" || !q.listo(this)) return [];
    if (q.entregar) q.entregar(this);
    this.quests[qid] = "hecha";
    const recompensa = q.recompensa ? q.recompensa(this) : [];
    this.misionesNuevas.add(qid);
    this.actualizarBotonMisiones();

    this.autoguardar();
    const frase = this.valorMision(q, "frase", null);
    return [...(frase ? [frase] : []), `[Misión completada: ${q.nombre}]`, ...recompensa];
  }

  gestionarMisionesNpc(npc) {
    const a=this.flags.arc1;if(!a)return '';
    const h=a.hitos, pos=this.pos;
    if(npc==='tao_ming'&&pos==='registro'){
      if(this.quests.P==='activa'){
        this.registrarHitoArc1('REGISTRO_INICIAL_COMPLETADO');
        return 'Tao Ming anota tu admisión. Tu nombre podrá inscribirse en la Sala del Jade.';
      }
      if(this.quests.P==='hecha'&&this.quests.M01!=='hecha'){
        this.quests.M01='activa';this.reconciliarProgresionArc1();
        return 'Tao Ming te envía a inscribir tu nombre en la Sala del Jade.';
      }
    }
    if(npc==='madre_wen'&&pos==='patio_cabanas'&&this.quests.M01==='activa'&&h.NOMBRE_INSCRITO){
      this.registrarHitoArc1('M01_ALOJAMIENTO_ASIGNADO');
      return 'Madre Wen te asigna una cama en el dormitorio de externos. Ve a conocerla.';
    }
    if(npc==='tao_ming'&&pos==='oficina_servicios'){
      if(this.quests.M01==='hecha'&&!this.quests.M02){
        this.quests.M02='activa';this.anclarArc1('tao_ming','M02','oficina_servicios','SERVICIO_DESPENSA_VALIDADO');
        if(this.player.profesiones.examen.desbloqueada)this.registrarHitoArc1('EXAMEN_ESPIRITUAL_APRENDIDO');
        else this.anclarArc1('chen_bo','M02','sala_anatomica','EXAMEN_ESPIRITUAL_APRENDIDO');
        return 'Hay una rata de qi en el depósito. Examina su cadáver tras consultar a Chen Bo.';
      }
      if(this.quests.M02==='activa'){
        if(!h.M02_RATA_RESUELTA)return 'Revisa el depósito común y resuelve el problema de la rata.';
        if(!h.EXAMEN_ESPIRITUAL_APRENDIDO)return 'Consulta a Chen Bo antes de estudiar el cadáver.';
        if(!h.M02_CADAVER_OBSERVADO)return 'Vuelve al depósito y observa el cuerpo sin extraerlo.';
        this.registrarHitoArc1('SERVICIO_DESPENSA_VALIDADO');
        return 'Tao Ming valida el servicio y anota una contribución a tu favor.';
      }
    }
    if(npc==='chen_bo'&&pos==='sala_anatomica'&&this.quests.M02==='activa'&&h.M02_RATA_RESUELTA){
      this.desbloquearProfesion('examen');this.registrarHitoArc1('EXAMEN_ESPIRITUAL_APRENDIDO');
      this.liberarArc1('chen_bo','M02');
      return 'Chen Bo te enseña a observar el cuerpo con Examen Espiritual.';
    }
    // M03 instruction is owned by the experimental foundation domain, installed before A07.
    if(npc==='qiao_ren'&&pos==='pabellon_disciplina'){
      if(this.quests.M03==='activa'){
        if(!h.M03_PRACTICA_MUNECO_COMPLETADA||!h.EVALUACION_CIRCULACION_SUPERADA)return 'Completa la práctica y medita en el patio de respiración.';
        this.registrarHitoArc1('M03_PROMOCION_FORMALIZADA');
        return 'Qiao Ren formaliza tu ingreso como discípulo externo.';
      }
      if(this.quests.M06==='hecha'&&this.quests.M07!=='hecha'&&nivelArc1(a.evidenciaTerritorial.tipos)!=='INSUFICIENTE'){
        this.quests.M07='activa';this.anclarArc1('jiang_rui','M07','pabellon_disciplina','INFORME_ACEPTADO');
        this.preguntarEleccionMultiple({contexto:['Presenta tu informe de frontera.'],pregunta:'¿Cómo lo formulas?',
          opciones:[{valor:'1',insignia:'1)',texto:'Con cautela'},{valor:'2',insignia:'2)',texto:'Con firmeza'}],
          marcador:'(1/2)',hint:'1 o 2',callback:r=>this.formularInformeArc1(r.trim()==='2'?'FUERTE':'CAUTA')});
        return 'Qiao Ren escucha el informe con Jiang Rui presente.';
      }
    }
    if(npc==='jiang_rui'&&pos==='puesto_valle'){
      if(a.estado==='LII_TERRITORIO'&&!this.quests.M04){
        this.quests.M04='activa';this.registrarHitoArc1('M04_ASIGNADA');
        this.anclarArc1('jiang_rui','M04','puesto_valle','M04_RETORNO_INFORMADO');
        this.anclarArc1('gao_shun','M04','puerta','M04_CONTROL_PUERTA');
        return 'Jiang Rui te asigna una patrulla: pasa el control de la Puerta Roja y llega al refugio del bosque.';
      }
      if(this.quests.M04==='activa'&&h.M04_REFUGIO_ALCANZADO){
        this.registrarHitoArc1('M04_RETORNO_INFORMADO');
        return 'Jiang Rui registra tu regreso y valida la primera patrulla.';
      }
    }
    if(npc==='gao_shun'&&pos==='puerta'&&this.quests.M04==='activa'&&h.M04_ASIGNADA){
      this.registrarHitoArc1('M04_CONTROL_PUERTA');
      return 'Gao Shun comprueba la orden y te deja pasar por el control.';
    }
    if(npc==='duan_shibo'&&pos==='oficina_logistica'&&this.quests.M04==='hecha'&&!this.quests.M05){
      this.quests.M05='activa';return 'Duan Shibo te pide revisar el circuito del valle y hablar con Xu An en Sauces.';
    }
    if(npc==='duan_shibo'&&pos==='oficina_logistica'&&this.quests.M05==='hecha'&&
       this.reemitirPildoraArc1())return 'Duan Shibo repone por única vez la píldora de consolidación extraviada.';
    if(npc==='xu_an'&&['sauces_casa_comunal','sauces_plaza'].includes(pos)&&this.quests.M05==='activa'){
      this.registrarHitoArc1('M05_XU_AN_CONTACTADO');
      return 'Xu An confirma las novedades del circuito. Examina los registros en la casa comunal.';
    }
    return '';
  }

  arc1Listo(id){
    const h=this.flags.arc1?.hitos||{};
    return ({P:h.REGISTRO_INICIAL_COMPLETADO,M01:h.ALOJAMIENTO_CONFIRMADO,
      M02:h.SERVICIO_DESPENSA_VALIDADO,M03:h.M03_PROMOCION_FORMALIZADA,
      M04:h.M04_RETORNO_INFORMADO,M05:h.M05_VALLE_LOGISTICA_REVISADA&&h.M05_XU_AN_CONTACTADO&&h.M05_CIRCUITO_REGISTRADO&&h.M05_HOSPEDAJE_VISITADO,
      M06:this.flags.arc1?.evidenciaTerritorial.nivel!=='INSUFICIENTE',M07:h.INFORME_ACEPTADO})[id]===true;
  }
  progresoArc1(id){
    const h=this.flags.arc1?.hitos||{};
    if(this.quests[id]==='hecha')return 'Completada.';
    const pistas={
      P:'Recoge el equipo en el descansillo y habla con Tao Ming en registro.',
      M01:!h.NOMBRE_INSCRITO?'Examina el muro de la Sala del Jade.':
        !h.M01_ALOJAMIENTO_ASIGNADO?'Habla con Madre Wen en el patio de cabañas.':'Entra al dormitorio de externos.',
      M02:!h.M02_RATA_RESUELTA?'Resuelve la rata del depósito común.':
        !h.EXAMEN_ESPIRITUAL_APRENDIDO?'Aprende Examen con Chen Bo en la sala anatómica.':
        !h.M02_CADAVER_OBSERVADO?'Examina el cadáver en el depósito.':'Habla con Tao Ming en la oficina de servicios.',
      M03:!h.M03_FUNDAMENTOS_INSTRUIDOS?'Habla con Shen Baojun en la sala de formas.':
        !h.M03_PRACTICA_MUNECO_COMPLETADA?'Examina el muñeco del patio marcial y completa la práctica guiada.':
        !h.EVALUACION_CIRCULACION_SUPERADA?'Medita en el patio de respiración.':'Habla con Qiao Ren en el pabellón.',
      M04:!h.M04_CONTROL_PUERTA?'Habla con Gao Shun en la Puerta Roja.':
        !h.M04_REFUGIO_ALCANZADO?'Llega físicamente al refugio de patrulla.':'Informa a Jiang Rui en el puesto del valle.',
      M05:!h.M05_VALLE_LOGISTICA_REVISADA?'Visita el mercado o granero del valle.':
        !h.M05_XU_AN_CONTACTADO?'Habla con Xu An en Sauces.':
        !h.M05_CIRCUITO_REGISTRADO?'Examina los registros de la casa comunal.':'Visita la casa de huéspedes de Sauces.',
      M06:`Tipos de evidencia: ${this.flags.arc1.evidenciaTerritorial.tipos.length}/3 requeridos. Examina huellas, vegetación, corriente o registros de patrulla.`,
      M07:'Presenta una formulación cauta o firme a Qiao Ren en el pabellón.',
    };
    return pistas[id]||'Consulta los lugares y personas del encargo.';
  }
  registrarHitoArc1(id){
    const a=this.flags.arc1;if(!a||a.hitos[id])return false;
    a.hitos[id]=true;this.reconciliarProgresionArc1();return true;
  }
  anclarArc1(id,owner,room,hasta){
    const a=this.flags.arc1;if(!a||!this.posicionNPC[id]||!ROOMS[room])return false;
    const previo=a.anclajePropietario[id];if(previo&&previo!==owner&&this.quests[previo]==='activa')return false;
    this.posicionNPC[id]={sala:room,anclaje:{room,hasta}};a.anclajePropietario[id]=owner;return true;
  }
  liberarArc1(id,owner,destino=null){
    const a=this.flags.arc1;if(a?.anclajePropietario[id]!==owner)return false;
    if(destino&&!ROOMS[destino])return false;
    delete a.anclajePropietario[id];this.posicionNPC[id]={sala:destino||this.posicionNPC[id].sala,anclaje:null};return true;
  }
  cerrarArc1(id){
    if(this.quests[id]!=='activa'||!this.arc1Listo(id))return false;
    this.quests[id]='hecha';const a=this.flags.arc1,h=a.hitos;
    const [saldo,merito,comprension]=ARC1_RECOMPENSAS[id];
    if(saldo)this.otorgarContribucion(saldo,id);if(merito)this.otorgarMerito(merito,id);
    if(comprension)this.player.comprension+=comprension;
    if(id==='P'){a.estado='LI_INTEGRACION';a.estadoAfiliacion='ADMITIDO';this.quests.M01='activa';
      this.anclarArc1('tao_ming','M01','registro','NOMBRE_INSCRITO');}
    if(id==='M01'){a.rangoInstitucional='ASPIRANTE';this.flags.SECTA_EXTERIOR_BASE=true;
      this.liberarArc1('madre_wen','M01');this.liberarArc1('tao_ming','M01','oficina_servicios');
      this.visitadas.add('dormitorio_externos');}
    if(id==='M02'){a.primerServicioFormal=true;this.quests.M03='activa';
      this.liberarArc1('tao_ming','M02');this.liberarArc1('chen_bo','M02');
      this.anclarArc1('shen_baojun','M03','sala_formas','M03_FUNDAMENTOS_INSTRUIDOS');}
    if(id==='M03'){a.rangoInstitucional='DISCIPULO_EXTERNO';a.estadoAfiliacion='MIEMBRO';
      if(this.player.facciones.grulla_blanca.estado!=='expulsado')this.player.facciones.grulla_blanca.estado='miembro';
      this.liberarArc1('qiao_ren','M03');}
    if(id==='M04'){this.flags.PATRULLA_TERRITORIAL=true;this.visitadas.add('bosque_refugio_patrulla');
      this.liberarArc1('jiang_rui','M04');this.liberarArc1('gao_shun','M04','casa_guardia');}
    if(id==='M05'){a.reconocimientoSauces='HUESPED';this.visitadas.add('sauces_casa_huespedes');
      if(!h.PILDORA_CONSOLIDACION_OTORGADA){h.PILDORA_CONSOLIDACION_OTORGADA=true;this.player.inventario.push('pildora_consolidacion');}}
    if(id==='M06')a.revelaciones.R1='PARCIAL';
    if(id==='M07'){a.informeFronteraAceptado=true;a.revelaciones.R1='CONFIRMADO';
      for(const n of ['jiang_rui','qiao_ren'])this.elevarConocimientoArc1(n,'CONFIRMADO');
      for(const n of ['he_zhen','ren_bo','su_lian'])this.elevarConocimientoArc1(n,'SABE');
      this.liberarArc1('jiang_rui','M07','puesto_valle');}
    this.reconciliarProgresionArc1();return true;
  }
  elevarConocimientoArc1(id,nivel){
    const orden=['DESCONOCIDO','SOSPECHA','SABE','CONFIRMADO'];const viejo=this.conocimientoNPC[id]?.R1;
    if(viejo&&orden.indexOf(nivel)>orden.indexOf(viejo))this.conocimientoNPC[id].R1=nivel;
  }
  registrarEvidenciaArc1(room,scenery){
    const a=this.flags.arc1,tipo=ARC1_FUENTES[room+':'+scenery];
    if(!a||!tipo||!this.flags.PATRULLA_TERRITORIAL||this.quests.M07==='hecha')return false;
    if(a.evidenciaTerritorial.tipos.includes(tipo))return false;
    a.evidenciaTerritorial.tipos.push(tipo);
    a.evidenciaTerritorial.nivel=nivelArc1(a.evidenciaTerritorial.tipos);
    a.evidenciaTerritorial.sospechaFuerte=a.evidenciaTerritorial.tipos.length>=2;
    this.reconciliarProgresionArc1();return true;
  }
  examinarEscenaArc1(room,clave){
    const h=this.flags.arc1?.hitos;if(!h)return;
    if(room==='sala_jade'&&['muro','nombres'].includes(clave)&&this.quests.M01==='activa')
      {this.registrarHitoArc1('NOMBRE_INSCRITO');
       this.liberarArc1('tao_ming','M01','oficina_servicios');
       this.anclarArc1('madre_wen','M01','patio_cabanas','ALOJAMIENTO_CONFIRMADO');}
    if(this.quests.M04==='activa'&&
       ['bosque_puesto_marcas:tablillas','bosque_refugio_patrulla:registro'].includes(room+':'+clave)&&
       !h.M04_INCIDENTE_REGISTRADO){
      h.M04_INCIDENTE_REGISTRADO=true;
      this.otorgarMerito(1,'M04 incidente de patrulla');
    }
    if(this.quests.M05==='activa'&&room==='sauces_casa_comunal'&&clave==='registros'&&h.M05_XU_AN_CONTACTADO)
      this.registrarHitoArc1('M05_CIRCUITO_REGISTRADO');
    this.registrarEvidenciaArc1(room,clave);
  }
  formularInformeArc1(formulacion){
    const a=this.flags.arc1;if(this.quests.M07!=='activa'||!['CAUTA','FUERTE'].includes(formulacion)||
      a.evidenciaTerritorial.nivel==='INSUFICIENTE')return false;
    a.informe.corregida=formulacion==='FUERTE'&&a.evidenciaTerritorial.nivel==='SUFICIENTE';
    a.informe.formulacionFinal=a.informe.corregida?'CAUTA':formulacion;
    this.registrarHitoArc1('INFORME_ACEPTADO');
    this.salida(a.informe.corregida?'Qiao Ren ajusta la formulación con cautela. El informe es aceptado.':'El informe de frontera es aceptado.');
    return true;
  }
  pildoraProtegidaArc1(){const a=this.flags.arc1;return !!a?.hitos.PILDORA_CONSOLIDACION_OTORGADA&&this.player.etapa<3&&!a.transicionLIILIIIHecha;}
  reemitirPildoraArc1(){const a=this.flags.arc1;if(!this.pildoraProtegidaArc1()||a.hitos.PILDORA_REEMITIDA||
    this.player.inventario.includes('pildora_consolidacion'))return false;
    a.hitos.PILDORA_REEMITIDA=true;this.player.inventario.push('pildora_consolidacion');return true;
  }

  // La progresión se deriva de datos persistidos. Sólo cerrar una misión activa
  // concede su recompensa; una carga legacy nunca vuelve a cobrar P–M03.
  reconciliarProgresionArc1(){
    const a=this.flags.arc1;if(!a||!this.player)return false;
    a.evidenciaTerritorial.nivel=nivelArc1(a.evidenciaTerritorial.tipos);
    a.evidenciaTerritorial.sospechaFuerte=a.evidenciaTerritorial.tipos.length>=2;
    for(const id of ARC1_IDS)if(this.quests[id]==='activa'&&this.arc1Listo(id))this.cerrarArc1(id);
    if(this.quests.M04==='hecha'&&this.quests.M05==='hecha'&&
       a.evidenciaTerritorial.tipos.length>=1&&!this.quests.M06)this.quests.M06='activa';
    if(this.quests.M06==='activa'&&this.arc1Listo('M06'))this.cerrarArc1('M06');
    const li=this.player.etapa>=2&&this.quests.M03==='hecha'&&a.rangoInstitucional==='DISCIPULO_EXTERNO'&&
      a.primerServicioFormal&&a.evaluacionCirculacion==='SUPERADA';
    if(li&&!a.transicionLILIIHecha){
      a.transicionLILIIHecha=true;
      if(!a.cultivoLIIIPreexistente)this.salida('La promoción y tu cultivo abren el servicio territorial.','destacado');
    }
    const liii=li&&this.player.etapa>=3&&this.quests.M07==='hecha'&&this.quests.M04==='hecha'&&
      this.quests.M05==='hecha'&&a.informeFronteraAceptado&&
      a.evidenciaTerritorial.nivel!=='INSUFICIENTE';
    if(liii&&!a.transicionLIILIIIHecha){
      a.transicionLIILIIIHecha=true;
      this.salida('La frontera ha sido informada. Comienza la investigación interior.','destacado');
    }
    a.estado=a.transicionLIILIIIHecha?'LIII_INVESTIGACION':
      a.transicionLILIIHecha?'LII_TERRITORIO':this.quests.P==='hecha'?'LI_INTEGRACION':'PROLOGO';
    if(a.transicionLIILIIIHecha){
      this.gates.SECTA_INTERIOR=true;this.gates.M12=false;
      for(const k of Object.keys(this.gates))if(k.startsWith('ATAJO_ALA_'))this.gates[k]=false;
    }
    return true;
  }

  normalizarArc1(){
    const legado=!Object.hasOwn(this.flags,'arc1');
    if(!legado&&!validarArc1(this.flags.arc1))throw new Error('arc1 inválido');
    if(legado){
      const a=this.flags.arc1=crearArc1();
      const prevInterior=this.gates.SECTA_INTERIOR===true;
      a.legacySectaInteriorPrevia=prevInterior;
      this.gates.SECTA_INTERIOR=false;this.gates.M12=false;
      for(const k of Object.keys(this.gates))if(k.startsWith('ATAJO_ALA_'))this.gates[k]=false;
      this.quests={P:'hecha',M01:'hecha',M02:'hecha',M03:'hecha'};
      for(const k of ['raizDiagnosticada','equipoInicialEntregado','REGISTRO_INICIAL_COMPLETADO',
        'NOMBRE_INSCRITO','ALOJAMIENTO_CONFIRMADO','SERVICIO_DESPENSA_VALIDADO',
        'EXAMEN_ESPIRITUAL_APRENDIDO',
        'M03_PRACTICA_MUNECO_COMPLETADA','EVALUACION_CIRCULACION_SUPERADA',
        'M03_PROMOCION_FORMALIZADA'])a.hitos[k]=true;
      a.estadoAfiliacion='MIEMBRO';a.rangoInstitucional='DISCIPULO_EXTERNO';
      a.primerServicioFormal=true;a.evaluacionCirculacion='SUPERADA';
      a.transicionLILIIHecha=this.player.etapa>=2;
      a.cultivoLIIIPreexistente=this.player.etapa>=3;
      this.visitadas.add('dormitorio_externos');
      this.player.profesiones.examen.desbloqueada=true;
      this.flags.SECTA_EXTERIOR_BASE=true;
    }
    const a=this.flags.arc1;
    const limpias={};
    for(const id of ARC1_IDS){
      const valor=this.quests[id];
      if(['activa','hecha'].includes(valor))limpias[id]=valor;
      if(id!=='P'&&Number(id.slice(1))<=7&&limpias[id]==='hecha'&&limpias[ARC1_IDS[ARC1_IDS.indexOf(id)-1]]!=='hecha')delete limpias[id];
    }
    this.quests=limpias;
    a.evidenciaTerritorial.nivel=nivelArc1(a.evidenciaTerritorial.tipos);
    a.evidenciaTerritorial.sospechaFuerte=a.evidenciaTerritorial.tipos.length>=2;
    a.informeFronteraAceptado=this.quests.M07==='hecha';
    if(this.quests.M03!=='hecha'&&a.rangoInstitucional==='DISCIPULO_EXTERNO')a.rangoInstitucional='ASPIRANTE';
    if(this.quests.M01!=='hecha'&&a.rangoInstitucional==='ASPIRANTE')a.rangoInstitucional='SIN_RANGO';
    if(this.quests.M03!=='hecha'&&a.estadoAfiliacion==='MIEMBRO')a.estadoAfiliacion='ADMITIDO';
    if(this.quests.P!=='hecha')a.estadoAfiliacion='PENDIENTE_REGISTRO';
    for(const [id,owner] of Object.entries(a.anclajePropietario)){
      const pos=this.posicionNPC[id],anchor=pos?.anclaje;
      if(!anchor||anchor.room!==pos.sala){delete a.anclajePropietario[id];continue;}
      const cumplido=a.hitos[anchor.hasta]===true;
      if(owner==='P'&&this.quests.P==='hecha'&&this.quests.M01==='activa'&&id==='tao_ming'){
        delete a.anclajePropietario[id];pos.anclaje=null;
        this.anclarArc1(id,'M01','registro','NOMBRE_INSCRITO');continue;
      }
      if(this.quests[owner]!=='activa'||(cumplido&&!(owner==='M04'&&id==='gao_shun'&&this.pos==='puerta'))){
        const destino=id==='tao_ming'&&owner==='M01'?'oficina_servicios':
          id==='gao_shun'&&owner==='M04'?'casa_guardia':
          id==='jiang_rui'&&owner==='M07'?'puesto_valle':null;
        this.liberarArc1(id,owner,destino);
      }
    }
    const liSoportado=this.player.etapa>=2&&this.quests.M03==='hecha'&&
      a.rangoInstitucional==='DISCIPULO_EXTERNO'&&a.primerServicioFormal&&a.evaluacionCirculacion==='SUPERADA';
    if(!liSoportado)a.transicionLILIIHecha=false;
    if(!liSoportado||this.player.etapa<3||this.quests.M07!=='hecha'||
       this.quests.M04!=='hecha'||this.quests.M05!=='hecha'||
       a.evidenciaTerritorial.nivel==='INSUFICIENTE')a.transicionLIILIIIHecha=false;
    this.reconciliarProgresionArc1();
    return legado;
  }



  marcarProgresoMisiones() {
    for (const [qid, estado] of Object.entries(this.quests)) {
      if (estado === "activa" && QUESTS[qid]?.listo(this)) this.misionesNuevas.add(qid);
    }
    this.actualizarBotonMisiones();
  }

  valorMision(q, campo, defecto = "—") {
    const valor = q && q[campo];
    if (typeof valor === "function") return valor(this);
    return valor ?? defecto;
  }

  consecuenciaMision(qid, q) {
return "";
  }

  normalizarFacciones() {
    if (!this.player) return;
    const p = this.player;
    p.facciones ||= {};
    let registro = p.facciones[FACCION_PRINCIPAL];
    if (!registro) {
      registro = p.facciones[FACCION_PRINCIPAL] = {
        estado: "inactivo", saldo: 0, merito: 0,
        reputacion: 0, gastos: 0, historial: [],
      };
    } else {
      registro.estado ||= "inactivo";
      registro.saldo = Math.max(0, Number(registro.saldo) || 0);
      registro.merito = Math.max(0, Number(registro.merito) || 0);
      registro.reputacion = Number(registro.reputacion) || 0;
      registro.gastos = Math.max(0, Number(registro.gastos) || 0);
      registro.historial = Array.isArray(registro.historial) ? registro.historial.slice(-30) : [];
    }
    p.facciones_version = 1;
    p.faccion_principal ||= FACCION_PRINCIPAL;
    p.contribucion = registro.saldo; // reflejo del saldo actual para los consumidores del personaje
  }

  afiliarFaccion(id, estado = "miembro", principal = false) {
    if (!this.player || !FACCIONES[id]) return { ok: false, texto: "La organización no existe en este mundo." };
    this.player.facciones ||= {};
    const registro = this.player.facciones[id] ||= {
      estado, saldo: 0, merito: 0, reputacion: 0, gastos: 0, historial: [],
    };
    registro.estado = estado;
    if (principal) this.player.faccion_principal = id;
    return { ok: true, registro };
  }

  cambiarEstadoFaccion(id, estado) {
    const permitidos = ["miembro", "huesped", "aliado", "inactivo", "expulsado"];
    const registro = this.player?.facciones?.[id];
    if (!registro || !permitidos.includes(estado)) return false;
    registro.estado = estado;
    return true;
  }

  ajustarReputacionFaccion(id, cantidad) {
    const registro = this.player?.facciones?.[id];
    if (!registro) return null;
    registro.reputacion = (Number(registro.reputacion) || 0) + (Number(cantidad) || 0);
    return registro.reputacion;
  }

  registroFaccion(id = FACCION_PRINCIPAL) {
    this.normalizarFacciones();
    return this.player?.facciones?.[id] || null;
  }

  rangoFaccion(id = FACCION_PRINCIPAL) {
    const faccion = FACCIONES[id], registro = this.registroFaccion(id);
    if (!faccion || !registro) return null;
    let rango = faccion.rangos[0];
    for (const candidato of faccion.rangos) if (registro.merito >= candidato.merito) rango = candidato;
    return rango;
  }

  otorgarContribucion(cantidad, motivo = "Servicio reconocido", id = FACCION_PRINCIPAL) {
    const registro = this.registroFaccion(id);
    if (!registro || registro.estado === "expulsado") return null;
    const valor = Math.max(0, Number(cantidad) || 0);
    if (!valor) return null;
    const rangoAntes = this.rangoFaccion(id)?.id;
    registro.saldo += valor;
    registro.historial.push({ tipo: "contribucion", cantidad: valor, motivo, turno: this.turnoGlobal });
    registro.historial = registro.historial.slice(-30);
    this.player.contribucion = this.registroFaccion(FACCION_PRINCIPAL)?.saldo || 0;
    const rangoDespues = this.rangoFaccion(id);
    return { saldo: registro.saldo, merito: registro.merito,
      rangoNuevo: rangoDespues?.id !== rangoAntes ? rangoDespues?.nombre : null };
  }

  otorgarMerito(cantidad, motivo="Mérito reconocido", id=FACCION_PRINCIPAL){
    const registro=this.registroFaccion(id);
    if(!registro||registro.estado==='expulsado')return null;
    const valor=Math.max(0,Number(cantidad)||0);if(!valor)return null;
    const anterior=this.rangoFaccion(id)?.id;
    registro.merito+=valor;
    registro.historial.push({tipo:'merito',cantidad:valor,motivo,turno:this.turnoGlobal});
    registro.historial=registro.historial.slice(-30);
    const rango=this.rangoFaccion(id);
    return {saldo:registro.saldo,merito:registro.merito,
      rangoNuevo:rango?.id!==anterior?rango?.nombre:null};
  }

  gastarContribucion(cantidad, motivo, id = FACCION_PRINCIPAL) {
    const registro = this.registroFaccion(id);
    const valor = Math.max(0, Number(cantidad) || 0);
    if (!registro || registro.estado !== "miembro") return { ok: false, texto: "No tienes acceso activo a los servicios de esa facción." };
    if (registro.saldo < valor) return { ok: false, texto: `Necesitas ${valor} de contribución disponible; tienes ${registro.saldo}.` };
    registro.saldo -= valor;
    registro.gastos += valor;
    registro.historial.push({ tipo: "gasto", cantidad: valor, motivo, turno: this.turnoGlobal });
    registro.historial = registro.historial.slice(-30);
    this.player.contribucion = this.registroFaccion(FACCION_PRINCIPAL)?.saldo || 0;
    return { ok: true, saldo: registro.saldo, merito: registro.merito };
  }

  normalizarProfesiones() {
    if (!this.player) return;
    const p = this.player;
    p.profesiones ||= {};

    // CONSERVAR_NORMALIZACION_ACTUAL: completar registros sin importar otros oficios.
    const baseExamen = p.profesiones.examen || {};
    p.profesiones.examen = Object.assign({
      xp: 0, rango: 0, materiales: {}, total: 0, cadaveres: 0,
      hallazgos: {}, descubrimientos: {}, procedimientos: {}, desbloqueada: false,
    }, baseExamen);
    p.profesiones.examen.materiales ||= {};
    p.profesiones.examen.hallazgos ||= {};
    p.profesiones.examen.descubrimientos ||= {};
    p.profesiones.examen.procedimientos ||= {};
    // Validar familiaridad actual; un booleano no acredita observaciones.
    for (const [mobId, previo] of Object.entries(p.profesiones.examen.descubrimientos)) {
      if (!previo || typeof previo !== "object" || Array.isArray(previo)) {
        delete p.profesiones.examen.descubrimientos[mobId];
      } else {
        previo.observaciones = Math.max(0, Math.floor(Number(previo.observaciones) || 0));
        previo.exitos = Math.max(0, Math.floor(Number(previo.exitos) || 0));
        previo.procedimientos ||= {};
      }
    }

    p.profesiones.herboristeria = Object.assign({
      xp: 0, rango: 0, materiales: {}, total: 0, especies: {}, procedimientos: {}, nodos: {}, desbloqueada: false,
    }, p.profesiones.herboristeria || {});
    p.profesiones.herboristeria.materiales ||= {};
    p.profesiones.herboristeria.especies ||= {};
    p.profesiones.herboristeria.procedimientos ||= {};
    p.profesiones.herboristeria.nodos ||= {};
    // CONSERVAR_NORMALIZACION_ACTUAL: validar nodos y sus contadores ecológicos.
    for (const [nodoId, estado] of Object.entries(p.profesiones.herboristeria.nodos)) {
      if (!NODOS_HERBORISTERIA[nodoId]) { delete p.profesiones.herboristeria.nodos[nodoId]; continue; }
      estado.partes ||= {};
      estado.observaciones = Math.max(0, Math.floor(Number(estado.observaciones) || 0));
      estado.exitos = Math.max(0, Math.floor(Number(estado.exitos) || 0));
      estado.cambios = Math.max(0, Math.floor(Number(estado.cambios) || 0));
      estado.cambioObservado = Number.isFinite(Number(estado.cambioObservado)) ? Math.max(-1, Math.floor(Number(estado.cambioObservado))) : -1;
      estado.muertaHasta = Math.max(0, Number(estado.muertaHasta) || 0);
    }

    p.profesiones.alquimia = Object.assign({
      xp: 0, rango: 0,
      elaboraciones: 0, calidades: {}, recetas: {}, desbloqueada: false,
    }, p.profesiones.alquimia || {});
    p.profesiones.alquimia.calidades ||= {};
    p.profesiones.alquimia.recetas ||= {};
    for (const rid of Object.keys(RECETAS)) {
      const r = p.profesiones.alquimia.recetas[rid] ||= {};
      r.conocida = !!r.conocida;
      r.validas = Math.max(0, Math.floor(Number(r.validas) || 0));
      r.mejor = CALIDADES_ALQUIMIA[r.mejor] ? r.mejor : null;
      r.hitos ||= {};
      r.dominios ||= {};
      const dominioBasePrevio = r.dominios.base && typeof r.dominios.base === "object" ? r.dominios.base : {};
      r.dominios.base = {
        excepcional: !!(dominioBasePrevio.excepcional || r.hitos.excepcional || r.mejor === "excepcional"),
        metodo: Array.isArray(dominioBasePrevio.metodo) && dominioBasePrevio.metodo.length === 3
          ? dominioBasePrevio.metodo.map(Number)
          : ((r.hitos.excepcional || r.mejor === "excepcional") ? [...RECETAS[rid].patron] : null),
      };
      r.pulsos = Array.from({length:3}, (_,i) => {
        const q = Array.isArray(r.pulsos) ? (r.pulsos[i] || {}) : {};
        q.confirmado = [1,2,3].includes(Number(q.confirmado)) ? Number(q.confirmado) : null;
        q.aciertos ||= {1:0,2:0,3:0};
        q.descartados = [...new Set((q.descartados || []).map(Number).filter(v => [1,2,3].includes(v)))];
        return q;
      });
      if (r.dominios.base.excepcional && Array.isArray(r.dominios.base.metodo))
        r.dominios.base.metodo.forEach((v,i) => { if (r.pulsos[i]) r.pulsos[i].confirmado = v; });
    }
    if (p.profesiones.alquimia.desbloqueada) p.profesiones.alquimia.recetas.sangre.conocida = true;

    for (const id of ["forja", "inscripcion"])
      p.profesiones[id] = Object.assign({ xp: 0, rango: 0, desbloqueada: false }, p.profesiones[id] || {});

    for (const oficio of Object.values(p.profesiones)) {
      oficio.xp = Math.max(0, Number(oficio.xp) || 0);
      oficio.rango = Math.max(0, Math.min(RANGOS_OFICIO.length - 1, Math.floor(Number(oficio.rango) || 0)));
    }
    p.profesiones_version = 6;
  }

  profesionDesbloqueada(id) {
    this.normalizarProfesiones();
    return !!this.player?.profesiones?.[id]?.desbloqueada;
  }

  desbloquearProfesion(id) {
    this.normalizarProfesiones();
    if (!PROFESIONES[id]?.activa || !this.player?.profesiones?.[id]) return "Ese oficio todavía no puede aprenderse en este arco.";
    if (this.player.profesiones[id].desbloqueada) return "";
    this.player.profesiones[id].desbloqueada = true;
    if (id === "alquimia") {
      this.normalizarProfesiones();
      this.player.profesiones.alquimia.recetas.sangre.conocida = true;
    }
    this.autoguardar();
    return `✦ Oficio aprendido: ${PROFESIONES[id].nombre}.`;
  }

  rangoProfesion(id) {
    this.normalizarProfesiones();
    const oficio = this.player?.profesiones?.[id];
    const xp = oficio?.xp || 0;
    const nivel = Math.max(0, Math.min(RANGOS_OFICIO.length - 1, oficio?.rango || 0));
    let nivelPorXP = 0;
    for (let i = 1; i < UMBRALES_OFICIO.length; i++) if (xp >= UMBRALES_OFICIO[i]) nivelPorXP = i;
    const siguienteNivel = nivel + 1 < RANGOS_OFICIO.length ? nivel + 1 : null;
    const siguiente = siguienteNivel === null ? null : UMBRALES_OFICIO[siguienteNivel];
    const maxArco = PROFESIONES[id]?.rangoMaximoArco1 ?? (RANGOS_OFICIO.length - 1);
    return {
      nivel, nombre: RANGOS_OFICIO[nivel], xp, nivelPorXP,
      siguiente, apto: siguiente !== null && xp >= siguiente && nivel < maxArco,
      bloqueadoPorArco: siguiente !== null && xp >= siguiente && nivel >= maxArco,
    };
  }

  sumarExperienciaProfesion(id, cantidad) {
    this.normalizarProfesiones();
    const antes = this.rangoProfesion(id);
    const oficio = this.player?.profesiones?.[id];
    if (!oficio) return "";
    oficio.xp += Math.max(0, Number(cantidad) || 0);
    const despues = this.rangoProfesion(id);
    if (!antes.apto && despues.apto)
      return `${PROFESIONES[id].nombre}: experiencia suficiente para solicitar reconocimiento como ${RANGOS_OFICIO[despues.nivel + 1].toUpperCase()}.`;
    return "";
  }

  promoverProfesion(id) {
    this.normalizarProfesiones();
    if (!this.player?.profesiones?.[id] || !PROFESIONES[id]) return "Ese oficio no está registrado.";
    const estado = this.rangoProfesion(id);
    // rangoProfesion() normaliza y puede reconstruir el registro; toma SIEMPRE
    // la referencia vigente después de consultarlo. Esta regla evita escribir
    // sobre referencias sustituidas por una normalización.
    const oficio = this.player.profesiones[id];
    const maxArco = PROFESIONES[id].rangoMaximoArco1 ?? (RANGOS_OFICIO.length - 1);
    if (estado.nivel >= maxArco) return `${PROFESIONES[id].nombre}: el rango superior requiere contenido de un arco posterior.`;
    if (!estado.apto) {
      const faltan = estado.siguiente === null ? 0 : Math.max(0, estado.siguiente - estado.xp);
      return `${PROFESIONES[id].nombre}: aún faltan ${formatearXP(faltan)} XP para el próximo reconocimiento.`;
    }
    oficio.rango += 1;
    this.autoguardar();
    return `✦ ${PROFESIONES[id].nombre}: reconocido como ${RANGOS_OFICIO[oficio.rango].toUpperCase()}.`;
  }

  probabilidadExamen(hallazgo, nivelRango = null) {
    const dificultad = hallazgo?.dificultad || "normal";
    const base = EXITO_BASE_EXAMEN[dificultad] ?? 0;
    const nivel = nivelRango === null ? this.rangoProfesion("examen").nivel : Math.max(0, Number(nivelRango) || 0);
    return Math.min(.90, base + (BONO_RANGO_EXAMEN[nivel] ?? BONO_RANGO_EXAMEN[BONO_RANGO_EXAMEN.length - 1] ?? 0));
  }

  registroEspecieExamen(mobId, crear = true) {
    this.normalizarProfesiones();
    const oficio = this.player?.profesiones?.examen;
    if (!oficio) return null;
    let reg = oficio.descubrimientos[mobId];
    if (!reg && crear) reg = oficio.descubrimientos[mobId] = { observaciones: 0, exitos: 0, procedimientos: {} };
    if (reg === true) reg = oficio.descubrimientos[mobId] = { observaciones: 1, exitos: 0, procedimientos: {} };
    if (!reg || typeof reg !== "object") return null;
    reg.observaciones = Math.max(0, Math.floor(Number(reg.observaciones) || 0));
    reg.exitos = Math.max(0, Math.floor(Number(reg.exitos) || 0));
    reg.procedimientos ||= {};
    return reg;
  }

  familiaridadExamen(mobId) {
    const reg = this.registroEspecieExamen(mobId, false);
    if (!reg) return { nivel: 0, nombre: "Desconocida", observaciones: 0, exitos: 0, completos: 0, total: HALLAZGOS_CADAVER[mobId]?.hallazgos?.length || 0 };
    const tabla = HALLAZGOS_CADAVER[mobId];
    const ids = tabla?.hallazgos?.map(h => h.id) || [];
    const completos = ids.filter(id => (reg.procedimientos[id] || 0) > 0).length;
    let nivel = 1, nombre = "Observada";
    if (reg.observaciones >= 2 || reg.exitos >= 2) { nivel = 2; nombre = "Estudiada"; }
    if (reg.observaciones >= 6 && ids.length && completos === ids.length) { nivel = 3; nombre = "Comprendida"; }
    return { nivel, nombre, observaciones: reg.observaciones, exitos: reg.exitos, completos, total: ids.length };
  }

  registrarMaterialExamen(itemId, cantidad = 1) {
    if (!this.player || ITEMS[itemId]?.tipo !== "material") return;
    this.normalizarProfesiones();
    const oficio = this.player.profesiones.examen;
    const n = Math.max(1, Math.floor(Number(cantidad) || 1));
    oficio.materiales[itemId] = (oficio.materiales[itemId] || 0) + n;
    oficio.hallazgos[itemId] = (oficio.hallazgos[itemId] || 0) + n;
    oficio.total = (oficio.total || 0) + n;
  }

  procedimientoUsadoEnCadaver(cuerpo, hallazgo) {
    cuerpo.examenProcedimientos ||= {};
    if (cuerpo.examenProcedimientos[hallazgo.id]) return cuerpo.examenProcedimientos[hallazgo.id];
    return null;
  }

  cuerpoExamenAgotado(cuerpo) {
    const tabla = HALLAZGOS_CADAVER[cuerpo.mob_id];
    if (!tabla) return false;
    return tabla.hallazgos.every(h => !!this.procedimientoUsadoEnCadaver(cuerpo, h));
  }

  observarCadaver(indice = 0) {
    const cuerpos = this.cadaveresEnSala();
    const cuerpo = cuerpos[Number(indice) || 0];
    if (!cuerpo) return { ok:false, texto:"No hay un cadáver fresco con ese número en esta sala." };
    if(cuerpo.arc1_tutorial){
      if(!this.flags.arc1.hitos.EXAMEN_ESPIRITUAL_APRENDIDO)
        return {ok:false,texto:'Consulta primero a Chen Bo.'};
      this.registrarHitoArc1('M02_CADAVER_OBSERVADO');
      return {ok:true,cuerpo,nuevo:true,tabla:null};
    }
    if (!this.profesionDesbloqueada("examen")) return { ok:false, texto:"Enseñanza de Examen pendiente de implementación canónica 3C." };
    const tabla = HALLAZGOS_CADAVER[cuerpo.mob_id];
    if (!tabla) return { ok:false, texto:"Este cuerpo no presenta una estructura que tu Extracción Espiritual pueda aprovechar." };
    cuerpo.investigado ||= [];
    cuerpo.examenProcedimientos ||= {};
    const yaObservado = cuerpo.investigado.includes("observado");
    if (!yaObservado) {
      cuerpo.investigado.push("observado");
      const especie = this.registroEspecieExamen(cuerpo.mob_id, true);
      especie.observaciones += 1;
      this.autoguardar();
    }
    return { ok:true, cuerpo, tabla, nuevo:!yaObservado };
  }

  recolectarCadaver(indice = 0, metodo = "") {
    const cuerpos = this.cadaveresEnSala();
    const cuerpo = cuerpos[Number(indice) || 0];
    if (!cuerpo) return "No hay un cadáver fresco con ese número en esta sala.";
    if(cuerpo.arc1_tutorial)return 'Este cadáver de servicio sólo se observa; no se extrae.';
    if (!this.profesionDesbloqueada("examen")) return "Enseñanza de Examen pendiente de implementación canónica 3C.";
    const tabla = HALLAZGOS_CADAVER[cuerpo.mob_id];
    if (!tabla) return "Este cuerpo no presenta una estructura que tu Extracción Espiritual pueda aprovechar.";
    cuerpo.investigado ||= [];
    cuerpo.examenProcedimientos ||= {};
    const accion = String(metodo || "").toLowerCase().replace(/_/g, " ").trim();
    const oficio = this.player.profesiones.examen;

    // EXTRAER sólo acepta procedimientos anatómicos reales del cadáver.
    // Observar el cuerpo es automático y gratuito al abrir la interfaz.
    const hallazgo = tabla.hallazgos.find(h => accion === h.id || accion === h.id.replace(/_/g, " ") || accion.includes(h.metodo) || h.metodo.includes(accion));
    if (!hallazgo) return "No reconoces un procedimiento compatible con esa estructura. Abre EXTRAER y elige una de las estructuras disponibles.";
    this.observarCadaver(indice);
    if (this.procedimientoUsadoEnCadaver(cuerpo, hallazgo)) return "Ese procedimiento ya fue intentado en este cadáver; la estructura no admite una segunda intervención.";

    this.turnoGlobal += 1;
    this.registrarActividadReposo(1);
    this.avanzarEcologia(1);
    const afliccionesAccion = this.avanzarAflicciones(1);
    oficio.cadaveres = (oficio.cadaveres || 0) + 1;

    const prob = this.probabilidadExamen(hallazgo);
    const exito = Azar.random() <= prob;
    if (exito) cuerpo.desapareceEn += 1; // compensa el turno de EXTRAER sólo al acertar.
    cuerpo.examenProcedimientos[hallazgo.id] = exito ? "exito" : "fallo";
    cuerpo.investigado.push(hallazgo.metodo);
    if (!exito) {
      const atraido = this.atraerHostilVecino("SANGRE");
      this.autoguardar();
      this.actualizarBarra(); this.actualizarPanel();
      return `La intervención falla y arruina ${hallazgo.metodo}. No obtienes material: 0 XP. Esa estructura ya no puede intentarse en este cadáver.${atraido ? " La sangre atrae a " + atraido.name + "." : ""}${afliccionesAccion.length ? "\n" + afliccionesAccion.join("\n") : ""}`;
    }

    const especie = this.registroEspecieExamen(cuerpo.mob_id, true);
    const clave = `${cuerpo.mob_id}:${hallazgo.id}`;
    const exitosPrevios = Math.max(0, Number(oficio.procedimientos[clave]) || 0);
    const numeroExito = exitosPrevios + 1;
    const xpPractica = xpPracticaPorDificultad("examen", hallazgo.dificultad, numeroExito);
    const bonoEspecie = especie.exitos === 0 ? BONO_PRIMERA_ESPECIE_EXAMEN : 0;
    const bonoProcedimiento = exitosPrevios === 0 ? BONO_PRIMER_PROCEDIMIENTO_EXAMEN : 0;
    const xpTotal = xpPractica + bonoEspecie + bonoProcedimiento;

    oficio.procedimientos[clave] = numeroExito;
    especie.exitos += 1;
    especie.procedimientos[hallazgo.id] = (especie.procedimientos[hallazgo.id] || 0) + 1;
    for (let i = 0; i < hallazgo.cantidad; i++) this.player.inventario.push(hallazgo.item);
    this.registrarMaterialExamen(hallazgo.item, hallazgo.cantidad);
    const avisoRango = this.sumarExperienciaProfesion("examen", xpTotal);
    const fam = this.familiaridadExamen(cuerpo.mob_id);

    this.autoguardar();
    this.actualizarBarra(); this.actualizarPanel();
    const bonos = [bonoEspecie ? `+${bonoEspecie} especie nueva` : "", bonoProcedimiento ? `+${bonoProcedimiento} procedimiento nuevo` : ""].filter(Boolean);
    const detalleXP = `+${formatearXP(xpTotal)} XP${bonos.length ? ` (${formatearXP(xpPractica)} práctica · ${bonos.join(" · ")})` : ` (${formatearXP(xpPractica)} práctica)`}`;
    return `Extracción espiritual: obtienes ${hallazgo.cantidad} ${ITEMS[hallazgo.item].name} mediante ${hallazgo.metodo}. ${detalleXP}. Familiaridad: ${fam.nombre}.${avisoRango ? " " + avisoRango : ""}${afliccionesAccion.length ? "\n" + afliccionesAccion.join("\n") : ""}`;
  }

  probabilidadHerboristeria(procedimiento, nivelRango = null) {
    const dificultad = procedimiento?.dificultad || "normal";
    const base = EXITO_BASE_HERBORISTERIA[dificultad] ?? 0;
    const nivel = nivelRango === null ? this.rangoProfesion("herboristeria").nivel : Math.max(0, Number(nivelRango) || 0);
    return Math.min(.90, base + (BONO_RANGO_HERBORISTERIA[nivel] ?? BONO_RANGO_HERBORISTERIA[BONO_RANGO_HERBORISTERIA.length - 1] ?? 0));
  }

  estadoNodoHerboristeria(nodoId, crear = true) {
    this.normalizarProfesiones();
    const oficio = this.player?.profesiones?.herboristeria;
    if (!oficio || !NODOS_HERBORISTERIA[nodoId]) return null;
    let st = oficio.nodos[nodoId];
    if (!st && crear) st = oficio.nodos[nodoId] = { partes:{}, observaciones:0, exitos:0, cambios:0, cambioObservado:-1, muertaHasta:0 };
    if (!st) return null;
    st.partes ||= {};
    st.observaciones = Math.max(0, Math.floor(Number(st.observaciones) || 0));
    st.exitos = Math.max(0, Math.floor(Number(st.exitos) || 0));
    st.cambios = Math.max(0, Math.floor(Number(st.cambios) || 0));
    st.cambioObservado = Number.isFinite(Number(st.cambioObservado)) ? Math.max(-1, Math.floor(Number(st.cambioObservado))) : -1;
    st.muertaHasta = Math.max(0, Number(st.muertaHasta) || 0);
    return st;
  }

  plantasEnSala(rid = this.pos) {
    return Object.entries(NODOS_HERBORISTERIA)
      .filter(([, nodo]) => !!ROOMS[nodo.sala] && !nodo.pendiente && nodo.sala === rid)
      .map(([id, nodo]) => ({ id, ...nodo, planta: PLANTAS_ESPIRITUALES[nodo.especie] }))
      .filter(reg => !!reg.planta);
  }

  registroEspecieHerboristeria(especieId, crear = true) {
    this.normalizarProfesiones();
    const oficio = this.player?.profesiones?.herboristeria;
    if (!oficio || !PLANTAS_ESPIRITUALES[especieId]) return null;
    let reg = oficio.especies[especieId];
    if (!reg && crear) reg = oficio.especies[especieId] = { observaciones:0, exitos:0, procedimientos:{} };
    if (!reg || typeof reg !== "object") return null;
    reg.observaciones = Math.max(0, Math.floor(Number(reg.observaciones) || 0));
    reg.exitos = Math.max(0, Math.floor(Number(reg.exitos) || 0));
    reg.procedimientos ||= {};
    return reg;
  }

  familiaridadHerboristeria(especieId) {
    const reg = this.registroEspecieHerboristeria(especieId, false);
    const planta = PLANTAS_ESPIRITUALES[especieId];
    const principales = planta?.procedimientos?.filter(p => p.principal).map(p => p.id) || [];
    if (!reg) return { nivel:0, nombre:"Desconocida", observaciones:0, exitos:0, completos:0, total:principales.length };
    const completos = principales.filter(id => (reg.procedimientos[id] || 0) > 0).length;
    let nivel = 1, nombre = "Observada";
    if (reg.observaciones >= 2 || reg.exitos >= 2) { nivel = 2; nombre = "Estudiada"; }
    if (reg.observaciones >= 6 && principales.length && completos === principales.length) { nivel = 3; nombre = "Comprendida"; }
    return { nivel, nombre, observaciones:reg.observaciones, exitos:reg.exitos, completos, total:principales.length };
  }

  registrarMaterialHerboristeria(itemId, cantidad = 1) {
    if (!this.player || ITEMS[itemId]?.tipo !== "material") return;
    this.normalizarProfesiones();
    const oficio = this.player.profesiones.herboristeria;
    const n = Math.max(1, Math.floor(Number(cantidad) || 1));
    oficio.materiales[itemId] = (oficio.materiales[itemId] || 0) + n;
    oficio.total = (oficio.total || 0) + n;
  }

  nodoHerboristeriaAgotado(nodo) {
    const fam = this.familiaridadHerboristeria(nodo.especie);
    if (fam.observaciones <= 0) return false; // nunca ocultar antes del primer EXAMINAR
    return nodo.planta.procedimientos.every(p => !this.estadoPartePlanta(nodo.id, p).disponible);
  }

  estadoPartePlanta(nodoId, procedimiento) {
    const st = this.estadoNodoHerboristeria(nodoId, true);
    if (!st) return { disponible:false, espera:0, planta:false };
    const ahora = this.turnoGlobal;
    if (st.muertaHasta > ahora) return { disponible:false, espera:Math.ceil(st.muertaHasta - ahora), planta:false };
    const hasta = Math.max(0, Number(st.partes[procedimiento.id]) || 0);
    return { disponible:hasta <= ahora, espera:Math.max(0, Math.ceil(hasta - ahora)), planta:true };
  }

  recolectarPlanta(indice = 0, metodo = "examinar") {
    const plantas = this.plantasEnSala();
    const nodo = plantas[Number(indice) || 0];
    if (!nodo) return "No hay una planta espiritual con ese número en esta sala.";
    if (!this.profesionDesbloqueada("herboristeria")) return "Herboristería no está habilitada para este personaje.";
    const planta = nodo.planta;
    const estado = this.estadoNodoHerboristeria(nodo.id, true);
    const accion = String(metodo || "examinar").toLowerCase().replace(/_/g, " ").trim();
    const oficio = this.player.profesiones.herboristeria;

    if (accion === "examinar" || accion === "observar" || accion === "mirar") {
      const especie = this.registroEspecieHerboristeria(nodo.especie, true);
      // Una observación cuenta una vez por estado ecológico. Tras una intervención
      // el nodo cambia y puede volver a enseñar algo al recuperarse/ser revisado.
      const nueva = estado.cambioObservado !== estado.cambios;
      if (nueva) {
        especie.observaciones += 1;
        estado.observaciones += 1;
        estado.cambioObservado = estado.cambios;
      }
      const fam = this.familiaridadHerboristeria(nodo.especie);
      const rango = this.rangoProfesion("herboristeria").nivel;
      const lectura = planta.procedimientos.map(p => {
        const disp = this.estadoPartePlanta(nodo.id, p);
        const dif = p.dificultad.replace(/_/g, " ").toUpperCase();
        const prob = rango >= 1 ? ` · ${Math.round(this.probabilidadHerboristeria(p, rango) * 100)}% estimado` : "";
        const rec = disp.disponible ? "" : ` · recupera en ${disp.espera}`;
        return `${p.metodo} [${dif}${prob}${rec}]`;
      }).join(" · ");
      this.autoguardar();
      return `${planta.pistas}
Familiaridad: ${fam.nombre}. Procedimientos visibles: ${lectura}.${nueva ? " Examinar informa, pero concede 0 XP." : " Este estado de la planta ya fue observado; releerlo concede 0 XP."}`;
    }

    const procedimiento = planta.procedimientos.find(p => accion === p.id || accion === p.id.replace(/_/g, " ") || accion.includes(p.metodo) || p.metodo.includes(accion));
    if (!procedimiento) return "No reconoces un procedimiento compatible con esa planta. Examínala para leer sus partes aprovechables.";
    const disponibilidad = this.estadoPartePlanta(nodo.id, procedimiento);
    if (!disponibilidad.disponible) return disponibilidad.planta
      ? `Esa parte todavía se recupera. Faltan ${disponibilidad.espera} turnos.`
      : `La planta completa se está regenerando. Faltan ${disponibilidad.espera} turnos.`;

    this.turnoGlobal += 1;
    this.registrarActividadReposo(1);
    this.avanzarEcologia(1);
    const afliccionesAccion = this.avanzarAflicciones(1);
    const exito = this.azarHerboristeria() <= this.probabilidadHerboristeria(procedimiento);
    const recuperacion = exito ? procedimiento.recuperacionExito : procedimiento.recuperacionFallo;
    if (procedimiento.destructivo) estado.muertaHasta = this.turnoGlobal + recuperacion;
    else estado.partes[procedimiento.id] = this.turnoGlobal + recuperacion;
    estado.cambios += 1;

    if (!exito) {
      this.autoguardar(); this.actualizarBarra(); this.actualizarPanel();
      return `La recolección falla y daña ${procedimiento.metodo}. No obtienes material: 0 XP. La planta necesitará ${recuperacion} turnos para recuperarse.${afliccionesAccion.length ? "\n" + afliccionesAccion.join("\n") : ""}`;
    }

    const especie = this.registroEspecieHerboristeria(nodo.especie, true);
    const clave = `${nodo.especie}:${procedimiento.id}`;
    const exitosPrevios = Math.max(0, Number(oficio.procedimientos[clave]) || 0);
    const numeroExito = exitosPrevios + 1;
    const xpPractica = xpPracticaPorDificultad("herboristeria", procedimiento.dificultad, numeroExito);
    const bonoEspecie = especie.exitos === 0 ? BONO_PRIMERA_ESPECIE_HERBORISTERIA : 0;
    const bonoProcedimiento = exitosPrevios === 0 ? BONO_PRIMER_PROCEDIMIENTO_HERBORISTERIA : 0;
    const xpTotal = xpPractica + bonoEspecie + bonoProcedimiento;

    oficio.procedimientos[clave] = numeroExito;
    especie.exitos += 1;
    especie.procedimientos[procedimiento.id] = (especie.procedimientos[procedimiento.id] || 0) + 1;
    estado.exitos += 1;
    for (let i=0; i<procedimiento.cantidad; i++) this.player.inventario.push(procedimiento.item);
    this.registrarMaterialHerboristeria(procedimiento.item, procedimiento.cantidad);
    const avisoRango = this.sumarExperienciaProfesion("herboristeria", xpTotal);
    const fam = this.familiaridadHerboristeria(nodo.especie);
    this.autoguardar(); this.actualizarBarra(); this.actualizarPanel();
    const bonos = [bonoEspecie ? `+${bonoEspecie} especie nueva` : "", bonoProcedimiento ? `+${bonoProcedimiento} procedimiento nuevo` : ""].filter(Boolean);
    const detalleXP = `+${formatearXP(xpTotal)} XP${bonos.length ? ` (${formatearXP(xpPractica)} práctica · ${bonos.join(" · ")})` : ` (${formatearXP(xpPractica)} práctica)`}`;
    return `Herboristería espiritual: obtienes ${procedimiento.cantidad} ${ITEMS[procedimiento.item].name} mediante ${procedimiento.metodo}. ${detalleXP}. Familiaridad: ${fam.nombre}. Recuperación: ${recuperacion} turnos.${avisoRango ? " " + avisoRango : ""}${afliccionesAccion.length ? "\n" + afliccionesAccion.join("\n") : ""}`;
  }

  materialesFaltantes(rec) {
    if (!this.player || !rec) return [];
    const faltan = [];
    for (const [mid, n] of Object.entries(rec.ingredientes)) {
      const tiene = this.player.inventario.filter(x => x === mid).length;
      if (tiene < n) faltan.push({ mid, cantidad: n - tiene });
    }
    return faltan;
  }

  tieneEstacionAlquimia() { return !!this.rooms?.[this.pos]?.estaciones?.alquimia; }

  estadoRecetaAlquimia(rid) {
    this.normalizarProfesiones();
    return this.player.profesiones.alquimia.recetas[rid];
  }

  actualizarRecetasAlquimia() {
    if (!this.profesionDesbloqueada("alquimia")) return [];
    const oficio = this.player.profesiones.alquimia;
    const nuevas = [];
    for (const [rid, rec] of Object.entries(RECETAS)) {
      const st = oficio.recetas[rid];
      if (st.conocida) continue;
      const d = rec.desbloqueo || {};
      const rango = this.rangoProfesion("alquimia").nivel;
      const tieneItem = !d.item || this.player.inventario.includes(d.item) || (this.player.profesiones.examen?.materiales?.[d.item] || 0) > 0 || (this.player.profesiones.herboristeria?.materiales?.[d.item] || 0) > 0;
      const cumpleRango = d.rango == null || rango >= d.rango;
      if (d.tipo === "inicial" || ((d.tipo === "material" || d.tipo === "rango_material") && tieneItem && cumpleRango) || (d.tipo === "rango" && cumpleRango)) {
        st.conocida = true; nuevas.push(rid);
      }
    }
    return nuevas;
  }

  techoPracticaAlquimia(rec, validasPrevias) {
    const tramo = validasPrevias <= 0 ? 0 : validasPrevias === 1 ? 1 : validasPrevias <= 4 ? 2 : 3;
    return TECHO_PRACTICA_ALQUIMIA[rec.dificultad]?.[tramo] || "estable";
  }

  calidadPotencialAlquimia(elecciones, patron) {
    const errores = elecciones.reduce((n,v,i) => n + Math.abs(v - patron[i]), 0);
    const calidad = errores === 0 ? "excepcional" : errores === 1 ? "superior" : errores === 2 ? "estable" : errores === 3 ? "impura" : "fallo";
    return { errores, calidad };
  }

  limitarCalidadAlquimia(potencial, techo) {
    if (potencial === "fallo") return "fallo";
    return CALIDADES_ALQUIMIA[potencial].nivel <= CALIDADES_ALQUIMIA[techo].nivel ? potencial : techo;
  }

  registrarObservacionesAlquimia(rid, elecciones) {
    const rec = RECETAS[rid], st = this.estadoRecetaAlquimia(rid);
    const rango = this.rangoProfesion("alquimia").nivel;
    const cantidad = Math.min(3, rango + 1);
    const candidatos = elecciones.map((v,i) => ({i, error:Math.abs(v-rec.patron[i])})).sort((a,b) => b.error-a.error || a.i-b.i).slice(0,cantidad);
    const mensajes = [];
    for (const {i} of candidatos) {
      const q = st.pulsos[i], elegida = elecciones[i], correcta = rec.patron[i], pulso = PULSOS_ALQUIMIA[i];
      if (elegida === correcta) {
        q.aciertos[elegida] = (Number(q.aciertos[elegida]) || 0) + 1;
        if (q.aciertos[elegida] >= 2) q.confirmado = elegida;
        mensajes.push(`${pulso.nombre}: ${pulso.opciones[elegida-1]} mantuvo una señal estable${q.confirmado === elegida ? " y queda confirmado" : ""}.`);
      } else {
        if (!q.descartados.includes(elegida)) q.descartados.push(elegida);
        if (!q.confirmado && q.descartados.length >= 2) q.confirmado = [1,2,3].find(v => !q.descartados.includes(v)) || null;
        const direccion = elegida > correcta ? "excesivo/tardío" : "insuficiente/temprano";
        mensajes.push(`${pulso.nombre}: ${pulso.opciones[elegida-1]} resultó ${direccion}; queda descartado.`);
      }
    }
    return mensajes;
  }

  xpAlquimiaPorResultado(rid, calidad) {
    const rec = RECETAS[rid], st = this.estadoRecetaAlquimia(rid);
    if (calidad === "fallo") return { xp:0, detalles:[] };
    const base = xpPracticaPorDificultad("alquimia", rec.dificultad, st.validas + 1);
    let xp = base; const detalles = [`práctica ${formatearXP(base)} XP`];
    if (!st.hitos.valida) { st.hitos.valida = true; xp += HITOS_ALQUIMIA.valida; detalles.push(`primera válida +${HITOS_ALQUIMIA.valida}`); }
    const nivel = CALIDADES_ALQUIMIA[calidad].nivel;
    for (const h of ["estable","superior","excepcional"]) {
      if (nivel >= CALIDADES_ALQUIMIA[h].nivel && !st.hitos[h]) { st.hitos[h]=true; xp += HITOS_ALQUIMIA[h]; detalles.push(`primer ${h} +${HITOS_ALQUIMIA[h]}`); }
    }
    return { xp, detalles };
  }

  dominioAlquimia(rid, variante = "base") {
    const st = this.estadoRecetaAlquimia(rid);
    if (!st) return null;
    st.dominios ||= {};
    if (!st.dominios[variante]) st.dominios[variante] = { excepcional:false, metodo:null };
    return st.dominios[variante];
  }

  alquimiaDominada(rid, variante = "base") {
    return !!this.dominioAlquimia(rid, variante)?.excepcional;
  }

  registrarDominioExcepcionalAlquimia(rid, elecciones, variante = "base") {
    const dominio = this.dominioAlquimia(rid, variante);
    if (!dominio) return false;
    const era = !!dominio.excepcional;
    dominio.excepcional = true;
    dominio.metodo = Array.isArray(elecciones) ? elecciones.slice(0, 3).map(Number) : [...RECETAS[rid].patron];
    const st = this.estadoRecetaAlquimia(rid);
    if (st?.pulsos) dominio.metodo.forEach((v,i) => { if (st.pulsos[i]) st.pulsos[i].confirmado = v; });
    return !era;
  }

  descripcionEfectoAlquimia(itemId) {
    const it = ITEMS[itemId];
    if (!it) return "Sin efecto registrado.";
    const out = [];
    if (it.cura) out.push(`Cura ${dadoARango(it.cura)} de vida`);
    if (it.recupera_qi) out.push(`Recupera hasta ${it.recupera_qi} qi`);
    if (it.purifica) out.push(`Purifica ${it.purifica} nivel${it.purifica === 1 ? "" : "es"} de impureza`);
    if (it.remienda) out.push(`Repara ${it.remienda} herida${it.remienda === 1 ? "" : "s"} meridiana${it.remienda === 1 ? "" : "s"}`);
    if (it.cura_afliccion) out.push(`Trata ${it.cura_afliccion.tipo} de familia ${it.cura_afliccion.familia} hasta grado ${it.cura_afliccion.gradoMax}`);
    if (Number(it.impureza) > 0) out.push(`Añade ${it.impureza} impureza${it.impureza === 1 ? "" : "s"}`);
    return out.length ? out.join(" · ") + "." : (it.desc || "Sin efecto registrado.");
  }

  iniciarElaboracion(rid, opciones = {}) {
    const rec = RECETAS[rid];
    const rapida = !!opciones.rapida;
    const variante = opciones.variante || "base";
    if (!rec) return false;
    const fallar = (texto) => {
      this.alquimiaResultado = { rid, fallo:true, aviso:true, texto, modo: rapida ? "rapida" : "manual" };
      this.salida(texto, "sistema");
      if (document.getElementById("interaccionOficio")?.open) this.renderInteraccionOficio();
      return false;
    };
    if (!this.profesionDesbloqueada("alquimia")) return fallar("Enseñanza de Alquimia pendiente de implementación canónica 3C.");
    this.actualizarRecetasAlquimia();
    if (!this.estadoRecetaAlquimia(rid)?.conocida) return fallar("Esa fórmula todavía no figura en tu Bitácora Alquímica.");
    if (this.combate) return fallar("No puedes atender una preparación alquímica mientras luchas.");
    if (!this.tieneEstacionAlquimia()) return fallar("No hay una estación alquímica estable que puedas utilizar aquí.");
    const faltan = this.materialesFaltantes(rec);
    if (faltan.length) return fallar(`Falta: ${faltan.map(f => `${f.cantidad} ${ITEMS[f.mid].name}`).join(" · ")}.`);
    if (rapida && !this.alquimiaDominada(rid, variante)) return fallar("La elaboración rápida sólo se habilita después de obtener una calidad EXCEPCIONAL con esta variante.");

    this.ofiReceta = rid;
    this.alquimiaResultado = null;
    if (rapida) {
      const dominio = this.dominioAlquimia(rid, variante);
      const metodo = Array.isArray(dominio?.metodo) && dominio.metodo.length === 3 ? dominio.metodo : rec.patron;
      this.elaboracion = { rid, variante, elecciones:[...metodo], rapida:true };
      return this.resolverElaboracion();
    }
    this.elaboracion = { rid, variante, elecciones:[], rapida:false };
    if (document.getElementById("interaccionOficio")?.open) this.renderInteraccionOficio();
    return true;
  }

  elegirPulsoAlquimia(valor) {
    if (!this.elaboracion || ![1,2,3].includes(valor)) return false;
    this.elaboracion.elecciones.push(valor);
    if (this.elaboracion.elecciones.length >= 3) this.resolverElaboracion();
    else if (document.getElementById("interaccionOficio")?.open) this.renderInteraccionOficio();
    return true;
  }

  resolverElaboracion() {
    const proceso = this.elaboracion;
    if (!proceso || proceso.elecciones.length < 3) return false;
    const rec = RECETAS[proceso.rid], st = this.estadoRecetaAlquimia(proceso.rid);
    const varianteClave = proceso.variante || "base";
    const faltan = this.materialesFaltantes(rec);
    if (faltan.length) {
      this.elaboracion = null;
      this.alquimiaResultado = { rid:proceso.rid, fallo:true, aviso:true, texto:"Los ingredientes ya no están completos. La preparación se detiene sin consumir nada.", modo:proceso.rapida?"rapida":"manual" };
      if (document.getElementById("interaccionOficio")?.open) this.renderInteraccionOficio();
      return false;
    }

    // FUTURO · EFICIENCIA: hoy se consume el 100% de los ingredientes base.
    // Cuando exista ahorro de recursos, debe resolverse aquí SIN tocar calidad.
    for (const [mid,n] of Object.entries(rec.ingredientes)) this.quitarItems(mid,n);

    const potencial = this.calidadPotencialAlquimia(proceso.elecciones, rec.patron);
    const techo = this.techoPracticaAlquimia(rec, st.validas);
    const calidad = this.limitarCalidadAlquimia(potencial.calidad, techo);
    const observaciones = proceso.rapida ? [] : this.registrarObservacionesAlquimia(proceso.rid, proceso.elecciones);
    const modo = proceso.rapida ? "rapida" : "manual";
    this.elaboracion = null;
    this.turnoGlobal += 2;
    this.registrarActividadReposo(2);
    this.avanzarEcologia(2);
    const afliccionesAccion = this.avanzarAflicciones(2);

    if (calidad === "fallo") {
      this.player.fallos_alquimia = (this.player.fallos_alquimia || 0) + 1;
      this.player.impurezas = (this.player.impurezas || 0) + 1;
      const texto = `La mezcla colapsa tras ${potencial.errores} errores de etapa. Pierdes los ingredientes. XP 0.`;
      this.alquimiaResultado = {
        rid:proceso.rid, fallo:true, calidad:"fallo", cantidad:0, xp:0, modo,
        texto, observaciones, aflicciones:afliccionesAccion,
      };
      this.salida(texto, "sistema");
    } else {
      const variante = VARIANTES_ALQUIMIA[proceso.rid][calidad];
      // FUTURO · RENDIMIENTO: cantidadBase=1. Bonos de cantidad irán después
      // de resolver calidad y antes de crear los objetos; hoy siempre es x1.
      const cantidad = 1;
      for (let i = 0; i < cantidad; i++) this.player.inventario.push(variante.id);
      this.player.alquimia = (this.player.alquimia || 0) + 1;
      this.player.fallos_alquimia = 0;
      const eraDominada = this.alquimiaDominada(proceso.rid, varianteClave);
      const xpInfo = this.xpAlquimiaPorResultado(proceso.rid, calidad);
      st.validas += 1;
      this.player.profesiones.alquimia.elaboraciones += 1;
      this.player.profesiones.alquimia.calidades[calidad] = (this.player.profesiones.alquimia.calidades[calidad] || 0) + 1;
      if (!st.mejor || CALIDADES_ALQUIMIA[calidad].nivel > CALIDADES_ALQUIMIA[st.mejor].nivel) st.mejor = calidad;
      let desbloqueoRapido = false;
      if (calidad === "excepcional") {
        this.registrarDominioExcepcionalAlquimia(proceso.rid, proceso.elecciones, varianteClave);
        desbloqueoRapido = !eraDominada;
      }
      const avisoRango = xpInfo.xp ? this.sumarExperienciaProfesion("alquimia", xpInfo.xp) : "";

      const texto = `Obtienes ${ITEMS[variante.id].name} (${CALIDADES_ALQUIMIA[calidad].nombre.toUpperCase()}).`;
      this.alquimiaResultado = {
        rid:proceso.rid, fallo:false, calidad, cantidad, itemId:variante.id, xp:xpInfo.xp,
        xpDetalles:xpInfo.detalles, modo, potencial:potencial.calidad, techo, observaciones,
        desbloqueoRapido, avisoRango, efecto:this.descripcionEfectoAlquimia(variante.id),
        aflicciones:afliccionesAccion,
      };
      this.salida(texto, "recompensa");
    }
    if (afliccionesAccion.length) this.salida(afliccionesAccion.join("\n"), "sistema");
    this.actualizarRecetasAlquimia();
    this.autoguardar();
    this.actualizarBarra();
    this.actualizarPanel();
    if (document.getElementById("interaccionOficio")?.open) this.renderInteraccionOficio();
    return calidad;
  }

  requisitosInjerto(elemento) {
return ["Injerto pendiente de implementación canónica 3C"];
  }




  // ------------------------------------------------------------------------
  //  7.5  COMANDOS · despacho y verbos. Un verbo devuelve texto o llama a la
  //       interfaz; no debería tocar el DOM directamente (cmd_afinidad
  //       todavía lo hace)
  //
  //  Índice por tema:
  //    despacho               ejecutar
  //    movimiento / reposo    cmd_ir, cmd_descansar, cmd_dormir
  //    examinar / objetos     cmd_examinar, cmd_tomar, eventoJarra,
  //                           cmd_soltar, cmd_inventario, cmd_equipo,
  //                           cmd_equipar, cmd_desequipar, beber, cmd_beber,
  //                           leerDiario, aprenderManual
  //    cultivo                cmd_meditar, alcanzarGranPerfeccion,
  //                           iniciarIluminacion, iniciarTribulacionCorazon,
  //                           triunfoZhuji
  //    combate                cmd_atacar, cmd_defender, iniciarDuelo,
  //                           resolverDuelo, cmd_huir
  //    npc / comercio         cmd_hablar, cmd_entregar, cmd_comprar,
  //                           cmd_tienda, cmd_contribucion, cmd_servicios,
  //                           cmd_canjear
  //    oficios / alquimia     cmd_oficios, cmd_recetas, cmd_alquimia
  //    misiones / técnicas    cmd_misiones, cmd_estudiar, cmd_injertar,
  //                           cmd_hoja, cmd_dao, cmd_tecnica, cmd_afinidad,
  //                           cmd_promocion
  //    sistema / meta         cmd_glosario, cmd_guardar, cmd_cargar,
  //                           mostrarIndiceAyuda, cmd_ayuda, cmd_diagnostico
  // ------------------------------------------------------------------------

  ejecutar(verbo, args) {
    globalThis.ASTRA_SELF_INTRODUCTION_B22?.cancelPending?.(this);
    // Persistencia es meta: idéntica al botón, sin turnos ni ecología.
    if (verbo === "guardar" || verbo === "cargar") { this["cmd_" + verbo](); return; }
    if (verbo === "mapa" || verbo === "atlas") { this.abrirAtlas(); return; }
    if (verbo === "meridianos" || verbo === "tecnicas" || (verbo === "tecnica" && !args.length)) { this.abrirMeridianos(); return; }
    if (verbo === "misiones" || verbo === "mision") { this.abrirMisiones(); return; }
  if (verbo === "oficios") { this.abrirOficios(); return; }
  if (verbo === "cultivo") { this.abrirCultivo(); return; }
  if (["recolectar", "cosechar"].includes(verbo)) {
    this.abrirInteraccionOficio("herboristeria", args); return;
  }
  if (verbo === "extraer") {
    this.abrirInteraccionOficio("examen", args); return;
  }
  if (verbo === "recetas") { this.abrirOficios("alquimia"); return; }
    // AYUDA es consulta pura, igual que MAPA/TÉCNICAS/MISIONES/OFICIOS arriba:
    // con varias secciones navegables, cobrar turno por leerlas sería castigar
    // al jugador por informarse.
    if (verbo === "ayuda") { const res = this.cmd_ayuda(args); if (typeof res === "string") this.salida(res); return; }
    // R12 is a read-only view, including its command aliases. Opening it must
    // not age corpses/objects or consume a combat action through the old parser.
    if (verbo === "hoja" || verbo === "equipo") {
      const consulta = this["cmd_" + verbo](args);
      if (typeof consulta === "string") this.salida(consulta);
      return;
    }
    if (verbo === "alquimia") { this.cmd_alquimia(args); return; }
    if (verbo === "contribucion" || verbo === "servicios") {
      const consulta = this["cmd_" + verbo](args);
      if (consulta) this.salida(consulta);
      return;
    }
    // La cronología narrativa avanza sólo con órdenes válidas: un comando que el
    // juego no entiende no debe envejecer cadáveres ni objetos tirados, que se
    // miden contra turnoGlobal. (La fauna va por relojEcologico, aparte.)
    if (this.combate) {
      this.turnoGlobal++;
      const [texto, estado] = this.combate.turno(verbo, args);
      // Mientras hay combate, el texto va SIEMPRE al registro de la ventana,
      // nunca a #contenido (ver CONTRATO DE DISEÑO · INTERFAZ DE COMBATE §2).
      if (texto) this.registrarSalidaCombate(texto);
      if (estado === "continua") { this.actualizarVistaCombate(); return; }
      const especial = this.combate.especial;
      // El motor ya terminó: this.combate vuelve a null exactamente como
      // antes. Lo que cambia es CUÁNDO se dispara la narrativa posterior
      // (postAccion) — al pulsar CONTINUAR, con el terminal ya visible, para
      // que muerte()/resolverDuelo() puedan usar preguntar() con sentido.
      this.combate = null;
      let postAccion = () => { this.airarSaturacion(); this.autoguardar(); };
      if (estado === "derrota") postAccion = () => this.muerte();
      this.mostrarResultadoCombate(estado, postAccion);
      return;
    }
    if (!verbo) return;
    if (DIRECCIONES.includes(verbo)) { this.turnoGlobal++; this.cmd_ir(verbo); return; }
    if (verbo === "ir") { this.salida("¿Hacia dónde? (norte, sur, este, oeste...)"); return; }
    const handler = this["cmd_" + verbo];
    if (typeof handler !== "function") {
      this.salida("No entiendes ese comando. (AYUDA para la lista)");
      return;
    }
    // R18: abreviaturas válidas solo para HABLAR y NPC presentes.
    // Las ambigüedades se responden sin escoger al azar ni consumir turno.
    if (verbo === "hablar") {
      const cierreMision = args.length > 0 &&
        ["mision", "misiones"].includes(normalizarAliasNPC(args.at(-1)));
      const palabraNpc = cierreMision ? args.slice(0,-1) : args;
      const r18=resolverInterlocutorR18(palabraNpc.join(" "),this.npcsEnSala(this.pos));
      if (r18.estado === 'AMBIGUO') {
        this.salida('Hay más de una persona que coincide. Especifica a cuál quieres hablar: ' +
          r18.candidatos.map(id=>NOMBRES_NPC[id]).join(', ') + '.');
        return;
      }
      if (r18.estado === 'FALTA' && r18.candidatos.length > 1) {
        this.salida('¿Con quién quieres hablar? Aquí: ' +
          r18.candidatos.map(id=>NOMBRES_NPC[id]).join(', ') + '.');
        return;
      }
      if (r18.estado === 'OK')
        args=[r18.id,...(cierreMision?args.slice(-1):[])];
    }
    this.turnoGlobal++;
    const res = handler.call(this, args);
    if (typeof res === "string") {
      const previousNode=this.contenido?.lastElementChild;
      this.salida(res);
      if(verbo==='hablar'){
        let delivery=null;
        try { delivery=globalThis.ASTRA_SELF_INTRODUCTION_B22?.consumeVisibleOutput?.({runtime:this,text:res,previousNode}); } catch {}
        if(delivery?.status==='IDENTITY_DELIVERY_CONFIRMED' && delivery.changed===true)
          this.playerIdentityKnowledge=delivery.state;
      }
    }
  }

  // ---------- verbos ----------

  cmd_ir(direccion) {
    const origen=this.pos;
    const destino = (this.rooms[this.pos].exits || {})[direccion];
    if (!destino) { this.salida("No hay salida hacia allí."); return; }
    const bloqueo = this.bloqueoPaso(this.pos, direccion);
    if (bloqueo) { this.salida(bloqueo, "sistema"); return false; }
    this.registrarActividadReposo();
    this.avanzarEcologia(1);
    const afliccionesPaso = this.avanzarAflicciones(1);
    this.pos = destino;
    if(origen==='puerta'&&this.flags.arc1?.hitos.M04_CONTROL_PUERTA)
      this.liberarArc1('gao_shun','M04','casa_guardia');
    this.sincronizarVistaAtlas(); // la vista del Atlas sigue a la posición física (área y capa)
    this.moverErrantes(); // el mundo también se mueve mientras tú caminas
    this.entrarSala();
    if (afliccionesPaso.length) this.salida(afliccionesPaso.join("\n"), "sistema");
    this.autoguardar();
  }

  cmd_descansar() {
    if (this.vivos.some(m => m.hp > 0)) return "No puedes bajar la guardia mientras haya una amenaza cerca.";
    const p = this.player;
    const afligido = this.normalizarAflicciones().length > 0;
    if (p.hp >= p.max_hp && !afligido) return "Tu cuerpo no necesita una pausa: ya tienes toda la vida.";
    const actividad = this.actividadReposo();
    if (actividad < ACCIONES_DESCANSAR) {
      const faltan = ACCIONES_DESCANSAR - actividad;
      return `Acabas de reposar y tu cuerpo aún no necesita otra pausa. Mantente activo durante ${faltan} ${faltan === 1 ? "acción" : "acciones"} más.`;
    }

    const antesHp = p.hp;
    const cura = Math.max(1, Math.ceil(p.max_hp * 0.25));
    p.hp = Math.min(p.max_hp, p.hp + cura);
    const vena = this.airearVenaLocal();
    this.reiniciarActividadReposo();
    const out = [
      "Aflojas los hombros, acompasas el aliento y permites que el cuerpo cierre sus heridas más pequeñas.",
      `Recuperas ${p.hp - antesHp} de vida.`,
    ];
    if (vena.antes > vena.despues) out.push("La pausa deja respirar un poco la vena espiritual de esta sala.");
    if (this.rooms[this.pos].salvaje) out.push("El monte no se detiene mientras descansas; algo puede haber cambiado de lugar.");
    this.avanzarEcologia(1);
    out.push(...this.avanzarAflicciones(1));
    this.moverErrantesTrasReposo(out);
    this.salida(out.join("\n"));
    this.autoguardar();
  }

  cmd_dormir() {
    const sala = this.rooms[this.pos];
    if (this.vivos.some(m => m.hp > 0)) return "No puedes dormir mientras haya una amenaza cerca.";
    if (!sala.alojamiento) return "Aquí no hay una cama ni un refugio adecuado. Puedes DESCANSAR si la zona es segura.";
    const p = this.player;
    const impurezas = p.impurezas || 0;
    const necesita = p.hp < p.max_hp || p.qi < p.qi_max || impurezas > 0 || this.normalizarAflicciones().length > 0;
    if (!necesita) return "Estás completamente recuperado. Dormir ahora no te ayudaría.";
    const emergencia = p.hp <= Math.floor(p.max_hp * 0.25);
    const actividad = this.actividadReposo();
    if (!emergencia && actividad < ACCIONES_DORMIR) {
      const faltan = ACCIONES_DORMIR - actividad;
      return `Todavía conservas el reposo anterior. Viaja, combate o cultiva durante ${faltan} ${faltan === 1 ? "acción" : "acciones"} más antes de volver a dormir.`;
    }

    const antesHp = p.hp, antesQi = p.qi;
    p.hp = p.max_hp;
    p.qi = Math.min(p.qi_max, p.qi + Math.ceil(p.qi_max * 0.5));
    this.airarSaturacion();
    if (sala.alojamiento.purifica && impurezas > 0) p.impurezas = impurezas - 1;
    this.reiniciarActividadReposo();

    const out = [sala.alojamiento.inicio];
    if (emergencia && actividad < ACCIONES_DORMIR) out.push("No tenías verdadero sueño, pero las heridas exigían reposo.");
    if (p.hp > antesHp) out.push(`Despiertas entero. Recuperas ${p.hp - antesHp} de vida.`);
    if (p.qi > antesQi) out.push(`El reposo devuelve ${p.qi - antesQi} de qi a tu dantian.`);
    out.push("El reposo renueva las venas espirituales. (saturación 100%)");
    if (sala.alojamiento.purifica && impurezas > 0) out.push("El sueño seguro destila parte del sedimento que llevabas. (impureza −1)");
    else if (!sala.alojamiento.purifica && impurezas > 0) out.push("El lecho permite dormir, pero su qi estancado no purifica tus impurezas.");
    out.push(sala.alojamiento.cierre || "El reposo termina y el cuerpo está listo para continuar.");
    this.avanzarEcologia(PULSOS_DORMIR);
    out.push(...this.avanzarAflicciones(PULSOS_DORMIR));
    this.moverErrantesTrasReposo(out);
    this.salida(out.join("\n"));
    this.autoguardar();
  }

  cmd_examinar(args) {
    if (!args.length) { this.mostrarSala(); return; }
    const texto = args.join("_");

    const mobExaminado = resolverMobPorArgs(this.vivos.filter(m => m.hp > 0), args);
    if (mobExaminado) {
        this.recordarCriatura(mobExaminado, true);
        this.mostrarFichaCriatura(mobExaminado);
        return;
    }
    const cadaver = this.resolverCadaver(args);
    if (cadaver) return this.describirCadaver(cadaver);
    const sala = this.rooms[this.pos];
    const npcs = this.npcsEnSala(this.pos);
    const npc=resolverNPC(args.join(" "),npcs);
    if (npc) {
      const descripcion=DESCS_NPC[npc] || `${NOMBRES_NPC[npc]} — ${NPC_DEF[npc].rol}.`;
      this.atlas.personas[npc] = { ...(this.atlas.personas[npc] || {}), sala:this.pos, turno:this.turnoGlobal, descripcion };
      return descripcion;
    }





    const scenery = sala.scenery || {};
    const esc = scenery[texto]
      ?? Object.entries(scenery).find(([k]) => quitaAcentos(k.toLowerCase()) === texto)?.[1];
    if (esc) {
      const clave=Object.keys(scenery).find(k=>quitaAcentos(k.toLowerCase())===quitaAcentos(texto.toLowerCase()));
      if(clave)this.examinarEscenaArc1(this.pos,clave);
      return esc;
    }
    const mid = this.resolverItem(args, "ambos");
    if (!mid) return "No ves eso por aquí.";
    const it = ITEMS[mid];
    const st = statsItem(mid);
    const base = it.desc || `Un ${it.name}.`;
    const perfil = it.tecnica ? `\n[Para ti: ${this.perfilTecnica(it.tecnica)}]` : "";
    const dejado = this.objetosTiradosEnSala().filter(reg => reg.mid === mid)
      .map(reg => reg.desapareceEn - this.turnoGlobal);
    const suelo = dejado.length
      ? `\n[Dejado en el suelo: ${Math.min(...dejado)} turnos antes de desaparecer.]`
      : "";
    return (st ? `${base}\n  [${st}]` : base) + perfil + suelo;
  }

  cmd_tomar(args) {
    const texto = args.join("_");

    const mid = this.resolverItem(args, "sala");
    if (!mid) return "No hay eso aquí.";
    const sala = this.rooms[this.pos];
    if ((sala.items || []).includes(mid)) {
      const idx = sala.items.indexOf(mid);
      if (idx >= 0) sala.items.splice(idx, 1);
    }
    else if (this.tieneSentido() && (sala.oculto || []).includes(mid)) {
      const idxo = sala.oculto.indexOf(mid);
      if (idxo >= 0) sala.oculto.splice(idxo, 1);
    } else {
      const tirados = this.objetosTiradosEnSala();
      const idxTirado = tirados.findIndex(reg => reg.mid === mid);
      if (idxTirado >= 0) {
        tirados.splice(idxTirado, 1);
        if (tirados.length) this.objetosTirados[this.pos] = tirados;
        else delete this.objetosTirados[this.pos];
      }
    }
    const it = ITEMS[mid];
    if (it.piedras) {
      this.player.piedras += it.piedras;
      return `Tomas ${it.name}: +${it.piedras} piedras espirituales.`;
    }
    this.player.inventario.push(mid);
    return `Tomas: ${it.name}.`;
  }



  cmd_soltar(args) {
    if (!args?.length) return "¿Qué quieres tirar? Escribe TIRAR <objeto>.";
    let mid = this.resolverItem(args, "inv");
    let equipadoEn = null;
    if (!mid) {
      const texto = args.join("_");
      for (const [slot, candidato] of Object.entries(this.player.equipado || {})) {
        const nombre = quitaAcentos(ITEMS[candidato]?.name?.toLowerCase() || "");
        if (candidato === texto || args.every(w => candidato.includes(w) || nombre.includes(w))) {
          mid = candidato;
          equipadoEn = slot;
          break;
        }
      }
    }
    if (!mid) return "No llevas eso ni lo tienes equipado.";
    if(mid==='pildora_consolidacion'&&this.pildoraProtegidaArc1())
      return "Esta píldora está reservada para tu consagración.";
    if (equipadoEn) delete this.player.equipado[equipadoEn];
    else this.player.inventario.splice(this.player.inventario.indexOf(mid), 1);
    this.objetosTirados ||= {};
    (this.objetosTirados[this.pos] ||= []).push({
      mid,
      tiradoEn: this.turnoGlobal,
      desapareceEn: this.turnoGlobal + DURACION_OBJETO_TIRADO,
    });
    const accion = equipadoEn ? "Te lo quitas y lo dejas" : "Lo dejas";
    return `${accion} en el suelo: ${ITEMS[mid].name}. Permanecerá durante ${DURACION_OBJETO_TIRADO} turnos.`;
  }

  cmd_inventario() {
    const p = this.player;
    if (!p.inventario.length) return "Vacías las manos: nada. (Todo lo llevado puesto: EQUIPO)";
    const out = ["Llevas:"];
    for (const { mid, cantidad } of agruparObjetos(p.inventario)) {
      const it = ITEMS[mid];
      out.push(`  - ${nombreCantidad(mid, cantidad)}${it.slot ? ` [${it.slot}]` : ""}`);
    }
    out.push(`Piedras espirituales: ${p.piedras}`);
    return out.join("\n");
  }

  cmd_equipo() { this.mostrarEquipo(); }

  cmd_equipar(args) {
    const p = this.player;
    const mid = this.resolverItem(args, "inv");
    if (!mid) return "No llevas eso.";
    const it = ITEMS[mid];
    if (!it.slot) return `${it.name} no se lleva puesto.`;
    p.inventario.splice(p.inventario.indexOf(mid), 1);
    const previa = p.equipado[it.slot];
    if (previa) p.inventario.push(previa);
    p.equipado[it.slot] = mid;
    const extra = previa ? ` (Guardas: ${ITEMS[previa].name})` : "";
    let tutorial = "";
    return `Te equipas: ${it.name}.${extra}${tutorial}`;
  }

  cmd_desequipar(args) {
    const p = this.player;
    const texto = args.join("_");
    for (const slot of Object.keys(p.equipado)) {
      const mid = p.equipado[slot];
      if (texto && (mid.includes(texto) || quitaAcentos(ITEMS[mid].name.toLowerCase()).includes(texto))) {
        delete p.equipado[slot];
        p.inventario.push(mid);
        return `Guardas: ${ITEMS[mid].name}.`;
      }
    }
    return "No llevas eso equipado.";
  }

  beber(args) {
    const p = this.player;
    if (!args || !args.length) {
      const utilizables = agruparObjetos(p.inventario.filter(mid => {
        const it = ITEMS[mid];
        return it && (it.tipo === "consumible" || it.tipo === "manual" || mid === "pildora_fundacion");
      }));
      const opciones = utilizables.length
        ? ` Llevas: ${utilizables.map(({ mid, cantidad }) => nombreCantidad(mid, cantidad)).join(", ")}.`
        : " No llevas consumibles, manuales ni diarios utilizables.";
      return [[`¿Usar qué? Escribe USAR <objeto> o BEBER <objeto>.${opciones}`], false];
    }
    let mid = this.resolverItem(args, "inv");
    if (!mid) return [[`No llevas un objeto que coincida con «${args.join(" ")}». Consulta INVENTARIO para ver sus nombres.`], false];
    if(mid==='pildora_consolidacion'&&this.pildoraProtegidaArc1())
      return [['Conservas la píldora de M05 para la consagración.'],false];
    const it = ITEMS[mid];
    if (it.cura_afliccion) {
      const tratamiento = this.tratarAfliccion(it.cura_afliccion);
      if (!tratamiento.ok) return [[tratamiento.mensaje], false];
      p.inventario.splice(p.inventario.indexOf(mid), 1);
      const impureza = it.impureza || 0;
      if (impureza) p.impurezas = (p.impurezas || 0) + impureza;
      const extra = impureza ? ` La preparación impura deja sedimento +${impureza}.` : "";
      return [[`${capitalizarUI(it.name)} enfría tus meridianos. ${tratamiento.mensaje}${extra}`], true];
    }
    if (it.purifica && !it.remienda) {
      p.inventario.splice(p.inventario.indexOf(mid), 1);
      const antes = p.impurezas || 0;
      p.impurezas = Math.max(0, antes - it.purifica);
      return [[`${capitalizarUI(it.name)} se disuelve como nieve. Impurezas: ${antes} → ${p.impurezas}.`], true];
    }
    if (it.recupera_qi) {
      p.inventario.splice(p.inventario.indexOf(mid), 1);
      const antes = p.qi;
      p.qi = Math.min(p.qi_max, p.qi + it.recupera_qi);
      const impureza = it.impureza || 0;
      p.impurezas = (p.impurezas || 0) + impureza;
      const nota = impureza
        ? `   (La energía apresurada deja impureza +${impureza}.)`
        : "   (La esencia circula limpia: no deja impurezas.)";
      return [[`Bebes ${it.name}: +${p.qi - antes} qi.`, nota], true];
    }
    if (it.remienda) {
      if ((p.heridas_meridianos || 0) <= 0) return [["Tus meridianos no necesitan remiendo. Guardas la píldora."], false];
      p.inventario.splice(p.inventario.indexOf(mid), 1);
      const heridasAntes = p.heridas_meridianos;
      p.heridas_meridianos = Math.max(0, p.heridas_meridianos - it.remienda);
      const impurezasAntes = p.impurezas || 0;
      if (it.purifica) p.impurezas = Math.max(0, impurezasAntes - it.purifica);
      else if (it.impureza) p.impurezas = impurezasAntes + it.impureza;
      const extra = p.impurezas !== impurezasAntes ? ` Impurezas: ${impurezasAntes} → ${p.impurezas}.` : "";
      return [[`${capitalizarUI(it.name)} se abre en hilos fríos y cose ${heridasAntes - p.heridas_meridianos} herida${heridasAntes - p.heridas_meridianos === 1 ? "" : "s"}. Heridas de meridiano: ${p.heridas_meridianos}/3.${extra}`], true];
    }
    if (it.tipo === "consumible" && it.cura) {
      p.inventario.splice(p.inventario.indexOf(mid), 1);
      const cura = tirar(it.cura);
      p.hp = Math.min(p.max_hp, p.hp + cura);
      const impureza = it.impureza ?? 1;
      p.impurezas = (p.impurezas || 0) + impureza;
      const nota = impureza ? `   (El qi barato deja sedimento: impureza +${impureza}.)` : "   (El refinado fue limpio: no deja impurezas.)";
      return [[`Bebes ${it.name}: +${cura} de vida.`, nota], true];
    }
    if (mid === "pildora_fundacion") {
      return [["La Píldora de Fundación no se bebe: se consume meditando con el qi al tope del tope."], false];
    }

    if (it.tipo === "manual") return this.aprenderManual(mid);
    if (it.slot) return [[`${capitalizarUI(it.name)} no se usa así. Prueba EQUIPAR ${mid}.`], false];
    return [[`No sabes cómo usar ${it.name} de esa manera.`], false];
  }

  cmd_beber(args) {
    const [msgs] = this.beber(args);
    const texto = msgs.filter(Boolean).join("\n");
    if (texto) return texto;
  }



  aprenderManual(mid) {
    const it = ITEMS[mid];
    const tid = it.tecnica;
    const t = TECNICAS[tid];
    if (!t) return [[`Lees ${it.name}... escritura ilegible para ti.`], false];
    if (!cumpleRequisitoReino(this.player, t.req)) {
      return [[`Abres el ${it.name}... y el pergamino ARAÑA: exige un qi de reino ${t.req.reino} para siquiera dejarse leer.`], false];
    }
    if(tid==='piel_cobre'&&this.quests.M03!=='activa'&&this.quests.M03!=='hecha')
      return [["Piel de Cobre requiere la enseñanza de Shen Baojun en M03."],false];
    if (tid in this.player.tecnicas) return [["Ya conoces esa técnica."], false];
    this.player.inventario.splice(this.player.inventario.indexOf(mid), 1);
    this.player.tecnicas[tid] = { maestria: 0, usos: 0, practica: 0, ramas: { 1: 0, 2: 0, 3: 0 } };
    this.mostrarAprendizajeManual(mid, tid);
    return [[], true];
  }

  // ---------- MEDITAR (con puertas de etapa) ----------

  cmd_meditar(args) {
    const p = this.player, r = RAICES[p.raiz];
    const profundo = !!(args && args.some(a => a.includes("profund") || a === "hondo"));
    const sala = this.rooms[this.pos];
    const vena = this.venaActual(sala);

    if (this.vivos.some(m => m.hp > 0)) {
      return "Con algo moviéndose en la sala, la quietud no llega. (Resuélvelo primero.)";
    }

    if(this.quests.M03==='activa'&&this.pos==='patio_respiracion'&&
      this.flags.arc1?.hitos.M03_PRACTICA_MUNECO_COMPLETADA&&!this.flags.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA){
      this.flags.arc1.hitos.EVALUACION_CIRCULACION_SUPERADA=true;
      this.flags.arc1.evaluacionCirculacion='SUPERADA';
      this.reconciliarProgresionArc1();
    }

    const out = ["Te sientas con la espalda recta. El aliento se vuelve lento; el mundo, leve."];
    out.push(...this.avanzarAflicciones(1));

    if (p.qi >= p.qi_max) {
      if (!CULTIVO_REINOS[p.reino]?.jugable) {
        // Reino ya alcanzado pero sin mecánica jugable todavía (ZhuJi en
        // adelante: Arco 2+ no implementado). No hay puerta que cruzar ni
        // stats que ganar acá — evita que tocar el tope se explote para
        // subir stats infinitamente en un reino sin contenido real.
        out.push(`Tu qi toca el techo de tu cultivo en ${p.reino}. Su desarrollo pertenece a un arco todavía no implementado.`);
        this.salida(out.join("\n"));
        return;
      }
      if (!reinoExacto(p, "LianQi") || p.etapa < totalEtapas("LianQi")) {
        const siguiente = p.etapa + 1;
        const puerta = this.compruebaPuerta(reinoExacto(p, "LianQi") ? siguiente : 99);
        if (reinoExacto(p, "LianQi") && !puerta.ok) {
          out.push("El vaso está lleno. Intentas que el qi se asiente... y algo se niega a ceder.");
          out.push("Algo falta. El qi está, la voluntad también. La montaña no te deja pasar todavía.");
          out.push("Te falta: " + puerta.faltan.join(" · ") + ".");
          this.salida(out.join("\n"));
          return;
        }
        const pt = reinoExacto(p, "LianQi") ? PUERTAS[siguiente] : null;
        if (pt && pt.pildoras) {
          for (let i = 0; i < pt.pildoras; i++) {
            const idx = p.inventario.indexOf("pildora_consolidacion");
            if (idx >= 0) p.inventario.splice(idx, 1);
          }
        }
        const maxHpAnterior = p.max_hp;
        const ataqueAnterior = p.ataque;
        const vasoAnterior = p.qi_max;
        // El vaso crece sin descontar el qi que ya circulaba.
        p.etapa = Math.min(4, p.etapa + 1);
        p.qi_max = reinoExacto(p, "LianQi") ? VASO_ETAPA[p.etapa] : vasoAnterior + 20;
        this.reconciliarProgresionArc1();
        p.max_hp += 4;
        p.ataque += 1;
        p.hp = Math.max(1, Math.round(p.max_hp * 0.6));
        const puntosGanados = this.sincronizarPuntosTecnica();
        this.registrarActividadReposo();
        this.intentarPulsoMeditacion();
        this.salida(out.join("\n"));
        this.mostrarConsagracion({ maxHpAnterior, ataqueAnterior, puntosGanados });
        this.actualizarPanel();
        return;
      } else {
        out.push("Tu qi ha tocado el TOPE DEL TOPE de LianQi: el cuello de botella.");
        // Cadena del final del Arco 1. El orden lo deciden los helpers, nunca
        // comparaciones sueltas: Gran Perfección → Iluminación → Tribulación →
        // Fundación. Cada paso se dispara al MEDITAR con el vaso al tope.
        if (puedeAlcanzarGranPerfeccion(p)) {
          this.registrarActividadReposo();
          this.intentarPulsoMeditacion();
          this.salida(out.join("\n"));
          this.alcanzarGranPerfeccion();
          return;
        }
        if (puedeBuscarIluminacion(p)) {
          this.registrarActividadReposo();
          this.intentarPulsoMeditacion();
          this.salida(out.join("\n"));
          this.iniciarIluminacion();
          return;
        }
        if (puedeIniciarTribulacion(p)) {
          this.registrarActividadReposo();
          this.intentarPulsoMeditacion();
          this.salida(out.join("\n"));
          this.iniciarTribulacionCorazon();
          return;
        }
        if (this.puedeIntentar()) {
          this.registrarActividadReposo();
          this.intentarPulsoMeditacion();
          this.salida(out.join("\n"));
          this.triunfoZhuji();
          return;
        }
        out.push(`Necesitas: la Píldora de Fundación o comprensión ${UMBRAL_COMPRENSION_FUNDACION} (tienes ${p.comprension}). Consulta HOJA para ver el detalle.`);
      }
      this.salida(out.join("\n"));
      return;
    }

    if (vena.diente) {
      out.push("El qi pisoteado rehúye tu respiración. A veces muerde.");
      if (Azar.random() < PROB_MORDIDA) {
        const d = 1 + Math.floor(Azar.random() * 2);
        p.hp = Math.max(1, p.hp - d);
        out.push(`Un hilo de qi resentido te muerde los meridianos: ${d} de daño. La sala no te quiere.`);
      }
      this.salida(out.join("\n"));
      return;
    }
    const base = Math.round(r.qi_med * vena.mult);
    if (base === 0) {
      this.salida(out.join("\n"));
      this.mostrarQiAgotado("vacia");
      return;
    }

    const satIdx = Math.min(this.saturacionDe(this.pos), SATURACION_MULT.length - 1);
    const sat = SATURACION_MULT[satIdx];
    if (sat === 0) {
      this.salida(out.join("\n"));
      this.mostrarQiAgotado("agotada");
      return;
    }

    this.registrarActividadReposo();

    if (sala.salvaje) {
      const mob = this.atraerHostilVecino("QI");
      if (mob) {
        out.push("Cierras los ojos... y la maleza cruje a tu espalda.");
        out.push("¡" + mob.name + " interrumpe tu meditación!");
        return out.join("\n");
      }
    }

    const anillo = p.equipado.dedo === "anillo" ? 1 : 0;
    const metodo = p.metodo ? 1 : 0;
    let ganancia = Math.max(1, Math.round(base * sat)) + anillo + metodo;
    const heridas = p.heridas_meridianos || 0;
    if (heridas > 0) {
      ganancia = Math.max(1, ganancia - heridas);
      out.push(`Los meridianos heridos estrechan la circulación: −${heridas} qi por meditación.`);
    }

    if (sala.vena === "rica") {
      out.push(sala.purificaMeditacion
        ? "El qi se posa en la superficie como polen. Aquí solo hay que abrir la boca."
        : "El qi dorado del bambú entra contigo, denso como agua clara.");
    } else if (vena.mult === 1) {
      out.push("La vena de la secta corre limpia bajo la piedra.");
    } else {
      out.push("La vena es delgada. Sorbes lo que hay.");
    }

    if (profundo) {
      const riesgo = Math.min(RIESGO_MAX, RIESGO_BASE + RIESGO_IMPUREZA * (p.impurezas || 0));
      if (base > 0 && sat > 0 && Azar.random() * 100 < riesgo) {
        const perdida = Math.min(Math.floor(p.qi * 0.3), Math.max(0, p.qi));
        const d = p.qi > 0 ? tirar("1d4") : 0;
        p.qi = Math.max(0, p.qi - perdida);
        p.hp = Math.max(1, p.hp - d);
        out.push("Quieres demasiado. El qi se revuelve en tus meridianos.",
                 `Pierdes ${perdida} de qi y ${d} de vida.`);
        this.intentarPulsoMeditacion();
        this.salida(out.join("\n"));
        return;
      }
      ganancia += Math.max(1, Math.round(base * sat));
      out.push("Bajas al fondo del vaso, dientes apretados. El qi entra a borbotones. (×2)");
    }

    const qiAnterior = p.qi;
    p.qi = Math.min(p.qi_max, p.qi + ganancia);
    const qiAbsorbido = p.qi - qiAnterior;
    this.saturacion[this.pos] = satIdx + 1;

    if (qiAbsorbido > 0 && p.hp < p.max_hp && r.hp_med > 0) {
      const hpAnterior = p.hp;
      p.hp = Math.min(p.max_hp, p.hp + r.hp_med);
      out.push(`La circulación te recompone. (+${p.hp - hpAnterior} vida)`);
    }

    const notas = [];
    if (anillo) notas.push("el viejo del anillo tararea el ritmo");
    if (metodo) notas.push("la Grulla Serena respira contigo");
    if (sala.purificaMeditacion && (p.impurezas || 0) > 0) {
      p.impurezas--;
      notas.push("la quietud destila tus impurezas (−1)");
    }
    const nota = notas.length ? "\n(" + notas.join(" · ") + ")" : "";
    out.push(`(+${qiAbsorbido}) Total: ${p.qi}/${p.qi_max}.${nota}`);
    if (sat < 1) out.push(`(la vena de esta sala adelgaza para ti: saturación ${Math.round(sat * 100)}%)`);
    this.intentarPulsoMeditacion();
    this.salida(out.join("\n"));
  }

  // ======================================================================
  // FINAL DE LIANQI · Gran Perfección → Iluminación → Tribulación → ZhuJi
  // Reemplaza al antiguo cuello de botella por combate contra el demonio del
  // corazón. La Tribulación ya no es una prueba de estadísticas: mide
  // coherencia entre la Semilla del Corazón del Dao y lo que se responde bajo
  // presión. Ver CONTRATO UI · CULTIVO, puntos 9 y 10.
  // ======================================================================

  // Paso 1 · consagración formal de la Gran Perfección. Fija el hito
  // irreversible: a partir de aquí gastar qi ya no lo revierte.
  alcanzarGranPerfeccion() {
    const p = this.player;
    p.granPerfeccionLianQi = true;
    this.bloque("ascension",
`El vaso no admite una gota más. Por primera vez el qi no empuja hacia afuera:
se queda quieto, completo, como agua que ya encontró la forma del cuenco.
LIANQI · GRAN PERFECCIÓN.
Has percibido, has hecho circular, has contenido y has refinado. El camino del
vaso termina aquí: ninguna meditación más lo hará crecer.
Lo que viene no se mide en qi. MEDITA de nuevo cuando estés listo para mirarte.`);
    this.autoguardar();
    this.actualizarPanel();
    this.actualizarBarra();
  }

  // Paso 2 · Iluminación. Secuencia introspectiva sobre el motor de elección
  // múltiple ya existente. No hay respuesta correcta ni puntuación moral.
  opcionesIluminacion(pregunta) {
    const disponibles = pregunta.opciones.filter(op => !op.si || op.si(this));
    return disponibles.map((op, i) => ({
      valor: String(i + 1), insignia: `${i + 1})`, texto: op.texto, temas: op.temas || {},
    }));
  }

  puntuacionRecuerdoEspejo(plantilla, acciones) {
    const requeridos = plantilla.requiere || [];
    const alguno = plantilla.requiereAlguna || [];
    const usados = [];

    for (const tipo of requeridos) {
      const candidatos = acciones.filter(a => a.tipo === tipo);
      if (!candidatos.length) return null;
      usados.push(candidatos.slice().sort((a, b) => (b.importancia - a.importancia) || (b.orden - a.orden))[0]);
    }
    if (alguno.length) {
      const candidatos = acciones.filter(a => alguno.includes(a.tipo));
      if (!candidatos.length) return null;
      usados.push(candidatos.slice().sort((a, b) => (b.importancia - a.importancia) || (b.orden - a.orden))[0]);
    }
    if (!usados.length) return null;

    // La puntuación sólo elige QUÉ recuerdo merece volver. No interpreta su
    // moralidad ni su Dao: importancia + cercanía narrativa.
    const importancia = usados.reduce((n, e) => n + (e.importancia || 1), 0);
    const ultimoOrden = Math.max(...usados.map(e => e.orden || 0));
    return { importancia, ultimoOrden, eventos: usados };
  }

  resolverReflexionEspejo() {
    const acciones = this.obtenerRecuerdosParaIluminacion({ limite: 24 });
    let mejor = null;
    for (let i = 0; i < REFLEXIONES_ESPEJO.length; i++) {
      const plantilla = REFLEXIONES_ESPEJO[i];
      const puntuacion = this.puntuacionRecuerdoEspejo(plantilla, acciones);
      if (!puntuacion) continue;
      const candidato = { plantilla, ...puntuacion, indice: i };
      if (!mejor
          || candidato.importancia > mejor.importancia
          || (candidato.importancia === mejor.importancia && candidato.ultimoOrden > mejor.ultimoOrden)
          || (candidato.importancia === mejor.importancia && candidato.ultimoOrden === mejor.ultimoOrden && candidato.indice < mejor.indice)) {
        mejor = candidato;
      }
    }
    return mejor;
  }

  resolverPreguntaIluminacion(base) {
    if (!base || base.id !== "espejo") return base;
    const recuerdo = this.resolverReflexionEspejo();
    if (!recuerdo) return base;
    return {
      ...base,
      id: `espejo:${recuerdo.plantilla.id}`,
      contexto: recuerdo.plantilla.contexto,
      opciones: [...recuerdo.plantilla.opciones, ...base.opciones],
      recuerdoAcciones: recuerdo.eventos.map(e => e.id),
    };
  }

  // Suma de afinidades temáticas; el tema con más puntos es la Semilla. El
  // empate se resuelve con ORDEN_DESEMPATE_DAO, que es dato, no lógica ad hoc.
  semillaDesdeTemas(acumulado) {
    let mejor = null, mejorPuntos = -1;
    for (const tema of ORDEN_DESEMPATE_DAO) {
      const puntos = acumulado[tema] || 0;
      if (puntos > mejorPuntos) { mejor = tema; mejorPuntos = puntos; }
    }
    return mejorPuntos > 0 ? mejor : "superacion";
  }

  iniciarIluminacion() {
    this.salida("=== ILUMINACIÓN ===", "destacado");
    this.preguntaIluminacion(0, {}, []);
  }

  preguntaIluminacion(indice, acumulado, respuestas = []) {
    if (indice >= PREGUNTAS_ILUMINACION.length) return this.cerrarIluminacion(acumulado, respuestas);
    const base = PREGUNTAS_ILUMINACION[indice];
    const pregunta = this.resolverPreguntaIluminacion(base);
    const opciones = this.opcionesIluminacion(pregunta);
    this.preguntarEleccionMultiple({
      titulo: `ILUMINACIÓN · ${pregunta.titulo || `${indice + 1}`}`,
      contexto: pregunta.contexto,
      contextoEnBloque: true,
      pregunta: pregunta.pregunta,
      opciones,
      marcador: `(${opciones.map(o => o.valor).join("/")})`,
      hint: opciones.map(o => o.valor).join(", "),
      callback: (r) => {
        const elegida = opciones.find(o => o.valor === r.trim()) || opciones[0];
        const suma = { ...acumulado };
        for (const [tema, peso] of Object.entries(elegida.temas)) suma[tema] = (suma[tema] || 0) + peso;
        const nuevaRespuesta = {
          id: pregunta.id,
          texto: elegida.texto,
          temas: { ...elegida.temas },
          ...(pregunta.recuerdoAcciones ? { recuerdoAcciones: [...pregunta.recuerdoAcciones] } : {}),
        };
        this.preguntaIluminacion(indice + 1, suma, [...respuestas, nuevaRespuesta]);
      },
    });
  }

  cerrarIluminacion(acumulado, respuestas = []) {
    const p = this.player;
    const semilla = this.semillaDesdeTemas(acumulado);
    const info = TEMAS_DAO[semilla];
    p.iluminacion = {
      alcanzada: true,
      semillaCorazonDao: semilla,
      respuestas: Array.isArray(respuestas) ? respuestas : [],
    };
    p.comprension += 2;
    this.bloque("ascension",
`Las preguntas dejan de llegar.
Las respuestas también pierden sus palabras, pero algo permanece debajo de ellas:
una dirección a la que tus decisiones regresan una y otra vez.

Tu respiración vuelve. En algún lugar entre el corazón y el dantian, esa
inclinación adquiere por primera vez una forma.

ILUMINACIÓN ALCANZADA.
SEMILLA DEL CORAZÓN DEL DAO · ${info.nombre.toUpperCase()}
«${info.lema}»

No es tu Dao. Todavía no.
Una semilla no contiene la forma completa del árbol. Sólo la dirección en la
que intentará crecer.

(+2 comprensión — total ${p.comprension})`);
    this.autoguardar();
    this.actualizarPanel();
    this.actualizarBarra();
  }

  // Paso 3 · Tribulación del Corazón. Dos situaciones: una atada a la Semilla
  // obtenida, otra común. Se supera con coherencia, no con estadísticas.
  iniciarTribulacionCorazon() {
    const p = this.player;
    const semilla = p.iluminacion?.semillaCorazonDao || "superacion";
    const conflicto = CONFLICTOS_TRIBULACION[semilla] || CONFLICTOS_TRIBULACION.superacion;
    const info = TEMAS_DAO[semilla] || TEMAS_DAO.superacion;
    this.salida("=== TRIBULACIÓN DEL CORAZÓN ===", "destacado");
    this.salida(`Dijiste de ti mismo: ${info.nombre}. «${info.lema}»\nLa niebla lo escuchó, y ahora quiere ver si es verdad.`);
    this.situacionTribulacion(conflicto, 0, semilla);
  }

  situacionTribulacion(conflicto, coherentes, semilla) {
    const opciones = conflicto.opciones.map((op, i) => ({
      valor: String(i + 1), insignia: `${i + 1})`, texto: op.texto, coherente: !!op.coherente,
    }));
    this.preguntarEleccionMultiple({
      contexto: [conflicto.escena],
      pregunta: "¿Qué haces?",
      opciones,
      marcador: `(${opciones.map(o => o.valor).join("/")})`,
      hint: opciones.map(o => o.valor).join(", "),
      callback: (r) => {
        const elegida = opciones.find(o => o.valor === r.trim()) || opciones[0];
        const suma = coherentes + (elegida.coherente ? 1 : 0);
        if (conflicto !== PRESION_TRIBULACION) return this.situacionTribulacion(PRESION_TRIBULACION, suma, semilla);
        this.resolverTribulacionCorazon(suma, semilla);
      },
    });
  }

  resolverTribulacionCorazon(coherentes, semilla) {
    const p = this.player;
    const info = TEMAS_DAO[semilla] || TEMAS_DAO.superacion;
    if (coherentes >= 2) {
      p.tribulacionCorazon = { superada: true, pendienteReintento: false };
      this.bloque("ascension",
`La niebla no se rompe: se aparta, como quien deja pasar a alguien que ya no
necesita permiso.
TRIBULACIÓN DEL CORAZÓN · SUPERADA.
No respondiste bien ni mal. Respondiste igual que cuando nadie apretaba, y eso
es todo lo que se te pedía. Tu ${info.nombre} resiste el peso de sí misma.
El cuello de botella está listo. MEDITA con el vaso al tope para fundar.`);
      this.autoguardar();
      this.actualizarPanel();
      this.actualizarBarra();
      return;
    }
    // No superarla no destruye al personaje ni borra la Semilla: deja el hito
    // abierto. La condición exacta de reintento queda deliberadamente sin
    // definir en esta versión (gancho narrativo abierto) — mientras tanto,
    // pendienteReintento impide que el siguiente MEDITAR la vuelva a lanzar.
    p.tribulacionCorazon = { superada: false, pendienteReintento: true };
    p.comprension += 1;
    this.bloque("ascension",
`La niebla no te ataca. Es peor: se queda quieta, esperando, y lo que se quiebra
lo haces tú solo.
TRIBULACIÓN DEL CORAZÓN · NO SUPERADA.
Dijiste ${info.nombre}, y bajo presión elegiste otra cosa. No es un pecado ni un
fracaso moral: es una grieta entre lo que crees ser y lo que haces cuando
aprieta. La Fundación se construye sobre eso; todavía no aguantaría.
La Semilla sigue contigo. No la perdiste; aún no la mereciste del todo.
(+1 comprensión — total ${p.comprension})
Vuelve cuando lo que digas de ti y lo que hagas sean la misma frase.`);
    this.autoguardar();
    this.actualizarPanel();
    this.actualizarBarra();
  }


  triunfoZhuji() {
    const p = this.player;
    // La Píldora de Fundación ya no se tritura en un combate: se consume aquí,
    // al fundar, para que siga siendo la vía alternativa al umbral de comprensión.
    if (p.inventario.includes("pildora_fundacion")) {
      p.inventario.splice(p.inventario.indexOf("pildora_fundacion"), 1);
      this.salida("Trituras la Píldora de Fundación entre los dientes. Sabe a trueno y a invierno.", "destacado");
    }
    // Instantánea de cierre ANTES de mutar el reino: el historial guarda sólo
    // lo ya cerrado, nunca el presente (el presente es siempre player).
    const cierre = {
      reino: "LianQi",
      arco: arcoActual(p),
      calidadFundacion: null,
      iluminacion: p.iluminacion?.alcanzada === true,
      semilla: p.iluminacion?.semillaCorazonDao || null,
      turno: this.turnoGlobal || 0,
    };
    p.reino = "ZhuJi"; p.etapa = 1;
    p.qi_max = 140; p.qi = 70;
    p.max_hp += 15; p.hp = p.max_hp;
    p.ataque += 2;
    p.metodo = "la Grulla Serena";
    const fundacion = this.evaluarFundacion();
    p.calidad_fundacion = fundacion.calidad;
    if (fundacion.calidad === "Estable") { p.qi_max += 5; p.max_hp += 5; }
    if (fundacion.calidad === "Impecable") { p.qi_max += 15; p.max_hp += 8; p.defensa += 1; }
    if (fundacion.calidad === "Celestial") { p.qi_max += 25; p.max_hp += 12; p.ataque += 1; p.defensa += 1; }
    p.hp = p.max_hp;
    p.titulo = `cultivador de Fundación ${fundacion.calidad}`;
    cierre.calidadFundacion = fundacion.calidad;
    p.historialReinos = p.historialReinos || [];
    p.historialArcos = p.historialArcos || [];
    p.historialReinos.push({ ...cierre });
    p.historialArcos.push({ ...cierre });
    const puntosGanados = this.sincronizarPuntosTecnica();
    this.salida("Fundación " + fundacion.calidad + ". Sentido Divino disponible.", "ascension");
    const sintesis = []; this.desbloquearHibridas(sintesis);
    if (sintesis.length) this.salida(sintesis.join("\n"));
    this.autoguardar();
  }


  cmd_atacar(args) {
    const criaturasVivas = this.vivos.filter(m => m.hp > 0);
    if (!criaturasVivas.length) {
      const cadaver = this.resolverCadaver(args);
      if (cadaver) return `${capitalizarUI(this.etiquetaCadaver(cadaver))} ya no puede combatir. Ya venciste a esa criatura; puedes MIRAR sus restos.`;
      return "No hay nada que atacar aquí.";
    }
    const objetivo = args.length ? resolverMobPorArgs(criaturasVivas, args) : criaturasVivas[0];
    if (!objetivo) {
      const cadaver = this.resolverCadaver(args);
      if (cadaver) return `${capitalizarUI(this.etiquetaCadaver(cadaver))} ya no puede combatir. Elige una criatura viva.`;
      return "No hay una criatura viva que coincida con ese objetivo. Si hay varias iguales, usa su número: ATACAR <nombre> 1, 2...";
    }
    this.entrarCombate(objetivo, objetivo.mob_id,objetivo.arc1_muneco?'practica':null);
    return `¡${etiquetaMob(objetivo)} se yergue ante ti!`;
  }

  cmd_defender() {
    return "Adoptas una guardia prudente, pero aquí nadie te está atacando. DEFENDER cobra sentido dentro del combate.";
  }





  cmd_hablar(args) {
    globalThis.ASTRA_SELF_INTRODUCTION_B22?.cancelPending?.(this);
    const sala = this.rooms[this.pos];
    const npcs = this.npcsEnSala(this.pos);
    if (!npcs.length) return "No hay nadie con quien hablar.";
    if (args.length) {
      const npc=resolverNPC(args.join(" "),npcs);
      if (npc) {
        const registro=this.gestionarMisionesNpc(npc);
        if (registro) return registro;
        if(!astraGeneralNative.authorizeSpeak(this,npc,registro)) return this.dialogo(npc);
        if(astraGeneralNative.openKnownOptions(this,npc)) return "";
        let respuesta=null;
        try {
          respuesta=globalThis.ASTRA_SELF_INTRODUCTION_B22?.respond({runtime:this,npcDefinitions:NPC_DEF,npcId:npc,nativeMissionResult:registro});
        } catch {}
        return respuesta?.handled === true ? respuesta.text : this.dialogo(npc);
      }
      return `Aquí puedes hablar con: ${npcs.map(n => NOMBRES_NPC[n]).join(", ")}.`;
    }
    return "¿Hablar con quién? Aquí: " + npcs.map(n => NOMBRES_NPC[n]).join(", ") + ".";
  }

  // ENTREGAR (alias DAR): turno explícito para cerrar encargos, en vez de
  // depender solo de que HABLAR complete lo que esté listo. Sirve además
  // para consultar en personaje por qué un encargo no se cerró todavía.
  cmd_entregar(args) {
    const sala = this.rooms[this.pos];
    const npcs = this.npcsEnSala(this.pos);
    if (!npcs.length) return "No hay nadie aquí a quien entregarle nada.";

    let objetivo = null;
    if (args.length) {
      objetivo = resolverNPC(args.join(" "),npcs);
      if (!objetivo) return `Aquí no hay nadie que responda a "${args.join(" ")}".`;
    } else if (npcs.length === 1) {
      objetivo = npcs[0];
    } else {
      return "¿A quién quieres entregarle algo? Aquí: " + npcs.map(n => NOMBRES_NPC[n]).join(", ") + ".";
    }

    const propias = Object.keys(this.quests).filter(qid => {
      if (this.quests[qid] !== "activa") return false;
      const q = QUESTS[qid];
      return q && this.valorMision(q, "entrega", null) === objetivo;
    });

    const listas = propias.filter(qid => QUESTS[qid].listo(this));
    if (listas.length) {
      const out = [];
      for (const qid of listas) out.push(...this.completarMision(qid));
      return out.join("\n");
    }

    if (propias.length) {
      const q = QUESTS[propias[0]];
      const progreso = this.valorMision(q, "progreso", "todavía no está listo");
      const frase = FRASES_MISION_INCOMPLETA[objetivo] || FRASES_MISION_INCOMPLETA.default;
      return frase(progreso);
    }

    return FRASES_SIN_ENCARGO[objetivo] || FRASES_SIN_ENCARGO.default;
  }

  cmd_comprar(args) {
return "Comercio pendiente de implementación canónica 3C.";
  }

  cmd_tienda() {
return "Comercio pendiente de implementación canónica 3C.";
  }

  cmd_contribucion() {
    this.normalizarFacciones();
    const out = ["— LIBRO MAYOR DE FACCIONES —"];
    for (const [id, registro] of Object.entries(this.player.facciones || {})) {
      const faccion = FACCIONES[id];
      if (!faccion) continue;
      const rango = this.rangoFaccion(id);
      const siguiente = faccion.rangos.find(r => r.merito > registro.merito);
      out.push(`${faccion.nombre.toUpperCase()} · ${faccion.tipo}`);
      out.push(`  Estado: ${capitalizarUI(registro.estado)} · Rango: ${rango.nombre}`);
      out.push(`  Contribución disponible: ${registro.saldo} · Mérito histórico: ${registro.merito}`);
      out.push(siguiente ? `  Próximo reconocimiento: ${siguiente.nombre} (${siguiente.merito - registro.merito} de mérito).`
        : "  Has alcanzado el reconocimiento máximo previsto para este arco.");
      const recientes = (registro.historial || []).slice(-3);
      if (recientes.length) out.push("  Movimientos recientes: " + recientes.map(m => `${m.tipo === "gasto" ? "−" : "+"}${m.cantidad} ${m.motivo}`).join(" · "));
    }
    out.push("El saldo puede gastarse; el mérito nunca disminuye y determina rangos y promociones. SERVICIOS muestra los canjes de la facción local.");
    return out.join("\n");
  }

  cmd_servicios() {
    const fac=FACCIONES[FACCION_PRINCIPAL],reg=this.registroFaccion();
    const lista=Object.entries(fac.servicios).map(([id,s])=>
      `  ${id.toUpperCase()}: ${s.nombre} · ${s.coste} contribución · mérito ${s.merito}.`);
    return [`Servicios de ${fac.nombre}. Estado: ${reg.estado}. Saldo ${reg.saldo}; mérito ${reg.merito}.`,
      ...lista,'CANJEAR <servicio> requiere membresía, saldo y mérito propios.'].join('\n');
  }

  cmd_canjear(args = []) {
    const id=quitaAcentos(args.join('_').toLowerCase()),s=FACCIONES[FACCION_PRINCIPAL].servicios[id];
    if(!s)return 'Servicio desconocido. Consulta SERVICIOS.';
    const reg=this.registroFaccion();
    if(reg.estado!=='miembro')return 'Necesitas membresía activa para usar los servicios.';
    if(reg.merito<s.merito)return `Necesitas mérito ${s.merito}; tienes ${reg.merito}.`;
    const gasto=this.gastarContribucion(s.coste,`Canje: ${s.nombre}`);
    if(!gasto.ok)return gasto.texto;
    this.player.inventario.push(s.item);
    return `Retiras ${s.nombre}. Contribución restante: ${reg.saldo}; mérito histórico: ${reg.merito}.`;
  }

  cmd_oficios() { this.abrirOficios(); return ""; }
  cmd_cultivo() { this.abrirCultivo(); return ""; }


  cmd_recetas() { this.abrirOficios("alquimia"); return ""; }

  cmd_alquimia(args) {
    this.abrirInteraccionOficio("alquimia", args || []);
    return "";
  }

  cmd_misiones() {
    this.abrirMisiones();
    return "";
  }

  cmd_estudiar(args = []) {
const item = args.length ? this.resolverItem(args, "inv") : null;
    if (item && ITEMS[item]?.tipo === "manual") return this.aprenderManual(item)[0].filter(Boolean).join("\n");
    return "La enseñanza institucional está pendiente de implementación canónica 3C.";
  }

  cmd_injertar(args = []) {
return "Injerto pendiente de implementación canónica 3C.";
  }

  cmd_hoja() { this.mostrarHoja(); }

  cmd_dao() {
return "Consulta CULTIVO para ver tu historial de cultivo.";
  }

  cmd_glosario() {
    return `— GLOSARIO DE LA GRULLA BLANCA —
Qi: aliento espiritual que circula por cuerpo, técnicas y mundo.
Raíz espiritual: afinidad innata que modifica costes y estilo de cultivo.
Raíz secundaria: un único injerto permanente; exige método, semilla y preparación. Consulta AFINIDAD.
Concordancia: secuencia breve de dos artes elementales; concede una bonificación porcentual pequeña y reinicia la cadena al completarse.
Definitiva (arte híbrida): confluencia de dos elementos dominados; cuesta más qi, golpea más fuerte y cierra la cadena de concordancia. Su estabilidad depende de tus raíces y se revela en ZhuJi.
Inestabilidad elemental: riesgo de qi perdido y heridas al usar artes avanzadas incompatibles; se anuncia en HOJA.
LianQi: Refinamiento de Qi; cuatro etapas de preparación mortal.
ZhuJi: Establecimiento de Fundación; el cultivador construye la base de todos sus reinos futuros.
Meridianos: canales internos; heridos reducen el qi obtenido al meditar.
AOE: técnica de área; arrastra y golpea a todos los hostiles de la sala, pero rinde menos en duelo.
Sentido divino: percepción espiritual abierta en ZhuJi.
Comprensión: entendimiento del mundo y de uno mismo; abre puertas sin fuerza bruta.
Contribución: saldo de una facción que se obtiene sirviéndola y puede gastarse en sus servicios.
Mérito histórico: toda la contribución ganada para una facción; nunca disminuye y decide rangos, permisos y promociones.
Prestigio: cómo circula tu nombre entre discípulos y ancianos.
Corazón del Dao: motivos y convicciones que resisten —o alimentan— la tribulación.`;
  }

  cmd_promocion() {
return "Promoción pendiente de implementación canónica 3C.";
  }

  cmd_guardar() { this.menuGuardar(); }

  cmd_cargar() { this.menuCargar(); }

  cmd_tecnica() {
    const conocidas = Object.keys(this.player.tecnicas).join(", ");
    return `Las técnicas se despliegan en combate: "tecnica <nombre>".\nConoces: ${conocidas || "ninguna"}. La maestría crece usándolas.`;
  }

  cmd_huir() { return "No hay de qué huir... todavía."; }

  // ---------- muerte y salida ----------

  cmd_afinidad() {
    const p = this.player;
    const novedades = [];
    this.desbloquearHibridas(novedades);
    if (novedades.length) this.salida(novedades.join("\n"));

    const crear = (tag, clase, texto = null) => {
      const el = document.createElement(tag);
      if (clase) el.className = clase;
      if (texto !== null) el.textContent = capitalizarSegmentosUI(texto);
      return el;
    };
    const elementoInfo = el => ELEMENTO_UI[el] || { simbolo: "◇", nombre: capitalizarUI(el || "desconocido") };
    const claseElemento = elementos => `afin-elemento-${elementos.length > 1 ? "mixta" : elementos[0]}`;
    const bloque = (titulo, contador, abierto = false) => {
      const det = crear("details", "afinidad-bloque");
      det.open = abierto;
      const sum = crear("summary", null);
      sum.append(titulo, " ", crear("span", "afinidad-contador", contador));
      const lista = crear("div", "afinidad-lista");
      det.append(sum, lista);
      return [det, lista];
    };
    const estadoCheck = (ok, texto) => {
      const span = crear("span", ok ? "ok" : "falta", `${ok ? "✓" : "○"} ${texto}`);
      return span;
    };

    const ficha = crear("section", "afinidad-ficha");
    const cabecera = crear("header", "afinidad-cabecera");
    cabecera.append(
      crear("h3", null, "Resonancia de Raíces"),
      crear("p", null, `${p.reino} · ${reinoExacto(p, "LianQi") ? `Etapa ${p.etapa}/${totalEtapas(p.reino)}` : "Fundación establecida"} · Comprensión ${p.comprension}`)
    );
    ficha.appendChild(cabecera);

    const raices = crear("div", "afinidad-raices");
    const tarjetaRaiz = (elemento, tipo) => {
      if (!elemento) {
        const vacia = crear("div", "afinidad-raiz afinidad-vacia");
        vacia.append(crear("div", "afinidad-raiz-tipo", tipo), crear("div", "afinidad-raiz-nombre", "Sin raíz secundaria"),
          crear("div", "afinidad-raiz-efecto", "El injerto es opcional y solo puede realizarse una vez."));
        return vacia;
      }
      const info = elementoInfo(elemento);
      const tarjeta = crear("div", `afinidad-raiz afin-elemento-${elemento}`);
      tarjeta.append(crear("div", "afinidad-raiz-tipo", tipo),
        crear("div", "afinidad-raiz-nombre", `${info.simbolo} ${info.nombre}`),
        crear("div", "afinidad-raiz-efecto", tipo === "RAÍZ PRINCIPAL"
          ? "Aprendizaje 100% · −1 qi · +1 daño ofensivo"
          : "Aprendizaje 90% · −1 qi · +1 daño ofensivo"));
      return tarjeta;
    };
    raices.append(tarjetaRaiz(p.raiz, "RAÍZ PRINCIPAL"), tarjetaRaiz(p.raiz_secundaria, "RAÍZ SECUNDARIA"));
    ficha.appendChild(raices);
    ficha.appendChild(crear("div", "afinidad-resumen",
      "Artes ajenas: aprendizaje 75%. Confluencia parcial: 80%. Confluencia doble: 100%. Una incompatibilidad solo genera riesgo en artes avanzadas; maestría y comprensión ayudan a estabilizarla."));

    const tecnicas = Object.keys(p.tecnicas).filter(tid => TECNICAS[tid]);
    const [detArtes, listaArtes] = bloque("Tus artes", `${tecnicas.length} conocidas`, true);
    for (const tid of tecnicas) {
      const t = TECNICAS[tid], elementos = t.elementos || [t.elemento], conf = this.statsTecnica(tid);
      const afin = this.afinidadTecnica(tid);
      const fila = crear("div", `afinidad-tecnica ${claseElemento(elementos)}`);
      fila.append(crear("div", "afinidad-simbolo", elementos.map(e => elementoInfo(e).simbolo).join("+")));
      const centro = crear("div", null);
      centro.append(crear("div", "afinidad-nombre", t.name),
        crear("div", "afinidad-detalle", `${elementos.map(e => elementoInfo(e).nombre).join(" + ")} · ${ROL_TECNICA[t.tipo] || t.tipo} · aprendizaje ${Math.round(this.ritmoTecnica(tid) * 100)}%`));
      const estado = crear("div", `afinidad-estado${conf.riesgo ? " inestable" : " lista"}`,
        conf.riesgo ? `⚠ ${conf.riesgo}% riesgo` : afin === "parcial" ? "◐ parcial segura" : "✓ estable");
      fila.append(centro, estado);
      listaArtes.appendChild(fila);
    }
    if (!tecnicas.length) listaArtes.appendChild(crear("div", "afinidad-nota", "Todavía no conoces ninguna técnica."));
    ficha.appendChild(detArtes);

    const secuencias = secuenciasDisponibles(tecnicas);
    const [detSec, listaSec] = bloque("Secuencias disponibles", `${secuencias.length} ejecutables`, false);
    for (const [par, combo] of secuencias) {
      const [desde, hacia] = par.split(":");
      const fila = crear("div", `afinidad-combo afin-elemento-${hacia}`);
      fila.append(crear("div", "afinidad-simbolo", `${elementoInfo(desde).simbolo}→${elementoInfo(hacia).simbolo}`));
      const centro = crear("div", null);
      centro.append(crear("div", "afinidad-nombre", combo.nombre),
        crear("div", "afinidad-detalle", `${elementoInfo(desde).nombre} → ${elementoInfo(hacia).nombre} · mismo rival · técnicas consecutivas · apoyos: ${porcentajeUI(CONCORDANCIA.apoyo)}% más de efecto`));
      fila.append(centro, crear("div", "afinidad-estado lista", textoBonoConcordancia(combo, true)));
      listaSec.appendChild(fila);
    }
    if (!secuencias.length) listaSec.appendChild(crear("div", "afinidad-nota", "Aún no conoces dos artes que formen una secuencia (la primera debe ser una técnica pura)."));
    listaSec.appendChild(crear("div", "afinidad-nota", "Atacar normalmente, defender, beber o cambiar de objetivo rompe la preparación; consultar no la rompe."));
    listaSec.appendChild(crear("div", "afinidad-nota", "Al completarse una secuencia el contador vuelve a cero: para repetirla hay que preparar de nuevo. Una técnica que no ataca gana el bono según su rol (absorción, defensa, evasión o control), no según el par."));
    listaSec.appendChild(crear("div", "afinidad-nota", "Las Definitivas reciben la secuencia con cualquiera de sus elementos, pero no preparan la siguiente."));
    ficha.appendChild(detSec);

    const hibridas = Object.entries(TECNICAS).filter(([, t]) => t.elementos);
    const conocidasHibridas = hibridas.filter(([tid]) => p.tecnicas[tid]).length;
    const [detHib, listaHib] = bloque("Definitivas", `${conocidasHibridas}/${hibridas.length} comprendidas`, false);
    for (const [tid, t] of hibridas) {
      const conocida = !!p.tecnicas[tid];
      const requisitos = t.elementos.map(e => ({ elemento: e, ok: this.dominaElemento(e) }));
      const lista = reinoAlMenos(p, "ZhuJi") && requisitos.every(r => r.ok);
      const fila = crear("div", "afinidad-hibrida afin-elemento-mixta");
      fila.append(crear("div", "afinidad-simbolo", t.elementos.map(e => elementoInfo(e).simbolo).join("+")));
      const centro = crear("div", null);
      centro.append(crear("div", "afinidad-nombre", conocida ? t.name : `Definitiva ${t.elementos.map(e => elementoInfo(e).nombre).join(" + ")}`));
      const checks = crear("div", "afinidad-check");
      checks.append(estadoCheck(reinoAlMenos(p, "ZhuJi"), "ZhuJi"));
      for (const req of requisitos) checks.append(" · ", estadoCheck(req.ok, `${elementoInfo(req.elemento).nombre} mayor`));
      centro.appendChild(checks);
      fila.append(centro, crear("div", `afinidad-estado${conocida || lista ? " lista" : ""}`,
        conocida ? "COMPRENDIDA" : lista ? "LISTA" : "EN PROGRESO"));
      listaHib.appendChild(fila);
    }
    listaHib.appendChild(crear("div", "afinidad-nota", "Las Definitivas (artes híbridas) se revelan al alcanzar ZhuJi y maestría mayor en una técnica pura de cada elemento. Cuestan más qi que una técnica pura, pero golpean más fuerte por lanzamiento."));
    ficha.appendChild(detHib);

    ficha.appendChild(crear("div", "afinidad-nota", "Injerto pendiente de implementación canónica 3C."));
    this.contenido.appendChild(ficha); this.abajo();
  }

  mostrarIndiceAyuda() {
    const lista = AYUDA_SECCIONES.map((sec, i) => `${i + 1}) ${sec.nombre}`).join("\n");
    return `=== AYUDA DE LA GRULLA BLANCA ===\n${lista}\n\nEscribe AYUDA <número o nombre> para abrir una sección.\nPor ejemplo: AYUDA 5 · AYUDA COMBATE · AYUDA IMPUREZAS`;
  }

  cmd_ayuda(args = []) {
    if (!args.length) return this.mostrarIndiceAyuda();
    const consulta = args.join(" ");
    const { seccion, candidatas } = buscarSeccionAyuda(consulta);
    if (candidatas) {
      const opciones = candidatas.map(sec => `«${sec.nombre}»`).join(", ");
      return `«${consulta}» podría ser varias cosas: ${opciones}. Sé más específico o usa el número (AYUDA para ver el índice).`;
    }
    if (!seccion) return `No encuentro una ficha para «${consulta}». Escribe AYUDA para ver el índice numerado.`;
    if (seccion.condicion) { this.mostrarAyudaCondicion(seccion.condicion); return; }
    this.mostrarSeccionAyuda(seccion);
    return;
  }

  // Diagnóstico ejecutable desde dentro del juego. No altera la partida en
  // curso: cada caso trabaja sobre un Juego de laboratorio aparte.
  cmd_diagnostico(args = []) {
    const filtro = (args || []).join(" ").trim() || null;
    const r = PRUEBAS.correr(filtro);
    this.salida("=== DIAGNÓSTICO ===", "destacado");
    for (const l of r.lineas) this.salida(l, l.startsWith("  FALLA") ? "error" : null);
    this.salida(r.fallos ? `${r.fallos} fallo(s) de ${r.total}.` : `${r.total} casos, todo en verde.`,
                r.fallos ? "error" : "destacado");
  }


  // ------------------------------------------------------------------------
  //  7.6  DIÁLOGOS · sólo devuelven texto y mueven banderas; ninguno toca el
  //       DOM
  //
  //  Índice por tema (bloque chico, no hace falta subdividir más):
  //    despacho por npc       dialogo


  //                           dialogoFan, dialogoAlmacenista,
  //                           dialogoEcoShen, dialogoRechazado
  // ------------------------------------------------------------------------

  dialogo(npc) {
return "No hay conversación disponible en esta fase.";
  }






























  // ------------------------------------------------------------------------
  //  7.7  INTERFAZ · todo lo que escribe en pantalla. Nada de acá decide
  //       reglas
  //
  //  Índice por tema:
  //    texto base             addLine, salida, eco, abajo, bloque, avisoAuto
  //    avisos puntuales        mostrarAccionesCombate, mostrarConsagracion,
  //                           mostrarQiAgotado, mostrarAyudaCondicion,
  //                           mostrarSeccionAyuda, mostrarAprendizajeManual,
  //                           mostrarFichaCriatura
  //    panel lateral / vida    actualizarBarra, actualizarVitales,
  //                           actualizarMinimapa, chip, chipSlot,
  //                           actualizarPanel, nuevaFicha, fLn, fSpans,
  //                           fSeccion, mostrarHoja, mostrarEquipo
  //    ventana: atlas          abrirAtlas, cerrarAtlas, renderAtlas,
  //                           detalleAtlas, dibujarListaAtlas,
  //                           actualizarSelectorAreaAtlas
  //    Atlas por áreas (2B)    reiniciarVistaAtlas, vistaAtlasFisica,
  //                           sincronizarVistaAtlas, areasConocidas,
  //                           areaAtlasNavegable, salaBaseDeArea,
  //                           cambiarVistaAtlas, elegirAreaAtlas,
  //                           alternarAcordeonAtlas, cambiarPestanaAtlas
  //    ventana: meridianos     abrirMeridianos, cerrarMeridianos,
  //                           renderMeridianos
  //    ventana: misiones       actualizarBotonMisiones, abrirMisiones,
  //                           cerrarMisiones, contraerMisiones,
  //                           renderMisiones
  //    ventana: oficios        abrirOficios, cerrarOficios, elementoOficio,
  //                           tarjetaRangoOficio, renderOficios,
  //                           renderExamen, renderAlquimia
  // ------------------------------------------------------------------------

  addLine(texto, clase) {
    const div = document.createElement("div");
    if (clase) div.className = clase;
    // El eco conserva lo que escribió el jugador; el resto es texto presentado por la interfaz.
    div.textContent = clase === "eco" ? texto : capitalizarUI(texto);
    this.contenido.appendChild(div);
    return div;
  }

  salida(texto, clase) {
    for (const l of String(texto).split("\n")) {
      if (clase) { this.addLine(l, clase); continue; }
      if (!l.trim()) { this.addLine("", "espacio"); continue; }
      const m = l.match(/^===\s*(.+?)\s*===$/);
      if (m) { this.addLine(m[1], "titulo"); continue; }
      if (l.startsWith("(sentido divino)")) { this.addLine(l, "sentido"); continue; }
      if (/^Gente:/.test(l)) { this.addLine(l, "sala-meta sala-gente"); continue; }
      if (/^Salidas:/.test(l)) { this.addLine(l, "sala-meta sala-salidas"); continue; }
      if (/^Criaturas:/.test(l)) { this.addLine(l, "sala-meta sala-criaturas"); continue; }
      if (/^Ves:/.test(l)) { this.addLine(l, "sala-meta sala-objetos"); continue; }
      if (/^En el suelo:/.test(l)) { this.addLine(l, "sala-meta sala-objetos"); continue; }
      if (/^Plantas:/.test(l)) { this.addLine(l, "sala-meta sala-plantas"); continue; }
      if (/^Restos:/.test(l)) { this.addLine(l, "sala-meta sala-restos"); continue; }
      if (/^Movimiento reciente:/.test(l)) { this.addLine(l, "sala-meta sala-movimiento"); continue; }
      if (/^\s*⚔ COMBATE/.test(l)) { this.addLine(l.trimStart(), "combate-inicio"); continue; }
      if (/^\s*\[ACCIONES DE COMBATE\]$/.test(l)) { this.mostrarAccionesCombate(); continue; }
      if (/^\s*══ FASE/.test(l)) { this.addLine(l.trimStart(), "combate combate-fase"); continue; }
      if (/^\s*JEFE FINAL ·/.test(l)) { this.addLine(l.trimStart(), "combate combate-jefe-titulo"); continue; }
      if (/^\s*GRULLA ♥/.test(l)) { this.addLine(l.trimStart(), "combate combate-jefe-vitales"); continue; }
      if (/^\s*¡.+ha caído!/.test(l)) { this.addLine(l.trimStart(), "combate combate-caida"); continue; }
      if (/^\s*(?:\d+\)|-\s)/.test(l)) { this.addLine(l.trimStart(), "opcion"); continue; }
      if (/^\(\+/.test(l) || /^\+[0-9]/.test(l)) { this.addLine(l, "recompensa"); continue; }
      if (/^\[(?:Nuevos encargos|Nuevas misiones|Nueva misión|Misión completada|Nuevo rumor|Nuevas misiones descubiertas|Pendientes):/.test(l)) { this.addLine(l, "mision-resumen"); continue; }
      if (/^\(/.test(l) || /^\[.+\]$/.test(l)) { this.addLine(l, "sistema"); continue; }
      if (/^[—«]/.test(l.trimStart())) { this.addLine(l.trimStart(), "dialogo"); continue; }
      if (/^\s*TÚ ♥/.test(l)) { this.addLine(l.trimStart(), "combate combate-vitales"); continue; }
      if (l.startsWith("   ") && /(?:de daño|QUEMADO|CORTA|Inestabilidad)/.test(l)) { this.addLine(l, "combate combate-impacto"); continue; }
      if (l.startsWith("   ")) { this.addLine(l, "combate"); continue; }

      // caldo. —Si vas a entrenar..."): separar en dos bloques para que el
      // diálogo tome el estilo .dialogo en vez de fundirse en texto plano.
      // Sólo dispara tras un cierre de oración (. ! ? …) para no tocar
      // incisos con guión largo ("Sus gachas —juran los discípulos— curan…").
      const corte = l.match(/^([\s\S]*?[.!?…])\s+(—[\s\S]*)$/);
      if (corte) { this.addLine(corte[1], "linea"); this.addLine(corte[2], "dialogo"); continue; }
      if (/^✦/.test(l)) { this.addLine(l, "recompensa"); continue; }
      this.addLine(l, "linea");
    }
    this.abajo();
  }

  eco(txt) { this.addLine("> " + txt, "eco"); this.abajo(); }

  abajo() { this.terminal.scrollTop = this.terminal.scrollHeight; }

  bloque(clase, texto) {
    const div = document.createElement("div");
    div.className = clase;
    div.textContent = texto;
    this.contenido.appendChild(div);
    this.abajo();
  }

  avisoAuto() {
    this.avisoEl.textContent = "✓ autoguardado";
    clearTimeout(this._tAviso);
    this._tAviso = setTimeout(() => { this.avisoEl.textContent = ""; }, 2500);
  }

  // ---------- PACING: puertas y saturación ----------

  mostrarAccionesCombate() {
    if (!this.combate) return;
    const impactoBasico = this.combate.e
      ? probabilidadImpacto(this.combate.ef().ataque, this.combate.e.defensa, 20, this.combate.e.esquiva ?? ESQUIVA_INNATA)
      : 0;
    const panel = document.createElement("div");
    panel.className = "combate-acciones";
    const titulo = document.createElement("div");
    titulo.className = "combate-acciones-titulo";
    titulo.textContent = "ACCIONES DISPONIBLES";
    const lista = document.createElement("div");
    lista.className = "combate-acciones-lista";
    const acciones = [
      [`⚔ ATACAR · ${impactoBasico}%`, "atacar", "Golpear al objetivo actual; el porcentaje es tu probabilidad de impacto"],
      ["◇ DEFENDER", "defender", "Reducir el daño entrante y absorber algo de qi del enemigo"],
      ["氣 TÉCNICAS", "tecnicas", "Consultar tus técnicas sin consumir la ronda"],
      ["✚ BEBER", "beber", "Elegir un consumible disponible"],
      ["☰ HOJA", "hoja", "Consultar tu personaje"],
      ["▣ EQUIPO", "equipo", "Consultar lo que llevas puesto"],
      ["↩ HUIR", "huir", "Intentar abandonar el combate"],
    ];
    for (const [etiqueta, comando, ayuda] of acciones) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "combate-accion";
      boton.textContent = etiqueta;
      boton.setAttribute("title", ayuda);
      boton.setAttribute("aria-label", `${etiqueta}: ${ayuda}`);
      if (comando === "huir" && !this.combate.permitirHuir) {
        boton.disabled = true;
        boton.textContent = "↩ HUIR BLOQUEADO";
      } else {
        boton.addEventListener("click", () => {
          if (this.combate) enviarComando(comando);
          else this.salida("El combate ya terminó; esa orden quedó atrás.", "sistema");
        });
      }
      lista.appendChild(boton);
    }
    const ayuda = document.createElement("div");
    ayuda.className = "combate-acciones-ayuda";
    ayuda.textContent = "Teclado: ATACAR [nombre] · DEFENDER · TECNICA <nombre> · BEBER <objeto> · HOJA · EQUIPO · HUIR";
    panel.append(titulo, lista, ayuda);
    this.contenido.appendChild(panel);
    this.abajo();
  }

  mostrarConsagracion({ maxHpAnterior, ataqueAnterior, puntosGanados = 0 }) {
    const p = this.player;
    const panel = document.createElement("div");
    panel.className = "consagracion";

    const sello = document.createElement("div");
    sello.className = "consagracion-sello";
    sello.textContent = "✦ CONSAGRACIÓN ✦";
    panel.appendChild(sello);

    const rango = document.createElement("div");
    rango.className = "consagracion-rango";
    rango.textContent = reinoExacto(p, "LianQi") ? `${p.reino} · ETAPA ${p.etapa}/${totalEtapas(p.reino)}` : `${p.reino} · ETAPA ${p.etapa}`;
    panel.appendChild(rango);

    const relato = document.createElement("div");
    relato.className = "consagracion-relato";
    relato.textContent = "El vaso se ensancha y la nueva etapa queda sellada en tu respiración.";
    panel.appendChild(relato);

    const stats = document.createElement("div");
    stats.className = "consagracion-stats";
    for (const [etiqueta, valor] of [
      ["VIDA", `${p.hp}/${p.max_hp}`], ["QI", `${p.qi}/${p.qi_max}`], ["ATAQUE", String(p.ataque)]
    ]) {
      const stat = document.createElement("div");
      stat.className = "consagracion-stat";
      const nombre = document.createElement("span");
      nombre.textContent = etiqueta;
      const cifra = document.createElement("strong");
      cifra.textContent = valor;
      stat.append(nombre, cifra);
      stats.appendChild(stat);
    }
    panel.appendChild(stats);

    const ganancia = document.createElement("div");
    ganancia.className = "consagracion-ganancia";
    ganancia.textContent = `+${p.max_hp - maxHpAnterior} VIDA MÁX. · +${p.ataque - ataqueAnterior} ATAQUE · NUEVO VASO ${p.qi_max} QI${puntosGanados ? ` · +${puntosGanados} PUNTO DE TÉCNICA` : ""}`;
    panel.appendChild(ganancia);

    const nota = document.createElement("div");
    nota.className = "consagracion-nota";
    nota.textContent = "Tu cuerpo recién ensanchado necesita descanso.";
    panel.appendChild(nota);

    this.contenido.appendChild(panel);
    this.abajo();
  }

  mostrarQiAgotado(tipo = "agotada") {
    const vacia = tipo === "vacia";
    const panel = document.createElement("div");
    panel.className = `qi-aviso ${vacia ? "qi-vacia" : "qi-agotado"}`;

    const sello = document.createElement("div");
    sello.className = "qi-aviso-sello";
    sello.textContent = "◇ Vena espiritual";
    const titulo = document.createElement("div");
    titulo.className = "qi-aviso-titulo";
    titulo.textContent = vacia ? "Esta sala carece de qi cultivable" : "Qi de la sala agotado";
    const texto = document.createElement("div");
    texto.className = "qi-aviso-texto";
    texto.textContent = vacia
      ? "No hay una vena espiritual de la que puedas absorber energía."
      : "Has exprimido esta vena por ahora. Caminar no basta para renovarla.";
    panel.append(sello, titulo, texto);

    const acciones = document.createElement("div");
    acciones.className = "qi-aviso-acciones";
    for (const accion of (vacia ? ["✦ Descansar", "☾ Dormir en una cama"] : ["✦ Descansar (parcial)", "⚔ Pelear", "☾ Dormir en una cama"])) {
      const opcion = document.createElement("span");
      opcion.className = "qi-aviso-accion";
      opcion.textContent = accion;
      acciones.appendChild(opcion);
    }
    panel.appendChild(acciones);

    const ayuda = document.createElement("div");
    ayuda.className = "qi-aviso-ayuda";
    ayuda.textContent = vacia
      ? "Busca otra sala para cultivar; aquí solamente puedes recuperar el cuerpo."
      : "Descansar recupera una parte de la vena local; combatir o dormir renueva la circulación por completo.";
    panel.appendChild(ayuda);

    this.contenido.appendChild(panel);
    this.abajo();
  }

  mostrarAyudaCondicion(tipo) {
    const p = this.player || {};
    const impurezas = p.impurezas || 0;
    const heridas = p.heridas_meridianos || 0;
    const esImpureza = tipo === "impurezas";
    const crear = (tag, clase, texto = null) => {
      const el = document.createElement(tag);
      if (clase) el.className = clase;
      if (texto !== null) el.textContent = capitalizarSegmentosUI(texto);
      return el;
    };

    const ficha = crear("section", `ayuda-condicion ${tipo}`);
    const cabecera = crear("header", "ayuda-condicion-cabecera");
    cabecera.appendChild(crear("div", "ayuda-condicion-sello", esImpureza ? "濁" : "脈"));
    const identidad = crear("div", null);
    identidad.append(
      crear("div", "ayuda-condicion-titulo", esImpureza ? "Impurezas" : "Heridas meridianas"),
      crear("div", "ayuda-condicion-sub", esImpureza
        ? "Sedimento de qi que enturbia la Fundación"
        : "Daño interno en los cauces por donde circula el qi")
    );
    cabecera.appendChild(identidad);
    cabecera.appendChild(crear("div", "ayuda-condicion-actual",
      esImpureza ? `ACTUALES\n${impurezas}` : `ACTUALES\n${heridas}/3`));
    ficha.appendChild(cabecera);

    const cuerpo = crear("div", "ayuda-condicion-cuerpo");
    cuerpo.appendChild(crear("div", "ayuda-condicion-resumen", esImpureza
      ? "Las impurezas no son veneno ni heridas: son residuos de energía mal refinada. El cuerpo puede tolerarlos, pero vuelven más incierta la meditación profunda y empeoran la calidad de una futura Fundación."
      : "Una herida meridiana es una grieta en los canales internos, no una pérdida de vida común. Puedes seguir luchando, pero cada circulación recupera menos qi hasta que el cauce sea tratado."));

    const datos = crear("div", "ayuda-condicion-datos");
    const valores = esImpureza
      ? [
          ["RIESGO PROFUNDO", `${Math.min(RIESGO_MAX, RIESGO_BASE + RIESGO_IMPUREZA * impurezas)}%`],
          ["POR IMPUREZA", "+5% riesgo · −2 Fundación"],
          ["LÍMITE DE RIESGO", `${RIESGO_MAX}%`],
        ]
      : [
          ["PENALIZACIÓN ACTUAL", heridas ? `−${heridas} qi al meditar` : "Sin penalización"],
          ["RECUPERACIÓN MÍNIMA", "1 qi por meditación"],
          ["MÁXIMO", "3 heridas"],
        ];
    for (const [etiqueta, valor] of valores) {
      const dato = crear("div", "ayuda-condicion-dato");
      dato.append(crear("b", null, etiqueta), crear("span", null, valor));
      datos.appendChild(dato);
    }
    cuerpo.appendChild(datos);

    const grid = crear("div", "ayuda-condicion-grid");
    const bloques = esImpureza
      ? [
          ["CÓMO SE ACUMULAN", [
            "Pociones de sangre y remedios ordinarios: +1.",
            "Elixir de qi barato: +1.",
            "Una mezcla alquímica fallida: +1.",
          ]],
          ["QUÉ CAMBIAN", [
            "Aumentan el riesgo de MEDITAR PROFUNDO.",
            "Restan calidad al establecer la Fundación.",
            "Con más de 1, bloquean el injerto espiritual.",
          ]],
          ["CÓMO PURIFICARLAS", [
            "Duerme en un alojamiento seguro: elimina 1.",
            "Una píldora de purificación elimina hasta 3.",
          ]],
        ]
      : [
          ["CÓMO APARECEN", [
            "Al forzar artes avanzadas incompatibles con tu raíz.",
            "Por golpes especiales muy potentes de ciertas criaturas.",
            "Nunca puedes acumular más de 3.",
          ]],
          ["QUÉ CAMBIAN", [
            "Cada herida resta 1 qi a toda meditación.",
            "La absorción nunca baja de 1 qi.",
            "Cualquier herida bloquea el injerto espiritual.",
          ]],
          ["CÓMO TRATARLAS", [
            "Las píldoras de meridianos permiten reparar heridas.",
            "Una píldora de remiendo meridiano repara 1.",
            "Curarse, descansar o dormir no las elimina.",
          ]],
        ];
    for (const [titulo, lineas] of bloques) {
      const bloque = crear("div", "ayuda-condicion-bloque");
      bloque.appendChild(crear("h4", null, titulo));
      for (const linea of lineas) bloque.appendChild(crear("div", "ayuda-condicion-linea", linea));
      grid.appendChild(bloque);
    }
    cuerpo.appendChild(grid);
    cuerpo.appendChild(crear("div", "ayuda-condicion-aviso", esImpureza
      ? "Importante: las impurezas no reducen directamente tu vida máxima, tu qi máximo ni tu daño. Su peligro está en el cultivo profundo, la Fundación y los injertos."
      : "Recuperar toda la vida no repara los meridianos. Consulta ESTADO y los tratamientos especializados."));
    ficha.appendChild(cuerpo);
    this.contenido.appendChild(ficha);
    this.abajo();
  }

  // Ficha visual para una sección normal de AYUDA (todas menos "Impurezas" y
  // "Heridas meridianas", que ya tenían su propia ficha con mostrarAyudaCondicion).
  // Separa referencia rápida de comandos (bloque monoespaciado, tal cual) de las
  // notas explicativas (lista con viñetas), en vez de un bloque de texto plano
  // donde las líneas indentadas terminaban pintadas como texto de combate.
  mostrarSeccionAyuda(seccion) {
    const { sintaxis, notas } = parseAyudaTexto(seccion.texto);
    const crear = (tag, clase, texto = null) => {
      const el = document.createElement(tag);
      if (clase) el.className = clase;
      if (texto !== null) el.textContent = texto;
      return el;
    };

    const ficha = crear("section", "ayuda-tema");
    const cabecera = crear("header", "ayuda-tema-cabecera");
    cabecera.append(crear("div", "ayuda-tema-sello", "✦"), crear("div", "ayuda-tema-titulo", capitalizarUI(seccion.nombre)));
    ficha.appendChild(cabecera);

    const cuerpo = crear("div", "ayuda-tema-cuerpo");
    if (sintaxis.length) cuerpo.appendChild(crear("pre", "ayuda-tema-sintaxis", sintaxis.join("\n")));
    if (notas.length) {
      const lista = crear("ul", "ayuda-tema-lista");
      for (const nota of notas) lista.appendChild(crear("li", "ayuda-tema-item", capitalizarSegmentosUI(nota)));
      cuerpo.appendChild(lista);
    }
    ficha.appendChild(cuerpo);
    this.contenido.appendChild(ficha);
    this.abajo();
  }

  mostrarAprendizajeManual(mid, tid) {
    const it = ITEMS[mid], t = TECNICAS[tid];
    if (!it || !t || !this.player?.tecnicas?.[tid]) return;
    const elementos = t.elementos || [t.elemento];
    const claseElemento = elementos.length > 1 ? "mixta" : elementos[0];
    const conf = this.statsTecnica(tid);
    const guia = GUIA_TECNICAS[tid] || {};
    const crear = (tag, clase, texto = null) => {
      const el = document.createElement(tag);
      if (clase) el.className = clase;
      if (texto !== null) el.textContent = capitalizarSegmentosUI(texto);
      return el;
    };
    const nombresElementos = elementos.map(e => ELEMENTO_UI[e]?.nombre || capitalizarUI(e));
    const simbolos = elementos.map(e => ELEMENTO_UI[e]?.simbolo || "◇").join("+");

    const ficha = crear("section", `manual-aprendido afin-elemento-${claseElemento}`);
    const cabecera = crear("header", "manual-cabecera");
    cabecera.appendChild(crear("div", "manual-simbolo", simbolos));
    const titulo = crear("div", null);
    titulo.append(
      crear("div", "manual-sello", "✦ Técnica comprendida"),
      crear("div", "manual-titulo", t.name),
      crear("div", "manual-origen", `Aprendida mediante: ${it.name}`)
    );
    cabecera.appendChild(titulo);
    ficha.appendChild(cabecera);

    const cuerpo = crear("div", "manual-cuerpo");
    cuerpo.appendChild(crear("div", "manual-relato",
      "Repites la respiración, el trazo y la postura hasta que el texto deja de describir un movimiento: tus meridianos empiezan a recordarlo."));
    const insignias = crear("div", "manual-insignias");
    for (const [texto, extra] of [
      [`${simbolos} ${nombresElementos.join(" + ")}`, " elemento"],
      [`Grado ${t.rango}`, ""],
      [ROL_TECNICA[t.tipo] || t.tipo, ""],
      [t.area ? "Área" : "Un objetivo", ""],
    ]) insignias.appendChild(crear("span", `manual-insignia${extra}`, texto));
    cuerpo.appendChild(insignias);

    const bloques = crear("div", "manual-bloques");
    for (const [etiqueta, texto] of [
      ["EFECTO BASE", `${conf.coste} qi · ${this.tecnicaResumen(tid)}`],
      ["FUNCIÓN", guia.proposito || "Una nueva circulación se abre en tus meridianos."],
      ["CUÁNDO USARLA", guia.uso || "Ponla a prueba en combate para asentar su maestría."],
      ["AFINIDAD Y APRENDIZAJE", this.perfilTecnica(tid)],
    ]) {
      const bloque = crear("div", "manual-bloque");
      bloque.append(crear("b", null, etiqueta), crear("span", null, texto));
      bloques.appendChild(bloque);
    }
    cuerpo.appendChild(bloques);
    cuerpo.appendChild(crear("div", "manual-orden",
      `Ya puedes usar TÉCNICA ${tid.replaceAll("_", " ")} en combate. Abre TÉCNICAS para consultar su progreso, límites y futuras especializaciones.`));
    ficha.appendChild(cuerpo);
    this.contenido.appendChild(ficha);
    this.actualizarPanel();
    this.abajo();
  }

  // Ficha de "bestiario en vivo" para MIRAR/EXAMINAR una criatura. Reutiliza el
  // mismo lenguaje visual que mostrarAprendizajeManual (misma familia de clases,
  // paleta propia) para que se sienta parte del mismo juego y no un cartel aparte.
  mostrarFichaCriatura(mob) {
    const crear = (tag, clase, texto) => {
      const el = document.createElement(tag);
      if (clase) el.className = clase;
      if (texto !== undefined && texto !== null) el.textContent = String(texto);
      return el;
    };
    const especie = String(mob.mob_id || '');
    const especieCatalogada = Object.prototype.hasOwnProperty.call(ASTRA_A08_DATA.monsters, especie);
    const elemento = especieCatalogada ? (LGB_R16_AFINIDADES[especie] || null) : null;
    const esencia = elemento && LGB_R16_ESENCIAS[elemento];
    const nombreElemento = esencia?.nombre || 'Sin clasificación';
    const simboloElemento = esencia?.symbol || '◇';
    const signos = [['rata','鼠'],['lobo','狼'],['serpiente','蛇'],['aracn','蛛'],['zorro','狐'],['jabali','豕'],['tortuga','龜'],['oso','熊'],['tigre','虎'],['mantis','螳'],['escorpion','蠍'],['sapo','蛙'],['aguila','鷹'],['grulla','鶴']];
    const selloAnimal = signos.find(([patron]) => especie.includes(patron))?.[1] || '靈';
    const selloCentral = elemento ? simboloElemento : selloAnimal;
    const nativeView = ASTRA_A08_MONSTER_PRESENTATION.live(ASTRA_A08_DATA,mob);
    const listo = nativeView.ready === true;
    const renglones = listo && Array.isArray(nativeView.rows) ? nativeView.rows : [];
    const leido = new Map(renglones.map(([clave, valor]) => [String(clave), String(valor)]));
    const valor = clave => leido.get(clave) ?? '—';
    const resumirDanoBasico = expresion => {
      const limpia = String(expresion ?? '').replace(/\s+/g, '');
      const dados = /^(\d+)d(\d+)([+-]\d+)?$/i.exec(limpia);
      const entero = /^\d+$/.test(limpia) ? Number(limpia) : null;
      if (entero !== null && Number.isSafeInteger(entero) && entero >= 0) {
        return { rango: String(entero), detalle: 'Daño fijo · antes de defensa' };
      }
      if (!dados) return { rango: 'Variable', detalle: 'Rango exacto no disponible' };
      const cantidad = Number(dados[1]), caras = Number(dados[2]), ajuste = Number(dados[3] || 0);
      if (!Number.isSafeInteger(cantidad) || !Number.isSafeInteger(caras) || !Number.isSafeInteger(ajuste) || cantidad < 1 || caras < 1) {
        return { rango: 'Variable', detalle: 'Rango exacto no disponible' };
      }
      const minimo = cantidad + ajuste, maximo = cantidad * caras + ajuste;
      const promedio = (minimo + maximo) / 2;
      return {
        rango: minimo === maximo ? String(minimo) : minimo + '–' + maximo,
        detalle: 'Promedio ' + promedio.toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' · antes de defensa'
      };
    };
    const vidaPct = listo && nativeView.maxHP > 0 ? Math.max(0, Math.min(100, nativeView.currentHP / nativeView.maxHP * 100)) : 0;
    const nombre = capitalizarSegmentosUI(etiquetaMob(mob) || mob.nombre || especie.replace(/_/g,' '));
    // R17.1: preserve the actual bestiary prose from the monster instance.
    // Reading a description is not proof of a live stat frame; keep R14 data gating separate.
    const descripcionInstancia = typeof mob.desc === 'string' ? mob.desc.trim() : '';
    const descripcionEspecie = especieCatalogada && typeof MOBS[especie]?.desc === 'string'
      ? MOBS[especie].desc.trim() : '';
    const resumen = descripcionInstancia || descripcionEspecie || 'No hay una descripción registrada para esta criatura.';
    const danio = listo ? resumirDanoBasico(valor('DAÑO BÁSICO')) : null;

    const ficha = crear('section', 'criatura-ficha' + (elemento ? ' afin-elemento-' + elemento : ''));
    if (elemento) ficha.dataset.afinidad = elemento;
    ficha.setAttribute('aria-label', 'Observación de criatura: ' + nombre);

    const cinta = crear('div','criatura-cinta');
    const cintaLeft = crear('div','criatura-cinta-left');
    cintaLeft.append(crear('span', null, 'REGISTRO DE ESENCIAS'), crear('span', null, '·'), crear('span', null, 'MIRAR'));
    const cintaRight = crear('div','criatura-cinta-right');
    cintaRight.append(crear('i','criatura-punto'), crear('span', null, listo ? 'LECTURA VIVA' : 'SIN LECTURA'));
    cinta.append(cintaLeft, cintaRight);
    ficha.appendChild(cinta);

    const shell = crear('div','criatura-shell');
    const top = crear('div','criatura-top');
    const head = crear('div','criatura-head');
    const sigilo = crear('div','criatura-sigilo');
    sigilo.setAttribute('aria-hidden','true');
    sigilo.appendChild(crear('span','criatura-sigilo-glifo',selloCentral));
    head.appendChild(sigilo);

    const heading = crear('div','criatura-heading');
    if (esencia?.epithet) heading.appendChild(crear('div','criatura-epiteto', esencia.epithet));
    heading.appendChild(crear('h3','criatura-titulo', nombre));
    const insignias = crear('div','criatura-insignias');
    if (elemento) insignias.appendChild(crear('span','criatura-insignia', simboloElemento + ' ' + nombreElemento));
    if (mob.unico) insignias.appendChild(crear('span','criatura-insignia', '✦ Singular'));
    if (mob.errante_id) insignias.appendChild(crear('span','criatura-insignia', '↝ Errante'));
    heading.appendChild(insignias);
    heading.appendChild(crear('p','criatura-resumen', resumen));
    head.appendChild(heading);
    top.appendChild(head);

    const vital = crear('aside','criatura-vital');
    const vitalTop = crear('div','criatura-vital-top');
    const vitalMeta = crear('div', null);
    vitalMeta.append(crear('div','criatura-vital-label','Integridad vital'));
    vitalMeta.appendChild(crear('strong','criatura-vital-valor', listo ? (nativeView.currentHP + ' / ' + nativeView.maxHP) : '— / —'));
    vitalTop.appendChild(vitalMeta);
    if (elemento) vitalTop.appendChild(crear('span','criatura-vital-pill', simboloElemento + ' ' + nombreElemento));
    vital.appendChild(vitalTop);
    const barra = crear('div','criatura-vida-barra');
    if (listo) {
      barra.setAttribute('role','progressbar');
      barra.setAttribute('aria-label','Vida actual de la criatura');
      barra.setAttribute('aria-valuemin','0');
      barra.setAttribute('aria-valuemax',String(nativeView.maxHP));
      barra.setAttribute('aria-valuenow',String(nativeView.currentHP));
    }
    const relleno = crear('div','criatura-vida-relleno'); relleno.style.width = vidaPct + '%'; barra.appendChild(relleno);
    vital.appendChild(barra);
    vital.appendChild(crear('div','criatura-vital-sub', listo ? 'Estadísticas reales del individuo observado.' : 'No se pudo verificar esta instancia en la sala actual.'));
    top.appendChild(vital);
    shell.appendChild(top);

    const secStats = crear('section','criatura-seccion');
    secStats.appendChild(crear('div','criatura-seccion-titulo','Atributos del individuo'));
    const gridStats = crear('div','criatura-grid');
    for (const [clave,nombreCorto] of [['PRECISIÓN','Precisión'],['EVASIÓN','Evasión'],['DEF','Defensa'],['TENACIDAD','Tenacidad'],['CONTROL','Control'],['CRÍTICO','Crítico']]) {
      const box = crear('dl','criatura-card');
      box.append(crear('dt',null,nombreCorto), crear('dd',null,listo ? valor(clave) : '—'));
      gridStats.appendChild(box);
    }
    secStats.appendChild(gridStats);
    shell.appendChild(secStats);

    const secOff = crear('section','criatura-seccion');
    secOff.appendChild(crear('div','criatura-seccion-titulo','Capacidad ofensiva'));
    const gridOff = crear('div','criatura-grid ofensiva');
    const danoBox = crear('dl','criatura-card');
    danoBox.append(crear('dt',null,'Daño por golpe'));
    danoBox.appendChild(crear('dd','chico', listo && danio ? danio.rango : '—'));
    if (listo && danio) danoBox.appendChild(crear('small',null,danio.detalle));
    const critBox = crear('dl','criatura-card');
    critBox.append(crear('dt',null,'Multiplicador crítico'), crear('dd','chico', listo ? valor('MULTIPLICADOR CRÍTICO') : '—'));
    critBox.appendChild(crear('small',null,'Valor aplicado cuando el golpe crítico se activa.'));
    gridOff.append(danoBox, critBox);
    secOff.appendChild(gridOff);
    shell.appendChild(secOff);

    const secPat = crear('section','criatura-seccion');
    secPat.appendChild(crear('div','criatura-seccion-titulo','Patrón observado'));
    const patron = crear('div','criatura-patron');
    patron.appendChild(crear('div','criatura-patron-icon','✧'));
    const patronText = crear('div',null);
    patronText.append(crear('div','criatura-patron-label','Conducta de combate'), crear('p','criatura-patron-body', listo ? (nativeView.technique || 'Ataque básico.') : 'Los datos de combate no están disponibles.'));
    patron.appendChild(patronText);
    secPat.appendChild(patron);
    if (mob.errante_id) secPat.appendChild(crear('div','criatura-rastro','Esta criatura recorre su territorio. Si sales y vuelves, puede que encuentres a otro individuo o que ya no esté aquí.'));
    shell.appendChild(secPat);

    ficha.appendChild(shell);
    const pie = crear('footer','criatura-pie');
    pie.append(crear('strong',null,listo ? 'Observación verificada' : 'Observación no disponible'), crear('span','criatura-pie-derecha', listo ? 'Datos A08 · instancia real' : 'Sin estadísticas supuestas'));
    ficha.appendChild(pie);

    this.contenido.appendChild(ficha);
    this.actualizarPanel();
    this.abajo();
  }

  actualizarBarra() {
    const p = this.player;
    if (!p) { this.barra.textContent = "—"; this.vitalesEl.replaceChildren(); return; }
    const etapa = reinoExacto(p, "LianQi") ? `Etapa ${p.etapa}/${totalEtapas(p.reino)}` : "Fundación Establecida";
    this.barra.textContent =
      `${capitalizarUI(p.name)} · ${p.reino} ${etapa} · ♥ ${p.hp}/${p.max_hp} · 氣 ${p.qi}/${p.qi_max} · ◆ ${p.piedras}`;
    this.actualizarVitales();
  }

  actualizarVitales() {
    const p = this.player;
    if (!p) { this.vitalesEl.replaceChildren(); return; }
    const etapa = reinoExacto(p, "LianQi") ? `Etapa ${p.etapa}/${totalEtapas(p.reino)}` : "Fundación Establecida";
    const v = this.vitalesEl;
    v.replaceChildren();
    const nom = document.createElement("div");
    nom.className = "vit-nombre";
    nom.textContent = `${capitalizarUI(p.name)} · ${p.reino} · ${etapa}`;
    v.appendChild(nom);
    const fila = (etiqueta, actual, max, clase) => {
      const d = document.createElement("div");
      d.className = "vit-linea vit-medidor";
      const s1 = document.createElement("span");
      s1.className = "vit-etiqueta";
      s1.textContent = etiqueta;
      const s2 = document.createElement("span");
      s2.className = "vit-pista";
      s2.setAttribute("role", "meter");
      s2.setAttribute("aria-label", etiqueta);
      s2.setAttribute("aria-valuemin", "0");
      s2.setAttribute("aria-valuemax", String(max));
      s2.setAttribute("aria-valuenow", String(Math.max(0, actual)));
      const relleno = document.createElement("span");
      relleno.className = `vit-relleno ${clase}`;
      relleno.style.width = `${max > 0 ? Math.max(0, Math.min(100, actual / max * 100)) : 0}%`;
      s2.appendChild(relleno);
      const s3 = document.createElement("span");
      s3.className = "vit-cifra";
      s3.textContent = `${actual}/${max}`;
      d.append(s1, s2, s3);
      v.appendChild(d);
    };
    fila("VIDA", p.hp, p.max_hp, "vit-hp");
    fila("QI", p.qi, p.qi_max, "vit-qi");
    const dim = document.createElement("div");
    dim.className = "vit-dim";
    const faccion = this.registroFaccion();
    dim.textContent = `◆ ${p.piedras} Piedras · Contrib. ${faccion?.saldo || 0} · Mérito ${faccion?.merito || 0} · Impurezas ${p.impurezas || 0}`;
    v.appendChild(dim);
  }

  // ---------- minimapa ----------

  actualizarMinimapa() {
    const sala = ROOMS[this.pos];
    this.mapaSalaEl.replaceChildren(document.createTextNode(sala?.name || "—"));
    aplicarAreaUI(this.mapaSalaEl, sala ? areaDeSala(this.pos) : null);
    if (sala) {
      // El lateral no dibuja mapa: sólo dice en qué área y sección del Atlas estás.
      const area = AREAS[areaDeSala(this.pos)];
      if (area) {
        const territorio = document.createElement("span");
        territorio.className = "mapa-sala-area";
        territorio.textContent = area.nombre;
        this.mapaSalaEl.appendChild(territorio);
      }
      const capa = MAPA_CAPAS[capaMapaDeSala(this.pos)];
      const nivel = document.createElement("span");
      nivel.className = "mapa-sala-nivel";
      nivel.textContent = `${capa.nombre} · ${capa.detalle}`;
      this.mapaSalaEl.appendChild(nivel);
    }
    if (document.getElementById("atlas").open) this.renderAtlas();
  }

  // ---------- panel de información ----------

  chip(txt, cmd) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = capitalizarSegmentosUI(txt);
    b.title = cmd;
    b.addEventListener("click", () => enviarComando(cmd));
    return b;
  }

  chipSlot(slot, mid) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip slot";
    b.title = `desequipar ${ITEMS[mid].name}`;
    b.addEventListener("click", () => enviarComando(`desequipar ${mid}`));
    const s1 = document.createElement("span");
    s1.className = "s-slot";
    s1.textContent = capitalizarUI(slot).padEnd(8);
    const s2 = document.createElement("span");
    s2.className = "s-nom";
    s2.textContent = capitalizarUI(ITEMS[mid].name);
    b.append(s1, s2);
    const st = statsCortos(mid);
    if (st) {
      const s3 = document.createElement("span");
      s3.className = "s-st";
      s3.textContent = capitalizarUI(st);
      b.appendChild(s3);
    }
    return b;
  }

  actualizarPanel() {
    const cont = this.panelInfoEl;
    // La ventana CULTIVO es un reflejo de player: si está abierta, se repinta
    // con cada cambio de estado en vez de quedar congelada.
    if (document.getElementById("cultivo")?.open) this.renderCultivo();
    if (!cont) return;
    cont.replaceChildren();
    if (!this.player || !this.rooms) return;
    const p = this.player;

    const seccion = (titulo) => {
      const s = document.createElement("div");
      s.className = "panel-sec";
      s.textContent = titulo;
      cont.appendChild(s);
      return s;
    };
    const linea = (txt, clase) => {
      const d = document.createElement("div");
      d.className = "panel-linea" + (clase ? " " + clase : "");
      d.textContent = capitalizarSegmentosUI(txt);
      cont.appendChild(d);
      return d;
    };
    const chips = (elems) => {
      const c = document.createElement("div");
      c.className = "chips";
      for (const e of elems) c.appendChild(e);
      cont.appendChild(c);
      return c;
    };

    if (this.combate) {
      const combate = this.combate;
      seccion("COMBATE — RONDA " + combate.round);
      const filaJugador = document.createElement("div");
      filaJugador.className = "barra-panel";
      const hpJugador = document.createElement("span");
      hpJugador.className = "hp";
      hpJugador.textContent = barra(Math.max(0, p.hp), p.max_hp, 16);
      filaJugador.append("TÚ  ", hpJugador, `  ${Math.max(0, p.hp)}/${p.max_hp}`);
      cont.appendChild(filaJugador);
      for (const mob of combate.combatientes) {
        const esObjetivo = combate.combatientes.length > 1 && mob === combate.e;
        const fila = document.createElement("div");
        fila.className = "barra-panel";
        const hpSpan = document.createElement("span");
        hpSpan.className = "hp";
        hpSpan.textContent = barra(Math.max(0, mob.hp), mob.max_hp, 16);
        const prefijo = esObjetivo ? "» " : (combate.combatientes.length > 1 ? "   " : "");
        fila.append(`${prefijo}${capitalizarUI(etiquetaMob(mob))}  `, hpSpan, `  ${Math.max(0, mob.hp)}/${mob.max_hp}`);
        cont.appendChild(fila);

        if (mob.tecnica) linea(`⚔ ${mob.tecnica.name} (cada ${mob.tecnica.cada} rondas)`, "dim");
      }
      const activos = [];
      for (const mob of combate.combatientes) {
        for (const s of (combate.estadosEnemigos.get(mob) || [])) {
          activos.push(`${ESTADO_LABEL[s.tipo] || s.tipo}→${mob.corto || mob.name}(${restoEstadoActivo(s)})`);
        }
        const tenacidad = combate.tenacidadDe(mob);
        if (tenacidad) activos.push(`tenacidad→${mob.corto || mob.name}(${tenacidad})`);
      }
      activos.push(...combate.estados.jugador.map(s => `${ESTADO_LABEL[s.tipo] || s.tipo}→tú(${restoEstadoActivo(s)})`));
      activos.push(...(p.aflicciones || []).map(a => `${a.nombre}→tú(${a.duracion})`));
      if (activos.length) linea("· " + activos.join(" · "), "dim");

      const impactoBasico = combate.e
        ? probabilidadImpacto(combate.ef().ataque, combate.e.defensa, 20, combate.e.esquiva ?? ESQUIVA_INNATA)
        : 0;
      const lista = [this.chip(`⚔ atacar · ${impactoBasico}%`, "atacar"), this.chip("◈ defender: -daño +氣", "defender")];
      if (combate.combatientes.length > 1) {
        for (const mob of combate.combatientes) {
          if (mob === combate.e) continue;
          const numero = (mob.total_especie || 0) > 1 ? ` ${mob.indice_especie}` : "";
          lista.push(this.chip(`→ ${etiquetaMob(mob)}`, `atacar ${mob.mob_id}${numero}`));
        }
      }
      for (const tid of Object.keys(p.tecnicas)) {
        const t = TECNICAS[tid];
        if (!t) continue;
        const conf = this.statsTecnica(tid);
        const cd = combate.cooldownTecnica(tid);
        let precision = "";
        if (t.tipo === "ofensiva" && combate.e) {
          precision = ` · ${probabilidadImpacto(combate.ef().ataque + conf.ataqueBono, combate.e.defensa, conf.critMin, combate.e.esquiva ?? ESQUIVA_INNATA)}%`;
        } else if (t.tipo === "control" && combate.e) {
          const tenacidad = combate.tenacidadDe(combate.e);
          precision = tenacidad ? ` · RESISTE · TENACIDAD ${tenacidad}` : ` · ${combate.probabilidadControl(conf, combate.e)}% control`;
        }
        const botonTecnica = this.chip(`${t.corto || t.name} ${conf.coste}氣${precision}${cd ? ` · CD ${cd}` : ""}`, `tecnica ${tid}`);
        if (cd) {
          botonTecnica.disabled = true;
          botonTecnica.title = `${t.name}: enfriamiento ${cd} ronda(s)`;
        }
        lista.push(botonTecnica);
      }
      const bebibles = agruparObjetos(p.inventario.filter(mid => {
        const it = ITEMS[mid];
        return it && it.tipo === "consumible";
      }));
      for (const { mid, cantidad } of bebibles) lista.push(this.chip(`beber ${nombreCantidad(mid, cantidad)}`, `beber ${mid}`));
      if (combate.permitirHuir) lista.push(this.chip("huir", "huir"));
      chips(lista);
    } else {
      seccion("SECTA");
      linea(capitalizarUI(this.tituloActual()), this.player.promovido ? "verde" : null);
      const faccion = this.registroFaccion();
      linea(`contribución ${faccion?.saldo || 0} · mérito ${faccion?.merito || 0} · prestigio ${p.prestigio || 0}`);
      if (p.calidad_fundacion) linea(`Fundación ${p.calidad_fundacion}${p.maestro ? " · maestro " + p.maestro : ""}`, "dim");

      seccion("SALIDAS");
      const sala = this.rooms[this.pos];
      const lista = [];
      for (const [dir, dest] of Object.entries(sala.exits || {})) {
        const esOculta = (ROOMS[dest] || {}).oculta && !this.visitadas.has(dest);
        const verticalPercibida = this.tieneSentido() && SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO.includes(dest);
        if (esOculta && !verticalPercibida) continue;
        const conocida = this.visitadas.has(dest);
        const destinoTxt = conocida ? (ROOMS[dest] || {}).name : "(sin recorrer)";
        lista.push(this.chip(`${FLECHA_DIR[dir] || "·"}${DIR_CORTA[dir] || dir}  ${destinoTxt}`, dir));
      }
      if (!lista.length) linea("ninguna a la vista", "dim");
      else chips(lista);

      seccion("EN LA SALA");
      const vivos = this.vivos.filter(m => m.hp > 0);
      const cadaveres = this.cadaveresEnSala();
      const npcs = this.npcsEnSala(this.pos);
      const itemsSuelo = this.itemsVisibles();
      const lista2 = [];
      for (const m of vivos) {
        const numero = (m.total_especie || 0) > 1 ? ` ${m.indice_especie}` : "";
        lista2.push(this.chip(`⚔ ${etiquetaMob(m)}`, `atacar ${m.mob_id}${numero}`));
      }
      const restosAgrupados = new Map();
      for (const c of cadaveres) {
        const previo = restosAgrupados.get(c.mob_id) || { cadaver: c, cantidad: 0 };
        previo.cantidad++;
        restosAgrupados.set(c.mob_id, previo);
      }
      for (const { cadaver, cantidad } of restosAgrupados.values()) {
        lista2.push(this.chip(`☠ ${capitalizarUI(this.etiquetaCadaver(cadaver))}${cantidad > 1 ? ` (${cantidad})` : ""}`, `mirar ${cadaver.mob_id} muerto`));
      }
      for (const n of npcs) lista2.push(this.chip(`✦ ${NOMBRES_NPC[n]}`, `hablar ${n}`));
      for (const { mid, cantidad } of agruparObjetos(itemsSuelo)) {
        lista2.push(this.chip(`✥ ${nombreCantidad(mid, cantidad)}`, `tomar ${mid}`));
      }
      if (sala.estaciones?.alquimia) lista2.push(this.chip("⚗ Alquimia", "alquimia"));
      if (!vivos.length) lista2.push(this.chip("✦ descansar", "descansar"));
      if (sala.alojamiento) lista2.push(this.chip(`☾ dormir · ${sala.alojamiento.nombre}`, "dormir"));
      if (!vivos.length && !cadaveres.length && !npcs.length && !itemsSuelo.length) {
        linea(this._huboMobsEnCooldown ? "tranquilo por ahora — algo rondaba, se movió" : "nada que te preste atención", "dim");
      }
      chips(lista2);

      seccion("CULTIVO");
      const vena = this.venaActual(sala);
      const r = RAICES[p.raiz];
      const base = Math.round(r.qi_med * vena.mult);
      const satIdx = Math.min(this.saturacionDe(this.pos), SATURACION_MULT.length - 1);
      const sat = SATURACION_MULT[satIdx];
      const anillo = p.equipado.dedo === "anillo" ? 1 : 0;
      const metodo = p.metodo ? 1 : 0;
      let venaTxt;
      if (vena.diente) venaTxt = "vena RESENTIDA — el qi pisoteado muerde";
      else if (base === 0) venaTxt = "vena muerta — aquí solo cabe descansar";
      else {
        const est = Math.max(1, Math.round(base * sat)) + anillo + metodo;
        venaTxt = `vena ${vena.label}${sala.salvaje ? " ⚠ salvaje" : ""} · ~${est} qi`;
        if (sat === 0) venaTxt += " · AGOTADA (descansa, pelea o duerme)";
        else if (sat < 1) venaTxt += ` · saturación ${Math.round(sat * 100)}%`;
      }
      linea(venaTxt, vena.diente ? "roja" : null);
      if (sala.purificaMeditacion) linea("(la quietud destila impurezas)", "dim");
      const riesgo = Math.min(RIESGO_MAX, RIESGO_BASE + RIESGO_IMPUREZA * (p.impurezas || 0));
      linea(`impurezas ${p.impurezas || 0} · riesgo profundo ${riesgo}%`, (p.impurezas || 0) > 0 ? "roja" : "dim");
      const actividad = this.actividadReposo();
      const faltaDescanso = Math.max(0, ACCIONES_DESCANSAR - actividad);
      const faltaSueno = Math.max(0, ACCIONES_DORMIR - actividad);
      const estadoReposo = faltaDescanso
        ? `Reposo reciente · descansar en ${faltaDescanso} · dormir en ${faltaSueno}`
        : faltaSueno ? `Descanso disponible · dormir en ${faltaSueno}` : "Descanso y sueño disponibles";
      linea(estadoReposo, "dim");
      if (reinoExacto(p, "LianQi") && p.etapa < totalEtapas("LianQi")) {
        const puerta = this.compruebaPuerta(p.etapa + 1);
        const pt = PUERTAS[p.etapa + 1];
        if (pt) {
          const nPild = p.inventario.filter(x => x === "pildora_consolidacion").length;
          let pTxt = `puerta a etapa ${p.etapa + 1}: ${nPild}/${pt.pildoras} píldoras`;
          for (const req of pt.logros) {
            if (req === "combate") pTxt += " · combate ✓";
            if (req.startsWith("comprension:")) {
              const min = parseInt(req.split(":")[1], 10);
              pTxt += ` · comp. ${p.comprension}/${min}`;
            }
          }
          linea(pTxt, puerta.ok ? "verde" : "roja");
        }
      }
      const listaC = [this.chip(base > 0 && sat > 0 ? "氣 meditar" : "氣 meditar (sin qi)", "meditar")];
      if (base > 0 && sat > 0) listaC.push(this.chip(`✦ meditar profundo ×2 ⚠${riesgo}%`, "meditar profundo"));
      chips(listaC);

    }

    seccion("TÉCNICAS");
    linea(`raíz ${p.raiz}${p.raiz_secundaria ? " + " + p.raiz_secundaria : ""} · AFINIDAD`, "dim");
    const tecs = Object.entries(p.tecnicas);
    if (!tecs.length) linea("ninguna todavía", "dim");
    const cap = reinoAlMenos(p, "ZhuJi") ? 3 : 2;
    for (const [tid, rec] of tecs) {
      const t = TECNICAS[tid];
      if (!t) continue;
      const conf = this.statsTecnica(tid);
      const nivel = rec.maestria || 0;
      let m = MAESTRIA_NOMBRES[nivel];
      if (nivel < 3) {
        if (nivel >= cap) m += " TOPE";
        else m += ` ${this.progresoTecnica(tid)}/${umbralMaestria(nivel, tid)}`;
      }
      linea(`${(t.corto || t.name).padEnd(9)} ${m}  ${conf.coste}氣${conf.afinidad ? " ✧" : ""}${conf.riesgo ? ` ⚠${conf.riesgo}%` : ""}`,
            nivel >= cap && nivel < 3 ? "roja" : null);
    }
  }

  // ---------- fichas ----------

  nuevaFicha() {
    const ficha = document.createElement("div");
    ficha.className = "ficha";
    return ficha;
  }

  fLn(ficha, texto, clase) {
    const d = document.createElement("div");
    if (clase) d.className = clase;
    d.textContent = capitalizarSegmentosUI(texto);
    ficha.appendChild(d);
    return d;
  }

  fSpans(ficha, spans) {
    const d = document.createElement("div");
    for (const [txt, clase] of spans) {
      if (!txt) continue;
      const s = document.createElement("span");
      if (clase) s.className = clase;
      s.textContent = capitalizarSegmentosUI(txt);
      d.appendChild(s);
    }
    ficha.appendChild(d);
    return d;
  }

  fSeccion(ficha, titulo) {
    this.fLn(ficha, "— " + titulo + " —", "ficha-seccion");
  }

  mostrarHoja() {
    const p = this.player, e = this.efectivo();
    const ficha = this.nuevaFicha();
    ficha.className = `ficha estado-ficha afin-elemento-${p.raiz}`;
    const crear = (tag, clase = "", texto = null) => {
      const el = document.createElement(tag);
      if (clase) el.className = clase;
      if (texto !== null) el.textContent = capitalizarSegmentosUI(texto);
      return el;
    };
    const dato = (contenedor, etiqueta, valor, clase = "estado-dato") => {
      const celda = crear("div", clase), titulo = crear("b", "", etiqueta), texto = crear("span", "", String(valor));
      celda.append(titulo, texto); contenedor.appendChild(celda); return celda;
    };
    const infoRaiz = elemento => ELEMENTO_UI[elemento] || { simbolo: "◇", nombre: capitalizarUI(elemento || "desconocida") };
    const etapa = reinoExacto(p, "LianQi") ? `Etapa ${p.etapa}/${totalEtapas(p.reino)}` : `Fundación ${p.calidad_fundacion || "establecida"}`;
    const origen = (ORIGENES[p.origen] || { nombre: "sin determinar" }).nombre;

    const cabecera = crear("div", "estado-cabecera");
    cabecera.append(crear("div", "estado-sello", infoRaiz(p.raiz).simbolo));
    const identidad = crear("div", "estado-identidad");
    identidad.append(crear("div", "estado-nombre", p.name),
      crear("div", "estado-origen", `${capitalizarUI(origen)} · ${ROOMS[this.pos]?.name || "Lugar desconocido"}`));
    cabecera.append(identidad, crear("div", "estado-rango", `${p.reino.toUpperCase()}\n${etapa.toUpperCase()}`));
    ficha.appendChild(cabecera);

    const cuerpo = crear("div", "estado-cuerpo");
    this.fSeccion(cuerpo, "IDENTIDAD DE CULTIVO");
    const identidadCultivo = crear("div", "estado-datos");
    dato(identidadCultivo, "POSICIÓN EN LA SECTA", capitalizarUI(this.tituloActual()));
    dato(identidadCultivo, "MÉTODO DE CULTIVO", p.metodo ? capitalizarUI(p.metodo) : "Todavía no establecido");
    const faccion = this.registroFaccion();
    dato(identidadCultivo, "PRESTIGIO Y CONTRIBUCIÓN", `${p.prestigio || 0} prestigio · ${faccion?.saldo || 0} disponible · ${faccion?.merito || 0} mérito histórico`);
    cuerpo.appendChild(identidadCultivo);

    const progresoFundacion = this.progresoFundacion();
    if (progresoFundacion) {
      this.fSeccion(cuerpo, "CAMINO A LA FUNDACIÓN");
      const caminoFundacion = crear("div", "estado-datos");
      dato(caminoFundacion, "PRÓXIMA META", progresoFundacion.titulo);
      dato(caminoFundacion, "REQUISITOS", progresoFundacion.detalle);
      cuerpo.appendChild(caminoFundacion);
    }

    this.fSeccion(cuerpo, "RAÍCES ESPIRITUALES");
    const raices = crear("div", "estado-raices");
    const principal = infoRaiz(p.raiz), nombrePrincipal = RAICES[p.raiz]?.nombre || principal.nombre;
    const tarjetaPrincipal = crear("div", `estado-raiz afin-elemento-${p.raiz}`);
    tarjetaPrincipal.append(crear("div", "tipo", "RAÍZ PRINCIPAL"),
      crear("div", "nombre", `${principal.simbolo} ${capitalizarUI(nombrePrincipal)}`),
      crear("div", "efecto", "Afinidad plena · aprendizaje 100% · −1 qi y +1 daño en artes ofensivas afines"));
    raices.appendChild(tarjetaPrincipal);
    if (p.raiz_secundaria) {
      const secundaria = infoRaiz(p.raiz_secundaria);
      const tarjetaSecundaria = crear("div", `estado-raiz afin-elemento-${p.raiz_secundaria}`);
      tarjetaSecundaria.append(crear("div", "tipo", "INJERTO ESPIRITUAL"),
        crear("div", "nombre", `${secundaria.simbolo} ${secundaria.nombre}`),
        crear("div", "efecto", "Raíz secundaria permanente · aprendizaje 90% · −1 qi y +1 daño en artes ofensivas afines"));
      raices.appendChild(tarjetaSecundaria);
    }
    cuerpo.appendChild(raices);
    if (!p.raiz_secundaria) cuerpo.appendChild(crear("div", "estado-sin-injerto", "INJERTO ESPIRITUAL · Ninguno realizado."));

    this.fSeccion(cuerpo, "VITALES");
    const vitales = crear("div", "estado-vitales");
    for (const [nombre, actual, maximo, color] of [["VIDA", p.hp, p.max_hp, "#bb6658"], ["QI", p.qi, p.qi_max, "#79ad92"]]) {
      const vital = crear("div", "estado-vital"), cab = crear("div", "estado-vital-cab");
      cab.append(crear("b", "", nombre), crear("span", "", `${actual}/${maximo}`));
      const pista = crear("div", "estado-vital-barra"), relleno = crear("span");
      pista.style.setProperty?.("--vital-color", color);
      pista.style["--vital-color"] = color;
      relleno.style.width = `${Math.max(0, Math.min(100, actual / maximo * 100))}%`;
      pista.appendChild(relleno); vital.append(cab, pista); vitales.appendChild(vital);
    }
    cuerpo.appendChild(vitales);

    this.fSeccion(cuerpo, "RECURSOS Y CONDICIÓN");
    const recursos = crear("div", "estado-recursos");
    for (const [nombre, valor] of [
      ["PIEDRAS ESPIRITUALES", `◆ ${p.piedras}`], ["COMPRENSIÓN", p.comprension],
      ["IMPUREZAS", p.impurezas || 0], ["HERIDAS MERIDIANAS", `${p.heridas_meridianos || 0}/3`],
      ["AFLICCIONES", this.resumenAflicciones()],
      ["ALQUIMIA", p.alquimia || 0], ["COMBATES VENCIDOS", this.logros().combate],
    ]) dato(recursos, nombre, valor, "estado-recurso");
    cuerpo.appendChild(recursos);

    this.fSeccion(cuerpo, "CAPACIDAD DE COMBATE");
    const combate = crear("div", "estado-datos");
    dato(combate, "PRECISIÓN", `+${porcentajePrecision(e.ataque)}%`);
    dato(combate, "DEFENSA", e.defensa);
    dato(combate, "DAÑO", `${dadoARango(e.daño)} · promedio ${promedioDado(e.daño)}`);
    dato(combate, "PROBABILIDAD DE CRÍTICO", `${probabilidadCritico(20)}%`);
    dato(combate, "DAÑO CRÍTICO", multiplicadorUI(MULTIPLICADOR_CRITICO));
    dato(combate, "ESQUIVA", `${e.esquiva ?? ESQUIVA_INNATA}%`);
    cuerpo.appendChild(combate);
    cuerpo.appendChild(crear("div", "estado-nota", "El equipo ya está incluido. Las técnicas pueden modificar Precisión, Defensa, Esquiva, probabilidad de crítico y daño crítico."));

    this.fSeccion(cuerpo, "CAMINO RECORRIDO");
    const conocidas = Object.entries(this.quests).filter(([k, v]) => QUESTS[k] && ["rumor", "activa", "hecha", "fallida"].includes(v));
    const hechas = conocidas.filter(([, v]) => v === "hecha").length;
    const activas = conocidas.filter(([, v]) => v === "activa").length;
    const rumores = conocidas.filter(([, v]) => v === "rumor").length;
    const recorrido = crear("div", "estado-datos");
    dato(recorrido, "MISIONES COMPLETADAS", hechas);
    dato(recorrido, "MISIONES ACTIVAS", activas);
    dato(recorrido, "RUMORES CONOCIDOS", rumores);
    cuerpo.appendChild(recorrido);
    cuerpo.appendChild(crear("div", "estado-nota", "Consulta MISIONES para ver objetivos, historia y pistas."));

    this.fSeccion(cuerpo, "VÍNCULOS");
    const afin = p.afinidad || {};
    const nombreVinculo = n => n >= 3 ? "confianza" : n >= 1 ? "respeto" : n <= -3 ? "enemistad" : n <= -1 ? "recelo" : "neutral";
    cuerpo.appendChild(crear("div", "estado-nota", Object.entries(afin).map(([n, v]) => `${capitalizarUI(NOMBRES_NPC[n] || n)}: ${nombreVinculo(v)} (${v >= 0 ? "+" : ""}${v})`).join(" · ")));

    ficha.appendChild(cuerpo);
    this.contenido.appendChild(ficha);
    this.abajo();
  }

  mostrarEquipo() {
    const p = this.player;
    const ficha = this.nuevaFicha();

    this.fLn(ficha, "EQUIPO", "ficha-nombre");
    this.fLn(ficha, "los seis huecos del cultivador", "ficha-sub");

    for (const slot of SLOTS) {
      const mid = p.equipado[slot];
      if (mid) {
        const st = statsCortos(mid);
        this.fSpans(ficha, [
          [slot.padEnd(8), "ficha-sub"],
          [ITEMS[mid].name, null],
          [st ? "   " + st : "", "ficha-sub"],
        ]);
      } else {
        this.fSpans(ficha, [
          [slot.padEnd(8), "ficha-sub"],
          ["(vacío)", "ficha-vacio"],
        ]);
      }
    }

    const equipables = agruparObjetos(p.inventario.filter(m => ITEMS[m] && ITEMS[m].slot));
    this.fSeccion(ficha, "EN LA ALFORJA (sin equipar)");
    if (!equipables.length) {
      this.fLn(ficha, "nada equipable", "ficha-vacio");
    } else {
      for (const { mid, cantidad } of equipables) {
        const st = statsCortos(mid);
        this.fSpans(ficha, [
          [`  ${nombreCantidad(mid, cantidad)} `, null],
          [`[${ITEMS[mid].slot}]`, "ficha-sub"],
          [st ? "  " + st : "", "ficha-sub"],
        ]);
      }
    }

    this.contenido.appendChild(ficha);
    this.abajo();
  }

  // ---------- guardado ----------

  abrirAtlas() {
    const dialogo = document.getElementById("atlas");
    if (dialogo.open) { this.cerrarAtlas(); return; }
    if (document.getElementById("registroMisiones").open) this.cerrarMisiones();
    if (document.getElementById("oficios").open) this.cerrarOficios();
    if (document.getElementById("cultivo").open) this.cerrarCultivo();
    this.reiniciarVistaAtlas();
    document.getElementById("atlasBusqueda").value = "";
    this.renderAtlas();
    dialogo.showModal();
  }

  // ---------- Atlas por áreas (ver68 · Etapa 2B) ----------
  // La vista del Atlas es (atlasAreaVista, atlasCapaVista): dos dimensiones independientes.
  // Consultarla NUNCA mueve al personaje (this.pos). Todo este estado es sólo de interfaz.

  // Abrir el Atlas: pestaña MAPA, vista = área y capa físicas, selección = tu sala, y sólo el
  // acordeón de tu área abierto en las tres pestañas de registros.
  reiniciarVistaAtlas() {
    this.atlasPestana = "mapa";
    this.atlasSeleccion = this.pos;
    this.sincronizarVistaAtlas();
    this.atlasRecentrar = true;
    const aqui = areaDeSala(this.pos);
    this.atlasAcordeones = { lugares: new Set([aqui]), personas: new Set([aqui]), bestiario: new Set([aqui]) };
  }

  vistaAtlasFisica() {
    return { area: areaDeSala(this.pos), capa: capaMapaDeSala(this.pos), sala: this.pos };
  }

  // La vista consultada pasa a ser la física (área y capa de this.pos).
  sincronizarVistaAtlas() {
    this.atlasAreaVista = areaDeSala(this.pos);
    this.atlasCapaVista = capaMapaDeSala(this.pos);
  }

  // Áreas conocidas: las que tienen al menos una room visitada, en el orden de AREAS.
  areasConocidas() {
    const halladas = new Set();
    for (const rid of this.visitadas) { const a = areaDeSala(rid); if (a && AREAS[a]) halladas.add(a); }
    return Object.keys(AREAS).filter(a => halladas.has(a));
  }

  // Se puede consultar un área conocida, o aquella donde el jugador está (por si su sala
  // aún no constara como visitada).
  areaAtlasNavegable(area) {
    if (!AREAS[area]) return false;
    return this.areasConocidas().includes(area) || (!!this.player && area === areaDeSala(this.pos));
  }

  hojaAtlasNavegable(area,capa) {
    if(!AREAS[area]||!MAPA_CAPAS[capa])return false;
    return (!!this.player&&areaDeSala(this.pos)===area&&capaMapaDeSala(this.pos)===capa)
      ||[...this.visitadas].some(id=>areaDeSala(id)===area&&capaMapaDeSala(id)===capa);
  }

  capasConocidasAtlas(area) {
    return Object.keys(MAPA_CAPAS).filter(c=>this.hojaAtlasNavegable(area,c)).sort((a,b)=>MAPA_CAPAS[a].orden-MAPA_CAPAS[b].orden);
  }

  actualizarSelectorCapaAtlas(area,capa) {
    const sel=document.getElementById("atlasCapa"),capas=this.capasConocidasAtlas(area);
    sel.replaceChildren();sel.hidden=capas.length<2;
    for(const id of capas){const op=document.createElement("option");op.value=id;op.textContent=MAPA_CAPAS[id].nombre;sel.append(op);}
    sel.value=capa;
  }

  elegirCapaAtlas(capa) {
    const area=this.atlasAreaVista;
    if(!this.hojaAtlasNavegable(area,capa))return false;
    const sala=[...this.visitadas].find(id=>areaDeSala(id)===area&&capaMapaDeSala(id)===capa)
      ||(areaDeSala(this.pos)===area&&capaMapaDeSala(this.pos)===capa?this.pos:null);
    return this.cambiarVistaAtlas({area,capa,seleccion:sala});
  }

  estadoTransicionAtlas(origen,destino) {
    const gate=gateEntre(origen,destino),cerrado=!!gate&&!this.gates[gate.id],atajo=gate?.id.startsWith("ATAJO_ALA_");
    const visible=!(atajo&&cerrado&&(areaDeSala(origen)!=="primera_ala"||!this.visitadas.has(origen)));
    const area=areaDeSala(destino),capa=capaMapaDeSala(destino),navegable=this.hojaAtlasNavegable(area,capa);
    return {visible,cerrado,gate:gate?.id||null,navegable,nombre:this.visitadas.has(destino)?ROOMS[destino].name:"zona sin explorar",area,capa};
  }

  salidasVisiblesAtlas(rid) {
    return (this.atlas.salas[rid]?.salidas||this.salidasAtlas(rid)).filter(([dir,dest])=>
      salidaTopologicaValida(rid,dir,dest)&&this.estadoTransicionAtlas(rid,dest).visible);
  }

  // Sala con la que se abre un área elegida a mano: donde estás, si estás en ella; si no, la
  // visitada más recientemente (atlas.salas[rid].turno). Sin turno registrado o con
  // empate, gana la primera en el orden de ROOMS: un fallback determinista, sin inventar nada.
  salaBaseDeArea(area) {
    if (this.player && areaDeSala(this.pos) === area && this.visitadas.has(this.pos)) return this.pos;
    let mejor = null, turnoMejor = -Infinity;
    for (const rid of Object.keys(ROOMS)) {
      if (areaDeSala(rid) !== area || !this.visitadas.has(rid)) continue;
      const turno = Number.isFinite(this.atlas.salas[rid]?.turno) ? this.atlas.salas[rid].turno : -1;
      if (mejor === null || turno > turnoMejor) { mejor = rid; turnoMejor = turno; }
    }
    return mejor;
  }

  // Punto único de cambio de vista. No toca this.pos. Rechaza áreas todavía desconocidas.
  cambiarVistaAtlas({ area, capa, seleccion = null } = {}) {
    if (!this.hojaAtlasNavegable(area,capa)) return false;
    this.atlasAreaVista = area;
    this.atlasCapaVista = capa;
    if (seleccion && areaDeSala(seleccion)===area && capaMapaDeSala(seleccion)===capa) this.atlasSeleccion = seleccion;
    this.atlasRecentrar = true;
    this.renderAtlas();
    return true;
  }

  // Selector de áreas: la capa inicial es la de la sala base del área elegida.
  elegirAreaAtlas(area) {
    const base = this.areaAtlasNavegable(area)
      ? (this.salaBaseDeArea(area) || (area === areaDeSala(this.pos) ? this.pos : null)) : null;
    if (!base) { this.renderAtlas(); return false; } // repinta para que el selector no quede desincronizado
    return this.cambiarVistaAtlas({ area, capa: capaMapaDeSala(base), seleccion: base });
  }

  alternarAcordeonAtlas(clave, area) {
    const abiertos = (this.atlasAcordeones[clave] ||= new Set());
    if (abiertos.has(area)) abiertos.delete(area); else abiertos.add(area);
    this.renderAtlas();
  }

  // Cambio de pestaña: MAPA vuelve a la vista física; las listas eligen una entrada visible.
  cambiarPestanaAtlas(nombre) {
    const tab = nombre.toLowerCase();
    this.atlasPestana = tab;
    document.getElementById("atlasBusqueda").value = "";
    if (tab === "mapa") {
      this.atlasSeleccion = this.pos;
      this.sincronizarVistaAtlas();
      this.atlasRecentrar = true;
    } else {
      const registros = this.registrosAtlas(), aqui = areaDeSala(this.pos);
      const elegido = (tab === "lugares" && registros.find(r => r.id === this.pos))
        || registros.find(r => r.areas.includes(aqui)) || registros[0];
      this.atlasSeleccion = elegido?.id;
      const abrir = elegido && (elegido.areas.includes(aqui) ? aqui : elegido.areas[0]);
      if (abrir) (this.atlasAcordeones[tab] ||= new Set()).add(abrir);
    }
    this.renderAtlas();
  }

  // ---------- cámara del mapa ----------
  // El <svg> ocupa todo el marco y su viewBox es la "cámara": arrastrar la desplaza.
  // Al abrir (o al cambiar de nivel / pulsar CENTRAR) se coloca en su posición inicial:
  // la sala seleccionada (al abrir: donde estás) queda justo en el centro del marco.
  // Sin sala de referencia (nunca debería pasar con el dibujo ya construido) se cae al
  // centro del dibujo entero, sólo como resguardo.

  centrarVistaAtlas() {
    this.atlasCamara = null;
    this.atlasCamaraManual = false;
    this.ajustarCamaraAtlas();
  }

  camaraInicioAtlas() {
    const svg = this.mapaSvg, lim = this.atlasLimites;
    const el = svg.querySelector(`.mapa-nodo[data-room="${this.atlasSeleccion}"]`) || svg.querySelector(".mapa-nodo.actual");
    const p = el && posicionDibujoMapa(el.dataset.room);
    if (p) return { cx: p[0], cy: p[1] };
    return { cx: (lim.minX + lim.maxX) / 2, cy: (lim.minY + lim.maxY) / 2 };
  }

  // Recalcula escala y ventana según el tamaño real del marco. Si el diálogo aún está
  // cerrado (tamaño 0) no hace nada: el ResizeObserver de #atlasVista lo retoma al abrirse.
  ajustarCamaraAtlas() {
    const vista = document.getElementById("atlasVista"), svg = this.mapaSvg, lim = this.atlasLimites;
    if (!vista || !svg || !lim || svg.style.display === "none" || !vista.classList.contains("atlas-mapa-activo")) return;
    const W = vista.clientWidth, H = vista.clientHeight;
    if (!W || !H) return;
    const { ESCALA_MIN, ESCALA_MAX, MARGEN } = ATLAS_VISTA;
    const encaje = Math.min(W / (lim.ancho + 2 * MARGEN), H / (lim.alto + 2 * MARGEN));
    // atlasEscalaBase es el "encaje" (zoom 1x); atlasZoom es el factor manual que aplican los
    // botones +/- y la ruedita (ver zoomMapaAtlas). Sin zoom manual, atlasZoom queda en 1.
    this.atlasEscalaBase = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, encaje));
    this.atlasEscala = this.atlasEscalaBase * (this.atlasZoom ?? 1);
    this.atlasVentana = { vw: W / this.atlasEscala, vh: H / this.atlasEscala };
    // Sin movimiento manual la cámara sigue su posición inicial (así el mapa se reencuadra al redimensionar).
    if (!this.atlasCamara || !this.atlasCamaraManual) this.atlasCamara = this.camaraInicioAtlas();
    this.aplicarCamaraAtlas();
  }

  aplicarCamaraAtlas() {
    const svg = this.mapaSvg, lim = this.atlasLimites, cam = this.atlasCamara, v = this.atlasVentana;
    if (!svg || !lim || !cam || !v) return;
    const { VISIBLE_MIN } = ATLAS_VISTA;
    const acotar = (x, min, max, ventana) => {
      const lo = min - ventana / 2 + VISIBLE_MIN, hi = max + ventana / 2 - VISIBLE_MIN;
      return Math.min(Math.max(x, lo), Math.max(lo, hi));
    };
    cam.cx = acotar(cam.cx, lim.minX, lim.maxX, v.vw);
    cam.cy = acotar(cam.cy, lim.minY, lim.maxY, v.vh);
    svg.setAttribute("viewBox", `${cam.cx - v.vw / 2} ${cam.cy - v.vh / 2} ${v.vw} ${v.vh}`);
    const vista = document.getElementById("atlasVista");
    if (vista) { vista.scrollLeft = 0; vista.scrollTop = 0; } // el foco del teclado no debe desplazar el marco
    // MI ZONA: visible al mirar otra área u otra capa, o cuando el mapa se ha movido a mano.
    const otraVista = !!this.player && (this.atlasCapaVista !== this.capaMapaSala(this.pos) || this.atlasAreaVista !== areaDeSala(this.pos));
    const boton = document.getElementById("atlasCentrar");
    if (boton) boton.hidden = !(otraVista || this.atlasCamaraManual);
    this.actualizarZoomUIAtlas();
  }

  // Botones +/- (ancla = centro del marco) y ruedita (ancla = puntero, vía clientX/clientY):
  // el punto del dibujo bajo el ancla se mantiene fijo mientras cambia el zoom.
  zoomMapaAtlas(factor, clientX = null, clientY = null) {
    const vista = document.getElementById("atlasVista");
    if (!vista || !vista.classList.contains("atlas-mapa-activo")) return;
    if (!this.atlasEscalaBase || !this.atlasEscala || !this.atlasCamara || !this.atlasVentana) return;
    const { ZOOM_MIN, ZOOM_MAX } = ATLAS_VISTA;
    const zoomActual = this.atlasZoom ?? 1;
    const zoomNuevo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomActual * factor));
    if (Math.abs(zoomNuevo - zoomActual) < 1e-6) return;
    const rect = vista.getBoundingClientRect();
    const px = clientX != null ? clientX - rect.left : rect.width / 2;
    const py = clientY != null ? clientY - rect.top : rect.height / 2;
    const cam = this.atlasCamara, v = this.atlasVentana, escalaVieja = this.atlasEscala;
    const mundoX = (cam.cx - v.vw / 2) + px / escalaVieja;
    const mundoY = (cam.cy - v.vh / 2) + py / escalaVieja;
    this.atlasZoom = zoomNuevo;
    this.atlasEscala = this.atlasEscalaBase * zoomNuevo;
    this.atlasVentana = { vw: rect.width / this.atlasEscala, vh: rect.height / this.atlasEscala };
    cam.cx = mundoX - px / this.atlasEscala + this.atlasVentana.vw / 2;
    cam.cy = mundoY - py / this.atlasEscala + this.atlasVentana.vh / 2;
    this.atlasCamaraManual = true;
    this.aplicarCamaraAtlas();
  }

  // Refleja el zoom actual en los botones +/- (deshabilitados en los extremos) y en la
  // lectura de coordenadas junto a la rosa de los vientos (decorativa: el mapa nunca rota).
  actualizarZoomUIAtlas() {
    const { ZOOM_MIN, ZOOM_MAX } = ATLAS_VISTA;
    const zoom = this.atlasZoom ?? 1;
    const masBtn = document.getElementById("atlasZoomMas"), menosBtn = document.getElementById("atlasZoomMenos");
    if (masBtn) masBtn.disabled = zoom >= ZOOM_MAX - 1e-6;
    if (menosBtn) menosBtn.disabled = zoom <= ZOOM_MIN + 1e-6;
    const coord = document.getElementById("atlasCoord");
    if (coord && this.atlasCamara) {
      const col = Math.round(this.atlasCamara.cx / MAPA_CELDA), fila = Math.round(this.atlasCamara.cy / MAPA_CELDA);
      const ns = fila <= 0 ? `N${Math.abs(fila)}` : `S${fila}`;
      const eo = col < 0 ? `O${Math.abs(col)}` : `E${col}`;
      coord.textContent = `${ns} · ${eo}`;
    }
  }

  // dx/dy en píxeles de pantalla: el dibujo sigue al puntero.
  desplazarMapaAtlas(dx, dy) {
    if (!this.atlasCamara || !this.atlasEscala) return;
    this.atlasCamara.cx -= dx / this.atlasEscala;
    this.atlasCamara.cy -= dy / this.atlasEscala;
    this.atlasCamaraManual = true;
    this.aplicarCamaraAtlas();
  }

  // Al navegar con el teclado, una sala fuera de vista se trae al marco.
  revelarEnMapaAtlas(el) {
    const cam = this.atlasCamara, v = this.atlasVentana;
    if (!cam || !v || !el?.getBBox) return;
    const bb = el.getBBox(), pad = 22;
    const izq = cam.cx - v.vw / 2 + pad, der = cam.cx + v.vw / 2 - pad, arr = cam.cy - v.vh / 2 + pad, aba = cam.cy + v.vh / 2 - pad;
    let mx = 0, my = 0;
    if (bb.x < izq) mx = bb.x - izq; else if (bb.x + bb.width > der) mx = bb.x + bb.width - der;
    if (bb.y < arr) my = bb.y - arr; else if (bb.y + bb.height > aba) my = bb.y + bb.height - aba;
    if (!mx && !my) return;
    cam.cx += mx; cam.cy += my;
    this.atlasCamaraManual = true;
    this.aplicarCamaraAtlas();
  }

  cerrarAtlas() {
    document.getElementById("atlas").close();
    document.getElementById("entrada").focus({ preventScroll: true });
  }

  capaMapaSala(rid) {
    return capaMapaDeSala(rid);
  }

  // MI ZONA: vuelve al área, la capa y la sala físicas del jugador.
  centrarCapaAtlas() {
    if (!this.player || !ROOMS[this.pos]) return;
    this.sincronizarVistaAtlas();
    this.atlasSeleccion = this.pos;
    this.atlasRecentrar = true;
    this.renderAtlas();
  }

  // Cambio de capa vertical. Si el destino está en otra área, la vista cambia también de área.
  cambiarCapaAtlas(capa, destino = null) {
    if (!MAPA_CAPAS[capa]) return;
    const area = (destino && ROOMS[destino] ? areaDeSala(destino) : null) || this.atlasAreaVista || areaDeSala(this.pos);
    this.cambiarVistaAtlas({ area, capa, seleccion: destino });
  }

  // Grafo de lo descubierto, SIN filtrar por vista. Cada salida se clasifica con
  // clasificarSalidaAtlas(): las internas son aristas; las demás (vertical, area,
  // vertical_area) son transiciones, con `tipo`, en ambos extremos. ROOMS.exits no cambia.
  datosMapaAtlas() {
    const nodos = new Set([...this.visitadas,this.pos].filter(rid => ROOMS[rid]));
    const aristas = [];
    const saltos = new Map();
    const clavePar = (a, b) => [a, b].sort().join(":");

    for (const rid of [...this.visitadas].filter(id => ROOMS[id])) {
      const salidas = this.salidasVisiblesAtlas(rid);
      for (const [dir, dest] of salidas) {
        const tipo = clasificarSalidaAtlas(rid, dir, dest);
        if (!tipo) continue;
        nodos.add(dest);
        if (tipo === "interna") aristas.push([rid, dest, dir]);
        else {
          const clave = clavePar(rid, dest);
          if (!saltos.has(clave)) saltos.set(clave, { desde: rid, hacia: dest, dir, tipo });
        }
      }
    }

    const transiciones = new Map();
    const agregarTransicion = (rid, dato) => {
      if (!transiciones.has(rid)) transiciones.set(rid, []);
      const lista = transiciones.get(rid);
      if (!lista.some(t => t.destino === dato.destino && t.dir === dato.dir)) lista.push(dato);
    };
    for (const v of saltos.values()) {
      agregarTransicion(v.desde, { destino: v.hacia, dir: v.dir, tipo: v.tipo });
      if(this.estadoTransicionAtlas(v.hacia,v.desde).visible) agregarTransicion(v.hacia, { destino: v.desde, dir: DIRECCION_OPUESTA[v.dir], tipo: v.tipo });
    }
    return { nodos, aristas, transiciones };
  }

  renderAtlas() {
    const norm = txt => String(txt).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const tab = this.atlasPestana || "mapa";
    const mapa = tab === "mapa";
    const busqueda = norm(document.getElementById("atlasBusqueda").value || "");
    for (const nombre of ["Mapa", "Lugares", "Personas", "Bestiario"]) {
      document.getElementById("atlasTab" + nombre).setAttribute("aria-pressed", String(tab === nombre.toLowerCase()));
    }
    const alojamientosConocidos = this.player
      ? [...this.visitadas].filter(id => ROOMS[id]?.alojamiento).length : 0;
    const cantidad = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;
    const personasConocidas = Object.keys(this.atlas.personas).length;
    const criaturasConocidas = Object.keys(this.atlas.criaturas).length;
    document.getElementById("atlasResumen").textContent = this.player
      ? capitalizarSegmentosUI(`${cantidad(this.visitadas.size, "lugar explorado", "lugares explorados")} · ${cantidad(alojamientosConocidos, "alojamiento", "alojamientos")} · ${cantidad(personasConocidas, "persona", "personas")} · ${cantidad(criaturasConocidas, "criatura", "criaturas")}`)
      : "Tus primeros pasos escribirán este registro.";
    const svg = this.mapaSvg;
    svg.style.display = mapa && !busqueda ? "block" : "none";
    const lista = document.getElementById("atlasLista");
    lista.replaceChildren();
    const registros = this.registrosAtlas().filter(r => norm(r.nombre).includes(busqueda));
    if (!mapa || busqueda) this.dibujarListaAtlas(lista, registros, tab, !!busqueda);
    svg.replaceChildren();
    const barraNivel = document.getElementById("atlasNivel");
    document.getElementById("atlasVista").classList.toggle("atlas-mapa-activo", mapa && !busqueda);
    if (mapa && !busqueda) {
      const fisica = this.vistaAtlasFisica();
      if (!AREAS[this.atlasAreaVista]) this.atlasAreaVista = fisica.area;
      if (!this.hojaAtlasNavegable(this.atlasAreaVista,this.atlasCapaVista)) this.sincronizarVistaAtlas();
      const areaVista = this.atlasAreaVista, capaVista = this.atlasCapaVista;
      const infoArea = AREAS[areaVista] || null;
      const infoCapa = MAPA_CAPAS[capaVista] || MAPA_CAPAS.principal;
      const conocidas = this.areasConocidas();
      const navegables = new Set(conocidas);
      if (this.player && AREAS[fisica.area]) navegables.add(fisica.area);
      const enSuSitio = areaVista === fisica.area && capaVista === fisica.capa;
      barraNivel.hidden = false;
      aplicarAreaUI(barraNivel, areaVista);
      aplicarAreaUI(svg, areaVista);
      this.actualizarSelectorAreaAtlas(conocidas, areaVista, fisica.area);
      this.actualizarSelectorCapaAtlas(areaVista,capaVista);
      // Migas: Grulla Blanca › área que consultas › lugar seleccionado. Luego, la capa vertical
      // y una frase que deja claro dónde está tu personaje y que consultar no lo mueve.
      const migas = document.getElementById("atlasMigas");
      const rotuloArea = document.createElement("strong");
      rotuloArea.className = "atlas-migas-area";
      rotuloArea.textContent = infoArea ? infoArea.nombre : "—";
      migas.replaceChildren(document.createTextNode("Grulla Blanca › "), rotuloArea);
      const sel = this.atlasSeleccion;
      if (sel && ROOMS[sel] && areaDeSala(sel) === areaVista) {
        migas.append(document.createTextNode(" › " + (this.visitadas.has(sel) ? ROOMS[sel].name : "Camino sin explorar")));
      }
      const salaFisica = ROOMS[this.pos]?.name || "posición actual";
      document.getElementById("atlasNivelNombre").textContent = `Capa vertical: ${infoCapa.nombre} · ${infoCapa.detalle}`;
      document.getElementById("atlasNivelEstado").textContent = enSuSitio
        ? `Estás aquí · ${salaFisica}`
        : `Consultando otra parte del Atlas · tu personaje sigue en ${salaFisica} (${AREAS[fisica.area]?.nombre || "otra área"} · ${MAPA_CAPAS[fisica.capa]?.nombre || "otra sección"}). Consultar no lo mueve.`;
      document.getElementById("atlasCentrar").hidden = enSuSitio;

      const datos = this.datosMapaAtlas();
      // El mapa visible filtra por las DOS dimensiones a la vez: área y capa vertical.
      const nodos = new Set([...datos.nodos].filter(rid => areaDeSala(rid) === areaVista && this.capaMapaSala(rid) === capaVista));
      const aristas = datos.aristas.filter(([a, b]) => nodos.has(a) && nodos.has(b));
      if (![...nodos].some(rid => MAPA_POS[rid])) {
        svg.style.display = "none";
        document.getElementById("atlasVista").classList.remove("atlas-mapa-activo");
        const aviso = document.createElement("p"); aviso.textContent = "Cartografía pendiente. Lugares registrados en esta área:"; lista.appendChild(aviso);
        this.dibujarListaAtlas(lista, registros.filter(r => areaDeSala(r.id) === areaVista), "lugares", false);
      }
      const lineas=new Map();
      for(const [a,b]of aristas){const k=claveAristaMapa(a,b);if(MAPA_POS[a]&&MAPA_POS[b]&&!lineas.has(k))lineas.set(k,{a,b,puntos:polilineaMapa(a,b)});}
      const posiciones = [...nodos].map(posicionDibujoMapa).filter(Boolean).concat([...lineas.values()].flatMap(l=>l.puntos));

      // Escala fija por celda: todas las secciones se dibujan con el mismo
      // tamaño de sala. El marco se ajusta al dibujo (nunca al revés), así una
      // sección de tres salas no se agranda hasta parecer otro mapa.
      const R_NODO = 15, ANCHO_MIN = MAPA_CELDA * 2, ALTO_MIN = MAPA_CELDA;
      let minX = 0, maxX = ANCHO_MIN, minY = 0, maxY = ALTO_MIN;
      if (posiciones.length) {
        const xs = posiciones.map(p => p[0]), ys = posiciones.map(p => p[1]);
        minX = Math.min(...xs); maxX = Math.max(...xs); minY = Math.min(...ys); maxY = Math.max(...ys);
      }
      // Límites del dibujo de esta sección. El encuadre lo decide la cámara (ajustarCamaraAtlas).
      this.atlasLimites = { minX, maxX, minY, maxY, ancho: Math.max(ANCHO_MIN, maxX - minX), alto: Math.max(ALTO_MIN, maxY - minY) };

      const visibles=new Set(lineas.keys());
      for(const [clave,{a,b,puntos}]of lineas){
        const conocida=this.visitadas.has(a)&&this.visitadas.has(b);
        const trazo=trazosAristaMapa(clave,puntos,visibles,areaVista,capaVista);
        const attrs={d:trazo.d,class:"mapa-camino"+(conocida?"":" incierto"),fill:"none","pointer-events":"none",
          "data-edge":clave,"stroke-dasharray":conocida?"none":"3 5"};
        if(trazo.cortes.length)attrs["data-crossovers"]=trazo.cortes.join(" ");
        svg.appendChild(elSVG("path",attrs));
      }

      const seleccionar = id => { this.atlasSeleccion = id; this.renderAtlas(); };
      const cambiarPorTransicion = (rid, t) => {
        const areaDestino = areaDeSala(t.destino), capaDestino = this.capaMapaSala(t.destino);
        if (areaDestino === areaVista && capaDestino === capaVista) {
          this.atlasSeleccion = t.destino;
          this.renderAtlas();
          return;
        }
        this.cambiarVistaAtlas({ area: areaDestino, capa: capaDestino, seleccion: t.destino });
      };

      for (const rid of nodos) {
        const pos = posicionDibujoMapa(rid); if (!pos) continue;
        const visitado = this.visitadas.has(rid), actual = rid === this.pos;
        const nombre = visitado ? ROOMS[rid].name : "Camino sin explorar";
        const alojamiento = visitado ? ROOMS[rid].alojamiento : null;
        const ayudaDescanso = alojamiento ? ` · Puedes dormir: ${alojamiento.nombre}` : "";
        const g = elSVG("g", { role: "button", tabindex: "0", "data-room": rid,
          class: "mapa-nodo" + (actual ? " actual" : "") + (visitado ? "" : " sin-explorar"),
          "data-alojamiento": alojamiento ? "true" : "false",
          "aria-label": nombre + (actual ? " · Estás aquí" : "") + ayudaDescanso, style: "cursor:pointer" });
        const titulo = elSVG("title"); titulo.textContent = nombre + ayudaDescanso; g.appendChild(titulo);
        if (rid === this.atlasSeleccion) g.appendChild(elSVG("circle", { cx: pos[0], cy: pos[1], r: R_NODO + 5, class: "mapa-seleccion" }));
        g.appendChild(elSVG("circle", { cx: pos[0], cy: pos[1], r: R_NODO, class: "mapa-disco" }));
        const etiqueta = elSVG("text", { x: pos[0], y: pos[1] + 4.2, "text-anchor": "middle", class: "mapa-etiqueta", "pointer-events": "none" });
        etiqueta.textContent = visitado ? (MAPA_ETIQ[rid] || "·").toUpperCase() : "?";
        g.appendChild(etiqueta);
        if (alojamiento) {
          // ☾ arriba a la izquierda; las flechas de nivel ocupan la derecha.
          g.appendChild(elSVG("circle", { cx: pos[0] - 12, cy: pos[1] - 12, r: 6.5,
            class: "mapa-alojamiento-fondo", "pointer-events": "none" }));
          const descanso = elSVG("text", { x: pos[0] - 12, y: pos[1] - 9,
            "text-anchor": "middle", "font-family": "serif", "font-size": 9,
            class: "mapa-alojamiento", "pointer-events": "none" });
          descanso.textContent = "☾";
          g.appendChild(descanso);
        }
        g.addEventListener("click", () => seleccionar(rid));
        g.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); seleccionar(rid); } });
        svg.appendChild(g);

        // Transiciones. Marcan que este nodo es un puente hacia otra capa vertical (vertical),
        // hacia otra área (area) o hacia ambas (vertical_area), pero NO cargan esa vista: sólo al
        // pulsarlas el Atlas la consulta (y nunca se mueve al jugador). Las verticales van en las
        // esquinas de la derecha; las de área, en el lado de su dirección cardinal, que no tiene
        // línea porque no es una arista interna. Si el destino es un área todavía sin visitar, la
        // transición se dibuja "desconocida": sin nombre y sin acción hasta pisar esa área.
        const trans = (datos.transiciones.get(rid) || []).slice().sort((a,b) => a.dir.localeCompare(b.dir));
        let arribaN = 0, abajoN = 0;
        for (const t of trans) {
          const vertical = DIRECCIONES_VERTICALES.includes(t.dir), arriba = t.dir === "arriba";
          const areaDestino = areaDeSala(t.destino), capaDestino = this.capaMapaSala(t.destino);
          const infoDestino = MAPA_CAPAS[capaDestino];
          const cambiaArea = areaDestino !== areaVista, cambiaNivel = capaDestino !== capaVista;
          const estado=this.estadoTransicionAtlas(rid,t.destino);
          if(!estado.visible)continue;
          const navegable = estado.navegable;
          const conocido = this.visitadas.has(t.destino);
          const nombreDestino = estado.nombre;
          const verbo = arriba ? "Subir" : t.dir === "abajo" ? "Bajar" : `Ir al ${t.dir}`;
          const partesVista = [];
          if (navegable && cambiaArea) partesVista.push(AREAS[areaDestino].nombre);
          if (navegable && cambiaNivel && infoDestino) partesVista.push(infoDestino.nombre);
          const vista = partesVista.join(" · ");
          const glifo = vertical ? (arriba ? "↑" : "↓") : FLECHA_DIR[t.dir];
          const etiqueta = (estado.cerrado?"Paso cerrado · ":"") + (navegable
            ? `${verbo} hacia ${nombreDestino}${vista ? " · ver " + vista : ""}`
            : `${verbo} hacia una zona sin explorar · recórrela para poder consultarla`);
          const clases = ["mapa-transicion"];
          if(estado.cerrado)clases.push("cerrada");
          if (navegable && cambiaArea) clases.push("area");
          if (!navegable) clases.push("desconocida");
          if (vertical && !cambiaNivel && !cambiaArea) clases.push("local");
          const tg = elSVG("g", {
            role: "button", tabindex: "0", class: clases.join(" "),
            "data-map-target": t.destino, "data-dir": t.dir, "data-tipo": t.tipo,
            "aria-label": etiqueta, style: "cursor:pointer" + (navegable && cambiaArea ? `;--area-destino:${AREAS[areaDestino].color}` : "")
          });
          if (!navegable) tg.setAttribute("aria-disabled", "true");
          const tt = elSVG("title");
          tt.textContent = (estado.cerrado?"Paso cerrado · ":"") + `${glifo} ${nombreDestino}` + (navegable
            ? (vista ? ` · ${vista} · clic para consultar esa vista` : "")
            : " · recórrela para poder consultarla");
          tg.appendChild(tt);
          let bx, by;
          if (vertical) {
            const indice = arriba ? arribaN++ : abajoN++;
            bx = pos[0] + 14 + indice * 21; by = pos[1] + (arriba ? -14 : 14);
            tg.appendChild(elSVG("circle", { cx: bx, cy: by, r: 13, class: "mapa-transicion-zona" }));
            tg.appendChild(elSVG("circle", { cx: bx, cy: by, r: 9.5, class: `mapa-transicion-fondo${vertical && !cambiaNivel && !cambiaArea ? " local" : ""}` }));
            const punta = arriba ? 1 : -1; // 1: punta hacia arriba · -1: punta hacia abajo
            tg.appendChild(elSVG("path", {
              d: `M ${bx - 4} ${by + punta * 2} L ${bx} ${by - punta * 2.6} L ${bx + 4} ${by + punta * 2}`,
              class: `mapa-transicion-flecha${vertical && !cambiaNivel && !cambiaArea ? " local" : ""}`
            }));
          } else {
            const [ux, uy] = { norte: [0, -1], sur: [0, 1], este: [1, 0], oeste: [-1, 0] }[t.dir];
            bx = pos[0] + ux * 26; by = pos[1] + uy * 26;
            tg.appendChild(elSVG("line", { x1: pos[0] + ux * R_NODO, y1: pos[1] + uy * R_NODO, x2: bx - ux * 7, y2: by - uy * 7, class: "mapa-transicion-enlace" }));
            tg.appendChild(elSVG("circle", { cx: bx, cy: by, r: 10, class: "mapa-transicion-zona" }));
            tg.appendChild(elSVG("circle", { cx: bx, cy: by, r: 7, class: "mapa-transicion-fondo" }));
            // Cheurón que apunta hacia el área vecina (la punta sigue la dirección cardinal).
            tg.appendChild(elSVG("path", {
              d: `M ${bx - ux * 2 - uy * 3.4} ${by - uy * 2 + ux * 3.4} L ${bx + ux * 3} ${by + uy * 3} L ${bx - ux * 2 + uy * 3.4} ${by - uy * 2 - ux * 3.4}`,
              class: "mapa-transicion-flecha"
            }));
          }
          const activar = ev => {
            ev.stopPropagation();
            if (navegable) cambiarPorTransicion(rid, t);
          };
          tg.addEventListener("click", activar);
          tg.addEventListener("keydown", ev => {
            if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); activar(ev); }
          });
          svg.appendChild(tg);
        }
      }

      svg.classList.remove("atlas-cambio-nivel");
      void svg.getBoundingClientRect();
      svg.classList.add("atlas-cambio-nivel");
      if (this.atlasRecentrar) {
        // Nueva apertura, nivel distinto o CENTRAR: la cámara (y el zoom) vuelven a su estado inicial.
        this.atlasRecentrar = false;
        this.atlasCamara = null;
        this.atlasCamaraManual = false;
        this.atlasZoom = 1;
      }
      this.ajustarCamaraAtlas();
    } else {
      barraNivel.hidden = true;
    }
    this.detalleAtlas();
  }

  // Lista de registros (LUGARES, PERSONAS, BESTIARIO y resultados de búsqueda) agrupada por
  // área en acordeones. El estado abierto/cerrado vive en atlasAcordeones (sólo UI). Al
  // buscar, la búsqueda es global: todos los grupos con coincidencias se muestran abiertos
  // sin tocar el estado manual, que reaparece al borrar la búsqueda.
  dibujarListaAtlas(lista, registros, tab, buscando) {
    const clave = tab === "mapa" ? "lugares" : tab;
    const abiertos = (this.atlasAcordeones[clave] ||= new Set());
    const aqui = areaDeSala(this.pos);
    const seleccionar = id => {
      this.atlasSeleccion = id;
      if (tab === "mapa" && ROOMS[id]) { // resultado de búsqueda en MAPA: al borrarla, el mapa muestra ese lugar
        this.atlasAreaVista = areaDeSala(id); this.atlasCapaVista = capaMapaDeSala(id); this.atlasRecentrar = true;
      }
      this.renderAtlas();
    };
    for (const g of this.agruparRegistrosAtlas(registros)) {
      const abierto = buscando || abiertos.has(g.area);
      const idCuerpo = `atlasArea-${clave}-${g.area || "sin_ubicacion"}`;
      const cab = document.createElement("button");
      cab.type = "button"; cab.className = "chip atlas-area-cab";
      cab.setAttribute("aria-expanded", String(abierto)); cab.setAttribute("aria-controls", idCuerpo);
      aplicarAreaUI(cab, g.area);
      const rotulo = document.createElement("span");
      rotulo.textContent = `${abierto ? "▾" : "▸"} ${g.nombre}${g.area && g.area === aqui ? " · aquí" : ""}`;
      const cuenta = document.createElement("span");
      cuenta.className = "atlas-area-n"; cuenta.textContent = String(g.registros.length);
      cab.append(rotulo, cuenta);
      cab.addEventListener("click", () => { if (!buscando) this.alternarAcordeonAtlas(clave, g.area); });
      const cuerpo = document.createElement("div");
      cuerpo.className = "atlas-area-cuerpo"; cuerpo.id = idCuerpo; cuerpo.hidden = !abierto;
      cuerpo.setAttribute("role", "group"); cuerpo.setAttribute("aria-label", g.nombre);
      for (const r of g.registros) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "chip atlas-entrada"; b.dataset.id = r.id;
        const ofreceDescanso = (tab === "mapa" || tab === "lugares") && !!ROOMS[r.id]?.alojamiento;
        b.textContent = r.nombre + (ofreceDescanso ? "  🛏" : "");
        if (ofreceDescanso) b.setAttribute("aria-label", `${r.nombre} · Puedes dormir aquí`);
        b.setAttribute("aria-current", String(r.id === this.atlasSeleccion));
        b.addEventListener("click", () => seleccionar(r.id));
        cuerpo.appendChild(b);
      }
      lista.append(cab, cuerpo);
    }
    if (!registros.length) { const p = document.createElement("p"); p.textContent = "No hay registros conocidos para esta búsqueda."; lista.appendChild(p); }
  }

  // Selector de áreas descubiertas: sólo las conocidas y oculto si hay una sola.
  actualizarSelectorAreaAtlas(conocidas, areaVista, areaFisica) {
    const sel = document.getElementById("atlasArea");
    sel.replaceChildren();
    for (const id of conocidas) {
      const o = document.createElement("option");
      o.value = id; o.textContent = AREAS[id].nombre + (id === areaFisica ? " · aquí" : "");
      sel.appendChild(o);
    }
    sel.value = conocidas.includes(areaVista) ? areaVista : "";
    sel.hidden = conocidas.length <= 1;
  }

  detalleAtlas() {
    const cont = document.getElementById("atlasDetalle"); cont.replaceChildren();
    const escribir = (txt, tag = "p", clase = "") => {
      const e = document.createElement(tag); e.textContent = capitalizarSegmentosUI(txt); e.className = clase; cont.appendChild(e);
    };
    const id = this.atlasSeleccion;
    const tab = this.atlasPestana || "mapa";
    if (!this.player) { escribir("El primer paso", "h3"); escribir("Crea o carga tu personaje para consultar sus descubrimientos."); return; }
    if (!id) { escribir("Registro de la montaña", "h3"); escribir("Selecciona una entrada para consultar tus recuerdos."); return; }
    if (tab === "mapa" || tab === "lugares") {
      if (!this.visitadas.has(id) || !ROOMS[id]) { escribir("Tras la niebla", "h3"); escribir("Has distinguido un camino. Explóralo para conocer su nombre y lo que guarda."); return; }
      const s = ROOMS[id], r = this.atlas.salas[id];
      escribir(s.name, "h3");
      escribir(id === this.pos ? "Estás aquí." : "Lugar explorado.", "p", "atlas-nota");
      if (AREAS[areaDeSala(id)]) escribir(`Territorio: ${AREAS[areaDeSala(id)].nombre} · Capa vertical: ${MAPA_CAPAS[this.capaMapaSala(id)].nombre}`, "p", "atlas-nota");
      escribir(s.desc);
      if (s.alojamiento) {
        escribir("DESCANSO", "h4");
        escribir(`☾ Puedes dormir aquí: ${capitalizarUI(s.alojamiento.nombre)}.`);
        escribir(`Dormir recupera toda la vida, hasta la mitad del qi máximo y renueva las venas agotadas. ${s.alojamiento.purifica
          ? "Este alojamiento seguro también purifica una impureza."
          : "Este refugio precario no purifica impurezas."}`, "p", "atlas-nota");
        if (id === this.pos) escribir("Comando disponible: DORMIR.", "p", "atlas-nota");
      }
      if (!r) escribir("Esta visita aún no tiene una ficha completa. Vuelve para registrar habitantes, recursos y condiciones.", "p", "atlas-nota");
      else {
        escribir("VENA Y PELIGROS", "h4");
        escribir(`Vena ${r.vena}. ${r.resentida ? "El qi resentido puede herirte al meditar." : r.salvaje ? "Zona salvaje: la meditación puede atraer criaturas." : "Sin peligro ambiental registrado."}`);
        escribir("PERSONAS CONOCIDAS", "h4");
        escribir(r.npcs.map(n => capitalizarUI(NOMBRES_NPC[n] || n)).join(", ") || "Ninguna registrada.");
        escribir("RECURSOS Y OBJETOS DESCUBIERTOS", "h4");
        escribir(r.items.map(m => capitalizarUI(ITEMS[m]?.name || m)).join(", ") || "Ninguno registrado.");
        escribir("CRIATURAS AVISTADAS", "h4");
        escribir(r.mobs.map(m => capitalizarUI(MOBS[m]?.name || m)).join(", ") || "Ninguna registrada.");
        escribir(`Recuerdo de tu visita en el turno ${r.turno}. Los objetos y habitantes pueden haber cambiado.`, "p", "atlas-nota");
      }
      escribir("CAMINOS CONOCIDOS", "h4");
      for (const [dir, dest] of this.salidasVisiblesAtlas(id)) {
        const estado=this.estadoTransicionAtlas(id,dest),tipo=clasificarSalidaAtlas(id,dir,dest);
        const prefijo=estado.cerrado?"Paso cerrado · ":"";
        if(tipo&&tipo!=="interna"&&estado.navegable){
          const b=document.createElement("button");b.type="button";b.className="chip atlas-vertical";
          b.textContent=`${prefijo}${capitalizarUI(dir)} → ${estado.nombre} · Ver ${AREAS[estado.area].nombre} · ${MAPA_CAPAS[estado.capa].nombre}`;
          aplicarAreaUI(b,estado.area);b.addEventListener("click",()=>this.cambiarVistaAtlas({area:estado.area,capa:estado.capa,seleccion:dest}));cont.appendChild(b);
        }else escribir(`${prefijo}${capitalizarUI(dir)} → ${estado.nombre}`);
      }
      const misiones = Object.entries(this.quests).filter(([qid]) => SALAS_MISIONES_ATLAS[qid]?.includes(id) && QUESTS[qid]);
      if (misiones.length) escribir("ENCARGOS Y PISTAS CONOCIDAS", "h4");
      for (const [qid, estado] of misiones) {
        escribir(`${QUESTS[qid].nombre} · ${estado === "hecha" ? "Completada" : "Pendiente"}`);
        escribir(QUESTS[qid].desc, "p", "atlas-nota");
        if (estado !== "hecha" && QUESTS[qid].progreso) escribir(QUESTS[qid].progreso(this), "p", "atlas-nota");
      }
    } else if (tab === "personas") {
      const r = this.atlas.personas[id]; if (!r) return;
      escribir(capitalizarUI(NOMBRES_NPC[id] || id), "h3");
      escribir(r.descripcion || "Lo has visto. Examínalo cuando lo encuentres para completar su ficha.");
      escribir("ÚLTIMO ENCUENTRO", "h4");
      escribir(`${ROOMS[r.sala]?.name || "Lugar desconocido"} · Turno ${r.turno}`);
      const areasPersona = this.indiceAreasAtlas().personas[id] || [];
      if (areasPersona.length) { escribir("ÁREAS DONDE LO VISTE", "h4"); escribir(areasPersona.map(a => AREAS[a].nombre).join(", ")); }
      escribir("Su presencia actual no está garantizada.", "p", "atlas-nota");
    } else {
      const r = this.atlas.criaturas[id], m = MOBS[id]; if (!r || !m) return;
      escribir(capitalizarUI(m.name), "h3");
      escribir(r.errante ? "Has observado huellas de una criatura errante." : "Criatura avistada durante tus viajes.");
      escribir("ÚLTIMO AVISTAMIENTO", "h4");
      escribir(`${ROOMS[r.sala]?.name || "Lugar desconocido"} · Turno ${r.turno}`);
      escribir("LUGARES DONDE LA VISTE", "h4");
      escribir(r.lugares.map(rid => ROOMS[rid]?.name || rid).join(", "));
      const areasCriatura = this.indiceAreasAtlas().criaturas[id] || [];
      if (areasCriatura.length) { escribir("ÁREAS DONDE LA VISTE", "h4"); escribir(areasCriatura.map(a => AREAS[a].nombre).join(", ")); }
      if (r.examinada) {
        escribir("OBSERVACIONES", "h4");
        escribir(ASTRA_A08_MONSTER_PRESENTATION.referenceLine(ASTRA_A08_DATA,id));
        if (m.elemento) escribir(`Elemento: ${capitalizarUI(m.elemento)}`);
        const nativeTechnique=ASTRA_A08_MONSTER_PRESENTATION.technique(ASTRA_A08_DATA,id);if(nativeTechnique)escribir(nativeTechnique);
      } else escribir("Examínala en la sala para registrar sus capacidades.", "p", "atlas-nota");
      escribir("BOTÍN REGISTRADO", "h4");
      escribir("El Atlas sólo revela un hallazgo después de que haya caído al menos una vez. Las demás posibilidades permanecen ocultas.", "p", "atlas-nota");
      const tablaBotin = document.createElement("div");
      tablaBotin.className = "atlas-botin";
      const botinConocido = r.botin || {};
      for (const drop of m.loot || []) {
        const conocimiento = botinConocido[drop.item];
        const fila = document.createElement("div");
        fila.className = "atlas-drop" + (conocimiento ? " conocido" : " oculto");
        const nombre = document.createElement("div");
        nombre.className = "atlas-drop-nombre";
        const dato = document.createElement("div");
        dato.className = "atlas-drop-dato";
        if (conocimiento) {
          nombre.textContent = `◆ ${capitalizarUI(ITEMS[drop.item]?.name || drop.item)}`;
          const veces = document.createElement("span");
          veces.className = "atlas-drop-veces";
          veces.textContent = `Obtenido ${conocimiento.veces} ${conocimiento.veces === 1 ? "vez" : "veces"}`;
          nombre.appendChild(veces);
          dato.textContent = this.porcentajeBotin(drop.prob);
          dato.setAttribute("aria-label", `Probabilidad de caída ${dato.textContent}`);
        } else {
          nombre.textContent = "◇ Hallazgo desconocido";
          dato.textContent = "Probabilidad oculta";
        }
        fila.append(nombre, dato);
        tablaBotin.appendChild(fila);
      }
      if (!(m.loot || []).length) {
        const vacio = document.createElement("p");
        vacio.className = "atlas-nota";
        vacio.textContent = "No has observado que esta criatura deje objetos aprovechables.";
        tablaBotin.appendChild(vacio);
      }
      cont.appendChild(tablaBotin);
      // EXTRACCIONES POSIBLES: mismo formato que BOTÍN REGISTRADO.
      escribir("EXTRACCIONES POSIBLES", "h4");
      const tablaExtr = document.createElement("div");
      tablaExtr.className = "atlas-botin";
      const posibles = this.extraccionesEspecieExamen(id);
      if (!posibles.length) {
        const vacio = document.createElement("p");
        vacio.className = "atlas-nota";
        vacio.textContent = "Sin extracciones posibles";
        tablaExtr.appendChild(vacio);
      } else if (!this.especieExaminadaExamen(id)) {
        const fila = document.createElement("div");
        fila.className = "atlas-drop oculto";
        const nombre = document.createElement("div");
        nombre.className = "atlas-drop-nombre";
        nombre.textContent = "◇ No examinada";
        const dato = document.createElement("div");
        dato.className = "atlas-drop-dato";
        fila.append(nombre, dato);
        tablaExtr.appendChild(fila);
      } else {
        for (const mid of posibles) {
          const fila = document.createElement("div");
          fila.className = "atlas-drop conocido";
          const nombre = document.createElement("div");
          nombre.className = "atlas-drop-nombre";
          nombre.textContent = `◆ ${capitalizarUI(ITEMS[mid].name)}`;
          const dato = document.createElement("div");
          dato.className = "atlas-drop-dato";
          fila.append(nombre, dato);
          tablaExtr.appendChild(fila);
        }
      }
      cont.appendChild(tablaExtr);
    }
  }

  abrirMeridianos() {
    const d = document.getElementById("meridianos");
    if (d.open) { this.cerrarMeridianos(); return; }
    if (document.getElementById("atlas").open) this.cerrarAtlas();
    if (document.getElementById("registroMisiones").open) this.cerrarMisiones();
    if (document.getElementById("oficios").open) this.cerrarOficios();
    if (document.getElementById("cultivo").open) this.cerrarCultivo();
    this.merTid = this.tecnicasDescubiertas()[0] || null;
    this.merVista = null;
    this.merFiltro = "todas";
    this.merTab = "tecnicas";          // al abrir, siempre TÉCNICAS
    this.merBuildId = null;
    this.merForm = null;               // editor inline (guardar/renombrar)
    this.merConfirm = null;            // confirmación inline (activar/actualizar/…)
    this.normalizarBuilds();
    document.getElementById("merBusqueda").value = "";
    document.getElementById("merAviso").textContent = "";
    this.renderMeridianos(); d.showModal();
  }

  cerrarMeridianos() {
    document.getElementById("meridianos").close();
    document.getElementById("entrada").focus({ preventScroll: true });
  }

  renderMeridianos() {
    const lista = document.getElementById("merLista"), arbol = document.getElementById("merArbol"), detalle = document.getElementById("merDetalle");
    lista.replaceChildren(); arbol.replaceChildren(); detalle.replaceChildren();
    const escribir = (cont, texto, tag = "p", clase = "") => {
      const e = document.createElement(tag); e.textContent = capitalizarSegmentosUI(texto); e.className = clase; cont.appendChild(e); return e;
    };
    const boton = (cont, texto, accion, disabled = false) => {
      const b = escribir(cont, texto, "button", "chip mer-boton"); b.type = "button"; b.disabled = disabled; b.addEventListener("click", accion); return b;
    };
    const botonForma = (cont, { nombre, efecto, estado, activa, elegida, bloqueada, accion, accionDoble }) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `mer-opcion${activa ? " is-activa" : ""}${elegida && !activa ? " is-elegida" : ""}${bloqueada ? " is-bloqueada" : ""}`;
      const insignia = escribir(b, estado, "span", "mer-opcion-insignia");
      insignia.setAttribute("aria-hidden", "true");
      escribir(b, nombre, "strong", "mer-opcion-nombre");
      escribir(b, efecto, "span", "mer-opcion-efecto");
      b.setAttribute("aria-label", `${nombre}. ${estado}. ${efecto}${accionDoble ? ". Doble clic para asignar, cambiar o retirar el punto directamente." : ""}`);
      if (accionDoble) {
        // El clic simple se difiere unas milésimas para que el primer clic no
        // vuelva a renderizar el árbol y destruya el botón antes de que el
        // navegador pueda reconocer el doble clic.
        let temporizador = null;
        b.addEventListener("click", ev => {
          if (ev.detail >= 2) {
            if (temporizador) clearTimeout(temporizador);
            temporizador = null;
            accionDoble(ev);
            return;
          }
          if (temporizador) clearTimeout(temporizador);
          temporizador = setTimeout(() => {
            temporizador = null;
            accion(ev);
          }, 230);
        });
      } else b.addEventListener("click", accion);
      cont.appendChild(b);
      return b;
    };
    const elementosDe = t => t.elementos || [t.elemento];
    const claveElemento = t => t.elementos ? "mixta" : t.elemento;
    const simbolosDe = t => elementosDe(t).map(e => ELEMENTO_UI[e]?.simbolo || "◇").join(" + ");
    const nombresElementos = t => elementosDe(t).map(e => ELEMENTO_UI[e]?.nombre || capitalizarUI(e)).join(" + ");
    const metricas = (tidM, c) => {
      const tm = TECNICAS[tidM], filas = [["Coste", `${c.coste} qi`], ["Rol", ROL_TECNICA[tm.tipo] || capitalizarUI(tm.tipo)]];
      if (tm.tipo === "ofensiva") filas.push(["Daño", `${dadoARango(c.daño)} · promedio ${promedioDado(c.daño)}`], ["Precisión", `+${porcentajePrecision(c.ataqueBono)}%`], ["Probabilidad de crítico", `${probabilidadCritico(c.critMin)}%`], ["Daño crítico", multiplicadorUI(c.critMult)], ["Objetivos", c.area ? "Todos · 65% contra uno" : "Uno"]);
      if (tm.tipo === "guardia") filas.push(["Protección", `${c.guardia} por golpe`], ["Reserva", `${c.capacidad} de daño`]);
      if (tm.tipo === "fortificacion") filas.push(["Defensa", `+${c.defensa}`], ["Duración", `${c.duracion} rondas`]);
      if (tm.tipo === "esquiva") filas.push(["Esquiva", `+${c.esquiva}%`], ["Duración", `${c.duracion} rondas`]);
      if (tm.tipo === "control") filas.push(["Atadura", `${c.atadura} ronda${c.atadura === 1 ? "" : "s"}`], ["Precisión de control", `+${porcentajePrecision(c.controlBono)}%`], ["Enfriamiento", `${c.atadura} ronda${c.atadura === 1 ? "" : "s"}`], ["Objetivos", "Uno · Jefes: máximo 1 ronda"]);
      const efectos = [];
      if (c.quemadura) efectos.push(`Quemadura ${dadoARango(c.quemadura.daño)} × ${c.quemadura.turnos}`);
      if (c.debil) efectos.push(`Ataque enemigo ${c.debil.ataque} × ${c.debil.turnos}`);
      if (c.ataduraGolpe) efectos.push(`Atadura ${c.ataduraGolpe}`);
      if (c.dañoAtar) efectos.push(`Corte ${dadoARango(c.dañoAtar)}`);
      if (efectos.length) filas.push(["Efectos", efectos.join(" · ")]);
      return filas;
    };
    const escribirInsignias = (cont, t, c) => {
      const caja = escribir(cont, "", "div", "mer-insignias");
      for (const e of elementosDe(t)) escribir(caja, `${ELEMENTO_UI[e]?.simbolo || "◇"} ${ELEMENTO_UI[e]?.nombre || capitalizarUI(e)}`, "span", `mer-insignia elemento mer-elemento-${e}`);
      escribir(caja, `GRADO ${String(t.rango).toUpperCase()}`, "span", "mer-insignia");
      escribir(caja, (ROL_TECNICA[t.tipo] || t.tipo).toUpperCase(), "span", "mer-insignia");
      if (c?.area) escribir(caja, "ÁREA", "span", "mer-insignia");
      return caja;
    };
    const escribirStats = (cont, tidS, c, base = null) => {
      const caja = escribir(cont, "", "div", "mer-stats");
      const valoresBase = base ? new Map(metricas(tidS, base)) : null;
      for (const [nombre, valor] of metricas(tidS, c)) {
        const cambio = valoresBase && valoresBase.get(nombre) !== valor;
        const penaliza = cambio && nombre === "Coste" && c.coste > base.coste;
        const celda = escribir(caja, "", "div", `mer-stat${cambio ? penaliza ? " is-penalty" : " is-boosted" : ""}`);
        escribir(celda, nombre.toUpperCase(), "b"); escribir(celda, valor, "span");
      }
    };
    const ids = this.tecnicasDescubiertas(), p = this.player;
    this.sincronizarPuntosTecnica();
    document.getElementById("merResumen").textContent = ids.length
      ? `${p.reino}${reinoExacto(p, "LianQi") ? " · Etapa " + p.etapa + "/" + totalEtapas(p.reino) : " · Fundación establecida"}`
      : "Cada técnica comienza con una primera respiración.";
    const puntosEl = document.getElementById("merPuntos");
    puntosEl.textContent = p
      ? `✦ ${this.puntosTecnicaDisponibles()} PUNTO${this.puntosTecnicaDisponibles() === 1 ? "" : "S"} DE TÉCNICA DISPONIBLE${this.puntosTecnicaDisponibles() === 1 ? "" : "S"}`
      : "PUNTOS DE TÉCNICA · CREA UN PERSONAJE";
    puntosEl.className = p && this.puntosTecnicaDisponibles() ? "" : "sin-puntos";
    // Las pestañas comparten cabecera, columnas y aviso: sólo cambia el contenido.
    this.merTab = this.merTab === "builds" ? "builds" : "tecnicas";
    const enBuilds = this.merTab === "builds";
    document.getElementById("merTabTecnicas").setAttribute("aria-selected", String(!enBuilds));
    document.getElementById("merTabBuilds").setAttribute("aria-selected", String(enBuilds));
    document.getElementById("merBuscador").hidden = enBuilds;
    document.getElementById("merKicker").textContent = enBuilds
      ? `BUILDS GUARDADAS · ${(p?.builds || []).length}/${MAX_BUILDS}`
      : "TÉCNICAS DESCUBIERTAS";
    if (!ids.length) { escribir(arbol, "Crea o carga un personaje para consultar sus técnicas."); return; }
    if (enBuilds) { this.renderMeridianosBuilds({ lista, detalle, arbol, escribir, boton, elementosDe, claveElemento }); return; }
    this.merFiltro ||= "todas";
    const filtros = escribir(lista, "", "div", "mer-filtros");
    const elementosPresentes = ELEMENTOS.filter(e => ids.some(id => elementosDe(TECNICAS[id]).includes(e)));
    const opcionesFiltro = ["todas", ...elementosPresentes];
    if (ids.some(id => TECNICAS[id].elementos)) opcionesFiltro.push("mixta");
    if (!opcionesFiltro.includes(this.merFiltro)) this.merFiltro = "todas";
    for (const filtro of opcionesFiltro) {
      const etiqueta = filtro === "todas" ? "Todas" : filtro === "mixta" ? "Definitivas" : ELEMENTO_UI[filtro].simbolo;
      const b = boton(filtros, etiqueta, () => { this.merFiltro = filtro; this.renderMeridianos(); });
      b.className += ` mer-filtro${filtro !== "todas" ? ` mer-elemento-${filtro}` : ""}`;
      b.setAttribute("aria-pressed", String(this.merFiltro === filtro));
    }
    const busqueda = quitaAcentos(document.getElementById("merBusqueda").value.toLowerCase());
    const visibles = ids.filter(id => {
      const t = TECNICAS[id], elementos = elementosDe(t);
      const coincideFiltro = this.merFiltro === "todas" || (this.merFiltro === "mixta" ? !!t.elementos : elementos.includes(this.merFiltro));
      return coincideFiltro && quitaAcentos(`${t.name} ${elementos.join(" ")}`.toLowerCase()).includes(busqueda);
    });
    const grupos = new Map();
    for (const id of visibles) {
      const t = TECNICAS[id], grupo = t.elementos ? "mixta" : t.elemento;
      if (!grupos.has(grupo)) grupos.set(grupo, []);
      grupos.get(grupo).push(id);
    }
    for (const grupo of [...ELEMENTOS, "mixta"]) {
      const tecnicasGrupo = grupos.get(grupo); if (!tecnicasGrupo?.length) continue;
      escribir(lista, grupo === "mixta" ? "DEFINITIVAS" : `${ELEMENTO_UI[grupo].simbolo} ${ELEMENTO_UI[grupo].nombre.toUpperCase()}`, "div", `mer-grupo mer-elemento-${grupo}`);
      for (const id of tecnicasGrupo) {
        const tg = TECNICAS[id], rg = p.tecnicas[id], invertidos = this.puntosTecnicaGastados(id);
        const progresoValor = this.progresoTecnica(id), meta = rg.maestria < 3 ? umbralMaestria(rg.maestria, id) : 1;
        const progreso = rg.maestria < 3 ? `${progresoValor}/${meta} usos` : "Consumada";
        const b = boton(lista, "", () => { this.merTid = id; this.merVista = null; this.renderMeridianos(); });
        b.className += ` mer-lista-tecnica mer-elemento-${claveElemento(tg)}`;
        const cab = escribir(b, "", "span", "mer-lista-cab");
        const nombre = escribir(cab, "", "span", "mer-lista-nombre");
        escribir(nombre, simbolosDe(tg), "span", "mer-lista-simbolo");
        escribir(nombre, tg.name, "span", "mer-lista-titulo");
        if (invertidos) escribir(cab, `${invertidos} PT`, "span", "mer-lista-pt");
        const metaFila = escribir(b, "", "span", "mer-lista-meta");
        escribir(metaFila, capitalizarUI(MAESTRIA_NOMBRES[rg.maestria]), "span");
        escribir(metaFila, progreso, "span");
        const barra = escribir(b, "", "span", "mer-lista-progreso");
        const relleno = escribir(barra, "", "span");
        relleno.style.width = `${rg.maestria >= 3 ? 100 : Math.min(100, progresoValor / meta * 100)}%`;
        b.setAttribute("aria-label", `${tg.name}. ${MAESTRIA_NOMBRES[rg.maestria]}. ${progreso}.${invertidos ? ` ${invertidos} puntos invertidos.` : ""}`);
        b.setAttribute("aria-pressed", String(this.merTid === id));
      }
    }
    if (!visibles.length) escribir(lista, "Sin coincidencias.");
    const tid = visibles.includes(this.merTid) ? this.merTid : visibles[0] || (ids.includes(this.merTid) ? this.merTid : ids[0]), t = TECNICAS[tid], rec = p.tecnicas[tid];
    this.merTid = tid;
    arbol.className = `mer-col mer-elemento-${claveElemento(t)}`;
    detalle.className = `mer-col mer-elemento-${claveElemento(t)}`;
    const cabArbol = escribir(arbol, "", "div", "mer-arbol-cabecera");
    escribir(cabArbol, "ÁRBOL DE CAUCES", "span");
    escribir(cabArbol, `${simbolosDe(t)} ${t.name}`, "strong");
    escribir(arbol, "El manual entrega la técnica base. Cada tramo permite escoger uno de tres cauces; todos cuestan 1 punto y puedes dejar el tramo sin especializar.", "p", "mer-guia");
    escribir(arbol, "Un clic compara un cauce. Doble clic asigna o cambia el punto; si ese cauce ya está activo, lo devuelve.", "p", "mer-guia mer-guia-doble");
    escribir(arbol, "Técnica base aprendida", "div", "mer-base-aprendida");
    for (const n of [1, 2, 3]) {
      const fila = escribir(arbol, "", "div", "mer-tramo");
      const bloqueo = this.bloqueoRama(tid, n);
      if (bloqueo) fila.className += " is-bloqueado";
      escribir(fila, `${n}. ${TRAMOS_MERIDIANOS[n]}`, "h4");
      const elegida = rec?.ramas?.[n] || 0;
      escribir(fila, bloqueo ? `🔒 ${bloqueo}` : elegida ? "Una elección activa; puedes cambiarla o retirar el punto en un lugar seguro." : "Desbloqueada · Sin especializar.", "p", "mer-tramo-estado");
      for (const op of [1, 2, 3]) {
        const variante = this.opcionMeridiano(tid, n, op); if (!variante) continue;
        const activa = !bloqueo && elegida === op;
        const estado = bloqueo ? "BLOQUEADA" : activa ? "✓ ACTIVA" : elegida ? "CAMBIAR" : "1 PUNTO";
        const mod = variante.mod;
        const efecto = this.textoModMeridiano(mod || {}, tid);
        const b = botonForma(fila, {
          nombre: variante.nombre, efecto, estado, activa,
          elegida: !bloqueo && elegida === op, bloqueada: !!bloqueo,
          accion: () => { this.merVista = { n, op }; this.renderMeridianos(); },
          accionDoble: bloqueo ? null : () => this.activarRamaDoble(tid, n, op)
        });
        b.setAttribute("aria-pressed", String(!bloqueo && elegida === op));
        b.setAttribute("aria-current", String(this.merVista?.n === n && this.merVista?.op === op));
      }
    }
    escribir(arbol, "Meridianos sellados. Los reinos superiores guardan caminos que todavía escapan a tu percepción.", "p", "mer-sellado");
    const confBase = this.statsTecnica(tid, { 1: 0, 2: 0, 3: 0 });
    const confActual = this.statsTecnica(tid);
    escribir(detalle, `${simbolosDe(t)}  ${t.name}`, "h3");
    escribirInsignias(detalle, t, confActual);
    escribir(detalle, GUIA_TECNICAS[tid]?.proposito || t.flavor[0], "p", "mer-descripcion-base");
    const resumenMejoras = this.resumenPotenciadoresMeridianos(tid, confActual, confBase);
    if (resumenMejoras) escribir(detalle, resumenMejoras, "p", "mer-mejoras-activas");
    // Estado en combate: preparar no cuesta puntos, no toca ramas y no consume turno.
    const preparada = this.estaPreparada(tid);
    const bloqueoPrep = this.bloqueoPreparacion();
    const franja = escribir(detalle, "", "div", `mer-preparacion${preparada ? " is-activa" : ""}`);
    escribir(franja, "ESTADO EN COMBATE", "span", "mer-preparacion-kicker");
    escribir(franja, preparada ? "● Preparada" : "○ No preparada", "strong", "mer-preparacion-estado");
    const botonPrep = boton(franja, preparada ? "Despreparar" : "Preparar", () => {
      const res = preparada ? this.despreprararTecnica(tid) : this.prepararTecnica(tid);
      this.renderMeridianos();
      document.getElementById("merAviso").textContent = res.texto;
    }, !!bloqueoPrep);
    botonPrep.className += " mer-preparacion-boton";
    botonPrep.setAttribute("aria-label", `${preparada ? "Despreparar" : "Preparar"} ${t.name}. Actualmente ${preparada ? "preparada" : "no preparada"}.`);
    if (bloqueoPrep) escribir(franja, bloqueoPrep, "span", "mer-preparacion-motivo");
    escribir(detalle, "EFECTO EN COMBATE", "h4");
    escribirStats(detalle, tid, confActual, confBase);
    escribir(detalle, "TÉCNICAS APLICADAS", "h4");
    const aplicadas = escribir(detalle, "", "div", "mer-aplicadas");
    let tieneAplicadas = false;
    for (const n of [1, 2, 3]) {
      const op = rec?.ramas?.[n] || 0;
      if (!op || this.bloqueoRama(tid, n)) continue;
      tieneAplicadas = true;
      const variante = this.opcionMeridiano(tid, n, op);
      const nombre = variante?.nombre;
      const mod = variante?.mod;
      const fila = escribir(aplicadas, "", "div", "mer-aplicada");
      escribir(fila, `TRAMO ${n}`, "span", "mer-aplicada-num");
      escribir(fila, nombre || "Cauce desconocido", "strong");
      escribir(fila, this.textoModMeridiano(mod || {}, tid), "span");
    }
    if (!tieneAplicadas) escribir(aplicadas, "Ningún cauce especializado. La técnica conserva solamente su forma base.", "div", "mer-aplicadas-vacio");
    const nivel = rec.maestria || 0, umbrales = umbralesTecnica(tid), progreso = this.progresoTecnica(tid);
    escribir(detalle, nivel < 3 ? `PROGRESO HACIA MAESTRÍA ${MAESTRIA_NOMBRES[nivel + 1].toUpperCase()}` : "MAESTRÍA CONSUMADA", "h4");
    if (nivel < 3) {
      const barraP = escribir(detalle, "", "div", "mer-progreso");
      const relleno = escribir(barraP, "", "span"); relleno.style.width = `${Math.min(100, progreso / umbrales[nivel] * 100)}%`;
      escribir(detalle, `${progreso}/${umbrales[nivel]} usos efectivos · Aprendizaje ${Math.round(this.ritmoTecnica(tid) * 100)}%`, "p", "atlas-nota");
    } else escribir(detalle, "Has abierto todos los tramos permitidos por tu reino actual.", "p", "atlas-nota");
    const afin = this.afinidadTecnica(tid);
    const circulacion = escribir(detalle, "", "div", `mer-circulacion${confActual.riesgo ? " inestable" : ""}`);
    escribir(circulacion, confActual.riesgo ? `⚠ Circulación inestable · ${confActual.riesgo}%` : afin === "parcial" ? "◐ Confluencia parcial segura" : "✓ Circulación segura", "strong");
    escribir(circulacion, confActual.riesgo
      ? "Puede consumir hasta 3 qi adicional y causar una herida meridiana."
      : afin === "parcial" ? "Una raíz sostiene la confluencia; el segundo elemento vuelve más lento el aprendizaje." : "Esta técnica no presenta riesgo para tus meridianos.", "span");
    if (t.definitiva) escribir(detalle, `DEFINITIVA · coste base ${t.costeBase} qi con ${porcentajeUI(RECARGO_DEFINITIVA)}% de recargo por confluencia. Recibe la concordancia con cualquiera de sus elementos, pero no prepara otra secuencia. Contra criaturas usa el mejor de sus elementos.`, "p", "atlas-nota");
    escribir(detalle, `✦ ${this.puntosTecnicaDisponibles()} de ${p.puntos_tecnica_total} puntos disponibles`, "p", "atlas-nota");
    const cambio = this.bloqueoReconfigurar();
    if (cambio) escribir(detalle, `Cambios bloqueados: ${cambio}`, "p", "atlas-nota");
    if (this.merVista) {
      const { n, op } = this.merVista;
      if ([1, 2, 3].includes(n) && [1, 2, 3].includes(op)) {
        const opcionVista = this.opcionMeridiano(tid, n, op);
        const mod = opcionVista?.mod;
        const nombreForma = opcionVista?.nombre;
        const actualOp = rec?.ramas?.[n] || 0;
        escribir(detalle, "COMPARAR EVOLUCIÓN", "h4", "mer-vista-previa");
        escribir(detalle, `${nombreForma}\n${this.textoModMeridiano(mod || {}, tid)}`, "p", "mer-propuesta");
        const ramas = { ...(rec.ramas || {}), [n]: op };
        const previsto = this.statsTecnica(tid, ramas);
        const actuales = new Map(metricas(tid, confActual)), futuros = new Map(metricas(tid, previsto));
        const comparacion = escribir(detalle, "", "div", "mer-comparacion");
        escribir(comparacion, "ATRIBUTO", "span", "cab"); escribir(comparacion, "ACTUAL", "span", "cab"); escribir(comparacion, "PROPUESTO", "span", "cab");
        for (const nombre of new Set([...actuales.keys(), ...futuros.keys()])) {
          const antes = actuales.get(nombre) || "—", despues = futuros.get(nombre) || "—";
          if (antes === despues) continue;
          escribir(comparacion, nombre, "span"); escribir(comparacion, antes, "span"); escribir(comparacion, despues, "span", "nuevo");
        }
        if (comparacion.children.length === 3) escribir(comparacion, "Esta elección conserva las cifras y modifica un efecto contextual.", "span");
        if (actualOp === op) {
          escribir(detalle, "✓ Esta evolución está activa en combate. Haz doble clic sobre ella en el árbol para devolver el punto y dejar el tramo sin especializar.", "p", "mer-resultado");
        } else {
          const bloqueo = this.bloqueoEleccion(tid, n, op);
          if (bloqueo) {
            escribir(detalle, `REQUISITO PENDIENTE\n${bloqueo}`, "p", "mer-renuncia");
            const bloqueado = boton(detalle, "Aún no puedes elegir esta evolución", () => {}, true); bloqueado.className += " mer-aplicar";
          } else {
            const aplicar = boton(detalle, actualOp ? "Cambiar cauce · conserva el punto" : "Invertir 1 punto", () => {
              const res = this.elegirRama(tid, n, op); this.renderMeridianos(); document.getElementById("merAviso").textContent = res.texto;
            });
            aplicar.className += " mer-aplicar";
          }
        }
      }
    } else escribir(detalle, "Selecciona una evolución del árbol para compararla con tu técnica actual.", "p", "mer-renuncia");
    const afines = ids.filter(id => id !== tid && (TECNICAS[id].elementos || [TECNICAS[id].elemento]).some(el => (t.elementos || [t.elemento]).includes(el)));
    if (afines.length) {
      escribir(detalle, "Artes relacionadas descubiertas", "h4");
      for (const id of afines) boton(detalle, TECNICAS[id].name, () => { this.merTid = id; this.merVista = null; this.renderMeridianos(); });
    }
    const combos = secuenciasDisponibles(ids.filter(id => p.tecnicas[id]))
      .filter(([par]) => par.split(":").some(el => elementosDe(t).includes(el)));
    if (combos.length) escribir(detalle, "Secuencias con tus artes conocidas", "h4");
    for (const [par, combo] of combos) escribir(detalle, `${par.replace(":", " → ")}: ${combo.nombre}. Ataques: ${textoBonoConcordancia(combo, true)}. Apoyos: ${porcentajeUI(CONCORDANCIA.apoyo)}% más de efecto; mismo rival, dos técnicas consecutivas.`, "p", "atlas-nota");
  }

  // Vista BUILDS. Reutiliza las tres columnas del Mapa de Meridianos:
  // merLista = presets, merDetalle = detalle, merArbol = acciones.
  renderMeridianosBuilds({ lista, detalle, arbol, escribir, boton, elementosDe }) {
    const p = this.player;
    this.normalizarBuilds();
    detalle.className = "mer-col";
    arbol.className = "mer-col";
    const builds = p.builds;
    // Texto tal cual lo escribió el jugador (los nombres no se recapitalizan).
    const crudo = (cont, texto, tag = "span", clase = "") => {
      const e = document.createElement(tag); e.textContent = texto; e.className = clase; cont.appendChild(e); return e;
    };
    const aviso = texto => { const el = document.getElementById("merAviso"); if (el) el.textContent = texto; };
    const refrescar = texto => { this.renderMeridianos(); if (texto !== undefined) aviso(texto); };
    if (this.merBuildId && !this.buildPorId(this.merBuildId)) this.merBuildId = null;
    if (!this.merBuildId)
      this.merBuildId = this.buildPorId(p.build_activa) ? p.build_activa : (builds[0]?.id || null);
    const seleccionada = this.buildPorId(this.merBuildId);
    const ETIQUETA = { activa: "● ACTIVA", modificada: "● ACTIVA · MODIFICADA", guardada: "BUILD GUARDADA" };
    const puntosTotales = p.puntos_tecnica_total || 0;
    const cauces = fila => [1, 2, 3].map(n => (fila?.[n] ? "●" : "○")).join("");

    // ---------- columna izquierda: presets y huecos ----------
    for (const b of builds) {
      const snap = this.snapshotDeBuild(b);
      const estado = this.estadoBuild(b);
      const bt = boton(lista, "", () => { this.merBuildId = b.id; this.merConfirm = null; this.merForm = null; refrescar(""); });
      bt.className += ` mer-build-item${estado === "activa" ? " is-activa" : estado === "modificada" ? " is-modificada" : ""}`;
      crudo(bt, b.nombre, "span", "mer-build-nombre");
      crudo(bt, ETIQUETA[estado], "span", "mer-build-estado");
      crudo(bt, `${snap.preparadas.length} técnica${snap.preparadas.length === 1 ? "" : "s"} · ${this.puntosDeSnapshot(snap)}/${puntosTotales} PT`, "span", "mer-build-meta");
      bt.setAttribute("aria-pressed", String(this.merBuildId === b.id));
      bt.setAttribute("aria-label", `${b.nombre}. ${ETIQUETA[estado]}. ${snap.preparadas.length} técnicas preparadas, ${this.puntosDeSnapshot(snap)} de ${puntosTotales} puntos.`);
    }
    for (let i = builds.length; i < MAX_BUILDS; i++) {
      const hueco = escribir(lista, "", "div", "mer-build-vacio");
      escribir(hueco, "VACÍO", "b");
      escribir(hueco, "—", "span");
    }
    const lleno = builds.length >= MAX_BUILDS;
    if (this.merForm?.modo === "guardar") {
      const confirmar = () => {
        const res = this.guardarBuildActual(this.merForm.valor);
        if (!res.ok) { this.merForm.error = res.texto; refrescar(""); return; }
        this.merForm = null; this.merBuildId = res.id; refrescar(res.texto);
      };
      this.formularioBuild(lista, { titulo: "NOMBRE DE LA BUILD", etiqueta: "Guardar", onOk: confirmar, escribir, boton, refrescar });
    } else {
      const guardar = boton(lista, "+ Guardar configuración actual", () => {
        this.merForm = { modo: "guardar", valor: "", error: "" };
        this.merConfirm = null; refrescar("");
      }, lleno);
      guardar.className += " mer-build-guardar";
      if (lleno) escribir(lista, `Has alcanzado el máximo de ${MAX_BUILDS} builds guardadas.`, "p", "mer-build-aviso");
    }

    // ---------- columna central: detalle ----------
    if (!seleccionada) {
      escribir(detalle, "Sin builds guardadas", "h3");
      escribir(detalle, "Una build es una fotografía de tu configuración: las técnicas que tienes preparadas y las elecciones de meridianos de todas tus técnicas. Guarda la configuración actual para poder recuperarla más tarde.", "p");
      escribir(detalle, "Guardar o activar una build nunca desaprende técnicas ni consume turnos.", "p", "mer-build-aviso");
    } else {
      const snap = this.snapshotDeBuild(seleccionada);
      const estado = this.estadoBuild(seleccionada);
      crudo(detalle, seleccionada.nombre.toUpperCase(), "h3");
      const linea = escribir(detalle, ETIQUETA[estado], "p", estado === "activa" ? "mer-resultado" : estado === "modificada" ? "mer-propuesta" : "mer-renuncia");
      if (estado === "modificada") escribir(linea, " · Tu configuración actual ya no coincide con este preset.", "span");
      const resumen = escribir(detalle, "", "div", "mer-build-resumen");
      const datoElementos = escribir(resumen, "", "div", "mer-build-dato");
      escribir(datoElementos, "ELEMENTOS", "b");
      const cajaEl = escribir(datoElementos, "", "div", "mer-build-elementos");
      const presentes = ELEMENTOS.filter(el => snap.preparadas.some(tid => TECNICAS[tid] && elementosDe(TECNICAS[tid]).includes(el)));
      if (presentes.length) {
        for (const el of presentes)
          escribir(cajaEl, ELEMENTO_UI[el]?.nombre || capitalizarUI(el), "span", `mer-build-elemento mer-elemento-${el}`);
      } else escribir(cajaEl, "—", "span");
      const datoTec = escribir(resumen, "", "div", "mer-build-dato");
      escribir(datoTec, "TÉCNICAS PREPARADAS", "b"); escribir(datoTec, String(snap.preparadas.length), "span");
      const datoPt = escribir(resumen, "", "div", "mer-build-dato");
      escribir(datoPt, "PUNTOS USADOS", "b"); escribir(datoPt, `${this.puntosDeSnapshot(snap)} / ${puntosTotales} PT`, "span");
      escribir(detalle, "TÉCNICAS EN ESTA BUILD", "h4");
      if (!snap.preparadas.length) escribir(detalle, "Sin técnicas preparadas.", "p", "mer-renuncia");
      for (const tid of snap.preparadas) {
        const t = TECNICAS[tid]; if (!t) continue;
        const fila = escribir(detalle, "", "div", `mer-build-tecnica mer-elemento-${t.elementos ? "mixta" : t.elemento}`);
        escribir(fila, t.name, "strong");
        escribir(fila, cauces(snap.ramas[tid]), "span", "mer-build-puntos");
      }
      // Una técnica puede estar especializada sin estar preparada: esos puntos
      // también forman parte del preset y explican el total.
      const otras = Object.keys(snap.ramas).filter(tid => TECNICAS[tid] && !snap.preparadas.includes(tid));
      if (otras.length) {
        escribir(detalle, "OTRAS ESPECIALIZACIONES", "h4");
        for (const tid of otras) {
          const t = TECNICAS[tid];
          const fila = escribir(detalle, "", "div", `mer-build-tecnica mer-elemento-${t.elementos ? "mixta" : t.elemento}`);
          escribir(fila, t.name, "strong");
          escribir(fila, cauces(snap.ramas[tid]), "span", "mer-build-puntos");
        }
        escribir(detalle, "Estas técnicas conservan sus meridianos dentro de la build aunque no estén preparadas.", "p", "atlas-nota");
      }
    }

    // ---------- columna derecha: acciones ----------
    const cab = escribir(arbol, "", "div", "mer-arbol-cabecera");
    escribir(cab, "ACCIONES", "span");
    if (seleccionada) crudo(cab, seleccionada.nombre, "strong");
    if (!seleccionada) {
      escribir(arbol, "Guarda una configuración para empezar a usar presets.", "p", "mer-build-aviso");
      return;
    }
    const estado = this.estadoBuild(seleccionada);
    const snapSel = this.snapshotDeBuild(seleccionada);
    const invalida = this.validarSnapshotBuild(snapSel);
    const reconfig = this.bloqueoReconfigurar();
    const yaActiva = estado === "activa";
    const accion = (etiqueta, clave, permitido, motivo) => {
      const b = boton(arbol, etiqueta, () => {
        this.merConfirm = { accion: clave, id: seleccionada.id };
        this.merForm = null; refrescar("");
      }, !permitido);
      if (!permitido && motivo) b.title = motivo;
      return b;
    };
    accion("Activar build", "activar", !yaActiva && !invalida, yaActiva ? "Ya está activa." : invalida);
    accion("Actualizar build", "actualizar", estado === "modificada", estado === "guardada"
      ? "Sólo puedes sobrescribir la build activa." : "La build ya coincide con tu configuración.");
    accion("Restaurar build", "restaurar", estado === "modificada" && !invalida, estado === "guardada"
      ? "Sólo puedes restaurar la build activa." : invalida || "No hay cambios que descartar.");
    if (this.merForm?.modo === "renombrar" && this.merForm.id === seleccionada.id) {
      const confirmar = () => {
        const res = this.renombrarBuild(seleccionada.id, this.merForm.valor);
        if (!res.ok) { this.merForm.error = res.texto; refrescar(""); return; }
        this.merForm = null; refrescar(res.texto);
      };
      this.formularioBuild(arbol, { titulo: "NUEVO NOMBRE", etiqueta: "Renombrar", onOk: confirmar, escribir, boton, refrescar });
    } else {
      boton(arbol, "Renombrar", () => {
        this.merForm = { modo: "renombrar", id: seleccionada.id, valor: seleccionada.nombre, error: "" };
        this.merConfirm = null; refrescar("");
      });
    }
    const btDup = boton(arbol, "Duplicar", () => {
      const res = this.duplicarBuild(seleccionada.id);
      refrescar(res.texto);
    }, builds.length >= MAX_BUILDS);
    if (builds.length >= MAX_BUILDS) btDup.title = `Has alcanzado el máximo de ${MAX_BUILDS} builds guardadas.`;
    accion("Eliminar", "eliminar", true);

    // Confirmaciones inline: nada de confirm() del navegador.
    if (this.merConfirm?.id === seleccionada.id) {
      const textos = {
        activar: {
          cuerpo: `Activar «${seleccionada.nombre}» sustituirá tu configuración actual de técnicas preparadas y meridianos.`,
          ok: "Confirmar", fn: () => this.activarBuild(seleccionada.id),
        },
        actualizar: {
          cuerpo: `Actualizar «${seleccionada.nombre}» con la configuración actual.`,
          ok: "Actualizar", fn: () => this.actualizarBuild(seleccionada.id),
        },
        restaurar: {
          cuerpo: `Restaurar «${seleccionada.nombre}» descartará los cambios que hiciste desde que la activaste.`,
          ok: "Restaurar", fn: () => this.restaurarBuild(seleccionada.id),
        },
        eliminar: {
          cuerpo: `Eliminar «${seleccionada.nombre}». Tu configuración actual no cambiará.`,
          ok: "Eliminar", fn: () => this.eliminarBuild(seleccionada.id),
        },
      }[this.merConfirm.accion];
      if (textos) {
        const caja = escribir(arbol, "", "div", "mer-build-confirmar");
        escribir(caja, textos.cuerpo, "p");
        if (this.merConfirm.accion === "activar" || this.merConfirm.accion === "restaurar") {
          const actual = this.snapshotConfiguracionActual();
          escribir(caja, `Técnicas preparadas ${actual.preparadas.length} → ${snapSel.preparadas.length} · Puntos utilizados ${this.puntosDeSnapshot(actual)} → ${this.puntosDeSnapshot(snapSel)}`, "p", "atlas-nota");
        }
        const fila = escribir(caja, "", "div", "mer-build-form-fila");
        boton(fila, textos.ok, () => {
          const res = textos.fn();
          this.merConfirm = null;
          refrescar(res.texto);
        });
        boton(fila, "Cancelar", () => { this.merConfirm = null; refrescar(""); });
      }
    }
    const notas = escribir(arbol, "", "div", "mer-build-aviso");
    escribir(notas, "Activar o restaurar reorganiza meridianos: requiere un lugar seguro y ningún combate en curso.", "p");
    escribir(notas, "Preparar o despreparar técnicas sólo está bloqueado durante un combate.", "p");
    escribir(notas, "Ninguna de estas operaciones consume turnos ni desaprende técnicas.", "p");
    if (reconfig) escribir(notas, `Cambios de meridianos bloqueados: ${reconfig}`, "p", "mer-build-error");
    else if (invalida) escribir(notas, invalida, "p", "mer-build-error");
  }

  // Editor inline compartido por GUARDAR y RENOMBRAR (nada de window.prompt).
  formularioBuild(cont, { titulo, etiqueta, onOk, escribir, boton, refrescar }) {
    const caja = escribir(cont, "", "div", "mer-build-form");
    const label = escribir(caja, titulo, "label");
    label.setAttribute("for", "merBuildNombre");
    const input = document.createElement("input");
    input.type = "text"; input.id = "merBuildNombre";
    input.value = this.merForm?.valor ?? "";
    input.autocomplete = "off";
    // El valor vive en el estado: así escribir no re-renderiza ni roba el foco.
    input.addEventListener("input", () => { if (this.merForm) this.merForm.valor = input.value; });
    input.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); onOk(); } });
    caja.appendChild(input);
    const fila = escribir(caja, "", "div", "mer-build-form-fila");
    boton(fila, etiqueta, onOk);
    boton(fila, "Cancelar", () => { this.merForm = null; refrescar(""); });
    if (this.merForm?.error) escribir(caja, this.merForm.error, "p", "mer-build-error");
    setTimeout(() => { if (document.getElementById("merBuildNombre") === input) input.focus(); }, 0);
  }

  actualizarBotonMisiones() {
    const badge = document.getElementById("misBadge");
    const boton = document.getElementById("btnMisiones");
    const cantidad = this.misionesNuevas.size;
    badge.hidden = cantidad === 0;
    boton.title = cantidad ? `${cantidad} ${cantidad === 1 ? "entrada nueva" : "entradas nuevas"}` : "abrir el Registro del Destino";
  }

  abrirMisiones() {
    const d = document.getElementById("registroMisiones");
    if (d.open) { this.cerrarMisiones(); return; }
    if (document.getElementById("atlas").open) this.cerrarAtlas();
    if (document.getElementById("meridianos").open) this.cerrarMeridianos();
    if (document.getElementById("oficios").open) this.cerrarOficios();
    if (document.getElementById("cultivo").open) this.cerrarCultivo();
    this.renderMisiones();
    d.showModal();
    this.misionesNuevas.clear();
    this.actualizarBotonMisiones();
  }

  cerrarMisiones() {
    document.getElementById("registroMisiones").close();
    document.getElementById("entrada").focus({ preventScroll: true });
  }

  contraerMisiones() {
    this.misionAbierta = null;
    this.categoriasMisionesAbiertas.clear();
    this.renderMisiones();
  }

  renderMisiones() {
    const cont = document.getElementById("misContenido");
    cont.replaceChildren();
    const estados = Object.entries(this.quests).filter(([qid, estado]) => QUESTS[qid] && ["rumor", "activa", "hecha", "fallida"].includes(estado));
    const activas = estados.filter(([, e]) => e === "activa").length;
    const hechas = estados.filter(([, e]) => e === "hecha").length;
    document.getElementById("misResumen").textContent = capitalizarSegmentosUI(`${activas} ${activas === 1 ? "misión activa" : "misiones activas"} · ${hechas} completadas · sólo se registra lo descubierto`);
    if (!estados.length) {
      const vacio = document.createElement("div");
      vacio.className = "mis-vacio";
      vacio.textContent = "El registro todavía está vacío. Habla con la gente, examina lugares extraños y presta atención a los rumores: la montaña no entrega todas sus historias desde un mismo mostrador.";
      cont.appendChild(vacio);
      this.actualizarBotonMisiones();
      return;
    }

    const definiciones = [
      ["activas", "MISIONES ACTIVAS", e => e === "activa"],
      ["rumores", "RUMORES Y PISTAS", e => e === "rumor"],
      ["completadas", "MISIONES COMPLETADAS", e => e === "hecha"],
      ["cerradas", "CAMINOS CERRADOS", e => e === "fallida"],
    ];
    const misionInicial = this.misionAbierta || (estados.find(([qid]) => this.misionesNuevas.has(qid)) || [null])[0];
    const entradasDetalles = [];
    for (const [cid, titulo, acepta] of definiciones) {
      const miembros = estados.filter(([, estado]) => acepta(estado));
      if (!miembros.length) continue;
      const grupo = document.createElement("details");
      grupo.className = "mis-categoria";
      grupo.open = this.categoriasMisionesAbiertas.has(cid) || (cid !== "completadas" && miembros.some(([qid]) => this.misionesNuevas.has(qid)));
      const cab = document.createElement("summary");
      cab.textContent = `${titulo} · ${miembros.length}`;
      grupo.appendChild(cab);
      const lista = document.createElement("div");
      lista.className = "mis-lista";
      grupo.appendChild(lista);
      grupo.addEventListener("toggle", () => grupo.open ? this.categoriasMisionesAbiertas.add(cid) : this.categoriasMisionesAbiertas.delete(cid));

      for (const [qid, estado] of miembros) {
        const q = QUESTS[qid];
        const entradaM = document.createElement("details");
        entradaM.className = `mis-entrada ${estado} ${q.categoria || "secta"}`;
        entradaM.open = misionInicial === qid;
        const sum = document.createElement("summary");
        const nombre = document.createElement("span");
        nombre.className = "mis-nombre";
        nombre.textContent = estado === "rumor" ? (q.nombreRumor || "Rumor sin confirmar") : q.nombre;
        if (this.misionesNuevas.has(qid)) {
          const nueva = document.createElement("span"); nueva.className = "mis-nueva"; nueva.textContent = "● NUEVA"; nombre.appendChild(nueva);
        }
        const resumen = document.createElement("span");
        resumen.className = "mis-resumen";
        resumen.textContent = capitalizarUI(estado === "rumor" ? "Pista sin confirmar" : estado === "hecha" ? "Completada" : estado === "fallida" ? "Cerrada" : (q.progreso ? q.progreso(this) : "En curso"));
        sum.append(nombre, resumen); entradaM.appendChild(sum);

        const ficha = document.createElement("div"); ficha.className = "mis-ficha";
        const lore = document.createElement("p"); lore.className = "mis-lore";
        lore.textContent = estado === "rumor" ? (q.rumor || q.activacion || "Algo en la montaña merece ser investigado.") : (q.lore || q.desc);
        ficha.appendChild(lore);
        if (estado !== "rumor") {
          const obj = document.createElement("div"); obj.className = "mis-objetivo";
          obj.textContent = `${estado === "hecha" ? "RESOLUCIÓN" : "OBJETIVO ACTUAL"} · ${estado === "hecha" ? this.consecuenciaMision(qid, q) : this.valorMision(q, "objetivo", q.desc)}`;
          ficha.appendChild(obj);
          const meta = document.createElement("div"); meta.className = "mis-meta";
          for (const [etiqueta, valor] of [["ORIGEN", this.valorMision(q, "dador", "Descubrimiento")], ["LUGAR", this.valorMision(q, "lugar", "Por determinar")], ["TIPO", `${q.categoria || "secta"}${q.opcional ? " · opcional" : ""}`], ["RECOMPENSA CONOCIDA", q.recompensaTexto || "No fue anunciada"]]) {
            const celda = document.createElement("div"), b = document.createElement("b"), span = document.createElement("span");
            b.textContent = etiqueta; span.textContent = capitalizarUI(valor); celda.append(b, span); meta.appendChild(celda);
          }
          ficha.appendChild(meta);
        }
        const pistas = (typeof q.pistas === "function" ? q.pistas(this) : q.pistas || []).filter(Boolean);
        if (pistas.length) {
          const caja = document.createElement("div"); caja.className = "mis-pistas";
          const b = document.createElement("b"); b.textContent = "PISTAS CONOCIDAS"; caja.appendChild(b);
          const ul = document.createElement("ul");
          for (const texto of pistas) { const li = document.createElement("li"); li.textContent = capitalizarUI(texto); ul.appendChild(li); }
          caja.appendChild(ul); ficha.appendChild(caja);
        }
        entradaM.appendChild(ficha); lista.appendChild(entradaM); entradasDetalles.push(entradaM);
        entradaM.addEventListener("toggle", () => {
          if (!entradaM.open) { if (this.misionAbierta === qid) this.misionAbierta = null; return; }
          for (const otra of entradasDetalles) if (otra !== entradaM) otra.open = false;
          this.misionAbierta = qid;
          this.misionesNuevas.delete(qid);
          this.actualizarBotonMisiones();
        });
      }
      cont.appendChild(grupo);
    }
    this.actualizarBotonMisiones();
  }

  // ======================================================================
  // CULTIVO · ventana informativa (ver CONTRATO UI · CULTIVO)
  // Sólo LEE de player y de los helpers ya existentes (compruebaPuerta,
  // progresoFundacion, evaluarFundacion). No muta estado, no ejecuta acciones
  // de cultivo y no duplica ninguna regla: meditar y demás siguen en terminal.
  // ======================================================================

  abrirCultivo(tab = null) {
    const d = document.getElementById("cultivo");
    if (d.open && !tab) { this.cerrarCultivo(); return; }
    if (document.getElementById("atlas").open) this.cerrarAtlas();
    if (document.getElementById("registroMisiones").open) this.cerrarMisiones();
    if (document.getElementById("meridianos").open) this.cerrarMeridianos();
    if (document.getElementById("oficios").open) this.cerrarOficios();
    if (document.getElementById("interaccionOficio").open) this.cerrarInteraccionOficio();
    if (tab) this.cultTab = tab;
    this.cultTab ||= "estado";
    this.renderCultivo();
    if (!d.open) d.showModal();
  }

  cerrarCultivo() {
    document.getElementById("cultivo").close();
    document.getElementById("entrada").focus({ preventScroll: true });
  }

  // --- utilidades de render (privadas de esta ventana) ---

  cultEl(tag, clase = "", texto = null) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto !== null) el.textContent = texto;
    return el;
  }

  cultBloque(contenedor, titulo) {
    const bloque = this.cultEl("section", "cult-bloque");
    if (titulo) bloque.appendChild(this.cultEl("h3", "cult-titulo", titulo));
    contenedor.appendChild(bloque);
    return bloque;
  }

  cultDato(contenedor, etiqueta, valor, clase = "") {
    const celda = this.cultEl("div", ("cult-dato " + clase).trim());
    celda.append(this.cultEl("b", "", etiqueta), this.cultEl("span", "", String(valor)));
    contenedor.appendChild(celda);
    return celda;
  }

  // Barra de bloques del vaso. SIEMPRE acompañada del valor numérico y
  // rotulada como vaso/reserva espiritual, nunca como experiencia.
  cultVaso(contenedor, etiqueta, actual, maximo) {
    const caja = this.cultEl("div", "cult-vaso");
    const cab = this.cultEl("div", "cult-vaso-cab");
    cab.append(this.cultEl("b", "", etiqueta), this.cultEl("span", "", `${actual} / ${maximo} Qi`));
    const pct = maximo > 0 ? Math.max(0, Math.min(100, (actual / maximo) * 100)) : 0;
    const pista = this.cultEl("div", "cult-barra-pista");
    const relleno = this.cultEl("div", "cult-barra-relleno" + (pct >= 100 ? " lleno" : ""));
    relleno.style.width = pct + "%";
    pista.appendChild(relleno);
    caja.append(cab, pista);
    contenedor.appendChild(caja);
    return caja;
  }

  cultNombreSemilla(p) {
    const semilla = p.iluminacion?.semillaCorazonDao;
    return semilla ? capitalizarUI(String(semilla)) : null;
  }

  // Escalera de hitos del Arco 1. El estado sale SIEMPRE de player y de los
  // helpers puede*(), nunca de un contador propio de la ventana.
  cultHitosArco1(p) {
    const cfg = CULTIVO_REINOS.LianQi;
    const enZhuJi = reinoAlMenos(p, "ZhuJi");
    const etapaActual = reinoExacto(p, "LianQi") ? p.etapa : Infinity;
    const hitos = [{ nombre: "Despertar de la Raíz", glosa: "Raíz revelada", estado: "hecho" }];

    for (const et of cfg.etapas) {
      let estado = "pendiente";
      if (enZhuJi || etapaActual > et.n) estado = "hecho";
      else if (etapaActual === et.n) estado = "actual";
      hitos.push({ nombre: `LianQi ${"I".repeat(et.n).replace("IIII", "IV")} · ${et.nombre}`, glosa: et.funcion, estado });
    }

    const marcar = (hecho, disponible) => hecho ? "hecho" : (disponible ? "actual" : "pendiente");
    hitos.push({
      nombre: cfg.granPerfeccion.nombre, glosa: "Ya no puedo continuar sin transformarme.",
      estado: marcar(enZhuJi || p.granPerfeccionLianQi === true, puedeAlcanzarGranPerfeccion(p)),
    });
    hitos.push({
      nombre: cfg.iluminacion.nombre, glosa: "Comprendo quién soy y por qué recorro este camino.",
      estado: marcar(p.iluminacion?.alcanzada === true, puedeBuscarIluminacion(p)),
    });
    hitos.push({
      nombre: cfg.tribulacion.nombre, glosa: "Debo demostrar que puedo sostener esa convicción.",
      estado: marcar(p.tribulacionCorazon?.superada === true, puedeIniciarTribulacion(p)),
    });
    hitos.push({
      nombre: "ZhuJi · Fundación establecida", glosa: "Construyo mi Fundación.",
      estado: enZhuJi ? "hecho" : "pendiente",
    });
    return hitos;
  }

  renderCultivo() {
    const cont = document.getElementById("cultContenido");
    const resumen = document.getElementById("cultResumen");
    cont.textContent = "";
    for (const [id, tab] of [["cultTabEstado", "estado"], ["cultTabCamino", "camino"], ["cultTabArcos", "arcos"]]) {
      document.getElementById(id).setAttribute("aria-selected", String(this.cultTab === tab));
    }

    const p = this.player;
    if (!p) {
      resumen.textContent = "";
      cont.appendChild(this.cultEl("p", "cult-vacio", "Todavía no hay un cultivador. Crea o carga una partida."));
      return;
    }

    const cfg = CULTIVO_REINOS[p.reino] || {};
    const info = etapaInfo(p);
    const jugable = cfg.jugable === true && !!info;
    resumen.textContent = jugable
      ? `${cfg.nombreLargo || p.reino} · Etapa ${p.etapa}/${totalEtapas(p.reino)} · ${info.nombre}`
      : `${cfg.nombreLargo || p.reino} · ${p.calidad_fundacion ? "Fundación " + p.calidad_fundacion : "reino alcanzado"}`;

    if (this.cultTab === "camino") return this.renderCultivoCamino(cont, p, cfg, info, jugable);
    if (this.cultTab === "arcos") return this.renderCultivoArcos(cont, p, cfg);
    return this.renderCultivoEstado(cont, p, cfg, info, jugable);
  }

  renderCultivoEstado(cont, p, cfg, info, jugable) {
    // --- 1. Estado actual ---
    const estado = this.cultBloque(cont, "ESTADO ACTUAL");
    if (jugable) {
      const rejilla = this.cultEl("div", "cult-rejilla");
      this.cultDato(rejilla, "REINO", cfg.nombreLargo || p.reino, "es-jade");
      this.cultDato(rejilla, "ETAPA", `${p.etapa}/${totalEtapas(p.reino)} · ${info.nombre}`, "es-oro");
      this.cultDato(rejilla, "MERIDIANOS", estadoMeridianos(p.heridas_meridianos));
      this.cultDato(rejilla, "IMPUREZAS", p.impurezas || 0);
      this.cultDato(rejilla, "COMPRENSIÓN", p.comprension);
      this.cultDato(rejilla, "ILUMINACIÓN", p.iluminacion?.alcanzada ? "Alcanzada" : "No alcanzada",
        p.iluminacion?.alcanzada ? "es-oro" : "es-tenue");
      estado.appendChild(rejilla);
      this.cultVaso(estado, "VASO DE QI · RESERVA ESPIRITUAL", p.qi, p.qi_max);
      if (p.granPerfeccionLianQi) {
        estado.appendChild(this.cultEl("p", "cult-nota",
          "El vaso ya no puede llevarte más lejos: has alcanzado la Gran Perfección de LianQi."));
      }
    } else {
      // §12.1 · reino sin mecánica jugable todavía: estado de llegada, nunca
      // una etapa inexistente ni un vaso vacío.
      const llegada = this.cultEl("div", "cult-llegada");
      llegada.appendChild(this.cultEl("h3", "", `${p.reino} · Fundación establecida`));
      const rejilla = this.cultEl("div", "cult-rejilla");
      this.cultDato(rejilla, "FUNDACIÓN ESTABLECIDA", (p.calidad_fundacion || "sin evaluar").toUpperCase(), "es-oro");
      this.cultDato(rejilla, "ILUMINACIÓN", p.iluminacion?.alcanzada ? "Alcanzada" : "No alcanzada");
      this.cultDato(rejilla, "SEMILLA DEL CORAZÓN DEL DAO", this.cultNombreSemilla(p) || "Sin registrar");
      this.cultDato(rejilla, "MERIDIANOS", estadoMeridianos(p.heridas_meridianos));
      this.cultDato(rejilla, "IMPUREZAS", p.impurezas || 0);
      this.cultDato(rejilla, "COMPRENSIÓN", p.comprension);
      llegada.appendChild(rejilla);
      llegada.appendChild(this.cultEl("p", "cult-nota",
        `El Arco 1 quedó cerrado al establecer la Fundación. El desarrollo jugable de ${p.reino} pertenece al Arco ${cfg.arco || 2}, todavía no implementado.`));
      estado.appendChild(llegada);
    }

    // --- 2. Progreso espiritual ---
    if (jugable) {
      const progreso = this.cultBloque(cont, "PROGRESO ESPIRITUAL");
      const prosa = this.cultEl("p", "cult-prosa");
      const enfasis = this.cultEl("em", "", info.funcion);
      prosa.append(enfasis, document.createTextNode(" " + (cfg.ideaCentral || "")));
      progreso.appendChild(prosa);
    }

    // --- 4. Raíz espiritual y afinidad ---
    const raices = this.cultBloque(cont, "RAÍZ ESPIRITUAL Y AFINIDAD");
    const rejillaRaiz = this.cultEl("div", "cult-rejilla");
    const ui = elemento => ELEMENTO_UI[elemento] || { simbolo: "◇", nombre: capitalizarUI(elemento || "desconocida") };
    const principal = ui(p.raiz);
    this.cultDato(rejillaRaiz, "RAÍZ PRINCIPAL",
      `${principal.simbolo} ${capitalizarUI(RAICES[p.raiz]?.nombre || principal.nombre)}`, "es-jade");
    if (p.raiz_secundaria) {
      const sec = ui(p.raiz_secundaria);
      this.cultDato(rejillaRaiz, "INJERTO ESPIRITUAL", `${sec.simbolo} ${sec.nombre}`, "es-jade");
    } else {
      this.cultDato(rejillaRaiz, "INJERTO ESPIRITUAL", "Ninguno realizado", "es-tenue");
    }
    raices.appendChild(rejillaRaiz);
    raices.appendChild(this.cultEl("p", "cult-nota",
      "Afinidad plena con la raíz principal: aprendizaje completo, −1 qi y +1 daño en artes afines. El injerto rinde al 90%."));

    // --- 5. Comprensión e iluminación ---
    const mente = this.cultBloque(cont, "COMPRENSIÓN E ILUMINACIÓN");
    const rejillaMente = this.cultEl("div", "cult-rejilla");
    this.cultDato(rejillaMente, "COMPRENSIÓN ACUMULADA",
      `${p.comprension} / ${UMBRAL_COMPRENSION_FUNDACION} hacia la Fundación`);
    mente.appendChild(rejillaMente);
    if (p.iluminacion?.alcanzada) {
      mente.appendChild(this.cultEl("p", "cult-prosa",
        "Has alcanzado la Iluminación: ya no sólo comprendes el mundo, sino tu lugar dentro de él."));
    } else if (p.granPerfeccionLianQi) {
      mente.appendChild(this.cultEl("p", "cult-prosa",
        "Has alcanzado la Gran Perfección, pero aún no la Iluminación. El siguiente paso no se mide en qi: exige volver la mirada hacia dentro."));
    } else {
      mente.appendChild(this.cultEl("p", "cult-prosa",
        "La comprensión crece con enseñanzas, técnicas y vivencias; nunca retrocede ni se reinicia entre etapas. La Iluminación sólo se busca tras la Gran Perfección."));
    }

    // --- 5.1 Proyección de Fundación (desde LianQi IV, hasta llegar a ZhuJi) ---
    if (jugable && p.etapa >= 4) {
      const proyeccion = this.cultBloque(cont, "PREPARACIÓN PARA LA FUNDACIÓN");
      // evaluarFundacion() es pura y se recalcula en vivo: la proyección cambia
      // sola si cambian comprensión o impurezas. No persiste nada.
      const calidad = this.evaluarFundacion().calidad;
      const rejillaF = this.cultEl("div", "cult-rejilla");
      this.cultDato(rejillaF, "PROYECCIÓN ACTUAL DE FUNDACIÓN", calidad.toUpperCase(), "es-oro");
      this.cultDato(rejillaF, "MERIDIANOS", estadoMeridianos(p.heridas_meridianos));
      this.cultDato(rejillaF, "IMPUREZAS", p.impurezas || 0);
      this.cultDato(rejillaF, "COMPRENSIÓN", p.comprension);
      this.cultDato(rejillaF, "ILUMINACIÓN", p.iluminacion?.alcanzada ? "Alcanzada" : "Pendiente");
      proyeccion.appendChild(rejillaF);
      proyeccion.appendChild(this.cultEl("p", "cult-nota",
        `Tu condición actual permitiría establecer una Fundación ${calidad.toLowerCase()}. Es una previsión, no un resultado: cambia contigo, y la Tribulación del Corazón aún puede ponerla a prueba.`));
    }

    // --- 6. Camino / Corazón del Dao ---
    const dao = this.cultBloque(cont, "CAMINO · CORAZÓN DEL DAO");
    const semilla = this.cultNombreSemilla(p);
    if (semilla) {
      const rejillaDao = this.cultEl("div", "cult-rejilla");
      this.cultDato(rejillaDao, "SEMILLA DEL CORAZÓN DEL DAO", semilla, "es-oro");
      dao.appendChild(rejillaDao);
      dao.appendChild(this.cultEl("p", "cult-nota",
        "Una semilla no es un destino cerrado: puede crecer, torcerse o entrar en conflicto en los arcos por venir."));
    } else {
      dao.appendChild(this.cultEl("p", "cult-prosa", "En formación."));
      dao.appendChild(this.cultEl("p", "cult-nota",
        "El Corazón del Dao no se elige en una lista: surge de lo que respondas cuando te mires de frente, en la Iluminación."));
    }
  }

  renderCultivoCamino(cont, p, cfg, info, jugable) {
    // --- 3. Próxima frontera ---
    const frontera = this.cultBloque(cont, "PRÓXIMA FRONTERA");

    if (!jugable) {
      frontera.appendChild(this.cultEl("p", "cult-prosa",
        `Has cerrado el Arco 1. Las fronteras de ${p.reino} pertenecen al Arco ${cfg.arco || 2}, todavía no implementado.`));
    } else if (p.reino === "LianQi" && p.etapa === totalEtapas(p.reino) && !p.granPerfeccionLianQi) {
      // En la última etapa de LianQi, antes de la Gran Perfección, la
      // próxima frontera es la Gran Perfección — nunca la Fundación. Los
      // requisitos de Fundación (progresoFundacion) solo deben mostrarse
      // una vez que granPerfeccionLianQi ya es true.
      frontera.appendChild(this.cultEl("p", "cult-prosa",
        `Siguiente hito: ${CULTIVO_REINOS.LianQi.granPerfeccion.nombre} — completa el vaso (${p.qi}/${p.qi_max}).`));
    } else if (p.granPerfeccionLianQi && !p.iluminacion?.alcanzada) {
      frontera.appendChild(this.cultEl("p", "cult-prosa",
        `Siguiente hito: ${CULTIVO_REINOS.LianQi.iluminacion.nombre}. No se alcanza acumulando qi.`));
    } else if (puedeIniciarTribulacion(p)) {
      frontera.appendChild(this.cultEl("p", "cult-prosa",
        `Siguiente hito: ${CULTIVO_REINOS.LianQi.tribulacion.nombre}.`));
    } else {
      // Los requisitos visibles salen de progresoFundacion()/compruebaPuerta():
      // nunca se recalculan aquí, para que el número mostrado sea el mismo que
      // exige el juego al meditar.
      const progreso = this.progresoFundacion();
      if (progreso) {
        const rejilla = this.cultEl("div", "cult-rejilla");
        this.cultDato(rejilla, "META", progreso.titulo, "es-oro");
        frontera.appendChild(rejilla);

        const lista = this.cultEl("ul", "cult-reqs");
        const items = [];
        if (p.etapa < totalEtapas(p.reino)) {
          const { faltan } = this.compruebaPuerta(p.etapa + 1);
          if (!faltan.length) items.push([true, "Requisitos de la puerta cumplidos"]);
          else for (const f of faltan) items.push([false, f]);
        } else {
          const tienePildora = p.inventario.includes("pildora_fundacion");
          const compOk = p.comprension >= UMBRAL_COMPRENSION_FUNDACION;
          items.push([tienePildora, "Píldora de Fundación"]);
          items.push([compOk, `Comprensión ${UMBRAL_COMPRENSION_FUNDACION} (tienes ${p.comprension})`]);
          if (tienePildora || compOk) items.push([true, "Cualquiera de las dos vías basta"]);
        }
        items.push([p.qi >= p.qi_max, `Vaso al tope (${p.qi}/${p.qi_max})`]);
        for (const [ok, texto] of items) {
          const li = this.cultEl("li", "cult-req " + (ok ? "ok" : "falta"));
          li.append(this.cultEl("span", "marca", ok ? "✓" : "✗"), this.cultEl("span", "", texto));
          lista.appendChild(li);
        }
        frontera.appendChild(lista);
        frontera.appendChild(this.cultEl("p", "cult-nota", progreso.detalle));
      }
    }

    // --- 7. Etapas del Arco 1 ---
    const escalera = this.cultBloque(cont, "ETAPAS DEL ARCO 1");
    const lista = this.cultEl("ul", "cult-escalera");
    const marcas = { hecho: "✓", actual: "●", pendiente: "○" };
    for (const hito of this.cultHitosArco1(p)) {
      const li = this.cultEl("li", "cult-paso " + hito.estado);
      li.append(
        this.cultEl("span", "marca", marcas[hito.estado]),
        this.cultEl("span", "nombre", hito.nombre),
        this.cultEl("span", "glosa", hito.glosa),
      );
      lista.appendChild(li);
    }
    escalera.appendChild(lista);
    escalera.appendChild(this.cultEl("p", "cult-nota", "✓ completado · ● actual · ○ pendiente"));
  }

  renderCultivoArcos(cont, p, cfg) {
    // --- 8. Arco actual (derivado de arcoActual(p), nunca almacenado) ---
    const actual = this.cultBloque(cont, "ARCO ACTUAL");
    const caja = this.cultEl("div", "cult-arco");
    caja.appendChild(this.cultEl("div", "cult-arco-nombre", cfg.nombreArco || `Arco ${arcoActual(p)}`));
    caja.appendChild(this.cultEl("p", "cult-arco-sub",
      `REINO QUE SE DESARROLLA · ${(cfg.nombreLargo || p.reino).toUpperCase()}`));
    if (cfg.destinoArco) caja.appendChild(this.cultEl("p", "cult-arco-sub", `DESTINO · ${cfg.destinoArco.toUpperCase()}`));
    actual.appendChild(caja);
    if (cfg.ideaCentral) actual.appendChild(this.cultEl("p", "cult-nota", cfg.ideaCentral + "."));
    if (cfg.jugable === false) {
      actual.appendChild(this.cultEl("p", "cult-nota",
        "Este reino todavía no tiene mecánica jugable: se construirá cuando llegue su arco."));
    }

    // --- 9. Historial de arcos y reinos ya cerrados ---
    const historial = this.cultBloque(cont, "ARCOS CERRADOS");
    if (!p.historialArcos?.length) {
      historial.appendChild(this.cultEl("p", "cult-vacio", "Todavía no has cerrado ningún arco."));
    } else {
      const lista = this.cultEl("ul", "cult-historial");
      for (const entrada of p.historialArcos) {
        const partes = [`Arco ${entrada.arco}`];
        if (entrada.reino) partes.push(entrada.reino);
        if (entrada.calidadFundacion) partes.push(`Fundación ${entrada.calidadFundacion}`);
        if (entrada.semilla) partes.push(`Semilla: ${capitalizarUI(String(entrada.semilla))}`);
        lista.appendChild(this.cultEl("li", "", partes.join(" · ")));
      }
      historial.appendChild(lista);
    }

    const reinos = this.cultBloque(cont, "REINOS CERRADOS");
    if (!p.historialReinos?.length) {
      reinos.appendChild(this.cultEl("p", "cult-vacio", "Ningún reino cerrado todavía."));
    } else {
      const lista = this.cultEl("ul", "cult-historial");
      for (const entrada of p.historialReinos) {
        const partes = [entrada.reino || "—"];
        if (entrada.calidadFundacion) partes.push(`Fundación ${entrada.calidadFundacion}`);
        if (entrada.iluminacion) partes.push("Iluminación alcanzada");
        if (entrada.semilla) partes.push(capitalizarUI(String(entrada.semilla)));
        lista.appendChild(this.cultEl("li", "", partes.join(" · ")));
      }
      reinos.appendChild(lista);
    }

    // Mapa completo, sólo informativo.
    const mapa = this.cultBloque(cont, "MAPA DE ARCOS");
    const lista = this.cultEl("ul", "cult-escalera");
    const arco = arcoActual(p);
    for (const r of Object.values(CULTIVO_REINOS)) {
      const estado = r.arco < arco ? "hecho" : (r.arco === arco ? "actual" : "pendiente");
      const li = this.cultEl("li", "cult-paso " + estado);
      li.append(
        this.cultEl("span", "marca", { hecho: "✓", actual: "●", pendiente: "○" }[estado]),
        this.cultEl("span", "nombre", r.nombreArco || `Arco ${r.arco}`),
        this.cultEl("span", "glosa", r.siguienteReino ? `Cierra al alcanzar ${r.siguienteReino}` : "Tribulación Celestial · Ascensión"),
      );
      lista.appendChild(li);
    }
    mapa.appendChild(lista);
  }

  abrirOficios(seleccion = null) {
    const d = document.getElementById("oficios");
    if (d.open && !seleccion) { this.cerrarOficios(); return; }
    if (document.getElementById("atlas").open) this.cerrarAtlas();
    if (document.getElementById("registroMisiones").open) this.cerrarMisiones();
    if (document.getElementById("meridianos").open) this.cerrarMeridianos();
    if (document.getElementById("interaccionOficio").open) this.cerrarInteraccionOficio();
    if (document.getElementById("cultivo").open) this.cerrarCultivo();
    if (seleccion && PROFESIONES[seleccion]) this.ofiSeleccion = seleccion;
    this.ofiSeleccion ||= "examen";
    if (!d.open) { this.ofiTabExamen = "bitacora"; this.ofiTabHerb = "bitacora"; }
    this.renderOficios();
    if (!d.open) d.showModal();
  }

  cerrarOficios() {
    document.getElementById("oficios").close();
    document.getElementById("entrada").focus({ preventScroll: true });
  }

  elementoOficio(tag, texto = "", clase = "") {
    const e = document.createElement(tag);
    e.textContent = texto;
    if (clase) e.className = clase;
    return e;
  }

  // Estado de UI (no de partida) de una parte de planta dentro de la ventana de
  // RECOLECTAR: si está colapsada y cuál fue el resultado de la última cosecha
  // intentada en esta apertura de la ventana. Se reinicia en abrirInteraccionOficio.
  estadoUIParteHerb(nodoId, procId) {
    if (!this.ofiHerbUI) this.ofiHerbUI = {};
    if (!this.ofiHerbUI[nodoId]) this.ofiHerbUI[nodoId] = {};
    // Las partes empiezan compactas. Al abrir una, permanece abierta incluso
    // después de cosechar; sólo se cierra al pulsarla otra vez o abrir otra.
    if (!this.ofiHerbUI[nodoId][procId]) this.ofiHerbUI[nodoId][procId] = { colapsado: true, resultado: null };
    return this.ofiHerbUI[nodoId][procId];
  }

  estadoUIParteExamen(cuerpoKey, hallazgoId) {
    if (!this.ofiExamenUI) this.ofiExamenUI = {};
    if (!this.ofiExamenUI[cuerpoKey]) this.ofiExamenUI[cuerpoKey] = {};
    if (!this.ofiExamenUI[cuerpoKey][hallazgoId]) this.ofiExamenUI[cuerpoKey][hallazgoId] = { colapsado: true, resultado: null };
    return this.ofiExamenUI[cuerpoKey][hallazgoId];
  }

  colorEspecieHerboristeria(especieId) {
    // Misma paleta que EXTRAER (ver PALETA_QI_OFICIO): RECOLECTAR y EXTRAER
    // acentúan sus tarjetas con los mismos colores por elemento/especie, sólo
    // cambia el color de reserva cuando la clave no aparece en la paleta.
    return PALETA_QI_OFICIO[especieId] || "#8fc6a3";
  }

  colorQiOficio(clave) {
    const k = quitaAcentos(String(clave || "").toLowerCase()).trim();
    return PALETA_QI_OFICIO[k] || "#cf7462";
  }

  colorCadaverExamen(cuerpo) {
    const bruto = cuerpo?.elemento || cuerpo?.qi || MOBS[cuerpo?.mob_id]?.elemento || MOBS[cuerpo?.mob_id]?.qi || (Array.isArray(MOBS[cuerpo?.mob_id]?.elementos) ? MOBS[cuerpo?.mob_id].elementos[0] : "");
    return this.colorQiOficio(bruto);
  }

  descriptorProbabilidadOficio(probabilidad) {
    const porcentaje = Math.round(Math.max(0, Math.min(1, Number(probabilidad) || 0)) * 100);
    if (porcentaje >= 70) return { clave: "alta", texto: "ALTA", porcentaje };
    if (porcentaje >= 50) return { clave: "media", texto: "MEDIA", porcentaje };
    return { clave: "baja", texto: "BAJA", porcentaje };
  }

  crearBadgeProbabilidadOficio(probabilidad, mostrarExacta = false) {
    const info = this.descriptorProbabilidadOficio(probabilidad);
    const badge = this.elementoOficio("span", `[${info.texto}]`, `ofi-parte-prob ${info.clave}`);
    const detalle = mostrarExacta ? `${info.texto} (${info.porcentaje}%)` : info.texto;
    badge.title = `Probabilidad estimada: ${detalle}`;
    badge.setAttribute("aria-label", `Probabilidad estimada: ${detalle}`);
    return badge;
  }

  crearMetaParteOficio(dificultad, probabilidad, mostrarExacta = false) {
    const info = this.descriptorProbabilidadOficio(probabilidad);
    const meta = this.elementoOficio("div", "", "ofi-parte-meta");
    const dif = this.elementoOficio("span", `Dificultad: ${String(dificultad || "").replace(/_/g, " ").toUpperCase()}`, "ofi-parte-meta-chip");
    const riesgo = this.elementoOficio("span", mostrarExacta
      ? `Umbral: ${info.texto} · ${info.porcentaje}% estimado`
      : `Umbral: ${info.texto}`,
      "ofi-parte-meta-chip");
    meta.append(dif, riesgo);
    return meta;
  }

  crearResultadoInteraccionOficio(texto, tipo = "herboristeria", fallo = false) {
    const res = this.elementoOficio("div", "", `ofi-parte-resultado${fallo ? " fallo" : " ofi-resultado-exito"}`);
    const lineas = String(texto || "").split("\n").filter(Boolean);
    const principal = lineas.shift() || "";
    const filas = this.elementoOficio("div", "", "ofi-resultado-filas");
    const fila = (etiqueta, valor, clase = "") => {
      const f = this.elementoOficio("div", "", "ofi-resultado-fila");
      f.append(
        this.elementoOficio("span", etiqueta, "ofi-resultado-etiqueta"),
        this.elementoOficio("span", valor, `ofi-resultado-valor${clase ? " " + clase : ""}`),
      );
      filas.appendChild(f);
    };

    if (fallo) {
      const patronHerbF = /^La recolección falla y daña (.+?)\. No obtienes material: 0 XP\. La planta necesitará (\d+) turnos para recuperarse\.(.*)$/;
      const patronExamenF = /^La intervención falla y arruina (.+?)\. No obtienes material: 0 XP\. Esa estructura ya no puede intentarse en este cadáver\.(.*)$/;
      const m = principal.match(tipo === "examen" ? patronExamenF : patronHerbF);
      res.appendChild(this.elementoOficio("div", "Fallido", "ofi-resultado-titulo"));
      if (!m) {
        res.appendChild(this.elementoOficio("div", texto, "ofi-resultado-nota"));
        return res;
      }
      fila("Procedimiento:", m[1]);
      fila("Obtenido:", "0 material");
      fila("XP total:", "+0 XP", "xp");
      if (tipo === "examen") fila("Consecuencia:", "Estructura arruinada");
      else fila("Recuperación:", `${m[2]} turnos`);
      res.appendChild(filas);
      const cola = (tipo === "examen" ? m[2] : m[3])?.trim();
      const notas = [cola, ...lineas].filter(Boolean);
      if (notas.length) res.appendChild(this.elementoOficio("div", notas.join("\n"), "ofi-resultado-nota"));
      return res;
    }

    const patronHerb = /^Herboristería espiritual: obtienes (\d+) (.+?) mediante (.+?)\. \+([^ ]+) XP(?: \((.*?)\))?\. Familiaridad: ([^.]+)\. Recuperación: (\d+) turnos\.(.*)$/;
    const patronExamen = /^Extracción espiritual: obtienes (\d+) (.+?) mediante (.+?)\. \+([^ ]+) XP(?: \((.*?)\))?\. Familiaridad: ([^.]+)\.(.*)$/;
    const m = principal.match(tipo === "examen" ? patronExamen : patronHerb);
    res.appendChild(this.elementoOficio("div", "Éxito", "ofi-resultado-titulo"));
    if (!m) {
      res.appendChild(this.elementoOficio("div", texto, "ofi-resultado-nota"));
      return res;
    }

    fila("Obtenido:", `${m[1]} ${m[2]}`, "recompensa");
    fila("XP total:", `+${m[4]} XP`, "xp");

    if (m[5]) {
      const desglose = this.elementoOficio("div", "", "ofi-resultado-desglose");
      desglose.appendChild(this.elementoOficio("span", "Desglose XP:", "ofi-resultado-etiqueta"));
      const lista = this.elementoOficio("div", "", "ofi-resultado-desglose-lista");
      for (const parte of m[5].split(" · ")) {
        const limpio = parte.trim();
        const mm = limpio.match(/^\+?([^ ]+)\s+(.*)$/);
        const linea = this.elementoOficio("span");
        if (mm) {
          linea.append(this.elementoOficio("strong", `+${mm[1]}`), document.createTextNode(mm[2]));
        } else linea.textContent = limpio;
        lista.appendChild(linea);
      }
      desglose.appendChild(lista);
      filas.appendChild(desglose);
    }
    fila("Familiaridad:", m[6], "recompensa");
    if (tipo !== "examen") fila("Recuperación:", `${m[7]} turnos`);
    res.appendChild(filas);

    const cola = (tipo === "examen" ? m[7] : m[8])?.trim();
    const notas = [cola, ...lineas].filter(Boolean);
    if (notas.length) res.appendChild(this.elementoOficio("div", notas.join("\n"), "ofi-resultado-nota"));
    return res;
  }

  tarjetaRangoOficio(id, cont) {
    const rango = this.rangoProfesion(id);
    const siguienteNombre = rango.siguiente === null ? null : RANGOS_OFICIO[rango.nivel + 1];
    const umbralActual = UMBRALES_OFICIO[rango.nivel] ?? 0;
    const tramoTotal = rango.siguiente === null ? 0 : Math.max(1, rango.siguiente - umbralActual);
    const progresoTramo = rango.siguiente === null ? tramoTotal : Math.max(0, Math.min(tramoTotal, rango.xp - umbralActual));
    const porcentaje = rango.siguiente === null ? 100 : Math.round((progresoTramo / tramoTotal) * 100);

    const clases = ["ofi-rango"];
    if (rango.apto) clases.push("apto");
    if (rango.bloqueadoPorArco) clases.push("bloqueado");
    const tarjeta = this.elementoOficio("section", "", clases.join(" "));
    tarjeta.style.setProperty("--ofi-progreso", `${porcentaje}%`);

    const cabecera = this.elementoOficio("div", "", "ofi-rango-cabecera");
    const actual = this.elementoOficio("div");
    actual.append(
      this.elementoOficio("span", "RANGO ACTUAL", "ofi-rango-etiqueta"),
      this.elementoOficio("strong", rango.nombre, "ofi-rango-nombre"),
    );
    const sig = this.elementoOficio("div", "", "ofi-rango-siguiente");
    sig.appendChild(this.elementoOficio("span", siguienteNombre ? "SIGUIENTE RANGO" : "PROGRESIÓN", "ofi-rango-etiqueta"));
    sig.appendChild(this.elementoOficio("strong", siguienteNombre || "Rango máximo definido"));
    cabecera.append(actual, sig);
    tarjeta.appendChild(cabecera);

    const meta = this.elementoOficio("div", "", "ofi-progreso-meta");
    meta.append(
      this.elementoOficio("span", siguienteNombre ? `Progreso hacia ${siguienteNombre}` : "Progreso del oficio"),
      this.elementoOficio("strong", siguienteNombre ? `${formatearXP(progresoTramo)} / ${formatearXP(tramoTotal)} XP` : `${formatearXP(rango.xp)} XP total`),
    );
    tarjeta.appendChild(meta);

    const barra = this.elementoOficio("div", "", "ofi-progreso-barra");
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-label", siguienteNombre ? `Progreso hacia ${siguienteNombre}` : `Progreso de ${rango.nombre}`);
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", "100");
    barra.setAttribute("aria-valuenow", String(porcentaje));
    barra.appendChild(this.elementoOficio("div", "", "ofi-progreso-relleno"));
    tarjeta.appendChild(barra);

    const extremos = this.elementoOficio("div", "", "ofi-progreso-extremos");
    extremos.append(
      this.elementoOficio("span", `${formatearXP(umbralActual)} XP`),
      this.elementoOficio("span", rango.siguiente === null ? `${formatearXP(rango.xp)} XP` : `${formatearXP(rango.siguiente)} XP`),
    );
    tarjeta.appendChild(extremos);

    let progreso;
    if (rango.bloqueadoPorArco) progreso = `✓ XP completada para ${siguienteNombre}, pero la promoción pertenece a un arco posterior.`;
    else if (rango.apto) progreso = `✓ XP completada. Habla con ${PROFESIONES[id]?.mentor || "tu mentor"} para solicitar reconocimiento como ${siguienteNombre}.`;
    else if (rango.siguiente === null) progreso = `Has alcanzado el rango máximo definido. XP total acumulada: ${formatearXP(rango.xp)}.`;
    else progreso = `Faltan ${formatearXP(Math.max(0, rango.siguiente - rango.xp))} XP para poder solicitar ${siguienteNombre}. XP total: ${formatearXP(rango.xp)}.`;
    const nota = this.elementoOficio("div", "", "ofi-xp");
    nota.textContent = progreso;
    tarjeta.appendChild(nota);
    cont.appendChild(tarjeta);
  }

  renderOficios() {
    const lista = document.getElementById("ofiLista");
    const cont = document.getElementById("ofiDetalle");
    const aviso = document.getElementById("ofiAviso");
    lista.replaceChildren(); cont.replaceChildren();
    if (!this.player) {
      cont.append(this.elementoOficio("h3", "Las manos todavía no tienen historia"),
        this.elementoOficio("p", "Crea o carga un personaje para comenzar un oficio."));
      aviso.textContent = "Consultar no consume turnos.";
      return;
    }
    this.normalizarProfesiones();
    const aprendidos = Object.keys(PROFESIONES).filter(id => this.profesionDesbloqueada(id)).length;
    document.getElementById("ofiResumen").textContent = `${aprendidos} oficios aprendidos · Los maestros y las facciones abren nuevas sendas.`;
    for (const [id, oficio] of Object.entries(PROFESIONES)) {
      const aprendida = this.profesionDesbloqueada(id);
      const estado = aprendida ? "" : oficio.activa ? " · POR APRENDER" : " · FUTURO";
      const b = this.elementoOficio("button", `${oficio.simbolo}  ${oficio.nombre}${estado}`, `chip ofi-entrada${aprendida ? "" : " bloqueada"}`);
      b.type = "button";
      b.setAttribute("aria-current", String(id === this.ofiSeleccion));
      b.addEventListener("click", () => { this.ofiSeleccion = id; this.renderOficios(); });
      lista.appendChild(b);
    }
    const id = this.ofiSeleccion;
    const oficio = PROFESIONES[id] || PROFESIONES.examen;
    cont.append(this.elementoOficio("h3", `${oficio.simbolo} ${oficio.nombre}`), this.elementoOficio("p", oficio.descripcion));
    if (!oficio.activa) {
      cont.appendChild(this.elementoOficio("div", "Esta senda está registrada, pero permanece sellada durante el Arco 1. Sus materiales no se consumirán ni concederán poder anticipado.", "ofi-bloqueo"));
      aviso.textContent = "Vista previa de una profesión futura.";
      return;
    }
    if (!this.profesionDesbloqueada(id)) {
      cont.appendChild(this.elementoOficio("div", `Aún no has recibido esta enseñanza. Mentor: ${oficio.mentor}. ${oficio.requisito}`, "ofi-bloqueo"));
      aviso.textContent = "Los materiales obtenidos antes de aprender un oficio se conservan, pero no conceden experiencia retroactiva.";
      return;
    }
    this.tarjetaRangoOficio(id, cont);
    if (id === "examen") this.renderExamen(cont);
    else if (id === "herboristeria") this.renderHerboristeria(cont);
    else if (id === "alquimia") this.renderAlquimia(cont);
  }

  normalizarFiltroInteraccion(filtro = "") {
    return quitaAcentos(String(filtro || "").toLowerCase()).replace(/_/g, " ").replace(/\s+/g, " ").trim();
  }

  plantasInteraccion(filtro = "") {
    const plantas = this.plantasEnSala().map((nodo, indice) => ({ nodo, indice }));
    const f = this.normalizarFiltroInteraccion(filtro);
    if (!f) return plantas;
    if (/^\d+$/.test(f)) {
      const elegido = plantas[Number(f) - 1];
      return elegido ? [elegido] : [];
    }
    // Primero se busca coincidencia específica por nombre. Solo si NINGUNA
    // planta de la sala coincide con el filtro, se interpretan las palabras
    // genéricas ("planta"/"hierba", etc.) como comodín de "cualquiera". Antes
    // el comodín se evaluaba primero, así que escribir "hierba" nunca podía
    // resolver a "Hierba de Claridad" en cuanto había más de una planta en
    // la sala, aunque ninguna otra llevara esa palabra en su nombre.
    const especificas = plantas.filter(({ nodo }) => {
      const nombres = [nodo.id, nodo.especie, nodo.planta?.nombre]
        .filter(Boolean).map(n => this.normalizarFiltroInteraccion(n));
      return nombres.some(n => n.includes(f) || f.includes(n));
    });
    if (especificas.length) return especificas;
    if (["planta", "plantas", "hierba", "hierbas"].includes(f)) return plantas;
    return especificas;
  }

  cadaveresInteraccion(filtro = "") {
    const cuerpos = this.cadaveresEnSala().map((cuerpo, indice) => ({ cuerpo, indice }))
      .filter(({ cuerpo, indice }) => !this.cuerpoExamenAgotado(cuerpo) || this.ofiUltimoResultadoExamen?.indice === indice);
    const f = this.normalizarFiltroInteraccion(filtro);
    if (!f || ["cadaver", "cadaveres", "cuerpo", "cuerpos", "resto", "restos"].includes(f)) return cuerpos;
    if (/^\d+$/.test(f)) {
      // El número es el que muestra la tarjeta del cuerpo («2. Cadáver de…»),
      // es decir su posición real en la sala, no su posición en la lista filtrada.
      return cuerpos.filter(({ indice }) => indice + 1 === Number(f));
    }
    return cuerpos.filter(({ cuerpo }) => {
      const nombres = [cuerpo.mob_id, cuerpo.name, cuerpo.corto, this.etiquetaCadaver(cuerpo)]
        .filter(Boolean).map(n => this.normalizarFiltroInteraccion(n));
      return nombres.some(n => n.includes(f) || f.includes(n));
    });
  }

  // Opciones entre las que EXTRAER/RECOLECTAR tiene que decidir para un filtro.
  // Una sola opción abre la interfaz; varias obligan al jugador a elegir una
  // (nunca se abren todas a la vez). Una planta ya agotada no figura en la línea
  // «Plantas:», así que no cuenta como opción mientras quede otra disponible.
  candidatosInteraccionOficio(tipo, filtro = "") {
    if (tipo === "herboristeria") {
      const todas = this.plantasInteraccion(filtro);
      const activas = todas.filter(({ nodo }) => !this.nodoHerboristeriaAgotado(nodo));
      return activas.length ? activas : todas;
    }
    return this.cadaveresInteraccion(filtro);
  }

  // Recordatorio cuando el comando no deja claro sobre cuál de las entidades
  // presentes trabajar. Si dos comparten nombre se distinguen por su número.
  textoSeleccionInteraccionOficio(tipo, candidatos) {
    const esPlanta = tipo === "herboristeria";
    const etiquetas = candidatos.map(({ nodo, cuerpo, indice }) => ({
      texto: capitalizarUI(esPlanta ? nodo.planta.nombre : this.etiquetaCadaver(cuerpo)),
      numero: indice + 1,
    }));
    const repetidas = new Set(etiquetas.map(e => e.texto).filter((t, i, todos) => todos.indexOf(t) !== i));
    const nombres = etiquetas.map(e => repetidas.has(e.texto) ? `${e.texto} [nº ${e.numero}]` : e.texto);
    const pista = repetidas.size ? "nombre o número" : "nombre";
    return esPlanta
      ? `Debes seleccionar la planta que desees recolectar (${nombres.join(", ")}). Escribe RECOLECTAR seguido de su ${pista}.`
      : `Debes seleccionar el cuerpo que desees trabajar (${nombres.join(", ")}). Escribe EXTRAER seguido de su ${pista}.`;
  }

  // Bloque de elección (mismo aspecto .mc-* que el resto de decisiones cerradas):
  // una fila por cuerpo/planta con su número real de sala. Cada fila es pulsable y
  // envía EXTRAER/RECOLECTAR <n> por la barra de comandos (flujo único de entrada).
  desactivarSeleccionOficio() {
    const el = this.seleccionOficioEl;
    if (!el) return;
    el.classList.add("mc-inactiva");
    el.querySelectorAll("button.mc-opcion").forEach(b => { b.disabled = true; b.setAttribute("aria-disabled", "true"); });
    this.seleccionOficioEl = null;
  }

  mostrarSeleccionInteraccionOficio(tipo, candidatos) {
    this.desactivarSeleccionOficio();
    const esPlanta = tipo === "herboristeria";
    const verbo = esPlanta ? "RECOLECTAR" : "EXTRAER";
    const bloque = document.createElement("div");
    bloque.className = "mc-bloque";
    bloque.setAttribute("aria-label", this.textoSeleccionInteraccionOficio(tipo, candidatos));
    const titulo = document.createElement("div"); titulo.className = "mc-titulo";
    titulo.textContent = `${verbo} · ${candidatos.length} ${esPlanta ? "plantas" : "cuerpos"} disponibles`;
    const pregunta = document.createElement("div"); pregunta.className = "mc-pregunta";
    pregunta.textContent = esPlanta ? "Debes seleccionar la planta que desees recolectar." : "Debes seleccionar el cuerpo que desees trabajar.";
    const lista = document.createElement("div"); lista.className = "mc-opciones";
    for (const { nodo, cuerpo, indice } of candidatos) {
      const numero = indice + 1;
      const etiqueta = capitalizarUI(esPlanta ? nodo.planta.nombre : this.etiquetaCadaver(cuerpo));
      const boton = document.createElement("button"); boton.type = "button"; boton.className = "mc-opcion";
      boton.dataset.valor = String(numero);
      boton.setAttribute("aria-label", `${verbo} ${numero}: ${etiqueta}`);
      const ins = document.createElement("span"); ins.className = "mc-opcion-insignia"; ins.textContent = `Nº ${numero}`;
      const tx = document.createElement("span"); tx.className = "mc-opcion-texto"; tx.textContent = etiqueta;
      boton.append(ins, tx);
      boton.addEventListener("click", () => {
        if (boton.disabled) return;
        this.desactivarSeleccionOficio();
        enviarComando(`${verbo.toLowerCase()} ${numero}`);
      });
      lista.appendChild(boton);
    }
    const pie = document.createElement("div"); pie.className = "mc-pie";
    pie.textContent = `Escribe ${verbo} seguido de su nombre o número (p. ej. ${verbo} ${candidatos[0].indice + 1}), o pulsa una opción.`;
    bloque.append(titulo, pregunta, lista, pie);
    this.contenido.appendChild(bloque);
    this.seleccionOficioEl = bloque;
    this.abajo();
  }

  // Entidad que la interfaz abierta está mostrando. Se guarda la propia planta
  // (por id) o el propio cuerpo (por referencia), no un número: así seguir
  // trabajando sobre ella no salta a otra si la sala cambia durante la acción.
  // Sin objetivo guardado (llamadas directas) se recurre al filtro del comando.
  entidadesInteraccionRender(tipo) {
    const obj = this.interaccionOficioObjetivo;
    if (obj == null) {
      return tipo === "herboristeria"
        ? this.plantasInteraccion(this.interaccionOficioFiltro || "")
        : this.cadaveresInteraccion(this.interaccionOficioFiltro || "");
    }
    if (tipo === "herboristeria")
      return this.plantasEnSala().map((nodo, indice) => ({ nodo, indice })).filter(({ nodo }) => nodo.id === obj);
    return this.cadaveresEnSala().map((cuerpo, indice) => ({ cuerpo, indice })).filter(({ cuerpo }) => cuerpo === obj);
  }

  // Recuerda dónde estaba, dentro del área con scroll, el control que el jugador
  // acaba de pulsar (captura del clic, antes de que el manejador re-renderice).
  recordarAnclaInteraccion(ev) {
    const cont = document.getElementById("interaccionDetalle");
    const el = ev.target && ev.target.closest ? ev.target.closest("[data-ancla]") : null;
    this._anclaInteraccion = el && cont.contains(el)
      ? { clave: el.dataset.ancla, y: el.getBoundingClientRect().top - cont.getBoundingClientRect().top }
      : null;
  }

  buscarRecetaAlquimia(texto = "") {
    const f = this.normalizarFiltroInteraccion(texto);
    if (!f) return null;
    return Object.keys(RECETAS).find(rid => {
      if (!this.estadoRecetaAlquimia(rid)?.conocida) return false;
      const nombres = [rid, RECETAS[rid].nombre].map(n => this.normalizarFiltroInteraccion(n));
      return nombres.some(n => n.includes(f) || f.includes(n));
    }) || null;
  }

  abrirInteraccionOficio(tipo, args = []) {
    if (!this.player) return;
    this.desactivarSeleccionOficio();
    const d = document.getElementById("interaccionOficio");
    if (document.getElementById("oficios").open) this.cerrarOficios();
    if (document.getElementById("atlas").open) this.cerrarAtlas();
    if (document.getElementById("registroMisiones").open) this.cerrarMisiones();
    if (document.getElementById("meridianos").open) this.cerrarMeridianos();
    if (document.getElementById("cultivo").open) this.cerrarCultivo();
    this.interaccionOficioTipo = tipo;
    this.interaccionOficioFiltro = (args || []).join(" ").trim().toLowerCase();
    // El último resultado de la sesión anterior mantenía "visible" un cuerpo ya
    // agotado; no debe contar como opción al elegir sobre qué trabajar ahora.
    this.ofiUltimoResultadoExamen = null;
    d.classList.toggle("modo-alquimia", tipo === "alquimia");

    if (tipo === "alquimia") {
      if (!this.profesionDesbloqueada("alquimia")) {
        this.salida("Enseñanza de Alquimia pendiente de implementación canónica 3C.", "sistema");
        return;
      }
      if (!this.tieneEstacionAlquimia()) {
        this.salida("No hay una estación alquímica que puedas utilizar aquí.", "sistema");
        return;
      }
      this.actualizarRecetasAlquimia();
      if (this.interaccionOficioFiltro) {
        const rid = this.buscarRecetaAlquimia(this.interaccionOficioFiltro);
        if (!rid) {
          this.salida(`No reconoces la receta «${(args || []).join(" ")}».`, "sistema");
          return;
        }
        this.ofiReceta = rid;
        this.alquimiaCategoriaAbierta = RECETAS[rid].categoria || "especiales";
      }
      this.alquimiaResultado = null;
      this.elaboracion = null;
    } else {
      // Antes esta comprobación sólo corría si el jugador nombraba un objetivo
      // (RECOLECTAR loto). Escribir RECOLECTAR/EXTRAER a secas en una sala vacía
      // se saltaba el chequeo por completo y abría el cartel sin nada dentro.
      const coincidencias = this.candidatosInteraccionOficio(tipo, this.interaccionOficioFiltro);
      if (!coincidencias.length) {
        const texto = this.interaccionOficioFiltro
          ? (tipo === "herboristeria"
              ? "RECOLECTAR sólo funciona con plantas espirituales de la línea «Plantas:».\nLos objetos de «Ves:» se recogen con TOMAR."
              : "EXTRAER sólo funciona con cuerpos presentes en la línea «Restos:».\nLos objetos de «Ves:» no forman parte de Extracción Espiritual.")
          : (tipo === "herboristeria"
              ? "No hay ninguna planta espiritual que recolectar en esta sala."
              : "No hay ningún cuerpo que examinar en esta sala.");
        this.salida(texto, "sistema");
        return;
      }
      // Una sola entidad a la vez: con varias en la sala (o si el nombre dado
      // coincide con más de una) no se abre nada y se pide elegir.
      if (coincidencias.length > 1) {
        this.mostrarSeleccionInteraccionOficio(tipo, coincidencias);
        return;
      }
      this.interaccionOficioObjetivo = tipo === "herboristeria" ? coincidencias[0].nodo.id : coincidencias[0].cuerpo;
    }

    this._anclaInteraccion = null;
    document.getElementById("interaccionDetalle").scrollTop = 0;
    this.ofiUltimoResultadoHerboristeria = null;
    this.ofiUltimoResultadoExamen = null;
    this.ofiHerbUI = {};
    this.ofiExamenUI = {};
    this.renderInteraccionOficio();
    if (!d.open) d.showModal();
  }

  cerrarInteraccionOficio() {
    const d = document.getElementById("interaccionOficio");
    if (d.open) d.close();
    d.classList.remove("modo-alquimia");
    document.getElementById("entrada").focus({ preventScroll: true });
  }

  renderInteraccionOficio() {
    const tipo = this.interaccionOficioTipo;
    const cont = document.getElementById("interaccionDetalle");
    const titulo = document.getElementById("interaccionTitulo");
    const resumen = document.getElementById("interaccionResumen");
    const aviso = document.getElementById("interaccionAviso");
    // Herboristería/Examen: al volver a pintar (desplegar una parte, cosechar,
    // extraer) el área con scroll conserva su posición y el control pulsado se
    // queda donde estaba en pantalla; así la interfaz no "salta" bajo el cursor.
    const conservar = tipo === "herboristeria" || tipo === "examen";
    const scrollPrevio = cont.scrollTop;
    const ancla = conservar ? this._anclaInteraccion : null;
    this._anclaInteraccion = null;
    cont.replaceChildren(); aviso.textContent = "";
    if (tipo === "herboristeria") {
      titulo.textContent = "採 · Recolección en el entorno";
      resumen.textContent = "Observa una planta y elige qué parte intervenir.";
      this.renderInteraccionHerboristeria(cont, aviso);
    } else if (tipo === "examen") {
      titulo.textContent = "骨 · Extracción de cuerpos";
      resumen.textContent = "Elige una estructura aprovechable del cuerpo presente.";
      this.renderInteraccionExamen(cont, aviso);
    } else if (tipo === "alquimia") {
      titulo.textContent = "煉 · Alquimia";
      resumen.textContent = "Refina fórmulas conocidas y registra lo aprendido en cada elaboración.";
      this.renderInteraccionAlquimia(cont, aviso);
    }
    // Si lo único que se pintó fue un aviso de bloqueo (oficio no aprendido, sin
    // estación, etc.) la ventana se achica; con cualquier otro contenido, mantiene
    // el alto fijo habitual (ver comentario de #interaccionOficio en el CSS).
    const soloBloqueo = cont.children.length === 1 && cont.firstElementChild?.classList.contains("ofi-bloqueo");
    document.getElementById("interaccionOficio").classList.toggle("modo-vacio", soloBloqueo);
    if (conservar) {
      cont.scrollTop = scrollPrevio;
      const nuevo = ancla ? [...cont.querySelectorAll("[data-ancla]")].find(e => e.dataset.ancla === ancla.clave) : null;
      if (nuevo) {
        const desvio = nuevo.getBoundingClientRect().top - cont.getBoundingClientRect().top - ancla.y;
        if (Math.abs(desvio) >= 1) cont.scrollTop += desvio;
        nuevo.focus({ preventScroll: true });
      }
    }
  }

  crearFilaResumenAlquimia(etiqueta, valor) {
    const fila = this.elementoOficio("div", "", "alq-resumen-fila");
    fila.append(this.elementoOficio("span", etiqueta), this.elementoOficio("span", valor));
    return fila;
  }

  // Panel de resultado INTEGRADO: ya no sustituye la interfaz de alquimia ni salta
  // como ventana aparte. Se pinta en el panel central, en el mismo hueco donde
  // estaban las etapas/acciones de la elaboración (ver renderInteraccionAlquimia).
  renderResultadoAlquimia(cont, aviso) {
    const r = this.alquimiaResultado;
    if (!r) return false;
    const caja = this.elementoOficio("section", "", `alq-resultado${r.fallo ? " fallo" : ""}`);
    caja.setAttribute("role", "status");
    caja.appendChild(this.elementoOficio("div", r.aviso ? "ALQUIMIA" : "RESULTADO DE ELABORACIÓN", "alq-resultado-titulo"));
    const tabla = (filas) => {
      const grid = this.elementoOficio("div", "", "alq-resultado-grid");
      for (const [a, b, clase] of filas) {
        const f = this.elementoOficio("div", "", "alq-resultado-fila");
        f.append(this.elementoOficio("b", a), this.elementoOficio("span", b, clase || ""));
        grid.appendChild(f);
      }
      return grid;
    };
    // Evolución de la bitácora en esta elaboración: una línea por observación.
    const bitacora = () => {
      if (!r.observaciones?.length) return null;
      const b = this.elementoOficio("div", "", "alq-resultado-bitacora");
      b.appendChild(this.elementoOficio("b", "BITÁCORA"));
      for (const linea of r.observaciones) b.appendChild(this.elementoOficio("div", linea));
      return b;
    };
    if (r.aviso) {
      caja.appendChild(this.elementoOficio("h3", "La preparación no puede comenzar"));
      caja.appendChild(this.elementoOficio("div", r.texto || "No se pudo iniciar la elaboración.", "alq-resultado-efecto"));
    } else if (r.fallo) {
      caja.appendChild(this.elementoOficio("h3", "La mezcla colapsó"));
      caja.appendChild(tabla([["Resultado", "Fallido"], ["Cantidad", "x0"], ["XP de Alquimia", "+0 XP"]]));
      caja.appendChild(this.elementoOficio("div", r.texto || "Los ingredientes se perdieron durante el refinado.", "alq-resultado-efecto"));
      const b = bitacora(); if (b) caja.appendChild(b);
    } else {
      const rec = RECETAS[r.rid];
      // Título: el objeto que realmente se obtuvo (la variante según calidad).
      const nombreItem = ITEMS[r.itemId]?.name || rec.nombre;
      caja.appendChild(this.elementoOficio("h3", capitalizarUI(nombreItem)));
      caja.appendChild(tabla([
        ["Calidad", CALIDADES_ALQUIMIA[r.calidad]?.nombre || r.calidad, r.calidad === "excepcional" ? "excepcional" : ""],
        ["Cantidad", `x${r.cantidad || 1}`],
        ["XP de Alquimia", `+${formatearXP(r.xp || 0)} XP`],
      ]));
      const efecto = this.elementoOficio("div", "", "alq-resultado-efecto");
      efecto.append(this.elementoOficio("b", "EFECTO CONSEGUIDO"), this.elementoOficio("span", r.efecto || "Sin efecto registrado."));
      caja.appendChild(efecto);
      const b = bitacora(); if (b) caja.appendChild(b);
      if (r.desbloqueoRapido) caja.appendChild(this.elementoOficio("div", "★ Método excepcional dominado · ELABORACIÓN RÁPIDA desbloqueada para esta variante.", "alq-desbloqueo"));
    }

    const acciones = this.elementoOficio("div", "", "alq-acciones");
    const continuar = this.elementoOficio("button", "CONTINUAR", "chip"); continuar.type = "button";
    continuar.addEventListener("click", () => { this.alquimiaResultado = null; this.renderInteraccionOficio(); });
    acciones.appendChild(continuar);
    if (!r.aviso && r.rid && RECETAS[r.rid]) {
      const repetir = this.elementoOficio("button", "REPETIR", "chip"); repetir.type = "button";
      const faltan = this.materialesFaltantes(RECETAS[r.rid]);
      repetir.disabled = !!faltan.length;
      repetir.title = faltan.length ? `Falta: ${faltan.map(f => `${f.cantidad} ${ITEMS[f.mid].name}`).join(" · ")}` : "Repetir la elaboración";
      repetir.addEventListener("click", () => { this.alquimiaResultado = null; this.iniciarElaboracion(r.rid, { rapida: r.modo === "rapida" }); });
      acciones.appendChild(repetir);
    }
    caja.appendChild(acciones);
    cont.appendChild(caja);
    aviso.textContent = "El objeto obtenido entra automáticamente al inventario. La calidad no depende del azar.";
    return true;
  }

  renderInteraccionAlquimia(cont, aviso) {
    if (!this.profesionDesbloqueada("alquimia")) {
      cont.appendChild(this.elementoOficio("div","Aún no has aprendido Alquimia.","ofi-bloqueo")); return;
    }
    if (!this.tieneEstacionAlquimia()) {
      cont.appendChild(this.elementoOficio("div","No hay una estación alquímica utilizable en esta sala.","ofi-bloqueo")); return;
    }
    this.actualizarRecetasAlquimia();
    const conocidas = Object.entries(RECETAS).filter(([rid])=>this.estadoRecetaAlquimia(rid)?.conocida);
    if (!conocidas.length) { cont.appendChild(this.elementoOficio("div","No conoces ninguna fórmula.","ofi-bloqueo")); return; }
    let rid=this.elaboracion?.rid || this.alquimiaResultado?.rid || this.ofiReceta;
    if (!this.estadoRecetaAlquimia(rid)?.conocida) rid=conocidas[0][0];
    this.ofiReceta=rid;
    const rec=RECETAS[rid], st=this.estadoRecetaAlquimia(rid), dominio=this.dominioAlquimia(rid,"base");
    const catActual=rec.categoria || "especiales";
    this.alquimiaCategoriaAbierta ||= catActual;

    this.tarjetaRangoOficio("alquimia", cont);
    const layout=this.elementoOficio("div","","alq-layout");
    const izq=this.elementoOficio("aside","","alq-col alq-panel");
    izq.appendChild(this.elementoOficio("h4","RECETAS"));
    const cats=this.elementoOficio("div","","alq-categorias");
    const categorias=Object.entries(CATEGORIAS_ALQUIMIA).sort((a,b)=>a[1].orden-b[1].orden);
    for (const [cid,cinfo] of categorias) {
      const regs=conocidas.filter(([,r])=>(r.categoria||"especiales")===cid);
      if (!regs.length) continue;
      const det=this.elementoOficio("details","","alq-cat"); det.open=this.alquimiaCategoriaAbierta===cid;
      const sum=this.elementoOficio("summary",`${cinfo.nombre} (${regs.length})`); det.appendChild(sum);
      sum.addEventListener("click",()=>{ this.alquimiaCategoriaAbierta=cid; });
      const lista=this.elementoOficio("div","","alq-cat-lista");
      for (const [rrid,rrec] of regs) {
        const rst=this.estadoRecetaAlquimia(rrid), btn=this.elementoOficio("button","","alq-receta-btn"); btn.type="button"; btn.setAttribute("aria-current",String(rrid===rid));
        const nom=this.elementoOficio("strong",capitalizarUI(rrec.nombre));
        btn.append(nom,this.elementoOficio("small",`Dominio: ${rst.mejor?CALIDADES_ALQUIMIA[rst.mejor].nombre:"Ninguna"}`,"alq-dominio-txt"));
        btn.addEventListener("click",()=>{ this.ofiReceta=rrid; this.alquimiaCategoriaAbierta=cid; this.elaboracion=null; this.alquimiaResultado=null; this.renderInteraccionOficio(); });
        lista.appendChild(btn);
      }
      det.appendChild(lista); cats.appendChild(det);
    }
    izq.appendChild(cats);

    const centro=this.elementoOficio("main","","alq-col alq-panel");
    centro.appendChild(this.elementoOficio("h3",capitalizarUI(rec.nombre),"alq-receta-titulo"));
    centro.appendChild(this.elementoOficio("p",rec.pista,"alq-pista"));
    centro.appendChild(this.elementoOficio("h4","INGREDIENTES"));
    const ings=this.elementoOficio("div","","alq-ingredientes");
    for (const [mid,n] of Object.entries(rec.ingredientes)) {
      const tiene=this.player.inventario.filter(x=>x===mid).length;
      const f=this.elementoOficio("div","",`alq-ing ${tiene>=n?"ok":"falta"}`);
      f.append(this.elementoOficio("span",capitalizarUI(ITEMS[mid].name)),this.elementoOficio("span",`${tiene}/${n}`,"alq-ing-cant")); ings.appendChild(f);
    }
    centro.appendChild(ings);

    if (this.alquimiaResultado) {
      // Resultado integrado: ocupa el hueco de las etapas/acciones dentro del panel central.
      this.renderResultadoAlquimia(centro,aviso);
    } else if (this.elaboracion) {
      const paso=this.elaboracion.elecciones.length, pulso=PULSOS_ALQUIMIA[paso], etapa=this.elementoOficio("section","","alq-etapa");
      etapa.append(this.elementoOficio("div",`ETAPA ${["I","II","III"][paso]} · ${pulso.nombre}`,"alq-etapa-kicker"),this.elementoOficio("h4",pulso.pregunta));
      const ops=this.elementoOficio("div","","alq-opciones");
      pulso.opciones.forEach((nombre,i)=>{ const b=this.elementoOficio("button",nombre,"chip"); b.type="button"; b.addEventListener("click",()=>this.elegirPulsoAlquimia(i+1)); ops.appendChild(b); });
      etapa.appendChild(ops);
      const cancelar=this.elementoOficio("button","CANCELAR · no consume ingredientes","chip"); cancelar.type="button"; cancelar.style.marginTop="8px"; cancelar.addEventListener("click",()=>{this.elaboracion=null;this.renderInteraccionOficio();}); etapa.appendChild(cancelar);
      centro.appendChild(etapa);
    } else if (dominio?.excepcional) {
      const faltan=this.materialesFaltantes(rec), acciones=this.elementoOficio("div","","alq-acciones-elab");
      const rapido=this.elementoOficio("button","Elaboración Rápida","alq-btn-elab"); rapido.type="button"; rapido.disabled=!!faltan.length;
      rapido.title=faltan.length?`Falta: ${faltan.map(f=>`${f.cantidad} ${ITEMS[f.mid].name}`).join(" · ")}`:"Repetir automáticamente el método excepcional dominado";
      rapido.addEventListener("click",()=>this.iniciarElaboracion(rid,{rapida:true,variante:"base"}));
      const excepcional=this.elementoOficio("button","▸ Elaboración Excepcional","alq-btn-elab"); excepcional.type="button"; excepcional.setAttribute("aria-expanded","false");
      acciones.append(rapido,excepcional); centro.appendChild(acciones);
      const cuerpo=this.elementoOficio("div","","alq-metodo-cuerpo"); cuerpo.hidden=true;
      const metodo=Array.isArray(dominio.metodo)?dominio.metodo:rec.patron;
      metodo.forEach((v,i)=>cuerpo.appendChild(this.crearFilaResumenAlquimia(PULSOS_ALQUIMIA[i].nombre,PULSOS_ALQUIMIA[i].opciones[v-1])));
      const manual=this.elementoOficio("button","ELABORAR MANUALMENTE","chip"); manual.type="button"; manual.disabled=!!faltan.length; manual.addEventListener("click",()=>this.iniciarElaboracion(rid)); cuerpo.appendChild(manual);
      excepcional.addEventListener("click",()=>{ const abrir=cuerpo.hidden; cuerpo.hidden=!abrir; excepcional.setAttribute("aria-expanded",String(abrir)); excepcional.textContent=`${abrir?"▾":"▸"} Elaboración Excepcional`; });
      centro.appendChild(cuerpo);
    } else {
      centro.appendChild(this.elementoOficio("h4","PROCESO DE ELABORACIÓN"));
      const conocimiento=this.elementoOficio("div","","alq-conocimiento");
      st.pulsos.forEach((q,i)=>{
        const valor=q.confirmado?PULSOS_ALQUIMIA[i].opciones[q.confirmado-1]:"?";
        const extra=!q.confirmado&&q.descartados.length?` · descartado: ${q.descartados.map(v=>PULSOS_ALQUIMIA[i].opciones[v-1]).join(", ")}`:"";
        const linea=this.elementoOficio("div","","alq-con-linea"); linea.append(this.elementoOficio("b",`Etapa ${i+1}`),this.elementoOficio("span",`${PULSOS_ALQUIMIA[i].nombre}: ${valor}${extra}`)); conocimiento.appendChild(linea);
      });
      centro.appendChild(conocimiento);
      const faltan=this.materialesFaltantes(rec), acciones=this.elementoOficio("div","","alq-acciones");
      const iniciar=this.elementoOficio("button","COMENZAR ELABORACIÓN","chip principal"); iniciar.type="button"; iniciar.disabled=!!faltan.length;
      iniciar.title=faltan.length?`Falta: ${faltan.map(f=>`${f.cantidad} ${ITEMS[f.mid].name}`).join(" · ")}`:"Comenzar las tres etapas";
      iniciar.addEventListener("click",()=>this.iniciarElaboracion(rid)); acciones.appendChild(iniciar); centro.appendChild(acciones);
    }

    const der=this.elementoOficio("aside","","alq-col alq-panel"); der.appendChild(this.elementoOficio("h4","RESUMEN"));
    const resumen=this.elementoOficio("div","","alq-resumen-lista"), cat=CATEGORIAS_ALQUIMIA[catActual]||CATEGORIAS_ALQUIMIA.especiales;
    resumen.append(this.crearFilaResumenAlquimia("Tipo",cat.nombre),this.crearFilaResumenAlquimia("Dificultad",DIFICULTADES_ALQUIMIA_UI[rec.dificultad]||capitalizarUI(rec.dificultad.replace(/_/g," "))),this.crearFilaResumenAlquimia("Total Elaboradas",String(st.validas)),this.crearFilaResumenAlquimia("Dominio",st.mejor?CALIDADES_ALQUIMIA[st.mejor].nombre:"Ninguna"));
    der.appendChild(resumen);
    der.appendChild(this.elementoOficio("h4","CANTIDADES"));
    const cantidades=this.elementoOficio("div","","alq-resumen-lista"), variantesRec=VARIANTES_ALQUIMIA[rid]||{};
    for (const [calidad,etiqueta] of [["estable","Comunes"],["excepcional","Calidad Excepcional"],["superior","Calidad Superior"],["impura","Calidad Impura"]]) {
      const itemId = variantesRec[calidad]?.id || (calidad==="estable" ? rec.resultado : null);
      if (!itemId) continue;
      cantidades.appendChild(this.crearFilaResumenAlquimia(etiqueta,String(this.player.inventario.filter(x=>x===itemId).length)));
    }
    der.appendChild(cantidades);
    der.appendChild(this.elementoOficio("h4","BITÁCORA"));
    const bits=this.elementoOficio("div","","alq-conocimiento");
    st.pulsos.forEach((q,i)=>{ const l=this.elementoOficio("div","","alq-con-linea"); const valor=q.confirmado?`${PULSOS_ALQUIMIA[i].opciones[q.confirmado-1]} ✓`:q.descartados.length?`? · descartado: ${q.descartados.map(v=>PULSOS_ALQUIMIA[i].opciones[v-1]).join(", ")}`:"?"; l.append(this.elementoOficio("b",PULSOS_ALQUIMIA[i].nombre),this.elementoOficio("span",valor)); bits.appendChild(l); });
    der.appendChild(bits);
    layout.append(izq,centro,der); cont.appendChild(layout);
    if (this.alquimiaResultado) {
      // El panel aparece bajo los ingredientes: se lleva a la vista sin mover nada más.
      cont.querySelector(".alq-resultado")?.scrollIntoView({ block:"nearest" });
      return;
    }
    aviso.textContent = dominio?.excepcional ? "Método excepcional dominado: la elaboración rápida repite exactamente esa variante. El método manual sigue disponible." : "Una elaboración completa consume dos turnos de tiempo. La calidad depende de tus decisiones y práctica, no del azar.";
  }

  renderInteraccionHerboristeria(cont, aviso) {
    if (!this.profesionDesbloqueada("herboristeria")) {
      cont.appendChild(this.elementoOficio("div", "Herboristería no está habilitada para este personaje.", "ofi-bloqueo")); return;
    }
    const rango = this.rangoProfesion("herboristeria");
    const plantas = this.entidadesInteraccionRender("herboristeria");
    const panel = this.elementoOficio("section", "", "ofi-cadaver-panel");
    const tarjetas=this.elementoOficio("div","","ofi-cadaveres");
    for (const {nodo, indice} of plantas) {
      const tarjeta=this.elementoOficio("article","","ofi-cadaver planta ofi-planta-viva");
      tarjeta.style.setProperty("--ofi-acento", this.colorEspecieHerboristeria(nodo.especie));
      const fam=this.familiaridadHerboristeria(nodo.especie);
      // La especie sólo necesita EXAMINARSE una vez en toda la partida; a partir de
      // ahí cualquier nodo de esa especie muestra sus partes directamente.
      const conocida = fam.observaciones > 0;
      const cabezal=this.elementoOficio("div","","ofi-planta-cabezal ofi-planta-cabezal-centro");
      cabezal.append(
        this.elementoOficio("strong",capitalizarUI(nodo.planta.nombre),"ofi-parte-titulo"),
        this.elementoOficio("span",`Familiaridad: ${fam.nombre}`,"ofi-planta-fam"),
      );
      tarjeta.appendChild(cabezal);
      if (nodo.planta.descripcion) {
        tarjeta.appendChild(this.elementoOficio("p", nodo.planta.descripcion, "ofi-planta-desc ofi-planta-desc-bloque"));
      }
      if (!conocida) {
        const cajaExaminar = this.elementoOficio("div", "", "ofi-planta-caja ofi-planta-accion");
        const examinar=this.elementoOficio("button","EXAMINAR","chip libre ofi-btn-examinar"); examinar.type="button";
        examinar.dataset.ancla=`h:${nodo.id}:examinar`;
        examinar.addEventListener("click",()=>{
          this.recolectarPlanta(indice,"examinar");
          this.renderInteraccionOficio();
        }); cajaExaminar.appendChild(examinar);
        const bloqueo=this.elementoOficio("div","","ofi-planta-bloqueo");
        bloqueo.append(this.elementoOficio("i","🔒"),this.elementoOficio("span","Se revelarán después de examinar la planta por primera vez."));
        cajaExaminar.appendChild(bloqueo);
        tarjeta.appendChild(cajaExaminar);
      } else {
        const cajaPartes = this.elementoOficio("div", "", "ofi-planta-caja");
        cajaPartes.appendChild(this.elementoOficio("div","PARTES APROVECHABLES","ofi-partes-header"));
        const lista=this.elementoOficio("div","","ofi-partes-lista");
        for (const proc of nodo.planta.procedimientos) {
          const probReal = this.probabilidadHerboristeria(proc, rango.nivel);
          const disp=this.estadoPartePlanta(nodo.id,proc), prob=Math.round(probReal*100);
          const ui = this.estadoUIParteHerb(nodo.id, proc.id);
          const expandido = !ui.colapsado;
          const item=this.elementoOficio("article","",`ofi-parte-item${expandido?" expandido":""}`);
          const cabecera=this.elementoOficio("button","","ofi-parte-cabecera"); cabecera.type="button";
          cabecera.dataset.ancla=`h:${nodo.id}:${proc.id}:cab`;
          cabecera.appendChild(this.elementoOficio("span",proc.metodo,"ofi-parte-nombre"));
          const derechaGrupo = this.elementoOficio("span","","ofi-parte-cabecera-derecha");
          const badge = this.crearBadgeProbabilidadOficio(probReal, rango.nivel >= 1);
          const estado = this.elementoOficio("span", ui.resultado ? (ui.resultado.fallo?"✗ fallido":"✓ cosechado") : "", `ofi-parte-estado${ui.resultado?(ui.resultado.fallo?" fallo":" exito"):""}`);
          derechaGrupo.append(badge, estado, this.elementoOficio("i","▸","ofi-parte-flecha"));
          cabecera.appendChild(derechaGrupo);
          cabecera.addEventListener("click", () => {
            if (ui.colapsado) {
              for (const p of nodo.planta.procedimientos) {
                const otro = this.estadoUIParteHerb(nodo.id, p.id);
                otro.colapsado = p.id !== proc.id;
              }
            } else {
              ui.colapsado = true;
            }
            this.renderInteraccionOficio();
          });
          item.appendChild(cabecera);
          if (expandido) {
            const cuerpo = this.elementoOficio("div","","ofi-parte-cuerpo");
            cuerpo.appendChild(this.crearMetaParteOficio(proc.dificultad, probReal, rango.nivel >= 1));
            if (proc.pista) cuerpo.appendChild(this.elementoOficio("p",proc.pista,"ofi-parte-pista"));
            const b=this.elementoOficio("button",disp.disponible?"COSECHAR":"COSECHADO","chip"); b.type="button"; b.disabled=!disp.disponible;
            b.dataset.ancla=`h:${nodo.id}:${proc.id}:btn`;
            b.addEventListener("click",()=>{
              const texto=this.recolectarPlanta(indice,proc.metodo);
              ui.resultado={fallo:!texto.startsWith("Herboristería espiritual:"),texto};
              // Mantener abierta la parte que el jugador acaba de intervenir.
              // Sólo el encabezado o abrir otra parte puede contraerla.
              ui.colapsado=false;
              this.renderInteraccionOficio();
            }); cuerpo.appendChild(b);
            if (ui.resultado) {
              cuerpo.appendChild(this.crearResultadoInteraccionOficio(ui.resultado.texto, "herboristeria", ui.resultado.fallo));
            }
            item.appendChild(cuerpo);
          }
          lista.appendChild(item);
        }
        cajaPartes.appendChild(lista);
        tarjeta.appendChild(cajaPartes);
      }
      tarjetas.appendChild(tarjeta);
    }
    panel.appendChild(tarjetas); cont.appendChild(panel);
  }

  renderInteraccionExamen(cont, aviso) {
    if (!this.profesionDesbloqueada("examen")) {
      cont.appendChild(this.elementoOficio("div", "Enseñanza de Examen pendiente de implementación canónica 3C.", "ofi-bloqueo")); return;
    }
    const rango=this.rangoProfesion("examen");
    // Un cadáver completamente intervenido desaparece de la lista: no queda nada
    // que extraer y sólo estorba hasta que se disuelva por su propio contador.
    const cuerpos=this.entidadesInteraccionRender("examen");
    const panel=this.elementoOficio("section","","ofi-cadaver-panel");
    const cabecera=this.elementoOficio("div","","ofi-cadaver-cabecera"), cab=this.elementoOficio("div");
    cab.appendChild(this.elementoOficio("h4",cuerpos.length===1?"CUERPO SELECCIONADO":"CUERPOS DISPONIBLES"));
    if (cuerpos.length===1) cabecera.append(cab);
    else cabecera.append(cab,this.elementoOficio("span",`${cuerpos.length} cuerpo${cuerpos.length===1?"":"s"}`,"ofi-cadaver-contador"));
    panel.appendChild(cabecera);
    if (cuerpos.some(({cuerpo}) => cuerpo.arc1_tutorial !== true)) {
      const leyenda = this.elementoOficio("div", "", "ofi-cadaver-leyenda");
      const lRiesgo = this.elementoOficio("span", "Extraer · gasta un turno, puede arruinar la estructura"); lRiesgo.prepend(this.elementoOficio("i", "", "riesgo"));
      leyenda.append(lRiesgo);
      panel.appendChild(leyenda);
    } else {
      panel.appendChild(this.elementoOficio("div", "No hay cuerpos aprovechables que coincidan con ese objetivo.", "ofi-bloqueo"));
    }
    const tarjetas=this.elementoOficio("div","","ofi-cadaveres");
    for (const {cuerpo,indice} of cuerpos) {
      const tabla=HALLAZGOS_CADAVER[cuerpo.mob_id];
      if (tabla) this.observarCadaver(indice);
      const fam=this.familiaridadExamen(cuerpo.mob_id);
      const tarjeta=this.elementoOficio("article","","ofi-cadaver planta ofi-cuerpo-examen");
      tarjeta.style.setProperty("--ofi-acento", this.colorCadaverExamen(cuerpo));
      const esTutorial = cuerpo.arc1_tutorial === true;
      const restan = esTutorial ? null : Math.max(0,cuerpo.desapareceEn-this.turnoGlobal);
      const cabezal=this.elementoOficio("div","","ofi-planta-cabezal ofi-planta-cabezal-centro");
      cabezal.append(
        this.elementoOficio("strong",`${indice+1}. ${cuerpo.tipo==="restos"?"Restos de ":"Cadáver de "}${cuerpo.name}`,"ofi-parte-titulo"),
        this.elementoOficio("span",esTutorial ? "Cuerpo de práctica · sólo observación" : `Familiaridad: ${fam.nombre} · desaparece en ${restan}t`,"ofi-planta-fam"),
      );
      tarjeta.appendChild(cabezal);
      if (esTutorial) {
        tarjeta.appendChild(this.elementoOficio("p","Este cuerpo se reserva para aprender a observar. No se puede extraer material ni obtener recompensas.","ofi-planta-desc"));
        tarjetas.appendChild(tarjeta);
        continue;
      }
      if (!tabla) { tarjeta.appendChild(this.elementoOficio("div","No hay un procedimiento de Examen registrado para este cuerpo.","ofi-hallazgo")); tarjetas.appendChild(tarjeta); continue; }
      if (tabla.descripcion) {
        tarjeta.appendChild(this.elementoOficio("p",tabla.descripcion,"ofi-planta-desc ofi-planta-desc-bloque"));
      }
      const cajaPartes = this.elementoOficio("div", "", "ofi-planta-caja");
      cajaPartes.appendChild(this.elementoOficio("div","ESTRUCTURAS APROVECHABLES","ofi-partes-header"));
      const lista=this.elementoOficio("div","","ofi-partes-lista");
      const cuerpoKey = `${this.pos}:${indice}:${cuerpo.mob_id}:${cuerpo.caidoEn}`;
      for (const h of tabla.hallazgos) {
        const probReal = this.probabilidadExamen(h,rango.nivel);
        const estado=this.procedimientoUsadoEnCadaver(cuerpo,h);
        const ui=this.estadoUIParteExamen(cuerpoKey,h.id);
        const expandido=!ui.colapsado;
        const item=this.elementoOficio("article","",`ofi-parte-item${expandido?" expandido":""}`);
        const cabeceraParte=this.elementoOficio("button","","ofi-parte-cabecera"); cabeceraParte.type="button";
        cabeceraParte.dataset.ancla=`e:${cuerpoKey}:${h.id}:cab`;
        cabeceraParte.appendChild(this.elementoOficio("span",h.metodo,"ofi-parte-nombre"));
        const derecha=this.elementoOficio("span","","ofi-parte-cabecera-derecha");
        const badge = this.crearBadgeProbabilidadOficio(probReal, rango.nivel >= 1 && !estado);
        const textoEstado = estado ? (estado==="exito" ? "✓ extraído" : "✗ arruinado") : "";
        derecha.append(
          badge,
          this.elementoOficio("span",textoEstado,`ofi-parte-estado${estado?` ${estado==="exito"?"exito":"fallo"}`:""}`),
          this.elementoOficio("i","▸","ofi-parte-flecha"),
        );
        cabeceraParte.appendChild(derecha);
        cabeceraParte.addEventListener("click",()=>{
          if (ui.colapsado) {
            for (const otroHallazgo of tabla.hallazgos) {
              this.estadoUIParteExamen(cuerpoKey,otroHallazgo.id).colapsado = otroHallazgo.id !== h.id;
            }
          } else ui.colapsado=true;
          this.renderInteraccionOficio();
        });
        item.appendChild(cabeceraParte);
        if (expandido) {
          const cuerpoParte=this.elementoOficio("div","","ofi-parte-cuerpo");
          cuerpoParte.appendChild(this.crearMetaParteOficio(h.dificultad, probReal, rango.nivel >= 1 && !estado));
          if (h.pista) cuerpoParte.appendChild(this.elementoOficio("p",h.pista,"ofi-parte-pista"));
          const b=this.elementoOficio("button",estado?(estado==="exito"?"EXTRAÍDO":"ARRUINADO"):"EXTRAER",`chip${estado?` ${estado==="exito"?"exito":"fallo"}`:""}`);
          b.type="button"; b.disabled=!!estado;
          b.dataset.ancla=`e:${cuerpoKey}:${h.id}:btn`;
          b.addEventListener("click",()=>{
            const texto=this.recolectarCadaver(indice,h.metodo);
            ui.resultado={fallo:!texto.startsWith("Extracción espiritual:"),texto};
            ui.colapsado=false;
            this.ofiUltimoResultadoExamen={indice,fallo:ui.resultado.fallo,texto};
            if (this.combate) { this.cerrarInteraccionOficio(); return; }
            this.renderInteraccionOficio();
          });
          cuerpoParte.appendChild(b);
          if (ui.resultado) cuerpoParte.appendChild(this.crearResultadoInteraccionOficio(ui.resultado.texto,"examen",ui.resultado.fallo));
          item.appendChild(cuerpoParte);
        }
        lista.appendChild(item);
      }
      cajaPartes.appendChild(lista);
      tarjeta.appendChild(cajaPartes);
      tarjetas.appendChild(tarjeta);
    }
    panel.appendChild(tarjetas); cont.appendChild(panel);
    aviso.textContent = "EXTRAER es la única entrada a esta interacción. Cada estructura sólo puede intentarse una vez por cuerpo.";
  }

  // Solapas de una ventana de OFICIOS. Alterna en el lugar (sin re-renderizar)
  // para conservar el scroll. Devuelve { barra, paneles, activar }; quien llama
  // rellena paneles[id], los añade al contenedor y ejecuta activar(estado).
  crearSolapasOficio(clave, solapas, propEstado, etiqueta) {
    if (!solapas.some(t => t.id === this[propEstado])) this[propEstado] = solapas[0].id;
    const barra = this.elementoOficio("div", "", "ofi-solapas");
    barra.setAttribute("role", "tablist");
    barra.setAttribute("aria-label", etiqueta);
    const paneles = {}, botones = {};
    for (const t of solapas) {
      const b = this.elementoOficio("button", t.texto, "chip");
      b.type = "button"; b.id = `ofiTab${clave}-${t.id}`;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", `ofiPanel${clave}-${t.id}`);
      botones[t.id] = b;
      const panel = this.elementoOficio("div", "", "ofi-solapa-panel");
      panel.id = `ofiPanel${clave}-${t.id}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", b.id);
      paneles[t.id] = panel;
      barra.appendChild(b);
    }
    const activar = id => {
      this[propEstado] = id;
      for (const t of solapas) {
        const activa = t.id === id;
        botones[t.id].setAttribute("aria-selected", String(activa));
        botones[t.id].tabIndex = activa ? 0 : -1;
        paneles[t.id].hidden = !activa;
      }
    };
    for (const t of solapas) botones[t.id].addEventListener("click", () => activar(t.id));
    return { barra, paneles, activar };
  }

  // ---- Herboristería · datos de consulta (sólo lectura) ----
  // Una planta está "registrada" cuando existe su registro de familiaridad.
  plantaRegistradaHerboristeria(especieId) {
    return !!this.registroEspecieHerboristeria(especieId, false);
  }

  // Ítems distintos que RECOLECTAR/COSECHAR puede obtener de una planta.
  recoleccionesPlantaHerboristeria(especieId) {
    const planta = PLANTAS_ESPIRITUALES[especieId];
    if (!planta) return [];
    return [...new Set((planta.procedimientos || []).map(pr => pr.item))].filter(mid => ITEMS[mid]);
  }

  // Plantas que pueden proveer un ítem: descubiertas y cuántas siguen pendientes.
  proveedoresRecoleccionHerboristeria(itemId) {
    const descubiertas = []; let pendientes = 0;
    for (const [id, planta] of Object.entries(PLANTAS_ESPIRITUALES)) {
      if (!(planta.procedimientos || []).some(pr => pr.item === itemId)) continue;
      if (this.plantaRegistradaHerboristeria(id)) descubiertas.push(id); else pendientes++;
    }
    descubiertas.sort((a, b) => PLANTAS_ESPIRITUALES[a].nombre.localeCompare(PLANTAS_ESPIRITUALES[b].nombre, "es"));
    return { descubiertas, pendientes };
  }

  // ---- Extracción Espiritual · datos de consulta (sólo lectura) ----
  // Una especie está "examinada" cuando existe su registro de familiaridad
  // (se crea al observar un cadáver de esa especie por primera vez).
  especieExaminadaExamen(mobId) {
    return !!this.registroEspecieExamen(mobId, false);
  }

  // Ítems distintos que EXTRAER puede obtener de una especie (según HALLAZGOS_CADAVER).
  extraccionesEspecieExamen(mobId) {
    const tabla = HALLAZGOS_CADAVER[mobId];
    if (!tabla) return [];
    return [...new Set(tabla.hallazgos.map(h => h.item))].filter(mid => ITEMS[mid]);
  }

  // Especies que pueden proveer un ítem: las ya descubiertas (examinadas) y
  // cuántas siguen pendientes de descubrir.
  proveedoresExtraccionExamen(itemId) {
    const descubiertas = []; let pendientes = 0;
    for (const [mobId, tabla] of Object.entries(HALLAZGOS_CADAVER)) {
      if (!MOBS[mobId] || !tabla.hallazgos.some(h => h.item === itemId)) continue;
      if (this.especieExaminadaExamen(mobId)) descubiertas.push(mobId); else pendientes++;
    }
    descubiertas.sort((a, b) => MOBS[a].name.localeCompare(MOBS[b].name, "es"));
    return { descubiertas, pendientes };
  }

  renderExamen(cont) {
    const oficio = this.player.profesiones.examen;
    const rango = this.rangoProfesion("examen");
    cont.appendChild(this.elementoOficio("p", "OFICIOS es una bitácora de progreso. Para trabajar sobre un cuerpo presente usa EXTRAER.", "ofi-descubrimiento"));

    // Solapas: Bitácora de Especies (por defecto) y Enciclopedia de Extracción.
    const { barra, paneles, activar } = this.crearSolapasOficio("Examen", [
      { id: "bitacora", texto: "Bitácora de Especies" },
      { id: "enciclopedia", texto: "Enciclopedia de Extracción" },
    ], "ofiTabExamen", "Registros de Extracción Espiritual");
    cont.appendChild(barra);

    // --- Bitácora de Especies ---
    const bitacora = this.elementoOficio("div", "", "ofi-materiales");
    const especies = Object.keys(oficio.descubrimientos || {}).filter(mobId => HALLAZGOS_CADAVER[mobId] && MOBS[mobId]);
    if (!especies.length) bitacora.appendChild(this.elementoOficio("div", "Todavía no has registrado una especie compatible con el oficio.", "ofi-bloqueo"));
    for (const mobId of especies.sort((a,b) => MOBS[a].name.localeCompare(MOBS[b].name, "es"))) {
      const fam = this.familiaridadExamen(mobId);
      const fila = this.elementoOficio("div", "", "ofi-material");
      fila.append(this.elementoOficio("b", capitalizarUI(MOBS[mobId].name)), this.elementoOficio("span", fam.nombre));
      fila.appendChild(this.elementoOficio("span", `Observaciones ${fam.observaciones} · extracciones exitosas ${fam.exitos} · procedimientos ${fam.completos}/${fam.total}.`, "ofi-linea"));
      const posibles = this.extraccionesEspecieExamen(mobId);
      if (posibles.length) fila.appendChild(this.elementoOficio("span", `Extracciones posibles: ${posibles.map(mid => ITEMS[mid].name).join(", ")}.`, "ofi-linea"));
      bitacora.appendChild(fila);
    }
    paneles.bitacora.appendChild(bitacora);

    // --- Enciclopedia de Extracción ---
    paneles.enciclopedia.appendChild(this.elementoOficio("p", "Sólo figuran aquí los materiales obtenidos mediante procedimientos de Extracción. Botín automático y objetos encontrados en el mundo permanecen fuera de este registro.", "atlas-nota"));
    const caja = this.elementoOficio("div", "", "ofi-materiales");
    const materiales = Object.entries(oficio.materiales || {}).filter(([mid, n]) => ITEMS[mid] && n > 0);
    if (!materiales.length) caja.appendChild(this.elementoOficio("div", "Todavía no has completado una extracción profesional.", "ofi-bloqueo"));
    for (const [mid] of materiales.sort((a, b) => ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name, "es"))) {
      const fila = this.elementoOficio("div", "", "ofi-material");
      fila.appendChild(this.elementoOficio("b", capitalizarUI(ITEMS[mid].name)));
      const { descubiertas, pendientes } = this.proveedoresExtraccionExamen(mid);
      const partes = [];
      if (descubiertas.length) partes.push(`Especies: ${descubiertas.map(id => MOBS[id].name).join(", ")}`);
      if (pendientes > 0) partes.push(`especies no descubiertas: ${pendientes}`);
      if (partes.length) fila.appendChild(this.elementoOficio("span", capitalizarUI(partes.join(" · ")), "ofi-linea"));
      caja.appendChild(fila);
    }
    paneles.enciclopedia.appendChild(caja);

    cont.append(paneles.bitacora, paneles.enciclopedia);
    activar(this.ofiTabExamen);

    cont.appendChild(this.elementoOficio("p", rango.nivel >= 1
      ? "Como Novicio estimas el porcentaje de éxito antes de intervenir y recibes +5 puntos porcentuales sobre la base del procedimiento."
      : "Como Iniciado reconoces la dificultad, pero no ves un porcentaje exacto. La práctica exitosa enseña; observar y fallar no dan XP.", "atlas-nota"));
  }

  renderHerboristeria(cont) {
    const oficio = this.player.profesiones.herboristeria;
    const rango = this.rangoProfesion("herboristeria");
    cont.appendChild(this.elementoOficio("p", "OFICIOS es una bitácora de progreso. Para trabajar sobre las plantas de la sala usa RECOLECTAR o COSECHAR.", "ofi-descubrimiento"));

    // Solapas: Bitácora de Plantas (por defecto) y Enciclopedia de Recolección.
    const { barra, paneles, activar } = this.crearSolapasOficio("Herb", [
      { id: "bitacora", texto: "Bitácora de Plantas" },
      { id: "enciclopedia", texto: "Enciclopedia de Recolección" },
    ], "ofiTabHerb", "Registros de Herboristería Espiritual");
    cont.appendChild(barra);

    // --- Bitácora de Plantas ---
    const bitacora = this.elementoOficio("div", "", "ofi-materiales");
    const especies = Object.keys(oficio.especies || {}).filter(id => PLANTAS_ESPIRITUALES[id]);
    if (!especies.length) bitacora.appendChild(this.elementoOficio("div", "Todavía no has estudiado una planta espiritual.", "ofi-bloqueo"));
    for (const especieId of especies.sort((a,b) => PLANTAS_ESPIRITUALES[a].nombre.localeCompare(PLANTAS_ESPIRITUALES[b].nombre,"es"))) {
      const fam = this.familiaridadHerboristeria(especieId);
      const fila = this.elementoOficio("div", "", "ofi-material");
      fila.append(this.elementoOficio("b", capitalizarUI(PLANTAS_ESPIRITUALES[especieId].nombre)), this.elementoOficio("span", fam.nombre));
      fila.appendChild(this.elementoOficio("span", `Observaciones ${fam.observaciones} · cosechas exitosas ${fam.exitos} · procedimientos principales ${fam.completos}/${fam.total}.`, "ofi-linea"));
      const posibles = this.recoleccionesPlantaHerboristeria(especieId);
      if (posibles.length) fila.appendChild(this.elementoOficio("span", `Recolecciones posibles: ${posibles.map(mid => ITEMS[mid].name).join(", ")}.`, "ofi-linea"));
      bitacora.appendChild(fila);
    }
    paneles.bitacora.appendChild(bitacora);

    // --- Enciclopedia de Recolección ---
    const caja = this.elementoOficio("div", "", "ofi-materiales");
    const materiales = Object.entries(oficio.materiales || {}).filter(([mid,n]) => ITEMS[mid] && n > 0);
    if (!materiales.length) caja.appendChild(this.elementoOficio("div", "Todavía no has completado un procedimiento profesional con éxito.", "ofi-bloqueo"));
    for (const [mid] of materiales.sort((a,b) => ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name,"es"))) {
      const fila = this.elementoOficio("div", "", "ofi-material");
      fila.appendChild(this.elementoOficio("b", capitalizarUI(ITEMS[mid].name)));
      const { descubiertas, pendientes } = this.proveedoresRecoleccionHerboristeria(mid);
      const partes = [];
      if (descubiertas.length) partes.push(`Plantas: ${descubiertas.map(id => PLANTAS_ESPIRITUALES[id].nombre).join(", ")}`);
      if (pendientes > 0) partes.push(`plantas no descubiertas: ${pendientes}`);
      if (partes.length) fila.appendChild(this.elementoOficio("span", capitalizarUI(partes.join(" · ")), "ofi-linea"));
      caja.appendChild(fila);
    }
    paneles.enciclopedia.appendChild(caja);

    cont.append(paneles.bitacora, paneles.enciclopedia);
    activar(this.ofiTabHerb);

    cont.appendChild(this.elementoOficio("p", rango.nivel >= 1
      ? "Como Novicio estimas el porcentaje de éxito y recibes +5 puntos porcentuales sobre la base del procedimiento."
      : "Como Iniciado reconoces la dificultad, pero no ves el porcentaje exacto. Examinar y fallar dan 0 XP.", "atlas-nota"));
  }

  renderAlquimia(cont) {
    const nuevas = this.actualizarRecetasAlquimia();
    if (nuevas.length) cont.appendChild(this.elementoOficio("div", `La Bitácora incorpora ${nuevas.map(r=>RECETAS[r].nombre).join(" · ")}. Conocer una fórmula no revela todavía su combinación.`, "ofi-descubrimiento"));
    const conocidas = Object.entries(RECETAS).filter(([rid]) => this.estadoRecetaAlquimia(rid)?.conocida);
    cont.appendChild(this.elementoOficio("p", "OFICIOS conserva la Bitácora Alquímica. Para elaborar en una estación presente usa ALQUIMIA o CALDERO.", "ofi-descubrimiento"));
    cont.appendChild(this.elementoOficio("h4", "BITÁCORA ALQUÍMICA"));
    if (!conocidas.length) { cont.appendChild(this.elementoOficio("div","No conoces ninguna fórmula.","ofi-bloqueo")); return; }
    const categorias=Object.entries(CATEGORIAS_ALQUIMIA).sort((a,b)=>a[1].orden-b[1].orden);
    for (const [cid,cinfo] of categorias) {
      const regs=conocidas.filter(([,r])=>(r.categoria||"especiales")===cid);
      if (!regs.length) continue;
      const det=this.elementoOficio("details","","alq-cat");
      det.open=regs.some(([rid])=>rid===this.ofiReceta);
      det.appendChild(this.elementoOficio("summary",`${cinfo.nombre} (${regs.length})`));
      const lista=this.elementoOficio("div","","alq-cat-lista");
      const abiertas=(this.alquimiaRecetasAbiertas ||= new Set());
      for (const [rid,rec] of regs) {
        // FICHA-ACORDEÓN · contraída por defecto.
        //  · Cabecera (siempre visible): nombre, rango, total elaboradas y, si ya lo tiene, Dominio Excepcional (dorado).
        //  · Detalle (sólo desplegada): avance de bitácora (si la bitácora sigue en proceso) e ingredientes con inventario/requerido.
        const st=this.estadoRecetaAlquimia(rid), dominada=this.alquimiaDominada(rid,"base"), abierta=abiertas.has(rid);
        const ficha=this.elementoOficio("div","","alq-receta-ficha"); ficha.dataset.rid=rid; ficha.setAttribute("aria-current",String(rid===this.ofiReceta));
        const detId=`alq-receta-det-${rid}`;

        const cab=this.elementoOficio("button","","alq-receta-cab"); cab.type="button";
        cab.setAttribute("aria-expanded",String(abierta)); cab.setAttribute("aria-controls",detId);
        cab.appendChild(this.elementoOficio("strong",tituloReceta(rec.nombre)));
        cab.appendChild(this.elementoOficio("span",`Rango: ${DIFICULTADES_ALQUIMIA_UI[rec.dificultad]||capitalizarUI(rec.dificultad.replace(/_/g," "))}`,"alq-ficha-dato"));
        cab.appendChild(this.elementoOficio("span",`Total Elaboradas: ${st.validas}`,"alq-ficha-dato"));
        if (dominada) cab.appendChild(this.elementoOficio("span","Dominio: Excepcional","alq-ficha-dato dorado"));

        const detalle=this.elementoOficio("div","","alq-receta-detalle"); detalle.id=detId; detalle.hidden=!abierta;
        if (!dominada) {
          detalle.appendChild(this.elementoOficio("span","Avance de Bitácora:","alq-ficha-dato"));
          st.pulsos.forEach((q,i)=>{
            const nombre=capitalizarUI(PULSOS_ALQUIMIA[i].nombre.toLowerCase());
            const valor=q.confirmado?`${PULSOS_ALQUIMIA[i].opciones[q.confirmado-1]} ✓`:(q.descartados.length?`? · descartado: ${q.descartados.map(v=>PULSOS_ALQUIMIA[i].opciones[v-1]).join(", ")}`:"?");
            detalle.appendChild(this.elementoOficio("span",`${nombre}: ${valor}`,"alq-ficha-etapa"));
          });
        }
        detalle.appendChild(this.elementoOficio("span","Ingredientes","alq-ficha-etq"));
        const ings=this.elementoOficio("div","","alq-ingredientes");
        for (const [mid,n] of Object.entries(rec.ingredientes)) {
          const tiene=this.player.inventario.filter(x=>x===mid).length;
          const f=this.elementoOficio("div","",`alq-ing ${tiene>=n?"ok":"falta"}`);
          f.append(this.elementoOficio("span",capitalizarUI(ITEMS[mid].name)),this.elementoOficio("span",`${tiene}/${n}`,"alq-ing-cant")); ings.appendChild(f);
        }
        detalle.appendChild(ings);

        // Alternar en el lugar (sin re-renderizar) para no plegar otras categorías abiertas ni perder el scroll.
        cab.addEventListener("click",()=>{
          const desplegar=cab.getAttribute("aria-expanded")!=="true";
          cab.setAttribute("aria-expanded",String(desplegar)); detalle.hidden=!desplegar;
          if (desplegar) abiertas.add(rid); else abiertas.delete(rid);
          this.ofiReceta=rid;
          cont.querySelectorAll(".alq-receta-ficha").forEach(f=>f.setAttribute("aria-current",String(f===ficha)));
        });
        ficha.append(cab,detalle);
        lista.appendChild(ficha);
      }
      det.appendChild(lista); cont.appendChild(det);
    }
  }


  bloqueoPaso(origen, direccion) {
    const destino = this.rooms?.[origen]?.exits?.[direccion];
    if (!destino) return "No hay salida hacia allí.";
    if (esSalidaRegional(origen,direccion,destino)) return "Ruta regional reservada al Arco 2. Todavía no está disponible.";
    if (!this.rooms[destino]) return "Destino interno inexistente: " + destino;
    const gate = gateEntre(origen,destino);
    if (gate && !pasoGateAbierto(origen,destino,this.gates)) return "Paso cerrado. Su apertura pertenece al progreso canónico pendiente de 3C.";
    return null;
  }
  establecerGate(id, abierto) {
    if (!GATES_329.some(g=>g.id===id)||typeof abierto!=="boolean") return false;
    this.gates = normalizarEstadoGates(this.gates);
    if (abierto && (id==="M12"||id.startsWith("ATAJO_ALA_")) && !this.gates.SECTA_INTERIOR) return false;
    this.gates = normalizarEstadoGates({...this.gates,[id]:abierto});
    return true;
  }

  leerSlotDetallado(clave) {
    try {
      const raw = localStorage.getItem(clave);
      if (raw === null) return { estado: "VACÍO", data: null };
      let data;
      try { data = JSON.parse(raw); } catch { return { estado: "CORRUPTO/INVÁLIDO", data: null }; }
      return { estado: this.clasificarPartida(data), data };
    } catch { return { estado: "CORRUPTO/INVÁLIDO", data: null }; }
  }

  clasificarPartida(data) {
    try {
      if (data?.saveSchemaVersion !== SAVE_SCHEMA_VERSION) return "INCOMPATIBLE";
      return validarSave329(data).length ? "CORRUPTO/INVÁLIDO" : "VÁLIDO";
    } catch { return "CORRUPTO/INVÁLIDO"; }
  }

  describirSlot(slot) {
    return slot.estado === "VÁLIDO" ? this.infoPartida(slot.data) : slot.estado;
  }

  buscarCandidatosAtraccion() {
    const origen = this.pos, actual = this.rooms?.[origen];
    if (!actual || !ROOMS[origen]) return [];
    const candidatos = [], vecinos = [...new Set(Object.values(ROOMS[origen].exits || {}))];
    for (const destino of vecinos) {
      const room = ROOMS[destino];
      if (!room || destino === origen || room.area !== ROOMS[origen].area) continue;
      if (A08_RECOLONIZATION_BOSS_ROOMS[origen] && !this.flags?.["muerto_"+A08_RECOLONIZATION_BOSS_ROOMS[origen]]) continue;
      if (!pasoGateAbierto(origen, destino, this.gates)) continue;
      // EntrarSala() usa este mismo contador por especie, incluso con mobs repetidos.
      const ordinales = {};
      for (const mobId of room.mobs || []) {
        ordinales[mobId] = (ordinales[mobId] || 0) + 1;
        const plantilla = MOBS[mobId];
        if (!plantilla) continue;
        const ordinal = ordinales[mobId], fijoId = `${destino}:${mobId}:${ordinal}`;
        if (plantilla.unico) continue; // Unique guardians never move through attraction.
        if (!a08PuedeManifestarse(this,mobId)||!a08TerritorialRuntime.mayManifest(this,mobId,destino)||A08_RECOLONIZATION_BOSS_ROOMS[destino]) continue;
        if (!plantilla.unico && (this.respawnEn?.[fijoId] || 0) > this.relojEcologico) continue;
        candidatos.push({ tipo: "fijo", roomOrigen: destino, mobId, ordinal, fijoId });
      }
      for (const errante of this.errantes || []) {
        if (errante.sala !== destino || errante.muertoHasta !== 0) continue;
        if (!a08ErranteLocalValido(errante,this)) continue;
        const territorio=a08TerritorioEfectivo(errante,this);
        if (!territorio.includes(origen) || !territorio.includes(destino)) continue;
        if (!MOBS[errante.mobId] || MOBS[errante.mobId].unico || !a08TerritorialRuntime.mayManifest(this,errante.mobId,this.pos) || !a08TerritorialRuntime.step(errante,this,origen)) continue;
        candidatos.push({ tipo: "errante", roomOrigen: destino, mobId: errante.mobId, erranteId: errante.id });
      }
    }
    return candidatos;
  }

  materializarCandidatoAtraccion(candidato) {
    if (!candidato || !ROOMS[this.pos] || candidato.roomOrigen === this.pos) return null;
    if (!Object.values(ROOMS[this.pos].exits || {}).includes(candidato.roomOrigen)) return null;
    if (ROOMS[candidato.roomOrigen]?.area !== ROOMS[this.pos].area) return null;
    if (!pasoGateAbierto(this.pos, candidato.roomOrigen, this.gates)) return null;
    const plantilla = MOBS[candidato.mobId];
    if (!plantilla) return null;
    if (plantilla.unico || !a08PuedeManifestarse(this,candidato.mobId)) return null;
    let meta, errante = null;
    if (candidato.tipo === "fijo") {
      const matches = (ROOMS[candidato.roomOrigen].mobs || []).filter(id => id === candidato.mobId);
      if (!Number.isInteger(candidato.ordinal) || candidato.ordinal < 1 || candidato.ordinal > matches.length) return null;
      const id = `${candidato.roomOrigen}:${candidato.mobId}:${candidato.ordinal}`;
      if (candidato.fijoId !== id || (this.respawnEn?.[id] || 0) > this.relojEcologico) return null;
      if (plantilla.unico && this.flags?.[`muerto_${candidato.mobId}`]) return null;
      meta = { fijoId: id };
    } else if (candidato.tipo === "errante") {
      errante = (this.errantes || []).find(e => e.id === candidato.erranteId);
      if (!errante || errante.mobId !== candidato.mobId || errante.sala !== candidato.roomOrigen || errante.muertoHasta !== 0) return null;
      if (!a08ErranteLocalValido(errante,this)) return null;
      const territorio=a08TerritorioEfectivo(errante,this);
      if (!territorio.includes(this.pos) || !territorio.includes(candidato.roomOrigen)) return null;
      meta = { erranteId: errante.id, erranteDesde: candidato.roomOrigen, erranteMovidoEn: this.turnoGlobal };
    } else return null;
    const mob = crearMob(candidato.mobId, plantilla, meta);
    // Guard obligatorio antes de alterar al errante o presentar un combate.
    const fijoValido = mob.fijo_id === meta.fijoId && !!mob.fijo_id && !mob.errante_id;
    const erranteValido = mob.errante_id === meta.erranteId && !!mob.errante_id && !mob.fijo_id;
    if (fijoValido === erranteValido) return null;
    if (errante) {
      errante.sala = this.pos;
      errante.desde = candidato.roomOrigen;
      errante.movidoEn = this.turnoGlobal;
    } else mob.atraccionFija = true; // sólo en vivos; jamás se serializa.
    return mob;
  }

  atraerHostilVecino(senal) {
    if (this.combate || (this.vivos || []).some(m => m.hp > 0)) return null;
    const prob = senal === "QI" ? PROB_ATRACCION_QI : senal === "SANGRE" ? PROB_ATRACCION_SANGRE : 0;
    if (!prob || (senal === "QI" && (this.interrupcionEn?.[this.pos] || 0) > this.relojEcologico)) return null;
    if (Azar.random() >= prob) return null;
    const candidatos = this.buscarCandidatosAtraccion();
    if (!candidatos.length) return null;
    const elegido = candidatos[Math.floor(Azar.random() * candidatos.length)];
    const mob = this.materializarCandidatoAtraccion(elegido);
    if (!mob || !!mob.fijo_id === !!mob.errante_id) return null;
    this.vivos.push(mob);
    if (senal === "QI") this.registrarInterrupcionMeditacion();
    this.entrarCombate(mob, mob.mob_id);
    return mob;
  }

  finalizarAtraccionCombate(combatientes) {
    const sobrevivientes = new Set((combatientes || []).filter(m => m?.hp > 0 && m.atraccionFija === true && !!m.fijo_id && !m.errante_id));
    if (sobrevivientes.size) this.vivos = (this.vivos || []).filter(m => !sobrevivientes.has(m));
  }
}
