import Image from 'next/image';
import { WHY_CHOOSE_US } from '@/lib/content';
import { ArrowUpRightIcon } from '@/components/site/icons';

export function WhyChoose9() {
  return (
    <section id="nosotros" className="bg-white px-6 py-20 md:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-sm text-[rgba(30,50,90,0.7)]">¿Por qué elegirnos?</span>
          <h2 className="mt-1 text-3xl font-normal tracking-tight text-[#3d4452] sm:text-4xl">Por qué elegir FPTecnologi</h2>

          <ul className="mt-8 flex flex-col gap-5">
            {WHY_CHOOSE_US.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(30,50,90,0.08)] text-[rgba(30,50,90,0.8)]">
                  <ArrowUpRightIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-[#3d4452]">{item.title}</p>
                  <p className="mt-0.5 text-sm text-[rgba(30,50,90,0.6)]">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[rgba(30,50,90,0.08)] blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/40">
            <Image
              src="/images/modelo7/equipo.jpg"
              alt="Equipo comercial FPTecnologi en reunión"
              width={900}
              height={506}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
