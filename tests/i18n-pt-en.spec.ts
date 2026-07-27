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

// Regressão do bug 002: title/meta description/og:* e conteúdo do blog
// continuavam hardcoded em inglês em rotas PT (BaseLayout recebia essas
// props sem tradução, e blog/index.astro + blog/[id].astro nunca foram
// tocados pela história 001).
// "MLOps" é termo técnico mantido igual em PT e EN por design — não entra
// nestas listas de detecção de idioma (falso-positivo, não é anglicismo
// incorreto).
const EN_METADATA_STRINGS = ['Data Engineer', 'Data engineering'];
const PT_METADATA_STRINGS = ['Engenheiro de Dados', 'Engenharia de dados'];

const EN_BLOG_STRINGS = [
  'Articles.',
  'Patterns, lessons',
  'No posts yet',
  'Articles are being written',
  'Back to Blog',
  'All Articles',
  'Work with me',
];

const PT_BLOG_STRINGS = ['Artigos', 'Padrões, lições'];

async function getMeta(page: import('@playwright/test').Page, attr: 'name' | 'property', value: string) {
  return page.locator(`meta[${attr}="${value}"]`).getAttribute('content');
}

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
    expect(containsCI(bodyText, '// About')).toBe(false);
    expect(containsCI(bodyText, '// Sobre')).toBe(true);
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

test.describe('PT routes — metadata', () => {
  for (const path of ['', 'about', 'projects', 'blog']) {
    test(`/${path} title and meta tags render in Portuguese`, async ({ page }) => {
      await page.goto(path);

      const title = await page.title();
      const description = await getMeta(page, 'name', 'description');
      const ogTitle = await getMeta(page, 'property', 'og:title');
      const ogDescription = await getMeta(page, 'property', 'og:description');

      for (const enString of EN_METADATA_STRINGS) {
        expect(
          containsCI(description ?? '', enString),
          `Expected English string "${enString}" NOT to be found in meta description of /${path}`
        ).toBe(false);
        expect(
          containsCI(ogDescription ?? '', enString),
          `Expected English string "${enString}" NOT to be found in og:description of /${path}`
        ).toBe(false);
      }

      expect(title.length, `Expected non-empty <title> for /${path}`).toBeGreaterThan(0);
      expect(description?.length ?? 0, `Expected non-empty meta description for /${path}`).toBeGreaterThan(0);
      expect(ogTitle?.length ?? 0, `Expected non-empty og:title for /${path}`).toBeGreaterThan(0);
      expect(ogDescription?.length ?? 0, `Expected non-empty og:description for /${path}`).toBeGreaterThan(0);
    });
  }

  test('/ title renders "Início"', async ({ page }) => {
    await page.goto('');
    expect(containsCI(await page.title(), 'Início')).toBe(true);
  });

  test('/about title renders "Sobre"', async ({ page }) => {
    await page.goto('about');
    expect(containsCI(await page.title(), 'Sobre')).toBe(true);
  });

  test('/projects title renders "Projetos"', async ({ page }) => {
    await page.goto('projects');
    expect(containsCI(await page.title(), 'Projetos')).toBe(true);
  });
});

test.describe('PT routes — blog content', () => {
  test('/blog does not render English strings and renders Portuguese content', async ({ page }) => {
    await page.goto('blog');
    const bodyText = await page.locator('body').innerText();

    for (const enString of EN_BLOG_STRINGS) {
      expect(
        containsCI(bodyText, enString),
        `Expected English string "${enString}" NOT to be found in /blog`
      ).toBe(false);
    }

    for (const ptString of PT_BLOG_STRINGS) {
      expect(containsCI(bodyText, ptString), `Expected "${ptString}" to be found in /blog`).toBe(true);
    }
  });

  test('/blog/welcome does not render English navigation strings and renders Portuguese equivalents', async ({ page }) => {
    await page.goto('blog/welcome');
    const bodyText = await page.locator('body').innerText();

    for (const enString of ['Back to Blog', 'All Articles', 'Work with me']) {
      expect(
        containsCI(bodyText, enString),
        `Expected English string "${enString}" NOT to be found in /blog/welcome`
      ).toBe(false);
    }

    expect(containsCI(bodyText, 'Voltar ao Blog')).toBe(true);
    expect(containsCI(bodyText, 'Todos os Artigos')).toBe(true);
    expect(containsCI(bodyText, 'Trabalhar comigo')).toBe(true);
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
    expect(containsCI(bodyText, '// Sobre')).toBe(false);
    expect(containsCI(bodyText, '// About')).toBe(true);
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

test.describe('EN routes — metadata (regression)', () => {
  for (const path of ['en', 'en/about', 'en/projects']) {
    test(`/${path} title and meta tags render in English`, async ({ page }) => {
      await page.goto(path);

      const title = await page.title();
      const description = await getMeta(page, 'name', 'description');
      const ogTitle = await getMeta(page, 'property', 'og:title');
      const ogDescription = await getMeta(page, 'property', 'og:description');

      for (const ptString of PT_METADATA_STRINGS) {
        expect(
          containsCI(description ?? '', ptString),
          `Expected Portuguese string "${ptString}" NOT to be found in meta description of /${path}`
        ).toBe(false);
        expect(
          containsCI(ogDescription ?? '', ptString),
          `Expected Portuguese string "${ptString}" NOT to be found in og:description of /${path}`
        ).toBe(false);
      }

      expect(title.length, `Expected non-empty <title> for /${path}`).toBeGreaterThan(0);
      expect(ogTitle?.length ?? 0, `Expected non-empty og:title for /${path}`).toBeGreaterThan(0);
    });
  }

  test('/en title renders "Home"', async ({ page }) => {
    await page.goto('en');
    expect(containsCI(await page.title(), 'Home')).toBe(true);
  });

  test('/en/about title renders "About"', async ({ page }) => {
    await page.goto('en/about');
    expect(containsCI(await page.title(), 'About')).toBe(true);
  });

  test('/en/projects title renders "Projects"', async ({ page }) => {
    await page.goto('en/projects');
    expect(containsCI(await page.title(), 'Projects')).toBe(true);
  });
});
