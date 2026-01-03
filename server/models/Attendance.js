const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-day', 'Leave'],
    default: 'Absent'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);