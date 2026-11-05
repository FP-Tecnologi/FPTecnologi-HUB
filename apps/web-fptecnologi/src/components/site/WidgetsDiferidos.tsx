'use client';

import dynamic from 'next/dynamic';

// Widgets flotantes: no hacen falta para pintar la página, así su JS sale del paquete inicial (se baja después).
const ChatWidget = dynamic(() => import('./ChatWidget').then((m) => m.ChatWidget), { ssr: false });
const PopupsSitio = dynamic(() => import('./PopupsSitio').then((m) => m.PopupsSitio), { ssr: false });
const PopupBbva = dynamic(() => import('./TarjetasBbvaVitrina').then((m) => m.PopupBbva), { ssr: false });
const FavoritesWidget = dynamic(() => import('./FavoritesWidget').then((m) => m.FavoritesWidget), { ssr: false });

export function WidgetsDiferidos() {
  return (
    <>
      <ChatWidget />
      <PopupsSitio />
      <PopupBbva />
      <FavoritesWidget />
    </>
  );
}
