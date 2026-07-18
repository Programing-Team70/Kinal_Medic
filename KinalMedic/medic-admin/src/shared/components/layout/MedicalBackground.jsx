export const MedicalBackground = () => {
  return (
    <div
      className='kinal-medical-bg'
      aria-hidden='true'
    >
      <div className='kinal-medical-bg__gradient' />
      <div className='kinal-medical-bg__grid' />

      {/* Orbes suaves */}
      <div className='kinal-orb kinal-orb--1' />
      <div className='kinal-orb kinal-orb--2' />
      <div className='kinal-orb kinal-orb--3' />

      {/* Cruces médicas flotantes */}
      <span className='kinal-cross kinal-cross--1'>+</span>
      <span className='kinal-cross kinal-cross--2'>+</span>
      <span className='kinal-cross kinal-cross--3'>+</span>
      <span className='kinal-cross kinal-cross--4'>+</span>
      <span className='kinal-cross kinal-cross--5'>+</span>
      <span className='kinal-cross kinal-cross--6'>+</span>

      {/* ECG / pulso */}
      <svg
        className='kinal-ecg'
        viewBox='0 0 1200 120'
        preserveAspectRatio='none'
      >
        <path
          className='kinal-ecg__path'
          d='M0,60 L80,60 L100,60 L120,20 L140,100 L160,40 L180,60 L280,60 L300,60 L320,10 L340,110 L360,60 L480,60 L500,60 L520,30 L540,90 L560,60 L700,60 L720,60 L740,15 L760,105 L780,60 L900,60 L920,60 L940,25 L960,95 L980,60 L1200,60'
          fill='none'
          stroke='rgba(8, 49, 109, 0.18)'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>

      <svg
        className='kinal-ecg kinal-ecg--2'
        viewBox='0 0 1200 120'
        preserveAspectRatio='none'
      >
        <path
          className='kinal-ecg__path kinal-ecg__path--delayed'
          d='M0,70 L100,70 L130,70 L150,35 L170,100 L190,50 L210,70 L400,70 L430,70 L450,25 L470,110 L490,70 L700,70 L730,70 L750,40 L770,95 L790,70 L1200,70'
          fill='none'
          stroke='rgba(14, 165, 233, 0.12)'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};
