'use client';
// PC procedural en 3D (cajas y cilindros, sin modelos .glb): cada pieza elegida "cae" dentro del gabinete.
// Para modelos reales después: reemplazar el interior de cada pieza por un <primitive object={gltf.scene} />.
import { useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Edges, OrbitControls, Sparkles } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import type { Seleccion } from '@/lib/piezas';

const H = 3.8; // alto base del gabinete
const W = 3.2;
const D = 1.9;
const BASE = '#1a2548';

function Glow({ color, i = 2 }: { color: string; i?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={i} toneMapped={false} />;
}

// Anima la entrada: la pieza cae desde arriba y crece hasta su tamaño.
function Aparece({ on, children, caida = 1.6 }: { on: boolean; children: ReactNode; caida?: number }) {
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
      {children}
    </group>
  );
}

function Ventilador({ color, r = 0.34, vel = 3 }: { color: string; r?: number; vel?: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * vel;
  });
  return (
    <group>
      <mesh>
        <torusGeometry args={[r, 0.022, 8, 40]} />
        <Glow color={color} i={2.5} />
      </mesh>
      <group ref={ref}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]} position={[0, 0, 0]}>
            <boxGeometry args={[r * 0.95, 0.07, 0.015]} />
            <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
    </group>
  );
}

function Escena({ sel }: { sel: Seleccion }) {
  const { gabinete: g, cpu, placa, ram, gpu, ssd, cooler, fuente } = sel;
  const s = g?.n ?? 1;
  const acento = g?.color ?? '#475569';
  const gpuColor = gpu?.color ?? '#22d3ee';

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      {gpu && <pointLight position={[0, -0.4, 0.5]} color={gpuColor} intensity={5} distance={5} />}
      {cooler && <pointLight position={[-0.3, 1.2, 0.2]} color={cooler.color} intensity={4} distance={4} />}
      {ram && <pointLight position={[0.6, 0.8, 0]} color={ram.color} intensity={2.5} distance={3} />}

      {/* Gabinete: contorno fantasma hasta que se elige uno */}
      <mesh scale={[s, s, 1]}>
        <boxGeometry args={[W, H, D]} />
        <meshPhysicalMaterial color="#9bd" transparent opacity={g ? 0.07 : 0.025} roughness={0.05} depthWrite={false} />
        <Edges color={g ? acento : '#334155'} threshold={15} />
      </mesh>
      {g && (
        <>
          {[0.75, 0, -0.75].map((y) => (
            <group key={y} position={[W * s * 0.48, y * s, 0]} rotation={[0, Math.PI / 2, 0]}>
              <Ventilador color={acento} r={0.3} vel={4} />
            </group>
          ))}
          <mesh position={[0, -H * s * 0.5 - 0.05, 0]}>
            <boxGeometry args={[W * s + 0.1, 0.05, D + 0.1]} />
            <Glow color={acento} i={0.8} />
          </mesh>
        </>
      )}

      {/* Placa madre */}
      <Aparece on={!!placa}>
        <mesh position={[-0.35, 0.35, -0.72]}>
          <boxGeometry args={[2.0, 2.4, 0.05]} />
          <meshStandardMaterial color={BASE} metalness={0.5} roughness={0.5} />
          <Edges color={placa?.color ?? '#22d3ee'} />
        </mesh>
        {[-0.8, -0.1, 0.6].map((y) => (
          <mesh key={y} position={[-1.0, y, -0.66]}>
            <boxGeometry args={[0.5, 0.3, 0.06]} />
            <meshStandardMaterial color="#111a33" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0.2, -0.65, -0.68]}>
          <boxGeometry args={[1.0, 0.04, 0.02]} />
          <Glow color={placa?.color ?? '#22d3ee'} i={2} />
        </mesh>
      </Aparece>

      {/* CPU */}
      <Aparece on={!!cpu} caida={2}>
        <mesh position={[-0.2, 0.75, -0.66]}>
          <boxGeometry args={[0.42, 0.42, 0.05]} />
          <Glow color={cpu?.color ?? '#f97316'} i={0.9} />
        </mesh>
      </Aparece>

      {/* Refrigeración: torre (n=1) o líquida con radiador arriba (n>=2) */}
      <Aparece on={!!cooler} caida={2.2}>
        {cooler && cooler.n === 1 && (
          <group position={[-0.2, 0.75, -0.36]}>
            <mesh>
              <boxGeometry args={[0.55, 0.95, 0.4]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.25} />
            </mesh>
            <group position={[0, 0, 0.23]}>
              <Ventilador color={cooler.color} r={0.27} vel={4} />
            </group>
          </group>
        )}
        {cooler && (cooler.n ?? 1) > 1 && (
          <group>
            <mesh position={[-0.2, 0.75, -0.55]}>
              <cylinderGeometry args={[0.24, 0.24, 0.22, 24]} />
              <meshStandardMaterial color="#0b1224" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[-0.2, 0.75, -0.43]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.025, 8, 32]} />
              <Glow color={cooler.color} i={3} />
            </mesh>
            <mesh position={[-0.55, 1.6 * s, -0.2]}>
              <boxGeometry args={[(cooler.n ?? 2) * 0.62, 0.14, 0.62]} />
              <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.35} />
              <Edges color={cooler.color} />
            </mesh>
            {Array.from({ length: cooler.n ?? 2 }, (_, i) => (
              <mesh key={i} position={[-0.55 + ((i - ((cooler.n ?? 2) - 1) / 2) * 0.62), 1.6 * s - 0.09, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.25, 0.02, 8, 32]} />
                <Glow color={cooler.color} i={3} />
              </mesh>
            ))}
            <mesh position={[-0.28, 1.1, -0.5]}>
              <cylinderGeometry args={[0.025, 0.025, 1.0, 8]} />
              <meshStandardMaterial color="#020617" />
            </mesh>
          </group>
        )}
      </Aparece>

      {/* RAM */}
      <Aparece on={!!ram} caida={2.4}>
        {ram &&
          Array.from({ length: ram.n ?? 2 }, (_, i) => (
            <group key={i} position={[0.5 + i * 0.12, 0.75, -0.6]}>
              <mesh>
                <boxGeometry args={[0.07, 1.0, 0.14]} />
                <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.52, 0]}>
                <boxGeometry args={[0.075, 0.06, 0.15]} />
                <Glow color={ram.color} i={3} />
              </mesh>
            </group>
          ))}
      </Aparece>

      {/* SSD (M.2) */}
      <Aparece on={!!ssd} caida={1.8}>
        {ssd &&
          Array.from({ length: ssd.n ?? 1 }, (_, i) => (
            <mesh key={i} position={[-0.5, 0.0 - i * 0.18, -0.67]}>
              <boxGeometry args={[0.7, 0.12, 0.03]} />
              <Glow color={ssd.color} i={1.6} />
            </mesh>
          ))}
      </Aparece>

      {/* GPU: placa horizontal con ventiladores al frente */}
      <Aparece on={!!gpu} caida={2.6}>
        <group position={[-0.25, -0.55, -0.15]}>
          <mesh>
            <boxGeometry args={[2.35, 0.62, 0.42]} />
            <meshStandardMaterial color="#0b1224" metalness={0.85} roughness={0.25} />
            <Edges color={gpuColor} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <boxGeometry args={[2.35, 0.04, 0.44]} />
            <Glow color={gpuColor} i={2.5} />
          </mesh>
          {Array.from({ length: gpu?.n ?? 2 }, (_, i) => {
            const n = gpu?.n ?? 2;
            return (
              <group key={i} position={[(i - (n - 1) / 2) * (2.1 / n), 0, 0.22]} rotation={[0, 0, 0]}>
                <Ventilador color={gpuColor} r={n === 3 ? 0.27 : 0.3} vel={5} />
              </group>
            );
          })}
        </group>
      </Aparece>

      {/* Fuente de poder */}
      <Aparece on={!!fuente} caida={1.4}>
        <group position={[0, -H * s * 0.5 + 0.38, -0.05]}>
          <mesh>
            <boxGeometry args={[W * s - 0.3, 0.6, D - 0.25]} />
            <meshStandardMaterial color="#05070f" metalness={0.7} roughness={0.5} />
            <Edges color={fuente?.color ?? '#facc15'} />
          </mesh>
          <mesh position={[0, 0.31, 0]}>
            <boxGeometry args={[W * s - 0.5, 0.02, 0.1]} />
            <Glow color={fuente?.color ?? '#facc15'} i={1.4} />
          </mesh>
        </group>
      </Aparece>

      {/* Plataforma */}
      <mesh position={[0, -H * s * 0.5 - 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.34, 64]} />
        <Glow color={acento} i={0.9} />
      </mesh>
      <ContactShadows position={[0, -H * s * 0.5 - 0.3, 0]} opacity={0.6} scale={9} blur={2.6} far={3} color="#000" />
      <Sparkles count={50} scale={[7, 6, 5]} size={2} speed={0.3} color={acento} opacity={0.6} />
    </group>
  );
}

export default function PcScene({ sel, auto = true, className = '' }: { sel: Seleccion; auto?: boolean; className?: string }) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [6.4, 1.6, 7.8], fov: 38 }} gl={{ antialias: true }}>
        <Escena sel={sel} />
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
