export const en = {
  lang: "en",
  htmlLang: "en",
  meta: {
    title: "Ashmartisan · Interactive 3D explainers for industrial equipment",
    description:
      "We turn your equipment into an interactive 3D explainer that runs in any browser: for your website, your sales team and your trade-show stand.",
    ogImageAlt: "A cut-away worm gear reducer in the Ashmartisan Interactive Equipment Explainer",
  },
  tagline: "Interactive ideas for real world equipment",
  nav: {
    product: "Product",
    showcase: "Showcase",
    shows: "Trade shows",
    process: "How it works",
    faq: "FAQ",
    cta: "Book a demo",
    menu: "Menu",
    switchLang: "中文",
    switchLangLabel: "切换到中文",
  },
  hero: {
    eyebrow: "Interactive Equipment Explainer",
    title: "Show buyers how your equipment <em>works</em>, not just how it looks.",
    lead: "We turn your CAD or product model into a 3D explainer that runs in any browser. Buyers click a part to learn what it does, look inside with X-ray and section views, take it apart and watch it run. The same build works on your website, a sales rep's tablet and your trade-show screen.",
    primary: "Try the live demo",
    secondary: "Book a demo",
    points: ["Runs in the browser, no app to install", "From phones to 4K stand screens", "Works offline at trade shows", "English and Chinese built in"],
    device: "Worm Gear Reducer",
    quote: "Get a quote",
    hint: "Click a numbered part",
    ask: "Ask about this part →",
    live: "Load live 3D",
    liveNote: "about 4 MB",
    views: { solid: "Solid", xray: "X-ray", section: "Section", exploded: "Exploded", scan: "Scan" },
    parts: {
      worm: {
        title: "Worm (input shaft)",
        summary: "The screw driven directly by the motor. Its thread works like a screw: one full turn advances the worm wheel by just one tooth.",
        specs: [["Starts", "Single start"], ["Material", "Hardened alloy steel"]],
      },
      wheel: {
        title: "Worm wheel",
        summary: "The helical gear that meshes with the worm. Its tooth count sets the ratio: more teeth mean a slower output and more torque.",
        specs: [["Material", "Tin bronze"], ["Ratio", "≈ teeth ÷ worm starts"]],
      },
      shaft: {
        title: "Output shaft",
        summary: "Fixed to the worm wheel, it delivers the multiplied torque to the load. It runs at right angles to the input worm.",
        specs: [["Orientation", "90° to the input shaft"]],
      },
      flange: {
        title: "Motor flange",
        summary: "Standard mounting interface: the motor bolts on here and its shaft goes into the worm to drive the unit.",
        specs: [["Mounting", "6 bolts"]],
      },
      housing: {
        title: "Housing",
        summary: "The cast casing supports both shafts and keeps the mesh accurate. It is filled with lubricating oil and also dissipates the heat.",
        specs: [["Material", "Cast iron / aluminium alloy"]],
      },
    },
  },
  problem: {
    label: "The problem",
    title: "A spec sheet can't show a buyer how a gearbox works.",
    items: [
      {
        title: "Specs don't explain function",
        text: "Buyers who don't understand the mechanism end up comparing on price. Datasheets list numbers; they rarely show why your design is better.",
      },
      {
        title: "Videos only go one way",
        text: "A video plays the same for everyone. A buyer can't stop at the part they care about, look inside it or ask about it.",
      },
      {
        title: "Stand visitors disappear",
        text: "Visitors take a flyer and walk on. You don't know what caught their interest, and most never get in touch.",
      },
    ],
  },
  product: {
    label: "The product",
    title: "What a buyer would do with the real machine, in a browser tab.",
    lead: "The Interactive Equipment Explainer is built for mechanical products: assemblies with parts that move, mesh, clamp or spin.",
    features: [
      { icon: "target", title: "Click any part", text: "The camera flies to it and a panel explains what it does, with specs and a button to ask about it." },
      { icon: "xray", title: "X-ray, section, blueprint", text: "See through the housing, cut it open or switch to a technical-drawing look." },
      { icon: "explode", title: "Exploded view and assembly", text: "Pull the assembly apart along its real axes, then put it back together step by step." },
      { icon: "play", title: "Guided walkthroughs", text: "A captioned sequence shows the working cycle: how the brake clamps, how the reduction works." },
      { icon: "sliders", title: "Live parameters", text: "Sliders for speed or load, with read-outs that update while the model runs." },
      { icon: "swatch", title: "Colours and finishes", text: "Switch RAL colours and finishes so buyers see the configuration they would order." },
      { icon: "link", title: "Shareable views", text: "Every product and part has its own link. Sales can send a buyer straight to the right detail." },
      { icon: "globe", title: "Two languages", text: "English and Chinese built in. Adding a language means adding text, not code." },
    ],
  },
  showcase: {
    label: "Showcase",
    title: "Four machines you can take apart right now.",
    lead: "These are working demos on the Explainer. Switch views here, or load the live 3D and drive it yourself.",
    load: "Load live 3D",
    open: "Open full screen ↗",
    note: "Loads 2–6 MB of 3D data",
    close: "Back to image",
    rendersNote: "Renders captured from the live product.",
    devices: {
      "worm-gearbox": {
        name: "Worm Gear Reducer",
        tagline: "90° turn · high reduction ratio · self-locking",
        text: "Cut-away housing, worm and wheel turning together, a walkthrough of the reduction ratio and self-locking, and an exploded view.",
      },
      "jet-engine": {
        name: "Turbofan Engine",
        tagline: "Intake → compression → combustion → exhaust",
        text: "The full working cycle as a walkthrough, spinning rotors, a scan view and an axial exploded view.",
      },
      "disk-brake": {
        name: "Ventilated Disc Brake",
        tagline: "Caliper · pads · ventilated disc",
        text: "The caliper clamping the disc, how the vented disc sheds heat, live parameters, colour options and a step-by-step assembly.",
      },
      "hope-rotor": {
        name: "203 mm Floating Brake Rotor",
        tagline: "Aluminium carrier + steel braking track",
        text: "How a two-piece floating rotor is built, shown layer by layer.",
      },
    },
  },
  shows: {
    label: "Trade shows",
    title: "The same build runs your stand.",
    lead: "Switch on kiosk mode and the screen plays the walkthroughs by itself. When someone touches it, it stops and hands over control. When they walk away, it starts again.",
    items: [
      { title: "Attract loop", text: "Cycles through every product's walkthrough and stops the moment someone touches the screen." },
      { title: "Take-home QR code", text: "The code on screen follows the product and part on display. Visitors scan it and the same view opens on their phone." },
      { title: "Runs offline", text: "The offline build carries its models, lighting and fonts. A poor venue connection doesn't stop the demo." },
      { title: "Counts stand visitors", text: "Each visitor session is recorded: how long they stayed and which products and parts they looked at." },
    ],
    qrTitle: "Take it home",
    qrText: "Scan to open this view on your phone",
    kiosk: "Kiosk mode",
  },
  leads: {
    label: "Enquiries",
    title: "Enquiries arrive with context.",
    lead: "Each enquiry comes with a summary of what the buyer looked at, so sales can answer about the right product and the right part.",
    points: [
      "Cookieless analytics: which products and parts get attention",
      "Brochure downloads tied to an email address",
      "No backend to run: you choose the form and analytics services",
    ],
    card: {
      header: "New enquiry",
      product: "Worm Gear Reducer",
      rows: [
        ["Asked about", "Worm wheel"],
        ["Parts viewed", "Worm wheel 1:15 · Worm 0:42 · Output shaft 0:18"],
        ["Tools used", "X-ray, exploded view, walkthrough"],
        ["Changed", "Input speed 1450 → 960 rpm"],
        ["Source", "QR code at a trade show"],
      ],
      link: "Open the exact view ↗",
    },
  },
  services: {
    label: "What we make",
    items: [
      { icon: "cube", title: "3D visualisation", text: "Accurate, lightweight models of your products, optimised to load fast on any device." },
      { icon: "gear", title: "Interactive demos", text: "Parts that move the way the real ones do, controlled by the buyer." },
      { icon: "box", title: "Product explainers", text: "The story of how it works, told part by part, in your buyers' language." },
      { icon: "screens", title: "Web and exhibition", text: "One build for your website, your sales team and your stand." },
    ],
  },
  process: {
    label: "How it works",
    title: "From your files to a live explainer.",
    steps: [
      { title: "Send what you have", text: "CAD exports, an existing 3D model, or photos and drawings if there is no model yet." },
      { title: "We build the model and the story", text: "We prepare the model for phones, name every part, and write the explanations and walkthroughs with your engineers." },
      { title: "Review on a private link", text: "You check the content and the behaviour on your own devices and ask for changes." },
      { title: "Launch", text: "Embed it on your website, run it at shows and give sales the links. It can carry your brand instead of ours." },
    ],
  },
  faq: {
    label: "FAQ",
    title: "What people usually ask.",
    items: [
      {
        q: "Does it work on phones?",
        a: "Yes. Phones get a lighter version of each model, and the renderer adapts to the device. It is tested on iPhone Safari, where heavy 3D pages often fail.",
      },
      {
        q: "Can it run at a show without internet?",
        a: "Yes. The offline build includes every model, lighting file and font. Enquiries and analytics wait in a queue and are sent when the connection comes back.",
      },
      {
        q: "Can it carry our brand?",
        a: "Yes. The name, logo, colours and the light-box signs in the 3D scene all come from one brand folder, so a white-label build is a configuration change.",
      },
      {
        q: "Where is it hosted?",
        a: "It is a static web app: it can run on our hosting, on your server or on any CDN, and it can be embedded in your existing website.",
      },
      {
        q: "What happens to our CAD data?",
        a: "Only an optimised display model reaches the browser, not your engineering files. Products that must not be public can be left out of the public build and shown only at shows or in sales meetings.",
      },
      {
        q: "What does it cost?",
        a: "It depends on how many products you need and how much each one should do. Tell us about one product and we will come back with a quote.",
      },
    ],
  },
  about: {
    label: "Who's behind it",
    title: "Ashmartisan is Ash's studio.",
    text: "I'm a computer graphics engineer in Australia with 9+ years of building for the web, most of it real-time 3D with Babylon.js, Three.js, shaders and Cesium. Ashmartisan is where I build interactive explainers for companies that make and sell equipment.",
    blog: "Read my blog →",
    linkedin: "LinkedIn ↗",
  },
  contact: {
    label: "Contact",
    title: "Have a machine that's hard to <em>explain?</em>",
    lead: "Tell us what you make and where you want to show it, and we'll be in touch.",
    fields: {
      name: "Name",
      email: "Work email",
      company: "Company",
      need: "What do you want to explain?",
      needOptions: ["A single product", "A product range", "A trade-show stand", "Not sure yet"],
      message: "Message",
      messagePlaceholder: "The equipment, what buyers find hard to understand, and any deadline",
    },
    consent: "I agree that my details are used to reply to this enquiry.",
    privacy: "Privacy notice",
    submit: "Send enquiry",
    sending: "Sending…",
    sent: "Thanks, your enquiry has been sent. We'll be in touch.",
    mailto: "Your email app should open with the enquiry filled in. If it doesn't, write to",
    failed: "That didn't go through. Please email",
    subject: "Ashmartisan enquiry",
  },
  footer: {
    rights: "All rights reserved.",
    privacy: "Privacy",
    blog: "Blog",
    credits: "3D models in the showcase",
  },
  privacy: {
    title: "Privacy notice",
    updated: "Last updated 9 October 2026",
    sections: [
      {
        h: "What this site collects",
        p: "This site sets no cookies and has no user accounts. If you send an enquiry, we receive what you type into the form: your name, email address, company, the kind of project and your message.",
      },
      {
        h: "How enquiries are handled",
        p: "The form is delivered by a third-party form service, which passes it on by email. If no form service is configured, the form opens your own email app instead and nothing passes through this site. Your details are only used to reply to you and are not sold or shared for marketing.",
      },
      {
        h: "Analytics",
        p: "If analytics are switched on, they use a cookieless, Plausible-compatible service that counts page views without storing personal data or tracking you across sites.",
      },
      {
        h: "Your choices",
        p: "To see, correct or delete what we hold about you, email",
      },
    ],
    back: "← Back to the home page",
  },
};

export type Copy = typeof en;
