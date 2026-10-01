'use client';
/*
 * FPTecnologi-HUB — Política de Privacidad. Adaptada a la Ley N° 29733
 * (Ley de Protección de Datos Personales del Perú), no el texto de ejemplo
 * de Vireo. Genérica pero real, no reemplaza revisión legal.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LegalHeader, TocLayout, H2, H3, P, P_LAST, UL, SEC } from './legalShared';

const SECTIONS = ['recopilamos', 'uso', 'cookies', 'terceros', 'conservacion', 'derechos', 'menores', 'cambios', 'contacto'] as const;

const TOC: { id: string; n: string; label: string }[] = [
  { id: 'recopilamos', n: '01', label: 'Datos que recopilamos' },
  { id: 'uso', n: '02', label: 'Para qué los usamos' },
  { id: 'cookies', n: '03', label: 'Cookies' },
  { id: 'terceros', n: '04', label: 'Con quién los compartimos' },
  { id: 'conservacion', n: '05', label: 'Tiempo de conservación' },
  { id: 'derechos', n: '06', label: 'Tus derechos ARCO' },
  { id: 'menores', n: '07', label: 'Menores de edad' },
  { id: 'cambios', n: '08', label: 'Cambios a esta política' },
  { id: 'contacto', n: '09', label: 'Contacto' },
];

export function Privacidad() {
  const [active, setActive] = useState<string>('recopilamos');

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
      <LegalHeader title="Política de privacidad" updated="13 de septiembre de 2026" />
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
        <div className="ax-alert ax-alert--accent ax-alert--accent-edge" role="note">
          <div className="ax-alert__content">
            <p className="ax-alert__message" style={{ color: 'var(--ax-text)' }}>Tratamos tus datos personales conforme a la Ley N° 29733 (Ley de Protección de Datos Personales) y su reglamento.</p>
          </div>
        </div>

        <section id="recopilamos" style={SEC}>
          <h2 style={H2}>1. Datos que recopilamos</h2>
          <h3 style={H3}>1.1 Los que nos das directamente</h3>
          <p style={P}>Nombre, correo, contraseña, dirección de envío y datos de facturación cuando te registras, compras o solicitas una cotización.</p>
          <h3 style={H3}>1.2 Los que se generan automáticamente</h3>
          <p style={P_LAST}>Dirección IP, tipo de navegador y páginas visitadas, para operar y proteger la plataforma.</p>
        </section>

        <section id="uso" style={SEC}>
          <h2 style={H2}>2. Para qué los usamos</h2>
          <ul style={UL}>
            <li>procesar pedidos, pagos y envíos;</li>
            <li>dar seguimiento a solicitudes de cotización;</li>
            <li>enviarte el código de verificación de acceso (2FA);</li>
            <li>prevenir fraude y proteger la cuenta;</li>
            <li>cumplir obligaciones legales y tributarias.</li>
          </ul>
        </section>

        <section id="cookies" style={SEC}>
          <h2 style={H2}>3. Cookies</h2>
          <p style={P_LAST}>Usamos cookies esenciales para mantener tu sesión iniciada y recordar tus preferencias de tema. No usamos cookies de publicidad de terceros.</p>
        </section>

        <section id="terceros" style={SEC}>
          <h2 style={H2}>4. Con quién los compartimos</h2>
          <p style={P_LAST}>No vendemos tus datos personales. Los compartimos solo con proveedores necesarios para operar el Servicio (envío de correos, hosting, procesamiento de pagos) bajo acuerdos de confidencialidad, o cuando la ley lo exige.</p>
        </section>

        <section id="conservacion" style={SEC}>
          <h2 style={H2}>5. Tiempo de conservación</h2>
          <p style={P_LAST}>Conservamos tus datos mientras tu cuenta esté activa. Si la cierras, los eliminamos o anonimizamos dentro de 90 días, salvo obligación legal de conservarlos por más tiempo (ej. comprobantes de pago).</p>
        </section>

        <section id="derechos" style={SEC}>
          <h2 style={H2}>6. Tus derechos ARCO</h2>
          <p style={P}>Tienes derecho a Acceder, Rectificar, Cancelar y Oponerte al tratamiento de tus datos personales (derechos ARCO), conforme a la Ley N° 29733.</p>
          <p style={P_LAST}>Para ejercerlos, escríbenos a <b>dev@fptecnologi.com</b>. Responderemos dentro del plazo que establece la ley.</p>
        </section>

        <section id="menores" style={SEC}>
          <h2 style={H2}>7. Menores de edad</h2>
          <p style={P_LAST}>El Servicio no está dirigido a menores de 18 años. Si detectamos una cuenta de un menor sin autorización de sus padres o tutores, la eliminaremos.</p>
        </section>

        <section id="cambios" style={SEC}>
          <h2 style={H2}>8. Cambios a esta política</h2>
          <p style={P_LAST}>Podemos actualizar esta Política. Si hacemos cambios relevantes, te avisaremos por correo o dentro de la plataforma y actualizaremos la fecha de esta página.</p>
        </section>

        <section id="contacto" style={SEC}>
          <h2 style={H2}>9. Contacto</h2>
          <p style={{ color: 'var(--ax-text)', lineHeight: 1.7, margin: '0 0 var(--ax-space-4)' }}>¿Preguntas sobre tus datos? Escríbenos:</p>
          <p style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)', margin: 0 }}>dev@fptecnologi.com</p>
        </section>

        <div className="ax-divider" style={{ borderTop: '1px solid var(--ax-border)', margin: 'var(--ax-space-2) 0' }} />
        <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ax-space-3)' }}>
          <Link className="ax-link" href="/pages/terms">Leer los Términos y condiciones →</Link>
          <a className="ax-btn ax-btn--ghost ax-btn--sm" href="#top">
            <span className="ax-btn__label">Volver arriba</span>
          </a>
        </div>
      </TocLayout>
    </main>
  );
}

export default Privacidad;
