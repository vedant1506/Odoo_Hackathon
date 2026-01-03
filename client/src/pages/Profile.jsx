import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, IdCard, Briefcase, Calendar, MapPin, Phone, Edit2, Save, X, Camera, Lock, DollarSign, FileText, Upload, Download, Trash2 } from 'lucide-react';
import api from '../api/api';
import NotificationBell from '../components/NotificationBell';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    employeeId: '',
    email: '',
    role: '',
    name: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
    address: '',
    profilePicture: '',
    salary: {
      basic: 0,
      hra: 0,
      allowances: 0,
      deductions: 0,
      total: 0
    },
    documents: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfileData({
        employeeId: res.data.employeeId || '',
        email: res.data.email || '',
        role: res.data.role || '',
        name: res.data.name || '',
        phone: res.data.phone || '',
        department: res.data.department || '',
        designation: res.data.designation || '',
        joinDate: res.data.joinDate ? new Date(res.data.joinDate).toISOString().split('T')[0] : '',
        address: res.data.address || '',
        profilePicture: res.data.profilePicture || '',
        salary: res.data.salary || {
          basic: 0,
          hra: 0,
          allowances: 0,
          deductions: 0,
          total: 0
        },
        documents: res.data.documents || []
      });
    } catch (err) {
      console.error('Error fetching profile', err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.put('/users/profile', profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    try {
      setLoading(true);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await api.post('/users/upload-profile-picture', {
            profilePicture: reader.result
          });
          
          setProfileData({ ...profileData, profilePicture: res.data.profilePicture });
          setMessage({ type: 'success', text: 'Profile picture updated!' });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
          setMessage({ type: 'error', text: 'Failed to upload profile picture' });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload profile picture' });
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB' });
      return;
    }

    try {
      setLoading(true);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await api.post('/users/upload-document', {
            name: file.name,
            type: file.type,
            url: reader.result
          });
          
          setProfileData({ ...profileData, documents: res.data.documents });
          setMessage({ type: 'success', text: 'Document uploaded successfully!' });
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
          setMessage({ type: 'error', text: 'Failed to upload document' });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload document' });
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setLoading(true);
      const res = await api.delete(`/users/delete-document/${docId}`);
      setProfileData({ ...profileData, documents: res.data.documents });
      setMessage({ type: 'success', text: 'Document deleted!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete document' });
    } finally {
      setLoading(false);
    }
  };

  // Check if a field is editable based on user role
  const canEditField = (fieldName) => {
    // Admins can edit all fields
    if (user?.role === 'Admin') return true;
    
    // Employees can only edit: name, phone, address
    const employeeEditableFields = ['name', 'phone', 'address'];
    return employeeEditableFields.includes(fieldName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
            <p className="text-slate-600 mt-1">Manage your account information</p>
          </div>
          <NotificationBell />
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white relative group overflow-hidden">
                {profileData.profilePicture ? (
                  <img 
                    src={profileData.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
                <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{profileData.name || 'Employee Name'}</h2>
                <p className="text-slate-600">{profileData.designation || 'Designation'}</p>
                <p className="text-sm text-slate-500 mt-1">{profileData.employeeId}</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField
                icon={<IdCard className="w-5 h-5" />}
                label="Employee ID"
                value={profileData.employeeId}
                isEditing={false}
              />
              <ProfileField
                icon={<Mail className="w-5 h-5" />}
                label="Email"
                value={profileData.email}
                isEditing={false}
              />
              <ProfileField
                icon={<Briefcase className="w-5 h-5" />}
                label="Role"
                value={profileData.role}
                isEditing={false}
              />
              <ProfileField
                icon={<User className="w-5 h-5" />}
                label="Full Name"
                value={profileData.name}
                isEditing={isEditing && canEditField('name')}
                onChange={(val) => setProfileData({ ...profileData, name: val })}
              />
              <ProfileField
                icon={<Phone className="w-5 h-5" />}
                label="Phone"
                value={profileData.phone}
                isEditing={isEditing && canEditField('phone')}
                onChange={(val) => setProfileData({ ...profileData, phone: val })}
              />
              <ProfileField
                icon={<Briefcase className="w-5 h-5" />}
                label="Department"
                value={profileData.department}
                isEditing={isEditing && canEditField('department')}
                onChange={(val) => setProfileData({ ...profileData, department: val })}
              />
              <ProfileField
                icon={<Briefcase className="w-5 h-5" />}
                label="Designation"
                value={profileData.designation}
                isEditing={isEditing && canEditField('designation')}
                onChange={(val) => setProfileData({ ...profileData, designation: val })}
              />
              <ProfileField
                icon={<Calendar className="w-5 h-5" />}
                label="Join Date"
                value={profileData.joinDate}
                isEditing={isEditing && canEditField('joinDate')}
                type="date"
                onChange={(val) => setProfileData({ ...profileData, joinDate: val })}
              />
              <ProfileField
                icon={<MapPin className="w-5 h-5" />}
                label="Address"
                value={profileData.address}
                isEditing={isEditing && canEditField('address')}
                onChange={(val) => setProfileData({ ...profileData, address: val })}
                className="md:col-span-2"
              />
            </div>
          </div>
        </div>

        {/* Salary Structure Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-xl font-bold text-slate-800">Salary Structure</h3>
              <p className="text-sm text-slate-600">Your compensation details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SalaryField 
              label="Basic Salary" 
              value={profileData.salary?.basic || 0}
            />
            <SalaryField 
              label="HRA (House Rent Allowance)" 
              value={profileData.salary?.hra || 0}
            />
            <SalaryField 
              label="Other Allowances" 
              value={profileData.salary?.allowances || 0}
            />
            <SalaryField 
              label="Deductions" 
              value={profileData.salary?.deductions || 0}
              isDeduction
            />
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-800">Total Monthly Salary</span>
              <span className="text-2xl font-bold text-emerald-600">
                ₹{(profileData.salary?.total || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-slate-800">Documents</h3>
                <p className="text-sm text-slate-600">Manage your personal documents</p>
              </div>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload Document
              <input 
                type="file" 
                onChange={handleDocumentUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          </div>
          
          {profileData.documents && profileData.documents.length > 0 ? (
            <div className="space-y-3">
              {profileData.documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{doc.name}</p>
                      <p className="text-sm text-slate-500">
                        Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p>No documents uploaded yet</p>
              <p className="text-sm mt-1">Upload your documents to keep them organized</p>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </h3>
              <p className="text-sm text-slate-600 mt-1">Manage your password and security preferences</p>
            </div>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordChange && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ icon, label, value, isEditing, onChange, type = 'text', className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
    ) : (
      <p className="px-4 py-3 bg-slate-50 rounded-xl text-slate-800">
        {value || 'Not set'}
      </p>
    )}
  </div>
);

const SalaryField = ({ label, value, isDeduction = false }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <div className={`px-4 py-3 rounded-xl ${isDeduction ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
      <span className={`text-lg font-bold ${isDeduction ? 'text-red-600' : 'text-emerald-600'}`}>
        {isDeduction ? '-' : ''}₹{value.toLocaleString('en-IN')}
      </span>
    </div>
  </div>
);

export default Profile;
