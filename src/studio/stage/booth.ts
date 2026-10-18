/**
 * The exhibition booth: a 6 × 4 m inline stand in a dark hall. Back wall with a lit fascia,
 * a side wall with a lightbox, a wall screen running the explainer, a reception counter with
 * a laptop and desk sign, a literature rack, a tablet kiosk, a hanging drum sign with the
 * overhead spots, and the display plinth that carries the exhibit. Two styles share the shell:
 * Minimal (fascia arm lights, round plinth) and Industrial (truss portal, steel posts, steel
 * deck plinth).
 *
 * Built from primitives with PBR materials; scene.ts owns lights, camera, looks and the
 * screens' content (screens.ts).
 */
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateDisc } from "@babylonjs/core/Meshes/Builders/discBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { CreateTorus } from "@babylonjs/core/Meshes/Builders/torusBuilder";
import { ExtrudeShape } from "@babylonjs/core/Meshes/Builders/shapeBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector2, Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { BoothStyleId } from "./presets";
import { boothMedia } from "./presets";
import { carpetTexture, concreteTexture, keyboardTexture, lockupTexture, markTexture, radialTexture, roundedPanelTexture, washTexture } from "./textures";

/** Top of the raised booth floor. */
export const FLOOR = 0.07;
const WALL_H = 2.62;
const FASCIA_H = 0.56;
/** Where the display plinth stands. */
export const STAND = new Vector3(0.45, FLOOR, -0.1);
/** The plinths are built at full size and scaled to fit the booth. */
const PLINTH_SCALE = 0.8;
export const plinthTops: Record<BoothStyleId, number> = { minimal: 0.2, industrial: 0.27 };

export const lin = (hex: string) => Color3.FromHexString(hex).toLinearSpace();

/** Things on the stand a visitor can click: where the marker sits and how the camera frames it. */
export type SpotId = "screen" | "tablet" | "laptop" | "exhibit" | "brochures" | "contact";
export interface SpotFrame {
  at: Vector3;
  radius: number;
  alpha: number;
  beta: number;
}
const FRONT = -Math.PI / 2;

export type Booth = ReturnType<typeof buildBooth>;

export function buildBooth(scene: Scene, url: (path: string) => string) {
  // ---------------------------------------------------------------- materials
  const pbr = (name: string, setup: (m: PBRMaterial) => void = () => {}) => {
    const m = new PBRMaterial(name, scene);
    m.metallic = 0;
    m.roughness = 0.6;
    setup(m);
    return m;
  };
  const emissive = (name: string) =>
    pbr(name, (m) => {
      m.albedoColor = Color3.Black();
      m.roughness = 1;
    });
  /** A lit display: black glass with the picture as emission. Content is set by scene.ts. */
  const display = (name: string, gloss: number) =>
    pbr(name, (m) => {
      m.albedoColor = Color3.Black();
      m.emissiveColor = Color3.White();
      m.roughness = gloss;
      m.environmentIntensity = 0.6;
    });

  const concrete = concreteTexture(scene);
  concrete.uScale = concrete.vScale = 80 / 6;
  const hallFloor = pbr("hall-floor", (m) => {
    m.albedoTexture = concrete;
    m.roughness = 0.3;
    m.environmentIntensity = 0.35;
  });
  const carpetTex = carpetTexture(scene);
  carpetTex.uScale = 6;
  carpetTex.vScale = 4;
  const carpet = pbr("carpet", (m) => {
    m.albedoTexture = carpetTex;
    m.roughness = 0.95;
    m.metallicF0Factor = 0.2;
    m.environmentIntensity = 0.3;
  });
  const inlay = pbr("inlay", (m) => {
    m.albedoTexture = markTexture("inlay", scene);
    m.useAlphaFromAlbedoTexture = true;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    m.roughness = 0.9;
    m.metallicF0Factor = 0.2;
  });
  const wallPanel = pbr("wall-panel", (m) => {
    m.roughness = 0.72;
    m.environmentIntensity = 0.3;
    m.emissiveTexture = washTexture("downwash", scene, true);
  });
  const panel = pbr("panel", (m) => {
    m.roughness = 0.62;
    m.environmentIntensity = 0.3;
  });
  const backer = pbr("backer", (m) => (m.roughness = 0.9));
  const counterTop = pbr("counter-top", (m) => {
    m.roughness = 0.28;
    m.environmentIntensity = 0.5;
  });
  const blackGloss = pbr("black-gloss", (m) => {
    m.albedoColor = lin("#0b0d10");
    m.roughness = 0.2;
  });
  const aluminium = pbr("aluminium", (m) => {
    m.albedoColor = lin("#cfd4d9");
    m.metallic = 1;
    m.roughness = 0.3;
    m.anisotropy.isEnabled = true;
    m.anisotropy.intensity = 0.6;
  });
  const brushedSteel = pbr("brushed-steel", (m) => {
    m.albedoColor = lin("#9aa1a8");
    m.metallic = 1;
    m.roughness = 0.38;
    m.anisotropy.isEnabled = true;
    m.anisotropy.intensity = 0.85;
    m.anisotropy.direction = new Vector2(1, 0);
  });
  const darkSteel = pbr("dark-steel", (m) => {
    m.albedoColor = lin("#3b4148");
    m.metallic = 0.9;
    m.roughness = 0.5;
  });
  // Laptop shell: anodised space grey (kept under the rim light's metal threshold).
  const spaceGrey = pbr("space-grey", (m) => {
    m.albedoColor = lin("#7d838a");
    m.metallic = 0.6;
    m.roughness = 0.38;
  });
  const paper = pbr("paper", (m) => {
    m.albedoColor = lin("#e9eaeb");
    m.roughness = 0.85;
  });
  const fabric = pbr("drum", (m) => {
    m.albedoColor = lin("#15191e");
    m.roughness = 0.9;
    m.environmentIntensity = 0.2;
  });
  const plinth = pbr("plinth", (m) => (m.environmentIntensity = 0.25));
  const gap = pbr("gap", (m) => (m.roughness = 0.85));
  const turntable = pbr("turntable", (m) => (m.roughness = 0.62));
  const accent = emissive("accent");
  // One lens per switch-on group, so the intro can strike them one after another.
  const armLenses = [emissive("arm-lens-1"), emissive("arm-lens-2"), emissive("arm-lens-3")];
  const trussLens = emissive("truss-lens");
  const drumLens = emissive("drum-lens");

  const screen = display("screen", 0.12);
  const tabletScreen = display("tablet-screen", 0.1);
  const laptopScreen = display("laptop-screen", 0.1);
  const lightboxTex = new Texture(url(boothMedia.lightbox), scene, false, true);
  // The lightbox is portrait; the render is 16:10. Crop its middle.
  lightboxTex.uScale = 1.18 / 2.02 / 1.6;
  lightboxTex.uOffset = (1 - lightboxTex.uScale) / 2;
  const lightbox = display("lightbox", 0.85);
  lightbox.emissiveTexture = lightboxTex;
  const brochures = pbr("brochures", (m) => (m.roughness = 0.45));
  const desk = pbr("desk-sign", (m) => {
    m.roughness = 0.15;
    m.environmentIntensity = 0.7;
  });

  const lockup = lockupTexture("lockup", 1024, 180, scene);
  const sign = pbr("sign", (m) => {
    m.albedoTexture = lockup.texture;
    m.useAlphaFromAlbedoTexture = true;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    m.emissiveTexture = lockup.texture;
    m.metallic = 0.4;
    m.roughness = 0.4;
  });
  // The drum's print is always the light lockup: a backlit fabric sign, dark or light hall.
  const drumPrint = lockupTexture("drum-print", 1024, 180, scene);
  drumPrint.paint("onDark");
  drumPrint.texture.wrapU = Texture.WRAP_ADDRESSMODE;
  drumPrint.texture.uScale = -2;
  drumPrint.texture.uOffset = 0.3; // a whole lockup faces the aisle
  fabric.emissiveTexture = drumPrint.texture;

  // Floor glows are alpha-blended: additive ones speckle on some GPUs (iOS especially).
  const spill = pbr("spill", (m) => {
    m.unlit = true;
    m.albedoTexture = radialTexture("spill", scene, [
      [0, 0],
      [0.58, 0],
      [0.66, 0.9],
      [0.76, 0.25],
      [1, 0],
    ]);
    m.useAlphaFromAlbedoTexture = true;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  });
  const pool = pbr("pool", (m) => {
    m.unlit = true;
    m.albedoTexture = radialTexture("pool", scene, [
      [0, 1],
      [0.35, 0.55],
      [1, 0],
    ]);
    m.useAlphaFromAlbedoTexture = true;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  });
  const contact = pbr("contact", (m) => {
    m.unlit = true;
    m.albedoColor = Color3.Black();
    m.opacityTexture = radialTexture("contact", scene, [
      [0, 0.6],
      [0.45, 0.32],
      [1, 0],
    ]);
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  });
  const trackpad = pbr("trackpad", (m) => {
    m.albedoColor = lin("#8b9197");
    m.metallic = 0.3;
    m.roughness = 0.22;
  });
  const keys = pbr("keyboard", (m) => {
    m.albedoTexture = keyboardTexture(scene);
    m.roughness = 0.55;
  });
  const lidLogo = pbr("lid-logo", (m) => {
    m.albedoTexture = markTexture("lid-logo", scene);
    m.useAlphaFromAlbedoTexture = true;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    m.albedoColor = lin("#c9ced3");
    m.metallic = 0.8;
    m.roughness = 0.2;
  });
  /** Black cover glass with rounded corners (alpha), for the tablet's front. */
  const tabletGlass = pbr("tablet-glass", (m) => {
    m.albedoTexture = roundedPanelTexture("tablet-glass", scene, 0.34 / 0.245, 0.05);
    m.useAlphaFromAlbedoTexture = true;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHATEST;
    m.roughness = 0.08;
    m.environmentIntensity = 0.8;
  });

  // ------------------------------------------------------------------ helpers
  const casters: AbstractMesh[] = [];
  const receivers: AbstractMesh[] = [];
  /** Lit by the rim light: edges worth catching (metal, the exhibit). */
  const rimLit: AbstractMesh[] = [];
  /** Lit by the booth wash: walls and fascia. */
  const washLit: AbstractMesh[] = [];
  /** LED strips: drawn on along their length when the booth powers up. */
  const leds: Mesh[] = [];
  /** Additive glows on the plinth: switched off (not just black) when unlit. */
  const spills: Mesh[] = [];
  const root = new TransformNode("booth", scene);

  const place = <M extends Mesh>(mesh: M, material: PBRMaterial, parent: TransformNode, opts: { cast?: boolean; receive?: boolean } = {}) => {
    mesh.material = material;
    mesh.parent = parent;
    mesh.isPickable = false;
    if (opts.cast !== false) casters.push(mesh);
    if (opts.receive !== false) {
      mesh.receiveShadows = true;
      receivers.push(mesh);
    }
    if ((material.metallic ?? 0) >= 0.9) rimLit.push(mesh);
    return mesh;
  };
  /** Box by size, positioned by its bottom centre. */
  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, material: PBRMaterial, parent = root, opts = {}) => {
    const mesh = place(CreateBox(name, { width: w, height: h, depth: d }, scene), material, parent, opts);
    mesh.position.set(x, y + h / 2, z);
    return mesh;
  };
  const cylinder = (name: string, d: number, h: number, x: number, y: number, z: number, material: PBRMaterial, parent = root, tessellation = 32, opts = {}) => {
    const mesh = place(CreateCylinder(name, { diameter: d, height: h, tessellation }, scene), material, parent, opts);
    mesh.position.set(x, y + h / 2, z);
    return mesh;
  };
  const plane = (name: string, w: number, h: number, material: PBRMaterial, parent = root, frontUVs?: Vector4) => {
    const mesh = CreatePlane(name, { width: w, height: h, frontUVs, sideOrientation: frontUVs ? Mesh.DOUBLESIDE : Mesh.DEFAULTSIDE }, scene);
    mesh.material = material;
    mesh.parent = parent;
    mesh.isPickable = false;
    return mesh;
  };
  const glow = { cast: false, receive: false };
  const led = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, parent = root) => {
    const mesh = box(name, w, h, d, x, y, z, accent, parent, glow);
    leds.push(mesh);
    return mesh;
  };
  const flat = (mesh: Mesh, x: number, y: number, z: number) => {
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    return mesh;
  };
  /** A rounded-corner slab, w × h, `t` thick along +z (rounded edges read as a soft bevel). */
  const slab = (name: string, w: number, h: number, t: number, r: number, material: PBRMaterial, parent: TransformNode, opts = {}) => {
    const shape: Vector3[] = [];
    const corners: [number, number, number][] = [
      [w / 2 - r, h / 2 - r, 0],
      [-w / 2 + r, h / 2 - r, Math.PI / 2],
      [-w / 2 + r, -h / 2 + r, Math.PI],
      [w / 2 - r, -h / 2 + r, (Math.PI * 3) / 2],
    ];
    for (const [cx, cy, start] of corners) {
      for (let i = 0; i <= 6; i++) {
        const a = start + (i / 6) * (Math.PI / 2);
        shape.push(new Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
      }
    }
    const mesh = ExtrudeShape(name, { shape, path: [Vector3.Zero(), new Vector3(0, 0, t)], cap: Mesh.CAP_ALL, closeShape: true }, scene);
    return place(mesh, material, parent, opts);
  };

  // ------------------------------------------------------------------ hall
  const hall = place(CreateGround("hall-floor", { width: 80, height: 80 }, scene), hallFloor, root, { cast: false });
  hall.position.z = 10;
  flat(plane("hall-pool", 22, 22, pool), 0.3, 0.003, -0.5);

  // Far-off hall lights, lost in the haze: depth, not decoration.
  const hallLight = emissive("hall-light");
  for (const [x, y, z, w] of [
    [-16, 7.5, 24, 7],
    [-4, 8, 30, 9],
    [9, 7.2, 26, 6],
    [22, 7.8, 32, 8],
  ]) {
    plane("hall-light", w, 0.35, hallLight).position.set(x, y, z);
  }

  // ------------------------------------------------------------------ floor
  box("platform", 6, FLOOR, 4, 0, 0, 0, carpet, root, { cast: false });
  box("trim-front", 6.04, FLOOR + 0.004, 0.02, 0, 0, -2.01, aluminium, root, { cast: false });
  box("trim-left", 0.02, FLOOR + 0.004, 4.04, -3.01, 0, 0, aluminium, root, { cast: false });
  box("trim-right", 0.02, FLOOR + 0.004, 1.42, 3.01, 0, -1.31, aluminium, root, { cast: false });
  led("edge-led", 5.96, 0.008, 0.01, 0, 0.004, -2.026);
  flat(plane("inlay", 0.8, 0.8, inlay), STAND.x, FLOOR + 0.002, -1.62);

  // ------------------------------------------------------------------ walls
  const BACK_Z = 1.88; // front face of the back wall
  box("backer", 6, WALL_H, 0.02, 0, FLOOR, 1.99, backer, root, { cast: false });
  for (const x of [-2, 0, 2]) washLit.push(box("wall-panel", 1.985, WALL_H, 0.1, x, FLOOR, BACK_Z + 0.05, wallPanel));
  washLit.push(box("side-wall", 0.12, WALL_H, 2.48, 2.94, FLOOR, 0.64, wallPanel));
  box("side-wall-edge", 0.124, WALL_H, 0.016, 2.94, FLOOR, -0.608, aluminium, root, { cast: false });

  // Fascia: an L-shaped lit header over both walls.
  const fasciaY = FLOOR + WALL_H;
  washLit.push(box("fascia", 6, FASCIA_H, 0.3, 0, fasciaY, 1.85, panel, root, { cast: false }));
  washLit.push(box("fascia-side", 0.3, FASCIA_H, 2.2, 2.85, fasciaY, 0.55, panel, root, { cast: false }));
  led("fascia-led", 5.7, 0.01, 0.016, 0, fasciaY - 0.012, 1.71);
  plane("fascia-sign", 2.4, 2.4 * (180 / 1024), sign).position.set(-0.2, fasciaY + FASCIA_H / 2, 1.696);

  // Wall screen running the explainer, left of the exhibit so it stays in view.
  const SCREEN = new Vector3(-1.32, FLOOR + 1.56, BACK_Z - 0.052);
  box("bezel", 2.08, 1.32, 0.05, SCREEN.x, FLOOR + 0.9, BACK_Z - 0.025, blackGloss, root, { cast: false });
  plane("screen", 2.0, 1.25, screen).position.copyFrom(SCREEN);

  // Lightbox on the side wall, facing into the booth.
  box("lightbox-frame", 0.04, 2.1, 1.26, 2.86, FLOOR + 0.3, 0.72, aluminium, root, { cast: false });
  const lightboxPlane = plane("lightbox", 1.18, 2.02, lightbox);
  lightboxPlane.rotation.y = Math.PI / 2;
  lightboxPlane.position.set(2.838, FLOOR + 1.35, 0.72);

  // ------------------------------------------------------------------ counter
  const COUNTER = new Vector3(-1.85, FLOOR, -1.05);
  const counter = new TransformNode("counter", scene);
  counter.parent = root;
  counter.position.copyFrom(COUNTER);
  box("counter-kick", 1.4, 0.06, 0.46, 0, 0, 0, gap, counter, { cast: false });
  const counterBody = box("counter-body", 1.5, 0.96, 0.56, 0, 0.06, 0, panel, counter);
  box("counter-top", 1.6, 0.04, 0.64, 0, 1.02, 0, counterTop, counter);
  led("counter-led", 1.38, 0.008, 0.01, 0, 0.002, -0.236, counter);
  plane("counter-sign", 0.9, 0.9 * (180 / 1024), sign, counter).position.set(0, 0.66, -0.2815);
  flat(plane("counter-contact", 2.0, 1.0, contact, counter), 0, 0.002, 0);

  // Laptop on the counter: the customer's website with the explainer embedded. A 14" machine:
  // rounded unibody, keyboard well, trackpad, hinge, bezel and chin, a logo on the lid.
  const laptop = new TransformNode("laptop", scene);
  laptop.parent = counter;
  laptop.position.set(-0.36, 1.06, 0.0);
  laptop.rotation.y = 0.35;
  const base = slab("laptop-base", 0.312, 0.221, 0.0155, 0.012, spaceGrey, laptop);
  base.rotation.x = -Math.PI / 2;
  flat(plane("laptop-keys", 0.272, 0.112, keys, laptop), 0, 0.0157, 0.035);
  flat(plane("laptop-trackpad", 0.128, 0.078, trackpad, laptop), 0, 0.0157, -0.066);
  const hinge = place(CreateCylinder("laptop-hinge", { diameter: 0.011, height: 0.25, tessellation: 16 }, scene), blackGloss, laptop, glow);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, 0.0125, 0.104);
  const lid = new TransformNode("laptop-lid", scene);
  lid.parent = laptop;
  lid.position.set(0, 0.0155, 0.107);
  lid.rotation.x = 0.33;
  slab("laptop-lid", 0.312, 0.217, 0.0055, 0.012, spaceGrey, lid).position.y = 0.1085;
  plane("laptop-bezel", 0.304, 0.209, blackGloss, lid).position.set(0, 0.1085, -0.0004);
  plane("laptop-screen", 0.288, 0.18, laptopScreen, lid).position.set(0, 0.1125, -0.0008);
  const logo = plane("laptop-logo", 0.045, 0.045, lidLogo, lid);
  logo.rotation.y = Math.PI;
  logo.position.set(0, 0.11, 0.0059);

  // Acrylic desk sign: "Book a demo".
  const deskSign = new TransformNode("desk-sign", scene);
  deskSign.parent = counter;
  deskSign.position.set(0.45, 1.06, -0.1);
  deskSign.rotation.y = 0.25;
  box("desk-sign-base", 0.22, 0.012, 0.07, 0, 0, 0, darkSteel, deskSign);
  const deskPanel = plane("desk-sign", 0.26, 0.13, desk, deskSign);
  deskPanel.rotation.x = -0.12;
  deskPanel.position.set(0, 0.077, 0.004);

  // ------------------------------------------------------------------ literature rack
  const RACK = new Vector3(-2.66, FLOOR, 0.3);
  const rack = new TransformNode("rack", scene);
  rack.parent = root;
  rack.position.copyFrom(RACK);
  rack.rotation.y = 0.95;
  box("rack-base", 0.38, 0.012, 0.3, 0, 0, 0, darkSteel, rack);
  for (const x of [-0.18, 0.18]) box("rack-post", 0.018, 1.32, 0.018, x, 0.012, 0.11, aluminium, rack);
  const modules = 3;
  for (let i = 0; i < modules; i++) {
    const y = 0.42 + i * 0.34;
    box("rack-shelf", 0.38, 0.008, 0.07, 0, y, 0.02, aluminium, rack);
    const cover = plane("brochure", 0.19, 0.27, brochures, rack, new Vector4(i / modules, 0, (i + 1) / modules, 1));
    cover.rotation.x = -0.22;
    cover.position.set(0, y + 0.14, 0.035);
    const pages = box("brochure-pages", 0.188, 0.268, 0.008, 0, y + 0.005, 0.044, paper, rack, glow);
    pages.rotation.x = -0.22;
  }

  // ------------------------------------------------------------------ kiosk (tablet)
  const KIOSK = new Vector3(2.05, FLOOR, -1.3);
  const kiosk = new TransformNode("kiosk", scene);
  kiosk.parent = root;
  kiosk.position.copyFrom(KIOSK);
  cylinder("kiosk-base", 0.36, 0.012, 0, 0, 0, darkSteel, kiosk, 48);
  cylinder("kiosk-pole", 0.045, 1.0, 0, 0.012, 0, aluminium, kiosk, 16);
  const head = new TransformNode("kiosk-head", scene);
  head.parent = kiosk;
  head.position.y = 1.03;
  head.rotation.x = 0.45;
  // The tablet: a 13" slab in a VESA clamp, rounded glass, slim even bezels.
  const TABLET = { w: 0.34, h: 0.245, screenW: 0.322, screenH: 0.227, y: 0.11 };
  box("tablet-clamp", 0.09, 0.07, 0.02, 0, -0.02, 0.016, darkSteel, head);
  slab("tablet", TABLET.w, TABLET.h, 0.0065, 0.018, spaceGrey, head).position.set(0, TABLET.y, 0);
  plane("tablet-glass", TABLET.w, TABLET.h, tabletGlass, head).position.set(0, TABLET.y, -0.0004);
  plane("tablet-screen", TABLET.screenW, TABLET.screenH, tabletScreen, head).position.set(0, TABLET.y, -0.0008);
  flat(plane("kiosk-contact", 0.7, 0.7, contact, kiosk), 0, 0.002, 0);

  // ------------------------------------------------------------------ plinths
  const stand = new TransformNode("stand", scene);
  stand.parent = root;
  stand.position.copyFrom(STAND);
  const plinthScale = new TransformNode("plinth-scale", scene);
  plinthScale.parent = stand;
  plinthScale.scaling.set(PLINTH_SCALE, 1, PLINTH_SCALE);

  const plinths: Record<BoothStyleId, TransformNode> = {
    minimal: new TransformNode("plinth-minimal", scene),
    industrial: new TransformNode("plinth-industrial", scene),
  };
  for (const node of Object.values(plinths)) node.parent = plinthScale;
  {
    const p = plinths.minimal;
    cylinder("gap", 2.32, 0.05, 0, 0, 0, gap, p, 96);
    cylinder("body", 2.6, 0.15, 0, 0.05, 0, plinth, p, 128);
    place(CreateTorus("trim", { diameter: 2.6, thickness: 0.012, tessellation: 128 }, scene), aluminium, p, glow).position.y = 0.2;
    place(CreateTorus("underglow", { diameter: 2.36, thickness: 0.012, tessellation: 128 }, scene), accent, p, glow).position.y = 0.045;
    spills.push(flat(plane("spill", 4.4, 4.4, spill, p), 0, 0.003, 0));
  }
  {
    const p = plinths.industrial;
    box("base", 2.84, 0.09, 2.84, 0, 0, 0, darkSteel, p);
    box("deck", 2.5, 0.14, 2.5, 0, 0.09, 0, brushedSteel, p);
    for (const [x, z, w, d] of [
      [0, -1.252, 2.2, 0.004],
      [0, 1.252, 2.2, 0.004],
      [-1.252, 0, 0.004, 2.2],
      [1.252, 0, 0.004, 2.2],
    ]) {
      box("deck-led", w, 0.014, d, x, 0.153, z, accent, p, glow);
    }
    for (const x of [-1.08, 1.08]) for (const z of [-1.08, 1.08]) cylinder("bolt", 0.075, 0.016, x, 0.23, z, aluminium, p, 6);
    cylinder("turntable", 1.92, 0.03, 0, 0.23, 0, turntable, p, 96);
    place(CreateTorus("turntable-ring", { diameter: 1.92, thickness: 0.012, tessellation: 96 }, scene), aluminium, p, glow).position.y = 0.26;
  }

  // ------------------------------------------------------------------ fixtures
  /** A spot fixture: housing + lit lens, its axis pointing from `at` to `aim`. */
  const fixture = (parent: TransformNode, at: Vector3, aim: Vector3, lensMaterial: PBRMaterial, size = 1) => {
    const node = new TransformNode("fixture", scene);
    node.parent = parent;
    node.position.copyFrom(at);
    node.rotationQuaternion = new Quaternion();
    Quaternion.FromUnitVectorsToRef(new Vector3(0, -1, 0), aim.subtract(at).normalize(), node.rotationQuaternion);
    place(CreateCylinder("fixture-body", { diameter: 0.11 * size, height: 0.2 * size, tessellation: 24 }, scene), blackGloss, node, glow);
    const lensDisc = place(CreateCylinder("fixture-lens", { diameter: 0.085 * size, height: 0.004, tessellation: 24 }, scene), lensMaterial, node, glow);
    lensDisc.position.y = -0.1 * size;
    return node;
  };

  // Hanging drum sign over the plinth, with the overhead spots that light the exhibit.
  const DRUM_Y = 4.2;
  const drum = new TransformNode("drum", scene);
  drum.parent = root;
  drum.position.set(STAND.x, DRUM_Y, STAND.z);
  place(CreateCylinder("drum", { diameter: 2.3, height: 0.6, tessellation: 72, cap: Mesh.NO_CAP }, scene), fabric, drum, { receive: false });
  const drumBase = place(CreateDisc("drum-base", { radius: 1.15, tessellation: 72 }, scene), blackGloss, drum, glow);
  drumBase.rotation.x = -Math.PI / 2;
  drumBase.position.y = -0.3;
  for (const y of [-0.3, 0.3]) place(CreateTorus("drum-trim", { diameter: 2.3, thickness: 0.03, tessellation: 72 }, scene), aluminium, drum, glow).position.y = y;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const cable = place(CreateCylinder("cable", { diameter: 0.008, height: 9, tessellation: 4 }, scene), darkSteel, drum, glow);
    cable.position.set(Math.cos(a) * 1.05, 0.3 + 4.5, Math.sin(a) * 1.05);
  }
  // Recessed downlights flush in the drum's underside: the exhibit's light comes from the sign.
  const productAim = STAND.add(new Vector3(0, 0.75, 0));
  for (const [x, z] of [
    [0, -0.45],
    [-0.42, 0.18],
    [0.42, 0.18],
  ]) {
    const lens = place(CreateDisc("downlight", { radius: 0.05, tessellation: 32 }, scene), drumLens, drum, glow);
    lens.rotation.x = -Math.PI / 2;
    lens.position.set(x, -0.303, z);
    const ring = place(CreateTorus("downlight-trim", { diameter: 0.112, thickness: 0.012, tessellation: 32 }, scene), aluminium, drum, glow);
    ring.position.set(x, -0.302, z);
  }
  const productLightAt = drum.position.add(new Vector3(0, -0.32, -0.45));

  // ------------------------------------------------------------------ style extras
  const extras: Record<BoothStyleId, TransformNode> = {
    minimal: new TransformNode("extras-minimal", scene),
    industrial: new TransformNode("extras-industrial", scene),
  };
  for (const node of Object.values(extras)) node.parent = root;

  // Minimal: arm lights off the fascia, washing the back wall.
  [-2.25, -0.4, 1.45].forEach((x, i) => {
    const arm = cylinder("arm", 0.018, 0.5, x, 0, 0, blackGloss, extras.minimal, 12, glow);
    arm.rotation.x = Math.PI / 2 - 0.35;
    arm.position.set(x, fasciaY + 0.04, 1.47);
    fixture(extras.minimal, new Vector3(x, fasciaY - 0.04, 1.22), new Vector3(x, FLOOR + 1.2, BACK_Z), armLenses[i], 0.8);
  });

  // Industrial: box-truss portal across the front with three fixtures on it.
  const TRUSS = 0.29;
  const trussMesh = (name: string, length: number) => {
    const parts: Mesh[] = [];
    const half = TRUSS / 2;
    for (const [x, z] of [
      [-half, -half],
      [half, -half],
      [half, half],
      [-half, half],
    ]) {
      const chord = CreateCylinder("chord", { diameter: 0.048, height: length, tessellation: 10 }, scene);
      chord.position.set(x, length / 2, z);
      parts.push(chord);
    }
    const bays = Math.max(1, Math.round(length / 0.5));
    const bay = length / bays;
    const diagonal = Math.hypot(bay, TRUSS);
    const tilt = Math.atan2(TRUSS, bay);
    for (let i = 0; i < bays; i++) {
      const y = bay * (i + 0.5);
      const flip = i % 2 ? 1 : -1;
      for (const face of [0, 1, 2, 3]) {
        const d = CreateCylinder("diag", { diameter: 0.022, height: diagonal, tessellation: 6 }, scene);
        d.position.y = y;
        if (face < 2) {
          d.position.z = face ? half : -half;
          d.rotation.z = tilt * flip;
        } else {
          d.position.x = face === 2 ? half : -half;
          d.rotation.x = tilt * flip;
        }
        parts.push(d);
      }
    }
    const merged = Mesh.MergeMeshes(parts, true, true)!;
    merged.name = name;
    return place(merged, aluminium, extras.industrial);
  };
  const TRUSS_Z = -1.84;
  const TOWER_H = 3.95;
  for (const x of [-2.84, 2.84]) {
    trussMesh("truss-tower", TOWER_H).position.set(x, 0, TRUSS_Z);
    box("truss-plate", 0.5, 0.012, 0.5, x, 0, TRUSS_Z, darkSteel, extras.industrial);
  }
  const beamTruss = trussMesh("truss-beam", 5.68 + TRUSS);
  beamTruss.rotation.z = -Math.PI / 2;
  beamTruss.position.set(-2.84 - TRUSS / 2, TOWER_H + TRUSS / 2, TRUSS_Z);
  for (const [x, target] of [
    [-1.85, new Vector3(-1.85, FLOOR + 1, -1.05)],
    [0.45, STAND.add(new Vector3(0, 0.8, 0))],
    [1.7, new Vector3(1.6, FLOOR + 1.3, 1.2)],
  ] as const) {
    fixture(extras.industrial, new Vector3(x, TOWER_H - 0.16, TRUSS_Z), target, trussLens, 1.1);
  }
  // Steel posts between the wall panels and a kicker along the base.
  for (const x of [-0.99, 0.99, -2.97]) box("post", 0.06, WALL_H, 0.04, x, FLOOR, BACK_Z - 0.02, darkSteel, extras.industrial);
  box("kicker", 5.9, 0.1, 0.03, 0, FLOOR, BACK_Z - 0.015, brushedSteel, extras.industrial, { cast: false });

  // ------------------------------------------------------------------ hotspots
  const world = (node: TransformNode, local: Vector3) => {
    // Nothing has rendered yet: compute the parent chain top-down.
    const chain: TransformNode[] = [];
    for (let n: TransformNode | null = node; n; n = n.parent as TransformNode | null) chain.unshift(n);
    for (const n of chain) n.computeWorldMatrix(true);
    return Vector3.TransformCoordinates(local, node.getWorldMatrix());
  };
  const spots: Record<Exclude<SpotId, "exhibit">, SpotFrame> = {
    screen: { at: SCREEN.clone(), radius: 3.2, alpha: FRONT - 0.12, beta: 1.47 },
    tablet: { at: world(head, new Vector3(0, 0.11, 0)), radius: 0.95, alpha: FRONT + 0.12, beta: 1.14 },
    laptop: { at: world(lid, new Vector3(0, 0.1, 0)), radius: 1.05, alpha: FRONT - 0.42, beta: 1.2 },
    brochures: { at: RACK.add(new Vector3(0, 0.9, 0)), radius: 1.75, alpha: FRONT - 0.9, beta: 1.3 },
    contact: { at: world(deskSign, new Vector3(0, 0.08, 0)), radius: 1.0, alpha: FRONT - 0.22, beta: 1.26 },
  };

  return {
    root,
    stand,
    plinths,
    extras,
    counterBody,
    casters,
    receivers,
    rimLit,
    washLit,
    leds,
    spills,
    spots,
    lockup,
    productLightAt,
    /** The tablet screen's corners (TL, TR, BR, BL), for laying the live app over it. */
    tabletCorners: [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ].map(([sx, sy]) => world(head, new Vector3((sx * TABLET.screenW) / 2, TABLET.y + (sy * TABLET.screenH) / 2, -0.0008))),
    productAim,
    materials: {
      hallFloor,
      hallLight,
      carpet,
      inlay,
      wallPanel,
      panel,
      backer,
      counterTop,
      plinth,
      gap,
      turntable,
      accent,
      armLenses,
      trussLens,
      drumLens,
      fabric,
      screen,
      tabletScreen,
      laptopScreen,
      lightbox,
      brochures,
      desk,
      sign,
      spill,
      pool,
      darkSteel,
    },
  };
}
