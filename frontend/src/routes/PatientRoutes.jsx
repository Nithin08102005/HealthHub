import { Route, Routes } from "react-router-dom"
import BookAppointment from "../pages/patient/BookAppointment"
import MyAppointments from "../pages/patient/MyAppointments"
import Myprofile from "../pages/patient/Myprofile"
import PatientHome from "../pages/patient/PatientHome"
import DoctorsList from "../pages/patient/DoctorsList"

function PatientRoutes() {
    return (
        <Routes>
            <Route path="/appointments" element={<MyAppointments />} />
            <Route path="/profile" element={<Myprofile />} />
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/book-appointment/:id" element={<BookAppointment />} />
            <Route path="/" element={<PatientHome/>} />
        </Routes>
    )
}

export default PatientRoutes
