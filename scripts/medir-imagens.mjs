// Mede as imagens externas (CDN do Behance) e guarda largura/altura em src/data/medidas.json.
// Sem isso a galeria modular não sabe a proporção de cada imagem. Imagens locais são medidas no build.
// Uso: node scripts/medir-imagens.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { imageSize } from 'image-size';

const PASTA = 'src/content/projetos';
const SAIDA = 'src/data/medidas.json';
const medidas = existsSync(SAIDA) ? JSON.parse(readFileSync(SAIDA, 'utf8')) : {};

const urls = new Set();
for (const arq of readdirSync(PASTA).filter((f) => f.endsWith('.md'))) {
  for (const u of readFileSync(join(PASTA, arq), 'utf8').match(/https:\/\/[^"\s]+\.(?:png|jpe?g|gif|webp)/gi) ?? []) urls.add(u);
}

let novas = 0;
for (const url of urls) {
  if (medidas[url]) continue;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.behance.net/' } });
  if (!r.ok) {
    console.warn(`falhou (${r.status}): ${url}`);
    continue;
  }
  const { width, height } = imageSize(new Uint8Array(await r.arrayBuffer()));
  medidas[url] = [width, height];
  novas++;
}
// só guarda o que ainda está em uso
for (const u of Object.keys(medidas)) if (!urls.has(u)) delete medidas[u];
writeFileSync(SAIDA, JSON.stringify(medidas, null, 1) + '\n');
console.log(`${urls.size} imagens externas, ${novas} medidas agora`);
