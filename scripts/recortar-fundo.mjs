// Tira o fundo liso (branco ou de uma cor só) de fotos de produto e padroniza o enquadramento.
// O fundo é a área de cor parecida com a dos cantos e ligada às bordas (preenchimento a partir das bordas),
// então brilhos claros dentro do objeto ficam. Depois corta a sobra e centraliza num quadrado de 1200 px, em WebP.
// Uso: node scripts/recortar-fundo.mjs <entrada> <saída.webp> [tolerância=26]
import sharp from 'sharp';

const [, , entrada, saida, tol = '26'] = process.argv;
const TOL = Number(tol);
const { data, info } = await sharp(entrada).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (x, y) => (y * W + x) * 4;

// cor do fundo: média dos quatro cantos
const cantos = [px(2, 2), px(W - 3, 2), px(2, H - 3), px(W - 3, H - 3)];
const fundo = [0, 1, 2].map((c) => cantos.reduce((s, i) => s + data[i + c], 0) / 4);
const dist = (i) => Math.hypot(data[i] - fundo[0], data[i + 1] - fundo[1], data[i + 2] - fundo[2]);

// imagem que já chega sem fundo (cantos transparentes): só padroniza o enquadramento
const jaRecortada = cantos.every((i) => data[i + 3] < 10);
const visto = new Uint8Array(W * H);
const fila = [];
// recorte por IA deixa restos quase transparentes do cenário: some com eles
if (jaRecortada) for (let i = 3; i < data.length; i += 4) if (data[i] < 170) data[i] = 0;
if (!jaRecortada) {
  for (let x = 0; x < W; x++) fila.push([x, 0], [x, H - 1]);
  for (let y = 0; y < H; y++) fila.push([0, y], [W - 1, y]);
}
while (fila.length) {
  const [x, y] = fila.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const k = y * W + x;
  if (visto[k]) continue;
  const i = k * 4;
  const d = dist(i);
  if (d > TOL * 1.6) continue;
  visto[k] = 1;
  // borda suave: perto do limite fica semitransparente
  data[i + 3] = d < TOL ? 0 : Math.round(255 * ((d - TOL) / (TOL * 0.6)));
  if (d < TOL) fila.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

const recorte = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
const justo = await sharp(recorte).trim({ threshold: 1 }).toBuffer();
// o objeto ocupa até 82% do quadrado, centralizado
const alvo = Math.round(1200 * 0.82);
const objeto = await sharp(justo).resize({ width: alvo, height: alvo, fit: 'inside' }).toBuffer();
const m = await sharp(objeto).metadata();
await sharp({ create: { width: 1200, height: 1200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: objeto, left: Math.round((1200 - m.width) / 2), top: Math.round((1200 - m.height) / 2) }])
  .webp({ quality: 86, alphaQuality: 90 })
  .toFile(saida);
console.log(`${saida}: fundo rgb(${fundo.map(Math.round).join(',')}), objeto ${m.width}x${m.height}`);
