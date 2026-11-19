export const EMPRESA = {
  nombre: "Company IMC E.I.R.L.",
  telefono: "+51 984 262 805",
  whatsapp: "https://wa.me/51984262805",
  correo: "ventas@companyimc.com",
  correo2: "marketing@companyimc.com",
  direccion: ["Pq. Manuel García Rosell", "Urb. Círculo Nro. 197", "Pueblo Libre, Lima"],
  horario: "Lun – Vie · 8:30 am a 6:30 pm",
};

export const NAV = [
  ["Inicio", "/"],
  ["Nosotros", "/nosotros/"],
  ["Servicios", "/servicios/"],
  ["Productos", "/productos/"],
  ["Perú Compras", "/peru-compras/"],
  ["Contacto", "/contacto/"],
] as const;

export const SERVICIOS = [
  { n: "computo", t: "Cómputo", d: "Computadoras de escritorio, portátiles y estaciones de trabajo para tu institución o empresa." },
  { n: "impresion", t: "Impresión", d: "Impresoras y multifuncionales para oficina, con insumos y soporte." },
  { n: "red", t: "Networking", d: "Equipos y soluciones de red para mantener a tu organización conectada." },
  { n: "servidor", t: "Servidores", d: "Infraestructura de servidores para respaldar y escalar tus sistemas." },
  { n: "software", t: "Software", d: "Licencias y soluciones de software, con seguridad y soporte especializado." },
] as const;

export const PROYECTOS = [
  { t: "Cableado estructurado", d: "Diseño e instalación de cableado de red ordenado, certificado y listo para crecer.", img: "/img/cableado.webp", n: "cable" },
  { t: "Implementación de centrales telefónicas", d: "Telefonía corporativa implementada de principio a fin: instalación, configuración y puesta en marcha.", img: "/img/telefonia.webp", n: "telefono" },
] as const;

export const PRODUCTOS = [
  { t: "Computadoras", img: "/img/computadora.webp" },
  { t: "Monitores", img: "/img/monitor.webp" },
  { t: "Impresoras", img: "/img/impresora.webp" },
  { t: "Proyectores", img: "/img/proyector.webp" },
] as const;

export const MARCAS = ["HP", "Dell", "Lenovo", "Microsoft", "Epson", "Hewlett Packard Enterprise", "Intel", "Cisco", "Fortinet", "Axis"];

export const VALORES = [
  { n: "megafono", t: "Equipo experto", d: "Contamos con un equipo de profesionales altamente capacitados y con amplia experiencia en el sector." },
  { n: "idea", t: "A tu medida", d: "Adaptamos nuestras soluciones a las necesidades específicas de cada cliente." },
  { n: "grafico", t: "Soporte integral", d: "Brindamos un servicio de soporte técnico integral para garantizar el óptimo funcionamiento de nuestras soluciones." },
] as const;

export const MOTIVOS = [
  "Analizamos tus requerimientos y te ofrecemos soluciones a medida que se adaptan a tu presupuesto y objetivos.",
  "Desde equipos de cómputo hasta sistemas de videovigilancia, contamos con un portafolio completo para cubrir todas tus necesidades tecnológicas.",
  "Trabajamos con las marcas más reconocidas del mercado para garantizar la calidad y confiabilidad de nuestras soluciones.",
  "Te acompañamos en cada etapa del proceso, desde la implementación hasta el soporte técnico continuo.",
];

export const PERU_COMPRAS = [
  { n: "megafono", t: "Fichas publicadas", d: "Facilitando tus adquisiciones estatales." },
  { n: "idea", t: "Facilidad de compra", d: "Contamos con diversas fichas publicadas para tu comodidad." },
  { n: "grafico", t: "Seguridad y confianza", d: "Nuestra logística atiende de manera directa a los clientes de Perú Compras." },
] as const;

export const PASOS = [
  { t: "Analizamos", d: "Entendemos tus requerimientos, presupuesto y objetivos." },
  { t: "Proponemos", d: "Te presentamos una solución a medida con las marcas adecuadas." },
  { t: "Implementamos", d: "Instalamos y ponemos en marcha cada equipo o sistema." },
  { t: "Acompañamos", d: "Soporte técnico continuo para que todo funcione óptimo." },
] as const;
