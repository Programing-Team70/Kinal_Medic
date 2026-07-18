import { Link } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import logo from '../../../assets/img/Logo_Enfermería_Kinal.png';
import imgMedical from '../../../assets/img/Registro_Medico.png';
import imgInventory from '../../../assets/img/Inventario.png';
import imgNotification from '../../../assets/img/Notificación.png';
import imgAvailability from '../../../assets/img/Estado_Profesor.png';
import imgUsers from '../../../assets/img/Usuarios.png';
import { ROLES, isStaff, roleLabel as getRoleLabel } from '../../../shared/utils/roles.js';

const ALL = [ROLES.PRINCIPAL, ROLES.MEDIC, ROLES.STUDENT];
const STAFF = [ROLES.PRINCIPAL, ROLES.MEDIC];

const FEATURES = [
  {
    title: 'Registro médico',
    desc: 'Historiales clínicos, signos vitales y atención por carnet.',
    to: '/dashboard/medical',
    icon: imgMedical,
    roles: STAFF,
    accent: 'from-sky-500 to-blue-700',
  },
  {
    title: 'Inventario',
    desc: 'Control de medicamentos, stock y recetas vinculadas.',
    to: '/dashboard/inventory',
    icon: imgInventory,
    roles: STAFF,
    accent: 'from-emerald-500 to-teal-700',
  },
  {
    title: 'Notificaciones',
    desc: 'Solicitudes de asistencia y respuestas del médico.',
    to: '/dashboard/notification',
    icon: imgNotification,
    roles: ALL,
    accent: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Emergencia',
    desc: 'Botón de emergencia total con zona del campus y GPS.',
    to: '/dashboard/emergency',
    icon: imgNotification,
    roles: [ROLES.STUDENT],
    accent: 'from-red-500 to-rose-700',
  },
  {
    title: 'Estado del personal',
    desc: 'Disponibilidad y ubicación de médicos en tiempo real.',
    to: '/dashboard/availability',
    icon: imgAvailability,
    roles: ALL,
    accent: 'from-indigo-500 to-violet-700',
  },
  {
    title: 'Usuarios',
    desc: 'Gestión de alumnos y personal médico del sistema.',
    to: '/dashboard/users',
    icon: imgUsers,
    roles: STAFF,
    accent: 'from-slate-600 to-slate-800',
  },
  {
    title: 'Mi perfil',
    desc: 'Datos de tu cuenta y ficha médica personal.',
    to: '/dashboard/profile',
    icon: imgUsers,
    roles: ALL,
    accent: 'from-cyan-500 to-blue-600',
  },
];

const PILLARS = [
  {
    title: 'Atención oportuna',
    text: 'Conecta estudiantes con el personal de enfermería cuando lo necesitan.',
  },
  {
    title: 'Historial digital',
    text: 'Consulta y registra atenciones, alergias y tratamientos con trazabilidad.',
  },
  {
    title: 'Emergencias',
    text: 'Alertas inmediatas a médicos y encargados con datos y ubicación.',
  },
  {
    title: 'Disponibilidad real',
    text: 'Visualiza qué médico está en servicio y dónde se encuentra en el campus.',
  },
];

export const HomeDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const staff = isStaff(user?.role);
  const roleLabel = getRoleLabel(user?.role);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  const cards = FEATURES.filter((f) => f.roles.includes(user?.role));

  return (
    <div className='animate-fadeIn max-w-6xl mx-auto space-y-8 pb-8'>
      {/* Hero */}
      <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#08316D] via-[#0a3d85] to-[#1e5bb8] text-white shadow-kinal'>
        <div className='absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl' />
        <div className='absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl' />
        <div className='absolute right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-white/5' />

        <div className='relative px-6 py-10 md:px-10 md:py-12 flex flex-col md:flex-row md:items-center gap-8'>
          <div className='flex-1 space-y-4'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase backdrop-blur-sm border border-white/20'>
              <span className='h-2 w-2 rounded-full bg-emerald-400 animate-pulse' />
              Fundación Kinal · Enfermería
            </div>
            <h1 className='text-3xl md:text-5xl font-black tracking-tight leading-tight'>
              Kinal Medic
            </h1>
            <p className='text-base md:text-lg text-blue-100 max-w-xl leading-relaxed'>
              Plataforma integral para la{' '}
              <strong className='text-white'>gestión de enfermería institucional</strong>:
              historiales clínicos, inventario de medicamentos, alertas de
              emergencia y disponibilidad del personal médico en tiempo real.
            </p>
            <p className='text-sm md:text-base text-blue-50/90'>
              {greeting},{' '}
              <span className='font-bold text-white'>{user?.name || 'usuario'}</span>
              {' · '}
              <span className='rounded-md bg-white/15 px-2 py-0.5 text-xs font-semibold'>
                {roleLabel}
              </span>
            </p>
          </div>

          <div className='flex flex-col items-center justify-center shrink-0'>
            <div className='rounded-3xl bg-white/95 p-5 shadow-2xl border border-white/40'>
              <img
                src={logo}
                alt='Logo Kinal Medic'
                className='h-28 w-auto object-contain md:h-32'
              />
            </div>
            <p className='mt-3 text-xs text-blue-100/80 font-medium tracking-wide'>
              Salud escolar digital
            </p>
          </div>
        </div>
      </section>

      {/* Para qué sirve */}
      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='h-1.5 w-12 rounded-full bg-gradient-to-r from-[#08316D] to-sky-400 mb-4' />
            <h3 className='font-bold text-[#08316D] text-base mb-1.5'>{p.title}</h3>
            <p className='text-sm text-gray-500 leading-relaxed'>{p.text}</p>
          </div>
        ))}
      </section>

      {/* Accesos rápidos */}
      <section>
        <div className='flex items-end justify-between mb-4 gap-3'>
          <div>
            <h2 className='text-xl md:text-2xl font-black text-gray-900'>
              Panel principal
            </h2>
            <p className='text-sm text-gray-500 mt-0.5'>
              Accede a los módulos disponibles para tu rol
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className='group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'
            >
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${card.accent}`}
              />
              <div className='p-5 flex gap-4 items-start'>
                <div className='rounded-xl bg-slate-50 border border-gray-100 p-3 group-hover:scale-105 transition-transform'>
                  <img
                    src={card.icon}
                    alt=''
                    className='h-9 w-9 object-contain'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-bold text-gray-900 group-hover:text-[#08316D] transition-colors'>
                    {card.title}
                  </h3>
                  <p className='text-sm text-gray-500 mt-1 leading-snug'>
                    {card.desc}
                  </p>
                  <span className='inline-block mt-3 text-xs font-bold text-[#08316D] uppercase tracking-wide'>
                    Abrir →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mensaje según rol */}
      <section className='rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-6 md:p-8'>
        <h2 className='text-lg font-black text-[#08316D] mb-2'>
          {user?.role === ROLES.PRINCIPAL
            ? 'Como Administrador Principal'
            : staff
              ? 'Como personal médico'
              : 'Como estudiante'}
        </h2>
        <p className='text-sm md:text-base text-slate-600 leading-relaxed max-w-3xl'>
          {user?.role === ROLES.PRINCIPAL
            ? 'Tienes control total del sistema: crear médicos y estudiantes, modificar o eliminar cualquier usuario, gestionar inventario, registros clínicos y notificaciones. No tienes estado de profesor (solo los médicos).'
            : staff
              ? 'Puedes registrar atenciones clínicas, administrar inventario, ver alertas y actualizar solo tu disponibilidad en el campus. En usuarios ves estudiantes y tu perfil; solo el Admin Principal crea médicos.'
              : 'Puedes solicitar atención médica o activar una emergencia total, ver qué médicos están en servicio y consultar tu perfil con datos médicos relevantes para tu atención.'}
        </p>
      </section>
    </div>
  );
};
