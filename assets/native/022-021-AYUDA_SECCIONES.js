const AYUDA_SECCIONES = [
  { nombre: "Comandos básicos", alias: ["comandos", "basicos"], texto: `
mirar [cosa, persona, criatura o mercancía] · inventario · estado / hoja · equipo
n / s / e / o (o "ir norte") · tomar <cosa> · tirar/soltar <cosa>
equipar <cosa> · desequipar <cosa> · beber <cosa> · usar <manual/diario>
guardar · cargar · salir
Los objetos tirados permanecen en su sala durante 500 turnos; MIRAR muestra el tiempo restante.` },

  { nombre: "Comunicación y comercio", alias: ["comunicacion", "npc", "comercio", "tienda", "hablar"], texto: `
hablar <npc> · entregar <npc> (alias: dar) · tienda · comprar <cosa> · canjear <servicio> · servicios · contribucion
— HABLAR abre lo que ese personaje tenga para decir; si además le debes un encargo listo, se cierra ahí mismo.
— HABLAR admite nombres abreviados cuando sólo coinciden con un NPC presente (ej.: HABLAR TAO). Si hay uno solo, basta HABLAR.

— ENTREGAR fuerza esa entrega sin pasar por la charla, y te dice en su voz si todavía no completaste el encargo
    o si no le debes nada.
— TIENDA y COMPRAR funcionan con quien tenga mercancía a mano; no todos venden.
— SERVICIOS y CANJEAR gastan tu CONTRIBUCIÓN con la facción; el saldo es por facción, no global.
— Herboristería general está disponible. Las enseñanzas institucionales quedan pendientes de 3C.
— cada sala tiene su VENA de qi; la vena se AGOTA si insistes
    (DESCANSAR airea la vena local; pelear o DORMIR las renueva); una vena agotada no cura.
— una zona SALVAJE puede interrumpir una absorción válida, pero la fauna respeta
    sus propios tiempos: repetir MEDITAR no garantiza ni acelera reapariciones.
— el vaso crece por etapa (25/45/75/110), pero las PUERTAS de etapa
    piden su precio: píldoras de consolidación y
    logros (combate, comprensión). El panel CULTIVO te muestra qué falta.
— tras CONSAGRAR etapa, el cuerpo queda tierno (vida al 60%): DORMIR en una cama o buscar cuidados especializados.
— PROFUNDO = doble qi con riesgo; pociones dejan impureza
    (dormir en un alojamiento seguro reduce la impureza).
— un único injerto de raíz secundaria es posible: exige método, semilla y preparación.
    Esta función aún no está disponible en la fase estructural actual.` },

  { nombre: "Reposo", alias: ["descansar", "dormir"], texto: `
descansar · dormir (solo con cama)
— DESCANSAR recupera 25% de vida y exige 6 acciones de actividad.
— DORMIR exige una cama: cura toda la vida, recupera 50% del qi máximo
    y exige 10 acciones; con 25% de vida o menos permite reposo de emergencia.
— caminar, combatir y cultivar cuentan; consultar menús o fallar comandos no.` },

  { nombre: "Combate y técnicas", alias: ["combate", "tecnica", "tecnicas", "pelea"], texto: `
atacar <criatura> · defender · tecnica <nombre> · huir      (en combate)
ofensivas: palma · filo · latigo · sello · lanza (grado Tierra, ZhuJi)
AOE: circulo ascuas · lluvia filos · marea circular · tijera vendaval (golpean a todos;
     contra un solo objetivo conservan 65% del daño)
esquiva: paso · guardia: piel · espejo · respiracion horno (grado Tierra) · control: filamento
— DEFENDER es universal: reduce el daño de los dos próximos golpes que te alcancen (~35–50% el primero,
    ~25–40% el segundo; un ataque que falla no lo gasta) y absorbe qi según la reserva del enemigo
    (20% de su qi, limitado por lo que te falte a ti).
— las técnicas de ABSORCIÓN (piel, respiración horno, coraza) son una burbuja con reserva de daño: sólo se
    gastan con el daño que absorben, no por rondas, y se disipan cuando la reserva llega a 0. Evasión y
    fortificación (defensa plana) sí duran un número de rondas.
— el control debe acertar y luego entra en enfriamiento; los jefes sólo pierden
    una acción y obtienen Tenacidad durante 2 rondas. Si resisten, no reciben ningún efecto.
— maestría Mortal por uso legítimo: raíz principal 90%, raíz injertada 70%, otras técnicas 50%.
    Práctica excepcional ×1,25 (máximo 100%); repetición trivial ×0,25.
    Progreso acumulado: 5 Iniciada→Menor, 12 Menor→Mayor, 24 Mayor→Consumada.
    Una práctica válida puede otorgar +1 o +0; consultá TÉCNICAS para ver el progreso real.
— CONCORDANCIA: dos artes puras seguidas contra el mismo rival forman una secuencia. El bono es
    porcentual (12% más de daño, 5% más de crítico o 15% del coste devuelto en qi) y las técnicas que no
    atacan ganan 25% más de efecto (mínimo 1 punto; la duración no cambia). Al completarse, la cadena se reinicia.
— DEFINITIVAS (artes híbridas): cuestan más qi y golpean más fuerte por lanzamiento. Reciben la concordancia
    con cualquiera de sus elementos, pero no preparan otra, y contra un rival usan su mejor elemento.
— AFINIDAD detalla secuencias, Definitivas, inestabilidad y el injerto de una segunda raíz.
— todos los monstruos normales pueden desplazarse dentro de su área; solo jefes y entidades únicas permanecen inmóviles.
— si hay más de un hostil en la sala, cada uno tiene 10% por ronda de
    sumarse solo; una técnica AOE los arrastra a todos inmediatamente.
— "atacar <nombre>" cambia de objetivo (consume el turno, no ataca ese
    round). Si hay dos iguales, usa el número: "atacar avispa 2". Todos los
    enemigos ya trabados siguen respondiendo mientras cambias de objetivo.
TÉCNICAS abre el Mapa de Meridianos: maestrías, formas y puntos universales. Consultar no consume turnos.
    Dentro del árbol, un clic sobre un cauce lo compara con tu forma actual; doble clic lo invierte directamente.` },

  { nombre: "Secta y Dao", alias: ["secta", "dao", "merito", "prestigio", "promocion"], texto: `
contribucion · dao · afinidad · promocion
— las misiones conceden CONTRIBUCIÓN disponible y el mismo MÉRITO histórico.
    El saldo se gasta en SERVICIOS; el mérito nunca baja y abre rangos y promociones.
— cada facción conserva su propio registro: los puntos no se transfieren entre sectas.
    CONTRIBUCION muestra afiliación, rango, saldo, mérito y movimientos recientes.
— tus actos cambian PRESTIGIO y vínculos, valores distintos del servicio oficial.
— DAO muestra las huellas morales que afectarán futuros cuellos de botella.
— la calidad de Fundación se decide al alcanzar ZhuJi según comprensión,
    impurezas, combates y decisiones.
— PROMOCION aún no está disponible en la fase estructural actual.` },

  { nombre: "Oficios y alquimia", alias: ["oficios", "alquimia", "recoleccion", "herboristeria", "examen"], texto: `
oficios · extraer [n/cuerpo] · recolectar [n/planta] · cosechar · recetas · alquimia [receta] · caldero [receta]
— Herboristería general está disponible; las demás enseñanzas institucionales quedan pendientes de 3C.
— EXTRACCIÓN ESPIRITUAL: EXTRAER abre únicamente un cuerpo presente en «Restos:», uno a la vez.
    Si hay varios en la sala, indica cuál por nombre o número (EXTRAER serpiente · EXTRAER 2).
    Al abrirlo se registran sus estructuras sin gastar turno ni dar XP; fallar una
    extracción da 0 XP y arruina sólo esa estructura. Los objetos de «Ves:» nunca entran aquí.
— HERBORISTERÍA ESPIRITUAL: RECOLECTAR abre únicamente una planta de «Plantas:», una a la vez.
    Si hay varias en la sala, indica su nombre o número. Cada parte tiene su
    dificultad y su tiempo de recuperación; una extracción destructiva obliga a
    regenerarse a toda la planta. Examinar y fallar dan 0 XP.
— en Examen y Herboristería sólo un procedimiento exitoso enseña oficio. Objetos
    sueltos, botín, tiendas y recompensas sirven como materiales pero NO dan XP profesional.
— cada procedimiento tiene dificultad propia. Iniciado reconoce la dificultad;
    Novicio estima porcentajes y recibe una pequeña mejora de ejecución.
— ALQUIMIA usa cualquier room con estación alquímica habilitada. Elige fuego, circulación y sellado leyendo
    la pista de cada receta; los ingredientes se consumen sólo al completar los tres pulsos.
— el resultado puede fallar o salir IMPURO, ESTABLE, SUPERIOR o EXCEPCIONAL.
— dos fallos seguidos enseñan: la próxima elaboración recibe +2 de persistencia.
— FORJA e INSCRIPCIÓN pueden consultarse, pero permanecen selladas durante el Arco 1.
OFICIOS abre el Pabellón de las Cien Artes: rangos, bitácoras, materiales y elaboración. Consultar no consume turnos.` },

  { nombre: "Aflicciones persistentes", alias: ["aflicciones", "afliccion", "veneno", "venenos", "quemadura", "quemaduras"], texto: `
estado / hoja · beber <medicina compatible>
— VENENOS y QUEMADURAS pueden continuar después de terminar o abandonar un combate. ESTADO muestra su nombre y las acciones restantes.
— avanzan cuando pasa tiempo de verdad: caminar, combatir, meditar, descansar, dormir, intervenir un cadáver, recolectar una planta o completar una elaboración alquímica. Consultar MAPA, INVENTARIO, OFICIOS o AYUDA no las hace avanzar.
— fuera de combate una aflicción puede dejarte en 1 de vida, pero no rematarte; dentro de combate sí puede ser letal.
— cada aflicción tiene TIPO, FAMILIA y GRADO. Una medicina sólo cura si coincide con la familia y soporta ese grado o uno superior.
— Antídoto de Jade Menor trata Veneno de Jade I. Bálsamo de Ceniza Fría trata Quemadura de Ceniza I. No sirven contra familias distintas ni contra grados mayores.
— si intentas usar una medicina incompatible, el juego te avisa y NO la consume.
AYUDA AFLICCIONES vuelve a mostrar estas reglas sin gastar turno.` },

  { nombre: "Partidas", alias: ["guardar", "cargar"], texto: `
guardar · cargar · nueva
— botones GUARDAR (3 slots) · CARGAR · NUEVA. Autoguardado al
    moverte y al vencer. Al morir, (c)argar vuelve al último punto.` },

  { nombre: "Menús de consulta", alias: ["menus", "consultas", "mapa", "atlas", "misiones", "bestiario", "glosario"], texto: `
mapa · tecnicas · misiones · oficios · glosario
MAPA abre el Atlas de Jade: lugares, personas y criaturas descubiertos. No consume turnos.
El BESTIARIO sólo revela un botín y su porcentaje después de que esa criatura te lo haya dejado.
TÉCNICAS abre el Mapa de Meridianos: maestrías, formas y puntos universales. Consultar no consume turnos.
MISIONES abre el Registro del Destino: encargos, rumores, progreso y pistas ya descubiertas. No consume turnos.
OFICIOS abre el Pabellón de las Cien Artes: rangos, materiales y elaboración. Consultar no consume turnos.
GLOSARIO explica los términos del mundo (qi, raíz, meridianos...) sin depender del contexto.` },

  { nombre: "Impurezas", alias: ["impureza"], condicion: "impurezas" },
  { nombre: "Heridas meridianas", alias: ["herida", "heridas", "meridianos heridos"], condicion: "heridas" },

  { nombre: "Consejos", alias: ["tips", "trucos"], texto: `
— MIRA todo lo nombrable; los daños se muestran como rangos (2–5).
— la montaña recuerda: si una placa te dice un nombre, pregúntale a la gente.
— lo que hagas... el corazón lo recuerda. Y lo viste.` },
];

function normalizarAyuda(s) {
  return quitaAcentos(String(s).toLowerCase()).trim();
}

// Busca una sección por número o por nombre/alias. Coincidencia exacta primero;
// si no hay ninguna, prueba con un prefijo único ("comb" -> "combate y técnicas").
// Si el prefijo es ambiguo devuelve la lista de candidatas en vez de adivinar.
function buscarSeccionAyuda(consulta) {
  const c = normalizarAyuda(consulta);
  const numero = Number(c);
  if (Number.isInteger(numero) && numero >= 1 && numero <= AYUDA_SECCIONES.length) {
    return { seccion: AYUDA_SECCIONES[numero - 1] };
  }
  const claves = sec => [sec.nombre, ...(sec.alias || [])].map(normalizarAyuda);
  const exacta = AYUDA_SECCIONES.find(sec => claves(sec).includes(c));
  if (exacta) return { seccion: exacta };
  const prefijo = AYUDA_SECCIONES.filter(sec => claves(sec).some(k => k.startsWith(c) || c.startsWith(k)));
  if (prefijo.length === 1) return { seccion: prefijo[0] };
  if (prefijo.length > 1) return { candidatas: prefijo };
  return {};
}

// Auditor de AYUDA: mismo espíritu que auditarRamas(). Corre solo al cargar
// y desde DIAGNOSTICO, para que un alias repetido o una sección sin salida
// se note antes de que el jugador escriba AYUDA y reciba una respuesta rota.
function auditarAyuda() {
  const fallos = [];
  const vistos = new Map();
  AYUDA_SECCIONES.forEach((sec, i) => {
    if (!sec.nombre) fallos.push(`sección ${i + 1}: no tiene nombre`);
    if (!sec.texto && !sec.condicion) fallos.push(`«${sec.nombre}»: no tiene texto ni condición asociada`);
    for (const clave of [sec.nombre, ...(sec.alias || [])].map(normalizarAyuda)) {
      if (vistos.has(clave)) fallos.push(`«${clave}» se repite entre «${vistos.get(clave)}» y «${sec.nombre}»`);
      vistos.set(clave, sec.nombre);
    }
    // Cada sección debe poder recuperarse por su propio índice y por su primer alias.
    const porNumero = buscarSeccionAyuda(String(i + 1));
    if (porNumero.seccion !== sec) fallos.push(`«${sec.nombre}»: AYUDA ${i + 1} no la encuentra`);
    if (sec.alias && sec.alias[0]) {
      const porAlias = buscarSeccionAyuda(sec.alias[0]);
      if (porAlias.seccion !== sec) fallos.push(`«${sec.nombre}»: su alias "${sec.alias[0]}" no la encuentra`);
    }
  });
  return fallos;
}

// Auditor de misiones: mismo espíritu que auditarRamas()/auditarAyuda().
// Corre solo al cargar y desde DIAGNOSTICO. Existe para que una misión nueva
// no quede con una descripción de una sola línea mecánica ni con una entrega
// muda — que fue exactamente el problema que motivó este auditor. Ver la
// guía de estilo escrita arriba de QUESTS antes de agregar una misión.
function auditarMisiones() {
  const fallos = [];
  for (const [qid, q] of Object.entries(QUESTS)) {
    const etiqueta = q.nombre || qid;
    if (!q.nombre) fallos.push(`«${qid}»: no tiene nombre`);
    if (!q.desc) fallos.push(`«${etiqueta}»: no tiene desc`);
    if (!q.lore) fallos.push(`«${etiqueta}»: no tiene lore`);
    else if (typeof q.lore === "string" && q.lore.length < 200) {
      fallos.push(`«${etiqueta}»: lore muy corto (${q.lore.length} caracteres). Apunta a 3+ oraciones con un detalle propio del mundo, no una línea mecánica.`);
    }
    if (!q.objetivo) fallos.push(`«${etiqueta}»: no tiene objetivo`);
    if (!q.recompensaTexto) fallos.push(`«${etiqueta}»: no tiene recompensaTexto`);
    if (q.entrega && !q.entregaPropia) {
      if (!q.frase) {
        fallos.push(`«${etiqueta}»: tiene NPC de entrega pero no "frase" de turn-in (si la narra a mano en el diálogo, marcala con entregaPropia:true)`);
      } else if (typeof q.frase === "string" && q.frase.length < 20) {
        fallos.push(`«${etiqueta}»: la frase de entrega es demasiado corta para ser una reacción real`);
      }
    }
  }
  return fallos;
}

// Paleta única de acento por elemento/qi. La usan tanto RECOLECTAR
// (colorEspecieHerboristeria, por especie de planta) como EXTRAER
// (colorQiOficio, por elemento del cuerpo): un solo mapa de verdad para que
// ambas ventanas queden siempre visualmente unificadas.
const PALETA_QI_OFICIO = Object.freeze({
  agua: "#82b7c8", claridad: "#82b7c8", niebla: "#8fbfd0",
  viento: "#8fc6a3", jade: "#7ecb8c", madera: "#7ecb8c", veneno: "#7ecb8c",
  tierra: "#b9aa7d", medula: "#b9aa7d",
  fuego: "#d36b58", sangre: "#d36b58", ceniza: "#d58b63",
  metal: "#d9d0bd", lunar: "#9fd6c1", trueno: "#baa5ca", rayo: "#baa5ca",
  mixta: "#c8afd8",
});

const ASTRA_NATIVE_IDENTITY=(function createIdentitySchema(canonicalIds){
 const ids=Object.freeze([...canonicalIds]);
 const fail=code=>{const error=new TypeError(code);error.code=code;throw error;};
 if(ids.length!==32||new Set(ids).size!==32)fail('R1_IDENTITY_CANONICAL_CATALOGUE');
 const emptyIdentity=()=>Object.freeze({version:1,npcIds:Object.freeze([])});
 function validateIdentity(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||![Object.prototype,null].includes(Object.getPrototypeOf(raw)))fail('R1_IDENTITY_RECORD');
  const keys=Reflect.ownKeys(raw);
  if(keys.length!==2||!keys.includes('version')||!keys.includes('npcIds'))fail('R1_IDENTITY_FIELDS');
  const v=Object.getOwnPropertyDescriptor(raw,'version'),d=Object.getOwnPropertyDescriptor(raw,'npcIds');
  if(!Object.hasOwn(v,'value')||!Object.hasOwn(d,'value')||!v.enumerable||!d.enumerable)fail('R1_IDENTITY_ACCESSOR');
  if(v.value!==1)fail('R1_IDENTITY_VERSION');
  const a=d.value;if(!Array.isArray(a))fail('R1_IDENTITY_ARRAY');
  const length=Object.getOwnPropertyDescriptor(a,'length')?.value,ak=Reflect.ownKeys(a);
  if(!Number.isSafeInteger(length)||length>32||ak.length!==length+1)fail('R1_IDENTITY_BOUND');
  const selected=[];
  for(let i=0;i<length;i++){
   const entry=Object.getOwnPropertyDescriptor(a,String(i));
   if(!entry||!Object.hasOwn(entry,'value')||!entry.enumerable)fail('R1_IDENTITY_ACCESSOR');
   if(typeof entry.value!=='string'||!ids.includes(entry.value))fail('R1_IDENTITY_ID');
   if(selected.includes(entry.value))fail('R1_IDENTITY_DUPLICATE');selected.push(entry.value);
  }
  return Object.freeze({version:1,npcIds:Object.freeze(selected)});
 }
 function projectIdentity(game){
  const d=Object.getOwnPropertyDescriptor(game,'playerIdentityKnowledge');
  if(!d)return emptyIdentity();if(!Object.hasOwn(d,'value'))fail('R1_IDENTITY_ACCESSOR');
  return validateIdentity(d.value);
 }
 function knowsIdentity(game,id){if(!ids.includes(id))fail('R1_IDENTITY_ID');return projectIdentity(game).npcIds.includes(id);}
 function proposeIdentity(raw,id){
  const p=validateIdentity(raw);if(!ids.includes(id))fail('R1_IDENTITY_ID');
  if(p.npcIds.includes(id))return Object.freeze({changed:false,state:p});
  const selected=new Set([...p.npcIds,id]);
  return Object.freeze({changed:true,state:validateIdentity({version:1,npcIds:ids.filter(x=>selected.has(x))})});
 }
 return Object.freeze({emptyIdentity,validateIdentity,projectIdentity,knowsIdentity,proposeIdentity,canonicalIdentityIds:()=>ids});
})(Object.keys(NPC_DEF));
