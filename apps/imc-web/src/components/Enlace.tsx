"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

/** Link interno que dispara la cortina de salida antes de navegar. Externos, anclas y ctrl+clic quedan igual. */
export default function Enlace({ href, onClick, ...rest }: ComponentProps<typeof Link>) {
  const ruta = usePathname();
  const destino = typeof href === "string" ? href : (href.pathname ?? "/");
  const alClick = (ev: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(ev);
    if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
    if (!destino.startsWith("/") || destino.startsWith("//") || destino.includes("#")) return;
    ev.preventDefault();
    if (destino.replace(/\/$/, "") === ruta.replace(/\/$/, "")) return window.scrollTo({ top: 0, behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("imc:salir", { detail: destino }));
  };
  return <Link href={href} onClick={alClick} {...rest} />;
}
