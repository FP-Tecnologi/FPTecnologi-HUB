'use client';

import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Bot,
  ChevronLeft,
  Handshake,
  History,
  ShoppingBag,
  Store,
  Trash2,
  Wrench,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  RotateCcw,
  SendHorizontal,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { VARIANTS, DEFAULT_VARIANT, HeaderBg, type Variant } from './chatVariants';
import { WHATSAPP_AREAS } from '@/lib/content';
import { useSitio } from '@/context/SitioContext';
import { WhatsAppIcon } from './icons';
import { resolveAction, type ChatAction, type ChatActionKind } from '@/lib/chatActions';
import { useChatWidget } from '@/context/ChatWidgetContext';

/*
 * Íconos: todos de lucide-react (un solo estilo de trazo en todo el widget),
 * nada de SVG dibujado a mano.
 *
 * instant: se muestra completo, sin efecto de escritura (saludo inicial).
 * actions: botones de enlace (WhatsApp, Maps, mailto, páginas) resueltos
 * desde IDs fijos en lib/chatActions -- nunca URLs escritas por la IA.
 * options: respuestas rápidas que el usuario toca para seguir la charla.
 */
// from 'asesor': respuesta de un asesor que tomó la conversación desde el
// dashboard (sid = id del mensaje en la API, para no duplicarlo al consultar).
type ChatMsg = {
  // 'system': etiqueta centrada ("Jaime se unió al chat"), no es un mensaje.
  from: 'bot' | 'user' | 'asesor' | 'system';
  text: string;
  instant?: boolean;
  actions?: ChatAction[];
  options?: string[];
  at?: number;
  sid?: string;
  name?: string;
};
// Conversación guardada en la API central (ver app/api/hub/chat): el token
// es el secreto con el que este navegador lee/escribe su conversación.
type Remote = { id: string; token: string };
type Agent = { estado: 'BOT' | 'ASESOR' | 'CERRADA'; asesor: { nombre: string | null } | null };
type Area = { label: string; contact: string; phone: string; number: string; photo: string | null };
// Conversación archivada (historial): se guarda al tocar "Nueva".
type ChatSession = { id: number; title: string; at: number; messages: ChatMsg[]; remote?: Remote | null };
type BotReply = { text: string; actions: ChatAction[]; options: string[] };

const GREETING: ChatMsg = {
  from: 'bot',
  text: 'Hola 👋 Soy el asistente virtual de FPTecnologi. Pregúntame por horarios, servicios, productos o el programa de partners.',
  instant: true,
  options: ['Ver servicios', 'Tienda', 'Ubicación', 'Hablar con un asesor'],
};

/*
 * Historial por cliente: se guarda en localStorage de este navegador, así
 * la conversación sigue ahí al recargar, cambiar de página o volver otro
 * día. Máx. HISTORY_MAX mensajes. Todo en try/catch: en modo privado o con
 * storage bloqueado, el chat funciona igual, solo sin memoria.
 */
const HISTORY_KEY = 'fp-chat-history-v1';
const HISTORY_MAX = 50;
const SAFE_HREF = /^(https:\/\/|\/|mailto:|tel:)/;

function loadHistory(): ChatMsg[] | null {
  try {
    const raw = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? 'null');
    if (!Array.isArray(raw) || raw.length === 0) return null;
    return raw
      .filter((m) => m && (m.from === 'bot' || m.from === 'user' || m.from === 'asesor' || m.from === 'system') && typeof m.text === 'string')
      .map((m) => ({
        from: m.from,
        text: m.text,
        instant: true, // ya se leyó: no se vuelve a escribir letra por letra
        actions: Array.isArray(m.actions)
          ? m.actions.filter((a: ChatAction) => typeof a?.href === 'string' && SAFE_HREF.test(a.href) && a.kind in ACTION_ICON)
          : undefined,
        options: Array.isArray(m.options) ? m.options.filter((o: unknown) => typeof o === 'string') : undefined,
        at: typeof m.at === 'number' ? m.at : undefined,
        sid: typeof m.sid === 'string' ? m.sid : undefined,
        name: typeof m.name === 'string' ? m.name : undefined,
      }));
  } catch {
    return null;
  }
}

const REMOTE_KEY = 'fp-chat-remote-v1';

function loadRemote(): Remote | null {
  try {
    const r = JSON.parse(window.localStorage.getItem(REMOTE_KEY) ?? 'null');
    return r && typeof r.id === 'string' && typeof r.token === 'string' ? r : null;
  } catch {
    return null;
  }
}

function saveRemote(r: Remote | null) {
  try {
    if (r) window.localStorage.setItem(REMOTE_KEY, JSON.stringify(r));
    else window.localStorage.removeItem(REMOTE_KEY);
  } catch {
    // storage bloqueado
  }
}

/* Llamada al proxy /api/hub/chat. Nunca tira: si la API no está (o falta
   HUB_MARCA_ID) devuelve null y el chat sigue funcionando solo con la IA. */
async function hub<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`/api/hub/chat/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

const POLL_MS = 4000;

/* Los eventos se guardan pensando en el equipo ("Jaime devolvió la
   conversación al asistente IA"); al cliente se le muestra en su idioma. */
function textoCliente(evento: string): string {
  if (evento.includes('devolvió')) return 'Ahora te atiende nuestro asistente IA';
  if (evento.includes('finalizó')) return 'La conversación fue finalizada';
  if (evento.includes('reabrió')) return 'La conversación se reabrió';
  return evento; // "X se unió al chat"
}

const FALLBACK_AREAS: Area[] = WHATSAPP_AREAS.map((a) => ({ ...a, photo: a.photo }));

/* Sesiones anteriores (máx. SESSIONS_MAX), mismo criterio que el historial:
   solo en este navegador y todo en try/catch. */
const SESSIONS_KEY = 'fp-chat-sessions-v1';
const SESSIONS_MAX = 10;

function loadSessions(): ChatSession[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SESSIONS_KEY) ?? '[]');
    return Array.isArray(raw)
      ? raw.filter((x) => x && typeof x.id === 'number' && typeof x.title === 'string' && Array.isArray(x.messages))
      : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, SESSIONS_MAX)));
  } catch {
    // storage lleno o bloqueado
  }
}

const timeFmt = (at: number) => new Date(at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
const dateFmt = (at: number) => new Date(at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

const AREA_ICON: Record<string, LucideIcon> = { Ventas: ShoppingBag, Servicios: Wrench, Tienda: Store, Partners: Handshake };

function saveHistory(messages: ChatMsg[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-HISTORY_MAX)));
  } catch {
    // storage lleno o bloqueado: se sigue sin guardar
  }
}

// Respaldo sin IA (si /api/chat falla o no hay GROQ_API_KEY).
const INTENTS: { keywords: string[]; text: string; actions: string[]; options?: string[] }[] = [
  {
    keywords: ['horario', 'atienden', 'atención', 'abren', 'cierran'],
    text: 'Atendemos de lunes a viernes de 9:00 a 18:00. Fuera de ese horario puedes dejarnos tu consulta y te respondemos apenas volvamos.',
    actions: ['whatsapp'],
  },
  {
    keywords: ['precio', 'costo', 'cotiza', 'cotización', 'presupuesto'],
    text: 'Para una cotización puntual lo más rápido es nuestro cotizador, o cuéntanos qué necesitas y te derivo con un asesor.',
    actions: ['cotizar', 'whatsapp'],
  },
  {
    keywords: ['tienda', 'monitor', 'laptop', 'servidor', 'stock', 'producto'],
    text: 'En la tienda tenemos monitores, laptops, servidores y pantallas con stock local. ¿Qué buscas?',
    actions: ['tienda'],
    options: ['Monitores', 'Laptops', 'Servidores'],
  },
  {
    keywords: ['servicio', 'seguridad', 'cámara', 'videoconferencia', 'cloud', 'data center'],
    text: 'Nuestros servicios TI van desde seguridad y videoconferencia hasta cloud y data centers, implementados por especialistas. ¿Cuál te interesa?',
    actions: ['servicios'],
    options: ['Videoconferencia', 'Data centers', 'Soluciones cloud'],
  },
  {
    keywords: ['partner', 'revendedor', 'integrador'],
    text: 'El programa de Partners FP tiene precios y beneficios especiales para integradores y revendedores.',
    actions: ['whatsapp'],
  },
  {
    keywords: ['direccion', 'dirección', 'ubicac', 'donde', 'dónde'],
    text: 'Te dejo la ubicación de nuestra oficina en el mapa.',
    actions: ['maps'],
  },
  {
    keywords: ['asesor', 'whatsapp', 'humano', 'contacto'],
    text: 'Te paso con un asesor por WhatsApp.',
    actions: ['whatsapp', 'email'],
  },
];

function fallbackReply(text: string): BotReply {
  const q = text.toLowerCase();
  const hit = INTENTS.find((i) => i.keywords.some((k) => q.includes(k)));
  const ids = hit?.actions ?? ['whatsapp'];
  return {
    text: hit?.text ?? 'No tengo una respuesta para eso todavía. Te paso con un asesor por WhatsApp para ayudarte mejor.',
    actions: ids.map((id) => resolveAction(id)).filter((a): a is ChatAction => a !== null),
    options: hit?.options ?? [],
  };
}

/*
 * El widget vive una sola vez en el layout raíz (visible en los 6 modelos +
 * páginas utilitarias), pero el look del header/panel se adapta al modelo
 * activo — no es un componente genérico pegado encima de cada diseño.
 * Las variantes y `HeaderBg` viven en `./chatVariants` (sin 'use client')
 * para que la guía de estilos las pueda importar también.
 */
function getVariant(pathname: string | null): Variant {
  const seg = pathname?.split('/')[1];
  return (seg && VARIANTS[seg]) || DEFAULT_VARIANT;
}

const ACTION_ICON: Record<ChatActionKind, LucideIcon | typeof WhatsAppIcon> = {
  whatsapp: WhatsAppIcon,
  maps: MapPin,
  email: Mail,
  phone: Phone,
  page: ArrowUpRight,
};

/*
 * Dos looks del panel: claro en la tienda (/tienda, ficha de producto, marcas, carrito y checkout) y oscuro tipo Hero
 * (vidrio ink + acentos de marca) en el resto de la web informativa.
 */
const THEMES = {
  light: {
    panel: 'border border-brand-100 bg-white shadow-2xl shadow-brand-950/25',
    card: 'option-card border border-brand-100 bg-white shadow-sm shadow-brand-950/5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-950/10',
    title: 'text-ink',
    muted: 'text-ink/65',
    arrow: 'text-ink/65',
    userAvatar: 'border border-brand-200 bg-white text-brand-700',
    userBubble: 'bg-brand-700 text-white shadow-sm shadow-brand-950/20',
    link: 'border-brand-200 bg-white text-brand-700 hover:border-brand-700 hover:bg-brand-700 hover:text-white',
    whatsapp: 'border-whatsapp-dark/30 bg-whatsapp/10 text-whatsapp-dark hover:border-whatsapp-dark hover:bg-whatsapp-dark hover:text-white',
    chip: 'border-brand-200 bg-white text-brand-700 hover:border-brand-700 hover:bg-brand-700 hover:text-white',
    inputBar: 'border-brand-100 bg-white',
    notice: 'border-brand-100 bg-white shadow-md shadow-brand-950/10',
    divider: 'bg-brand-100',
    time: 'text-ink/65',
    botRing: 'ring-brand-100',
    input: 'border-brand-200 bg-white text-ink placeholder:text-ink/65 focus:border-brand-600 focus:ring-brand-600/20',
  },
};
type Theme = (typeof THEMES)['light'];

function Avatar({ icon: Icon, bot, t }: { icon: LucideIcon; bot?: boolean; t: Theme }) {
  return (
    <span
      // Cuadrado con una esquina recta, como el botón del widget y la burbuja
      // de su mismo lado: asistente en azul FP, persona en blanco.
      className={`flex h-8 w-8 shrink-0 items-center justify-center shadow-md shadow-brand-dark/15 ${
        bot ? 'rounded-xl rounded-bl-sm bg-brand-primary text-white' : `rounded-xl rounded-br-sm ${t.userAvatar}`
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </span>
  );
}

/* Asesor: su foto de perfil del dashboard (así se ve que escribe una persona,
   no el asistente); sin foto, sus iniciales. */
function AdvisorAvatar({ name, photo, size = 'h-8 w-8' }: { name?: string; photo?: string | null; size?: string }) {
  const ini = (name ?? 'A').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return photo ? (
    <img src={photo} alt={name ?? 'Asesor'} className={`${size} shrink-0 rounded-xl rounded-bl-sm object-cover shadow-md shadow-brand-dark/25 ring-2 ring-brand-teal-light/70`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-xl rounded-bl-sm bg-gradient-to-br from-brand-teal to-brand-petrol text-[11px] font-bold text-white shadow-md shadow-brand-dark/25`}>
      {ini}
    </span>
  );
}

/* Correos -> mailto, teléfonos +51 -> WhatsApp, la dirección -> Google Maps.
   Solo se aplica cuando el texto terminó de escribirse. */
const LINK_BASE = '[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+|\\+51[\\d ]{9,12}\\d';
const linkRe = (address: string) => {
  const corta = address.split(',')[0]; // "Jr. Huaraz 1841"
  return new RegExp(`(${LINK_BASE}|${corta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
};

function linkHref(part: string, address: string) {
  if (part.includes('@')) return `mailto:${part}`;
  if (part.startsWith('+51')) return `https://wa.me/${part.replace(/\D/g, '')}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function Linkified({ text }: { text: string }) {
  const { address } = useSitio().contact;
  const parts = text.split(useMemo(() => linkRe(address), [address]));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={linkHref(part, address)}
            target={part.includes('@') ? undefined : '_blank'}
            rel="noreferrer"
            className="font-semibold text-brand-700 underline decoration-brand-700/40 underline-offset-2 hover:decoration-brand-700"
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/* Texto que se escribe letra por letra — solo la primera vez que aparece
   cada mensaje (skip=true lo muestra completo de una, para no repetir la
   animación cuando el usuario vuelve a esta vista). */
function TypewriterText({ text, skip, onDone }: { text: string; skip: boolean; onDone: () => void }) {
  const [shown, setShown] = useState(skip ? text : '');
  const [done, setDone] = useState(skip);

  useEffect(() => {
    if (skip) return;
    // Array.from: recorre por caracteres reales, no por unidades UTF-16 --
    // si no, los emojis (👋) se cortan a la mitad y se ve "�" un instante.
    const chars = Array.from(text);
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(chars.slice(0, i).join(''));
      if (i >= chars.length) {
        window.clearInterval(id);
        setDone(true);
        onDone();
      }
    }, 16);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return <Linkified text={text} />;
  return (
    <>
      {shown}
      <span className="animate-pulse">▍</span>
    </>
  );
}

function ActionLink({ action, t }: { action: ChatAction; t: Theme }) {
  const Icon = ACTION_ICON[action.kind];
  const external = action.href.startsWith('http');
  const tone = action.kind === 'whatsapp' ? t.whatsapp : t.link;
  return (
    <a
      href={action.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${tone}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {action.label}
    </a>
  );
}

function OptionCard({ icon: Icon, tint, title, text, onClick, extra, t }: {
  icon: LucideIcon | typeof WhatsAppIcon;
  tint: string;
  title: ReactNode;
  text: string;
  onClick: () => void;
  extra?: string;
  t: Theme;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ '--tint': tint } as CSSProperties}
      className={`group flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:-translate-y-0.5 ${t.card}`}
    >
      <span className={`icon-hop flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${extra}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <span>
        <p className={`flex items-center gap-1.5 text-sm font-semibold ${t.title}`}>{title}</p>
        <p className={`text-xs ${t.muted}`}>{text}</p>
      </span>
      <ArrowUpRight className={`ml-auto h-4 w-4 shrink-0 transition-all group-hover:rotate-45 group-hover:text-brand-dark ${t.arrow}`} strokeWidth={2} />
    </button>
  );
}

export function ChatWidget() {
  const pathname = usePathname();
  const variant = getVariant(pathname);
  const t = THEMES.light;
  const { subscribeAskAI } = useChatWidget();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'choose' | 'whatsapp' | 'chat' | 'sessions'>('choose');
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  // Mensajes ya escritos (el typewriter terminó): recién ahí se muestran sus
  // links/opciones, y no se vuelven a animar al volver a esta vista.
  const [typedDone, setTypedDone] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  // id de la sesión reabierta desde el historial (para no duplicarla al archivar).
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [remote, setRemote] = useState<Remote | null>(null);
  const [agent, setAgent] = useState<Agent>({ estado: 'BOT', asesor: null });
  // Fotos de asesores por nombre (en memoria: pueden ser data: URI pesados,
  // no se guardan en localStorage). null = ya se pidió y no tiene foto.
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const [areas, setAreas] = useState<Area[]>(FALLBACK_AREAS);
  // Crear la conversación remota una sola vez aunque lleguen 2 mensajes juntos.
  const remotePromise = useRef<Promise<Remote | null> | null>(null);
  const lastSync = useRef<string | undefined>(undefined);
  const agentNameRef = useRef<string | undefined>(undefined);

  // Restaurar al montar (en effect, no en useState, para no romper la
  // hidratación: el servidor no tiene localStorage). historyLoaded es state
  // (no ref) para que el guardado recién corra en el render siguiente, con
  // lo restaurado -- si no, el saludo inicial pisaba el historial guardado.
  useEffect(() => {
    const saved = loadHistory();
    if (saved?.length) setMessages(saved);
    setSessions(loadSessions());
    setRemote(loadRemote());
    setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (historyLoaded) saveHistory(messages);
  }, [messages, historyLoaded]);

  useEffect(() => {
    if (historyLoaded) saveRemote(remote);
  }, [remote, historyLoaded]);

  // Asesores de WhatsApp gestionados desde el dashboard (si la API responde;
  // si no, quedan los de lib/content.ts).
  useEffect(() => {
    if (view !== 'whatsapp') return;
    hub<{ nombre: string; area: string; telefono: string; whatsapp: string; fotoUrl: string | null }[]>('asesores').then((rows) => {
      if (rows?.length) {
        setAreas(rows.map((r) => ({ label: r.area, contact: r.nombre, phone: r.telefono, number: r.whatsapp, photo: r.fotoUrl })));
      }
    });
  }, [view]);

  function ensureRemote(): Promise<Remote | null> {
    if (remote) return Promise.resolve(remote);
    remotePromise.current ??= hub<Remote>('conversaciones', { paginaOrigen: pathname ?? '/' }).then((r) => {
      if (r) setRemote(r);
      else remotePromise.current = null;
      return r;
    });
    return remotePromise.current;
  }

  // Guarda cada mensaje en la API (el dashboard los ve). Fuego y olvido.
  function persist(autor: 'CLIENTE' | 'BOT', texto: string) {
    void ensureRemote().then((r) => r && hub(`conversaciones/${r.id}/mensajes`, { token: r.token, autor, texto }));
  }

  // Mientras la conversación está abierta, consulta si un asesor la tomó y
  // trae sus mensajes (los propios ya están en pantalla: se ignoran).
  useEffect(() => {
    if (!open || view !== 'chat' || !remote) return;
    let alive = true;
    const tick = async () => {
      const knownName = agentNameRef.current;
      const wantPhoto = !knownName || !(knownName in photosRef.current);
      const q = new URLSearchParams({
        token: remote.token,
        ...(lastSync.current ? { desde: lastSync.current } : {}),
        ...(wantPhoto ? { foto: '1' } : {}),
      });
      const data = await hub<{
        estado: Agent['estado'];
        asesor: (Agent['asesor'] & { avatarUrl?: string | null }) | null;
        mensajes: { id: string; autor: string; texto: string; createdAt: string }[];
      }>(`conversaciones/${remote.id}?${q}`);
      if (!alive || !data) return;
      agentNameRef.current = data.asesor?.nombre ?? undefined;
      if (wantPhoto && data.asesor) {
        const n = data.asesor.nombre ?? 'Un asesor';
        setPhotos((ph) => ({ ...ph, [n]: data.asesor?.avatarUrl ?? null }));
      }
      setAgent({ estado: data.estado, asesor: data.asesor });
      if (data.mensajes.length) lastSync.current = data.mensajes[data.mensajes.length - 1].createdAt;
      // ASESOR = mensajes del asesor; SISTEMA = eventos (se unió, devolvió al
      // asistente IA, finalizó) que la API guarda con su hora real.
      const nuevos = data.mensajes.filter((m) => m.autor === 'ASESOR' || m.autor === 'SISTEMA');
      const nombre = data.asesor?.nombre ?? 'Un asesor';
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.sid).filter(Boolean));
        const add: ChatMsg[] = [];
        for (const m of nuevos) {
          if (seen.has(m.id)) continue;
          const at = new Date(m.createdAt).getTime();
          add.push(
            m.autor === 'SISTEMA'
              ? { from: 'system', text: textoCliente(m.texto), at, sid: m.id, instant: true }
              : { from: 'asesor', text: m.texto, at, sid: m.id, name: data.asesor?.nombre ?? undefined, instant: true },
          );
        }
        return add.length ? [...prev, ...add] : prev;
      });
    };
    tick();
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [open, view, remote]);


  // Guarda la conversación actual en el historial (si el usuario escribió algo).
  function archiveCurrent() {
    const first = messages.find((m) => m.from === 'user');
    if (!first) return sessions;
    const id = sessionId ?? Date.now();
    const next = [
      { id, title: first.text.slice(0, 60), at: messages[messages.length - 1]?.at ?? Date.now(), messages, remote },
      ...sessions.filter((x) => x.id !== id),
    ].slice(0, SESSIONS_MAX);
    setSessions(next);
    saveSessions(next);
    return next;
  }

  function resetConversation() {
    archiveCurrent();
    setSessionId(null);
    setMessages([GREETING]);
    setTypedDone(new Set());
    setRemote(null);
    remotePromise.current = null;
    lastSync.current = undefined;
    setAgent({ estado: 'BOT', asesor: null });
  }

  function openSession(x: ChatSession) {
    archiveCurrent();
    setSessionId(x.id);
    setMessages(x.messages.map((m) => ({ ...m, instant: true })));
    setRemote(x.remote ?? null);
    remotePromise.current = null;
    lastSync.current = undefined;
    setAgent({ estado: 'BOT', asesor: null });
    setTypedDone(new Set());
    setView('chat');
  }

  function deleteSession(id: number) {
    const next = sessions.filter((x) => x.id !== id);
    setSessions(next);
    saveSessions(next);
  }

  // Siempre pegado al último mensaje: al abrir la conversación salta al
  // final, y mientras llegan mensajes o el texto se escribe letra por letra
  // (MutationObserver) sigue bajando solo, sin que el usuario scrollee.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const obs = new MutationObserver(() => {
      el.scrollTop = el.scrollHeight;
    });
    obs.observe(el, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [open, view]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Responde con Groq vía /api/chat (contexto = datos de la web, ver
  // app/api/chat/route.ts). Si la API falla o no hay key, cae a
  // fallbackReply(). greet: conversación iniciada desde el Hero (sin el
  // saludo genérico) -- la respuesta arranca saludando.
  async function sendText(text: string, greet = false) {
    if (!text || typing) return;
    const history = [...(greet ? [] : messages), { from: 'user' as const, text }];
    setMessages((m) => [...m, { from: 'user', text, at: Date.now() }]);
    persist('CLIENTE', text);
    // Un asesor tomó la conversación: responde él (llega por la consulta
    // periódica), el asistente ya no contesta.
    if (agent.estado === 'ASESOR') return;
    setTyping(true);
    let answer: BotReply;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.filter((m) => m.from !== 'system').map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      answer = { text: data.reply, actions: data.actions ?? [], options: data.options ?? [] };
    } catch {
      answer = fallbackReply(text);
      if (greet) answer.text = `¡Hola! 👋 ${answer.text}`;
    }
    setTyping(false);
    setMessages((m) => [...m, { from: 'bot', ...answer, at: Date.now() }]);
    persist('BOT', answer.text);
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    sendText(text);
  }

  // "Pregunta a nuestra IA" del Hero llama a askAI() (ver
  // ChatWidgetContext) -- acá se escucha eso, se abre el widget en la vista
  // de conversación y se manda la pregunta como si el usuario la hubiera
  // escrito directo acá. Si la conversación recién empieza (solo el saludo
  // genérico), se quita ese saludo: la respuesta va directo a lo
  // consultado, saludando.
  useEffect(() => {
    return subscribeAskAI((question) => {
      const fresh = messages.length === 1 && messages[0].text === GREETING.text;
      if (fresh) setMessages([]);
      setOpen(true);
      setView('chat');
      sendText(question, fresh);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeAskAI, messages, typing]);

  const lastIndex = messages.length - 1;

  return (
    // flex-col items-end: el botón (burbuja / X de cerrar) queda siempre en
    // la esquina derecha, en el mismo lugar, esté abierto o no el panel.
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end" ref={panelRef}>
      {open && (
        <div className={`animate-pop-in relative mb-3 w-[370px] max-w-[calc(100vw-40px)] overflow-hidden ${t.panel} ${variant.panelRadius}`}>
          {variant.cornerAccent && <div className="absolute -right-8 -top-8 z-10 h-16 w-16 rotate-45 bg-brand-primary" aria-hidden />}

          <div className="relative flex items-center px-4 py-3.5 text-white">
            <HeaderBg look="dark" />
            <div className="relative flex min-w-0 items-center gap-3">
              {/* Volver (fuera del inicio) + ícono según la vista abierta:
                  chat en el inicio, WhatsApp en asesores, robot en el
                  asistente, historial en conversaciones. */}
              {view !== 'choose' && (
                <button
                  type="button"
                  onClick={() => setView(view === 'sessions' ? 'chat' : 'choose')}
                  aria-label="Volver"
                  className="-ml-1 flex h-8 w-6 shrink-0 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
              )}
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  view === 'whatsapp' ? 'bg-whatsapp' : 'bg-white/20'
                }`}
              >
                {view === 'chat' && agent.estado === 'ASESOR' && photos[agent.asesor?.nombre ?? 'Un asesor'] ? (
                  <img src={photos[agent.asesor?.nombre ?? 'Un asesor']!} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (() => {
                  const HeaderIcon = view === 'chat' ? (agent.estado === 'ASESOR' ? User : Bot) : view === 'sessions' ? History : view === 'whatsapp' ? WhatsAppIcon : MessageCircleMore;
                  return <HeaderIcon className="h-5 w-5" strokeWidth={2} />;
                })()}
              </span>
              <div className="min-w-0">
                <p className={variant.labelClass}>{view === 'choose' ? '¿Cómo te ayudamos?' : view === 'whatsapp' ? 'Habla con un asesor' : view === 'sessions' ? 'Conversaciones' : agent.estado === 'ASESOR' ? (agent.asesor?.nombre ?? 'Asesor') : 'Asistente virtual'}</p>
                <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-white/90">
                  <span className="online-dot h-1.5 w-1.5 rounded-full bg-whatsapp" />
                  {view === 'choose' ? 'Elige cómo quieres hablar' : view === 'whatsapp' ? 'Lun a vie, 9:00 a 18:00' : view === 'sessions' ? 'Guardadas en este navegador' : agent.estado === 'ASESOR' ? 'Asesor conectado' : agent.estado === 'CERRADA' ? 'Conversación finalizada' : 'En línea'}
                </p>
              </div>
            </div>
            {view === 'chat' && (
              <div className="relative ml-auto flex shrink-0 items-center gap-1.5">
                {sessions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setView('sessions')}
                    aria-label="Conversaciones anteriores"
                    title="Conversaciones anteriores"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
                  >
                    <History className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
                {messages.length > 1 && (
              <button
                type="button"
                onClick={resetConversation}
                aria-label="Nueva conversación"
                title="Nueva conversación"
                className="flex h-8 items-center gap-1 rounded-lg bg-white/20 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/30"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                Nueva
              </button>
                )}
              </div>
            )}
          </div>

          {view === 'choose' ? (
            <div className="flex flex-col gap-2.5 p-4">
              <OptionCard
                t={t}
                icon={WhatsAppIcon}
                tint="#25d366"
                extra="bg-gradient-to-br from-whatsapp to-whatsapp-dark shadow-whatsapp-dark/30"
                title={
                  <>
                    WhatsApp
                    <span className="online-dot h-1.5 w-1.5 rounded-full bg-whatsapp" />
                  </>
                }
                text="Chatea directo con un asesor"
                onClick={() => setView('whatsapp')}
              />
              <OptionCard
                t={t}
                icon={Bot}
                tint="var(--color-brand-primary)"
                extra="bg-brand-primary shadow-brand-primary/30"
                title={
                  <>
                    Asistente virtual
                    <span className="online-dot h-1.5 w-1.5 rounded-full bg-whatsapp" />
                  </>
                }
                text="Respuestas al instante, 24/7"
                onClick={() => setView('chat')}
              />
            </div>
          ) : view === 'whatsapp' ? (
            <div className="flex flex-col gap-2 p-4">
              <p className={`mb-1 text-xs ${t.muted}`}>Elige el área y te respondemos por WhatsApp.</p>
              {areas.map((area) => {
                const AreaIcon = AREA_ICON[area.label] ?? MessageCircleMore;
                return (
                  <a
                    key={area.label}
                    href={`https://wa.me/${area.number}?text=${encodeURIComponent(`Hola ${area.contact}, quiero contactar al área de ${area.label} de FPTecnologi`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`group flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:-translate-y-0.5 ${t.card}`}
                  >
                    {/* Inicial del asesor + punto verde de disponible. */}
                    <span className="relative h-11 w-11 shrink-0">
                      {area.photo ? (
                        <img
                          src={area.photo}
                          alt={area.contact}
                          className="h-11 w-11 rounded-xl object-cover shadow-md shadow-whatsapp-dark/30 ring-2 ring-whatsapp/70"
                        />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-whatsapp to-whatsapp-dark font-display text-base font-bold text-white shadow-md shadow-whatsapp-dark/30">
                          {area.contact[0]}
                        </span>
                      )}
                      <span className="absolute -right-0.5 -top-0.5 flex">
                        <span className="online-dot h-2.5 w-2.5 rounded-full bg-whatsapp ring-2 ring-white" />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${t.title}`}>{area.contact}</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-whatsapp/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-whatsapp">
                          <AreaIcon className="h-3 w-3" strokeWidth={2.2} />
                          {area.label}
                        </span>
                      </span>
                      <span className={`mt-0.5 block whitespace-nowrap text-xs ${t.muted}`}>+51 {area.phone}</span>
                    </span>
                    <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-whatsapp-dark px-3.5 text-sm font-semibold text-white shadow-md shadow-whatsapp/30 transition-colors group-hover:bg-whatsapp-deep">
                      <WhatsAppIcon className="h-4 w-4" />
                      Chatear
                    </span>
                  </a>
                );
              })}
            </div>
          ) : view === 'sessions' ? (
            <div className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto p-4">
              {sessions.map((x) => (
                <div key={x.id} className={`group flex items-center gap-2 rounded-xl p-3 transition-all ${t.card}`}>
                  <button type="button" onClick={() => openSession(x)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-dark/25">
                      <MessageCircleMore className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-semibold ${t.title}`}>{x.title}</span>
                      <span className={`text-[11px] ${t.muted}`}>
                        {dateFmt(x.at)} · {x.messages.length} mensajes{x.id === sessionId ? ' · actual' : ''}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSession(x.id)}
                    aria-label="Borrar conversación"
                    className={`shrink-0 rounded-lg p-1.5 opacity-60 transition hover:bg-red-500/15 hover:text-red-500 hover:opacity-100 ${t.muted}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div ref={listRef} className="flex h-96 flex-col gap-3 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <p className={`text-center text-[10px] ${t.time}`}>Un asesor puede revisar esta conversación para ayudarte mejor.</p>
                {messages.map((m, i) => {
                  if (m.from === 'system') {
                    const join = m.text.includes('se unió');
                    return (
                      <div key={i} className="animate-pop-in my-1 flex items-center gap-2">
                        <span className={`h-px flex-1 ${t.divider}`} />
                        {/* Etiqueta sólida celeste. */}
                        <span className="inline-flex max-w-[85%] items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${join ? 'bg-whatsapp' : 'bg-brand-primary/40'}`} />
                          <span className="truncate">{m.text}</span>
                          {m.at ? <span className="shrink-0 font-normal text-brand-700/70">· {timeFmt(m.at)}</span> : null}
                        </span>
                        <span className={`h-px flex-1 ${t.divider}`} />
                      </div>
                    );
                  }
                  const ready = m.from === 'user' || m.instant || typedDone.has(i);
                  return (
                    <div key={i} className={`animate-pop-in flex flex-col gap-2 ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-end gap-2 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>
                        {m.from === 'bot' ? <Avatar icon={Bot} bot t={t} /> : m.from === 'asesor' ? <AdvisorAvatar name={m.name ?? 'Un asesor'} photo={photos[m.name ?? 'Un asesor']} /> : <Avatar icon={User} t={t} />}
                        <div className={`flex max-w-[80%] flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                              m.from === 'bot'
                                ? `rounded-2xl rounded-bl-md border border-brand-100 bg-brand-50 text-ink`
                                : m.from === 'asesor'
                                  ? `rounded-2xl rounded-bl-md border border-brand-200 bg-white text-ink shadow-sm shadow-brand-950/10`
                                  : `rounded-2xl rounded-br-md ${t.userBubble}`
                            }`}
                          >
                            {m.from === 'bot' ? (
                              <TypewriterText
                                text={m.text}
                                skip={!!m.instant || typedDone.has(i)}
                                onDone={() => setTypedDone((s) => new Set(s).add(i))}
                              />
                            ) : (
                              m.text
                            )}
                          </div>
                          {/* Remitente + hora debajo de la burbuja. */}
                          <span className={`mt-1 whitespace-nowrap px-1 text-[10px] ${t.time}`}>
                            {m.from === 'bot' ? 'Asistente FP' : m.from === 'asesor' ? (m.name ?? 'Asesor') : 'Tú'}
                            {m.at ? ` · ${timeFmt(m.at)}` : ''}
                          </span>
                        </div>
                      </div>

                      {m.from === 'bot' && ready && !!m.actions?.length && (
                        <div className="animate-pop-in ml-9 flex flex-wrap gap-1.5">
                          {m.actions.map((a) => (
                            <ActionLink key={a.href} action={a} t={t} />
                          ))}
                        </div>
                      )}

                      {/* Respuestas rápidas: solo en el último mensaje del bot. */}
                      {m.from === 'bot' && ready && i === lastIndex && !typing && !!m.options?.length && (
                        <div className="animate-pop-in ml-9 flex flex-wrap gap-1.5">
                          {m.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => sendText(opt)}
                              className={`rounded-xl rounded-br-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${t.chip}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {typing && (
                  <div className="animate-pop-in flex items-end gap-2 self-start">
                    <Avatar icon={Bot} bot t={t} />
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-brand-100 bg-brand-50 px-4 py-3">
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-600" style={{ animationDelay: '0ms' }} />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-600" style={{ animationDelay: '150ms' }} />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-600" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-2 border-t p-3 ${t.inputBar}`}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  maxLength={500}
                  placeholder="Escribe tu consulta..."
                  className={`min-w-0 flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 ${t.input}`}
                />
                <button
                  type="button"
                  onClick={send}
                  aria-label="Enviar"
                  disabled={!draft.trim() || typing || agent.estado === 'CERRADA'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white transition-all hover:bg-brand-800 active:scale-95 disabled:opacity-40"
                >
                  <SendHorizontal className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        className="btn-glow launcher-ring relative flex h-14 w-14 items-center justify-center rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md text-white transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" strokeWidth={2} /> : <MessageCircleMore className="h-6 w-6" strokeWidth={2} />}
      </button>
    </div>
  );
}
