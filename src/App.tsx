import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stage } from './sections/Stage';
import { GTA } from './sections/Gta';
import { Musica } from './ds/blocos';
import './sections/abertura-home.css';
import { cases, conecta, destaques, historia, depoimentos, linkContato, INSTAGRAM, numeros, sergio, servicos, time } from './content';

const CHAVE_POPUP = 'marketins-conecta-visto';
const CASES_INICIAIS = 10;

function lerVisto() {
  try { return sessionStorage.getItem(CHAVE_POPUP) === '1'; } catch { return false; }
}

export default function App() {
  const [popup, setPopup] = useState(false);
  const [todosCases, setTodosCases] = useState(false);

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

  useEffect(() => {
    if (lerVisto()) return;
    const id = window.setTimeout(() => setPopup(true), 8000);
    return () => window.clearTimeout(id);
  }, []);

  const fecharPopup = () => {
    setPopup(false);
    try { sessionStorage.setItem(CHAVE_POPUP, '1'); } catch { /* sem armazenamento, só não lembra */ }
  };

  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && fecharPopup();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popup]);

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
          <h2 id="historia-titulo">{historia.titulo}</h2>
          <div className="historia__texto">
            {historia.texto.map((t) => <p key={t}>{t}</p>)}
          </div>
        </section>

        <section className="destaques" aria-labelledby="destaques-titulo">
          <h2 id="destaques-titulo" className="titulo">Quem confia na Marketins</h2>
          <ul className="destaques__grade" data-revela>
            {destaques.map((d, i) => (
              <li key={d.nome} className={`destaque destaque--${i + 1}`}>
                {d.img && <img src={d.img} alt={`Case ${d.nome}`} width="800" height="568" loading="lazy" decoding="async" />}
                <div className="destaque__texto">
                  <h3>{d.nome}</h3>
                  <p>{d.texto}</p>
                  {d.link && <a href={d.link} target="_blank" rel="noopener">Visitar o site</a>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="servicos" aria-labelledby="servicos-titulo">
          <h2 id="servicos-titulo" className="titulo">O que a gente faz pelo seu negócio</h2>
          <ul className="bento" data-revela>
            {servicos.map((s, i) => (
              <li key={s.nome} className={`bento__item bento__item--${i + 1}`}>
                {(i === 0 || i === 2) && (
                  <img src={s.img} alt="" width="800" height="568" loading="lazy" decoding="async" />
                )}
                <div className="bento__texto">
                  <h3>{s.nome}</h3>
                  <p>{s.texto}</p>
                  <ul>{s.itens.map((it) => <li key={it}>{it}</li>)}</ul>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="portfolio" aria-labelledby="portfolio-titulo">
          <h2 id="portfolio-titulo" className="titulo">Empresas que já decolaram com a gente</h2>
          <ul id="cases" className={`cases${todosCases ? ' is-aberto' : ''}`} data-revela>
            {cases.map((c, i) => (
              <li key={c.nome} className={i >= CASES_INICIAIS ? 'cases__extra' : undefined}>
                <img src={c.img} alt={`Case ${c.nome}`} width="800" height="568" loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
          {!todosCases && (
            <button className="btn btn--ghost cases__mais" aria-controls="cases" aria-expanded="false" onClick={() => setTodosCases(true)}>
              Ver os {cases.length} cases
            </button>
          )}
        </section>

        <section className="time" aria-labelledby="time-titulo">
          <div className="lider" data-revela>
            <img className="lider__foto" src={sergio.foto} alt={sergio.nome} width="440" height="500" loading="lazy" />
            <div className="lider__texto">
              <h2 id="time-titulo" className="titulo">O time que cuida de você</h2>
              <p className="lider__nome">{sergio.nome}<span>{sergio.cargo}</span></p>
              <p>{sergio.texto}</p>
            </div>
          </div>
          <ul className="equipe" data-revela>
            {time.map((t) => (
              <li key={t.nome}>
                <img src={t.foto} alt="" width="440" height="500" loading="lazy" />
                <span>{t.nome}</span>
              </li>
            ))}
          </ul>
        </section>

        {depoimentos.map((d) => (
          <figure key={d.nome} className="depoimento" data-revela>
            <blockquote>“{d.texto}”</blockquote>
            <figcaption>{d.nome}, {d.empresa}</figcaption>
          </figure>
        ))}

        <section id="conecta" className="conecta" aria-labelledby="conecta-titulo" data-revela>
          <p className="eyebrow">{conecta.data}</p>
          <h2 id="conecta-titulo">{conecta.nome}</h2>
          <p>{conecta.chamada} Com {conecta.parceiros.join(' e ')}.</p>
          <a className="btn btn--light" href={conecta.link} target="_blank" rel="noopener">Ver o anúncio</a>
        </section>

        <section className="fim" aria-labelledby="fim-titulo" data-revela>
          <h2 id="fim-titulo">Bora conversar sobre o seu negócio?</h2>
          <p>Na consultoria a gente olha onde você está hoje e mostra o caminho.</p>
          <a className="btn btn--brand" href={linkContato('fim da página')} target="_blank" rel="noopener">Agendar consultoria</a>
        </section>
      </main>

      <footer className="rodape">
        <img src="/logo-completo.svg" alt="Marketins, soluções de marketing" width="150" height="36" />
        <p>São João de Meriti e Nova Iguaçu, RJ</p>
        <a href={INSTAGRAM} target="_blank" rel="noopener">@marketins.mkt</a>
        <p>© {new Date().getFullYear()} Marketins</p>
      </footer>

      <Musica comToque />

      {popup && (
        <div className="popup" role="dialog" aria-modal="true" aria-labelledby="popup-titulo" onClick={fecharPopup}>
          <div className="popup__card" onClick={(e) => e.stopPropagation()}>
            <button className="popup__x" onClick={fecharPopup} aria-label="Fechar" autoFocus>×</button>
            <h2 id="popup-titulo">{conecta.nome}</h2>
            <p>{conecta.chamada}</p>
            <a className="btn btn--light" href={conecta.link} target="_blank" rel="noopener" onClick={fecharPopup}>Ver o anúncio</a>
          </div>
        </div>
      )}
    </>
  );
}
