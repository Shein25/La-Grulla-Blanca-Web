const VENAS = {
  muerta:    { mult: 0,   label: "muerta" },
  pobre:     { mult: 0.5, label: "pobre" },
  normal:    { mult: 1,   label: "normal" },
  rica:      { mult: 1.5, label: "rica" },
  resentida: { mult: 0,   label: "resentida", diente: true },
};
const SATURACION_MULT = [1, 0.75, 0.5, 0.25, 0];
const ACCIONES_DESCANSAR = 6;
const ACCIONES_DORMIR = 10;
const RIESGO_BASE = 20, RIESGO_IMPUREZA = 5, RIESGO_MAX = 60;
const PROB_ATRACCION_QI = 0.15, PROB_ATRACCION_SANGRE = 0.15, PROB_MORDIDA = 0.25;
const PROB_PULSO_MEDITACION = 0.05;
const COOLDOWN_INTERRUPCION = 3;
const PULSOS_DORMIR = 4;
// probabilidad, por ronda, de que un hostil suelto en la sala (no trabado todavía)
// se sume al combate en curso. Acordado en el rango 5–15% para no abrumar.
const PROB_UNION_COMBATE = 0.10;

// ---------- PACING: vaso y puertas de etapa ----------
const VASO_ETAPA = { 1: 25, 2: 45, 3: 75, 4: 110 };

const PUERTAS = {
  2: { pildoras: 0, logros: [] },
  3: { pildoras: 1, logros: [] },
  4: { pildoras: 2, logros: ["comprension:6"] },
};
// umbral de comprensión que reemplaza a la Píldora de Fundación en el cuello de
// botella (etapa 4 de LianQi, qi al tope). Ver puedeIntentar() y progresoFundacion().
const UMBRAL_COMPRENSION_FUNDACION = 10;

/* ======================================================================
   CONTRATO DE MOTOR · HISTORIAL DE ACCIONES

   Las decisiones narrativas importantes se registran como ACCIONES
   CANÓNICAS independientes del contenido que las originó. El objetivo es que
   Iluminación, Tribulación y sistemas futuros puedan recordar lo que hizo el
   personaje aunque cambien o desaparezcan NPC, misiones, diálogos o escenas.

   REGLAS DE ARQUITECTURA
   1) El contenido puede llamar registrarAccion(); el motor espiritual consulta
      obtenerAcciones()/tieneAccion(), nunca flags de un NPC o misión concreta.
   2) Una acción registra HECHOS, no moralidad ni afinidad de Dao. Prohibido
      guardar aquí puntos de libertad/protección/etc. Esa interpretación ocurre
      después, durante una reflexión del jugador.
   3) contexto/consecuencias usan conceptos generales (rival derrotado, memoria,
      recurso, promesa...), no nombres propios necesarios para comprender el acto.
   4) `clave` sólo sirve para idempotencia técnica: jamás debe decidir el sentido
      espiritual de una acción.
   5) El historial registra acciones de la partida actual. No importa flags
      ni reconstruye hechos de partidas pre-3C.
   6) Añadir contenido nuevo no exige modificar Iluminación: basta con registrar
      una acción canónica con contexto e importancia adecuados.
   ====================================================================== */
const HISTORIAL_ACCIONES_VERSION = 1;
const TIPOS_ACCION_NARRATIVA = Object.freeze({
  ROBAR: "ROBAR",
  DEVOLVER: "DEVOLVER",
  OCULTAR: "OCULTAR",
  COMPARTIR: "COMPARTIR",
  CALLAR: "CALLAR",
  AYUDAR: "AYUDAR",
  CONSERVAR: "CONSERVAR",
  PERDONAR: "PERDONAR",
  EJECUTAR: "EJECUTAR",
  RESTAURAR: "RESTAURAR",
  PRESERVAR: "PRESERVAR",
  CORREGIR: "CORREGIR",
  NEGOCIAR: "NEGOCIAR",
  ROMPER_VINCULO: "ROMPER_VINCULO",
  LIBERAR: "LIBERAR",
  CUSTODIAR: "CUSTODIAR",
});
const TIPOS_ACCION_VALIDOS = new Set(Object.values(TIPOS_ACCION_NARRATIVA));
