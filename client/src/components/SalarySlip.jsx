import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Calendar, Building2 } from 'lucide-react';
import api from '../api/api';

const SalarySlip = () => {
  const { user, hasRole } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  const isAdmin = hasRole(['Admin', 'HR']);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    } else {
      // For employees, fetch their own data
      setSelectedEmployee(user.employeeId);
      fetchSalarySlip(user.employeeId);
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users/employees');
      setEmployees(res.data || []);
      if (res.data.length > 0) {
        setSelectedEmployee(res.data[0].employeeId);
        fetchSalarySlip(res.data[0].employeeId);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  };

  const fetchSalarySlip = async (empId) => {
    if (!empId) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/users/employees/${empId}`);
      setSalaryData(res.data);
    } catch (err) {
      console.error('Error fetching salary slip', err);
      setSalaryData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    fetchSalarySlip(empId);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between no-print">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {isAdmin && (
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name || emp.employeeId} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Salary Slip */}
      {salaryData ? (
        <div ref={printRef} className="salary-slip bg-white border-2 border-slate-200 rounded-xl p-8 print:border-0">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-300 pb-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-cyan-600" />
              <h1 className="text-3xl font-bold text-slate-800">Your Company Name</h1>
            </div>
            <p className="text-slate-600">Company Address, City, State - 000000</p>
            <p className="text-slate-600">Email: hr@company.com | Phone: +91-1234567890</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-cyan-600" />
            <h2 className="text-2xl font-bold text-slate-800">Salary Slip</h2>
          </div>

          {/* Month Display */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-700" />
            <span className="text-lg font-semibold text-cyan-800">For the month of {monthName}</span>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="space-y-2">
              <DetailRow label="Employee ID" value={salaryData.employeeId} />
              <DetailRow label="Employee Name" value={salaryData.name || 'N/A'} />
              <DetailRow label="Department" value={salaryData.department || 'N/A'} />
            </div>
            <div className="space-y-2">
              <DetailRow label="Designation" value={salaryData.role || 'Employee'} />
              <DetailRow label="Date of Joining" value={salaryData.dateOfJoining ? new Date(salaryData.dateOfJoining).toLocaleDateString('en-IN') : 'N/A'} />
              <DetailRow label="Email" value={salaryData.email || 'N/A'} />
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="border-2 border-slate-200 rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Earnings</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Deductions</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-3 text-sm text-slate-700">Basic Salary</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(salaryData.salary?.basic)}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700">Tax</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(salaryData.salary?.deductions)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-sm text-slate-700">HRA</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(salaryData.salary?.hra)}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700">Professional Tax</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(0)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-sm text-slate-700">Other Allowances</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(salaryData.salary?.allowances)}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700">Other Deductions</td>
                  <td className="px-6 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(0)}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-6 py-3 text-sm font-semibold text-slate-800">Gross Earnings</td>
                  <td className="px-6 py-3 text-sm text-right font-bold text-emerald-600">
                    {formatCurrency((salaryData.salary?.basic || 0) + (salaryData.salary?.hra || 0) + (salaryData.salary?.allowances || 0))}
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-slate-800">Total Deductions</td>
                  <td className="px-6 py-3 text-sm text-right font-bold text-red-600">
                    {formatCurrency(salaryData.salary?.deductions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Salary */}
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-300 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-800">Net Salary (Take Home)</span>
              <span className="text-3xl font-bold text-emerald-600">
                {formatCurrency(salaryData.salary?.total)}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2 text-right">
              (In words: {numberToWords(salaryData.salary?.total || 0)} Rupees Only)
            </p>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-slate-200 pt-6 mt-8">
            <p className="text-xs text-slate-500 mb-4">
              This is a system-generated salary slip and does not require a signature.
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-slate-600">Generated on: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700 mb-1">Authorized Signatory</p>
                <div className="border-t border-slate-400 w-48 pt-1">
                  <p className="text-xs text-slate-500">HR Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p>No salary data available for selected employee</p>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-sm text-slate-600 font-medium">{label}:</span>
    <span className="text-sm text-slate-900">{value}</span>
  </div>
);

// Simple number to words conversion for Indian numbering system
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertTwoDigit = (n) => {
    if (n < 10) return ones[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };
  
  const convertThreeDigit = (n) => {
    if (n === 0) return '';
    if (n < 100) return convertTwoDigit(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertTwoDigit(n % 100) : '');
  };
  
  num = Math.floor(num);
  
  if (num >= 10000000) {
    return convertThreeDigit(Math.floor(num / 10000000)) + ' Crore ' + numberToWords(num % 10000000);
  }
  if (num >= 100000) {
    return convertTwoDigit(Math.floor(num / 100000)) + ' Lakh ' + numberToWords(num % 100000);
  }
  if (num >= 1000) {
    return convertTwoDigit(Math.floor(num / 1000)) + ' Thousand ' + numberToWords(num % 1000);
  }
  return convertThreeDigit(num);
};

export default SalarySlip;
