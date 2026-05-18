import { useForm } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';

export const CreateStudentModal = ({ isOpen, onClose, onCreate, loading, error }) => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm();

  if (!isOpen) return null;

  const submit = async (values) => {

    const studentData = {
      name: values.name,
      carnet: values.carnet,
      carrera: values.carrera,
      email: values.email,
      password: values.password,
    };

    const ok = await onCreate(studentData);
    if (ok) {
      reset();
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden'>
        
        {/* Encabezado */}
        <div
          className='p-4 sm:p-5 text-white sticky top-0 z-10'
          style={{
            background: 'linear-gradient(90deg, var(--main-blue) 0%, #1956a3 100%)',
          }}
        >
          <h2 className='text-xl sm:text-2xl font-bold'>Registrar Nuevo Alumno</h2>
          <p className='text-xs sm:text-sm opacity-80'>
            Completa los datos del estudiante para cargarlo en el sistema Kinal Medic
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(submit)} className='p-4 sm:p-6 space-y-4 overflow-y-auto'>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Nombre Completo */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Nombre Completo</label>
              <input
                {...register('name', { required: 'El nombre completo es obligatorio' })}
                type='text'
                placeholder='Ej. Juan Pérez'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
              />
              {errors.name && <p className='text-red-600 text-xs mt-1'>{errors.name.message}</p>}
            </div>

            {/* Carnet */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Carnet Estudiantil</label>
              <input
                {...register('carnet', {
                  required: 'El número de carnet es obligatorio',
                })}
                type='text'
                placeholder='Ej. 2024332'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
              />
              {errors.carnet && <p className='text-red-600 text-xs mt-1'>{errors.carnet.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Carrera */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Carrera / Especialidad</label>
              <input
                {...register('carrera', {
                  required: 'La carrera es obligatoria',
                })}
                type='text'
                placeholder='Ej. Informática'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
              />
              {errors.carrera && <p className='text-red-600 text-xs mt-1'>{errors.carrera.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Correo Electrónico</label>
              <input
                {...register('email', {
                  required: 'El email es obligatorio',
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: 'Formato de email inválido',
                  },
                })}
                type='email'
                placeholder='alumno@kinal.edu.gt'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
              />
              {errors.email && <p className='text-red-600 text-xs mt-1'>{errors.email.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Contraseña */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Contraseña</label>
              <input
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: {
                    value: 6,
                    message: 'Debe tener al menos 6 caracteres',
                  },
                })}
                type='password'
                placeholder='********'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
              />
              {errors.password && <p className='text-red-600 text-xs mt-1'>{errors.password.message}</p>}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Confirmar contraseña
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Debe confirmar la contraseña',
                  validate: {
                    matchesPassword: (value) =>
                      value === getValues('password') || 'Las contraseñas no coinciden',
                  },
                })}
                type='password'
                placeholder='********'
                className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
              />
              {errors.confirmPassword && (
                <p className='text-red-600 text-xs mt-1'>{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Manejo de errores globales del Backend */}
          {error && <p className='text-red-600 text-sm text-center font-medium mt-2'>{error}</p>}

          {/* Botones de acción */}
          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t mt-4'>
            <button
              type='button'
              onClick={onClose}
              className='w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm font-medium'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='w-full sm:w-auto px-5 py-2 rounded-lg text-white font-medium transition shadow disabled:opacity-60 text-sm'
              style={{
                background: 'linear-gradient(90deg, var(--main-blue) 0%, #1956a3 100%)',
                border: 'none',
              }}
            >
              {loading ? <Spinner small /> : 'Registrar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
