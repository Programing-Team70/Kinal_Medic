import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onSwitch }) => {
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
 
    const payload = {
      ...data,
      role: 'STUDENT_ROLE'
    };

    const res = await registerUser(payload);
    
    if (res.success) {
      toast.success('¡Estudiante registrado con éxito! Ya puedes iniciar sesión.');
      reset(); 
      onSwitch(); 
    } else {
      toast.error(res.error || 'No se pudo completar el registro');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-h-[450px] overflow-y-auto px-1'>
      
      {/* 1. Nombre Completo */}
      <div>
        <label htmlFor='name' className='block text-sm font-medium text-gray-800 mb-1'>
          Nombre Completo
        </label>
        <input
          type='text'
          id='name'
          placeholder='Tu nombre y apellido'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('name', { required: 'El nombre es obligatorio' })}
        />
        {errors.name && <p className='text-red-600 text-xs mt-0.5'>{errors.name.message}</p>}
      </div>

      {/* 2. Carnet */}
      <div>
        <label htmlFor='carnet' className='block text-sm font-medium text-gray-800 mb-1'>
          Carnet Estudiantil
        </label>
        <input
          type='text'
          id='carnet'
          placeholder='Ej. 2024332'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('carnet', { required: 'El carnet es obligatorio' })}
        />
        {errors.carnet && <p className='text-red-600 text-xs mt-0.5'>{errors.carnet.message}</p>}
      </div>

      {/* 3. Carrera */}
      <div>
        <label htmlFor='carrera' className='block text-sm font-medium text-gray-800 mb-1'>
          Carrera / Especialidad
        </label>
        <select
          id='carrera'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
          {...register('carrera', { required: 'Selecciona tu carrera' })}
        >
          <option value=''>Selecciona una opción...</option>
          <option value='Informática'>Informatica</option>
          <option value='Electrónica'>Electrónica</option>
          <option value='Electricidad'>Electricidad</option>
          <option value='Mecánica'>Mecánica</option>
        </select>
        {errors.carrera && <p className='text-red-600 text-xs mt-0.5'>{errors.carrera.message}</p>}
      </div>

      {/* 4. Email */}
      <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-800 mb-1'>
          Correo Electrónico
        </label>
        <input
          type='email'
          id='email'
          placeholder='alumno@kinal.edu.gt'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Correo inválido',
            },
          })}
        />
        {errors.email && <p className='text-red-600 text-xs mt-0.5'>{errors.email.message}</p>}
      </div>

      {/* 5. Contraseña */}
      <div>
        <label htmlFor='password' className='block text-sm font-medium text-gray-800 mb-1'>
          Contraseña de Acceso
        </label>
        <input
          type='password'
          id='password'
          placeholder='********'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
          })}
        />
        {errors.password && <p className='text-red-600 text-xs mt-0.5'>{errors.password.message}</p>}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-main-blue hover:opacity-90 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm mt-2'
      >
        {loading ? 'Registrando...' : 'Registrar Estudiante'}
      </button>

      <p className='text-center text-xs text-gray-600 mt-2'>
        ¿Ya tienes cuenta creada?{' '}
        <button
          type='button'
          onClick={onSwitch}
          className='text-main-blue font-semibold hover:underline hover:cursor-pointer'
        >
          Iniciar Sesión
        </button>
      </p>
    </form>
  );
};