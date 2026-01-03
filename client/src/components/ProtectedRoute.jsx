import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    // Redirect to Not Authorized or Employee Dashboard
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

export default ProtectedRoute;