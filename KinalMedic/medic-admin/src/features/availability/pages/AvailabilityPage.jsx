import { useEffect, useMemo, useState } from 'react';
import { useAvailabilityStore } from '../store/availabilityStore';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { TeacherCard } from '../components/state.medical.jsx';
import { teacherListKey } from '../utils/teacherId.js';

export const AvailabilityPage = () => {
  const { teachers, loading, fetchAvailability, registerSelf } =
    useAvailabilityStore();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [registering, setRegistering] = useState(false);

  // Solo ADMIN_ROLE (médico) tiene estado de profesor; ADMIN_PRINCIPAL solo consulta
  const isMedic = user?.role === 'ADMIN_ROLE';
  const isStudent = user?.role === 'STUDENT_ROLE';
  const isPrincipal = user?.role === 'ADMIN_PRINCIPAL';

  useEffect(() => {
    const bootstrap = async () => {
      await fetchAvailability();
      // Solo el médico se auto-registra en la lista (el principal no)
      if (isMedic && token && user?.id) {
        setRegistering(true);
        await registerSelf(token, {
          name: user.name,
          email: user.email,
          userId: user.id,
        });
        setRegistering(false);
      }
    };
    bootstrap();

    const interval = setInterval(fetchAvailability, 20000);
    return () => clearInterval(interval);
  }, [fetchAvailability, registerSelf, isMedic, token, user?.id, user?.name, user?.email]);

  const stats = useMemo(() => {
    const list = teachers || [];
    const active = list.filter(
      (t) => t.isActive === true || t.IsActive === true
    ).length;
    return { total: list.length, active, inactive: list.length - active };
  }, [teachers]);

  if (loading && teachers.length === 0) {
    return (
      <div className='flex justify-center items-center h-96'>
        <p className='text-xl text-gray-500 font-bold animate-pulse'>
          Sincronizando personal médico...
        </p>
      </div>
    );
  }

  return (
    <div className='p-6 md:p-8 max-w-7xl mx-auto animate-fadeIn'>
      <div className='mb-8 border-b-2 border-gray-200 pb-5'>
        <h1 className='text-2xl md:text-4xl font-black text-main-blue tracking-wide uppercase text-center md:text-left'>
          Estado del personal médico
        </h1>
        <p className='text-gray-500 text-sm mt-2 text-center md:text-left'>
          {isMedic
            ? 'Activa tu turno y actualiza tu ubicación. Solo puedes editar tu propio estado; las demás tarjetas son solo lectura.'
            : isPrincipal
              ? 'Vista de supervisión: consulta el estado de los médicos. El Admin Principal no tiene estado de profesor propio.'
              : 'Consulta qué médicos están en servicio y dónde se encuentran.'}
        </p>
      </div>

      {/* Resumen */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-3xl'>
        <div className='bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center'>
          <p className='text-2xl font-black text-main-blue'>{stats.total}</p>
          <p className='text-xs text-gray-500 font-semibold uppercase'>Médicos</p>
        </div>
        <div className='bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm text-center'>
          <p className='text-2xl font-black text-emerald-600'>{stats.active}</p>
          <p className='text-xs text-emerald-700 font-semibold uppercase'>
            En servicio
          </p>
        </div>
        <div className='bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm text-center'>
          <p className='text-2xl font-black text-slate-500'>{stats.inactive}</p>
          <p className='text-xs text-slate-500 font-semibold uppercase'>
            Fuera de servicio
          </p>
        </div>
      </div>

      {isMedic && registering && (
        <p className='text-sm text-blue-600 mb-4 font-medium'>
          Sincronizando tu perfil médico en la lista...
        </p>
      )}

      {teachers && teachers.length > 0 ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto'>
          {teachers.map((t, index) => (
            <TeacherCard
              key={teacherListKey(t, index)}
              teacher={t}
            />
          ))}
        </div>
      ) : (
        <div className='bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100 max-w-2xl mx-auto flex flex-col items-center gap-4'>
          <h3 className='text-xl font-black text-gray-800'>
            Aún no hay médicos en disponibilidad
          </h3>
          <p className='text-gray-500 text-sm max-w-sm'>
            {isMedic
              ? 'Al recargar esta página tu perfil se registrará automáticamente. Luego activa tu turno.'
              : 'Cuando un médico active su estado, aparecerá aquí.'}
          </p>
        </div>
      )}

      {isMedic && (
        <div className='mt-8 max-w-2xl mx-auto bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800'>
          <p className='font-bold mb-1'>¿Cómo funciona para médicos?</p>
          <ul className='list-disc pl-5 space-y-1 text-xs'>
            <li>Al entrar a esta pantalla te registras solo en la lista.</li>
            <li>
              Usa el interruptor <strong>En servicio / Fuera de servicio</strong> para
              que los alumnos sepan si pueden buscarte.
            </li>
            <li>
              Actualiza tu ubicación (enfermería, patio, edificio…) cuando te
              muevas.
            </li>
            <li>Solo puedes editar <strong>tu</strong> tarjeta, no la de otros médicos.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
