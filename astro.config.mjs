// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: process.env.GITHUB_PAGES_CUSTOM_DOMAIN_ACTIVE
    ? 'https://thalespomari.dev'
    : 'https://thalespomari.github.io',
  base: process.env.GITHUB_PAGES_CUSTOM_DOMAIN_ACTIVE ? '/' : '/thalespomari.dev/',
  // Convenção bilíngue: EN é o idioma default e fica sem prefixo (ex: /about),
  // PT usa prefixo explícito (ex: /pt/about). Locales fora desta lista (ex: /fr/about)
  // não têm rota gerada e resultam em 404 automático do Astro.
  i18n: {
    locales: ['pt', 'en'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
