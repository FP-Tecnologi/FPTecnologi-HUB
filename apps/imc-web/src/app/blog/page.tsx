import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import ArticuloCard from "@/components/ArticuloCard";
import { Cta, Portada, Seccion } from "@/components/ui";
import { getArticulos } from "@/lib/blog";
import { meta, migas } from "@/lib/seo";

export const metadata = meta("Blog", "Artículos y guías de Company IMC sobre tecnología, equipos, redes y soluciones para empresas.", "/blog/");

// Los artículos se leen de la API en cada visita (con caché corta): lo publicado en el dashboard aparece sin recompilar.
export const dynamic = "force-dynamic";

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const todos = await getArticulos();
  const categorias = [...new Set(todos.map((a) => a.categoria))];
  const activa = categoria && categorias.includes(categoria) ? categoria : undefined;
  const articulos = activa ? todos.filter((a) => a.categoria === activa) : todos;
  const chip = (on: boolean) => `inline-flex min-h-10 items-center border px-4 text-sm font-bold transition-colors ${on ? "border-azul-2 bg-azul-2 text-white" : "border-tinta/20 text-grafito hover:border-naranja hover:text-azul-2"}`;
  return (
    <>
      <JsonLd datos={migas("Blog", "/blog/")} />
      <Portada etiqueta="Blog" a="Ideas y guías de" b="tecnología" texto="Novedades, consejos y buenas prácticas para que tu empresa saque más provecho de la tecnología." />
      <Seccion className="bg-white">
        {categorias.length > 1 && (
          <nav aria-label="Categorías" className="mb-8 flex flex-wrap gap-2">
            <Link href="/blog/" className={chip(!activa)} aria-current={!activa ? "page" : undefined}>Todas</Link>
            {categorias.map((c) => <Link key={c} href={`/blog/?categoria=${encodeURIComponent(c)}`} className={chip(c === activa)} aria-current={c === activa ? "page" : undefined}>{c}</Link>)}
          </nav>
        )}
        {articulos.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articulos.map((a, i) => <li key={a.id} className="flex"><Reveal delay={(i % 3) * 90} className="flex w-full"><ArticuloCard a={a} /></Reveal></li>)}
          </ul>
        ) : (
          <p className="bg-azul-claro p-8 text-center text-grafito/85">Pronto publicaremos nuestros primeros artículos.</p>
        )}
      </Seccion>
      <Cta />
    </>
  );
}
