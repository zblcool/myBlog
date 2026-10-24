export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type GalleryImage = {
  src: string;
  caption?: string;
  /** "wide" spans the full row, "third" sits three to a row; default is two to a row. */
  size?: "wide" | "third";
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
  /** Shown at its own aspect ratio in place of the cover on the project page. */
  banner?: string;
  /** A live build embedded on the project page, loaded only when the visitor starts it. */
  demo?: { src: string; poster: string; note?: string };
  gallery: (string | GalleryImage)[];
  challenge: string;
  approach: string;
  outcome: string;
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "vibe-coding-simulator",
    title: "Vibe Coding Simulator: Ship It!",
    year: "2026",
    kind: "Game in development",
    headline:
      "Quit your job, let the AI write your code, and try not to go bankrupt before Investor Demo Day: a cozy startup simulator in a low-poly 3D office, where every product is built in a card-combo roguelite.",
    role: "Concept, game design, 3D, systems, UI, front-end",
    stack: ["Babylon.js", "React", "TypeScript", "Zustand", "Vitest", "Blender"],
    cover: "/pics/portfolios/vibe-coding-simulator/ui-title.webp",
    gallery: [
      {
        src: "/pics/portfolios/vibe-coding-simulator/harbour.webp",
        caption: "Two worlds outside the window: the office tower by the harbour bridge at sunset...",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/railway.webp",
        caption: "...and a railway apartment at blue hour, with trains passing through the towers.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/vibeos-combo.webp",
        caption: "Vibe OS: chain one to three cards, in order, into Chips × Mult. Prompt + Architecture + Modifier makes a Full Stack combo.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/vibeos-quarter.webp",
        caption: "An Engineering Quarter: the Archivist as the AI Hero, a Sprint KPI to hit and a Release Day crisis waiting.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/vibeos-score.webp",
        caption: "A Brute Force hand landing against the Alpha Sprint KPI.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/vibeos-event.webp",
        caption: "A major decision between Sprints: cut the MVP to the bone, or give everybody their button.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/ui-loadout.webp",
        caption: "Quarter loadout in the studio: focus, AI Hero, deck and studio bonuses before entering Vibe OS.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/ui-event.webp",
        caption: "Development events, with skill checks and their odds shown up front.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/dive-into-monitor.webp",
        caption: "Resuming a Quarter dives the camera into the monitor.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/first-person-door.webp",
        caption: "First person: walk the room as the founder, past the Master Plan.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/ui-shop.webp",
        caption: "Office upgrades: each piece buys a bonus in every Quarter.",
      },
      {
        src: "/pics/portfolios/vibe-coding-simulator/first-person-desk.webp",
        caption: "Sit down at the desk to work, or talk to the Archivist at hers.",
      },
    ],
    challenge:
      "Make a management sim about building software with AI that is actually funny and actually a game: the choice between doing it yourself, with the AI or both has to matter, shortcuts have to come back to bite you later, and the office should be a place you like spending time in.",
    approach:
      "Two layers. The studio is the persistent one: founder, products, office, AI plan and money. Each product is built in Vibe OS, a Balatro-inspired card roguelite where cards like Furious Pseudocode, Monolith and It's a Feature combine in order and leftover Bugs become tech debt. The simulation is deterministic TypeScript, so balance bots replay hundreds of runs per strategy on every test. The AI companion, the Archivist, does the AI work, spends your credits and grows across runs, and outside the glass wall sits a whole low-poly city with synthesized ambience.",
    outcome:
      "In active development. The studio loop, the Vibe OS card game and the hand-off between them are playable, with two exteriors, first-person walking and the companion in place. Next up are real models in place of the procedural placeholders, more content and a public build.",
    links: [],
  },
  {
    slug: "my-little-universe",
    title: "My Little Universe 我的小宇宙",
    year: "2026",
    kind: "Interactive 3D diorama",
    headline:
      "Real memories with friends rebuilt as tiny low-poly dioramas, where everyone lives on: they wander, chat, rehearse their lines and stop to wave when you tap them.",
    role: "Concept, 3D, character behaviour, sound, front-end",
    stack: ["Babylon.js", "React", "TypeScript", "Web Audio API"],
    cover: "/pics/portfolios/little-universe/courtyard-still.webp",
    banner: "/pics/portfolios/little-universe/poster.webp",
    demo: {
      src: "https://friend-little-universe.vercel.app/",
      poster: "/pics/portfolios/little-universe/courtyard-still.webp",
      note: "Drag to look around, tap people and the things that carry a story. Long-press someone to pick them up.",
    },
    gallery: [
      {
        src: "/pics/portfolios/little-universe/courtyard.webp",
        caption: "The drama club rehearsing 《小院》 on the rehearsal-room floor, the play's courtyard standing as scenery.",
      },
      {
        src: "/pics/portfolios/little-universe/stage-film.webp",
        caption: "From the title card to 《青春禁忌游戏》 on the 成电会堂 stage, then the film camera cutting into close-ups.",
      },
      {
        src: "/pics/portfolios/little-universe/auditorium.webp",
        caption: "《青春禁忌游戏》 under the stage lights, with the crew at the lighting desk.",
      },
      {
        src: "/pics/portfolios/little-universe/phone.webp",
        caption: "Running on a phone in landscape.",
      },
      {
        src: "/pics/portfolios/little-universe/card-rooftop.webp",
        caption: "Concept: Friday on the roof.",
        size: "third",
      },
      {
        src: "/pics/portfolios/little-universe/card-courtyard.webp",
        caption: "Concept: the courtyard rehearsal.",
        size: "third",
      },
      {
        src: "/pics/portfolios/little-universe/card-stage.webp",
        caption: "Concept: Elena's flat on stage.",
        size: "third",
      },
    ],
    challenge:
      "Turn a handful of photos into places you can step back into. A memory should feel alive rather than frozen: friends who behave like themselves, recognisable details, and a mood that matches the night it was taken. And it all has to run in a phone browser.",
    approach:
      "Each memory starts from a photo: pick the two or three objects that make the moment recognisable, simplify the rest into reusable procedural props, and cast friends as chibi actors with their own hair, height, pace and chattiness. A small behaviour engine has them wander round the scenery, pair up for conversations, take breaks, pose for group selfies and react to each other's lines. The original photo lies somewhere on the set as a Polaroid you can pick up. A film-camera mode plays wide, sliding and close-up shots with letterbox subtitles, and everything you hear, from each actor's babble voice to the music-box waltz, is synthesized live with the Web Audio API.",
    outcome:
      "Live in the browser with four memories: 排练室里的《小院》, 《青春禁忌游戏》 in the rehearsal room or on the 成电会堂 stage, 可怜的树 from two photos taken four years apart, and 某次无关未来的录音, a recording session with a tiny auditorium beside it that people jump across to. Merging static geometry and caching the mirror's reflection took a scene from about 2,000 draw calls to about 370 per frame. Visitors can leave messages that, once approved, become part of what a character says.",
    links: [
      {
        label: "Open the live demo",
        href: "https://friend-little-universe.vercel.app/",
        external: true,
      },
    ],
  },
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
