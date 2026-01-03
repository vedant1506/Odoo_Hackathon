import React, { useMemo, useState, useEffect } from 'react';
import { adminGetEmployees } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Eye, DollarSign, Save, X } from 'lucide-react';
import api from '../api/api';

const UserList = () => {
  const { hasRole, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: 'All', search: '' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);
  const [salaryMessage, setSalaryMessage] = useState('');

  useEffect(() => {
    if (!user) return; // wait for user to load

    if (!hasRole(['Admin', 'HR'])) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await adminGetEmployees();
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return employees
      .filter((emp) => (filters.role === 'All' ? true : emp.role === filters.role))
      .filter((emp) =>
        filters.search
          ? emp.employeeId.toLowerCase().includes(filters.search.toLowerCase()) ||
            emp.email.toLowerCase().includes(filters.search.toLowerCase())
          : true
      )
      .sort((a, b) => a.employeeId.localeCompare(b.employeeId));
  }, [employees, filters]);

  const handleViewProfile = (employee) => {
    setSelectedEmployee({
      ...employee,
      salary: employee.salary || { basic: 0, hra: 0, allowances: 0, deductions: 0, total: 0 }
    });
    setShowProfileModal(true);
    setSalaryMessage('');
  };

  const handleSalaryChange = (field, value) => {
    setSelectedEmployee(prev => {
      const updated = {
        ...prev,
        salary: { ...prev.salary, [field]: Number(value) || 0 }
      };
      // Auto-calculate total
      const { basic, hra, allowances, deductions } = updated.salary;
      updated.salary.total = basic + hra + allowances - deductions;
      return updated;
    });
  };

  const handleSaveSalary = async () => {
    try {
      setSavingSalary(true);
      setSalaryMessage('');
      await api.put(`/users/employees/${selectedEmployee.employeeId}/salary`, {
        salary: selectedEmployee.salary
      });
      setSalaryMessage('Salary updated successfully!');
      // Refresh employees list
      await fetchEmployees();
      setTimeout(() => {
        setShowProfileModal(false);
        setSalaryMessage('');
      }, 1500);
    } catch (err) {
      setSalaryMessage(err.response?.data?.message || 'Failed to update salary');
    } finally {
      setSavingSalary(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading employees...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">{filtered.length} employees shown {employees.length > filtered.length ? `of ${employees.length} total` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.role}
            onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
          >
            <option value="All">All roles</option>
            <option value="Admin">Admin</option>
            <option value="HR">HR</option>
            <option value="Employee">Employee</option>
          </select>
          <input
            type="text"
            placeholder="Search by ID or email"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.employeeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    employee.role === 'Admin' || employee.role === 'HR'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {employee.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleViewProfile(employee)}
                    className="flex items-center gap-1 px-3 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {/* Employee Profile & Salary Modal */}
      {showProfileModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Employee Profile</h2>
                <p className="text-sm text-slate-500">{selectedEmployee.employeeId}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                  <p className="px-4 py-2 bg-slate-50 rounded-lg">{selectedEmployee.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <p className="px-4 py-2 bg-slate-50 rounded-lg">{selectedEmployee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                  <p className="px-4 py-2 bg-slate-50 rounded-lg">{selectedEmployee.phone || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                  <p className="px-4 py-2 bg-slate-50 rounded-lg">{selectedEmployee.department || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
                  <p className="px-4 py-2 bg-slate-50 rounded-lg">{selectedEmployee.designation || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Join Date</label>
                  <p className="px-4 py-2 bg-slate-50 rounded-lg">
                    {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Salary Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-800">Salary Management</h3>
                </div>

                {salaryMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    salaryMessage.includes('success') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {salaryMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Basic Salary (₹)</label>
                    <input
                      type="number"
                      value={selectedEmployee.salary.basic}
                      onChange={(e) => handleSalaryChange('basic', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">HRA (₹)</label>
                    <input
                      type="number"
                      value={selectedEmployee.salary.hra}
                      onChange={(e) => handleSalaryChange('hra', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Allowances (₹)</label>
                    <input
                      type="number"
                      value={selectedEmployee.salary.allowances}
                      onChange={(e) => handleSalaryChange('allowances', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Deductions (₹)</label>
                    <input
                      type="number"
                      value={selectedEmployee.salary.deductions}
                      onChange={(e) => handleSalaryChange('deductions', e.target.value)}
                      className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-800">Total Monthly Salary</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ₹{selectedEmployee.salary.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSalary}
                  disabled={savingSalary}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingSalary ? 'Saving...' : 'Save Salary'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserList;