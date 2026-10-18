/**
 * Hero exhibition booth: the Babylon.js scene behind the homepage headline. The booth itself
 * is built in booth.ts and its screens in screens.ts; this file owns the engine, hall, lights,
 * looks and exhibits, the opening sequence (the hall wakes, the fixtures strike one by one,
 * the screens boot), and the camera rig: page scroll (wide booth shot → the exhibit), an idle
 * sway, a pointer orbit, and focus shots when a visitor clicks something on the stand.
 *
 * Rendering is on demand: frames are drawn while something moves, so a hero scrolled out of
 * view costs nothing, and the idle sway alone runs at half rate.
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
import { Matrix, Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { buildBooth, lin, plinthTops, STAND, type SpotFrame, type SpotId } from "./booth";
import { createScreens, type ScreenCopy } from "./screens";
import { equipmentModels, type BoothStyleId, type EquipmentId, type LightingId, type StageConfig, type ThemeId } from "./presets";

export type { SpotId } from "./booth";

export interface SpotPosition {
  id: SpotId;
  x: number;
  y: number;
  visible: boolean;
}

export interface StageOptions {
  /** Site base path ("/" or "/repo/"), prefixed to asset URLs. */
  base: string;
  reducedMotion: boolean;
  /** Small or touch-first screen: lower resolution and cheaper shadows. */
  lite: boolean;
  /** Copy and renders for the booth's screens. */
  copy: ScreenCopy;
  onLoading?(loading: boolean): void;
  /** Plain wheel over the canvas: the page scrolls, and the UI can say how to zoom. */
  onWheelHint?(): void;
  onContextLost?(lost: boolean): void;
  /** Where the clickable things on the stand are on screen (CSS pixels), after each frame. */
  onSpots?(spots: SpotPosition[]): void;
  /** The opening sequence has finished. */
  onIntroDone?(): void;
  /**
   * While the tablet is framed: its screen's corners on screen (TL, TR, BR, BL, CSS pixels),
   * so the page can lay the live app over it; null otherwise.
   */
  onTabletScreen?(corners: { x: number; y: number }[] | null): void;
}

export interface StageController {
  apply(config: Partial<StageConfig>): void;
  /** The opening sequence: lights strike, screens boot, the camera settles. */
  start(): void;
  /** 0 = wide booth shot, 1 = close-up of the exhibit (driven by page scroll). */
  setProgress(progress: number): void;
  /** Pointer position over the hero, -1…1 on each axis (null when it leaves). */
  setPointer(x: number | null, y?: number): void;
  /** Frame something on the stand, or go back to the booth (null). */
  focus(id: SpotId | null): void;
  /** A marker is hovered: its object brightens. */
  hover(id: SpotId | null): void;
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
  inlay: string;
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
    inlay: "#3c434c",
    wallPanel: "#3d4550",
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
    inlay: "#9aa0a7",
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
const PRODUCT_POWER = 60;
const FEATURE_POWER = 2600;
const ACCENT_POWER = 2.4;

// ---------------------------------------------------------------------------- power

/**
 * How far each group of lights is switched on (0–1). Looks set the full-power values; the
 * opening sequence animates these. Standby is "before the show opens": the hall's work lights
 * and a little spill, enough to read the booth. The poster is a render of that state.
 */
interface Power {
  hall: number;
  arms: [number, number, number];
  key: number;
  product: number;
  accent: number;
  /** LED strips drawn along their length. */
  led: number;
  sign: number;
  screens: number;
  flash: number;
}
const standby = (): Power => ({ hall: 0.45, arms: [0, 0, 0], key: 0.3, product: 0, accent: 0, led: 0, sign: 0.22, screens: 0, flash: 0 });
const lit = (): Power => ({ hall: 1, arms: [1, 1, 1], key: 1, product: 1, accent: 1, led: 1, sign: 1, screens: 1, flash: 0 });

/** A lamp striking: on, a dip, on again, settle. */
const strike = (t: number) => (t < 0.12 ? t / 0.12 : t < 0.22 ? 0.25 : t < 0.36 ? 0.95 : t < 0.46 ? 0.55 : 0.55 + 0.45 * Math.min((t - 0.46) / 0.3, 1));

// ---------------------------------------------------------------------------- camera

const REST_ALPHA = -Math.PI / 2 - 0.52;
const REST_BETA = 1.3;
const FOV = 0.62;
/** The whole booth, framed to leave the headline room (wide screens: booth right). */
const OVERVIEW_TARGET = new Vector3(0.2, 1.55, 0.2);
/** Where the opening shot starts: higher, wider, swung round. The poster is this frame. */
// Close to the composed view, so the (lit) poster hands over to the live scene without a jump.
const INTRO = { alpha: REST_ALPHA - 0.16, beta: 1.24, zoom: 1.1 };
const SWAY = { amplitude: 0.17, period: 18, resumeAfter: 2000 };

// ---------------------------------------------------------------------------- easing

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeIn = (t: number) => t * t * t;
const linear = (t: number) => t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const damp = (rate: number, dt: number) => 1 - Math.exp(-dt * rate);

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
  const invalidate = (frames = 2, checkReady = true) => {
    pendingFrames = Math.max(pendingFrames, frames);
    if (checkReady) waitingForReady = true;
  };

  const tween = (tag: string, duration: number, update: (t: number) => void, ease = easeInOut, done?: () => void, delay = 0) => {
    tweens.delete(tag);
    if (reducedMotion || duration <= 0) {
      update(1);
      done?.();
      invalidate();
      return;
    }
    tweens.set(tag, { start: performance.now() + delay, duration, ease, update, done });
  };

  // --- booth, screens & lights ---------------------------------------------------
  const booth = buildBooth(scene, url);
  const m = booth.materials;
  const screens = await createScreens(scene, options.copy, url);
  m.screen.emissiveTexture = screens.app;
  m.tabletScreen.emissiveTexture = screens.tablet;
  m.laptopScreen.emissiveTexture = screens.site;
  m.brochures.albedoTexture = screens.brochures;
  m.desk.albedoTexture = screens.desk;

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

  // The drum's overhead spot: a tight pool on the exhibit and its plinth.
  const productLight = new SpotLight("product", booth.productLightAt.clone(), Vector3.Zero(), 0.62, 2, scene);
  productLight.setDirectionToTarget(booth.productAim);
  productLight.innerAngle = 0.25;
  const productLit = productLight.includedOnlyMeshes;

  // The products on the stand, the wall screen and the tablet, each get a hidden spot: no
  // fixture in view, just a soft pool of attention that comes up when the screens power on.
  const featureLights = (Object.keys(booth.feature) as (keyof typeof booth.feature)[]).map((id) => {
    const f = booth.feature[id];
    const light = new SpotLight(`feature-${id}`, f.at.clone(), Vector3.Zero(), id === "screen" ? 0.72 : 0.42, 2, scene);
    light.setDirectionToTarget(f.aim);
    light.innerAngle = id === "screen" ? 0.38 : 0.2;
    light.includedOnlyMeshes.push(...f.lit);
    return light;
  });
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

  // --- power & composition ---------------------------------------------------------
  /** Full-power values from the look (theme × lighting), tweened on change. */
  const look = {
    key: 0,
    wash: 0,
    product: 0,
    feature: 0,
    screen: 1,
    hallLights: new Color3(),
    accent: new Color3(),
    sign: new Color3(),
    drum: new Color3(),
    lens: new Color3(),
    downwash: new Color3(),
    /** Floor glows: a colour and a strength (alpha-blended, not additive). */
    spill: new Color3(),
    spillAlpha: 0,
    pool: new Color3(),
    poolAlpha: 0,
  };
  const power: Power = reducedMotion ? lit() : standby();
  /** Hover glow per clickable object, eased in the loop. */
  const hoverLevel: Partial<Record<SpotId, number>> = {};
  let hovered: SpotId | null = null;
  const glowOf = (id: SpotId) => 1 + 0.45 * (hoverLevel[id] ?? 0);

  const compose = () => {
    const p = power;
    keyLight.intensity = look.key * p.key;
    washLight.intensity = look.wash * Math.max((p.arms[0] + p.arms[1] + p.arms[2]) / 3, 0.06);
    productLight.intensity = look.product * p.product * glowOf("exhibit");
    featureLights[0].intensity = look.feature * p.screens * glowOf("screen");
    featureLights[1].intensity = look.feature * 1.1 * p.screens * glowOf("tablet");
    look.hallLights.scaleToRef(p.hall, m.hallLight.emissiveColor);
    look.accent.scaleToRef(p.accent, m.accent.emissiveColor);
    look.sign.scaleToRef(p.sign, m.sign.emissiveColor);
    look.drum.scaleToRef(p.sign, m.fabric.emissiveColor);
    m.armLenses.forEach((lens, i) => look.lens.scaleToRef(p.arms[i], lens.emissiveColor));
    look.lens.scaleToRef(p.key, m.trussLens.emissiveColor);
    look.lens.scaleToRef(p.product, m.drumLens.emissiveColor);
    // A black additive surface speckles on some GPUs: off means off.
    for (const glow of booth.spills) glow.setEnabled(p.accent > 0.002);
    look.downwash.scaleToRef(p.accent, m.wallPanel.emissiveColor);
    m.spill.albedoColor.copyFrom(look.spill);
    m.spill.alpha = look.spillAlpha * p.accent;
    m.pool.albedoColor.copyFrom(look.pool);
    m.pool.alpha = look.poolAlpha * p.key;
    const glass = look.screen * p.screens + p.flash;
    m.screen.emissiveColor.setAll(glass * glowOf("screen"));
    m.tabletScreen.emissiveColor.setAll(glass * glowOf("tablet"));
    m.laptopScreen.emissiveColor.setAll(glass * glowOf("laptop"));
    m.lightbox.emissiveColor.setAll(look.screen * 0.9 * Math.max(p.sign, 0.1));
    const led = Math.max(p.led, 0.0001);
    for (const strip of booth.leds) {
      strip.scaling.x = led;
      strip.setEnabled(p.led > 0.001);
    }
  };

  // --- camera -------------------------------------------------------------------
  const camera = new ArcRotateCamera("camera", REST_ALPHA, REST_BETA, 14, OVERVIEW_TARGET.clone(), scene);
  camera.fov = FOV;
  camera.minZ = 0.1;
  camera.maxZ = 120;
  camera.lowerBetaLimit = 0.98;
  camera.upperBetaLimit = 1.52;
  camera.lowerAlphaLimit = -Math.PI / 2 - 1.15;
  camera.upperAlphaLimit = -Math.PI / 2 + 0.45;
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
    focus: null as SpotFrame | null,
    /** Idle sway weight (0–1) and phase. */
    sway: 0,
    phase: 0,
    /** Orbit offsets (sway + pointer) applied on top of the visitor's own orbit last frame. */
    applied: { alpha: 0, beta: 0 },
    /** Offsets fade out while a scripted orbit runs and back in after it. */
    offsetBlend: 1,
  };
  const desiredTarget = new Vector3();
  let introDone = reducedMotion;
  let dragging = false;
  let lastInteraction = -Infinity;
  const interact = () => (lastInteraction = performance.now());

  /** Advance the rig; returns 0 (settled), 1 (only the idle sway moved), 2 (anything else). */
  const updateRig = (dt: number, now: number) => {
    const aspect = engine.getAspectRatio(camera);
    const tanV = Math.tan(FOV / 2);
    const tanH = tanV * aspect;
    const wide = aspect >= 1.05;
    const k = reducedMotion ? 1 : damp(6, dt);

    rig.smoothProgress = lerp(rig.smoothProgress, rig.progress, reducedMotion ? 1 : damp(8, dt));
    const pointerBefore = rig.smoothPointer.x + rig.smoothPointer.y;
    Vector2.LerpToRef(rig.smoothPointer, rig.pointer, reducedMotion ? 0 : damp(3.5, dt), rig.smoothPointer);
    const e = smooth(clamp01(rig.smoothProgress));

    let radius: number;
    let fx: number;
    let fy: number;
    if (rig.focus) {
      desiredTarget.copyFrom(rig.focus.at);
      radius = rig.focus.radius * rig.zoom;
      fx = wide ? 0.15 : 0;
      fy = wide ? 0 : 0.17;
    } else {
      // Overview: fit the booth (wide: in the right ~60%; tall: full width, lower half).
      const needW = wide ? 13.2 : 7.4;
      const needH = 6.2;
      const overview = Math.max(needW / 2 / tanH, needH / 2 / tanV);
      const product = Math.max(rig.productSpan / Math.min(tanV, tanH), 2.2) * (wide ? 1.55 : 1.35);
      Vector3.LerpToRef(OVERVIEW_TARGET, rig.productTarget, e, desiredTarget);
      radius = Math.exp(lerp(Math.log(overview), Math.log(product), e)) * rig.zoom * rig.introZoom;
      fx = wide ? lerp(0.215, 0.2, e) : 0;
      // Tall screens: booth below the headline, then the exhibit above the exhibit card.
      fy = wide ? lerp(0, -0.02, e) : lerp(-0.2, 0.21, e);
    }

    // Orbit offsets: an idle sway, and the pointer leaning the view (subtler when focused).
    const orbiting = tweens.has("orbit");
    const idle = introDone && !dragging && !rig.focus && !orbiting && now - lastInteraction > SWAY.resumeAfter;
    rig.sway = lerp(rig.sway, idle && !reducedMotion ? 1 : 0, damp(idle ? 0.7 : 5, dt));
    if (rig.sway > 0.001) rig.phase += (dt * Math.PI * 2) / SWAY.period;
    rig.offsetBlend = orbiting || reducedMotion ? 0 : lerp(rig.offsetBlend, 1, damp(2.5, dt));
    // The pointer leans the view, less in a close-up and not at all over the live tablet.
    const lean = focusedId === "tablet" ? 0 : rig.focus ? 0.35 : 1;
    const offAlpha = (Math.sin(rig.phase) * SWAY.amplitude * rig.sway + rig.smoothPointer.x * 0.13 * lean) * rig.offsetBlend;
    const offBeta = rig.smoothPointer.y * 0.05 * lean * rig.offsetBlend;
    let baseAlpha = camera.alpha - rig.applied.alpha;
    let baseBeta = camera.beta - rig.applied.beta;
    if (idle) {
      // Drift home while idle, so the sway always swings around the composed view.
      baseAlpha = lerp(baseAlpha, REST_ALPHA, damp(0.35, dt));
      baseBeta = lerp(baseBeta, REST_BETA, damp(0.35, dt));
    }
    camera.alpha = baseAlpha + offAlpha;
    camera.beta = baseBeta + offBeta;
    rig.applied.alpha = offAlpha;
    rig.applied.beta = offBeta;

    const ox = (fx + rig.smoothPointer.x * 0.01) * 2 * radius * tanH;
    const oy = (fy - rig.smoothPointer.y * 0.008) * 2 * radius * tanV;
    const t = camera.target;
    const o = camera.targetScreenOffset;
    const before = camera.radius + t.x + t.y + t.z + o.x + o.y;
    Vector3.LerpToRef(t, desiredTarget, k, t);
    camera.radius = lerp(camera.radius, radius, k);
    o.x = lerp(o.x, ox, k);
    o.y = lerp(o.y, oy, k);
    const settling = Math.abs(camera.radius + t.x + t.y + t.z + o.x + o.y - before) > 1e-4;
    const pointerMoving = Math.abs(rig.smoothPointer.x + rig.smoothPointer.y - pointerBefore) > 1e-4;
    if (settling || pointerMoving || (orbiting && !idle)) return 2;
    return rig.sway > 0.001 ? 1 : 0;
  };

  const cameraMoving = () => camera.inertialAlphaOffset !== 0 || camera.inertialBetaOffset !== 0;

  const orbitTo = (alpha: number, beta: number, duration: number, ease = easeInOut, delay = 0) => {
    // Hand the offsets back to the base orbit so the scripted move starts where the view is.
    camera.alpha -= rig.applied.alpha;
    camera.beta -= rig.applied.beta;
    rig.applied.alpha = rig.applied.beta = 0;
    rig.offsetBlend = 0;
    const from = { alpha: camera.alpha, beta: camera.beta };
    tween(
      "orbit",
      duration,
      (t) => {
        camera.alpha = lerp(from.alpha, alpha, t);
        camera.beta = lerp(from.beta, beta, t);
      },
      ease,
      undefined,
      delay,
    );
  };

  // A drag takes over from any scripted orbit and pauses the sway until 2 s after it ends.
  const onPointerDown = () => {
    tweens.delete("orbit");
    dragging = true;
    interact();
  };
  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    interact();
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

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

  const exhibitFrame = (): SpotFrame => ({
    at: rig.productTarget.clone(),
    radius: Math.max(rig.productSpan, 0.75) * 3.1,
    alpha: REST_ALPHA + 0.2,
    beta: 1.26,
  });
  let focusedId: SpotId | null = null;

  const updateProductFrame = () => {
    if (!shown) return;
    const top = plinthTops[config.style];
    rig.productTarget = STAND.add(new Vector3(0, top + shown.height * 0.48, 0));
    rig.productSpan = Math.max(shown.radius, 0.75);
    if (focusedId === "exhibit") rig.focus = exhibitFrame();
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
      // Models exported from the explainer's surface system carry its settings in extras: keep its
      // normal-map convention (the geometry round-trips to Babylon's space) and, off phones, the
      // brushed and clear-coat lobes, as the explainer does. The booth's lights do the rest.
      for (const material of container.materials) {
        const extras = material.metadata?.gltf?.extras as { surface?: boolean; anisotropy?: number; clearCoat?: number; clearCoatRoughness?: number } | undefined;
        if (!extras?.surface || !(material instanceof PBRMaterial)) continue;
        material.invertNormalMapX = false;
        material.invertNormalMapY = false;
        if (lite) continue;
        if (extras.anisotropy) {
          material.anisotropy.isEnabled = true;
          material.anisotropy.intensity = extras.anisotropy;
          material.anisotropy.direction = new Vector2(1, 0);
        }
        if (extras.clearCoat) {
          material.clearCoat.isEnabled = true;
          material.clearCoat.intensity = extras.clearCoat;
          material.clearCoat.roughness = extras.clearCoatRoughness ?? 0.08;
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
    color(m.carpet.albedoColor, lin(theme.carpet));
    color(m.inlay.albedoColor, lin(theme.inlay));
    color(m.wallPanel.albedoColor, lin(theme.wallPanel));
    color(m.panel.albedoColor, lin(theme.panel));
    color(m.backer.albedoColor, lin(theme.backer));
    color(m.counterTop.albedoColor, lin(theme.counterTop));
    color(m.plinth.albedoColor, lin(theme.plinth));
    num(m.plinth, "roughness", theme.plinthRoughness);
    color(m.gap.albedoColor, lin(theme.gap));
    color(m.turntable.albedoColor, lin(theme.turntable));
    color(rimLight.diffuse, lin(lighting.rim));
    num(rimLight, "intensity", RIM_POWER * lighting.rimIntensity);
    color(keyLight.diffuse, key);
    color(washLight.diffuse, key);
    color(productLight.diffuse, key);
    num(fill, "intensity", theme.fill);
    color(fill.groundColor, lin(theme.fillGround));
    num(scene, "environmentIntensity", theme.environment);
    num(ip, "exposure", theme.exposure);
    num(ip, "vignetteWeight", theme.vignetteWeight);
    // Full-power values; compose() scales them by the power state.
    num(look, "key", KEY_POWER);
    num(look, "wash", WASH_POWER * theme.washLight);
    num(look, "product", PRODUCT_POWER);
    num(look, "feature", FEATURE_POWER * theme.washLight);
    for (const light of featureLights) color(light.diffuse, key);
    num(look, "screen", theme.screenGlow);
    color(look.hallLights, key.scale(theme.hallLights));
    color(look.accent, accent.scale(ACCENT_POWER * lighting.accentIntensity));
    color(look.sign, white.scale(theme.signGlow));
    color(look.drum, white.scale(0.85));
    color(look.lens, key.scale(3));
    color(look.downwash, accent.scale(theme.wash * lighting.accentIntensity));
    color(look.spill, accent);
    num(look, "spillAlpha", 0.35 * lighting.accentIntensity);
    color(look.pool, key);
    num(look, "poolAlpha", theme.pool * 2.2);
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

  // --- opening sequence -----------------------------------------------------------
  const playIntro = () => {
    const at = (ms: number) => ms; // delays, for reading
    camera.alpha = INTRO.alpha;
    camera.beta = INTRO.beta;
    rig.introZoom = INTRO.zoom;
    // Camera: a slow crane down and round onto the composed view.
    orbitTo(REST_ALPHA, REST_BETA, 4300, easeInOut, at(150));
    tween("intro-zoom", 4300, (t) => (rig.introZoom = lerp(INTRO.zoom, 1, t)), easeInOut, undefined, at(150));
    // The hall wakes.
    tween("intro-hall", 900, (t) => (power.hall = lerp(0.45, 1, t)), easeOut, undefined, at(250));
    // Arm lights strike one by one along the fascia (the wall wash builds with them).
    for (const i of [0, 1, 2]) {
      tween(`intro-arm-${i}`, 380, (t) => (power.arms[i] = strike(t)), linear, undefined, at(520 + i * 240));
    }
    // The downlights in the drum strike over the exhibit.
    tween("intro-product", 460, (t) => (power.product = strike(t)), linear, undefined, at(1300));
    // The house key light comes up.
    tween("intro-key", 900, (t) => (power.key = lerp(0.3, 1, t)), easeInOut, undefined, at(1600));
    // LED strips draw on, then the signs light.
    tween("intro-led", 750, (t) => (power.led = power.accent = t), easeInOut, undefined, at(2000));
    tween("intro-sign", 600, (t) => (power.sign = lerp(0.22, 1, t)), easeOut, undefined, at(2350));
    // Screens power on: a flash, the splash, then the apps.
    tween("intro-boot", 1, () => {}, linear, () => screens.boot(), at(2650));
    tween(
      "intro-screens",
      320,
      (t) => {
        power.screens = t;
        power.flash = Math.sin(t * Math.PI) * 0.7;
      },
      easeOut,
      undefined,
      at(2650),
    );
    tween(
      "intro-done",
      1,
      () => {},
      linear,
      () => {
        introDone = true;
        // Start swaying shortly after the camera settles.
        lastInteraction = performance.now() - SWAY.resumeAfter + 600;
        options.onIntroDone?.();
      },
      at(4500),
    );
  };

  // --- loop & lifecycle ---------------------------------------------------------
  const tmp = new Vector3();
  const reportSpots = () => {
    if (!options.onSpots && !options.onTabletScreen) return;
    const width = engine.getRenderWidth();
    const height = engine.getRenderHeight();
    const scale = canvas.clientWidth / width;
    const viewport = camera.viewport.toGlobal(width, height);
    const transform = scene.getTransformMatrix();
    const anchors: [SpotId, Vector3][] = (Object.keys(booth.spots) as (keyof typeof booth.spots)[]).map((id) => [id, booth.spots[id].marker ?? booth.spots[id].at]);
    if (shown) anchors.push(["exhibit", rig.productTarget.add(new Vector3(0, shown.height * 0.42, 0))]);
    if (options.onTabletScreen) {
      options.onTabletScreen(
        focusedId === "tablet"
          ? booth.tabletCorners.map((corner) => {
              Vector3.ProjectToRef(corner, Matrix.IdentityReadOnly, transform, viewport, tmp);
              return { x: tmp.x * scale, y: tmp.y * scale };
            })
          : null,
      );
    }
    options.onSpots?.(
      anchors.map(([id, at]) => {
        Vector3.ProjectToRef(at, Matrix.IdentityReadOnly, transform, viewport, tmp);
        const visible = tmp.z > 0 && tmp.z < 1 && tmp.x > 0 && tmp.x < width && tmp.y > 0 && tmp.y < height;
        return { id, x: tmp.x * scale, y: tmp.y * scale, visible };
      }),
    );
  };

  let last = performance.now();
  let frameCount = 0;
  const frame = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    let tweened = false;
    for (const [tag, tw] of tweens) {
      if (now < tw.start) {
        tweened = true;
        continue;
      }
      const t = Math.min((now - tw.start) / tw.duration, 1);
      tw.update(tw.ease(t));
      tweened = true;
      if (t >= 1) {
        if (tweens.get(tag) === tw) tweens.delete(tag);
        tw.done?.();
        invalidate();
      }
    }
    let glowing = false;
    for (const id of ["screen", "tablet", "laptop", "exhibit"] as SpotId[]) {
      const target = hovered === id ? 1 : 0;
      const value = hoverLevel[id] ?? 0;
      if (Math.abs(target - value) > 0.002) {
        hoverLevel[id] = lerp(value, target, damp(10, dt));
        glowing = true;
      } else hoverLevel[id] = target;
    }
    if (screens.tick(now)) invalidate(2, false);
    const rigState = updateRig(dt, now);
    const busy = waitingForReady || tweened || glowing || rigState === 2 || cameraMoving() || pendingFrames > 0;
    // The idle sway on its own is slow: half rate is plenty.
    frameCount++;
    if (busy || (rigState === 1 && frameCount % 2 === 0)) {
      compose();
      scene.render();
      reportSpots();
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
    interact();
    rig.zoom = Math.min(Math.max(rig.zoom * (event.deltaY > 0 ? 1.06 : 0.94), 0.6), 1.3);
    invalidate(2, false);
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
  if (reducedMotion) screens.boot(true);
  else {
    // Open on the first frame of the opening shot (the poster shows the same frame).
    camera.alpha = INTRO.alpha;
    camera.beta = INTRO.beta;
    rig.introZoom = INTRO.zoom;
  }
  compose();
  updateRig(1, performance.now());
  updateLoop();
  await new Promise<void>((resolve) => scene.executeWhenReady(() => resolve()));
  if (disposed) throw new Error("disposed");
  if (import.meta.env.DEV) {
    Object.assign(window, { __stage: { scene, camera, keyLight, washLight, rimLight, productLight, fill, shadows, rig, power, booth, screens, invalidate } });
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
      interact();
      invalidate();
    },
    start() {
      if (reducedMotion) {
        options.onIntroDone?.();
        return;
      }
      playIntro();
    },
    setProgress(progress) {
      const p = clamp01(progress);
      if (Math.abs(p - rig.progress) < 1e-4) return;
      rig.progress = p;
      invalidate(2, false);
    },
    setPointer(x, y = 0) {
      if (x === null) rig.pointer.set(0, 0);
      else {
        rig.pointer.set(x, y);
        interact();
      }
      invalidate(2, false);
    },
    focus(id) {
      focusedId = id;
      interact();
      if (!id) {
        rig.focus = null;
        orbitTo(REST_ALPHA, REST_BETA, 1100);
      } else {
        const frame = id === "exhibit" ? exhibitFrame() : booth.spots[id];
        rig.focus = frame;
        rig.zoom = 1;
        orbitTo(frame.alpha, frame.beta, 1200);
      }
      invalidate();
    },
    hover(id) {
      hovered = id;
      invalidate(2, false);
    },
    resetCamera() {
      rig.zoom = 1;
      interact();
      orbitTo(REST_ALPHA, REST_BETA, 900);
    },
    zoom(direction) {
      rig.zoom = Math.min(Math.max(rig.zoom * (direction > 0 ? 0.85 : 1.18), 0.6), 1.3);
      interact();
      invalidate(2, false);
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
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      resizeObserver.disconnect();
      scene.dispose();
      engine.dispose();
    },
  };
}
