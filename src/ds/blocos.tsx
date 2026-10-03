import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cases, equipe } from '../content';

gsap.registerPlugin(ScrollTrigger);

/* ---------- Time: abre no Sérgio, clique abre os outros ---------- */
export function Equipe() {
  const [ativo, setAtivo] = useState(0);
  const cols = equipe.map((_, i) => (i === ativo ? '3.2fr' : '1fr')).join(' ');
  return (
    <div className="equipe2" style={{ '--cols': cols } as React.CSSProperties}>
      {equipe.map((p, i) => {
        const aberto = i === ativo;
        return (
          <button
            key={p.nome}
            className={`pessoa${aberto ? ' is-aberto' : ''}`}
            onClick={() => setAtivo(i)}
            aria-expanded={aberto}
            aria-label={aberto ? `${p.nome}. ${p.texto}` : `Ver ${p.nome}`}
          >
            <img src={p.foto} alt="" width="800" height="800" loading="lazy" />
            <span className="pessoa__nome">{p.nome}</span>
            <span className="pessoa__texto">{p.texto}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Cards interativos (estilo Apple: imagem, título e "+") ---------- */
type Card = { titulo: string; resumo: string; detalhe: string; img?: string; tom?: 'marca' };

export function CardsApple({ itens }: { itens: Card[] }) {
  const [aberto, setAberto] = useState<number | null>(null);
  return (
    <ul className="apple">
      {itens.map((c, i) => {
        const on = aberto === i;
        return (
          <li key={c.titulo} className={`apple__card${on ? ' is-aberto' : ''}${c.tom ? ' apple__card--marca' : ''}`}>
            {c.img && <img src={c.img} alt="" loading="lazy" />}
            <div className="apple__topo">
              <h3>{c.titulo}</h3>
              <p>{c.resumo}</p>
            </div>
            <div className="apple__detalhe" aria-hidden={!on}>
              <p>{c.detalhe}</p>
            </div>
            <button className="apple__mais" onClick={() => setAberto(on ? null : i)} aria-expanded={on} aria-label={on ? `Fechar ${c.titulo}` : `Mais sobre ${c.titulo}`}>
              <span aria-hidden="true">+</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Mosaico de clientes (imagem do Figma, rolando devagar) ---------- */
export function Mosaico() {
  return (
    <div className="mosaico" aria-label="Clientes da Marketins">
      <div className="mosaico__trilho">
        <img src="/mosaico-clientes.webp" alt="Trabalhos para clientes da Marketins" />
        <img src="/mosaico-clientes.webp" alt="" aria-hidden="true" />
      </div>
    </div>
  );
}

/* ---------- iPhone: feed do Instagram que abre o Reels ao rolar ---------- */
export function IphoneReels() {
  const sec = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const el = sec.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el, start: 'top top', end: '+=1600', pin: true, scrub: 1,
          onUpdate: (st) => {
            const v = video.current;
            if (!v) return;
            if (st.progress > 0.55) { if (v.paused) v.play().catch(() => {}); }
            else if (!v.paused) v.pause();
          },
        },
      });
      tl.fromTo(q('.ig__feed'), { yPercent: 0 }, { yPercent: -28, duration: 4 })
        .fromTo(q('.ig__reel'), { clipPath: 'inset(58% 34% 24% 34% round 6px)', autoAlpha: 0 },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', autoAlpha: 1, duration: 3, ease: 'power2.inOut' }, 3.6)
        .fromTo(q('.iphone__legenda'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1 }, 6);
    });
    mm.add('(prefers-reduced-motion: reduce)', () => { el.classList.add('is-estatico'); });
    return () => mm.revert();
  }, []);

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
              {cases.slice(0, 12).map((c) => <li key={c.nome}><img src={c.img} alt="" loading="lazy" /></li>)}
            </ul>
          </div>
          <div className="ig__reel">
            <video ref={video} src="/media/reels.mp4" poster="/media/reels-capa.webp" muted loop playsInline preload="metadata" />
          </div>
        </div>
      </div>
      <p className="iphone__legenda">Reels da Marketins, direto do Instagram.</p>
    </div>
  );
}

/* ---------- Música: "toque na tela" + ícone para parar ---------- */
export function Musica() {
  const audio = useRef<HTMLAudioElement>(null);
  const [tocando, setTocando] = useState(false);
  const [entrada, setEntrada] = useState(true);

  const tocar = () => {
    audio.current?.play().then(() => setTocando(true)).catch(() => setTocando(false));
    setEntrada(false);
  };
  const alternar = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setTocando(true)).catch(() => {});
    else { a.pause(); setTocando(false); }
  };

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
        <button className="toque" onClick={tocar} aria-label="Toque na tela para entrar com som">
          <img src="/icone.svg" alt="" />
          <span>Toque na tela</span>
        </button>
      )}
      <button className={`som${tocando ? ' is-tocando' : ''}`} onClick={alternar} aria-pressed={tocando} aria-label={tocando ? 'Parar a música' : 'Tocar a música'}>
        <img src="/icone.svg" alt="" />
      </button>
    </>
  );
}
