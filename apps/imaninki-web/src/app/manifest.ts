import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Imaninki',
    short_name: 'Imaninki',
    description: 'Pinturas, mobiliario corporativo y soluciones para construcción y emergencia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d0e',
    theme_color: '#0d0d0e',
    lang: 'es-PE',
    icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }, { src: '/brand/logo.png', sizes: '512x512', type: 'image/png' }],
  };
}
