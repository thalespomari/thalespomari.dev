import { test, expect } from '@playwright/test';

// Regressão do bug 001: rotas PT não podem exibir strings hardcoded em
// inglês (nav, footer, aria-labels, bio, CTA, seção projects), e rotas EN
// precisam continuar corretas (nenhuma string PT vazando para EN).
//
// Comparações são case-insensitive: alguns rótulos (status do projeto,
// "// Key Features") são estilizados com `text-transform: uppercase` via
// CSS, então innerText() os retorna em maiúsculas mesmo com o markup HTML
// em case misto — isso é apresentação visual, não um problema de tradução.

function containsCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

const EN_STRINGS = [
  'Toggle dark mode',
  'Toggle menu',
  'Built with Astro',
  "Let's build something",
  'Available for data engineering',
  'Get in Touch',
  "What I've built",
  'Hands-on projects in data infrastructure',
  '// Key Features',
  '// More coming',
  'More projects will be documented here',
  'Distributed async job processing with RAG pipeline',
  'In Progress',
  'Async REST API with FastAPI',
  'Redis as state store + job queue',
];

const PT_STRINGS = [
  'Ativar modo escuro',
  'Alternar menu',
  'Construído com Astro',
  'Vamos construir algo',
  'Disponível para projetos de engenharia de dados',
  'Entrar em Contato',
  'O que construí',
  'Projetos práticos em infraestrutura de dados',
  '// Principais Funcionalidades',
  '// Mais em breve',
  'Mais projetos serão documentados aqui',
  'Processamento assíncrono e distribuído de jobs com pipeline RAG',
  'Em Andamento',
  'API REST assíncrona com FastAPI',
  'Redis como state store + fila de jobs',
];

const PT_NAV_STRINGS = ['Início', 'Sobre', 'Projetos', 'Blog', 'Contato'];
const EN_NAV_STRINGS = ['Home', 'About', 'Projects', 'Blog', 'Contact'];

// page.goto() resolves a leading "/" against the origin, discarding the
// "/thalespomari.dev/" base path baked into baseURL by astro.config.mjs's
// GitHub Pages fallback. Paths must be relative (no leading slash) so they
// compose with baseURL instead of overriding it.
test.describe('PT routes (default locale, no prefix)', () => {
  for (const path of ['', 'about', 'projects']) {
    test(`/${path} does not render English strings`, async ({ page }) => {
      await page.goto(path);
      const bodyText = await page.locator('body').innerText();

      for (const enString of EN_STRINGS) {
        expect(
          containsCI(bodyText, enString),
          `Expected English string "${enString}" NOT to be found in PT route /${path}`
        ).toBe(false);
      }
    });
  }

  test('/ nav and aria-labels render in Portuguese', async ({ page }) => {
    await page.goto('');
    const bodyText = await page.locator('body').innerText();

    for (const ptString of PT_NAV_STRINGS) {
      expect(containsCI(bodyText, ptString), `Expected "${ptString}" to be found in nav`).toBe(true);
    }

    await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-label', 'Ativar modo escuro');
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-label', 'Alternar menu');
  });

  test('/about renders Portuguese bio and CTA', async ({ page }) => {
    await page.goto('about');
    const bodyText = await page.locator('body').innerText();

    expect(bodyText).toContain('Vamos construir algo');
    expect(bodyText).toContain('Disponível para projetos de engenharia de dados');
    expect(containsCI(bodyText, 'Entrar em Contato')).toBe(true);
  });

  test('/projects renders Portuguese heading and content', async ({ page }) => {
    await page.goto('projects');
    const bodyText = await page.locator('body').innerText();

    for (const ptString of PT_STRINGS.slice(6)) {
      expect(containsCI(bodyText, ptString), `Expected "${ptString}" to be found in /projects`).toBe(true);
    }
  });

  test('/ footer renders in Portuguese', async ({ page }) => {
    await page.goto('');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('Construído com Astro');
  });
});

test.describe('EN routes (/en prefix) — no regression', () => {
  for (const path of ['en', 'en/about', 'en/projects']) {
    test(`/${path} does not render Portuguese strings`, async ({ page }) => {
      await page.goto(path);
      const bodyText = await page.locator('body').innerText();

      for (const ptString of PT_STRINGS) {
        expect(
          containsCI(bodyText, ptString),
          `Expected Portuguese string "${ptString}" NOT to be found in EN route /${path}`
        ).toBe(false);
      }
    });
  }

  test('/en nav and aria-labels render in English', async ({ page }) => {
    await page.goto('en');
    const bodyText = await page.locator('body').innerText();

    for (const enString of EN_NAV_STRINGS) {
      expect(containsCI(bodyText, enString), `Expected "${enString}" to be found in nav`).toBe(true);
    }

    await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-label', 'Toggle dark mode');
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-label', 'Toggle menu');
  });

  test('/en/about renders English bio and CTA', async ({ page }) => {
    await page.goto('en/about');
    const bodyText = await page.locator('body').innerText();

    expect(bodyText).toContain("Let's build something");
    expect(bodyText).toContain('Available for data engineering');
    expect(containsCI(bodyText, 'Get in Touch')).toBe(true);
  });

  test('/en/projects renders English heading and content', async ({ page }) => {
    await page.goto('en/projects');
    const bodyText = await page.locator('body').innerText();

    for (const enString of EN_STRINGS.slice(6)) {
      expect(containsCI(bodyText, enString), `Expected "${enString}" to be found in /en/projects`).toBe(true);
    }
  });

  test('/en footer renders in English', async ({ page }) => {
    await page.goto('en');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('Built with Astro');
  });
});
