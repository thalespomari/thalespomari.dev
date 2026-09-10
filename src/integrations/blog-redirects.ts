import type { AstroIntegration } from 'astro';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderRedirectPage } from '../utils/redirect-page';

// Gera um arquivo de redirect estático (/blog/<slug>.html -> /pt/blog/<slug>)
// para cada post da coleção "blog", depois do build principal.
//
// Implementado como hook astro:build:done (em vez de uma rota dinâmica
// [slug].html.ts) porque o roteador do Astro não resolve corretamente um
// segmento dinâmico com sufixo literal colado em arquivos de endpoint
// ([slug].html) nem em variações com rest param — o parâmetro se perde na
// geração de rotas estáticas ("Missing parameter" / "NoMatchingStaticPathFound").
// Escrever os arquivos diretamente no diretório de saída contorna essa
// limitação sem depender do módulo virtual "astro:content" (não resolvível
// fora do pipeline Vite do Astro) — os slugs são derivados direto dos nomes
// de arquivo em src/content/blog/, espelhando a convenção do loader `glob`
// configurado em content.config.ts (id = caminho relativo sem extensão).
const BLOG_CONTENT_DIR = fileURLToPath(new URL('../content/blog/', import.meta.url));

// "index" é reservado: src/pages/blog/index.html.ts já gera dist/blog/index.html
// (redirect fixo /blog -> /pt/blog). Um post com slug "index" (arquivo
// src/content/blog/index.md — permitido pelo schema Zod, que não restringe
// nomes de arquivo) sobrescreveria esse arquivo silenciosamente. Descartado
// aqui em vez de lançar erro para não quebrar o build por causa de um post;
// se isso acontecer, o post fica sem redirect próprio (aceitável — é o único
// slug afetado, dado que nenhum outro path reservado existe sob /blog/).
const RESERVED_SLUGS = new Set(['index']);

async function listMarkdownSlugs(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const slugs: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      slugs.push(...(await listMarkdownSlugs(path.join(dir, entry.name), `${prefix}${entry.name}/`)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      slugs.push(`${prefix}${entry.name.slice(0, -'.md'.length)}`);
    }
  }

  return slugs.filter((slug) => !RESERVED_SLUGS.has(slug));
}

export function blogRedirects(): AstroIntegration {
  return {
    name: 'blog-redirects',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const slugs = await listMarkdownSlugs(BLOG_CONTENT_DIR);
        const outDir = path.join(fileURLToPath(dir), 'blog');
        await mkdir(outDir, { recursive: true });

        await Promise.all(
          slugs.map((slug) =>
            writeFile(
              path.join(outDir, `${slug}.html`),
              renderRedirectPage({ lang: 'pt', target: `/pt/blog/${slug}` }),
              'utf-8'
            )
          )
        );

        logger.info(`blog-redirects: ${slugs.length} redirect(s) gerado(s) em dist/blog/*.html`);
      },
    },
  };
}
