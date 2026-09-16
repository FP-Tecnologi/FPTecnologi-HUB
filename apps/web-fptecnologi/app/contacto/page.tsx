import { PlaceholderPage } from '@/components/site/PlaceholderPage';

export const metadata = { title: 'Contacto' };

export default function ContactoPage() {
  return (
    <PlaceholderPage
      eyebrow="Hablemos"
      title="Contacto"
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Contacto', href: '/contacto' },
      ]}
    />
  );
}
