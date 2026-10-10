# Marketins: instruções para o Claude

Site da Agência Marketins (Baixada Fluminense). Produto, público e provas: `PRODUCT.md`. Notas de projeto para o Obsidian: `obsidian/`.

## Modelo e custo

- A sessão roda no **Sonnet 5.5 com esforço alto** (`/model claude-sonnet-5-5`). É o padrão para tudo: editar código, CSS, copy, build, testes, capturas, deploy.
- O padrão do projeto está em `.claude/settings.json` (`claude-sonnet-5-5`); escolha esforço alto no seletor de modelo.
- O **Opus 5.5** só entra quando o trabalho pede. Nesses casos, chame o subagente `opus` (`.claude/agents/opus.md`) com uma tarefa fechada, ou peça ao usuário para trocar com `/model claude-opus-5-5` e voltar depois:
  - decisão de arquitetura ou de estrutura da página;
  - bug que resistiu a duas tentativas;
  - coreografia GSAP/ScrollTrigger complexa (pins encadeados, timelines sincronizadas);
  - revisão final de design antes de pedir aprovação para a `main`.
- Diga em uma linha quando escalar para o Opus e por quê. Não use o Opus para buscas, leitura de arquivos ou edições mecânicas.
- Subagentes do projeto (`.claude/agents/`): `explorador` (Haiku, busca no repo), `verificador` (Sonnet, build + navegador + capturas antes do push), `opus` (trabalho pesado). Use-os para poupar contexto da conversa principal: delegue busca e verificação, mantenha as decisões aqui.

## Como trabalhar: engenheiro de software com referências

- Antes de construir algo novo, traga 2 ou 3 referências reais (link + o efeito ou padrão específico) e diga qual vai seguir e por quê. Não copie código, imagem ou fonte das referências; reescreva no nosso código.
- Reaproveite o que existe: `src/ds/blocos.tsx`, `src/sections/*`, `src/content.ts`, tokens em `src/tokens.css`.
- Escopo apertado: entregue o que foi pedido, sem refatoração ou recurso extra.
- Prove antes de dizer que está pronto: `npm run build` sem erro, console limpo, sem overflow horizontal em 390 e 1280, capturas das seções mexidas. Se algo não foi conferido, diga.

## Grilling no início de cada tema novo

Quando o pedido for vago ou abrir uma frente nova (seção, página, campanha, copy), use a skill `grilling` antes de codar:

1. Leia `PRODUCT.md` e `obsidian/Preferências do cliente.md` primeiro. Não pergunte o que já está escrito ali.
2. Faça as perguntas em rodadas numeradas, cada uma com a sua recomendação.
3. Descubra sozinho os fatos do repo; ao usuário cabem só as decisões.
4. Ao terminar, registre as decisões numa nota em `obsidian/Decisões/` (modelo em `obsidian/_modelos/decisao.md`) e atualize `Preferências do cliente.md` se algo mudou.

## Obsidian

- A pasta `obsidian/` é um vault: markdown com frontmatter e `[[links]]`. O usuário abre essa pasta no Obsidian (ou sincroniza com o plugin Obsidian Git).
- Ao fim de cada sessão de trabalho, crie `obsidian/Sessões/AAAA-MM-DD <tema>.md` com o modelo `obsidian/_modelos/sessao.md`: o que foi feito, link da prévia, decisões, pendências.
- Só fatos verificados. Nada de segredo, senha ou chave nas notas.

## Regras fixas do projeto

- Branches `previa/*`. **Nada vai para a `main` sem o ok do usuário.**
- Benzin em títulos e subtítulos; Montserrat no corpo. Magenta `#D0004D` e laranja `#FE5223` sobre quase preto.
- Sem scroll horizontal. Scrollbar vertical laranja. Música para em 10s. "Toque na tela" só junto com a abertura GTA.
- Mobile first: pins só a partir de 1000px; respeitar `prefers-reduced-motion`.
- **Nunca inventar** logo, foto, resultado ou depoimento de cliente. Onde falta material, use só o nome em tipografia e liste o que falta.
- **Nunca** abrir, usar ou repetir o conteúdo da página "LOGINS E SENHAS" do Figma.
- Segredos (ex.: `GEMINI_API_KEY`) ficam só nas variáveis de ambiente. Nunca escreva o valor em arquivo, commit, nota ou resposta.

## Onde trabalhar: local primeiro, Vercel depois

- O padrão é trabalhar **no computador do usuário** (Claude Code no app desktop ou no terminal), com o navegador dele disponível pelo Claude in Chrome para ver a página, referências e sites logados.
- Loop: `npm run dev` → conferir no Chrome (390 e 1280) → `npm run build` → commit em `previa/*` → `git push`. O Vercel está ligado ao GitHub: cada push em `previa/*` gera uma prévia sozinho. É isso que "sincronizar com a Vercel" quer dizer; não use deploy manual.
- Chaves ficam em `.env.local` (fora do git) no computador e nas variáveis de ambiente do Vercel quando o site precisar delas. Scripts que geram assets (ex.: vídeo com Veo) leem `process.env.GEMINI_API_KEY` e salvam o resultado em `public/`.
- No navegador: não abra páginas de login, senha ou pagamento por conta própria; peça ao usuário.

## Comandos

- `npm install` e depois `npm run dev`: servidor local em http://localhost:5173 (`/`, `/sergio.html`, `/teste.html`).
- `npm run build`: typecheck + build (Vite, multi-página: `index`, `sergio`, `teste`).
- `npx vite preview --port 4180`: confere o build. Na nuvem, rode com `setsid` para não travar o shell.
- Capturas na nuvem (sem Chrome do usuário): Chromium em `/opt/pw-browsers/chromium` com `--use-angle=swiftshader`.
