import transporter from '../../config/nodemailer.js';

const EMAIL_FROM = () => `"KINAL MEDIC" <${process.env.EMAIL_USER}>`;

const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const urgencyStyles = {
    LEVE: { color: '#ca8a04', bg: '#fefce8', border: '#facc15', label: 'LEVE' },
    MODERADA: { color: '#ea580c', bg: '#fff7ed', border: '#fb923c', label: 'MODERADA' },
    EMERGENCIA: { color: '#dc2626', bg: '#fef2f2', border: '#ef4444', label: 'EMERGENCIA GRAVE' },
};

const studentBlock = (student = {}) => `
  <div style="background:#f8fafc;padding:14px 16px;border-radius:8px;border-left:4px solid #08316D;margin:12px 0;">
    <p style="margin:4px 0;"><strong>Estudiante:</strong> ${escapeHtml(student.name || '—')}</p>
    <p style="margin:4px 0;"><strong>Carnet:</strong> ${escapeHtml(student.carnet || '—')}</p>
    ${student.email ? `<p style="margin:4px 0;"><strong>Correo alumno:</strong> ${escapeHtml(student.email)}</p>` : ''}
    ${student.educationLevel ? `<p style="margin:4px 0;"><strong>Nivel:</strong> ${escapeHtml(student.educationLevel === 'BASICO' ? 'Básico' : student.educationLevel === 'DIVERSIFICADO' ? 'Diversificado' : student.educationLevel)}</p>` : ''}
    ${student.carrera ? `<p style="margin:4px 0;"><strong>Carrera:</strong> ${escapeHtml(student.carrera)}</p>` : ''}
    ${student.seccion ? `<p style="margin:4px 0;"><strong>Sección:</strong> ${escapeHtml(student.seccion)}</p>` : ''}
    <p style="margin:4px 0;"><strong>Alergias:</strong> <span style="color:${student.hasAllergies ? '#dc2626' : '#15803d'};font-weight:700;">
      ${escapeHtml(student.hasAllergies ? (student.allergies || 'Sí') : 'Ninguna')}
    </span></p>
    ${student.guardianEmail ? `<p style="margin:4px 0;"><strong>Encargado:</strong> ${escapeHtml(student.guardianEmail)}</p>` : ''}
  </div>
`;

const locationBlock = (location = null) => {
    if (!location || (!location.campusZone && !location.latitude && !location.detail)) {
        return `
          <div style="background:#fff7ed;padding:14px 16px;border-radius:8px;border-left:4px solid #f97316;margin:12px 0;">
            <p style="margin:0;font-weight:700;color:#c2410c;">📍 Ubicación no reportada</p>
            <p style="margin:6px 0 0;font-size:13px;color:#9a3412;">
              El alumno no indicó zona ni se capturó GPS. Contactarlo por teléfono o correo.
            </p>
          </div>
        `;
    }

    const lat = location.latitude;
    const lng = location.longitude;
    const mapsUrl =
        location.mapsUrl ||
        (lat != null && lng != null
            ? `https://www.google.com/maps?q=${lat},${lng}`
            : null);

    return `
      <div style="background:#eff6ff;padding:16px;border-radius:8px;border:2px solid #3b82f6;margin:12px 0;">
        <p style="margin:0 0 10px;font-weight:800;color:#1d4ed8;font-size:15px;">📍 UBICACIÓN DEL ALUMNO</p>
        ${
            location.campusZone
                ? `<p style="margin:4px 0;"><strong>Zona en campus:</strong> <span style="font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(location.campusZone)}</span></p>`
                : ''
        }
        ${
            location.detail
                ? `<p style="margin:4px 0;"><strong>Detalle:</strong> ${escapeHtml(location.detail)}</p>`
                : ''
        }
        ${
            lat != null && lng != null
                ? `<p style="margin:4px 0;"><strong>GPS:</strong> ${escapeHtml(String(lat))}, ${escapeHtml(String(lng))}
                    ${location.accuracy != null ? ` (±${Math.round(location.accuracy)} m)` : ''}</p>`
                : '<p style="margin:4px 0;color:#64748b;font-size:13px;">GPS no disponible (permiso denegado o sin señal).</p>'
        }
        ${
            mapsUrl
                ? `<p style="margin:12px 0 0;">
                    <a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;">
                      Abrir en Google Maps
                    </a>
                  </p>`
                : ''
        }
        ${
            location.capturedAt
                ? `<p style="margin:10px 0 0;font-size:12px;color:#64748b;">Capturado: ${escapeHtml(
                      new Date(location.capturedAt).toLocaleString('es-GT')
                  )}</p>`
                : ''
        }
      </div>
    `;
};

const footerHtml = `
  <footer style="margin-top:24px;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px;">
    © ${new Date().getFullYear()} Kinal Medic · Sistema de Alerta Instantánea<br/>
    Este mensaje fue generado automáticamente. No responda a este correo si no es el canal oficial de atención.
  </footer>
`;

export const sendMedicalAlert = async ({
    to,
    student,
    description,
    urgency = 'LEVE',
    location = null,
    sentAt = new Date(),
}) => {
    const style = urgencyStyles[urgency] || urgencyStyles.LEVE;
    const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);

    if (recipients.length === 0) {
        throw new Error('No hay destinatarios para la alerta médica.');
    }

    const studentEmail = (student.email || '').trim();
    const mailOptions = {
        from: EMAIL_FROM(),
        to: recipients.join(', '),

        ...(studentEmail && EMAIL_REGEX_SIMPLE(studentEmail)
            ? { replyTo: studentEmail }
            : {}),
        subject: `[${style.label}] Solicitud de asistencia médica — ${student.name || 'Alumno'} (${student.carnet || 's/c'})`,
        html: `
            <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;border:2px solid ${style.border};padding:24px;border-radius:12px;">
                <div style="background:${style.bg};border-radius:8px;padding:12px 16px;margin-bottom:16px;text-align:center;">
                    <h2 style="color:${style.color};margin:0;font-size:20px;">SOLICITUD DE AYUDA MÉDICA</h2>
                    <p style="margin:8px 0 0;font-weight:700;color:${style.color};">Nivel: ${style.label}</p>
                </div>
                <p style="color:#334155;">Un estudiante de Fundación Kinal solicita atención médica.</p>
                ${studentBlock(student)}
                ${location ? locationBlock(location) : ''}
                <div style="background:${style.bg};padding:14px 16px;border-radius:8px;border-left:4px solid ${style.border};">
                    <p style="margin:0 0 8px;font-weight:700;color:#0f172a;">Motivo de la solicitud:</p>
                    <p style="margin:0;font-style:italic;color:#334155;">"${escapeHtml(description)}"</p>
                </div>
                <div style="margin-top:16px;padding:12px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
                    <p style="margin:0;font-size:13px;color:#1e40af;font-weight:600;">
                        💡 Responda este correo (Responder) para que su indicación llegue al correo del estudiante:
                        <strong>${escapeHtml(studentEmail || 'sin correo')}</strong>
                    </p>
                    <p style="margin:8px 0 0;font-size:12px;color:#64748b;">
                        También puede responder desde la app Kinal Medic → Notificaciones → Solicitudes.
                    </p>
                </div>
                <p style="margin-top:16px;font-size:13px;color:#64748b;">
                    Enviado: ${escapeHtml(sentAt.toLocaleString('es-GT'))}
                </p>
                ${footerHtml}
            </div>
        `,
    };

    return await transporter.sendMail(mailOptions);
};

const EMAIL_REGEX_SIMPLE = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

export const sendEmergencyAlert = async ({
    medicEmails = [],
    guardianEmail,
    student,
    note = '',
    location = null,
    sentAt = new Date(),
}) => {
    const style = urgencyStyles.EMERGENCIA;
    const recipients = [
        ...new Set(
            [...medicEmails, guardianEmail]
                .map((e) => (e || '').trim().toLowerCase())
                .filter(Boolean)
        ),
    ];

    if (recipients.length === 0) {
        throw new Error(
            'No hay destinatarios. Se necesita al menos un médico o el correo del encargado.'
        );
    }

    const zoneHint = location?.campusZone
        ? ` — ${location.campusZone}`
        : '';

    const studentEmail = (student.email || '').trim();
    const mailOptions = {
        from: EMAIL_FROM(),
        to: recipients.join(', '),
        ...(studentEmail && EMAIL_REGEX_SIMPLE(studentEmail)
            ? { replyTo: studentEmail }
            : {}),
        subject: `🚨 EMERGENCIA GRAVE — ${student.name || 'Alumno'} (${student.carnet || 's/c'})${zoneHint} — Kinal Medic`,
        html: `
            <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;border:3px solid ${style.border};padding:24px;border-radius:12px;background:#fff;">
                <div style="background:${style.bg};border-radius:8px;padding:16px;margin-bottom:16px;text-align:center;">
                    <h1 style="color:${style.color};margin:0;font-size:22px;letter-spacing:0.5px;">🚨 EMERGENCIA MÉDICA TOTAL</h1>
                    <p style="margin:10px 0 0;font-weight:800;color:${style.color};font-size:16px;">
                        REQUIERE ATENCIÓN INMEDIATA
                    </p>
                </div>
                <p style="color:#7f1d1d;font-weight:600;">
                    El estudiante activó el botón de <strong>Emergencia Total</strong> en Kinal Medic.
                    Por favor acuda o comuníquese de inmediato.
                </p>
                ${studentBlock(student)}
                ${locationBlock(location)}
                ${
                    note
                        ? `<div style="background:${style.bg};padding:14px 16px;border-radius:8px;border-left:4px solid ${style.border};margin-top:8px;">
                            <p style="margin:0 0 6px;font-weight:700;">Nota del alumno:</p>
                            <p style="margin:0;font-style:italic;">"${escapeHtml(note)}"</p>
                          </div>`
                        : `<p style="color:#991b1b;font-size:14px;">No se adjuntó descripción adicional.</p>`
                }
                <div style="margin-top:18px;padding:12px;background:#0f172a;color:#fff;border-radius:8px;text-align:center;font-weight:700;">
                    Dirigirse a la ubicación indicada o contactar al alumno / encargado
                </div>
                <div style="margin-top:16px;padding:12px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">
                    <p style="margin:0;font-size:13px;color:#991b1b;font-weight:600;">
                        Responda este correo al alumno (${escapeHtml(studentEmail || 's/c')}) o use la app Kinal Medic.
                    </p>
                </div>
                <p style="margin-top:16px;font-size:13px;color:#64748b;">
                    Enviado: ${escapeHtml(sentAt.toLocaleString('es-GT'))}
                </p>
                ${footerHtml}
            </div>
        `,
    };

    return await transporter.sendMail(mailOptions);
};

export const sendDoctorResponseToStudent = async ({
    studentEmail,
    studentName,
    doctorName,
    doctorEmail,
    originalDescription,
    responseMessage,
    urgency = 'LEVE',
    sentAt = new Date(),
}) => {
    const to = String(studentEmail || '').trim().toLowerCase();
    if (!to || !EMAIL_REGEX_SIMPLE(to)) {
        throw new Error(
            'El estudiante no tiene un correo válido para recibir la respuesta.'
        );
    }

    const mailOptions = {
        from: EMAIL_FROM(),
        to,
        replyTo: doctorEmail || undefined,
        subject: 'Respuesta del personal médico — Kinal Medic',
        html: `
            <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;border:2px solid #08316D;padding:24px;border-radius:12px;">
                <div style="background:#eff6ff;border-radius:8px;padding:14px 16px;margin-bottom:16px;text-align:center;">
                    <h2 style="color:#08316D;margin:0;font-size:20px;">Respuesta a tu solicitud médica</h2>
                </div>
                <p style="color:#334155;">Hola <strong>${escapeHtml(studentName || 'estudiante')}</strong>,</p>
                <p style="color:#334155;">El personal médico de Kinal respondió a tu solicitud.</p>

                <div style="background:#f8fafc;padding:14px 16px;border-radius:8px;border-left:4px solid #94a3b8;margin:12px 0;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Tu solicitud (${escapeHtml(urgency)})</p>
                    <p style="margin:0;font-style:italic;color:#475569;">"${escapeHtml(originalDescription || '')}"</p>
                </div>

                <div style="background:#ecfdf5;padding:16px;border-radius:8px;border-left:4px solid #10b981;margin:12px 0;">
                    <p style="margin:0 0 8px;font-weight:800;color:#047857;">Indicaciones del médico</p>
                    <p style="margin:0;font-size:15px;color:#065f46;white-space:pre-wrap;">${escapeHtml(responseMessage)}</p>
                    <p style="margin:12px 0 0;font-size:13px;color:#64748b;">
                        <strong>${escapeHtml(doctorName || 'Personal médico')}</strong>
                        ${doctorEmail ? ` · ${escapeHtml(doctorEmail)}` : ''}
                    </p>
                </div>

                <p style="margin-top:16px;font-size:13px;color:#64748b;">
                    Enviado: ${escapeHtml(sentAt.toLocaleString('es-GT'))}<br/>
                    También puedes ver esta respuesta en Kinal Medic → Notificaciones.
                </p>
                ${footerHtml}
            </div>
        `,
    };

    return await transporter.sendMail(mailOptions);
};
