export const profile = {
  name: "Ash Zhang",
  title: "3D Graphics & WebGL Engineer",
  location: "Sydney",
  lead: "Babylon.js, custom shaders and Cesium-based GIS: digital twins, interactive maps and visual experiences that run in the browser.",
  description:
    "Ash Zhang is a Sydney-based 3D graphics engineer building real-time WebGL, shader and Cesium GIS experiences for the web.",
};

export const contactEmail = "ash.zhang.work@gmail.com";

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/zblcool" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ash-zhang/" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/zblash95/?hl=zh-cn",
  },
];

export const contactHref = `mailto:${contactEmail}`;
export const contactLabel = "Start a project";

export const navLinks = [
  { label: "Work", href: "/portfolio/" },
  { label: "Services", href: "/#services" },
  { label: "Writing", href: "/post/" },
  { label: "About", href: "/cv/" },
];

export const facts = [
  { value: "Babylon.js", label: "real-time 3D engines" },
  { value: "Shaders", label: "GLSL, ray-marching, post-processing" },
  { value: "Cesium", label: "3D GIS and maps" },
  { value: "9+ yrs", label: "building for the web" },
];

export const services = [
  {
    index: "01",
    title: "Real-time 3D",
    text: "Digital twins, product viewers, simulations and games in the browser, tuned for rendering performance.",
    tools: ["Babylon.js", "Three.js", "WebGL"],
  },
  {
    index: "02",
    title: "Shaders & visual effects",
    text: "Custom shaders, procedural geometry and post-processing that give a scene its look.",
    tools: ["GLSL", "Ray-marching", "Post-processing"],
  },
  {
    index: "03",
    title: "GIS & 3D maps",
    text: "Interactive globes and spatial data platforms that make complex geography easy to explore.",
    tools: ["Cesium", "Resium", "React"],
  },
  {
    index: "04",
    title: "Interactive web apps",
    text: "The JavaScript and TypeScript front-end around the 3D: UI, state and APIs.",
    tools: ["TypeScript", "React", "Node.js"],
  },
];

export const about = {
  summary:
    "I'm a 3D graphics engineer for the web. I work from the shader up to the interface, so the visuals, performance and product experience stay in one hand.",
  strengths: [
    "Real-time 3D with Babylon.js, Three.js and WebGL",
    "Shader programming and procedural geometry",
    "3D GIS platforms built on Cesium",
    "Rendering performance, GPU efficiency and memory",
  ],
  stack: [
    "JavaScript",
    "TypeScript",
    "Babylon.js",
    "Three.js",
    "Cesium",
    "GLSL",
    "React",
    "Node.js",
  ],
  research: [
    {
      title: "Natural resources GIS platform",
      text: "A 3D map application for analysing and managing resource data, built on Cesium and React.",
    },
    {
      title: "Voronoi structure generator",
      text: "Three.js tool using Delaunay triangulation, Jump Flood and ray-marched distance fields.",
    },
    {
      title: "Covid-3D dashboard",
      text: "Online 3D visualisation of public Covid-19 data with Three.js and React.",
    },
    {
      title: "Virtual Museum Experience",
      text: "Two-day hackathon build: lit 3D scenes, multiple cameras and a JSON-driven object loader.",
    },
  ],
  education: [
    "Master of Information Technology, UTS (High Distinction)",
    "B.Eng. Electronic Engineering, UESTC",
  ],
  awards: [
    "UTS Techcelerator 2021, top project",
    "Student Games Showcase 2021",
  ],
};

export const toolLinks = [
  {
    title: "Stand-ups Lottery",
    href: "https://zblcool.github.io/LuckyBacon",
    summary: "A small team utility for picking who speaks next.",
  },
];
