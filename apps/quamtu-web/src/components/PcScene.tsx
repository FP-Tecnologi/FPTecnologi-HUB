'use client';
// PC procedural detallado (sin modelos .glb): metal negro mate, rejillas, aletas, cables y el logo Quamtu en las piezas.
// Si hay un .glb para una pieza (lib/modelos.ts) reemplaza al procedural.
import { Suspense, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Edges, Environment, Lightformer, OrbitControls, Sparkles, useGLTF, useTexture } from '@react-three/drei';
import { CatmullRomCurve3, MathUtils, Vector3, type Group } from 'three';
import type { Opcion, Seleccion } from '@/lib/piezas';
import { MODELOS, type Modelo } from '@/lib/modelos';

const H = 3.8; // alto base del gabinete
const W = 3.2;
const D = 1.9;
const PCB = '#14233f';
type V3 = [number, number, number];

const modeloDe = (o?: Opcion) => (o ? (MODELOS[o.id] ?? MODELOS[o.cat]) : undefined);

function Glb({ m }: { m: Modelo }) {
  const { scene } = useGLTF(m.url);
  const copia = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={copia} scale={m.escala ?? 1} position={m.pos ?? [0, 0, 0]} rotation={m.rot ?? [0, 0, 0]} />;
}

// Anima la entrada: la pieza cae desde arriba y crece hasta su tamaño.
function Aparece({ on, children, caida = 1.6, modelo }: { on: boolean; children: ReactNode; caida?: number; modelo?: Modelo }) {
  const ref = useRef<Group>(null);
  const p = useRef(0);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    p.current = MathUtils.damp(p.current, on ? 1 : 0, 4, dt);
    g.visible = p.current > 0.01;
    g.scale.setScalar(0.5 + 0.5 * p.current);
    g.position.y = caida * (1 - p.current);
  });
  return (
    <group ref={ref} visible={false}>
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
      {marco && (
        <>
          {[
            [0, L / 2, L, g],
            [0, -L / 2, L, g],
            [L / 2, 0, g, L],
            [-L / 2, 0, g, L],
          ].map(([x, y, w, h], i) => (
            <Caja key={i} p={[x, y, 0]} s={[w, h, 0.07]}>
              <Metal c="#0a0e14" r={0.55} m={0.5} />
            </Caja>
          ))}
        </>
      )}
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

/* ---------- escena ---------- */
function Escena({ sel }: { sel: Seleccion }) {
  const { gabinete: g, cpu, placa, ram, gpu, ssd, cooler, fuente } = sel;
  const s = g?.n ?? 1;
  const acento = g?.color ?? '#4a6283';
  const gpuColor = gpu?.color ?? '#6cc3ee';
  const hw = (W * s) / 2;
  const hh = (H * s) / 2;

  return (
    <group>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 7]} intensity={1.4} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 4]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-6, 1, 3]} scale={[3, 8, 1]} color="#6cc3ee" />
        <Lightformer form="rect" intensity={1.2} position={[6, 0, -2]} scale={[3, 8, 1]} color="#385cad" />
      </Environment>
      {gpu && <pointLight position={[0, -0.4, 0.6]} color={gpuColor} intensity={3} distance={4.5} />}
      {cooler && <pointLight position={[-0.3, 1.2, 0.3]} color={cooler.color} intensity={2.5} distance={3.5} />}
      {ram && <pointLight position={[0.3, 0.8, 0]} color={ram.color} intensity={1.6} distance={2.5} />}

      {/* Cristal (siempre) y estructura del gabinete */}
      <mesh position={[0, 0, D / 2]} scale={[s, s, 1]}>
        <planeGeometry args={[W, H]} />
        <meshPhysicalMaterial color="#9fc6e6" transparent opacity={g ? 0.07 : 0.03} roughness={0.04} metalness={0.2} depthWrite={false} />
      </mesh>
      <mesh scale={[s, s, 1]}>
        <boxGeometry args={[W, H, D]} />
        <meshBasicMaterial visible={false} />
        <Edges color={g ? acento : '#2c3f5c'} threshold={15} />
      </mesh>
      {g && (
        <>
          {/* pilares, techo, base, panel trasero */}
          {[hw, -hw].flatMap((x) => [D / 2, -D / 2].map((z) => (
            <Caja key={`${x}${z}`} p={[x, 0, z]} s={[0.1, H * s, 0.1]}><Metal c="#0b0f16" r={0.5} /></Caja>
          )))}
          <Caja p={[0, hh, 0]} s={[W * s, 0.1, D]}><Metal c="#0b0f16" r={0.5} /></Caja>
          <Caja p={[0, -hh, 0]} s={[W * s, 0.1, D]}><Metal c="#0b0f16" r={0.5} /></Caja>
          <Caja p={[0, 0, -D / 2]} s={[W * s, H * s, 0.04]}><Metal c="#080b11" r={0.6} m={0.6} /></Caja>
          {/* patas */}
          {[hw - 0.2, -hw + 0.2].flatMap((x) => [D / 2 - 0.2, -D / 2 + 0.2].map((z) => (
            <Caja key={`p${x}${z}`} p={[x, -hh - 0.1, z]} s={[0.22, 0.1, 0.22]}><Metal c="#05070b" /></Caja>
          )))}
          {/* panel derecho Turing: rejilla diagonal */}
          <Caja p={[hw + 0.03, 0, 0]} s={[0.05, H * s - 0.1, D - 0.1]}><Metal c="#090c12" r={0.55} m={0.7} /></Caja>
          {Array.from({ length: 12 }, (_, i) => (
            <Caja key={i} p={[hw + 0.065, -hh + 0.25 + i * ((H * s - 0.5) / 11), 0]} s={[0.012, 0.07, D * (0.35 + 0.5 * ((i * 7) % 5) / 5)]}>
              <meshStandardMaterial color="#04060a" roughness={0.9} />
            </Caja>
          ))}
          <Logo p={[hw + 0.075, hh - 0.35, -D / 2 + 0.55]} w={0.55} rot={[0, Math.PI / 2, 0]} />
          {/* ventilador trasero (escape) */}
          <group position={[hw - 0.45, hh - 0.5, -D / 2 + 0.07]}>
            <Ventilador color={acento} r={0.3} vel={4} />
          </group>
          {/* base LED */}
          <Caja p={[0, -hh - 0.17, 0]} s={[W * s + 0.1, 0.03, D + 0.1]}><Led color={acento} i={0.7} /></Caja>
        </>
      )}

      {/* Placa madre */}
      <Aparece on={!!placa} modelo={modeloDe(placa)}>
        <Caja p={[-0.35, 0.35, -0.72]} s={[2.0, 2.4, 0.05]}>
          <meshStandardMaterial color={PCB} roughness={0.5} metalness={0.4} />
          <Edges color={placa?.color ?? '#238DC1'} />
        </Caja>
        {/* blindaje de I/O con nervaduras */}
        <Caja p={[-1.0, 1.1, -0.62]} s={[0.7, 0.85, 0.12]}><Metal c="#161f2e" r={0.35} /></Caja>
        {Array.from({ length: 7 }, (_, i) => (
          <Caja key={i} p={[-1.0, 0.8 + i * 0.1, -0.555]} s={[0.62, 0.02, 0.012]}><Metal c="#1b2432" r={0.3} /></Caja>
        ))}
        <Caja p={[-1.0, 1.54, -0.555]} s={[0.7, 0.025, 0.012]}><Led color={placa?.color ?? '#238DC1'} i={1.4} /></Caja>
        {/* VRM / disipador superior */}
        <Caja p={[-0.1, 1.42, -0.63]} s={[1.1, 0.16, 0.13]}><Metal c="#161f2e" r={0.35} /></Caja>
        {Array.from({ length: 12 }, (_, i) => (
          <Caja key={i} p={[-0.6 + i * 0.1, 1.42, -0.558]} s={[0.012, 0.15, 0.012]}><Metal c="#222c3c" r={0.3} /></Caja>
        ))}
        {/* socket + ranuras RAM + PCIe + M.2 + chipset */}
        <Caja p={[-0.2, 0.75, -0.685]} s={[0.55, 0.55, 0.03]}><Metal c="#9aa6b5" r={0.35} m={0.9} /></Caja>
        {Array.from({ length: 4 }, (_, i) => (
          <Caja key={i} p={[0.12 + i * 0.11, 0.78, -0.685]} s={[0.06, 1.05, 0.03]}><Metal c="#05070b" r={0.6} m={0.3} /></Caja>
        ))}
        <Caja p={[-0.35, -0.55, -0.685]} s={[1.5, 0.06, 0.03]}><Metal c="#05070b" r={0.6} m={0.3} /></Caja>
        <Caja p={[-0.7, 0.0, -0.66]} s={[0.55, 0.14, 0.05]}><Metal c="#1a2538" r={0.3} /></Caja>
        <Caja p={[0.15, -0.32, -0.655]} s={[0.55, 0.3, 0.07]}><Metal c="#161f2e" r={0.35} /></Caja>
        <Caja p={[0.15, -0.32, -0.617]} s={[0.4, 0.02, 0.012]}><Led color={placa?.color ?? '#238DC1'} i={1.2} /></Caja>
        {/* pistas luminosas tenues */}
        <Caja p={[0.2, -0.75, -0.69]} s={[0.9, 0.012, 0.01]}><Led color={placa?.color ?? '#238DC1'} i={1.4} /></Caja>
        <Caja p={[-0.7, -0.5, -0.69]} s={[0.012, 0.6, 0.01]}><Led color={placa?.color ?? '#238DC1'} i={1.0} /></Caja>
      </Aparece>

      {/* CPU: tapa metálica visible */}
      <Aparece on={!!cpu} caida={2} modelo={modeloDe(cpu)}>
        <Caja p={[-0.2, 0.75, -0.655]} s={[0.4, 0.4, 0.035]}><Metal c="#c4ccd6" r={0.28} m={0.95} /></Caja>
        <Caja p={[-0.2, 0.75, -0.636]} s={[0.3, 0.3, 0.004]}><Led color={cpu?.color ?? '#238DC1'} i={0.35} /></Caja>
      </Aparece>

      {/* Refrigeración: torre (n=1) o líquida con radiador arriba (n>=2) */}
      <Aparece on={!!cooler} caida={2.2} modelo={modeloDe(cooler)}>
        {cooler && cooler.n === 1 && (
          <group position={[-0.2, 0.75, -0.4]}>
            <Caja p={[0, -0.5, 0.05]} s={[0.5, 0.06, 0.4]}><Metal c="#c4ccd6" r={0.3} m={0.95} /></Caja>
            {Array.from({ length: 16 }, (_, i) => (
              <Caja key={i} p={[0, -0.42 + i * 0.058, 0]} s={[0.52, 0.018, 0.34]}><Metal c="#1a2230" r={0.3} /></Caja>
            ))}
            {[-0.15, 0, 0.15].map((x) => (
              <mesh key={x} position={[x, 0, 0.17]}>
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
            {/* bomba con logo */}
            <mesh position={[-0.2, 0.75, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 0.2, 32]} />
              <Metal c="#0a0e14" r={0.3} />
            </mesh>
            <mesh position={[-0.2, 0.75, -0.445]}>
              <torusGeometry args={[0.215, 0.018, 8, 40]} />
              <Led color={cooler.color} i={2} />
            </mesh>
            <Logo p={[-0.2, 0.75, -0.44]} w={0.3} />
            {/* radiador arriba con ventiladores */}
            {(() => {
              const n = cooler.n ?? 2;
              const ancho = n * 0.62;
              return (
                <group position={[-0.45, 1.58 * s, -0.2]}>
                  <Caja p={[0, 0, 0]} s={[ancho, 0.16, 0.66]}><Metal c="#0a0e14" r={0.4} /></Caja>
                  {Array.from({ length: n * 8 }, (_, i) => (
                    <Caja key={i} p={[-ancho / 2 + 0.04 + i * ((ancho - 0.08) / (n * 8 - 1)), 0, 0.331]} s={[0.012, 0.15, 0.004]}><Metal c="#27324a" r={0.3} /></Caja>
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

      {/* RAM con disipador, barra LED y etiqueta */}
      <Aparece on={!!ram} caida={2.4} modelo={modeloDe(ram)}>
        {ram &&
          Array.from({ length: ram.n ?? 2 }, (_, i) => (
            <group key={i} position={[0.12 + i * 0.11, 0.78, -0.6]}>
              <Caja p={[0, 0, 0]} s={[0.075, 1.0, 0.13]}><Metal c="#10151d" r={0.4} /></Caja>
              <Caja p={[0, -0.48, 0]} s={[0.07, 0.05, 0.1]}><Metal c="#c9a24a" r={0.3} m={1} /></Caja>
              <Caja p={[0.039, 0, 0]} s={[0.005, 0.55, 0.1]}><Metal c="#1d2636" r={0.25} /></Caja>
              <Caja p={[0, 0.52, 0]} s={[0.078, 0.07, 0.135]}><Led color={ram.color} i={2.2} /></Caja>
              <Logo p={[0.043, -0.1, 0]} w={0.3} rot={[0, Math.PI / 2, 0]} op={0.8} />
            </group>
          ))}
      </Aparece>

      {/* SSD M.2 con disipador */}
      <Aparece on={!!ssd} caida={1.8} modelo={modeloDe(ssd)}>
        {ssd && <Caja p={[-0.7, 0.0, -0.625]} s={[0.55, 0.13, 0.03]}><Metal c="#1b2a44" r={0.3} /></Caja>}
        {ssd && <Caja p={[-0.7, 0.0, -0.607]} s={[0.4, 0.02, 0.006]}><Led color={ssd.color} i={1.4} /></Caja>}
        {ssd && (ssd.n ?? 1) > 1 && <Caja p={[0.15, -0.32, -0.59]} s={[0.4, 0.06, 0.02]}><Metal c="#1b2a44" r={0.3} /></Caja>}
      </Aparece>

      {/* GPU: carcasa, ventiladores, backplate, bracket y conectores */}
      <Aparece on={!!gpu} caida={2.6} modelo={modeloDe(gpu)}>
        <group position={[-0.25, -0.55, -0.15]}>
          <Caja p={[0, 0, 0]} s={[2.35, 0.62, 0.42]}><Metal c="#0b1018" r={0.38} /></Caja>
          <Caja p={[0, 0.34, 0]} s={[2.35, 0.05, 0.44]}><Metal c="#05070b" r={0.4} /></Caja>
          <Caja p={[0, 0.375, 0]} s={[2.0, 0.012, 0.3]}><Led color={gpuColor} i={2.2} /></Caja>
          <Logo p={[-0.55, 0.386, 0]} w={0.5} rot={[-Math.PI / 2, 0, 0]} />
          {/* aletas al fondo */}
          {Array.from({ length: 22 }, (_, i) => (
            <Caja key={i} p={[-1.05 + i * 0.1, -0.31, 0]} s={[0.012, 0.012, 0.4]}><Metal c="#2a3548" r={0.3} /></Caja>
          ))}
          {/* bracket */}
          <Caja p={[-1.2, 0, 0.0]} s={[0.04, 0.7, 0.5]}><Metal c="#c4ccd6" r={0.3} m={0.95} /></Caja>
          {[-0.18, 0.05, 0.28].map((y) => (
            <Caja key={y} p={[-1.22, y - 0.1, 0.1]} s={[0.02, 0.1, 0.18]}><Metal c="#05070b" r={0.6} /></Caja>
          ))}
          {/* conector de energía */}
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
        {/* riser entre PCIe y GPU */}
        <Caja p={[-0.35, -0.55, -0.45]} s={[1.4, 0.03, 0.45]}><Metal c="#070a10" r={0.8} m={0.1} /></Caja>
      </Aparece>

      {/* Cables (aparecen con la fuente) */}
      <Aparece on={!!fuente && !!placa} caida={1.4}>
        <Cable pts={[[-0.6, -1.4, -0.55], [-0.62, -1.0, -0.62], [0.2, -0.95, -0.62], [0.72, -0.5, -0.62], [0.72, 0.2, -0.62]]} r={0.05} />
        {gpu && <Cable pts={[[0.4, -1.4, -0.2], [0.95, -1.0, -0.1], [0.95, -0.4, -0.2], [0.82, -0.25, -0.25]]} r={0.04} />}
      </Aparece>

      {/* Fuente de poder */}
      <Aparece on={!!fuente} caida={1.4} modelo={modeloDe(fuente)}>
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
      </Aparece>

      {/* Plataforma */}
      <mesh position={[0, -hh - 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.33, 64]} />
        <Led color={acento} i={0.9} />
      </mesh>
      <ContactShadows position={[0, -hh - 0.3, 0]} opacity={0.6} scale={9} blur={2.6} far={3} color="#000" />
      <Sparkles count={40} scale={[7, 6, 5]} size={1.6} speed={0.25} color="#6cc3ee" opacity={0.45} />
    </group>
  );
}

export default function PcScene({ sel, auto = true, className = '' }: { sel: Seleccion; auto?: boolean; className?: string }) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [6.4, 1.6, 7.8], fov: 38 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <Escena sel={sel} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={auto}
          autoRotateSpeed={0.9}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
    </div>
  );
}
