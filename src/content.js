// Everything the site says lives here, so copy can change without touching layout.

export const profile = {
  first: 'Devansh',
  last: 'Agarwal',
  tagline: 'Builder of Billlion and Vigil. Storyteller. Headed for IIM.',
  email: 'tisdevansh@gmail.com',
  linkedin: 'https://www.linkedin.com/in/tisdevansh/',
  linktree: 'https://linktr.ee/tisdevansh',
};

// Order matches the <section className="scene"> order and the particle shapes.
export const scenes = [
  { id: 'intro', label: 'Introduction', accent: '#f3eee6' },
  { id: 'record', label: 'The record', accent: '#ffb454' },
  { id: 'billlion', label: 'Billlion', accent: '#7cf2c4' },
  { id: 'vigil', label: 'Vigil', accent: '#f2a541' },
  { id: 'craft', label: 'The craft', accent: '#8ab4ff' },
  { id: 'sarathi', label: 'Sarathi', accent: '#ffb86b' },
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
  { kind: 'out', text: 'billlion/   vigil/   sarathi/   webume/' },
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

const vigilImg = (name) => `${process.env.PUBLIC_URL}/images/vigil/${name}.webp`;

export const vigil = {
  tagline: 'The study partner that actually watches.',
  pitch:
    'Mayu the peacock sits next to you. She blocks reels and distracting apps, checks with the camera that you are really at the desk, plans your whole prep from the official syllabus, and tells your parents when you skip.',
  video: `${process.env.PUBLIC_URL}/media/vigil-promo.mp4`,
  poster: `${process.env.PUBLIC_URL}/media/vigil-promo-poster.jpg`,
  sounds: { block: `${process.env.PUBLIC_URL}/sounds/vigil-block.mp3`, reels: `${process.env.PUBLIC_URL}/sounds/vigil-reels.mp3` },
  platforms: ['Android', 'Windows', 'Linked together', 'Free'],
  // Mayu's real lines from the app
  blockLines: [
    'Reels are blocked. That scroll was going to take 47 minutes. I checked.',
    'Shorts are long losses. Blocked.',
    'Nope. Not one reel. Not "just one". Blocked.',
    'Not today. Back to work.',
    "I closed that for you. You're welcome.",
    'Imagine explaining to the exam that you watched reels instead. Blocked.',
  ],
  awayLines: ["Hello? I can't see you. The timer is paused until you're back.", "Empty chair detected. Studying from the fridge doesn't count."],
  backLines: ["There you are! Timer's running again.", "Welcome back. Let's pick up where we left off."],
  features: [
    { title: 'Blocks reels & apps', body: 'Shorts, reels, games and every app you did not pick for the session. Even uninstalling needs the guardian PIN.' },
    { title: 'Watches the desk', body: 'An on-device camera glance every 20 seconds. Leave the chair and the timer stops counting. Nothing is saved.' },
    { title: 'Plans the whole prep', body: 'JEE, NEET, CUET, IPMAT, CAT and the boards, topic by topic with weightage, straight from the official syllabus.' },
    { title: 'Tells your parents', body: 'Miss the target or try to cheat and a parent gets an SMS or WhatsApp. Vigil Parent shows them the whole week.' },
    { title: 'Phone + laptop, linked', body: 'Start a session on one device and both lock down. A penalty earned on one locks all of them.' },
    { title: 'Mocks & question timer', body: 'Six-bucket mock analysis, speed and accuracy by topic, and weak spots fed straight back into the plan.' },
  ],
  screens: [
    { src: vigilImg('session'), label: 'Focus session' },
    { src: vigilImg('blocked-reels'), label: 'Reels blocked' },
    { src: vigilImg('home'), label: 'Today' },
    { src: vigilImg('plan'), label: 'Daily plan' },
    { src: vigilImg('stats'), label: 'Stats' },
  ],
  demoNote: 'Screens from Vigil running with a demo student.',
};

const sarathiImg = (name) => `${process.env.PUBLIC_URL}/images/sarathi/${name}.webp`;

// Sarathi: Krishna ji and Arjun, in Minecraft, solving Gen Z problems
export const sarathi = {
  title: 'Sarathi',
  devanagari: 'सारथी',
  tagline: 'The Gita, but make it Gen Z.',
  pitch:
    'A Minecraft-animated series where Krishna ji gives Arjun updesh on the problems we actually have: exam stress, situationships, doomscrolling, comparison. Real Gita wisdom, in our language.',
  image: sarathiImg('key-art'),
  imageAlt: 'Blocky, Minecraft-style Krishna ji sitting on a golden chariot, talking to Arjun, who rests beside his bow at sunset by a river.',
  captions: [
    ['Arjun', 'Bhai, mujhse nahi hoga. Sab mujhse aage hain 😭'],
    ['Krishna ji', 'Arjun. Breathe. Apna karm kar, result ki tension mat le.'],
    ['Krishna ji', 'Aur haan, comparison band. Tera level, tera game.'],
  ],
  // Ask Krishna: each answer comes from the verse it cites
  problems: [
    {
      chip: 'Results ki tension',
      arjun: 'Krishna ji, result ka soch soch ke padhai hi nahi ho rahi. What if I fail?',
      krishna: 'Arjun, tera control sirf effort pe hai, outcome pe nahi. Result ko apna boss mat bana. Aaj ka chapter finish kar, bas wahi tera kaam hai.',
      verse: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
      ref: 'Gita 2.47',
    },
    {
      chip: 'Situationship',
      arjun: 'Woh reply nahi karti, phir bhi din bhar wahi dimaag mein ghoomti hai. Kya karun?',
      krishna: 'Kisi cheez ke baare mein baar baar sochoge toh attachment banega, attachment se craving, craving se gussa, aur gusse mein clarity gone. Loop todo, focus wapas apne pe lao.',
      verse: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते',
      ref: 'Gita 2.62',
    },
    {
      chip: '3AM doomscrolling',
      arjun: 'Bas ek reel dekhne baitha tha. Ab 3 baj gaye. Mind control hi nahi hota.',
      krishna: 'Haan, mann restless hai, maana. Par practice aur thodi detachment se yeh control hota hai. Phone door rakho, roz thoda thoda. Consistency hi cheat code hai.',
      verse: 'अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते',
      ref: 'Gita 6.35',
    },
    {
      chip: 'Sab aage nikal gaye',
      arjun: 'LinkedIn kholo toh sab internships kar rahe hain. Main kya kar raha hoon life mein?',
      krishna: 'Apna dharma imperfectly karna bhi kisi aur ka perfectly copy karne se better hai. Unki timeline unki, teri timeline teri. Apni lane mein rehke grind kar.',
      verse: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्',
      ref: 'Gita 3.35',
    },
    {
      chip: 'Heartbreak',
      arjun: 'Sab khatam lag raha hai yaar. Yeh dard kabhi jayega?',
      krishna: 'Sukh aur dukh mausam jaise hain, aate hain, jaate hain. Kuch bhi permanent nahi. Isko feel karo, sehan karo, aur yaad rakho, yeh phase bhi nikal jayega.',
      verse: 'आगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत',
      ref: 'Gita 2.14',
    },
    {
      chip: 'Overthinking',
      arjun: 'Main hi apna sabse bada enemy hoon. Har cheez overthink karta hoon.',
      krishna: 'Bilkul sahi pakda. Mann dost bhi hai aur dushman bhi. Khud ko khud hi upar uthana padega, khud ko neeche mat gira. Self-talk thoda kind rakho.',
      verse: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्',
      ref: 'Gita 6.5',
    },
  ],
  episodes: [
    { no: '01', title: 'Karm kar, result ki tension mat le', problem: 'Exam result anxiety', ref: '2.47' },
    { no: '02', title: 'Situationship ka loop', problem: 'Attachment and overthinking', ref: '2.62–63' },
    { no: '03', title: '3AM wala scroll', problem: 'Doomscrolling and a restless mind', ref: '6.35' },
    { no: '04', title: 'Teri lane, tera game', problem: 'Comparison on LinkedIn and Insta', ref: '3.35' },
    { no: '05', title: 'Yeh phase bhi nikal jayega', problem: 'Heartbreak and rejection', ref: '2.14' },
    { no: '06', title: 'Khud ka best friend ban', problem: 'Overthinking and self-doubt', ref: '6.5' },
  ],
  pipeline: [
    { title: 'Idea', status: 'done', body: 'Krishna ji, Arjun, and the problems Gen Z actually has.' },
    { title: 'Script', status: 'now', body: 'Episode scripts: the problem, the updesh, the verse, in our language.' },
    { title: 'Build', status: 'next', body: 'Kurukshetra, the chariot and every set, built block by block in Minecraft.' },
    { title: 'Upload', status: 'next', body: 'Animated episodes, coming soon.' },
  ],
  disclaimer: 'Made in Minecraft. Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.',
};

export const next = {
  line: 'Preparing for IPMAT 2027, the entrance to the five-year Integrated Programme in Management.',
  targets: [{ name: 'IIM Indore', tag: 'Primary target' }, { name: 'IIM Rohtak' }, { name: 'IIM Shillong' }],
  tracks: ['Quantitative ability', 'Verbal ability', 'Logical reasoning'],
};

export const credits = [
  ['Starring', 'Devansh Agarwal'],
  ['Products', 'Billlion · Vigil'],
  ['Series', 'Sarathi'],
  ['Study partner', 'Mayu the peacock'],
  ['Written by', 'Devansh Agarwal'],
  ['Off-screen', 'Reading · Poetry · Creative writing'],
  ['Obsessed with', 'Startups · AI'],
  ['Soundtrack', 'Music, always'],
  ['Score', 'Generated live in your browser'],
  ['Built with', 'React · GSAP · Three.js · Lenis'],
  ['Next scene', 'IIM, 2027'],
];
