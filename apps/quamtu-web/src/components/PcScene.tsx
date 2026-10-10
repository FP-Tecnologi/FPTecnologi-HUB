'use client';
// PC procedural detallado (sin modelos .glb). Todo se arma pieza a pieza con animación de entrada/salida:
// gabinete (estructura, paneles, ventiladores), placa, CPU, refrigeración, RAM, SSD, GPU, fuente y cables.
// Con `etiquetas` cada pieza muestra un marcador (modelo, precio, enlace al producto) y es clicable.
// Si hay un .glb para una pieza (lib/modelos.ts) reemplaza al procedural.
import { createContext, Suspense, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Edges, Environment, Grid, Html, Lightformer, Line, OrbitControls, Sparkles, useGLTF, useTexture } from '@react-three/drei';
import { CatmullRomCurve3, MathUtils, Vector3, type Group, type Material } from 'three';
import type { Cat, Opcion, Seleccion } from '@/lib/piezas';
import { MODELOS, type Modelo } from '@/lib/modelos';

const H = 3.8; // alto base del gabinete
const W = 3.2;
const D = 1.9;
const PCB = '#14233f';
const SLOT = '#2a3a58';
type V3 = [number, number, number];

const modeloDe = (o?: Opcion) => (o ? (MODELOS[o.id] ?? MODELOS[o.cat]) : undefined);
const Ctx = createContext<{ setHover: (id: string | null) => void; interactivo: boolean; instantaneo: boolean }>({ setHover: () => {}, interactivo: false, instantaneo: false });

function Glb({ m }: { m: Modelo }) {
  const { scene } = useGLTF(m.url);
  const copia = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={copia} scale={m.escala ?? 1} position={m.pos ?? [0, 0, 0]} rotation={m.rot ?? [0, 0, 0]} />;
}

type Mat = Material & { opacity: number; transparent: boolean };

/* Entrada/salida con resorte: la pieza llega desde `desde` girando, con un pequeño rebote y fundido;
   al quitarla hace el camino inverso. `delay` escalona las piezas de un mismo conjunto. */
function Aparece({
  on, children, desde = [0, 1.8, 0], delay = 0, spin = 0.9, modelo, opcion,
}: { on: boolean; children: ReactNode; desde?: V3; delay?: number; spin?: number; modelo?: Modelo; opcion?: Opcion }) {
  const ref = useRef<Group>(null);
  const x = useRef(0);
  const v = useRef(0);
  const t0 = useRef<number | null>(null);
  const prev = useRef(on);
  const mats = useRef<{ m: Mat; base: number; trans: boolean }[] | null>(null);
  const solido = useRef(true);
  const { setHover, interactivo, instantaneo } = useContext(Ctx);
  const colocada = useRef(false);

  useFrame((st, dtRaw) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.05);
    // Modo instantáneo (hero con imagen fija): la pieza nace ya armada, sin entrada animada.
    if (instantaneo && !colocada.current) {
      colocada.current = true;
      x.current = on ? 1 : 0;
      v.current = 0;
      prev.current = on;
      t0.current = st.clock.elapsedTime;
      g.visible = on;
      g.position.set(0, 0, 0);
      g.rotation.y = 0;
      g.scale.setScalar(1);
      return;
    }
    if (t0.current === null || prev.current !== on) {
      prev.current = on;
      t0.current = st.clock.elapsedTime;
    }
    const listo = st.clock.elapsedTime - t0.current >= (on ? delay : 0);
    const meta = on && listo ? 1 : 0;
    if (x.current === meta && v.current === 0) return;
    v.current += ((meta - x.current) * 75 - v.current * 9.5) * dt;
    x.current += v.current * dt;
    if (Math.abs(meta - x.current) < 0.0008 && Math.abs(v.current) < 0.002) {
      x.current = meta;
      v.current = 0;
    }
    const e = x.current;
    const q = 1 - e;
    g.visible = e > 0.01 || meta === 1;
    g.position.set(desde[0] * q, desde[1] * q, desde[2] * q);
    g.rotation.y = spin * q;
    g.scale.setScalar(Math.max(0.001, 0.65 + 0.35 * e));
    if (!mats.current && g.visible) {
      const lista: { m: Mat; base: number; trans: boolean }[] = [];
      g.traverse((o) => {
        const mm = (o as unknown as { material?: Mat | Mat[] }).material;
        (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((m) => lista.push({ m, base: m.opacity, trans: m.transparent }));
      });
      mats.current = lista;
    }
    const op = MathUtils.clamp(e, 0, 1);
    if (mats.current) {
      if (op < 0.995) {
        mats.current.forEach((r) => {
          r.m.transparent = true;
          r.m.opacity = r.base * op;
          if (solido.current) r.m.needsUpdate = true;
        });
        solido.current = false;
      } else if (!solido.current) {
        mats.current.forEach((r) => {
          r.m.transparent = r.trans;
          r.m.opacity = r.base;
          r.m.needsUpdate = true;
        });
        solido.current = true;
      }
    }
  });

  const manejadores =
    interactivo && opcion
      ? {
          onPointerOver: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            setHover(opcion.id);
            document.body.style.cursor = 'pointer';
          },
          onPointerOut: () => {
            setHover(null);
            document.body.style.cursor = '';
          },
          onClick: (e: ThreeEvent<MouseEvent>) => {
            if (e.delta > 6) return; // fue un arrastre, no un clic
            e.stopPropagation();
            window.open(`/producto/${opcion.id}`, '_blank');
          },
        }
      : {};

  return (
    <group ref={ref} visible={false} {...manejadores}>
      {modelo ? (
        <Suspense fallback={null}>
          <Glb m={modelo} />
        </Suspense>
      ) : (
        children
      )}
    </group>
  );
}

/* ---------- materiales y utilidades ---------- */
function Metal({ c = '#0e131b', r = 0.42, m = 0.85 }: { c?: string; r?: number; m?: number }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={m} />;
}
function Led({ color, i = 1.6 }: { color: string; i?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={i} toneMapped={false} />;
}
function Caja({ p, s, children, rot }: { p: V3; s: V3; children: ReactNode; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot}>
      <boxGeometry args={s} />
      {children}
    </mesh>
  );
}
function Cil({ p, r, h, children, rot }: { p: V3; r: number; h: number; children: ReactNode; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot}>
      <cylinderGeometry args={[r, r, h, 16]} />
      {children}
    </mesh>
  );
}

// Logo Quamtu (blanco) como plano; w = ancho en unidades de escena.
function Logo({ p, w = 0.8, rot, op = 0.95 }: { p: V3; w?: number; rot?: V3; op?: number }) {
  const t = useTexture('/brand/logo-blanco.png');
  return (
    <mesh position={p} rotation={rot}>
      <planeGeometry args={[w, (w * 184) / 700]} />
      <meshBasicMaterial map={t} transparent opacity={op} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function Cable({ pts, r = 0.028 }: { pts: V3[]; r?: number }) {
  const curva = useMemo(() => new CatmullRomCurve3(pts.map((q) => new Vector3(...q))), [pts]);
  return (
    <mesh>
      <tubeGeometry args={[curva, 28, r, 8, false]} />
      <meshStandardMaterial color="#05070b" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// Ventilador: marco cuadrado, aspas curvadas, buje con anillo LED.
function Ventilador({ color, r = 0.34, vel = 3, marco = true }: { color: string; r?: number; vel?: number; marco?: boolean }) {
  const aspas = useRef<Group>(null);
  useFrame((_, dt) => {
    if (aspas.current) aspas.current.rotation.z += dt * vel;
  });
  const L = r * 2.3;
  const g = 0.035;
  return (
    <group>
      {marco &&
        ([
          [0, L / 2, L, g],
          [0, -L / 2, L, g],
          [L / 2, 0, g, L],
          [-L / 2, 0, g, L],
        ] as const).map(([x, y, w, h], i) => (
          <Caja key={i} p={[x, y, 0]} s={[w, h, 0.07]}>
            <Metal c="#0a0e14" r={0.55} m={0.5} />
          </Caja>
        ))}
      <mesh>
        <torusGeometry args={[r * 1.02, 0.014, 8, 48]} />
        <Led color={color} i={1.8} />
      </mesh>
      <group ref={aspas}>
        {Array.from({ length: 9 }, (_, i) => (
          <group key={i} rotation={[0, 0, (i / 9) * Math.PI * 2]}>
            <mesh position={[r * 0.5, 0, 0]} rotation={[0.55, 0, 0.12]}>
              <boxGeometry args={[r * 0.78, 0.13, 0.008]} />
              <meshStandardMaterial color="#10151d" roughness={0.5} metalness={0.4} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r * 0.2, r * 0.2, 0.05, 20]} />
          <Metal c="#0a0e14" />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.11, r * 0.11, 0.01, 16]} />
        <Led color={color} i={2.2} />
      </mesh>
    </group>
  );
}

/* ---------- base de armado (pedestal) ---------- */
function Pedestal({ y, color }: { y: number; color: string }) {
  const g = useRef<Group>(null);
  const arcos = useRef<Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.position.y = MathUtils.damp(g.current.position.y, y, 5, dt);
    if (arcos.current) arcos.current.rotation.z += dt * 0.5;
  });
  return (
    <group ref={g} position={[0, y, 0]}>
      {/* dos escalones de metal */}
      <Cil p={[0, -0.09, 0]} r={2.75} h={0.18}><Metal c="#0a0e16" r={0.35} m={0.9} /></Cil>
      <Cil p={[0, -0.27, 0]} r={3.0} h={0.18}><Metal c="#070a11" r={0.45} m={0.8} /></Cil>
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.6, 2.66, 96]} />
        <Led color={color} i={1.2} />
      </mesh>
      {/* arcos que giran */}
      <group ref={arcos} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        {[0, 2.1, 4.2].map((a) => (
          <mesh key={a}>
            <ringGeometry args={[2.38, 2.46, 48, 1, a, 1.1]} />
            <Led color={color} i={2.2} />
          </mesh>
        ))}
      </group>
      {/* marcas de graduación en el borde inferior */}
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2;
        return (
          <Caja key={i} p={[Math.cos(a) * 2.99, -0.27, Math.sin(a) * 2.99]} s={[0.02, i % 6 === 0 ? 0.12 : 0.06, 0.02]} rot={[0, -a, 0]}>
            <Led color={color} i={0.9} />
          </Caja>
        );
      })}
      <Logo p={[0, 0.008, 2.15]} w={0.9} rot={[-Math.PI / 2, 0, 0]} op={0.7} />
    </group>
  );
}

/* ---------- etiquetas: punto sobre la pieza + línea punteada hacia una tarjeta a un lado del gabinete ---------- */
const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

function Etiqueta({ o, p, q, lado, activa, setHover }: { o: Opcion; p: V3; q: V3; lado: 'izq' | 'der'; activa: boolean; setHover: (id: string | null) => void }) {
  const eventos = { onMouseEnter: () => setHover(o.id), onMouseLeave: () => setHover(null) };
  return (
    <>
      <Line points={[p, q]} color={activa ? '#ffffff' : '#6cc3ee'} lineWidth={activa ? 1.6 : 1.1} dashed dashSize={0.07} gapSize={0.06} transparent opacity={activa ? 0.95 : 0.65} />
      {/* punto sobre la pieza */}
      <Html position={p} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
        <span className="relative flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2" style={{ pointerEvents: 'auto' }} {...eventos}>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-claro opacity-70" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-cyan" />
        </span>
      </Html>
      {/* tarjeta al costado */}
      <Html position={q} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
        <a
          href={`/producto/${o.id}`}
          target="_blank"
          rel="noreferrer"
          {...eventos}
          className={`hud absolute top-0 block -translate-y-1/2 p-2.5 text-left text-white no-underline transition-colors ${lado === 'der' ? 'left-0' : 'right-0'} w-52 border-white`}
          style={{ pointerEvents: 'auto' }}
        >
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/productos/${o.id}.jpg`} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="h-12 w-12 shrink-0 rounded bg-bg/70 object-contain" />
            <span className="min-w-0">
              <span className="block font-display text-[9px] tracking-[0.2em] text-claro">{o.cat.toUpperCase()}</span>
              <span className="block font-display text-[13px] font-bold leading-tight">{o.nombre}</span>
            </span>
          </span>
          {activa && <span className="mt-1 block text-[11px] leading-snug text-slate-300">{o.spec}</span>}
          <span className="mt-1 flex items-center justify-between">
            <b className="font-display text-sm text-claro">{soles(o.precio)}</b>
            {activa && <span className="text-[10px] text-white/80">Ver producto →</span>}
          </span>
        </a>
      </Html>
    </>
  );
}

/* ---------- escena ---------- */
function Escena({ sel, etiquetas, foco, solo, instantaneo }: { sel: Seleccion; etiquetas: boolean; foco?: string; solo: boolean; instantaneo: boolean }) {
  const { gabinete: g, cpu, placa, ram, gpu, ssd, cooler, fuente } = sel;
  const [hover, setHoverRaw] = useState<string | null>(null);
  const salida = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Al salir del 3D la etiqueta espera un instante, para poder pasar el mouse hacia su tarjeta.
  const setHover = (id: string | null) => {
    clearTimeout(salida.current);
    if (id) setHoverRaw(id);
    else salida.current = setTimeout(() => setHoverRaw(null), 280);
  };
  const s = g?.n ?? 1;
  const acento = g?.color ?? '#4a6283';
  const gpuColor = gpu?.color ?? '#6cc3ee';
  const hw = (W * s) / 2;
  const hh = (H * s) / 2;
  const cc = placa?.color ?? '#238DC1';
  const rearX = -hw - 0.03; // pared trasera del PC (la cara con los conectores)

  // Punto sobre cada pieza y lado del gabinete donde se coloca su tarjeta.
  const puntos: Record<Cat, V3> = {
    cpu: [-0.2, 0.75, -0.4],
    placa: [-1.0, 1.1, -0.5],
    ram: [0.3, 1.3, -0.5],
    gpu: [0.5, -0.2, 0.1],
    ssd: [-0.7, 0.0, -0.5],
    cooler: cooler && (cooler.n ?? 1) > 1 ? [-0.45, 1.58 * s, 0.1] : [-0.2, 1.3, -0.1],
    fuente: [0.9, -hh + 0.6, 0.8],
    gabinete: [hw, hh, D / 2],
  };
  const lados: Record<Cat, 'izq' | 'der'> = { cpu: 'izq', placa: 'izq', ssd: 'izq', cooler: 'izq', ram: 'der', gpu: 'der', fuente: 'der', gabinete: 'der' };
  const destinos = {} as Record<Cat, V3>;
  (['izq', 'der'] as const).forEach((lado) => {
    const cats = (Object.keys(puntos) as Cat[]).filter((c) => sel[c] && lados[c] === lado).sort((x, y) => puntos[y][1] - puntos[x][1]);
    cats.forEach((c, i) => {
      const y = cats.length === 1 ? puntos[c][1] : hh - 0.4 - (i * (2 * hh - 0.8)) / (cats.length - 1);
      destinos[c] = [lado === "der" ? hw + 0.7 : -(hw + 1.1), y, 0.5];
    });
  });

  return (
    <Ctx.Provider value={{ setHover, interactivo: etiquetas, instantaneo }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 7]} intensity={1.4} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 4]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-6, 1, 3]} scale={[3, 8, 1]} color="#6cc3ee" />
        <Lightformer form="rect" intensity={1.2} position={[6, 0, -2]} scale={[3, 8, 1]} color="#385cad" />
      </Environment>
      {solo && (
        <>
          <hemisphereLight args={['#bcd8f0', '#10203a', 1.3]} />
          <directionalLight position={[-5, 3, 3]} intensity={2.4} color="#6cc3ee" />
          <directionalLight position={[3, 2, 7]} intensity={2.6} />
          <directionalLight position={[2, 6, -3]} intensity={1.6} color="#9fd0ff" />
        </>
      )}
      {gpu && <pointLight position={[0, -0.4, 0.6]} color={gpuColor} intensity={3} distance={4.5} />}
      {cooler && <pointLight position={[-0.3, 1.2, 0.3]} color={cooler.color} intensity={2.5} distance={3.5} />}
      {ram && <pointLight position={[0.3, 0.8, 0]} color={ram.color} intensity={1.6} distance={2.5} />}

      {/* Cristal y contorno fantasma (siempre) */}
      {(!solo || g) && (<>
      <mesh position={[0, 0, D / 2]} scale={[s, s, 1]}>
        <planeGeometry args={[W, H]} />
        <meshPhysicalMaterial color="#9fc6e6" transparent opacity={g ? 0.07 : 0.03} roughness={0.04} metalness={0.2} depthWrite={false} />
      </mesh>
      <mesh scale={[s, s, 1]}>
        <boxGeometry args={[W, H, D]} />
        <meshBasicMaterial visible={false} />
        <Edges color={g ? acento : '#2c3f5c'} threshold={15} />
      </mesh>
      </>)}

      {/* GABINETE: cada conjunto de piezas entra por su lado, escalonado */}
      <group key={g?.id ?? 'sin-gabinete'}>
        <Aparece on={!!g} desde={[0, -1.4, 0]} delay={0} opcion={g}>
          {[hw, -hw].flatMap((px) => [D / 2, -D / 2].map((z) => (
            <Caja key={`${px}${z}`} p={[px, 0, z]} s={[0.1, H * s, 0.1]}><Metal c="#0b0f16" r={0.5} /></Caja>
          )))}
          {[hw - 0.2, -hw + 0.2].flatMap((px) => [D / 2 - 0.2, -D / 2 + 0.2].map((z) => (
            <Caja key={`p${px}${z}`} p={[px, -hh - 0.1, z]} s={[0.22, 0.1, 0.22]}><Metal c="#05070b" /></Caja>
          )))}
          <Caja p={[0, -hh - 0.17, 0]} s={[W * s + 0.1, 0.03, D + 0.1]}><Led color={acento} i={0.7} /></Caja>
        </Aparece>
        <Aparece on={!!g} desde={[0, 2.2, 0]} delay={0.15} spin={0.4}>
          <Caja p={[0, hh, 0]} s={[W * s, 0.1, D]}><Metal c="#0b0f16" r={0.5} /></Caja>
          <Caja p={[0, -hh, 0]} s={[W * s, 0.1, D]}><Metal c="#0b0f16" r={0.5} /></Caja>
        </Aparece>
        <Aparece on={!!g} desde={[0, 0, -2.4]} delay={0.3} spin={0.3}>
          <Caja p={[0, 0, -D / 2]} s={[W * s, H * s, 0.04]}><Metal c="#080b11" r={0.6} m={0.6} /></Caja>
        </Aparece>
        {/* pared trasera con conectores */}
        <Aparece on={!!g} desde={[-2.4, 0, 0]} delay={0.45} spin={0.3}>
          <Caja p={[-hw, 0, 0]} s={[0.04, H * s - 0.1, D - 0.1]}><Metal c="#080b11" r={0.55} m={0.7} /></Caja>
          {/* ranuras de expansión */}
          {Array.from({ length: 4 }, (_, i) => (
            <Caja key={i} p={[rearX, -0.9 + i * 0.13, -0.1]} s={[0.012, 0.09, 0.5]}><Metal c="#9aa6b5" r={0.35} m={0.95} /></Caja>
          ))}
          <Logo p={[rearX - 0.002, hh - 0.3, 0.55]} w={0.5} rot={[0, -Math.PI / 2, 0]} />
        </Aparece>
        {/* ventilador de escape trasero */}
        <Aparece on={!!g} desde={[-2.2, 0.8, 0]} delay={0.65}>
          <group position={[-hw + 0.04, 0.95 * s + 0.35, 0.3]} rotation={[0, -Math.PI / 2, 0]}>
            <Ventilador color={acento} r={0.3} vel={4} />
          </group>
        </Aparece>
        {/* panel frontal derecho con rejilla Turing y 3 ventiladores */}
        <Aparece on={!!g} desde={[2.4, 0, 0]} delay={0.8} spin={-0.4}>
          <Caja p={[hw + 0.03, 0, 0]} s={[0.05, H * s - 0.1, D - 0.1]}><Metal c="#090c12" r={0.55} m={0.7} /></Caja>
          {Array.from({ length: 12 }, (_, i) => (
            <Caja key={i} p={[hw + 0.065, -hh + 0.25 + i * ((H * s - 0.5) / 11), 0]} s={[0.012, 0.07, D * (0.35 + 0.5 * ((i * 7) % 5) / 5)]}>
              <meshStandardMaterial color="#04060a" roughness={0.9} />
            </Caja>
          ))}
          <Logo p={[hw + 0.075, hh - 0.35, -D / 2 + 0.55]} w={0.55} rot={[0, Math.PI / 2, 0]} />
        </Aparece>
        {[0.9, 0, -0.9].map((yy, i) => (
          <Aparece key={yy} on={!!g} desde={[2.6, 0.4, 0]} delay={0.95 + i * 0.12}>
            <group position={[hw - 0.02, yy * s, 0]} rotation={[0, Math.PI / 2, 0]}>
              <Ventilador color={acento} r={0.3} vel={4} />
            </group>
          </Aparece>
        ))}
      </group>

      {/* PLACA MADRE */}
      <Aparece on={!!placa} desde={[-1.2, 1.4, -0.4]} opcion={placa} modelo={modeloDe(placa)}>
        <Caja p={[-0.35, 0.35, -0.72]} s={[2.0, 2.4, 0.05]}>
          <meshStandardMaterial color={PCB} roughness={0.45} metalness={0.5} />
          <Edges color={cc} />
        </Caja>
        {/* tornillos */}
        {([[-1.28, 1.48], [0.58, 1.48], [-1.28, -0.78], [0.58, -0.78], [-1.28, 0.35], [0.58, 0.35]] as const).map(([px, py]) => (
          <Cil key={`${px}${py}`} p={[px, py, -0.688]} r={0.025} h={0.02} rot={[Math.PI / 2, 0, 0]}><Metal c="#c4ccd6" r={0.25} m={1} /></Cil>
        ))}
        {/* blindaje de I/O con nervaduras */}
        <Caja p={[-1.0, 1.1, -0.62]} s={[0.7, 0.85, 0.12]}><Metal c="#1a2538" r={0.35} /></Caja>
        {Array.from({ length: 7 }, (_, i) => (
          <Caja key={i} p={[-1.0, 0.8 + i * 0.1, -0.555]} s={[0.62, 0.02, 0.012]}><Metal c="#3a4a66" r={0.3} /></Caja>
        ))}
        <Caja p={[-1.0, 1.54, -0.555]} s={[0.7, 0.025, 0.012]}><Led color={cc} i={1.6} /></Caja>
        {/* VRM: inductores (chokes) y condensadores bajo el disipador */}
        {Array.from({ length: 6 }, (_, i) => (
          <Caja key={`ch${i}`} p={[-0.62, 0.45 + i * 0.1, -0.665]} s={[0.1, 0.07, 0.05]}><Metal c="#3a4a66" r={0.3} /></Caja>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <Caja key={`cht${i}`} p={[-0.52 + i * 0.1, 1.28, -0.665]} s={[0.07, 0.1, 0.05]}><Metal c="#3a4a66" r={0.3} /></Caja>
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <Cil key={`cap${i}`} p={[-0.76, 0.5 + i * 0.12, -0.67]} r={0.032} h={0.07} rot={[Math.PI / 2, 0, 0]}><Metal c="#d7dce6" r={0.3} m={0.9} /></Cil>
        ))}
        {/* disipador VRM superior */}
        <Caja p={[-0.1, 1.42, -0.63]} s={[1.1, 0.16, 0.13]}><Metal c="#1a2538" r={0.35} /></Caja>
        {Array.from({ length: 12 }, (_, i) => (
          <Caja key={i} p={[-0.6 + i * 0.1, 1.42, -0.558]} s={[0.012, 0.15, 0.012]}><Metal c="#4a5b7a" r={0.3} /></Caja>
        ))}
        {/* conector de energía CPU 8 pines (arriba) */}
        <Caja p={[0.38, 1.48, -0.655]} s={[0.34, 0.1, 0.07]}><Metal c="#dfe4ec" r={0.5} m={0.2} /></Caja>
        {Array.from({ length: 4 }, (_, i) => (
          <Caja key={i} p={[0.27 + i * 0.075, 1.48, -0.617]} s={[0.05, 0.06, 0.01]}><Metal c="#05070b" r={0.7} m={0.1} /></Caja>
        ))}
        {/* socket CPU: marco, pines dorados y palanca */}
        <Caja p={[-0.2, 0.75, -0.685]} s={[0.62, 0.62, 0.03]}><Metal c="#b6c0cf" r={0.3} m={0.95} /></Caja>
        <Caja p={[-0.2, 0.75, -0.668]} s={[0.5, 0.5, 0.006]}><Metal c="#b8963c" r={0.3} m={1} /></Caja>
        <Cil p={[0.14, 0.75, -0.655]} r={0.012} h={0.5}><Metal c="#e4e9f1" r={0.25} m={1} /></Cil>
        {/* ranuras RAM con seguros */}
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i}>
            <Caja p={[0.12 + i * 0.11, 0.78, -0.675]} s={[0.065, 1.08, 0.04]}><Metal c={SLOT} r={0.5} m={0.3} /></Caja>
            <Caja p={[0.12 + i * 0.11, 1.34, -0.665]} s={[0.06, 0.05, 0.06]}><Metal c="#dfe4ec" r={0.5} m={0.2} /></Caja>
            <Caja p={[0.12 + i * 0.11, 0.22, -0.665]} s={[0.06, 0.05, 0.06]}><Metal c="#dfe4ec" r={0.5} m={0.2} /></Caja>
          </group>
        ))}
        {/* conector 24 pines (borde derecho) */}
        <Caja p={[0.57, 0.35, -0.65]} s={[0.11, 0.78, 0.07]}><Metal c="#dfe4ec" r={0.5} m={0.2} /></Caja>
        {Array.from({ length: 12 }, (_, i) => (
          <Caja key={i} p={[0.575, 0.0 + i * 0.062, -0.612]} s={[0.07, 0.04, 0.01]}><Metal c="#05070b" r={0.7} m={0.1} /></Caja>
        ))}
        {/* ranuras PCIe (x16 y x1) */}
        <Caja p={[-0.35, -0.55, -0.675]} s={[1.5, 0.07, 0.04]}><Metal c={SLOT} r={0.5} m={0.3} /></Caja>
        <Caja p={[-0.7, -0.35, -0.675]} s={[0.5, 0.06, 0.04]}><Metal c={SLOT} r={0.5} m={0.3} /></Caja>
        <Caja p={[-0.7, -0.15, -0.675]} s={[0.5, 0.06, 0.04]}><Metal c={SLOT} r={0.5} m={0.3} /></Caja>
        <Caja p={[-0.35, -0.55, -0.652]} s={[1.46, 0.012, 0.005]}><Led color={cc} i={1.3} /></Caja>
        {/* M.2 + disipador del chipset + SATA + headers */}
        <Caja p={[-0.7, 0.0, -0.66]} s={[0.55, 0.14, 0.05]}><Metal c="#223049" r={0.3} /></Caja>
        <Caja p={[0.15, -0.38, -0.655]} s={[0.6, 0.34, 0.07]}><Metal c="#1a2538" r={0.35} /></Caja>
        {Array.from({ length: 6 }, (_, i) => (
          <Caja key={i} p={[0.15, -0.5 + i * 0.05, -0.615]} s={[0.5, 0.012, 0.012]}><Metal c="#4a5b7a" r={0.3} /></Caja>
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <Caja key={i} p={[0.5, -0.45 - i * 0.1, -0.665]} s={[0.12, 0.07, 0.05]}><Metal c="#1b222f" r={0.6} m={0.2} /></Caja>
        ))}
        {Array.from({ length: 3 }, (_, i) => (
          <Caja key={i} p={[-1.1 + i * 0.18, -0.78, -0.668]} s={[0.12, 0.05, 0.04]}><Metal c="#dfe4ec" r={0.5} m={0.2} /></Caja>
        ))}
        {/* pistas luminosas */}
        <Caja p={[0.2, -0.75, -0.69]} s={[0.9, 0.012, 0.01]}><Led color={cc} i={1.6} /></Caja>
        <Caja p={[-0.95, -0.3, -0.69]} s={[0.012, 0.9, 0.01]}><Led color={cc} i={1.2} /></Caja>
        {/* bloque de puertos del panel trasero (se ven desde atrás) */}
        <group position={[rearX, 1.1, -0.62]}>
          <Caja p={[0, 0, 0]} s={[0.08, 0.86, 0.72]}><Metal c="#9aa6b5" r={0.35} m={0.95} /></Caja>
          {Array.from({ length: 4 }, (_, i) => (
            <Caja key={`u${i}`} p={[-0.045, 0.3 - (i % 2) * 0.13, -0.2 + Math.floor(i / 2) * 0.16]} s={[0.03, 0.09, 0.13]}><Metal c="#1f6fd6" r={0.5} m={0.2} /></Caja>
          ))}
          {Array.from({ length: 2 }, (_, i) => (
            <Caja key={`c${i}`} p={[-0.045, 0.3 - 0.26, -0.2 + i * 0.16]} s={[0.03, 0.07, 0.12]}><Metal c="#05070b" r={0.6} m={0.2} /></Caja>
          ))}
          <Caja p={[-0.045, 0.0, 0.0]} s={[0.03, 0.14, 0.16]}><Metal c="#0a0e14" r={0.6} m={0.3} /></Caja>
          <Caja p={[-0.045, 0.0, 0.2]} s={[0.03, 0.08, 0.14]}><Metal c="#05070b" r={0.6} m={0.2} /></Caja>
          {['#3fb950', '#3b82f6', '#e11d48', '#f59e0b', '#a3a3a3'].map((c, i) => (
            <Cil key={c} p={[-0.05, -0.18 - i * 0.1, 0.18]} r={0.035} h={0.04} rot={[0, 0, Math.PI / 2]}><Metal c={c} r={0.4} m={0.5} /></Cil>
          ))}
          {[-0.24, -0.12].map((z) => (
            <Cil key={z} p={[-0.06, 0.38, z]} r={0.03} h={0.06} rot={[0, 0, Math.PI / 2]}><Metal c="#c9a24a" r={0.3} m={1} /></Cil>
          ))}
        </group>
      </Aparece>

      {/* CPU con tapa metálica y grabado */}
      <Aparece on={!!cpu} desde={[0, 2.2, 0.6]} delay={0.1} opcion={cpu} modelo={modeloDe(cpu)}>
        <Caja p={[-0.2, 0.75, -0.668]} s={[0.54, 0.54, 0.018]}><Metal c="#2a7a66" r={0.5} m={0.2} /></Caja>
        <Caja p={[-0.2, 0.75, -0.645]} s={[0.44, 0.44, 0.045]}><Metal c="#c9d0da" r={0.25} m={0.95} /></Caja>
        <Caja p={[-0.2, 0.75, -0.62]} s={[0.34, 0.34, 0.004]}><Metal c="#8e99a8" r={0.3} m={1} /></Caja>
        <Caja p={[-0.2, 0.8, -0.617]} s={[0.22, 0.02, 0.003]}><Led color={cpu?.color ?? '#238DC1'} i={0.8} /></Caja>
        <Caja p={[-0.2, 0.72, -0.617]} s={[0.16, 0.012, 0.003]}><Led color={cpu?.color ?? '#238DC1'} i={0.5} /></Caja>
        <Caja p={[-0.2, 0.7, -0.617]} s={[0.12, 0.012, 0.003]}><Led color={cpu?.color ?? '#238DC1'} i={0.5} /></Caja>
        <Caja p={[-0.4, 0.55, -0.62]} s={[0.04, 0.04, 0.004]}><Led color="#f5b942" i={1} /></Caja>
      </Aparece>

      {/* REFRIGERACIÓN: torre (n=1) o líquida con radiador (n>=2) */}
      <Aparece on={!!cooler} desde={[0, 2.4, 0.4]} delay={0.1} opcion={cooler} modelo={modeloDe(cooler)}>
        {cooler && cooler.n === 1 && (
          <group position={[-0.2, 0.75, -0.4]}>
            <Caja p={[0, -0.5, 0.05]} s={[0.5, 0.06, 0.4]}><Metal c="#c4ccd6" r={0.3} m={0.95} /></Caja>
            {Array.from({ length: 16 }, (_, i) => (
              <Caja key={i} p={[0, -0.42 + i * 0.058, 0]} s={[0.52, 0.018, 0.34]}><Metal c="#3a4a66" r={0.3} /></Caja>
            ))}
            {[-0.15, 0, 0.15].map((px) => (
              <mesh key={px} position={[px, 0, 0.17]}>
                <cylinderGeometry args={[0.018, 0.018, 0.95, 8]} />
                <Metal c="#c4ccd6" r={0.25} m={1} />
              </mesh>
            ))}
            <Caja p={[0, 0.5, 0]} s={[0.54, 0.05, 0.36]}><Metal c="#0a0e14" r={0.35} /></Caja>
            <Logo p={[0, 0.526, 0]} w={0.38} rot={[-Math.PI / 2, 0, 0]} />
            <group position={[0, 0, 0.26]}>
              <Ventilador color={cooler.color} r={0.25} vel={4} />
            </group>
          </group>
        )}
        {cooler && (cooler.n ?? 1) > 1 && (
          <group>
            <mesh position={[-0.2, 0.75, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 0.2, 32]} />
              <Metal c="#0a0e14" r={0.3} />
            </mesh>
            <mesh position={[-0.2, 0.75, -0.445]}>
              <torusGeometry args={[0.215, 0.018, 8, 40]} />
              <Led color={cooler.color} i={2} />
            </mesh>
            <Logo p={[-0.2, 0.75, -0.44]} w={0.3} />
            {(() => {
              const n = cooler.n ?? 2;
              const ancho = n * 0.62;
              return (
                <group position={[-0.45, 1.58 * s, -0.2]}>
                  <Caja p={[0, 0, 0]} s={[ancho, 0.16, 0.66]}><Metal c="#0a0e14" r={0.4} /></Caja>
                  {Array.from({ length: n * 8 }, (_, i) => (
                    <Caja key={i} p={[-ancho / 2 + 0.04 + i * ((ancho - 0.08) / (n * 8 - 1)), 0, 0.331]} s={[0.012, 0.15, 0.004]}><Metal c="#4a5b7a" r={0.3} /></Caja>
                  ))}
                  {Array.from({ length: n }, (_, i) => (
                    <group key={i} position={[-ancho / 2 + 0.31 + i * 0.62, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                      <Ventilador color={cooler.color} r={0.25} vel={4} />
                    </group>
                  ))}
                </group>
              );
            })()}
            <Cable pts={[[-0.1, 0.9, -0.55], [0.05, 1.2, -0.5], [-0.05, 1.5 * s, -0.4]]} r={0.04} />
            <Cable pts={[[-0.3, 0.9, -0.55], [-0.45, 1.25, -0.5], [-0.55, 1.5 * s, -0.4]]} r={0.04} />
          </group>
        )}
      </Aparece>

      {/* RAM */}
      <Aparece on={!!ram} desde={[1.4, 2.2, 0]} delay={0.1} opcion={ram} modelo={modeloDe(ram)}>
        {ram &&
          Array.from({ length: ram.n ?? 2 }, (_, i) => (
            <group key={i} position={[0.12 + i * 0.11, 0.78, -0.6]}>
              <Caja p={[0, 0, 0]} s={[0.075, 1.0, 0.13]}><Metal c="#10151d" r={0.4} /></Caja>
              <Caja p={[0, -0.48, 0]} s={[0.07, 0.05, 0.1]}><Metal c="#c9a24a" r={0.3} m={1} /></Caja>
              <Caja p={[0.039, 0, 0]} s={[0.005, 0.55, 0.1]}><Metal c="#2a3a58" r={0.25} /></Caja>
              <Caja p={[0, 0.52, 0]} s={[0.078, 0.07, 0.135]}><Led color={ram.color} i={2.2} /></Caja>
              <Logo p={[0.043, -0.1, 0]} w={0.3} rot={[0, Math.PI / 2, 0]} op={0.8} />
            </group>
          ))}
      </Aparece>

      {/* SSD M.2 */}
      <Aparece on={!!ssd} desde={[-1.6, 0.6, 0.8]} delay={0.1} opcion={ssd} modelo={modeloDe(ssd)}>
        {ssd && <Caja p={[-0.7, 0.0, -0.625]} s={[0.55, 0.13, 0.03]}><Metal c="#2a3d5f" r={0.3} /></Caja>}
        {ssd && <Caja p={[-0.7, 0.0, -0.607]} s={[0.4, 0.02, 0.006]}><Led color={ssd.color} i={1.4} /></Caja>}
        {ssd && (ssd.n ?? 1) > 1 && <Caja p={[0.15, -0.38, -0.58]} s={[0.4, 0.06, 0.02]}><Metal c="#2a3d5f" r={0.3} /></Caja>}
      </Aparece>

      {/* GPU */}
      <Aparece on={!!gpu} desde={[0, 1.2, 2.4]} delay={0.1} opcion={gpu} modelo={modeloDe(gpu)}>
        <group position={[-0.25, -0.55, -0.15]}>
          <Caja p={[0, 0, 0]} s={[2.35, 0.62, 0.42]}><Metal c="#0b1018" r={0.38} /></Caja>
          <Caja p={[0, 0.34, 0]} s={[2.35, 0.05, 0.44]}><Metal c="#05070b" r={0.4} /></Caja>
          <Caja p={[0, 0.375, 0]} s={[2.0, 0.012, 0.3]}><Led color={gpuColor} i={2.2} /></Caja>
          <Logo p={[-0.55, 0.386, 0]} w={0.5} rot={[-Math.PI / 2, 0, 0]} />
          {Array.from({ length: 22 }, (_, i) => (
            <Caja key={i} p={[-1.05 + i * 0.1, -0.31, 0]} s={[0.012, 0.012, 0.4]}><Metal c="#3a4a66" r={0.3} /></Caja>
          ))}
          <Caja p={[0.8, 0.31, -0.1]} s={[0.3, 0.09, 0.14]}><Metal c="#05070b" r={0.6} m={0.2} /></Caja>
          {Array.from({ length: gpu?.n ?? 2 }, (_, i) => {
            const n = gpu?.n ?? 2;
            return (
              <group key={i} position={[(i - (n - 1) / 2) * (2.0 / n) - 0.05, 0, 0.225]}>
                <Ventilador color={gpuColor} r={n === 3 ? 0.27 : 0.32} vel={5} marco={false} />
              </group>
            );
          })}
        </group>
        <Caja p={[-0.35, -0.55, -0.45]} s={[1.4, 0.03, 0.45]}><Metal c="#070a10" r={0.8} m={0.1} /></Caja>
        {/* bracket y puertos (DisplayPort / HDMI) que se ven desde atrás */}
        <group position={[rearX, -0.55, -0.15]}>
          <Caja p={[0, 0, 0]} s={[0.04, 0.7, 0.5]}><Metal c="#c4ccd6" r={0.3} m={0.95} /></Caja>
          {[-0.2, -0.05, 0.1].map((z) => (
            <Caja key={z} p={[-0.03, 0.15, z]} s={[0.03, 0.09, 0.12]}><Metal c="#05070b" r={0.6} m={0.2} /></Caja>
          ))}
          <Caja p={[-0.03, 0.15, 0.22]} s={[0.03, 0.08, 0.1]}><Metal c="#0a0e14" r={0.6} m={0.2} /></Caja>
        </group>
      </Aparece>

      {/* Cables (entran con la fuente) */}
      <Aparece on={!!fuente && !!placa} desde={[0, -1.2, 0]} delay={0.2}>
        <Cable pts={[[-0.6, -hh + 0.5, -0.55], [-0.62, -1.0, -0.62], [0.2, -0.95, -0.62], [0.72, -0.5, -0.62], [0.72, 0.2, -0.62]]} r={0.05} />
        {gpu && <Cable pts={[[0.4, -hh + 0.5, -0.2], [0.95, -1.0, -0.1], [0.95, -0.4, -0.2], [0.82, -0.25, -0.25]]} r={0.04} />}
      </Aparece>

      {/* FUENTE DE PODER */}
      <Aparece on={!!fuente} desde={[0, -2.4, 0.4]} delay={0.1} opcion={fuente} modelo={modeloDe(fuente)}>
        <group position={[0, -hh + 0.4, -0.05]}>
          <Caja p={[0, 0, 0]} s={[W * s - 0.3, 0.64, D - 0.25]}>
            <Metal c="#07090e" r={0.5} m={0.7} />
            <Edges color={fuente?.color ?? '#6cc3ee'} />
          </Caja>
          {Array.from({ length: 14 }, (_, i) => (
            <Caja key={i} p={[-1.0 + i * 0.15, 0.321, 0.1]} s={[0.05, 0.004, 0.6]}><meshStandardMaterial color="#000" roughness={1} /></Caja>
          ))}
          <Logo p={[0, 0.0, (D - 0.25) / 2 + 0.002]} w={0.75} />
          <Caja p={[0, -0.28, (D - 0.25) / 2 + 0.002]} s={[1.6, 0.012, 0.006]}><Led color={fuente?.color ?? '#6cc3ee'} i={1.4} /></Caja>
        </group>
        {/* parte trasera: entrada de corriente, interruptor y rejilla del ventilador */}
        <group position={[rearX - 0.01, -hh + 0.4, -0.05]}>
          <Caja p={[0, 0, 0]} s={[0.02, 0.6, D - 0.3]}><Metal c="#0a0e14" r={0.5} m={0.6} /></Caja>
          <Caja p={[-0.02, 0.12, -0.5]} s={[0.04, 0.2, 0.3]}><Metal c="#dfe4ec" r={0.5} m={0.2} /></Caja>
          <Caja p={[-0.025, -0.15, -0.5]} s={[0.04, 0.1, 0.1]}><Metal c="#e11d48" r={0.5} m={0.2} /></Caja>
          {[0.12, 0.2, 0.28].map((r) => (
            <mesh key={r} position={[-0.015, 0, 0.3]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[r, 0.008, 6, 40]} />
              <Metal c="#2a3a58" />
            </mesh>
          ))}
        </group>
      </Aparece>

      {/* BASE de armado */}
      {!solo && (<>
      <Pedestal y={-hh - 0.2} color={acento} />
      <Grid position={[0, -hh - 0.62, 0]} args={[30, 30]} cellSize={0.5} cellThickness={0.6} cellColor="#16284a" sectionSize={2.5} sectionThickness={1} sectionColor="#238DC1" fadeDistance={14} fadeStrength={1.6} infiniteGrid />
      <ContactShadows position={[0, -hh - 0.19, 0]} opacity={0.55} scale={9} blur={2.6} far={3} color="#000" />
      <Sparkles count={40} scale={[7, 6, 5]} size={1.6} speed={0.25} color="#6cc3ee" opacity={0.45} />
      </>)}

      {/* Marcadores */}
      {etiquetas &&
        (Object.keys(puntos) as Cat[]).map((c) => {
          const o = sel[c];
          const activa = !!o && (hover === o.id || foco === o.id);
          return o && activa ? <Etiqueta key={`${c}${o.id}`} o={o} p={puntos[c]} q={destinos[c]} lado={lados[c]} activa setHover={setHover} /> : null;
        })}
    </Ctx.Provider>
  );
}

// Modo foto (solo para generar las imágenes de producto): una pieza sola, cámara fija, fondo transparente.
export type VistaFoto = { pos: V3; target: V3; fov?: number };

function Apunta({ vista }: { vista: VistaFoto }) {
  const camera = useThree((st) => st.camera);
  useEffect(() => {
    camera.position.set(...vista.pos);
    camera.lookAt(...vista.target);
    camera.updateProjectionMatrix();
  }, [camera, vista]);
  return null;
}

export default function PcScene({
  sel, auto = true, className = '', etiquetas = false, foco, foto, instantaneo = false, preservar = false, onListo,
}: { sel: Seleccion; auto?: boolean; className?: string; etiquetas?: boolean; foco?: string; foto?: VistaFoto; instantaneo?: boolean; preservar?: boolean; onListo?: () => void }) {
  return (
    <div className={className}>
      <Canvas
        dpr={foto ? 1 : [1, 1.75]}
        camera={{ position: foto?.pos ?? [7.6, 2.2, 9.6], fov: foto?.fov ?? 38 }}
        gl={{ antialias: true, preserveDrawingBuffer: !!foto || preservar, alpha: true }}
        onCreated={() => onListo?.()}
      >
        <Suspense fallback={null}>
          <Escena sel={sel} etiquetas={etiquetas} foco={foco} solo={!!foto} instantaneo={instantaneo} />
        </Suspense>
        {foto ? (
          <Apunta vista={foto} />
        ) : (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={auto && !etiquetas}
            autoRotateSpeed={0.9}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
          />
        )}
      </Canvas>
    </div>
  );
}
