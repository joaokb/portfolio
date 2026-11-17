import { getCollection, type CollectionEntry } from 'astro:content';

type Dados = CollectionEntry<'projetos'>['data'];

/** Projetos publicados, na ordem do índice. */
export const publicados = async () =>
  (await getCollection('projetos', ({ data }) => !data.draft)).sort((a, b) => a.data.order - b.data.order);

/** getStaticPaths das páginas de case (português e inglês). */
export async function caminhos() {
  const todos = await publicados();
  return todos.map((p, i) => ({
    params: { slug: p.id },
    props: { projeto: p, proximo: todos[(i + 1) % todos.length] },
  }));
}

/** Campos em inglês por cima dos em português; campo sem tradução fica em português. */
export const dadosEn = (d: Dados): Dados => {
  const en = Object.fromEntries(Object.entries(d.en ?? {}).filter(([k, v]) => v && k !== 'body'));
  return { ...d, ...en };
};
