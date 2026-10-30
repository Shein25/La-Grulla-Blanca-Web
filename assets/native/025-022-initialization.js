globalThis.ASTRA_A08_ACCEPTED_CREATE_METADATA=function(nombre, raiz, origen) {
    const r = {nombre: raiz.toLowerCase()}, o = ORIGENES[origen];
    // Root identity is revealed only after the authentic five-answer evaluation.
    const p = {
      name: nombre, es_jugador: true, mob_id: "", unico: false,
      // Legacy combat stats are not initialized or mirrored.
      qi_recompensa: 0, loot: [],
      raiz_secundaria: null, reino: "LianQi", etapa: 1, // Cold narrative metadata, not NEW stage authority.
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
      equipado: {}, // Cold legacy container; never NEW equipment authority.
      tecnicas: {}, puntos_tecnica_total: 1, meridianos_version: 3, equipo_version: 2,
      // Configuración de combate y presets. Ver CONTRATO DE DISEÑO · BUILDS Y COMBATE.
      // La técnica concedida por la raíz empieza preparada, pero SIN invertir
      // puntos ni elegir ramas: preparar es loadout, no especialización.
      tecnicas_preparadas: [], builds: [], build_activa: null, build_seq: 0, builds_version: 2,
    };
    // No unbound root technique is granted by the core.
    const perk = [];
    if (origen === "campesino") {
      // Historical origin HP has no NEW authority; not applied.
      p.inventario.push("pocion", "pocion");
      perk.push("Las pociones de tu madre viajan contigo.");
    } else if (origen === "escolar") {
      p.comprension = 2;
      perk.push("Tres exámenes fracasados enseñan a leer el mundo: empiezas con comprensión 2.");
    } else if (origen === "callejero") {
      p.inventario.push("cuchillo_hueso");
      p.piedras = 0;
      perk.push("El cuchillo de hueso de Anling sigue contigo; podrás elegirlo en lugar de la espada de práctica.");
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
  };
globalThis.ASTRA_A08_ACCEPTED_PANEL=function() {
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

    if (!this.combate) {
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

    }
    seccion("CORE");
    linea("Consulta TÉCNICAS para ver las formas aprendidas y sus requisitos.", "dim");
  };
