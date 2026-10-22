/*
 * Cliente mínimo de Groq (API compatible con OpenAI: /chat/completions con function calling). Sin SDK: un fetch con
 * tiempo máximo. Es el mismo proveedor que usa el chat de la web (GROQ_API_KEY).
 */
import { BadGatewayException } from '@nestjs/common';

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

export async function completar(peticion: PeticionModelo, apiKey: string): Promise<{ content: string | null; tool_calls?: ToolCall[] }> {
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
  if (res.status === 429) throw new BadGatewayException('El asistente está ocupado. Intenta en un minuto.');
  if (!res.ok) throw new BadGatewayException('El asistente no está disponible en este momento.');
  const json = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[] } | null;
  const msg = json?.choices?.[0]?.message;
  if (!msg) throw new BadGatewayException('Respuesta vacía del asistente.');
  return { content: msg.content ?? null, tool_calls: msg.tool_calls?.length ? msg.tool_calls : undefined };
}
