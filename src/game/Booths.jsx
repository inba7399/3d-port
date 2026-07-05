import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text, useTexture } from '@react-three/drei';
import { zones, orbitIcons } from '../data/content';
import { CABINETS } from './worldLayout';
import { Toon } from './materials';
import { isPointerLocked } from './input';

// ---------------------------------------------------------------------------
// The interactive stations of the park: about kiosk, tech-lab dome, three
// carnival project booths and the contact post office — plus the floating
// wayfinding markers and pulsing "stand here" rings for each zone.
// ---------------------------------------------------------------------------

function ZoneSign({ text, color, y = 4, visited = false }) {
  return (
    <Billboard position-y={y}>
      <Text
        fontSize={0.58}
        color="#ffffff"
        outlineWidth={0.045}
        outlineColor="#1c1c21"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        {text}
      </Text>
      <Text
        position-y={-0.62}
        fontSize={0.3}
        color={visited ? '#7ee787' : color}
        outlineWidth={0.03}
        outlineColor="#1c1c21"
        anchorX="center"
        anchorY="middle"
      >
        {visited ? '✓ VISITED' : '● WALK UP TO OPEN ●'}
      </Text>
    </Billboard>
  );
}

// Floating "?" badge over each attraction (clickable on desktop) plus a
// pulsing "stand here" ring on the ground. Once the section has been
// explored the badge flips to a green check.
function ZoneMarker({ zone, visited, onZoneOpen }) {
  const badge = useRef();
  const ring = useRef();
  const gl = useThree((s) => s.gl);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (badge.current) {
      badge.current.position.y = 5.35 + Math.sin(t * 2 + zone.x) * (visited ? 0.1 : 0.22);
    }
    if (ring.current) {
      const p = (t * 0.7 + zone.z * 0.1) % 1;
      ring.current.scale.setScalar(1 + p * 0.8);
      ring.current.material.opacity = (visited ? 0.3 : 0.65) * (1 - p);
    }
  });

  // Pointer-lock mode freezes the DOM cursor position, which would make
  // raycast clicks land in stale places — so badges only react when unlocked.
  const handleClick = (e) => {
    e.stopPropagation();
    if (isPointerLocked()) return;
    onZoneOpen?.(zone);
  };
  const hover = (on) => {
    if (isPointerLocked()) return;
    gl.domElement.style.cursor = on ? 'pointer' : '';
  };

  const len = Math.hypot(zone.x, zone.z) || 1;
  const rx = zone.x - (zone.x / len) * 3;
  const rz = zone.z - (zone.z / len) * 3;
  const accent = visited ? '#4fc06a' : zone.color;

  return (
    <>
      <group ref={badge} position={[zone.x, 5.35, zone.z]} scale={visited ? 0.78 : 1}>
        <Billboard>
          <group
            onClick={handleClick}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
          >
            <mesh>
              <circleGeometry args={[0.52, 24]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position-z={-0.01}>
              <ringGeometry args={[0.52, 0.64, 24]} />
              <meshBasicMaterial color={accent} />
            </mesh>
            <Text
              position-z={0.01}
              fontSize={0.62}
              color={visited ? '#2c8c47' : '#22262e'}
              anchorX="center"
              anchorY="middle"
            >
              {visited ? '✓' : '?'}
            </Text>
          </group>
        </Billboard>
      </group>
      <mesh ref={ring} position={[rx, 0.11, rz]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.15, 1.42, 36]} />
        <meshBasicMaterial color={accent} transparent depthWrite={false} />
      </mesh>
    </>
  );
}

// --- About: round info kiosk ------------------------------------------------
function AboutKiosk({ zone, visited }) {
  return (
    <group position={[zone.x, 0, zone.z]} rotation-y={zone.rotY}>
      <mesh position-y={1.1} castShadow>
        <cylinderGeometry args={[1.7, 1.8, 2.2, 10]} />
        <Toon color="#fff1dc" />
      </mesh>
      {/* Counter window */}
      <mesh position={[0, 1.35, 1.62]}>
        <boxGeometry args={[1.5, 0.9, 0.18]} />
        <Toon color="#26324d" />
      </mesh>
      <mesh position={[0, 0.82, 1.68]}>
        <boxGeometry args={[1.7, 0.16, 0.3]} />
        <Toon color={zone.color} />
      </mesh>
      {/* Roof */}
      <mesh position-y={2.85} castShadow>
        <coneGeometry args={[2.25, 1.5, 10]} />
        <Toon color={zone.color} flatShading />
      </mesh>
      <mesh position-y={3.75}>
        <sphereGeometry args={[0.24, 8, 8]} />
        <Toon color="#ffd166" />
      </mesh>
      <ZoneSign text={zone.sign} color={zone.color} y={4.4} visited={visited} />
    </group>
  );
}

// --- Tech: glass dome with orbiting tech icons -------------------------------
function TechLab({ zone, visited }) {
  const orbit = useRef();
  const textures = useTexture(orbitIcons);
  useFrame((_, dt) => {
    if (orbit.current) orbit.current.rotation.y += dt * 0.35;
  });
  return (
    <group position={[zone.x, 0, zone.z]}>
      <mesh position-y={0.35} castShadow receiveShadow>
        <cylinderGeometry args={[2.9, 3.1, 0.7, 14]} />
        <Toon color="#3a4160" />
      </mesh>
      <mesh position-y={0.72} castShadow>
        <sphereGeometry args={[2.55, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Toon color={zone.color} transparent opacity={0.55} />
      </mesh>
      <mesh position-y={0.72}>
        <sphereGeometry args={[1.15, 12, 10]} />
        <Toon color="#ffffff" emissive={zone.color} emissiveIntensity={0.35} />
      </mesh>
      {/* Orbiting icons */}
      <group ref={orbit} position-y={2.2}>
        {textures.map((tex, i) => {
          const a = (i / textures.length) * Math.PI * 2;
          return (
            <sprite
              key={i}
              position={[Math.cos(a) * 3.5, Math.sin(i * 2.1) * 0.55, Math.sin(a) * 3.5]}
              scale={0.95}
            >
              <spriteMaterial map={tex} transparent />
            </sprite>
          );
        })}
      </group>
      <ZoneSign text={zone.sign} color={zone.color} y={4.6} visited={visited} />
    </group>
  );
}

// --- Projects: carnival stall with striped awning ----------------------------
function Balloons({ color, position }) {
  const g = useRef();
  useFrame((state) => {
    if (g.current) g.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.6 + position[0]) * 0.12;
  });
  const balloons = [
    { p: [0, 0, 0], c: color },
    { p: [0.34, 0.3, 0.1], c: '#ffffff' },
    { p: [-0.3, 0.42, -0.08], c: '#ffd166' },
  ];
  return (
    <group ref={g} position={position}>
      {balloons.map((b, i) => (
        <group key={i} position={b.p}>
          <mesh>
            <sphereGeometry args={[0.28, 10, 10]} />
            <Toon color={b.c} />
          </mesh>
          <mesh position-y={-0.65} scale={[1, 1, 1]}>
            <cylinderGeometry args={[0.008, 0.008, 0.85, 3]} />
            <meshBasicMaterial color="#555" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Striped circus tent — the project attractions.
function ProjectBooth({ zone, visited }) {
  const SLICES = 8;
  return (
    <group position={[zone.x, 0, zone.z]} rotation-y={zone.rotY}>
      {/* Round tent wall */}
      <mesh position-y={0.9} castShadow receiveShadow>
        <cylinderGeometry args={[1.85, 1.95, 1.8, 12]} />
        <Toon color="#fff6e8" />
      </mesh>
      {/* Wall trim */}
      <mesh position-y={1.82} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[1.9, 0.09, 6, 20]} />
        <Toon color={zone.color} />
      </mesh>
      {/* Striped conical roof (alternating slices) */}
      <group position-y={2.72}>
        {Array.from({ length: SLICES }, (_, i) => (
          <mesh
            key={i}
            castShadow={i === 0}
            rotation-y={(i / SLICES) * Math.PI * 2}
          >
            <coneGeometry
              args={[2.35, 1.9, 3, 1, false, 0, (Math.PI * 2) / SLICES]}
            />
            <Toon color={i % 2 ? '#ffffff' : zone.color} flatShading />
          </mesh>
        ))}
      </group>
      {/* Apex ball + pennant */}
      <mesh position-y={3.75}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <Toon color="#ffd166" />
      </mesh>
      <mesh position={[0.28, 3.95, 0]} rotation-z={-Math.PI / 2}>
        <circleGeometry args={[0.26, 3]} />
        <meshBasicMaterial color={zone.color} side={2} />
      </mesh>
      {/* Entrance opening with tied-back flaps */}
      <mesh position={[0, 0.8, 1.86]}>
        <boxGeometry args={[1.05, 1.6, 0.12]} />
        <Toon color="#26232e" />
      </mesh>
      {[-0.62, 0.62].map((fx) => (
        <mesh key={fx} position={[fx, 0.95, 1.88]} rotation-z={fx > 0 ? -0.2 : 0.2}>
          <boxGeometry args={[0.28, 1.5, 0.1]} />
          <Toon color={zone.color} />
        </mesh>
      ))}
      {/* Little marquee screen above the entrance */}
      <mesh position={[0, 2.1, 1.72]} rotation-x={-0.15} castShadow>
        <boxGeometry args={[1.3, 0.6, 0.1]} />
        <Toon color="#1c1c21" emissive={zone.color} emissiveIntensity={0.35} />
      </mesh>
      <Balloons color={zone.color} position={[1.9, 2.9, 0.7]} />
      <ZoneSign text={zone.sign} color={zone.color} y={4.55} visited={visited} />
    </group>
  );
}

// Two retro arcade cabinets in front of the ferris wheel.
function ArcadeCorner({ zone, visited }) {
  const screen = useRef();
  useFrame((state) => {
    if (screen.current) {
      screen.current.material.emissiveIntensity = 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
    }
  });
  return (
    <group>
      {CABINETS.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]} rotation-y={c.rotY}>
          {/* Body */}
          <mesh position-y={0.85} castShadow>
            <boxGeometry args={[0.95, 1.7, 0.85]} />
            <Toon color={i === 0 ? '#2f3550' : '#4a2f55'} />
          </mesh>
          {/* Marquee */}
          <mesh position={[0, 1.78, 0.1]} rotation-x={0.25} castShadow>
            <boxGeometry args={[0.95, 0.3, 0.5]} />
            <Toon color={zone.color} />
          </mesh>
          {/* Screen (shared pulsing material on the first cabinet) */}
          <mesh ref={i === 0 ? screen : undefined} position={[0, 1.25, 0.45]} rotation-x={-0.18}>
            <boxGeometry args={[0.72, 0.55, 0.06]} />
            <Toon color="#101418" emissive="#39e6d0" emissiveIntensity={0.55} />
          </mesh>
          {/* Control shelf + joystick + buttons */}
          <mesh position={[0, 0.88, 0.5]} rotation-x={0.3}>
            <boxGeometry args={[0.85, 0.1, 0.4]} />
            <Toon color="#e8edf5" />
          </mesh>
          <mesh position={[-0.2, 1.05, 0.56]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <Toon color="#ff5c5c" />
          </mesh>
          <mesh position={[0.14, 1, 0.58]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
            <Toon color="#ffd166" />
          </mesh>
          <mesh position={[0.3, 1, 0.56]}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
            <Toon color="#4aa8ff" />
          </mesh>
        </group>
      ))}
      <group position={[zone.x, 0, zone.z]}>
        <ZoneSign text={zone.sign} color={zone.color} y={4.4} visited={visited} />
      </group>
    </group>
  );
}

// --- Contact: little post office ---------------------------------------------
function ContactPost({ zone, visited }) {
  const flag = useRef();
  useFrame((state) => {
    if (flag.current) flag.current.rotation.z = 0.5 + Math.sin(state.clock.elapsedTime * 2.4) * 0.16;
  });
  return (
    <group position={[zone.x, 0, zone.z]} rotation-y={zone.rotY}>
      {/* House */}
      <mesh position-y={1.05} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.1, 2.2]} />
        <Toon color="#fff1dc" />
      </mesh>
      {/* Door */}
      <mesh position={[-0.35, 0.78, 1.12]}>
        <boxGeometry args={[0.72, 1.55, 0.06]} />
        <Toon color="#8b5a2b" />
      </mesh>
      {/* Heart window */}
      <mesh position={[0.55, 1.5, 1.12]}>
        <boxGeometry args={[0.6, 0.6, 0.06]} />
        <Toon color="#26324d" />
      </mesh>
      {/* Pyramid roof */}
      <mesh position-y={2.72} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[2.05, 1.35, 4]} />
        <Toon color={zone.color} flatShading />
      </mesh>
      {/* Mailbox on a post */}
      <group position={[1.85, 0, 1.1]}>
        <mesh position-y={0.55}>
          <cylinderGeometry args={[0.06, 0.06, 1.1, 6]} />
          <Toon color="#8b5a2b" />
        </mesh>
        <mesh position-y={1.22} rotation-x={Math.PI / 2} castShadow>
          <capsuleGeometry args={[0.26, 0.5, 4, 10]} />
          <Toon color="#ff5c5c" />
        </mesh>
        <mesh ref={flag} position={[0.02, 1.45, -0.28]}>
          <boxGeometry args={[0.06, 0.4, 0.18]} />
          <Toon color="#ffd166" />
        </mesh>
      </group>
      <ZoneSign text={zone.sign} color={zone.color} y={4.5} visited={visited} />
    </group>
  );
}

export default function Booths({ onZoneOpen, visited }) {
  return (
    <group>
      {zones.map((zone) => {
        let Building;
        if (zone.id === 'about') Building = AboutKiosk;
        else if (zone.id === 'tech') Building = TechLab;
        else if (zone.id === 'contact') Building = ContactPost;
        else if (zone.id === 'arcade') Building = ArcadeCorner;
        else Building = ProjectBooth;
        const isVisited = visited?.has(zone.panel) ?? false;
        return (
          <group key={zone.id}>
            <Building zone={zone} visited={isVisited} />
            <ZoneMarker zone={zone} visited={isVisited} onZoneOpen={onZoneOpen} />
          </group>
        );
      })}
    </group>
  );
}
