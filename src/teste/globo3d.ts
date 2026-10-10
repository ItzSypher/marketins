/*
  Motor do globo 3D (Three.js), separado de Presenca.tsx para ser usado na hero.
  Uso: const THREE = await import('three'); const c = criarGlobo(THREE, elemento, { reduzido, aoMudar, aoFalhar });
  c.irPara(0|1|2) muda a etapa (Baixada, Rio, Mundo); c.destruir() limpa tudo.
  Estilos dos rótulos e do palco: globo3d.css (classes .pr-rotulo*, .pr-globo__palco).
*/
import type * as T3 from 'three';
import './globo3d.css';

export type Controle = { irPara: (i: number) => void; destruir: () => void };

/* Máscara de terra 144×72 (1 bit por célula), da referência do cliente. */
const LANDMASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCf//8HAAAAAAAAAAAAAAAAyPzz//8A4AAAAAADAAAAAACAlAnw//8AAAAAB4AfAAAAAADAAywA/P8AAABgAP4fAAEAAQIAPvYH+H8AAABguP//7x8A4P//K9wc+B8AgH+g1///////z////z98+AMC4L/8////////AP///684+AAB8P7///////9/wP///wMGcAAAfP7//////38fgAf+/wd+AAAAfP7//////wEBAAH4/x9+AABAKP//////f8ABAADw/3//AQCw+P///////8AAAADg////AwDA/////////wAAAADA//8vBwDA/////////wAAAADA//8/AACA/6/v////fwAAAADA//8PAACA1wf3////PwIAAADA//8HAADwYW/P////DwEAAACA//8DAADwQPnP//9/BAEAAACA//8DAAAAD+D/////yAAAAAAA/v8BAADgD8D/////IAAAAAAA+n8AAADwf9f/////AQAAAAAA/IMAAADw///3////AQAAAAAA8IEAAAD8/7/P////AAAAAAAA4AEAAAD8/79/+P9/AQAAAAAAwBEAAAD+/3//8OcHAAAAAAAAwBsYAAD8/39/4MMLAAAAAAAAAB4AAAD+//8e4IEHAQAAAAAAAHAAAAD+//8HwIAPAwAAAAAAAAAUAAD8//8JwIAGAAAAAAAAAID+AAD4//8PAIAABAAAAAAAAAD+AQDw/f8PAAEBAAAAAAAAAAD+DwAA8P8HAIBhAAAAAAAAAAD/DwAA8P8DAABzAAAAAAAAAAD/PwAA8P8BAABzMQAAAAAAAAD//wEA8P8AAAACwQMAAAAAAAD//wMA4P8AAAAEgAcAAAAAAAD//wMA4P8AAACABQEAAAAAAAD+/wEA4P8AAAAAAAAAAAAAAAD+/wAA4P8IAAAAMAAAAAAAAAD4/wAA4P8MAAAAfgIAAAAAAADw/wAA4D8MAAAA/gcAAAAAAADw/wAA4D8GAADA/w8AAAAAAADwPwAAwD8GAADg/w8AAAAAAADwHwAAwB8AAADg/x8AAAAAAAD4DwAAgB8AAADA/x8AAAAAAAD4DwAAgA8AAADA/x8AAAAAAAD4BwAAgAMAAADAwx8AAAAAAAD4AQAAAAAAAAAAAA8AAAAAAAD4AAAAAAAAAAAAAARAAAAAAAA8AAAAAAAAAAAAAAQgAAAAAAA4AAAAAAAAAAAAAAAQAAAAAAAcAAAAAAAAAAAAAAAIAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAMAQAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAABAAAAAAABgAAAiAAAAAAAAAAAgAAAAACD+j////x8AAAAAAAB8AACg////5/////8PAACAgP/9AAD+//////////8HAMD///8PAMD///////////8BgPz///8BcPz///////////8HAPz///8fAP7///////////8AAPj///////////////////8P////////////////////////////////////////////////';

const D2R = Math.PI / 180;
const BAIXADA = { lat: -22.76, lon: -43.45 };
const RIO = { lat: -22.91, lon: -43.17 };
const DESTINOS = [
  { nome: 'Lisboa', lat: 38.72, lon: -9.14 },
  { nome: 'Madri', lat: 40.42, lon: -3.7 },
  { nome: 'Paris', lat: 48.86, lon: 2.35 },
  { nome: 'Londres', lat: 51.5, lon: -0.12 },
  { nome: 'Roma', lat: 41.9, lon: 12.5 },
  { nome: 'Nova York', lat: 40.71, lon: -74.0 },
  { nome: 'Miami', lat: 25.76, lon: -80.19 },
  { nome: 'Cidade do México', lat: 19.43, lon: -99.13 },
  { nome: 'Bogotá', lat: 4.71, lon: -74.07 },
  { nome: 'Buenos Aires', lat: -34.6, lon: -58.38 },
  { nome: 'Santiago', lat: -33.45, lon: -70.67 },
  { nome: 'Luanda', lat: -8.84, lon: 13.23 },
  { nome: 'Dubai', lat: 25.2, lon: 55.27 },
];
// enquadramento de cada etapa: centro (lat/lon) e distância da câmera
const VISTAS = [
  { lat: -22.8, lon: -43.3, z: 2.75 },
  { lat: -19, lon: -46, z: 3.7 },
  { lat: 17, lon: -24, z: 5.2 },
];
const DURACAO = [3.8, 3.8, 6.5]; // segundos em cada etapa
const Z_MUNDO = 4.4; // a partir daqui os nomes das cidades do mundo aparecem

type Opcoes = { reduzido: boolean; aoMudar: (i: number) => void; aoFalhar: () => void };
type Tipo = 'bxd' | 'rio' | 'dest';
type Rotulo = { el: HTMLDivElement; pos: T3.Vector3; tipo: Tipo; on: boolean; foco: boolean; w: number; h: number };
type Marcador = { anel: T3.Mesh; s: number; ph: number; tipo: Tipo };

export function criarGlobo(THREE: typeof T3, host: HTMLElement, opts: Opcoes): Controle {
  const { reduzido } = opts;
  const mobile = Math.min(innerWidth, innerHeight) < 700;
  const ll = (lat: number, lon: number, r: number) => {
    const a = lat * D2R, o = lon * D2R, c = Math.cos(a);
    return new THREE.Vector3(c * Math.sin(o) * r, Math.sin(a) * r, c * Math.cos(o) * r);
  };

  // canvas criado aqui (e não no JSX): o StrictMode monta duas vezes e o contexto
  // perdido no primeiro desmonte não pode ser reaproveitado
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'low-power' });
  const camadaRotulos = document.createElement('div');
  camadaRotulos.className = 'pr-rotulos';
  host.append(canvas, camadaRotulos);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.75 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  const tilt = new THREE.Group();
  const group = new THREE.Group();
  scene.add(tilt);
  tilt.add(group);

  /* esfera escura com borda magenta + halo sutil */
  const vtxNormal = 'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}';
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.992, 64, 48), new THREE.ShaderMaterial({
    vertexShader: vtxNormal,
    fragmentShader: `varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-max(dot(vN,vV),0.),3.);
      float l=max(dot(vN,normalize(vec3(-.6,.7,.5))),0.);
      vec3 c=vec3(.05,.032,.04)+vec3(.035,.02,.028)*l+vec3(.816,0.,.302)*f*.32;gl_FragColor=vec4(c,1.);}`,
  })));
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.18, 64, 48), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: vtxNormal,
    fragmentShader: `varying vec3 vN;varying vec3 vV;void main(){float f=pow(max(dot(-vN,vV),0.),4.5);
      gl_FragColor=vec4(mix(vec3(.816,0.,.302),vec3(.996,.322,.137),.35),f*.3);}`,
  })));
  const grade = new THREE.LineBasicMaterial({ color: 0xf6eff1, transparent: true, opacity: 0.045 });
  for (let la = -60; la <= 60; la += 30) {
    const p: T3.Vector3[] = [];
    for (let lo = 0; lo <= 360; lo += 4) p.push(ll(la, lo, 1.001));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), grade));
  }
  for (let lo = 0; lo < 360; lo += 30) {
    const p: T3.Vector3[] = [];
    for (let la = -90; la <= 90; la += 4) p.push(ll(la, lo, 1.001));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), grade));
  }

  /* pontos dos continentes (esfera de Fibonacci filtrada pela máscara) */
  const bin = atob(LANDMASK);
  const mascara = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) mascara[i] = bin.charCodeAt(i);
  const terra = (lat: number, lon: number) => {
    const W = 144, H = 72;
    let x = Math.floor(((lon + 180) / 360) * W);
    const y = Math.min(H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * H)));
    x = (x + W) % W;
    const i = y * W + x;
    return (mascara[i >> 3] >> (i & 7)) & 1;
  };
  const N = mobile ? 12000 : 26000;
  const pos: number[] = [], rnd: number[] = [], ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), f = i * ga, x = Math.cos(f) * r, z = Math.sin(f) * r;
    const lat = Math.asin(y) / D2R, lon = Math.atan2(x, z) / D2R;
    if (lat < -60 || !terra(lat, lon)) continue;
    pos.push(x, y, z);
    rnd.push(Math.random());
  }
  const gPts = new THREE.BufferGeometry();
  gPts.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  gPts.setAttribute('aR', new THREE.Float32BufferAttribute(rnd, 1));
  const mPts = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uSize: { value: 3 }, uOrigin: { value: ll(BAIXADA.lat, BAIXADA.lon, 1) } },
    vertexShader: `uniform float uTime,uSize;uniform vec3 uOrigin;attribute float aR;varying float vA;varying float vW;varying float vX;
      void main(){vec3 n=normalize(normalMatrix*position);vec4 mv=modelViewMatrix*vec4(position,1.);
        float f=dot(n,normalize(-mv.xyz));
        float d=acos(clamp(dot(position,uOrigin),-1.,1.));
        float w=fract(uTime*.085);float wave=smoothstep(.2,0.,abs(d-w*3.3))*(1.-w*.75);
        float w2=fract(uTime*.085+.5);wave+=smoothstep(.2,0.,abs(d-w2*3.3))*(1.-w2*.75);
        float tw=.8+.2*sin(uTime*1.3+aR*60.);
        vW=wave;vA=smoothstep(.02,.4,f)*(tw*.62+wave*.8);
        gl_Position=projectionMatrix*mv;vX=gl_Position.x/gl_Position.w;
        gl_PointSize=uSize*(1.+wave*.5)*(3.7/-mv.z);}`,
    fragmentShader: `varying float vA;varying float vW;varying float vX;
      void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.18,r);
        vec3 c=mix(vec3(.816,0.,.302),vec3(.996,.322,.137),smoothstep(-.75,.75,vX));
        c=mix(c,vec3(1.,.74,.6),clamp(vW,0.,1.)*.55);
        gl_FragColor=vec4(c,a*min(1.,vA*1.3));}`,
  });
  group.add(new THREE.Points(gPts, mPts));

  /* arcos: do Rio para o mundo */
  const arcoCurva = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
    const va = ll(a.lat, a.lon, 1), vb = ll(b.lat, b.lon, 1), ang = va.angleTo(vb), h = 0.08 + (ang / Math.PI) * 0.36;
    const sinA = Math.sin(ang), P: T3.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48, s0 = Math.sin((1 - t) * ang) / sinA, s1 = Math.sin(t * ang) / sinA;
      const v = va.clone().multiplyScalar(s0).add(vb.clone().multiplyScalar(s1)).normalize();
      P.push(v.multiplyScalar(1.004 + h * Math.sin(Math.PI * t)));
    }
    return new THREE.CatmullRomCurve3(P);
  };
  const arcos: T3.ShaderMaterial[] = [];
  DESTINOS.forEach((d, i) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uOff: { value: i * 0.37 }, uSp: { value: 0.16 + (i % 4) * 0.025 }, uBoost: { value: 0 } },
      vertexShader: 'varying float vU;void main(){vU=uv.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform float uTime,uOff,uSp,uBoost;varying float vU;
        void main(){float h=fract(uTime*uSp+uOff)*1.5-.25;float d=h-vU;
          float trail=smoothstep(.38,0.,d)*step(0.,d);float head=smoothstep(.025,0.,abs(d));
          float ends=smoothstep(0.,.04,vU)*smoothstep(1.,.96,vU);
          float a=(.1+uBoost*.22+trail*(.35+uBoost*.6)+head*(.5+uBoost*.9))*ends;
          vec3 c=mix(vec3(.816,0.,.302),vec3(.996,.322,.137),vU);c=mix(c,vec3(1.,.8,.66),clamp(head,0.,1.)*.6);
          gl_FragColor=vec4(c,min(a,1.));}`,
    });
    group.add(new THREE.Mesh(new THREE.TubeGeometry(arcoCurva(RIO, d), 72, mobile ? 0.006 : 0.0048, 6, false), mat));
    arcos.push(mat);
  });

  /* marcadores (ponto + anel que pulsa) e rótulos em HTML */
  const gPonto = new THREE.CircleGeometry(0.014, 20);
  const gAnel = new THREE.RingGeometry(0.02, 0.026, 32);
  const marcadores: Marcador[] = [];
  const rotulos: Rotulo[] = [];
  const marcar = (lat: number, lon: number, tipo: Tipo, nome: string, i: number) => {
    const p = ll(lat, lon, 1.006), s = tipo === 'dest' ? 0.8 : 1.3;
    const ponto = new THREE.Mesh(gPonto, new THREE.MeshBasicMaterial({ color: tipo === 'bxd' ? 0xfff1ea : 0xfe5223, transparent: true, depthWrite: false }));
    ponto.position.copy(p); ponto.lookAt(p.clone().multiplyScalar(2)); ponto.scale.setScalar(s);
    const anel = new THREE.Mesh(gAnel, new THREE.MeshBasicMaterial({ color: tipo === 'dest' ? 0xfe5223 : 0xff3d6e, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    anel.position.copy(p); anel.lookAt(p.clone().multiplyScalar(2));
    group.add(ponto, anel);
    marcadores.push({ anel, s, ph: i * 0.41, tipo });
    const el = document.createElement('div');
    el.className = `pr-rotulo${tipo === 'dest' ? '' : ' pr-rotulo--origem'}`;
    el.textContent = nome;
    camadaRotulos.appendChild(el);
    rotulos.push({ el, pos: ll(lat, lon, 1.004), tipo, on: false, foco: false, w: 0, h: 0 });
  };
  marcar(BAIXADA.lat, BAIXADA.lon, 'bxd', 'Baixada Fluminense', 0);
  marcar(RIO.lat, RIO.lon, 'rio', 'Rio de Janeiro', 1);
  DESTINOS.forEach((d, i) => marcar(d.lat, d.lon, 'dest', d.nome, i + 2));

  /* estado da animação */
  let etapa = reduzido ? 2 : 0;
  const peso = [0, 0, 0];
  peso[etapa] = 1;
  let rotY = -VISTAS[etapa].lon * D2R, rotAlvo: number | null = null, vel = 0;
  let inc = VISTAS[etapa].lat * D2R, camZ = VISTAS[etapa].z;
  let t = 0, desde = 0, pausaAte = 0, raf = 0, ultimo = 0, size = 300;
  let visivel = false, arraste: { x: number; r: number; lx: number; id: number } | null = null;

  const definir = (i: number, instantaneo: boolean) => {
    etapa = i;
    desde = t;
    const v = VISTAS[i];
    rotAlvo = -v.lon * D2R;
    if (instantaneo) {
      rotY = rotAlvo; rotAlvo = null; inc = v.lat * D2R; camZ = v.z;
      peso.fill(0); peso[i] = 1;
    }
    opts.aoMudar(i);
  };

  const v3 = new THREE.Vector3(), dirCam = new THREE.Vector3(), normal = new THREE.Vector3();
  const desenhar = () => {
    group.rotation.set(0, rotY, 0);
    tilt.rotation.x = inc;
    camera.position.set(0, 0, camZ);
    mPts.uniforms.uTime.value = reduzido ? 3 : t;
    arcos.forEach((m) => { m.uniforms.uTime.value = reduzido ? 2.2 : t; m.uniforms.uBoost.value = peso[2]; });
    marcadores.forEach((m) => {
      const u = reduzido ? 0.35 : (t * 0.55 + m.ph) % 1;
      const forca = m.tipo === 'bxd' ? 0.35 + 0.65 * peso[0] : m.tipo === 'rio' ? 0.25 + 0.75 * peso[1] : peso[2];
      const alcance = m.tipo === 'rio' ? 2.6 + 4 * peso[1] : 2.6;
      m.anel.scale.setScalar(m.s * (1 + u * alcance));
      (m.anel.material as T3.MeshBasicMaterial).opacity = (1 - u) * 0.85 * forca;
    });
    scene.updateMatrixWorld();

    /* rótulos: origem com lado fixo (Baixada à esquerda, Rio à direita); cidades com desvio de colisão.
       Na vista do mundo a Baixada cede o lugar às cidades; de perto, só Baixada e Rio. */
    dirCam.copy(camera.position).normalize();
    const ocupados: number[][] = [];
    const livre = (x0: number, y0: number, w: number, h: number) => {
      if (x0 < 2 || y0 < 2 || x0 + w > size - 2 || y0 + h > size - 2) return false;
      return ocupados.every((q) => !(x0 < q[2] + 3 && x0 + w + 3 > q[0] && y0 < q[3] + 2 && y0 + h + 2 > q[1]));
    };
    const mundo = camZ > Z_MUNDO;
    rotulos.forEach((l) => {
      v3.copy(l.pos).applyMatrix4(group.matrixWorld);
      const frente = normal.copy(v3).normalize().dot(dirCam);
      v3.project(camera);
      if (!l.w) { l.w = l.el.offsetWidth || 80; l.h = l.el.offsetHeight || 20; }
      const x = (v3.x * 0.5 + 0.5) * size, y = (-v3.y * 0.5 + 0.5) * size, w = l.w, h = l.h;
      let mostra = false, px = 0, py = 0;
      if (frente > 0.2 && (l.tipo === 'rio' || (l.tipo === 'dest') === mundo)) {
        const lugares = l.tipo === 'bxd'
          ? [[x - 12 - w, y - h - 2], [x - w / 2, y + 12], [x - 12 - w, y - h / 2]]
          : l.tipo === 'rio'
            ? [[x + 12, y + 2], [x - w / 2, y - 12 - h], [x + 12, y - h / 2]]
            : [[x + 9, y - h / 2], [x - 9 - w, y - h / 2], [x - w / 2, y - 8 - h], [x - w / 2, y + 8]];
        for (const [x0, y0] of lugares) {
          if (livre(x0, y0, w, h)) { mostra = true; px = x0; py = y0; ocupados.push([x0, y0, x0 + w, y0 + h]); break; }
        }
      }
      if (mostra) l.el.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
      if (mostra !== l.on) { l.on = mostra; l.el.style.opacity = mostra ? '1' : '0'; }
      const foco = (l.tipo === 'bxd' && etapa === 0) || (l.tipo === 'rio' && etapa === 1);
      if (foco !== l.foco) { l.foco = foco; l.el.classList.toggle('is-foco', foco); }
    });
    renderer.render(scene, camera);
  };

  const passo = (dt: number) => {
    if (!arraste && t > pausaAte && t - desde > DURACAO[etapa]) definir((etapa + 1) % 3, false);
    const k = 1 - Math.exp(-dt * 2.4);
    if (arraste) { /* rotação guiada pelo ponteiro */ }
    else if (rotAlvo !== null) {
      let d = rotAlvo - rotY;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      rotY += d * (1 - Math.exp(-dt * 3));
      if (Math.abs(d) < 0.002) rotAlvo = null;
    } else {
      rotY += vel;
      vel *= Math.pow(0.94, dt * 60);
      if (etapa === 2 && t > pausaAte) rotY += 0.08 * dt;
    }
    const v = VISTAS[etapa];
    inc += (v.lat * D2R - inc) * k;
    camZ += (v.z - camZ) * k;
    for (let i = 0; i < 3; i++) peso[i] += ((i === etapa ? 1 : 0) - peso[i]) * (1 - Math.exp(-dt * 3));
  };

  const quadro = (agora: number) => {
    raf = requestAnimationFrame(quadro);
    const dt = Math.min(0.05, Math.max(0, (agora - ultimo) / 1000));
    ultimo = agora;
    t += dt;
    passo(dt);
    desenhar();
  };
  const ligar = () => {
    if (raf || reduzido || !visivel || document.hidden) return;
    ultimo = performance.now();
    raf = requestAnimationFrame(quadro);
  };
  const desligar = () => { cancelAnimationFrame(raf); raf = 0; };

  const medir = () => {
    size = Math.max(2, host.clientWidth);
    renderer.setSize(size, size, false);
    mPts.uniforms.uSize.value = Math.max(2.1, (size / 660) * 3.5) * renderer.getPixelRatio();
    rotulos.forEach((l) => { l.w = 0; });
    if (!raf) desenhar();
  };

  /* arrastar para girar (touch-action: pan-y deixa a rolagem vertical com a página) */
  const aoApertar = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    arraste = { x: e.clientX, r: rotY, lx: e.clientX, id: e.pointerId };
    rotAlvo = null; vel = 0;
  };
  const aoMover = (e: PointerEvent) => {
    if (!arraste || e.pointerId !== arraste.id) return;
    rotY = arraste.r + (e.clientX - arraste.x) * 0.0062;
    vel = reduzido ? 0 : (e.clientX - arraste.lx) * 0.0062;
    arraste.lx = e.clientX;
    if (!raf) desenhar();
  };
  const aoSoltar = (e: PointerEvent) => {
    if (!arraste || e.pointerId !== arraste.id) return;
    arraste = null;
    pausaAte = t + 6;
  };
  const aoVisibilidade = () => (document.hidden ? desligar() : ligar());
  const aoPerderContexto = () => { desligar(); opts.aoFalhar(); };

  host.addEventListener('pointerdown', aoApertar);
  addEventListener('pointermove', aoMover, { passive: true });
  addEventListener('pointerup', aoSoltar);
  addEventListener('pointercancel', aoSoltar);
  document.addEventListener('visibilitychange', aoVisibilidade);
  canvas.addEventListener('webglcontextlost', aoPerderContexto);
  const ro = new ResizeObserver(medir);
  ro.observe(host);
  const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) ligar(); else desligar(); });
  io.observe(host);
  medir();

  return {
    irPara(i) {
      definir(i, reduzido);
      pausaAte = t + 4;
      if (!raf) desenhar();
    },
    destruir() {
      desligar();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointerdown', aoApertar);
      removeEventListener('pointermove', aoMover);
      removeEventListener('pointerup', aoSoltar);
      removeEventListener('pointercancel', aoSoltar);
      document.removeEventListener('visibilitychange', aoVisibilidade);
      canvas.removeEventListener('webglcontextlost', aoPerderContexto);
      scene.traverse((o) => {
        const m = o as T3.Mesh;
        m.geometry?.dispose();
        const mat = m.material as T3.Material | T3.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      camadaRotulos.remove();
    },
  };
}

