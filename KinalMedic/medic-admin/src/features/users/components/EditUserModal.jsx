import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';

const CARRERAS = [
  'Informática',
  'Electrónica',
  'Electricidad',
  'Mecánica',
  'Dibujo técnico',
];

const SECCIONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const EditUserModal = ({
  isOpen,
  user,
  onClose,
  onUpdate,
  loading,
  canChangeRole = false,
  isSelf = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'STUDENT_ROLE',
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
      phone: '',
    },
  });

  const role = useWatch({ control, name: 'role' });
  const educationLevel = useWatch({ control, name: 'educationLevel' });
  const hasAllergies = useWatch({ control, name: 'hasAllergies' });
  const isStudent = role === 'STUDENT_ROLE';
  const isStaffRole = role === 'ADMIN_ROLE' || role === 'ADMIN_PRINCIPAL';

  useEffect(() => {
    if (!user || !isOpen) return;
    reset({
      role: user.role || 'STUDENT_ROLE',
      name: user.name || '',
      carnet: user.carnet || '',
      educationLevel: user.educationLevel || '',
      carrera: user.carrera || '',
      seccion: user.seccion || '',
      hasAllergies: user.hasAllergies ? 'true' : 'false',
      allergies: user.allergies || '',
      guardianEmail: user.guardianEmail || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
    });
  }, [user, isOpen, reset]);

  if (!isOpen || !user) return null;

  const submit = async (values) => {
    const isAllergic =
      values.hasAllergies === 'true' || values.hasAllergies === true;

    let payload;

    if (values.role === 'ADMIN_ROLE' || values.role === 'ADMIN_PRINCIPAL') {
      payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || '',
      };
      if (canChangeRole && values.role === 'ADMIN_ROLE') {
        payload.role = 'ADMIN_ROLE';
      }
      // No se envía cambio de rol para ADMIN_PRINCIPAL
    } else {
      payload = {
        name: values.name.trim(),
        carnet: values.carnet.trim(),
        educationLevel: values.educationLevel,
        seccion: values.seccion,
        hasAllergies: isAllergic,
        allergies: isAllergic ? values.allergies.trim() : 'Ninguna',
        guardianEmail: values.guardianEmail.trim(),
        email: values.email.trim(),
        carrera:
          values.educationLevel === 'DIVERSIFICADO'
            ? values.carrera
            : null,
      };
      if (canChangeRole) {
        payload.role = 'STUDENT_ROLE';
      }
    }

    if (values.password?.trim()) {
      payload.password = values.password.trim();
    }

    const ok = await onUpdate(user._id, payload);
    if (ok) {
      reset();
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden'>
        <div
          className='p-4 sm:p-5 text-white sticky top-0 z-10'
          style={{
            background: 'linear-gradient(90deg, var(--main-blue) 0%, #1956a3 100%)',
          }}
        >
          <h2 className='text-xl sm:text-2xl font-bold'>Editar usuario</h2>
          <p className='text-xs sm:text-sm opacity-80'>
            Modifica los datos de {user.name}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className='p-4 sm:p-6 space-y-4 overflow-y-auto'
        >
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Rol
            </label>
            {user.role === 'ADMIN_PRINCIPAL' || !canChangeRole ? (
              <input
                type='text'
                readOnly
                value={
                  user.role === 'ADMIN_PRINCIPAL'
                    ? 'Admin Principal (único)'
                    : user.role === 'ADMIN_ROLE'
                      ? 'Médico (ADMIN_ROLE)'
                      : 'Estudiante'
                }
                className='w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-600'
              />
            ) : (
              <select
                {...register('role', { required: true })}
                className='w-full px-3 py-2 border rounded-lg text-sm bg-white'
              >
                <option value='STUDENT_ROLE'>Estudiante</option>
                <option value='ADMIN_ROLE'>Médico (ADMIN_ROLE)</option>
              </select>
            )}
            {(!canChangeRole || user.role === 'ADMIN_PRINCIPAL') && (
              <p className='text-xs text-gray-500 mt-1'>
                {user.role === 'ADMIN_PRINCIPAL'
                  ? 'El Administrador Principal es único y no cambia de rol.'
                  : 'No puedes cambiar el rol de este usuario.'}
              </p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Nombre Completo
              </label>
              <input
                {...register('name', { required: 'El nombre es obligatorio' })}
                className='w-full px-3 py-2 border rounded-lg text-sm'
              />
              {errors.name && (
                <p className='text-red-600 text-xs mt-1'>{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Correo Electrónico
              </label>
              <input
                type='email'
                {...register('email', { required: 'El email es obligatorio' })}
                className='w-full px-3 py-2 border rounded-lg text-sm'
              />
              {errors.email && (
                <p className='text-red-600 text-xs mt-1'>{errors.email.message}</p>
              )}
            </div>
          </div>

          {isStudent ? (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    Carnet
                  </label>
                  <input
                    {...register('carnet', {
                      required: isStudent ? 'El carnet es obligatorio' : false,
                    })}
                    className='w-full px-3 py-2 border rounded-lg text-sm'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    Nivel educativo
                  </label>
                  <select
                    {...register('educationLevel', {
                      required: isStudent ? 'Selecciona el nivel' : false,
                      onChange: (e) => {
                        if (e.target.value === 'BASICO') setValue('carrera', '');
                      },
                    })}
                    className='w-full px-3 py-2 border rounded-lg text-sm bg-white'
                  >
                    <option value=''>Selecciona...</option>
                    <option value='BASICO'>Básico</option>
                    <option value='DIVERSIFICADO'>Diversificado</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {educationLevel === 'DIVERSIFICADO' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                      Carrera
                    </label>
                    <select
                      {...register('carrera', {
                        required:
                          educationLevel === 'DIVERSIFICADO'
                            ? 'Selecciona la carrera'
                            : false,
                      })}
                      className='w-full px-3 py-2 border rounded-lg text-sm bg-white'
                    >
                      <option value=''>Selecciona...</option>
                      {CARRERAS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    Sección
                  </label>
                  <select
                    {...register('seccion', {
                      required: isStudent ? 'Selecciona la sección' : false,
                    })}
                    className='w-full px-3 py-2 border rounded-lg text-sm bg-white'
                  >
                    <option value=''>Selecciona...</option>
                    {SECCIONES.map((s) => (
                      <option key={s} value={s}>
                        Sección {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    ¿Es alérgico?
                  </label>
                  <select
                    {...register('hasAllergies')}
                    className='w-full px-3 py-2 border rounded-lg text-sm bg-white'
                  >
                    <option value='false'>No</option>
                    <option value='true'>Sí</option>
                  </select>
                </div>
                {hasAllergies === 'true' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                      ¿A qué es alérgico?
                    </label>
                    <input
                      {...register('allergies', {
                        required:
                          hasAllergies === 'true'
                            ? 'Indica las alergias'
                            : false,
                      })}
                      className='w-full px-3 py-2 border rounded-lg text-sm'
                    />
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Correo del encargado
                </label>
                <input
                  type='email'
                  {...register('guardianEmail', {
                    required: isStudent
                      ? 'El correo del encargado es obligatorio'
                      : false,
                  })}
                  className='w-full px-3 py-2 border rounded-lg text-sm'
                />
              </div>
            </>
          ) : isStaffRole ? (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Teléfono
              </label>
              <input
                {...register('phone', {
                  required: isStaffRole ? 'El teléfono es obligatorio' : false,
                })}
                className='w-full px-3 py-2 border rounded-lg text-sm'
              />
            </div>
          ) : null}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Nueva contraseña (opcional)
            </label>
            <input
              type='password'
              placeholder='Dejar vacío para no cambiar'
              {...register('password', {
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              className='w-full px-3 py-2 border rounded-lg text-sm'
            />
            {errors.password && (
              <p className='text-red-600 text-xs mt-1'>{errors.password.message}</p>
            )}
          </div>

          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='w-full sm:w-auto px-5 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-60'
              style={{
                background: 'linear-gradient(90deg, var(--main-blue) 0%, #1956a3 100%)',
              }}
            >
              {loading ? <Spinner small /> : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
