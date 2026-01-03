import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, TrendingUp, User, LogOut, Bell, Plus, CheckCircle, XCircle, AlertCircle, FileText, MapPin, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import api from '../api/api';
import NotificationBell from '../components/NotificationBell';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    leaveBalance: 20,
    leavesUsed: 0,
    leavesPending: 0,
    attendanceRate: 0,
    presentDays: 0,
    totalDays: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const dayKeyLocal = (value) => {
    try {
      const d = value ? new Date(value) : new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leavesRes, attendanceRes] = await Promise.all([
        api.get('/leaves'),
        api.get('/attendance/my-attendance')
      ]);

      const leaves = leavesRes.data || [];
      const attendance = attendanceRes.data || [];

      // Calculate leave stats
      const approved = leaves.filter(l => l.status?.toLowerCase() === 'approved').length;
      const pending = leaves.filter(l => l.status?.toLowerCase() === 'pending').length;
      const leaveDays = leaves
        .filter(l => l.status?.toLowerCase() === 'approved')
        .reduce((sum, l) => {
          const start = new Date(l.startDate);
          const end = new Date(l.endDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }, 0);

      // Calculate attendance stats
      const presentCount = attendance.filter(a => a.status?.toLowerCase() === 'present').length;
      const totalCount = attendance.length;
      const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

      setStats({
        leaveBalance: 20 - leaveDays,
        leavesUsed: leaveDays,
        leavesPending: pending,
        attendanceRate: rate,
        presentDays: presentCount,
        totalDays: totalCount
      });

      setRecentLeaves(leaves.slice(0, 5));
      setRecentAttendance(attendance.slice(0, 7));

      const todayKey = dayKeyLocal();
      const todaysRecord = attendance.find(a => a?.date && dayKeyLocal(a.date) === todayKey);
      setTodayAttendance(todaysRecord || null);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCheckIn = async () => {
    try {
      const nowIso = new Date().toISOString();
      const res = await api.post('/attendance/checkin', {
        date: nowIso,
        checkInTime: nowIso,
      });
      if (res?.data) {
        setTodayAttendance(res.data);
      }
      await fetchDashboardData();
    } catch (err) {
      console.error('Error checking in', err);
      const msg = err.response?.data?.message;
      // If backend says already checked in, refresh so UI switches to Check Out.
      if (typeof msg === 'string' && msg.toLowerCase().includes('already checked in')) {
        await fetchDashboardData();
        return;
      }
      alert(msg || 'Failed to check in. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    try {
      const nowIso = new Date().toISOString();
      const res = await api.post('/attendance/checkout', {
        date: nowIso,
        checkOutTime: nowIso,
      });
      if (res?.data) {
        setTodayAttendance(res.data);
      }
      await fetchDashboardData();
    } catch (err) {
      console.error('Error checking out', err);
      alert(err.response?.data?.message || 'Failed to check out. Please try again.');
    }
  };

  const isCheckedIn = Boolean(todayAttendance?.checkInTime && !todayAttendance?.checkOutTime);
  const isCheckedOut = Boolean(todayAttendance?.checkInTime && todayAttendance?.checkOutTime);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'present') return 'text-emerald-600 bg-emerald-100';
    if (s === 'rejected' || s === 'absent') return 'text-red-600 bg-red-100';
    if (s === 'pending') return 'text-amber-600 bg-amber-100';
    if (s === 'late') return 'text-orange-600 bg-orange-100';
    return 'text-slate-600 bg-slate-100';
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'present') return <CheckCircle className="w-4 h-4" />;
    if (s === 'rejected' || s === 'absent') return <XCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Dayflow Employee Portal
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Welcome back, <span className="font-semibold">{user?.employeeId || 'Employee'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading || isCheckedOut}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <LogIn className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg">Check In</h3>
              <p className="text-sm text-emerald-100 mt-1">
                {isCheckedOut ? 'Already checked out today' : 'Mark attendance now'}
              </p>
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={loading || isCheckedOut}
              className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <LogOutIcon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg">Check Out</h3>
              <p className="text-sm text-orange-100 mt-1">
                {isCheckedOut ? 'Already checked out today' : 'End your workday'}
              </p>
            </button>
          )}

          <button
            onClick={() => setShowLeaveModal(true)}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            <Plus className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">Apply Leave</h3>
            <p className="text-sm text-blue-100 mt-1">Request time off</p>
          </button>

          <button
            onClick={() => navigate('/my-attendance')}
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            <Clock className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">My Attendance</h3>
            <p className="text-sm text-purple-100 mt-1">View history</p>
          </button>

          <button
            onClick={() => navigate('/my-leaves')}
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            <FileText className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg">My Leaves</h3>
            <p className="text-sm text-amber-100 mt-1">Track requests</p>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Leave Balance"
            value={stats.leaveBalance}
            subtitle={`${stats.leavesUsed} used this year`}
            color="bg-cyan-100 text-cyan-700"
            loading={loading}
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Pending Leaves"
            value={stats.leavesPending}
            subtitle="Awaiting approval"
            color="bg-amber-100 text-amber-700"
            loading={loading}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            subtitle={`${stats.presentDays}/${stats.totalDays} days`}
            color="bg-emerald-100 text-emerald-700"
            loading={loading}
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Present Days"
            value={stats.presentDays}
            subtitle="This period"
            color="bg-blue-100 text-blue-700"
            loading={loading}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leaves */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Recent Leave Requests
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : recentLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No leave requests yet</p>
                </div>
              ) : (
                recentLeaves.map((leave) => (
                  <div key={leave._id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{leave.reason || 'Personal Leave'}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        {leave.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Recent Attendance
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : recentAttendance.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No attendance records yet</p>
                </div>
              ) : (
                recentAttendance.map((att) => (
                  <div key={att._id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">
                          {new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        {att.checkInTime && (
                          <p className="text-sm text-slate-600 mt-1">
                            Check-in: {new Date(att.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(att.status)}`}>
                        {getStatusIcon(att.status)}
                        {att.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <LeaveApplicationModal
          onClose={() => setShowLeaveModal(false)}
          onSuccess={() => {
            setShowLeaveModal(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color, loading }) => (
  <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-600">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        )}
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const LeaveApplicationModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Sick Leave'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/leaves/apply', formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Apply for Leave</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Vacation</option>
              <option>Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain your leave reason..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
