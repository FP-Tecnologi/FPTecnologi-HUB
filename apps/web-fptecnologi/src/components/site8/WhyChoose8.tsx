import Image from 'next/image';
import { WHY_CHOOSE_US } from '@/lib/content';

export function WhyChoose8() {
  return (
    <section id="nosotros" className="border-t border-white/10 px-6 py-20 lg:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm text-white/50">¿Por qué elegirnos?</span>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">Por qué elegir FPTecnologi</h2>

          <ul className="mt-8 flex flex-col gap-5">
            {WHY_CHOOSE_US.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/25 text-white"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.45) 50%, rgba(160,175,200,0.08))' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-sm text-white/50">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-white/15">
          <Image
            src="/images/modelo7/equipo.jpg"
            alt="Equipo comercial FPTecnologi en reunión"
            width={900}
            height={506}
            className="h-full w-full object-cover opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
