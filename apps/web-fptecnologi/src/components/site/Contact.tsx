import { CONTACT_INFO } from '@/lib/content';

const ITEMS = [
  { label: 'Dirección', value: CONTACT_INFO.address, icon: 'M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
  { label: 'Ventas', value: CONTACT_INFO.phoneVentas, icon: 'M6.6 10.2c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C9.6 20 4 14.4 4 7.5c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z' },
  { label: 'Ventas web', value: CONTACT_INFO.phoneVentasWeb, icon: 'M6.6 10.2c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C9.6 20 4 14.4 4 7.5c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z' },
  { label: 'Correo', value: CONTACT_INFO.email, icon: 'M4 6h16v12H4zm0 1 8 6 8-6' },
] as const;

export function Contact() {
  return (
    <section id="contacto" className="relative overflow-hidden bg-brand-dark py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-teal-light">Hablemos</span>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            ¿Listo para modernizar la tecnología de tu empresa?
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            Escríbenos y un asesor especializado te ayuda a armar la mejor solución para tu negocio, con stock
            local y tiempos de entrega reales.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal-light">
                  <path d={item.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://wa.me/51908856286"
            target="_blank"
            rel="noreferrer"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-dark shadow-lg transition-transform hover:scale-[1.03]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5 0 .5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
            </svg>
            Escribir por WhatsApp
          </a>
        </div>

        <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <iframe
            title="Ubicación FPTecnologi & System"
            className="h-full w-full grayscale invert-[0.92] contrast-[1.05]"
            loading="lazy"
            src="https://www.google.com/maps?q=Jr.+Huaraz+1841,+Bre%C3%B1a,+Lima&output=embed"
          />
        </div>
      </div>
    </section>
  );
}
