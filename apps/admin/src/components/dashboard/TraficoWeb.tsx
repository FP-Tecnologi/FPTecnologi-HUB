'use client';
/*
 * FPTecnologi-HUB — tarjetas «Tráfico web» del dashboard: visitas de las webs públicas con el contador propio del HUB
 * (GET /visitas/resumen; cada web avisa en cada página vista, sin cookies). Con una marca muestra sus páginas y
 * productos más vistos; en Administración (varias marcas) suma todas y compara las webs. Si el rol no tiene acceso
 * (403) las tarjetas no se muestran.
 */
import { useEffect, useState } from 'react';
import { ApexChart } from '../charts/ApexChart';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Kpi, Vacio, num, viz } from './piezas';

interface ResumenVisitas {
  dias: number;
  hoy: { vistas: number; visitas: number; visitantes: number };
  totales: { vistas: number; visitas: number; visitantes: number };
  anterior: { vistas: number; visitas: number };
  porDia: { dia: string; vistas: number; visitas: number; visitantes: number }[];
  paginas: { ruta: string; vistas: number }[];
  productos: { ruta: string; nombre: string; vistas: number }[];
  origenes: { origen: string; visitas: number }[];
  dispositivos: { dispositivo: string; visitas: number }[];
}

const RANGOS = [7, 30, 90] as const;
const ORIGEN: Record<string, string> = {
  directo: 'Directo (dirección o favorito)', google: 'Google', bing: 'Bing', facebook: 'Facebook', instagram: 'Instagram',
  whatsapp: 'WhatsApp', linkedin: 'LinkedIn', tiktok: 'TikTok', youtube: 'YouTube', x: 'X (Twitter)', chatgpt: 'ChatGPT',
};
const DISPOSITIVO: Record<string, string> = { movil: 'Celular', tablet: 'Tablet', escritorio: 'Computadora' };
const PAGINA: Record<string, string> = { '/': 'Inicio' };

const pct = (act: number, prev: number) => (prev ? ((act - prev) / prev) * 100 : null);
const diaCorto = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

/** Suma por clave (origen, dispositivo) de varias marcas. */
function sumar<K extends string>(listas: { [k in K]: string }[][], clave: K, valor: 'visitas' | 'vistas'): { nombre: string; n: number }[] {
  const m = new Map<string, number>();
  for (const l of listas) for (const f of l) m.set(f[clave], (m.get(f[clave]) ?? 0) + Number((f as Record<string, unknown>)[valor] ?? 0));
  return [...m.entries()].map(([nombre, n]) => ({ nombre, n })).sort((a, b) => b.n - a.n);
}

function Ranking({ filas, unidad, vacio }: { filas: { nombre: string; n: number; titulo?: string }[]; unidad: string; vacio: string }) {
  if (!filas.length) return <Vacio texto={vacio} />;
  const max = filas[0]!.n || 1;
  return (
    <ol className="ax-ranklist">
      {filas.map((f, i) => (
        <li key={f.nombre} className="ax-ranklist__item" title={f.titulo}>
          <span className="ax-ranklist__rank">{i + 1}</span>
          <span className="ax-ranklist__label">{f.nombre}</span>
          <span className="ax-ranklist__value">{f.n.toLocaleString('es-PE')} {unidad}</span>
          <span className="ax-ranklist__bar"><i style={{ width: `${(f.n / max) * 100}%` }} /></span>
        </li>
      ))}
    </ol>
  );
}

export function TraficoWeb({ marcaIds }: { marcaIds: string[] }) {
  const { marcas } = useAuth();
  const [dias, setDias] = useState<(typeof RANGOS)[number]>(30);
  const [datos, setDatos] = useState<{ marcaId: string; r: ResumenVisitas }[] | null>(null);
  const clave = marcaIds.join(',');

  useEffect(() => {
    let vivo = true;
    Promise.all(marcaIds.map((id) => api.get<ResumenVisitas>(`/visitas/resumen?dias=${dias}`, { marcaId: id }).then((r) => ({ marcaId: id, r })).catch(() => null)))
      .then((res) => { if (vivo) setDatos(res.filter((x): x is { marcaId: string; r: ResumenVisitas } => !!x)); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, dias]);

  if (datos !== null && datos.length === 0) return null; // sin acceso con este rol
  const global = marcaIds.length > 1;
  const rs = (datos ?? []).map((d) => d.r);
  const total = (f: (r: ResumenVisitas) => number) => (datos === null ? null : rs.reduce((s, r) => s + f(r), 0));
  const porDia = (rs[0]?.porDia ?? []).map((d, i) => ({
    dia: d.dia,
    visitas: rs.reduce((s, r) => s + (r.porDia[i]?.visitas ?? 0), 0),
    vistas: rs.reduce((s, r) => s + (r.porDia[i]?.vistas ?? 0), 0),
  }));
  const visitas = total((r) => r.totales.visitas);
  const vistas = total((r) => r.totales.vistas);
  const origenes = sumar(rs.map((r) => r.origenes), 'origen', 'visitas').slice(0, 7).map((o) => ({ nombre: ORIGEN[o.nombre] ?? o.nombre, n: o.n }));
  const dispositivos = sumar(rs.map((r) => r.dispositivos), 'dispositivo', 'visitas');
  const nombreMarca = (id: string) => marcas.find((m) => m.marcaId === id)?.marca.nombre ?? 'Marca';
  const sinDatos = datos !== null && !vistas;

  const selector = (
    <div className="ax-segment" role="group" aria-label="Periodo">
      {RANGOS.map((n) => (
        <button key={n} type="button" className="ax-segment__option" aria-pressed={dias === n} onClick={() => setDias(n)}>{n} días</button>
      ))}
    </div>
  );

  return (
    <>
      <Card titulo="Tráfico web" sub={global ? `Visitas de todas las webs · últimos ${dias} días` : `Visitas de la web · últimos ${dias} días`} cols={12} accion={selector}>
        <div className="ax-statgroup" aria-busy={datos === null} style={{ marginBottom: 'var(--ax-space-4)' }}>
          <Kpi icon="eye" tono="c2" label="Visitas hoy" valor={num(total((r) => r.hoy.visitas))} />
          <Kpi icon="user" tono="c3" label="Visitantes hoy" valor={num(total((r) => r.hoy.visitantes))} />
          <Kpi icon="world" tono="c4" label={`Visitas (${dias} días)`} valor={num(visitas)} pct={visitas === null ? undefined : pct(visitas, total((r) => r.anterior.visitas) ?? 0)} />
          <Kpi icon="users-group" tono="c5" label={`Visitantes (${dias} días)`} valor={num(total((r) => r.totales.visitantes))} />
          <Kpi icon="files" tono="c6" label="Páginas vistas" valor={num(vistas)} pct={vistas === null ? undefined : pct(vistas, total((r) => r.anterior.vistas) ?? 0)} />
        </div>
        {sinDatos ? (
          <Vacio texto="Aún no hay visitas registradas. El contador empieza a sumar desde que se publica la web con esta versión." />
        ) : porDia.length ? (
          <ApexChart
            type="area"
            height={280}
            legend="bottom"
            accent
            ariaLabel="Visitas y páginas vistas por día"
            series={[{ name: 'Visitas', data: porDia.map((d) => d.visitas) }, { name: 'Páginas vistas', data: porDia.map((d) => d.vistas) }]}
            apex={{ xaxis: { categories: porDia.map((d) => diaCorto(d.dia)), tickAmount: Math.min(porDia.length, 10) } }}
          />
        ) : null}
        <p style={{ margin: 'var(--ax-space-2) 0 0', fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>
          Visita = alguien que entra a la web (desde Google, redes, un enlace o escribiendo la dirección). Páginas vistas = todas las páginas que recorre. No se cuentan buscadores ni robots, ni la vista previa del editor.
        </p>
      </Card>

      {global ? (
        <Card titulo="Por web" sub="Visitas de cada marca" cols={4}>
          <Ranking filas={(datos ?? []).map((d) => ({ nombre: nombreMarca(d.marcaId), n: d.r.totales.visitas })).sort((a, b) => b.n - a.n)} unidad="visitas" vacio="Sin visitas todavía." />
        </Card>
      ) : (
        <Card titulo="Páginas más vistas" cols={4}>
          <Ranking filas={(rs[0]?.paginas ?? []).slice(0, 7).map((p) => ({ nombre: PAGINA[p.ruta] ?? p.ruta, n: p.vistas, titulo: p.ruta }))} unidad="vistas" vacio="Sin páginas vistas todavía." />
        </Card>
      )}
      <Card titulo="¿De dónde llegan?" sub="Origen de las visitas" cols={4}>
        <Ranking filas={origenes} unidad="visitas" vacio="Sin visitas todavía." />
      </Card>
      <Card titulo="Dispositivos" sub="Desde dónde navegan" cols={4}>
        {dispositivos.some((d) => d.n > 0) ? (
          <ApexChart
            type="donut"
            height={230}
            legend="bottom"
            ariaLabel="Visitas por dispositivo"
            series={dispositivos.map((d) => d.n)}
            apex={{ labels: dispositivos.map((d) => DISPOSITIVO[d.nombre] ?? d.nombre), colors: viz(dispositivos.length), stroke: { width: 0 }, plotOptions: { pie: { donut: { size: '70%' } } } }}
          />
        ) : <Vacio texto="Sin visitas todavía." />}
      </Card>
      {!global && (rs[0]?.productos.length ?? 0) > 0 && (
        <Card titulo="Productos más vistos" sub="Fichas de la tienda" cols={4} enlace={{ href: '/ecommerce/productos', label: 'Catálogo' }}>
          <Ranking filas={rs[0]!.productos.map((p) => ({ nombre: p.nombre, n: p.vistas, titulo: p.ruta }))} unidad="vistas" vacio="" />
        </Card>
      )}
    </>
  );
}

export default TraficoWeb;
