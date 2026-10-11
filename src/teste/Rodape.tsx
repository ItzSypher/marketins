import type { MouseEvent } from 'react';
import BeamWordmarkFooter, { type FooterColumn, type FooterCredit } from '../components/ui/beam-wordmark-footer';
import { linkContato } from '../content';
import { empresa, unidades } from './dados';
import './rodape.css';

const secoes = [
  { href: '#trabalhos', label: 'Trabalhos' },
  { href: '#estrutura', label: 'Unidades' },
  { href: '#time', label: 'Time' },
  { href: '#checklist', label: 'Checklist' },
];

const colunas: FooterColumn[] = [
  {
    title: 'Unidades',
    links: unidades.map((u) => ({
      label: u.cidade,
      // endereco é opcional: se sumir de `unidades`, fica só o local
      hint: [u.local, (u as { endereco?: string }).endereco].filter((x): x is string => !!x),
      cta: 'Como chegar',
      href: u.rota,
    })),
  },
  { title: 'Na página', compact: true, links: secoes },
];

const creditos: FooterCredit[] = [
  { label: empresa.nome },
  { lead: 'CNPJ ', label: empresa.cnpj },
  { label: empresa.email, href: `mailto:${empresa.email}`, icon: 'mail' },
  { label: empresa.whatsapp, href: linkContato('rodapé · número'), icon: 'whatsapp' },
];

/** Âncoras da página: rolagem suave (Lenis, se estiver exposto; senão nativa). */
function rolar(_rotulo: string, href: string | undefined, e: MouseEvent<HTMLAnchorElement>) {
  if (!href?.startsWith('#')) return;
  const alvo = document.querySelector<HTMLElement>(href);
  if (!alvo) return;
  e.preventDefault();
  // o Lenis só deixa { version } em window.lenis; usa scrollTo se alguém expuser a instância
  const lenis = (window as unknown as { lenis?: { scrollTo?: (el: HTMLElement) => void } }).lenis;
  if (typeof lenis?.scrollTo === 'function') lenis.scrollTo(alvo);
  else alvo.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  history.replaceState(history.state, '', href);
}

export function Rodape() {
  return (
    <BeamWordmarkFooter
      className="mk-rodape"
      brand="Marketins"
      wordmark="MARKETINS"
      company="Marketins"
      year={2026}
      socials={[{ label: 'Instagram', href: empresa.instagram, icon: 'instagram' }]}
      cta={{
        label: 'Fale com a gente',
        href: linkContato('rodapé'),
        tip: `WhatsApp ${empresa.whatsapp}`,
        ariaLabel: 'Fale com a Marketins no WhatsApp',
        mark: <img src="/icone.svg" alt="" width="24" height="24" loading="lazy" decoding="async" />,
        icon: 'whatsapp',
      }}
      credits={creditos}
      columns={colunas}
      onLinkClick={rolar}
      background="#0b0709"
      ink="#f5eef0"
      muted="var(--texto-2)"
      accent="#d0004d"
      accentHot="#fe5223"
      wordTop="#7a0b37"
      wordFoot="#120a0d"
      fontSans="var(--corpo)"
      fontDisplay="var(--display)"
      wordWeight={800}
    />
  );
}
