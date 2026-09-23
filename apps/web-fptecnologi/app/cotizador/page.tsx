import { PlaceholderPage } from '@/components/site/PlaceholderPage';

// Cotizador propio (reemplaza al externo de fptecnologi.com) -- pendiente.
export const metadata = { title: 'Cotizador' };

export default function CotizadorPage() {
  return (
    <PlaceholderPage
      eyebrow="FPTecnologi & System"
      title="Cotizador"
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Cotizador', href: '/cotizador' },
      ]}
    />
  );
}
