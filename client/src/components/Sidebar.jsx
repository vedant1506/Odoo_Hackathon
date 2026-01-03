import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  Settings, 
  Briefcase,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const isHR = user?.role?.toLowerCase() === 'hr';
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isEmployee = !isHR && !isAdmin;

  const employeeLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-leaves', icon: Calendar, label: 'My Leaves' },
    { to: '/my-attendance', icon: Clock, label: 'My Attendance' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const hrLinks = [
    { to: '/hr-dashboard', icon: LayoutDashboard, label: 'HR Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/leave-management', icon: Calendar, label: 'Leave Management' },
    { to: '/attendance-management', icon: Clock, label: 'Attendance' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/users', icon: Users, label: 'User Management' },
    { to: '/leaves', icon: Calendar, label: 'Leaves' },
    { to: '/attendance', icon: Clock, label: 'Attendance' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const links = isAdmin ? adminLinks : isHR ? hrLinks : employeeLinks;

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive
        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 shadow-lg transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Dayflow</h2>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? 'Admin' : isHR ? 'HR Portal' : 'Employee'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
            >
              {isOpen ? (
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClasses}>
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
