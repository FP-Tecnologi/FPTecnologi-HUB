import { notFound } from 'next/navigation';
import { TiendaBar } from '@/components/tienda/TiendaBar';
import { ImprimirBoton } from '@/components/tienda/ImprimirBoton';
import { Footer } from '@/components/home/Footer';
import { getSitio } from '@/lib/sitio';

export const metadata = { title: 'Presupuesto', robots: { index: false } };
export const dynamic = 'force-dynamic';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

type Item = { id: string; sku: string; nombre: string; cantidad: number; precioLista: string; precioUnitario: string; mayorista: boolean; subtotal: string };
type Presupuesto = {
  id: string;
  numero: string;
  clienteNombre: string;
  clienteDocumento: string | null;
  clienteEmail: string;
  clienteTelefono: string | null;
  clienteDireccion: string | null;
  notas: string | null;
  moneda: string;
  subtotal: string;
  igv: string;
  total: string;
  validezHasta: string;
  createdAt: string;
  items: Item[];
};

async function cargar(id: string): Promise<Presupuesto | null> {
  if (!MARCA_ID) return null;
  try {
    const res = await fetch(`${API_URL}/public/presupuestos/${encodeURIComponent(id)}?marcaId=${encodeURIComponent(MARCA_ID)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as Presupuesto | null;
  } catch {
    return null;
  }
}

const usd = (n: string | number) => `US$ ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fecha = (d: string) => new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

/* Presupuesto mayorista: documento tipo boleta con los datos del cliente, los
   productos, cantidades, precios de mayorista, IGV y total. Se imprime o se
   guarda como PDF desde el navegador (barra y pie se ocultan al imprimir). */
export default async function PresupuestoDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, { contact }] = await Promise.all([cargar(id), getSitio()]);
  if (!p) notFound();

  return (
    <>
      <div className="print:hidden">
        <TiendaBar crumbs={[{ label: 'Tienda', href: '/tienda' }, { label: 'Presupuesto' }]} titulo={`Presupuesto ${p.numero}`} />
      </div>
      <main className="bg-paper pb-20 pt-10 print:bg-white print:p-0">
        <div className="mx-auto max-w-4xl px-6 print:max-w-none print:px-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm text-ink/65">Guardamos este presupuesto con el número <strong className="text-ink">{p.numero}</strong>. Un asesor se comunicará contigo.</p>
            <ImprimirBoton />
          </div>

          <article className="rounded-2xl border border-brand-100 bg-white p-8 shadow-xl shadow-brand-950/10 sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
            <header className="flex flex-wrap items-start justify-between gap-6 border-b border-brand-100 pb-6">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-fptecnologi.svg" alt="FPTecnologi & System" className="h-12 w-auto" />
                <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink/65">{contact.address}<br />{contact.phoneVentas} · {contact.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Presupuesto</p>
                <p className="font-display text-2xl font-bold text-ink">{p.numero}</p>
                <p className="mt-1 text-xs text-ink/65">Emitido: {fecha(p.createdAt)}</p>
                <p className="text-xs text-ink/65">Válido hasta: {fecha(p.validezHasta)}</p>
              </div>
            </header>

            <section className="grid gap-4 border-b border-brand-100 py-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Cliente</p>
                <p className="mt-1 font-semibold text-ink">{p.clienteNombre}</p>
                {p.clienteDocumento && <p className="text-sm text-ink/70">{p.clienteDocumento.length === 11 ? 'RUC' : 'DNI'} {p.clienteDocumento}</p>}
                {p.clienteDireccion && <p className="text-sm text-ink/70">{p.clienteDireccion}</p>}
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Contacto</p>
                <p className="mt-1 text-sm text-ink/70">{p.clienteEmail}</p>
                {p.clienteTelefono && <p className="text-sm text-ink/70">{p.clienteTelefono}</p>}
              </div>
            </section>

            <div className="overflow-x-auto py-6">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b-2 border-brand-primary text-left text-xs font-bold uppercase tracking-wide text-ink/70">
                    <th className="py-2 pr-3">Producto</th>
                    <th className="px-3 py-2 text-center">Cant.</th>
                    <th className="px-3 py-2 text-right">P. unit.</th>
                    <th className="py-2 pl-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {p.items.map((i) => (
                    <tr key={i.id}>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-ink">{i.nombre}</p>
                        <p className="text-xs text-ink/65">SKU {i.sku}{i.mayorista ? ' · precio mayorista' : ''}</p>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-ink">{i.cantidad}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-ink">{usd(i.precioUnitario)}</td>
                      <td className="whitespace-nowrap py-3 pl-3 text-right font-mono font-bold text-ink">{usd(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto w-full max-w-xs space-y-2 border-t border-brand-100 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink/65">Subtotal</dt><dd className="font-mono text-ink">{usd(p.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/65">IGV (18%)</dt><dd className="font-mono text-ink">{usd(p.igv)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-brand-primary pt-3"><dt className="font-bold text-ink">Total</dt><dd className="font-display text-2xl font-bold text-brand-700">{usd(p.total)}</dd></div>
            </dl>

            {p.notas && (
              <section className="mt-6 rounded-xl bg-paper p-4 text-sm print:border print:border-brand-100">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Notas del cliente</p>
                <p className="mt-1 whitespace-pre-line text-ink/75">{p.notas}</p>
              </section>
            )}

            <footer className="mt-8 border-t border-brand-100 pt-4 text-xs leading-relaxed text-ink/65">
              Precios en dólares americanos (US$). Los precios no incluyen IGV; el 18% se suma en el total. Presupuesto válido hasta el {fecha(p.validezHasta)}, sujeto a disponibilidad de stock.
            </footer>
          </article>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
