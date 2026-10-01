import { Check, ClipboardList, PackageCheck, ShoppingCart } from 'lucide-react';

const PASOS = [
  { n: 1, label: 'Carrito', Icon: ShoppingCart, href: '/carrito' },
  { n: 2, label: 'Datos y entrega', Icon: ClipboardList, href: '/checkout' },
  { n: 3, label: 'Pedido recibido', Icon: PackageCheck },
] as const;

/* Indicador de los 3 pasos de compra (carrito -> datos y entrega -> confirmación). */
export function PasosCompra({ actual }: { actual: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Pasos de la compra" className="mx-auto mb-8 flex max-w-3xl items-center">
      {PASOS.map((p, i) => {
        const hecho = p.n < actual;
        const activo = p.n === actual;
        const contenido = (
          <>
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${
                hecho
                  ? 'border-brand-dark bg-brand-dark text-white'
                  : activo
                    ? 'border-brand-dark bg-white text-brand-dark shadow-lg shadow-brand-dark/20'
                    : 'border-ink/10 bg-white text-ink/35'
              }`}
            >
              {hecho ? <Check className="h-5 w-5" strokeWidth={3} /> : <p.Icon className="h-5 w-5" strokeWidth={1.9} />}
            </span>
            <span className={`hidden text-sm font-semibold sm:block ${activo ? 'text-ink' : hecho ? 'text-brand-dark' : 'text-ink/40'}`}>{p.label}</span>
          </>
        );
        return (
          <li key={p.n} aria-current={activo ? 'step' : undefined} className={`flex items-center gap-3 ${i < PASOS.length - 1 ? 'flex-1' : ''}`}>
            {hecho && 'href' in p ? (
              <a href={p.href} className="flex items-center gap-3">{contenido}</a>
            ) : (
              <span className="flex items-center gap-3">{contenido}</span>
            )}
            {i < PASOS.length - 1 && (
              <span aria-hidden className={`mx-2 h-0.5 flex-1 rounded-full ${hecho ? 'bg-brand-dark' : 'bg-ink/10'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
