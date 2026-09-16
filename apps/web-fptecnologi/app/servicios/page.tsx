import { SOLUTIONS } from '@/lib/content';
import { PlaceholderPage } from '@/components/site/PlaceholderPage';

export const metadata = { title: 'Servicios' };

export default function ServiciosPage() {
  return (
    <PlaceholderPage
      eyebrow="Servicios TI"
      title="Todas las categorías de servicios"
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Servicios', href: '/servicios' },
      ]}
    >
      <ul className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SOLUTIONS.map((s) => (
          <li key={s.slug}>
            <a href={`/servicios/${s.slug}`} className="block rounded-lg border border-black/5 bg-white px-4 py-3 text-sm font-medium text-ink/75 hover:border-brand-primary/30 hover:text-brand-primary">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </PlaceholderPage>
  );
}
