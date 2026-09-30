# DESIGN.md — Sistema de diseño de fptecnologi.com

Base: la **home** (`app/page.tsx`, componentes en `src/components/home/`).
Toda página nueva (Servicios, Nosotros, Contacto, fichas de producto, etc.)
se arma con estas reglas y **reutilizando esos componentes**, no copiándolos
ni inventando variantes nuevas. Si algo no está acá, primero se mira cómo lo
resuelve la home.

---

## 1. Marca

### Colores (tokens en `app/globals.css`, `@theme`)

| Token (clase Tailwind) | Hex | Uso |
|---|---|---|
| `brand-primary` | `#155382` | Azul oscuro. Fondo base de botones, chips de ícono, badges sólidos, sección Partners |
| `brand-dark` | `#2181af` | Azul vibrante. **Hover** de botones, acentos, burbuja del asistente |
| `brand-petrol` | `#1c6587` | Degradés |
| `brand-teal` | `#18778b` | Degradés, resplandores |
| `brand-teal-light` | `#208497` | Íconos sobre fondo oscuro, detalles |
| `ink` | `#0b1b26` | Texto principal; fondo de "Hablemos" y del footer |
| `paper` | `#f6f9fb` | Fondo de página (con textura de puntitos del `body`) |
| `whatsapp` / `whatsapp-dark` | `#37c472` / `#2ba35d` (hover) | Todo lo de WhatsApp (nunca `emerald` de Tailwind) |
| celeste de títulos | `#8fe0ee` | Parte con brillo de títulos sobre fondo oscuro |

> Ojo: los nombres están cruzados respecto de su tono (`brand-primary` es el
> oscuro, `brand-dark` el vibrante). Usar siempre el **token**, nunca el hex.

### Tipografía

- **Montserrat** es la única fuente del sitio (`font-sans` y `font-display`).
  Pesos 400–800 cargados desde Google Fonts en `app/layout.tsx`.
- `font-mono` solo para precios (números alineados).
- Tamaños de título de sección: `text-3xl sm:text-4xl font-bold leading-tight`.
- Texto corrido: `text-ink/60` (claro) o `text-white/70` (oscuro).

### Íconos

- **Solo `lucide-react`** (un único estilo de trazo). `strokeWidth` 1.8–2.2. Excepción: logos de marca que lucide no trae (`WhatsAppIcon` en `site/icons.tsx`).
- Nada de SVG dibujado a mano. Excepción: `ArrowUpRightIcon` / `SparkleIcon`
  de `src/components/site/icons` en botones y badges ya existentes.

### Idioma y tono

- Español de Perú con **tú** (nunca voseo: "puedes", "cuéntanos", no
  "podés", "contanos").
- Precios en **USD sin IGV**; el IGV (18%) se suma recién en carrito/checkout.
  El selector USD/PEN convierte con el tipo de cambio de `CurrencyContext`.
- Datos provisionales (proyectos, clientes, fotos repetidas) viven en
  `src/lib/*.ts` marcados como "de ejemplo"; no se inventan instituciones
  reales ni cifras (ej. "+100 clientes") sin confirmar.

---

## 2. Estructura de página

```
<StickyNav />                      encabezado fijo que se comprime al bajar
Hero (tarjeta a pantalla completa, bordes redondeados, fondo oscuro/video)
Secciones (alternando fondo)
<Footer />
```

- Contenedor: `mx-auto max-w-7xl px-6`.
- Aire vertical de sección: `py-20` (hasta `py-24` en secciones destacadas).
- **Fondos alternados** para separar secciones, siempre claros salvo el
  cierre: `bg-white` ↔ fondo de página (`paper` con puntitos).
  Oscuros solo al final: Partners (`bg-brand-dark`) → Hablemos (`bg-ink`) →
  Footer (`bg-ink`). No meter secciones oscuras en medio de la página.
- Orden de la home (referencia para jerarquía): Hero → Marcas → Nosotros →
  Servicios → Por qué elegirnos → Categorías → Los más vendidos → Proyectos
  → Clientes → Partners → Hablemos → Footer.

### Hero

- Tarjeta con marco: wrapper `bg-paper p-3 md:p-5`, sección
  `rounded-[1.25rem] md:rounded-[2.25rem]`, alto `h-[92svh] min-h-[560px]`
  en la home. Páginas internas: mismo marco, alto según contenido
  (ver `components/tienda/StoreCatalog.tsx`).
- Dentro va un `Navbar9` **invisible** que reserva el lugar del encabezado
  fijo (`StickyNav`), así el header "real" calza exacto encima.
- Título grande blanco + parte con brillo; texto `text-white/85`.

### Páginas internas (`site/PageHero`)

Nosotros, Servicios (+ detalle), Contacto usan `PageHero`: mismo marco del
hero (tarjeta redondeada sobre paper, `StickyNav` + `Navbar9` invisible),
fondo azul de marca con resplandores o `imagen` con velo `ink`, migas de
pan, badge y título en dos tonos, y botones (`MoreInfoButton tone="dark"`,
`WhatsAppCta`). Debajo, secciones de la home reutilizadas (Por qué
elegirnos, Clientes, Proyectos...) y cierre oscuro con `Contact` + `Footer`.
El menú apunta a páginas (`/nosotros`, `/servicios`...), no a anclas.

### Encabezado (`StickyNav` + `Navbar9`)

- Arriba del todo: transparente sobre el hero. Al bajar 140px: se comprime
  (ancho 64rem / 72rem en 2xl), fondo `bg-ink/80` + blur, esquinas
  redondeadas. Logo 60px en pantalla grande (`2xl:h-[60px]`), 24–28px comprimido.
- Menú (orden fijo): Inicio, Nosotros, Servicios (submenú), Proyectos, Tienda (submenú),
  Contacto (items en `lib/nav.ts`; footer: Nosotros, Servicios, Proyectos, Tienda, Contacto). Tamaño por vista: 13px (lg), 15px (xl), 16px (2xl), mayúsculas.
- Derecha: carrito (solo si hay productos) + **Cotizar** (sweep → `/cotizador`).
- Variante tienda (`store`): selector USD/PEN + carrito siempre visible,
  **sin** Cotizar.

### Footer (`Footer.tsx`)

3 franjas separadas por líneas con degradé: prefooter (frase + Cotizar /
WhatsApp) → 4 columnas con separadores verticales (marca + contacto,
Navegación solo con páginas, Servicios, Enlaces útiles) → barra legal.

---

## 3. Encabezado de sección (patrón obligatorio)

```tsx
<SectionBadge>Nuestros servicios</SectionBadge>          // tone="dark" sobre fondo oscuro
<h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
  <span className="text-ink">Servicios TI a medida</span>{' '}
  <span className="title-shimmer-light">para cada sector</span>
</h2>
```

- **Badge**: píldora de vidrio + `SparkleIcon` + contorno fino que gira
  siempre (`.spin-border--thin`). Texto en mayúsculas.
- **Título en dos tonos, INLINE** (nunca `block` ni salto forzado): corto =
  una línea; solo baja de línea si no entra.
- Brillo: `title-shimmer-light` (fondo claro), `title-shimmer-dark` (fondo
  azul/oscuro), `hero-title-shimmer` (hero con video).
- Disposición: título a la izquierda y botón (y descripción corta opcional)
  a la derecha, o todo centrado en secciones de lectura (Por qué elegirnos,
  Proyectos, Clientes).
- Descripciones cortas: 1–2 líneas; si no suma, se quita.

---

## 4. Botones

| Botón | Componente | Uso |
|---|---|---|
| Principal con barrido | `MoreInfoButton` (`href`, `label`, `onClick`, `tone`) | "Más información", "Ver servicios", "Ver Tienda TI", CTAs |
| Barrido base | `ClickConfirmButton` | Cotizar, carrito de producto (`collapsed`), Servicios/Tienda del hero |

- Forma: **esquinas suaves** (`rounded-xl` / `rounded-lg`), **nunca
  circulares/píldora** en botones de acción.
- Color: reposo `brand-primary` → hover `brand-dark`; en fondo oscuro
  `tone="dark"`: blanco → hover azul.
- Efecto: ícono de flecha a la izquierda; hover gira el ícono 45°; click =
  **sweep** (el ícono cruza el botón mientras se borra el texto, 600ms) y
  recién ahí navega / ejecuta. Nunca abrir pestaña nueva salvo WhatsApp.
- Tamaño responsive: `h-10` (móvil) → `md:h-11` → `2xl:h-12`; texto
  `text-xs` → `md:text-sm` → `2xl:text-base`, mayúsculas.
- Carrito de producto: solo ícono en reposo; al hover se despliega
  "Añadir al carrito"; al click sweep → "Agregado" (verde).

---

## 5. Tarjetas

Todas: `rounded-2xl`, sombra **azul de marca** (`shadow-brand-dark/10–45`,
nunca gris/negra), hover que sube (`hover:-translate-y-1`/`-1.5`).

| Tarjeta | Archivo | Rasgos |
|---|---|---|
| Servicio | `ServiceCardFinal` | Foto a sangre + degradé negro abajo, zoom + giro leve al hover, ícono sólido arriba-izq, badge vidrio "Soluciones", descripción 2 líneas, botón que aparece al hover, contorno que gira (`.spin-border`) |
| Categoría | `ProductCategories` | Blanca tipo producto: foto arriba, chip de ícono, pie con título + flecha |
| Producto | `ProductCardFinal` | Fondo celeste suave, foto con `mix-blend-multiply`, galería (miniaturas + flechas), marca como etiqueta de vidrio (link a `/marcas/[slug]`), favorito + comparar arriba-der, "En stock" y carrito del mismo alto |
| Diferenciador | `WhyChooseUs` | Oscura (`bg-ink`) con resplandor de marca, número grande de fondo, ícono en chip |
| Proyecto | `NuestrosProyectos` | Contenedor `brand-mesh` al alto del mapa (encabezado: chip de ubicación, "Proyectos en" + departamento, contador de vidrio; lista con scroll oculto y degradé abajo; en desktop cada tarjeta mide la mitad del alto, así se ven 2 completas). Tarjeta: foto con zoom + giro suave al hover, velo `ink`, numeración arriba-izq: chip de vidrio oscuro (`bg-ink/45`) con el número "01", cliente · año en celeste + título + línea de acento que se alarga al hover, `.spin-border` al hover, toda la tarjeta clickeable; etiqueta vidrio informativa arriba-der ("Click para ver detalles" / "Volver", `backdrop-blur`, solo al hover; siempre visible en táctil); al click gira 3D y el reverso muestra la misma foto desenfocada + velo de marca con el contenido centrado |

---

## 6. Efectos y movimiento

- **Entrada/salida con scroll**: envolver bloques con `ScrollReveal`
  (`up` / `left` / `right`, `delayMs` escalonado de 100–120ms). Encabezado
  a la izquierda entra desde la izquierda, botón desde la derecha, tarjetas
  en cascada.
- **Contorno que gira** (`.spin-border`): tarjetas al hover (3px); badges
  siempre (`.spin-border--thin`, 1px).
- **Marquesina** (`.animate-marquee`, 3 copias del contenido): marcas y
  logos de clientes; se pausa al pasar el cursor (con estado, no CSS).
- **Zoom de imagen** al hover en fotos de tarjetas.
- Todo movimiento se desactiva con `prefers-reduced-motion`.

---

## 7. Widgets globales (layout)

- **Chat** (`site/ChatWidget`): dos looks (`THEMES`): oscuro tipo Hero (vidrio `ink`, acentos de marca) en la web informativa y claro (`bg-paper`) en `/tienda`; header `brand-mesh` con chip de vidrio + "En línea"; asistente con Groq (`/api/chat`); burbujas
  asistente azul FP / persona blanca con esquina recta; opciones y links;
  burbuja del asistente en degradado de marca con "Asistente FP · hora" debajo; historial de conversaciones ("Nueva" archiva, botón de historial reabre o borra; máx. 10, solo en el navegador); vista WhatsApp con tarjeta por asesor (foto + punto verde, chip de área, número debajo, botón "Chatear").
- **Favoritos** (`site/FavoritesWidget`): pestaña compacta a la derecha
  (corazón + cantidad) que se despliega en lista.
- **Comparar** (`home/CompareDock` + `useCompare`): panel pegado abajo, hasta
  4 productos; minimizado = píldora.
- **Carrito** (`CartContext`, `CartButton`): aparece en el header al agregar.

---

## 8. Responsive

- Vistas: celular (<640), tablet (640–1023), laptop (1024–1535), pantalla
  grande (≥1536, `2xl`). Probar siempre 375, 768/1024, 1366 y 1920px.
- Grillas de tarjetas: 1 → 2 (`sm`) → 4 (`xl`) columnas; no forzar 4
  columnas si un botón deja de entrar.
- Sin scroll horizontal en ningún ancho.

---

## 9. Checklist para una página nueva

1. Hero con el marco de la home + `StickyNav` (o `store` si es tienda).
2. Secciones con `SectionBadge` + título inline en dos tonos.
3. Botones `MoreInfoButton`; nada de botones redondos ni colores fuera de token.
4. Tarjetas existentes; sombras azul de marca.
5. `ScrollReveal` en encabezados y tarjetas.
6. Fondos alternados claros; oscuros solo al cierre.
7. Íconos `lucide-react`; textos con "tú"; precios sin IGV.
8. `Footer` al final.
9. Verificar en navegador (375 / 1024 / 1920) y `npx tsc --noEmit`.
