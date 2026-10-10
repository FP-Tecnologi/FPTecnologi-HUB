import Link from 'next/link';
import { ArrowRight, ClipboardList, Globe, MapPin, MessageCircle, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { CATS } from '@/lib/piezas';
import { WHATSAPP, waUrl } from '@/lib/contacto';

const TELEFONO = `+${WHATSAPP.slice(0, 2)} ${WHATSAPP.slice(2, 5)} ${WHATSAPP.slice(5, 8)} ${WHATSAPP.slice(8)}`;

const COLUMNAS = [
  {
    titulo: 'Comprar',
    enlaces: [
      { href: '/armar', texto: 'Arma tu PC' },
      { href: '/tienda', texto: 'Tienda de componentes' },
      { href: '/cotizar', texto: 'Cotizador' },
      { href: '/carrito', texto: 'Mi carrito' },
    ],
  },
  {
    titulo: 'Componentes',
    enlaces: CATS.map((c) => ({ href: `/tienda?cat=${c.id}`, texto: c.titulo })),
  },
  {
    titulo: 'Quamtu',
    enlaces: [
      { href: '/#lineas', texto: 'Líneas Turing' },
      { href: '/#uso', texto: 'Para tu uso' },
      { href: '/#respaldo', texto: 'Respaldo y garantía' },
      { href: '/#contacto', texto: 'Contacto' },
    ],
  },
];

const GARANTIAS = [
  { i: Wrench, t: 'Armado a medida', d: 'Ensamblaje y pruebas por especialistas' },
  { i: ShieldCheck, t: 'Garantía y soporte', d: 'Repuestos originales, respuesta rápida' },
  { i: Truck, t: 'Entrega coordinada', d: 'La acordamos contigo al confirmar tu pedido' },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-line bg-panel/60">
      {/* Franja de ayuda */}
      <div id="contacto" className="scroll-mt-20 border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">¿Necesitas ayuda para <span className="titulo-neon">elegir?</span></h2>
            <p className="mt-2 max-w-xl text-slate-400">Nuestros especialistas te asesoran con datos técnicos, no comerciales.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={waUrl('Hola Quamtu, necesito asesoría para elegir mi equipo.')} target="_blank" rel="noreferrer" className="btn-neon inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-sm">
              <MessageCircle size={18} /> ESCRÍBENOS POR WHATSAPP
            </a>
            <Link href="/cotizar" className="btn-borde inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-sm">
              <ClipboardList size={18} /> COTIZAR <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Columnas */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-blanco.png" alt="Quamtu" width={160} height={42} className="h-10 w-auto" />
          <p className="mt-5 max-w-sm text-slate-400">
            No construimos hardware convencional: diseñamos herramientas de ingeniería a la medida para cerrar la brecha entre la necesidad técnica y la capacidad operativa.
          </p>
          <ul className="mt-6 space-y-3">
            {GARANTIAS.map(({ i: Icono, t, d }) => (
              <li key={t} className="flex items-start gap-3">
                <Icono size={18} className="mt-0.5 shrink-0 text-claro" />
                <span className="text-sm"><b className="text-slate-200">{t}</b><span className="block text-slate-500">{d}</span></span>
              </li>
            ))}
          </ul>
        </div>

        {COLUMNAS.map((c) => (
          <nav key={c.titulo} aria-label={c.titulo}>
            <h3 className="font-display text-sm font-bold tracking-[0.2em] text-white">{c.titulo}</h3>
            <ul className="mt-5 space-y-3">
              {c.enlaces.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="text-slate-400 transition hover:text-claro">{e.texto}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="font-display text-sm font-bold tracking-[0.2em] text-white">Contacto</h3>
          <ul className="mt-5 space-y-4 text-slate-400">
            <li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-claro" /> Jr. Huaraz 1841, Breña, Lima, Perú</li>
            <li>
              <a href={waUrl('Hola Quamtu, quisiera más información.')} target="_blank" rel="noreferrer" className="flex items-center gap-3 transition hover:text-claro">
                <MessageCircle size={18} className="shrink-0 text-claro" /> {TELEFONO}
              </a>
            </li>
            <li className="flex items-center gap-3"><Globe size={18} className="shrink-0 text-claro" /> www.quamtu.com</li>
          </ul>
        </div>
      </div>

      {/* Base */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Quamtu. Todos los derechos reservados.</p>
          <p>Precios y disponibilidad referenciales, sujetos a confirmación.</p>
        </div>
      </div>
    </footer>
  );
}
