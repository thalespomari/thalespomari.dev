import type { APIRoute } from 'astro';
import { renderRedirectPage } from '../../utils/redirect-page';

// URL antiga: /en/ (EN prefixado). Novo destino: / (EN é o default sem prefixo).
export const GET: APIRoute = () =>
  new Response(renderRedirectPage({ lang: 'en', target: '/' }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
