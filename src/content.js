// Everything the site says lives here, so copy can change without touching layout.

export const profile = {
  first: 'Devansh',
  last: 'Agarwal',
  tagline: 'Builder of Billlion. Writer of stories. Headed for IIM.',
  email: 'tisdevansh@gmail.com',
  linkedin: 'https://www.linkedin.com/in/tisdevansh/',
  linktree: 'https://linktr.ee/tisdevansh',
};

// Order matches the <section className="scene"> order and the particle shapes.
export const scenes = [
  { id: 'intro', label: 'Introduction', accent: '#f3eee6' },
  { id: 'record', label: 'The record', accent: '#ffb454' },
  { id: 'billlion', label: 'Billlion', accent: '#7cf2c4' },
  { id: 'craft', label: 'The craft', accent: '#8ab4ff' },
  { id: 'stories', label: 'The stories', accent: '#ff8fab' },
  { id: 'next', label: 'IPMAT 2027', accent: '#ffd27a' },
  { id: 'credits', label: 'Credits', accent: '#c9b8ff' },
];

export const record = [
  { value: 95.4, grade: 'Class X', track: 'ICSE', school: "St. George's School" },
  { value: 82.6, grade: 'Class XII', track: 'Science · PCM', school: 'Ess Ess Convent' },
];

const shot = (name) => `${process.env.PUBLIC_URL}/images/billlion/${name}.webp`;

export const billlion = {
  pitch: 'A stock, ERP and counter-billing system. One place to run the whole business, from the shop counter to the factory floor.',
  layersLine: 'Every layer of a business, in one system.',
  role: 'Conceived, designed and built by Devansh Agarwal',
  demoNote: 'Screens from a Billlion demo filled with sample data for a fictional company.',
  shots: [
    {
      src: shot('sales'),
      title: 'Sales & GST registers',
      body: 'Every bill lands in the right register with GST worked out, and missing invoice numbers get caught automatically.',
    },
    {
      src: shot('stock'),
      title: 'Raw-material stock',
      body: 'Fabric, thread and packing: opening, purchased, opened and adjusted, down to which roll was opened, when and by whom.',
    },
    {
      src: shot('finished'),
      title: 'Stage-wise finished stock',
      body: 'Made, sold, returned and damaged, tracked product by colour by size and carried forward month to month.',
    },
    {
      src: shot('jobcards'),
      title: 'Job cards with stage tracking',
      body: 'Cutting, stitching, finishing, packing. Every card shows how far along it is, and posts finished pieces straight into stock.',
    },
    {
      src: shot('jobcard'),
      title: 'Planned vs actual',
      body: 'Planned pieces print on the card. Actual and rejected counts come back from the floor and are typed in once.',
    },
    {
      src: shot('pnl'),
      title: 'Summary, GST & P&L',
      body: 'Net GST payable, input credit, expenses and cash movement for the month, always in step with the books.',
    },
  ],
};

export const terminal = [
  { kind: 'cmd', text: 'whoami' },
  { kind: 'out', text: 'devansh agarwal: builds software, writes stories' },
  { kind: 'cmd', text: 'ls ./projects' },
  { kind: 'out', text: 'billlion/   webume/   shinchan-world/' },
  { kind: 'cmd', text: 'cat stack.txt' },
  { kind: 'out', text: 'Python · Java · C/C++ · JavaScript · Firebase · MongoDB' },
  { kind: 'cmd', text: './ship --next' },
  { kind: 'out', text: '▸ compiling ambition… done' },
];

// The skill tree: four branches around a core
export const skillTree = {
  languages: 'English · Hindi',
  branches: [
    { title: 'Build', note: 'Technical', items: ['Python', 'Java', 'C / C++', 'JavaScript', 'HTML & CSS', 'Firebase', 'MongoDB', 'GitHub'] },
    {
      title: 'Lead',
      note: 'Outreach & management',
      items: ['Corporate outreach', 'Sponsorship pitching', 'Negotiation', 'Stakeholder coordination', 'Event planning', 'Team leadership'],
    },
    { title: 'Speak', note: 'Communication', items: ['Public speaking', 'Debate', 'Anchoring', 'Professional writing'] },
    { title: 'Create', note: 'Design & story', items: ['Script writing', 'Poetry', 'Canva', 'SolidWorks', 'MS Office'] },
  ],
};

export const stories = {
  image: `${process.env.PUBLIC_URL}/images/shinchan-world.webp`,
  imageAlt:
    'Concept art for Shinchan World: blocky, Roblox-style versions of the Shin-chan family and friends gathered in a sunny town square.',
  title: 'Shinchan World',
  captions: [
    'A Roblox world, imagined frame by frame.',
    'Familiar faces. A whole new town to explore.',
    'Concept and story by Devansh. Now in development.',
  ],
  disclaimer:
    'Shinchan World is a fan concept, not affiliated with Roblox Corporation or the creators of Crayon Shin-chan.',
  pipeline: [
    { title: 'Idea', status: 'done', body: 'Characters, worlds and the "what if" that starts everything.' },
    { title: 'Script', status: 'now', body: 'Short-film scripts: scenes, beats and dialogue.' },
    { title: 'Storyboard', status: 'next', body: 'Turning pages into shots and pacing.' },
    { title: 'Screen', status: 'next', body: 'The first short films, coming soon.' },
  ],
};

export const next = {
  line: 'Preparing for IPMAT 2027, the entrance to the five-year Integrated Programme in Management.',
  targets: [{ name: 'IIM Indore', tag: 'Primary target' }, { name: 'IIM Rohtak' }, { name: 'IIM Shillong' }],
  tracks: ['Quantitative ability', 'Verbal ability', 'Logical reasoning'],
};

export const credits = [
  ['Starring', 'Devansh Agarwal'],
  ['Product', 'Billlion'],
  ['Written by', 'Devansh Agarwal'],
  ['Off-screen', 'Reading · Poetry · Creative writing'],
  ['Obsessed with', 'Startups · AI'],
  ['Soundtrack', 'Music, always'],
  ['Score', 'Generated live in your browser'],
  ['Built with', 'React · GSAP · Three.js · Lenis'],
  ['Next scene', 'IIM, 2027'],
];
