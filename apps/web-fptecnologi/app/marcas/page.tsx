import { PlaceholderPage } from '@/components/site/PlaceholderPage';

export const metadata = { title: 'Marcas' };

export default function MarcasPage() {
  return (
    <PlaceholderPage
      eyebrow="Distribución autorizada"
      title="Marcas aliadas"
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Marcas', href: '/marcas' },
      ]}
    />
  );
}
