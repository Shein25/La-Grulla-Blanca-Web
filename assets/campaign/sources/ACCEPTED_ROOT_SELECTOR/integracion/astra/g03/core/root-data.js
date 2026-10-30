import { freeze } from '../data/safe-data.js';

// Build-time copies of the unchanged G02 authority; no scoring edits.
const ROOT_MODEL=freeze({
  "status": "FROZEN_CURRENT_SELECTION_AUTHORITY",
  "version": "ROOT_SELECTION_VIENTO_IDENTITY_V1",
  "rootOrder": [
    "VIENTO",
    "FUEGO",
    "TIERRA",
    "METAL",
    "AGUA"
  ],
  "signals": {
    "EX": {
      "name": "Apertura de posibilidades",
      "meaning": "Explorar usos, alternativas o una posibilidad que aún no se ha desarrollado; no equivale a bondad, naturaleza o inteligencia."
    },
    "IN": {
      "name": "Intervención comprometida",
      "meaning": "Actuar para cambiar la situación asumiendo una decisión; no equivale a ira, violencia o superioridad moral."
    },
    "ES": {
      "name": "Criterio y organización",
      "meaning": "Precisar una razón operativa, estructura o responsabilidad; no equivale a obediencia ciega o frialdad."
    },
    "CO": {
      "name": "Continuidad de medios y compromisos",
      "meaning": "Conservar aquello que permite cumplir una obligación; no equivale a inmovilidad o resistencia corporal."
    },
    "OB": {
      "name": "Contraste de información",
      "meaning": "Observar, verificar o examinar antes o durante la respuesta; no equivale a inteligencia ni cobardía."
    },
    "AD": {
      "name": "Procedimiento revisable",
      "meaning": "Mantener abierto el ajuste de medios/recorrido según nuevos contrastes; distingue adaptación revisable de ejecutar una corrección ya definida. No implica evasión o falta de compromiso."
    },
    "VI": {
      "name": "Coordinación con otras personas",
      "meaning": "Considerar o contrastar el impacto en otros; no mide bondad, afecto, reputación ni relaciones reales."
    },
    "LI": {
      "name": "Delimitación y renuncia",
      "meaning": "Acotar alcance o dejar aquello que no sirve/no se puede garantizar; no equivale a crueldad o severidad."
    }
  },
  "signalScale": {
    "0": "Sin énfasis diagnóstico codificado en este canal, no ausencia de rasgo ni rechazo de hechos compartidos del contexto.",
    "1": "Señal secundaria explícita.",
    "2": "Señal central explícita."
  },
  "profiles": {
    "VIENTO": {
      "EX": 3,
      "IN": 1,
      "ES": 1,
      "CO": 1,
      "OB": 1,
      "AD": 3,
      "VI": 2,
      "LI": 0
    },
    "FUEGO": {
      "EX": 1,
      "IN": 4,
      "ES": 1,
      "CO": 1,
      "OB": 1,
      "AD": 1,
      "VI": 2,
      "LI": 1
    },
    "TIERRA": {
      "EX": 0,
      "IN": 1,
      "ES": 2,
      "CO": 4,
      "OB": 1,
      "AD": 1,
      "VI": 2,
      "LI": 1
    },
    "METAL": {
      "EX": 0,
      "IN": 1,
      "ES": 4,
      "CO": 1,
      "OB": 2,
      "AD": 1,
      "VI": 0,
      "LI": 3
    },
    "AGUA": {
      "EX": 1,
      "IN": 0,
      "ES": 1,
      "CO": 1,
      "OB": 4,
      "AD": 4,
      "VI": 0,
      "LI": 1
    }
  },
  "profileWeightScale": "0=no discriminación; 1=complemento; 2=apoyo; 3=núcleo; 4=núcleo focal. Pesos de selección ratificados; no son estadísticas de combate.",
  "equation": "raw(q,a,r)=sum_s signals(q,a,s)*profile(r,s); score(q,a,r)=20*(raw-mean_of_three_answers)/max(range_of_three_answers,7); total(r)=sum_q score(q,a_q,r)",
  "groups": [
    {
      "group": 1,
      "dimension": "INCERTIDUMBRE",
      "weight": {
        "exact": "1/5",
        "decimal": 0.2
      },
      "options": [
        {
          "position": "A",
          "id": "U_INTERVENCION_REVERSIBLE",
          "abstractStrategy": "Intervenir de forma acotada, observar los efectos inmediatos y corregir el procedimiento.",
          "signals": {
            "EX": 0,
            "IN": 2,
            "ES": 0,
            "CO": 0,
            "OB": 1,
            "AD": 2,
            "VI": 0,
            "LI": 1
          },
          "rawAlignment": {
            "VIENTO": 9,
            "FUEGO": 12,
            "TIERRA": 6,
            "METAL": 9,
            "AGUA": 13
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "20/27",
              "decimal": 0.7407407407407407
            },
            "FUEGO": {
              "exact": "160/21",
              "decimal": 7.619047619047619
            },
            "TIERRA": {
              "exact": "-20/7",
              "decimal": -2.857142857142857
            },
            "METAL": {
              "exact": "-20/33",
              "decimal": -0.6060606060606061
            },
            "AGUA": {
              "exact": "80/21",
              "decimal": 3.8095238095238093
            }
          }
        },
        {
          "position": "B",
          "id": "U_CRITERIO_SUFICIENTE",
          "abstractStrategy": "Precisar el dato decisivo y el límite del compromiso antes de utilizar recursos.",
          "signals": {
            "EX": 0,
            "IN": 0,
            "ES": 1,
            "CO": 1,
            "OB": 2,
            "AD": 0,
            "VI": 0,
            "LI": 2
          },
          "rawAlignment": {
            "VIENTO": 4,
            "FUEGO": 6,
            "TIERRA": 10,
            "METAL": 15,
            "AGUA": 12
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-280/27",
              "decimal": -10.37037037037037
            },
            "FUEGO": {
              "exact": "-200/21",
              "decimal": -9.523809523809524
            },
            "TIERRA": {
              "exact": "60/7",
              "decimal": 8.571428571428571
            },
            "METAL": {
              "exact": "340/33",
              "decimal": 10.303030303030303
            },
            "AGUA": {
              "exact": "20/21",
              "decimal": 0.9523809523809523
            }
          }
        },
        {
          "position": "C",
          "id": "U_POSIBILIDADES_CONTRASTADAS",
          "abstractStrategy": "Abrir alternativas, contrastarlas con otras personas y ensayar una posibilidad revisable.",
          "signals": {
            "EX": 2,
            "IN": 1,
            "ES": 0,
            "CO": 0,
            "OB": 1,
            "AD": 1,
            "VI": 1,
            "LI": 0
          },
          "rawAlignment": {
            "VIENTO": 13,
            "FUEGO": 10,
            "TIERRA": 5,
            "METAL": 4,
            "AGUA": 10
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "260/27",
              "decimal": 9.62962962962963
            },
            "FUEGO": {
              "exact": "40/21",
              "decimal": 1.9047619047619047
            },
            "TIERRA": {
              "exact": "-40/7",
              "decimal": -5.714285714285714
            },
            "METAL": {
              "exact": "-320/33",
              "decimal": -9.696969696969697
            },
            "AGUA": {
              "exact": "-100/21",
              "decimal": -4.761904761904762
            }
          }
        }
      ],
      "normalization": {
        "VIENTO": {
          "mean": {
            "exact": "26/3",
            "decimal": 8.666666666666666
          },
          "range": 9
        },
        "FUEGO": {
          "mean": {
            "exact": "28/3",
            "decimal": 9.333333333333334
          },
          "range": 6
        },
        "TIERRA": {
          "mean": {
            "exact": "7",
            "decimal": 7.0
          },
          "range": 5
        },
        "METAL": {
          "mean": {
            "exact": "28/3",
            "decimal": 9.333333333333334
          },
          "range": 11
        },
        "AGUA": {
          "mean": {
            "exact": "35/3",
            "decimal": 11.666666666666666
          },
          "range": 3
        }
      }
    },
    {
      "group": 2,
      "dimension": "OBSTACULO",
      "weight": {
        "exact": "1/5",
        "decimal": 0.2
      },
      "options": [
        {
          "position": "A",
          "id": "O_SOSTEN_REORGANIZADO",
          "abstractStrategy": "Reorganizar los medios para sostener el compromiso y a quienes dependen de él.",
          "signals": {
            "EX": 0,
            "IN": 0,
            "ES": 1,
            "CO": 2,
            "OB": 0,
            "AD": 1,
            "VI": 2,
            "LI": 0
          },
          "rawAlignment": {
            "VIENTO": 10,
            "FUEGO": 8,
            "TIERRA": 15,
            "METAL": 7,
            "AGUA": 7
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "4/3",
              "decimal": 1.3333333333333333
            },
            "FUEGO": {
              "exact": "-100/21",
              "decimal": -4.761904761904762
            },
            "TIERRA": {
              "exact": "320/33",
              "decimal": 9.696969696969697
            },
            "METAL": {
              "exact": "-10/3",
              "decimal": -3.3333333333333335
            },
            "AGUA": {
              "exact": "-8/3",
              "decimal": -2.6666666666666665
            }
          }
        },
        {
          "position": "B",
          "id": "O_CAMINO_ALTERNATIVO",
          "abstractStrategy": "Explorar otro procedimiento y probarlo ajustándose a lo observado.",
          "signals": {
            "EX": 2,
            "IN": 1,
            "ES": 0,
            "CO": 0,
            "OB": 1,
            "AD": 2,
            "VI": 0,
            "LI": 0
          },
          "rawAlignment": {
            "VIENTO": 14,
            "FUEGO": 9,
            "TIERRA": 4,
            "METAL": 5,
            "AGUA": 14
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "28/3",
              "decimal": 9.333333333333334
            },
            "FUEGO": {
              "exact": "-40/21",
              "decimal": -1.9047619047619047
            },
            "TIERRA": {
              "exact": "-340/33",
              "decimal": -10.303030303030303
            },
            "METAL": {
              "exact": "-25/3",
              "decimal": -8.333333333333334
            },
            "AGUA": {
              "exact": "34/3",
              "decimal": 11.333333333333334
            }
          }
        },
        {
          "position": "C",
          "id": "O_ESFUERZO_CONCENTRADO",
          "abstractStrategy": "Concentrar la intervención en el bloqueo principal, retirar pasos prescindibles y conservar medios para seguir.",
          "signals": {
            "EX": 0,
            "IN": 2,
            "ES": 1,
            "CO": 1,
            "OB": 0,
            "AD": 0,
            "VI": 0,
            "LI": 2
          },
          "rawAlignment": {
            "VIENTO": 4,
            "FUEGO": 12,
            "TIERRA": 10,
            "METAL": 13,
            "AGUA": 4
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-32/3",
              "decimal": -10.666666666666666
            },
            "FUEGO": {
              "exact": "20/3",
              "decimal": 6.666666666666667
            },
            "TIERRA": {
              "exact": "20/33",
              "decimal": 0.6060606060606061
            },
            "METAL": {
              "exact": "35/3",
              "decimal": 11.666666666666666
            },
            "AGUA": {
              "exact": "-26/3",
              "decimal": -8.666666666666666
            }
          }
        }
      ],
      "normalization": {
        "VIENTO": {
          "mean": {
            "exact": "28/3",
            "decimal": 9.333333333333334
          },
          "range": 10
        },
        "FUEGO": {
          "mean": {
            "exact": "29/3",
            "decimal": 9.666666666666666
          },
          "range": 4
        },
        "TIERRA": {
          "mean": {
            "exact": "29/3",
            "decimal": 9.666666666666666
          },
          "range": 11
        },
        "METAL": {
          "mean": {
            "exact": "25/3",
            "decimal": 8.333333333333334
          },
          "range": 8
        },
        "AGUA": {
          "mean": {
            "exact": "25/3",
            "decimal": 8.333333333333334
          },
          "range": 10
        }
      }
    },
    {
      "group": 3,
      "dimension": "RESPONSABILIDAD",
      "weight": {
        "exact": "1/5",
        "decimal": 0.2
      },
      "options": [
        {
          "position": "A",
          "id": "R_DECISION_RESPALDADA",
          "abstractStrategy": "Tomar una decisión necesaria, considerar su impacto en otros y fijar responsabilidades, medios y alcance.",
          "signals": {
            "EX": 0,
            "IN": 2,
            "ES": 1,
            "CO": 1,
            "OB": 0,
            "AD": 0,
            "VI": 1,
            "LI": 1
          },
          "rawAlignment": {
            "VIENTO": 6,
            "FUEGO": 13,
            "TIERRA": 11,
            "METAL": 10,
            "AGUA": 3
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-140/27",
              "decimal": -5.185185185185185
            },
            "FUEGO": {
              "exact": "220/21",
              "decimal": 10.476190476190476
            },
            "TIERRA": {
              "exact": "20/21",
              "decimal": 0.9523809523809523
            },
            "METAL": {
              "exact": "10/3",
              "decimal": 3.3333333333333335
            },
            "AGUA": {
              "exact": "-8",
              "decimal": -8.0
            }
          }
        },
        {
          "position": "B",
          "id": "R_COMPROMISO_DELIMITADO",
          "abstractStrategy": "Delimitar lo que se puede garantizar a otros y organizar el cumplimiento sostenido de esa obligación.",
          "signals": {
            "EX": 0,
            "IN": 0,
            "ES": 1,
            "CO": 2,
            "OB": 0,
            "AD": 0,
            "VI": 1,
            "LI": 2
          },
          "rawAlignment": {
            "VIENTO": 5,
            "FUEGO": 7,
            "TIERRA": 14,
            "METAL": 12,
            "AGUA": 5
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-200/27",
              "decimal": -7.407407407407407
            },
            "FUEGO": {
              "exact": "-20/3",
              "decimal": -6.666666666666667
            },
            "TIERRA": {
              "exact": "200/21",
              "decimal": 9.523809523809524
            },
            "METAL": {
              "exact": "25/3",
              "decimal": 8.333333333333334
            },
            "AGUA": {
              "exact": "-4",
              "decimal": -4.0
            }
          }
        },
        {
          "position": "C",
          "id": "R_ALTERNATIVA_COMPARTIDA",
          "abstractStrategy": "Contrastar la decisión con las personas afectadas y ajustar una alternativa viable.",
          "signals": {
            "EX": 1,
            "IN": 0,
            "ES": 0,
            "CO": 0,
            "OB": 1,
            "AD": 2,
            "VI": 2,
            "LI": 0
          },
          "rawAlignment": {
            "VIENTO": 14,
            "FUEGO": 8,
            "TIERRA": 7,
            "METAL": 4,
            "AGUA": 13
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "340/27",
              "decimal": 12.592592592592593
            },
            "FUEGO": {
              "exact": "-80/21",
              "decimal": -3.8095238095238093
            },
            "TIERRA": {
              "exact": "-220/21",
              "decimal": -10.476190476190476
            },
            "METAL": {
              "exact": "-35/3",
              "decimal": -11.666666666666666
            },
            "AGUA": {
              "exact": "12",
              "decimal": 12.0
            }
          }
        }
      ],
      "normalization": {
        "VIENTO": {
          "mean": {
            "exact": "25/3",
            "decimal": 8.333333333333334
          },
          "range": 9
        },
        "FUEGO": {
          "mean": {
            "exact": "28/3",
            "decimal": 9.333333333333334
          },
          "range": 6
        },
        "TIERRA": {
          "mean": {
            "exact": "32/3",
            "decimal": 10.666666666666666
          },
          "range": 7
        },
        "METAL": {
          "mean": {
            "exact": "26/3",
            "decimal": 8.666666666666666
          },
          "range": 8
        },
        "AGUA": {
          "mean": {
            "exact": "7",
            "decimal": 7.0
          },
          "range": 10
        }
      }
    },
    {
      "group": 4,
      "dimension": "PERDIDA_FRACASO",
      "weight": {
        "exact": "1/5",
        "decimal": 0.2
      },
      "options": [
        {
          "position": "A",
          "id": "L_REAPROVECHAMIENTO",
          "abstractStrategy": "Examinar lo que queda y ensayar un nuevo uso, conservando medios y ajustando el procedimiento.",
          "signals": {
            "EX": 2,
            "IN": 0,
            "ES": 0,
            "CO": 1,
            "OB": 1,
            "AD": 2,
            "VI": 0,
            "LI": 0
          },
          "rawAlignment": {
            "VIENTO": 14,
            "FUEGO": 6,
            "TIERRA": 7,
            "METAL": 5,
            "AGUA": 15
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "40/3",
              "decimal": 13.333333333333334
            },
            "FUEGO": {
              "exact": "-20/3",
              "decimal": -6.666666666666667
            },
            "TIERRA": {
              "exact": "-100/21",
              "decimal": -4.761904761904762
            },
            "METAL": {
              "exact": "-12",
              "decimal": -12.0
            },
            "AGUA": {
              "exact": "10",
              "decimal": 10.0
            }
          }
        },
        {
          "position": "B",
          "id": "L_CORRECCION_ENFOCADA",
          "abstractStrategy": "Examinar la causa decisiva, acotar la intervención a ese fallo y ejecutar una corrección definida.",
          "signals": {
            "EX": 0,
            "IN": 2,
            "ES": 1,
            "CO": 0,
            "OB": 2,
            "AD": 0,
            "VI": 0,
            "LI": 1
          },
          "rawAlignment": {
            "VIENTO": 5,
            "FUEGO": 12,
            "TIERRA": 7,
            "METAL": 13,
            "AGUA": 10
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-20/3",
              "decimal": -6.666666666666667
            },
            "FUEGO": {
              "exact": "220/21",
              "decimal": 10.476190476190476
            },
            "TIERRA": {
              "exact": "-100/21",
              "decimal": -4.761904761904762
            },
            "METAL": {
              "exact": "4",
              "decimal": 4.0
            },
            "AGUA": {
              "exact": "0",
              "decimal": 0.0
            }
          }
        },
        {
          "position": "C",
          "id": "L_RENUNCIA_CON_CRITERIO",
          "abstractStrategy": "Cerrar lo inviable según un criterio explícito y atender los compromisos que permanecen con otras personas.",
          "signals": {
            "EX": 0,
            "IN": 0,
            "ES": 2,
            "CO": 1,
            "OB": 0,
            "AD": 0,
            "VI": 1,
            "LI": 2
          },
          "rawAlignment": {
            "VIENTO": 5,
            "FUEGO": 7,
            "TIERRA": 12,
            "METAL": 15,
            "AGUA": 5
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-20/3",
              "decimal": -6.666666666666667
            },
            "FUEGO": {
              "exact": "-80/21",
              "decimal": -3.8095238095238093
            },
            "TIERRA": {
              "exact": "200/21",
              "decimal": 9.523809523809524
            },
            "METAL": {
              "exact": "8",
              "decimal": 8.0
            },
            "AGUA": {
              "exact": "-10",
              "decimal": -10.0
            }
          }
        }
      ],
      "normalization": {
        "VIENTO": {
          "mean": {
            "exact": "8",
            "decimal": 8.0
          },
          "range": 9
        },
        "FUEGO": {
          "mean": {
            "exact": "25/3",
            "decimal": 8.333333333333334
          },
          "range": 6
        },
        "TIERRA": {
          "mean": {
            "exact": "26/3",
            "decimal": 8.666666666666666
          },
          "range": 5
        },
        "METAL": {
          "mean": {
            "exact": "11",
            "decimal": 11.0
          },
          "range": 10
        },
        "AGUA": {
          "mean": {
            "exact": "10",
            "decimal": 10.0
          },
          "range": 10
        }
      }
    },
    {
      "group": 5,
      "dimension": "OPORTUNIDAD_PODER",
      "weight": {
        "exact": "1/5",
        "decimal": 0.2
      },
      "options": [
        {
          "position": "A",
          "id": "P_ALCANCE_CON_CONDICIONES",
          "abstractStrategy": "Fijar el alcance y las condiciones de uso de la capacidad obtenida, verificando sus efectos.",
          "signals": {
            "EX": 0,
            "IN": 0,
            "ES": 2,
            "CO": 1,
            "OB": 1,
            "AD": 0,
            "VI": 0,
            "LI": 2
          },
          "rawAlignment": {
            "VIENTO": 4,
            "FUEGO": 6,
            "TIERRA": 11,
            "METAL": 17,
            "AGUA": 9
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-26/3",
              "decimal": -8.666666666666666
            },
            "FUEGO": {
              "exact": "-220/21",
              "decimal": -10.476190476190476
            },
            "TIERRA": {
              "exact": "20/3",
              "decimal": 6.666666666666667
            },
            "METAL": {
              "exact": "92/9",
              "decimal": 10.222222222222221
            },
            "AGUA": {
              "exact": "40/21",
              "decimal": 1.9047619047619047
            }
          }
        },
        {
          "position": "B",
          "id": "P_DESARROLLO_COMPARTIDO",
          "abstractStrategy": "Usar la capacidad para abrir posibilidades compartidas mediante ensayos con otras personas.",
          "signals": {
            "EX": 2,
            "IN": 1,
            "ES": 0,
            "CO": 0,
            "OB": 0,
            "AD": 1,
            "VI": 2,
            "LI": 0
          },
          "rawAlignment": {
            "VIENTO": 14,
            "FUEGO": 11,
            "TIERRA": 6,
            "METAL": 2,
            "AGUA": 6
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "34/3",
              "decimal": 11.333333333333334
            },
            "FUEGO": {
              "exact": "80/21",
              "decimal": 3.8095238095238093
            },
            "TIERRA": {
              "exact": "-160/21",
              "decimal": -7.619047619047619
            },
            "METAL": {
              "exact": "-88/9",
              "decimal": -9.777777777777779
            },
            "AGUA": {
              "exact": "-20/3",
              "decimal": -6.666666666666667
            }
          }
        },
        {
          "position": "C",
          "id": "P_CAMBIO_POR_ETAPAS",
          "abstractStrategy": "Actuar sobre el cambio prioritario por etapas, conservando medios y ajustando el procedimiento.",
          "signals": {
            "EX": 0,
            "IN": 2,
            "ES": 0,
            "CO": 1,
            "OB": 1,
            "AD": 1,
            "VI": 0,
            "LI": 1
          },
          "rawAlignment": {
            "VIENTO": 7,
            "FUEGO": 12,
            "TIERRA": 9,
            "METAL": 9,
            "AGUA": 10
          },
          "centeredContribution": {
            "VIENTO": {
              "exact": "-8/3",
              "decimal": -2.6666666666666665
            },
            "FUEGO": {
              "exact": "20/3",
              "decimal": 6.666666666666667
            },
            "TIERRA": {
              "exact": "20/21",
              "decimal": 0.9523809523809523
            },
            "METAL": {
              "exact": "-4/9",
              "decimal": -0.4444444444444444
            },
            "AGUA": {
              "exact": "100/21",
              "decimal": 4.761904761904762
            }
          }
        }
      ],
      "normalization": {
        "VIENTO": {
          "mean": {
            "exact": "25/3",
            "decimal": 8.333333333333334
          },
          "range": 10
        },
        "FUEGO": {
          "mean": {
            "exact": "29/3",
            "decimal": 9.666666666666666
          },
          "range": 6
        },
        "TIERRA": {
          "mean": {
            "exact": "26/3",
            "decimal": 8.666666666666666
          },
          "range": 5
        },
        "METAL": {
          "mean": {
            "exact": "28/3",
            "decimal": 9.333333333333334
          },
          "range": 15
        },
        "AGUA": {
          "mean": {
            "exact": "25/3",
            "decimal": 8.333333333333334
          },
          "range": 4
        }
      }
    }
  ],
  "resolution": [
    "maximum exact rational score",
    "among primary ties, maximum number of strictly positive dimensions",
    "among survivors, maximum minimum contribution",
    "among survivors, first root in the lexicographically enumerated permutation at index base3_canonical_semantic_strategy_index mod 120"
  ],
  "technicalFallback": "No semantic evidence. Only equal-primary-score survivors; never overturns a unique winner. The base3 digits refer to the canonical strategy IDs in strategyOrderByGroup, not display positions. Canonical root/permutation order is technical, proposed and versioned, not narrative priority.",
  "strategyOrderByGroup": [
    [
      "U_INTERVENCION_REVERSIBLE",
      "U_CRITERIO_SUFICIENTE",
      "U_POSIBILIDADES_CONTRASTADAS"
    ],
    [
      "O_SOSTEN_REORGANIZADO",
      "O_CAMINO_ALTERNATIVO",
      "O_ESFUERZO_CONCENTRADO"
    ],
    [
      "R_COMPROMISO_DELIMITADO",
      "R_ALTERNATIVA_COMPARTIDA",
      "R_DECISION_RESPALDADA"
    ],
    [
      "L_REAPROVECHAMIENTO",
      "L_RENUNCIA_CON_CRITERIO",
      "L_CORRECCION_ENFOCADA"
    ],
    [
      "P_ALCANCE_CON_CONDICIONES",
      "P_DESARROLLO_COMPARTIDO",
      "P_CAMBIO_POR_ETAPAS"
    ]
  ],
  "normalizationMeaning": "Uniform-option reference measure only, not human preferences. Ratified floor=7 limits amplification of weak contrasts. No moral judgment.",
  "runtimeImplementation": false,
  "finalNarrativeQuestions": false,
  "floor": 7,
  "normalization": "CENTER_FLOORED_RANGE_FLOOR_7"
});
const ROOT_NARRATIVE=freeze({
  "version": "ROOT_NARRATIVE_CANDIDATE_V1",
  "status": "ACCEPTED_PROVISIONALLY_UNCHANGED_REV1",
  "semanticSourceSha256": "2592a6a8f7957dceded4c5de8d9a62155d2995f7113ac9523069c4cabd3d0ed5",
  "normalizationRef": "ROOT_RATIFICATION_FLOOR_7.json",
  "frame": "Con la mano aún sobre la piedra, escuchas al examinador. Te pide que imagines cada situación antes de responder.",
  "groups": [
    {
      "group": 1,
      "question": "Un maestro te pide repetir un ejercicio que nunca has visto. La explicación queda a medias y no puedes consultarle de inmediato. A tu lado hay otros discípulos con la misma duda. ¿Cómo empiezas?",
      "options": [
        {
          "position": "A",
          "id": "U_INTERVENCION_REVERSIBLE",
          "text": "Hago sólo el comienzo del ejercicio. Atiendo a lo que ocurre y cambio la manera de hacerlo si no responde como esperaba."
        },
        {
          "position": "B",
          "id": "U_CRITERIO_SUFICIENTE",
          "text": "Busco qué señal confirma que el ejercicio funciona. Antes de gastar mis fuerzas, fijo hasta dónde intentarlo con lo que sé."
        },
        {
          "position": "C",
          "id": "U_POSIBILIDADES_CONTRASTADAS",
          "text": "Propongo dos maneras de empezar y escucho qué ven los demás. Intento una, dejando pendiente cómo seguir según lo que ocurra."
        }
      ]
    },
    {
      "group": 2,
      "question": "En una casa de discípulos, varios esperan unas provisiones que te comprometiste a llevar. No logras acomodar los bultos en el carro disponible; aún queda tiempo para otro intento. ¿Qué haces?",
      "options": [
        {
          "position": "A",
          "id": "O_SOSTEN_REORGANIZADO",
          "text": "Reparto la carga de otra manera y ajusto las entregas con quienes esperan. Reservo lo necesario para cumplir también la última."
        },
        {
          "position": "B",
          "id": "O_CAMINO_ALTERNATIVO",
          "text": "Hago un primer trayecto con una parte de los bultos. Según cómo resulte, cambio la forma de organizar y llevar el resto."
        },
        {
          "position": "C",
          "id": "O_ESFUERZO_CONCENTRADO",
          "text": "Dejo para después los recados que no hacen falta y me pongo a resolver cómo acomodar los bultos, sin agotar los medios del viaje."
        }
      ]
    },
    {
      "group": 3,
      "question": "Durante una tarea común, falta quien debía dar las instrucciones. Los demás te piden que decidas, pero no todos podrán asumir lo mismo. La tarea puede hacerse de varias maneras. ¿Qué les dices?",
      "options": [
        {
          "position": "A",
          "id": "R_DECISION_RESPALDADA",
          "text": "Empecemos por esta parte. Me haré cargo de repartir las tareas según lo que cada uno pueda hacer y de reunir lo necesario."
        },
        {
          "position": "B",
          "id": "R_COMPROMISO_DELIMITADO",
          "text": "Puedo responder por esta parte hasta terminarla. Acordemos qué necesita cada uno y dejemos claro qué queda fuera de mi compromiso."
        },
        {
          "position": "C",
          "id": "R_ALTERNATIVA_COMPARTIDA",
          "text": "Antes de elegir, cuéntenme qué les supondría cada opción. Podemos preparar otra entre todos y cambiarla donde a alguien no le resulte posible."
        }
      ]
    },
    {
      "group": 4,
      "question": "Una copia de un manuscrito ha quedado incompleta y el original ya no está disponible. Conservas tus notas, pero la entrega acordada no podrá hacerse tal como estaba prevista. ¿Cómo continúas?",
      "options": [
        {
          "position": "A",
          "id": "L_REAPROVECHAMIENTO",
          "text": "Examino mis notas para darles otro uso. Intento trabajar con una parte, guardo las demás y cambio el procedimiento según lo que consiga."
        },
        {
          "position": "B",
          "id": "L_CORRECCION_ENFOCADA",
          "text": "Comparo la copia y mis notas hasta encontrar el fallo. Corrijo ese paso y rehago sólo el fragmento que puedo respaldar con ellas."
        },
        {
          "position": "C",
          "id": "L_RENUNCIA_CON_CRITERIO",
          "text": "Doy por cerrado lo que ya no puedo reconstruir con esas notas. Hablo con quien espera la entrega y cumplo lo que aún puedo ofrecer."
        }
      ]
    },
    {
      "group": 5,
      "question": "Imagina que un maestro te permite dirigir unas sesiones de práctica. Ahora puedes cambiar algo que antes sólo aceptabas, aunque dispones del mismo tiempo y de los mismos medios. ¿Por dónde comienzas?",
      "options": [
        {
          "position": "A",
          "id": "P_ALCANCE_CON_CONDICIONES",
          "text": "Primero decido qué puedo cambiar y qué conviene dejar como está. Lo pruebo y compruebo si se mantiene dentro de esos límites."
        },
        {
          "position": "B",
          "id": "P_DESARROLLO_COMPARTIDO",
          "text": "Invito a varios discípulos a intentar ejercicios que antes no podíamos preparar. Hacemos una primera sesión juntos y dejamos abiertas otras maneras de continuar."
        },
        {
          "position": "C",
          "id": "P_CAMBIO_POR_ETAPAS",
          "text": "Empiezo por el cambio que más urge, en una sola sesión. Reservo lo necesario para las siguientes y ajusto el plan según cómo salga."
        }
      ]
    }
  ],
  "normalizationSha256": "8abfa7c7e81e9a9ed5a7886d8f8a17082d3d004034c1d2c31926e2c69a235b60"
});
const ROOT_SOURCE_HASHES=freeze({"SEMANTIC_MODEL_CURRENT.json": "2592a6a8f7957dceded4c5de8d9a62155d2995f7113ac9523069c4cabd3d0ed5", "NARRATIVE_REV1.json": "b2ffad904a7997b6838210cfaf90061fa4c4923e78b0ad1afe70d4d656c01162"});

export { ROOT_MODEL, ROOT_NARRATIVE, ROOT_SOURCE_HASHES };
