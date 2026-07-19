import { useState, useEffect, useMemo } from 'react';
import { useAvailabilityStore } from '../store/availabilityStore';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import defaultDoctor from '../../../assets/img/LogoMedic.png';
import { getTeacherUserId, sameTeacherId } from '../utils/teacherId.js';

const CAMPUS_LOCATIONS = [
  'Clínica / Enfermería',
  'Patio principal',
  'Patio 2',
  'Área de Básicos',
  'Sala de profesores',
  'Edificio C — Nivel 1',
  'Edificio C — Nivel 2',
  'Edificio C — Nivel 3',
  'Edificio I — Nivel 2',
  'Parqueo',
  'Reja de salida',
  'En ronda por el campus',
];

/**
 * Cada tarjeta representa UN médico fijo (teacherId del prop).
 * Nunca se reasigna al usuario logueado: eso hacía que todas las tarjetas
 * mostraran los datos del médico actual.
 */
export const TeacherCard = ({ teacher: initialTeacher }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const {
    teachers,
    updateTeacherStatus,
    toggleActive,
    getStatusBadge,
    getStatusText,
    getLocalAvatarUrl,
    formatTimeAgo,
  } = useAvailabilityStore();

  // ID de usuario del médico de ESTA tarjeta (inmutable respecto al prop)
  const cardTeacherId = useMemo(
    () => getTeacherUserId(initialTeacher),
    [initialTeacher]
  );

  // Resolver datos frescos del store SOLO por teacherId de la tarjeta (sin mezclar con user.id)
  const teacher = useMemo(() => {
    if (!cardTeacherId) return initialTeacher;
    const fromStore = teachers.find((t) =>
      sameTeacherId(getTeacherUserId(t), cardTeacherId)
    );
    return fromStore || initialTeacher;
  }, [teachers, cardTeacherId, initialTeacher]);

  const name = teacher.teacherName || teacher.TeacherName || 'Profesor Médico';
  const teacherId = getTeacherUserId(teacher) || cardTeacherId;
  const status =
    teacher.currentStatus !== undefined
      ? teacher.currentStatus
      : teacher.CurrentStatus;
  const location =
    teacher.locationDescription ||
    teacher.LocationDescription ||
    'No especificada';
  const updatedTime = teacher.lastUpdate || teacher.LastUpdate;
  const isActive =
    teacher.isActive !== undefined
      ? teacher.isActive
      : teacher.IsActive !== undefined
        ? teacher.IsActive
        : false;
  const email = teacher.email || teacher.Email || '';

  const [isEditing, setIsEditing] = useState(false);
  const [inputStatus, setInputStatus] = useState(String(status ?? 1));
  const [inputLocation, setInputLocation] = useState(location);
  const [toggling, setToggling] = useState(false);

  const isStudent = user?.role === 'STUDENT_ROLE';
  const isMedicUser = user?.role === 'ADMIN_ROLE';
  // Solo el médico dueño de ESTA tarjeta (mismo teacherId que el JWT id)
  const isOwner =
    isMedicUser && Boolean(user?.id) && sameTeacherId(teacherId, user.id);

  useEffect(() => {
    setInputStatus(String(status ?? 1));
    setInputLocation(location);
  }, [status, location, teacherId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) return;

    // Nombre del usuario logueado (no el de otra tarjeta)
    const success = await updateTeacherStatus(
      user?.name || name,
      inputStatus,
      inputLocation,
      token,
      true
    );
    if (success) setIsEditing(false);
  };

  const handleToggle = async () => {
    if (!isOwner || toggling) return;
    setToggling(true);
    await toggleActive(!isActive, token);
    setToggling(false);
  };

  return (
    <div
      className={`bg-white p-8 md:p-10 rounded-3xl shadow-xl border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[360px] relative overflow-hidden ${
        isActive ? 'border-emerald-100' : 'border-gray-200 opacity-95'
      }`}
      data-teacher-id={teacherId || undefined}
    >
      <div
        className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
          isActive
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {isActive ? 'En servicio' : 'Fuera de servicio'}
      </div>

      <div>
        <div className='flex flex-col sm:flex-row items-center gap-5 mb-6 text-center sm:text-left'>
          <div className='relative flex-shrink-0 mx-auto sm:mx-0'>
            <img
              src={getLocalAvatarUrl(name)}
              alt={`Avatar de ${name}`}
              className='w-24 h-24 rounded-2xl bg-slate-50 border-2 border-gray-200 p-1.5 object-cover shadow-md'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultDoctor;
              }}
            />
            <span
              className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full shadow ${
                isActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </div>
          <div className='w-full pr-16 sm:pr-20'>
            <h3 className='text-xl md:text-2xl font-black text-gray-800 tracking-tight mb-1'>
              {name}
            </h3>
            {email ? (
              <p className='text-xs text-gray-400 break-all mb-2'>{email}</p>
            ) : null}

            {isOwner ? (
              <div className='flex flex-wrap gap-3 items-center mt-1'>
                <span className='text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md'>
                  Tu perfil
                </span>
                <button
                  type='button'
                  onClick={() => setIsEditing(!isEditing)}
                  className='text-sm font-bold text-blue-600 hover:text-blue-800 underline transition'
                >
                  {isEditing ? 'Cancelar' : 'Actualizar mi ubicación'}
                </button>
              </div>
            ) : isStudent ? (
              <span className='text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md tracking-wide uppercase'>
                Solo lectura
              </span>
            ) : (
              <span className='text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md'>
                Otro médico del equipo
              </span>
            )}
          </div>
        </div>

        {isOwner && (
          <div className='mb-5 flex items-center justify-between bg-slate-50 border border-gray-100 rounded-2xl px-4 py-3'>
            <div>
              <p className='text-sm font-bold text-gray-800'>
                {isActive ? 'Estoy disponible para atender' : 'No estoy en servicio'}
              </p>
              <p className='text-xs text-gray-500'>
                Los alumnos verán este indicador en tiempo real
              </p>
            </div>
            <button
              type='button'
              role='switch'
              aria-checked={isActive}
              disabled={toggling}
              onClick={handleToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                isActive ? 'bg-emerald-500' : 'bg-slate-300'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                  isActive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {isEditing && isOwner ? (
          <form
            onSubmit={handleSubmit}
            className='bg-slate-50 p-5 rounded-2xl border border-gray-200 mb-5 space-y-4 shadow-inner'
          >
            <h4 className='text-sm font-black text-gray-700 uppercase tracking-wider'>
              Actualizar mi estado
            </h4>
            <div>
              <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>
                Estado
              </label>
              <select
                value={inputStatus}
                onChange={(e) => setInputStatus(e.target.value)}
                className='w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none'
              >
                <option value='1'>Disponible</option>
                <option value='0'>En Enfermería</option>
                <option value='5'>En el Parqueo / Fuera</option>
                <option value='2'>Ocupado</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>
                ¿Dónde te encuentras?
              </label>
              <select
                value={
                  CAMPUS_LOCATIONS.includes(inputLocation)
                    ? inputLocation
                    : '__custom__'
                }
                onChange={(e) => {
                  if (e.target.value !== '__custom__') {
                    setInputLocation(e.target.value);
                  } else {
                    setInputLocation('');
                  }
                }}
                className='w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none mb-2'
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
                <option value='__custom__'>Otra (escribir abajo)</option>
              </select>
              <input
                type='text'
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                placeholder='Ubicación detallada'
                className='w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium'
              />
            </div>
            <button
              type='submit'
              className='w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow uppercase tracking-wider'
            >
              Guardar cambios
            </button>
          </form>
        ) : (
          <div className='mb-6 flex w-full'>
            <span
              className={`w-full text-center block px-5 py-3.5 rounded-2xl text-lg font-black uppercase tracking-widest ${getStatusBadge(
                status,
                isActive
              )}`}
            >
              {getStatusText(status, isActive)}
            </span>
          </div>
        )}

        <div className='space-y-3 pt-5 border-t border-gray-100 text-gray-600'>
          <div className='flex items-start gap-3'>
            <svg
              className='w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2.5'
                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              />
            </svg>
            <p className='text-gray-700 leading-relaxed text-sm md:text-base'>
              <span className='font-extrabold text-gray-800'>Ubicación:</span>{' '}
              {isActive ? location : '— (fuera de servicio)'}
            </p>
          </div>
          <div className='flex items-center gap-3 text-sm text-gray-500 font-semibold'>
            <svg
              className='w-5 h-5 text-gray-400 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2.5'
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18'
              />
            </svg>
            <p>
              <span className='font-bold text-gray-600'>Sincronizado:</span>{' '}
              {formatTimeAgo(updatedTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
