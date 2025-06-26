import { sql } from "../config/db.js";
import {
  sendDoctorNotification,
  sendPatientRequest,
  sendPatientCancellationConfirmation,
  sendDoctorCancellationNotification
} from "../services/mailService.js";
export async function getDoctorById(req, res) {
  try {
    const { doctorId } = req.body;
    const result = await sql`SELECT * FROM doctors WHERE id = ${doctorId}`;
    if (result.length > 0) {
      res.json({ success: true, data: result[0] });
    } else {
      res.json({ success: false, message: "Doctor not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}
export async function bookAppointment(req, res) {
  try {
    const { patientId, doctorId, selectedSlot, reasonForVisit } = req.body;
    console.log(selectedSlot);
    const { date, time } = selectedSlot;
    const selectedDate = date;
    const selectedTime = time;
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:00`;
    };

    const time24 = parseTime(selectedTime); // "10:00 AM" → "10:00:00"

    const dateStr = new Date(selectedDate.date).toISOString().split("T")[0];
    const result = await sql`
            INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time,reason)
            VALUES (${patientId}, ${doctorId}, ${dateStr}, ${time24},${reasonForVisit})
        `;
    // Get patient info
    const patientData = await sql`
  SELECT name, email FROM patients WHERE id = ${patientId};
`;

    // Get doctor info
    const doctorData = await sql`
  SELECT name, email FROM doctors WHERE id = ${doctorId};
`;
    const patientName = patientData[0]?.name;
    const patientEmail = patientData[0]?.email;

    const doctorName = doctorData[0]?.name;
    const doctorEmail = doctorData[0]?.email;

    await sendPatientRequest(
      patientEmail,
      patientName,
      doctorName,
      selectedSlot,
      reasonForVisit
    );
    await sendDoctorNotification(
      doctorEmail,
      doctorName,
      patientName,
      selectedSlot,
      reasonForVisit
    );
    res.json({
      success: true,
      message: "Appointment booked successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// Example Express route
export async function getBookedSlots(req, res) {
  const { doctorId, date } = req.body;
  try {
    const result = await sql`
  SELECT appointment_time 
  FROM appointments 
  WHERE doctor_id = ${doctorId} 
    AND appointment_date = ${date}
    AND status != 'cancelled';
`;

    const bookedTimes = result.map((row) => row.appointment_time); // returns times like "10:00:00"
    res.json({ success: true, bookedTimes });
  } catch (err) {
    console.error("Error fetching booked slots:", err);
    res.json({ success: false });
  }
}
export async function getAppointments(req, res) {
  const { patientId } = req.body;
  try {
    const appointments = await sql`
  SELECT 
    a.id AS appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.payment_status,
    a.reason,
    d.name AS doctor_name,
    d.specialization,
    d.consultation_fee,
    d.address,
    d.phone,
    d.image
  FROM appointments a
  JOIN doctors d ON a.doctor_id = d.id
  WHERE a.patient_id = ${patientId}
  ORDER BY a.appointment_date DESC, a.appointment_time DESC;
`;
    return res.json({ success: "true", appointments });
  } catch (err) {
    console.error("Error fetching booked slots:", err);
    res.json({ success: false });
  }
}

export const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.body;

  try {
    const result = await sql`
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id = ${appointmentId}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or already cancelled",
      });
    }
     
    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: result[0],
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const makePayment = async (req, res) => {
  const { appointmentId, consultancyFee} = req.body;

  try {
    // Fetch the appointment
    const [appointment] = await sql`
      SELECT doctor_id, payment_status
      FROM appointments
      WHERE id = ${appointmentId};
    `;
    // Update appointment as paid
    await sql`
      UPDATE appointments
      SET payment_status = ${true}
      WHERE id = ${appointmentId};
    `;

    // Update doctor's earnings
  await sql`
  UPDATE doctors
  SET earnings = earnings + ${Number(consultancyFee)}
  WHERE id = ${appointment.doctor_id};
`;


    return res.json({
      success: true,
      message: "Payment successful and doctor's earnings updated"
    });

  } catch (error) {
    console.error("Payment error:", error);
    return res.json({
      success: false,
      message: "Failed to process payment"
    });
  }
};
export async function getPatientDashboardStats(req, res) {
  const { patientId } = req.body;

  

  try {
    const appointmentCount = await sql`
      SELECT COUNT(*) AS count
      FROM appointments
      WHERE patient_id = ${patientId};
    `;

    const paid = await sql`
      SELECT COALESCE(SUM(d.consultation_fee), 0) AS amount
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ${patientId}
        AND a.payment_status = true
        AND a.status IN ('confirmed', 'completed');
    `;

    // Total unpaid amount
    const unpaid = await sql`
      SELECT COALESCE(SUM(d.consultation_fee), 0) AS amount
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = ${patientId}
        AND a.payment_status = false
        AND a.status IN ('confirmed', 'completed');
    `;

    res.json({
      success: true,
      totalAppointments: appointmentCount[0].count,
      totalPaid: paid[0].amount,
      totalDue: unpaid[0].amount
    });

  } catch (error) {
    console.error("Error fetching patient dashboard stats:", error);
    res.status(500).json({ success: false, message: "Unable to fetch dashboard data" });
  }
}



