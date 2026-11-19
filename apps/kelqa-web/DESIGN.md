# DESIGN.md — Sistema de diseño de Kelqa (kelqa.com)

Resumen del estilo **tal como está en el código** (`src/app/globals.css`, `src/components/`). Lo que cambie en la web se actualiza aquí. Comparativa: [`docs/DISENO-MARCAS.md`](../../docs/DISENO-MARCAS.md).

## Marca

Paleta tomada del logo y del brochure: **turquesa** + tinta casi negra con matiz verdoso + grises fríos.

| Token | Hex | Uso |
|---|---|---|
| `kelqa` | `#1b898f` | Turquesa de marca: botones, acentos, iconos |
| `kelqa-hondo` | `#136a6f` | Texto turquesa sobre blanco (AA) y hover |
| `kelqa-claro` | `#7fd3d6` | Acento solo sobre fondos oscuros |
| `tinta` | `#0e1c1e` | Titulares y fondos oscuros |
| `carbon` | `#2b3537` | Texto corrido |
| `niebla` | `#f1f6f6` | Fondos de sección claros |

## Tipografía

**DM Sans** (texto) + **Montserrat** 600–800 (títulos, `text-wrap: balance`). Título con brillo animado (`.titulo-brillo`, degradado turquesa → blanco).

## Formas y componentes

- Botones `.boton`: `rounded-xl`, alto 48/52 px, sólido (`bg-kelqa`, sombra turquesa, hover `kelqa-hondo`) o suave (`bg-kelqa/10`). Efectos: brillo que cruza, sube 3 px, rebote (`--rebote`), el icono avanza o se sacude (`.icono-avanza`, `.icono-sacude`). Variante `.btn-neon` sobre oscuro.
- Tarjetas `.tarjeta`: suben 6 px con sombra turquesa y filete; `.icono-caja` rota y cambia de radio al hover; fotos con `.foto-zoom`.
- Chips en píldora; iconos **lucide-react**; foco visible turquesa.
- Páginas: Inicio, Líneas de producto (API), Nosotros, Contacto, Catálogos PDF, Tickets, Libro de Reclamaciones, Textos legales (borrador hasta «publicado»). Botón flotante de WhatsApp.

## Movimiento

`--suave: cubic-bezier(.22,.8,.24,1)` y `--rebote: cubic-bezier(.34,1.56,.64,1)`. `entrada` (0,9 s) y `Reveal` (opacidad + 26 px, estado oculto solo con JS). Respeta `prefers-reduced-motion`.
