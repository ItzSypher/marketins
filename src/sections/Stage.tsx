import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { linkContato } from '../content';

gsap.registerPlugin(ScrollTrigger);

// Geometria do wordmark-mask.svg (viewBox 2141 × 330).
const VB_W = 2141;
const VB_H = 330;
const RATIO = VB_H / VB_W; // altura/largura
// O centro do logo cai no vão do "k". A máscara começa ancorada na haste do
// "k" (x 848–924, y 27–324), que é cheia, e migra para o centro ao encolher.
const ANCHOR = { x: 886, y: 175, w: 76, h: 297 };
const CENTER = { x: VB_W / 2, y: VB_H / 2 };

/** Largura final do logo: o maior possível sem encostar nas bordas. */
function finalWidth(vw: number, vh: number) {
  const byWidth = vw * (vw < 768 ? 0.9 : 0.72);
  const byHeight = (vh * 0.34) / RATIO;
  return Math.min(byWidth, byHeight);
}

/** Largura inicial em que a haste do "k" cobre a tela inteira (com folga). */
function startWidth(vw: number, vh: number) {
  const scale = Math.max(vw / ANCHOR.w, vh / ANCHOR.h) * 1.12;
  return VB_W * scale;
}

export function Stage() {
  const stage = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = stage.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      el.classList.add('is-animated');
      const proxy = { p: 0 };

      const paintMask = () => {
        const vw = el.clientWidth;
        const vh = el.clientHeight;
        const w0 = startWidth(vw, vh);
        const w1 = finalWidth(vw, vh);
        const w = w0 + (w1 - w0) * proxy.p;
        const s = w / VB_W;
        const ux = ANCHOR.x + (CENTER.x - ANCHOR.x) * proxy.p;
        const uy = ANCHOR.y + (CENTER.y - ANCHOR.y) * proxy.p;
        const hero = q('.hero')[0] as HTMLElement;
        hero.style.setProperty('--mask-size', `${w}px`);
        hero.style.setProperty('--mask-x', `${vw / 2 - ux * s}px`);
        hero.style.setProperty('--mask-y', `${vh / 2 - uy * s}px`);
        el.style.setProperty('--logo-h', `${w1 * RATIO}px`);
      };
      paintMask();

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=2500',
          pin: true,
          scrub: 1.5,
          invalidateOnRefresh: true,
          onRefresh: paintMask,
        },
      });

      // 1. máscara encolhe até o tamanho final do logo
      tl.fromTo(proxy, { p: 0 }, { p: 1, duration: 6, ease: 'expo.out', onUpdate: paintMask }, 0)
        // 2. logo grande some logo no início
        .fromTo(q('.hero__logo'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6 }, 0)
        .fromTo(q('.hero__hint'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.4 }, 0)
        // 3. tela-branca ganha o gradiente da marca na segunda metade
        .fromTo(q('.hero__tela'), { opacity: 0 }, { opacity: 1, duration: 3 }, 3)
        // 4. tagline da seção 2 entra com fade e blur
        .fromTo(q('.s2__tag'), { autoAlpha: 0, filter: 'blur(14px)', y: 16 },
          { autoAlpha: 1, filter: 'blur(0px)', y: 0, duration: 1.6 }, 5.2)
        // logo decola: sobe e sai pelo topo
        .fromTo(q('.hero'), { yPercent: 0 }, { yPercent: -62, duration: 2.4, ease: 'power2.in' }, 7.2)
        .fromTo(q('.s2__tag'), { yPercent: 0 }, { yPercent: -120, autoAlpha: 0, duration: 1.6, ease: 'power2.in' }, 7.6)
        // 5. círculo da seção 3 abre a tela final
        .fromTo(el, { '--r': '0vmax' }, { '--r': '150vmax', duration: 3, ease: 'power2.inOut' }, 7.8)
        .fromTo(q('.s3__inner > *'), { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.25 }, 9.6);

      return () => el.classList.remove('is-animated');
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="stage" ref={stage}>
      <section className="hero" aria-label="Marketins">
        <picture className="hero__img">
          <source media="(max-width: 767px)" srcSet="/hero-mobile.webp" />
          <img src="/hero-desktop.webp" alt="" fetchPriority="high" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
        </picture>
        <img className="hero__logo" src="/logo-completo.svg" alt="Marketins, soluções de marketing" />
        <div className="hero__tela" aria-hidden="true" />
        <p className="hero__hint" aria-hidden="true">role para decolar</p>
      </section>

      <section className="s2" aria-label="Quem somos">
        <p className="s2__tag">Tudo o que o seu negócio precisa, em um só lugar.</p>
      </section>

      <section className="s3" aria-label="Fale com a Marketins">
        <div className="s3__inner">
          <p className="eyebrow">Consultoria de marketing</p>
          <h1>Ajudamos empresas como a sua a decolar.</h1>
          <p className="s3__sub">
            Social media, design, audiovisual e tráfego pago com o mesmo time. A gente começa entendendo o seu negócio.
          </p>
          <a className="btn btn--light" href={linkContato('hero')} target="_blank" rel="noopener">
            Agendar consultoria <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
