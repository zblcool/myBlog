export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  year: string;
  kind: string;
  headline: string;
  role: string;
  stack: string[];
  cover: string;
  gallery: string[];
  challenge: string;
  approach: string;
  outcome: string;
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "hanzi-hero",
    title: "Hanzi Hero 字海残卷",
    year: "2026",
    kind: "Playable game",
    headline:
      "A survivor-style action roguelite where your powers are Chinese characters: pick radicals, fuse them into hanzi, grow those into words.",
    role: "Concept, game design, 3D, UI, front-end",
    stack: ["JavaScript", "TypeScript", "Babylon.js", "Three.js", "Firebase"],
    cover: "/pics/portfolios/hanzi-hero/battle.webp",
    gallery: [
      "/pics/portfolios/hanzi-hero/battle.webp",
      "/pics/portfolios/hanzi-hero/title-screen.webp",
      "/pics/portfolios/hanzi-hero/cangjie-road.webp",
    ],
    challenge:
      "Make Chinese characters the game mechanic rather than decoration: readable in a crowded fight, approachable for players who don't read Chinese, and deep enough that every pick is a real decision. And keep a Babylon.js battlefield full of enemies, fog and calligraphy effects running smoothly on a phone.",
    approach:
      "On level-up you pick radicals, and they fuse into characters that become skills: 日 + 月 = 明, 雨 + 田 = 雷, 人 + 木 = 休. Duplicate radicals push a skill along different axes, characters grow into words such as 明月 and 雷雨, and certain pick histories unlock hidden characters. Runs move through fog-of-war dungeon chambers with elites, bosses, relics and two heroes; every four waves the realm shifts and stamps a giant glyph from the Thousand Character Classic. A sibling deckbuilder, Cangjie Road 仓颉之路, applies the same character logic to a tower climb.",
    outcome:
      "Live in the browser at v0.5.0, with an ink-wash identity from the title screen to the HUD, Chinese and English (with pinyin), paper and night-ink themes, a phone landscape and home-screen mode, an online leaderboard and a public changelog.",
    links: [
      {
        label: "Play now",
        href: "https://hanzi-survivor.vercel.app/",
        external: true,
      },
      {
        label: "View on GitHub",
        href: "https://github.com/zblcool/hanziHero",
        external: true,
      },
      {
        label: "Changelog",
        href: "https://github.com/zblcool/hanziHero/blob/main/CHANGELOG.md",
        external: true,
      },
    ],
  },
  {
    slug: "visual-memory",
    title: "Visual Memory",
    year: "2020",
    kind: "Interactive graphics",
    headline: "A set of interactive graphics studies, including a solar-system scene and a small tool.",
    role: "Design, front-end, graphics",
    stack: ["WebGL", "Computer graphics", "Interaction"],
    cover: "/pics/VM/title.png",
    gallery: [
      "/pics/VM/VM-3.gif",
      "/pics/VM/VM-4.gif",
      "/pics/VM/VM-1.gif",
      "/pics/VM/VM-2.gif",
      "/pics/VM/VM-solar.gif",
      "/pics/VM/VM-tool.gif",
    ],
    challenge:
      "Express an abstract idea through motion and space rather than text.",
    approach:
      "Prototyped each scene in the browser and iterated on motion and interaction.",
    outcome:
      "A reference body of graphics work behind my approach to interactive interfaces.",
    links: [],
  },
  {
    slug: "small-business-recovery",
    title: "Small Business Recovery",
    year: "2020",
    kind: "App concept",
    headline: "A COVID-19 relief concept that helps people support local small businesses.",
    role: "Concept and visual design",
    stack: ["UI design", "Poster"],
    cover: "/pics/poster-sss.png",
    gallery: ["/pics/poster-sss.png"],
    challenge: "Make a call to action clear at a glance.",
    approach: "A poster that pairs one strong message with the app screens behind it.",
    outcome: "A concept piece that shows my interface and communication design.",
    links: [],
  },
  {
    slug: "galaxy-construction-company",
    title: "Galaxy Construction Company",
    year: "2020",
    kind: "Concept poster",
    headline: "A concept poster for an imaginary company building in space.",
    role: "Concept and visual design",
    stack: ["Illustration", "Art direction"],
    cover: "/pics/portfolios/GalaxyConstructionCompany.png",
    gallery: ["/pics/portfolios/GalaxyConstructionCompany.png"],
    challenge: "Tell a whole world with a single image.",
    approach: "Built the brand, tone and scene together as one piece of art direction.",
    outcome: "A standalone concept piece in my visual portfolio.",
    links: [],
  },
];
