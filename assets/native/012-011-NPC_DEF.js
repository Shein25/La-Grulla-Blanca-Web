const NPC_DEF = {
  "ji_xueying": {
    "id": "ji_xueying",
    "nombre": "Ji Xueying",
    "categoria": "autoridad",
    "rol": "Maestra de Secta",
    "sala_inicial": "interior_sala_consejo",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
    "movilidad": "ANCLADO",
    "territorio_normal": [
      "interior_sala_consejo"
    ],
    "transito_tecnico": [],
    "posicion_valida": [
      "interior_sala_consejo"
    ],
    "rutas": [],
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Desglosado de LI-LIII, mismo texto fuente] Prácticamente fija en Consejo/Cumbre; no debe aparecer paseando por la secta (T244: 'excepción deliberada').",
      "LII": "[Desglosado de LI-LIII, mismo texto fuente] Prácticamente fija en Consejo/Cumbre; no debe aparecer paseando por la secta (T244: 'excepción deliberada').",
      "LIII": "[Desglosado de LI-LIII, mismo texto fuente] Prácticamente fija en Consejo/Cumbre; no debe aparecer paseando por la secta (T244: 'excepción deliberada').",
      "M16": "No listada como responsable de ningún frente de T281; permanece en su posición institucional. Su participación activa/coordinación durante M16 no queda cerrada por esta fuente.",
      "M17": "Preside el Consejo tras M16 (T290: 'Ji Xueying preside').",
      "EPILOGO": "NO_CERRADO_EN_FUENTE (sin ubicación de epílogo explícita más allá de su rol continuado como Maestra de Secta; epilogo.clasificacion=NO CERRADO EN FUENTE)"
    },
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
    },
    "aliases": {
      "id_canonico": "ji_xueying",
      "nombre_completo_normalizado": "ji xueying",
      "alias_cortos_inequivocos": [
        "ji",
        "xueying"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "qiao_ren": {
    "id": "qiao_ren",
    "nombre": "Qiao Ren",
    "categoria": "autoridad",
    "rol": "Disciplina y Administración",
    "sala_inicial": "pabellon_disciplina",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [
      "SECTA_INTERIOR"
    ],
    "territorio_por_etapa": {
      "LI": "[Desglosado de LI-LIII, mismo texto fuente] RUTA entre Disciplina/Interior/Consejo.",
      "LII": "[Desglosado de LI-LIII, mismo texto fuente] RUTA entre Disciplina/Interior/Consejo.",
      "LIII": "[Desglosado de LI-LIII, mismo texto fuente] RUTA entre Disciplina/Interior/Consejo.",
      "M16": "Coordinación institucional durante M16 (T244, tabla 'NPC en crisis'); no es responsable de un frente concreto de los 6 de T281.",
      "M17": "Asiste; debe autorizar la excepción que habilita NUCLEO_PROFUNDO (T290 §1: 'Qiao Ren debe autorizar una excepción...').",
      "EPILOGO": "PROPUESTA_HISTORICA (T211): anclaje declarado en 'epílogo', sin sala/estado descrito más allá de su rol."
    },
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
    },
    "aliases": {
      "id_canonico": "qiao_ren",
      "nombre_completo_normalizado": "qiao ren",
      "alias_cortos_inequivocos": []
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "wei_jian": {
    "id": "wei_jian",
    "nombre": "Wei Jian",
    "categoria": "autoridad",
    "rol": "Responsable marcial / Pabellón Marcial",
    "sala_inicial": "patio_marcial",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [
      "SECTA_INTERIOR"
    ],
    "territorio_por_etapa": {
      "LI": "[Desglosado de LI-LIII, mismo texto fuente] RUTA entre Patio Marcial / Instructores / Interior.",
      "LII": "[Desglosado de LI-LIII, mismo texto fuente] RUTA entre Patio Marcial / Instructores / Interior.",
      "LIII": "[Desglosado de LI-LIII, mismo texto fuente] RUTA entre Patio Marcial / Instructores / Interior.",
      "M16": "Seguridad/respuesta (T244, tabla 'NPC en crisis'); no es responsable de ninguno de los 6 frentes de T281.",
      "M17": "Posible asistente 'según puesta en escena' (T244: 'quizá Wei Jian').",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "wei_jian",
      "nombre_completo_normalizado": "wei jian",
      "alias_cortos_inequivocos": [
        "jian",
        "wei"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "song_rui": {
    "id": "song_rui",
    "nombre": "Song Rui",
    "categoria": "autoridad",
    "rol": "Responsable de Archivos",
    "sala_inicial": "archivos_sala_consulta",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Desglosado de LI-LII, mismo texto fuente] Archivo (T211 §3).",
      "LII": "[Desglosado de LI-LII, mismo texto fuente] Archivo (T211 §3).",
      "LIII": "Archivo/sector antiguo abierto (clave propia LIII, no desglosada de LI-LII).",
      "M16": "ANCLADO Archivo (T211 §3); Archivos/protección de documentación (T244). No es 'responsable principal' de un frente de los 6 de T281.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §3): Catalogación (implícitamente relacionada con Primera Ala, coherente con el epílogo de Zhao Wen 'Archivo, reclasificando la historia')."
    },
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
    },
    "aliases": {
      "id_canonico": "song_rui",
      "nombre_completo_normalizado": "song rui",
      "alias_cortos_inequivocos": [
        "song"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "lan_meihua": {
    "id": "lan_meihua",
    "nombre": "Lan Meihua",
    "categoria": "autoridad",
    "rol": "Medicina / Alquimia",
    "sala_inicial": "consultorio_meridianos",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 y Epílogo para esta NPC; regla aplicada: 'si sólo existe M16, NO copiarlo a LI'). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE (mismo motivo que LI; sin clave LII en la fuente.)",
      "LIII": "NO_CERRADO_EN_FUENTE (mismo motivo que LI; sin clave LIII en la fuente.)",
      "M16": "ANCLADA en Medicina (T281: responsable principal del frente MEDICINA, junto a Chen Bo y Yao Fen).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE (no cerrado explícitamente para ella; sí lo está para Mei Lian, que 'atiende lo que quedó' en Medicina)."
    },
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
    },
    "aliases": {
      "id_canonico": "lan_meihua",
      "nombre_completo_normalizado": "lan meihua",
      "alias_cortos_inequivocos": [
        "lan",
        "meihua"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "duan_shibo": {
    "id": "duan_shibo",
    "nombre": "Duan Shibo",
    "categoria": "autoridad",
    "rol": "Recursos / Producción",
    "sala_inicial": "oficina_logistica",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (solo existe clave LII en la fuente; regla aplicada: 'si sólo existe LII, NO inventar LI'). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de LII.]",
      "LII": "Producción/Cantera (T211 §3).",
      "LIII": "NO_CERRADO_EN_FUENTE (sin clave LIII en la fuente.)",
      "M16": "ANCLADO Recursos (T211 §3), entre almacenes y centro de coordinación (T244); responsable principal del frente RECURSOS junto a Ma Qiren y Lu Cheng (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §17): Reparando cadenas logísticas / reconstrucción."
    },
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
    },
    "aliases": {
      "id_canonico": "duan_shibo",
      "nombre_completo_normalizado": "duan shibo",
      "alias_cortos_inequivocos": [
        "duan",
        "shibo"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "he_zhen": {
    "id": "he_zhen",
    "nombre": "He Zhen",
    "categoria": "autoridad",
    "rol": "Formaciones / Territorio",
    "sala_inicial": "formaciones_sala_control",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (solo existen claves LII/LIII en la fuente; regla aplicada: 'si sólo existe LII, NO inventar LI').",
      "LII": "restringido (T211 §3).",
      "LIII": "Formaciones.",
      "M16": "ANCLADO Nodo Central (T211 §3); centro de Formaciones (T244); responsable principal del frente FORMACIONES (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §3, §17): Entre Formaciones y Primera Ala."
    },
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
    },
    "aliases": {
      "id_canonico": "he_zhen",
      "nombre_completo_normalizado": "he zhen",
      "alias_cortos_inequivocos": [
        "he",
        "zhen"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "shen_baojun": {
    "id": "shen_baojun",
    "nombre": "Shen Baojun",
    "categoria": "intermedio",
    "rol": "Instructor marcial externo",
    "sala_inicial": "sala_formas",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] RUTA estable dentro de su territorio marcial; sin variación documentada por etapa.",
      "LII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] RUTA estable dentro de su territorio marcial; sin variación documentada por etapa.",
      "LIII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] RUTA estable dentro de su territorio marcial; sin variación documentada por etapa.",
      "M16": "NO_CERRADO_EN_FUENTE (presencia_crisis_m16.clasificacion=NO CERRADO EN FUENTE; no aparece en la tabla de 6 frentes ni en la de movimiento en crisis.)",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "shen_baojun",
      "nombre_completo_normalizado": "shen baojun",
      "alias_cortos_inequivocos": [
        "baojun",
        "shen"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "madre_wen": {
    "id": "madre_wen",
    "nombre": "Madre Wen",
    "categoria": "intermedio",
    "rol": "Responsable de vida cotidiana de externos",
    "sala_inicial": "patio_cabanas",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa; presencia constante como figura de continuidad.",
      "LII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa; presencia constante como figura de continuidad.",
      "LIII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa; presencia constante como figura de continuidad.",
      "M16": "No aparece en la tabla de 6 frentes ni en la tabla de movimiento en crisis; T283 sugiere un rol informal durante M16, pero no lo cierra.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "madre_wen",
      "nombre_completo_normalizado": "madre wen",
      "alias_cortos_inequivocos": [
        "madre"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "tao_ming": {
    "id": "tao_ming",
    "nombre": "Tao Ming",
    "categoria": "intermedio",
    "rol": "Registro de Servicios",
    "sala_inicial": "oficina_servicios",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Prácticamente fijo en Registro/Oficina de Servicios.",
      "LII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Prácticamente fijo en Registro/Oficina de Servicios.",
      "LIII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Prácticamente fijo en Registro/Oficina de Servicios.",
      "M16": "CANÓNICO (T211 §10): Deja de registrar trabajos rutinarios y registra emergencias. (Dato tomado de presencia_crisis_m16; territorio_por_etapa no tiene clave M16 propia para este NPC.)",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "tao_ming",
      "nombre_completo_normalizado": "tao ming",
      "alias_cortos_inequivocos": [
        "ming"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "jiang_rui": {
    "id": "jiang_rui",
    "nombre": "Jiang Rui",
    "categoria": "intermedio",
    "rol": "Capitán de patrulla",
    "sala_inicial": "puesto_valle",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Puerta/Puesto (T211 §3).",
      "LII": "rutas completas (clave propia LII).",
      "LIII": "territorio + investigación (clave propia LIII).",
      "M16": "ANCLADO Rutas (T211 §3); rutas/Bosques (T244); responsable principal (junto a Ren Bo) del frente RUTAS (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §3): patrulla/reparaciones."
    },
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
    },
    "aliases": {
      "id_canonico": "jiang_rui",
      "nombre_completo_normalizado": "jiang rui",
      "alias_cortos_inequivocos": [
        "jiang"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "su_lian": {
    "id": "su_lian",
    "nombre": "Su Lian",
    "categoria": "intermedio",
    "rol": "Maestra de Herboristería",
    "sala_inicial": "bancal_central",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Jardines (T211 §3).",
      "LII": "Jardines/Bosque Bajo.",
      "LIII": "Jardines/nodos.",
      "M16": "ANCLADA Jardines (T211 §3); Jardines (T244); responsable principal (única) del frente JARDINES (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §3): Jardines."
    },
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
    },
    "aliases": {
      "id_canonico": "su_lian",
      "nombre_completo_normalizado": "su lian",
      "alias_cortos_inequivocos": [
        "su"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "chen_bo": {
    "id": "chen_bo",
    "nombre": "Chen Bo",
    "categoria": "intermedio",
    "rol": "Instructor de Examen / Anatomía-Medicina",
    "sala_inicial": "sala_anatomica",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Desglosado de LI-LIII, mismo texto fuente] Medicina (T211 §3).",
      "LII": "[Desglosado de LI-LIII, mismo texto fuente] Medicina (T211 §3).",
      "LIII": "Medicina + investigación (clave propia LIII adicional a la LI-LIII general; se conserva el detalle más específico).",
      "M16": "ANCLADO Medicina (T211 §3); prioriza pacientes (T211 §10); co-responsable del frente MEDICINA con Lan Meihua y Yao Fen (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §3): Medicina."
    },
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
    },
    "aliases": {
      "id_canonico": "chen_bo",
      "nombre_completo_normalizado": "chen bo",
      "alias_cortos_inequivocos": []
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "yao_fen": {
    "id": "yao_fen",
    "nombre": "Yao Fen",
    "categoria": "intermedio",
    "rol": "Instructora de Alquimia / Botica",
    "sala_inicial": "laboratorio_alquimia",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (solo existe clave LII en la fuente; regla aplicada: 'si sólo existe LII, NO inventar LI'). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de LII.]",
      "LII": "desbloqueo lateral (T244).",
      "LIII": "NO_CERRADO_EN_FUENTE (sin clave LIII en la fuente.)",
      "M16": "Co-responsable del frente MEDICINA con Lan Meihua y Chen Bo (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "yao_fen",
      "nombre_completo_normalizado": "yao fen",
      "alias_cortos_inequivocos": [
        "fen",
        "yao"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "gao_shun": {
    "id": "gao_shun",
    "nombre": "Gao Shun",
    "categoria": "funcional",
    "rol": "Guardia de la Puerta Roja",
    "sala_inicial": "casa_guardia",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Prácticamente fijo en la Puerta.",
      "LII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Prácticamente fijo en la Puerta.",
      "LIII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Prácticamente fijo en la Puerta.",
      "M16": "PROPUESTA_HISTORICA (T211 §10): mencionado genéricamente entre los NPC funcionales que 'hacen su trabajo' durante la crisis, sin frente propio de los 6 de T281.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §12) [CORREGIDO EN REV2 — ausente/NO_CERRADO por error en REV1]: Permanece en la puerta; 'una simple línea suya puede tener más efecto que un gran discurso' en el epílogo."
    },
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
    },
    "aliases": {
      "id_canonico": "gao_shun",
      "nombre_completo_normalizado": "gao shun",
      "alias_cortos_inequivocos": [
        "gao"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "feng_zhi": {
    "id": "feng_zhi",
    "nombre": "Feng Zhi",
    "categoria": "funcional",
    "rol": "Asistente de Disciplina",
    "sala_inicial": "pabellon_disciplina",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa.",
      "LII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa.",
      "LIII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa.",
      "M16": "NO_CERRADO_EN_FUENTE",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "feng_zhi",
      "nombre_completo_normalizado": "feng zhi",
      "alias_cortos_inequivocos": [
        "feng",
        "zhi"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "ma_qiren": {
    "id": "ma_qiren",
    "nombre": "Ma Qiren",
    "categoria": "funcional",
    "rol": "Responsable de Almacenes",
    "sala_inicial": "deposito_comun",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para esta NPC; regla aplicada: 'si sólo existe M16, NO copiarlo a LI'). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "Co-responsable del frente RECURSOS junto a Duan Shibo y Lu Cheng (T281). 'Distribuye suministros' (T211 §10).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "ma_qiren",
      "nombre_completo_normalizado": "ma qiren",
      "alias_cortos_inequivocos": [
        "qiren"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "pei_luo": {
    "id": "pei_luo",
    "nombre": "Pei Luo",
    "categoria": "funcional",
    "rol": "Responsable de Cocina/Comedor",
    "sala_inicial": "cocina_comunal",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para este NPC; regla aplicada: 'si sólo existe M16, NO copiarlo a LI'). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "Organiza raciones durante la crisis (T211 §10); no es responsable de ningún frente de los 6 de T281.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "pei_luo",
      "nombre_completo_normalizado": "pei luo",
      "alias_cortos_inequivocos": [
        "pei"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "lu_cheng": {
    "id": "lu_cheng",
    "nombre": "Lu Cheng",
    "categoria": "funcional",
    "rol": "Taller de armas / Reparaciones",
    "sala_inicial": "taller_lu_cheng",
    "sala_inicial_clasificacion": "CANÓNICO",
    "movilidad": "ANCLADO",
    "territorio_normal": [
      "taller_lu_cheng"
    ],
    "transito_tecnico": [],
    "posicion_valida": [
      "taller_lu_cheng"
    ],
    "rutas": [],
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para este NPC). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "Repara equipo (T211 §10); co-responsable del frente RECURSOS junto a Duan Shibo y Ma Qiren (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "lu_cheng",
      "nombre_completo_normalizado": "lu cheng",
      "alias_cortos_inequivocos": [
        "cheng",
        "lu"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "ning_cai": {
    "id": "ning_cai",
    "nombre": "Ning Cai",
    "categoria": "funcional",
    "rol": "Textiles y cuero",
    "sala_inicial": "taller_ning_cai",
    "sala_inicial_clasificacion": "CANÓNICO",
    "movilidad": "ANCLADO",
    "territorio_normal": [
      "taller_ning_cai"
    ],
    "transito_tecnico": [],
    "posicion_valida": [
      "taller_ning_cai"
    ],
    "rutas": [],
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para esta NPC). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "Produce vendas/correas/protecciones durante la emergencia (T211 §10); no aparece como responsable de un frente propio de T281.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "ning_cai",
      "nombre_completo_normalizado": "ning cai",
      "alias_cortos_inequivocos": [
        "cai",
        "ning"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "wen_tao": {
    "id": "wen_tao",
    "nombre": "Wen Tao",
    "categoria": "funcional",
    "rol": "Técnico de Formaciones",
    "sala_inicial": "formaciones_taller_tecnico",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (solo existen claves LII/LIII en la fuente; regla aplicada: 'si sólo existe LII, NO inventar LI'). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de LII.]",
      "LII": "exterior técnico (T211 §3).",
      "LIII": "Formaciones/Primera Ala.",
      "M16": "ANCLADO nodo crítico (T211 §3); co-responsable del frente FORMACIONES junto a He Zhen (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (T211 §3): Reparación."
    },
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
    },
    "aliases": {
      "id_canonico": "wen_tao",
      "nombre_completo_normalizado": "wen tao",
      "alias_cortos_inequivocos": []
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "yu_shun": {
    "id": "yu_shun",
    "nombre": "Yu Shun",
    "categoria": "funcional",
    "rol": "Copista",
    "sala_inicial": "archivos_escritorio_copistas",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa fuera de Archivos.",
      "LII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa fuera de Archivos.",
      "LIII": "[Regla general (T-fuente marca 'General'), sin variación documentada por etapa] Sin variación documentada por etapa fuera de Archivos.",
      "M16": "NO_CERRADO_EN_FUENTE",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "yu_shun",
      "nombre_completo_normalizado": "yu shun",
      "alias_cortos_inequivocos": [
        "yu"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "ma_gu": {
    "id": "ma_gu",
    "nombre": "Ma Gu",
    "categoria": "funcional",
    "rol": "Capataz de Cantera",
    "sala_inicial": "oficina_capataz",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para este NPC). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "Cantera/Recursos (T244, tabla 'NPC en crisis'); T243/C1 confirma que Cantera es 'contexto de Guo dentro de RECURSOS', no un frente separado de los 6 de T281.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE Diálogos de epílogo afectados por resultado ESTABLE/COSTOSO/DAÑADO de Recursos, sin ubicación fija declarada."
    },
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
    },
    "aliases": {
      "id_canonico": "ma_gu",
      "nombre_completo_normalizado": "ma gu",
      "alias_cortos_inequivocos": [
        "gu"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "ren_bo": {
    "id": "ren_bo",
    "nombre": "Ren Bo",
    "categoria": "funcional",
    "rol": "Patrullero veterano",
    "sala_inicial": "patio_puesto_valle",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para este NPC). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "rutas/Aguas (T244); co-responsable del frente RUTAS junto a Jiang Rui (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "ren_bo",
      "nombre_completo_normalizado": "ren bo",
      "alias_cortos_inequivocos": []
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "xu_an": {
    "id": "xu_an",
    "nombre": "Xu An",
    "categoria": "funcional",
    "rol": "Representante de Sauces",
    "sala_inicial": "sauces_casa_comunal",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para este NPC). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "ANCLADO/ANCLADA Sauces (T244); responsable principal del frente SAUCES (T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "xu_an",
      "nombre_completo_normalizado": "xu an",
      "alias_cortos_inequivocos": [
        "an",
        "xu"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "mei_shufen": {
    "id": "mei_shufen",
    "nombre": "Mei Shufen",
    "categoria": "funcional",
    "rol": "Herbolaria local de Sauces (tía de Mei Lian)",
    "sala_inicial": "sauces_herbolaria",
    "sala_inicial_clasificacion": "CANÓNICO",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "NO_CERRADO_EN_FUENTE (la fuente solo documenta LIV_crisis/M16 para esta NPC). [CORREGIDO EN REV2: en REV1 se copió aquí, por error, información de M16.]",
      "LII": "NO_CERRADO_EN_FUENTE",
      "LIII": "NO_CERRADO_EN_FUENTE",
      "M16": "No es responsable formal de SAUCES (ese rol es de Xu An), pero está en el epicentro del frente. Garantía narrativa explícita (T281): 'M16 Sauces DAÑADO no destruye el asentamiento ni mata a Mei Shufen automáticamente'.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "NO_CERRADO_EN_FUENTE"
    },
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
    },
    "aliases": {
      "id_canonico": "mei_shufen",
      "nombre_completo_normalizado": "mei shufen",
      "alias_cortos_inequivocos": [
        "shufen"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "lin_yue": {
    "id": "lin_yue",
    "nombre": "Lin Yue",
    "categoria": "companero",
    "rol": "Aspirante — enlace territorial / rutas",
    "sala_inicial": "patio_marcial",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Patio Exterior + Marcial (C1 §K).",
      "LII": "añade rutas y Puesto del Valle: Patio → Marcial → Puerta Roja → rutas de patrulla; también Bosques, Producción.",
      "LIII": "Marcial → rutas → Recinto Interior ocasional; Marcial Alto.",
      "M16": "ANCLADA en Rutas (responsable/ancla principal del frente RUTAS junto a Jiang Rui/Ren Bo, T243/T281). Va a RUTAS por iniciativa propia (LIN_05_RUTAS_M16) salvo circunstancia narrativa distinta.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (C1 §O): Estado final COORDINADORA_TERRITORIAL. Ubicación probable: Patio Marcial / ruta que sostuvo (T194)."
    },
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
    },
    "aliases": {
      "id_canonico": "lin_yue",
      "nombre_completo_normalizado": "lin yue",
      "alias_cortos_inequivocos": [
        "lin",
        "yue"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "han_qiao": {
    "id": "han_qiao",
    "nombre": "Han Qiao",
    "categoria": "companero",
    "rol": "Aspirante — recursos/contactos, logística",
    "sala_inicial": "oficina_servicios",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Patio, Registro, Marcial (T171); comedor, servicios, almacén (T203). Ver Q.14 (AMBIGÜEDAD de área documentada; no resuelta aquí, ver sala_inicial).",
      "LII": "Patio → Producción/almacenes → Puerta Roja → ocasionalmente Sauces.",
      "LIII": "Administración → Archivo público → Recinto Interior limitado; permisos, contactos externos.",
      "M16": "ANCLADO Recursos/Logística (responsable/apoyo del frente RECURSOS, T243/T281); puede asumir logística aunque no sea el responsable formal.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (C1 §O): Estado final HERENCIA_APROPIADA. Ubicación probable: Producción/Administración, gestionando consecuencias externas (T194)."
    },
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
    },
    "aliases": {
      "id_canonico": "han_qiao",
      "nombre_completo_normalizado": "han qiao",
      "alias_cortos_inequivocos": [
        "han"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "zhao_wen": {
    "id": "zhao_wen",
    "nombre": "Zhao Wen",
    "categoria": "companero",
    "rol": "Aspirante — piezas documentales / análisis",
    "sala_inicial": "sala_comun_externos",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Patio → Sala Común → tablones/textos ('todavía no Archivo profundo').",
      "LII": "Patio → Administración → primeras salas de Archivo; Registro/escribas.",
      "LIII": "Archivos: Catálogo → Copistas → Lectura → Archivo Histórico; no accede a Restringido antes que el jugador.",
      "M16": "ANCLADO Archivo (T211 §3, versión previa); FORMACIONES o transversal como responsable de crisis más tardío es la versión canónica final (T243/T281): 'Otra posibilidad: apoyo transversal y no responsable principal'.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (C1 §O): Estado final INCERTIDUMBRE_RESPONSABLE. Ubicación probable: Archivo, reclasificando la historia (T194); T171: 'no necesariamente cultivando'."
    },
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
    },
    "aliases": {
      "id_canonico": "zhao_wen",
      "nombre_completo_normalizado": "zhao wen",
      "alias_cortos_inequivocos": [
        "zhao"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "mei_lian": {
    "id": "mei_lian",
    "nombre": "Mei Lian",
    "categoria": "companero",
    "rol": "Aspirante — saber médico/local, puente Secta-Sauces",
    "sala_inicial": "patio",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Patio → Medicina → Jardines.",
      "LII": "Jardines → rutas orientales → Sauces Bajos (T244: 'LII Sauces').",
      "LIII": "Medicina + Jardines + Sauces; Sala de Meridianos, Chen Bo, archivos clínicos.",
      "M16": "SAUCES o MEDICINA según estado y responsables disponibles es la versión canónica final (T243/T281); en T171 (obsoleto) solo Medicina.",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (C1 §O): Estado final PUENTE_SECTA_SAUCES. Ubicación probable: Medicina, atendiendo lo que quedó (T194); 'uno de ambos' (T211); 'entre secta y Sauces' (T262)."
    },
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
    },
    "aliases": {
      "id_canonico": "mei_lian",
      "nombre_completo_normalizado": "mei lian",
      "alias_cortos_inequivocos": []
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "guo_chen": {
    "id": "guo_chen",
    "nombre": "Guo Chen",
    "categoria": "companero",
    "rol": "Aspirante — trabajo material/persistencia, posible candidato a Segunda Rama",
    "sala_inicial": "patio",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Patio → Marcial → Producción.",
      "LII": "Producción → Patio de Hornos → Cantera.",
      "LIII": "Cantera → Producción → Medicina/Jardines ocasional.",
      "M16": "ANCLADO Recursos/Cantera (T211 §3, versión previa); RECURSOS (decisivo) o RUTAS (logística) es la versión canónica final (T243/T281). Sin mención de Cantera como frente propio (C1 §M.2).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (C1 §O): Estado final SEGUNDA_RAMA_POSTERGADA ('todavía no', no ejecuta el injerto). Ubicación probable: Producción/Cantera, reconstrucción (T194)."
    },
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
    },
    "aliases": {
      "id_canonico": "guo_chen",
      "nombre_completo_normalizado": "guo chen",
      "alias_cortos_inequivocos": [
        "guo"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  },
  "luo_yan": {
    "id": "luo_yan",
    "nombre": "Luo Yan",
    "categoria": "companero",
    "rol": "Aspirante — protocolo/historia oficial, lealtad institucional",
    "sala_inicial": "registro",
    "sala_inicial_clasificacion": "ELECCION_TECNICA_3C5",
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
    "gates_en_ruta": [],
    "territorio_por_etapa": {
      "LI": "Puerta Roja → Registro → puestos próximos; patrullas.",
      "LII": "Cómodo con la idea de que la secta protege, patrulla y norma; Patrullas/servicio institucional.",
      "LIII": "Administración → Formaciones/Archivo por asuntos oficiales.",
      "M16": "ANCLADO coordinación (T211 §3, versión previa); FORMACIONES / coordinación institucional en varios frentes es la versión canónica final (T243/T281).",
      "M17": "NO_CERRADO_EN_FUENTE",
      "EPILOGO": "CANÓNICO (C1 §O, único con reacción concreta a LIBERAR/CUSTODIAR: LUO_06): Estado final LEALTAD_RESPONSABLE. Ubicación probable: Administración/Patio, reorganizando funciones (T194)."
    },
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
    },
    "aliases": {
      "id_canonico": "luo_yan",
      "nombre_completo_normalizado": "luo yan",
      "alias_cortos_inequivocos": [
        "yan"
      ]
    },
    "descripcion_estado": "DESCRIPCION_NO_CERRADA (no existe descripción física cerrada en las fuentes auditadas; no se inventa apariencia)."
  }
};
const DESCS_NPC = {};
const NOMBRES_NPC = Object.fromEntries(Object.entries(NPC_DEF).map(([id,def]) => [id,def.nombre]));
const NPC_ALIASES = Object.fromEntries(Object.entries(NPC_DEF).map(([id,def]) =>
  [id,[id,def.nombre,...def.aliases.alias_cortos_inequivocos]]));
function normalizarAliasNPC(valor) {
  return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/_/g," ").replace(/\s+/g," ").trim();
}
const INDICE_ALIAS_NPC = new Map();
for (const [id,aliases] of Object.entries(NPC_ALIASES)) for (const alias of aliases) {
  const clave=normalizarAliasNPC(alias);
  if (INDICE_ALIAS_NPC.has(clave) && INDICE_ALIAS_NPC.get(clave)!==id) throw new Error("Alias NPC ambiguo: "+clave);
  INDICE_ALIAS_NPC.set(clave,id);
}
function resolverNPC(valor, presentes=Object.keys(NPC_DEF)) {
  const id=INDICE_ALIAS_NPC.get(normalizarAliasNPC(valor));
  return id && presentes.includes(id) ? id : null;
}
// R18: búsqueda de interlocutores por abreviatura, acotada a la sala.
// NO cambia resolverNPC(): su contrato exacto sigue vigente para oficios,
// pruebas, entregas, permisos y otros sistemas ajenos al comando HABLAR.
function resolverInterlocutorR18(consulta, presentes) {
  const ids=[...new Set(Array.isArray(presentes) ? presentes : [])]
    .filter(id => Object.prototype.hasOwnProperty.call(NPC_DEF,id));
  const palabra=normalizarAliasNPC(consulta);
  if (!palabra) return ids.length===1
    ? {estado:'OK',id:ids[0]} : {estado:'FALTA',candidatos:ids};
  // Los alias ratificados conservan prioridad frente a coincidencias parciales.
  const exacto=resolverNPC(palabra,ids);
  if (exacto) return {estado:'OK',id:exacto};
  if (palabra.length<2) return {estado:'NO_ENCONTRADO',candidatos:ids};
  const terminos=palabra.split(' ');
  const coincide=(texto) => {
    const normal=normalizarAliasNPC(texto);
    return normal.startsWith(palabra) ||
      (terminos.length===1 && normal.split(' ').some(x=>x.startsWith(palabra)));
  };
  const candidatos=ids.filter(id=>
    (NPC_ALIASES[id] || []).some(coincide));
  if (candidatos.length===1) return {estado:'OK',id:candidatos[0]};
  return {estado:candidatos.length>1?'AMBIGUO':'NO_ENCONTRADO',
    candidatos:candidatos.length?candidatos:ids};
}
function crearPosicionNPC() {
  return Object.fromEntries(Object.entries(NPC_DEF).map(([id,def]) => [id,{sala:def.sala_inicial,anclaje:null}]));
}
function crearConocimientoNPC() {
  return JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(NPC_DEF).map(([id,def]) => [id,def.conocimiento_inicial]))));
}

// Respuestas de ENTREGAR cuando no hay nada que entregarle a ese NPC todavía
// (misión activa pero no lista) o directamente no hay ningún encargo suyo
// pendiente. Cada NPC responde con su propia voz; "default" cubre a
// cualquiera que no tenga entrada propia.
const FRASES_MISION_INCOMPLETA = {default: progreso => `—Todavía no completaste eso. (${progreso})`};
const FRASES_SIN_ENCARGO = {default: "No parece esperar nada de vos."};
