import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { diaLima, dispositivoDe, esBot, inicioDiaLima, origenDe, rutaLimpia, visitanteDe } from './visitas.util.js';

export interface RegistroVisita { ruta: string; referrer?: string; host?: string; utm?: string; ip: string; ua: string }

const top = <T extends { _count: { _all: number } }>(filas: T[], n: number) => [...filas].sort((a, b) => b._count._all - a._count._all).slice(0, n);

@Injectable()
export class VisitasService {
  private readonly logger = new Logger(VisitasService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Página vista desde una web pública. Nunca falla hacia la web: si no se cuenta, se ignora en silencio. */
  async registrar(marcaId: string, v: RegistroVisita): Promise<void> {
    const ruta = rutaLimpia(v.ruta);
    if (!marcaId || !ruta || esBot(v.ua)) return;
    const ahora = new Date();
    await this.prisma.visitaWeb
      .create({
        data: {
          marcaId,
          ruta,
          origen: origenDe(v.referrer ?? '', v.host ?? '', v.utm),
          dispositivo: dispositivoDe(v.ua),
          visitante: visitanteDe(v.ip, v.ua, diaLima(ahora)),
          createdAt: ahora,
        },
      })
      .catch((e: Error) => this.logger.warn(`No se registró la visita: ${e.message}`));
  }

  /**
   * Tráfico de la marca en los últimos `dias` (días de Lima, hoy incluido). Páginas vistas = todas las filas; visitas =
   * entradas desde fuera de la web (no `interno`); visitantes = suma de visitantes distintos de cada día.
   */
  async resumen(marcaId: string, dias: number) {
    const desde = inicioDiaLima(dias - 1);
    const antes = inicioDiaLima(2 * dias - 1);
    const hoy = inicioDiaLima(0);
    const where = { marcaId, createdAt: { gte: desde } };
    const entradas = { ...where, origen: { not: 'interno' } };

    const [porDiaRaw, paginas, origenes, dispositivos, previas, previasVisitas] = await Promise.all([
      this.prisma.$queryRaw<{ dia: string; vistas: number; visitas: number; visitantes: number }[]>`
        SELECT to_char("createdAt" - interval '5 hours', 'YYYY-MM-DD') AS dia,
               count(*)::int AS vistas,
               count(*) FILTER (WHERE "origen" <> 'interno')::int AS visitas,
               count(DISTINCT "visitante")::int AS visitantes
        FROM "VisitaWeb" WHERE "marcaId" = ${marcaId} AND "createdAt" >= ${desde}
        GROUP BY 1 ORDER BY 1`,
      this.prisma.visitaWeb.groupBy({ by: ['ruta'], where, _count: { _all: true } }),
      this.prisma.visitaWeb.groupBy({ by: ['origen'], where: entradas, _count: { _all: true } }),
      this.prisma.visitaWeb.groupBy({ by: ['dispositivo'], where: entradas, _count: { _all: true } }),
      this.prisma.visitaWeb.count({ where: { marcaId, createdAt: { gte: antes, lt: desde } } }),
      this.prisma.visitaWeb.count({ where: { marcaId, createdAt: { gte: antes, lt: desde }, origen: { not: 'interno' } } }),
    ]);

    const mapa = new Map(porDiaRaw.map((d) => [d.dia, d]));
    const porDia = Array.from({ length: dias }, (_, i) => {
      const dia = diaLima(inicioDiaLima(dias - 1 - i));
      const d = mapa.get(dia);
      return { dia, vistas: d?.vistas ?? 0, visitas: d?.visitas ?? 0, visitantes: d?.visitantes ?? 0 };
    });
    const suma = (k: 'vistas' | 'visitas' | 'visitantes') => porDia.reduce((s, d) => s + d[k], 0);
    const deHoy = porDia[porDia.length - 1]!;

    // Productos más vistos: rutas /producto/<slug> con su nombre real del catálogo.
    const rutasProducto = top(paginas.filter((p) => p.ruta.startsWith('/producto/')), 5);
    const slugs = rutasProducto.map((p) => decodeURIComponent(p.ruta.slice('/producto/'.length)).split('/')[0]!);
    const productos = slugs.length
      ? await this.prisma.producto.findMany({ where: { marcaId, slug: { in: slugs } }, select: { slug: true, nombre: true } })
      : [];
    const nombreDe = new Map(productos.map((p) => [p.slug, p.nombre]));

    return {
      dias,
      desde: diaLima(desde),
      hoy: { vistas: deHoy.vistas, visitas: deHoy.visitas, visitantes: deHoy.visitantes, desde: hoy.toISOString() },
      totales: { vistas: suma('vistas'), visitas: suma('visitas'), visitantes: suma('visitantes') },
      anterior: { vistas: previas, visitas: previasVisitas },
      porDia,
      paginas: top(paginas, 10).map((p) => ({ ruta: p.ruta, vistas: p._count._all })),
      productos: rutasProducto.map((p, i) => ({ ruta: p.ruta, nombre: nombreDe.get(slugs[i]!) ?? slugs[i]!, vistas: p._count._all })),
      origenes: top(origenes, 8).map((o) => ({ origen: o.origen, visitas: o._count._all })),
      dispositivos: top(dispositivos, 3).map((d) => ({ dispositivo: d.dispositivo, visitas: d._count._all })),
    };
  }
}
