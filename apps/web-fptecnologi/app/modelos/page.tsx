const MODELS = [
  {
    href: '/',
    title: 'Modelo 1',
    text: 'Hero con degradé de marca a pantalla completa, sin formas sueltas.',
    style: 'Gradiente de marca',
    styleDesc: 'Hero con degradé + blobs de color propios de la marca. Corporativo, sin blanco y negro puro.',
    sections: ['Barra superior', 'Header', 'Hero', 'Marcas (marquesina)', 'Servicios', 'Productos destacados', 'Por qué elegirnos', 'Estadísticas', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-2',
    title: 'Modelo 2',
    text: 'Hero oscuro con manchas de luz difuminadas, botón con barrido y flip de ícono.',
    style: 'Oscuro con resplandores',
    styleDesc: 'Fondo negro/tinta con manchas de luz difuminadas (blur) detrás del contenido. Dinámico, alto contraste.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-3',
    title: 'Modelo 3',
    text: 'Degradé de esquina y patrón triangular sutil sobre fondo claro.',
    style: 'Claro minimalista',
    styleDesc: 'Fondo blanco/papel, un solo blob de color en la esquina y patrón diagonal sutil. Limpio, aire.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-4',
    title: 'Modelo 4',
    text: 'Tarjetas de servicio con foto de fondo y overlay oscuro, ícono flotante.',
    style: 'Oscuro degradado',
    styleDesc: 'Hero con degradé de marca de fondo a fondo (sin blobs sueltos) y tarjetas de servicio con foto + overlay oscuro.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-5',
    title: 'Modelo 5',
    text: 'Acentos en fuente monoespaciada estilo comentario de código, tarjetas elevadas.',
    style: 'Oscuro tipo consola',
    styleDesc: 'Fondo oscuro con acentos en fuente monoespaciada (estilo comentario de código, "// SERVICIOS"). Técnico.',
    sections: ['Header', 'Hero', 'Servicios', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-6',
    title: 'Modelo 6',
    text: 'Imágenes recortadas en formas curvas/orgánicas, header con vidrio esmerilado.',
    style: 'Claro orgánico + glass',
    styleDesc: 'Fondo blanco, imágenes recortadas en formas curvas/blob (no rectángulos) y header con vidrio esmerilado (glassmorfismo) al hacer scroll.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
] as const;

export const metadata = { title: 'Modelos — FPTecnologi' };

export default function ModelosPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <h1 className="font-bold text-3xl text-ink">Modelos de home — fptecnologi.com</h1>
      <p className="mt-2 text-ink/60">6 propuestas para comparar y elegir.</p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODELS.map((m) => (
          <a key={m.href} href={m.href} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-brand-primary">{m.title}</h2>
              <span className="shrink-0 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
                {m.style}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/60">{m.text}</p>
            <p className="mt-2 text-sm text-ink/50">{m.styleDesc}</p>
            <p className="mt-3 border-t border-black/5 pt-3 text-xs leading-relaxed text-ink/45">
              <span className="font-semibold text-ink/60">Estructura: </span>
              {m.sections.join(' → ')}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
