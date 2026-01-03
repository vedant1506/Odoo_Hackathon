import React, { useMemo, useState, useEffect } from 'react';
import { adminGetEmployees } from '../api/api';
import { useAuth } from '../context/AuthContext';

const UserList = () => {
  const { hasRole, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: 'All', search: '' });

  useEffect(() => {
    if (!user) return; // wait for user to load

    if (!hasRole(['Admin', 'HR'])) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    fetchEmployees();
  }, []);

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

  if (loading) {
    return <div className="text-center py-8">Loading employees...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Directory</h2>
          <p className="text-sm text-gray-500">{filtered.length} shown of {employees.length}</p>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;