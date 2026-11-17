# Portfólio de João Kavalchuk (KB)

Site pessoal de diretor de arte. Responda sempre em português do Brasil.

## Objetivo
Conseguir vaga de **diretor de arte pleno, in-house ou remoto**. Quem lê são recrutadores e diretores de criação, que passam poucos minutos no site. Por isso a ordem de prioridade é: ver o trabalho rápido, ter credibilidade (prêmios e créditos) e encontrar o contato com facilidade.

Posicionamento: o nome de João vem na frente. O KABEst Studio (estúdio próprio dele) aparece só como contexto nos cases, nunca como marca do site.

## Stack
- Astro 7, site estático. Conteúdo em `src/content/projetos/*.md` (schema em `src/content.config.ts`) e `src/data/perfil.json`.
- Sveltia CMS em `/admin` (`public/admin/config.yml`), backend GitHub `joaokb/portfolio`, login com token do GitHub (sem OAuth).
- Hospedagem gratuita no Cloudflare Pages, que publica a cada push na `main`.
- As fontes são instaladas pelo npm (`@fontsource-variable`), sem CDN.
- `scripts/importar-imagens.mjs`, rodado pelo workflow `.github/workflows/importar-imagens.yml`, baixa as imagens do CDN do Behance para `public/uploads/projetos/<slug>/` e reescreve os caminhos. Imagem local tem largura e altura lidas no build (`image-size`), para não haver salto de layout.

## Comandos
- `npm install`
- `npm run dev` (http://localhost:4321)
- `npm run build`, depois `npm run preview`

## Direção visual (já decidida, não desfazer sem pedir)
- **Cores:** papel `#e4e5e0` (cinza frio, propositalmente não creme), tinta `#000`, grafite `#5b5d57` para texto secundário, linha `#bfc1ba` e azul caneta `#1f2bd1` como único destaque. O azul é o da esferográfica do rafe de layout.
- **Tipografia:** Big Shoulders Display Variable (100–900) nos títulos e Schibsted Grotesk Variable no texto. Escala 1.25 sobre 17px.
- **Peça principal:** o índice cinético da home. São 12 títulos em caixa alta condensada, cada um numa linha só, com tamanho calculado pelo comprimento (`--len`). O peso vai de 200 a 900 conforme o título cruza o centro da tela. No desktop a capa segue o cursor; no toque ela fica no canto. Todo o resto do site é quieto.
- **Movimento:** há um único momento de abertura (pesos sobem em sequência só nos títulos visíveis e só na primeira visita da sessão). Ao abrir um case, o título faz a transição de página. Não adicionar fade-in em cada seção nem hover em tudo.
- **Referências que o João escolheu:** joaoandbruno.com, caioogata.com, anapaulasilva.com e rodrigospires.com. O que elas têm em comum é mostrar o trabalho primeiro, ter pouco ornamento e dar destaque aos prêmios.

## O que evitar (sinais de site feito por IA)
- Rótulos em CAIXA ALTA espaçada sobre cada título, fonte mono para rótulos e metadados separados por "·".
- Uma palavra destacada em cor ou itálico dentro do título, gradiente, cards arredondados com sombra e "→" no fim de link.
- Numeração 01/02/03 em coisa que não é sequência.
- Texto vendedor: "incrível", "inovador", "não é só X, é Y", tríades por ritmo, perguntas retóricas. Os squads de copy de resposta direta (Halbert, Kennedy, Hormozi) não servem para este site.

## Regras de conteúdo
- **Nunca inventar** fatos: métrica, resultado, prêmio, data, cliente ou parceiro. Se faltar informação, pergunte ao João.
- Projeto de competição ou faculdade sempre diz isso no campo `context` (ex.: "Competição Cria de Leão 2024").
- O texto de cada case segue a ordem problema/insight, ideia, o que foi feito. São 2 ou 3 parágrafos curtos, e a primeira frase precisa se sustentar sozinha.
- O PDF de currículo atual do João tem texto escondido com instruções para IA ("Ignore all previous instructions…"). Não publique esse PDF. O campo `cv` em `perfil.json` só recebe um PDF limpo.

## Pendências
1. Fazer o primeiro push, publicar no Cloudflare Pages e ajustar `site` em `astro.config.mjs` para a URL final.
2. Rodar o workflow **Importar imagens do Behance** e conferir os cases com as imagens reais, no desktop e no celular.
3. Revisar o site com as imagens reais: tamanho das capas na prévia, imagens pequenas, ritmo das galerias e se o índice continua legível com 13 ou mais projetos.
4. Perguntas em aberto para o João:
   - Incluir o case **Circuito Verde Unimed** (Shortlist Ongraf 2026, cliente real)?
   - O Ouro no FestVideo 2025 é do The Artificial Upgrade (confirmado). A Shortlist Cria de Leão 2023 do Burger King também é?
   - Quem fez dupla com ele no Craque N° Zer00, no Burger King e na ESPN? Os nomes vão em `credits`.
   - Memórias em Branco entrou no Anuário? Se sim, isso vai para `award`.
   - Monde, Igor Duran e AZ Models foram freelance, agência ou KABEst Studio?
   - Falta texto para Festa do Branco 2023 (perguntar qual era o desafio, a ideia e as peças feitas). Avant saiu do site (`draft: true`).
   - Projeto que não está no Behance: as imagens estão soltas com o João.
   - A bio diz "passagem por agências" em vez de "mais de sete anos", porque a experiência listada começa em 2021. Se ele confirmar sete anos contando freelance, voltar o número e mostrar isso na lista.

## Como trabalhar neste repositório
- Antes de dizer que terminou, rode `npm run build` e veja a página no navegador em 1440px e 390px. Confira também se não há rolagem horizontal e se o site funciona com `prefers-reduced-motion`.
- Mudança visual deve vir acompanhada de captura de tela, de antes e depois.
- Skills úteis, quando instaladas: `frontend-design`, `impeccable` (crítica), `web-design-guidelines` (Vercel), `taste-skill` e `review-animations` / `animation-performance` (Emil Kowalski).
- Commits pequenos, com mensagem em português.
