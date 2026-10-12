# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primario: empresas e instituciones** (incluye entidades públicas) que compran equipos de cómputo por cotización: quien decide por TI busca continuidad y rendimiento, no solo precio. Necesitan factura (RUC), precio final, stock y entrega confirmados por un especialista.
- **Secundario: persona natural / consumidor final** que arma o compra una PC o componentes y cierra la compra por WhatsApp.

## Product Purpose

quamtu.com presenta y vende equipos de cómputo (PC de escritorio y workstations) y componentes de la marca Quamtu (Lima, Perú). Permite armar una PC pieza por pieza en 3D, comprar componentes sueltos, cotizar para una organización y coordinar la compra con un especialista. Éxito: que el visitante termine con una configuración clara y una solicitud de compra o cotización enviada.

## Positioning

Configuración de precisión: equipos armados a medida bajo estándares rigurosos (líneas TURING para escritorio y TURING WS para workstations), con armador 3D y asesoría con datos técnicos, en lugar de hardware genérico. "No construimos hardware convencional: diseñamos herramientas de ingeniería a la medida."

## Operating Context

- Los clientes públicos y corporativos piden cotización formal, factura y entrega; el consumidor final compra por WhatsApp.
- Hoy no hay pasarela de pago: la compra se coordina por WhatsApp (+51 975 646 074) y el pago en línea está marcado como "próximamente".
- Precios, placas madre y nombres de gabinete del catálogo web son referenciales hasta conectar la API del HUB (marca Quamtu).
- Ubicación central: Jr. Huaraz 1841, Breña, Lima. Sitio: www.quamtu.com.

## Capabilities and Constraints

- Armador 3D por pasos (gabinete, procesador, placa, memoria, video, disco, refrigeración, fuente) con validación de compatibilidad por socket y alerta de potencia de la fuente.
- Catálogo basado en el brochure: procesadores Intel Core 14.ª gen / Core Ultra y AMD Ryzen; RAM DDR5 16–128 GB; SSD 500 GB–4 TB; video NVIDIA RTX 6–32 GB; fuentes 650–1200 W 80 Plus Bronze/Gold; refrigeración de aire o líquida.
- Cotizador avanzado (`/cotizar`) que envía leads al módulo `cotizador` del HUB (requiere `HUB_MARCA_ID`) y continúa por WhatsApp.
- Texto de marca: se escribe "Quamtu" (no "QUAMTU" ni "quamtu") en prosa; los títulos van en mayúsculas por decisión del cliente.
- Decisiones abiertas (no afirmar en la web hasta que existan): pasarela de pago y facturación en línea; años de garantía y tiempos de soporte; zonas y plazos de envío; plazo de armado; cifra de equipos entregados; ficha técnica descargable; permiso expreso para mostrar logos de clientes públicos.

## Brand Commitments

- Manual de identidad corporativa: azul primario #238DC1 (debe predominar), azul secundario #385CAD, apoyo/texto #686058; tipografía Play (corporativa) y Calibri para web; logo en versión principal, negativo (blanco sobre azul) o blanco y negro, sin deformar ni recolorear.
- Brochure Quamtu v1: estética tecnológica oscura con marcos HUD y red de puntos; mensajes "El aliado tecnológico de su empresa", "Configuración a medida", "Asesoría especializada", "Garantía de continuidad".

## Evidence on Hand

- Brochure (PDF) con fotos de gabinetes, interior, ventilación, listado de configuraciones y logos de casos de éxito: Universidad Nacional Micaela Bastidas, SBS, Universidad Nacional José Faustino Sánchez Carrión, Municipalidad de Santa María, PRONIS, Municipalidad Provincial del Santa (extraídos en `public/clientes/`).
- Logo blanco (`public/brand/logo-blanco.png`) y recortes del brochure en `public/brand/`.
- Imágenes de producto: 36 renders generados desde los modelos 3D del armador y dos fotos reales de gabinetes del brochure (`public/productos/`).
- Ausentes (no fabricar): testimonios, cifras de clientes o equipos entregados, precios reales, plazos de garantía, fotos reales de componentes, ficha técnica, redes sociales.

## Product Principles

1. Decidir por datos técnicos, no por adjetivos: mostrar especificaciones y compatibilidad reales.
2. Dos públicos, un mismo camino claro: el consumidor arma y compra; la organización cotiza con factura.
3. Ver antes de comprar: el armado 3D es la prueba tangible de la configuración.
4. No afirmar lo que Quamtu no ha confirmado (garantías, plazos, envíos, cifras, clientes).
5. Cerrar siempre con una persona: la compra y la cotización terminan con un especialista.

## Accessibility & Inclusion

Sitio en español (Perú). Contraste mínimo AA (4.5:1 para texto normal), foco de teclado visible, `prefers-reduced-motion` respetado y diseño utilizable a 375 px.
