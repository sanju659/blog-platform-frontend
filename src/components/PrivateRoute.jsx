import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  // Wait until auth check completes
  if (loading) {
    return <div className="p-6">Checking authentication...</div>;
  }

  // Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated
  return children;
};

export default PrivateRoute;
