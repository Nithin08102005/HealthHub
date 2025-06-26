import nodemailer from "nodemailer";
import "dotenv/config";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
const sendMail = async (to, subject, text, html) => {
  await transporter.sendMail({
    from: '"HealthHub" <yourgmail@gmail.com>',
    to,
    subject,
    text,
    html,
  });
};
const sendPatientRequest = async (
  patientEmail,
  patientName,
  doctorName,
  selectedSlot,
  reason
) => {
  const { date, time } = selectedSlot;
  const appointmentDate = `${date.dayName}, ${date.month} ${date.dayNumber}`;

  const subject = `Appointment Request Received - ${appointmentDate} at ${time}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background-color: #f8f9fa; border-left: 4px solid #2c5aa0; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
     <div class="container">
  <div class="header">
    <h1>HealthHub</h1>
    <p>Appointment Request Received</p>
  </div>

  <div class="content">
    <h2>Hello ${patientName},</h2>
    <p>Your appointment request has been submitted successfully and is awaiting confirmation from the doctor.</p>

    <div class="appointment-card">
      <h3 style="margin-top: 0; color: #2c5aa0;">Requested Appointment Details</h3>
      <div class="detail-row">
        <span class="label">Doctor:</span> <span class="value">${doctorName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Date:</span> <span class="value">${appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="label">Time:</span> <span class="value">${time}</span>
      </div>
      <div class="detail-row">
        <span class="label">Reason:</span> <span class="value">${reason}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>We will notify you once the doctor confirms the appointment. Thank you for choosing HealthHub!</p>
  </div>
</div>

    </body>
    </html>
  `;

  const text = `
  Appointment Request Received

  Hello ${patientName},

  We've received your appointment request with Dr. ${doctorName} for ${appointmentDate} at ${time}.

  Appointment Details:
  Doctor: ${doctorName}
  Date: ${appointmentDate}
  Time: ${time}
  Reason: ${reason}

  This appointment is currently pending confirmation by the doctor. You'll receive another notification once it is confirmed.

  Thank you for using HealthHub!
`;

  await sendMail(patientEmail, subject, text, html);
};

// Email sending function for doctor
const sendDoctorNotification = async (
  doctorEmail,
  doctorName,
  patientName,
  selectedSlot,
  reason
) => {
  const { date, time } = selectedSlot;
  const appointmentDate = `${date.dayName}, ${date.month} ${date.dayNumber}`;

  const subject = `New Appointment Request - ${patientName} on ${appointmentDate}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
  <div class="header">
    <h1>HealthHub</h1>
    <p>New Appointment Request</p>
  </div>

  <div class="content">
    <h2>Hello Dr. ${doctorName},</h2>
    <p>You have received a new appointment request. Please review the details below and confirm or decline the request at your earliest convenience.</p>

    <div class="appointment-card">
      <h3 style="margin-top: 0; color: #28a745;">Patient Appointment</h3>
      <div class="detail-row">
        <span class="label">Patient:</span> <span class="value">${patientName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Date:</span> <span class="value">${appointmentDate}</span>
      </div>
      <div class="detail-row">
        <span class="label">Time:</span> <span class="value">${time}</span>
      </div>
      <div class="detail-row">
        <span class="label">Reason for Visit:</span> <span class="value">${reason}</span>
      </div>
    </div>

    <p>You can manage appointment requests in your HealthHub dashboard.</p>
  </div>

  <div class="footer">
    <p>HealthHub Administration</p>
  </div>
</div>

    </body>
    </html>
  `;

  const text = `
  New Appointment Request

  Hello Dr. ${doctorName},

  ${patientName} has requested an appointment with you on ${appointmentDate} at ${time}.

  Patient Appointment Details:
  Patient: ${patientName}
  Date: ${appointmentDate}
  Time: ${time}
  Reason for Visit: ${reason}

  Please review the request and confirm or decline it in your HealthHub dashboard.

  HealthHub Administration
`;
  await sendMail(doctorEmail, subject, text, html);
};

// Function for when patient cancels appointment
const sendPatientCancellationConfirmation = async (
  patientEmail,
  patientName,
  doctorName,
  cancelledSlot,
  reason
) => {
  const { date, time } = cancelledSlot;
  const appointmentDate = `${date.dayName}, ${date.month} ${date.dayNumber}`;
  
  const subject = `Appointment Cancelled - ${appointmentDate} at ${time}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .reschedule-note { background-color: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HealthHub</h1>
          <p>Appointment Cancelled</p>
        </div>
        
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>Your appointment cancellation has been processed successfully.</p>
          
          <div class="appointment-card">
            <h3 style="margin-top: 0; color: #dc3545;">Cancelled Appointment Details</h3>
            <div class="detail-row">
              <span class="label">Doctor:</span> <span class="value">${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span> <span class="value">${appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span> <span class="value">${time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cancellation Reason:</span> <span class="value">${reason}</span>
            </div>
          </div>
          
          <div class="reschedule-note">
            <p><strong>Need to reschedule?</strong> You can book a new appointment with Dr. ${doctorName} or any other doctor through your HealthHub dashboard.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>We're sorry to see this appointment cancelled. We hope to serve you again soon at HealthHub!</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Appointment Cancelled
    
    Hello ${patientName},
    
    Your appointment with Dr. ${doctorName} has been successfully cancelled.
    
    Cancelled Appointment Details:
    Doctor: ${doctorName}
    Date: ${appointmentDate}
    Time: ${time}
    Cancellation Reason: ${reason}
    
    If you need to reschedule, you can book a new appointment through your HealthHub dashboard.
    
    Thank you for using HealthHub!
  `;
  
  await sendMail(patientEmail, subject, text, html);
};

// Function for when doctor cancels appointment (notification to patient)
const sendDoctorCancellationNotification = async (
  patientEmail,
  patientName,
  doctorName,
  cancelledSlot,
  reason
) => {
  const { date, time } = cancelledSlot;
  const appointmentDate = `${date.dayName}, ${date.month} ${date.dayNumber}`;
  
  const subject = `Appointment Cancelled by Doctor - ${appointmentDate} at ${time}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #ffc107; color: #212529; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background-color: #f8f9fa; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .apology-note { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .reschedule-note { background-color: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HealthHub</h1>
          <p>Appointment Cancelled by Doctor</p>
        </div>
        
        <div class="content">
          <h2>Hello ${patientName},</h2>
          <p>We regret to inform you that Dr. ${doctorName} has had to cancel your upcoming appointment.</p>
          
          <div class="appointment-card">
            <h3 style="margin-top: 0; color: #856404;">Cancelled Appointment Details</h3>
            <div class="detail-row">
              <span class="label">Doctor:</span> <span class="value">${doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span> <span class="value">${appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span> <span class="value">${time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Reason:</span> <span class="value">${reason}</span>
            </div>
          </div>
          
          <div class="apology-note">
            <p><strong>We sincerely apologize</strong> for any inconvenience this cancellation may cause. Dr. ${doctorName} had to cancel due to unforeseen circumstances.</p>
          </div>
          
          <div class="reschedule-note">
            <p><strong>Reschedule Options:</strong></p>
            <ul>
              <li>Book a new appointment with Dr. ${doctorName} when available</li>
              <li>Choose another qualified doctor from our network</li>
              <li>Contact our support team for priority rebooking assistance</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>We apologize for the inconvenience and appreciate your understanding. Our support team is here to help you reschedule.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Appointment Cancelled by Doctor
    
    Hello ${patientName},
    
    We regret to inform you that Dr. ${doctorName} has had to cancel your upcoming appointment.
    
    Cancelled Appointment Details:
    Doctor: ${doctorName}
    Date: ${appointmentDate}
    Time: ${time}
    Reason: ${reason}
    
    We sincerely apologize for any inconvenience this may cause.
    
    Reschedule Options:
    - Book a new appointment with Dr. ${doctorName} when available
    - Choose another qualified doctor from our network  
    - Contact our support team for priority rebooking assistance
    
    Thank you for your understanding.
    HealthHub Team
  `;
  
  await sendMail(patientEmail, subject, text, html);
};

const sendDoctorCancellationNotificationFromPatient = async (
  doctorEmail,
  patientName,
  doctorName,
  cancelledSlot,
  reason
) => {
  const { date, time } = cancelledSlot;
  const appointmentDate = `${date.dayName}, ${date.month} ${date.dayNumber}`;
  
  const subject = `Patient Cancelled Appointment - ${patientName} on ${appointmentDate}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HealthHub</h1>
          <p>Patient Cancellation Notice</p>
        </div>
        
        <div class="content">
          <h2>Hello Dr. ${doctorName},</h2>
          <p>A patient has cancelled their upcoming appointment with you.</p>
          
          <div class="appointment-card">
            <h3 style="margin-top: 0; color: #6c757d;">Cancelled Appointment Details</h3>
            <div class="detail-row">
              <span class="label">Patient:</span> <span class="value">${patientName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span> <span class="value">${appointmentDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span> <span class="value">${time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Cancellation Reason:</span> <span class="value">${reason}</span>
            </div>
          </div>
          
          <p>This time slot is now available for other patients to book.</p>
        </div>
        
        <div class="footer">
          <p>HealthHub - Connecting Patients and Healthcare Providers</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Patient Cancellation Notice
    
    Hello Dr. ${doctorName},
    
    Patient ${patientName} has cancelled their appointment with you.
    
    Cancelled Appointment Details:
    Patient: ${patientName}
    Date: ${appointmentDate}
    Time: ${time}
    Cancellation Reason: ${reason}
    
    This time slot is now available for other patients to book.
    
    HealthHub Team
  `;
  
  await sendMail(doctorEmail, subject, text, html);
};
export { sendPatientRequest, sendDoctorNotification ,sendPatientCancellationConfirmation,sendDoctorCancellationNotification,sendDoctorCancellationNotificationFromPatient};
