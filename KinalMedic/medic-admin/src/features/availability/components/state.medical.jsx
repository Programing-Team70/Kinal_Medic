import { useState } from 'react';
import { useAvailabilityStore } from '../store/availabilityStore';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import defaultDoctor from '../../../assets/img/LogoMedic.png';

export const TeacherCard = ({ teacher }) => {
    const token = useAuthStore((state) => state.token);
    const { updateTeacherStatus, getStatusBadge, getStatusText, getLocalAvatarUrl, formatTimeAgo } = useAvailabilityStore();

    const [isEditing, setIsEditing] = useState(false);
    const [inputStatus, setInputStatus] = useState(String(teacher.currentStatus));
    const [inputLocation, setInputLocation] = useState(teacher.locationDescription || '');

    const currentId = teacher.id || teacher.teacherId;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await updateTeacherStatus(teacher.teacherName, inputStatus, inputLocation, token);
        if (success) setIsEditing(false);
    };

    return (
        <div className='bg-white p-10 md:p-12 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between min-h-[380px] relative overflow-hidden'>
            <div>
                <div className='flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left'>
                    <div className='relative flex-shrink-0 mx-auto sm:mx-0'>
                        <img
                            src={getLocalAvatarUrl(teacher.teacherName)}
                            alt={`Avatar de ${teacher.teacherName}`}
                            className='w-28 h-28 rounded-2xl bg-slate-50 border-2 border-gray-200 p-1.5 object-cover shadow-md'
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultDoctor; }}
                        />
                        <span className='absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full shadow'></span>
                    </div>
                    <div className='w-full'>
                        <h3 className='text-2xl md:text-3xl font-black text-gray-800 tracking-tight mb-2'>
                            {teacher.teacherName || 'Profesor Médico'}
                        </h3>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className='text-sm font-bold text-blue-600 hover:text-blue-800 underline transition duration-150'
                        >
                            {isEditing ? 'Cancelar la actualización' : 'Actualizar ubicación del Médico'}
                        </button>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className='bg-slate-50 p-6 rounded-2xl border border-gray-200 mb-6 space-y-4 shadow-inner custom-fade'>
                        <h4 className='text-sm font-black text-gray-700 uppercase tracking-wider mb-2'>Panel de Actualización Rápida</h4>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>Selecciona tu estado:</label>
                            <select value={inputStatus} onChange={(e) => setInputStatus(e.target.value)} className='w-full p-2.5 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none'>
                                <option value="1">Disponible</option>
                                <option value="0">En Enfermería</option>
                                <option value="5">En el Parqueo / Fuera</option>
                                <option value="2">Ocupado</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-bold text-gray-600 uppercase mb-1'>¿Dónde te encuentras?</label>
                            <input type="text" value={inputLocation} onChange={(e) => setInputLocation(e.target.value)} placeholder="Ej: Aula 402, Módulo B" className='w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium' />
                        </div>
                        <button type="submit" className='w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow uppercase tracking-wider'>Guardar Cambios</button>
                    </form>
                ) : (
                    <div className='mb-8 flex w-full'>
                        <span className={`w-full text-center block px-6 py-4 rounded-2xl text-xl font-black uppercase tracking-widest ${getStatusBadge(teacher.currentStatus)}`}>
                            {getStatusText(teacher.currentStatus)}
                        </span>
                    </div>
                )}

                <div className='space-y-4 pt-6 border-t border-gray-100 text-lg text-gray-600'>
                    <div className='flex items-start gap-4'>
                        <svg className='w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                        </svg>
                        <p className='text-gray-700 leading-relaxed text-base md:text-lg'>
                            <span className='font-extrabold text-gray-800'>Ubicación:</span> {teacher.locationDescription || 'No especificada'}
                        </p>
                    </div>
                    <div className='flex items-center gap-4 text-sm md:text-base text-gray-500 font-semibold'>
                        <svg className='w-6 h-6 text-gray-400 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18' />
                        </svg>
                        <p><span className='font-bold text-gray-600'>Sincronizado:</span> {formatTimeAgo(teacher.lastUpdate)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};