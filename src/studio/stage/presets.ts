/**
 * Hero exhibition booth: the looks and exhibits the "Customise booth" panel switches between.
 * Plain data, shared by the Astro markup (labels, defaults) and the Babylon scene.
 */

export type ThemeId = "graphite" | "gallery";
export type LightingId = "amber" | "neutral";
export type BoothStyleId = "minimal" | "industrial";
export type EquipmentId = "worm-gearbox" | "hydraulic-cylinder" | "bagging-machine";

export interface StageConfig {
  theme: ThemeId;
  lighting: LightingId;
  style: BoothStyleId;
  equipment: EquipmentId;
}

export const defaultConfig: StageConfig = {
  theme: "graphite",
  lighting: "amber",
  style: "minimal",
  equipment: "worm-gearbox",
};

export const themeIds: ThemeId[] = ["graphite", "gallery"];
export const lightingIds: LightingId[] = ["amber", "neutral"];
export const styleIds: BoothStyleId[] = ["minimal", "industrial"];
export const equipmentIds: EquipmentId[] = ["worm-gearbox", "hydraulic-cylinder", "bagging-machine"];

export interface EquipmentModel {
  /** Under public/, without the base path. */
  file: string;
  /** Largest dimension on the stand, in metres: exhibit scale, not catalogue scale. */
  size: number;
  /** Turn about the vertical axis so the model shows its best side to the resting camera. */
  yaw: number;
  /** Attribution the model's licence asks for, shown while it is on display. */
  credit?: string;
  /** Repaint materials by glTF name, so the model sits in the booth's palette. */
  finish?: Record<string, { color: string; metallic: number; roughness: number }>;
}

/** Copied from the explainer's public/models (same licences; see its equipment configs). */
export const equipmentModels: Record<EquipmentId, EquipmentModel> = {
  "worm-gearbox": {
    file: "/studio/stage/models/worm-gearbox.glb",
    size: 1.35,
    yaw: 2.55,
    credit: "Model: “Warm Gearbox” by T-FLEX CAD ST, CC BY 4.0",
    // Housing paint: brand steel instead of the catalogue's bright blue.
    finish: { App81: { color: "#5a7590", metallic: 0.05, roughness: 0.42 } },
  },
  "hydraulic-cylinder": {
    file: "/studio/stage/models/hydraulic-cylinder.glb",
    size: 1.85,
    yaw: -0.2,
    // A deeper industrial red: the catalogue red turns orange under the amber key.
    finish: { cylinder_red: { color: "#9a2c22", metallic: 0, roughness: 0.36 } },
  },
  "bagging-machine": {
    file: "/studio/stage/models/bagging-machine.glb",
    size: 2.2,
    yaw: 3.64,
    // Satin metal instead of flat white powder coat.
    finish: { powder_coat: { color: "#d3d8dc", metallic: 0.55, roughness: 0.4 } },
  },
};

/** Renders from the site's showcase, shown on the booth's screen, lightbox and kiosk. */
export const boothMedia = {
  screen: "/studio/shots/worm-gearbox-xray.webp",
  lightbox: "/studio/shots/jet-engine-exploded.webp",
  kiosk: "/studio/shots/worm-gearbox-section.webp",
};
