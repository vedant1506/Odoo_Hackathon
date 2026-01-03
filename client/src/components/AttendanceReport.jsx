import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Calendar, TrendingUp, Clock, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import api from '../api/api';

const AttendanceReport = () => {
  const { user, hasRole } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
    totalDays: 0,
    attendancePercentage: 0
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = hasRole(['Admin', 'HR']);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      setSelectedEmployee(user.employeeId);
      fetchAttendanceReport(user.employeeId);
    }
  }, [startDate, endDate]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users/employees');
      setEmployees(res.data || []);
      if (res.data.length > 0) {
        setSelectedEmployee(res.data[0].employeeId);
        fetchAttendanceReport(res.data[0].employeeId);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  };

  const fetchAttendanceReport = async (empId) => {
    if (!empId) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/attendance/${empId}`);
      const allAttendance = res.data || [];
      
      // Filter by date range
      const filtered = allAttendance.filter(record => {
        const recordDate = new Date(record.date).toISOString().slice(0, 10);
        return recordDate >= startDate && recordDate <= endDate;
      });

      // Sort by date descending
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAttendanceData(filtered);
      
      // Calculate stats
      const present = filtered.filter(r => r.status === 'Present').length;
      const absent = filtered.filter(r => r.status === 'Absent').length;
      const halfDay = filtered.filter(r => r.status === 'Half-Day').length;
      const leave = filtered.filter(r => r.status === 'Leave').length;
      const totalDays = filtered.length;
      const attendancePercentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;
      
      setStats({ present, absent, halfDay, leave, totalDays, attendancePercentage });
    } catch (err) {
      console.error('Error fetching attendance report', err);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    fetchAttendanceReport(empId);
  };

  const handleExport = () => {
    // CSV Export
    const headers = ['Date', 'Status', 'Check-In', 'Check-Out', 'Hours Worked', 'Remarks'];
    const rows = attendanceData.map(record => [
      new Date(record.date).toLocaleDateString('en-IN'),
      record.status,
      record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      calculateHours(record.checkIn, record.checkOut),
      record.remarks || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedEmployee}_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    
    const inTime = new Date(checkIn);
    const outTime = new Date(checkOut);
    const diff = (outTime - inTime) / (1000 * 60 * 60);
    
    return diff > 0 ? `${diff.toFixed(1)} hrs` : 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-100 text-emerald-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Half-Day':
        return 'bg-amber-100 text-amber-800';
      case 'Leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {isAdmin && (
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name || emp.employeeId} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Total Days"
          value={stats.totalDays}
          color="bg-slate-100 text-slate-700"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Present"
          value={stats.present}
          color="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5" />}
          label="Absent"
          value={stats.absent}
          color="bg-red-100 text-red-700"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Half Day"
          value={stats.halfDay}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          icon={<MinusCircle className="w-5 h-5" />}
          label="Leave"
          value={stats.leave}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Attendance %"
          value={`${stats.attendancePercentage}%`}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Attendance Table */}
      {attendanceData.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Check-In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Check-Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceData.map((record) => {
                  const date = new Date(record.date);
                  const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
                  
                  return (
                    <tr key={record._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {date.toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {dayName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {calculateHours(record.checkIn, record.checkOut)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {record.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">No attendance records found for the selected period</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`${color} rounded-lg p-4`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AttendanceReport;
