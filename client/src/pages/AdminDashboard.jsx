import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/UserList';
import LeaveApprovals from '../components/LeaveApprovals';
import AttendanceTracker from '../components/AttendanceTracker';
import PayrollControl from '../components/PayrollControl';

const AdminDashboard = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/not-authorized');
    }
  }, [isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dayflow HRMS - Admin Dashboard</h1>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <UserList />
          <LeaveApprovals />
          <AttendanceTracker />
          <PayrollControl />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;