'use client';
/*
 * FPTecnologi-HUB — Tarjeta digital (Mi cuenta). Una sola entrada con dos pestañas sobre el mismo módulo /tarjetas:
 * «Mi tarjeta» (cada persona arma y gestiona la suya) y «Equipo» (solo admin y marketing de la marca activa: ver todas
 * las tarjetas, crear la de quien no tiene, editar y activar/ocultar).
 */
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MiTarjeta } from './MiTarjeta';
import { WebTarjetasEquipo } from './WebTarjetasEquipo';

type Tab = 'mia' | 'equipo';

export function TarjetaDigital() {
  const { marcas, activeMarcaId } = useAuth();
  const rol = marcas.find((m) => m.marcaId === activeMarcaId)?.rol.nombre.toLowerCase() ?? '';
  const administra = rol === 'admin' || rol === 'marketing';
  const [tab, setTab] = useState<Tab>('mia');

  return (
    <>
      {administra && (
        <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Sección" style={{ marginBlockEnd: 'var(--ax-space-4)' }}>
          {([['mia', 'Mi tarjeta'], ['equipo', 'Equipo']] as const).map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={tab === id} className={`ax-btn ax-btn--sm${tab === id ? ' is-selected' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
      )}
      {administra && tab === 'equipo' ? <WebTarjetasEquipo /> : <MiTarjeta />}
    </>
  );
}

export default TarjetaDigital;
