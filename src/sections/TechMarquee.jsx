import { marqueeTech } from '../data/content';

// Infinite scrolling band of technologies — pure CSS animation, pauses on hover.
export default function TechMarquee() {
  return (
    <section aria-label="Technologies I work with" className="border-y border-white/5 bg-white/[0.02] py-5">
      <div className="marquee">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} aria-hidden={dup === 1} className="flex items-center gap-10 pr-10 sm:gap-14 sm:pr-14">
              {marqueeTech.map((t) => (
                <span key={`${dup}-${t.name}`} className="flex items-center gap-3">
                  <img src={t.icon} alt="" loading="lazy" className="h-6 w-6 object-contain sm:h-7 sm:w-7" />
                  <span className="whitespace-nowrap text-sm font-medium text-white-600 sm:text-base">{t.name}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
