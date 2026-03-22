export const profile = {
  name: "Ash Zhang",
  title: "Computer Graphics Focused Web Developer",
  tagline:
    "A personal site for writing, experiments, and portfolio work, rebuilt to stay content-first while leaving room for future 3D work.",
  intro:
    "The rebuild keeps writing in Markdown, stores project data separately from page templates, and gives interactive work its own React and Three.js lane.",
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
