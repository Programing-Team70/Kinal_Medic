import { useState } from 'react';
import { useNotificationStore } from '../store/notificationStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

const typeLabel = (type) =>
  type === 'EMERGENCY' ? 'Emergencia' : 'Solicitud médica';

const statusBadge = (status) =>
  status === 'RESPONDED'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-amber-100 text-amber-800';

/**
 * @param {'student'|'staff'} mode
 * student: ve respuestas del médico
 * staff: bandeja + formulario de respuesta
 */
export const RequestsPanel = ({ mode = 'student', requests = [], loading }) => {
  const respondToRequest = useNotificationStore((s) => s.respondToRequest);
  const respondLoading = useNotificationStore((s) => s.respondLoading);
  const [drafts, setDrafts] = useState({});
  const [openId, setOpenId] = useState(null);

  const handleRespond = async (id) => {
    const message = (drafts[id] || '').trim();
    if (message.length < 5) {
      showError('Escribe al menos 5 caracteres (ej. Presentarse a las 4 pm en enfermería).');
      return;
    }
    const res = await respondToRequest(id, message);
    if (res.success) {
      showSuccess(res.message);
      setDrafts((p) => ({ ...p, [id]: '' }));
      setOpenId(null);
    } else {
      showError(res.message);
    }
  };

  if (loading) {
    return (
      <p className='text-sm text-gray-500 animate-pulse'>
        Cargando solicitudes...
      </p>
    );
  }

  if (!requests.length) {
    return (
      <div className='rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500'>
        {mode === 'staff'
          ? 'Aún no hay solicitudes dirigidas a ti.'
          : 'Aún no has enviado solicitudes. Cuando un médico responda, verás su mensaje aquí.'}
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {requests.map((req) => {
        const id = req._id;
        const isOpen = openId === id;
        const responded = req.status === 'RESPONDED' && req.response?.message;

        return (
          <div
            key={id}
            className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3'
          >
            <div className='flex flex-wrap items-start justify-between gap-2'>
              <div>
                <div className='flex flex-wrap items-center gap-2 mb-1'>
                  <span className='text-xs font-black uppercase tracking-wide text-main-blue'>
                    {typeLabel(req.type)}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge(
                      req.status
                    )}`}
                  >
                    {req.status === 'RESPONDED' ? 'Respondida' : 'Pendiente'}
                  </span>
                  <span className='text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>
                    {req.urgency}
                  </span>
                </div>
                {mode === 'staff' && (
                  <p className='text-sm font-bold text-gray-900'>
                    {req.studentName}{' '}
                    <span className='font-mono text-xs text-gray-500'>
                      ({req.studentCarnet})
                    </span>
                  </p>
                )}
                <p className='text-xs text-gray-400 mt-0.5'>
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleString('es-GT')
                    : ''}
                </p>
              </div>
            </div>

            <p className='text-sm text-gray-700 bg-slate-50 rounded-lg p-3 border border-slate-100'>
              {req.description}
            </p>

            {req.location?.campusZone && (
              <p className='text-xs text-blue-800 font-semibold'>
                📍 {req.location.campusZone}
                {req.location.detail ? ` — ${req.location.detail}` : ''}
              </p>
            )}

            {responded ? (
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3'>
                <p className='text-xs font-black uppercase text-emerald-800 mb-1'>
                  Respuesta del médico
                </p>
                <p className='text-sm text-emerald-900 whitespace-pre-wrap font-medium'>
                  {req.response.message}
                </p>
                <p className='text-xs text-emerald-700/80 mt-2'>
                  {req.response.doctorName}
                  {req.response.respondedAt
                    ? ` · ${new Date(req.response.respondedAt).toLocaleString('es-GT')}`
                    : ''}
                </p>
              </div>
            ) : mode === 'staff' ? (
              <div>
                {!isOpen ? (
                  <button
                    type='button'
                    onClick={() => setOpenId(id)}
                    className='text-sm font-bold text-main-blue hover:underline'
                  >
                    Responder al estudiante →
                  </button>
                ) : (
                  <div className='space-y-2 border-t border-gray-100 pt-3'>
                    <label className='block text-xs font-semibold text-gray-500 uppercase'>
                      Tu respuesta (la verá el alumno en la app y por correo)
                    </label>
                    <textarea
                      value={drafts[id] || ''}
                      onChange={(e) =>
                        setDrafts((p) => ({ ...p, [id]: e.target.value }))
                      }
                      rows={3}
                      placeholder='Ej. Preséntese a las 4:00 pm en la enfermería. Traiga carnet.'
                      className='w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none'
                    />
                    <div className='flex gap-2 justify-end'>
                      <button
                        type='button'
                        onClick={() => setOpenId(null)}
                        className='px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600'
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        disabled={respondLoading}
                        onClick={() => handleRespond(id)}
                        className='px-4 py-1.5 text-sm rounded-lg bg-main-blue text-white font-bold disabled:opacity-50'
                      >
                        {respondLoading ? 'Enviando...' : 'Enviar respuesta'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className='text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2'>
                Esperando respuesta del personal médico…
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
