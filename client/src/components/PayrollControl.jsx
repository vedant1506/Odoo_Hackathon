import React, { useState, useEffect } from 'react';
import { adminGetPayroll } from '../api/api';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const PayrollControl = () => {
  const { isAdmin } = useAuth();
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editSalary, setEditSalary] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0
  });

  useEffect(() => {
    if (!isAdmin()) {
      setError('Unauthorized access');
      setLoading(false);
      return;
    }

    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      // Fetch all employees with their salary data
      const response = await api.get('/users/employees');
      const employees = response.data || [];
      
      // Map employee data to payroll format
      const payroll = employees.map(emp => ({
        _id: emp._id,
        employeeId: emp.employeeId,
        name: emp.name || 'N/A',
        department: emp.department || 'N/A',
        designation: emp.designation || 'N/A',
        salary: emp.salary || {
          basic: 0,
          hra: 0,
          allowances: 0,
          deductions: 0,
          total: 0
        }
      }));
      
      setPayrollData(payroll);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll data');
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee._id);
    setEditSalary(employee.salary || {
      basic: 0,
      hra: 0,
      allowances: 0,
      deductions: 0
    });
  };

  const handleSave = async (employeeId) => {
    try {
      const total = editSalary.basic + editSalary.hra + editSalary.allowances - editSalary.deductions;
      const updatedSalary = {
        ...editSalary,
        total
      };
      
      await api.put(`/users/employee/${employeeId}`, { salary: updatedSalary });
      
      // Update local state
      setPayrollData(payrollData.map(emp => 
        emp._id === employeeId 
          ? { ...emp, salary: updatedSalary }
          : emp
      ));
      
      setEditingId(null);
      setEditSalary({ basic: 0, hra: 0, allowances: 0, deductions: 0 });
      alert('Salary updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update salary');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditSalary({ basic: 0, hra: 0, allowances: 0, deductions: 0 });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-8">Loading payroll data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage employee salary structures</p>
        </div>
        <button
          onClick={fetchPayroll}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {payrollData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No payroll data available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HRA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollData.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.employeeId}</div>
                      <div className="text-xs text-gray-500">{employee.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === employee._id ? (
                      <input
                        type="number"
                        value={editSalary.basic}
                        onChange={(e) => setEditSalary({...editSalary, basic: parseFloat(e.target.value) || 0})}
                        className="border border-gray-300 rounded px-2 py-1 w-28"
                        placeholder="Basic"
                      />
                    ) : (
                      formatCurrency(employee.salary?.basic || 0)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === employee._id ? (
                      <input
                        type="number"
                        value={editSalary.hra}
                        onChange={(e) => setEditSalary({...editSalary, hra: parseFloat(e.target.value) || 0})}
                        className="border border-gray-300 rounded px-2 py-1 w-28"
                        placeholder="HRA"
                      />
                    ) : (
                      formatCurrency(employee.salary?.hra || 0)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === employee._id ? (
                      <input
                        type="number"
                        value={editSalary.allowances}
                        onChange={(e) => setEditSalary({...editSalary, allowances: parseFloat(e.target.value) || 0})}
                        className="border border-gray-300 rounded px-2 py-1 w-28"
                        placeholder="Allowances"
                      />
                    ) : (
                      formatCurrency(employee.salary?.allowances || 0)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {editingId === employee._id ? (
                      <input
                        type="number"
                        value={editSalary.deductions}
                        onChange={(e) => setEditSalary({...editSalary, deductions: parseFloat(e.target.value) || 0})}
                        className="border border-gray-300 rounded px-2 py-1 w-28"
                        placeholder="Deductions"
                      />
                    ) : (
                      formatCurrency(employee.salary?.deductions || 0)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                    {editingId === employee._id ? (
                      formatCurrency(
                        (editSalary.basic || 0) + (editSalary.hra || 0) + (editSalary.allowances || 0) - (editSalary.deductions || 0)
                      )
                    ) : (
                      formatCurrency(employee.salary?.total || 0)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === employee._id ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSave(employee._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(employee)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Employees</h3>
          <p className="text-2xl font-bold text-blue-700">{payrollData.length}</p>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
          <h3 className="text-lg font-semibold text-emerald-900 mb-2">Total Monthly Payroll</h3>
          <p className="text-2xl font-bold text-emerald-700">
            {formatCurrency(payrollData.reduce((sum, emp) => sum + (emp.salary?.total || 0), 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayrollControl;