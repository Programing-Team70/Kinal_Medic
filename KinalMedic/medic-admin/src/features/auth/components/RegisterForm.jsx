import { useForm, useWatch } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

const CARRERAS = [
  'Informática',
  'Electrónica',
  'Electricidad',
  'Mecánica',
  'Dibujo técnico',
];

const SECCIONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const RegisterForm = ({ onSwitch }) => {
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      carnet: '',
      educationLevel: '',
      carrera: '',
      seccion: '',
      hasAllergies: 'false',
      allergies: '',
      guardianEmail: '',
      email: '',
      password: '',
    },
  });

  const educationLevel = useWatch({ control, name: 'educationLevel' });
  const hasAllergies = useWatch({ control, name: 'hasAllergies' });

  const onSubmit = async (data) => {
    const isAllergic = data.hasAllergies === 'true' || data.hasAllergies === true;

    const payload = {
      name: data.name.trim(),
      carnet: data.carnet.trim(),
      educationLevel: data.educationLevel,
      seccion: data.seccion,
      hasAllergies: isAllergic,
      allergies: isAllergic ? data.allergies.trim() : 'Ninguna',
      guardianEmail: data.guardianEmail.trim(),
      email: data.email.trim(),
      password: data.password,
      role: 'STUDENT_ROLE',
    };

    if (data.educationLevel === 'DIVERSIFICADO') {
      payload.carrera = data.carrera;
    }

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-3 max-h-[480px] overflow-y-auto px-1'
    >
      {/* Nombre */}
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

      {/* Carnet */}
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

      {/* Nivel educativo */}
      <div>
        <label htmlFor='educationLevel' className='block text-sm font-medium text-gray-800 mb-1'>
          Nivel educativo
        </label>
        <select
          id='educationLevel'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
          {...register('educationLevel', {
            required: 'Selecciona el nivel educativo',
            onChange: (e) => {
              if (e.target.value === 'BASICO') {
                setValue('carrera', '');
              }
            },
          })}
        >
          <option value=''>Selecciona una opción...</option>
          <option value='BASICO'>Básico</option>
          <option value='DIVERSIFICADO'>Diversificado</option>
        </select>
        {errors.educationLevel && (
          <p className='text-red-600 text-xs mt-0.5'>{errors.educationLevel.message}</p>
        )}
      </div>

      {/* Carrera solo si Diversificado */}
      {educationLevel === 'DIVERSIFICADO' && (
        <div>
          <label htmlFor='carrera' className='block text-sm font-medium text-gray-800 mb-1'>
            Carrera / Especialidad
          </label>
          <select
            id='carrera'
            className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            {...register('carrera', {
              required:
                educationLevel === 'DIVERSIFICADO'
                  ? 'Selecciona tu carrera'
                  : false,
            })}
          >
            <option value=''>Selecciona una opción...</option>
            {CARRERAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.carrera && (
            <p className='text-red-600 text-xs mt-0.5'>{errors.carrera.message}</p>
          )}
        </div>
      )}

      {/* Sección */}
      <div>
        <label htmlFor='seccion' className='block text-sm font-medium text-gray-800 mb-1'>
          Sección
        </label>
        <select
          id='seccion'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
          {...register('seccion', { required: 'Selecciona tu sección' })}
        >
          <option value=''>Selecciona una opción...</option>
          {SECCIONES.map((s) => (
            <option key={s} value={s}>
              Sección {s}
            </option>
          ))}
        </select>
        {errors.seccion && (
          <p className='text-red-600 text-xs mt-0.5'>{errors.seccion.message}</p>
        )}
      </div>

      {/* ¿Es alérgico? */}
      <div>
        <label htmlFor='hasAllergies' className='block text-sm font-medium text-gray-800 mb-1'>
          ¿Es alérgico?
        </label>
        <select
          id='hasAllergies'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
          {...register('hasAllergies', { required: true })}
        >
          <option value='false'>No</option>
          <option value='true'>Sí</option>
        </select>
      </div>

      {hasAllergies === 'true' && (
        <div>
          <label htmlFor='allergies' className='block text-sm font-medium text-gray-800 mb-1'>
            ¿A qué es alérgico?
          </label>
          <input
            type='text'
            id='allergies'
            placeholder='Ej. Penicilina, mariscos, polen...'
            className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            {...register('allergies', {
              required:
                hasAllergies === 'true'
                  ? 'Indica a qué eres alérgico'
                  : false,
            })}
          />
          {errors.allergies && (
            <p className='text-red-600 text-xs mt-0.5'>{errors.allergies.message}</p>
          )}
        </div>
      )}

      {/* Correo del encargado */}
      <div>
        <label
          htmlFor='guardianEmail'
          className='block text-sm font-medium text-gray-800 mb-1'
        >
          Correo del encargado
        </label>
        <input
          type='email'
          id='guardianEmail'
          placeholder='encargado@gmail.com'
          className='w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('guardianEmail', {
            required: 'El correo del encargado es obligatorio',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Correo del encargado inválido',
            },
          })}
        />
        {errors.guardianEmail && (
          <p className='text-red-600 text-xs mt-0.5'>{errors.guardianEmail.message}</p>
        )}
      </div>

      {/* Email del alumno */}
      <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-800 mb-1'>
          Correo Electrónico (estudiante)
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

      {/* Contraseña */}
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
        {errors.password && (
          <p className='text-red-600 text-xs mt-0.5'>{errors.password.message}</p>
        )}
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
