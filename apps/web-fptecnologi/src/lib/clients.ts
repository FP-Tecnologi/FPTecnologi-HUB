/*
 * CLIENTES DE EJEMPLO -- todavía no hay clientes reales autorizados para
 * mostrar. Nombres genéricos (no instituciones reales) para ver el diseño.
 * Reemplazar por los reales: `logo` es la ruta al logo en /public (si falta,
 * se muestran las iniciales de `short`).
 */
export type Client = { name: string; short: string; logo?: string };
export type ClientSector = { key: string; label: string; clients: Client[] };

export const CLIENT_SECTORS: ClientSector[] = [
  {
    key: 'educacion',
    label: 'Educación',
    clients: [
      { name: 'Universidad Nacional', short: 'UN' },
      { name: 'Universidad Privada', short: 'UP' },
      { name: 'Instituto Tecnológico', short: 'IT' },
      { name: 'Colegio Emblemático', short: 'CE' },
    ],
  },
  {
    key: 'logistico',
    label: 'Logístico - Productivo',
    clients: [
      { name: 'Operador Portuario', short: 'OP' },
      { name: 'Empresa Minera', short: 'EM' },
      { name: 'Operador Logístico', short: 'OL' },
    ],
  },
  {
    key: 'retail',
    label: 'Retail',
    clients: [
      { name: 'Cadena de Tiendas', short: 'CT' },
      { name: 'Cadena Hotelera', short: 'CH' },
    ],
  },
  {
    key: 'gobierno',
    label: 'Sector gobierno',
    clients: [
      { name: 'Municipalidad Provincial', short: 'MP' },
      { name: 'Municipalidad Distrital', short: 'MD' },
      { name: 'Gobierno Regional', short: 'GR' },
    ],
  },
];
