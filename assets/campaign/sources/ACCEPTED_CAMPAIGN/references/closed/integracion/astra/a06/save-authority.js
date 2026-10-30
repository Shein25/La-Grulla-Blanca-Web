import { freeze } from './safe-data.js';

/** Generated from approved matrices; no production agenda/population seeds. */
const SAVE_AUTHORITY = freeze({
  "sources": [
    {
      "path": "docs/integracion/astra/MATRIZ_NPC_FINAL.json",
      "sha256": "1495c412a433a5b8509878381295083e50f6c1800513653255c13570f854f60b"
    },
    {
      "path": "docs/integracion/astra/MATRIZ_MONSTRUOS_FINAL.json",
      "sha256": "4617a2b91996f74b3ded8e8e55ee1d141ded5af9ec64031ccd0a774d00adef98"
    },
    {
      "path": "docs/integracion/astra/MATRIZ_REQUISITOS_ARC1.json",
      "sha256": "3a32e0e069decaad9a28f1c71cca5e16169021bb6a33d633bfd992d6a62efab6"
    }
  ],
  "npc": {
    "ji_xueying": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "qiao_ren": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    "wei_jian": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    },
    "song_rui": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    "lan_meihua": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    "duan_shibo": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    },
    "he_zhen": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    "shen_baojun": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "madre_wen": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    "tao_ming": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "su_lian": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    },
    "chen_bo": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    "yao_fen": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    "gao_shun": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "feng_zhi": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    "ma_qiren": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    },
    "pei_luo": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    "lu_cheng": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "ning_cai": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "wen_tao": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    "yu_shun": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    "ma_gu": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "ren_bo": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    },
    "xu_an": {
      "architecture": "BT",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn"
      ],
      "initialKnowledge": {
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
    "mei_shufen": {
      "architecture": "FSM",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "fsmState"
      ],
      "initialKnowledge": {
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
    },
    "lin_yue": {
      "architecture": "MEMORY_RELATIONS_UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns",
        "boundedEpisodicMemory",
        "baseRelations"
      ],
      "initialKnowledge": {
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
    "han_qiao": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    "zhao_wen": {
      "architecture": "UTILITY_DIALOGUE",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    "mei_lian": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    },
    "guo_chen": {
      "architecture": "UTILITY_GOAP_EXECUTION",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
    "luo_yan": {
      "architecture": "UTILITY_DIALOGUE",
      "fields": [
        "currentActivity",
        "agendaId",
        "overrideIds",
        "lastSimulatedTurn",
        "lastAction",
        "consecutiveTurns"
      ],
      "initialKnowledge": {
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
  "species": {
    "rata_qi": {
      "nativeStage": 1,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 1
        },
        {
          "playerStage": 2,
          "tier": 2
        },
        {
          "playerStage": 3,
          "tier": 3
        },
        {
          "playerStage": 4,
          "tier": 4
        }
      ]
    },
    "serpiente_qi": {
      "nativeStage": 1,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 1
        },
        {
          "playerStage": 2,
          "tier": 2
        },
        {
          "playerStage": 3,
          "tier": 3
        },
        {
          "playerStage": 4,
          "tier": 4
        }
      ]
    },
    "lobo_espiritual": {
      "nativeStage": 1,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 1
        },
        {
          "playerStage": 2,
          "tier": 2
        },
        {
          "playerStage": 3,
          "tier": 3
        },
        {
          "playerStage": 4,
          "tier": 4
        }
      ]
    },
    "eco_caido": {
      "nativeStage": 2,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 1
        },
        {
          "playerStage": 3,
          "tier": 2
        },
        {
          "playerStage": 4,
          "tier": 3
        }
      ]
    },
    "pez_lunar": {
      "nativeStage": 3,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 1
        },
        {
          "playerStage": 4,
          "tier": 2
        }
      ]
    },
    "sombra_ahogada": {
      "nativeStage": 3,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 1
        },
        {
          "playerStage": 4,
          "tier": 2
        }
      ]
    },
    "centinela_pluma": {
      "nativeStage": 4,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 0
        },
        {
          "playerStage": 4,
          "tier": 1
        }
      ]
    },
    "devorador_niebla": {
      "nativeStage": 4,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 0
        },
        {
          "playerStage": 4,
          "tier": 1
        }
      ]
    },
    "avispa_jade": {
      "nativeStage": 1,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 1
        },
        {
          "playerStage": 2,
          "tier": 2
        },
        {
          "playerStage": 3,
          "tier": 3
        },
        {
          "playerStage": 4,
          "tier": 4
        }
      ]
    },
    "mono_pildoras": {
      "nativeStage": 1,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 1
        },
        {
          "playerStage": 2,
          "tier": 2
        },
        {
          "playerStage": 3,
          "tier": 3
        },
        {
          "playerStage": 4,
          "tier": 4
        }
      ]
    },
    "sapo_ceniza": {
      "nativeStage": 2,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 1
        },
        {
          "playerStage": 3,
          "tier": 2
        },
        {
          "playerStage": 4,
          "tier": 3
        }
      ]
    },
    "sapo_caldera": {
      "nativeStage": 2,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 1
        },
        {
          "playerStage": 3,
          "tier": 2
        },
        {
          "playerStage": 4,
          "tier": 3
        }
      ]
    },
    "escarabajo_hierro": {
      "nativeStage": 2,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 1
        },
        {
          "playerStage": 3,
          "tier": 2
        },
        {
          "playerStage": 4,
          "tier": 3
        }
      ]
    },
    "rey_escarabajo": {
      "nativeStage": 2,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 1
        },
        {
          "playerStage": 3,
          "tier": 2
        },
        {
          "playerStage": 4,
          "tier": 3
        }
      ]
    },
    "anguila_estelar": {
      "nativeStage": 3,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 1
        },
        {
          "playerStage": 4,
          "tier": 2
        }
      ]
    },
    "guardian_coral": {
      "nativeStage": 3,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 1
        },
        {
          "playerStage": 4,
          "tier": 2
        }
      ]
    },
    "halcon_tormenta": {
      "nativeStage": 4,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 0
        },
        {
          "playerStage": 4,
          "tier": 1
        }
      ]
    },
    "mantis_nube": {
      "nativeStage": 4,
      "categories": [
        "DEFENSA_ABSORCION",
        "RECUPERACION"
      ],
      "ceilings": [
        {
          "playerStage": 1,
          "tier": 0
        },
        {
          "playerStage": 2,
          "tier": 0
        },
        {
          "playerStage": 3,
          "tier": 0
        },
        {
          "playerStage": 4,
          "tier": 1
        }
      ]
    }
  }
});

export { SAVE_AUTHORITY };
