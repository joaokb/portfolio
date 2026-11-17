// Deixa as imagens dos cases leves para a web e cria miniaturas para o índice e a faixa da home.
// - PNG/JPG em public/uploads/projetos viram WebP (até 2000px de largura) e os .md passam a apontar para eles.
// - Cada imagem ganha uma miniatura "<nome>.min.webp" de 640px, usada nas prévias da home.
// Uso: node scripts/otimizar-imagens.mjs (rodar depois de importar-imagens.mjs ou de subir imagens novas)
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const RAIZ = 'public/uploads/projetos';
const PASTA_MD = 'src/content/projetos';
const arquivos = [];
const andar = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? andar(join(d, f)) : arquivos.push(join(d, f))));
andar(RAIZ);

const url = (p) => '/' + relative('public', p).split('\\').join('/');
const trocas = new Map();
let convertidas = 0;
let miniaturas = 0;

for (const arq of arquivos) {
  if (/\.min\.webp$/.test(arq) || !/\.(png|jpe?g|webp)$/i.test(arq)) continue;
  let final = arq;
  if (!/\.webp$/i.test(arq)) {
    final = arq.replace(/\.(png|jpe?g)$/i, '.webp');
    await sharp(arq, { limitInputPixels: false })
      .rotate()
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(final);
    unlinkSync(arq);
    trocas.set(url(arq), url(final));
    convertidas++;
  }
  const mini = final.replace(/\.webp$/i, '.min.webp');
  if (!existsSync(mini)) {
    await sharp(final).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 78 }).toFile(mini);
    miniaturas++;
  }
}

if (trocas.size) {
  for (const md of readdirSync(PASTA_MD).filter((f) => f.endsWith('.md'))) {
    const p = join(PASTA_MD, md);
    const antes = readFileSync(p, 'utf8');
    let depois = antes;
    for (const [de, para] of trocas) depois = depois.split(de).join(para);
    if (depois !== antes) writeFileSync(p, depois);
  }
}
console.log(`${convertidas} convertidas para WebP, ${miniaturas} miniaturas criadas`);
