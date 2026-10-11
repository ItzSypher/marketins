import '@fontsource-variable/jost';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { linkContato } from '../content';
import { Botao } from '../ds/Botao';
import { Musica } from '../ds/blocos';
import { GTA } from '../sections/Gta';
import { Stage } from '../sections/Stage';
import '../styles.css';
import '../sections/abertura-home.css';
import '../sections/home-blocos.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  return (
    <main>
      <GTA />
      <Stage cta={<Botao href={linkContato('campanha conecta · hero')}>Agendar reunião</Botao>} />
      <Musica comToque />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
