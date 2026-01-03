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
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminComment, setAdminComment] = useState('');

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

  const handleApprove = async (leave) => {
    setSelectedLeave(leave);
    setActionType('approve');
    setShowCommentModal(true);
  };

  const handleReject = async (leave) => {
    setSelectedLeave(leave);
    setActionType('reject');
    setShowCommentModal(true);
  };

  const handleSubmitDecision = async () => {
    try {
      const status = actionType === 'approve' ? 'Approved' : 'Rejected';
      await adminApproveLeave(selectedLeave._id, status, adminComment);
      await fetchLeaveRequests();
      setShowCommentModal(false);
      setAdminComment('');
      setSelectedLeave(null);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${actionType} leave`);
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
    <>
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
                      onClick={() => handleApprove(request)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request)}
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

    {/* Comment Modal */}
    {showCommentModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </h3>
          
          {selectedLeave && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600"><span className="font-semibold">Employee:</span> {selectedLeave.employeeId}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Type:</span> {selectedLeave.type}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Dates:</span> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</p>
              {selectedLeave.remarks && (
                <p className="text-sm text-slate-600 mt-2"><span className="font-semibold">Remarks:</span> {selectedLeave.remarks}</p>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Add Comment {actionType === 'reject' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              rows="4"
              placeholder={actionType === 'approve' ? 'Add any notes...' : 'Please provide a reason for rejection...'}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCommentModal(false);
                setAdminComment('');
                setSelectedLeave(null);
              }}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitDecision}
              disabled={actionType === 'reject' && !adminComment.trim()}
              className={`flex-1 px-4 py-2 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                actionType === 'approve' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default LeaveApprovals;