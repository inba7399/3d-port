import emailjs from '@emailjs/browser';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useAlert from '../hooks/useAlert.js';
import Alert from '../components/Alert.jsx';
import SectionHeading from '../components/SectionHeading';
import { profile } from '../data/content';
import { VIEWPORT, fadeUp, stagger } from '../lib/anim';

const InfoRow = ({ href, icon, label, value }) => {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      {...(href ? { href } : {})}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-colors duration-300 hover:border-white/25"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-accent" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-widest text-white-500">{label}</span>
        <span className="block truncate font-medium text-white-800">{value}</span>
      </span>
    </Tag>
  );
};

export default function Contact() {
  const formRef = useRef();
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  // one tracked timer for auto-hiding alerts, cleared on unmount
  const alertTimer = useRef(null);
  useEffect(() => () => clearTimeout(alertTimer.current), []);
  const hideAlertSoon = (ms) => {
    clearTimeout(alertTimer.current);
    alertTimer.current = setTimeout(hideAlert, ms);
  };

  const handleChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

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
          to_email: 'inbasagar7@gmail.com',
          message: form.message,
        },
        'K7vsm0uXg9HNnfSC3',
      )
      .then(
        () => {
          setLoading(false);
          setForm({ name: '', email: '', message: '' });
          showAlert({ text: 'Thank you! Your message has been sent 😃', type: 'success' });
          hideAlertSoon(3000);
        },
        (error) => {
          setLoading(false);
          console.error(error);
          showAlert({ text: "I didn't receive your message 😢 Please email me directly.", type: 'danger' });
          hideAlertSoon(5000);
        },
      );
  };

  return (
    <section id="contact" className="c-space mx-auto max-w-7xl py-12 sm:py-24 lg:py-32">
      {alert.show && <Alert {...alert} />}

      <SectionHeading eyebrow="Contact" title="Let's build something together." />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr,1.15fr] lg:gap-14">
        {/* Left: pitch + direct channels */}
        <motion.div
          variants={stagger(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="flex flex-col gap-6"
        >
          <motion.p variants={fadeUp} className="text-lg text-white-600">
            Whether you&apos;re looking to build a new website, improve your existing platform, or bring a
            unique project to life, I&apos;m here to help.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col gap-3">
            <InfoRow
              href={`mailto:${profile.email}`}
              label="Email"
              value={profile.email}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <InfoRow
              href={`tel:${profile.phone.replace(/\s+/g, '')}`}
              label="Phone"
              value={profile.phone}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <InfoRow
              label="Location"
              value={`${profile.location} · ${profile.timezone}`}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              }
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <span className="text-sm text-white-500">Find me on</span>
            {profile.socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className="social-icon">
                <img src={s.icon} alt="" className="h-5 w-5 object-contain" />
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: the form */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}>
          <form ref={formRef} onSubmit={handleSubmit} className="g-card flex flex-col gap-6 p-6 sm:p-8">
            <label className="flex flex-col gap-2">
              <span className="field-label">Full name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="ex., John Doe"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label">Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="ex., johndoe@gmail.com"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label">Your message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="field-input resize-none"
                placeholder="Share your thoughts or inquiries..."
              />
            </label>

            <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send message'}
              {!loading && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12h16m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
