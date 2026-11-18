// srcset das imagens locais: lista as versões .sm/.min/.md.webp (scripts/otimizar-imagens.mjs) e o original,
// cada uma com a largura real. O navegador baixa a menor que ainda fica nítida na tela de quem visita.
import { existsSync, readFileSync } from 'node:fs';
import { imageSize } from 'image-size';

const cache = new Map<string, { w?: number; h?: number }>();

/** Largura e altura de um arquivo em public (vazio se não for local ou não existir). */
export function medidas(src: string) {
  if (!cache.has(src)) {
    let m: { w?: number; h?: number } = {};
    const caminho = `public${decodeURI(src.split('?')[0])}`;
    if (src.startsWith('/') && existsSync(caminho)) {
      try {
        const { width, height } = imageSize(readFileSync(caminho));
        m = { w: width, h: height };
      } catch {}
    }
    cache.set(src, m);
  }
  return cache.get(src)!;
}

/** srcset com as versões menores e o original; undefined quando não há versões. */
export function srcset(src: string) {
  if (!src.startsWith('/')) return undefined;
  const base = src.replace(/\.(webp|jpe?g|png)$/i, '');
  const opcoes = ['sm', 'min', 'md']
    .map((s) => `${base}.${s}.webp`)
    .filter((v) => medidas(v).w)
    .map((v) => ({ url: v, w: medidas(v).w! }));
  const original = medidas(src).w;
  if (original && !opcoes.some((o) => o.w >= original)) opcoes.push({ url: src, w: original });
  return opcoes.length > 1 ? opcoes.map((o) => `${o.url} ${o.w}w`).join(', ') : undefined;
}
