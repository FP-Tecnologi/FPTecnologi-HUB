import { AirVent, Armchair, BatteryCharging, Disc3, Droplets, Laptop, Monitor, Network, Presentation, Printer, Server, type LucideIcon } from 'lucide-react';

export type Categoria = { slug: string; nombre: string; icono: LucideIcon; resumen: string; marcas: string[]; fotos: string[] };

const fotos = (slug: string) => [1, 2, 3].map((n) => `/fotos/${slug}-${n}.jpg`);

export const categorias: Categoria[] = [
  { slug: 'escritorios-notebooks', nombre: 'Desktops y notebooks', icono: Laptop, resumen: 'Equipos de escritorio y portátiles para oficina, gobierno y consumo.', marcas: ['Lenovo', 'HP', 'Dell'], fotos: fotos('escritorios') },
  { slug: 'all-in-one', nombre: 'All in One', icono: Monitor, resumen: 'Computadoras todo en uno que ahorran espacio sin perder rendimiento.', marcas: ['Lenovo', 'HP', 'Dell'], fotos: fotos('all-in-one') },
  { slug: 'monitores', nombre: 'Monitores', icono: Monitor, resumen: 'Pantallas para trabajo diario, diseño y puestos de atención.', marcas: ['Dell', 'LG', 'Samsung'], fotos: fotos('monitores') },
  { slug: 'proyectores', nombre: 'Proyectores', icono: Presentation, resumen: 'Proyección para salas de reuniones, aulas y auditorios.', marcas: ['Epson'], fotos: fotos('proyectores') },
  { slug: 'impresoras', nombre: 'Impresoras y multifuncionales', icono: Printer, resumen: 'Impresión, copia y escaneo para equipos de trabajo y oficinas.', marcas: ['HP', 'Lexmark', 'Epson'], fotos: fotos('impresoras') },
  { slug: 'aire-acondicionado', nombre: 'Aire acondicionado', icono: AirVent, resumen: 'Climatización para oficinas, salas técnicas y espacios corporativos.', marcas: ['LG', 'Daikin'], fotos: fotos('aire') },
  { slug: 'servidores', nombre: 'Servidores', icono: Server, resumen: 'Servidores y almacenamiento para la infraestructura de tu organización.', marcas: ['HPE', 'Lenovo', 'Dell'], fotos: fotos('servidores') },
  { slug: 'consumibles', nombre: 'Consumibles', icono: Droplets, resumen: 'Tóneres, tintas y suministros originales para impresión.', marcas: ['Lexmark', 'HP', 'Epson'], fotos: fotos('consumibles') },
  { slug: 'networking', nombre: 'Networking', icono: Network, resumen: 'Redes, conectividad y cableado para operar sin interrupciones.', marcas: [], fotos: fotos('networking') },
  { slug: 'mobiliario-papel', nombre: 'Mobiliario y papel', icono: Armchair, resumen: 'Mobiliario de oficina y papelería para equipar tus espacios.', marcas: [], fotos: fotos('mobiliario') },
  { slug: 'software', nombre: 'Software', icono: Disc3, resumen: 'Licenciamiento de software para sistemas operativos, ofimática y seguridad.', marcas: [], fotos: [] },
  { slug: 'baterias', nombre: 'Baterías', icono: BatteryCharging, resumen: 'Baterías y respaldo de energía para equipos y continuidad operativa.', marcas: [], fotos: [] },
];

export const categoriaPorSlug = (slug: string) => categorias.find((c) => c.slug === slug);
