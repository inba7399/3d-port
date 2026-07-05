import { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Character from './Character';
import HeroCharacter from './HeroCharacter';
import { readMoveVector, input, resetCam } from './input';
import { COLLIDERS } from './worldLayout';
import { zones, SPAWN, PARK_RADIUS } from '../data/content';

const MAX_SPEED = 6.4;
const PLAYER_R = 0.45;
const { damp } = THREE.MathUtils;

// Frame-rate independent shortest-path angle damping.
function dampAngle(current, target, lambda, dt) {
  let diff = (target - current) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * (1 - Math.exp(-lambda * dt));
}

export default function Player({ started, isTouch, onZoneChange, teleportRef }) {
  const group = useRef();
  const camera = useThree((s) => s.camera);

  const charLift = useRef();
  const refs = useMemo(
    () => ({
      vel: new THREE.Vector2(0, 0),
      move: { x: 0, z: 0 },
      heading: Math.PI, // face north (toward the park)
      anim: { speed: 0, phase: 0, airborne: false },
      jumpY: 0,
      jumpVy: 0,
      look: new THREE.Vector3(SPAWN.x, 1.4, SPAWN.z - 4),
      cam: { yaw: 0, elev: 0.72, dist: 16 }, // damped copy of input.cam
      camSnapped: false,
      activeZone: null,
    }),
    []
  );

  // A slightly higher, further camera reads better on small screens.
  useEffect(() => {
    resetCam(isTouch);
    refs.cam.yaw = input.cam.yaw;
    refs.cam.elev = input.cam.elev;
    refs.cam.dist = input.cam.dist;
  }, [isTouch, refs]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20); // avoid tunnelling after tab-switch stalls
    const g = group.current;
    if (!g) return;

    // ---- Intro: slow orbit over the park until the visitor presses start.
    if (!started) {
      const t = state.clock.elapsedTime * 0.06;
      camera.position.set(Math.sin(t) * 30, 17, Math.cos(t) * 30 + 4);
      camera.lookAt(0, 2, -2);
      return;
    }

    // ---- Teleport (fast travel) — applied once per request.
    if (teleportRef.current) {
      const { x, z } = teleportRef.current;
      teleportRef.current = null;
      g.position.set(x, 0, z);
      refs.vel.set(0, 0);
      refs.heading = Math.PI;
      input.cam.yaw = 0;
      refs.cam.yaw = 0;
      refs.camSnapped = true;
      const horiz = refs.cam.dist * Math.cos(refs.cam.elev);
      camera.position.set(
        x + Math.sin(refs.cam.yaw) * horiz,
        refs.cam.dist * Math.sin(refs.cam.elev),
        z + Math.cos(refs.cam.yaw) * horiz
      );
      refs.look.set(x, 1.4, z);
    }

    // ---- Camera orbit state (damped toward the input targets) ------------
    refs.cam.yaw = damp(refs.cam.yaw, input.cam.yaw, 10, dt);
    refs.cam.elev = damp(refs.cam.elev, input.cam.elev, 10, dt);
    refs.cam.dist = damp(refs.cam.dist, input.cam.dist, 6, dt);
    const yaw = refs.cam.yaw;
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);

    // ---- Movement (camera-relative: "up" walks away from the camera) -----
    readMoveVector(refs.move);
    const wx = refs.move.x * cosY + refs.move.z * sinY;
    const wz = -refs.move.x * sinY + refs.move.z * cosY;
    refs.vel.x = damp(refs.vel.x, wx * MAX_SPEED, 9, dt);
    refs.vel.y = damp(refs.vel.y, wz * MAX_SPEED, 9, dt);

    g.position.x += refs.vel.x * dt;
    g.position.z += refs.vel.y * dt;

    // Push out of obstacle circles.
    for (let i = 0; i < COLLIDERS.length; i++) {
      const c = COLLIDERS[i];
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const min = c.r + PLAYER_R;
      const distSq = dx * dx + dz * dz;
      if (distSq < min * min && distSq > 1e-6) {
        const dist = Math.sqrt(distSq);
        g.position.x = c.x + (dx / dist) * min;
        g.position.z = c.z + (dz / dist) * min;
      }
    }
    // Keep inside the park.
    const radial = Math.hypot(g.position.x, g.position.z);
    const maxR = PARK_RADIUS - PLAYER_R;
    if (radial > maxR) {
      g.position.x *= maxR / radial;
      g.position.z *= maxR / radial;
    }

    // ---- Jump --------------------------------------------------------------
    if (input.jumpQueued) {
      input.jumpQueued = false;
      if (refs.jumpY <= 0.001) refs.jumpVy = 8.2;
    }
    if (refs.jumpVy !== 0 || refs.jumpY > 0) {
      refs.jumpVy -= 24 * dt; // chunky cartoon gravity
      refs.jumpY += refs.jumpVy * dt;
      if (refs.jumpY <= 0) {
        refs.jumpY = 0;
        refs.jumpVy = 0;
      }
    }
    refs.anim.airborne = refs.jumpY > 0.03;
    if (charLift.current) charLift.current.position.y = refs.jumpY;

    // ---- Animation + facing ----------------------------------------------
    const speed = refs.vel.length();
    const speed01 = Math.min(speed / MAX_SPEED, 1);
    refs.anim.phase += speed * dt * 2.2;
    refs.anim.speed = damp(refs.anim.speed, speed01, 10, dt);
    if (speed01 > 0.05) {
      refs.heading = dampAngle(refs.heading, Math.atan2(refs.vel.x, refs.vel.y), 12, dt);
    }
    g.rotation.y = refs.heading;

    // ---- Camera follow ----------------------------------------------------
    // The damp pulls the intro-orbit camera down in a smooth swoop first.
    const horiz = refs.cam.dist * Math.cos(refs.cam.elev);
    const camY = refs.cam.dist * Math.sin(refs.cam.elev);
    const lam = refs.camSnapped ? 5 : 2.2;
    camera.position.x = damp(camera.position.x, g.position.x + sinY * horiz, lam, dt);
    camera.position.y = damp(camera.position.y, camY, lam, dt);
    camera.position.z = damp(camera.position.z, g.position.z + cosY * horiz, lam, dt);
    if (!refs.camSnapped && Math.abs(camera.position.y - camY) < 0.3) refs.camSnapped = true;

    // Look slightly ahead of the direction of travel.
    refs.look.x = damp(refs.look.x, g.position.x + refs.vel.x * 0.22, 5, dt);
    refs.look.y = damp(refs.look.y, 1.4, 5, dt);
    refs.look.z = damp(refs.look.z, g.position.z + refs.vel.y * 0.22, 5, dt);
    camera.lookAt(refs.look);

    // ---- Zone detection ----------------------------------------------------
    let nearest = null;
    let nearestDist = Infinity;
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      const d = Math.hypot(g.position.x - z.x, g.position.z - z.z);
      if (d < z.triggerRadius && d < nearestDist) {
        nearest = z;
        nearestDist = d;
      }
    }
    const id = nearest ? nearest.id : null;
    if (id !== refs.activeZone) {
      refs.activeZone = id;
      onZoneChange(nearest || null);
    }
  });

  return (
    <group ref={group} position={[SPAWN.x, 0, SPAWN.z]} rotation-y={Math.PI}>
      {/* Soft blob shadow keeps the character grounded on all devices.
          Sits just above the path strips (top at y=0.08). */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.1}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial color="#1d3a12" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {/* The lift group carries the character during jumps while the blob
          shadow stays on the ground. */}
      <group ref={charLift}>
        {/* Downloaded animated knight; the procedural buddy renders instantly
            while the GLB streams in. */}
        <Suspense fallback={<Character animRef={{ current: refs.anim }} />}>
          <HeroCharacter animRef={{ current: refs.anim }} />
        </Suspense>
      </group>
    </group>
  );
}
