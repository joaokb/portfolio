// Baixa para o repositório as imagens que ainda apontam para fora (ex.: CDN do Behance)
// e reescreve os caminhos nos arquivos de projeto. Roda pelo GitHub Actions.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const PASTA = 'src/content/projetos';
let total = 0;

for (const arq of readdirSync(PASTA).filter((f) => f.endsWith('.md'))) {
  const slug = arq.replace(/\.md$/, '');
  const caminho = join(PASTA, arq);
  let texto = readFileSync(caminho, 'utf8');
  const urls = [...new Set(texto.match(/https:\/\/[^"\s]+\.(?:png|jpe?g|gif|webp)/gi) || [])];
  if (!urls.length) continue;

  const destino = join('public/uploads/projetos', slug);
  mkdirSync(destino, { recursive: true });

  for (const url of urls) {
    const nome = url.split('/').pop().replace(/[^\w.-]/g, '');
    const local = join(destino, nome);
    if (!existsSync(local)) {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.behance.net/' } });
      if (!r.ok) {
        console.warn(`falhou (${r.status}): ${url}`);
        continue;
      }
      writeFileSync(local, Buffer.from(await r.arrayBuffer()));
      total++;
    }
    texto = texto.split(url).join(`/uploads/projetos/${slug}/${nome}`);
  }
  writeFileSync(caminho, texto);
  console.log(`${slug}: ${urls.length} imagens`);
}
console.log(`baixadas: ${total}`);
