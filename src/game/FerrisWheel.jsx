import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { WHEEL } from './worldLayout';
import { Toon } from './materials';

const CABIN_COLORS = ['#ff5c5c', '#ffd166', '#2ec4b6', '#4aa8ff', '#ff7ab6', '#b07cff', '#ff9f43', '#6fca5a'];
const RADIUS = 6.8;
const HUB_Y = 8.2;
const SPEED = 0.16;
const STRUCT = '#f4f7fb'; // white lattice like the classic park wheel

export default function FerrisWheel() {
  const wheel = useRef();
  const cabins = useRef([]);

  useFrame((state) => {
    const rot = state.clock.elapsedTime * SPEED;
    if (wheel.current) wheel.current.rotation.z = rot;
    // Counter-rotate so the cabins hang upright.
    cabins.current.forEach((c) => {
      if (c) c.rotation.z = -rot;
    });
  });

  return (
    <group position={[WHEEL.x, 0, WHEEL.z]}>
      {/* A-frame supports, front and back */}
      {[-1, 1].map((side) =>
        [-1.1, 1.1].map((zs) => (
          <mesh
            key={`${side}${zs}`}
            position={[side * 1.7, HUB_Y / 2, zs]}
            rotation-z={side * -0.2}
            castShadow
          >
            <cylinderGeometry args={[0.14, 0.2, HUB_Y + 0.9, 8]} />
            <Toon color={STRUCT} />
          </mesh>
        ))
      )}
      {/* Cross braces between the legs */}
      {[-1.1, 1.1].map((zs) => (
        <mesh key={zs} position={[0, HUB_Y * 0.45, zs]}>
          <boxGeometry args={[2.9, 0.14, 0.14]} />
          <Toon color={STRUCT} />
        </mesh>
      ))}
      {/* Base platform */}
      <mesh position-y={0.3} castShadow receiveShadow>
        <boxGeometry args={[6, 0.6, 3.6]} />
        <Toon color="#cfd8e6" />
      </mesh>
      <mesh position-y={0.66}>
        <boxGeometry args={[6.5, 0.14, 4.1]} />
        <Toon color="#b8c3d4" />
      </mesh>
      {/* Hub axle */}
      <mesh position-y={HUB_Y} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.26, 0.26, 2.6, 12]} />
        <Toon color="#aab6c8" />
      </mesh>

      {/* Rotating wheel: double white rim + lattice spokes */}
      <group ref={wheel} position-y={HUB_Y}>
        {[-0.55, 0.55].map((zs) => (
          <group key={zs} position-z={zs}>
            <mesh>
              <torusGeometry args={[RADIUS, 0.11, 8, 44]} />
              <Toon color={STRUCT} />
            </mesh>
            <mesh>
              <torusGeometry args={[RADIUS * 0.45, 0.07, 6, 30]} />
              <Toon color={STRUCT} />
            </mesh>
            {/* Spokes */}
            {Array.from({ length: 12 }, (_, i) => (
              <mesh key={i} rotation-z={(i / 12) * Math.PI * 2}>
                <boxGeometry args={[0.09, RADIUS * 2, 0.09]} />
                <Toon color={STRUCT} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Struts connecting the two rims */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <mesh key={i} position={[Math.cos(a) * RADIUS, Math.sin(a) * RADIUS, 0]}>
              <boxGeometry args={[0.09, 0.09, 1.1]} />
              <Toon color={STRUCT} />
            </mesh>
          );
        })}
        {/* Hub cap */}
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.6, 0.6, 1.5, 12]} />
          <Toon color="#ffd166" />
        </mesh>
        {/* Cabins hang between the rims and stay upright */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * RADIUS, Math.sin(a) * RADIUS, 0]}>
              <group ref={(el) => (cabins.current[i] = el)}>
                <mesh position-y={-0.8} castShadow>
                  <boxGeometry args={[0.95, 0.85, 0.95]} />
                  <Toon color={CABIN_COLORS[i]} />
                </mesh>
                <mesh position-y={-0.28}>
                  <coneGeometry args={[0.72, 0.42, 4]} />
                  <Toon color="#ffffff" />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
