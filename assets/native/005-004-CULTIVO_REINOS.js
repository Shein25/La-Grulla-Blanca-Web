const CULTIVO_REINOS = {
  LianQi: {
    id: "LianQi", orden: 1, arco: 1, jugable: true,
    nombreArco: "Arco I · Refinamiento de Qi",
    nombreLargo: "LianQi · Refinamiento de Qi",
    ideaCentral: "Aprender a percibir, circular, contener y refinar qi",
    destinoArco: "Establecer la Fundación · ZhuJi",
    etapas: [
      { n: 1, nombre: "Percepción",    vasoQi: VASO_ETAPA[1], funcion: "Existe el qi y puedo percibirlo." },
      { n: 2, nombre: "Circulación",   vasoQi: VASO_ETAPA[2], funcion: "Puedo hacerlo circular." },
      { n: 3, nombre: "Consolidación", vasoQi: VASO_ETAPA[3], funcion: "Mi cuerpo puede contenerlo." },
      { n: 4, nombre: "Refinamiento",  vasoQi: VASO_ETAPA[4], funcion: "Puedo refinarlo." },
    ],
    // "nombre" es puramente descriptivo/para presentación. Las condiciones
    // reales de avance NO viven acá como strings — viven en helpers reales
    // (puedeAlcanzarGranPerfeccion(p), puedeBuscarIluminacion(p),
    // puedeIniciarTribulacion(p), definidos junto a compruebaPuerta() /
    // progresoFundacion()). Esto evita que se lea "requiere"/"habilitaCuando"
    // como un motor genérico de reglas e induzca a programar lógica alrededor
    // de esas strings.
    granPerfeccion: { nombre: "LianQi · Gran Perfección" },
    iluminacion:    { nombre: "Iluminación" },
    tribulacion:    { nombre: "Tribulación del Corazón" },
    breakthrough: {
      nombre: "Establecimiento de la Fundación",
      // Los requisitos reales (umbral de comprensión, atajo de píldora, etc.)
      // NO se repiten acá: siempre se consultan a progresoFundacion() /
      // compruebaPuerta(), que ya son la fuente de verdad de esa regla.
    },
    siguienteReino: "ZhuJi",
    // siguienteReino vive UNA sola vez, a nivel de reino. No repetir dentro
    // de "breakthrough": CULTIVO_REINOS.LianQi.siguienteReino es la única
    // referencia válida.
  },

  ZhuJi: {
    id: "ZhuJi", orden: 2, arco: 2, jugable: false, // esqueleto de datos, SIN mecánica jugable
    nombreArco: "Arco II · Establecimiento de la Fundación",
    nombreLargo: "ZhuJi · Establecimiento de la Fundación",
    ideaCentral: "Construir y fortalecer una base espiritual estable",
    destinoArco: "Condensar el Núcleo Dorado · Jindan",
    etapas: [],
    // Nombres provisionales de las futuras etapas del Arco 2, SOLO para que
    // el historial/mapa de arcos pueda nombrarlas. El sufijo "Previstas" es
    // intencional: no son mecánica activa, no llevan vasoQi ni requisitos.
    etapasPrevistas: ["Fundación Inicial", "Nutrición", "Estabilización", "Fundación Profunda"],
    calidadesFundacion: ["Agrietada", "Estable", "Impecable", "Celestial"], // ya existentes, no renombrar
    siguienteReino: "Jindan",
  },

  Jindan:   { id: "Jindan",   orden: 3, arco: 3, jugable: false, nombreArco: "Arco III · Núcleo Dorado",              nombreLargo: "Jindan · Núcleo Dorado",                 siguienteReino: "Yuanying" },
  Yuanying: { id: "Yuanying", orden: 4, arco: 4, jugable: false, nombreArco: "Arco IV · Alma Naciente",               nombreLargo: "Yuanying · Alma Naciente",               siguienteReino: "Huashen" },
  Huashen:  { id: "Huashen",  orden: 5, arco: 5, jugable: false, nombreArco: "Arco V · Transformación del Espíritu",  nombreLargo: "Huashen · Transformación del Espíritu",  siguienteReino: "Lianxu" },
  Lianxu:   { id: "Lianxu",   orden: 6, arco: 6, jugable: false, nombreArco: "Arco VI · Refinamiento del Vacío",      nombreLargo: "Lianxu · Refinamiento del Vacío",        siguienteReino: "Heti" },
  Heti:     { id: "Heti",     orden: 7, arco: 7, jugable: false, nombreArco: "Arco VII · Unión",                      nombreLargo: "Heti · Unión",                           siguienteReino: "Dacheng" },
  Dacheng:  { id: "Dacheng",  orden: 8, arco: 8, jugable: false, nombreArco: "Arco VIII · Gran Realización",          nombreLargo: "Dacheng · Gran Realización",             siguienteReino: null },
};

// ---------- helpers de rango de reino ----------
// Reemplazan las comparaciones directas p.reino === "X". rangoDe() devuelve 0
// para un reino desconocido, de modo que reinoAlMenos() nunca lance con saves
// corruptos: simplemente responde que no llega.
function rangoDe(reinoId) { return CULTIVO_REINOS[reinoId]?.orden ?? 0; }
function reinoAlMenos(p, reinoId) { return rangoDe(p?.reino) >= rangoDe(reinoId); }
function reinoExacto(p, reinoId) { return p?.reino === reinoId; }
function etapaInfo(p) { return CULTIVO_REINOS[p?.reino]?.etapas?.[p?.etapa - 1] ?? null; }
function arcoActual(p) { return CULTIVO_REINOS[p?.reino]?.arco ?? 1; }
// Total de etapas jugables del reino. Sustituye a los "/4" hardcodeados en los
// textos de interfaz. Devuelve 0 en reinos sin mecánica (ZhuJi y posteriores),
// por eso quien lo use para texto debe estar ya dentro de una rama de reino
// jugable (ver reinoExacto(p, "LianQi") en las plantillas de etapa).
function totalEtapas(reinoId) { return CULTIVO_REINOS[reinoId]?.etapas?.length ?? 0; }

// Condiciones reales de avance del final de LianQi. Son la ÚNICA fuente de
// verdad: los campos `nombre` de CULTIVO_REINOS.LianQi.granPerfeccion /
// iluminacion / tribulacion son descriptivos y nunca se interpretan como regla.
function puedeAlcanzarGranPerfeccion(p) {
  return !!p && p.reino === "LianQi" && p.etapa === 4 && p.qi >= VASO_ETAPA[4] && !p.granPerfeccionLianQi;
}
function puedeBuscarIluminacion(p) {
  return !!p && p.granPerfeccionLianQi === true && !p.iluminacion?.alcanzada;
}
function puedeIniciarTribulacion(p) {
  // pendienteReintento: al fallar la Tribulación no se destruye el
  // personaje ni la Semilla, pero tampoco se reintenta de inmediato en el
  // siguiente MEDITAR — la condición real de reintento queda pendiente de
  // diseño (gancho narrativo abierto, ver resolverTribulacionCorazon()).
  return !!p && p.iluminacion?.alcanzada === true
    && !p.tribulacionCorazon?.superada
    && !p.tribulacionCorazon?.pendienteReintento;
}

// Evaluador central de `req.reino` para TÉCNICAS y manuales. Las 12 técnicas con
// req: { reino: "ZhuJi" } siguen siendo datos puros: lo que cambia es este
// lector. Por defecto "este reino o cualquiera posterior"; sólo con el flag
// explícito alcance: "exacto" se exige el reino justo.
function cumpleRequisitoReino(p, req) {
  if (!req || !req.reino) return true;
  return req.alcance === "exacto" ? reinoExacto(p, req.reino) : reinoAlMenos(p, req.reino);
}

// heridas_meridianos es 0–3. Mapeo único; no repetir esta tabla en otros sitios.
const MERIDIANOS_ESTADO = ["Estables", "Resentidos", "Dañados", "Críticos"];
function estadoMeridianos(n) {
  const i = Math.max(0, Math.min(MERIDIANOS_ESTADO.length - 1, Number(n) || 0));
  return MERIDIANOS_ESTADO[i];
}

/* ======================================================================
   ILUMINACIÓN · CORAZÓN DEL DAO
   Clasificación TEMÁTICA determinista, nunca moral. Ninguna respuesta es
   "buena" ni "mala": una egoísta puede ser sincera y una altruista, mentira.
   Los pesos viven en los DATOS de cada opción; la lógica sólo suma y ordena.
   ====================================================================== */
const TEMAS_DAO = {
  libertad:     { nombre: "Libertad",     lema: "Nadie decide por mí hacia dónde corre mi qi." },
  proteccion:   { nombre: "Protección",   lema: "Mi fuerza vale por lo que sostiene." },
  poder:        { nombre: "Poder",        lema: "Sólo quien puede, elige." },
  conocimiento: { nombre: "Conocimiento", lema: "Entender es una forma de no volver a caer." },
  superacion:   { nombre: "Superación",   lema: "Lo que fui ayer es sólo material." },
  pertenencia:  { nombre: "Pertenencia",  lema: "No se asciende solo, aunque se suba solo." },
  armonia:      { nombre: "Armonía",      lema: "No forzar el río: reconocer su cauce." },
  determinacion:{ nombre: "Determinación",lema: "Elegir una vez y volver a elegirlo cada día." },
};

// Desempate explícito y reproducible: si dos temas empatan en puntos, gana el
// que aparezca antes en esta lista. Nunca una condición inventada en el momento.
const ORDEN_DESEMPATE_DAO = ["determinacion", "libertad", "proteccion", "superacion",
                             "conocimiento", "armonia", "pertenencia", "poder"];

// Cada opción lleva un mapa de afinidades temáticas, no una puntuación moral.
// `si` permite que una opción sólo aparezca si el jugador vivió cierta decisión
// del Arco 1 (memoria de decisiones, §8). Nunca castiga la incoherencia: por eso
// existen siempre salidas del tipo "he cambiado" o "no tengo una respuesta".
const PREGUNTAS_ILUMINACION = [
  {
    id: "porque",
    titulo: "I · ORIGEN",
    contexto: [
      "El qi completa una última vuelta por tus meridianos y queda inmóvil.",
      "La montaña, la secta y las técnicas aprendidas se desdibujan. Por un instante vuelves a ser quien eras antes de conocer el qi.",
      "Si pudieras regresar a ese momento sabiendo todo lo que vendría después…",
    ],
    pregunta: "¿Qué te haría dar el primer paso otra vez?",
    opciones: [
      { texto: "Hubo un momento en que comprendí lo que significa que otro pueda decidir tu destino. No quiero volver a entregar esa decisión.", temas: { libertad: 3, determinacion: 1 } },
      { texto: "Alguna vez miré a alguien necesitar más de lo que yo podía darle. No quiero volver a quedarme con las manos vacías.", temas: { proteccion: 3, pertenencia: 1 } },
      { texto: "Conocí mis propios límites demasiado pronto. Desde entonces no he dejado de preguntarme cuánto de ellos era realmente inevitable.", temas: { poder: 2, superacion: 2 } },
      { texto: "Una vez vi algo que no comprendía y descubrí que ignorarlo me inquietaba más que cualquier peligro que pudiera encontrar buscando la respuesta.", temas: { conocimiento: 3, armonia: 1 } },
    ],
  },
  {
    id: "temes",
    titulo: "II · MIEDO",
    contexto: [
      "Frente a ti aparecen incontables caminos. Algunos ascienden; otros terminan antes de que puedas distinguir adónde llevaban.",
      "No hay monstruos esperándote. Solo futuros posibles.",
      "Comprendes que no siempre tememos aquello que puede matarnos. A veces tememos aquello con lo que tendríamos que seguir viviendo.",
    ],
    pregunta: "¿Qué posibilidad haría vacilar de verdad tu paso?",
    opciones: [
      { texto: "Despertar un día y descubrir que las decisiones más importantes de mi vida fueron tomadas por otros mientras yo aprendía a obedecerlas.", temas: { libertad: 3 } },
      { texto: "Llegar a ser lo bastante fuerte para salvar a alguien… un instante después de que ya sea demasiado tarde.", temas: { proteccion: 3, determinacion: 1 } },
      { texto: "Encontrarme frente a algo que importa y descubrir que, por mucho que quiera impedirlo, sigo sin tener poder suficiente.", temas: { poder: 3 } },
      { texto: "Haber construido mi camino sobre algo falso y comprenderlo cuando ya haya avanzado demasiado para volver atrás sin perderme.", temas: { conocimiento: 2, armonia: 2 } },
      { texto: "Llegar tan lejos que nadie recuerde ya a la persona que comenzó este viaje… y descubrir que tampoco queda nadie esperando su regreso.", temas: { pertenencia: 3, superacion: 1 } },
    ],
  },
  {
    id: "perder",
    titulo: "III · PRECIO",
    contexto: [
      "Una balanza aparece frente a ti.",
      "En un plato descansa todo aquello que todavía podrías llegar a ser. En el otro se reúnen cosas conocidas: un hogar, una mano extendida, una certeza, una promesa.",
      "El Camino no te dice cuál será su precio. Solo te recuerda que algún día podría pedirlo.",
    ],
    pregunta: "¿Qué te costaría más convertir en moneda para seguir avanzando?",
    opciones: [
      { texto: "El lugar del que vengo. Puedo dejarlo atrás, pero no permitir que decida para siempre quién debo ser.", temas: { libertad: 2, superacion: 2 } },
      { texto: "Una vida que todavía pueda alcanzar con mis manos. Hay ascensos que dejarían de significar algo si tuviera que pisar a alguien para conseguirlos.", temas: { proteccion: 3, armonia: 1 } },
      { texto: "No voy a fingir que conozco mi límite. Si el precio llega, lo miraré entonces.", temas: { poder: 3, determinacion: 1 } },
      { texto: "Mi derecho a cambiar de idea. Prefiero perder una certeza antes que conservarla después de descubrir que estaba equivocada.", temas: { conocimiento: 2, armonia: 2 } },
      { texto: "No lo sé. Prometer ahora lo que sería capaz de sacrificar entonces sería mentirme precisamente aquí.", temas: { armonia: 2, conocimiento: 1 } },
    ],
  },
  {
    id: "espejo",
    titulo: "IV · ESPEJO",
    // Las opciones particulares se construyen desde el historial canónico de
    // acciones. Estas dos son universales y garantizan que nunca exista una
    // reflexión sin salida aunque el personaje no tenga recuerdos significativos.
    contexto: [
      "El suelo se vuelve agua. No refleja el cielo: te refleja a ti.",
      "La superficie tiembla y aparecen decisiones que ya tomaste. Esta vez la Iluminación no te pregunta qué harías. Eso ya lo sabe.",
    ],
    pregunta: "Cuando miras aquello que hiciste, ¿qué haces ahora con esa parte de ti?",
    opciones: [
      { texto: "Aquello también fui yo. Reconocerlo no significa entregarle para siempre el derecho a decidir quién seré después.", temas: { superacion: 3, libertad: 1 } },
      { texto: "No sé cuánto de aquella persona sigue dentro de mí. Decir otra cosa solo porque necesito una respuesta sería mentirme.", temas: { armonia: 2, conocimiento: 2 } },
    ],
  },
  {
    id: "quien",
    titulo: "V · NOMBRE",
    contexto: [
      "Uno a uno desaparecen tus nombres: discípulo, cultivador, LianQi.",
      "Después se desvanecen la secta, las técnicas aprendidas y hasta los reinos que esperabas alcanzar.",
      "Cuando también tu propio nombre comienza a borrarse, comprendes cuánto habías colocado alrededor de él para explicar quién eras.",
    ],
    pregunta: "Si nada de eso pudiera decirte quién eres, ¿qué seguiría orientando tus pasos?",
    opciones: [
      { texto: "Que el próximo paso siga siendo mío, incluso si termino equivocándome al darlo.", temas: { libertad: 3, determinacion: 2 } },
      { texto: "Que mi fuerza deja de tener sentido si solo sirve para conservarme a mí mismo.", temas: { proteccion: 3, pertenencia: 2 } },
      { texto: "Que aquello que hoy puedo hacer no tiene por qué ser también el límite de aquello que puedo llegar a hacer.", temas: { poder: 3, determinacion: 2 } },
      { texto: "La pregunta que todavía no sé responder. Mientras exista algo que no comprenda, habrá una dirección hacia la que mirar.", temas: { conocimiento: 3, armonia: 1 } },
      { texto: "La posibilidad de no ser mañana exactamente quien soy hoy.", temas: { superacion: 3, armonia: 2 } },
      { texto: "Aquello que permanece entre una persona y otra incluso cuando ninguna puede seguir caminando junto a la otra.", temas: { pertenencia: 3, armonia: 1 } },
    ],
  },
];

/* ----------------------------------------------------------------------
   ESPEJO · recuerdos derivados del motor de acciones

   Este catálogo NO conoce NPC, misión, sala ni escena concreta. Sólo conoce
   verbos canónicos del motor. Una misión futura puede reemplazar por completo
   al contenido actual y seguir alimentando estas reflexiones con registrarAccion().
   La acción nunca trae afinidad de Dao: las afinidades aparecen recién aquí,
   cuando el jugador interpreta lo que hizo.
   ---------------------------------------------------------------------- */
const REFLEXIONES_ESPEJO = [
  {
    id: "restitucion",
    requiere: [TIPOS_ACCION_NARRATIVA.ROBAR, TIPOS_ACCION_NARRATIVA.DEVOLVER],
    contexto: [
      "El agua muestra una mano cerrándose sobre algo ajeno. La imagen cambia: la misma mano lo devuelve.",
      "El espejo conserva ambos gestos. Ninguno consigue borrar al otro.",
    ],
    opciones: [
      { texto: "Las dos manos son mías. Reparar lo que hice no convierte el primer gesto en algo que nunca ocurrió.", temas: { superacion: 3, armonia: 1 } },
    ],
  },
  {
    id: "ocultacion",
    requiere: [TIPOS_ACCION_NARRATIVA.ROBAR, TIPOS_ACCION_NARRATIVA.OCULTAR],
    contexto: [
      "En el agua reconoces algo que tomaste sin permiso. Después llega el instante en que pudiste decirlo y elegiste guardar silencio.",
      "No aparece nadie para acusarte. Solo queda la decisión.",
    ],
    opciones: [
      { texto: "Entonces tuve razones suficientes para hacerlo y para callar. No necesito inventarme otras ahora para poder mirarme a la cara.", temas: { libertad: 2, poder: 2 } },
    ],
  },
  {
    id: "clemencia",
    requiere: [TIPOS_ACCION_NARRATIVA.PERDONAR],
    contexto: [
      "La superficie muestra a alguien derrotado frente a ti. Recuerdas que podías terminarlo.",
      "También recuerdas el instante exacto en que decidiste detener la mano.",
    ],
    opciones: [
      { texto: "Podía hacerlo y no lo hice. Saber dónde detener mi fuerza importa tanto como tenerla.", temas: { proteccion: 2, armonia: 2 } },
    ],
  },
  {
    id: "ejecucion",
    requiere: [TIPOS_ACCION_NARRATIVA.EJECUTAR],
    contexto: [
      "La imagen tarda en aparecer. Cuando lo hace, no exagera nada: muestra una vida vencida y el momento en que decidiste terminarla.",
      "El agua no te acusa. Tampoco te ofrece una excusa.",
    ],
    opciones: [
      { texto: "No voy a llamarlo necesario solo porque fui yo quien lo hizo. Tampoco voy a fingir que esa persona era otra.", temas: { poder: 2, superacion: 2 } },
    ],
  },
  {
    id: "memoria_restaurada",
    requiere: [TIPOS_ACCION_NARRATIVA.RESTAURAR],
    contexto: [
      "El reflejo muestra algo que había sido borrado y tus manos devolviéndole un lugar.",
      "Por un instante comprendes que recordar también puede ser una forma de actuar.",
    ],
    opciones: [
      { texto: "Hay cosas que siguen perteneciendo al mundo incluso después de que alguien intentó borrarlas.", temas: { pertenencia: 3, proteccion: 1 } },
    ],
  },
  {
    id: "verdad_preservada",
    requiere: [TIPOS_ACCION_NARRATIVA.PRESERVAR],
    contexto: [
      "En el agua aparece una verdad que pudiste entregar y elegiste conservar.",
      "No sabes todavía si el silencio la protegió o simplemente aplazó su peso.",
    ],
    opciones: [
      { texto: "No toda verdad mejora por ser expuesta de inmediato. También importa comprender cuándo y en manos de quién puede sobrevivir.", temas: { conocimiento: 2, proteccion: 2 } },
    ],
  },
  {
    id: "ayuda_costosa",
    requiere: [TIPOS_ACCION_NARRATIVA.AYUDAR],
    contexto: [
      "El espejo devuelve algo que entregaste para que otro pudiera continuar.",
      "El coste ya pasó. Lo que queda es preguntarte por qué aceptaste pagarlo.",
    ],
    opciones: [
      { texto: "Si mi fuerza no puede sostener nada fuera de mí, entonces todavía no entiendo para qué la quiero.", temas: { proteccion: 3, pertenencia: 1 } },
    ],
  },
  {
    id: "recurso_conservado",
    requiere: [TIPOS_ACCION_NARRATIVA.CONSERVAR],
    contexto: [
      "La superficie recuerda el momento en que pudiste desprenderte de algo y decidiste conservarlo.",
      "No lo llama egoísmo ni prudencia. Solo te devuelve el peso que elegiste mantener.",
    ],
    opciones: [
      { texto: "No todo lo que poseo se convierte en deuda porque otro lo necesite. También tengo derecho a decidir qué sostengo y qué no.", temas: { libertad: 2, poder: 2 } },
    ],
  },
  {
    id: "verdad_corregida",
    requiere: [TIPOS_ACCION_NARRATIVA.CORREGIR],
    contexto: [
      "El agua muestra un error y el momento en que elegiste corregirlo sin convertir la corrección en una recompensa para tu nombre.",
      "La verdad quedó distinta aunque nadie supiera quién movió la piedra.",
    ],
    opciones: [
      { texto: "Que algo sea verdadero importa incluso cuando nadie puede reconocerme por haberlo visto.", temas: { conocimiento: 3, armonia: 1 } },
    ],
  },
  {
    id: "vinculo_roto",
    requiereAlguna: [TIPOS_ACCION_NARRATIVA.NEGOCIAR, TIPOS_ACCION_NARRATIVA.ROMPER_VINCULO],
    contexto: [
      "El reflejo te devuelve un vínculo que otros daban por establecido y el instante en que decidiste que ya no bastaba con aceptarlo.",
      "Cambió la forma en que estabas unido al mundo, y también el precio de elegir por ti mismo.",
    ],
    opciones: [
      { texto: "Un vínculo solo sigue siendo mío mientras todavía pueda decidir permanecer en él.", temas: { libertad: 3, determinacion: 1 } },
    ],
  },
  {
    id: "verdad_compartida",
    requiere: [TIPOS_ACCION_NARRATIVA.COMPARTIR],
    contexto: [
      "Vuelve una verdad que podrías haber guardado solo para ti y el instante en que decidiste compartirla.",
      "Una vez pronunciada dejó de pertenecerte por completo.",
    ],
    opciones: [
      { texto: "Comprender algo cambia lo que soy; compartirlo también cambia aquello de lo que formo parte.", temas: { conocimiento: 2, pertenencia: 2 } },
    ],
  },
  {
    id: "silencio_elegido",
    requiere: [TIPOS_ACCION_NARRATIVA.CALLAR],
    contexto: [
      "El agua recuerda una respuesta que no diste.",
      "El silencio también fue una elección, aunque nadie pudiera medirla desde fuera.",
    ],
    opciones: [
      { texto: "No toda respuesta merece ser pronunciada solo porque alguien la espera. A veces callar también conserva una dirección propia.", temas: { armonia: 2, libertad: 2 } },
    ],
  },
  {
    id: "poder_liberado",
    requiere: [TIPOS_ACCION_NARRATIVA.LIBERAR],
    contexto: [
      "El reflejo devuelve un poder que podrías haber conservado bajo control y el momento en que elegiste dejarlo libre.",
      "Ya no puedes decidir qué hará después con esa libertad.",
    ],
    opciones: [
      { texto: "Poseer algo no me concede para siempre el derecho a decidir su destino.", temas: { libertad: 3, armonia: 1 } },
    ],
  },
  {
    id: "poder_custodiado",
    requiere: [TIPOS_ACCION_NARRATIVA.CUSTODIAR],
    contexto: [
      "El agua muestra un poder que elegiste mantener bajo custodia.",
      "Conservarlo significó aceptar que aquello capaz de dañar también podía convertirse en responsabilidad.",
    ],
    opciones: [
      { texto: "Hay cosas que no se vuelven inocentes por soltarlas. Si puedo contener un peligro, quizá también deba responder por él.", temas: { proteccion: 2, pertenencia: 2 } },
    ],
  },
];

/* ======================================================================
   TRIBULACIÓN DEL CORAZÓN
   La Iluminación preguntó "¿quién soy?"; la Tribulación pregunta "¿puedo
   sostenerlo cuando aprieta?". No se puntúa moralmente: se mide COHERENCIA
   entre la Semilla obtenida y lo que se responde bajo presión.
   Estructura común, conflicto variable según la semilla.
   ====================================================================== */
const CONFLICTOS_TRIBULACION = {
  libertad: {
    escena: "La niebla te ofrece un camino despejado hasta ZhuJi. Sólo pide una firma: un juramento de obediencia a la secta, de por vida.",
    opciones: [
      { texto: "Rechazo el atajo. No cambio el camino por la correa.", coherente: true },
      { texto: "Firmo. La libertad ya me costó demasiado.", coherente: false },
      { texto: "Firmo, pero pensando romperlo después.", coherente: false },
    ],
  },
  proteccion: {
    escena: "Al fondo de la niebla, alguien a quien conoces se ahoga en su propio qi. Salvarlo cuesta el vaso entero: perderías el ascenso de hoy.",
    opciones: [
      { texto: "Vacío el vaso. Que suba otro día.", coherente: true },
      { texto: "Sigo subiendo. Es una ilusión, no una persona.", coherente: false },
      { texto: "Me detengo a mirar, sin decidir, hasta que deja de moverse.", coherente: false },
    ],
  },
  poder: {
    escena: "La niebla te muestra una técnica que te haría imparable mañana. El precio: no volver a entender nunca por qué funciona.",
    opciones: [
      { texto: "La tomo. Puedo, y con eso basta.", coherente: true },
      { texto: "La rechazo. No quiero una fuerza que no comprendo.", coherente: false },
      { texto: "La dejo para después, por si acaso.", coherente: false },
    ],
  },
  conocimiento: {
    escena: "Una voz te ofrece la respuesta exacta a por qué caíste la primera vez. A cambio, no podrás contársela a nadie jamás.",
    opciones: [
      { texto: "Acepto. Saberlo yo ya cambia lo que haré.", coherente: true },
      { texto: "Rechazo. Un saber que no se comparte no me sirve.", coherente: false },
      { texto: "Regateo, intento quedarme con las dos cosas.", coherente: false },
    ],
  },
  superacion: {
    escena: "La niebla te devuelve a quien eras al llegar al Pico. Te ofrece quedarte ahí: sin deudas, sin culpa, sin haber hecho nada malo todavía.",
    opciones: [
      { texto: "Sigo adelante. No quiero volver a ser aquello.", coherente: true },
      { texto: "Me quedo. Allí no había nada que reparar.", coherente: false },
      { texto: "Dudo tanto que la niebla decide por mí.", coherente: false },
    ],
  },
  pertenencia: {
    escena: "Te ofrecen ascender hoy mismo, con una condición: nadie de la montaña sabrá nunca que fuiste tú.",
    opciones: [
      { texto: "Rechazo. Subir sin que los míos lo sepan no es subir.", coherente: true },
      { texto: "Acepto. El reconocimiento no alimenta.", coherente: false },
      { texto: "Acepto, y me prometo contarlo algún día.", coherente: false },
    ],
  },
  armonia: {
    escena: "El qi de la tribulación se desborda. Puedes forzarlo a tu forma de golpe, o dejar que encuentre su cauce aunque te cueste sangre.",
    opciones: [
      { texto: "Lo dejo correr. Acompaño, no fuerzo.", coherente: true },
      { texto: "Lo doblego. No tengo tiempo para cauces.", coherente: false },
      { texto: "Lo fuerzo un poco, lo suelto un poco, sin decidir.", coherente: false },
    ],
  },
  determinacion: {
    escena: "La niebla te muestra el resto del camino: cada año, cada pérdida, cada vez que querrás abandonar. Y te pregunta si vuelves a elegirlo.",
    opciones: [
      { texto: "Lo elijo otra vez, sabiendo el precio.", coherente: true },
      { texto: "Quiero el final sin el camino.", coherente: false },
      { texto: "Elijo hoy, y mañana ya veré.", coherente: false },
    ],
  },
};

// Segunda situación, común a todas las semillas: la presión no viene de fuera
// sino del propio historial del personaje.
const PRESION_TRIBULACION = {
  escena: "La niebla deja de mostrarte cosas y sólo te sostiene la mirada. —Todo eso que acabas de decir de ti. ¿Lo dirías igual si nadie te estuviera escuchando?",
  opciones: [
    { texto: "Igual. Lo dije para mí, no para la niebla.", coherente: true },
    { texto: "Lo dije porque era lo que había que decir.", coherente: false },
    { texto: "Lo dije, y todavía no sé si es verdad. Pero lo sostengo.", coherente: true },
  ],
};
