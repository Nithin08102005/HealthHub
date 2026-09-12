import { sql } from "../config/db.js";
import ImageKit from "imagekit";
import PDFDocument from "pdfkit";
import { sendPrescriptionEmail } from "../services/mailService.js";
import "dotenv/config";

const cleanEnvVar = (val) => {
  if (!val) return "";
  return val.trim().replace(/^['"]|['"]$/g, "");
};

const imagekit = new ImageKit({
  publicKey: cleanEnvVar(process.env.PUBLICKEY),
  privateKey: cleanEnvVar(process.env.PRIVATEKEY),
  urlEndpoint: cleanEnvVar(process.env.URLENDPOINT),
});

// Helper function to generate PDF buffer
function generatePDFBuffer(doctor, patient, diagnosis, medicines, advice, appointmentDate) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Design Header
    doc.fillColor("#0284c7").fontSize(24).text("HEALTHHUB PORTAL", { align: "right" });
    doc.fontSize(9).fillColor("#64748b").text("Digital Consultation & Prescription", { align: "right" });
    doc.moveDown(1);

    // Decorative Line
    doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    // Details Grid
    const startY = doc.y;
    doc.fillColor("#0f172a").fontSize(13).text(`Dr. ${doctor.name}`, 50, startY);
    doc.fontSize(9).fillColor("#475569").text(`${doctor.specialization || "Practitioner"}`, 50, doc.y + 2);
    doc.text(`Phone: ${doctor.phone || "N/A"}`, 50, doc.y + 2);

    doc.fillColor("#0f172a").fontSize(13).text("Patient Information", 350, startY);
    doc.fontSize(9).fillColor("#475569").text(`Name: ${patient.name}`, 350, doc.y + 2);
    doc.text(`Email: ${patient.email}`, 350, doc.y + 2);
    doc.text(`Date: ${appointmentDate || "N/A"}`, 350, doc.y + 2);
    
    doc.moveDown(2.5);
    doc.x = 50;

    // Diagnosis Section
    doc.fillColor("#0284c7").fontSize(11).text("DIAGNOSIS:", 50, doc.y);
    doc.fillColor("#0f172a").fontSize(10).text(diagnosis, 50, doc.y + 3);
    doc.moveDown(1.5);

    // Medicines Table
    doc.fillColor("#0284c7").fontSize(11).text("PRESCRIBED MEDICINES:", 50, doc.y);
    doc.moveDown(0.5);

    // Header Row
    const tableHeaderY = doc.y;
    doc.fillColor("#475569").fontSize(9).text("Medicine Name", 50, tableHeaderY, { bold: true });
    doc.text("Dosage", 240, tableHeaderY, { bold: true });
    doc.text("Frequency", 340, tableHeaderY, { bold: true });
    doc.text("Duration", 440, tableHeaderY, { bold: true });
    doc.moveDown(0.4);

    doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.4);

    // Medicine List
    doc.fillColor("#0f172a");
    medicines.forEach((med) => {
      const rowY = doc.y;
      doc.text(med.name, 50, rowY);
      doc.text(med.dosage, 240, rowY);
      doc.text(med.frequency, 340, rowY);
      doc.text(med.duration, 440, rowY);
      doc.moveDown(0.8);
    });

    doc.moveDown(1.5);

    // Advice Section
    if (advice) {
      doc.fillColor("#0284c7").fontSize(11).text("DOCTOR ADVICE / RECOMMENDATION:", 50, doc.y);
      doc.fillColor("#475569").fontSize(9).text(advice, 50, doc.y + 3, { width: 500, align: "left" });
      doc.moveDown(2);
    }

    // Signatures
    doc.moveDown(2);
    const signY = doc.y;
    doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(380, signY + 30).lineTo(520, signY + 30).stroke();
    doc.fontSize(8).fillColor("#94a3b8").text("Digitally Signed by Practitioner", 380, signY + 35, { align: "center", width: 140 });

    // Footer / Disclaimer
    doc.fontSize(7).fillColor("#94a3b8").text(
      "This is an electronically generated document. No physical signature is required. Generated securely via HealthHub Telehealth Portal.",
      50,
      710,
      { align: "center", width: 500 }
    );

    doc.end();
  });
}

export async function createPrescription(req, res) {
  try {
    const { appointmentId, diagnosis, medicines, advice } = req.body;

    if (!appointmentId || !diagnosis || !medicines) {
      return res.json({ success: false, message: "Missing required details" });
    }

    // Fetch details
    const [appointment] = await sql`
      SELECT a.*, p.name as patient_name, p.email as patient_email, d.name as doctor_name, d.phone as doctor_phone, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ${appointmentId};
    `;

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Generate PDF Buffer
    const pdfBuffer = await generatePDFBuffer(
      { name: appointment.doctor_name, specialization: appointment.specialization, phone: appointment.doctor_phone },
      { name: appointment.patient_name, email: appointment.patient_email },
      diagnosis,
      medicines,
      advice,
      new Date(appointment.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    );

    // Upload to ImageKit
    const filename = `prescription_${appointmentId}.pdf`;
    const uploadResponse = await imagekit.upload({
      file: pdfBuffer,
      fileName: filename,
      folder: "/prescriptions",
      tags: ["prescription"],
      useUniqueFileName: true,
    });

    const pdfUrl = uploadResponse.url;

    // Insert record
    const [prescription] = await sql`
      INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, medicines, advice, pdf_url)
      VALUES (${appointmentId}, ${appointment.patient_id}, ${appointment.doctor_id}, ${diagnosis}, ${JSON.stringify(medicines)}, ${advice}, ${pdfUrl})
      RETURNING *;
    `;

    // Mark appointment as completed
    await sql`
      UPDATE appointments
      SET status = 'completed'
      WHERE id = ${appointmentId};
    `;

    // Send email with attachment
    try {
      await sendPrescriptionEmail(
        appointment.patient_email,
        appointment.patient_name,
        appointment.doctor_name,
        pdfBuffer,
        filename
      );
    } catch (mailErr) {
      console.error("Failed to send prescription email:", mailErr);
    }

    res.json({ success: true, message: "Prescription created and completed successfully!", data: prescription });
  } catch (error) {
    console.error("Prescription creation error:", error);
    res.json({ success: false, message: error.message });
  }
}

export async function getPrescriptionByAppointment(req, res) {
  try {
    const { appointmentId } = req.body;
    const result = await sql`
      SELECT * FROM prescriptions
      WHERE appointment_id = ${appointmentId}
      LIMIT 1;
    `;

    if (result.length > 0) {
      res.json({ success: true, data: result[0] });
    } else {
      res.json({ success: false, message: "Prescription not found" });
    }
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.json({ success: false, message: error.message });
  }
}
