const Attendance = require('../models/Attendance');

const checkIn = async (req, res) => {
  try {
    const { date } = req.body;
    const employeeId = req.user.employeeId;

    // Check if already checked in today
    const existing = await Attendance.findOne({ employeeId, date: new Date(date) });
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    if (existing) {
      existing.checkIn = new Date();
      existing.status = 'Present';
      await existing.save();
      res.json(existing);
    } else {
      const attendance = new Attendance({
        employeeId,
        date: new Date(date),
        checkIn: new Date(),
        status: 'Present'
      });
      await attendance.save();
      res.json(attendance);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const { date } = req.body;
    const employeeId = req.user.employeeId;

    const attendance = await Attendance.findOne({ employeeId, date: new Date(date) });
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'Not checked in' });
    }

    attendance.checkOut = new Date();
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const records = await Attendance.find({ employeeId });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { checkIn, checkOut, getAttendance };