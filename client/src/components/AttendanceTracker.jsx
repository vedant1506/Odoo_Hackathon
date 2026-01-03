import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const AttendanceTracker = ({ compact = false }) => {
  const { hasRole, user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return; // wait for user to load

    if (!hasRole(['Admin', 'HR'])) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Fetch all attendance records
      const response = await api.get('/attendance/all');
      const filtered = response.data
        .filter(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === selectedDate;
        })
        .filter(record =>
          search ? (record.employeeId || '').toLowerCase().includes(search.toLowerCase()) : true
        )
        .sort((a, b) => (a.employeeId || '').localeCompare(b.employeeId || ''));
      setAttendanceRecords(filtered);
      setError(null);
    } catch (err) {
      // If the route doesn't exist, we'll need to handle it
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Half-day':
        return 'bg-yellow-100 text-yellow-800';
      case 'Leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = useMemo(() => {
    return attendanceRecords.reduce(
      (acc, r) => {
        const s = r.status || 'Present';
        if (s === 'Present') acc.present += 1;
        else if (s === 'Late') acc.late += 1;
        else if (s === 'Absent') acc.absent += 1;
        else if (s === 'Leave') acc.leave += 1;
        acc.total += 1;
        return acc;
      },
      { present: 0, late: 0, absent: 0, leave: 0, total: 0 }
    );
  }, [attendanceRecords]);

  if (loading) {
    return <div className="text-center py-8">Loading attendance records...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance Overview</h2>
          <p className="text-sm text-gray-500">Present {stats.present} · Late {stats.late} · Absent {stats.absent}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {!compact && (
            <input
              type="text"
              placeholder="Search employee"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
            />
          )}
        </div>
      </div>

      {attendanceRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No attendance records for this date</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Employee ID</th>
                {!compact && <th className="px-6 py-3 text-left font-semibold text-gray-600">Date</th>}
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Check In</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Check Out</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{record.employeeId}</td>
                  {!compact && (
                    <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                      {new Date(record.date).toLocaleDateString('en-US')}
                    </td>
                  )}
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{formatTime(record.checkIn)}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">{formatTime(record.checkOut)}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-4">
          <Legend color="bg-green-500" label="Present" />
          <Legend color="bg-yellow-500" label="Late" />
          <Legend color="bg-red-500" label="Absent" />
          <Legend color="bg-blue-500" label="Leave" />
        </div>
      )}
    </div>
  );
};

const Legend = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-4 h-4 rounded ${color}`}></div>
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);

export default AttendanceTracker;