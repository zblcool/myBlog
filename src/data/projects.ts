export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  year: string;
  status: string;
  headline: string;
  summary: string;
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
    slug: "visual-memory",
    title: "Visual Memory",
    year: "2020",
    status: "Archive Refresh",
    headline: "A graphics-heavy project archive that deserves a clearer case study shape.",
    summary:
      "This was previously shown as a loose GIF wall. In the new site, it becomes a structured project story with room for process, tools, and a future interactive demo.",
    role: "Design, front-end implementation, and graphics exploration",
    stack: ["Web", "Computer Graphics", "Interaction Design", "Three.js-ready"],
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
      "The original portfolio section showed rich material, but it did not explain the project well enough for a visitor to understand the concept or the technical direction.",
    approach:
      "The migration keeps the media assets, but moves the project description into structured data first. That gives us room to grow it into a dedicated project page and later replace parts of the gallery with a proper Three.js scene.",
    outcome:
      "This project is now positioned as a feature case study candidate instead of a loose collection of files. The next step is turning the archive into an interactive showcase.",
    links: [
      { label: "Open portfolio overview", href: "/portfolio/" },
    ],
  },
  {
    slug: "standups-lottery",
    title: "Stand-ups Lottery",
    year: "2021",
    status: "Live Utility",
    headline: "A lightweight team tool that already proves the site can host product-like experiments.",
    summary:
      "Instead of being buried as an iframe page, this tool is now framed as one of the site's product experiments. It is a good candidate for future React and Three.js-adjacent interaction patterns.",
    role: "Tooling idea, UI implementation, and deployment",
    stack: ["Tooling", "Front-end", "Embedded Utility"],
    cover: "/pics/poster-sss.png",
    gallery: ["/pics/poster-sss.png"],
    challenge:
      "The tool existed, but its relationship to the rest of the site was weak. It looked more like an external embed than part of a coherent personal platform.",
    approach:
      "The new architecture treats tools as first-class content. Their metadata lives in data files, while the page shell remains separate from the tool implementation.",
    outcome:
      "The tool now sits in a cleaner place within the site structure, and it gives us a pattern for future experiments that may become more interactive later.",
    links: [
      { label: "Open tool page", href: "/tool/" },
      {
        label: "Launch live utility",
        href: "https://zblcool.github.io/LuckyBacon",
        external: true,
      },
    ],
  },
  {
    slug: "galaxy-construction-company",
    title: "Galaxy Construction Company",
    year: "2020",
    status: "Concept Case Study",
    headline: "A concept poster that can evolve into a richer narrative project page.",
    summary:
      "This piece currently exists as a strong static visual. The migration turns it into structured project content so it can later be expanded with story, process, and possibly a lightweight interactive layer.",
    role: "Concept visual design and storytelling",
    stack: ["Visual Design", "Art Direction", "Case Study"],
    cover: "/pics/portfolios/GalaxyConstructionCompany.png",
    gallery: ["/pics/portfolios/GalaxyConstructionCompany.png", "/background.JPG"],
    challenge:
      "Static showcase pieces often disappear inside generic portfolio layouts. The older site did not give this work enough narrative framing.",
    approach:
      "By moving project information into a reusable data layer, this concept piece can now be presented with context instead of relying on a single image to do all the work.",
    outcome:
      "The project becomes easier to expand later, whether that means adding process writing, a motion study, or a small interactive scene.",
    links: [{ label: "Open portfolio overview", href: "/portfolio/" }],
  },
];
