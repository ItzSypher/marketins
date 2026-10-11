import * as React from 'react';

/**
 * Beam Wordmark Footer
 * Baseado no componente "Beam Wordmark Footer" de Kedhar (21st.dev/@kedhareswer),
 * adaptado para a Marketins: sem Tailwind/shadcn, só React e o próprio CSS;
 * feixe em dois tons (magenta → laranja), wordmark em fonte de display, botão
 * de contato em pílula e links com linha de apoio.
 *
 * Fundo escuro atravessado por um feixe diagonal lento, com a marca escrita
 * numa palavra gigante cortada pela borda de baixo, que o feixe atravessa.
 * Cada letra pinta o mesmo feixe e o mesmo brilho do ponteiro que o fundo,
 * alinhados às coordenadas da seção, então a luz parece um único facho
 * passando por trás das colunas e através das letras.
 *
 * Interação: o feixe se move sozinho e se inclina para o ponteiro; o ponteiro
 * leva um brilho suave que acende as letras por onde passa; as letras sobem no
 * hover e pulam no clique; colunas, linhas e letras entram na primeira vez que
 * o rodapé aparece. O laço de animação (rAF) só roda com o rodapé visível.
 */

// #region feixe
// Funções puras: cor, encaixe e matemática do feixe.

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/** "#d0004d" / "#d04" → "208, 0, 77". O que não for hex cai no fallback. */
export const hexToRgb = (hex: string, fallback: string = '208, 0, 77'): string => {
  const m = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec((hex || '').trim());
  if (!m) return fallback;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const n = parseInt(h, 16);
  return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
};

/**
 * Tamanho de fonte (px) para que uma palavra medida a 100px ocupe `target` px.
 * Palavra curta viraria uma torre, então há o teto `cap`. Entrada ruim dá 0.
 */
export const fitSize = (measuredAt100: number, target: number, cap: number): number => {
  if (!(measuredAt100 > 0) || !(target > 0)) return 0;
  const size = (100 * target) / measuredAt100;
  return cap > 0 ? Math.min(size, cap) : size;
};

/** Onde o feixe fica (% da seção) para um ponteiro em `u` (0 → 1 na largura). */
export const beamTarget = (u: number, lo: number = 30, hi: number = 82): number =>
  lo + (hi - lo) * clamp(Number.isFinite(u) ? u : 0.5, 0, 1);

/** Balanço ocioso do feixe: dois senos lentos e sem relação, para nunca parecer um loop. */
export const drift = (t: number, centre: number = 58, amp: number = 9): number =>
  centre + amp * (0.7 * Math.sin(t * 0.21) + 0.3 * Math.sin(t * 0.077 + 1.3));

/** Aproximação independente de FPS: `k` é a fração do caminho fechada a cada 1/60 s. */
export const approach = (from: number, to: number, k: number, dt: number): number =>
  to + (from - to) * Math.pow(1 - clamp(k, 0, 1), clamp(dt, 0, 0.1) * 60);

/**
 * Onde fica a linha de base numa caixa `line-height: 1`, como fração do tamanho
 * da fonte, a partir do ascent e descent a 100px. Sem métricas, 0.8.
 */
export const baselineAt = (ascent: number, descent: number): number => {
  if (!(ascent > 0) || !(descent >= 0)) return 0.8;
  return clamp(((100 - ascent - descent) / 2 + ascent) / 100, 0.5, 1.2);
};

/** Altura visível da palavra: até a linha de base, mais `cut` em abaixo dela. */
export const wordHeight = (fontSize: number, baseline: number, cut: number): number =>
  Math.max(0, fontSize * (baseline + clamp(Number.isFinite(cut) ? cut : 0, -0.4, 0.4)));

// #endregion

export type SocialIcon = 'instagram' | 'whatsapp' | 'mail' | 'linkedin' | 'youtube';

export type FooterSocial = {
  label: string;
  href?: string;
  /** Um dos embutidos, ou um nó 24×24 próprio. */
  icon: SocialIcon | React.ReactNode;
};

/** Botão de contato em pílula: marca + ícone sobrepostos, texto e dica. */
export type FooterCta = {
  label: string;
  href: string;
  /** Texto da dica (tooltip). Padrão: `label`. */
  tip?: string;
  /** Nome acessível. Padrão: `label`. */
  ariaLabel?: string;
  /** Símbolo da marca (ex.: <img>), mostrado num círculo. */
  mark?: React.ReactNode;
  icon?: SocialIcon | React.ReactNode;
};

export type FooterLink = {
  label: string;
  href?: string;
  /** Linha(s) de apoio, em tom apagado, abaixo do rótulo. */
  hint?: string | string[];
  /** Chamada curta com seta, sempre visível (ex.: "Como chegar"). */
  cta?: string;
};
export type FooterColumn = {
  title: string;
  links: FooterLink[];
  /** Em telas estreitas, os links ficam em duas colunas. */
  compact?: boolean;
};
/** Uma linha de crédito: `lead` apagado, `label` claro (link quando tem `href`), `tail` apagado. */
export type FooterCredit = {
  lead?: string;
  label: string;
  href?: string;
  tail?: string;
  /** Ícone pequeno antes da linha (linhas de contato). */
  icon?: SocialIcon | React.ReactNode;
};

export type BeamWordmarkFooterProps = {
  brand?: string;
  /** O que a palavra gigante escreve. Padrão: `brand`. */
  wordmark?: string;
  company?: string;
  year?: number;
  socials?: FooterSocial[];
  cta?: FooterCta;
  credits?: FooterCredit[];
  columns?: FooterColumn[];
  /** Chamado em todo clique de link; pode dar `preventDefault` no evento. */
  onLinkClick?: (label: string, href: string | undefined, event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Onde a borda de baixo corta a palavra, em em abaixo da linha de base. Negativo corta as letras. */
  cut?: number;
  background?: string;
  ink?: string;
  muted?: string;
  /** Tom do corpo do feixe, do halo e das linhas. */
  accent?: string;
  /** Tom quente: borda do feixe, brilho do ponteiro, rótulos e a borda acesa das letras. Padrão: `accent`. */
  accentHot?: string;
  /** Preenchimento em repouso da palavra, topo e pé. */
  wordTop?: string;
  wordFoot?: string;
  fontSans?: string;
  /** Fonte da palavra gigante. Padrão: `fontSans`. */
  fontDisplay?: string;
  wordWeight?: number;
  /** Espaçamento entre letras da palavra, em em. */
  wordTracking?: number;
  /** `false` segura o feixe parado (o brilho do ponteiro continua). */
  animate?: boolean;
  className?: string;
};

const SANS = 'var(--corpo, system-ui, sans-serif)';

const ICONS: Record<SocialIcon, React.ReactNode> = {
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17.1" cy="6.9" r=".6" fill="currentColor" stroke="none" />
    </g>
  ),
  whatsapp: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.6 20.4l1.25-4.4A8.4 8.4 0 1 1 8.1 19.3L3.6 20.4Z" />
      <path d="M9.3 7.9h.75c.25 0 .45.15.55.4l.7 1.75c.1.25.05.5-.12.7l-.68.78c.65 1.3 1.6 2.25 2.9 2.9l.78-.68c.2-.17.45-.22.7-.12l1.75.7c.25.1.4.3.4.55v.75c0 .9-.75 1.6-1.65 1.5C11.1 16.8 7.2 12.9 6.8 8.9c-.1-.9.6-1.65 1.5-1.65" />
    </g>
  ),
  linkedin: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V16M12 16v-5.5M12 13c0-1.6 1-2.6 2.4-2.6s2.1.9 2.1 2.4V16" />
      <circle cx="8" cy="7.7" r=".55" fill="currentColor" />
    </g>
  ),
  mail: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
    </g>
  ),
  youtube: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="2.75" y="5.5" width="18.5" height="13" rx="4" />
      <path d="M10.2 9.3v5.4l4.6-2.7-4.6-2.7Z" />
    </g>
  ),
};

/** Linha de base da fonte real da palavra, lida num canvas. */
const measureBaseline = (family: string, weight: number, text: string): number => {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return 0.8;
    ctx.font = weight + ' 100px ' + family;
    const m = ctx.measureText(text);
    return baselineAt(m.fontBoundingBoxAscent, m.fontBoundingBoxDescent);
  } catch {
    return 0.8;
  }
};

const isIconName = (v: unknown): v is SocialIcon => typeof v === 'string' && v in ICONS;
const isExternal = (href?: string) => !!href && /^https?:/.test(href);
const ext = (href?: string) => (isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

const EASE = 'cubic-bezier(.2,.8,.2,1)';

// Uma folha de estilo com escopo. Toda regra fica sob .bwf; resets de elemento
// passam por :where(.bwf) para nunca ganhar das classes do componente.
// --bwf-acc = corpo do feixe (magenta); --bwf-hot = borda quente (laranja).
const CSS =
  '.bwf{position:relative;isolation:isolate;overflow:hidden;container-type:inline-size;background:var(--bwf-bg);color:var(--bwf-ink);font-family:var(--bwf-sans);-webkit-font-smoothing:antialiased;touch-action:pan-y;-webkit-tap-highlight-color:transparent;padding-bottom:var(--bwf-floor,0px)}' +
  ':where(.bwf) a{color:inherit;text-decoration:none}' +
  ':where(.bwf) ul{list-style:none;margin:0;padding:0}' +
  ':where(.bwf) p{margin:0}' +
  '.bwf svg{max-width:none;display:block}' +
  '.bwf .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}' +
  '.bwf a:focus-visible{outline:2px solid rgb(var(--bwf-hot));outline-offset:3px}' +
  // fundo
  ".bwf::after{content:'';position:absolute;left:0;right:0;bottom:0;height:var(--bwf-floor,0px);background:var(--bwf-bg);z-index:1;pointer-events:none}" +
  '.bwf-rule{position:absolute;left:0;right:0;top:0;height:1px;z-index:3;background:linear-gradient(90deg,rgba(var(--bwf-acc),.12),rgba(var(--bwf-acc),.6) calc(var(--bwf-b) - 12%),rgba(var(--bwf-hot),.85) var(--bwf-b),rgba(var(--bwf-hot),.12))}' +
  '.bwf-sky{position:absolute;inset:0;z-index:0;pointer-events:none}' +
  '.bwf-wash{position:absolute;inset:0;background:radial-gradient(120% 90% at 8% 0%,rgba(var(--bwf-acc),.2),transparent 55%),radial-gradient(90% 70% at 92% 8%,rgba(var(--bwf-hot),.1),transparent 60%),linear-gradient(180deg,rgba(var(--bwf-acc),.05),transparent 70%)}' +
  '.bwf-bands{position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(var(--bwf-acc),.05) 0 1.6cqw,transparent 1.6cqw 4.2cqw);-webkit-mask-image:linear-gradient(100deg,#000 0%,transparent 55%);mask-image:linear-gradient(100deg,#000 0%,transparent 55%);opacity:.9}' +
  // o feixe é uma fatia do gradiente da marca: lado de entrada magenta, borda quente laranja
  '.bwf-beam{position:absolute;inset:0;filter:blur(calc(1px + 1.6cqw));background:' +
  'linear-gradient(var(--bwf-ang),transparent calc(var(--bwf-b) - 12%),rgba(var(--bwf-acc),.12) calc(var(--bwf-b) - 6%),rgba(var(--bwf-acc),.3) calc(var(--bwf-b) - 2%),rgba(var(--bwf-hot),.36) var(--bwf-b),rgba(var(--bwf-hot),.09) calc(var(--bwf-b) + 4%),transparent calc(var(--bwf-b) + 9%)),' +
  'linear-gradient(var(--bwf-ang),transparent calc(var(--bwf-b) - 34%),rgba(var(--bwf-acc),.12) calc(var(--bwf-b) - 27%),transparent calc(var(--bwf-b) - 20%))}' +
  '.bwf-glow{position:absolute;inset:0;opacity:var(--bwf-g);background:radial-gradient(circle 26cqw at var(--bwf-px) var(--bwf-py),rgba(var(--bwf-hot),.13),rgba(var(--bwf-acc),.07) 40%,transparent 70%)}' +
  ".bwf-grain{position:absolute;inset:0;opacity:.12;mix-blend-mode:overlay;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")}" +
  // grade
  '.bwf-inner{position:relative;z-index:2;box-sizing:border-box;max-width:1180px;margin:0 auto;padding:clamp(56px,8.5cqw,112px) clamp(20px,6cqw,88px) 0;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1.1fr) minmax(0,.7fr);column-gap:clamp(24px,4.5cqw,64px);row-gap:44px}' +
  '.bwf-label{font-size:11.5px;font-weight:600;line-height:1;letter-spacing:.16em;text-transform:uppercase;color:rgb(var(--bwf-hot));padding-bottom:14px;position:relative;display:block}' +
  ".bwf-label::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,rgba(var(--bwf-acc),.7),rgba(var(--bwf-hot),.35) 60%,rgba(var(--bwf-hot),.1));transform-origin:0 50%;transform:scaleX(var(--bwf-line,1));transition:transform 1.1s cubic-bezier(.2,.7,.1,1) var(--bwf-d,0ms)}" +
  ".bwf[data-in='false'] .bwf-label::after{--bwf-line:0}" +
  '.bwf-col{min-width:0}' +
  '.bwf-fade{transition:opacity .9s ease var(--bwf-d,0ms),translate .9s cubic-bezier(.2,.7,.1,1) var(--bwf-d,0ms)}' +
  ".bwf[data-in='false'] .bwf-fade{opacity:0;translate:0 14px}" +
  // botões sociais
  '.bwf-socials{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:18px}' +
  '.bwf-soc{position:relative;width:44px;height:44px;display:grid;place-items:center;border-radius:12px;color:rgba(var(--bwf-ink-rgb),.72);background:linear-gradient(180deg,rgba(var(--bwf-ink-rgb),.09),rgba(var(--bwf-ink-rgb),.025));box-shadow:inset 0 0 0 1px rgba(var(--bwf-ink-rgb),.16),inset 0 1px 0 rgba(var(--bwf-ink-rgb),.14),0 6px 14px -8px rgba(0,0,0,.8);transition:color .25s,box-shadow .35s,translate .35s ' + EASE + ',background .35s}' +
  '.bwf-soc>svg{width:20px;height:20px}' +
  '.bwf-soc:hover,.bwf-soc:focus-visible{color:var(--bwf-ink);background:linear-gradient(160deg,rgba(var(--bwf-acc),.42),rgba(var(--bwf-hot),.14));box-shadow:inset 0 0 0 1px rgba(var(--bwf-hot),.7),inset 0 1px 0 rgba(var(--bwf-ink-rgb),.3),0 10px 26px -8px rgba(var(--bwf-acc),.75)}' +
  '.bwf-soc:hover,.bwf-soc:focus-visible{translate:0 -2px}' +
  // pílula de contato: símbolo da marca + ícone sobrepostos, texto
  '.bwf-pill{position:relative;display:inline-flex;align-items:center;gap:12px;height:48px;padding:0 20px 0 5px;border-radius:999px;color:var(--bwf-ink);font-size:14.5px;font-weight:500;letter-spacing:.01em;white-space:nowrap;background:linear-gradient(180deg,rgba(var(--bwf-ink-rgb),.09),rgba(var(--bwf-ink-rgb),.025)) padding-box,linear-gradient(var(--bwf-bg),var(--bwf-bg)) padding-box,linear-gradient(115deg,rgba(var(--bwf-acc),.9),rgba(var(--bwf-hot),.8)) border-box;border:1px solid transparent;box-shadow:0 10px 30px -14px rgba(var(--bwf-acc),.8);transition:translate .35s ' + EASE + ',box-shadow .35s}' +
  '.bwf-pill:hover,.bwf-pill:focus-visible{translate:0 -2px;box-shadow:0 14px 34px -12px rgba(var(--bwf-acc),.95);background:linear-gradient(160deg,rgba(var(--bwf-acc),.3),rgba(var(--bwf-hot),.1)) padding-box,linear-gradient(var(--bwf-bg),var(--bwf-bg)) padding-box,linear-gradient(115deg,rgb(var(--bwf-acc)),rgb(var(--bwf-hot))) border-box}' +
  '.bwf-pair{display:flex;align-items:center}' +
  '.bwf-pair>span{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;flex:none}' +
  '.bwf-pair-m{position:relative;z-index:1;background:var(--bwf-bg);box-shadow:inset 0 0 0 1px rgba(var(--bwf-ink-rgb),.18)}' +
  '.bwf-pair-m img,.bwf-pair-m svg{width:27px;height:27px;display:block}' +
  '.bwf-pair-w{margin-left:-9px;color:#fff;background:linear-gradient(135deg,rgb(var(--bwf-acc)),rgb(var(--bwf-hot)));box-shadow:0 0 0 2px var(--bwf-bg);transition:background .35s,box-shadow .35s}' +
  '.bwf-pair-w svg{width:19px;height:19px}' +
  '.bwf-pill:hover .bwf-pair-w,.bwf-pill:focus-visible .bwf-pair-w{box-shadow:0 0 0 2px var(--bwf-bg),0 6px 18px -4px rgba(var(--bwf-hot),.8)}' +
  // dica
  '.bwf-tip{position:absolute;z-index:5;left:50%;top:calc(100% + 10px);translate:-50% -4px;white-space:nowrap;font-size:12px;font-weight:500;line-height:1;padding:7px 9px;border-radius:5px;background:rgba(var(--bwf-acc),.97);color:#fff;opacity:0;pointer-events:none;transition:opacity .2s,translate .25s}' +
  ".bwf-tip::after{content:'';position:absolute;left:50%;bottom:100%;margin-left:-4px;border:4px solid transparent;border-bottom-color:rgba(var(--bwf-acc),.97)}" +
  '.bwf-soc:hover .bwf-tip,.bwf-soc:focus-visible .bwf-tip,.bwf-pill:hover .bwf-tip,.bwf-pill:focus-visible .bwf-tip{opacity:1;translate:-50% 0}' +
  // créditos
  '.bwf-credits{margin-top:26px;font-size:14px;line-height:1.55;color:var(--bwf-muted)}' +
  '.bwf-credits p+p{margin-top:3px}' +
  '.bwf-credits b{font-weight:500;color:var(--bwf-ink)}' +
  '.bwf-credit--i{display:flex;align-items:center;gap:9px}' +
  '.bwf-credit-i svg{width:16px;height:16px}.bwf-credit-i{flex:none;color:rgb(var(--bwf-hot));opacity:.9}' +
  '.bwf-credits .bwf-credit--i+.bwf-credit--i{margin-top:2px}.bwf-credits :not(.bwf-credit--i)+.bwf-credit--i{margin-top:12px}' +
  '.bwf-credits a{color:var(--bwf-ink);background:linear-gradient(90deg,rgb(var(--bwf-acc)),rgb(var(--bwf-hot))) 0 100%/0 1px no-repeat;transition:background-size .35s ' + EASE + ',color .25s}' +
  '.bwf-credits a:hover,.bwf-credits a:focus-visible{background-size:100% 1px;color:#fff}' +
  // links
  '.bwf-links{margin-top:12px;display:flex;flex-direction:column}' +
  '.bwf-link{position:relative;display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:6px 0;font-size:15px;line-height:21px;color:rgba(var(--bwf-ink-rgb),.8);transition:color .25s}' +
  '.bwf-link-t{display:inline-block;transition:translate .35s ' + EASE + '}' +
  ".bwf-link::before{content:'';position:absolute;left:0;top:50%;width:6px;height:1px;background:rgb(var(--bwf-hot));transform:scaleX(0);transform-origin:0 50%;transition:transform .35s " + EASE + '}' +
  '.bwf-link>svg{width:12px;height:12px;opacity:0;translate:-6px 0;color:rgb(var(--bwf-hot));transition:opacity .25s,translate .35s ' + EASE + '}' +
  '.bwf-link:hover,.bwf-link:focus-visible{color:#fff}' +
  '.bwf-link:hover::before,.bwf-link:focus-visible::before{transform:scaleX(1)}' +
  '.bwf-link:hover .bwf-link-t,.bwf-link:focus-visible .bwf-link-t{translate:12px 0}' +
  '.bwf-link:hover>svg,.bwf-link:focus-visible>svg{opacity:1;translate:10px 0}' +
  // link com linha de apoio (unidades)
  '.bwf-link--rich{padding:10px 0}' +
  '.bwf-link--rich::before{top:20.5px}' +
  '.bwf-link--rich .bwf-link-t{display:flex;flex-direction:column;gap:2px}.bwf-link-l{margin-bottom:2px}' +
  '.bwf-link-l{color:var(--bwf-ink);font-weight:500}' +
  '.bwf-link-h{font-size:13.5px;line-height:1.4;color:var(--bwf-muted)}' +
  '.bwf-link-c{display:inline-flex;align-items:center;gap:6px;margin-top:4px;font-size:13px;font-weight:500;color:rgb(var(--bwf-hot))}' +
  '.bwf-link-c svg{width:11px;height:11px;transition:translate .35s ' + EASE + '}' +
  '.bwf-link:hover .bwf-link-c svg,.bwf-link:focus-visible .bwf-link-c svg{translate:2px -2px}' +
  // palavra gigante
  '.bwf-word{position:relative;z-index:1;overflow:hidden;margin-top:clamp(40px,7cqw,104px)}' +
  '.bwf-word-box{padding:0 clamp(16px,5cqw,88px);max-width:1180px;margin:0 auto;box-sizing:border-box}' +
  '.bwf-word-in{display:inline-flex;white-space:nowrap;font-family:var(--bwf-dfont);font-weight:var(--bwf-ww);line-height:1;letter-spacing:var(--bwf-track);user-select:none;-webkit-user-select:none}' +
  '.bwf-lw{display:inline-block;translate:0 0;transition:translate 1.25s cubic-bezier(.16,.84,.2,1) var(--bwf-d,0ms)}' +
  ".bwf[data-in='false'] .bwf-lw{translate:0 85%}" +
  '.bwf-l{display:inline-block;cursor:pointer;color:transparent;-webkit-background-clip:text;background-clip:text;background-repeat:no-repeat;background-size:var(--bwf-rw) var(--bwf-rh);background-position:calc(var(--bwf-x) * -1) calc(var(--bwf-y) * -1);' +
  'background-image:radial-gradient(circle 22cqw at var(--bwf-px) var(--bwf-py),rgba(var(--bwf-hot),calc(var(--bwf-g) * .8)),rgba(var(--bwf-acc),calc(var(--bwf-g) * .45)) 45%,transparent 70%),' +
  'linear-gradient(var(--bwf-ang),transparent calc(var(--bwf-b) - 9%),rgba(var(--bwf-acc),.5) calc(var(--bwf-b) - 3%),rgba(var(--bwf-hot),.72) var(--bwf-b),rgba(var(--bwf-hot),.2) calc(var(--bwf-b) + 3.5%),transparent calc(var(--bwf-b) + 8%)),' +
  'linear-gradient(180deg,var(--bwf-wt) var(--bwf-top),var(--bwf-wf) var(--bwf-bot));' +
  'transition:transform .5s cubic-bezier(.2,.9,.25,1.2),filter .4s;transform-origin:50% 100%}' +
  '.bwf-l:hover{transform:translateY(-.045em);filter:brightness(1.4) saturate(1.1)}' +
  '.bwf-l.is-hop{animation:bwf-hop .75s ' + EASE + '}' +
  '@keyframes bwf-hop{0%{transform:translateY(0) scale(1,1)}18%{transform:translateY(.02em) scale(1.06,.9)}45%{transform:translateY(-.14em) scale(.97,1.05)}70%{transform:translateY(.01em) scale(1.02,.97)}100%{transform:translateY(-.045em) scale(1,1)}}' +
  '.bwf-foot{position:absolute;left:0;right:0;bottom:0;height:34%;z-index:2;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(var(--bwf-bg-rgb),.55) 55%,var(--bwf-bg))}' +
  // responsivo
  '@container (max-width: 900px){.bwf-inner{grid-template-columns:minmax(0,1fr) minmax(0,1fr);row-gap:40px}.bwf-col:nth-child(1){grid-column:1 / -1}}' +
  '@container (max-width: 560px){.bwf-inner{grid-template-columns:minmax(0,1fr);row-gap:40px}.bwf-foot{height:24%}' +
  '.bwf-link{min-height:44px}.bwf-links--compact{display:grid;grid-template-columns:1fr 1fr;column-gap:16px}' +
  '.bwf-credits a{display:inline-flex;align-items:center;min-height:44px;background-position:0 calc(100% - 10px)}.bwf-credits .bwf-credit--i+.bwf-credit--i{margin-top:0}}' +
  '@media (pointer: coarse){.bwf-link{min-height:44px}.bwf-credits a{display:inline-flex;align-items:center;min-height:44px;background-position:0 calc(100% - 10px)}.bwf-credits .bwf-credit--i+.bwf-credit--i{margin-top:0}}' +
  '@media (prefers-reduced-motion: reduce){.bwf .bwf-lw,.bwf .bwf-fade,.bwf .bwf-label::after,.bwf .bwf-l,.bwf .bwf-soc,.bwf .bwf-pill,.bwf .bwf-link-t,.bwf .bwf-link svg{transition:none!important;animation:none!important}' +
  ".bwf[data-in='false'] .bwf-lw,.bwf[data-in='false'] .bwf-fade{translate:none;opacity:1}.bwf[data-in='false'] .bwf-label::after{--bwf-line:1}}";

const Arrow = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2.5 9.5l7-7M4 2.5h5.5V8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Icon = ({ icon }: { icon: SocialIcon | React.ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {isIconName(icon) ? ICONS[icon] : icon}
  </svg>
);

export default function BeamWordmarkFooter({
  brand = 'Marketins',
  wordmark,
  company,
  year = new Date().getFullYear(),
  socials = [],
  cta,
  credits = [],
  columns = [],
  onLinkClick,
  cut = 0.14,
  background = '#0b0709',
  ink = '#f5eef0',
  muted = '#b9aab0',
  accent = '#d0004d',
  accentHot,
  wordTop = '#7a0b37',
  wordFoot = '#120a0d',
  fontSans = SANS,
  fontDisplay,
  wordWeight = 800,
  wordTracking = -0.02,
  animate = true,
  className = '',
}: BeamWordmarkFooterProps) {
  const word = (wordmark ?? brand).trim() || brand;
  const letters = React.useMemo(() => Array.from(word), [word]);
  const dfont = fontDisplay ?? fontSans;

  const rootRef = React.useRef<HTMLElement>(null);
  const wordRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState(0);
  const [base, setBase] = React.useState(0.8);
  const [seen, setSeen] = React.useState(false);

  const ptr = React.useRef({ u: 0.5, x: 0, y: 0, inside: false });

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const box = wordRef.current;
    const inner = innerRef.current;
    if (!root || !box || !inner) return;
    let frame = 0;
    const place = () => {
      const r = root.getBoundingClientRect();
      root.style.setProperty('--bwf-rw', r.width + 'px');
      root.style.setProperty('--bwf-rh', r.height + 'px');
      const spans = inner.querySelectorAll<HTMLElement>('.bwf-l');
      let top = 0;
      spans.forEach((s, i) => {
        let x = 0;
        let y = 0;
        let el: HTMLElement | null = s;
        while (el && el !== root) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        s.style.setProperty('--bwf-x', x + 'px');
        s.style.setProperty('--bwf-y', y + 'px');
        if (i === 0) top = y;
      });
      root.style.setProperty('--bwf-top', top + 'px');
      root.style.setProperty('--bwf-bot', top + (parseFloat(inner.style.fontSize) || 0) * 0.92 + 'px');
    };
    const fit = () => {
      const wb = inner.parentElement ?? box;
      const pad = parseFloat(getComputedStyle(wb).paddingLeft) || 0;
      const target = wb.clientWidth - pad * 2;
      inner.style.fontSize = '100px';
      const measured = inner.offsetWidth;
      setBase(measureBaseline(getComputedStyle(inner).fontFamily, wordWeight, word));
      const next = fitSize(measured, target, target * 0.42);
      inner.style.fontSize = next + 'px';
      setSize(next);
      place();
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    fit();
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    let alive = true;
    const again = () => alive && schedule();
    document.fonts?.ready.then(again);
    // A fonte da palavra pode só ser pedida quando a palavra aparece: remede quando ela chegar.
    document.fonts?.load(wordWeight + ' 100px ' + getComputedStyle(inner).fontFamily, word).then(again, () => {});
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [word, fontSans, dfont, wordWeight, wordTracking]);

  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.12 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReduced(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const set = (b: number, px: number, py: number, g: number) => {
      root.style.setProperty('--bwf-b', b.toFixed(2) + '%');
      root.style.setProperty('--bwf-px', px.toFixed(1) + 'px');
      root.style.setProperty('--bwf-py', py.toFixed(1) + 'px');
      root.style.setProperty('--bwf-g', g.toFixed(3));
    };
    const still = reduced || !animate;
    if (still || !visible) {
      const p = ptr.current;
      set(58, p.x, p.y, p.inside ? 1 : 0);
      if (!still) return;
      const onMove = () => set(58, ptr.current.x, ptr.current.y, ptr.current.inside ? 1 : 0);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerleave', onMove);
      return () => {
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerleave', onMove);
      };
    }
    // Só chega aqui com o rodapé visível: o laço para quando ele sai da tela.
    let raf = 0;
    let last = performance.now();
    let t = last / 1000;
    let b = 58;
    let px = ptr.current.x;
    let py = ptr.current.y;
    let g = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      const p = ptr.current;
      const idle = drift(t);
      const target = p.inside ? beamTarget(p.u) * 0.75 + idle * 0.25 : idle;
      b = approach(b, target, 0.035, dt);
      px = approach(px, p.x, 0.16, dt);
      py = approach(py, p.y, 0.16, dt);
      g = approach(g, p.inside ? 1 : 0, 0.06, dt);
      set(b, px, py, g);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, animate, visible]);

  const onPointer = (e: React.PointerEvent<HTMLElement>) => {
    // toque não tem hover: o brilho fica só para mouse e caneta
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = ptr.current;
    p.x = e.clientX - r.left;
    p.y = e.clientY - r.top;
    p.u = r.width ? p.x / r.width : 0.5;
    p.inside = e.type !== 'pointerleave';
  };

  const hop = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (reduced) return;
    const el = e.currentTarget;
    el.classList.remove('is-hop');
    void el.offsetWidth;
    el.classList.add('is-hop');
  };

  const follow = (e: React.MouseEvent<HTMLAnchorElement>, label: string, href?: string) => {
    if (!href || href === '#') e.preventDefault();
    onLinkClick?.(label, href, e);
  };

  const hot = accentHot ?? accent;
  const vars = {
    '--bwf-bg': background,
    '--bwf-bg-rgb': hexToRgb(background, '11, 7, 9'),
    '--bwf-ink': ink,
    '--bwf-ink-rgb': hexToRgb(ink, '245, 238, 240'),
    '--bwf-muted': muted,
    '--bwf-acc': hexToRgb(accent),
    '--bwf-hot': hexToRgb(hot),
    '--bwf-wt': wordTop,
    '--bwf-wf': wordFoot,
    '--bwf-sans': fontSans,
    '--bwf-dfont': dfont,
    '--bwf-ww': String(wordWeight),
    '--bwf-track': wordTracking + 'em',
    '--bwf-ang': '118deg',
    '--bwf-b': '58%',
    '--bwf-px': '50%',
    '--bwf-py': '50%',
    '--bwf-g': '0',
    '--bwf-top': '0px',
    '--bwf-bot': '100%',
  } as React.CSSProperties;

  const label = company ?? brand;
  let d = 0;
  const delay = () => ({ '--bwf-d': (d += 70) + 'ms' }) as React.CSSProperties;

  return (
    <footer
      ref={rootRef}
      className={'bwf ' + className}
      style={vars}
      data-in={seen || reduced ? 'true' : 'false'}
      onPointerMove={onPointer}
      onPointerEnter={onPointer}
      onPointerLeave={onPointer}
    >
      <style>{CSS}</style>
      <div className="bwf-rule" aria-hidden="true" />
      <div className="bwf-sky" aria-hidden="true">
        <div className="bwf-wash" />
        <div className="bwf-bands" />
        <div className="bwf-beam" />
        <div className="bwf-glow" />
        <div className="bwf-grain" />
      </div>

      <div className="bwf-inner">
        <div className="bwf-col">
          <p className="bwf-label" style={delay()}>
            © {year} {label}
          </p>
          {(socials.length > 0 || cta) && (
            <ul className="bwf-socials">
              {socials.map((s, i) => (
                <li key={s.label + i} className="bwf-fade" style={delay()}>
                  <a className="bwf-soc" href={s.href || '#'} aria-label={s.label} onClick={(e) => follow(e, s.label, s.href)} {...ext(s.href)}>
                    <Icon icon={s.icon} />
                    <span className="bwf-tip" aria-hidden="true">
                      {s.label}
                    </span>
                  </a>
                </li>
              ))}
              {cta && (
                <li className="bwf-fade" style={delay()}>
                  <a className="bwf-pill" href={cta.href} aria-label={cta.ariaLabel ?? cta.label} onClick={(e) => follow(e, cta.label, cta.href)} {...ext(cta.href)}>
                    <span className="bwf-pair" aria-hidden="true">
                      {cta.mark && <span className="bwf-pair-m">{cta.mark}</span>}
                      {cta.icon && (
                        <span className="bwf-pair-w">
                          <Icon icon={cta.icon} />
                        </span>
                      )}
                    </span>
                    <span>{cta.label}</span>
                    <span className="bwf-tip" aria-hidden="true">
                      {cta.tip ?? cta.label}
                    </span>
                  </a>
                </li>
              )}
            </ul>
          )}
          {credits.length > 0 && (
            <div className="bwf-credits">
              {credits.map((c, i) => (
                <p key={i} className={'bwf-fade' + (c.icon ? ' bwf-credit--i' : '')} style={delay()}>
                  {c.icon && (
                    <span className="bwf-credit-i" aria-hidden="true">
                      <Icon icon={c.icon} />
                    </span>
                  )}
                  {c.lead}
                  {c.href ? (
                    <a href={c.href} onClick={(e) => follow(e, c.label, c.href)} {...ext(c.href)}>
                      {c.label}
                    </a>
                  ) : (
                    <b>{c.label}</b>
                  )}
                  {c.tail}
                </p>
              ))}
            </div>
          )}
        </div>

        {columns.map((col, ci) => (
          <nav key={col.title + ci} className="bwf-col" aria-label={col.title}>
            <p className="bwf-label" style={delay()}>
              {col.title}
            </p>
            <ul className={'bwf-links' + (col.compact ? ' bwf-links--compact' : '')}>
              {col.links.map((l, li) => {
                const rich = !!(l.hint?.length || l.cta);
                return (
                  <li key={l.label + li} className="bwf-fade" style={delay()}>
                    <a
                      className={'bwf-link' + (rich ? ' bwf-link--rich' : '')}
                      href={l.href || '#'}
                      onClick={(e) => follow(e, l.label, l.href)}
                      {...ext(l.href)}
                    >
                      {rich ? (
                        <span className="bwf-link-t">
                          <span className="bwf-link-l">{l.label}</span>
                          {([] as string[]).concat(l.hint ?? []).map((h, hi) => (
                            <span key={hi} className="bwf-link-h">
                              {h}
                            </span>
                          ))}
                          {l.cta && (
                            <span className="bwf-link-c">
                              {l.cta}
                              <Arrow />
                            </span>
                          )}
                        </span>
                      ) : (
                        <>
                          <span className="bwf-link-t">{l.label}</span>
                          <Arrow />
                        </>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div ref={wordRef} className="bwf-word" style={{ height: size ? wordHeight(size, base, cut) : 'calc(' + (0.8 + cut) * 12 + 'cqw)' }}>
        <p className="sr-only">{word}</p>
        <div className="bwf-word-box">
          <div ref={innerRef} className="bwf-word-in" aria-hidden="true">
            {letters.map((ch, i) => (
              <span key={i} className="bwf-lw" style={{ '--bwf-d': 260 + i * 75 + 'ms' } as React.CSSProperties}>
                <span className="bwf-l" onClick={hop} onAnimationEnd={(e) => e.currentTarget.classList.remove('is-hop')}>
                  {ch === ' ' ? ' ' : ch}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="bwf-foot" aria-hidden="true" />
      </div>
    </footer>
  );
}
