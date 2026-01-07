//The AuthContext uses React's Context API to create a centralized
//authentication state that any component in your app can access 
import { createContext, useContext, useState } from "react";

//Creating the context
const AuthContext = createContext();

//This is a wrapper component that provides authentication state to its children
export const AuthProvider = ({ children }) => {
  //token: Stores the JWT token, initialized from localStorage
  const [token, setToken] = useState(localStorage.getItem("token"));
  //user: Stores user data (parsed from localStorage JSON)
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  //Add token and user from localStorage
  const login = (newToken, userData) => {
    // newToken: The JWT authentication token from your backend (Save Token to localStorage)
    localStorage.setItem("token", newToken);
    // Save User Data to localStorage (JSON.stringify() converts JavaScript object ->> string)
    localStorage.setItem("user", JSON.stringify(userData));
    // token state updated
    setToken(newToken);
    // user state updated
    setUser(userData);
  };

  //Removes token and user from localStorage
  const logout = () => {
    // Clear ALL auth-related items from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    // Makes token, user, login, and logout available to all child components.
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
