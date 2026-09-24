'use client';

import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Bot,
  ChevronLeft,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  SendHorizontal,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { VARIANTS, DEFAULT_VARIANT, HeaderBg, type Variant } from './chatVariants';
import { CONTACT_INFO, WHATSAPP_AREAS } from '@/lib/content';
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
type ChatMsg = { from: 'bot' | 'user'; text: string; instant?: boolean; actions?: ChatAction[]; options?: string[] };
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
      .filter((m) => m && (m.from === 'bot' || m.from === 'user') && typeof m.text === 'string')
      .map((m) => ({
        from: m.from,
        text: m.text,
        instant: true, // ya se leyó: no se vuelve a escribir letra por letra
        actions: Array.isArray(m.actions)
          ? m.actions.filter((a: ChatAction) => typeof a?.href === 'string' && SAFE_HREF.test(a.href) && a.kind in ACTION_ICON)
          : undefined,
        options: Array.isArray(m.options) ? m.options.filter((o: unknown) => typeof o === 'string') : undefined,
      }));
  } catch {
    return null;
  }
}

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
    text: 'En la tienda tenemos monitores, laptops, servidores y pantallas interactivas con stock local. ¿Qué buscas?',
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
    text: `Estamos en ${CONTACT_INFO.address}.`,
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
    actions: ids.map(resolveAction).filter((a): a is ChatAction => a !== null),
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

const ACTION_ICON: Record<ChatActionKind, LucideIcon> = {
  whatsapp: MessageCircle,
  maps: MapPin,
  email: Mail,
  phone: Phone,
  page: ArrowUpRight,
};

function Avatar({ icon: Icon, bot }: { icon: LucideIcon; bot?: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
        bot ? 'border-brand-primary/25 bg-brand-primary/15 text-brand-primary' : 'border-white/20 bg-white/10 text-white/80'
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </span>
  );
}

/* Correos -> mailto, teléfonos +51 -> WhatsApp, la dirección -> Google Maps.
   Solo se aplica cuando el texto terminó de escribirse. */
const ADDRESS_SHORT = CONTACT_INFO.address.split(',')[0]; // "Jr. Huaraz 1841"
const LINK_RE = new RegExp(`([\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+|\\+51[\\d ]{9,12}\\d|${ADDRESS_SHORT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');

function linkHref(part: string) {
  if (part.includes('@')) return `mailto:${part}`;
  if (part.startsWith('+51')) return `https://wa.me/${part.replace(/\D/g, '')}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`;
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(LINK_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={linkHref(part)}
            target={part.includes('@') ? undefined : '_blank'}
            rel="noreferrer"
            className="font-semibold text-brand-teal-light underline decoration-brand-teal-light/40 underline-offset-2 hover:decoration-brand-teal-light"
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

function ActionLink({ action }: { action: ChatAction }) {
  const Icon = ACTION_ICON[action.kind];
  const external = action.href.startsWith('http');
  const tone =
    action.kind === 'whatsapp'
      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/30'
      : 'border-white/15 bg-white/10 text-white/90 hover:bg-white/20';
  return (
    <a
      href={action.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${tone}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {action.label}
    </a>
  );
}

function OptionCard({ icon: Icon, tint, title, text, onClick, extra }: {
  icon: LucideIcon;
  tint: string;
  title: ReactNode;
  text: string;
  onClick: () => void;
  extra?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ '--tint': tint } as CSSProperties}
      className="option-card flex items-center gap-3 rounded-2xl p-3 text-left"
    >
      <span className={`icon-hop flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${extra}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <span>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-ink/55">{text}</p>
      </span>
    </button>
  );
}

export function ChatWidget() {
  const pathname = usePathname();
  const variant = getVariant(pathname);
  const { subscribeAskAI } = useChatWidget();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'choose' | 'whatsapp' | 'chat'>('choose');
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  // Mensajes ya escritos (el typewriter terminó): recién ahí se muestran sus
  // links/opciones, y no se vuelven a animar al volver a esta vista.
  const [typedDone, setTypedDone] = useState<Set<number>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Restaurar al montar (en effect, no en useState, para no romper la
  // hidratación: el servidor no tiene localStorage). historyLoaded es state
  // (no ref) para que el guardado recién corra en el render siguiente, con
  // lo restaurado -- si no, el saludo inicial pisaba el historial guardado.
  useEffect(() => {
    const saved = loadHistory();
    if (saved?.length) setMessages(saved);
    setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (historyLoaded) saveHistory(messages);
  }, [messages, historyLoaded]);

  function resetConversation() {
    setMessages([GREETING]);
    setTypedDone(new Set());
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, typedDone]);

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
    setMessages((m) => [...m, { from: 'user', text }]);
    setTyping(true);
    let answer: BotReply;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.from === 'bot' ? 'assistant' : 'user', content: m.text })),
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
    setMessages((m) => [...m, { from: 'bot', ...answer }]);
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
        <div className={`glass-panel animate-pop-in relative mb-3 w-[360px] max-w-[calc(100vw-40px)] overflow-hidden ${variant.panelRadius}`}>
          {variant.cornerAccent && <div className="absolute -right-8 -top-8 z-10 h-16 w-16 rotate-45 bg-brand-primary" aria-hidden />}

          <div className="relative flex items-center px-4 py-3.5 text-white">
            <HeaderBg look={variant.header} />
            <div className="relative flex items-center gap-2">
              {view !== 'choose' && (
                <button type="button" onClick={() => setView('choose')} aria-label="Volver" className="text-white/70 transition-colors hover:text-white">
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
              <p className={variant.labelClass}>{view === 'choose' ? '¿Cómo te ayudamos?' : view === 'whatsapp' ? 'Elige un área' : 'Asistente virtual'}</p>
            </div>
            {view === 'chat' && messages.length > 1 && (
              <button
                type="button"
                onClick={resetConversation}
                aria-label="Nueva conversación"
                title="Nueva conversación"
                className="relative ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                Nueva
              </button>
            )}
          </div>

          {view === 'choose' ? (
            <div className="flex flex-col gap-2.5 p-4">
              <OptionCard
                icon={MessageCircle}
                tint="#10b981"
                extra="bg-emerald-500 shadow-emerald-500/30"
                title="WhatsApp"
                text="Elige el área y habla directo con un asesor"
                onClick={() => setView('whatsapp')}
              />
              <OptionCard
                icon={Bot}
                tint="var(--color-brand-primary)"
                extra="bg-brand-primary shadow-brand-primary/30"
                title={
                  <>
                    Asistente virtual
                    <span className="online-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </>
                }
                text="Respuestas rápidas, al instante"
                onClick={() => setView('chat')}
              />
            </div>
          ) : view === 'whatsapp' ? (
            <div className="flex flex-col gap-2 p-4">
              {WHATSAPP_AREAS.map((area) => (
                <a
                  key={area.label}
                  href={`https://wa.me/${area.number}?text=${encodeURIComponent(`Hola, quiero contactar al área de ${area.label} de FPTecnologi`)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ '--tint': '#10b981' } as CSSProperties}
                  className="option-card flex items-center gap-3 rounded-2xl p-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                    <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <p className="text-sm font-semibold text-ink">{area.label}</p>
                </a>
              ))}
            </div>
          ) : (
            <>
              <div ref={listRef} className="flex h-96 flex-col gap-3 overflow-y-auto p-4">
                {messages.map((m, i) => {
                  const ready = m.from === 'user' || m.instant || typedDone.has(i);
                  return (
                    <div key={i} className={`animate-pop-in flex flex-col gap-2 ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-end gap-2 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>
                        {m.from === 'bot' ? <Avatar icon={Bot} bot /> : <Avatar icon={User} />}
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                            m.from === 'bot'
                              ? 'glass-card rounded-2xl rounded-bl-md text-white/90'
                              : 'btn-glow rounded-2xl rounded-br-md text-white'
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
                      </div>

                      {m.from === 'bot' && ready && !!m.actions?.length && (
                        <div className="animate-pop-in ml-9 flex flex-wrap gap-1.5">
                          {m.actions.map((a) => (
                            <ActionLink key={a.href} action={a} />
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
                              className="rounded-full border border-brand-primary/50 bg-brand-primary/15 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-primary/40"
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
                    <Avatar icon={Bot} bot />
                    <div className="glass-card flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3">
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/50" style={{ animationDelay: '0ms' }} />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/50" style={{ animationDelay: '150ms' }} />
                      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/50" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  maxLength={500}
                  placeholder="Escribe tu consulta..."
                  className="glass-input min-w-0 flex-1 rounded-full px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <button
                  type="button"
                  onClick={send}
                  aria-label="Enviar"
                  className="btn-glow flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
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
        {open ? <X className="h-6 w-6" strokeWidth={2} /> : <MessageCircle className="h-6 w-6" strokeWidth={2} />}
      </button>
    </div>
  );
}
