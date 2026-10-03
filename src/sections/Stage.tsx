import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { linkContato } from '../content';

gsap.registerPlugin(ScrollTrigger);

// Geometria do wordmark-mask.svg (viewBox 2141 × 330).
const VB_W = 2141;
const VB_H = 330;
const RATIO = VB_H / VB_W;
// O centro do logo cai no vão do "k". Quando a máscara cresce, o ponto de
// foco migra do centro para a haste do "k" (x 848 a 924, y 27 a 324), que é
// cheia, para a foto cobrir a tela inteira no fim.
const ANCHOR = { x: 886, y: 175, w: 76, h: 297 };
const CENTER = { x: VB_W / 2, y: VB_H / 2 };

/** Largura do wordmark na abertura: o maior possível sem encostar nas bordas. */
function logoWidth(vw: number, vh: number) {
  const byWidth = vw * (vw < 768 ? 0.88 : 0.7);
  const byHeight = (vh * 0.3) / RATIO;
  return Math.min(byWidth, byHeight);
}

/** Largura em que a haste do "k" cobre a tela inteira (com folga). */
function openWidth(vw: number, vh: number) {
  return VB_W * Math.max(vw / ANCHOR.w, vh / ANCHOR.h) * 1.12;
}

/**
 * Abertura: a página começa no "marketins" com o ícone. Ao rolar, as letras
 * abrem como janela, a foto da capa toma a tela e o texto do hero entra por cima.
 */
export function Stage() {
  const stage = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = stage.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      el.classList.add('is-animated');
      const hero = q('.hero')[0] as HTMLElement;
      const proxy = { p: 0 };

      const paint = () => {
        const vw = el.clientWidth;
        const vh = el.clientHeight;
        const w0 = logoWidth(vw, vh);
        const w1 = openWidth(vw, vh);
        const w = w0 + (w1 - w0) * proxy.p;
        const s = w / VB_W;
        const ux = CENTER.x + (ANCHOR.x - CENTER.x) * proxy.p;
        const uy = CENTER.y + (ANCHOR.y - CENTER.y) * proxy.p;
        hero.style.setProperty('--mask-size', `${w}px`);
        hero.style.setProperty('--mask-x', `${vw / 2 - ux * s}px`);
        hero.style.setProperty('--mask-y', `${vh / 2 - uy * s}px`);
        el.style.setProperty('--logo-h', `${w0 * RATIO}px`);
        // Com a foto cobrindo tudo, a máscara sai: evita rasterizar um SVG gigante.
        el.classList.toggle('is-open', proxy.p > 0.995);
      };
      paint();

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=2200',
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onRefresh: paint,
        },
      });

      tl.fromTo(q('.abertura'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6 }, 0)
        // o gradiente sai das letras e a foto aparece dentro delas
        .fromTo(q('.hero__tela'), { opacity: 1 }, { opacity: 0, duration: 2.2 }, 0.3)
        // as letras abrem até a foto ocupar a tela
        .fromTo(proxy, { p: 0 }, { p: 1, duration: 6, ease: 'expo.in', onUpdate: paint }, 0.6)
        .fromTo(q('.hero__sombra'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 6)
        .fromTo(q('.hero__copy > *'), { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power2.out' }, 6.4);

      // Criado depois da timeline do scroll para o estado inicial dela não sobrescrever este.
      // Ao carregar: o ícone cai no centro, some, e o "marketins" aparece no lugar.
      document.body.classList.add('com-abertura');
      const vh = el.clientHeight;
      gsap.timeline({ delay: 0.2 })
        .fromTo(q('.abertura__icone'), { y: -vh * 0.7, autoAlpha: 1 }, { y: 0, duration: 1.1, ease: 'bounce.out' })
        .to(q('.abertura__icone'), { scale: 0.4, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, '+=0.35')
        .fromTo(hero, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, '-=0.15')
        .fromTo(q('.abertura__frase'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

      // O ícone do topo só aparece depois da abertura, para a marca não se repetir.
      ScrollTrigger.create({
        trigger: el, start: 'top top', end: '+=2200',
        onLeave: () => document.body.classList.add('passou-abertura'),
        onEnterBack: () => document.body.classList.remove('passou-abertura'),
      });

      return () => {
        el.classList.remove('is-animated', 'is-open');
        document.body.classList.remove('com-abertura', 'passou-abertura');
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="stage" ref={stage}>
      <div className="abertura" aria-hidden="true">
        <img className="abertura__icone" src="/icone.svg" alt="" width="106" height="105" />
        <p className="abertura__frase">Soluções de marketing</p>
      </div>

      <section className="hero" aria-labelledby="hero-titulo">
        <picture className="hero__img">
          <source media="(max-width: 767px)" srcSet="/hero-mobile.webp" />
          <img src="/hero-desktop.webp" alt="" fetchPriority="high" />
        </picture>
        <div className="hero__tela" aria-hidden="true" />
        <div className="hero__sombra" aria-hidden="true" />
        <div className="hero__copy">
          <h1 id="hero-titulo">Ajudamos empresas como a sua a decolar.</h1>
          <p>Social media, design, audiovisual e tráfego pago com o mesmo time. A gente começa entendendo o seu negócio.</p>
          <a className="btn btn--brand" href={linkContato('hero')} target="_blank" rel="noopener">Agendar consultoria</a>
        </div>
      </section>
    </div>
  );
}
