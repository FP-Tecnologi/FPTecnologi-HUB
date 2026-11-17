/*
 * Cliente mínimo de Groq (API compatible con OpenAI: /chat/completions con function calling). Sin SDK: un fetch con
 * tiempo máximo. Es el mismo proveedor que usa el chat de la web (GROQ_API_KEY).
 */
import { BadGatewayException, Logger, ServiceUnavailableException } from '@nestjs/common';

const URL = 'https://api.groq.com/openai/v1/chat/completions';
const TIMEOUT_MS = 30_000;

export interface ToolCall { id: string; type: 'function'; function: { name: string; arguments: string } }
export type MensajeModelo =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

export interface PeticionModelo {
  model: string;
  messages: MensajeModelo[];
  tools?: { type: 'function'; function: { name: string; description: string; parameters: Record<string, unknown> } }[];
  tool_choice?: 'auto' | 'none';
  temperature?: number;
  max_completion_tokens?: number;
  reasoning_effort?: 'low' | 'medium' | 'high';
}

const logger = new Logger('Groq');

/** Saca los argumentos de `failed_generation` ({"name":"JSON","arguments":{...}}) como el JSON final que se esperaba. */
export function respuestaEnLlamadaFallida(cuerpoError: string): string | null {
  try {
    const fallida = (JSON.parse(cuerpoError) as { error?: { failed_generation?: string } }).error?.failed_generation;
    const llamada = JSON.parse(fallida ?? '') as { arguments?: unknown };
    const a = typeof llamada.arguments === 'string' ? (JSON.parse(llamada.arguments) as unknown) : llamada.arguments;
    return a && typeof a === 'object' && typeof (a as { texto?: unknown }).texto === 'string' ? JSON.stringify(a) : null;
  } catch {
    return null;
  }
}

/** `intento` es interno: el modelo a veces arma mal una llamada a herramienta (400 tool_use_failed) y a la segunda sale bien. */
export async function completar(peticion: PeticionModelo, apiKey: string, intento = 0): Promise<{ content: string | null; tool_calls?: ToolCall[] }> {
  let res: Response;
  try {
    res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(peticion),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new BadGatewayException('El asistente no respondió a tiempo. Intenta de nuevo.');
  }
  if (res.status === 401) throw new ServiceUnavailableException('La clave de Groq (GROQ_API_KEY) de la API no es válida o fue revocada. Crea una nueva en console.groq.com/keys.');
  if (res.status === 429) throw new BadGatewayException('El asistente está ocupado. Intenta en un minuto.');
  if (!res.ok) {
    // El motivo real queda en el log de la API (Groq lo explica en el cuerpo); al usuario solo un mensaje genérico.
    const cuerpo = await res.text().catch(() => '');
    if (res.status === 400 && cuerpo.includes('tool_use_failed')) {
      // gpt-oss a veces entrega la respuesta final como una "llamada" a una herramienta inexistente llamada JSON: Groq
      // la rechaza, pero la respuesta viene en failed_generation y se recupera tal cual.
      const rescatada = respuestaEnLlamadaFallida(cuerpo);
      if (rescatada) return { content: rescatada };
      if (intento < 1) return completar(peticion, apiKey, intento + 1);
    }
    logger.error(`Groq respondió ${res.status} con el modelo ${peticion.model}: ${cuerpo.slice(0, 400)}`);
    throw new BadGatewayException('El asistente no está disponible en este momento.');
  }
  const json = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[] } | null;
  const msg = json?.choices?.[0]?.message;
  if (!msg) throw new BadGatewayException('Respuesta vacía del asistente.');
  return { content: msg.content ?? null, tool_calls: msg.tool_calls?.length ? msg.tool_calls : undefined };
}
