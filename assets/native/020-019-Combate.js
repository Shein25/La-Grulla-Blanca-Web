class Combate {
  constructor(juego, enemigo, mobId, especial = null, buffAtaque = 0, permitirHuir = true) {
    this.j = juego; this.e = enemigo; this.mobId = mobId; // this.e = objetivo actual
    juego.recordarCriatura({ ...enemigo, mob_id: mobId });
    this.especial = especial; this.buff = buffAtaque; this.permitirHuir = permitirHuir;
    this.combatientes = [enemigo]; // todos los hostiles trabados en el combate (incluye al objetivo)
    this.estados = { jugador: [] };
    // Map<mobObj, estados[]>: los DOT siguen aplicando a un mob aunque dejes de
    // apuntarle (cambies de objetivo), en vez de desaparecer como si nunca hubieran pasado.
    this.estadosEnemigos = new Map();
    this.estadosEnemigos.set(enemigo, []);
    this.cooldownsTecnica = {};
    this.tenacidadControl = new Map();
    this.tenacidadNueva = new Set();
    this.ecoElemental = null;
    this.round = 0;
  }

  ef() {
    const e = this.j.efectivo();
    return this.buff ? { ...e, ataque: e.ataque + this.buff } : e;
  }

  resumenVital() {
    const p = this.j.player;
    const objetivo = this.e;
    if (!objetivo) return `   TÚ ♥ ${barra(Math.max(0, p.hp), p.max_hp, 10)} ${Math.max(0, p.hp)}/${p.max_hp}`;

    return `   TÚ ♥ ${barra(Math.max(0, p.hp), p.max_hp, 10)} ${Math.max(0, p.hp)}/${p.max_hp}`
      + `   │   ${etiquetaMob(objetivo)} ♥ ${barra(Math.max(0, objetivo.hp), objetivo.max_hp, 10)} ${Math.max(0, objetivo.hp)}/${objetivo.max_hp}`;
  }





  ayuda() {
    return "   [ACCIONES DE COMBATE]";
  }

  inicio() {
    const titulo = `   ⚔ COMBATE · ${etiquetaMob(this.e)}`;
    return `${titulo}\n${this.resumenVital()}\n${this.ayuda()}`;
  }

  // "enemigo" sigue significando "el objetivo actual" (this.e): todo el código de
  // técnicas existente (quemadura, debil, atadura por técnica) sigue funcionando.
  //
  // CONTRATO DE ACUMULACIÓN:
  //   * categoria/grupo identifica QUÉ atributo modifica el estado.
  //   * categorías distintas jamás se pisan entre sí: EVA + DEF + ABS pueden
  //     convivir simultáneamente, y el sistema queda listo para DAÑO/ATQ futuros.
  //   * por defecto sólo se reemplaza/refresca la MISMA categoría.
  //   * modoAcumulacion:"acumular" permite múltiples instancias futuras.
  claveEstado(st = {}) { return String(st.grupo || st.categoria || st.tipo || "estado"); }
  aplicarEnListaEstados(lista, st) {
    const nuevo = { ...st, categoria: this.claveEstado(st) };
    // Una absorción que sólo declara `reduccion` recibe su reserva por defecto (golpe × golpes).
    // Se copia `params` para que gastar la reserva no toque el objeto de quien llamó.
    if (nuevo.tipo === "guardia" && nuevo.params) {
      nuevo.params = { ...nuevo.params };
      if (Number.isFinite(nuevo.params.reduccion) && !Number.isFinite(nuevo.params.capacidad)) {
        nuevo.params.capacidad = capacidadGuardia(nuevo.params.reduccion, nuevo.duracion);
        nuevo.params.capacidadMax = nuevo.params.capacidad;
      }
    }
    const modo = nuevo.modoAcumulacion || "reemplazar";
    if (modo === "acumular") return [...lista, nuevo];
    const clave = nuevo.categoria;
    const resto = lista.filter(s => this.claveEstado(s) !== clave);
    resto.push(nuevo);
    return resto;
  }
  aplicar(lado, st) {
    if (lado === "jugador") {
      this.estados.jugador = this.aplicarEnListaEstados(this.estados.jugador, st);
    } else {
      this.aplicarAMob(this.e, st);
    }
  }
  aplicarAMob(mob, st) {
    const lista = this.estadosEnemigos.get(mob) || [];
    this.estadosEnemigos.set(mob, this.aplicarEnListaEstados(lista, st));
  }
  estadoDe(lado, tipo) {
    if (lado === "jugador") return this.estados.jugador.find(s => s.tipo === tipo) || null;
    return this.estadoDeMob(this.e, tipo);
  }
  estadoDeMob(mob, tipo) {
    return (this.estadosEnemigos.get(mob) || []).find(s => s.tipo === tipo) || null;
  }

  cooldownTecnica(tid) {
    return Math.max(0, this.cooldownsTecnica[tid] || 0);
  }

  tenacidadDe(mob) {
    return Math.max(0, this.tenacidadControl.get(mob) || 0);
  }

  probabilidadControl(conf, mob = this.e) {
    if (!mob || this.tenacidadDe(mob) > 0) return 0;
    const ataque = this.ef().ataque + conf.controlBono;
    const defensa = mob.defensa + (mob.unico ? 2 : 0);
    return probabilidadImpacto(ataque, defensa, 21);
  }

  intentarControl(mob, conf, duracion, frase) {
    if (this.tenacidadDe(mob) > 0) return { ok: false, razon: "tenacidad", probabilidad: 0, duracion: 0 };
    const ataque = this.ef().ataque + conf.controlBono;
    const defensa = mob.defensa + (mob.unico ? 2 : 0);
    const probabilidad = probabilidadImpacto(ataque, defensa, 21);
    const tirada = 1 + Math.floor(Azar.random() * 20);
    if (!impactaConTirada(tirada, ataque, defensa, 21)) {
      return { ok: false, razon: "resistido", probabilidad, duracion: 0 };
    }
    const duracionReal = mob.unico ? Math.min(1, duracion) : duracion;
    this.aplicarAMob(mob, { tipo: "atadura", duracion: duracionReal, frase });
    if (mob.unico) {
      this.tenacidadControl.set(mob, 2);
      this.tenacidadNueva.add(mob);
    }
    return { ok: true, razon: "aplicado", probabilidad, duracion: duracionReal };
  }

  avanzarTemporizadores(tecnicaUsada = null) {
    for (const [tid, restante] of Object.entries(this.cooldownsTecnica)) {
      if (tid === tecnicaUsada) continue;
      const nuevo = Math.max(0, restante - 1);
      if (nuevo) this.cooldownsTecnica[tid] = nuevo;
      else delete this.cooldownsTecnica[tid];
    }
    for (const [mob, restante] of this.tenacidadControl.entries()) {
      if (this.tenacidadNueva.has(mob)) continue;
      const nuevo = Math.max(0, restante - 1);
      if (nuevo) this.tenacidadControl.set(mob, nuevo);
      else this.tenacidadControl.delete(mob);
    }
    this.tenacidadNueva.clear();
  }

  // busca, entre los hostiles vivos de la sala, uno que matchee el nombre/id dado
  // (mismo criterio de resolución que se usa para iniciar combate fuera de éste)
  resolverObjetivo(args) {
    return resolverMobPorArgs(this.j.vivos || [], args);
  }

  turno(verbo, args) {
    const j = this.j, p = j.player;
    const out = [];
    let consume = true;
    let tecnicaUsadaCooldown = null;

    if (verbo === "atacar") {
      let objetivoElegido = this.e;
      if (args && args.length) {
        const encontrado = this.resolverObjetivo(args);
        if (!encontrado) {
          out.push("   No hay nadie así a quien apuntar.");
          consume = false;
        } else {
          objetivoElegido = encontrado;
        }
      }
      if (consume) {
        if (objetivoElegido !== this.e) {
          // cambiar de objetivo consume el turno: no atacás esta ronda, solo re-apuntás
          if (!this.combatientes.includes(objetivoElegido)) {
            this.combatientes.push(objetivoElegido);
            if (!this.estadosEnemigos.has(objetivoElegido)) this.estadosEnemigos.set(objetivoElegido, []);
            out.push(`   ${etiquetaMob(objetivoElegido)}, que hasta ahora no te prestaba atención, ¡se suma al combate!`);
          }
          this.e = objetivoElegido;
          out.push(`   Cambias de objetivo: ahora te concentras en ${etiquetaMob(this.e)}.`);
        } else {
          const [msg, dmg] = atacar(this.ef(), this.e);
          this.e.hp -= dmg;
          out.push(msg);
        }
      }

    } else if (verbo === "tecnica") {
      if (!args.length) {
        out.push("   ¿Cuál técnica? Conoces: " + Object.keys(p.tecnicas).join(", ") + ".");
        consume = false;
      } else {
        const tid = j.resolverTecnica(args);
        if (!tid) {
          out.push("   No conoces esa técnica. (HOJA para verlas)");
          consume = false;
        } else {
          const conf = j.statsTecnica(tid);
          const enfriamiento = this.cooldownTecnica(tid);
          if (enfriamiento > 0) {
            out.push(`   ${TECNICAS[tid].name} todavía recompone su circulación: enfriamiento ${enfriamiento} ronda(s). Elige otra acción.`);
            consume = false;
          } else if (p.qi < conf.coste) {
            out.push(`   Qi insuficiente: ${TECNICAS[tid].name} cuesta ${conf.coste} y tienes ${p.qi}.`);
            consume = false;
          } else {
            const t = TECNICAS[tid];
            let calidadPractica = 1;
            p.qi -= conf.coste;
            out.push(`   ¡${t.name}! ${t.flavor[conf.nivel]}${conf.afinidad ? " (afinidad con tu raíz)" : ""}`);
            // CONCORDANCIA (v49): tabla, constantes y reglas junto a SECUENCIAS_ELEMENTALES.
            //  · Completar una secuencia borra el eco: el contador vuelve a cero y quien la
            //    recibe no prepara la siguiente (sin cadenas infinitas).
            //  · Una Definitiva recibe con cualquiera de sus elementos y nunca prepara eco.
            //  · Una técnica que no ataca cobra el bono de su rol; una ofensiva, el del par.
            const anterior = this.ecoElemental;
            const combo = anterior && anterior.objetivo === this.e ? secuenciaRecibida(anterior.elemento, t) : null;
            const bono = combo ? (t.tipo === "ofensiva" ? combo.bono : "apoyo") : null;
            this.ecoElemental = combo || t.elementos ? null : { elemento: t.elemento, objetivo: this.e };
            let extraApoyo = 0;
            if (combo) {
              let efecto;
              if (bono === "qi") {
                const devuelto = Math.max(1, Math.round(conf.coste * CONCORDANCIA.qi));
                p.qi = Math.min(p.qi_max, p.qi + devuelto);
                efecto = `devuelve ${devuelto} qi`;
              } else if (bono === "apoyo") {
                extraApoyo = bonoApoyoConcordancia(t.tipo, conf);
                efecto = extraApoyo ? `+${extraApoyo}${TEXTO_APOYO[t.tipo] || ""}` : "sin bono para esta técnica";
              } else if (bono === "critico") {
                efecto = conf.critMin <= CRIT_MIN_TOPE ? "el crítico ya está en su tope" : textoBonoConcordancia(combo);
              } else {
                efecto = textoBonoConcordancia(combo);
              }
              out.push(`   Concordancia: ${combo.nombre} (${efecto}).`);
            }
            if (conf.riesgo && Azar.random() * 100 < conf.riesgo) {
              const drenado = Math.min(3, p.qi);
              p.qi -= drenado;
              const antes = p.heridas_meridianos || 0;
              p.heridas_meridianos = Math.min(3, antes + 1);
              out.push(`   ¡Inestabilidad elemental (${conf.riesgo}%)! El arte sale, pero fuerza el cauce: −${drenado} qi, heridas +${p.heridas_meridianos - antes} (máximo 3). Consulta los tratamientos de meridianos.`);
            }

            if (t.tipo === "ofensiva") {
              if (conf.area) {
                for (const mob of (j.vivos || [])) {
                  if (mob.hp <= 0 || this.combatientes.includes(mob)) continue;
                  this.combatientes.push(mob);
                  if (!this.estadosEnemigos.has(mob)) this.estadosEnemigos.set(mob, []);
                  out.push(`   ${mob.name} queda atrapado en la formación y entra al combate.`);
                }
              }
              const objetivos = conf.area ? this.combatientes.filter(m => m.hp > 0) : [this.e];
              let impactos = 0;
              if (conf.area && objetivos.length > 1) out.push(`   La técnica AOE alcanza a ${objetivos.length} enemigos trabados.`);
              if (conf.area && objetivos.length === 1) out.push("   Sin un grupo que propague la formación, el AOE solo conserva el 65% de su fuerza.");
              for (const objetivo of objetivos) {
                const relacion = relacionElementalTecnica(t, objetivo.elemento);
                // El elemento que decide la ventaja (en una Definitiva, el mejor de los dos).
                const elementoVentaja = elementosDeTecnica(t).find(e => relacionElemental(e, objetivo.elemento) === relacion) || t.elemento;
                // La concordancia sólo mejora el primer golpe de un AOE.
                const conBono = objetivo === objetivos[0] ? bono : null;
                const atacante = { ...this.ef(), daño: conf.daño, ataque: this.ef().ataque + conf.ataqueBono };
                const critMinGolpe = conBono === "critico" ? Math.max(CRIT_MIN_TOPE, conf.critMin - CONCORDANCIA.critico) : conf.critMin;
                let [msg, dmg] = atacar(atacante, objetivo, critMinGolpe, conf.critMult);
                // Un solo multiplicador aditivo (ventaja elemental + concordancia) y un solo redondeo.
                const sumaConcordancia = conBono === "daño" ? CONCORDANCIA.daño : 0;
                if (dmg > 0 && (relacion !== 0 || sumaConcordancia)) {
                  const ajustado = Math.max(1, Math.round(dmg * (1 + relacion * BONO_ELEMENTAL + sumaConcordancia)));
                  if (ajustado !== dmg) { msg = msg.replace(`${dmg} de daño`, `${ajustado} de daño`); dmg = ajustado; }
                }
                if (conf.area && objetivos.length === 1 && dmg > 0) {
                  const reducido = Math.max(1, Math.floor(dmg * 0.65));
                  msg = msg.replace(`${dmg} de daño`, `${reducido} de daño`);
                  dmg = reducido;
                }
                objetivo.hp -= dmg;
                out.push(msg);
                if (dmg > 0) impactos++;
                if (dmg > 0 && relacion === 1) {
                  const frase = FLAVOR_VENTAJA_ELEMENTAL[`${elementoVentaja}:${objetivo.elemento}`]
                    || `Tu ${ELEMENTO_UI[elementoVentaja]?.nombre.toLowerCase()} supera al ${ELEMENTO_UI[objetivo.elemento]?.nombre.toLowerCase()} de tu objetivo`;
                  out.push(`   ¡Ventaja elemental! ${frase}: golpeas con más fuerza.`);
                } else if (dmg > 0 && relacion === -1) {
                  const frase = FLAVOR_VENTAJA_ELEMENTAL[`${objetivo.elemento}:${elementoVentaja}`]
                    || `El ${ELEMENTO_UI[objetivo.elemento]?.nombre.toLowerCase()} de tu objetivo resiste tu ${ELEMENTO_UI[elementoVentaja]?.nombre.toLowerCase()}`;
                  out.push(`   (${frase}: golpeas con menos fuerza.)`);
                }
                if (dmg <= 0) continue;
                if (conf.quemadura) {
                  const quemaduraPrevia = this.estadoDeMob(objetivo, "quemadura");
                  const quemadura = quemaduraPrevia
                    ? { daño: `${quemaduraPrevia.params.daño}+${conf.quemadura.daño}`, turnos: Math.max(1, quemaduraPrevia.duracion, conf.quemadura.turnos) }
                    : { daño: conf.quemadura.daño, turnos: Math.max(1, conf.quemadura.turnos) };
                  this.aplicarAMob(objetivo, { tipo: "quemadura", duracion: quemadura.turnos,
                    params: { daño: quemadura.daño }, expira: `La quemadura de ${objetivo.name} se apaga.` });
                  out.push(`   ${objetivo.name} queda QUEMADO (${dadoARango(quemadura.daño)}/turno, ${quemadura.turnos} rondas acumuladas).`);
                }
                if (conf.debil) {
                  this.aplicarAMob(objetivo, { tipo: "debil", duracion: conf.debil.turnos,
                    params: { ataque: conf.debil.ataque },
                    expira: `El qi de agua que empapaba a ${objetivo.name} se evapora.` });
                  out.push(`   El agua empapa el qi de ${objetivo.name}: sus golpes pesan menos.`);
                }
                if (conf.ataduraGolpe) {
                  const control = this.intentarControl(objetivo, conf, conf.ataduraGolpe, "El peso del sello lo clava al suelo");
                  if (control.ok) {
                    out.push(`   El impacto clava a ${objetivo.name} al suelo: perderá ${control.duracion} acción${control.duracion === 1 ? "" : "es"}.`);
                    if (objetivo.unico) out.push("   El jefe afirma su espíritu: después de liberarse tendrá Tenacidad durante 2 rondas.");
                  } else if (control.razon === "tenacidad") {
                    out.push(`   ${objetivo.name} resiste por Tenacidad: el golpe causa daño, pero no aplica ningún control.`);
                  } else {
                    out.push(`   ${objetivo.name} resiste la presión del sello (${control.probabilidad}% de control): no se aplica ningún control.`);
                  }
                }
              }
              if (!impactos) calidadPractica = 0.5;
            } else if (t.tipo === "control") {
              const duracionObjetivo = this.e.unico ? Math.min(1, conf.atadura) : conf.atadura;
              this.cooldownsTecnica[tid] = Math.max(1, duracionObjetivo);
              tecnicaUsadaCooldown = tid;
              const confControl = extraApoyo ? { ...conf, controlBono: conf.controlBono + extraApoyo } : conf;
              const control = this.intentarControl(this.e, confControl, conf.atadura, "El filamento de agua aprieta");
              if (!control.ok) {
                calidadPractica = 0.5;
                if (control.razon === "tenacidad") {
                  out.push(`   ${this.e.name} resiste por Tenacidad. El filamento no aplica daño, atadura ni ningún efecto.`);
                } else {
                  out.push(`   ${this.e.name} rompe el filamento (${control.probabilidad}% de control). No se aplica ningún efecto.`);
                }
              } else {
                out.push(`   El filamento se enrolla en ${this.e.name} (${control.probabilidad}% de control): le roba ${control.duracion} acción${control.duracion === 1 ? "" : "es"}.`);
                if (this.e.unico) out.push("   El jefe obtiene Tenacidad durante 2 rondas; otro control será resistido por completo.");
              }
              if (conf.dañoAtar && control.ok) {
                const d = tirar(conf.dañoAtar);
                this.e.hp -= d;
                out.push(`   El hilo se cierra y CORTA: ${d} de daño.`);
              }
            } else if (t.tipo === "esquiva") {
              this.aplicar("jugador", { tipo: "esquiva", nombre: t.name, duracion: conf.duracion,
                params: { bono: conf.esquiva + extraApoyo }, expira: "Tu Paso de Nube se disipa." });
              out.push(`   +${conf.esquiva + extraApoyo}% de Esquiva durante ${conf.duracion} turnos.`);
            } else if (t.tipo === "fortificacion") {
              this.aplicar("jugador", { tipo: "defensa", nombre: t.name, duracion: conf.duracion,
                params: { bono: conf.defensa + extraApoyo }, expira: "El Espejo de Luna se apaga." });
              out.push(`   +${conf.defensa + extraApoyo} de Defensa durante ${conf.duracion} turnos.`);
            } else if (t.tipo === "guardia") {
              // Burbuja: la reserva total es golpe × duración de la técnica y sólo baja con el daño
              // que absorbe. No decae con las rondas (ver tick) ni cuenta impactos.
              const golpeAbsorbido = conf.guardia + extraApoyo;
              const reserva = capacidadGuardia(golpeAbsorbido, conf.duracion);
              this.aplicar("jugador", { tipo: "guardia", nombre: t.name, duracion: conf.duracion,
                params: { reduccion: golpeAbsorbido, capacidad: reserva, capacidadMax: reserva }, expira: "Tu protección se disipa." });
              out.push(`   Tu protección absorberá hasta ${golpeAbsorbido} por golpe, hasta agotar una reserva de ${reserva} de daño. No se gasta con el paso de las rondas.`);
            }
            // Enfriamiento propio de la técnica (hoy 0 en todas salvo el que fija el control).
            if (conf.enfriamiento > 0) {
              this.cooldownsTecnica[tid] = Math.max(this.cooldownsTecnica[tid] || 0, conf.enfriamiento);
              tecnicaUsadaCooldown = tid;
            }
            j.registrarUso(tid, out, calidadPractica, this.e);
          }
        }
      }

    } else if (verbo === "defender") {
      const antes = p.qi;
      const qiEnemigo = Math.max(0, Number(this.e?.qi) || 0);
      const absorcion = Math.min(p.qi_max - p.qi, Math.floor(qiEnemigo * 0.2));
      p.qi += absorcion;
      this.aplicar("jugador", { tipo: "guardia", nombre: "Defender", duracion: 2,
        params: { reduccionInicial: 35 + Math.floor(Azar.random() * 16), reduccionSegundo: 25 + Math.floor(Azar.random() * 16) },
        expira: "Bajas la guardia y vuelves a moverte." });
      out.push(`   Afirmas los pies: absorbes ${absorcion} qi del enemigo y tu guardia cubrirá los próximos dos golpes que te alcancen.`);

    } else if (verbo === "beber") {
      const [msgs, bebido] = j.beber(args);
      out.push(...msgs);
      consume = bebido;

    } else if (verbo === "huir") {
      if (this.permitirHuir) {
        if (Azar.random() < 0.5) {
          j.registrarActividadReposo();
          j.avanzarEcologia(1);
          j.finalizarAtraccionCombate(this.combatientes);
          return ["   Retrocedes con el qi ardiendo y escapas a tiempo.", "huiste"];
        }
        out.push("   Intentas huir... ¡y fallas!");
      } else {
        out.push("   Huir... ¿de tu propio corazón? No hay adónde.");
        consume = false;
      }

    } else if (verbo === "afinidad") {
      j.cmd_afinidad();
      consume = false;

    } else if (verbo === "hoja") {
      j.mostrarHoja();
      consume = false;

    } else if (verbo === "equipo") {
      j.mostrarEquipo();
      consume = false;

    } else if (verbo === "guardar" || verbo === "cargar") {
      out.push("   No se puede guardar ni cargar en pleno combate. (HUIR, y luego sí)");
      consume = false;

    } else {
      out.push(this.ayuda());
      consume = false;
    }

    if (consume) {
      this.round++;
      j.registrarActividadReposo();
      j.avanzarEcologia(1);
      this.avanzarTemporizadores(tecnicaUsadaCooldown);
    }
    if (consume && verbo !== "tecnica") this.ecoElemental = null;

    let quedanVivos = this.combatientes.some(m => m.hp > 0);
    if (consume && quedanVivos) {
      this.intentarUnionCombate(out);
      this.respuestaEnemigos(out);
    }

    if (consume && quedanVivos && p.hp > 0) this.tick(out);
    // Una quemadura puede vaciar una reserva después de la respuesta enemiga.
    // También en ese caso la siguiente fase nace completa y sin daño sobrante.
    if (consume && p.hp > 0)
    quedanVivos = this.combatientes.some(m => m.hp > 0);

    // limpieza de quien haya caído esta ronda (por el objetivo, por un DOT, por lo que sea)
    const derrotadosAhora = this.combatientes.filter(m => m.hp <= 0);
    for (const mob of derrotadosAhora) {
      out.push(`   ¡${etiquetaMob(mob)} ha caído!`);
      if (!this.especial) j.registrarCadaver(mob);
      if (this.especial !== "practica") {
        // Instrumentación de PRESENTACIÓN únicamente: observa el diff real de
        // qi/inventario/piedras que recompensas() ya produjo. No decide nada,
        // no otorga nada; si no hay ventana de combate abierta (bancos de
        // PRUEBAS, combates creados a mano) el guardado dentro de
        // registrarRecompensaVisual no hace nada.
        const antesRecompensa = { qi: p.qi, piedras: p.piedras, inv: [...p.inventario] };
        const botinAntesConocido = new Set(Object.keys(j.atlas.criaturas[mob.mob_id]?.botin || {}));
        const lineasRecompensa = j.recompensas(mob.mob_id, mob);
        out.push(...lineasRecompensa);
        j.registrarRecompensaVisual(mob, antesRecompensa, botinAntesConocido, lineasRecompensa);
      }
      // La instancia muerta deja de ser una criatura seleccionable de inmediato.
      j.vivos = j.vivos.filter(presente => presente !== mob);
      this.combatientes = this.combatientes.filter(m => m !== mob);
      this.estadosEnemigos.delete(mob);
      if (this.e === mob) {
        this.e = this.combatientes.find(m => m.hp > 0) || this.e;
      }
    }

    if (this.combatientes.length === 0) {
      out.push(this.resumenVital());
      j.finalizarAtraccionCombate(this.combatientes);
      return [out.join("\n"), "victoria"];
    }
    if (p.hp <= 0) {
      out.push(this.resumenVital());
      j.finalizarAtraccionCombate(this.combatientes);
      return [out.join("\n"), "derrota"];
    }

    const activos = [];
    for (const mob of this.combatientes) {
      for (const s of (this.estadosEnemigos.get(mob) || [])) {
        activos.push(`${ESTADO_LABEL[s.tipo] || s.tipo}→${mob.corto || mob.name}(${restoEstadoActivo(s)})`);
      }
      const tenacidad = this.tenacidadDe(mob);
      if (tenacidad) activos.push(`tenacidad→${mob.corto || mob.name}(${tenacidad})`);
    }
    activos.push(...this.estados.jugador.map(s => `${ESTADO_LABEL[s.tipo] || s.tipo}→tú(${restoEstadoActivo(s)})`));
    activos.push(...(p.aflicciones || []).map(a => `${a.nombre}→tú(${a.duracion})`));
    if (activos.length) out.push(`   · estados activos: ${activos.join(" · ")}`);
    out.push(this.resumenVital());
    for (const mob of this.combatientes) {
      if (mob === this.e) continue;
      out.push(`   OTRO · ${etiquetaMob(mob)} ♥ ${barra(Math.max(0, mob.hp), mob.max_hp, 10)} ${Math.max(0, mob.hp)}/${mob.max_hp}`);
    }
    return [out.join("\n"), "continua"];
  }



  intentarUnionCombate(out) {
    for (const mob of (this.j.vivos || [])) {
      if (mob.hp <= 0) continue;
      if (this.combatientes.includes(mob)) continue;
      if (Azar.random() < PROB_UNION_COMBATE) {
        this.combatientes.push(mob);
        if (!this.estadosEnemigos.has(mob)) this.estadosEnemigos.set(mob, []);
        out.push(`   ⚠ ¡${etiquetaMob(mob)} se suma al combate!`);
      }
    }
  }

  // Gasta la burbuja de absorción con un golpe que YA conectó (dmg > 0). Devuelve cuánto
  // absorbió, el texto entre paréntesis para el registro y si la burbuja se rompió.
  // Los ataques que fallan nunca llegan aquí, así que no la desgastan.
  absorberGolpe(gu, dmg) {
    const prm = gu.params || {};
    const nombre = gu.nombre || "La protección";
    let absorbido;
    if (prm.reduccionInicial != null) {
      // DEFENDER: porcentaje del golpe, fuerte con el primero y débil con el segundo.
      const porcentaje = gu.duracion >= 2 ? prm.reduccionInicial : (prm.reduccionSegundo ?? prm.reduccionInicial);
      absorbido = Math.min(dmg, Math.floor(dmg * porcentaje / 100));
      gu.duracion--;
      const rota = gu.duracion <= 0;
      if (rota) this.estados.jugador = this.estados.jugador.filter(s => s !== gu);
      return { absorbido, rota, extra: ` (${nombre} reduce ${porcentaje}%: -${absorbido})` };
    }
    // Burbuja de una técnica: tope por golpe y reserva total de daño absorbible.
    // Sólo se gasta la reserva; no hay contador de impactos.
    const conReserva = Number.isFinite(prm.capacidad);
    const reserva = conReserva ? Math.max(0, prm.capacidad) : Infinity;
    absorbido = Math.min(dmg, Math.max(0, prm.reduccion || 0), reserva);
    if (conReserva) prm.capacidad = reserva - absorbido;
    const rota = conReserva && prm.capacidad <= 0;
    if (rota) this.estados.jugador = this.estados.jugador.filter(s => s !== gu);
    const resto = rota || !conReserva ? "" : `; reserva ${prm.capacidad}/${prm.capacidadMax ?? prm.capacidad}`;
    return { absorbido, rota, extra: ` (${nombre} absorbe ${absorbido}${resto})` };
  }

  respuestaEnemigos(out) {
    const p = this.j.player;
    for (const mob of this.combatientes) {
      if (mob.hp <= 0) continue;
      if (p.hp <= 0) break;
      const at = this.estadoDeMob(mob, "atadura");
      if (at) {
        out.push(`   ${at.frase}: ${mob.name} pierde el turno forcejeando.`);
        at.duracion--;
        if (at.duracion <= 0) {
          const lista = (this.estadosEnemigos.get(mob) || []).filter(s => s !== at);
          this.estadosEnemigos.set(mob, lista);
        }
        continue;
      }
      let eMod = { ...mob };
      const tec = mob.tecnica;
      const relojTecnica = this.round;
      const despliegaTecnica = !!(tec && relojTecnica % tec.cada === 0);
      if (despliegaTecnica) {
        if (tec.ataque) eMod.ataque += tec.ataque;
        if (tec.daño) eMod.daño = tec.daño;
        out.push(`   ⚔ ¡${mob.name} usa ${tec.name}!`);
      }
      const debil = this.estadoDeMob(mob, "debil");
      if (debil) eMod.ataque += debil.params.ataque;

      let def = { ...this.ef(), esquiva: this.j.player.esquiva ?? ESQUIVA_INNATA };
      const esc = this.estadoDe("jugador", "esquiva");
      if (esc) def.esquiva += esc.params.bono;
      const postura = this.estadoDe("jugador", "defensa");
      if (postura) def = { ...def, defensa: def.defensa + postura.params.bono };

      const [msg, dmg] = atacar(eMod, def);
      let dmgFinal = dmg, extra = "", avisoGuardia = null;
      if (dmg > 0) {
        const gu = this.estadoDe("jugador", "guardia");
        if (gu) {
          const r = this.absorberGolpe(gu, dmg);
          dmgFinal = dmg - r.absorbido;
          extra = r.extra;
          if (r.rota) avisoGuardia = gu.expira || "Tu protección se disipa.";
        }
      }
      p.hp -= dmgFinal;
      out.push(msg + extra);
      if (avisoGuardia) out.push(`   ${avisoGuardia}`);
      if (despliegaTecnica && dmgFinal > 0 && tec.veneno) {
        const af = this.j.aplicarAfliccion({ tipo:"veneno", ...tec.veneno }, mob.mob_id || mob.name);
        out.push(`   ⚠ ${af.nombre} entra en tus meridianos (${dadoARango(af.daño)}/acción · ${af.duracion} acciones).`);
        const pista = this.j.pistaPrimeraAfliccion();
        if (pista) out.push(pista);
      }
      if (despliegaTecnica && dmgFinal > 0 && tec.quemadura) {
        const af = this.j.aplicarAfliccion({ tipo:"quemadura", ...tec.quemadura }, mob.mob_id || mob.name);
        out.push(`   ⚠ ${af.nombre} se aferra a tu piel (${dadoARango(af.daño)}/acción · ${af.duracion} acciones).`);
        const pista = this.j.pistaPrimeraAfliccion();
        if (pista) out.push(pista);
      }
      if (despliegaTecnica && tec.drenaQi && dmgFinal > 0) {
        const drenado = Math.min(p.qi, tec.drenaQi);
        p.qi -= drenado;
        out.push(`   La técnica arranca ${drenado} qi de tus meridianos.`);
      }
      if (despliegaTecnica && dmgFinal >= 8 && Azar.random() < 0.20) {
        p.heridas_meridianos = Math.min(3, (p.heridas_meridianos || 0) + 1);
        out.push(`   ⚠ El impacto desordena un meridiano. Heridas internas: ${p.heridas_meridianos}/3. Consulta los tratamientos de meridianos.`);
      }
      if (tec && (relojTecnica + 1) % tec.cada === 0 && mob.hp > 0) {
        out.push(`   ⚠ ${mob.name} reúne qi: el próximo turno prepara ${tec.name}.`);
      }
    }
  }

  tick(out) {
    for (const msg of this.j.avanzarAflicciones(1, { combate: true })) out.push(`   ${msg}`);
    const listaJ = this.estados.jugador;
    const vivosJ = [];
    for (const st of listaJ) {
      // La burbuja de absorción se gasta con el daño que absorbe (absorberGolpe), no por rondas.
      if (st.tipo === "atadura" || st.tipo === "guardia") { vivosJ.push(st); continue; }
      st.duracion--;
      if (st.duracion <= 0) out.push(`   ${st.expira || "Un efecto se desvanece."}`);
      else vivosJ.push(st);
    }
    this.estados.jugador = vivosJ;

    // cada combatiente arrastra sus propios estados, aunque ya no sea tu objetivo
    for (const mob of this.combatientes) {
      if (mob.hp <= 0) continue;
      const lista = this.estadosEnemigos.get(mob) || [];
      for (const st of lista) {
        if (st.tipo === "quemadura" || st.tipo === "veneno") {
          const d = tirar(st.params.daño);
          mob.hp -= d;
          out.push(`   ${st.tipo === "veneno" ? "El veneno" : "La quemadura"} muerde a ${mob.name}: ${d} de daño.`);
        }
      }
      const vivos = [];
      for (const st of lista) {
        if (st.tipo === "atadura") { vivos.push(st); continue; }
        st.duracion--;
        if (st.duracion <= 0) out.push(`   ${st.expira || "Un efecto se desvanece."}`);
        else vivos.push(st);
      }
      this.estadosEnemigos.set(mob, vivos);
    }
  }
}
