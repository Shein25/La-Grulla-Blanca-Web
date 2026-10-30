const SLOTS = ["mano", "torso", "cabeza", "piernas", "dedo", "cuello"];

// ---------- ITEMS · índice por categoría (42 objetos) ----------
// Agrupado por `tipo`/`slot`, no por acto: a diferencia de ROOMS y MOBS, un
// arco nuevo no suma una categoría nueva, normalmente suma objetos a estas
// mismas (o, si el arco trae un slot o tipo realmente nuevo, ese es el
// momento de agregar una fila acá).
//   equipo · mano (armas)     espada_madera, cuchillo_hueso, espada_hierro
//   equipo · torso            uniforme, uniforme_interno, tunica_reforzada
//   equipo · cabeza/piernas/  bandana_cuero, sandalias_viento,
//     cuello/dedo             amuleto_diente, anillo
//   consumibles                pocion, pocion_refinada, pildora_meridianos,
//                              elixir_tempestad, pildora_purificacion,
//                              elixir_qi
//   reliquias                  pildora_consolidacion, pildora_fundacion,
//                              perla_marea, pluma_celeste, corazon_grulla
//   materiales (crafteo)       hierba_claridad, raiz_sangre, musgo_lunar,
//                              polvo_nube, aguijon_jade, caparazon_hierro,
//                              pluma_tempestad

//   tesoros                    semilla_bifurcada, bolsa_piedras, bolsa_qian
//   manuales (enseñan una      manual_sello, manual_paso, manual_piel,
//     técnica de TECNICAS)     manual_filamento, manual_espejo,
//                              manual_lanza_nube, manual_circulo_ascuas,
//                              manual_lluvia_filos, manual_marea_circular,
//                              manual_tijera_vendaval
// ----------------------------------------------------------------------------

const ITEMS = {
anillo: {
    name: "anillo herrumbroso", tipo: "curiosidad", slot: "dedo", qi_med: 1,
    desc: "Un anillo de cobre barato, carcomido por la herrumbre y sin nada que destaque a primera vista. Aun así, cuesta dejarlo en el suelo; resulta extraño que haya permanecido allí, entre las hierbas, sin que nadie lo recogiera.\nAl fijar la vista, la herrumbre cae como escamas y una VOZ resuena dentro de tu cabeza:\n«Ah... un portador nuevo. Escucha, chico: MEDITA para llenar el vaso del qi. Lleno el vaso, la meditación CONSAGRA la etapa... si la puerta está abierta. Ah: el agua quieta enseña a quietarse.»\n(Llevado en el dedo, el viejo tararea el ritmo de tu respiración: +1 qi al meditar.)"
  },
espada_madera: {
    name: "espada de madera", slot: "mano", daño: "1d6", ataque: 0,
    desc: "Pino barato y ligero. Golpea más la fe del dueño que la madera del rival."
  },
cuchillo_hueso: {
    name: "cuchillo de hueso", slot: "mano", daño: "1d6", ataque: 1,
    desc: "Empuñadura de caña de hueso y hoja de sierra rehecha al fuego. Viene del callejero de Anling: no pregunta quién tiene razón, corta."
  },
espada_hierro: {
    name: "espada de hierro", slot: "mano", daño: "1d8", ataque: 1, precio: 25,
    desc: "Forjada para discípulos que ya no rompen las demás. No tiene lujo, pero sí la clase de dignidad que uno compra cuando deja de entrenar con juguetes."
  },
uniforme: {
    name: "uniforme de discípulo externo", slot: "torso", defensa: 1,
    desc: "Tela gris basta con una grulla bordada de manera torpe. Al ponértelo cuesta distinguirte de cualquiera de los demás."
  },
uniforme_interno: {
    name: "uniforme de discípulo interno", slot: "torso", defensa: 5,
    desc: "Seda blanca reforzada, ribete de jade y una grulla bordada con las alas abiertas. No solo protege: anuncia que la secta responderá por quien lo lleva... y que quien lo lleva responderá por la secta."
  },
tunica_reforzada: {
    name: "túnica reforzada", slot: "torso", defensa: 3, precio: 20,
    desc: "Seda tratada con alambre fino, flexible como piel y dura como cuero. Es la clase de compra que hace mirar la ropa vieja con un poco menos de cariño."
  },
bandana_cuero: {
    name: "bandana de cuero", slot: "cabeza", defensa: 1, precio: 8,
    desc: "Cuero del color del té fuerte. Sujeta el pelo, aparta el sudor y, con algo de suerte, recibe algún golpe despistado."
  },
sandalias_viento: {
    name: "sandalias de viento", slot: "piernas", defensa: 1, precio: 10,
    desc: "Paja trenzada para mensajeros de larga distancia. La montaña tiene muchos escalones y estas sandalias parecen haberlo entendido."
  },
amuleto_diente: {
    name: "amuleto de colmillo", slot: "cuello", ataque: 1,
    desc: "Un colmillo de lobo espiritual atado con cuerda de cuero. Todavía está tibio; los externos juran que muerde por ti."
  },
pocion: {
    name: "poción de sangre", tipo: "consumible", cura: "3d6+6", precio: 5,
    desc: "Un vial de rojo apagado que sabe a hierro y a ciruela. Cura deprisa, pero el qi barato deja un sedimento que el cuerpo no agradece. (impureza +1)"
  },
pildora_consolidacion: {
    name: "píldora de consolidación", tipo: "reliquia", precio: 8,
    desc: "Una pastilla oscura, sin brillo, del tamaño de una uña. No cura, no da qi: prepara al cuerpo para sostener más. Los externos la llaman «llave de alquiler».\n(Se consume al CONSAGRAR una etapa con el qi al tope.)"
  },
hierba_claridad: {
    name: "hoja de claridad", tipo: "material",
    desc: "Plateada y fría, zumba junto al oído sin descanso. Los escribas las mastican cuando llevan demasiado tiempo mirando letras."
  },
pildora_fundacion: {
    name: "Píldora de Fundación", tipo: "reliquia",
    desc: "Una esfera ámbar con una luz que gira dentro. Huele a trueno y a invierno, y pesa en la mano mucho más de lo que parece.\n(Se consume meditando con el qi al tope del tope.)"
  },
manual_sello: {
    name: "manual del Sello de la Montaña", tipo: "manual", tecnica: "sello",
    desc: "El pergamino es más viejo que la secta y la escritura está apretada hasta el borde. Enseña a oprimir el qi como oprime una montaña; no encaja con nada de lo que la secta enseña a sus externos.\n(Grado TIERRA: exige qi de reino ZhuJi. ÚSALO para aprender.)"
  },
manual_paso: {
    name: "manual del Paso de Nube Ligera", tipo: "manual", tecnica: "paso_nube", precio: 12,
    desc: "Diagramas de pies descalzos sobre nubes pintadas explican dónde poner cada paso. Enseña a dejar que el viento te preste su sitio sin hacer demasiadas preguntas.\n(ÚSALO para aprender.)"
  },
manual_piel: {
    name: "manual de Piel de Cobre", tipo: "manual", tecnica: "piel_cobre", precio: 12,
    desc: "Un tratado de forja aplicada a la carne, con dibujos y notas al margen. Explica cómo conseguir que el golpe que te alcance llegue cansado.\n(ÚSALO para aprender.)"
  },
manual_filamento: {
    name: "manual del Filamento de Agua", tipo: "manual", tecnica: "filamento", precio: 16,
    desc: "El hilo de qi aparece tensado en los dibujos como una cuerda de laúd. Enseña a enredar al enemigo y, con raíz de agua, hacerlo sin gastar de más.\n(ÚSALO para aprender.)"
  },
bolsa_piedras: {
    name: "bolsa lacrada de piedras espirituales", tipo: "tesoro", piedras: 12,
    desc: "Seda lacrada con doce piedras dentro: el salario de alguien que ya no lo necesita."
  },
manual_espejo: {
    name: "manual del Espejo de Luna", tipo: "manual", tecnica: "espejo_luna",
    desc: "Una hoja de plata flexible cubierta de respiraciones circulares. Enseña a hacer que el golpe enemigo se reconozca antes de llegar a tu cuerpo. (Grado TIERRA: exige ZhuJi.)"
  },
manual_lanza_nube: {
    name: "manual de la Lanza que Parte Nubes", tipo: "manual", tecnica: "lanza_nube",
    desc: "No hay lanza dibujada: solo una línea vertical que separa una montaña de un cielo vacío. Quien puede leerla aprende a convertir el qi en una decisión sin vuelta atrás. (Grado TIERRA: exige ZhuJi.)"
  },
manual_circulo_ascuas: {
    name: "manual del Círculo de las Cien Ascuas", tipo: "manual", tecnica: "circulo_ascuas",
    desc: "No son páginas ordinarias: la piel de ceniza del Sapo Caldera conserva tres círculos de respiración. Enseñan a dividir una llama sin debilitarla y a lanzarla contra todos los enemigos trabados. Hace daño completo a grupos, pero pierde fuerza contra un objetivo solitario. (AOE · grado TIERRA: exige ZhuJi.)"
  },
manual_lluvia_filos: {
    name: "manual de la Lluvia de los Mil Filos", tipo: "manual", tecnica: "lluvia_filos",
    desc: "Son placas del Rey Escarabajo unidas como un libro; cada muesca es parte de un diagrama defensivo leído al revés. El método fragmenta el qi metálico sobre todo el campo. Hace daño completo a grupos, pero pierde fuerza contra un objetivo solitario. (AOE · grado TIERRA: exige ZhuJi.)"
  },
manual_marea_circular: {
    name: "manual de la Marea de las Ocho Orillas", tipo: "manual", tecnica: "marea_circular",
    desc: "Una lámina de coral flexible se desprendió del guardián; el texto solo puede leerse haciéndola girar. La corriente que describe golpea a todos los hostiles y, al madurar, debilita sus ataques. Pierde fuerza contra un objetivo solitario. (AOE · grado TIERRA: exige ZhuJi.)"
  },
manual_tijera_vendaval: {
    name: "pliegue de la Tijera del Vendaval", tipo: "manual", tecnica: "tijera_vendaval",
    desc: "No hay tinta: dos plumas dobladas guardan los cortes de aire que la Mantis repitió durante décadas. Al desplegarlas, las corrientes forman un método para barrer un grupo entero desde ambos flancos. Contra un único objetivo conserva solo parte de su fuerza. (AOE · grado TIERRA: exige ZhuJi.)"
  },
grasa_qi_roida: {
    name: "grasa de qi roído", tipo: "material",
    desc: "Una pequeña bolsa de grasa translúcida saturada por el qi que la rata robó de granos y reservas. Conserva energía pobre, pero estable."
  },
membrana_serpentina: {
    name: "membrana meridiana serpentina", tipo: "material",
    desc: "Una película verdosa recorrida por canales finísimos. El veneno circulaba por ellos sin tocar el resto de la carne."
  },
medula_viento: {
    name: "médula de viento", tipo: "material",
    desc: "Médula ligera extraída de una bestia de tres colas. Vibra al acercarla a una corriente de aire espiritual."
  },
tendon_tres_colas: {
    name: "tendón de las tres colas", tipo: "material",
    desc: "Tres fibras que parecen una sola hasta que reciben qi. Los movimientos del lobo dejaron memoria de coordinación en su tensión."
  },
camara_jade: {
    name: "cámara de jade", tipo: "material",
    desc: "Una vesícula verde y dura del abdomen de la avispa. Regula la presión de su toxina antes de enviarla al aguijón."
  },
vesicula_medicinal: {
    name: "vesícula medicinal", tipo: "material",
    desc: "Un pequeño saco endurecido por años de ingerir píldoras robadas. Conserva residuos distintos sin mezclarlos por completo."
  },
glandula_termica: {
    name: "glándula térmica", tipo: "material",
    desc: "Órgano oscuro que almacena calor espiritual sin quemar los tejidos que lo rodean. Late todavía unos instantes después de extraído."
  },
saco_hollin: {
    name: "saco de hollín espiritual", tipo: "material",
    desc: "Una bolsa pulmonar ennegrecida donde el sapo filtra ceniza caliente. El polvo de su interior sigue formando remolinos diminutos."
  },
membrana_ferrea: {
    name: "membrana férrea", tipo: "material",
    desc: "Una lámina flexible situada bajo el caparazón rígido. Se dobla como cuero y recupera su forma con un chasquido metálico."
  },
fluido_lunar: {
    name: "fluido lunar", tipo: "material",
    desc: "Líquido pálido de la cavidad branquial de una criatura del sumidero. En la oscuridad refleja una luna que no está allí."
  },
branquia_lunar: {
    name: "filamento branquial lunar", tipo: "material",
    desc: "Un filamento casi blanco que separa agua, qi y sedimento con una precisión imposible para un tejido común."
  },
conducto_estelar: {
    name: "conducto estelar", tipo: "material",
    desc: "Un canal azulado de la anguila que conduce descargas sin carbonizar la carne. Conserva una chispa irregular."
  },
saco_residual_estelar: {
    name: "saco residual estelar", tipo: "material",
    desc: "Pequeña bolsa donde la anguila acumula el sedimento que no puede descargar. Su contenido pulsa como una estrella enferma."
  },
fibra_tempestad: {
    name: "fibra de tempestad", tipo: "material",
    desc: "Fibra profunda del ala de un halcón de tormenta. No es una pluma: es la estructura que distribuye el impulso eléctrico del vuelo."
  },
saco_pulmonar_tormenta: {
    name: "saco pulmonar de tormenta", tipo: "material",
    desc: "Una cámara respiratoria capaz de comprimir aire cargado de qi antes de un picado. Todavía cruje con electricidad seca."
  },
bolsa_niebla: {
    name: "bolsa de niebla", tipo: "material",
    desc: "Una membrana casi invisible que impide que el cuerpo del devorador se disperse por completo. Dentro, la niebla se mueve contra el viento."
  },
sedimento_niebla: {
    name: "sedimento de niebla", tipo: "material",
    desc: "Cristales húmedos formados en el punto donde la niebla del devorador se vuelve suficientemente densa como para fingir un órgano."
  },
brasa_visceral: {
    name: "brasa visceral", tipo: "material",
    desc: "Una concreción rojiza del horno interno del Sapo Caldera. No es un núcleo: es tejido mineralizado alrededor de una fuente de calor persistente."
  },
condensado_toracico: {
    name: "condensado torácico férreo", tipo: "material",
    desc: "Una masa compacta formada entre las placas internas del Rey Escarabajo. Concentra presión y qi metálico sin ser un núcleo espiritual."
  },
filamento_cortante: {
    name: "filamento cortante", tipo: "material",
    desc: "Hebra dorsal de la mantis que transmite tensión a sus cuchillas. Incluso inmóvil deja una línea fina sobre la madera."
  },
lamina_coral_memoriosa: {
    name: "lámina de coral memoriosa", tipo: "material",
    desc: "Una lámina flexible del guardián de coral. Cambia ligeramente de curvatura al repetir cerca de ella un movimiento de qi."
  },
filamento_pluma_sello: {
    name: "filamento de pluma sellada", tipo: "material",
    desc: "Una fibra arrancada de los restos del centinela. Conserva la tensión de una formación defensiva aunque la criatura ya no responda."
  },
raiz_sangre: {
    name: "raíz de sangre", tipo: "material",
    desc: "Una raíz roja que palpita cuando toca qi fresco. Los alquimistas la usan para convencer al cuerpo de que todavía quiere cerrarse."
  },
musgo_lunar: {
    name: "musgo lunar", tipo: "material",
    desc: "Musgo pálido nacido bajo agua sin sol. Absorbe residuos espirituales y deja los dedos fríos durante horas."
  },
petalo_ceniza: {
    name: "pétalo de ceniza", tipo: "material",
    desc: "Pétalo gris rojizo que conserva un calor seco. Los alquimistas lo usan para conducir reacciones térmicas sin alimentar una llama abierta."
  },
caliz_ceniza: {
    name: "cáliz de ceniza", tipo: "material",
    desc: "Base endurecida de una flor de ceniza. Guarda más calor que los pétalos y tarda días en enfriarse por completo."
  },
rocio_niebla: {
    name: "rocío de niebla", tipo: "material",
    desc: "Gotas lechosas recogidas de una orquídea de altura. Mantienen esencias incompatibles suspendidas durante unos instantes preciosos."
  },
orquidea_niebla: {
    name: "orquídea de niebla", tipo: "material",
    desc: "Flor completa de pétalos translúcidos. Al arrancarla, la niebla que la alimentaba queda atrapada entre sus venas."
  },
fibra_jade: {
    name: "fibra de jade", tipo: "material",
    desc: "Filamento vegetal verde y resistente. No aporta un efecto fuerte por sí mismo: mantiene unidos compuestos que de otro modo se separarían."
  },
hongo_medula: {
    name: "hongo de médula", tipo: "material",
    desc: "Tejido fúngico blanco que crece donde raíces antiguas concentran nutrientes y qi. Se usa en preparaciones de recuperación prolongada."
  },
medula_fungica: {
    name: "médula fúngica", tipo: "material",
    desc: "Corazón esponjoso de un hongo de médula maduro. Al cortarlo exuda una savia espesa cargada de esencia nutritiva."
  },
semilla_trueno: {
    name: "semilla del trueno", tipo: "material",
    desc: "Semilla oscura que chisporrotea cuando se acerca al qi. Funciona como catalizador energético en preparaciones que no toleran una circulación lenta."
  },
polvo_nube: {
    name: "polvo de nube", tipo: "material",
    desc: "Un puñado de niebla reducida a granos. Intenta escapar entre los dedos y huele a lluvia sobre piedra caliente."
  },
aguijon_jade: {
    name: "aguijón de jade", tipo: "material",
    desc: "Una aguja verde traslúcida. Conserva veneno suficiente para matar y estructura suficiente para que un alquimista lo convierta en remedio."
  },
caparazon_hierro: {
    name: "placa de caparazón férreo", tipo: "material",
    desc: "Una lámina negra arrancada de un escarabajo espiritual. Molida con musgo lunar, ayuda a mantener abiertos los meridianos dañados."
  },
pluma_tempestad: {
    name: "pluma de tempestad", tipo: "material",
    desc: "Una pluma gris que levita un dedo sobre la palma. Guarda un relámpago pequeño y de pésimo carácter."
  },
antidoto_jade: {
    name: "antídoto de jade menor", tipo: "consumible", cura_afliccion: { tipo: "veneno", familia: "jade", gradoMax: 1 },
    desc: "Una medicina verde y translúcida preparada a partir de toxina de jade estabilizada. Trata venenos de la familia jade hasta grado I sin afectar toxinas de otras familias."
  },
balsamo_ceniza: {
    name: "bálsamo de ceniza fría", tipo: "consumible", cura_afliccion: { tipo: "quemadura", familia: "ceniza", gradoMax: 1 },
    desc: "Ungüento gris que roba calor al contacto. Trata quemaduras de la familia ceniza hasta grado I sin apagar lesiones de otras familias."
  },
destilado_lunar: {
    name: "destilado lunar", tipo: "consumible", recupera_qi: 18, purifica: 1, impureza: 0,
    desc: "Un líquido pálido que devuelve qi y arrastra parte del sedimento espiritual sin forzar los meridianos."
  },
pocion_refinada: {
    name: "poción de sangre refinada", tipo: "consumible", cura: "3d4+4", impureza: 0,
    desc: "Roja y limpia, sin sedimento en el fondo. Cura entre 7 y 16 de vida sin añadir impurezas; preparar una exige alquimia, no solo hervir raíces."
  },
pildora_meridianos: {
    name: "píldora de remiendo meridiano", tipo: "consumible", remienda: 1,
    desc: "Musgo lunar y caparazón férreo trenzados en una píldora gris. Repara una herida de meridiano fuera o dentro del combate."
  },
elixir_tempestad: {
    name: "elixir de tempestad menor", tipo: "consumible", recupera_qi: 35, impureza: 0,
    desc: "Polvo de nube suspendido alrededor de una pluma eléctrica. Repone hasta 35 de qi sin dejar impurezas."
  },
pildora_purificacion: {
    name: "píldora de purificación", tipo: "consumible", purifica: 3,
    desc: "Una esfera blanca cruzada por vetas azules. Destila hasta tres niveles de impureza sin curar heridas."
  },
elixir_qi: {
    name: "elixir de qi menor", tipo: "consumible", recupera_qi: 20, impureza: 1,
    desc: "Líquido dorado que repone hasta 20 de qi. La energía apresurada deja una impureza al asentarse."
  }
};

function statsItem(mid) {
  const it = ITEMS[mid];
  if (!it) return "";
  const out = [];
  if (it.slot) out.push(it.slot);
  if (it.daño) out.push("daño " + dadoARango(it.daño));
  if (it.ataque) out.push("+" + it.ataque + " ataque");
  if (it.defensa) out.push("+" + it.defensa + " defensa");
  if (it.qi_med) out.push("+" + it.qi_med + " qi al meditar");
  if (it.cura) out.push("cura " + dadoARango(it.cura));
  if (it.recupera_qi) out.push(`recupera hasta ${it.recupera_qi} qi`);
  if (it.purifica) out.push(`purifica ${it.purifica} impureza${it.purifica === 1 ? "" : "s"}`);
  if (it.remienda) out.push(`repara ${it.remienda} herida${it.remienda === 1 ? "" : "s"} meridiana${it.remienda === 1 ? "" : "s"}`);
  if (it.cura_afliccion) out.push(`trata ${it.cura_afliccion.tipo} · familia ${it.cura_afliccion.familia} · grado ≤${it.cura_afliccion.gradoMax}`);
  if (it.calidad) out.push(`calidad ${it.calidad.toLowerCase()}`);
  if (it.tipo === "manual" && it.tecnica && TECNICAS[it.tecnica]) {
    const t = TECNICAS[it.tecnica];
    out.push("enseña: " + t.name + " · rango " + t.rango);
  }
  if (it.piedras) out.push("contiene " + it.piedras + " piedras");
  if (it.precio) out.push("precio " + it.precio + " piedras");
  return out.join(" · ");
}

function statsCortos(mid) {
  const it = ITEMS[mid];
  if (!it) return "";
  const out = [];
  if (it.daño) out.push("daño " + dadoARango(it.daño));
  if (it.ataque) out.push("+" + it.ataque + " atk");
  if (it.defensa) out.push("+" + it.defensa + " def");
  if (it.qi_med) out.push("+" + it.qi_med + " qi/meditar");
  return out.join(" · ");
}

function agruparObjetos(ids) {
  const grupos = new Map();
  for (const mid of ids || []) {
    if (!grupos.has(mid)) grupos.set(mid, { mid, cantidad: 0 });
    grupos.get(mid).cantidad++;
  }
  return [...grupos.values()];
}

function nombreCantidad(mid, cantidad) {
  const nombre = ITEMS[mid] ? ITEMS[mid].name : mid;
  return cantidad > 1 ? `${nombre} (${cantidad})` : nombre;
}
