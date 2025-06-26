import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { authAdmin } from './middleware/authAdmin.js';
import { authDoctor } from './middleware/authDoctor.js';
import { authPatient } from './middleware/authPatient.js';
import patientRouter from './routes/patientRoutes.js';
import { createOrder } from './services/paymentService.js';
import doctorRouter from './routes/doctorRoutes.js';
dotenv.config();
const app = express();

const PORT = process.env.PORT||3000 ;
app.use(cors());
app.use(express.json());
// testConnection();

app.use('/admin',authAdmin, adminRouter);
app.use('/doctor',doctorRouter);
app.use('/user',userRouter);
app.use("/patient",patientRouter);
app.post("/payments/create-order",createOrder);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log('Server is running on PORT:', PORT);
});