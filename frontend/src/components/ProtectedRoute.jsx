import { Navigate,  } from 'react-router-dom';
import { appContext } from '../context/AppContext';
import { useContext, } from 'react';

export const ProtectedRoute = ({ allowedRoles, children }) => {
    const {token,role,isAuthLoading}= useContext(appContext);
  if(isAuthLoading)
  {
    return null;
  }
  return token&&allowedRoles.includes(role)
      ? children
      : <Navigate to="/" replace />;

}