import { useEffect, useRef, useState } from 'react';

type Props = {
  /** 'icone': extrusão do SVG oficial. 'conecta': placa em camadas a partir da arte 3D do Figma. */
  tipo: 'icone' | 'conecta';
  className?: string;
  /** Giro extra (ex.: no toque). Muda o valor para disparar. */
  impulso?: number;
};

const MAGENTA = 0xd0004d;
const LARANJA = 0xfe5223;

function temWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

/** Logo da Marketins ou do Conecta girando em WebGL. Sem WebGL ou com "reduzir movimento", mostra a imagem parada. */
export function Logo3D({ tipo, className, impulso = 0 }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const giro = useRef({ extra: 0 });
  const [usar3D] = useState(() => temWebGL() && !matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => { if (impulso) giro.current.extra += Math.PI * 2; }, [impulso]);

  useEffect(() => {
    if (!usar3D) return;
    const el = caixa.current!;
    let parar = () => {};
    let vivo = true;

    (async () => {
      const THREE = await import('three');
      if (!vivo) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const cena = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 6);
      cena.add(new THREE.AmbientLight(0xffffff, 1.1));
      const luz = new THREE.DirectionalLight(0xffffff, 2.2); luz.position.set(3, 4, 5); cena.add(luz);
      const contra = new THREE.DirectionalLight(LARANJA, 1.6); contra.position.set(-4, -2, -3); cena.add(contra);

      const grupo = new THREE.Group();
      cena.add(grupo);
      const descartar: { dispose(): void }[] = [];

      if (tipo === 'icone') {
        const { SVGLoader } = await import('three/examples/jsm/loaders/SVGLoader.js');
        const dados = new SVGLoader().parse(await (await fetch('/icone.svg')).text());
        const formas = new THREE.Group();
        const cMag = new THREE.Color(MAGENTA), cLar = new THREE.Color(LARANJA);
        dados.paths.forEach((path, i) => {
          const fill = ((path.userData as { style?: { fill?: string } } | undefined)?.style?.fill ?? '');
          if (!fill || fill === 'none') return;
          const gradiente = fill.startsWith('url');
          const shapes = SVGLoader.createShapes(path);
          const geo = new THREE.ExtrudeGeometry(shapes, { depth: 6 + (i % 3), bevelEnabled: true, bevelThickness: 1.2, bevelSize: 0.8, bevelSegments: 3, curveSegments: 18 });
          let mat: InstanceType<typeof THREE.MeshStandardMaterial>;
          if (gradiente) {
            // os gradientes do SVG viram cor por vértice, de laranja para magenta
            geo.computeBoundingBox();
            const bb = geo.boundingBox!, pos = geo.attributes.position, cores = new Float32Array(pos.count * 3), c = new THREE.Color();
            for (let v = 0; v < pos.count; v++) {
              const t = (pos.getY(v) - bb.min.y) / Math.max(1, bb.max.y - bb.min.y);
              c.copy(cLar).lerp(cMag, i % 2 ? 1 - t : t).toArray(cores, v * 3);
            }
            geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
            mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0.15 });
          } else {
            mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setStyle(fill), roughness: 0.3, metalness: 0.1 });
          }
          descartar.push(geo, mat);
          formas.add(new THREE.Mesh(geo, mat));
        });
        // centraliza e inverte o Y do SVG
        const bb = new THREE.Box3().setFromObject(formas), centro = bb.getCenter(new THREE.Vector3()), tam = bb.getSize(new THREE.Vector3());
        formas.position.sub(centro);
        const escala = 2.6 / Math.max(tam.x, tam.y);
        const pai = new THREE.Group(); pai.add(formas); pai.scale.set(escala, -escala, escala);
        grupo.add(pai);
      } else {
        // arte já renderizada em 3D: várias camadas escurecidas atrás dão espessura real ao girar
        const tex = await new THREE.TextureLoader().loadAsync('/conecta-3d.webp');
        tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        const ratio = tex.image.width / tex.image.height;
        const geo = new THREE.PlaneGeometry(4.8, 4.8 / ratio);
        descartar.push(tex, geo);
        const camadas = 14;
        for (let k = 0; k < camadas; k++) {
          const frente = k === camadas - 1;
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: frente ? 0xffffff : new THREE.Color(0x3a0c1c).lerp(new THREE.Color(LARANJA), k / camadas * 0.5) });
          descartar.push(mat);
          const m = new THREE.Mesh(geo, mat); m.position.z = (k - camadas + 1) * 0.012; grupo.add(m);
        }
      }

      const ponteiro = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => { ponteiro.x = (e.clientX / innerWidth - 0.5) * 2; ponteiro.y = (e.clientY / innerHeight - 0.5) * 2; };
      addEventListener('pointermove', onMove, { passive: true });

      const ajustar = () => {
        const w = el.clientWidth, h = el.clientHeight || w;
        renderer.setSize(w, h, false); camera.aspect = w / h;
        // o Conecta é largo: afasta a câmera em telas estreitas
        camera.position.z = tipo === 'conecta' ? Math.max(6, 6 * 1.4 / (w / h)) : 6;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(ajustar); ro.observe(el); ajustar();

      let visivel = true;
      const io = new IntersectionObserver(([en]) => { visivel = en.isIntersecting; }); io.observe(el);

      const relogio = new THREE.Clock();
      let raf = 0, extraAtual = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visivel) return;
        const t = relogio.getElapsedTime();
        extraAtual += (giro.current.extra - extraAtual) * 0.06;
        if (tipo === 'icone') grupo.rotation.y = t * 0.9 + extraAtual;
        else grupo.rotation.y = Math.sin(t * 0.7) * 0.55 + extraAtual;
        grupo.rotation.x += ((ponteiro.y * 0.25) - grupo.rotation.x) * 0.05;
        grupo.position.y = Math.sin(t * 1.4) * 0.06;
        renderer.render(cena, camera);
      };
      loop();
      el.classList.add('is-3d');

      parar = () => {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', onMove);
        descartar.forEach((d) => d.dispose()); renderer.dispose(); renderer.domElement.remove();
      };
    })().catch(() => { /* sem 3D: fica a imagem parada */ });

    return () => { vivo = false; parar(); };
  }, [tipo, usar3D]);

  return (
    <div ref={caixa} className={`logo3d logo3d--${tipo}${className ? ` ${className}` : ''}`}>
      <img className="logo3d__fallback" src={tipo === 'icone' ? '/icone.svg' : '/conecta-3d.webp'} alt="" />
    </div>
  );
}
