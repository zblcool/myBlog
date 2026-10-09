/**
 * The demo devices of the Interactive Equipment Explainer shown on this site. `id` matches the
 * explainer's `?equipment=` value; renders in public/studio/shots/ were captured from the explainer.
 * Names and blurbs live in the i18n copy under `showcase.devices[id]`.
 */
export type ViewId = "solid" | "xray" | "section" | "exploded" | "scan";

export interface Device {
  id: "worm-gearbox" | "jet-engine" | "disk-brake" | "hope-rotor";
  views: ViewId[];
  /** Model licence line; CC BY requires it wherever a render is shown. */
  credit: string;
}

export const devices: Device[] = [
  {
    id: "jet-engine",
    views: ["solid", "xray", "scan", "exploded"],
    credit: '"Jet Engine" by vertexmonster (Sketchfab Standard)',
  },
  {
    id: "worm-gearbox",
    views: ["solid", "xray", "section", "exploded"],
    credit: '"Warm Gearbox" by T-FLEX CAD ST (CC BY 4.0)',
  },
  {
    id: "disk-brake",
    views: ["solid", "xray", "exploded"],
    credit: '"Car Disc Brake" by Joko_P (CC BY 4.0)',
  },
  {
    id: "hope-rotor",
    views: ["solid", "exploded"],
    credit: '"Bicycle Disc Brake Rotor Hope 203mm V4" by AndRay (Sketchfab Standard)',
  },
];

export const shot = (id: Device["id"], view: ViewId) => `/studio/shots/${id}${view === "solid" ? "" : `-${view}`}.webp`;

/**
 * Hero teaser: numbered parts on the worm gearbox render, as % of the 1600×1000 image.
 * Part copy is under `hero.parts[key]`.
 */
export const heroHotspots = [
  { key: "worm", x: 33, y: 42 },
  { key: "wheel", x: 29.5, y: 55 },
  { key: "shaft", x: 40, y: 61 },
  { key: "flange", x: 53, y: 31 },
  { key: "housing", x: 25, y: 70 },
] as const;
