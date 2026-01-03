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
  const [editSalary, setEditSalary] = useState('');

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
      // Try to fetch payroll data
      const response = await adminGetPayroll();
      setPayrollData(response.data);
      setError(null);
    } catch (err) {
      // If payroll endpoint doesn't exist yet, show a message
      setError('Payroll endpoint not yet implemented. Coming soon!');
      // Mock data for demonstration
      setPayrollData([
        { employeeId: 'EMP001', name: 'John Doe', salary: 50000, department: 'Engineering' },
        { employeeId: 'EMP002', name: 'Jane Smith', salary: 45000, department: 'HR' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.employeeId);
    setEditSalary(employee.salary);
  };

  const handleSave = async (employeeId) => {
    try {
      await api.put('/payroll/update', {
        employeeId,
        salary: parseFloat(editSalary)
      });
      
      // Update local state
      setPayrollData(payrollData.map(emp => 
        emp.employeeId === employeeId 
          ? { ...emp, salary: parseFloat(editSalary) }
          : emp
      ));
      
      setEditingId(null);
      setEditSalary('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update salary');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditSalary('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-8">Loading payroll data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Payroll Management</h2>
      
      {error && error.includes('not yet implemented') && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">{error}</p>
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
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollData.map((employee) => (
                <tr key={employee.employeeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingId === employee.employeeId ? (
                      <input
                        type="number"
                        value={editSalary}
                        onChange={(e) => setEditSalary(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 w-32"
                      />
                    ) : (
                      formatCurrency(employee.salary)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === employee.employeeId ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSave(employee.employeeId)}
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

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Monthly Payroll</h3>
        <p className="text-2xl font-bold text-blue-700">
          {formatCurrency(payrollData.reduce((sum, emp) => sum + emp.salary, 0))}
        </p>
      </div>
    </div>
  );
};

export default PayrollControl;