import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { INSTAGRAM } from '../content';
import { Botao } from '../ds/Botao';
import { unidades } from './dados';
import './presenca.css';

/*
  Estrutura física: "Duas unidades na Baixada".
  Mapa do Google de borda a borda, com as abas das unidades flutuando no canto esquerdo
  (no celular, o cartão com as abas fica logo abaixo do mapa). Trocar de aba troca o iframe.
  Sem sticky e sem troca de aba pelo scroll: a página rola normal.
  O iframe nasce com pointer-events: none, então a roda e o dedo rolam a página; o botão
  "Mexer no mapa" libera o toque, e ele trava de novo ao sair da seção, em "Fechar mapa" ou no Esc.
*/

const mapaEmbed = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
const dois = (n: number) => String(n).padStart(2, '0');

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Marketins',
  alternateName: 'Agência Marketins',
  sameAs: [INSTAGRAM],
  areaServed: [
    { '@type': 'City', name: 'Nova Iguaçu' },
    { '@type': 'City', name: 'São João de Meriti' },
    { '@type': 'Place', name: 'Baixada Fluminense' },
    { '@type': 'State', name: 'Rio de Janeiro' },
  ],
  location: unidades.map((u) => ({
    '@type': 'Place',
    name: `Marketins ${u.cidade}`,
    address: { '@type': 'PostalAddress', addressLocality: u.cidade, addressRegion: 'RJ', addressCountry: 'BR' },
  })),
};

export function Presenca() {
  return (
    <section id="estrutura" className="t-sec pr" aria-labelledby="pr-titulo">
      <header className="t-cabeca" data-revela>
        <p className="t-num">Estrutura física · Nova Iguaçu e São João de Meriti</p>
        <h2 className="t-titulo" id="pr-titulo">Duas unidades na Baixada</h2>
        <p className="t-texto">
          Nova Iguaçu, no Le Monde Office, e São João de Meriti. Daqui a gente cuida do marketing de empresas da
          Baixada e do resto do Rio. Passa aqui pra tomar um café com o time.
        </p>
      </header>
      <Unidades />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
    </section>
  );
}

/* ───────────── Mapa grande + abas flutuantes ───────────── */

function Unidades() {
  const n = unidades.length;
  const [ativa, setAtiva] = useState(0);
  const [perto, setPerto] = useState(false);
  const [mexendo, setMexendo] = useState(false);
  const [pronto, setPronto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);

  // só baixa o mapa perto da tela (poupa o 4G); ao sair da seção, o mapa volta a travar
  useEffect(() => {
    const el = raiz.current!;
    if (!('IntersectionObserver' in window)) { setPerto(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setPerto(true); io.disconnect(); }
    }, { rootMargin: '400px 0px' });
    io.observe(el);
    const fora = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setMexendo(false); });
    fora.observe(el);
    return () => { io.disconnect(); fora.disconnect(); };
  }, []);

  // Esc trava o mapa de novo
  useEffect(() => {
    if (!mexendo) return;
    const esc = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setMexendo(false); };
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [mexendo]);

  const selecionar = (i: number, focar = false) => {
    if (i !== ativa) { setAtiva(i); setPronto(false); setMexendo(false); }
    if (focar) abas.current[i]?.focus({ preventScroll: true });
  };

  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    let i = ativa;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': i = (ativa + 1) % n; break;
      case 'ArrowLeft': case 'ArrowUp': i = (ativa - 1 + n) % n; break;
      case 'Home': i = 0; break;
      case 'End': i = n - 1; break;
      default: return;
    }
    e.preventDefault();
    selecionar(i, true);
  };

  const u = unidades[ativa];

  return (
    <div className="pr-palco" ref={raiz}>
      <div className={`pr-mapa${mexendo ? ' is-mexendo' : ''}`}>
        <div className="pr-mapa__espera" aria-hidden="true">
          <i className="pr-mapa__pino" />
          <span>Mapa · {u.cidade}</span>
        </div>
        {perto && (
          <iframe
            key={ativa}
            className={pronto ? 'is-pronto' : undefined}
            src={mapaEmbed(u.mapa)}
            title={`Mapa da unidade Marketins em ${u.cidade}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setPronto(true)}
          />
        )}
        <button
          type="button"
          className="pr-trava"
          aria-pressed={mexendo}
          onClick={() => setMexendo((v) => !v)}
        >
          {mexendo ? 'Fechar mapa' : 'Mexer no mapa'}
        </button>
      </div>

      <div className="pr-cartao">
        <div className="pr-abas" role="tablist" aria-label="Unidades da Marketins" onKeyDown={teclas} style={{ '--n': n } as CSSProperties}>
          {unidades.map((un, i) => (
            <button
              key={un.cidade}
              ref={(b) => { abas.current[i] = b; }}
              type="button"
              role="tab"
              id={`pr-aba-${i}`}
              aria-selected={i === ativa}
              aria-controls={`pr-painel-${i}`}
              tabIndex={i === ativa ? 0 : -1}
              className="pr-aba"
              onClick={() => selecionar(i)}
            >
              <span className="pr-aba__n">{dois(i + 1)}</span>
              <span className="pr-aba__cidade">{un.cidade}</span>
              <span className="pr-aba__local">{un.local}</span>
            </button>
          ))}
        </div>

        {unidades.map((un, i) => (
          <div
            key={un.cidade}
            role="tabpanel"
            id={`pr-painel-${i}`}
            aria-labelledby={`pr-aba-${i}`}
            hidden={i !== ativa}
            className="pr-painel"
          >
            <figure className="pr-foto">
              {un.img
                ? <img src={un.img} alt={un.alt ?? `Unidade Marketins em ${un.cidade}`} loading="lazy" decoding="async" />
                : <div className="t-falta"><span>{un.cidade}</span></div>}
            </figure>
            <div className="pr-painel__info">
              <p className="pr-painel__local"><b>{un.local}</b>{un.cidade}, RJ</p>
              <Botao variante="seta" href={un.rota}>Como chegar</Botao>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
