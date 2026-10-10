/**
 * Landing pages, one per way the explainer is used (the live demo's three scenarios). Each is
 * written around what a buyer would search for, so the site can be found for more than its name.
 * English only, like the rest of the published site. `scene` is the explainer's `?scene=` id.
 */
export interface Solution {
  slug: string;
  scene: "website" | "tradeshow" | "embed";
  /** Device shown in that scenario (studio/data/devices.ts id), for the screenshot. */
  device: "worm-gearbox" | "jet-engine" | "hope-rotor";
  view: "solid" | "xray" | "section" | "exploded" | "scan";
  icon: string;
  /** Short name used in links between the pages. */
  name: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  featuresTitle: string;
  features: { icon: string; title: string; text: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  fitTitle: string;
  fit: string[];
  faq: { q: string; a: string }[];
}

export const solutions: Solution[] = [
  {
    slug: "interactive-3d-product-explainer",
    scene: "website",
    device: "worm-gearbox",
    view: "xray",
    icon: "screens",
    name: "Interactive 3D product explainer",
    title: "Interactive 3D Product Explainer for Industrial Equipment · Ashmartisan",
    description:
      "An interactive 3D product explainer for your website and sales tablets: numbered parts, X-ray, section and exploded views, guided walkthroughs and live operating parameters. Runs in any browser.",
    eyebrow: "Website · sales tablet",
    h1: "Interactive 3D product explainers for <em>industrial equipment</em>",
    lead: "Buyers don't read spec sheets the way engineers write them. An interactive 3D explainer lets them click a part to see what it does, look inside the housing, take the product apart and watch it run, on your product page or on a sales rep's tablet.",
    featuresTitle: "What your buyers can do",
    features: [
      { icon: "target", title: "Click a part, learn what it does", text: "Numbered parts open a short explanation and the specifications that matter, with the camera moving to the part." },
      { icon: "xray", title: "See inside", text: "X-ray, section and blueprint views show the internals without a cut-away drawing." },
      { icon: "explode", title: "Take it apart", text: "Exploded views and step-by-step assembly show how the parts fit and in which order." },
      { icon: "play", title: "Watch it work", text: "Guided walkthroughs animate the working principle, one step at a time, with captions." },
      { icon: "sliders", title: "Try the numbers", text: "Operating parameters respond live, so buyers see what speed, pressure or ratio change." },
      { icon: "link", title: "Ask with context", text: "\"Get a quote\" sends your sales team what the buyer looked at, so the first reply can be specific." },
    ],
    stepsTitle: "How a project runs",
    steps: [
      { title: "Your model", text: "We start from your CAD export or product model and prepare it for the browser: light enough for phones, detailed where it matters." },
      { title: "Your story", text: "Together we decide which parts to explain, which walkthroughs to animate and which numbers buyers should be able to change." },
      { title: "Your channels", text: "The same build goes on your website, on sales tablets and, if you want, on your trade-show screen." },
    ],
    fitTitle: "A good fit for",
    fit: ["Gearboxes, pumps, valves and compressors", "Brakes, drivetrain and vehicle parts", "Machines with moving internals", "Products sold through distributors and dealers", "Technical sales with long lead times"],
    faq: [
      { q: "What do buyers need to install?", a: "Nothing. The explainer runs in any modern browser on phones, tablets and computers." },
      { q: "Can we use our CAD files?", a: "Yes. An export from your CAD system (STEP, or a mesh format such as OBJ, FBX or glTF) is the usual starting point. We simplify it for the web and keep the parts you want to explain." },
      { q: "Does it work in other languages?", a: "Yes. It is multilingual, Spanish and more: adding a language means adding text, not code." },
      { q: "Who receives the enquiries?", a: "Your sales team, by email or through the form service you already use, together with a summary of what the buyer looked at." },
    ],
  },
  {
    slug: "trade-show-touch-screen",
    scene: "tradeshow",
    device: "jet-engine",
    view: "scan",
    icon: "stand",
    name: "Trade-show touch screen",
    title: "Interactive Trade-Show Touch Screen for Equipment Makers · Ashmartisan",
    description:
      "Turn your exhibition stand screen into an interactive 3D product display: it presents your equipment by itself, hands over when a visitor touches it, and lets them take it home with a QR code.",
    eyebrow: "Trade-show stand",
    h1: "A trade-show touch screen that <em>presents your equipment</em> by itself",
    lead: "Big machines are hard to bring to a stand, and a looping video can't answer questions. Kiosk mode turns any touch screen into an interactive 3D display: it presents your products while the stand is busy and hands control to the first visitor who reaches out.",
    featuresTitle: "What happens at your stand",
    features: [
      { icon: "play", title: "Presents by itself", text: "When nobody is touching the screen it plays the walkthroughs and cycles through your products." },
      { icon: "target", title: "Hands over on a touch", text: "A visitor taps the screen and is in control: parts, X-ray, exploded views. Walk away and the show starts again." },
      { icon: "link", title: "Take it home", text: "A QR code on screen opens the same product and part on the visitor's phone, with the brochure and a quote request." },
      { icon: "screens", title: "Any screen size", text: "From a tablet on a counter to a 4K touch screen, in portrait or landscape." },
      { icon: "gear", title: "Works offline", text: "An offline build runs from the stand PC, with no dependence on the exhibition hall's Wi-Fi." },
      { icon: "globe", title: "Show by show", text: "Name the show in the settings and every QR scan and enquiry is credited to it, so you can compare events." },
    ],
    stepsTitle: "Getting a stand ready",
    steps: [
      { title: "Pick the products", text: "Choose the products and walkthroughs for the show. The same build used on your website can be reused." },
      { title: "Set up the screen", text: "Open the explainer in kiosk mode on the stand PC or media player: one link, or the offline build." },
      { title: "Follow up", text: "Visitors who scanned the QR code arrive with the product they saw; their enquiries say which show they came from." },
    ],
    fitTitle: "A good fit for",
    fit: ["Machines too large or heavy to ship to a stand", "Products whose value is inside the housing", "Stands staffed by one or two people", "Distributors showing several product lines", "Recurring shows where you want comparable results"],
    faq: [
      { q: "What hardware do we need?", a: "A touch screen and a computer or media player with a modern browser. A mid-range PC with integrated graphics is usually enough." },
      { q: "Does it need an internet connection?", a: "No. An offline build runs locally; usage statistics are queued and sent when the connection comes back." },
      { q: "Can visitors leave their details at the stand?", a: "Visitors scan the QR code and continue on their own phone, where they can ask for a quote or the brochure." },
      { q: "Can we use it on our website too?", a: "Yes. It is the same explainer: kiosk mode is a setting, not a separate product." },
    ],
  },
  {
    slug: "embed-3d-product-viewer",
    scene: "embed",
    device: "hope-rotor",
    view: "exploded",
    icon: "embed",
    name: "Embedded 3D product viewer",
    title: "Embed an Interactive 3D Product Viewer on Your Website · Ashmartisan",
    description:
      "Add an interactive 3D product viewer to the product pages you already have with one line of code. It loads only when clicked, keeps your page fast and works in Shopify, WordPress and any CMS that accepts an iframe.",
    eyebrow: "Your existing website",
    h1: "Embed an interactive 3D product viewer in <em>the pages you already have</em>",
    lead: "You don't need a new website to show your products in 3D. The explainer goes into an existing product page as one block, next to your photos, price and buy button, with a single line of code.",
    featuresTitle: "Why it fits into an existing page",
    features: [
      { icon: "link", title: "One line of code", text: "An iframe snippet works in Shopify, WordPress, Webflow and any CMS that accepts embedded content." },
      { icon: "gear", title: "Your page stays fast", text: "Nothing heavy loads until the visitor clicks \"View in 3D\", and page scrolling passes over the block until then." },
      { icon: "screens", title: "Fits the block it's in", text: "The layout adapts to the space it is given, from a wide product gallery to a phone screen, with a full-screen button." },
      { icon: "target", title: "The full explainer inside", text: "Parts, X-ray and exploded views, walkthroughs and a quote request, all inside the block." },
      { icon: "swatch", title: "Your brand", text: "Your colours and your contact details: the embed carries no studio branding of its own." },
      { icon: "globe", title: "Know where enquiries come from", text: "Quote requests sent from the embed are marked as such, so you know which pages bring buyers." },
    ],
    stepsTitle: "Adding it to a product page",
    steps: [
      { title: "We build the explainer", text: "From your product model, with the parts and walkthroughs that matter to your buyers." },
      { title: "You paste one line", text: "Copy the iframe snippet into the product page, next to the photos." },
      { title: "Buyers explore", text: "Visitors open the 3D view when they want it and ask for a quote from inside it." },
    ],
    fitTitle: "A good fit for",
    fit: ["Online shops selling technical parts", "Product catalogues on WordPress or Shopify", "Distributors' websites showing your range", "Landing pages for a product launch", "Support and documentation pages"],
    faq: [
      { q: "Will it slow down our product pages?", a: "No. The page only loads a light placeholder; the 3D model loads when the visitor clicks it." },
      { q: "Does it work on phones?", a: "Yes. Give the block a taller shape on phone layouts and it switches to its phone layout, with full screen available." },
      { q: "Which website builders are supported?", a: "Any that lets you add an iframe or custom HTML: Shopify, WordPress, Webflow, Squarespace, Wix and most CMSs." },
      { q: "Can several products share one embed?", a: "Each product has its own link. One project can cover your whole range, each product embedded on its own page." },
    ],
  },
];

export const solutionBySlug = (slug: string) => solutions.find((s) => s.slug === slug);

/** Labels shared by the landing pages. */
export const solutionLabels = {
  demo: "Open the live demo",
  contact: "Book a demo",
  home: "Home",
  related: "Other ways to use it",
  ctaTitle: "Have a machine that's hard to <em>explain?</em>",
  ctaText: "Tell us what you make and where you want to show it. We'll show you the explainer with a product like yours.",
  shotAlt: (device: string, view: string) => `${device} in the ${view} view of the Ashmartisan Interactive Equipment Explainer`,
};
