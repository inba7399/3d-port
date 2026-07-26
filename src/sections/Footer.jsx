import { profile } from '../data/content';

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="c-space mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 pb-4 pt-7">
        <div className="flex gap-3">
          {profile.socials.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className="social-icon">
              <img src={s.icon} alt="" className="h-5 w-5 object-contain" />
            </a>
          ))}
        </div>

        <p className="text-sm text-white-500">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
