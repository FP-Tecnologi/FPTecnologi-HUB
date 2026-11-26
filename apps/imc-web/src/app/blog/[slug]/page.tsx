import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ArticuloCard from "@/components/ArticuloCard";
import { Cta, Icono, Portada, Seccion } from "@/components/ui";
import { fechaLarga, getArticulo, getArticulos, PORTADA_DEFECTO } from "@/lib/blog";
import { markdownToHtml, minutosLectura } from "@/lib/markdown";
import { meta, migas, SITIO } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticulo((await params).slug);
  return a ? meta(a.titulo, a.resumen, `/blog/${a.slug}/`) : { title: "Blog" };
}

export default async function ArticuloPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticulo((await params).slug);
  if (!a) notFound();
  const todos = await getArticulos();
  const puntaje = (x: (typeof todos)[number]) => (x.categoria === a.categoria ? 2 : 0) + x.etiquetas.filter((t) => a.etiquetas.includes(t)).length;
  const relacionados = todos.filter((x) => x.slug !== a.slug).sort((x, y) => puntaje(y) - puntaje(x)).slice(0, 3);
  const portada = a.portadaUrl || PORTADA_DEFECTO;
  const articuloLd = {
    "@context": "https://schema.org", "@type": "Article", headline: a.titulo, description: a.resumen,
    image: portada.startsWith("http") ? portada : `${SITIO}${portada}`,
    datePublished: a.publicadoEn ?? undefined, keywords: a.etiquetas.join(", "),
    author: { "@type": "Person", name: a.autorNombre }, publisher: { "@id": `${SITIO}/#organizacion` },
    mainEntityOfPage: `${SITIO}/blog/${a.slug}/`, inLanguage: "es-PE",
  };
  return (
    <>
      <JsonLd datos={[articuloLd, migas(a.titulo, `/blog/${a.slug}/`)]} />
      <Portada etiqueta={a.categoria} a={a.titulo} b="" texto={a.resumen} />
      <Seccion className="bg-white">
        <article className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-tinta/10 pb-6 text-sm text-grafito/85">
            <Link href={`/blog/?categoria=${encodeURIComponent(a.categoria)}`} className="bg-azul-claro px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-azul-2 hover:bg-azul-2 hover:text-white">{a.categoria}</Link>
            <span className="flex items-center gap-1.5"><Icono n="equipo" className="h-4 w-4" />{a.autorNombre}</span>
            <span className="flex items-center gap-1.5"><Icono n="reloj" className="h-4 w-4" />{fechaLarga(a.publicadoEn)}</span>
            <span className="flex items-center gap-1.5">{minutosLectura(a.contenido)} min de lectura</span>
          </div>
          {a.portadaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.portadaUrl} alt="" className="mb-8 aspect-[16/9] w-full object-cover" />
          )}
          {/* El HTML sale de markdownToHtml, que escapa todo lo que escribe el autor. */}
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(a.contenido) }} />
          {a.etiquetas.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2 border-t border-tinta/10 pt-6">
              {a.etiquetas.map((t) => <li key={t} className="bg-azul-claro px-2.5 py-1 text-xs font-semibold text-grafito">#{t}</li>)}
            </ul>
          )}
        </article>
      </Seccion>
      {relacionados.length > 0 && (
        <Seccion className="bg-azul-claro">
          <h2 className="titulo text-3xl">Sigue <b>leyendo</b></h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{relacionados.map((r) => <li key={r.id} className="flex"><ArticuloCard a={r} /></li>)}</ul>
        </Seccion>
      )}
      <Cta />
    </>
  );
}
