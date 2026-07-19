import { useEffect, useMemo, useState } from 'react';
import { useNotificationStore } from '../store/notificationStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import {
  CAMPUS_ZONES,
  getBrowserGps,
  buildLocationPayload,
} from '../../../shared/utils/location.js';
import { isStudent } from '../../../shared/utils/roles.js';

const EMERGENCY_COOLDOWN_MS = 60_000;

export const EmergencyPage = () => {
  const user = useAuthStore((s) => s.user);
  const {
    emergencyLoading,
    sendEmergencyAlert,
    fetchMedics,
    fetchProfile,
    fetchRequests,
    medics,
    profile,
  } = useNotificationStore();

  const [campusZone, setCampusZone] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [note, setNote] = useState('');
  const [gps, setGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [confirmEmergency, setConfirmEmergency] = useState(false);
  const [emergencySubmitted, setEmergencySubmitted] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [errors, setErrors] = useState({});

  const studentMode = isStudent(user?.role);

  useEffect(() => {
    if (studentMode) {
      fetchMedics();
      fetchProfile();
    }
  }, [fetchMedics, fetchProfile, studentMode]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

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

  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const captureGps = async () => {
    setGpsStatus('loading');
    const result = await getBrowserGps(8000);
    if (result) {
      setGps(result);
      setGpsStatus('ok');
    } else {
      setGps(null);
      setGpsStatus('denied');
    }
    return result;
  };

  const openEmergencyConfirm = async () => {
    if (!studentMode) {
      showError('Solo los estudiantes pueden activar la emergencia total.');
      return;
    }
    if (!campusZone) {
      showError('Selecciona en qué zona del campus te encuentras.');
      setErrors((p) => ({
        ...p,
        campusZone: 'La zona del campus es obligatoria.',
      }));
      return;
    }
    setConfirmEmergency(true);
    captureGps();
  };

  const handleEmergency = async () => {
    if (!studentMode || !student.name || !student.carnet) {
      showError('No se pudieron cargar tus datos de alumno.');
      return;
    }
    if (cooldownLeft > 0) {
      showError(`Espera ${cooldownLeft}s antes de enviar otra emergencia.`);
      return;
    }
    if (!campusZone) {
      showError('Selecciona la zona del campus.');
      return;
    }

    let currentGps = gps;
    if (!currentGps) currentGps = await captureGps();

    const location = buildLocationPayload({
      campusZone,
      detail: locationDetail.trim(),
      gps: currentGps,
    });

    const allMedicEmails = [
      ...new Set(medics.map((m) => m.email).filter(Boolean)),
    ];

    const result = await sendEmergencyAlert({
      studentName: student.name,
      studentCarnet: student.carnet,
      studentEmail: student.email,
      educationLevel: student.educationLevel,
      carrera: student.carrera,
      seccion: student.seccion,
      hasAllergies: student.hasAllergies,
      allergies: student.allergies,
      guardianEmail: student.guardianEmail,
      doctorEmails: allMedicEmails,
      note: note.trim() || undefined,
      location,
    });

    setConfirmEmergency(false);

    if (result.success) {
      showSuccess(result.message || 'Emergencia enviada');
      setEmergencySubmitted(true);
      setCooldownUntil(Date.now() + EMERGENCY_COOLDOWN_MS);
      fetchRequests();
      setTimeout(() => setEmergencySubmitted(false), 8000);
    } else {
      showError(result.message);
    }
  };

  if (!studentMode) {
    return (
      <div className='p-6 max-w-xl mx-auto'>
        <h1 className='text-2xl font-bold text-red-700 mb-2'>Emergencia</h1>
        <p className='text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl p-4'>
          Este apartado es solo para <strong>estudiantes</strong>. Como personal
          médico, revisa las emergencias en <strong>Notificaciones</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className='p-4 max-w-3xl mx-auto animate-fadeIn space-y-6'>
      <div>
        <h1 className='text-3xl font-black text-red-700'>Emergencia</h1>
        <p className='text-gray-600 text-sm mt-1'>
          Usa este botón solo en casos graves. Se notifica a médicos y a tu
          encargado con tu ubicación en el campus.
        </p>
      </div>

      <div className='rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 shadow-sm space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
          <div>
            <h2 className='text-lg font-black text-red-700 flex items-center gap-2'>
              <span className='inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse' />
              Emergencia total
            </h2>
            <p className='text-sm text-red-800/80 mt-1 max-w-md'>
              Indica <strong>dónde estás</strong> y confirma. Los datos de tu
              perfil se envían automáticamente.
            </p>
          </div>
          <button
            type='button'
            disabled={emergencyLoading || cooldownLeft > 0}
            onClick={openEmergencyConfirm}
            className='shrink-0 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition'
          >
            {emergencyLoading
              ? 'Enviando...'
              : cooldownLeft > 0
                ? `Espera ${cooldownLeft}s`
                : '🚨 EMERGENCIA TOTAL'}
          </button>
        </div>

        <div>
          <label className='block text-xs font-bold text-red-800 uppercase tracking-wide mb-2'>
            ¿En qué zona del campus estás? *
          </label>
          <div className='flex flex-wrap gap-2'>
            {CAMPUS_ZONES.map((zone) => {
              const active = campusZone === zone;
              return (
                <button
                  key={zone}
                  type='button'
                  onClick={() => {
                    setCampusZone(zone);
                    setErrors((p) => ({ ...p, campusZone: '' }));
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    active
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-red-800 border-red-200 hover:border-red-400'
                  }`}
                >
                  {zone}
                </button>
              );
            })}
          </div>
          {errors.campusZone && (
            <p className='text-red-600 text-xs mt-1 font-medium'>
              {errors.campusZone}
            </p>
          )}
        </div>

        <div>
          <label className='block text-xs font-bold text-red-800 uppercase tracking-wide mb-1'>
            Detalle de ubicación (opcional)
          </label>
          <input
            type='text'
            value={locationDetail}
            onChange={(e) => setLocationDetail(e.target.value)}
            placeholder='Ej. gradas del Edificio C...'
            className='w-full px-3 py-2 text-sm border border-red-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-red-300'
          />
        </div>

        <div>
          <label className='block text-xs font-bold text-red-800 uppercase tracking-wide mb-1'>
            Nota breve (opcional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder='Qué está pasando (opcional)...'
            className='w-full px-3 py-2 text-sm border border-red-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-red-300 resize-none'
          />
        </div>

        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <button
            type='button'
            disabled={gpsStatus === 'loading'}
            onClick={captureGps}
            className='px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-800 font-semibold hover:bg-red-50 disabled:opacity-50'
          >
            {gpsStatus === 'loading' ? 'Obteniendo GPS...' : '📍 Actualizar GPS'}
          </button>
          {gpsStatus === 'ok' && gps && (
            <span className='text-green-700 font-semibold'>
              GPS listo (±{Math.round(gps.accuracy || 0)} m)
            </span>
          )}
          {gpsStatus === 'denied' && (
            <span className='text-amber-700'>
              GPS no disponible. Se enviará la zona del campus.
            </span>
          )}
        </div>

        {emergencySubmitted && (
          <p className='text-sm font-semibold text-red-800 bg-white/70 rounded-lg p-3 border border-red-200'>
            Emergencia enviada. Médicos y encargado fueron notificados. Revisa
            Notificaciones si hay respuesta del médico.
          </p>
        )}
      </div>

      {confirmEmergency && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto'>
            <h3 className='text-xl font-black text-red-700'>
              ¿Confirmar emergencia total?
            </h3>
            <p className='text-sm text-gray-600'>
              Se enviará un correo de emergencia a médicos ({medics.length}) y a
              tu encargado (
              {student.guardianEmail || (
                <span className='text-amber-600'>no registrado</span>
              )}
              ).
            </p>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm space-y-1'>
              <p className='font-bold text-blue-800'>📍 Ubicación</p>
              <p>
                <strong>Zona:</strong> {campusZone || '—'}
              </p>
              {locationDetail.trim() ? (
                <p>
                  <strong>Detalle:</strong> {locationDetail.trim()}
                </p>
              ) : null}
              <p>
                <strong>GPS:</strong>{' '}
                {gpsStatus === 'loading'
                  ? 'Obteniendo…'
                  : gps
                    ? `${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}`
                    : 'No disponible'}
              </p>
            </div>
            <div className='flex gap-2 justify-end pt-2'>
              <button
                type='button'
                onClick={() => setConfirmEmergency(false)}
                className='px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={handleEmergency}
                disabled={emergencyLoading || !campusZone}
                className='px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50'
              >
                {emergencyLoading ? 'Enviando...' : 'Sí, enviar emergencia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
