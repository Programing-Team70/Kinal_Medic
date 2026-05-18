import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateStudentModal } from './CreateUserModal.jsx';
import { showError } from '../../../shared/utils/toast.js';
import { showSuccess } from '../../../shared/utils/toast.js';

const PAGE_SIZE = 8;

export const Users = () => {
  const { users, loading, error, getAllUsers } = useUserManagementStore();
  const registerUser = useAuthStore((state) => state.register);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const carnet = (u.carnet || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const carrera = (u.carrera || '').toLowerCase(); 
      const role = (u.role || '').toUpperCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        carnet.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        carrera.includes(normalizedSearch); 

      const matchesRole = roleFilter === 'ALL' ? true : role === roleFilter.toUpperCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const handleCreate = async (formData) => {
    const res = await registerUser(formData);
    if (res.success) {
      showSuccess('Usuario creado correctamente');
      await getAllUsers(undefined, { force: true });
      return true;
    }
    showError(res.error || 'No se pudo crear el usuario');
    return false;
  };

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-main-blue'>Admin y Estudiantes</h1>
          <p className='text-gray-500 text-sm'>Gestión de registros de Kinal Medic</p>
        </div>

        <button
          className='bg-main-blue px-4 py-2 rounded text-white hover:opacity-90 transition'
          onClick={() => setOpenCreateModal(true)}
        >
          + Agregar Nuevo Usuario
        </button>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Buscar por nombre, carnet, carrera o email...'
            className='md:col-span-2 w-full px-3 py-2 border rounded-lg'
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className='w-full px-3 py-2 border rounded-lg'
          >
            <option value='ALL'>Todos los roles</option>
            <option value='ADMIN_ROLE'>Administradores</option>
            <option value='STUDENT_ROLE'>Estudiantes</option>
          </select>
        </div>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            {/* --- CABECERAS CON TODOS LOS DATOS EXPANDIDOS --- */}
            <thead className='bg-gray-50 text-gray-700 border-b'>
              <tr>
                <th className='text-left px-4 py-3'>Nombre Completo</th>
                <th className='text-left px-4 py-3'>Carnet</th>
                <th className='text-left px-4 py-3'>Carrera / Especialidad</th>
                <th className='text-left px-4 py-3'>Correo Electrónico</th>
                <th className='text-left px-4 py-3'>Rol</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td className='px-4 py-6 text-center text-gray-500' colSpan={5}>
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u._id} className='border-t hover:bg-gray-50 transition-colors'>
                    
                    {/* 1. Nombre Completo */}
                    <td className='px-4 py-3 font-medium text-gray-800'>
                      {u.name}
                    </td>

                    {/* 2. Carnet (Validando si no aplica por ser Admin) */}
                    <td className='px-4 py-3 text-gray-700 font-mono'>
                      {u.role === 'STUDENT_ROLE' ? (
                        <span className='bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-xs'>
                          {u.carnet}
                        </span>
                      ) : (
                        <span className='text-gray-400 italic text-xs'>N/A (Admin)</span>
                      )}
                    </td>

                    {/* 3. Carrera */}
                    <td className='px-4 py-3 text-gray-600'>
                      {u.role === 'STUDENT_ROLE' ? (
                        u.carrera || <span className='text-gray-400 italic text-xs'>No asignada</span>
                      ) : (
                        <span className='text-gray-400 italic text-xs'>Personal Técnico</span>
                      )}
                    </td>

                    {/* 4. Email */}
                    <td className='px-4 py-3 text-gray-600'>
                      {u.email}
                    </td>

                    {/* 5. Rol */}
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN_ROLE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINACIÓN --- */}
        <div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50'>
          <p className='text-xs text-gray-600'>
            Página {currentPage} de {totalPages}
          </p>

          <div className='flex gap-2'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='px-3 py-1.5 rounded border bg-white text-sm disabled:opacity-50'
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='px-3 py-1.5 rounded border bg-white text-sm disabled:opacity-50'
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <CreateStudentModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={handleCreate}
        loading={loading}
      />
    </div>
  );
};