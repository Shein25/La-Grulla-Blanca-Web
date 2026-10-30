# La Grulla Blanca — juego web (R2–R18)

Este repositorio público contiene **solo la distribución web compilada del juego**. El proyecto de desarrollo original, su historial y sus respaldos permanecen en un repositorio privado.

## Jugar en GitHub Pages

Después de habilitar Pages, abrí:

**https://shein25.github.io/La-Grulla-Blanca-Web/**

Para activar el sitio por primera vez desde GitHub:

1. Abrí [Settings → Pages](https://github.com/Shein25/La-Grulla-Blanca-Web/settings/pages).
2. En **Build and deployment**, elegí **Source: Deploy from a branch**.
3. Seleccioná **Branch: main** y carpeta **/(root)**, y presioná **Save**.
4. GitHub Pages publicará automáticamente `index.html` con todos sus archivos estáticos.

Los archivos ya están desplegados en la rama main y **no necesitan Node.js ni servidor local** para jugar una vez habilitado Pages.

## Distribución verificada

- Compilación modular experimental R2–R18, extraída del ZIP entregado.
- 331 archivos comprobados contra `MANIFIESTO_SHA256.json` antes de instalarse en main.
- `index.html`, `assets/`, `data/`, `rituals/` y `runtime-manifest.json` publicados.
- [Última ejecución de publicación verificada](https://github.com/Shein25/La-Grulla-Blanca-Web/actions/runs/41083780995): **SUCCESS**.
- Estado de WORLD: bloqueado. Esta publicación no certifica todos los recorridos del Arco 1.

## Partidas guardadas

GitHub Pages utiliza su propio origen web. Las partidas anteriores de `localhost` o de `file://` **no se trasladan automáticamente**: conservarlas o importarlas requiere usar los mecanismos de exportación/importación del juego.

## Actualizar el juego

El workflow `.github/workflows/publicar-web.yml` verifica el ZIP `WEB_GRULLA_PUBLICAR_EN_GITHUB.zip` y copia únicamente los archivos públicos al directorio raíz. Para publicar otra versión, hay que reemplazar el ZIP por una compilación aprobada y volver a ejecutar el workflow. La actualización automática desde el repositorio privado todavía no está configurada.
