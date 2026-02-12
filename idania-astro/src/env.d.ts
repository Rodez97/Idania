/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly PUBLIC_BASE_URL: string;
  readonly SESSION_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };
  }
}