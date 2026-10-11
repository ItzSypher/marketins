import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { linkContato } from '../content';
import { Botao } from '../ds/Botao';
import { ConectaLogo3D } from './ConectaLogo3D';
import { eventoConecta } from './dados';
import './conecta.css';

// Aviso do Marketins Conecta com contagem regressiva, em três tamanhos:
//   grande (modal com véu, contagem enorme e o logo em 3D)
//   → fechar → canto (card menor no canto inferior esquerdo; no celular, na base da tela)
//   → minimizar → selo (símbolo girando + "Conecta 16/10")
//   → tocar no selo → grande de novo.
// - Só aparece depois da Entrada, quando a pessoa rola além da hero (ou após 12 s).
// - O tamanho atual fica no sessionStorage: quem já viu o grande volta no canto ou no selo.
// - Grande: foco preso no card, Esc/X/"Agora não"/toque fora fecham, a página não rola.
// - No dia 16 mostra "É hoje!"; do dia 17 em diante some.
// - Combinação com o Assistente: avisa `marketins:conecta-abriu` (ele fecha o painel) e marca
//   `data-conecta-aberto` no <html> (no celular o botão dele sai de cena); se o assistente abrir,
//   o aviso vira selo.

const CHAVE_ENTROU = 'marketins:entrou'; // mesma chave que a Entrada grava
const CHAVE_ESTADO = 'mk:conecta-estado';
const DIA = 86_400_000;
const INICIO = Date.parse(eventoConecta.inicio);
const FIM = INICIO + DIA; // o dia do evento inteiro (horário de início ainda não informado)

type Estado = 'espera' | 'grande' | 'canto' | 'selo';

const lerEstado = (): Estado | null => {
  try {
    const v = sessionStorage.getItem(CHAVE_ESTADO);
    return v === 'canto' || v === 'selo' ? v : null;
  } catch { return null; }
};
const gravar = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* sem storage: segue sem lembrar */ } };
const jaEntrou = () => { try { return !!sessionStorage.getItem(CHAVE_ENTROU); } catch { return false; } };

const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(INICIO);
const dois = (n: number) => String(n).padStart(2, '0');

function partes(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { dias: Math.floor(s / 86400), horas: Math.floor(s / 3600) % 24, min: Math.floor(s / 60) % 60, seg: s % 60 };
}

const FOCAVEIS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Lenis = { stop(): void; start(): void };
// o Lenis desta página não é global (main.tsx); se algum dia for, usamos stop()/start()
const lenisGlobal = () => {
  const l = (window as unknown as { lenis?: Partial<Lenis> }).lenis;
  return l && typeof l.stop === 'function' && typeof l.start === 'function' ? (l as Lenis) : null;
};

function Contagem({ agora, classe }: { agora: number; classe: string }) {
  if (agora >= INICIO) return <p className={`${classe}__hoje`} role="status">É hoje!</p>;
  const p = partes(INICIO - agora);
  const itens: [number, string][] = [[p.dias, 'dias'], [p.horas, 'horas'], [p.min, 'min'], [p.seg, 'seg']];
  return (
    <div className={`${classe}__conta`} role="timer" aria-label={`Faltam ${p.dias} dias, ${p.horas} horas e ${p.min} minutos`}>
      {itens.map(([v, r]) => (
        <div key={r} className={`${classe}__cel`} aria-hidden="true">
          <b>{dois(v)}</b><span>{r}</span>
        </div>
      ))}
    </div>
  );
}

/** Símbolo da Marketins em camadas empilhadas (CSS 3D): dá espessura ao girar sem um segundo WebGL. */
function SimboloGirando() {
  return (
    <span className="cselo__giro" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <img key={i} src="/icone.svg" alt="" width="106" height="105" style={{ ['--k' as string]: i }} />
      ))}
    </span>
  );
}

export function Conecta() {
  const [agora, setAgora] = useState(() => Date.now());
  const [estado, setEstado] = useState<Estado>('espera');
  const veu = useRef<HTMLDivElement>(null);
  const grande = useRef<HTMLDivElement>(null);
  const canto = useRef<HTMLDivElement>(null);
  const selo = useRef<HTMLButtonElement>(null);
  const tituloGrande = useRef<HTMLHeadingElement>(null);
  const tituloCanto = useRef<HTMLHeadingElement>(null);
  const antes = useRef<HTMLElement | null>(null);
  const pendente = useRef(false);
  const id = useId();
  const acabou = agora >= FIM;
  const hoje = agora >= INICIO;
  const isGrande = estado === 'grande', isCanto = estado === 'canto', isSelo = estado === 'selo';

  // inert pelo DOM (o React 18 não conhece o atributo): o que está escondido não recebe foco nem clique
  useEffect(() => {
    veu.current?.toggleAttribute('inert', estado !== 'grande');
    canto.current?.toggleAttribute('inert', estado !== 'canto');
  }, [estado]);

  // relógio: segundo a segundo com a contagem à vista; devagar no selo
  useEffect(() => {
    if (acabou || estado === 'espera') return;
    const t = window.setInterval(() => setAgora(Date.now()), estado === 'selo' ? 30_000 : 1000);
    setAgora(Date.now());
    return () => window.clearInterval(t);
  }, [estado, acabou]);

  const abrirGrande = useCallback(() => {
    const ativo = document.activeElement;
    antes.current = ativo instanceof HTMLElement && ativo !== document.body ? ativo : null;
    setEstado('grande');
  }, []);

  const mostrar = useCallback(() => {
    const salvo = lerEstado();
    if (salvo) { setEstado((e) => (e === 'espera' ? salvo : e)); return; }
    // assistente aberto: espera ele fechar para não empilhar janelas
    if (document.documentElement.hasAttribute('data-assistente-aberto')) { pendente.current = true; return; }
    abrirGrande();
  }, [abrirGrande]);

  // quando aparecer: depois da Entrada, só quando a pessoa já passou da hero (ou 12 s)
  useEffect(() => {
    if (Date.now() >= FIM) return;
    let t = 0;
    let armado = false;
    const rolou = () => { if (armado && scrollY > innerHeight * 0.8) disparar(); };
    const disparar = () => {
      if (!armado) return;
      armado = false;
      window.clearTimeout(t);
      removeEventListener('scroll', rolou);
      mostrar();
    };
    const armar = () => {
      if (armado) return;
      armado = true;
      addEventListener('scroll', rolou, { passive: true });
      t = window.setTimeout(disparar, 12000);
      rolou();
    };
    const entrou = () => { gravar(CHAVE_ENTROU, '1'); armar(); };
    if (jaEntrou()) armar();
    window.addEventListener('marketins:entrou', entrou);
    return () => { window.clearTimeout(t); removeEventListener('scroll', rolou); window.removeEventListener('marketins:entrou', entrou); };
  }, [mostrar]);

  // conversa com o Assistente
  useEffect(() => {
    const ouvir = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d === 'aberto') setEstado((s) => (s === 'grande' || s === 'canto' ? 'selo' : s));
      if (d === 'fechado' && pendente.current) { pendente.current = false; window.setTimeout(mostrar, 600); }
    };
    window.addEventListener('marketins:assistente', ouvir);
    return () => window.removeEventListener('marketins:assistente', ouvir);
  }, [mostrar]);

  // grande → canto (devolve o foco a quem o tinha; se era o selo, que sumiu, vai para o card do canto)
  const fecharGrande = useCallback(() => {
    gravar(CHAVE_ESTADO, 'canto');
    setEstado('canto');
    const volta = antes.current;
    antes.current = null;
    window.setTimeout(() => {
      if (volta && volta.isConnected && !selo.current?.contains(volta) && volta.offsetParent !== null) volta.focus({ preventScroll: true });
      else tituloCanto.current?.focus({ preventScroll: true });
    }, 40);
  }, []);

  // canto → selo
  const minimizar = useCallback(() => {
    const comFoco = !!canto.current?.contains(document.activeElement);
    gravar(CHAVE_ESTADO, 'selo');
    setEstado('selo');
    if (comFoco) window.setTimeout(() => selo.current?.focus({ preventScroll: true }), 40);
  }, []);

  // atributo para o Assistente (no celular o botão dele sai de cena com o grande ou o canto à vista)
  useEffect(() => {
    const visivel = !acabou && (estado === 'grande' || estado === 'canto');
    document.documentElement.toggleAttribute('data-conecta-aberto', visivel);
    return () => document.documentElement.removeAttribute('data-conecta-aberto');
  }, [estado, acabou]);

  // grande aberto: avisa o assistente, trava a rolagem, prende o foco, Esc fecha
  useEffect(() => {
    if (estado !== 'grande' || acabou) return;
    window.dispatchEvent(new Event('marketins:conecta-abriu'));
    const raiz = document.documentElement;
    const lenis = lenisGlobal();
    const barra = innerWidth - raiz.clientWidth;
    const antigo = { overflow: raiz.style.overflow, corpo: document.body.style.overflow, padding: raiz.style.paddingRight };
    // Lenis global só se existir de verdade; senão a classe do Lenis + overflow hidden
    // (o véu tem data-lenis-prevent, então a roda e o toque não chegam ao Lenis local da página)
    if (lenis) lenis.stop(); else raiz.classList.add('lenis-stopped');
    raiz.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (barra > 0) raiz.style.paddingRight = `${barra}px`;

    const foco = window.setTimeout(() => tituloGrande.current?.focus({ preventScroll: true }), 60);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); fecharGrande(); return; }
      if (e.key !== 'Tab' || !grande.current) return;
      const lista = Array.from(grande.current.querySelectorAll<HTMLElement>(FOCAVEIS)).filter((el) => el.offsetParent !== null);
      if (!lista.length) return;
      const primeiro = lista[0], ultimo = lista[lista.length - 1];
      const ativo = document.activeElement;
      if (!grande.current.contains(ativo)) { e.preventDefault(); primeiro.focus(); }
      else if (e.shiftKey && (ativo === primeiro || ativo === tituloGrande.current)) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && ativo === ultimo) { e.preventDefault(); primeiro.focus(); }
    };
    window.addEventListener('keydown', tecla);
    return () => {
      window.clearTimeout(foco);
      window.removeEventListener('keydown', tecla);
      raiz.style.overflow = antigo.overflow;
      document.body.style.overflow = antigo.corpo;
      raiz.style.paddingRight = antigo.padding;
      if (lenis) lenis.start(); else raiz.classList.remove('lenis-stopped');
    };
  }, [estado, acabou, fecharGrande]);

  if (acabou || estado === 'espera') return null;

  const link = linkContato(`Conecta ${dataCurta} · confirmar presença`);
  const chamada = hoje ? 'O maior evento de influenciadores da Baixada é hoje.' : eventoConecta.chamada;
  const apoio = `Apoio: ${eventoConecta.apoio.join(' · ')}`;

  return (
    <>
      {/* ---------- grande ---------- */}
      <div
        ref={veu}
        className={`cgr-veu${isGrande ? ' is-aberto' : ''}`}
        data-lenis-prevent=""
        aria-hidden={!isGrande}
        onClick={(e) => { if (e.target === e.currentTarget) fecharGrande(); }}
      >
        <div
          ref={grande}
          className="cgr"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-gt`}
          aria-describedby={`${id}-gd`}
        >
          <button type="button" className="cgr__x" onClick={fecharGrande} aria-label="Fechar o aviso do Marketins Conecta">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>

          <ConectaLogo3D ativo={isGrande} className="cgr__logo" />

          <div className="cgr__texto">
            <h2 ref={tituloGrande} id={`${id}-gt`} className="cgr__data" tabIndex={-1}>
              <span className="cpop__sr">{eventoConecta.nome}, </span>{eventoConecta.data}
            </h2>
            <p id={`${id}-gd`} className="cgr__chamada">{chamada}</p>
          </div>

          <Contagem agora={agora} classe="cgr" />

          <div className="cgr__acoes">
            <Botao href={link} className="cgr__cta" onClick={() => window.setTimeout(fecharGrande, 400)}>Confirmar presença</Botao>
            <button type="button" className="cgr__depois" onClick={fecharGrande}>Agora não</button>
          </div>
          <p className="cgr__apoio">{apoio}</p>
        </div>
      </div>

      {/* ---------- canto ---------- */}
      <div
        ref={canto}
        className={`cpop${isCanto ? ' is-aberto' : ''}`}
        role="region"
        aria-labelledby={`${id}-ct`}
        aria-hidden={!isCanto}
      >
        <div className="cpop__topo">
          <img className="cpop__logo" src="/conecta/conecta-logo.svg" alt="" width="3670" height="950" decoding="async" />
          <button type="button" className="cpop__x" onClick={minimizar} aria-label="Minimizar o aviso do Marketins Conecta">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>

        <h2 ref={tituloCanto} id={`${id}-ct`} className="cpop__titulo" tabIndex={-1}>
          <span className="cpop__sr">{eventoConecta.nome}, </span>{eventoConecta.data}
        </h2>
        <p className="cpop__chamada">{chamada}</p>

        <Contagem agora={agora} classe="cpop" />

        <Botao href={link} className="cpop__cta" compacto onClick={() => window.setTimeout(minimizar, 400)}>Confirmar presença</Botao>

        <div className="cpop__rodape">
          <p className="cpop__apoio">{apoio}</p>
          <button type="button" className="cpop__depois" onClick={minimizar}>Agora não</button>
        </div>
      </div>

      {/* ---------- selo ---------- */}
      <button
        ref={selo}
        type="button"
        className={`cselo${isSelo ? ' is-visivel' : ''}`}
        onClick={abrirGrande}
        aria-haspopup="dialog"
        aria-label={`${eventoConecta.nome}, ${eventoConecta.data}. Abrir a contagem regressiva`}
        aria-hidden={!isSelo}
        tabIndex={isSelo ? 0 : -1}
      >
        <span className="cselo__disco"><SimboloGirando /></span>
        <span className="cselo__txt" aria-hidden="true"><b>Conecta</b><span>{dataCurta}</span></span>
      </button>
    </>
  );
}
