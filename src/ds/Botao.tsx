import type { ReactNode } from 'react';
import './botao.css';

/*
  Botão único do design system (visual e tokens em ./botao.css).
  - variante 'principal': pílula escura com a borda do Figma; no hover o rótulo sobe e dá lugar
    ao `hover`, o fundo vira branco e o chip mostra o ícone preto (public/icone-preto.svg).
  - variante 'seta': pílula branca com chip e seta; no hover sobe o gradiente da marca.
  - escuro: versão para fundo claro (o botão em si fica escuro).
  - compacto: 48px de altura em vez de 56px. desabilitado: sem clique, 40% de opacidade.
  - href abre em nova aba por padrão (WhatsApp, mapas, Instagram); sem href vira <button>.
*/
export type BotaoProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variante?: 'principal' | 'seta';
  hover?: string;
  escuro?: boolean;
  novaAba?: boolean;
  className?: string;
  compacto?: boolean;
  desabilitado?: boolean;
};

function Seta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function Botao({
  children, href, onClick, variante = 'principal', hover = 'Vamos decolar', escuro, novaAba = true, className = '', compacto, desabilitado,
}: BotaoProps) {
  const principal = variante === 'principal';
  const base = principal ? 'b-transicao' : 'b-seta';
  const cls = [base, escuro && `${base}--escuro`, compacto && 'botao--compacto', className].filter(Boolean).join(' ');
  const conteudo = principal
    ? <>
        <span className="b-transicao__a">{children}</span>
        <span className="b-transicao__b" aria-hidden="true">{hover}</span>
        <i aria-hidden="true"><img src="/icone-preto.svg" alt="" width="28" height="28" /></i>
      </>
    : <><span>{children}</span><i aria-hidden="true"><Seta /></i></>;

  if (href && !desabilitado) {
    const alvo = novaAba ? { target: '_blank', rel: 'noopener' } : {};
    return <a className={cls} href={href} onClick={onClick} {...alvo}>{conteudo}</a>;
  }
  if (href) return <a className={cls} aria-disabled="true" role="link">{conteudo}</a>;
  return <button type="button" className={cls} onClick={onClick} disabled={desabilitado}>{conteudo}</button>;
}
