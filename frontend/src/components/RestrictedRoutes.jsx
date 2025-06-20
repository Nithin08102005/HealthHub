import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { appContext } from "../context/AppContext";

export const RestrictedRoute = ({ children }) => {
  const { token, role } = useContext(appContext);
  if (!token) return children;

   if(!role) return null;
  return <Navigate to={`/${role}`} replace />;
};
