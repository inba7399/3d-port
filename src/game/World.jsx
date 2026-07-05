import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance, Text, Billboard } from '@react-three/drei';
import { PATHS, LAMPS, TREES, FLOWERS, FOUNTAIN, GATE, BENCHES, CARTS } from './worldLayout';
import { Toon, makeGrassTexture, makePathTexture, makeSkyMaterial } from './materials';
import { profile } from '../data/content';

const SAND_EDGE = '#c9a96e';
const CLIFF = '#e6cd9c';
const WATER = '#2fbfb3';
const CROWN_COLORS = ['#4fc93f', '#6fdb50', '#3db437', '#5ed048'];

function Sky() {
  const skyMat = useMemo(makeSkyMaterial, []);
  return (
    <>
      <mesh material={skyMat}>
        <sphereGeometry args={[115, 24, 12]} />
      </mesh>
      {/* Cartoon sun with a soft halo */}
      <Billboard position={[38, 52, -62]}>
        <mesh>
          <circleGeometry args={[5.5, 24]} />
          <meshBasicMaterial color="#fff2b8" fog={false} />
        </mesh>
        <mesh position-z={-0.5}>
          <circleGeometry args={[8.5, 24]} />
          <meshBasicMaterial color="#fff2b8" transparent opacity={0.3} fog={false} />
        </mesh>
      </Billboard>
    </>
  );
}

// The park sits on an island: grass on top, sandy cliffs down to a teal
// ocean with a foam ring around the shoreline.
function Island() {
  const grassTex = useMemo(() => {
    const t = makeGrassTexture();
    t.repeat.set(22, 22);
    return t;
  }, []);
  const plazaTex = useMemo(() => {
    const t = makePathTexture();
    t.repeat.set(5, 5);
    return t;
  }, []);
  return (
    <>
      {/* Grass top */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[40, 48]} />
        <Toon map={grassTex} color="#ffffff" />
      </mesh>
      {/* Cliff wall */}
      <mesh position-y={-2.5}>
        <cylinderGeometry args={[40.15, 36.5, 5.2, 48, 1, true]} />
        <Toon color={CLIFF} />
      </mesh>
      {/* Island bottom cap so no one sees through from a flat angle */}
      <mesh rotation-x={Math.PI / 2} position-y={-5}>
        <circleGeometry args={[37, 48]} />
        <Toon color="#cbb27e" />
      </mesh>
      {/* Ocean */}
      <mesh rotation-x={-Math.PI / 2} position-y={-3.6}>
        <circleGeometry args={[150, 48]} />
        <Toon color={WATER} />
      </mesh>
      {/* Foam rings hugging the shore */}
      <mesh rotation-x={-Math.PI / 2} position-y={-3.55}>
        <ringGeometry args={[39.4, 42.4, 48]} />
        <meshBasicMaterial color="#dff7f2" transparent opacity={0.55} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-3.55}>
        <ringGeometry args={[43.4, 44.6, 48]} />
        <meshBasicMaterial color="#dff7f2" transparent opacity={0.22} />
      </mesh>

      {/* Plaza outline first, then the plaza on top */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.018}>
        <circleGeometry args={[6.45, 28]} />
        <Toon color={SAND_EDGE} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.03} receiveShadow>
        <circleGeometry args={[6, 28]} />
        <Toon map={plazaTex} color="#ffffff" />
      </mesh>
    </>
  );
}

function PathStrip({ p, tex }) {
  const dx = p.bx - p.ax;
  const dz = p.bz - p.az;
  const len = Math.hypot(dx, dz);
  const pathTex = useMemo(() => {
    const t = tex.clone();
    t.repeat.set(p.w / 2.4, (len + p.w * 0.6) / 2.4);
    t.needsUpdate = true;
    return t;
  }, [tex, p.w, len]);
  return (
    <group position={[(p.ax + p.bx) / 2, 0, (p.az + p.bz) / 2]} rotation-y={Math.atan2(dx, dz)}>
      {/* Darker outline slab under the path — cheap cartoon edge */}
      <mesh position-y={0.032}>
        <boxGeometry args={[p.w + 0.55, 0.05, len + p.w * 0.6 + 0.55]} />
        <Toon color={SAND_EDGE} />
      </mesh>
      <mesh position-y={0.05} receiveShadow>
        <boxGeometry args={[p.w, 0.06, len + p.w * 0.6]} />
        <Toon map={pathTex} color="#ffffff" />
      </mesh>
    </group>
  );
}

// White dashed centre lines, like the little roads in low-poly city scenes.
function PathDashes() {
  const dashes = useMemo(() => {
    const arr = [];
    for (const p of PATHS) {
      const dx = p.bx - p.ax;
      const dz = p.bz - p.az;
      const len = Math.hypot(dx, dz);
      const rotY = Math.atan2(dx, dz);
      const n = Math.floor(len / 2.4);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        arr.push({ x: p.ax + dx * t, z: p.az + dz * t, rotY });
      }
    }
    return arr;
  }, []);
  return (
    <Instances limit={dashes.length}>
      <boxGeometry args={[0.16, 0.02, 0.85]} />
      <meshBasicMaterial color="#fdfdf6" />
      {dashes.map((d, i) => (
        <Instance key={i} position={[d.x, 0.085, d.z]} rotation={[0, d.rotY, 0]} />
      ))}
    </Instances>
  );
}

// Layered cartoon trees: round ones get three stacked leaf blobs, pines get
// three stacked cones — still fully instanced (one draw call per layer).
const ROUND_LAYERS = [
  { y: 1.5, s: 1.18, dx: 0.12, dz: 0.08 },
  { y: 2.25, s: 0.92, dx: -0.14, dz: -0.06 },
  { y: 2.95, s: 0.62, dx: 0.05, dz: 0.1 },
];
const PINE_LAYERS = [
  { y: 1.35, s: 1.15 },
  { y: 2.2, s: 0.85 },
  { y: 2.95, s: 0.55 },
];

function Trees() {
  const rounds = TREES.filter((t) => t.kind === 0);
  const pines = TREES.filter((t) => t.kind === 1);
  return (
    <>
      {/* Trunks */}
      <Instances limit={TREES.length} castShadow>
        <cylinderGeometry args={[0.17, 0.3, 1.5, 7]} />
        <Toon color="#8a5a33" />
        {TREES.map((t, i) => (
          <Instance key={i} position={[t.x, 0.7 * t.s, t.z]} scale={t.s} />
        ))}
      </Instances>
      {/* Round crowns: three blob layers */}
      {ROUND_LAYERS.map((L, li) => (
        <Instances key={li} limit={rounds.length} castShadow={li === 0}>
          <sphereGeometry args={[1.05, 9, 7]} />
          <Toon color="#ffffff" flatShading />
          {rounds.map((t, i) => (
            <Instance
              key={i}
              position={[t.x + L.dx * t.s, L.y * t.s, t.z + L.dz * t.s]}
              scale={[L.s * t.s, L.s * 0.82 * t.s, L.s * t.s]}
              color={CROWN_COLORS[(i + li) % CROWN_COLORS.length]}
            />
          ))}
        </Instances>
      ))}
      {/* Pine crowns: three stacked cones */}
      {PINE_LAYERS.map((L, li) => (
        <Instances key={li} limit={pines.length} castShadow={li === 0}>
          <coneGeometry args={[1, 1.5, 8]} />
          <Toon color="#ffffff" flatShading />
          {pines.map((t, i) => (
            <Instance
              key={i}
              position={[t.x, L.y * t.s, t.z]}
              scale={L.s * t.s}
              color={i % 2 ? '#2e9e3e' : '#3db44a'}
            />
          ))}
        </Instances>
      ))}
    </>
  );
}

function Flowers() {
  return (
    <Instances limit={FLOWERS.length}>
      <sphereGeometry args={[0.09, 6, 6]} />
      <Toon color="#ffffff" />
      {FLOWERS.map((f, i) => (
        <Instance key={i} position={[f.x, 0.09, f.z]} color={f.c} />
      ))}
    </Instances>
  );
}

function Lamp({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.12}>
        <cylinderGeometry args={[0.2, 0.26, 0.24, 8]} />
        <Toon color="#2f3550" />
      </mesh>
      <mesh position-y={1.35} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 2.5, 6]} />
        <Toon color="#2f3550" />
      </mesh>
      <mesh position-y={2.72}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <Toon color="#fff3c4" emissive="#ffd57a" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

// Proper park bench: wooden slats on cast-iron side frames.
function Bench({ x, z, rotY }) {
  const WOOD = '#c17a45';
  const IRON = '#3c4454';
  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      {/* Side frames: leg + armrest */}
      {[-0.72, 0.72].map((lx) => (
        <group key={lx} position-x={lx}>
          <mesh position={[0, 0.24, 0.12]} castShadow>
            <boxGeometry args={[0.09, 0.48, 0.09]} />
            <Toon color={IRON} />
          </mesh>
          <mesh position={[0, 0.24, -0.2]} castShadow>
            <boxGeometry args={[0.09, 0.48, 0.09]} />
            <Toon color={IRON} />
          </mesh>
          <mesh position={[0, 0.52, -0.02]}>
            <boxGeometry args={[0.09, 0.07, 0.52]} />
            <Toon color={IRON} />
          </mesh>
        </group>
      ))}
      {/* Seat slats */}
      {[0.12, -0.04, -0.2].map((sz) => (
        <mesh key={sz} position={[0, 0.5, sz]} castShadow>
          <boxGeometry args={[1.55, 0.055, 0.13]} />
          <Toon color={WOOD} />
        </mesh>
      ))}
      {/* Back slats */}
      {[0.72, 0.92].map((sy) => (
        <mesh key={sy} position={[0, sy, -0.29]} rotation-x={-0.14} castShadow>
          <boxGeometry args={[1.55, 0.14, 0.055]} />
          <Toon color={WOOD} />
        </mesh>
      ))}
    </group>
  );
}

function Cart({ x, z, rotY, kind }) {
  const isIce = kind === 'icecream';
  const accent = isIce ? '#ff7ab6' : '#4aa8ff';
  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      <mesh position-y={0.85} castShadow>
        <boxGeometry args={[1.7, 1, 1]} />
        <Toon color="#fff1dc" />
      </mesh>
      {/* Wheels */}
      {[-0.6, 0.6].map((wx) => (
        <mesh key={wx} position={[wx, 0.3, 0.52]} rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.1, 10]} />
          <Toon color="#2f3550" />
        </mesh>
      ))}
      {/* Awning */}
      <group position-y={2.15}>
        {[-0.68, -0.34, 0, 0.34, 0.68].map((sx, i) => (
          <mesh key={sx} position-x={sx} castShadow>
            <boxGeometry args={[0.34, 0.06, 1.3]} />
            <Toon color={i % 2 ? '#ffffff' : accent} />
          </mesh>
        ))}
      </group>
      {[-0.78, 0.78].map((px) => (
        <mesh key={px} position={[px, 1.6, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
          <Toon color="#8b5a2b" />
        </mesh>
      ))}
      {/* Topper: ice-cream cone or balloon bunch */}
      {isIce ? (
        <group position={[0, 2.55, 0]}>
          <mesh rotation-x={Math.PI}>
            <coneGeometry args={[0.16, 0.4, 8]} />
            <Toon color="#e0a860" />
          </mesh>
          <mesh position-y={0.28}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <Toon color="#ff7ab6" />
          </mesh>
        </group>
      ) : (
        <group position={[0, 2.7, 0]}>
          {[
            ['#ff5c5c', -0.2, 0],
            ['#ffd166', 0.2, 0.1],
            ['#4aa8ff', 0, -0.15],
          ].map(([c, bx, bz], i) => (
            <mesh key={i} position={[bx, i * 0.14, bz]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <Toon color={c} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function Fountain() {
  const water = useRef();
  useFrame((_, dt) => {
    if (water.current) water.current.rotation.y += dt * 0.25;
  });
  return (
    <group position={[FOUNTAIN.x, 0, FOUNTAIN.z]}>
      <mesh position-y={0.3} castShadow receiveShadow>
        <cylinderGeometry args={[2.55, 2.7, 0.6, 20]} />
        <Toon color="#dfe5ee" />
      </mesh>
      <mesh ref={water} position-y={0.62}>
        <cylinderGeometry args={[2.3, 2.3, 0.08, 20]} />
        <Toon color="#57d0ff" />
      </mesh>
      <mesh position-y={1.1} castShadow>
        <cylinderGeometry args={[0.32, 0.42, 1.1, 10]} />
        <Toon color="#c3cad6" />
      </mesh>
      <mesh position-y={1.75}>
        <cylinderGeometry args={[0.85, 0.6, 0.25, 12]} />
        <Toon color="#dfe5ee" />
      </mesh>
      <mesh position-y={2.05}>
        <sphereGeometry args={[0.28, 10, 10]} />
        <Toon color="#57d0ff" />
      </mesh>
    </group>
  );
}

const FLAG_COLORS = ['#ff5c5c', '#ffd166', '#2ec4b6', '#4aa8ff', '#ff7ab6'];

function EntranceArch() {
  const flags = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 9; i++) {
      const t = (i + 0.5) / 9;
      arr.push({
        x: -3.3 + t * 6.6,
        y: 4.1 - Math.sin(t * Math.PI) * 0.55,
        c: FLAG_COLORS[i % FLAG_COLORS.length],
      });
    }
    return arr;
  }, []);

  return (
    <group position={[GATE.x, 0, GATE.z]}>
      {[-3.6, 3.6].map((x) => (
        <group key={x} position-x={x}>
          <mesh position-y={2.3} castShadow>
            <cylinderGeometry args={[0.32, 0.42, 4.6, 10]} />
            <Toon color="#b56b3f" />
          </mesh>
          <mesh position-y={4.72}>
            <sphereGeometry args={[0.42, 10, 10]} />
            <Toon color="#ffd166" />
          </mesh>
        </group>
      ))}
      {/* Sign board */}
      <mesh position-y={5.35} castShadow>
        <boxGeometry args={[8.6, 1.25, 0.3]} />
        <Toon color="#96552f" />
      </mesh>
      <Text
        position={[0, 5.35, 0.18]}
        fontSize={0.62}
        color="#fff4de"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
        maxWidth={8}
      >
        {`${profile.name.toUpperCase()}'S PARK`}
      </Text>
      <Text
        position={[0, 5.35, -0.18]}
        rotation-y={Math.PI}
        fontSize={0.5}
        color="#fff4de"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        COME BACK SOON!
      </Text>
      {/* Bunting */}
      {flags.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, 0]} rotation-z={Math.PI}>
          <circleGeometry args={[0.24, 3]} />
          <meshBasicMaterial color={f.c} side={2} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds() {
  const group = useRef();
  const clouds = useMemo(
    () => [
      { x: -22, y: 17, z: -18, s: 1.4, v: 0.5 },
      { x: 8, y: 20, z: -28, s: 1.9, v: 0.35 },
      { x: 25, y: 16, z: 2, s: 1.2, v: 0.6 },
      { x: -10, y: 21, z: 14, s: 1.7, v: 0.4 },
      { x: 18, y: 18, z: 22, s: 1.3, v: 0.55 },
      { x: -30, y: 19, z: 4, s: 1.5, v: 0.45 },
    ],
    []
  );
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      c.position.x += clouds[i].v * dt;
      if (c.position.x > 55) c.position.x = -55;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          <mesh scale={[1.6, 0.6, 1]}>
            <sphereGeometry args={[1.3, 10, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[1.3, -0.1, 0.2]} scale={[1.1, 0.5, 0.9]}>
            <sphereGeometry args={[1.1, 10, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-1.4, -0.15, -0.1]} scale={[1, 0.45, 0.8]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function World() {
  const pathTex = useMemo(makePathTexture, []);
  return (
    <group>
      <Sky />
      <Island />
      {PATHS.map((p, i) => (
        <PathStrip key={i} p={p} tex={pathTex} />
      ))}
      <PathDashes />

      <Trees />
      <Flowers />
      {LAMPS.map((l, i) => (
        <Lamp key={i} {...l} />
      ))}
      {BENCHES.map((b, i) => (
        <Bench key={i} {...b} />
      ))}
      {CARTS.map((c, i) => (
        <Cart key={i} {...c} />
      ))}
      <Fountain />
      <EntranceArch />
      <Clouds />
    </group>
  );
}
