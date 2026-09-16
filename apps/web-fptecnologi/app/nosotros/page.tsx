import { PlaceholderPage } from '@/components/site/PlaceholderPage';

export const metadata = { title: 'Nosotros' };

export default function NosotrosPage() {
  return (
    <PlaceholderPage
      eyebrow="FPTecnologi & System"
      title="Nosotros"
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Nosotros', href: '/nosotros' },
      ]}
    />
  );
}
