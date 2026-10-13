import { useEffect, useRef, useState } from 'react';

/*
  Logo do Marketins Conecta em 3D (WebGL), extrudado do vetor public/conecta/conecta-logo.svg.
  Mesma técnica do src/ds/Logo3D.tsx: three por import() dinâmico, SVGLoader + ExtrudeGeometry com bisel.
  - Faces nas cores do vetor (branco; degradês viram cor por vértice); laterais do branco em laranja,
    como a arte 3D do Figma.
  - Movimento: balanço lento no eixo Y e, a cada 10 s, uma volta completa.
  - Sem WebGL ou com "reduzir movimento": o SVG parado (nítido em qualquer tela).
  - `ativo` pausa o desenho quando o card está fechado. O three só é baixado na primeira vez que
    o card abre grande (o contexto WebGL é criado uma vez só).
  - Celular ou tela de toque: o SVG parado. O 3D custa segundos de CPU num celular médio.
*/

const SRC = '/conecta/conecta-logo.svg';
const LARANJA = 0xfe5223;
const MAGENTA = 0xd0004d;

type Parada = { o: number; c: string };
type Grad = { x1: number; y1: number; x2: number; y2: number; paradas: Parada[] };

function temWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

/** translate(a b) scale(s) do <g> pai: leva o ponto final de volta ao espaço do degradê */
function transformacao(el: Element | null) {
  const t = el?.getAttribute('transform') ?? '';
  const tr = /translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/.exec(t);
  const sc = /scale\(\s*([-\d.]+)\s*\)/.exec(t);
  return { tx: tr ? +tr[1] : 0, ty: tr ? +tr[2] : 0, s: sc ? +sc[1] : 1 };
}

function lerGrad(doc: Document, id: string): Grad | null {
  const g = doc.getElementById(id);
  if (!g) return null;
  const n = (a: string) => parseFloat(g.getAttribute(a) ?? '0');
  const paradas = Array.from(g.querySelectorAll('stop')).map((s) => ({ o: parseFloat(s.getAttribute('offset') ?? '0'), c: s.getAttribute('stop-color') ?? '#fff' }));
  return { x1: n('x1'), y1: n('y1'), x2: n('x2'), y2: n('y2'), paradas };
}

export function ConectaLogo3D({ ativo, className }: { ativo: boolean; className?: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const ligado = useRef(ativo);
  ligado.current = ativo;
  const [pode3D] = useState(() => !matchMedia('(max-width: 999px), (pointer: coarse)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches && temWebGL());
  const [jaAbriu, setJaAbriu] = useState(ativo);
  if (ativo && !jaAbriu) setJaAbriu(true);
  const usar3D = pode3D && jaAbriu;

  useEffect(() => {
    if (!usar3D) return;
    const el = caixa.current!;
    let parar = () => {};
    let vivo = true;

    (async () => {
      const [THREE, { SVGLoader }, texto] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/SVGLoader.js'),
        fetch(SRC).then((r) => r.text()),
      ]);
      if (!vivo) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const cena = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      cena.add(new THREE.AmbientLight(0xffffff, 1.25));
      const luz = new THREE.DirectionalLight(0xffffff, 2.1); luz.position.set(2, 3, 6); cena.add(luz);
      const lado = new THREE.DirectionalLight(LARANJA, 1.4); lado.position.set(-5, -1, 2); cena.add(lado);
      const contra = new THREE.DirectionalLight(MAGENTA, 1.2); contra.position.set(4, -3, -4); cena.add(contra);

      const descartar: { dispose(): void }[] = [];
      const mat = <T extends { dispose(): void }>(m: T) => { descartar.push(m); return m; };
      const faceBranca = mat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.05 }));
      const ladoBranco = mat(new THREE.MeshStandardMaterial({ color: LARANJA, roughness: 0.4, metalness: 0.1 }));
      const faceGrad = mat(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.12 }));
      const ladoGrad = mat(new THREE.MeshStandardMaterial({ vertexColors: true, color: 0x8a8a8a, roughness: 0.45, metalness: 0.12 }));

      const dados = new SVGLoader().parse(texto);
      const formas = new THREE.Group();
      const c = new THREE.Color(), ca = new THREE.Color(), cb = new THREE.Color();

      dados.paths.forEach((path) => {
        const ud = path.userData as { style?: { fill?: string }; node?: Element } | undefined;
        const fill = ud?.style?.fill ?? '';
        if (!fill || fill === 'none') return;
        const no = ud?.node ?? null;
        const doSimbolo = !!no?.closest('#simbolo');
        const ehTraco = no?.id === 'marketins';
        const geo = new THREE.ExtrudeGeometry(path.toShapes(), {
          depth: doSimbolo ? 64 : 56,
          bevelEnabled: true,
          bevelThickness: 9,
          bevelSize: doSimbolo ? 2.5 : 4,
          bevelSegments: 3,
          curveSegments: ehTraco ? 4 : 10,
        });
        const id = /url\(#([^)]+)\)/.exec(fill)?.[1];
        if (!id) {
          const branco = new THREE.Color().setStyle(fill).getHex() === 0xffffff;
          const face = branco ? faceBranca : mat(new THREE.MeshStandardMaterial({ color: new THREE.Color().setStyle(fill), roughness: 0.32, metalness: 0.12 }));
          const ld = branco ? ladoBranco : mat(new THREE.MeshStandardMaterial({ color: new THREE.Color().setStyle(fill).multiplyScalar(0.55), roughness: 0.45 }));
          descartar.push(geo);
          formas.add(new THREE.Mesh(geo, [face, ld]));
          return;
        }
        // degradê do SVG avaliado em cada vértice (no espaço do <g> que o usa)
        const grad = no ? lerGrad(no.ownerDocument, id) : null;
        const { tx, ty, s } = transformacao(no?.parentElement ?? null);
        const pos = geo.attributes.position, cores = new Float32Array(pos.count * 3);
        for (let v = 0; v < pos.count; v++) {
          let t = 0;
          if (grad) {
            const x = (pos.getX(v) - tx) / s, y = (pos.getY(v) - ty) / s;
            const dx = grad.x2 - grad.x1, dy = grad.y2 - grad.y1;
            t = Math.min(1, Math.max(0, ((x - grad.x1) * dx + (y - grad.y1) * dy) / (dx * dx + dy * dy || 1)));
            const p = grad.paradas;
            if (t <= p[0].o) c.setStyle(p[0].c);
            else if (t >= p[p.length - 1].o) c.setStyle(p[p.length - 1].c);
            else {
              let k = 0; while (k < p.length - 2 && t > p[k + 1].o) k++;
              ca.setStyle(p[k].c); cb.setStyle(p[k + 1].c);
              c.copy(ca).lerp(cb, (t - p[k].o) / Math.max(1e-6, p[k + 1].o - p[k].o));
            }
          } else c.set(LARANJA);
          c.toArray(cores, v * 3);
        }
        geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
        descartar.push(geo);
        formas.add(new THREE.Mesh(geo, [faceGrad, ladoGrad]));
      });

      // centraliza, inverte o Y do SVG e leva para 4.8 unidades de largura
      const bb = new THREE.Box3().setFromObject(formas), centro = bb.getCenter(new THREE.Vector3()), tam = bb.getSize(new THREE.Vector3());
      formas.position.sub(centro);
      const escala = 4.8 / tam.x;
      const grupo = new THREE.Group();
      const pai = new THREE.Group(); pai.add(formas); pai.scale.set(escala, -escala, escala);
      grupo.add(pai); cena.add(grupo);
      const larg = 4.8, alt = tam.y * escala;

      const ajustar = () => {
        const w = el.clientWidth || 1, h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const k = 2 * Math.tan((camera.fov * Math.PI) / 360);
        camera.position.set(0, 0, Math.max((larg * 1.2) / camera.aspect / k, (alt * 1.35) / k));
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(ajustar); ro.observe(el); ajustar();

      const ponteiro = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => { ponteiro.x = (e.clientX / innerWidth - 0.5) * 2; ponteiro.y = (e.clientY / innerHeight - 0.5) * 2; };
      addEventListener('pointermove', onMove, { passive: true });

      const inicio = performance.now();
      const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      let raf = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!ligado.current || document.hidden) return;
        const t = (performance.now() - inicio) / 1000;
        // balanço lento + uma volta inteira a cada 10 s (a primeira depois de 7 s, com o logo já lido)
        const ciclo = t % 10;
        const volta = ciclo > 7 && ciclo < 9 ? suave((ciclo - 7) / 2) * Math.PI * 2 : 0;
        grupo.rotation.y = Math.sin(t * 0.55) * 0.42 + volta + ponteiro.x * 0.12;
        grupo.rotation.x += (ponteiro.y * 0.18 - 0.06 - grupo.rotation.x) * 0.05;
        grupo.position.y = Math.sin(t * 1.2) * 0.04;
        renderer.render(cena, camera);
      };
      loop();
      el.classList.add('is-3d');

      parar = () => {
        cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointermove', onMove);
        descartar.forEach((d) => d.dispose()); renderer.dispose(); renderer.domElement.remove();
        el.classList.remove('is-3d');
      };
    })().catch(() => { /* sem 3D: fica o SVG parado */ });

    return () => { vivo = false; parar(); };
  }, [usar3D]);

  return (
    <div ref={caixa} className={`clogo3d${className ? ` ${className}` : ''}`}>
      <img className="clogo3d__plano" src={SRC} alt="" width="3670" height="950" decoding="async" />
    </div>
  );
}
