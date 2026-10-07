import '@fontsource-variable/montserrat';
import { StrictMode, useEffect, useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { equipe, linkContato, INSTAGRAM, numeros, sergio } from '../content';
import { IphoneReels, Musica } from '../ds/blocos';
import { GTA } from '../sections/Gta';
import { Stage } from '../sections/Stage';
import { clientes, conexoes, grandes, pontos, segmentos, unidades } from './dados';
import '../styles.css';
import '../sections/abertura-home.css';
import '../sections/home-blocos.css';
import './teste.css';

gsap.registerPlugin(ScrollTrigger);
const ORIGEM = 'página teste';

function Seta({ href, children, escuro }: { href: string; children: string; escuro?: boolean }) {
  return (
    <a className={`b-seta${escuro ? ' b-seta--escuro' : ''}`} href={href} target="_blank" rel="noopener">
      <span>{children}</span><i aria-hidden="true">↗</i>
    </a>
  );
}

function Cabeca({ n, titulo, texto }: { n: string; titulo: string; texto?: string }) {
  return (
    <header className="t-cabeca" data-revela>
      <span className="t-num">({n})</span>
      <h2 className="t-titulo">{titulo}</h2>
      {texto && <p className="t-texto">{texto}</p>}
    </header>
  );
}

function Capa() {
  return (
    <section className="t-capa">
      <h2 className="t-capa__titulo">Poucas agências têm o que a <em>Marketins</em> tem.</h2>
      <ol className="t-indice">
        {pontos.map((p, i) => (
          <li key={p.id}><a href={`#${p.id}`}><span>0{i + 1}</span>{p.titulo}<i aria-hidden="true">↓</i></a></li>
        ))}
      </ol>
    </section>
  );
}

/* 01: cards que empilham no scroll; cada um gruda sobre o anterior */
function Grandes() {
  return (
    <section id="grandes" className="t-sec">
      <Cabeca n="01" titulo="Clientes grandes confiam na gente" texto="Marcas que são referência no que fazem escolheram a Marketins para cuidar do marketing." />
      <div className="pilha">
        {grandes.map((c, i) => (
          <article className="pilha__card" key={c.nome} style={{ '--i': i } as React.CSSProperties}>
            <div className="pilha__midia">
              <img src={c.img} alt={`Case ${c.nome}`} loading="lazy" />
            </div>
            <div className="pilha__info">
              <span className="t-num">0{i + 1}</span>
              <h3 className="pilha__nome">
                <span className="pilha__troca"><b>{c.nome}</b><b aria-hidden="true">{c.nome}</b></span>
              </h3>
              {c.segmento && <p className="pilha__seg">{c.segmento}</p>}
              <Seta href={linkContato(`${ORIGEM} · ${c.nome}`)}>Quero um case assim</Seta>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* 02: dois letreiros que andam com o scroll, em sentidos opostos; cada nome acende ao passar */
function Segmentos() {
  const total = numeros.find((n) => n.rotulo.includes('clientes'));
  return (
    <section id="segmentos" className="t-sec t-sec--cheia">
      <Cabeca n="02" titulo="Muitos clientes. Em muitos segmentos." />
      <div className="letreiro" data-anda="-1"><div className="letreiro__trilho">{[...clientes, ...clientes].map((c, i) => <span key={i}>{c}<i>✦</i></span>)}</div></div>
      <div className="letreiro letreiro--seg" data-anda="1"><div className="letreiro__trilho">{[...segmentos, ...segmentos].map((c, i) => <span key={i}>{c}<i>✦</i></span>)}</div></div>
      {total && (
        <p className="contador" data-revela><strong>{total.valor}</strong><span>{total.rotulo}, do previdenciário à construção.</span></p>
      )}
    </section>
  );
}

function Estrutura() {
  return (
    <section id="estrutura" className="t-sec">
      <Cabeca n="03" titulo="Presença de verdade na Baixada" texto="Duas unidades, estrutura própria e bem localizada. Você vem tomar um café com a gente." />
      <div className="unidades">
        {unidades.map((u) => (
          <article className="unidade" key={u.cidade} data-revela>
            <div className="unidade__foto"><img src={u.img} alt="" loading="lazy" /><small>imagem ilustrativa</small></div>
            <div className="unidade__info">
              <h3>{u.cidade}</h3>
              <p>{u.local}</p>
              <Seta escuro href={`https://www.google.com/maps/search/${encodeURIComponent(u.mapa)}`}>Como chegar</Seta>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* 04: foto do time abre com o scroll; depois os cards cruzam a tela inclinados */
function Time() {
  const sec = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
      const el = sec.current!;
      const trilho = el.querySelector<HTMLElement>('.cruza__trilho')!;
      gsap.fromTo(el.querySelector('.time-foto'), { clipPath: 'inset(22% 18% 22% 18% round 28px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: el.querySelector('.time-foto'), start: 'top 85%', end: 'center center', scrub: true },
      });
      const cards = gsap.utils.toArray<HTMLElement>('.cruza__card', el);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el.querySelector('.cruza'), start: 'top top', end: () => `+=${trilho.scrollWidth}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
      tl.fromTo(trilho, { x: () => innerWidth * 0.6 }, { x: () => -(trilho.scrollWidth - innerWidth * 0.4), ease: 'none' }, 0);
      cards.forEach((c, i) => tl.fromTo(c, { rotate: i % 2 ? 8 : -8, y: i % 2 ? 60 : -40 }, { rotate: i % 2 ? -4 : 4, y: 0, ease: 'none' }, 0));
    });
    return () => mm.revert();
  }, []);
  return (
    <section id="time" className="t-sec" ref={sec}>
      <Cabeca n="04" titulo="Um time grande e qualificado" texto="Tráfego, design, vídeo, social e desenvolvimento dentro de casa. Gente formada e com estrada." />
      <div className="time-foto">{equipe.map((p) => <img key={p.nome} src={p.foto} alt="" loading="lazy" />)}</div>
      <div className="cruza">
        <div className="cruza__trilho">
          {equipe.map((p) => (
            <figure className="cruza__card" key={p.nome}>
              <img src={p.foto} alt={p.nome} loading="lazy" />
              <figcaption><b>{p.nome}</b><span>{p.texto}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Conexoes() {
  return (
    <section id="conexoes" className="t-sec">
      <Cabeca n="05" titulo="Quem chega na Marketins chega bem conectado" />
      <div className="rede">
        <figure className="rede__sergio" data-revela>
          <img src={sergio.foto} alt={sergio.nome} loading="lazy" />
          <figcaption><b>{sergio.nome}</b><span>Fundador · a ponte entre você e quem move a Baixada</span></figcaption>
        </figure>
        <ul className="rede__lista">
          {conexoes.map((c, i) => (
            <li key={c.nome} className="rede__card" style={{ '--r': `${i % 2 ? 2 : -2}deg` } as React.CSSProperties} data-revela>
              <span className="t-num">{c.papel}</span>
              <b>{c.nome}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Fecho() {
  const ima = useRef<HTMLAnchorElement>(null);
  // botão magnético: só com mouse
  useEffect(() => {
    const el = ima.current;
    if (!el || !matchMedia('(pointer: fine)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.35); y((e.clientY - r.top - r.height / 2) * 0.35);
    };
    const sair = () => { x(0); y(0); };
    el.addEventListener('pointermove', mover); el.addEventListener('pointerleave', sair);
    return () => { el.removeEventListener('pointermove', mover); el.removeEventListener('pointerleave', sair); };
  }, []);
  return (
    <section className="t-sec">
      <div className="cartao" data-revela>
        <p className="eyebrow">Próximo case</p>
        <h2 className="t-titulo">Bora conversar sobre o seu negócio?</h2>
        <p className="t-texto">Consultoria sem compromisso, em Nova Iguaçu, em São João de Meriti ou pelo WhatsApp.</p>
        <a ref={ima} className="b-transicao" href={linkContato(`${ORIGEM} · fim`)} target="_blank" rel="noopener">
          <span className="b-transicao__a">Agendar reunião</span>
          <span className="b-transicao__b">Vamos decolar <img src="/icone.svg" alt="" /></span>
        </a>
        <a className="cartao__ig" href={INSTAGRAM} target="_blank" rel="noopener">@marketins.mkt</a>
      </div>
    </section>
  );
}

function App() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.t-capa > *, .t-indice li', { autoAlpha: 0, y: 40, duration: 1.1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.t-capa', start: 'top 80%', once: true } });
      gsap.utils.toArray<HTMLElement>('[data-revela]').forEach((el) => {
        gsap.fromTo(el.children, { autoAlpha: 0, y: 32 }, {
          autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
      // letreiros andam com o scroll
      gsap.utils.toArray<HTMLElement>('[data-anda]').forEach((l) => {
        const dir = Number(l.dataset.anda);
        gsap.fromTo(l.firstElementChild, { xPercent: dir > 0 ? -10 : 0 }, {
          xPercent: dir > 0 ? 0 : -10, ease: 'none',
          scrollTrigger: { trigger: l, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
      // pilha: o card de baixo encolhe e escurece quando o próximo cobre
      gsap.utils.toArray<HTMLElement>('.pilha__card').forEach((c, i, todos) => {
        const prox = todos[i + 1];
        if (!prox) return;
        gsap.to(c, { scale: 0.94, filter: 'brightness(0.7)', ease: 'none', scrollTrigger: { trigger: prox, start: 'top 70%', end: 'top 20%', scrub: true } });
      });
    });
    const recalcular = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(recalcular);
    addEventListener('load', recalcular);
    return () => { mm.revert(); removeEventListener('load', recalcular); };
  }, []);

  return (
    <main className="t">
      <GTA />
      <Stage cta={
        <a className="b-transicao" href={linkContato(`${ORIGEM} · hero`)} target="_blank" rel="noopener">
          <span className="b-transicao__a">Agendar reunião</span>
          <span className="b-transicao__b">Vamos decolar <img src="/icone.svg" alt="" /></span>
        </a>
      } />
      <Capa />
      <Grandes />
      <Segmentos />
      <Estrutura />
      <Time />
      <Conexoes />
      <section className="t-sec"><Cabeca n="+" titulo="A gente vive no feed" /><IphoneReels /></section>
      <Fecho />
      <Musica comToque />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
