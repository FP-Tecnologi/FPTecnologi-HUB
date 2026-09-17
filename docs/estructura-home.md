# Estructura del home — FPTecnologi

Estructura final del home de producción, definida por el usuario para reemplazar
la exploración libre de "Modelos" por un orden fijo de secciones. Implementada
en dos lugares con el mismo orden y el mismo contenido real, pero distinto
estilo visual:

- [`app/page.tsx`](../apps/web-fptecnologi/app/page.tsx) — home real (`/`),
  estilo propio del sitio (claro, `brand-primary` índigo).
- [`app/modelo-riteflow/page.tsx`](../apps/web-fptecnologi/app/modelo-riteflow/page.tsx) —
  mismo orden y contenido, con el lenguaje visual de la plantilla Riteflow
  (oscuro, tarjetas con borde `#2d3a57`, botones degradé violeta), para
  comparar los dos estilos sobre la misma estructura.

Todo el contenido (marcas, servicios, productos, estadísticas, datos de
contacto) sale de [`src/lib/content.ts`](../apps/web-fptecnologi/src/lib/content.ts) —
nada inventado, ver reglas de honestidad de contenido en `AGENTS.md`.

## Encabezado (sin cambios)

El usuario pidió dejarlo tal cual: no forma parte de este rediseño porque hay
varios modelos de encabezado ya construidos entre los que todavía hay que
elegir. Lo único fijo por ahora es el menú (Inicio / Servicios + submenú /
Tienda + submenú de categorías / Marcas / Nosotros / Contacto), el botón
**Cotizador** (va a `COTIZADOR_URL`, el cotizador real de fptecnologi.com,
no una página de contacto genérica) y el ícono de carrito (→ `/carrito`).
**Pendiente, fuera de este documento**: selector de moneda USD/PEN — no existe
todavía, no hay tasa de cambio real conectada.

## Las 10 secciones del body

| # | Sección | Qué es y por qué | Contenido real | Botón / CTA → destino |
|---|---|---|---|---|
| 1 | **Hero (de 3)** | Rota entre 3 audiencias del negocio (Servicios / Tienda / Partners) con pestañas siempre visibles + auto-rotación cada 7s, para no obligar a elegir una sola promesa en el primer scroll. De los 3 formatos que pidió el usuario (carrusel de 3 / imagen de fondo estática / video de fondo) éste es el **carrusel de 3**; los otros dos no están construidos todavía. | `HERO_SLIDES` (3 slides con foto real cada uno, salvo "Partners" que no tiene foto propia y usa un panel abstracto) | CTA primario cambia por slide: Servicios → `#servicios`, Tienda → `#catalogo`, Partners → `#partners`. CTA secundario fijo → cotizador real (`COTIZADOR_URL`) |
| 2 | **Marcas** | Franja de logos en scroll infinito sin pausa (pedido explícito), para transmitir volumen de marcas distribuidas sin ocupar espacio vertical. | `PARTNER_BRANDS` (13 marcas reales) | Ninguno — es informativa, no clickeable |
| 3 | **Nosotros (corta)** | Presentación breve de la empresa + las 3 métricas reales, en vez de un "Quiénes somos" largo (ese vive aparte en `/nosotros`, hoy un placeholder). Las métricas antes vivían en una barra suelta después de "Por qué elegirnos"; se movieron acá porque respaldan la presentación de la empresa, no los diferenciadores. | `STATS` (13+ marcas, 8 categorías, 2 líneas de negocio) | Ninguno |
| 4 | **Servicios** | Grilla de las soluciones TI que ofrece la empresa. El usuario asumía 6; el dato real (`SOLUTIONS`) tiene **8** — se avisó y se usaron las 8 reales, no se recortó la lista. | `SOLUTIONS` (8 categorías: seguridad ciudadana, escuelas y universidades, servidores para empresas, hoteles y restaurantes, videoconferencia, data centers, datos empresariales, soluciones cloud) | Cada tarjeta → `#contacto` ("Cotizar"/"Consultar") — no hay página de detalle por servicio en el home, solo la sección de contacto |
| 5 | **Por qué elegirnos** | Diferenciadores reales de la empresa frente a competencia gris/informal. Deliberadamente **no** son testimonios ni reseñas (no hay clientes reales citables todavía — ver regla anti-invención). | `WHY_CHOOSE_US` (4 diferenciadores: stock local, distribución autorizada, cotización sin compromiso, programa de partners) | Ninguno |
| 6 | **Categorías de productos** | Entrada visual a la tienda por tipo de producto, antes de mostrar productos puntuales — ayuda a alguien que no sabe qué producto puntual busca. | `TIENDA_CATEGORIES` (4: monitores, laptops, pantallas interactivas, servidores) | Cada tarjeta → `/tienda/[slug]` de esa categoría. Botón de la sección → `/tienda` (catálogo completo) |
| 7 | **Productos destacados** | Los 4 monitores reales más relevantes del catálogo, en carrusel lateral (nuevo — antes era grilla estática). Dos acciones reales por producto: **Añadir al carrito** (ya existía, `CartContext` con localStorage) y **Comparar** (nuevo: hasta 3 productos a la vez, tabla comparativa con los campos que sí tenemos — marca, modelo, SKU, precio; no se inventan specs que no están en `FEATURED_PRODUCTS`). | `FEATURED_PRODUCTS` (4 monitores con precio y SKU reales) | "Añadir al carrito" → estado real del carrito (badge del header). Botón de la sección → `/tienda` |
| 8 | **Sé partner** | CTA para sumar integradores/revendedores, con los 3 pasos reales del proceso comercial. **No existe backend de alta de partners** — el botón "Sumarme como partner" no manda a un formulario de registro que no existe, va por el mismo canal real que ya usa el resto del sitio. | `PARTNER_STEPS` (3 pasos) | "Sumarme como partner" → WhatsApp real (`wa.me/51908856286`) con mensaje precargado |
| 9 | **Contacto** | Datos de contacto reales + mapa + **formulario liviano nuevo** (nombre, empresa opcional, mensaje). **No hay backend de correo en el proyecto** (ver `AGENTS.md`), así que el formulario arma el mensaje y lo abre en WhatsApp real — se le avisa esto mismo al usuario en la propia sección ("no guardamos nada en un servidor"), para no simular un envío que no ocurre. | `CONTACT_INFO` (dirección, 2 teléfonos, correo) | Submit del formulario → WhatsApp con el mensaje precargado |
| 10 | **Footer** | Pre-footer + footer con logo y descripción corta, navegación, enlaces de soporte/legales y datos de contacto. Ya existía con esta estructura, sin cambios en este trabajo. | `CONTACT_INFO`, `TIENDA_CATEGORIES` | Enlaces de navegación interna + legales (política de privacidad, devoluciones, términos, libro de reclamaciones) |

## Qué quedó explícitamente fuera (por ahora)

- **Selector de moneda USD/PEN** en el header — no hay tasa de cambio real
  conectada a ningún servicio; agregarlo ahora sería inventar una conversión.
- **Hero con imagen de fondo estática** y **Hero con video de fondo** — los
  otros 2 formatos pedidos, no construidos todavía (solo el de carrusel).
- **Páginas legales reales** detrás de los links del footer (privacidad,
  devoluciones, términos, libro de reclamaciones) — hoy son solo destinos de
  link, falta escribir el contenido de cada una.
- **Comparar con más de 3 productos o entre categorías distintas** — se
  limitó a 3 para que la tabla siga siendo legible en una pantalla.
