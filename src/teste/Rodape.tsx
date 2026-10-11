import { linkContato } from '../content';
import { empresa, unidades } from './dados';
import './rodape.css';

const secoes = [
  { href: '#trabalhos', rotulo: 'Trabalhos' },
  { href: '#estrutura', rotulo: 'Estrutura' },
  { href: '#time', rotulo: 'Time' },
  { href: '#checklist', rotulo: 'Checklist' },
];

export function Rodape() {
  return (
    <footer className="rd">
      <div className="rd__in">
        <div className="rd__marca">
          <img className="rd__logo" src="/logo-completo.svg" alt="Marketins" width="1354" height="321" loading="lazy" />
          <p className="rd__legal">
            {empresa.nome}<br />
            {empresa.marca} · CNPJ {empresa.cnpj}<br />
            {empresa.cidade}
          </p>
        </div>

        <div className="rd__col">
          <h2 className="rd__tit">Fale com a gente</h2>
          <ul>
            <li><a href={linkContato('rodapé')} target="_blank" rel="noopener">WhatsApp {empresa.whatsapp}</a></li>
            <li><a href={`mailto:${empresa.email}`}>{empresa.email}</a></li>
            <li>
              {/* pedido do cliente: ícone da Marketins ao lado do Instagram, levando ao WhatsApp */}
              <span className="rd__ig">
                <a href={empresa.instagram} target="_blank" rel="noopener">Instagram @marketins.mkt</a>
                <a className="rd__icone" href={linkContato('rodapé · ícone')} target="_blank" rel="noopener" aria-label="Chamar a Marketins no WhatsApp">
                  <img src="/icone.svg" alt="" width="28" height="28" />
                </a>
              </span>
            </li>
          </ul>
        </div>

        <div className="rd__col rd__unid">
          <h2 className="rd__tit">Unidades</h2>
          <ul>
            {unidades.map((u) => (
              <li key={u.cidade}>
                <a href={u.rota} target="_blank" rel="noopener">
                  <b>{u.cidade}</b>
                  <span>{u.local} · Como chegar ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="rd__col rd__nav" aria-label="Seções da página">
          <h2 className="rd__tit">Na página</h2>
          <ul>
            {secoes.map((s) => <li key={s.href}><a href={s.href}>{s.rotulo}</a></li>)}
          </ul>
        </nav>
      </div>
      <p className="rd__copy">© 2026 Marketins</p>
    </footer>
  );
}
