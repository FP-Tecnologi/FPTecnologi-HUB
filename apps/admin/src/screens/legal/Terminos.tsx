'use client';
/*
 * FPTecnologi-HUB — Términos y Condiciones. Contenido real (no el texto de
 * ejemplo de Vireo "reemplázalo antes de producción"), adaptado al negocio:
 * venta de productos por ecommerce + servicios TI por cotización, Perú.
 * Sigue siendo texto genérico razonable, no reemplaza revisión legal.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LegalHeader, TocLayout, H2, H3, P, P_LAST, UL, SEC } from './legalShared';

const SECTIONS = ['introduccion', 'cuenta', 'uso-aceptable', 'compras', 'servicios', 'propiedad-intelectual', 'terminacion', 'garantias', 'cambios', 'contacto'] as const;

const TOC: { id: string; n: string; label: string }[] = [
  { id: 'introduccion', n: '01', label: 'Introducción' },
  { id: 'cuenta', n: '02', label: 'Tu cuenta' },
  { id: 'uso-aceptable', n: '03', label: 'Uso aceptable' },
  { id: 'compras', n: '04', label: 'Compras y pagos' },
  { id: 'servicios', n: '05', label: 'Servicios y cotizaciones' },
  { id: 'propiedad-intelectual', n: '06', label: 'Propiedad intelectual' },
  { id: 'terminacion', n: '07', label: 'Terminación' },
  { id: 'garantias', n: '08', label: 'Garantías y responsabilidad' },
  { id: 'cambios', n: '09', label: 'Cambios a estos términos' },
  { id: 'contacto', n: '10', label: 'Contacto' },
];

export function Terminos() {
  const [active, setActive] = useState<string>('introduccion');

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const tocLink = (id: string): React.CSSProperties => ({
    display: 'block',
    padding: '6px var(--ax-space-3)',
    borderRadius: 'var(--ax-radius-sm)',
    fontSize: 'var(--ax-text-sm)',
    textDecoration: 'none',
    ...(active === id ? { color: 'var(--ax-accent)', background: 'var(--ax-accent-wash)' } : { color: 'var(--ax-text-muted)' }),
  });

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--ax-space-6) var(--ax-space-5)' }}>
      <LegalHeader title="Términos y condiciones" updated="13 de septiembre de 2026" />
      <TocLayout
        toc={
          <nav className="ax-card ax-doc__toc" aria-label="Tabla de contenido" style={{ position: 'sticky', top: 'var(--ax-space-6)', alignSelf: 'start' }}>
            <div className="ax-card__body" style={{ padding: 'var(--ax-space-5)' }}>
              <p className="ax-card__eyebrow" style={{ marginBottom: 'var(--ax-space-3)' }}>En esta página</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 2, listStyle: 'none', margin: 0, padding: 0 }}>
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="ax-toc__link" style={tocLink(t.id)}>
                      <span className="ax-num" style={{ fontFamily: 'var(--ax-font-mono)', color: 'var(--ax-text-subtle)', marginInlineEnd: 6 }}>{t.n}</span>
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        }
      >
        <section id="introduccion" style={SEC}>
          <h2 style={H2}>1. Introducción</h2>
          <p style={P}>Estos Términos y Condiciones ("Términos") regulan el acceso y uso de la plataforma FPTecnologi (el "Servicio"), operada por FPTecnologi. Incluye la tienda en línea y la solicitud de servicios y cotizaciones de soluciones tecnológicas.</p>
          <p style={P_LAST}>Al crear una cuenta o usar el Servicio, aceptas estos Términos. Si actúas en nombre de una empresa, declaras tener autoridad para representarla.</p>
        </section>

        <section id="cuenta" style={SEC}>
          <h2 style={H2}>2. Tu cuenta</h2>
          <p style={P}>Para comprar o solicitar cotizaciones debes registrarte con datos reales y vigentes.</p>
          <h3 style={H3}>2.1 Seguridad de la cuenta</h3>
          <p style={P}>Eres responsable de proteger tu contraseña y de toda actividad realizada desde tu cuenta. Avísanos de inmediato ante cualquier acceso no autorizado.</p>
          <h3 style={H3}>2.2 Elegibilidad</h3>
          <p style={P_LAST}>Debes ser mayor de edad para registrarte. Al usar el Servicio declaras cumplir este requisito.</p>
        </section>

        <section id="uso-aceptable" style={SEC}>
          <h2 style={H2}>3. Uso aceptable</h2>
          <p style={P}>No está permitido:</p>
          <ul style={UL}>
            <li>usar el Servicio con fines ilícitos o fraudulentos;</li>
            <li>intentar acceder sin autorización a sistemas o datos de otros usuarios;</li>
            <li>interferir con el funcionamiento normal de la plataforma;</li>
            <li>revender o redistribuir el Servicio sin autorización escrita.</li>
          </ul>
        </section>

        <section id="compras" style={SEC}>
          <h2 style={H2}>4. Compras y pagos</h2>
          <p style={P}>Los precios se muestran en soles (PEN) e incluyen los impuestos de ley salvo que se indique lo contrario. El pedido se confirma al recibir la confirmación de pago.</p>
          <p style={P_LAST}>Las devoluciones y cambios se rigen por el Código de Protección y Defensa del Consumidor del Perú (Ley N° 29571).</p>
        </section>

        <section id="servicios" style={SEC}>
          <h2 style={H2}>5. Servicios y cotizaciones</h2>
          <p style={P_LAST}>Además de la venta de productos, ofrecemos servicios de soluciones tecnológicas mediante cotización. Una cotización aceptada no constituye un contrato de servicio hasta que ambas partes confirmen alcance, plazos y condiciones de pago por escrito.</p>
        </section>

        <section id="propiedad-intelectual" style={SEC}>
          <h2 style={H2}>6. Propiedad intelectual</h2>
          <p style={P_LAST}>El contenido, diseño y software de la plataforma son propiedad de FPTecnologi o de sus licenciantes. Se te otorga una licencia limitada y no transferible para usar el Servicio conforme a estos Términos.</p>
        </section>

        <section id="terminacion" style={SEC}>
          <h2 style={H2}>7. Terminación</h2>
          <p style={P_LAST}>Puedes dejar de usar el Servicio cuando quieras. Podemos suspender o cerrar tu cuenta si incumples estos Términos o por requerimiento legal.</p>
        </section>

        <section id="garantias" style={SEC}>
          <h2 style={H2}>8. Garantías y responsabilidad</h2>
          <p style={P_LAST}>El Servicio se ofrece "tal como está". En la medida permitida por ley, FPTecnologi no será responsable por daños indirectos o lucro cesante derivados del uso de la plataforma. Los productos con garantía de fábrica se rigen por las condiciones del fabricante.</p>
        </section>

        <section id="cambios" style={SEC}>
          <h2 style={H2}>9. Cambios a estos términos</h2>
          <p style={P_LAST}>Podemos actualizar estos Términos. Los cambios relevantes se notificarán por correo o dentro de la plataforma antes de entrar en vigencia.</p>
        </section>

        <section id="contacto" style={SEC}>
          <h2 style={H2}>10. Contacto</h2>
          <p style={{ color: 'var(--ax-text)', lineHeight: 1.7, margin: '0 0 var(--ax-space-4)' }}>¿Preguntas sobre estos Términos? Escríbenos:</p>
          <p style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)', margin: 0 }}>dev@fptecnologi.com</p>
        </section>

        <div className="ax-divider" style={{ borderTop: '1px solid var(--ax-border)', margin: 'var(--ax-space-2) 0' }} />
        <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ax-space-3)' }}>
          <Link className="ax-link" href="/pages/privacy">Leer la Política de privacidad →</Link>
          <a className="ax-btn ax-btn--ghost ax-btn--sm" href="#top">
            <span className="ax-btn__label">Volver arriba</span>
          </a>
        </div>
      </TocLayout>
    </main>
  );
}

export default Terminos;
