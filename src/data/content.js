// ---------------------------------------------------------------------------
// Single source of truth for the park: personal info, section content and
// the world layout (zone positions drive both the 3D scene and the triggers).
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Inba Sagar',
  tagline: 'Building creative & responsive apps',
  email: 'inbasagar7@gmail.com',
  phone: '+91 6381280614',
  location: 'Tamil Nadu, India',
  story: [
    "I started out as a digital marketer — coding wasn't even on my radar. Then a client project put me in front of WordPress, and I began writing small JavaScript snippets to customise elements.",
    'Those little snippets turned into a full-blown passion. Today I build complete web apps end to end — from playful front-ends with React, Next and Three.js to solid back-ends with Node, Express, MongoDB and Firebase.',
    "I'm based in Tamil Nadu, India, flexible across time zones and open to remote work worldwide.",
  ],
  socials: [
    { name: 'GitHub', href: 'https://github.com/inba7399', icon: '/assets/github.svg' },
    { name: 'Instagram', href: 'https://www.instagram.com/i__n__b__a7/', icon: '/assets/instagram.svg' },
  ],
};

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

// Icons that orbit the Tech Lab dome in 3D (PNGs only — SVGs can
// rasterize with no size in THREE's TextureLoader).
export const orbitIcons = [
  '/assets/express.png',
  '/assets/js.png',
  '/assets/node.png',
  '/assets/mongodb.png',
  '/assets/firebase.png',
  '/assets/tailwindcss.png',
  '/assets/typescript.png',
  '/assets/css.png',
];

export const projects = [
  {
    title: 'Multiplayer Coin Game',
    short: 'COIN GAME',
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
    short: 'COUNSEL APP',
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
    short: 'WEATHER',
    desc: 'Search any location and instantly get current weather details — temperature, wind speed, humidity and more. A quick, reliable way to stay updated on local and global conditions.',
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

// ---------------------------------------------------------------------------
// World layout. +X is east, +Z is south (toward the spawn / entrance).
// `panel` is which overlay a zone opens; `projectIndex` picks the project.
// ---------------------------------------------------------------------------

export const SPAWN = { x: 0, z: 24 };
export const PARK_RADIUS = 38.5; // player is clamped inside this circle (island grass ends at 40)

export const zones = [
  {
    id: 'about',
    panel: 'about',
    label: 'Meet Inba',
    sign: 'ABOUT ME',
    emoji: '👋',
    color: '#ff5c5c',
    x: -16,
    z: 8,
    rotY: Math.PI / 3.2,
    triggerRadius: 5,
  },
  {
    id: 'tech',
    panel: 'tech',
    label: 'Tech Lab',
    sign: 'TECH LAB',
    emoji: '🧪',
    color: '#2ec4b6',
    x: -19,
    z: -11,
    rotY: Math.PI / 4,
    triggerRadius: 5.5,
  },
  {
    id: 'project-0',
    panel: 'projects',
    projectIndex: 0,
    label: 'Coin Game booth',
    sign: 'COIN GAME',
    emoji: '🎮',
    color: '#4aa8ff',
    x: 13,
    z: -14,
    rotY: -Math.PI / 3,
    triggerRadius: 4.5,
  },
  {
    id: 'project-1',
    panel: 'projects',
    projectIndex: 1,
    label: 'Counselling App booth',
    sign: 'COUNSEL APP',
    emoji: '🫂',
    color: '#b07cff',
    x: 20,
    z: -9,
    rotY: -Math.PI / 2.4,
    triggerRadius: 4.5,
  },
  {
    id: 'project-2',
    panel: 'projects',
    projectIndex: 2,
    label: 'Weather App booth',
    sign: 'WEATHER',
    emoji: '⛅',
    color: '#ffd166',
    x: 26,
    z: -3,
    rotY: -Math.PI / 1.9,
    triggerRadius: 4.5,
  },
  {
    id: 'contact',
    panel: 'contact',
    label: 'Say Hello',
    sign: 'CONTACT',
    emoji: '✉️',
    color: '#ff7ab6',
    x: 16,
    z: 10,
    rotY: -Math.PI / 3.2,
    triggerRadius: 5,
  },
  {
    id: 'arcade',
    panel: 'arcade',
    label: 'Arcade Corner',
    sign: 'ARCADE',
    emoji: '🕹️',
    color: '#ff9f43',
    x: 0,
    z: -19.8,
    rotY: 0,
    triggerRadius: 5,
  },
];

// The logical sections used for the "visited" progress.
export const sectionsForProgress = ['about', 'tech', 'projects', 'contact', 'arcade'];

export const panelTitles = {
  about: 'About Me',
  tech: 'Tech Stack',
  projects: 'Projects',
  contact: 'Contact',
  arcade: 'Arcade Corner',
};

// Fast-travel destinations (stand a little in front of each zone).
export const fastTravel = [
  { id: 'about', label: 'About Me', emoji: '👋', x: -13, z: 10.5 },
  { id: 'tech', label: 'Tech Lab', emoji: '🧪', x: -15.5, z: -8 },
  { id: 'projects', label: 'Projects', emoji: '🎪', x: 16.5, z: -10.5 },
  { id: 'contact', label: 'Contact', emoji: '✉️', x: 13, z: 12.5 },
  { id: 'arcade', label: 'Arcade', emoji: '🕹️', x: 0, z: -16 },
  { id: 'gate', label: 'Entrance', emoji: '🎡', x: 0, z: 24 },
];
