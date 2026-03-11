// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://thalespomari.dev',
  base: process.env.GITHUB_ACTIONS ? '/thalespomari.dev' : '/',
});
