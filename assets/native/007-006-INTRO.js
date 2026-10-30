const INTRO = {
  kanji: "白鶴",
  titulo: "LA GRULLA BLANCA",
  sub: "corte vertical xianxia",
  texto: `Hace trescientos años, una grulla blanca descendió sobre el pico de la montaña.
Dicen que jamás volvió a alzar el vuelo.

Allí donde reposó, el qi comenzó a brotar de la roca como agua de un manantial. Con los años, hombres y mujeres levantaron alrededor de aquel lugar la Secta del Pico de la Grulla Blanca: nueve patios extendidos sobre la montaña, una antigua campana que ya nadie hace sonar y archivos donde duermen nombres que el presente ha olvidado.

Pero las historias de inmortales no llenan los graneros.

Abajo, entre aldeas y caminos, el mundo mortal atraviesa años difíciles. Dos cosechas se han perdido. Los tributos no disminuyen. Los caminos son cada vez menos seguros y, en muchas casas, queda poco que vender antes de que sólo quede marcharse.

Por eso, cada primavera, una multitud asciende hasta la gran puerta roja de la secta.

Llegan hijos sin herencia, campesinos, artesanos, deudores, viudas, fugitivos y jóvenes que nunca han sostenido una espada. Algunos buscan poder. Otros, alimento. Muchos sólo quieren una vida distinta.

Uno por uno colocan la mano sobre la Piedra de las Raíces.

Nueve de cada diez vuelven a bajar de la montaña antes del anochecer.

Este año, la fila vuelve a formarse.

Entre todos ellos, estás tú.`
};

const MAESTRIA_NOMBRES = ["iniciada", "menor", "mayor", "consumada"];
const UMBRALES_MAESTRIA = [5, 12, 24];
const UMBRALES_POR_GRADO = {
  mortal: [5, 12, 24],
  tierra: [8, 18, 36],
  cielo: [12, 28, 54],
};
const ELEMENTOS = ["fuego", "metal", "agua", "tierra", "viento"];
const ELEMENTO_UI = {
  fuego: { simbolo: "火", nombre: "Fuego" },
  agua: { simbolo: "水", nombre: "Agua" },
  metal: { simbolo: "金", nombre: "Metal" },
  tierra: { simbolo: "土", nombre: "Tierra" },
  viento: { simbolo: "風", nombre: "Viento" },
};
const LGB_R16_AFINIDADES = Object.freeze({"rata_qi":"tierra","serpiente_qi":"agua","lobo_espiritual":"viento","eco_caido":"tierra","pez_lunar":"agua","sombra_ahogada":"agua","centinela_pluma":"metal","devorador_niebla":"viento","avispa_jade":"viento","mono_pildoras":"fuego","sapo_ceniza":"fuego","sapo_caldera":"fuego","escarabajo_hierro":"metal","rey_escarabajo":"metal","anguila_estelar":"agua","guardian_coral":"agua","halcon_tormenta":"viento","mantis_nube":"viento","jabali_pizarra":"tierra","buho_niebla_gris":"viento","zorro_bancales":"tierra","cangrejo_cauce":"agua","murcielago_resonante":"viento","arana_veta_sombria":"metal","custodio_eco_petreo":"tierra","garza_bruma_roca":"agua","cangrejo_laja_humeda":"tierra","sanguijuela_remanso_turbio":"agua","salamandra_filtracion_tibia":"fuego","rana_cascajo_barranco":"tierra","carpa_lamina_reflejo":"agua","carnero_ceniza_cumbre":"tierra","polilla_aguja_nubes":"viento","lince_risco_vidriado":"metal","escarabajo_relevo_oxidado":"metal","polilla_hollin_conducto":"fuego","reflejo_pulso_disperso":"agua"});
const LGB_R16_ESENCIAS = Object.freeze({"agua":{"nombre":"Agua","symbol":"水","epithet":"EL PULSO DE LA CORRIENTE","flavor":"La esencia fluye, rodea y recuerda."},"fuego":{"nombre":"Fuego","symbol":"火","epithet":"EL ALIENTO DE LAS BRASAS","flavor":"La esencia irradia calor y transformación."},"tierra":{"nombre":"Tierra","symbol":"土","epithet":"LA MEMORIA DE LA PIEDRA","flavor":"La esencia arraiga, sostiene y perdura."},"metal":{"nombre":"Metal","symbol":"金","epithet":"EL FILO DE LA VOLUNTAD","flavor":"La esencia se templa, resuena y afila."},"viento":{"nombre":"Viento","symbol":"風","epithet":"LA DANZA DEL ALIENTO","flavor":"La esencia circula, gira y se dispersa."}});
const ROL_TECNICA = {
  ofensiva: "Ataque", fortificacion: "Fortificación", guardia: "Absorción", esquiva: "Evasión", control: "Control",
};
// Incompatibilidades de las artes de esta secta; no toda técnica ajena es hostil.
const ELEMENTOS_INCOMPATIBLES = [["fuego", "agua"], ["fuego", "metal"], ["agua", "tierra"]];

// Ciclo de ventaja elemental en combate: cada elemento supera al siguiente y
// es superado por el anterior (cíclico). fuego > metal > viento > tierra >
// agua > fuego. Generaliza el único caso que existía antes (fuego vs. agua)
// a los cinco elementos por igual.
const CICLO_ELEMENTOS = ["fuego", "metal", "viento", "tierra", "agua"];
// Único número a tocar si algún día se quiere retocar la fuerza del sistema.
// Es un multiplicador de DAÑO (no de ataque/acierto): así el bono siempre es
// una fracción fija de lo que sea que la técnica inflija en ese momento del
// juego, y nunca se diluye ni se satura contra el techo de acierto del d20
// a medida que suben los stats de personajes y enemigos.
const BONO_ELEMENTAL = 0.2; // ×1.2 con ventaja, ×0.8 con desventaja
const FLAVOR_VENTAJA_ELEMENTAL = {
  "fuego:metal": "El fuego ablanda el metal de tu objetivo",
  "metal:viento": "Tu filo corta limpio a través del viento",
  "viento:tierra": "El viento arrastra la tierra suelta de tu objetivo",
  "tierra:agua": "La tierra represa el qi de agua de tu objetivo",
  "agua:fuego": "Tu qi de agua ahoga el fuego de tu objetivo",
};
// +1 si el elemento atacante supera al defensor, -1 si es al revés, 0 si no
// hay relación (elementos iguales o sin dato de alguno de los dos).
function relacionElemental(atacante, defensor) {
  if (!atacante || !defensor || atacante === defensor) return 0;
  const i = CICLO_ELEMENTOS.indexOf(atacante), j = CICLO_ELEMENTOS.indexOf(defensor);
  if (i < 0 || j < 0) return 0;
  const n = CICLO_ELEMENTOS.length;
  if ((i + 1) % n === j) return 1;
  if ((j + 1) % n === i) return -1;
  return 0;
}
