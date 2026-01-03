import React, { useMemo, useState, useEffect } from 'react';
import { adminApproveLeave } from '../api/api';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const LeaveApprovals = () => {
  const { hasRole, user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: 'Pending', search: '' });

  useEffect(() => {
    if (!user) return; // wait for user to load

    if (!hasRole(['Admin', 'HR'])) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/all');
      setLeaveRequests(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApproveLeave(id, 'Approved');
      setLeaveRequests((prev) => prev.filter(req => req._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApproveLeave(id, 'Rejected');
      setLeaveRequests((prev) => prev.filter(req => req._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject leave');
    }
  };

  const filteredRequests = useMemo(() => {
    return leaveRequests
      .filter((req) =>
        filters.status === 'All' ? true : (req.status || 'Pending') === filters.status
      )
      .filter((req) =>
        filters.search
          ? (req.employeeId || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (req.type || '').toLowerCase().includes(filters.search.toLowerCase())
          : true
      )
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [leaveRequests, filters]);

  const totals = useMemo(() => {
    return leaveRequests.reduce(
      (acc, l) => {
        const key = (l.status || 'Pending').toLowerCase();
        if (key === 'approved') acc.approved += 1;
        else if (key === 'rejected') acc.rejected += 1;
        else acc.pending += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );
  }, [leaveRequests]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading leave requests...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leave Approval System</h2>
          <p className="text-sm text-gray-500">Pending {totals.pending} · Approved {totals.approved} · Rejected {totals.rejected}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Search employee or type"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading leave requests...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : filteredRequests.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No leave requests match your filters</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Employee ID</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Leave Type</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Dates</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-900">{request.employeeId}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.type === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      request.type === 'Sick' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {request.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                    {formatDate(request.startDate)} — {formatDate(request.endDate)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : request.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {request.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-md transition-colors"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;