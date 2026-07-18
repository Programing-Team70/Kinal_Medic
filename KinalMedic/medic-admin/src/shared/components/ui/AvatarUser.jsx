import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import medicAvatarImg from '../../../assets/img/LogoMedic.png';
import studentAvatarImg from '../../../assets/img/Logo_Estudiante.png';
import { isStaff, isStudent, roleLabel } from '../../utils/roles.js';

export const AvatarUser = () => {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const defaultAvatar = isStudent(user?.role) ? studentAvatarImg : medicAvatarImg;

  const avatarSrc =
    user?.profilePicture && user.profilePicture.trim() !== ''
      ? user.profilePicture
      : defaultAvatar;

  const displayName = user?.name || user?.username || 'Usuario Kinal';

  return (
    <div className='relative' ref={dropdownRef}>
      <div 
        onClick={toggleMenu}
        className='flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition duration-150 select-none'
      >
        <img
          src={avatarSrc}
          alt={displayName}
          className='w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow-sm'
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
        <span className="text-sm font-bold text-gray-700 hidden md:block max-w-[150px] truncate">
          {displayName}
        </span>
      </div>

      {open && (
        <div className='absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl animate-fadeIn z-50 overflow-hidden'>
          
          <div className='p-5 bg-gradient-to-b from-slate-50 to-white border-b border-gray-100 flex flex-col items-center text-center'>
            <img
              src={avatarSrc}
              alt={displayName}
              className='w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mb-3'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            <p className='font-black text-gray-800 text-base leading-tight tracking-tight max-w-full truncate'>
              {displayName}
            </p>
            <p className='text-xs text-gray-500 truncate w-full mb-3 font-medium'>
              {user?.email || 'correo@kinal.edu.gt'}
            </p>

            {user?.role && (
              <span className='px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100 shadow-sm'>
                {roleLabel(user.role)}
              </span>
            )}
          </div>

          <ul className='p-2 text-sm text-gray-700 font-bold space-y-1'>
            <li>
              <Link 
                to='/dashboard' 
                onClick={() => setOpen(false)}
                className='flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 text-gray-700 transition duration-150'
              >
                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' />
                </svg>
                Dashboard
              </Link>
            </li>

            {isStaff(user?.role) && (
              <li>
                <Link 
                  to='/dashboard/users' 
                  onClick={() => setOpen(false)}
                  className='flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 text-gray-700 transition duration-150'
                >
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
                  </svg>
                  Gestión de Usuarios
                </Link>
              </li>
            )}

            <div className='h-[1px] bg-gray-100 my-1 mx-2'></div>

            <li>
              <button
                onClick={handleLogout}
                className='flex items-center gap-3 w-full text-left p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition duration-150'
              >
                <svg className='w-5 h-5 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};