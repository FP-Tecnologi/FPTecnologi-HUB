import { Plus } from 'lucide-react';
import { getPagina } from '@/lib/cms';


export default async function Faq() {
  const { preguntas: PREGUNTAS } = (await getPagina('inicio')).faq;
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PREGUNTAS.map((q) => ({ '@type': 'Question', name: q.p, acceptedAnswer: { '@type': 'Answer', text: q.r } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
      <div className="mx-auto mt-10 grid max-w-3xl gap-3">
        {PREGUNTAS.map((q, n) => (
          <details key={q.p} className="faq group rounded-xl border border-line bg-panel/40 px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-claro/70 hover:bg-cyan/5 hover:shadow-[0_8px_24px_rgba(35,141,193,.18)] open:border-claro open:bg-cyan/10 open:shadow-[0_8px_28px_rgba(35,141,193,.25)] sm:px-5">
            <summary className="flex cursor-pointer list-none items-center gap-4 py-4 font-display text-base font-bold text-white [&::-webkit-details-marker]:hidden">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-claro/40 text-xs text-claro transition-all duration-300 group-hover:scale-110 group-hover:bg-claro/15 group-open:bg-claro group-open:text-bg">{String(n + 1).padStart(2, '0')}</span>
              <span className="flex-1 transition-colors duration-300 group-hover:text-claro">{q.p}</span>
              <Plus size={20} className="shrink-0 text-claro transition-transform duration-300 group-hover:scale-125 group-open:rotate-45" />
            </summary>
            <p className="faq-resp pb-5 pl-12 pr-2 text-slate-300">{q.r}</p>
          </details>
        ))}
      </div>
    </>
  );
}
