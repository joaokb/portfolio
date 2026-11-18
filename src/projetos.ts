import { getCollection, type CollectionEntry } from 'astro:content';

type Dados = CollectionEntry<'projetos'>['data'];

/** Projetos publicados, na ordem do índice. */
export const publicados = async () =>
  (await getCollection('projetos', ({ data }) => !data.draft)).sort((a, b) => a.data.order - b.data.order);

/** Publicados que aparecem no índice da home e na grade de Links. */
export const noIndice = async () => (await publicados()).filter((p) => p.data.indice);

/** getStaticPaths das páginas de case (português e inglês). Todo publicado tem página;
 *  o "próximo trabalho" anda só pelos do índice (um case fora dele aponta para o primeiro). */
export async function caminhos() {
  const todos = await publicados();
  const indice = todos.filter((p) => p.data.indice);
  return todos.map((p) => {
    const i = indice.indexOf(p);
    return { params: { slug: p.id }, props: { projeto: p, proximo: indice[(i + 1) % indice.length] } };
  });
}

/** Campos em inglês por cima dos em português; campo sem tradução fica em português. */
export const dadosEn = (d: Dados): Dados => {
  const en = Object.fromEntries(Object.entries(d.en ?? {}).filter(([k, v]) => v && k !== 'body'));
  return { ...d, ...en };
};
