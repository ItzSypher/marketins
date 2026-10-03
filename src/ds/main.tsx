import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { destaques, linkContato } from '../content';
import { Equipe, IphoneReels, Mosaico, Musica } from './blocos';
import '../tokens.css';
import './ds.css';

const cores = [
  { nome: 'Magenta', var: '--magenta', hex: '#D0004D', uso: 'Marca. Fundo com texto branco (5,5:1).' },
  { nome: 'Laranja', var: '--laranja', hex: '#FE5223', uso: 'Marca. Números e destaques sobre o preto (6,2:1). Branco por cima só em texto grande.' },
  { nome: 'Laranja texto', var: '--laranja-texto', hex: '#CF3F17', uso: 'Fim do gradiente quando há texto branco pequeno (4,8:1).' },
  { nome: 'Chão', var: '--chao', hex: '#0B0709', uso: 'Fundo da página. Quase preto puxado para o magenta.' },
  { nome: 'Chão 2', var: '--chao-2', hex: '#161013', uso: 'Cards e blocos.' },
  { nome: 'Linha', var: '--linha', hex: '#2B2025', uso: 'Divisórias e bordas.' },
  { nome: 'Texto', var: '--texto', hex: '#F6EFF1', uso: 'Texto principal (17:1).' },
  { nome: 'Texto 2', var: '--texto-2', hex: '#B9AAB0', uso: 'Texto de apoio (9:1).' },
];

const tom = [
  { certo: 'Nada de GTA 6. Aqui é Marketins.', errado: 'Elevamos sua marca a outro patamar.' },
  { certo: 'Nascida na Baixada. Com padrão de agência grande.', errado: 'Soluções inovadoras e disruptivas em marketing.' },
  { certo: 'A gente vai até a sua empresa e grava lá.', errado: 'Oferecemos uma experiência audiovisual completa e personalizada.' },
];

function Secao({ id, titulo, porque, children }: { id: string; titulo: string; porque: string; children: React.ReactNode }) {
  return (
    <section id={id} className="ds-secao">
      <header>
        <h2>{titulo}</h2>
        <p className="ds-porque">{porque}</p>
      </header>
      {children}
    </section>
  );
}

function App() {
  const marcelo = destaques[0];
  return (
    <main className="ds">
      <header className="ds-topo">
        <img src="/logo-completo.svg" alt="Marketins, soluções de marketing" width="220" height="52" />
        <p>Design system · prévia 1 para aprovação</p>
        <nav aria-label="Seções">
          {['logo', 'proposito', 'cores', 'tipografia', 'botoes', 'cards', 'time', 'clientes', 'instagram', 'motivos', 'movimento', 'hero'].map((s) => (
            <a key={s} href={`#${s}`}>{s === 'proposito' ? 'propósito' : s === 'botoes' ? 'botões' : s}</a>
          ))}
        </nav>
      </header>

      <Secao id="logo" titulo="Logo" porque="Uma versão por situação. O logo nunca aparece duas vezes na mesma tela.">
        <div className="ds-logos">
          <figure><div className="ds-logo-box"><img src="/logo-completo.svg" alt="" /></div><figcaption><b>Completo</b> Rodapé, contato, documentos. Largura mínima 140px.</figcaption></figure>
          <figure><div className="ds-logo-box"><img src="/icone.svg" alt="" className="ds-icone" /></div><figcaption><b>Ícone (foguete)</b> Topo do site, botão de música, favicon, tela "toque na tela".</figcaption></figure>
          <figure><div className="ds-logo-box"><span className="ds-wordmark" role="img" aria-label="marketins" /></div><figcaption><b>Wordmark "marketins"</b> Só na abertura, como máscara da foto do hero.</figcaption></figure>
          <figure><div className="ds-logo-box ds-logo-box--claro"><img src="/conecta-logo.webp" alt="" /></div><figcaption><b>Marketins Conecta</b> Só no bloco e no pop-up do evento.</figcaption></figure>
        </div>
        <ul className="ds-regras">
          <li>Respiro mínimo em volta do logo: a altura do "M".</li>
          <li>Não esticar, não trocar as cores, não pôr sombra, não usar sobre foto sem escurecer.</li>
          <li>Ícone do topo fica escondido durante a abertura, para não duplicar.</li>
        </ul>
      </Secao>

      <Secao id="proposito" titulo="Nome e propósito" porque="Antes do visual: quem fala e com quem.">
        <div className="ds-proposito">
          <div>
            <h3>Marketins · Soluções de marketing</h3>
            <p>Agência completa da Baixada (São João de Meriti e Nova Iguaçu): social media, design, audiovisual e tráfego pago com time próprio. Fala com dono de negócio que quer vender mais e quer agência de verdade, com padrão de agência grande.</p>
            <p><b>O site existe para uma coisa:</b> levar para a consultoria no WhatsApp.</p>
          </div>
          <table className="ds-tom">
            <thead><tr><th>Assim</th><th>Assim não</th></tr></thead>
            <tbody>{tom.map((t) => <tr key={t.certo}><td>{t.certo}</td><td>{t.errado}</td></tr>)}</tbody>
          </table>
        </div>
      </Secao>

      <Secao id="cores" titulo="Cores" porque="Tiradas dos SVGs oficiais. O contraste de cada uma foi medido.">
        <ul className="ds-cores">
          {cores.map((c) => (
            <li key={c.var}>
              <span className="ds-amostra" style={{ background: `var(${c.var})` }} />
              <b>{c.nome}</b>
              <code>{c.hex}</code>
              <span>{c.uso}</span>
            </li>
          ))}
        </ul>
        <div className="ds-gradientes">
          <div style={{ background: 'var(--gradiente)' }}><b>Gradiente da marca</b><span>Decorativo: logo, órbitas, faixas sem texto pequeno.</span></div>
          <div style={{ background: 'var(--gradiente-texto)' }}><b>Gradiente com texto</b><span>Quando há texto branco pequeno por cima.</span></div>
          <div className="ds-grad-figma"><b>Gradiente dos botões (Figma)</b><span>Azul, magenta e laranja só na borda e no texto dos botões, como está no Figma.</span></div>
        </div>
      </Secao>

      <Secao id="tipografia" titulo="Tipografia" porque="Benzin em tudo que é título e botão. Texto corrido na fonte do sistema, para ler rápido no celular.">
        <div className="ds-pesos">
          {[400, 500, 600, 700, 800].map((w) => <p key={w} style={{ fontWeight: w }}>Benzin {w} · Marketins</p>)}
        </div>
        <div className="ds-escala">
          <p className="t-hero">Nada de GTA 6.</p>
          <p className="t-h2">Quem confia na Marketins</p>
          <p className="t-h3">Social media</p>
          <p className="t-corpo">Planejamos o mês, criamos os posts, escrevemos as legendas e cuidamos do perfil. Corpo de texto: 16px no celular, máximo de 60 caracteres por linha.</p>
          <p className="t-legenda">Legenda e rótulos · Benzin 600 · 12px · espaçado</p>
        </div>
      </Secao>

      <Secao id="botoes" titulo="Botões" porque="Os quatro modelos do Figma, com o estado inicial e o de passar o mouse. Passe o mouse ou toque para ver.">
        <div className="ds-botoes">
          <figure><a className="b-transicao" href={linkContato('design system')}><span className="b-transicao__a">Agendar reunião</span><span className="b-transicao__b">Vamos decolar <img src="/icone.svg" alt="" /></span></a><figcaption><b>Transição</b> CTA principal do hero.</figcaption></figure>
          <figure><a className="b-seta" href={linkContato('design system')}><span>Agendar reunião</span><i aria-hidden="true">↗</i></a><figcaption><b>Branco com seta</b> CTA das seções.</figcaption></figure>
          <figure><a className="b-seta b-seta--escuro" href={linkContato('design system')}><span>Agendar reunião</span><i aria-hidden="true">↗</i></a><figcaption><b>Branco com seta escura</b> Sobre fundos claros e cards.</figcaption></figure>
          <figure><a className="b-agendar" href={linkContato('design system')}><span>Agendar</span><i aria-hidden="true">→</i></a><figcaption><b>Agendar compacto</b> Topo do site e celular.</figcaption></figure>
          <figure><a className="b-whats" href={linkContato('design system')}>Falar no WhatsApp</a><figcaption><b>WhatsApp</b> Fecho da página, como no site antigo.</figcaption></figure>
        </div>
        <p className="ds-nota">Todos têm foco visível no teclado e área de toque de 48px no celular.</p>
      </Secao>

      <Secao id="time" titulo="Time" porque="Funciona como stories: abre no Sérgio e passa sozinho para o próximo, com a barra no topo. Clique em alguém para abrir na hora.">
        <Equipe />
      </Secao>

      <Secao id="clientes" titulo="Clientes" porque="Duas faixas de trabalhos andando em sentidos opostos. Cada peça aparece inteira, sem corte, em qualquer tela.">
        <Mosaico />
      </Secao>

      <Secao id="instagram" titulo="Instagram" porque="Toque em um post para abrir o feed dentro do celular. Rolando, abre o Reels com som e miniplayer; a música do site pausa.">
        <IphoneReels />
      </Secao>

      <Secao id="motivos" titulo="Motivos gráficos" porque="Elementos que repetem e fazem o site parecer Marketins sem precisar do logo.">
        <div className="ds-motivos">
          <div className="m-orbita"><span /><b>Órbita do foguete</b><small>Arcos magenta e laranja, tirados do ícone. Fundo de seções e da revelação circular.</small></div>
          <div className="m-x"><span /><b>Corte em X</b><small>Usado no "Nada de GTA 6": duas faixas que cortam a tela.</small></div>
          <div className="m-wordmark"><span>marketins</span><b>Wordmark vazado</b><small>"marketins" gigante e transparente entre seções, como no site antigo.</small></div>
          <div className="m-ritmo"><span /><b>Ritmo</b><small>Espaço base de 8px. Seções com 72px no celular e 112px no desktop.</small></div>
        </div>
      </Secao>

      <Secao id="movimento" titulo="Movimento" porque="Tudo que mexe tem motivo. Quem pede menos animação no sistema recebe a página parada.">
        <table className="ds-mov">
          <thead><tr><th>O quê</th><th>Como</th><th>Duração</th></tr></thead>
          <tbody>
            <tr><td>Abertura (GTA, X, ícone 3D, máscara)</td><td>Presa na tela, segue a rolagem</td><td>~2.500px de rolagem</td></tr>
            <tr><td>Entrada das seções</td><td>Sobe 32px e aparece</td><td>0,8s</td></tr>
            <tr><td>Botões</td><td>Transição do Figma ao passar o mouse</td><td>0,35s</td></tr>
            <tr><td>Celular com Instagram</td><td>Preso, rola o feed e abre o Reels</td><td>Segue a rolagem</td></tr>
            <tr><td>Música</td><td>Só toca depois do toque na tela; para pelo ícone</td><td>-</td></tr>
          </tbody>
        </table>
      </Secao>

      <Secao id="hero" titulo="Hero aprovada" porque="O efeito que você aprovou, rodando de verdade. Role dentro da moldura.">
        <div className="ds-hero">
          <iframe src="/" title="Hero aprovada da Marketins" loading="lazy" />
        </div>
        <p className="ds-nota">A abertura GTA, o X e o ícone 3D entram na prévia 2, antes desta parte.</p>
      </Secao>

      <Musica />
      <footer className="ds-rodape">Prévia para aprovação. Nada aqui está no site oficial.</footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
