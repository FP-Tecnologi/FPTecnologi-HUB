'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

/*
 * Widget de favoritos: pestaña fija en el borde derecho (a media altura,
 * lejos del chat de abajo) que aparece apenas hay 1 favorito, con el
 * contador. Al hacer clic abre un panel flotante (sin tapar la página) con
 * la lista resumida estilo "4.3 horizontal / lista": foto, marca, nombre,
 * precio, agregar al carrito y quitar.
 */
export function FavoritesWidget() {
  const { items, remove } = useFavorites();
  const { addItem, justAddedSku } = useCart();
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (items.length === 0 && !open) return null;

  return (
    // Pestaña vertical + panel en un solo bloque pegado al borde derecho: el
    // panel se despliega hacia la izquierda desde la pestaña (animando el
    // ancho), igual que la píldora de comparar se abre en su tabla. Sin
    // fondo oscuro: la página sigue visible y usable detrás.
    <div className="fixed right-0 top-1/2 z-[55] flex -translate-y-1/2 overflow-hidden rounded-l-2xl shadow-2xl shadow-brand-dark/30">
      <aside
        role="dialog"
        aria-label="Favoritos"
        aria-hidden={!open}
        inert={!open}
        // Cerrado también max-h-0: si no, la lista oculta conservaba su
        // alto y estiraba la pestaña (quedaba un bloque azul vacío).
        className={`overflow-hidden bg-white transition-[max-width,max-height,opacity] duration-300 ease-out ${
          open ? 'max-h-[70vh] max-w-[360px] opacity-100' : 'max-h-0 max-w-0 opacity-0'
        }`}
      >
        <div className="flex max-h-[70vh] w-[min(360px,calc(100vw-1rem))] flex-col">
            {/* Encabezado abierto (como el de comparar): título, cantidad y
                minimizar. */}
            <div className="flex items-center gap-3 bg-brand-dark px-4 py-2.5 text-white">
              <Heart className="h-5 w-5 shrink-0" strokeWidth={2} fill="currentColor" />
              <p className="flex-1 text-sm font-semibold">
                Favoritos <span className="font-normal text-white/60">({items.length})</span>
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Minimizar favoritos"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-paper p-3">
              {items.length === 0 && <p className="py-10 text-center text-sm text-ink/50">Todavía no tienes favoritos.</p>}
              {items.map((p) => {
                const added = justAddedSku === p.sku;
                return (
                  // Fila resumida: foto, marca, nombre, precio y 2 acciones.
                  <div key={p.sku} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-2.5 shadow-sm shadow-brand-dark/10">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-producto">
                      <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">{p.brand}</p>
                      <h5 className="truncate text-sm font-semibold text-ink">{p.name}</h5>
                      <span className="font-mono text-sm font-bold text-ink">{format(p.price)}</span>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => addItem({ sku: p.sku, name: p.name, price: p.price, image: p.image })}
                        aria-label={`Agregar ${p.name} al carrito`}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors ${
                          added ? 'bg-emerald-500' : 'bg-brand-dark hover:bg-brand-primary'
                        }`}
                      >
                        <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p.sku)}
                        aria-label={`Quitar ${p.name} de favoritos`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-ink/50 transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </aside>

      {/* Minimizado: pestaña compacta con corazón y cantidad (toda la
          pestaña abre el panel). Abierto se oculta: el encabezado pasa a
          ser el del panel. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label={`Ver favoritos (${items.length})`}
          className="flex w-11 flex-col items-center justify-center gap-1.5 bg-brand-dark py-3 text-white transition-colors hover:bg-brand-primary"
        >
          <Heart className="h-5 w-5 shrink-0" strokeWidth={2} fill="currentColor" />
          <span className="rounded-md bg-white/20 px-1.5 text-xs font-bold">{items.length}</span>
        </button>
      )}
    </div>
  );
}
