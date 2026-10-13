---
tipo: sessão
data: 2026-10-13
branch: previa/clientes
previa: https://marketins-git-previa-clientes-sypherbeasts-projects.vercel.app/teste
---
# Teste rodada 4 e celular

## Feito
- Mapa: layout da versão 1 com as abas em pílula da versão 2, no topo à esquerda. Saíram as versões 2 e 3 e o seletor.
- Time: cascata no PC (900px+), palco no celular; fileira de mini-avatares nos dois. Saiu o seletor.
- Feed: versão 1 com 3 posts e o Reels no fim. Saiu o seletor.
- Celular mais leve (medido em 390px, CPU 4x mais lenta, Fast 4G, mesmo script antes e depois):
  - tarefas longas na carga 7,0 s → 1,9 s; no toque de entrada 4,0 s → 0,8 s; no scroll 4,5 s → 1,4 s;
  - baixado antes do toque 1,5 MB → 389 KB; contextos WebGL 5 → 1; avisos no console 12 → 0.
- Como: sem three.js no celular para o logo da entrada (gira em CSS) e o logo do Conecta (SVG parado; no PC só baixa quando o pop-up abre); globo da hero com pixel ratio 1, 30 fps e montado depois da cortina; espiral com 10 cartas e 5 fatias, imagens só quando chega perto; Lenis desligado no toque; sem blur, drop-shadow e backdrop-filter pesados no celular; animações infinitas param fora da tela; música sem pré-carregar.
- Títulos menores no celular (`.t-titulo` ~25px, checklist, letreiro, pilha, time, feed, hero, contagem do Conecta). Desktop igual.
- Conecta no celular: "Agora não" vai direto para o selo (o card de canto cobria quase metade da tela).
- Pilha sem logo: o nome não aparece mais duas vezes no celular.

## Decisões
- Cliente aprovou a /teste com as ressalvas acima. "De resto, perfeito."

## Pendências
- [ ] Mídias dos clientes (o cliente vai enviar).
- [ ] Cards da pilha seguem `position: sticky` no celular (regra do projeto: pins só a partir de 1000px).
- [ ] Espiral no celular: ~250px vazios embaixo no começo do scroll.
- [ ] Conferir num celular de verdade (as medidas são de emulação).
- [ ] Levar a /teste para a `main` só com o ok do cliente.

## Ligações
- [[Preferências do cliente]]
- [[2026-10-10 Página de clientes (teste)]]
