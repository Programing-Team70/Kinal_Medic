export async function removeTeacherAvailability(teacherId, authHeader) {
    if (!teacherId) return { ok: false, reason: 'sin teacherId' };

    const base =
        process.env.AVAILABILITY_URL ||
        'http://localhost:3004';

    const url = `${base.replace(/\/$/, '')}/api/availability/teacher/${encodeURIComponent(
        String(teacherId)
    )}`;

    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            console.warn(
                `[availabilityCleanup] HTTP ${res.status} al eliminar teacherId=${teacherId}:`,
                data?.message || data
            );
            return { ok: false, status: res.status, data };
        }

        console.log(
            `[availabilityCleanup] Disponibilidad eliminada teacherId=${teacherId}, deleted=${data?.deleted ?? '?'}`
        );
        return { ok: true, data };
    } catch (err) {
        console.warn(
            `[availabilityCleanup] No se pudo contactar availability-service:`,
            err.message
        );
        return { ok: false, reason: err.message };
    }
}
