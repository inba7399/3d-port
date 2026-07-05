import { useEffect, useRef, useState } from 'react';
import { audio } from '../game/audio';

// ---------------------------------------------------------------------------
// Arcade Corner: four classic mini-games on a 2D canvas — Snake, Space Force,
// Brick Breaker and Tower Stack. Keyboard + touch, high scores in
// localStorage. Each game is a small factory returning
// { update(dt, api), draw(ctx), key(code), pointer(type, x, y) }.
// ---------------------------------------------------------------------------

const W = 400;
const H = 480;

const GAMES = [
  { id: 'snake', name: 'Snake', emoji: '🐍', hint: 'Arrows / swipe to steer' },
  { id: 'space', name: 'Space Force', emoji: '🚀', hint: 'Arrows / drag to move — auto-fire' },
  { id: 'breakout', name: 'Brick Breaker', emoji: '🧱', hint: 'Arrows / drag the paddle' },
  { id: 'stack', name: 'Tower Stack', emoji: '🏗️', hint: 'Space / tap to drop the block' },
];

const best = (id) => Number(localStorage.getItem(`arcade-best-${id}`) || 0);
const saveBest = (id, score) => localStorage.setItem(`arcade-best-${id}`, String(score));

/* ------------------------------- Snake --------------------------------- */
const makeSnake = () => makeSnakeGrid(25);
function makeSnakeGrid(CELL) {
  const COLS = Math.floor(W / CELL);
  const ROWS = Math.floor(H / CELL);
  let snake = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }];
  let dir = { x: 1, y: 0 };
  let nextDir = dir;
  let food = { x: 10, y: 8 };
  let acc = 0;
  let score = 0;
  let swipe = null;

  const placeFood = () => {
    do {
      food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === food.x && s.y === food.y));
  };

  return {
    score: () => score,
    update(dt, api) {
      acc += dt;
      const tick = Math.max(0.07, 0.13 - score * 0.002);
      if (acc < tick) return;
      acc = 0;
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return api.end(score);
      if (snake.some((s) => s.x === head.x && s.y === head.y)) return api.end(score);
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 1;
        api.blip();
        placeFood();
      } else {
        snake.pop();
      }
    },
    draw(ctx) {
      ctx.fillStyle = '#12161f';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let x = 0; x < COLS; x++)
        for (let y = 0; y < ROWS; y++) if ((x + y) % 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      // food: apple
      ctx.fillStyle = '#ff5c5c';
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2 + 1, CELL * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6fca5a';
      ctx.fillRect(food.x * CELL + CELL / 2 - 1.5, food.y * CELL + 3, 3, 6);
      // snake
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#8ff06f' : `hsl(${115 - i * 1.5}, 60%, ${46 - Math.min(i, 12)}%)`;
        const pad = i === 0 ? 1.5 : 2.5;
        ctx.beginPath();
        ctx.roundRect(s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 6);
        ctx.fill();
      });
      // eyes on head
      const h = snake[0];
      ctx.fillStyle = '#12161f';
      ctx.beginPath();
      ctx.arc(h.x * CELL + CELL / 2 + dir.x * 4 - dir.y * 4, h.y * CELL + CELL / 2 + dir.y * 4 + dir.x * 4, 2.2, 0, 7);
      ctx.arc(h.x * CELL + CELL / 2 + dir.x * 4 + dir.y * 4, h.y * CELL + CELL / 2 + dir.y * 4 - dir.x * 4, 2.2, 0, 7);
      ctx.fill();
    },
    key(code) {
      const d =
        code === 'ArrowUp' || code === 'KeyW'
          ? { x: 0, y: -1 }
          : code === 'ArrowDown' || code === 'KeyS'
            ? { x: 0, y: 1 }
            : code === 'ArrowLeft' || code === 'KeyA'
              ? { x: -1, y: 0 }
              : code === 'ArrowRight' || code === 'KeyD'
                ? { x: 1, y: 0 }
                : null;
      if (d && !(d.x === -dir.x && d.y === -dir.y)) nextDir = d;
    },
    pointer(type, x, y) {
      if (type === 'down') swipe = { x, y };
      else if (type === 'up' && swipe) {
        const dx = x - swipe.x;
        const dy = y - swipe.y;
        if (Math.hypot(dx, dy) > 18) {
          const d = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
          if (!(d.x === -dir.x && d.y === -dir.y)) nextDir = d;
        }
        swipe = null;
      }
    },
  };
}

/* ----------------------------- Space Force ------------------------------ */
function makeSpace() {
  const ship = { x: W / 2, vx: 0 };
  let bullets = [];
  let enemies = [];
  let sparks = [];
  let fire = 0;
  let spawn = 0;
  let t = 0;
  let score = 0;
  let keys = { left: false, right: false };
  const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + 0.5 }));

  return {
    score: () => score,
    update(dt, api) {
      t += dt;
      // movement
      ship.vx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      ship.x = Math.max(18, Math.min(W - 18, ship.x + ship.vx * 260 * dt));
      // auto-fire
      fire -= dt;
      if (fire <= 0) {
        bullets.push({ x: ship.x, y: H - 52 });
        fire = 0.27;
      }
      bullets.forEach((b) => (b.y -= 420 * dt));
      bullets = bullets.filter((b) => b.y > -10);
      // enemies
      spawn -= dt;
      if (spawn <= 0) {
        enemies.push({ x: 25 + Math.random() * (W - 50), y: -16, vy: 42 + Math.min(70, t * 2.2), w: 30 });
        spawn = Math.max(0.35, 1 - t * 0.014);
      }
      enemies.forEach((e) => (e.y += e.vy * dt));
      // collisions
      for (const e of enemies) {
        for (const b of bullets) {
          if (Math.abs(b.x - e.x) < e.w / 2 + 3 && Math.abs(b.y - e.y) < 14) {
            e.dead = true;
            b.dead = true;
            score += 10;
            api.blip();
            for (let i = 0; i < 6; i++)
              sparks.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 160, life: 0.4 });
          }
        }
        if (!e.dead && e.y > H - 46 && Math.abs(e.x - ship.x) < e.w / 2 + 14) return api.end(score);
        if (e.y > H + 10) return api.end(score);
      }
      enemies = enemies.filter((e) => !e.dead);
      bullets = bullets.filter((b) => !b.dead);
      sparks.forEach((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
      });
      sparks = sparks.filter((s) => s.life > 0);
      stars.forEach((s) => {
        s.y += s.s * 26 * dt;
        if (s.y > H) s.y = 0;
      });
    },
    draw(ctx) {
      ctx.fillStyle = '#0b0e1a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#8ea4c8';
      stars.forEach((s) => ctx.fillRect(s.x, s.y, s.s, s.s));
      // ship
      ctx.fillStyle = '#39e6d0';
      ctx.beginPath();
      ctx.moveTo(ship.x, H - 62);
      ctx.lineTo(ship.x - 15, H - 34);
      ctx.lineTo(ship.x + 15, H - 34);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff9f43';
      ctx.fillRect(ship.x - 4, H - 34, 8, 6 + Math.random() * 5);
      // bullets
      ctx.fillStyle = '#ffd166';
      bullets.forEach((b) => ctx.fillRect(b.x - 2, b.y - 8, 4, 10));
      // enemies
      enemies.forEach((e) => {
        ctx.fillStyle = '#ff7ab6';
        ctx.beginPath();
        ctx.roundRect(e.x - e.w / 2, e.y - 11, e.w, 22, 7);
        ctx.fill();
        ctx.fillStyle = '#0b0e1a';
        ctx.fillRect(e.x - 8, e.y - 3, 5, 5);
        ctx.fillRect(e.x + 3, e.y - 3, 5, 5);
      });
      ctx.fillStyle = '#ffd166';
      sparks.forEach((s) => ctx.fillRect(s.x, s.y, 3, 3));
    },
    key(code, downUp) {
      if (code === 'ArrowLeft' || code === 'KeyA') keys.left = downUp;
      if (code === 'ArrowRight' || code === 'KeyD') keys.right = downUp;
    },
    pointer(type, x) {
      if (type === 'down' || type === 'move') ship.x = Math.max(18, Math.min(W - 18, x));
    },
  };
}

/* ---------------------------- Brick Breaker ----------------------------- */
function makeBreakout() {
  const paddle = { x: W / 2, w: 84 };
  const ball = { x: W / 2, y: H - 90, vx: 150, vy: -240 };
  let bricks = [];
  let lives = 3;
  let score = 0;
  let level = 1;
  let keys = { left: false, right: false };
  const COLORS = ['#ff5c5c', '#ff9f43', '#ffd166', '#6fca5a', '#4aa8ff', '#b07cff'];

  const buildBricks = () => {
    bricks = [];
    for (let r = 0; r < 6; r++)
      for (let c = 0; c < 8; c++) bricks.push({ x: 14 + c * 47, y: 46 + r * 24, w: 42, h: 18, color: COLORS[r] });
  };
  buildBricks();

  const resetBall = () => {
    ball.x = W / 2;
    ball.y = H - 90;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * (130 + level * 15);
    ball.vy = -(230 + level * 18);
  };

  return {
    score: () => score,
    update(dt, api) {
      const pv = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, paddle.x + pv * 320 * dt));
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < 7 || ball.x > W - 7) ball.vx *= -1;
      if (ball.y < 7) ball.vy *= -1;
      // paddle bounce with angle control
      if (ball.y > H - 40 && ball.y < H - 24 && Math.abs(ball.x - paddle.x) < paddle.w / 2 + 6 && ball.vy > 0) {
        ball.vy = -Math.abs(ball.vy);
        ball.vx = ((ball.x - paddle.x) / (paddle.w / 2)) * 240;
      }
      for (const br of bricks) {
        if (ball.x > br.x - 7 && ball.x < br.x + br.w + 7 && ball.y > br.y - 7 && ball.y < br.y + br.h + 7) {
          br.dead = true;
          score += 5;
          api.blip();
          const fromSide = ball.x < br.x || ball.x > br.x + br.w;
          if (fromSide) ball.vx *= -1;
          else ball.vy *= -1;
          break;
        }
      }
      bricks = bricks.filter((b) => !b.dead);
      if (!bricks.length) {
        level += 1;
        buildBricks();
        resetBall();
      }
      if (ball.y > H + 10) {
        lives -= 1;
        if (lives <= 0) return api.end(score);
        resetBall();
      }
    },
    draw(ctx) {
      ctx.fillStyle = '#12161f';
      ctx.fillRect(0, 0, W, H);
      bricks.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 4);
        ctx.fill();
      });
      ctx.fillStyle = '#e8edf5';
      ctx.beginPath();
      ctx.roundRect(paddle.x - paddle.w / 2, H - 32, paddle.w, 10, 5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.fillStyle = '#ff5c5c';
      for (let i = 0; i < lives; i++) ctx.fillRect(10 + i * 16, 10, 10, 10);
    },
    key(code, downUp) {
      if (code === 'ArrowLeft' || code === 'KeyA') keys.left = downUp;
      if (code === 'ArrowRight' || code === 'KeyD') keys.right = downUp;
    },
    pointer(type, x) {
      if (type === 'down' || type === 'move') paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, x));
    },
  };
}

/* ----------------------------- Tower Stack ------------------------------ */
function makeStack() {
  let stack = [{ x: W / 2 - 70, w: 140 }];
  let cur = { x: 0, w: 140, dir: 1 };
  let y = 0; // blocks placed
  let speed = 150;
  let score = 0;
  let camera = 0;
  const ROW = 26;

  return {
    score: () => score,
    update(dt, api) {
      cur.x += cur.dir * speed * dt;
      if (cur.x < 0) {
        cur.x = 0;
        cur.dir = 1;
      }
      if (cur.x + cur.w > W) {
        cur.x = W - cur.w;
        cur.dir = -1;
      }
      const targetCam = Math.max(0, (y + 1) * ROW - 260);
      camera += (targetCam - camera) * Math.min(1, dt * 6);
      this._drop = (end) => {
        const prev = stack[stack.length - 1];
        const left = Math.max(cur.x, prev.x);
        const right = Math.min(cur.x + cur.w, prev.x + prev.w);
        const overlap = right - left;
        if (overlap <= 4) return end(score);
        stack.push({ x: left, w: overlap });
        y += 1;
        score += 1;
        api.blip();
        speed = Math.min(340, 150 + y * 9);
        cur = { x: y % 2 ? 0 : W - overlap, w: overlap, dir: y % 2 ? 1 : -1 };
      };
    },
    draw(ctx) {
      ctx.fillStyle = '#101423';
      ctx.fillRect(0, 0, W, H);
      const baseY = H - 40;
      stack.forEach((b, i) => {
        ctx.fillStyle = `hsl(${(i * 14) % 360}, 62%, 56%)`;
        ctx.beginPath();
        ctx.roundRect(b.x, baseY - i * ROW + camera, b.w, ROW - 3, 4);
        ctx.fill();
      });
      // sliding block
      ctx.fillStyle = `hsl(${(stack.length * 14) % 360}, 70%, 66%)`;
      ctx.beginPath();
      ctx.roundRect(cur.x, baseY - stack.length * ROW + camera, cur.w, ROW - 3, 4);
      ctx.fill();
      // ground
      ctx.fillStyle = '#2b3150';
      ctx.fillRect(0, baseY + ROW - 3 + camera, W, 60);
    },
    key(code, downUp) {
      if (downUp && (code === 'Space' || code === 'ArrowDown')) this._drop?.(this._end);
    },
    pointer(type) {
      if (type === 'down') this._drop?.(this._end);
    },
    bindEnd(end) {
      this._end = end;
    },
  };
}

const FACTORIES = { snake: makeSnake, space: makeSpace, breakout: makeBreakout, stack: makeStack };

/* ------------------------------ Game shell ------------------------------ */
function GameCanvas({ id, onExit }) {
  const canvasRef = useRef();
  const scoreRef = useRef();
  const [over, setOver] = useState(null); // { score, best, isNew }
  const [run, setRun] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = FACTORIES[id]();
    let raf;
    let last = performance.now();
    let ended = false;

    const end = (score) => {
      if (ended) return;
      ended = true;
      const prev = best(id);
      const isNew = score > prev;
      if (isNew) {
        saveBest(id, score);
        audio.tada();
      } else {
        audio.close();
      }
      setOver({ score, best: Math.max(prev, score), isNew });
    };
    game.bindEnd?.(end);
    const api = { end, blip: () => audio.pop() };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!ended) {
        game.update(dt, api);
        game.draw(ctx);
        if (scoreRef.current) scoreRef.current.textContent = game.score();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const toXY = (e) => {
      const r = canvas.getBoundingClientRect();
      return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height];
    };
    const kd = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      game.key?.(e.code, true);
    };
    const ku = (e) => game.key?.(e.code, false);
    const pd = (e) => {
      canvas.setPointerCapture(e.pointerId);
      game.pointer?.('down', ...toXY(e));
    };
    const pm = (e) => e.buttons && game.pointer?.('move', ...toXY(e));
    const pu = (e) => game.pointer?.('up', ...toXY(e));
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    canvas.addEventListener('pointerdown', pd);
    canvas.addEventListener('pointermove', pm);
    canvas.addEventListener('pointerup', pu);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      canvas.removeEventListener('pointerdown', pd);
      canvas.removeEventListener('pointermove', pm);
      canvas.removeEventListener('pointerup', pu);
    };
  }, [id, run]);

  const meta = GAMES.find((g) => g.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button className="hud-chip hud-btn" onClick={onExit}>
          ← Games
        </button>
        <div className="text-white font-bold">
          {meta.emoji} {meta.name}
        </div>
        <div className="hud-chip">
          ⭐ <span ref={scoreRef}>0</span>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full rounded-xl border border-white/10"
          style={{ touchAction: 'none' }}
        />
        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70 text-center">
            <p className="text-2xl font-black text-white">{over.isNew ? '🏆 New record!' : 'Game over'}</p>
            <p className="text-white-600 mt-1">
              Score <b className="text-white">{over.score}</b> · Best <b className="text-white">{over.best}</b>
            </p>
            <button
              className="start-btn mt-4"
              onClick={() => {
                setOver(null);
                setRun((r) => r + 1);
              }}
            >
              Play again
            </button>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-white-500 mt-2">{meta.hint}</p>
    </div>
  );
}

export default function ArcadePanel() {
  const [game, setGame] = useState(null);
  if (game) return <GameCanvas id={game} onExit={() => setGame(null)} />;
  return (
    <div>
      <p className="text-white-600 mb-4">
        Welcome to the arcade by the giant wheel — four little classics I grew up with. Beat your best!
      </p>
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            className="ft-btn"
            onClick={() => {
              audio.pop();
              setGame(g.id);
            }}
          >
            <span className="text-3xl">{g.emoji}</span>
            <span className="font-semibold text-sm">{g.name}</span>
            <span className="text-xs text-white-500">Best: {best(g.id)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
