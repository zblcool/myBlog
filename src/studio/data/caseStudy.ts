/**
 * The featured case study (/case-study/centrifugal-pump-set/). English only.
 *
 * This is a DEMONSTRATION PROJECT, not client work: no customer, no customer CAD, no commercial
 * results. Every fact here must be checkable:
 * - Pump data and part names come from the explainer (Interactive-Equipment-Explainer,
 *   src/locales/en/devices/pump-set.json): 10 annotated parts, an 8-step walkthrough, a
 *   Configure tab. The pump is drawn from ISO 2858 / IEC 60072 dimensions (generic).
 * - Model figures were measured from public/studio/stage/models/pump-set.glb, the web export
 *   of the same model used by the home page booth (1,052,700 bytes, 100,214 triangles,
 *   38 meshes, EXT_meshopt_compression + KHR_mesh_quantization + EXT_texture_webp).
 * - Images in public/studio/case/pump-set/ are captures of the live explainer (2026-11-11).
 * `pending` marks a slot kept for material a real client project would supply: it is shown as
 * an empty, labelled frame and never filled with made-up content.
 */
export type Mode = "embed" | "sales" | "kiosk";

export interface CaseImage {
  src: string;
  alt: string;
  caption: string;
}

export interface CaseStage {
  id: string;
  title: string;
  /** What Ashmartisan does at this stage, for any project. */
  value: string;
  /** What happened in this demonstration. */
  here: string;
  images: CaseImage[];
  facts?: { caption: string; rows: [string, string][] };
  pending?: { title: string; text: string };
}

const img = (name: string) => `/studio/case/pump-set/${name}.webp`;

export const caseStudy = {
  slug: "centrifugal-pump-set",
  title: "Case Study: an Industrial Pump Set from Engineering Model to Interactive 3D · Ashmartisan",
  description:
    "A demonstration project: how Ashmartisan turns an ISO 2858 centrifugal pump set into an interactive 3D experience, from model preparation to explorable parts, a configurator, and delivery to website, sales and trade shows.",
  badge: "Demonstration project",
  crumb: "Case study",
  name: "ISO 2858 Centrifugal Pump Set",
  question: "How does Ashmartisan turn a complex industrial product into a better customer experience?",
  disclaimer:
    "Built by Ashmartisan to show the process. Not a client project: no customer, no customer CAD and no commercial results. The pump is generic, drawn from ISO 2858 and IEC 60072 dimensions; its figures and options are illustrative.",
  image: img("blueprint"),
  summary: [
    ["Product", "End-suction pump, IEC motor, baseplate"],
    ["Standards", "ISO 2858 · IEC 60072 · EN 1092-1 PN16"],
    ["Product lines", "Showcase + Configurator"],
  ] as [string, string][],
  stagesLabel: "Stage",
  hereLabel: "In this demonstration",
  stages: [
    {
      id: "cad",
      title: "Original CAD",
      value: "We start from the engineering model you already have, a STEP or native CAD export, and agree with your engineers which parts buyers need to understand.",
      here: "There is no customer CAD in this project. The geometry was drawn from the ISO 2858 and IEC 60072 dimension tables.",
      images: [],
      facts: {
        caption: "Source data used instead",
        rows: [
          ["Standards", "ISO 2858 pump, IEC 60072 motor, EN 1092-1 PN16 flanges"],
          ["Sizes", "13 sizes, 50-32-160 to 125-100-250"],
          ["Duty", "Up to 200 m³/h, up to 80 m head"],
          ["Speeds", "2900 or 1450 rpm (50 Hz)"],
        ],
      },
      pending: {
        title: "Original CAD capture",
        text: "Reserved for a client's CAD export. Not shown here because this project has none.",
      },
    },
    {
      id: "optimised",
      title: "Optimised 3D",
      value: "We rebuild the model for the real-time web: parts split and named, geometry compressed, materials set up for the browser. Only this display model reaches the browser, never your engineering files.",
      here: "The pump set as one web model: the same file the 3D booth at the top of our home page loads.",
      images: [{ src: img("blueprint"), alt: "Blueprint view of the optimised pump set model with its overall dimensions", caption: "Blueprint view with overall dimensions, captured from the live explainer" }],
      facts: {
        caption: "Web model, measured",
        rows: [
          ["File", "1.05 MB (glTF binary)"],
          ["Triangles", "≈ 100,000"],
          ["Meshes", "38"],
          ["Compression", "Meshopt geometry, quantised vertices, WebP textures"],
        ],
      },
    },
    {
      id: "interactive",
      title: "Interactive experience",
      value: "We turn the model into something buyers use: numbered parts with plain-language explanations, X-ray, section and exploded views, a guided walkthrough, and a configurator that only allows valid options.",
      here: "Showcase and Configurator on one model: buyers explore the pump, then configure one and request a quote.",
      images: [
        { src: img("explore"), alt: "The pump set with ten numbered parts and the part list", caption: "Explore: 10 numbered parts, each with an explanation and specs" },
        { src: img("exploded"), alt: "Exploded view of the pump set", caption: "Exploded view: casing, impeller, bearing bracket, coupling and motor apart" },
        { src: img("configure"), alt: "The pump set's Configure tab with duty point, model code and validation", caption: "Configure: duty point in, model code and rule check out, then a quote request" },
      ],
      facts: {
        caption: "What the live demo does",
        rows: [
          ["Parts", "10, numbered"],
          ["Views", "Solid, X-ray, Blueprint, Section, Exploded"],
          ["Walkthrough", "8 steps: how the pump set works"],
          ["Configurator", "Valid options only, model code, quote request"],
        ],
      },
    },
    {
      id: "delivery",
      title: "Final delivery",
      value: "One build goes where buyers meet the product: embedded on your product page, on a sales rep's laptop or tablet, and full screen on a trade-show stand, running offline.",
      here: "Not deployed for a client. Each delivery mode below opens this pump set live.",
      images: [{ src: img("kiosk"), alt: "Exhibition mode: the walkthrough plays on its own with a QR code to take it home", caption: "Exhibition mode: the walkthrough plays by itself, with a take-home QR code" }],
      pending: {
        title: "Client deployment capture",
        text: "Reserved for photos or screenshots of a real deployment. None exist for this demonstration.",
      },
    },
  ] as CaseStage[],
  modes: [
    { id: "embed", label: "Website", text: "Embedded in a product page", params: { embed: "1" }, page: "/embed-3d-product-viewer/" },
    { id: "sales", label: "Sales", text: "Full explainer on a laptop or tablet", params: {}, page: "/interactive-3d-product-explainer/" },
    { id: "kiosk", label: "Exhibition", text: "Kiosk mode with attract loop", params: { mode: "kiosk", idle: "20" }, page: "/trade-show-touch-screen/" },
  ] as { id: Mode; label: string; text: string; params: Record<string, string>; page: string }[],
  openMode: "Open live",
  more: "Use case",
  ctaTitle: "Want this for <em>your product?</em>",
  ctaText: "Send us a CAD export or a few photos of one product. We'll show you what its interactive 3D could look like.",
  live: "Open the live demo",
  configure: "Try the configurator",
  quote: "Get a quote",
};
