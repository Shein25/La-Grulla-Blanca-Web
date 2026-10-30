const CATALOGO = [];

const RECETAS = {
  sangre: {
    categoria: "vitalidad",
    nombre: "poción de sangre refinada", dificultad: "sencilla",
    ingredientes: { raiz_sangre: 1, hierba_claridad: 1 }, resultado: "pocion_refinada", patron: [2, 2, 2],
    pista: "La raíz libera su esencia con rapidez si la llama sube demasiado. La claridad debe acompañar el flujo antes de que el rojo se oscurezca.",
    desbloqueo: { tipo: "inicial" },
  },
  antidoto: {
    categoria: "purificacion",
    nombre: "antídoto de jade menor", dificultad: "normal",
    ingredientes: { aguijon_jade: 1, fibra_jade: 1, hierba_claridad: 1 }, resultado: "antidoto_jade", patron: [1, 2, 2],
    pista: "La toxina no debe despertar por completo. La fibra sostiene la mezcla mientras la claridad separa veneno de medicina.",
    desbloqueo: { tipo: "material", item: "aguijon_jade" },
  },
  purificacion: {
    categoria: "purificacion",
    nombre: "píldora de purificación", dificultad: "normal",
    ingredientes: { musgo_lunar: 2, hierba_claridad: 1 }, resultado: "pildora_purificacion", patron: [1, 1, 3],
    pista: "El musgo lunar se marchita bajo una llama agresiva. Necesita tiempo para atraer el sedimento antes de cerrar la preparación.",
    desbloqueo: { tipo: "material", item: "musgo_lunar" },
  },
  elixir: {
    categoria: "espiritu",
    nombre: "elixir de qi menor", dificultad: "normal",
    ingredientes: { rocio_niebla: 1, raiz_sangre: 1, hongo_medula: 1 }, resultado: "elixir_qi", patron: [2, 3, 2],
    pista: "El rocío mantiene suspendida la esencia sólo mientras ésta se mueve. Si la corriente pierde impulso, la mezcla se separa.",
    desbloqueo: { tipo: "material", item: "rocio_niebla" },
  },
  ceniza: {
    categoria: "purificacion",
    nombre: "bálsamo de ceniza fría", dificultad: "normal",
    ingredientes: { petalo_ceniza: 1, rocio_niebla: 1, fibra_jade: 1 }, resultado: "balsamo_ceniza", patron: [1, 2, 1],
    pista: "El calor del pétalo debe ceder al rocío, no combatirlo. El bálsamo se cierra mientras todavía conserva frío en la superficie.",
    desbloqueo: { tipo: "material", item: "petalo_ceniza" },
  },
  meridianos: {
    categoria: "especiales",
    nombre: "píldora de remiendo meridiano", dificultad: "dificil",
    ingredientes: { membrana_ferrea: 1, musgo_lunar: 1, medula_fungica: 1 }, resultado: "pildora_meridianos", patron: [1, 2, 3],
    pista: "La membrana debe ablandarse sin perder memoria; la médula alimenta la costura y el musgo retira lo que sobra al final.",
    desbloqueo: { tipo: "rango", rango: 1 },
  },
  lunar: {
    categoria: "espiritu",
    nombre: "destilado lunar", dificultad: "dificil",
    ingredientes: { fluido_lunar: 1, rocio_niebla: 1, musgo_lunar: 1 }, resultado: "destilado_lunar", patron: [1, 1, 2],
    pista: "Nada en esta fórmula tolera prisa. La luna debe permanecer suspendida hasta que el sedimento encuentre el fondo por sí solo.",
    desbloqueo: { tipo: "rango_material", rango: 1, item: "fluido_lunar" },
  },
  tempestad: {
    categoria: "espiritu",
    nombre: "elixir de tempestad menor", dificultad: "muy_dificil",
    ingredientes: { fibra_tempestad: 1, semilla_trueno: 1, polvo_nube: 1 }, resultado: "elixir_tempestad", patron: [3, 3, 2],
    pista: "La carga debe mantenerse viva sin escapar. Una reacción demasiado lenta muere; una demasiado prolongada salta fuera de la caldera.",
    desbloqueo: { tipo: "rango_material", rango: 1, item: "fibra_tempestad" },
  },
};

const DIFICULTADES_ALQUIMIA_UI = Object.freeze({
  sencilla: "Sencilla", normal: "Normal", dificil: "Difícil", muy_dificil: "Muy Difícil",
});
const CATEGORIAS_ALQUIMIA = Object.freeze({
  vitalidad: { nombre: "Vitalidad", orden: 10 },
  purificacion: { nombre: "Purificación", orden: 20 },
  espiritu: { nombre: "Espíritu", orden: 30 },
  defensa: { nombre: "Defensa", orden: 40 },
  movimiento: { nombre: "Movimiento", orden: 50 },
  especiales: { nombre: "Especiales", orden: 90 },
});

// ============================================================================
//  CONTRATO DE DISEÑO · OFICIOS (v3)
//  --------------------------------------------------------------------------
//  Este bloque es la referencia obligatoria para futuras incorporaciones:
//  1) Examen, Herboristería y Alquimia comparten los mismos umbrales globales:
//       INICIADO 0 XP · NOVICIO 50 XP · APRENDIZ 180 XP.
//  2) XP y rango formal NO son lo mismo. La XP puede superar un umbral, pero el
//     ascenso sólo ocurre mediante promoverProfesion() y el mentor/contenido del
//     arco correspondiente. En Arco 1 el rango formal máximo es NOVICIO.
//  3) La repetición usa SIEMPRE TRAMOS_APRENDIZAJE: 1ª 100%, 2ª 75%, 3ª–5ª
//     40%, 6ª–10ª 15%, 11ª+ 0%. No redondear hacia arriba por intento: guardar
//     XP fraccionaria y mostrar el total redondeado sólo en interfaz.
//  4) Examen/Herboristería: observar o fallar no da XP. El XP se concede sólo
//     al completar con éxito un procedimiento profesional. Botín suelto tampoco
//     concede XP profesional.
//  5) Alquimia: los fallos no dan XP; cada receta lleva su propio contador de
//     elaboraciones válidas. Los hitos de calidad se implementarán en su etapa.
//  6) Toda nueva profesión/procedimiento debe declarar una dificultad de las
//     claves de XP_BASE_DIFICULTAD. No crear fórmulas de XP locales ad hoc.
//  7) Examen usa identificadores estables por especie+procedimiento. Nunca bases
//     progreso persistente en el texto visible del método. Ver CONTRATO DE
//     DISEÑO · EXTRACCIÓN ESPIRITUAL junto a HALLAZGOS_CADAVER.
//  8) Herboristería usa especie+procedimiento y nodos persistentes. RECOLECTAR
//     pertenece sólo a plantas; EXTRAER pertenece sólo a cuerpos de Examen.
//     Nunca uses objetos sueltos como sustituto de una entidad profesional para otorgar XP.
// ============================================================================
const PROFESIONES = {
  examen: {
    nombre: "Extracción Espiritual", simbolo: "骨", activa: true, rangoMaximoArco1: 1,
    descripcion: "Estudias cadáveres y estructuras espirituales para extraer materiales anatómicos sin confundirlos con el botín normal.",
    mentor: "Chen Bo", requisito: "Se aprende de Chen Bo durante la misión correspondiente. No concede Examen antes de su enseñanza.",
  },
  herboristeria: {
    nombre: "Herboristería Espiritual", simbolo: "艸", activa: true, rangoMaximoArco1: 1,
    descripcion: "Reconoces plantas espirituales, eliges qué parte intervenir y aprendes a recolectarlas sin agotar innecesariamente el entorno.",
    mentor: "Instructor de Herboristería", requisito: "Solicitá la enseñanza legítima a un NPC habilitado en LianQi I.",
  },
  alquimia: {
    nombre: "Alquimia", simbolo: "丹", activa: true, rangoMaximoArco1: 1,
    descripcion: "Transforma materiales en medicinas mediante fuego, circulación y sellado. La receta se aprende experimentando y registrando sus señales.",
    mentor: "Yao Fen", requisito: "Aprendé Alquimia y utilizá una estación de trabajo habilitada con materiales auténticos.",
  },
  forja: {
    nombre: "Forja Espiritual", simbolo: "鍛", activa: false,
    descripcion: "En arcos futuros permitirá templar armas, armaduras y artefactos sin sustituir los tesoros únicos encontrados en el mundo.",
  },
  inscripcion: {
    nombre: "Inscripción y Formaciones", simbolo: "符", activa: false,
    descripcion: "En arcos futuros convertirá tinta, materiales y comprensión en talismanes y formaciones de uso limitado.",
  },
};
const RANGOS_OFICIO = ["Iniciado", "Novicio", "Aprendiz"];
const UMBRALES_OFICIO = [0, 50, 180];
const TRAMOS_APRENDIZAJE = Object.freeze([
  { desde: 1, hasta: 1, factor: 1.00 },
  { desde: 2, hasta: 2, factor: 0.75 },
  { desde: 3, hasta: 5, factor: 0.40 },
  { desde: 6, hasta: 10, factor: 0.15 },
  { desde: 11, hasta: Infinity, factor: 0.00 },
]);
const XP_BASE_DIFICULTAD = Object.freeze({
  examen: Object.freeze({ simple: 1, normal: 2, dificil: 3, muy_dificil: 4 }),
  herboristeria: Object.freeze({ simple: 1, normal: 2, dificil: 3, muy_dificil: 4 }),
  alquimia: Object.freeze({ sencilla: 2, normal: 3, dificil: 4, muy_dificil: 5 }),
});
function factorAprendizaje(exitos) {
  const n = Math.max(1, Math.floor(Number(exitos) || 1));
  return TRAMOS_APRENDIZAJE.find(t => n >= t.desde && n <= t.hasta)?.factor ?? 0;
}
function xpPracticaPorDificultad(oficioId, dificultad, exitos) {
  const base = XP_BASE_DIFICULTAD[oficioId]?.[dificultad] ?? 0;
  return base * factorAprendizaje(exitos);
}
function formatearXP(valor) {
  const n = Math.max(0, Number(valor) || 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
const PULSOS_ALQUIMIA = [
  { nombre: "FUEGO", pregunta: "¿Con qué intensidad calientas la caldera?", opciones: ["Suave", "Medio", "Alto"] },
  { nombre: "CIRCULACIÓN", pregunta: "¿Cómo haces girar la esencia?", opciones: ["Lenta", "Continua", "Rápida"] },
  { nombre: "SELLADO", pregunta: "¿Cuándo cierras la medicina?", opciones: ["Temprano", "En el pulso", "Tardío"] },
];
const CALIDADES_ALQUIMIA = {
  impura: { nombre: "Impura", clase: "impura", nivel: 1 },
  estable: { nombre: "Estable", clase: "estable", nivel: 2 },
  superior: { nombre: "Superior", clase: "superior", nivel: 3 },
  excepcional: { nombre: "Excepcional", clase: "excepcional", nivel: 4 },
};
const TECHO_PRACTICA_ALQUIMIA = {
  sencilla: ["superior", "excepcional", "excepcional", "excepcional"],
  normal: ["estable", "superior", "excepcional", "excepcional"],
  dificil: ["estable", "estable", "superior", "excepcional"],
  muy_dificil: ["impura", "estable", "superior", "excepcional"],
};
const HITOS_ALQUIMIA = { valida: 2, estable: 2, superior: 3, excepcional: 4 };

// ============================================================================
//  CONTRATO DE DISEÑO · ALQUIMIA (v7)
//  --------------------------------------------------------------------------
//  1) Una room habilita crafteo con `estaciones: { alquimia: true }`. Nunca

//  2) Toda receta declara: nombre, dificultad (sencilla/normal/dificil/
//     muy_dificil), ingredientes, resultado, patron[3], pista y desbloqueo.
//  3) El patrón es conocimiento oculto. Las pistas describen comportamiento,
//     nunca imprimen la combinación exacta antes de que la Bitácora la descubra.
//  4) Precisión: cada pulso produce 0/1/2 errores según distancia respecto al
//     patrón. 0=>Excepcional potencial, 1=>Superior, 2=>Estable, 3=>Impura,
//     4+=>Fallo. No hay RNG en la calidad.
//  5) La práctica limita el techo final por receta y dificultad. La práctica
//     jamás mejora una mala decisión: calidad final = min(potencial, techo).
//  6) Fallo: consume ingredientes, 0 XP y NO incrementa elaboraciones válidas.
//  7) Elaboración válida usa TRAMOS_APRENDIZAJE por receta. Hitos únicos: primera
//     válida +2; primera Estable +2; Superior +3; Excepcional +4, acumulativos.
//  8) La Bitácora registra descartes/aciertos por cada uno de los tres pulsos.
//     Dos observaciones positivas confirman un valor; dos descartes confirman
//     por eliminación. Rango mejora cuántos pulsos puedes interpretar, no calidad.
//  9) Encontrar un ingrediente puede descubrir una fórmula si su regla lo dice,
//     pero conocer una receta NO equivale a conocer su patrón.
// 10) No introducir bonos cruzados desde Examen, Herboristería, comprensión,
//     afinidad o suerte en la calidad final. Esos sistemas pueden abrir recetas,
//     pistas narrativas o contenido, pero no corregir decisiones erróneas.
// 11) OFICIOS conserva sólo la Bitácora. ALQUIMIA/CALDERO abre la interacción
//     contextual de la estación presente y nunca se ancla a renderOficios().
// 12) Elaboración rápida se desbloquea POR VARIANTE sólo después de obtener
//     EXCEPCIONAL al menos una vez. Antes de eso, las tres etapas son obligatorias.
//     Al dominarla, las etapas quedan colapsadas por defecto y el método manual
//     sigue accesible para consulta o futuras variantes con catalizadores.
// 13) Extensiones FUTURAS (no activas ni visibles aún):
//       a) RENDIMIENTO: probabilidad de producir unidades adicionales.
//       b) EFICIENCIA: probabilidad de preservar ingredientes elegibles.
//     Deben resolverse DESPUÉS de calidad y cantidad base, sin modificar calidad:
//     calidad -> cantidad base -> rendimiento -> consumo base -> eficiencia -> salida.
// ============================================================================
//  CONTRATO DE DISEÑO · AFLICCIONES PERSISTENTES (Etapa 6)
//
//  1) Una aflicción persistente vive en player.aflicciones, nunca sólo en Combate.
//     Debe sobrevivir a victoria, huida, cambio de sala y guardado/carga.
//  2) Esquema mínimo: { tipo, familia, grado, nombre, daño, duracion, origen }.
//     `tipo` describe la mecánica (veneno/quemadura); `familia` identifica el
//     remedio compatible; `grado` impide que medicinas tempranas curen estados
//     de arcos posteriores.
//  3) Una medicina declara cura_afliccion:{tipo,familia,gradoMax}. No usar
//     nombres de objetos en la lógica de curación: toda compatibilidad sale de
//     esos campos.
//  4) Una medicina incompatible NO se consume. Una compatible elimina una sola
//     aflicción de esa familia/tipo cuyo grado sea <= gradoMax.
//  5) Reaplicar la misma familia no apila copias infinitas: conserva la mayor
//     duración y la versión de mayor grado/intensidad.
//  6) Avanzan sólo con acciones que representan tiempo físico: combate, caminar,
//     meditar, descansar/dormir, Examen, Herboristería y Alquimia. Consultar
//     mapas, inventario, hojas, bitácoras u oficios nunca debe llamar al tick.
//  7) Fuera de combate un DOT persistente no reduce la vida por debajo de 1 HP;
//     dentro de combate sí puede matar. Esta protección evita muertes silenciosas
//     durante navegación sin volver inocua la aflicción.
//  8) Una técnica enemiga aplica su aflicción sólo si el golpe causa daño real.
//     No aplicar veneno/quemadura antes de resolver impacto y defensas.
//  9) Arco 1: Veneno de Jade I y Quemadura de Ceniza I. Antídoto de Jade Menor
//     cura sólo veneno/jade/grado<=1; Bálsamo de Ceniza Fría sólo
//     quemadura/ceniza/grado<=1. No ampliar estas medicinas por conveniencia.
// 10) Toda familia/grado futura debe añadir pruebas de compatibilidad, persistencia
//     y guardado antes de incorporarse a una criatura o receta.
// ============================================================================


// ============================================================================
//  CONTRATO DE DISEÑO · BALANCE INTEGRAL (Etapa 7)
//  --------------------------------------------------------------------------
//  Este bloque fija cómo se balancean juntos Examen, Herboristería y Alquimia.
//  No es una tabla de números aislados: toda incorporación futura debe revisar
//  su efecto sobre la cadena completa recurso -> receta -> XP -> exploración.
//
//  1) BOTÍN Y OFICIOS
//     · Un material producido por PLANTAS_ESPIRITUALES o HALLAZGOS_CADAVER no
//       debe aparecer también como drop automático de un mob común o jefe.
//       El jugador puede encontrar materiales sueltos/tienda/recompensas si hay
//       una razón narrativa, pero eso NO concede XP profesional.
//     · Los drops automáticos se reservan para consumibles terminados, tesoros,
//       manuales y recursos ambientales que no sustituyan una intervención.
//
//  2) RITMO DE NOVICIO
//     · Examen y Herboristería usan +2 por primera especie y +1 por primer
//       procedimiento. Con el catálogo actual, un recorrido superficial queda
//       claramente por debajo de 50 XP; repetir/estudiar varias fuentes empuja
//       al jugador atento hacia Novicio sin exigir farmeo de una sola especie.
//     · No aumentar esos bonos para acelerar contenido nuevo. Si falta XP, se
//       agrega variedad útil (especie/procedimiento) o se revisa el recorrido.
//
//  3) DISPONIBILIDAD DE INGREDIENTES
//     · Ingredientes de recetas SENCILLA/NORMAL deben tener al menos una fuente
//       razonablemente repetible. Un material usado por varias recetas normales
//       no debe depender de un único procedimiento de 25–40% salvo que exista
//       una segunda fuente deliberada.
//     · Ingredientes de recetas DIFÍCIL/MUY DIFÍCIL sí pueden depender de nodos
//       únicos, procedimientos difíciles, enemigos peligrosos o tiempos largos.
//     · Añadir nodos o enemigos es una decisión económica: comprobar primero
//       cuántos crafts adicionales por ciclo habilita.
//
//  4) ALQUIMIA Y XP
//     · `estadoReceta.validas` cuenta elaboraciones YA completadas. Al calcular
//       la siguiente XP se usa validas+1. Esto mantiene exactamente 100/75/40/
//       15/0 para 1ª/2ª/3ª–5ª/6ª–10ª/11ª+.
//     · Calidad y XP siguen separadas. No compensar escasez de materiales con
//       XP inflada ni compensar XP lenta aumentando el drop de recursos.
//
//  5) AUDITORÍA ANTES DE PUBLICAR CONTENIDO
//     · Toda receta nueva debe tener fuente real para CADA ingrediente.
//     · Todo material profesional nuevo debe tener un procedimiento declarado.
//     · Todo cambio de drop debe comprobar que no puentea Examen/Herboristería.
//     · Correr DIAGNOSTICO/GB.PRUEBAS.correr() y las pruebas `balance v8`.
// ============================================================================

const TIPOS_AFLICCION_PERSISTENTE = new Set(["veneno", "quemadura"]);

// Cada organización conserva su propio libro mayor. El saldo se gasta; el mérito
// histórico nunca disminuye y sirve para rangos, permisos y promociones.
const FACCION_PRINCIPAL = "grulla_blanca";
const FACCIONES = {
  grulla_blanca: {
    nombre: "Secta de la Grulla Blanca",
    tipo: "secta ortodoxa",
    rangos: [
      { id: "aspirante", nombre: "Aspirante sin tablilla", merito: 0 },
      { id: "servidor_externo", nombre: "Servidor externo", merito: 8 },
      { id: "discipulo_acreditado", nombre: "Discípulo acreditado", merito: 20 },
      { id: "merito_interno", nombre: "Mérito del patio interno", merito: 40 },
    ],
    servicios: {
      pocion: { nombre: "Poción de sangre", coste: 3, merito: 0, item: "pocion",
        descripcion: "Una medicina básica retirada del almacén de externos." },
      claridad: { nombre: "Hoja de claridad", coste: 4, merito: 8, item: "hierba_claridad",
        descripcion: "Material de estudio y alquimia reservado a quienes ya cumplieron una tablilla." },
      consolidacion: { nombre: "Píldora de consolidación", coste: 8, merito: 20, item: "pildora_consolidacion",
        descripcion: "Preparación para las puertas de LianQi; exige servicio acreditado." },
    },
  },
};

const VARIANTES_ALQUIMIA = {
  sangre: {
    impura: { id: "pocion_refinada_impura", cura: "2d4+2", impureza: 1 }, estable: { id: "pocion_refinada" },
    superior: { id: "pocion_refinada_superior", cura: "4d4+4", impureza: 0 }, excepcional: { id: "pocion_refinada_excepcional", cura: "4d4+6", impureza: 0 },
  },
  antidoto: {
    impura: { id: "antidoto_jade_impuro", cura_afliccion: { tipo:"veneno", familia:"jade", gradoMax:1 }, impureza:1 }, estable:{ id:"antidoto_jade" },
    superior:{ id:"antidoto_jade_superior" }, excepcional:{ id:"antidoto_jade_excepcional" },
  },
  purificacion: {
    impura: { id: "pildora_purificacion_impura", purifica: 1 }, estable: { id: "pildora_purificacion" },
    superior: { id: "pildora_purificacion_superior", purifica: 4 }, excepcional: { id: "pildora_purificacion_excepcional", purifica: 5 },
  },
  elixir: {
    impura: { id: "elixir_qi_impuro", recupera_qi: 12, impureza: 2 }, estable: { id: "elixir_qi" },
    superior: { id: "elixir_qi_superior", recupera_qi: 28, impureza: 0 }, excepcional: { id: "elixir_qi_excepcional", recupera_qi: 36, impureza: 0 },
  },
  ceniza: {
    impura:{ id:"balsamo_ceniza_impuro", cura_afliccion:{tipo:"quemadura",familia:"ceniza",gradoMax:1}, impureza:1 }, estable:{ id:"balsamo_ceniza" },
    superior:{ id:"balsamo_ceniza_superior" }, excepcional:{ id:"balsamo_ceniza_excepcional" },
  },
  meridianos: {
    impura: { id: "pildora_meridianos_impura", remienda: 1, impureza: 1 }, estable: { id: "pildora_meridianos" },
    superior: { id: "pildora_meridianos_superior", remienda: 1, purifica: 1 }, excepcional: { id: "pildora_meridianos_excepcional", remienda: 2, purifica: 1 },
  },
  lunar: {
    impura:{ id:"destilado_lunar_impuro", recupera_qi:10, impureza:1 }, estable:{ id:"destilado_lunar" },
    superior:{ id:"destilado_lunar_superior", recupera_qi:24, purifica:2 }, excepcional:{ id:"destilado_lunar_excepcional", recupera_qi:30, purifica:2 },
  },
  tempestad: {
    impura: { id: "elixir_tempestad_impuro", recupera_qi: 20, impureza: 1 }, estable: { id: "elixir_tempestad" },
    superior: { id: "elixir_tempestad_superior", recupera_qi: 45, impureza: 0 }, excepcional: { id: "elixir_tempestad_excepcional", recupera_qi: 55, impureza: 0 },
  },
};

for (const [rid, variantes] of Object.entries(VARIANTES_ALQUIMIA)) {
  const base = ITEMS[RECETAS[rid].resultado];
  for (const [calidad, datos] of Object.entries(variantes)) {
    if (datos.id === RECETAS[rid].resultado) {
      Object.assign(base, { calidad: CALIDADES_ALQUIMIA[calidad].nombre });
      continue;
    }
    ITEMS[datos.id] = {
      ...base, ...datos,
      name: `${base.name} · calidad ${CALIDADES_ALQUIMIA[calidad].nombre.toLowerCase()}`,
      calidad: CALIDADES_ALQUIMIA[calidad].nombre,
      desc: `${base.desc}\n(Lote de calidad ${CALIDADES_ALQUIMIA[calidad].nombre.toLowerCase()}, elaborado mediante los tres pulsos de la caldera.)`,
    };
    delete ITEMS[datos.id].id;
  }
}
