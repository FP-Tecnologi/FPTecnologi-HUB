import BannerPagina from '@/components/BannerPagina';
import CarritoVista from '@/components/tienda/CarritoVista';
import { meta } from '@/lib/seo';

export const metadata = { ...meta('Carrito de cotización', 'Equipos que elegiste en la tienda de Fimav Perú, listos para solicitar tu cotización.', '/carrito'), robots: { index: false } };

export default function CarritoPage() {
  return (
    <main id="contenido">
      <BannerPagina eyebrow="Carrito" titulo="Tu" resaltado="carrito" migas={[{ texto: 'Tienda', href: '/tienda' }]} imagen="/fotos/escritorios-2.jpg" />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6"><CarritoVista /></section>
    </main>
  );
}
