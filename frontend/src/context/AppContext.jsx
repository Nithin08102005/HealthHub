/* eslint-disable no-unused-vars */
import { createContext, useEffect, useState } from "react";
import axios from "axios";

// eslint-disable-next-line react-refresh/only-export-components
export const appContext = createContext();

const AppContextProvider = (props) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");

    return storedToken || "";
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userData, setUserData] = useState(false);
  const [role, setRole] = useState(false);
  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };
  const loadUserData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/user/getUserDetails",
        {
          headers: { token },
        }
      );

      if (data.success) {
        setUserData(data.data);
        setRole(data.role);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }finally{
        setIsAuthLoading(false);
    }
  };
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      setToken("");
      localStorage.removeItem("token");
    }
    if (token&&!userData) {
      loadUserData();
      
    }
    else setIsAuthLoading(false);
  }, [token]);

  const value = {
    token,
    setToken,
    userData,
    isAuthLoading,
    setUserData,
    setRole,
    loadUserData,
    role
  };

  return (
    <appContext.Provider value={value}>{props.children}</appContext.Provider>
  );
};

export default AppContextProvider;
