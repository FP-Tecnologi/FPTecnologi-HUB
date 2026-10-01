'use client';

import { useState } from 'react';
import { Header } from '@/components/site/Header';
import { HeaderDark } from '@/components/site/HeaderDark';
import { Footer } from '@/components/site/Footer';
import { ClickConfirmButton } from '@/components/site/ClickConfirmButton';
import { ServiceCardFinal } from '@/components/site/ServiceCardFinal';
import { ProductCardFinal } from '@/components/site/ProductCardFinal';
import { ProductComparisonTable } from '@/components/site/ProductComparisonTable';
import { PartnerCtaRiteflow } from '@/components/riteflow/PartnerCtaRiteflow';
import { CurrencyToggle } from '@/components/site/CurrencyToggle';
import { BrandMarquee } from '@/components/site/BrandMarquee';
import { SOLUTIONS, FEATURED_PRODUCTS } from '@/lib/content';

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Section({ n, title, desc, children }: { n: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <h2 className="font-display text-2xl font-bold text-ink">
        {n}. {title}
      </h2>
      {desc && <p className="mt-2 max-w-2xl text-sm text-ink/60">{desc}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * Página de estilos FINAL -- a diferencia de /guia-estilos (que muestra
 * todas las variantes para comparar), acá solo va lo que el usuario ya
 * eligió, con los componentes reales que va a usar el sitio (no demos
 * sueltas). Referencia: plan en .claude/plans -- "Página de estilos final +
 * componentes definitivos (Fase 1)".
 */
export default function GuiaEstilosFinalPage() {
  const [compareSkus, setCompareSkus] = useState<string[]>([]);
  const toggleCompare = (sku: string) => {
    setCompareSkus((prev) => (prev.includes(sku) ? prev.filter((s) => s !== sku) : prev.length < 4 ? [...prev, sku] : prev));
  };
  const comparedProducts = FEATURED_PRODUCTS.filter((p) => compareSkus.includes(p.sku));

  return (
    <main className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-14">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Estilos final</span>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Elementos definitivos del sitio</h1>
        <p className="mt-3 max-w-2xl text-sm text-ink/60">
          Cada pieza acá ya es la versión elegida (no hay alternativas para comparar, eso vive en{' '}
          <a href="/guia-estilos" className="text-brand-primary underline">
            /guia-estilos
          </a>
          ) y son componentes reales de <code className="text-ink/70">src/components</code>, listos para usarse en la home.
        </p>
      </div>

      <Section n="1" title="Encabezados" desc="Uno claro para Tienda/ecommerce, uno oscuro para Soluciones/informativo -- mismos links y submenús reales en los dos.">
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">Tienda / ecommerce</p>
            <div className="relative overflow-hidden rounded-2xl border border-black/10 shadow-sm [&_header]:sticky-0">
              <Header />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">Soluciones / informativo</p>
            <div className="relative overflow-hidden rounded-2xl bg-[#0b1622] [&_header]:sticky-0">
              <HeaderDark />
            </div>
          </div>
        </div>
      </Section>

      <Section
        n="2"
        title="Botones"
        desc="Primario, secundario y de texto -- al hacer click, el ícono viaja de un lado al otro mientras el texto se borra (efecto sweep), y recién ahí muestra el estado final."
      >
        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-black/10 bg-white p-8">
          <ClickConfirmButton icon={<CartIcon />} label="Agregar al carrito" doneIcon={<CheckIcon />} doneLabel="Agregado" />
          <ClickConfirmButton
            icon={<CartIcon />}
            label="Cotizar ahora"
            doneIcon={<CheckIcon />}
            doneLabel="Enviado"
            className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink"
            doneClassName="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40"
          />
          <ClickConfirmButton
            icon={<CartIcon />}
            label="Ver más"
            doneIcon={<CheckIcon />}
            doneLabel="Listo"
            className="text-sm font-semibold text-brand-primary"
            doneClassName="text-sm font-semibold text-emerald-600"
          />
        </div>
      </Section>

      <Section n="3" title="Tarjeta de servicio" desc="Badge antes del título, descripción a 2 líneas y botón 'Más información' hacia el detalle real del servicio.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SOLUTIONS.slice(0, 4).map((item) => (
            <ServiceCardFinal key={item.slug} item={item} />
          ))}
        </div>
      </Section>

      <Section n="4" title="Tarjeta de producto" desc="Estilo Vireo + zoom de imagen al hover + comparar + ver galería (click sobre la foto).">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => (
            <ProductCardFinal key={p.sku} product={p} compared={compareSkus.includes(p.sku)} onToggleCompare={toggleCompare} />
          ))}
        </div>
        <p className="mt-3 text-xs text-ink/45">Marcá el ícono de comparar en 2 o más productos para ver la tabla de la sección 7.</p>
      </Section>

      <Section n="5" title="Tarjeta informativa (partners)" desc="Estilo Riteflow, reusado tal cual.">
        <div className="overflow-hidden rounded-2xl">
          <PartnerCtaRiteflow />
        </div>
      </Section>

      <Section n="6" title="Selector de moneda" desc="Sólido, color por moneda: azul para USD, ámbar para PEN.">
        <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-8">
          <CurrencyToggle />
        </div>
      </Section>

      <Section n="7" title="Comparación de productos" desc="Tabla horizontal con imagen -- marcá productos para comparar en la sección 4.">
        {comparedProducts.length >= 2 ? (
          <ProductComparisonTable products={comparedProducts} />
        ) : (
          <p className="text-sm text-ink/45">Todavía no marcaste productos para comparar.</p>
        )}
      </Section>

      <Section n="8" title="Marcas" desc="Hover: zoom + color real, y el carrusel se pausa para poder mirar el logo con calma.">
        <div className="overflow-hidden rounded-2xl border border-black/10">
          <BrandMarquee showLabel={false} />
        </div>
      </Section>

      <Section n="9" title="Burbuja de chat / WhatsApp" desc="Forma de burbuja, ícono de mensaje simple, anillo de pulso, y ahora con selector de área (Ventas/Servicios/Tienda/Partners) -- abrila con el botón flotante de esta misma página, abajo a la derecha.">
        <p className="text-sm text-ink/45">El widget vive en el layout raíz -- ya está visible en esta página, abajo a la derecha.</p>
      </Section>

      <Section n="10" title="Carrito" desc="Ícono cuadrado con badge azul, panel con stepper +/-, tacho para eliminar, y desglose Subtotal / Envío / IGV (18%) / Total.">
        <p className="text-sm text-ink/45">Abrí el carrito desde el ícono del encabezado de arriba (sección 1) -- agregá un producto de la sección 4 para verlo con contenido.</p>
      </Section>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  );
}
