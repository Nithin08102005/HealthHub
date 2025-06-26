import express from 'express';
import { bookAppointment, cancelAppointment, getAppointments, getBookedSlots, getDoctorById, getPatientDashboardStats, makePayment } from '../controllers/patientController.js';
const patientRouter = express.Router();
patientRouter.post("/getDoctorById",getDoctorById);
patientRouter.post("/bookAppointment",bookAppointment);
patientRouter.post("/getBookedSlots",getBookedSlots)
patientRouter.post("/getAppointments",getAppointments);
patientRouter.put("/cancelAppointment",cancelAppointment);
patientRouter.post("/makePayment",makePayment);
patientRouter.post("/getPatientDashboardStats",getPatientDashboardStats)

export default patientRouter;