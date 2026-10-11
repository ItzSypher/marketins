import { useEffect, useId, useRef, useState } from 'react';
import { linkContato } from '../content';
import './assistente.css';

// Botão redondo da Marketins (canto inferior direito) que vira assistente:
// frases prontas que abrem o WhatsApp + o controle da música. A música começa
// quando a Entrada dispara `marketins:entrou` e para sozinha em 10 s.
// Combinação com o pop-up do Conecta: este avisa `marketins:assistente`
// (aberto/fechado) e fecha o painel quando ouve `marketins:conecta-abriu`.

const FRASES = [
  'Quero um site',
  'Quero aparecer no Google',
  'Meu Instagram não traz cliente',
  'Quero conhecer a agência',
  'Quero ir no Marketins Conecta',
];
const LIMITE_MUSICA = 10;

export function Assistente() {
  const [aberto, setAberto] = useState(false);
  const [tocando, setTocando] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const primeiro = useRef<HTMLAnchorElement>(null);
  const id = useId();

  /* ---------- música (mesma lógica do Musica de src/ds/blocos.tsx) ---------- */
  const tocarDoInicio = () => {
    const a = audio.current; if (!a) return;
    a.currentTime = 0; a.volume = 1;
    a.play().then(() => setTocando(true)).catch(() => setTocando(false));
  };
  const alternar = () => {
    const a = audio.current; if (!a) return;
    if (a.paused) tocarDoInicio();
    else { a.pause(); setTocando(false); }
  };
  // aos 10 s some aos poucos e para
  const tempo = () => {
    const a = audio.current; if (!a || a.paused) return;
    if (a.currentTime >= LIMITE_MUSICA - 1) a.volume = Math.max(0, LIMITE_MUSICA - a.currentTime);
    if (a.currentTime >= LIMITE_MUSICA) { a.pause(); a.volume = 1; setTocando(false); }
  };

  useEffect(() => {
    // o toque em "Pronto pra elevar minha empresa" é o gesto que libera o som
    const entrou = () => tocarDoInicio();
    // o celular (vídeos do feed) pede pausa; só retoma se estava tocando antes
    let pausadaPorFora = false;
    const ouvir = (e: Event) => {
      const a = audio.current; if (!a) return;
      const d = (e as CustomEvent).detail;
      if (d === 'pausar' && !a.paused) { a.pause(); setTocando(false); pausadaPorFora = true; }
      if (d === 'retomar' && pausadaPorFora) { pausadaPorFora = false; a.play().then(() => setTocando(true)).catch(() => {}); }
    };
    window.addEventListener('marketins:entrou', entrou);
    window.addEventListener('marketins:musica', ouvir);
    return () => {
      window.removeEventListener('marketins:entrou', entrou);
      window.removeEventListener('marketins:musica', ouvir);
    };
  }, []);

  /* ---------- painel ---------- */
  const fechar = (devolverFoco = false) => {
    setAberto(false);
    if (devolverFoco) botao.current?.focus();
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('marketins:assistente', { detail: aberto ? 'aberto' : 'fechado' }));
    document.documentElement.toggleAttribute('data-assistente-aberto', aberto);
    if (!aberto) return;
    // foco na primeira frase depois que o painel aparece
    const t = window.setTimeout(() => primeiro.current?.focus({ preventScroll: true }), 60);
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(true); };
    const fora = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) fechar();
    };
    window.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', fora);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', tecla);
      document.removeEventListener('pointerdown', fora);
    };
  }, [aberto]);

  // o pop-up do Conecta pede espaço: fecha o painel
  useEffect(() => {
    const ouvir = () => setAberto(false);
    window.addEventListener('marketins:conecta-abriu', ouvir);
    return () => window.removeEventListener('marketins:conecta-abriu', ouvir);
  }, []);

  return (
    <div ref={raiz} className={`assist${aberto ? ' is-aberto' : ''}${tocando ? ' is-tocando' : ''}`}>
      <audio ref={audio} src="/media/musica.mp3" loop preload="auto" onTimeUpdate={tempo} />

      <div id={`${id}-painel`} className="assist__painel" role="dialog" aria-modal="false" aria-labelledby={`${id}-oi`}>
        <header className="assist__topo">
          <img className="assist__avatar" src="/icone.svg" alt="" width="32" height="32" />
          <div>
            <p id={`${id}-oi`} className="assist__oi">Oi! Em que a gente pode ajudar?</p>
            <p className="assist__sub">Escolha um assunto. A conversa segue no WhatsApp.</p>
          </div>
          <button type="button" className="assist__x" onClick={() => fechar(true)} aria-label="Fechar o assistente">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <ul className="assist__frases">
          {FRASES.map((f, i) => (
            <li key={f} style={{ '--i': i } as React.CSSProperties}>
              <a ref={i === 0 ? primeiro : undefined} href={linkContato(`assistente · ${f}`)} target="_blank" rel="noopener" onClick={() => fechar()}>
                <span>{f}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
              </a>
            </li>
          ))}
        </ul>

        <div className="assist__som">
          <span className="assist__eq" aria-hidden="true"><i /><i /><i /></span>
          <span className="assist__som-txt">Música da Marketins</span>
          <button type="button" className="assist__tocar" onClick={alternar} aria-pressed={tocando}>
            {tocando ? 'Pausar' : 'Tocar'}
          </button>
        </div>
      </div>

      <button
        ref={botao}
        type="button"
        className="assist__botao"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls={`${id}-painel`}
        aria-label={aberto ? 'Fechar o assistente da Marketins' : 'Abrir o assistente da Marketins'}
      >
        <img src="/icone.svg" alt="" width="34" height="34" />
        <span className="assist__fala" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5 6h14v9H10l-4 3v-3H5z" /></svg>
        </span>
      </button>
    </div>
  );
}
