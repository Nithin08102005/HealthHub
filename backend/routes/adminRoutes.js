import express from 'express';
import {getAppointments, getDashboardStats, getDoctors, getPatients} from '../controllers/adminController.js';
const adminRouter = express.Router();

adminRouter.get('/patients', getPatients);
adminRouter.get('/doctors', getDoctors);
adminRouter.get("/getAppointments",getAppointments);
adminRouter.get("/getDashboardStats",getDashboardStats);
export default adminRouter;
