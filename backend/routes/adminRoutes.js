import express from 'express';
import {
  getAppointments,
  getDashboardStats,
  getDoctors,
  getPatients,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor
} from '../controllers/adminController.js';
const adminRouter = express.Router();

adminRouter.get('/patients', getPatients);
adminRouter.get('/doctors', getDoctors);
adminRouter.get("/getAppointments",getAppointments);
adminRouter.get("/getDashboardStats",getDashboardStats);
adminRouter.get("/pending-doctors", getPendingDoctors);
adminRouter.post("/approve-doctor", approveDoctor);
adminRouter.post("/reject-doctor", rejectDoctor);
export default adminRouter;
