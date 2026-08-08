import { sql } from "../config/db.js";

/**
 * Automatically transitions:
 * - 'pending' appointments within 30 minutes of start time -> 'expired'
 * - 'confirmed' appointments past their end time (1 hr) -> 'completed'
 */
export async function syncAppointmentStatuses() {
  try {
    const activeAppointments = await sql`
      SELECT id, status, appointment_date, appointment_time 
      FROM appointments 
      WHERE status IN ('pending', 'confirmed');
    `;

    if (activeAppointments.length === 0) return;

    const now = new Date();
    const toExpire = [];
    const toComplete = [];

    for (const apt of activeAppointments) {
      if (!apt.appointment_date || !apt.appointment_time) continue;

      let dateStr = "";
      if (typeof apt.appointment_date === "string") {
        dateStr = apt.appointment_date.split("T")[0];
      } else {
        const d = new Date(apt.appointment_date);
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, "0");
        const dy = String(d.getDate()).padStart(2, "0");
        dateStr = `${yr}-${mo}-${dy}`;
      }

      const timeStr = apt.appointment_time;
      const slotStart = new Date(`${dateStr}T${timeStr}`);

      if (isNaN(slotStart.getTime())) continue;

      const expireDeadline = new Date(slotStart.getTime() - 30 * 60 * 1000); // 30 mins before
      const completeDeadline = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour after

      if (apt.status === "pending" && now >= expireDeadline) {
        toExpire.push(apt.id);
      } else if (apt.status === "confirmed" && now >= completeDeadline) {
        toComplete.push(apt.id);
      }
    }

    if (toExpire.length > 0) {
      await sql`
        UPDATE appointments
        SET status = 'expired'
        WHERE id = ANY(${toExpire});
      `;
    }

    if (toComplete.length > 0) {
      await sql`
        UPDATE appointments
        SET status = 'completed'
        WHERE id = ANY(${toComplete});
      `;
    }
  } catch (error) {
    console.error("Error syncing appointment statuses:", error);
  }
}
