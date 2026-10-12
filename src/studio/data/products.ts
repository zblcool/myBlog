/**
 * Product pages for the demo devices (/showcase/<id>/), laid out like a printed product brochure.
 *
 * Names, taglines, specs, part titles/summaries and parameter labels are copied from the
 * explainer's src/locales/en/devices/<id>.json (Interactive-Equipment-Explainer); re-sync them
 * from there when the demo copy changes. Part ids are the explainer's annotation ids, so
 * `?part=<id>` opens the live demo on that part. The specs are demonstration values.
 *
 * `diagram`: a transparent cut-out of the explainer's overview camera (public/studio/products),
 * with each annotation's anchor projected into it as [x %, y %]. See the README for the capture.
 */
import type { Device } from "./devices";

export interface ProductPart {
  id: string;
  title: string;
  /** One line for the structure diagram label. */
  role: string;
  summary: string;
  specs: [string, string][];
}

export interface Product {
  id: Device["id"];
  name: string;
  tagline: string;
  title: string;
  description: string;
  intro: string;
  sellingPoints: { icon: string; title: string; text: string }[];
  specs: [string, string][];
  parts: ProductPart[];
  parameters: { controls: [string, string][]; readouts: string[] };
  diagram: { image: string; width: number; height: number; anchors: Record<string, [number, number]> };
}

export const productLabels = {
  home: "Ashmartisan",
  showcase: "Showcase",
  live: "Open live 3D",
  contact: "See it on your product",
  structure: "How it's built",
  structureLead: "Click a part to open it in the live 3D.",
  points: "What the demo shows",
  data: "Technical data",
  product: "Product",
  item: "Item",
  value: "Value",
  partsTable: "Parts",
  part: "Part",
  property: "Property",
  adjustable: "Adjustable in the demo",
  input: "Input",
  range: "Range",
  readouts: "Live read-outs",
  note: "Demonstration values for this model, not the data of a specific manufacturer's product.",
  views: "Views",
  ctaTitle: "Want this for <em>your product?</em>",
  ctaText: "Send us a CAD export or a few photos of one product. We'll show you what its page and live 3D could look like.",
  ctaButton: "Get in touch",
  others: "Other demo machines",
  credit: "3D model",
  pageLink: "Product page",
  diagramAlt: (name: string) => `${name}: structure diagram with numbered parts`,
};

export const products: Product[] = [
  {
    id: "worm-gearbox",
    name: "Worm Gear Reducer",
    tagline: "90° turn · high reduction ratio · self-locking",
    title: "Worm Gear Reducer: Interactive 3D Cut-away and Exploded View · Ashmartisan",
    description:
      "Explore a worm gear reducer in 3D: a cut-away housing, the worm and wheel in mesh, a walkthrough of the reduction ratio, live input speed and power, and an exploded view.",
    intro:
      "A single-stage worm gear reducer, opened up. Buyers watch the worm drive the bronze wheel through the cut-away housing, follow a walkthrough of how the reduction works, and change the motor speed to see output speed and torque respond.",
    sellingPoints: [
      { icon: "xray", title: "Cut-away housing", text: "The casing is open on one side, so the worm and the wheel are visible in mesh without switching views." },
      { icon: "play", title: "How the reduction works", text: "A captioned walkthrough turns the worm and the wheel together and explains the high ratio and why the drive self-locks." },
      { icon: "sliders", title: "Live input speed and power", text: "Set the motor speed and power; output speed and torque update while the model runs." },
      { icon: "explode", title: "Exploded view and colours", text: "Pull the gearbox apart along its shafts, and switch the flange paint between RAL colours." },
    ],
    specs: [
      ["Transmission", "Single-stage worm gear"],
      ["Ratio", "approx. 20:1"],
      ["Input / output", "Shafts at 90°"],
    ],
    parts: [
      {
        id: "worm",
        title: "Worm (input shaft)",
        role: "Driven by the motor; one turn moves the wheel one tooth",
        summary: "The screw driven directly by the motor. Its thread works like a screw: one full turn advances the worm wheel by just one tooth.",
        specs: [["Starts", "Single start"], ["Material", "Hardened alloy steel"]],
      },
      {
        id: "wheel",
        title: "Worm wheel",
        role: "Bronze gear in mesh with the worm; its teeth set the ratio",
        summary: "The helical gear that meshes with the worm. Its tooth count sets the ratio: more teeth mean a slower output and more torque.",
        specs: [["Material", "Tin bronze (wear-resistant, low friction)"], ["Ratio", "≈ teeth ÷ worm starts"]],
      },
      {
        id: "shaft",
        title: "Output shaft",
        role: "Delivers the multiplied torque, at 90° to the input",
        summary: "Fixed to the worm wheel, it delivers the multiplied torque to the load. It runs at right angles to the input worm.",
        specs: [["Orientation", "90° to the input shaft"]],
      },
      {
        id: "housing",
        title: "Housing",
        role: "Cast casing for the shafts, the oil and the heat",
        summary: "The cast casing supports both shafts and keeps the mesh accurate. It is filled with lubricating oil and also dissipates the heat.",
        specs: [["Material", "Cast iron / aluminium alloy"]],
      },
      {
        id: "flange",
        title: "Motor flange",
        role: "Standard interface where the motor bolts on",
        summary: "Standard mounting interface: the motor bolts on here and its shaft goes into the worm to drive the unit.",
        specs: [["Mounting", "6 bolts"]],
      },
      {
        id: "bearings",
        title: "Bearings",
        role: "Carry the forces from the mesh at each shaft end",
        summary: "Support the worm and the output shaft, take the radial and axial forces from the mesh and keep the shafts running smoothly.",
        specs: [["Quantity", "One at each end of each shaft"]],
      },
    ],
    parameters: {
      controls: [["Input speed (motor)", "0–3000 rpm"], ["Input power", "0.5–7.5 kW"]],
      readouts: ["Output speed", "Output torque"],
    },
    diagram: {
      image: "/studio/products/worm-gearbox.webp",
      width: 1206,
      height: 1308,
      anchors: { worm: [37.8, 46.7], wheel: [38.1, 62.6], shaft: [46.8, 68.2], housing: [15.4, 64.2], flange: [63.6, 62.4], bearings: [43.9, 66.4] },
    },
  },
  {
    id: "jet-engine",
    name: "Turbofan Engine",
    tagline: "Intake → compression → combustion → exhaust",
    title: "Turbofan Engine: Interactive 3D Working Cycle and Exploded View · Ashmartisan",
    description:
      "Explore a turbofan engine in 3D: the working cycle from intake to exhaust as a guided walkthrough, spinning rotors, X-ray and scan views, a live throttle and an axial exploded view.",
    intro:
      "A twin-spool turbofan built as a training and display model. The walkthrough follows the air from the fan to the nozzle, X-ray shows the blade stages inside the casings, and the throttle drives fan speed and estimated thrust.",
    sellingPoints: [
      { icon: "play", title: "The working cycle, step by step", text: "Intake, compression, combustion and exhaust, each step framed and captioned while the rotors turn." },
      { icon: "xray", title: "X-ray and scan views", text: "See the blade stages through the casings, or switch to the scan look for presentations." },
      { icon: "sliders", title: "Live throttle", text: "Move the throttle and watch fan speed N1 and estimated thrust follow." },
      { icon: "explode", title: "Axial exploded view", text: "Separate the casings along the engine axis to show how the core is stacked." },
    ],
    specs: [
      ["Type", "Twin-spool turbofan"],
      ["Compressor", "Multi-stage axial"],
      ["Use", "Training / display model"],
    ],
    parts: [
      {
        id: "intake",
        title: "Intake and fan case",
        role: "Takes in the air; the fan makes most of the thrust",
        summary: "Air enters the engine here. The fan pushes most of it straight back, which produces most of the thrust; the rest goes into the core.",
        specs: [["Function", "Intake, flow straightening, fan containment"]],
      },
      {
        id: "blades",
        title: "Rotor blades",
        role: "Fan, compressor and turbine stages on one shaft",
        summary: "Fan, compressor and turbine blades sit on the same shaft. The turbine takes energy from the hot gas and drives the fan and compressor in front of it.",
        specs: [["Construction", "Multi-stage axial"], ["Material", "Titanium / nickel superalloys"]],
      },
      {
        id: "compressor",
        title: "Compressor case",
        role: "Squeezes the air stage by stage",
        summary: "Encloses the multi-stage compressor. The air is squeezed stage by stage and sent to the combustor at high pressure.",
        specs: [["Function", "Raises the air pressure"]],
      },
      {
        id: "turbine",
        title: "Combustor and turbine case",
        role: "Fuel burns; the hot gas drives the turbine",
        summary: "Compressed air and fuel mix and burn in the combustor; the hot, high-pressure gas spins the turbine and then leaves at the back.",
        specs: [["Operating temperature", "Extremely high (needs cooling design)"]],
      },
      {
        id: "nozzle",
        title: "Exhaust nozzle",
        role: "Accelerates the gas into thrust",
        summary: "The gas accelerates out of here, turning heat into a fast rearward jet that produces reaction thrust.",
        specs: [["Function", "Accelerates the gas, produces thrust"]],
      },
      {
        id: "pipes",
        title: "External pipes and accessories",
        role: "Fuel, oil and bleed-air lines",
        summary: "Fuel, oil and bleed-air lines run outside the casing to the accessory gearbox, fuel pump and other auxiliary systems.",
        specs: [["Function", "Fuel / oil / bleed-air supply"]],
      },
    ],
    parameters: {
      controls: [["Throttle", "0–100 %"]],
      readouts: ["Fan speed N1", "Thrust (estimated)"],
    },
    diagram: {
      image: "/studio/products/jet-engine.webp",
      width: 1312,
      height: 1053,
      anchors: { intake: [63.3, 29.2], blades: [58.3, 48.4], compressor: [57.1, 28.6], turbine: [32.9, 23.2], nozzle: [22, 11.5], pipes: [70.8, 32.1] },
    },
  },
  {
    id: "disk-brake",
    name: "Ventilated Disc Brake",
    tagline: "Caliper · pads · ventilated disc",
    title: "Ventilated Disc Brake: Interactive 3D Braking Sequence and Assembly · Ashmartisan",
    description:
      "Explore a ventilated disc brake in 3D: the caliper clamping the disc, how the vented disc sheds heat, live speed and line pressure, caliper colours and a step-by-step assembly.",
    intro:
      "A floating-caliper brake with a ventilated disc. The walkthrough shows the braking sequence from line pressure to clamp, the parameters turn pressure into clamping force and braking torque, and assembly mode builds the brake up part by part.",
    sellingPoints: [
      { icon: "play", title: "Braking sequence", text: "Pressure, piston, pads and disc in order, with the wheel slowing as the caliper clamps." },
      { icon: "sliders", title: "Live speed and line pressure", text: "Read wheel speed, clamping force and braking torque as you change the inputs." },
      { icon: "explode", title: "Step-by-step assembly", text: "Assembly mode takes the brake apart and puts it back together in the right order." },
      { icon: "swatch", title: "Caliper colours", text: "Switch the caliper between RAL and tactical finishes." },
    ],
    specs: [
      ["Type", "Floating caliper · ventilated disc"],
      ["Disc diameter", "approx. 320 mm"],
      ["Actuation", "Hydraulic"],
    ],
    parts: [
      {
        id: "disc",
        title: "Ventilated disc",
        role: "Friction surface with internal cooling vanes",
        summary: "Two friction plates with radial cooling vanes between them. As the disc spins, air is flung out through the channels and carries the braking heat away.",
        specs: [["Construction", "Twin plates + internal vanes"], ["Function", "Friction surface · cooling"]],
      },
      {
        id: "pads",
        title: "Brake pads",
        role: "Friction material pressed onto both sides",
        summary: "Friction material on both sides of the disc. The piston presses them onto the disc, and the friction slows the wheel down.",
        specs: [["Quantity", "One per side, two in total"], ["Wear", "Wear part, replace regularly"]],
      },
      {
        id: "caliper",
        title: "Brake caliper",
        role: "Hydraulic clamp that straddles the disc",
        summary: "The clamp that straddles the disc. Brake fluid carries the pressure to the piston in the caliper, and the piston pushes the pads.",
        specs: [["Actuation", "Hydraulic piston"], ["Mounting", "Fixed to the steering knuckle, does not rotate"]],
      },
      {
        id: "hat",
        title: "Disc hat (mounting face)",
        role: "Mounts the disc to the hub, passes the torque",
        summary: "The hat in the middle of the disc. It is clamped to the hub together with the wheel and passes the braking torque to the wheel.",
        specs: [["Function", "Locating · torque transfer"]],
      },
    ],
    parameters: {
      controls: [["Vehicle speed", "0–200 km/h"], ["Brake line pressure", "0–150 bar"]],
      readouts: ["Wheel speed", "Clamping force", "Braking torque"],
    },
    diagram: {
      image: "/studio/products/disk-brake.webp",
      width: 1026,
      height: 1241,
      anchors: { disc: [21.1, 39.1], pads: [74.2, 52.3], caliper: [87.3, 55.8], hat: [38.5, 48.4] },
    },
  },
  {
    id: "hope-rotor",
    name: "203 mm Floating Brake Rotor",
    tagline: "Aluminium carrier + steel braking track",
    title: "Floating Brake Rotor: Interactive 3D Exploded View · Ashmartisan",
    description:
      "Explore a two-piece floating brake rotor in 3D: steel braking track, aluminium carrier and floating rivets shown layer by layer, with a braking walkthrough and live riding speed.",
    intro:
      "A 203 mm two-piece floating rotor for bicycles. The exploded view separates the steel track from the aluminium carrier, the walkthrough shows how it brakes, and the riding speed sets how fast the rotor turns.",
    sellingPoints: [
      { icon: "explode", title: "Layer by layer", text: "The exploded view separates track, carrier, rivets and bolts, so the floating joint is easy to see." },
      { icon: "play", title: "How it brakes", text: "A short walkthrough of the pads clamping the track while the rotor spins." },
      { icon: "sliders", title: "Live riding speed", text: "Rotor speed and track surface speed follow the speed you set." },
      { icon: "swatch", title: "Carrier colours", text: "Switch the carrier finish to show the colour options." },
    ],
    specs: [
      ["Diameter", "203 mm"],
      ["Construction", "Two-piece floating"],
      ["Mounting", "6 bolts"],
    ],
    parts: [
      {
        id: "track",
        title: "Braking track",
        role: "Steel friction surface the pads clamp",
        summary: "The friction surface the pads clamp. Braking turns motion into heat here; the steel keeps wear low and the friction stable at high temperatures.",
        specs: [["Outer diameter", "203 mm (nominal)"], ["Material", "Steel"]],
      },
      {
        id: "carrier",
        title: "Aluminium carrier",
        role: "Spider joining the hub to the braking track",
        summary: "The star-shaped spider that connects the hub to the braking track. Aluminium cuts rotating mass and keeps heat away from the hub.",
        specs: [["Material", "Aluminium alloy (bead-blasted)"], ["Function", "Carries braking torque, insulates"]],
      },
      {
        id: "rivets",
        title: "Floating rivets",
        role: "Let the track move as it expands with heat",
        summary: "Hold the braking track to the carrier with a little play, so the two can move slightly as they expand with heat, which keeps the rotor from warping.",
        specs: [["Construction", "Two-piece floating joint"]],
      },
      {
        id: "bolts",
        title: "Mounting bolts",
        role: "Six bolts fix the rotor to the hub",
        summary: "Six bolts fix the rotor to the hub and pass the braking torque to the wheel.",
        specs: [["Mounting", "6 bolts"]],
      },
    ],
    parameters: {
      controls: [["Riding speed", "0–60 km/h"]],
      readouts: ["Rotor speed", "Track surface speed"],
    },
    diagram: {
      image: "/studio/products/hope-rotor.webp",
      width: 904,
      height: 1194,
      anchors: { track: [13.5, 42.4], carrier: [49.8, 66.8], rivets: [45.9, 17.4], bolts: [55.9, 54.7] },
    },
  },
];

export const productById = (id: string) => products.find((p) => p.id === id);
