import { Route, Routes } from "react-router-dom"
import BookAppointment from "../pages/patient/BookAppointment"
import MyAppointments from "../pages/patient/MyAppointments"
import Myprofile from "../pages/patient/Myprofile"
import PatientHome from "../pages/patient/PatientHome"

function PatientRoutes() {
    return (
        <Routes>
            <Route path="/appointments" element={<MyAppointments />} />
            <Route path="/profile" element={<Myprofile />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/" element={<PatientHome/>} />
        </Routes>
    )
}

export default PatientRoutes
