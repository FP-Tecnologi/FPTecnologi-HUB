'use client';

import { useEffect, useState } from 'react';
import { Check, Clock, Loader2, LocateFixed, MapPin, Phone } from 'lucide-react';

export type TarifaEnvio = { departamento: string; proveedor: string; costo: number; plazoDias: string | null };
type Agencia = { id: string; provincia: string; zona: string; direccion: string; telefono: string | null; horario: string; lat: number | null; lng: number | null; distanciaKm?: number; departamento?: string };
type Cercana = Agencia & { departamento: string };

const campo = 'mt-1.5 w-full rounded-xl border border-ink/15 bg-white py-3 pl-4 pr-4 text-base text-ink outline-none transition-all focus:border-brand-dark focus:ring-4 focus:ring-brand-dark/10 aria-[invalid=true]:border-rose-400';

async function pedir<T>(params: Record<string, string>): Promise<T[]> {
  try {
    const r = await fetch(`/api/hub/envios/agencias?${new URLSearchParams(params)}`);
    return ((await r.json()) as { data?: T[] }).data ?? [];
  } catch {
    return [];
  }
}

/*
 * Elige la agencia Shalom donde recogerá el cliente: por departamento -> provincia -> agencia, o con
 * "Usar mi ubicación", que ordena las 5 agencias más cercanas (la ubicación solo se usa para ordenar,
 * no se guarda). El directorio es el de Shalom; el costo sale del tarifario del departamento.
 */
export function ShalomAgencias({
  tarifas,
  departamento,
  agenciaId,
  errorDepartamento,
  errorAgencia,
  onDepartamento,
  onAgencia,
}: {
  tarifas: TarifaEnvio[];
  departamento: string;
  agenciaId: string;
  errorDepartamento?: string;
  errorAgencia?: string;
  onDepartamento: (d: string) => void;
  onAgencia: (id: string) => void;
}) {
  const [provincias, setProvincias] = useState<{ provincia: string; agencias: number }[]>([]);
  const [provincia, setProvincia] = useState('');
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [cercanas, setCercanas] = useState<Cercana[]>([]);
  const [ubicando, setUbicando] = useState(false);
  const [avisoUbicacion, setAvisoUbicacion] = useState('');

  useEffect(() => {
    setProvincia('');
    setAgencias([]);
    if (!departamento) return setProvincias([]);
    let vivo = true;
    pedir<{ provincia: string; agencias: number }>({ departamento }).then((p) => vivo && setProvincias(p));
    return () => {
      vivo = false;
    };
  }, [departamento]);

  useEffect(() => {
    if (!departamento || !provincia) return setAgencias([]);
    let vivo = true;
    pedir<Agencia>({ departamento, provincia }).then((a) => vivo && setAgencias(a));
    return () => {
      vivo = false;
    };
  }, [departamento, provincia]);

  const elegida = agencias.find((a) => a.id === agenciaId) ?? cercanas.find((a) => a.id === agenciaId);

  function usarUbicacion() {
    setAvisoUbicacion('');
    if (!navigator.geolocation) return setAvisoUbicacion('Tu navegador no permite obtener la ubicación.');
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lista = await pedir<Cercana>({ lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) });
        // Solo las que están en un departamento con envío activo.
        const conEnvio = lista.filter((a) => tarifas.some((t) => t.departamento === a.departamento));
        setCercanas(conEnvio);
        if (conEnvio[0]) {
          onDepartamento(conEnvio[0].departamento);
          onAgencia(conEnvio[0].id);
        } else {
          setAvisoUbicacion('No encontramos agencias Shalom con envío cerca de ti. Elige tu departamento manualmente.');
        }
        setUbicando(false);
      },
      () => {
        setUbicando(false);
        setAvisoUbicacion('No pudimos obtener tu ubicación. Puedes elegir tu departamento y provincia manualmente.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <button
          type="button"
          onClick={usarUbicacion}
          disabled={ubicando}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-primary/5 px-4 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/10 disabled:opacity-60"
        >
          {ubicando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" strokeWidth={2} />}
          Usar mi ubicación para encontrar la agencia más cercana
        </button>
        {avisoUbicacion && <p className="mt-2 text-sm text-amber-700">{avisoUbicacion}</p>}
      </div>

      {cercanas.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-ink/80">Agencias más cercanas a ti</legend>
          {cercanas.map((a) => (
            <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${agenciaId === a.id ? 'border-brand-primary bg-brand-primary/5' : 'border-ink/10 bg-white hover:border-brand-primary/40'}`}>
              <input type="radio" name="agencia-cercana" checked={agenciaId === a.id} onChange={() => { onDepartamento(a.departamento); onAgencia(a.id); }} className="mt-1" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{a.zona} <span className="font-normal text-ink/50">· {a.provincia}, {a.departamento}</span></span>
                <span className="block text-ink/60">{a.direccion}</span>
              </span>
              {a.distanciaKm !== undefined && <span className="shrink-0 rounded-md bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink/70">{a.distanciaKm} km</span>}
            </label>
          ))}
        </fieldset>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="co-envioDepartamento" className="text-sm font-semibold text-ink/80">Departamento de destino</label>
          <select id="co-envioDepartamento" value={departamento} onChange={(e) => { onDepartamento(e.target.value); onAgencia(''); setCercanas([]); }} aria-invalid={!!errorDepartamento} className={campo}>
            <option value="">Elige un departamento…</option>
            {tarifas.map((t) => <option key={t.departamento} value={t.departamento}>{t.departamento}</option>)}
          </select>
          {errorDepartamento && <p role="alert" className="mt-1.5 text-sm font-medium text-rose-600">{errorDepartamento}</p>}
        </div>
        <div>
          <label htmlFor="co-envioProvincia" className="text-sm font-semibold text-ink/80">Provincia</label>
          <select id="co-envioProvincia" value={provincia} disabled={!departamento} onChange={(e) => { setProvincia(e.target.value); onAgencia(''); }} className={campo}>
            <option value="">{departamento ? 'Elige una provincia…' : 'Primero el departamento'}</option>
            {provincias.map((p) => <option key={p.provincia} value={p.provincia}>{p.provincia} ({p.agencias})</option>)}
          </select>
        </div>
      </div>

      {provincia && (
        <div>
          <label htmlFor="co-envioSede" className="text-sm font-semibold text-ink/80">Agencia Shalom donde recogerás</label>
          <select id="co-envioSede" value={agenciaId} onChange={(e) => onAgencia(e.target.value)} aria-invalid={!!errorAgencia} className={campo}>
            <option value="">Elige una agencia…</option>
            {agencias.map((a) => <option key={a.id} value={a.id}>{a.zona} — {a.direccion.slice(0, 60)}</option>)}
          </select>
        </div>
      )}
      {errorAgencia && <p id="co-envioSede-error" role="alert" className="text-sm font-medium text-rose-600">{errorAgencia}</p>}

      {elegida && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-emerald-700"><Check className="h-4 w-4" strokeWidth={3} />{elegida.zona}</p>
          <p className="mt-1 flex items-start gap-2 text-ink/70"><MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />{elegida.direccion}</p>
          {elegida.horario && <p className="mt-1 flex items-start gap-2 text-ink/70"><Clock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />{elegida.horario}</p>}
          {elegida.telefono && <p className="mt-1 flex items-start gap-2 text-ink/70"><Phone className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />{elegida.telefono}</p>}
        </div>
      )}
    </div>
  );
}
