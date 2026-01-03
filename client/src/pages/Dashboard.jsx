import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getAttendance, getLeaves } from '../api/api';
import AttendanceManager from '../components/AttendanceManager';
import LeaveApplication from '../components/LeaveApplication';
import PayrollView from '../components/PayrollView';
import { 
  User, Calendar, FileText, LogOut, Edit2, Save, X, 
  Mail, Phone, MapPin, Briefcase, DollarSign, Camera,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    employeeId: '',
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    joinDate: '',
    salary: '',
    profilePicture: ''
  });
  
  const [editData, setEditData] = useState({
    phone: '',
    address: '',
    profilePicture: ''
  });
  
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0
  });
  
  const [leaveStats, setLeaveStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile data
      const profileRes = await getProfile();
      const userData = profileRes.data[0] || profileRes.data;
      
      setProfileData({
        employeeId: userData.employeeId || '',
        email: userData.email || '',
        role: userData.role || '',
        firstName: userData.firstName || 'John',
        lastName: userData.lastName || 'Doe',
        phone: userData.phone || '+1 234 567 8900',
        address: userData.address || '123 Main St, City, Country',
        department: userData.department || 'Engineering',
        position: userData.position || 'Software Developer',
        joinDate: userData.joinDate || '2024-01-15',
        salary: userData.salary || '75000',
        profilePicture: userData.profilePicture || ''
      });
      
      setEditData({
        phone: userData.phone || '+1 234 567 8900',
        address: userData.address || '123 Main St, City, Country',
        profilePicture: userData.profilePicture || ''
      });
      
      // Fetch attendance stats
      try {
        const attendanceRes = await getAttendance();
        const attendanceData = attendanceRes.data;
        calculateAttendanceStats(attendanceData);

        // Derive today's attendance and check-in status
        const today = new Date().toISOString().split('T')[0];
        const todaysRecord = attendanceData?.find((d) => d.date && d.date.split('T')[0] === today);
        const currentlyCheckedIn = Boolean(
          todaysRecord && todaysRecord.checkInTime && !todaysRecord.checkOutTime
        );
        setTodayAttendance(todaysRecord || null);
        setIsCheckedIn(currentlyCheckedIn);
      } catch (error) {
        console.log('Attendance data not available');
      }
      
      // Fetch leave stats
      try {
        const leaveRes = await getLeaves();
        const leaveData = leaveRes.data;
        calculateLeaveStats(leaveData);
      } catch (error) {
        console.log('Leave data not available');
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceStats = (data) => {
    if (!data || data.length === 0) return;
    
    const stats = {
      totalDays: data.length,
      present: data.filter(d => d.status === 'Present').length,
      absent: data.filter(d => d.status === 'Absent').length,
      late: data.filter(d => d.status === 'Late').length
    };
    setAttendanceStats(stats);
  };

  const calculateLeaveStats = (data) => {
    if (!data || data.length === 0) return;
    
    const stats = {
      pending: data.filter(d => d.status === 'Pending').length,
      approved: data.filter(d => d.status === 'Approved').length,
      rejected: data.filter(d => d.status === 'Rejected').length,
      total: data.length
    };
    setLeaveStats(stats);
  };

  const handleAttendanceStatusChange = ({ checkedIn, todayRecord }) => {
    setIsCheckedIn(Boolean(checkedIn));
    if (todayRecord) {
      setTodayAttendance(todayRecord);
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset to original data
      setEditData({
        phone: profileData.phone,
        address: profileData.address,
        profilePicture: profileData.profilePicture
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile(editData);
      
      // Update local profile data
      setProfileData(prev => ({
        ...prev,
        ...editData
      }));
      
      setIsEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dayflow</h1>
              <p className="text-sm text-slate-500">Welcome back, {profileData.firstName}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-2 sm:space-x-4 border-b border-slate-200">
            <TabButton label="Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <TabButton label="Attendance" isActive={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
            <TabButton label="Leave" isActive={activeTab === 'leave'} onClick={() => setActiveTab('leave')} />
            <TabButton label="Payroll" isActive={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} />
            <TabButton label="My Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Access Cards */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Attendance Status Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isCheckedIn ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      <Clock className={`w-6 h-6 ${isCheckedIn ? 'text-emerald-600' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Attendance Status</h3>
                      <p className={`text-sm font-medium ${
                        isCheckedIn ? 'text-emerald-700' : 'text-slate-600'
                      }`}>
                        {isCheckedIn ? 'Checked In' : 'Checked Out'}
                      </p>
                      {todayAttendance && (
                        <p className="text-xs text-slate-500 mt-1">
                          In: {todayAttendance.checkInTime ? new Date(todayAttendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                          {todayAttendance.checkOutTime ? ` • Out: ${new Date(todayAttendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-600"
                  >
                    Manage attendance
                    <span aria-hidden className="text-lg">→</span>
                  </button>
                </div>

                {/* Leave Balance Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-cyan-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Leave Balance</h3>
                      <p className="text-sm text-slate-500">Approved leaves</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-cyan-800">{leaveStats.approved}</p>
                    <span className="text-sm text-slate-500">approved</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                    <div>
                      <p className="text-lg font-semibold text-amber-600">{leaveStats.pending}</p>
                      <p>Pending</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-emerald-600">{leaveStats.approved}</p>
                      <p>Approved</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-rose-600">{leaveStats.rejected}</p>
                      <p>Rejected</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('leave')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-600"
                  >
                    View leave history
                    <span aria-hidden className="text-lg">→</span>
                  </button>
                </div>

                {/* Profile Summary Card */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left border border-slate-200 hover:border-cyan-300"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-cyan-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Profile Summary</h3>
                      <p className="text-sm text-slate-500">Employee basics</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p><span className="font-medium text-slate-900">ID:</span> {profileData.employeeId || '—'}</p>
                    <p><span className="font-medium text-slate-900">Role:</span> {profileData.role || '—'}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <AttendanceManager onStatusChange={handleAttendanceStatusChange} />
        )}

        {/* Leave Tab */}
        {activeTab === 'leave' && (
          <LeaveApplication />
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <PayrollView />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Employee Profile</h2>
                {!isEditMode ? (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Picture & Basic Info */}
              <div className="flex items-start gap-6 mb-8">
                <div className="relative">
                  {profileData.profilePicture || editData.profilePicture ? (
                    <img
                      src={isEditMode ? editData.profilePicture : profileData.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-600 to-slate-700 flex items-center justify-center border-4 border-slate-200">
                      <span className="text-3xl font-bold text-white">
                        {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  {isEditMode && (
                    <div className="absolute bottom-0 right-0 bg-cyan-600 rounded-full p-2">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-slate-600">{profileData.position}</p>
                  <p className="text-sm text-slate-500">{profileData.department}</p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                    {profileData.role}
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    name="profilePicture"
                    value={editData.profilePicture}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {/* Personal Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{profileData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Phone</p>
                      {isEditMode ? (
                        <input
                          type="text"
                          name="phone"
                          value={editData.phone}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-cyan-50"
                        />
                      ) : (
                        <p className="font-medium text-slate-900">{profileData.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">Address</p>
                      {isEditMode ? (
                        <textarea
                          name="address"
                          value={editData.address}
                          onChange={handleEditChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-cyan-50"
                        />
                      ) : (
                        <p className="font-medium text-slate-900">{profileData.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cyan-600" />
                  Job Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Employee ID</p>
                    <p className="font-medium text-slate-900">{profileData.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{profileData.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Position</p>
                    <p className="font-medium text-slate-900">{profileData.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Join Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(profileData.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Salary Structure */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-600" />
                  Salary Structure
                </h4>
                <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 p-6 rounded-lg border border-emerald-200">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-700">
                      ${parseInt(profileData.salary).toLocaleString()}
                    </span>
                    <span className="text-slate-500">/ year</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Monthly: ${(parseInt(profileData.salary) / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
      isActive
        ? 'border-cyan-500 text-cyan-600'
        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

export default Dashboard;