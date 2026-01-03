const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getEmployees = async (req, res) => {
  try {
    if (req.user.role === 'Admin' || req.user.role === 'HR') {
      const employees = await User.find().select('-password');
      res.json(employees);
      return;
    }

    const employee = await User.findOne({ employeeId: req.user.employeeId }).select('-password');
    res.json([employee]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee by employeeId
const getEmployeeByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if user is admin/HR or requesting their own data
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.employeeId !== employeeId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const employee = await User.findOne({ employeeId }).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, designation, joinDate, address, salary } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Define editable fields based on role
    const employeeEditableFields = ['name', 'phone', 'address'];
    const isAdmin = req.user.role === 'Admin';

    // Update fields based on permissions
    if (name && (isAdmin || employeeEditableFields.includes('name'))) {
      user.name = name;
    }
    if (phone && (isAdmin || employeeEditableFields.includes('phone'))) {
      user.phone = phone;
    }
    if (address && (isAdmin || employeeEditableFields.includes('address'))) {
      user.address = address;
    }
    
    // Only admins can update these fields
    if (isAdmin) {
      if (department) user.department = department;
      if (designation) user.designation = designation;
      if (joinDate) user.joinDate = joinDate;
      if (salary) user.salary = salary;
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update any employee's profile
const adminUpdateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, phone, department, designation, joinDate, address, salary, role } = req.body;
    
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Admin can update all fields
    if (name !== undefined) employee.name = name;
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;
    if (joinDate !== undefined) employee.joinDate = joinDate;
    if (address !== undefined) employee.address = address;
    if (role !== undefined) employee.role = role;
    if (salary !== undefined) employee.salary = salary;

    await employee.save();
    
    const updatedEmployee = await User.findById(employeeId).select('-password');
    res.json(updatedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('=== Upload Profile Picture ===');
    console.log('User:', req.user.id);
    
    // In a real application, you would use multer to handle file uploads
    // and store files in cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll accept a base64 string or URL
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      console.log('Validation failed: No profile picture provided');
      return res.status(400).json({ message: 'No profile picture provided' });
    }
    
    console.log('Profile picture size:', profilePicture.length);

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = profilePicture;
    await user.save();

    console.log('Profile picture uploaded successfully');
    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Upload document
const uploadDocument = async (req, res) => {
  try {
    console.log('=== Upload Document ===');
    console.log('User:', req.user.id);
    
    // In a real application, you would use multer to handle file uploads
    const { name, type, url } = req.body;
    
    if (!name || !type || !url) {
      console.log('Validation failed: Missing fields', { name: !!name, type: !!type, url: !!url });
      return res.status(400).json({ message: 'Document name, type, and URL are required' });
    }
    
    console.log('Document info:', { name, type, size: url.length });

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check document size (base64 encoded)
    if (url.length > 20 * 1024 * 1024) {
      console.log('Document too large:', url.length);
      return res.status(400).json({ message: 'Document size is too large. Maximum 10MB allowed.' });
    }

    user.documents.push({
      name,
      type,
      url,
      uploadDate: new Date()
    });

    await user.save();

    console.log('Document uploaded successfully. Total documents:', user.documents.length);
    res.json({ documents: user.documents });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ message: err.message || 'Failed to upload document' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.documents = user.documents.filter(doc => doc._id.toString() !== documentId);
    await user.save();

    res.json({ documents: user.documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getEmployees,
  getEmployeeByEmployeeId,
  getProfile,
  updateProfile,
  adminUpdateEmployee,
  changePassword,
  deleteUser,
  uploadProfilePicture,
  uploadDocument,
  deleteDocument
};
