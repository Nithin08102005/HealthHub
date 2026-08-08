import express from 'express';
import { cancelAppointment, completeApppointment, confirmAppointment, getAppointments, getDoctorDashboardStats, markPaymentPaid } from '../controllers/doctorController.js';

const doctorRouter = express.Router();
doctorRouter.post("/getAppointments",getAppointments);
doctorRouter.post("/confirmAppointment",confirmAppointment);
doctorRouter.post("/cancelAppointment",cancelAppointment);
doctorRouter.post("/completeAppointment",completeApppointment);
doctorRouter.post("/getDoctorDashboardStats",getDoctorDashboardStats);
doctorRouter.post("/markPaid", markPaymentPaid);
export default doctorRouter;