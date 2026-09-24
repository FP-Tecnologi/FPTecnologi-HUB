import Groq from 'groq-sdk';
import {
  BUSINESS_PATHS,
  CONTACT_INFO,
  FEATURED_PRODUCTS,
  PARTNER_BRANDS,
  PARTNER_STEPS,
  SOLUTIONS,
  TIENDA_CATEGORIES,
  WHATSAPP_AREAS,
  WHY_CHOOSE_US,
} from '@/lib/content';
import { ACTION_IDS_HELP, resolveAction, type ChatAction } from '@/lib/chatActions';

/*
 * Asistente virtual del widget de chat. La API key vive solo en el servidor
 * (GROQ_API_KEY en .env.local), nunca llega al navegador. El contexto sale
 * del mismo content.ts que arma la home, así el bot responde con los datos
 * reales de la web y no inventa.
 */
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

const SITE_DATA = `
Empresa: FP Tecnologi & System, distribuidor autorizado de equipamiento TI en Lima, Perú.
Dirección: ${CONTACT_INFO.address}. Teléfono ventas: ${CONTACT_INFO.phoneVentas}. Ventas web: ${CONTACT_INFO.phoneVentasWeb}. Email: ${CONTACT_INFO.email}.
Horario: lunes a viernes de 9:00 a 18:00.

Líneas de negocio:
${BUSINESS_PATHS.map((b) => `- ${b.title}: ${b.text}`).join('\n')}

Servicios / soluciones:
${SOLUTIONS.map((s) => `- ${s.title}: ${s.description}`).join('\n')}

Categorías de la tienda: ${TIENDA_CATEGORIES.map((c) => c.title).join(', ')}.
Marcas distribuidas: ${PARTNER_BRANDS.map((b) => b.name).join(', ')}.

Productos destacados (precios referenciales en USD):
${FEATURED_PRODUCTS.map((p) => `- ${p.name} (SKU ${p.sku}): USD ${p.price}`).join('\n')}

Por qué elegirnos:
${WHY_CHOOSE_US.map((w) => `- ${w.title}: ${w.text}`).join('\n')}

Programa de Partners: ${PARTNER_STEPS.map((s) => s.text).join(' ')}
WhatsApp de asesores: +${WHATSAPP_AREAS[0].number} (también desde la burbuja de chat, opción WhatsApp).
Cotizaciones: botón "Cotizar" del menú de la web, o por WhatsApp con un asesor.
`.trim();

const SYSTEM_PROMPT = `Eres el asistente virtual de la web de FP Tecnologi & System.
Responde en español neutro de Perú (tú, no vos), breve (2-4 oraciones), claro y amable.
Texto plano en un solo párrafo: sin markdown (nada de **, #, listas ni saltos de línea), el chat no lo renderiza.
Si en la conversación todavía no hay un saludo tuyo, empieza con un saludo breve ("¡Hola! 👋") y responde directo a lo consultado.
Usa SOLO la información de abajo. Si no está, dilo y sugiere hablar con un asesor por WhatsApp o usar el botón Cotizar. No inventes precios, stock, plazos ni datos.

Responde SIEMPRE con un objeto JSON, sin nada más:
{"text": "tu respuesta", "actions": ["id", ...], "options": ["pregunta corta", ...]}
- actions: 0 a 3 IDs de la lista de abajo, solo los que ayuden a lo consultado (ej. ubicación -> "maps"; derivar a asesor -> "whatsapp"; correo -> "email"; un servicio -> "servicio:slug"). Nunca escribas URLs en "text": el enlace va en actions.
- options: 0 a 4 respuestas cortas (máx. 5 palabras) que el USUARIO puede tocar para seguir, escritas desde el usuario, no preguntas tuyas. Úsalas cuando le pides elegir algo (ej. si preguntas qué servicio: ["Videoconferencia", "Data centers", "Soluciones cloud"]; qué marca: ["Dell", "HP", "Lenovo"]). Si no hay nada que elegir, [].

IDs de acciones válidos:
${ACTION_IDS_HELP}

${SITE_DATA}`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function parseMessages(body: unknown): ChatMessage[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const msgs = raw.slice(-MAX_MESSAGES);
  for (const m of msgs) {
    if (
      !m ||
      (m.role !== 'user' && m.role !== 'assistant') ||
      typeof m.content !== 'string' ||
      m.content.length === 0 ||
      m.content.length > MAX_CHARS
    ) {
      return null;
    }
  }
  return msgs.map((m) => ({ role: m.role, content: m.content }));
}

// Valida el JSON de la IA: IDs de acción desconocidos se descartan (la IA
// nunca decide URLs), opciones recortadas a 3 textos cortos.
function parseReply(raw: string | null | undefined): { reply: string; actions: ChatAction[]; options: string[] } | null {
  let data: { text?: unknown; actions?: unknown; options?: unknown };
  try {
    data = JSON.parse(raw ?? '');
  } catch {
    return raw?.trim() ? { reply: raw.trim(), actions: [], options: [] } : null;
  }
  if (typeof data.text !== 'string' || !data.text.trim()) return null;
  const actions = (Array.isArray(data.actions) ? data.actions : [])
    .filter((id): id is string => typeof id === 'string')
    .map(resolveAction)
    .filter((a): a is ChatAction => a !== null)
    .slice(0, 3);
  const options = (Array.isArray(data.options) ? data.options : [])
    .filter((o): o is string => typeof o === 'string' && o.trim().length > 0 && o.length <= 60)
    .slice(0, 4);
  return { reply: data.text.trim(), actions, options };
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: 'GROQ_API_KEY no configurada' }, { status: 503 });
  }

  const messages = parseMessages(await req.json().catch(() => null));
  if (!messages) return Response.json({ error: 'Mensajes inválidos' }, { status: 400 });

  // ponytail: sin rate limit por IP -- agregar (middleware o Upstash) antes de producción si hay abuso.
  try {
    const groq = new Groq();
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.3,
      max_completion_tokens: 600,
      reasoning_effort: MODEL.startsWith('openai/gpt-oss') ? 'low' : undefined,
      response_format: { type: 'json_object' },
    });
    const parsed = parseReply(completion.choices[0]?.message?.content);
    if (!parsed) return Response.json({ error: 'Respuesta vacía' }, { status: 502 });
    return Response.json(parsed);
  } catch (err) {
    console.error('[api/chat] Groq error:', err);
    return Response.json({ error: 'Error del asistente' }, { status: 502 });
  }
}
