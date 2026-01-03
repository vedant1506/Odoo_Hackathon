const User = require('../models/User');

const getEmployees = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const employees = await User.find().select('-password');
      res.json(employees);
    } else {
      const employee = await User.findOne({ employeeId: req.user.employeeId }).select('-password');
      res.json([employee]);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees };
