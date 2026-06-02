import { useState } from 'react';
import { useNotificationStore } from '../store/notificationStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

const URGENCIA_OPTS = [
  { value: 'LEVE', label: 'Leve', color: 'text-yellow-600' },
  { value: 'MODERADA', label: 'Moderada', color: 'text-orange-500' },
  { value: 'URGENTE', label: 'Urgente', color: 'text-red-600' },
];

export const Notification = () => {
  const { loading, sendMedicalAlert } = useNotificationStore();

  const [form, setForm] = useState({
    doctorEmail: '',
    studentName: '',
    studentCarnet: '',
    urgencia: 'LEVE',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.doctorEmail.trim()) e.doctorEmail = 'El correo del médico es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.doctorEmail))
      e.doctorEmail = 'Formato de correo inválido';
    if (!form.studentName.trim()) e.studentName = 'El nombre del estudiante es requerido';
    if (!form.studentCarnet.trim()) e.studentCarnet = 'El carnet es requerido';
    if (!form.description.trim()) e.description = 'La descripción es requerida';
    else if (form.description.trim().length < 10)
      e.description = 'La descripción debe tener al menos 10 caracteres';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const fullDescription = `[${form.urgencia}] ${form.description}`;
    const result = await sendMedicalAlert({
      doctorEmail: form.doctorEmail,
      studentName: form.studentName,
      studentCarnet: form.studentCarnet,
      description: fullDescription,
    });

    if (result.success) {
      showSuccess('¡Alerta médica enviada al doctor correctamente!');
      setSubmitted(true);
      setForm({ doctorEmail: '', studentName: '', studentCarnet: '', urgencia: 'LEVE', description: '' });
      setErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      showError(result.message);
    }
  };

  const selectedUrgencia = URGENCIA_OPTS.find((o) => o.value === form.urgencia);

  return (
    <div className="p-4 max-w-2xl mx-auto animate-fadeIn">
      {/* ── Header Título ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-main-blue">Notificaciones Médicas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Envía una alerta al Profesor Médico con los datos del estudiante que necesita atención.
        </p>
      </div>

      {/* ── Tarjeta de éxito en una alerta ── */}
      {submitted && (
        <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
          <span className="text-2xl">Listo</span>
          <div>
            <p className="font-semibold text-green-800">Alerta enviada correctamente</p>
            <p className="text-green-700 text-sm">
              El correo ha sido enviado al médico. El estudiante será atendido a la brevedad.
            </p>
          </div>
        </div>
      )}

      {/* ── Formulario ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-kinal p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <span className="text-xl">-</span>
          <h2 className="font-bold text-main-blue text-lg">Solicitud de Asistencia Médica</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Doctor Email */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Correo del Profesor Médico *
              </label>
              <input
                type="email"
                name="doctorEmail"
                value={form.doctorEmail}
                onChange={handleChange}
                placeholder="doctor@kinal.edu.gt"
                className={`kinal-input ${errors.doctorEmail ? 'border-red-400 focus:border-red-500' : ''}`}
              />
              {errors.doctorEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.doctorEmail}</p>
              )}
            </div>

            {/* Nombre Estudiante */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nombre del Estudiante *
              </label>
              <input
                type="text"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                placeholder="Juan Pérez García"
                className={`kinal-input ${errors.studentName ? 'border-red-400' : ''}`}
              />
              {errors.studentName && (
                <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>
              )}
            </div>

            {/* Carnet */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Carnet del Estudiante *
              </label>
              <input
                type="text"
                name="studentCarnet"
                value={form.studentCarnet}
                onChange={handleChange}
                placeholder="2026000"
                className={`kinal-input ${errors.studentCarnet ? 'border-red-400' : ''}`}
              />
              {errors.studentCarnet && (
                <p className="text-red-500 text-xs mt-1">{errors.studentCarnet}</p>
              )}
            </div>

            {/* Nivel de Urgencia */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Nivel de Urgencia *
              </label>
              <div className="flex gap-3 flex-wrap">
                {URGENCIA_OPTS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                      form.urgencia === opt.value
                        ? 'border-main-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgencia"
                      value={opt.value}
                      checked={form.urgencia === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`font-semibold text-sm ${opt.color}`}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Descripción de la urgencia *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe los síntomas o motivo de la solicitud médica con el mayor detalle posible..."
                className={`kinal-input resize-none ${errors.description ? 'border-red-400' : ''}`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-red-500 text-xs">{errors.description}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">{form.description.length} caracteres</span>
              </div>
            </div>
          </div>

          {/* Preview del email */}
          {form.studentName && form.description && (
            <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 animate-fadeIn">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Vista previa del correo</p>
              <p className="text-sm text-gray-600">
                <strong>Para:</strong> {form.doctorEmail || '—'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Asunto:</strong> URGENTE: Solicitud de asistencia -{' '}
                {form.studentName || '—'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Urgencia:</strong>{' '}
                <span className={selectedUrgencia?.color}>{selectedUrgencia?.label}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1 italic">
                "{form.description}"
              </p>
            </div>
          )}

          {/* Botón */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-kinal-primary min-w-[200px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Enviando alerta...
                </>
              ) : (
                <>Enviar Alerta Médica</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Info card ── */}
      <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <span className="text-xl">i</span>
        <div>
          <p className="font-semibold text-blue-800 text-sm">¿Cómo funciona?</p>
          <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
            Al enviar el formulario, el sistema envía un correo electrónico al Profesor Médico
            indicado con los datos del estudiante y la descripción del problema. El médico
            recibirá la alerta de inmediato en su bandeja de entrada.
          </p>
        </div>
      </div>
    </div>
  );
};
