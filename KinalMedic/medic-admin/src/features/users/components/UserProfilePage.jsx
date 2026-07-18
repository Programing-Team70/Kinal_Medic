import { useEffect } from 'react';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import medicAvatarImg from '../../../assets/img/LogoMedic.png';
import studentAvatarImg from '../../../assets/img/Logo_Estudiante.png';
import { useUserManagementStore } from '../store/useUserManagementStore.js';

export const UserProfilePage = () => {
    const { user } = useAuthStore();

    const { users, getAllUsers } = useUserManagementStore();

    const isStudentUser = user?.role === 'STUDENT_ROLE';

    const defaultAvatar = isStudentUser ? studentAvatarImg : medicAvatarImg;

    const avatarSrc =
        user?.profilePicture && user.profilePicture.trim() !== ''
            ? user.profilePicture
            : defaultAvatar;

    const fullName = user?.name || user?.username || 'Usuario Kinal';

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />

            <div className="p-6 relative">
                <div className="absolute -top-16 left-6">
                    <img
                        src={avatarSrc}
                        alt={fullName}
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md bg-white"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                </div>

                <div className="ml-36 pt-2 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-gray-950 tracking-tight">{fullName}</h2>
                        <p className="text-sm text-gray-500 font-medium">{user?.email || 'No cuenta con correo registrado'}</p>
                    </div>
                    {/* Restaurado: Color azul clásico de Kinal Medic y rol exacto en mayúsculas */}
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-black uppercase tracking-wider">
                        {user?.role}
                    </span>
                </div>

                <hr className="my-6 border-gray-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isStudentUser && (
                        <>
                            <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Carnet Estudiantil</span>
                                <p className="text-gray-800 font-black text-base">
                                    {user?.carnet || 'Código No Asignado'}
                                </p>
                            </div>

                            <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nivel educativo</span>
                                <p className="text-gray-800 font-black text-base">
                                    {user?.educationLevel === 'BASICO'
                                        ? 'Básico'
                                        : user?.educationLevel === 'DIVERSIFICADO'
                                          ? 'Diversificado'
                                          : 'No especificado'}
                                </p>
                            </div>

                            {user?.educationLevel === 'DIVERSIFICADO' && (
                                <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Carrera / Especialidad
                                    </span>
                                    <p className="text-gray-800 font-black text-base">
                                        {user?.carrera || 'No especificada'}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sección</span>
                                <p className="text-gray-800 font-black text-base">
                                    {user?.seccion || 'No asignada'}
                                </p>
                            </div>

                            <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alergias</span>
                                <p className="text-gray-800 font-black text-base">
                                    {user?.hasAllergies
                                        ? user?.allergies || 'Sí (sin detalle)'
                                        : 'Ninguna'}
                                </p>
                            </div>

                            <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Correo del encargado
                                </span>
                                <p className="text-gray-800 font-black text-base break-all">
                                    {user?.guardianEmail || 'No registrado'}
                                </p>
                            </div>
                        </>
                    )}

                    {!isStudentUser && (
                        <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Área / Departamento
                            </span>
                            <p className="text-gray-800 font-black text-base">
                                {user?.role === 'ADMIN_PRINCIPAL'
                                  ? 'Administración general del sistema'
                                  : 'Enfermería / Personal médico'}
                            </p>
                        </div>
                    )}

                    <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Institución</span>
                        <p className="text-gray-800 font-bold text-base">Fundación Kinal</p>
                    </div>

                    <div className="space-y-1 bg-slate-50/60 p-4 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado de Cuenta</span>
                        <p className="text-green-600 font-black text-base flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Activo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};