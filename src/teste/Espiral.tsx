import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trabalhos } from './dados';
import { Lightbox } from '../ds/Lightbox';

/*
  Imagens em cascata: as artes entram numa fileira reta e, com o scroll, a fileira
  se enrola numa hélice 3D que desce.
  Geometria (adaptada do bloco "Imagens em cascata", ref.: igorfrosa.com/mediakit):
  cada arte vira N fatias verticais. Cada fatia fica num ponto de arco s da fita;
  a curvatura vai de 0 (fileira plana de frente para a câmera) até 1/raio (hélice).
  Com curvatura k/raio a fita é um arco de raio raio/k cuja frente não sai do lugar,
  e a subida por volta é sempre a mesma: as voltas nunca se atravessam no caminho.
  Inclinação do eixo e da hélice também crescem com k: no começo tudo é reto.
  As imagens entram em "cover" via CSS (--r = largura/altura da arte).
  Sem altura útil ou com movimento reduzido, vira uma grade estática.
  Tocar numa carta abre a arte no Lightbox: as fatias de frente recebem o clique
  (o navegador faz o hit-test 3D); fatias de costas ficam sem pointer-events.
*/

const REPETICOES = 3;
const DISTANCIA = 1.9; // percurso em alturas úteis de tela
const SUAVIDADE = 0.13; // suaviza só a espiral; a fixação é imediata

// A carta tem a proporção do post (960×1200, 4:5): a arte aparece inteira.
// Igual a --largura em espiral.css.
const PROPORCAO = 4 / 5;
const VAO = 0.07; // folga entre cartas vizinhas, em alturas de carta
// enrolar: começa reta, termina de curvar em CURVA_FIM do percurso
const CURVA_INICIO = 0.06;
const CURVA_FIM = 0.55;
const INICIO = 0; // deslocamento da fita (em cartas) no começo e no fim do percurso
const FIM = 8;
const PARALLAX = 0.08;
const SOMBRA = 0.55; // escurecimento máximo, nas cartas de costas
// desktop: cilindro largo, ~9 cartas por volta
const CARTAS_VOLTA = 9;
const SUBIDA_VOLTA = 1.24; // altura de cada volta em alturas de carta (vão de 0,24 entre voltas)
const ALT_VH = 0.29;
const ALT_VW = 0.22;
const ALT_MAX = 300;
const ALT_MIN = 64;
const PERSP_DESKTOP = 2.6;
const INCLINA_X = 7;
const FATIAS_DESKTOP = 9;
const TOPO_DESKTOP = 0.62; // centro da fileira, em fração da altura
// mobile: uma carta grande no centro, vizinhas aparecendo nas bordas
const BREAKPOINT = 620;
const FATIAS_MOBILE = 7;
const CARTAS_VOLTA_MOBILE = 7;
const SUBIDA_VOLTA_MOBILE = 1.18;
const ALT_MOBILE_VW = 0.6;
const ALT_MOBILE_VH = 0.3;
const ALT_MOBILE_MAX = 300;
const PERSP_MOBILE = 3.4;
const INCLINA_X_MOBILE = 5;
const TOPO_MOBILE = 0.6;

const suave = (x: number) => x * x * (3 - 2 * x);

export function Espiral() {
  const raiz = useRef<HTMLElement>(null);
  const [aberta, setAberta] = useState<number | null>(null);
  const fecharLightbox = useCallback(() => setAberta(null), []);

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
    const GRAU = 180 / Math.PI;

    const cartas: HTMLLIElement[] = [];
    const fotos: typeof trabalhos = [];
    for (let r = 0; r < REPETICOES; r++) trabalhos.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'esp-carta';
      li.dataset.i = String(i);
      li.style.setProperty('--r', (t.w / t.h).toFixed(4));
      if (t.foco) li.style.setProperty('--foco', t.foco);
      lista.append(li);
      cartas.push(li);
      fotos.push(t);
    });
    // a primeira arte começa no centro da fileira; sobra fita à esquerda para descer
    const centro = trabalhos.length * (REPETICOES - 1);

    let fatias = 0;
    let tiras: HTMLElement[][] = [];
    let cacheTransform: string[][] = [];
    let cacheAng: number[][] = [];
    let cacheCostas: boolean[][] = [];

    function aplicar(ci: number, ti: number, transform: string, ang: number, costas: boolean) {
      const el = tiras[ci][ti];
      if (cacheTransform[ci][ti] !== transform) { el.style.transform = transform; cacheTransform[ci][ti] = transform; }
      const a = Math.round(ang);
      if (cacheAng[ci][ti] !== a) {
        el.style.setProperty('--sombra', ((1 - Math.cos(a / GRAU)) / 2 * SOMBRA).toFixed(3));
        cacheAng[ci][ti] = a;
      }
      if (cacheCostas[ci][ti] !== costas) { el.classList.toggle('esp-costas', costas); cacheCostas[ci][ti] = costas; }
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
      cacheCostas = cartas.map(() => new Array(n).fill(false));
    }

    let raio = 0, perspectiva = 0, passo = 0, alt = 0, subidaVolta = SUBIDA_VOLTA, inclinaX = INCLINA_X;
    let alturaCena = 0, larguraCena = 0, topoEixo = 0, atual = 0;

    function medirGeometria() {
      const mobile = cena.clientWidth < BREAKPOINT;
      root.classList.toggle('esp-mobile', mobile);
      const n = mobile ? FATIAS_MOBILE : FATIAS_DESKTOP;
      if (n !== fatias) montarFatias(n);
      alturaCena = cena.clientHeight;
      larguraCena = cena.clientWidth;
      eixo.style.top = ((mobile ? TOPO_MOBILE : TOPO_DESKTOP) * 100).toFixed(1) + '%';
      topoEixo = eixo.offsetTop;
      alt = mobile
        ? Math.min(Math.max(Math.min(larguraCena * ALT_MOBILE_VW, alturaCena * ALT_MOBILE_VH), ALT_MIN), ALT_MOBILE_MAX)
        : Math.min(Math.max(Math.min(alturaCena * ALT_VH, larguraCena * ALT_VW), ALT_MIN), ALT_MAX);
      subidaVolta = (mobile ? SUBIDA_VOLTA_MOBILE : SUBIDA_VOLTA) * alt;
      inclinaX = mobile ? INCLINA_X_MOBILE : INCLINA_X;
      passo = (PROPORCAO + VAO) * alt;
      // o raio sai do espaçamento: cada carta ocupa exatamente o seu arco + VAO
      raio = (mobile ? CARTAS_VOLTA_MOBILE : CARTAS_VOLTA) * passo / (2 * Math.PI);
      cena.style.setProperty('--card-altura', alt.toFixed(0) + 'px');
      perspectiva = raio * (mobile ? PERSP_MOBILE : PERSP_DESKTOP);
      cena.style.setProperty('--perspectiva', perspectiva.toFixed(0) + 'px');
    }

    function esconder(carta: HTMLElement) {
      if (carta.style.visibility !== 'hidden') carta.style.visibility = 'hidden';
    }

    function desenhar() {
      const p = atual;
      // k: 0 = fileira reta, 1 = hélice
      const k = suave(limitar((p - CURVA_INICIO) / (CURVA_FIM - CURVA_INICIO)));
      const desloc = -p * PARALLAX * alturaCena;
      cena.style.transform = `translateY(${desloc.toFixed(1)}px)`;
      const ax = inclinaX * k;
      eixo.style.transform = `rotateX(${ax.toFixed(2)}deg)`;
      const senX = Math.sin(ax / GRAU), cosX = Math.cos(ax / GRAU);
      const curv = k / raio; // curvatura da fita
      const R = curv > 1e-6 ? 1 / curv : 0;
      const sobe = k * subidaVolta / (2 * Math.PI * raio); // subida por px de arco
      const skew = (Math.atan(sobe) * GRAU).toFixed(2);
      const largCarta = alt * PROPORCAO;
      const largFatia = largCarta / fatias;
      const fita = INICIO + p * (FIM - INICIO);
      const meio = alturaCena / 2;
      const P = perspectiva;

      const ponto = (s: number) => {
        if (!R) return { x: s, z: raio, a: 0 };
        const a = s * curv;
        return { x: R * Math.sin(a), z: raio - R * (1 - Math.cos(a)), a };
      };

      cartas.forEach((carta, ci) => {
        const u = (ci - centro + fita) * passo;
        const c = ponto(u);
        const y = u * sobe;
        const yT = y * cosX - c.z * senX;
        const zT = y * senX + c.z * cosX;
        // descarta cartas que encostariam na câmera
        if (zT > P * 0.8) return esconder(carta);
        const esc = P / (P - zT);
        const margem = alt * 0.8 * esc;
        const xJ = c.x * esc;
        const yJ = desloc + meio + (topoEixo + yT - meio) * esc;
        if (Math.abs(xJ) - margem > larguraCena / 2 || yJ + margem < -alturaCena * 0.1 || yJ - margem > alturaCena * 1.1) return esconder(carta);
        if (carta.style.visibility === 'hidden') carta.style.visibility = '';
        for (let i = 0; i < fatias; i++) {
          const s = u + (i - (fatias - 1) / 2) * largFatia;
          const f = ponto(s);
          // de frente para a câmera? (normal da fatia contra o vetor até a câmera)
          const costas = Math.sin(f.a) * -f.x + Math.cos(f.a) * (P - f.z) <= 0;
          aplicar(ci, i,
            `translate3d(${f.x.toFixed(1)}px,${(s * sobe).toFixed(1)}px,${f.z.toFixed(1)}px) rotateY(${(f.a * GRAU).toFixed(2)}deg) skewY(${skew}deg)`,
            f.a * GRAU, costas);
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
      const alvo = progresso();
      const dt = ultimo ? Math.min(0.1, (agora - ultimo) / 1000) : 1 / 60;
      ultimo = agora;
      atual += (alvo - atual) * (1 - Math.exp(-dt / SUAVIDADE));
      if (Math.abs(alvo - atual) < 0.00005) atual = alvo;
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
      if (ativa) { medirGeometria(); atual = progresso(); desenhar(); }
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
    // toque/clique numa carta: o hit-test 3D do navegador acha a fatia da frente
    const clicar = (e: MouseEvent) => {
      const carta = (e.target as HTMLElement).closest<HTMLElement>('.esp-carta');
      if (carta?.dataset.i) setAberta(Number(carta.dataset.i));
    };

    lista.addEventListener('click', clicar);
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
      lista.removeEventListener('click', clicar);
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
            <h2>O que sai da nossa mesa.</h2>
          </div>
          <ul className="esp-grade">
            {trabalhos.map((t, i) => (
              <li key={t.src}>
                <button type="button" onClick={() => setAberta(i)} aria-label={`Ampliar: ${t.alt}`}>
                  <img src={t.src} alt="" width={t.w} height={t.h} loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Lightbox itens={trabalhos} indice={aberta} onFechar={fecharLightbox} onMudar={setAberta} rotulo="Trabalhos da Marketins" />
    </section>
  );
}
