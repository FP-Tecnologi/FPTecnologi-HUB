import Enlace from "./Enlace";
import { Icono, Chevrones } from "./ui";
import { EMPRESA, NAV } from "@/lib/datos";

export default function Pie() {
  return (
    <footer className="relative overflow-hidden bg-[#232327] text-white">
      <div className="cuadricula-claro absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_1fr_1.2fr]">
        <div>
          <img src="/logo-blanco.svg" alt="Company IMC E.I.R.L." className="h-16 w-auto" />
          <p className="mt-5 max-w-sm leading-relaxed text-white/70">Soluciones tecnológicas para el crecimiento empresarial. Tu socio estratégico en equipos, redes y soporte técnico.</p>
          <Chevrones claro className="mt-6 opacity-60" />
        </div>
        <nav aria-label="Pie">
          <h3 className="text-sm font-bold uppercase tracking-widest text-naranja">Navegación</h3>
          <ul className="mt-4 space-y-2">
            {NAV.map(([t, h]) => <li key={h}><Enlace href={h} className="inline-block text-white/80 transition hover:translate-x-1 hover:text-naranja">{t}</Enlace></li>)}
            <li><a href="https://kelqa.com" className="inline-block text-white/80 transition hover:translate-x-1 hover:text-naranja">Kelqa, nuestra nueva marca ↗</a></li>
          </ul>
        </nav>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-naranja">Contáctenos</h3>
          <ul className="mt-4 space-y-3 text-white/80">
            <li className="flex gap-3"><Icono n="ubicacion" className="mt-0.5 h-5 w-5 shrink-0 text-naranja" /><span>{EMPRESA.direccion.join(", ")}</span></li>
            <li className="flex gap-3"><Icono n="telefono" className="h-5 w-5 shrink-0 text-naranja" /><a href={EMPRESA.whatsapp} className="hover:text-naranja">{EMPRESA.telefono}</a></li>
            <li className="flex gap-3"><Icono n="correo" className="h-5 w-5 shrink-0 text-naranja" /><a href={`mailto:${EMPRESA.correo}`} className="hover:text-naranja">{EMPRESA.correo}</a></li>
            <li className="flex gap-3"><Icono n="reloj" className="h-5 w-5 shrink-0 text-naranja" />{EMPRESA.horario}</li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-5 py-5 text-center text-sm text-white/50">© 2025 {EMPRESA.nombre} Todos los derechos reservados.</div>
    </footer>
  );
}
