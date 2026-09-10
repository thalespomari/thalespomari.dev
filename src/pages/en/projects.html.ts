import type { APIRoute } from 'astro';
import { renderRedirectPage } from '../../utils/redirect-page';

// URL antiga: /en/projects (EN prefixado). Novo destino: /projects (EN sem prefixo).
export const GET: APIRoute = () =>
  new Response(renderRedirectPage({ lang: 'en', target: '/projects' }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
