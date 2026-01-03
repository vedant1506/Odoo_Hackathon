import React, { useEffect, useState } from 'react';
import { getProfile } from '../api/api';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const PayrollView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payroll, setPayroll] = useState({
    basicPay: 0,
    allowances: 0,
    deductions: 0,
    currency: 'USD'
  });

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getProfile();
        // Expecting payroll info either on the user object or as a nested field
        const userData = Array.isArray(res.data) ? res.data[0] : res.data;
        const payrollData = userData?.payroll || userData || {};

        setPayroll({
          basicPay: Number(payrollData.basicPay) || 0,
          allowances: Number(payrollData.allowances) || 0,
          deductions: Number(payrollData.deductions) || 0,
          currency: payrollData.currency || 'USD'
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load payroll data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  const { basicPay, allowances, deductions, currency } = payroll;
  const gross = basicPay + allowances;
  const net = gross - deductions;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-3 text-sm text-gray-600">Loading payroll...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Payroll Overview</h2>
          <p className="text-sm text-gray-600">Read-only salary breakdown</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">Basic Pay</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{currency} {basicPay.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            Fixed component
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">Allowances</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{currency} {allowances.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            Benefits & incentives
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">Deductions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{currency} {deductions.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            Taxes & other withholdings
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 bg-indigo-50">
          <p className="text-sm text-gray-700">Net Pay</p>
          <p className="text-2xl font-bold text-indigo-800 mt-1">{currency} {net.toLocaleString()}</p>
          <div className="text-xs text-indigo-700 mt-2">Gross ({currency} {gross.toLocaleString()}) - Deductions</div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
        This view is read-only. For changes or questions about payroll, please contact HR.
      </div>
    </div>
  );
};

export default PayrollView;
