import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import { ROLES } from '../../utils/roles.js';

import imgLogoHome from '../../../assets/img/LogoMedic.png';
import imgMedical from '../../../assets/img/Registro_Medico.png';
import imgInventory from '../../../assets/img/Inventario.png';
import imgNotification from '../../../assets/img/Notificación.png';
import imgAvailability from '../../../assets/img/Estado_Profesor.png';
import imgUsers from '../../../assets/img/Usuarios.png';

const ALL = [ROLES.PRINCIPAL, ROLES.MEDIC, ROLES.STUDENT];
const STAFF = [ROLES.PRINCIPAL, ROLES.MEDIC];
const STUDENT = [ROLES.STUDENT];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const allItems = [
    { label: 'Inicio', to: '/dashboard', icon: imgLogoHome, roles: ALL, exact: true },
    { label: 'Registro Médico', to: '/dashboard/medical', icon: imgMedical, roles: STAFF },
    { label: 'Inventario Médico', to: '/dashboard/inventory', icon: imgInventory, roles: STAFF },
    { label: 'Notificaciones', to: '/dashboard/notification', icon: imgNotification, roles: ALL },
    { label: 'Emergencia', to: '/dashboard/emergency', icon: imgNotification, roles: STUDENT },
    { label: 'Estado de Profesor', to: '/dashboard/availability', icon: imgAvailability, roles: ALL },
    { label: 'Usuarios', to: '/dashboard/users', icon: imgUsers, roles: STAFF },
    { label: 'Mi Perfil', to: '/dashboard/profile', icon: imgUsers, roles: ALL },
  ];

  const allowedItems = allItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className='w-60 bg-transparent min-h-[calc(100vh-4rem)] p-4'>
      <ul className='space-y-1'>
        {allowedItems.map((item) => {
          const active = item.exact
            ? location.pathname === item.to || location.pathname === '/dashboard/'
            : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors sidebar-underline ${
                  active
                    ? 'active text-main-blue bg-blue-50/50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={active ? { fontWeight: 700 } : {}}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`h-5 w-5 object-contain transition-transform ${active ? 'scale-110' : 'opacity-80'}`}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
