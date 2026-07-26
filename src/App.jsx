import { MotionConfig } from 'framer-motion';

import ScrollProgress from './components/ScrollProgress';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import TechMarquee from './sections/TechMarquee';
import About from './sections/About';
import Projects from './sections/Projects';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

export default function App() {
  return (
    // reducedMotion="user" turns framer animations into instant transitions
    // for visitors with "reduce motion" enabled.
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
