import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotAuthorized from './pages/NotAuthorized';
import HRDashboard from './pages/HRDashboard';

function App() {
  const { user } = useAuth();

  return (
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
  );
}

export default App;
