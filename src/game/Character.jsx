import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Toon } from './materials';

// ---------------------------------------------------------------------------
// Procedural low-poly person (~1.9 units tall) with a walk cycle driven by
// `animRef.current = { speed, phase }` which the Player updates every frame.
// speed is 0..1 (idle..full run), phase advances with distance travelled.
// ---------------------------------------------------------------------------

const SKIN = '#f2c094';
const HAIR = '#2b2118';
const HOODIE = '#ff5c5c';
const PANTS = '#2f3550';
const SHOES = '#f5f5f5';
const BACKPACK = '#ffd166';

export default function Character({ animRef }) {
  const body = useRef();
  const head = useRef();
  const armL = useRef();
  const armR = useRef();
  const legL = useRef();
  const legR = useRef();

  useFrame((state) => {
    const { speed, phase, airborne } = animRef.current;
    const t = state.clock.elapsedTime;

    // Limb swing scales with movement speed; a gentle idle sway remains.
    // Airborne: tuck the legs and raise the arms.
    const swing = airborne ? 0.55 : Math.sin(phase) * 0.85 * speed;
    const idleSway = Math.sin(t * 2) * 0.04 * (1 - speed);

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = airborne ? 0.4 : -swing;
    if (armL.current) {
      armL.current.rotation.x = -swing * 0.9 + idleSway;
      armL.current.rotation.z = 0.12 + speed * 0.08;
    }
    if (armR.current) {
      armR.current.rotation.x = swing * 0.9 - idleSway;
      armR.current.rotation.z = -0.12 - speed * 0.08;
    }

    if (body.current) {
      // Bob while walking, breathe while idle, small forward lean at speed.
      const bob = Math.abs(Math.sin(phase)) * 0.08 * speed;
      const breathe = Math.sin(t * 2.2) * 0.012 * (1 - speed);
      body.current.position.y = bob + breathe;
      body.current.rotation.x = speed * 0.12;
    }
    if (head.current) {
      head.current.rotation.z = Math.sin(phase * 0.5) * 0.05 * speed;
    }
  });

  return (
    <group>
      <group ref={body}>
        {/* Legs (pivot at the hip) */}
        <group ref={legL} position={[-0.16, 0.95, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.55, 3, 8]} />
            <Toon color={PANTS} />
          </mesh>
          <mesh position={[0, -0.82, 0.07]} castShadow>
            <boxGeometry args={[0.2, 0.14, 0.34]} />
            <Toon color={SHOES} />
          </mesh>
        </group>
        <group ref={legR} position={[0.16, 0.95, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.55, 3, 8]} />
            <Toon color={PANTS} />
          </mesh>
          <mesh position={[0, -0.82, 0.07]} castShadow>
            <boxGeometry args={[0.2, 0.14, 0.34]} />
            <Toon color={SHOES} />
          </mesh>
        </group>

        {/* Torso — hoodie */}
        <mesh position={[0, 1.32, 0]} castShadow>
          <capsuleGeometry args={[0.34, 0.5, 4, 12]} />
          <Toon color={HOODIE} />
        </mesh>
        {/* Hood bump behind the neck */}
        <mesh position={[0, 1.62, -0.18]} castShadow>
          <sphereGeometry args={[0.18, 10, 8]} />
          <Toon color={HOODIE} />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 1.32, -0.34]} castShadow>
          <boxGeometry args={[0.42, 0.5, 0.22]} />
          <Toon color={BACKPACK} />
        </mesh>

        {/* Arms (pivot at the shoulder) */}
        <group ref={armL} position={[-0.44, 1.55, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.42, 3, 8]} />
            <Toon color={HOODIE} />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <Toon color={SKIN} />
          </mesh>
        </group>
        <group ref={armR} position={[0.44, 1.55, 0]}>
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.42, 3, 8]} />
            <Toon color={HOODIE} />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <Toon color={SKIN} />
          </mesh>
        </group>

        {/* Head */}
        <group ref={head} position={[0, 2.02, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 16, 14]} />
            <Toon color={SKIN} />
          </mesh>
          {/* Hair cap */}
          <mesh position={[0, 0.08, -0.03]}>
            <sphereGeometry args={[0.31, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <Toon color={HAIR} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.11, 0.02, 0.27]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#1c1c21" />
          </mesh>
          <mesh position={[0.11, 0.02, 0.27]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#1c1c21" />
          </mesh>
          {/* Smile */}
          <mesh position={[0, -0.1, 0.26]} rotation-z={Math.PI}>
            <torusGeometry args={[0.07, 0.016, 6, 10, Math.PI]} />
            <meshBasicMaterial color="#a34a2a" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
