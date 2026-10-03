import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stage } from './sections/Stage';
import { cases, conecta, depoimentos, linkContato, INSTAGRAM, numeros, sergio, servicos, time } from './content';

const CHAVE_POPUP = 'marketins-conecta-visto';

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

  useEffect(() => {
    if (lerVisto()) return;
    const id = window.setTimeout(() => setPopup(true), 6000);
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
            <span key={i}>{conecta.nome} · {conecta.data} · {conecta.chamada}</span>
          ))}
        </span>
        <span className="sr-only">{conecta.nome}, {conecta.data}. {conecta.chamada}</span>
      </a>

      <header className="topo">
        <img src="/logo-completo.svg" alt="Marketins" width="150" height="36" />
        <a className="btn btn--ghost" href={linkContato('topo')} target="_blank" rel="noopener">Agendar consultoria</a>
      </header>

      <main>
        <Stage />

        <section className="numeros" aria-label="Números">
          {numeros.map((n) => (
            <div key={n.rotulo} className="numero">
              <strong>{n.valor}</strong>
              <span>{n.rotulo}</span>
            </div>
          ))}
        </section>

        <section className="servicos" aria-labelledby="servicos-titulo">
          <h2 id="servicos-titulo" className="titulo">O que fazemos</h2>
          <ol className="servicos__lista">
            {servicos.map((s, i) => (
              <li key={s.nome} className="servico">
                <span className="servico__n">0{i + 1}</span>
                <h3>{s.nome}</h3>
                <p>{s.texto}</p>
                <ul>{s.itens.map((it) => <li key={it}>{it}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="portfolio" aria-labelledby="portfolio-titulo">
          <h2 id="portfolio-titulo" className="titulo">Empresas que já decolaram com a gente</h2>
          <ul id="cases" className={`portfolio__grade${todosCases ? ' is-aberto' : ''}`}>
            {cases.map((c) => (
              <li key={c.nome}>
                <img src={c.img} alt={`Case ${c.nome}`} width="800" height="568" loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
          {!todosCases && (
            <button className="btn btn--ghost portfolio__mais" aria-controls="cases" aria-expanded="false" onClick={() => setTodosCases(true)}>
              Ver todos os {cases.length} cases
            </button>
          )}
        </section>

        <section className="time" aria-labelledby="time-titulo">
          <h2 id="time-titulo" className="titulo">O time que cuida de você</h2>
          <div className="time__grade">
            <figure className="time__destaque">
              <img src={sergio.foto} alt="" width="440" height="500" loading="lazy" />
              <figcaption>{sergio.nome}<small>{sergio.cargo}</small></figcaption>
            </figure>
            <ul className="time__lista">
              {time.map((t) => (
                <li key={t.nome}>
                  <img src={t.foto} alt="" width="440" height="500" loading="lazy" />
                  <span>{t.nome}</span>
                </li>
              ))}
            </ul>
          </div>
          {depoimentos.map((d) => (
            <figure key={d.nome} className="depoimento">
              <blockquote>“{d.texto}”</blockquote>
              <figcaption>{d.nome}, {d.empresa}</figcaption>
            </figure>
          ))}
        </section>

        <section id="conecta" className="conecta" aria-labelledby="conecta-titulo">
          <p className="eyebrow">{conecta.data}</p>
          <h2 id="conecta-titulo">{conecta.nome}</h2>
          <p>{conecta.chamada} Parceiros: {conecta.parceiros.join(' e ')}.</p>
          <a className="btn btn--light" href={conecta.link} target="_blank" rel="noopener">Ver o anúncio no Instagram</a>
        </section>

        <section className="fim" aria-labelledby="fim-titulo">
          <img src="/icone.svg" alt="" width="72" height="72" />
          <h2 id="fim-titulo">Vamos conversar sobre o seu negócio?</h2>
          <p>A consultoria é o primeiro passo: a gente olha onde você está e mostra o caminho.</p>
          <a className="btn btn--brand" href={linkContato('fim da página')} target="_blank" rel="noopener">Agendar consultoria</a>
        </section>
      </main>

      <footer className="rodape">
        <p>© {new Date().getFullYear()} Marketins · Soluções de marketing · São João de Meriti e Nova Iguaçu, RJ</p>
        <a href={INSTAGRAM} target="_blank" rel="noopener">@marketins.mkt</a>
      </footer>

      {popup && (
        <div className="popup" role="dialog" aria-modal="true" aria-labelledby="popup-titulo" onClick={fecharPopup}>
          <div className="popup__card" onClick={(e) => e.stopPropagation()}>
            <button className="popup__x" onClick={fecharPopup} aria-label="Fechar" autoFocus>×</button>
            <p className="eyebrow">{conecta.data}</p>
            <h2 id="popup-titulo">{conecta.nome}</h2>
            <p>{conecta.chamada}</p>
            <a className="btn btn--brand" href={conecta.link} target="_blank" rel="noopener" onClick={fecharPopup}>Ver o anúncio</a>
          </div>
        </div>
      )}
    </>
  );
}
