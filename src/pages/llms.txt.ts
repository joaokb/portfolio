// /llms.txt: resumo do site em texto puro para buscadores de IA (formato llmstxt.org).
// Montado no build a partir de perfil.json e dos cases, então acompanha o que é editado no /admin.
import type { APIRoute } from 'astro';
import perfil from '../data/perfil.json';
import { publicados } from '../projetos';
import { textoPerfil } from '../i18n';

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const cases = (await publicados()).map(
    ({ id, data: d }) =>
      `- [${d.title}](${url(`/projetos/${id}/`)}): ${d.discipline}, ${d.client}, ${d.year}.` +
      (d.context ? ` ${d.context}.` : '') +
      (d.award ? ` ${d.award}.` : ''),
  );
  const texto = [
    `# ${perfil.nome}, ${perfil.cargo.toLowerCase()} e designer gráfico em ${perfil.cidade}`,
    '',
    `> ${perfil.bio}`,
    '',
    `- Cidade: ${perfil.cidade}, Brasil`,
    `- Disponibilidade: ${textoPerfil('pt').status}`,
    `- Contato: ${perfil.email}`,
    `- Competências: ${perfil.competencias.join(', ')}`,
    `- Ferramentas: ${perfil.ferramentas}`,
    '',
    '## Páginas',
    `- [Portfólio](${url('/')}): índice de trabalhos`,
    `- [Sobre](${url('/sobre/')}): experiência, prêmios, formação e perguntas frequentes`,
    `- [Currículo](${url('/curriculo/')}): currículo completo, com versão em PDF`,
    `- [English version](${url('/en/')})`,
    '',
    '## Prêmios',
    ...perfil.premios.map((p) => `- ${p.nivel}, ${p.festival} ${p.ano}: ${p.projeto}`),
    '',
    '## Experiência',
    ...perfil.experiencia.map((e) => `- ${e.periodo}: ${e.funcao}, ${e.empresa}`),
    '',
    '## Formação',
    ...perfil.formacao.map((f) => `- ${f.periodo}: ${f.curso}, ${f.instituicao}`),
    '',
    '## Trabalhos',
    ...cases,
    '',
  ].join('\n');
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
