import { connectB3Native, upgradeB3Record } from './b3-native.js';
import { connectB1, upgradeB1StoredRecord } from './b1-native.js';
import { connectM15, upgradeM15StoredRecord } from './m15-native.js';
import { connectA09Domain, upgradeA09StoredRecord } from './a09-domain.js';
import { connectNativeAscensions } from './ascension-native.js';
import { connectUpperMissions } from './upper-missions-native.js';
import { connectLivMissions } from './liv-missions-native.js';
import { connectWorldExpansion } from './world-expansion.js';
import { connectLiIntegration } from './li-m05-native.js';
import { connectNativeAlchemy } from './normal-alchemy-native-r56.js';
import { connectNativeHerbalism } from './herbalism-native-r54.js';
import '../tooling/root-entry.js';
import '../sources/ACCEPTED_CAMPAIGN/experimental/a079-browser-entry-b15.js';
import { createLearningScope } from './b2-player-learning-b14.js';
import { createTeachingEngine } from './b2-teaching-engine-b14.js';
import { createLearnedV13Presenter } from './b2-learned-v13-presenter.js';
import { captureTeachingContext, registerNewOwnerReader } from '../sources/ACCEPTED_CAMPAIGN/experimental/shen-service-availability-b15.js';
import { bindSemantic, requireRestorePermit, clone, createMemoryCoordinator } from '../sources/ACCEPTED_CAMPAIGN/experimental/g08-semantic.js';
import { connectA09NativeDurable } from './g08-a09-native-host.js';
import { requireStoreCandidate } from './g08-a09-native-store.js';
import { createP3IndependentFeeds } from '../sources/ACCEPTED_CAMPAIGN/experimental/p3-independent-feeds.js';
import { sealV284View } from './b3-campaign-stat-view.js';
import { createM02EncounterDomain } from '../sources/ACCEPTED_CAMPAIGN/experimental/m02-encounter-domain.js';
import { connectM02NativeWorld } from '../sources/ACCEPTED_CAMPAIGN/experimental/m02-native-world-port.js';
import { registerM02Actor, registerM02Binding, sealResolvedV284Death } from './m02-v284-authority.js';
import { connectM03Foundation } from '../sources/ACCEPTED_CAMPAIGN/experimental/m03-native-foundation-port-p2.js';
import { connectM03Evaluation, requireM03Institution } from './p2-evaluation-r56.js';
import { createCampaignWorldPort } from './campaign-world-semantic.js';
import { observeNativeInput } from '../sources/ACCEPTED_CAMPAIGN/experimental/native-input-provenance.js';
import '../sources/ACCEPTED_CAMPAIGN/experimental/normal-qi-rat-populations.js';
import { connectNewCorpseExtraction } from '../sources/ACCEPTED_CAMPAIGN/experimental/new-corpse-extraction.js';
import { createQiaoDeliveryDomain, connectQiaoNativeDelivery } from '../sources/ACCEPTED_CAMPAIGN/experimental/qiao-delivery-domain.js';
import { connectNativeServices } from './b1-native-services.js';
import { requireNewMaterialInventory } from './material-inventory-v306.js';

let installed=false;
Object.defineProperty(globalThis,'ASTRA_A08_CAMPAIGN_CONNECT',{configurable:true,value({runtime,bridge,roomDefinitions,extractionDefinitions,materialDefinitions,monsterDefinitions,corpseTTL,npcResolver,questDefinitions,expansion=null}){
 if(installed)throw Error('A08_CAMPAIGN_SINGLE_OWNER');installed=true;
 /* Native mobile bindings include the six existing rat slots. */const input=observeNativeInput(globalThis.document);
 const read=()=>{const r=bridge.read();return {state:r.state,view:sealV284View(r.frame)};};
 let learning;const teaching=createTeachingEngine({readContext:()=>{const c=captureTeachingContext(runtime);return c?{...c,stage:read().state.stage}:null;},getLearning:()=>learning});
 learning=createLearningScope({completionResolver:cap=>teaching.resolveCompletion(cap)});
 const visual=createLearnedV13Presenter({runtime,captureLearning:()=>learning.capture()});
 registerNewOwnerReader(runtime,read,learning,teaching,visual);
 const m02=createM02EncounterDomain({runtime}),actor=registerM02Actor(Object.freeze({snapshot:()=>({...read().state,revision:bridge.read().state.revision})}));
 const targetBinding=registerM02Binding(Object.freeze({deathContext:d=>{const v=d.generalObservation?bridge.resolveCommittedDeath(d.native):bridge.resolveDeath(d.native);if(v.generation!==d.nativeGeneration||v.lifeId!==d.lifeId)throw Error('A08_M02_OLD_NATIVE_LIFE');return {generation:m02.inspect().generation,birth:d.birth,mob:v.mob,roomId:v.roomId};},mark(d,disposition){bridge.markDeath(d.native,disposition);}}));
 const m02World=connectM02NativeWorld({runtime,domain:m02});m02.connect(m02World,targetBinding);
 const foundation=connectM03Foundation({runtime,readOwner:read,readLearning:()=>learning.capture()});
 const evaluation=connectM03Evaluation({runtime,readOwner:read,readLearning:()=>learning.capture(),foundation,institutionTransaction:()=>bridge.prepareInstitutionPayout()});
 const oldTitle=runtime.tituloActual;runtime.tituloActual=function(...args){if(this===runtime&&this.player&&read().state.stage==='LianQi_I'){try{const institution=requireM03Institution(evaluation.captureInstitution());if(institution.current())return 'discípulo externo';}catch{}}return oldTitle.apply(this,args);};
 const li=connectLiIntegration({runtime,bridge,input,roomDefinitions,npcResolver,questDefinitions,readInstitution:()=>evaluation.captureInstitution()});
 const a09Host=connectA09Domain({runtime,bridge,input,rooms:roomDefinitions});
 const ascensions=connectNativeAscensions({runtime,bridge,input,li,readA09Decision:()=>{const p=a09Host.inspect().postcombat;return p?.stage==='DECIDED'?p.decisionFinal:null;},readA09Foundation:()=>a09Host.inspect().foundation});
 const upper=connectUpperMissions({runtime,bridge,input,definitions:questDefinitions,rooms:roomDefinitions,source:{
  "missions": [
    {
      "id": "M08",
      "title": "Una montaña que no coincide consigo misma",
      "theme": "La montaña respira fuera de compás",
      "origin": "CANÓNICA: trabajo de campo y confirmación independiente R2",
      "areas": [
        "formaciones",
        "aguas_barrancos",
        "bosque_bruma_ascendente",
        "cueva_jade_resonante",
        "manantiales_espejo_lunar"
      ],
      "intro": "He Zhen encuentra diferencias entre las antiguas lecturas territoriales y el flujo de Qi actual. Los instrumentos no están rotos: algunos pulsos se corrigen entre sí como si una presión invisible compensara lo que falta en otro lugar. Para distinguir un error de una alteración real, necesitás repetir la observación lejos de la Secta, con suficiente independencia entre las muestras.",
      "story": "Los puestos de medida están expuestos a fauna hostil. Por orden de Formaciones y con apoyo de patrullas, también deberás superar una inspección de guarida y abatir tres monstruos mutantes auténticos: uno propio de LianQi I, otro propio de LianQi II y otro propio de LianQi III; en cada etapa elegís libremente la especie. Estas tres cacerías muestran que podés investigar regiones con peligros de distinta naturaleza, sin demostrar por sí solas que las mutaciones estén causadas por Primera Ala.",
      "giver": [
        "he_zhen"
      ],
      "support": [
        "wen_tao",
        "jiang_rui"
      ],
      "completion": "He Zhen / Formaciones",
      "gate": "LianQi III + SECTA_INTERIOR",
      "reveal": "R2=CONFIRMADO: compensación artificial de corrientes (sin identificar su causa)",
      "mandatory": [
        {
          "id": "m08_01",
          "label": "Recibir autorización e instrumentos de He Zhen en Formaciones.",
          "kind": "dialogo",
          "where": "formaciones_sala_control",
          "proof": "permiso FORMACIONES_INVESTIGACION vigente; entrega única",
          "canon": true
        },
        {
          "id": "m08_02",
          "label": "Revisar las notas de M04–M07 y realizar una lectura de referencia.",
          "kind": "investigacion",
          "where": "aguas_cauce_alto",
          "proof": "lectura registrada en el corredor de M06, sin alterar el lugar",
          "canon": true
        },
        {
          "id": "m08_03",
          "label": "Tomar dos lecturas en áreas nuevas diferentes (elegí dos de tres).",
          "kind": "eleccion",
          "where": [
            "l3_bruma_17",
            "l3_cueva_18",
            "l3_luna_16"
          ],
          "proof": "dos recibos de medida, area_id distintos; no basta con entrar a la sala",
          "canon": false
        },
        {
          "id": "m08_04",
          "label": "Inspeccionar desde una ruta habilitada una de las tres guaridas identificadas.",
          "kind": "riesgo",
          "where": [
            "l3_bruma_18",
            "l3_cueva_17",
            "l3_luna_05"
          ],
          "proof": "reconocimiento ambiental, alcance y peligros validados; no obliga a matar al normal fijo",
          "canon": false
        },
        {
          "id": "m08_05",
          "label": "Derrotar 1 monstruo mutante auténtico de LianQi I (cualquier especie normal de I).",
          "kind": "caza",
          "where": [
            "LianQi_I"
          ],
          "proof": "1/1: recibo nativo único de muerte, variant=MUTANT, especie normal con etapa nativa I; sin doble crédito",
          "canon": false
        },
        {
          "id": "m08_06",
          "label": "Derrotar 1 monstruo mutante auténtico de LianQi II (cualquier especie normal de II).",
          "kind": "caza",
          "where": [
            "LianQi_II"
          ],
          "proof": "1/1: recibo nativo único de muerte, variant=MUTANT, especie normal con etapa nativa II; sin doble crédito",
          "canon": false
        },
        {
          "id": "m08_07",
          "label": "Derrotar 1 monstruo mutante auténtico de LianQi III (cualquier especie normal de III).",
          "kind": "caza",
          "where": [
            "LianQi_III"
          ],
          "proof": "1/1: recibo nativo único de muerte, variant=MUTANT, especie normal con etapa nativa III; sin doble crédito",
          "canon": false
        },
        {
          "id": "m08_08",
          "label": "Comparar los registros en Formaciones y repetir una lectura independiente.",
          "kind": "sintesis",
          "where": "formaciones_sala_control",
          "proof": "dos mediciones incompatibles verificadas + cotejo; R2 mediante evento único",
          "canon": true
        }
      ],
      "optional": [
        {
          "label": "Obtener una tercera lectura territorial para enriquecer el informe.",
          "where": "Una tercera área entre las tres nuevas"
        },
        {
          "label": "Consultar a Jiang Rui sobre avistamientos y rutas seguras.",
          "where": "puesto_valle"
        }
      ],
      "npc_notes": "He Zhen otorga el permiso y reconoce R2; Wen Tao ayuda a validar instrumentos, sin decidir el hallazgo; Jiang Rui proporciona información logística, sin revelar secretos. No llevar a los NPC a sus áreas mediante teletransporte."
    },
    {
      "id": "M09",
      "title": "Los nombres que faltan",
      "theme": "Tres errores que cuentan una historia",
      "origin": "CANÓNICA: contradicciones de registros, Dos Alas aún parcial",
      "areas": [
        "archivos",
        "secta_interior",
        "areas_lianqi_iii_caceria_opcional"
      ],
      "intro": "Song Rui advierte que tres clases de irregularidad aparecen donde no deberían: referencias a folios que ya no existen, copias con palabras sustituidas y nombres que figuran en una edición pero han desaparecido de otra. Zhao Wen compara anotaciones sin presentarlas como verdades; Yu Shun permite reconocer el oficio de los copistas.",
      "story": "Tu tarea sigue siendo descifrar copias y obtener el permiso de Qiao Ren sin forzar puertas ni adelantar el significado de «Dos Alas». Como anexo opcional, Song Rui te propone contrastar dos testimonios independientes de criaturas T2 de LianQi III. Podés elegir las especies y las zonas dentro de esta etapa; el anexo no condiciona el Archivo Restringido ni la investigación principal.",
      "giver": [
        "song_rui"
      ],
      "support": [
        "zhao_wen",
        "yu_shun",
        "qiao_ren",
        "luo_yan"
      ],
      "completion": "Song Rui / Archivos",
      "gate": "LianQi III; permiso ARCHIVO_COMUN y luego autorización explícita Qiao Ren",
      "reveal": "R3=PARCIAL: aparece Dos Alas; no se define la red completa",
      "mandatory": [
        {
          "id": "m09_01",
          "label": "Hablar con Song Rui e ingresar legalmente al Archivo Común.",
          "kind": "dialogo",
          "where": "archivos_sala_consulta",
          "proof": "ARCHIVO_COMUN concedido",
          "canon": true
        },
        {
          "id": "m09_02",
          "label": "Identificar una referencia ausente, una copia modificada y un nombre omitido.",
          "kind": "documento",
          "where": "archivos_catalogo",
          "proof": "tres clases de evidencia diferentes, sin repetir folios",
          "canon": true
        },
        {
          "id": "m09_03",
          "label": "Contrastar el hallazgo con Yu Shun y Zhao Wen usando LEER ESCRITURAS.",
          "kind": "investigacion",
          "where": "archivos_escritorio_copistas",
          "proof": "lectura gratuita, sin hoja ni comprensión repetible",
          "canon": true
        },
        {
          "id": "m09_04",
          "label": "Solicitar permiso temporal a Qiao Ren para el fondo restringido.",
          "kind": "permiso",
          "where": "pabellon_disciplina",
          "proof": "autoridad real presente, permiso ARCHIVO_RESTRINGIDO con scope y revocación",
          "canon": true
        },
        {
          "id": "m09_05",
          "label": "Confrontar las copias restringidas y presentar un informe parcial a Song Rui.",
          "kind": "cierre",
          "where": "archivos_sala_consulta",
          "proof": "R3=PARCIAL, M09 cerrada una sola vez",
          "canon": true
        }
      ],
      "optional": [
        {
          "label": "Contrastar variantes de topónimos con observaciones de M08.",
          "where": "Archivos; sin nuevas revelaciones"
        },
        {
          "label": "Dialogar con Luo Yan sobre los límites de la investigación.",
          "where": "Consultas institucionales, sin adelantar R3"
        },
        {
          "id": "m09_t2_01",
          "kind": "caza_t2",
          "tier_min": 2,
          "stage_options": [
            "LianQi_III"
          ],
          "mandatory": false,
          "label": "OPCIONAL: derrotar 2 monstruos normales T2 o superiores, nativos de LianQi III, de cualquier especie elegible; reunir dos testimonios distintos de patrulla.",
          "where": "Una zona accesible de LianQi III: Aguas y Barrancos, Bosque de Bruma, Cueva del Jade o Manantiales; especie LIII y T2 nativo verificables.",
          "proof": "0/2 victorias distintas; clase NORMAL, especie de LianQi III y tier real >=2 al iniciar cada combate. Dos recibos de muerte diferentes. LI/LII y mutantes excluidos.",
          "npc": "song_rui",
          "reason": "Anexo documental que compara dos reportes modernos de conducta de fauna LIII; NO bloquea M09, M11 ni ARCHIVO_RESTRINGIDO.",
          "count_required": 2,
          "progress_label": "0/2"
        }
      ],
      "npc_notes": "Qiao Ren no trabaja en Archivos: el permiso se solicita en su ruta de Disciplina/Interior, nunca aparece teletransportado junto a Song Rui. Zhao Wen no conoce el secreto completo ni tiene permiso automático para Archivo Restringido. Song Rui entrega el anexo opcional en Archivos y no se desplaza a los territorios antiguos."
    },
    {
      "id": "M10",
      "title": "El cuerpo recuerda",
      "theme": "Las heridas obedecen una geometría antigua",
      "origin": "CANÓNICA: informes corporales, Segunda Rama distinta del principio",
      "areas": [
        "medicina",
        "cueva_jade_resonante",
        "manantiales_espejo_lunar"
      ],
      "intro": "Lan Meihua te entrega un conjunto de informes clínicos imposibles de interpretar con los meridianos actuales. Las lesiones no se alinean con técnicas conocidas, pero comparten una pauta: dos corrientes que un cuerpo ordinario no puede alojar al mismo tiempo. Chen Bo conserva diagramas de anatomía y testimonios de quienes observaron consecuencias sin comprenderlas.",
      "story": "Los expedientes necesitan una comparación actual: Lan Meihua te encarga reunir tres registros de combate contra criaturas realmente adaptadas a T2. Al menos uno debe proceder de las galerías de la Cueva del Jade y otro de los Manantiales del Espejo Lunar; el tercero puede obtenerse en cualquiera de esos hábitats. Chen Bo comparará las conductas observadas con antiguas lesiones, sin confundir adaptación animal con una prueba de injertos.",
      "giver": [
        "lan_meihua"
      ],
      "support": [
        "chen_bo",
        "guo_chen",
        "luo_yan"
      ],
      "completion": "Lan Meihua / Medicina",
      "gate": "LianQi III; acceso regular a Medicina",
      "reveal": "R4=CONFIRMADO: alteración corporal para dos corrientes incompatibles",
      "mandatory": [
        {
          "id": "m10_01",
          "label": "Recibir de Lan Meihua el registro clínico y sus preguntas.",
          "kind": "dialogo",
          "where": "consultorio_meridianos",
          "proof": "expediente de misión, copia de consulta sin sustraer originales",
          "canon": true
        },
        {
          "id": "m10_02",
          "label": "Examinar diagramas y expedientes; hablar con Chen Bo.",
          "kind": "investigacion",
          "where": [
            "sala_anatomica",
            "archivo_clinico"
          ],
          "proof": "distinción entre anatomía actual y marcas antiguas",
          "canon": true
        },
        {
          "id": "m10_03",
          "label": "Registrar una observación de campo en Cueva o Manantiales (una basta).",
          "kind": "eleccion",
          "where": [
            "l3_cueva_08",
            "l3_luna_03"
          ],
          "proof": "medición de vapor/presión o reflejo/corrientes, sin cosechar materiales",
          "canon": false
        },
        {
          "id": "m10_t2_01",
          "kind": "caza_t2",
          "tier_min": 2,
          "stage_options": [
            "LianQi_III"
          ],
          "mandatory": true,
          "label": "Derrotar 3 monstruos normales T2 o superiores de LianQi III: al menos 1 en la Cueva del Jade y 1 en los Manantiales; obtener tres registros de combate independientes.",
          "where": [
            "l3_cueva_02",
            "l3_cueva_04",
            "l3_cueva_08",
            "l3_cueva_12",
            "l3_cueva_16",
            "l3_cueva_17",
            "l3_cueva_19",
            "l3_cueva_20",
            "l3_cueva_21",
            "l3_cueva_22",
            "l3_luna_04",
            "l3_luna_05",
            "l3_luna_08",
            "l3_luna_09",
            "l3_luna_12",
            "l3_luna_15",
            "l3_luna_17",
            "l3_luna_18"
          ],
          "species_options": [
            "salamandra_filtracion_tibia",
            "cangrejo_laja_humeda",
            "carpa_lamina_reflejo",
            "sanguijuela_remanso_turbio"
          ],
          "proof": "0/3 (mínimo Cueva 1/1 y Manantiales 1/1, tercero libre en cualquiera de ambas). Tres muertes distintas NORMAL LIII T2+; no drops ni mutantes; no basta con estar en la sala.",
          "canon": false,
          "count_required": 3,
          "progress_label": "0/3",
          "quota_by_area": {
            "cueva_jade_resonante": 1,
            "manantiales_espejo_lunar": 1
          }
        },
        {
          "id": "m10_04",
          "label": "Comparar la lectura exterior con los diagramas y presentar conclusiones.",
          "kind": "cierre",
          "where": "consultorio_meridianos",
          "proof": "R4=CONFIRMADO, sin injerto ni falso spoiler",
          "canon": true
        }
      ],
      "optional": [
        {
          "label": "Escuchar la inquietud de Guo Chen, sin intervenir en su cuerpo.",
          "where": "Diálogo dependiente de presencia real"
        },
        {
          "label": "Comparar una segunda observación del otro bioma.",
          "where": "Solo evidencia complementaria"
        },
        {
          "label": "Contrastar en Medicina los rastros que diferenciaron las tres criaturas, sin exigir una cuarta victoria.",
          "where": "consultorio_meridianos"
        }
      ],
      "npc_notes": "Lan Meihua interpreta Medicina y acredita R4; Chen Bo aporta método anatómico. Guo Chen y Luo Yan son voces personales, no autoridades que permitan injertos. No crear operación corporal, laboratorio nuevo ni poder gratuito. Lan Meihua autoriza el objetivo y Chen Bo analiza el registro SIN trasladarse a la cueva ni a la laguna."
    },
    {
      "id": "M11",
      "title": "Las Dos Alas",
      "theme": "Tres disciplinas ante un mismo silencio",
      "origin": "CANÓNICA: síntesis, revelación R3 y Comprensión +1",
      "areas": [
        "formaciones",
        "archivos",
        "medicina"
      ],
      "intro": "La evidencia ya existe, pero ninguna disciplina logra explicarla sola. Las medidas de He Zhen no pueden leerse sin los nombres que Song Rui recuperó, y la anatomía de Lan Meihua sería inverosímil sin los otros dos hallazgos. Convocada la reunión, tu tarea no es explorar una cueva más: es ordenar las pruebas y reconocer qué pertenece a un principio general y qué fue una aplicación peligrosa de ese principio.",
      "story": "Los documentos conservan términos parecidos que no son sinónimos. «Dos Alas» describe una forma de contención y circulación coexistentes; «Segunda Rama» fue una aplicación corporal concreta. Al separar esas ideas, el sello antiguo de Formaciones pasa de ser una curiosidad a convertirse en una pregunta investigable. La recompensa central es comprensión auténtica, no una técnica lista para aprender.",
      "giver": [
        "he_zhen",
        "song_rui",
        "lan_meihua"
      ],
      "support": [
        "zhao_wen"
      ],
      "completion": "Síntesis institucional conjunta, room exacta pendiente de reconciliar",
      "gate": "M08, M09 y M10 HECHAS; cualquier orden",
      "reveal": "R3=CONFIRMADO, DOS_ALAS=PRINCIPIO, SEGUNDA_RAMA=APLICACION_CORPORAL; Comprensión +1 one-shot",
      "mandatory": [
        {
          "id": "m11_01",
          "label": "Completar M08, M09 y M10, en cualquier orden.",
          "kind": "dependencias",
          "where": "Las tres líneas de investigación",
          "proof": "flags reales M08/M09/M10 completadas",
          "canon": true
        },
        {
          "id": "m11_02",
          "label": "Presentar las pruebas a He Zhen, Song Rui y Lan Meihua.",
          "kind": "dialogo",
          "where": "Lugar institucional a reconciliar en 329 salas",
          "proof": "reunión convocada tras presencia/permiso de NPC, no NPC clonados",
          "canon": true
        },
        {
          "id": "m11_03",
          "label": "Diferenciar el principio Dos Alas de la aplicación corporal Segunda Rama.",
          "kind": "sintesis",
          "where": "Reunión de síntesis",
          "proof": "R3 confirmado; Comprensión +1 una sola vez",
          "canon": true
        }
      ],
      "optional": [
        {
          "label": "Conservar las lecturas de las tres áreas para consultar el mapa de anomalías.",
          "where": "Bitácora, sin recompensas acumulativas"
        }
      ],
      "npc_notes": "Tres autoridades aportan perspectivas distintas. No obligar a los NPC móviles a aparecer mágicamente en la sala del jugador; registrar la reunión como instancia autorizada y anclada cuando se decida la room."
    },
    {
      "id": "M12",
      "title": "La red que nadie dibuja",
      "theme": "Bajo las piedras late una arquitectura olvidada",
      "origin": "CANÓNICA: Primera Ala, Custodio terminal, R5 y puerta IV",
      "areas": [
        "formaciones",
        "primera_ala",
        "bosque_bruma_ascendente"
      ],
      "intro": "El sello que He Zhen señaló no encaja en los planos modernos de Formaciones. Su apertura institucional revela un descenso hacia Primera Ala, un entramado enterrado que une instalaciones aparentemente independientes. Las huellas de la red no son únicamente antiguas: algunas señales siguen ordenadas según una lógica que nadie recuerda haber enseñado.",
      "story": "Antes del descenso técnico, Wen Tao necesita que se despeje el corredor de instrumentos. Para acreditar que la ruta puede sostener una expedición, deberás superar tres encuentros reales T2 en el Bosque de Bruma, incluyendo una Garza de Bruma de Roca de la Vereda de las Garzas; los otros dos pueden ser garzas o ranas de cascajo. Esta operación es una prueba de seguridad, no una explicación de Primera Ala: después siguen siendo obligatorios la evidencia CONCLUYENTE y el encuentro con su Custodio.",
      "giver": [
        "he_zhen"
      ],
      "support": [
        "wen_tao",
        "song_rui",
        "jiang_rui"
      ],
      "completion": "He Zhen / autoridad institucional que corresponda, después de evaluación de evidencia",
      "gate": "M11 HECHA + PRIMERA_ALA_INVESTIGACION",
      "reveal": "R5=CONFIRMADO; red Primera Ala CONCLUYENTE; preparación gate LIII→LIV",
      "mandatory": [
        {
          "id": "m12_01",
          "label": "Abrir oficialmente el sello antiguo de Formaciones.",
          "kind": "permiso",
          "where": [
            "formaciones_sello_antiguo",
            "formaciones_descenso_tecnico"
          ],
          "proof": "entrada institucional, no uno de los seis atajos",
          "canon": true
        },
        {
          "id": "m12_t2_01",
          "kind": "caza_t2",
          "tier_min": 2,
          "stage_options": [
            "LianQi_III"
          ],
          "mandatory": true,
          "label": "Proteger la ruta del equipo: derrotar 3 normales T2+ de LianQi III en el Bosque de Bruma. Al menos 1 debe ser una Garza de Bruma de Roca en la Vereda de las Garzas.",
          "where": [
            "l3_bruma_06",
            "l3_bruma_08",
            "l3_bruma_09",
            "l3_bruma_13",
            "l3_bruma_15",
            "l3_bruma_18",
            "l3_bruma_19",
            "l3_bruma_20"
          ],
          "species_options": [
            "garza_bruma_roca",
            "rana_cascajo_barranco"
          ],
          "proof": "0/3: tres victorias NORMAL LIII T2+ en el Bosque; una garza en l3_bruma_18 acreditada por separado; otras dos en salas de fauna del Bosque. Sin doble crédito y sin reemplazar Custodio ni evidencia R5.",
          "canon": false,
          "count_required": 3,
          "progress_label": "0/3",
          "quota_by_species_room": {
            "species_id": "garza_bruma_roca",
            "room_id": "l3_bruma_18",
            "count": 1
          }
        },
        {
          "id": "m12_02",
          "label": "Explorar el nudo central, Cámara de Dos Alas y una rama funcional.",
          "kind": "exploracion",
          "where": [
            "ala_vestibulo",
            "ala_nudo_seis_corrientes",
            "ala_camara_dos_alas"
          ],
          "proof": "evidencia principal SUFICIENTE",
          "canon": true
        },
        {
          "id": "m12_03",
          "label": "Corroborar de forma independiente para elevar la evidencia a CONCLUYENTE.",
          "kind": "investigacion",
          "where": "Primera Ala (ruta principal garantizada); comparación exterior opcional",
          "proof": "evidencia fuerte distinta de la principal, fuente a cerrar",
          "canon": true
        },
        {
          "id": "m12_04",
          "label": "Resolver al Custodio de Dos Alas por combate o protocolo legítimo.",
          "kind": "desafio",
          "where": "Primera Ala: ubicación final a reconciliar",
          "proof": "terminal COMBATE o PROTOCOLO; no es Custodio del Eco Pétreo",
          "canon": true
        },
        {
          "id": "m12_05",
          "label": "Presentar hallazgo, confirmar R5 y solicitar autorización institucional.",
          "kind": "cierre",
          "where": "Formaciones / sede autorizante",
          "proof": "R5 confirmado + M12 HECHA; no se abre Mantenimiento hasta M13",
          "canon": true
        }
      ],
      "optional": [
        {
          "label": "Investigar otros atajos y evidencias periféricas, sin exigir los seis.",
          "where": "Primera Ala / Aguas, opcional"
        },
        {
          "label": "Consultar mediciones externas de Bosque, Cueva y Manantiales para contextualizar la red.",
          "where": "Sin sustituir la corroboración principal"
        }
      ],
      "npc_notes": "He Zhen tramita el hallazgo; Wen Tao tiene un rol técnico. La identidad de la autoridad final debe respetar el contrato de permisos, no asignarse a Qiao Ren por comodidad. Custodio de Dos Alas es distinto al guardián único de Tierra Custodio del Eco Pétreo. Wen Tao solicita la seguridad del transporte desde Formaciones; Jiang Rui asesora rutas desde su territorio y no se teletransporta al bosque."
    }
  ],
  "npcs": {
    "he_zhen": {
      "id": "he_zhen",
      "nombre": "He Zhen",
      "rol": "Formaciones / Territorio",
      "sala_inicial": "formaciones_sala_control",
      "movilidad": "RUTA",
      "territorio_normal": [
        "formaciones_sala_control",
        "formaciones_patio_medicion",
        "formaciones_galeria_norte"
      ],
      "anclajes_documentados": [
        "M08",
        "M12",
        "M16 (responsable Formaciones)",
        "M17"
      ],
      "rutas": [
        [
          "formaciones_sala_control",
          "formaciones_patio_medicion"
        ],
        [
          "formaciones_sala_control",
          "formaciones_galeria_norte"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "SOSPECHA",
        "R2": "SABE",
        "R3": "SOSPECHA",
        "R4": "DESCONOCIDO",
        "R5": "SOSPECHA",
        "R6": "SOSPECHA",
        "R7": "SABE",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "wen_tao": {
      "id": "wen_tao",
      "nombre": "Wen Tao",
      "rol": "Técnico de Formaciones",
      "sala_inicial": "formaciones_taller_tecnico",
      "movilidad": "RUTA",
      "territorio_normal": [
        "formaciones_taller_tecnico",
        "formaciones_nivel_servicio",
        "formaciones_estacion_baja"
      ],
      "anclajes_documentados": [
        "M08 (junto a He Zhen)"
      ],
      "rutas": [
        [
          "formaciones_taller_tecnico",
          "formaciones_galeria_sur",
          "formaciones_camara_central",
          "formaciones_sala_mapas",
          "formaciones_conducto_carga",
          "formaciones_nivel_servicio",
          "formaciones_estacion_baja"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "SOSPECHA",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "SOSPECHA",
        "R6": "SOSPECHA",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "song_rui": {
      "id": "song_rui",
      "nombre": "Song Rui",
      "rol": "Responsable de Archivos",
      "sala_inicial": "archivos_sala_consulta",
      "movilidad": "RUTA",
      "territorio_normal": [
        "archivos_sala_consulta",
        "archivos_catalogo",
        "archivos_escritorio_copistas"
      ],
      "anclajes_documentados": [
        "M09",
        "M11",
        "M15",
        "M17",
        "epílogo (catalogación)"
      ],
      "rutas": [
        [
          "archivos_sala_consulta",
          "archivos_catalogo"
        ],
        [
          "archivos_sala_consulta",
          "archivos_escritorio_copistas"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "SOSPECHA",
        "R3": "SABE",
        "R4": "SOSPECHA",
        "R5": "SOSPECHA",
        "R6": "SOSPECHA",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "SOSPECHA",
        "R10": "DESCONOCIDO"
      }
    },
    "zhao_wen": {
      "id": "zhao_wen",
      "nombre": "Zhao Wen",
      "rol": "Aspirante — piezas documentales / análisis",
      "sala_inicial": "sala_comun_externos",
      "movilidad": "RUTA",
      "territorio_normal": [
        "sala_comun_externos",
        "patio_cabanas",
        "lavadero_externos"
      ],
      "anclajes_documentados": [
        "M02–M04 (ZHAO_01_NOTAS_EN_EL_MARGEN)",
        "M06 (ZHAO_02_NO_ES_PRUEBA)",
        "M09 (ZHAO_03_ARCHIVO_CERRADO, ARCHIVO_RESTRINGIDO concedido por Qiao Ren)",
        "M09–M11 (ZHAO_04_ZHAO_LUO)",
        "M16 (ZHAO_05_DECIDIR_INCOMPLETO)"
      ],
      "rutas": [
        [
          "sala_comun_externos",
          "patio_cabanas"
        ],
        [
          "sala_comun_externos",
          "lavadero_externos"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "qiao_ren": {
      "id": "qiao_ren",
      "nombre": "Qiao Ren",
      "rol": "Disciplina y Administración",
      "sala_inicial": "pabellon_disciplina",
      "movilidad": "RUTA",
      "territorio_normal": [
        "pabellon_disciplina",
        "corredor_norte",
        "interior_sala_consejo"
      ],
      "anclajes_documentados": [
        "M03 (cierre de misión, ANCLADA en pabellon_disciplina)",
        "M07",
        "M16 (coordinación)",
        "M17",
        "comparecencia/epílogo"
      ],
      "rutas": [
        [
          "pabellon_disciplina",
          "corredor_norte",
          "escalinata_interior",
          "interior_umbral_sur",
          "interior_patio_blanco",
          "interior_patio_internos",
          "interior_sala_estudio",
          "interior_corredor_consejo",
          "interior_antesala_consejo",
          "interior_sala_consejo"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "SOSPECHA",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "SOSPECHA",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "luo_yan": {
      "id": "luo_yan",
      "nombre": "Luo Yan",
      "rol": "Aspirante — protocolo/historia oficial, lealtad institucional",
      "sala_inicial": "registro",
      "movilidad": "RUTA",
      "territorio_normal": [
        "registro",
        "puerta",
        "sala_jade"
      ],
      "anclajes_documentados": [
        "M01–M03 (LUO_01_ASI_SE_HACE)",
        "M06 (LUO_02_POR_ALGO_EXISTE)",
        "M09 (LUO_03_ZHAO_ARCHIVOS)",
        "M10 (LUO_04_GUO_SEGUNDA_RAMA)",
        "M16 (LUO_05_FORMACIONES_M16)"
      ],
      "rutas": [
        [
          "registro",
          "puerta"
        ],
        [
          "registro",
          "sala_jade"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "SOSPECHA",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "SABE",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "yu_shun": {
      "id": "yu_shun",
      "nombre": "Yu Shun",
      "rol": "Copista",
      "sala_inicial": "archivos_escritorio_copistas",
      "movilidad": "RUTA",
      "territorio_normal": [
        "archivos_escritorio_copistas",
        "archivos_camara_copias",
        "archivos_mesa_restauracion"
      ],
      "anclajes_documentados": [
        "M09 (junto a Song Rui/Zhao)"
      ],
      "rutas": [
        [
          "archivos_escritorio_copistas",
          "archivos_deposito_comun",
          "archivos_galeria_registros",
          "archivos_control_restringido",
          "archivos_sala_indices",
          "archivos_camara_copias",
          "archivos_mesa_restauracion"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "DESCONOCIDO",
        "R3": "SOSPECHA",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "SOSPECHA",
        "R10": "DESCONOCIDO"
      }
    },
    "lan_meihua": {
      "id": "lan_meihua",
      "nombre": "Lan Meihua",
      "rol": "Medicina / Alquimia",
      "sala_inicial": "consultorio_meridianos",
      "movilidad": "RUTA",
      "territorio_normal": [
        "consultorio_meridianos",
        "sala_tratamientos",
        "archivo_clinico"
      ],
      "anclajes_documentados": [
        "M10",
        "M11",
        "M16 (responsable Medicina)"
      ],
      "rutas": [
        [
          "consultorio_meridianos",
          "sala_tratamientos"
        ],
        [
          "consultorio_meridianos",
          "archivo_clinico"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "SOSPECHA",
        "R3": "DESCONOCIDO",
        "R4": "SABE",
        "R5": "DESCONOCIDO",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "chen_bo": {
      "id": "chen_bo",
      "nombre": "Chen Bo",
      "rol": "Instructor de Examen / Anatomía-Medicina",
      "sala_inicial": "sala_anatomica",
      "movilidad": "RUTA",
      "territorio_normal": [
        "sala_anatomica",
        "corredor_medicina",
        "archivo_clinico"
      ],
      "anclajes_documentados": [
        "M02 (Examen Espiritual)",
        "M10",
        "M16 (co-responsable Medicina)"
      ],
      "rutas": [
        [
          "sala_anatomica",
          "corredor_medicina"
        ],
        [
          "sala_anatomica",
          "archivo_clinico"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "SOSPECHA",
        "R5": "DESCONOCIDO",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "guo_chen": {
      "id": "guo_chen",
      "nombre": "Guo Chen",
      "rol": "Aspirante — trabajo material/persistencia, posible candidato a Segunda Rama",
      "sala_inicial": "patio",
      "movilidad": "RUTA",
      "territorio_normal": [
        "patio",
        "patio_marcial",
        "patio_campana"
      ],
      "anclajes_documentados": [
        "M01–M03 (GUO_01_OTRO_TURNO)",
        "M10 (GUO_03_SEGUNDA_RAMA, GUO_04_NO_DECIDAS_POR_MI, junto a Luo)",
        "M16 (GUO_05_RECURSOS_M16)"
      ],
      "rutas": [
        [
          "patio",
          "patio_campana"
        ],
        [
          "patio_campana",
          "patio_marcial"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    },
    "jiang_rui": {
      "id": "jiang_rui",
      "nombre": "Jiang Rui",
      "rol": "Capitán de patrulla",
      "sala_inicial": "puesto_valle",
      "movilidad": "RUTA",
      "territorio_normal": [
        "puesto_valle",
        "valle_explanada",
        "patio_puesto_valle"
      ],
      "anclajes_documentados": [
        "M04–M07 (ANCLADO en Cruce Patrullas → Sala Informes según avance)",
        "M16 (responsable Rutas)"
      ],
      "rutas": [
        [
          "puesto_valle",
          "valle_explanada"
        ],
        [
          "puesto_valle",
          "patio_puesto_valle"
        ]
      ],
      "conocimiento_inicial": {
        "R1": "SOSPECHA",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "DESCONOCIDO",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    }
  },
  "lairs": [
    {
      "id": "guarida_bruma",
      "room_id": "l3_bruma_18",
      "display": "Vereda de las Garzas",
      "resident": "garza_bruma_roca",
      "threat": "vigía aérea y huellas en raíces; señales de aproximación y ruta de escape",
      "mandatory_visit": false
    },
    {
      "id": "guarida_cueva",
      "room_id": "l3_cueva_17",
      "display": "Pozo del Geodo",
      "resident": "cangrejo_laja_humeda",
      "threat": "laja quebradiza y pasos estrechos; paredes marcadas por pinzas",
      "mandatory_visit": false
    },
    {
      "id": "guarida_luna",
      "room_id": "l3_luna_05",
      "display": "Remanso Turbio",
      "resident": "sanguijuela_remanso_turbio",
      "threat": "aguas densas y rastro de limo; contacto indebido en zona anegada",
      "mandatory_visit": false
    }
  ],
  "rooms": {
    "aguas_senda_bosque": {
      "name": "Senda del Cauce",
      "area": "aguas_barrancos"
    },
    "aguas_cauce_alto": {
      "name": "Cauce Alto",
      "area": "aguas_barrancos"
    },
    "aguas_paso_piedras": {
      "name": "Paso de las Piedras",
      "area": "aguas_barrancos"
    },
    "aguas_poza_clara": {
      "name": "Poza Clara",
      "area": "aguas_barrancos"
    },
    "aguas_refugio_cauce": {
      "name": "Refugio del Cauce",
      "area": "aguas_barrancos"
    },
    "aguas_terraza_humeda": {
      "name": "Terraza Húmeda",
      "area": "aguas_barrancos"
    },
    "aguas_inicio_barranco": {
      "name": "Inicio del Barranco",
      "area": "aguas_barrancos"
    },
    "aguas_garganta_norte": {
      "name": "Garganta Norte",
      "area": "aguas_barrancos"
    },
    "aguas_pasarela_roca": {
      "name": "Pasarela de Roca",
      "area": "aguas_barrancos"
    },
    "aguas_poza_profunda": {
      "name": "Poza Profunda",
      "area": "aguas_barrancos"
    },
    "aguas_cascada_velada": {
      "name": "Cascada Velada",
      "area": "aguas_barrancos"
    },
    "aguas_filtraciones_cantera": {
      "name": "Filtraciones de la Cantera",
      "area": "aguas_barrancos"
    },
    "aguas_paso_alto": {
      "name": "Paso Alto del Barranco",
      "area": "aguas_barrancos"
    },
    "aguas_garganta_sur": {
      "name": "Garganta Sur",
      "area": "aguas_barrancos"
    },
    "aguas_desvio_sauces": {
      "name": "Desvío hacia Sauces",
      "area": "aguas_barrancos"
    },
    "aguas_manantial_entrada": {
      "name": "Sendero del Manantial",
      "area": "aguas_barrancos"
    },
    "aguas_manantial_partido": {
      "name": "Manantial Partido",
      "area": "aguas_barrancos"
    },
    "aguas_rama_clara": {
      "name": "Rama Clara",
      "area": "aguas_barrancos"
    },
    "aguas_rama_oscura": {
      "name": "Rama Oscura",
      "area": "aguas_barrancos"
    },
    "aguas_cuenca_reunion": {
      "name": "Cuenca de Reunión",
      "area": "aguas_barrancos"
    },
    "aguas_camara_hidrica": {
      "name": "Cámara Hídrica",
      "area": "aguas_barrancos"
    },
    "aguas_conducto_antiguo": {
      "name": "Conducto Antiguo del Agua",
      "area": "aguas_barrancos"
    },
    "l3_bruma_01": {
      "name": "Umbral de la Bruma",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_02": {
      "name": "Raíces Suspendidas",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_03": {
      "name": "Claro del Rocío",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_04": {
      "name": "Puente de las Hojas",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_05": {
      "name": "Pinar Inclinado",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_06": {
      "name": "Vado de las Garzas",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_07": {
      "name": "Cornisa de la Bruma",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_08": {
      "name": "Poza de Cascajo",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_09": {
      "name": "Sauzal Alto",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_10": {
      "name": "Raíz Bermellón",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_11": {
      "name": "Claros del Aliento",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_12": {
      "name": "Meseta del Trueno",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_13": {
      "name": "Paso de la Laja",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_14": {
      "name": "Pasarela del Eco",
      "area": "bosque_bruma_ascendente"
    },
    "l3_cueva_01": {
      "name": "Grieta del Umbral",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_02": {
      "name": "Galería de Lajas",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_03": {
      "name": "Bóveda Resonante",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_04": {
      "name": "Cornisa de Estalactitas",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_05": {
      "name": "Puente Calcáreo",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_06": {
      "name": "Foso de las Pinzas",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_07": {
      "name": "Bancal de Hongos",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_08": {
      "name": "Cámara de Vapor",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_09": {
      "name": "Veta Esmeralda",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_10": {
      "name": "Nido de Lajas",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_11": {
      "name": "Pozas Termales",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_12": {
      "name": "Salón de Ceniza",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_13": {
      "name": "Boca del Río Subterráneo",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_14": {
      "name": "Galería de la Luna Ciega",
      "area": "cueva_jade_resonante"
    },
    "l3_luna_01": {
      "name": "Umbral de las Fuentes",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_02": {
      "name": "Las Tres Fuentes",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_03": {
      "name": "Terraza del Espejo",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_04": {
      "name": "Orilla de la Luna",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_05": {
      "name": "Remanso Turbio",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_06": {
      "name": "Jardín de Rocío",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_07": {
      "name": "Gruta del Musgo",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_08": {
      "name": "Lámina Reflejada",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_09": {
      "name": "Canal del Silencio",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_10": {
      "name": "Bancal de Jade",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_11": {
      "name": "Velo de Agua",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_12": {
      "name": "Corriente de Plata",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_13": {
      "name": "Puerta del Retorno",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_14": {
      "name": "Umbral Profundo",
      "area": "manantiales_espejo_lunar"
    },
    "l3_bruma_15": {
      "name": "Mirador de las Copas",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_16": {
      "name": "Escalinata de Raíces",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_17": {
      "name": "Santuario del Rocío",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_18": {
      "name": "Vereda de las Garzas",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_19": {
      "name": "Barranco del Musgo",
      "area": "bosque_bruma_ascendente"
    },
    "l3_bruma_20": {
      "name": "Puerta de los Helechos",
      "area": "bosque_bruma_ascendente"
    },
    "l3_cueva_15": {
      "name": "Salón de los Ecos",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_16": {
      "name": "Pasadizo de Agujas",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_17": {
      "name": "Pozo del Geodo",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_18": {
      "name": "Lago del Silencio",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_19": {
      "name": "Codo de Calcedonia",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_20": {
      "name": "Terrazas de Estalactitas",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_21": {
      "name": "Cámara de la Flor Fósil",
      "area": "cueva_jade_resonante"
    },
    "l3_cueva_22": {
      "name": "Umbral del Río Interior",
      "area": "cueva_jade_resonante"
    },
    "l3_luna_15": {
      "name": "Laguna de los Pétalos",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_16": {
      "name": "Isla de la Luna Nueva",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_17": {
      "name": "Estero de la Plata",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_18": {
      "name": "Fuente de Dos Cielos",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_19": {
      "name": "Terraza del Loto Gris",
      "area": "manantiales_espejo_lunar"
    },
    "l3_luna_20": {
      "name": "Vado del Retorno",
      "area": "manantiales_espejo_lunar"
    }
  },
  "t2_hunt_contract": {
    "definition": "T2 es tier adaptativo de comportamiento de población/individuo normal; NO significa etapa de cultivo LianQi II ni variante MUTANTE.",
    "stage_relation": "TODOS los objetivos T2, incluidos M09 opcional, M10 y M12, exigen especie normal cuya etapa nativa sea LianQi_III. No basta con que el combate ocurra dentro de una sala de LianQi III si la especie pertenece a I o II.",
    "tier_qualification": "T2_REAL_O_SUPERIOR (tier efectivo >=2 al inicio del encuentro, con T2 incluido en el kit; no T0/T1 que ascienden por un texto de misión).",
    "why_at_least_two": "Evita soft-lock si una población evoluciona a T3/T4; los tiers acumulativos conservan T2. El informe del diario lo presenta como T2 mínimo.",
    "event_requirements": [
      "misión en progreso y objetivo activo",
      "tipo de especie NORMAL repetible, tier efectivo >=2 derivado del proveedor nativo de presión adaptativa",
      "stage de especie comprobado por catálogo canónico = LianQi_III para M09, M10 y M12; no derivar etapa solo por sala.",
      "derrota confirmada por motor con combat_id, unique_instance_id y event_id inmutables",
      "loot no obligatorio ni validación por nombre/sufijo visual",
      "sin reutilizar recibos M08 MUTANTE ni una victoria en dos objetivos T2",
      "persiste en SAVE y es idempotente; sin recontar al recargar ni combatir de nuevo una instancia resucitada",
      "contadores por objetivo cuantificados y subcuotas por bioma/especie/sala; 3 eventos M10, 3 M12, 2 M09, nunca un solo booleano"
    ],
    "excludes": [
      "T0",
      "T1",
      "boss",
      "guardian",
      "unique",
      "elite",
      "MUTANT (se reserva para los 3 objetivos distintos de M08)",
      "kit simulado",
      "combates de laboratorio/fixture",
      "repetición de muerte",
      "especie normal nativa LianQi I en cualquier sala",
      "especie normal nativa LianQi II en cualquier sala"
    ],
    "natural_access": "T2 debe aparecer por presión adaptativa real y ser rastreable con pistas/comandos; no generar T2 fijos artificiales ni subir tier al aceptar una misión.",
    "tier_status_by_stage": {
      "LianQi_I": "Contrato congelado histórico para cadena LI; verificar conexión A08 real",
      "LianQi_II": "T0/T1/T2 preservados en V46; verificar certificación A08 real",
      "LianQi_III": "T1-T4 experimental/diseño V46 y ratificación parcial V118; no asumir T2 vivo en R57"
    },
    "required_total": 6,
    "optional_total": 2,
    "required_objective_ids": [
      "m10_t2_01",
      "m12_t2_01"
    ],
    "optional_objective_ids": [
      "m09_t2_01"
    ],
    "counting": "M09 opcional 0/2 normales LIII T2+; M10 obligatorio 0/3 (1 Cueva, 1 Manantiales, tercero libre); M12 obligatorio 0/3 Bosque (1 garza en Vereda, 2 más normales del Bosque). Además M08 tres mutantes separados LI/II/III.",
    "difficulty_guard": "V06 eleva las victorias T2 a seis obligatorias. Auditar presión adaptativa real LIII, respawn y duración de arco. Si un T2 LIII no es alcanzable, NO activar gates en R57.",
    "stage_strict": "LianQi_III_UNICAMENTE_M09_M10_M12",
    "all_t2_stages": [
      "LianQi_III"
    ],
    "total_t2": 8,
    "mission_targets": {
      "M09": {
        "mandatory": false,
        "count": 2,
        "areas": [
          "aguas_barrancos",
          "bosque_bruma_ascendente",
          "cueva_jade_resonante",
          "manantiales_espejo_lunar"
        ],
        "constraint": "cualquier normal LIII T2+ con muertes distintas"
      },
      "M10": {
        "mandatory": true,
        "count": 3,
        "areas": [
          "cueva_jade_resonante",
          "manantiales_espejo_lunar"
        ],
        "minimum_by_area": {
          "cueva_jade_resonante": 1,
          "manantiales_espejo_lunar": 1
        },
        "third": "libre entre ambas"
      },
      "M12": {
        "mandatory": true,
        "count": 3,
        "areas": [
          "bosque_bruma_ascendente"
        ],
        "at_least_one": {
          "species": "garza_bruma_roca",
          "room_id": "l3_bruma_18"
        }
      }
    },
    "strict_unique_receipts": "Cada kill_id / instance_id se acredita una sola vez globalmente, sin traspasar una victoria entre misiones; misma especie es válida en combates de individuos diferentes. No contar kills previas a la misión activa sin decisión explícita."
  },
  "change_log": [
    "M08 preserva 3 mutantes auténticos: 1 LI + 1 LII + 1 LIII (ni menos ni más).",
    "M09 añade cacería T2 opcional en LI/II vinculada a un anexo de archivos; la historia no depende de matar.",
    "M10 añade 1 cacería T2 obligatoria en Cueva del Jade O Manantiales, elección libre.",
    "M11 no recibe combates; conserva síntesis de M08-M10.",
    "M12 añade 1 cacería T2 obligatoria en Bosque de Bruma para despejar el acceso de un equipo técnico, SIN sustituir evidencia CONCLUYENTE ni Custodio.",
    "Ningún nodo/encuentro del atlas V03 se modifica; T2 requiere un tier nativo auténtico y comprobante de victoria, no icono de mapa.",
    "V05 rectifica M09: TODO monstruo T2 de las tres cacerías (incluso opcional) debe pertenecer a LianQi III; se rechaza LI/II aunque llegue a T2 real."
  ],
  "schema": "LGB_LIII_QUESTS_T2_MORE_HUNTS_V06"
}
});
 const m15=connectM15({runtime,bridge,input});
 const livMissions=connectLivMissions({runtime,bridge,input,m15Completed:()=>m15.completed(),a09:a09Host,definitions:questDefinitions,rooms:roomDefinitions,source:{
  "meta": {
    "proyecto": "La Grulla Blanca — Arco 1",
    "documento": "Auditoria_6_Misiones_M01_M18_Estructurada",
    "version": "1.0",
    "fecha_generacion": "2026-09-22",
    "alcance": "PROLOGO + M01-M18, documental. No incluye las 329 rooms, migracion 40->329 (M2), NPC/movilidad (Auditoria 5), ni implementacion (3C). No modifica ver68.",
    "jerarquia_fuentes": [
      "1. Decisiones explicitas nuevas (Backup Maestro de Continuidad 2026-09-21)",
      "2. Auditoria_3U_Mapa_329_Salas_CANONICA.md",
      "3. Topologia_329_Estructurada_v2.json",
      "4. Auditoria_3B_Validacion_Topologia_329.md (solo diagnostico historico; 3B2 no fue adjuntado, se usa 3B/3U como equivalentes disponibles)",
      "5. La_Grulla_Blanca_Fuente_Maestra_Fusionada_ver55.md",
      "6. Auditoria_C1_Maquinas_Narrativas_Companeros.md",
      "7. Auditoria_M1_Dependencias_Rooms_ver67.md",
      "8. Auditoria_4B_Movilidad_Postas_Carruajes_CORREGIDA.md",
      "9. Informe_Etapa_2B_Atlas_Areas.md",
      "10. grulla-blanca_ver68.html (solo comparacion tecnica)"
    ],
    "nota_metodologica": "Las fichas de mision (P + M01-M18) se reconstruyeron principalmente a partir de los turnos que el propio Backup Maestro (seccion 50) senala como fuentes principales de la Auditoria 6: T286 (Prologo+M01-M03), T287 (M04-M07), T288 (M08-M12), T289 (M13-M15), T290 (M17-M18), mas T281 (diseno original de M16, unica version de M16 encontrada en la Fuente Maestra: no existe una revision M16 posterior a T281 dentro de ver55, que termina en T293), T254 (matriz maestra con columnas REQUIERE/PRODUCE/ABRE/NPC/gates/companeros) y T257 (contrato de idempotencia). T168/T169/T197/T222 son versiones mas tempranas de la misma columna vertebral narrativa; se revisaron sus encabezados para confirmar que T254/T286-290 no las contradicen en ningun punto detectado, por lo que no se citan como fuente independiente en cada ficha. El Backup Maestro de Continuidad no contiene fichas narrativas propias de M01-M18 (su seccion 51 es solo una matriz resumida REQUIERE/PRODUCE que coincide con T254); su autoridad maxima aplica a topologia, IDs de area y estado de proyecto, no aporta contenido narrativo adicional o distinto sobre las misiones.",
    "verificacion_tecnica_ver68": {
      "metodo": "grep directo sobre 'QUESTS =', 'MISIONES_ACTO_1' y nombres propios (Fan Ji, ratas, etc.) en grulla-blanca_ver68.html.",
      "resultado": "ver68 implementa unicamente la campana narrativa antigua (Acto I-IV): ratas, duelo (Fan Ji), hierbas, origen_personal, huerto_jade (opcional), jade (Shen Liang), veta_y_horno (opcional), peces_lunares, devoradores, memorias_verticales, reliquias_verticales, cazadores_verticales (opcional), guardianes_ocultos (opcional). No existe ninguna estructura P/M01-M18, ni arc1.estado, ni los permisos del nuevo diseno (PATRULLA_TERRITORIAL, SECTA_INTERIOR, FORMACIONES_INVESTIGACION, NUCLEO_PROFUNDO, etc.). Por tanto TODAS las misiones P-M18 son NO_IMPLEMENTADO en ver68 salvo donde se identifica explicitamente contenido legacy que las fuentes narrativas declaran reemplazado (LEGACY_A_REEMPLAZAR): M02<-ratas, M03<-duelo/Fan Ji, M12/M17<-reliquias_verticales (Sombra/Centinela como llaves), M18<-tramo final eco_grulla/altar/reliquias. El resto de contenido legacy (jade/Shen Liang, huerto_jade, veta_y_horno, peces_lunares, devoradores, memorias_verticales, cazadores_verticales, guardianes_ocultos, origen_personal) no tiene una correspondencia declarada en las fuentes leidas con ninguna mision P-M18 especifica; su destino (eliminar / convertir en contenido lateral opcional / Arc2) queda NO CERRADO EN FUENTE para efectos de esta auditoria."
    },
    "salas_329_verificadas_en_topologia_v2": [
      "patio_raices",
      "descansillo",
      "mirador_niebla",
      "patio_practica",
      "sendero_pinos",
      "camino",
      "puerta",
      "registro",
      "sala_jade",
      "dormitorio_externos",
      "bosque_refugio_patrulla",
      "sauces_casa_huespedes",
      "formaciones_sello_antiguo",
      "formaciones_descenso_tecnico",
      "ala_vestibulo",
      "ala_nudo_seis_corrientes",
      "ala_camara_dos_alas",
      "ala_umbral_mantenimiento",
      "mantenimiento_acceso",
      "mantenimiento_dormitorio_turnos",
      "mantenimiento_compuerta_nucleo",
      "nucleo_pozo_voto",
      "nucleo_camara_voto",
      "nucleo_galeria_primer_pacto",
      "nucleo_primer_pacto",
      "nucleo_archivo_promesa",
      "nucleo_descenso_pulso",
      "nucleo_galeria_pulso",
      "nucleo_camara_regulacion",
      "nucleo_sala_relevo",
      "nucleo_exterior_ancla",
      "nucleo_camara_memoria",
      "nucleo_umbral_santuario",
      "nucleo_santuario_vinculo",
      "mojon_regional"
    ],
    "convencion_etiquetas": [
      "CONFIRMADO_329 / ID_HISTORICO / DESTINO_329_PENDIENTE / EXTERNO_ARC1_DOCUMENTADO (anclajes espaciales)",
      "NO CERRADO EN FUENTE / NO RECUPERADO / NO FORMALIZADO / PROPUESTA_NO_CANONICA / OBSOLETO / DECISION_HUMANA_PENDIENTE (huecos)"
    ]
  },
  "missions": [
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Tao Ming",
        "guardia de la Puerta Roja",
        "ayudante de ingreso"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [
        "patio_raices",
        "descansillo",
        "mirador_niebla",
        "patio_practica",
        "sendero_pinos",
        "camino",
        "puerta",
        "registro"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "entrada a LI"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [],
      "flags_creados": [
        "estadoAfiliacion=ADMITIDO",
        "raiz elegida (persistente, no se vuelve a sortear)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": 0,
        "contribucion": 0,
        "notas": "Recompensa puramente institucional: acceso a Registro. Equipo inicial (uniforme gris de ingreso + espada de madera) en descansillo."
      },
      "consecuencias": [],
      "dependencias_posteriores": [],
      "idempotencia": "Volver a `registro` tras cerrar el Prologo no repite tutorial ni reasigna raiz (T257).",
      "eventos_one_shot": [
        "REGISTRO_INICIAL_COMPLETADO",
        "sorteo/eleccion de raiz"
      ],
      "eventos_repetibles": [
        "MEDITAR en mirador_niebla",
        "practica opcional en patio_practica"
      ],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [
        {
          "tema": "Presentacion publica de la fundacion",
          "obsoleto": "Version antigua de ver55 presenta la leyenda de la Grulla como hecho llano.",
          "canonico": "Se reescribe como 'version publica que se cuenta' (leyenda), reservando la verdad (R1-R10) para mucho despues.",
          "fuente": "T286"
        }
      ],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "Texto final exacto de la leyenda pendiente de integrarse a ver68/implementacion (M2/3C)."
      ],
      "id": "P",
      "nombre": "La Piedra y la Puerta",
      "etapa_arc1": "PROLOGO",
      "requiere": [
        "Nueva Partida valida"
      ],
      "produce": [
        "estadoAfiliacion=ADMITIDO",
        "PROLOGO=HECHO",
        "arc1.estado=LI_INTEGRACION"
      ],
      "abre": [
        "M01"
      ],
      "areas": [
        "acceso"
      ],
      "condicion_disponibilidad": "Nueva Partida (personaje recien creado).",
      "condicion_activacion": "Automatica al crear personaje; recorrido patio_raices->registro.",
      "condicion_finalizacion": "Evento REGISTRO_INICIAL_COMPLETADO en `registro` (Tao Ming)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Tao Ming",
        "Madre Wen",
        "Gao Shun (opcional)"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [
        "registro",
        "sala_jade",
        "dormitorio_externos"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "'patio exterior' / 'Cabañas' citados en T286 sin room_id 329 literal confirmado en las fuentes leidas; requiere M2."
      ],
      "gates": [
        "necesaria para continuar LI"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Presentarse/inscribirse en Sala de Jade (NOMBRE_INSCRITO, una sola vez)",
        "Recibir alojamiento de Madre Wen"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [],
      "flags_creados": [
        "NOMBRE_INSCRITO",
        "rango=ASPIRANTE",
        "SECTA_EXTERIOR_BASE",
        "alojamiento_conocido.dormitorio_externos=true"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": 0,
        "contribucion": 0,
        "notas": "Recompensa institucional pura: pertenencia + primer alojamiento conocido garantizado (destino de rescate para el futuro sistema de muerte/recuperacion)."
      },
      "consecuencias": [],
      "dependencias_posteriores": [],
      "idempotencia": "Repetir EXAMINAR TAJO/MURO tras NOMBRE_INSCRITO produce texto de repeticion, no reprocesa el evento (T286, T257).",
      "eventos_one_shot": [
        "NOMBRE_INSCRITO",
        "ALOJAMIENTO_CONFIRMADO"
      ],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Aparicion incidental de varios companeros durante la promocion (T254)."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "Room_id 329 exacto para 'patio exterior'/'Cabañas Externas' citado en fase 3 (DESTINO_329_PENDIENTE)."
      ],
      "id": "M01",
      "nombre": "Un nombre entre miles",
      "etapa_arc1": "LI_INTEGRACION",
      "requiere": [
        "PROLOGO=HECHO",
        "arc1.estado=LI_INTEGRACION"
      ],
      "produce": [
        "rango=ASPIRANTE",
        "SECTA_EXTERIOR_BASE",
        "alojamiento conocido: dormitorio_externos"
      ],
      "abre": [
        "M02 (junto con otras condiciones)"
      ],
      "areas": [
        "secta_exterior"
      ],
      "condicion_disponibilidad": "PROLOGO=HECHO.",
      "condicion_activacion": "Conversacion formal con Tao Ming en Registro (no basta con entrar a la sala).",
      "condicion_finalizacion": "Evento ALOJAMIENTO_CONFIRMADO (Madre Wen asigna cama en dormitorio_externos)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Tao Ming / Ma Qiren o Madre Wen (informan)",
        "Chen Bo (ensena Examen)"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "Almacen/despensa exterior concreto de M02: sin room_id 329 literal en las fuentes leidas (DESTINO_329_PENDIENTE)."
      ],
      "gates": [
        "'primer servicio formal' es componente del gate LI->LII"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Investigar el almacen/despensa",
        "Combatir/resolver una Rata de qi de mision",
        "Aprender Examen Espiritual con Chen Bo"
      ],
      "objetivos_opcionales": [
        "Extraer material del cadaver (no obligatorio para cerrar la mision)"
      ],
      "evidencias": [],
      "revelaciones": [],
      "flags_creados": [
        "primerServicioFormal=true",
        "EXAMEN_ESPIRITUAL_APRENDIDO"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": 0,
        "contribucion": "pequeña",
        "notas": "Primera vez que el jugador recibe Contribucion; sin Merito (trabajo rutinario)."
      },
      "consecuencias": [],
      "dependencias_posteriores": [],
      "idempotencia": "El cadaver/material de mision no puede duplicarse indefinidamente; si desaparece o el jugador abandona la zona debe existir recuperacion narrativa controlada, no reaparicion infinita (T257).",
      "eventos_one_shot": [
        "EXAMEN_ESPIRITUAL_APRENDIDO"
      ],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "Explicitamente sinalado en fuente: evitar duplicacion de recursos si el tutorial de Examen se repite (T257).",
      "relacion_companeros": [
        "Guo y Han pueden aparecer en actividad laboral (T254)."
      ],
      "estado_ver68": "LEGACY_A_REEMPLAZAR",
      "conflictos_historicos": [
        {
          "tema": "M02 reemplaza la mision de las ratas",
          "obsoleto": "ver68: quest 'ratas' ('La plaga de la despensa') exige matar exactamente 3 Ratas de qi y entrega recompensa generica de Contribucion+piedras+experiencia.",
          "canonico": "M02: un solo encuentro con una Rata de qi, enfoque en aprender Examen Espiritual real; la mision NO depende de una extraccion exitosa; recompensa es servicio+Examen+Contribucion pequeña, sin piedras/experiencia genericas.",
          "fuente": "T286 vs grulla-blanca_ver68.html (const QUESTS.ratas)"
        }
      ],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "Room_id 329 exacto del almacen/despensa de M02: DESTINO_329_PENDIENTE."
      ],
      "id": "M02",
      "nombre": "Trabajo que alguien debe hacer",
      "etapa_arc1": "LI_INTEGRACION",
      "requiere": [
        "M01=HECHA"
      ],
      "produce": [
        "primerServicioFormal=true",
        "Examen Espiritual desbloqueado",
        "Contribucion pequeña"
      ],
      "abre": [
        "M03 (junto con otras condiciones)"
      ],
      "areas": [
        "secta_exterior"
      ],
      "condicion_disponibilidad": "M01=HECHA.",
      "condicion_activacion": "Aceptar el servicio (revisar almacen/despensa) con Tao Ming/Ma Qiren/Madre Wen.",
      "condicion_finalizacion": "Entrega/validacion del servicio: Examen realizado correctamente + informacion sobre el ejemplar obtenida (NO depende de una extraccion exitosa de material)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Shen Baojun",
        "Qiao Ren (supervision institucional, no obligatoria en escena)"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "'sector marcial / Respiracion / Disciplina' sin room_id 329 literal citado en las fuentes leidas."
      ],
      "gates": [
        "gate LI->LII: qi>=25 + rango==DISCIPULO_EXTERNO + primerServicioFormal + evaluacionCirculacion==SUPERADA"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Instruccion con Shen Baojun (incluye ensenanza de Piel de Cobre)",
        "Practica contra el muneco de entrenamiento (respuesta valida: Piel de Cobre u otra legitima: DEFENDER/evasion/control)",
        "Evaluacion de circulacion (MEDITAR o equivalente contextual)"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [],
      "flags_creados": [
        "evaluacionCirculacion=SUPERADA",
        "rango=DISCIPULO_EXTERNO",
        "estadoAfiliacion=MIEMBRO"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": 0,
        "contribucion": "posible pequeña",
        "notas": "La recompensa central es el cambio de rango, no economica."
      },
      "consecuencias": [],
      "dependencias_posteriores": [],
      "idempotencia": "La evaluacion puede practicarse de nuevo despues, pero la promocion de rango ocurre una sola vez (T257).",
      "eventos_one_shot": [
        "EVALUACION_CIRCULACION_SUPERADA",
        "promocion Aspirante->Discipulo Externo"
      ],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Lin, Han y Luo tienen mayor presencia potencial (T254). Posible escena breve de evaluacion paralela de un companero."
      ],
      "estado_ver68": "LEGACY_A_REEMPLAZAR",
      "conflictos_historicos": [
        {
          "tema": "M03 reemplaza el duelo con Fan Ji",
          "obsoleto": "ver68: quest 'duelo' ('El arrogante') exige derrotar a Fan Ji en la arena, con eleccion ejecutar/perdonar y recompensa de Contribucion+piedras+experiencia+decision de Dao.",
          "canonico": "M03: evaluacion de circulacion e intencion bajo presion con el muneco de entrenamiento, sin duelo con un NPC humano; unica promocion real de Arc1 (Aspirante->Discipulo Externo); sin piedras/experiencia generica.",
          "fuente": "T286 vs grulla-blanca_ver68.html (const QUESTS.duelo, fan_ji)"
        }
      ],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "Room_id 329 exacto del sector marcial: DESTINO_329_PENDIENTE.",
        "'Si CONSAGRAR exige literalmente 25/25' queda explicitamente abierto en T286 (a revisar al adaptar progresion de ver55): NO CERRADO EN FUENTE."
      ],
      "id": "M03",
      "nombre": "Aprender a permanecer",
      "etapa_arc1": "LI_INTEGRACION",
      "requiere": [
        "M01=HECHA",
        "M02=HECHA",
        "condiciones basicas de cultivo apropiadas"
      ],
      "produce": [
        "rango: ASPIRANTE->DISCIPULO_EXTERNO",
        "estadoAfiliacion=MIEMBRO",
        "evaluacionCirculacion=SUPERADA",
        "acceso a Piel de Cobre como formacion basica"
      ],
      "abre": [
        "M04 (tras gate LI->LII)"
      ],
      "areas": [
        "secta_exterior"
      ],
      "condicion_disponibilidad": "M01 y M02 HECHAS.",
      "condicion_activacion": "Shen Baojun inicia la formacion (instruccion + practica).",
      "condicion_finalizacion": "Evento EVALUACION_CIRCULACION_SUPERADA (no exige llenar el vaso a 25/25; comprueba estabilizacion, finalizacion del ejercicio y ausencia de estado critico)."
    },
    {
      "npc_anclados": [
        {
          "npc": "Gao Shun",
          "sala": "Puerta Roja (region secta_exterior)",
          "condicion": "ANCLADO durante el objetivo obligatorio de M04; vuelve a movilidad normal despues (Backup Maestro §40)."
        }
      ],
      "npc_relevantes": [
        "Jiang Rui"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [
        "bosque_refugio_patrulla"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "componente del servicio territorial LII"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Revisar tramo de camino / puesto / refugio",
        "Regresar con informe breve"
      ],
      "objetivos_opcionales": [
        "Inspeccionar senal caida/huellas del 'incidente de servicio'"
      ],
      "evidencias": [
        "observacion FAUNA_FUERA_DE_RANGO, estado NO_INTERPRETADA (no genera evidencia R1 todavia)"
      ],
      "revelaciones": [],
      "flags_creados": [
        "PATRULLA_TERRITORIAL=activa_permanente",
        "refugio bosque_refugio_patrulla conocido (seguro=true, purifica=false)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": "posible pequeño si hay incidente real (no por caminar la ruta normal)",
        "contribucion": "pequeña"
      },
      "consecuencias": [],
      "dependencias_posteriores": [],
      "idempotencia": "Si el jugador ya visito alguna zona antes, la mision reconoce ese conocimiento espacial; no obliga a 'redescubrir' (T257).",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Lin especialmente adecuada (T254); Luo tambien con presencia potencial."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "No hay evidencia de que M04 reemplace contenido especifico de ver68 (region no cubierta por el Acto I-IV legacy)."
      ],
      "id": "M04",
      "nombre": "Más allá de la Puerta Roja",
      "etapa_arc1": "LII_TERRITORIO",
      "requiere": [
        "arc1.estado=LII_TERRITORIO (tras gate LI->LII)",
        "rango=DISCIPULO_EXTERNO"
      ],
      "produce": [
        "PATRULLA_TERRITORIAL (permiso, fuente=MISION, origen=M04)",
        "refugio bosque_refugio_patrulla conocido"
      ],
      "abre": [
        "M05"
      ],
      "areas": [
        "secta_exterior",
        "bosques"
      ],
      "condicion_disponibilidad": "arc1.estado=LII_TERRITORIO + Discipulo Externo.",
      "condicion_activacion": "Asignacion de Jiang Rui (primera salida de servicio).",
      "condicion_finalizacion": "Regreso/validacion de la primera salida ante Jiang Rui (informe breve)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Duan Shibo o Jiang Rui",
        "Han Qiao (opcional, HAN_02_PROCEDIMIENTO)",
        "Xu An",
        "Mei Shufen"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [
        "sauces_casa_huespedes"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "Rooms especificas del Valle/Produccion recorridas en M05 (graneros, puestos de intercambio): sin room_id 329 literal citado."
      ],
      "gates": [
        "contribuye al conocimiento territorial (no es gate duro por si sola)"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Paso por el Valle",
        "Llegada a Sauces y conversacion con Xu An",
        "Registrar la modificacion del circuito"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [],
      "flags_creados": [
        "reconocimientoSauces=HUESPED",
        "sauces_casa_huespedes conocido (seguro=true, purifica=true)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": "normalmente pequeño o ninguno, salvo incidente extraordinario",
        "contribucion": "pequeña/moderada"
      },
      "consecuencias": [],
      "dependencias_posteriores": [],
      "idempotencia": "reconocimientoSauces=HUESPED es relacion local, no autorizacion institucional; no se crea flag redundante 'SaucesExiste' (Sauces ya existia) (T257).",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "MEI_03_REGRESO_SAUCES puede ocurrir aqui si Mei acompaña; HAN_02_PROCEDIMIENTO en el Valle."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "Primera ruta 'occidental Cantera/Bosque' vs 'oriental Agua/Jardines' (Backup Maestro §40): declarado explicitamente NO exclusion permanente, sin decision final de cual se usa por defecto."
      ],
      "id": "M05",
      "nombre": "Los caminos de la Grulla",
      "etapa_arc1": "LII_TERRITORIO",
      "requiere": [
        "M04=HECHA o servicio territorial suficientemente iniciado"
      ],
      "produce": [
        "reconocimientoSauces=HUESPED",
        "sauces_casa_huespedes conocido (alojamiento)"
      ],
      "abre": [
        "M06 (como parte de la combinacion de condiciones)"
      ],
      "areas": [
        "valle",
        "produccion",
        "sauces"
      ],
      "condicion_disponibilidad": "M04 HECHA o servicio territorial suficientemente iniciado.",
      "condicion_activacion": "Encargo que conecta secta con Valle/Sauces (revision de ruta de intercambio).",
      "condicion_finalizacion": "Confirmacion de que el jugador comprendio/ejecuto la ruta institucional (registro de la modificacion en Sauces)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Jiang Rui",
        "Ma Gu",
        "patrullas",
        "Zhao Wen/Mei Lian/Lin Yue (segun lugar)"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "Rooms especificas de avistamiento no citadas literalmente."
      ],
      "gates": [],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Reunir evidencia semantica suficiente (DESPLAZAMIENTO_FAUNA / ALTERACION_VEGETAL / ALTERACION_HIDRICA / PATRON_TERRITORIAL); diversidad > cantidad"
      ],
      "objetivos_opcionales": [],
      "evidencias": [
        "DESPLAZAMIENTO_FAUNA",
        "ALTERACION_VEGETAL",
        "ALTERACION_HIDRICA",
        "PATRON_TERRITORIAL"
      ],
      "revelaciones": [
        {
          "id": "R1",
          "nivel": "PARCIAL",
          "mision": "M06"
        }
      ],
      "flags_creados": [
        "evidenciaTerritorial>=SUFICIENTE"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": "limitado, no se ha formalizado conclusion",
        "contribucion": "sí"
      },
      "consecuencias": [],
      "dependencias_posteriores": [],
      "idempotencia": "No existe objetivo tipo 'ANOMALÍAS 0/4'; el evaluador es semantico, no un contador estricto (T257).",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Zhao insiste en 'patron posible, todavia no causa'; Jiang Rui aporta experiencia; Mei y Lin pueden aportar avistamientos."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M06",
      "nombre": "Lo que no debería estar aquí",
      "etapa_arc1": "LII_TERRITORIO",
      "requiere": [
        "M04 y M05 suficientes para conocer el territorio (no exige combinacion unica)"
      ],
      "produce": [
        "conocimiento.anomaliasTerritoriales -> SOSPECHA/PARCIAL fuerte",
        "R1=PARCIAL"
      ],
      "abre": [
        "M07"
      ],
      "areas": [
        "bosques",
        "aguas_barrancos",
        "cantera_vetas"
      ],
      "condicion_disponibilidad": "Combinacion razonable de M04/M05 HECHAS + alguna observacion territorial sospechosa (no hay combinacion unica).",
      "condicion_activacion": "Primer incidente reconocido como anomalo (mision formal o reinterpretacion de una observacion previa NO_INTERPRETADA).",
      "condicion_finalizacion": "evaluarEvidenciaTerritorial() alcanza SUFICIENTE (CONCLUYENTE mejora dialogo/preparacion pero no es obligatorio)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Jiang Rui",
        "Qiao Ren",
        "He Zhen (consulta breve, no revela R2)",
        "Ren Bo",
        "Su Lian"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "Sala donde se prepara/entrega el informe: sin room_id 329 literal."
      ],
      "gates": [
        "requisito narrativo principal para gate LII->LIII"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Preparar el informe (interfaz contextual con arc1.evidencia.territorial)",
        "Elegir grado de certeza en la formulacion (afirmacion fuerte vs cauta; se puede corregir sin penalizacion si Qiao Ren/Jiang Rui la cuestionan)"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R1",
          "nivel": "CONFIRMADO",
          "mision": "M07"
        }
      ],
      "flags_creados": [
        "informeFronteraAceptado=true",
        "conocimiento.anomaliasTerritoriales=CONFIRMADO",
        "difusion institucional (Jiang Rui, Qiao Ren, He Zhen, Ren Bo, Su Lian y autoridades)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [
        "HISTORY candidato: PRESENTAR_EVIDENCIA_INCIERTA."
      ],
      "recompensas": {
        "comprension": "+1 (ARC1_M07_PATRON_TERRITORIAL)",
        "merito": "significativo",
        "contribucion": "moderada",
        "notas": "Prestigio puede modificarse ligeramente segun conducta conocida durante el proceso."
      },
      "consecuencias": [
        "No concede SECTA_INTERIOR todavia (se concede al entrar oficialmente en LIII, tras el avance de cultivo, evento separado)."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "Equivocar el grado de certeza no falla la mision ni reduce Merito/Prestigio ni obliga a repetir M06 (T287).",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Zhao y Luo con mayor presencia potencial en la formulacion del informe."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M07",
      "nombre": "Informe de frontera",
      "etapa_arc1": "LII_TERRITORIO",
      "requiere": [
        "M06=HECHA",
        "evidenciaTerritorial>=SUFICIENTE"
      ],
      "produce": [
        "informeFronteraAceptado=true",
        "R1=CONFIRMADO",
        "Comprension +1 (ARC1_M07_PATRON_TERRITORIAL)"
      ],
      "abre": [
        "M08, M09, M10 (tras gate LII->LIII y avance de cultivo)"
      ],
      "areas": [
        "secta_exterior"
      ],
      "condicion_disponibilidad": "M06 HECHA y evidencia suficiente.",
      "condicion_activacion": "Decision explicita del jugador de presentar el informe.",
      "condicion_finalizacion": "Evento INFORME_ACEPTADO (revision de Jiang Rui/Qiao Ren; He Zhen puede recibir copia)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "He Zhen",
        "Wen Tao"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "Puntos de medicion exteriores revisitados de M04-M07 y 'Sala de Mapas de Flujo': sin room_id 329 literal confirmado (aunque el area Formaciones si esta confirmada en topologia v2)."
      ],
      "gates": [
        "componente de M11"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Lectura inicial (visitar puntos ya conocidos de M04-M07)",
        "Trabajo de campo",
        "Comparacion en el centro de Formaciones",
        "Confirmacion en sector/nodo independiente"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R2",
          "nivel": "CONFIRMADO",
          "mision": "M08"
        }
      ],
      "flags_creados": [],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": "moderado",
        "contribucion": "sí",
        "notas": "No concede Comprension aqui: es observacion tecnica, no sintesis (llegara en M11)."
      },
      "consecuencias": [
        "FORMACIONES_INVESTIGACION permanece activo para los sectores correspondientes tras cerrar M08."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE (no se detalla explicitamente en T257 mas alla del contrato general BLOQUEADA/DISPONIBLE/ACTIVA/HECHA)",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Zhao/Luo posibles."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M08",
      "nombre": "Una montaña que no coincide consigo misma",
      "etapa_arc1": "LIII_INVESTIGACION",
      "requiere": [
        "arc1.estado=LIII_INVESTIGACION",
        "SECTA_INTERIOR concedido"
      ],
      "produce": [
        "FORMACIONES_INVESTIGACION (permiso)",
        "R2=CONFIRMADO"
      ],
      "abre": [
        "M11 (junto con M09/M10)"
      ],
      "areas": [
        "formaciones"
      ],
      "condicion_disponibilidad": "LIII + acceso interior (SECTA_INTERIOR).",
      "condicion_activacion": "He Zhen concede FORMACIONES_INVESTIGACION y proporciona marco/instrumentacion.",
      "condicion_finalizacion": "Repeticion de medicion en otro sector/nodo independiente confirma la discrepancia (no es fallo de instrumento).",
      "orden_relativo": "M08/M09/M10 son paralelas: el orden es libre; ninguna misión cambia su revelacion esencial segun el orden (T288)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Song Rui",
        "Zhao Wen",
        "Qiao Ren (autoriza ARCHIVO_RESTRINGIDO)",
        "Luo Yan (discusion)",
        "Yu Shun"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "componente de M11"
      ],
      "autorizaciones_concedidas": [
        "ARCHIVO_COMUN",
        "ARCHIVO_RESTRINGIDO"
      ],
      "objetivos_obligatorios": [
        "Examinar 3 tipos de inconsistencia: referencia ausente, copia modificada, nombres presentes/ausentes entre versiones",
        "Usar LEER ESCRITURAS (sin Hoja de Claridad, sin coste, sin +2 Comprension repetible)"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R3",
          "nivel": "PARCIAL",
          "mision": "M09"
        }
      ],
      "flags_creados": [],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": "sí si produce hallazgo reconocido",
        "contribucion": "posible",
        "notas": "Candidata fuerte para HISTORY: como maneja el jugador un documento sensible antes de tener certeza completa."
      },
      "consecuencias": [
        "M09 NO revela Primera Ala como red completa; el termino puede aparecer en un encabezado antiguo sin significado cerrado todavia (preserva M12)."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE (detalle tecnico no cubierto explicitamente mas alla del contrato general).",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Zhao y Luo especialmente."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M09",
      "nombre": "Los nombres que faltan",
      "etapa_arc1": "LIII_INVESTIGACION",
      "requiere": [
        "arc1.estado=LIII_INVESTIGACION"
      ],
      "produce": [
        "ARCHIVO_COMUN (inicio)",
        "ARCHIVO_RESTRINGIDO (progreso, autorizado por Qiao Ren)",
        "R3=PARCIAL"
      ],
      "abre": [
        "M11 (junto con M08/M10)"
      ],
      "areas": [
        "archivos",
        "secta_interior"
      ],
      "condicion_disponibilidad": "arc1.estado=LIII_INVESTIGACION.",
      "condicion_activacion": "Song Rui identifica inconsistencias en referencias cruzadas usadas durante M08.",
      "condicion_finalizacion": "Investigacion alcanza base suficiente para que Qiao Ren autorice temporalmente ARCHIVO_RESTRINGIDO y aparece el termino 'Dos Alas' (sin definicion completa).",
      "orden_relativo": "Paralela a M08/M10; el orden es libre (T288)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Lan Meihua",
        "Chen Bo",
        "Guo Chen (relacion tematica)",
        "Luo Yan (oposicion por riesgo)"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "'Sala Anatomica'/'Archivo Clinico' de Medicina: sin room_id 329 literal citado en las fuentes leidas."
      ],
      "gates": [
        "componente de M11"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Leer registros/examinar diagramas",
        "Conversar con Chen Bo sobre lesiones sin sentido bajo anatomia meridiana estandar"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R4",
          "nivel": "CONFIRMADO",
          "mision": "M10"
        }
      ],
      "flags_creados": [],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": 0,
        "merito": "sí por investigacion importante",
        "contribucion": "posible",
        "notas": "Candidata fuerte para HISTORY, especialmente por manejo de conocimiento corporal peligroso."
      },
      "consecuencias": [
        "M10 NO confirma que Segunda Rama y Dos Alas sean exactamente lo mismo (eso queda para M11).",
        "Injerto jugable NO se habilita (requiere ZhuJi + metodo especifico, sin cambios).",
        "'ESTUDIAR INJERTO' se elimina de contenido visible de Arc1; el verbo futuro sera LEER APENDICE."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE.",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Mei, Guo y Luo con mayor presencia potencial; nadie realiza injerto en M10."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M10",
      "nombre": "El cuerpo recuerda",
      "etapa_arc1": "LIII_INVESTIGACION",
      "requiere": [
        "arc1.estado=LIII_INVESTIGACION"
      ],
      "produce": [
        "R4=CONFIRMADO"
      ],
      "abre": [
        "M11 (junto con M08/M09)"
      ],
      "areas": [
        "medicina"
      ],
      "condicion_disponibilidad": "arc1.estado=LIII_INVESTIGACION.",
      "condicion_activacion": "Casos clinicos con registros de pacientes/metodos antiguos agrupados bajo 'Segunda Rama'.",
      "condicion_finalizacion": "Se confirma que los cuerpos fueron modificados para tolerar/conducir dos corrientes incompatibles (R4).",
      "orden_relativo": "Paralela a M08/M09; el orden es libre (T288)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "He Zhen",
        "Song Rui",
        "Lan Meihua"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [
        "'Manantial Partido' citado en T254 como posible region cruzada de M11: sin confirmacion literal de que M11 visite esa sala; el Manantial Partido corresponde al unico ecologico Anguila Manantial Partido, no necesariamente a un room_id de M11."
      ],
      "gates": [
        "requisito directo de M12"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Participar en la sintesis conjunta (no es una nueva expedicion, es integracion de lo ya investigado)"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R3",
          "nivel": "CONFIRMADO",
          "mision": "M11"
        }
      ],
      "flags_creados": [
        "DOS_ALAS=PRINCIPIO",
        "SEGUNDA_RAMA=APLICACION_CORPORAL"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": "+1 (ARC1_M11_DOS_ALAS)",
        "merito": "sí",
        "contribucion": "secundaria"
      },
      "consecuencias": [
        "He Zhen reconoce un sello antiguo bajo Formaciones (formaciones_sello_antiguo) sin justificacion en planos modernos: nace M12."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE.",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Zhao, Mei, Guo/Luo con mayor presencia potencial."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M11",
      "nombre": "Las Dos Alas",
      "etapa_arc1": "LIII_INVESTIGACION",
      "requiere": [
        "M08=HECHA",
        "M09=HECHA",
        "M10=HECHA"
      ],
      "produce": [
        "R3=CONFIRMADO",
        "DOS_ALAS=PRINCIPIO",
        "SEGUNDA_RAMA=APLICACION_CORPORAL",
        "Comprension +1 (ARC1_M11_DOS_ALAS)"
      ],
      "abre": [
        "M12"
      ],
      "areas": [
        "formaciones",
        "archivos",
        "medicina"
      ],
      "condicion_disponibilidad": "M08, M09 y M10 HECHAS (las tres, sin orden fijo).",
      "condicion_activacion": "Reunion pequeña (He Zhen aporta mediciones, Song Rui textos, Lan Meihua casos corporales).",
      "condicion_finalizacion": "Se reconstruye el principio: Dos Alas = principio general de coexistencia/concordancia (contencion + presion/circulacion); Segunda Rama = aplicacion corporal concreta y peligrosa."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "He Zhen",
        "posiblemente Song Rui/Wen Tao"
      ],
      "dependencias_auditoria_5": [
        "Custodio de Dos Alas: entidad antigua ligada a M12 (combate o protocolo); su ficha completa de IA/combate pertenece a Auditoria 5/diseno de combate, no a esta auditoria documental."
      ],
      "salas_329_confirmadas": [
        "formaciones_sello_antiguo",
        "formaciones_descenso_tecnico",
        "ala_vestibulo",
        "ala_nudo_seis_corrientes",
        "ala_camara_dos_alas",
        "ala_umbral_mantenimiento"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "principal LIII->LIV"
      ],
      "autorizaciones_concedidas": [
        "PRIMERA_ALA_INVESTIGACION"
      ],
      "objetivos_obligatorios": [
        "Recorrido principal: nudo central, Camara de Dos Alas, al menos una rama funcional, senales de diseno compartido en las demas",
        "Resolver al Custodio de Dos Alas (COMBATE o PROTOCOLO; el protocolo requiere M11 completada + evidencia principal suficiente de M12, sin exigir 6 atajos/14 secretos/unico ecologico/Afinidad alta)"
      ],
      "objetivos_opcionales": [
        "Explorar las 6 ramas adicionales y abrir cualquiera de los 6 atajos (SELLADO/ABIERTO, unica fuente de verdad; NO se abren automaticamente al completar M12)"
      ],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R5",
          "nivel": "CONFIRMADO",
          "mision": "M12"
        }
      ],
      "flags_creados": [
        "Custodio=DERROTADO o Custodio=RESUELTO_POR_PROTOCOLO (equivalentes para cerrar la mision)",
        "ala_umbral_mantenimiento=conocido (visible, NO accesible)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": "+1 (ARC1_M12_RED_PRIMERA_ALA)",
        "merito": "importante",
        "contribucion": "sí",
        "prestigio": "institucional significativo"
      },
      "consecuencias": [
        "M12 nunca exige 6/6 atajos.",
        "El umbral de Mantenimiento queda visible pero no accesible: prepara M13."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE (mas alla de estados SELLADO/ABIERTO persistentes de los atajos).",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Companeros como apoyo; el jugador explora principalmente en solitario (T254)."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [
        {
          "tema": "Reemplazo del modelo de reliquias-llave",
          "obsoleto": "ver68 (Acto III): 'reliquias_verticales' exige vencer Sombra Ahogada y Centinela para obtener Perla de la Marea y Pluma Celeste, llaves para abrir la cumbre.",
          "canonico": "El progreso del tramo profundo (M12-M18) se produce por investigar->comprender->informar->recibir autorizacion->descender, no por reliquias-llave.",
          "fuente": "T289"
        }
      ],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M12",
      "nombre": "La red que nadie dibuja",
      "etapa_arc1": "LIII_INVESTIGACION",
      "requiere": [
        "M11=HECHA"
      ],
      "produce": [
        "PRIMERA_ALA_INVESTIGACION (permiso)",
        "R5=CONFIRMADO",
        "Comprension +1 (ARC1_M12_RED_PRIMERA_ALA)",
        "ala_umbral_mantenimiento conocido"
      ],
      "abre": [
        "M13 (tras gate LIII->LIV)"
      ],
      "areas": [
        "formaciones",
        "primera_ala"
      ],
      "condicion_disponibilidad": "M11 HECHA.",
      "condicion_activacion": "Apertura del sello antiguo mediante procedimiento institucional (formaciones_sello_antiguo -> formaciones_descenso_tecnico -> ala_vestibulo). Esta entrada NO es uno de los seis atajos.",
      "condicion_finalizacion": "Evidencia suficiente de arquitectura compartida (evaluarEvidenciaPrimeraAla(): INSUFICIENTE/SUFICIENTE/CONCLUYENTE) + resolucion del Custodio (COMBATE o PROTOCOLO, sin ruta superior)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "Duan Shibo",
        "He Zhen",
        "Ma Qiren",
        "Lu Cheng",
        "Song Rui"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [
        "ala_umbral_mantenimiento",
        "mantenimiento_acceso",
        "mantenimiento_dormitorio_turnos"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "acceso a la investigacion del Nucleo (prepara M14)"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Descenso ala_umbral_mantenimiento -> mantenimiento_acceso",
        "Reunir evidencia material (conducciones templadas, sedimento reciente, contador avanzado)",
        "Comparacion moderna con Duan Shibo/Ma Qiren/Lu Cheng/Song Rui"
      ],
      "objetivos_opcionales": [
        "Encuentro con la Sombra de Marea Residual (entidad antigua; ayuda a comprender flujos residuales pero NO es necesaria para demostrar R6)"
      ],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R6",
          "nivel": "CONFIRMADO",
          "mision": "M13"
        }
      ],
      "flags_creados": [
        "mantenimiento_dormitorio_turnos conocido (seguro=true, purifica=false)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": "+1 (ARC1_M13_CONSUMO_ACTUAL)",
        "merito": "importante",
        "contribucion": "sí",
        "prestigio": "Recursos/Formaciones"
      },
      "consecuencias": [
        "No se revela todavia que una entidad viva sostiene la red (eso es R7, pertenece a M17); M13 solo demuestra flujo de energia/materiales/residuos."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE.",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Han y Guo pueden tener escenas relacionadas."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M13",
      "nombre": "Todo consume algo",
      "etapa_arc1": "LIV_REVELACION",
      "requiere": [
        "arc1.estado=LIV_REVELACION (tras gate LIII->LIV)"
      ],
      "produce": [
        "acceso a Mantenimiento Antiguo (concepto: MANTENIMIENTO_INVESTIGACION, fuente institucional, limitado a corredores necesarios; no concede Nucleo)",
        "R6=CONFIRMADO",
        "Comprension +1 (ARC1_M13_CONSUMO_ACTUAL)"
      ],
      "abre": [
        "M14"
      ],
      "areas": [
        "mantenimiento",
        "produccion",
        "archivos"
      ],
      "condicion_disponibilidad": "M12 HECHA (LIV_REVELACION).",
      "condicion_activacion": "Duan Shibo y He Zhen reciben el informe de Primera Ala; consumos de Produccion sin asignar a instalacion moderna.",
      "condicion_finalizacion": "Cruce de evidencia antigua con registros presentes confirma que la red antigua continua consumiendo recursos (no se cierra solo con leer el Registro de Consumo; debe cruzarse con Produccion)."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "pocos NPC en escena; investigacion principalmente material/documental (Consejo autoriza el acceso)"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [
        "mantenimiento_compuerta_nucleo",
        "nucleo_pozo_voto",
        "nucleo_camara_voto",
        "nucleo_galeria_primer_pacto",
        "nucleo_primer_pacto"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "prepara M15"
      ],
      "autorizaciones_concedidas": [
        "NUCLEO_SUPERIOR"
      ],
      "objetivos_obligatorios": [
        "Descenso mantenimiento_compuerta_nucleo -> nucleo_pozo_voto",
        "Reconstruir el acto formal del Pozo del Voto"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R8",
          "nivel": "CONFIRMADO",
          "mision": "M14"
        }
      ],
      "flags_creados": [],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": "+1 (ARC1_M14_CONSENTIMIENTO)",
        "merito": "importante, reconocimiento puede llegar despues",
        "contribucion": "no necesariamente"
      },
      "consecuencias": [
        "NO revela todavia que el pacto debia ser temporal (eso es R9, pertenece a M15).",
        "NO revela todavia que la Grulla actual sea la misma entidad (eso es R10, pertenece a M17).",
        "No modifica el vinculo."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE.",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Reacciones posteriores de companeros, no expedicion grupal."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M14",
      "nombre": "La promesa aplazada",
      "etapa_arc1": "LIV_REVELACION",
      "requiere": [
        "M13=HECHA"
      ],
      "produce": [
        "NUCLEO_SUPERIOR (permiso)",
        "R8=CONFIRMADO",
        "Comprension +1 (ARC1_M14_CONSENTIMIENTO)"
      ],
      "abre": [
        "M15"
      ],
      "areas": [
        "mantenimiento",
        "nucleo"
      ],
      "condicion_disponibilidad": "M13 HECHA + NUCLEO_SUPERIOR.",
      "condicion_activacion": "Apertura autorizada de la compuerta (Consejo concede acceso muy limitado al nivel superior del Nucleo).",
      "condicion_finalizacion": "Evidencia inequivoca (inscripciones, posiciones de formacion, registro de testigos, memoria de qi del lugar) de que la Grulla acepto participar voluntariamente en el pacto original."
    },
    {
      "npc_anclados": [],
      "npc_relevantes": [
        "contraste documental; sin NPC de escena central citados explicitamente"
      ],
      "dependencias_auditoria_5": [],
      "salas_329_confirmadas": [
        "nucleo_archivo_promesa"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "prepara M16"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "Contrastar registros del pacto con documentacion posterior",
        "Reconstruir la cadena de tres aplazamientos"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R9",
          "nivel": "CONFIRMADO",
          "mision": "M15"
        }
      ],
      "flags_creados": [],
      "flags_consumidos": [],
      "estados_mundo_modificados": [
        "HISTORY: postura del jugador al presentar el hallazgo (deuda / riesgo tecnico / ambas), candidata fuerte para ESPEJO."
      ],
      "recompensas": {
        "comprension": "+1 (ARC1_M15_RELEVO_APLAZADO)",
        "merito": "importante",
        "contribucion": "minima o ninguna"
      },
      "consecuencias": [
        "nucleo_descenso_pulso permanece cerrado (exige NUCLEO_PROFUNDO, que no llega hasta M17).",
        "R8+R9 NO dictan LIBERAR: faltan hechos decisivos (dependencia viva actual, posibilidad de retirar sin consecuencias graves, identidad de la Grulla actual, estado presente del vinculo) que solo M16/M17 resuelven."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NO CERRADO EN FUENTE.",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Zhao/Luo especialmente."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M15",
      "nombre": "Lo que debía terminar",
      "etapa_arc1": "LIV_REVELACION",
      "requiere": [
        "M14=HECHA"
      ],
      "produce": [
        "R9=CONFIRMADO",
        "Comprension +1 (ARC1_M15_RELEVO_APLAZADO)",
        "condiciones para el inicio de M16 (crisis narrativa)"
      ],
      "abre": [
        "M16 (arc1.estado->LIV_CRISIS tras avisos simultaneos posteriores)"
      ],
      "areas": [
        "nucleo"
      ],
      "condicion_disponibilidad": "M14 HECHA.",
      "condicion_activacion": "Acceso/interpretacion del Archivo de la Promesa (nucleo_archivo_promesa, accesible con NUCLEO_SUPERIOR).",
      "condicion_finalizacion": "Se confirma que el vinculo vivo debia ser sustituido/relevado y que el relevo fue aplazado por al menos tres hitos historicos razonables por separado (prototipo insuficiente -> ruptura de Primera Ala -> normalizacion del mantenimiento)."
    },
    {
      "npc_anclados": [
        {
          "npc": "Lan Meihua",
          "frente": "MEDICINA",
          "con": [
            "Chen Bo",
            "Yao Fen"
          ]
        },
        {
          "npc": "Jiang Rui",
          "frente": "RUTAS",
          "con": [
            "Ren Bo"
          ]
        },
        {
          "npc": "He Zhen",
          "frente": "FORMACIONES",
          "con": [
            "Wen Tao"
          ]
        },
        {
          "npc": "Duan Shibo",
          "frente": "RECURSOS",
          "con": [
            "Ma Qiren",
            "Lu Cheng"
          ]
        },
        {
          "npc": "Xu An",
          "frente": "SAUCES",
          "con": []
        },
        {
          "npc": "Su Lian",
          "frente": "JARDINES",
          "con": []
        }
      ],
      "npc_relevantes": [],
      "dependencias_auditoria_5": [
        "Movilidad de emergencia exacta de cada NPC anclado (rutas/horarios) pertenece a Auditoria 5."
      ],
      "salas_329_confirmadas": [],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "El jugador interviene personalmente en aproximadamente 2 de los 6 frentes (secuencia de 2-4 objetivos cada uno); nunca se muestra un contador visible de frentes."
      ],
      "objetivos_opcionales": [
        "Los 6 atajos de Primera Ala pueden pagar narrativamente la resolucion de frentes si estan abiertos (ej. Rama Jardines/Cantera/Medicina facilitan logistica de crisis)."
      ],
      "evidencias": [],
      "revelaciones": [],
      "flags_creados": [
        "crisis_medicina_resuelta",
        "crisis_rutas_resuelta",
        "crisis_formaciones_resuelta",
        "crisis_recursos_resuelta",
        "crisis_sauces_resuelta",
        "crisis_jardines_resuelta",
        "variante 'resuelta_por_<companero>' cuando el frente lo resuelve un companero autonomo (ej. crisis_rutas_resuelta_por_lin)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [
        "Cada frente resultante en ESTABLE/COSTOSO/DAÑADO segun formula semantica (RESPONSABLE+PREPARACION+APOYO+INTERVENCION), determinista, sin Azar.random() para el macroresultado."
      ],
      "recompensas": {
        "comprension": 0,
        "merito": "extraordinario segun acciones conocidas",
        "contribucion": "posible, secundaria",
        "prestigio": "multiples facciones; NO atender un frente no penaliza Prestigio automaticamente"
      },
      "consecuencias": [
        "No existe resultado 'perfecto' incluso con maxima preparacion: siempre hay heridos/desgaste/danos menores/interrupciones.",
        "EMERGENCIA_SECTA solo habilita conexiones que declaren aceptarla; NO abre ARCHIVO_RESTRINGIDO, PRIMERA_ALA_INVESTIGACION ni NUCLEO_PROFUNDO; expira al cerrar M16."
      ],
      "dependencias_posteriores": [
        "M17 (Consejo autoriza NUCLEO_PROFUNDO solo despues de M16)."
      ],
      "idempotencia": "resolverFrente() se ejecuta una sola vez por frente; si se llama de nuevo por error devuelve exactamente los mismos resultados (T281). recalcular resolverM16() no modifica resultados ya fijados.",
      "eventos_one_shot": [
        "resolucion de cada uno de los 6 frentes"
      ],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "Invariante de test explicita: M16==HECHA => ningun frente==PENDIENTE (T281).",
      "relacion_companeros": [
        "Los seis companeros actuan de forma completamente autonoma (Lin/rutas casi automatica, Han logistica, Zhao con informacion incompleta, Mei tension Sauces/secta, Guo demuestra utilidad practica, Luo convierte confianza institucional en responsabilidad practica). Explicitamente NO son unidades asignables por el jugador (regla estricta, coincide con C1)."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "Movilidad tecnica NPC de crisis (Auditoria 5).",
        "Relacion exacta entre CRISIS_RUTAS y cualquier suspension de circuito de carruajes: explicitamente declarado que NO implica automaticamente suspension de ruta de carruaje (Backup Maestro §44); diseno de postas/carruajes jugables sigue sin existir (4B)."
      ],
      "id": "M16",
      "nombre": "Cuando falla el centro",
      "etapa_arc1": "LIV_CRISIS",
      "requiere": [
        "M15=HECHA",
        "avisos simultaneos posteriores a M15 (Formaciones/Medicina/Sauces/patrulla)"
      ],
      "produce": [
        "arc1.estado=LIV_CRISIS",
        "crisis_<frente>_resuelta por cada uno de los 6 frentes",
        "EMERGENCIA_SECTA (temporal, expira al cerrar M16)"
      ],
      "abre": [
        "M17"
      ],
      "areas": [
        "medicina",
        "bosques",
        "formaciones",
        "produccion",
        "sauces",
        "jardines"
      ],
      "condicion_disponibilidad": "M15=HECHA.",
      "condicion_activacion": "Evento narrativo concreto (no 'entrar a cualquier sala->crisis'): senales pequenas casi simultaneas (campanas de Formaciones fuera de ritmo, cambios de caudal, fauna desplazada, heridos con circulacion irregular, conductos vibrando) seguidas de la certeza de que el centro falla.",
      "condicion_finalizacion": "Los seis frentes alcanzan ESTABLE/COSTOSO/DAÑADO (resolverFrente() procesa cada PENDIENTE una sola vez); M16=HECHA solo cuando ningun frente queda PENDIENTE.",
      "estados_de_mundo": "LIV_CRISIS puede persistir tras M16 hasta que M17 avance; M17 puede comenzar dentro de LIV_CRISIS (no se anade otro macro-estado) (T257)."
    },
    {
      "npc_anclados": [
        {
          "npc": "Centinela de Plumas Petrificadas",
          "sala": "transicion infraestructura profunda / sector de relevo",
          "condicion": "custodia el paso; se resuelve por COMBATE o por PROTOCOLO usando conocimiento principal de M14-M15; no requiere secretos opcionales, atajos ni produce reliquia."
        }
      ],
      "npc_relevantes": [
        "Ji Xueying (preside Consejo)",
        "He Zhen",
        "Lan Meihua",
        "Song Rui",
        "Qiao Ren"
      ],
      "dependencias_auditoria_5": [
        "Ficha completa de combate/IA del Centinela de Plumas Petrificadas pertenece a diseno de combate, no a esta auditoria documental."
      ],
      "salas_329_confirmadas": [
        "nucleo_archivo_promesa",
        "nucleo_descenso_pulso",
        "nucleo_galeria_pulso",
        "nucleo_camara_regulacion",
        "nucleo_sala_relevo",
        "nucleo_exterior_ancla",
        "nucleo_camara_memoria"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "acceso a M18"
      ],
      "autorizaciones_concedidas": [
        "NUCLEO_PROFUNDO"
      ],
      "objetivos_obligatorios": [
        "Autorizacion del Consejo (NUCLEO_PROFUNDO_AUTORIZADO, una sola vez)",
        "Descenso del Pulso (nucleo_descenso_pulso)",
        "Confirmar R7 (dependencia viva) en Galeria/Camara de Regulacion",
        "Resolver al Centinela (combate o protocolo)",
        "Visitar y dejar conocida Sala de Relevo (nucleo_sala_relevo) ANTES de M18 (no opcional)",
        "Confirmar R10 (misma Grulla) en Exterior del Ancla"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [
        {
          "id": "R7",
          "nivel": "CONFIRMADO",
          "mision": "M17"
        },
        {
          "id": "R10",
          "nivel": "CONFIRMADO",
          "mision": "M17"
        }
      ],
      "flags_creados": [
        "NUCLEO_PROFUNDO_AUTORIZADO",
        "dependenciaViva=CONFIRMADO",
        "grullaViva=CONFIRMADO",
        "nucleo_sala_relevo conocido (alojamiento seguro=true, purifica=false)"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [],
      "recompensas": {
        "comprension": "+1 (ARC1_M17_DEPENDENCIA_VIVA, concedido cuando R7 y R10 quedan integrados, no en dos puntos separados)",
        "merito": "enorme, reconocimiento final puede esperar"
      },
      "consecuencias": [
        "El permiso NUCLEO_PROFUNDO habilita EXCLUSIVAMENTE la ruta nucleo_archivo_promesa->nucleo_descenso_pulso; no abre todos los sellos ni convierte al jugador en autoridad sobre el Nucleo.",
        "M17 termina antes del Santuario (Santuario del Vinculo queda accesible pero entrar en el pertenece a M18; no hay obligacion de volver al Consejo antes del jefe)."
      ],
      "dependencias_posteriores": [],
      "idempotencia": "NUCLEO_PROFUNDO_AUTORIZADO se concede exactamente una vez.",
      "eventos_one_shot": [],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Permanecen principalmente arriba/soporte institucional, no party de descenso."
      ],
      "estado_ver68": "NO_IMPLEMENTADO",
      "conflictos_historicos": [
        {
          "tema": "Reemplazo del Centinela como llave",
          "obsoleto": "ver68 (Acto III): el Centinela de Plumas Petrificadas entrega la Pluma Celeste, llave necesaria para abrir el final.",
          "canonico": "El Centinela custodia un mecanismo de seguridad; se resuelve por combate o protocolo (conocimiento de M14-M15); no produce reliquia ni cadaver.",
          "fuente": "T290"
        }
      ],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [],
      "id": "M17",
      "nombre": "Descender",
      "etapa_arc1": "LIV_CRISIS/LIV_DESCENSO",
      "requiere": [
        "M16=HECHA"
      ],
      "produce": [
        "NUCLEO_PROFUNDO (permiso, fuente=ORDEN, origen=M17)",
        "R7=CONFIRMADO",
        "R10=CONFIRMADO",
        "Comprension +1 (ARC1_M17_DEPENDENCIA_VIVA)",
        "nucleo_sala_relevo conocido (alojamiento)"
      ],
      "abre": [
        "M18"
      ],
      "areas": [
        "secta_interior",
        "primera_ala",
        "mantenimiento",
        "nucleo"
      ],
      "condicion_disponibilidad": "M16 HECHA.",
      "condicion_activacion": "Convocatoria al Consejo: los hechos ya existen (R6, R8, R9 confirmados + M16 resuelta); Qiao Ren autoriza la excepcion. EMERGENCIA_SECTA ya no sirve de llave (M16 termino).",
      "condicion_finalizacion": "R10=CONFIRMADO en Exterior del Ancla (nucleo_exterior_ancla), DESPUES de R7=CONFIRMADO en Galeria/Camara de Regulacion (nucleo_galeria_pulso/nucleo_camara_regulacion). Orden R7 antes que R10 esta congelado narrativamente."
    },
    {
      "npc_anclados": [
        {
          "npc": "La Grulla (entidad, jefe narrativo)",
          "sala": "nucleo_santuario_vinculo",
          "condicion": "No es mob ecologico: nunca cadaver/Examen/loot/qi/manual/kill Merito. HP interno representa VINCULO."
        }
      ],
      "npc_relevantes": [],
      "dependencias_auditoria_5": [
        "Comportamiento y fases de IA de la Grulla (Fase I EL VOTO INMOVIL / Fase II LAS ALAS RECUERDAN / Fase III LA CAMPANA SIN DUENO) pertenecen a diseno de combate, no a esta auditoria documental."
      ],
      "salas_329_confirmadas": [
        "nucleo_umbral_santuario",
        "nucleo_santuario_vinculo"
      ],
      "ids_historicos": [],
      "destinos_329_pendientes": [],
      "gates": [
        "habilita Gran Perfeccion cuando qi/condiciones corresponden (no automatico)"
      ],
      "autorizaciones_concedidas": [],
      "objetivos_obligatorios": [
        "INTERVENIR (accion explicita, no simple entrada) para iniciar el combate",
        "Completar las 3 fases del combate hasta VINCULO_CEDIDO",
        "Elegir LIBERAR o CUSTODIAR"
      ],
      "objetivos_opcionales": [],
      "evidencias": [],
      "revelaciones": [],
      "flags_creados": [
        "decisionFinal",
        "vinculoGrulla=LIBERADO|CUSTODIADO"
      ],
      "flags_consumidos": [],
      "estados_mundo_modificados": [
        "La sala del Santuario cambia permanentemente segun la decision (pulsos dispersos si LIBERAR; vinculo visible con nueva configuracion si CUSTODIAR)."
      ],
      "recompensas": {
        "comprension": 0,
        "merito": 0,
        "contribucion": 0,
        "piedras": 0,
        "tecnica": 0,
        "calidad_fundacion": 0,
        "notas": "Sin recompensa diferencial entre LIBERAR y CUSTODIAR; ninguna opcion es moralmente superior. Recompensa = la consecuencia elegida."
      },
      "consecuencias": [
        "HUIR permitido durante el combate (retira la intervencion, resetea el encuentro completo, M18 sigue ACTIVA, la Grulla vuelve a Fase I; sin penalizacion de Prestigio).",
        "Derrota del jugador: reset total del encuentro + recovery + Sala de Relevo, sin perder progreso narrativo.",
        "Los companeros NO votan ni recomiendan una opcion en la escena; el Consejo tampoco valida/invalida inmediatamente al volver arriba."
      ],
      "dependencias_posteriores": [
        "Epilogo jugable completo (Gran Perfeccion->Iluminacion->Tribulacion->Fundacion->ZhuJi->Consejo->Salida Regional): declarado en la propia Fuente Maestra como 'PENDIENTE ACTUAL' de diseno al cierre de T290/ver ademas Arc1_Contexto_Maestro_ver55 §41; no incluido en el alcance de esta Auditoria 6 salvo para verificar dependencias con M18."
      ],
      "idempotencia": "La decision LIBERAR/CUSTODIAR es irreversible: una segunda llamada de cierre (ej. intentar CUSTODIAR tras haber confirmado LIBERAR) es RECHAZADA, no reemplaza la decision previa (T257).",
      "eventos_one_shot": [
        "VINCULO_CEDIDO",
        "decisionFinal (LIBERAR|CUSTODIAR)"
      ],
      "eventos_repetibles": [],
      "riesgos_duplicacion": "NO CERRADO EN FUENTE",
      "relacion_companeros": [
        "Ninguno participa dentro del combate; posiciones expresadas antes/despues/en el epilogo, nunca como voto."
      ],
      "estado_ver68": "LEGACY_A_REEMPLAZAR",
      "conflictos_historicos": [
        {
          "tema": "Reemplazo integral del combate final y su resolucion",
          "obsoleto": "ver68: tramo final construido sobre derrotar un 'eco_grulla', examinar Grulla/altar y consumir dos reliquias (Perla de la Marea + Pluma Celeste) para elegir; LIBERAR otorgaba +3 Comprension y abria opcion de maestro en la promocion; GUARDAR otorgaba +20 piedras.",
          "canonico": "M18: INTERVENIR explicito inicia combate contra la Grulla viva (sin reliquias previas); VINCULO_CEDIDO en vez de muerte; LIBERAR y CUSTODIAR sin recompensa diferencial (0 piedras/0 Comprension directa/0 tecnica/0 calidad de Fundacion/0 maestro en ambas); UI interna sigue usando HP pero el jugador lee 'VINCULO', no 'HP de la Grulla'.",
          "fuente": "T290"
        }
      ],
      "version_obsoleta": null,
      "version_canonica": null,
      "fuentes": [
        "T254",
        "T286",
        "T287",
        "T288",
        "T289",
        "T290",
        "T281",
        "T257"
      ],
      "pendientes": [
        "M18 no asigna Semilla del Dao (eso ocurre en Iluminacion, fuera de alcance).",
        "Detalle exacto de guardado durante combate de jefe: explicitamente 'dependera de lo que descubramos en ver52' (T257) => NO CERRADO EN FUENTE."
      ],
      "id": "M18",
      "nombre": "El Voto Inmóvil",
      "etapa_arc1": "LIV_DESCENSO",
      "requiere": [
        "M17=HECHA",
        "R7 y R10 conocidos"
      ],
      "produce": [
        "decisionFinal=LIBERAR|CUSTODIAR (irreversible)",
        "M18=HECHA",
        "arc1.estado=EPILOGO",
        "gate de Gran Perfeccion habilitado (no automatico)"
      ],
      "abre": [
        "Epilogo jugable (Gran Perfeccion -> Iluminacion -> Tribulacion -> Fundacion -> ZhuJi -> Consejo -> Salida Regional); fuera del alcance de esta auditoria salvo para verificar dependencias."
      ],
      "areas": [
        "nucleo"
      ],
      "condicion_disponibilidad": "M17 HECHA.",
      "condicion_activacion": "Entrar en el Santuario del Vinculo (nucleo_santuario_vinculo) con R7/R10 conocidos NO inicia combate: primero ENTRAR->VER->EXAMINAR->comprender situacion presente->(puede RETIRARSE)->INTERVENIR explicito inicia el combate.",
      "condicion_finalizacion": "VINCULO llega a 0 -> evento VINCULO_CEDIDO (no 'muerte' de la Grulla) -> aparecen las opciones LIBERAR/CUSTODIAR -> decision confirmada de forma atomica e irreversible.",
      "estados_de_mundo": "M18 HECHA + arc1.estado=EPILOGO es una unica transicion atomica junto con HISTORY (importancia=maxima, cierre_arco=true) y habilitacion del gate de Gran Perfeccion.",
      "estados_history": [
        "HISTORY.LIBERAR o HISTORY.CUSTODIAR, importancia=maxima, cierre_arco=true; EXCLUIDA del ESPEJO de Iluminacion de este mismo arco."
      ]
    }
  ],
  "flags": [
    {
      "flag": "estadoAfiliacion",
      "valores": [
        "ADMITIDO",
        "MIEMBRO"
      ],
      "origen": "P / M03"
    },
    {
      "flag": "rango",
      "valores": [
        "ninguno",
        "ASPIRANTE",
        "DISCIPULO_EXTERNO"
      ],
      "origen": "M01 / M03"
    },
    {
      "flag": "primerServicioFormal",
      "valores": [
        "true"
      ],
      "origen": "M02"
    },
    {
      "flag": "evaluacionCirculacion",
      "valores": [
        "SUPERADA"
      ],
      "origen": "M03"
    },
    {
      "flag": "informeFronteraAceptado",
      "valores": [
        "true"
      ],
      "origen": "M07"
    },
    {
      "flag": "reconocimientoSauces",
      "valores": [
        "HUESPED"
      ],
      "origen": "M05"
    },
    {
      "flag": "evidenciaTerritorial",
      "valores": [
        "INSUFICIENTE",
        "SUFICIENTE",
        "CONCLUYENTE"
      ],
      "origen": "M06 (evaluarEvidenciaTerritorial)"
    },
    {
      "flag": "DOS_ALAS",
      "valores": [
        "PRINCIPIO"
      ],
      "origen": "M11"
    },
    {
      "flag": "SEGUNDA_RAMA",
      "valores": [
        "APLICACION_CORPORAL"
      ],
      "origen": "M11 (derivado de M10)"
    },
    {
      "flag": "Custodio",
      "valores": [
        "DERROTADO",
        "RESUELTO_POR_PROTOCOLO"
      ],
      "origen": "M12"
    },
    {
      "flag": "consumoRed",
      "valores": [
        "CONFIRMADO"
      ],
      "origen": "M13"
    },
    {
      "flag": "consentimientoGrulla",
      "valores": [
        "CONFIRMADO"
      ],
      "origen": "M14"
    },
    {
      "flag": "temporalidadPacto",
      "valores": [
        "CONFIRMADO"
      ],
      "origen": "M15"
    },
    {
      "flag": "frentes M16 (x6)",
      "valores": [
        "PENDIENTE",
        "ESTABLE",
        "COSTOSO",
        "DAÑADO"
      ],
      "origen": "M16"
    },
    {
      "flag": "intervencionesJugador",
      "valores": [
        "Set de 2 ids de frente normalmente"
      ],
      "origen": "M16"
    },
    {
      "flag": "dependenciaViva",
      "valores": [
        "CONFIRMADO"
      ],
      "origen": "M17 (R7)"
    },
    {
      "flag": "grullaViva",
      "valores": [
        "CONFIRMADO"
      ],
      "origen": "M17 (R10)"
    },
    {
      "flag": "decisionFinal",
      "valores": [
        "LIBERAR",
        "CUSTODIAR"
      ],
      "origen": "M18, irreversible"
    },
    {
      "flag": "vinculoGrulla",
      "valores": [
        "LIBERADO",
        "CUSTODIADO"
      ],
      "origen": "M18"
    },
    {
      "flag": "arc1.estado",
      "valores": [
        "PROLOGO",
        "LI_INTEGRACION",
        "LII_TERRITORIO",
        "LIII_INVESTIGACION",
        "LIV_REVELACION",
        "LIV_CRISIS",
        "EPILOGO",
        "CERRADO"
      ],
      "origen": "transversal"
    }
  ],
  "permissions": [
    {
      "id": "SECTA_EXTERIOR_BASE",
      "origen": "M01"
    },
    {
      "id": "PATRULLA_TERRITORIAL",
      "origen": "M04",
      "nota": "ID canonico; sustituye al provisional RUTAS_SERVICIO citado en T254/T257."
    },
    {
      "id": "SECTA_INTERIOR",
      "origen": "Inicio de LIII (tras gate LII->LIII, evento separado de M07)"
    },
    {
      "id": "FORMACIONES_INVESTIGACION",
      "origen": "M08"
    },
    {
      "id": "ARCHIVO_COMUN",
      "origen": "M09 (inicio)"
    },
    {
      "id": "ARCHIVO_RESTRINGIDO",
      "origen": "M09 (progreso, autoriza Qiao Ren)"
    },
    {
      "id": "PRIMERA_ALA_INVESTIGACION",
      "origen": "M12"
    },
    {
      "id": "MANTENIMIENTO_INVESTIGACION",
      "origen": "M13",
      "nota": "Nombre de permiso citado en T289; el Backup Maestro no repite un ID formal distinto."
    },
    {
      "id": "NUCLEO_SUPERIOR",
      "origen": "M14"
    },
    {
      "id": "NUCLEO_PROFUNDO",
      "origen": "M17 (autorizado por el Consejo tras M16)"
    },
    {
      "id": "EMERGENCIA_SECTA",
      "origen": "M16, temporal; expira al cerrar M16; nunca abre ARCHIVO_RESTRINGIDO/PRIMERA_ALA_INVESTIGACION/NUCLEO_PROFUNDO."
    },
    {
      "id": "SALIDA_REGIONAL",
      "origen": "Comparecencia post-ZhuJi (epilogo, fuera del alcance directo de P-M18 pero es dependencia posterior de M18)."
    },
    {
      "id": "ATAJO_ALA_MEDICINA / JARDINES / CANTERA / AGUAS / ARCHIVOS / FORMACIONES",
      "origen": "Exploracion opcional en Primera Ala (M12+); unica fuente de verdad SELLADO/ABIERTO; nunca requisito 6/6; NO se abren automaticamente al completar M12."
    }
  ],
  "gates": [
    {
      "transicion": "PROLOGO->LI",
      "condicion": "REGISTRO_INICIAL_COMPLETADO",
      "mision": "P"
    },
    {
      "transicion": "LI->LII",
      "condicion": "qi>=25 + rango==DISCIPULO_EXTERNO + primerServicioFormal + evaluacionCirculacion==SUPERADA",
      "misiones": [
        "M01",
        "M02",
        "M03"
      ]
    },
    {
      "transicion": "LII->LIII",
      "condicion": "qi>=45 + servicioTerritorial==COMPLETADO + evidenciaTerritorial==SUFICIENTE + informeFrontera==ACEPTADO; SECTA_INTERIOR se concede al entrar, no antes",
      "misiones": [
        "M04",
        "M05",
        "M06",
        "M07"
      ]
    },
    {
      "transicion": "LIII->LIV",
      "condicion": "qi>=75 + DosAlas==COMPRENDIDAS (M11) + redPrimeraAla==CONCLUYENTE (M12) + autorizacion institucional; NO requiere 6 atajos/todos los unicos/todas las rooms de Primera Ala",
      "misiones": [
        "M08",
        "M09",
        "M10",
        "M11",
        "M12"
      ]
    },
    {
      "transicion": "LIV_REVELACION->LIV_CRISIS",
      "condicion": "avisos simultaneos posteriores a M15 (Formaciones/Medicina/Sauces/patrulla)",
      "misiones": [
        "M13",
        "M14",
        "M15"
      ]
    },
    {
      "transicion": "M16->M17",
      "condicion": "los 6 frentes alcanzan ESTABLE/COSTOSO/DAÑADO (ninguno PENDIENTE); Consejo autoriza NUCLEO_PROFUNDO",
      "misiones": [
        "M16"
      ]
    },
    {
      "transicion": "M17->M18",
      "condicion": "R7 y R10 confirmados; Sala de Relevo conocida",
      "misiones": [
        "M17"
      ]
    },
    {
      "transicion": "LIV->Gran Perfeccion (epilogo)",
      "condicion": "qi>=110 + M18 HECHA + decisionFinal tomada; NO automatica, requiere MEDITAR explicito fuera de la escena de M18",
      "misiones": [
        "M18"
      ]
    },
    {
      "transicion": "invariante SECTA_INTERIOR==false",
      "condicion": "=> M12 no puede habilitarse; entrada oficial de Primera Ala no puede habilitarse; ningun ATAJO_ALA_* puede estar ABIERTO (Auditoria 3U/3B, ratificada en Backup Maestro §6.2)",
      "misiones": [
        "M12"
      ]
    }
  ],
  "revelations": [
    {
      "id": "R1",
      "mision_principal": "M06 (PARCIAL) -> M07 (CONFIRMADO)",
      "significado": "Las anomalias territoriales estan relacionadas / distribucion territorial compatible con causa comun.",
      "orden": 1
    },
    {
      "id": "R2",
      "mision_principal": "M08",
      "significado": "La montana esta siendo compensada artificialmente (no se equilibra sola).",
      "orden": 2
    },
    {
      "id": "R3",
      "mision_principal": "M09 (PARCIAL) -> M11 (CONFIRMADO)",
      "significado": "Existe/existio un principio central llamado Dos Alas, distinto de Segunda Rama.",
      "orden": 3
    },
    {
      "id": "R4",
      "mision_principal": "M10",
      "significado": "Segunda Rama fue una aplicacion corporal del principio Dos Alas (no identica a el).",
      "orden": 4
    },
    {
      "id": "R5",
      "mision_principal": "M12",
      "significado": "Las seis instalaciones (Medicina/Jardines/Cantera/Aguas/Archivos/Formaciones antiguas) eran una sola infraestructura: Primera Ala.",
      "orden": 5
    },
    {
      "id": "R6",
      "mision_principal": "M13",
      "significado": "Primera Ala no esta muerta: la red antigua continua consumiendo recursos en el presente.",
      "orden": 6
    },
    {
      "id": "R8",
      "mision_principal": "M14",
      "significado": "La Grulla acepto participar voluntariamente en el pacto original.",
      "orden": 7
    },
    {
      "id": "R9",
      "mision_principal": "M15",
      "significado": "El vinculo debia ser temporal; existia obligacion de relevo, aplazada por generaciones (>=3 hitos).",
      "orden": 8
    },
    {
      "id": "R7",
      "mision_principal": "M17",
      "significado": "La red actual depende de una entidad viva (revelado ANTES que R10, regla narrativa congelada).",
      "orden": 9
    },
    {
      "id": "R10",
      "mision_principal": "M17",
      "significado": "Es la misma Grulla Primera del pacto original (no descendiente, sucesora, copia ni eco).",
      "orden": 10
    }
  ],
  "room_anchors": [
    {
      "room_id": "patio_raices",
      "area": "acceso",
      "mision": "P",
      "uso": "inicio del recorrido",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "registro",
      "area": "acceso",
      "mision": "P/M01",
      "uso": "cierre de Prologo / inicio M01",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "sala_jade",
      "area": "secta_exterior",
      "mision": "M01",
      "uso": "inscripcion NOMBRE_INSCRITO",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "dormitorio_externos",
      "area": "secta_exterior",
      "mision": "M01",
      "uso": "primer alojamiento conocido / destino de rescate",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "bosque_refugio_patrulla",
      "area": "bosques",
      "mision": "M04",
      "uso": "refugio descubierto (alojamiento no purificador)",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "sauces_casa_huespedes",
      "area": "sauces",
      "mision": "M05",
      "uso": "alojamiento de huesped tras reconocimientoSauces",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "formaciones_sello_antiguo",
      "area": "formaciones",
      "mision": "M12",
      "uso": "entrada oficial a Primera Ala (no es uno de los 6 atajos)",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "formaciones_descenso_tecnico",
      "area": "formaciones",
      "mision": "M12",
      "uso": "tramo de la entrada oficial",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "ala_vestibulo",
      "area": "primera_ala",
      "mision": "M12",
      "uso": "centro de llegada a Primera Ala",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "ala_nudo_seis_corrientes",
      "area": "primera_ala",
      "mision": "M12",
      "uso": "demostracion espacial de las 6 ramas",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "ala_camara_dos_alas",
      "area": "primera_ala",
      "mision": "M12",
      "uso": "arquitectura que demuestra el principio Dos Alas",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "ala_umbral_mantenimiento",
      "area": "primera_ala",
      "mision": "M12/M13",
      "uso": "visible pero no accesible hasta M13",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "mantenimiento_acceso",
      "area": "mantenimiento",
      "mision": "M13",
      "uso": "primer descenso a Mantenimiento",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "mantenimiento_dormitorio_turnos",
      "area": "mantenimiento",
      "mision": "M13",
      "uso": "alojamiento no purificador",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "mantenimiento_compuerta_nucleo",
      "area": "mantenimiento",
      "mision": "M14",
      "uso": "acceso a Nucleo Superior",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "nucleo_pozo_voto",
      "area": "nucleo",
      "mision": "M14",
      "uso": "reconstruccion del pacto original (R8)",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "nucleo_archivo_promesa",
      "area": "nucleo",
      "mision": "M15",
      "uso": "R9, relevo aplazado; salida bloqueada hacia nucleo_descenso_pulso",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "nucleo_descenso_pulso",
      "area": "nucleo",
      "mision": "M17",
      "uso": "requiere NUCLEO_PROFUNDO; inicio del descenso de M17",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "nucleo_galeria_pulso / nucleo_camara_regulacion",
      "area": "nucleo",
      "mision": "M17",
      "uso": "R7 (dependencia viva)",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "nucleo_sala_relevo",
      "area": "nucleo",
      "mision": "M17",
      "uso": "alojamiento/checkpoint obligatorio antes de M18",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "nucleo_exterior_ancla",
      "area": "nucleo",
      "mision": "M17",
      "uso": "R10 (misma Grulla)",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "nucleo_umbral_santuario / nucleo_santuario_vinculo",
      "area": "nucleo",
      "mision": "M18",
      "uso": "Santuario del Vinculo, escena final",
      "confirmacion": "CONFIRMADO_329"
    },
    {
      "room_id": "mojon_regional",
      "area": "valle",
      "mision": "epilogo (dependencia de M18, fuera de alcance directo)",
      "uso": "salida fisica hacia ruta_regional_arc2",
      "confirmacion": "CONFIRMADO_329 (con excepcion documentada: ruta_regional_arc2 es EXTERNO_ARC1_DOCUMENTADO, fuera de las 329 por diseno)"
    }
  ],
  "npc_anchors": [
    {
      "npc": "Gao Shun",
      "mision": "M04",
      "anclaje": "ANCLADO en Puerta Roja durante el objetivo obligatorio; vuelve a movilidad normal despues.",
      "fuente": "Backup Maestro §40"
    },
    {
      "npc": "Lan Meihua",
      "mision": "M16",
      "anclaje": "ANCLADA en Medicina durante la crisis.",
      "fuente": "T281"
    },
    {
      "npc": "He Zhen",
      "mision": "M16",
      "anclaje": "ANCLADO en el centro de Formaciones durante la crisis.",
      "fuente": "T281"
    },
    {
      "npc": "Su Lian",
      "mision": "M16",
      "anclaje": "ANCLADA en Jardines durante la crisis.",
      "fuente": "T281"
    },
    {
      "npc": "Xu An",
      "mision": "M16",
      "anclaje": "ANCLADO en Sauces durante la crisis.",
      "fuente": "T281"
    },
    {
      "npc": "Duan Shibo",
      "mision": "M16",
      "anclaje": "Entre almacenes y centro de coordinacion durante la crisis.",
      "fuente": "T281"
    },
    {
      "npc": "Jiang Rui",
      "mision": "M16",
      "anclaje": "En rutas durante la crisis.",
      "fuente": "T281"
    },
    {
      "npc": "La Grulla",
      "mision": "M18",
      "anclaje": "Entidad narrativa, no NPC movil; ligada a nucleo_santuario_vinculo hasta la decision final.",
      "fuente": "T290"
    },
    {
      "npc": "Custodio de Dos Alas",
      "mision": "M12",
      "anclaje": "Entidad antigua ligada a la salida principal de Primera Ala; ficha de combate pertenece a Auditoria 5/diseno de combate.",
      "fuente": "T288"
    },
    {
      "npc": "Centinela de Plumas Petrificadas",
      "mision": "M17",
      "anclaje": "Custodia la transicion infraestructura profunda / sala de relevo; ficha de combate pertenece a Auditoria 5/diseno de combate.",
      "fuente": "T290"
    }
  ],
  "dependencies": [
    {
      "de": "M03",
      "requiere": "M01, M02",
      "tipo": "secuencial estricta dentro de LI"
    },
    {
      "de": "M04",
      "requiere": "gate LI->LII (no M03 directamente)",
      "tipo": "gate de cultivo + narrativo"
    },
    {
      "de": "M07",
      "requiere": "M06 (evidenciaTerritorial>=SUFICIENTE)",
      "tipo": "secuencial estricta dentro de LII"
    },
    {
      "de": "M08 / M09 / M10",
      "requiere": "gate LII->LIII (SECTA_INTERIOR)",
      "tipo": "paralelas entre si, orden libre, ninguna cambia su revelacion esencial por el orden"
    },
    {
      "de": "M11",
      "requiere": "M08 + M09 + M10 (las tres)",
      "tipo": "convergencia obligatoria"
    },
    {
      "de": "M12",
      "requiere": "M11",
      "tipo": "secuencial"
    },
    {
      "de": "M13",
      "requiere": "M12 (gate LIII->LIV)",
      "tipo": "secuencial"
    },
    {
      "de": "M14",
      "requiere": "M13",
      "tipo": "secuencial"
    },
    {
      "de": "M15",
      "requiere": "M14",
      "tipo": "secuencial"
    },
    {
      "de": "M16",
      "requiere": "M15",
      "tipo": "secuencial (crisis narrativa, no gate de cultivo explicito)"
    },
    {
      "de": "M17",
      "requiere": "M16 (todos los frentes no-PENDIENTE)",
      "tipo": "secuencial"
    },
    {
      "de": "M18",
      "requiere": "M17 (R7 y R10 confirmados, Sala de Relevo conocida)",
      "tipo": "secuencial"
    },
    {
      "de": "Gran Perfeccion (epilogo)",
      "requiere": "M18 HECHA + decisionFinal + qi=110 + MEDITAR explicito",
      "tipo": "gate de cultivo, no automatico"
    }
  ],
  "historical_conflicts": [
    {
      "tema": "Presentacion publica de la fundacion",
      "obsoleto": "Version antigua de ver55 presenta la leyenda de la Grulla como hecho llano.",
      "canonico": "Se reescribe como 'version publica que se cuenta' (leyenda), reservando la verdad (R1-R10) para mucho despues.",
      "fuente": "T286",
      "mision": "P"
    },
    {
      "tema": "M02 reemplaza la mision de las ratas",
      "obsoleto": "ver68: quest 'ratas' ('La plaga de la despensa') exige matar exactamente 3 Ratas de qi y entrega recompensa generica de Contribucion+piedras+experiencia.",
      "canonico": "M02: un solo encuentro con una Rata de qi, enfoque en aprender Examen Espiritual real; la mision NO depende de una extraccion exitosa; recompensa es servicio+Examen+Contribucion pequeña, sin piedras/experiencia genericas.",
      "fuente": "T286 vs grulla-blanca_ver68.html (const QUESTS.ratas)",
      "mision": "M02"
    },
    {
      "tema": "M03 reemplaza el duelo con Fan Ji",
      "obsoleto": "ver68: quest 'duelo' ('El arrogante') exige derrotar a Fan Ji en la arena, con eleccion ejecutar/perdonar y recompensa de Contribucion+piedras+experiencia+decision de Dao.",
      "canonico": "M03: evaluacion de circulacion e intencion bajo presion con el muneco de entrenamiento, sin duelo con un NPC humano; unica promocion real de Arc1 (Aspirante->Discipulo Externo); sin piedras/experiencia generica.",
      "fuente": "T286 vs grulla-blanca_ver68.html (const QUESTS.duelo, fan_ji)",
      "mision": "M03"
    },
    {
      "tema": "Reemplazo del modelo de reliquias-llave",
      "obsoleto": "ver68 (Acto III): 'reliquias_verticales' exige vencer Sombra Ahogada y Centinela para obtener Perla de la Marea y Pluma Celeste, llaves para abrir la cumbre.",
      "canonico": "El progreso del tramo profundo (M12-M18) se produce por investigar->comprender->informar->recibir autorizacion->descender, no por reliquias-llave.",
      "fuente": "T289",
      "mision": "M12"
    },
    {
      "tema": "Reemplazo del Centinela como llave",
      "obsoleto": "ver68 (Acto III): el Centinela de Plumas Petrificadas entrega la Pluma Celeste, llave necesaria para abrir el final.",
      "canonico": "El Centinela custodia un mecanismo de seguridad; se resuelve por combate o protocolo (conocimiento de M14-M15); no produce reliquia ni cadaver.",
      "fuente": "T290",
      "mision": "M17"
    },
    {
      "tema": "Reemplazo integral del combate final y su resolucion",
      "obsoleto": "ver68: tramo final construido sobre derrotar un 'eco_grulla', examinar Grulla/altar y consumir dos reliquias (Perla de la Marea + Pluma Celeste) para elegir; LIBERAR otorgaba +3 Comprension y abria opcion de maestro en la promocion; GUARDAR otorgaba +20 piedras.",
      "canonico": "M18: INTERVENIR explicito inicia combate contra la Grulla viva (sin reliquias previas); VINCULO_CEDIDO en vez de muerte; LIBERAR y CUSTODIAR sin recompensa diferencial (0 piedras/0 Comprension directa/0 tecnica/0 calidad de Fundacion/0 maestro en ambas); UI interna sigue usando HP pero el jugador lee 'VINCULO', no 'HP de la Grulla'.",
      "fuente": "T290",
      "mision": "M18"
    }
  ],
  "findings": [
    {
      "tipo": "AMBIGÜEDAD",
      "descripcion": "El Backup Maestro (autoridad maxima) no contiene una ficha narrativa propia de M01-M18: remite explicitamente (§50) a los mismos turnos T286-T290/T254/T257 que ya son la base de esta auditoria. Esto significa que, para el contenido puramente narrativo de las misiones (no topologia/estado de proyecto), la 'decision explicita mas reciente' y la 'Fuente Maestra' (niveles 1 y 5 de la jerarquia) coinciden en la practica: no hay una capa de autoridad superior con contenido distinto que pudiera sustituir a T286-T290.",
      "riesgo": "bajo",
      "bloquea_3c": false
    },
    {
      "tipo": "RIESGO",
      "descripcion": "M16 solo tiene una version encontrada en la Fuente Maestra (T281). La propia Auditoria 6 (instrucciones del usuario) advierte explicitamente 'M16 tambien debe contrastarse con su revision tardia y no con versiones tempranas obsoletas', dando a entender que podria existir una revision posterior. No se encontro tal revision dentro de ver55 (que termina en T293) ni en el Backup Maestro (que solo resume T281 sin anadir contenido nuevo en su §41/44).",
      "riesgo": "medio",
      "bloquea_3c": false,
      "accion_sugerida": "Confirmar con el usuario si existe una fuente adicional de M16 no incluida en este lote de archivos (por ejemplo, una conversacion posterior a T293 que no llego a fusionarse en ver55 ni a resumirse en el Backup Maestro)."
    },
    {
      "tipo": "SUGERENCIA OPCIONAL",
      "descripcion": "Varios room_id citados en prosa (almacen/despensa de M02, sector marcial de M03, puntos de medicion de M08, Sala Anatomica/Archivo Clinico de M10, 'Cabañas'/'patio exterior' de M01) no tienen un id literal de la topologia v2 confirmado en las fuentes leidas. No se debe inferir un id por semejanza de nombre (regla de no invencion); quedan como DESTINO_329_PENDIENTE explicito en cada ficha.",
      "riesgo": "bajo",
      "bloquea_3c": false
    },
    {
      "tipo": "RIESGO",
      "descripcion": "M16 CRISIS_RUTAS se relaciona tematicamente con Auditoria 4B (movilidad/carruajes), pero el Backup Maestro (§44) aclara expresamente que la resolucion de CRISIS_RUTAS NO implica automaticamente la suspension de una ruta de carruaje, porque el sistema jugable de postas/carruajes sigue sin existir. Si en el futuro se disena fast travel, existe riesgo de acoplar accidentalmente ese sistema (aun no canonico) a los flags de M16 (crisis_rutas_resuelta).",
      "riesgo": "medio",
      "bloquea_3c": false
    },
    {
      "tipo": "INCONSISTENCIA",
      "descripcion": "grulla-blanca_ver68.html no implementa absolutamente nada de P-M18 (verificado por grep). Todo el contenido jugable actual pertenece a una campaña distinta (Acto I-IV) que las fuentes narrativas declaran reemplazada solo parcialmente de forma explicita (M02<-ratas, M03<-duelo, M12/M17<-reliquias_verticales, M18<-tramo final). El destino de jade/Shen Liang, huerto_jade, veta_y_horno, peces_lunares, devoradores, memorias_verticales, cazadores_verticales, guardianes_ocultos y origen_personal frente al nuevo Arc1 NO esta cerrado en fuente: no se debe asumir que se eliminan, se mueven a contenido opcional, o pasan a Arc2 sin una decision explicita.",
      "riesgo": "medio",
      "bloquea_3c": false,
      "accion_sugerida": "Esto pertenece propiamente a M2 (migracion funcional 40->329) y no se resuelve aqui, conforme al limite de alcance de esta auditoria."
    },
    {
      "tipo": "RIESGO",
      "descripcion": "El gate LI->LII especifica 'qi_max estructural de LI = 25' pero T286 deja explicitamente abierto si CONSAGRAR exige literalmente 25/25 exacto o solo alcanzar el reino; T254 repite 'qi>=25' sin mayor precision numerica de la mecanica de consagracion.",
      "riesgo": "bajo",
      "bloquea_3c": false
    },
    {
      "tipo": "SUGERENCIA OPCIONAL",
      "descripcion": "T257 detalla el contrato de idempotencia con precision para P-M07 y para M13-M18, pero para M08/M09/M10 (T257, lineas ~141305 en adelante) no se leyo el detalle completo de eventos one-shot especificos mas alla del contrato general BLOQUEADA/DISPONIBLE/ACTIVA/HECHA; se marco NO CERRADO EN FUENTE por precaucion en vez de inferir.",
      "riesgo": "bajo",
      "bloquea_3c": false
    }
  ],
  "human_decisions_pending": [
    {
      "problema": "¿Existe una revision de M16 posterior a T281 que no llego a este lote de fuentes?",
      "por_que_no_se_resuelve": "La Fuente Maestra ver55 termina en T293 sin una segunda pasada de M16; el Backup Maestro no anade contenido narrativo nuevo sobre M16 mas alla de resumir T281.",
      "opciones_documentadas": [
        "Usar T281 como version unica y canonica (opcion por defecto de esta auditoria).",
        "Aportar una fuente adicional si existe una conversacion posterior no fusionada."
      ],
      "sistemas_afectados": [
        "M16",
        "companeros (autonomia en crisis)",
        "gate M16->M17"
      ],
      "bloquea_3c": false
    },
    {
      "problema": "Destino de contenido legacy de ver68 no mencionado explicitamente en las fuentes de reemplazo (jade/Shen Liang, huerto_jade, veta_y_horno, peces_lunares, devoradores, memorias_verticales, cazadores_verticales, guardianes_ocultos, origen_personal).",
      "por_que_no_se_resuelve": "Corresponde a M2 (migracion funcional 40->329), fuera del alcance explicito de esta Auditoria 6.",
      "opciones_documentadas": [
        "NO CERRADO EN FUENTE"
      ],
      "sistemas_afectados": [
        "M2",
        "3C"
      ],
      "bloquea_3c": true
    },
    {
      "problema": "Precision exacta de 'qi_max estructural = 25' en CONSAGRAR (¿literal 25/25 o alcanzar el reino LI?).",
      "por_que_no_se_resuelve": "Declarado explicitamente pendiente en T286 ('revisaremos cuando adaptemos la progresion de ver55').",
      "opciones_documentadas": [
        "NO CERRADO EN FUENTE"
      ],
      "sistemas_afectados": [
        "gate LI->LII",
        "sistema de cultivo/CONSAGRAR"
      ],
      "bloquea_3c": false
    },
    {
      "problema": "Room_id 329 literal para varias localizaciones citadas solo en prosa (almacen de M02, sector marcial de M03, Sala Anatomica/Archivo Clinico de M10, puntos de medicion de M08, Cabañas/patio exterior de M01).",
      "por_que_no_se_resuelve": "No hay evidencia documental de mapping explicito; asignar por semejanza semantica esta prohibido por la regla de no invencion.",
      "opciones_documentadas": [
        "NO CERRADO EN FUENTE",
        "Corresponde a M2/3C con verificacion contra Topologia v2"
      ],
      "sistemas_afectados": [
        "M02",
        "M03",
        "M08",
        "M10",
        "M01"
      ],
      "bloquea_3c": true
    },
    {
      "problema": "Relacion final entre EMERGENCIA_SECTA/CRISIS_RUTAS (M16) y un futuro sistema de postas/carruajes jugable.",
      "por_que_no_se_resuelve": "El sistema de postas jugable esta declarado explicitamente NO_DISEÑADO en Auditoria 4B; los costes 2/2/2/3 y las rutas propuestas son PROPUESTA_NO_CANONICA.",
      "opciones_documentadas": [
        "Diseno nuevo y consciente si se decide implementar fast travel (Backup Maestro §83)."
      ],
      "sistemas_afectados": [
        "M16 CRISIS_RUTAS",
        "4B",
        "economia"
      ],
      "bloquea_3c": false
    }
  ]
}});
 const b1=connectB1({runtime,bridge,input,a09:a09Host,ascensions,liv:livMissions,rooms:roomDefinitions});
 const b3=connectB3Native({runtime,bridge,input,readA09:()=>a09Host.inspect(),capture:()=>capture(),validateGraph:(d,id)=>{validate(d,id,true);return true;}});
 const expandedWorld=connectWorldExpansion({runtime,bridge,input,roomDefinitions,expansion});
 const feeds=createP3IndependentFeeds({runtime,roomDefinitions});feeds.attachTargets(targetBinding);feeds.setInstitutionReader(()=>evaluation.captureInstitution());
 let qiaoNative,services,alchemy;const qiao=createQiaoDeliveryDomain({readContext:()=>qiaoNative?.capture()});
 const targets=Object.freeze({prepareExtractionTick:()=>bridge.prepareExtractionTick()});
 const corpses=connectNewCorpseExtraction({runtime,targets,m02Domain:m02,definitions:{...extractionDefinitions,...bridge.definitions().corpse},materialDefinitions:{...materialDefinitions,...bridge.definitions().items},ttl:corpseTTL,random:()=>bridge.random(),input,readOwner:read,onNativeObservation:cap=>li.observeCorpse(cap),resolveConsumption:cap=>services?.resolveAuthorization(cap)||alchemy?.resolveAuthorization(cap)||qiao.resolveAuthorization(cap)});
 qiao.connect(corpses.materialInventory());qiaoNative=connectQiaoNativeDelivery({runtime,domain:qiao,input,npcResolver,questDefinitions,monsterDefinitions,readNew:()=>read().state,readM3:()=>evaluation.captureInstitution(),readMaterialContext:()=>corpses.materialContext()});
 services=connectNativeServices({runtime,bridge,input,materialOwner:corpses.materialInventory(),materialContext:()=>corpses.materialContext(),evaluation,visual});
 const lifecycle={};bindSemantic(lifecycle,{capture(){return clone({version:1,generation:learning.capture().generation,...bridge.captureLifecycle()});},prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||d.clock!==c.envelope.domains.World.relojEcologico||d.room!==c.envelope.domains.World.pos)throw Error('A08_LIFECYCLE_SEMANTIC_SCOPE');return {apply(){return ()=>{};}};}});
 const player={};bindSemantic(player,{capture(){return clone({version:1,state:bridge.capturePlayer()});},prepare(d,c){requireRestorePermit(c.permit,c.envelope);if(d.version!==1||d.state.root!==c.envelope.domains.Learning.root)throw Error('A08_PLAYER_LEARNING_ROOT_CONFLICT');return bridge.preparePlayer(d.state,c.envelope.domains.World.player,c.envelope.domains.World);}});
 function validate(d,id=null,skipB3=false){li.validate(d);ascensions.validate(d);upper.validate(d);livMissions.validate(d);a09Host.validate(d);m15.validate(d);b1.validate(d);if(!skipB3)b3.validate(d,id);expandedWorld.validate?.(d);herbalism.validateWorld(d.World.player,d.Player.state);alchemy.validateWorld(d.World.player,d.Player.state);for(const r of d.Player.state.medicineReceipts||[]){if(!r.craftActionId)continue;const proof=d.World.player.profesiones?.alquimia?.craftsR56?.find(x=>x.actionId===r.craftActionId);if(!proof?.consumed||proof.itemId!==r.itemId||proof.craftStage!==r.craftBinding?.stage||proof.quality!==r.craftBinding?.quality||({sangre:'HP',elixir:'QI',tempestad:'QI'})[proof.recipe]!==r.craftBinding?.family)throw Error('R64_CRAFT_CONSUMPTION_PROVENANCE');}const h=d.World.flags?.arc1?.hitos||{},p=d.Player.state;
  if(!(p.stage==='ZhuJi'?p.version===5&&p.schema==='B3_ZHUJI_PRIVATE_PLAYER_V5':p.version===4&&p.schema==='V284_V306_PRIVATE_PLAYER_V4')||p.root!==d.Learning.root||id&&p.gameId!==id.gameId)throw Error('A08_CAMPAIGN_PLAYER_SOURCE');
  if(p.cultivation.stage!==p.stage||p.cultivation.ledger.stage!==p.stage||p.cultivation.mode!==p.branches.mode||JSON.stringify([...p.progression.mastered].sort())!==JSON.stringify(p.branches.history.map(h=>h.skillId).sort()))throw Error('A08_PROGRESSION_DOMAIN_GRAPH');
  if(!!h.M02_RATA_RESUELTA!==!!d.M02.accepted||!!h.M03_FUNDAMENTOS_INSTRUIDOS!==!!d.P1.instruction||!!h.M03_PRACTICA_MUNECO_COMPLETADA!==!!d.P1.completed||!!h.EVALUACION_CIRCULACION_SUPERADA!==!!d.Institution.evaluation.completed||!!h.M03_PROMOCION_FORMALIZADA!==d.Institution.formalized)throw Error('A08_CAMPAIGN_PRIVATE_PUBLIC_CONFLICT');
  for(const name of ['Learning','Lifecycle','M02','Corpses','Materials','Visits'])if(d[name].generation!==d.Learning.generation)throw Error('A08_CAMPAIGN_GENERATION_CONFLICT');
  if(d.Institution.formalized&&(d.World.quests.M03!=='hecha'||d.World.player.facciones?.grulla_blanca?.estado!=='miembro'||!d.P1.completed)||d.Institution.evaluation.completed&&!d.P1.completed)throw Error('A08_INSTITUTION_GRAPH');
  const lifeIds=d.Lifecycle.records.map(r=>r.lifeId);if(new Set(lifeIds).size!==lifeIds.length)throw Error('A08_LIFECYCLE_DUPLICATE');
  if(d.World.player.hp!==p.hp||d.World.player.qi!==p.qi||d.World.player.raiz!==p.root.toLowerCase()||d.World.player.etapa!==['LianQi_I','LianQi_II','LianQi_III','LianQi_IV','ZhuJi'].indexOf(p.stage)+1)throw Error('A08_NUMERIC_PROJECTION_CONFLICT');
  if(d.World.player.piedras!==p.stones)throw Error('A08_CURRENCY_OWNER_CONFLICT');
  bridge.validateProgressionSnapshot(p,d.World);
  if(p.ecology!==d.World.relojEcologico||d.Lifecycle.retired.length||lifeIds.length!==p.lives.length)throw Error('A08_LIFECYCLE_PLAYER_GRAPH');
  for(const l of p.lives){const r=d.Lifecycle.records.find(x=>x.lifeId===l.lifeId);if(!r||r.identity.instanceId!==l.key||r.identity.speciesId!==l.id||r.identity.lifeId!==l.lifeId||r.owner.terminal!==l.terminal||r.owner.hp_current!==l.hp||r.disposition!==(l.disposition||'NONE'))throw Error('A08_LIFECYCLE_PLAYER_GRAPH');}
  if(JSON.stringify([...p.progression.known].sort())!==JSON.stringify([...d.Learning.knownIds,...p.additionalKnown].sort()))throw Error('A08_LEARNING_OWNER_CONFLICT');
  const transactions=p.serviceTransactions;for(const t of transactions||[])if((t.kind==='MISSION_REWARD'||t.kind==='INSTITUTIONAL_PERMISSION')&&d.World.quests[t.missionId]!=='hecha')throw Error('R56_INSTITUTIONAL_RECEIPT_QUEST_CONFLICT');if(!Array.isArray(transactions))throw Error('A08_SERVICE_LEDGER_SCHEMA');const consumedServices=transactions.flatMap(t=>t.materials.filter(i=>i.owner!=='INVENTORY'));const all=[...d.Materials.items,...(d.Qiao.accepted?.items||[]),...consumedServices];if(new Set(all.map(x=>x.instanceId)).size!==all.length)throw Error('A08_MATERIAL_INSTANCE_DUPLICATE');
  for(const i of all){const a=d.Corpses.attempts.find(a=>a.attemptId===i.provenance.attemptId);if(!lifeIds.includes(i.lifeId)||!a||!a.success||a.lifeId!==i.lifeId||a.speciesId!==i.speciesId||a.catalogId!==i.catalogId||a.procedureId!==i.procedureId||a.generation!==i.provenance.generation)throw Error('A08_MATERIAL_EXTRACTION_GRAPH');}
  for(const t of transactions)for(const i of t.materials.filter(i=>i.owner==='INVENTORY')){const life=p.lives.find(l=>l.lifeId===i.provenance.sourceId);if(!life?.terminal||life.disposition!=='APPLIED'||!bridge.definitions().commerce.materials[i.catalogId]||!p.inventory.consumed.includes(t.receiptId))throw Error('R49_SOLD_DROP_GRAPH');}
  const spentDrops=transactions.flatMap(t=>t.materials.filter(i=>i.owner==='INVENTORY')),ownedDropIds=new Set([...p.inventory.items,...p.groundItems.map(x=>x.item)].map(i=>i.instanceId));if(spentDrops.some(i=>ownedDropIds.has(i.instanceId)))throw Error('R49_SOLD_DROP_STILL_OWNED');
  const dropTotals=new Map();for(const item of [...p.inventory.items,...p.groundItems.map(x=>x.item),...spentDrops].filter(i=>i.provenance?.source==='V201_NATIVE_DEATH_DROP')){const life=p.lives.find(l=>l.lifeId===item.provenance.sourceId),id=item.itemId||item.catalogId,source=bridge.definitions().loot[life?.id]?.find(x=>x.item===id),key=JSON.stringify([life?.lifeId,id]);if(!life?.terminal||life.disposition!=='APPLIED'||!source)throw Error('R49_DROP_LIFE_SOURCE');dropTotals.set(key,(dropTotals.get(key)||0)+item.quantity);if(dropTotals.get(key)>source.cantidad)throw Error('R49_DROP_LIFE_QUANTITY');}
  if(d.Materials.consumed.length!==(d.Qiao.accepted?.items.length||0)+consumedServices.length||consumedServices.some(i=>!d.Materials.consumed.includes(i.instanceId)))throw Error('A08_MATERIAL_CONSUMPTION_CAUSE');
 }
 const herbalism=connectNativeHerbalism({runtime,bridge,visual});alchemy=connectNativeAlchemy({runtime,bridge,visual,materialOwner:corpses.materialInventory(),materialContext:()=>corpses.materialContext()});
 const professions={prepareRestore(...args){const h=herbalism.prepareRestore(...args),a=alchemy.prepareRestore(...args);return {apply(){const undoH=h.apply(),undoA=a.apply();return ()=>{undoA();undoH();};}};}};
 const world=createCampaignWorldPort(runtime,roomDefinitions,professions),identity={gameId:crypto.randomUUID(),actorId:'player',persistentGeneration:0,sourceSHA256:'9f0bbde077e39edffda1ab75c70f0de85a40df7a51bba4e92fccc5d63b469f43'},coordinator=createMemoryCoordinator({identity,required:['World','Player','Learning','Lifecycle','M02','Corpses','Materials','P1','Institution','Qiao','Visits','LIArc1','Ascensions','UpperMissions','LIVMissions','A09Boss','M15Graft','B1Actions','B3Foundation','A07'],context:()=>({owner:()=>actor,actor:()=>runtime.player}),storedResolver:cap=>upgradeB3Record(upgradeB1StoredRecord(upgradeM15StoredRecord(upgradeA09StoredRecord(requireStoreCandidate(cap))))),validate});
 for(const [name,owner]of [['World',world],['Player',player],['Learning',learning],['Lifecycle',lifecycle],['M02',m02],['Corpses',corpses],['Materials',corpses.materialInventory()],['P1',foundation],['Institution',evaluation],['Qiao',qiao],['Visits',feeds],['LIArc1',li],['Ascensions',ascensions],['UpperMissions',upper],['LIVMissions',livMissions],['A09Boss',a09Host],['M15Graft',m15],['B1Actions',b1],['B3Foundation',b3]])coordinator.attach(name,owner);
 let attachedA07=false;function attachA07(){if(!attachedA07){coordinator.attach('A07',globalThis.ASTRA_CC_SESSION);attachedA07=true;}}
 const oldNew=runtime.nuevaPartida;runtime.nuevaPartida=function(...args){teaching.reset();learning.reset();coordinator.invalidate();identity.gameId=crypto.randomUUID();identity.persistentGeneration=learning.capture().generation;return oldNew.apply(this,args);};
 const capture=()=>{herbalism.captureCheck();alchemy.captureCheck();if(visual.inspect().active||teaching.inspect().active||ascensions.blocked())throw Error('A08_CAMPAIGN_SESSION_ACTIVE');attachA07();return coordinator.capture();};
 const restoreStored=cap=>{if(visual.inspect().active)throw Error('A08_V13_RESTORE_BLOCKED');attachA07();const r=coordinator.restoreStored(cap);teaching.cancel();runtime.desactivarEleccionActiva();runtime.actualizarBarra();runtime.actualizarMinimapa();if(runtime.combate){runtime.abrirInterfazCombate();runtime.actualizarVistaCombate();}else runtime.cerrarInterfazCombate();return r;};
 const storage=connectA09NativeDurable({runtime,roomDefinitions,capture,preflight:cap=>{attachA07();return coordinator.preflightStored(cap);},restoreStored,validate,qiao,visual});
 a09Host.connectDurable(storage.commitA09);m15.connectDurable(storage.commitM15);b1.connectDurable(storage.commitB1);services.connectDurable(storage.commitB1);storage.connectB3Verifier(b3.verifyProposal);b3.connectDurable(storage.commitB3);
 const port=Object.freeze({prepare(cap){return learning.prepare(cap);},publish(cap){const result=learning.publish(cap,read().view);herbalism.initializeNew();alchemy.initializeNew();m02.attachActor(actor);feeds.attachActor(actor);identity.gameId=bridge.capturePlayer().gameId;identity.persistentGeneration=result.generation;return result;},abort:cap=>learning.abort(cap),
  deliverDeath(native){const d=bridge.resolveDeath(native),cap=sealResolvedV284Death({native,nativeGeneration:d.generation,lifeId:d.lifeId,birth:Object.freeze({}),attackerOwner:actor,actorId:'player',actorRevision:bridge.read().state.revision,identity:{instanceId:'errant:'+d.mob.errante_id,speciesId:d.mob.mob_id},roomId:d.roomId});return m02.deliver(cap,actor);},
  observeDeath(native){ascensions.observeVictory(bridge.resolveMissionVictory(native));upper.observeVictory(bridge.resolveMissionVictory(native));if(read().state.stage!=='LianQi_I')return null;const d=bridge.resolveCommittedDeath(native),target=Object.freeze({snapshot:()=>Object.freeze({terminal:d.life.terminal,hp_current:d.life.hp})}),cap=sealResolvedV284Death({native,nativeGeneration:d.generation,generalObservation:true,lifeId:d.lifeId,birth:Object.freeze({}),epoch:d.sequence,targetOwner:target,attackerOwner:actor,actorId:'player',actorRevision:bridge.read().state.revision,identity:{instanceId:d.mob.errante_id?'errant:'+d.mob.errante_id:'fixed:'+d.mob.fijo_id,speciesId:d.mob.mob_id},roomId:d.roomId});li.observeVictory(native);return feeds.observeDeath(cap,actor);},
  mayBirth:room=>m02.mayBirth({instanceId:'errant:rata_despensa',speciesId:'rata_qi'},m02.inspect().generation,room),
  a09SessionActive:()=>a09Host.active(),ascensionRequirements:()=>ascensions.requirements(),nativeInputCurrent:()=>input.current(),
  prepareGeneralDeath(native){const d=bridge.resolveDeath(native),target=Object.freeze({}),cap=sealResolvedV284Death({native,lifeId:d.lifeId,targetOwner:target,identity:{instanceId:d.mob.errante_id?'errant:'+d.mob.errante_id:'fixed:'+d.mob.fijo_id,speciesId:d.mob.mob_id},roomId:d.roomId});return corpses.prepare(cap,{owner:target,mob:d.mob,sequence:d.sequence,lifeId:d.lifeId});},
  inspectOwnedMaterial(query){const items=requireNewMaterialInventory(corpses.materialInventory()).inspect().items,defs={...materialDefinitions,...bridge.definitions().items},instance=items.find(i=>i.instanceId===query),id=instance?.catalogId||globalThis.ASTRA_A08_SHARED.resolve(query,items.map(i=>i.catalogId),defs);return id?globalThis.ASTRA_A08_ITEM_PRESENTATION.describe(defs,id):null;},
  commitMutantOutcome:cap=>storage.commitMutantFailure(bridge.resolveMutantOutcome(cap)),
  consumeAlchemySpecial:(id,args)=>alchemy.consumeSpecial(id,args),examinePlant:args=>herbalism.examine(args),harvest:(kernel,args)=>herbalism.harvest(kernel,args),learning:()=>learning.capture(),capture,
  blocked:()=>visual.inspect().active||teaching.inspect().active,
  inspect:()=>Object.freeze({learning:learning.capture(),teaching:teaching.inspect(),visual:visual.inspect(),m02:m02.inspect(),foundation:foundation.inspect(),evaluation:evaluation.inspect(),corpses:corpses.inspect(),qiao:qiao.inspect(),visits:feeds.inspect(),storage:storage.inspect(),services:services.inspect(),li:li.inspect(),a09:a09Host.inspect(),m15:m15.inspect(),b1:b1.inspect(),b3:b3.inspect(),ascensions:ascensions.inspect(),upperMissions:upper.inspect(),upperBlockers:upper.blockers(),livMissions:livMissions.inspect(),expandedWorld:expandedWorld.inspect(),herbalism:herbalism.inspect(),alchemy:alchemy.inspect()})});
 bridge.attach(port);
 delete globalThis.ASTRA_A08_CAMPAIGN_CONNECT;return Object.freeze({connected:true});
}});
