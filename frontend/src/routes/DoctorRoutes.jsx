import { Routes, Route, Navigate } from "react-router-dom";
import MyAppointments from "../pages/doctor/MyAppointments";
import MyProfile from "../pages/doctor/MyProfile";
import Earnings from "../pages/doctor/Earnings";
import DoctorHome from "../pages/doctor/DoctorHome";
import MySchedule from "../pages/doctor/MySchedule";
function DoctorRoutes() {
  return (
    <Routes>
      <Route path="/appointments" element={<MyAppointments />} />
      <Route path="/profile" element={<MyProfile />} />
      <Route path="/earnings" element={<Earnings />} />
      <Route path="/schedule" element={<MySchedule/>} />
      <Route path="/" element={<DoctorHome />} />
    </Routes>
  );
}

export default DoctorRoutes;
