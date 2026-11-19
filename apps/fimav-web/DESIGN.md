# DESIGN.md — Sistema de diseño de Fimav Perú (fimavperu.com)

Resumen del estilo **tal como está en el código** (`src/app/globals.css`, `src/components/`). Lo que cambie en la web se actualiza aquí. Comparativa con las demás marcas: [`docs/DISENO-MARCAS.md`](../../docs/DISENO-MARCAS.md).

## Marca

| Token | Hex | Uso |
|---|---|---|
| `rojo` | `#e02424` | Rojo del logo: acentos, hexágonos, palabra destacada |
| `rojo-hondo` | `#c02020` | Texto rojo sobre blanco y hover |
| `boton` | `#c91f1f` | Fondo de botones y bandas con texto blanco (contraste AA) |
| `carbon` | `#38383c` | Gris oscuro: cabeceras de tarjeta, pie, chips |
| `tinta` | `#111111` | Titulares |
| `gris` | `#f3f3f4` | Fondos de sección alternos |

Rojo + gris carbón + blanco, tomados del logo. **Perú Compras** tiene presencia destacada (es el canal de venta al Estado).

## Tipografía

- **Poppins** 400–600: texto corrido.
- **Rajdhani** 700, mayúsculas, `tracking .04em`: títulos menores (`.titulo-menor`: tarjetas, formularios, columnas del pie).
- **Source Sans 3** (sustituto de Myriad Pro): títulos de sección (`font-titulo`).

## Formas y componentes

- Forma de marca: **hexágonos de esquinas redondeadas** (`components/Hexagono.tsx`, `hex/rutaHexagono`, radio 0.1), espiral y ornamento geométrico en fondos (`Espiral.tsx`, `OrnamentoGeometrico.tsx`).
- Cabecera con **marca hexagonal** (`.cabecera-marca`, `clip-path`) que se encoge al hacer scroll; menú móvil propio; selector de moneda S/ | US$.
- Etiquetas y contadores en **píldora** (`rounded-full`); controles y tarjetas con `rounded-lg`/`xl`. Botones principales en `bg-boton` con texto blanco.
- Tienda (`/tienda`): productos de FPTecnologi en solo lectura; carrito en `localStorage` que se envía como cotización.
- Flotantes: WhatsApp (`WhatsAppFlotante.tsx`), libro de reclamaciones (`LibroBadge.tsx`).

## Movimiento

Curva `cubic-bezier(.2, .7, .2, 1)`. `entrada` y `aparecer` (solo CSS, nunca dejan contenido oculto), `data-reveal` al hacer scroll (solo con JS y sin `reduced-motion`; red de
seguridad a los 2,5 s), transición de página (`main` entra con fundido), emblema giratorio y flotante del hero (`giro`, `flotar`, `hero-respira`), efecto de inclinación en tarjetas (`.inclinar`).
