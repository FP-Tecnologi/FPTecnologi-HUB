// Catálogo de ejemplo del armador. Luego se reemplaza por GET /public/* de la API (marca quamtu).
export type Cat = 'gabinete' | 'cpu' | 'placa' | 'ram' | 'gpu' | 'ssd' | 'cooler' | 'fuente';

export type Opcion = {
  id: string;
  cat: Cat;
  nombre: string;
  spec: string;
  precio: number; // S/
  color: string; // acento RGB en el 3D
  socket?: 'AM5' | 'LGA1700';
  watts?: number; // consumo (cpu/gpu) o capacidad (fuente)
  n?: number; // tamaño para el 3D: módulos RAM, ventiladores, escala del gabinete…
};

export const CATS: { id: Cat; titulo: string; paso: string }[] = [
  { id: 'gabinete', titulo: 'Gabinete', paso: '01' },
  { id: 'cpu', titulo: 'Procesador', paso: '02' },
  { id: 'placa', titulo: 'Placa madre', paso: '03' },
  { id: 'ram', titulo: 'Memoria RAM', paso: '04' },
  { id: 'gpu', titulo: 'Tarjeta de video', paso: '05' },
  { id: 'ssd', titulo: 'Almacenamiento', paso: '06' },
  { id: 'cooler', titulo: 'Refrigeración', paso: '07' },
  { id: 'fuente', titulo: 'Fuente de poder', paso: '08' },
];

export const OPCIONES: Opcion[] = [
  { id: 'g1', cat: 'gabinete', nombre: 'Quamtu Void Mini', spec: 'Mini tower · vidrio templado', precio: 289, color: '#8b5cf6', n: 0.88 },
  { id: 'g2', cat: 'gabinete', nombre: 'Quamtu Nova Mid', spec: 'Mid tower · 3 ventiladores ARGB', precio: 399, color: '#22d3ee', n: 1 },
  { id: 'g3', cat: 'gabinete', nombre: 'Quamtu Titan Full', spec: 'Full tower · panel panorámico', precio: 599, color: '#f43f5e', n: 1.1 },

  { id: 'c1', cat: 'cpu', nombre: 'Ryzen 5 7600', spec: '6 núcleos · 5.1 GHz · AM5', precio: 819, color: '#f97316', socket: 'AM5', watts: 65 },
  { id: 'c2', cat: 'cpu', nombre: 'Ryzen 7 7800X3D', spec: '8 núcleos · 3D V-Cache · AM5', precio: 1549, color: '#f97316', socket: 'AM5', watts: 120 },
  { id: 'c3', cat: 'cpu', nombre: 'Core i5-13400F', spec: '10 núcleos · 4.6 GHz · LGA1700', precio: 729, color: '#38bdf8', socket: 'LGA1700', watts: 65 },
  { id: 'c4', cat: 'cpu', nombre: 'Core i7-14700K', spec: '20 núcleos · 5.6 GHz · LGA1700', precio: 1699, color: '#38bdf8', socket: 'LGA1700', watts: 125 },

  { id: 'p1', cat: 'placa', nombre: 'B650M Gaming', spec: 'AM5 · DDR5 · Wi-Fi 6', precio: 589, color: '#22d3ee', socket: 'AM5' },
  { id: 'p2', cat: 'placa', nombre: 'X670E Aorus', spec: 'AM5 · DDR5 · PCIe 5.0', precio: 1199, color: '#a855f7', socket: 'AM5' },
  { id: 'p3', cat: 'placa', nombre: 'B760M Pro', spec: 'LGA1700 · DDR5 · Wi-Fi 6', precio: 539, color: '#22d3ee', socket: 'LGA1700' },
  { id: 'p4', cat: 'placa', nombre: 'Z790 Strix', spec: 'LGA1700 · DDR5 · PCIe 5.0', precio: 1349, color: '#a855f7', socket: 'LGA1700' },

  { id: 'r1', cat: 'ram', nombre: '16 GB DDR5 5600', spec: '2×8 GB · RGB', precio: 249, color: '#34d399', n: 2 },
  { id: 'r2', cat: 'ram', nombre: '32 GB DDR5 6000', spec: '2×16 GB · RGB', precio: 449, color: '#e879f9', n: 2 },
  { id: 'r3', cat: 'ram', nombre: '64 GB DDR5 6000', spec: '4×16 GB · RGB', precio: 889, color: '#fb7185', n: 4 },

  { id: 'v1', cat: 'gpu', nombre: 'RTX 4060 8 GB', spec: '1080p ultra · 2 ventiladores', precio: 1299, color: '#76e04a', watts: 115, n: 2 },
  { id: 'v2', cat: 'gpu', nombre: 'RTX 4070 Super 12 GB', spec: '1440p ultra · 3 ventiladores', precio: 2549, color: '#22d3ee', watts: 220, n: 3 },
  { id: 'v3', cat: 'gpu', nombre: 'RX 7800 XT 16 GB', spec: '1440p ultra · 3 ventiladores', precio: 2199, color: '#f43f5e', watts: 263, n: 3 },
  { id: 'v4', cat: 'gpu', nombre: 'RTX 4090 24 GB', spec: '4K sin límites · 3 ventiladores', precio: 7999, color: '#a3e635', watts: 450, n: 3 },

  { id: 's1', cat: 'ssd', nombre: 'NVMe 500 GB', spec: 'PCIe 4.0 · 5000 MB/s', precio: 189, color: '#38bdf8', n: 1 },
  { id: 's2', cat: 'ssd', nombre: 'NVMe 1 TB', spec: 'PCIe 4.0 · 7000 MB/s', precio: 299, color: '#38bdf8', n: 1 },
  { id: 's3', cat: 'ssd', nombre: 'NVMe 2 TB', spec: 'PCIe 5.0 · 10000 MB/s', precio: 749, color: '#a78bfa', n: 2 },

  { id: 'k1', cat: 'cooler', nombre: 'Torre Frost 120', spec: 'Aire · 1 ventilador ARGB', precio: 129, color: '#22d3ee', n: 1 },
  { id: 'k2', cat: 'cooler', nombre: 'AIO Vortex 240', spec: 'Líquida · 2 ventiladores ARGB', precio: 349, color: '#8b5cf6', n: 2 },
  { id: 'k3', cat: 'cooler', nombre: 'AIO Vortex 360', spec: 'Líquida · 3 ventiladores ARGB', precio: 499, color: '#f43f5e', n: 3 },

  { id: 'f1', cat: 'fuente', nombre: '550 W 80+ Bronze', spec: 'No modular', precio: 179, color: '#94a3b8', watts: 550 },
  { id: 'f2', cat: 'fuente', nombre: '750 W 80+ Gold', spec: 'Modular', precio: 329, color: '#facc15', watts: 750 },
  { id: 'f3', cat: 'fuente', nombre: '1000 W 80+ Platinum', spec: 'Modular · cables sleeved', precio: 599, color: '#facc15', watts: 1000 },
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
  { nombre: 'Lite Build', ids: ['g1', 'c3', 'p3', 'r1', 'v1', 's1', 'k1', 'f1'], tag: '1080p' },
  { nombre: 'Core Build', ids: ['g2', 'c1', 'p1', 'r2', 'v3', 's2', 'k2', 'f2'], tag: '1440p' },
  { nombre: 'Premium Build', ids: ['g2', 'c2', 'p2', 'r2', 'v2', 's2', 'k3', 'f2'], tag: '1440p+' },
  { nombre: 'Pro Build', ids: ['g3', 'c4', 'p4', 'r3', 'v4', 's3', 'k3', 'f3'], tag: '4K' },
];

export const seleccionDe = (ids: string[]): Seleccion =>
  Object.fromEntries(ids.map((id) => porId(id)!).map((o) => [o.cat, o])) as Seleccion;
