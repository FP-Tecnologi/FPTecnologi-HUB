// Modelos 3D reales (.glb en public/models). Clave = id de opción (v2) o categoría (gpu); la opción gana.
// Sin entrada, el armador dibuja la pieza procedural. Ajusta escala/pos/rot a ojo hasta que encaje.
export type Modelo = { url: string; escala?: number; pos?: [number, number, number]; rot?: [number, number, number] };

export const MODELOS: Record<string, Modelo> = {
  // gpu: { url: '/models/gpu.glb', escala: 1, pos: [-0.25, -0.55, -0.15] },
  // ram: { url: '/models/ram.glb', escala: 1, pos: [0.6, 0.75, -0.6] },
};
