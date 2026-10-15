/*
 * FPTecnologi-HUB · Dashboard — Footer.
 * Server component (no interactivity); uses next/link for nav.
 */
import Link from 'next/link';

// Términos y privacidad: los de la web pública, no una copia dentro del dashboard.
const WEB = (process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'https://fptecnologi.com').replace(/\/$/, '');

export function Footer() {
  return (
    <footer className="ax-footer">
      <div className="ax-footer__left">
        <span className="ax-footer__copy">© 2026 FPTecnologi</span>
        <span className="ax-footer__sep" aria-hidden="true">·</span>
        <span className="ax-footer__version ax-mono">v0.1.0</span>
      </div>
      <nav className="ax-footer__links" aria-label="Footer">
        <Link className="ax-footer__link" href="/pages/landing">Nosotros</Link>
        <Link className="ax-footer__link" href="/soporte">Soporte</Link>
        <a className="ax-footer__link" href={`${WEB}/legal/terminos`} target="_blank" rel="noopener noreferrer">Términos</a>
        <a className="ax-footer__link" href={`${WEB}/legal/privacidad`} target="_blank" rel="noopener noreferrer">Privacidad</a>
      </nav>
    </footer>
  );
}

export default Footer;
