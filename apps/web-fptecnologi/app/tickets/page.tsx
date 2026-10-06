import { ClipboardList, Headset, MessageSquareText } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { SoporteTickets } from '@/components/site/SoporteTickets';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { Footer } from '@/components/home/Footer';
export const metadata = { title: 'Tickets de soporte' };

const PASOS = [
  { Icono: ClipboardList, titulo: 'Elige el tipo de caso', texto: 'Verificar un producto, registrar un reclamo o pedir soporte técnico.' },
  { Icono: MessageSquareText, titulo: 'Cuéntanos qué pasó', texto: 'Déjanos tus datos, el pedido o producto y la descripción del problema.' },
  { Icono: Headset, titulo: 'Te contactamos', texto: 'El área comercial recibe tu ticket y te contacta para darle seguimiento.' },
];

/* Tickets: página completa de soporte para clientes de FP (verificación de productos, reclamos y soporte). */
export default function TicketsPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Tickets', href: '/tickets' },
        ]}
        badge="Soporte"
        titulo="Soporte por"
        destacado="tickets"
        descripcion="Registra un caso sobre un producto que compraste con nosotros y el área comercial le dará seguimiento."
        imagen="/images/modelo9/hero-office.jpg"
      >
        <MoreInfoButton tone="dark" href="/tickets/seguimiento" label="Ver seguimiento" />
        <MoreInfoButton tone="dark" href="/libro-de-reclamaciones" label="Libro reclamos" />
      </PageHero>

      <main>
        <SoporteTickets />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal direction="up" className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
              <SectionBadge>Cómo funciona</SectionBadge>
              <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
                <span className="text-ink">Tres pasos</span> <span className="title-shimmer-light">para resolverlo</span>
              </h2>
            </ScrollReveal>
            <div className="grid gap-5 md:grid-cols-3">
              {PASOS.map(({ Icono, titulo, texto }, i) => (
                <ScrollReveal key={titulo} direction="up" delayMs={i * 100} className="h-full">
                  <div className="group h-full rounded-2xl border border-brand-100 bg-white p-6 shadow-sm shadow-brand-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary hover:shadow-[0_16px_32px_-10px_rgba(16,122,204,0.6)]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-white">
                      <Icono className="icon-hop h-6 w-6" strokeWidth={1.8} />
                    </span>
                    <p className="mt-4 font-display text-lg font-bold text-ink transition-colors duration-300 group-hover:text-white">
                      {i + 1}. {titulo}
                    </p>
                    <p className="mt-1 text-sm text-ink/65 transition-colors duration-300 group-hover:text-white/90">{texto}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
