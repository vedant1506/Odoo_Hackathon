const jwt = require('jsonwebtoken');

// Fallback to a default for local dev so missing env doesn't crash auth
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('Auth failed: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('Auth success:', { employeeId: decoded.employeeId, role: decoded.role });
    next();
  } catch (error) {
    console.log('Auth failed: Invalid token', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const roleEquals = (role, targets = []) => {
  const normalized = (role || '').toUpperCase();
  return targets.map(r => r.toUpperCase()).includes(normalized);
};

const adminOnly = (req, res, next) => {
  if (!roleEquals(req.user.role, ['Admin'])) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

const hrOrAdmin = (req, res, next) => {
  if (roleEquals(req.user.role, ['Admin', 'HR'])) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
};

module.exports = { auth, adminOnly, hrOrAdmin };