import { useContext, useEffect } from "react"
import { appContext } from "../context/AppContext"
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate=useNavigate();
     const {token,role}=useContext(appContext);
   useEffect(() => {
  if (!token) return;
    console.log(role);
  if (role && role !== false) {
    navigate(`/${role}`);
  }
}, [role, token, navigate]);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">HealthHub</h1>
            <p className="text-lg text-gray-600 mb-8">Your health, our priority.</p>
           
        </div>
    )
}

export default Home
