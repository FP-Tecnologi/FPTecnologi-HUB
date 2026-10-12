---
name: Quamtu
description: Banco de pruebas de ingeniería de noche: azul marino, vidrio, marcos HUD y una sola luz de marca.
colors:
  azul-quamtu: "#238DC1"
  azul-profundo: "#385CAD"
  azul-claro: "#6CC3EE"
  azul-boton: "#1B79ab"
  marino-fondo: "#060B17"
  marino-panel: "#0A1426"
  linea-fina: "#16284A"
  tinta-apoyo: "#686058"
  texto-principal: "#DBE7F3"
  texto-secundario: "#90A1B9"
typography:
  display:
    fontFamily: "Play, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Play, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Play, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Carlito, Calibri, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Play, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.azul-boton}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  card-hud:
    backgroundColor: "{colors.marino-panel}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.sm}"
    padding: "24px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.texto-secundario}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
---

# Design System: Quamtu

## Overview

**Creative North Star: "El Banco de Pruebas"**

Un laboratorio de ingeniería visto de noche. El fondo es un azul marino casi negro, los paneles son de cristal azulado con un borde fino y un marco de esquina que recuerda la pantalla de un instrumento, y una sola luz, el azul de marca, señala lo que importa: el precio, la acción, el dato. La web no grita ni brilla; mide. Todo lo que se afirma se acompaña de una especificación o de una cifra verificable.

La densidad es media y ordenada: listas con líneas finas, fichas con llamadas numeradas y tablas comparativas en vez de tarjetas repetidas. El ritmo alterna secciones amplias con franjas compactas, y las bandas de fondo se turnan entre marino y marino-panel. El 3D del armador es la pieza protagonista; el resto de la interfaz se hace a un lado para dejarlo hablar.

Los dos públicos, empresas y consumidor final, ven el mismo sistema: el tono es de ingeniería de precisión, no de tienda gamer ni de catálogo genérico.

**Key Characteristics:**
- Fondo marino y vidrio azulado; una sola familia cromática azul.
- Marcos HUD en las esquinas de los paneles (herencia del brochure).
- Títulos en mayúsculas Play, texto en Carlito.
- Datos técnicos visibles: especificaciones, numeración, notas al pie de figura.
- Movimiento con propósito: entrada CSS del hero y revelado al hacer scroll; respeta `prefers-reduced-motion`.

## Colors

Una paleta fiel al manual de identidad, de un solo matiz azul sobre marino, con el verde de WhatsApp como única nota ajena.

### Primary
- **Azul Quamtu** (#238DC1): el azul primario del manual. Bordes activos, iconos, brillos suaves y acentos; es el color que debe predominar en la marca.
- **Azul de Botón** (#1B79AB): un tono más profundo del primario, usado solo como relleno de botones y chips con texto blanco para llegar a 4.8:1 de contraste.

### Secondary
- **Azul Profundo** (#385CAD): el secundario del manual. Cierra el degradado de los botones primarios y marca fondos de apoyo.
- **Azul Claro** (#6CC3EE): el primario aclarado para texto y detalles sobre fondo oscuro (precios, énfasis en títulos, etiquetas, marcos HUD). 10:1 sobre el fondo.

### Neutral
- **Marino Fondo** (#060B17): el lienzo de toda la web.
- **Marino Panel** (#0A1426): bandas alternas y paneles.
- **Línea Fina** (#16284A): divisores y bordes inactivos.
- **Texto Principal** (#DBE7F3): texto del cuerpo sobre marino.
- **Texto Secundario** (#90A1B9): texto de apoyo, etiquetas y descripciones (7:1 sobre marino).
- **Tinta de Apoyo** (#686058): el color de apoyo del manual, para textos sobre fondos claros; hoy casi sin uso en la web oscura.

### Named Rules
**La Regla de la Única Luz.** Un solo matiz de acento, el azul de marca, en tres intensidades (primario, profundo, claro). Ningún otro color aparece, salvo el verde de WhatsApp en su botón.

**La Regla del Contraste Honesto.** El texto blanco solo va sobre Azul de Botón (#1B79AB) o más oscuro; el Azul Quamtu exacto (#238DC1) nunca lleva texto blanco pequeño.

## Typography

**Display Font:** Play (con system-ui)
**Body Font:** Carlito (con Calibri y system-ui)

**Character:** Play aporta el carácter técnico y de instrumento que pide el manual; Carlito, métricamente igual a Calibri, mantiene la lectura cómoda y fiel a la tipografía web de la marca.

### Hierarchy
- **Display** (700, clamp(3rem, 7vw, 4.5rem), 1.05): solo el H1 del hero, en mayúsculas.
- **Headline** (700, clamp(1.875rem, 4vw, 3rem), 1.1): títulos de sección en mayúsculas, con una frase de énfasis en Azul Claro.
- **Title** (700, 1.25rem, 1.25): subtítulos, nombres de línea y de paso.
- **Body** (400, 1.05rem, 1.6): texto corrido, con medida acotada y `text-wrap: pretty`.
- **Label** (700, 0.75rem, 0.04em): botones, etiquetas y chips; mínimo 12 px.

### Named Rules
**La Regla de la Marca Escrita.** En texto corrido la marca se escribe "Quamtu", nunca "QUAMTU" ni "quamtu" (manual B.04). Los títulos van en mayúsculas por decisión del cliente, pero los nombres de producto usan `normal-case`.

**La Regla del Título Equilibrado.** Todo H1 a H3 usa `text-wrap: balance`; los énfasis son color sólido, nunca degradado ni brillo animado.

## Layout

Contenedor centrado de 1280 px (`max-w-7xl`) con 20 px de margen lateral; el armador y el pie usan hasta 1600 px. Las secciones de la home alternan entre 80 y 128 px de aire vertical, con una franja de confianza compacta como pausa. Las cuadrículas colapsan a una columna bajo 768 px. El armador es una pantalla partida: asistente a la izquierda (560 px) y 3D a la derecha; en celular el 3D queda fijo arriba y la barra de navegación fija abajo.

Responsive: a 375 px no hay desborde horizontal; el selector de usos pasa a cuadrícula de 2 columnas, el comparador se apila por filas y el cotizador gana una barra fija inferior con el total.

### Named Rules
**La Regla de las Listas con Línea.** Para agrupar información se usan listas con líneas finas (`divide-y`) antes que tarjetas; las tarjetas HUD se reservan para producto y acciones.

## Elevation & Depth

Capas tonales con vidrio: la profundidad viene del contraste entre el fondo marino, los paneles de cristal azulado con borde fino y una sombra suave y desplazada. No hay halos de brillo ni sombras de color.

### Shadow Vocabulary
- **Panel HUD** (`box-shadow: inset 0 1px 0 rgba(108,195,238,.12), 0 12px 32px rgba(0,0,0,.35)`): paneles y tarjetas con marco.
- **Botón primario** (`box-shadow: 0 8px 22px rgba(10,40,70,.5)`): se eleva a `0 12px 28px rgba(10,40,70,.6)` al pasar el mouse.
- **Flotante** (`box-shadow: 0 8px 24px rgba(0,0,0,.45)`): botón de WhatsApp.

### Named Rules
**La Regla de la Sombra Desplazada.** Toda sombra lleva desplazamiento vertical y desenfoque amplio; un halo sin desplazamiento es decoración y no se usa.

## Shapes

Formas rectas para el contenido y píldoras para las acciones. Los paneles y fotos llevan esquinas casi rectas (4 px) con un marco HUD de 14 px en la esquina superior izquierda e inferior derecha; los botones y chips son píldoras completas; los logos de clientes son círculos de cristal, como en el brochure.

## Components

### Buttons
- **Shape:** píldora completa (9999px).
- **Primary:** relleno degradado de Azul de Botón a Azul Profundo, texto blanco Play 700 en mayúsculas, padding 16px 32px, con icono de 15–18 px.
- **Hover / Focus:** sube 2 px y la sombra se amplía; anillo de foco de 2 px en Azul Claro con 3 px de separación.
- **Secondary:** borde de 1 px en Azul Claro al 50%, fondo transparente; al pasar el mouse se llena de azul al 18%.

### Chips
- **Style:** píldora con borde de Línea Fina y texto secundario; activo con borde azul y relleno azul al 15%.
- **State:** filtros de tienda y cotizador; en celular se deslizan sin barra visible.

### Cards / Containers
- **Corner Style:** casi recto (4 px) con marco HUD de esquinas.
- **Background:** degradado de azul al 14% sobre Marino Panel al 80%, con desenfoque de fondo.
- **Shadow Strategy:** Panel HUD (ver Elevation).
- **Border:** 1 px de Azul Quamtu al 45%.
- **Internal Padding:** 24–32 px.

### Inputs / Fields
- **Style:** borde de 1 px en Línea Fina, fondo marino al 60%, radio de 8 px, texto de 16 px.
- **Focus:** el borde pasa a Azul Quamtu.
- **Error:** mensaje en rojo bajo el campo; placeholder en #8294AD (6:1).

### Navigation
Cabecera fija y translúcida con desenfoque; logo blanco a la izquierda, enlaces Play en mayúsculas de 13 px y separación amplia, carrito con insignia y botón COTIZAR con icono a la derecha. Bajo 1024 px los enlaces pasan a un menú desplegable.

### Armador 3D (componente de firma)
Asistente de 8 pasos con progreso circular numerado, tarjetas de pieza con imagen, y un visor 3D con presupuesto animado arriba y etiquetas con línea punteada que aparecen solo al elegir o señalar una pieza. Es la experiencia central del producto.

## Do's and Don'ts

### Do:
- **Do** usar Azul Claro (#6CC3EE) para precios, énfasis y marcos; es el único color de señal.
- **Do** agrupar con listas de línea fina (`divide-y` en #16284A) antes que con tarjetas.
- **Do** acompañar cada afirmación de calidad con un dato (potencia, nivel 80 Plus, especificación).
- **Do** mantener texto informativo en 12 px o más y contraste de 4.5:1 o más.
- **Do** escribir "Quamtu" en prosa y usar `normal-case` en nombres de producto dentro de títulos.
- **Do** entrar el hero con animación solo CSS y respetar `prefers-reduced-motion`.

### Don't:
- **Don't** usar degradado de texto ni brillo animado en títulos; el énfasis es color sólido.
- **Don't** poner halos de brillo sin desplazamiento; toda sombra lleva desplazamiento vertical.
- **Don't** usar texto blanco pequeño sobre #238DC1; usar #1B79AB o más oscuro.
- **Don't** repetir la misma receta de título y cuadrícula de tarjetas iguales entre secciones.
- **Don't** afirmar garantías, plazos, envíos o cifras que Quamtu no ha confirmado (ver PRODUCT.md).
- **Don't** usar rojos, verdes o morados como acento: la paleta es de un solo matiz azul.
