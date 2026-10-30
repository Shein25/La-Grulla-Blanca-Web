const MOBS = {
muneco_practica: { name: "muñeco articulado de práctica", corto: "muñeco", hp: 14, ataque: 1, defensa: 9, daño: "1d3", qi: 0,
             desc: "Un armazón de madera, cuerda y sacos de arena. Sus brazos vuelven al centro con cada golpe; fue construido para enseñar errores sin tener que enterrarlos.",
             loot: [], practica: true },
rata_qi: { name: "rata de qi", corto: "rata", hp: 9, ataque: 1, defensa: 10, daño: "1d4", qi: 2,
             desc: "Ratas comunes que aprendieron a roer el aire tanto como el grano: sus dientes brillan con un residuo de qi robado a las reservas de la despensa.",
             loot: [{ item: "pocion", prob: 0.2 }] },
serpiente_qi: { name: "serpiente de qi verdosa", corto: "serpiente", hp: 13, ataque: 2, defensa: 11, daño: "1d4+1", qi: 3,
             elemento: "agua",
             desc: "Se enrosca cerca de fuentes de agua espiritual, con escamas del mismo verde que el qi que bebe. Su veneno no mata: entorpece la circulación de quien muerde.",
             tecnica: { name: "Colmillos Venenosos", cada: 3, veneno: { daño: "1d2", turnos: 3, familia: "jade", grado: 1, nombre: "Veneno de Jade I" } },
             loot: [{ item: "pildora_consolidacion", prob: 0.3 }] },
lobo_espiritual: { name: "lobo espiritual de tres colas", corto: "lobo", hp: 18, ataque: 3, defensa: 11, daño: "1d6+1", qi: 5,
             desc: "Caza como si fuera tres animales a la vez: sus tres colas se mueven de forma independiente, cada una vigilando una dirección distinta del bosque.",
             tecnica: { name: "Emboscada de las Tres Colas", cada: 3, ataque: 3, daño: "1d6+3" },
             loot: [{ item: "pocion", prob: 0.3 }, { item: "amuleto_diente", prob: 0.25 }] },
eco_caido: { name: "Eco del Caído", corto: "eco", hp: 34, ataque: 4, defensa: 12, daño: "1d8+2", qi: 11, unico: true,
             desc: "Un resentimiento sin cuerpo, atado al campo de entrenamiento desde hace demasiado tiempo. No es un espíritu vengativo: es la costumbre de alguien que practicó ahí hasta el final y nunca terminó de irse.",
             loot: [{ item: "bolsa_piedras", prob: 1 }] },
pez_lunar: { name: "pez de luna sin ojos", corto: "pez", hp: 26, ataque: 3, defensa: 12, daño: "1d6+2", qi: 7,
             elemento: "agua",
             desc: "Nada en las aguas del sumidero desde antes de que nadie recuerde por qué se abrió ese pozo. Perdió los ojos hace generaciones; ahora caza siguiendo el pulso del qi ajeno.",
             tecnica: { name: "Mordida de Corriente", cada: 3, ataque: 2, daño: "1d6+4" },
             loot: [{ item: "pocion", prob: 0.35 }] },
sombra_ahogada: { name: "sombra ahogada del estanque", corto: "sombra", hp: 42, ataque: 4, defensa: 13, daño: "2d6", qi: 13, unico: true,
             elemento: "agua",
             desc: "Lo que queda de quienes se ahogaron cuando los fundadores desviaron el manantial de la montaña. No tiene rostro, pero conserva memoria de cada gota que le costó su vida al valle.",
             tecnica: { name: "Velo de Ahogo", cada: 3, veneno: { daño: "1d4", turnos: 2, familia: "marea", grado: 2, nombre: "Ahogo de Marea II" } },
             loot: [ { item: "manual_espejo", prob: 1 }] },
centinela_pluma: { name: "centinela de plumas petrificadas", corto: "centinela", hp: 48, ataque: 5, defensa: 14, daño: "2d6+2", qi: 15, unico: true,
             elemento: "metal",
             desc: "Plumas petrificadas que los fundadores dejaron como guardia sobre la Grulla Primera. Cada golpe suyo suena a piedra, no a ala.",
             tecnica: { name: "Aleteo de Cuchillas", cada: 3, ataque: 3, daño: "2d6+4" },
             loot: [ { item: "bolsa_piedras", prob: 1 }] },
devorador_niebla: { name: "devorador de niebla", corto: "devorador", hp: 38, ataque: 4, defensa: 13, daño: "2d6", qi: 11,
             elemento: "viento",
             desc: "Un cuerpo hecho casi enteramente de niebla condensada que se alimenta del qi disperso filtrado por las grietas de la galería.",
             tecnica: { name: "Exhalación Vacía", cada: 3, ataque: 2, daño: "1d8+4" },
             loot: [{ item: "pocion", prob: 0.45 }, { item: "polvo_nube", prob: 0.5 }, { item: "pildora_consolidacion", prob: 0.25 }] },
avispa_jade: { name: "avispa de jade dentado", corto: "avispa", hp: 10, ataque: 2, defensa: 11, daño: "1d4", qi: 2,
             elemento: "viento",
             desc: "Diminuta y translúcida como el jade que le da nombre. Su aguijón no es letal, pero deja el brazo dormido el tiempo suficiente como para perder un asalto entero.",
             tecnica: { name: "Picadura de Esmeralda", cada: 4, veneno: { daño: "1d2", turnos: 2, familia: "jade", grado: 1, nombre: "Veneno de Jade I" } },
             loot: [] },
mono_pildoras: { name: "macaco ladrón de píldoras", corto: "macaco", hp: 17, ataque: 3, defensa: 11, daño: "1d6", qi: 4,
             desc: "Aprendió a distinguir el olor de una píldora de consolidación entre cien frascos. Roba dantian tanto como bolsillos, y disfruta ambas cosas por igual.",
             tecnica: { name: "Manotazo al Dantian", cada: 3, ataque: 2, daño: "1d6+2", drenaQi: 5 },
             loot: [{ item: "pildora_consolidacion", prob: 0.35 }, { item: "pocion", prob: 0.25 }] },
sapo_ceniza: { name: "sapo de ceniza caliente", corto: "sapo", hp: 18, ataque: 2, defensa: 12, daño: "1d6+1", qi: 5,
             elemento: "fuego",
             desc: "Vive entre las brasas frías de hornos abandonados; su piel conserva el calor mucho después de que el fuego real se apagó.",
             tecnica: { name: "Nube de Hollín", cada: 3, ataque: 2, daño: "1d6+3", quemadura: { daño: "1d2", turnos: 3, familia: "ceniza", grado: 1, nombre: "Quemadura de Ceniza I" } },
             loot: [] },
sapo_caldera: { name: "Sapo Caldera de Tres Gargantas", corto: "caldera", hp: 34, ataque: 4, defensa: 13, daño: "2d6", qi: 11, unico: true,
             elemento: "fuego",
             desc: "Tres gargantas separadas respiran turnos distintos del mismo fuego interno. Su piel de ceniza guarda cien puntos encendidos, como un manual que nunca necesitó tinta.",
             tecnica: { name: "Eructo del Horno Hundido", cada: 3, ataque: 2, daño: "2d6+4", quemadura: { daño: "1d3", turnos: 3, familia: "ceniza", grado: 1, nombre: "Quemadura de Ceniza I" } },
             loot: [{ item: "manual_circulo_ascuas", prob: 1 }, { item: "pocion_refinada", prob: 1 }] },
escarabajo_hierro: { name: "escarabajo de hierro espiritual", corto: "escarabajo", hp: 21, ataque: 2, defensa: 15, daño: "1d6+1", qi: 5,
             elemento: "metal",
             desc: "Caparazón denso, casi metálico, templado durante generaciones cerca de las vetas de mineral de la mina. Embiste antes de pensarlo dos veces.",
             tecnica: { name: "Carga de Caparazón", cada: 4, ataque: 4, daño: "1d8+3" },
             loot: [{ item: "pildora_consolidacion", prob: 0.2 }] },
rey_escarabajo: { name: "Rey Escarabajo de la Veta Negra", corto: "rey", hp: 38, ataque: 4, defensa: 16, daño: "2d6", qi: 12, unico: true,
             elemento: "metal",
             desc: "El mayor de su especie. Sus placas se ensamblan en un diagrama defensivo que la mina parece haberle enseñado al revés, línea por línea.",
             tecnica: { name: "Mandíbula de Yunque", cada: 3, ataque: 3, daño: "2d8+2" },
             loot: [{ item: "manual_lluvia_filos", prob: 1 }] },
anguila_estelar: { name: "anguila de constelación rota", corto: "anguila", hp: 30, ataque: 4, defensa: 13, daño: "1d8+2", qi: 8,
             elemento: "agua",
             desc: "Una línea azul le recorre el cuerpo como un meridiano fuera de sitio. Nadó tanto tiempo entre sedimento lunar que el error se volvió parte de su anatomía.",
             tecnica: { name: "Mordida del Meridiano Azul", cada: 3, ataque: 2, daño: "1d8+4", drenaQi: 7 },
             loot: [{ item: "pildora_purificacion", prob: 0.15 }] },
guardian_coral: { name: "guardián de coral memorioso", corto: "guardián", hp: 52, ataque: 5, defensa: 15, daño: "2d6+1", qi: 16, unico: true,
             elemento: "agua",
             desc: "Coral que repitió durante generaciones el movimiento de una marea que ya no existe, hasta que el instinto se convirtió en técnica. Recuerda nombres que nadie más pronuncia.",
             tecnica: { name: "Marea de los Nombres Hundidos", cada: 3, ataque: 3, daño: "2d8+3", drenaQi: 8 },
             loot: [{ item: "manual_marea_circular", prob: 1 }] },
halcon_tormenta: { name: "halcón de tormenta joven", corto: "halcón", hp: 31, ataque: 5, defensa: 14, daño: "2d6", qi: 9,
             elemento: "viento",
             desc: "Caza en las corrientes altas de la montaña, donde el viento anuncia su llegada antes que el sonido de sus alas.",
             tecnica: { name: "Picado del Relámpago", cada: 3, ataque: 3, daño: "2d6+4" },
             loot: [{ item: "pluma_tempestad", prob: 0.6 }, { item: "polvo_nube", prob: 0.35 }] },
mantis_nube: { name: "mantis de nube cortante", corto: "mantis", hp: 46, ataque: 6, defensa: 15, daño: "2d6+2", qi: 14, unico: true,
             elemento: "viento",
             desc: "Sus cuchillas cortan el aire con la misma precisión con la que alguna vez cortaron una técnica ajena, hasta memorizarla en el propio cuerpo.",
             tecnica: { name: "Tijera del Horizonte", cada: 3, ataque: 3, daño: "2d8+3" },
             loot: [{ item: "manual_tijera_vendaval", prob: 1 }, { item: "elixir_tempestad", prob: 1 }, { item: "pluma_tempestad", prob: 1 }] }
};

  // ==========================================================================
  //  CONTRATO DE DISEÑO · EXTRACCIÓN ESPIRITUAL (Etapa 2)
  //  ------------------------------------------------------------------------
  //  Toda criatura futura que admita Examen debe añadirse a HALLAZGOS_CADAVER.
  //  Cada procedimiento DEBE declarar:
  //    id          clave estable y única dentro de la especie; nunca usar el
  //                texto visible como identificador persistente.
  //    item        material anatómico existente en ITEMS.
  //    cantidad    unidades obtenidas si el procedimiento tiene éxito.
  //    dificultad  simple | normal | dificil | muy_dificil.
  //    metodo      texto/orden visible para el jugador.
  //  Reglas obligatorias:
  //  · EXAMINAR un cadáver sólo revela información y aumenta familiaridad: 0 XP.
  //  · Cada procedimiento puede intentarse una sola vez por cadáver. Fallar
  //    arruina ESA oportunidad, no concede material y da 0 XP.
  //  · Éxito base por dificultad: 75% / 60% / 40% / 25%. Rango formal aporta
  //    +0 / +5 / +10 puntos porcentuales, con tope global de 90%.
  //  · Sólo el éxito profesional concede XP: práctica por TRAMOS_APRENDIZAJE
  //    +2 la primera vez que se obtiene algo de la especie +1 la primera vez
  //    que se completa ese procedimiento. Bonos únicos, nunca repetibles.
  //  · Botín automático de combate, objetos del suelo y recompensas NO cuentan
  //    como extracción y nunca deben llamar registrarMaterialExamen().
  //  · Los materiales de cadáver deben ser anatómicos/espirituales propios de
  //    la criatura. No usar plantas como sustitutos narrativos de órganos.
  //  · Evitar "núcleo interno" en este tramo: esa categoría queda reservada
  //    para progresión posterior. Usar condensados, glándulas, membranas, etc.
  // ==========================================================================
  const EXITO_BASE_EXAMEN = Object.freeze({
    simple: .75, normal: .60, dificil: .40, muy_dificil: .25,
  });
  const BONO_RANGO_EXAMEN = Object.freeze([0, .05, .10]);
  const BONO_PRIMERA_ESPECIE_EXAMEN = 2;
  const BONO_PRIMER_PROCEDIMIENTO_EXAMEN = 1;

  const HALLAZGOS_CADAVER = {
    rata_qi: {
      descripcion: "El pelaje gris sigue erizado, como si el qi robado no hubiera terminado de asentarse.",
      pistas: "El qi robado no está en los dientes: se ha acumulado en una pequeña bolsa grasa junto al estómago.",
      hallazgos: [
        { id: "bolsa_grasa", item: "grasa_qi_roida", cantidad: 1, dificultad: "simple", metodo: "separar bolsa de qi", pista: "El qi robado no está en los dientes: se ha acumulado en una pequeña bolsa grasa junto al estómago." },
      ],
    },
    serpiente_qi: {
      descripcion: "Escamas verdosas con un brillo húmedo que no se seca ni después de muerta.",
      pistas: "La toxina viaja por una glándula verde y por una membrana de canales finísimos que evita que el propio veneno alcance la carne.",
      hallazgos: [
        { id: "glandula_jade", item: "aguijon_jade", cantidad: 1, dificultad: "normal", metodo: "extraer glándula de jade", pista: "La toxina viaja por una glándula verde antes de llegar al colmillo." },
        { id: "membrana_meridiana", item: "membrana_serpentina", cantidad: 1, dificultad: "dificil", metodo: "separar membrana meridiana", pista: "Una membrana de canales finísimos evita que el propio veneno alcance la carne de la serpiente." },
      ],
    },
    lobo_espiritual: {
      descripcion: "Tres colas rígidas, erizadas como si el viento aún soplara sobre ellas.",
      pistas: "Las tres colas comparten tensión por una red de tendones; la médula cercana conserva una corriente de viento incluso después de la muerte.",
      hallazgos: [
        { id: "medula_viento", item: "medula_viento", cantidad: 1, dificultad: "normal", metodo: "extraer médula de viento", pista: "La médula cercana a la cola conserva una corriente de viento incluso después de la muerte." },
        { id: "tendon_colas", item: "tendon_tres_colas", cantidad: 1, dificultad: "dificil", metodo: "separar tendón de las tres colas", pista: "Las tres colas comparten tensión gracias a una red de tendones." },
      ],
    },
    avispa_jade: {
      descripcion: "El caparazón verde jade conserva el filo intacto de sus mandíbulas.",
      pistas: "El aguijón está conectado a una cámara abdominal que regula la toxina antes de cada picadura.",
      hallazgos: [
        { id: "aguijon", item: "aguijon_jade", cantidad: 1, dificultad: "normal", metodo: "retirar aguijón de jade", pista: "El aguijón está conectado a una cámara abdominal que regula la toxina antes de cada picadura." },
        { id: "camara", item: "camara_jade", cantidad: 1, dificultad: "dificil", metodo: "abrir cámara de jade", pista: "La cámara abdominal regula la toxina que alimenta al aguijón." },
      ],
    },
    mono_pildoras: {
      descripcion: "Las mejillas siguen hinchadas, con restos de píldoras ajenas a medio tragar.",
      pistas: "Años de tragar medicinas ajenas endurecieron una vesícula cerca del hígado; los residuos siguen separados en capas.",
      hallazgos: [
        { id: "vesicula", item: "vesicula_medicinal", cantidad: 1, dificultad: "normal", metodo: "aislar vesícula medicinal", pista: "Años de tragar medicinas ajenas endurecieron una vesícula cerca del hígado." },
      ],
    },
    sapo_ceniza: {
      descripcion: "La piel gris todavía humea, como si no hubiera terminado de enfriarse.",
      pistas: "Dos estructuras sobreviven al calor: una glándula oscura que acumula temperatura y un saco respiratorio saturado de hollín.",
      hallazgos: [
        { id: "glandula_termica", item: "glandula_termica", cantidad: 1, dificultad: "normal", metodo: "extraer glándula térmica", pista: "Una glándula oscura acumula temperatura y sobrevive al calor mucho después de la muerte." },
        { id: "saco_hollin", item: "saco_hollin", cantidad: 1, dificultad: "dificil", metodo: "separar saco de hollín", pista: "Un saco respiratorio saturado de hollín sigue formando remolinos diminutos." },
      ],
    },
    escarabajo_hierro: {
      descripcion: "Un caparazón oscuro y metálico que suena a piedra al golpearlo.",
      pistas: "Bajo la coraza rígida hay una placa aprovechable y, todavía más adentro, una membrana flexible que distribuye la tensión de cada impacto.",
      hallazgos: [
        { id: "placa", item: "caparazon_hierro", cantidad: 1, dificultad: "normal", metodo: "desprender placa férrea", pista: "Bajo la coraza rígida hay una placa aprovechable." },
        { id: "membrana", item: "membrana_ferrea", cantidad: 1, dificultad: "dificil", metodo: "separar membrana férrea", pista: "Todavía más adentro hay una membrana flexible que distribuye la tensión de cada impacto." },
      ],
    },
    pez_lunar: {
      descripcion: "Escamas pálidas y translúcidas, sin rastro alguno de ojos.",
      pistas: "La cavidad branquial guarda un fluido pálido; sus filamentos separan agua y sedimento espiritual sin mezclarlos.",
      hallazgos: [
        { id: "fluido", item: "fluido_lunar", cantidad: 1, dificultad: "normal", metodo: "recoger fluido lunar", pista: "La cavidad branquial guarda un fluido pálido." },
        { id: "branquia", item: "branquia_lunar", cantidad: 1, dificultad: "dificil", metodo: "separar filamento branquial", pista: "Un filamento branquial separa agua y sedimento espiritual sin mezclarlos." },
      ],
    },
    anguila_estelar: {
      descripcion: "Una línea azul recorre su piel oscura como una grieta de luz apagada.",
      pistas: "La línea azul que recorre su carne es un conducto verdadero; junto a él hay un saco donde se acumula la descarga que no pudo liberar.",
      hallazgos: [
        { id: "conducto", item: "conducto_estelar", cantidad: 1, dificultad: "normal", metodo: "extraer conducto estelar", pista: "La línea azul que recorre su carne es un conducto verdadero." },
        { id: "saco_residual", item: "saco_residual_estelar", cantidad: 1, dificultad: "dificil", metodo: "sellar saco residual", pista: "Junto al conducto hay un saco donde se acumula la descarga que no pudo liberar." },
      ],
    },
    halcon_tormenta: {
      descripcion: "Plumas oscuras que todavía chisporrotean con una estática residual.",
      pistas: "Las plumas superficiales sólo descargan el exceso. La energía útil corre por fibras profundas del ala y por una cámara pulmonar comprimida.",
      hallazgos: [
        { id: "fibra_ala", item: "fibra_tempestad", cantidad: 1, dificultad: "normal", metodo: "extraer fibra de tempestad", pista: "Las plumas superficiales sólo descargan el exceso; la energía útil corre por fibras profundas del ala." },
        { id: "saco_pulmonar", item: "saco_pulmonar_tormenta", cantidad: 1, dificultad: "dificil", metodo: "aislar saco pulmonar", pista: "La energía útil también se comprime en una cámara pulmonar profunda." },
      ],
    },
    devorador_niebla: {
      descripcion: "Un cuerpo casi translúcido que se deshace despacio en jirones de niebla.",
      pistas: "Su anatomía es casi una mentira: una membrana contiene la niebla y unos pocos cristales húmedos hacen de puntos de anclaje.",
      hallazgos: [
        { id: "bolsa", item: "bolsa_niebla", cantidad: 1, dificultad: "normal", metodo: "sellar bolsa de niebla", pista: "Una membrana casi invisible contiene la niebla del cuerpo del devorador." },
        { id: "sedimento", item: "sedimento_niebla", cantidad: 1, dificultad: "muy_dificil", metodo: "separar sedimento de niebla", pista: "Unos pocos cristales húmedos hacen de puntos de anclaje dentro de la niebla." },
      ],
    },
    sapo_caldera: {
      descripcion: "Tres gargantas abultadas, todavía calientes al tacto como piedra recién sacada del fuego.",
      pistas: "El horno de sus tres gargantas está rodeado por glándulas térmicas hipertrofiadas y una brasa de tejido mineralizado que no llega a ser un núcleo.",
      hallazgos: [
        { id: "glandulas", item: "glandula_termica", cantidad: 2, dificultad: "dificil", metodo: "vaciar glándulas del horno", pista: "El horno de las tres gargantas está rodeado por glándulas térmicas hipertrofiadas." },
        { id: "brasa", item: "brasa_visceral", cantidad: 1, dificultad: "muy_dificil", metodo: "separar brasa visceral", pista: "Cerca del horno hay una brasa de tejido mineralizado que no llega a ser un núcleo." },
      ],
    },
    rey_escarabajo: {
      descripcion: "Un caparazón negro veteado de metal, más grueso que el de cualquier otro escarabajo.",
      pistas: "Las placas de la veta negra protegen una masa torácica compactada por presión y qi metálico; no es un núcleo interno.",
      hallazgos: [
        { id: "placas_negras", item: "caparazon_hierro", cantidad: 2, dificultad: "dificil", metodo: "partir placas de veta negra", pista: "Las placas de la veta negra protegen una masa torácica compactada por presión y qi metálico." },
        { id: "condensado", item: "condensado_toracico", cantidad: 1, dificultad: "muy_dificil", metodo: "extraer condensado torácico", pista: "Esa masa torácica no es un núcleo interno, sino un condensado que conserva presión y qi." },
      ],
    },
    mantis_nube: {
      descripcion: "Hojas afiladas como cuchillas en lugar de patas delanteras, manchadas de un corte limpio.",
      pistas: "Las articulaciones transmiten el corte a través de un filamento dorsal; cerca de las alas queda una fibra cargada de viento comprimido.",
      hallazgos: [
        { id: "filamento", item: "filamento_cortante", cantidad: 1, dificultad: "dificil", metodo: "separar filamento cortante", pista: "Las articulaciones de las cuchillas transmiten el corte a través de un filamento dorsal." },
        { id: "fibra", item: "fibra_tempestad", cantidad: 1, dificultad: "muy_dificil", metodo: "extraer fibra dorsal de tempestad", pista: "Cerca de las alas queda una fibra cargada de viento comprimido." },
      ],
    },
    guardian_coral: {
      descripcion: "Un cuerpo cubierto de coral petrificado, con grietas que parecen guardar recuerdos antiguos.",
      pistas: "El coral no tiene órganos animales, pero ciertas láminas conservan memoria del movimiento espiritual que repetía.",
      hallazgos: [
        { id: "lamina", item: "lamina_coral_memoriosa", cantidad: 1, dificultad: "dificil", metodo: "separar lámina memoriosa", pista: "Ciertas láminas de coral conservan memoria del movimiento espiritual que la criatura repetía." },
      ],
    },
    centinela_pluma: {
      descripcion: "Plumas endurecidas hasta volverse piedra, todavía dispuestas como si vigilaran.",
      pistas: "Bajo las plumas endurecidas permanece una fibra tensada por la formación que mantenía al centinela en pie.",
      hallazgos: [
        { id: "filamento_sello", item: "filamento_pluma_sello", cantidad: 1, dificultad: "dificil", metodo: "retirar filamento del sello", pista: "Bajo las plumas endurecidas permanece una fibra tensada por la formación defensiva." },
      ],
    },
  };
