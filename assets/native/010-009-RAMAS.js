const RAMAS = {
  // ---------- ofensivas de objetivo único · rango mortal ----------
  palma: {
    1: [{ nombre: "Ascua persistente", mod: { quemadura: { daño: "1d3", turnos: 2 } } },
        { nombre: "Palma compacta", mod: { daño: "+1d4" } },
        { nombre: "Chispa perseguidora", mod: { ataque: 3 } }],
    2: [{ nombre: "Respiración frugal", mod: { coste: -1 } },
        { nombre: "Pulso certero", mod: { ataque: 4 } },
        { nombre: "Brasa crítica", mod: { critMin: 19 } }],
    3: [{ nombre: "Incendio del meridiano", mod: { daño: "+1d6", quemadura: { daño: "1d4", turnos: 3 }, coste: 1 } },
        { nombre: "Ritmo de cien brasas", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Respiración de brasa", mod: { coste: -1, quemadura: { daño: "1d2", turnos: 2 } } }],
  },
  filo: {
    1: [{ nombre: "Filo resonante", mod: { ataque: 3 } },
        { nombre: "Filo pesado", mod: { daño: "+1d4" } },
        { nombre: "Filo oportunista", mod: { critMin: 19 } }],
    2: [{ nombre: "Corte del vacío", mod: { coste: -1, critMin: 19 } },
        { nombre: "Corte dirigido", mod: { ataque: 4 } },
        { nombre: "Corte de tendón", mod: { debil: { ataque: -2, turnos: 1 } } }],
    3: [{ nombre: "Hoja del metal vivo", mod: { daño: "+1d6", critMin: 18, coste: 1 } },
        { nombre: "Templado voraz", mod: { critMult: 1.75, ataque: 2 } },
        { nombre: "Temple económico", mod: { coste: -1, debil: { ataque: -2, turnos: 2 } } }],
  },
  latigo: {
    1: [{ nombre: "Onda desgarradora", mod: { debil: { ataque: -1, turnos: 1 } } },
        { nombre: "Azote profundo", mod: { daño: "+1d4" } },
        { nombre: "Corriente precisa", mod: { ataque: 3 } }],
    2: [{ nombre: "Cauce continuo", mod: { coste: -1 } },
        { nombre: "Curva imprevisible", mod: { ataque: 4 } },
        { nombre: "Latido de marea", mod: { critMin: 19 } }],
    3: [{ nombre: "Marea debilitante", mod: { daño: "+1d6", debil: { ataque: -2, turnos: 2 }, coste: 1 } },
        { nombre: "Oleaje sin fin", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Agua que pesa", mod: { coste: -1, debil: { ataque: -1, turnos: 2 } } }],
  },
  // ---------- ofensivas de objetivo único · rango tierra ----------
  sello: {
    1: [{ nombre: "Peso creciente", mod: { daño: "+1d6" } },
        { nombre: "Roca quebrada", mod: { ataque: 4 } },
        { nombre: "Grieta del suelo", mod: { critMin: 19 } }],
    2: [{ nombre: "Sello contenido", mod: { coste: -2 } },
        { nombre: "Montaña certera", mod: { ataque: 4 } },
        { nombre: "Marca de la falla", mod: { critMin: 19 } }],
    3: [{ nombre: "Montaña que aprisiona", mod: { daño: "+2d6", ataduraGolpe: 1, coste: 2 } },
        { nombre: "Centro gravitatorio", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Peso contenido", mod: { coste: -2, daño: "+1d4" } }],
  },
  lanza_nube: {
    1: [{ nombre: "Punta celeste", mod: { ataque: 4 } },
        { nombre: "Nube hendida", mod: { daño: "+1d6" } },
        { nombre: "Punta oportunista", mod: { critMin: 19 } }],
    2: [{ nombre: "Aliento continuo", mod: { coste: -2 } },
        { nombre: "Aliento dirigido", mod: { ataque: 4 } },
        { nombre: "Corte de viento", mod: { debil: { ataque: -2, turnos: 1 } } }],
    3: [{ nombre: "Horizonte atravesado", mod: { daño: "+2d6", critMin: 19, coste: 2 } },
        { nombre: "Vacío penetrante", mod: { critMult: 1.75, ataque: 3 } },
        { nombre: "Horizonte eficiente", mod: { coste: -2, daño: "+1d4" } }],
  },
  brasa_vendaval: {
    1: [{ nombre: "Viento certero", mod: { ataque: 3 } },
        { nombre: "Brasa pesada", mod: { daño: "+1d4" } },
        { nombre: "Brasa oportunista", mod: { critMin: 19 } }],
    2: [{ nombre: "Brasa sostenida", mod: { coste: -1 } },
        { nombre: "Racha dirigida", mod: { ataque: 4 } },
        { nombre: "Rescoldo adherido", mod: { quemadura: { daño: "1d3", turnos: 2 } } }],
    3: [{ nombre: "Incendio errante", mod: { daño: "+1d6", quemadura: { daño: "1d4", turnos: 2 }, coste: 1 } },
        { nombre: "Combustión del vacío", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Vendaval eficiente", mod: { coste: -1, daño: "+1d4" } }],
  },
  aguja_aluvial: {
    1: [{ nombre: "Corriente entumecedora", mod: { debil: { ataque: -1, turnos: 2 } } },
        { nombre: "Punta de corriente", mod: { daño: "+1d4" } },
        { nombre: "Aguja certera", mod: { ataque: 3 } }],
    2: [{ nombre: "Hilo continuo", mod: { coste: -1 } },
        { nombre: "Hilo sobrio", mod: { ataque: 4 } },
        { nombre: "Aguja oportunista", mod: { critMin: 19 } }],
    3: [{ nombre: "Lluvia de plata", mod: { daño: "+1d6", debil: { ataque: -2, turnos: 2 }, coste: 1 } },
        { nombre: "Pulso de plata", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Estocada eficiente", mod: { coste: -1, daño: "+1d4" } }],
  },
  loto_vapor: {
    1: [{ nombre: "Pétalo certero", mod: { ataque: 3 } },
        { nombre: "Pétalo pesado", mod: { daño: "+1d4" } },
        { nombre: "Pétalo oportunista", mod: { critMin: 19 } }],
    2: [{ nombre: "Ciclo concordante", mod: { coste: -1 } },
        { nombre: "Vapor dirigido", mod: { ataque: 4 } },
        { nombre: "Vapor hirviente", mod: { quemadura: { daño: "1d3", turnos: 2 } } }],
    3: [{ nombre: "Floración de vapor", mod: { daño: "+1d8", quemadura: { daño: "1d4", turnos: 2 }, coste: 1 } },
        { nombre: "Corazón de vapor", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Flor eficiente", mod: { coste: -1, daño: "+1d4" } }],
  },
  // ---------- ofensivas de área ----------
  circulo_ascuas: {
    1: [{ nombre: "Corona ardiente", mod: { quemadura: { daño: "1d2", turnos: 2 } } },
        { nombre: "Ascuas concentradas", mod: { daño: "+1d4" } },
        { nombre: "Anillo preciso", mod: { ataque: 3 } }],
    2: [{ nombre: "Círculo frugal", mod: { coste: -2 } },
        { nombre: "Círculo cerrado", mod: { ataque: 4 } },
        { nombre: "Chispa oportuna", mod: { critMin: 19 } }],
    3: [{ nombre: "Cien fuegos despiertos", mod: { daño: "+1d8", quemadura: { daño: "1d3", turnos: 3 }, coste: 2 } },
        { nombre: "Ritmo de ascuas", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Sol económico", mod: { coste: -2, quemadura: { daño: "1d2", turnos: 2 } } }],
  },
  lluvia_filos: {
    1: [{ nombre: "Lluvia certera", mod: { ataque: 3 } },
        { nombre: "Filos pesados", mod: { daño: "+1d4" } },
        { nombre: "Filos oportunistas", mod: { critMin: 19 } }],
    2: [{ nombre: "Formación económica", mod: { coste: -2 } },
        { nombre: "Lluvia regular", mod: { ataque: 4 } },
        { nombre: "Filo en la juntura", mod: { debil: { ataque: -2, turnos: 1 } } }],
    3: [{ nombre: "Bóveda de acero", mod: { daño: "+1d6", ataque: 3, coste: 2 } },
        { nombre: "Formación dirigida", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Cúpula económica", mod: { coste: -2, daño: "+1d4" } }],
  },
  marea_circular: {
    1: [{ nombre: "Resaca debilitante", mod: { debil: { ataque: -1, turnos: 2 } } },
        { nombre: "Marea profunda", mod: { daño: "+1d4" } },
        { nombre: "Orillas certeras", mod: { ataque: 3 } }],
    2: [{ nombre: "Cauce económico", mod: { coste: -2 } },
        { nombre: "Orilla anticipada", mod: { ataque: 4 } },
        { nombre: "Espuma cortante", mod: { critMin: 19 } }],
    3: [{ nombre: "Ocho orillas cerradas", mod: { daño: "+1d6", debil: { ataque: -3, turnos: 3 }, coste: 2 } },
        { nombre: "Rompiente crítica", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Cauce dirigido", mod: { coste: -2, debil: { ataque: -1, turnos: 2 } } }],
  },
  tijera_vendaval: {
    1: [{ nombre: "Cruce certero", mod: { ataque: 3 } },
        { nombre: "Ráfagas pesadas", mod: { daño: "+1d4" } },
        { nombre: "Cruce oportunista", mod: { critMin: 19 } }],
    2: [{ nombre: "Vendaval contenido", mod: { coste: -2 } },
        { nombre: "Cruce medido", mod: { ataque: 4 } },
        { nombre: "Aire enrarecido", mod: { debil: { ataque: -2, turnos: 1 } } }],
    3: [{ nombre: "Horizonte dividido", mod: { daño: "+1d6", ataque: 3, coste: 2 } },
        { nombre: "Centro del vendaval", mod: { critMin: 19, critMult: 1.75 } },
        { nombre: "Tijera económica", mod: { coste: -2, daño: "+1d4" } }],
  },
  // ---------- esquiva, guardia y fortificación ----------
  paso_nube: {
    1: [{ nombre: "Paso prolongado", mod: { duracionExtra: 1 } },
        { nombre: "Paso corto", mod: { esquiva: 22 } },
        { nombre: "Paso sobrio", mod: { coste: -1 } }],
    2: [{ nombre: "Respiración de nube", mod: { coste: -1 } },
        { nombre: "Paso velado", mod: { esquiva: 25 } },
        { nombre: "Aliento sostenido", mod: { duracionExtra: 1 } }],
    3: [{ nombre: "Cuerpo sin peso", mod: { esquiva: 32, duracionExtra: 1, coste: 1 } },
        { nombre: "Viento entre hojas", mod: { duracionExtra: 2 } },
        { nombre: "Ausencia instantánea", mod: { esquiva: 22, coste: -1 } }],
  },
  piel_cobre: {
    1: [{ nombre: "Cobre endurecido", mod: { guardia: 6 } },
        { nombre: "Cobre flexible", mod: { duracionExtra: 1 } },
        { nombre: "Cobre sobrio", mod: { coste: -1 } }],
    2: [{ nombre: "Aliento económico", mod: { coste: -1 } },
        { nombre: "Cobre grueso", mod: { guardia: 7 } },
        { nombre: "Placas continuas", mod: { duracionExtra: 1 } }],
    3: [{ nombre: "Coraza de montaña", mod: { guardia: 9, duracionExtra: 1, coste: 1 } },
        { nombre: "Cobre asentado", mod: { duracionExtra: 2 } },
        { nombre: "Coraza económica", mod: { guardia: 5, coste: -1 } }],
  },
  respiracion_horno: {
    1: [{ nombre: "Horno persistente", mod: { duracionExtra: 1 } },
        { nombre: "Brasa protectora", mod: { guardia: 5 } },
        { nombre: "Horno sobrio", mod: { coste: -1 } }],
    2: [{ nombre: "Aliento de caldera", mod: { coste: -2 } },
        { nombre: "Cerámica dura", mod: { guardia: 6 } },
        { nombre: "Horno duradero", mod: { duracionExtra: 1 } }],
    3: [{ nombre: "Cuerpo-caldera", mod: { guardia: 8, duracionExtra: 1, coste: 1 } },
        { nombre: "Cerámica espiritual", mod: { duracionExtra: 2 } },
        { nombre: "Caldera económica", mod: { guardia: 4, coste: -1 } }],
  },
  coraza_crisol: {
    1: [{ nombre: "Placas asentadas", mod: { guardia: 8 } },
        { nombre: "Crisol compacto", mod: { duracionExtra: 1 } },
        { nombre: "Crisol sobrio", mod: { coste: -1 } }],
    2: [{ nombre: "Crisol económico", mod: { coste: -2 } },
        { nombre: "Cimiento continuo", mod: { guardia: 9 } },
        { nombre: "Placas duraderas", mod: { duracionExtra: 1 } }],
    3: [{ nombre: "Montaña de escamas", mod: { guardia: 12, duracionExtra: 1, coste: 1 } },
        { nombre: "Metal respirante", mod: { duracionExtra: 2 } },
        { nombre: "Escama económica", mod: { guardia: 8, coste: -1 } }],
  },
  espejo_luna: {
    1: [{ nombre: "Reflejo persistente", mod: { duracionExtra: 1 } },
        { nombre: "Luna densa", mod: { defensa: 6 } },
        { nombre: "Luna sobria", mod: { coste: -1 } }],
    2: [{ nombre: "Luna sin gasto", mod: { coste: -2 } },
        { nombre: "Superficie amplia", mod: { defensa: 7 } },
        { nombre: "Luz persistente", mod: { duracionExtra: 1 } }],
    3: [{ nombre: "Espejo perfecto", mod: { defensa: 9, duracionExtra: 1, coste: 2 } },
        { nombre: "Reflejo continuo", mod: { duracionExtra: 2 } },
        { nombre: "Luna económica", mod: { defensa: 6, coste: -2 } }],
  },
  // ---------- control ----------
  filamento: {
    1: [{ nombre: "Nudo ligero", mod: { coste: -1 } },
        { nombre: "Hilo cortante", mod: { dañoAtar: "1d3" } },
        { nombre: "Nudo firme", mod: { control: 3 } }],
    2: [{ nombre: "Lazo doble", mod: { atadura: 2 } },
        { nombre: "Nudo perseguidor", mod: { control: 4 } },
        { nombre: "Lazo medido", mod: { dañoAtar: "1d4" } }],
    3: [{ nombre: "Hilo cortante profundo", mod: { atadura: 2, dañoAtar: "1d6", coste: 1 } },
        { nombre: "Nudo insistente", mod: { control: 5 } },
        { nombre: "Remanso frugal", mod: { coste: -1, dañoAtar: "1d3" } }],
  },
};

const TRAMOS_MERIDIANOS = [null, "Forma menor", "Circulación mayor", "Refinamiento de Fundación"];

// ============================================================================
//  CONTRATO DE DISEÑO · BUILDS Y COMBATE
//
//  1. player.tecnicas contiene conocimiento/progreso/ramas.
//  2. player.tecnicas_preparadas contiene el loadout actual.
//  3. player.builds contiene snapshots guardados.
//  4. player.build_activa solo identifica el preset de origen.
//  5. El combate futuro consultará tecnicasPreparadasActuales().
//  6. El combate NO debe leer directamente una build guardada.
//  7. Cambiar la configuración actual puede marcar una build como MODIFICADA.
//  8. Las builds nunca almacenan stats derivados.
//
//  Una build es solo una fotografía de ELECCIONES: { id, nombre, preparadas[],
//  ramas{tid:{1,2,3}} }. Nada de daño, coste, precisión ni maestría: eso lo
//  sigue calculando statsTecnica() a partir de la configuración actual.
//
//  El snapshot canónico omite las técnicas cuyos tres tramos están en 0. Por eso
//  activar una build devuelve a cero los tramos de cualquier técnica ausente del
//  snapshot (§44): el preset reproduce su distribución de puntos completa.
// ============================================================================
const MAX_NOMBRE_PERSONAJE = 20;
const MAX_BUILDS = 5;
const MAX_NOMBRE_BUILD = 15;
const PERFILES_RAMA = [null, "Camino primario", "Rama de precisión", "Rama frugal"];

function limpiarNombrePersonaje(nombre) {
  const soloLetras = String(nombre ?? "")
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(soloLetras).slice(0, MAX_NOMBRE_PERSONAJE).join("").trim();
}

function errorNombrePersonaje(nombre) {
  const crudo = String(nombre ?? "").replace(/\s+/g, " ").trim();
  if (!crudo) return "Escribe un nombre.";
  if (Array.from(crudo).length > MAX_NOMBRE_PERSONAJE)
    return `No puedes poner más de ${MAX_NOMBRE_PERSONAJE} caracteres.`;
  if (!/^[\p{L}]+(?: [\p{L}]+)*$/u.test(crudo))
    return "El nombre solo puede contener letras y espacios.";
  return "";
}

function nombrePersonajeValido(nombre) {
  return !errorNombrePersonaje(nombre);
}

// ---------------------------------------------------------------------------
//  AUDITOR DE RAMAS · convierte cada mejora en un vector comparable y detecta
//  opciones repetidas o dominadas antes de que lleguen al panel del jugador.
// ---------------------------------------------------------------------------
const EJES_RAMA = {
  daño: "POTENCIA", dañoAtar: "POTENCIA", ahorro: "ECONOMÍA", precision: "PRECISIÓN",
  crit: "CRÍTICO", critMult: "CRÍTICO", esquiva: "RESISTENCIA", defensa: "RESISTENCIA",
  guardia: "RESISTENCIA", duracion: "DURACIÓN", atadura: "DURACIÓN",
  quemadura: "ESTADO", debil: "ESTADO", control: "CONTROL",
};

function vectorRama(mod = {}, tid = null) {
  const t = tid ? TECNICAS[tid] : null;
  const v = {};
  for (const eje of Object.keys(EJES_RAMA)) v[eje] = 0;
  if (mod.daño) v.daño = promedioDado(String(mod.daño).replace(/^\+/, ""));
  if (mod.dañoAtar) v.dañoAtar = promedioDado(String(mod.dañoAtar).replace(/^\+/, ""));
  if (mod.coste) v.ahorro = -mod.coste;
  if (mod.ataque) v.precision = mod.ataque;
  if (mod.critMin) v.crit = 20 - mod.critMin;
  if (mod.critMult) v.critMult = mod.critMult - MULTIPLICADOR_CRITICO;
  if (mod.control) v.control = mod.control;
  // esquiva, defensa y guardia se declaran como valor final: el auditor compara el delta.
  if (mod.esquiva) v.esquiva = mod.esquiva - ((t && t.esquiva) || 15);
  if (mod.defensa) v.defensa = mod.defensa - ((t && t.defensa) || 3);
  if (mod.guardia) v.guardia = mod.guardia - ((t && t.guardia) || 3);
  if (mod.duracionExtra) v.duracion = mod.duracionExtra;
  if (mod.atadura) v.atadura += mod.atadura - ((t && t.atadura) || 1);
  if (mod.ataduraGolpe) v.atadura += mod.ataduraGolpe;
  if (mod.quemadura) v.quemadura = promedioDado(String(mod.quemadura.daño).replace(/^\+/, "")) * (mod.quemadura.turnos || 1);
  if (mod.debil) v.debil = Math.abs(mod.debil.ataque || 0) * (mod.debil.turnos || 1);
  return v;
}

function firmaRama(v) {
  return Object.keys(EJES_RAMA).filter(e => Math.abs(v[e]) > 1e-9).sort().join("+") || "vacía";
}

function auditarRamas() {
  const fallos = [];
  const ejes = Object.keys(EJES_RAMA);
  const iguales = (a, b) => ejes.every(e => Math.abs(a[e] - b[e]) < 1e-9);
  const domina = (a, b) => ejes.every(e => a[e] >= b[e] - 1e-9) && ejes.some(e => a[e] > b[e] + 1e-9);
  for (const tid of Object.keys(TECNICAS)) {
    const arte = RAMAS[tid];
    if (!arte) { fallos.push(`${tid}: no tiene ramas declaradas en RAMAS`); continue; }
    for (let n = 1; n <= 3; n++) {
      const ops = arte[n];
      if (!Array.isArray(ops) || ops.length !== 3) { fallos.push(`${tid} tramo ${n}: se esperaban 3 opciones`); continue; }
      const vs = ops.map(o => vectorRama(o && o.mod, tid));
      const firmas = vs.map(firmaRama);
      for (let i = 0; i < 3; i++) {
        if (!ops[i] || !ops[i].nombre) fallos.push(`${tid} tramo ${n}: la opción ${i + 1} no tiene nombre`);
        if (firmas[i] === "vacía") fallos.push(`${tid} tramo ${n}: «${ops[i]?.nombre}» no modifica nada`);
        for (let k = i + 1; k < 3; k++) {
          const a = `«${ops[i].nombre}»`, b = `«${ops[k].nombre}»`;
          if (iguales(vs[i], vs[k])) fallos.push(`${tid} tramo ${n}: ${a} y ${b} hacen exactamente lo mismo`);
          else if (domina(vs[i], vs[k])) fallos.push(`${tid} tramo ${n}: ${a} domina a ${b}`);
          else if (domina(vs[k], vs[i])) fallos.push(`${tid} tramo ${n}: ${b} domina a ${a}`);
          else if (firmas[i] === firmas[k]) fallos.push(`${tid} tramo ${n}: ${a} y ${b} tocan los mismos ejes (${firmas[i]}) y se leen igual`);
        }
      }
    }
  }
  return fallos;
}
