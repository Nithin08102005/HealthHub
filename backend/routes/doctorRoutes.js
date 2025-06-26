import express from 'express';
import { cancelAppointment, completeApppointment, confirmAppointment, getAppointments, getDoctorDashboardStats } from '../controllers/doctorController.js';

const doctorRouter = express.Router();
doctorRouter.post("/getAppointments",getAppointments);
doctorRouter.post("/confirmAppointment",confirmAppointment);
doctorRouter.post("/cancelAppointment",cancelAppointment);
doctorRouter.post("/completeAppointment",completeApppointment);
doctorRouter.post("/getDoctorDashboardStats",getDoctorDashboardStats);
export default doctorRouter;