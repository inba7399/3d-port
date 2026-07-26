import { motion } from 'framer-motion';
import { VIEWPORT, fadeUp, stagger } from '../lib/anim';

export default function SectionHeading({ eyebrow, title }) {
  return (
    <motion.div
      variants={stagger(0, 0.12)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="flex flex-col gap-3"
    >
      <motion.span variants={fadeUp} className="eyebrow flex items-center gap-3">
        <span aria-hidden="true" className="inline-block h-px w-8 bg-gradient-to-r from-accent to-transparent" />
        {eyebrow}
      </motion.span>
      <motion.h2 variants={fadeUp} className="head-text">
        {title}
      </motion.h2>
    </motion.div>
  );
}
