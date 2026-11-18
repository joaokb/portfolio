// Mapa id -> destino lido pelo worker em /ir/<id>. Gerado no build a partir de src/data/links.json e dos cases.
import links from '../data/links.json';
import { publicados } from '../projetos';

export async function GET() {
  const destinos: Record<string, string> = {};
  for (const l of links.links) if (l.ativo && l.id && l.url) destinos[l.id] = l.url;
  for (const p of await publicados()) {
    destinos[`trabalho-${p.id}`] = `/projetos/${p.id}/`;
    destinos[`en-trabalho-${p.id}`] = `/en/projetos/${p.id}/`;
  }
  return new Response(JSON.stringify(destinos), { headers: { 'content-type': 'application/json' } });
}
