import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { profile, techGroups, projects, panelTitles } from '../data/content';
import useAlert from '../hooks/useAlert';
import Alert from '../components/Alert';
import ArcadePanel from './Arcade';

// ---------------------------------------------------------------------------
// The overlay panels that open when the player enters a zone. Plain DOM on
// purpose: scrollable, selectable, accessible and buttery on mobile.
// ---------------------------------------------------------------------------

function CopyRow({ icon, label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button className="copy-row" onClick={copy} title={`Copy ${label}`}>
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-left truncate">{value}</span>
      <span className="text-xs font-semibold text-white-500">{copied ? '✓ copied' : 'copy'}</span>
    </button>
  );
}

function Socials() {
  return (
    <div className="flex gap-3">
      {profile.socials.map((s) => (
        <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="social-btn" title={s.name}>
          <img src={s.icon} alt={s.name} className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="space-y-4">
      <p className="text-2xl font-bold text-white">
        Hi, I&apos;m {profile.name} <span className="waving-hand">👋🏽</span>
      </p>
      {profile.story.map((p, i) => (
        <p key={i} className="text-white-600 leading-relaxed">
          {p}
        </p>
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="chip">📍 {profile.location}</span>
        <span className="chip">🌍 Remote friendly</span>
        <span className="chip">💼 Open to work</span>
      </div>
      <div className="space-y-2 pt-2">
        <CopyRow icon="📧" label="email" value={profile.email} />
        <CopyRow icon="📞" label="phone" value={profile.phone} />
      </div>
      <Socials />
    </div>
  );
}

function TechPanel() {
  return (
    <div className="space-y-6">
      <p className="text-white-600">
        Languages, frameworks and tools I use to build robust, scalable apps.
      </p>
      {techGroups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-bold tracking-widest text-white-500 uppercase mb-3">{group.title}</h3>
          <div className="grid grid-cols-2 min-[420px]:grid-cols-3 gap-2">
            {group.items.map((t) => (
              <div key={t.name} className="tech-chip">
                <img src={t.icon} alt="" className="w-6 h-6 object-contain" />
                <span className="text-sm">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsPanel({ initialIndex = 0 }) {
  const [index, setIndex] = useState(initialIndex);
  const p = projects[index];
  const go = (dir) => setIndex((index + dir + projects.length) % projects.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <img src={p.logo} alt="" className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white leading-tight truncate">{p.title}</h3>
          <p className="text-xs text-white-500">
            Project {index + 1} of {projects.length}
          </p>
        </div>
      </div>

      <video
        key={p.video}
        src={p.video}
        className="w-full aspect-video rounded-xl border border-white/10 bg-black object-cover"
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
      />

      <p className="text-white-600 leading-relaxed">{p.desc}</p>
      <p className="text-white-500 text-sm leading-relaxed">{p.subdesc}</p>

      <div className="flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <span key={t.name} className="chip">
            <img src={t.icon} alt="" className="w-4 h-4 object-contain" />
            {t.name}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button className="nav-arrow" onClick={() => go(-1)} aria-label="Previous project">
          ←
        </button>
        <a
          href={p.href}
          target="_blank"
          rel="noreferrer"
          className="visit-btn"
          style={{ '--accent': p.accent }}
        >
          Visit live site ↗
        </a>
        <button className="nav-arrow" onClick={() => go(1)} aria-label="Next project">
          →
        </button>
      </div>

      <div className="flex justify-center gap-1.5 pt-1">
        {projects.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/25'}`}
            onClick={() => setIndex(i)}
            aria-label={`Project ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ContactPanel() {
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = ({ target: { name, value } }) => setForm({ ...form, [name]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    emailjs
      .send(
        'service_mdis644',
        'template_yzsw5jf',
        {
          from_name: form.name,
          to_name: 'Inba sagar',
          from_email: form.email,
          to_email: profile.email,
          message: form.message,
        },
        'K7vsm0uXg9HNnfSC3'
      )
      .then(
        () => {
          setLoading(false);
          showAlert({ text: 'Thank you! I will get back to you soon 😃', type: 'success' });
          setTimeout(() => {
            hideAlert();
            setForm({ name: '', email: '', message: '' });
          }, 3000);
        },
        (error) => {
          setLoading(false);
          console.error(error);
          showAlert({ text: "I didn't receive your message 😢", type: 'danger' });
        }
      );
  };

  return (
    <div className="space-y-5">
      {alert.show && <Alert {...alert} />}
      <p className="text-white-600 leading-relaxed">
        Whether you&apos;re looking to build a new website, improve an existing platform or bring a unique
        project to life — I&apos;m here to help.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-white-600">Full name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="ex. John Doe"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-white-600">Email address</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="ex. johndoe@gmail.com"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-white-600">Your message</span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            className="form-input resize-none"
            placeholder="Share your thoughts or inquiries..."
          />
        </label>
        <button className="send-btn" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send message ✈️'}
        </button>
      </form>
      <div className="space-y-2">
        <CopyRow icon="📧" label="email" value={profile.email} />
        <CopyRow icon="📞" label="phone" value={profile.phone} />
      </div>
      <Socials />
    </div>
  );
}

export default function Panel({ panel, onClose }) {
  if (!panel) return null;
  const { type, projectIndex } = panel;

  return (
    <div className="panel-backdrop z-40" onClick={onClose}>
      <div className="panel-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{panelTitles[type]}</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>
        {type === 'about' && <AboutPanel />}
        {type === 'tech' && <TechPanel />}
        {type === 'projects' && <ProjectsPanel initialIndex={projectIndex} />}
        {type === 'contact' && <ContactPanel />}
        {type === 'arcade' && <ArcadePanel />}
        <button className="goback-btn mt-6" onClick={onClose}>
          ← Go back
        </button>
      </div>
    </div>
  );
}
