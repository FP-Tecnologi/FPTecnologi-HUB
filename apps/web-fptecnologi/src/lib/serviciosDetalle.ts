/*
 * Contenido de la página de cada servicio (/servicios/[slug]). Textos base
 * redactados a partir de lo que ofrece FPTecnologi (servicio llave en mano:
 * diagnóstico, diseño, equipos de marcas autorizadas, instalación y soporte),
 * sin cifras ni clientes inventados. Se conecta al CMS en la siguiente etapa.
 */
export type ServicioDetalle = {
  intro: string;
  incluye: string[];
  beneficios: { titulo: string; texto: string }[];
  sectores: string[];
  faqs: { p: string; r: string }[];
};

const FAQ_COMUNES = {
  visita: { p: '¿La visita técnica tiene costo?', r: 'No. Visitamos tu sede, levantamos la información y te enviamos una propuesta sin compromiso.' },
  soporte: { p: '¿Qué pasa después de la instalación?', r: 'Te acompañamos con soporte técnico local y gestionamos la garantía oficial de los equipos con cada marca.' },
};

export const SERVICIOS_DETALLE: Record<string, ServicioDetalle> = {
  'seguridad-ciudadana': {
    intro:
      'Diseñamos e implementamos sistemas de videovigilancia y control de accesos para municipios, condominios y empresas: cámaras en los puntos críticos, grabación centralizada y monitoreo desde una central.',
    incluye: [
      'Estudio de puntos críticos y cobertura',
      'Cámaras IP y de lectura de placas',
      'Grabación centralizada (NVR / servidores)',
      'Central de monitoreo con videowall',
      'Control de accesos y alarmas',
      'Enlaces de red y fibra para las cámaras',
    ],
    beneficios: [
      { titulo: 'Monitoreo 24/7', texto: 'Una sola central para ver y gestionar todas las cámaras.' },
      { titulo: 'Evidencia confiable', texto: 'Grabaciones de alta calidad disponibles cuando las necesitas.' },
      { titulo: 'Crece contigo', texto: 'Suma cámaras y sedes sin rehacer la infraestructura.' },
    ],
    sectores: ['Municipalidades', 'Condominios', 'Empresas', 'Almacenes y plantas'],
    faqs: [
      { p: '¿Puedo ver las cámaras desde el celular?', r: 'Sí, configuramos el acceso remoto seguro desde el celular o la computadora.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
  'escuelas-y-universidades': {
    intro:
      'Equipamos aulas, laboratorios y campus con la tecnología que necesita la educación de hoy: pantallas interactivas, laboratorios de cómputo y conectividad estable en todo el campus.',
    incluye: [
      'Pantallas interactivas para aulas',
      'Laboratorios de cómputo completos',
      'Wi-Fi para todo el campus',
      'Cableado estructurado y racks',
      'Servidores y almacenamiento académico',
      'Capacitación a docentes',
    ],
    beneficios: [
      { titulo: 'Clases más dinámicas', texto: 'Contenido interactivo que mejora la participación.' },
      { titulo: 'Conectividad estable', texto: 'Internet confiable en aulas, laboratorios y áreas comunes.' },
      { titulo: 'Soporte dedicado', texto: 'Acompañamiento técnico durante el año académico.' },
    ],
    sectores: ['Colegios', 'Institutos', 'Universidades', 'Centros de capacitación'],
    faqs: [
      { p: '¿Capacitan a los docentes en el uso de las pantallas?', r: 'Sí, la implementación incluye capacitación para que el equipo docente las use desde el primer día.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
  'servidores-para-empresas': {
    intro:
      'Dimensionamos, instalamos y configuramos servidores a la medida de tu operación: desde un servidor de archivos para una oficina hasta la infraestructura de virtualización de una empresa.',
    incluye: [
      'Dimensionamiento según tu carga de trabajo',
      'Servidores torre y rack de marcas líderes',
      'Virtualización y sistemas operativos',
      'Almacenamiento y respaldo',
      'Instalación en rack y energía (UPS)',
      'Garantía oficial y soporte',
    ],
    beneficios: [
      { titulo: 'Rendimiento a medida', texto: 'Ni de más ni de menos: lo que tu operación necesita.' },
      { titulo: 'Continuidad', texto: 'Componentes redundantes y respaldo para evitar caídas.' },
      { titulo: 'Garantía oficial', texto: 'Equipos originales con soporte del fabricante.' },
    ],
    sectores: ['Pymes', 'Corporativos', 'Instituciones públicas', 'Salud'],
    faqs: [
      { p: '¿Migran la información del servidor anterior?', r: 'Sí, planificamos la migración para que tu operación no se detenga.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
  'hoteles-y-restaurantes': {
    intro:
      'Tecnología pensada para la operación diaria del rubro hotelero y gastronómico: Wi-Fi para huéspedes, TV, puntos de venta y la red que conecta todo.',
    incluye: [
      'Wi-Fi para huéspedes y personal',
      'Sistemas de TV para habitaciones',
      'Equipos para punto de venta',
      'Cámaras de seguridad',
      'Cableado y red de datos',
      'Soporte técnico local',
    ],
    beneficios: [
      { titulo: 'Mejor experiencia', texto: 'Huéspedes y clientes conectados sin interrupciones.' },
      { titulo: 'Operación ágil', texto: 'Caja, cocina y recepción trabajando en la misma red.' },
      { titulo: 'Un solo proveedor', texto: 'Equipos, instalación y soporte con el mismo equipo.' },
    ],
    sectores: ['Hoteles', 'Hostales', 'Restaurantes', 'Cafeterías'],
    faqs: [
      { p: '¿Separan la red de huéspedes de la red interna?', r: 'Sí, configuramos redes independientes para proteger la información del negocio.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
  videoconferencia: {
    intro:
      'Equipamos salas de reunión de todos los tamaños con cámaras, audio y pantallas que se integran con Teams, Zoom o Meet, para reuniones híbridas que se ven y se escuchan bien.',
    incluye: [
      'Diseño de la sala según su tamaño',
      'Cámaras y barras de video',
      'Micrófonos y audio de sala',
      'Pantallas y soportes',
      'Integración con Teams, Zoom o Meet',
      'Capacitación a usuarios',
    ],
    beneficios: [
      { titulo: 'Reuniones sin fricción', texto: 'Un clic para empezar, sin cables ni configuraciones.' },
      { titulo: 'Audio y video claros', texto: 'Todos se ven y se escuchan, estén en la sala o remotos.' },
      { titulo: 'Compatibilidad', texto: 'Funciona con las plataformas que tu equipo ya usa.' },
    ],
    sectores: ['Corporativos', 'Educación', 'Sector público', 'Salud'],
    faqs: [
      { p: '¿Funciona con Microsoft Teams y Zoom?', r: 'Sí, trabajamos con equipos certificados para las principales plataformas.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
  'data-centers': {
    intro:
      'Diseñamos e implementamos data centers y cuartos de comunicaciones, desde el rack y la energía hasta el cableado estructurado y la climatización.',
    incluye: [
      'Diseño del cuarto de datos',
      'Racks, gabinetes y ordenamiento',
      'Cableado estructurado certificado',
      'Energía redundante (UPS)',
      'Climatización de precisión',
      'Monitoreo y documentación',
    ],
    beneficios: [
      { titulo: 'Infraestructura ordenada', texto: 'Cableado y equipos documentados, fáciles de mantener.' },
      { titulo: 'Alta disponibilidad', texto: 'Energía y climatización pensadas para no detenerse.' },
      { titulo: 'Escalable', texto: 'Espacio y capacidad para crecer sin rehacer todo.' },
    ],
    sectores: ['Corporativos', 'Instituciones públicas', 'Educación', 'Industria'],
    faqs: [
      { p: '¿Entregan la certificación del cableado?', r: 'Sí, el cableado estructurado se entrega certificado y documentado.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
  'datos-empresariales': {
    intro:
      'Protegemos la información de tu empresa con soluciones de respaldo, almacenamiento y recuperación, para que un error, una falla o un ataque no detengan tu operación.',
    incluye: [
      'Diagnóstico de la información crítica',
      'Almacenamiento en red (NAS / SAN)',
      'Copias de respaldo automáticas',
      'Respaldo fuera de sitio o en la nube',
      'Plan de recuperación ante desastres',
      'Pruebas de restauración',
    ],
    beneficios: [
      { titulo: 'Información segura', texto: 'Copias automáticas y protegidas de tus datos.' },
      { titulo: 'Recuperación rápida', texto: 'Un plan probado para volver a operar cuanto antes.' },
      { titulo: 'Tranquilidad', texto: 'Tu equipo se enfoca en el negocio, no en los respaldos.' },
    ],
    sectores: ['Pymes', 'Corporativos', 'Salud', 'Estudios profesionales'],
    faqs: [
      { p: '¿Cada cuánto se hacen los respaldos?', r: 'Definimos la frecuencia contigo según qué tan crítica es cada información.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
  'soluciones-cloud': {
    intro:
      'Llevamos tu infraestructura a la nube de forma ordenada: evaluamos qué conviene migrar, lo migramos sin detener tu operación y te ayudamos a controlar los costos.',
    incluye: [
      'Evaluación de lo que conviene migrar',
      'Diseño de la arquitectura en la nube',
      'Migración de servidores y datos',
      'Correo y colaboración en la nube',
      'Seguridad y accesos',
      'Monitoreo y optimización de costos',
    ],
    beneficios: [
      { titulo: 'Flexibilidad', texto: 'Crece o reduce recursos según tu operación.' },
      { titulo: 'Acceso desde donde estés', texto: 'Tu equipo trabaja desde la oficina o de forma remota.' },
      { titulo: 'Costos claros', texto: 'Pagas lo que usas, con acompañamiento para optimizarlo.' },
    ],
    sectores: ['Pymes', 'Corporativos', 'Educación', 'Startups'],
    faqs: [
      { p: '¿Se detiene mi operación durante la migración?', r: 'Planificamos la migración por etapas para evitar interrupciones.' },
      FAQ_COMUNES.visita,
      FAQ_COMUNES.soporte,
    ],
  },
};
