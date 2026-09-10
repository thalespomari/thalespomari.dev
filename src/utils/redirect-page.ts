// Gera o HTML de páginas de redirect estáticas para URLs antigas descontinuadas
// pela inversão de idioma padrão (task-001): meta refresh + fallback JS, com
// mensagem amigável enquanto o redirect acontece. GitHub Pages é hospedagem
// estática sem suporte nativo a redirects HTTP 301/302, daí a solução client-side.
//
// IMPORTANTE — NÃO criar `src/pages/about.html.ts` nem `src/pages/projects.html.ts`:
// a URL antiga de PT em `/about` e `/projects` (sem prefixo) é EXATAMENTE a
// mesma string que a nova URL canônica de EN (AC2 da história task-001) — não
// existe um redirect real a fazer ali, o conteúdo EN novo É o que deve
// aparecer. Confirmado empiricamente (`npm run preview` + curl) que hosts
// estáticos (sirv, e muito provavelmente GitHub Pages) resolvem uma
// requisição extensionless como `/about` priorizando um arquivo exato
// `about.html` sobre o diretório-índice `about/index.html` — ou seja, criar
// esse arquivo faz `/about` passar a redirecionar para `/pt/about` em vez de
// servir o conteúdo EN real, quebrando o AC2. Os outros redirects fixos
// (`/blog/index.html`, `/en/index.html`, `/en/about.html`, `/en/projects.html`)
// não têm esse problema — nenhuma rota real concorre com eles nesses paths.
export type RedirectLang = 'pt' | 'en';

interface RedirectPageOptions {
  lang: RedirectLang;
  target: string;
}

const COPY: Record<RedirectLang, { title: string; message: string; linkLabel: string }> = {
  pt: {
    title: 'Redirecionando…',
    message: 'Redirecionando para nova URL...',
    linkLabel: 'Clique aqui se não for redirecionado automaticamente',
  },
  en: {
    title: 'Redirecting…',
    message: 'Redirecting to new URL...',
    linkLabel: 'Click here if you are not redirected automatically',
  },
};

export function renderRedirectPage({ lang, target }: RedirectPageOptions): string {
  const copy = COPY[lang];
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${target}" />
    <title>${copy.title}</title>
    <script>window.location.replace(${JSON.stringify(target)});</script>
  </head>
  <body>
    <p>${copy.message} <a href="${target}">${copy.linkLabel}</a></p>
  </body>
</html>
`;
}
