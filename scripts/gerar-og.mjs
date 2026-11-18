// Gera public/og.png, a miniatura que aparece quando o link do site é compartilhado (WhatsApp, LinkedIn, Instagram).
// Usa o Edge sem janela para fotografar um HTML com as fontes e a foto do próprio site.
// Composição pensada para cortes: tudo o que importa fica no quadrado central de 630x630,
// porque o WhatsApp e o Instagram mostram a miniatura cortada em quadrado.
// Uso (Windows, na pasta do projeto): node scripts/gerar-og.mjs
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const perfil = JSON.parse(readFileSync('src/data/perfil.json', 'utf8'));
const destaques = JSON.parse(readFileSync('src/data/destaques.json', 'utf8'));
const cor = destaques[perfil.destaque] ?? destaques.caneta;
const url = (p) => pathToFileURL(resolve(p)).href;
const [nome, ...sobrenome] = perfil.nome.toUpperCase().split(' ');

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
if (!EDGE) throw new Error('Microsoft Edge não encontrado');

// a do meio fica no centro exato, que sobrevive ao corte quadrado
const faixa = ['Campanhas', 'Key visual', 'Diretor de arte', 'Identidade visual', 'Branding']
  .map((t) => `<span>${t}</span>`)
  .join('<i></i>');

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:BS;src:url(${url('node_modules/@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#e4e5e0;color:#000;font-family:BS,sans-serif}
.topo{position:absolute;top:0;left:0;right:0;height:22px;background:${cor}}
.bloco{position:absolute;left:50%;top:128px;translate:-50% 0;display:flex;align-items:center;gap:28px}
.moldura{border:7px solid ${cor};line-height:0}
.foto{width:232px;height:232px;object-fit:cover;object-position:50% 30%;filter:grayscale(1) contrast(1.05)}
h1{font-size:108px;line-height:.84;text-transform:uppercase;letter-spacing:-.5px}
h1 b{display:block;font-weight:850}
h1 span{display:block;font-weight:280}
.faixa{position:absolute;left:0;right:0;bottom:0;height:150px;background:${cor};color:#e4e5e0;display:flex;align-items:center;justify-content:center;gap:28px;white-space:nowrap;font-size:46px;font-weight:700;text-transform:uppercase}
.faixa i{width:14px;height:14px;border-radius:50%;background:#e4e5e0;flex:none}
</style>
<div class="topo"></div>
<div class="bloco"><div class="moldura"><img class="foto" src="${url('public' + perfil.foto)}"></div><h1><b>${nome}</b><span>${sobrenome.join(' ')}</span></h1></div>
<div class="faixa">${faixa}</div>`;

const pasta = mkdtempSync(join(tmpdir(), 'og-'));
const pagina = join(pasta, 'og.html');
writeFileSync(pagina, html);
execFileSync(EDGE, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=3000',
  `--screenshot=${resolve('public/og.png')}`,
  pathToFileURL(pagina).href,
]);
console.log(`public/og.png gerado com a cor ${cor}`);
