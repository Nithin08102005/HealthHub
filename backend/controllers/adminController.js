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

export { getPatients,getDoctors };