import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking authentication...</div>;
  }

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // if the user not a admin then navigate to 'home' i.e '/'
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin authorized
  return children;
};

export default AdminRoute;