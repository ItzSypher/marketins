---
tipo: sessão
data: 2026-10-10
branch: previa/clientes
previa: https://marketins-cuvhgcnem-sypherbeasts-projects.vercel.app/teste
---
# Página de clientes (teste)

## Feito
- Página /teste somando referências (Polite Chaos, Hetari, Obys) com o conteúdo do Sérgio.
- Hero igual à da home; faixa de clientes/segmentos logo abaixo dela.
- Cards de clientes com logo real ou nome no gradiente (sem foto gerada).
- Unidades: foto real do Le Monde Office; São João só com o nome até chegar a foto.
- Faixa de logos; conexões sem Junior Bauru; popup removido da home.
- Sem numeração (01)(02), sem a seção "+100", textos de apoio cortados.

## Decisões
- Imagens só reais. Onde falta, tipografia no gradiente.
- Trabalho local daqui em diante (navegador disponível), push em previa/* gera a prévia no Vercel.

## Pendências
- [ ] Vídeo da hero com Veo (foto da hero → loop 8s, 16:9 e 9:16)
- [ ] Novos efeitos e referências
- [ ] Refinar copy
- [ ] CHECKLIST.md de publicação
- [ ] Material: Locafácil, Ademicon, foto SJM, foto do time completo

## Ligações
- [[Preferências do cliente]]

## Espiral de trabalhos (efeito do Zeph)
- Seção nova `#trabalhos` depois da faixa de logos: as artes giram numa espiral 3D presa ao scroll ("Feito na Marketins / Ideias que ganham vida.").
- 10 artes reais do grupo do Figma (nó 5029:5571): Mozi, BNI, Locafácil, 3J Service e posts da própria Marketins. Arquivos em `public/trabalhos/`, lista em `src/teste/dados.ts` (`trabalhos`).
- Imagens em "cover" via CSS (`--r` = proporção da arte); `foco` opcional ajusta o recorte vertical.
- Com movimento reduzido ou tela baixa, vira grade estática. Código: `src/teste/Espiral.tsx` + `espiral.css`.

## Rodada com subagentes (Sonnet médio para remoção, Opus alto para o complexo)
- Removida a seção "Quem chega na Marketins chega bem conectado" (dados `conexoes` e CSS `.rede*`).
- Espiral: cartas 4:5 (proporção dos posts, arte quase inteira) e geometria nova; no mobile, uma carta grande de frente e ~5 por volta.
- "Presença de verdade na Baixada" virou `Presenca.tsx`, com título "Duas unidades na Baixada":
  - abas das unidades com mapa do Google (só carrega perto da tela); no desktop, rolar troca a aba;
  - texto para SEO local e JSON-LD só com dados conhecidos;
  - globo 3D (three via import dinâmico) Baixada → Rio → mundo: "Marketing, da Baixada pro RJ. Do RJ pro mundo."
- Checklist de marketing (`Checklist.tsx`) antes do card final: 6 dores, o símbolo acende e cresce a cada item, e o CTA de WhatsApp leva os itens marcados.
- Pendente: o mapa real não foi visto (Google bloqueado no sandbox; conferir no celular), foto de São João de Meriti e copy final.
