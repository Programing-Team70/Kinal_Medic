import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateStudentModal } from './CreateUserModal.jsx';
import { EditUserModal } from './EditUserModal.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';
import {
  ROLES,
  isPrincipal,
  isMedic,
  roleLabel,
  roleBadgeClass,
} from '../../../shared/utils/roles.js';

const PAGE_SIZE = 8;

export const Users = () => {
  const {
    users,
    loading,
    error,
    getAllUsers,
    updateUser,
    deleteUser,
  } = useUserManagementStore();
  const createUser = useAuthStore((state) => state.createUser);
  const currentUser = useAuthStore((state) => state.user);

  const canCreateMedic = isPrincipal(currentUser?.role);
  const canDeleteUsers = isPrincipal(currentUser?.role);
  const canEditAny = isPrincipal(currentUser?.role);
  const isMedicUser = isMedic(currentUser?.role);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const carnet = (u.carnet || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const carrera = (u.carrera || '').toLowerCase();
      const seccion = (u.seccion || '').toLowerCase();
      const level = (u.educationLevel || '').toLowerCase();
      const role = (u.role || '').toUpperCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        carnet.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        carrera.includes(normalizedSearch) ||
        seccion.includes(normalizedSearch) ||
        level.includes(normalizedSearch);

      const matchesRole =
        roleFilter === 'ALL' ? true : role === roleFilter.toUpperCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const canEditUser = (u) => {
    if (canEditAny) return true;
    // Médico: solo su propio perfil
    return String(u._id) === String(currentUser?.id);
  };

  const canDeleteUser = (u) => {
    if (!canDeleteUsers) return false;
    if (String(u._id) === String(currentUser?.id)) return false;
    if (u.role === ROLES.PRINCIPAL) return false;
    return true;
  };

  const handleCreate = async (formData) => {
    const res = await createUser(formData);
    if (res.success) {
      showSuccess('Usuario creado correctamente');
      await getAllUsers();
      return true;
    }
    showError(res.error || 'No se pudo crear el usuario');
    return false;
  };

  const handleUpdate = async (id, payload) => {
    const res = await updateUser(id, payload);
    if (res.success) {
      showSuccess(res.message || 'Usuario actualizado');
      return true;
    }
    showError(res.error || 'No se pudo actualizar');
    return false;
  };

  const handleDelete = async (u) => {
    if (!canDeleteUser(u)) {
      showError('No tienes permiso para eliminar este usuario.');
      return;
    }
    const ok = window.confirm(
      `¿Eliminar a "${u.name}"?\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;

    const res = await deleteUser(u._id);
    if (res.success) {
      showSuccess(res.message || 'Usuario eliminado');
    } else {
      showError(res.error || 'No se pudo eliminar');
    }
  };

  const levelLabel = (level) => {
    if (level === 'BASICO') return 'Básico';
    if (level === 'DIVERSIFICADO') return 'Diversificado';
    return level || '—';
  };

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className='p-4 relative z-[1]'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-main-blue'>
            {canCreateMedic ? 'Usuarios del sistema' : 'Estudiantes y mi perfil'}
          </h1>
          <p className='text-gray-500 text-sm'>
            {canCreateMedic
              ? 'Como Admin Principal puedes ver, crear, editar y eliminar a todos (médicos y estudiantes).'
              : 'Como médico ves a los estudiantes y tu propio perfil. Solo puedes editar tus datos y crear alumnos.'}
          </p>
        </div>

        <button
          className='bg-main-blue px-4 py-2 rounded text-white hover:opacity-90 transition'
          onClick={() => setOpenCreateModal(true)}
        >
          + Agregar Nuevo Usuario
        </button>
      </div>

      <div className='bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4 mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Buscar por nombre, carnet, sección, carrera o email...'
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
            {canCreateMedic && (
              <option value={ROLES.PRINCIPAL}>Admin Principal</option>
            )}
            {canCreateMedic && (
              <option value={ROLES.MEDIC}>Médico</option>
            )}
            <option value={ROLES.STUDENT}>Estudiantes</option>
            {isMedicUser && (
              <option value={ROLES.MEDIC}>Mi perfil (Médico)</option>
            )}
          </select>
        </div>
      </div>

      <div className='bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50/90 text-gray-700 border-b'>
              <tr>
                <th className='text-left px-4 py-3'>Nombre Completo</th>
                <th className='text-left px-4 py-3'>Carnet</th>
                <th className='text-left px-4 py-3'>Nivel</th>
                <th className='text-left px-4 py-3'>Carrera</th>
                <th className='text-left px-4 py-3'>Sección</th>
                <th className='text-left px-4 py-3'>Alergias</th>
                <th className='text-left px-4 py-3'>Encargado</th>
                <th className='text-left px-4 py-3'>Correo</th>
                <th className='text-left px-4 py-3'>Rol</th>
                <th className='text-left px-4 py-3'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td className='px-4 py-6 text-center text-gray-500' colSpan={10}>
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr
                    key={u._id}
                    className='border-t hover:bg-blue-50/40 transition-colors'
                  >
                    <td className='px-4 py-3 font-medium text-gray-800'>{u.name}</td>

                    <td className='px-4 py-3 text-gray-700 font-mono'>
                      {u.role === ROLES.STUDENT ? (
                        <span className='bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-xs'>
                          {u.carnet}
                        </span>
                      ) : (
                        <span className='text-gray-400 italic text-xs'>N/A</span>
                      )}
                    </td>

                    <td className='px-4 py-3 text-gray-600 text-xs'>
                      {u.role === ROLES.STUDENT
                        ? levelLabel(u.educationLevel)
                        : '—'}
                    </td>

                    <td className='px-4 py-3 text-gray-600'>
                      {u.role === ROLES.STUDENT ? (
                        u.educationLevel === 'BASICO' ? (
                          <span className='text-gray-400 italic text-xs'>
                            N/A (Básico)
                          </span>
                        ) : (
                          u.carrera || (
                            <span className='text-gray-400 italic text-xs'>
                              No asignada
                            </span>
                          )
                        )
                      ) : (
                        <span className='text-gray-400 italic text-xs'>
                          Personal
                        </span>
                      )}
                    </td>

                    <td className='px-4 py-3 text-gray-600'>
                      {u.role === ROLES.STUDENT ? u.seccion || '—' : '—'}
                    </td>

                    <td
                      className='px-4 py-3 text-gray-600 text-xs max-w-[140px] truncate'
                      title={u.allergies}
                    >
                      {u.role === ROLES.STUDENT
                        ? u.hasAllergies
                          ? u.allergies || 'Sí'
                          : 'Ninguna'
                        : '—'}
                    </td>

                    <td
                      className='px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate'
                      title={u.guardianEmail}
                    >
                      {u.role === ROLES.STUDENT ? u.guardianEmail || '—' : '—'}
                    </td>

                    <td className='px-4 py-3 text-gray-600'>{u.email}</td>

                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${roleBadgeClass(u.role)}`}
                      >
                        {roleLabel(u.role)}
                      </span>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2 whitespace-nowrap'>
                        {canEditUser(u) ? (
                          <button
                            type='button'
                            onClick={() => setEditUser(u)}
                            className='px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition'
                          >
                            Editar
                          </button>
                        ) : (
                          <span className='text-xs text-gray-400 italic'>Solo lectura</span>
                        )}
                        {canDeleteUser(u) && (
                          <button
                            type='button'
                            onClick={() => handleDelete(u)}
                            className='px-2.5 py-1 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 transition'
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50/90'>
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
        canCreateMedic={canCreateMedic}
      />

      <EditUserModal
        isOpen={Boolean(editUser)}
        user={editUser}
        onClose={() => setEditUser(null)}
        onUpdate={handleUpdate}
        loading={loading}
        canChangeRole={canCreateMedic}
        isSelf={editUser && String(editUser._id) === String(currentUser?.id)}
      />
    </div>
  );
};
