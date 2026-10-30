const MAPA_CELDA = 56;
const MAPA_PASO_CARTOGRAFICO = 12;
// Vista del Atlas: escala en píxeles por unidad de dibujo (mismo tamaño de sala en todas las secciones),
// margen alrededor del dibujo y cuánto dibujo debe seguir a la vista al arrastrar (nunca se pierde el mapa).
const ATLAS_VISTA = { ESCALA_MIN: 0.62, ESCALA_MAX: 1.25, MARGEN: 34, VISIBLE_MIN: 60, ZOOM_MIN: 0.6, ZOOM_MAX: 2.6 };
const celdaMapa = (col, fila) => puntoMapa(col, fila);
const MAPA_POS = {"patio_raices":[12,60],"descansillo":[12,48],"mirador_niebla":[24,48],"patio_practica":[0,48],"sendero_pinos":[12,36],"camino":[12,24],"puerta":[12,12],"registro":[12,0],"aguas_senda_bosque":[12,12],"aguas_cauce_alto":[12,24],"aguas_paso_piedras":[0,0],"aguas_poza_clara":[36,0],"aguas_refugio_cauce":[0,36],"aguas_terraza_humeda":[12,36],"aguas_inicio_barranco":[36,36],"aguas_garganta_norte":[36,48],"aguas_pasarela_roca":[12,48],"aguas_poza_profunda":[48,48],"aguas_cascada_velada":[48,60],"aguas_filtraciones_cantera":[60,60],"aguas_paso_alto":[12,60],"aguas_garganta_sur":[60,72],"aguas_desvio_sauces":[60,84],"aguas_manantial_entrada":[60,96],"aguas_manantial_partido":[60,108],"aguas_rama_clara":[48,108],"aguas_rama_oscura":[36,120],"aguas_cuenca_reunion":[48,120],"aguas_camara_hidrica":[48,132],"aguas_conducto_antiguo":[48,144],"alturas_portico_sur":[12,132],"alturas_escalinata_blanca":[12,120],"alturas_terraza_baja":[12,108],"alturas_caseta_guardacumbre":[0,108],"alturas_sendero_pinos_altos":[0,96],"alturas_balcon_poniente":[0,84],"alturas_balcon_oriente":[24,108],"alturas_paso_viento":[12,84],"alturas_ladera_nubes":[12,72],"alturas_aguja_piedra":[0,72],"alturas_collado":[12,48],"alturas_nido_halcones":[0,48],"alturas_senda_mantis":[24,60],"alturas_claro_nubes":[24,72],"alturas_risco_norte":[12,60],"alturas_escalinata_cumbre":[12,36],"alturas_terraza_cielo":[12,24],"alturas_pabellon_cumbre":[12,12],"alturas_campana_celeste":[24,12],"alturas_mirador_grulla":[24,0],"archivos_portico":[72,36],"archivos_sala_consulta":[60,36],"archivos_escritorio_copistas":[60,24],"archivos_catalogo":[48,36],"archivos_deposito_comun":[48,24],"archivos_galeria_registros":[36,24],"archivos_sala_estelas":[36,12],"archivos_control_restringido":[24,24],"archivos_deposito_antiguo":[12,24],"archivos_sala_indices":[24,12],"archivos_camara_copias":[12,12],"archivos_mesa_restauracion":[12,0],"archivos_pasaje_inferior":[0,0],"archivos_deposito_sellado":[12,0],"archivos_muro_fundaciones":[0,0],"archivos_conducto_antiguo":[0,12],"bosque_linde_jardines":[0,0],"bosque_sendero_bajo":[0,12],"bosque_arroyo_bajo":[12,0],"bosque_claro_raices":[0,24],"bosque_puente_raices":[12,12],"bosque_puesto_marcas":[12,24],"bosque_ladera_baja":[0,36],"bosque_senda_patrulla":[24,24],"bosque_umbral_niebla":[12,36],"bosque_senda_niebla":[12,48],"bosque_refugio_patrulla":[24,48],"bosque_claro_humedo":[12,60],"bosque_pinos_torcidos":[0,60],"bosque_quebrada_niebla":[24,60],"bosque_cauce_oculto":[24,72],"bosque_loma_niebla":[12,72],"bosque_desvio_aguas":[36,72],"bosque_umbral_alto":[12,84],"bosque_ladera_alta":[12,96],"bosque_pinar_alto":[0,96],"bosque_rocas_blancas":[24,96],"bosque_corredor_viento":[12,108],"bosque_paso_hundido":[0,120],"bosque_hondonada":[12,120],"bosque_mirador_alto":[24,108],"bosque_senda_cantera":[36,108],"bosque_senda_aguas_alta":[24,120],"bosque_collado_alto":[12,132],"cantera_acceso_secta":[0,24],"patio_canteros":[12,24],"oficina_capataz":[12,12],"barracon_canteros":[12,36],"rampa_carga_cantera":[24,24],"frente_abierto":[24,12],"terraza_cantera":[48,12],"cantera_camino_valle":[36,24],"cantera_senda_bosque":[48,0],"cruce_vetas":[48,24],"desvio_termal":[0,0],"camara_caldera":[12,0],"paso_aguas_cantera":[0,12],"pozo_extraccion":[0,12],"galeria_veta_negra":[12,12],"veta_negra":[24,12],"camara_hierro":[24,0],"nido_escarabajos":[36,0],"sima_resonante":[36,24],"galeria_murcielagos":[0,24],"galeria_antigua_cantera":[48,24],"conducto_antiguo_cantera":[60,24],"formaciones_portico":[0,12],"formaciones_patio_medicion":[12,12],"formaciones_sala_control":[12,0],"formaciones_taller_tecnico":[12,24],"formaciones_galeria_norte":[24,0],"formaciones_galeria_sur":[24,24],"formaciones_nodo_oriental":[36,0],"formaciones_nodo_occidental":[36,24],"formaciones_camara_central":[24,12],"formaciones_descenso_tecnico":[0,0],"formaciones_sala_mapas":[36,0],"formaciones_conducto_carga":[36,12],"formaciones_nivel_servicio":[12,0],"formaciones_estacion_baja":[0,0],"formaciones_sala_regulacion":[24,0],"formaciones_sello_antiguo":[0,12],"formaciones_conducto_antiguo":[24,12],"jardines_puerta_norte":[12,0],"patio_jardineros":[12,12],"caseta_jardineros":[0,12],"almacen_jardines":[24,12],"sala_clasificacion":[24,24],"secadero_hierbas":[0,24],"bancal_norte":[12,24],"bancal_central":[12,36],"bancal_sur":[12,48],"invernadero_claro":[24,36],"invernadero_humedo":[36,36],"canal_principal":[36,48],"estanque_riego":[48,48],"sendero_herbolario":[0,36],"conducto_antiguo_jardines":[48,36],"mantenimiento_acceso":[24,72],"mantenimiento_corredor_servicio":[24,60],"mantenimiento_estacion_relevo":[12,60],"mantenimiento_dormitorio_turnos":[0,60],"mantenimiento_comedor":[0,72],"mantenimiento_almacen":[48,60],"mantenimiento_taller":[48,72],"mantenimiento_registro_consumo":[24,48],"mantenimiento_archivo_turnos":[12,48],"mantenimiento_cisterna":[24,36],"mantenimiento_galeria_conductos":[24,24],"mantenimiento_camara_presion":[12,24],"mantenimiento_puesto_inspeccion":[48,24],"mantenimiento_pasarela_nucleo":[12,12],"mantenimiento_compuerta_nucleo":[12,0],"medicina_portico_este":[60,36],"patio_medicina":[48,36],"recepcion_medicina":[48,12],"sala_recuperacion":[48,0],"corredor_medicina":[36,36],"sala_tratamientos":[24,48],"consultorio_meridianos":[12,48],"sala_anatomica":[24,36],"archivo_clinico":[12,36],"botica":[48,48],"laboratorio_alquimia":[48,72],"deposito_reactivos":[36,72],"sala_purificacion":[36,84],"sotano_conductos_medicina":[36,96],"nucleo_pozo_voto":[0,72],"nucleo_camara_voto":[0,60],"nucleo_galeria_primer_pacto":[0,48],"nucleo_primer_pacto":[0,36],"nucleo_archivo_promesa":[0,24],"nucleo_descenso_pulso":[36,24],"nucleo_galeria_pulso":[24,60],"nucleo_camara_regulacion":[24,48],"nucleo_sala_relevo":[24,36],"nucleo_exterior_ancla":[24,24],"nucleo_camara_memoria":[12,24],"nucleo_umbral_santuario":[24,12],"nucleo_santuario_vinculo":[24,0],"ala_vestibulo":[144,60],"ala_nudo_seis_corrientes":[144,36],"ala_camara_dos_alas":[144,12],"ala_galeria_distribucion":[156,60],"ala_umbral_mantenimiento":[168,60],"ala_med_01":[120,36],"ala_med_02":[72,36],"ala_med_03":[36,36],"ala_med_04":[72,24],"ala_med_05":[36,24],"ala_med_06":[0,24],"ala_jardines_01":[156,36],"ala_jardines_02":[168,36],"ala_jardines_03":[180,36],"ala_jardines_04":[168,24],"ala_jardines_05":[180,24],"ala_jardines_06":[192,24],"ala_cantera_01":[156,96],"ala_cantera_02":[156,132],"ala_cantera_03":[168,132],"ala_cantera_04":[156,144],"ala_cantera_05":[168,144],"ala_cantera_06":[180,144],"ala_aguas_01":[48,48],"ala_aguas_02":[48,72],"ala_aguas_03":[24,72],"ala_aguas_04":[84,72],"ala_aguas_05":[24,84],"ala_aguas_06":[24,108],"ala_archivos_01":[132,12],"ala_archivos_02":[96,12],"ala_archivos_03":[60,12],"ala_archivos_04":[96,0],"ala_archivos_05":[60,0],"ala_archivos_06":[0,0],"ala_formaciones_01":[156,12],"ala_formaciones_02":[168,12],"ala_formaciones_03":[180,12],"ala_formaciones_04":[168,0],"ala_formaciones_05":[180,0],"ala_formaciones_06":[192,0],"produccion_portico_oeste":[0,24],"patio_produccion":[12,24],"oficina_logistica":[12,12],"barracon_trabajadores":[12,48],"patio_carga":[24,24],"cochera_carros":[24,12],"patio_talleres":[36,24],"taller_lu_cheng":[36,12],"deposito_metales":[36,0],"taller_ning_cai":[36,36],"secadero_cueros":[36,60],"almacen_materiales":[60,24],"almacen_herramientas":[60,60],"area_embalaje":[48,60],"camino_cantera":[72,24],"camino_valle_carga":[24,48],"sauces_camino_valle":[24,12],"sauces_plaza":[36,12],"sauces_casa_huespedes":[36,0],"sauces_pozo":[36,24],"sauces_casa_comunal":[48,12],"sauces_calle_oeste":[12,0],"sauces_calle_este":[48,24],"sauces_herbolaria":[12,36],"sauces_huertos":[0,0],"sauces_saucedal":[0,36],"sauces_canal_bajo":[36,36],"sauces_puente_canal":[48,36],"sauces_taller_comunal":[60,24],"sauces_granero":[60,36],"sauces_campos":[60,48],"sauces_senda_barranco":[0,48],"patio":[60,72],"sala_jade":[60,84],"patio_cabanas":[24,72],"corredor_cabanas":[12,72],"dormitorio_externos":[0,72],"sala_comun_externos":[24,84],"lavadero_externos":[12,84],"comedor_externos":[24,60],"cocina_comunal":[48,60],"patio_servicios":[72,72],"oficina_servicios":[72,60],"tablon_encargos":[84,72],"deposito_comun":[84,60],"casa_guardia":[84,36],"sendero_produccion":[108,72],"camino_valle":[72,84],"patio_campana":[60,24],"patio_marcial":[72,24],"sala_formas":[96,24],"patio_respiracion":[96,12],"pabellon_disciplina":[72,12],"corredor_norte":[60,12],"escalinata_interior":[60,0],"plazoleta_occidental":[36,24],"sendero_medicina":[12,24],"sendero_jardines":[36,48],"interior_umbral_sur":[24,84],"interior_patio_blanco":[24,72],"interior_corredor_huespedes":[12,72],"interior_cuartos_huespedes":[0,72],"interior_sala_visitas":[36,72],"interior_balcon_sur":[60,72],"interior_galeria_oeste":[12,60],"interior_patio_estelas":[12,48],"interior_escalinata_archivos":[0,60],"interior_galeria_este":[36,60],"interior_jardin_piedra":[36,48],"interior_escalinata_formaciones":[48,60],"interior_patio_internos":[24,60],"interior_sala_estudio":[24,36],"interior_sala_te":[12,36],"interior_pabellon_instructores":[36,36],"interior_corredor_consejo":[24,24],"interior_antesala_consejo":[24,12],"interior_sala_consejo":[24,0],"interior_portico_norte":[36,24],"interior_escalinata_alturas":[36,12],"interior_pasaje_servicio":[60,48],"valle_camino_alto":[36,12],"valle_explanada":[36,24],"puesto_valle":[24,24],"patio_puesto_valle":[24,48],"encrucijada_valle":[36,48],"mercado_valle":[48,48],"granero_valle":[48,36],"terrazas_norte":[48,24],"terrazas_sur":[12,0],"campo_poniente":[12,60],"campo_levante":[72,60],"canal_valle":[72,0],"puente_menor":[36,60],"camino_cantera_valle":[0,60],"camino_sauces_valle":[84,60],"valle_desvio_carretero":[60,48],"camino_regional":[36,72],"mojon_regional":[36,84]};
const MAPA_ETIQ = {"patio_raices":"01","descansillo":"02","mirador_niebla":"03","patio_practica":"04","sendero_pinos":"05","camino":"06","puerta":"07","registro":"08","aguas_senda_bosque":"01","aguas_cauce_alto":"02","aguas_paso_piedras":"03","aguas_poza_clara":"04","aguas_refugio_cauce":"05","aguas_terraza_humeda":"06","aguas_inicio_barranco":"07","aguas_garganta_norte":"08","aguas_pasarela_roca":"09","aguas_poza_profunda":"10","aguas_cascada_velada":"11","aguas_filtraciones_cantera":"12","aguas_paso_alto":"13","aguas_garganta_sur":"14","aguas_desvio_sauces":"15","aguas_manantial_entrada":"16","aguas_manantial_partido":"17","aguas_rama_clara":"18","aguas_rama_oscura":"19","aguas_cuenca_reunion":"20","aguas_camara_hidrica":"21","aguas_conducto_antiguo":"22","alturas_portico_sur":"01","alturas_escalinata_blanca":"02","alturas_terraza_baja":"03","alturas_caseta_guardacumbre":"04","alturas_sendero_pinos_altos":"05","alturas_balcon_poniente":"06","alturas_balcon_oriente":"07","alturas_paso_viento":"08","alturas_ladera_nubes":"09","alturas_aguja_piedra":"10","alturas_collado":"11","alturas_nido_halcones":"12","alturas_senda_mantis":"13","alturas_claro_nubes":"14","alturas_risco_norte":"15","alturas_escalinata_cumbre":"16","alturas_terraza_cielo":"17","alturas_pabellon_cumbre":"18","alturas_campana_celeste":"19","alturas_mirador_grulla":"20","archivos_portico":"01","archivos_sala_consulta":"02","archivos_escritorio_copistas":"03","archivos_catalogo":"04","archivos_deposito_comun":"05","archivos_galeria_registros":"06","archivos_sala_estelas":"07","archivos_control_restringido":"08","archivos_deposito_antiguo":"09","archivos_sala_indices":"10","archivos_camara_copias":"11","archivos_mesa_restauracion":"12","archivos_pasaje_inferior":"13","archivos_deposito_sellado":"14","archivos_muro_fundaciones":"15","archivos_conducto_antiguo":"16","bosque_linde_jardines":"01","bosque_sendero_bajo":"02","bosque_arroyo_bajo":"03","bosque_claro_raices":"04","bosque_puente_raices":"05","bosque_puesto_marcas":"06","bosque_ladera_baja":"07","bosque_senda_patrulla":"08","bosque_umbral_niebla":"09","bosque_senda_niebla":"10","bosque_refugio_patrulla":"11","bosque_claro_humedo":"12","bosque_pinos_torcidos":"13","bosque_quebrada_niebla":"14","bosque_cauce_oculto":"15","bosque_loma_niebla":"16","bosque_desvio_aguas":"17","bosque_umbral_alto":"18","bosque_ladera_alta":"19","bosque_pinar_alto":"20","bosque_rocas_blancas":"21","bosque_corredor_viento":"22","bosque_paso_hundido":"23","bosque_hondonada":"24","bosque_mirador_alto":"25","bosque_senda_cantera":"26","bosque_senda_aguas_alta":"27","bosque_collado_alto":"28","cantera_acceso_secta":"01","patio_canteros":"02","oficina_capataz":"03","barracon_canteros":"04","rampa_carga_cantera":"05","frente_abierto":"06","terraza_cantera":"07","cantera_camino_valle":"08","cantera_senda_bosque":"09","cruce_vetas":"10","desvio_termal":"18","camara_caldera":"19","paso_aguas_cantera":"20","pozo_extraccion":"11","galeria_veta_negra":"12","veta_negra":"13","camara_hierro":"14","nido_escarabajos":"15","sima_resonante":"16","galeria_murcielagos":"17","galeria_antigua_cantera":"21","conducto_antiguo_cantera":"22","formaciones_portico":"01","formaciones_patio_medicion":"02","formaciones_sala_control":"03","formaciones_taller_tecnico":"04","formaciones_galeria_norte":"05","formaciones_galeria_sur":"06","formaciones_nodo_oriental":"07","formaciones_nodo_occidental":"08","formaciones_camara_central":"09","formaciones_descenso_tecnico":"16","formaciones_sala_mapas":"10","formaciones_conducto_carga":"11","formaciones_nivel_servicio":"12","formaciones_estacion_baja":"13","formaciones_sala_regulacion":"14","formaciones_sello_antiguo":"15","formaciones_conducto_antiguo":"17","jardines_puerta_norte":"01","patio_jardineros":"02","caseta_jardineros":"03","almacen_jardines":"04","sala_clasificacion":"05","secadero_hierbas":"06","bancal_norte":"07","bancal_central":"08","bancal_sur":"09","invernadero_claro":"10","invernadero_humedo":"11","canal_principal":"12","estanque_riego":"13","sendero_herbolario":"14","conducto_antiguo_jardines":"15","mantenimiento_acceso":"01","mantenimiento_corredor_servicio":"02","mantenimiento_estacion_relevo":"03","mantenimiento_dormitorio_turnos":"04","mantenimiento_comedor":"05","mantenimiento_almacen":"06","mantenimiento_taller":"07","mantenimiento_registro_consumo":"08","mantenimiento_archivo_turnos":"09","mantenimiento_cisterna":"10","mantenimiento_galeria_conductos":"11","mantenimiento_camara_presion":"12","mantenimiento_puesto_inspeccion":"13","mantenimiento_pasarela_nucleo":"14","mantenimiento_compuerta_nucleo":"15","medicina_portico_este":"01","patio_medicina":"02","recepcion_medicina":"03","sala_recuperacion":"04","corredor_medicina":"05","sala_tratamientos":"06","consultorio_meridianos":"07","sala_anatomica":"08","archivo_clinico":"09","botica":"10","laboratorio_alquimia":"11","deposito_reactivos":"12","sala_purificacion":"13","sotano_conductos_medicina":"14","nucleo_pozo_voto":"01","nucleo_camara_voto":"02","nucleo_galeria_primer_pacto":"03","nucleo_primer_pacto":"04","nucleo_archivo_promesa":"05","nucleo_descenso_pulso":"06","nucleo_galeria_pulso":"07","nucleo_camara_regulacion":"08","nucleo_sala_relevo":"09","nucleo_exterior_ancla":"10","nucleo_camara_memoria":"11","nucleo_umbral_santuario":"12","nucleo_santuario_vinculo":"13","ala_vestibulo":"01","ala_nudo_seis_corrientes":"02","ala_camara_dos_alas":"03","ala_galeria_distribucion":"04","ala_umbral_mantenimiento":"05","ala_med_01":"06","ala_med_02":"07","ala_med_03":"08","ala_med_04":"09","ala_med_05":"10","ala_med_06":"11","ala_jardines_01":"12","ala_jardines_02":"13","ala_jardines_03":"14","ala_jardines_04":"15","ala_jardines_05":"16","ala_jardines_06":"17","ala_cantera_01":"18","ala_cantera_02":"19","ala_cantera_03":"20","ala_cantera_04":"21","ala_cantera_05":"22","ala_cantera_06":"23","ala_aguas_01":"24","ala_aguas_02":"25","ala_aguas_03":"26","ala_aguas_04":"27","ala_aguas_05":"28","ala_aguas_06":"29","ala_archivos_01":"30","ala_archivos_02":"31","ala_archivos_03":"32","ala_archivos_04":"33","ala_archivos_05":"34","ala_archivos_06":"35","ala_formaciones_01":"36","ala_formaciones_02":"37","ala_formaciones_03":"38","ala_formaciones_04":"39","ala_formaciones_05":"40","ala_formaciones_06":"41","produccion_portico_oeste":"01","patio_produccion":"02","oficina_logistica":"03","barracon_trabajadores":"04","patio_carga":"05","cochera_carros":"06","patio_talleres":"07","taller_lu_cheng":"08","deposito_metales":"09","taller_ning_cai":"10","secadero_cueros":"11","almacen_materiales":"12","almacen_herramientas":"13","area_embalaje":"14","camino_cantera":"15","camino_valle_carga":"16","sauces_camino_valle":"01","sauces_plaza":"02","sauces_casa_huespedes":"03","sauces_pozo":"04","sauces_casa_comunal":"05","sauces_calle_oeste":"06","sauces_calle_este":"07","sauces_herbolaria":"08","sauces_huertos":"09","sauces_saucedal":"10","sauces_canal_bajo":"11","sauces_puente_canal":"12","sauces_taller_comunal":"13","sauces_granero":"14","sauces_campos":"15","sauces_senda_barranco":"16","patio":"01","sala_jade":"02","patio_cabanas":"03","corredor_cabanas":"04","dormitorio_externos":"05","sala_comun_externos":"06","lavadero_externos":"07","comedor_externos":"08","cocina_comunal":"09","patio_servicios":"10","oficina_servicios":"11","tablon_encargos":"12","deposito_comun":"13","casa_guardia":"14","sendero_produccion":"15","camino_valle":"16","patio_campana":"17","patio_marcial":"18","sala_formas":"19","patio_respiracion":"20","pabellon_disciplina":"21","corredor_norte":"22","escalinata_interior":"23","plazoleta_occidental":"24","sendero_medicina":"25","sendero_jardines":"26","interior_umbral_sur":"01","interior_patio_blanco":"02","interior_corredor_huespedes":"03","interior_cuartos_huespedes":"04","interior_sala_visitas":"05","interior_balcon_sur":"06","interior_galeria_oeste":"07","interior_patio_estelas":"08","interior_escalinata_archivos":"09","interior_galeria_este":"10","interior_jardin_piedra":"11","interior_escalinata_formaciones":"12","interior_patio_internos":"13","interior_sala_estudio":"14","interior_sala_te":"15","interior_pabellon_instructores":"16","interior_corredor_consejo":"17","interior_antesala_consejo":"18","interior_sala_consejo":"19","interior_portico_norte":"20","interior_escalinata_alturas":"21","interior_pasaje_servicio":"22","valle_camino_alto":"01","valle_explanada":"02","puesto_valle":"03","patio_puesto_valle":"04","encrucijada_valle":"05","mercado_valle":"06","granero_valle":"07","terrazas_norte":"08","terrazas_sur":"09","campo_poniente":"10","campo_levante":"11","canal_valle":"12","puente_menor":"13","camino_cantera_valle":"14","camino_sauces_valle":"15","valle_desvio_carretero":"16","camino_regional":"17","mojon_regional":"18"};
// El Atlas dibuja una sola sección vertical a la vez. Las coordenadas siguen
// siendo locales al dibujo; MAPA_CAPA_SALA decide qué salas comparten página.
// Las salas no declaradas explícitamente pertenecen al nivel principal.
const MAPA_CAPAS = {
  profundo:   { orden: -2, nombre: "Nivel profundo", detalle: "Profundidad II" },
  sumergido:  { orden: -1, nombre: "Nivel inferior", detalle: "Profundidad I" },
  principal:  { orden:  0, nombre: "Superficie", detalle: "Nivel principal" },
  superior:   { orden:  1, nombre: "Nivel superior", detalle: "Altura I" },
  cumbre:     { orden:  2, nombre: "Cumbre", detalle: "Altura II" },
};
const MAPA_CAPA_SALA = {"patio_raices":"principal","descansillo":"principal","mirador_niebla":"principal","patio_practica":"principal","sendero_pinos":"principal","camino":"principal","puerta":"principal","registro":"principal","aguas_senda_bosque":"principal","aguas_cauce_alto":"principal","aguas_paso_piedras":"principal","aguas_poza_clara":"principal","aguas_refugio_cauce":"principal","aguas_terraza_humeda":"principal","aguas_inicio_barranco":"principal","aguas_garganta_norte":"principal","aguas_pasarela_roca":"principal","aguas_poza_profunda":"principal","aguas_cascada_velada":"principal","aguas_filtraciones_cantera":"principal","aguas_paso_alto":"principal","aguas_garganta_sur":"principal","aguas_desvio_sauces":"principal","aguas_manantial_entrada":"principal","aguas_manantial_partido":"principal","aguas_rama_clara":"principal","aguas_rama_oscura":"principal","aguas_cuenca_reunion":"principal","aguas_camara_hidrica":"principal","aguas_conducto_antiguo":"principal","alturas_portico_sur":"cumbre","alturas_escalinata_blanca":"cumbre","alturas_terraza_baja":"cumbre","alturas_caseta_guardacumbre":"cumbre","alturas_sendero_pinos_altos":"cumbre","alturas_balcon_poniente":"cumbre","alturas_balcon_oriente":"cumbre","alturas_paso_viento":"cumbre","alturas_ladera_nubes":"cumbre","alturas_aguja_piedra":"cumbre","alturas_collado":"cumbre","alturas_nido_halcones":"cumbre","alturas_senda_mantis":"cumbre","alturas_claro_nubes":"cumbre","alturas_risco_norte":"cumbre","alturas_escalinata_cumbre":"cumbre","alturas_terraza_cielo":"cumbre","alturas_pabellon_cumbre":"cumbre","alturas_campana_celeste":"cumbre","alturas_mirador_grulla":"cumbre","archivos_portico":"principal","archivos_sala_consulta":"principal","archivos_escritorio_copistas":"principal","archivos_catalogo":"principal","archivos_deposito_comun":"principal","archivos_galeria_registros":"principal","archivos_sala_estelas":"principal","archivos_control_restringido":"principal","archivos_deposito_antiguo":"principal","archivos_sala_indices":"principal","archivos_camara_copias":"principal","archivos_mesa_restauracion":"principal","archivos_pasaje_inferior":"principal","archivos_deposito_sellado":"sumergido","archivos_muro_fundaciones":"sumergido","archivos_conducto_antiguo":"sumergido","bosque_linde_jardines":"principal","bosque_sendero_bajo":"principal","bosque_arroyo_bajo":"principal","bosque_claro_raices":"principal","bosque_puente_raices":"principal","bosque_puesto_marcas":"principal","bosque_ladera_baja":"principal","bosque_senda_patrulla":"principal","bosque_umbral_niebla":"principal","bosque_senda_niebla":"principal","bosque_refugio_patrulla":"principal","bosque_claro_humedo":"principal","bosque_pinos_torcidos":"principal","bosque_quebrada_niebla":"principal","bosque_cauce_oculto":"principal","bosque_loma_niebla":"principal","bosque_desvio_aguas":"principal","bosque_umbral_alto":"principal","bosque_ladera_alta":"principal","bosque_pinar_alto":"principal","bosque_rocas_blancas":"principal","bosque_corredor_viento":"principal","bosque_paso_hundido":"principal","bosque_hondonada":"principal","bosque_mirador_alto":"principal","bosque_senda_cantera":"principal","bosque_senda_aguas_alta":"principal","bosque_collado_alto":"principal","cantera_acceso_secta":"principal","patio_canteros":"principal","oficina_capataz":"principal","barracon_canteros":"principal","rampa_carga_cantera":"principal","frente_abierto":"principal","terraza_cantera":"principal","cantera_camino_valle":"principal","cantera_senda_bosque":"principal","cruce_vetas":"principal","desvio_termal":"profundo","camara_caldera":"profundo","paso_aguas_cantera":"profundo","pozo_extraccion":"sumergido","galeria_veta_negra":"sumergido","veta_negra":"sumergido","camara_hierro":"sumergido","nido_escarabajos":"sumergido","sima_resonante":"sumergido","galeria_murcielagos":"sumergido","galeria_antigua_cantera":"sumergido","conducto_antiguo_cantera":"sumergido","formaciones_portico":"principal","formaciones_patio_medicion":"principal","formaciones_sala_control":"principal","formaciones_taller_tecnico":"principal","formaciones_galeria_norte":"principal","formaciones_galeria_sur":"principal","formaciones_nodo_oriental":"principal","formaciones_nodo_occidental":"principal","formaciones_camara_central":"principal","formaciones_descenso_tecnico":"profundo","formaciones_sala_mapas":"sumergido","formaciones_conducto_carga":"sumergido","formaciones_nivel_servicio":"sumergido","formaciones_estacion_baja":"sumergido","formaciones_sala_regulacion":"sumergido","formaciones_sello_antiguo":"sumergido","formaciones_conducto_antiguo":"sumergido","jardines_puerta_norte":"principal","patio_jardineros":"principal","caseta_jardineros":"principal","almacen_jardines":"principal","sala_clasificacion":"principal","secadero_hierbas":"principal","bancal_norte":"principal","bancal_central":"principal","bancal_sur":"principal","invernadero_claro":"principal","invernadero_humedo":"principal","canal_principal":"principal","estanque_riego":"principal","sendero_herbolario":"principal","conducto_antiguo_jardines":"principal","mantenimiento_acceso":"profundo","mantenimiento_corredor_servicio":"profundo","mantenimiento_estacion_relevo":"profundo","mantenimiento_dormitorio_turnos":"profundo","mantenimiento_comedor":"profundo","mantenimiento_almacen":"profundo","mantenimiento_taller":"profundo","mantenimiento_registro_consumo":"profundo","mantenimiento_archivo_turnos":"profundo","mantenimiento_cisterna":"profundo","mantenimiento_galeria_conductos":"profundo","mantenimiento_camara_presion":"profundo","mantenimiento_puesto_inspeccion":"profundo","mantenimiento_pasarela_nucleo":"profundo","mantenimiento_compuerta_nucleo":"profundo","medicina_portico_este":"principal","patio_medicina":"principal","recepcion_medicina":"principal","sala_recuperacion":"principal","corredor_medicina":"principal","sala_tratamientos":"principal","consultorio_meridianos":"principal","sala_anatomica":"principal","archivo_clinico":"principal","botica":"principal","laboratorio_alquimia":"principal","deposito_reactivos":"principal","sala_purificacion":"principal","sotano_conductos_medicina":"principal","nucleo_pozo_voto":"profundo","nucleo_camara_voto":"profundo","nucleo_galeria_primer_pacto":"profundo","nucleo_primer_pacto":"profundo","nucleo_archivo_promesa":"profundo","nucleo_descenso_pulso":"profundo","nucleo_galeria_pulso":"profundo","nucleo_camara_regulacion":"profundo","nucleo_sala_relevo":"profundo","nucleo_exterior_ancla":"profundo","nucleo_camara_memoria":"profundo","nucleo_umbral_santuario":"profundo","nucleo_santuario_vinculo":"profundo","ala_vestibulo":"profundo","ala_nudo_seis_corrientes":"profundo","ala_camara_dos_alas":"profundo","ala_galeria_distribucion":"profundo","ala_umbral_mantenimiento":"profundo","ala_med_01":"profundo","ala_med_02":"profundo","ala_med_03":"profundo","ala_med_04":"profundo","ala_med_05":"profundo","ala_med_06":"profundo","ala_jardines_01":"profundo","ala_jardines_02":"profundo","ala_jardines_03":"profundo","ala_jardines_04":"profundo","ala_jardines_05":"profundo","ala_jardines_06":"profundo","ala_cantera_01":"profundo","ala_cantera_02":"profundo","ala_cantera_03":"profundo","ala_cantera_04":"profundo","ala_cantera_05":"profundo","ala_cantera_06":"profundo","ala_aguas_01":"profundo","ala_aguas_02":"profundo","ala_aguas_03":"profundo","ala_aguas_04":"profundo","ala_aguas_05":"profundo","ala_aguas_06":"profundo","ala_archivos_01":"profundo","ala_archivos_02":"profundo","ala_archivos_03":"profundo","ala_archivos_04":"profundo","ala_archivos_05":"profundo","ala_archivos_06":"profundo","ala_formaciones_01":"profundo","ala_formaciones_02":"profundo","ala_formaciones_03":"profundo","ala_formaciones_04":"profundo","ala_formaciones_05":"profundo","ala_formaciones_06":"profundo","produccion_portico_oeste":"principal","patio_produccion":"principal","oficina_logistica":"principal","barracon_trabajadores":"principal","patio_carga":"principal","cochera_carros":"principal","patio_talleres":"principal","taller_lu_cheng":"principal","deposito_metales":"principal","taller_ning_cai":"principal","secadero_cueros":"principal","almacen_materiales":"principal","almacen_herramientas":"principal","area_embalaje":"principal","camino_cantera":"principal","camino_valle_carga":"principal","sauces_camino_valle":"principal","sauces_plaza":"principal","sauces_casa_huespedes":"principal","sauces_pozo":"principal","sauces_casa_comunal":"principal","sauces_calle_oeste":"principal","sauces_calle_este":"principal","sauces_herbolaria":"principal","sauces_huertos":"principal","sauces_saucedal":"principal","sauces_canal_bajo":"principal","sauces_puente_canal":"principal","sauces_taller_comunal":"principal","sauces_granero":"principal","sauces_campos":"principal","sauces_senda_barranco":"principal","patio":"principal","sala_jade":"principal","patio_cabanas":"principal","corredor_cabanas":"principal","dormitorio_externos":"principal","sala_comun_externos":"principal","lavadero_externos":"principal","comedor_externos":"principal","cocina_comunal":"principal","patio_servicios":"principal","oficina_servicios":"principal","tablon_encargos":"principal","deposito_comun":"principal","casa_guardia":"principal","sendero_produccion":"principal","camino_valle":"principal","patio_campana":"principal","patio_marcial":"principal","sala_formas":"principal","patio_respiracion":"principal","pabellon_disciplina":"principal","corredor_norte":"principal","escalinata_interior":"principal","plazoleta_occidental":"principal","sendero_medicina":"principal","sendero_jardines":"principal","interior_umbral_sur":"principal","interior_patio_blanco":"principal","interior_corredor_huespedes":"principal","interior_cuartos_huespedes":"principal","interior_sala_visitas":"principal","interior_balcon_sur":"principal","interior_galeria_oeste":"principal","interior_patio_estelas":"principal","interior_escalinata_archivos":"principal","interior_galeria_este":"principal","interior_jardin_piedra":"principal","interior_escalinata_formaciones":"principal","interior_patio_internos":"principal","interior_sala_estudio":"principal","interior_sala_te":"principal","interior_pabellon_instructores":"principal","interior_corredor_consejo":"principal","interior_antesala_consejo":"principal","interior_sala_consejo":"principal","interior_portico_norte":"principal","interior_escalinata_alturas":"principal","interior_pasaje_servicio":"principal","valle_camino_alto":"principal","valle_explanada":"principal","puesto_valle":"principal","patio_puesto_valle":"principal","encrucijada_valle":"principal","mercado_valle":"principal","granero_valle":"principal","terrazas_norte":"principal","terrazas_sur":"principal","campo_poniente":"principal","campo_levante":"principal","canal_valle":"principal","puente_menor":"principal","camino_cantera_valle":"principal","camino_sauces_valle":"principal","valle_desvio_carretero":"principal","camino_regional":"principal","mojon_regional":"principal"};
const MAPA_RUTAS = {"corredor_medicina|sala_tratamientos":{"from":"corredor_medicina","to":"sala_tratamientos","dir":"norte","waypoints":[[36,24],[0,24],[0,60],[24,60]]},"aguas_manantial_partido|aguas_rama_oscura":{"from":"aguas_manantial_partido","to":"aguas_rama_oscura","dir":"este","waypoints":[[72,108],[72,156],[24,156],[24,120]]},"ala_aguas_04|ala_aguas_05":{"from":"ala_aguas_04","to":"ala_aguas_05","dir":"este","waypoints":[[108,72],[108,120],[12,120],[12,84]]},"mantenimiento_registro_consumo|mantenimiento_taller":{"from":"mantenimiento_registro_consumo","to":"mantenimiento_taller","dir":"este","waypoints":[[60,48],[60,84],[36,84],[36,72]]},"aguas_cauce_alto|aguas_paso_piedras":{"from":"aguas_cauce_alto","to":"aguas_paso_piedras","dir":"este","waypoints":[[24,24],[24,-12],[-12,-12],[-12,0]]},"granero_valle|terrazas_sur":{"from":"granero_valle","to":"terrazas_sur","dir":"sur","waypoints":[[48,42],[84,42],[84,-12],[12,-12]]}};
const MAPA_CROSSOVERS = [{"id":"CO_AGUAS_01","tipo":"CRUCE_CARTOGRAFICO_NO_CONECTIVO","area":"aguas_barrancos","capa":"principal","coordenada":[24,0],"aristas":["aguas_cauce_alto|aguas_paso_piedras","aguas_paso_piedras|aguas_poza_clara"],"arista_superior":"aguas_cauce_alto|aguas_paso_piedras","arista_inferior":"aguas_paso_piedras|aguas_poza_clara","segmentos":{"aguas_cauce_alto|aguas_paso_piedras":1,"aguas_paso_piedras|aguas_poza_clara":0},"indice_segmento_base":0,"obstruccion_referencia":{"campo":"obstrucciones_rotacion_cardinal","area":"aguas_barrancos","capa":"principal"},"crea_conectividad":false,"es_room":false,"room_id":null,"es_estructura_diegetica":false,"renderer":{"convencion":"INTERRUPCION_LINEA_INFERIOR","geometria_logica_ininterrumpida":true,"dibujar_arista_superior_continua":true,"semilongitud_interrupcion":2,"extremos_interrupcion":[[22,0],[26,0]],"dibujar_marcador_junction":false,"interaccion":"ARISTAS_SEPARADAS_SIN_TRANSFERENCIA","unidad":"unidad_cartografica_local","nota":"El hueco afecta sólo al trazo visible de la arista inferior. No altera exits, recorridos, gates ni datos de conectividad; no dibujar un nodo en el cruce."}},{"id":"CO_VALLE_01","tipo":"CRUCE_CARTOGRAFICO_NO_CONECTIVO","area":"valle","capa":"principal","coordenada":[72,42],"aristas":["granero_valle|terrazas_sur","campo_levante|canal_valle"],"arista_superior":"granero_valle|terrazas_sur","arista_inferior":"campo_levante|canal_valle","segmentos":{"granero_valle|terrazas_sur":1,"campo_levante|canal_valle":0},"indice_segmento_base":0,"obstruccion_referencia":{"campo":"obstrucciones_rotacion_cardinal","area":"valle","capa":"principal"},"crea_conectividad":false,"es_room":false,"room_id":null,"es_estructura_diegetica":false,"renderer":{"convencion":"INTERRUPCION_LINEA_INFERIOR","geometria_logica_ininterrumpida":true,"dibujar_arista_superior_continua":true,"semilongitud_interrupcion":2,"extremos_interrupcion":[[72,44],[72,40]],"dibujar_marcador_junction":false,"interaccion":"ARISTAS_SEPARADAS_SIN_TRANSFERENCIA","unidad":"unidad_cartografica_local","nota":"El hueco afecta sólo al trazo visible de la arista inferior. No altera exits, recorridos, gates ni datos de conectividad; no dibujar un nodo en el cruce."}}];
const MAPA_FIRMAS_REV3 = {"pos":"8a010167","etiquetas":"88e696f4","capas":"5da317ce","rutas":"4cab0c21","crossovers":"c8d303c1","gates":"4f13f54f"};
const claveAristaMapa = (a,b) => [a,b].sort().join("|");
const puntoMapa = (col,row) => [col/MAPA_PASO_CARTOGRAFICO*MAPA_CELDA,row/MAPA_PASO_CARTOGRAFICO*MAPA_CELDA];
const posicionDibujoMapa = id => MAPA_POS[id] ? puntoMapa(...MAPA_POS[id]) : null;
function polilineaMapa(a,b) {
  const r=MAPA_RUTAS[claveAristaMapa(a,b)];
  return r ? [MAPA_POS[r.from],...r.waypoints,MAPA_POS[r.to]].map(p=>puntoMapa(...p))
    : [posicionDibujoMapa(a),posicionDibujoMapa(b)];
}
// Corta únicamente el trazo visible inferior; nunca la topología ni la polilínea canónica.
function trazosAristaMapa(clave,puntos,visibles,area,capa) {
  const cortes=MAPA_CROSSOVERS.filter(c=>c.area===area&&c.capa===capa&&c.arista_inferior===clave
    &&visibles.has(c.arista_superior)&&visibles.has(c.arista_inferior));
  let d=`M ${puntos[0].join(" ")}`;
  for(let i=0;i<puntos.length-1;i++){
    const a=puntos[i],b=puntos[i+1],corte=cortes.find(c=>c.segmentos[clave]===i);
    if(corte){
      const extremos=corte.renderer.extremos_interrupcion.map(p=>puntoMapa(...p));
      extremos.sort((p,q)=>Math.hypot(p[0]-a[0],p[1]-a[1])-Math.hypot(q[0]-a[0],q[1]-a[1]));
      d+=` L ${extremos[0].join(" ")} M ${extremos[1].join(" ")}`;
    }
    d+=` L ${b.join(" ")}`;
  }
  return {d,cortes:cortes.map(c=>c.id)};
}

const capaMapaDeSala = rid => MAPA_CAPA_SALA[rid] || "principal";

// ============================================================================
//  AREAS · eje geográfico principal del mundo (Auditoría 2 · Etapa 2A)
//  --------------------------------------------------------------------------
//  Son EXACTAMENTE 17 y el orden de las claves es el orden canónico (el que
//  usarán los acordeones del Atlas). Cada ROOM guarda sólo `area: "id"`; la
//  identidad de un área vive aquí y no se repite en las rooms.
//
//  Área y sección vertical (MAPA_CAPAS / MAPA_CAPA_SALA) son dos dimensiones
//  INDEPENDIENTES: un área puede extenderse por varias secciones y una sección
//  puede contener varias áreas. Por eso las rooms no llevan un campo `nivel`.
//
//  `color` es PROVISIONAL. Desde ver68 (Etapa 2B) la interfaz lo usa sólo como
//  IDENTIDAD TERRITORIAL: marco del título de la sala, minimapa, barra y nodos del
//  Atlas y cabeceras de acordeón. Nunca sustituye colores semánticos (combate,
//  plantas, agua, objetos, oro, estados). Debe ser #rrggbb, único por área.
//  ver68 sólo aclaró `formaciones` (#8675c7 → #8979c8) para alcanzar 3:1 contra el disco de un nodo.
// ============================================================================
const AREAS = {
  acceso:          { nombre: "Acceso", color: "#c77575" },
  secta_exterior:  { nombre: "Secta Exterior", color: "#c79275" },
  medicina:        { nombre: "Medicina", color: "#c7ae75" },
  jardines:        { nombre: "Jardines", color: "#c3c775" },
  produccion:      { nombre: "Producción", color: "#a6c775" },
  bosques:         { nombre: "Bosques", color: "#8ac775" },
  cantera_vetas:   { nombre: "Cantera y Vetas", color: "#75c77e" },
  aguas_barrancos: { nombre: "Aguas y Barrancos", color: "#75c79a" },
  valle:           { nombre: "Valle", color: "#75c7b7" },
  sauces:          { nombre: "Sauces Bajos", color: "#75bbc7" },
  secta_interior:  { nombre: "Secta Interior", color: "#759ec7" },
  archivos:        { nombre: "Archivos", color: "#7582c7" },
  formaciones:     { nombre: "Formaciones", color: "#8979c8" },
  alturas:         { nombre: "Alturas", color: "#a275c7" },
  primera_ala:     { nombre: "Primera Ala", color: "#bf75c7" },
  mantenimiento:   { nombre: "Mantenimiento Antiguo", color: "#c775b2" },
  nucleo:          { nombre: "Núcleo", color: "#c77596" },
};
const areaDeSala = rid => ROOMS?.[rid]?.area || null;

// Estampa la identidad de un área en un elemento del DOM/SVG: data-area (semántico,
// consultable) y la variable CSS --area (color). Con un área inexistente los quita, de
// modo que el elemento recupera su aspecto de siempre. Devuelve el mismo elemento.
function aplicarAreaUI(el, areaId) {
  if (!el) return el;
  const area = AREAS[areaId];
  if (area) { el.dataset.area = areaId; el.style.setProperty("--area", area.color); }
  else { delete el.dataset.area; el.style.removeProperty("--area"); }
  return el;
}

// Salas donde el Atlas muestra el resumen de cada encargo (ids de ROOMS, no de
// áreas ni de subzonas). Clave = id de QUESTS. auditarReferenciasMundo() lo valida.
const SALAS_MISIONES_ATLAS = {};

// Salas ocultas cuya salida el SENTIDO DIVINO ya percibe sin haberlas visitado (rutas
// verticales y galerías). Antes era un literal duplicado en salidasAtlas() y en
// actualizarPanel(); ver68 lo comparte sin cambiar el comportamiento.
const SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO = [
  "aguas_inicio_barranco",
  "alturas_nido_halcones",
  "alturas_pabellon_cumbre",
  "aguas_manantial_partido",
  "aguas_rama_oscura",
  "alturas_ladera_nubes",
  "alturas_senda_mantis"
];

// ============================================================================
//  CONTRATO DE TOPOLOGÍA · ROOMS + ATLAS
//  --------------------------------------------------------------------------
//  Cardinales internas: geometría ortogonal por hoja; las seis routes respetan puertos.
//  Verticales: transición local o entre hojas; cardinales entre áreas pueden cambiar capa.
//  Cruces: sólo en room común real o crossover no conectivo declarado de REV3.
const DIRECCIONES_HORIZONTALES = ["norte", "sur", "este", "oeste"];
const DIRECCIONES_VERTICALES = ["arriba", "abajo"];
const DIRECCION_OPUESTA = {
  norte: "sur", sur: "norte", este: "oeste", oeste: "este",
  arriba: "abajo", abajo: "arriba",
};

function salidaTopologicaValida(origen, dir, destino) {
  if (!ROOMS?.[origen] || !ROOMS?.[destino] || !DIRECCION_OPUESTA[dir]) return false;
  const vuelta = ROOMS[destino].exits?.[DIRECCION_OPUESTA[dir]];
  if (vuelta !== origen) return false;
  return ROOMS[origen].exits?.[dir] === destino;
}

// Clasifica una salida física sin tocar ROOMS.exits. Devuelve null si la salida no
// cumple el contrato topológico (inexistente, sin retorno, capa incoherente).
//   interna        N/S/E/O dentro de la misma área      → arista dibujada
//   area           N/S/E/O hacia otra área              → transición entre áreas
//   vertical       ARRIBA/ABAJO dentro de la misma área → transición de sección
//   vertical_area  ARRIBA/ABAJO hacia otra área         → transición de sección y de área
function clasificarSalidaAtlas(origen, dir, destino) {
  if (!salidaTopologicaValida(origen, dir, destino)) return null;
  const cambiaArea = areaDeSala(origen) !== areaDeSala(destino);
  if (DIRECCIONES_VERTICALES.includes(dir)) return cambiaArea ? "vertical_area" : "vertical";
  return cambiaArea ? "area" : "interna";
}

// 3C.3B: auditor geométrico independiente del renderer; acepta copias para pruebas negativas.
function firmaCanonicaMapa(valor) {
  const ordenar = v => Array.isArray(v) ? v.map(ordenar) : v && typeof v === "object"
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, ordenar(v[k])])) : v;
  const texto = JSON.stringify(ordenar(valor)); let hash = 2166136261;
  for (let i=0;i<texto.length;i++) hash = Math.imul(hash ^ texto.charCodeAt(i),16777619) >>> 0;
  return hash.toString(16).padStart(8,"0");
}
function auditarTopologiaMapa({ rooms = ROOMS, capas = MAPA_CAPA_SALA } = {}) {
  const fallos=[];
  for (const [id,r] of Object.entries(rooms)) {
    if (!MAPA_CAPAS[capas[id]]) fallos.push(`${id}: capa inexistente`);
    for (const [dir,to] of Object.entries(r.exits||{})) {
      if (!DIRECCION_OPUESTA[dir]) { fallos.push(`${id}: dirección inválida ${dir}`); continue; }
      if (esSalidaRegional(id,dir,to)) continue;
      if (!rooms[to]) { fallos.push(`${id}: destino inexistente ${to}`); continue; }
      if (rooms[to].exits?.[DIRECCION_OPUESTA[dir]]!==id) fallos.push(`${id}: falta retorno desde ${to}`);
      if (DIRECCIONES_HORIZONTALES.includes(dir) && r.area===rooms[to].area && capas[id]!==capas[to]) fallos.push(`${id}: cardinal intra-área cambia capa`);
    }
  }
  // La geometría por hoja, incluidos codos y crossovers, corresponde a auditarCartografia329().
  return fallos;
}
function auditarCartografia329({ rooms=ROOMS, pos=MAPA_POS, etiquetas=MAPA_ETIQ, capas=MAPA_CAPA_SALA,
  rutas=MAPA_RUTAS, crossovers=MAPA_CROSSOVERS, gates=GATES_329, catalogo=MAPA_CAPAS }={}) {
  const fallos=[], fallo=(tipo,dato="")=>fallos.push(`${tipo}: ${dato}`), ids=Object.keys(rooms);
  const hoja=id=>`${rooms[id]?.area}|${capas[id]}`, igual=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const punto=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
  const signo=(a,b)=>[Math.sign(b[0]-a[0]),Math.sign(b[1]-a[1])];
  const vec={norte:[0,-1],sur:[0,1],este:[1,0],oeste:[-1,0]};
  const inter=(a,b,c,d)=>{
    const x=Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0])),y=Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]));
    const X=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0])),Y=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]));
    return x>X||y>Y ? null : [[x,y],[X,Y]];
  };
  const interior=(p,a,b)=>a[0]===b[0]&&p[0]===a[0]&&p[1]>Math.min(a[1],b[1])&&p[1]<Math.max(a[1],b[1])
    ||a[1]===b[1]&&p[1]===a[1]&&p[0]>Math.min(a[0],b[0])&&p[0]<Math.max(a[0],b[0]);
  const distancia=(a,b,p)=>Math.hypot(Math.max(0,Math.min(a[0],b[0])-p[0],p[0]-Math.max(a[0],b[0])),Math.max(0,Math.min(a[1],b[1])-p[1],p[1]-Math.max(a[1],b[1])));
  const conteos={rooms:ids.length,areas:new Set(ids.map(id=>rooms[id].area)).size,labels:Object.keys(etiquetas).length,
    hojas:new Set(ids.map(hoja)).size,capas:{principal:0,sumergido:0,profundo:0,superior:0,cumbre:0},exits:0,internos:0,externos:0,
    cardinalesIntraHoja:0,cardinalesEntreHojas:0,verticales:0,entreAreas:0,cardinalesCambianCapa:0,rectas:0,routes:0,representadas:0,pendientes:0,crossovers:crossovers.length,cruces:0,atajos:gates.filter(g=>g.id?.startsWith("ATAJO_ALA_")).length};
  for(const [nombre,tabla] of Object.entries({pos,etiquetas,capas})) if(!igual(Object.keys(tabla).sort(),ids.slice().sort()))fallo("Cobertura/huérfanos "+nombre);
  if(!igual(Object.keys(catalogo).sort(),["principal","sumergido","profundo","superior","cumbre"].sort()))fallo("Catálogo capas");
  const ubicaciones=new Set(),labels=new Set();
  for(const id of ids){
    if(!punto(pos[id])||!pos[id].every(Number.isInteger))fallo("Coordenada inválida",id);
    const p=hoja(id)+":"+pos[id];if(ubicaciones.has(p))fallo("Coordenada duplicada",id);ubicaciones.add(p);
    const l=rooms[id].area+":"+etiquetas[id];if(labels.has(l)||typeof etiquetas[id]!=="string")fallo("Label inválido/duplicado",id);labels.add(l);
    if(!(capas[id] in conteos.capas))fallo("Capa inválida",id);else conteos.capas[capas[id]]++;
  }
  for(const [tabla,valor] of Object.entries({pos,etiquetas,capas,rutas,crossovers,gates}))
    if(firmaCanonicaMapa(valor)!==MAPA_FIRMAS_REV3[tabla])fallo("Datos congelados alterados",tabla);
  fallos.push(...auditarTopologiaMapa({rooms,capas}));
  const aristas=new Map(),fisicas=new Set(),externas=[];
  for(const [id,r] of Object.entries(rooms))for(const [dir,to]of Object.entries(r.exits||{})){
    conteos.exits++;
    if(!rooms[to]){conteos.externos++;externas.push([id,dir,to]);if(!esSalidaRegional(id,dir,to))fallo("Salida externa falsa",id);continue;}
    conteos.internos++;const k=claveAristaMapa(id,to);if(fisicas.has(k))continue;fisicas.add(k);
    if(r.area!==rooms[to].area)conteos.entreAreas++;
    if(DIRECCIONES_VERTICALES.includes(dir)){conteos.verticales++;continue;}
    if(!vec[dir])continue;
    if(capas[id]!==capas[to])conteos.cardinalesCambianCapa++;
    if(hoja(id)!==hoja(to)){conteos.cardinalesEntreHojas++;continue;}
    conteos.cardinalesIntraHoja++;
    let from=id,dest=to,direccion=dir,ps;
    const route=rutas[k];
    if(route){
      conteos.routes++;from=route.from;dest=route.to;direccion=route.dir;
      if(claveAristaMapa(from,dest)!==k||rooms[from]?.exits?.[direccion]!==dest||rooms[dest]?.exits?.[DIRECCION_OPUESTA[direccion]]!==from||!Array.isArray(route.waypoints)){
        fallo("Route falsa",k);continue;
      }
      ps=[pos[from],...route.waypoints,pos[dest]];
    }else{conteos.rectas++;ps=[pos[id],pos[to]];}
    if(ps.some(p=>!punto(p))){fallo("Waypoint inválido",k);continue;}
    const segs=ps.slice(1).map((b,i)=>[ps[i],b]);let valida=true;
    for(const [a,b]of segs){if(igual(a,b)){fallo("Segmento nulo",k);valida=false;}if(a[0]!==b[0]&&a[1]!==b[1]){fallo("Diagonal",k);valida=false;}}
    if(!igual(signo(ps[0],ps[1]),vec[direccion]))fallo("Dirección inicial",k);
    if(!igual(signo(ps.at(-2),ps.at(-1)),vec[direccion]))fallo("Entrada final",k);
    if(!valida)continue;
    aristas.set(k,{from,dest,ps,segs,hoja:hoja(id)});conteos.representadas++;
    for(const [a,b]of segs)for(const n of ids){
      if(n===from||n===dest||hoja(n)!==hoja(id)||!punto(pos[n]))continue;
      if(distancia(a,b,pos[n])<=2.5)fallo("Segmento encima/tocando room ajena",`${k}: ${n}`);
    }
    for(let i=0;i<segs.length;i++)for(let j=i+1;j<segs.length;j++){
      const hit=inter(...segs[i],...segs[j]);if(hit&&!(j===i+1&&igual(hit,[segs[i][1],segs[i][1]])))fallo("Autointersección",k);
    }
  }
  for(const k of Object.keys(rutas))if(!aristas.has(k))fallo("Route huérfana/inválida",k);
  const validos=new Map(),vistosC=new Set(),porHoja=new Map();
  for(const c of crossovers){
    const ks=c.aristas||[],p=c.coordenada,s=`${c.area}|${c.capa}`,errores=[];
    if(vistosC.has(c.id))errores.push("duplicado");vistosC.add(c.id);porHoja.set(s,(porHoja.get(s)||0)+1);
    if(!["CO_AGUAS_01","CO_VALLE_01"].includes(c.id)||c.tipo!=="CRUCE_CARTOGRAFICO_NO_CONECTIVO"||c.crea_conectividad!==false||c.es_room!==false||c.es_estructura_diegetica!==false||c.room_id!==null)errores.push("junction/tipo");
    if(!punto(p)||ks.length!==2||new Set(ks).size!==2||ks.some(k=>!aristas.has(k)))errores.push("aristas/punto");
    if(!errores.length){
      const segs=ks.map(k=>aristas.get(k).segs[c.segmentos?.[k]]);
      if(ks.some(k=>aristas.get(k).hoja!==s)||segs.some(seg=>!seg||!interior(p,...seg)))errores.push("hoja/interior/endpoint");
      else{
        const [[a,b],[d,e]]=segs;
        if(!((a[0]===b[0]&&d[1]===e[1])||(a[1]===b[1]&&d[0]===e[0]))||!igual(inter(a,b,d,e),[p,p]))errores.push("perpendicular");
        const contactos=[];
        for(const [k,edge]of aristas)if(edge.hoja===s)edge.segs.forEach((seg,i)=>{if(inter(...seg,p,p))contactos.push([k,i]);});
        if(contactos.length!==2||contactos.some(([k,i])=>!ks.includes(k)||c.segmentos[k]!==i))errores.push("tercera línea/bifurcación");
        if(ids.some(id=>hoja(id)===s&&punto(pos[id])&&Math.hypot(p[0]-pos[id][0],p[1]-pos[id][1])<=4.5))errores.push("room");
        const renderer=c.renderer,under=c.arista_inferior,over=c.arista_superior;
        if(!ks.includes(under)||!ks.includes(over)||under===over)errores.push("prioridad");
        else{
          const [a,b]=segs[ks.indexOf(under)],[dx,dy]=signo(a,b),half=renderer?.semilongitud_interrupcion;
          const esperado=[[p[0]-dx*half,p[1]-dy*half],[p[0]+dx*half,p[1]+dy*half]];
          if(renderer?.convencion!=="INTERRUPCION_LINEA_INFERIOR"||renderer?.dibujar_marcador_junction!==false||renderer?.geometria_logica_ininterrumpida!==true||renderer?.dibujar_arista_superior_continua!==true||renderer?.interaccion!=="ARISTAS_SEPARADAS_SIN_TRANSFERENCIA"||half!==2||!igual(renderer.extremos_interrupcion,esperado)||esperado.some(q=>!interior(q,a,b)))errores.push("renderer/hueco");
        }
      }
    }
    const signature=JSON.stringify([ks.slice().sort(),p]);
    if(validos.has(signature))errores.push("registro repetido");
    if(errores.length)fallo("Crossover inválido",`${c.id}: ${errores.join(",")}`);else validos.set(signature,0);
  }
  if(porHoja.get("aguas_barrancos|principal")!==1||porHoja.get("valle|principal")!==1||porHoja.size!==2)fallo("Alcance crossovers");
  const entries=[...aristas];
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
    const [k,a]=entries[i],[l,b]=entries[j];if(a.hoja!==b.hoja)continue;
    const comunes=[a.from,a.dest].filter(id=>id===b.from||id===b.dest);
    for(const A of a.segs)for(const B of b.segs){
      const hit=inter(...A,...B);if(!hit)continue;
      const solo=igual(hit[0],hit[1]);if(solo&&comunes.some(id=>igual(pos[id],hit[0])))continue;
      const sig=JSON.stringify([[k,l].sort(),hit[0]]);
      if(solo&&validos.has(sig)){validos.set(sig,validos.get(sig)+1);conteos.cruces++;}
      else fallo(solo?"Cruce no declarado":"Solape/tramo compartido",`${k} / ${l}`);
    }
  }
  for(const [sig,n]of validos)if(n!==1)fallo("Crossover sin evento único",sig);
  conteos.pendientes=conteos.cardinalesIntraHoja-conteos.representadas;
  const esperado={rooms:329,areas:17,labels:329,hojas:22,exits:787,internos:786,externos:1,cardinalesIntraHoja:355,cardinalesEntreHojas:20,verticales:18,entreAreas:29,cardinalesCambianCapa:2,rectas:349,routes:6,representadas:355,pendientes:0,crossovers:2,cruces:2,atajos:6};
  for(const [k,n]of Object.entries(esperado))if(conteos[k]!==n)fallo("Conteo "+k,conteos[k]);
  if(!igual(conteos.capas,{principal:217,sumergido:19,profundo:73,superior:0,cumbre:20}))fallo("Conteos capas");
  if(!igual(externas,[["mojon_regional","sur","ruta_regional_arc2"]]))fallo("Salida regional exacta");
  return {ok:!fallos.length,fallos,conteos};
}

// ---------------------------------------------------------------------------
//  Auditoría de ÁREAS (ver67 · Etapa 2A). Devuelve un array de fallos, como el
//  resto de auditores. Las áreas sin rooms se toleran mientras el mundo sea el
//  de transición; Auditoría 3 activará { exigirSalas: true }.
// ---------------------------------------------------------------------------
function areasSinSalas() {
  const conSalas = new Set(Object.values(ROOMS).map(sala => sala.area));
  return Object.keys(AREAS).filter(id => !conSalas.has(id));
}

function auditarAreas({ exigirSalas = false } = {}) {
  const fallos = [];
  const idValido = /^[a-z][a-z0-9_]*$/;
  const colores = new Map();
  for (const [id, area] of Object.entries(AREAS)) {
    if (!idValido.test(id)) fallos.push(`AREAS.${id}: el id debe ser snake_case`);
    if (MAPA_CAPAS[id]) fallos.push(`AREAS.${id}: el id coincide con una sección vertical de MAPA_CAPAS`);
    if (!area || typeof area.nombre !== "string" || !area.nombre.trim()) fallos.push(`AREAS.${id}: falta el nombre`);
    if (!area || !/^#[0-9a-f]{6}$/i.test(area.color || "")) fallos.push(`AREAS.${id}: color inválido «${area?.color}» (se espera #rrggbb)`);
    else {
      const color = area.color.toLowerCase();
      if (colores.has(color)) fallos.push(`AREAS.${id}: comparte el color ${color} con ${colores.get(color)}`);
      else colores.set(color, id);
    }
  }
  const subzonas = new Map();
  for (const [rid, sala] of Object.entries(ROOMS)) {
    if (sala.area === undefined || sala.area === null || sala.area === "") fallos.push(`${rid}: no tiene area`);
    else if (typeof sala.area !== "string" || !AREAS[sala.area]) fallos.push(`${rid}: area «${sala.area}» no existe en AREAS`);
    if ("nivel" in sala) fallos.push(`${rid}: el campo «nivel» es redundante; la sección vertical sale de MAPA_CAPA_SALA`);
    if (sala.subzona !== undefined) {
      if (typeof sala.subzona !== "string" || !idValido.test(sala.subzona)) fallos.push(`${rid}: subzona inválida «${sala.subzona}» (se espera snake_case)`);
      else if (subzonas.has(sala.subzona) && subzonas.get(sala.subzona) !== sala.area) {
        fallos.push(`${rid}: la subzona «${sala.subzona}» aparece en las áreas ${subzonas.get(sala.subzona)} y ${sala.area}`);
      } else subzonas.set(sala.subzona, sala.area);
    }
  }
  // Tablas por room que ya no corresponden a ninguna room (típico tras reemplazar salas).
  for (const [nombre, tabla] of [["MAPA_POS", MAPA_POS], ["MAPA_ETIQ", MAPA_ETIQ], ["MAPA_CAPA_SALA", MAPA_CAPA_SALA]]) {
    for (const rid of Object.keys(tabla)) if (!ROOMS[rid]) fallos.push(`${nombre}.${rid}: no corresponde a ninguna room`);
  }
  if (exigirSalas) for (const id of areasSinSalas()) fallos.push(`AREAS.${id}: declarada sin rooms`);
  return fallos;
}

// ---------------------------------------------------------------------------
//  Auditoría de REFERENCIAS del mundo: tablas externas que apuntan a ids de
//  ROOMS. Sólo comprueba integridad de referencias; no cambia ningún dato.
//  { conectividad: true } añade una comprobación de diseño (apagada por defecto):
//  moverErrante() sólo se desplaza entre vecinos que estén dentro del territorio,
//  así que una sala del territorio inalcanzable desde `origen` nunca se visita.
// ---------------------------------------------------------------------------
function auditarReferenciasMundo({ conectividad = false } = {}) {
  const fallos = [];
  const existe = rid => typeof rid === "string" && !!ROOMS[rid];

  const idsErrantes = new Set();
  ERRANTES_INICIALES.forEach((e, i) => {
    const nombre = `ERRANTES_INICIALES[${i}]${e?.id ? ` (${e.id})` : ""}`;
    if (!e?.id) fallos.push(`${nombre}: falta id`);
    else if (idsErrantes.has(e.id)) fallos.push(`${nombre}: id repetido`);
    else idsErrantes.add(e.id);
    if (!MOBS[e?.mobId]) fallos.push(`${nombre}: mobId «${e?.mobId}» no existe en MOBS`);
    if (!Array.isArray(e?.territorio) || !e.territorio.length) { fallos.push(`${nombre}: territorio vacío`); return; }
    let territorioValido = true;
    for (const rid of e.territorio) if (!existe(rid)) { fallos.push(`${nombre}: el territorio contiene «${rid}», que no existe`); territorioValido = false; }
    for (const campo of ["origen", "sala"]) {
      if (!existe(e[campo])) fallos.push(`${nombre}: ${campo} «${e[campo]}» no existe`);
      else if (!e.territorio.includes(e[campo])) fallos.push(`${nombre}: ${campo} «${e[campo]}» está fuera de su territorio`);
    }
    if (conectividad && territorioValido && existe(e.origen)) {
      const alcanzadas = new Set([e.origen]), cola = [e.origen];
      while (cola.length) {
        const rid = cola.shift();
        for (const destino of Object.values(ROOMS[rid].exits || {})) {
          if (e.territorio.includes(destino) && !alcanzadas.has(destino)) { alcanzadas.add(destino); cola.push(destino); }
        }
      }
      const aisladas = e.territorio.filter(rid => !alcanzadas.has(rid));
      if (aisladas.length) fallos.push(`${nombre}: desde ${e.origen} no puede llegar a ${aisladas.join(", ")} sin salir de su territorio`);
    }
  });

  for (const [nid, nodo] of Object.entries(NODOS_HERBORISTERIA)) {
    if (!(nid === "sangre_huerto" && nodo?.pendiente === "P06" && nodo.sala === null) && !existe(nodo?.sala)) fallos.push(`NODOS_HERBORISTERIA.${nid}: sala «${nodo?.sala}» no existe`);
    if (!PLANTAS_ESPIRITUALES[nodo?.especie]) fallos.push(`NODOS_HERBORISTERIA.${nid}: especie «${nodo?.especie}» no existe en PLANTAS_ESPIRITUALES`);
  }

  for (const [qid, salas] of Object.entries(SALAS_MISIONES_ATLAS)) {
    if (!QUESTS[qid]) fallos.push(`SALAS_MISIONES_ATLAS.${qid}: la misión no existe en QUESTS`);
    if (!Array.isArray(salas) || !salas.length) { fallos.push(`SALAS_MISIONES_ATLAS.${qid}: lista de salas vacía`); continue; }
    const vistas = new Set();
    for (const rid of salas) {
      if (!existe(rid)) fallos.push(`SALAS_MISIONES_ATLAS.${qid}: la sala «${rid}» no existe`);
      if (vistas.has(rid)) fallos.push(`SALAS_MISIONES_ATLAS.${qid}: la sala «${rid}» está repetida`);
      vistas.add(rid);
    }
  }
  const percibidas = new Set();
  for (const rid of SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO) {
    if (!existe(rid)) fallos.push(`SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO: la sala «${rid}» no existe`);
    if (percibidas.has(rid)) fallos.push(`SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO: la sala «${rid}» está repetida`);
    percibidas.add(rid);
  }
  return fallos;
}

const FLECHA_DIR = { norte: "▲", sur: "▼", este: "▶", oeste: "◀", arriba: "▲", abajo: "▼" };
const DIR_CORTA = { norte: "N", sur: "S", este: "E", oeste: "O", arriba: "↑", abajo: "↓" };
