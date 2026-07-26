# Inba Sagar · Portfolio

A professional single-page portfolio with scroll-driven animations, built
mobile-first. (The previous 3D "portfolio park" version lives in git history —
commit `9cbf25e`.)

## Sections

| Section | Highlights |
| --- | --- |
| Hero | Staggered headline reveal, parallax glow orbs, scroll cue |
| Tech marquee | Infinite scrolling band of the tech stack (pauses on hover) |
| About | Bento grid — story, live IST clock, terminal card, copy-to-clipboard contacts, animated stat counters |
| Projects | Alternating rows with autoplaying video previews in browser-style frames |
| Contact | EmailJS-powered form + direct channels |

The top nav is the classic floating pill navbar from the original design:
blurred white pill, hides when you scroll down, peeks back on hover/scroll up.

## Tech

React 18 · Vite · Tailwind CSS · Framer Motion · EmailJS

- All content (profile, tech stack, projects, nav links) lives in
  `src/data/content.js` — edit there, the sections render from it.
- Scroll reveals use shared variants from `src/lib/anim.js`; visitors with
  "reduce motion" enabled get instant transitions (`MotionConfig` +
  `prefers-reduced-motion` CSS).

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
npm run preview  # serve dist/ locally
node smoke-test.mjs  # puppeteer smoke test against the preview server
```
