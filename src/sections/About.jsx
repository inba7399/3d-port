import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import SectionHeading from '../components/SectionHeading';
import { profile, stats, techGroups } from '../data/content';
import { VIEWPORT, fadeUp, stagger } from '../lib/anim';

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function ISTClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-sm text-white-700">
      <span aria-hidden="true">🕐 </span>
      {time || '--:--:--'} <span className="text-white-500">IST · my local time</span>
    </p>
  );
}

function CopyChip({ label, value, copyValue }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <button type="button" onClick={copy} className="copy-chip" aria-label={`Copy ${label}: ${copyValue ?? value}`}>
      <span className="text-lg" aria-hidden="true">
        {copied ? '✅' : '📋'}
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-widest text-white-500">{label}</span>
        <span className="block truncate font-medium text-white-800">{copied ? 'Copied!' : value}</span>
      </span>
      <span role="status" className="sr-only">
        {copied ? `${label} copied to clipboard` : ''}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export default function About() {
  const frontendPicks = techGroups[0].items.slice(0, 4);

  return (
    <section id="about" className="c-space mx-auto max-w-7xl py-12 sm:py-24 lg:py-32">
      <SectionHeading eyebrow="About me" title="Turning curiosity into code." />

      <motion.div
        variants={stagger(0.1, 0.12)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      >
        {/* Story */}
        <motion.div variants={fadeUp} className="g-card p-6 sm:p-8 transition-colors duration-300 hover:border-white/20 md:col-span-2 xl:col-span-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
          />
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            From digital marketing to full-stack
          </h3>
          <p className="mt-4 text-white-600">{profile.story[0]}</p>
          <p className="mt-3 text-white-600">{profile.story[1]}</p>
        </motion.div>

        {/* Remote / timezone (tall card) */}
        <motion.div variants={fadeUp} className="g-card flex flex-col p-6 sm:p-8 transition-colors duration-300 hover:border-white/20 md:row-span-2 xl:row-span-2">
          <div aria-hidden="true" className="relative mx-auto my-4 flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
            <span className="orbit-ring inset-0" />
            <span className="orbit-ring inset-6" />
            <span className="orbit-ring inset-12" />
            <span className="absolute inset-0 orbit-spin">
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(139,123,255,0.8)]" />
            </span>
            <span className="absolute inset-12 orbit-spin-slow">
              <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan shadow-[0_0_10px_2px_rgba(94,200,248,0.8)]" />
            </span>
            <span className="text-5xl sm:text-6xl">🌏</span>
          </div>
          <h3 className="text-xl font-semibold text-white sm:text-2xl">Remote-friendly, any timezone</h3>
          <p className="mt-3 text-white-600">{profile.story[2]}</p>
          <div className="mt-4">
            <ISTClock />
          </div>
          <a href="#contact" className="btn-ghost mt-6 w-full">
            Contact me
          </a>
        </motion.div>

        {/* Terminal */}
        <motion.div variants={fadeUp} className="g-card transition-colors duration-300 hover:border-white/20">
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-5 py-3">
            <span className="terminal-dot bg-[#ff5f57]/80" />
            <span className="terminal-dot bg-[#febc2e]/80" />
            <span className="terminal-dot bg-[#28c840]/80" />
            <span className="ml-2 truncate font-mono text-xs text-white-500">inba@dev: journey</span>
          </div>
          <div className="space-y-2.5 p-5 font-mono text-xs sm:p-6 sm:text-sm">
            <p className="text-accent">$ whoami</p>
            <p className="text-white-600">digital-marketer → full-stack developer</p>
            <p className="text-accent">$ stack --favourites</p>
            <p className="text-white-600">{frontendPicks.map((t) => t.name.toLowerCase()).join(' · ')}</p>
            <p className="text-accent">$ status</p>
            <p className="text-white-600">
              building creative web apps
              <span className="type-caret" aria-hidden="true" />
            </p>
          </div>
        </motion.div>

        {/* Quick contact */}
        <motion.div variants={fadeUp} className="g-card p-6 sm:p-8 transition-colors duration-300 hover:border-white/20">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">Get in touch fast</h3>
          <p className="mt-2 text-sm text-white-600">Email or call, whichever is easier.</p>
          <div className="mt-5 flex flex-col gap-3">
            <CopyChip label="Email" value={profile.email} />
            <CopyChip label="Phone" value={profile.phone} />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="g-card p-6 sm:p-8 transition-colors duration-300 hover:border-white/20 md:col-span-2 xl:col-span-3">
          <div className="grid grid-cols-1 gap-8 xs:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-black text-gray_gradient sm:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-white-600">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
