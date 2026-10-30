const TECNICAS = {
  palma: {
    name: "Palma Ardiente", corto: "Palma", rango: "mortal", elemento: "fuego", tipo: "ofensiva",
    coste: 7, daño: "2d6+2",
    flavor: ["La palma vibra con calor seco.", "La palma arrastra un reguero de brasas.",
             "El aire ondea a su paso, como sobre una fragua.", "El mundo chamusca por donde pasas."],
  },
  filo: {
    name: "Filo de Qi Metálico", corto: "Filo", rango: "mortal", elemento: "metal", tipo: "ofensiva",
    coste: 6, daño: "1d10+3",
    flavor: ["Un filo de qi parpadea en tu mano.", "El filo silba, fino como un cabello.",
             "El filo corta el aire antes que tú.", "Tu qi ya no corta: afronta."],
  },
  latigo: {
    name: "Látigo de Agua", corto: "Látigo", rango: "mortal", elemento: "agua", tipo: "ofensiva",
    coste: 6, daño: "2d6",
    flavor: ["El qi se alarga en un látigo húmedo.", "El látigo chasquea dos veces.",
             "El agua azota con peso de río.", "El látigo ya es marea."],
  },
  sello: {
    name: "Sello de la Montaña Oprimida", corto: "Sello", rango: "tierra", elemento: "tierra", tipo: "ofensiva",
    coste: 12, daño: "4d6+4",
    req: { reino: "ZhuJi" },
    flavor: ["Oprimes el qi como oprime una montaña.", "La tierra tiembla bajo tus pies.",
             "El sello cae con peso de colina.", "La montaña entera aprieta contigo."],
  },
  espejo_luna: {
    name: "Espejo de Luna", corto: "Espejo", rango: "tierra", elemento: "agua", tipo: "fortificacion",
    coste: 8, defensa: 4, duracion: 2, req: { reino: "ZhuJi" },
    flavor: ["Una luna fría se forma entre tú y el golpe.", "La luz devuelve al enemigo su propia violencia.",
             "El agua quieta aprende a cortar la corriente.", "No bloqueas: decides qué golpe merece existir."],
  },
  lanza_nube: {
    name: "Lanza que Parte Nubes", corto: "Lanza", rango: "tierra", elemento: "viento", tipo: "ofensiva",
    coste: 10, daño: "3d8+3", req: { reino: "ZhuJi" },
    flavor: ["Tu qi dibuja una línea recta hacia el cielo.", "La línea separa el aire en dos silencios.",
             "Una nube se parte antes de que la toques.", "El mundo recuerda que también puede ser atravesado."],
  },
  paso_nube: {
    name: "Paso de Nube Ligera", corto: "Paso", rango: "mortal", elemento: "viento", tipo: "esquiva",
    coste: 5, esquiva: 15, duracion: 2,
    flavor: ["Tus pies apenas rozan la arena.", "Un paso, y ya estás en otro sitio.",
             "El viento te presta su sitio.", "Ya no caminas: te colocas."],
  },
  piel_cobre: {
    name: "Piel de Cobre", corto: "Piel", rango: "mortal", elemento: "tierra", tipo: "guardia",
    coste: 5, guardia: 3, duracion: 2,
    flavor: ["Tu piel tira a bronce.", "El golpe que llegue, llegará cansado.",
             "Tu piel es yunque.", "El cobre recuerda al hierro."],
  },
  filamento: {
    name: "Filamento de Agua", corto: "Filamento", rango: "mortal", elemento: "agua", tipo: "control",
    coste: 6, atadura: 1,
    flavor: ["Un hilo de qi tensa el aire.", "El hilo aprieta antes de que lo vean.",
             "El agua se enreda como liana.", "Tu hilo es la corriente del río."],
  },
  circulo_ascuas: {
    name: "Círculo de las Cien Ascuas", corto: "Ascuas AOE", rango: "tierra", elemento: "fuego", tipo: "ofensiva",
    coste: 15, daño: "2d6+3", area: true, req: { reino: "ZhuJi" },
    flavor: ["Trazas un círculo y las ascuas buscan toda respiración hostil.",
             "El círculo se cierra como una flor encendida.",
             "Cada enemigo proyecta una sombra roja antes de arder.",
             "Cien ascuas responden a una sola apertura de tu palma."],
  },
  lluvia_filos: {
    name: "Lluvia de los Mil Filos", corto: "Filos AOE", rango: "tierra", elemento: "metal", tipo: "ofensiva",
    coste: 13, daño: "2d6+2", area: true, req: { reino: "ZhuJi" },
    flavor: ["Fragmentas tu qi en filos que caen sobre todo el campo.",
             "Los filos encuentran huecos entre cuerpos y respiraciones.",
             "Una bóveda de metal canta antes de precipitarse.",
             "El aire entero adquiere borde."],
  },
  marea_circular: {
    name: "Marea que Barre las Ocho Orillas", corto: "Marea AOE", rango: "tierra", elemento: "agua", tipo: "ofensiva",
    coste: 13, daño: "2d6+1", area: true, req: { reino: "ZhuJi" },
    flavor: ["Una marea circular nace bajo tus pies y no distingue flancos.",
             "La corriente golpea desde todas las direcciones a la vez.",
             "El campo de batalla se vuelve el fondo de un río.",
             "Ocho orillas se cierran sobre tus enemigos."],
  },
  tijera_vendaval: {
    name: "Tijera del Vendaval Partido", corto: "Vendaval AOE", rango: "tierra", elemento: "viento", tipo: "ofensiva",
    coste: 14, daño: "2d6+2", area: true, req: { reino: "ZhuJi" },
    flavor: ["Cruzas las manos y dos corrientes barren el campo desde extremos opuestos.",
             "El vendaval cierra sus hojas invisibles sobre cada presencia hostil.",
             "Los cortes del nido recuerdan cómo dividir una nube entera.",
             "El horizonte se abre y vuelve a cerrarse detrás de tus manos."],
  },
  respiracion_horno: {
    name: "Respiración del Cuerpo-Horno", corto: "Cuerpo-Horno", rango: "tierra", elemento: "fuego", tipo: "guardia",
    coste: 6, guardia: 2, duracion: 3, req: { reino: "ZhuJi" },
    flavor: ["La respiración desciende al vientre y cada hueso toma el calor de una caldera.",
             "Conviertes el impacto en combustible y lo repartes por el cuerpo.",
             "Tu carne no se endurece: aprende a cocinar el dolor.",
             "Eres horno, combustible y recipiente; el golpe llega tarde a los tres."],
  },
};

// Las artes híbridas requieren dos disciplinas ya asentadas, no dos raíces.
// DEFINITIVAS (v49): las híbridas son una categoría propia, no "una pura más débil".
//   · Pegan más fuerte por lanzamiento, pero rinden menos por qi (~1.4 de daño por qi
//     contra ~1.5–1.65 de Lanza y Sello). Lo que cuestan se decide en UN solo lugar:
//     RECARGO_DEFINITIVA, abajo. Por eso el literal declara `costeBase`, no `coste`.
//   · Reciben la concordancia con cualquiera de sus elementos, pero no preparan eco.
//   · Contra un rival usan el mejor de sus elementos para la ventaja elemental.
//   · `enfriamiento` (rondas) existe en todas y hoy vale 0. Es la carta de reserva si
//     las pruebas de balance muestran abuso: basta subir el número, sin tocar estructura.
Object.assign(TECNICAS, {
  brasa_vendaval: {
    name: "Brasa del Vendaval", corto: "Brasa híbrida", rango: "tierra", elementos: ["fuego", "viento"], tipo: "ofensiva",
    costeBase: 11, daño: "5d6+8", enfriamiento: 0, req: { reino: "ZhuJi" },
    flavor: ["El viento lleva una brasa hasta la abertura de la guardia.", "La llama dobla la esquina del golpe.", "El aire sostiene el fuego sin consumirse.", "Brasa y aliento eligen un solo camino."],
  },
  aguja_aluvial: {
    name: "Aguja del Río de Plata", corto: "Aguja híbrida", rango: "tierra", elementos: ["agua", "viento"], tipo: "ofensiva",
    costeBase: 10, daño: "5d6+5", enfriamiento: 0, req: { reino: "ZhuJi" },
    flavor: ["Una corriente de aire afila el agua.", "La aguja sigue una curva imposible.", "El río cabe en un hilo de viento.", "El golpe llega con la calma de la lluvia."],
  },
  coraza_crisol: {
    name: "Coraza del Crisol Sereno", corto: "Crisol híbrido", rango: "tierra", elementos: ["metal", "tierra"], tipo: "guardia",
    costeBase: 9, guardia: 5, duracion: 2, enfriamiento: 0, req: { reino: "ZhuJi" },
    flavor: ["El metal se asienta sobre cimientos de qi.", "Las placas reparten el impacto hacia el suelo.", "La coraza respira entre golpes.", "La montaña sostiene cada escama."],
  },
  loto_vapor: {
    name: "Loto de Vapor Concordante", corto: "Loto híbrido", rango: "tierra", elementos: ["agua", "fuego"], tipo: "ofensiva",
    costeBase: 12, daño: "5d6+9", enfriamiento: 0, req: { reino: "ZhuJi" },
    flavor: ["El agua y el fuego se encuentran fuera de tus meridianos.", "El vapor abre sus pétalos sobre el enemigo.", "La oposición encuentra un cauce común.", "El loto florece sin quemar sus raíces."],
  },
});

// Único número a tocar para encarecer o abaratar TODAS las Definitivas. Se cobra por
// cada elemento más allá del primero: una de 2 elementos paga +60%; con 3 elementos
// pagaría +120% (el coste sube más rápido que el daño, que se define por técnica).
const RECARGO_DEFINITIVA = 0.6;
function costeDefinitiva(costeBase, nElementos) {
  return Math.max(1, Math.round(costeBase * (1 + RECARGO_DEFINITIVA * Math.max(0, nElementos - 1))));
}
for (const t of Object.values(TECNICAS)) {
  if (!t.elementos) continue;
  t.definitiva = true;
  t.coste = costeDefinitiva(t.costeBase, t.elementos.length);
  t.enfriamiento = t.enfriamiento ?? 0;
}

// Lectura táctica en lenguaje natural. Las cifras exactas se generan desde el estado
// actual de la técnica para que las especializaciones nunca dejen obsoleta la ayuda.
const GUIA_TECNICAS = {
  palma: {
    proposito: "Daño sostenido de fuego contra un solo enemigo; con evolución puede dejarlo ardiendo.",
    uso: "Conviene en duelos largos, donde la quemadura dispone de varias rondas para hacer daño.",
    limite: "Debe impactar para causar daño y su quemadura; no controla al rival ni protege al usuario.",
  },
  filo: {
    proposito: "Ataque metálico de un objetivo, centrado en precisión y golpes críticos.",
    uso: "Conviene contra enemigos difíciles de acertar o cuando buscas un golpe limpio sin efectos que mantener.",
    limite: "Sólo alcanza a un blanco y no deja daño persistente ni reduce su capacidad de respuesta.",
  },
  latigo: {
    proposito: "Ataque de agua equilibrado que puede evolucionar hacia más daño o debilitar el ataque enemigo.",
    uso: "Conviene cuando necesitas seguir atacando mientras reduces el peligro de un rival fuerte.",
    limite: "Su debilitamiento depende de la evolución elegida y de que el golpe conecte.",
  },
  sello: {
    proposito: "Golpe de tierra muy poderoso contra un objetivo; su forma consumada puede clavarlo al suelo.",
    uso: "Conviene como remate contra enemigos resistentes o prioritarios cuando conservas bastante qi.",
    limite: "Su coste es alto, sólo golpea a un enemigo y una falla desperdicia una inversión importante de qi.",
  },
  espejo_luna: {
    proposito: "Fortificación de agua que suma Defensa plana durante varias rondas: cuanto más alta, más ataques enemigos fallan.",
    uso: "Conviene antes de soportar varios ataques o cuando necesitas ganar tiempo para curarte y reorganizarte.",
    limite: "No inflige daño al activarse ni reduce el daño de los golpes que consigan conectar; su efecto depende de las rondas que dure, no de los impactos.",
  },
  lanza_nube: {
    proposito: "Ataque de viento de gran daño contra un solo objetivo, con evoluciones orientadas a precisión y crítico.",
    uso: "Conviene para derribar rápidamente al enemigo más peligroso de un grupo.",
    limite: "No alcanza a los demás hostiles y exige una reserva de qi considerable.",
  },
  paso_nube: {
    proposito: "Técnica de movilidad que aumenta tu defensa durante varias rondas en lugar de absorber daño.",
    uso: "Conviene contra rivales precisos: hace que sus ataques fallen por completo mientras preparas otra acción.",
    limite: "No reduce un golpe que consiga alcanzarte y no causa daño al activarse.",
  },
  piel_cobre: {
    proposito: "Burbuja corporal que resta una cantidad fija al daño de cada golpe recibido hasta agotar su reserva.",
    uso: "Conviene contra grupos o criaturas que atacan repetidamente con golpes pequeños y medianos.",
    limite: "No evita el impacto ni causa daño; se gasta con el daño que absorbe, no con el paso de las rondas, y un ataque muy fuerte todavía atravesará parte de la protección.",
  },
  filamento: {
    proposito: "Arte de control que ata al objetivo y le impide actuar durante una o más rondas.",
    uso: "Conviene para interrumpir al enemigo principal, beber una poción o atacar sin recibir respuesta inmediata.",
    limite: "Debe superar una prueba de control y entra en enfriamiento. Los jefes sólo pierden una acción y después obtienen Tenacidad durante dos rondas.",
  },
  circulo_ascuas: {
    proposito: "Ataque de fuego en área que intenta alcanzar a todos los enemigos y puede quemarlos.",
    uso: "Conviene contra grupos numerosos, especialmente si sobrevivirán varias rondas a la quemadura.",
    limite: "Consume mucho qi y, contra un único enemigo, sólo conserva el 65% del daño que logre causar.",
  },
  lluvia_filos: {
    proposito: "Ataque metálico en área: lanza una tirada separada contra cada enemigo presente.",
    uso: "Conviene contra grupos numerosos y sus evoluciones permiten favorecer precisión, críticos o eficiencia.",
    limite: "Consume bastante qi y, contra un único enemigo, sólo conserva el 65% del daño que logre causar.",
  },
  marea_circular: {
    proposito: "Ataque de agua en área que golpea a todo el grupo y puede reducir el ataque de los supervivientes.",
    uso: "Conviene cuando varios enemigos seguirán vivos y necesitas disminuir la presión de sus respuestas.",
    limite: "Su daño individual es moderado, cuesta bastante qi y pierde fuerza cuando sólo queda un objetivo.",
  },
  tijera_vendaval: {
    proposito: "Ataque de viento en área que barre a todos los hostiles con cortes independientes.",
    uso: "Conviene para limpiar grupos y priorizar la probabilidad de acertar mediante sus evoluciones.",
    limite: "Consume bastante qi y sólo causa el 65% del daño cuando se usa contra un enemigo solitario.",
  },
  respiracion_horno: {
    proposito: "Burbuja prolongada de fuego que reduce parte de cada golpe hasta agotar su reserva de daño.",
    uso: "Conviene al comienzo de una pelea larga: protege menos por golpe que otras corazas, pero su reserva alcanza para más golpes.",
    limite: "No inflige daño al activarse, los ataques poderosos todavía atraviesan su reducción y sólo se gasta con el daño que absorbe: si el enemigo falla, la burbuja se conserva.",
  },
  brasa_vendaval: {
    proposito: "Definitiva de fuego y viento: concentra un daño muy alto y preciso en un solo enemigo.",
    uso: "Conviene como ofensiva principal si dominas ambos elementos y quieres concentrar el daño.",
    limite: "Cuesta bastante más qi que una técnica pura, no ataca en área ni aplica quemadura, y no prepara otra secuencia: cierra la cadena.",
  },
  aguja_aluvial: {
    proposito: "Definitiva de agua y viento: golpea fuerte a un objetivo y puede debilitar su ofensiva.",
    uso: "Conviene en duelos contra enemigos peligrosos cuando quieres combinar daño y mitigación.",
    limite: "Sólo alcanza a un blanco, cuesta mucho qi, no prepara otra secuencia y el debilitamiento requiere la evolución correspondiente.",
  },
  coraza_crisol: {
    proposito: "Definitiva defensiva de metal y tierra que absorbe mucho daño por golpe.",
    uso: "Conviene antes de recibir impactos fuertes o las respuestas de varios enemigos trabados.",
    limite: "Cuesta bastante más que una guardia pura, no causa daño al activarse y su reserva alcanza para pocos golpes fuertes: se rompe en cuanto la agota.",
  },
  loto_vapor: {
    proposito: "Definitiva de agua y fuego: concentra un gran daño inmediato sobre un enemigo.",
    uso: "Conviene como remate estable para cultivadores capaces de sostener ambos elementos.",
    limite: "Sólo golpea a un objetivo, exige mucho qi y no deja quemadura, control ni protección después del impacto.",
  },
};
