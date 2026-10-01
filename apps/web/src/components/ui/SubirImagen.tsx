'use client';
/*
 * Botón "Subir desde el computador" para imágenes (POST /uploads). Devuelve la URL pública de cada archivo
 * subido. Valida tipo y tamaño antes de mandar (el servidor vuelve a validar por los bytes reales).
 */
import { useRef, useState } from 'react';
import { ApiError } from '../../context/AuthContext';
import { api, API_URL } from '../../lib/api';

const MAX_MB = 5;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Las rutas relativas que devuelve la API (/uploads/…) se vuelven absolutas para poder mostrarlas. */
export const urlImagen = (u: string) => (u.startsWith('/uploads/') ? `${API_URL}${u}` : u);

export function SubirImagen({
  onSubida,
  multiple = false,
  etiqueta = 'Subir desde el computador',
  className = 'ax-btn ax-btn--secondary ax-btn--sm',
}: {
  onSubida: (urls: string[]) => void;
  multiple?: boolean;
  etiqueta?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  async function alElegir(ev: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(ev.target.files ?? []);
    ev.target.value = '';
    if (!archivos.length) return;
    const mala = archivos.find((f) => !TIPOS.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (mala) return setError(`“${mala.name}”: usa JPG, PNG, WEBP o GIF de hasta ${MAX_MB} MB.`);
    setError('');
    setSubiendo(true);
    try {
      const urls: string[] = [];
      for (const f of archivos) {
        const fd = new FormData();
        fd.append('archivo', f);
        const r = await api.post<{ url: string }>('/uploads', fd);
        urls.push(r.url);
      }
      onSubida(urls);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <input ref={ref} type="file" accept={TIPOS.join(',')} multiple={multiple} hidden onChange={alElegir} />
      <button type="button" className={className} disabled={subiendo} onClick={() => ref.current?.click()}>
        {subiendo ? 'Subiendo…' : etiqueta}
      </button>
      {error && <span role="alert" style={{ color: 'var(--ax-danger-500)', fontSize: 'var(--ax-text-xs)' }}>{error}</span>}
    </span>
  );
}
