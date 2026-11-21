//The AuthContext uses React's Context API to create a centralized
//authentication state that any component in your app can access
import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/authAPi";

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
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Refresh in the background so stored data (bio, username lock...) is never stale
      getMe()
        .then((res) => {
          // Ignore the result if the user logged out in the meantime
          if (localStorage.getItem("token") !== storedToken) return;
          localStorage.setItem("user", JSON.stringify(res.data));
          setUser(res.data);
        })
        .catch(() => {});
    }

    setLoading(false);
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
