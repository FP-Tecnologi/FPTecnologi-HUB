# DESIGN.md — Sistema de diseño del dashboard (apps/web)

Base: plantilla **Vireo** (clases `ax-*`, ver [`VIREO-REFERENCE.md`](../../VIREO-REFERENCE.md))
con un estilo **fijo** para todo el sistema. Toda pantalla nueva se arma con
estas reglas y con los componentes/clases que ya existen — no se inventan
estilos nuevos ni CSS suelto si hay una clase `ax-*` que lo resuelve.
Referencia viva: `/chat/conversaciones` y `/chat/asesores`.

---

## 1. Estilo fijo (sin Personalización)

- El panel de **Personalización se quitó**: nadie cambia fuente, colores ni
  layout. El `ANTI_FLASH` de `app/layout.tsx` ignora lo guardado en
  localStorage y aplica siempre lo mismo.
- **Fuente:** Montserrat en todo (texto y títulos) — token `--ax-font-sans`
  en `src/styles/tokens/_recipes.css`, cargada en `app/layout.tsx`.
  `JetBrains Mono` solo para números/códigos (`var(--ax-font-mono)`).
- **Layout:** estilo **Separado** (`data-ax-shell-style="detached"`), menú
  vertical colapsable, resto de opciones en su valor por defecto.
- **Colores:** los de por defecto (acento "Azul logo"). Se usan siempre por
  token, nunca hex: `--ax-accent`, `--ax-text`, `--ax-text-strong`,
  `--ax-text-muted`, `--ax-text-subtle`, `--ax-surface`,
  `--ax-surface-subtle`, `--ax-border`, `--ax-danger-500`, `--ax-viz-*`.
- **Modo claro/oscuro:** sí queda (botón del encabezado). Todo debe verse
  bien en los dos → por eso solo tokens.
- Excepción de color: lo que representa a la **web pública** (chat) usa los
  colores de marca de fptecnologi para que se reconozca igual en los dos
  lados (ver §5).

## 2. Estructura de una pantalla

```tsx
<PageHead title="…" subtitle="…" actions={<button className="ax-btn ax-btn--primary">…</button>} />
<div className="ax-dash-grid">
  <section className="ax-card ax-col--4">…</section>   {/* 12 columnas */}
  <section className="ax-card ax-col--8">…</section>
</div>
```

- Ruta: `app/(shell)/<slug>/page.tsx` con `metadataForSlug('<slug>')` +
  pantalla en `src/screens/pages/<Nombre>.tsx` (`'use client'`).
- Menú: nodo en `src/data/nav-manifest.json` (una línea por nodo, mismo
  formato) con `roles` si es restringido. Íconos Tabler registrados en
  `src/components/ui/Icon.tsx`.
- Datos: `api.get/post/patch/delete` de `src/lib/api.ts` (ya manda token y
  `x-marca-id`); errores con `ApiError` en un `ax-alert ax-alert--danger`.
- Pantallas de trabajo (bandejas, chats) ocupan el alto disponible sin
  tapar el pie de página: alto `calc(100vh - 370px)` y scroll solo adentro.

## 3. Componentes (clases a usar)

| Necesito | Clase / patrón |
|---|---|
| Tarjeta | `ax-card` + `ax-card__header` (`__titles`, `__title`, `__subtitle`) + `ax-card__body` |
| Botón | `ax-btn` + `--primary` (acción principal) · `--secondary` · `--ghost` · `--soft-success` (finalizar/confirmar) · `--sm`; ícono `ax-btn__icon`, texto `ax-btn__label`, carga `is-loading` + `ax-btn__spinner` |
| Filtros | `ax-btn-group ax-btn-group--segmented` con `role="radiogroup"` e `is-selected` |
| Estado | `ax-badge ax-badge--soft ax-badge--sm` + `--info` / `--success` / `--neutral` / `--warning` |
| Formulario | `ax-field` + `ax-label` + `ax-input` / `ax-select` / `ax-textarea`; interruptor `ax-switch` |
| Tabla | `ax-table-wrap` > `ax-table ax-table--hover` (`__head`, `__th`, `__row`, `__td`) |
| Lista | `ax-list` > `ax-list__row` (`__leading`, `__content`, `__title`, `__meta`) |
| Modal | overlay fijo + `ax-card` con `role="dialog"`, `useFocusTrap`, Escape cierra (ver `ChatAsesores.tsx`) |
| Aviso | `ax-alert ax-alert--success` / `--danger` |

- Acciones en orden de flujo, de la principal a la de cierre, en **una
  fila** (`flexWrap: 'nowrap'`); títulos largos se cortan con "…".
- Un campo de entrada mide lo mismo que su botón (una sola línea).
- Estado bloqueado: mismo diseño del control, deshabilitado, con el motivo
  como placeholder y el botón cambiado a la acción que lo desbloquea
  (ej. "Retomar").

## 4. Textos

- Español con **tú**, cortos, sin inglés en la UI (la plantilla trae textos
  en inglés: se traducen al tocarlos).
- Estados con nombre de negocio: "Asistente IA", "Seguimiento",
  "Finalizada" — no el nombre técnico del enum.

## 5. Chat (conversaciones del asistente)

Mismo lenguaje visual que el widget de la web (`apps/web-fptecnologi`):

- **Avatares** cuadrados redondeados con una esquina recta del lado de su
  burbuja (nunca circulares): cliente blanco con persona, asistente
  `#155382` con robot, asesor degradado turquesa con foto o iniciales.
- **Burbujas:** cliente blanco, asistente degradado `#2181af → #155382`,
  asesor degradado `#18778b → #1c6587`; nombre arriba, hora abajo.
- **Eventos** (se unió, devolvió al asistente IA, finalizó, reabrió):
  etiqueta de vidrio blanco centrada con línea a cada lado y la hora.
- WhatsApp: verde `#37c472` (hover `#2ba35d`).
