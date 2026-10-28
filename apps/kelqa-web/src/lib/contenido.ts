// Contenido del inicio, tomado del brochure comercial Kelqa (V1) y de la web anterior. Sin CMS todavía.

export const contacto = {
  telefono: '+51 933 098 493',
  telefonoHref: 'tel:+51933098493',
  whatsapp: '51933098493',
  correo: 'ventas@kelqa.com',
  redes: '@Kelqa',
};

export const waUrl = (texto: string) => `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}`;

export type Linea = {
  id: string;
  nombre: string;
  lema: string;
  texto: string;
  foto: string;
  productos: { nombre: string; img: string; detalle: string }[];
};

export const lineas: Linea[] = [
  {
    id: 'pinturas',
    nombre: 'Línea de Pinturas',
    lema: 'Calidad, resistencia y acabado profesional para cada proyecto.',
    texto: 'Fórmulas de alto rendimiento con gran adherencia, cobertura y color duradero: desde la señalización vial hasta interiores y exteriores.',
    foto: '/fotos/pintor.webp',
    productos: [
      { nombre: 'Pintura Vial Tráfico', img: '/fotos/trafico.webp', detalle: 'Máxima visibilidad para carreteras, estacionamientos y zonas urbanas.' },
      { nombre: 'Pintura Gloss', img: '/fotos/gloss.webp', detalle: 'Acabado brillante y elegante de alta durabilidad.' },
      { nombre: 'Pintura Arquitectónica', img: '/fotos/arquitectonica.webp', detalle: 'Protege y transforma espacios, por dentro y por fuera.' },
      { nombre: 'Pintura Base', img: '/fotos/base.webp', detalle: 'Prepara y sella la superficie para un acabado parejo.' },
    ],
  },
  {
    id: 'mobiliario',
    nombre: 'Línea de Mobiliario',
    lema: 'Diseño, confort y funcionalidad para cada espacio de trabajo.',
    texto: 'Sillas ergonómicas y mobiliario corporativo para oficinas, auditorios y áreas de atención que buscan productividad e imagen profesional.',
    foto: '/fotos/oficina.webp',
    productos: [
      { nombre: 'Línea Presidencial', img: '/fotos/silla-presidencial.webp', detalle: 'Confort y presencia para espacios ejecutivos.' },
      { nombre: 'Línea Gerencial', img: '/fotos/silla-gerencial.webp', detalle: 'Ergonomía y estilo para la oficina diaria.' },
      { nombre: 'Línea Cuero', img: '/fotos/silla-cuero.webp', detalle: 'Acabados en cuero que transmiten distinción.' },
      { nombre: 'Línea Butacas', img: '/fotos/butacas.webp', detalle: 'Resistentes para salas de espera y auditorios.' },
    ],
  },
  {
    id: 'construccion',
    nombre: 'Construcción y Emergencia',
    lema: 'Productos robustos para construcción y respuesta inmediata ante emergencias.',
    texto: 'Cubiertas, refugios y herramientas pensados para uso intensivo, instalación práctica y buen desempeño frente al clima.',
    foto: '/fotos/calaminas.webp',
    productos: [
      { nombre: 'Calaminas y Techos', img: '/fotos/calamina.webp', detalle: 'Cubiertas resistentes y de instalación práctica.' },
      { nombre: 'Carpas Humanitarias', img: '/fotos/carpa.webp', detalle: 'Refugio seguro y de armado rápido.' },
      { nombre: 'Herramientas', img: '/fotos/herramientas.webp', detalle: 'Precisión y durabilidad para obra y mantenimiento.' },
    ],
  },
];

export const razones = [
  { titulo: 'Calidad que dura', texto: 'Productos que integran buen rendimiento, durabilidad y cumplimiento de los estándares del mercado.' },
  { titulo: 'Precios competitivos', texto: 'Alternativas de alto valor que se ajustan al presupuesto real de cada proyecto.' },
  { titulo: 'Cobertura nacional', texto: 'Distribución a todo el Perú con un servicio oportuno en cada etapa.' },
  { titulo: 'Asesoría cercana', texto: 'Atención personalizada para proponer la solución precisa a cada necesidad.' },
];

export const valores = ['Innovación', 'Confianza', 'Calidad', 'Distinción'];

export const clientes = [
  { nombre: 'FP Tecnologi & System', logo: '/clientes/fp-tecnologi.svg' },
  { nombre: 'Fimav Perú', logo: '/clientes/fimav-peru.svg' },
  { nombre: 'Corporación JAE', logo: '/clientes/jae.webp' },
  { nombre: 'Pro Inversión', logo: '/clientes/pro-inversion.svg' },
];

export const testimonios = [
  {
    texto: 'En el desarrollo de nuestro mobiliario demostraron compromiso, profesionalismo y gran atención a los detalles. Cumplieron los plazos y el resultado superó nuestras expectativas.',
    autor: 'Gerente General',
    empresa: 'FP Tecnologi & System',
  },
  {
    texto: 'Sus materiales destacan por la calidad, durabilidad y cumplimiento de los estándares. El proceso de compra fue ágil y transparente, con atención personalizada en cada etapa.',
    autor: 'Cliente del sector',
    empresa: 'Construcción',
  },
  {
    texto: 'La calidad, eficiencia y confiabilidad de cada solución han superado nuestras expectativas. Recomendamos sus productos por su innovación y compromiso con el éxito de sus clientes.',
    autor: 'Equipo de compras',
    empresa: 'Corporación JAE',
  },
];
