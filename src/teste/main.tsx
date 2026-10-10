import '@fontsource-variable/montserrat';
import { StrictMode, useEffect, useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { linkContato, INSTAGRAM, LOGOS } from '../content';
import { Entrada } from './Entrada';
import { Hero } from './Hero';
import { Time } from './Time';
import { Feed } from './Feed';
import { Rodape } from './Rodape';
import { Assistente } from './Assistente';
import { Conecta } from './Conecta';
import { Espiral } from './Espiral';
import { Presenca } from './Presenca';
import { Checklist } from './Checklist';
import { clientes, grandes, segmentos } from './dados';
import '../styles.css';
import '../sections/abertura-home.css';
import '../sections/home-blocos.css';
import './teste.css';
import './espiral.css';

gsap.registerPlugin(ScrollTrigger);
const ORIGEM = 'página teste';

function Seta({ href, children, escuro }: { href: string; children: string; escuro?: boolean }) {
  return (
    <a className={`b-seta${escuro ? ' b-seta--escuro' : ''}`} href={href} target="_blank" rel="noopener">
      <span>{children}</span><i aria-hidden="true">↗</i>
    </a>
  );
}

function Cabeca({ titulo }: { titulo: string }) {
  return (
    <header className="t-cabeca" data-revela>
      <h2 className="t-titulo">{titulo}</h2>
    </header>
  );
}

/* 01: cards que empilham no scroll; cada um gruda sobre o anterior */
function Grandes() {
  return (
    <section id="grandes" className="t-sec">
      <Cabeca titulo="Quem já trabalha com a gente" />
      <div className="pilha">
        {grandes.map((c, i) => (
          <article className="pilha__card" key={c.nome} style={{ '--i': i } as React.CSSProperties}>
            <div className="pilha__midia">
              {c.logo
                ? <img className="pilha__logo" src={c.logo} alt={`Logo ${c.nome}`} loading="lazy" />
                : <span className="pilha__marca" aria-hidden="true">{c.nome}</span>}
            </div>
            <div className="pilha__info">
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

/* Faixa logo abaixo da hero: clientes e segmentos andando com o scroll, em sentidos opostos */
function Faixa() {
  return (
    <section className="faixa-clientes" aria-label="Clientes e segmentos">
      <div className="letreiro" data-anda="-1"><div className="letreiro__trilho">{[...clientes, ...clientes].map((c, i) => <span key={i}>{c}<i>✦</i></span>)}</div></div>
      <div className="letreiro letreiro--seg" data-anda="1"><div className="letreiro__trilho">{[...segmentos, ...segmentos].map((c, i) => <span key={i}>{c}<i>✦</i></span>)}</div></div>
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
        gsap.fromTo(c, { scale: 1, filter: 'brightness(1)' }, { scale: 0.94, filter: 'brightness(0.7)', ease: 'none', scrollTrigger: { trigger: prox, start: 'top 70%', end: 'top 20%', scrub: true } });
      });
    });
    const recalcular = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(recalcular);
    addEventListener('load', recalcular);
    return () => { mm.revert(); removeEventListener('load', recalcular); };
  }, []);

  return (
    <main className="t">
      <Entrada />
      <Hero />
      <Faixa />
      <Grandes />
      <section className="logos" aria-label="Alguns clientes">
        <div className="logos__trilho">
          {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
            <img key={i} src={`/logos/${l.arquivo}`} alt={i < LOGOS.length ? l.nome : ''} aria-hidden={i >= LOGOS.length} />
          ))}
        </div>
      </section>
      <Espiral />
      <Presenca />
      <Time />
      <Feed />
      <Checklist />
      <Fecho />
      <Rodape />
      <Assistente />
      <Conecta />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
