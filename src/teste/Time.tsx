import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { Botao } from '../ds/Botao';
import { equipeFinal } from './dados';
import './time.css';

/*
  Time: "Quem vai cuidar da sua marca".
  - Esteira: carrossel infinito de fotos grandes que anda sozinho (rAF no scrollLeft, então também
    rola com o dedo). Começa no Sérgio. Pausa no hover, no toque e com foco de teclado; com
    prefers-reduced-motion fica parado e só rola na mão. Nome e número ficam EMBAIXO da foto.
  - Tocar numa pessoa abre o destaque (foto grande + número + nome + texto). Duas versões, por
    ?time=1|2 (padrão 1):
    1. Cascata (Figma, nó 5029:5573, "Versão Mobile"): o escolhido na frente e os próximos
       escalonados atrás (para cima no celular, para a direita no PC), trocando com animação.
    2. Mini-avatares: foto grande + fileira de avatares redondos para trocar de pessoa.
    Nas duas: setas, swipe, teclado (setas e Esc) e botão para voltar à esteira.
*/

const time = equipeFinal;
const N = time.length;
const dois = (n: number) => String(n).padStart(2, '0');
const W = 900, H = 1022;

type Var = 1 | 2;
const lerVar = (): Var => (new URLSearchParams(location.search).get('time') === '2' ? 2 : 1);
const semMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Time() {
  const [v, setV] = useState<Var>(lerVar);
  const [aberto, setAberto] = useState<number | null>(null);
  const [ultimo, setUltimo] = useState(0);
  const [focarCard, setFocarCard] = useState(false);

  const trocarVar = (n: Var) => {
    setV(n);
    const url = new URL(location.href);
    url.searchParams.set('time', String(n));
    history.replaceState(history.state, '', url);
  };

  const abrir = (i: number) => { setUltimo(i); setAberto(i); };
  const voltar = (sel: number, teclado: boolean) => { setUltimo(sel); setFocarCard(teclado); setAberto(null); };

  return (
    <section id="time" className="t-sec tm" aria-labelledby="tm-titulo">
      <div className="tm__topo">
        <header className="t-cabeca tm__cabeca" data-revela>
          <p className="t-num">O time</p>
          <h2 className="t-titulo" id="tm-titulo">Quem vai cuidar da sua marca</h2>
        </header>
        <div className="tm-var" role="group" aria-label="Comparar versões do destaque do time">
          <span aria-hidden="true">Time</span>
          {([1, 2] as Var[]).map((n) => (
            <button key={n} type="button" aria-pressed={v === n} aria-label={`Versão ${n}: ${n === 1 ? 'cascata' : 'mini-avatares'}`} onClick={() => trocarVar(n)}>{n}</button>
          ))}
        </div>
      </div>
      {aberto === null
        ? <Esteira inicio={ultimo} focar={focarCard} abrir={abrir} />
        : <Destaque key={v} v={v} inicio={aberto} voltar={voltar} />}
    </section>
  );
}

/* ───────────── esteira infinita ───────────── */

const COPIAS = 3; // a do meio é a "real"; as das pontas só deixam o laço sem emenda

function Esteira({ inicio, focar, abrir }: { inicio: number; focar: boolean; abrir: (i: number) => void }) {
  const trilho = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const t = trilho.current;
    if (!t) return;
    let larg = 0;
    const medir = () => {
      const a = cards.current[0], b = cards.current[N];
      larg = a && b ? b.offsetLeft - a.offsetLeft : 0;
    };
    medir();
    const base = cards.current[N], alvo = cards.current[N + inicio];
    let pos = larg + (alvo && base ? alvo.offsetLeft - base.offsetLeft : 0);
    t.scrollLeft = pos;
    if (focar) cards.current[N + inicio]?.focus({ preventScroll: true });

    let raf = 0, antes = 0, visivel = false, segura = 0, ate = 0;
    const parar = semMovimento();
    const vel = () => (innerWidth >= 1000 ? 46 : 34); // px por segundo

    // mantém o scroll na cópia do meio: pula uma volta inteira sem mudar o que se vê
    const laco = () => {
      if (!larg) return;
      const s = t.scrollLeft;
      if (s < larg * 0.5) { t.scrollLeft = s + larg; pos = t.scrollLeft; }
      else if (s > larg * 1.5) { t.scrollLeft = s - larg; pos = t.scrollLeft; }
    };
    const passo = (agora: number) => {
      raf = requestAnimationFrame(passo);
      const dt = antes ? Math.min(agora - antes, 64) / 1000 : 0;
      antes = agora;
      if (segura > 0 || agora < ate || document.hidden) return;
      pos += vel() * dt;
      t.scrollLeft = pos;
      laco();
    };
    const ligar = () => { if (!raf && visivel && !parar) { antes = 0; raf = requestAnimationFrame(passo); } };
    const desligar = () => { cancelAnimationFrame(raf); raf = 0; };

    let viu = false;
    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel && !viu) { viu = true; pausar(900); } // dá tempo de ver quem abre a fila
      if (visivel) ligar(); else desligar();
    });
    io.observe(t);

    const pausar = (ms: number) => { ate = Math.max(ate, performance.now() + ms); };
    const onScroll = () => {
      if (Math.abs(t.scrollLeft - pos) > 2) { pos = t.scrollLeft; pausar(1600); } // rolagem da pessoa
      laco();
    };
    const entra = (e: PointerEvent) => { if (e.pointerType === 'mouse') segura++; };
    const sai = (e: PointerEvent) => { if (e.pointerType === 'mouse') segura = Math.max(0, segura - 1); };
    const toque = (e: PointerEvent) => { if (e.pointerType !== 'mouse') pausar(2500); };
    const solta = (e: PointerEvent) => { if (e.pointerType !== 'mouse') pausar(2200); };
    let comFoco = false;
    const foco = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (!comFoco && el.matches(':focus-visible')) { comFoco = true; segura++; }
    };
    const desfoco = (e: FocusEvent) => {
      if (comFoco && !t.contains(e.relatedTarget as Node)) { comFoco = false; segura = Math.max(0, segura - 1); }
    };
    const redim = () => {
      const fr = larg ? (t.scrollLeft - larg) / larg : 0;
      medir();
      pos = t.scrollLeft = larg + fr * larg;
    };

    t.addEventListener('scroll', onScroll, { passive: true });
    t.addEventListener('pointerenter', entra);
    t.addEventListener('pointerleave', sai);
    t.addEventListener('pointerdown', toque);
    t.addEventListener('pointerup', solta);
    t.addEventListener('focusin', foco);
    t.addEventListener('focusout', desfoco);
    addEventListener('resize', redim);
    return () => {
      desligar();
      io.disconnect();
      t.removeEventListener('scroll', onScroll);
      t.removeEventListener('pointerenter', entra);
      t.removeEventListener('pointerleave', sai);
      t.removeEventListener('pointerdown', toque);
      t.removeEventListener('pointerup', solta);
      t.removeEventListener('focusin', foco);
      t.removeEventListener('focusout', desfoco);
      removeEventListener('resize', redim);
    };
  }, [inicio, focar]);

  return (
    <div className="tm-est">
      <div className="tm-est__trilho" ref={trilho} role="list" aria-label="Pessoas do time">
        {Array.from({ length: COPIAS * N }, (_, k) => {
          const i = k % N, m = time[i];
          const real = Math.floor(k / N) === 1;
          return (
            <div role="listitem" key={k} className="tm-est__item" aria-hidden={!real}>
              <button
                ref={(el) => { cards.current[k] = el; }}
                type="button"
                className="tm-card"
                tabIndex={real ? 0 : -1}
                aria-label={`Conhecer ${m.nome}`}
                onClick={() => abrir(i)}
              >
                <span className="tm-card__foto">
                  <img src={m.foto} alt={m.nome} width={W} height={H} loading="lazy" decoding="async" draggable={false} />
                </span>
                <span className="tm-card__leg"><small>{dois(i + 1)}</small>{m.nome}</span>
              </button>
            </div>
          );
        })}
      </div>
      <p className="tm-est__dica">Toque numa foto para conhecer quem faz.</p>
    </div>
  );
}

/* ───────────── destaque (cascata ou mini-avatares) ───────────── */

function Destaque({ v, inicio, voltar }: { v: Var; inicio: number; voltar: (sel: number, teclado: boolean) => void }) {
  const [sel, setSel] = useState(inicio);
  const raiz = useRef<HTMLDivElement>(null);
  const toque = useRef<number | null>(null);
  // estado derivado no render: quem acabou de sair e para que lado, para animar sem piscar
  const [vis, setVis] = useState<{ sel: number; antes: number | null; dir: 1 | -1 }>({ sel, antes: null, dir: 1 });
  if (vis.sel !== sel) {
    const frente = (sel - vis.sel + N) % N;
    setVis({ sel, antes: vis.sel, dir: frente <= N / 2 ? 1 : -1 });
  }
  const p = time[sel];

  useEffect(() => { raiz.current?.focus({ preventScroll: true }); }, []);

  const ir = (passo: number) => setSel((s) => (s + passo + N) % N);
  const sair = () => voltar(sel, !!document.activeElement?.matches(':focus-visible'));
  const tecla = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); }
    else if (e.key === 'Escape') { e.preventDefault(); voltar(sel, true); }
  };
  const inicioToque = (e: RPointerEvent) => { if (e.pointerType !== 'mouse') toque.current = e.clientX; };
  const fimToque = (e: RPointerEvent) => {
    if (toque.current === null) return;
    const dx = e.clientX - toque.current;
    toque.current = null;
    if (Math.abs(dx) > 45) ir(dx < 0 ? 1 : -1);
  };
  const gestos = { onPointerDown: inicioToque, onPointerUp: fimToque, onPointerCancel: () => { toque.current = null; } };

  return (
    <div
      ref={raiz}
      className={`tm-dq tm-dq--${v === 1 ? 'cascata' : 'avatares'}`}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaque do time. Use as setas para trocar de pessoa."
      tabIndex={-1}
      onKeyDown={tecla}
    >
      {v === 1
        ? <Cascata sel={sel} vis={vis} escolher={setSel} gestos={gestos} />
        : <Palco sel={sel} vis={vis} gestos={gestos} />}

      <div className="tm-dq__lado">
        <div className="tm-dq__info" aria-live="polite">
          <div className="tm-dq__txt" key={sel}>
            <p className="t-num">{dois(sel + 1)} / {dois(N)}</p>
            <h3>{p.nome}</h3>
            {p.texto && <p className="tm-dq__bio">{p.texto}</p>}
          </div>
        </div>

        {v === 2 && (
          <div className="tm-av" role="group" aria-label="Escolher pessoa do time">
            {time.map((m, i) => (
              <button key={m.nome} type="button" className={`tm-av__bt${i === sel ? ' is-on' : ''}`} aria-label={m.nome} aria-pressed={i === sel} onClick={() => setSel(i)}>
                <img src={m.foto} alt={m.nome} width={W} height={H} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}

        <div className="tm-dq__ctrl">
          <div className="tm-setas">
            <button type="button" aria-label="Pessoa anterior" onClick={() => ir(-1)}><Seta esq /></button>
            <button type="button" aria-label="Próxima pessoa" onClick={() => ir(1)}><Seta /></button>
          </div>
          <Botao variante="seta" compacto onClick={sair} className="tm-dq__voltar">Ver o time todo</Botao>
        </div>
      </div>
    </div>
  );
}

type Vis = { sel: number; antes: number | null; dir: 1 | -1 };
type Gestos = { onPointerDown: (e: RPointerEvent) => void; onPointerUp: (e: RPointerEvent) => void; onPointerCancel: () => void };

/* 1. cascata: o escolhido na frente, os próximos escalonados atrás */
function Cascata({ sel, vis, escolher, gestos }: { sel: number; vis: Vis; escolher: (i: number) => void; gestos: Gestos }) {
  return (
    <div className="tm-cas" data-dir={vis.dir} {...gestos}>
      {time.map((m, i) => {
        const pos = (i - sel + N) % N;
        const q = Math.min(pos, 4);
        const cls = pos === 0
          ? (vis.antes !== null && vis.dir === -1 ? ' is-entra' : '')
          : i === vis.antes && vis.dir === 1 ? ' is-sai' : '';
        return (
          <div
            key={m.nome}
            className={`tm-cas__card${pos === 0 ? ' is-on' : ''}${q >= 4 ? ' is-fora' : ''}${cls}`}
            style={{ '--q': q, zIndex: N - pos } as CSSProperties}
            onClick={pos > 0 ? () => escolher(i) : undefined}
            aria-hidden={pos !== 0}
          >
            <img src={m.foto} alt={pos === 0 ? m.nome : ''} width={W} height={H} loading="lazy" decoding="async" draggable={false} />
            <span className="tm-cas__nome" aria-hidden="true">{m.nome}</span>
          </div>
        );
      })}
    </div>
  );
}

/* 2. palco: a foto nova entra por cima da anterior com uma cortina */
function Palco({ sel, vis, gestos }: { sel: number; vis: Vis; gestos: Gestos }) {
  return (
    <div className="tm-palco" data-dir={vis.dir} {...gestos}>
      {time.map((m, i) => {
        const cls = i === sel ? ` is-on${vis.antes !== null ? ' is-anima' : ''}` : i === vis.antes ? ' is-sai' : '';
        return (
          <img
            key={m.nome}
            className={`tm-palco__foto${cls}`}
            src={m.foto}
            alt={i === sel ? m.nome : ''}
            aria-hidden={i !== sel}
            width={W}
            height={H}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        );
      })}
    </div>
  );
}

function Seta({ esq }: { esq?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={esq ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
