import { sql } from "../config/db.js";

export async function getAppointments(req, res) {
  const { doctorId } = req.body;
  try {
    const appointments = await sql`
  SELECT 
    a.id ,
    a.appointment_date as date,
    a.appointment_time as time,
    a.status,
    a.payment_status as paymentStatus,
    a.reason as reasonForVisit,
    p.name ,
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
    console.error("Error fetching booked slots:", err);
    res.json({ success: false });
  }
}

export async function confirmAppointment(req, res) {
  const { id } = req.body;
  try {
    await sql`UPDATE appointments SET status ='confirmed' WHERE id =${id}`;
    res.json({ success: true, message: "Appointment Confirmed Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error confirming appointment" });
  }
}
export async function cancelAppointment(req, res) {
  const { id } = req.body;
  try {
    await sql`UPDATE appointments SET status ='cancelled' WHERE id =${id}`;
    res.json({ success: true, message: "Appointment cancelled Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error cancelling appointment" });
  }
}

export async function completeApppointment(req, res) {
  const { id } = req.body;
  try {
    await sql`UPDATE appointments SET status ='completed' WHERE id =${id}`;
    res.json({ success: true, message: "Appointment completed Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error completing appointment" });
  }
}
export async function getDoctorDashboardStats(req, res) {
  const { doctorId } = req.body;

  try {
    // Get doctor's name
    const doctorResult = await sql`
      SELECT name FROM doctors WHERE id = ${doctorId};
    `;
    const doctorName = doctorResult[0]?.name || "Unknown";

    // Count appointments by status
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

    // Calculate total earnings from completed & paid appointments
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
      },
    });
  } catch (error) {
    console.error("Error fetching doctor dashboard stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}
