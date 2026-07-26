// ---------------------------------------------------------------------------
// Single source of truth for the portfolio: personal info, nav links,
// tech stack, projects and stats. Edit here — the sections render from this.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Inba Sagar',
  firstName: 'Inba',
  role: 'Full-Stack Developer',
  tagline: 'Building creative & responsive web apps',
  email: 'inbasagar7@gmail.com',
  phone: '+91 6381280614',
  location: 'Tamil Nadu, India',
  timezone: 'GMT+5:30 · IST',
  story: [
    "I started out as a digital marketer, and coding wasn't even on my radar. Then a client project put me in front of WordPress, and I began writing small JavaScript snippets to customise elements.",
    'Those little snippets turned into a full-blown passion. Today I build complete web apps end to end, from playful front-ends with React, Next and Three.js to solid back-ends with Node, Express, MongoDB and Firebase.',
    "I'm based in Tamil Nadu, India, flexible across time zones and open to remote work worldwide.",
  ],
  socials: [
    { name: 'GitHub', href: 'https://github.com/inba7399', icon: '/assets/github.svg' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/inba-sagar-842b70283/', icon: '/assets/linkedin.svg' },
    { name: 'Instagram', href: 'https://www.instagram.com/i__n__b__a7/', icon: '/assets/instagram.svg' },
  ],
};

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export const techGroups = [
  {
    title: 'Frontend',
    items: [
      { name: 'HTML', icon: '/assets/html.png' },
      { name: 'CSS', icon: '/assets/css.png' },
      { name: 'JavaScript', icon: '/assets/js.png' },
      { name: 'TypeScript', icon: '/assets/typescript.png' },
      { name: 'React', icon: '/assets/react.svg' },
      { name: 'Tailwind', icon: '/assets/tailwindcss.png' },
      { name: 'Bootstrap', icon: '/assets/bootstrap.png' },
      { name: 'Framer Motion', icon: '/assets/framer.png' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { name: 'Node.js', icon: '/assets/node.png' },
      { name: 'Express', icon: '/assets/express.png' },
      { name: 'MongoDB', icon: '/assets/mongodb.png' },
      { name: 'Firebase', icon: '/assets/firebase.png' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { name: 'GitHub', icon: '/assets/github.svg' },
      { name: 'Figma', icon: '/assets/figma.svg' },
      { name: 'Notion', icon: '/assets/notion.svg' },
    ],
  },
];

// Flat, de-duplicated list used by the scrolling marquee band.
export const marqueeTech = techGroups.flatMap((g) => g.items);

export const stats = [
  { value: techGroups.reduce((n, g) => n + g.items.length, 0), suffix: '+', label: 'Technologies in my toolkit' },
  { value: 3, suffix: '', label: 'Featured projects live' },
  { value: 100, suffix: '%', label: 'Remote-ready, worldwide' },
];

export const projects = [
  {
    title: 'Multiplayer Coin Game',
    desc: 'A fun and engaging game where anyone can join by visiting the game URL. Players are placed on a shared canvas as soon as they enter and can begin collecting coins, competing or collaborating for a lively gaming experience!',
    subdesc:
      'Built with HTML Canvas for rendering and styled with CSS. All gameplay is powered by JavaScript, while Firebase Live Database manages real-time updates for seamless interactivity between players.',
    href: 'https://resplendent-tapioca-2d1faf.netlify.app',
    video: '/textures/project/project2.mp4',
    logo: '/assets/project-logo2.png',
    accent: '#4aa8ff',
    tags: [
      { name: 'HTML', icon: '/assets/html.png' },
      { name: 'CSS', icon: '/assets/css.png' },
      { name: 'JavaScript', icon: '/assets/js.png' },
      { name: 'Firebase', icon: '/assets/firebase.png' },
    ],
  },
  {
    title: 'Online Counselling App',
    desc: 'A SaaS platform for seamless online counselling. Users book sessions and connect with verified professionals over secure video calls. Licensed professionals can apply to join and, once verified, are listed for easy booking.',
    subdesc:
      'User data is stored in MongoDB with hashed passwords, and video calls are handled with WebRTC for security and reliability.',
    href: 'https://chic-starlight-bc5789.netlify.app',
    video: '/textures/project/project1.mp4',
    logo: '/assets/project-logo3.png',
    accent: '#b07cff',
    tags: [
      { name: 'React', icon: '/assets/react.svg' },
      { name: 'MongoDB', icon: '/assets/mongodb.png' },
      { name: 'Express', icon: '/assets/express.png' },
      { name: 'Node', icon: '/assets/node.png' },
    ],
  },
  {
    title: 'Weather App',
    desc: 'Search any location and instantly get current weather details: temperature, wind speed, humidity and more. A quick, reliable way to stay updated on local and global conditions.',
    subdesc:
      'Entering a location fires an API call that fetches real-time weather data, which is rendered into a clean, responsive interface.',
    href: 'https://vermillion-sunshine-e16c53.netlify.app',
    video: '/textures/project/project3.mp4',
    logo: '/assets/weather-logo.png',
    accent: '#ffd166',
    tags: [
      { name: 'HTML', icon: '/assets/html.png' },
      { name: 'CSS', icon: '/assets/css.png' },
      { name: 'JavaScript', icon: '/assets/js.png' },
      { name: 'Tailwind', icon: '/assets/tailwindcss.png' },
    ],
  },
];
