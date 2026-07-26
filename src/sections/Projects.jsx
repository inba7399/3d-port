import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import SectionHeading from '../components/SectionHeading';
import { projects } from '../data/content';
import { VIEWPORT, fadeUp, slideX, stagger } from '../lib/anim';

function ProjectRow({ project, index }) {
  const flip = index % 2 === 1; // odd rows: media on the right (desktop)
  const hostname = new URL(project.href).hostname;

  // The 3 videos total ~10 MB — only attach a src once the row is close to
  // the viewport, and don't autoplay for reduce-motion users.
  const mediaRef = useRef(null);
  const nearView = useInView(mediaRef, { once: true, margin: '600px 0px' });
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Media — browser-style frame with the project video */}
      <motion.div
        ref={mediaRef}
        variants={slideX(flip ? 60 : -60)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className={`group relative ${flip ? 'lg:order-2' : ''}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 rounded-[2rem] blur-2xl transition-opacity duration-500 opacity-60 group-hover:opacity-100"
          style={{ background: `radial-gradient(55% 55% at 50% 50%, ${project.accent}30, transparent 72%)` }}
        />
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open live demo of ${project.title}`}
          className="relative block overflow-hidden rounded-xl border border-white/10 bg-black-200 shadow-2xl transition-transform duration-500 group-hover:-translate-y-1.5"
        >
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3">
            <span className="terminal-dot bg-[#ff5f57]/80" />
            <span className="terminal-dot bg-[#febc2e]/80" />
            <span className="terminal-dot bg-[#28c840]/80" />
            <span className="ml-3 flex-1 truncate rounded-md bg-black-100/70 px-3 py-1 text-center font-mono text-[11px] text-white-500">
              {hostname}
            </span>
          </div>
          {/* fixed 16:9 box via padding-ratio (works on browsers without
              aspect-ratio support), so the frame never resizes to the video */}
          <div className="relative w-full bg-black-100 pt-[56.25%]">
            {/* reduce-motion users get a still first frame instead of autoplay */}
            <video
              src={nearView ? project.video : undefined}
              autoPlay={!reducedMotion}
              loop
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
        </a>
      </motion.div>

      {/* Copy */}
      <motion.div
        variants={stagger(0.1, 0.09)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="flex flex-col gap-4"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <span aria-hidden="true" className="text-5xl font-black text-white/10 sm:text-6xl">
            {String(index + 1).padStart(2, '0')}
          </span>
          <img src={project.logo} alt="" className="h-10 w-10 rounded-lg object-contain" loading="lazy" />
        </motion.div>

        <motion.h3 variants={fadeUp} className="text-2xl font-semibold text-white sm:text-3xl">
          {project.title}
        </motion.h3>

        <motion.p variants={fadeUp} className="text-white-600">
          {project.desc}
        </motion.p>
        <motion.p variants={fadeUp} className="text-sm text-white-500 sm:text-base">
          {project.subdesc}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-1 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag.name} className="chip">
              <img src={tag.icon} alt="" className="h-4 w-4 object-contain" loading="lazy" />
              {tag.name}
            </span>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-2">
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            style={{ color: project.accent }}
            className="inline-flex items-center gap-2 font-semibold transition-transform duration-300 hover:translate-x-1"
          >
            View live demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17L17 7M17 7H8M17 7v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="c-space mx-auto max-w-7xl overflow-x-clip py-12 sm:py-24 lg:py-32">
      <SectionHeading eyebrow="Portfolio" title="Projects I've shipped." />
      <div className="mt-16 flex flex-col gap-24 sm:mt-20 sm:gap-32">
        {projects.map((project, index) => (
          <ProjectRow key={project.title} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
