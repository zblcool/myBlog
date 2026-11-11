/**
 * The live demos on the home page: each opens the explainer on one device (`equipment` is its
 * `?equipment=` id). `verbs` say what a visitor does there, matching the product lines:
 * explore and understand (Showcase), configure (Configurator). Only what the live demo really
 * does: the pump set and the cylinder have a working Configure tab, the others do not.
 *
 * Images are crops of live explainer captures (public/studio/demos) or the
 * showcase renders (public/studio/shots).
 */
import { shot } from "./devices";

export type Verb = "explore" | "configure" | "understand";

export interface LiveDemo {
  equipment: "pump-set" | "iso-cylinder" | "worm-gearbox" | "jet-engine" | "disk-brake" | "hope-rotor";
  image: string;
  verbs: Verb[];
  /** Extra explainer parameters, e.g. opening on the Configure tab. */
  params?: Record<string, string>;
  /** English-only page on this site: a product page or the case study. */
  page?: { kind: "product" | "case"; href: string };
}

export const liveDemos: LiveDemo[] = [
  {
    equipment: "pump-set",
    image: "/studio/demos/pump-set-card.webp",
    verbs: ["explore", "configure", "understand"],
    page: { kind: "case", href: "/case-study/centrifugal-pump-set/" },
  },
  {
    equipment: "iso-cylinder",
    image: "/studio/demos/iso-cylinder-card.webp",
    verbs: ["configure"],
    params: { view: "configure" },
  },
  {
    equipment: "worm-gearbox",
    image: shot("worm-gearbox", "xray"),
    verbs: ["explore", "understand"],
    page: { kind: "product", href: "/showcase/worm-gearbox/" },
  },
  {
    equipment: "jet-engine",
    image: shot("jet-engine", "solid"),
    verbs: ["understand"],
    page: { kind: "product", href: "/showcase/jet-engine/" },
  },
  {
    equipment: "disk-brake",
    image: shot("disk-brake", "exploded"),
    verbs: ["explore"],
    page: { kind: "product", href: "/showcase/disk-brake/" },
  },
  {
    equipment: "hope-rotor",
    image: shot("hope-rotor", "exploded"),
    verbs: ["explore"],
    page: { kind: "product", href: "/showcase/hope-rotor/" },
  },
];
