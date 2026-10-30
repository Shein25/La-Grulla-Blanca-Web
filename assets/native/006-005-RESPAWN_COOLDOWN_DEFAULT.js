const RESPAWN_COOLDOWN_DEFAULT = 10;
const DURACION_OBJETO_TIRADO = 500;
// Los restos son información ambiental, no una segunda fuente de botín.
// Duran menos que el respawn común para que nunca se solapen con la nueva criatura.
const DURACION_CADAVER = 6;

// ---------- MOBS ERRANTES: territorio fijo, se mueven entre comandos de movimiento ----------
// array de instancias: para agregar un mob errante nuevo, solo hace falta sumar otra
// entrada acá (con su propio `id`, mob, territorio y sala de origen). El motor
// (actualizarErrantes/moverErrantes/entrarSala/recompensas) ya es genérico y no
// necesita tocarse. La atracción QI/SANGRE consulta vecinos reales por separado.
let a08TerritorialRuntime=null;
function a08PuedeManifestarse(g,id){return !!a08TerritorialRuntime?.mayManifest(g,id,g.pos);}
function a08TerritorioEfectivo(e,g){return a08TerritorialRuntime?.territory(e,g)||[];}
function a08ErranteLocalValido(e,g){return a08TerritorialRuntime?.local(e,g)===true;}
const A08_RECOLONIZATION_BOSS_ROOMS={"bosque_corredor_viento":"mantis_nube","bosque_rocas_blancas":"custodio_eco_petreo","camara_caldera":"sapo_caldera","nido_escarabajos":"rey_escarabajo","aguas_rama_oscura":"guardian_coral","aguas_cuenca_reunion":"sombra_ahogada"};
const PROB_MOVIMIENTO_ERRANTE = 0.28;
const ERRANTES_INICIALES = [
  {
    "id": "lobo_madriguera",
    "mobId": "lobo_espiritual",
    "territorio": [
      "bosque_paso_hundido",
      "bosque_hondonada",
      "bosque_corredor_viento"
    ],
    "origen": "bosque_hondonada",
    "sala": "bosque_hondonada",
    "muertoHasta": 0
  },
  {
    "id": "rata_despensa",
    "mobId": "rata_qi",
    "territorio": [
      "deposito_comun",
      "tablon_encargos"
    ],
    "origen": "deposito_comun",
    "sala": "deposito_comun",
    "muertoHasta": 0
  },
  {
    "id": "serpiente_bambu",
    "mobId": "serpiente_qi",
    "territorio": [
      "bosque_claro_raices",
      "bosque_sendero_bajo",
      "bosque_puesto_marcas"
    ],
    "origen": "bosque_claro_raices",
    "sala": "bosque_claro_raices",
    "muertoHasta": 0
  },
  {
    "id": "avispa_exploradora",
    "mobId": "avispa_jade",
    "territorio": [
      "bosque_claro_humedo",
      "bosque_pinos_torcidos",
      "bosque_quebrada_niebla",
      "bosque_loma_niebla"
    ],
    "origen": "bosque_claro_humedo",
    "sala": "bosque_claro_humedo",
    "muertoHasta": 0
  },
  {
    "id": "macaco_rebuscador",
    "mobId": "mono_pildoras",
    "territorio": [
      "bosque_claro_humedo",
      "bosque_pinos_torcidos",
      "bosque_quebrada_niebla",
      "bosque_loma_niebla"
    ],
    "origen": "bosque_claro_humedo",
    "sala": "bosque_claro_humedo",
    "muertoHasta": 0
  },
  {
    "id": "sapo_de_la_grieta",
    "mobId": "sapo_ceniza",
    "territorio": [
      "camara_caldera",
      "desvio_termal"
    ],
    "origen": "camara_caldera",
    "sala": "camara_caldera",
    "muertoHasta": 0
  },
  {
    "id": "escarabajo_de_la_cuota",
    "mobId": "escarabajo_hierro",
    "territorio": [
      "nido_escarabajos",
      "camara_hierro",
      "veta_negra"
    ],
    "origen": "veta_negra",
    "sala": "veta_negra",
    "muertoHasta": 0
  },
  {
    "id": "pez_de_la_corriente",
    "mobId": "pez_lunar",
    "territorio": [
      "aguas_inicio_barranco",
      "aguas_poza_clara",
      "aguas_terraza_humeda"
    ],
    "origen": "aguas_inicio_barranco",
    "sala": "aguas_inicio_barranco",
    "muertoHasta": 0
  },
  {
    "id": "anguila_extraviada",
    "mobId": "anguila_estelar",
    "territorio": [
      "aguas_manantial_partido",
      "aguas_rama_oscura",
      "aguas_cuenca_reunion"
    ],
    "origen": "aguas_manantial_partido",
    "sala": "aguas_manantial_partido",
    "muertoHasta": 0
  },
  {
    "id": "devorador_de_paso",
    "mobId": "devorador_niebla",
    "territorio": [
      "alturas_nido_halcones",
      "alturas_aguja_piedra",
      "alturas_ladera_nubes"
    ],
    "origen": "alturas_nido_halcones",
    "sala": "alturas_nido_halcones",
    "muertoHasta": 0
  },
  {
    "id": "halcon_de_patrulla",
    "mobId": "halcon_tormenta",
    "territorio": [
      "alturas_nido_halcones",
      "alturas_aguja_piedra",
      "alturas_ladera_nubes",
      "alturas_claro_nubes",
      "alturas_senda_mantis"
    ],
    "origen": "alturas_ladera_nubes",
    "sala": "alturas_ladera_nubes",
    "muertoHasta": 0
  }
];
