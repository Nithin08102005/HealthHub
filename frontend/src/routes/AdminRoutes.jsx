import { Routes, Route, Navigate } from "react-router-dom";
import AdminHome from "../pages/admin/AdminHome";
import ManagePatients from "../pages/admin/ManagePatients";
import ManageDoctors from "../pages/admin/ManageDoctors";
import ManageAppointments from "../pages/admin/ManageAppointments";
import Analytics from "../pages/admin/Analytics";
import AddDoctor from "../pages/admin/AddDoctor";
function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/patients" element={<ManagePatients/>}/>
            <Route path="/doctors" element={<ManageDoctors/>}/>
            <Route path="/appointments" element={<ManageAppointments/>} />
            <Route path="/analytics" element={<Analytics/>}/>
            <Route path="/add-doctor" element={<AddDoctor/>}/>

        </Routes>
    )
}

export default AdminRoutes
