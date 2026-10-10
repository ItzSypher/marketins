import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trabalhos } from './dados';

/*
  Imagens em cascata: as artes giram numa espiral 3D presa ao scroll.
  Adaptado do bloco "Imagens em cascata" (geometria de referência: igorfrosa.com/mediakit).
  Cada arte vira N fatias verticais, cada uma girada no próprio ângulo da hélice,
  o que curva a imagem em volta do cilindro. As imagens entram em "cover" via CSS
  (--r = largura/altura da arte), então qualquer proporção serve.
  Sem altura útil ou com movimento reduzido, vira uma grade estática.
*/

const REPETICOES = 3;
const DISTANCIA = 1.35; // percurso em alturas úteis de tela
const SUAVIDADE = 0.13; // suaviza só a espiral; a fixação é imediata

// A carta tem a proporção do post (960×1200, 4:5): a arte aparece inteira.
// Igual a --largura em espiral.css.
const PROPORCAO = 4 / 5;
const VAO = 0.09; // folga entre cartas vizinhas, em alturas de carta
// desktop: cilindro largo, ~9 cartas por volta
const VOLTAS = 3.3;
const PASSO_BASE = 5.6; // altura da hélice em alturas de carta (1,7 por volta: voltas não se tocam)
const ALT_VH = 0.3;
const ALT_VW = 0.26;
const ALT_MAX = 300;
const ALT_MIN = 64;
const PERSP_DESKTOP = 2.5;
const INCLINA_X = 13;
const INCLINA_Z = -3.4;
const PARALLAX = 0.13;
const INICIO = -7;
const FIM = 7;
const FATIAS_DESKTOP = 9;
const SOMBRA = 0.6; // escurecimento máximo, nas cartas de costas
const SOMBRA_MOBILE = 0.78;
// mobile: coluna da largura da tela, 5 cartas por volta, uma carta grande de frente por vez
const FATIAS_MOBILE = 7;
const BREAKPOINT = 620;
const VOLTAS_MOBILE = 6;
const PASSO_MOBILE = 9.9;
const ALT_MOBILE_VW = 0.6;
const ALT_MOBILE_VH = 0.3;
const ALT_MOBILE_MAX = 300;
const PERSP_MOBILE = 3.4;
const INCLINA_X_MOBILE = 11;
const INCLINA_Z_MOBILE = -2;

export function Espiral() {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = raiz.current!;
    const cena = root.querySelector<HTMLElement>('.esp-cena')!;
    const eixo = root.querySelector<HTMLElement>('.esp-eixo')!;
    const trilho = root.querySelector<HTMLElement>('.esp-palco')!;
    const copy = root.querySelector<HTMLElement>('.esp-copy')!;
    const lista = root.querySelector<HTMLElement>('.esp-cartas')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const touch = matchMedia('(pointer: coarse)');
    const limitar = (n: number) => Math.max(0, Math.min(1, n));

    const cartas: HTMLLIElement[] = [];
    const fotos: typeof trabalhos = [];
    for (let r = 0; r < REPETICOES; r++) trabalhos.forEach((t) => {
      const li = document.createElement('li');
      li.className = 'esp-carta';
      li.style.setProperty('--r', (t.w / t.h).toFixed(4));
      if (t.foco) li.style.setProperty('--foco', t.foco);
      lista.append(li);
      cartas.push(li);
      fotos.push(t);
    });

    let fatias = 0;
    let tiras: HTMLElement[][] = [];
    let cacheTransform: string[][] = [];
    let cacheAng: number[][] = [];

    function aplicar(ci: number, ti: number, transform: string, ang: number) {
      const el = tiras[ci][ti];
      if (cacheTransform[ci][ti] !== transform) { el.style.transform = transform; cacheTransform[ci][ti] = transform; }
      const a = Math.round(ang);
      if (cacheAng[ci][ti] !== a) {
        el.style.setProperty('--sombra', ((1 - Math.cos(a * Math.PI / 180)) / 2 * sombra).toFixed(3));
        cacheAng[ci][ti] = a;
      }
    }

    function montarFatias(n: number) {
      fatias = n;
      cena.style.setProperty('--fatias', String(n));
      tiras = cartas.map((carta, ci) => {
        carta.textContent = '';
        const l: HTMLElement[] = [];
        for (let i = 0; i < n; i++) {
          const t = document.createElement('i');
          t.className = 'esp-tira';
          t.style.backgroundImage = `url("${fotos[ci].src}")`;
          t.style.setProperty('--indice', String(i));
          if (i === 0) t.dataset.ponta = 'esquerda';
          if (i === n - 1) t.dataset.ponta = 'direita';
          carta.appendChild(t);
          l.push(t);
        }
        return l;
      });
      cacheTransform = cartas.map(() => new Array(n).fill(''));
      cacheAng = cartas.map(() => new Array(n).fill(NaN));
    }

    let raio = 0, perspectiva = 0, passo = 0, comprimento = 0, alturaHelice = 0;
    let passoVoltas = PASSO_BASE, voltas = VOLTAS, inclinaX = INCLINA_X, sombra = SOMBRA;
    let alturaCena = 0, topoEixo = 0, atual = INICIO;

    function medirGeometria() {
      const mobile = cena.clientWidth < BREAKPOINT;
      root.classList.toggle('esp-mobile', mobile);
      const n = mobile ? FATIAS_MOBILE : FATIAS_DESKTOP;
      if (n !== fatias) montarFatias(n);
      alturaCena = cena.clientHeight;
      topoEixo = eixo.offsetTop;
      const alt = mobile
        ? Math.min(Math.max(Math.min(cena.clientWidth * ALT_MOBILE_VW, cena.clientHeight * ALT_MOBILE_VH), ALT_MIN), ALT_MOBILE_MAX)
        : Math.min(Math.max(Math.min(cena.clientHeight * ALT_VH, cena.clientWidth * ALT_VW), ALT_MIN), ALT_MAX);
      passoVoltas = mobile ? PASSO_MOBILE : PASSO_BASE;
      voltas = mobile ? VOLTAS_MOBILE : VOLTAS;
      inclinaX = mobile ? INCLINA_X_MOBILE : INCLINA_X;
      const novaSombra = mobile ? SOMBRA_MOBILE : SOMBRA;
      if (novaSombra !== sombra) { sombra = novaSombra; cacheAng = cartas.map(() => new Array(fatias).fill(NaN)); }
      passo = (PROPORCAO + VAO) * alt;
      comprimento = passo * cartas.length;
      // o raio sai do espaçamento: cada carta ocupa exatamente o seu arco + VAO
      raio = comprimento / (2 * Math.PI * voltas);
      alturaHelice = passoVoltas * alt;
      cena.style.setProperty('--card-altura', alt.toFixed(0) + 'px');
      perspectiva = raio * (mobile ? PERSP_MOBILE : PERSP_DESKTOP);
      cena.style.setProperty('--perspectiva', perspectiva.toFixed(0) + 'px');
      eixo.style.transform = `rotateX(${inclinaX}deg) rotateZ(${mobile ? INCLINA_Z_MOBILE : INCLINA_Z}deg)`;
    }

    function esconder(carta: HTMLElement) {
      if (carta.style.visibility !== 'hidden') carta.style.visibility = 'hidden';
    }

    function desenhar() {
      const desloc = (0.5 - (atual - INICIO) / (FIM - INICIO)) * PARALLAX * alturaCena;
      cena.style.transform = `translateY(${desloc.toFixed(1)}px)`;
      const metade = comprimento / 2;
      const altCarta = alturaHelice / passoVoltas;
      const largCarta = altCarta * PROPORCAO;
      const largFatia = largCarta / fatias;
      const subidaPorRad = alturaHelice / (2 * Math.PI * voltas);
      const inclinacao = Math.atan(subidaPorRad / raio) * 180 / Math.PI;
      const senX = Math.sin(inclinaX * Math.PI / 180);
      const cosX = Math.cos(inclinaX * Math.PI / 180);
      const meio = alturaCena / 2;

      cartas.forEach((carta, ci) => {
        const ordem = cartas.length - 1 - ci;
        const t = (ordem * passo + largCarta / 2 + atual * passo) / comprimento;
        if (t < 0 || t > 1) return esconder(carta);
        const angulo = (t - 0.5) * 360 * voltas;
        const r = raio * (1 - (t - 0.5) * 0.1);
        const y = (t - 0.5) * alturaHelice;
        const meiaAbertura = largCarta / 2 / r * 180 / Math.PI;
        const angNorm = ((angulo % 360) + 540) % 360 - 180;
        const angBorda = Math.max(0, Math.abs(angNorm) - meiaAbertura);
        const zMax = r * Math.cos(angBorda * Math.PI / 180);
        const meiaAlt = altCarta / 2 + Math.abs(Math.tan(inclinacao * Math.PI / 180)) * largFatia / 2;
        const zProj = Math.max(zMax + (y - meiaAlt) * senX, zMax + (y + meiaAlt) * senX);
        const escalaBorda = perspectiva / (perspectiva - zProj);
        // descarta cartas que encostariam na câmera ou sairiam muito da tela
        if (zProj > perspectiva * 0.82 || Math.abs(y * escalaBorda) > alturaCena * 1.4) return esconder(carta);
        const zCentro = r * Math.cos(angulo * Math.PI / 180);
        const yTela = y * cosX - zCentro * senX;
        const zTela = y * senX + zCentro * cosX;
        const escalaCentro = perspectiva / (perspectiva - zTela);
        const yJanela = desloc + meio + (topoEixo + yTela - meio) * escalaCentro;
        const margem = (meiaAlt + subidaPorRad * largCarta / 2 / r + r * 0.06) * Math.max(escalaBorda, escalaCentro);
        if (yJanela + margem < -alturaCena * 0.15 || yJanela - margem > alturaCena * 1.15) return esconder(carta);
        if (carta.style.visibility === 'hidden') carta.style.visibility = '';
        for (let i = 0; i < fatias; i++) {
          const rad = (i - (fatias - 1) / 2) * largFatia / r;
          const angFatia = angulo + rad * 180 / Math.PI;
          aplicar(ci, i,
            `translateY(${(y + subidaPorRad * rad).toFixed(1)}px) rotateY(${angFatia.toFixed(2)}deg) translateZ(${r.toFixed(1)}px) skewY(${inclinacao.toFixed(2)}deg)`,
            angFatia);
        }
      });
    }

    let ativa = false, modoJs = false, distancia = 1, alturaUtil = 1, alturaRaiz = '';
    let larguraJanela = innerWidth, alturaJanela = innerHeight, quadro = 0, medicao = 0, ultimo = 0;

    // o topo do palco fica no topo da janela; y = quanto já rolou dentro da seção
    const progresso = () => (ativa ? limitar(-root.getBoundingClientRect().top / distancia) : 1);

    function posicionar() {
      if (!ativa) { trilho.style.transform = ''; return; }
      const y = -root.getBoundingClientRect().top;
      // plano B: se algum ancestral quebrar o sticky, fixa por translate3d
      if (!modoJs && y > 4 && y < distancia - 4 && Math.abs(trilho.getBoundingClientRect().top) > 4) {
        modoJs = true;
        root.classList.add('esp-js');
      }
      trilho.style.transform = modoJs ? `translate3d(0,${Math.max(0, Math.min(distancia, y))}px,0)` : '';
    }

    function animar(agora: number) {
      quadro = 0;
      posicionar();
      if (!ativa) return;
      const alvo = INICIO + progresso() * (FIM - INICIO);
      const dt = ultimo ? Math.min(0.1, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;
      atual += (alvo - atual) * (1 - Math.exp(-dt / SUAVIDADE));
      if (Math.abs(alvo - atual) < 0.0005) atual = alvo;
      desenhar();
      if (atual !== alvo && !document.hidden) quadro = requestAnimationFrame(animar); else ultimo = 0;
    }
    const agendar = () => { if (!quadro) quadro = requestAnimationFrame(animar); };

    function medir() {
      medicao = 0;
      // ignora a barra do navegador do celular abrindo e fechando
      if (!(touch.matches && innerWidth === larguraJanela && Math.abs(innerHeight - alturaJanela) < 120)) {
        larguraJanela = innerWidth;
        alturaJanela = innerHeight;
      }
      modoJs = false;
      root.classList.remove('esp-js');
      trilho.style.transform = '';
      alturaUtil = Math.max(1, alturaJanela);
      distancia = Math.max(1, alturaUtil * DISTANCIA);
      root.style.setProperty('--esp-altura', alturaUtil + 'px');
      ativa = !reduced.matches && alturaUtil >= Math.max(360, copy.offsetHeight + 240) && root.clientWidth >= 200;
      root.classList.toggle('esp-ativa', ativa);
      const novaAltura = ativa ? alturaUtil + distancia + 'px' : '';
      if (novaAltura !== alturaRaiz) {
        alturaRaiz = novaAltura;
        root.style.height = novaAltura;
        ScrollTrigger.refresh();
      }
      posicionar();
      if (ativa) { medirGeometria(); atual = INICIO + progresso() * (FIM - INICIO); desenhar(); }
      else { cancelAnimationFrame(quadro); quadro = 0; }
      agendar();
    }
    const agendarMedicao = () => { if (!medicao) medicao = requestAnimationFrame(medir); };
    const resize = () => {
      if (touch.matches && innerWidth === larguraJanela && Math.abs(innerHeight - alturaJanela) < 120) return;
      agendarMedicao();
    };
    const visibilidade = () => {
      if (document.hidden) { cancelAnimationFrame(quadro); quadro = 0; ultimo = 0; } else agendar();
    };

    document.addEventListener('scroll', agendar, { passive: true, capture: true });
    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', visibilidade);
    reduced.addEventListener('change', agendarMedicao);
    const ro = new ResizeObserver(agendarMedicao);
    ro.observe(copy);
    ro.observe(root.parentElement!);
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) agendar(); });
    io.observe(root);
    document.fonts?.ready.then(agendarMedicao);
    medir();

    return () => {
      cancelAnimationFrame(quadro);
      cancelAnimationFrame(medicao);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('scroll', agendar, { capture: true });
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibilidade);
      reduced.removeEventListener('change', agendarMedicao);
      lista.textContent = '';
      root.classList.remove('esp-ativa', 'esp-js', 'esp-mobile');
      root.style.height = '';
    };
  }, []);

  return (
    <section ref={raiz} id="trabalhos" className="esp" aria-label="Trabalhos selecionados">
      <div className="esp-palco">
        <div className="esp-clip">
          <div className="esp-cena" aria-hidden="true"><div className="esp-eixo"><ul className="esp-cartas" /></div></div>
          <div className="esp-copy">
            <p className="t-num">Feito na Marketins</p>
            <h2>Ideias que ganham vida.</h2>
          </div>
          <ul className="esp-grade">
            {trabalhos.map((t) => (
              <li key={t.src}><img src={t.src} alt={t.alt} width={t.w} height={t.h} loading="lazy" decoding="async" /></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
