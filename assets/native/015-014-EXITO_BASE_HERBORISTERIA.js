const EXITO_BASE_HERBORISTERIA = Object.freeze({
    simple: .75, normal: .60, dificil: .40, muy_dificil: .25,
  });
  const BONO_RANGO_HERBORISTERIA = Object.freeze([0, .05, .10]);
  const BONO_PRIMERA_ESPECIE_HERBORISTERIA = 2;
  const BONO_PRIMER_PROCEDIMIENTO_HERBORISTERIA = 1;

  const PLANTAS_ESPIRITUALES = {
    claridad: {
      nombre: "hierba de claridad",
      descripcion: "Hojas alargadas de un verde casi transparente, frías al tacto incluso al mediodía; el aire a su alrededor huele a agua de manantial.",
      pistas: "Las hojas externas están frías y flexibles; el brote central concentra más esencia, pero tarda mucho más en recuperarse.",
      procedimientos: [
        { id:"hojas", item:"hierba_claridad", cantidad:1, dificultad:"simple", metodo:"cortar hojas exteriores", pista: "Las hojas externas están frías y flexibles.", recuperacionExito:3, recuperacionFallo:2, principal:true },
        { id:"brote", item:"hierba_claridad", cantidad:2, dificultad:"normal", metodo:"separar brote central", pista: "El brote central concentra más esencia, pero tarda mucho más en recuperarse.", recuperacionExito:7, recuperacionFallo:9, principal:true },
      ],
    },
    sangre: {
      nombre: "raíz de sangre",
      descripcion: "Raíces gruesas del color de una herida reciente, tibias bajo la tierra removida; un olor metálico se queda pegado a los dedos que las tocan.",
      pistas: "Las raíces laterales pueden podarse sin matar la planta. La corona roja late con más fuerza, pero arrancarla obliga al ejemplar a rehacerse casi desde cero.",
      procedimientos: [
        { id:"lateral", item:"raiz_sangre", cantidad:1, dificultad:"normal", metodo:"podar raíz lateral", pista: "Las raíces laterales pueden podarse sin matar la planta.", recuperacionExito:6, recuperacionFallo:8, principal:true },
        { id:"corona", item:"raiz_sangre", cantidad:2, dificultad:"dificil", metodo:"extraer corona de sangre", pista: "La corona roja late con más fuerza, pero arrancarla obliga al ejemplar a rehacerse casi desde cero.", recuperacionExito:16, recuperacionFallo:16, destructivo:true, principal:false },
      ],
    },
    lunar: {
      nombre: "musgo lunar",
      descripcion: "Un musgo pálido que retiene una luz propia, apenas perceptible salvo en la oscuridad; húmedo y frío como piedra de cueva.",
      pistas: "La capa superficial se desprende en hebras. Debajo hay una colonia pálida más densa que almacena mucho más sedimento, pero recuperarla lleva tiempo.",
      procedimientos: [
        { id:"superficie", item:"musgo_lunar", cantidad:1, dificultad:"normal", metodo:"retirar capa superficial", pista: "La capa superficial se desprende en hebras.", recuperacionExito:4, recuperacionFallo:5, principal:true },
        { id:"profundo", item:"musgo_lunar", cantidad:3, dificultad:"dificil", metodo:"separar capa profunda", pista: "Debajo hay una colonia pálida más densa que almacena mucho más sedimento, pero recuperarla lleva tiempo.", recuperacionExito:10, recuperacionFallo:12, principal:true },
      ],
    },
    ceniza: {
      nombre: "flor de ceniza",
      descripcion: "Pétalos grises que parecen ceniza fría pero arden apenas al roce, con un tenue aroma a humo recién apagado.",
      pistas: "Los pétalos pueden retirarse sin cortar el tallo. El cáliz concentra el calor de la planta, pero arrancarlo mata la flor hasta la siguiente brotación.",
      procedimientos: [
        { id:"petalos", item:"petalo_ceniza", cantidad:1, dificultad:"normal", metodo:"recoger pétalos de ceniza", pista: "Los pétalos pueden retirarse sin cortar el tallo.", recuperacionExito:5, recuperacionFallo:5, principal:true },
        { id:"caliz", item:"caliz_ceniza", cantidad:1, dificultad:"dificil", metodo:"extraer cáliz térmico", pista: "El cáliz concentra el calor de la planta, pero arrancarlo mata la flor hasta la siguiente brotación.", recuperacionExito:14, recuperacionFallo:14, destructivo:true, principal:false },
      ],
    },
    niebla: {
      nombre: "orquídea de niebla",
      descripcion: "Una orquídea translúcida cubierta de gotas que nunca terminan de caer; huele a piedra mojada y a nada más.",
      pistas: "El rocío puede recogerse sin herir la planta. La flor completa contiene mucha más esencia, pero no vuelve a crecer durante largo tiempo.",
      procedimientos: [
        { id:"rocio", item:"rocio_niebla", cantidad:1, dificultad:"normal", metodo:"recoger rocío de niebla", pista: "El rocío puede recogerse sin herir la planta.", recuperacionExito:4, recuperacionFallo:3, principal:true },
        { id:"flor", item:"orquidea_niebla", cantidad:1, dificultad:"dificil", metodo:"cortar flor completa", pista: "La flor completa contiene mucha más esencia, pero no vuelve a crecer durante largo tiempo.", recuperacionExito:16, recuperacionFallo:16, destructivo:true, principal:false },
      ],
    },
    jade: {
      nombre: "enredadera de jade",
      descripcion: "Zarcillos de un verde profundo, lustrosos como piedra pulida, que se aferran a la roca sin dejarse arrancar del todo.",
      pistas: "Los zarcillos flexibles se regeneran rápido. Los nudos pegados a la piedra contienen fibras más densas y tardan el doble en recomponerse.",
      procedimientos: [
        { id:"zarcillo", item:"fibra_jade", cantidad:1, dificultad:"simple", metodo:"cortar zarcillo flexible", pista: "Los zarcillos flexibles se regeneran rápido.", recuperacionExito:4, recuperacionFallo:5, principal:true },
        { id:"nudo", item:"fibra_jade", cantidad:2, dificultad:"normal", metodo:"separar nudo de vena", pista: "Los nudos pegados a la piedra contienen fibras más densas y tardan el doble en recomponerse.", recuperacionExito:8, recuperacionFallo:10, principal:true },
      ],
    },
    medula: {
      nombre: "hongo de médula",
      descripcion: "Un hongo pálido y esponjoso que crece pegado a una raíz ajena, con un olor dulzón a tierra removida.",
      pistas: "Los filamentos exteriores vuelven a crecer sobre la raíz huésped. El corazón esponjoso contiene la reserva nutritiva y su extracción colapsa el cuerpo fructífero.",
      procedimientos: [
        { id:"filamentos", item:"hongo_medula", cantidad:1, dificultad:"normal", metodo:"cortar filamentos de médula", pista: "Los filamentos exteriores vuelven a crecer sobre la raíz huésped.", recuperacionExito:5, recuperacionFallo:6, principal:true },
        { id:"corazon", item:"medula_fungica", cantidad:1, dificultad:"dificil", metodo:"extraer corazón fúngico", pista: "El corazón esponjoso contiene la reserva nutritiva y su extracción colapsa el cuerpo fructífero.", recuperacionExito:12, recuperacionFallo:14, destructivo:true, principal:false },
      ],
    },
    trueno: {
      nombre: "hierba del trueno",
      descripcion: "Tallos oscuros que chisporrotean apenas al rozarlos, con un olor a aire después de la tormenta.",
      pistas: "Las vainas exteriores descargan parte de la tensión sin matar el tallo. El racimo interior concentra las semillas, pero abrirlo obliga a la planta a reiniciar su ciclo.",
      procedimientos: [
        { id:"vaina", item:"semilla_trueno", cantidad:1, dificultad:"dificil", metodo:"cosechar vaina cargada", pista: "Las vainas exteriores descargan parte de la tensión sin matar el tallo.", recuperacionExito:7, recuperacionFallo:8, principal:true },
        { id:"racimo", item:"semilla_trueno", cantidad:2, dificultad:"muy_dificil", metodo:"abrir racimo fulgurante", pista: "El racimo interior concentra las semillas, pero abrirlo obliga a la planta a reiniciar su ciclo.", recuperacionExito:14, recuperacionFallo:16, destructivo:true, principal:false },
      ],
    },
  };

  const NODOS_HERBORISTERIA = {
  "claridad_bambu_1": {
    "especie": "claridad",
    "sala": "bosque_cauce_oculto"
  },
  "claridad_bambu_2": {
    "especie": "claridad",
    "sala": "bosque_claro_raices"
  },
  "claridad_acantilado": {
    "especie": "claridad",
    "sala": "bosque_mirador_alto"
  },
  "sangre_bambu": {
    "especie": "sangre",
    "sala": "bosque_cauce_oculto"
  },
  "sangre_huerto": {
    "especie": "sangre",
    "sala": null,
    "pendiente": "P06"
  },
  "jade_huerto": {
    "especie": "jade",
    "sala": "bosque_cauce_oculto"
  },
  "ceniza_quebrada": {
    "especie": "ceniza",
    "sala": "desvio_termal"
  },
  "medula_cueva": {
    "especie": "medula",
    "sala": "sima_resonante"
  },
  "lunar_sumidero": {
    "especie": "lunar",
    "sala": "aguas_terraza_humeda"
  },
  "lunar_jardin": {
    "especie": "lunar",
    "sala": "aguas_manantial_partido"
  },
  "niebla_galeria": {
    "especie": "niebla",
    "sala": "bosque_mirador_alto"
  },
  "trueno_nido": {
    "especie": "trueno",
    "sala": "alturas_aguja_piedra"
  }
};

  // Todo material que se obtenga cortando, podando o extrayendo una planta
  // espiritual. La línea "Ves:" enumera objetos del mundo (equipo, herramientas,
  // hallazgos); una planta viva NO es un objeto suelto: se anuncia aparte, en
  // "Plantas:", porque se recolecta con RECOLECTAR y no se puede TOMAR.
  const MATERIALES_RECOLECTABLES = Object.freeze(new Set(
    Object.values(PLANTAS_ESPIRITUALES).flatMap(p => p.procedimientos.map(pr => pr.item))
  ));
