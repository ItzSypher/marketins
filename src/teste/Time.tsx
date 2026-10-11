import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { equipeFinal } from './dados';
import './time.css';

/*
  Time: "Quem vai cuidar da sua marca". Três jeitos de escolher alguém, por ?time=1|2|3 (padrão 1):
  1. Seletor do Figma: painéis lado a lado (o escolhido abre largo, os outros viram faixas com o nome
     na vertical); no celular vira acordeão de faixas horizontais.
  2. Cards sobrepostos em leque: o escolhido sobe e os seguintes deslizam; no celular é um carrossel
     com scroll-snap só dentro do componente. Nome e texto embaixo.
  3. Palco: foto grande que troca com uma cortina + fileira de miniaturas; arrastar a foto para o
     lado também troca.
  O escolhido é estado do React (clique, toque, teclado e, com mouse, hover). Sem pin, sem biblioteca.
*/

const time = equipeFinal;
const N = time.length;
const dois = (n: number) => String(n).padStart(2, '0');
const comMouse = (e: RPointerEvent) => e.pointerType === 'mouse';

/* hover escolhe só quando o mouse anda de verdade: rolar a página com o mouse parado
   (o Chrome manda um pointermove sintético) não troca a pessoa */
function useHover(sel: number, escolher: (i: number) => void) {
  const ultimo = useRef({ x: -1, y: -1 });
  return (i: number) => (e: RPointerEvent) => {
    if (!comMouse(e)) return;
    const u = ultimo.current;
    if (u.x === e.clientX && u.y === e.clientY) return;
    ultimo.current = { x: e.clientX, y: e.clientY };
    if (i !== sel) escolher(i);
  };
}

type Var = 1 | 2 | 3;
const lerVar = (): Var => {
  const v = Number(new URLSearchParams(location.search).get('time'));
  return v === 2 || v === 3 ? v : 1;
};

type Props = { sel: number; escolher: (i: number) => void };

/* setas, Home e End movem o foco e escolhem (tabs com ativação automática) */
function navegar(e: KeyboardEvent, i: number, botoes: (HTMLButtonElement | null)[], escolher: (i: number) => void) {
  const mapa: Record<string, number> = {
    ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: N - 1,
  };
  if (!(e.key in mapa)) return;
  e.preventDefault();
  const j = (mapa[e.key] + N) % N;
  escolher(j);
  botoes[j]?.focus();
}

export function Time() {
  const [v, setV] = useState<Var>(lerVar);
  const [sel, setSel] = useState(0);

  const trocarVar = (n: Var) => {
    setV(n);
    const url = new URL(location.href);
    url.searchParams.set('time', String(n));
    history.replaceState(history.state, '', url);
  };

  return (
    <section id="time" className="t-sec tm" aria-labelledby="tm-titulo">
      <div className="tm__topo">
        <header className="t-cabeca tm__cabeca" data-revela>
          <p className="t-num">O time</p>
          <h2 className="t-titulo" id="tm-titulo">Quem vai cuidar da sua marca</h2>
        </header>
        <div className="tm-var" role="group" aria-label="Comparar versões da seção do time">
          <span aria-hidden="true">Time</span>
          {([1, 2, 3] as Var[]).map((n) => (
            <button key={n} type="button" aria-pressed={v === n} aria-label={`Versão ${n}`} onClick={() => trocarVar(n)}>{n}</button>
          ))}
        </div>
      </div>
      {v === 1 && <Sanfona sel={sel} escolher={setSel} />}
      {v === 2 && <Leque sel={sel} escolher={setSel} />}
      {v === 3 && <Palco sel={sel} escolher={setSel} />}
    </section>
  );
}

/* ───────────── 1. Seletor do Figma (painéis / acordeão) ───────────── */

function Sanfona({ sel, escolher }: Props) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const hover = useHover(sel, escolher);
  return (
    <div className="tm1">
      {time.map((p, i) => {
        const on = i === sel;
        return (
          <div className={`tm1__item${on ? ' is-on' : ''}`} key={p.nome} onPointerMove={hover(i)}>
            <button
              ref={(el) => { botoes.current[i] = el; }}
              type="button"
              className="tm1__bt"
              aria-expanded={on}
              aria-controls={`tm1-info-${i}`}
              onClick={() => escolher(i)}
              onKeyDown={(e) => navegar(e, i, botoes.current, escolher)}
            >
              <img className="tm1__foto" src={p.foto} alt="" width={900} height={1022} loading="lazy" decoding="async" />
              <span className="tm1__rot">{p.nome}</span>
            </button>
            <div className="tm1__info" id={`tm1-info-${i}`} aria-hidden={!on}>
              <h3>{p.nome}</h3>
              {p.texto && <p>{p.texto}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────── 2. Cards sobrepostos em leque ───────────── */

function Leque({ sel, escolher }: Props) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const trilho = useRef<HTMLDivElement>(null);
  const hover = useHover(sel, escolher);
  const p = time[sel];

  // no carrossel (celular), traz o card escolhido para dentro da tela rolando só o trilho
  useEffect(() => {
    const t = trilho.current, c = botoes.current[sel];
    if (!t || !c || t.scrollWidth <= t.clientWidth + 1) return;
    const esq = c.offsetLeft - 16;
    const dir = c.offsetLeft + c.offsetWidth + 66 - t.clientWidth;
    if (t.scrollLeft > esq) t.scrollTo({ left: esq, behavior: 'smooth' });
    else if (t.scrollLeft < dir) t.scrollTo({ left: dir, behavior: 'smooth' });
  }, [sel]);

  return (
    <div className="tm2">
      <div className="tm2__trilho" ref={trilho} role="tablist" aria-label="Pessoas do time">
        {time.map((m, i) => (
          <button
            key={m.nome}
            ref={(el) => { botoes.current[i] = el; }}
            type="button"
            role="tab"
            id={`tm2-tab-${i}`}
            aria-selected={i === sel}
            aria-controls="tm2-painel"
            tabIndex={i === sel ? 0 : -1}
            className={`tm2__card${i === sel ? ' is-on' : ''}`}
            onClick={() => escolher(i)}
            onPointerMove={hover(i)}
            onKeyDown={(e) => navegar(e, i, botoes.current, escolher)}
          >
            <img src={m.foto} alt="" width={900} height={1022} loading="lazy" decoding="async" draggable={false} />
            <span className="tm2__tit"><small>{dois(i + 1)}</small>{m.nome}</span>
          </button>
        ))}
        <span className="tm2__fim" aria-hidden="true" />
      </div>
      <div className="tm2__painel" id="tm2-painel" role="tabpanel" aria-labelledby={`tm2-tab-${sel}`}>
        <div className="tm2__txt" key={sel}>
          <p className="t-num">{dois(sel + 1)} / {dois(N)}</p>
          <h3>{p.nome}</h3>
          {p.texto && <p className="tm2__bio">{p.texto}</p>}
        </div>
      </div>
    </div>
  );
}

/* ───────────── 3. Palco + miniaturas ───────────── */

function Palco({ sel, escolher }: Props) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const toque = useRef<number | null>(null);
  // foto anterior fica por baixo enquanto a nova entra por cima (estado derivado no render, sem piscar)
  const [vis, setVis] = useState<{ sel: number; antes: number | null; dir: 1 | -1 }>({ sel, antes: null, dir: 1 });
  if (vis.sel !== sel) setVis({ sel, antes: vis.sel, dir: sel > vis.sel ? 1 : -1 });
  const p = time[sel];

  const ir = (passo: number) => escolher((sel + passo + N) % N);
  const inicio = (e: RPointerEvent) => { if (!comMouse(e)) toque.current = e.clientX; };
  const fim = (e: RPointerEvent) => {
    if (toque.current === null) return;
    const dx = e.clientX - toque.current;
    toque.current = null;
    if (Math.abs(dx) > 45) ir(dx < 0 ? 1 : -1);
  };

  return (
    <div className="tm3" style={{ '--i': sel } as CSSProperties}>
      <div className="tm3__palco" data-dir={vis.dir} onPointerDown={inicio} onPointerUp={fim} onPointerCancel={() => { toque.current = null; }}>
        {time.map((m, i) => {
          const cls = i === sel ? ` is-on${vis.antes !== null ? ' is-anima' : ''}` : i === vis.antes ? ' is-sai' : '';
          return (
            <img
              key={m.nome}
              className={`tm3__foto${cls}`}
              src={m.foto}
              alt={i === sel ? m.nome : ''}
              aria-hidden={i !== sel}
              width={900}
              height={1022}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          );
        })}
        <div className="tm3__setas">
          <button type="button" aria-label="Pessoa anterior" onClick={() => ir(-1)}><span aria-hidden="true">←</span></button>
          <button type="button" aria-label="Próxima pessoa" onClick={() => ir(1)}><span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div className="tm3__info" id="tm3-painel" role="tabpanel" aria-labelledby={`tm3-tab-${sel}`}>
        <div className="tm3__txt" key={sel}>
          <p className="t-num">{dois(sel + 1)} / {dois(N)}</p>
          <h3>{p.nome}</h3>
          {p.texto && <p className="tm3__bio">{p.texto}</p>}
        </div>
      </div>
      <div className="tm3__lista" role="tablist" aria-label="Pessoas do time">
        {time.map((m, i) => (
          <button
            key={m.nome}
            ref={(el) => { botoes.current[i] = el; }}
            type="button"
            role="tab"
            id={`tm3-tab-${i}`}
            aria-selected={i === sel}
            aria-controls="tm3-painel"
            tabIndex={i === sel ? 0 : -1}
            className={`tm3__tab${i === sel ? ' is-on' : ''}`}
            onClick={() => escolher(i)}
            onKeyDown={(e) => navegar(e, i, botoes.current, escolher)}
          >
            <span className="tm3__mini"><img src={m.foto} alt="" width={900} height={1022} loading="lazy" decoding="async" /></span>
            <span className="tm3__nome">{m.nome}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
