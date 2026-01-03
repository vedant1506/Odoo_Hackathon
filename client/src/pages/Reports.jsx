import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Calendar, DollarSign, Users, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import api from '../api/api';
import SalarySlip from '../components/SalarySlip';
import AttendanceReport from '../components/AttendanceReport';

const Reports = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('salary-slip');
  const [analytics, setAnalytics] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    avgAttendance: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasRole(['Admin', 'HR'])) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [employeesRes, leavesRes, attendanceRes] = await Promise.all([
        api.get('/users/employees'),
        api.get('/leaves/all'),
        api.get('/attendance/all')
      ]);

      const employees = employeesRes.data || [];
      const leaves = leavesRes.data || [];
      const attendance = attendanceRes.data || [];

      const totalPayroll = employees.reduce((sum, emp) => sum + (emp.salary?.total || 0), 0);
      const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      const avgAttendance = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

      setAnalytics({
        totalEmployees: employees.length,
        totalPayroll,
        avgAttendance,
        pendingLeaves
      });
    } catch (err) {
      console.error('Error fetching analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = hasRole(['Admin', 'HR']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Analytics & Reports</h1>
          <p className="text-slate-600 mt-1">
            {isAdmin ? 'Comprehensive insights and downloadable reports' : 'View and download your reports'}
          </p>
        </div>

        {/* Analytics Cards - Admin/HR Only */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <AnalyticsCard
              icon={<Users className="w-6 h-6" />}
              title="Total Employees"
              value={analytics.totalEmployees}
              color="bg-blue-100 text-blue-700"
              loading={loading}
            />
            <AnalyticsCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Monthly Payroll"
              value={`₹${analytics.totalPayroll.toLocaleString('en-IN')}`}
              color="bg-emerald-100 text-emerald-700"
              loading={loading}
            />
            <AnalyticsCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Avg Attendance"
              value={`${analytics.avgAttendance}%`}
              color="bg-purple-100 text-purple-700"
              loading={loading}
            />
            <AnalyticsCard
              icon={<Calendar className="w-6 h-6" />}
              title="Pending Leaves"
              value={analytics.pendingLeaves}
              color="bg-amber-100 text-amber-700"
              loading={loading}
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 mb-6">
          <div className="flex overflow-x-auto">
            <TabButton
              icon={<FileText className="w-5 h-5" />}
              label="Salary Slip"
              isActive={activeTab === 'salary-slip'}
              onClick={() => setActiveTab('salary-slip')}
            />
            <TabButton
              icon={<BarChart3 className="w-5 h-5" />}
              label="Attendance Report"
              isActive={activeTab === 'attendance'}
              onClick={() => setActiveTab('attendance')}
            />
            {isAdmin && (
              <>
                <TabButton
                  icon={<PieChart className="w-5 h-5" />}
                  label="Leave Summary"
                  isActive={activeTab === 'leave-summary'}
                  onClick={() => setActiveTab('leave-summary')}
                />
                <TabButton
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Payroll Summary"
                  isActive={activeTab === 'payroll-summary'}
                  onClick={() => setActiveTab('payroll-summary')}
                />
              </>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          {activeTab === 'salary-slip' && <SalarySlip />}
          {activeTab === 'attendance' && <AttendanceReport />}
          {activeTab === 'leave-summary' && isAdmin && <LeaveSummary />}
          {activeTab === 'payroll-summary' && isAdmin && <PayrollSummary />}
        </div>
      </div>
    </div>
  );
};

const AnalyticsCard = ({ icon, title, value, color, loading }) => (
  <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-600">{title}</p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        )}
      </div>
    </div>
  </div>
);

const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
      isActive
        ? 'text-cyan-600 border-cyan-600 bg-cyan-50'
        : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const LeaveSummary = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/all');
      setLeaves(res.data || []);
    } catch (err) {
      console.error('Error fetching leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = leaves.reduce((acc, leave) => {
    const status = leave.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-8">Loading leave summary...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Leave Summary</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700 font-medium">Pending</p>
          <p className="text-3xl font-bold text-amber-800 mt-1">{summary.Pending || 0}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-700 font-medium">Approved</p>
          <p className="text-3xl font-bold text-emerald-800 mt-1">{summary.Approved || 0}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-800 mt-1">{summary.Rejected || 0}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map((leave) => (
              <tr key={leave._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-900">{leave.employeeId}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{leave.type}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PayrollSummary = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Error fetching employees', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPayroll = employees.reduce((sum, emp) => sum + (emp.salary?.total || 0), 0);
  const avgSalary = employees.length > 0 ? totalPayroll / employees.length : 0;

  if (loading) {
    return <div className="text-center py-8">Loading payroll summary...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Payroll Summary</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-700 font-medium">Total Monthly Payroll</p>
          <p className="text-3xl font-bold text-emerald-800 mt-1">₹{totalPayroll.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Average Salary</p>
          <p className="text-3xl font-bold text-blue-800 mt-1">₹{Math.round(avgSalary).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Basic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">HRA</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{emp.name || emp.employeeId}</div>
                  <div className="text-xs text-slate-500">{emp.employeeId}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{emp.department || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-slate-900">₹{(emp.salary?.basic || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-sm text-slate-900">₹{(emp.salary?.hra || 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-sm font-semibold text-emerald-600">₹{(emp.salary?.total || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
