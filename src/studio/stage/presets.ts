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

/**
 * Scroll steps after the close-up: the share of the hero's scroll that the camera move onto the
 * exhibit takes; the rest runs the exhibit through callouts, x-ray and the exploded view.
 */
export const CLOSE_UP = 0.26;

/** One part of an exhibit for the scroll steps, in the explainer's model space. */
export interface ExhibitPart {
  id: string;
  /** Mesh-name prefixes in the exhibit's GLB. */
  nodes: string[];
  /** Exploded view: direction, and distance as a share of the model's radius. */
  explode: [number, number, number];
  distance: number;
  /** Which way the callout's leader line runs from the part. */
  callout: [number, number, number];
}

export interface ExhibitFeatures {
  parts: ExhibitPart[];
  /** X-ray: meshes that always stay solid (prefixes); the rest turn see-through. */
  solid: string[];
  /** X-ray: parts shown one after another as the page scrolls, each solid and tinted in turn. */
  highlight: string[];
}

/**
 * The exhibits with scroll steps. Copied from the explainer (Interactive-Equipment-Explainer,
 * src/equipment/pump-set/equipment.config.ts: annotations, explode, the w-suction walkthrough
 * step); its skid is not in the booth's GLB. The shaft rides with the bearing bracket.
 */
export const exhibitFeatures: Partial<Record<EquipmentId, ExhibitFeatures>> = {
  "pump-set": {
    parts: [
      { id: "casing", nodes: ["casing_"], explode: [-1, 0, 0], distance: 0.3, callout: [-0.6, 1, -0.4] },
      { id: "impeller", nodes: ["impeller_"], explode: [-0.15, 0.25, -1], distance: 0.45, callout: [-1, 0.2, -0.6] },
      { id: "seal", nodes: ["cover_", "seal_"], explode: [1, 0, 0], distance: 0.1, callout: [-0.1, 1, -0.5] },
      { id: "bearing", nodes: ["bearing_", "shaft_"], explode: [1, 0, 0], distance: 0.24, callout: [0.1, 1, -0.4] },
      { id: "coupling", nodes: ["coupling_"], explode: [1, 0.5, 0], distance: 0.42, callout: [0.2, -0.4, -1] },
      { id: "guard", nodes: ["guard_"], explode: [0, 1, 0], distance: 0.5, callout: [0.3, 1, -0.3] },
      { id: "motor", nodes: ["motor_"], explode: [1, 0, 0], distance: 0.62, callout: [0.7, 1, -0.4] },
      { id: "gauges", nodes: ["gauge_"], explode: [0, 1, -0.3], distance: 0.35, callout: [-0.3, 1, -0.6] },
      { id: "baseplate", nodes: ["base_"], explode: [0, -1, 0], distance: 0.3, callout: [-0.6, -0.6, -1] },
    ],
    solid: ["shaft_"],
    highlight: ["impeller", "seal", "bearing"],
  },
};
