import { useEffect, useRef, useState } from 'react';
import { Botao } from '../ds/Botao';
import { linkContato } from '../content';
import { ENTRADA_FECHOU, entradaAberta } from './Entrada';
import './hero.css';

/*
  Hero da página teste: o globo no centro, sobre a foto apagada, com o símbolo grande ao fundo e o título embaixo.
  (Versão única; as variações 2 e 3 foram descartadas pelo cliente.)

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

function Foto() {
  return (
    <picture className="hr-foto">
      <source media="(max-width: 999px)" srcSet="/hero-mobile.webp" width={1080} height={1080} />
      <img src="/hero-desktop.webp" alt="" width={1920} height={1080} fetchPriority="high" decoding="async" />
    </picture>
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
      className={`hr${vivo ? ' is-vivo' : ''}`}
      aria-labelledby="hr-h1"
    >
      <Foto />
      <div className="hr-veu" aria-hidden="true" />
      <div className="hr-palco">
        <img className="hr-simbolo" src="/icone-contorno.svg" alt="" aria-hidden="true" />
        <Globo className="hr-globo--centro" ativo={livre} />
      </div>
      <Texto />
    </section>
  );
}
