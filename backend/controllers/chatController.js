import { sql } from "../config/db.js";

export async function getChatMessages(req, res) {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.json({ success: false, message: "Appointment ID is required" });
    }

    const messages = await sql`
      SELECT * FROM messages
      WHERE appointment_id = ${appointmentId}
      ORDER BY created_at ASC;
    `;

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error loading chat messages:", error);
    res.json({ success: false, message: error.message });
  }
}
