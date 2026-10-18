/**
 * Hero exhibition booth: the Babylon.js scene behind the homepage headline. The booth itself
 * is built in booth.ts; this file owns the engine, hall, lights, looks, exhibits and the
 * camera rig that follows page scroll (wide booth shot → close-up of the exhibit) and the
 * pointer (a little parallax).
 *
 * Rendering is on demand: a frame is drawn only while the camera is settling, a transition
 * runs or something just changed, so an idle hero costs nothing.
 */
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/core/Shaders/rgbdDecode.fragment";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/loaders/glTF/2.0";
import { MeshoptCompression } from "@babylonjs/core/Meshes/Compression/meshoptCompression";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import { Logger } from "@babylonjs/core/Misc/logger";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { buildBooth, lin, plinthTops, STAND } from "./booth";
import { equipmentModels, type BoothStyleId, type EquipmentId, type LightingId, type StageConfig, type ThemeId } from "./presets";

export interface StageOptions {
  /** Site base path ("/" or "/repo/"), prefixed to asset URLs. */
  base: string;
  reducedMotion: boolean;
  /** Small or touch-first screen: lower resolution and cheaper shadows. */
  lite: boolean;
  onLoading?(loading: boolean): void;
  /** Plain wheel over the canvas: the page scrolls, and the UI can say how to zoom. */
  onWheelHint?(): void;
  onContextLost?(lost: boolean): void;
}

export interface StageController {
  apply(config: Partial<StageConfig>): void;
  /** Camera intro after the canvas is revealed. */
  start(): void;
  /** 0 = wide booth shot, 1 = close-up of the exhibit (driven by page scroll). */
  setProgress(progress: number): void;
  /** Pointer position over the hero, -1…1 on each axis, for parallax. */
  setPointer(x: number, y: number): void;
  resetCamera(): void;
  zoom(direction: 1 | -1): void;
  setActive(active: boolean): void;
  dispose(): void;
}

// ---------------------------------------------------------------------------- looks

interface ThemeLook {
  hall: string;
  hallFloor: string;
  carpet: string;
  wallPanel: string;
  panel: string;
  backer: string;
  counterTop: string;
  plinth: string;
  plinthRoughness: number;
  gap: string;
  turntable: string;
  exposure: number;
  environment: number;
  /** Fascia LED wash down the wall panels. */
  wash: number;
  washLight: number;
  fill: number;
  fillGround: string;
  vignette: string;
  vignetteWeight: number;
  sign: "onDark" | "onLight";
  signGlow: number;
  screenGlow: number;
  hallLights: number;
  /** Light pool on the hall floor around the stand. */
  pool: number;
}

const themes: Record<ThemeId, ThemeLook> = {
  graphite: {
    hall: "#0b0e12",
    hallFloor: "#2c323a",
    carpet: "#2b3037",
    wallPanel: "#323941",
    panel: "#1d2228",
    backer: "#06080a",
    counterTop: "#e2e3e4",
    plinth: "#575e66",
    plinthRoughness: 0.55,
    gap: "#07090b",
    turntable: "#1b1f24",
    exposure: 1.05,
    environment: 0.5,
    wash: 0.1,
    washLight: 1,
    fill: 0.16,
    fillGround: "#050507",
    vignette: "#05070a",
    vignetteWeight: 2.1,
    sign: "onDark",
    signGlow: 0.65,
    screenGlow: 1,
    hallLights: 1.6,
    pool: 0.07,
  },
  gallery: {
    hall: "#d8d5cf",
    hallFloor: "#bbb7b0",
    carpet: "#80868d",
    wallPanel: "#ecebe7",
    panel: "#f5f4f1",
    backer: "#8f8c87",
    counterTop: "#2a2f35",
    plinth: "#efeeeb",
    plinthRoughness: 0.46,
    gap: "#3a3d40",
    turntable: "#2a2e33",
    exposure: 1.05,
    environment: 0.75,
    wash: 0.05,
    washLight: 0.55,
    fill: 0.5,
    fillGround: "#b8b4ae",
    vignette: "#5d5a55",
    vignetteWeight: 1.3,
    sign: "onLight",
    signGlow: 0.06,
    screenGlow: 0.85,
    hallLights: 0.25,
    pool: 0.03,
  },
};

interface LightLook {
  key: string;
  rim: string;
  rimIntensity: number;
  accent: string;
  accentIntensity: number;
}

const lightings: Record<LightingId, LightLook> = {
  amber: { key: "#fff1e0", rim: "#ffb35c", rimIntensity: 1, accent: "#f2a250", accentIntensity: 1 },
  neutral: { key: "#f2f6ff", rim: "#d6e4ff", rimIntensity: 0.9, accent: "#e4edf7", accentIntensity: 0.8 },
};

// Physical-ish light units (PBR falloff).
const KEY_POWER = 650;
const WASH_POWER = 850;
const RIM_POWER = 2.6;
const PRODUCT_POWER = 80;
const ACCENT_POWER = 2.4;

// ---------------------------------------------------------------------------- camera shots

const REST_ALPHA = -Math.PI / 2 - 0.52;
const REST_BETA = 1.3;
const FOV = 0.62;
/** The whole booth, framed to leave the headline room (wide screens: booth right). */
const OVERVIEW_TARGET = new Vector3(0.2, 1.45, 0.2);

// ---------------------------------------------------------------------------- easing

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

interface Tween {
  start: number;
  duration: number;
  ease: (t: number) => number;
  update: (t: number) => void;
  done?: () => void;
}

// ---------------------------------------------------------------------------- stage

export async function createStage(canvas: HTMLCanvasElement, initial: StageConfig, options: StageOptions): Promise<StageController> {
  const { base, reducedMotion, lite } = options;
  const url = (path: string) => `${base.replace(/\/$/, "")}${path}`;
  MeshoptCompression.Configuration = { decoder: { url: url("/studio/stage/meshopt_decoder.js") } };
  Logger.LogLevels = Logger.WarningLogLevel | Logger.ErrorLogLevel; // no version banner on the public site

  const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false, powerPreference: "high-performance" }, false);
  // Full-bleed canvas: cap the pixel ratio, the hero is big.
  engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.5));

  const scene = new Scene(engine);
  scene.skipPointerMovePicking = true;
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogStart = 17;
  scene.fogEnd = 40;

  let config = { ...initial };
  let theme = themes[config.theme];
  let lighting = lightings[config.lighting];

  // --- render on demand -----------------------------------------------------
  const tweens = new Map<string, Tween>();
  let pendingFrames = 0;
  let waitingForReady = true;
  let active = true;
  let disposed = false;
  // A change can need shaders or textures that are not ready yet; Babylon skips those meshes,
  // so keep drawing until the scene reports ready, then a couple more frames.
  const invalidate = (frames = 2) => {
    pendingFrames = Math.max(pendingFrames, frames);
    waitingForReady = true;
  };

  const tween = (tag: string, duration: number, update: (t: number) => void, ease = easeInOut, done?: () => void) => {
    tweens.delete(tag);
    if (reducedMotion || duration <= 0) {
      update(1);
      done?.();
      invalidate();
      return;
    }
    tweens.set(tag, { start: performance.now(), duration, ease, update, done });
  };

  // --- booth & lights -----------------------------------------------------------
  const booth = buildBooth(scene, url);
  const m = booth.materials;

  // A far hall wall inside the fog, so the sky never shows and the vignette stays even.
  const hallWall = CreateCylinder("hall-wall", { diameter: 90, height: 40, tessellation: 48, cap: Mesh.NO_CAP, sideOrientation: Mesh.BACKSIDE }, scene);
  hallWall.position.set(0, 19, 10);
  const hallWallMat = new PBRMaterial("hall-wall", scene);
  hallWallMat.roughness = 1;
  hallWallMat.metallic = 0;
  hallWall.material = hallWallMat;
  hallWall.isPickable = false;

  const environment = CubeTexture.CreateFromPrefilteredData(url("/studio/stage/studio.env"), scene);
  environment.rotationY = 2.2;
  scene.environmentTexture = environment;

  const keyLight = new SpotLight("key", new Vector3(-5.6, 7.8, -6.8), Vector3.Zero(), 0.95, 2, scene);
  keyLight.setDirectionToTarget(new Vector3(0.3, 0.7, 0.3));
  keyLight.innerAngle = 0.45;
  keyLight.shadowMinZ = 3;
  keyLight.shadowMaxZ = 24;

  const washLight = new SpotLight("wash", new Vector3(0.3, 6.4, -3.4), Vector3.Zero(), 1.25, 1.5, scene);
  washLight.setDirectionToTarget(new Vector3(0.3, 1.4, 1.9));
  washLight.includedOnlyMeshes.push(...booth.washLit);

  const rimLight = new DirectionalLight("rim", new Vector3(-0.5, -0.45, -0.74), scene);
  // The rim light is for edges (exhibit, metal); on flat surfaces it reads as a coloured sheen.
  const rimLit = rimLight.includedOnlyMeshes;
  rimLit.push(...booth.rimLit);

  const fill = new HemisphericLight("fill", new Vector3(0, 1, 0), scene);

  // Product spot: a tight pool on the exhibit and its plinth, so the eye lands there first.
  const productLight = new SpotLight("product", STAND.add(new Vector3(-0.9, 4.4, -1.9)), Vector3.Zero(), 0.62, 2, scene);
  productLight.setDirectionToTarget(STAND.add(new Vector3(0, 0.5, 0)));
  productLight.innerAngle = 0.25;
  const productLit = productLight.includedOnlyMeshes;
  for (const plinth of Object.values(booth.plinths)) productLit.push(...plinth.getChildMeshes());

  const shadows = new ShadowGenerator(lite ? 1024 : 2048, keyLight);
  if (engine.webGLVersion >= 2) shadows.usePercentageCloserFiltering = true;
  else shadows.useBlurExponentialShadowMap = true;
  shadows.filteringQuality = lite ? ShadowGenerator.QUALITY_MEDIUM : ShadowGenerator.QUALITY_HIGH;
  shadows.bias = 0.0006;
  shadows.normalBias = 0.015;
  shadows.darkness = 0.2;
  for (const mesh of booth.casters) shadows.addShadowCaster(mesh, false);
  // Nothing moves on its own: draw the shadow map once, again only when the booth changes.
  const shadowMap = shadows.getShadowMap()!;
  shadowMap.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
  const refreshShadows = () => shadowMap.resetRefreshCounter();

  const ip = scene.imageProcessingConfiguration;
  ip.toneMappingEnabled = true;
  ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL;
  ip.contrast = 1.12;
  ip.vignetteEnabled = true;
  ip.vignetteStretch = 0.5;
  ip.vignetteCameraFov = FOV;
  ip.vignetteBlendMode = ImageProcessingConfiguration.VIGNETTEMODE_MULTIPLY;

  // --- camera -------------------------------------------------------------------
  const camera = new ArcRotateCamera("camera", REST_ALPHA, REST_BETA, 14, OVERVIEW_TARGET.clone(), scene);
  camera.fov = FOV;
  camera.minZ = 0.1;
  camera.maxZ = 120;
  camera.lowerBetaLimit = 0.98;
  camera.upperBetaLimit = 1.48;
  camera.lowerAlphaLimit = -Math.PI / 2 - 1.0;
  camera.upperAlphaLimit = -Math.PI / 2 + 0.42;
  camera.panningSensibility = 0;
  camera.pinchPrecision = 1e9; // radius follows the scroll; zoom is the buttons / Ctrl + wheel
  camera.angularSensibilityX = 1600;
  camera.angularSensibilityY = 1600;
  camera.inertia = reducedMotion ? 0.6 : 0.9;
  camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
  camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
  camera.attachControl(true); // noPreventDefault: vertical swipes still scroll the page

  /** What the rig is heading for; the camera eases towards it every frame. */
  const rig = {
    progress: 0,
    smoothProgress: 0,
    zoom: 1,
    introZoom: 1,
    pointer: new Vector2(0, 0),
    smoothPointer: new Vector2(0, 0),
    productTarget: STAND.add(new Vector3(0, 0.8, 0)),
    productSpan: 0.9,
  };
  const desiredTarget = new Vector3();

  const updateRig = (dt: number) => {
    const aspect = engine.getAspectRatio(camera);
    const tanV = Math.tan(FOV / 2);
    const tanH = tanV * aspect;
    const wide = aspect >= 1.05;
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 6);

    rig.smoothProgress = lerp(rig.smoothProgress, rig.progress, reducedMotion ? 1 : 1 - Math.exp(-dt * 8));
    Vector2.LerpToRef(rig.smoothPointer, rig.pointer, reducedMotion ? 0 : 1 - Math.exp(-dt * 4), rig.smoothPointer);
    const e = smooth(clamp01(rig.smoothProgress));

    // Overview distance: fit the booth (wide: in the right ~60%; tall: full width, lower half).
    const needW = wide ? 13.2 : 7.4;
    const needH = 5.4;
    const overview = Math.max(needW / 2 / tanH, needH / 2 / tanV);
    const product = Math.max(rig.productSpan / Math.min(tanV, tanH), 2.2) * (wide ? 1.55 : 1.35);
    Vector3.LerpToRef(OVERVIEW_TARGET, rig.productTarget, e, desiredTarget);
    const radius = Math.exp(lerp(Math.log(overview), Math.log(product), e)) * rig.zoom * rig.introZoom;

    // Screen offset as a fraction of the frame, converted to view-space units at the target.
    const fx = wide ? lerp(0.215, 0.2, e) : 0;
    // Tall screens: booth below the headline, then the exhibit above the exhibit card.
    const fy = wide ? lerp(0, -0.02, e) : lerp(-0.2, 0.21, e);
    const ox = (fx + rig.smoothPointer.x * 0.012) * 2 * radius * tanH;
    const oy = (fy - rig.smoothPointer.y * 0.01) * 2 * radius * tanV;

    const t = camera.target;
    const o = camera.targetScreenOffset;
    const before = camera.radius + t.x + t.y + t.z + o.x + o.y;
    Vector3.LerpToRef(t, desiredTarget, k, t);
    camera.radius = lerp(camera.radius, radius, k);
    o.x = lerp(o.x, ox, k);
    o.y = lerp(o.y, oy, k);
    return Math.abs(camera.radius + t.x + t.y + t.z + o.x + o.y - before) > 1e-4;
  };

  const cameraMoving = () => camera.inertialAlphaOffset !== 0 || camera.inertialBetaOffset !== 0;

  const orbitTo = (alpha: number, beta: number, duration: number, ease = easeInOut) => {
    const from = { alpha: camera.alpha, beta: camera.beta };
    tween(
      "orbit",
      duration,
      (t) => {
        camera.alpha = lerp(from.alpha, alpha, t);
        camera.beta = lerp(from.beta, beta, t);
      },
      ease,
    );
  };
  // A drag takes over from any scripted orbit.
  const stopOrbit = () => tweens.delete("orbit");
  canvas.addEventListener("pointerdown", stopOrbit);

  // --- plinths & style -----------------------------------------------------------
  const plinthScale: Record<BoothStyleId, number> = { minimal: 0, industrial: 0 };
  const pivot = new TransformNode("pivot", scene);
  pivot.parent = booth.stand;

  const applyPlinthScale = () => {
    let top = 0;
    for (const id of Object.keys(booth.plinths) as BoothStyleId[]) {
      const s = plinthScale[id];
      booth.plinths[id].scaling.y = Math.max(s, 0.0001);
      booth.plinths[id].setEnabled(s > 0.001);
      top = Math.max(top, plinthTops[id] * s);
    }
    pivot.position.y = top;
    refreshShadows();
  };

  const setExtrasVisibility = (id: BoothStyleId, v: number) => {
    booth.extras[id].setEnabled(v > 0.001);
    for (const mesh of booth.extras[id].getChildMeshes()) mesh.visibility = v;
    refreshShadows();
  };

  // --- exhibits -------------------------------------------------------------------
  const contact = CreatePlane("contact", { size: 1 }, scene);
  contact.rotation.x = Math.PI / 2;
  contact.position.y = 0.002;
  contact.parent = pivot;
  contact.material = scene.getMaterialByName("contact");
  contact.isPickable = false;

  interface Mounted {
    node: TransformNode;
    meshes: AbstractMesh[];
    height: number;
    radius: number;
    footprint: { x: number; z: number };
  }
  const mounted = new Map<EquipmentId, Promise<Mounted>>();
  let shown: Mounted | null = null;
  let switchToken = 0;

  const updateProductFrame = () => {
    if (!shown) return;
    const top = plinthTops[config.style];
    rig.productTarget = STAND.add(new Vector3(0, top + shown.height * 0.48, 0));
    rig.productSpan = Math.max(shown.radius, 0.75);
    invalidate();
  };

  const showStyle = (id: BoothStyleId, animate: boolean) => {
    const other: BoothStyleId = id === "minimal" ? "industrial" : "minimal";
    const counterMaterial = id === "industrial" ? m.darkSteel : m.panel;
    updateProductFrame();
    if (!animate) {
      plinthScale[other] = 0;
      plinthScale[id] = 1;
      applyPlinthScale();
      setExtrasVisibility(other, 0);
      setExtrasVisibility(id, 1);
      booth.counterBody.material = counterMaterial;
      invalidate();
      return;
    }
    const from = { ...plinthScale };
    // Lower the old plinth while its fittings fade, then raise the new one: a stage lift.
    tween(
      "style",
      380,
      (t) => {
        plinthScale[other] = from[other] * (1 - t);
        applyPlinthScale();
        setExtrasVisibility(other, 1 - t);
      },
      easeIn,
      () => {
        booth.counterBody.material = counterMaterial;
        const start = plinthScale[id];
        tween(
          "style",
          560,
          (t) => {
            plinthScale[id] = lerp(start, 1, t);
            applyPlinthScale();
            setExtrasVisibility(id, t);
          },
          easeOut,
          () => setExtrasVisibility(id, 1),
        );
      },
    );
  };

  const mount = (id: EquipmentId) => {
    let pending = mounted.get(id);
    if (pending) return pending;
    const model = equipmentModels[id];
    pending = LoadAssetContainerAsync(url(model.file), scene).then((container) => {
      container.addAllToScene();
      const node = new TransformNode(`equipment-${id}`, scene);
      node.rotation.y = model.yaw;
      const root = container.meshes[0];
      root.parent = node;
      const meshes = container.meshes.filter((mesh) => mesh.getTotalVertices() > 0);
      node.computeWorldMatrix(true);
      const { min, max } = root.getHierarchyBoundingVectors(true);
      const ext = max.subtract(min);
      const s = model.size / Math.max(ext.x, ext.y, ext.z);
      node.scaling.setAll(s);
      node.position.set(-((min.x + max.x) / 2) * s, -min.y * s, -((min.z + max.z) / 2) * s);
      node.parent = pivot;
      node.setEnabled(false);
      for (const material of container.materials) {
        const paint = model.finish?.[material.name];
        if (paint && material instanceof PBRMaterial) {
          material.albedoColor = lin(paint.color);
          material.metallic = paint.metallic;
          material.roughness = paint.roughness;
        }
      }
      for (const mesh of meshes) {
        mesh.isPickable = false;
        mesh.receiveShadows = true;
        shadows.addShadowCaster(mesh, false);
        rimLit.push(mesh);
        productLit.push(mesh);
      }
      return { node, meshes, height: ext.y * s, radius: (ext.length() * s) / 2, footprint: { x: ext.x * s, z: ext.z * s } };
    });
    mounted.set(id, pending);
    pending.catch(() => mounted.delete(id));
    return pending;
  };

  const setVisibility = (exhibit: Mounted, v: number) => {
    for (const mesh of exhibit.meshes) mesh.visibility = v;
  };

  const showEquipment = async (id: EquipmentId, animate: boolean) => {
    const token = ++switchToken;
    const outgoing = shown;
    options.onLoading?.(true);
    if (outgoing && animate) {
      await new Promise<void>((resolve) => tween("equipment", 260, (t) => setVisibility(outgoing, 1 - t), easeIn, resolve));
    }
    let next: Mounted;
    try {
      next = await mount(id);
    } finally {
      if (token === switchToken) options.onLoading?.(false);
    }
    if (token !== switchToken || disposed) return;

    if (outgoing && outgoing !== next) outgoing.node.setEnabled(false);
    shown = next;
    next.node.setEnabled(true);
    contact.scaling.set(next.footprint.x * 1.4, next.footprint.z * 1.4, 1);
    refreshShadows();
    updateProductFrame();
    if (animate) {
      const rest = next.node.position.y;
      tween(
        "equipment",
        520,
        (t) => {
          setVisibility(next, t);
          next.node.position.y = rest + (1 - t) * 0.06;
          refreshShadows();
        },
        easeOut,
        () => setVisibility(next, 1),
      );
    } else {
      setVisibility(next, 1);
    }
    invalidate();
  };

  // --- looks ---------------------------------------------------------------------
  const applyLook = (animate: boolean) => {
    const tracks: ((t: number) => void)[] = [];
    const color = (c: Color3, to: Color3) => {
      const from = c.clone();
      tracks.push((t) => Color3.LerpToRef(from, to, t, c));
    };
    const num = <T extends object>(obj: T, key: keyof T, to: number) => {
      const from = obj[key] as number;
      tracks.push((t) => ((obj[key] as number) = lerp(from, to, t)));
    };
    const accent = lin(lighting.accent);
    const key = lin(lighting.key);
    const white = Color3.White();

    // The hall: fog is applied before tone mapping, so it wants linear values.
    color(scene.fogColor, lin(theme.hall).scale(1 / theme.exposure));
    color(hallWallMat.albedoColor, lin(theme.hall));
    color(m.hallFloor.albedoColor, lin(theme.hallFloor));
    color(m.hallLight.emissiveColor, key.scale(theme.hallLights));
    color(m.carpet.albedoColor, lin(theme.carpet));
    color(m.wallPanel.albedoColor, lin(theme.wallPanel));
    color(m.wallPanel.emissiveColor, accent.scale(theme.wash * lighting.accentIntensity));
    color(m.panel.albedoColor, lin(theme.panel));
    color(m.backer.albedoColor, lin(theme.backer));
    color(m.counterTop.albedoColor, lin(theme.counterTop));
    color(m.plinth.albedoColor, lin(theme.plinth));
    num(m.plinth, "roughness", theme.plinthRoughness);
    color(m.gap.albedoColor, lin(theme.gap));
    color(m.turntable.albedoColor, lin(theme.turntable));
    color(m.accent.emissiveColor, accent.scale(ACCENT_POWER * lighting.accentIntensity));
    color(m.lens.emissiveColor, key.scale(3));
    color(m.spill.albedoColor, accent.scale(0.12 * lighting.accentIntensity));
    color(m.sign.emissiveColor, white.scale(theme.signGlow));
    for (const screen of [m.screen, m.kioskScreen]) color(screen.emissiveColor, white.scale(theme.screenGlow));
    color(m.lightbox.emissiveColor, white.scale(theme.screenGlow * 0.9));
    color(keyLight.diffuse, key);
    num(keyLight, "intensity", KEY_POWER);
    color(washLight.diffuse, key);
    num(washLight, "intensity", WASH_POWER * theme.washLight);
    color(rimLight.diffuse, lin(lighting.rim));
    num(rimLight, "intensity", RIM_POWER * lighting.rimIntensity);
    color(productLight.diffuse, key);
    num(productLight, "intensity", PRODUCT_POWER);
    color(m.pool.albedoColor, key.scale(theme.pool));
    num(fill, "intensity", theme.fill);
    color(fill.groundColor, lin(theme.fillGround));
    num(scene, "environmentIntensity", theme.environment);
    num(ip, "exposure", theme.exposure);
    num(ip, "vignetteWeight", theme.vignetteWeight);
    const vignette = Color3.FromHexString(theme.vignette);
    const vFrom = new Color3(ip.vignetteColor.r, ip.vignetteColor.g, ip.vignetteColor.b);
    tracks.push((t) => {
      const c = Color3.Lerp(vFrom, vignette, t);
      ip.vignetteColor = new Color4(c.r, c.g, c.b, 0);
    });
    const clearTo = Color3.FromHexString(theme.hall);
    const clearFrom = new Color3(scene.clearColor.r, scene.clearColor.g, scene.clearColor.b);
    tracks.push((t) => {
      const c = Color3.Lerp(clearFrom, clearTo, t);
      scene.clearColor = new Color4(c.r, c.g, c.b, 1);
    });

    let painted = false;
    tween("look", animate ? 750 : 0, (t) => {
      for (const track of tracks) track(t);
      if (!painted && t >= 0.5) {
        painted = true;
        if (booth.lockup.paint(theme.sign)) invalidate();
      }
    });
  };

  // --- loop & lifecycle ---------------------------------------------------------
  let last = performance.now();
  const frame = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    for (const [tag, tw] of tweens) {
      const t = Math.min((now - tw.start) / tw.duration, 1);
      tw.update(tw.ease(t));
      if (t >= 1) {
        if (tweens.get(tag) === tw) tweens.delete(tag);
        tw.done?.();
        invalidate();
      }
    }
    const settling = updateRig(dt);
    if (waitingForReady || settling || tweens.size > 0 || cameraMoving() || pendingFrames > 0) {
      scene.render();
      if (pendingFrames > 0) pendingFrames--;
      if (waitingForReady && scene.isReady()) {
        waitingForReady = false;
        pendingFrames = Math.max(pendingFrames, 2);
      }
    }
  };

  let running = false;
  const updateLoop = () => {
    const shouldRun = active && !document.hidden && !disposed;
    if (shouldRun && !running) {
      last = performance.now();
      engine.runRenderLoop(frame);
      invalidate();
    } else if (!shouldRun && running) {
      engine.stopRenderLoop(frame);
    }
    running = shouldRun;
  };
  document.addEventListener("visibilitychange", updateLoop);

  const resizeObserver = new ResizeObserver(() => {
    engine.resize();
    invalidate();
  });
  resizeObserver.observe(canvas);

  // Plain wheel scrolls the page; Ctrl/⌘ + wheel (and trackpad pinch, which sends ctrlKey) zooms.
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) {
      options.onWheelHint?.();
      return;
    }
    event.preventDefault();
    rig.zoom = Math.min(Math.max(rig.zoom * (event.deltaY > 0 ? 1.06 : 0.94), 0.6), 1.3);
    invalidate();
  };
  canvas.addEventListener("wheel", onWheel, { passive: false });

  engine.onContextLostObservable.add(() => options.onContextLost?.(true));
  engine.onContextRestoredObservable.add(() => {
    options.onContextLost?.(false);
    refreshShadows();
    invalidate(3);
  });

  // --- first build ------------------------------------------------------------------
  await document.fonts?.load("600 48px Montserrat").catch(() => undefined);
  applyLook(false);
  showStyle(config.style, false);
  await showEquipment(config.equipment, false);
  updateRig(1);
  updateLoop();
  await new Promise<void>((resolve) => scene.executeWhenReady(() => resolve()));
  if (disposed) throw new Error("disposed");
  if (import.meta.env.DEV) {
    Object.assign(window, { __stage: { scene, camera, keyLight, washLight, rimLight, fill, shadows, rig, booth, invalidate } });
  }

  return {
    apply(next) {
      const prev = config;
      config = { ...config, ...next };
      theme = themes[config.theme];
      lighting = lightings[config.lighting];
      if (prev.theme !== config.theme || prev.lighting !== config.lighting) applyLook(true);
      if (prev.style !== config.style) showStyle(config.style, true);
      if (prev.equipment !== config.equipment) {
        showEquipment(config.equipment, true).catch(() => options.onLoading?.(false));
      }
      invalidate();
    },
    start() {
      if (reducedMotion) return;
      // Swing in from a wider, higher view: says "this is live 3D" without a gimmick.
      camera.alpha = REST_ALPHA - 0.5;
      camera.beta = 1.08;
      rig.introZoom = 1.25;
      orbitTo(REST_ALPHA, REST_BETA, 2800, easeOut);
      tween("intro-zoom", 2800, (t) => (rig.introZoom = lerp(1.25, 1, t)), easeOut);
    },
    setProgress(progress) {
      const p = clamp01(progress);
      if (Math.abs(p - rig.progress) < 1e-4) return;
      rig.progress = p;
      invalidate();
    },
    setPointer(x, y) {
      rig.pointer.set(x, y);
      invalidate();
    },
    resetCamera() {
      rig.zoom = 1;
      orbitTo(REST_ALPHA, REST_BETA, 900);
    },
    zoom(direction) {
      rig.zoom = Math.min(Math.max(rig.zoom * (direction > 0 ? 0.85 : 1.18), 0.6), 1.3);
      invalidate();
    },
    setActive(value) {
      active = value;
      updateLoop();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      updateLoop();
      document.removeEventListener("visibilitychange", updateLoop);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", stopOrbit);
      resizeObserver.disconnect();
      scene.dispose();
      engine.dispose();
    },
  };
}
