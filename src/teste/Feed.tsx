import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Botao } from '../ds/Botao';
import { empresa } from './dados';
import './feed.css';

/*
  Feed: celular com o Instagram da Marketins. Duas versões (?feed=1|2):
  1: perfil → posts um a um → Reels do Sérgio (vídeo toca, a música do site pausa).
  2: posts um a um → termina no perfil com "Ver os Reels" / "Seguir".
  A seção é alta e o palco fica preso (position: sticky); o ScrollTrigger só lê o progresso
  e troca a etapa. Cada etapa anima o trilho do celular até o post seguinte (passo a passo).
  Fundo em camadas: brilhos, o contorno do símbolo em três escalas e posts soltos em volta,
  cada um com um parallax diferente. prefers-reduced-motion: sem palco preso, o feed rola
  à mão dentro do celular e o vídeo vem com controles.
*/

// Números do perfil @marketins.mkt conferidos no print de 10/10/2026. Atualizar quando mudar.
const perfil = { posts: '337', seguidores: '4.509', seguindo: '116', data: '10/10/2026' };

const posts: { src: string; alt: string; legenda: string }[] = [
  { src: '/conecta/salve-a-data.webp', alt: 'Post do Marketins Conecta: 16 de outubro, salve essa data', legenda: 'Marketins Conecta: 16 de outubro. Salve essa data.' },
  { src: '/conecta/time-conecta.webp', alt: 'Post do Marketins Conecta com o time da agência', legenda: 'O time no Marketins Conecta.' },
  { src: '/trabalhos/04.webp', alt: 'Post da Marketins: "Quem é a Marketins?"', legenda: 'Quem é a Marketins?' },
  { src: '/trabalhos/08.webp', alt: 'Post da Marketins: "Onde estamos?" com as unidades', legenda: 'Onde estamos? Nova Iguaçu e São João de Meriti.' },
  { src: '/trabalhos/01.webp', alt: 'Arte da Marketins para a Mozi: caixa de salgados', legenda: 'Arte para a Mozi.' },
  { src: '/trabalhos/06.webp', alt: 'Arte da Marketins para o BNI Baixada RJ', legenda: 'Arte para o BNI Baixada RJ.' },
];

type Var = 1 | 2;
const lerVar = (): Var => (new URLSearchParams(location.search).get('feed') === '2' ? 2 : 1);

// mesmo contrato do IphoneReels antigo: o Assistente pausa e retoma a música por este evento
const somDoSite = (acao: 'pausar' | 'retomar') =>
  window.dispatchEvent(new CustomEvent('marketins:musica', { detail: acao }));

const POSTS_IDS = posts.map((_, i) => `p${i}`);
const etapasDe = (v: Var) => (v === 1 ? ['perfil', ...POSTS_IDS, 'reel'] : [...POSTS_IDS, 'perfil']);
// quanto de scroll cada etapa ocupa: a primeira já aparece antes de prender; o fim (Reels/perfil) fica mais
const pesoDe = (e: string, i: number) => (e === 'reel' ? 2.4 : i === 0 ? 0.8 : e === 'perfil' ? 1.8 : 1);
const etapaNo = (etapas: string[], p: number) => {
  const pesos = etapas.map(pesoDe);
  let alvo = p * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pesos.length; i++) { alvo -= pesos[i]; if (alvo < 0) return i; }
  return etapas.length - 1;
};

/* ícones do app (traço) */
const I = {
  coracao: 'M12 20.5s-7.6-4.5-9.4-9.4C1.4 7.7 3.6 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.3 0 5.5 3.2 4.3 6.6-1.8 4.9-9.4 9.4-9.4 9.4z',
  balao: 'M20.6 11.6a8.4 8.4 0 1 1-3.4-6.8 8.4 8.4 0 0 1 3.4 6.8zM20.6 20.6l-2.1-4.2',
  envio: 'M21.5 3 10 13.2M21.5 3l-6.7 18-4.8-7.8L2.5 9.2z',
  salvar: 'M18.5 20.5 12 15.6l-6.5 4.9V4.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1z',
  casa: 'M3.5 10.2 12 3.5l8.5 6.7v10.3h-5.6v-6h-5.8v6H3.5z',
  lupa: 'M10.8 18.2a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8zM16.2 16.2l4.3 4.3',
  mais: 'M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5zM12 8v8M8 12h8',
  reels: 'M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5zM3.5 8.5h17M9 3.5l2.6 5M14.8 3.5l2.6 5M10.2 11.6v5.6l4.8-2.8z',
  grade: 'M3.5 3.5h17v17h-17zM9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17',
  voltar: 'M15 4.5 7.5 12l7.5 7.5',
  somOn: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 8.8a4.5 4.5 0 0 1 0 6.4M18.2 6.2a8.2 8.2 0 0 1 0 11.6',
  somOff: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5',
};
function Ic({ d, cheio, className }: { d: string; cheio?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"
      fill={cheio ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/* contorno do símbolo (public/icone-contorno.svg) em linha: o traço vira gradiente e engrossa no CSS */
let contornoCache = '';
function useContorno(ativo: boolean) {
  const [svg, setSvg] = useState(contornoCache);
  useEffect(() => {
    if (!ativo || svg) return;
    let vivo = true;
    fetch('/icone-contorno.svg').then((r) => r.text()).then((t) => {
      const m = t.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
      if (m && vivo) { contornoCache = m[1]; setSvg(m[1]); }
    }).catch(() => {});
    return () => { vivo = false; };
  }, [ativo, svg]);
  return svg;
}
function Eco({ svg, className, ...resto }: { svg: string; className: string; 'data-prof'?: string; 'data-giro'?: string }) {
  return (
    <div className={`fd-eco ${className}`} {...resto}>
      {svg && <svg viewBox="0 0 736 726" preserveAspectRatio="xMidYMid meet" dangerouslySetInnerHTML={{ __html: svg }} />}
    </div>
  );
}

function Avatar({ tam }: { tam: 'g' | 'p' }) {
  return <span className={`fd-av fd-av--${tam}`}><img src="/icone.svg" alt="" width="64" height="64" /></span>;
}

export function Feed() {
  const [v, setV] = useState<Var>(lerVar);
  const [etapa, setEtapa] = useState(0);
  const [perto, setPerto] = useState(false);
  const [calmo] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [tocando, setTocando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [prog, setProg] = useState(0);

  const sec = useRef<HTMLElement>(null);
  const janela = useRef<HTMLDivElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const musicaPausada = useRef(false);

  const etapas = etapasDe(v);
  const N = etapas.length;
  const atual = etapas[Math.min(etapa, N - 1)];
  const itens = etapas.filter((e) => e !== 'reel');
  const itemAtual = Math.min(etapa, itens.length - 1);
  const noReel = !calmo && atual === 'reel';
  const postAtual = atual.startsWith('p') ? Number(atual.slice(1)) : -1;
  const carregar = perto ? 'eager' : 'lazy';
  const contorno = useContorno(perto);

  const trocarVar = (n: Var) => {
    if (n === v) return;
    setV(n);
    setEtapa(0);
    const url = new URL(location.href);
    url.searchParams.set('feed', String(n));
    history.replaceState(history.state, '', url);
  };

  /* scroll: proximidade, etapa, parallax e saída */
  useLayoutEffect(() => {
    const el = sec.current!;
    const q = gsap.utils.selector(el);
    const sair = () => {
      const vid = video.current; if (!vid) return;
      delete vid.dataset.pausadoPeloUsuario;
      if (!vid.paused) vid.pause();
    };
    const fixos = [
      ScrollTrigger.create({ trigger: el, start: 'top bottom+=120%', end: 'bottom top-=60%', onToggle: (st) => st.isActive && setPerto(true) }),
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onLeave: sair, onLeaveBack: sair }),
    ];
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: el, start: 'top top', end: 'bottom bottom',
        onUpdate: (st) => setEtapa(etapaNo(etapasDe(v), st.progress)),
        onLeaveBack: () => setEtapa(0),
      });
      const faixa = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
      q<HTMLElement>('[data-prof]').forEach((c) => {
        const d = Number(c.dataset.prof);
        const g = Number(c.dataset.giro || 0);
        gsap.fromTo(c, { y: 160 * d, rotate: -g }, { y: -160 * d, rotate: g, ease: 'none', scrollTrigger: faixa });
      });
      gsap.fromTo(q('.fd-cel'), { rotateY: -14, rotateX: 6 }, { rotateY: 10, rotateX: -3, ease: 'none', scrollTrigger: faixa });
    });
    return () => { fixos.forEach((s) => s.kill()); mm.revert(); };
  }, [v]);

  /* passo a passo: o trilho anda até o item da etapa */
  const mover = useRef<(inst?: boolean) => void>(() => {});
  mover.current = (inst = false) => {
    const t = trilho.current, j = janela.current; if (!t || !j || calmo) return;
    const item = t.children[itemAtual] as HTMLElement | undefined; if (!item) return;
    const max = Math.max(0, t.scrollHeight - j.clientHeight);
    gsap.to(t, { y: -Math.min(item.offsetTop, max), duration: inst ? 0 : 0.8, ease: 'power3.out', overwrite: true });
  };
  useLayoutEffect(() => { mover.current(); }, [itemAtual, v]);
  useEffect(() => {
    const j = janela.current; if (!j || calmo) return;
    let primeira = true;
    const ro = new ResizeObserver(() => { if (primeira) { primeira = false; return; } mover.current(true); });
    ro.observe(j);
    return () => ro.disconnect();
  }, [calmo]);

  /* entrou no Reels: toca (com som se o navegador deixar); saiu: pausa */
  useEffect(() => {
    const vid = video.current; if (!vid || calmo) return;
    if (noReel) {
      if (vid.paused && !vid.dataset.pausadoPeloUsuario) {
        vid.muted = false; setMudo(false);
        vid.play().catch(() => { vid.muted = true; setMudo(true); vid.play().catch(() => {}); });
      }
    } else {
      delete vid.dataset.pausadoPeloUsuario;
      if (!vid.paused) vid.pause();
    }
  }, [noReel, calmo]);

  useEffect(() => () => { if (musicaPausada.current) somDoSite('retomar'); }, []);

  /* seção à vista: esconde os flutuantes (Conecta e Assistente) para não cobrir a barra do celular */
  useEffect(() => {
    const el = sec.current; if (!el || typeof IntersectionObserver === 'undefined') return;
    const raiz = document.documentElement;
    const io = new IntersectionObserver(([e]) => raiz.classList.toggle('sem-flutuantes', e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); raiz.classList.remove('sem-flutuantes'); };
  }, []);

  const aoTocar = () => {
    setTocando(true);
    if (!musicaPausada.current) { musicaPausada.current = true; somDoSite('pausar'); }
  };
  const aoPausar = () => {
    setTocando(false);
    if (musicaPausada.current) { musicaPausada.current = false; somDoSite('retomar'); }
  };
  const alternar = () => {
    const vid = video.current; if (!vid) return;
    if (vid.paused) { delete vid.dataset.pausadoPeloUsuario; vid.play().catch(() => {}); }
    else { vid.dataset.pausadoPeloUsuario = '1'; vid.pause(); }
  };
  const alternarSom = () => {
    const vid = video.current; if (!vid) return;
    vid.muted = !vid.muted; setMudo(vid.muted);
    if (vid.paused) { delete vid.dataset.pausadoPeloUsuario; vid.play().catch(() => {}); }
  };

  const rotulo = atual === 'perfil' ? 'Perfil' : atual === 'reel' ? 'Reels' : `Post ${postAtual + 1}/${posts.length}`;
  const preload = !perto ? 'none' : etapa >= N - 3 ? 'auto' : 'metadata';

  const blocoPerfil = (
    <div className={`fd-perfil${v === 2 ? ' fd-perfil--fim' : ''}`} key="perfil">
      <div className="fd-perfil__topo">
        <a href={empresa.instagram} target="_blank" rel="noopener" aria-label="Abrir o Instagram da Marketins"><Avatar tam="g" /></a>
        <div className="fd-perfil__id">
          <p className="fd-perfil__user">marketins.mkt</p>
          <dl className="fd-perfil__nums" title={`Números de ${perfil.data}`}>
            <div><dt>posts</dt><dd>{perfil.posts}</dd></div>
            <div><dt>seguidores</dt><dd>{perfil.seguidores}</dd></div>
            <div><dt>seguindo</dt><dd>{perfil.seguindo}</dd></div>
          </dl>
        </div>
      </div>
      <div className="fd-perfil__bio">
        <p className="fd-perfil__nome">MARKETINS | Agência de Marketing</p>
        <p className="fd-perfil__cat">Agência de marketing</p>
        <p>A Agência de Marketing que te entrega tudo que você precisa para decolar!</p>
        <p>São mais de 100 clientes satisfeitos</p>
        <p>Nova Iguaçu · São João de Meriti</p>
      </div>
      <div className="fd-perfil__acoes">
        <Botao href={empresa.reels} hover="Bora assistir" compacto>Ver os Reels</Botao>
        <Botao href={empresa.instagram} variante="seta" compacto>Seguir</Botao>
      </div>
      <div className="fd-perfil__abas" aria-hidden="true">
        <span className="is-on"><Ic d={I.grade} /></span><span><Ic d={I.reels} /></span>
      </div>
      <ul className="fd-perfil__grade" aria-label="Últimos posts">
        {posts.map((p) => (
          <li key={p.src}>
            <a href={empresa.instagram} target="_blank" rel="noopener">
              <img src={p.src} alt={p.alt} loading={carregar} decoding="async" width="320" height="400" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  const blocosPosts = posts.map((p, i) => (
    <article className={`fd-post${!calmo && postAtual === i ? ' is-on' : ''}`} key={p.src}>
      <header><Avatar tam="p" /><b>marketins.mkt</b><span aria-hidden="true">···</span></header>
      <a className="fd-post__img" href={empresa.instagram} target="_blank" rel="noopener">
        <img src={p.src} alt={p.alt} loading={carregar} decoding="async" width="640" height="800" />
        <Ic d={I.coracao} cheio className="fd-post__pop" />
      </a>
      <div className="fd-post__acoes" aria-hidden="true">
        <Ic d={I.coracao} cheio={!calmo && postAtual === i} className="fd-post__curtir" /><Ic d={I.balao} /><Ic d={I.envio} />
        <Ic d={I.salvar} className="fd-post__salvar" />
      </div>
      <p className="fd-post__leg"><b>marketins.mkt</b> {p.legenda}</p>
    </article>
  ));

  const videoEl = (
    <video ref={video} src="/media/reels.mp4" poster={perto ? '/media/reels-capa.webp' : undefined}
      loop playsInline preload={calmo ? 'none' : preload} controls={calmo}
      aria-label="Reels da Marketins com o Sérgio"
      onPlay={aoTocar} onPause={aoPausar}
      onTimeUpdate={(e) => { const x = e.currentTarget; setProg(x.duration ? x.currentTime / x.duration : 0); }} />
  );

  return (
    <section id="feed" ref={sec} className={`fd fd--v${v}${calmo ? ' fd--calmo' : ''}`} aria-labelledby="fd-titulo"
      style={{ '--fd-etapas': N } as CSSProperties}>
      <div className="fd-palco">
        <div className="fd-fundo" aria-hidden="true">
          <div className="fd-luz fd-luz--a" data-prof="0.35" />
          <div className="fd-luz fd-luz--b" data-prof="0.6" />
          <svg className="fd-defs" width="0" height="0" focusable="false">
            <defs>
              <linearGradient id="fd-grad" gradientUnits="userSpaceOnUse" x1="80" y1="60" x2="660" y2="680">
                <stop offset="0.1" stopColor="#d0004d" /><stop offset="0.9" stopColor="#fe5223" />
              </linearGradient>
            </defs>
          </svg>
          <Eco svg={contorno} className="fd-eco--longe" data-prof="0.15" data-giro="6" />
          <div className="fd-marca" data-prof="0.45" data-giro="3">
            <div className="fd-marca__cheio" />
            <Eco svg={contorno} className="fd-eco--brilho" />
            <Eco svg={contorno} className="fd-eco--linha" />
          </div>
          <Eco svg={contorno} className="fd-eco--perto" data-prof="1.1" data-giro="-10" />
          <div className="fd-veu" />
        </div>

        <div className="fd-miolo">
          <div className="fd-texto">
            <header className="fd-cabeca" data-revela>
              <p className="t-num">Instagram</p>
              <h2 id="fd-titulo" className="fd-titulo">A gente vive <span>no feed</span></h2>
              <p className="fd-sub">Rola a página que o feed anda.</p>
            </header>
            {!calmo && (
              <div className="fd-passos" aria-hidden="true">
                <span className="fd-passos__rot">{rotulo}</span>
                <span className="fd-passos__trilho">
                  {etapas.map((e, i) => <i key={e} className={i <= etapa ? 'is-on' : ''} />)}
                </span>
              </div>
            )}
            <div className="fd-var" role="group" aria-label="Comparar versões da seção do feed">
              <span aria-hidden="true">Feed</span>
              {([1, 2] as Var[]).map((n) => (
                <button key={n} type="button" aria-pressed={v === n} aria-label={`Versão ${n}${n === 1 ? ', com o Reels' : ', termina no perfil'}`} onClick={() => trocarVar(n)}>{n}</button>
              ))}
            </div>
          </div>

          <div className="fd-area">
            <div className="fd-cena">
              <img className="fd-solto fd-solto--a" src={posts[2].src} alt="" loading={carregar} decoding="async" data-prof="0.7" />
              <img className="fd-solto fd-solto--b" src={posts[4].src} alt="" loading={carregar} decoding="async" data-prof="0.9" />
              <img className="fd-solto fd-solto--c" src={posts[1].src} alt="" loading={carregar} decoding="async" data-prof="1.5" />

              <div className="fd-cel" role="group" aria-label="Instagram da Marketins no celular">
                <div className="fd-cel__tela">
                  <div className="fd-cel__ilha" aria-hidden="true" />
                  <div className="fd-app__barra" aria-hidden="true">
                    <Ic d={I.voltar} />
                    {atual === 'perfil'
                      ? <b>marketins.mkt</b>
                      : <span className="fd-app__dupla"><small>MARKETINS.MKT</small><b>Publicações</b></span>}
                    <i />
                  </div>

                  <div className="fd-janela" ref={janela} data-lenis-prevent={calmo ? '' : undefined} tabIndex={calmo ? 0 : undefined}
                    aria-label={calmo ? 'Feed do Instagram, role para ver' : undefined}>
                    <div className="fd-trilho" ref={trilho}>
                      {v === 1 ? [blocoPerfil, ...blocosPosts] : [...blocosPosts, blocoPerfil]}
                      {calmo && v === 1 && <div className="fd-reel fd-reel--lista" key="reel">{videoEl}</div>}
                    </div>
                  </div>

                  {!calmo && v === 1 && (
                    <div className={`fd-reel${noReel ? ' is-on' : ''}`} aria-hidden={!noReel}>
                      {videoEl}
                      <button className="fd-reel__toque" type="button" onClick={alternar} tabIndex={noReel ? 0 : -1}
                        aria-label={tocando ? 'Pausar o Reels' : 'Tocar o Reels'} />
                      <p className="fd-reel__topo"><b>Reels</b></p>
                      <button className="fd-reel__som" type="button" onClick={alternarSom} tabIndex={noReel ? 0 : -1}
                        aria-label={mudo ? 'Ligar o som' : 'Tirar o som'}>
                        <Ic d={mudo ? I.somOff : I.somOn} />
                      </button>
                      {mudo && <button className="fd-reel__ouvir" type="button" onClick={alternarSom} tabIndex={noReel ? 0 : -1}>Toque para ouvir</button>}
                      <div className="fd-reel__lado" aria-hidden="true"><Ic d={I.coracao} /><Ic d={I.balao} /><Ic d={I.envio} /></div>
                      <div className="fd-reel__base">
                        <span className="fd-reel__quem"><Avatar tam="p" /><b>marketins.mkt</b></span>
                        <a href={empresa.reels} target="_blank" rel="noopener" tabIndex={noReel ? 0 : -1}>Mais Reels no Instagram ↗</a>
                      </div>
                      <span className="fd-reel__barra" aria-hidden="true"><i style={{ transform: `scaleX(${prog})` }} /></span>
                    </div>
                  )}

                  <nav className="fd-app__nav" aria-hidden="true">
                    <Ic d={I.casa} /><Ic d={I.lupa} /><Ic d={I.mais} /><Ic d={I.reels} /><Avatar tam="p" />
                  </nav>
                </div>
                <div className="fd-cel__reflexo" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
