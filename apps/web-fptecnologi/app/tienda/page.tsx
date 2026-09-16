import { TIENDA_CATEGORIES } from '@/lib/content';
import { PlaceholderPage } from '@/components/site/PlaceholderPage';

export const metadata = { title: 'Tienda' };

export default function TiendaPage() {
  return (
    <PlaceholderPage
      eyebrow="Tienda B2B"
      title="Catálogo completo"
      crumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Tienda', href: '/tienda' },
      ]}
    >
      <ul className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {TIENDA_CATEGORIES.map((c) => (
          <li key={c.slug}>
            <a href={`/tienda/${c.slug}`} className="block rounded-lg border border-black/5 bg-white px-4 py-3 text-sm font-medium text-ink/75 hover:border-brand-primary/30 hover:text-brand-primary">
              {c.title}
            </a>
          </li>
        ))}
      </ul>
    </PlaceholderPage>
  );
}
