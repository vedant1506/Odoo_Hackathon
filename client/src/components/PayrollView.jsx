import React, { useState, useEffect } from 'react';
import { getProfile } from '../api/api';
import { useAuth } from '../context/AuthContext';

const PayrollView = () => {
  const { user } = useAuth();
  const [payrollData, setPayrollData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      
      // Mock payroll data structure since backend may not have this yet
      // In production, this would come from a dedicated payroll endpoint
      const mockPayrollData = {
        employeeId: response.data[0]?.employeeId || user?.employeeId,
        basicPay: 40000,
        allowances: {
          houseRent: 10000,
          transportation: 3000,
          medical: 2000
        },
        deductions: {
          tax: 5000,
          insurance: 1500,
          providentFund: 2000
        }
      };
      
      setPayrollData(mockPayrollData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (obj) => {
    return Object.values(obj).reduce((sum, val) => sum + val, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm text-gray-600">Loading payroll data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto text-center">
        <p className="text-gray-600">No payroll data available</p>
      </div>
    );
  }

  const totalAllowances = calculateTotal(payrollData.allowances);
  const totalDeductions = calculateTotal(payrollData.deductions);
  const grossSalary = payrollData.basicPay + totalAllowances;
  const netSalary = grossSalary - totalDeductions;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payroll Information</h2>
        <p className="text-sm text-gray-600 mt-1">Employee ID: {payrollData.employeeId}</p>
      </div>

      {/* Basic Pay Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Basic Pay</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Basic Salary</span>
            <span className="text-xl font-bold text-blue-700">
              {formatCurrency(payrollData.basicPay)}
            </span>
          </div>
        </div>
      </div>

      {/* Allowances Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Allowances</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          {Object.entries(payrollData.allowances).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-semibold text-green-700">
                {formatCurrency(value)}
              </span>
            </div>
          ))}
          <div className="border-t border-green-300 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total Allowances</span>
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(totalAllowances)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deductions Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Deductions</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          {Object.entries(payrollData.deductions).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="font-semibold text-red-700">
                {formatCurrency(value)}
              </span>
            </div>
          ))}
          <div className="border-t border-red-300 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total Deductions</span>
              <span className="text-lg font-bold text-red-700">
                {formatCurrency(totalDeductions)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="border-t pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-gray-700">
            <span className="text-lg">Gross Salary</span>
            <span className="text-lg font-semibold">
              {formatCurrency(grossSalary)}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span className="text-lg">Total Deductions</span>
            <span className="text-lg font-semibold text-red-600">
              - {formatCurrency(totalDeductions)}
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Net Salary</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(netSalary)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a read-only view of your salary structure. 
          For any discrepancies or questions, please contact HR.
        </p>
      </div>
    </div>
  );
};

export default PayrollView;
