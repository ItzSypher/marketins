import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Botao } from '../ds/Botao';
import { linkContato } from '../content';
import { ENTRADA_FECHOU, entradaAberta } from './Entrada';
import type { Opcoes, Vista } from './heroGlobo';
import './hero.css';

/*
  Hero da página teste com o globo 3D. Três variações para o cliente comparar (?hero=1|2|3, padrão 1):
  1 "Globo no centro": foto apagada, símbolo grande ao fundo, globo no meio, título embaixo.
  2 "Globo como horizonte": o globo nasce da borda de baixo como um planeta, título em cima.
  3 "O megafone anuncia pro mundo": Sérgio de um lado, arcos saem do megafone e caem no globo, título do outro.

  h1: uma frase só para busca e leitura. O trecho pequeno ("Agência de marketing na Baixada Fluminense") leva
  o termo local que as pessoas pesquisam; a frase do cliente é o título grande. Os dois ficam dentro do mesmo h1.
*/
type Variacao = 1 | 2 | 3;
const VARIACAO: Variacao = (() => {
  const n = Number(new URLSearchParams(location.search).get('hero'));
  return n === 2 || n === 3 ? n : 1;
})();

const NOMES: Record<Variacao, string> = { 1: 'Globo no centro', 2: 'Globo como horizonte', 3: 'O megafone anuncia pro mundo' };
const ROTULO_GLOBO = 'Globo com a Baixada Fluminense e o Rio de Janeiro em destaque e arcos saindo do Rio para cidades do mundo';
const FOV = 30;
/** raio da esfera na tela, como fração do lado do quadro, para a câmera a z */
const raio = (z: number) => Math.tan(Math.asin(1 / z)) / Math.tan((FOV / 2) * (Math.PI / 180)) / 2;
const RIO_LAT = -22.9;

/* ───────── configuração do globo em cada variação ───────── */
type Config = Omit<Opcoes, 'reduzido' | 'aoFalhar'>;

/** 2: um planeta que nasce da borda de baixo. O Rio fica perto do topo da curva; os arcos somem no horizonte. */
function configHorizonte(): Config {
  const w = innerWidth, h = innerHeight, mobile = w < 1000;
  const z = 4.2, f = raio(z);
  // o host ocupa a parte de baixo da hero; a altura dele vem do CSS (--hr-chao)
  const hostH = h * (mobile ? 0.5 : 0.5);
  const R = mobile ? w * 1.15 : Math.max(w * 0.6, h * 0.9);
  const topo = hostH * (mobile ? 0.07 : 0.1);
  const visivel = hostH - topo;
  // ângulo do Rio a partir do ponto de frente, para cair a ~28% da curva visível
  const s = Math.min(0.98, Math.max(0.2, (R - visivel * 0.28) / R));
  const lat = RIO_LAT - Math.asin(s) * (180 / Math.PI);
  const vista: Vista = { lat, lon: -43.3, z };
  return {
    vistas: [vista, vista, vista], etapa: 2, ciclo: false, origemSempre: true,
    pontos: mobile ? 30000 : 70000,
    quadro: (W, H) => {
      const Rr = mobile ? W * 1.15 : Math.max(W * 0.6, innerHeight * 0.9);
      const S = Rr / f;
      return { S, x: (W - S) / 2, y: H * (mobile ? 0.07 : 0.1) + Rr - S / 2 };
    },
  };
}

/** 3: o Rio fica do lado do megafone (direita, embaixo) e os arcos se abrem para o resto do globo. */
function configMegafone(): Config {
  const vista: Vista = { lat: 4, lon: -66, z: 4.4 };
  return { vistas: [vista, vista, vista], etapa: 2, ciclo: false, origemSempre: true };
}

/* ───────── a página fica à vista quando a entrada fecha ───────── */
function usePaginaAVista() {
  const [livre, setLivre] = useState(() => !entradaAberta());
  useEffect(() => {
    if (livre) return;
    if (!entradaAberta()) { setLivre(true); return; }
    const abrir = () => setLivre(true);
    addEventListener(ENTRADA_FECHOU, abrir);
    return () => removeEventListener(ENTRADA_FECHOU, abrir);
  }, [livre]);
  return livre;
}

/* ───────── globo: carrega o three só quando perto, some se o WebGL falhar ───────── */
type Controle = { destruir: () => void };

function Globo({ className, config, ativo }: { className: string; config?: () => Config; ativo: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const cfg = useRef(config);
  cfg.current = config;
  const [estado, setEstado] = useState<'espera' | 'pronto' | 'falhou'>('espera');

  // enquanto a entrada está aberta, só adianta o download
  useEffect(() => {
    if (!ativo) { import('./heroGlobo').catch(() => {}); return; }
    const el = host.current;
    if (!el) return;
    let vivo = true;
    let c: Controle | null = null;
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const falhou = () => { c?.destruir(); c = null; if (vivo) setEstado('falhou'); };
    const carregar = () => {
      Promise.all([import('three'), import('./heroGlobo')])
        .then(([THREE, motor]) => {
          if (!vivo) return;
          try {
            c = motor.criarGlobo(THREE, el, { ...(cfg.current?.() ?? {}), reduzido, aoFalhar: falhou });
            setEstado('pronto');
          } catch { falhou(); }
        })
        .catch(falhou);
    };
    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io?.disconnect(); carregar(); } }, { rootMargin: '300px 0px' });
      io.observe(el);
    } else carregar();
    return () => { vivo = false; io?.disconnect(); c?.destruir(); c = null; };
  }, [ativo]);

  if (estado === 'falhou') return null;
  return <div ref={host} className={`hr-globo ${className}${estado === 'pronto' ? ' is-pronto' : ''}`} role="img" aria-label={ROTULO_GLOBO} />;
}

/* ───────── partes ───────── */
function Texto() {
  return (
    <div className="hr-txt">
      <h1 className="hr-h1" id="hr-h1">
        <span className="hr-h1__local">Agência de marketing na Baixada Fluminense</span>
        <span className="hr-sr">. </span>
        <span className="hr-h1__frase">
          <span>Marketing, da <em>Baixada</em> pro <em>RJ</em>.</span>{' '}
          <span>Do RJ pro <em>mundo</em>.</span>
        </span>
      </h1>
      <p className="hr-apoio">Social media, design, audiovisual e tráfego pago, tudo com o mesmo time. Primeiro a gente entende o seu negócio.</p>
      <div className="hr-cta">
        <Botao href={linkContato('página teste · hero')}>Agendar reunião</Botao>
      </div>
    </div>
  );
}

function Foto({ className = '' }: { className?: string }) {
  return (
    <picture className={`hr-foto ${className}`}>
      <source media="(max-width: 999px)" srcSet="/hero-mobile.webp" width={1080} height={1080} />
      <img src="/hero-desktop.webp" alt="" width={1920} height={1080} fetchPriority="high" decoding="async" />
    </picture>
  );
}

function Seletor() {
  const link = (n: Variacao) => {
    const p = new URLSearchParams(location.search);
    p.set('hero', String(n));
    return `?${p.toString()}${location.hash}`;
  };
  return (
    <nav className="hr-sel" aria-label="Variações da hero">
      <span>Hero</span>
      {([1, 2, 3] as Variacao[]).map((n) => (
        <a key={n} href={link(n)} title={NOMES[n]} aria-current={n === VARIACAO ? 'page' : undefined}>{n}</a>
      ))}
    </nav>
  );
}

/** Arcos do megafone até o globo (coordenadas da foto: 1000×1000 no celular, 1600×900 no desktop). */
function Arcos() {
  const mob = ['M700,128 C640,-150 400,-90 352,318', 'M716,140 C700,-60 520,-40 300,300', 'M690,150 C560,-20 330,40 250,250'];
  const desk = ['M1252,112 C1190,-170 940,-150 870,330', 'M1262,124 C1240,-60 1060,-60 820,300', 'M1240,140 C1110,0 900,40 760,250'];
  const desenho = (d: string[], vb: string, cls: string) => (
    <svg className={`hr-arcos ${cls}`} viewBox={vb} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`hr-g-${cls}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fe5223" />
          <stop offset="1" stopColor="#d0004d" />
        </linearGradient>
      </defs>
      {d.map((p, i) => (
        <g key={i} style={{ '--i': i } as CSSProperties}>
          <path className="hr-arcos__base" d={p} stroke={`url(#hr-g-${cls})`} />
          <path className="hr-arcos__luz" d={p} pathLength={1} />
        </g>
      ))}
    </svg>
  );
  return (
    <>
      {desenho(mob, '0 0 1000 1000', 'hr-arcos--mob')}
      {desenho(desk, '0 0 1600 900', 'hr-arcos--desk')}
    </>
  );
}

/* ───────── hero ───────── */
export function Hero() {
  const livre = usePaginaAVista();
  const [vivo, setVivo] = useState(false);
  useEffect(() => {
    if (!livre) return;
    const r = requestAnimationFrame(() => setVivo(true));
    return () => cancelAnimationFrame(r);
  }, [livre]);

  return (
    <section
      id="hero"
      className={`hr hr--v${VARIACAO}${vivo ? ' is-vivo' : ''}`}
      aria-labelledby="hr-h1"
      data-variacao={NOMES[VARIACAO]}
    >
      {VARIACAO === 1 && (
        <>
          <Foto />
          <div className="hr-veu" aria-hidden="true" />
          <div className="hr-palco">
            <img className="hr-simbolo" src="/icone-contorno.svg" alt="" aria-hidden="true" />
            <Globo className="hr-globo--centro" ativo={livre} />
          </div>
          <Texto />
        </>
      )}
      {VARIACAO === 2 && (
        <>
          <Foto />
          <div className="hr-veu" aria-hidden="true" />
          <span className="hr-marca" aria-hidden="true" />
          <Texto />
          <Globo className="hr-globo--chao" config={configHorizonte} ativo={livre} />
          <div className="hr-atmosfera" aria-hidden="true" />
        </>
      )}
      {VARIACAO === 3 && (
        <>
          <img className="hr-simbolo" src="/icone-contorno.svg" alt="" aria-hidden="true" />
          <div className="hr-cena">
            <Foto />
            <div className="hr-veu" aria-hidden="true" />
            <Globo className="hr-globo--megafone" config={configMegafone} ativo={livre} />
            <Arcos />
            <span className="hr-som" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <Texto />
        </>
      )}
      <Seletor />
    </section>
  );
}
