import React, { useState, useEffect } from 'react';
import { checkIn, checkOut, getAttendance } from '../api/api';
import { 
  Clock, Calendar, CheckCircle, XCircle, AlertCircle, 
  LogIn, LogOut, TrendingUp, Filter
} from 'lucide-react';

const AttendanceManager = ({ onStatusChange }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [todayRecord, setTodayRecord] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const notifyStatus = (checkedInState, record = null) => {
    if (typeof onStatusChange === 'function') {
      onStatusChange({ checkedIn: checkedInState, todayRecord: record });
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await getAttendance();
      const records = response.data || [];
      setAttendanceRecords(records);
      
      // Check if already checked in today
      const today = new Date().toISOString().split('T')[0];
      const todaysRecord = records.find(r => 
        r.date && r.date.split('T')[0] === today
      );
      
      setTodayRecord(todaysRecord);
      
      const currentlyCheckedIn = Boolean(
        todaysRecord && todaysRecord.checkInTime && !todaysRecord.checkOutTime
      );
      setIsCheckedIn(currentlyCheckedIn);
      notifyStatus(currentlyCheckedIn, todaysRecord || null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const checkInTime = new Date().toISOString();
      await checkIn({ checkInTime, date: new Date().toISOString() });
      
      const newRecord = { date: new Date().toISOString(), checkInTime, status: 'Present' };
      setIsCheckedIn(true);
      setTodayRecord(newRecord);
      notifyStatus(true, newRecord);
      setMessage({ 
        type: 'success', 
        text: `Checked in successfully at ${new Date().toLocaleTimeString()}` 
      });
      
      // Refresh attendance data
      setTimeout(() => fetchAttendanceData(), 500);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to check in. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const checkOutTime = new Date().toISOString();
      await checkOut({ checkOutTime, date: new Date().toISOString() });
      
      const updatedRecord = {
        ...(todayRecord || {}),
        date: todayRecord?.date || new Date().toISOString(),
        checkOutTime,
        status: todayRecord?.status || 'Present'
      };
      setIsCheckedIn(false);
      setTodayRecord(updatedRecord);
      notifyStatus(false, updatedRecord);
      setMessage({ 
        type: 'success', 
        text: `Checked out successfully at ${new Date().toLocaleTimeString()}` 
      });
      
      // Refresh attendance data
      setTimeout(() => fetchAttendanceData(), 500);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to check out. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'half-day':
      case 'halfday':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'late':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'half-day':
      case 'halfday':
      case 'late':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    try {
      const diff = new Date(checkOut) - new Date(checkIn);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return '-';
    }
  };

  const getDailyRecords = () => {
    return attendanceRecords.slice(0, 7); // Last 7 days
  };

  const getWeeklyRecords = () => {
    // Group by week
    const weeks = {};
    attendanceRecords.forEach(record => {
      if (!record.date) return;
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          weekStart: weekKey,
          records: [],
          totalPresent: 0,
          totalAbsent: 0,
          totalHalfDay: 0
        };
      }
      
      weeks[weekKey].records.push(record);
      
      if (record.status?.toLowerCase() === 'present') weeks[weekKey].totalPresent++;
      else if (record.status?.toLowerCase() === 'absent') weeks[weekKey].totalAbsent++;
      else if (record.status?.toLowerCase() === 'half-day' || record.status?.toLowerCase() === 'halfday') 
        weeks[weekKey].totalHalfDay++;
    });
    
    return Object.values(weeks).slice(0, 4); // Last 4 weeks
  };

  const displayRecords = viewMode === 'daily' ? getDailyRecords() : getWeeklyRecords();

  return (
    <div className="space-y-6">
      {/* Check-in/Out Section */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Attendance Tracking</h2>
            <p className="text-indigo-100">
              {isCheckedIn ? 'You are currently checked in' : 'Start your day by checking in'}
            </p>
            {todayRecord && (
              <div className="mt-3 flex items-center gap-4 text-sm">
                {todayRecord.checkInTime && (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span>In: {formatTime(todayRecord.checkInTime)}</span>
                  </div>
                )}
                {todayRecord.checkOutTime && (
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Out: {formatTime(todayRecord.checkOutTime)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={loading}
            className={`flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isCheckedIn
                ? 'bg-white text-purple-600 hover:bg-gray-100'
                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                Processing...
              </>
            ) : isCheckedIn ? (
              <>
                <LogOut className="w-6 h-6" />
                Check Out
              </>
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                Check In
              </>
            )}
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500 bg-opacity-20 border border-green-300' 
              : 'bg-red-500 bg-opacity-20 border border-red-300'
          }`}>
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </div>

      {/* Attendance Records Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Attendance Records</h3>
              <p className="text-sm text-gray-600">Track your attendance history</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  viewMode === 'daily'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Daily View
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  viewMode === 'weekly'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weekly View
              </button>
            </div>
          </div>
        </div>

        {/* Daily View */}
        {viewMode === 'daily' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayRecords.length > 0 ? (
                  displayRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(record.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTime(record.checkInTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTime(record.checkOutTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateHours(record.checkInTime, record.checkOutTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Weekly View */}
        {viewMode === 'weekly' && (
          <div className="p-6 space-y-4">
            {displayRecords.length > 0 ? (
              displayRecords.map((week, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">
                        Week of {formatDate(week.weekStart)}
                      </h4>
                    </div>
                    <span className="text-sm text-gray-600">
                      {week.records.length} day{week.records.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Present</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{week.totalPresent}</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">Half-Day</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-700">{week.totalHalfDay}</p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Absent</span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">{week.totalAbsent}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No weekly records found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3" />
              Present
            </span>
            <span className="text-xs text-gray-600">Full day attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
              <AlertCircle className="w-3 h-3" />
              Half-Day
            </span>
            <span className="text-xs text-gray-600">Partial attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
              <XCircle className="w-3 h-3" />
              Absent
            </span>
            <span className="text-xs text-gray-600">No attendance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManager;
