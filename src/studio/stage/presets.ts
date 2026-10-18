/**
 * Hero exhibition booth: the looks and exhibits the "Customise booth" panel switches between.
 * Plain data, shared by the Astro markup (labels, defaults) and the Babylon scene.
 */

export type ThemeId = "graphite" | "gallery";
export type LightingId = "amber" | "neutral";
export type BoothStyleId = "minimal" | "industrial";
export type EquipmentId = "pump-set" | "worm-gearbox" | "hydraulic-cylinder";

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
  equipment: "pump-set",
};

export const themeIds: ThemeId[] = ["graphite", "gallery"];
export const lightingIds: LightingId[] = ["amber", "neutral"];
export const styleIds: BoothStyleId[] = ["minimal", "industrial"];
export const equipmentIds: EquipmentId[] = ["pump-set", "worm-gearbox", "hydraulic-cylinder"];

export interface EquipmentModel {
  /** Under public/, without the base path. */
  file: string;
  /** Largest dimension on the stand, in metres: exhibit scale, not catalogue scale. */
  size: number;
  /** Turn about the vertical axis so the model shows its best side to the resting camera. */
  yaw: number;
  /** Attribution the model's licence asks for, shown while it is on display. */
  credit?: string;
}

/**
 * The pump set is our own model (the explainer draws it from ISO 2858 / IEC 60072 dimensions;
 * exported once to GLB, without its shipping skid). The others are copied from the explainer's
 * public/models, under the licences noted in its equipment configs.
 */
export const equipmentModels: Record<EquipmentId, EquipmentModel> = {
  "pump-set": {
    file: "/studio/stage/models/pump-set.glb",
    // About 1.3 m from suction flange to fan cowl; shown a touch larger so it reads from the aisle.
    size: 1.55,
    yaw: 0.25,
  },
  "worm-gearbox": {
    file: "/studio/stage/models/worm-gearbox.glb",
    size: 1.35,
    yaw: 2.55,
    credit: "Model: “Warm Gearbox” by T-FLEX CAD ST, CC BY 4.0",
  },
  "hydraulic-cylinder": {
    file: "/studio/stage/models/hydraulic-cylinder.glb",
    size: 1.85,
    yaw: -0.2,
  },
};

/** Renders from the site's showcase, shown on the booth's screen, lightbox and kiosk. */
export const boothMedia = {
  screen: "/studio/shots/worm-gearbox-xray.webp",
  lightbox: "/studio/shots/jet-engine-exploded.webp",
  kiosk: "/studio/shots/worm-gearbox-section.webp",
};
