import { describe, expect, it } from 'vitest';
import { respuestaEnLlamadaFallida } from './asistente.groq.js';

const cuerpo = (fallida: string) => JSON.stringify({ error: { code: 'tool_use_failed', failed_generation: fallida } });

describe('respuestaEnLlamadaFallida', () => {
  it('recupera la respuesta que el modelo entregó como llamada a la herramienta JSON', () => {
    const r = respuestaEnLlamadaFallida(cuerpo('{"name": "JSON", "arguments": {"texto":"Sin pendientes","modulos":["ecommerce.pedidos"]}}'));
    expect(JSON.parse(r!)).toEqual({ texto: 'Sin pendientes', modulos: ['ecommerce.pedidos'] });
  });

  it('devuelve null si no hay respuesta aprovechable', () => {
    expect(respuestaEnLlamadaFallida(cuerpo('{"name": "x", "arguments": {}}'))).toBeNull();
    expect(respuestaEnLlamadaFallida('no es json')).toBeNull();
  });
});
