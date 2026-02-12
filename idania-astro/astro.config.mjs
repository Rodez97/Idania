import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.PUBLIC_BASE_URL || 'http://localhost:4321',
  output: 'server',
  adapter: vercel(),
  compressHTML: true,
});
