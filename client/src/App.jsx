import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import NotAuthorized from './pages/NotAuthorized';
import Profile from './pages/Profile';
import MyLeaves from './pages/MyLeaves';
import MyAttendance from './pages/MyAttendance';
import Reports from './pages/Reports';
import './App.css';

const RoleRedirect = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin()) return <Navigate to="/admin-dashboard" replace />;
  if (user?.role?.toLowerCase() === 'hr') return <Navigate to="/hr-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          
          {/* Employee Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-leaves"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <MyLeaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <MyAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'HR', 'Admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'HR', 'Admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<RoleRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
