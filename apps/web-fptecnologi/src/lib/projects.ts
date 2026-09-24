/*
 * PROYECTOS DE EJEMPLO -- todavía no hay casos reales cargados (pedido del
 * usuario: "crear unos similares" a la sección de referencia). Reemplazar
 * por los proyectos reales cuando estén: `department` es el id del
 * departamento en lib/peruDepartments.ts (ej. 'la-libertad', 'madre-de-dios').
 * Fotos, clientes, años y descripciones son provisionales.
 */
export type Project = {
  title: string;
  department: string;
  image: string;
  client: string;
  year: number;
  description: string;
  scope: string[];
};

export const PROJECTS: Project[] = [
  {
    title: 'Mejoramiento del servicio de seguridad ciudadana en el distrito de Jaén',
    department: 'cajamarca',
    image: '/images/solutions/seguridad.jpg',
    client: 'Municipalidad Provincial de Jaén',
    year: 2024,
    description: 'Centro de operaciones con videovigilancia integrada, cámaras en puntos críticos del distrito y monitoreo 24/7.',
    scope: ['Videovigilancia', 'Centro de monitoreo', 'Fibra óptica'],
  },
  {
    title: 'Equipamiento de aulas y laboratorios de la Universidad Nacional de Jaén',
    department: 'cajamarca',
    image: '/images/solutions/escuelas.jpg',
    client: 'Universidad Nacional de Jaén',
    year: 2023,
    description: 'Laboratorios de cómputo y aulas equipadas con pantallas interactivas y red inalámbrica para todo el campus.',
    scope: ['Pantallas', 'Laboratorios', 'Wi-Fi'],
  },
  {
    title: 'Implementación de data center para entidad financiera',
    department: 'lima',
    image: '/images/solutions/data-centers.jpg',
    client: 'Entidad financiera (confidencial)',
    year: 2024,
    description: 'Diseño e implementación de data center con racks, energía redundante, climatización y cableado estructurado.',
    scope: ['Data center', 'Cableado estructurado', 'Energía'],
  },
  {
    title: 'Salas de videoconferencia para sede corporativa en San Isidro',
    department: 'lima',
    image: '/images/solutions/videoconferencia.jpg',
    client: 'Grupo corporativo',
    year: 2025,
    description: 'Doce salas de reunión con cámaras, audio profesional e integración con Teams y Zoom.',
    scope: ['Videoconferencia', 'Audio', 'Integración'],
  },
  {
    title: 'Migración de infraestructura a la nube para empresa logística',
    department: 'lima',
    image: '/images/solutions/cloud.jpg',
    client: 'Operador logístico',
    year: 2025,
    description: 'Migración de servidores on-premise a la nube con alta disponibilidad y plan de respaldo.',
    scope: ['Cloud', 'Migración', 'Respaldo'],
  },
  {
    title: 'Sistema de videovigilancia para la Municipalidad Provincial de Piura',
    department: 'piura',
    image: '/images/solutions/seguridad.jpg',
    client: 'Municipalidad Provincial de Piura',
    year: 2023,
    description: 'Red de cámaras en avenidas principales conectadas a la central de serenazgo.',
    scope: ['Videovigilancia', 'Serenazgo'],
  },
  {
    title: 'Servidores y respaldo de datos para hospital regional',
    department: 'arequipa',
    image: '/images/solutions/servidores.jpg',
    client: 'Hospital regional',
    year: 2024,
    description: 'Servidores para la historia clínica electrónica con respaldo automático y recuperación ante desastres.',
    scope: ['Servidores', 'Backup', 'Alta disponibilidad'],
  },
  {
    title: 'Conectividad y pantallas interactivas para colegios emblemáticos',
    department: 'arequipa',
    image: '/images/solutions/escuelas.jpg',
    client: 'Gerencia Regional de Educación',
    year: 2023,
    description: 'Conectividad de aulas y pantallas interactivas para clases digitales en colegios emblemáticos.',
    scope: ['Conectividad', 'Pantallas interactivas'],
  },
  {
    title: 'Red y sistemas de gestión para cadena hotelera en Cusco',
    department: 'cusco',
    image: '/images/solutions/hoteles.jpg',
    client: 'Cadena hotelera',
    year: 2024,
    description: 'Red Wi-Fi para huéspedes, TV corporativa y sistemas de gestión para recepción y restaurante.',
    scope: ['Redes', 'TV corporativa', 'Gestión'],
  },
  {
    title: 'Centro de operaciones de seguridad ciudadana en Trujillo',
    department: 'la-libertad',
    image: '/images/solutions/seguridad.jpg',
    client: 'Municipalidad Provincial de Trujillo',
    year: 2025,
    description: 'Centro de operaciones con videowall, puestos de monitoreo y cámaras en el centro histórico.',
    scope: ['Videowall', 'Videovigilancia'],
  },
  {
    title: 'Respaldo y almacenamiento de datos para gobierno regional',
    department: 'junin',
    image: '/images/solutions/datos-empresariales.jpg',
    client: 'Gobierno Regional de Junín',
    year: 2024,
    description: 'Almacenamiento centralizado y políticas de respaldo para la información de las sedes regionales.',
    scope: ['Almacenamiento', 'Backup'],
  },
  {
    title: 'Videoconferencia para sedes descentralizadas en Chiclayo',
    department: 'lambayeque',
    image: '/images/solutions/videoconferencia.jpg',
    client: 'Entidad pública',
    year: 2023,
    description: 'Salas de videoconferencia para conectar la sede central con oficinas descentralizadas.',
    scope: ['Videoconferencia', 'Redes'],
  },
];
