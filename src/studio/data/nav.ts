/**
 * The header's dropdown menus (English site; the pages they link to are English only). Built from
 * what the pages already say, so the menu and the pages keep the same names: the product lines
 * (i18n platform.modules), the use-case pages (studio/data/solutions.ts), the case study and the
 * demo breakdowns (studio/data/products.ts). Each item carries a preview for the menu's card.
 */
import { demoLink } from "@/studio/config";
import { caseStudy } from "@/studio/data/caseStudy";
import { shot } from "@/studio/data/devices";
import { products } from "@/studio/data/products";
import { solutions } from "@/studio/data/solutions";
import { en } from "@/studio/i18n/en";
import { withBase } from "@/lib/paths";

export interface MenuItem {
  label: string;
  /** Second line under the label. */
  note?: string;
  href: string;
  external?: boolean;
  /** The card: picture (or an icon when there is none), small label, line of text. */
  image?: string;
  icon?: string;
  eyebrow: string;
  text: string;
}

export interface MenuColumn {
  title: string;
  icon: string;
  items: MenuItem[];
  all?: { label: string; href: string };
}

export interface Menu {
  id: string;
  label: string;
  columns: MenuColumn[];
}

const home = withBase("/");
const m = en.platform.modules;
const status = en.platform.status;
const useCase = (scene: "embed" | "website" | "tradeshow") => {
  const solution = solutions.find((s) => s.scene === scene)!;
  const item = en.scenarios.items.find((i) => i.id === scene)!;
  return {
    label: item.title,
    note: solution.name,
    href: withBase(`/${solution.slug}/`),
    image: shot(solution.device, solution.view),
    eyebrow: en.nav.menus.useCase,
    text: item.where,
  } satisfies MenuItem;
};

export const menus: Menu[] = [
  {
    id: "products",
    label: en.nav.products,
    columns: [
      {
        title: en.nav.menus.productLines,
        icon: "cube",
        items: [
          {
            label: m.showcase.name,
            note: m.showcase.kind,
            href: withBase("/showcase/"),
            image: shot("worm-gearbox", "xray"),
            eyebrow: status.available,
            text: m.showcase.text,
          },
          {
            label: m.configurator.name,
            note: m.configurator.kind,
            href: demoLink("iso-cylinder", { view: "configure", lang: "en" }) || `${home}#product-configurator`,
            external: Boolean(demoLink()),
            image: "/studio/demos/iso-cylinder-card.webp",
            eyebrow: status.new,
            text: m.configurator.text,
          },
          {
            label: m.service.name,
            note: m.service.kind,
            href: `${home}#product-service`,
            icon: "gear",
            eyebrow: status.future,
            text: m.service.text,
          },
        ],
        all: { label: en.nav.menus.allProducts, href: `${home}#solutions` },
      },
      {
        title: en.nav.menus.getStarted,
        icon: "target",
        items: [
          {
            label: en.nav.demos,
            note: en.nav.menus.demosNote,
            href: `${home}#demos`,
            image: "/studio/demos/pump-set-card.webp",
            eyebrow: en.nav.menus.getStarted,
            text: en.demos.title,
          },
          {
            label: en.nav.menus.pricing,
            note: en.nav.menus.pricingNote,
            href: `${home}#pricing`,
            icon: "sliders",
            eyebrow: en.nav.menus.getStarted,
            text: en.pricing.title,
          },
          {
            label: en.nav.menus.process,
            note: en.nav.menus.processNote,
            href: `${home}#process`,
            icon: "play",
            eyebrow: en.nav.menus.getStarted,
            text: en.process.title,
          },
        ],
      },
    ],
  },
  {
    id: "solutions",
    label: en.nav.solutions,
    columns: [
      {
        title: en.nav.menus.byUseCase,
        icon: "screens",
        items: [useCase("embed"), useCase("website"), useCase("tradeshow")],
        all: { label: en.nav.menus.allUseCases, href: `${home}#use-cases` },
      },
      {
        title: en.nav.menus.caseStudies,
        icon: "box",
        items: [
          {
            label: caseStudy.name,
            note: caseStudy.badge,
            href: withBase(`/case-study/${caseStudy.slug}/`),
            image: caseStudy.image,
            eyebrow: en.nav.menus.caseStudy,
            text: caseStudy.question,
          },
          ...products.map((p) => ({
            label: p.name,
            note: en.demos.page,
            href: withBase(`/showcase/${p.id}/`),
            image: shot(p.id, "exploded"),
            eyebrow: en.demos.page,
            text: p.tagline,
          })),
        ],
        all: { label: en.nav.menus.allDemos, href: `${home}#demos` },
      },
    ],
  },
];
