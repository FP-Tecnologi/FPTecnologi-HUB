# Notas de rediseño — web pública (fptecnologi.com)

Decisiones tomadas por el usuario tras revisar los 12 "Modelos" de
`apps/web-fptecnologi` (ver [`/modelos`](../apps/web-fptecnologi/app/modelos/page.tsx)).
Este documento es la lista de qué estilo/componente de qué modelo se
adopta para cada pieza de la web real — sirve de referencia para
implementar, no reemplaza [`estructura-home.md`](estructura-home.md) (que
describe el home ya construido); cuando estos cambios se implementen,
`estructura-home.md` se actualiza para reflejarlos.

**Estado: solo notas de diseño, todavía no implementado.** Ir tachando o
moviendo a "hecho" a medida que se construya cada punto.

## Paletas por tipo de página

- **Oscuro / premium**: páginas de **Servicios** (informativa) y de
  **Tienda** (ecommerce).
- **Blanco / claro** estilo Vireo (el que ya se usó en el home real): el
  resto de páginas.

## Encabezados

Dos encabezados distintos según la sección:

- **Web de soluciones/servicios**: estilo del **Modelo 2** al abrir.
- **Ecommerce**: estilo del **Modelo 6**, pero con **fondo blanco** (no el
  fondo claro original del modelo).

## Botones

- **Esquinas: sin curva pronunciada** — solo un radio simple/sutil (no
  "pill"/full-rounded). Regla única para **todos** los botones del sitio,
  variante primaria, secundaria y de solo texto (link-style), **incluidos
  los del encabezado** (hoy varios modelos usan botones tipo píldora en el
  header — hay que unificarlos a este mismo radio sutil).
- **Hover**: el ícono del botón gira.
- **Click**: efecto *sweep* (barrido) — o, en botones de carrito, animación
  del ícono de carrito/producto moviéndose de un lado a otro.

## Cards de servicios

Basada en el **Modelo 4**, con estos agregados:
- Badge antes del título.
- Título más corto ("anda más" → ajustar longitud del título actual).
- Descripción a **2 líneas** (truncada/clamp).
- Botón **"Más información"** → redirige a la página de detalle de ese
  servicio (hoy no existe esa página de detalle, hay que crearla).

## Cards de producto

Estilo **4.2** ("Propuesta: estilo Vireo") como base, agregando:
- Efecto de **zoom a la imagen** al hover.
- Ícono/opción de **comparar** (ya existe comparador en el home real, ver
  `estructura-home.md` punto 7 — reusar esa lógica).
- Opción de **ver galería de producto** (varias fotos), como en el
  ejemplo **4.4**.

## Cards informativos

Estilo de las cards de **"Programa de partners"** del **Modelo Riteflow**
(`app/modelo-riteflow`).

## WhatsApp

- Agregar **varios números de WhatsApp según área** (hoy solo hay uno,
  `CONTACT_INFO`/`wa.me/51908856286` — definir qué áreas y qué número cada
  una, dato pendiente del usuario).
- Burbuja flotante: propuesta con **anillo de pulso** alrededor del ícono.
- Cambiar el ícono actual por uno mejor, pero que siga siendo referente a
  "mensaje" (no necesariamente el logo oficial de WhatsApp).

## Hero de la home

Basado en el **Modelo 9**, con mejoras:
- Video de fondo (no imagen estática).
- Animaciones mejoradas respecto al modelo original.
- Título combinando **dos colores**: blanco + celeste claro, para resaltar
  la frase importante dentro del titular.
- Mejor integración visual con el encabezado.
- Esto aplica específicamente a la **home page** (no a Servicios/Tienda,
  que tienen su propio hero).

## Marcas (carrusel)

Al pasar el cursor sobre un logo: resaltar y aplicar **efecto zoom** sobre
ese logo.

## Carrito

- **Ícono/estilo del carrito**: minimalista, cuadrado, con **badge azul**
  (contador de items).
- **Modal del carrito**: mantener el diseño actual **con stepper**, pero:
  - Cambiar el ícono de "✕" (eliminar item) por un **ícono de tacho de
    basura**.
  - Agregar botones de **aumentar / disminuir** cantidad (no solo
    input/stepper existente — verificar qué falta del actual).
  - Agregar líneas de **"Envío: Gratis"** e **"IGV (18%)"** en el resumen.

## Comparativo, casos de éxito y testimonios

- **Comparativo de productos**: base **12.2**, agregando **imagen de
  producto** a cada fila/columna de la tabla.
- **Casos de éxito** (tarjeta individual): diseño **13.1** ("Diseño de la
  tarjeta — original").
- **Testimonios**: **13.3** ("Testimonio dinámico — centrado").
- **En vez de la sección de testimonios actual**, usar un **mapa
  interactivo de casos de éxito**, con la referencia de
  [tactical-it.pe](https://tactical-it.pe) (sección de mapa) — reemplaza,
  no complementa, a los testimonios actuales del home.

## Selector de moneda (USD/PEN)

Antes marcado como pendiente en `estructura-home.md` (sin tasa de cambio
conectada). Ahora sí se define el **estilo**: switch/toggle, pero con
**colores sólidos según la moneda** (no un switch genérico gris). Sigue
pendiente conectar una tasa de cambio real antes de activarlo con datos
reales.

## Precios e IGV

- Los precios de producto se muestran **sin IGV** en catálogo/tienda.
- El **IGV (18%)** se agrega recién en **carrito** y **checkout**, como
  línea aparte (ver sección Carrito arriba).
- Afecta todo lo que hoy usa `FEATURED_PRODUCTS`/`price` tal cual — hay
  que definir si el dato base en `content.ts`/API pasa a ser "precio sin
  IGV" o si se calcula restando el IGV en el frontend.

## Estructura de la home (actualiza el orden de `estructura-home.md`)

1. Hero banner con video — estilo Modelo 9 (ver sección Hero arriba).
2. Marcas — carrusel infinito.
3. Información breve de FPTecnologi (redirige a "Sobre nosotros").
4. Servicios / soluciones.
5. Por qué elegirnos.
6. Categorías de producto.
7. Productos destacados (con las cards elegidas arriba).
8. Nuestros proyectos.
9. Nuestros clientes — carrusel por sectores.
10. Sección de partners.
11. Sección de contacto.
12. Pie de página.

Comparar contra las 10 secciones actuales de `estructura-home.md` al
implementar: se agregan "Nuestros proyectos" y "Nuestros clientes por
sectores" (nuevas), y "Nosotros" pasa a redirigir a una página propia en
vez de solo mostrar métricas inline.

## Pendiente de decidir / investigar (no es decisión de diseño)

- **Correo + dominio**: revisar si el correo (`ventasweb@fptecnologi.com`,
  etc.) se puede dejar en cPanel tal como está y mover solo la web a
  Hostinger, o si conviene mover **dominio + correo + web** completos a
  Hostinger. Depende de dónde está registrado hoy el dominio y qué plan de
  Hostinger se use — pendiente de revisar antes de tocar DNS/MX.

## Siguiente paso

Implementar estos puntos sobre la web pública (`apps/web-fptecnologi`) y
subir los cambios a GitHub junto con el resto de trabajo pendiente de la
Fase 2.
