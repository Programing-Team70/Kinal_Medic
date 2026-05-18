import { useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';

export const AuthPage = () => {
  const [isForgot, setIsForgot] = useState(false);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <div className='w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:pd-10'>
        <div className='flex justify-center mb-6'>
          <img
            src='/src/assets/img/Logo_Enfermería_Kinal.png'
            alt='Kinal Medic'
            className='h-20 w-auto'
          />
        </div>
        <div className='text-center mb-6'>
          <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-2'>
            {isForgot ? 'REGISTRO DE USUARIO' : 'INICIAR SESIÓN'}
          </h1>
          <p className='text-gray-600 text-base max-w-md mx-auto'>
            {isForgot
              ? 'Ingresa los datos para crear el usuario.'
              : 'Ingresa tus credenciales de Administrador Kinal Medic o Estudiante.'}
          </p>
        </div>
        {isForgot ? (
          <RegisterForm onSwitch={() => setIsForgot(false)} />
        ) : (
          <LoginForm onForgot={() => setIsForgot(true)} />
        )}
      </div>
    </div>
  );
};
