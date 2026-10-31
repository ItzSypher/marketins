import { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GTA } from '../sections/Gta';
import { ENTRADA_FECHOU, entradaAberta } from '../teste/Entrada';
import { montar } from '../teste/App';

/*
  /gta: a mesma home aprovada, com a abertura do GTA 6 no lugar da hero do globo.
  A única tela de toque é a <Entrada /> da home (ela já dispara 'marketins:entrou' e destrava a rolagem),
  então o GTA não traz outra. A abertura monta quando a entrada fecha, para a animação de chegada do logo
  rodar à vista, e a página recalcula os pins depois que ela entra.
*/
function HeroGta() {
  const [livre, setLivre] = useState(() => !entradaAberta());
  useEffect(() => {
    if (livre) return;
    const abrir = () => setLivre(true);
    addEventListener(ENTRADA_FECHOU, abrir);
    return () => removeEventListener(ENTRADA_FECHOU, abrir);
  }, [livre]);
  useEffect(() => {
    if (!livre) return;
    const r = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(r);
  }, [livre]);
  // reserva a altura da abertura enquanto a entrada cobre a tela
  return livre ? <GTA saiNoFim={false} /> : <div style={{ height: '100svh' }} aria-hidden="true" />;
}

montar(<HeroGta />);
