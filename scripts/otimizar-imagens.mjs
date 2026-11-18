// Deixa as imagens leves para a web e cria versões menores para o navegador escolher pelo tamanho da tela.
// - PNG/JPG em public/uploads/projetos viram WebP (até 2000px) e os .md passam a apontar para eles.
// - Toda imagem em public/uploads (cases e a foto do perfil) ganha versões WebP:
//     <nome>.sm.webp 320px, <nome>.min.webp 640px e <nome>.md.webp 1200px (só se o original for maior).
//   O site lista essas versões no srcset (src/imagens.ts); o original continua sendo a maior opção.
// Uso: node scripts/otimizar-imagens.mjs (depois de importar-imagens.mjs ou de subir imagens novas)
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const RAIZ = 'public/uploads';
const PROJETOS = 'public/uploads/projetos';
const PASTA_MD = 'src/content/projetos';
const VARIANTES = { sm: 320, min: 640, md: 1200 };
const ehVariante = (f) => /\.(sm|min|md)\.webp$/i.test(f);

const arquivos = [];
const andar = (d) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? andar(join(d, f)) : arquivos.push(join(d, f))));
andar(RAIZ);

const url = (p) => '/' + relative('public', p).split('\\').join('/');
const trocas = new Map();
let convertidas = 0;
let criadas = 0;

for (const arq of arquivos) {
  if (ehVariante(arq) || !/\.(png|jpe?g|webp)$/i.test(arq)) continue;
  let final = arq;
  // cases: o próprio original vira WebP
  if (arq.startsWith(PROJETOS.split('/').join('\\')) || arq.startsWith(PROJETOS)) {
    if (!/\.webp$/i.test(arq)) {
      final = arq.replace(/\.(png|jpe?g)$/i, '.webp');
      await sharp(arq, { limitInputPixels: false }).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(final);
      unlinkSync(arq);
      trocas.set(url(arq), url(final));
      convertidas++;
    }
  }
  const { width } = await sharp(final).metadata();
  const base = final.replace(/\.(png|jpe?g|webp)$/i, '');
  for (const [sufixo, largura] of Object.entries(VARIANTES)) {
    const alvo = `${base}.${sufixo}.webp`;
    // a 640 sempre existe (é a miniatura da home); as outras só quando menores que o original
    if (existsSync(alvo) || (sufixo !== 'min' && width <= largura)) continue;
    await sharp(final).rotate().resize({ width: largura, withoutEnlargement: true }).webp({ quality: sufixo === 'sm' ? 76 : 78 }).toFile(alvo);
    criadas++;
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
console.log(`${convertidas} convertidas para WebP, ${criadas} versões menores criadas`);
