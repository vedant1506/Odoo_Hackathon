const jwt = require('jsonwebtoken');

// Fallback to a default for local dev so missing env doesn't crash auth
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { auth, adminOnly };