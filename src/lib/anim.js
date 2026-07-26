// Shared framer-motion variants so every section animates consistently.

export const VIEWPORT = { once: true, amount: 0.2, margin: '0px 0px -60px 0px' };

const EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

export const slideX = (from = -60) => ({
  hidden: { opacity: 0, x: from },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } },
});

export const stagger = (delay = 0.12, children = 0.1) => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: children } },
});
