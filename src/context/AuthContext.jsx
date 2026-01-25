//The AuthContext uses React's Context API to create a centralized
//authentication state that any component in your app can access
import { createContext, useContext, useState, useEffect } from "react";

//Creating the context
const AuthContext = createContext();

//This is a wrapper component that provides authentication state to its children
export const AuthProvider = ({ children }) => {
  // Create a state variable to store the JWT token
  // Initially set to null (assume user is logged out)
  const [token, setToken] = useState(null);

  // Create a state variable to store logged-in user data
  // Initially set to null
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // useEffect runs AFTER the component mounts
  // This effect runs ONLY ONCE because of the empty dependency array []
  useEffect(() => {
    // Read the token from browser localStorage (persistent storage)
    const storedToken = localStorage.getItem("token");

    // Read the user data from localStorage (stored as JSON string)
    const storedUser = localStorage.getItem("user");

    // Check if BOTH token and user data exist
    // This avoids half-authenticated states
    if (storedToken && storedUser) {
      // Restore token into React state (memory)
      setToken(storedToken);

      // Convert JSON string back into JavaScript object
      // and restore user data into React state
      setUser(JSON.parse(storedUser));
    }

     // Auth check finished
    setLoading(false);

    // Empty array = run this effect only once when app loads
  }, []);

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
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
