import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Botao } from '../ds/Botao';
import { linkContato } from '../content';
import { ENTRADA_FECHOU, entradaAberta } from './Entrada';
import './hero.css';

/*
  Hero da página teste: o globo no centro, sobre a foto apagada, com o símbolo grande ao fundo e o título embaixo.
  (Versão única; as variações 2 e 3 foram descartadas pelo cliente.)
  Abaixo de 1000px não há foto (nem download dela): só o globo, com o contorno do símbolo grande atrás
  dando profundidade, que desce e gira um pouco com a rolagem (parado com prefers-reduced-motion).

  h1: uma frase só para busca e leitura. O trecho pequeno ("Agência de marketing na Baixada Fluminense") leva
  o termo local que as pessoas pesquisam; a frase do cliente é o título grande. Os dois ficam dentro do mesmo h1.
*/

const ROTULO_GLOBO = 'Globo com a Baixada Fluminense e o Rio de Janeiro em destaque e arcos saindo do Rio para cidades do mundo';

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

function Globo({ className, ativo }: { className: string; ativo: boolean }) {
  const host = useRef<HTMLDivElement>(null);
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
            c = motor.criarGlobo(THREE, el, { reduzido, aoFalhar: falhou });
            setEstado('pronto');
          } catch { falhou(); }
        })
        .catch(falhou);
    };
    // celular: o three (≈190 KB gz) é montado depois que a cortina da entrada sobe e o navegador folga,
    // para o toque de entrada e a primeira rolagem não travarem
    const celular = matchMedia('(max-width: 999px)').matches;
    let espera = 0;
    const quandoFolgar = (f: () => void) => {
      if (!celular) { f(); return; }
      espera = window.setTimeout(() => {
        if ('requestIdleCallback' in window) requestIdleCallback(() => { if (vivo) f(); }, { timeout: 1500 });
        else f();
      }, 1100);
    };
    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io?.disconnect(); quandoFolgar(carregar); } }, { rootMargin: '300px 0px' });
      io.observe(el);
    } else quandoFolgar(carregar);
    return () => { vivo = false; window.clearTimeout(espera); io?.disconnect(); c?.destruir(); c = null; };
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

// GIF transparente de 1px: no celular o <picture> escolhe este e a foto do desktop não é baixada
const VAZIO = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function Foto() {
  return (
    <picture className="hr-foto">
      <source media="(max-width: 999px)" srcSet={VAZIO} />
      <img src="/hero-desktop.webp" alt="" width={1920} height={1080} fetchPriority="high" decoding="async" />
    </picture>
  );
}

/* ───────── celular: o símbolo do fundo acompanha a rolagem (parallax leve) ───────── */
function useParallaxCelular(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const celular = matchMedia('(max-width: 999px)');
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    const aplicar = () => {
      raf = 0;
      if (!celular.matches || reduzido.matches) { el.style.removeProperty('--hr-p'); return; }
      const p = Math.min(1.2, Math.max(0, scrollY / Math.max(1, el.offsetHeight)));
      el.style.setProperty('--hr-p', p.toFixed(4));
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(aplicar); };
    addEventListener('scroll', pedir, { passive: true });
    celular.addEventListener('change', pedir);
    reduzido.addEventListener('change', pedir);
    aplicar();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', pedir);
      celular.removeEventListener('change', pedir);
      reduzido.removeEventListener('change', pedir);
    };
  }, [ref]);
}

/* ───────── hero ───────── */
export function Hero() {
  const livre = usePaginaAVista();
  const [vivo, setVivo] = useState(false);
  const secao = useRef<HTMLElement>(null);
  useParallaxCelular(secao);
  useEffect(() => {
    if (!livre) return;
    const r = requestAnimationFrame(() => setVivo(true));
    return () => cancelAnimationFrame(r);
  }, [livre]);

  return (
    <section
      ref={secao}
      id="hero"
      className={`hr${vivo ? ' is-vivo' : ''}`}
      aria-labelledby="hr-h1"
    >
      <Foto />
      <div className="hr-veu" aria-hidden="true" />
      <div className="hr-palco">
        <div className="hr-fundo" aria-hidden="true">
          <img className="hr-simbolo" src="/icone-contorno.svg" alt="" aria-hidden="true" />
        </div>
        <Globo className="hr-globo--centro" ativo={livre} />
      </div>
      <Texto />
    </section>
  );
}
