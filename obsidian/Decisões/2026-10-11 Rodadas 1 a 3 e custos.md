# Rodadas 1 a 3 da /teste e gasto por agente (11/10/2026)

Branch `previa/clientes`. Nada foi para a `main`.

## O que entrou

**Rodada 1 (ajustes rápidos)**
- Entrada sem botão: toque em qualquer lugar entra ("Toque para entrar" / "Clique para entrar").
- Hero 1 é a única. No PC a foto foi uns 45px para a direita.
- Fontes: só Benzin (títulos) e Jost (resto) no site inteiro. Montserrat removida.

**Rodada 2A**
- Hero no celular: sem foto (nem baixa), globo na frente e o contorno branco da Marketins atrás.
- Unidades: imagem fixa do mapa (prints do cliente), endereço escrito, foto e "Como chegar". Três versões: `?mapa=1` abas na lateral, `?mapa=2` pílulas em cima com cartão sobre o mapa, `?mapa=3` lado a lado. JSON-LD com os dois endereços.
- Checklist: marca sozinho conforme a rolagem; quem desmarcar continua desmarcado; o botão manda só o marcado.

**Rodada 2B**
- Conecta: card grande com contador e logo 3D → card do canto → selo com o logo girando → card grande. Logo vetorizado em `public/conecta/conecta-logo.svg` (o "CONECTA" foi redesenhado em Benzin porque o Figma só tinha imagem; conferir).
- Time: carrossel infinito começando no Sérgio, fotos grandes, nome embaixo. Destaque em `?time=1` (cascata) e `?time=2` (mini-avatares).
- Feed: profundidade com o símbolo atrás do título, celular que passa post a post. `?feed=1` termina no Reels do Sérgio, `?feed=2` termina no perfil.
- Rodapé novo (feixe de luz, MARKETINS gigante), em `src/components/ui/beam-wordmark-footer.tsx`, com crédito ao autor original.

**Rodada 3**
- O selo do Conecta e o assistente somem enquanto o celular do feed está na tela.
- O "espaço vazio depois do rodapé" não se confirmou (página termina no rodapé).
- Limpeza: 2 imagens órfãs (~235 KB), CSS morto do globo antigo e o arquivo `globo3d.ts`.
- O texto do checklist voltou para o aprovado ("Marque o que acontece aí hoje."); o agente tinha trocado sem pedir.

## Gasto por agente

Medida: tokens que o próprio agente consumiu, tempo e número de ações (ferramentas). Não inclui a orquestração da conversa principal.

**Rodada 1, 314 mil tokens**
- Entrada sem botão, Haiku alto: 86,5 mil, 2,4 min, 20 ações.
- Fontes, Sonnet médio: 86,4 mil, 3 min, 12 ações.
- Hero 1 e limpeza das heroes 2/3, Haiku alto: 141,2 mil, 4,8 min, 38 ações.

**Rodada 2A, 378 mil tokens**
- Hero no celular, Opus alto: 121,2 mil, 7,2 min, 32 ações.
- Mapa em 3 versões, Opus alto: 139 mil, 7,5 min, 42 ações.
- Checklist no scroll, Opus alto: 117,9 mil, 9,8 min, 26 ações.

**Rodada 2B, 720 mil tokens**
- Pop-up do Conecta com logo 3D, Opus alto: 196,4 mil, 21,5 min, 65 ações.
- Feed com celular e vídeo, Opus alto: 194,1 mil, 26,9 min, 45 ações.
- Rodapé novo, Opus alto: 178,4 mil, 23,4 min, 56 ações.
- Time em carrossel, Opus alto: 150,7 mil, 11,3 min, 47 ações.

**Rodada 3, 205 mil tokens (mais o review parado)**
- Code review e responsivo, Opus alto: parado aos ~10 min a pedido, sem nenhuma alteração. Tokens não medidos.
- Limpeza, Haiku alto: 126,9 mil, 2,8 min, 22 ações.
- Correções pontuais, Sonnet médio: 78,3 mil, 6,3 min, 16 ações.

**Total medido: cerca de 1,62 milhão de tokens**
- Opus: 1,10 milhão em 7 agentes (68%), mais o review parado.
- Haiku: 355 mil em 3 agentes (22%).
- Sonnet: 165 mil em 2 agentes (10%).

## Onde mais gastou

- **Rodada 2B inteira (44% do total).** Conecta, feed e rodapé passaram de 175 mil cada e de 20 minutos cada.
- **Conecta foi o mais caro.** O agente explorou o Figma sozinho, instalou ferramenta de vetorização, montou o 3D e testou em 4 tamanhos de tela. Ainda corrigiu um bug de rolagem no meio.
- **Testes visuais repetidos.** Todo agente Opus escreveu o próprio script de navegador e repetiu capturas em 4 larguras. O WebGL por software do ambiente é lento, então cada captura com globo ou 3D custa caro.
- **Instruções abertas.** "Itere até ficar bonito" não tem fim definido; os agentes Opus fizeram muitas voltas de ajuste fino.
- **Review sem entregável.** O pedido de code review da página inteira em 4 larguras gastou 10 minutos só lendo e testando.

## Onde dá para economizar

- **Teto de ações no pedido.** Os agentes da rodada 3 com "no máximo ~25 ações" gastaram de 78 a 127 mil tokens e terminaram rápido. Usar sempre.
- **Duas larguras por agente (390 e 1280).** 360 e 768 só na checagem final, uma vez, feita por mim.
- **Script de teste único e compartilhado.** Um script pronto de navegador (entrar, rolar, capturar, checar console e overflow) evita que cada agente escreva o seu. Economia estimada: 5 a 10 ações por agente.
- **Material pronto antes.** Exportar do Figma e preparar imagens antes de chamar o agente, em vez de ele explorar sozinho. Isso teria cortado boa parte do custo do Conecta.
- **Limite de iterações.** Trocar "itere até ficar bonito" por "no máximo 2 rodadas de ajuste e relate".
- **Code review com escopo fechado.** Review só do diff, com Sonnet médio, e a checagem visual com o script único. Opus fica para criação.
- **Opus só onde cria.** Ajuste de layout em seção pronta, remoção e correção pontual vão para Haiku alto ou Sonnet médio, como o cliente definiu.
