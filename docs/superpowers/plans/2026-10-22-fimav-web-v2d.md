# Fimav web v2d (banner de página en cada página interna) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que cada página interna de `apps/fimav-web` empiece con un hero banner pequeño (franja con el título de la página) para distinguir bien el encabezado de cada página, como pidió el usuario.

**Architecture:** Un componente `BannerPagina` (servidor) reutilizable que reemplaza el `SeccionTitulo nivel="h1"` del inicio de cada página interna; hereda las restricciones de `2026-10-21-fimav-web-v2.md`, `-v2b.md` y `-v2c.md`.

**Spec:** mensaje del usuario del 2026-10-22: "quiero que en cada página se agregue hero banner pequeño así se distingue bien el encabezado".

## Global Constraints

- Paleta estricta (rojo #E02424, rojo profundo #C02020, botón #C91F1F con texto blanco, carbón #38383C, tinta #111, gris #F3F3F4, plata, blanco), solo modo claro, AA, hexágonos con vértices redondeados, sin dependencias nuevas, un `h1` y un `<main>` por página, foco visible, sin scroll horizontal (320–1920), `prefers-reduced-motion` respetado, contenido visible sin JS.
- Texto rojo pequeño nunca sobre carbón; sobre carbón títulos blancos y eyebrow en blanco/plata (`claroSobreOscuro`).
- El banner debe ser **pequeño** (alto ~160–220px escritorio, ~120–160px móvil), no debe duplicar el h1 ni empujar el contenido más de lo necesario; la cabecera fija (sticky, ~57px) no debe taparlo ni los anclajes.
- Commits en español con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; no `.env*` ni `apps/quamtu-web/.impeccable/`.

### Task 13: BannerPagina en todas las páginas internas

**Files:** Create `src/components/BannerPagina.tsx`; Modify `src/app/{nosotros,catalogo,peru-compras,cotizar,contacto,libro-de-reclamaciones}/page.tsx`, `src/app/catalogo/[categoria]/page.tsx`, `src/app/legal/[slug]/page.tsx`, `globals.css` si hace falta.

- [ ] **Step 1:** `BannerPagina({ titulo, resaltado?, subtitulo?, migas? })`: franja a todo el ancho, fondo carbón (#38383C) con un corte hexagonal redondeado abajo (reutilizar `CorteHex` o una variante) y motivos del brochure (espiral/contorno rojo parcialmente recortada en el borde derecho, hexágonos en línea fina plata/rojo a baja opacidad, decorativos `aria-hidden`); eyebrow (subtítulo) arriba en mayúscula, título abajo en blanco con una palabra clave en rojo si el contraste lo permite (rojo #E02424 sobre carbón es 2.47:1: NO usarlo para texto; usar blanco + barra roja decorativa, o plata/blanco); migas de pan accesibles (`<nav aria-label="Ruta de navegación">`, Inicio › Página, `aria-current="page"`); entrada suave CSS (`.entrada`, solo transform/opacity). El título es el **único h1** de la página.
- [ ] **Step 2:** Reemplazar el bloque de título (h1) del inicio de cada página interna por `BannerPagina` con su título/subtítulo actuales; para `/catalogo/[categoria]` incluir el nombre de la categoría y la miga Catálogo › Categoría; para legales, el título de cada documento. El contenido que sigue conserva su espaciado (sin doble margen). No tocar el inicio `/` (ya tiene su hero).
- [ ] **Step 3:** Verificación: `npm run lint`, `npm run build` (reiniciar dev), capturas 1280/768/375 de `/nosotros`, `/catalogo`, una categoría, `/peru-compras`, `/cotizar`, `/contacto`, `/libro-de-reclamaciones`, un legal; un h1 y un main por página; sin scroll horizontal; contraste AA de título/eyebrow/migas sobre carbón (calcular); foco con Tab en las migas visible (outline blanco sobre carbón); consola limpia en pestaña nueva; anclajes y `scroll-padding` correctos. Commit `Fimav web: banner pequeño de página en cada página interna`.
