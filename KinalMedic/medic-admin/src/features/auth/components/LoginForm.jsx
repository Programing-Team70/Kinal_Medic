import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const LoginForm = ({ onForgot }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      navigate('/dashboard');
      toast.success('¡Bienvenido a Kinal Medic!', { duration: 2000 });
    } else {
      toast.error(res.error || 'Credenciales incorrectas');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' >
      <div>
        <label htmlFor='email_login' className='block text-sm font-medium text-gray-800 mb-1.5'>
          Ingresa tu Email
        </label>
        <input
          type='text'
          id='email_login'
          placeholder='email@example.com'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('email', {
            required: 'El email es obligatorio',
          })}
        />
        {errors.email && (
          <p className='text-red-600 text-xs mt-1'>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor='password_login' className='block text-sm font-medium text-gray-700 mb-1.5'>
          Ingresa tu contraseña
        </label>
        <input
          type='password'
          id='password_login'
          placeholder='********'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('password', {
            required: 'La contraseña es obligatoria',
          })}
        />
        {errors.password && <p className='text-red-600 text-xs mt-1'>{errors.password.message}</p>}
      </div>

      {error && <p className='text-red-600 text-sm text-center font-medium'>{error}</p>}

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-main-blue hover:opacity-90 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm'
      >
        {loading ? 'Validando...' : 'Iniciar Sesión'}
      </button>

      <p className='text-center text-sm text-gray-600'>
        ¿Eres un alumno nuevo?{' '}
        <button
          type='button'
          onClick={onForgot}
          className='text-main-blue font-semibold hover:underline hover:cursor-pointer '
        >
          ¡Registra tu usuario aquí!
        </button>
      </p>
    </form>
  );
};