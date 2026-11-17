import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projetos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projetos' }),
  schema: z.object({
    title: z.string(),
    client: z.string().default(''),
    year: z.coerce.number(),
    discipline: z.string().default(''),
    context: z.string().nullish().transform((v) => v ?? ''),
    award: z.string().nullish().transform((v) => v ?? ''),
    role: z.string().nullish().transform((v) => v ?? ''),
    credits: z
      .array(z.object({ role: z.string(), name: z.string() }))
      .nullish()
      .transform((v) => v ?? []),
    order: z.coerce.number().default(99),
    cover: z.string(),
    // imagem do índice da home (miniatura e prévia); vazio usa a capa
    preview: z.string().nullish().transform((v) => v ?? ''),
    // logo da marca ao lado do título no índice; vazio usa a imagem do índice
    logo: z.string().nullish().transform((v) => v ?? ''),
    pdf: z.string().nullish().transform((v) => v ?? ''),
    images: z
      .array(z.union([z.string(), z.object({ src: z.string(), w: z.number(), h: z.number() })]))
      .nullish()
      .transform((v) => v ?? []),
    video: z.string().nullish().transform((v) => v ?? ''),
    // código de incorporação (iframe) colado como veio, ex.: comparador Juxtapose
    embed: z.string().nullish().transform((v) => v ?? ''),
    behance: z.string().nullish().transform((v) => v ?? ''),
    draft: z.boolean().default(false),
    // versão em inglês (/en/); campo vazio cai no português
    en: z
      .object({
        title: z.string(),
        discipline: z.string(),
        context: z.string(),
        award: z.string(),
        role: z.string(),
        body: z.string(),
      })
      .partial()
      .nullish(),
  }),
});

export const collections = { projetos };
