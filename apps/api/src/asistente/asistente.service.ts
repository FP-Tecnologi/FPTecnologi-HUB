import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReportesService, diaLima } from '../reportes/reportes.service.js';
import { ConocimientoService } from '../conocimiento/conocimiento.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { HERRAMIENTAS, MODULOS, puede, type Contexto, type Metrica, type Tabla } from './asistente.herramientas.js';
import { completar, type MensajeModelo } from './asistente.groq.js';

/*
 * Asistente virtual del dashboard: responde preguntas sobre la marca activa (métricas, resúmenes, búsquedas) usando
 * herramientas que consultan la base de datos con los permisos del rol, y sugiere a qué módulo ir. Lo que el usuario
 * ve como datos (tablas y métricas) sale de las herramientas, no del texto del modelo.
 */

export interface MensajeChat { role: 'user' | 'assistant'; content: string }
export interface RespuestaAsistente { texto: string; modulos: string[]; tablas: Tabla[]; metricas: Metrica[]; sugerencias: string[] }

const MAX_VUELTAS = 4;
const MAX_TABLAS = 3;
const MAX_METRICAS = 14;
const VENTANA_MS = 10 * 60_000;
const MAX_CONSULTAS = 40;
const usos = new Map<string, number[]>();

const ROLES_TEXTO: Record<string, string> = {
  admin: 'administrador (ve todo)',
  ventas: 'ventas (tienda: productos, pedidos, presupuestos, cotizaciones, reportes)',
  comercial: 'comercial (leads, cotizaciones, presupuestos, tickets, contactos, libro de reclamaciones)',
  marketing: 'marketing (contenido de la web, blog, campañas)',
  asesores: 'asesores (chat de la web y conocimiento del asistente)',
};

function prompt(marca: string, rol: string, hoy: string, modulos: { id: string; titulo: string }[]) {
  return `Eres el asistente virtual interno del dashboard de ${marca} (grupo FPTecnologi-HUB). Ayudas al equipo a consultar datos, resumir y encontrar el módulo correcto.
Usuario con rol: ${ROLES_TEXTO[rol] ?? rol}. Solo trabajas con los datos de la marca ${marca}; si piden otra marca, di que cambien la marca activa en el selector.
Hoy es ${hoy} (hora de Lima). Convierte "hoy", "esta semana", "este mes", "el mes pasado" a fechas YYYY-MM-DD para las herramientas.
Para cualquier dato usa SIEMPRE las herramientas; nunca inventes cifras, nombres ni estados. Si una herramienta no está disponible para este rol, di que su rol no tiene acceso a esos datos.
Las tablas y métricas que devuelvan las herramientas se muestran tal cual al usuario debajo de tu texto: no las copies completas; en "texto" resume lo importante (totales, lo que requiere atención, comparaciones) en 1 a 4 oraciones, en español, tú.
Montos: los de la tienda están en USD salvo que la herramienta diga otra moneda.

Cuando termines, responde SOLO con un objeto JSON:
{"texto": "respuesta breve", "modulos": ["id", ...], "sugerencias": ["siguiente pregunta corta", ...]}
- modulos: 0 a 3 IDs de esta lista, los módulos donde el usuario puede ver o gestionar lo consultado:
${modulos.map((m) => `  ${m.id} = ${m.titulo}`).join('\n')}
- sugerencias: 0 a 3 preguntas de seguimiento útiles (máx. 8 palabras), escritas como las haría el usuario.`;
}

/** Saca el JSON final aunque el modelo lo envuelva en texto o en ```json. */
export function parsearFinal(raw: string | null): { texto: string; modulos: string[]; sugerencias: string[] } {
  const limpio = (raw ?? '').trim();
  const bloque = limpio.match(/\{[\s\S]*\}/)?.[0];
  if (bloque) {
    try {
      const d = JSON.parse(bloque) as { texto?: unknown; modulos?: unknown; sugerencias?: unknown };
      if (typeof d.texto === 'string' && d.texto.trim()) {
        const lista = (v: unknown, max: number, largo: number) =>
          (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === 'string' && x.trim().length > 0 && x.length <= largo).slice(0, max);
        return { texto: d.texto.trim(), modulos: lista(d.modulos, 3, 60), sugerencias: lista(d.sugerencias, 3, 80) };
      }
    } catch {
      /* texto libre: se usa tal cual */
    }
  }
  return { texto: limpio || 'No encontré una respuesta. Intenta formular la pregunta de otra forma.', modulos: [], sugerencias: [] };
}

@Injectable()
export class AsistenteService {
  private readonly logger = new Logger(AsistenteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportes: ReportesService,
    private readonly conocimiento: ConocimientoService,
  ) {}

  async consultar(marcaId: string, user: AuthenticatedUser, mensajes: MensajeChat[]): Promise<RespuestaAsistente> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new ServiceUnavailableException('El asistente no está configurado (falta GROQ_API_KEY en la API).');
    const rol = user.marcas.find((m) => m.marcaId === marcaId)?.rol;
    if (!rol) throw new ForbiddenException('No tienes acceso a esta marca');
    this.limitar(user.sub);

    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId }, select: { nombre: true } });
    const herramientas = HERRAMIENTAS.filter((h) => puede(h.roles, rol));
    const modulos = MODULOS.filter((m) => puede(m.roles, rol));
    const ctx: Contexto = { prisma: this.prisma, reportes: this.reportes, conocimiento: this.conocimiento, marcaId, rol };
    const model = process.env.ASISTENTE_MODEL || 'openai/gpt-oss-120b';

    const historial: MensajeModelo[] = [
      { role: 'system', content: prompt(marca?.nombre ?? 'la marca', rol, diaLima(new Date()), modulos) },
      ...mensajes.map((m) => ({ role: m.role, content: m.content }) as MensajeModelo),
    ];
    const tablas: Tabla[] = [];
    const metricas: Metrica[] = [];

    let final: string | null = null;
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
      const ultima = vuelta === MAX_VUELTAS - 1;
      const r = await completar(
        {
          model,
          messages: historial,
          tools: herramientas.map((h) => ({ type: 'function', function: { name: h.nombre, description: h.descripcion, parameters: h.parametros } })),
          tool_choice: ultima ? 'none' : 'auto',
          temperature: 0.2,
          max_completion_tokens: 1200,
          ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' as const } : {}),
        },
        apiKey,
      );
      if (!r.tool_calls) {
        final = r.content;
        break;
      }
      historial.push({ role: 'assistant', content: r.content ?? null, tool_calls: r.tool_calls });
      for (const call of r.tool_calls) {
        historial.push({ role: 'tool', tool_call_id: call.id, content: await this.ejecutar(ctx, herramientas, call.function.name, call.function.arguments, tablas, metricas) });
      }
    }

    const res = parsearFinal(final);
    const permitidos = new Set(modulos.map((m) => m.id));
    // Además de los que elige el modelo, el de cada tabla mostrada (siempre que el rol lo vea).
    const elegidos = [...res.modulos, ...tablas.map((t) => t.modulo)].filter((id) => permitidos.has(id));
    return { texto: res.texto, modulos: [...new Set(elegidos)].slice(0, 4), tablas, metricas, sugerencias: res.sugerencias };
  }

  /** Ejecuta una herramienta pedida por el modelo; nunca tira: los errores vuelven al modelo como texto. */
  private async ejecutar(ctx: Contexto, permitidas: typeof HERRAMIENTAS, nombre: string, argumentos: string, tablas: Tabla[], metricas: Metrica[]): Promise<string> {
    const h = permitidas.find((x) => x.nombre === nombre);
    if (!h) return JSON.stringify({ error: 'Herramienta no disponible para el rol de este usuario.' });
    let args: Record<string, unknown> = {};
    try {
      const parsed: unknown = argumentos ? JSON.parse(argumentos) : {};
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) args = parsed as Record<string, unknown>;
    } catch {
      return JSON.stringify({ error: 'Argumentos no válidos (JSON).' });
    }
    try {
      const r = await h.ejecutar(ctx, args);
      if (r.tabla && r.tabla.filas.length > 0 && tablas.length < MAX_TABLAS) tablas.push(r.tabla);
      for (const m of r.metricas ?? []) if (metricas.length < MAX_METRICAS && !metricas.some((x) => x.etiqueta === m.etiqueta)) metricas.push(m);
      return JSON.stringify(r.paraIA).slice(0, 12_000);
    } catch (e) {
      if (e instanceof HttpException && e.getStatus() < 500) return JSON.stringify({ error: e.message });
      this.logger.error(`Falló la herramienta ${nombre}`, e as Error);
      return JSON.stringify({ error: 'No se pudo consultar ese dato.' });
    }
  }

  private limitar(clave: string) {
    const ahora = Date.now();
    const recientes = (usos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_CONSULTAS) throw new HttpException('Hiciste muchas consultas seguidas. Espera unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
    recientes.push(ahora);
    usos.set(clave, recientes);
    if (usos.size > 2000) for (const [k, v] of usos) if (!v.some((t) => ahora - t < VENTANA_MS)) usos.delete(k);
  }
}
