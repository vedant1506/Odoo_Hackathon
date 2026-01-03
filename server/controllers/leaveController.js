const LeaveRequest = require('../models/LeaveRequest');

const applyLeave = async (req, res) => {
  try {
    const { leaveType, type, startDate, endDate, remarks } = req.body;
    const normalizedType = leaveType || type; // accept either payload key
    if (!normalizedType) {
      return res.status(400).json({ message: 'Leave type is required.' });
    }
    const employeeId = req.user.employeeId;

    const leave = new LeaveRequest({
      employeeId,
      type: normalizedType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      remarks
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const { id, status } = req.body;

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    await leave.save();
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