import { useEffect, useMemo, useState } from 'react';
import { useNotificationStore } from '../store/notificationStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import { RequestsPanel } from './RequestsPanel.jsx';
import { isStaff, isStudent, ROLES } from '../../../shared/utils/roles.js';

const URGENCIA_OPTS = [
  { value: 'LEVE', label: 'Leve', color: 'text-yellow-600', border: 'border-yellow-400', bg: 'bg-yellow-50' },
  { value: 'MODERADA', label: 'Moderada', color: 'text-orange-500', border: 'border-orange-400', bg: 'bg-orange-50' },
];

export const Notification = () => {
  const user = useAuthStore((s) => s.user);
  const {
    loading,
    sendMedicalAlert,
    fetchMedics,
    fetchProfile,
    fetchRequests,
    medics,
    medicsLoading,
    profile,
    requests,
    requestsLoading,
  } = useNotificationStore();

  const [selectedMedicEmails, setSelectedMedicEmails] = useState([]);
  const [customEmail, setCustomEmail] = useState('');
  const [urgencia, setUrgencia] = useState('LEVE');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const role = user?.role;
  const studentMode = isStudent(role);
  const staffMode = isStaff(role);

  useEffect(() => {
    fetchRequests();
    if (studentMode) {
      fetchMedics();
      fetchProfile();
    }
    const interval = setInterval(fetchRequests, 25000);
    return () => clearInterval(interval);
  }, [fetchMedics, fetchProfile, fetchRequests, studentMode]);

  const student = useMemo(() => {
    const src = profile || user || {};
    return {
      name: src.name || user?.name || '',
      carnet: src.carnet || user?.carnet || '',
      email: src.email || user?.email || '',
      educationLevel: src.educationLevel || user?.educationLevel || '',
      carrera: src.carrera || user?.carrera || '',
      seccion: src.seccion || user?.seccion || '',
      hasAllergies: src.hasAllergies ?? user?.hasAllergies ?? false,
      allergies: src.allergies || user?.allergies || '',
      guardianEmail: src.guardianEmail || user?.guardianEmail || '',
    };
  }, [profile, user]);

  const toggleMedic = (email) => {
    setSelectedMedicEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
    if (errors.recipients) setErrors((p) => ({ ...p, recipients: '' }));
  };

  const studentPayload = () => ({
    studentName: student.name,
    studentCarnet: student.carnet,
    studentEmail: student.email,
    educationLevel: student.educationLevel,
    carrera: student.carrera,
    seccion: student.seccion,
    hasAllergies: student.hasAllergies,
    allergies: student.allergies,
    guardianEmail: student.guardianEmail,
  });

  const validateRequest = () => {
    const e = {};
    if (!studentMode) {
      e.student = 'Solo los estudiantes envían solicitudes desde aquí.';
    }
    if (!student.name || !student.carnet) {
      e.student = 'No se pudieron cargar tus datos. Revisa tu perfil o vuelve a iniciar sesión.';
    }
    if (!description.trim()) e.description = 'La descripción es requerida';
    else if (description.trim().length < 10)
      e.description = 'La descripción debe tener al menos 10 caracteres';

    const hasCustom =
      customEmail.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail.trim());
    if (customEmail.trim() && !hasCustom) {
      e.customEmail = 'Formato de correo inválido';
    }
    if (selectedMedicEmails.length === 0 && !hasCustom) {
      e.recipients =
        'Selecciona al menos un médico o escribe un correo de destino.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRequest();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await sendMedicalAlert({
      ...studentPayload(),
      doctorEmails: selectedMedicEmails,
      customEmail: customEmail.trim() || undefined,
      description: description.trim(),
      urgency: urgencia,
    });

    if (result.success) {
      showSuccess(result.message || '¡Solicitud enviada!');
      setSubmitted(true);
      setDescription('');
      setCustomEmail('');
      setSelectedMedicEmails([]);
      setUrgencia('LEVE');
      setErrors({});
      setTimeout(() => setSubmitted(false), 6000);
    } else {
      showError(result.message);
    }
  };

  const selectedUrgencia = URGENCIA_OPTS.find((o) => o.value === urgencia);

  return (
    <div className='p-4 max-w-3xl mx-auto animate-fadeIn space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-main-blue'>Notificaciones</h1>
        <p className='text-gray-500 text-sm mt-1'>
          {studentMode
            ? 'Envía una solicitud de asistencia y revisa la respuesta del médico aquí.'
            : staffMode
              ? role === ROLES.PRINCIPAL
                ? 'Bandeja de todas las solicitudes del sistema. Puedes responder y el alumno la verá en la app y por correo.'
                : 'Solicitudes de alumnos dirigidas a tu correo. Responde aquí; el estudiante lo verá en Notificaciones y en su correo institucional.'
              : 'Módulo de alertas Kinal Medic.'}
        </p>
      </div>

      {/* Bandeja / historial */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='font-bold text-main-blue text-lg'>
            {staffMode ? 'Solicitudes recibidas' : 'Mis solicitudes y respuestas'}
          </h2>
          <button
            type='button'
            onClick={() => fetchRequests()}
            className='text-xs font-semibold text-main-blue hover:underline'
          >
            Actualizar
          </button>
        </div>
        <RequestsPanel
          mode={staffMode ? 'staff' : 'student'}
          requests={requests}
          loading={requestsLoading}
        />
      </section>

      {/* Formulario solo estudiantes */}
      {studentMode && (
        <>
          {submitted && (
            <div className='flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4'>
              <div>
                <p className='font-semibold text-green-800'>Solicitud enviada</p>
                <p className='text-green-700 text-sm'>
                  El médico recibió tu mensaje. Cuando responda, verás su
                  indicación en esta misma página y en tu correo.
                </p>
              </div>
            </div>
          )}

          <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-6'>
            <div className='flex items-center gap-2 mb-5 pb-4 border-b border-gray-100'>
              <h2 className='font-bold text-main-blue text-lg'>
                Nueva solicitud de asistencia
              </h2>
            </div>
            <p className='text-xs text-gray-500 mb-4'>
              Tus datos se toman de tu perfil automáticamente (no hace falta
              reescribirlos aquí). Para emergencias graves usa el menú{' '}
              <strong>Emergencia</strong>.
            </p>

            {errors.student && (
              <p className='text-red-500 text-xs mb-3'>{errors.student}</p>
            )}

            <form onSubmit={handleSubmit} noValidate className='space-y-5'>
              <div>
                <div className='flex flex-wrap items-center justify-between gap-2 mb-2'>
                  <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                    Médicos / personal de enfermería *
                  </label>
                  <div className='flex gap-2 text-xs'>
                    <button
                      type='button'
                      onClick={() =>
                        setSelectedMedicEmails(
                          medics.map((m) => m.email).filter(Boolean)
                        )
                      }
                      className='text-main-blue font-semibold hover:underline'
                    >
                      Seleccionar todos
                    </button>
                    <button
                      type='button'
                      onClick={() => setSelectedMedicEmails([])}
                      className='text-gray-500 font-semibold hover:underline'
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {medicsLoading ? (
                  <p className='text-sm text-gray-500'>Cargando médicos...</p>
                ) : medics.length === 0 ? (
                  <p className='text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3'>
                    No hay médicos registrados. Usa el correo personalizado.
                  </p>
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {medics.map((medic) => {
                      const active = selectedMedicEmails.includes(medic.email);
                      return (
                        <label
                          key={medic.id || medic.email}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                            active
                              ? 'border-main-blue bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type='checkbox'
                            checked={active}
                            onChange={() => toggleMedic(medic.email)}
                            className='mt-1'
                          />
                          <span>
                            <span className='block text-sm font-semibold text-gray-900'>
                              {medic.name}
                            </span>
                            <span className='block text-xs text-gray-500 break-all'>
                              {medic.email}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors.recipients && (
                  <p className='text-red-500 text-xs mt-1'>{errors.recipients}</p>
                )}
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>
                  Correo adicional (opcional)
                </label>
                <input
                  type='email'
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (errors.customEmail || errors.recipients) {
                      setErrors((p) => ({
                        ...p,
                        customEmail: '',
                        recipients: '',
                      }));
                    }
                  }}
                  placeholder='otro.medico@kinal.edu.gt'
                  className={`kinal-input w-full ${errors.customEmail ? 'border-red-400' : ''}`}
                />
                {errors.customEmail && (
                  <p className='text-red-500 text-xs mt-1'>{errors.customEmail}</p>
                )}
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                  Nivel de urgencia *
                </label>
                <div className='flex gap-3 flex-wrap'>
                  {URGENCIA_OPTS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                        urgencia === opt.value
                          ? `${opt.border} ${opt.bg}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type='radio'
                        name='urgencia'
                        value={opt.value}
                        checked={urgencia === opt.value}
                        onChange={() => setUrgencia(opt.value)}
                        className='sr-only'
                      />
                      <span className={`font-semibold text-sm ${opt.color}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>
                  ¿Por qué solicitas atención? *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description)
                      setErrors((p) => ({ ...p, description: '' }));
                  }}
                  rows={4}
                  placeholder='Describe síntomas o el motivo (mín. 10 caracteres)...'
                  className={`kinal-input w-full resize-none ${
                    errors.description ? 'border-red-400' : ''
                  }`}
                />
                {errors.description && (
                  <p className='text-red-500 text-xs mt-1'>{errors.description}</p>
                )}
              </div>

              {description.trim().length >= 10 && (
                <div className='p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600'>
                  <strong>Urgencia:</strong>{' '}
                  <span className={selectedUrgencia?.color}>
                    {selectedUrgencia?.label}
                  </span>
                  <br />
                  <span className='italic'>"{description}"</span>
                </div>
              )}

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={loading}
                  className='btn-kinal-primary min-w-[200px] disabled:opacity-50'
                >
                  {loading ? 'Enviando...' : 'Enviar solicitud médica'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
