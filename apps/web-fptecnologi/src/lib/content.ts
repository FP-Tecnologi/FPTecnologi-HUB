/*
 * Contenido real relevado de fptecnologi.com (categorías, marcas, contacto)
 * al 2026-09-14 — adaptado como copy propio para el modelo 1, no copiado
 * literal de su HTML.
 */

/*
 * Los 3 hero del home — uno por audiencia (ver estructura acordada): Servicios,
 * Tienda y Partners. Cada uno con imagen, título, descripción y botón propios.
 * Servicios/Tienda usan fotos reales; Partners no tiene foto real sin texto
 * quemado en el sitio de origen, así que usa un panel de marca (abstracto).
 */
export const HERO_SLIDES = [
  {
    key: 'servicios',
    tabLabel: 'Servicios',
    eyebrow: 'Servicios TI',
    title: 'Soluciones tecnológicas para tu empresa',
    titleLead: 'Soluciones tecnológicas',
    titleAccent: 'para tu empresa',
    text: 'Seguridad, videoconferencia, cloud y data centers — diseñados e implementados a medida de tu empresa.',
    cta: { label: 'Ver servicios', href: '#servicios' },
    image: '/herobanner/Servicios.webp',
    imageAlt: 'Rack de servidores — servicios TI FPTecnologi',
    kind: 'photo',
  },
  {
    key: 'tienda',
    tabLabel: 'Tienda',
    eyebrow: 'Tienda B2B',
    title: 'Equipamiento con stock, listo para despachar',
    titleLead: 'Equipamiento con stock,',
    titleAccent: 'listo para despachar',
    text: 'Monitores, laptops y servidores de las principales marcas, con distribución autorizada y precio real.',
    cta: { label: 'Ver catálogo', href: '#catalogo' },
    image: '/herobanner/tienda.webp',
    imageAlt: 'Equipos de la tienda B2B FPTecnologi',
    kind: 'photo',
  },
  {
    key: 'partners',
    tabLabel: 'Partners',
    eyebrow: 'Programa de Partners',
    title: 'Súmate como Partner FP',
    titleLead: 'Súmate como',
    titleAccent: 'Partner FP',
    text: 'Precios y beneficios especiales para partners — cotización directa y soporte comercial dedicado.',
    cta: { label: 'Ver programa', href: '#partners' },
    image: '/herobanner/partner.webp',
    imageAlt: 'Programa de Partners FPTecnologi',
    kind: 'photo',
  },
] as const;

export const SOLUTIONS = [
  {
    title: 'Seguridad ciudadana',
    slug: 'seguridad-ciudadana',
    tag: 'Somos expertos en',
    icon: 'shield',
    image: '/images/solutions/seguridad.jpg',
    description: 'Cámaras, control de accesos y videovigilancia integrada para municipios, condominios y empresas.',
  },
  {
    title: 'Escuelas y universidades',
    slug: 'escuelas-y-universidades',
    tag: 'Soluciones para',
    icon: 'academic',
    image: '/images/solutions/escuelas.jpg',
    description: 'Equipamiento y conectividad para aulas, laboratorios y campus, con soporte técnico dedicado.',
  },
  {
    title: 'Servidores para empresas',
    slug: 'servidores-para-empresas',
    tag: 'Soluciones de',
    icon: 'server',
    image: '/images/solutions/servidores.jpg',
    description: 'Servidores dimensionados a tu operación, con instalación, configuración y garantía oficial.',
  },
  {
    title: 'Hoteles y restaurantes',
    slug: 'hoteles-y-restaurantes',
    tag: 'Soluciones para',
    icon: 'building',
    image: '/images/solutions/hoteles.jpg',
    description: 'Redes, TV y sistemas de gestión pensados para la operación diaria del rubro hotelero y gastronómico.',
  },
  {
    title: 'Videoconferencia',
    slug: 'videoconferencia',
    tag: 'Soluciones de',
    icon: 'video',
    image: '/images/solutions/videoconferencia.jpg',
    description: 'Salas de reunión equipadas con cámaras, audio e integración a las plataformas que ya usas.',
  },
  {
    title: 'Data centers',
    slug: 'data-centers',
    tag: 'Implementamos',
    icon: 'database',
    image: '/images/solutions/data-centers.jpg',
    description: 'Diseño e implementación de data centers, desde el rack hasta el cableado estructurado.',
  },
  {
    title: 'Datos empresariales',
    slug: 'datos-empresariales',
    tag: 'Gestión y respaldo de',
    icon: 'cloud-upload',
    image: '/images/solutions/datos-empresariales.jpg',
    description: 'Respaldo, almacenamiento y políticas de recuperación para que la información de tu empresa esté segura.',
  },
  {
    title: 'Soluciones cloud',
    slug: 'soluciones-cloud',
    tag: 'Soluciones de',
    icon: 'cloud',
    image: '/images/solutions/cloud.jpg',
    description: 'Migración e infraestructura en la nube, a medida del tamaño y presupuesto de tu operación.',
  },
] as const;

/* Categorías reales de la Tienda (tabs del catálogo en fptecnologi.com).
 * image: foto de stock (Unsplash, licencia libre) para las tarjetas de
 * categoría del Modelo 7 -- Monitores usa una foto real de producto propia,
 * el resto (sin foto de producto propia todavía) usa una foto de stock
 * acorde al rubro, pedida y verificada visualmente por el usuario. */
export const TIENDA_CATEGORIES = [
  { title: 'Monitores', slug: 'monitores', image: '/images/products/dell-p2724deb.png', imageFit: 'contain' },
  { title: 'Laptops', slug: 'laptops', image: '/images/modelo7/cat-laptops.webp', imageFit: 'cover' },
  { title: 'Videoconferencia', slug: 'proyectores-pantallas-interactivas', image: '/images/modelo7/cat-pantallas.webp', imageFit: 'cover' },
  { title: 'Servidores', slug: 'servidores', image: '/images/solutions/servidores.jpg', imageFit: 'cover' },
  { title: 'Impresión', slug: 'impresion', image: '/images/modelo9/hero-office.jpg', imageFit: 'cover' },
] as const;

/* Atributos técnicos genéricos de cualquier línea de hardware TI (no
 * inventamos specs de producto puntuales) -- bloque "Rendimiento" del
 * Modelo 7. */
export const PERFORMANCE_FEATURES = [
  { title: 'Rendimiento', text: 'Equipos pensados para no perder tiempo: arranque rápido y respuesta inmediata en el día a día.' },
  { title: 'Compatibilidad', text: 'Funcionan con Windows, macOS y Linux, sin configuraciones complicadas ni drivers raros.' },
  { title: 'Durabilidad', text: 'Materiales y componentes certificados, pensados para uso empresarial diario, no de consumo.' },
  { title: 'Precisión', text: 'Cada cotización se arma a medida de tu operación, sin sobrantes ni faltantes.' },
] as const;

/* Marcas que distribuimos (logos en /public/images/marcas). `solido`: el logo
 * viene dentro de una caja o fondo de color, así que en el carrusel se muestra
 * a color siempre (como silueta saldría un bloque sólido). */
export const PARTNER_BRANDS: { name: string; logo: string; solido?: boolean }[] = [
  { name: 'Dell', logo: '/images/marcas/dell-partner.svg', solido: true },
  { name: 'HP', logo: '/images/marcas/hp-amplify-partner.svg', solido: true },
  { name: 'HPE', logo: '/images/marcas/hpe-marca.svg' },
  { name: 'Lenovo', logo: '/images/marcas/lenovo.svg', solido: true },
  { name: 'Apple', logo: '/images/marcas/apple-partner.svg' },
  { name: 'Microsoft', logo: '/images/marcas/microsoft.svg' },
  { name: 'Cisco', logo: '/images/marcas/cisco.svg' },
  { name: 'Fortinet', logo: '/images/marcas/fortinet.svg' },
  { name: 'Huawei', logo: '/images/marcas/huawei.svg' },
  { name: 'Samsung', logo: '/images/marcas/samsung.svg' },
  { name: 'LG', logo: '/images/marcas/lg.svg', solido: true },
  { name: 'Intel', logo: '/images/marcas/intel.svg' },
  { name: 'IBM', logo: '/images/marcas/ibm-partner.svg', solido: true },
  { name: 'Epson', logo: '/images/marcas/epson.svg' },
  { name: 'Xerox', logo: '/images/marcas/xerox.svg' },
  { name: 'ViewSonic', logo: '/images/marcas/viewsonic.svg' },
  { name: 'Optoma', logo: '/images/marcas/optoma.svg' },
  { name: 'Nureva', logo: '/images/marcas/nureva.svg' },
  { name: 'Logitech', logo: '/images/marcas/logitech.svg' },
  { name: 'Poly', logo: '/images/marcas/poly.svg' },
  { name: 'Jabra', logo: '/images/marcas/jabra.svg', solido: true },
  { name: 'Axis', logo: '/images/marcas/axis.svg' },
  { name: 'Hanwha', logo: '/images/marcas/hanwha.svg' },
  { name: 'Hikvision', logo: '/images/marcas/hikvision.svg' },
  { name: 'AxxonSoft', logo: '/images/marcas/axxonsoft.svg' },
  { name: 'DJI', logo: '/images/marcas/dji.svg' },
  { name: 'Sophos', logo: '/images/marcas/sophos.svg' },
  { name: 'Kaspersky', logo: '/images/marcas/kaspersky.svg' },
  { name: 'ESET', logo: '/images/marcas/eset.svg', solido: true },
  { name: 'Bitdefender', logo: '/images/marcas/bitdefender.svg' },
  { name: 'SonicWall', logo: '/images/marcas/sonicwall.svg' },
  { name: 'Xcitium', logo: '/images/marcas/xcitium.svg' },
  { name: 'APC', logo: '/images/marcas/apc.svg' },
  { name: 'Eaton', logo: '/images/marcas/eaton.svg' },
  { name: 'Vertiv', logo: '/images/marcas/vertiv.svg' },
  { name: 'Schneider', logo: '/images/marcas/schneider.svg' },
  { name: 'Salicru', logo: '/images/marcas/salicru.svg' },
  { name: 'Panduit', logo: '/images/marcas/panduit.svg' },
  { name: 'CommScope', logo: '/images/marcas/commscope.svg' },
  { name: 'ThinkServer', logo: '/images/marcas/thinkserver.svg' },
  { name: 'Satra', logo: '/images/marcas/satra.svg' },
  { name: 'i3Connect', logo: '/images/marcas/i3connect.svg' },
  { name: 'LAIA', logo: '/images/marcas/laia.svg' },
  { name: 'TCL', logo: '/images/marcas/tcl.svg', solido: true },
  { name: 'Adobe', logo: '/images/marcas/adobe.svg' },
  { name: 'ChatGPT', logo: '/images/marcas/chatgpt.svg' },
  { name: 'Copilot', logo: '/images/marcas/copilot.svg' },
  { name: 'Gemini', logo: '/images/marcas/gemini.svg' },
];


// Insignias (sección Partners) de partner con el nombre y el nivel (Gold, Elite, Platinum...)
// escritos debajo. Para sumar/quitar una marca se edita esta
// lista y su archivo en /public/images/partners.
export const PARTNER_BADGES = [
  { name: 'Axis Communications', logo: '/images/partners/axis.png', level: 'Gold' },
  { name: 'Dell Technologies', logo: '/images/partners/dell-titanium.png', level: 'Titanium' },
  { name: 'Fortinet', logo: '/images/partners/fortinet.png', level: 'Advocate Integrator' },
  { name: 'Genetec', logo: '/images/partners/genetec.png', level: 'Elite' },
  { name: 'Hanwha', logo: '/images/partners/hanwha.png', level: 'Platinum' },
  { name: 'HP', logo: '/images/partners/hp.png', level: 'Commercial Specialist' },
  { name: 'Hewlett Packard Enterprise', logo: '/images/partners/hpe.png', level: 'Business' },
  { name: 'Milestone Systems', logo: '/images/partners/milestone.png', level: 'Premier' },
  { name: 'Vertiv', logo: '/images/partners/vertiv.png', level: 'Platinum' },
];

/* Slug de marca para /marcas/[slug] ("ScreenBeam" -> "screenbeam"). */
export const brandSlug = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '-');

export const PARTNER_STEPS = [
  {
    step: '1',
    title: '¿Necesitas asesoría especializada?',
    text: 'Te asignamos un especialista según lo que necesita tu empresa.',
  },
  {
    step: '2',
    title: 'Contacta con nuestro equipo de ventas',
    text: 'Cotización sin compromiso, con stock local y entrega real.',
  },
  {
    step: '3',
    title: 'Consulta por el programa de Partners',
    text: 'Precios y beneficios para integradores y revendedores.',
  },
] as const;

// Redes oficiales (tomadas del footer de fptecnologi.com, 2026-09-30).
export const SOCIAL_LINKS = [
  { red: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/fptecnologisystem/' },
  { red: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/fptecnologi/' },
  { red: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/fp-tecnologi-system/' },
  { red: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/channel/UCELd7u4oPpWzbGVvIVzfoxg' },
  { red: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/51960951976' },
] as const;

export const CONTACT_INFO = {
  address: 'Jr. Huaraz 1841, Breña — Lima, Perú',
  phoneVentas: '+51 970 614 881',
  phoneVentasWeb: '+51 908 856 286',
  email: 'ventasweb@fptecnologi.com',
};

/*
 * Áreas de WhatsApp de la burbuja de chat -- todas con el mismo número por
 * ahora (pedido explícito: "crear áreas pero mismo número, luego cambiamos
 * el número"). Cuando haya números reales por área, solo se edita `number`
 * acá, nada más en el sitio referencia un wa.me hardcodeado.
 */
// contact/phone: nombre del asesor y número que se MUESTRA en el widget --
// provisionales (999 999 999) hasta tener los reales. `number` es el que usa
// el link de WhatsApp (sigue siendo el real para que el chat funcione).
// photo: fotos de ejemplo (Unsplash) -- reemplazar por las de los asesores reales.
export const WHATSAPP_AREAS = [
  { label: 'Ventas', contact: 'Juan', phone: '999 999 999', number: '51908856286', photo: '/images/asesores/juan.jpg' },
  { label: 'Servicios', contact: 'María', phone: '999 999 999', number: '51908856286', photo: '/images/asesores/maria.jpg' },
  { label: 'Tienda', contact: 'Carlos', phone: '999 999 999', number: '51908856286', photo: '/images/asesores/carlos.jpg' },
  { label: 'Partners', contact: 'Lucía', phone: '999 999 999', number: '51908856286', photo: '/images/asesores/lucia.jpg' },
] as const;

/*
 * Cotizador real de fptecnologi.com — el botón principal del header no debe
 * ir a "Contacto" (ya existe como sección/página propia): va acá, que es
 * donde de verdad se genera una cotización.
 */
// Página interna (app/cotizador) -- antes apuntaba al cotizador externo
// de fptecnologi.com/landing-cotiza-tu-tiempo/.
export const COTIZADOR_URL = '/cotizador';

/*
 * Dos líneas de negocio reales (ver AGENTS.md): ecommerce B2B con stock y
 * servicios TI por cotización. El home debe dejarlo claro desde el hero.
 */
export const BUSINESS_PATHS = [
  {
    title: 'Tienda B2B',
    text: 'Equipamiento TI con stock local: monitores, laptops, servidores y más, listos para despachar.',
    cta: 'Ver catálogo',
    href: '#catalogo',
    icon: 'cart',
    tag: 'Tienda',
    tags: ['Stock local', 'Envío rápido'],
  },
  {
    title: 'Servicios TI',
    text: 'Seguridad, videoconferencia, cloud y data centers — implementados por especialistas, a cotización.',
    cta: 'Cotizar servicio',
    href: '#servicios',
    icon: 'wrench',
    tag: 'Servicios',
    tags: ['A medida', 'Especialistas'],
  },
] as const;

/* Métricas reales, contadas de este mismo relevamiento (no inventadas). */
export const STATS = [
  { value: 13, suffix: '+', label: 'Marcas distribuidas' },
  { value: 8, suffix: '', label: 'Categorías de soluciones IT' },
  { value: 2, suffix: '', label: 'Líneas de negocio: tienda y servicios' },
] as const;

// Checklist de valores de la empresa -- reemplaza las 3 métricas de STATS
// en la sección Nosotros de la home (se sentía muy genérico un contador de
// números ahí; esto habla directamente de por qué elegir a FPTecnologi).
// Solo título corto, sin descripción aparte (pedido explícito del usuario).
// Reducido a 2 (antes 4), cada uno una frase un poco más larga en vez de
// 2 palabras sueltas.
export const COMPANY_VALUES = [
  // Uno por línea de negocio: servicios TI y tienda (e-commerce B2B).
  { title: 'Servicios TI a medida: diseño, instalación y soporte técnico local' },
  { title: 'Tienda online B2B con stock local y despacho inmediato' },
] as const;

/* Productos reales del catálogo (nombre, SKU, precio, marca) — monitores
 * relevados en fptecnologi.com el 2026-09-14, con foto real del producto. */
export const FEATURED_PRODUCTS = [
  {
    name: 'Monitor ASUS BE279QSK 27" FHD IPS',
    sku: '90LM04P1-B023B0',
    brand: 'ASUS',
    price: 289,
    priceBefore: 310,
    image: '/images/products/asus-be279qsk.png',
    // Placeholder: foto repetida hasta tener las reales (3 por producto).
    images: ['/images/products/asus-be279qsk.png', '/images/products/asus-be279qsk.png', '/images/products/asus-be279qsk.png'],
  },
  {
    name: 'Monitor Dell P2724DEB 27" LCD IPS QHD USB-C',
    sku: 'P2724DEB',
    brand: 'Dell',
    price: 591,
    priceBefore: 630,
    image: '/images/products/dell-p2724deb.png',
    // Placeholder: foto repetida hasta tener las reales (3 por producto).
    images: ['/images/products/dell-p2724deb.png', '/images/products/dell-p2724deb.png', '/images/products/dell-p2724deb.png'],
  },
  {
    name: 'Monitor HP E27 G5, 27" FHD IPS',
    sku: '6N4E2AA#ABA',
    brand: 'HP',
    price: 240,
    priceBefore: 265,
    image: '/images/products/hp-e27g5.png',
    images: ['/images/products/hp-e27g5.png', '/images/products/hp-e27g5-2.png', '/images/products/hp-e27g5-3.png'],
  },
  {
    name: 'Monitor Lenovo ThinkVision T24i-30, 23.8" WLED IPS',
    sku: '63CFMAR1LA',
    brand: 'Lenovo',
    price: 220,
    priceBefore: 229,
    image: '/images/products/lenovo-t24i30.png',
    // Placeholder: la 3ra repite la 1ra hasta tener la real.
    images: ['/images/products/lenovo-t24i30.png', '/images/products/lenovo-t24i30-2.png', '/images/products/lenovo-t24i30.png'],
  },
] as const;

/* Diferenciadores reales (no testimonios inventados — evitamos reseñas
 * falsas atribuidas a clientes que no existen). */
export const WHY_CHOOSE_US = [
  { title: 'Stock local', text: 'Sin depender de importación por pedido — despacho inmediato.' },
  { title: 'Distribución autorizada', text: 'Marcas originales con garantía oficial, no gris.' },
  { title: 'Cotización sin compromiso', text: 'Un especialista te arma la propuesta, tú decides.' },
  { title: 'Programa de Partners', text: 'Precios y beneficios especiales para integradores.' },
] as const;

/* Misión, visión y valores de la página Nosotros (la página les pone el ícono). El asistente virtual los lee de acá. */
export const NOSOTROS_PILARES = [
  {
    titulo: 'Misión',
    texto: 'Equipar a las empresas peruanas con la tecnología correcta para su operación, con asesoría honesta, stock local y soporte técnico cercano.',
  },
  {
    titulo: 'Visión',
    texto: 'Ser el aliado tecnológico de referencia para empresas e instituciones del Perú, reconocido por cumplir lo que promete.',
  },
  {
    titulo: 'Valores',
    texto: 'Transparencia en cada cotización, compromiso con los plazos y relaciones de largo plazo con clientes y partners.',
  },
] as const;
