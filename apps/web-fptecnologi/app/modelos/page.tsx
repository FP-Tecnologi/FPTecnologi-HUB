const MODELS = [
  {
    href: '/',
    title: 'Modelo 1',
    text: 'Propuesta original — mesh de marca, sin referencia de plantilla.',
    style: 'Gradiente de marca',
    styleDesc: 'Hero con degradé + blobs de color propios de la marca. Corporativo, sin blanco y negro puro.',
  },
  {
    href: '/modelo-2',
    title: 'Modelo 2',
    text: 'Basado en Home1 de Techon — hero oscuro, botón barrido, flip de ícono.',
    style: 'Oscuro con resplandores',
    styleDesc: 'Fondo negro/tinta con manchas de luz difuminadas (blur) detrás del contenido. Dinámico, alto contraste.',
  },
  {
    href: '/modelo-3',
    title: 'Modelo 3',
    text: 'Basado en Home2 de Techon — degradé de esquina, patrón triangular.',
    style: 'Claro minimalista',
    styleDesc: 'Fondo blanco/papel, un solo blob de color en la esquina y patrón diagonal sutil. Limpio, aire.',
  },
  {
    href: '/modelo-4',
    title: 'Modelo 4',
    text: 'Basado en Home3 de Techon — tarjetas con ícono cuadrado flotante.',
    style: 'Oscuro degradado',
    styleDesc: 'Hero con degradé de marca de fondo a fondo (sin blobs sueltos) y tarjetas de servicio con foto + overlay oscuro.',
  },
  {
    href: '/modelo-5',
    title: 'Modelo 5',
    text: 'Basado en Home4 de Techon — header diagonal, tarjetas elevadas.',
    style: 'Oscuro tipo consola',
    styleDesc: 'Fondo oscuro con acentos en fuente monoespaciada (estilo comentario de código, "// SERVICIOS"). Técnico.',
  },
  {
    href: '/modelo-6',
    title: 'Modelo 6',
    text: 'Basado en Home5 de Techon — máscara curva/orgánica, ícono circular.',
    style: 'Claro orgánico + glass',
    styleDesc: 'Fondo blanco, imágenes recortadas en formas curvas/blob (no rectángulos) y header con vidrio esmerilado (glassmorfismo) al hacer scroll.',
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
          </a>
        ))}
      </div>
    </main>
  );
}
