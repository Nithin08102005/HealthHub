import {sql} from '../config/db.js';
async function getPatients(req,res) {
    try{
  const result = await sql`SELECT * FROM patients`;
  res.json({ success: true, data: result });
    }
    catch(error)
    {
          console.log(error)
        res.json({ success: false, message: error.message })
    }
}
async function getDoctors(req,res) {
    try{
  const result = await sql`SELECT * FROM doctors`;
  res.json({ success: true, data: result });
    }
    catch(error)
    {
          console.log(error)
        res.json({ success: false, message: error.message })
    }
}


 async function getAppointments(req, res) {
  try {
    const result = await sql`
      SELECT 
        a.id,
        a.appointment_date AS date,
        a.appointment_time AS time,
        a.status,
        a.reason AS reason_for_visit,
        a.payment_status,
        d.consultation_fee AS fee,
        p.name AS patient_name,
        p.image AS patient_image,
        p.email AS patient_email,
        p.phone AS patient_phone,
        p.date_of_birth AS patient_dob,
        d.name AS doctor_name,
        d.image AS doctor_image
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.appointment_date DESC,a.appointment_time DESC;
    `;

    const appointments = result.map(row => {
      const age = calculateAge(row.patient_dob);
      return {
        id: row.id,
        date: new Date(row.date).toLocaleDateString('en-CA'),
        time: formatTime(row.time),
        fee: `$${row.fee}`,
        status: row.status,
        reasonForVisit: row.reason_for_visit,
        paymentStatus: row.payment_status ? 'Paid' : 'Pending',
        patient: {
          name: row.patient_name,
          image: row.patient_image,
          email: row.patient_email,
          phone: row.patient_phone,
          age
        },
        doctor: {
          name: row.doctor_name,
          image: row.doctor_image
        }
      };
    });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
}

function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function formatTime(sqlTime) {
  const [hourStr, minute] = sqlTime.split(':');
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}


  async function getDashboardStats(req, res) {
  try {
    const totalDoctors = await sql`SELECT COUNT(*) AS count FROM doctors`;
    const totalPatients = await sql`SELECT COUNT(*) AS count FROM patients`;
    const totalAppointments = await sql`SELECT COUNT(*) AS count FROM appointments`;

    const pending = await sql`SELECT COUNT(*) AS count FROM appointments WHERE status = 'pending'`;
    const confirmed = await sql`SELECT COUNT(*) AS count FROM appointments WHERE status = 'confirmed'`;
    const completed = await sql`SELECT COUNT(*) AS count FROM appointments WHERE status = 'completed'`;
    const cancelled = await sql`SELECT COUNT(*) AS count FROM appointments WHERE status = 'cancelled'`;
const paidCount = await sql`SELECT COUNT(*) AS count FROM appointments WHERE payment_status = true`; 
const unpaidCount = await sql`SELECT COUNT(*) AS count FROM appointments WHERE payment_status = false`;
const paid = await sql`
  SELECT SUM(d.consultation_fee) AS amount
  FROM appointments a
  JOIN doctors d ON a.doctor_id = d.id
  WHERE a.status IN ('confirmed', 'completed') AND a.payment_status = true;
`;

const unpaid = await sql`
  SELECT SUM(d.consultation_fee) AS amount
  FROM appointments a
  JOIN doctors d ON a.doctor_id = d.id
  WHERE a.status IN ('confirmed', 'completed') AND a.payment_status = false;
`;



    res.json({
      success: true,
      totalDoctors: totalDoctors[0].count,
      totalPatients: totalPatients[0].count,
      totalAppointments: totalAppointments[0].count,
      appointmentsByStatus: {
        pending: pending[0].count,
        confirmed: confirmed[0].count,
        completed: completed[0].count,
        cancelled: cancelled[0].count
      },
      paymentStats: {
        paid: paid[0].amount,
        unpaid: unpaid[0].amount,
        paidCount:paidCount[0].count,
        unpaidCount:unpaidCount[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
}


export { getPatients,getDoctors,getAppointments,getDashboardStats };