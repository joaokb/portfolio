// Procura trabalhos novos no feed RSS público do Behance e cria um rascunho para cada um que ainda não está no site.
// Repetido = já existe um case cujo campo `behance` tem o mesmo número de galeria.
// O rascunho entra com `draft: true`: só aparece no site depois que João revisar no /admin.
// O feed traz só título, link e a capa; as imagens e o texto do case são adicionados no /admin.
// Uso: node scripts/behance-novos.mjs [usuario]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const USUARIO = process.argv[2] ?? 'joaokavalchuk';
const PASTA = 'src/content/projetos';

const r = await fetch(`https://www.behance.net/feeds/user?username=${encodeURIComponent(USUARIO)}`, {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
if (!r.ok) throw new Error(`feed do Behance respondeu ${r.status}`);
const xml = await r.text();

const cdata = (s) => s?.replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() ?? '';
const itens = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => ({
  titulo: cdata(it.match(/<title>([\s\S]*?)<\/title>/)?.[1]),
  link: cdata(it.match(/<link>([\s\S]*?)<\/link>/)?.[1]),
  capa: it.match(/<img src='([^']+)'/)?.[1] ?? '',
  data: new Date(cdata(it.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1])),
}));

const idDe = (url) => url.match(/behance\.net\/gallery\/(\d+)/)?.[1];
const existentes = new Set(
  readdirSync(PASTA)
    .filter((f) => f.endsWith('.md'))
    .map((f) => idDe(readFileSync(join(PASTA, f), 'utf8').match(/^behance:\s*"?([^"\n]+)/m)?.[1] ?? ''))
    .filter(Boolean),
);

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

let novos = 0;
for (const it of itens) {
  const id = idDe(it.link);
  if (!id || existentes.has(id)) continue;
  let nome = slug(it.titulo) || `behance-${id}`;
  if (existsSync(join(PASTA, `${nome}.md`))) nome = `${nome}-${id}`;
  const ano = Number.isNaN(it.data.getTime()) ? new Date().getFullYear() : it.data.getFullYear();
  const md = `---
title: ${JSON.stringify(it.titulo)}
client: ""
year: ${ano}
discipline: ""
context: ""
award: ""
role: "Direção de arte"
credits: []
order: 99
cover: ${JSON.stringify(it.capa)}
images: []
video: ""
behance: ${JSON.stringify(it.link)}
draft: true
---

Rascunho criado do feed do Behance. Escreva o texto do case, adicione as imagens no /admin e desmarque "Rascunho" para publicar.
`;
  writeFileSync(join(PASTA, `${nome}.md`), md);
  existentes.add(id);
  novos++;
  console.log(`novo rascunho: ${nome} (${it.link})`);
}
console.log(`${itens.length} trabalhos no feed, ${novos} novos`);
