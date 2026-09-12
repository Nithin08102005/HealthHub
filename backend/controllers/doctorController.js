import { sql } from "../config/db.js";
import { syncAppointmentStatuses } from "../services/appointmentService.js";

export async function getAppointments(req, res) {
  const { doctorId } = req.body;
  try {
    await syncAppointmentStatuses();
    const appointments = await sql`
      SELECT 
        a.id,
        a.patient_id,
        a.appointment_date as date,
        a.appointment_time as time,
        a.status,
        a.payment_status as paymentStatus,
        a.reason as reasonForVisit,
        a.meeting_type,
        p.name,
        p.user_id AS patient_user_id,
        p.email,
        p.date_of_birth,
        p.gender,
        p.phone,
        p.image
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ${doctorId}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC;
    `;
    return res.json({ success: "true", appointments });
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.json({ success: false });
  }
}

export async function confirmAppointment(req, res) {
  const { id } = req.body;
  try {
    await syncAppointmentStatuses();
    const [apt] = await sql`
      SELECT id, status, appointment_date, appointment_time
      FROM appointments
      WHERE id = ${id};
    `;

    if (!apt) {
      return res.json({ success: false, message: "Appointment not found" });
    }

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
    const expireDeadline = new Date(slotStart.getTime() - 30 * 60 * 1000);
    const now = new Date();

    if (apt.status === "expired" || (!isNaN(slotStart.getTime()) && now >= expireDeadline)) {
      if (apt.status !== "expired") {
        await sql`UPDATE appointments SET status = 'expired' WHERE id = ${id}`;
      }
      return res.json({
        success: false,
        message: "Cannot confirm appointment within 30 minutes of slot time. Confirmation deadline has passed.",
      });
    }

    if (apt.status === "cancelled") {
      return res.json({ success: false, message: "Cannot confirm a cancelled appointment" });
    }

    await sql`UPDATE appointments SET status = 'confirmed' WHERE id = ${id}`;
    res.json({ success: true, message: "Appointment Confirmed Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error confirming appointment" });
  }
}

export async function cancelAppointment(req, res) {
  const { id } = req.body;
  try {
    await sql`UPDATE appointments SET status = 'cancelled' WHERE id = ${id}`;
    res.json({ success: true, message: "Appointment cancelled Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error cancelling appointment" });
  }
}

export async function completeApppointment(req, res) {
  const { id } = req.body;
  try {
    await syncAppointmentStatuses();
    await sql`UPDATE appointments SET status = 'completed' WHERE id = ${id}`;
    res.json({ success: true, message: "Appointment completed Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error completing appointment" });
  }
}

export async function getDoctorDashboardStats(req, res) {
  const { doctorId } = req.body;

  try {
    await syncAppointmentStatuses();
    const doctorResult = await sql`
      SELECT name FROM doctors WHERE id = ${doctorId};
    `;
    const doctorName = doctorResult[0]?.name || "Unknown";

    const pending = await sql`
      SELECT COUNT(*) AS count FROM appointments
      WHERE doctor_id = ${doctorId} AND status = 'pending';
    `;
    const confirmed = await sql`
      SELECT COUNT(*) AS count FROM appointments
      WHERE doctor_id = ${doctorId} AND status = 'confirmed';
    `;
    const completed = await sql`
      SELECT COUNT(*) AS count FROM appointments
      WHERE doctor_id = ${doctorId} AND status = 'completed';
    `;
    const cancelled = await sql`
      SELECT COUNT(*) AS count FROM appointments
      WHERE doctor_id = ${doctorId} AND status = 'cancelled';
    `;
    const expired = await sql`
      SELECT COUNT(*) AS count FROM appointments
      WHERE doctor_id = ${doctorId} AND status = 'expired';
    `;

    const earnings = await sql`
      SELECT COALESCE(SUM(d.consultation_fee), 0) AS total
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.doctor_id = ${doctorId}
        AND a.payment_status = true
        AND a.status IN ('confirmed', 'completed');
    `;

    const totalEarnings = earnings[0].total || 0;

    res.json({
      success: true,
      doctorName,
      totalEarnings,
      appointmentsByStatus: {
        pending: pending[0].count,
        confirmed: confirmed[0].count,
        completed: completed[0].count,
        cancelled: cancelled[0].count,
        expired: expired[0].count,
      },
    });
  } catch (error) {
    console.error("Error fetching doctor dashboard stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}

export async function markPaymentPaid(req, res) {
  const { id } = req.body;
  try {
    const [appointment] = await sql`
      SELECT a.id, a.doctor_id, a.payment_status, d.consultation_fee
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ${id};
    `;

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.payment_status) {
      return res.json({ success: false, message: "Appointment is already marked as paid" });
    }

    await sql`
      UPDATE appointments
      SET payment_status = true
      WHERE id = ${id};
    `;

    await sql`
      UPDATE doctors
      SET earnings = earnings + ${Number(appointment.consultation_fee)}
      WHERE id = ${appointment.doctor_id};
    `;

    return res.json({
      success: true,
      message: "Payment marked as paid (offline cash/UPI received)",
    });
  } catch (error) {
    console.error("Error marking payment paid:", error);
    return res.json({ success: false, message: "Failed to update payment status" });
  }
}


