/*
 * Clientes reales de FPTecnologi (logos en /public/images/clientes). Respaldo
 * local: la web los lee de la API (Dashboard → Web → Clientes) vía referencias.ts.
 * Orden en la home: gobierno arriba a lo ancho; educación y privado debajo.
 */
export type Client = { name: string; short: string; logo?: string; ejemplo?: boolean };
export type ClientSector = { key: 'gobierno' | 'educacion' | 'privado'; label: string; clients: Client[] };

export const CLIENT_SECTORS: ClientSector[] = [
  {
    key: 'gobierno',
    label: 'Sector gobierno',
    clients: [
      { name: 'Poder Judicial del Perú', short: 'PJ', logo: '/images/clientes/poder-judicial.svg' },
      { name: 'EsSalud', short: 'ES', logo: '/images/clientes/essalud.svg' },
      { name: 'Autoridad Nacional del Agua', short: 'ANA', logo: '/images/clientes/ana.svg' },
      { name: 'Provías Nacional', short: 'PN', logo: '/images/clientes/provias-nacional.svg' },
      { name: 'Municipalidad de San Juan de Miraflores', short: 'SJM', logo: '/images/clientes/san-juan-de-miraflores.svg' },
      { name: 'UGEL 04', short: 'U04', logo: '/images/clientes/ugel-04.svg' },
    ],
  },
  {
    key: 'educacion',
    label: 'Educación',
    clients: [
      { name: 'Universidad Nacional Mayor de San Marcos', short: 'UNMSM', logo: '/images/clientes/unmsm.svg' },
      { name: 'Universidad Nacional de Ingeniería', short: 'UNI', logo: '/images/clientes/uni.svg' },
      { name: 'Universidad Nacional San Antonio Abad del Cusco', short: 'UNSAAC', logo: '/images/clientes/unsaac.svg' },
      { name: 'Universidad Nacional de Educación Enrique Guzmán y Valle', short: 'UNE', logo: '/images/clientes/la-cantuta.svg' },
      { name: 'Universidad Nacional Hermilio Valdizán', short: 'UNHEVAL', logo: '/images/clientes/unheval.svg' },
      { name: 'Universidad Nacional Micaela Bastidas de Apurímac', short: 'UNAMBA', logo: '/images/clientes/uni-micaela-bastidas.svg' },
      { name: 'Universidad Nacional Toribio Rodríguez de Mendoza', short: 'UNTRM', logo: '/images/clientes/toribio-rodriguez.svg' },
      { name: 'Universidad Nacional de Moquegua', short: 'UNAM', logo: '/images/clientes/unam.svg' },
      { name: 'Universidad Nacional Daniel Alomía Robles', short: 'UNDAR', logo: '/images/clientes/undar.svg' },
      { name: 'Universidad Nacional Intercultural Fabiola Salazar Leguía de Bagua', short: 'UNIFSLB', logo: '/images/clientes/unifslb.svg' },
      { name: 'Universidad Nacional Tecnológica de Frontera San Ignacio de Loyola', short: 'UNIFSIL', logo: '/images/clientes/uni-san-ignacio-del-loyola.svg' },
      { name: 'Universidad Norbert Wiener', short: 'UNW', logo: '/images/clientes/norbert-wiener.svg' },
    ],
  },
  {
    key: 'privado',
    label: 'Sector privado',
    clients: [
      { name: 'Rimac Seguros', short: 'RS', logo: '/images/clientes/rimac.svg' },
      { name: 'La Positiva Seguros', short: 'LP', logo: '/images/clientes/la-positiva.svg' },
      { name: 'Limagas', short: 'LG', logo: '/images/clientes/limagas.svg' },
      { name: 'Vistony', short: 'VI', logo: '/images/clientes/vistony.svg' },
      { name: 'Gothia', short: 'GO', logo: '/images/clientes/gothia.svg' },
    ],
  },
];
