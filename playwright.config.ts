import { defineConfig, devices } from '@playwright/test';

// Espelha a mesma condicional de astro.config.mjs: com
// GITHUB_PAGES_CUSTOM_DOMAIN_ACTIVE setado (como no build de produção do
// workflow de deploy), `base` é '/'; sem a env var (ambiente local), usa o
// fallback do GitHub Pages ('/thalespomari.dev/'), embutido em todos os
// links renderizados. baseURL precisa refletir esse prefixo para que
// goto('/') e os asserts de conteúdo apontem para as rotas reais.
const PORT = 4321;
const BASE_PATH = process.env.GITHUB_PAGES_CUSTOM_DOMAIN_ACTIVE ? '/' : '/thalespomari.dev/';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE_PATH}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
