import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sql } from './config/db.js';
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
const allowedOrigins = [
  "http://localhost:5173",
  "https://health-hub-ashy.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.startsWith("http://192.168.") || 
      origin.startsWith("http://10.")
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/admin',authAdmin, adminRouter);
app.use('/doctor',doctorRouter);
app.use('/user',userRouter);
app.use("/patient",patientRouter);
app.post("/payments/create-order",createOrder);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on('join_room', ({ appointmentId }) => {
    socket.join(`room_${appointmentId}`);
    console.log(`[Socket] User joined room_${appointmentId}`);
  });

  socket.on('send_message', async ({ appointmentId, senderId, receiverId, messageText }) => {
    try {
      const [msg] = await sql`
        INSERT INTO messages (appointment_id, sender_id, receiver_id, message_text)
        VALUES (${appointmentId}, ${senderId}, ${receiverId}, ${messageText})
        RETURNING *;
      `;
      io.to(`room_${appointmentId}`).emit('receive_message', msg);
    } catch (err) {
      console.error('Error saving/sending message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log('Server is running on PORT:', PORT);
});