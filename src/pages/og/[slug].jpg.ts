// Miniatura de compartilhamento de cada case (WhatsApp, LinkedIn, Instagram): JPG 1200x630 cortado da capa,
// gerado no build. Esses apps não leem caminho relativo e costumam ignorar WebP grande, por isso não usamos a capa direto.
import type { APIRoute } from 'astro';
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { publicados } from '../../projetos';

export async function getStaticPaths() {
  return (await publicados())
    .filter((p) => existsSync(`public${decodeURI(p.data.cover)}`))
    .map((p) => ({ params: { slug: p.id }, props: { capa: p.data.cover } }));
}

export const GET: APIRoute = async ({ props }) => {
  const arquivo = readFileSync(`public${decodeURI(props.capa as string)}`);
  const { width = 1, height = 1 } = await sharp(arquivo).metadata();
  // capa mais "alta" que o 1.9:1 da miniatura (board A3, cartaz): corta pelo topo, onde costuma estar o título;
  // capa larga: o sharp escolhe a área mais interessante
  const jpg = await sharp(arquivo)
    .resize(1200, 630, { fit: 'cover', position: width / height < 1.6 ? 'north' : 'attention' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
