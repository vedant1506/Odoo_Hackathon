import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, TrendingUp, MapPin, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import api from '../api/api';
import NotificationBell from '../components/NotificationBell';

const MyAttendance = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0, rate: 0 });
  const [filter, setFilter] = useState('all'); // all, thisMonth, lastMonth
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('daily'); // daily or weekly
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance');
      const data = res.data || [];
      setAttendance(data.reverse());
      
      // Check today's record
      const today = new Date().toISOString().split('T')[0];
      const todaysRecord = data.find(a => 
        new Date(a.date).toISOString().split('T')[0] === today
      );
      setTodayRecord(todaysRecord);
      
      // Calculate stats
      const present = data.filter(a => a.status?.toLowerCase() === 'present').length;
      const absent = data.filter(a => a.status?.toLowerCase() === 'absent').length;
      const late = data.filter(a => a.status?.toLowerCase() === 'late').length;
      const total = data.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      setStats({ present, absent, late, total, rate });
    } catch (err) {
      console.error('Error fetching attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const alreadyMarked = attendance.some(a => 
        new Date(a.date).toISOString().split('T')[0] === today
      );

      if (alreadyMarked) {
        alert('You have already marked attendance for today!');
        return;
      }

      await api.post('/attendance/checkin', {
        date: new Date().toISOString()
      });
      
      alert('Attendance marked successfully!');
      fetchAttendance();
    } catch (err) {
      console.error('Error marking attendance', err);
      alert(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/checkout', {
        date: new Date().toISOString()
      });
      
      alert('Checked out successfully!');
      fetchAttendance();
    } catch (err) {
      console.error('Error checking out', err);
      alert(err.response?.data?.message || 'Failed to check out');
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'present') return 'text-emerald-600 bg-emerald-100';
    if (s === 'absent') return 'text-red-600 bg-red-100';
    if (s === 'late') return 'text-orange-600 bg-orange-100';
    return 'text-slate-600 bg-slate-100';
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    if (s === 'present') return <CheckCircle className="w-4 h-4" />;
    if (s === 'absent') return <XCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const filteredAttendance = attendance.filter(a => {
    const date = new Date(a.date);
    const now = new Date();
    
    if (filter === 'thisMonth') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (filter === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return date >= start && date <= end;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Attendance</h1>
            <p className="text-slate-600 mt-1">Track your attendance records</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            {todayRecord && todayRecord.checkIn && !todayRecord.checkOut ? (
              <button
                onClick={handleCheckOut}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
              >
                <Clock className="w-4 h-4" />
                Check Out
              </button>
            ) : (
              <button
                onClick={markAttendance}
                disabled={todayRecord}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4" />
                {todayRecord ? 'Already Checked In' : 'Check In Now'}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Present</p>
                <p className="text-2xl font-bold text-slate-900">{stats.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Absent</p>
                <p className="text-2xl font-bold text-slate-900">{stats.absent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Late</p>
                <p className="text-2xl font-bold text-slate-900">{stats.late}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Rate</p>
                <p className="text-2xl font-bold text-slate-900">{stats.rate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700">View:</span>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'daily' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'weekly' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Filter:</span>
            </div>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilter('thisMonth')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'thisMonth' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter('lastMonth')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'lastMonth' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Last Month
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <span className="text-slate-600">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Attendance List */}
        {viewMode === 'daily' ? (
          <DailyView 
            loading={loading}
            filteredAttendance={filteredAttendance}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        ) : (
          <WeeklyView 
            attendance={attendance}
            getStatusColor={getStatusColor}
          />
        )}
      </div>
    </div>
  );
};

// Daily View Component
const DailyView = ({ loading, filteredAttendance, getStatusColor, getStatusIcon }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
    <div className="px-6 py-4 bg-linear-to-r from-cyan-50 to-blue-50 border-b border-slate-200">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2">
        <Clock className="w-5 h-5 text-cyan-600" />
        Attendance Records ({filteredAttendance.length})
      </h2>
    </div>

    <div className="overflow-x-auto">
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
          <p className="text-slate-600 mt-4">Loading attendance...</p>
        </div>
      ) : filteredAttendance.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">No attendance records found</p>
          <p className="text-sm mt-2">Mark your attendance to see records here</p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAttendance.map((record) => (
              <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-slate-800">
                    {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

// Weekly View Component
const WeeklyView = ({ attendance, getStatusColor }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  const getWeekDates = (startDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(now.setDate(diff)));
  };

  const getAttendanceForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendance.find(a => 
      new Date(a.date).toISOString().split('T')[0] === dateStr
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-linear-to-r from-cyan-50 to-blue-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            Weekly View
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={goToCurrentWeek}
              className="px-3 py-1 bg-cyan-600 text-white hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors"
            >
              This Week
            </button>
            <button
              onClick={goToNextWeek}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-3">
          {weekDates.map((date, index) => {
            const record = getAttendanceForDate(date);
            const today = isToday(date);
            
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 transition-all ${
                  today 
                    ? 'border-cyan-500 bg-cyan-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-xs font-semibold text-slate-600 uppercase">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${today ? 'text-cyan-600' : 'text-slate-800'}`}>
                    {date.getDate()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>

                {record ? (
                  <div className="space-y-2">
                    <span className={`block px-2 py-1 rounded-lg text-xs font-semibold text-center ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                    {record.checkInTime && (
                      <div className="text-xs text-slate-600 text-center">
                        <div className="font-medium">In: {new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    )}
                    {record.checkOutTime && (
                      <div className="text-xs text-slate-600 text-center">
                        <div className="font-medium">Out: {new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium">
                      No Record
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
