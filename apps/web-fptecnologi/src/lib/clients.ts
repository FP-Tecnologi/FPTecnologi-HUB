/*
 * CLIENTES DE EJEMPLO -- todavía no hay clientes reales autorizados para
 * mostrar. Nombres genéricos (no instituciones reales) para ver el diseño.
 * Reemplazar por los reales: `logo` es la ruta al logo en /public (si falta,
 * se muestra un logo provisional con las iniciales de `short`).
 * Orden en la home: gobierno arriba a lo ancho; educación y privado debajo.
 */
export type Client = { name: string; short: string; logo?: string; ejemplo?: boolean };
export type ClientSector = { key: 'gobierno' | 'educacion' | 'privado'; label: string; clients: Client[] };

export const CLIENT_SECTORS: ClientSector[] = [
  {
    key: 'gobierno',
    label: 'Sector gobierno',
    clients: [
      { name: 'Municipalidad Provincial', short: 'MP' },
      { name: 'Municipalidad Distrital', short: 'MD' },
      { name: 'Gobierno Regional', short: 'GR' },
      { name: 'Hospital Regional', short: 'HR' },
      { name: 'Serenazgo Municipal', short: 'SM' },
      { name: 'Entidad Pública', short: 'EP' },
      { name: 'Dirección Regional', short: 'DR' },
      { name: 'Centro de Salud', short: 'CS' },
    ],
  },
  {
    key: 'educacion',
    label: 'Educación',
    clients: [
      { name: 'Universidad Nacional', short: 'UN' },
      { name: 'Universidad Privada', short: 'UP' },
      { name: 'Instituto Tecnológico', short: 'IT' },
      { name: 'Colegio Emblemático', short: 'CE' },
      { name: 'Escuela Técnica', short: 'ET' },
      { name: 'Colegio Privado', short: 'CP' },
    ],
  },
  {
    key: 'privado',
    label: 'Sector privado',
    clients: [
      { name: 'Operador Portuario', short: 'OP' },
      { name: 'Empresa Minera', short: 'EM' },
      { name: 'Operador Logístico', short: 'OL' },
      { name: 'Cadena de Tiendas', short: 'CT' },
      { name: 'Cadena Hotelera', short: 'CH' },
      { name: 'Entidad Financiera', short: 'EF' },
    ],
  },
];
