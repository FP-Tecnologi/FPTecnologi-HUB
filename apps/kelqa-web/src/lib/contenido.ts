// Contenido de la web, tomado del brochure comercial Kelqa (V1) y de la web anterior (kelqa.com). Sin CMS todavía.

export const contacto = {
  telefono: '+51 933 819 389',
  telefonoHref: 'tel:+51933819389',
  whatsapp: '51933819389',
  correo: 'ventas@kelqa.com',
  redes: '@Kelqa',
};

export const waUrl = (texto: string) => `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}`;

export type Producto = { nombre: string; img: string; detalle: string; descripcion: string };
export type Linea = {
  id: string;
  nombre: string;
  corto: string;
  lema: string;
  texto: string;
  foto: string;
  galeria: { src: string; alt: string }[];
  productos: Producto[];
};

export const lineas: Linea[] = [
  {
    id: 'pinturas',
    nombre: 'Línea de Pinturas',
    corto: 'Pinturas',
    lema: 'Calidad, resistencia y acabado profesional para cada proyecto.',
    texto: 'Fórmulas de alto rendimiento con gran adherencia, cobertura y color duradero: desde la señalización vial hasta interiores y exteriores.',
    foto: '/fotos/pintor.webp',
    galeria: [
      { src: '/fotos/trafico-banner.webp', alt: 'Kelqa Tráfico: la línea que define tu camino' },
      { src: '/fotos/vial-obra.webp', alt: 'Cuadrilla pintando señalización vial' },
      { src: '/fotos/pintor.webp', alt: 'Pintor aplicando pintura en una pared' },
    ],
    productos: [
      {
        nombre: 'Pintura Vial Tráfico',
        img: '/fotos/trafico.webp',
        detalle: 'Máxima visibilidad para carreteras, estacionamientos y zonas urbanas.',
        descripcion: 'Formulada para ofrecer máxima visibilidad, resistencia y precisión en la señalización. Su tecnología de alto rendimiento proporciona gran adherencia, brillo duradero y excelente desempeño incluso en condiciones exigentes. Ideal para carreteras, estacionamientos y zonas urbanas, garantizando seguridad y durabilidad en cada aplicación.',
      },
      {
        nombre: 'Pintura Gloss',
        img: '/fotos/gloss.webp',
        detalle: 'Acabado brillante y elegante de alta durabilidad.',
        descripcion: 'Ofrece acabados brillantes, elegantes y de alta durabilidad. Su fórmula de excelente cobertura y resistencia brinda superficies uniformes y de gran calidad estética, convirtiéndola en la opción ideal para proyectos interiores y exteriores que buscan un acabado superior.',
      },
      {
        nombre: 'Pintura Arquitectónica',
        img: '/fotos/arquitectonica.webp',
        detalle: 'Protege y transforma espacios, por dentro y por fuera.',
        descripcion: 'Pensada para proteger y transformar espacios con calidad y estilo. Su fórmula de alto rendimiento asegura excelente cobertura, resistencia y un acabado uniforme, proporcionando color duradero y una apariencia impecable tanto en interiores como en exteriores.',
      },
      {
        nombre: 'Pintura Base',
        img: '/fotos/base.webp',
        detalle: 'Prepara y sella la superficie para un acabado parejo.',
        descripcion: 'Desarrollada para preparar, proteger y optimizar las superficies antes del acabado final. Su fórmula de alto rendimiento favorece una excelente adherencia, uniformidad y cobertura, ayudando a mejorar la aplicación de la pintura y a prolongar su durabilidad.',
      },
      {
        nombre: 'Pintura Súper Látex Mate',
        img: '/fotos/pintor.webp',
        detalle: 'Acabado mate suave y uniforme para interiores y exteriores.',
        descripcion: 'Diseñada para brindar acabados suaves, uniformes y de excelente presencia estética. Su fórmula de alto rendimiento ofrece gran cobertura, buena adherencia y un acabado mate elegante, ideal para renovar y proteger paredes en interiores y exteriores.',
      },
    ],
  },
  {
    id: 'mobiliario',
    nombre: 'Línea de Mobiliario',
    corto: 'Mobiliario',
    lema: 'Diseño, confort y funcionalidad para cada espacio de trabajo.',
    texto: 'Sillas ergonómicas y mobiliario corporativo para oficinas, auditorios y áreas de atención que buscan productividad e imagen profesional.',
    foto: '/fotos/oficina.webp',
    galeria: [
      { src: '/fotos/cuero-ambiente.webp', alt: 'Sillón de cuero en un despacho ejecutivo' },
      { src: '/fotos/butacas-sala.webp', alt: 'Butacas en una sala de espera' },
      { src: '/fotos/silla-foto.webp', alt: 'Silla ergonómica de oficina' },
    ],
    productos: [
      {
        nombre: 'Línea Presidencial',
        img: '/fotos/silla-presidencial.webp',
        detalle: 'Confort y presencia para espacios ejecutivos.',
        descripcion: 'Diseñada para ofrecer máximo confort, elegancia y presencia en espacios ejecutivos de alto nivel. Combina materiales de calidad, diseño sofisticado y ergonomía, brindando una experiencia superior que refleja liderazgo y distinción en cada detalle.',
      },
      {
        nombre: 'Línea Gerencial',
        img: '/fotos/silla-gerencial.webp',
        detalle: 'Ergonomía y estilo para la oficina diaria.',
        descripcion: 'Creada para espacios de trabajo que requieren equilibrio entre comodidad, funcionalidad y estilo. Su diseño ergonómico y acabados modernos aportan eficiencia y elegancia, ideales para oficinas que buscan productividad y profesionalismo.',
      },
      {
        nombre: 'Línea Cuero',
        img: '/fotos/silla-cuero.webp',
        detalle: 'Acabados en cuero que transmiten distinción.',
        descripcion: 'Pensada para quienes buscan distinción y durabilidad, esta línea destaca por sus acabados en cuero que aportan elegancia, resistencia y comodidad. Perfecta para ambientes corporativos que desean transmitir una imagen sofisticada y profesional.',
      },
      {
        nombre: 'Línea Butacas',
        img: '/fotos/butacas.webp',
        detalle: 'Resistentes para salas de espera y auditorios.',
        descripcion: 'Desarrollada para brindar comodidad y funcionalidad en espacios colectivos, como auditorios, salas de espera y áreas de atención. Su diseño práctico y resistente garantiza confort y durabilidad en entornos de uso constante.',
      },
    ],
  },
  {
    id: 'construccion',
    nombre: 'Construcción y Emergencia',
    corto: 'Construcción y Emergencia',
    lema: 'Productos robustos para construcción y respuesta inmediata ante emergencias.',
    texto: 'Cubiertas, refugios y herramientas pensados para uso intensivo, instalación práctica y buen desempeño frente al clima.',
    foto: '/fotos/calaminas.webp',
    galeria: [
      { src: '/fotos/construccion-escena.webp', alt: 'Carpa, calaminas y herramientas Kelqa' },
      { src: '/fotos/calaminas.webp', alt: 'Calaminas y tejas corrugadas' },
      { src: '/fotos/obra.webp', alt: 'Obra en construcción' },
    ],
    productos: [
      {
        nombre: 'Calaminas y Techos',
        img: '/fotos/calamina.webp',
        detalle: 'Cubiertas resistentes y de instalación práctica.',
        descripcion: 'Fabricadas para ofrecer resistencia, protección y durabilidad, las calaminas son una solución eficiente para cubiertas y estructuras en diversos entornos. Su diseño permite una instalación práctica y un óptimo desempeño frente a las condiciones climáticas, garantizando seguridad y confiabilidad en cada proyecto.',
      },
      {
        nombre: 'Carpas Humanitarias',
        img: '/fotos/carpa.webp',
        detalle: 'Refugio seguro y de armado rápido.',
        descripcion: 'Desarrolladas para brindar refugio seguro, resistente y funcional en situaciones de emergencia. Su estructura robusta y materiales de alta calidad permiten una instalación rápida y una protección eficiente frente a diferentes condiciones climáticas, convirtiéndolas en una solución confiable para apoyo humanitario.',
      },
      {
        nombre: 'Herramientas',
        img: '/fotos/herramientas.webp',
        detalle: 'Precisión y durabilidad para obra y mantenimiento.',
        descripcion: 'Diseñadas para ofrecer rendimiento, precisión y durabilidad en cada trabajo. Fabricadas con materiales resistentes y pensadas para un uso intensivo, estas herramientas brindan eficiencia y confiabilidad en proyectos de construcción y mantenimiento.',
      },
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

// Valores con su definición (web anterior).
export const valoresDetalle = [
  { nombre: 'Innovación', texto: 'Buscamos siempre nuevas formas de mejorar.' },
  { nombre: 'Confianza', texto: 'Construimos relaciones sólidas y transparentes.' },
  { nombre: 'Calidad', texto: 'Garantizamos excelencia en cada producto y servicio.' },
  { nombre: 'Distinción', texto: 'Transmitimos modernidad y estilo en nuestra identidad.' },
];

export const mision =
  'Brindar soluciones confiables, eficientes y de alta calidad que impulsen el desarrollo de proyectos en diversos sectores, a través de una sólida cobertura de distribución a nivel nacional, un servicio cercano y un firme compromiso con la satisfacción, crecimiento y confianza de nuestros clientes.';
export const vision =
  'Ser una marca reconocida por su excelencia, cercanía y compromiso, consolidándonos como un aliado estratégico para nuestros clientes en cada etapa de sus proyectos. Aspiramos a construir relaciones comerciales sólidas y duraderas, basadas en la confianza, la responsabilidad, la transparencia y un servicio oportuno.';

// "¿Por qué escoger Kelqa?" de la web anterior.
export const propuesta = [
  'Somos una marca moderna y sofisticada que ofrece soluciones confiables, alineadas a las necesidades del consumidor actual.',
  'Nuestra propuesta combina innovación y tradición, logrando un equilibrio que nos convierte en una marca versátil, accesible y auténtica.',
  'Más que una línea de productos, Kelqa es un símbolo de confianza, modernidad y adaptabilidad, con una identidad que fusiona la calidad clásica con la frescura contemporánea.',
];

// Preguntas frecuentes de la página de contacto de la web anterior.
export const preguntas = [
  {
    p: '¿Kelqa ofrece productos confiables?',
    r: 'Sí. Kelqa se especializa en soluciones robustas y funcionales para construcción y ayuda humanitaria, lo que exige altos estándares de calidad. Cada producto está diseñado para resistir condiciones exigentes, desde climas extremos hasta entornos de emergencia.',
  },
  {
    p: '¿Qué experiencia tiene Kelqa en el sector?',
    r: 'Contamos con trayectoria en proyectos de infraestructura y asistencia social, colaborando con entidades públicas, ONGs y empresas privadas. Adaptamos nuestros productos a distintos escenarios, desde obras civiles hasta campamentos temporales.',
  },
  {
    p: '¿Kelqa se preocupa por el impacto social?',
    r: 'Definitivamente. No solo proveemos materiales: contribuimos a mejorar las condiciones de vida en comunidades vulnerables, con productos pensados para facilitar el acceso a vivienda, agua, saneamiento y seguridad.',
  },
  {
    p: '¿Los productos de Kelqa son accesibles?',
    r: 'Sí. Equilibramos calidad y costo para que nuestras soluciones sean viables en contextos de emergencia o presupuestos ajustados, y así gobiernos, ONGs y empresas adquieran materiales duraderos sin comprometer sus recursos.',
  },
  {
    p: '¿Kelqa responde con rapidez ante necesidades urgentes?',
    r: 'En situaciones de crisis el tiempo es vital. Por eso priorizamos la logística eficiente y el abastecimiento oportuno, con productos listos para desplegarse en terreno, una capacidad clave para la ayuda humanitaria y la reconstrucción.',
  },
];

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
