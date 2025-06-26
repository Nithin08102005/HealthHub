import { Routes, Route, Navigate } from "react-router-dom";
import AdminHome from "../pages/admin/AdminHome";
import AllPatients from "../pages/admin/AllPatients";
import AllDoctors from "../pages/admin/AllDoctors";
import ManageAppointments from "../pages/admin/ManageAppointments";
import AddDoctor from "../pages/admin/AddDoctor";
function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/patients" element={<AllPatients/>}/>
            <Route path="/doctors" element={<AllDoctors/>}/>
            <Route path="/appointments" element={<ManageAppointments/>} />
            <Route path="/add-doctor" element={<AddDoctor/>}/>

        </Routes>
    )
}

export default AdminRoutes
