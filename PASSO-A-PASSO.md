# Passo a passo no Windows

## 1. Instalar o que falta (uma vez só)
Abra o PowerShell e confira o que já está instalado:
```powershell
node -v      # precisa ser 22 ou maior
git --version
claude --version
```
- **Node:** se faltar, instale a versão LTS em nodejs.org.
- **Git:** se faltar, instale em git-scm.com.
- **Claude Code:** se faltar, siga as instruções de instalação para Windows em https://docs.claude.com (seção Claude Code).

## 2. Colocar o projeto numa pasta
Descompacte o `portfolio-joao-kavalchuk.zip` em `Documents`. Ele cria a pasta `portfolio`. Depois:
```powershell
cd $HOME\Documents\portfolio
npm install
npm run dev
```
Abra http://localhost:4321. As imagens do Behance devem carregar no seu computador. Para parar o servidor, use `Ctrl+C`.

## 3. Enviar para o GitHub (repositório joaokb/portfolio)
```powershell
git init -b main
git add .
git commit -m "Primeira versão do portfólio"
git remote add origin https://github.com/joaokb/portfolio.git
git push -u origin main
```
O Git vai abrir o navegador para você entrar na sua conta do GitHub.

## 4. Abrir no Claude Code
```powershell
cd $HOME\Documents\portfolio
claude
```
O arquivo `CLAUDE.md` é lido automaticamente, então o Claude Code já entra sabendo o objetivo do site, a direção visual e o que está pendente.

Instale as skills de revisão neste projeto, rodando no PowerShell (fora do Claude Code):
```powershell
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/pbakaus/impeccable
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/Leonxlnx/taste-skill
npx skills add https://github.com/emilkowalski/skill --skill review-animations
npx skills add https://github.com/emilkowalski/skill --skill animation-performance
```
Se o instalador perguntar onde instalar, escolha **Claude Code** e **projeto**.

## 5. Publicar grátis no Cloudflare Pages
Peça ao Claude Code:
> Me guie para publicar este repositório no Cloudflare Pages com o nome de projeto `joaokavalchuk`, build `npm run build` e pasta `dist`. Depois atualize o `site` no astro.config.mjs para a URL final.

O endereço vai ficar algo como `joaokavalchuk.pages.dev`. A cada push na `main`, o site é atualizado sozinho.

## 6. Trazer as imagens do Behance para dentro do site
No GitHub: **Actions → Importar imagens do Behance → Run workflow**. Em cerca de 1 minuto as imagens passam a ficar no seu repositório. Depois disso, rode `git pull` na sua pasta para trazer essas mudanças.

## 7. Painel de edição (/admin)
1. No GitHub, vá em **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
   - Em **Repository access**, escolha só `joaokb/portfolio`.
   - Em **Permissions**, coloque **Contents** como *Read and write*.
2. Acesse `https://SEU-SITE.pages.dev/admin`, clique em **Sign in with Token** e cole o token.
3. Guarde o token só no seu gerenciador de senhas. Não mande para ninguém nem cole em chat.

## Primeiro pedido para colar no Claude Code
> Leia o CLAUDE.md. Rode o site, abra no navegador com as imagens reais do Behance e faça a revisão da pendência 3: desktop 1440px e celular 390px, com capturas de tela. Me mostre os problemas antes de mudar qualquer coisa. Depois, me faça as perguntas em aberto da pendência 4, uma de cada vez.
