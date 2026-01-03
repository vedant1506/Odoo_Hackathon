import React, { useState, useEffect } from 'react';
import { applyLeave, getLeaves } from '../api/api';
import { 
  FileText, Calendar, Send, CheckCircle, XCircle, Clock,
  AlertCircle, Filter, MessageSquare
} from 'lucide-react';

const LeaveApplication = () => {
  const [formData, setFormData] = useState({
    leaveType: 'Paid',
    startDate: '',
    endDate: '',
    remarks: ''
  });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await getLeaves();
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.startDate) {
      setMessage({ type: 'error', text: 'Please select a start date' });
      return false;
    }
    if (!formData.endDate) {
      setMessage({ type: 'error', text: 'Please select an end date' });
      return false;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setMessage({ type: 'error', text: 'End date must be after start date' });
      return false;
    }
    if (!formData.remarks.trim()) {
      setMessage({ type: 'error', text: 'Please provide remarks for your leave request' });
      return false;
    }
    return true;
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const leaveData = {
        ...formData,
        days: calculateDays(formData.startDate, formData.endDate)
      };

      await applyLeave(leaveData);
      
      setMessage({ 
        type: 'success', 
        text: 'Leave request submitted successfully!' 
      });

      // Reset form
      setFormData({
        leaveType: 'Paid',
        startDate: '',
        endDate: '',
        remarks: ''
      });

      // Refresh leave requests
      setTimeout(() => {
        fetchLeaveRequests();
        setMessage({ type: '', text: '' });
      }, 2000);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit leave request. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-purple-100 text-purple-800';
      case 'unpaid':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const filteredRequests = filterStatus === 'all' 
    ? leaveRequests 
    : leaveRequests.filter(req => req.status?.toLowerCase() === filterStatus.toLowerCase());

  const leaveStats = {
    pending: leaveRequests.filter(r => r.status?.toLowerCase() === 'pending').length,
    approved: leaveRequests.filter(r => r.status?.toLowerCase() === 'approved').length,
    rejected: leaveRequests.filter(r => r.status?.toLowerCase() === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Leave Application Form */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Apply for Leave</h2>
              <p className="text-purple-100 text-sm">Submit your leave request</p>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm ${
              message.type === 'success' 
                ? 'bg-green-500 bg-opacity-20 border border-green-300 border-opacity-50' 
                : 'bg-red-500 bg-opacity-20 border border-red-300 border-opacity-50'
            }`}>
              <p className="text-sm font-medium flex items-center gap-2">
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Leave Type
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-gray-300 text-gray-900 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
              >
                <option value="Paid" className="text-gray-900">Paid Leave</option>
                <option value="Sick" className="text-gray-900">Sick Leave</option>
                <option value="Unpaid" className="text-gray-900">Unpaid Leave</option>
              </select>
            </div>

            {/* Days Display */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Total Days
              </label>
              <div className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-40 rounded-xl backdrop-blur-sm shadow-sm flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">
                  {calculateDays(formData.startDate, formData.endDate)}
                </span>
                <span className="text-sm text-purple-100 font-medium">
                  {calculateDays(formData.startDate, formData.endDate) === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-purple-200" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 text-gray-900 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-purple-200" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 text-gray-900 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Remarks Textarea */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Remarks / Reason
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <MessageSquare className="h-5 w-5 text-purple-200" />
              </div>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="4"
                placeholder="Please provide a reason for your leave request..."
                className="w-full pl-10 pr-4 py-3.5 border border-gray-300 text-gray-900 rounded-xl bg-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-opacity-95 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Leave Request
              </>
            )}
          </button>
        </form>
        </div>
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{leaveStats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{leaveStats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{leaveStats.rejected}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Leave Request History</h3>
              <p className="text-sm text-gray-600">{leaveRequests.length} total requests</p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filterStatus === 'approved'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leave requests...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                          {request.leaveType} Leave
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{request.days || calculateDays(request.startDate, request.endDate)} days</span>
                      </div>
                      
                      {request.remarks && (
                        <div className="flex items-start gap-2 text-sm text-gray-700 mt-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2">{request.remarks}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Applied on</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(request.createdAt || request.appliedDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? 'No leave requests found' 
                  : `No ${filterStatus} leave requests`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;
