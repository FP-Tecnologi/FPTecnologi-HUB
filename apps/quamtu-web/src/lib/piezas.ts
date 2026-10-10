// Catálogo del armador: piezas del brochure Quamtu (procesadores, RAM, SSD, video, fuentes).
// Placas, gabinetes y precios son REFERENCIALES hasta conectar la API del HUB (marca quamtu).
export type Cat = 'gabinete' | 'cpu' | 'placa' | 'ram' | 'gpu' | 'ssd' | 'cooler' | 'fuente';
export type Socket = 'LGA1700' | 'LGA1851' | 'AM5';

export type Opcion = {
  id: string;
  cat: Cat;
  nombre: string;
  spec: string;
  precio: number; // S/ referencial
  color: string; // acento en el 3D (familia de azules de la marca)
  socket?: Socket;
  watts?: number; // consumo (cpu/gpu) o capacidad (fuente)
  n?: number; // tamaño para el 3D: módulos RAM, ventiladores, escala del gabinete…
};

// Orden del armador: primero el procesador (el corazón), el gabinete cierra el armado.
export const CATS: { id: Cat; titulo: string; paso: string }[] = [
  { id: 'cpu', titulo: 'Procesador', paso: '01' },
  { id: 'placa', titulo: 'Placa madre', paso: '02' },
  { id: 'ram', titulo: 'Memoria', paso: '03' },
  { id: 'gpu', titulo: 'Video', paso: '04' },
  { id: 'ssd', titulo: 'Disco sólido', paso: '05' },
  { id: 'cooler', titulo: 'Refrigeración', paso: '06' },
  { id: 'fuente', titulo: 'Fuente', paso: '07' },
  { id: 'gabinete', titulo: 'Gabinete', paso: '08' },
];

const A = '#238DC1'; // primario
const B = '#385CAD'; // secundario
const C = '#6cc3ee'; // primario claro (brillos)
const W = '#8fd0f2';

export const OPCIONES: Opcion[] = [
  { id: 'g1', cat: 'gabinete', nombre: 'Quamtu Turing Compact', spec: 'Mini tower · rejilla frontal', precio: 289, color: A, n: 0.88 },
  { id: 'g2', cat: 'gabinete', nombre: 'Quamtu Turing Mesh', spec: 'Mid tower · flujo de aire optimizado', precio: 399, color: C, n: 1 },
  { id: 'g3', cat: 'gabinete', nombre: 'Quamtu Turing WS Glass', spec: 'Full tower · vidrio templado · 3 ventiladores', precio: 599, color: W, n: 1.1 },

  { id: 'c1', cat: 'cpu', nombre: 'Intel Core i7-14700', spec: '20 núcleos · LGA1700', precio: 1399, color: A, socket: 'LGA1700', watts: 65 },
  { id: 'c2', cat: 'cpu', nombre: 'Intel Core i7-14700K', spec: '20 núcleos · desbloqueado · LGA1700', precio: 1599, color: C, socket: 'LGA1700', watts: 125 },
  { id: 'c3', cat: 'cpu', nombre: 'Intel Core i9-14900', spec: '24 núcleos · LGA1700', precio: 1899, color: A, socket: 'LGA1700', watts: 65 },
  { id: 'c4', cat: 'cpu', nombre: 'Intel Core i9-14900K', spec: '24 núcleos · desbloqueado · LGA1700', precio: 2199, color: C, socket: 'LGA1700', watts: 125 },
  { id: 'c5', cat: 'cpu', nombre: 'Intel Core Ultra 7 265K', spec: '20 núcleos · LGA1851', precio: 1699, color: A, socket: 'LGA1851', watts: 125 },
  { id: 'c6', cat: 'cpu', nombre: 'Intel Core Ultra 9 285K', spec: '24 núcleos · LGA1851', precio: 2499, color: C, socket: 'LGA1851', watts: 125 },
  { id: 'c7', cat: 'cpu', nombre: 'AMD Ryzen 7 9700X', spec: '8 núcleos · AM5', precio: 1299, color: B, socket: 'AM5', watts: 65 },
  { id: 'c8', cat: 'cpu', nombre: 'AMD Ryzen 9 7900X', spec: '12 núcleos · AM5', precio: 1749, color: B, socket: 'AM5', watts: 170 },
  { id: 'c9', cat: 'cpu', nombre: 'AMD Ryzen 9 9900X', spec: '12 núcleos · AM5', precio: 1899, color: B, socket: 'AM5', watts: 120 },

  { id: 'p1', cat: 'placa', nombre: 'B760M Pro', spec: 'LGA1700 · DDR5', precio: 539, color: A, socket: 'LGA1700' },
  { id: 'p2', cat: 'placa', nombre: 'Z790 Strix', spec: 'LGA1700 · DDR5 · PCIe 5.0', precio: 1349, color: C, socket: 'LGA1700' },
  { id: 'p3', cat: 'placa', nombre: 'Z890 Gaming', spec: 'LGA1851 · DDR5 · PCIe 5.0', precio: 1499, color: C, socket: 'LGA1851' },
  { id: 'p4', cat: 'placa', nombre: 'B650M Gaming', spec: 'AM5 · DDR5', precio: 589, color: A, socket: 'AM5' },
  { id: 'p5', cat: 'placa', nombre: 'X670E Pro', spec: 'AM5 · DDR5 · PCIe 5.0', precio: 1199, color: B, socket: 'AM5' },

  { id: 'r1', cat: 'ram', nombre: '16 GB DDR5 5600 MHz', spec: '2×8 GB', precio: 249, color: A, n: 2 },
  { id: 'r2', cat: 'ram', nombre: '32 GB DDR5 5600 MHz', spec: '2×16 GB', precio: 449, color: A, n: 2 },
  { id: 'r3', cat: 'ram', nombre: '64 GB DDR5 5600 MHz', spec: '4×16 GB', precio: 889, color: C, n: 4 },
  { id: 'r4', cat: 'ram', nombre: '128 GB DDR5 4800 MHz', spec: '4×32 GB', precio: 1790, color: W, n: 4 },

  { id: 'v1', cat: 'gpu', nombre: 'NVIDIA GeForce RTX 6 GB', spec: 'Ofimática avanzada · diseño 2D', precio: 1099, color: A, watts: 115, n: 2 },
  { id: 'v2', cat: 'gpu', nombre: 'NVIDIA GeForce RTX 8 GB', spec: '1080p ultra · 2 ventiladores', precio: 1599, color: A, watts: 130, n: 2 },
  { id: 'v3', cat: 'gpu', nombre: 'NVIDIA GeForce RTX 12 GB', spec: '1440p ultra · edición de video', precio: 2549, color: C, watts: 200, n: 3 },
  { id: 'v4', cat: 'gpu', nombre: 'NVIDIA GeForce RTX 16 GB', spec: '4K · render 3D', precio: 4199, color: C, watts: 285, n: 3 },
  { id: 'v5', cat: 'gpu', nombre: 'NVIDIA GeForce RTX 32 GB', spec: '4K sin límites · IA', precio: 8999, color: W, watts: 575, n: 3 },

  { id: 's1', cat: 'ssd', nombre: 'Unidad de estado sólido 500 GB', spec: 'NVMe', precio: 189, color: A, n: 1 },
  { id: 's2', cat: 'ssd', nombre: 'Unidad de estado sólido 1 TB', spec: 'NVMe', precio: 299, color: A, n: 1 },
  { id: 's3', cat: 'ssd', nombre: 'Unidad de estado sólido 2 TB', spec: 'NVMe', precio: 599, color: C, n: 2 },
  { id: 's4', cat: 'ssd', nombre: 'Unidad de estado sólido 4 TB', spec: 'NVMe', precio: 1199, color: W, n: 2 },

  { id: 'k1', cat: 'cooler', nombre: 'Cooler de aire', spec: 'Torre · 1 ventilador', precio: 129, color: A, n: 1 },
  { id: 'k2', cat: 'cooler', nombre: 'Refrigeración líquida 240', spec: 'AIO · 2 ventiladores', precio: 349, color: C, n: 2 },
  { id: 'k3', cat: 'cooler', nombre: 'Refrigeración líquida 360', spec: 'AIO · 3 ventiladores', precio: 499, color: W, n: 3 },

  { id: 'f1', cat: 'fuente', nombre: '650 W Bronze', spec: '80 Plus Bronze', precio: 179, color: A, watts: 650 },
  { id: 'f2', cat: 'fuente', nombre: '750 W Gold', spec: '80 Plus Gold', precio: 329, color: C, watts: 750 },
  { id: 'f3', cat: 'fuente', nombre: '850 W Gold', spec: '80 Plus Gold', precio: 399, color: C, watts: 850 },
  { id: 'f4', cat: 'fuente', nombre: '1000 W Gold', spec: '80 Plus Gold', precio: 549, color: C, watts: 1000 },
  { id: 'f5', cat: 'fuente', nombre: '1200 W Gold', spec: '80 Plus Gold', precio: 699, color: W, watts: 1200 },
];

export type Seleccion = Partial<Record<Cat, Opcion>>;

export const porCat = (cat: Cat) => OPCIONES.filter((o) => o.cat === cat);
export const porId = (id: string) => OPCIONES.find((o) => o.id === id);

export const total = (s: Seleccion) => Object.values(s).reduce((a, o) => a + (o?.precio ?? 0), 0);

// Socket distinto entre CPU y placa bloquea la opción; devuelve el motivo o null.
export function incompatible(o: Opcion, s: Seleccion): string | null {
  if (o.cat === 'placa' && s.cpu?.socket && s.cpu.socket !== o.socket) return `No es compatible con ${s.cpu.socket}`;
  if (o.cat === 'cpu' && s.placa?.socket && s.placa.socket !== o.socket) return `No es compatible con ${s.placa.socket}`;
  return null;
}

// Fuente justa: CPU + GPU + 150 W de margen para el resto.
export function avisoFuente(s: Seleccion): string | null {
  if (!s.fuente) return null;
  const necesita = (s.cpu?.watts ?? 0) + (s.gpu?.watts ?? 0) + 150;
  return necesita > (s.fuente.watts ?? 0) ? `Tu configuración pide ~${necesita} W; esta fuente no alcanza.` : null;
}

export const BUILDS = [
  { nombre: 'Turing Esencial', linea: 'TURING', para: 'Productividad diaria sin interrupciones', ids: ['g1', 'c1', 'p1', 'r1', 'v1', 's1', 'k1', 'f1'] },
  { nombre: 'Turing Pro', linea: 'TURING', para: 'Multitarea, diseño y juego fluido', ids: ['g2', 'c4', 'p2', 'r2', 'v3', 's2', 'k2', 'f3'] },
  { nombre: 'Turing WS Creator', linea: 'TURING WS', para: 'Edición, render y modelado 3D', ids: ['g3', 'c9', 'p5', 'r3', 'v4', 's3', 'k3', 'f4'] },
  { nombre: 'Turing WS Max', linea: 'TURING WS', para: 'Ingeniería, IA y cargas críticas', ids: ['g3', 'c6', 'p3', 'r4', 'v5', 's4', 'k3', 'f5'] },
];

export const seleccionDe = (ids: string[]): Seleccion =>
  Object.fromEntries(ids.map((id) => porId(id)!).map((o) => [o.cat, o])) as Seleccion;
