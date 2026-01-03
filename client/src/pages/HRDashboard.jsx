import React from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Users, Calendar, CheckSquare, BarChart2, LogOut, UserPlus, Briefcase } from 'lucide-react';
import UserList from '../components/UserList';
import LeaveApprovals from '../components/LeaveApprovals';
import AttendanceManager from '../components/AttendanceManager';
import { useAuth } from '../context/AuthContext';

const HRDashboard = () => {
  const { logout } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-gray-700' : ''
    }`;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase />
            HR Dashboard
          </h2>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavLink to="employees" className={navLinkClasses}>
            <Users className="w-5 h-5 mr-3" />
            Manage Employees
          </NavLink>
          <NavLink to="leaves" className={navLinkClasses}>
            <CheckSquare className="w-5 h-5 mr-3" />
            Leave Approvals
          </NavLink>
          <NavLink to="attendance" className={navLinkClasses}>
            <Calendar className="w-5 h-5 mr-3" />
            Attendance Records
          </NavLink>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-gray-200 hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="employees" replace />} />
          <Route path="employees" element={<UserList />} />
          <Route path="leaves" element={<LeaveApprovals />} />
          <Route path="attendance" element={<AttendanceManager />} />
        </Routes>
      </main>
    </div>
  );
};

export default HRDashboard;
