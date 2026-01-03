const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Employee', 'HR'],
    default: 'Employee'
  },
  name: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  designation: {
    type: String,
    default: ''
  },
  joinDate: {
    type: Date
  },
  address: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  salary: {
    basic: {
      type: Number,
      default: 0
    },
    hra: {
      type: Number,
      default: 0
    },
    allowances: {
      type: Number,
      default: 0
    },
    deductions: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
