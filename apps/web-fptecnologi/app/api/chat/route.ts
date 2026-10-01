import Groq from 'groq-sdk';
import { ACTION_IDS_HELP, resolveAction, type ChatAction, type ProductoEnlace } from '@/lib/chatActions';
import { getConocimiento } from '@/lib/chatConocimiento';

/*
 * Asistente virtual del widget de chat. La API key vive solo en el servidor
 * (GROQ_API_KEY en .env.local), nunca llega al navegador. El conocimiento
 * (páginas de la web + productos, servicios y blog de la base de datos) lo
 * arma lib/chatConocimiento.ts, así el bot responde con los datos reales y
 * no inventa.
 */
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

const buildSystemPrompt = (siteData: string) => `Eres el asistente virtual de la web de FP Tecnologi & System.
Responde en español neutro de Perú (tú, no vos), breve (2-4 oraciones), claro y amable.
Texto plano en un solo párrafo: sin markdown (nada de **, #, listas ni saltos de línea), el chat no lo renderiza.
Si en la conversación todavía no hay un saludo tuyo, empieza con un saludo breve ("¡Hola! 👋") y responde directo a lo consultado.
Usa SOLO la información de abajo (es el contenido real de la web y de su base de datos). Si no está, dilo y sugiere hablar con un asesor por WhatsApp o usar el botón Cotizar. No inventes precios, stock, plazos, tarifas de envío, proyectos ni datos.
Sobre productos: di nombre, marca y precio en USD sin IGV tal como figura abajo, aclara que el stock y el precio final los confirma un asesor, y adjunta la ficha con "producto:SKU" (SKU exacto de la lista). Si piden algo que no está en la lista, ofrece cotizarlo.
Sobre servicios: explica en qué consisten y qué incluyen según la lista, y adjunta "servicio:slug"; todos se cotizan por proyecto.

Responde SIEMPRE con un objeto JSON, sin nada más:
{"text": "tu respuesta", "actions": ["id", ...], "options": ["pregunta corta", ...]}
- actions: 0 a 3 IDs de la lista de abajo, solo los que ayuden a lo consultado (ej. ubicación -> "maps"; derivar a asesor -> "whatsapp"; correo -> "email"; un servicio -> "servicio:slug"). Nunca escribas URLs en "text": el enlace va en actions.
- options: 0 a 4 respuestas cortas (máx. 5 palabras) que el USUARIO puede tocar para seguir, escritas desde el usuario, no preguntas tuyas. Úsalas cuando le pides elegir algo (ej. si preguntas qué servicio: ["Videoconferencia", "Data centers", "Soluciones cloud"]; qué marca: ["Dell", "HP", "Lenovo"]). Si no hay nada que elegir, [].

IDs de acciones válidos:
${ACTION_IDS_HELP}

${siteData}`;

// Tope por IP en memoria (se reinicia con cada despliegue y no se comparte
// entre instancias; si hay más de una, mover a Redis). Cada mensaje cuesta una
// llamada a Groq, así que evita que un script la agote.
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 30;
const hits = new Map<string, number[]>();

function limitado(ip: string): boolean {
  const now = Date.now();
  const recientes = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recientes.push(now);
  hits.set(ip, recientes);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v[v.length - 1]! >= RATE_WINDOW_MS) hits.delete(k);
  }
  return recientes.length > RATE_MAX;
}

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
function parseReply(raw: string | null | undefined, productos: readonly ProductoEnlace[]): { reply: string; actions: ChatAction[]; options: string[] } | null {
  let data: { text?: unknown; actions?: unknown; options?: unknown };
  try {
    data = JSON.parse(raw ?? '');
  } catch {
    return raw?.trim() ? { reply: raw.trim(), actions: [], options: [] } : null;
  }
  if (typeof data.text !== 'string' || !data.text.trim()) return null;
  const actions = (Array.isArray(data.actions) ? data.actions : [])
    .filter((id): id is string => typeof id === 'string')
    .map((id) => resolveAction(id, productos))
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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocida';
  if (limitado(ip)) {
    return Response.json({ error: 'Demasiados mensajes. Espera unos minutos o escríbenos por WhatsApp.' }, { status: 429 });
  }

  const messages = parseMessages(await req.json().catch(() => null));
  if (!messages) return Response.json({ error: 'Mensajes inválidos' }, { status: 400 });

  try {
    const conocimiento = await getConocimiento();
    const groq = new Groq();
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt(conocimiento.text) }, ...messages],
      temperature: 0.3,
      max_completion_tokens: 600,
      reasoning_effort: MODEL.startsWith('openai/gpt-oss') ? 'low' : undefined,
      response_format: { type: 'json_object' },
    });
    const parsed = parseReply(completion.choices[0]?.message?.content, conocimiento.products);
    if (!parsed) return Response.json({ error: 'Respuesta vacía' }, { status: 502 });
    return Response.json(parsed);
  } catch (err) {
    console.error('[api/chat] Groq error:', err);
    return Response.json({ error: 'Error del asistente' }, { status: 502 });
  }
}
