import { freeze, copy, fail } from './safe-data.js';
import { JI_XUEYING_FSM } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/policies/ji-xueying-fsm.js';
import { QIAO_REN_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/qiao-ren-utility-profile.js';
import { WEI_JIAN_BT } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/policies/wei-jian-bt.js';
import { SONG_RUI_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/song-rui-utility-profile.js';
import { LAN_MEIHUA_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/lan-meihua-utility-profile.js';
import { DUAN_SHIBO_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/duan-shibo-utility-profile.js';
import { HE_ZHEN_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/he-zhen-utility-profile.js';
import { SHEN_BAOJUN_FSM, MADRE_WEN_FSM, TAO_MING_FSM, SU_LIAN_BT, CHEN_BO_BT, YAO_FEN_BT } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/policies/intermediate-policies.js';
import { JIANG_RUI_FSM } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/policies/jiang-rui-fsm.js';
import { GAO_SHUN_FSM } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/policies/gao-shun-fsm.js';
import { FENG_ZHI_FSM, MA_QIREN_BT, LU_CHENG_FSM, NING_CAI_FSM, WEN_TAO_BT, YU_SHUN_FSM, MA_GU_FSM, REN_BO_BT, XU_AN_BT, MEI_SHUFEN_FSM } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.js';
import { PEI_LUO_FSM } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/policies/pei-luo-fsm.js';
import { LIN_YUE_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/lin-yue-utility-profile.js';
import { HAN_QIAO_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/han-qiao-utility-profile.js';
import { ZHAO_WEN_DIALOGUE_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/zhao-wen-dialogue-profile.js';
import { MEI_LIAN_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/mei-lian-utility-profile.js';
import { GUO_CHEN_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/guo-chen-utility-profile.js';
import { LUO_YAN_UTILITY_PROFILE } from './vendor/experimentos/npc/canonical-behavior-lab-v0.1/profiles/luo-yan-utility-profile.js';

/** Generated from the approved A07.0 inventory; no new architecture or personality. */
const rows=freeze([
  {
    "actorId": "ji_xueying",
    "name": "Ji Xueying",
    "role": "Maestra de Secta",
    "architecture": "FSM",
    "policyExport": "JI_XUEYING_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/ji-xueying-fsm.mjs",
      "sha256": "c9fb0654646389804945c7fd6bc7466ef99316b3cc77644cf25482bdef515d68",
      "export": "JI_XUEYING_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "INSTITUTION",
    "canonical": {
      "id": "ji_xueying",
      "nombre": "Ji Xueying",
      "rol": "Maestra de Secta",
      "categoria": "autoridad",
      "sala_inicial": "interior_sala_consejo",
      "movilidad": "ANCLADO",
      "territorio_normal": [
        "interior_sala_consejo"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "interior_sala_consejo"
      ],
      "rutas": [],
      "anclajes_documentados": [
        "M17 (preside Consejo)",
        "M18 indirecto",
        "comparecencia ZhuJi"
      ],
      "conocimiento_inicial": {
        "R1": "SOSPECHA",
        "R2": "SABE",
        "R3": "SABE",
        "R4": "SOSPECHA",
        "R5": "SOSPECHA",
        "R6": "SOSPECHA",
        "R7": "SABE",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    }
  },
  {
    "actorId": "qiao_ren",
    "name": "Qiao Ren",
    "role": "Disciplina y Administración",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "QIAO_REN_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/qiao-ren-utility-profile.mjs",
      "sha256": "7ab4a9bfad1eebc25ee6006fc941cc3cd3dbd58ce8ac79be83a0e1a837fe37a3",
      "export": "QIAO_REN_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "INSTITUTION",
    "canonical": {
      "id": "qiao_ren",
      "nombre": "Qiao Ren",
      "rol": "Disciplina y Administración",
      "categoria": "autoridad",
      "sala_inicial": "pabellon_disciplina",
      "movilidad": "RUTA",
      "territorio_normal": [
        "pabellon_disciplina",
        "corredor_norte",
        "interior_sala_consejo"
      ],
      "transito_tecnico": [
        "escalinata_interior",
        "interior_umbral_sur",
        "interior_patio_blanco",
        "interior_patio_internos",
        "interior_sala_estudio",
        "interior_corredor_consejo",
        "interior_antesala_consejo"
      ],
      "posicion_valida": [
        "corredor_norte",
        "escalinata_interior",
        "interior_antesala_consejo",
        "interior_corredor_consejo",
        "interior_patio_blanco",
        "interior_patio_internos",
        "interior_sala_consejo",
        "interior_sala_estudio",
        "interior_umbral_sur",
        "pabellon_disciplina"
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
      "anclajes_documentados": [
        "M03 (cierre de misión, ANCLADA en pabellon_disciplina)",
        "M07",
        "M16 (coordinación)",
        "M17",
        "comparecencia/epílogo"
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
    }
  },
  {
    "actorId": "wei_jian",
    "name": "Wei Jian",
    "role": "Responsable marcial / Pabellón Marcial",
    "architecture": "BT",
    "policyExport": "WEI_JIAN_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/wei-jian-bt.mjs",
      "sha256": "92743526ca754f223c6020ae617ed2d375d79eef16601cf1f986a7acf140be88",
      "export": "WEI_JIAN_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "SECURITY",
    "canonical": {
      "id": "wei_jian",
      "nombre": "Wei Jian",
      "rol": "Responsable marcial / Pabellón Marcial",
      "categoria": "autoridad",
      "sala_inicial": "patio_marcial",
      "movilidad": "RUTA",
      "territorio_normal": [
        "patio_marcial",
        "sala_formas",
        "patio_respiracion",
        "interior_pabellon_instructores"
      ],
      "transito_tecnico": [
        "pabellon_disciplina",
        "corredor_norte",
        "escalinata_interior",
        "interior_umbral_sur",
        "interior_patio_blanco",
        "interior_patio_internos",
        "interior_sala_estudio"
      ],
      "posicion_valida": [
        "corredor_norte",
        "escalinata_interior",
        "interior_pabellon_instructores",
        "interior_patio_blanco",
        "interior_patio_internos",
        "interior_sala_estudio",
        "interior_umbral_sur",
        "pabellon_disciplina",
        "patio_marcial",
        "patio_respiracion",
        "sala_formas"
      ],
      "rutas": [
        [
          "patio_marcial",
          "sala_formas"
        ],
        [
          "sala_formas",
          "patio_respiracion"
        ],
        [
          "patio_respiracion",
          "pabellon_disciplina",
          "corredor_norte",
          "escalinata_interior",
          "interior_umbral_sur",
          "interior_patio_blanco",
          "interior_patio_internos",
          "interior_sala_estudio",
          "interior_pabellon_instructores"
        ]
      ],
      "anclajes_documentados": [
        "M03 (junto a Qiao Ren, cierre)",
        "arco de Lin Yue",
        "crisis marcial / M16 (seguridad)"
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
  {
    "actorId": "song_rui",
    "name": "Song Rui",
    "role": "Responsable de Archivos",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "SONG_RUI_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/song-rui-utility-profile.mjs",
      "sha256": "402bd26ba3322ef515e464764516b5e7dfeb19093771acf4b6e6a1f3f784093f",
      "export": "SONG_RUI_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "ARCHIVE",
    "canonical": {
      "id": "song_rui",
      "nombre": "Song Rui",
      "rol": "Responsable de Archivos",
      "categoria": "autoridad",
      "sala_inicial": "archivos_sala_consulta",
      "movilidad": "RUTA",
      "territorio_normal": [
        "archivos_sala_consulta",
        "archivos_catalogo",
        "archivos_escritorio_copistas"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "archivos_catalogo",
        "archivos_escritorio_copistas",
        "archivos_sala_consulta"
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
      "anclajes_documentados": [
        "M09",
        "M11",
        "M15",
        "M17",
        "epílogo (catalogación)"
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
    }
  },
  {
    "actorId": "lan_meihua",
    "name": "Lan Meihua",
    "role": "Medicina / Alquimia",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "LAN_MEIHUA_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/lan-meihua-utility-profile.mjs",
      "sha256": "75eb88471025326b8b47936e80858ee4306bdeda6217466abe33efc14bfc4bc2",
      "export": "LAN_MEIHUA_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "MEDICAL",
    "canonical": {
      "id": "lan_meihua",
      "nombre": "Lan Meihua",
      "rol": "Medicina / Alquimia",
      "categoria": "autoridad",
      "sala_inicial": "consultorio_meridianos",
      "movilidad": "RUTA",
      "territorio_normal": [
        "consultorio_meridianos",
        "sala_tratamientos",
        "archivo_clinico"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "archivo_clinico",
        "consultorio_meridianos",
        "sala_tratamientos"
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
      "anclajes_documentados": [
        "M10",
        "M11",
        "M16 (responsable Medicina)"
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
    }
  },
  {
    "actorId": "duan_shibo",
    "name": "Duan Shibo",
    "role": "Recursos / Producción",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "DUAN_SHIBO_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/duan-shibo-utility-profile.mjs",
      "sha256": "78a767cc958140afb8e859d6c1e20e6e1986a8454ea3a142d3d244b1301545a4",
      "export": "DUAN_SHIBO_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "LOGISTICS",
    "canonical": {
      "id": "duan_shibo",
      "nombre": "Duan Shibo",
      "rol": "Recursos / Producción",
      "categoria": "autoridad",
      "sala_inicial": "oficina_logistica",
      "movilidad": "RUTA",
      "territorio_normal": [
        "oficina_logistica",
        "patio_produccion",
        "cochera_carros"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "cochera_carros",
        "oficina_logistica",
        "patio_produccion"
      ],
      "rutas": [
        [
          "oficina_logistica",
          "patio_produccion"
        ],
        [
          "oficina_logistica",
          "cochera_carros"
        ]
      ],
      "anclajes_documentados": [
        "M13",
        "M16 (responsable Recursos)"
      ],
      "conocimiento_inicial": {
        "R1": "SOSPECHA",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "SOSPECHA",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    }
  },
  {
    "actorId": "he_zhen",
    "name": "He Zhen",
    "role": "Formaciones / Territorio",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "HE_ZHEN_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/he-zhen-utility-profile.mjs",
      "sha256": "897faa7b322ae6c351c8aa149c7385a0137eedaf7094261feaacdc5bb75a00ed",
      "export": "HE_ZHEN_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "FORMATIONS",
    "canonical": {
      "id": "he_zhen",
      "nombre": "He Zhen",
      "rol": "Formaciones / Territorio",
      "categoria": "autoridad",
      "sala_inicial": "formaciones_sala_control",
      "movilidad": "RUTA",
      "territorio_normal": [
        "formaciones_sala_control",
        "formaciones_patio_medicion",
        "formaciones_galeria_norte"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "formaciones_galeria_norte",
        "formaciones_patio_medicion",
        "formaciones_sala_control"
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
      "anclajes_documentados": [
        "M08",
        "M12",
        "M16 (responsable Formaciones)",
        "M17"
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
    }
  },
  {
    "actorId": "shen_baojun",
    "name": "Shen Baojun",
    "role": "Instructor marcial externo",
    "architecture": "FSM",
    "policyExport": "SHEN_BAOJUN_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/intermediate-policies.mjs",
      "sha256": "dc8dd1d62b7e7e6cf485d6dd22a8d76b5d696f92f80ca4a71a77cc809f06d6cb",
      "export": "SHEN_BAOJUN_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "TRAINING",
    "canonical": {
      "id": "shen_baojun",
      "nombre": "Shen Baojun",
      "rol": "Instructor marcial externo",
      "categoria": "intermedio",
      "sala_inicial": "sala_formas",
      "movilidad": "RUTA",
      "territorio_normal": [
        "sala_formas",
        "patio_marcial",
        "patio_respiracion"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "patio_marcial",
        "patio_respiracion",
        "sala_formas"
      ],
      "rutas": [
        [
          "sala_formas",
          "patio_marcial"
        ],
        [
          "sala_formas",
          "patio_respiracion"
        ]
      ],
      "anclajes_documentados": [
        "M03 (entrenamiento básico y Paso de Nube)"
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
  {
    "actorId": "madre_wen",
    "name": "Madre Wen",
    "role": "Responsable de vida cotidiana de externos",
    "architecture": "FSM",
    "policyExport": "MADRE_WEN_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/intermediate-policies.mjs",
      "sha256": "dc8dd1d62b7e7e6cf485d6dd22a8d76b5d696f92f80ca4a71a77cc809f06d6cb",
      "export": "MADRE_WEN_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "COMMUNITY",
    "canonical": {
      "id": "madre_wen",
      "nombre": "Madre Wen",
      "rol": "Responsable de vida cotidiana de externos",
      "categoria": "intermedio",
      "sala_inicial": "patio_cabanas",
      "movilidad": "RUTA",
      "territorio_normal": [
        "patio_cabanas",
        "comedor_externos",
        "corredor_cabanas",
        "sala_comun_externos"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "comedor_externos",
        "corredor_cabanas",
        "patio_cabanas",
        "sala_comun_externos"
      ],
      "rutas": [
        [
          "patio_cabanas",
          "comedor_externos"
        ],
        [
          "patio_cabanas",
          "corredor_cabanas"
        ],
        [
          "patio_cabanas",
          "sala_comun_externos"
        ]
      ],
      "anclajes_documentados": [
        "M01 (integración cotidiana de aspirantes)"
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
    }
  },
  {
    "actorId": "tao_ming",
    "name": "Tao Ming",
    "role": "Registro de Servicios",
    "architecture": "FSM",
    "policyExport": "TAO_MING_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/intermediate-policies.mjs",
      "sha256": "dc8dd1d62b7e7e6cf485d6dd22a8d76b5d696f92f80ca4a71a77cc809f06d6cb",
      "export": "TAO_MING_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "REGISTRY",
    "canonical": {
      "id": "tao_ming",
      "nombre": "Tao Ming",
      "rol": "Registro de Servicios",
      "categoria": "intermedio",
      "sala_inicial": "oficina_servicios",
      "movilidad": "RUTA",
      "territorio_normal": [
        "oficina_servicios",
        "patio_servicios",
        "deposito_comun"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "deposito_comun",
        "oficina_servicios",
        "patio_servicios"
      ],
      "rutas": [
        [
          "oficina_servicios",
          "patio_servicios"
        ],
        [
          "oficina_servicios",
          "deposito_comun"
        ]
      ],
      "anclajes_documentados": [
        "M01",
        "M02"
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
    }
  },
  {
    "actorId": "jiang_rui",
    "name": "Jiang Rui",
    "role": "Capitán de patrulla",
    "architecture": "FSM",
    "policyExport": "JIANG_RUI_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/jiang-rui-fsm.mjs",
      "sha256": "9c73d1e98ba62c37c7a0f0a904bfda2bea4a71904ee6672b1f4fb60765c5321e",
      "export": "JIANG_RUI_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "SECURITY",
    "canonical": {
      "id": "jiang_rui",
      "nombre": "Jiang Rui",
      "rol": "Capitán de patrulla",
      "categoria": "intermedio",
      "sala_inicial": "puesto_valle",
      "movilidad": "RUTA",
      "territorio_normal": [
        "puesto_valle",
        "valle_explanada",
        "patio_puesto_valle"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "patio_puesto_valle",
        "puesto_valle",
        "valle_explanada"
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
      "anclajes_documentados": [
        "M04–M07 (ANCLADO en Cruce Patrullas → Sala Informes según avance)",
        "M16 (responsable Rutas)"
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
  {
    "actorId": "su_lian",
    "name": "Su Lian",
    "role": "Maestra de Herboristería",
    "architecture": "BT",
    "policyExport": "SU_LIAN_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/intermediate-policies.mjs",
      "sha256": "dc8dd1d62b7e7e6cf485d6dd22a8d76b5d696f92f80ca4a71a77cc809f06d6cb",
      "export": "SU_LIAN_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "GARDENS",
    "canonical": {
      "id": "su_lian",
      "nombre": "Su Lian",
      "rol": "Maestra de Herboristería",
      "categoria": "intermedio",
      "sala_inicial": "bancal_central",
      "movilidad": "RUTA",
      "territorio_normal": [
        "bancal_central",
        "bancal_norte",
        "bancal_sur",
        "sendero_herbolario"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "bancal_central",
        "bancal_norte",
        "bancal_sur",
        "sendero_herbolario"
      ],
      "rutas": [
        [
          "bancal_central",
          "bancal_norte"
        ],
        [
          "bancal_central",
          "bancal_sur"
        ],
        [
          "bancal_central",
          "sendero_herbolario"
        ]
      ],
      "anclajes_documentados": [
        "tutorial de Herboristería (ANCLADA en bancal_central)",
        "M16 (responsable Jardines)"
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
  {
    "actorId": "chen_bo",
    "name": "Chen Bo",
    "role": "Instructor de Examen / Anatomía-Medicina",
    "architecture": "BT",
    "policyExport": "CHEN_BO_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/intermediate-policies.mjs",
      "sha256": "dc8dd1d62b7e7e6cf485d6dd22a8d76b5d696f92f80ca4a71a77cc809f06d6cb",
      "export": "CHEN_BO_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "MEDICAL",
    "canonical": {
      "id": "chen_bo",
      "nombre": "Chen Bo",
      "rol": "Instructor de Examen / Anatomía-Medicina",
      "categoria": "intermedio",
      "sala_inicial": "sala_anatomica",
      "movilidad": "RUTA",
      "territorio_normal": [
        "sala_anatomica",
        "corredor_medicina",
        "archivo_clinico"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "archivo_clinico",
        "corredor_medicina",
        "sala_anatomica"
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
      "anclajes_documentados": [
        "M02 (Examen Espiritual)",
        "M10",
        "M16 (co-responsable Medicina)"
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
    }
  },
  {
    "actorId": "yao_fen",
    "name": "Yao Fen",
    "role": "Instructora de Alquimia / Botica",
    "architecture": "BT",
    "policyExport": "YAO_FEN_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/intermediate-policies.mjs",
      "sha256": "dc8dd1d62b7e7e6cf485d6dd22a8d76b5d696f92f80ca4a71a77cc809f06d6cb",
      "export": "YAO_FEN_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "MEDICAL",
    "canonical": {
      "id": "yao_fen",
      "nombre": "Yao Fen",
      "rol": "Instructora de Alquimia / Botica",
      "categoria": "intermedio",
      "sala_inicial": "laboratorio_alquimia",
      "movilidad": "RUTA",
      "territorio_normal": [
        "laboratorio_alquimia",
        "botica",
        "deposito_reactivos"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "botica",
        "deposito_reactivos",
        "laboratorio_alquimia"
      ],
      "rutas": [
        [
          "laboratorio_alquimia",
          "botica"
        ],
        [
          "laboratorio_alquimia",
          "deposito_reactivos"
        ]
      ],
      "anclajes_documentados": [
        "desbloqueo de Alquimia (LII)",
        "M10",
        "M16 (co-responsable Medicina)"
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
    }
  },
  {
    "actorId": "gao_shun",
    "name": "Gao Shun",
    "role": "Guardia de la Puerta Roja",
    "architecture": "FSM",
    "policyExport": "GAO_SHUN_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/gao-shun-fsm.mjs",
      "sha256": "093b2a6faa7076d414f311a0b34ac5d202a56045a9c65ba750098bdf3aaaeb4c",
      "export": "GAO_SHUN_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "SECURITY",
    "canonical": {
      "id": "gao_shun",
      "nombre": "Gao Shun",
      "rol": "Guardia de la Puerta Roja",
      "categoria": "funcional",
      "sala_inicial": "casa_guardia",
      "movilidad": "RUTA",
      "territorio_normal": [
        "casa_guardia",
        "deposito_comun",
        "puerta",
        "registro"
      ],
      "transito_tecnico": [
        "tablon_encargos",
        "patio_servicios",
        "patio",
        "sala_jade"
      ],
      "posicion_valida": [
        "casa_guardia",
        "deposito_comun",
        "patio",
        "patio_servicios",
        "puerta",
        "registro",
        "sala_jade",
        "tablon_encargos"
      ],
      "rutas": [
        [
          "casa_guardia",
          "deposito_comun",
          "tablon_encargos",
          "patio_servicios",
          "patio",
          "sala_jade",
          "registro",
          "puerta"
        ]
      ],
      "anclajes_documentados": [
        "M01 (según escena, junto a Tao Ming)",
        "M04 (ANCLADO en puerta_roja/puerta)"
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
  {
    "actorId": "feng_zhi",
    "name": "Feng Zhi",
    "role": "Asistente de Disciplina",
    "architecture": "FSM",
    "policyExport": "FENG_ZHI_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "FENG_ZHI_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "INSTITUTION",
    "canonical": {
      "id": "feng_zhi",
      "nombre": "Feng Zhi",
      "rol": "Asistente de Disciplina",
      "categoria": "funcional",
      "sala_inicial": "pabellon_disciplina",
      "movilidad": "RUTA",
      "territorio_normal": [
        "pabellon_disciplina",
        "corredor_norte"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "corredor_norte",
        "pabellon_disciplina"
      ],
      "rutas": [
        [
          "pabellon_disciplina",
          "corredor_norte"
        ]
      ],
      "anclajes_documentados": [],
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
    }
  },
  {
    "actorId": "ma_qiren",
    "name": "Ma Qiren",
    "role": "Responsable de Almacenes",
    "architecture": "BT",
    "policyExport": "MA_QIREN_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "MA_QIREN_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "LOGISTICS",
    "canonical": {
      "id": "ma_qiren",
      "nombre": "Ma Qiren",
      "rol": "Responsable de Almacenes",
      "categoria": "funcional",
      "sala_inicial": "deposito_comun",
      "movilidad": "RUTA",
      "territorio_normal": [
        "deposito_comun",
        "oficina_servicios",
        "casa_guardia"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "casa_guardia",
        "deposito_comun",
        "oficina_servicios"
      ],
      "rutas": [
        [
          "deposito_comun",
          "oficina_servicios"
        ],
        [
          "deposito_comun",
          "casa_guardia"
        ]
      ],
      "anclajes_documentados": [
        "M02 (junto a Tao Ming, Chen Bo)"
      ],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "SOSPECHA",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    }
  },
  {
    "actorId": "pei_luo",
    "name": "Pei Luo",
    "role": "Responsable de Cocina/Comedor",
    "architecture": "FSM",
    "policyExport": "PEI_LUO_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/pei-luo-fsm.mjs",
      "sha256": "2c0b022b97828912a5153fbe740762ded89dac79b8e72346a87149bc4c87b682",
      "export": "PEI_LUO_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "LOGISTICS",
    "canonical": {
      "id": "pei_luo",
      "nombre": "Pei Luo",
      "rol": "Responsable de Cocina/Comedor",
      "categoria": "funcional",
      "sala_inicial": "cocina_comunal",
      "movilidad": "RUTA",
      "territorio_normal": [
        "cocina_comunal",
        "comedor_externos"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "cocina_comunal",
        "comedor_externos"
      ],
      "rutas": [
        [
          "cocina_comunal",
          "comedor_externos"
        ]
      ],
      "anclajes_documentados": [],
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
    }
  },
  {
    "actorId": "lu_cheng",
    "name": "Lu Cheng",
    "role": "Taller de armas / Reparaciones",
    "architecture": "FSM",
    "policyExport": "LU_CHENG_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "LU_CHENG_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "WORKSHOP",
    "canonical": {
      "id": "lu_cheng",
      "nombre": "Lu Cheng",
      "rol": "Taller de armas / Reparaciones",
      "categoria": "funcional",
      "sala_inicial": "taller_lu_cheng",
      "movilidad": "ANCLADO",
      "territorio_normal": [
        "taller_lu_cheng"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "taller_lu_cheng"
      ],
      "rutas": [],
      "anclajes_documentados": [],
      "conocimiento_inicial": {
        "R1": "DESCONOCIDO",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "SOSPECHA",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    }
  },
  {
    "actorId": "ning_cai",
    "name": "Ning Cai",
    "role": "Textiles y cuero",
    "architecture": "FSM",
    "policyExport": "NING_CAI_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "NING_CAI_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "WORKSHOP",
    "canonical": {
      "id": "ning_cai",
      "nombre": "Ning Cai",
      "rol": "Textiles y cuero",
      "categoria": "funcional",
      "sala_inicial": "taller_ning_cai",
      "movilidad": "ANCLADO",
      "territorio_normal": [
        "taller_ning_cai"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "taller_ning_cai"
      ],
      "rutas": [],
      "anclajes_documentados": [],
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
  {
    "actorId": "wen_tao",
    "name": "Wen Tao",
    "role": "Técnico de Formaciones",
    "architecture": "BT",
    "policyExport": "WEN_TAO_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "WEN_TAO_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "FORMATIONS",
    "canonical": {
      "id": "wen_tao",
      "nombre": "Wen Tao",
      "rol": "Técnico de Formaciones",
      "categoria": "funcional",
      "sala_inicial": "formaciones_taller_tecnico",
      "movilidad": "RUTA",
      "territorio_normal": [
        "formaciones_taller_tecnico",
        "formaciones_nivel_servicio",
        "formaciones_estacion_baja"
      ],
      "transito_tecnico": [
        "formaciones_galeria_sur",
        "formaciones_camara_central",
        "formaciones_sala_mapas",
        "formaciones_conducto_carga"
      ],
      "posicion_valida": [
        "formaciones_camara_central",
        "formaciones_conducto_carga",
        "formaciones_estacion_baja",
        "formaciones_galeria_sur",
        "formaciones_nivel_servicio",
        "formaciones_sala_mapas",
        "formaciones_taller_tecnico"
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
      "anclajes_documentados": [
        "M08 (junto a He Zhen)"
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
    }
  },
  {
    "actorId": "yu_shun",
    "name": "Yu Shun",
    "role": "Copista",
    "architecture": "FSM",
    "policyExport": "YU_SHUN_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "YU_SHUN_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "ARCHIVE",
    "canonical": {
      "id": "yu_shun",
      "nombre": "Yu Shun",
      "rol": "Copista",
      "categoria": "funcional",
      "sala_inicial": "archivos_escritorio_copistas",
      "movilidad": "RUTA",
      "territorio_normal": [
        "archivos_escritorio_copistas",
        "archivos_camara_copias",
        "archivos_mesa_restauracion"
      ],
      "transito_tecnico": [
        "archivos_deposito_comun",
        "archivos_galeria_registros",
        "archivos_control_restringido",
        "archivos_sala_indices"
      ],
      "posicion_valida": [
        "archivos_camara_copias",
        "archivos_control_restringido",
        "archivos_deposito_comun",
        "archivos_escritorio_copistas",
        "archivos_galeria_registros",
        "archivos_mesa_restauracion",
        "archivos_sala_indices"
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
      "anclajes_documentados": [
        "M09 (junto a Song Rui/Zhao)"
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
    }
  },
  {
    "actorId": "ma_gu",
    "name": "Ma Gu",
    "role": "Capataz de Cantera",
    "architecture": "FSM",
    "policyExport": "MA_GU_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "MA_GU_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "LOGISTICS",
    "canonical": {
      "id": "ma_gu",
      "nombre": "Ma Gu",
      "rol": "Capataz de Cantera",
      "categoria": "funcional",
      "sala_inicial": "oficina_capataz",
      "movilidad": "RUTA",
      "territorio_normal": [
        "oficina_capataz",
        "patio_canteros",
        "frente_abierto"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "frente_abierto",
        "oficina_capataz",
        "patio_canteros"
      ],
      "rutas": [
        [
          "oficina_capataz",
          "patio_canteros"
        ],
        [
          "oficina_capataz",
          "frente_abierto"
        ]
      ],
      "anclajes_documentados": [
        "M13 (contexto de consumos históricos)"
      ],
      "conocimiento_inicial": {
        "R1": "SOSPECHA",
        "R2": "DESCONOCIDO",
        "R3": "DESCONOCIDO",
        "R4": "DESCONOCIDO",
        "R5": "DESCONOCIDO",
        "R6": "SOSPECHA",
        "R7": "DESCONOCIDO",
        "R8": "DESCONOCIDO",
        "R9": "DESCONOCIDO",
        "R10": "DESCONOCIDO"
      }
    }
  },
  {
    "actorId": "ren_bo",
    "name": "Ren Bo",
    "role": "Patrullero veterano",
    "architecture": "BT",
    "policyExport": "REN_BO_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "REN_BO_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "SECURITY",
    "canonical": {
      "id": "ren_bo",
      "nombre": "Ren Bo",
      "rol": "Patrullero veterano",
      "categoria": "funcional",
      "sala_inicial": "patio_puesto_valle",
      "movilidad": "RUTA",
      "territorio_normal": [
        "patio_puesto_valle",
        "puesto_valle",
        "valle_explanada"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "patio_puesto_valle",
        "puesto_valle",
        "valle_explanada"
      ],
      "rutas": [
        [
          "patio_puesto_valle",
          "puesto_valle"
        ],
        [
          "puesto_valle",
          "valle_explanada"
        ]
      ],
      "anclajes_documentados": [],
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
  {
    "actorId": "xu_an",
    "name": "Xu An",
    "role": "Representante de Sauces",
    "architecture": "BT",
    "policyExport": "XU_AN_BT",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "XU_AN_BT",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "COMMUNITY",
    "canonical": {
      "id": "xu_an",
      "nombre": "Xu An",
      "rol": "Representante de Sauces",
      "categoria": "funcional",
      "sala_inicial": "sauces_casa_comunal",
      "movilidad": "RUTA",
      "territorio_normal": [
        "sauces_casa_comunal",
        "sauces_plaza"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "sauces_casa_comunal",
        "sauces_plaza"
      ],
      "rutas": [
        [
          "sauces_casa_comunal",
          "sauces_plaza"
        ]
      ],
      "anclajes_documentados": [
        "M05 (contexto de retorno a Sauces)",
        "M16 (responsable Sauces)"
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
    }
  },
  {
    "actorId": "mei_shufen",
    "name": "Mei Shufen",
    "role": "Herbolaria local de Sauces (tía de Mei Lian)",
    "architecture": "FSM",
    "policyExport": "MEI_SHUFEN_FSM",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/policies/functional-policies.mjs",
      "sha256": "a38311e611496c8f38b2749c591a6e3d3342772531e671e08ed0df01ccf0846f",
      "export": "MEI_SHUFEN_FSM",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "COMMUNITY",
    "canonical": {
      "id": "mei_shufen",
      "nombre": "Mei Shufen",
      "rol": "Herbolaria local de Sauces (tía de Mei Lian)",
      "categoria": "funcional",
      "sala_inicial": "sauces_herbolaria",
      "movilidad": "RUTA",
      "territorio_normal": [
        "sauces_herbolaria",
        "sauces_saucedal",
        "sauces_huertos"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "sauces_herbolaria",
        "sauces_huertos",
        "sauces_saucedal"
      ],
      "rutas": [
        [
          "sauces_herbolaria",
          "sauces_saucedal"
        ],
        [
          "sauces_saucedal",
          "sauces_huertos"
        ]
      ],
      "anclajes_documentados": [],
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
  {
    "actorId": "lin_yue",
    "name": "Lin Yue",
    "role": "Aspirante — enlace territorial / rutas",
    "architecture": "MEMORY_RELATIONS_UTILITY_GOAP_EXECUTION",
    "policyExport": "LIN_YUE_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/lin-yue-utility-profile.mjs",
      "sha256": "90fd36974cd6bdbd3e58053e2dde293764880169557cd16f70e15ca8796d68d1",
      "export": "LIN_YUE_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "SOCIAL_ROUTES",
    "canonical": {
      "id": "lin_yue",
      "nombre": "Lin Yue",
      "rol": "Aspirante — enlace territorial / rutas",
      "categoria": "companero",
      "sala_inicial": "patio_marcial",
      "movilidad": "RUTA",
      "territorio_normal": [
        "patio_marcial",
        "sala_formas",
        "patio_campana"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "patio_campana",
        "patio_marcial",
        "sala_formas"
      ],
      "rutas": [
        [
          "patio_marcial",
          "sala_formas"
        ],
        [
          "patio_marcial",
          "patio_campana"
        ]
      ],
      "anclajes_documentados": [
        "M01–M03 (LIN_01_PRIMERA_RUTA)",
        "M04 (LIN_02_DOS_RITMOS)",
        "M05–M07 (LIN_03_NO_LLEGAS_A_TODO)",
        "M16 (LIN_05_RUTAS_M16, autónoma)"
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
    }
  },
  {
    "actorId": "han_qiao",
    "name": "Han Qiao",
    "role": "Aspirante — recursos/contactos, logística",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "HAN_QIAO_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/han-qiao-utility-profile.mjs",
      "sha256": "0175cdb212747c1facddb409ee8d2511795f2f72a0f8c62291e8c2fe0527b01b",
      "export": "HAN_QIAO_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "LOGISTICS",
    "canonical": {
      "id": "han_qiao",
      "nombre": "Han Qiao",
      "rol": "Aspirante — recursos/contactos, logística",
      "categoria": "companero",
      "sala_inicial": "oficina_servicios",
      "movilidad": "RUTA",
      "territorio_normal": [
        "oficina_servicios",
        "patio_servicios",
        "deposito_comun"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "deposito_comun",
        "oficina_servicios",
        "patio_servicios"
      ],
      "rutas": [
        [
          "oficina_servicios",
          "patio_servicios"
        ],
        [
          "oficina_servicios",
          "deposito_comun"
        ]
      ],
      "anclajes_documentados": [
        "M01–M03 (HAN_01_TODO_PREPARADO)",
        "M05–M08 (HAN_02_PROCEDIMIENTO, HAN_03_EL_NOMBRE_FAMILIAR)",
        "M16 (HAN_05_RECURSOS_M16, autónoma)"
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
    }
  },
  {
    "actorId": "zhao_wen",
    "name": "Zhao Wen",
    "role": "Aspirante — piezas documentales / análisis",
    "architecture": "UTILITY_DIALOGUE",
    "policyExport": "ZHAO_WEN_DIALOGUE_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/zhao-wen-dialogue-profile.mjs",
      "sha256": "b5667f9efed3bc1422ffb995eb4429983c77ac5d4f7e6bf7e73a8bc7a9756fe6",
      "export": "ZHAO_WEN_DIALOGUE_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "ARCHIVE",
    "canonical": {
      "id": "zhao_wen",
      "nombre": "Zhao Wen",
      "rol": "Aspirante — piezas documentales / análisis",
      "categoria": "companero",
      "sala_inicial": "sala_comun_externos",
      "movilidad": "RUTA",
      "territorio_normal": [
        "sala_comun_externos",
        "patio_cabanas",
        "lavadero_externos"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "lavadero_externos",
        "patio_cabanas",
        "sala_comun_externos"
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
      "anclajes_documentados": [
        "M02–M04 (ZHAO_01_NOTAS_EN_EL_MARGEN)",
        "M06 (ZHAO_02_NO_ES_PRUEBA)",
        "M09 (ZHAO_03_ARCHIVO_CERRADO, ARCHIVO_RESTRINGIDO concedido por Qiao Ren)",
        "M09–M11 (ZHAO_04_ZHAO_LUO)",
        "M16 (ZHAO_05_DECIDIR_INCOMPLETO)"
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
    }
  },
  {
    "actorId": "mei_lian",
    "name": "Mei Lian",
    "role": "Aspirante — saber médico/local, puente Secta-Sauces",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "MEI_LIAN_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/mei-lian-utility-profile.mjs",
      "sha256": "3b8bfadb1cfe6e661fcbcd67b2ddedfc1f3bddff30d98f9e31ce76d751c3fb06",
      "export": "MEI_LIAN_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "MEDICAL_COMMUNITY",
    "canonical": {
      "id": "mei_lian",
      "nombre": "Mei Lian",
      "rol": "Aspirante — saber médico/local, puente Secta-Sauces",
      "categoria": "companero",
      "sala_inicial": "patio",
      "movilidad": "RUTA",
      "territorio_normal": [
        "patio",
        "patio_cabanas",
        "patio_servicios"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "patio",
        "patio_cabanas",
        "patio_servicios"
      ],
      "rutas": [
        [
          "patio",
          "patio_cabanas"
        ],
        [
          "patio",
          "patio_servicios"
        ]
      ],
      "anclajes_documentados": [
        "M02–M03 (MEI_01_LO_QUE_YA_SABIA)",
        "M05 (MEI_02_NOMBRE_FORMAL, MEI_03_REGRESO_SAUCES)",
        "M10 (MEI_04_DOS_CASAS)",
        "M16 (MEI_05_SAUCES_M16, autónoma)"
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
  {
    "actorId": "guo_chen",
    "name": "Guo Chen",
    "role": "Aspirante — trabajo material/persistencia, posible candidato a Segunda Rama",
    "architecture": "UTILITY_GOAP_EXECUTION",
    "policyExport": "GUO_CHEN_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/guo-chen-utility-profile.mjs",
      "sha256": "4cf48ac95058ced85df29f2c466593be65e590964002ee88eba3a68329f1c9c1",
      "export": "GUO_CHEN_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "SOCIAL",
    "canonical": {
      "id": "guo_chen",
      "nombre": "Guo Chen",
      "rol": "Aspirante — trabajo material/persistencia, posible candidato a Segunda Rama",
      "categoria": "companero",
      "sala_inicial": "patio",
      "movilidad": "RUTA",
      "territorio_normal": [
        "patio",
        "patio_marcial",
        "patio_campana"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "patio",
        "patio_campana",
        "patio_marcial"
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
      "anclajes_documentados": [
        "M01–M03 (GUO_01_OTRO_TURNO)",
        "M10 (GUO_03_SEGUNDA_RAMA, GUO_04_NO_DECIDAS_POR_MI, junto a Luo)",
        "M16 (GUO_05_RECURSOS_M16)"
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
    }
  },
  {
    "actorId": "luo_yan",
    "name": "Luo Yan",
    "role": "Aspirante — protocolo/historia oficial, lealtad institucional",
    "architecture": "UTILITY_DIALOGUE",
    "policyExport": "LUO_YAN_UTILITY_PROFILE",
    "policySource": {
      "commit": "adc086ba5aca8d2a98c63f2df742ac019a498fea",
      "path": "experimentos/npc/canonical-behavior-lab-v0.1/profiles/luo-yan-utility-profile.mjs",
      "sha256": "117cb1a75fdbf7f878a51f788dbb81709a4b935dddd40f2a33d50269574fee12",
      "export": "LUO_YAN_UTILITY_PROFILE",
      "classification": "TESTED_INTEGRATION_POLICY_NOT_NARRATIVE_PERSONALITY"
    },
    "domainId": "SOCIAL_INSTITUTION",
    "canonical": {
      "id": "luo_yan",
      "nombre": "Luo Yan",
      "rol": "Aspirante — protocolo/historia oficial, lealtad institucional",
      "categoria": "companero",
      "sala_inicial": "registro",
      "movilidad": "RUTA",
      "territorio_normal": [
        "registro",
        "puerta",
        "sala_jade"
      ],
      "transito_tecnico": [],
      "posicion_valida": [
        "puerta",
        "registro",
        "sala_jade"
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
      "anclajes_documentados": [
        "M01–M03 (LUO_01_ASI_SE_HACE)",
        "M06 (LUO_02_POR_ALGO_EXISTE)",
        "M09 (LUO_03_ZHAO_ARCHIVOS)",
        "M10 (LUO_04_GUO_SEGUNDA_RAMA)",
        "M16 (LUO_05_FORMACIONES_M16)"
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
    }
  }
]);
const byId=new Map(rows.map(row=>[row.actorId,row]));
const policies=new Map([
 ["ji_xueying", freeze(copy(JI_XUEYING_FSM))],
 ["qiao_ren", freeze(copy(QIAO_REN_UTILITY_PROFILE))],
 ["wei_jian", freeze(copy(WEI_JIAN_BT))],
 ["song_rui", freeze(copy(SONG_RUI_UTILITY_PROFILE))],
 ["lan_meihua", freeze(copy(LAN_MEIHUA_UTILITY_PROFILE))],
 ["duan_shibo", freeze(copy(DUAN_SHIBO_UTILITY_PROFILE))],
 ["he_zhen", freeze(copy(HE_ZHEN_UTILITY_PROFILE))],
 ["shen_baojun", freeze(copy(SHEN_BAOJUN_FSM))],
 ["madre_wen", freeze(copy(MADRE_WEN_FSM))],
 ["tao_ming", freeze(copy(TAO_MING_FSM))],
 ["jiang_rui", freeze(copy(JIANG_RUI_FSM))],
 ["su_lian", freeze(copy(SU_LIAN_BT))],
 ["chen_bo", freeze(copy(CHEN_BO_BT))],
 ["yao_fen", freeze(copy(YAO_FEN_BT))],
 ["gao_shun", freeze(copy(GAO_SHUN_FSM))],
 ["feng_zhi", freeze(copy(FENG_ZHI_FSM))],
 ["ma_qiren", freeze(copy(MA_QIREN_BT))],
 ["pei_luo", freeze(copy(PEI_LUO_FSM))],
 ["lu_cheng", freeze(copy(LU_CHENG_FSM))],
 ["ning_cai", freeze(copy(NING_CAI_FSM))],
 ["wen_tao", freeze(copy(WEN_TAO_BT))],
 ["yu_shun", freeze(copy(YU_SHUN_FSM))],
 ["ma_gu", freeze(copy(MA_GU_FSM))],
 ["ren_bo", freeze(copy(REN_BO_BT))],
 ["xu_an", freeze(copy(XU_AN_BT))],
 ["mei_shufen", freeze(copy(MEI_SHUFEN_FSM))],
 ["lin_yue", freeze(copy(LIN_YUE_UTILITY_PROFILE))],
 ["han_qiao", freeze(copy(HAN_QIAO_UTILITY_PROFILE))],
 ["zhao_wen", freeze(copy(ZHAO_WEN_DIALOGUE_PROFILE))],
 ["mei_lian", freeze(copy(MEI_LIAN_UTILITY_PROFILE))],
 ["guo_chen", freeze(copy(GUO_CHEN_UTILITY_PROFILE))],
 ["luo_yan", freeze(copy(LUO_YAN_UTILITY_PROFILE))],
]);
function registrations(){ return rows; }
function registration(id){ const r=byId.get(id); if(!r)fail('A07_UNKNOWN_ACTOR'); return r; }
function policyFor(id){ registration(id); return policies.get(id); }

export { policyFor, registration, registrations };
