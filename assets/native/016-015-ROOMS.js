const ROOMS = {
  "patio_raices": {
    "id": "patio_raices",
    "area": "acceso",
    "name": "Patio de las Raíces",
    "desc": "Un patio de piedra se abre alrededor de la Piedra de las Raíces. Una mesa baja ocupa uno de los lados y un arco de madera marca la salida hacia el norte. El espacio está dispuesto para recibir aspirantes, registrar resultados y separar a quienes continúan hacia el interior de la secta.",
    "scenery": {
  "piedra": "Una losa gris, lisa y fría ocupa el centro del patio; su superficie muestra el desgaste de innumerables manos.",
  "marcas": "Huellas de palmas, humedad y polvo se acumulan sobre la piedra y alrededor de su base.",
  "mesa": "Tinta, tablillas y registros provisionales ocupan la mesa utilizada durante los ingresos.",
  "arco": "Un arco de madera delimita la salida norte y separa el patio de los espacios reservados a quienes ya han sido admitidos."
},
    "exits": {
      "norte": "descansillo"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "normal"
  },
  "descansillo": {
    "id": "descansillo",
    "area": "acceso",
    "name": "Descansillo de Piedra",
    "desc": "Una plataforma de losas grises interrumpe la pendiente y reparte el paso antes de que el camino se cierre entre los pinos. No tiene la solemnidad de una puerta ni la comodidad de un patio: es un lugar de transición, con bancos bajos, marcas de botas y espacio suficiente para ordenar las pocas pertenencias con las que llega un aspirante.",
    "scenery": {
  "losas": "La piedra muestra bordes gastados y líneas claras donde incontables suelas barrieron el polvo.",
  "bancos": "Dos bancos de madera descansan contra el muro de contención. Están hechos para esperar o ajustar el equipo, no para instalarse.",
  "muro": "Bloques desnudos contienen la ladera. Entre sus juntas crecen hebras de musgo y pequeñas raíces.",
  "pendiente": "Desde aquí se percibe con claridad que el ascenso continúa: la montaña aún no ha concedido ninguna llegada."
},
    "exits": {
      "sur": "patio_raices",
      "este": "mirador_niebla",
      "oeste": "patio_practica",
      "norte": "sendero_pinos"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "pobre"
  },
  "mirador_niebla": {
    "id": "mirador_niebla",
    "area": "acceso",
    "name": "Mirador de la Niebla",
    "desc": "Una baranda de piedra mira hacia el mundo mortal. Muy abajo, los caminos son hilos oscuros entre campos apagados y tejados minúsculos. La niebla sube por la ladera sin prisa; aquí el qi es débil, pero circula limpio y constante.",
    "scenery": {
  "valle": "Desde aquí ya no distingues tu casa, tu calle ni la academia: sólo manchas de tierra y humo. La montaña vuelve pequeño todo lo que todavía pesa.",
  "niebla": "Cruza la baranda y se deshace alrededor de tus manos. Entre una ráfaga y otra percibes un ritmo respirable.",
  "baranda": "La piedra está pulida por aspirantes que necesitaron detenerse un momento antes de seguir subiendo."
},
    "exits": {
      "oeste": "descansillo"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "normal"
  },
  "patio_practica": {
    "id": "patio_practica",
    "area": "acceso",
    "name": "Patio de Práctica",
    "desc": "Un rectángulo de tierra apisonada se abre contra la ladera, cercado por postes sencillos y un cobertizo estrecho. Surcos de pies, golpes en la madera y remiendos recientes muestran que aquí se aprende antes de entrar de lleno en la vida de la secta. Nada en el lugar busca impresionar: todo está hecho para resistir errores.",
    "scenery": {
  "suelo": "La tierra está compactada por pasos repetidos. Algunas huellas forman círculos torpes; otras terminan en largas marcas de arrastre.",
  "postes": "Maderos de distinto grosor presentan abolladuras, astillas y vendas de cuerda donde la superficie se abrió.",
  "cobertizo": "Bajo el techo se guardan piezas de entrenamiento, paños y herramientas de reparación. No hay objetos ceremoniales.",
  "marcas": "Pequeñas líneas de cal delimitan posiciones y distancias de práctica, borradas y rehechas muchas veces."
},
    "exits": {
      "este": "descansillo"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "pobre"
  },
  "sendero_pinos": {
    "id": "sendero_pinos",
    "area": "acceso",
    "name": "Sendero de los Pinos",
    "desc": "El paso se estrecha entre pinos viejos cuyas raíces levantan la tierra y obligan a mirar dónde se pisa. La senda conserva señales de uso constante sin llegar a parecer una vía principal: piedra, agujas secas y pequeños escalones hechos donde la pendiente lo exige. La presencia de la secta empieza a sentirse más en el cuidado del camino que en cualquier adorno.",
    "scenery": {
  "pinos": "Los troncos crecen inclinados hacia fuera de la ladera. Las ramas más bajas han sido podadas para mantener libre el paso.",
  "raices": "Cruzan la senda como nudillos oscuros. Algunas fueron rebajadas con herramientas; otras obligan a levantar el pie.",
  "escalones": "Bloques irregulares completan los tramos más empinados. Ninguno parece pertenecer a la misma obra.",
  "agujas": "Una capa de agujas secas amortigua los pasos y guarda pequeñas manchas de resina."
},
    "exits": {
      "sur": "descansillo",
      "norte": "camino"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "camino": {
    "id": "camino",
    "area": "acceso",
    "name": "Camino de la Montaña",
    "desc": "Los escalones de piedra suben entre pinos torcidos. A ambos lados, la niebla tapa la montaña y arriba las nubes se tragan el camino. Más abajo queda todo lo que conocías; aquí parece empezar la fila de los que llegaron con poco y esperaban mucho. La hierba crece entre las piedras del borde allí donde el tránsito deja algo de espacio.",
    "scenery": {
  "escalones": "Están tallados a pico, uno por cada discípulo de otra era, dicen. Algunos están torcidos, otros parecen hechos con prisa y unos cuantos tienen golpes secos en los bordes, como si quien los talló estuviera enfadado con la piedra.",
  "pinos": "Los pinos se agarran a la roca con las raíces al descubierto. El viento no los dobló: los torció.",
  "hierba": "La hierba se aprieta entre piedras y raíces, más alta en los bordes donde casi nadie pisa."
},
    "exits": {
      "sur": "sendero_pinos",
      "norte": "puerta"
    },
    "items": [
      "anillo"
    ],
    "mobs": [],
    "npcs": [],
    "vena": "pobre"
  },
  "puerta": {
    "id": "puerta",
    "area": "acceso",
    "name": "Puerta Roja",
    "desc": "Dos hojas de madera teñida de rojo ocupan el paso entre muros de piedra oscura. El color está gastado en bordes y travesaños, pero la puerta conserva una gravedad que el camino no tenía: cruzarla significa dejar de ser alguien que simplemente sube la montaña. Más allá comienza el espacio administrado de la Grulla Blanca.",
    "scenery": {
  "hojas": "La madera es gruesa, reforzada con bandas de hierro ennegrecido. El rojo no brilla; ha sido renovado tantas veces que forma capas visibles en las grietas.",
  "clavos": "Cabezas de hierro cuadradas sujetan los refuerzos. Algunas llevan pequeñas marcas de inspección.",
  "muros": "La piedra encaja sin ornamentación. No es una muralla de guerra, sino una frontera hecha para durar.",
  "umbral": "El desgaste del suelo forma una franja pálida bajo las hojas. Miles de pasos atravesaron exactamente el mismo punto."
},
    "exits": {
      "sur": "camino",
      "norte": "registro"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "normal"
  },
  "registro": {
    "id": "registro",
    "area": "acceso",
    "name": "Vestíbulo del Registro",
    "desc": "Un vestíbulo sobrio recibe a quienes han cruzado la Puerta Roja. Mesas estrechas, estantes de tablillas y cajas numeradas convierten la llegada en un procedimiento: nombres, procedencias, asignaciones y pertenencias deben ocupar su sitio antes de que alguien pueda llamarse miembro de la secta. El aire parece más quieto aquí, como si hasta el qi respetara el orden de los registros.",
    "scenery": {
  "mesas": "Superficies largas y sin adornos, manchadas de tinta en los bordes donde se apoyan los pinceles.",
  "tablillas": "Filas de madera fina esperan nombres, notas y sellos. Algunas están recién lijadas; otras muestran correcciones raspadas.",
  "cajas": "Cajones bajos llevan números y caracteres de clasificación. Nada indica qué contienen sin conocer el sistema.",
  "sellos": "Varios sellos descansan en soportes de piedra junto a almohadillas de tinta oscura. Su uso parece más importante que su aspecto."
},
    "exits": {
      "sur": "puerta",
      "norte": "sala_jade"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "muerta"
  },
  "patio": {
    "id": "patio",
    "area": "secta_exterior",
    "name": "Patio de los Discípulos Externos",
    "desc": "Un patio amplio articula la vida de la Secta Exterior. Desde aquí se distribuyen los caminos hacia los dormitorios, los servicios y el sector de práctica, mientras el tránsito deja una mezcla constante de pasos, voces contenidas y tareas que cambian de manos. La arquitectura es sencilla pero cuidada: piedra barrida, aleros reparados y espacios pensados para que mucha gente pueda convivir sin confundirse.",
    "scenery": {
  "pavimento": "Grandes losas forman una superficie desigual pero limpia. Las juntas han sido rellenadas tantas veces que muestran distintos tonos de mortero.",
  "aleros": "Los tejados bajos rodean parte del patio y ofrecen resguardo sin convertir el lugar en un corredor cerrado.",
  "canales": "Canaletas poco profundas conducen el agua hacia los bordes del recinto. Están libres de hojas y sedimentos.",
  "marcas": "Pequeños símbolos pintados en postes y esquinas orientan hacia servicios, dormitorios y práctica sin necesidad de carteles grandes."
},
    "exits": {
      "sur": "sala_jade",
      "oeste": "patio_cabanas",
      "este": "patio_servicios",
      "norte": "patio_campana"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "normal"
  },
  "sala_jade": {
    "id": "sala_jade",
    "area": "secta_exterior",
    "name": "Sala del Jade",
    "desc": "Un recinto silencioso sirve de umbral entre el registro de los recién llegados y la vida cotidiana de la secta. El aire huele a piedra fría y cera vieja. Un muro monumental de jade verde oliva domina la sala, cubierto por miles de nombres tallados con una paciencia que vuelve insignificante a cualquier visitante individual. Entre las hileras regulares, una irregularidad rompe por un instante la continuidad de la superficie.",
    "scenery": {
  "muro": "Miles de caracteres recorren el jade en hileras disciplinadas. Algunos conservan un barniz dorado que señala ascensos o reconocimientos; la mayoría permanece sobria, parte de una memoria demasiado grande para destacar a todos.",
  "nombres": "Hay generaciones enteras comprimidas en la piedra: caracteres nítidos, otros suavizados por restauraciones y algunos casi absorbidos por vetas del propio jade.",
  "tajo": "Entre las inscripciones, un nombre fue atravesado por un corte profundo e irregular. El surco rompe la superficie pulida y borra parte de los caracteres de Shen Liang sin borrar del todo que estuvieron allí.",
  "cera": "Pequeñas acumulaciones endurecidas junto al muro revelan antiguos trabajos de iluminación y mantenimiento. No forman un altar.",
  "suelo": "La piedra frente al muro está más pulida que el resto, como si muchas personas se hubieran detenido allí antes de seguir."
},
    "exits": {
      "sur": "registro",
      "norte": "patio"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_cabanas": {
    "id": "patio_cabanas",
    "area": "secta_exterior",
    "name": "Patio de Cabañas",
    "desc": "Un patio menor distribuye las dependencias residenciales de los discípulos externos. Cabañas bajas, tendederos discretos y pasos cubiertos hacen que el lugar se sienta utilizado sin caer en el desorden. Aquí la secta deja de parecer una institución abstracta y se vuelve un sitio donde la gente guarda ropa, comparte espacio y aprende a vivir con poco.",
    "scenery": {
  "cabanas": "Construcciones de madera oscura y piedra baja se alinean sin lujo. Las reparaciones no coinciden entre sí, prueba de años de uso.",
  "tendederos": "Cuerdas tensadas entre postes sostienen paños, vendas y prendas sencillas. No bloquean los pasos.",
  "canal": "Una acequia estrecha recoge agua de lavado y lluvia, separada de las zonas de tránsito.",
  "tablillas": "Pequeñas placas numeradas identifican dormitorios y dependencias comunes sin nombres personales."
},
    "exits": {
      "este": "patio",
      "oeste": "corredor_cabanas",
      "norte": "comedor_externos",
      "sur": "sala_comun_externos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "corredor_cabanas": {
    "id": "corredor_cabanas",
    "area": "secta_exterior",
    "name": "Corredor de Cabañas",
    "desc": "Un corredor cubierto enlaza las dependencias más estrechas del sector residencial. El piso de madera cruje en algunos tramos y ha sido reforzado con piezas de distinto tono. Puertas sencillas, ganchos para ropa húmeda y bancos pegados a la pared hablan de un espacio pensado para circular, no para detenerse demasiado.",
    "scenery": {
  "piso": "Las tablas tienen zonas pulidas por el paso y pequeños parches donde la madera fue sustituida.",
  "puertas": "No llevan adornos, solo números y marcas de asignación.",
  "ganchos": "Clavijas de madera sostienen capas, toallas y algún cinturón de entrenamiento.",
  "bancos": "Asientos estrechos permiten calzarse o esperar sin obstruir el corredor."
},
    "exits": {
      "este": "patio_cabanas",
      "oeste": "dormitorio_externos",
      "sur": "lavadero_externos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "dormitorio_externos": {
    "id": "dormitorio_externos",
    "area": "secta_exterior",
    "name": "Dormitorio de Externos",
    "desc": "Filas ordenadas de camas estrechas ocupan un dormitorio colectivo donde cada discípulo dispone de poco más que un colchón, un arcón y algunos ganchos. La austeridad no llega al abandono: las mantas están remendadas, el suelo limpio y los espacios medidos para que nadie pueda apropiarse de mucho más de lo necesario. Dormir aquí es aceptar que la vida en la secta también consiste en compartir límites.",
    "scenery": {
  "camas": "Estructuras de madera resistentes y casi idénticas. Los remiendos de algunas patas revelan reparaciones repetidas.",
  "arcones": "Cada cama tiene un arcón bajo con cierre simple. La madera está marcada con números de asignación.",
  "mantas": "Tejidos gruesos de color apagado, lavados tantas veces que las fibras se han vuelto suaves.",
  "ganchos": "Unos pocos ganchos por plaza obligan a mantener el equipo reducido y ordenado."
},
    "exits": {
      "este": "corredor_cabanas"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "Dormitorio de Externos",
      "inicio": "Encuentras una cama asignada entre las filas del dormitorio. El espacio es austero, pero suficiente para descansar sin abandonar la seguridad de la Secta Exterior.",
      "purifica": true
    }
  },
  "sala_comun_externos": {
    "id": "sala_comun_externos",
    "area": "secta_exterior",
    "name": "Sala Común de Externos",
    "desc": "Una sala amplia ofrece a los discípulos externos un lugar donde sentarse, reparar equipo menor, leer notas o conversar sin ocupar los patios de tránsito. Mesas compartidas y bancos de distinta procedencia muestran una convivencia práctica, construida más por necesidad que por ceremonia. Las paredes conservan arañazos, cuentas y pequeñas marcas que nadie se ha molestado en borrar del todo.",
    "scenery": {
  "mesas": "Tableros robustos con manchas de tinta, cera y resina. Algunas esquinas están redondeadas por el uso.",
  "bancos": "No forman un juego uniforme; parecen haber sido añadidos y reparados según hacía falta.",
  "paredes": "Entre reparaciones de yeso sobreviven pequeñas marcas de conteo y dibujos casi borrados.",
  "estante": "Un estante común reúne cordeles, agujas gruesas, trozos de papel y objetos sin dueño claro."
},
    "exits": {
      "norte": "patio_cabanas",
      "oeste": "lavadero_externos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "lavadero_externos": {
    "id": "lavadero_externos",
    "area": "secta_exterior",
    "name": "Lavadero de Externos",
    "desc": "Pilones de piedra y canales bajos convierten esta dependencia en un lugar de trabajo repetitivo y necesario. El suelo está pensado para evacuar agua y las paredes muestran manchas claras donde la humedad ha secado una y otra vez. No hay nada espiritual en mantener limpias las vendas y la ropa, y precisamente por eso el lavadero parece una pieza honesta de la vida cotidiana.",
    "scenery": {
  "pilones": "Grandes recipientes de piedra con bordes pulidos por manos y telas mojadas.",
  "canales": "Surcos en el suelo conducen el agua usada hacia una salida protegida por una rejilla.",
  "cuerdas": "Varios cordeles permiten escurrir prendas antes de llevarlas a los tendederos exteriores.",
  "jabon": "Pastillas ásperas de jabón vegetal descansan en una caja perforada para que no se deshagan en agua estancada."
},
    "exits": {
      "norte": "corredor_cabanas",
      "este": "sala_comun_externos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "comedor_externos": {
    "id": "comedor_externos",
    "area": "secta_exterior",
    "name": "Comedor de Externos",
    "desc": "Mesas largas ocupan un comedor hecho para alimentar a muchos sin ceremonia. La madera está marcada por cuencos calientes, cucharas y años de codos apoyados en los mismos lugares. El espacio comunica directamente con la cocina y conserva el olor persistente de grano cocido, verduras, caldo y humo limpio.",
    "scenery": {
  "mesas": "Tableros largos con bancos corridos. Las zonas centrales están más gastadas por el paso constante de recipientes.",
  "cuencos": "Pilas de cerámica sencilla esperan junto a una mesa auxiliar. Las piezas desparejadas han sobrevivido a distintas hornadas.",
  "pared": "Una superficie encalada lleva manchas tenues de vapor pese a las limpiezas.",
  "ventanilla": "Una abertura ancha comunica con la cocina y permite servir sin invadir la zona de preparación."
},
    "exits": {
      "sur": "patio_cabanas",
      "este": "cocina_comunal"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "cocina_comunal": {
    "id": "cocina_comunal",
    "area": "secta_exterior",
    "name": "Cocina Comunal",
    "desc": "Fogones de piedra, grandes ollas y superficies de corte ocupan una cocina diseñada para volumen antes que delicadeza. Los utensilios cuelgan por tamaño y función; sacos de grano y cestas de vegetales permanecen separados del área de fuego. El orden del lugar recuerda que alimentar a la Secta Exterior es un trabajo continuo, no una escena doméstica.",
    "scenery": {
  "fogones": "Varias bocas de fuego comparten una base de piedra ennegrecida. Los conductos superiores arrastran el humo fuera del recinto.",
  "ollas": "Recipientes de hierro y cerámica gruesa capaces de alimentar a una sala entera.",
  "utensilios": "Cucharones, cuchillos y coladores cuelgan de barras marcadas para que cada pieza regrese a su sitio.",
  "despensa_menor": "Estantes inmediatos guardan sal, aceite y cantidades de uso diario; las reservas principales no están aquí."
},
    "exits": {
      "oeste": "comedor_externos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_servicios": {
    "id": "patio_servicios",
    "area": "secta_exterior",
    "name": "Patio de Servicios",
    "desc": "Este patio reúne la parte menos ceremonial de la Secta Exterior: encargos, depósitos, administración cotidiana y caminos hacia las zonas de trabajo. Carretillas, tablones de aviso y marcas de carga conviven con un tránsito constante de personas que llevan algo de un sitio a otro. La secta se sostiene aquí en listas, manos ocupadas y tareas que casi nunca merecen una historia.",
    "scenery": {
  "carretillas": "Varias permanecen apoyadas contra un muro, con ruedas reparadas y mangos pulidos por el uso.",
  "marcas": "Rayas de tiza y pintura en el suelo reservan espacios para cargas, devoluciones y materiales en tránsito.",
  "aleros": "Cobertizos abiertos protegen mercancías temporales sin convertir el patio en almacén.",
  "avisos": "Pequeñas notas administrativas indican entregas, turnos y tareas sin formar parte del tablón principal de encargos."
},
    "exits": {
      "oeste": "patio",
      "norte": "oficina_servicios",
      "este": "tablon_encargos",
      "sur": "camino_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "oficina_servicios": {
    "id": "oficina_servicios",
    "area": "secta_exterior",
    "name": "Oficina de Servicios",
    "desc": "Mesas de registro, casilleros y estantes de formularios llenan una oficina pequeña donde el trabajo de la secta se convierte en asignaciones concretas. El mobiliario obliga a separar solicitudes, entregas y asuntos pendientes antes de que alguien pueda considerarlos resueltos. Todo sugiere una burocracia modesta, pero suficientemente rigurosa para que nadie pueda fingir que una tarea desapareció.",
    "scenery": {
  "casilleros": "Compartimentos rotulados separan solicitudes, materiales entregados y registros por revisar.",
  "formularios": "Hojas y tablillas siguen formatos repetidos: nombre, tarea, responsable, resultado.",
  "mesa": "La superficie principal tiene marcas de tinta y una zona limpia reservada para sellos.",
  "sellos": "Sellos administrativos de uso corriente descansan en una bandeja; ninguno parece ceremonial."
},
    "exits": {
      "sur": "patio_servicios",
      "este": "deposito_comun"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "tablon_encargos": {
    "id": "tablon_encargos",
    "area": "secta_exterior",
    "name": "Tablón de Encargos",
    "desc": "Un gran tablón protegido por un alero reúne trabajos cotidianos de la Secta Exterior. Papeles, tablillas delgadas y fichas reutilizables se ordenan por tipo de tarea y urgencia, dejando claro que la mayor parte de la vida sectaria consiste en resolver necesidades pequeñas antes de que se vuelvan grandes. Los encargos cambian; el sistema que los sostiene permanece.",
    "scenery": {
  "tablon": "Madera oscurecida por clavos y reparaciones. Las zonas más usadas tienen tantas perforaciones que parecen una trama.",
  "avisos": "Cada aviso sigue una estructura simple: tarea, lugar, requisito y forma de informar el resultado.",
  "fichas": "Pequeñas piezas de madera reutilizables marcan encargos rutinarios que no merecen gastar papel.",
  "alero": "Un techo corto protege los avisos de la lluvia y obliga a acercarse para leerlos."
},
    "exits": {
      "oeste": "patio_servicios",
      "norte": "deposito_comun",
      "este": "sendero_produccion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "deposito_comun": {
    "id": "deposito_comun",
    "area": "secta_exterior",
    "name": "Depósito Común",
    "desc": "Estanterías robustas dividen un depósito dedicado a materiales de uso cotidiano: cuerda, recipientes, repuestos, tejidos, herramientas menores y reservas asignadas a servicios internos. Cada sección está marcada y casi todo se cuenta por unidades o lotes. La austeridad del lugar no proviene de la escasez, sino de una vigilancia constante sobre lo que entra y sale.",
    "scenery": {
  "estanterias": "Madera gruesa reforzada con escuadras. Los estantes bajos soportan las cargas más pesadas.",
  "etiquetas": "Tablillas colgantes indican categoría y cantidad esperada, con números corregidos muchas veces.",
  "cajas": "Contenedores cerrados protegen objetos pequeños que serían fáciles de extraviar.",
  "registro": "Una tabla de movimientos permite anotar retiros y devoluciones sin depender de la memoria."
},
    "exits": {
      "oeste": "oficina_servicios",
      "sur": "tablon_encargos",
      "norte": "casa_guardia"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "casa_guardia": {
    "id": "casa_guardia",
    "area": "secta_exterior",
    "name": "Casa de Guardia",
    "desc": "Una dependencia compacta sirve de apoyo a quienes controlan accesos, incidentes y rondas de la zona exterior. Hay bancos, soportes para equipo y un escritorio de incidencias, pero nada que sugiera cuarteles permanentes. Desde aquí la disciplina se siente como vigilancia práctica: saber quién pasó, qué ocurrió y qué necesita atención.",
    "scenery": {
  "escritorio": "Un mueble estrecho con hojas de incidencia, tinta y un cajón cerrado para documentos recientes.",
  "soportes": "Perchas y bastidores permiten dejar capas, bastones y equipo de guardia sin amontonarlo.",
  "banco": "Un asiento largo ocupa la pared principal. Está pensado para esperas breves.",
  "registro": "Las anotaciones se organizan por hechos y lugares, no por rumores ni opiniones."
},
    "exits": {
      "sur": "deposito_comun"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sendero_produccion": {
    "id": "sendero_produccion",
    "area": "secta_exterior",
    "name": "Sendero de Producción",
    "desc": "El suelo cambia de losas a tierra compactada mientras la Secta Exterior cede espacio a dependencias de trabajo. Huellas de ruedas, marcas de carga y pequeños desvíos para peatones revelan un tránsito más pesado que en los patios residenciales. El aire trae rastros de madera cortada, metal y materiales almacenados más adelante.",
    "scenery": {
  "rodadas": "Surcos paralelos muestran el paso repetido de carros y cargas pesadas.",
  "bordes": "Piedras colocadas a intervalos mantienen libre una franja para quienes caminan.",
  "postes": "Señales simples marcan la transición hacia la zona de Producción.",
  "suelo": "La tierra ha sido compactada y rellenada en los puntos donde el agua podría formar barro."
},
    "exits": {
      "oeste": "tablon_encargos",
      "este": "produccion_portico_oeste"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "camino_valle": {
    "id": "camino_valle",
    "area": "secta_exterior",
    "name": "Camino del Valle",
    "desc": "Una vía descendente abandona la concentración de edificios y abre la vista hacia terrenos más amplios de la montaña. El camino está mantenido para tránsito regular, con bordes despejados y drenajes sencillos, pero conserva la sensación de salir del espacio protegido de la secta hacia una red territorial mayor. A cada tramo, las construcciones quedan más atrás.",
    "scenery": {
  "camino": "Piedra y tierra compactada alternan según la pendiente. Los tramos más expuestos han sido reforzados.",
  "drenajes": "Canales laterales impiden que el agua corte la vía en los descensos.",
  "mojones": "Pequeñas piedras marcadas señalan distancias y límites administrativos.",
  "vista": "Entre los árboles se abren perspectivas del valle y de caminos que ya no pertenecen a un único recinto."
},
    "exits": {
      "norte": "patio_servicios",
      "sur": "valle_camino_alto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_campana": {
    "id": "patio_campana",
    "area": "secta_exterior",
    "name": "Patio de la Campana",
    "desc": "Una campana de bronce suspendida bajo un armazón de madera da identidad a este patio, punto de distribución hacia los espacios de práctica y disciplina. El suelo está despejado y las paredes cercanas apenas llevan adornos, como si todo alrededor estuviera pensado para que una señal pudiera imponerse sobre cualquier actividad. La campana organiza; no decora.",
    "scenery": {
  "campana": "Bronce oscuro con un borde más claro por el desgaste. No lleva una inscripción extensa, solo marcas de fundición y mantenimiento.",
  "armazon": "Vigas gruesas sostienen la campana sin cubrirla por completo. Las uniones han sido revisadas muchas veces.",
  "mazo": "Un tronco suspendido por cuerdas permite golpear la campana sin acercarse demasiado al metal.",
  "suelo": "La zona alrededor del armazón permanece especialmente despejada, sin bancos ni objetos que obstaculicen el paso."
},
    "exits": {
      "sur": "patio",
      "este": "patio_marcial",
      "oeste": "plazoleta_occidental",
      "norte": "corredor_norte"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_marcial": {
    "id": "patio_marcial",
    "area": "secta_exterior",
    "name": "Patio Marcial",
    "desc": "Un patio abierto concentra la práctica física de los discípulos externos. Líneas pintadas, postes de impacto y zonas de espera ordenan ejercicios individuales y por parejas; la disposición favorece la práctica disciplinada antes que el espectáculo. Las huellas de uso son abundantes, pero también lo es el mantenimiento: aquí se espera que cada error deje aprendizaje, no ruinas.",
    "scenery": {
  "lineas": "Trazos de cal dividen espacios de práctica y distancias de seguridad. Algunas se superponen a marcas más antiguas.",
  "postes": "Maderos de impacto presentan vendajes de cuerda y reparaciones donde la fibra se abrió.",
  "armarios": "Gabinetes laterales guardan equipo común de práctica y materiales de reparación.",
  "suelo": "Tierra firme mezclada con grava fina ofrece agarre sin volverse barro con facilidad."
},
    "exits": {
      "oeste": "patio_campana",
      "este": "sala_formas",
      "norte": "pabellon_disciplina"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sala_formas": {
    "id": "sala_formas",
    "area": "secta_exterior",
    "name": "Sala de Formas",
    "desc": "Una sala rectangular ofrece un espacio controlado para repetir posturas, desplazamientos y secuencias sin las distracciones del patio. Marcas en el suelo indican ejes y posiciones, mientras espejos de metal pulido ocupan algunos tramos de pared sin llegar a devolver una imagen perfecta. El lugar favorece la corrección paciente por encima de la fuerza.",
    "scenery": {
  "marcas": "Líneas rectas y círculos discretos ayudan a comprobar distancia, orientación y colocación de los pies.",
  "placas": "Placas de metal pulido reflejan siluetas deformadas pero suficientes para detectar posturas torcidas.",
  "paredes": "La superficie está casi desnuda, salvo por anotaciones breves sobre equilibrio y respiración.",
  "suelo": "Madera firme con reparaciones visibles en los puntos de mayor presión."
},
    "exits": {
      "oeste": "patio_marcial",
      "norte": "patio_respiracion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_respiracion": {
    "id": "patio_respiracion",
    "area": "secta_exterior",
    "name": "Patio de Respiración",
    "desc": "Un patio resguardado reduce el ruido del sector marcial sin aislarse por completo de él. Bancos bajos y losas separadas dejan espacios individuales suficientes para trabajar respiración y circulación sin convertir la práctica en retiro solemne. El aire se mueve con facilidad entre los muros, y el lugar parece construido para aprender a mantener un ritmo en medio de una institución que nunca se detiene.",
    "scenery": {
  "losas": "Piedras planas separadas a distancias regulares marcan lugares de práctica individual.",
  "bancos": "Asientos bajos permiten descansar entre ejercicios sin tumbarse.",
  "muros": "No llegan a cerrar el patio por completo; dejan pasar aire y sonidos amortiguados del sector marcial.",
  "inscripciones": "Frases breves recuerdan principios básicos de respiración y postura, sin técnicas avanzadas."
},
    "exits": {
      "sur": "sala_formas",
      "oeste": "pabellon_disciplina"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "pabellon_disciplina": {
    "id": "pabellon_disciplina",
    "area": "secta_exterior",
    "name": "Pabellón de Disciplina",
    "desc": "Un pabellón sobrio reúne registros de faltas, normas de convivencia y asuntos que requieren una respuesta formal. El espacio no parece diseñado para intimidar: mesas ordenadas, estantes de expedientes y asientos separados bastan para recordar que las acciones dentro de la secta dejan constancia. La disciplina aquí se presenta como procedimiento antes que como castigo.",
    "scenery": {
  "normas": "Tablillas visibles resumen obligaciones básicas, límites de conducta y canales de reclamación.",
  "expedientes": "Estantes cerrados contienen registros etiquetados por asunto y referencia administrativa, sin quedar expuestos a cualquiera.",
  "mesa": "La mesa principal deja espacio para escribir, escuchar y revisar documentos sin adornos ceremoniales.",
  "asientos": "Bancos individuales mantienen una distancia incómoda pero deliberada entre quienes esperan."
},
    "exits": {
      "sur": "patio_marcial",
      "este": "patio_respiracion",
      "oeste": "corredor_norte"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "corredor_norte": {
    "id": "corredor_norte",
    "area": "secta_exterior",
    "name": "Corredor Norte",
    "desc": "Un corredor más silencioso conecta el sector marcial con dependencias de disciplina y con la escalinata que conduce hacia ámbitos de mayor acceso restringido. La arquitectura sigue siendo exterior en materiales y austeridad, pero el tránsito disminuye y las señales se vuelven más formales. La proximidad de la Secta Interior se percibe antes de alcanzarla.",
    "scenery": {
  "columnas": "Pilares de madera oscura sostienen un alero continuo y muestran menos reparaciones improvisadas que en los sectores residenciales.",
  "suelo": "Las losas están mejor niveladas y casi no presentan marcas de carga.",
  "señales": "Tablillas sobrias indican disciplina, patio marcial y acceso interior sin prometer libre paso.",
  "baranda": "Una baranda baja acompaña el tramo donde el terreno comienza a elevarse hacia la escalinata."
},
    "exits": {
      "sur": "patio_campana",
      "este": "pabellon_disciplina",
      "norte": "escalinata_interior"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "escalinata_interior": {
    "id": "escalinata_interior",
    "area": "secta_exterior",
    "name": "Escalinata Interior",
    "desc": "Una escalinata ancha asciende hacia un umbral cuya sobriedad contrasta con el tránsito abierto de la Secta Exterior. Los peldaños están mejor tallados, los bordes más limpios y el espacio alrededor evita cualquier uso secundario. Desde abajo puede verse que el camino continúa, pero la mera existencia de la escalera no equivale a autorización para recorrerlo.",
    "scenery": {
  "peldaños": "Piedra clara cortada con una regularidad que no aparece en los caminos exteriores.",
  "pasamanos": "Madera oscura sin adornos acompaña los primeros tramos y desaparece antes del umbral.",
  "umbral": "La arquitectura superior es visible pero no se ofrece como una invitación.",
  "marcas": "Pequeñas señales institucionales recuerdan que el acceso depende de permiso, no de capacidad física para subir."
},
    "exits": {
      "sur": "corredor_norte",
      "norte": "interior_umbral_sur"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "plazoleta_occidental": {
    "id": "plazoleta_occidental",
    "area": "secta_exterior",
    "name": "Plazoleta Occidental",
    "desc": "Una plazoleta de tránsito reparte el movimiento entre el sector marcial y los senderos que conducen a Medicina y Jardines. No tiene una función propia dominante; su valor está en permitir que rutas distintas se crucen sin invadir los patios centrales. Macizos bajos, piedra barrida y señales discretas ayudan a separar cada flujo.",
    "scenery": {
  "macizos": "Plantas resistentes ocupan bordes protegidos sin convertir la plazoleta en jardín.",
  "señales": "Indicadores sencillos distinguen las rutas hacia Medicina, Jardines y el Patio de la Campana.",
  "pavimento": "Las losas muestran patrones de desgaste en varias direcciones, prueba del tránsito cruzado.",
  "canal": "Una línea de drenaje atraviesa un borde y desaparece bajo una rejilla de piedra."
},
    "exits": {
      "este": "patio_campana",
      "oeste": "sendero_medicina",
      "sur": "sendero_jardines"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sendero_medicina": {
    "id": "sendero_medicina",
    "area": "secta_exterior",
    "name": "Sendero de Medicina",
    "desc": "El camino hacia Medicina se vuelve más limpio y regular a medida que deja atrás la plazoleta. Hierbas aromáticas cultivadas en pequeñas franjas acompañan el paso sin formar todavía parte de los jardines medicinales propiamente dichos. El tránsito aquí parece más cuidadoso: menos cargas pesadas, más recipientes cerrados y superficies fáciles de mantener.",
    "scenery": {
  "franjas": "Pequeñas bandas de plantas resistentes perfuman el borde del camino y ayudan a sujetar la tierra.",
  "piedras": "El piso utiliza losas más lisas y juntas estrechas, fáciles de barrer y lavar.",
  "postes": "Señales de madera marcan la proximidad del recinto médico.",
  "canaletas": "Drenajes bien cubiertos evitan agua estancada junto al paso."
},
    "exits": {
      "este": "plazoleta_occidental",
      "oeste": "medicina_portico_este"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sendero_jardines": {
    "id": "sendero_jardines",
    "area": "secta_exterior",
    "name": "Sendero de Jardines",
    "desc": "La ruta hacia Jardines desciende entre muros bajos y parcelas cada vez más cuidadas. El terreno conserva tierra visible donde otras rutas usan piedra, y pequeñas conducciones de agua acompañan el borde sin interferir con el paso. Antes de alcanzar los bancales, el sendero ya anuncia que aquí el trabajo consiste en mantener vivo algo más que a uno mismo.",
    "scenery": {
  "muros": "Piedras bajas contienen la tierra de las parcelas y muestran musgo en las juntas más húmedas.",
  "canales": "Acequias estrechas llevan agua hacia zonas de cultivo más profundas.",
  "parcelas": "Franjas de suelo trabajado albergan plantas comunes y cubiertas vegetales, no recursos raros.",
  "herramientas": "Un soporte bajo reúne palas pequeñas y cestas de uso compartido para mantenimiento del sendero."
},
    "exits": {
      "norte": "plazoleta_occidental",
      "sur": "jardines_puerta_norte"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "medicina_portico_este": {
    "id": "medicina_portico_este",
    "area": "medicina",
    "name": "Pórtico de Medicina",
    "desc": "Un pórtico de madera clara y piedra lisa marca la entrada al pabellón médico sin convertirla en un acceso ceremonial. El suelo está mejor nivelado que en los senderos exteriores y los bordes permanecen despejados para facilitar el paso de personas, camillas y recipientes. Un olor tenue a hierbas secas y alcohol vegetal llega desde el interior.",
    "scenery": {
  "columnas": "Pilares sencillos sostienen el alero. La madera está limpia, pero conserva golpes de camillas y cajas en la parte baja.",
  "suelo": "Losas planas, juntas estrechas y ausencia de escalones innecesarios facilitan mover peso sin tropiezos.",
  "alero": "El techo sobresale lo suficiente para mantener seca la entrada y permitir esperas breves sin bloquear el acceso.",
  "señal": "Una tablilla sobria identifica el pabellón y recuerda mantener libre el paso."
},
    "exits": {
      "este": "sendero_medicina",
      "oeste": "patio_medicina"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_medicina": {
    "id": "patio_medicina",
    "area": "medicina",
    "name": "Patio de Medicina",
    "desc": "Un patio blanco de piedra distribuye el tránsito hacia recepción, tratamientos, anatomía y botica. Todo está dispuesto para reducir cruces innecesarios: corredores despejados, bancos pegados a los muros y puntos de lavado cerca de las entradas. La sensación general no es de silencio, sino de actividad contenida y bien organizada.",
    "scenery": {
  "pavimento": "La piedra clara muestra lavados repetidos y pequeñas reparaciones en las juntas.",
  "bancos": "Asientos bajos permiten esperar sin ocupar los corredores principales.",
  "lavatorios": "Recipientes de piedra con agua limpia se ubican junto a accesos de trabajo.",
  "carteles": "Indicaciones breves separan recepción, tratamientos y áreas técnicas sin saturar el patio."
},
    "exits": {
      "este": "medicina_portico_este",
      "norte": "recepcion_medicina",
      "oeste": "corredor_medicina",
      "sur": "botica"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "recepcion_medicina": {
    "id": "recepcion_medicina",
    "area": "medicina",
    "name": "Recepción del Pabellón",
    "desc": "Un mostrador largo recibe consultas, lesiones y solicitudes antes de que entren en las salas internas. Tablillas de registro, cintas de identificación y estantes abiertos permiten ordenar prioridades con la agilidad de un puesto de recepción, no con la pesadez de una oficina administrativa. El espacio está hecho para escuchar rápido, registrar lo necesario y enviar a cada persona donde corresponde.",
    "scenery": {
  "mostrador": "La madera tiene marcas de tinta, agua y dedos, pero se mantiene despejada en la zona de atención.",
  "tablillas": "Registros breves anotan nombre, motivo de ingreso y destino dentro del pabellón.",
  "cintas": "Tiras de tela de distintos tonos sirven para identificar casos y evitar confusiones entre pacientes.",
  "estantes": "Compartimentos abiertos guardan formularios, vendas limpias y útiles básicos de recepción."
},
    "exits": {
      "sur": "patio_medicina",
      "norte": "sala_recuperacion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sala_recuperacion": {
    "id": "sala_recuperacion",
    "area": "medicina",
    "name": "Sala de Recuperación",
    "desc": "Biombos bajos dividen una sala de descanso limpia y ventilada donde varias camas quedan separadas por el espacio suficiente para moverse sin molestarse. El mobiliario es austero, pero todo está pensado para que una persona herida pueda acostarse, beber agua y recuperarse sin quedar aislada del pabellón. La calma del lugar proviene del orden, no del lujo.",
    "scenery": {
  "camas": "Estructuras firmes con colchones delgados, sábanas limpias y mantas fáciles de cambiar.",
  "biombos": "Paneles de madera y tela ofrecen privacidad parcial sin impedir la vigilancia del conjunto.",
  "mesa_auxiliar": "Pequeñas mesas sostienen jarras, cuencos y materiales de uso inmediato.",
  "ventanas": "Aberturas altas dejan circular aire sin exponer directamente las camas al exterior."
},
    "exits": {
      "sur": "recepcion_medicina"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "sala_recuperacion",
      "inicio": "Te asignan una cama libre detrás de uno de los biombos. El pabellón permanece cerca, pero aquí hay suficiente calma y seguridad para dejar que el cuerpo se recupere."
    }
  },
  "corredor_medicina": {
    "id": "corredor_medicina",
    "area": "medicina",
    "name": "Corredor de las Salas",
    "desc": "Un corredor amplio enlaza las dependencias clínicas sin adornos innecesarios. Las paredes están encaladas, el piso permanece libre de obstáculos y cada puerta lleva una identificación sencilla. Todo favorece un tránsito rápido y ordenado incluso cuando varias personas necesitan cruzar el pabellón a la vez.",
    "scenery": {
  "paredes": "La cal clara facilita ver manchas y humedad. Los retoques recientes no se disimulan.",
  "puertas": "Cada acceso lleva una tablilla con la función de la sala, no con el nombre de una persona.",
  "piso": "Tablas y losas se alternan según la dependencia; los bordes están nivelados para evitar tropiezos.",
  "nichos": "Pequeños huecos guardan agua, vendas y útiles de limpieza sin invadir el paso."
},
    "exits": {
      "este": "patio_medicina",
      "norte": "sala_tratamientos",
      "oeste": "sala_anatomica"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sala_tratamientos": {
    "id": "sala_tratamientos",
    "area": "medicina",
    "name": "Sala de Tratamientos",
    "desc": "Varias mesas de atención ocupan una sala destinada a curaciones ordinarias, vendajes y procedimientos que no requieren aislamiento. Los instrumentos se distribuyen en bandejas, los recipientes se etiquetan y las superficies se limpian con una disciplina casi repetitiva. El lugar transmite oficio más que dramatismo.",
    "scenery": {
  "mesas": "Superficies de madera dura cubiertas por paños lavables y fáciles de sustituir.",
  "bandejas": "Instrumentos comunes se agrupan por uso, con piezas metálicas separadas de materiales absorbentes.",
  "armario": "Un gabinete cerrado guarda preparados y utensilios que no deben quedar al alcance de cualquiera.",
  "lavado": "Una pileta lateral permite limpiar manos e instrumentos entre procedimientos."
},
    "exits": {
      "sur": "corredor_medicina",
      "oeste": "consultorio_meridianos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "consultorio_meridianos": {
    "id": "consultorio_meridianos",
    "area": "medicina",
    "name": "Consultorio de Meridianos",
    "desc": "Una sala más recogida está preparada para examinar problemas que no se ven en una herida abierta. Camillas estrechas, diagramas corporales y piedras de pulso ocupan el espacio con la sobriedad de un consultorio. Aquí el cuerpo se estudia como una red de circulación que puede tensarse, bloquearse o desviarse.",
    "scenery": {
  "diagramas": "Láminas muestran trayectos de meridianos, cruces principales y zonas donde una lesión altera la circulación.",
  "piedras_pulso": "Piezas lisas de distinto tamaño sirven como apoyo para pruebas de sensibilidad y flujo.",
  "camilla": "Una estructura firme permite mantener al paciente inmóvil durante una revisión prolongada.",
  "estuche": "Un estuche compartimentado guarda agujas, hilos y pequeños instrumentos de diagnóstico."
},
    "exits": {
      "este": "sala_tratamientos",
      "norte": "archivo_clinico"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sala_anatomica": {
    "id": "sala_anatomica",
    "area": "medicina",
    "name": "Sala Anatómica",
    "desc": "Mesas de estudio, modelos articulados y láminas anatómicas convierten esta sala en un espacio de observación sistemática. No hay espectáculo en la disposición: cada herramienta existe para comparar, medir y reconocer estructuras antes de intervenir sobre ellas. En esta sala se realiza el Examen Espiritual, apoyado en la misma práctica de observación sistemática que guía el resto del trabajo anatómico.",
    "scenery": {
  "modelos": "Figuras de madera y arcilla representan articulaciones, órganos y trayectos internos con distintos niveles de detalle.",
  "laminas": "Dibujos anotados comparan anatomía común, lesiones y alteraciones asociadas al qi.",
  "mesas": "Superficies amplias permiten colocar muestras, instrumentos y registros sin mezclarlos.",
  "marcas": "Escalas y líneas de referencia facilitan medir tamaño, simetría y posición."
},
    "exits": {
      "este": "corredor_medicina",
      "oeste": "archivo_clinico"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivo_clinico": {
    "id": "archivo_clinico",
    "area": "medicina",
    "name": "Archivo Clínico",
    "desc": "Estantes cerrados y cajas numeradas guardan historiales de tratamientos, lesiones y observaciones acumuladas por el pabellón. La organización prioriza poder reconstruir qué ocurrió y qué se hizo, no preservar historias personales como reliquias. Algunos registros son recientes; otros usan formatos que ya no se emplean.",
    "scenery": {
  "estantes": "Módulos estrechos contienen cajas y legajos separados por tipo de registro.",
  "cajas": "Cada una lleva códigos de clasificación y referencias cruzadas que permiten relacionar historiales sin mezclar expedientes.",
  "mesa_consulta": "Una mesa aislada permite revisar documentos sin sacar más material del necesario.",
  "formatos_antiguos": "Entre los registros aparecen tablillas y formularios de estilos distintos, prueba de que el sistema cambió sin dejar de conservar datos."
},
    "exits": {
      "este": "sala_anatomica",
      "sur": "consultorio_meridianos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "botica": {
    "id": "botica",
    "area": "medicina",
    "name": "Botica del Pabellón",
    "desc": "Frascos, cajones y recipientes cerámicos cubren una botica orientada al uso clínico antes que al comercio. Los materiales se separan por estabilidad, preparación y riesgo, mientras una mesa central deja espacio para pesar, mezclar y entregar dosis sencillas. El olor combina raíces secas, resinas, alcoholes y papel.",
    "scenery": {
  "cajones": "Decenas de compartimentos llevan nombres y símbolos de advertencia para evitar confundir materiales parecidos.",
  "frascos": "Vidrio y cerámica protegen polvos, aceites y extractos; cada recipiente está claramente marcado.",
  "balanza": "Una balanza de brazos cortos permite medir cantidades pequeñas con mayor precisión que una cuchara.",
  "mesa": "La superficie central presenta manchas antiguas, pero ninguna mezcla queda abandonada sin etiquetar."
},
    "exits": {
      "norte": "patio_medicina",
      "sur": "laboratorio_alquimia",
      "este": "sendero_herbolario"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "laboratorio_alquimia": {
    "id": "laboratorio_alquimia",
    "area": "medicina",
    "name": "Laboratorio de Alquimia",
    "desc": "Hornos pequeños, mesas resistentes y estantes de ingredientes forman un laboratorio preparado para procesos controlados más que para demostraciones espectaculares. Cada puesto deja espacio para calentar, enfriar, mezclar y registrar resultados sin interferir con el siguiente. El aire conserva una mezcla difícil de separar entre minerales, hierbas y vapores de cocción.",
    "scenery": {
  "hornos": "Bocas de calor de distinto tamaño permiten ajustar procesos sin depender de una única llama.",
  "mesas": "Superficies de piedra y madera protegida soportan recipientes calientes y derrames menores.",
  "morteros": "Piezas de distintos materiales se reservan para sustancias que no conviene mezclar entre sí.",
  "registros": "Tablillas de trabajo permiten anotar cantidades, pulsos y resultados para repetir un procedimiento con criterio."
},
    "exits": {
      "norte": "botica",
      "oeste": "deposito_reactivos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "deposito_reactivos": {
    "id": "deposito_reactivos",
    "area": "medicina",
    "name": "Depósito de Reactivos",
    "desc": "Un depósito ventilado separa ingredientes y sustancias según estabilidad, compatibilidad y forma de almacenamiento. Cajas cerradas, estantes de piedra y recipientes sellados reducen la posibilidad de que un accidente pequeño se convierta en uno mayor. El orden aquí responde tanto a la logística como a la seguridad.",
    "scenery": {
  "estantes": "Piedra en las zonas de mayor riesgo, madera en los materiales secos y estables.",
  "sellos": "Tapas, cuerdas y lacres muestran si un recipiente fue abierto o manipulado.",
  "etiquetas": "Además del nombre, cada reactivo indica precauciones y condiciones básicas de conservación.",
  "arena": "Cajones de arena limpia permiten contener derrames sin extenderlos por el suelo."
},
    "exits": {
      "este": "laboratorio_alquimia",
      "sur": "sala_purificacion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sala_purificacion": {
    "id": "sala_purificacion",
    "area": "medicina",
    "name": "Sala de Purificación",
    "desc": "Cubas de lavado, bandejas minerales y superficies resistentes ocupan una sala destinada a retirar residuos, impurezas y contaminación de materiales antes de devolverlos al circuito de trabajo. El espacio combina procedimientos físicos y circulación de qi sin presentarlos como ritual. Todo está pensado para separar lo útil de lo que conviene descartar.",
    "scenery": {
  "cubas": "Recipientes de piedra reciben agua, soluciones de lavado o materiales que deben permanecer aislados.",
  "bandejas": "Capas de arena, carbón y minerales filtrantes se disponen en marcos fáciles de sustituir.",
  "canal": "Un desagüe protegido conduce residuos líquidos fuera de las zonas limpias del pabellón.",
  "marcas_qi": "Trazos discretos en el suelo ordenan la circulación durante procedimientos que requieren estabilizar energía."
},
    "exits": {
      "norte": "deposito_reactivos",
      "sur": "sotano_conductos_medicina"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sotano_conductos_medicina": {
    "id": "sotano_conductos_medicina",
    "area": "medicina",
    "name": "Sótano de los Conductos",
    "desc": "Un sótano técnico reúne conducciones de agua, desagües y canalizaciones antiguas que todavía prestan servicio al pabellón. Algunas tuberías han sido sustituidas y otras atraviesan muros más viejos que el acabado superior, pero el conjunto se presenta como infraestructura mantenida, no como ruina. En uno de los muros, un conducto antiguo alcanza una intervención de piedra de color distinto cuyas juntas lo separan de las reparaciones vecinas.",
    "scenery": {
  "conductos": "Canales de piedra y tuberías posteriores conviven en niveles distintos, unidos por reparaciones de varias épocas.",
  "valvulas": "Mecanismos simples permiten cortar o desviar agua hacia sectores concretos del pabellón.",
  "muro_reparado": "Piedra de color ligeramente distinto rodea el extremo de un conducto antiguo. Las juntas y el acabado lo distinguen de las reparaciones vecinas sin explicar por sí solos la función del tramo.",
  "humedad": "Manchas controladas señalan puntos de condensación y filtración que han sido marcados para mantenimiento."
},
    "exits": {
      "norte": "sala_purificacion",
      "abajo": "ala_med_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "jardines_puerta_norte": {
    "id": "jardines_puerta_norte",
    "area": "jardines",
    "name": "Puerta de los Jardines",
    "desc": "Una puerta amplia y sencilla marca el paso desde los senderos de la secta hacia una zona donde la tierra cultivada empieza a dominar sobre la piedra. El acceso está pensado para permitir el paso de cestas, herramientas y pequeños carros sin convertir los Jardines en un recinto aislado. A través de ella se perciben bancales, canales y estructuras de trabajo.",
    "scenery": {
  "hojas": "Dos hojas de madera ligera pueden mantenerse abiertas durante el trabajo sin estorbar el tránsito.",
  "umbral": "El suelo conserva tierra seca y marcas de ruedas pese a los barridos.",
  "cartel": "Una tablilla recuerda normas básicas de manejo, clasificación y limpieza de herramientas.",
  "cerca": "Muros bajos y cercos vegetales delimitan el área sin ocultarla."
},
    "exits": {
      "norte": "sendero_jardines",
      "sur": "patio_jardineros"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_jardineros": {
    "id": "patio_jardineros",
    "area": "jardines",
    "name": "Patio de los Jardineros",
    "desc": "Un patio de tierra firme distribuye herramientas, materiales y personas hacia las distintas parcelas de los Jardines. Cestas apiladas, bancos de trabajo y recipientes de riego ocupan los bordes, dejando libre el centro para mover cosechas sin mezclarlas. La organización es práctica y cambia según lo que entra o sale, pero nunca parece improvisada.",
    "scenery": {
  "cestas": "Recipientes de fibras distintas se separan por tamaño y uso para evitar mezclar cosechas.",
  "bancos": "Mesas bajas permiten limpiar raíces, reparar mangos y revisar herramientas.",
  "recipientes": "Tinajas y cubos se mantienen agrupados cerca de la salida hacia los canales.",
  "suelo": "La tierra ha sido compactada y reforzada con grava donde el tránsito es más intenso."
},
    "exits": {
      "norte": "jardines_puerta_norte",
      "oeste": "caseta_jardineros",
      "este": "almacen_jardines"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "caseta_jardineros": {
    "id": "caseta_jardineros",
    "area": "jardines",
    "name": "Caseta de los Jardineros",
    "desc": "Una caseta de madera ofrece descanso y almacenamiento personal a quienes trabajan de forma habitual en los Jardines. Camas estrechas, estantes de ropa y un pequeño espacio para comer convierten el interior en alojamiento funcional antes que en residencia cómoda. El olor de tierra, fibras vegetales y madera seca nunca desaparece del todo.",
    "scenery": {
  "camas": "Literas bajas con colchones sencillos y mantas gruesas ocupan una pared.",
  "estantes": "Tablas abiertas guardan ropa de trabajo, guantes, cuerdas y objetos personales modestos.",
  "mesa": "Una mesa común presenta marcas de cuchillos, tazas y reparaciones pequeñas.",
  "botas": "Calzado embarrado se deja junto a la entrada para no llenar de tierra el resto de la caseta."
},
    "exits": {
      "este": "patio_jardineros",
      "sur": "secadero_hierbas"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "caseta_jardineros",
      "inicio": "Te preparan una cama sencilla dentro de la caseta. El lugar huele a tierra y herramientas, pero ofrece un descanso seguro junto a quienes mantienen los Jardines."
    }
  },
  "almacen_jardines": {
    "id": "almacen_jardines",
    "area": "jardines",
    "name": "Almacén de Jardines",
    "desc": "Herramientas, recipientes, estacas, telas y suministros de cultivo se ordenan en un almacén donde cada objeto tiene un lugar reconocible. Los materiales de uso frecuente quedan al alcance; los más delicados se guardan elevados o cerrados. La sala revela cuánta infraestructura hace falta para que un jardín parezca simplemente vivo.",
    "scenery": {
  "herramientas": "Palas, azadas, tijeras y rastrillos cuelgan por tamaño y función en soportes marcados.",
  "estacas": "Haces de bambú y madera esperan para sostener plantas o delimitar bancales.",
  "telas": "Paños de sombra, mallas y cubiertas se doblan en estantes secos.",
  "registro": "Una tabla sencilla permite anotar préstamos y devoluciones de equipo."
},
    "exits": {
      "oeste": "patio_jardineros",
      "sur": "sala_clasificacion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sala_clasificacion": {
    "id": "sala_clasificacion",
    "area": "jardines",
    "name": "Sala de Clasificación",
    "desc": "Mesas largas reciben plantas recién cortadas, raíces, semillas y otros materiales antes de que sigan hacia secado, almacenamiento o tratamiento. Bandejas, etiquetas y recipientes separados permiten ordenar por especie, calidad y estado sin depender de la memoria. El trabajo aquí empieza después de la cosecha, pero antes de que el material tenga un destino definitivo.",
    "scenery": {
  "mesas": "Superficies amplias dejan espacio para separar lotes sin mezclarlos.",
  "bandejas": "Cestas planas de distintos tamaños contienen muestras y porciones en revisión.",
  "etiquetas": "Pequeñas tablillas registran origen, especie y observaciones de cada lote.",
  "cuchillos": "Herramientas sencillas permiten retirar partes dañadas antes de clasificar el resto."
},
    "exits": {
      "norte": "almacen_jardines",
      "oeste": "bancal_norte",
      "sur": "invernadero_claro"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "secadero_hierbas": {
    "id": "secadero_hierbas",
    "area": "jardines",
    "name": "Secadero de Hierbas",
    "desc": "Bastidores, cuerdas y bandejas de malla llenan un espacio ventilado donde hojas, tallos y raíces pierden humedad de manera controlada. Las plantas no se amontonan: cada lote conserva separación suficiente para evitar moho y contaminación cruzada. El lugar huele a una mezcla densa de vegetación seca sin que ninguna especie domine por completo.",
    "scenery": {
  "bastidores": "Marcos de madera sostienen mallas finas para extender material en capas delgadas.",
  "cuerdas": "Ramilletes cuelgan separados y etiquetados, con espacio para que circule aire alrededor.",
  "bandejas": "Raíces y frutos cortados se disponen sobre superficies fáciles de limpiar.",
  "ventanas": "Aberturas protegidas permiten ventilación continua sin dejar entrar aves ni demasiada humedad."
},
    "exits": {
      "norte": "caseta_jardineros",
      "este": "bancal_norte",
      "sur": "sendero_herbolario"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bancal_norte": {
    "id": "bancal_norte",
    "area": "jardines",
    "name": "Bancales del Norte",
    "desc": "Parcelas elevadas y estrechas siguen líneas regulares para facilitar riego, deshierbe y rotación de cultivos. Las especies plantadas aquí parecen elegidas por resistencia y utilidad cotidiana más que por rareza. Senderos angostos entre bancales permiten trabajar sin pisar la tierra preparada.",
    "scenery": {
  "bancales": "La tierra está levantada y contenida por bordes bajos de piedra y madera.",
  "surcos": "Pequeñas líneas de riego distribuyen agua sin encharcar las raíces.",
  "etiquetas": "Cada sección lleva una tablilla con especie, lote y notas de manejo.",
  "senderos": "Pasos de grava separan las parcelas y reducen el barro alrededor de las plantas."
},
    "exits": {
      "oeste": "secadero_hierbas",
      "este": "sala_clasificacion",
      "sur": "bancal_central"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bancal_central": {
    "id": "bancal_central",
    "area": "jardines",
    "name": "Bancales Centrales",
    "desc": "Los bancales del centro reúnen especies útiles para enseñanza, observación y recolección controlada. Las plantas están distribuidas de forma que puedan compararse formas de hoja, tallo, raíz y respuesta al qi sin convertir el lugar en una exhibición. Aquí la Herboristería se entiende como práctica de reconocer antes de cortar.",
    "scenery": {
  "parcelas": "Sectores pequeños agrupan especies por necesidades similares sin mezclar raíces incompatibles.",
  "etiquetas": "Las tablillas incluyen nombre, rasgos de identificación y advertencias de recolección.",
  "muestras": "Algunas plantas se dejan completar su ciclo para que puedan estudiarse en distintos estados de desarrollo.",
  "senderos": "Pasos estrechos obligan a acercarse con cuidado sin invadir las zonas cultivadas."
},
    "exits": {
      "norte": "bancal_norte",
      "oeste": "sendero_herbolario",
      "este": "invernadero_claro",
      "sur": "bancal_sur"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bancal_sur": {
    "id": "bancal_sur",
    "area": "jardines",
    "name": "Bancales del Sur",
    "desc": "Los cultivos se vuelven menos regulares hacia el borde meridional de los Jardines, donde las parcelas empiezan a mezclarse con vegetación de transición. Los bancales siguen cuidados, pero toleran especies más resistentes y condiciones menos controladas. Más allá, el terreno abandona gradualmente la disciplina del cultivo y conduce hacia el bosque.",
    "scenery": {
  "bordes": "Piedras bajas contienen las parcelas sin formar una separación absoluta con el terreno exterior.",
  "vegetacion": "Hierbas cultivadas conviven con especies espontáneas que se retiran solo cuando compiten demasiado.",
  "surcos": "El riego es más sencillo y depende en mayor medida de la pendiente natural.",
  "sendero": "El paso hacia el sur pierde grava y gana tierra, anunciando la transición fuera del recinto."
},
    "exits": {
      "norte": "bancal_central",
      "este": "canal_principal",
      "sur": "bosque_linde_jardines"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "invernadero_claro": {
    "id": "invernadero_claro",
    "area": "jardines",
    "name": "Invernadero Claro",
    "desc": "Una estructura ligera de marcos de madera y paneles translúcidos protege especies que necesitan condiciones estables sin exceso de humedad. El interior recibe luz difusa, conserva calor y mantiene las plantas separadas en mesas y camas elevadas. Nada parece exótico por sí mismo; el valor está en controlar lo suficiente el ambiente para repetir resultados.",
    "scenery": {
  "paneles": "Láminas translúcidas dejan pasar luz sin exponer directamente las plantas al exterior.",
  "mesas": "Bancadas elevadas facilitan revisar hojas, raíces superficiales y drenaje.",
  "ventilas": "Aberturas regulables permiten mover aire cuando la humedad aumenta demasiado.",
  "termometros": "Indicadores simples de expansión mineral ayudan a comparar cambios de temperatura sin depender de la sensación al tacto."
},
    "exits": {
      "norte": "sala_clasificacion",
      "oeste": "bancal_central",
      "este": "invernadero_humedo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "invernadero_humedo": {
    "id": "invernadero_humedo",
    "area": "jardines",
    "name": "Invernadero Húmedo",
    "desc": "El aire se vuelve más pesado dentro de un invernadero dedicado a especies que prosperan con humedad alta y suelo constantemente fresco. Canales finos, bandejas profundas y superficies cubiertas de condensación obligan a mantener más distancia entre herramientas y plantas. El control aquí consiste en impedir que la abundancia de agua se convierta en podredumbre.",
    "scenery": {
  "condensacion": "Gotas se acumulan en paneles y vigas antes de caer hacia canales de recogida.",
  "bandejas": "Recipientes profundos sostienen sustratos húmedos sin permitir que el agua quede inmóvil.",
  "musgos": "Capas controladas de musgo ayudan a conservar humedad en algunas mesas.",
  "ventilas": "Pequeñas aperturas evitan que el aire quede completamente estancado."
},
    "exits": {
      "oeste": "invernadero_claro",
      "sur": "canal_principal"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "canal_principal": {
    "id": "canal_principal",
    "area": "jardines",
    "name": "Canal Principal",
    "desc": "Una conducción abierta de piedra reparte agua entre bancales, invernaderos y el estanque de regulación. Compuertas pequeñas permiten desviar caudal hacia ramales distintos, y marcas en la pared ayudan a detectar cambios de nivel. El canal muestra que el cultivo de los Jardines depende tanto de infraestructura como de conocimiento botánico.",
    "scenery": {
  "agua": "El flujo es constante y poco profundo, suficiente para alimentar ramales sin erosionar los bordes.",
  "compuertas": "Placas de madera reforzada permiten abrir o cerrar derivaciones hacia distintos sectores.",
  "marcas_nivel": "Líneas grabadas en la piedra sirven para comparar caudales y detectar desajustes.",
  "sedimento": "Pequeñas rejillas atrapan hojas y tierra antes de que entren en ramales estrechos."
},
    "exits": {
      "oeste": "bancal_sur",
      "norte": "invernadero_humedo",
      "este": "estanque_riego"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "estanque_riego": {
    "id": "estanque_riego",
    "area": "jardines",
    "name": "Estanque de Riego",
    "desc": "Un estanque contenido por piedra funciona como reserva y regulador del sistema de riego. El agua permanece suficientemente clara para observar el fondo cerca de los bordes, mientras entradas y salidas mantienen un movimiento lento que evita el estancamiento. Su función es hidráulica antes que contemplativa.",
    "scenery": {
  "orilla": "Losas anchas permiten acercarse a revisar niveles y limpiar rejillas sin pisar barro.",
  "entrada": "Un canal trae agua al estanque y disipa parte de su fuerza antes de mezclarla con la reserva.",
  "salida": "Una compuerta baja controla cuánto caudal vuelve al sistema principal.",
  "fondo": "Piedras y grava estabilizan el lecho; las zonas más profundas quedan fuera del alcance de una mano."
},
    "exits": {
      "oeste": "canal_principal",
      "norte": "conducto_antiguo_jardines"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sendero_herbolario": {
    "id": "sendero_herbolario",
    "area": "jardines",
    "name": "Sendero del Herbolario",
    "desc": "Un sendero estrecho enlaza directamente los Jardines con la Botica del Pabellón. El firme está preparado para cestas y cargas ligeras, y varios apoyos laterales permiten dejar recipientes sin bloquear el paso. Es una ruta de trabajo: por aquí las plantas dejan de ser cultivos y empiezan a convertirse en material médico.",
    "scenery": {
  "pavimento": "Piedra plana alterna con tramos de tierra compactada para facilitar el tránsito sin dañar raíces cercanas.",
  "apoyos": "Bancos bajos de piedra permiten apoyar cestas durante el traslado.",
  "señales": "Indicaciones simples separan material fresco, seco y rechazado antes de llegar a la botica.",
  "bordes": "Plantas aromáticas comunes estabilizan la tierra y ayudan a distinguir visualmente la ruta."
},
    "exits": {
      "norte": "secadero_hierbas",
      "este": "bancal_central",
      "oeste": "botica"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "conducto_antiguo_jardines": {
    "id": "conducto_antiguo_jardines",
    "area": "jardines",
    "name": "Conducto Antiguo",
    "desc": "Un tramo de infraestructura de riego más antiguo que los canales visibles desciende junto al estanque hasta una obra de piedra de medidas y técnicas distintas de las usadas en los Jardines actuales. Parte del conducto todavía se aprovecha para drenaje y mantenimiento, mientras el sector más profundo conserva una construcción cuya función ya no forma parte del trabajo cotidiano.",
    "scenery": {
  "piedra": "Bloques grandes y oscuros forman un canal más profundo que las conducciones modernas.",
  "desague": "Una derivación actual aprovecha parte del trazado antiguo para evacuar exceso de agua.",
  "seccion_antigua": "Una intervención de piedra ocupa el tramo más profundo del conducto. El acabado es funcional y carece de inscripción o advertencia especial.",
  "marcas": "Rayas de mantenimiento y números recientes conviven con cortes antiguos cuya finalidad ya no resulta evidente."
},
    "exits": {
      "sur": "estanque_riego",
      "abajo": "ala_jardines_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "produccion_portico_oeste": {
    "id": "produccion_portico_oeste",
    "area": "produccion",
    "name": "Pórtico de Producción",
    "desc": "Un pórtico ancho marca el ingreso a la zona donde la secta almacena, repara y redistribuye buena parte de lo que consume. El suelo está reforzado para soportar peso y los marcos de madera muestran golpes de cajas y carros. Nada busca impresionar: desde aquí la montaña empieza a sentirse como una institución que necesita materiales para seguir funcionando.",
    "scenery": {
  "portico": "Vigas gruesas sostienen un techo sencillo con suficiente altura para permitir el paso de cargas voluminosas.",
  "suelo": "Piedra compacta y reparada en las zonas de mayor tránsito; las marcas de ruedas no llegan a formar surcos profundos.",
  "señales": "Tablillas funcionales distinguen carga, talleres, almacenes y salida hacia otros caminos.",
  "bordes": "El paso peatonal queda separado de la franja usada por carros mediante piedras bajas."
},
    "exits": {
      "oeste": "sendero_produccion",
      "este": "patio_produccion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_produccion": {
    "id": "patio_produccion",
    "area": "produccion",
    "name": "Patio de Producción",
    "desc": "Este patio funciona como distribuidor entre administración, descanso de trabajadores, carga y talleres. Personas, materiales y herramientas atraviesan el espacio sin mezclarse por completo gracias a zonas marcadas en el suelo y a una rutina de trabajo evidente en cada borde. Aquí la secta se entiende en términos de peso, mantenimiento y movimiento.",
    "scenery": {
  "marcas": "Franjas de cal separan tránsito, descarga y espera sin necesidad de barreras permanentes.",
  "carretillas": "Varias permanecen apoyadas junto a un muro, con mangos pulidos y ruedas reparadas.",
  "tablillas": "Avisos de trabajo registran destinos, lotes y prioridades materiales.",
  "desgaste": "Las losas cercanas a los accesos muestran un pulido distinto según el tipo de tránsito."
},
    "exits": {
      "oeste": "produccion_portico_oeste",
      "norte": "oficina_logistica",
      "este": "patio_carga",
      "sur": "barracon_trabajadores"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "oficina_logistica": {
    "id": "oficina_logistica",
    "area": "produccion",
    "name": "Oficina de Logística",
    "desc": "Una oficina estrecha concentra manifiestos, registros de consumo y movimientos de materiales. Estantes con tablillas, mapas de rutas y listas de necesidades ocupan más espacio que cualquier adorno. La administración de Producción se parece menos a mandar que a saber qué falta, qué sobra y por dónde debe moverse cada cosa.",
    "scenery": {
  "manifiestos": "Listas de entradas, salidas y destinos se apilan por lotes y procedencia.",
  "mapas": "Esquemas sencillos muestran caminos hacia Cantera, Valle y dependencias internas.",
  "estantes": "Compartimentos marcados separan pedidos pendientes, entregas confirmadas y registros archivados.",
  "mesa": "La superficie principal está dividida en zonas de escritura, revisión y sellado."
},
    "exits": {
      "sur": "patio_produccion",
      "este": "cochera_carros"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "barracon_trabajadores": {
    "id": "barracon_trabajadores",
    "area": "produccion",
    "name": "Barracón de Trabajadores",
    "desc": "Camastros, perchas y arcones ocupan un barracón destinado a quienes realizan turnos de carga, reparación y transporte. El espacio es limpio pero claramente laboral: botas junto a la entrada, ropa resistente secándose y tablillas de turnos clavadas cerca de una mesa común. No se parece a un dormitorio de discípulos; aquí se descansa para volver al trabajo.",
    "scenery": {
  "camastros": "Estructuras simples, más robustas que cómodas, alineadas contra dos paredes.",
  "botas": "Calzado de trabajo queda ordenado sobre listones para no llenar el interior de barro o polvo.",
  "tablillas_turno": "Listas de tareas y relevos usan nombres, funciones y destinos, no rangos de cultivo.",
  "arcones": "Cajas personales guardan ropa y herramientas pequeñas, con cierres sencillos."
},
    "exits": {
      "norte": "patio_produccion"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "barracon_trabajadores",
      "inicio": "Te asignan un camastro libre entre los trabajadores de Producción. El barracón carece de ceremonia, pero ofrece un lugar seguro para descansar, lavarse y recuperar fuerzas."
    }
  },
  "patio_carga": {
    "id": "patio_carga",
    "area": "produccion",
    "name": "Patio de Carga",
    "desc": "Un espacio abierto recibe cajas, sacos, mineral, tejidos y provisiones antes de que sigan hacia talleres o rutas exteriores. Plataformas bajas y rampas suaves permiten mover peso sin detener todo el patio, mientras marcas de tiza separan cargas que aún no tienen el mismo destino. El orden aquí es temporal: cada montón está hecho para desaparecer hacia otra parte.",
    "scenery": {
  "plataformas": "Tarimas de madera mantienen materiales sensibles separados del suelo.",
  "rampas": "Pendientes reforzadas facilitan mover carros y carretillas sin escalones.",
  "cargas": "Cajas, sacos y haces aparecen agrupados por destino y estado de revisión.",
  "tiza": "Símbolos simples indican espera, salida, devolución o inspección."
},
    "exits": {
      "oeste": "patio_produccion",
      "norte": "cochera_carros",
      "este": "patio_talleres",
      "sur": "camino_valle_carga"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "cochera_carros": {
    "id": "cochera_carros",
    "area": "produccion",
    "name": "Cobertizo de Carros",
    "desc": "Bajo un techo amplio se guardan carros de distintos tamaños, piezas de recambio y aparejos de transporte. Ruedas desmontadas, ejes en reparación y correas colgadas revelan que mover recursos exige tanto mantenimiento como producirlos. Todo el espacio está dispuesto para carga, mantenimiento y despacho; no hay dependencias destinadas al alojamiento de viajeros.",
    "scenery": {
  "carros": "Vehículos de carga con capacidades distintas permanecen alineados para dejar libres los accesos.",
  "ruedas": "Piezas nuevas y reparadas se apoyan verticalmente en soportes para evitar deformaciones.",
  "aparejos": "Correas, cinchas y herrajes cuelgan agrupados por uso.",
  "banco_reparacion": "Un banco con herramientas básicas permite ajustar piezas sin convertir el cobertizo en taller principal."
},
    "exits": {
      "oeste": "oficina_logistica",
      "sur": "patio_carga"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_talleres": {
    "id": "patio_talleres",
    "area": "produccion",
    "name": "Patio de los Talleres",
    "desc": "Golpes de metal, raspado de cuero y movimiento de materiales convergen en un patio que distribuye varios oficios institucionales. Los talleres se mantienen separados para no mezclar humo, polvo y residuos, mientras el centro permanece libre para el traslado de piezas. El lugar muestra trabajo especializado sin convertirlo en una escuela de oficios.",
    "scenery": {
  "suelo": "Piedra resistente con zonas oscurecidas cerca de los talleres y franjas limpias de circulación.",
  "canaletas": "Pequeños drenajes recogen agua de limpieza y evitan que residuos lleguen a otros sectores.",
  "soportes": "Estructuras de madera reciben piezas terminadas o pendientes de traslado.",
  "señales": "Cada taller identifica el tipo de trabajo que acepta y qué materiales no deben dejarse fuera."
},
    "exits": {
      "oeste": "patio_carga",
      "norte": "taller_lu_cheng",
      "este": "almacen_materiales",
      "sur": "taller_ning_cai"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "taller_lu_cheng": {
    "id": "taller_lu_cheng",
    "area": "produccion",
    "name": "Taller de Armas",
    "desc": "Yunques, bancos de ajuste y soportes para armas ocupan un taller dedicado a reparar, equilibrar y mantener equipo de la secta. El fuego se concentra en una zona protegida y la mayor parte del espacio está destinada a desmontar, medir y corregir piezas existentes. Aquí se presta un servicio institucional dedicado al mantenimiento de armas; la enseñanza sistemática del oficio no forma parte de la función del taller.",
    "scenery": {
  "yunques": "Bloques de metal de distinto tamaño muestran superficies gastadas pero bien mantenidas.",
  "soportes": "Armas y componentes quedan separados según reparación, ajuste o entrega.",
  "horno": "Una cámara de calor compacta permite trabajar metal sin dominar todo el espacio.",
  "herramientas": "Martillos, limas, tenazas y calibres cuelgan por función y tamaño."
},
    "exits": {
      "sur": "patio_talleres",
      "norte": "deposito_metales"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "deposito_metales": {
    "id": "deposito_metales",
    "area": "produccion",
    "name": "Depósito de Metales",
    "desc": "Lingotes, barras, planchas y piezas recuperables se almacenan según tipo, tamaño y estado. Los materiales pesados ocupan niveles bajos y los lotes pequeños quedan en compartimentos cerrados. El depósito revela una economía de reaprovechamiento: una pieza dañada no deja de tener valor solo porque ya no cumple su función original.",
    "scenery": {
  "lingotes": "Bloques marcados con procedencia y peso se apilan sobre bases de piedra.",
  "barras": "Metales largos descansan en bastidores horizontales para evitar deformaciones.",
  "recortes": "Cajas separan piezas pequeñas que todavía pueden fundirse o emplearse en reparaciones.",
  "marcas": "Símbolos de clasificación distinguen pureza, destino y necesidad de revisión."
},
    "exits": {
      "sur": "taller_lu_cheng"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "taller_ning_cai": {
    "id": "taller_ning_cai",
    "area": "produccion",
    "name": "Taller de Tejidos y Cuero",
    "desc": "Mesas de corte, bastidores y rollos de material convierten este taller en un espacio dedicado a reparar, reforzar y adaptar tejidos, cuero y membranas útiles. Las piezas naturales llegan limpias y clasificadas antes de entrar aquí; el trabajo consiste en convertirlas en componentes que la institución pueda aprovechar. Extraer bien un material no equivale a saber fabricarlo.",
    "scenery": {
  "mesas": "Superficies amplias permiten extender pieles y telas sin doblarlas durante el corte.",
  "bastidores": "Marcos tensan cuero y membranas para revisar grosor, daños y elasticidad.",
  "rollos": "Tejidos de uso común se almacenan protegidos del polvo y la humedad.",
  "agujas": "Herramientas gruesas, cordeles y punzones se ordenan en cajas poco profundas."
},
    "exits": {
      "norte": "patio_talleres",
      "sur": "secadero_cueros"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "secadero_cueros": {
    "id": "secadero_cueros",
    "area": "produccion",
    "name": "Secadero de Cueros",
    "desc": "Bastidores elevados sostienen cueros y materiales orgánicos durante etapas de secado y estabilización. El aire circula entre las piezas sin que unas toquen a otras, y recipientes separados contienen sales, taninos y residuos de tratamiento. El olor es fuerte pero controlado; el lugar está diseñado para procesar sin contaminar el resto de los talleres.",
    "scenery": {
  "bastidores": "Marcos de madera mantienen las piezas tensas y separadas.",
  "canal": "Un drenaje lateral conduce líquidos de limpieza fuera del área de trabajo.",
  "recipientes": "Sales y soluciones de tratamiento se guardan cerradas y claramente rotuladas.",
  "ventilacion": "Aberturas altas permiten renovar el aire sin exponer directamente los materiales."
},
    "exits": {
      "norte": "taller_ning_cai",
      "este": "area_embalaje"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "almacen_materiales": {
    "id": "almacen_materiales",
    "area": "produccion",
    "name": "Almacén de Materiales",
    "desc": "Madera, piedra trabajada, fibras, piezas cerámicas y suministros generales llenan un almacén pensado para abastecer varios departamentos a la vez. La clasificación prioriza destino y frecuencia de uso, de modo que los materiales más demandados quedan cerca de las salidas. Es uno de los lugares donde se vuelve visible cuánto consume una institución grande para mantener su rutina.",
    "scenery": {
  "madera": "Tablas y vigas se apilan sobre soportes para evitar humedad del suelo.",
  "cajas": "Contenedores rotulados separan piezas pequeñas, repuestos y materiales de uso especializado.",
  "tablillas": "Registros de inventario muestran cantidades esperadas, reservadas y disponibles.",
  "pasillos": "Corredores estrechos pero despejados permiten mover cargas sin desarmar pilas enteras."
},
    "exits": {
      "oeste": "patio_talleres",
      "sur": "almacen_herramientas",
      "este": "camino_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "almacen_herramientas": {
    "id": "almacen_herramientas",
    "area": "produccion",
    "name": "Almacén de Herramientas",
    "desc": "Herramientas de trabajo común ocupan paneles, estantes y cajas numeradas. Cada pieza tiene una ubicación prevista y muchas llevan marcas de reparación o de departamento. El sistema está pensado para que una herramienta pueda circular entre manos sin perderse en el proceso.",
    "scenery": {
  "paneles": "Siluetas pintadas indican dónde debe regresar cada herramienta colgada.",
  "cajas": "Piezas pequeñas se agrupan por función y llevan conteos visibles.",
  "mangos": "Repuestos de madera esperan separados por longitud y grosor.",
  "registro": "Préstamos y devoluciones se anotan en una tabla de movimientos."
},
    "exits": {
      "norte": "almacen_materiales",
      "oeste": "area_embalaje"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "area_embalaje": {
    "id": "area_embalaje",
    "area": "produccion",
    "name": "Área de Clasificación y Embalaje",
    "desc": "Mesas, balanzas y materiales de envoltura ocupan un espacio donde recursos muy distintos se preparan para abandonar Producción. Hierbas, minerales, medicinas, textiles y piezas reparadas no se mezclan: cada carga recibe protección, etiqueta y destino antes de seguir su camino. La sala hace visible que los departamentos de la secta no funcionan por separado.",
    "scenery": {
  "mesas": "Superficies largas permiten revisar y separar lotes antes de cerrarlos.",
  "balanzas": "Instrumentos de distintos tamaños ayudan a comprobar peso y distribución.",
  "envolturas": "Papel grueso, tela, cuerda y cajas esperan según fragilidad y tipo de carga.",
  "etiquetas": "Cada paquete recibe origen, destino y responsable de la entrega."
},
    "exits": {
      "oeste": "secadero_cueros",
      "este": "almacen_herramientas"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "camino_cantera": {
    "id": "camino_cantera",
    "area": "produccion",
    "name": "Camino de la Cantera",
    "desc": "Un camino reforzado abandona los talleres en dirección a la zona de extracción. Las rodadas son más profundas que en otras rutas y los bordes han sido consolidados con piedra para soportar cargas pesadas. Es una conexión de trabajo directa: la cantera abastece a Producción sin necesidad de pasar primero por el Valle.",
    "scenery": {
  "rodadas": "Surcos paralelos revelan el paso habitual de carros cargados con piedra y mineral.",
  "refuerzos": "Bloques colocados en los bordes evitan que el firme se desarme en los tramos blandos.",
  "señales": "Marcas sencillas indican prioridad de paso para cargas pesadas.",
  "cunetas": "Drenajes laterales protegen el camino de la escorrentía."
},
    "exits": {
      "oeste": "almacen_materiales",
      "este": "cantera_acceso_secta"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "camino_valle_carga": {
    "id": "camino_valle_carga",
    "area": "produccion",
    "name": "Camino de Carga del Valle",
    "desc": "Esta vía desciende desde Producción hacia la red de caminos del Valle con una pendiente moderada y curvas amplias para carros. El tránsito mezcla suministros que salen de la secta con recursos que regresan desde campos y comunidades. No es una ruta de viaje especial, sino parte del circuito ordinario que mantiene conectados trabajo, consumo y territorio.",
    "scenery": {
  "curvas": "Los giros amplios reducen el riesgo de que una carga pesada cierre el paso.",
  "marcas_rueda": "El firme conserva huellas superpuestas de carros de distintos tamaños.",
  "mojones": "Piedras marcadas orientan hacia Producción y hacia el desvío carretero del Valle.",
  "bordes": "Franjas peatonales evitan que quienes caminan tengan que competir con los carros."
},
    "exits": {
      "norte": "patio_carga",
      "sur": "valle_desvio_carretero"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "valle_camino_alto": {
    "id": "valle_camino_alto",
    "area": "valle",
    "name": "Camino Alto del Valle",
    "desc": "La ruta desciende desde la Secta Exterior hacia un paisaje donde los edificios dejan de concentrarse y aparecen terrazas, campos y caminos abiertos. El firme sigue bien mantenido, pero el entorno ya no parece un recinto: hay espacio para carros, trabajadores y viajeros que se mueven entre lugares distintos. El territorio de la secta continúa más allá de sus muros.",
    "scenery": {
  "camino": "Piedra y tierra compactada alternan según pendiente y tránsito.",
  "vista": "Las terrazas y rutas inferiores se abren por tramos entre árboles y taludes.",
  "cunetas": "Canales laterales reducen el daño de la lluvia sobre el firme.",
  "mojones": "Señales de distancia y jurisdicción aparecen sin formar una frontera cerrada."
},
    "exits": {
      "norte": "camino_valle",
      "sur": "valle_explanada"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "valle_explanada": {
    "id": "valle_explanada",
    "area": "valle",
    "name": "Explanada del Valle",
    "desc": "Una explanada amplia sirve de primer distribuidor del Valle y permite que personas y cargas se separen hacia patrulla, terrazas y caminos inferiores. El terreno está nivelado, con espacios de espera y bordes reforzados para carros. Desde aquí el lugar se entiende mejor como corredor habitado que como prolongación de un único recinto.",
    "scenery": {
  "suelo": "Tierra apisonada con zonas de grava donde las ruedas castigan más el firme.",
  "postes": "Indicadores señalan Puesto, terrazas y encrucijada.",
  "espera": "Áreas despejadas permiten detener carros sin bloquear el camino principal.",
  "bordes": "Taludes bajos contienen la tierra y canalizan el agua."
},
    "exits": {
      "norte": "valle_camino_alto",
      "oeste": "puesto_valle",
      "este": "terrazas_norte",
      "sur": "encrucijada_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "puesto_valle": {
    "id": "puesto_valle",
    "area": "valle",
    "name": "Puesto del Valle",
    "desc": "Un edificio robusto combina funciones de patrulla, mensajería, auxilio y descanso para quienes tienen autorización para usar la red territorial. Bancos, tablillas de rutas, equipo básico y camas sencillas comparten espacio sin que el puesto se convierta en cuartel. Es un lugar de frontera cotidiana, donde la secta trata con caminos y personas además de consigo misma.",
    "scenery": {
  "tablillas": "Rutas, avisos de tránsito e incidencias se organizan por sector.",
  "equipo": "Capas, cuerdas, linternas y útiles de patrulla ocupan soportes accesibles.",
  "bancos": "Asientos largos reciben viajeros, mensajeros o personas que esperan indicaciones.",
  "camastros": "Un pequeño sector de descanso queda separado del área de atención."
},
    "exits": {
      "este": "valle_explanada",
      "sur": "patio_puesto_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "puesto_valle",
      "inicio": "El puesto te ofrece un camastro limpio y espacio para dejar el equipo. No es una residencia, pero sí un refugio seguro en medio de la red de caminos del Valle."
    }
  },
  "patio_puesto_valle": {
    "id": "patio_puesto_valle",
    "area": "valle",
    "name": "Patio del Puesto",
    "desc": "Un patio cercado permite preparar patrullas, revisar cargas pequeñas y atender animales de tiro o viajeros sin llenar el interior del puesto. Las marcas del suelo muestran rutas de entrada y salida, mientras soportes laterales reúnen equipo que necesita estar disponible con rapidez. La actividad del lugar es territorial, no ceremonial.",
    "scenery": {
  "soportes": "Cuerdas, mantas y útiles de camino cuelgan preparados para su uso.",
  "abrevadero": "Un recipiente largo permite dar agua a animales de carga sin acercarlos al edificio.",
  "marcas": "Líneas de tiza separan espera, preparación y paso.",
  "porton": "Una abertura ancha conecta el patio con los caminos sin formar una fortificación."
},
    "exits": {
      "norte": "puesto_valle",
      "este": "encrucijada_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "encrucijada_valle": {
    "id": "encrucijada_valle",
    "area": "valle",
    "name": "Encrucijada del Valle",
    "desc": "Cuatro rutas importantes convergen en una encrucijada suficientemente ancha para que el tránsito pueda orientarse sin detenerse. Hacia un lado quedan el puesto y la secta; hacia otros, mercado, campos, caminos de Cantera y Sauces; más al sur continúa la vía regional. Es uno de los lugares donde el mapa exterior empieza a volverse intuitivo.",
    "scenery": {
  "poste_direcciones": "Brazos de madera señalan destinos principales sin indicar que todos tengan el mismo régimen de acceso.",
  "suelo": "Las huellas se abren en varias direcciones y vuelven a concentrarse en cada salida.",
  "mojon": "Una piedra baja marca el centro administrativo del cruce.",
  "cunetas": "Drenajes se bifurcan siguiendo cada ruta para no acumular agua en el centro."
},
    "exits": {
      "norte": "valle_explanada",
      "oeste": "patio_puesto_valle",
      "este": "mercado_valle",
      "sur": "puente_menor"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mercado_valle": {
    "id": "mercado_valle",
    "area": "valle",
    "name": "Mercado del Camino",
    "desc": "Puestos ligeros, toldos y mesas de intercambio ocupan un tramo abierto junto a la ruta. Comerciantes, trabajadores y viajeros pueden abastecerse o mover pequeñas mercancías sin entrar en una comunidad cerrada. El mercado pertenece al flujo del Valle: aparece como punto de encuentro entre caminos, no como plaza central de una aldea.",
    "scenery": {
  "puestos": "Estructuras desmontables ofrecen espacio para productos, herramientas y provisiones.",
  "toldos": "Telas sencillas protegen mercancías sensibles sin cerrar la circulación.",
  "balanzas": "Instrumentos de comercio común permiten pesar grano, sal y cargas menores.",
  "zona_carga": "Un borde despejado conecta el mercado con el desvío usado por carros."
},
    "exits": {
      "oeste": "encrucijada_valle",
      "este": "valle_desvio_carretero"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "granero_valle": {
    "id": "granero_valle",
    "area": "valle",
    "name": "Granero del Valle",
    "desc": "Una construcción elevada almacena parte de la producción agrícola del Valle antes de su distribución. Ventilación, separación del suelo y registros de lotes importan tanto como el volumen guardado. El granero es infraestructura comunitaria y logística, no una reserva secreta de la secta.",
    "scenery": {
  "tarima": "La estructura principal se eleva para reducir humedad y acceso de animales.",
  "sacos": "Grano y semillas se agrupan por lote y procedencia.",
  "ventilas": "Aberturas protegidas mantienen circulación de aire sin exponer el interior.",
  "registro": "Tablillas anotan entrada, salida y destino de cada lote."
},
    "exits": {
      "norte": "terrazas_norte",
      "sur": "terrazas_sur"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "terrazas_norte": {
    "id": "terrazas_norte",
    "area": "valle",
    "name": "Terrazas del Norte",
    "desc": "Parcelas escalonadas aprovechan la pendiente del Valle mediante muros bajos de piedra y canales estrechos. El cultivo es regular sin ser ornamental: cada nivel busca retener tierra, repartir agua y permitir trabajo continuo. Desde los bordes puede verse cómo la producción agrícola forma parte del mismo sistema que caminos y almacenes.",
    "scenery": {
  "muros": "Piedra colocada en seco sostiene cada nivel y deja pequeñas salidas para exceso de agua.",
  "surcos": "Líneas de cultivo siguen la forma de la terraza para aprovechar el terreno.",
  "canalillos": "Derivaciones pequeñas llevan agua de un nivel al siguiente.",
  "senderos": "Pasos estrechos conectan parcelas sin atravesar directamente los cultivos."
},
    "exits": {
      "oeste": "valle_explanada",
      "sur": "granero_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "terrazas_sur": {
    "id": "terrazas_sur",
    "area": "valle",
    "name": "Terrazas del Sur",
    "desc": "Las terrazas inferiores se extienden hacia campos más abiertos y conectan el cultivo intensivo con rutas laterales del Valle. Los muros son más bajos y las parcelas algo más amplias, como si la pendiente empezara a ceder. El agua llega por canales secundarios antes de continuar hacia los campos orientales.",
    "scenery": {
  "parcelas": "Sectores anchos combinan cultivos alimentarios con zonas de descanso del suelo.",
  "muros": "Piedras bajas contienen los bordes sin convertir las terrazas en recintos.",
  "acequias": "Canales secundarios reparten agua antes de devolver excedentes al sistema.",
  "senderos": "Rutas de tierra conectan hacia campos y granero."
},
    "exits": {
      "norte": "granero_valle",
      "sur": "campo_poniente",
      "este": "canal_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "campo_poniente": {
    "id": "campo_poniente",
    "area": "valle",
    "name": "Campos de Poniente",
    "desc": "Campos abiertos ocupan el lado occidental del Valle, donde la tierra cultivada se aproxima a las rutas que conducen hacia Cantera. La presencia de carros y materiales pétreos aumenta en el borde del camino, pero las parcelas siguen dominando el paisaje. Es una zona de transición entre producción agrícola y tránsito extractivo.",
    "scenery": {
  "parcelas": "Extensiones más amplias permiten cultivos que no necesitan el escalonamiento de las terrazas.",
  "camino": "La ruta occidental muestra firme reforzado y más huellas de carga pesada.",
  "cercas": "Límites bajos protegen cultivos sin cerrar completamente el paso visual.",
  "piedras": "Fragmentos de roca más frecuentes anuncian la dirección de Cantera."
},
    "exits": {
      "este": "puente_menor",
      "norte": "terrazas_sur",
      "oeste": "camino_cantera_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "campo_levante": {
    "id": "campo_levante",
    "area": "valle",
    "name": "Campos de Levante",
    "desc": "Los campos orientales acompañan una ruta que se abre hacia Sauces y hacia el sistema de agua del Valle. Canales, parcelas y pequeños pasos forman una transición gradual entre agricultura y territorio habitado. El paisaje parece menos duro que hacia Cantera, pero sigue siendo una zona de trabajo y tránsito, no un jardín.",
    "scenery": {
  "parcelas": "Cultivos amplios se alternan con franjas de descanso y hierba útil.",
  "canales": "Derivaciones del canal principal mantienen húmedos los bordes de las parcelas.",
  "sendero": "La ruta oriental se ensancha donde confluyen viajeros y pequeñas cargas.",
  "vegetacion": "Sauces jóvenes y especies de ribera aparecen con mayor frecuencia hacia el este."
},
    "exits": {
      "oeste": "puente_menor",
      "norte": "canal_valle",
      "este": "camino_sauces_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "canal_valle": {
    "id": "canal_valle",
    "area": "valle",
    "name": "Canal del Valle",
    "desc": "Un canal de piedra y tierra conduce agua entre terrazas y campos antes de continuar hacia sectores orientales del territorio. Compuertas pequeñas permiten regular desvíos sin interrumpir por completo el flujo. La infraestructura une visualmente el Valle con una red hídrica mayor que sigue más allá de estas parcelas.",
    "scenery": {
  "agua": "El cauce corre con profundidad moderada y deja visibles piedras del fondo en los bordes.",
  "compuertas": "Tablas reforzadas controlan ramales hacia campos y terrazas.",
  "marcas": "Líneas en la piedra permiten comparar niveles y detectar pérdidas.",
  "vegetacion_ribera": "Hierbas y plantas de humedad estabilizan los bordes sin cerrar el canal."
},
    "exits": {
      "oeste": "terrazas_sur",
      "sur": "campo_levante"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "puente_menor": {
    "id": "puente_menor",
    "area": "valle",
    "name": "Puente del Valle",
    "desc": "Un puente de piedra cruza el canal principal en un punto donde convergen rutas hacia campos, encrucijada y Camino Regional. No es una obra monumental, pero su anchura permite paso peatonal y cargas ligeras sin conflicto. Desde aquí el Valle deja clara su función de nudo entre producción local y caminos mayores.",
    "scenery": {
  "arco": "Un único arco bajo salva el cauce sin elevar demasiado la calzada.",
  "pretiles": "Bordes de piedra protegen el cruce y muestran reparaciones en varias épocas.",
  "pavimento": "Losas más lisas ocupan la parte central y bloques rugosos refuerzan los extremos.",
  "vista": "Desde el puente se distinguen campos a ambos lados y la ruta que continúa hacia el sur."
},
    "exits": {
      "norte": "encrucijada_valle",
      "oeste": "campo_poniente",
      "este": "campo_levante",
      "sur": "camino_regional"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "camino_cantera_valle": {
    "id": "camino_cantera_valle",
    "area": "valle",
    "name": "Camino Occidental",
    "desc": "Una ruta de tierra y piedra abandona los campos de poniente en dirección a la zona de Cantera. El firme se endurece y las marcas de carga pesada se vuelven más frecuentes a medida que disminuye la presencia de cultivos. Es un enlace territorial ordinario, usado tanto por patrullas como por trabajadores y suministros.",
    "scenery": {
  "firme": "Piedra machacada refuerza los tramos donde las ruedas dañan más la tierra.",
  "rodadas": "Surcos profundos muestran el paso regular de carros de mineral y piedra.",
  "señales": "Mojones sencillos indican la dirección de Cantera y el regreso al Valle.",
  "cuneta": "Un drenaje lateral evita que el agua corte la ruta."
},
    "exits": {
      "este": "campo_poniente",
      "oeste": "cantera_camino_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "camino_sauces_valle": {
    "id": "camino_sauces_valle",
    "area": "valle",
    "name": "Camino de los Sauces",
    "desc": "La ruta oriental se vuelve más húmeda y arbolada al alejarse de los campos del Valle. Sauces dispersos aparecen junto a zanjas y cauces menores, mientras el camino mantiene suficiente anchura para tránsito civil. La transición hacia la comunidad protegida ocurre por paisaje y uso, no mediante una puerta formal.",
    "scenery": {
  "sauces": "Árboles jóvenes y maduros siguen las zonas donde el terreno conserva más humedad.",
  "zanjas": "Pequeñas conducciones acompañan el camino y conectan con la red de riego.",
  "huellas": "Pasos humanos, ruedas pequeñas y animales de carga dejan un tránsito variado.",
  "mojones": "Marcas de jurisdicción recuerdan que la ruta sigue dentro del territorio protegido."
},
    "exits": {
      "oeste": "campo_levante",
      "este": "sauces_camino_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "valle_desvio_carretero": {
    "id": "valle_desvio_carretero",
    "area": "valle",
    "name": "Desvío de los Carros",
    "desc": "Una bifurcación amplia conecta el Mercado del Camino con la ruta de carga que asciende hacia Producción. El terreno está reforzado para permitir giros y esperas sin bloquear el tránsito civil. Cargas destinadas a la secta se separan aquí de quienes continúan por el Valle.",
    "scenery": {
  "bifurcacion": "El camino se abre lo suficiente para que dos carros maniobren sin cerrar la ruta.",
  "firme": "Grava y piedra compactada resisten mejor el peso que la tierra del mercado.",
  "señales": "Indicadores distinguen Producción del resto de rutas del Valle.",
  "espera": "Un margen ancho permite detener una carga mientras se comprueban destino o documentos."
},
    "exits": {
      "oeste": "mercado_valle",
      "norte": "camino_valle_carga"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "camino_regional": {
    "id": "camino_regional",
    "area": "valle",
    "name": "Camino Regional",
    "desc": "Una vía más ancha abandona el entramado inmediato de campos y puestos y continúa hacia territorios que ya no pertenecen al circuito cotidiano de la secta. El firme muestra tránsito regular y las señales mencionan destinos que no forman parte de la montaña. El mundo exterior no está oculto: simplemente existe más allá de los permisos que rigen a un discípulo.",
    "scenery": {
  "calzada": "La ruta ha sido mantenida para viajes más largos y soporta tránsito en ambos sentidos.",
  "señales": "Postes de dirección mencionan destinos situados más allá del territorio administrado directamente por la secta.",
  "huellas": "Ruedas, animales y pasos humanos forman patrones menos uniformes que dentro del Valle.",
  "mojon_a_lo_lejos": "Hacia el sur se distingue la marca territorial de la Grulla Blanca antes de que el camino continúe."
},
    "exits": {
      "norte": "puente_menor",
      "sur": "mojon_regional"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mojon_regional": {
    "id": "mojon_regional",
    "area": "valle",
    "name": "Mojón de la Grulla Blanca",
    "desc": "Una piedra alta marca el límite administrativo del territorio directamente gestionado por la secta. Más allá, el Camino Regional continúa sin desaparecer ni transformarse en un muro; la restricción es institucional, no geográfica. El mojón recuerda que pertenecer a la Grulla Blanca también significa aceptar hasta dónde puede desplazarse uno sin autorización.",
    "scenery": {
  "piedra": "El bloque lleva inscripciones de límite, jurisdicción y tránsito en una cara protegida de la erosión.",
  "grulla": "Una figura antigua de la Grulla aparece tallada con proporciones distintas de la iconografía usada en edificios recientes.",
  "ruta": "El camino sigue hacia el sur y se pierde en el relieve, claramente transitable para quienes tengan derecho a usarlo.",
  "tablilla_transito": "Una tablilla explica que los discípulos sin orden de desplazamiento no pueden abandonar el territorio asignado."
},
    "exits": {
      "norte": "camino_regional",
      "sur": "ruta_regional_arc2"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_linde_jardines": {
    "id": "bosque_linde_jardines",
    "area": "bosques",
    "name": "Linde de los Jardines",
    "desc": "La disciplina de los Jardines termina de forma gradual: los bancales ceden a tierra irregular, arbustos espontáneos y árboles que ya no siguen ninguna alineación. Aun quedan piedras de borde, huellas de herramientas y marcas de patrulla, pero el terreno empieza a obedecer más a la montaña que a la secta. Es una frontera de uso, no una muralla.",
    "scenery": {
  "borde": "Las últimas piedras de contención se pierden entre raíces y vegetación no cultivada.",
  "sendero": "El paso sigue despejado, aunque ya no está nivelado ni cubierto de grava.",
  "marcas": "Cortes discretos en troncos y piedras indican rutas conocidas por jardineros y patrullas.",
  "vegetacion": "Especies cultivadas aparecen mezcladas con plantas espontáneas antes de desaparecer por completo."
},
    "exits": {
      "norte": "bancal_sur",
      "sur": "bosque_sendero_bajo",
      "este": "bosque_arroyo_bajo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_sendero_bajo": {
    "id": "bosque_sendero_bajo",
    "area": "bosques",
    "name": "Sendero del Bosque Bajo",
    "desc": "Un sendero visible avanza entre árboles jóvenes, matorrales y raíces que todavía muestran cortes de mantenimiento. La copa deja pasar suficiente claridad para orientarse y el suelo conserva huellas frecuentes de paso humano. El bosque ya es silvestre, pero aún forma parte de una zona conocida y recorrida.",
    "scenery": {
  "huellas": "Botas, animales pequeños y cargas ligeras han marcado el barro en distintos puntos.",
  "ramas": "Las ramas que invadirían el paso han sido cortadas, aunque no recientemente en todos los tramos.",
  "raices": "Cruzan el sendero y obligan a variar el paso sin llegar a cerrarlo.",
  "marcas_patrulla": "Pequeños cortes inclinados en algunos troncos confirman que la ruta sigue bajo observación."
},
    "exits": {
      "norte": "bosque_linde_jardines",
      "sur": "bosque_claro_raices"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_arroyo_bajo": {
    "id": "bosque_arroyo_bajo",
    "area": "bosques",
    "name": "Arroyo de las Raíces",
    "desc": "Un arroyo estrecho corre entre raíces expuestas y piedras oscuras antes de perderse bajo la vegetación. El agua no tiene fuerza suficiente para impedir el paso, pero obliga a elegir dónde apoyar los pies. Los árboles cercanos crecen inclinados hacia el cauce, como si la erosión hubiera ido descubriendo lentamente su estructura.",
    "scenery": {
  "arroyo": "Agua clara corre sobre grava, hojas y pequeñas ramas arrastradas desde la ladera.",
  "raices": "Varias raíces gruesas forman arcos naturales sobre el agua y sujetan parte de la orilla.",
  "piedras": "Rocas lisas permiten cruzar algunos tramos sin entrar en el cauce.",
  "orillas": "La tierra húmeda conserva marcas de animales pequeños y desprendimientos recientes."
},
    "exits": {
      "oeste": "bosque_linde_jardines",
      "sur": "bosque_puente_raices"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_claro_raices": {
    "id": "bosque_claro_raices",
    "area": "bosques",
    "name": "Claro de las Raíces",
    "desc": "Un claro irregular se abre donde varios árboles viejos han levantado el suelo con raíces gruesas y entrelazadas. La vegetación baja aprovecha los espacios de tierra profunda, mientras hojas y ramas forman bolsas de sombra bajo los troncos. El lugar ofrece recursos y cobertura sin parecer preparado para nadie.",
    "scenery": {
  "raices": "Grandes raíces recorren el suelo como costillas de madera, algunas tan altas que sirven de asiento o barrera.",
  "claro": "La apertura del dosel deja crecer hierbas y arbustos que escasean en zonas más cerradas.",
  "troncos": "Árboles viejos muestran cicatrices naturales, hongos y marcas de animales.",
  "suelo": "Tierra oscura se acumula entre las raíces y retiene humedad bajo una capa de hojas."
},
    "exits": {
      "norte": "bosque_sendero_bajo",
      "este": "bosque_puesto_marcas",
      "sur": "bosque_ladera_baja"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculto": []
  },
  "bosque_puente_raices": {
    "id": "bosque_puente_raices",
    "area": "bosques",
    "name": "Paso de las Raíces",
    "desc": "Dos orillas bajas quedan unidas por un entramado de raíces gruesas que ha terminado funcionando como paso natural sobre una depresión húmeda. Algunas han sido reforzadas con cuerda y pequeñas tablas, señal de que las patrullas prefieren conservar la solución existente antes que construir un puente completo.",
    "scenery": {
  "entramado": "Raíces vivas y madera añadida forman una superficie irregular pero utilizable.",
  "cuerdas": "Ataduras secas estabilizan los puntos donde las raíces se separan demasiado.",
  "depresion": "Agua y barro se acumulan debajo tras recorrer la ladera.",
  "marcas": "Pequeños cortes en la madera indican por dónde conviene apoyar el pie cuando el terreno está húmedo."
},
    "exits": {
      "norte": "bosque_arroyo_bajo",
      "sur": "bosque_puesto_marcas"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_puesto_marcas": {
    "id": "bosque_puesto_marcas",
    "area": "bosques",
    "name": "Poste de las Patrullas",
    "desc": "Un poste robusto se alza en un cruce de rutas forestales y concentra señales de orientación, avisos breves y marcas de mantenimiento. No hay edificio ni guardia permanente: el lugar existe para que distintas patrullas puedan entender qué encontró la anterior sin necesidad de coincidir con ella.",
    "scenery": {
  "poste": "Madera endurecida por resina y reparaciones, cubierta de cortes, clavos y pequeñas tablillas.",
  "tablillas": "Avisos cortos indican senderos despejados, obstáculos, rastros de fauna o trabajos pendientes.",
  "cuerda": "Un rollo protegido bajo una tapa sencilla puede usarse para reparaciones de ruta.",
  "marcas_ruta": "Símbolos tallados señalan la dirección hacia Jardines, refugio y bosque más profundo."
},
    "exits": {
      "norte": "bosque_puente_raices",
      "oeste": "bosque_claro_raices",
      "este": "bosque_senda_patrulla",
      "sur": "bosque_umbral_niebla"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_ladera_baja": {
    "id": "bosque_ladera_baja",
    "area": "bosques",
    "name": "Ladera del Bosque Bajo",
    "desc": "El terreno se inclina con mayor fuerza y obliga al sendero a serpentear entre troncos y afloramientos de piedra. La vegetación sigue siendo relativamente abierta, pero el suelo se vuelve menos estable y las señales de mantenimiento más escasas. Desde algunos huecos entre los árboles se distingue el desnivel acumulado desde los Jardines.",
    "scenery": {
  "pendiente": "La tierra cede en pequeños escalones naturales sujetos por raíces y piedras.",
  "afloramientos": "Rocas grises emergen entre hojas y obligan al camino a desviarse.",
  "arboles": "Los troncos crecen inclinados siguiendo la pendiente y dejan raíces visibles en el lado bajo.",
  "vista": "Entre ramas se alcanzan a ver sectores más ordenados de la montaña, ya lejos del carácter silvestre del lugar."
},
    "exits": {
      "norte": "bosque_claro_raices",
      "este": "bosque_umbral_niebla"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_senda_patrulla": {
    "id": "bosque_senda_patrulla",
    "area": "bosques",
    "name": "Senda de Patrulla",
    "desc": "Una ruta angosta pero reconocible atraviesa el bosque siguiendo una línea más práctica que escénica. Ramas cortadas, piedras movidas y pequeñas marcas de orientación revelan mantenimiento periódico. La senda conecta puntos útiles para vigilancia y refugio sin intentar domesticar el terreno que atraviesa.",
    "scenery": {
  "cortes": "Ramas bajas han sido retiradas para permitir el paso con equipo.",
  "mojones": "Piedras apiladas discretamente confirman el trazado cuando la senda pierde definición.",
  "pisadas": "El suelo compacto en ciertos tramos demuestra uso repetido por grupos pequeños.",
  "margen": "La vegetación invade los bordes en cuanto deja de ser retirada, estrechando el paso de manera natural."
},
    "exits": {
      "oeste": "bosque_puesto_marcas",
      "sur": "bosque_refugio_patrulla"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_umbral_niebla": {
    "id": "bosque_umbral_niebla",
    "area": "bosques",
    "name": "Umbral de la Niebla",
    "desc": "La humedad aumenta y una niebla baja empieza a quedarse entre troncos y depresiones del terreno. El cambio no forma una frontera precisa, pero la distancia visible se acorta y las marcas de ruta adquieren más importancia. Detrás quedan senderos relativamente abiertos; hacia adelante el bosque exige mirar más cerca.",
    "scenery": {
  "niebla": "Se acumula cerca del suelo y entre raíces antes de espesarse en las zonas más hundidas.",
  "troncos": "La corteza se oscurece por la humedad y sostiene musgos que eran menos frecuentes al norte.",
  "marcas": "Señales de patrulla aparecen a menor distancia unas de otras para compensar la visibilidad reducida.",
  "suelo": "Hojas húmedas y barro sustituyen gradualmente a la tierra seca del Bosque Bajo."
},
    "exits": {
      "norte": "bosque_puesto_marcas",
      "oeste": "bosque_ladera_baja",
      "sur": "bosque_senda_niebla"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_senda_niebla": {
    "id": "bosque_senda_niebla",
    "area": "bosques",
    "name": "Senda de la Niebla",
    "desc": "El sendero continúa bajo un dosel cerrado mientras la niebla borra profundidad y vuelve parecidos los espacios entre árboles. El trazado se reconoce por el suelo compactado y por marcas deliberadas en troncos cercanos, no por una vista larga del camino. Sonidos pequeños parecen llegar desde lugares distintos a los que sugiere la vista.",
    "scenery": {
  "sendero": "Una franja más firme y menos cubierta de hojas permite seguir la ruta aunque no se vea lejos.",
  "niebla": "La humedad suspendida rompe contornos y apaga los colores a pocos pasos.",
  "marcas": "Cortes dobles en la corteza señalan la dirección de la senda sin confundirse con daños naturales.",
  "sonido": "Agua, ramas y animales pequeños se oyen con claridad irregular entre la vegetación húmeda."
},
    "exits": {
      "norte": "bosque_umbral_niebla",
      "este": "bosque_refugio_patrulla",
      "sur": "bosque_claro_humedo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_refugio_patrulla": {
    "id": "bosque_refugio_patrulla",
    "area": "bosques",
    "name": "Refugio de Patrulla",
    "desc": "Una construcción baja de piedra y madera ofrece techo, agua y suministros mínimos en medio del Bosque de la Niebla. El interior está pensado para que una patrulla pueda secar equipo, dormir y dejar notas antes de continuar. Es un refugio agreste: seguro para descansar, pero sin las instalaciones necesarias para purificar automáticamente heridas o aflicciones complejas.",
    "scenery": {
  "camastros": "Plataformas de madera con mantas gruesas ocupan una pared y pueden usarse sin preparación especial.",
  "deposito": "Un armario protegido contiene cuerda, vendas, recipientes y provisiones sencillas.",
  "hogar": "Un fogón de piedra permite calor y preparación básica sin llenar el refugio de humo.",
  "registro": "Tablillas de patrulla guardan observaciones breves sobre rutas, daños y fauna vista en los alrededores."
},
    "exits": {
      "norte": "bosque_senda_patrulla",
      "oeste": "bosque_senda_niebla",
      "sur": "bosque_quebrada_niebla"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "bosque_refugio_patrulla",
      "inicio": "El refugio ofrece uno de sus camastros y un techo firme frente al bosque. Puedes recuperar fuerzas aquí, aunque el lugar carece de instalaciones para purificar estados complejos."
    }
  },
  "bosque_claro_humedo": {
    "id": "bosque_claro_humedo",
    "area": "bosques",
    "name": "Claro Húmedo",
    "desc": "Una depresión abierta concentra humedad suficiente para mantener helechos, musgos y vegetación densa incluso donde el dosel se interrumpe. El suelo cede bajo el peso en algunos sectores y pequeñas corrientes superficiales cambian de dirección entre piedras y raíces. La abundancia de vida hace difícil distinguir qué movimiento pertenece al viento y cuál no.",
    "scenery": {
  "helechos": "Frondas altas ocupan las zonas de tierra más profunda y ocultan buena parte del suelo.",
  "musgos": "Cubren troncos caídos y piedras con capas gruesas que retienen agua.",
  "charcos": "Pequeñas acumulaciones reflejan el dosel y muestran insectos, hojas y sedimento.",
  "troncos_caidos": "Madera húmeda en distintos grados de descomposición ofrece refugio a hongos y animales pequeños."
},
    "exits": {
      "norte": "bosque_senda_niebla",
      "oeste": "bosque_pinos_torcidos",
      "este": "bosque_quebrada_niebla",
      "sur": "bosque_loma_niebla"
    },
    "items": [],
    "mobs": [
      "avispa_jade",
      "avispa_jade",
      "mono_pildoras"
    ],
    "npcs": [],
    "vena": "normal",
    "salvaje": true,
    "oculto": []
  },
  "bosque_pinos_torcidos": {
    "id": "bosque_pinos_torcidos",
    "area": "bosques",
    "name": "Pinos Torcidos",
    "desc": "Un grupo de pinos crece inclinado y retorcido sobre terreno húmedo e irregular. Sus ramas se cruzan a baja altura y forman corredores estrechos donde la luz y la niebla se fragmentan entre agujas. El suelo está cubierto por capas de materia vegetal y fibras finas atrapadas entre ramas.",
    "scenery": {
  "pinos": "Los troncos se curvan en direcciones distintas, obligando a rodearlos en vez de seguir una línea recta.",
  "ramas": "Cruzan el paso a distintas alturas y crean espacios protegidos entre árboles.",
  "agujas": "Una capa espesa cubre el suelo y oculta raíces, piedras y pequeños desniveles.",
  "fibras": "Hilos naturales y restos de seda aparecen adheridos a algunas ramas sin formar una barrera continua."
},
    "exits": {
      "este": "bosque_claro_humedo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_quebrada_niebla": {
    "id": "bosque_quebrada_niebla",
    "area": "bosques",
    "name": "Quebrada de la Niebla",
    "desc": "El terreno se abre en una quebrada estrecha donde la niebla se concentra entre paredes de tierra y piedra. El fondo recoge agua de distintas pendientes y obliga a seguir tramos elevados para no caminar directamente sobre barro. La visibilidad cambia con cada curva sin que la ruta deje de ser reconocible.",
    "scenery": {
  "paredes": "Tierra compacta, raíces cortadas y roca expuesta forman bordes irregulares a ambos lados.",
  "fondo": "Agua y sedimento ocupan las zonas más bajas y dejan huellas claras de escorrentía.",
  "salientes": "Pequeños rebordes de piedra permiten avanzar por encima del barro.",
  "niebla": "Se queda atrapada en la quebrada y oculta las curvas antes de disiparse en zonas abiertas."
},
    "exits": {
      "norte": "bosque_refugio_patrulla",
      "oeste": "bosque_claro_humedo",
      "sur": "bosque_cauce_oculto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_cauce_oculto": {
    "id": "bosque_cauce_oculto",
    "area": "bosques",
    "name": "Cauce Oculto",
    "desc": "Un pequeño flujo corre entre rocas y raíces antes de desaparecer bajo una acumulación natural de piedra. Parte del agua vuelve a surgir unos pasos más adelante, demasiado poca para formar un arroyo visible desde lejos. Sin medirlo ni estudiarlo, el lugar parece simplemente una de tantas conducciones menores de la montaña.",
    "scenery": {
  "agua": "Una corriente estrecha aparece entre piedras y vuelve a ocultarse bajo ellas.",
  "rocas": "Bloques húmedos encajan de manera irregular y obligan al agua a dividirse en varios hilos.",
  "raices": "Raíces finas penetran en grietas y aprovechan la humedad constante del cauce.",
  "sedimento": "Arena y hojas se acumulan en remansos pequeños donde la corriente pierde fuerza."
},
    "exits": {
      "norte": "bosque_quebrada_niebla",
      "oeste": "bosque_loma_niebla",
      "este": "bosque_desvio_aguas"
    },
    "items": [],
    "mobs": [
      "serpiente_qi"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculto": []
  },
  "bosque_loma_niebla": {
    "id": "bosque_loma_niebla",
    "area": "bosques",
    "name": "Loma de la Niebla",
    "desc": "Una elevación suave sobresale lo suficiente para que la niebla se vuelva menos densa alrededor de su cresta. Los árboles crecen más separados y el terreno permite recuperar orientación antes de volver a zonas cerradas. Hacia abajo, varias depresiones muestran cómo el agua y la humedad estructuran esta parte del bosque.",
    "scenery": {
  "cresta": "Una franja estrecha de terreno firme ofrece el punto más seco de la loma.",
  "arboles": "Los troncos están más separados y permiten ver distancias algo mayores.",
  "pendientes": "A ambos lados descienden zonas húmedas cubiertas de musgo y hojarasca.",
  "piedras": "Pequeños afloramientos sirven como referencias visibles incluso cuando la niebla aumenta."
},
    "exits": {
      "norte": "bosque_claro_humedo",
      "este": "bosque_cauce_oculto",
      "sur": "bosque_umbral_alto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_desvio_aguas": {
    "id": "bosque_desvio_aguas",
    "area": "bosques",
    "name": "Desvío del Cauce",
    "desc": "La vegetación se abre junto a una ruta húmeda que sigue el descenso natural del agua hacia el este. Piedras resbaladizas y raíces oscuras acompañan el paso hasta que el bosque empieza a mezclarse con terreno de cauces y barrancos. Es un enlace ecológico evidente antes que una frontera construida.",
    "scenery": {
  "cauce": "Un hilo de agua acompaña la senda y gana volumen al recibir filtraciones laterales.",
  "piedras": "Superficies húmedas y lisas obligan a caminar con más atención.",
  "vegetacion": "Plantas de ribera sustituyen gradualmente a especies propias de suelo más seco.",
  "pendiente": "El terreno orienta agua y camino hacia la misma salida oriental."
},
    "exits": {
      "oeste": "bosque_cauce_oculto",
      "este": "aguas_senda_bosque"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_umbral_alto": {
    "id": "bosque_umbral_alto",
    "area": "bosques",
    "name": "Umbral del Bosque Alto",
    "desc": "El bosque cambia otra vez cuando el terreno gana altura y exposición. La niebla deja de permanecer tan baja, los troncos se vuelven más espaciados y aparecen roca desnuda, viento y pendientes más marcadas. Las señales de patrulla son menos frecuentes: no porque el lugar esté abandonado, sino porque se recorre menos.",
    "scenery": {
  "roca": "Afloramientos claros interrumpen el suelo forestal y ofrecen superficies secas expuestas.",
  "viento": "Las corrientes atraviesan con mayor libertad los espacios entre árboles.",
  "marcas": "Las señales humanas existen, pero aparecen separadas por tramos más largos.",
  "vegetacion": "Arbustos bajos y pinos resistentes sustituyen parte del sotobosque húmedo."
},
    "exits": {
      "norte": "bosque_loma_niebla",
      "sur": "bosque_ladera_alta"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_ladera_alta": {
    "id": "bosque_ladera_alta",
    "area": "bosques",
    "name": "Ladera Alta",
    "desc": "Una ladera amplia reparte varias rutas por el Bosque Alto. El suelo alterna tierra firme, piedra y raíces expuestas, mientras el viento atraviesa huecos que antes cerraba la vegetación. Desde aquí se percibe que el bosque ya no forma una masa continua: la montaña empieza a imponer crestas, corredores y hondonadas.",
    "scenery": {
  "ladera": "La pendiente cambia de forma irregular y obliga a elegir trayectorias distintas según el terreno.",
  "pinos": "Árboles resistentes crecen más separados y con copas deformadas por la exposición.",
  "rocas": "Bloques claros emergen del suelo y sirven como referencias visibles desde varios puntos.",
  "senderos": "Las rutas se separan con claridad hacia pinar, rocas y terreno más profundo."
},
    "exits": {
      "norte": "bosque_umbral_alto",
      "oeste": "bosque_pinar_alto",
      "este": "bosque_rocas_blancas",
      "sur": "bosque_corredor_viento"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_pinar_alto": {
    "id": "bosque_pinar_alto",
    "area": "bosques",
    "name": "Pinar Alto",
    "desc": "Pinos maduros ocupan una ladera protegida donde el suelo se vuelve más seco y áspero. Las copas altas dejan corredores de sombra estrechos y una capa profunda de agujas reduce el crecimiento del sotobosque. El silencio entre troncos es mayor que en las zonas húmedas, interrumpido por crujidos y movimientos difíciles de localizar.",
    "scenery": {
  "troncos": "Pinos gruesos muestran corteza agrietada, resina y cicatrices de clima severo.",
  "agujas": "Cubren el suelo y ocultan huellas ligeras con facilidad.",
  "claros": "Pequeñas aperturas entre árboles permiten ver tramos de la pendiente sin revelar toda la ruta.",
  "rastros": "Marcas en corteza y tierra indican el paso de animales de distinto tamaño sin asegurar que sigan presentes."
},
    "exits": {
      "este": "bosque_ladera_alta",
      "sur": "bosque_paso_hundido"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_rocas_blancas": {
    "id": "bosque_rocas_blancas",
    "area": "bosques",
    "name": "Rocas Blancas",
    "desc": "Bloques de piedra pálida emergen de la ladera formando líneas quebradas entre árboles bajos. La superficie clara contrasta con el suelo oscuro y permite reconocer el lugar desde cierta distancia. Grietas, vetas y orientaciones distintas muestran cómo la roca aflora bajo el bosque sin necesidad de explicar todavía qué patrón puede ocultar.",
    "scenery": {
  "bloques": "Piedras claras de distintos tamaños sobresalen como lomos a través de tierra y raíces.",
  "vetas": "Líneas minerales atraviesan algunas superficies y cambian de dirección entre bloques.",
  "grietas": "Fisuras estrechas acumulan polvo, musgo y pequeñas raíces.",
  "alineaciones": "Varios afloramientos parecen continuar bajo el suelo, aunque a simple vista no resulta claro dónde."
},
    "exits": {
      "oeste": "bosque_ladera_alta",
      "sur": "bosque_mirador_alto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_corredor_viento": {
    "id": "bosque_corredor_viento",
    "area": "bosques",
    "name": "Corredor del Viento",
    "desc": "Dos elevaciones canalizan el aire a través de un tramo relativamente abierto del bosque. Los árboles crecen bajos o inclinados y el suelo permanece más seco que en las depresiones cercanas. Avanzar aquí expone más al terreno y al movimiento alrededor, pero también permite orientarse mejor entre las rutas altas.",
    "scenery": {
  "corriente": "El aire atraviesa el corredor con suficiente fuerza para mover ramas incluso cuando otros sectores quedan quietos.",
  "arboles": "Troncos inclinados y copas irregulares revelan exposición prolongada.",
  "suelo": "Piedra suelta y tierra seca sustituyen buena parte del musgo de cotas inferiores.",
  "bordes": "Las elevaciones laterales forman paredes naturales bajas sin cerrar el paso."
},
    "exits": {
      "norte": "bosque_ladera_alta",
      "este": "bosque_mirador_alto",
      "sur": "bosque_hondonada"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "pobre",
    "salvaje": true,
    "oculto": []
  },
  "bosque_paso_hundido": {
    "id": "bosque_paso_hundido",
    "area": "bosques",
    "name": "Paso Hundido",
    "desc": "Un paso estrecho desciende entre taludes de tierra y roca antes de volver a ganar altura hacia la hondonada. La forma del terreno concentra huellas, olores y sonidos en un espacio reducido, y las rutas animales atraviesan el mismo cuello que las personas. No hay nada que obligue a enfrentarse con una criatura concreta, pero es evidente que el lugar pertenece también a la fauna del Bosque Alto.",
    "scenery": {
  "taludes": "Paredes bajas de tierra compacta muestran raíces cortadas y desprendimientos antiguos.",
  "sendero": "El paso central es firme pero estrecho, marcado por pisadas de tamaños muy distintos.",
  "rasguños": "Algunas piedras conservan marcas producidas por garras o cuerpos al rozar el corredor.",
  "salida": "Hacia el este el terreno vuelve a abrirse, mientras el norte asciende hacia el pinar."
},
    "exits": {
      "norte": "bosque_pinar_alto",
      "este": "bosque_hondonada"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "pobre",
    "salvaje": true,
    "oculto": []
  },
  "bosque_hondonada": {
    "id": "bosque_hondonada",
    "area": "bosques",
    "name": "Hondonada Alta",
    "desc": "Una depresión amplia reúne rutas procedentes del corredor, el paso hundido y las sendas orientales. El aire se mueve menos aquí y la vegetación aprovecha tierra más profunda entre paredes naturales de roca y raíces. Las múltiples entradas convierten la hondonada en zona de paso para fauna y patrullas, no en destino único.",
    "scenery": {
  "depresion": "El suelo desciende suavemente hacia el centro y vuelve a elevarse en varias direcciones.",
  "vegetacion": "Matorrales densos aprovechan la tierra protegida del viento.",
  "huellas": "Rastros se cruzan y superponen, haciendo difícil atribuirlos a un solo recorrido.",
  "paredes": "Roca y raíces forman límites parciales que canalizan el movimiento sin cerrar el lugar."
},
    "exits": {
      "norte": "bosque_corredor_viento",
      "oeste": "bosque_paso_hundido",
      "este": "bosque_senda_aguas_alta",
      "sur": "bosque_collado_alto"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "pobre",
    "salvaje": true,
    "oculto": []
  },
  "bosque_mirador_alto": {
    "id": "bosque_mirador_alto",
    "area": "bosques",
    "name": "Mirador del Bosque Alto",
    "desc": "Una saliente despejada permite observar fragmentos del Bosque Alto, las rutas hacia Cantera y el descenso hacia los barrancos. No ofrece una vista completa de la montaña, pero sí suficiente perspectiva para comprender cómo se relacionan crestas, hondonadas y corredores. La exposición al viento mantiene baja la vegetación del borde.",
    "scenery": {
  "saliente": "Roca firme forma una plataforma natural por encima de parte del bosque.",
  "vista_cantera": "Hacia un lado se distinguen cortes de terreno y colores minerales asociados a la zona de extracción.",
  "vista_aguas": "En otra dirección, las pendientes descienden hacia cauces y barrancos parcialmente ocultos.",
  "rocas": "Bloques expuestos presentan vetas y fracturas fáciles de comparar desde este punto."
},
    "exits": {
      "norte": "bosque_rocas_blancas",
      "oeste": "bosque_corredor_viento",
      "este": "bosque_senda_cantera",
      "sur": "bosque_senda_aguas_alta"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "pobre",
    "salvaje": true,
    "oculto": []
  },
  "bosque_senda_cantera": {
    "id": "bosque_senda_cantera",
    "area": "bosques",
    "name": "Senda de la Cantera",
    "desc": "Una senda pedregosa abandona el Bosque Alto hacia terrenos donde aumenta la roca expuesta y disminuye la cobertura vegetal. El paso es más estrecho que las rutas logísticas de Producción y Valle, adecuado para patrullas y tránsito ligero. La transición hacia Cantera ocurre por el suelo antes que por una señal formal.",
    "scenery": {
  "piedras": "Fragmentos claros y oscuros se vuelven más abundantes a medida que la senda avanza.",
  "arboles": "Los ejemplares grandes se espacian y dejan sitio a arbustos bajos.",
  "marcas": "Señales de orientación de patrulla indican el regreso al mirador y el avance hacia Cantera.",
  "huellas": "Pisadas humanas y rastros de fauna comparten un sendero demasiado estrecho para ocultarse por completo."
},
    "exits": {
      "oeste": "bosque_mirador_alto",
      "este": "cantera_senda_bosque"
    },
    "items": [],
    "mobs": [
      "lobo_espiritual"
    ],
    "npcs": [],
    "vena": "pobre",
    "salvaje": true,
    "oculto": []
  },
  "bosque_senda_aguas_alta": {
    "id": "bosque_senda_aguas_alta",
    "area": "bosques",
    "name": "Senda de los Barrancos",
    "desc": "El terreno desciende hacia el este por una senda donde la piedra húmeda empieza a dominar sobre la tierra forestal. Se escucha agua antes de verla con claridad, y las raíces aprovechan grietas que conducen humedad desde niveles inferiores. El Bosque Alto termina aquí sin un corte brusco y da paso a la geografía de cauces y barrancos.",
    "scenery": {
  "piedra": "Bloques húmedos forman escalones naturales y superficies irregulares.",
  "filtraciones": "Hilos de agua aparecen en grietas y desaparecen bajo el suelo.",
  "raices": "Árboles del borde penetran en fisuras profundas en busca de humedad.",
  "sonido": "El agua de niveles inferiores se vuelve más clara a medida que la senda desciende."
},
    "exits": {
      "norte": "bosque_mirador_alto",
      "oeste": "bosque_hondonada",
      "este": "aguas_paso_alto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "bosque_collado_alto": {
    "id": "bosque_collado_alto",
    "area": "bosques",
    "name": "Collado Alto",
    "desc": "Un collado estrecho ocupa una depresión entre elevaciones y ofrece suelo firme donde el bosque se abre por un momento. El viento llega desde más de una vertiente y mantiene la vegetación baja, dejando visibles piedras, hierbas resistentes y huellas de tránsito animal. Es un punto remoto pero legible, útil para orientarse antes de regresar hacia la hondonada.",
    "scenery": {
  "collado": "La forma del terreno crea un paso natural entre dos elevaciones sin necesidad de obra humana.",
  "hierbas": "Especies bajas y resistentes ocupan grietas y zonas protegidas del viento.",
  "piedras": "Rocas redondeadas y fragmentos sueltos sirven como referencias estables.",
  "huellas": "Rastros aislados cruzan el paso sin concentrarse como en el Paso Hundido."
},
    "exits": {
      "norte": "bosque_hondonada"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "cantera_acceso_secta": {
    "id": "cantera_acceso_secta",
    "area": "cantera_vetas",
    "name": "Acceso de la Cantera",
    "desc": "El camino procedente de Producción desemboca en una entrada amplia donde la piedra natural empieza a mezclarse con muros de contención, rampas y superficies reforzadas. El tránsito pesado ha dejado marcas profundas sin convertir el lugar en ruina. Desde aquí la cantera se presenta primero como lugar de trabajo, no como territorio de aventura.",
    "scenery": {
  "muros": "Bloques de piedra sostienen los taludes y muestran reparaciones de distintas épocas.",
  "rodadas": "Surcos paralelos revelan el paso constante de carros cargados.",
  "señales": "Tablillas indican patio, carga y rutas de salida sin decorar el acceso.",
  "polvo": "Una capa fina se acumula en bordes y grietas pese al tránsito continuo."
},
    "exits": {
      "oeste": "camino_cantera",
      "este": "patio_canteros"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "patio_canteros": {
    "id": "patio_canteros",
    "area": "cantera_vetas",
    "name": "Patio de los Canteros",
    "desc": "Un patio duro y despejado organiza el movimiento entre oficina, barracón, rampa y frente de trabajo. Herramientas, cajas de cuñas y recipientes de agua ocupan los bordes, dejando el centro libre para cargas y grupos de trabajadores. La actividad aquí se mide en piedra movida, reparaciones y seguridad.",
    "scenery": {
  "herramientas": "Picos, mazas y palancas se agrupan en soportes según tamaño y uso.",
  "cajas": "Cuñas, clavos y piezas de recambio se guardan en contenedores cerrados.",
  "abrevaderos": "Recipientes grandes mantienen agua para trabajo, limpieza y animales de carga.",
  "suelo": "Piedra compacta con zonas más claras donde el polvo fue barrido recientemente."
},
    "exits": {
      "oeste": "cantera_acceso_secta",
      "norte": "oficina_capataz",
      "sur": "barracon_canteros",
      "este": "rampa_carga_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "oficina_capataz": {
    "id": "oficina_capataz",
    "area": "cantera_vetas",
    "name": "Oficina del Capataz",
    "desc": "Una oficina baja reúne mapas de frentes, registros de extracción y anotaciones sobre seguridad. La mesa principal está más marcada por polvo mineral que por tinta, y varias tablillas muestran turnos, cargas y zonas que requieren inspección. Administrar la cantera significa saber qué puede extraerse sin comprometer el resto.",
    "scenery": {
  "mapas": "Esquemas de galerías y frentes usan líneas simples, cotas y marcas de riesgo.",
  "registros": "Tablillas de producción anotan volumen, procedencia y destino de los materiales.",
  "muestras": "Pequeños fragmentos de roca etiquetados ayudan a comparar vetas y calidad.",
  "mesa": "La superficie está surcada por polvo fino que vuelve a aparecer tras cada limpieza."
},
    "exits": {
      "sur": "patio_canteros",
      "este": "frente_abierto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "barracon_canteros": {
    "id": "barracon_canteros",
    "area": "cantera_vetas",
    "name": "Barracón de Canteros",
    "desc": "Camastros resistentes, arcones y una pequeña zona de primeros auxilios ocupan un barracón pensado para quienes trabajan cerca de los frentes de extracción. Ropa cubierta de polvo mineral cuelga separada de mantas y vendas limpias. El refugio es civilizado y seguro, aunque su identidad siga siendo la de un alojamiento de trabajo.",
    "scenery": {
  "camastros": "Estructuras de madera robusta con colchones sencillos y mantas gruesas.",
  "ropa": "Prendas de trabajo se dejan en ganchos próximos a la entrada para no extender polvo por todo el recinto.",
  "botiquin": "Vendas, férulas y ungüentos básicos permiten atender accidentes menores.",
  "arcones": "Cajas personales guardan herramientas pequeñas y objetos de uso cotidiano."
},
    "exits": {
      "norte": "patio_canteros"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "barracon_canteros",
      "inicio": "Te asignan un camastro dentro del barracón. El lugar huele a piedra y tela seca, pero ofrece descanso seguro y atención básica antes de regresar a las galerías."
    }
  },
  "rampa_carga_cantera": {
    "id": "rampa_carga_cantera",
    "area": "cantera_vetas",
    "name": "Rampa de Carga",
    "desc": "Una rampa ancha conecta el patio con los sectores donde el material extraído se prepara para salir. Maderos transversales mejoran el agarre y varios puntos de anclaje permiten controlar carros pesados en pendiente. La estructura existe para mover toneladas sin convertir cada traslado en un riesgo.",
    "scenery": {
  "maderos": "Listones encastrados atraviesan la pendiente y reducen el deslizamiento.",
  "anclajes": "Argollas metálicas permiten asegurar cuerdas y frenar cargas.",
  "bordes": "Muros bajos contienen piedras sueltas y separan el paso peatonal.",
  "marcas": "Trazos de tiza indican carriles de subida, bajada y espera."
},
    "exits": {
      "oeste": "patio_canteros",
      "norte": "frente_abierto",
      "este": "cantera_camino_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "frente_abierto": {
    "id": "frente_abierto",
    "area": "cantera_vetas",
    "name": "Frente de Cantera",
    "desc": "La montaña aparece cortada en terrazas y planos de extracción donde herramientas recientes dejan huellas claras sobre la roca. Montones separados distinguen material aprovechable, escombro y piezas pendientes de clasificación. Es un frente activo y comprensible: aquí la piedra todavía responde a técnicas conocidas.",
    "scenery": {
  "cortes": "Superficies escalonadas muestran líneas de cincel y fracturas provocadas de manera controlada.",
  "escombro": "Fragmentos descartados se acumulan lejos de las rutas principales.",
  "marcas": "Trazos de carbón señalan zonas previstas para nuevos cortes.",
  "soportes": "Maderos y cuñas estabilizan puntos donde la roca presenta fracturas delicadas."
},
    "exits": {
      "oeste": "oficina_capataz",
      "sur": "rampa_carga_cantera",
      "este": "terraza_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "terraza_cantera": {
    "id": "terraza_cantera",
    "area": "cantera_vetas",
    "name": "Terraza Norte",
    "desc": "Una terraza elevada marca la transición entre el frente de extracción y las rutas que se internan hacia laderas y vetas. El suelo mezcla grava, roca desnuda y huellas de herramientas, mientras la vegetación reaparece en grietas protegidas. Desde aquí puede elegirse seguir hacia el bosque o descender a zonas más profundas.",
    "scenery": {
  "borde": "Un desnivel rocoso permite ver parte del frente de cantera por debajo.",
  "vegetacion": "Hierbas resistentes crecen en grietas donde se acumula tierra.",
  "senderos": "Rutas de trabajo y patrulla se separan con marcas sencillas.",
  "roca": "Afloramientos de distintos tonos anticipan cambios minerales hacia el subsuelo."
},
    "exits": {
      "oeste": "frente_abierto",
      "norte": "cantera_senda_bosque",
      "sur": "cruce_vetas"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "cantera_camino_valle": {
    "id": "cantera_camino_valle",
    "area": "cantera_vetas",
    "name": "Camino del Valle",
    "desc": "Una vía reforzada enlaza directamente la cantera con los campos occidentales del Valle. El firme está preparado para carros pesados y evita pendientes bruscas mediante curvas amplias. Por aquí sale mineral y regresan provisiones sin necesidad de atravesar el recinto principal de la secta.",
    "scenery": {
  "rodadas": "Surcos profundos se superponen sobre una base de piedra compactada.",
  "curvas": "El trazado evita giros cerrados para no desestabilizar cargas.",
  "mojones": "Señales de distancia indican Cantera y Valle.",
  "cunetas": "Drenajes laterales protegen el firme de la escorrentía."
},
    "exits": {
      "oeste": "rampa_carga_cantera",
      "este": "camino_cantera_valle"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "cantera_senda_bosque": {
    "id": "cantera_senda_bosque",
    "area": "cantera_vetas",
    "name": "Senda del Bosque Alto",
    "desc": "Una senda estrecha asciende desde la terraza hacia el Bosque Alto, donde la cobertura vegetal gana espacio sobre la roca trabajada. No sirve para grandes cargas, pero sí para patrullas, mensajeros y desplazamientos ligeros. La frontera entre cantera y bosque se vuelve difusa en pocos pasos.",
    "scenery": {
  "piedras": "Fragmentos minerales quedan mezclados con tierra, agujas y raíces.",
  "huellas": "Pisadas humanas y animales comparten el sendero sin llegar a borrar su trazado.",
  "marcas": "Señales de patrulla indican la dirección de la terraza y del bosque.",
  "arbustos": "La vegetación invade los bordes donde ya no pasan carros."
},
    "exits": {
      "sur": "terraza_cantera",
      "oeste": "bosque_senda_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "cruce_vetas": {
    "id": "cruce_vetas",
    "area": "cantera_vetas",
    "name": "Cruce de las Vetas",
    "desc": "Varias vetas minerales convergen cerca de una abertura que desciende al subsuelo. Hasta aquí predominan refuerzos modernos, marcas de extracción y rutas bien documentadas, pero la roca empieza a mostrar cambios de color y textura difíciles de seguir desde la superficie. Es un umbral de trabajo antes que un acceso ceremonial.",
    "scenery": {
  "vetas": "Líneas minerales de tonos distintos atraviesan paredes y suelo en direcciones cruzadas.",
  "abertura": "Un descenso reforzado conduce hacia niveles inferiores de extracción.",
  "marcas": "Números y símbolos de los canteros identifican sectores inspeccionados.",
  "refuerzos": "Vigas y anclajes recientes estabilizan el acceso al pozo."
},
    "exits": {
      "norte": "terraza_cantera",
      "abajo": "pozo_extraccion"
    },
    "items": [],
    "mobs": [
      "eco_caido"
    ],
    "npcs": [],
    "vena": "rica",
    "oculta": true,
    "oculto": []
  },
  "pozo_extraccion": {
    "id": "pozo_extraccion",
    "area": "cantera_vetas",
    "name": "Pozo de Extracción",
    "desc": "Un pozo amplio distribuye galerías subterráneas alrededor de un eje de descenso reforzado. Poleas, plataformas y restos de raíles simples muestran que el lugar fue adaptado para mover personas y mineral bajo tierra. Las superficies modernas siguen siendo dominantes, aunque algunos tramos de roca parecen haber sido aprovechados en vez de abiertos desde cero.",
    "scenery": {
  "poleas": "Ruedas y cuerdas permiten elevar cargas desde niveles inferiores.",
  "plataformas": "Superficies de madera ofrecen puntos de carga y espera sin bloquear las galerías.",
  "paredes": "Cortes recientes alternan con superficies más lisas cuya procedencia no resulta evidente.",
  "marcas": "Flechas y códigos de explotación orientan hacia distintas galerías."
},
    "exits": {
      "arriba": "cruce_vetas",
      "este": "galeria_veta_negra",
      "sur": "galeria_murcielagos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "galeria_veta_negra": {
    "id": "galeria_veta_negra",
    "area": "cantera_vetas",
    "name": "Galería de la Veta Negra",
    "desc": "La galería sigue una franja mineral oscura que atraviesa la roca con continuidad poco habitual. Los soportes y cortes mineros son recientes, pero la veta absorbe la luz y hace difícil estimar profundidad o espesor en algunos puntos. Por ahora puede entenderse como una formación geológica extraña y valiosa.",
    "scenery": {
  "veta": "Una banda casi negra recorre la pared y reaparece en el suelo antes de perderse hacia adelante.",
  "soportes": "Maderos y anclajes modernos mantienen estable la galería.",
  "polvo": "Partículas oscuras manchan herramientas y botas con mayor facilidad que en otros sectores.",
  "frentes": "Pequeñas marcas muestran dónde se probaron extracciones sin ampliar aún el túnel."
},
    "exits": {
      "oeste": "pozo_extraccion",
      "este": "veta_negra"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "veta_negra": {
    "id": "veta_negra",
    "area": "cantera_vetas",
    "name": "Veta Negra",
    "desc": "La franja oscura domina aquí una cámara de extracción donde temperatura, humedad y sensación de presión cambian con pequeñas distancias. Herramientas y marcas de trabajo demuestran que los canteros llevan tiempo observando el fenómeno sin resolverlo del todo. Nada en la sala explica por sí mismo si el origen es mineral, térmico o espiritual.",
    "scenery": {
  "mineral": "La veta forma placas y nervaduras oscuras con reflejos apenas visibles.",
  "temperatura": "Algunos puntos de la roca se sienten distintos al tacto pese a estar próximos.",
  "fisuras": "Grietas finas conducen aire y humedad desde niveles inferiores.",
  "marcas": "Anotaciones de trabajo comparan zonas de extracción y cambios observados."
},
    "exits": {
      "oeste": "galeria_veta_negra",
      "norte": "camara_hierro",
      "abajo": "desvio_termal"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "resentida",
    "salvaje": true,
    "oculto": []
  },
  "camara_hierro": {
    "id": "camara_hierro",
    "area": "cantera_vetas",
    "name": "Cámara del Hierro",
    "desc": "Una cavidad rica en mineral ferruginoso presenta paredes rojizas, concreciones densas y restos de extracción selectiva. La roca ofrece refugios naturales entre placas y grietas, de modo que el lugar parece tan apto para fauna subterránea como para minería. El espacio lateral evita que sea una ruta obligatoria.",
    "scenery": {
  "paredes": "Tonos rojizos y negros señalan concentraciones de hierro en capas desiguales.",
  "placas": "Fragmentos duros sobresalen de las paredes formando pequeños resguardos.",
  "herramientas": "Marcas de pico muestran intentos de extracción en sectores concretos.",
  "suelo": "Polvo metálico y grava oscura se acumulan en depresiones."
},
    "exits": {
      "sur": "veta_negra",
      "este": "nido_escarabajos"
    },
    "items": [
      "caparazon_hierro"
    ],
    "mobs": [],
    "npcs": []
  },
  "nido_escarabajos": {
    "id": "nido_escarabajos",
    "area": "cantera_vetas",
    "name": "Nido de Escarabajos",
    "desc": "La roca se abre en una cavidad perforada por huecos, surcos y acumulaciones de material triturado, entre las que asoman pequeños destellos de hierro pulido. Restos de caparazones, marcas de arrastre y pequeñas galerías laterales indican uso frecuente por fauna adaptada al mineral. Nada obliga a que sus ocupantes estén presentes cada vez que alguien entra.",
    "scenery": {
  "huecos": "Aberturas de distintos tamaños penetran en paredes y suelo.",
  "caparazones": "Fragmentos duros y vacíos se acumulan en rincones protegidos.",
  "surcos": "Marcas repetidas recorren la piedra a baja altura.",
  "mineral": "Pequeños trozos de hierro aparecen pulidos o desplazados entre los restos."
},
    "exits": {
      "oeste": "camara_hierro",
      "sur": "sima_resonante"
    },
    "items": [],
    "mobs": [
      "escarabajo_hierro",
      "escarabajo_hierro",
      "rey_escarabajo"
    ],
    "npcs": []
  },
  "sima_resonante": {
    "id": "sima_resonante",
    "area": "cantera_vetas",
    "name": "Sima Resonante",
    "desc": "Una abertura profunda corta la galería y devuelve sonidos con una regularidad difícil de atribuir solo a la forma visible del vacío. Pasarelas y anclajes modernos bordean el sector, mientras la roca inferior permanece fuera de alcance directo. La resonancia resulta extraña, pero todavía no revela por sí misma ninguna explicación.",
    "scenery": {
  "sima": "La abertura desciende más allá de la luz inmediata y obliga a mantenerse cerca de los bordes seguros.",
  "eco": "Golpes y voces regresan con intervalos sorprendentemente regulares.",
  "anclajes": "Pernos y cuerdas modernas aseguran puntos de paso alrededor del vacío.",
  "paredes": "Algunas superficies son irregulares y otras parecen demasiado uniformes para el resto de la cavidad."
},
    "exits": {
      "norte": "nido_escarabajos",
      "oeste": "galeria_murcielagos",
      "este": "galeria_antigua_cantera"
    },
    "items": [],
    "mobs": [
      "escarabajo_hierro"
    ],
    "npcs": [],
    "vena": "normal",
    "salvaje": true,
    "oculto": []
  },
  "galeria_murcielagos": {
    "id": "galeria_murcielagos",
    "area": "cantera_vetas",
    "name": "Galería de los Murciélagos",
    "desc": "Una galería alta ofrece grietas, cornisas y techos capaces de albergar fauna voladora lejos del tránsito principal. El suelo presenta manchas de guano seco, restos de insectos y marcas de limpieza ocasional cerca del paso. La amplitud vertical vuelve el lugar más sonoro que otras galerías.",
    "scenery": {
  "techo": "Fisuras y repisas se pierden en zonas de sombra por encima del alcance de la mano.",
  "guano": "Depósitos secos se concentran lejos del centro del sendero.",
  "paredes": "La roca muestra arañazos finos y pequeñas manchas minerales.",
  "sonido": "Cualquier ruido breve se multiplica entre techo y paredes."
},
    "exits": {
      "norte": "pozo_extraccion",
      "este": "sima_resonante"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "desvio_termal": {
    "id": "desvio_termal",
    "area": "cantera_vetas",
    "name": "Desvío Termal",
    "desc": "El aire se vuelve más cálido y húmedo donde una galería secundaria desciende hacia roca fracturada por filtraciones calientes. El desvío conecta una cámara lateral con un paso hacia Aguas sin obligar a atravesar ninguno de los dos. La transición térmica resulta gradual y geológicamente plausible.",
    "scenery": {
  "vapor": "Una humedad tibia se concentra en grietas antes de disiparse por la galería.",
  "roca": "Las superficies cercanas muestran depósitos minerales de tonos claros.",
  "fisuras": "Pequeñas fracturas dejan escapar calor y gotas de agua.",
  "bifurcacion": "Las rutas hacia caldera y filtraciones se separan sin puerta ni señal ceremonial."
},
    "exits": {
      "arriba": "veta_negra",
      "este": "camara_caldera",
      "sur": "paso_aguas_cantera"
    },
    "items": [],
    "mobs": [
      "sapo_ceniza"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculto": []
  },
  "camara_caldera": {
    "id": "camara_caldera",
    "area": "cantera_vetas",
    "name": "Cámara de la Caldera",
    "desc": "Una cavidad lateral concentra calor geotérmico alrededor de pozas poco profundas y roca oscurecida por minerales. El suelo obliga a escoger zonas firmes entre placas húmedas y depósitos calientes. Es un territorio natural extremo, adecuado para fauna especializada, pero no una cámara construida como desafío.",
    "scenery": {
  "pozas": "Pequeñas acumulaciones de agua caliente liberan vapor irregular.",
  "costras": "Depósitos minerales forman bordes duros alrededor de las zonas húmedas.",
  "roca": "La piedra cambia de color cerca de las fuentes de calor.",
  "huellas": "Marcas y rastros aparecen entre sectores secos sin garantizar que su dueño siga allí."
},
    "exits": {
      "oeste": "desvio_termal"
    },
    "items": [],
    "mobs": [
      "sapo_caldera"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculto": []
  },
  "paso_aguas_cantera": {
    "id": "paso_aguas_cantera",
    "area": "cantera_vetas",
    "name": "Paso de las Filtraciones",
    "desc": "La galería pierde calor y gana humedad hasta transformarse en un corredor donde el agua corre por grietas y canales naturales. Las marcas mineras se vuelven menos frecuentes mientras aumenta la roca lavada por filtraciones. El paso une Cantera y Aguas sin necesidad de una frontera artificial.",
    "scenery": {
  "filtraciones": "Hilos de agua bajan por paredes y se reúnen en pequeños canales.",
  "temperatura": "El aire se enfría respecto del desvío termal.",
  "marcas_minas": "Cortes y señales de extracción se vuelven más escasos hacia el sector húmedo.",
  "suelo": "Piedra lisa y grava mojada sustituyen progresivamente al polvo mineral."
},
    "exits": {
      "norte": "desvio_termal",
      "sur": "aguas_filtraciones_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "galeria_antigua_cantera": {
    "id": "galeria_antigua_cantera",
    "area": "cantera_vetas",
    "name": "Galería Antigua",
    "desc": "Los cortes irregulares de la explotación moderna dejan paso a un tramo donde algunas superficies parecen más antiguas y precisas. Los canteros han aprovechado el espacio sin reproducir su técnica, reforzando solo los puntos necesarios para usarlo como galería. La diferencia es visible, pero su función original no resulta clara.",
    "scenery": {
  "superficies": "Sectores de piedra presentan planos más regulares que los túneles excavados alrededor.",
  "juntas": "Algunas líneas rectas parecen pertenecer a una obra anterior al frente moderno.",
  "refuerzos": "Vigas recientes se apoyan sobre estructuras mucho más viejas.",
  "polvo": "La acumulación en hendiduras ayuda a distinguir qué cortes son nuevos y cuáles no."
},
    "exits": {
      "oeste": "sima_resonante",
      "este": "conducto_antiguo_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "conducto_antiguo_cantera": {
    "id": "conducto_antiguo_cantera",
    "area": "cantera_vetas",
    "name": "Conducto de Piedra Blanca",
    "desc": "Un conducto revestido con piedra pálida alcanza una sección trabajada que los trabajos de cantera han preferido rodear. El material y la precisión de las juntas no coinciden con las técnicas visibles en las galerías modernas, aunque el lugar se usa como referencia de mantenimiento. Nada indica todavía adónde continuaba la obra.",
    "scenery": {
  "piedra_blanca": "Bloques claros forman paredes más regulares que la roca excavada alrededor.",
  "juntas": "Las uniones estrechas conservan una precisión poco común en la cantera.",
  "sello": "Encajes de piedra alrededor del tramo muestran que esta sección podía aislarse del resto del conducto; desde este lado no se distingue la lógica completa del mecanismo.",
  "marcas_modernas": "Números y notas de canteros señalan que el lugar fue inspeccionado y dejado intacto."
},
    "exits": {
      "oeste": "galeria_antigua_cantera",
      "abajo": "ala_cantera_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_senda_bosque": {
    "id": "aguas_senda_bosque",
    "area": "aguas_barrancos",
    "name": "Senda del Cauce",
    "desc": "Una senda húmeda abandona el bosque siguiendo el descenso de un cauce que gana presencia entre piedras y raíces. La vegetación cambia hacia especies de ribera y el suelo obliga a alternar tierra firme con roca mojada. La región de Aguas comienza por continuidad natural, no por una entrada construida.",
    "scenery": {
  "cauce": "El agua acompaña la senda y gana volumen al recibir pequeñas filtraciones.",
  "raices": "Árboles del borde se agarran a grietas húmedas y taludes blandos.",
  "piedras": "Superficies lisas muestran marcas de corriente y sedimento.",
  "vegetacion": "Musgos, juncos y plantas de ribera sustituyen al sotobosque más seco."
},
    "exits": {
      "oeste": "bosque_desvio_aguas",
      "sur": "aguas_cauce_alto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_cauce_alto": {
    "id": "aguas_cauce_alto",
    "area": "aguas_barrancos",
    "name": "Cauce Alto",
    "desc": "Una corriente principal desciende entre plataformas de roca y pequeños desniveles, suficientemente abierta para orientarse sin dejar de exigir cuidado. El agua conecta varias rutas y terrazas húmedas antes de internarse en barrancos más cerrados. Patrullas y fauna utilizan los mismos puntos de cruce sin que el lugar pierda su carácter natural.",
    "scenery": {
  "corriente": "El agua corre sobre grava y piedra, variando profundidad según el relieve.",
  "orillas": "Franjas de suelo firme permiten avanzar sin permanecer dentro del cauce.",
  "remansos": "Pequeñas zonas tranquilas acumulan hojas, arena y restos vegetales.",
  "marcas": "Piedras señaladas ayudan a identificar rutas de patrulla y puntos seguros de paso."
},
    "exits": {
      "norte": "aguas_senda_bosque",
      "este": "aguas_paso_piedras",
      "sur": "aguas_terraza_humeda"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_paso_piedras": {
    "id": "aguas_paso_piedras",
    "area": "aguas_barrancos",
    "name": "Paso de las Piedras",
    "desc": "Grandes bloques emergen del cauce formando un cruce natural que ha sido estabilizado con pequeñas correcciones humanas. El agua circula entre ellos con suficiente fuerza para volver resbaladizos los bordes, pero el paso sigue siendo una ruta conocida. Desde aquí se accede tanto a una poza tranquila como al refugio del cauce.",
    "scenery": {
  "bloques": "Piedras grandes y firmes sobresalen por encima del nivel habitual del agua.",
  "superficie": "Musgo y humedad cubren sectores donde conviene evitar apoyar el pie.",
  "anclajes": "Pequeñas cuñas y marcas muestran dónde las patrullas estabilizaron el cruce.",
  "corriente": "El agua se divide alrededor de los bloques y vuelve a reunirse unos metros más abajo."
},
    "exits": {
      "oeste": "aguas_cauce_alto",
      "este": "aguas_poza_clara",
      "sur": "aguas_refugio_cauce"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_poza_clara": {
    "id": "aguas_poza_clara",
    "area": "aguas_barrancos",
    "name": "Poza Clara",
    "desc": "Una depresión de roca contiene agua transparente y relativamente quieta antes de que el cauce vuelva a estrecharse. El fondo puede distinguirse cerca de las orillas, donde grava clara y plantas acuáticas se mueven con lentitud. La calma del sitio no lo convierte en un estanque artificial ni en un santuario.",
    "scenery": {
  "agua": "La transparencia permite ver piedras y sedimento en los sectores menos profundos.",
  "fondo": "Grava clara alterna con placas de roca lisa.",
  "plantas": "Vegetación acuática baja se concentra donde la corriente pierde fuerza.",
  "orilla": "Losas naturales ofrecen puntos firmes para acercarse al agua."
},
    "exits": {
      "oeste": "aguas_paso_piedras",
      "sur": "aguas_inicio_barranco"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "vena": "rica",
    "oculto": [
      "manual_sello",
      "bolsa_piedras"
    ],
    "purificaMeditacion": true
  },
  "aguas_refugio_cauce": {
    "id": "aguas_refugio_cauce",
    "area": "aguas_barrancos",
    "name": "Refugio del Cauce",
    "desc": "Un refugio bajo de piedra aprovecha una terraza protegida junto al agua para ofrecer techo, lecho elevado y suministros mínimos. Está hecho para patrullas y viajeros autorizados, no para tratamientos prolongados. Permite descansar con seguridad, pero carece de instalaciones capaces de purificar estados complejos.",
    "scenery": {
  "lechos": "Plataformas elevadas mantienen mantas y equipo lejos de la humedad del suelo.",
  "deposito_agua": "Recipientes cerrados almacenan agua potable separada del cauce inmediato.",
  "suministros": "Cuerda, vendas y alimento seco ocupan un armario protegido.",
  "marcas": "Tablillas de patrulla registran estado de rutas y daños de infraestructura."
},
    "exits": {
      "norte": "aguas_paso_piedras",
      "este": "aguas_terraza_humeda"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "aguas_refugio_cauce",
      "inicio": "El refugio te ofrece un lecho elevado y techo firme junto al cauce. Es un lugar seguro para recuperar fuerzas, aunque no dispone de medios para purificar aflicciones complejas."
    }
  },
  "aguas_terraza_humeda": {
    "id": "aguas_terraza_humeda",
    "area": "aguas_barrancos",
    "name": "Terraza Húmeda",
    "desc": "Una plataforma natural retiene agua en canales poco profundos y sostiene vegetación densa adaptada a humedad constante. Charcos, musgo y raíces crean pequeños hábitats separados por pocos pasos. La diversidad del lugar proviene del agua disponible, no de una intervención ornamental.",
    "scenery": {
  "charcos": "Depresiones poco profundas conservan agua incluso cuando el cauce principal queda más abajo.",
  "musgos": "Capas gruesas cubren roca y madera caída.",
  "raices": "Plantas y arbustos aprovechan grietas siempre húmedas.",
  "canales": "Pequeños hilos de agua conectan la terraza con el cauce y el inicio del barranco."
},
    "exits": {
      "norte": "aguas_cauce_alto",
      "oeste": "aguas_refugio_cauce",
      "este": "aguas_inicio_barranco"
    },
    "items": [],
    "mobs": [
      "pez_lunar"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculta": true,
    "oculto": []
  },
  "aguas_inicio_barranco": {
    "id": "aguas_inicio_barranco",
    "area": "aguas_barrancos",
    "name": "Inicio del Barranco",
    "desc": "El terreno se estrecha y el cauce empieza a hundirse entre paredes de roca más altas. Las rutas laterales disminuyen, el sonido del agua rebota con mayor fuerza y las superficies firmes se concentran en repisas y bordes. Es el punto donde el Cauce Alto deja paso a una geografía más vertical.",
    "scenery": {
  "paredes": "Roca húmeda se eleva a ambos lados con grietas y pequeñas repisas.",
  "cauce": "La corriente gana velocidad al quedar confinada.",
  "repisas": "Sectores secos permiten avanzar sin caminar dentro del agua.",
  "eco": "El sonido del cauce vuelve desde distintos ángulos a medida que el barranco se cierra."
},
    "exits": {
      "norte": "aguas_poza_clara",
      "oeste": "aguas_terraza_humeda",
      "sur": "aguas_garganta_norte"
    },
    "items": [],
    "mobs": [
      "pez_lunar"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculta": true,
    "oculto": []
  },
  "aguas_garganta_norte": {
    "id": "aguas_garganta_norte",
    "area": "aguas_barrancos",
    "name": "Garganta Norte",
    "desc": "La garganta encierra el agua entre paredes irregulares y obliga a elegir entre rutas laterales de distinta altura. El cauce ocupa buena parte del fondo, mientras pasarelas naturales y pozas profundas desvían el recorrido. La verticalidad empieza a definir la región más que la distancia.",
    "scenery": {
  "paredes": "Capas de roca expuesta forman salientes, grietas y pequeños canales.",
  "fondo": "Agua rápida alterna con sectores de grava y roca lisa.",
  "repisas": "Franjas estrechas permiten bordear el cauce por encima del nivel del agua.",
  "humedad": "La piedra permanece oscura y resbaladiza en zonas donde llega el rocío."
},
    "exits": {
      "norte": "aguas_inicio_barranco",
      "oeste": "aguas_pasarela_roca",
      "este": "aguas_poza_profunda"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_pasarela_roca": {
    "id": "aguas_pasarela_roca",
    "area": "aguas_barrancos",
    "name": "Pasarela de Roca",
    "desc": "Una cornisa natural recorre la pared del barranco por encima del cauce y permite avanzar sin descender al fondo. El paso es estrecho pero estable, con algunos puntos reforzados mediante clavijas y cuerda. Desde aquí se aprecia la profundidad del corte y la dificultad de seguir una línea recta en esta región.",
    "scenery": {
  "cornisa": "Una franja de roca firme ofrece apoyo suficiente para una persona y equipo ligero.",
  "clavijas": "Puntos metálicos permiten asegurar cuerdas en los tramos más expuestos.",
  "cauce_abajo": "El agua corre varios metros por debajo entre bloques y espuma.",
  "pared": "La roca conserva marcas de erosión y pequeños depósitos minerales."
},
    "exits": {
      "este": "aguas_garganta_norte",
      "sur": "aguas_paso_alto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_poza_profunda": {
    "id": "aguas_poza_profunda",
    "area": "aguas_barrancos",
    "name": "Poza Profunda",
    "desc": "El cauce cae en una depresión oscura donde la profundidad aumenta con rapidez y el fondo deja de ser visible desde el borde. Corrientes laterales entran y salen entre grietas, generando zonas de agua quieta junto a otras de movimiento brusco. Es un hábitat adecuado para fauna acuática sin garantizar ninguna presencia concreta.",
    "scenery": {
  "superficie": "Reflejos oscuros ocultan la forma exacta del fondo.",
  "corrientes": "Remolinos pequeños delatan entradas y salidas de agua bajo la roca.",
  "bordes": "Placas húmedas permiten acercarse solo en algunos puntos seguros.",
  "marcas": "Rastros en barro y sedimento muestran uso frecuente por animales del cauce."
},
    "exits": {
      "oeste": "aguas_garganta_norte",
      "sur": "aguas_cascada_velada"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_cascada_velada": {
    "id": "aguas_cascada_velada",
    "area": "aguas_barrancos",
    "name": "Cascada Velada",
    "desc": "Una cascada estrecha cae entre dos paredes de roca y se fragmenta en una cortina de gotas antes de alcanzar el fondo. Parte del flujo parece provenir de fisuras laterales ocultas por el agua, aunque sin mediciones no hay motivo suficiente para sacar conclusiones. El paso continúa alrededor de la caída por una plataforma natural.",
    "scenery": {
  "cascada": "El agua desciende en una franja estrecha y se dispersa al golpear salientes.",
  "rocio": "Una niebla de gotas mantiene húmedas las superficies cercanas.",
  "fisuras": "Pequeñas entradas laterales quedan parcialmente ocultas detrás de la caída.",
  "plataforma": "Una repisa de piedra permite rodear la cascada sin atravesar directamente el chorro."
},
    "exits": {
      "norte": "aguas_poza_profunda",
      "oeste": "aguas_paso_alto",
      "este": "aguas_filtraciones_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_filtraciones_cantera": {
    "id": "aguas_filtraciones_cantera",
    "area": "aguas_barrancos",
    "name": "Filtraciones de la Cantera",
    "desc": "El barranco se aproxima a roca marcada por cortes artificiales y filtraciones que descienden desde niveles vinculados con la cantera. Agua clara, sedimento mineral y superficies trabajadas se mezclan sin una puerta que separe ambas regiones. El cambio de geología explica por sí solo la conexión.",
    "scenery": {
  "filtraciones": "Agua desciende por grietas que continúan hacia sectores excavados.",
  "cortes": "Marcas de herramientas aparecen en paredes que ya no son completamente naturales.",
  "sedimento": "Partículas minerales tiñen algunas acumulaciones de agua.",
  "paso": "El corredor se vuelve más seco y pétreo hacia la dirección de Cantera."
},
    "exits": {
      "oeste": "aguas_cascada_velada",
      "norte": "paso_aguas_cantera",
      "sur": "aguas_garganta_sur"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_paso_alto": {
    "id": "aguas_paso_alto",
    "area": "aguas_barrancos",
    "name": "Paso Alto del Barranco",
    "desc": "Una ruta elevada atraviesa el barranco por una zona donde la pared ofrece repisas conectadas y roca firme. El cauce queda abajo y la vegetación del Bosque Alto reaparece en los extremos, haciendo visible la relación entre ambas regiones. El paso sirve como alternativa a recorrer el fondo húmedo.",
    "scenery": {
  "repisas": "Plataformas estrechas forman una ruta irregular sobre la garganta.",
  "baranda_cuerda": "Tramos de cuerda ayudan en puntos donde el borde se vuelve demasiado expuesto.",
  "vista": "El cauce puede seguirse por debajo durante parte del recorrido.",
  "vegetacion": "Arbustos y raíces anuncian la proximidad del Bosque Alto."
},
    "exits": {
      "norte": "aguas_pasarela_roca",
      "este": "aguas_cascada_velada",
      "oeste": "bosque_senda_aguas_alta"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_garganta_sur": {
    "id": "aguas_garganta_sur",
    "area": "aguas_barrancos",
    "name": "Garganta Sur",
    "desc": "La garganta se ensancha después del sector de filtraciones y vuelve a ofrecer orillas utilizables junto al cauce. El agua sigue encajada entre paredes, pero aparecen depósitos de grava y vegetación de ribera que anticipan una salida hacia terrenos más habitados. El barranco todavía domina el paisaje, aunque comienza a perder profundidad.",
    "scenery": {
  "grava": "Bancos de piedra pequeña ocupan los sectores donde la corriente pierde fuerza.",
  "paredes": "La altura disminuye gradualmente y deja entrar más vegetación desde arriba.",
  "orillas": "Franjas firmes permiten caminar junto al agua sin usar repisas elevadas.",
  "ramales": "Pequeños desvíos del cauce buscan grietas y depresiones laterales."
},
    "exits": {
      "norte": "aguas_filtraciones_cantera",
      "sur": "aguas_desvio_sauces"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_desvio_sauces": {
    "id": "aguas_desvio_sauces",
    "area": "aguas_barrancos",
    "name": "Desvío hacia Sauces",
    "desc": "El cauce y el sendero se separan en un punto donde una ruta sigue hacia tierras más habitadas mientras otra desciende hacia el Manantial Partido. Sauces y plantas de ribera se vuelven más frecuentes, señal de que el agua pronto entra en una red aprovechada por la comunidad. El desvío funciona como articulación, no como frontera.",
    "scenery": {
  "sauces": "Árboles de ribera aparecen con mayor frecuencia cerca de la salida oriental.",
  "senderos": "Dos rutas visibles distinguen el descenso al manantial y el camino hacia Sauces.",
  "cauce": "El agua continúa hacia zonas bajas mientras recibe pequeños aportes laterales.",
  "mojones": "Piedras marcadas orientan hacia barranco, manantial y comunidad."
},
    "exits": {
      "norte": "aguas_garganta_sur",
      "sur": "aguas_manantial_entrada",
      "este": "sauces_senda_barranco"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_manantial_entrada": {
    "id": "aguas_manantial_entrada",
    "area": "aguas_barrancos",
    "name": "Sendero del Manantial",
    "desc": "Un sendero descendente sigue roca húmeda y vegetación baja hasta una zona donde el agua parece aflorar con mayor fuerza desde la montaña. El terreno se vuelve más fresco y estable, con pequeñas corrientes que convergen hacia un mismo punto. Nada en la entrada explica todavía por qué la surgencia se comporta de manera singular.",
    "scenery": {
  "sendero": "Piedra húmeda y tierra compacta forman un descenso reconocible.",
  "filtraciones": "Hilos de agua aparecen en varios puntos y avanzan en la misma dirección.",
  "vegetacion": "Musgos y plantas de humedad cubren bordes y grietas.",
  "roca": "Superficies lavadas por agua reemplazan gradualmente la grava del barranco."
},
    "exits": {
      "norte": "aguas_desvio_sauces",
      "sur": "aguas_manantial_partido"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_manantial_partido": {
    "id": "aguas_manantial_partido",
    "area": "aguas_barrancos",
    "name": "Manantial Partido",
    "desc": "Una única surgencia emerge entre rocas y se divide casi de inmediato en dos corrientes antes de continuar por cauces distintos. La separación resulta natural a primera vista, aunque cada rama transporta sedimentos, temperatura y sensación de qi ligeramente diferentes. La rareza es perceptible sin ofrecer todavía una explicación.",
    "scenery": {
  "surgencia": "El agua aparece desde una grieta amplia y gana caudal antes de dividirse.",
  "division": "Dos canales naturales separan el flujo a pocos pasos del nacimiento.",
  "sedimentos": "Una rama arrastra partículas más claras; la otra deposita material más oscuro.",
  "temperatura": "Al acercar la mano, ambas corrientes parecen conservar una diferencia leve pero consistente."
},
    "exits": {
      "norte": "aguas_manantial_entrada",
      "oeste": "aguas_rama_clara",
      "este": "aguas_rama_oscura"
    },
    "items": [],
    "mobs": [
      "anguila_estelar",
      "anguila_estelar"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculta": true,
    "oculto": []
  },
  "aguas_rama_clara": {
    "id": "aguas_rama_clara",
    "area": "aguas_barrancos",
    "name": "Rama Clara",
    "desc": "La corriente occidental avanza sobre piedra pálida y grava fina, manteniendo un aspecto más transparente que su contraparte. La vegetación crece baja y dispersa cerca del agua, y el cauce conserva una profundidad regular. Por sí sola, la rama parece una pequeña corriente de montaña bien definida.",
    "scenery": {
  "agua": "El fondo permanece visible durante buena parte del recorrido.",
  "grava": "Piedras claras cubren los sectores menos profundos.",
  "orillas": "Bordes firmes permiten seguir la corriente sin entrar al agua.",
  "plantas": "Vegetación baja ocupa zonas húmedas sin formar matorrales densos."
},
    "exits": {
      "este": "aguas_manantial_partido",
      "sur": "aguas_cuenca_reunion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_rama_oscura": {
    "id": "aguas_rama_oscura",
    "area": "aguas_barrancos",
    "name": "Rama Oscura",
    "desc": "La corriente oriental discurre sobre roca más oscura y sectores de mayor profundidad, produciendo reflejos menos transparentes pese a compartir origen con la otra rama. Sedimentos finos se acumulan en remansos y varias grietas conducen agua bajo la superficie. La diferencia es real, aunque su causa no sea evidente.",
    "scenery": {
  "roca": "Placas oscuras dominan el lecho y absorben parte de la luz.",
  "remansos": "Pequeñas zonas quietas acumulan sedimento fino.",
  "grietas": "Parte del agua desaparece bajo la roca y vuelve a surgir más adelante.",
  "orilla": "Raíces y musgo hacen algunos bordes más blandos que los de la Rama Clara."
},
    "exits": {
      "oeste": "aguas_manantial_partido",
      "este": "aguas_cuenca_reunion"
    },
    "items": [],
    "mobs": [
      "guardian_coral"
    ],
    "npcs": [],
    "vena": "rica",
    "oculta": true,
    "oculto": []
  },
  "aguas_cuenca_reunion": {
    "id": "aguas_cuenca_reunion",
    "area": "aguas_barrancos",
    "name": "Cuenca de Reunión",
    "desc": "Las dos ramas vuelven a encontrarse en una cuenca ancha donde sus aguas se mezclan antes de continuar hacia una cámara inferior. Las diferencias visibles de sedimento y temperatura se atenúan progresivamente hasta formar un único flujo. El lugar resulta llamativo por su equilibrio, pero no explica cómo se produce.",
    "scenery": {
  "confluencia": "Dos corrientes entran desde direcciones distintas y forman remolinos antes de mezclarse.",
  "sedimentos": "Tonos claros y oscuros se distribuyen en patrones que desaparecen aguas abajo.",
  "orillas": "Piedra firme rodea gran parte de la cuenca y permite observar sin entrar al agua.",
  "salida": "Un único cauce abandona la cuenca hacia una zona de piedra más trabajada."
},
    "exits": {
      "norte": "aguas_rama_clara",
      "sur": "aguas_camara_hidrica",
      "oeste": "aguas_rama_oscura"
    },
    "items": [],
    "mobs": [
      "sombra_ahogada"
    ],
    "npcs": [],
    "vena": "rica",
    "oculta": true,
    "oculto": []
  },
  "aguas_camara_hidrica": {
    "id": "aguas_camara_hidrica",
    "area": "aguas_barrancos",
    "name": "Cámara Hídrica",
    "desc": "El cauce entra en una cavidad donde parte de la piedra ha sido pulida y canalizada con una regularidad que no parece producto exclusivo de la erosión. Dos conducciones laterales guían el agua hacia una salida común y reducen remolinos antes de continuar. Es una estructura antigua de función incierta, no una revelación completa.",
    "scenery": {
  "canales": "Dos trazados paralelos conducen parte del flujo por bordes opuestos.",
  "piedra_pulida": "Superficies lisas contrastan con la roca natural de la entrada.",
  "juntas": "Algunas líneas rectas sugieren bloques o cortes deliberados.",
  "salida": "El agua vuelve a reunirse antes de dirigirse hacia el conducto inferior."
},
    "exits": {
      "norte": "aguas_cuenca_reunion",
      "sur": "aguas_conducto_antiguo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "aguas_conducto_antiguo": {
    "id": "aguas_conducto_antiguo",
    "area": "aguas_barrancos",
    "name": "Conducto Antiguo del Agua",
    "desc": "Un conducto revestido de piedra desciende desde la Cámara Hídrica hacia un tramo que todavía recibe parte del flujo de drenaje. Las paredes conservan canales estrechos y juntas regulares, y la obra continúa más allá del sector aprovechado por la infraestructura actual. Su diseño completo no resulta evidente desde este extremo.",
    "scenery": {
  "revestimiento": "Bloques antiguos forman una sección más uniforme que el barranco natural.",
  "canales": "Surcos estrechos guían agua residual hacia puntos de drenaje.",
  "sello": "Encajes y bloques trabajados forman un sistema capaz de aislar este tramo del resto de la conducción, aunque su funcionamiento completo no se aprecia desde este lado.",
  "marcas_recientes": "Señales de mantenimiento muestran que el conducto sigue siendo inspeccionado como infraestructura."
},
    "exits": {
      "norte": "aguas_camara_hidrica",
      "abajo": "ala_aguas_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_camino_valle": {
    "id": "sauces_camino_valle",
    "area": "sauces",
    "name": "Camino de los Sauces",
    "desc": "La ruta procedente del Valle se vuelve más húmeda y arbolada a medida que se aproxima a Sauces Bajos. Las marcas de carros conviven con pasos peatonales, pequeñas acequias y árboles de ribera que anuncian una comunidad antes de que aparezcan sus casas. No hay muralla: el cambio se percibe en el uso del camino y en la presencia creciente de tierra trabajada.",
    "scenery": {
  "sauces": "Árboles de distintos tamaños siguen las zonas donde el suelo conserva más humedad.",
  "acequias": "Pequeñas conducciones laterales llevan agua hacia parcelas próximas.",
  "huellas": "Ruedas, animales de carga y pasos humanos revelan un tránsito civil variado.",
  "mojones": "Piedras discretas señalan la proximidad de Sauces y el regreso hacia el Valle."
},
    "exits": {
      "oeste": "camino_sauces_valle",
      "este": "sauces_plaza"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_plaza": {
    "id": "sauces_plaza",
    "area": "sauces",
    "name": "Plaza de Sauces Bajos",
    "desc": "Una plaza de tierra firme articula las calles, el pozo, la Casa Comunal y la Casa de Huéspedes sin intentar parecer un centro monumental. Bancos, árboles y espacios despejados permiten reuniones, intercambios y tareas cotidianas. La comunidad se siente anterior a cualquier visita de la secta: este lugar existe porque la gente de Sauces lo utiliza.",
    "scenery": {
  "bancos": "Asientos de madera y piedra ocupan los bordes sin cerrar el espacio central.",
  "arboles": "Sauces maduros ofrecen sombra sobre sectores donde el suelo conserva humedad.",
  "tablillas": "Avisos comunitarios anuncian trabajos, necesidades y asuntos comunes.",
  "pavimento": "Tierra apisonada y franjas de piedra resisten el tránsito habitual sin convertir la plaza en patio institucional."
},
    "exits": {
      "oeste": "sauces_camino_valle",
      "norte": "sauces_casa_huespedes",
      "sur": "sauces_pozo",
      "este": "sauces_casa_comunal"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_casa_huespedes": {
    "id": "sauces_casa_huespedes",
    "area": "sauces",
    "name": "Casa de Huéspedes",
    "desc": "Una casa amplia mantiene varias habitaciones sencillas para comerciantes, patrulleros, emisarios y viajeros autorizados. El mobiliario es modesto pero cuidado, y la hospitalidad depende de la comunidad, no de la administración de la secta. Los huéspedes ocupan un espacio temporal dentro de una vida local que continúa alrededor de ellos.",
    "scenery": {
  "habitaciones": "Cuartos pequeños con cama, arcón y una mesa suficiente para una estancia breve.",
  "registro": "Un cuaderno sencillo permite anotar quién se hospeda y quién responde por su visita.",
  "cocina": "Un fogón común y estantes básicos permiten preparar comida sin depender de otra casa.",
  "patio": "Un espacio trasero ofrece agua, tendederos y lugar para dejar equipo de viaje."
},
    "exits": {
      "sur": "sauces_plaza",
      "oeste": "sauces_calle_oeste"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "sauces_casa_huespedes",
      "inicio": "Te preparan una habitación sencilla en la Casa de Huéspedes. No pertenece a la secta: es hospitalidad de Sauces, suficiente para descansar y recuperarte antes de volver al camino."
    }
  },
  "sauces_pozo": {
    "id": "sauces_pozo",
    "area": "sauces",
    "name": "Pozo de la Plaza",
    "desc": "Un pozo de piedra ocupa un punto bajo de la plaza y complementa el agua que llega por canales desde el barranco. Cubos, sogas y un borde pulido por años de uso convierten el lugar en parte de la rutina doméstica. Su importancia se nota precisamente porque nadie lo trata como algo extraordinario.",
    "scenery": {
  "brocal": "La piedra está alisada por manos, cubos y cuerdas repetidos incontables veces.",
  "cuerda": "Una soga gruesa pasa por una polea simple y muestra reparaciones en varios tramos.",
  "cubos": "Recipientes de madera descansan cerca sin pertenecer a una sola vivienda.",
  "canaleta": "Un pequeño desagüe conduce el agua derramada hacia una franja de plantas de ribera."
},
    "exits": {
      "norte": "sauces_plaza",
      "sur": "sauces_canal_bajo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_casa_comunal": {
    "id": "sauces_casa_comunal",
    "area": "sauces",
    "name": "Casa Comunal",
    "desc": "Una sala de reuniones, archivos modestos y bancos compartidos permite discutir asuntos que afectan al conjunto de Sauces. Aquí se registran acuerdos, necesidades y responsabilidades sin imitar la burocracia de la secta. La comunidad trata con patrullas y autoridades externas desde este lugar, pero las decisiones locales no dejan por ello de ser propias.",
    "scenery": {
  "mesa": "Una mesa larga permite extender mapas, cuentas y documentos durante reuniones.",
  "bancos": "Asientos desiguales han sido reparados muchas veces y acomodan grupos de tamaño variable.",
  "registros": "Cuadernos y tablillas guardan cuentas, acuerdos y trabajos comunales.",
  "mapa_local": "Un esquema sencillo muestra campos, canales, caminos y límites conocidos por la comunidad."
},
    "exits": {
      "oeste": "sauces_plaza",
      "sur": "sauces_calle_este"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_calle_oeste": {
    "id": "sauces_calle_oeste",
    "area": "sauces",
    "name": "Calle del Poniente",
    "desc": "Una calle estrecha atraviesa el sector más residencial de Sauces, con casas bajas, pequeños patios y cercos que dejan ver huertos domésticos. Herramientas apoyadas junto a puertas y objetos reparados una y otra vez hablan de familias que usan el espacio más que de fachadas pensadas para visitantes.",
    "scenery": {
  "casas": "Construcciones de madera, adobe y piedra baja muestran ampliaciones hechas en épocas distintas.",
  "patios": "Espacios pequeños reúnen leña, recipientes, plantas y tareas domésticas.",
  "cercos": "Vallas bajas delimitan sin aislar por completo unas viviendas de otras.",
  "senderos": "Pasos secundarios conectan casas y huertos sin formar un trazado perfectamente regular."
},
    "exits": {
      "este": "sauces_casa_huespedes",
      "sur": "sauces_herbolaria",
      "oeste": "sauces_huertos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_calle_este": {
    "id": "sauces_calle_este",
    "area": "sauces",
    "name": "Calle del Levante",
    "desc": "La calle oriental concentra más actividad de trabajo: cargas pequeñas, piezas en reparación y tránsito hacia taller, granero y canal. Las viviendas se mezclan con dependencias productivas sin separar del todo vida doméstica y oficio. La comunidad parece organizada alrededor de necesidades concretas antes que de una zonificación rígida.",
    "scenery": {
  "portales": "Entradas anchas permiten mover herramientas y materiales entre calle y talleres.",
  "carretillas": "Vehículos pequeños transportan grano, madera y piezas sin ocupar toda la calle.",
  "soportes": "Tablas, herramientas y objetos pendientes de arreglo se apoyan bajo aleros.",
  "suelo": "La tierra compactada contiene grava en los puntos de mayor carga."
},
    "exits": {
      "norte": "sauces_casa_comunal",
      "este": "sauces_taller_comunal",
      "sur": "sauces_puente_canal"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_herbolaria": {
    "id": "sauces_herbolaria",
    "area": "sauces",
    "name": "Herbolaria de Mei Shufen",
    "desc": "Estantes de plantas secas, frascos, morteros y telas limpias llenan una herbolaria dedicada a cuidados domésticos y conocimiento práctico de la región. El lugar sirve para preparar cataplasmas, infusiones y remedios ordinarios, no como escuela paralela de Herboristería Espiritual ni laboratorio de Alquimia.",
    "scenery": {
  "estantes": "Ramilletes, raíces y recipientes se ordenan por uso y estado de secado.",
  "morteros": "Piezas de piedra y cerámica permiten triturar materiales sin mezclar preparaciones incompatibles.",
  "mesa": "Una superficie limpia deja espacio para revisar plantas y preparar remedios sencillos.",
  "cuadernos": "Notas prácticas registran usos, dosis y observaciones transmitidas entre generaciones."
},
    "exits": {
      "norte": "sauces_calle_oeste",
      "este": "sauces_canal_bajo",
      "oeste": "sauces_saucedal"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_huertos": {
    "id": "sauces_huertos",
    "area": "sauces",
    "name": "Huertos Bajos",
    "desc": "Parcelas pequeñas rodean varias viviendas y producen verduras, hierbas comunes y alimentos de uso cotidiano. Los cultivos no siguen la disciplina de los Jardines de la secta: cada familia adapta bordes, canales y rotaciones a su terreno y experiencia. El conjunto parece irregular, pero funciona.",
    "scenery": {
  "parcelas": "Sectores de tamaños distintos combinan alimentos, hierbas y tierra en descanso.",
  "canalillos": "Derivaciones pequeñas llevan agua desde la red baja hacia cada huerto.",
  "compost": "Montones controlados de restos vegetales se convierten en abono lejos de las viviendas.",
  "herramientas": "Azadas, cestas y palas muestran reparaciones caseras y usos prolongados."
},
    "exits": {
      "este": "sauces_calle_oeste",
      "sur": "sauces_saucedal"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_saucedal": {
    "id": "sauces_saucedal",
    "area": "sauces",
    "name": "Saucedal",
    "desc": "Una franja baja reúne sauces de raíces expuestas, suelo húmedo y pequeñas corrientes que conectan la comunidad con el barranco. El lugar explica el nombre de Sauces Bajos sin necesidad de monumentos ni leyendas. Es parte del paisaje cotidiano: un espacio para cruzar, recolectar, conversar o comprobar el estado del agua.",
    "scenery": {
  "sauces": "Troncos inclinados y ramas flexibles siguen las zonas más húmedas del terreno.",
  "raices": "Sistemas expuestos sujetan las orillas y forman huecos sobre el barro.",
  "agua": "Pequeños hilos de corriente enlazan el canal con filtraciones naturales.",
  "suelo": "Barro, hojas y hierbas resistentes cubren sectores que rara vez llegan a secarse por completo."
},
    "exits": {
      "norte": "sauces_huertos",
      "este": "sauces_herbolaria",
      "sur": "sauces_senda_barranco"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_canal_bajo": {
    "id": "sauces_canal_bajo",
    "area": "sauces",
    "name": "Canal Bajo",
    "desc": "Un canal construido y reparado por generaciones lleva agua desde el sector del barranco hacia el pozo, los huertos y los campos. Compuertas simples permiten repartir caudal según necesidad, y las marcas de nivel hacen evidente que la comunidad observa de cerca cualquier cambio. Es infraestructura cotidiana antes que una pista de misterio.",
    "scenery": {
  "canal": "Piedra, tierra apisonada y reparaciones de madera forman un cauce estable pero no uniforme.",
  "compuertas": "Tablas encajadas desvían agua hacia ramales domésticos y agrícolas.",
  "marcas_nivel": "Líneas y muescas permiten comparar el caudal con referencias conocidas.",
  "rejillas": "Entramados sencillos retienen ramas y sedimento antes de que entren en ramales menores."
},
    "exits": {
      "norte": "sauces_pozo",
      "oeste": "sauces_herbolaria",
      "este": "sauces_puente_canal"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_puente_canal": {
    "id": "sauces_puente_canal",
    "area": "sauces",
    "name": "Puente del Canal",
    "desc": "Un pequeño puente de piedra cruza el Canal Bajo donde confluyen la calle oriental, el granero y varias rutas de trabajo. Su importancia es práctica: evita que personas y cargas interrumpan el flujo de agua cada vez que atraviesan la comunidad. El desgaste de los bordes muestra un uso mucho mayor que su tamaño.",
    "scenery": {
  "arco": "Una abertura baja deja pasar el canal sin reducir demasiado el cauce.",
  "pretiles": "Bordes simples protegen el paso y sirven de apoyo al cruzar con cargas.",
  "pavimento": "Piedras irregulares muestran zonas pulidas por ruedas y pasos.",
  "vista": "Desde el puente pueden seguirse los ramales hacia pozo, huertos y campos."
},
    "exits": {
      "oeste": "sauces_canal_bajo",
      "norte": "sauces_calle_este",
      "este": "sauces_granero"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_taller_comunal": {
    "id": "sauces_taller_comunal",
    "area": "sauces",
    "name": "Taller Comunal",
    "desc": "Bancos de trabajo, herramientas compartidas y piezas de uso agrícola ocupan un taller dedicado a reparar lo que la comunidad necesita mantener en servicio. Mangos, ruedas, herrajes y recipientes reciben arreglos antes de que alguien considere reemplazarlos. No es un taller de cultivo espiritual ni un servicio exclusivo de la secta.",
    "scenery": {
  "bancos": "Superficies robustas permiten trabajar madera, cuero y metal en reparaciones sencillas.",
  "herramientas": "Martillos, sierras, barrenas y pinzas se guardan en soportes de uso común.",
  "repuestos": "Mangos, tablones y piezas recuperadas esperan una nueva función.",
  "proyectos": "Carretillas, compuertas y aperos en reparación muestran prioridades locales concretas."
},
    "exits": {
      "oeste": "sauces_calle_este",
      "sur": "sauces_granero"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_granero": {
    "id": "sauces_granero",
    "area": "sauces",
    "name": "Granero de Sauces",
    "desc": "Un edificio elevado almacena grano, semillas y reservas destinadas a sostener a la comunidad entre cosechas o dificultades. Los lotes se separan por procedencia y uso, y una parte queda claramente reservada para siembra futura. La seguridad del granero depende tanto de cuentas y mantenimiento como de la cantidad guardada.",
    "scenery": {
  "sacos": "Grano y semillas se agrupan por lote sobre tarimas secas.",
  "reservas": "Marcas distintas separan consumo ordinario, emergencia y semilla.",
  "ventilas": "Aberturas protegidas mantienen circulación de aire sin exponer el interior a animales.",
  "registro": "Un cuaderno de entradas y salidas permite seguir el uso de las reservas."
},
    "exits": {
      "norte": "sauces_taller_comunal",
      "oeste": "sauces_puente_canal",
      "sur": "sauces_campos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_campos": {
    "id": "sauces_campos",
    "area": "sauces",
    "name": "Campos del Este",
    "desc": "Los cultivos se abren hacia el este en parcelas más amplias que los huertos domésticos y dependen de la red de agua que atraviesa Sauces. Senderos, acequias y pequeñas construcciones agrícolas ocupan el terreno sin borrar el paisaje de ribera. Más allá empieza la transición hacia la senda del barranco.",
    "scenery": {
  "parcelas": "Extensiones de cultivo alternan con franjas de descanso y pasto.",
  "acequias": "Ramales del Canal Bajo reparten agua entre sectores sin inundarlos.",
  "cobertizos": "Estructuras ligeras guardan herramientas y permiten proteger cargas breves.",
  "linde": "La vegetación se vuelve más silvestre cerca de la ruta hacia Aguas."
},
    "exits": {
      "norte": "sauces_granero",
      "oeste": "sauces_senda_barranco"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "sauces_senda_barranco": {
    "id": "sauces_senda_barranco",
    "area": "sauces",
    "name": "Senda del Barranco",
    "desc": "Una senda húmeda abandona los campos y el saucedal hacia el terreno más quebrado de Aguas. Las marcas comunitarias se vuelven menos frecuentes, pero el paso sigue siendo conocido por quienes revisan canales, buscan plantas o viajan entre Sauces y el barranco. El cambio de región ocurre de manera gradual.",
    "scenery": {
  "sendero": "Tierra compactada alterna con piedra húmeda a medida que aumenta la pendiente.",
  "sauces": "Los últimos árboles de ribera acompañan el paso antes de ceder a roca y matorral.",
  "marcas": "Pequeños mojones señalan el regreso a la comunidad y la dirección del barranco.",
  "agua": "Filtraciones y canales menores corren paralelos a la senda en varios tramos."
},
    "exits": {
      "norte": "sauces_saucedal",
      "este": "sauces_campos",
      "oeste": "aguas_desvio_sauces"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_umbral_sur": {
    "id": "interior_umbral_sur",
    "area": "secta_interior",
    "name": "Umbral de la Secta Interior",
    "desc": "El acceso superior se abre más allá de la escalinata sin recurrir a barreras sobrenaturales. La piedra está mejor conservada, las señales son más sobrias y el tránsito se somete a controles claros de identidad y propósito. El límite es institucional: poder llegar hasta aquí no equivale a tener derecho a cruzarlo.",
    "scenery": {
  "umbral": "Un marco de piedra clara marca el cambio de sector sin ornamentación excesiva.",
  "tablillas": "Indicaciones de acceso distinguen visitantes autorizados, personal y dependencias restringidas.",
  "pavimento": "Las losas presentan menos reparaciones improvisadas y juntas cuidadosamente mantenidas.",
  "control": "Un espacio lateral permite comprobar permisos sin bloquear la escalinata principal."
},
    "exits": {
      "norte": "interior_patio_blanco",
      "sur": "escalinata_interior"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_patio_blanco": {
    "id": "interior_patio_blanco",
    "area": "secta_interior",
    "name": "Patio Blanco",
    "desc": "Un patio de piedra clara distribuye las rutas hacia huéspedes, visitas y dependencias de los discípulos internos. Hay menos ruido, menos objetos temporales y más espacio libre que en la Secta Exterior. La diferencia no está en el lujo, sino en la sensación de que cada tránsito ha sido previsto y cada función tiene un lugar.",
    "scenery": {
  "piedra": "Losas claras y bien ajustadas forman una superficie sobria, resistente y fácil de mantener.",
  "aleros": "Techos discretos protegen corredores laterales sin cerrar el patio.",
  "señales": "Indicaciones pequeñas bastan para orientar porque hay menos funciones compitiendo por atención.",
  "espacio": "El centro permanece deliberadamente despejado, sin tablones, cargas ni puestos improvisados."
},
    "exits": {
      "norte": "interior_patio_internos",
      "sur": "interior_umbral_sur",
      "este": "interior_sala_visitas",
      "oeste": "interior_corredor_huespedes"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_corredor_huespedes": {
    "id": "interior_corredor_huespedes",
    "area": "secta_interior",
    "name": "Corredor de Huéspedes",
    "desc": "Un corredor tranquilo conduce a los cuartos reservados para visitantes autorizados y personas en servicio temporal. Las puertas están numeradas y el mobiliario común se limita a bancos, lámparas y soportes de viaje. El espacio ofrece hospitalidad sin confundir al huésped con un residente del sector.",
    "scenery": {
  "puertas": "Cada cuarto lleva una placa de asignación reemplazable, no un nombre permanente.",
  "bancos": "Asientos estrechos permiten esperar o acomodar equipo sin ocupar el paso.",
  "lamparas": "Soportes sencillos iluminan el corredor sin convertirlo en una galería ceremonial.",
  "registro": "Una tablilla de servicio permite controlar ocupación y mantenimiento."
},
    "exits": {
      "norte": "interior_galeria_oeste",
      "este": "interior_patio_blanco",
      "oeste": "interior_cuartos_huespedes"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_cuartos_huespedes": {
    "id": "interior_cuartos_huespedes",
    "area": "secta_interior",
    "name": "Cuartos de Huéspedes Internos",
    "desc": "Habitaciones sobrias alojan a visitantes y colaboradores que necesitan permanecer cerca de Archivos, Formaciones o dependencias superiores. Cada cuarto ofrece cama, mesa, arcón y agua limpia, con mayor privacidad que los dormitorios externos pero sin símbolos de rango. Alojarse aquí significa estar autorizado a servir arriba, no haberse convertido en discípulo interno.",
    "scenery": {
  "camas": "Estructuras sencillas con colchones firmes y mantas bien mantenidas.",
  "mesas": "Un escritorio pequeño permite leer, escribir o preparar informes.",
  "arcones": "Cajas con cierre básico ofrecen espacio suficiente para una estancia de trabajo.",
  "placas": "Las asignaciones son temporales y pueden cambiar sin alterar la habitación."
},
    "exits": {
      "este": "interior_corredor_huespedes"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "interior_cuartos_huespedes",
      "inicio": "Te asignan un cuarto de visitante dentro de la Secta Interior. La privacidad es mayor que en las cabañas externas, pero todo en la habitación recuerda que estás aquí por autorización y servicio, no por rango."
    }
  },
  "interior_sala_visitas": {
    "id": "interior_sala_visitas",
    "area": "secta_interior",
    "name": "Sala de Visitas",
    "desc": "Una sala de reuniones menores recibe mensajeros, representantes y personas que necesitan tratar asuntos sin avanzar hacia zonas más restringidas. Mesas bajas y asientos sobrios permiten conversar, revisar documentos y esperar una respuesta institucional sin entrar en espacios de gobierno.",
    "scenery": {
  "mesas": "Superficies bajas ofrecen espacio para té, documentos y pequeños mapas.",
  "asientos": "Cojines y bancos mantienen una disposición flexible según el tamaño de la reunión.",
  "biombo": "Un panel móvil separa una zona de espera cuando coinciden varios visitantes.",
  "estante": "Material de escritura y formularios básicos están disponibles sin exponer archivos internos."
},
    "exits": {
      "norte": "interior_galeria_este",
      "este": "interior_balcon_sur",
      "oeste": "interior_patio_blanco"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_balcon_sur": {
    "id": "interior_balcon_sur",
    "area": "secta_interior",
    "name": "Balcón del Sur",
    "desc": "Un balcón abierto domina parte de la Secta Exterior y deja ver tejados, patios y rutas que desde abajo parecían independientes. La altura no convierte el paisaje en una miniatura abstracta: permite reconocer espacios ya recorridos y comprender mejor cómo se encajan entre sí. El progreso se siente aquí como cambio de perspectiva.",
    "scenery": {
  "vista_exterior": "Se distinguen sectores de los patios externos y sus conexiones más amplias.",
  "medicina": "Los tejados claros del pabellón médico aparecen separados de la actividad residencial.",
  "jardines": "Parcelas y cubiertas translúcidas forman una mancha ordenada hacia un lateral.",
  "valle": "Más lejos, las rutas descienden hacia terrazas y caminos del territorio exterior."
},
    "exits": {
      "norte": "interior_pasaje_servicio",
      "oeste": "interior_sala_visitas"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_galeria_oeste": {
    "id": "interior_galeria_oeste",
    "area": "secta_interior",
    "name": "Galería Occidental",
    "desc": "Una galería cubierta organiza el tránsito hacia el Patio de las Estelas y la escalinata que conduce a Archivos. La decoración es mínima: pilares, piedra clara y placas de identificación bastan para una zona donde la dirección importa más que la exhibición. El acceso a la galería no implica acceso automático a todo lo que conecta.",
    "scenery": {
  "pilares": "Columnas de madera oscura sostienen el corredor con una regularidad poco visible en sectores inferiores.",
  "placas": "Indicaciones separan Archivos de las dependencias internas sin enumerar permisos.",
  "piso": "Losas limpias muestran un desgaste uniforme, propio de tránsito constante pero controlado.",
  "ventanas": "Aberturas estrechas dejan entrar aire y luz sin convertir la galería en mirador."
},
    "exits": {
      "norte": "interior_patio_estelas",
      "sur": "interior_corredor_huespedes",
      "este": "interior_patio_internos",
      "oeste": "interior_escalinata_archivos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_patio_estelas": {
    "id": "interior_patio_estelas",
    "area": "secta_interior",
    "name": "Patio de las Estelas",
    "desc": "Estelas de piedra registran maestros, obras, servicios y acontecimientos reconocidos por la institución. Las piezas pertenecen a épocas distintas y no siguen una única secuencia: algunas fueron añadidas entre monumentos anteriores, otras descansan sobre bases reemplazadas y quedan huecos donde el orden original ya no resulta evidente. El conjunto conserva una memoria oficial formada por acumulaciones y elecciones visibles en la propia disposición del patio.",
    "scenery": {
  "estelas": "Piedras de tamaños y épocas distintas contienen inscripciones formales y restauraciones posteriores.",
  "inscripciones": "Los textos celebran servicios, construcciones, enseñanzas y hechos considerados ejemplares.",
  "bases": "Algunas estelas descansan sobre soportes reemplazados mucho después de su tallado original.",
  "espacios_vacios": "Huecos entre monumentos muestran que el patio creció por acumulación y reorganización."
},
    "exits": {
      "norte": "interior_sala_te",
      "sur": "interior_galeria_oeste"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_escalinata_archivos": {
    "id": "interior_escalinata_archivos",
    "area": "secta_interior",
    "name": "Escalinata de los Archivos",
    "desc": "Una escalinata lateral asciende hacia los edificios de Archivos, visibles desde la galería sin quedar por ello abiertos a cualquier visitante. Los peldaños son regulares y la señalización distingue con claridad el destino. La restricción depende de permisos y propósito, no de ocultar que los Archivos existen.",
    "scenery": {
  "peldaños": "Piedra clara y uniforme sube en tramos cortos con descansos estrechos.",
  "señal": "Una placa identifica los Archivos sin explicar sus secciones internas.",
  "baranda": "Madera oscura acompaña la subida en los tramos de mayor pendiente.",
  "umbral_superior": "La entrada al área documental puede verse desde los últimos escalones."
},
    "exits": {
      "este": "interior_galeria_oeste",
      "oeste": "archivos_portico"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_galeria_este": {
    "id": "interior_galeria_este",
    "area": "secta_interior",
    "name": "Galería Oriental",
    "desc": "La galería oriental distribuye el paso hacia el Jardín de Piedra y la escalinata de Formaciones. Comparte la sobriedad de su contraparte occidental, aunque aquí aparecen más marcas técnicas y menos referencias históricas. La función del corredor sigue siendo conectar sin conceder por sí mismo autorización.",
    "scenery": {
  "pilares": "La estructura sigue un ritmo regular y deja amplios espacios de paso.",
  "señales": "Indicaciones conducen hacia Formaciones y dependencias de instructores.",
  "marcas_tecnicas": "Pequeños símbolos de mantenimiento aparecen cerca de suelos y uniones estructurales.",
  "piso": "Las losas se mantienen despejadas de objetos temporales y cargas."
},
    "exits": {
      "norte": "interior_jardin_piedra",
      "sur": "interior_sala_visitas",
      "este": "interior_escalinata_formaciones",
      "oeste": "interior_patio_internos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_jardin_piedra": {
    "id": "interior_jardin_piedra",
    "area": "secta_interior",
    "name": "Jardín de Piedra",
    "desc": "Piedras, grava y vegetación mínima forman un jardín cuyo diseño privilegia trayectorias y espacios vacíos sobre la abundancia. Dos recorridos atraviesan la composición, se aproximan y vuelven a separarse sin fundirse completamente. A simple vista es una elección estética y contemplativa, no una explicación doctrinal.",
    "scenery": {
  "senderos": "Dos trazados de grava recorren el jardín y se cruzan visualmente sin compartir todo su recorrido.",
  "piedras": "Bloques de formas distintas se disponen con suficiente distancia para que el vacío forme parte del diseño.",
  "musgo": "Pequeñas manchas suavizan bases y grietas sin cubrir por completo la piedra.",
  "banco": "Un asiento discreto permite permanecer en el jardín sin convertirlo en sala de reunión."
},
    "exits": {
      "norte": "interior_pabellon_instructores",
      "sur": "interior_galeria_este",
      "este": "interior_pasaje_servicio"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_escalinata_formaciones": {
    "id": "interior_escalinata_formaciones",
    "area": "secta_interior",
    "name": "Escalinata de Formaciones",
    "desc": "Una escalinata asciende hacia las instalaciones de Formaciones desde la galería oriental. El destino es evidente, pero la circulación se rige por autorizaciones específicas y tareas concretas. La existencia del área nunca fue secreta; el acceso se controla mediante procedimientos institucionales visibles.",
    "scenery": {
  "escalones": "Piedra uniforme asciende hacia edificios donde aparecen más conducciones y marcas técnicas.",
  "placa": "Una señal identifica Formaciones sin describir trabajos internos.",
  "baranda": "Un pasamanos sencillo acompaña el tramo más elevado.",
  "acceso": "El espacio superior permite control de ingreso sin recurrir a una puerta oculta."
},
    "exits": {
      "este": "formaciones_portico",
      "oeste": "interior_galeria_este"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_patio_internos": {
    "id": "interior_patio_internos",
    "area": "secta_interior",
    "name": "Patio de los Discípulos Internos",
    "desc": "Un patio de uso cotidiano reúne discípulos que estudian, entrenan, conversan y se desplazan entre dependencias sin convertir el lugar en escenario de rivalidad permanente. Hay más espacio por persona y menos actividad logística que en el exterior. La jerarquía se percibe en quién puede estar aquí y qué responsabilidades tiene, no en una hostilidad automática hacia los externos.",
    "scenery": {
  "losas": "La superficie está bien mantenida y deja zonas despejadas para tránsito y práctica breve.",
  "bancos": "Asientos sencillos permiten estudiar o conversar sin bloquear las rutas.",
  "tablillas": "Avisos académicos y administrativos reemplazan los encargos cotidianos del patio exterior.",
  "soportes": "Algunos bastidores guardan material de estudio o entrenamiento de uso común."
},
    "exits": {
      "norte": "interior_sala_estudio",
      "sur": "interior_patio_blanco",
      "este": "interior_galeria_este",
      "oeste": "interior_galeria_oeste"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_sala_estudio": {
    "id": "interior_sala_estudio",
    "area": "secta_interior",
    "name": "Sala de Estudio",
    "desc": "Mesas individuales y compartidas llenan una sala dedicada a lectura, copia, ejercicios y preparación de informes. La disposición favorece trabajo prolongado sin convertir el lugar en biblioteca ni archivo. Desde aquí se conectan espacios sociales, instructores y dependencias administrativas superiores.",
    "scenery": {
  "mesas": "Superficies limpias permiten trabajar con textos y materiales sin invadir el puesto vecino.",
  "estantes": "Contienen obras de consulta común y materiales que no requieren acceso a Archivos.",
  "tinteros": "Utensilios de escritura se distribuyen en soportes compartidos.",
  "paneles": "Pequeñas tablillas muestran ejercicios, avisos y referencias de estudio."
},
    "exits": {
      "norte": "interior_corredor_consejo",
      "sur": "interior_patio_internos",
      "este": "interior_pabellon_instructores",
      "oeste": "interior_sala_te"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_sala_te": {
    "id": "interior_sala_te",
    "area": "secta_interior",
    "name": "Sala del Té",
    "desc": "Una sala social ofrece mesas bajas y un ambiente menos formal donde discípulos, instructores o visitantes autorizados pueden conversar entre tareas. El lugar favorece intercambio de información y experiencia sin convertirse en punto de reunión obligatorio de personajes importantes. Su valor está en lo incidental.",
    "scenery": {
  "mesas": "Superficies bajas se distribuyen con suficiente espacio para grupos pequeños.",
  "tetera": "Utensilios comunes permiten servir té sin ceremonia compleja.",
  "ventanas": "Aberturas amplias dan al Patio de las Estelas y suavizan el aislamiento del interior.",
  "estante": "Tazas, bandejas y recipientes se guardan por uso, no por rango."
},
    "exits": {
      "sur": "interior_patio_estelas",
      "este": "interior_sala_estudio"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_pabellon_instructores": {
    "id": "interior_pabellon_instructores",
    "area": "secta_interior",
    "name": "Pabellón de Instructores",
    "desc": "Despachos y una sala común permiten a los instructores revisar evaluaciones, coordinar formación y discutir el progreso de discípulos. El lugar recuerda que enseñar técnicas es solo una parte de su trabajo: también producen informes, administran responsabilidades y participan en decisiones formativas.",
    "scenery": {
  "escritorios": "Mesas separadas contienen informes, notas de evaluación y material docente.",
  "tablones": "Programas y asignaciones se organizan por grupos y responsabilidades.",
  "armarios": "Documentos de trabajo quedan guardados sin convertirse en archivo histórico.",
  "sala_comun": "Una mesa mayor permite reuniones breves entre instructores."
},
    "exits": {
      "sur": "interior_jardin_piedra",
      "oeste": "interior_sala_estudio"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_corredor_consejo": {
    "id": "interior_corredor_consejo",
    "area": "secta_interior",
    "name": "Corredor del Consejo",
    "desc": "El tránsito se vuelve más contenido al acercarse a las dependencias del Consejo. Las puertas son menos numerosas, la señalización más formal y desaparecen los espacios de uso casual. El corredor no amenaza ni deslumbra; simplemente deja claro que cada paso hacia adelante requiere una razón institucional más concreta.",
    "scenery": {
  "puertas": "Accesos sobrios llevan placas de función sin exponer quién se encuentra dentro.",
  "piso": "Las losas muestran poco desgaste lateral porque casi nadie permanece aquí sin propósito.",
  "avisos": "Indicaciones formales regulan audiencias, entregas y circulación.",
  "silencio": "La arquitectura y el menor tránsito reducen el ruido sin necesidad de imponerlo mediante carteles."
},
    "exits": {
      "norte": "interior_antesala_consejo",
      "sur": "interior_sala_estudio",
      "este": "interior_portico_norte"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_antesala_consejo": {
    "id": "interior_antesala_consejo",
    "area": "secta_interior",
    "name": "Antesala del Consejo",
    "desc": "Una sala de espera separa el corredor de la cámara donde se celebran decisiones institucionales. Asientos, una mesa de registro y espacio para documentos bastan para ordenar comparecencias y audiencias. Estar en la antesala significa haber llegado hasta el procedimiento; no garantiza ser admitido.",
    "scenery": {
  "asientos": "Bancos separados ofrecen espera sin convertir el espacio en salón social.",
  "registro": "Una mesa permite anotar convocatoria, motivo y responsables de una audiencia.",
  "puerta": "El acceso al Consejo es visible y directo, pero no está abierto por defecto.",
  "documentos": "Carpetas temporales esperan ser entregadas o devueltas sin quedar expuestas al público."
},
    "exits": {
      "norte": "interior_sala_consejo",
      "sur": "interior_corredor_consejo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_sala_consejo": {
    "id": "interior_sala_consejo",
    "area": "secta_interior",
    "name": "Sala del Consejo",
    "desc": "Una sala amplia pero austera está preparada para deliberaciones, comparecencias y decisiones que afectan a la institución. Una mesa central, asientos separados y superficies para documentos sustituyen cualquier aparato de corte. El peso del lugar proviene de quién puede convocar una reunión y de lo que allí se decide, no de su decoración.",
    "scenery": {
  "mesa_central": "Una superficie larga permite extender informes y mapas para varias personas a la vez.",
  "asientos": "Los lugares están ordenados por función durante una sesión, no por ostentación permanente.",
  "paneles": "Biombos y superficies de escritura permiten presentar información sin decorar los muros.",
  "puertas": "Los accesos conducen de vuelta a la antesala; la sala no es un pasaje hacia zonas profundas."
},
    "exits": {
      "sur": "interior_antesala_consejo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_portico_norte": {
    "id": "interior_portico_norte",
    "area": "secta_interior",
    "name": "Pórtico del Norte",
    "desc": "Un pórtico abierto marca la transición hacia sectores más altos de la montaña. El aire circula con mayor libertad y las construcciones empiezan a dejar más roca visible entre ellas. Desde aquí la escalinata de las Alturas resulta evidente, aunque su presencia no implique permiso para ascender.",
    "scenery": {
  "portico": "Columnas sobrias enmarcan la salida sin cerrar la vista hacia arriba.",
  "roca": "La montaña aparece más expuesta entre muros y escaleras.",
  "señal": "Una indicación identifica el acceso a Alturas y recuerda el control de tránsito.",
  "vista": "Hacia abajo se percibe parte del orden geométrico de la Secta Interior."
},
    "exits": {
      "norte": "interior_escalinata_alturas",
      "oeste": "interior_corredor_consejo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_escalinata_alturas": {
    "id": "interior_escalinata_alturas",
    "area": "secta_interior",
    "name": "Escalinata de las Alturas",
    "desc": "Una escalera más empinada asciende desde el pórtico hacia terrazas y caminos superiores. Los peldaños están tallados directamente sobre sectores de roca y reciben menos tránsito que las escalinatas internas. La ruta forma parte visible de la montaña institucional mucho antes de que cualquier visitante pueda usarla libremente.",
    "scenery": {
  "peldaños": "La piedra tallada sigue la pendiente y varía ligeramente de altura según el terreno.",
  "baranda": "Tramos de madera aparecen solo donde la exposición lo requiere.",
  "mojones": "Pequeñas marcas indican descansos y límites de acceso.",
  "pendiente": "El desnivel oculta pronto la Secta Interior desde los primeros tramos."
},
    "exits": {
      "norte": "alturas_portico_sur",
      "sur": "interior_portico_norte"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "interior_pasaje_servicio": {
    "id": "interior_pasaje_servicio",
    "area": "secta_interior",
    "name": "Pasaje de Servicio",
    "desc": "Un corredor funcional permite mover suministros, mensajes y personal entre sectores sin atravesar constantemente los patios de uso académico. Es más estrecho y menos representativo que las galerías principales, pero está bien mantenido y claramente autorizado. Su existencia recuerda que incluso las dependencias de mayor rango dependen de trabajo cotidiano.",
    "scenery": {
  "estantes": "Nichos laterales reciben paquetes y materiales en tránsito sin bloquear el paso.",
  "carros_ligeros": "Pequeñas plataformas con ruedas permiten mover suministros dentro del sector.",
  "tablillas": "Etiquetas de destino evitan que mensajes y cargas terminen en dependencias equivocadas.",
  "paredes": "El acabado es sencillo y muestra más reparaciones utilitarias que los corredores principales."
},
    "exits": {
      "sur": "interior_balcon_sur",
      "oeste": "interior_jardin_piedra"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_portico": {
    "id": "archivos_portico",
    "area": "archivos",
    "name": "Pórtico de los Archivos",
    "desc": "Un pórtico sobrio separa la circulación de la Secta Interior de un edificio donde el tránsito se vuelve más cuidadoso. Puertas amplias, superficies secas y señales discretas preparan el paso hacia salas de consulta y trabajo documental. Nada sugiere una cámara de secretos: parece, ante todo, una institución que necesita conservar lo que usa.",
    "scenery": {
  "puertas": "Madera oscura reforzada con herrajes sencillos; el ancho permite mover cajas y estantes sin dificultad.",
  "aleros": "El techo sobresale para proteger documentos y visitantes de humedad antes de entrar.",
  "señal": "Una tablilla identifica los Archivos y distingue consulta de áreas de trabajo.",
  "suelo": "Las losas permanecen secas y limpias, con felpudos de fibra para retirar polvo del calzado."
},
    "exits": {
      "este": "interior_escalinata_archivos",
      "oeste": "archivos_sala_consulta"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_sala_consulta": {
    "id": "archivos_sala_consulta",
    "area": "archivos",
    "name": "Sala de Consulta",
    "desc": "Mesas amplias y estantes de referencia ocupan una sala destinada a leer material autorizado sin trasladarlo por todo el edificio. La iluminación es uniforme y los puestos dejan espacio para notas, copias y supervisión discreta. El lugar parece diseñado para encontrar respuestas parciales con orden, no para revelar una verdad completa de una sola vez.",
    "scenery": {
  "mesas": "Superficies lisas permiten extender varios documentos sin superponerlos.",
  "estantes": "Obras de referencia y copias de consulta se mantienen separadas del depósito principal.",
  "soportes": "Atriles de madera sostienen tablillas o textos frágiles sin forzar sus encuadernaciones.",
  "reglas": "Indicaciones breves explican cómo solicitar, consultar y devolver material."
},
    "exits": {
      "este": "archivos_portico",
      "norte": "archivos_escritorio_copistas",
      "oeste": "archivos_catalogo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_escritorio_copistas": {
    "id": "archivos_escritorio_copistas",
    "area": "archivos",
    "name": "Escritorio de Copistas",
    "desc": "Pupitres alineados, tinteros y soportes para originales convierten este sector en un espacio de reproducción y corrección paciente. Cada copia deja rastros de decisiones pequeñas: abreviaturas, grafías, márgenes y notas que no siempre sobreviven a la siguiente versión. El trabajo parece rutinario hasta que se comparan dos textos demasiado parecidos para ser idénticos.",
    "scenery": {
  "pupitres": "Mesas inclinadas mantienen texto y copia en posiciones cómodas para jornadas largas de escritura.",
  "tinteros": "Recipientes de tinta se cubren cuando no se usan para evitar polvo y evaporación.",
  "muestras": "Trazos de práctica permiten comparar caligrafías y reconocer distintas manos.",
  "papeles": "Hojas descartadas muestran correcciones, pruebas de tinta y líneas copiadas más de una vez."
},
    "exits": {
      "sur": "archivos_sala_consulta",
      "oeste": "archivos_deposito_comun"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_catalogo": {
    "id": "archivos_catalogo",
    "area": "archivos",
    "name": "Sala del Catálogo",
    "desc": "Cajones, índices y listados convierten esta sala en la puerta lógica hacia el resto del archivo. El material no está ordenado por importancia narrativa, sino por colecciones, periodos, oficinas y formas de consulta. Encontrar algo aquí depende tanto de saber qué buscar como de comprender cómo fue clasificado.",
    "scenery": {
  "cajones": "Pequeños compartimentos guardan fichas con referencias a documentos y colecciones.",
  "indices": "Volúmenes y tablillas resumen contenidos sin reproducir los textos completos.",
  "marcas": "Correcciones y referencias cruzadas revelan cambios de clasificación acumulados.",
  "mesa": "Una superficie central permite combinar varios índices antes de solicitar material."
},
    "exits": {
      "este": "archivos_sala_consulta",
      "norte": "archivos_deposito_comun"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_deposito_comun": {
    "id": "archivos_deposito_comun",
    "area": "archivos",
    "name": "Depósito Común",
    "desc": "Estanterías altas conservan registros ordinarios, copias de uso administrativo y documentos que todavía circulan con cierta frecuencia. Cajas y legajos se organizan para ser encontrados y devueltos sin dramatismo. Cuentas, nóminas, decisiones menores y procedimientos repetidos ocupan mucho más espacio que cualquier documento excepcional.",
    "scenery": {
  "estanterias": "Módulos numerados separan colecciones por oficina, periodo y tipo de documento.",
  "cajas": "Contenedores protegidos del polvo guardan lotes que no necesitan consulta diaria.",
  "legajos": "Cordeles y cubiertas mantienen juntos documentos relacionados sin encuadernarlos.",
  "escalera": "Una escalera móvil permite alcanzar niveles altos sin trepar por los estantes."
},
    "exits": {
      "este": "archivos_escritorio_copistas",
      "sur": "archivos_catalogo",
      "oeste": "archivos_galeria_registros"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_galeria_registros": {
    "id": "archivos_galeria_registros",
    "area": "archivos",
    "name": "Galería de Registros",
    "desc": "Una galería larga reúne series administrativas que atraviesan distintas etapas de la historia de la secta. Los formatos cambian, las categorías se renombran y algunas secuencias presentan vacíos que resultan más visibles al verlas juntas. El corredor no cuenta una historia por sí solo, pero permite percibir cuándo la continuidad deja de ser perfecta.",
    "scenery": {
  "series": "Estantes completos repiten rótulos semejantes durante largos tramos antes de cambiar de formato.",
  "criterios": "Los criterios de orden y referencia cambian entre colecciones antiguas y recientes, por lo que algunas series solo pueden compararse con cuidado.",
  "huecos": "Algunos espacios etiquetados carecen del material que los índices dicen que debería ocuparlos.",
  "rotulos": "Nombres de cargos y departamentos cambian gradualmente entre una sección y otra."
},
    "exits": {
      "este": "archivos_deposito_comun",
      "norte": "archivos_sala_estelas",
      "oeste": "archivos_control_restringido"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_sala_estelas": {
    "id": "archivos_sala_estelas",
    "area": "archivos",
    "name": "Sala de las Estelas Menores",
    "desc": "Placas y pequeñas estelas trasladadas al interior conservan inscripciones demasiado frágiles o específicas para permanecer expuestas en patios. Registran obras, cargos, reparaciones y servicios de épocas distintas sin formar una cronología completa. Su valor está tanto en lo escrito como en las palabras que dejaron de usarse.",
    "scenery": {
  "estelas": "Piezas de piedra de tamaños diversos muestran tallas, restauraciones y erosión desigual.",
  "calcos": "Copias en papel reproducen inscripciones para facilitar su lectura sin tocar la piedra.",
  "terminos": "Algunos cargos y nombres de obras no aparecen en la administración actual.",
  "bases": "Soportes modernos mantienen piezas antiguas en posiciones seguras de consulta."
},
    "exits": {
      "sur": "archivos_galeria_registros"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_control_restringido": {
    "id": "archivos_control_restringido",
    "area": "archivos",
    "name": "Control del Archivo Restringido",
    "desc": "Un puesto de registro marca el punto donde la consulta ordinaria termina y comienzan colecciones sometidas a autorización específica. No hay misterio en la existencia del límite: formularios, sellos y listas dejan claro que el problema es quién puede consultar qué y con qué propósito. La restricción es procedimiento antes que teatralidad.",
    "scenery": {
  "registro": "Una mesa reúne solicitudes, autorizaciones y constancias de devolución.",
  "sellos": "Marcas institucionales distinguen niveles de acceso y órdenes concretas.",
  "puertas": "Los accesos posteriores son visibles, sólidos y perfectamente normales.",
  "casilleros": "Compartimentos temporales reciben objetos o notas que no pueden entrar con el visitante."
},
    "exits": {
      "este": "archivos_galeria_registros",
      "oeste": "archivos_deposito_antiguo",
      "norte": "archivos_sala_indices"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_deposito_antiguo": {
    "id": "archivos_deposito_antiguo",
    "area": "archivos",
    "name": "Depósito Antiguo",
    "desc": "El papel reciente da paso a tablillas, rollos, placas y encuadernaciones de técnicas muy distintas. El orden sigue existiendo, pero depende de referencias más antiguas y de categorías que ya no coinciden exactamente con las actuales. Aquí la distancia histórica se percibe en los materiales antes que en cualquier revelación.",
    "scenery": {
  "tablillas": "Madera, bambú y otros soportes conservan escrituras de manos y épocas diversas.",
  "rollos": "Textos enrollados descansan en cajas adaptadas para evitar deformaciones.",
  "etiquetas": "Rótulos modernos intentan traducir categorías antiguas sin siempre encontrar equivalentes exactos.",
  "estantes": "La estructura ha sido reforzada para soportar materiales de peso y formato desigual."
},
    "exits": {
      "este": "archivos_control_restringido",
      "norte": "archivos_camara_copias"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_sala_indices": {
    "id": "archivos_sala_indices",
    "area": "archivos",
    "name": "Sala de Índices Antiguos",
    "desc": "Índices de épocas distintas describen colecciones tal como fueron entendidas antes de reorganizaciones posteriores. Algunas referencias siguen llevando a documentos conocidos; otras terminan en nombres de fondos, cargos o depósitos que ya no existen bajo esa denominación. La sala permite comprobar que perder una referencia no es lo mismo que demostrar que nunca hubo nada.",
    "scenery": {
  "indices": "Listados antiguos usan categorías y abreviaturas que requieren comparación con sistemas posteriores.",
  "referencias": "Varias entradas apuntan a colecciones renombradas, fusionadas o no localizadas.",
  "notas": "Anotaciones marginales de archiveros posteriores intentan reconciliar sistemas incompatibles.",
  "mapas_catalogo": "Esquemas de organización muestran cómo cambió la distribución documental."
},
    "exits": {
      "sur": "archivos_control_restringido",
      "oeste": "archivos_camara_copias"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_camara_copias": {
    "id": "archivos_camara_copias",
    "area": "archivos",
    "name": "Cámara de Copias",
    "desc": "Versiones de un mismo texto se conservan juntas para facilitar comparación y control. Algunas diferencias son simples correcciones; otras cambian vocabulario, énfasis o nombres de cargos sin que una etiqueta declare cuál es la versión definitiva. Mirarlas lado a lado vuelve visible cómo una institución puede transformar su memoria sin necesidad de inventarla desde cero.",
    "scenery": {
  "series": "Grupos de copias se ordenan desde soportes más antiguos hasta reproducciones recientes.",
  "margenes": "Notas y correcciones revelan decisiones de copistas y revisores en distintas etapas.",
  "variantes": "Palabras, títulos y frases cambian sutilmente entre textos que pretenden conservar el mismo contenido.",
  "sellos": "Marcas de validación indican que más de una versión fue considerada legítima en su momento."
},
    "exits": {
      "sur": "archivos_deposito_antiguo",
      "este": "archivos_sala_indices",
      "norte": "archivos_mesa_restauracion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_mesa_restauracion": {
    "id": "archivos_mesa_restauracion",
    "area": "archivos",
    "name": "Mesa de Restauración",
    "desc": "Una mesa amplia está preparada para limpiar, estabilizar y reconstruir físicamente documentos deteriorados sin fingir recuperar lo que ya se perdió. Pesos, pinceles y soportes mantienen fragmentos en posición mientras se decide qué puede conservarse. El trabajo exige distinguir con cuidado entre lectura, reconstrucción y conjetura.",
    "scenery": {
  "pinceles": "Herramientas suaves retiran polvo sin arrancar fibras debilitadas.",
  "pesos": "Piezas lisas sujetan bordes deformados mientras se estabilizan.",
  "fragmentos": "Restos incompletos se colocan sobre fondos neutros para no confundir huecos con texto.",
  "anotaciones": "Fichas separan con claridad lo legible, lo reconstruido y lo imposible de confirmar."
},
    "exits": {
      "sur": "archivos_camara_copias",
      "oeste": "archivos_pasaje_inferior"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_pasaje_inferior": {
    "id": "archivos_pasaje_inferior",
    "area": "archivos",
    "name": "Pasaje Inferior",
    "desc": "Una escalera discreta desciende desde las salas de trabajo hacia sectores menos utilizados del edificio. Tuberías de ventilación, muros más gruesos y reparaciones antiguas sustituyen gradualmente a estanterías y mesas. El cambio parece funcional: debajo del archivo también existe una estructura que necesita sostenerse.",
    "scenery": {
  "escalera": "Peldaños estrechos bajan entre muros de piedra sin decoración.",
  "ventilacion": "Conductos simples mantienen seco el espacio y evitan humedad acumulada.",
  "muros": "La mampostería aumenta de grosor y muestra técnicas distintas a las salas superiores.",
  "marcas": "Señales de mantenimiento indican revisiones de humedad, grietas y carga estructural."
},
    "exits": {
      "este": "archivos_mesa_restauracion",
      "abajo": "archivos_deposito_sellado"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_deposito_sellado": {
    "id": "archivos_deposito_sellado",
    "area": "archivos",
    "name": "Depósito Sellado",
    "desc": "Una cámara protegida conserva materiales cuya consulta requiere una orden concreta además del acceso al archivo restringido. Cajas lacradas, soportes cerrados y registros de apertura muestran que la sensibilidad del contenido se administra de forma explícita. Nada en la sala promete que todo lo guardado trate del mismo asunto.",
    "scenery": {
  "cajas": "Contenedores cerrados llevan códigos de colección y marcas de custodia.",
  "lacres": "Sellos permiten saber si un lote fue abierto desde su última revisión.",
  "registro_apertura": "Una tabla anota qué material fue consultado y bajo qué autorización.",
  "armarios": "Compartimentos sólidos protegen soportes delicados o de acceso especialmente limitado."
},
    "exits": {
      "arriba": "archivos_pasaje_inferior",
      "oeste": "archivos_muro_fundaciones"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_muro_fundaciones": {
    "id": "archivos_muro_fundaciones",
    "area": "archivos",
    "name": "Muro de las Fundaciones",
    "desc": "El depósito termina contra un muro cuya piedra, juntas y orientación no coinciden del todo con el edificio que descansa encima. Reparaciones posteriores lo integran en los cimientos actuales, y varias marcas demuestran que fue inspeccionado más de una vez. A simple vista es una obra antigua reutilizada, no una respuesta completa sobre su origen.",
    "scenery": {
  "bloques": "Piedras grandes y regulares forman una sección más antigua que los muros adyacentes.",
  "juntas": "Las uniones conservan una precisión difícil de reproducir en las reparaciones posteriores.",
  "refuerzos": "Elementos modernos descargan peso sobre la estructura sin reemplazarla.",
  "marcas_inspeccion": "Números y líneas recientes registran movimientos, grietas y revisiones."
},
    "exits": {
      "este": "archivos_deposito_sellado",
      "sur": "archivos_conducto_antiguo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "archivos_conducto_antiguo": {
    "id": "archivos_conducto_antiguo",
    "area": "archivos",
    "name": "Conducto de las Placas",
    "desc": "Un conducto estrecho parte de las fundaciones y alcanza una estructura transversal revestida por placas de piedra. Algunas superficies llevan divisiones y marcas demasiado regulares para ser simples refuerzos, aunque su función ya no forma parte del trabajo cotidiano del Archivo. El tramo se conserva porque también cumple funciones de sostén y ventilación.",
    "scenery": {
  "placas": "Piezas planas recubren sectores del conducto con un patrón repetido.",
  "ranuras": "Canales finos recorren algunas juntas y desaparecen bajo la estructura transversal.",
  "sello": "Bloques, placas y encajes forman un mecanismo capaz de aislar este tramo del resto del conducto; su funcionamiento completo no resulta evidente desde aquí.",
  "mantenimiento": "Marcas actuales muestran que se revisan humedad y estabilidad, no una función más profunda."
},
    "exits": {
      "norte": "archivos_muro_fundaciones",
      "abajo": "ala_archivos_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_portico": {
    "id": "formaciones_portico",
    "area": "formaciones",
    "name": "Pórtico de Formaciones",
    "desc": "El acceso a Formaciones deja atrás el silencio documental y entra en un sector donde se perciben vibración tenue, conducciones y actividad técnica. Placas de inspección, soportes y líneas de servicio aparecen antes incluso de llegar al patio principal. El lugar parece una instalación mantenida, no un santuario.",
    "scenery": {
  "placas": "Superficies marcadas permiten revisar uniones y detectar desplazamientos.",
  "conductos": "Canales cerrados atraviesan muros y suelo hacia dependencias interiores.",
  "soportes": "Estructuras sencillas mantienen instrumentos y herramientas fuera de las rutas de paso.",
  "vibracion": "Una pulsación leve puede sentirse al apoyar la mano sobre algunos elementos de piedra."
},
    "exits": {
      "oeste": "interior_escalinata_formaciones",
      "este": "formaciones_patio_medicion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_patio_medicion": {
    "id": "formaciones_patio_medicion",
    "area": "formaciones",
    "name": "Patio de Medición",
    "desc": "Postes graduados, placas de referencia e instrumentos distribuidos alrededor de un patio convierten el espacio en un punto de comparación antes de entrar a salas más técnicas. Las mediciones se toman desde posiciones fijas para que los cambios puedan distinguirse del error humano. Nada aquí parece mágico por intención; parece metódico.",
    "scenery": {
  "postes": "Marcas regulares permiten comparar altura, inclinación y desplazamientos.",
  "placas_referencia": "Piedras calibradas sirven como puntos estables para instrumentos portátiles.",
  "instrumentos": "Agujas, péndulos y recipientes sellados responden a distintos tipos de variación.",
  "marcas_suelo": "Líneas y posiciones numeradas indican dónde debe colocarse cada medición."
},
    "exits": {
      "oeste": "formaciones_portico",
      "norte": "formaciones_sala_control",
      "sur": "formaciones_taller_tecnico"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_sala_control": {
    "id": "formaciones_sala_control",
    "area": "formaciones",
    "name": "Sala de Control",
    "desc": "Paneles de piedra, indicadores y diagramas reúnen lecturas procedentes de distintos sectores del sistema moderno. El espacio está pensado para comparar cambios y decidir ajustes sin desplazarse inmediatamente a cada nodo. La cantidad de información no implica comprensión total: controlar un sistema y conocer su origen son problemas distintos.",
    "scenery": {
  "paneles": "Placas con agujas, ranuras y marcas permiten seguir varias lecturas a la vez.",
  "diagramas": "Esquemas modernos representan nodos y conducciones conocidas con simbología técnica.",
  "tablillas": "Registros de ajustes y respuestas ayudan a comparar intervenciones anteriores.",
  "señales": "Indicadores simples distinguen estabilidad, desviación y necesidad de inspección."
},
    "exits": {
      "sur": "formaciones_patio_medicion",
      "este": "formaciones_galeria_norte"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_taller_tecnico": {
    "id": "formaciones_taller_tecnico",
    "area": "formaciones",
    "name": "Taller Técnico",
    "desc": "Herramientas de precisión, placas de repuesto y componentes modernos ocupan un taller dedicado a mantener la red en servicio. Muchas piezas pueden fabricarse o sustituirse aquí; otras solo admiten ajustes sobre estructuras más antiguas que nadie intenta reproducir completas. El oficio técnico se nota en la cantidad de soluciones prácticas acumuladas.",
    "scenery": {
  "herramientas": "Calibres, pinzas, martillos pequeños y útiles de grabado se ordenan por función.",
  "placas_repuesto": "Componentes modernos esperan clasificados por tamaño y patrón de conexión.",
  "banco": "Una mesa pesada permite desmontar mecanismos sin transmitir vibraciones al resto del taller.",
  "piezas_antiguas": "Algunos elementos retirados se conservan porque su forma sirve de referencia aunque no puedan copiarse exactamente."
},
    "exits": {
      "norte": "formaciones_patio_medicion",
      "este": "formaciones_galeria_sur"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_galeria_norte": {
    "id": "formaciones_galeria_norte",
    "area": "formaciones",
    "name": "Galería Norte",
    "desc": "Una galería técnica conduce parte del sistema hacia el sector oriental mediante canales cerrados y placas de inspección. El paso se mantiene libre para permitir acceso rápido a puntos de revisión. El sonido de la instalación cambia al avanzar, como si distintas secciones transmitieran la vibración de manera desigual.",
    "scenery": {
  "conductos": "Canales empotrados recorren pared y suelo hacia el nodo oriental.",
  "placas_inspeccion": "Cubiertas desmontables permiten revisar uniones sin abrir toda la conducción.",
  "marcas": "Símbolos técnicos identifican tramos y puntos de prueba.",
  "resonancia": "Golpes suaves producen respuestas distintas según el sector de la galería."
},
    "exits": {
      "oeste": "formaciones_sala_control",
      "este": "formaciones_nodo_oriental",
      "sur": "formaciones_camara_central"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_galeria_sur": {
    "id": "formaciones_galeria_sur",
    "area": "formaciones",
    "name": "Galería Sur",
    "desc": "Conducciones modernas y soportes de mantenimiento recorren una galería que enlaza el taller con el sector occidental. Hay más piezas reparadas y adaptaciones visibles que en la ruta norte, como si este lado hubiera requerido intervenciones más frecuentes. Aun así, la instalación funciona como parte ordinaria del conjunto.",
    "scenery": {
  "empalmes": "Uniones de épocas distintas muestran reparaciones compatibles con el mismo sistema.",
  "soportes": "Abrazaderas y bases mantienen conductos alineados pese a pequeñas deformaciones.",
  "etiquetas": "Códigos de mantenimiento señalan piezas sustituidas y puntos a vigilar.",
  "zumbido": "Una vibración baja cambia ligeramente cerca de los empalmes más antiguos."
},
    "exits": {
      "oeste": "formaciones_taller_tecnico",
      "este": "formaciones_nodo_occidental",
      "norte": "formaciones_camara_central"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_nodo_oriental": {
    "id": "formaciones_nodo_oriental",
    "area": "formaciones",
    "name": "Nodo Oriental",
    "desc": "Instrumentos rodean un punto donde varias conducciones se encuentran y redistribuyen antes de seguir hacia la Cámara Central. Las superficies muestran calibraciones repetidas y marcas de prueba, señal de que el nodo se observa más de lo que se modifica. Su comportamiento puede medirse sin que resulte obvio qué diseño más antiguo condiciona sus límites.",
    "scenery": {
  "anillo": "Una estructura circular sostiene puntos de conexión alrededor del nodo.",
  "agujas": "Indicadores responden a cambios de carga y dirección de flujo.",
  "marcas_calibracion": "Líneas superpuestas registran ajustes realizados en distintas intervenciones.",
  "conducciones": "Entradas y salidas convergen sin quedar completamente expuestas."
},
    "exits": {
      "oeste": "formaciones_galeria_norte"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_nodo_occidental": {
    "id": "formaciones_nodo_occidental",
    "area": "formaciones",
    "name": "Nodo Occidental",
    "desc": "Un conjunto de placas y conducciones concentra lecturas del sector occidental antes de enviarlas hacia el centro. La construcción moderna está bien mantenida, pero algunas piezas se adaptan a bases cuya forma no coincide con los estándares actuales. La diferencia se acepta como parte del trabajo, no como una rareza ceremonial.",
    "scenery": {
  "placas": "Componentes actuales se fijan sobre una base de piedra más antigua.",
  "lecturas": "Indicadores permiten comparar presión, vibración y respuesta del nodo.",
  "anclajes": "Piezas metálicas compensan diferencias entre estructuras de distintas épocas.",
  "sellos_tecnicos": "Marcas de mantenimiento registran inspecciones y ajustes conocidos."
},
    "exits": {
      "oeste": "formaciones_galeria_sur"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_camara_central": {
    "id": "formaciones_camara_central",
    "area": "formaciones",
    "name": "Cámara Central",
    "desc": "La regulación moderna converge en una sala limpia donde líneas, placas e instrumentos forman un sistema comprensible para quienes lo mantienen. No hay ruina ni abandono: aquí la secta sabe qué ajustar y qué respuesta esperar dentro de ciertos márgenes. Precisamente esa normalidad vuelve más significativa cualquier parte que dependa de elementos que nadie puede reconstruir desde cero.",
    "scenery": {
  "panel_central": "Un conjunto de indicadores resume el comportamiento de varios nodos modernos.",
  "lineas": "Trazados visibles organizan conexiones sin ocultarlas bajo decoración.",
  "reguladores": "Mecanismos actuales permiten correcciones pequeñas y controladas.",
  "bases": "Algunas piezas modernas descansan sobre soportes de piedra notablemente más antiguos."
},
    "exits": {
      "norte": "formaciones_galeria_norte",
      "sur": "formaciones_galeria_sur",
      "abajo": "formaciones_sala_mapas"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_sala_mapas": {
    "id": "formaciones_sala_mapas",
    "area": "formaciones",
    "name": "Sala de Mapas de Flujo",
    "desc": "Mapas técnicos representan recorridos, cargas y relaciones entre sectores conocidos de la montaña. Muchas líneas están documentadas con precisión hasta que alcanzan zonas registradas bajo nombres genéricos o heredados, donde la información se vuelve menos detallada. El mapa muestra lo que la institución puede seguir, no una cartografía perfecta de todo lo que existe.",
    "scenery": {
  "mapas": "Diagramas superpuestos distinguen agua, carga espiritual, mantenimiento y conexiones técnicas.",
  "lineas_incompletas": "Algunos trazados terminan en categorías de servicio sin describir el tramo posterior.",
  "leyendas": "Símbolos modernos conviven con nombres heredados que ya no se usan fuera de documentos técnicos.",
  "mesa_comparacion": "Una superficie amplia permite colocar mediciones de campo junto a los planos."
},
    "exits": {
      "arriba": "formaciones_camara_central",
      "sur": "formaciones_conducto_carga"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_conducto_carga": {
    "id": "formaciones_conducto_carga",
    "area": "formaciones",
    "name": "Conducto de Carga",
    "desc": "Una conducción de gran sección desciende desde las salas de mapas hacia niveles de servicio. Placas gruesas, amortiguadores y accesos de inspección indican que por aquí circula una parte importante de la carga del sistema. El corredor está diseñado para transportar y contener, no para recibir visitantes.",
    "scenery": {
  "conducto": "Una estructura cerrada atraviesa el espacio y desaparece hacia niveles inferiores.",
  "amortiguadores": "Bloques y juntas flexibles reducen vibraciones transmitidas a muros cercanos.",
  "registros": "Marcas de inspección permiten seguir desgaste y sustitución de componentes.",
  "accesos": "Pequeñas compuertas técnicas permiten revisar sectores concretos sin abrir toda la conducción."
},
    "exits": {
      "norte": "formaciones_sala_mapas",
      "abajo": "formaciones_nivel_servicio"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_nivel_servicio": {
    "id": "formaciones_nivel_servicio",
    "area": "formaciones",
    "name": "Nivel de Servicio",
    "desc": "El acabado cuidado de las salas superiores cede a pasarelas, accesos de mantenimiento y componentes expuestos. Aquí los procedimientos importan más que la apariencia: revisar, ajustar, aislar y volver a comprobar. Algunas instrucciones se siguen porque funcionan de manera fiable aunque su justificación original ya no esté completa.",
    "scenery": {
  "pasarelas": "Plataformas estrechas permiten alcanzar conducciones y mecanismos sin pisar zonas sensibles.",
  "instrucciones": "Tablillas técnicas describen secuencias de mantenimiento con advertencias precisas.",
  "piezas": "Componentes modernos se mezclan con bases y canales que claramente son más antiguos.",
  "marcas_seguridad": "Símbolos indican qué elementos no deben desmontarse de forma simultánea."
},
    "exits": {
      "arriba": "formaciones_conducto_carga",
      "oeste": "formaciones_estacion_baja",
      "este": "formaciones_sala_regulacion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_estacion_baja": {
    "id": "formaciones_estacion_baja",
    "area": "formaciones",
    "name": "Estación Baja",
    "desc": "Una estación de medición recoge señales procedentes de niveles inferiores y las traduce a instrumentos que el personal moderno puede interpretar. Varias lecturas muestran pequeñas discrepancias entre lo que entra, lo que sale y lo que los modelos esperan. Sin comparación adicional, esas diferencias son datos pendientes, no una conclusión.",
    "scenery": {
  "medidores": "Instrumentos separados registran magnitudes distintas para evitar confundir una variación con otra.",
  "tablillas": "Series de lecturas permiten reconocer desviaciones persistentes.",
  "conductos_inferiores": "Canales descienden fuera de vista hacia sectores no representados con el mismo detalle.",
  "marcas": "Puntos de referencia ayudan a repetir una medición desde exactamente la misma posición."
},
    "exits": {
      "este": "formaciones_nivel_servicio",
      "sur": "formaciones_sello_antiguo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_sala_regulacion": {
    "id": "formaciones_sala_regulacion",
    "area": "formaciones",
    "name": "Sala de Regulación Inferior",
    "desc": "Dos conjuntos de conducciones responden entre sí dentro de una sala donde los ajustes nunca se realizan sobre un único lado de forma aislada. Cuando una carga aumenta, el sistema deriva parte de la presión hacia otra ruta hasta recuperar estabilidad. Para el personal es una técnica de regulación heredada y eficaz; su significado más amplio no está escrito en las paredes.",
    "scenery": {
  "conductos_pares": "Dos rutas principales recorren lados opuestos de la sala y convergen en mecanismos comunes.",
  "reguladores": "Piezas móviles permiten ceder o recibir carga entre ambos recorridos.",
  "indicadores": "Las agujas muestran respuestas vinculadas entre los dos lados.",
  "procedimientos": "Tablillas advierten que ciertas operaciones deben realizarse de forma coordinada."
},
    "exits": {
      "oeste": "formaciones_nivel_servicio",
      "sur": "formaciones_conducto_antiguo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_sello_antiguo": {
    "id": "formaciones_sello_antiguo",
    "area": "formaciones",
    "name": "Sello Antiguo",
    "desc": "Una estructura conocida y documentada ocupa el acceso a un descenso técnico. Placas, anclajes y controles modernos rodean una pieza de construcción mucho más antigua, inspeccionada con regularidad por su importancia estructural. No es una puerta secreta, sino un límite deliberado dentro de la infraestructura.",
    "scenery": {
  "sello": "Bloques y placas forman un cierre sólido integrado en la infraestructura moderna.",
  "anclajes": "Refuerzos posteriores mantienen estable la unión con los muros actuales.",
  "registro": "Marcas de inspección confirman revisiones periódicas del estado físico del cierre.",
  "descenso": "Más allá de la estructura se reconoce el inicio de un descenso técnico integrado en niveles más antiguos."
},
    "exits": {
      "norte": "formaciones_estacion_baja",
      "abajo": "formaciones_descenso_tecnico"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_descenso_tecnico": {
    "id": "formaciones_descenso_tecnico",
    "area": "formaciones",
    "name": "Descenso Técnico",
    "desc": "Una escalera y plataformas de servicio bajan por una estructura más antigua que las instalaciones visibles arriba. El trazado fue conservado para inspección y tránsito técnico, y permite revisar muros, anclajes y niveles inmediatos. Desde aquí se percibe profundidad y obra deliberada, pero no una explicación sobre todo lo que existe debajo.",
    "scenery": {
  "escalera": "Peldaños de piedra y refuerzos posteriores descienden siguiendo un eje estrecho.",
  "plataformas": "Descansos técnicos permiten inspeccionar muros y anclajes a distintas alturas.",
  "paredes": "Superficies antiguas muestran una regularidad distinta de los niveles de servicio modernos.",
  "cierre_inferior": "La continuación inferior está integrada en la infraestructura de control y conserva marcas de inspección y autorización del sector."
},
    "exits": {
      "arriba": "formaciones_sello_antiguo",
      "abajo": "ala_vestibulo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "formaciones_conducto_antiguo": {
    "id": "formaciones_conducto_antiguo",
    "area": "formaciones",
    "name": "Conducto de las Dos Corrientes",
    "desc": "Un conducto lateral abandona la Sala de Regulación y alcanza una estructura donde dos canales discurren en paralelo antes de desaparecer hacia niveles distintos. La disposición parece relacionada con la lógica operativa de la sala, pero el trazado continúa más allá de la documentación moderna. Se conserva como infraestructura antigua integrada al sistema.",
    "scenery": {
  "canal_izquierdo": "Un recorrido estrecho mantiene marcas de desgaste y depósitos distintos de su pareja.",
  "canal_derecho": "La segunda conducción avanza a la misma altura con un patrón semejante pero no idéntico.",
  "placas": "Piezas antiguas mantienen ambos canales separados al atravesar la estructura de enlace.",
  "sello": "Placas y encajes forman un mecanismo de aislamiento integrado en el conducto, sin que desde este lado resulte evidente toda su lógica de operación."
},
    "exits": {
      "norte": "formaciones_sala_regulacion",
      "abajo": "ala_formaciones_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_portico_sur": {
    "id": "alturas_portico_sur",
    "area": "alturas",
    "name": "Pórtico de las Alturas",
    "desc": "Un pórtico abierto recibe la escalinata procedente de la Secta Interior y la entrega a una ruta que asciende hacia sectores más expuestos. La arquitectura sigue siendo cuidada, pero deja más roca visible y menos muros entre el caminante y la montaña. Desde aquí el ascenso parece institucional todavía, aunque el viento ya tenga más espacio para entrar.",
    "scenery": {
  "columnas": "Pilares sobrios enmarcan la salida sin cerrar la vista hacia la pendiente.",
  "roca": "Sectores del suelo y los muros aprovechan directamente la piedra de la montaña.",
  "señal": "Una tablilla identifica las Alturas y recuerda que ciertos tramos requieren autorización.",
  "viento": "El aire circula con mayor libertad que en los patios inferiores y arrastra olor a pino y piedra."
},
    "exits": {
      "sur": "interior_escalinata_alturas",
      "norte": "alturas_escalinata_blanca"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_escalinata_blanca": {
    "id": "alturas_escalinata_blanca",
    "area": "alturas",
    "name": "Escalinata Blanca",
    "desc": "Una escalera de piedra pálida asciende en tramos largos entre taludes bajos y muros de contención. Los peldaños siguen la pendiente con suficiente regularidad para permitir tránsito seguro, aunque la exposición aumenta a cada descanso. La secta ha domesticado el recorrido, no la altura.",
    "scenery": {
  "peldaños": "La piedra clara está pulida en el centro y más áspera en los bordes.",
  "descansos": "Pequeñas plataformas interrumpen la subida y permiten apartarse del paso principal.",
  "baranda": "Tramos de madera aparecen solo donde la caída lateral lo justifica.",
  "taludes": "La tierra contenida deja ver raíces, roca y plantas resistentes al viento."
},
    "exits": {
      "sur": "alturas_portico_sur",
      "norte": "alturas_terraza_baja"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_terraza_baja": {
    "id": "alturas_terraza_baja",
    "area": "alturas",
    "name": "Terraza Baja",
    "desc": "Una terraza amplia funciona como último gran distribuidor antes de que las rutas se vuelvan más estrechas y naturales. Desde aquí parten el camino hacia la caseta, el ascenso al Paso del Viento y un desvío lateral hacia el Balcón de Oriente. La presencia de la secta sigue siendo evidente, pero deja de dominar por completo el terreno.",
    "scenery": {
  "pavimento": "Losas firmes cubren el centro y se mezclan con roca natural hacia los bordes.",
  "mojones": "Señales bajas indican las rutas sin llenar la terraza de carteles.",
  "vista": "La Secta Interior queda parcialmente visible por debajo entre tejados y laderas.",
  "borde": "El terreno cae con suficiente suavidad para admitir vegetación baja antes de volverse abrupto más arriba."
},
    "exits": {
      "sur": "alturas_escalinata_blanca",
      "oeste": "alturas_caseta_guardacumbre",
      "norte": "alturas_paso_viento",
      "este": "alturas_balcon_oriente"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_caseta_guardacumbre": {
    "id": "alturas_caseta_guardacumbre",
    "area": "alturas",
    "name": "Caseta de Guardacumbre",
    "desc": "Una construcción compacta sirve a quienes revisan senderos, señales y estructuras de las Alturas. Camas, herramientas, capas gruesas y registros de mantenimiento comparten un interior sin lujo, pero mejor protegido que cualquier refugio silvestre. Es una instalación de trabajo de la secta en un territorio que exige vigilancia constante.",
    "scenery": {
  "camastros": "Camas sencillas y firmes ocupan una pared, separadas de herramientas y ropa de trabajo.",
  "capas": "Prendas resistentes al viento cuelgan cerca de la entrada junto a guantes y correas.",
  "herramientas": "Martillos, cuerda, clavos y piezas de señalización esperan en soportes numerados.",
  "registro": "Tablillas anotan senderos revisados, reparaciones pendientes y observaciones de la montaña."
},
    "exits": {
      "este": "alturas_terraza_baja",
      "norte": "alturas_sendero_pinos_altos"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "alturas_caseta_guardacumbre",
      "inicio": "La caseta te ofrece un camastro limpio y protección firme frente a la exposición de las Alturas. Puedes recuperarte aquí antes de volver a los senderos superiores."
    }
  },
  "alturas_sendero_pinos_altos": {
    "id": "alturas_sendero_pinos_altos",
    "area": "alturas",
    "name": "Sendero de los Pinos Altos",
    "desc": "Un sendero occidental asciende entre pinos de tronco duro y copas deformadas por la exposición. La senda sigue siendo mantenida, pero raíces, roca y agujas cubren buena parte del suelo. A medida que se gana altura, la vegetación deja de ocultar por completo las laderas de Bosques y Cantera.",
    "scenery": {
  "pinos": "Los árboles crecen separados y retorcidos, con ramas más densas del lado protegido.",
  "raices": "Cruzan el sendero y sujetan suelo donde la pendiente se vuelve inestable.",
  "agujas": "Una capa seca cubre piedra y tierra, amortiguando los pasos.",
  "marcas": "Cortes discretos en troncos confirman la ruta hacia el balcón superior."
},
    "exits": {
      "sur": "alturas_caseta_guardacumbre",
      "norte": "alturas_balcon_poniente"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_balcon_poniente": {
    "id": "alturas_balcon_poniente",
    "area": "alturas",
    "name": "Balcón de Poniente",
    "desc": "Una saliente protegida abre la vista hacia las laderas occidentales de la montaña. Bosque Alto, cortes de Cantera y rutas ya recorridas pueden reconocerse desde una perspectiva que une espacios antes separados por largos tramos de camino. El balcón no conduce a ellos: solo permite entender mejor cómo se relacionan.",
    "scenery": {
  "bosque": "Las copas del Bosque Alto forman manchas irregulares entre crestas y claros.",
  "cantera": "Cortes de roca y superficies más desnudas permiten reconocer la zona de extracción.",
  "pretil": "Un borde de piedra protege la saliente sin ocultar la vista.",
  "mapa_visual": "Mojones naturales y rutas conocidas ayudan a relacionar el paisaje con el territorio ya explorado."
},
    "exits": {
      "sur": "alturas_sendero_pinos_altos",
      "este": "alturas_paso_viento",
      "norte": "alturas_aguja_piedra"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_balcon_oriente": {
    "id": "alturas_balcon_oriente",
    "area": "alturas",
    "name": "Balcón de Oriente",
    "desc": "Una terraza lateral mira hacia el este desde un punto separado del ascenso principal. Entre laderas y cauces se reconocen sectores de Aguas, campos del Valle y la franja húmeda donde se asienta Sauces Bajos. Es un mirador lateral de retorno, accesible únicamente desde la Terraza Baja.",
    "scenery": {
  "aguas": "Barrancos y reflejos parciales del cauce aparecen entre cortes de roca.",
  "valle": "Terrazas y caminos más amplios se distinguen por su geometría regular.",
  "sauces": "Una franja arbolada marca la zona baja y húmeda de la comunidad.",
  "pretil": "La piedra del borde conserva reparaciones donde la exposición castigó las juntas."
},
    "exits": {
      "oeste": "alturas_terraza_baja"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_paso_viento": {
    "id": "alturas_paso_viento",
    "area": "alturas",
    "name": "Paso del Viento",
    "desc": "El camino institucional se estrecha al atravesar una franja donde el aire circula sin apenas obstáculos. Arbustos bajos, roca desnuda y pinos inclinados sustituyen la regularidad de la terraza. A partir de aquí el mantenimiento de la secta conserva una ruta, pero ya no controla el carácter del terreno.",
    "scenery": {
  "corriente": "El viento atraviesa el paso con fuerza suficiente para mover ropa y ramas de manera constante.",
  "roca": "Superficies desnudas ofrecen apoyo firme, aunque algunas acumulan grava suelta.",
  "vegetacion": "Arbustos bajos y matas resistentes ocupan grietas protegidas.",
  "marcas": "Señales de ruta están fijadas con más cuidado para resistir la exposición."
},
    "exits": {
      "sur": "alturas_terraza_baja",
      "oeste": "alturas_balcon_poniente",
      "norte": "alturas_ladera_nubes"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_ladera_nubes": {
    "id": "alturas_ladera_nubes",
    "area": "alturas",
    "name": "Ladera de las Nubes",
    "desc": "Una ladera amplia se extiende por encima de los sectores más protegidos, con rutas que se abren hacia roca, claros y risco. Bancos de niebla pueden cruzar la pendiente y reducir la distancia visible sin convertir el lugar en un bosque húmedo. Aquí el cielo parece tan cercano como el suelo es inestable.",
    "scenery": {
  "pendiente": "Tierra delgada y piedra alternan en una superficie que obliga a elegir bien cada apoyo.",
  "niebla": "Franjas bajas atraviesan la ladera y se deshacen cuando encuentran corrientes más secas.",
  "hierbas": "Plantas cortas y flexibles ocupan las zonas donde el suelo logra acumularse.",
  "huellas": "Rastros de fauna y patrullas se cruzan sin formar un sendero único."
},
    "exits": {
      "sur": "alturas_paso_viento",
      "oeste": "alturas_aguja_piedra",
      "este": "alturas_claro_nubes",
      "norte": "alturas_risco_norte"
    },
    "items": [
      "polvo_nube"
    ],
    "mobs": [
      "halcon_tormenta",
      "halcon_tormenta"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculta": true,
    "oculto": []
  },
  "alturas_aguja_piedra": {
    "id": "alturas_aguja_piedra",
    "area": "alturas",
    "name": "Aguja de Piedra",
    "desc": "Un afloramiento estrecho de roca se alza sobre la ruta occidental y crea un punto reconocible incluso desde otras laderas. El paso rodea su base antes de continuar hacia zonas usadas por aves de altura. La formación parece natural, trabajada solo lo necesario para volverla segura como referencia y cruce.",
    "scenery": {
  "aguja": "Una columna irregular de piedra sobresale varios metros por encima del terreno cercano.",
  "base": "Pequeños escalones tallados mejoran el paso alrededor de la roca sin modificar su forma general.",
  "grietas": "Fisuras verticales acumulan polvo, plumas y vegetación mínima.",
  "vista": "Desde el lado expuesto se reconoce parte del Balcón de Poniente por debajo."
},
    "exits": {
      "sur": "alturas_balcon_poniente",
      "este": "alturas_ladera_nubes",
      "norte": "alturas_nido_halcones"
    },
    "items": [],
    "mobs": [
      "halcon_tormenta"
    ],
    "npcs": [],
    "vena": "rica",
    "salvaje": true,
    "oculta": true,
    "oculto": []
  },
  "alturas_collado": {
    "id": "alturas_collado",
    "area": "alturas",
    "name": "Collado de la Grulla",
    "desc": "Una depresión entre crestas reúne las rutas procedentes del Nido de los Halcones y del Risco del Norte antes de iniciar el ascenso final. El terreno vuelve a ofrecer una orientación clara después de varias laderas abiertas. Hacia el norte, una escalinata más cuidada anuncia el regreso de la arquitectura institucional.",
    "scenery": {
  "paso": "La forma natural del collado crea un corredor protegido entre dos elevaciones.",
  "mojon": "Una piedra marcada señala el comienzo del tramo administrado hacia la Cumbre.",
  "viento": "Las corrientes llegan desde varias vertientes y cambian de dirección dentro del paso.",
  "escalinata": "Peldaños regulares comienzan donde termina la roca irregular del collado."
},
    "exits": {
      "sur": "alturas_risco_norte",
      "oeste": "alturas_nido_halcones",
      "norte": "alturas_escalinata_cumbre"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_nido_halcones": {
    "id": "alturas_nido_halcones",
    "area": "alturas",
    "name": "Nido de los Halcones",
    "desc": "Repisas de roca y corrientes ascendentes convierten este sector en territorio apropiado para aves de gran tamaño. Plumas, restos de presas y marcas de garras pueden encontrarse entre salientes sin asegurar que ningún animal esté presente al entrar. La ruta continúa hacia el Collado por un paso natural.",
    "scenery": {
  "repisas": "Cornisas altas ofrecen superficies protegidas donde podrían asentarse nidos.",
  "plumas": "Algunas quedan atrapadas entre grietas y arbustos bajos.",
  "restos": "Huesos pequeños y fragmentos de caparazón aparecen dispersos cerca de puntos de alimentación.",
  "corrientes": "El aire asciende por la pared y forma columnas útiles para aves planeadoras."
},
    "exits": {
      "sur": "alturas_aguja_piedra",
      "este": "alturas_collado"
    },
    "items": [
      "polvo_nube",
      "polvo_nube"
    ],
    "mobs": [
      "devorador_niebla"
    ],
    "npcs": [],
    "vena": "rica",
    "oculta": true,
    "oculto": []
  },
  "alturas_senda_mantis": {
    "id": "alturas_senda_mantis",
    "area": "alturas",
    "name": "Senda de la Nube Quieta",
    "desc": "Una senda lateral avanza entre roca desnuda y bancos de niebla hacia un sector menos transitado de las Alturas. Las marcas de patrulla son escasas y ciertos cortes en la vegetación parecen demasiado limpios para deberse al viento. La ruta no conduce al Collado: termina formando un corredor entre el Claro de las Nubes y el Risco del Norte.",
    "scenery": {
  "sendero": "Una franja angosta de suelo firme serpentea entre bloques y pendientes.",
  "cortes": "Tallos y hierbas muestran secciones limpias en lugares demasiado altos para el desgaste del paso.",
  "niebla": "Capas bajas suavizan contornos y hacen que la senda parezca más silenciosa que las laderas expuestas.",
  "marcas_patrulla": "Señales antiguas existen, pero aparecen a mayor distancia que en las rutas principales."
},
    "exits": {
      "sur": "alturas_claro_nubes",
      "oeste": "alturas_risco_norte"
    },
    "items": [
      "pluma_tempestad"
    ],
    "mobs": [
      "mantis_nube"
    ],
    "npcs": [],
    "vena": "rica",
    "oculta": true,
    "oculto": []
  },
  "alturas_claro_nubes": {
    "id": "alturas_claro_nubes",
    "area": "alturas",
    "name": "Claro de las Nubes",
    "desc": "Una depresión abierta entre laderas recoge niebla y aire más quieto que los pasos cercanos. La vegetación baja deja espacios amplios entre rocas, y algunas marcas de corte sobre tallos y piedra sugieren el uso frecuente del lugar por fauna territorial. El claro forma parte de una ruta lateral, no del ascenso obligatorio a la Cumbre.",
    "scenery": {
  "niebla": "Se acumula cerca del suelo antes de escapar por los bordes de la depresión.",
  "hierbas": "Matas bajas crecen en grupos separados por roca desnuda.",
  "cortes": "Marcas limpias aparecen en tallos y superficies blandas sin identificar por sí solas a su autor.",
  "salidas": "El terreno conduce de regreso a la ladera o hacia una senda más estrecha al norte."
},
    "exits": {
      "oeste": "alturas_ladera_nubes",
      "norte": "alturas_senda_mantis"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_risco_norte": {
    "id": "alturas_risco_norte",
    "area": "alturas",
    "name": "Risco del Norte",
    "desc": "Una franja de roca expuesta domina la parte superior de la ladera y ofrece el acceso real hacia el Collado desde este lado. El terreno es más duro, el viento más directo y las rutas de fauna se concentran alrededor de grietas y salientes. La senda lateral de la Nube Quieta desemboca aquí, pero el ascenso continúa por el risco.",
    "scenery": {
  "borde": "La caída lateral obliga a mantener distancia de las zonas erosionadas.",
  "grietas": "Fisuras profundas atraviesan la roca y ofrecen refugio a plantas y animales pequeños.",
  "huellas": "Marcas aisladas se concentran en los pasos más protegidos del viento.",
  "collado": "Más arriba se distingue la depresión que marca el siguiente punto seguro del ascenso."
},
    "exits": {
      "sur": "alturas_ladera_nubes",
      "este": "alturas_senda_mantis",
      "norte": "alturas_collado"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_escalinata_cumbre": {
    "id": "alturas_escalinata_cumbre",
    "area": "alturas",
    "name": "Escalinata de la Cumbre",
    "desc": "La montaña vuelve a adoptar líneas deliberadas en una escalinata que asciende desde el Collado hacia el sector ceremonial. Los peldaños son regulares, los bordes están reparados y desaparecen las bifurcaciones de fauna. El peligro natural queda atrás sin que la altura disminuya.",
    "scenery": {
  "peldaños": "Piedra clara y resistente forma una subida continua hacia la terraza superior.",
  "barandas": "Tramos discretos protegen los sectores más expuestos sin cerrar la vista.",
  "motivos": "Pequeños relieves de plumas aparecen de manera más frecuente al ganar altura.",
  "limite": "Las marcas de senderos silvestres desaparecen al entrar en el tramo ceremonial."
},
    "exits": {
      "sur": "alturas_collado",
      "norte": "alturas_terraza_cielo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_terraza_cielo": {
    "id": "alturas_terraza_cielo",
    "area": "alturas",
    "name": "Terraza del Cielo Abierto",
    "desc": "Una terraza amplia se abre por encima de buena parte de la montaña, con suficiente espacio y seguridad para permanecer sin tener que vigilar cada paso. El aire circula limpio entre muros bajos y piedra expuesta, y la vista permite reconocer muchas de las regiones recorridas. La calma del lugar lo vuelve apropiado para la meditación sin convertirlo en una fuente excepcional de poder.",
    "scenery": {
  "plataforma": "Losas bien ajustadas forman una superficie amplia y despejada.",
  "muros_bajos": "Bordes de piedra protegen de las caídas sin cortar el horizonte.",
  "vista": "Rutas, bosques, aguas y construcciones se superponen en distintos niveles de la montaña.",
  "marcas_meditacion": "Círculos discretos en la piedra indican lugares usados para práctica contemplativa."
},
    "exits": {
      "sur": "alturas_escalinata_cumbre",
      "norte": "alturas_pabellon_cumbre"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_pabellon_cumbre": {
    "id": "alturas_pabellon_cumbre",
    "area": "alturas",
    "name": "Pabellón de la Grulla",
    "desc": "Un pabellón ceremonial reúne relieves, inscripciones y motivos asociados a la memoria pública de la Grulla Blanca. La arquitectura es solemne sin ser lujosa, y el lenguaje de las inscripciones habla de protección, pacto, legado y vigilancia con una ambigüedad que el tiempo volvió ritual. El lugar celebra un vínculo; no explica literalmente su estado actual.",
    "scenery": {
  "relieves": "Figuras de una grulla rodean la montaña con alas extendidas y trazos distintos en cada lado.",
  "inscripciones": "Frases ceremoniales hablan de promesa, protección y continuidad sin narrar una historia completa.",
  "columnas": "Madera clara y piedra sostienen el pabellón con proporciones más elegantes que ostentosas.",
  "altar_simbolico": "Una plataforma baja recibe ofrendas conmemorativas y objetos ceremoniales, sin contener una presencia viva visible."
},
    "exits": {
      "sur": "alturas_terraza_cielo",
      "este": "alturas_campana_celeste"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_campana_celeste": {
    "id": "alturas_campana_celeste",
    "area": "alturas",
    "name": "Campana Celeste",
    "desc": "Una gran campana cuelga bajo una estructura abierta junto al Pabellón. Su tamaño y desgaste sugieren un uso reservado a ocasiones solemnes. El bronce conserva relieves de plumas y montañas, y el mazo permanece asegurado cuando no existe motivo ceremonial para emplearlo.",
    "scenery": {
  "campana": "Bronce oscuro con zonas más claras alrededor del borde y los relieves.",
  "relieves": "Plumas, nubes y perfiles de montaña recorren la superficie sin formar un texto continuo.",
  "mazo": "Un tronco suspendido por cuerdas puede golpear la campana sin acercar demasiado las manos al bronce.",
  "armazon": "Vigas reforzadas distribuyen el peso y dejan el sonido libre hacia el exterior."
},
    "exits": {
      "oeste": "alturas_pabellon_cumbre",
      "norte": "alturas_mirador_grulla"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "alturas_mirador_grulla": {
    "id": "alturas_mirador_grulla",
    "area": "alturas",
    "name": "Mirador de la Grulla",
    "desc": "El camino termina en una plataforma de roca desde la que se percibe una gran parte del territorio de la Grulla Blanca. Sectores que durante el viaje parecían mundos separados se ordenan ahora bajo una misma montaña. El punto más alto accesible ofrece perspectiva y simbolismo, pero ninguna inscripción promete que la verdad más importante tenga que encontrarse aquí.",
    "scenery": {
  "territorio": "Bosques, canteras, cauces, campos y tejados aparecen unidos por rutas que desde abajo eran difíciles de relacionar.",
  "borde": "La roca desciende con brusquedad más allá de una protección baja y discreta.",
  "grulla_tallada": "Una figura simple está grabada en la piedra sin texto explicativo alrededor.",
  "horizonte": "La montaña ocupa el primer plano y el territorio exterior continúa más allá de sus límites visibles."
},
    "exits": {
      "sur": "alturas_campana_celeste"
    },
    "items": [],
    "mobs": [
      "centinela_pluma"
    ],
    "npcs": [],
    "vena": "normal",
    "oculta": true,
    "oculto": []
  },
  "ala_vestibulo": {
    "id": "ala_vestibulo",
    "area": "primera_ala",
    "name": "Vestíbulo de la Primera Ala",
    "desc": "El descenso técnico desemboca en un vestíbulo de piedra antigua cuyo orden resulta más preciso que el de una ruina improvisada. Conductos, ranuras y marcas de orientación convergen hacia un corredor central y una galería lateral. El lugar fue construido para recibir tránsito y distribuirlo, aunque ya no forme parte del uso cotidiano de la secta.",
    "scenery": {
  "piedra": "Bloques grandes y bien ajustados forman superficies más regulares que las excavaciones modernas.",
  "ranuras": "Canales estrechos recorren suelo y muros antes de desaparecer hacia otras salas.",
  "marcas": "Símbolos repetidos señalan direcciones y funciones sin usar la nomenclatura actual.",
  "descenso": "La estructura superior enlaza con Formaciones mediante el acceso técnico conocido."
},
    "exits": {
      "arriba": "formaciones_descenso_tecnico",
      "norte": "ala_nudo_seis_corrientes",
      "este": "ala_galeria_distribucion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_nudo_seis_corrientes": {
    "id": "ala_nudo_seis_corrientes",
    "area": "primera_ala",
    "name": "Nudo de las Seis Corrientes",
    "desc": "Seis rutas funcionales se reconocen alrededor de una cámara central donde canales, placas y conducciones cambian de dirección sin confundirse. Ninguna parece añadida al azar: las dimensiones, alturas y patrones se repiten con variaciones controladas. Incluso sin comprender el conjunto, resulta evidente que este espacio fue concebido como distribuidor.",
    "scenery": {
  "seis_rutas": "Aberturas y conducciones parten hacia sectores distintos con una simetría deliberada.",
  "anillo": "Una banda de piedra recorre el perímetro y enlaza visualmente los seis accesos.",
  "marcas": "Símbolos semejantes aparecen junto a cada ruta, modificados por pequeñas variantes.",
  "centro": "El suelo conserva una figura geométrica desgastada que organiza direcciones más que decorar."
},
    "exits": {
      "sur": "ala_vestibulo",
      "oeste": "ala_med_01",
      "este": "ala_jardines_01",
      "norte": "ala_camara_dos_alas",
      "abajo": "ala_aguas_01"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_camara_dos_alas": {
    "id": "ala_camara_dos_alas",
    "area": "primera_ala",
    "name": "Cámara de las Dos Alas",
    "desc": "La sala está organizada alrededor de dos trazados opuestos que recorren muros y suelo antes de encontrarse en un mismo centro sin fundirse por completo. Las seis ramas parecen relacionarse con ese patrón de maneras distintas. El nombre de la cámara deja de parecer una metáfora simple, aunque todavía no explique por sí solo para qué servía toda la red.",
    "scenery": {
  "trazado_izquierdo": "Una red de líneas y placas ocupa un lado de la cámara con recorridos propios.",
  "trazado_derecho": "El patrón opuesto refleja parte de la geometría del primero sin copiarlo exactamente.",
  "centro": "Ambos sistemas alcanzan una estructura común que mantiene separadas varias conducciones.",
  "inscripciones": "Textos operativos fragmentarios describen ajustes y relaciones, no una doctrina completa."
},
    "exits": {
      "sur": "ala_nudo_seis_corrientes",
      "oeste": "ala_archivos_01",
      "este": "ala_formaciones_01"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_galeria_distribucion": {
    "id": "ala_galeria_distribucion",
    "area": "primera_ala",
    "name": "Galería de Distribución",
    "desc": "Una galería ancha conecta el vestíbulo con sectores laterales y con una ruta descendente hacia instalaciones minerales. Placas de carga, surcos y soportes indican que por aquí circularon materiales además de personas. La infraestructura central no era solo simbólica: movía recursos entre funciones distintas.",
    "scenery": {
  "surcos": "Marcas paralelas en el suelo sugieren carros o plataformas de transporte antiguas.",
  "placas": "Piedras planas identifican puntos de transferencia y peso.",
  "soportes": "Bases vacías muestran dónde existieron mecanismos auxiliares o contenedores.",
  "ramal": "Una de las rutas desciende hacia estructuras relacionadas con piedra y mineral."
},
    "exits": {
      "oeste": "ala_vestibulo",
      "sur": "ala_cantera_01",
      "este": "ala_umbral_mantenimiento"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_umbral_mantenimiento": {
    "id": "ala_umbral_mantenimiento",
    "area": "primera_ala",
    "name": "Umbral de Mantenimiento",
    "desc": "La galería termina ante un acceso técnico que continúa hacia niveles de servicio más profundos. El acabado se vuelve menos ceremonial y más práctico: anclajes, puntos de inspección y superficies pensadas para ser abiertas por personal de mantenimiento. El umbral promete continuidad operativa, no respuestas históricas.",
    "scenery": {
  "marco": "Una abertura robusta separa la red principal de niveles de servicio inferiores.",
  "anclajes": "Puntos metálicos y huecos de fijación muestran reparaciones realizadas en distintas épocas.",
  "placas_revision": "Superficies desmontables permiten comprobar conducciones cercanas.",
  "descenso": "La estructura continúa hacia abajo mediante un acceso técnico integrado en el conjunto."
},
    "exits": {
      "oeste": "ala_galeria_distribucion",
      "abajo": "mantenimiento_acceso"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_med_01": {
    "id": "ala_med_01",
    "area": "primera_ala",
    "name": "Galería del Pulso",
    "desc": "Una galería estrecha introduce la rama mediante líneas talladas que recorren paredes y suelo como trayectos de circulación. Los patrones recuerdan diagramas corporales sin reproducir un cuerpo humano completo. La conexión entre flujo y organismo parece aquí una idea de ingeniería antes que una técnica médica moderna.",
    "scenery": {
  "lineas": "Trazos continuos se bifurcan y reúnen siguiendo proporciones repetidas.",
  "placas": "Piezas pequeñas marcan puntos donde el recorrido podía medirse o intervenirse.",
  "relieves": "Formas abstractas evocan vasos y ramificaciones sin llegar a ser anatomía literal.",
  "suelo": "El trazado continúa hacia la siguiente sala como parte de un circuito."
},
    "exits": {
      "este": "ala_nudo_seis_corrientes",
      "oeste": "ala_med_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_med_02": {
    "id": "ala_med_02",
    "area": "primera_ala",
    "name": "Sala de los Conductos Gemelos",
    "desc": "Dos sistemas de conducción recorren la sala en paralelo y responden a controles distintos antes de volver a relacionarse. Las estructuras son demasiado grandes para una práctica clínica corriente y demasiado precisas para simples tuberías. El principio parece estudiar qué ocurre cuando dos circulaciones comparten un mismo espacio.",
    "scenery": {
  "conducto_izquierdo": "Una línea de piedra y metal conserva marcas de presión y ajustes antiguos.",
  "conducto_derecho": "El segundo recorrido mantiene proporciones semejantes con diferencias deliberadas.",
  "controles": "Pequeños reguladores permiten modificar un lado sin tocar necesariamente el otro.",
  "marcas": "Anotaciones operativas comparan respuestas entre ambos recorridos."
},
    "exits": {
      "este": "ala_med_01",
      "norte": "ala_med_04",
      "oeste": "ala_med_03"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_med_03": {
    "id": "ala_med_03",
    "area": "primera_ala",
    "name": "Cámara de Concordancia",
    "desc": "Dos corrientes procedentes de rutas distintas se observaban aquí antes de permitirles influirse mutuamente. La arquitectura fuerza proximidad sin mezcla completa, como si la relación entre ambas importara más que su volumen individual. El concepto resulta familiar, pero todavía no explica cómo se aplicó después al cuerpo.",
    "scenery": {
  "canales": "Dos recorridos convergen hacia una zona central sin perder separación física.",
  "medidores": "Nichos y soportes vacíos señalan posiciones de instrumentos desaparecidos.",
  "centro": "Una estructura compartida permite transmitir presión o respuesta entre ambos lados.",
  "marcas": "Trazos de comparación registran ajustes repetidos sobre configuraciones semejantes."
},
    "exits": {
      "este": "ala_med_02",
      "norte": "ala_med_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_med_04": {
    "id": "ala_med_04",
    "area": "primera_ala",
    "name": "Sala de Observación",
    "desc": "Una sala lateral permite observar el comportamiento de los conductos sin intervenir directamente sobre ellos. Ventanas minerales, escalas y superficies de registro convierten el espacio en un puesto de comparación. La disposición sugiere experimentación sistemática más que tratamiento de pacientes.",
    "scenery": {
  "ventanas": "Placas translúcidas permiten ver secciones de conducción protegidas.",
  "escalas": "Marcas talladas ofrecen referencias para cambios de nivel o presión.",
  "mesa_piedra": "Una superficie lisa conserva ranuras para tablillas o instrumentos.",
  "mirillas": "Aberturas estrechas comunican visualmente con tramos del circuito."
},
    "exits": {
      "sur": "ala_med_02",
      "oeste": "ala_med_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_med_05": {
    "id": "ala_med_05",
    "area": "primera_ala",
    "name": "Cámara de Retorno",
    "desc": "Las rutas de la rama vuelven a encontrarse en una cámara donde el flujo puede ser redirigido hacia ciclos anteriores o hacia el extremo superior. La geometría no favorece una simple salida: está pensada para comparar lo que regresa con lo que entró. El nombre parece referirse a circulación, no a desplazamiento humano.",
    "scenery": {
  "retornos": "Canales curvos devuelven parte del recorrido hacia puntos previos.",
  "placas": "Superficies de control presentan desgaste en posiciones repetidas.",
  "juntas": "La piedra muestra reparaciones donde el uso prolongado castigó las conexiones.",
  "salida": "Un conducto más profundo continúa hacia el Pozo de los Vasos."
},
    "exits": {
      "sur": "ala_med_03",
      "este": "ala_med_04",
      "oeste": "ala_med_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_med_06": {
    "id": "ala_med_06",
    "area": "primera_ala",
    "name": "Pozo de los Vasos",
    "desc": "Un pozo vertical reúne varios conductos antes de proyectarlos hacia niveles superiores de la montaña. Tubos, ranuras y cámaras laterales suben fuera de la vista, conectando esta infraestructura con obras posteriores construidas encima. El parentesco con el Pabellón de Medicina puede reconocerse por forma y posición sin necesidad de una inscripción explicativa.",
    "scenery": {
  "pozo": "El eje vertical atraviesa varios niveles y distribuye conducciones a distintas alturas.",
  "vasos": "Canales estrechos se agrupan alrededor del muro como una red de circulación.",
  "mecanismo_superior": "Una compuerta y su estructura de enlace ocupan el extremo que asciende hacia Medicina.",
  "marcas": "Símbolos coinciden con variantes simplificadas vistas en instalaciones médicas modernas."
},
    "exits": {
      "este": "ala_med_05",
      "arriba": "sotano_conductos_medicina"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_jardines_01": {
    "id": "ala_jardines_01",
    "area": "primera_ala",
    "name": "Galería de las Semillas",
    "desc": "Nichos de piedra, canales finos y superficies de clasificación introducen una rama dedicada a organismos y crecimiento. Muchos recipientes han desaparecido, pero las formas de almacenamiento siguen siendo legibles. La relación con los Jardines modernos se percibe en la escala del trabajo, aunque la infraestructura sea mucho más antigua.",
    "scenery": {
  "nichos": "Huecos pequeños de tamaños regulares parecen haber recibido recipientes o lotes separados.",
  "canales": "Conductos estrechos llevaban agua hacia sectores distintos sin inundar la galería.",
  "etiquetas_piedra": "Símbolos grabados diferencian grupos y tratamientos sin usar nombres actuales.",
  "bandejas": "Superficies inclinadas permiten drenar y revisar material vegetal."
},
    "exits": {
      "oeste": "ala_nudo_seis_corrientes",
      "este": "ala_jardines_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_jardines_02": {
    "id": "ala_jardines_02",
    "area": "primera_ala",
    "name": "Bancales de Piedra",
    "desc": "Parcelas elevadas construidas enteramente en piedra forman bancales vacíos donde aún sobreviven sustrato endurecido, raíces fosilizadas y sistemas de riego. Cada sección podía recibir condiciones diferentes sin quedar aislada de las demás. El espacio parece haber servido para observar crecimiento bajo controles precisos.",
    "scenery": {
  "bancales": "Camas estrechas y profundas se distribuyen en niveles regulares.",
  "raices": "Restos mineralizados conservan formas de sistemas radiculares antiguos.",
  "riego": "Canales pequeños permiten alimentar cada bancal de manera independiente.",
  "desagues": "Surcos inferiores recogían exceso de agua y lo devolvían al circuito."
},
    "exits": {
      "oeste": "ala_jardines_01",
      "norte": "ala_jardines_04",
      "este": "ala_jardines_03"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_jardines_03": {
    "id": "ala_jardines_03",
    "area": "primera_ala",
    "name": "Cámara de Humedad",
    "desc": "La piedra permanece más oscura en una cámara diseñada para retener humedad y distribuirla de manera uniforme. Conductos perforados y depósitos poco profundos habrían mantenido un ambiente estable sin depender del clima exterior. La sala parece una versión antigua y subterránea de un invernadero húmedo.",
    "scenery": {
  "depositos": "Huecos bajos almacenaban agua sin cubrir toda la superficie.",
  "perforaciones": "Pequeñas aberturas en muros distribuían vapor o humedad.",
  "musgo": "Colonias actuales aprovechan zonas donde todavía se condensa agua.",
  "canales": "El sistema conecta con bancales y con el circuito de germinación."
},
    "exits": {
      "oeste": "ala_jardines_02",
      "norte": "ala_jardines_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_jardines_04": {
    "id": "ala_jardines_04",
    "area": "primera_ala",
    "name": "Vivero Antiguo",
    "desc": "Marcos de piedra y soportes elevados dividen una sala que debió albergar ejemplares en distintas etapas de desarrollo. La mayor parte está vacía, pero algunos sustratos y semillas endurecidas sobreviven en rincones protegidos. El espacio habla de observación prolongada, no de una colección ornamental.",
    "scenery": {
  "marcos": "Estructuras bajas delimitan zonas de cultivo individuales.",
  "soportes": "Bases elevadas permitían mover recipientes sin alterar el suelo principal.",
  "restos": "Material vegetal seco y mineralizado permanece en grietas protegidas.",
  "canaletas": "Pequeñas derivaciones daban agua a cada sector por separado."
},
    "exits": {
      "sur": "ala_jardines_02",
      "este": "ala_jardines_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_jardines_05": {
    "id": "ala_jardines_05",
    "area": "primera_ala",
    "name": "Canal de Germinación",
    "desc": "Un canal ancho atraviesa cámaras y bancales antes de alcanzar el extremo superior de la rama. Pequeños compartimentos laterales permiten exponer semillas o raíces a corrientes distintas sin soltarlas al flujo principal. El sistema parece estudiar respuesta y adaptación más que simple riego.",
    "scenery": {
  "canal": "Una corriente técnica recorría la sala siguiendo una pendiente mínima y controlada.",
  "compartimentos": "Huecos laterales mantienen espacios separados junto al mismo flujo.",
  "rejillas": "Estructuras finas impedían que semillas y raíces fueran arrastradas.",
  "marcas": "Símbolos repetidos distinguen condiciones o tratamientos diferentes."
},
    "exits": {
      "sur": "ala_jardines_03",
      "oeste": "ala_jardines_04",
      "este": "ala_jardines_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_jardines_06": {
    "id": "ala_jardines_06",
    "area": "primera_ala",
    "name": "Compuerta de las Raíces",
    "desc": "La rama termina bajo un mecanismo de compuerta rodeado por conductos de agua y antiguas cavidades radiculares. La obra asciende hacia estructuras que con el tiempo quedaron integradas en los Jardines modernos. La continuidad física resulta más evidente aquí que en cualquier inscripción.",
    "scenery": {
  "compuerta": "Un mecanismo vertical controla la continuidad del conducto hacia niveles superiores.",
  "raices_petrificadas": "Formas antiguas atraviesan grietas alrededor de la estructura.",
  "canales": "Rutas de agua convergen antes del tramo ascendente.",
  "placas": "Patrones grabados guardan semejanza con elementos del sistema de riego moderno."
},
    "exits": {
      "oeste": "ala_jardines_05",
      "arriba": "conducto_antiguo_jardines"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_cantera_01": {
    "id": "ala_cantera_01",
    "area": "primera_ala",
    "name": "Corredor de los Estratos",
    "desc": "Capas de roca de distinta composición quedan expuestas a lo largo de un corredor construido para observarlas y conducir carga. Las paredes combinan formación natural con cortes demasiado regulares para pertenecer a una mina improvisada. La extracción antigua parece haber formado parte del diseño de la instalación desde el principio.",
    "scenery": {
  "estratos": "Bandas minerales atraviesan la pared con espesores y colores distintos.",
  "cortes": "Superficies planas permiten comparar capas sin destruirlas por completo.",
  "surcos": "Marcas del suelo sugieren transporte de piedra o componentes pesados.",
  "placas": "Símbolos identifican sectores según propiedades materiales, no según valor comercial."
},
    "exits": {
      "norte": "ala_galeria_distribucion",
      "sur": "ala_cantera_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_cantera_02": {
    "id": "ala_cantera_02",
    "area": "primera_ala",
    "name": "Sala de Contrapesos",
    "desc": "Bloques suspendidos, ejes y canales de carga ocupan una sala donde el peso era redistribuido antes de continuar hacia cámaras laterales. El sistema parece capaz de compensar fuerzas de un sector con otro sin depender de motores visibles. Parte de la lógica recuerda técnicas modernas, aunque la escala y antigüedad sean distintas.",
    "scenery": {
  "contrapesos": "Bloques de piedra cuelgan o descansan en guías verticales de diferente recorrido.",
  "ejes": "Piezas robustas transmiten movimiento entre lados opuestos de la sala.",
  "marcas_carga": "Escalas grabadas permiten comparar posiciones y pesos.",
  "anclajes": "Uniones profundas muestran que el mecanismo formaba parte de la estructura original."
},
    "exits": {
      "norte": "ala_cantera_01",
      "sur": "ala_cantera_04",
      "este": "ala_cantera_03"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_cantera_03": {
    "id": "ala_cantera_03",
    "area": "primera_ala",
    "name": "Cámara Mineral",
    "desc": "Muestras, vetas y placas de roca se integran en una cámara donde diferentes materiales parecen haber sido probados como componentes de regulación. No hay pilas de mineral esperando transporte: la piedra está incorporada a paredes, soportes y mecanismos. El interés del lugar era cómo respondía cada material.",
    "scenery": {
  "muestras": "Bloques de composición distinta ocupan nichos etiquetados.",
  "vetas": "Algunas superficies conservan minerales semejantes a los encontrados en la Cantera moderna.",
  "placas": "Piezas trabajadas muestran desgaste desigual bajo condiciones similares.",
  "notas_piedra": "Inscripciones breves comparan respuesta, resonancia y estabilidad."
},
    "exits": {
      "sur": "ala_cantera_05",
      "oeste": "ala_cantera_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_cantera_04": {
    "id": "ala_cantera_04",
    "area": "primera_ala",
    "name": "Pozo de Resonancia",
    "desc": "Un eje profundo devuelve golpes y vibraciones con patrones regulares, como si varias cámaras ocultas respondieran a diferentes alturas. Pasarelas laterales permiten acercarse a puntos de medición sin descender al vacío. La resonancia aquí parece una propiedad utilizada, no un accidente de la caverna.",
    "scenery": {
  "pozo": "El eje desaparece fuera de la vista y conserva paredes parcialmente revestidas.",
  "ecos": "Sonidos breves regresan con tonos distintos según dónde se produzcan.",
  "placas_prueba": "Superficies marcadas indican puntos desde los que se realizaban mediciones.",
  "pasarelas": "Plataformas antiguas permiten bordear el pozo sin bloquear su centro."
},
    "exits": {
      "norte": "ala_cantera_02",
      "este": "ala_cantera_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_cantera_05": {
    "id": "ala_cantera_05",
    "area": "primera_ala",
    "name": "Galería de Piedra Blanca",
    "desc": "Piedra pálida reviste una galería cuyos bloques, juntas y proporciones coinciden con el conducto antiguo observado en la Cantera moderna. Aquí el material deja de parecer una rareza aislada y se integra en una red de carga y regulación. El reconocimiento espacial vale más que cualquier cartel.",
    "scenery": {
  "piedra_blanca": "Bloques claros forman paredes y conductos con juntas muy estrechas.",
  "juntas": "El patrón coincide con obras antiguas reutilizadas en niveles superiores.",
  "canales": "Ranuras llevan vibración o carga hacia la compuerta final.",
  "desgaste": "Zonas pulidas revelan uso prolongado antes del abandono."
},
    "exits": {
      "norte": "ala_cantera_03",
      "este": "ala_cantera_06",
      "oeste": "ala_cantera_04"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_cantera_06": {
    "id": "ala_cantera_06",
    "area": "primera_ala",
    "name": "Compuerta de los Canteros",
    "desc": "Una compuerta vertical ocupa el extremo de la rama y se integra con un conducto que asciende hacia las galerías profundas de Cantera. Poleas antiguas, guías de piedra y superficies de carga muestran una función logística además de técnica. La obra superior y esta instalación forman partes de una misma continuidad física.",
    "scenery": {
  "compuerta": "Una hoja pesada se desplaza dentro de guías talladas en la piedra.",
  "poleas": "Mecanismos robustos permiten mover peso mediante contrapesos y cuerdas.",
  "conducto_superior": "El eje asciende hacia la infraestructura antigua reutilizada por los canteros modernos.",
  "marcas": "Símbolos de carga y seguridad se repiten en otras salas de la rama."
},
    "exits": {
      "oeste": "ala_cantera_05",
      "arriba": "conducto_antiguo_cantera"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_aguas_01": {
    "id": "ala_aguas_01",
    "area": "primera_ala",
    "name": "Canal de las Corrientes Gemelas",
    "desc": "Dos corrientes paralelas descienden desde el Nudo de las Seis Corrientes por canales semejantes pero no idénticos. El agua mantiene diferencias sutiles de temperatura, sedimento y velocidad sin mezclarse de inmediato. La relación con el Manantial Partido resulta difícil de ignorar, aunque esta sala no explica quién diseñó el principio.",
    "scenery": {
  "corriente_clara": "Un canal transporta agua con sedimento más claro y flujo regular.",
  "corriente_oscura": "El otro recorrido conserva partículas más oscuras y una respuesta distinta al relieve.",
  "separador": "Una estructura central mantiene ambos flujos próximos sin fusionarlos.",
  "marcas": "Escalas paralelas permiten comparar niveles de las dos corrientes."
},
    "exits": {
      "arriba": "ala_nudo_seis_corrientes",
      "sur": "ala_aguas_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_aguas_02": {
    "id": "ala_aguas_02",
    "area": "primera_ala",
    "name": "Cámara de Bifurcación",
    "desc": "La rama distribuye las dos corrientes hacia recorridos laterales mediante compuertas y niveles cuidadosamente igualados. El sistema puede desviar una parte del caudal sin perder la relación entre ambos lados. La arquitectura trata la diferencia como algo que debe mantenerse y medir, no corregir.",
    "scenery": {
  "compuertas": "Mecanismos separados controlan cada ruta lateral.",
  "niveles": "Marcas paralelas permiten comparar caudales antes de la bifurcación.",
  "canal_oeste": "Una ruta se dirige hacia la Galería de Nivel.",
  "canal_este": "La otra conduce hacia la Cámara de Reunión y su conexión lateral."
},
    "exits": {
      "norte": "ala_aguas_01",
      "oeste": "ala_aguas_03",
      "este": "ala_aguas_04"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_aguas_03": {
    "id": "ala_aguas_03",
    "area": "primera_ala",
    "name": "Galería de Nivel",
    "desc": "Una galería estrecha sigue una de las corrientes y mantiene su altura mediante escalones hidráulicos casi imperceptibles. Marcas en la pared registran variaciones pequeñas con una precisión que no tendría sentido para simple abastecimiento. La sala parece destinada a comparar estabilidad a lo largo del recorrido.",
    "scenery": {
  "marcas_nivel": "Líneas finas cubren varios tramos de pared a alturas muy próximas.",
  "escalones": "Pequeñas diferencias de cota regulan la velocidad sin formar cascadas.",
  "canal": "El flujo mantiene anchura constante durante buena parte de la galería.",
  "salida": "La corriente desciende hacia el Pozo de Regulación."
},
    "exits": {
      "este": "ala_aguas_02",
      "sur": "ala_aguas_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_aguas_04": {
    "id": "ala_aguas_04",
    "area": "primera_ala",
    "name": "Cámara de Reunión",
    "desc": "Una cámara lateral permite aproximar dos recorridos de agua y comparar su comportamiento antes de enviarlos hacia el Pozo de Regulación. El enlace continúa de forma transversal, no descendente: la salida funcional hacia el pozo se abre por el este. La disposición confirma que la reunión era controlada, no una simple confluencia natural.",
    "scenery": {
  "cuencas": "Depósitos separados reciben agua de recorridos distintos.",
  "vertedero": "Una estructura común permite intercambiar caudal sin mezclarlo todo de golpe.",
  "canal_este": "La conducción lateral continúa hacia el Pozo de Regulación.",
  "marcas": "Símbolos dobles identifican entradas y respuestas de cada lado."
},
    "exits": {
      "oeste": "ala_aguas_02",
      "este": "ala_aguas_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_aguas_05": {
    "id": "ala_aguas_05",
    "area": "primera_ala",
    "name": "Pozo de Regulación",
    "desc": "Varias conducciones convergen en un pozo donde el nivel puede subir, bajar o redistribuirse entre rutas sin perder control del conjunto. La conexión con la Cámara de Reunión llega desde el oeste, mientras otra corriente entra desde la Galería de Nivel. El sistema parece diseñado para equilibrar diferencias antes de continuar hacia el manantial.",
    "scenery": {
  "pozo": "Un depósito vertical amortigua cambios bruscos de caudal.",
  "canal_oeste": "La conducción procedente de la Cámara de Reunión entra a media altura.",
  "canal_norte": "Otra ruta llega desde la Galería de Nivel con un perfil distinto.",
  "reguladores": "Compuertas y marcas permiten ajustar transferencia y salida."
},
    "exits": {
      "norte": "ala_aguas_03",
      "sur": "ala_aguas_06",
      "oeste": "ala_aguas_04"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_aguas_06": {
    "id": "ala_aguas_06",
    "area": "primera_ala",
    "name": "Compuerta del Manantial",
    "desc": "El agua abandona la rama bajo una estructura vertical que asciende hacia la antigua infraestructura del Manantial Partido. Conductos gemelos permanecen reconocibles hasta el último tramo antes de internarse en la roca superior. La continuidad entre esta obra y el sistema hídrico moderno resulta física, no meramente simbólica.",
    "scenery": {
  "compuerta": "Un mecanismo regula el tramo ascendente sin ocultar las dos conducciones.",
  "canales_gemelos": "Los recorridos continúan en paralelo hasta perderse hacia arriba.",
  "sedimentos": "Depósitos de tonos distintos permanecen separados en los bordes.",
  "revestimiento": "La piedra coincide con la Cámara Hídrica y el conducto antiguo de Aguas."
},
    "exits": {
      "norte": "ala_aguas_05",
      "arriba": "aguas_conducto_antiguo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_archivos_01": {
    "id": "ala_archivos_01",
    "area": "primera_ala",
    "name": "Corredor de las Placas",
    "desc": "Placas de piedra sustituyen papel y madera en una rama dedicada a registrar operación, personal y mantenimiento. Las inscripciones son breves, repetitivas y claramente funcionales. No parece una biblioteca enterrada: parece un sistema documental pensado para sobrevivir junto a la propia infraestructura.",
    "scenery": {
  "placas": "Filas de piezas grabadas ocupan nichos regulares a ambos lados.",
  "simbolos": "Marcas técnicas aparecen junto a nombres, cargos y referencias cruzadas.",
  "ranuras": "Algunos soportes permiten retirar o sustituir placas individuales.",
  "numeracion": "Series físicas ordenan la documentación sin depender de un único índice."
},
    "exits": {
      "este": "ala_camara_dos_alas",
      "oeste": "ala_archivos_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_archivos_02": {
    "id": "ala_archivos_02",
    "area": "primera_ala",
    "name": "Sala de Registros de Piedra",
    "desc": "Registros tallados y placas intercambiables documentan tareas, relevos y modificaciones realizadas en la instalación. La información es concreta y desigual: abundan instrucciones y nombres de trabajo, mientras faltan explicaciones generales sobre el propósito de todo el complejo. La memoria operativa sobrevivió mejor que la teoría.",
    "scenery": {
  "registros": "Listas de intervenciones asocian sectores, responsables y resultados.",
  "placas_reemplazo": "Algunas piezas posteriores ocupan huecos de inscripciones más antiguas.",
  "cargos": "Títulos de función no siempre coinciden con los usados por la secta moderna.",
  "marcas": "Correcciones físicas muestran que el sistema documental también evolucionó."
},
    "exits": {
      "norte": "ala_archivos_04",
      "este": "ala_archivos_01",
      "oeste": "ala_archivos_03"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_archivos_03": {
    "id": "ala_archivos_03",
    "area": "primera_ala",
    "name": "Índice de los Turnos",
    "desc": "Un conjunto de tablas minerales organiza personal y responsabilidades por periodos de servicio, no por linajes o prestigio. Nombres repetidos, huecos y cambios de denominación permiten seguir la continuidad de equipos durante largos intervalos. La sala conserva quién trabajó aquí mejor que por qué lo hacía.",
    "scenery": {
  "indices": "Tablas relacionan nombres con sectores y funciones concretas.",
  "huecos": "Algunas secuencias saltan registros o utilizan cargos sin nombre propio.",
  "marcas_turno": "Símbolos separan relevos y grupos de trabajo mediante secuencias propias de cada equipo.",
  "referencias": "Códigos llevan a otras placas de mantenimiento y operación."
},
    "exits": {
      "norte": "ala_archivos_05",
      "este": "ala_archivos_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_archivos_04": {
    "id": "ala_archivos_04",
    "area": "primera_ala",
    "name": "Cámara de los Nombres",
    "desc": "Miles de nombres aparecen agrupados por funciones, equipos y responsabilidades alrededor de una cámara de piedra. No son héroes conmemorados: la mayoría pertenece a personas que mantuvieron, midieron, repararon o registraron. La escala humana de la infraestructura se vuelve imposible de ignorar.",
    "scenery": {
  "nombres": "Filas de caracteres ocupan placas y franjas de muro sin jerarquía monumental.",
  "cargos": "Funciones técnicas acompañan muchos nombres y ayudan a identificar su papel.",
  "correcciones": "Algunas inscripciones fueron sustituidas o actualizadas sin borrar completamente la versión anterior.",
  "agrupaciones": "Los nombres se organizan por equipos y sectores más que por familias."
},
    "exits": {
      "sur": "ala_archivos_02",
      "oeste": "ala_archivos_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_archivos_05": {
    "id": "ala_archivos_05",
    "area": "primera_ala",
    "name": "Bóveda de Copias Minerales",
    "desc": "Copias de registros importantes fueron transferidas a placas minerales y guardadas en una cámara protegida. Algunas reproducen documentos conocidos en Archivos; otras conservan vocabulario y detalles que versiones posteriores simplificaron. Aun así, la bóveda trata de operación de Primera Ala y no contiene la historia completa de lo que existe más abajo.",
    "scenery": {
  "copias": "Placas duplican textos de distintas épocas con pequeñas variaciones.",
  "soportes": "Nichos profundos protegen piezas pesadas de golpes y humedad.",
  "variantes": "Palabras y nombres cambian entre copias que describen procedimientos semejantes.",
  "sellos": "Marcas identifican qué versión fue tomada como referencia en distintas etapas."
},
    "exits": {
      "sur": "ala_archivos_03",
      "este": "ala_archivos_04",
      "oeste": "ala_archivos_06"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_archivos_06": {
    "id": "ala_archivos_06",
    "area": "primera_ala",
    "name": "Conducto de las Placas",
    "desc": "Un conducto técnico asciende entre filas de soportes donde placas y mensajes podían trasladarse hacia los Archivos superiores. La estructura coincide con el conducto antiguo observado desde las fundaciones modernas. La separación entre archivo histórico e infraestructura resulta aquí mucho menos clara.",
    "scenery": {
  "guias": "Ranuras verticales permiten deslizar pequeños contenedores o placas.",
  "revestimiento": "La piedra coincide con el conducto antiguo observado en las fundaciones de los Archivos modernos.",
  "mecanismo_superior": "Un sistema de cierre y enlace ocupa el tramo que continúa hacia arriba.",
  "marcas": "Códigos de destino relacionan la rama con sectores documentales posteriores."
},
    "exits": {
      "este": "ala_archivos_05",
      "arriba": "archivos_conducto_antiguo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_formaciones_01": {
    "id": "ala_formaciones_01",
    "area": "primera_ala",
    "name": "Anillo de Regulación",
    "desc": "Un corredor circular parcial distribuye líneas de carga alrededor de un centro común antes de enviarlas a nodos especializados. La geometría recuerda a Formaciones modernas, pero aquí los canales forman parte integral de la piedra en vez de añadirse sobre ella. La arquitectura parece haber sido diseñada junto con la función.",
    "scenery": {
  "anillo": "Una banda continua de piedra integra conducciones a distintas alturas.",
  "lineas": "Trazados grabados separan recorridos que responden entre sí.",
  "puntos_medicion": "Nichos repetidos marcan lugares donde se comprobaba el sistema.",
  "conexiones": "Varias rutas convergen hacia la Cámara de los Seis Nodos."
},
    "exits": {
      "este": "ala_formaciones_02",
      "oeste": "ala_camara_dos_alas"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_formaciones_02": {
    "id": "ala_formaciones_02",
    "area": "primera_ala",
    "name": "Cámara de los Seis Nodos",
    "desc": "Seis estructuras de regulación ocupan posiciones equidistantes alrededor de una cámara central. Cada una responde a un sector distinto, pero todas comparten soportes y canales de retorno. La correspondencia con las seis ramas deja de parecer una coincidencia, aunque todavía no revele el propósito histórico completo.",
    "scenery": {
  "seis_nodos": "Estructuras semejantes presentan pequeñas diferencias funcionales.",
  "centro": "Un distribuidor común recibe y devuelve carga a todos los nodos.",
  "simbolos": "Cada nodo usa una variante de los signos vistos en las ramas.",
  "retornos": "Canales secundarios permiten que la respuesta de un nodo afecte al conjunto."
},
    "exits": {
      "norte": "ala_formaciones_04",
      "este": "ala_formaciones_03",
      "oeste": "ala_formaciones_01"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_formaciones_03": {
    "id": "ala_formaciones_03",
    "area": "primera_ala",
    "name": "Galería de Placas Dobles",
    "desc": "Pares de placas recorren la galería enfrentadas a ambos lados de una conducción central. Los mecanismos parecen comparar, compensar o transferir carga entre elementos equivalentes sin hacerlos idénticos. La lógica anticipa prácticas conservadas por los técnicos modernos.",
    "scenery": {
  "placas_izquierdas": "Una serie continua muestra desgaste y ajustes propios.",
  "placas_derechas": "La serie opuesta responde al mismo trazado con calibraciones distintas.",
  "conducto_central": "Una línea común recibe efecto de ambos lados sin absorberlos por completo.",
  "marcas": "Símbolos emparejados indican relaciones más que valores aislados."
},
    "exits": {
      "norte": "ala_formaciones_05",
      "oeste": "ala_formaciones_02"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_formaciones_04": {
    "id": "ala_formaciones_04",
    "area": "primera_ala",
    "name": "Sala de Calibración",
    "desc": "Escalas, contrapesos y referencias minerales permiten ajustar componentes antes de devolverlos a la red. La precisión del lugar contrasta con su antigüedad: muchas medidas siguen siendo comprensibles aunque no todos los fundamentos teóricos lo sean. La continuidad técnica con Formaciones modernas resulta directa.",
    "scenery": {
  "escalas": "Referencias grabadas permiten comparar posición, tensión y respuesta.",
  "contrapesos": "Piezas pequeñas equilibran mecanismos de prueba sin formar parte permanente de la red.",
  "patrones": "Placas estándar sirven para comprobar desviaciones de componentes.",
  "mesa": "Una superficie pétrea integra guías y puntos de fijación para calibrar piezas."
},
    "exits": {
      "sur": "ala_formaciones_02",
      "este": "ala_formaciones_05"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_formaciones_05": {
    "id": "ala_formaciones_05",
    "area": "primera_ala",
    "name": "Estación de Convergencia",
    "desc": "Rutas procedentes de placas, nodos y calibración convergen en una estación donde pueden influirse sin perder trazabilidad. La sala parece el punto en que resultados separados se vuelven una respuesta coordinada. Los técnicos modernos reconocerían el principio aunque no pudieran reproducir toda la obra.",
    "scenery": {
  "convergencias": "Varias líneas llegan a un mismo mecanismo desde ángulos distintos.",
  "aisladores": "Separadores de piedra evitan mezclas directas donde solo se necesita transferencia.",
  "indicadores": "Marcas y piezas móviles muestran estados relativos entre recorridos.",
  "salida": "Una conducción doble continúa hacia el extremo superior de la rama."
},
    "exits": {
      "sur": "ala_formaciones_03",
      "este": "ala_formaciones_06",
      "oeste": "ala_formaciones_04"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "ala_formaciones_06": {
    "id": "ala_formaciones_06",
    "area": "primera_ala",
    "name": "Conducto de las Dos Corrientes",
    "desc": "Dos conducciones paralelas ascienden desde la Estación de Convergencia hacia la infraestructura antigua integrada en Formaciones modernas. El patrón coincide con el conducto observado desde arriba, pero aquí puede seguirse hasta su origen dentro de la red. Es un vínculo funcional distinto de la entrada oficial por la que se llegó a Primera Ala.",
    "scenery": {
  "corriente_izquierda": "Un canal conserva marcas de carga y mantenimiento propias.",
  "corriente_derecha": "El segundo recorrido mantiene una respuesta complementaria.",
  "separador": "Placas antiguas conservan ambos trayectos próximos sin fusionarlos.",
  "mecanismo_superior": "La estructura asciende hacia el conducto técnico reutilizado por Formaciones."
},
    "exits": {
      "oeste": "ala_formaciones_05",
      "arriba": "formaciones_conducto_antiguo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_acceso": {
    "id": "mantenimiento_acceso",
    "area": "mantenimiento",
    "name": "Acceso de Mantenimiento",
    "desc": "El descenso desde Primera Ala termina en un acceso más estrecho y menos monumental. La piedra blanca continúa presente, pero está cubierta por reparaciones, anclajes y piezas sustituidas que pertenecen a épocas distintas. A partir de aquí la infraestructura deja de parecer una obra contemplada desde fuera y empieza a mostrar las manos que tuvieron que mantenerla.",
    "scenery": {
  "marco": "El acceso conserva la piedra antigua bajo refuerzos posteriores de madera y metal.",
  "anclajes": "Pernos, abrazaderas y rellenos muestran intervenciones realizadas sin reconstruir toda la obra original.",
  "marcas": "Números y símbolos de servicio se superponen a signos mucho más antiguos.",
  "escalera": "El tramo superior regresa hacia el Umbral de Mantenimiento de Primera Ala."
},
    "exits": {
      "arriba": "ala_umbral_mantenimiento",
      "norte": "mantenimiento_corredor_servicio"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_corredor_servicio": {
    "id": "mantenimiento_corredor_servicio",
    "area": "mantenimiento",
    "name": "Corredor de Servicio",
    "desc": "Un corredor funcional distribuye el paso hacia espacios de relevo, suministros y registros. Nichos, ganchos y reparaciones reemplazan la simetría de Primera Ala por una organización nacida del uso. No fue construido para impresionar a nadie: fue adaptado para que trabajadores pudieran moverse, dejar herramientas y resolver problemas sin detener la red.",
    "scenery": {
  "nichos": "Huecos en los muros guardaban herramientas, lámparas y materiales de uso frecuente.",
  "ganchos": "Soportes añadidos en distintas épocas permiten dejar capas, cuerdas y equipo.",
  "piso": "Las zonas centrales están pulidas por tránsito; los bordes conservan parches y rellenos.",
  "señales": "Marcas prácticas orientan hacia relevo, almacén y registros sin usar lenguaje ceremonial."
},
    "exits": {
      "sur": "mantenimiento_acceso",
      "oeste": "mantenimiento_estacion_relevo",
      "este": "mantenimiento_almacen",
      "norte": "mantenimiento_registro_consumo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_estacion_relevo": {
    "id": "mantenimiento_estacion_relevo",
    "area": "mantenimiento",
    "name": "Estación de Relevo",
    "desc": "Una mesa larga, casilleros y tablillas de responsabilidad convierten esta sala en el punto donde un grupo entregaba el trabajo al siguiente. Las anotaciones mezclan incidencias, comprobaciones y tareas pendientes. La infraestructura podía ser antigua, pero su funcionamiento dependía de personas capaces de decir qué habían hecho y qué quedaba por hacer.",
    "scenery": {
  "mesa": "La superficie presenta cortes, manchas de aceite y huecos donde se fijaban tablillas.",
  "casilleros": "Compartimentos numerados separaban equipo y documentación por responsabilidad.",
  "tablillas": "Registros fragmentarios enumeran revisiones, incidencias y operaciones de entrega.",
  "marcas_personales": "Iniciales y pequeños símbolos aparecen junto a anotaciones formales sin convertirse en memoriales."
},
    "exits": {
      "este": "mantenimiento_corredor_servicio",
      "norte": "mantenimiento_archivo_turnos",
      "oeste": "mantenimiento_dormitorio_turnos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_dormitorio_turnos": {
    "id": "mantenimiento_dormitorio_turnos",
    "area": "mantenimiento",
    "name": "Dormitorio de los Turnos",
    "desc": "Camastros, depósitos de agua y arcones ocupan una sala construida para trabajadores que debían permanecer bajo tierra durante periodos prolongados. Nada fue preparado para visitantes actuales, pero los cierres, el techo y parte del mobiliario siguen siendo utilizables. Las reparaciones domésticas hacen que el lugar se sienta vivido de una forma que Primera Ala nunca transmitía.",
    "scenery": {
  "camastros": "Estructuras sencillas y robustas conservan piezas sustituidas por ocupantes de épocas diferentes.",
  "arcones": "Cajas numeradas ofrecen espacio para ropa, útiles y pertenencias pequeñas.",
  "depositos_agua": "Recipientes cerrados permitían almacenar agua lejos del polvo y los conductos de servicio.",
  "marcas": "Números de cama, iniciales y frases breves sobreviven en madera y piedra sin formar diarios completos."
},
    "exits": {
      "este": "mantenimiento_estacion_relevo",
      "sur": "mantenimiento_comedor"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "mantenimiento_dormitorio_turnos",
      "inicio": "Encuentras un camastro todavía utilizable dentro de una sala protegida y estable. No hay personal ni instalaciones completas, pero el dormitorio ofrece un refugio seguro para descansar en Mantenimiento."
    }
  },
  "mantenimiento_comedor": {
    "id": "mantenimiento_comedor",
    "area": "mantenimiento",
    "name": "Comedor de Turno",
    "desc": "Bancos, mesas y un pequeño espacio de preparación recuerdan que quienes mantuvieron la red también necesitaban comer, conversar y reparar objetos cotidianos. El mobiliario es sencillo y está lleno de añadidos hechos a mano. Las reparaciones domésticas, las marcas de utensilios y el desgaste desigual de mesas y bancos dejan el rastro de rutinas repetidas por quienes trabajaban bajo tierra.",
    "scenery": {
  "mesas": "Tableros gruesos conservan marcas de utensilios, manchas y reparaciones pequeñas.",
  "bancos": "Asientos desiguales fueron reforzados muchas veces en lugar de sustituirse por completo.",
  "utensilios": "Recipientes y herramientas de cocina ordinaria ocupan estantes cerca de una zona de preparación.",
  "anotaciones": "Pequeñas cuentas y recordatorios domésticos aparecen junto a avisos de servicio."
},
    "exits": {
      "norte": "mantenimiento_dormitorio_turnos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_almacen": {
    "id": "mantenimiento_almacen",
    "area": "mantenimiento",
    "name": "Almacén de Suministros",
    "desc": "Estanterías y soportes conservan restos de los materiales empleados para sostener la red: metal, fibras, aceites, piedra tratada, reactivos y piezas de formación. Muchos son recursos perfectamente ordinarios; otros aparecen agrupados bajo categorías de servicio difíciles de relacionar con una sola reparación. La anomalía está mezclada con necesidades legítimas.",
    "scenery": {
  "estanterias": "Los soportes separan materiales por uso, estabilidad y peso.",
  "etiquetas": "Rótulos de épocas distintas conservan nombres antiguos y equivalencias añadidas después.",
  "contenedores": "Recipientes vacíos muestran residuos de aceites, reactivos y compuestos de mantenimiento.",
  "lotes": "Algunos grupos de materiales coinciden con suministros todavía utilizados en Producción."
},
    "exits": {
      "oeste": "mantenimiento_corredor_servicio",
      "sur": "mantenimiento_taller"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_taller": {
    "id": "mantenimiento_taller",
    "area": "mantenimiento",
    "name": "Taller de Reparaciones",
    "desc": "Bancos de trabajo, componentes desmontados y plantillas de ajuste llenan un taller donde piezas antiguas fueron reparadas durante generaciones con materiales cada vez más modernos. Una misma función puede aparecer resuelta con técnicas separadas por siglos. La red no permaneció intacta: permaneció operativa porque alguien siguió interviniéndola.",
    "scenery": {
  "bancos": "Superficies pesadas contienen guías, abrazaderas y marcas de montaje.",
  "piezas": "Componentes originales descansan junto a sustitutos fabricados con materiales posteriores.",
  "plantillas": "Patrones físicos permitían reproducir una forma aunque ya no se comprendiera toda su teoría.",
  "herramientas": "Útiles de distintas épocas comparten soportes adaptados una y otra vez."
},
    "exits": {
      "norte": "mantenimiento_almacen",
      "oeste": "mantenimiento_registro_consumo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_registro_consumo": {
    "id": "mantenimiento_registro_consumo",
    "area": "mantenimiento",
    "name": "Sala de Registros de Consumo",
    "desc": "Tablas, manifiestos y series de cuentas registran materiales utilizados por distintos sistemas de mantenimiento. La mayoría de las categorías son fáciles de justificar; unas pocas continúan durante periodos muy largos bajo nombres operativos como regulación profunda, sostenimiento central o relevo de presión. La sala ofrece datos para comparar, no una frase que explique por sí sola adónde va cada recurso.",
    "scenery": {
  "manifiestos": "Entradas de materiales se agrupan por función, sector y responsable.",
  "categorias": "Términos operativos sobreviven incluso cuando cambian los formatos del registro.",
  "comparaciones": "Algunas cantidades pueden relacionarse con reparaciones visibles; otras no tienen destino inmediato en esta sala.",
  "correcciones": "Notas posteriores traducen vocabulario antiguo a términos más recientes sin eliminar el original."
},
    "exits": {
      "sur": "mantenimiento_corredor_servicio",
      "este": "mantenimiento_taller",
      "norte": "mantenimiento_cisterna"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_archivo_turnos": {
    "id": "mantenimiento_archivo_turnos",
    "area": "mantenimiento",
    "name": "Archivo de Turnos",
    "desc": "Estantes compactos conservan registros de personas que trabajaron en Mantenimiento durante generaciones. La mayoría de los nombres no pertenece a maestros célebres ni figuras de estela: son operadores, aprendices y responsables de tareas concretas. La continuidad del sistema empieza a parecer una suma de relevos humanos antes que una voluntad única.",
    "scenery": {
  "listas": "Nombres y responsabilidades se repiten a través de series de registros de estilos distintos.",
  "cargos": "Funciones técnicas cambian de denominación aunque ciertas tareas permanecen reconocibles.",
  "familias": "Algunos apellidos y caracteres reaparecen separados por grandes grupos de registros.",
  "formatos": "Los documentos más recientes explican menos contexto y se concentran cada vez más en instrucciones."
},
    "exits": {
      "sur": "mantenimiento_estacion_relevo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_cisterna": {
    "id": "mantenimiento_cisterna",
    "area": "mantenimiento",
    "name": "Cisterna de Servicio",
    "desc": "Una cisterna profunda y canales de distribución explican cómo podían permanecer trabajadores bajo tierra sin depender de suministros constantes desde la superficie. El agua también alimenta limpieza, enfriamiento y mantenimiento de conductos. Variaciones de nivel y presión pueden registrarse aquí sin que su causa sea necesariamente local.",
    "scenery": {
  "cisterna": "Un depósito revestido de piedra conserva agua separada de los canales técnicos.",
  "nivel": "Muescas en el muro permiten comparar cambios de volumen entre inspecciones sucesivas.",
  "filtros": "Capas minerales y rejillas protegen el agua de sedimentos gruesos.",
  "conductos": "Varias salidas distribuyen agua hacia zonas de servicio y mecanismos inferiores."
},
    "exits": {
      "sur": "mantenimiento_registro_consumo",
      "norte": "mantenimiento_galeria_conductos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_galeria_conductos": {
    "id": "mantenimiento_galeria_conductos",
    "area": "mantenimiento",
    "name": "Galería de Conductos",
    "desc": "Conducciones procedentes de funciones distintas convergen en una galería donde ya resulta difícil asociar cada línea con una sola rama de Primera Ala. Reparaciones, derivaciones y válvulas transforman varios sistemas separados en un flujo orientado hacia niveles más profundos. La vida cotidiana queda atrás y la operación central gana protagonismo.",
    "scenery": {
  "conductos": "Tuberías, canales y líneas de carga llegan desde alturas y direcciones diferentes.",
  "empalmes": "Intervenciones posteriores conectan estructuras antiguas con componentes más recientes.",
  "valvulas": "Mecanismos de aislamiento permiten trabajar en un tramo sin detener necesariamente todos los demás.",
  "ramal_inspeccion": "Un paso lateral conduce al Puesto de Inspección y termina allí; no continúa hacia la Pasarela del Núcleo."
},
    "exits": {
      "sur": "mantenimiento_cisterna",
      "oeste": "mantenimiento_camara_presion",
      "este": "mantenimiento_puesto_inspeccion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_camara_presion": {
    "id": "mantenimiento_camara_presion",
    "area": "mantenimiento",
    "name": "Cámara de Presión",
    "desc": "Grandes reguladores, cámaras de expansión y sistemas de contención ocupan una sala donde la red no solo distribuye: también evita que determinadas variaciones se transmitan de forma brusca hacia arriba. Los instrumentos indican que algo situado más abajo exige estabilidad continua. La sala permite reconocer la función de contener sin revelar todavía qué se contiene.",
    "scenery": {
  "reguladores": "Mecanismos robustos absorben y redistribuyen cambios de carga.",
  "camaras": "Volúmenes cerrados ofrecen margen para que una variación no alcance inmediatamente al resto de la red.",
  "indicadores": "Marcas y piezas móviles comparan presión entre sectores.",
  "paso_norte": "La ruta profunda continúa hacia la Pasarela del Núcleo."
},
    "exits": {
      "este": "mantenimiento_galeria_conductos",
      "norte": "mantenimiento_pasarela_nucleo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_puesto_inspeccion": {
    "id": "mantenimiento_puesto_inspeccion",
    "area": "mantenimiento",
    "name": "Puesto de Inspección",
    "desc": "Un puesto lateral conserva protocolos para escuchar conductos, revisar vibración y comprobar cierres antes de intervenir. Muchas instrucciones siguen siendo útiles; otras sobreviven como secuencias cuyo motivo original se perdió. Más allá de las mesas solo continúan el muro y la infraestructura, y la Galería de Conductos permanece como único acceso al puesto.",
    "scenery": {
  "protocolos": "Tablillas enumeran secuencias de comprobación con advertencias concretas.",
  "instrumentos": "Varillas, placas acústicas y medidores simples permiten examinar conductos sin abrirlos.",
  "avisos": "Algunas instrucciones explican qué hacer pero no por qué hacerlo.",
  "fondo": "El puesto no tiene salida hacia la Pasarela; detrás de las mesas solo hay muro e infraestructura."
},
    "exits": {
      "oeste": "mantenimiento_galeria_conductos"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_pasarela_nucleo": {
    "id": "mantenimiento_pasarela_nucleo",
    "area": "mantenimiento",
    "name": "Pasarela del Núcleo",
    "desc": "Una pasarela estrecha abandona el sector de reparaciones y avanza hacia piedra mejor conservada, menos intervenida y más simétrica. Las manchas de aceite y los añadidos improvisados disminuyen a cada tramo. La transición no es todavía ceremonial por completo, pero deja claro que los mantenedores modificaban cada vez menos cuanto más se acercaban al centro.",
    "scenery": {
  "pasarela": "Una superficie firme atraviesa un espacio donde convergen conducciones hacia abajo.",
  "piedra": "Los bloques presentan menos parches y sustituciones que las salas anteriores.",
  "simbolos": "Signos antiguos reaparecen con mayor regularidad y menos anotaciones modernas encima.",
  "trayecto": "La ruta es lineal entre la Cámara de Presión y la Compuerta del Núcleo."
},
    "exits": {
      "sur": "mantenimiento_camara_presion",
      "norte": "mantenimiento_compuerta_nucleo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "mantenimiento_compuerta_nucleo": {
    "id": "mantenimiento_compuerta_nucleo",
    "area": "mantenimiento",
    "name": "Compuerta del Núcleo",
    "desc": "Una compuerta masiva ocupa el extremo inferior de Mantenimiento y separa las instalaciones de servicio de una estructura mucho menos alterada. Conductos y registros convergen hacia ella, mientras controles y marcas de custodia indican que su uso estuvo sujeto a procedimientos formales. No parece una entrada oculta, sino un límite deliberado entre dos niveles de la red.",
    "scenery": {
  "compuerta": "Piedra, metal y mecanismos de cierre forman una barrera integrada en la estructura original.",
  "controles": "Puntos de operación muestran añadidos de mantenimiento sin simplificar el sistema antiguo.",
  "inscripciones": "Términos como voto, relevo, centro y sostén aparecen sin contexto suficiente para resolver su significado.",
  "descenso": "Más allá de la compuerta la estructura continúa hacia niveles inferiores del Núcleo."
},
    "exits": {
      "sur": "mantenimiento_pasarela_nucleo",
      "abajo": "nucleo_pozo_voto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_pozo_voto": {
    "id": "nucleo_pozo_voto",
    "area": "nucleo",
    "name": "Pozo del Voto",
    "desc": "El descenso desde Mantenimiento desemboca en un pozo vertical donde conductos procedentes de la red desaparecen hacia capas inferiores. La piedra está mucho menos reparada y los símbolos antiguos vuelven a dominar sobre las anotaciones de servicio. El término «voto» aparece ligado a la estructura con una formalidad que no se parece a una simple orden de mantenimiento.",
    "scenery": {
  "pozo": "El eje desciende más allá del nivel de entrada y recibe conducciones de distintos sectores.",
  "conductos": "Líneas de carga y circulación convergen antes de perderse en niveles inferiores.",
  "simbolos": "Inscripciones repetidas relacionan voto, sostén y continuidad sin ofrecer una traducción completa.",
  "acceso_superior": "La conexión hacia Mantenimiento asciende hasta la Compuerta del Núcleo."
},
    "exits": {
      "arriba": "mantenimiento_compuerta_nucleo",
      "norte": "nucleo_camara_voto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_camara_voto": {
    "id": "nucleo_camara_voto",
    "area": "nucleo",
    "name": "Cámara del Voto",
    "desc": "Una cámara sobria conserva inscripciones y relieves donde figuras humanas y una gran ave aparecen vinculadas por líneas que recorren la montaña. La composición no presenta una escena de conquista ni de adoración. Lo que ocurrió aquí parece haber sido entendido como una obligación compartida, aunque la naturaleza exacta de ese compromiso requiera interpretar más que una imagen aislada.",
    "scenery": {
  "relieve": "Cultivadores y una figura alada aparecen a ambos lados de una red de corrientes.",
  "inscripciones": "Fragmentos hablan de acuerdo, sostén y responsabilidad utilizando fórmulas antiguas.",
  "sellos": "Marcas de varias partes ocupan posiciones equivalentes alrededor de la composición.",
  "centro": "Una figura geométrica une los relieves con conductos que continúan hacia el norte."
},
    "exits": {
      "sur": "nucleo_pozo_voto",
      "norte": "nucleo_galeria_primer_pacto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_galeria_primer_pacto": {
    "id": "nucleo_galeria_primer_pacto",
    "area": "nucleo",
    "name": "Galería del Primer Pacto",
    "desc": "Relieves fragmentarios recorren una galería mostrando la montaña antes de que las estructuras actuales dominaran sus laderas. Corrientes enfrentadas, animales desplazándose, cultivadores trabajando y la figura de una grulla aparecen en escenas separadas. Ningún mural funciona como una cronología perfecta; juntos sugieren colaboración y problema compartido más que una victoria.",
    "scenery": {
  "montaña": "Un relieve muestra cauces y corrientes sin edificios reconocibles de la secta moderna.",
  "cultivadores": "Grupos pequeños manipulan canales y marcas de formación en escenas incompletas.",
  "grulla": "La figura aparece junto a los humanos, nunca debajo de un vencedor ni sobre un altar.",
  "fracturas": "Partes perdidas impiden convertir la secuencia en una historia totalmente segura."
},
    "exits": {
      "sur": "nucleo_camara_voto",
      "norte": "nucleo_primer_pacto"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_primer_pacto": {
    "id": "nucleo_primer_pacto",
    "area": "nucleo",
    "name": "Cámara del Primer Pacto",
    "desc": "Una cámara circular reúne sellos, inscripciones y dos posiciones enfrentadas alrededor de un mismo mecanismo central. Las marcas parecen registrar participación de más de una parte y una intervención conjunta sobre la montaña. Las inscripciones conservan fórmulas que requieren compararse entre sí antes de que su sentido resulte inequívoco.",
    "scenery": {
  "sellos_dobles": "Dos grupos de marcas ocupan posiciones equivalentes alrededor del mecanismo central.",
  "mecanismo": "Canales y placas unen ambos lados con la red que continúa hacia niveles inferiores.",
  "inscripciones": "El texto conserva fórmulas de aceptación, tarea y responsabilidad que requieren interpretación contextual.",
  "suelo": "Dos recorridos llegan al centro y vuelven a separarse sin que uno domine visualmente al otro."
},
    "exits": {
      "sur": "nucleo_galeria_primer_pacto",
      "norte": "nucleo_archivo_promesa"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_archivo_promesa": {
    "id": "nucleo_archivo_promesa",
    "area": "nucleo",
    "name": "Archivo de la Promesa",
    "desc": "Placas, registros y copias de distintas épocas conservan referencias a una obligación que fue reinterpretada generación tras generación. Algunas hablan de relevo, otras de estabilización pendiente y otras de continuar el procedimiento existente. La acumulación permite estudiar cómo cambió una responsabilidad sin necesitar un único documento que explique todo el problema.",
    "scenery": {
  "placas": "Registros de épocas distintas reutilizan términos semejantes con matices cambiantes.",
  "relevo": "La palabra aparece asociada a sustitución, preparación y continuidad, no solo a cambios de personal.",
  "aplazamientos": "Anotaciones posteriores justifican continuar procedimientos mientras se resuelven crisis o limitaciones técnicas.",
  "descenso": "Una estructura descendente continúa hacia niveles más profundos, separada del archivo por un sistema de control propio."
},
    "exits": {
      "sur": "nucleo_primer_pacto",
      "abajo": "nucleo_descenso_pulso"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_descenso_pulso": {
    "id": "nucleo_descenso_pulso",
    "area": "nucleo",
    "name": "Descenso del Pulso",
    "desc": "La arquitectura histórica cede paso a un descenso donde vibración, presión y luz mineral repiten una oscilación lenta a través de la piedra. No se asemeja exactamente a un latido humano y, sin embargo, tampoco parece el comportamiento rígido de una máquina sin respuesta. El ritmo se vuelve más perceptible cuanto más se baja.",
    "scenery": {
  "vibracion": "Una pulsación tenue recorre barandas y muros con intervalos reconocibles.",
  "luz": "Minerales y líneas de formación responden con pequeñas variaciones de intensidad.",
  "conductos": "Canales antiguos descienden junto a la escalera y transmiten cambios hacia arriba.",
  "peldaños": "La ruta sigue una pendiente pronunciada entre descansos breves de inspección."
},
    "exits": {
      "arriba": "nucleo_archivo_promesa",
      "abajo": "nucleo_galeria_pulso"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_galeria_pulso": {
    "id": "nucleo_galeria_pulso",
    "area": "nucleo",
    "name": "Galería del Pulso",
    "desc": "Conductos y formaciones transmiten respuestas que varían de forma más compleja que una repetición programada. Algunos cambios parecen originarse fuera de los mecanismos visibles y propagarse por la red antes de ser amplificados. El espacio permite seguir esa dependencia dinámica, aunque a simple vista no sea posible identificar qué la produce.",
    "scenery": {
  "canales": "Líneas de qi recorren piedra y placas antes de distribuirse hacia la Cámara de Regulación.",
  "respuestas": "Variaciones de intensidad no siempre siguen el mismo orden ni la misma duración.",
  "amplificadores": "Estructuras antiguas reciben una señal y la reparten hacia varias conducciones.",
  "aisladores": "Separadores mantienen ciertas respuestas fuera de rutas donde podrían desestabilizar el conjunto."
},
    "exits": {
      "arriba": "nucleo_descenso_pulso",
      "norte": "nucleo_camara_regulacion"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_camara_regulacion": {
    "id": "nucleo_camara_regulacion",
    "area": "nucleo",
    "name": "Cámara de Regulación",
    "desc": "Una red de canales, limitadores y distribuidores transforma respuestas procedentes de niveles más profundos en ajustes que la infraestructura puede utilizar. Parte del sistema actúa de manera predecible; otra parte parece depender de una fuente capaz de responder a desequilibrios distintos. La sala permite comprender cómo se regula la red, pero no revela por sí sola la naturaleza de esa fuente.",
    "scenery": {
  "distribuidores": "Conducciones reparten una misma respuesta entre sectores con necesidades diferentes.",
  "limitadores": "Mecanismos reducen variaciones bruscas antes de que alcancen la red superior.",
  "retornos": "Parte de la información o carga vuelve hacia el origen en vez de circular en una sola dirección.",
  "indicadores": "Lecturas distintas cambian de forma coordinada cuando la pulsación profunda se modifica."
},
    "exits": {
      "sur": "nucleo_galeria_pulso",
      "norte": "nucleo_sala_relevo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_sala_relevo": {
    "id": "nucleo_sala_relevo",
    "area": "nucleo",
    "name": "Sala de Relevo del Ancla",
    "desc": "Camastros, agua, superficies de preparación y herramientas básicas ocupan una sala situada junto al tramo final de la red. No fue un dormitorio común: está dispuesta para personas que debían observar, esperar y actuar cerca del sistema central. Su estado la convierte todavía en un refugio seguro antes de avanzar hacia las cámaras finales.",
    "scenery": {
  "camastros": "Lechos sencillos permiten descansar sin alejarse demasiado de la zona de regulación.",
  "agua": "Depósitos protegidos aseguran una reserva separada de los conductos técnicos.",
  "mesa": "Una superficie amplia sirve para preparar equipo, revisar notas o disponer herramientas.",
  "protocolos": "Fragmentos de instrucciones usan el término «relevo» tanto para personal como para funciones del sistema."
},
    "exits": {
      "sur": "nucleo_camara_regulacion",
      "norte": "nucleo_exterior_ancla"
    },
    "items": [],
    "mobs": [],
    "npcs": [],
    "alojamiento": {
      "nombre": "nucleo_sala_relevo",
      "inicio": "La Sala de Relevo conserva camastros, agua y suficiente protección para descansar con seguridad. Es el último refugio estable antes de las cámaras finales del Núcleo."
    }
  },
  "nucleo_exterior_ancla": {
    "id": "nucleo_exterior_ancla",
    "area": "nucleo",
    "name": "Exterior del Ancla",
    "desc": "La ruta desemboca ante una estructura central rodeada por piedra blanca, filamentos de formación y canales que convergen desde toda la montaña. Plumas y marcas de movimiento entre los elementos del sistema sugieren una presencia ligada a la estructura, aunque desde aquí no pueda precisarse su naturaleza ni condición. La palabra «Ancla» deja de parecer únicamente un nombre técnico, pero las señales disponibles todavía no bastan para determinar su sentido completo.",
    "scenery": {
  "estructura": "Un entramado de piedra, qi y conductos ocupa el centro de la cámara sin parecer una máquina cerrada.",
  "plumas": "Restos blancos pueden quedar atrapados en filamentos y bordes de la formación.",
  "filamentos": "Líneas de qi se tensan y relajan siguiendo respuestas procedentes del interior.",
  "ramales": "La Cámara de la Memoria y el Umbral del Santuario parten de este punto sin confundirse entre sí."
},
    "exits": {
      "sur": "nucleo_sala_relevo",
      "oeste": "nucleo_camara_memoria",
      "norte": "nucleo_umbral_santuario"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_camara_memoria": {
    "id": "nucleo_camara_memoria",
    "area": "nucleo",
    "name": "Cámara de la Memoria",
    "desc": "Una cámara lateral conserva impresiones fragmentarias ligadas al vínculo mediante piedra, qi y superficies resonantes. No forman una reproducción perfecta del pasado: aparecen sensaciones, imágenes parciales y escenas sin principio ni final. La sala puede añadir contexto, pero no contiene una respuesta oculta que vuelva correcta una decisión y equivocada la otra.",
    "scenery": {
  "superficies": "Placas minerales responden al qi con imágenes incompletas y sonidos difíciles de fijar.",
  "fragmentos": "Manos reparando una placa, plumas junto a herramientas y voces truncadas aparecen sin continuidad segura.",
  "ecos": "Algunas impresiones se repiten con variaciones, como recuerdos deteriorados por múltiples transmisiones.",
  "salida": "La única ruta practicable devuelve al Exterior del Ancla."
},
    "exits": {
      "este": "nucleo_exterior_ancla"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_umbral_santuario": {
    "id": "nucleo_umbral_santuario",
    "area": "nucleo",
    "name": "Umbral del Santuario",
    "desc": "Un umbral amplio separa el Exterior del Ancla de la cámara final. Dos corrientes, líneas de piedra blanca y motivos de plumas convergen alrededor de una entrada amplia. No hay mecanismo visible que obligue a avanzar de inmediato, y el camino de regreso permanece despejado.",
    "scenery": {
  "corrientes": "Dos recorridos llegan a la entrada por lados opuestos y continúan hacia el interior.",
  "piedra_blanca": "Bloques claros forman un marco cuyas juntas se integran con la red profunda.",
  "plumas_talladas": "Relieves discretos sustituyen las señales técnicas de Mantenimiento.",
  "retorno": "El camino hacia la Sala de Relevo continúa disponible a través del Exterior del Ancla."
},
    "exits": {
      "sur": "nucleo_exterior_ancla",
      "norte": "nucleo_santuario_vinculo"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  },
  "nucleo_santuario_vinculo": {
    "id": "nucleo_santuario_vinculo",
    "area": "nucleo",
    "name": "Santuario del Vínculo",
    "desc": "La cámara final reúne motivos que aparecieron separados durante todo el descenso: dos corrientes, piedra blanca, canales de regulación, filamentos de qi y formas de plumas alrededor de un espacio central amplio. El espacio permanece despejado dentro del círculo de regulación, de modo que la formación puede observarse sin intervenir sobre ella. Todos los elementos convergen en sostener un vínculo cuya respuesta no puede deducirse solo de la arquitectura.",
    "scenery": {
  "circulo": "Un gran anillo de regulación organiza la cámara alrededor del centro.",
  "dos_corrientes": "Dos flujos recorren lados opuestos antes de relacionarse dentro de la formación.",
  "filamentos": "Líneas de qi conectan el círculo con conductos que ascienden hacia toda la red.",
  "plumas": "Motivos y restos blancos aparecen integrados en ranuras y filamentos de la formación, adheridos a la estructura en lugar de quedar sueltos sobre el suelo.",
  "centro": "El área central permanece despejada y amplia, organizada alrededor de la formación y sus líneas de qi."
},
    "exits": {
      "sur": "nucleo_umbral_santuario"
    },
    "items": [],
    "mobs": [],
    "npcs": []
  }
};
