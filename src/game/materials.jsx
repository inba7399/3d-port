/* eslint-disable react-refresh/only-export-components -- shared material helpers live beside the Toon component on purpose */
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Cartoon look: a shared 3-step gradient turns MeshToonMaterial into clean
// cel shading, and small canvas-painted textures give the ground that
// hand-drawn mobile-game feel without downloading anything.
// ---------------------------------------------------------------------------

export const gradientMap = new THREE.DataTexture(
  new Uint8Array([120, 190, 255]),
  3,
  1,
  THREE.RedFormat
);
gradientMap.minFilter = THREE.NearestFilter;
gradientMap.magFilter = THREE.NearestFilter;
gradientMap.needsUpdate = true;

// Drop-in replacement for <meshStandardMaterial>: cel-shaded toon material.
export function Toon(props) {
  return <meshToonMaterial gradientMap={gradientMap} {...props} />;
}

// --- Grass: base green with lighter patches and little cartoon "blade"
// triangles (Animal-Crossing style). Tiles seamlessly.
export function makeGrassTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#72c94e';
  ctx.fillRect(0, 0, size, size);

  // Soft lighter patches
  ctx.fillStyle = 'rgba(255, 255, 210, 0.10)';
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 18 + Math.random() * 34;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiny triangle "blades" in two tones
  const tones = ['rgba(46, 140, 46, 0.5)', 'rgba(180, 235, 120, 0.55)'];
  for (let i = 0; i < 130; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const s = 3 + Math.random() * 4;
    ctx.fillStyle = tones[i % 2];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s, y);
    ctx.lineTo(x + s / 2, y - s * 1.4);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// --- Path: warm sand with sparse pebble speckles.
export function makePathTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#efdfae';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 26; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 1.5 + Math.random() * 3;
    ctx.fillStyle = i % 3 ? 'rgba(190, 160, 105, 0.35)' : 'rgba(255, 250, 225, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// --- Sky: three-stop gradient dome (deep zenith → airy mid → warm cream
// horizon), rendered inside-out and unaffected by fog.
export function makeSkyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color('#2b7fd4') },
      mid: { value: new THREE.Color('#8ec9f2') },
      horizon: { value: new THREE.Color('#f3ecd8') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vPos;
      uniform vec3 top;
      uniform vec3 mid;
      uniform vec3 horizon;
      void main() {
        float h = normalize(vPos).y * 0.5 + 0.5;
        float a = smoothstep(0.47, 0.56, h);   // horizon -> mid
        float b = smoothstep(0.56, 0.85, h);   // mid -> zenith
        vec3 col = mix(mix(horizon, mid, a), top, b);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}
