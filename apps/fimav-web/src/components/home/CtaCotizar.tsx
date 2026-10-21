import Link from 'next/link';

export default function CtaCotizar() {
  return (
    <section className="bg-carbon py-16 text-white" style={{ clipPath: 'polygon(0 0, 50% 28px, 100% 0, 100% 100%, 0 100%)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 pt-6 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-medium">Cotiza con Fimav Perú</h2>
          <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-rojo" />
          <p className="mt-2 text-white/80">Cuéntanos qué necesitas y te respondemos con una propuesta.</p>
        </div>
        <Link href="/cotizar" className="rounded-full bg-boton px-8 focus-visible:outline-white py-3 font-semibold text-white">Cotizar ahora</Link>
      </div>
    </section>
  );
}
