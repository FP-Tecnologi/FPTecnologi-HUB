/*
 * Ficha informativa de cada marca aliada (landing en /marcas/[slug]). Texto propio, sin cifras que cambien con el tiempo.
 * Para sumar otra marca: agregar su entrada aquí con el mismo slug que usa brandSlug() (minúsculas, guiones).
 * Las marcas sin ficha siguen mostrando solo sus productos de la tienda.
 */

export interface MarcaInfo {
  /** Nombre comercial tal como se muestra. */
  nombre: string;
  /** Logo (/public). */
  logo: string;
  /** Logo del encabezado si conviene otro (o null para no mostrarlo: p. ej. insignias verticales). */
  logoHero?: string | null;
  /** Una frase bajo el título. */
  lema: string;
  /** Datos rápidos: etiqueta + valor. */
  datos: { etiqueta: string; valor: string }[];
  /** Quién es la marca (1-2 párrafos). */
  quienes: string[];
  /** Líneas de producto o soluciones. */
  lineas: { titulo: string; texto: string }[];
  /** Para qué tipo de cliente o necesidad sirve. */
  ideal: string[];
  /** Colores de la marca (aprox. de su identidad): primario, oscuro para fondos y si el primario es claro (texto oscuro encima). */
  colores: { primario: string; oscuro: string; claro?: boolean };
  /** Sitio oficial. */
  web: string;
  /** Nombre en PARTNER_BADGES para mostrar el nivel de partner de FPTecnologi (si aplica). */
  badge?: string;
}

export const MARCAS_INFO: Record<string, MarcaInfo> = {
  hp: {
    nombre: 'HP',
    logo: '/images/marcas/hp-amplify-partner.svg',
    lema: 'Computación y impresión para el trabajo de todos los días.',
    datos: [
      { etiqueta: 'Fundada', valor: '1939, Palo Alto (EE. UU.)' },
      { etiqueta: 'Especialidad', valor: 'Laptops, PC, estaciones de trabajo e impresión' },
      { etiqueta: 'Categoría', valor: 'Equipos de oficina y negocio' },
    ],
    quienes: [
      'HP nació en 1939 de la mano de Bill Hewlett y Dave Packard y es una de las marcas de tecnología más reconocidas del mundo. Desde 2015, HP Inc. se enfoca en computadoras personales e impresión, mientras que la parte de infraestructura empresarial pasó a Hewlett Packard Enterprise.',
      'Su portafolio para empresas se distingue por la seguridad integrada en el equipo, la facilidad de administración para áreas de TI y una amplia gama de formatos: desde laptops ligeras hasta estaciones de trabajo para diseño e ingeniería.',
    ],
    lineas: [
      { titulo: 'Laptops de negocio', texto: 'Series EliteBook y ProBook: equipos ligeros, con seguridad y conectividad pensadas para trabajo móvil.' },
      { titulo: 'Computadoras de escritorio', texto: 'EliteDesk y ProDesk, en formato torre, compacto o mini PC, para oficinas, aulas y puntos de atención.' },
      { titulo: 'Estaciones de trabajo', texto: 'ZBook y Z by HP para diseño, ingeniería, edición y cargas de trabajo exigentes.' },
      { titulo: 'Monitores', texto: 'Pantallas para oficina y diseño, con distintos tamaños y conectividad para escritorios compartidos.' },
      { titulo: 'Impresión', texto: 'Impresoras y multifuncionales LaserJet y OfficeJet para oficinas pequeñas hasta áreas de alto volumen.' },
      { titulo: 'Accesorios', texto: 'Teclados, mouse, docks, mochilas y repuestos originales para completar cada puesto de trabajo.' },
    ],
    ideal: ['Oficinas y áreas administrativas', 'Instituciones educativas', 'Equipos de diseño e ingeniería', 'Empresas que estandarizan su flota de equipos'],
    colores: { primario: '#0096D6', oscuro: '#0B3A5B' },
    web: 'https://www.hp.com',
    badge: 'HP',
  },

  dell: {
    nombre: 'Dell',
    logo: '/images/marcas/dell-partner.svg',
    lema: 'De la laptop al centro de datos, con un solo proveedor.',
    datos: [
      { etiqueta: 'Fundada', valor: '1984, Texas (EE. UU.)' },
      { etiqueta: 'Especialidad', valor: 'PC, servidores y almacenamiento' },
      { etiqueta: 'Categoría', valor: 'Equipos y infraestructura de TI' },
    ],
    quienes: [
      'Dell Technologies fue fundada por Michael Dell en 1984 y hoy abarca desde computadoras para el puesto de trabajo hasta servidores, almacenamiento y soluciones para centros de datos.',
      'Su fortaleza está en cubrir toda la cadena de TI de una organización con productos que se administran de forma coherente, además de servicios de garantía y soporte técnico del fabricante.',
    ],
    lineas: [
      { titulo: 'Laptops de negocio', texto: 'Latitude para movilidad corporativa, con opciones de seguridad y administración centralizada.' },
      { titulo: 'Escritorio y estaciones de trabajo', texto: 'OptiPlex para oficina y Precision para diseño, ingeniería y análisis de datos.' },
      { titulo: 'Servidores', texto: 'PowerEdge: servidores en torre y rack para virtualización, bases de datos y aplicaciones críticas.' },
      { titulo: 'Almacenamiento', texto: 'Soluciones PowerStore y PowerVault para guardar, proteger y escalar la información de la empresa.' },
      { titulo: 'Monitores', texto: 'Líneas UltraSharp y para oficina, con buena reproducción de color y ergonomía.' },
      { titulo: 'Garantía y soporte', texto: 'Planes de servicio ProSupport y garantías extendidas para reducir tiempos de parada.' },
    ],
    ideal: ['Empresas que renuevan su flota de PC', 'Áreas de TI que modernizan su infraestructura', 'Proyectos de virtualización y respaldo', 'Entidades con requisitos de soporte formal'],
    colores: { primario: '#007DB8', oscuro: '#06324F' },
    web: 'https://www.dell.com',
    badge: 'Dell Technologies',
  },

  hpe: {
    nombre: 'HPE',
    logo: '/images/marcas/hpe-marca.svg',
    lema: 'Infraestructura empresarial: servidores, redes y nube híbrida.',
    datos: [
      { etiqueta: 'Creada', valor: '2015 (Hewlett Packard Enterprise)' },
      { etiqueta: 'Especialidad', valor: 'Servidores, redes y almacenamiento' },
      { etiqueta: 'Categoría', valor: 'Infraestructura de centros de datos' },
    ],
    quienes: [
      'Hewlett Packard Enterprise nació en 2015, cuando Hewlett-Packard se dividió en dos compañías: HP Inc. para computadoras e impresión, y HPE para la infraestructura de las empresas.',
      'Su propuesta combina equipos de centro de datos con modelos de consumo flexibles, para que las organizaciones administren sus aplicaciones tanto en sus instalaciones como en la nube.',
    ],
    lineas: [
      { titulo: 'Servidores', texto: 'Familia ProLiant en torre y rack, para desde una sucursal hasta el centro de datos principal.' },
      { titulo: 'Redes', texto: 'Soluciones Aruba de switching y WiFi para oficinas, campus y sedes distribuidas.' },
      { titulo: 'Almacenamiento', texto: 'Arreglos y almacenamiento definido por software para datos críticos y respaldo.' },
      { titulo: 'Nube híbrida', texto: 'HPE GreenLake: infraestructura bajo un modelo de pago por uso administrado desde un solo lugar.' },
      { titulo: 'Cómputo de alto rendimiento', texto: 'Sistemas para investigación, simulación e inteligencia artificial.' },
      { titulo: 'Servicios', texto: 'Soporte, instalación y mantenimiento del fabricante para mantener la operación continua.' },
    ],
    ideal: ['Centros de datos y salas de servidores', 'Empresas con varias sedes', 'Proyectos de virtualización y nube privada', 'Redes inalámbricas y de campus'],
    colores: { primario: '#01A982', oscuro: '#064B3D' },
    web: 'https://www.hpe.com',
    badge: 'Hewlett Packard Enterprise',
  },

  axis: {
    nombre: 'Axis Communications',
    logo: '/images/marcas/axis.svg',
    lema: 'Pionera en video en red para seguridad y analítica.',
    datos: [
      { etiqueta: 'Fundada', valor: '1984, Lund (Suecia)' },
      { etiqueta: 'Hito', valor: 'Primera cámara de red del mundo, en 1996' },
      { etiqueta: 'Categoría', valor: 'Videovigilancia y control de acceso' },
    ],
    quienes: [
      'Axis es una empresa sueca fundada en 1984 y reconocida por haber lanzado la primera cámara de red en 1996, con lo que impulsó el paso de la videovigilancia analógica a la digital.',
      'Hoy ofrece un ecosistema completo de cámaras, audio, control de acceso y analíticas a bordo, con un enfoque fuerte en ciberseguridad del propio dispositivo y en la calidad de imagen en condiciones difíciles.',
    ],
    lineas: [
      { titulo: 'Cámaras de red', texto: 'Fijas, domo, PTZ, panorámicas y térmicas, para interiores, exteriores y entornos exigentes.' },
      { titulo: 'Analíticas a bordo', texto: 'Detección de objetos, conteo y otras funciones que se ejecutan en la propia cámara.' },
      { titulo: 'Control de acceso', texto: 'Controladores, lectores y videoporteros en red integrados con el video.' },
      { titulo: 'Audio en red', texto: 'Parlantes y micrófonos para anuncios, disuasión y verificación por voz.' },
      { titulo: 'Gestión de video', texto: 'Software como AXIS Camera Station para visualizar y grabar en proyectos de distinta escala.' },
      { titulo: 'Accesorios', texto: 'Soportes, carcasas y fuentes para instalaciones en poste, pared o techo.' },
    ],
    ideal: ['Comercios y centros comerciales', 'Colegios, universidades y sedes públicas', 'Industria y almacenes', 'Proyectos de ciudad segura'],
    colores: { primario: '#FFCB05', oscuro: '#1C1C1C', claro: true },
    web: 'https://www.axis.com',
    badge: 'Axis Communications',
  },

  fortinet: {
    nombre: 'Fortinet',
    logo: '/images/marcas/fortinet.svg',
    lema: 'Ciberseguridad integrada para proteger toda la red.',
    datos: [
      { etiqueta: 'Fundada', valor: '2000, California (EE. UU.)' },
      { etiqueta: 'Plataforma', valor: 'Fortinet Security Fabric' },
      { etiqueta: 'Categoría', valor: 'Seguridad de redes' },
    ],
    quienes: [
      'Fortinet es una de las compañías de ciberseguridad más grandes del mundo, fundada en el año 2000 por los hermanos Ken y Michael Xie. Es conocida por sus firewalls FortiGate.',
      'Su enfoque es una plataforma integrada, la Security Fabric, donde firewall, redes, endpoints, correo y análisis comparten información para detectar y responder a las amenazas de forma coordinada.',
    ],
    lineas: [
      { titulo: 'Firewalls FortiGate', texto: 'Protección de red de nueva generación con filtrado, prevención de intrusiones y VPN.' },
      { titulo: 'SD-WAN seguro', texto: 'Conexión de sedes con enrutamiento inteligente y seguridad integrada.' },
      { titulo: 'Switching y WiFi', texto: 'FortiSwitch y FortiAP administrados desde el mismo firewall.' },
      { titulo: 'Seguridad de endpoint', texto: 'FortiClient y herramientas de detección y respuesta en equipos de usuarios.' },
      { titulo: 'Correo y aplicaciones', texto: 'Protección de correo electrónico y aplicaciones web contra ataques y phishing.' },
      { titulo: 'Análisis y operaciones', texto: 'Registro, correlación y automatización para equipos de seguridad.' },
    ],
    ideal: ['Empresas con varias sedes', 'Entidades con datos sensibles', 'Organizaciones que deben cumplir normativas', 'Áreas de TI que quieren centralizar la seguridad'],
    colores: { primario: '#EE3124', oscuro: '#6E140E' },
    web: 'https://www.fortinet.com',
    badge: 'Fortinet',
  },

  hanwha: {
    nombre: 'Hanwha Vision',
    logo: '/images/marcas/hanwha.svg',
    lema: 'Videovigilancia con inteligencia artificial, marca Wisenet.',
    datos: [
      { etiqueta: 'Origen', valor: 'Grupo Hanwha, Corea del Sur' },
      { etiqueta: 'Marca', valor: 'Wisenet' },
      { etiqueta: 'Categoría', valor: 'Videovigilancia profesional' },
    ],
    quienes: [
      'Hanwha Vision, antes Hanwha Techwin, forma parte del grupo coreano Hanwha. Su línea de videovigilancia se comercializa bajo la marca Wisenet.',
      'Destaca por cámaras con procesadores propios y analítica con inteligencia artificial, además de grabadores y software para armar sistemas de todos los tamaños.',
    ],
    lineas: [
      { titulo: 'Cámaras IP', texto: 'Domo, bala, PTZ y multisensor para exteriores, interiores y grandes áreas.' },
      { titulo: 'Cámaras con IA', texto: 'Clasificación de personas y vehículos y reducción de falsas alarmas.' },
      { titulo: 'Térmicas', texto: 'Detección perimetral y en condiciones de poca o ninguna luz.' },
      { titulo: 'Grabadores', texto: 'NVR y DVR para almacenar y administrar el video de todo el sistema.' },
      { titulo: 'Software', texto: 'Plataformas de gestión para visualizar, buscar y exportar grabaciones.' },
      { titulo: 'Accesorios', texto: 'Soportes, fuentes y carcasas para cada tipo de instalación.' },
    ],
    ideal: ['Seguridad perimetral', 'Comercio y retail', 'Instituciones y sedes públicas', 'Sistemas de videovigilancia en crecimiento'],
    colores: { primario: '#F37321', oscuro: '#6B2A08' },
    web: 'https://www.hanwhavision.com',
    badge: 'Hanwha',
  },

  vertiv: {
    nombre: 'Vertiv',
    logo: '/images/marcas/vertiv.svg',
    lema: 'Energía y climatización para que nada se detenga.',
    datos: [
      { etiqueta: 'Sede', valor: 'Ohio (EE. UU.)' },
      { etiqueta: 'Especialidad', valor: 'Infraestructura crítica' },
      { etiqueta: 'Categoría', valor: 'Energía y enfriamiento' },
    ],
    quienes: [
      'Vertiv diseña y fabrica la infraestructura que mantiene en funcionamiento a los centros de datos y salas técnicas: energía ininterrumpida, distribución eléctrica y enfriamiento.',
      'Muchas de sus líneas provienen de marcas muy conocidas del sector, como Liebert para UPS y refrigeración de precisión, que hoy se ofrecen bajo un mismo portafolio con servicio técnico especializado.',
    ],
    lineas: [
      { titulo: 'UPS', texto: 'Sistemas de respaldo de energía monofásicos y trifásicos para proteger equipos ante cortes y variaciones.' },
      { titulo: 'Distribución de energía', texto: 'PDU para racks, con medición y control remoto del consumo.' },
      { titulo: 'Refrigeración de precisión', texto: 'Aire acondicionado para salas de servidores y centros de datos.' },
      { titulo: 'Racks y acceso remoto', texto: 'Gabinetes y consolas KVM para administrar equipos a distancia.' },
      { titulo: 'Monitoreo', texto: 'Supervisión de temperatura, energía y alarmas de toda la sala.' },
      { titulo: 'Servicios', texto: 'Instalación, mantenimiento preventivo y soporte del fabricante.' },
    ],
    ideal: ['Centros de datos y salas de servidores', 'Telecomunicaciones', 'Hospitales y bancos', 'Industria con equipos sensibles'],
    colores: { primario: '#FFCD00', oscuro: '#1C1C1C', claro: true },
    web: 'https://www.vertiv.com',
    badge: 'Vertiv',
  },

  genetec: {
    nombre: 'Genetec',
    logo: '/images/partners/genetec.png',
    lema: 'Una sola plataforma para video, acceso y placas.',
    datos: [
      { etiqueta: 'Fundada', valor: '1997, Montreal (Canadá)' },
      { etiqueta: 'Plataforma', valor: 'Security Center' },
      { etiqueta: 'Categoría', valor: 'Seguridad física unificada' },
    ],
    quienes: [
      'Genetec es una empresa canadiense de software de seguridad. Su plataforma Security Center reúne en una sola interfaz la videovigilancia, el control de acceso y el reconocimiento automático de placas.',
      'Esa unificación permite a un operador ver cámaras, puertas y alarmas en un mismo lugar, con una arquitectura abierta que se integra con equipos de distintas marcas.',
    ],
    lineas: [
      { titulo: 'Security Center', texto: 'Plataforma unificada que concentra las distintas áreas de seguridad en una sola operación.' },
      { titulo: 'Videovigilancia', texto: 'Gestión de video con visualización, búsqueda y exportación de grabaciones.' },
      { titulo: 'Control de acceso', texto: 'Administración de puertas, credenciales y permisos de personas y visitantes.' },
      { titulo: 'Reconocimiento de placas', texto: 'Lectura automática de placas para estacionamientos, accesos vehiculares y ciudades.' },
      { titulo: 'Integración abierta', texto: 'Compatibilidad con cámaras y controladores de múltiples fabricantes.' },
      { titulo: 'Operación centralizada', texto: 'Alarmas, mapas y reportes en un mismo centro de control.' },
    ],
    ideal: ['Campus, hospitales y edificios corporativos', 'Estacionamientos y accesos vehiculares', 'Sistemas multi-sede', 'Proyectos que ya tienen cámaras de varias marcas'],
    colores: { primario: '#0089C0', oscuro: '#0A3350' },
    web: 'https://www.genetec.com',
    badge: 'Genetec',
  },

  milestone: {
    nombre: 'Milestone Systems',
    logo: '/images/partners/milestone.png',
    logoHero: null,
    lema: 'Software de gestión de video abierto y escalable.',
    datos: [
      { etiqueta: 'Fundada', valor: '1998, Copenhague (Dinamarca)' },
      { etiqueta: 'Plataforma', valor: 'XProtect' },
      { etiqueta: 'Categoría', valor: 'Software de gestión de video (VMS)' },
    ],
    quienes: [
      'Milestone Systems es una empresa danesa especializada en software de gestión de video, parte del grupo Canon. Su plataforma XProtect se usa en instalaciones de muy distintos tamaños.',
      'Se basa en una plataforma abierta: funciona con miles de cámaras y dispositivos de distintos fabricantes y se amplía con integraciones y analíticas de terceros.',
    ],
    lineas: [
      { titulo: 'XProtect', texto: 'Ediciones que van desde pequeños comercios hasta grandes instalaciones multi-servidor.' },
      { titulo: 'Plataforma abierta', texto: 'Compatibilidad con una amplia gama de cámaras y dispositivos de otras marcas.' },
      { titulo: 'Cliente de visualización', texto: 'Smart Client para monitorear en vivo, buscar grabaciones y exportar evidencia.' },
      { titulo: 'Acceso móvil y web', texto: 'Consulta del sistema desde celulares, tabletas y navegadores.' },
      { titulo: 'Integraciones', texto: 'Conexión con analíticas, control de acceso y sistemas de terceros.' },
      { titulo: 'Escalabilidad', texto: 'Se puede empezar pequeño y crecer sin cambiar de plataforma.' },
    ],
    ideal: ['Comercios y cadenas de tiendas', 'Instituciones y sedes públicas', 'Proyectos con cámaras de varias marcas', 'Instalaciones que irán creciendo'],
    colores: { primario: '#F2B705', oscuro: '#16314F', claro: true },
    web: 'https://www.milestonesys.com',
    badge: 'Milestone Systems',
  },
};
