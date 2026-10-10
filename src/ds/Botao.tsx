import type { ReactNode } from 'react';
import '../sections/abertura-home.css';
import '../sections/home-blocos.css';

/*
  Botão único do design system. API fixa (outros componentes já usam):
  - variante 'principal': o texto troca no hover pelo rótulo de hover + ícone (antigo .b-transicao)
  - variante 'seta': pílula clara com seta (antigo .b-seta); escuro = versão para fundo claro/escuro
  - href abre em nova aba por padrão (WhatsApp, mapas, Instagram); sem href vira <button>
  Provisório: o visual novo (ícone preto do Figma, sem ímã) entra na refação do design system.
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
};

export function Botao({ children, href, onClick, variante = 'principal', hover = 'Vamos decolar', escuro, novaAba = true, className = '' }: BotaoProps) {
  const alvo = href && novaAba ? { target: '_blank', rel: 'noopener' } : {};
  const conteudo = variante === 'principal'
    ? <><span className="b-transicao__a">{children}</span><span className="b-transicao__b">{hover} <img src="/icone.svg" alt="" /></span></>
    : <><span>{children}</span><i aria-hidden="true">↗</i></>;
  const cls = `${variante === 'principal' ? 'b-transicao' : `b-seta${escuro ? ' b-seta--escuro' : ''}`} ${className}`.trim();
  return href
    ? <a className={cls} href={href} {...alvo}>{conteudo}</a>
    : <button type="button" className={cls} onClick={onClick}>{conteudo}</button>;
}
