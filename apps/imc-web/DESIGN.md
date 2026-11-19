# DESIGN.md — Sistema de diseño de Company IMC (companyimc.com)

Web pública de **Company IMC E.I.R.L.** (`apps/imc-web`, Next 16 + Tailwind v4, exportación estática, puerto 3009). Su estilo sale del **brochure
corporativo** y del logo: hexágonos, chevrones «««, azul + naranja, esquinas rectas. Toda sección o página nueva se arma con estas reglas y
**reutilizando los componentes y clases de abajo**; si algo no está aquí, primero se mira cómo lo resuelve la home.

Fuente de verdad en código: tokens en `src/app/globals.css` (`@theme`), componentes en `src/components/`, textos y datos en `src/lib/datos.ts`.

---

## 1. Marca

### Colores (tokens `@theme`)

| Token (clase Tailwind) | Hex | Uso |
|---|---|---|
| `azul-2` | `#2b54ac` | Color de marca (brochure): botones azules, hexágonos, palabra destacada de títulos sobre claro, bordes |
| `azul` | `#0056aa` | Azul exacto del logo (solo logo y SVG) |
| `azul-osc` | `#172e5e` | Hover del botón azul, títulos de tarjeta, fondo base de degradados |
| `azul-claro` | `#e8eef9` | Fondo de secciones alternas (`bg-azul-claro`), chips suaves |
| `naranja` | `#ffaa07` | Acento y botón principal (CTA), palabra destacada sobre oscuro, regla decorativa |
| `naranja-claro` | `#fde3b4` | Fondos suaves detrás de fotos (hexágonos de respaldo) |
| `grafito` | `#38383c` | Texto de párrafo (al 80–85 %); **no** se usa como fondo de sección |
| `tinta` | `#1d1d21` | Titulares y texto fuerte |
| `gris` | `#d1d3d4` | Bordes de campos y separadores |
| Pie de página | `#232327` | Único gris oscuro de fondo; **solo el footer** |
| Hero | `#0a1a3d` | Fondo del hero de la home (azul noche) |

**Regla de fondos**: el gris oscuro es exclusivo del pie. Las secciones alternan **blanco** y **azul-claro** (con cuadrícula de puntos); los bloques oscuros son el
**degradado azul** (`.degradado-azul`: azul noche → azul marca, con resplandor arriba a la derecha) para CTA, Perú Compras (inicio) y portadas interiores.
Dos bloques azules nunca van seguidos (ej.: «Marcas líderes» en Productos es claro porque después va el CTA azul).

Contraste: texto sobre azul va en blanco (`text-white/85` mínimo); sobre claro, `text-grafito/80`+. El naranja sobre blanco no se usa para texto largo.

### Tipografía

- **Poppins** (400–800, Google Fonts vía `next/font`), única fuente. Títulos `font-extrabold` (800), `tracking-tight`, `line-height` 1.04 (clase `.titulo`).
- Palabra destacada del título dentro de `<b>`: azul-2 sobre claro, naranja sobre oscuro (`.titulo.claro` o `.oscuro`).
- Hero de la home: título 36–54 px (`text-4xl sm:text-5xl xl:text-[3.4rem]`), siempre ~3 líneas y mismo tamaño en las 3 diapositivas.
- Etiquetas y mini‑títulos: 12 px, mayúsculas, `tracking` .2em, peso 700.

### Formas — **esquinas rectas, nada redondeado**

- Botones, tarjetas, campos, fotos, chips, paneles: `border-radius: 0` (sin `rounded-*`; no reintroducirlos).
- La forma de marca es el **hexágono** (`.hex`, `clip-path`), usado en iconos, insignias, marcos de foto y decoración, más los **chevrones** («««, `<Chevrones/>`).
- Fondo decorativo: cuadrícula de puntos (`.cuadricula` sobre claro, `.cuadricula-claro` sobre oscuro) y hexágonos que flotan (`<Fondo/>`, `.flota`).

### Botones (`.btn`, definidos en `globals.css`)

Cuadrados, `font-weight 700`, 15 px, padding `.95rem 1.8rem`, icono de flecha (`<Icono n="flecha"/>`) a la derecha. Efectos comunes: **brillo** que cruza el botón
al pasar el cursor, **sube 3 px** (`translateY(-3px)`), al presionar baja y se achica (`scale .97`), la **flecha se desplaza 5 px**.

| Clase | Aspecto | Cuándo |
|---|---|---|
| `btn btn-naranja` | Fondo naranja, texto tinta, sombra naranja brillante | **CTA principal** (cotizar, llamar, WhatsApp). Máximo uno por bloque |
| `btn btn-azul` | Fondo azul-2, texto blanco; hover azul-osc | Acción secundaria sobre claro (Conócenos, Enviar mensaje) |
| `btn btn-linea` | Borde 2 px azul, transparente; hover se rellena | Acción terciaria sobre claro (Ver servicios) |
| `btn btn-linea-claro` | Borde 2 px blanco; hover se rellena de blanco | Acción terciaria sobre fondo oscuro (hero) |
| `btn btn-blanco` | Fondo blanco, texto azul-osc | Sobre bloques azules (disponible) |

Botón del encabezado = `btn-naranja` con el **teléfono** (`!px-5 !py-2.5`). Botón flotante de contacto = hexágono naranja (ver §3).

### Iconos

- **SVG propios de trazo** definidos en `src/components/ui.tsx` (`ICONOS`, viewBox 24, `stroke-width` 1.6, `round`): `<Icono n="computo"/>`. Para uno nuevo se agrega ahí;
  no se mezcla otra librería. Siempre dentro de un **hexágono** (`<Hex/>`, clase `.insignia`) cuando son protagonistas.
- `.insignia` (hexágono azul con icono) **cambia a naranja y gira 60°** al pasar el cursor sobre su tarjeta o su grupo (`.tarjeta`, `.grupo`).

### Tarjetas

`.tarjeta`: fondo blanco con **puntos suaves** que se desvanecen hacia la esquina inferior, sombra azulada, **sube 8 px** al pasar el cursor. Variantes con puntos:
`.puntos-claro` (puntos blancos sobre tarjetas oscuras/azules, combinable con `.degradado-azul`). Los grupos de tarjetas de un mismo bloque tienen **la misma altura y textos de
longitud parecida** (ej.: Misión y Visión, 4 líneas cada una).

### Fotos

Salen del brochure (webp en `public/img`). Retratos recortados sobre un hexágono `naranja-claro`; fotos de servicio con **marco naranja ladeado** que se endereza en hover,
zoom lento y brillo. Fotos con degradado inferior para fundirse con el fondo (hero). Fondo con fotos solo en el hero (oscurecidas ~40 %).

---

## 2. Estructura de página

- **Encabezado fijo** (`Cabecera.tsx`). *Arriba (transparente)*: degradado azul tenue, logo blanco, enlaces claros con subrayado naranja animado, botón naranja con teléfono.
  *Al hacer scroll*: fondo blanco 90 % con desenfoque y sombra, logo a color, enlaces oscuros, barra de avance azul→naranja abajo. Móvil: menú de pantalla completa que se abre en círculo.
- **Home**: Hero `100svh` con slider (3 diapositivas: título, descripción, 2 botones, visual en hexágono y 3–4 widgets flotantes de ancho fijo `13.5rem`; cambia solo cada 7 s,
  pausa con el cursor, **sin puntos ni numeración ni flechas**) + franja de logos de marcas dentro del hero → Sobre nosotros (con cifras) → Servicios → Productos → Perú Compras → Por qué escogernos → CTA.
- **Páginas interiores** (`<Portada/>`): portada azul con etiqueta, título (`<b>` naranja), texto y chevrones; **espacio `pt-40/48` arriba y `pb-24/28` abajo** para que el texto no quede pegado al encabezado.
  Luego secciones alternando blanco / azul-claro y cierre con `<Cta/>`.
- **Pie** (`Pie.tsx`): único fondo gris oscuro (`#232327`), logo **blanco sin caja**, navegación y datos de contacto.
- **Etiqueta sobre títulos** (`.etiqueta`): vidrio translúcido con tinte naranja, borde izquierdo naranja y hexágono naranja que late; texto blanco en mayúsculas.

## 3. Componentes reutilizables (`src/components/`)

`Hero` (slider) · `Cabecera` · `Pie` · `Cortina` (carga y transición) · `Whatsapp` (botón flotante) · `Enlace` (link con transición) · `Reveal` · `Contador` ·
`ui.tsx`: `Icono`, `Hex`, `Chevrones`, `Fondo`, `Titulo`, `Seccion`, `Portada`, `Cta`.

- **Botón flotante de contacto**: hexágono naranja abajo a la derecha, pulso suave; abre un panel (cabecera azul con puntos, filas con hexágono): WhatsApp con mensaje de cotización,
  llamada, correo y formulario. Cierra con Esc o clic fuera. Globo «¿Necesitas ayuda?» una vez a los 6 s.
- **Marcas**: logos SVG en `public/marcas` (simple-icons y Wikimedia para HPE y Axis), **siempre en blanco sobre oscuro** (`brightness-0 invert`) o en gris oscuro sobre claro (`brightness-0 opacity-70`).
  Marquesina en el hero; cuadrícula de tarjetas en Productos. Usar solo marcas con las que Company IMC trabaja de verdad.

## 4. Movimiento

Curva de salida única `--ease-salida: cubic-bezier(.22, 1, .36, 1)`.

- **Entrada de la web / cambio de página**: `Cortina`, dos capas (naranja y azul) que suben; al cargar muestra el logo blanco y «Cargando» sobre fondo azul con malla de puntos en movimiento y hexágonos flotantes
  (sin anillos ni barra). Entrada del hero retrasada ~1,7 s para esperar a la cortina.
- **Scroll**: `Reveal` (aparece desde abajo, izquierda, derecha o con zoom), `Contador` de cifras, conectores punteados animados en «Cómo trabajamos» (horizontal en escritorio, vertical en móvil).
- **Continuo**: `.flota` (hexágonos), `.marquesina` (logos), chevrones que parpadean en secuencia, zoom lento de fondos del hero.
- `prefers-reduced-motion`: sin animaciones, la cortina se oculta y el contenido se ve completo. Sin JavaScript el contenido también se ve (`<noscript>`).

## 5. Contenido y legales

- Textos de `brochure IMC transicion.pdf` y de companyimc.com. Teléfono usado: **+51 984 262 805** (brochure; companyimc.com muestra +51 984 268 0547: **por confirmar**).
  Dirección: Pq. Manuel García Rosell, Urb. Círculo Nro. 197, Pueblo Libre, Lima. Horario lun–vie 8:30 am–6:30 pm.
- Español de Perú con **tú**. No inventar cifras ni clientes: las cifras de la home (4 años, 5 líneas, 2 servicios de proyectos, 6 categorías) salen del brochure.
- **Perú Compras**: logo oficial de gob.pe (`public/img/perucompras-logo.webp`). La foto es del Palacio de Gobierno (Wasiwatana, **CC BY-SA 4.0**, Wikimedia Commons): el crédito debe seguir visible
  junto a la foto; se puede reemplazar por una foto propia de la sede.
- Formulario de contacto por `mailto:` (sitio estático, sin API). Si luego se conecta a la API/Leads, el cambio va en `contacto/page.tsx`.
- Fuera de la home no hay datos de la API del HUB: todo el contenido vive en el código (`src/lib/datos.ts` y las páginas).
