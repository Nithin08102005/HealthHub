import { Routes, Route, Navigate } from "react-router-dom";
import MyAppointments from "../pages/doctor/MyAppointments";
import MyProfile from "../pages/doctor/MyProfile";
import DoctorHome from "../pages/doctor/DoctorHome";
function DoctorRoutes() {
  return (
    <Routes>
      <Route path="/appointments" element={<MyAppointments />} />
      <Route path="/profile" element={<MyProfile />} />
      <Route path="/" element={<DoctorHome />} />
    </Routes>
  );
}

export default DoctorRoutes;
