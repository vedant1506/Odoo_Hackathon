const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Paid', 'Sick', 'Unpaid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);