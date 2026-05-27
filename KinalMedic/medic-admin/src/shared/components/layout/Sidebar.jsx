import { Link, useLocation } from 'react-router-dom';

import imgMedical from '../../../assets/img/Registro_Medico.png';
import imgInventory from '../../../assets/img/Inventario.png';
import imgNotification from '../../../assets/img/Notificación.png';
import imgAvailability from '../../../assets/img/Estado_Profesor.png';
import imgUsers from '../../../assets/img/Usuarios.png';

export const Sidebar = () => {
  const location = useLocation();

  const items = [
    { label: 'Registro Médico', to: '/dashboard/medical', icon: imgMedical },
    { label: 'Inventario Médico', to: '/dashboard/inventory', icon: imgInventory },
    { label: 'Notificaciones', to: '/dashboard/notification', icon: imgNotification },
    { label: 'Estado de Profesor', to: '/dashboard/availability', icon: imgAvailability },
    { label: 'Usuarios', to: '/dashboard/users', icon: imgUsers },
  ];

  return (
    <aside className='w-60 bg-white min-h-[calc(100vh-4rem)] p-4 shadow-sm border-r border-gray-100'>
      <ul className='space-y-1'>
        {items.map((item) => {
          const active = location.pathname === item.to;

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
                {/* 5. ETIQUETA DE IMAGEN CONTROLADA CON TAILWIND */}
                <img 
                  src={item.icon} 
                  alt={item.label} 
          
                  className={`h-5 w-5 object-contain transition-transform ${active ? 'scale-110' : 'opacity-80'}`} 
                />
                
                {/* 6. NOMBRE DEL SERVICIO (LETRAS) */}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};