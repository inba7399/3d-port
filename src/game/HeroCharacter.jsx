import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { gradientMap } from './materials';

// ---------------------------------------------------------------------------
// The playable character: "Knight" from the KayKit Adventurers pack (CC0,
// see public/models/CREDITS.txt). Weapons/shields are hidden so he reads as
// a friendly park visitor; materials are swapped to toon to match the park.
// Driven by animRef {speed 0..1, phase} exactly like the procedural fallback.
// ---------------------------------------------------------------------------

const HIDDEN = /Sword|Shield|Wand|Staff|Spellbook|Knife|Crossbow|Throwable|Offhand/i;
const FADE = 0.18;

export default function HeroCharacter({ animRef }) {
  const group = useRef();
  const { scene, animations } = useGLTF('/models/character.glb');
  const { actions } = useAnimations(animations, group);
  const current = useRef('Idle');

  useEffect(() => {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      if (HIDDEN.test(o.name)) {
        o.visible = false;
        return;
      }
      o.castShadow = true;
      // Skinned meshes can vanish from aggressive frustum culling.
      o.frustumCulled = false;
      if (!o.userData.toonified) {
        const old = o.material;
        o.material = new THREE.MeshToonMaterial({
          map: old.map ?? null,
          color: old.color?.clone() ?? new THREE.Color('#ffffff'),
          gradientMap,
        });
        o.userData.toonified = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    actions.Idle?.reset().play();
  }, [actions]);

  useFrame(() => {
    const { speed, airborne } = animRef.current;
    const target = airborne
      ? 'Jump_Idle'
      : speed < 0.12
        ? 'Idle'
        : speed < 0.6
          ? 'Walking_A'
          : 'Running_A';
    if (target !== current.current && actions[target]) {
      actions[current.current]?.fadeOut(airborne ? 0.08 : FADE);
      actions[target].reset().fadeIn(airborne ? 0.08 : FADE).play();
      current.current = target;
    }
    // Sync stride to actual velocity to reduce foot sliding.
    const action = actions[current.current];
    if (action && (current.current === 'Walking_A' || current.current === 'Running_A')) {
      action.timeScale = 0.65 + speed * 0.75;
    }
  });

  return (
    <group ref={group} scale={0.95}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/character.glb');
