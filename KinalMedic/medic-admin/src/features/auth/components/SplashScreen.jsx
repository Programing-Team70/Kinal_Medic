import { useEffect, useState } from 'react';
import logo from '../../../assets/img/Logo_Enfermería_Kinal.png';

const REFLECTIONS = [
  'Cuidar es un acto de valentía y de esperanza.',
  'Cada vida que atiendes deja una huella de bondad.',
  'La salud no es solo un servicio: es un compromiso con el prójimo.',
  'En cada emergencia hay una oportunidad de servir con el corazón.',
  'Kinal forma profesionales; Kinal Medic cuida a su comunidad.',
];

/**
 * Entrada escalonada:
 * 1) Logo  →  2) "Kinal Medic"  →  3) Frase de reflexión (tiempo amplio para leer)
 * El fondo azul no se queda vacío: el contenido aparece de inmediato y en secuencia.
 */
export const SplashScreen = ({ onFinish }) => {
  // showLogo | showTitle | showQuote | hold | exit
  const [phase, setPhase] = useState('showLogo');
  const [quote] = useState(
    () => REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)]
  );

  useEffect(() => {
    // ~0.1s azul y logo entra (casi inmediato)
    const tLogo = setTimeout(() => setPhase('showLogo'), 100);
    // Título después del logo
    const tTitle = setTimeout(() => setPhase('showTitle'), 900);
    // Frase de reflexión
    const tQuote = setTimeout(() => setPhase('showQuote'), 1700);
    // Mantener frase legible ~3.5s más
    const tHold = setTimeout(() => setPhase('hold'), 1800);
    // Salida
    const tExit = setTimeout(() => setPhase('exit'), 1800 + 3500);
    // Fin (~5.9s total, la mayor parte con contenido visible)
    const tEnd = setTimeout(() => onFinish?.(), 1800 + 3500 + 600);

    return () => {
      clearTimeout(tLogo);
      clearTimeout(tTitle);
      clearTimeout(tQuote);
      clearTimeout(tHold);
      clearTimeout(tExit);
      clearTimeout(tEnd);
    };
  }, [onFinish]);

  const logoOn = true; // logo desde el inicio de la secuencia
  const titleOn =
    phase === 'showTitle' ||
    phase === 'showQuote' ||
    phase === 'hold' ||
    phase === 'exit';
  const quoteOn =
    phase === 'showQuote' || phase === 'hold' || phase === 'exit';

  return (
    <div
      className={`kinal-splash ${phase === 'exit' ? 'kinal-splash--exit' : 'kinal-splash--enter'}`}
      role='presentation'
    >
      <div className='kinal-splash__glow' />
      <div className='kinal-splash__pulse' />

      <div className='kinal-splash__content kinal-splash__content--staged'>
        {/* 1. Imagen */}
        <div
          className={`kinal-splash__stage kinal-splash__logo-wrap ${
            logoOn ? 'kinal-splash__stage--in' : ''
          }`}
        >
          <img src={logo} alt='Kinal Medic' className='kinal-splash__logo' />
        </div>

        {/* 2. Título */}
        <div
          className={`kinal-splash__stage ${titleOn ? 'kinal-splash__stage--in' : 'kinal-splash__stage--out'}`}
        >
          <h1 className='kinal-splash__title'>Kinal Medic</h1>
          <p className='kinal-splash__tagline'>
            Enfermería institucional · Fundación Kinal
          </p>
        </div>

        {/* 3. Frase de reflexión (más tiempo en pantalla) */}
        <div
          className={`kinal-splash__stage kinal-splash__quote-box ${
            quoteOn ? 'kinal-splash__stage--in' : 'kinal-splash__stage--out'
          }`}
        >
          <span className='kinal-splash__quote-mark'>“</span>
          <p className='kinal-splash__quote'>{quote}</p>
        </div>

        <div
          className={`kinal-splash__loader ${
            quoteOn ? 'kinal-splash__stage--in' : 'kinal-splash__stage--out'
          }`}
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};
