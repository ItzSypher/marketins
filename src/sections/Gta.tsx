import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Logo3D } from '../ds/Logo3D';

gsap.registerPlugin(ScrollTrigger);

// a abertura sempre começa do topo (o navegador não volta para o meio da página)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/**
 * Prévia 2: parece o site do GTA VI. Ao rolar, um X corta o logo,
 * entra "Nada de GTA 6. Aqui é Marketins", o foguete sobe em 3D
 * e depois vem o "marketins" com a máscara (Stage, igual ao site).
 */
export function GTA() {
  const raiz = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = raiz.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // entrada no carregamento: o logo do GTA aparece como no site deles
      // (anima os invólucros: assim a timeline do scroll não guarda o estado "invisível" da entrada)
      // cada camada tem um dono só: .gta__entrada (scroll), .gta__brilho (entrada), .gta__logo (escurece/treme)
      if (scrollY < 10) gsap.from(q('.gta__brilho'), { opacity: 0, scale: 1.15, filter: 'blur(12px)', duration: 1.6, ease: 'expo.out', delay: 0.2, clearProps: 'filter,transform' });
      gsap.from(q('.gta__dica span'), { autoAlpha: 0, y: 10, duration: 0.8, delay: 1.4 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el, start: 'top top', end: '+=3400', pin: true, scrub: 1,
          // voltou para antes do X: o GTA fica inteiro, mesmo se a rolagem pulou etapas
          onLeaveBack: () => gsap.set([q('.gta__entrada'), q('.gta__ceu')], { autoAlpha: 1, scale: 1 }),
        },
      });
      tl.fromTo(q('.gta__dica'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3 }, 0)
        // o X corta: duas faixas atravessam a tela
        .fromTo(q('.gta__x--a i'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power4.in' }, 0.3)
        .fromTo(q('.gta__x--b i'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power4.in' }, 0.7)
        .fromTo(q('.gta__logo'), { filter: 'grayscale(0) brightness(1)', scale: 1 }, { filter: 'grayscale(1) brightness(0.35)', scale: 0.92, duration: 0.6 }, 1.1)
        .fromTo(q('.gta__logo'), { x: 0 }, { x: 6, duration: 0.05, repeat: 5, yoyo: true, immediateRender: false }, 1.1)
        // a frase
        .fromTo(q('.gta__frase-1'), { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 1.4)
        .fromTo(q('.gta__frase-2'), { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 1.9)
        // tudo do GTA sai, o fundo vira Marketins
        .fromTo(q('.gta__entrada, .gta__x'), { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 1.3, duration: 0.8, ease: 'power2.in', immediateRender: false }, 2.8)
        .fromTo(q('.gta__frase'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -40, duration: 0.6, immediateRender: false }, 3.0)
        .fromTo(q('.gta__ceu'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.8, immediateRender: false }, 2.8)
        // o foguete sobe em 3D
        .fromTo(q('.gta__foguete'), { yPercent: 120, scale: 0.4, autoAlpha: 0 }, { yPercent: 0, scale: 1, autoAlpha: 1, duration: 1.4, ease: 'expo.out' }, 3.2)
        .fromTo(q('.gta__assina'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 4.2)
        // segura um pouco e sai para o "marketins" (o logo não aparece duas vezes)
        .fromTo(q('.gta__foguete, .gta__assina'), { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.6, duration: 0.7, ease: 'power2.in', immediateRender: false }, 5.4);
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="gta" ref={raiz} aria-label="Nada de GTA 6. Aqui é Marketins.">
      <div className="gta__ceu" aria-hidden="true" />
      <div className="gta__entrada"><div className="gta__brilho"><img className="gta__logo" src="/gta6.svg" alt="" /></div></div>
      <span className="gta__x gta__x--a" aria-hidden="true"><i /></span>
      <span className="gta__x gta__x--b" aria-hidden="true"><i /></span>
      <h1 className="gta__frase">
        <span><span className="gta__frase-1">Nada de GTA 6.</span></span>
        <span><span className="gta__frase-2">Aqui é Marketins.</span></span>
      </h1>
      <div className="gta__foguete"><Logo3D tipo="icone" /></div>
      <p className="gta__assina">Soluções de marketing</p>
      <p className="gta__dica"><span>Role para baixo ↓</span></p>
    </section>
  );
}
