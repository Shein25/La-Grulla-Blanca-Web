import { freeze } from '../a07/safe-data.js';

// Compiled only from ratified R1 voice authority and R2 authored whole molds.
const VOICE_AUTHORITY_R2=freeze({
  "parent": "0475699ece89e4931a452e56d1c78a1bea708af0",
  "revisionParent": "5a7712fed3624a88947330cc481620ff7f8707ff",
  "sources": [
    {
      "file": "docs/integracion/astra/a07.5a/MATRIZ_VOZ_NPC_32.json",
      "sha256": "29cbb3704f8ba3a50712115e64238ee095489f2334f11c515d45708dd58d937b"
    },
    {
      "file": "docs/integracion/astra/a07.5a/CONTRATO_VOZ_VERIFICADA.md",
      "sha256": "f18e0ef687dbde3310812ceceb97fe47b056598728a0d44140647410ce30bca3"
    },
    {
      "file": "docs/integracion/astra/a07.5a/TRAZABILIDAD_RATIFICACION_R1.json",
      "sha256": "836c7b6a563f5a1153bab741122087c0e91c28e97fc79e5d48531d13b467a65e"
    },
    {
      "file": "docs/integracion/astra/a07.5a/EVIDENCIA_VOZ_NPC.json",
      "sha256": "f10c2b4efbf16485fdc99bfdfa5f4329e539b0590c646198a31938365bd34d2f"
    }
  ],
  "authorizationSha256": "98ed5078bd750e2bdcf93ea0094999b7e642abecc64c4596b71834fb2e3fa33f",
  "freeAiText": false,
  "authoring": "R2 whole natural utterance molds. No generic metaconversational scaffolds; no automatic human acceptance."
});
const VOICES_R2=freeze([
  {
    "actorId": "ji_xueying",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA/ALTA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "ji_xueying:ratifiedVoiceGuide:R1:1",
      "ji_xueying:ratifiedVoiceGuide:R1:2",
      "ji_xueying:ratifiedVoiceGuide:R1:3",
      "ji_xueying:ratifiedVoiceGuide:R1:4",
      "ji_xueying:ratifiedVoiceGuide:R1:5",
      "ji_xueying:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "ECHO",
        "uncertainty": "PLAIN",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "BRIEF",
        "two": "FORMAL",
        "refusal": "RESERVED"
      },
      {
        "single": "BRIEF",
        "uncertainty": "FORMAL",
        "two": "DISTINGUISH",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "qiao_ren",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA/ALTA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "qiao_ren:ratifiedVoiceGuide:R1:1",
      "qiao_ren:ratifiedVoiceGuide:R1:2",
      "qiao_ren:ratifiedVoiceGuide:R1:3",
      "qiao_ren:ratifiedVoiceGuide:R1:4",
      "qiao_ren:ratifiedVoiceGuide:R1:5",
      "qiao_ren:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "DISTINGUISH",
        "refusal": "FORMAL"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "wei_jian",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "wei_jian:ratifiedVoiceGuide:R1:1",
      "wei_jian:ratifiedVoiceGuide:R1:2",
      "wei_jian:ratifiedVoiceGuide:R1:3",
      "wei_jian:ratifiedVoiceGuide:R1:4",
      "wei_jian:ratifiedVoiceGuide:R1:5",
      "wei_jian:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "CLIPPED",
        "uncertainty": "CLIPPED",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "PREDICATE",
        "refusal": "SHORT"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      }
    ]
  },
  {
    "actorId": "song_rui",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA/ALTA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "song_rui:ratifiedVoiceGuide:R1:1",
      "song_rui:ratifiedVoiceGuide:R1:2",
      "song_rui:ratifiedVoiceGuide:R1:3",
      "song_rui:ratifiedVoiceGuide:R1:4",
      "song_rui:ratifiedVoiceGuide:R1:5",
      "song_rui:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "BRIEF",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "BRIEF",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "lan_meihua",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA/ALTA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "lan_meihua:ratifiedVoiceGuide:R1:1",
      "lan_meihua:ratifiedVoiceGuide:R1:2",
      "lan_meihua:ratifiedVoiceGuide:R1:3",
      "lan_meihua:ratifiedVoiceGuide:R1:4",
      "lan_meihua:ratifiedVoiceGuide:R1:5",
      "lan_meihua:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "PLAIN"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PREDICATE",
        "two": "PREDICATE",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "duan_shibo",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "duan_shibo:ratifiedVoiceGuide:R1:1",
      "duan_shibo:ratifiedVoiceGuide:R1:2",
      "duan_shibo:ratifiedVoiceGuide:R1:3",
      "duan_shibo:ratifiedVoiceGuide:R1:4",
      "duan_shibo:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "EVERYDAY"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "PLAIN"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "EVERYDAY"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "PLAIN"
      }
    ]
  },
  {
    "actorId": "he_zhen",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "he_zhen:ratifiedVoiceGuide:R1:1",
      "he_zhen:ratifiedVoiceGuide:R1:2",
      "he_zhen:ratifiedVoiceGuide:R1:3",
      "he_zhen:ratifiedVoiceGuide:R1:4",
      "he_zhen:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "FORMAL",
        "two": "PREDICATE",
        "refusal": "PLAIN"
      },
      {
        "single": "FORMAL",
        "uncertainty": "BRIEF",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "shen_baojun",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "shen_baojun:ratifiedVoiceGuide:R1:1",
      "shen_baojun:ratifiedVoiceGuide:R1:2",
      "shen_baojun:ratifiedVoiceGuide:R1:3",
      "shen_baojun:ratifiedVoiceGuide:R1:4",
      "shen_baojun:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "PLAIN"
      },
      {
        "single": "ORAL",
        "uncertainty": "BRIEF",
        "two": "DISTINGUISH",
        "refusal": "PLAIN"
      },
      {
        "single": "ECHO",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "RESERVED"
      },
      {
        "single": "PLAIN",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "madre_wen",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "madre_wen:ratifiedVoiceGuide:R1:1",
      "madre_wen:ratifiedVoiceGuide:R1:2",
      "madre_wen:ratifiedVoiceGuide:R1:3",
      "madre_wen:ratifiedVoiceGuide:R1:4",
      "madre_wen:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "EVERYDAY"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "ORAL",
        "refusal": "EVERYDAY"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "PLAIN",
        "refusal": "PLAIN"
      }
    ]
  },
  {
    "actorId": "tao_ming",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "tao_ming:ratifiedVoiceGuide:R1:1",
      "tao_ming:ratifiedVoiceGuide:R1:2",
      "tao_ming:ratifiedVoiceGuide:R1:3",
      "tao_ming:ratifiedVoiceGuide:R1:4",
      "tao_ming:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PREDICATE",
        "two": "BRIEF",
        "refusal": "PLAIN"
      },
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "jiang_rui",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "jiang_rui:ratifiedVoiceGuide:R1:1",
      "jiang_rui:ratifiedVoiceGuide:R1:2",
      "jiang_rui:ratifiedVoiceGuide:R1:3",
      "jiang_rui:ratifiedVoiceGuide:R1:4",
      "jiang_rui:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "PREDICATE",
        "refusal": "SHORT"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PREDICATE",
        "two": "BRIEF",
        "refusal": "PLAIN"
      },
      {
        "single": "CLIPPED",
        "uncertainty": "CLIPPED",
        "two": "ORAL",
        "refusal": "SHORT"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "BRIEF",
        "refusal": "SHORT"
      }
    ]
  },
  {
    "actorId": "su_lian",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "su_lian:ratifiedVoiceGuide:R1:1",
      "su_lian:ratifiedVoiceGuide:R1:2",
      "su_lian:ratifiedVoiceGuide:R1:3",
      "su_lian:ratifiedVoiceGuide:R1:4",
      "su_lian:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "ECHO",
        "uncertainty": "BRIEF",
        "two": "PLAIN",
        "refusal": "PLAIN"
      },
      {
        "single": "BRIEF",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "RESERVED"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "DISTINGUISH",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "chen_bo",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "chen_bo:ratifiedVoiceGuide:R1:1",
      "chen_bo:ratifiedVoiceGuide:R1:2",
      "chen_bo:ratifiedVoiceGuide:R1:3",
      "chen_bo:ratifiedVoiceGuide:R1:4",
      "chen_bo:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "FORMAL",
        "uncertainty": "BRIEF",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "PLAIN",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "PLAIN"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "yao_fen",
    "revision": "A075A-R1@0475699",
    "depth": "MEDIA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "yao_fen:ratifiedVoiceGuide:R1:1",
      "yao_fen:ratifiedVoiceGuide:R1:2",
      "yao_fen:ratifiedVoiceGuide:R1:3",
      "yao_fen:ratifiedVoiceGuide:R1:4",
      "yao_fen:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "FORMAL",
        "uncertainty": "BRIEF",
        "two": "PREDICATE",
        "refusal": "PLAIN"
      },
      {
        "single": "PLAIN",
        "uncertainty": "FORMAL",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "gao_shun",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "gao_shun:ratifiedVoiceGuide:R1:1",
      "gao_shun:ratifiedVoiceGuide:R1:2",
      "gao_shun:ratifiedVoiceGuide:R1:3",
      "gao_shun:ratifiedVoiceGuide:R1:4"
    ],
    "rules": [
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "SHORT"
      },
      {
        "single": "CLIPPED",
        "uncertainty": "CLIPPED",
        "two": "BRIEF",
        "refusal": "PLAIN"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      }
    ]
  },
  {
    "actorId": "feng_zhi",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY_MINIMAL",
    "evidenceIds": [
      "feng_zhi:ratifiedVoiceGuide:R1:1",
      "feng_zhi:ratifiedVoiceGuide:R1:2",
      "feng_zhi:ratifiedVoiceGuide:R1:3",
      "feng_zhi:ratifiedVoiceGuide:R1:4",
      "feng_zhi:ratifiedVoiceGuide:R1:5",
      "feng_zhi:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "ECHO",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "PLAIN"
      },
      {
        "single": "PLAIN",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "RESERVED"
      },
      {
        "single": "BRIEF",
        "uncertainty": "PLAIN",
        "two": "DISTINGUISH",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "FORMAL",
        "two": "PLAIN",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "ma_qiren",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY_MINIMAL",
    "evidenceIds": [
      "ma_qiren:ratifiedVoiceGuide:R1:1",
      "ma_qiren:ratifiedVoiceGuide:R1:2",
      "ma_qiren:ratifiedVoiceGuide:R1:3",
      "ma_qiren:ratifiedVoiceGuide:R1:4",
      "ma_qiren:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "RESERVED"
      },
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "DISTINGUISH",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "BRIEF",
        "two": "FORMAL",
        "refusal": "RESERVED"
      },
      {
        "single": "BRIEF",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "pei_luo",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY_MINIMAL",
    "evidenceIds": [
      "pei_luo:ratifiedVoiceGuide:R1:1",
      "pei_luo:ratifiedVoiceGuide:R1:2",
      "pei_luo:ratifiedVoiceGuide:R1:3",
      "pei_luo:ratifiedVoiceGuide:R1:4",
      "pei_luo:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "EVERYDAY"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "ORAL",
        "refusal": "PLAIN"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "BRIEF",
        "refusal": "EVERYDAY"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "PLAIN",
        "refusal": "PLAIN"
      }
    ]
  },
  {
    "actorId": "lu_cheng",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "lu_cheng:ratifiedVoiceGuide:R1:1",
      "lu_cheng:ratifiedVoiceGuide:R1:2",
      "lu_cheng:ratifiedVoiceGuide:R1:3",
      "lu_cheng:ratifiedVoiceGuide:R1:4",
      "lu_cheng:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "CLIPPED",
        "uncertainty": "CLIPPED",
        "two": "PREDICATE",
        "refusal": "PLAIN"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PREDICATE",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "SHORT"
      }
    ]
  },
  {
    "actorId": "ning_cai",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY_MINIMAL",
    "evidenceIds": [
      "ning_cai:ratifiedVoiceGuide:R1:1",
      "ning_cai:ratifiedVoiceGuide:R1:2",
      "ning_cai:ratifiedVoiceGuide:R1:3",
      "ning_cai:ratifiedVoiceGuide:R1:4",
      "ning_cai:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "RESERVED"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "FORMAL",
        "refusal": "PLAIN"
      },
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "BRIEF",
        "refusal": "RESERVED"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "wen_tao",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "wen_tao:ratifiedVoiceGuide:R1:1",
      "wen_tao:ratifiedVoiceGuide:R1:2",
      "wen_tao:ratifiedVoiceGuide:R1:3",
      "wen_tao:ratifiedVoiceGuide:R1:4",
      "wen_tao:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "PLAIN"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PREDICATE",
        "two": "PREDICATE",
        "refusal": "EVERYDAY"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "PLAIN"
      }
    ]
  },
  {
    "actorId": "yu_shun",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "yu_shun:ratifiedVoiceGuide:R1:1",
      "yu_shun:ratifiedVoiceGuide:R1:2",
      "yu_shun:ratifiedVoiceGuide:R1:3",
      "yu_shun:ratifiedVoiceGuide:R1:4"
    ],
    "rules": [
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "RESERVED"
      },
      {
        "single": "FORMAL",
        "uncertainty": "BRIEF",
        "two": "DISTINGUISH",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "ma_gu",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "ma_gu:ratifiedVoiceGuide:R1:1",
      "ma_gu:ratifiedVoiceGuide:R1:2",
      "ma_gu:ratifiedVoiceGuide:R1:3",
      "ma_gu:ratifiedVoiceGuide:R1:4"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "PLAIN"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "PREDICATE",
        "refusal": "EVERYDAY"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "PREDICATE",
        "two": "PLAIN",
        "refusal": "SHORT"
      }
    ]
  },
  {
    "actorId": "ren_bo",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY_MINIMAL",
    "evidenceIds": [
      "ren_bo:ratifiedVoiceGuide:R1:1",
      "ren_bo:ratifiedVoiceGuide:R1:2",
      "ren_bo:ratifiedVoiceGuide:R1:3",
      "ren_bo:ratifiedVoiceGuide:R1:4",
      "ren_bo:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "CLIPPED",
        "uncertainty": "CLIPPED",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "PREDICATE",
        "refusal": "SHORT"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "CLIPPED",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "PLAIN"
      }
    ]
  },
  {
    "actorId": "xu_an",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "xu_an:ratifiedVoiceGuide:R1:1",
      "xu_an:ratifiedVoiceGuide:R1:2",
      "xu_an:ratifiedVoiceGuide:R1:3",
      "xu_an:ratifiedVoiceGuide:R1:4"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "PLAIN"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "RESERVED"
      },
      {
        "single": "PLAIN",
        "uncertainty": "BRIEF",
        "two": "FORMAL",
        "refusal": "PLAIN"
      },
      {
        "single": "BRIEF",
        "uncertainty": "FORMAL",
        "two": "BRIEF",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "mei_shufen",
    "revision": "A075A-R1@0475699",
    "depth": "FUNCIONAL_DISTINTIVA / MEDIA LOCAL",
    "readiness": "VOICE_READY_MINIMAL",
    "evidenceIds": [
      "mei_shufen:ratifiedVoiceGuide:R1:1",
      "mei_shufen:ratifiedVoiceGuide:R1:2",
      "mei_shufen:ratifiedVoiceGuide:R1:3",
      "mei_shufen:ratifiedVoiceGuide:R1:4",
      "mei_shufen:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "EVERYDAY"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "PLAIN",
        "refusal": "PLAIN"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "BRIEF",
        "refusal": "EVERYDAY"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "SHORT"
      }
    ]
  },
  {
    "actorId": "lin_yue",
    "revision": "A075A-R1@0475699",
    "depth": "PROFUNDA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "lin_yue:ratifiedVoiceGuide:R1:1",
      "lin_yue:ratifiedVoiceGuide:R1:2",
      "lin_yue:ratifiedVoiceGuide:R1:3",
      "lin_yue:ratifiedVoiceGuide:R1:4",
      "lin_yue:ratifiedVoiceGuide:R1:5",
      "lin_yue:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "PLAIN"
      },
      {
        "single": "CLIPPED",
        "uncertainty": "CLIPPED",
        "two": "PREDICATE",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "BRIEF",
        "refusal": "PLAIN"
      }
    ]
  },
  {
    "actorId": "han_qiao",
    "revision": "A075A-R1@0475699",
    "depth": "PROFUNDA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "han_qiao:ratifiedVoiceGuide:R1:1",
      "han_qiao:ratifiedVoiceGuide:R1:2",
      "han_qiao:ratifiedVoiceGuide:R1:3",
      "han_qiao:ratifiedVoiceGuide:R1:4",
      "han_qiao:ratifiedVoiceGuide:R1:5",
      "han_qiao:ratifiedVoiceGuide:R1:6"
    ],
    "rules": [
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "PLAIN"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "BRIEF",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      }
    ]
  },
  {
    "actorId": "zhao_wen",
    "revision": "A075A-R1@0475699",
    "depth": "PROFUNDA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "zhao_wen:ratifiedVoiceGuide:R1:1",
      "zhao_wen:ratifiedVoiceGuide:R1:2",
      "zhao_wen:ratifiedVoiceGuide:R1:3",
      "zhao_wen:ratifiedVoiceGuide:R1:4",
      "zhao_wen:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "PLAIN",
        "uncertainty": "BRIEF",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "FORMAL",
        "uncertainty": "PLAIN",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "FORMAL",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "BRIEF",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "FORMAL"
      }
    ]
  },
  {
    "actorId": "mei_lian",
    "revision": "A075A-R1@0475699",
    "depth": "PROFUNDA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "mei_lian:ratifiedVoiceGuide:R1:1",
      "mei_lian:ratifiedVoiceGuide:R1:2",
      "mei_lian:ratifiedVoiceGuide:R1:3",
      "mei_lian:ratifiedVoiceGuide:R1:4",
      "mei_lian:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "PLAIN"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "BRIEF",
        "refusal": "SHORT"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "EVERYDAY"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "PLAIN"
      }
    ]
  },
  {
    "actorId": "guo_chen",
    "revision": "A075A-R1@0475699",
    "depth": "PROFUNDA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "guo_chen:ratifiedVoiceGuide:R1:1",
      "guo_chen:ratifiedVoiceGuide:R1:2",
      "guo_chen:ratifiedVoiceGuide:R1:3",
      "guo_chen:ratifiedVoiceGuide:R1:4",
      "guo_chen:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "ORAL",
        "refusal": "EVERYDAY"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "PLAIN",
        "refusal": "SHORT"
      },
      {
        "single": "BRIEF",
        "uncertainty": "BRIEF",
        "two": "ORAL",
        "refusal": "PLAIN"
      },
      {
        "single": "ORAL",
        "uncertainty": "ORAL",
        "two": "BRIEF",
        "refusal": "EVERYDAY"
      }
    ]
  },
  {
    "actorId": "luo_yan",
    "revision": "A075A-R1@0475699",
    "depth": "PROFUNDA",
    "readiness": "VOICE_READY",
    "evidenceIds": [
      "luo_yan:ratifiedVoiceGuide:R1:1",
      "luo_yan:ratifiedVoiceGuide:R1:2",
      "luo_yan:ratifiedVoiceGuide:R1:3",
      "luo_yan:ratifiedVoiceGuide:R1:4",
      "luo_yan:ratifiedVoiceGuide:R1:5"
    ],
    "rules": [
      {
        "single": "FORMAL",
        "uncertainty": "FORMAL",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PLAIN",
        "uncertainty": "PLAIN",
        "two": "DISTINGUISH",
        "refusal": "RESERVED"
      },
      {
        "single": "FORMAL",
        "uncertainty": "BRIEF",
        "two": "FORMAL",
        "refusal": "FORMAL"
      },
      {
        "single": "PREDICATE",
        "uncertainty": "FORMAL",
        "two": "PLAIN",
        "refusal": "PLAIN"
      }
    ]
  }
]);

export { VOICES_R2, VOICE_AUTHORITY_R2 };
