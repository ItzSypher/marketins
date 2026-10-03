import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cases, equipe } from '../content';
import { Logo3D } from './Logo3D';

gsap.registerPlugin(ScrollTrigger);

/* ---------- Time: stories. Abre no Sérgio e passa sozinho; clique abre na hora ---------- */
const TEMPO_STORY = 6000;
export function Equipe() {
  const [ativo, setAtivo] = useState(0);
  const [auto, setAuto] = useState(true);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auto || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setTimeout(() => setAtivo((a) => (a + 1) % equipe.length), TEMPO_STORY);
    return () => window.clearTimeout(id);
  }, [ativo, auto]);

  // a foto aberta acompanha o mouse de leve
  const mover = (e: React.PointerEvent) => {
    const el = raiz.current; if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', `${((e.clientX - r.left) / r.width - 0.5) * 2}`);
    el.style.setProperty('--py', `${((e.clientY - r.top) / r.height - 0.5) * 2}`);
  };

  const cols = equipe.map((_, i) => (i === ativo ? '4fr' : '1fr')).join(' ');
  return (
    <div className="equipe2" ref={raiz} onPointerMove={mover} style={{ '--cols': cols } as React.CSSProperties}>
      {equipe.map((p, i) => {
        const aberto = i === ativo;
        return (
          <button
            key={p.nome}
            className={`pessoa${aberto ? ' is-aberto' : ''}`}
            onClick={() => { setAtivo(i); setAuto(false); }}
            aria-expanded={aberto}
            aria-label={aberto ? `${p.nome}. ${p.texto}` : `Ver ${p.nome}`}
          >
            <img src={p.foto} alt="" width="800" height="800" loading="lazy" />
            {aberto && (
              <span className="pessoa__barras" aria-hidden="true">
                {equipe.map((_, j) => (
                  <i key={j} className={j < i ? 'is-visto' : j === i ? (auto ? 'is-agora' : 'is-visto') : ''} />
                ))}
              </span>
            )}
            <span className="pessoa__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span className="pessoa__nome">{p.nome}</span>
            <span className="pessoa__texto">{p.texto}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Mosaico: duas faixas em sentidos opostos, peças inteiras ---------- */
export function Mosaico() {
  const linhas = [cases.slice(0, 11), cases.slice(11)];
  return (
    <div className="mosaico" aria-label="Trabalhos para clientes da Marketins">
      {linhas.map((l, k) => (
        <div key={k} className={`mosaico__trilho${k ? ' mosaico__trilho--volta' : ''}`}>
          {[...l, ...l].map((c, i) => (
            <img key={i} src={c.img} alt={i < l.length ? `Case ${c.nome}` : ''} aria-hidden={i >= l.length} width="800" height="568" loading="lazy" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Música do site: outros blocos pedem pausa/retomada por evento ---------- */
export const somDoSite = (acao: 'pausar' | 'retomar') =>
  window.dispatchEvent(new CustomEvent('marketins:musica', { detail: acao }));

/* ---------- iPhone: feed do Instagram. Post abre micro feed; rolando, abre o Reels ---------- */
const POSTS = cases.slice(0, 12);
export function IphoneReels() {
  const sec = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const microRef = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<number | null>(null);
  const [tocando, setTocando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [prog, setProg] = useState(0);
  const [reel, setReel] = useState(false);

  useLayoutEffect(() => {
    const el = sec.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el, start: 'top top', end: '+=1600', pin: true, scrub: 1,
          // o celular sobe: a música do site pausa; saiu dele, volta
          onEnter: () => somDoSite('pausar'),
          onEnterBack: () => somDoSite('pausar'),
          onLeave: () => { video.current?.pause(); somDoSite('retomar'); },
          onLeaveBack: () => { video.current?.pause(); somDoSite('retomar'); },
          onUpdate: (st) => {
            const v = video.current; if (!v) return;
            const dentro = st.progress > 0.55;
            setReel(dentro);
            if (dentro) { setPost(null); if (v.paused && !v.dataset.pausadoPeloUsuario) { v.muted = false; setMudo(false); v.play().catch(() => { v.muted = true; setMudo(true); v.play().catch(() => {}); }); } }
            else if (!v.paused) v.pause();
          },
        },
      });
      tl.fromTo(q('.ig__feed'), { yPercent: 0 }, { yPercent: -20, duration: 4 })
        .fromTo(q('.ig__reel'), { clipPath: 'inset(58% 34% 24% 34% round 6px)', autoAlpha: 0 },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', autoAlpha: 1, duration: 3, ease: 'power2.inOut' }, 3.6);
    });
    mm.add('(prefers-reduced-motion: reduce)', () => { el.classList.add('is-estatico'); });
    return () => mm.revert();
  }, []);

  // no "toque na tela" o vídeo é destravado com som: toca e pausa na hora, dentro do toque
  useEffect(() => {
    const liberar = () => {
      const v = video.current; if (!v) return;
      v.muted = false;
      v.play().then(() => { v.pause(); v.currentTime = 0; }).catch(() => {});
    };
    window.addEventListener('marketins:liberar', liberar);
    return () => window.removeEventListener('marketins:liberar', liberar);
  }, []);

  // abre o micro feed já no post tocado
  useEffect(() => {
    if (post === null) return;
    const alvo = microRef.current?.querySelector<HTMLElement>(`[data-i="${post}"]`);
    alvo?.scrollIntoView({ block: 'start' });
  }, [post]);

  const alternar = () => {
    const v = video.current; if (!v) return;
    if (v.paused) { delete v.dataset.pausadoPeloUsuario; v.play().catch(() => {}); }
    else { v.dataset.pausadoPeloUsuario = '1'; v.pause(); }
  };
  const alternarSom = () => { const v = video.current; if (!v) return; v.muted = !v.muted; setMudo(v.muted); if (v.paused) v.play().catch(() => {}); };

  return (
    <div className="iphone-sec" ref={sec}>
      <div className="iphone">
        <div className="iphone__ilha" aria-hidden="true" />
        <div className="iphone__tela">
          <div className="ig__feed">
            <div className="ig__perfil">
              <img src="/icone.svg" alt="" />
              <div>
                <b>marketins.mkt</b>
                <span>Agência de marketing</span>
              </div>
            </div>
            <p className="ig__bio">A agência de marketing que te entrega tudo que você precisa para decolar.</p>
            <ul className="ig__grade">
              {POSTS.map((c, i) => (
                <li key={c.nome}>
                  <button onClick={() => setPost(i)} aria-label={`Abrir post de ${c.nome}`}>
                    <img src={c.img} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`ig__micro${post !== null ? ' is-aberto' : ''}`} aria-hidden={post === null}>
            <div className="ig__micro-topo">
              <button onClick={() => setPost(null)} aria-label="Voltar para o perfil" tabIndex={post === null ? -1 : 0}>‹</button>
              <b>Publicações</b>
            </div>
            <div className="ig__micro-lista" ref={microRef} data-lenis-prevent>
              {POSTS.map((c, i) => (
                <article key={c.nome} data-i={i} className="ig__post">
                  <header><img src="/icone.svg" alt="" /><b>marketins.mkt</b></header>
                  <img src={c.img} alt={`Case ${c.nome}`} loading="lazy" />
                  <p><b>marketins.mkt</b> {c.nome}. Feito pela Marketins.</p>
                </article>
              ))}
            </div>
          </div>

          <div className="ig__reel">
            {reel && mudo && <button className="ig__som" onClick={alternarSom}>Toque para ouvir</button>}
            <video ref={video} src="/media/reels.mp4" poster="/media/reels-capa.webp" loop playsInline preload="metadata"
              onPlay={() => setTocando(true)} onPause={() => setTocando(false)}
              onTimeUpdate={(e) => { const v = e.currentTarget; setProg(v.duration ? v.currentTime / v.duration : 0); }} />
          </div>
        </div>
      </div>

      <div className={`mini${reel ? ' is-visivel' : ''}`} aria-hidden={!reel}>
        <button onClick={alternar} aria-label={tocando ? 'Pausar o Reels' : 'Tocar o Reels'} tabIndex={reel ? 0 : -1}>{tocando ? '❚❚' : '▶'}</button>
        <div className="mini__info">
          <b>Reels da Marketins</b>
          <span className="mini__barra"><i style={{ transform: `scaleX(${prog})` }} /></span>
        </div>
        <button onClick={alternarSom} aria-label={mudo ? 'Ligar o som' : 'Tirar o som'} tabIndex={reel ? 0 : -1}>{mudo ? 'Som off' : 'Som on'}</button>
      </div>
    </div>
  );
}

/* ---------- Música: "toque na tela" + ícone para parar ---------- */
export function Musica() {
  const audio = useRef<HTMLAudioElement>(null);
  const [tocando, setTocando] = useState(false);
  const [entrada, setEntrada] = useState(true);

  const [saindo, setSaindo] = useState(0);
  const tocar = () => {
    audio.current?.play().then(() => setTocando(true)).catch(() => setTocando(false));
    // o foguete dá um giro e a tela some
    window.dispatchEvent(new Event('marketins:liberar'));
    setSaindo((n) => n + 1);
    window.setTimeout(() => setEntrada(false), 700);
  };
  const alternar = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setTocando(true)).catch(() => {});
    else { a.pause(); setTocando(false); }
  };

  // o celular pede pausa; só retoma se a música estava tocando antes
  useEffect(() => {
    let pausadaPorFora = false;
    const ouvir = (e: Event) => {
      const a = audio.current; if (!a) return;
      if ((e as CustomEvent).detail === 'pausar' && !a.paused) { a.pause(); setTocando(false); pausadaPorFora = true; }
      if ((e as CustomEvent).detail === 'retomar' && pausadaPorFora) { pausadaPorFora = false; a.play().then(() => setTocando(true)).catch(() => {}); }
    };
    window.addEventListener('marketins:musica', ouvir);
    return () => window.removeEventListener('marketins:musica', ouvir);
  }, []);

  useEffect(() => {
    if (!entrada) return;
    const onKey = (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && tocar();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <audio ref={audio} src="/media/musica.mp3" loop preload="auto" />
      {entrada && (
        <button className={`toque${saindo ? ' is-saindo' : ''}`} onClick={tocar} aria-label="Toque na tela para entrar com som">
          <Logo3D tipo="icone" className="toque__logo" impulso={saindo} />
          <span>Toque na tela</span>
        </button>
      )}
      <button className={`som${tocando ? ' is-tocando' : ''}`} onClick={alternar} aria-pressed={tocando} aria-label={tocando ? 'Parar a música' : 'Tocar a música'}>
        <img src="/icone.svg" alt="" />
      </button>
    </>
  );
}
