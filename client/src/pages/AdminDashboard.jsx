import React, { useState, useEffect } from 'react';
import { adminGetEmployees, adminGetAllLeaves, adminApproveLeave } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, CheckCircle, XCircle, Clock, LogOut, Briefcase, DollarSign, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onLeaveToday: 0,
    pendingLeaves: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, leavesRes] = await Promise.all([
        adminGetEmployees(),
        adminGetAllLeaves(),
      ]);

      const employeeData = employeesRes.data || [];
      const leaveData = leavesRes.data || [];

      setEmployees(employeeData);
      setLeaves(leaveData);
      calculateStats(employeeData, leaveData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const calculateStats = (employeeData, leaveData) => {
    const today = new Date();
    const onLeaveToday = leaveData.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return leave.status === 'Approved' && today >= startDate && today <= endDate;
    }).length;

    setStats({
      totalEmployees: employeeData.length,
      onLeaveToday,
      pendingLeaves: leaveData.filter(l => l.status === 'Pending').length,
    });
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await adminApproveLeave(leaveId, status);
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing leave:`, error);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLeaveDataForChart = () => {
    const data = leaves.reduce((acc, leave) => {
      const month = new Date(leave.startDate).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { name: month, Approved: 0, Rejected: 0, Pending: 0 };
      }
      acc[month][leave.status]++;
      return acc;
    }, {});
    return Object.values(data);
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection stats={stats} chartData={getLeaveDataForChart()} />;
      case 'employees':
        return <EmployeesSection employees={employees} />;
      case 'leaves':
        return <LeavesSection leaves={leaves} onAction={handleLeaveAction} />;
      default:
        return <OverviewSection stats={stats} chartData={getLeaveDataForChart()} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold text-center border-b border-slate-700">
          Dayflow
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarButton
            icon={<Users />}
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <SidebarButton
            icon={<Briefcase />}
            label="Employees"
            isActive={activeTab === 'employees'}
            onClick={() => setActiveTab('employees')}
          />
          <SidebarButton
            icon={<Calendar />}
            label="Leave Requests"
            isActive={activeTab === 'leaves'}
            onClick={() => setActiveTab('leaves')}
          />
          <SidebarButton
            icon={<DollarSign />}
            label="Payroll"
            isActive={activeTab === 'payroll'}
            onClick={() => setActiveTab('payroll')}
          />
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors shadow-sm">
            <UserPlus className="w-5 h-5" />
            Add Employee
          </button>
        </header>
        {renderSection()}
      </main>
    </div>
  );
};

const SidebarButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
      isActive
        ? 'bg-slate-700 text-cyan-400'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span>{label}</span>
  </button>
);

const OverviewSection = ({ stats, chartData }) => (
  <div className="space-y-8">
    {/* Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={<Users />} title="Total Employees" value={stats.totalEmployees} color="blue" />
      <StatCard icon={<Calendar />} title="On Leave Today" value={stats.onLeaveToday} color="green" />
      <StatCard icon={<Clock />} title="Pending Leaves" value={stats.pendingLeaves} color="orange" />
    </div>

    {/* Leave Requests Chart */}
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Leave Requests Overview</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
            <YAxis tick={{ fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #e0e0e0',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="Approved" fill="#22c55e" />
            <Bar dataKey="Rejected" fill="#ef4444" />
            <Bar dataKey="Pending" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-6">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colors[color]}`}>
        {React.cloneElement(icon, { className: 'w-8 h-8' })}
      </div>
      <div>
        <p className="text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const EmployeesSection = ({ employees }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <table className="w-full">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {employees.map(emp => (
          <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
              <div className="font-medium text-slate-900">{emp.employeeId}</div>
              <div className="text-sm text-slate-500">{emp.email}</div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-700">{emp.role}</td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const LeavesSection = ({ leaves, onAction }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <table className="w-full">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee ID</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {leaves.map(leave => (
          <tr key={leave._id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 text-sm font-medium text-slate-900">{leave.employeeId}</td>
            <td className="px-6 py-4 text-sm text-slate-700">
              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-sm text-slate-700">{leave.type}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {leave.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm space-x-2">
              {leave.status === 'Pending' && (
                <>
                  <button onClick={() => onAction(leave._id, 'Approved')} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => onAction(leave._id, 'Rejected')} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;