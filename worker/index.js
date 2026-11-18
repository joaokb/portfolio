// Worker do site: tudo é estático, exceto
//   /ir/<id>      conta o clique e redireciona para o destino (lista em /links-destinos.json, gerada no build)
//   /ir/_visita   recebe o aviso de visita enviado pela página /links (POST)
//   /numeros      página privada com visitas e cliques por mês (senha no secret SENHA_NUMEROS)
// Contagem fica no KV CLIQUES, chave "n:<AAAA-MM>:<id>", com o número também nos metadados para listar sem ler um por um.

const ROBO = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|slurp|curl|wget/i;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/ir/')) return ir(req, env, ctx, url);
    if (url.pathname.replace(/\/$/, '') === '/numeros') return numeros(req, env);
    return env.ASSETS.fetch(req);
  },
};

const mes = () => new Date().toISOString().slice(0, 7);

async function contar(env, id) {
  // shortcut: ler e gravar no KV não é atômico; dois cliques no mesmo instante podem contar um. Serve para volume de bio.
  const chave = `n:${mes()}:${id}`;
  const atual = Number((await env.CLIQUES.get(chave)) ?? 0) + 1;
  await env.CLIQUES.put(chave, String(atual), { metadata: { n: atual } });
}

async function ir(req, env, ctx, url) {
  const id = decodeURIComponent(url.pathname.slice(4).replace(/\/$/, ''));
  const robo = ROBO.test(req.headers.get('user-agent') ?? '');

  if (id === '_visita') {
    if (req.method === 'POST' && !robo) ctx.waitUntil(contar(env, '_visita'));
    return new Response(null, { status: 204 });
  }

  const destinos = await (await env.ASSETS.fetch(new Request(new URL('/links-destinos.json', url)))).json();
  const destino = destinos[id];
  if (!destino) return Response.redirect(new URL('/links/', url), 302);
  if (!robo) ctx.waitUntil(contar(env, id));
  return Response.redirect(new URL(destino, url), 302);
}

// compara sem revelar pelo tempo de resposta quantos caracteres batem
function iguais(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let dif = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) dif |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return dif === 0;
}

function senhaOk(req, env) {
  if (!env.SENHA_NUMEROS) return false;
  const [tipo, valor] = (req.headers.get('authorization') ?? '').split(' ');
  if (tipo !== 'Basic' || !valor) return false;
  let texto = '';
  try {
    texto = atob(valor);
  } catch {
    return false;
  }
  return iguais(texto.slice(texto.indexOf(':') + 1), env.SENHA_NUMEROS);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

async function numeros(req, env) {
  if (!senhaOk(req, env)) {
    return new Response('Acesso restrito.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Numeros", charset="UTF-8"', 'cache-control': 'no-store' },
    });
  }

  const linhas = {};
  let cursor;
  do {
    const r = await env.CLIQUES.list({ prefix: 'n:', cursor });
    for (const k of r.keys) {
      const [, m, id] = k.name.split(':');
      (linhas[m] ??= {})[id] = k.metadata?.n ?? 0;
    }
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);

  const meses = Object.keys(linhas).sort().reverse();
  const tabelas = meses
    .map((m) => {
      const { _visita = 0, ...cliques } = linhas[m];
      const total = Object.values(cliques).reduce((s, n) => s + n, 0);
      const itens = Object.entries(cliques)
        .sort((a, b) => b[1] - a[1])
        .map(([id, n]) => `<tr><td>${esc(id)}</td><td>${n}</td></tr>`)
        .join('');
      return `<h2>${esc(m)}</h2><p>${_visita} visitas na página de links, ${total} cliques</p><table>${itens}</table>`;
    })
    .join('');

  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Números da página de links</title>
<style>body{font:16px/1.5 system-ui,sans-serif;background:#e4e5e0;color:#000;max-width:36rem;margin:0 auto;padding:2rem 1rem}
h1{font-size:1.6rem;margin:0 0 1.5rem}h2{font-size:1.1rem;margin:2rem 0 .25rem}p{color:#5b5d57;margin:0 0 .5rem}
table{width:100%;border-collapse:collapse}td{padding:.45rem 0;border-bottom:1px solid #bfc1ba}td:last-child{text-align:right;font-variant-numeric:tabular-nums}</style>
<h1>Números da página de links</h1>${tabelas || '<p>Nenhuma visita ou clique registrado ainda.</p>'}</html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
