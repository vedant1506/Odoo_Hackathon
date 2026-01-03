const LeaveRequest = require('../models/LeaveRequest');
const { createNotification } = require('./notificationController');
const User = require('../models/User');

const applyLeave = async (req, res) => {
  try {
    console.log('=== Apply Leave Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request user:', JSON.stringify(req.user, null, 2));
    
    const { leaveType, type, startDate, endDate, remarks, reason } = req.body;
    const normalizedType = leaveType || type; // accept either payload key
    const normalizedReason = reason || remarks; // accept either payload key
    
    if (!normalizedType) {
      console.log('Validation failed: Leave type is missing');
      return res.status(400).json({ message: 'Leave type is required.' });
    }
    
    if (!startDate) {
      console.log('Validation failed: Start date is missing');
      return res.status(400).json({ message: 'Start date is required.' });
    }
    
    if (!endDate) {
      console.log('Validation failed: End date is missing');
      return res.status(400).json({ message: 'End date is required.' });
    }
    
    if (!req.user || !req.user.employeeId) {
      console.log('Authentication failed: User or employeeId missing');
      return res.status(401).json({ message: 'User not authenticated properly.' });
    }
    
    const employeeId = req.user.employeeId;
    console.log('Creating leave request for employee:', employeeId);

    const leave = new LeaveRequest({
      employeeId,
      type: normalizedType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      remarks: normalizedReason || '',
      reason: normalizedReason || ''
    });

    await leave.save();

    // Create notification for employee
    await createNotification(
      req.user.id,
      'leave_pending',
      'Leave Request Submitted',
      `Your ${normalizedType} request from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} has been submitted for approval.`,
      { leaveId: leave._id }
    );

    // Notify all HR/Admin users
    const hrAdmins = await User.find({ 
      role: { $in: ['HR', 'Admin'] } 
    }).select('_id');
    
    for (const admin of hrAdmins) {
      await createNotification(
        admin._id,
        'leave_pending',
        'New Leave Request',
        `${employeeId} has requested ${normalizedType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
        { leaveId: leave._id, employeeId }
      );
    }

    console.log('Leave request created successfully:', leave._id);
    res.status(201).json(leave);
  } catch (error) {
    console.error('Error in applyLeave:', error);
    res.status(500).json({ message: error.message || 'Failed to submit leave request' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const leaves = await LeaveRequest.find({ employeeId });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveRejectLeave = async (req, res) => {
  try {
    const { id, status, adminComments } = req.body;

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    if (adminComments) {
      leave.adminComments = adminComments;
    }
    await leave.save();

    // Find the employee user
    const employee = await User.findOne({ employeeId: leave.employeeId });
    
    if (employee) {
      // Notify employee about decision
      const notifType = status.toLowerCase() === 'approved' ? 'leave_approved' : 'leave_rejected';
      const message = status.toLowerCase() === 'approved' 
        ? `Your ${leave.type} request has been approved.${adminComments ? ' Comment: ' + adminComments : ''}`
        : `Your ${leave.type} request has been rejected.${adminComments ? ' Reason: ' + adminComments : ''}`;
      
      await createNotification(
        employee._id,
        notifType,
        `Leave Request ${status}`,
        message,
        { leaveId: leave._id }
      );
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({});
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  approveRejectLeave,
  getAllLeaves
};