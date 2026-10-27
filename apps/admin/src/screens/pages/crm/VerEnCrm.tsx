'use client';
/* Botón «Ver en CRM» de las bandejas (Leads, Cotizaciones, Contactos, Presupuestos): abre la oportunidad que esta
   solicitud creó o alimentó. Solo para admin y comercial (los roles del CRM). */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export function VerEnCrm({ origen, id }: { origen: 'COTIZADOR' | 'COTIZACION' | 'CONTACTO_WEB' | 'PRESUPUESTO'; id: string }) {
  const router = useRouter();
  const { marcas, activeMarcaId } = useAuth();
  const rol = marcas.find((m) => m.marcaId === activeMarcaId)?.rol.nombre;
  const [aviso, setAviso] = useState('');
  if (rol !== 'admin' && rol !== 'comercial') return null;

  async function ir() {
    setAviso('');
    try {
      const o = await api.get<{ id: string }>(`/crm/por-origen?origen=${origen}&id=${encodeURIComponent(id)}`);
      router.push(`/crm/oportunidades?id=${o.id}`);
    } catch {
      setAviso('Esta solicitud llegó antes del CRM.');
    }
  }
  return (
    <span className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
      {aviso && <span role="status" style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{aviso}</span>}
      <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={ir}><span className="ax-btn__label">Ver en CRM</span></button>
    </span>
  );
}
