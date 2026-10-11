import { StrictMode, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createRoot } from 'react-dom/client';
import { destaques, linkContato } from '../content';
import { Equipe, IphoneReels, Mosaico, Musica } from './blocos';
import '@fontsource-variable/jost';
import '../tokens.css';
import { Logo3D } from './Logo3D';
import { Botao } from './Botao';
import { Stage } from '../sections/Stage';
import './ds.css';
import './stage.css';

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

const PARA_SERGIO = location.pathname.startsWith('/sergio');

/* Versão para o Sérgio: abre com uma carta da Fox e fecha com o próximo passo. */
function CapaSergio() {
  return (
    <section className="carta">
      <img className="carta__icone" src="/icone.svg" alt="" width="72" height="72" />
      <p className="carta__de">Da Fox para o Sérgio</p>
      <h1>Sérgio, uma pitada do que vem aí.</h1>
      <p>A gente está construindo o site novo da Marketins, e não deu para guardar segredo. Separamos um pedaço para você sentir o clima.</p>
      <p>Pega o celular, aumenta o som e vai descendo devagar.</p>
      <p className="carta__dica">Desça ↓</p>
    </section>
  );
}

function FimSergio() {
  return (
    <section className="carta carta--fim">
      <h2>Isso foi só o começo.</h2>
      <p>Ainda tem a abertura, os cases e o Marketins Conecta para chegar. Quando estiver pronto, você vai ser o primeiro a ver.</p>
      <p className="carta__assina">Fox</p>
    </section>
  );
}

/* Entradas ao descer: título sobe de trás de uma linha, texto vem depois, blocos abrem como janela. */
function useEntradas() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.carta > *', { autoAlpha: 0, y: 40, duration: 1.1, stagger: 0.12, ease: 'expo.out', delay: 0.3 });
      gsap.utils.toArray<HTMLElement>('.ds-secao, .carta--fim').forEach((sec) => {
        const titulo = sec.querySelector('h2');
        const texto = sec.querySelectorAll(':scope > header p, :scope > p');
        const blocos = sec.querySelectorAll(':scope > :not(header):not(.iphone-sec):not(p)');
        const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 78%', once: true } });
        if (titulo) tl.from(titulo, { yPercent: 110, clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.out' });
        if (texto.length) tl.from(texto, { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=0.7');
        blocos.forEach((b) => {
          gsap.from(b, {
            clipPath: 'inset(18% 6% 18% 6% round 28px)', scale: 0.94, autoAlpha: 0, duration: 1.3, ease: 'expo.out',
            clearProps: 'clipPath,transform',
            scrollTrigger: { trigger: b, start: 'top 85%', once: true },
          });
        });
      });
    });
    // fontes e imagens mudam a altura da página: recalcula os pontos do scroll (máscara e celular)
    const recalcular = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(recalcular);
    addEventListener('load', recalcular);
    return () => { mm.revert(); removeEventListener('load', recalcular); };
  }, []);
}

function App() {
  useEntradas();
  const vitrine = (
    <>
      <Secao id="tres-d" titulo="3D" porque="Foguete extrudado do SVG oficial e o Conecta em camadas, em WebGL. Mexa o mouse ou o dedo.">
        <div className="ds-3d">
          <figure><Logo3D tipo="icone" /><figcaption><b>Marketins</b> O mesmo que gira no "toque na tela".</figcaption></figure>
          <figure><Logo3D tipo="conecta" /><figcaption><b>Marketins Conecta</b> 16 de outubro. O maior evento da Baixada.</figcaption></figure>
        </div>
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

    </>
  );
  return (
    <main className={`ds${PARA_SERGIO ? ' ds--sergio' : ''}`}>
      {PARA_SERGIO && <><CapaSergio /><div className="ds-stage"><Stage /></div>{vitrine}</>}
      <header className="ds-topo">
        <img src="/logo-completo.svg" alt="Marketins, soluções de marketing" width="220" height="52" />
        <p>{PARA_SERGIO ? 'Design system · feito pela Fox para a Marketins' : 'Design system · prévia 1 para aprovação'}</p>
        <nav aria-label="Seções">
          {['logo', 'tres-d', 'proposito', 'cores', 'tipografia', 'botoes', 'time', 'clientes', 'instagram', 'motivos', 'movimento', 'hero'].map((s) => (
            <a key={s} href={`#${s}`}>{s === 'proposito' ? 'propósito' : s === 'botoes' ? 'botões' : s === 'tres-d' ? '3D' : s}</a>
          ))}
        </nav>
      </header>

      <Secao id="logo" titulo="Logo" porque="Uma versão por situação. O logo nunca aparece duas vezes na mesma tela.">
        <div className="ds-logos">
          <figure className="ds-logo-largo"><div className="ds-logo-box"><img src="/logo-completo.svg" alt="" /></div><figcaption><b>Completo</b> Rodapé, contato, documentos. Largura mínima 140px. <a className="ds-baixar" href="/logo-completo.svg" download>Baixar SVG</a></figcaption></figure>
          <figure><div className="ds-logo-box"><img src="/icone.svg" alt="" className="ds-icone" /></div><figcaption><b>Ícone (foguete branco)</b> Sobre fundo escuro: topo do site, botão de música, favicon, tela "toque na tela". <a className="ds-baixar" href="/icone.svg" download>Baixar SVG</a></figcaption></figure>
          <figure><div className="ds-logo-box ds-logo-box--branco"><img src="/icone-preto.svg" alt="" className="ds-icone" /></div><figcaption><b>Ícone (foguete preto)</b> Sobre fundo claro e dentro dos botões. Do Figma, sem fundo. <a className="ds-baixar" href="/icone-preto.svg" download>Baixar SVG</a></figcaption></figure>
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

      <Secao id="tipografia" titulo="Tipografia" porque="Benzin em tudo que é título e botão. Texto corrido em Jost, leve e legível no celular. Só duas fontes no site.">
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

      <Secao id="botoes" titulo="Botões" porque="Um botão só, em duas variantes. Ao passar o mouse o fundo sobe e o texto troca; no celular o botão já mostra tudo parado. O ícone dentro do botão é sempre o preto, sobre branco.">
        <div className="ds-botoes">
          <div className="ds-bt-painel">
            <p className="ds-bt-rotulo">Fundo escuro</p>
            <div className="ds-bt-par">
              <figure><Botao href={linkContato('design system')}>Agendar reunião</Botao><figcaption><b>Principal</b> CTA da página. Passe o mouse.</figcaption></figure>
              <figure><Botao href={linkContato('design system')} className="is-hover">Agendar reunião</Botao><figcaption><b>Principal · hover</b> Sobe o branco, entra "Vamos decolar".</figcaption></figure>
            </div>
            <div className="ds-bt-par">
              <figure><Botao variante="seta" href={linkContato('design system')}>Quero um case assim</Botao><figcaption><b>Seta</b> Ações das seções: case, mapa, Instagram.</figcaption></figure>
              <figure><Botao variante="seta" href={linkContato('design system')} className="is-hover">Quero um case assim</Botao><figcaption><b>Seta · hover</b> Sobe o gradiente, a seta gira.</figcaption></figure>
            </div>
          </div>
          <div className="ds-bt-painel ds-bt-painel--claro">
            <p className="ds-bt-rotulo">Fundo claro</p>
            <div className="ds-bt-par">
              <figure><Botao href={linkContato('design system')} escuro>Agendar reunião</Botao><figcaption><b>Principal escuro</b> Em cards e seções claras.</figcaption></figure>
              <figure><Botao href={linkContato('design system')} escuro className="is-hover">Agendar reunião</Botao><figcaption><b>Principal escuro · hover</b> Sobe o gradiente da marca.</figcaption></figure>
            </div>
            <div className="ds-bt-par">
              <figure><Botao variante="seta" href={linkContato('design system')} escuro>Como chegar</Botao><figcaption><b>Seta escuro</b> Mesmo papel da seta, em fundo claro.</figcaption></figure>
              <figure><Botao variante="seta" href={linkContato('design system')} escuro className="is-hover">Como chegar</Botao><figcaption><b>Seta escuro · hover</b></figcaption></figure>
            </div>
          </div>
          <div className="ds-bt-painel">
            <p className="ds-bt-rotulo">Tamanhos e estados</p>
            <div className="ds-bt-par">
              <figure><Botao href={linkContato('design system')} compacto>Agendar</Botao><figcaption><b>Compacto</b> 48px. Topo do site e lugares apertados.</figcaption></figure>
              <figure><Botao variante="seta" href={linkContato('design system')} compacto>Seguir</Botao><figcaption><b>Seta compacta</b> 48px.</figcaption></figure>
            </div>
            <div className="ds-bt-par">
              <figure><Botao desabilitado>Agendar reunião</Botao><figcaption><b>Desabilitado</b> Sem clique, 40% de opacidade.</figcaption></figure>
              <figure><Botao variante="seta" desabilitado>Como chegar</Botao><figcaption><b>Seta desabilitada</b></figcaption></figure>
            </div>
          </div>
          <div className="ds-bt-painel">
            <p className="ds-bt-rotulo">Regras</p>
            <ul className="ds-regras">
              <li>Altura 56px (compacto 48px): o dedo acerta no celular.</li>
              <li>Teclado: contorno laranja e o mesmo efeito do mouse.</li>
              <li>Nada de ícone branco em fundo branco: dentro do botão o foguete é o preto.</li>
              <li>Sem efeito de ímã seguindo o mouse.</li>
              <li>Quem pede menos animação no sistema vê só a troca de cor.</li>
            </ul>
          </div>
        </div>
        <table className="ds-tokens">
          <thead><tr><th>Token</th><th>Valor</th><th>Muda</th></tr></thead>
          <tbody>
            <tr><td><code>--botao-altura</code></td><td>56px</td><td>Altura de todos os botões</td></tr>
            <tr><td><code>--botao-altura-compacta</code></td><td>48px</td><td>Altura do compacto</td></tr>
            <tr><td><code>--botao-raio</code></td><td>999px</td><td>Arredondamento (pílula)</td></tr>
            <tr><td><code>--botao-claro</code> / <code>--botao-escuro</code></td><td>#FFFFFF / #161013</td><td>Fundos</td></tr>
            <tr><td><code>--botao-destaque</code></td><td>gradiente com texto</td><td>Fundo que sobe no hover da seta</td></tr>
            <tr><td><code>--botao-contorno</code></td><td>azul, magenta, laranja</td><td>Borda do Figma</td></tr>
            <tr><td><code>--botao-duracao</code> / <code>--botao-curva</code></td><td>0,5s / ease in-out</td><td>Velocidade do hover</td></tr>
          </tbody>
        </table>
        <pre className="ds-uso"><code>{`<Botao href={linkContato('origem')}>Agendar reunião</Botao>
<Botao variante="seta" href={rota} escuro>Como chegar</Botao>
<Botao hover="Bora assistir" compacto>Ver os Reels</Botao>`}</code></pre>
        <p className="ds-nota">Tokens em src/ds/botao.css. Componente em src/ds/Botao.tsx.</p>
      </Secao>

      {!PARA_SERGIO && vitrine}
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
            <tr><td>Botões</td><td>Fundo sobe e o texto troca, só com mouse ou teclado</td><td>0,5s</td></tr>
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
      {PARA_SERGIO && <FimSergio />}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
