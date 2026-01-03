const Attendance = require('../models/Attendance');

const startOfDay = (value) => {
  const d = value ? new Date(value) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (value) => {
  const d = startOfDay(value);
  d.setDate(d.getDate() + 1);
  return d;
};

const serializeAttendance = (doc) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  // Backward/forward compatibility: some frontend screens use checkInTime/checkOutTime
  obj.checkInTime = obj.checkIn || obj.checkInTime || null;
  obj.checkOutTime = obj.checkOut || obj.checkOutTime || null;
  return obj;
};

const checkIn = async (req, res) => {
  try {
    const { date, checkInTime } = req.body;
    const employeeId = req.user.employeeId;

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Check if already checked in today
    const existing = await Attendance.findOne({
      employeeId,
      date: { $gte: dayStart, $lt: dayEnd },
    });
    
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    const checkInDateTime = checkInTime ? new Date(checkInTime) : new Date();

    if (existing) {
      existing.checkIn = checkInDateTime;
      existing.status = 'Present';
      await existing.save();
      return res.json(serializeAttendance(existing));
    }

    const attendance = new Attendance({
      employeeId,
      date: dayStart,
      checkIn: checkInDateTime,
      status: 'Present'
    });
    await attendance.save();
    return res.json(serializeAttendance(attendance));
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: error.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const { date, checkOutTime } = req.body;
    const employeeId = req.user.employeeId;

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: dayStart, $lt: dayEnd },
    });
    
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'Not checked in' });
    }

    const checkOutDateTime = checkOutTime ? new Date(checkOutTime) : new Date();
    attendance.checkOut = checkOutDateTime;
    await attendance.save();
    res.json(serializeAttendance(attendance));
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // If employeeId is provided in params, check authorization
    if (employeeId) {
      // Check if user is admin/HR or requesting their own data
      if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.employeeId !== employeeId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      const records = await Attendance.find({ employeeId }).sort({ date: -1 });
      return res.json(records.map(serializeAttendance));
    }
    
    // Otherwise return current user's attendance
    const records = await Attendance.find({ employeeId: req.user.employeeId }).sort({ date: -1 });
    res.json(records.map(serializeAttendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });
    res.json(records.map(serializeAttendance));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { checkIn, checkOut, getAttendance, getAllAttendance };