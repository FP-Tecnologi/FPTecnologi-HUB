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
    title: 'Soluciones tecnológicas implementadas por especialistas',
    text: 'Seguridad, videoconferencia, cloud y data centers — diseñados e implementados a medida de tu empresa.',
    cta: { label: 'Ver servicios', href: '#servicios' },
    image: '/images/solutions/data-centers.jpg',
    imageAlt: 'Data center — servicios TI FPTecnologi',
    kind: 'photo',
  },
  {
    key: 'tienda',
    tabLabel: 'Tienda',
    eyebrow: 'Tienda B2B',
    title: 'Equipamiento con stock local, listo para despachar',
    text: 'Monitores, laptops y servidores de las principales marcas, con distribución autorizada y precio real.',
    cta: { label: 'Ver catálogo', href: '#catalogo' },
    image: '/images/hero/laptop-cutout.png',
    imageAlt: 'Laptop Dell — catálogo FPTecnologi',
    kind: 'photo',
  },
  {
    key: 'partners',
    tabLabel: 'Partners',
    eyebrow: 'Programa de Partners',
    title: 'Sumate como integrador o revendedor autorizado',
    text: 'Precios y beneficios especiales para partners — cotización directa y soporte comercial dedicado.',
    cta: { label: 'Conocer el programa', href: '#partners' },
    image: null,
    imageAlt: '',
    kind: 'abstract',
  },
] as const;

export const SOLUTIONS = [
  {
    title: 'Seguridad ciudadana',
    slug: 'seguridad-ciudadana',
    tag: 'Somos expertos en',
    icon: 'shield',
    image: '/images/solutions/seguridad.jpg',
  },
  {
    title: 'Escuelas y universidades',
    slug: 'escuelas-y-universidades',
    tag: 'Soluciones para',
    icon: 'academic',
    image: '/images/solutions/escuelas.jpg',
  },
  {
    title: 'Servidores para empresas',
    slug: 'servidores-para-empresas',
    tag: 'Soluciones de',
    icon: 'server',
    image: '/images/solutions/servidores.jpg',
  },
  {
    title: 'Hoteles y restaurantes',
    slug: 'hoteles-y-restaurantes',
    tag: 'Soluciones para',
    icon: 'building',
    image: '/images/solutions/hoteles.jpg',
  },
  {
    title: 'Videoconferencia',
    slug: 'videoconferencia',
    tag: 'Soluciones de',
    icon: 'video',
    image: '/images/solutions/videoconferencia.jpg',
  },
  {
    title: 'Data centers',
    slug: 'data-centers',
    tag: 'Implementamos',
    icon: 'database',
    image: '/images/solutions/data-centers.jpg',
  },
  {
    title: 'Datos empresariales',
    slug: 'datos-empresariales',
    tag: 'Gestión y respaldo de',
    icon: 'cloud-upload',
    image: '/images/solutions/datos-empresariales.jpg',
  },
  {
    title: 'Soluciones cloud',
    slug: 'soluciones-cloud',
    tag: 'Soluciones de',
    icon: 'cloud',
    image: '/images/solutions/cloud.jpg',
  },
] as const;

/* Categorías reales de la Tienda (tabs del catálogo en fptecnologi.com). */
export const TIENDA_CATEGORIES = [
  { title: 'Monitores', slug: 'monitores' },
  { title: 'Laptops', slug: 'laptops' },
  { title: 'Pantallas interactivas', slug: 'pantallas-interactivas' },
  { title: 'Servidores', slug: 'servidores' },
] as const;

export const PARTNER_BRANDS = [
  { name: 'Dell', logo: '/images/brands/dell.png' },
  { name: 'HP', logo: '/images/brands/hp.png' },
  { name: 'Lenovo', logo: '/images/brands/lenovo.png' },
  { name: 'Samsung', logo: '/images/brands/samsung.webp' },
  { name: 'Xerox', logo: '/images/brands/xerox.png' },
  { name: 'Sharp', logo: '/images/brands/sharp.webp' },
  { name: 'Sophos', logo: '/images/brands/sophos.png' },
  { name: 'ZKTeco', logo: '/images/brands/zkteco.png' },
  { name: 'Optoma', logo: '/images/brands/optoma.png' },
  { name: 'Shure', logo: '/images/brands/shure.png' },
  { name: 'ViewSonic', logo: '/images/brands/viewsonic.webp' },
  { name: 'Nureva', logo: '/images/brands/nureva.png' },
  { name: 'ScreenBeam', logo: '/images/brands/screenbeam.png' },
] as const;

export const PARTNER_STEPS = [
  {
    step: '1',
    title: '¿Necesitas asesoría especializada?',
    text: 'Contanos qué necesita tu empresa y te asignamos un especialista del rubro.',
  },
  {
    step: '2',
    title: 'Contacta con nuestro equipo de ventas',
    text: 'Cotización sin compromiso, con stock local y tiempos de entrega reales.',
  },
  {
    step: '3',
    title: 'Consulta por el programa de Partners FP',
    text: 'Precios y beneficios especiales para integradores y revendedores.',
  },
] as const;

export const CONTACT_INFO = {
  address: 'Jr. Huaraz 1841, Breña — Lima, Perú',
  phoneVentas: '+51 970 614 881',
  phoneVentasWeb: '+51 908 856 286',
  email: 'ventasweb@fptecnologi.com',
};

/*
 * Cotizador real de fptecnologi.com — el botón principal del header no debe
 * ir a "Contacto" (ya existe como sección/página propia): va acá, que es
 * donde de verdad se genera una cotización.
 */
export const COTIZADOR_URL = 'https://fptecnologi.com/landing-cotiza-tu-tiempo/';

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
  },
  {
    title: 'Servicios TI',
    text: 'Seguridad, videoconferencia, cloud y data centers — implementados por especialistas, a cotización.',
    cta: 'Cotizar servicio',
    href: '#servicios',
    icon: 'wrench',
  },
] as const;

/* Métricas reales, contadas de este mismo relevamiento (no inventadas). */
export const STATS = [
  { value: 13, suffix: '+', label: 'Marcas distribuidas' },
  { value: 8, suffix: '', label: 'Categorías de soluciones IT' },
  { value: 2, suffix: '', label: 'Líneas de negocio: tienda y servicios' },
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
  },
  {
    name: 'Monitor Dell P2724DEB 27" LCD IPS QHD USB-C',
    sku: 'P2724DEB',
    brand: 'Dell',
    price: 591,
    priceBefore: 630,
    image: '/images/products/dell-p2724deb.png',
  },
  {
    name: 'Monitor HP E27 G5, 27" FHD IPS',
    sku: '6N4E2AA#ABA',
    brand: 'HP',
    price: 240,
    priceBefore: 265,
    image: '/images/products/hp-e27g5.png',
  },
  {
    name: 'Monitor Lenovo ThinkVision T24i-30, 23.8" WLED IPS',
    sku: '63CFMAR1LA',
    brand: 'Lenovo',
    price: 220,
    priceBefore: 229,
    image: '/images/products/lenovo-t24i30.png',
  },
] as const;

/* Diferenciadores reales (no testimonios inventados — evitamos reseñas
 * falsas atribuidas a clientes que no existen). */
export const WHY_CHOOSE_US = [
  { title: 'Stock local', text: 'Sin depender de importación por pedido — despacho inmediato.' },
  { title: 'Distribución autorizada', text: 'Marcas originales con garantía oficial, no gris.' },
  { title: 'Cotización sin compromiso', text: 'Un especialista te arma la propuesta, vos decidís.' },
  { title: 'Programa de Partners', text: 'Precios y beneficios especiales para integradores.' },
] as const;
