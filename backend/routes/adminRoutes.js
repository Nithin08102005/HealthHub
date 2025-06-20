import express from 'express';
import {getDoctors, getPatients} from '../controllers/adminController.js';
const adminRouter = express.Router();

adminRouter.get('/patients', getPatients);
adminRouter.get('/doctors', getDoctors);
export default adminRouter;
