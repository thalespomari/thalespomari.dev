import type { APIRoute } from 'astro';
import { renderRedirectPage } from '../../utils/redirect-page';

// URL antiga: /en/about (EN prefixado). Novo destino: /about (EN sem prefixo).
export const GET: APIRoute = () =>
  new Response(renderRedirectPage({ lang: 'en', target: '/about' }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
