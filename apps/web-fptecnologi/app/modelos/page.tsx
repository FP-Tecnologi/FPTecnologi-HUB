const MODELS = [
  { href: '/', title: 'Modelo 1', text: 'Propuesta original — mesh de marca, sin referencia de plantilla.' },
  { href: '/modelo-2', title: 'Modelo 2', text: 'Basado en Home1 de Techon — hero oscuro, botón barrido, flip de ícono.' },
  { href: '/modelo-3', title: 'Modelo 3', text: 'Basado en Home2 de Techon — degradé de esquina, patrón triangular.' },
  { href: '/modelo-4', title: 'Modelo 4', text: 'Basado en Home3 de Techon — tarjetas con ícono cuadrado flotante.' },
  { href: '/modelo-5', title: 'Modelo 5', text: 'Basado en Home4 de Techon — header diagonal, tarjetas elevadas.' },
  { href: '/modelo-6', title: 'Modelo 6', text: 'Basado en Home5 de Techon — máscara curva/orgánica, ícono circular.' },
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
            <h2 className="text-lg font-semibold text-brand-primary">{m.title}</h2>
            <p className="mt-2 text-sm text-ink/60">{m.text}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
