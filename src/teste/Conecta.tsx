import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { linkContato } from '../content';
import { Botao } from '../ds/Botao';
import { eventoConecta } from './dados';
import './conecta.css';

// Pop-up do Marketins Conecta com contagem regressiva.
// - Só aparece depois da Entrada (`marketins:entrou` + 2,5 s) ou 4 s após carregar
//   se a pessoa já entrou nesta sessão. Nunca logo de cara.
// - Fechou (X, "Agora não", Esc, toque fora): vira uma pílula no canto inferior
//   esquerdo que reabre o pop-up. O fechamento fica no sessionStorage.
// - No dia 16 mostra "É hoje!"; do dia 17 em diante some.
// - Combinação com o Assistente: avisa `marketins:conecta-abriu` (ele fecha o painel)
//   e marca `data-conecta-aberto` no <html> (no celular o botão dele sai de cena);
//   se o assistente abrir, o pop-up vira pílula.

const CHAVE_ENTROU = 'marketins:entrou'; // mesma chave que a Entrada grava
const CHAVE_FECHOU = 'mk:conecta-fechado';
const DIA = 86_400_000;
const INICIO = Date.parse(eventoConecta.inicio);
const FIM = INICIO + DIA; // o dia do evento inteiro (horário de início ainda não informado)

const ler = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const gravar = (k: string) => { try { sessionStorage.setItem(k, '1'); } catch { /* sem storage: segue sem lembrar */ } };

const dataCurta = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(INICIO);
const dois = (n: number) => String(n).padStart(2, '0');

function partes(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { dias: Math.floor(s / 86400), horas: Math.floor(s / 3600) % 24, min: Math.floor(s / 60) % 60, seg: s % 60 };
}

function textoPilula(agora: number) {
  if (agora >= INICIO) return 'é hoje!';
  const { dias } = partes(INICIO - agora);
  if (dias === 0) return 'é amanhã';
  return dias === 1 ? 'falta 1 dia' : `faltam ${dias} dias`;
}

type Estado = 'espera' | 'aberto' | 'pilula';

export function Conecta() {
  const [agora, setAgora] = useState(() => Date.now());
  const [estado, setEstado] = useState<Estado>('espera');
  const caixa = useRef<HTMLDivElement>(null);
  const pilula = useRef<HTMLButtonElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const pendente = useRef(false);
  const id = useId();
  const acabou = agora >= FIM;

  // relógio: segundo a segundo com o pop-up aberto; sem pressa na pílula
  useEffect(() => {
    if (acabou || estado === 'espera') return;
    const t = window.setInterval(() => setAgora(Date.now()), estado === 'aberto' ? 1000 : 30_000);
    setAgora(Date.now());
    return () => window.clearInterval(t);
  }, [estado, acabou]);

  const mostrar = useCallback(() => {
    if (ler(CHAVE_FECHOU)) { setEstado((e) => (e === 'espera' ? 'pilula' : e)); return; }
    // assistente aberto: espera ele fechar para não empilhar janelas
    if (document.documentElement.hasAttribute('data-assistente-aberto')) { pendente.current = true; return; }
    setEstado('aberto');
  }, []);

  // quando aparecer
  useEffect(() => {
    if (Date.now() >= FIM) return;
    let t = 0;
    const entrou = () => {
      gravar(CHAVE_ENTROU);
      window.clearTimeout(t);
      t = window.setTimeout(mostrar, 2500);
    };
    if (ler(CHAVE_ENTROU)) t = window.setTimeout(mostrar, 4000);
    window.addEventListener('marketins:entrou', entrou);
    return () => { window.clearTimeout(t); window.removeEventListener('marketins:entrou', entrou); };
  }, [mostrar]);

  // conversa com o Assistente
  useEffect(() => {
    const ouvir = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d === 'aberto') setEstado((s) => (s === 'aberto' ? 'pilula' : s));
      if (d === 'fechado' && pendente.current) { pendente.current = false; window.setTimeout(mostrar, 600); }
    };
    window.addEventListener('marketins:assistente', ouvir);
    return () => window.removeEventListener('marketins:assistente', ouvir);
  }, [mostrar]);

  const fechar = useCallback(() => {
    const foco = !!caixa.current?.contains(document.activeElement);
    gravar(CHAVE_FECHOU);
    setEstado('pilula');
    if (foco) window.setTimeout(() => pilula.current?.focus(), 30);
  }, []);

  const reabrir = () => {
    setEstado('aberto');
    window.setTimeout(() => titulo.current?.focus({ preventScroll: true }), 60);
  };

  // aberto: avisa o assistente, Esc e toque fora fecham
  useEffect(() => {
    const aberto = estado === 'aberto' && !acabou;
    document.documentElement.toggleAttribute('data-conecta-aberto', aberto);
    if (!aberto) return;
    window.dispatchEvent(new Event('marketins:conecta-abriu'));
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    // click (não pointerdown): arrastar a tela para rolar não fecha
    const fora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (caixa.current?.contains(alvo) || pilula.current?.contains(alvo)) return;
      fechar();
    };
    window.addEventListener('keydown', tecla);
    const t = window.setTimeout(() => document.addEventListener('click', fora), 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', tecla);
      document.removeEventListener('click', fora);
      document.documentElement.removeAttribute('data-conecta-aberto');
    };
  }, [estado, acabou, fechar]);

  if (acabou || estado === 'espera') return null;

  const hoje = agora >= INICIO;
  const p = partes(INICIO - agora);
  const contador: [number, string][] = [[p.dias, 'dias'], [p.horas, 'horas'], [p.min, 'min'], [p.seg, 'seg']];

  return (
    <>
      <div
        ref={caixa}
        className={`cpop${estado === 'aberto' ? ' is-aberto' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        aria-hidden={estado !== 'aberto'}
      >
        <div className="cpop__topo">
          <img className="cpop__logo" src="/conecta-3d.webp" alt="" width="1400" height="482" decoding="async" />
          <button type="button" className="cpop__x" onClick={fechar} aria-label="Fechar o aviso do Marketins Conecta" tabIndex={estado === 'aberto' ? 0 : -1}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <h2 ref={titulo} id={`${id}-t`} className="cpop__titulo" tabIndex={-1}>
          <span className="cpop__sr">{eventoConecta.nome}, </span>{eventoConecta.data}
        </h2>
        <p id={`${id}-d`} className="cpop__chamada">
          {hoje ? 'O maior evento de influenciadores da Baixada é hoje.' : eventoConecta.chamada}
        </p>

        {hoje ? (
          <p className="cpop__hoje" role="status">É hoje!</p>
        ) : (
          <div className="cpop__conta" role="timer" aria-label={`Faltam ${p.dias} dias, ${p.horas} horas e ${p.min} minutos`}>
            {contador.map(([v, r]) => (
              <div key={r} className="cpop__cel" aria-hidden="true">
                <b>{dois(v)}</b><span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* o Botao com href não repassa onClick: depois de abrir o WhatsApp, o pop-up vira pílula */}
        <div className="cpop__acoes" onClick={(e) => { if ((e.target as Element).closest('a')) window.setTimeout(fechar, 400); }}>
          <Botao href={linkContato(`Conecta ${dataCurta} · confirmar presença`)} className="cpop__cta">Confirmar presença</Botao>
          <button type="button" className="cpop__depois" onClick={fechar} tabIndex={estado === 'aberto' ? 0 : -1}>Agora não</button>
        </div>

        <p className="cpop__apoio">Apoio: {eventoConecta.apoio.join(' · ')}</p>
      </div>

      <button
        ref={pilula}
        type="button"
        className={`cpop-pilula${estado === 'pilula' ? ' is-visivel' : ''}`}
        onClick={reabrir}
        aria-haspopup="dialog"
        aria-hidden={estado !== 'pilula'}
        tabIndex={estado === 'pilula' ? 0 : -1}
      >
        <i aria-hidden="true" />
        <span>Conecta {dataCurta} · {textoPilula(agora)}</span>
      </button>
    </>
  );
}
