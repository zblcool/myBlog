/// <reference types="astro/client" />

/** Ashmartisan wiring (src/studio/config.ts). All optional; see .env.example. */
interface ImportMetaEnv {
  readonly PUBLIC_DEMO_URL?: string;
  readonly PUBLIC_FORM_ENDPOINT?: string;
  readonly PUBLIC_FORM_ACCESS_KEY?: string;
  readonly PUBLIC_ANALYTICS_DOMAIN?: string;
  readonly PUBLIC_ANALYTICS_HOST?: string;
}
