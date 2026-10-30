const CONCORDANCIA = { daño: 0.12, critico: 1, qi: 0.15, apoyo: 0.25 };
const CRIT_MIN_TOPE = 18; // techo de crítico: 10%. Vale para ramas y concordancia juntas.
const SECUENCIAS_ELEMENTALES = {
  "viento:fuego": { nombre: "Avivar las brasas", bono: "daño" },
  "tierra:metal": { nombre: "Forja asentada", bono: "critico" },
  "agua:metal": { nombre: "Templar el filo", bono: "critico" },
  "viento:agua": { nombre: "Corriente ligera", bono: "qi" },
  "agua:fuego": { nombre: "Vapor súbito", bono: "daño" },
  "fuego:tierra": { nombre: "Cimiento cocido", bono: "daño" },   // v49: primera que termina en tierra
  "agua:viento": { nombre: "Velo de niebla", bono: "critico" },  // v49: primera que termina en viento
};
const PRIORIDAD_BONO = { daño: 3, critico: 2, qi: 1 };
const TEXTO_APOYO = { guardia: " de absorción", fortificacion: " de defensa", esquiva: "% de evasión", control: " de precisión de control" };
const porcentajeUI = x => Math.round(x * 100);

function elementosDeTecnica(t) { return t.elementos || [t.elemento]; }

// La secuencia que `t` recibe si el eco previo es `ecoElemento`. Una Definitiva
// prueba todos sus elementos y toma el mejor bono (daño > crítico > qi).
function secuenciaRecibida(ecoElemento, t) {
  if (!ecoElemento) return null;
  let mejor = null;
  for (const el of elementosDeTecnica(t)) {
    const seq = SECUENCIAS_ELEMENTALES[`${ecoElemento}:${el}`];
    if (seq && (!mejor || PRIORIDAD_BONO[seq.bono] > PRIORIDAD_BONO[mejor.bono])) mejor = seq;
  }
  return mejor;
}

// Ventaja elemental de una técnica contra el elemento del rival. Una Definitiva
// usa el MEJOR de sus elementos: nunca rinde peor que una técnica pura.
function relacionElementalTecnica(t, defensor) {
  return Math.max(...elementosDeTecnica(t).map(e => relacionElemental(e, defensor)));
}

// +25% del efecto de apoyo, hacia arriba, con piso +1. `conf` es statsTecnica().
function bonoApoyoConcordancia(tipo, conf) {
  const base = { guardia: conf.guardia, fortificacion: conf.defensa, esquiva: conf.esquiva, control: conf.controlBono }[tipo];
  if (!Number.isFinite(base) || base <= 0) return 0;
  return Math.max(1, Math.ceil(base * CONCORDANCIA.apoyo));
}

function textoBonoConcordancia(combo, corto = false) {
  if (combo.bono === "daño") return corto ? `+${porcentajeUI(CONCORDANCIA.daño)}% daño` : `+${porcentajeUI(CONCORDANCIA.daño)}% de daño al primer objetivo si impacta`;
  if (combo.bono === "critico") return corto ? `+${CONCORDANCIA.critico * 5}% crítico` : `+${CONCORDANCIA.critico * 5}% de crítico contra el primer objetivo`;
  return corto ? `${porcentajeUI(CONCORDANCIA.qi)}% del coste en qi` : `devuelve ${porcentajeUI(CONCORDANCIA.qi)}% del coste en qi (mínimo 1)`;
}

// Secuencias que un juego de técnicas puede ejecutar: el ORIGEN debe ser una
// arte pura (sólo ellas preparan eco) y el DESTINO cualquier arte, pura o Definitiva.
function secuenciasDisponibles(ids) {
  const preparan = new Set(), reciben = new Set();
  for (const tid of ids) {
    const t = TECNICAS[tid]; if (!t) continue;
    if (!t.elementos) preparan.add(t.elemento);
    for (const el of elementosDeTecnica(t)) reciben.add(el);
  }
  return Object.entries(SECUENCIAS_ELEMENTALES).filter(([par]) => {
    const [desde, hacia] = par.split(":");
    return preparan.has(desde) && reciben.has(hacia);
  });
}
const ESTADO_LABEL = {
  quemadura: "quemadura", veneno: "veneno", esquiva: "paso",
  guardia: "piel", defensa: "defensa", atadura: "atado", debil: "empapado",
  dano: "daño", ataque: "ataque", tenacidad: "tenacidad",
};

// CONTRATO DE ESTADOS DE COMBATE · v39
// - Cada categoría es independiente: evasión, defensa, absorción, daño, etc.
//   pueden coexistir. Aplicar una categoría NUNCA elimina otra distinta.
// - Por defecto, volver a aplicar LA MISMA categoría reemplaza/refresca sólo
//   esa categoría. Un efecto futuro puede optar por modoAcumulacion:"acumular".
// - La UI se deriva de estos metadatos y no necesita conocer cada técnica.
//   Esto deja preparada la base para buffs de daño/ataque futuros.
const ESTADO_COMBATE_UI = {
  esquiva:   { clase: "buff",    corto: "EVA",  simbolo: "↑" },
  defensa:   { clase: "buff",    corto: "DEF",  simbolo: "◆" },
  guardia:   { clase: "buff",    corto: "ABS",  simbolo: "◇" },
  dano:      { clase: "buff",    corto: "DAÑO", simbolo: "↑" },
  ataque:    { clase: "buff",    corto: "ATQ",  simbolo: "↑" },
  tenacidad: { clase: "buff",    corto: "TEN",  simbolo: "◆" },
  quemadura: { clase: "debuff",  corto: "QUEM", simbolo: "♨" },
  veneno:    { clase: "debuff",  corto: "VEN",  simbolo: "☠" },
  debil:     { clase: "debuff",  corto: "ATQ",  simbolo: "↓" },
  atadura:   { clase: "control", corto: "ATADO",simbolo: "×" },
};

// ABSORCIÓN (estado "guardia") · v52
// Evasión y defensa duran RONDAS y bajan en tick(). La absorción no: es una burbuja con una
// reserva de daño que SÓLO se gasta con el daño que realmente absorbe. No hay contador de
// impactos ni de turnos: mientras quede reserva, la burbuja sigue en pie.
//   · params.reduccion   tope que absorbe por golpe.
//   · params.capacidad   daño total que todavía puede absorber (capacidadMax = valor inicial).
//   · `duracion`         en las técnicas sólo es el multiplicador con el que nació la reserva
//                        (capacidad = golpe × duración); no se decrementa en ningún momento.
// Se disipa cuando la capacidad llega a 0. Un ataque que falla no la toca.
// DEFENDER es la excepción: por porcentaje y sin reserva, protege los próximos 2 golpes reales
// (params.reduccionInicial / reduccionSegundo; aquí `duracion` sí son los golpes que quedan).
function capacidadGuardia(golpe, multiplicador) {
  return Math.max(0, Math.floor(Number(golpe) || 0)) * Math.max(1, Math.floor(Number(multiplicador) || 1));
}
// Lo que enseñan los registros de "estados activos": la burbuja muestra su reserva restante;
// DEFENDER, los golpes que le quedan; el resto de estados, los turnos.
function restoEstadoActivo(st = {}) {
  if (st.tipo !== "guardia") return String(st.duracion);
  const p = st.params || {};
  if (Number.isFinite(p.capacidad)) return `${p.capacidad}${Number.isFinite(p.capacidadMax) ? `/${p.capacidadMax}` : ""}`;
  return `${Math.max(0, Math.floor(Number(st.duracion) || 0))} imp.`;
}

function descriptorEstadoCombate(st = {}, { afliccion = false } = {}) {
  const tipo = String(st.tipo || "estado");
  const meta = ESTADO_COMBATE_UI[tipo] || {
    clase: st.clase || st.tipoUI || "neutro",
    corto: st.corto || tipo.toUpperCase(),
    simbolo: st.simbolo || "·",
  };
  const p = st.params || {};
  const dur = Math.max(0, Math.floor(Number(st.duracion) || 0));
  let valor = st.valorTexto ? ` ${st.valorTexto}` : "";
  if (!valor && tipo === "esquiva" && Number.isFinite(p.bono)) valor = ` +${p.bono}%`;
  else if (!valor && tipo === "defensa" && Number.isFinite(p.bono)) valor = ` +${p.bono}`;
  else if (!valor && tipo === "guardia") {
    if (Number.isFinite(p.capacidad)) valor = ` ${p.capacidad}${Number.isFinite(p.capacidadMax) ? `/${p.capacidadMax}` : ""}`;
    else if (Number.isFinite(p.reduccion)) valor = ` ${p.reduccion}`;
    else if (Number.isFinite(p.reduccionInicial)) {
      const porc = dur >= 2 ? p.reduccionInicial : (p.reduccionSegundo ?? p.reduccionInicial);
      valor = ` ${porc}%`;
    }
  } else if (!valor && (tipo === "dano" || tipo === "ataque") && Number.isFinite(p.bono)) {
    valor = ` +${p.bono}${p.porcentaje ? "%" : ""}`;
  } else if (!valor && tipo === "debil" && Number.isFinite(p.ataque)) valor = ` ${p.ataque > 0 ? "+" : ""}${p.ataque}`;
  else if (!valor && (tipo === "quemadura" || tipo === "veneno") && (p.daño || st.daño)) valor = ` ${dadoARango(p.daño || st.daño)}/T`;

  const nombre = st.nombre || (afliccion ? st.nombre : null) || ({
    esquiva: "Evasión aumentada", defensa: "Defensa aumentada", guardia: "Absorción de daño",
    dano: "Potenciación de daño", ataque: "Ataque aumentado", tenacidad: "Tenacidad",
    quemadura: "Quemadura", veneno: "Veneno", debil: "Ataque reducido", atadura: "Atadura",
  }[tipo] || capitalizarUI(tipo));
  // La burbuja de absorción no tiene turnos: el chip enseña su reserva restante. Sólo DEFENDER
  // (sin reserva) enseña los golpes que le quedan. El resto de estados sigue mostrando turnos.
  const burbuja = tipo === "guardia" && Number.isFinite(p.capacidad);
  const porGolpes = tipo === "guardia" && !burbuja;
  const sufijoChip = burbuja ? "" : !dur ? "" : porGolpes ? ` · ${dur} imp.` : ` · ${dur}T`;
  const sufijoTitulo = burbuja
    ? `${Number.isFinite(p.reduccion) ? ` · hasta ${p.reduccion} por golpe` : ""} · reserva restante${Number.isFinite(p.capacidadMax) ? ` de ${p.capacidadMax}` : ""}`
    : !dur ? "" : porGolpes ? ` · ${dur} golpe${dur === 1 ? "" : "s"} restante${dur === 1 ? "" : "s"}`
    : ` · ${dur} turno${dur === 1 ? "" : "s"}`;
  const texto = `${meta.simbolo} ${meta.corto}${valor}${sufijoChip}`;
  const titulo = `${nombre}${valor ? ` · ${meta.corto}${valor}` : ""}${sufijoTitulo}${st.origen ? ` · Origen: ${st.origen}` : ""}`;
  return { texto, titulo, clase: meta.clase };
}
