import { Botao } from '../ds/Botao';
import { empresa } from './dados';
import './feed.css';

// Números do perfil @marketins.mkt conferidos no print de 10/10/2026. Atualizar quando mudar.
const perfil = { posts: '337', seguidores: '4.509', seguindo: '116', data: '10/10/2026' };

const posts: { src: string; alt: string }[] = [
  { src: '/conecta/salve-a-data.webp', alt: 'Post do Marketins Conecta: 16 de outubro, salve essa data' },
  { src: '/conecta/time-conecta.webp', alt: 'Post do Marketins Conecta com o time da agência' },
  { src: '/trabalhos/04.webp', alt: 'Post da Marketins: "Quem é a Marketins?"' },
  { src: '/trabalhos/08.webp', alt: 'Post da Marketins: "Onde estamos?" com as unidades' },
  { src: '/trabalhos/01.webp', alt: 'Arte da Marketins para a Mozi: caixa de salgados' },
  { src: '/trabalhos/06.webp', alt: 'Arte da Marketins para o BNI Baixada RJ' },
];

export function Feed() {
  return (
    <section id="feed" className="t-sec fd" aria-labelledby="fd-titulo">
      <header className="t-cabeca" data-revela>
        <h2 id="fd-titulo" className="t-titulo">A gente vive no feed</h2>
      </header>

      <article className="fd__card" data-revela>
        <div className="fd__topo">
          <a className="fd__avatar" href={empresa.instagram} target="_blank" rel="noopener" aria-label="Abrir o Instagram da Marketins">
            <img src="/icone.svg" alt="" width="56" height="56" />
          </a>
          <div className="fd__id">
            <p className="fd__user">@marketins.mkt</p>
            <dl className="fd__nums" title={`Números de ${perfil.data}`}>
              <div><dt>posts</dt><dd>{perfil.posts}</dd></div>
              <div><dt>seguidores</dt><dd>{perfil.seguidores}</dd></div>
              <div><dt>seguindo</dt><dd>{perfil.seguindo}</dd></div>
            </dl>
          </div>
        </div>

        <div className="fd__bio">
          <p className="fd__nome">MARKETINS | Agência de Marketing</p>
          <p>A Agência de Marketing que te entrega tudo que você precisa para decolar!</p>
          <p>São mais de 100 clientes satisfeitos</p>
          <p className="fd__local">Nova Iguaçu · São João de Meriti</p>
        </div>

        <div className="fd__acoes">
          <Botao href={empresa.reels} hover="Bora assistir">Ver os Reels</Botao>
          <Botao href={empresa.instagram} variante="seta">Seguir</Botao>
        </div>

        <ul className="fd__grade" aria-label="Últimos posts">
          {posts.map((p) => (
            <li key={p.src}>
              <a href={empresa.instagram} target="_blank" rel="noopener">
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" width="320" height="400" />
              </a>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
