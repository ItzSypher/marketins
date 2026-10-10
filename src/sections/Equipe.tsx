import { useEffect, useRef, useState } from 'react';
import { membros } from '../content';

const TEMPO_AUTO = 5500;

/**
 * Carrossel do time (Figma "Carrossel=SÉRGIO"): um card aberto e os demais em
 * tiras. No desktop abre na horizontal, no celular na vertical. O card aberto
 * toca o vídeo do membro quando ele existe; sem vídeo, fica a foto.
 * Passa sozinho até a primeira interação.
 */
export function Equipe() {
  const [ativo, setAtivo] = useState(0);
  const [manual, setManual] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const raiz = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (manual || !visivel || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setTimeout(() => setAtivo((a) => (a + 1) % membros.length), TEMPO_AUTO);
    return () => window.clearTimeout(id);
  }, [ativo, manual, visivel]);

  const abrir = (i: number) => { setManual(true); setAtivo(i); };

  return (
    <ul className="equipe" ref={raiz} data-revela>
      {membros.map((m, i) => {
        const aberto = i === ativo;
        return (
          <li key={m.slug} className={aberto ? 'equipe__item is-aberto' : 'equipe__item'}>
            <button type="button" aria-pressed={aberto} aria-label={m.nome} onClick={() => abrir(i)} onMouseEnter={() => matchMedia('(min-width: 768px) and (hover: hover)').matches && abrir(i)}>
              <img className="equipe__tira" src={`/equipe/${m.slug}-tira.webp`} alt="" width="389" height="1266" loading="lazy" />
              <img className="equipe__foto" src={`/equipe/${m.slug}-card.webp`} alt="" width="440" height="500" loading="lazy" />
              {aberto && m.video && (
                <video className="equipe__video" src={m.video} poster={`/equipe/${m.slug}-card.webp`} autoPlay muted loop playsInline />
              )}
              <span className="equipe__sombra" aria-hidden="true" />
              <span className="equipe__nome">{m.nome}</span>
              {m.texto && <span className="equipe__texto">{m.texto}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
