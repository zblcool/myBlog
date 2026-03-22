export const profile = {
  name: "Ash Zhang",
  title: "Interactive Graphics Developer & Technical Writer",
  tagline:
    "A personal brand site for technical writing, graphics experiments, and portfolio work that can grow into richer interactive experiences.",
  intro:
    "The site now has two clear jobs: publish durable writing and showcase interactive, design-heavy work like Hanzi Workshop without mixing content and UI logic together.",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/post/" },
  { label: "Notes", href: "/notes/" },
  { label: "Tags", href: "/tag/" },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "CV", href: "/cv/" },
  { label: "Tools", href: "/tool/" },
];

export const siteSections = [
  {
    eyebrow: "Writing",
    title: "Posts",
    href: "/post/",
    summary:
      "More polished writing, essays, and practical lessons that should read like finished articles.",
    detail: "Best for featured ideas, longer explanations, and durable references.",
  },
  {
    eyebrow: "Learning",
    title: "Notes",
    href: "/notes/",
    summary:
      "Working notes, study fragments, and research trails that are still useful even when they stay rough.",
    detail: "Best for class notes, experiments, and in-progress thinking.",
  },
  {
    eyebrow: "Navigation",
    title: "Tags",
    href: "/tag/",
    summary:
      "Topic-first browsing across posts and notes, useful when the subject matters more than the format.",
    detail: "Best for jumping straight into themes like React, graphics, or algorithms.",
  },
  {
    eyebrow: "Work",
    title: "Portfolio",
    href: "/portfolio/",
    summary:
      "Case studies and project stories that explain what was built, why it matters, and how it evolved.",
    detail: "Best for seeing product, engineering, and design work in one place.",
  },
  {
    eyebrow: "Profile",
    title: "CV",
    href: "/cv/",
    summary:
      "A quick route to the current resume, with room for this page to become a richer online profile.",
    detail: "Best for recruiters, hiring managers, and direct profile sharing.",
  },
  {
    eyebrow: "Experiments",
    title: "Tools",
    href: "/tool/",
    summary:
      "Small utilities and side projects that live closer to interactive demos than to articles.",
    detail: "Best for practical experiments and standalone mini-products.",
  },
];

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/zblcool" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/baolong-zhang-704062a1/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/zblash95/?hl=zh-cn",
  },
];

export const cvSnapshot = {
  summary:
    "Computer graphics focused web developer building content-first sites, interactive interfaces, and portfolio work that can grow into richer product experiences.",
  focusAreas: [
    "Astro and static-site architecture that stays GitHub Pages friendly",
    "React and Three.js components isolated for future interactive work",
    "Project storytelling that pairs product context with implementation detail",
  ],
  highlights: [
    { label: "Current direction", value: "Content-first site rebuild with room for 3D work" },
    { label: "Working style", value: "Structured migrations, durable content systems, clear UI polish" },
    { label: "Primary stack", value: "Astro, TypeScript, React, Three.js" },
  ],
};

export const migrationPrinciples = [
  "Keep Markdown content as the source of truth during migration.",
  "Keep page templates thin so future framework changes stay manageable.",
  "Store UI data in dedicated files instead of hardcoding it into page markup.",
  "Isolate future React and Three.js work inside dedicated component folders.",
];

export const toolLinks = [
  {
    title: "Stand-ups Lottery",
    href: "https://zblcool.github.io/LuckyBacon",
    externalLabel: "Open external tool",
    embedHref: "https://zblcool.github.io/LuckyBacon",
    summary:
      "A small utility already hosted separately and embedded here as part of the migration baseline.",
  },
];
