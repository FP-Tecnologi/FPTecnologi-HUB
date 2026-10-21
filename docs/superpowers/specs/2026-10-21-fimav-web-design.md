# Web pública Fimav Perú (`apps/fimav-web`) — diseño

Fecha: 2026-10-21 · Marca: `fimavperu` (3.ª web del HUB, tras fptecnologi y quamtu).

## Objetivo
Web corporativa B2B/B2G de Fimav Perú E.I.R.L. (proveedor de bienes y servicios para
Gobierno/Privado, posicionado en Perú Compras): presenta la empresa, el catálogo por
categorías y capta cotizaciones. De la web actual (WordPress) solo se conserva el dominio
`fimavperu.com`; el diseño es nuevo y nace del logo y del brochure 2023.

## Identidad visual (fuente: logo + brochure + firma de correo)
- **Solo modo claro.** Sin selector de tema.
- **Paleta** (muestrear exacta del logo al implementar):
  - Rojo marca `#E02424`, rojo profundo `#C02020` (curva oscura de la espiral).
  - Carbón `#38383C` (bandas oscuras puntuales, como en el brochure), negro tinta `#111` para el texto del logo.
  - Plata: degradado gris claro → gris medio del logo; gris muy claro `#F3F3F4` para secciones alternas; blanco base.
- **Logo**: el entregado (espiral + "FIMAV PERU"), sin redibujar. Se extrae a `public/brand/`.
- **Ilustraciones**: espirales rojas grandes cortadas en los bordes, contorno de espiral en línea fina, hexágonos
  de esquinas redondeadas para iconos y fotos, bandas carbón con corte en chevron. Se dibujan en SVG con el
  degradado plateado del logo.
- **Tipografía**: Poppins (títulos y texto). Títulos en dos tonos (gris carbón + rojo), como en el brochure.
- **Fotos e iconos**: se extraen del PDF del brochure (3 fotos por categoría, 11 iconos hexagonales rojos).
- Todo elemento se valida contra el logo: ningún color ni forma ajena a esta paleta.

## Páginas
| Ruta | Contenido |
| --- | --- |
| `/` | Hero "Especialistas en Bienes y Servicios" con espiral, Sobre nosotros, 11 categorías, "Estamos en Perú Compras", ¿Por qué escogernos?, marcas aliadas, CTA cotizar |
| `/nosotros` | Misión y visión |
| `/catalogo`, `/catalogo/[categoria]` | Categorías fijas del brochure: impresión, servidores, networking, desktops/notebooks/all-in-one, monitores, proyectores, software, aire acondicionado, baterías, consumibles, mobiliario y papel |
| `/cotizar` | Formulario → proxy `/api/hub/cotizador` → `POST /public/cotizador/leads?marcaId=…` (patrón de `quamtu-web`), honeypot |
| `/contacto` | Jr. Huaraz 1833, Breña · 01 397-9527 · ventas@fimavperu.com · comercial@fimavperu.com |
| `/legal/*` | Privacidad, términos, devoluciones, libro de reclamaciones, preguntas frecuentes (páginas simples) |

## Técnica
- App Next 16 + Tailwind 4 + lucide, esqueleto de `apps/quamtu-web` sin three/gsap. Puerto 3005, entrada en `.claude/launch.json`.
- Contenido fijo en `src/lib/contenido.ts` y `src/lib/categorias.ts`. Contacto en `src/lib/contacto.ts` (WhatsApp: un solo valor, por confirmar).
- No toca la API. Requiere que exista la fila `Marca` `fimavperu` y conocer su `marcaId` (env `MARCA_ID`).
- Verificación: `npm run lint` (tsc) + revisión en navegador, escritorio y móvil.

## Fuera de alcance (v1)
Blog, avisos emergentes, chat, carrito/pagos, 3D, productos desde la API, modo oscuro.

## Pendientes
- Número de WhatsApp real (el 01 397-9527 es fijo).
- Confirmar `marcaId` de `fimavperu` en la DB.
- Textos legales reales (se parte de los de la web actual si se pueden reutilizar).
