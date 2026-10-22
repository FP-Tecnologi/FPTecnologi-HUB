# Fimav web v2c (ajustes del hero y de los títulos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajustar `apps/fimav-web` según el último pedido del usuario: hero sin controles visibles, con 2 fotos hexagonales a los lados de la espiral (sin foto en el centro) que cambian con cada diapositiva, espiral que gira sin parar y sin reiniciarse, sliders que avanzan solos, subtítulo antes del título en las secciones, y "Información legal" → "Legales" en el pie.

**Architecture:** Cambios acotados sobre `src/components/home/HeroSlider.tsx`, `src/components/slider/Carrusel.tsx`, `src/components/SeccionTitulo.tsx`, `src/components/Footer.tsx` y las páginas que usan `SeccionTitulo`.

**Spec:** mensaje del usuario del 2026-10-22; hereda las restricciones de `docs/superpowers/plans/2026-10-21-fimav-web-v2.md` y `...v2b.md`.

## Global Constraints

- Paleta estricta, solo modo claro, AA, hexágonos con vértices redondeados, sin dependencias nuevas, un `h1` y un `main` por página, foco visible, objetivos ≥44px, sin scroll horizontal (320–1920).
- Los controles del hero **no se ven** (sin flechas, puntos ni botón de pausa visibles), pero se mantiene la accesibilidad: teclado (←/→ con el hero enfocado), pausa automática con hover/foco/toque, respeto a `prefers-reduced-motion` y un botón de pausa **solo visible al recibir foco de teclado** (`sr-only focus-visible:not-sr-only`) para cumplir WCAG 2.2.2. Se explica al usuario.
- Espiral: UNA sola, fuera de las diapositivas, con rotación continua (`animation: giro Ns linear infinite`) que **nunca** se pausa ni se reinicia al cambiar de diapositiva ni al pausar el carrusel; solo se detiene con `prefers-reduced-motion: reduce`.
- Subtítulo ANTES del título (como "eyebrow" en mayúscula, fuente display, tracking amplio, `text-rojo-hondo` sobre claro o blanco sobre carbón); el título debajo con el estilo actual (mayúscula, display, dos tonos).
- Commits en español con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; no `.env*` ni `apps/quamtu-web/.impeccable/`.

### Task 12: Hero, sliders, subtítulos y pie

**Files:** Modify `HeroSlider.tsx`, `Carrusel.tsx`, `DatosConfianza.tsx`, `SeccionTitulo.tsx`, `Footer.tsx`, estilos en `globals.css`.

- [ ] **Step 1: investigar por qué los sliders no avanzan solos.** Reproducir en el navegador (esperar > 2 intervalos): comprobar `matchMedia('(prefers-reduced-motion: reduce)')` (si el sistema del usuario tiene "mostrar animaciones" desactivado, el autoavance y la rotación se apagan: documentarlo), el estado `pausaUsuario/encima/foco/visible`, el IntersectionObserver y `document.hidden`. Corregir lo que impida el avance automático (hero ~6 s, datos de confianza ~8 s) y probar con temporizadores reales; informar los intervalos medidos.
- [ ] **Step 2: hero.** Quitar visualmente flechas, puntos y pausa (mantener teclado y el botón de pausa visible solo con foco de teclado); mantener el avance automático con transición suave. Estructura: título/descripción/botones a la izquierda; a la derecha UNA espiral (rotación infinita continua, no reiniciable) **sin foto en el centro** y **2 fotos hexagonales a los lados** (como en el hero anterior: una arriba-izquierda y otra abajo-derecha, flotando suave) que **cambian con cada diapositiva** (4 pares de fotos de `/fotos/*`, p. ej. escritorios+notebooks, servidores+networking, contenedor+monitores, impresoras+consumibles; elegir las mejores tras verlas). En móvil: espiral más pequeña con las 2 fotos reducidas, sin desbordar.
- [ ] **Step 3: subtítulo antes del título** en `SeccionTitulo` (nueva prop de orden o reorden por defecto): eyebrow en mayúscula arriba, título debajo; aplicar a todas las secciones y páginas (inicio, nosotros, catálogo, perú compras, cotizar, contacto, libro, legales, categorías) sin romper el orden de encabezados ni los contrastes (calcular AA).
- [ ] **Step 4: pie.** Cambiar el título de columna "Información legal" por "Legales".
- [ ] **Step 5: verificación.** `npm run lint`, `npm run build` (reiniciar dev), capturas 1280/768/375 de dos diapositivas, medición de que la espiral no se detiene ni se reinicia (leer `getComputedStyle(spiral).animationName/animationPlayState` y el ángulo cada 2 s durante un cambio de diapositiva), autoavance medido, sin scroll horizontal, un h1, consola limpia en pestaña nueva. Commit `Fimav web: hero con 2 fotos laterales y espiral continua, subtítulos antes del título y pie con Legales`.
