import { Routes,Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Navbar from './components/Navbar.jsx';
import { Toaster } from 'react-hot-toast';
import PatientHome from './pages/patient/PatientHome.jsx';
import DoctorHome from './pages/doctor/DoctorHome.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { RestrictedRoute } from './components/RestrictedRoutes.jsx';
import PatientRoutes from './routes/PatientRoutes.jsx';
import DoctorRoutes from './routes/DoctorRoutes.jsx';
import AdminRoutes from './routes/AdminRoutes.jsx';
import PatientLayout from './components/PatientLayout.jsx';
import DoctorLayout from './components/DoctorLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import Footer from "./components/Footer.jsx"
function App() {

  return (
    <div className="">
      <Toaster/>
      <Navbar/>
      <Routes>
     <Route path="/" element={<Home />} />
     <Route path="/login" element={
      <RestrictedRoute>
        <Login/>
      </RestrictedRoute>
      } />
     <Route path="/signup" element={
      <RestrictedRoute>
      <SignUp/>
      </RestrictedRoute>
      }/>
      <Route 
          path="/patient/*" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout/>
            </ProtectedRoute>
          } 
        >
           <Route path="*" element={<PatientRoutes />} /> 
        </Route>
     <Route path="/doctor/*" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorLayout/>
            </ProtectedRoute>
      }>
            <Route path="*" element={<DoctorRoutes />} />
      </Route>
       <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout/>
            </ProtectedRoute>
      }>
            <Route path="*" element={<AdminRoutes />} />
      </Route>
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
