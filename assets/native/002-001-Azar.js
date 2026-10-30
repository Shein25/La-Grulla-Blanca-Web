"use strict";

// ============================================================================
//  LA GRULLA BLANCA
//
//  Un solo archivo, ordenado en secciones. La regla que las ordena: cada
//  sección sólo puede depender de las anteriores.
//
//    1. AZAR ................ aleatoriedad, sembrable para reproducir fallos
//    2. DATOS DEL MUNDO ..... salas, criaturas, objetos, misiones, técnicas
//       2a. ajustes de balance (daño, riesgo, costes, respawn)
//    3. PARSER .............. texto del jugador -> (verbo, argumentos)
//    4. REGLAS .............. dados, impacto, crítico, umbrales. Puro cálculo.
//    5. MODELOS ............. instancias de criatura
//    6. COMBATE ............. clase Combate. No toca la pantalla.
//    7. MOTOR ............... clase Juego, en siete bloques:
//         7.1 ciclo de vida      7.5 comandos
//         7.2 persistencia       7.6 diálogos
//         7.3 mundo              7.7 interfaz  <- lo único que dibuja
//         7.4 progresión
//    8. PRUEBAS ............. diagnóstico ejecutable. Escribí DIAGNOSTICO en
//                             el juego, o GB.PRUEBAS.correr() en la consola.
//    9. CAPA DE INTERFAZ .... eventos del navegador y arranque
//
//  Desde la consola del navegador: GB.juego, GB.PRUEBAS, GB.Azar, GB.DATOS.
//
//  Reglas implícitas (campos por estructura, convención de texto de
//  salida(), qué tocar y qué no): ver CONVENCIONES Y RELACIONES, más abajo.
//  grep "CONVENCIÓN ·" da el mapa de ese bloque.
//
//  Catálogos de datos: ROOMS (mundo canónico), MOBS e ITEMS.
//  QUESTS permanece vacío hasta la progresión canónica P–M18.
//  La clase Juego tiene un índice por tema dentro de cada bloque 7.1–7.7.
// ============================================================================

// ============================================================================
//  CONVENCIONES Y RELACIONES
//  Esto no es el mapa de "dónde está cada cosa" (para eso están los números
//  de sección de arriba) sino el de "qué reglas no escritas hay que conocer
//  para tocar el juego sin romper algo en otro lado". Son cosas que hoy sólo
//  se descubren leyendo código; quedan documentadas acá una sola vez.
// ============================================================================

// ---------- CONVENCIÓN · campos de ITEMS (sección 2) ----------
// Obligatorios: name, desc.
// Opcionales — el motor sólo los usa si están presentes; la lista completa
// de los que el juego sabe mostrar está en statsItem() (sección 4):
//   tipo        "consumible" | "reliquia" | "material" | "escritura" |
//               "tesoro" | "manual" | "curiosidad" | ... Sólo dispara lógica
//               puntual (p.ej. tipo:"manual" espera que exista `tecnica`).
//   slot        Dónde se equipa: "mano" | "torso" | "cabeza" | "piernas" |
//               "cuello" | "dedo". Sin slot, el objeto no es equipable.
//   daño        Notación de dado ("1d6+1"). Sólo en armas.
//   ataque, defensa    Bonos planos.
//   qi_med      Qi extra al meditar mientras está equipado.
//   cura, recupera_qi, purifica, remienda, calidad, piedras   Cada uno
//               alimenta una línea propia en statsItem(); si el campo no
//               está ahí, se ignora en silencio (no rompe nada, pero
//               tampoco se muestra).
//   tecnica     Id en TECNICAS; obligatorio si tipo:"manual".
//   precio      Sólo si el objeto se vende o se compra.
// Si agregás un campo nuevo y querés que aparezca en la ficha del objeto,
// hay que sumarlo también a statsItem() (o statsCortos() para la versión
// breve): un campo en ITEMS que no está en esas dos funciones existe pero
// nunca se ve.

// ---------- CONVENCIÓN · campos de ROOMS (sección 2) ----------
// Obligatorios: name, desc, exits (puede ser {} en un callejón sin salida,
// pero el objeto tiene que existir — exits ausente rompe el movimiento).
// Opcionales:
//   items, mobs, npcs   Arrays de ids. Ausentes = sala vacía de eso.
//   oculto              Array de ids de ITEMS que sólo aparecen con sentido
//                       divino activo (ver tieneSentido()).
//   scenery             { palabra: texto } — lo que devuelve EXAMINAR
//                       <palabra> acá. Las claves son las palabras sueltas
//                       que puede escribir el jugador.
//   sentido             Línea extra que se agrega sólo con sentido divino.
//   detalles            Array de líneas que se listan siempre, aparte de
//                       `desc`.
//   vena                Id en VENAS; cambia el ritmo de meditación acá.
//   alojamiento         { inicio, cierre, purifica } — si existe, DESCANSAR
//                       funciona en esta sala; si no, tira el mensaje
//                       genérico de "acá no hay dónde dormir".
// Una sala sin `exits` no tira error al cargar: se descubre recién cuando
// alguien intenta salir de ahí y no puede. Al agregar una sala nueva,
// confirmar el `exits` a mano — no hay auditoría automática para esto como
// sí la hay para misiones (auditarMisiones()) o ayuda (auditarAyuda()).

// ---------- CONVENCIÓN · campos de MOBS (sección 2) ----------
// Obligatorios: name, hp.
// Opcionales (el default que usa crearMob() en sección 5 va entre
// paréntesis):
//   corto (= name)      Apodo corto para mensajes de combate.
//   ataque (0), defensa (10), daño ("1d3"), qi (0 — recompensa al matarlo)
//   loot                [{ item, prob }]. prob es 0–1 y se tira por
//                       separado para cada entrada: no es una tabla
//                       exclusiva, un mob puede soltar varias cosas a la vez
//                       o ninguna.
//   unico (false)       true = jefe/único: +2 defensa y ciertos efectos
//                       limitados a 1 ronda (ver usos de `mob.unico` en la
//                       sección 6, class Combate).
//   elemento (null)     Afinidad elemental; interactúa con
//                       SECUENCIAS_ELEMENTALES.
//   tecnica (null)      { name, cada, ataque?, daño?, veneno:{daño,turnos}? }
//                       — ataque especial que el mob dispara cada N rondas.
// Los mobs errantes (los de territorio fijo, sección 2 · "MOBS ERRANTES")
// no agregan campos nuevos: usan esta misma plantilla, más metadata que les
// pone crearMob() al instanciarlos (erranteId, erranteDesde, etc.) — no
// hace falta ni conviene escribir esa metadata a mano en MOBS.

// ---------- CONVENCIÓN · texto de salida() y estilo por línea (sección 7.7) ----------
// salida() no recibe una clase por línea: la deduce del texto con regex.
// Si escribís contenido nuevo (frase de misión, línea de NPC, texto de
// sala) y no sigue uno de estos patrones, sale con el estilo "línea"
// genérico aunque debiera verse distinto — no tira error, simplemente no
// se destaca. Antes de escribir texto nuevo, los patrones que importan:
//
//   — o «  al principio de línea       -> diálogo (clase "dialogo")
//   === texto ===                      -> título de sección
//   (sentido divino) ...                -> texto de sentido divino
//   Gente: / Salidas: / Criaturas: /
//   Ves: / En el suelo: / Restos: /
//   Movimiento reciente:               -> metadatos de sala (objetos: morado)
//   Plantas:                           -> plantas recolectables (verde)
//   (algo)  o  [algo]                  -> nota de sistema
//   (+...  o  +123 al principio         -> recompensa
//   [Nuevos encargos|Nueva misión|...]  -> resumen de misión
//   3 espacios de indentación           -> línea de combate
//   "3)"  o  "- " al principio          -> opción numerada/listada
//
// Es frágil a propósito: mantener una convención de texto sale más barato
// que etiquetar cada línea a mano. Si algo nuevo no se ve como debería, lo
// primero que hay que revisar es si el texto arranca con el prefijo
// esperado — no tocar salida() para eso.

// ---------- CONVENCIÓN · puntos de entrada seguros vs. internos que no conviene tocar sueltos ----------
// Para agregar contenido sin tener que entender el motor entero, estos son
// los puntos pensados para eso:
//   ejecutar(verbo, args) (7.5)   Despacho de comandos. Agregar un verbo
//                       nuevo es un `if` más acá arriba; no hace falta tocar
//                       el resto del motor.
//   activarMision(qid, estado)    Activa o pone en rumor una misión; ya
//                       valida el estado anterior.
//   completarMision(qid)          Entrega + recompensa + "[Misión
//                       completada]". Se llama desde gestionarMisionesNpc()
//                       y un puñado de casos puntuales (origen_personal) —
//                       normalmente no hace falta invocarlo a mano salvo que
//                       estés agregando una vía nueva de entrega.
//   salida(texto, clase) / addLine()   Única vía para imprimir texto; nunca
//                       tocar this.contenido directamente.
//   crearMob(mid, plantilla, meta)     Única vía para instanciar un mob
//                       desde MOBS; conserva los defaults de la sección 5.
//   avanzarEcologia(pulsos)       Única vía para adelantar relojEcologico
//                       (se llama desde combate, movimiento, alquimia y
//                       descanso). No reasignar this.relojEcologico a mano
//                       fuera de acá.
//   GB.Azar.sembrar(n) / GB.PRUEBAS.correr()   Desde la consola del
//                       navegador, para reproducir y diagnosticar sin tocar
//                       código.
//
// turnoGlobal es distinto: se incrementa directamente en varios puntos de
// 7.5 (cada comando que gasta turno lo suma él mismo, no hay una función
// central). Si agregás un comando nuevo que deba gastar turno, sumale
// `this.turnoGlobal++` ahí mismo — no intentes centralizarlo.
//
// Lo que conviene tratar como interno y no tocar aislado, porque coordina
// estado repartido en varios lugares a la vez:
//   class Combate (sección 6)     Cambiar el orden dentro de turno() puede
//                       alterar cuándo se aplican quemaduras, venenos y
//                       ataduras respecto al golpe del turno. Correr las
//                       pruebas de combate (sección 8) antes y después de
//                       tocar esto.
//   Guardado y normalización (7.2): sólo se acepta SAVE_SCHEMA_VERSION.
//                       Los saves pre-3C se rechazan antes de leer su estado.
//                       Conservar normalizadores de campos del esquema actual.
// ============================================================================

// ============================================================================
//  SECCIÓN 1 · AZAR
//  Toda la aleatoriedad del juego pasa por acá. Sin sembrar, se comporta
//  exactamente igual que antes (Math.random). Sembrada, la partida es
//  reproducible: la misma semilla da la misma secuencia de tiradas, así que un
//  fallo que viste una vez se puede volver a provocar.
//
//    GB.Azar.sembrar(1234)   -> desde acá, todo es determinista
//    GB.Azar.semilla         -> null si está libre
//    GB.Azar.libre()         -> vuelve al azar del navegador
// ============================================================================

const Azar = {
  semilla: null,
  _estado: 0,
  sembrar(n) {
    this.semilla = (Number(n) >>> 0) || 1;
    this._estado = this.semilla;
    return this.semilla;
  },
  libre() { this.semilla = null; },
  random() {
    if (this.semilla === null) return Math.random();
    // mulberry32: corto, rápido y suficiente para tiradas de dados.
    this._estado = (this._estado + 0x6D2B79F5) >>> 0;
    let t = this._estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  },
};



// ============================================================================
//  SECCIÓN 2 · DATOS DEL MUNDO
//  Todo el contenido del juego, en objetos literales. Nada de acá ejecuta
//  lógica ni conoce la pantalla: se puede leer, editar y comparar a mano.
// ============================================================================


const CLAVE_VIEJA = "grulla_blanca_save";
const CLAVE_AUTO = "grulla_blanca_auto";
const CLAVE_SLOT = n => "grulla_blanca_slot_" + n;
const NSLOTS = 3;
