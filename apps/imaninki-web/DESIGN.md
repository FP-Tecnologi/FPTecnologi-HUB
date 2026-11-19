# DESIGN.md — Sistema de diseño de Imaninki (imaninki.com)

Resumen del estilo **tal como está en el código** (`src/app/globals.css`, `src/components/`). Lo que cambie en la web se actualiza aquí. Comparativa: [`docs/DISENO-MARCAS.md`](../../docs/DISENO-MARCAS.md).

## Marca

Paleta del logo y del brochure: **negro texturizado, rojo Imaninki y plata metálica** (los filetes).

| Token | Hex | Uso |
|---|---|---|
| `rojo` | `#d4182a` | Botones y fondos con texto blanco (AA) |
| `rojo-hondo` | `#a50f1e` | Texto rojo sobre blanco y hover |
| `rojo-claro` | `#ff5c68` | Acento sobre fondos oscuros |
| `tinta` / `carbon` | `#0d0d0e` / `#2c2c30` | Titulares y fondos negros |
| `niebla` | `#f4f4f5` | Fondos claros |
| `plata` | `#c9ccd1` | Filetes metálicos, detalles |

## Tipografía

**Montserrat** 400–900 para todo (texto y títulos). Títulos en negro sobre claro, `rojo-hondo` como palabra destacada (`.titulo-brillo`); sobre oscuro `#f0283a`. Botones y etiquetas en **mayúsculas** con `tracking`.

## Formas y componentes

- **Esquinas casi rectas**: botones y tarjetas `rounded-md`; etiquetas de esquina `rounded-br-md`; chips en píldora. Botón principal: `bg-rojo`, texto blanco, mayúsculas, alto 48/52 px (`.boton`: brillo, sube 3 px, rebote).
- Texturas y cortes: `.fondo-negro` (metal oscuro con foto), `.banda-roja` (degradado rojo), `.filete` / `.metal` / `.rojo-filete` (filetes plata y rojo), `.collage` con **cortes diagonales** (`clip-path`), `.cubito` (rombo pequeño), `HeroSlider`.
- Iconos **lucide-react**; flotante de WhatsApp; Libro de Reclamaciones, Tickets, Catálogos PDF, Textos legales (borrador hasta «publicado»).

## Movimiento

`entrada` (0,9 s), `Reveal` al hacer scroll, `.flotar` (6 s) en elementos decorativos. Respeta `prefers-reduced-motion`.
