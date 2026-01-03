const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Paid', 'Sick', 'Unpaid', 'Sick Leave', 'Casual Leave', 'Vacation', 'Personal'],
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
  },
  remarks: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  },
  adminComments: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);