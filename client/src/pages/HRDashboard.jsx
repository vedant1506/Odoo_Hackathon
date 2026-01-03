import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminGetEmployees, adminGetAllLeaves, adminApproveLeave } from '../api/api';
import UserList from '../components/UserList';
import LeaveApprovals from '../components/LeaveApprovals';
import AttendanceTracker from '../components/AttendanceTracker';
import { Users, Calendar, LogOut, Briefcase, Clock, CheckCircle } from 'lucide-react';
import api from '../api/api';

// HR-focused dashboard: people directory, leave approvals, attendance snapshots (no payroll)
const HRDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [leaveTotals, setLeaveTotals] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [attendanceToday, setAttendanceToday] = useState({ present: 0, absent: 0, late: 0, total: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    // Lightweight counts for header cards
    const fetchCounts = async () => {
      try {
        setLoadingSummary(true);
        const [employeesRes, leavesRes, attendanceRes] = await Promise.all([
          adminGetEmployees(),
          adminGetAllLeaves(),
          api.get('/attendance/all'),
        ]);

        // Employees
        setEmployeeCount(employeesRes.data?.length || 0);

        // Leaves
        const leaves = leavesRes.data || [];
        const totals = leaves.reduce(
          (acc, l) => {
            const key = (l.status || 'Pending').toLowerCase();
            if (key === 'approved') acc.approved += 1;
            else if (key === 'rejected') acc.rejected += 1;
            else acc.pending += 1;
            return acc;
          },
          { pending: 0, approved: 0, rejected: 0 }
        );
        setLeaveTotals(totals);
        setPendingLeaves(totals.pending);

        // Attendance today
        const today = new Date().toISOString().split('T')[0];
        const todays = (attendanceRes.data || []).filter((a) =>
          new Date(a.date).toISOString().startsWith(today)
        );
        const attendanceAgg = todays.reduce(
          (acc, a) => {
            const status = (a.status || 'Present').toLowerCase();
            if (status === 'late') acc.late += 1;
            else if (status === 'absent') acc.absent += 1;
            else acc.present += 1;
            acc.total += 1;
            return acc;
          },
          { present: 0, absent: 0, late: 0, total: 0 }
        );
        setAttendanceToday(attendanceAgg);
      } catch (err) {
        console.error('Error loading HR summary', err);
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchCounts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dayflow HR</h1>
            <p className="text-sm text-slate-500">HR workspace for people and leave operations</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Users className="w-6 h-6" />}
            title="Employees"
            value={employeeCount}
            accent="bg-cyan-100 text-cyan-700"
            loading={loadingSummary}
          />
          <SummaryCard
            icon={<Calendar className="w-6 h-6" />}
            title="Pending Leaves"
            value={pendingLeaves}
            accent="bg-amber-100 text-amber-700"
            loading={loadingSummary}
            meta={`Approved ${leaveTotals.approved} · Rejected ${leaveTotals.rejected}`}
          />
          <SummaryCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Present Today"
            value={attendanceToday.present}
            accent="bg-emerald-100 text-emerald-700"
            loading={loadingSummary}
            meta={`Late ${attendanceToday.late}`}
          />
          <SummaryCard
            icon={<Clock className="w-6 h-6" />}
            title="Total Check-ins"
            value={attendanceToday.total}
            accent="bg-indigo-100 text-indigo-700"
            loading={loadingSummary}
            meta={`Absent ${attendanceToday.absent}`}
          />
        </div>

        {/* HR tools */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Employee Directory - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-slate-800">Employee Directory</h2>
              <p className="text-xs text-slate-500 ml-auto">Manage salaries</p>
            </div>
            <UserList />
          </div>

          {/* Right sidebar - stacked sections */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-cyan-600" />
                <h2 className="text-base font-semibold text-slate-800">Leave Approvals</h2>
              </div>
              <LeaveApprovals />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <h2 className="text-base font-semibold text-slate-800">Attendance</h2>
              </div>
              <AttendanceTracker compact />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
const SummaryCard = ({ icon, title, value, accent, loading, meta }) => (
  <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accent}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      {loading ? (
        <div className="h-7 w-16 bg-slate-200 rounded animate-pulse"></div>
      ) : (
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      )}
      {meta && <p className="text-xs text-slate-500 mt-1">{meta}</p>}
    </div>
  </div>
);

export default HRDashboard;
