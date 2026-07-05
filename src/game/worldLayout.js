import { zones } from '../data/content';

// ---------------------------------------------------------------------------
// Deterministic world layout: paths, lamps, trees and the collision circles.
// A seeded RNG keeps the park identical on every visit and guarantees the
// rendered trees match the colliders the player bumps into.
// ---------------------------------------------------------------------------

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FOUNTAIN = { x: 0, z: 0, r: 2.7 };
export const WHEEL = { x: 0, z: -24, r: 3.8 };
export const GATE = { x: 0, z: 21 };

const BUILDING_RADIUS = { about: 2.3, tech: 3.0, contact: 2.6, arcade: 0 };
const buildingR = (zone) => BUILDING_RADIUS[zone.id] ?? 2.4; // project booths

// Arcade cabinets flank the path end in front of the ferris wheel.
export const CABINETS = [
  { x: -3.2, z: -19.2, rotY: 0.55 },
  { x: 3.2, z: -19.2, rotY: -0.55 },
];

// Path strips: { ax, az, bx, bz, w }
const RAW_PATHS = [
  { ax: 0, az: 22.5, bx: 0, bz: 4, w: 4.4 }, // gate -> plaza
  { ax: -3, az: 3, bx: -14.2, bz: 7.6, w: 3 }, // plaza -> about
  { ax: -3.2, az: -3.2, bx: -16.6, bz: -9.6, w: 3 }, // plaza -> tech
  { ax: 3.4, az: -3.4, bx: 18, bz: -8.2, w: 3.2 }, // plaza -> midway
  { ax: 13.6, az: -12.2, bx: 25.2, bz: -4, w: 2.6 }, // along the midway booths
  { ax: 3, az: 3, bx: 14, bz: 9.2, w: 3 }, // plaza -> contact
  { ax: 0, az: -4, bx: 0, bz: -19.5, w: 3 }, // plaza -> ferris wheel
];

// The plaza is a circle (r=6.45) around the fountain. Any path endpoint that
// falls inside it is slid outward along its own segment so paths butt cleanly
// against the plaza edge instead of criss-crossing over it. The strip meshes
// get w*0.3 of end padding, so aim just far enough out that the padded tip
// overlaps the plaza rim by ~0.35 (seamless join, no gap, no crossing).
function trimEndToPlaza(p) {
  const R = 6.1 + p.w * 0.3;
  const trim = (fromX, fromZ, toX, toZ) => {
    // Returns the point on the segment (from -> to), starting inside the
    // plaza circle, that sits at radius R from the origin.
    const dx = toX - fromX;
    const dz = toZ - fromZ;
    const len = Math.hypot(dx, dz);
    const ux = dx / len;
    const uz = dz / len;
    const b = 2 * (fromX * ux + fromZ * uz);
    const c = fromX * fromX + fromZ * fromZ - R * R;
    const disc = b * b - 4 * c;
    if (disc <= 0) return null;
    const t = (-b + Math.sqrt(disc)) / 2;
    if (t <= 0 || t >= len) return null;
    return { x: fromX + ux * t, z: fromZ + uz * t };
  };
  const out = { ...p };
  if (Math.hypot(p.ax, p.az) < R) {
    const q = trim(p.ax, p.az, p.bx, p.bz);
    if (q) {
      out.ax = q.x;
      out.az = q.z;
    }
  }
  if (Math.hypot(p.bx, p.bz) < R) {
    const q = trim(p.bx, p.bz, p.ax, p.az);
    if (q) {
      out.bx = q.x;
      out.bz = q.z;
    }
  }
  return out;
}

export const PATHS = RAW_PATHS.map(trimEndToPlaza);

export const LAMPS = [
  { x: -3.1, z: 17 },
  { x: 3.1, z: 17 },
  { x: -3.1, z: 9 },
  { x: 3.1, z: 9 },
  { x: -7.5, z: -1.5 },
  { x: 7.5, z: -1.5 },
  { x: -2.6, z: -14 },
  { x: 2.6, z: -14 },
];

// Park furniture: benches face their nearby path, carts add midway flavour.
export const BENCHES = [
  { x: -3.9, z: 13, rotY: Math.PI / 2 },
  { x: 3.9, z: 13, rotY: -Math.PI / 2 },
  { x: -8.8, z: 3.4, rotY: 2.55 },
  { x: 8.8, z: 3.4, rotY: -2.55 },
];

export const CARTS = [
  { x: 5.6, z: 8.6, rotY: -0.6, kind: 'icecream' },
  { x: -5, z: -8.8, rotY: 0.9, kind: 'balloon' },
];

function distToSegment(px, pz, a) {
  const dx = a.bx - a.ax;
  const dz = a.bz - a.az;
  const lenSq = dx * dx + dz * dz;
  let t = ((px - a.ax) * dx + (pz - a.az) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = a.ax + t * dx;
  const cz = a.az + t * dz;
  return Math.hypot(px - cx, pz - cz);
}

// --- Trees: rejection-sampled ring scatter -------------------------------
const rng = mulberry32(20260705);
const trees = [];
const keepOut = [
  ...zones.map((z) => ({ x: z.x, z: z.z, r: buildingR(z) + 4.2 })),
  { x: FOUNTAIN.x, z: FOUNTAIN.z, r: 7 },
  { x: WHEEL.x, z: WHEEL.z, r: 8.5 },
  { x: GATE.x, z: GATE.z, r: 6 },
];

let guard = 0;
while (trees.length < 42 && guard++ < 3000) {
  const ang = rng() * Math.PI * 2;
  const rad = 9 + rng() * 24.5;
  const x = Math.cos(ang) * rad;
  const z = Math.sin(ang) * rad;

  if (keepOut.some((k) => Math.hypot(x - k.x, z - k.z) < k.r)) continue;
  if (PATHS.some((p) => distToSegment(x, z, p) < p.w / 2 + 1.6)) continue;
  if (LAMPS.some((l) => Math.hypot(x - l.x, z - l.z) < 1.8)) continue;
  if (trees.some((t) => Math.hypot(x - t.x, z - t.z) < 3)) continue;

  trees.push({ x, z, s: 0.8 + rng() * 0.55, kind: rng() > 0.45 ? 0 : 1 });
}
export const TREES = trees;

// --- Flowers: purely decorative, no colliders ----------------------------
const flowers = [];
const flowerColors = ['#ff7ab6', '#ffd166', '#ffffff', '#b07cff', '#ff5c5c'];
guard = 0;
while (flowers.length < 60 && guard++ < 2000) {
  const ang = rng() * Math.PI * 2;
  const rad = 6 + rng() * 27;
  const x = Math.cos(ang) * rad;
  const z = Math.sin(ang) * rad;
  if (keepOut.some((k) => Math.hypot(x - k.x, z - k.z) < k.r - 2)) continue;
  if (PATHS.some((p) => distToSegment(x, z, p) < p.w / 2 + 0.4)) continue;
  flowers.push({ x, z, c: flowerColors[Math.floor(rng() * flowerColors.length)] });
}
export const FLOWERS = flowers;

// --- Collision circles the player is pushed out of -----------------------
export const COLLIDERS = [
  ...zones.filter((z) => buildingR(z) > 0).map((z) => ({ x: z.x, z: z.z, r: buildingR(z) })),
  ...CABINETS.map((c) => ({ x: c.x, z: c.z, r: 0.85 })),
  { x: FOUNTAIN.x, z: FOUNTAIN.z, r: FOUNTAIN.r },
  { x: WHEEL.x, z: WHEEL.z, r: WHEEL.r },
  { x: -3.6, z: GATE.z, r: 0.6 }, // arch pillars
  { x: 3.6, z: GATE.z, r: 0.6 },
  ...LAMPS.map((l) => ({ x: l.x, z: l.z, r: 0.35 })),
  ...BENCHES.map((b) => ({ x: b.x, z: b.z, r: 0.6 })),
  ...CARTS.map((c) => ({ x: c.x, z: c.z, r: 1 })),
  ...trees.map((t) => ({ x: t.x, z: t.z, r: 0.7 * t.s + 0.15 })),
];
