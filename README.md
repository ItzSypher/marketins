# Site da Marketins

React + Vite + GSAP/ScrollTrigger + Lenis.

    npm install
    npm run dev      # http://localhost:5173
    npm run build

- Conteúdo e números: `src/content.ts` (WhatsApp pendente em `WHATSAPP`).
- Hero com máscara do wordmark: `src/sections/Stage.tsx`.
- Imagens vindas do Figma em WebP: hero (`capa para site 2` / `capa para site mobile 1`), time em `public/time/` e os 21 cases (frame `CASES CLIENTES`) em `public/cases/`.
- WhatsApp: cada botão manda a origem no fim da mensagem (`[site · topo]`, `[site · hero]`, `[site · fim da página]`).
- Produto: `PRODUCT.md`. Assets de marca: `assets/brand/`.
- Fonte Benzin (5 pesos, `public/fonts/`) e paleta em `src/tokens.css`, com o contraste de cada combinação anotado. Texto branco pequeno usa `--gradiente-texto`; o laranja puro (`#FE5223`) com branco por cima só passa para texto grande.
