import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import DotCircuit from '../components/DotCircuit';
import { profile } from '../data/content';
import { fadeUp, stagger } from '../lib/anim';

// Adjective + noun pairs that cycle inside the headline.
const ROTATING = [
  { adj: 'creative', noun: 'web apps.' },
  { adj: 'professional', noun: 'ERP systems.' },
  { adj: 'custom', noun: 'CRM platforms.' },
  { adj: 'responsive', noun: 'websites.' },
  { adj: 'full-stack', noun: 'products.' },
];

// Mini stack shown on the dev card.
const CARD_STACK = [
  { name: 'React', icon: '/assets/react.svg' },
  { name: 'Node.js', icon: '/assets/node.png' },
  { name: 'MongoDB', icon: '/assets/mongodb.png' },
  { name: 'Firebase', icon: '/assets/firebase.png' },
  { name: 'Tailwind', icon: '/assets/tailwindcss.png' },
];

function RotatingLines() {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (reduced) return undefined; // stay on the first pair for reduce-motion users
    const id = setInterval(() => setIdx((i) => (i + 1) % ROTATING.length), 3000);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    // fixed 2-line height + overflow-hidden = the pairs roll through a mask
    // without ever overlapping the copy below
    <span className="relative block h-[2.3em] overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={idx}
          initial={{ y: '80%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-80%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="block"
        >
          <span className="block text-accent_gradient">{ROTATING[idx].adj}</span>
          <span className="block text-gray_gradient">{ROTATING[idx].noun}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white-500">{label}</span>
      <span className="text-right text-sm font-medium text-white-800">{value}</span>
    </div>
  );
}

// Glassy "developer ID card" that tilts toward the cursor on desktop.
function DevCard() {
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });

  const handleMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return; // no tilt on touch
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 16);
    rotateX.set(-py * 12);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const github = profile.socials.find((s) => s.name === 'GitHub');
  const handle = github ? `@${new URL(github.href).pathname.replaceAll('/', '')}` : '';

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={handleMove}
      onPointerLeave={resetTilt}
      className="relative mx-auto w-full max-w-sm rounded-3xl bg-gradient-to-br from-accent/60 via-white/10 to-accent-cyan/40 p-px will-change-transform"
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-[#0b0b0f]/95 p-6 sm:p-7">
        {/* header */}
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-accent-violet to-accent-cyan text-lg font-black text-black-100"
          >
            IS
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{profile.name}</p>
            <p className="truncate text-sm text-white-500">{handle}</p>
          </div>
        </div>

        <div aria-hidden="true" className="my-5 h-px bg-white/10" />

        <div className="flex flex-col gap-3.5">
          <InfoRow label="Role" value={profile.role} />
          <InfoRow label="Base" value={profile.location} />
          <InfoRow label="Timezone" value={profile.timezone} />
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white-500">Stack</span>
            <span className="flex flex-wrap justify-end gap-2">
              {CARD_STACK.map((t) => (
                <span
                  key={t.name}
                  title={t.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-1.5"
                >
                  <img src={t.icon} alt={t.name} className="h-full w-full object-contain" />
                </span>
              ))}
            </span>
          </div>
        </div>

        <div aria-hidden="true" className="my-5 h-px bg-white/10" />

        {/* footer */}
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2.5 text-sm text-white-700">
            <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            Open to work
          </span>
          <a href="#contact" className="text-sm font-semibold text-accent transition-transform duration-300 hover:translate-x-0.5">
            Let&apos;s talk →
          </a>
        </div>
      </div>

      {/* floating chips pinned to the card's edges */}
      <motion.span
        aria-hidden="true"
        animate={{ y: [-6, 6] }}
        transition={{ duration: 3.6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute -top-5 right-8 hidden sm:block"
      >
        <span className="chip !bg-[#101014] shadow-xl">
          <img src="/assets/react.svg" alt="" className="h-4 w-4 object-contain" />
          React
        </span>
      </motion.span>
      <motion.span
        aria-hidden="true"
        animate={{ y: [6, -6] }}
        transition={{ duration: 4.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        className="absolute -bottom-5 left-8 hidden sm:block"
      >
        <span className="chip !bg-[#101014] shadow-xl">
          <img src="/assets/node.png" alt="" className="h-4 w-4 object-contain" />
          Node.js
        </span>
      </motion.span>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef(null);

  // Parallax: content drifts down + fades as the hero scrolls away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  // stay fully visible until most of the hero has scrolled past — on mobile
  // the hero is ~2 screens tall and fading earlier would dim the dev card
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0]);

  return (
    <section ref={ref} id="home" className="relative flex items-center justify-center overflow-hidden">
      {/* backdrop: dot matrix with electric pulses travelling dot to dot */}
      <DotCircuit />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 w-full">
        <div className="c-space mx-auto grid w-full max-w-7xl items-center gap-14 pb-24 pt-28 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          {/* left: copy */}
          <motion.div
            variants={stagger(0.15, 0.09)}
            initial="hidden"
            animate="show"
            className="flex min-w-0 flex-col items-start gap-6"
          >
            <motion.span variants={fadeUp} className="chip">
              <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              Open to work · Remote worldwide
            </motion.span>

            <motion.p variants={fadeUp} className="text-lg font-medium text-white-800 sm:text-xl">
              Hi, I&apos;m {profile.name} <span className="waving-hand">👋🏽</span>
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-black !leading-[1.08] xs:text-5xl sm:text-6xl xl:text-7xl"
            >
              <span className="block text-gray_gradient">Building</span>
              <RotatingLines />
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-lg text-base text-white-600 sm:text-lg">
              From front-end polish to back-end logic, I design, build and ship web apps,
              ERP &amp; CRM systems, end to end.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-1 flex flex-wrap items-center gap-3 sm:gap-4">
              <a href="#projects" className="btn-primary">
                View my work
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#contact" className="btn-ghost">
                Contact me
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-1 flex items-center gap-3">
              {profile.socials.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className="social-icon">
                  <img src={s.icon} alt="" className="h-5 w-5 object-contain" />
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* right: tilting dev card */}
          <motion.div
            initial={{ opacity: 0, y: 44, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-w-0"
          >
            <DevCard />
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 lg:block"
      >
        <motion.a
          href="#about"
          aria-label="Scroll to about section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="scroll-mouse">
            <span />
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white-500">scroll</span>
        </motion.a>
      </motion.div>
    </section>
  );
}
