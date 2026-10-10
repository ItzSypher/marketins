import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stage } from './sections/Stage';
import { GTA } from './sections/Gta';
import './sections/abertura-home.css';
import { conecta, destaques, historia, linkContato, INSTAGRAM, LOGOS, numeros } from './content';
import { Equipe, IphoneReels, Mosaico, Musica } from './ds/blocos';
import { Logo3D } from './ds/Logo3D';
import './sections/home-blocos.css';

export default function App() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  // Seções entram ao chegar na tela (só opacidade e deslocamento).
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('[data-revela]').forEach((el) => {
        gsap.fromTo(el.children, { autoAlpha: 0, y: 32 }, {
          autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <>
      <a className="faixa" href="#conecta">
        <span className="faixa__track" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i}>{conecta.nome} {conecta.data}. {conecta.chamada}</span>
          ))}
        </span>
        <span className="sr-only">{conecta.nome}, {conecta.data}. {conecta.chamada}</span>
      </a>

      <header className="topo">
        <img src="/icone.svg" alt="Marketins" width="40" height="40" />
        <a className="btn btn--ghost" href={linkContato('topo')} target="_blank" rel="noopener">Agendar consultoria</a>
      </header>

      <main>
        <GTA />
        <Stage cta={
          <a className="b-transicao" href={linkContato('hero')} target="_blank" rel="noopener">
            <span className="b-transicao__a">Agendar reunião</span>
            <span className="b-transicao__b">Vamos decolar <img src="/icone.svg" alt="" /></span>
          </a>
        } />

        <section className="numeros" aria-label="A Marketins em números" data-revela>
          {numeros.map((n) => (
            <div key={n.rotulo} className="numero">
              <strong>{n.valor}</strong>
              <span>{n.rotulo}</span>
            </div>
          ))}
        </section>

        <section className="historia" aria-labelledby="historia-titulo" data-revela>
          <p className="eyebrow">Quem somos</p>
          <h2 id="historia-titulo">{historia.titulo}</h2>
          <div className="historia__texto">
            {historia.texto.map((t) => <p key={t}>{t}</p>)}
          </div>
        </section>

        <section className="vitrine" aria-labelledby="vitrine-titulo">
          <h2 id="vitrine-titulo" className="titulo" data-revela>Quem confia na Marketins</h2>
          <article className="vitrine__item" data-revela>
            <img src={destaques[0].img} alt="Case Marcelo Manhães" width="800" height="568" loading="lazy" />
            <div>
              <p className="eyebrow">A maior assessoria previdenciária do país</p>
              <h3>Marcelo Manhães</h3>
              <p>{destaques[0].texto.replace('A maior assessoria previdenciária do país. ', '')}</p>
              <a className="b-seta" href={linkContato('case Marcelo Manhães')} target="_blank" rel="noopener"><span>Quero um case assim</span><i aria-hidden="true">↗</i></a>
            </div>
          </article>
          <article className="vitrine__item vitrine__item--inverso" data-revela>
            <img src={destaques[1].img} alt="Case Locagora Baixada" width="800" height="568" loading="lazy" />
            <div>
              <p className="eyebrow">Somos suspeitos pra falar</p>
              <h3>Locafácil + Locagora</h3>
              <p>Aluguel de motos na Baixada Fluminense. Social media, campanhas e o resultado falando por nós.</p>
              <a className="b-seta" href={linkContato('case Locagora')} target="_blank" rel="noopener"><span>Quero um case assim</span><i aria-hidden="true">↗</i></a>
            </div>
          </article>
        </section>

        <section className="logos" aria-label="Alguns clientes">
          <div className="logos__trilho">
            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
              <img key={i} src={`/logos/${l.arquivo}`} alt={i < LOGOS.length ? l.nome : ''} aria-hidden={i >= LOGOS.length} />
            ))}
          </div>
        </section>

        <section className="bloco" aria-labelledby="trabalhos-titulo">
          <h2 id="trabalhos-titulo" className="titulo" data-revela>Empresas que já decolaram com a gente</h2>
          <Mosaico />
        </section>

        <section className="bloco" aria-labelledby="insta-titulo">
          <h2 id="insta-titulo" className="titulo" data-revela>A gente vive no feed</h2>
          <IphoneReels />
        </section>

        <section className="bloco" aria-labelledby="time-titulo">
          <h2 id="time-titulo" className="titulo" data-revela>O time que cuida de você</h2>
          <Equipe />
        </section>

        <section id="conecta" className="conecta2" aria-labelledby="conecta-titulo" data-revela>
          <Logo3D tipo="conecta" />
          <div>
            <p className="eyebrow">{conecta.data}</p>
            <h2 id="conecta-titulo">{conecta.chamada}</h2>
            <p>Influenciadores, marcas e empresários da Baixada no mesmo lugar.</p>
            <a className="b-seta" href={conecta.link} target="_blank" rel="noopener"><span>Ver o anúncio</span><i aria-hidden="true">↗</i></a>
          </div>
        </section>

        <section className="fim" aria-labelledby="fim-titulo" data-revela>
          <h2 id="fim-titulo">Bora conversar sobre o seu negócio?</h2>
          <p>Na consultoria a gente olha onde você está hoje e mostra o caminho.</p>
          <a className="b-transicao" href={linkContato('fim da página')} target="_blank" rel="noopener">
            <span className="b-transicao__a">Agendar reunião</span>
            <span className="b-transicao__b">Vamos decolar <img src="/icone.svg" alt="" /></span>
          </a>
        </section>
      </main>

      <footer className="rodape">
        <img src="/logo-completo.svg" alt="Marketins, soluções de marketing" width="150" height="36" />
        <p>São João de Meriti e Nova Iguaçu, RJ</p>
        <a href={INSTAGRAM} target="_blank" rel="noopener">@marketins.mkt</a>
        <p>© {new Date().getFullYear()} Marketins</p>
      </footer>

      <Musica comToque />
    </>
  );
}
