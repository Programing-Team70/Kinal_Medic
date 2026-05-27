import { useEffect } from 'react';
import { useAvailabilityStore } from '../store/availabilityStore';
import { TeacherCard } from '../components/state.medical.jsx';

export const AvailabilityPage = () => {
    const { teachers, loading, fetchAvailability } = useAvailabilityStore();

    useEffect(() => {
        fetchAvailability();
        const interval = setInterval(fetchAvailability, 30000);
        return () => clearInterval(interval);
    }, [fetchAvailability]);

    return (
        <div className='p-8 max-w-7xl mx-auto animate-fadeIn'>
            <h1 className='text-3xl md:text-4xl font-black text-main-blue tracking-wide border-b-2 border-gray-200 pb-5 mb-10 uppercase text-center md:text-left'>
                Disponibilidad del Profesor Médico
            </h1>

            {loading ? (
                <div className='flex justify-center items-center h-96'>
                    <p className='text-xl text-gray-500 font-bold animate-pulse'>Sincronizando flujos de datos Kinal Medic...</p>
                </div>
            ) : teachers.length === 0 ? (
                <div className='bg-white p-16 rounded-3xl shadow-kinal text-center border border-gray-100 max-w-3xl mx-auto'>
                    <p className='text-xl text-gray-500 font-semibold'>No hay registros de disponibilidad activos en este bloque.</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto'>
                    {teachers.map((teacher) => (
                        <TeacherCard key={teacher.id || teacher.teacherId} teacher={teacher} />
                    ))}
                </div>
            )}
        </div>
    );
};