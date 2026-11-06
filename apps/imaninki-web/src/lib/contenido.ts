// Contenido de la web, tomado del brochure comercial Imaninki (V1) y de la web anterior (imaninki.com). Sin CMS todavía.

export const contacto = {
  telefono: '+51 933 098 493',
  telefonoHref: 'tel:+51933098493',
  whatsapp: '51933098493',
  correo: 'ventas@imaninki.com',
  redes: '@Imaninki · @imaninki.peru',
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
    foto: '/fotos/trafico-banner.webp',
    galeria: [
      { src: '/fotos/vial-obra.webp', alt: 'Cuadrilla pintando señalización vial' },
      { src: '/fotos/pintor.webp', alt: 'Pintor aplicando pintura en una pared' },
      { src: '/fotos/base-pared.webp', alt: 'Pintura base Imaninki para preparar paredes' },
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
        img: '/fotos/latex.webp',
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
      { src: '/fotos/sala-oficina.webp', alt: 'Silla ergonómica en una oficina moderna' },
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
    texto: 'Cubiertas, refugios y herramientas pensados para uso intensivo, instalación práctica y buen desempeño frente al clima. También ofrecemos carretillas y camas plegables para obra y ayuda humanitaria.',
    foto: '/fotos/calaminas.webp',
    galeria: [
      { src: '/fotos/construccion-escena.webp', alt: 'Carpa, calaminas y herramientas Imaninki' },
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

export const valores = ['Confianza', 'Responsabilidad', 'Transparencia', 'Servicio oportuno'];

// Los valores salen del texto del brochure ("confianza, responsabilidad, transparencia y servicio oportuno").
export const valoresDetalle = [
  { nombre: 'Confianza', texto: 'Construimos relaciones comerciales sólidas y duraderas con cada cliente.' },
  { nombre: 'Responsabilidad', texto: 'Cumplimos lo que prometemos, en cada pedido y en cada etapa del proyecto.' },
  { nombre: 'Transparencia', texto: 'Información clara sobre nuestros productos, fichas y condiciones de venta.' },
  { nombre: 'Servicio oportuno', texto: 'Atención cercana y ágil, con cobertura de distribución a nivel nacional.' },
];

export const mision =
  'Brindar soluciones confiables, eficientes y de alta calidad que impulsen el desarrollo de proyectos en diversos sectores, a través de una sólida cobertura de distribución a nivel nacional, un servicio cercano y un firme compromiso con la satisfacción, crecimiento y confianza de nuestros clientes.';
export const vision =
  'Ser una marca reconocida por su excelencia, cercanía y compromiso, consolidándonos como un aliado estratégico para nuestros clientes en cada etapa de sus proyectos. Aspiramos a construir relaciones comerciales sólidas y duraderas, basadas en la confianza, la responsabilidad, la transparencia y un servicio oportuno.';

// Cierre del brochure ("¡Estamos listos!").
export const propuesta = [
  'Para Imaninki, brindar un buen servicio significa acompañar al cliente de manera cercana y comprender los desafíos de cada proyecto.',
  'Proponemos alternativas eficientes, oportunas y alineadas con tus objetivos: la calidad, la atención personalizada y el compromiso son nuestro sello.',
  'Buscamos consolidarnos como un aliado estratégico que aporte seguridad, agilidad y soluciones para el crecimiento y el éxito de nuestros clientes.',
];

export const preguntas = [
  { p: '¿Qué productos ofrece Imaninki?', r: 'Tres líneas: pinturas (vial Tráfico, Gloss, arquitectónica, base y súper látex mate), mobiliario corporativo (sillas presidenciales, gerenciales, de cuero y butacas) y productos para construcción y emergencia (calaminas, carpas de ayuda humanitaria, camas plegables, carretillas y herramientas).' },
  { p: '¿Cómo puedo cotizar?', r: 'Escríbenos por WhatsApp al +51 933 098 493 o al correo ventas@imaninki.com contándonos tu proyecto. Los productos se venden por cotización y te respondemos con la alternativa que mejor se ajuste.' },
  { p: '¿Atienden licitaciones públicas y privadas?', r: 'Sí. Contamos con disponibilidad mediante ventas directas y licitaciones públicas y privadas, y nuestras fichas están publicadas en Perú Compras.' },
  { p: '¿Hacen envíos a todo el país?', r: 'Contamos con una sólida cobertura de distribución a nivel nacional. Indícanos tu ciudad al cotizar y coordinamos la entrega.' },
  { p: '¿Quién fabrica los productos?', r: 'Somos una empresa peruana dedicada a la fabricación y comercialización de productos de calidad, con un control de calidad riguroso para asegurar el mejor producto al cliente.' },
];

