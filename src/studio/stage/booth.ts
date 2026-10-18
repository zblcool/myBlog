/**
 * The exhibition booth: a 6 × 4 m inline stand in a dark hall. Back wall with a lit fascia,
 * a side wall with a lightbox, a wall screen, reception counter, tablet kiosk and the display
 * plinth that carries the exhibit. Two styles share the shell: Minimal (fascia arm lights,
 * round plinth) and Industrial (aluminium truss portal, steel posts, steel deck plinth).
 *
 * Built from primitives with PBR materials; scene.ts owns lights, camera and looks.
 */
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Constants } from "@babylonjs/core/Engines/constants";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { CreateTorus } from "@babylonjs/core/Meshes/Builders/torusBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { BoothStyleId } from "./presets";
import { boothMedia } from "./presets";
import { carpetTexture, concreteTexture, lockupTexture, radialTexture, washTexture } from "./textures";

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
  const imageScreen = (name: string, file: string, gloss: number, crop?: { u: number; v: number }) => {
    const texture = new Texture(url(file), scene, false, true);
    if (crop) {
      texture.uScale = crop.u;
      texture.uOffset = (1 - crop.u) / 2;
      texture.vScale = crop.v;
      texture.vOffset = (1 - crop.v) / 2;
    }
    return pbr(name, (m) => {
      m.albedoColor = Color3.Black();
      m.emissiveTexture = texture;
      m.emissiveColor = Color3.White();
      m.roughness = gloss;
      m.environmentIntensity = 0.6;
    });
  };

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
  const plinth = pbr("plinth", (m) => (m.environmentIntensity = 0.25));
  const gap = pbr("gap", (m) => (m.roughness = 0.85));
  const turntable = pbr("turntable", (m) => (m.roughness = 0.62));
  const accent = emissive("accent");
  const lens = emissive("lens");
  const screen = imageScreen("screen", boothMedia.screen, 0.12);
  // The lightbox is portrait; the render is 16:10. Crop its middle.
  const lightbox = imageScreen("lightbox", boothMedia.lightbox, 0.85, { u: 1.18 / 2.02 / 1.6, v: 1 });
  const kioskScreen = imageScreen("kiosk-screen", boothMedia.kiosk, 0.1);

  const lockup = lockupTexture("lockup", 1024, 180, scene);
  const sign = pbr("sign", (m) => {
    m.albedoTexture = lockup.texture;
    m.useAlphaFromAlbedoTexture = true;
    m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
    m.emissiveTexture = lockup.texture;
    m.metallic = 0.4;
    m.roughness = 0.4;
  });

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
    m.alphaMode = Constants.ALPHA_ADD;
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
    m.alphaMode = Constants.ALPHA_ADD;
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

  // ------------------------------------------------------------------ helpers
  const casters: AbstractMesh[] = [];
  const receivers: AbstractMesh[] = [];
  /** Lit by the rim light: edges worth catching (metal, the exhibit). */
  const rimLit: AbstractMesh[] = [];
  /** Lit by the booth wash: walls and fascia. */
  const washLit: AbstractMesh[] = [];
  const root = new TransformNode("booth", scene);

  const place = (mesh: Mesh, material: PBRMaterial, parent: TransformNode, opts: { cast?: boolean; receive?: boolean } = {}) => {
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
  const plane = (name: string, w: number, h: number, material: PBRMaterial, parent = root) => {
    const mesh = CreatePlane(name, { width: w, height: h }, scene);
    mesh.material = material;
    mesh.parent = parent;
    mesh.isPickable = false;
    return mesh;
  };
  const glow = { cast: false, receive: false };

  // ------------------------------------------------------------------ hall
  const hall = place(CreateGround("hall-floor", { width: 80, height: 80 }, scene), hallFloor, root, { cast: false });
  hall.position.z = 10;

  const floorPool = plane("hall-pool", 22, 22, pool);
  floorPool.rotation.x = Math.PI / 2;
  floorPool.position.set(0.3, 0.003, -0.5);

  // Far-off hall lights, lost in the haze: depth, not decoration.
  const hallLight = emissive("hall-light");
  for (const [x, y, z, w] of [
    [-16, 7.5, 24, 7],
    [-4, 8, 30, 9],
    [9, 7.2, 26, 6],
    [22, 7.8, 32, 8],
  ]) {
    const strip = plane("hall-light", w, 0.35, hallLight);
    strip.position.set(x, y, z);
  }

  // ------------------------------------------------------------------ floor
  box("platform", 6, FLOOR, 4, 0, 0, 0, carpet, root, { cast: false });
  box("trim-front", 6.04, FLOOR + 0.004, 0.02, 0, 0, -2.01, aluminium, root, { cast: false });
  box("trim-left", 0.02, FLOOR + 0.004, 4.04, -3.01, 0, 0, aluminium, root, { cast: false });
  box("trim-right", 0.02, FLOOR + 0.004, 1.42, 3.01, 0, -1.31, aluminium, root, { cast: false });
  box("edge-led", 5.96, 0.008, 0.01, 0, 0.004, -2.026, accent, root, glow);

  // ------------------------------------------------------------------ walls
  const BACK_Z = 1.88; // front face of the back wall
  box("backer", 6, WALL_H, 0.02, 0, FLOOR, 1.99, backer, root, { cast: false });
  for (const x of [-2, 0, 2]) washLit.push(box("wall-panel", 1.985, WALL_H, 0.1, x, FLOOR, BACK_Z + 0.05, wallPanel));
  const sideWall = box("side-wall", 0.12, WALL_H, 2.48, 2.94, FLOOR, 0.64, wallPanel);
  washLit.push(sideWall);
  box("side-wall-edge", 0.124, WALL_H, 0.016, 2.94, FLOOR, -0.608, aluminium, root, { cast: false });

  // Fascia: an L-shaped lit header over both walls.
  const fasciaY = FLOOR + WALL_H;
  washLit.push(box("fascia", 6, FASCIA_H, 0.3, 0, fasciaY, 1.85, panel, root, { cast: false }));
  washLit.push(box("fascia-side", 0.3, FASCIA_H, 2.2, 2.85, fasciaY, 0.55, panel, root, { cast: false }));
  box("fascia-led", 5.7, 0.01, 0.016, 0, fasciaY - 0.012, 1.71, accent, root, glow);
  const fasciaSign = plane("fascia-sign", 2.4, 2.4 * (180 / 1024), sign);
  fasciaSign.position.set(-0.2, fasciaY + FASCIA_H / 2, 1.696);

  // Wall screen running the explainer, left of the exhibit so it stays in view.
  box("bezel", 2.08, 1.32, 0.05, -1.32, FLOOR + 0.9, BACK_Z - 0.025, blackGloss, root, { cast: false });
  const screenPlane = plane("screen", 2.0, 1.25, screen);
  screenPlane.position.set(-1.32, FLOOR + 1.56, BACK_Z - 0.052);

  // Lightbox on the side wall, facing into the booth.
  box("lightbox-frame", 0.04, 2.1, 1.26, 2.86, FLOOR + 0.3, 0.72, aluminium, root, { cast: false });
  const lightboxPlane = plane("lightbox", 1.18, 2.02, lightbox);
  lightboxPlane.rotation.y = Math.PI / 2;
  lightboxPlane.position.set(2.838, FLOOR + 1.35, 0.72);

  // ------------------------------------------------------------------ counter
  const counter = new TransformNode("counter", scene);
  counter.parent = root;
  counter.position.set(-1.85, FLOOR, -1.05);
  box("counter-kick", 1.4, 0.06, 0.46, 0, 0, 0, gap, counter, { cast: false });
  const counterBody = box("counter-body", 1.5, 0.96, 0.56, 0, 0.06, 0, panel, counter);
  box("counter-top", 1.6, 0.04, 0.64, 0, 1.02, 0, counterTop, counter);
  box("counter-led", 1.38, 0.008, 0.01, 0, 0.002, -0.236, accent, counter, glow);
  const counterSign = plane("counter-sign", 0.9, 0.9 * (180 / 1024), sign, counter);
  counterSign.position.set(0, 0.66, -0.2815);
  const counterShadow = plane("counter-contact", 2.0, 1.0, contact, counter);
  counterShadow.rotation.x = Math.PI / 2;
  counterShadow.position.y = 0.002;

  // ------------------------------------------------------------------ kiosk
  const kiosk = new TransformNode("kiosk", scene);
  kiosk.parent = root;
  kiosk.position.set(2.05, FLOOR, -1.3);
  cylinder("kiosk-base", 0.36, 0.012, 0, 0, 0, darkSteel, kiosk, 48);
  cylinder("kiosk-pole", 0.045, 1.0, 0, 0.012, 0, aluminium, kiosk, 16);
  const head = new TransformNode("kiosk-head", scene);
  head.parent = kiosk;
  head.position.y = 1.04;
  head.rotation.x = 0.55;
  box("tablet", 0.34, 0.24, 0.014, 0, -0.12, 0, blackGloss, head);
  const tabletScreen = plane("kiosk-screen", 0.31, 0.2, kioskScreen, head);
  tabletScreen.position.z = -0.0075;
  const kioskShadow = plane("kiosk-contact", 0.7, 0.7, contact, kiosk);
  kioskShadow.rotation.x = Math.PI / 2;
  kioskShadow.position.y = 0.002;

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
    const trim = place(CreateTorus("trim", { diameter: 2.6, thickness: 0.012, tessellation: 128 }, scene), aluminium, p, glow);
    trim.position.y = 0.2;
    const underglow = place(CreateTorus("underglow", { diameter: 2.36, thickness: 0.012, tessellation: 128 }, scene), accent, p, glow);
    underglow.position.y = 0.045;
    const ring = plane("spill", 4.4, 4.4, spill, p);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.003;
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
    const ring = place(CreateTorus("turntable-ring", { diameter: 1.92, thickness: 0.012, tessellation: 96 }, scene), aluminium, p, glow);
    ring.position.y = 0.26;
  }

  // ------------------------------------------------------------------ style extras
  const extras: Record<BoothStyleId, TransformNode> = {
    minimal: new TransformNode("extras-minimal", scene),
    industrial: new TransformNode("extras-industrial", scene),
  };
  for (const node of Object.values(extras)) node.parent = root;

  /** A spot fixture: housing + lit lens, its axis pointing from `at` to `aim`. */
  const fixture = (parent: TransformNode, at: Vector3, aim: Vector3, size = 1) => {
    const node = new TransformNode("fixture", scene);
    node.parent = parent;
    node.position.copyFrom(at);
    node.rotationQuaternion = new Quaternion();
    Quaternion.FromUnitVectorsToRef(new Vector3(0, -1, 0), aim.subtract(at).normalize(), node.rotationQuaternion);
    cylinder("fixture-body", 0.11 * size, 0.2 * size, 0, 0, 0, blackGloss, node, 24, glow).position.y = 0;
    const lensDisc = cylinder("fixture-lens", 0.085 * size, 0.004, 0, -0.102 * size, 0, lens, node, 24, glow);
    lensDisc.position.y = -0.1 * size;
    return node;
  };

  // Minimal: arm lights off the fascia, washing the back wall.
  for (const x of [-2.25, -0.4, 1.45]) {
    const arm = cylinder("arm", 0.018, 0.5, x, 0, 0, blackGloss, extras.minimal, 12, glow);
    arm.rotation.x = Math.PI / 2 - 0.35;
    arm.position.set(x, fasciaY + 0.04, 1.47);
    fixture(extras.minimal, new Vector3(x, fasciaY - 0.04, 1.22), new Vector3(x, FLOOR + 1.2, BACK_Z), 0.8);
  }

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
    const tower = trussMesh("truss-tower", TOWER_H);
    tower.position.set(x, 0, TRUSS_Z);
    box("truss-plate", 0.5, 0.012, 0.5, x, 0, TRUSS_Z, darkSteel, extras.industrial);
  }
  const beam = trussMesh("truss-beam", 5.68 + TRUSS);
  beam.rotation.z = -Math.PI / 2;
  beam.position.set(-2.84 - TRUSS / 2, TOWER_H + TRUSS / 2, TRUSS_Z);
  for (const [x, target] of [
    [-1.85, new Vector3(-1.85, FLOOR + 1, -1.05)],
    [0.45, STAND.add(new Vector3(0, 0.8, 0))],
    [1.7, new Vector3(1.6, FLOOR + 1.3, 1.2)],
  ] as const) {
    fixture(extras.industrial, new Vector3(x, TOWER_H - 0.16, TRUSS_Z), target, 1.1);
  }
  // Steel posts between the wall panels and a kicker along the base.
  for (const x of [-0.99, 0.99, -2.97]) box("post", 0.06, WALL_H, 0.04, x, FLOOR, BACK_Z - 0.02, darkSteel, extras.industrial);
  box("kicker", 5.9, 0.1, 0.03, 0, FLOOR, BACK_Z - 0.015, brushedSteel, extras.industrial, { cast: false });

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
    lockup,
    materials: {
      hallFloor,
      hallLight,
      carpet,
      wallPanel,
      panel,
      backer,
      counterTop,
      plinth,
      gap,
      turntable,
      accent,
      lens,
      screen,
      lightbox,
      kioskScreen,
      sign,
      spill,
      pool,
      darkSteel,
    },
  };
}
