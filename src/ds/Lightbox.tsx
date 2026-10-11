import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './lightbox.css';

/*
  Microlightbox do design system: abre uma imagem inteira (sem corte) sobre um véu escuro.
  - fechar: botão X, Esc, toque/clique fora da imagem
  - navegar: botões, setas do teclado e swipe lateral no celular
  - foco preso no diálogo e devolvido a quem abriu; scroll da página travado enquanto aberto
    (overflow no <html> + data-lenis-prevent, para o Lenis ignorar roda e toque aqui dentro)
  Uso: <Lightbox itens={[{ src, alt, w, h }]} indice={i | null} onFechar={...} onMudar={setI} />
*/
export type ItemLightbox = { src: string; alt: string; w?: number; h?: number };
export type LightboxProps = {
  itens: ItemLightbox[];
  indice: number | null;
  onFechar: () => void;
  onMudar: (i: number) => void;
  rotulo?: string;
};

const FOCAVEIS = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function Lightbox({ itens, indice, onFechar, onMudar, rotulo = 'Imagem ampliada' }: LightboxProps) {
  const aberto = indice !== null && indice >= 0 && indice < itens.length;
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const toque = useRef<{ x: number; y: number; id: number } | null>(null);
  const arrastou = useRef(0);
  const [dir, setDir] = useState(0);
  const total = itens.length;

  const ir = useCallback((passo: number) => {
    if (indice === null || total < 2) return;
    setDir(passo);
    onMudar((indice + passo + total) % total);
  }, [indice, total, onMudar]);

  // trava o scroll, guarda e devolve o foco
  useEffect(() => {
    if (!aberto) return;
    const html = document.documentElement;
    const antes = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
    const origem = document.activeElement as HTMLElement | null;
    html.style.overflow = 'hidden';
    html.style.scrollbarGutter = 'stable';
    html.classList.add('lb-aberto');
    fechar.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = antes.overflow;
      html.style.scrollbarGutter = antes.gutter;
      html.classList.remove('lb-aberto');
      if (origem && origem !== document.body && document.contains(origem)) origem.focus({ preventScroll: true });
    };
  }, [aberto]);

  // teclado: Esc, setas, Tab preso
  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onFechar(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); ir(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); }
      else if (e.key === 'Tab') {
        const lista = Array.from(caixa.current?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? []);
        if (!lista.length) return;
        const primeiro = lista[0], ultimo = lista[lista.length - 1];
        const atual = document.activeElement;
        if (e.shiftKey && (atual === primeiro || !caixa.current?.contains(atual))) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && (atual === ultimo || !caixa.current?.contains(atual))) { e.preventDefault(); primeiro.focus(); }
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [aberto, ir, onFechar]);

  // a roda não rola nada por baixo
  useEffect(() => {
    const el = caixa.current;
    if (!aberto || !el) return;
    const roda = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', roda, { passive: false });
    return () => el.removeEventListener('wheel', roda);
  }, [aberto]);

  // pré-carrega as vizinhas
  useEffect(() => {
    if (!aberto || total < 2) return;
    [1, -1].forEach((p) => { const img = new Image(); img.src = itens[(indice! + p + total) % total].src; });
  }, [aberto, indice, itens, total]);

  if (!aberto) return null;
  const item = itens[indice!];
  const proporcao = item.w && item.h ? `${item.w} / ${item.h}` : '4 / 5';

  const inicio = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    toque.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const fim = (e: React.PointerEvent) => {
    const t = toque.current;
    toque.current = null;
    if (!t || t.id !== e.pointerId) return;
    const dx = e.clientX - t.x, dy = e.clientY - t.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      e.preventDefault();
      ir(dx < 0 ? 1 : -1);
      arrastou.current = performance.now(); // o swipe não vira "toque fora"
    }
  };
  const tocarFora = (e: React.MouseEvent) => {
    if (performance.now() - arrastou.current < 500) return;
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('lb-palco')) onFechar();
  };

  return createPortal(
    <div
      ref={caixa}
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={rotulo}
      data-lenis-prevent
      onClick={tocarFora}
      onPointerDown={inicio}
      onPointerUp={fim}
      onPointerCancel={() => { toque.current = null; }}
    >
      <div className="lb-palco">
        <img key={item.src} className="lb-img" src={item.src} alt={item.alt} width={item.w} height={item.h} decoding="async" draggable={false} data-dir={dir} style={{ aspectRatio: proporcao }} />
      </div>
      <p className="lb-conta" aria-live="polite">{indice! + 1} / {total}</p>
      <button ref={fechar} type="button" className="lb-botao lb-fechar" aria-label="Fechar" onClick={onFechar}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {total > 1 && <>
        <button type="button" className="lb-botao lb-ant" aria-label="Anterior" onClick={() => ir(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" className="lb-botao lb-prox" aria-label="Próxima" onClick={() => ir(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </>}
    </div>,
    document.body,
  );
}
