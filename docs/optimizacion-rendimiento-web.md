# Optimización de rendimiento de las webs públicas

Objetivo: que las webs carguen rápido y carguen poco al servidor (cPanel con poca RAM) **sin perder calidad**:
nada de recomprimir fotos con pérdida visible, ni bajar la resolución de videos, ni quitar efectos.

## Por qué no Turbopack

Turbopack es el empaquetador del build y del dev; no precarga ni cachea nada para el visitante.
El build de `web-fptecnologi` usa `--webpack` a propósito: el hosting tiene poca RAM y Linux antiguo.
Lo que mejora la carga real es caché, medios y menos JS inicial.

## Hecho (2026-11-05)

| Cambio | Dónde | Efecto |
| --- | --- | --- |
| Caché larga (30 días + `stale-while-revalidate`) para carpetas de `public/` | `next.config.mjs` de `web-fptecnologi`, `fimav-web`, `kelqa-web` | Next servía `public/` con `max-age=0`: el navegador revalidaba cada imagen y fuente en cada visita. |
| Home con ISR de 30 s (`revalidate = 30`, antes `force-dynamic`) | `app/page.tsx`, `src/lib/homeContenido.ts` | La home ya no se renderiza en cada visita. El editor del dashboard (`/api/cms/home`) pide datos frescos (`getHomeContenido(true)`). |
| Widgets flotantes cargados diferidos (`next/dynamic`, `ssr: false`) | `src/components/site/WidgetsDiferidos.tsx` | Chat, popups, popup BBVA y favoritos salen del JS inicial. |
| Partículas diferidas | `src/components/home/ParticlesDiferido.tsx` | tsparticles se baja después del primer pintado. |
| `preload="metadata"` en videos de hero | `home/Hero.tsx`, `site/PageHero.tsx` | No descarga el MP4 entero antes de que haga falta; sigue reproduciéndose igual. |
| Logo ViewSonic: SVG de 1.2 MB → WebP 1200 px calidad 95 (~80 KB) | `public/images/marcas/viewsonic.webp`, `src/lib/content.ts` | Era un dibujo (aves) vectorizado con 5 325 trazados; se ve idéntico (1200 px para una caja de 84 px). Revisado en el navegador con el efecto hover y la máscara. |

## Efecto a tener en cuenta

Un cambio guardado en el CMS tarda hasta 30 s en verse en la web pública. Si la vista previa del dashboard necesita
verlo al instante: añadir revalidación bajo demanda (`revalidateTag`) o dejar esa vista sin caché.

## Pendiente / ideas (no tocar sin comparar antes y después)

- **Cloudflare (plan gratis) delante del dominio**: cachea estáticos e imágenes; es la palanca más grande contra la carga del servidor.
- Dependencias sin uso aparente en `web-fptecnologi`: `gsap`, `motion`, `swiper`, `groq-sdk` (no se importan en `src/` ni `app/`; `groq-sdk` puede usarse en rutas de API, verificar). Quitarlas reduce `npm install`/build.
- `prebuild` corre `npm install` en cada build: valorar quitarlo si el hosting ya instala dependencias.
- `about.mp4` (1.2 MB): ya liviano; si se añaden videos más grandes, usar `poster` y no cargarlos en móvil.
- PNG de `public/wp-content/uploads` (150–280 KB c/u): no se referencian en `src/`; confirmar si algo en la base de datos los usa antes de borrarlos o convertirlos (renombrar rompería URLs guardadas).
- PDF de catálogos (23 MB): se sirven estáticos y solo bajan al abrirlos; no precargarlos.
- Medir antes/después con Lighthouse (LCP, TBT, peso) en producción.

## Reglas para no romper calidad

- No bajar `quality` de `next/image` por debajo del default (75) ni reducir tamaños de fotos de producto.
- Convertir a WebP solo con calidad ≥ 90 o lossless, y comparar a ojo antes de subir.
- Videos: no re-encodear con pérdida; solo ajustar `preload`/`poster`.
