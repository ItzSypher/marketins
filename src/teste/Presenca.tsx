import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Botao } from '../ds/Botao';
import { empresa, unidades } from './dados';
import './presenca.css';

/*
  Estrutura física: "Duas unidades na Baixada". Simples e legível para o Google:
  print fixo do mapa (clica e abre a rota), endereço escrito em <address>, foto pequena e "Como chegar".
  Sem iframe. Abas em pílula no topo, à esquerda; embaixo o mapa e os dados da unidade escolhida.
  Os painéis inativos ficam no HTML (hidden), então os dois endereços estão sempre na página.
*/

type U = (typeof unidades)[number];
const N = unidades.length;

/* SEO local: a empresa e as duas unidades com endereço completo (só dados do cliente) */
const telefone = '+55 21 99237-2689';
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: empresa.marca,
  legalName: empresa.nome,
  taxID: empresa.cnpj,
  email: empresa.email,
  telephone: telefone,
  sameAs: [empresa.instagram],
  areaServed: [
    { '@type': 'City', name: 'Nova Iguaçu' },
    { '@type': 'City', name: 'São João de Meriti' },
    { '@type': 'Place', name: 'Baixada Fluminense' },
  ],
  location: unidades.map((u) => ({
    '@type': 'ProfessionalService',
    name: `${empresa.marca} ${u.cidade}`,
    description: `Agência de marketing em ${u.cidade}, RJ (${u.local}).`,
    telephone: telefone,
    email: empresa.email,
    hasMap: u.rota,
    address: {
      '@type': 'PostalAddress',
      streetAddress: u.endereco,
      addressLocality: u.cidade,
      addressRegion: 'RJ',
      postalCode: u.cep,
      addressCountry: 'BR',
    },
  })),
};

export function Presenca() {
  return (
    <section id="estrutura" className="t-sec un" aria-labelledby="un-titulo">
      <div className="un-topo">
        <header className="t-cabeca un-cabeca" data-revela>
          <p className="t-num">Estrutura física</p>
          <h2 className="t-titulo" id="un-titulo">Duas unidades na Baixada</h2>
          <p className="t-texto">
            Nova Iguaçu, no Le Monde Office, e São João de Meriti, na nossa sede. Passa aqui pra tomar um café com o time.
          </p>
        </header>
      </div>
      <Unidades />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
    </section>
  );
}

/* ───────────── Peças comuns ───────────── */

function Mapa({ u, className = '' }: { u: U; className?: string }) {
  return (
    <a className={`un-mapa ${className}`} href={u.rota} target="_blank" rel="noopener" aria-label={`Abrir a rota até a unidade de ${u.cidade} no Google Maps`}>
      <img src={u.mapaImg} alt={u.mapaAlt} width={u.mapaW} height={u.mapaH} loading="lazy" decoding="async" style={{ '--pino': u.pino } as CSSProperties} />
      <span className="un-mapa__chip" aria-hidden="true">Abrir no Maps</span>
    </a>
  );
}

function Foto({ u, className = '' }: { u: U; className?: string }) {
  if (!u.img) return null;
  return (
    <img className={`un-foto ${className}`} src={u.img} alt={u.alt ?? `Unidade Marketins em ${u.cidade}`} width={u.imgW} height={u.imgH} loading="lazy" decoding="async" />
  );
}

function Endereco({ u }: { u: U }) {
  return (
    <address className="un-end">
      <b>{u.local}</b>
      <span>{u.endereco}</span>
      <span>{u.bairro}, {u.cidade}, RJ</span>
      <span>CEP {u.cep}</span>
    </address>
  );
}

const ComoChegar = ({ u }: { u: U }) => <Botao variante="seta" href={u.rota} novaAba>Como chegar</Botao>;

/* abas com ativação automática: setas, Home e End */
function useAbas() {
  const [ativa, setAtiva] = useState(0);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);
  const teclas = (e: KeyboardEvent<HTMLDivElement>) => {
    const alvo: Record<string, number> = {
      ArrowRight: ativa + 1, ArrowDown: ativa + 1, ArrowLeft: ativa - 1, ArrowUp: ativa - 1, Home: 0, End: N - 1,
    };
    if (!(e.key in alvo)) return;
    e.preventDefault();
    const j = (alvo[e.key] + N) % N;
    setAtiva(j);
    abas.current[j]?.focus({ preventScroll: true });
  };
  const aba = (i: number, id: string) => ({
    ref: (b: HTMLButtonElement | null) => { abas.current[i] = b; },
    type: 'button' as const,
    role: 'tab',
    id: `${id}-aba-${i}`,
    'aria-selected': i === ativa,
    'aria-controls': `${id}-painel-${i}`,
    tabIndex: i === ativa ? 0 : -1,
    onClick: () => setAtiva(i),
  });
  const painel = (i: number, id: string) => ({
    role: 'tabpanel',
    id: `${id}-painel-${i}`,
    'aria-labelledby': `${id}-aba-${i}`,
    hidden: i !== ativa,
  });
  return { teclas, aba, painel };
}

/* ───────────── Abas em pílula no topo + mapa e dados embaixo ───────────── */

function Unidades() {
  const { teclas, aba, painel } = useAbas();
  return (
    <div className="un1">
      <div className="un-abas" role="tablist" aria-label="Unidades da Marketins" onKeyDown={teclas}>
        {unidades.map((u, i) => (
          <button key={u.cidade} className="un-aba" {...aba(i, 'un1')}>{u.cidade}</button>
        ))}
      </div>
      {unidades.map((u, i) => (
        <div key={u.cidade} className="un1__painel" {...painel(i, 'un1')}>
          <Mapa u={u} className="un1__mapa" />
          <div className="un1__info">
            <Foto u={u} className="un1__foto" />
            <Endereco u={u} />
            <ComoChegar u={u} />
          </div>
        </div>
      ))}
    </div>
  );
}
