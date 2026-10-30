const DIRECCIONES = ["norte", "sur", "este", "oeste", "arriba", "abajo"];

const SINONIMOS = {
  n: "norte", s: "sur", e: "este", o: "oeste", u: "arriba", d: "abajo",
  l: "examinar", mirar: "examinar", ver: "examinar",
  coger: "tomar", agarrar: "tomar",
  tirar: "soltar", descartar: "soltar",
  inv: "inventario", i: "inventario",
  vestir: "equipar", ponerse: "equipar",
  quitar: "desequipar",
  equ: "equipo", equipamiento: "equipo",
  matar: "atacar", pelear: "atacar", golpear: "atacar",
  bloquear: "defender", cubrirse: "defender", protegerse: "defender",
  cultivar: "meditar", hondo: "profundo",
  conversar: "hablar", decir: "hablar",
  dar: "entregar",
  leer: "estudiar",
  mision: "misiones", quest: "misiones",
  stats: "hoja", estadisticas: "hoja", estado: "hoja", ficha: "hoja",
  grabar: "guardar", save: "guardar",
  load: "cargar", restore: "cargar",
  "?": "ayuda", comandos: "ayuda", help: "ayuda",
  quit: "salir", exit: "salir",
  usar: "beber",
  tecnica: "tecnica", tecnicas: "tecnica",
  sleep: "dormir", rest: "descansar",
  refinar: "alquimia", fabricar: "alquimia", cocinar: "alquimia", caldero: "alquimia",
  receta: "recetas",
  oficio: "oficios", oficios: "oficios", profesion: "oficios", profesiones: "oficios",
  craftear: "alquimia", craft: "alquimia",
  faccion: "contribucion", facciones: "contribucion", merito: "contribucion",
  servicio: "servicios", intercambiar: "canjear",
};

const ARTICULOS = new Set(["el", "la", "los", "las", "un", "una", "del", "al", "de"]);

function quitaAcentos(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parse(raw) {
  let palabras = quitaAcentos(raw.toLowerCase()).trim().split(/\s+/)
    .filter(p => p && !ARTICULOS.has(p));
  if (!palabras.length) return ["", []];
  palabras = palabras.map(p => SINONIMOS[p] || p);
  const verbo = palabras[0], resto = palabras.slice(1);
  if (verbo === "ir" && resto.length) {
    const destino = SINONIMOS[resto[0]] || resto[0];
    if (DIRECCIONES.includes(destino)) return [destino, []];
  }
  return [verbo, resto];
}


// ============================================================================
//  SECCIÓN 4 · REGLAS
//  Cálculo puro: dados, impacto, crítico, barras, umbrales.
//  Mismas entradas, mismas salidas. Es lo más fácil de probar.
// ============================================================================


function tirar(notacion) {
  let total = 0;
  for (const parte of String(notacion).replace(/ /g, "").split("+")) {
    if (!parte) continue;
    if (parte.includes("d")) {
      const [nStr, carasStr] = parte.split("d");
      const n = nStr ? parseInt(nStr, 10) : 1;
      for (let i = 0; i < n; i++) total += 1 + Math.floor(Azar.random() * parseInt(carasStr, 10));
    } else {
      total += parseInt(parte, 10);
    }
  }
  return total;
}

function dadoARango(notacion) {
  let min = 0, max = 0;
  for (const parte of String(notacion).replace(/ /g, "").split("+")) {
    if (!parte) continue;
    if (parte.includes("d")) {
      const [nStr, carasStr] = parte.split("d");
      const n = nStr ? parseInt(nStr, 10) : 1;
      const caras = parseInt(carasStr, 10);
      if (!caras) continue;
      min += n; max += n * caras;
    } else {
      const b = parseInt(parte, 10);
      if (isNaN(b)) continue;
      min += b; max += b;
    }
  }
  return min === max ? `${min}` : `${min}–${max}`;
}

// Resume en una frase corta el efecto de la técnica de una criatura (daño extra,
// veneno, drenaje de qi...) para la ficha de MIRAR/EXAMINAR.
function describirTecnicaMob(t) {
  const partes = [];
  if (t.daño) partes.push(`${dadoARango(t.daño)} de daño`);
  if (t.veneno) partes.push(`${t.veneno.nombre || "veneno"}: ${dadoARango(t.veneno.daño)} durante ${t.veneno.turnos} acciones`);
  if (t.quemadura) partes.push(`${t.quemadura.nombre || "quemadura"}: ${dadoARango(t.quemadura.daño)} durante ${t.quemadura.turnos} acciones`);
  if (t.drenaQi) partes.push(`drena ${t.drenaQi} de qi`);
  return partes.length ? partes.join(" · ") : "un efecto que altera el combate";
}

function promedioDado(notacion) {
  let total = 0;
  for (const parte of String(notacion).replace(/ /g, "").split("+")) {
    if (!parte) continue;
    if (parte.includes("d")) {
      const [nStr, carasStr] = parte.split("d");
      const n = nStr ? parseInt(nStr, 10) : 1;
      const caras = parseInt(carasStr, 10);
      if (caras) total += n * (caras + 1) / 2;
    } else {
      const bono = parseInt(parte, 10);
      if (!isNaN(bono)) total += bono;
    }
  }
  return Math.round(total * 10) / 10;
}

function barra(actual, max, largo = 14) {
  if (max <= 0) return "";
  const llenos = Math.max(0, Math.min(largo, Math.round(actual / max * largo)));
  return "█".repeat(llenos) + "░".repeat(largo - llenos);
}

function capitalizarUI(texto) {
  return String(texto).replace(
    /^([^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]*)([a-záéíóúüñ])/u,
    (_, prefijo, letra) => prefijo + letra.toUpperCase()
  );
}

// Formato de título para nombres propios de recetas: "poción de sangre refinada"
// -> "Poción de Sangre Refinada" (las palabras de enlace quedan en minúscula).
const PALABRAS_MENORES_TITULO = new Set(["de","del","la","las","el","los","y","e","o","u","a","al","en","con","para","por"]);
function tituloReceta(texto) {
  return String(texto).split(" ").map((w, i) =>
    (i > 0 && PALABRAS_MENORES_TITULO.has(w.toLowerCase())) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)
  ).join(" ");
}

function capitalizarSegmentosUI(texto) {
  return capitalizarUI(texto).replace(
    /((?:·|→|\+)[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]*)([a-záéíóúüñ])/gu,
    (_, separador, letra) => separador + letra.toUpperCase()
  );
}

// Convierte el texto crudo de una sección de AYUDA en dos listas: "sintaxis"
// (líneas de referencia rápida, tal cual fueron escritas, sin tocar mayúsculas)
// y "notas" (viñetas que arrancan con "—", uniendo sus líneas de continuación
// indentadas en un solo párrafo). Se usa para renderizar una ficha en vez de
// un bloque de texto plano.
function parseAyudaTexto(texto) {
  const sintaxis = [];
  const notas = [];
  let enNotas = false;
  for (const cruda of String(texto).split("\n")) {
    const linea = cruda.replace(/\r$/, "");
    if (!linea.trim()) continue;
    if (linea.startsWith("—")) {
      enNotas = true;
      notas.push(linea.slice(1).trim());
    } else if (enNotas && /^\s{2,}/.test(linea) && notas.length) {
      notas[notas.length - 1] += " " + linea.trim();
    } else if (!enNotas) {
      sintaxis.push(linea.trim());
    } else {
      notas.push(linea.trim());
    }
  }
  return { sintaxis, notas };
}

const ESQUIVA_INNATA = 5;
const MULTIPLICADOR_CRITICO = 1.5;

function porcentajePrecision(bono) { return Math.max(0, Number(bono) || 0) * 5; }
function probabilidadCritico(critMin = 20) { return Math.max(0, Math.min(100, (21 - critMin) * 5)); }
function multiplicadorUI(valor) { return `×${String(valor).replace(".", ",")}`; }

function impactaConTirada(tirada, ataque, defensa, critMin = 20, esquiva = ESQUIVA_INNATA) {
  if (tirada === 1) return false;
  if (tirada === 20 || tirada >= critMin) return true;
  const evasionAdicional = Math.max(0, Math.round((esquiva - ESQUIVA_INNATA) / 5));
  return tirada + ataque >= defensa + evasionAdicional;
}

function probabilidadImpacto(ataque, defensa, critMin = 20, esquiva = ESQUIVA_INNATA) {
  let aciertos = 0;
  for (let tirada = 1; tirada <= 20; tirada++) {
    if (impactaConTirada(tirada, ataque, defensa, critMin, esquiva)) aciertos++;
  }
  return aciertos * 5;
}

function atacar(a, d, critMin = 20, critMult = MULTIPLICADOR_CRITICO) {
  const t = 1 + Math.floor(Azar.random() * 20);
  const critico = t !== 1 && t >= critMin;
  if (!impactaConTirada(t, a.ataque, d.defensa, critMin, d.esquiva ?? ESQUIVA_INNATA)) {
    return [`   ${a.name} ataca a ${d.name}... y falla.`, 0];
  }
  const danioBase = tirar(a.daño);
  const danio = critico ? Math.ceil(danioBase * critMult) : danioBase;
  const extra = critico ? " ¡CRÍTICO!" : "";
  return [`   ${a.name} golpea a ${d.name}: ${danio} de daño.${extra}`, danio];
}

function umbralesTecnica(tid) {
  return UMBRALES_POR_GRADO[TECNICAS[tid]?.rango] || UMBRALES_MAESTRIA;
}
function umbralMaestria(nivel, tid = null) {
  return (tid ? umbralesTecnica(tid) : UMBRALES_MAESTRIA)[nivel] ?? "?";
}


// ============================================================================
//  SECCIÓN 5 · MODELOS
//  Instanciar criaturas a partir de sus plantillas y resolverlas por nombre.
// ============================================================================


function crearMob(mid, plantilla, meta = {}) {
  return {
    name: plantilla.name, corto: plantilla.corto || plantilla.name, hp: plantilla.hp, max_hp: plantilla.hp,
    ataque: plantilla.ataque || 0, defensa: plantilla.defensa || 10,
    daño: plantilla.daño || "1d3", qi_recompensa: plantilla.qi || 0,
    loot: plantilla.loot || [], unico: !!plantilla.unico, desc: plantilla.desc || null,
    tecnica: plantilla.tecnica ? { ...plantilla.tecnica } : null, elemento: plantilla.elemento || null,
    mob_id: mid, es_jugador: false,
    errante_id: meta.erranteId || null,
    errante_desde: meta.erranteDesde || null,
    errante_movido_en: meta.erranteMovidoEn ?? null,
    fijo_id: meta.fijoId || null,
  };
}

function etiquetaMob(mob) {
  const numero = (mob.total_especie || 0) > 1 ? ` #${mob.indice_especie}` : "";
  const ronda = "";
  return `${mob.name}${numero}${ronda}`;
}

function resolverMobPorArgs(lista, args) {
  if (!args || !args.length) return null;
  const partes = [...args];
  const ultimo = partes[partes.length - 1];
  const numero = /^\d+$/.test(ultimo || "") ? Number(partes.pop()) : null;
  const texto = quitaAcentos(partes.join("_").toLowerCase());
  return (lista || []).find(mob => {
    if (mob.hp <= 0) return false;
    if (numero !== null && mob.indice_especie !== numero) return false;
    if (!texto) return numero !== null;
    return mob.mob_id.includes(texto)
      || quitaAcentos(mob.name.toLowerCase()).includes(texto)
      || quitaAcentos((mob.corto || "").toLowerCase()).includes(texto);
  }) || null;
}


// ============================================================================
//  SECCIÓN 6 · COMBATE
//  La pelea entera, sin una sola referencia al DOM. Recibe el Juego para
//  consultar estado y devuelve [texto, estado] por turno.
// ============================================================================


const MAX_LINEAS_LOG_COMBATE = 250;
