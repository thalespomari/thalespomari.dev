import type { APIRoute } from 'astro';
import { renderRedirectPage } from '../../utils/redirect-page';

// URL antiga: /blog (PT, sem prefixo). Novo destino: /pt/blog. Sem conflito
// com nenhuma rota real: blog é exclusivo em PT e vive só em /pt/blog agora,
// não há mais nada gerado em /blog para EN.
export const GET: APIRoute = () =>
  new Response(renderRedirectPage({ lang: 'pt', target: '/pt/blog' }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
