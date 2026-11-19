"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Estado = "inicio" | "cubrir" | "cubierta" | "revelar" | "reposo";

/** Cortina en dos capas: tapa la página al salir y la destapa al entrar (también al cargar el sitio). */
export default function Cortina() {
  const [e, setE] = useState<Estado>("inicio");
  const router = useRouter();
  const ruta = usePathname();
  const esperando = useRef(false);
  const timers = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // Carga inicial: muestra el sello un instante y destapa.
  useEffect(() => {
    t(() => setE("revelar"), 750);
    t(() => setE("reposo"), 1700);
    const limpiar = timers.current;
    return () => limpiar.forEach(clearTimeout);
  }, []);

  // Salida: SmartLink avisa con un evento; se tapa y recién ahí se navega.
  useEffect(() => {
    const salir = (ev: Event) => {
      const href = (ev as CustomEvent<string>).detail;
      timers.current.forEach(clearTimeout);
      esperando.current = true;
      setE("cubrir");
      t(() => router.push(href), 650);
      t(() => { if (esperando.current) { esperando.current = false; setE("revelar"); t(() => setE("reposo"), 900); } }, 4000); // red de seguridad
    };
    window.addEventListener("imc:salir", salir);
    return () => window.removeEventListener("imc:salir", salir);
  }, [router]);

  // Entrada: cuando cambia la ruta, destapa.
  useEffect(() => {
    if (!esperando.current) return;
    esperando.current = false;
    window.scrollTo(0, 0);
    t(() => setE("revelar"), 120);
    t(() => setE("reposo"), 1000);
  }, [ruta]);

  return (
    <div className="cortina" data-e={e} aria-hidden>
      <div className="capa capa-1" />
      <div className="capa capa-2">
        <div className="sello"><img src="/logo.svg" alt="" className="h-16 w-auto sm:h-20" /></div>
      </div>
    </div>
  );
}
