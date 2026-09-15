# 🏥 HealthHub — Full-Stack Healthcare Platform

<div align="center">

![HealthHub Banner](https://ik.imagekit.io/1cfpxrwuh/banner.png)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-health--hub--ashy.vercel.app-blue?style=for-the-badge&logo=vercel)](https://health-hub-ashy.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Nithin08102005%2FHealthHub-black?style=for-the-badge&logo=github)](https://github.com/Nithin08102005/HealthHub)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

*A modern, role-based healthcare web application enabling seamless doctor-patient interactions through video consultations, real-time chat, digital prescriptions, and intelligent appointment management.*

</div>

---

## ✨ Features

### 👤 Patient Portal
- 🗓️ **Book Appointments** — Browse doctors by specialization, view real-time available slots, and book instantly
- 💳 **Razorpay Payments** — Secure in-app payment for consultations
- 📹 **Video Consultations** — Join peer-to-peer video calls powered by Agora WebRTC
- 💬 **Real-Time Chat** — Message your doctor before, during, or after consultations
- 📄 **Digital Prescriptions** — Receive auto-generated PDFs via email, downloadable anytime
- 🤖 **AI Symptom Checker** — Describe symptoms and get AI-powered specialist recommendations (Gemini)
- 🔐 **Secure Auth** — JWT-based login with OTP email-based password reset

### 🩺 Doctor Portal
- 📋 **Appointment Dashboard** — View, confirm, and complete appointments in real time
- 💊 **Prescription Builder** — Create dynamic prescriptions post-consultation; auto-emailed as PDF to the patient
- 📹 **Video + Chat** — Join consultations with integrated chat panel inside the call room
- ⏰ **Auto-Expiry** — Past unattended appointments automatically expire

### 🛡️ Admin Portal
- 👨‍⚕️ **Doctor Onboarding Review** — Review doctor applications, verify credentials, approve or reject
- 🏥 **Add Doctors Directly** — Manually add verified doctors to the platform
- 📊 **Manage All Appointments** — Full visibility across all bookings

### 🔒 Doctor Self-Registration
- Multi-step sign-up form with profile photo + medical license/resume PDF upload
- Applications held in `pending` status until Admin approves
- Login blocked with a descriptive message until approved

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Vite, Context API |
| **Styling** | Vanilla CSS, TailwindCSS, Lucide React Icons |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Neon cloud-hosted) |
| **Auth** | JWT, Bcrypt |
| **Real-Time** | Socket.io (WebSocket bidirectional chat) |
| **Video Calls** | Agora RTC SDK (WebRTC) + dynamic token generation |
| **File Storage** | ImageKit.io (profile photos, PDFs, credentials) |
| **PDF Generation** | PDFKit |
| **Email** | Nodemailer (OTP + prescription delivery) |
| **Payments** | Razorpay (test mode) |
| **AI** | Google Gemini API (symptom analysis) |
| **File Uploads** | Multer (multi-field: image + document) |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🏗️ Architecture

```
HealthHub/
├── frontend/                  # React + Vite app
│   └── src/
│       ├── components/        # VideoRoom, ChatDrawer, PrescriptionForm, AdminLayout
│       ├── pages/
│       │   ├── patient/       # BookAppointment, MyAppointments
│       │   ├── doctor/        # MyAppointments (with prescription builder)
│       │   └── admin/         # AdminHome, AllDoctors, DoctorRequests, AddDoctor
│       ├── context/           # Global state (AppContext)
│       └── routes/            # Role-based routing
│
└── backend/                   # Node.js + Express API
    ├── controllers/           # userController, patientController, doctorController,
    │                          # adminController, chatController, prescriptionController,
    │                          # videoController, aiController
    ├── routes/                # userRoutes, patientRoutes, doctorRoutes, adminRoutes
    ├── middleware/            # authUser, authDoctor, authAdmin (JWT guards)
    ├── services/              # appointmentService, mailService, paymentService
    └── config/                # db.js (Neon PostgreSQL connection)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (or a [Neon](https://neon.tech) account)
- Accounts for: [ImageKit](https://imagekit.io), [Agora](https://agora.io), [Razorpay](https://razorpay.com), [Gemini API](https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/Nithin08102005/HealthHub.git
cd HealthHub
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=3000
DATABASE_URL=your_neon_connection_string
PGHOST=your_neon_host
PGDATABASE=neondb
PGUSER=your_db_user
PGPASSWORD=your_db_password

JWT_SECRET=your_jwt_secret

# ImageKit
PUBLICKEY=your_imagekit_public_key
PRIVATEKEY=your_imagekit_private_key
URLENDPOINT=https://ik.imagekit.io/your_id

# Gmail (Nodemailer)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Agora
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
```

```bash
npm run server
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in `/frontend`:
```env
VITE_API_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

```bash
npm run dev
```

---

## 🗄️ Database Schema (Key Tables)

| Table | Purpose |
|---|---|
| `users` | Shared auth accounts (all roles) |
| `patients` | Patient profile data |
| `doctors` | Doctor profiles with `status` (pending/approved/rejected) + `document_url` |
| `appointments` | Bookings with status, payment, meeting type |
| `prescriptions` | Post-consultation prescriptions with PDF URL |
| `messages` | Real-time chat messages per appointment |

---

## 🔄 Key Workflows

### Video Consultation Flow
```
Patient clicks "Join Call"
  → Frontend requests Agora token from backend
  → Backend signs token with APP_CERTIFICATE
  → Frontend joins Agora channel (peer-to-peer WebRTC)
  → Doctor joins same channel → live video established
  → Call ends → Doctor opens Prescription Builder
  → PDF generated → uploaded to ImageKit → emailed to Patient
```

### Real-Time Chat Flow
```
User opens Chat → Socket.io connects → joins room_<appointmentId>
  → Past messages loaded from PostgreSQL
  → Message sent → saved to DB → broadcast via Socket.io to room
  → Other user receives it instantly (no page refresh)
```

### Doctor Onboarding Flow
```
Doctor fills signup form (3 steps) + uploads license PDF
  → Profile stored with status = 'pending'
  → Login blocked until Admin reviews
  → Admin views application + credentials in Doctor Requests tab
  → Admin approves → status = 'approved' → Doctor can now log in
```

---

## 📸 Screenshots

> *Coming soon — add screenshots of Patient Dashboard, Video Call, Chat, and Admin Panel here*

---

## 📝 License

This project is for educational and portfolio purposes.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/Nithin08102005">Nithin Bachupally</a>
</div>
