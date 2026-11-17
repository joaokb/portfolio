# Portfólio — João Kavalchuk

Site estático em Astro com painel de edição em `/admin` (Sveltia CMS).

## Editar sem código
1. Acesse `https://SEU-SITE/admin`.
2. Clique em **Sign in with Token** e cole um token do GitHub (Settings → Developer settings → Fine-grained tokens, com permissão *Contents: Read and write* só neste repositório).
3. Edite projetos, prêmios e textos. Ao salvar, o site é publicado de novo em ~1 minuto.

## Rodar no computador
```
npm install
npm run dev
```

## Imagens do Behance
Os projetos importados ainda apontam para o Behance. Em **Actions → Importar imagens do Behance → Run workflow**, as imagens são copiadas para `public/uploads` e os links são atualizados.
