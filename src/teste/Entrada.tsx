import { useEffect, useLayoutEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Logo3D } from '../ds/Logo3D';
import './entrada.css';

/*
  Tela de entrada: o símbolo da Marketins girando em 3D, sem botão.
  Um toque (ou clique) em qualquer ponto da tela entra; o teclado também (Enter ou Espaço, com foco visível).
  A entrada dispara 'marketins:entrou' (o Assistente usa para tocar a música, o Conecta para o pop-up),
  a tela sobe como uma cortina e a rolagem é liberada.
  Na mesma sessão (sessionStorage 'marketins:entrou' = '1') a entrada não aparece de novo; o evento
  'marketins:entrou' sai no primeiro toque ou tecla da pessoa na página.
  Para a hero: 'marketins:entrada-fechou' avisa quando a página fica à vista (e entradaAberta() diz o estado).
*/
const CHAVE = 'marketins:entrou';
export const ENTRADA_FECHOU = 'marketins:entrada-fechou';

function jaEntrou() {
  try { return sessionStorage.getItem(CHAVE) === '1'; } catch { return false; }
}
function lembrar() {
  try { sessionStorage.setItem(CHAVE, '1'); } catch { /* sem storage: mostra de novo na próxima visita */ }
}
const avisarEntrou = () => window.dispatchEvent(new CustomEvent('marketins:entrou'));

// decidido uma vez por carregamento (o StrictMode monta duas vezes)
let aberta = !jaEntrou();
export const entradaAberta = () => aberta;

// no computador com mouse a dica diz "Clique"; no toque, "Toque"
function dicaDoPonteiro() {
  try {
    return matchMedia('(hover: hover) and (pointer: fine)').matches ? 'Clique para entrar' : 'Toque para entrar';
  } catch {
    return 'Toque para entrar';
  }
}

export function Entrada() {
  const [fase, setFase] = useState<'aberta' | 'saindo' | 'fechada'>(() => (aberta ? 'aberta' : 'fechada'));
  const [dica] = useState(dicaDoPonteiro);
  const travada = fase === 'aberta';

  // trava a rolagem enquanto a entrada está aberta (o gutter evita o pulo da barra no desktop)
  useLayoutEffect(() => {
    if (!travada) return;
    const html = document.documentElement;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    scrollTo(0, 0);
    html.classList.add('com-entrada');
    return () => {
      html.classList.remove('com-entrada');
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
  }, [travada]);

  // visita seguinte: sem tela; o som só é liberado no primeiro gesto da pessoa
  useEffect(() => {
    if (aberta) return;
    let feito = false;
    const tirar = () => { removeEventListener('pointerdown', gesto, true); removeEventListener('keydown', gesto, true); };
    function gesto() {
      if (feito) return;
      feito = true;
      tirar();
      avisarEntrou();
    }
    addEventListener('pointerdown', gesto, true);
    addEventListener('keydown', gesto, true);
    return tirar;
  }, []);

  if (fase === 'fechada') return null;

  const entrar = () => {
    if (fase !== 'aberta') return;
    avisarEntrou(); // síncrono, dentro do toque: o navegador deixa o áudio tocar
    lembrar();
    aberta = false;
    window.dispatchEvent(new CustomEvent(ENTRADA_FECHOU));
    setFase('saindo');
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => setFase('fechada'), reduzido ? 260 : 1000);
  };

  // teclado: Enter ou Espaço entram (o Espaço não rola a página enquanto a entrada está aberta)
  const tecla = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (!e.repeat) entrar();
  };

  return (
    <div
      className={`en${fase === 'saindo' ? ' is-saindo' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Entrar no site"
      onClick={entrar}
      onKeyDown={tecla}
      data-lenis-prevent
    >
      <div className="en__brilho" aria-hidden="true" />
      <div className="en__miolo">
        <Logo3D tipo="icone" className="en__logo" />
        <span className="en__marca" role="img" aria-label="Marketins" />
        <p className="en__frase">Soluções de marketing</p>
        <p className="en__dica" aria-hidden="true">
          <span>{dica}</span>
        </p>
      </div>
    </div>
  );
}
