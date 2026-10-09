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
    slug: "hanzi-workshop",
    title: "Hanzi Workshop 汉字工坊",
    year: "2026",
    kind: "Playable demo",
    headline: "Two playable games that turn Chinese character structure into game mechanics.",
    role: "Concept, systems design, UI, front-end",
    stack: ["JavaScript", "Babylon.js", "Firebase"],
    cover: "/pics/portfolios/hanzi-workshop/hanzi-hero-battle.png",
    gallery: [
      "/pics/portfolios/hanzi-workshop/hanzi-hero-battle.png",
      "/pics/portfolios/hanzi-workshop/launcher-screenshot.png",
      "/pics/portfolios/hanzi-workshop/hanzi-hero-screenshot.png",
      "/pics/portfolios/hanzi-workshop/cangjie-road-screenshot.png",
    ],
    challenge:
      "Make characters readable, learnable and tactically interesting at once, without feeling like an educational app.",
    approach:
      "A shared bilingual launcher and two games: Hanzi Hero, a fast survivor-style battler, and Cangjie Road, a deckbuilder where characters are built from components.",
    outcome:
      "A polished, playable prototype line with its own visual identity, release notes and a stable showcase branch.",
    links: [
      {
        label: "Play live demo",
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
