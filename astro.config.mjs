// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: process.env.GITHUB_PAGES_CUSTOM_DOMAIN_ACTIVE
    ? 'https://thalespomari.dev'
    : 'https://thalespomari.github.io',
  base: process.env.GITHUB_PAGES_CUSTOM_DOMAIN_ACTIVE ? '/' : '/thalespomari.dev/',
});
