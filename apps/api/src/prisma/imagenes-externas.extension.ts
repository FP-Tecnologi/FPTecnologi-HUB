import { Prisma } from '../generated/prisma/client.js';
import { localizarEnValor, tieneImagenExterna } from '../uploads/imagenes-externas.js';

/**
 * Al guardar (create/update/upsert) en cualquier modelo, las imágenes que apunten a otra web se copian a nuestro
 * servidor y se guarda la URL propia (ver uploads/imagenes-externas.ts). Así una foto pegada desde la web de una marca o
 * del WordPress viejo no se rompe si esa web la borra.
 *
 * Solo se miran los campos de imagen conocidos (`imagenes`, `logo`, `logoUrl`, `fotoUrl`, `imagenUrl`, `portadaUrl`,
 * `avatarUrl`) y los valores JSON (contenido del CMS, landings, popups); un texto suelto (un mensaje, una descripción)
 * no se toca. Si la descarga falla se guarda la URL original: nunca bloquea un guardado.
 */
const CAMPOS_IMAGEN = new Set(['imagenes', 'logo', 'logoUrl', 'fotoUrl', 'imagenUrl', 'portadaUrl', 'avatarUrl']);
const OPERACIONES = new Set(['create', 'createMany', 'update', 'updateMany', 'upsert']);

const esObjetoPlano = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;

/** Copia de `data` con las imágenes externas localizadas (solo campos de imagen y valores JSON). */
export async function localizarData(data: unknown): Promise<unknown> {
  if (Array.isArray(data)) return Promise.all(data.map(localizarData));
  if (!esObjetoPlano(data)) return data;
  const out: Record<string, unknown> = { ...data };
  for (const [k, v] of Object.entries(data)) {
    const json = Array.isArray(v) || esObjetoPlano(v);
    if ((CAMPOS_IMAGEN.has(k) || json) && tieneImagenExterna(v)) out[k] = await localizarEnValor(v);
  }
  return out;
}

export const imagenesExternasExtension = Prisma.defineExtension({
  name: 'imagenes-externas',
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        if (!OPERACIONES.has(operation)) return query(args);
        const a = args as { data?: unknown; create?: unknown; update?: unknown };
        if (a.data !== undefined) a.data = await localizarData(a.data);
        if (a.create !== undefined) a.create = await localizarData(a.create);
        if (a.update !== undefined) a.update = await localizarData(a.update);
        return query(args);
      },
    },
  },
});
