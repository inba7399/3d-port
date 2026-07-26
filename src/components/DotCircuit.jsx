import { useEffect, useRef } from 'react';

// Dot-matrix backdrop with subtle "electricity" pulses that travel from dot
// to dot along the grid like circuit traces. Canvas-based:
// - static dots are pre-rendered once to an offscreen layer (cheap frames)
// - only a handful of pulses live at once (fewer on small screens)
// - the loop pauses while the hero is off-screen
// - reduce-motion users get the static dots only

const GAP = 30; // grid spacing, matches the old CSS dot pattern
const DOT_ALPHA = 0.16;
const COLORS = ['#8b7bff', '#5ec8f8', '#34d399', '#ff7ab6', '#ffd166'];
const TRAIL = 5; // how many cells of tail stay lit behind the head

export default function DotCircuit() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gridLayer = document.createElement('canvas');

    let raf = 0;
    let visible = true;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let pulses = [];
    let lastSpawn = 0;

    const px = (cell) => cell * GAP + GAP / 2;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      cols = Math.max(0, Math.floor(W / GAP) - 1);
      rows = Math.max(0, Math.floor(H / GAP) - 1);

      // pre-render the static dot grid
      gridLayer.width = canvas.width;
      gridLayer.height = canvas.height;
      const g = gridLayer.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = `rgba(255, 255, 255, ${DOT_ALPHA})`;
      for (let c = 0; c <= cols; c += 1) {
        for (let r = 0; r <= rows; r += 1) {
          g.beginPath();
          g.arc(px(c), px(r), 1, 0, Math.PI * 2);
          g.fill();
        }
      }

      if (reduced) {
        // static dots only
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(gridLayer, 0, 0);
      }
    };

    // Build a random dot-to-dot path with occasional 90° turns.
    const spawn = (now) => {
      if (cols < 6 || rows < 6) return;
      let c = Math.floor(Math.random() * (cols + 1));
      let r = Math.floor(Math.random() * (rows + 1));
      let dir = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ][Math.floor(Math.random() * 4)];
      const len = 8 + Math.floor(Math.random() * 12);
      const path = [[c, r]];
      for (let i = 0; i < len; i += 1) {
        if (Math.random() < 0.25) {
          dir = Math.random() < 0.5 ? [dir[1], dir[0]] : [-dir[1], -dir[0]];
        }
        c += dir[0];
        r += dir[1];
        if (c < 0 || c > cols || r < 0 || r > rows) break;
        path.push([c, r]);
      }
      if (path.length < 4) return;
      pulses.push({
        path,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: 8 + Math.random() * 6, // cells per second
        start: now,
      });
    };

    const drawPulse = (p, now) => {
      const prog = ((now - p.start) / 1000) * p.speed;
      const last = p.path.length - 1;
      if (prog > last + TRAIL + 1) return false; // tail fully drained

      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.lineWidth = 1.1;

      const headClamped = Math.min(prog, last);
      const headIdx = Math.floor(headClamped);

      // tail: per-cell segments fading out behind the head
      for (let k = Math.max(0, Math.ceil(prog - TRAIL) - 1); k < headIdx; k += 1) {
        const fade = 1 - (prog - (k + 1)) / TRAIL;
        if (fade <= 0) continue;
        ctx.globalAlpha = fade * 0.45;
        ctx.beginPath();
        ctx.moveTo(px(p.path[k][0]), px(p.path[k][1]));
        ctx.lineTo(px(p.path[k + 1][0]), px(p.path[k + 1][1]));
        ctx.stroke();
        // re-light the dot the pulse just passed through
        ctx.globalAlpha = fade * 0.8;
        ctx.beginPath();
        ctx.arc(px(p.path[k + 1][0]), px(p.path[k + 1][1]), 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // head: partial segment + glowing dot
      if (prog <= last + 0.999) {
        const t = headClamped - headIdx;
        const [c0, r0] = p.path[headIdx];
        const [c1, r1] = p.path[Math.min(headIdx + 1, last)];
        const hx = px(c0) + (px(c1) - px(c0)) * t;
        const hy = px(r0) + (px(r1) - px(r0)) * t;

        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(px(c0), px(r0));
        ctx.lineTo(hx, hy);
        ctx.stroke();

        const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 11);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(hx, hy, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.95;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(hx, hy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      return true;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(gridLayer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const maxPulses = W < 640 ? 4 : 7;
      if (pulses.length < maxPulses && now - lastSpawn > 300 + Math.random() * 600) {
        lastSpawn = now;
        spawn(now);
      }

      pulses = pulses.filter((p) => drawPulse(p, now));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    if (!reduced) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="dot-circuit" aria-hidden="true" />;
}
