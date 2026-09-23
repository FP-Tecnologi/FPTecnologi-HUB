'use client';

import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';

type AskListener = (question: string) => void;

type ChatWidgetContextValue = {
  /** Abre el widget de chat, lo pone en la vista de conversación y manda
   * esta pregunta como si la hubiera escrito el usuario ahí -- la usa el
   * campo "Pregunta a nuestra IA" del Hero para responder con el mismo
   * asistente virtual del widget, sin duplicar la lógica de respuestas. */
  askAI: (question: string) => void;
  /** Uso interno de ChatWidget: se suscribe para reaccionar cuando algo
   * afuera del widget llama a askAI(). */
  subscribeAskAI: (listener: AskListener) => () => void;
};

const ChatWidgetContext = createContext<ChatWidgetContextValue | null>(null);

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const listeners = useRef(new Set<AskListener>());

  const askAI = useCallback((question: string) => {
    const q = question.trim();
    if (!q) return;
    listeners.current.forEach((listener) => listener(q));
  }, []);

  const subscribeAskAI = useCallback((listener: AskListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return <ChatWidgetContext.Provider value={{ askAI, subscribeAskAI }}>{children}</ChatWidgetContext.Provider>;
}

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext);
  if (!ctx) throw new Error('useChatWidget debe usarse dentro de <ChatWidgetProvider>');
  return ctx;
}
