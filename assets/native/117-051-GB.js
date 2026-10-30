const GB = {
  auditarCartografia329, puntoMapa, claveAristaMapa, polilineaMapa, trazosAristaMapa,
  auditarMundo329, GATES_329, SAVE_SCHEMA_VERSION, validarSave329,
  juego, Juego, Combate, Azar, PRUEBAS, parse,
  DATOS: { ROOMS, MOBS, ITEMS, QUESTS, TECNICAS, RAMAS, AYUDA_SECCIONES, RECETAS, FACCIONES, PROFESIONES, RAICES, ORIGENES,
    HALLAZGOS_CADAVER, EXITO_BASE_EXAMEN, PLANTAS_ESPIRITUALES, NODOS_HERBORISTERIA, EXITO_BASE_HERBORISTERIA, XP_BASE_DIFICULTAD, TRAMOS_APRENDIZAJE, MAPA_POS, MAPA_ETIQ, MAPA_CAPAS, MAPA_CAPA_SALA, MAPA_RUTAS, MAPA_CROSSOVERS, AREAS, SALAS_MISIONES_ATLAS, SALAS_OCULTAS_PERCIBIDAS_POR_SENTIDO,
    TIPOS_ACCION_NARRATIVA, HISTORIAL_ACCIONES_VERSION },
  REGLAS: { tirar, dadoARango, atacar, probabilidadImpacto, umbralMaestria,
    factorAprendizaje, xpPracticaPorDificultad, TRAMOS_APRENDIZAJE, XP_BASE_DIFICULTAD, RANGOS_OFICIO, UMBRALES_OFICIO },
  auditarRamas, vectorRama, firmaRama, auditarAyuda, buscarSeccionAyuda, auditarMisiones, auditarTopologiaMapa,
  areaDeSala, aplicarAreaUI, clasificarSalidaAtlas, areasSinSalas, auditarAreas, auditarReferenciasMundo,
};
window.GB = GB;

// Red de seguridad al arrancar: si alguien agrega un arte con dos mejoras
// equivalentes, o una sección de AYUDA con un alias repetido, la consola lo
// avisa sin que haya que acordarse de correr las pruebas. El jugador no ve
// nada de esto; el autor sí.
{
  const ambiguas = auditarRamas();
  if (ambiguas.length) {
    console.warn(`[La Grulla Blanca] ${ambiguas.length} rama(s) ambigua(s). Escribí DIAGNOSTICO o corré GB.auditarRamas():`);
    for (const f of ambiguas) console.warn("  · " + f);
  }
  const rotasAyuda = auditarAyuda();
  if (rotasAyuda.length) {
    console.warn(`[La Grulla Blanca] ${rotasAyuda.length} problema(s) en el índice de AYUDA. Escribí DIAGNOSTICO o corré GB.auditarAyuda():`);
    for (const f of rotasAyuda) console.warn("  · " + f);
  }
  const rotasMisiones = auditarMisiones();
  if (rotasMisiones.length) {
    console.warn(`[La Grulla Blanca] ${rotasMisiones.length} problema(s) en las misiones. Escribí DIAGNOSTICO o corré GB.auditarMisiones():`);
    for (const f of rotasMisiones) console.warn("  · " + f);
  }
  const rotasMapa = [...auditarTopologiaMapa(),...auditarCartografiaLI().fallos];
  if (rotasMapa.length) {
    console.warn(`[La Grulla Blanca] ${rotasMapa.length} problema(s) de topología en ROOMS/Atlas. Escribí DIAGNOSTICO o corré GB.auditarTopologiaMapa():`);
    for (const f of rotasMapa) console.warn("  · " + f);
  }
  const rotasAreas = auditarAreas();
  if (rotasAreas.length) {
    console.warn(`[La Grulla Blanca] ${rotasAreas.length} problema(s) en el sistema de áreas. Escribí DIAGNOSTICO o corré GB.auditarAreas():`);
    for (const f of rotasAreas) console.warn("  · " + f);
  }
  const rotasReferencias = auditarReferenciasMundo();
  if (rotasReferencias.length) {
    console.warn(`[La Grulla Blanca] ${rotasReferencias.length} referencia(s) rotas a rooms. Escribí DIAGNOSTICO o corré GB.auditarReferenciasMundo():`);
    for (const f of rotasReferencias) console.warn("  · " + f);
  }
}
