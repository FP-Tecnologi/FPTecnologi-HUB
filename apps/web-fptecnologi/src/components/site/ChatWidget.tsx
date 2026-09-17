'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { VARIANTS, DEFAULT_VARIANT, HeaderBg, type Variant } from './chatVariants';
import { WHATSAPP_AREAS } from '@/lib/content';

type ChatMsg = { from: 'bot' | 'user'; text: string };

const INTENTS: { keywords: string[]; reply: string }[] = [
  {
    keywords: ['horario', 'atienden', 'atención', 'abren', 'cierran'],
    reply: 'Atendemos de lunes a viernes de 9:00 a 18:00. Fuera de ese horario podés dejarnos tu consulta y te respondemos apenas volvamos.',
  },
  {
    keywords: ['precio', 'costo', 'cotiza', 'cotización', 'presupuesto'],
    reply: 'Para una cotización puntual lo más rápido es el cotizador: fptecnologi.com/landing-cotiza-tu-tiempo — o contanos acá qué necesitás y te derivo con un asesor.',
  },
  {
    keywords: ['tienda', 'monitor', 'laptop', 'servidor', 'stock', 'producto'],
    reply: 'En la Tienda tenés monitores, laptops, servidores y pantallas interactivas con stock local. ¿Buscás algo puntual?',
  },
  {
    keywords: ['servicio', 'seguridad', 'cámara', 'videoconferencia', 'cloud', 'data center'],
    reply: 'Nuestros servicios TI van desde seguridad y videoconferencia hasta cloud y data centers, todos implementados por especialistas. ¿Cuál te interesa?',
  },
  {
    keywords: ['partner', 'revendedor', 'integrador'],
    reply: 'El programa de Partners FP tiene precios y beneficios especiales para integradores y revendedores. ¿Querés que te contacte alguien del equipo comercial?',
  },
  {
    keywords: ['direccion', 'dirección', 'ubicac', 'donde', 'dónde'],
    reply: 'Estamos en Jr. Huaraz 1841, Breña — Lima, Perú.',
  },
];

function reply(text: string) {
  const q = text.toLowerCase();
  const hit = INTENTS.find((i) => i.keywords.some((k) => q.includes(k)));
  return hit?.reply ?? 'No tengo una respuesta armada para eso todavía — te paso con un asesor humano por WhatsApp para que te ayude mejor.';
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

function BotAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-primary/25 bg-brand-primary/15 text-brand-primary">
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <path d="M12 3a8 8 0 0 0-8 8c0 1.6.5 3.1 1.4 4.3L4 20l4.9-1.3c1.2.7 2.6 1.1 4.1 1.1a8 8 0 0 0 0-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="9" cy="11" r="1" fill="currentColor" />
        <circle cx="12" cy="11" r="1" fill="currentColor" />
        <circle cx="15" cy="11" r="1" fill="currentColor" />
      </svg>
    </span>
  );
}

function UserAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80">
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 20c1.2-3.5 4-5.3 7-5.3s5.8 1.8 7 5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
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
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
        onDone();
      }
    }, 16);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {shown}
      {!done && <span className="animate-pulse">▍</span>}
    </>
  );
}

export function ChatWidget() {
  const pathname = usePathname();
  const variant = getVariant(pathname);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'choose' | 'whatsapp' | 'chat'>('choose');
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: 'bot', text: 'Hola 👋 Soy el asistente virtual de FPTecnologi. Preguntame por horarios, servicios, productos o el programa de partners.' },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function send() {
    const text = draft.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setDraft('');
    setTyping(true);
    window.setTimeout(
      () => {
        setTyping(false);
        setMessages((m) => [...m, { from: 'bot', text: reply(text) }]);
      },
      500 + Math.random() * 500,
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60]" ref={panelRef}>
      {open && (
        <div className={`glass-panel animate-pop-in relative mb-3 w-[340px] max-w-[calc(100vw-40px)] overflow-hidden ${variant.panelRadius}`}>
          {variant.cornerAccent && <div className="absolute -right-8 -top-8 z-10 h-16 w-16 rotate-45 bg-brand-primary" aria-hidden />}

          <div className="relative flex items-center px-4 py-3.5 text-white">
            <HeaderBg look={variant.header} />
            <div className="relative flex items-center gap-2">
              {view !== 'choose' && (
                <button type="button" onClick={() => setView('choose')} aria-label="Volver" className="text-white/70 transition-colors hover:text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <p className={variant.labelClass}>{view === 'choose' ? '¿Cómo te ayudamos?' : view === 'whatsapp' ? 'Elegí un área' : 'Asistente virtual'}</p>
            </div>
          </div>

          {view === 'choose' ? (
            <div className="flex flex-col gap-2.5 p-4">
              <button
                type="button"
                onClick={() => setView('whatsapp')}
                style={{ '--tint': '#10b981' } as CSSProperties}
                className="option-card flex items-center gap-3 rounded-2xl p-3 text-left"
              >
                <span className="icon-hop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5 0 .5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
                  </svg>
                </span>
                <span>
                  <p className="text-sm font-semibold text-ink">WhatsApp</p>
                  <p className="text-xs text-ink/55">Elegí el área y hablá directo con un asesor</p>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setView('chat')}
                style={{ '--tint': 'var(--color-brand-primary)' } as CSSProperties}
                className="option-card flex items-center gap-3 rounded-2xl p-3 text-left"
              >
                <span className="icon-hop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm shadow-brand-primary/30">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M12 3a8 8 0 0 0-8 8c0 1.6.5 3.1 1.4 4.3L4 20l4.9-1.3c1.2.7 2.6 1.1 4.1 1.1a8 8 0 0 0 0-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                    <circle cx="9" cy="11" r="1" fill="currentColor" />
                    <circle cx="12" cy="11" r="1" fill="currentColor" />
                    <circle cx="15" cy="11" r="1" fill="currentColor" />
                  </svg>
                </span>
                <span>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    Asistente virtual
                    <span className="online-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </p>
                  <p className="text-xs text-ink/55">Respuestas rápidas, al instante</p>
                </span>
              </button>
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
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5 0 .5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-ink">{area.label}</p>
                </a>
              ))}
            </div>
          ) : (
            <>
              <div ref={listRef} className="flex h-80 flex-col gap-3 overflow-y-auto p-4">
                {messages.map((m, i) => (
                  <div key={i} className={`animate-pop-in flex items-end gap-2 ${m.from === 'user' ? 'flex-row-reverse self-end' : 'self-start'}`}>
                    {m.from === 'bot' ? <BotAvatar /> : <UserAvatar />}
                    <div
                      className={`max-w-[76%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.from === 'bot' ? 'glass-card text-white/90' : 'btn-glow text-white'
                      }`}
                    >
                      {m.from === 'bot' ? (
                        <TypewriterText text={m.text} skip={animatedRef.current.has(i)} onDone={() => animatedRef.current.add(i)} />
                      ) : (
                        m.text
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="animate-pop-in flex items-end gap-2 self-start">
                    <BotAvatar />
                    <div className="glass-card flex items-center gap-1 rounded-2xl px-4 py-3">
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
                  placeholder="Escribí tu consulta..."
                  className="glass-input min-w-0 flex-1 rounded-full px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <button
                  type="button"
                  onClick={send}
                  aria-label="Enviar"
                  className="btn-glow flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M12 3a8 8 0 0 0-8 8c0 1.6.5 3.1 1.4 4.3L4 20l4.9-1.3c1.2.7 2.6 1.1 4.1 1.1a8 8 0 0 0 0-16Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
