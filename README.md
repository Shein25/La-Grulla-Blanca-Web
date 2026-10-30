# La Grulla Blanca — juego web modular R2–R18

Repositorio **público únicamente para la distribución compilada**. El código fuente de desarrollo, historia, herramientas y respaldos permanecen en `Shein25/La-Grulla-Blanca` (privado).

## Publicación sin ejecutar nada en la PC

1. Descargar `WEB_GRULLA_PUBLICAR_EN_GITHUB.zip` (paquete de distribución previamente verificado).
2. Subir el ZIP **sin extraer y con el mismo nombre** a la raíz de este repositorio usando **Add file → Upload files → Commit changes**.
3. El workflow [Publicar La Grulla Blanca Web](./.github/workflows/publicar-web.yml) extrae el ZIP en GitHub Actions, comprueba 331 hashes SHA-256 y publica los archivos mediante GitHub Pages.
4. En **Settings → Pages**, seleccionar **Source: GitHub Actions** si GitHub no habilita Pages automáticamente.
5. Abrir [La Grulla Blanca Web](https://shein25.github.io/La-Grulla-Blanca-Web/) **solo cuando GitHub confirme la publicación**.

**No es necesario Node.js ni ejecutar scripts locales para jugar.** El ZIP debe conservar el nombre `WEB_GRULLA_PUBLICAR_EN_GITHUB.zip` para activar el workflow.

## Estado del contenido

- Build modular experimental R2–R18, con `index.html`, módulos JavaScript, CSS, datos y rituales separados.
- Distribución identificada mediante manifiesto de 331 hashes; WORLD sigue bloqueado.
- Esta entrega no constituye la certificación global de Arco 1.
- Las partidas quedan en el almacenamiento del navegador para este origen y no se importan automáticamente desde localhost.

El repositorio es público: los archivos web necesarios para jugar están disponibles a cualquier visitante, como ocurre con cualquier juego HTML/JavaScript publicado en la web.
