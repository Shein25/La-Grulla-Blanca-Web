const historial = [];
let hIdx = -1;

function enviarComando(limpio) {
  if (/^(mapa|atlas)$/i.test(limpio.trim())) { juego.abrirAtlas(); return; }
  if (/^(tecnicas|técnicas|meridianos)$/i.test(limpio.trim())) { juego.abrirMeridianos(); return; }
  if (/^(misiones|misión|mision)$/i.test(limpio.trim())) { juego.abrirMisiones(); return; }
  if (/^(oficios|oficio|profesiones|profesión|profesion)$/i.test(limpio.trim())) { juego.abrirOficios(); return; }
  if (/^(cultivo|cultivar)$/i.test(limpio.trim())) { juego.abrirCultivo(); return; }
  if (/^recetas$/i.test(limpio.trim())) { juego.abrirOficios("alquimia"); return; }
  // Mientras hay combate, el terminal queda detrás exactamente como estaba:
  // ni el eco del comando ni nada del turno le llega (ver §7 del contrato).
  const pilotRoute=astraGeneralNative.beginInput(juego,limpio);
  if(pilotRoute==='INVALIDATED'){if(juego.pregunta===null){entrada.placeholder=PLACEHOLDER_BASE;entrada.removeAttribute('maxlength');}return;}
  if (!juego.combate && pilotRoute==='NOT_HANDLED') juego.eco(limpio);
  historial.push(limpio);
  hIdx = -1;

  if (juego.terminado) {
    juego.salida("La partida terminó. Recarga la página (F5) para volver a la montaña.");
    return;
  }
  if (juego.pregunta) {
    const preg = juego.pregunta;
    const mc = preg.multipleChoice;
    if (mc && Array.isArray(mc.opciones) && mc.opciones.length) {
      // Validación centralizada: NINGÚN callback de elección múltiple debe
      // recibir una respuesta inválida. Antes, cada callback tenía su propio
      // `|| opciones[0]` de respaldo, que silenciosamente convertía cualquier
      // texto no reconocido (ej. "a") en la primera opción. Se corta acá,
      // sin consumir la pregunta, para que el jugador pueda reintentar.
      const valores = mc.opciones.map(o => String(o?.valor ?? "").trim()).filter(Boolean);
      const elegido = limpio.trim();
      if (!valores.includes(elegido)) {
        juego.salida(`Esa no es una opción válida. Elegí: ${valores.join("/")}.`, "error");
        return;
      }
      const elegida = mc.opciones.find(o => String(o?.valor ?? "").trim() === elegido);
      if (elegida?.texto && pilotRoute==='NOT_HANDLED') juego.salida(`» ${elegida.insignia ? elegida.insignia + " " : ""}${elegida.texto}`, "eco");
    }
    const cb = preg.callback;
    juego.pregunta = null;
    juego.desactivarEleccionActiva();
    entrada.placeholder = PLACEHOLDER_BASE;
    entrada.removeAttribute("maxlength");
    try { cb(limpio); }
    catch (ex) { juego.salida(`[error] ${ex.message}`, "error"); }
  } else {
    const [verbo, args] = parse(limpio);
    if (verbo === "salir") juego.flujoSalir();
    else {
      try { juego.ejecutar(verbo, args); }
      catch (ex) { juego.salida(`[error] ${ex.message}`, "error"); }
    }
  }
  juego.recordarAtlas();
  juego.actualizarBarra();
  juego.actualizarPanel();
  juego.abajo();
  entrada.focus();
}

document.getElementById("form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const limpio = entrada.value.trim();
  entrada.value = "";
  if (!limpio) return;
  enviarComando(limpio);
});

document.getElementById("btnTecnicas").addEventListener("click", () => juego.abrirMeridianos());
document.getElementById("merCerrar").addEventListener("click", () => juego.cerrarMeridianos());
document.getElementById("merBusqueda").addEventListener("input", () => juego.renderMeridianos());
for (const [id, tab] of [["merTabTecnicas", "tecnicas"], ["merTabBuilds", "builds"]]) {
  document.getElementById(id).addEventListener("click", () => {
    // Cambiar de pestaña no consume turnos, no cierra el diálogo y conserva la
    // selección de cada vista.
    juego.merTab = tab;
    juego.merForm = null;
    juego.merConfirm = null;
    juego.renderMeridianos();
    document.getElementById("merAviso").textContent = "";
  });
}
document.getElementById("meridianos").addEventListener("click", ev => {
  if (ev.target === document.getElementById("meridianos")) juego.cerrarMeridianos();
});
document.getElementById("meridianos").addEventListener("cancel", ev => {
  ev.preventDefault();
  juego.cerrarMeridianos();
});
document.getElementById("btnMapa").addEventListener("click", () => juego.abrirAtlas());
document.getElementById("atlasCerrar").addEventListener("click", () => juego.cerrarAtlas());
document.getElementById("atlas").addEventListener("click", ev => {
  if (ev.target === document.getElementById("atlas")) juego.cerrarAtlas();
});
document.getElementById("atlas").addEventListener("cancel", ev => {
  ev.preventDefault();
  juego.cerrarAtlas();
});
document.getElementById("btnMisiones").addEventListener("click", () => juego.abrirMisiones());
document.getElementById("misCerrar").addEventListener("click", () => juego.cerrarMisiones());
document.getElementById("misContraer").addEventListener("click", () => juego.contraerMisiones());
document.getElementById("registroMisiones").addEventListener("click", ev => {
  if (ev.target === document.getElementById("registroMisiones")) juego.cerrarMisiones();
});
document.getElementById("registroMisiones").addEventListener("cancel", ev => {
  ev.preventDefault();
  juego.cerrarMisiones();
});
document.getElementById("btnCultivo").addEventListener("click", () => juego.abrirCultivo());
document.getElementById("cultCerrar").addEventListener("click", () => juego.cerrarCultivo());
for (const [id, tab] of [["cultTabEstado", "estado"], ["cultTabCamino", "camino"], ["cultTabArcos", "arcos"]]) {
  document.getElementById(id).addEventListener("click", () => {
    // Cambiar de pestaña no consume turnos ni cierra el diálogo.
    juego.cultTab = tab;
    juego.renderCultivo();
  });
}
document.getElementById("cultivo").addEventListener("click", ev => {
  if (ev.target === document.getElementById("cultivo")) juego.cerrarCultivo();
});
document.getElementById("cultivo").addEventListener("cancel", ev => {
  ev.preventDefault();
  juego.cerrarCultivo();
});
document.getElementById("btnOficios").addEventListener("click", () => juego.abrirOficios());
document.getElementById("ofiCerrar").addEventListener("click", () => juego.cerrarOficios());
document.getElementById("oficios").addEventListener("click", ev => {
  if (ev.target === document.getElementById("oficios")) juego.cerrarOficios();
});
document.getElementById("oficios").addEventListener("cancel", ev => {
  ev.preventDefault();
  juego.cerrarOficios();
});
document.getElementById("interaccionCerrar").addEventListener("click", () => juego.cerrarInteraccionOficio());
// Fase de captura: se anota la posición del control pulsado ANTES de que su
// manejador vuelva a pintar la interfaz (ver recordarAnclaInteraccion).
document.getElementById("interaccionDetalle").addEventListener("click", ev => juego.recordarAnclaInteraccion(ev), true);
document.getElementById("interaccionOficio").addEventListener("click", ev => {
  if (ev.target === document.getElementById("interaccionOficio")) juego.cerrarInteraccionOficio();
});
document.getElementById("interaccionOficio").addEventListener("cancel", ev => {
  ev.preventDefault();
  juego.cerrarInteraccionOficio();
});
document.getElementById("atlasCentrar").addEventListener("click", () => juego.centrarCapaAtlas());
document.getElementById("atlasArea").addEventListener("change", ev => juego.elegirAreaAtlas(ev.target.value));
document.getElementById("atlasCapa").addEventListener("change", ev => juego.elegirCapaAtlas(ev.target.value));
document.getElementById("atlasZoomMas").addEventListener("click", () => juego.zoomMapaAtlas(1.35));
document.getElementById("atlasZoomMenos").addEventListener("click", () => juego.zoomMapaAtlas(1 / 1.35));

// Mapa desplazable: arrastrar con ratón, lápiz o dedo. Un movimiento menor que el umbral sigue siendo
// un clic normal sobre la sala; al arrastrar de verdad se anula el clic para no seleccionar por accidente.
(() => {
  const vista = document.getElementById("atlasVista"), UMBRAL = 5;
  let arrastre = null, anularClic = false;
  vista.addEventListener("pointerdown", ev => {
    if (!vista.classList.contains("atlas-mapa-activo") || (ev.pointerType === "mouse" && ev.button !== 0)) return;
    arrastre = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, activo: false };
  });
  vista.addEventListener("pointermove", ev => {
    if (!arrastre || ev.pointerId !== arrastre.id) return;
    const dx = ev.clientX - arrastre.x, dy = ev.clientY - arrastre.y;
    if (!arrastre.activo) {
      if (Math.hypot(dx, dy) < UMBRAL) return;
      arrastre.activo = true;
      vista.setPointerCapture?.(ev.pointerId);
      vista.classList.add("arrastrando");
    }
    arrastre.x = ev.clientX; arrastre.y = ev.clientY;
    juego.desplazarMapaAtlas(dx, dy);
  });
  const soltar = ev => {
    if (!arrastre || ev.pointerId !== arrastre.id) return;
    if (arrastre.activo) { anularClic = true; setTimeout(() => { anularClic = false; }, 0); }
    vista.releasePointerCapture?.(ev.pointerId);
    vista.classList.remove("arrastrando");
    arrastre = null;
  };
  vista.addEventListener("pointerup", soltar);
  vista.addEventListener("pointercancel", soltar);
  vista.addEventListener("click", ev => { if (anularClic) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  // Ruedita del mouse sobre el marco del mapa: acerca/aleja centrado en el puntero.
  vista.addEventListener("wheel", ev => {
    if (!vista.classList.contains("atlas-mapa-activo")) return;
    ev.preventDefault();
    juego.zoomMapaAtlas(ev.deltaY < 0 ? 1.12 : 1 / 1.12, ev.clientX, ev.clientY);
  }, { passive: false });
  // Al abrir el diálogo o cambiar el tamaño de la ventana el marco cambia de medidas: se reencuadra.
  if (typeof ResizeObserver === "function") new ResizeObserver(() => juego.ajustarCamaraAtlas()).observe(vista);
  document.getElementById("mapaSvg").addEventListener("focusin", ev => {
    const el = ev.target.closest?.(".mapa-nodo, .mapa-transicion");
    if (el) juego.revelarEnMapaAtlas(el);
  });
})();
document.getElementById("atlasBusqueda").addEventListener("input", () => juego.renderAtlas());
for (const nombre of ["Mapa", "Lugares", "Personas", "Bestiario"]) {
  document.getElementById("atlasTab" + nombre).addEventListener("click", () => juego.cambiarPestanaAtlas(nombre));
}

document.getElementById("btnGuardar").addEventListener("click", () => {
  if (!juego.terminado && !juego.pregunta) juego.eco("[GUARDAR]");
  juego.menuGuardar();
  entrada.focus();
});
document.getElementById("btnCargar").addEventListener("click", () => {
  if (!juego.terminado && !juego.pregunta) juego.eco("[CARGAR]");
  juego.menuCargar();
  entrada.focus();
});
document.getElementById("btnNueva").addEventListener("click", () => {
  if (!juego.terminado && !juego.pregunta) juego.eco("[NUEVA]");
  juego.menuNueva();
  entrada.focus();
});

entrada.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowUp" && historial.length) {
    ev.preventDefault();
    hIdx = hIdx < 0 ? historial.length - 1 : Math.max(0, hIdx - 1);
    entrada.value = historial[hIdx];
  } else if (ev.key === "ArrowDown" && hIdx >= 0) {
    ev.preventDefault();
    hIdx++;
    if (hIdx >= historial.length) { hIdx = -1; entrada.value = ""; }
    else entrada.value = historial[hIdx];
  }
});

document.getElementById("terminal").addEventListener("click", () => {
  if (!window.getSelection().toString()) entrada.focus();
});

const validacion329 = auditarMundoCompleto();
if (!validacion329.ok) throw new Error(validacion329.errores.join(" · "));
juego.arranque();
entrada.focus();
