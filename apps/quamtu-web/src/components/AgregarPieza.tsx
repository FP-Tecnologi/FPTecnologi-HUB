'use client';
import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { agregarAlCarrito } from '@/lib/carrito';

export default function AgregarPieza({ id, precio }: { id: string; precio: number }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        agregarAlCarrito({ tipo: 'pieza', ids: [id], total: precio });
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      }}
      className="btn-neon flex items-center justify-center gap-2 rounded-full px-8 py-4 font-display text-sm"
    >
      {ok ? <Check size={16} /> : <ShoppingCart size={16} />} {ok ? 'AÑADIDO' : 'AÑADIR AL CARRITO'}
    </button>
  );
}
