import { freeze } from './readonly-data.js';

/** Generated 1:1 by docs/integracion/astra/a07.6.1a/tools/build-relations.mjs. */
const RELATION_SOURCE = freeze({
  "path": "docs/integracion/astra/a07.6.0/npc-npc-authority-graph.json",
  "sha256": "9119a616a84d4943a468e50177b358998a11a3aed9dbbd3d17078aa5d41bef16",
  "acceptedCommit": "891d474912a365baaa80da4ce9fa35eb6dc425fd",
  "projection": "EXACT_RELATIONS_ARRAY_1_TO_1"
});
const RELATIONS = freeze([
  {
    "id": "REL_lin_yue_han_qiao",
    "actorA": "lin_yue",
    "actorB": "han_qiao",
    "relationType": "COMPETENCIA_RENDIMIENTO",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_lin_yue_mei_lian",
    "actorA": "lin_yue",
    "actorB": "mei_lian",
    "relationType": "AMISTAD_ENTRENAMIENTO",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_lin_yue_guo_chen",
    "actorA": "lin_yue",
    "actorB": "guo_chen",
    "relationType": "SIMPATIA_ENTRENAMIENTO",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_lin_yue_luo_yan",
    "actorA": "lin_yue",
    "actorB": "luo_yan",
    "relationType": "CONFIANZA_PRACTICA_EMERGENCIAS",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_han_qiao_guo_chen",
    "actorA": "han_qiao",
    "actorB": "guo_chen",
    "relationType": "TENSION_SOCIAL",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_zhao_wen_mei_lian",
    "actorA": "zhao_wen",
    "actorB": "mei_lian",
    "relationType": "INTERCAMBIO_MEDICINA_ANTIGUA",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_zhao_wen_luo_yan",
    "actorA": "zhao_wen",
    "actorB": "luo_yan",
    "relationType": "DESACUERDO_EVIDENCIA_AUTORIDAD",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_mei_lian_guo_chen",
    "actorA": "mei_lian",
    "actorB": "guo_chen",
    "relationType": "AMISTAD",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_guo_chen_luo_yan",
    "actorA": "guo_chen",
    "actorB": "luo_yan",
    "relationType": "RESPETO_CON_DESACUERDO",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "C1_REL",
      "T243_REL",
      "T118_ZERO"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_MEI_FAMILY",
    "actorA": "mei_shufen",
    "actorB": "mei_lian",
    "relationType": "TIA_SOBRINA",
    "classification": "VERIFIED_EXPLICIT",
    "source": [
      "MEI_AUNT"
    ],
    "scope": "GLOBAL",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_HE_WEN",
    "actorA": "he_zhen",
    "actorB": "wen_tao",
    "relationType": "CONTRAPARTE_TECNICA",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "HE_WEN"
    ],
    "scope": "ARC1",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Base documental únicamente; no binding productivo, motivo actual, conocimiento local ni permiso de divulgación."
  },
  {
    "id": "REL_DUAN_MA",
    "actorA": "duan_shibo",
    "actorB": "ma_qiren",
    "relationType": "COORDINACION_ALMACENES",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "DUAN_MA",
      "M13_REGISTERS"
    ],
    "scope": "ARC1",
    "symmetric": false,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Coordinación dirigida; no relación personal ni divulgación universal de R6."
  },
  {
    "id": "REL_M09_song_rui_yu_shun",
    "actorA": "song_rui",
    "actorB": "yu_shun",
    "relationType": "COOPERACION_DOCUMENTAL",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "SONG_COOP",
      "YU_COOP",
      "M09_COLLAB"
    ],
    "scope": "MISSION:M09",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación acotada; participación de Zhao requiere fuente/escena válida. No concede ARCHIVO_RESTRINGIDO."
  },
  {
    "id": "REL_M09_song_rui_zhao_wen",
    "actorA": "song_rui",
    "actorB": "zhao_wen",
    "relationType": "COOPERACION_DOCUMENTAL",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "SONG_COOP",
      "YU_COOP",
      "M09_COLLAB"
    ],
    "scope": "MISSION:M09",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación acotada; participación de Zhao requiere fuente/escena válida. No concede ARCHIVO_RESTRINGIDO."
  },
  {
    "id": "REL_M09_yu_shun_zhao_wen",
    "actorA": "yu_shun",
    "actorB": "zhao_wen",
    "relationType": "COOPERACION_DOCUMENTAL",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "SONG_COOP",
      "YU_COOP",
      "M09_COLLAB"
    ],
    "scope": "MISSION:M09",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación acotada; participación de Zhao requiere fuente/escena válida. No concede ARCHIVO_RESTRINGIDO."
  },
  {
    "id": "REL_M16_lan_meihua_chen_bo",
    "actorA": "lan_meihua",
    "actorB": "chen_bo",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_MED",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  },
  {
    "id": "REL_M16_lan_meihua_yao_fen",
    "actorA": "lan_meihua",
    "actorB": "yao_fen",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_MED",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  },
  {
    "id": "REL_M16_chen_bo_yao_fen",
    "actorA": "chen_bo",
    "actorB": "yao_fen",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_MED",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  },
  {
    "id": "REL_M16_jiang_rui_ren_bo",
    "actorA": "jiang_rui",
    "actorB": "ren_bo",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_ROUTE",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  },
  {
    "id": "REL_M16_he_zhen_wen_tao",
    "actorA": "he_zhen",
    "actorB": "wen_tao",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_FORM",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  },
  {
    "id": "REL_M16_duan_shibo_ma_qiren",
    "actorA": "duan_shibo",
    "actorB": "ma_qiren",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_RES",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  },
  {
    "id": "REL_M16_duan_shibo_lu_cheng",
    "actorA": "duan_shibo",
    "actorB": "lu_cheng",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_RES",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  },
  {
    "id": "REL_M16_ma_qiren_lu_cheng",
    "actorA": "ma_qiren",
    "actorB": "lu_cheng",
    "relationType": "COOPERACION_FRENTE",
    "classification": "VERIFIED_FUNCTIONAL",
    "source": [
      "M16_RES",
      "M16_CLOSE"
    ],
    "scope": "CRISIS:M16",
    "symmetric": true,
    "usableForConversation": false,
    "documentaryContactBasis": true,
    "notes": "Cooperación funcional en frente; no amistad, jerarquía nueva, ruta de encuentro o asignación universal de compañeros."
  }
]);

export { RELATIONS, RELATION_SOURCE };
