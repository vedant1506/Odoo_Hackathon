import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotAuthorized from './pages/NotAuthorized';
<<<<<<< HEAD
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
=======
import HRDashboard from './pages/HRDashboard';
>>>>>>> 271428b906ca69bd5efe1bfb93af5e4ea9d22cd2

function App() {
  const { user } = useAuth();

  return (
<<<<<<< HEAD
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
          
          {/* HR Routes */}
          <Route
            path="/hr-dashboard"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<RoleRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
=======
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              roles={['Admin', 'Employee', 'HR']}
              element={
                user?.role === 'Admin'
                  ? <Navigate to="/admin-dashboard" />
                  : user?.role === 'HR'
                    ? <Navigate to="/hr-dashboard" />
                    : <Dashboard />
              }
            />
          }
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute roles={['Employee']} element={<Dashboard />} />}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute roles={['Admin']} element={<AdminDashboard />} />}
        />
        <Route
          path="/hr-dashboard"
          element={<ProtectedRoute roles={['HR']} element={<HRDashboard />} />}
        />
      </Routes>
    </Router>
>>>>>>> 271428b906ca69bd5efe1bfb93af5e4ea9d22cd2
  );
}

export default App;
