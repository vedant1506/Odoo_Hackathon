const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fallback secret for dev; prefer setting JWT_SECRET in .env
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';

const signUp = async (req, res) => {
  try {
    console.log('=== Sign Up Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { employeeId, email, password, role } = req.body;

    // Validation
    if (!employeeId || !email || !password) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Employee ID, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      employeeId,
      email,
      password: hashedPassword,
      role: role || 'Employee'
    });

    await user.save();

    console.log('User created successfully:', employeeId);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signUp:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

const signIn = async (req, res) => {
  try {
    console.log('=== Sign In Request ===');
    console.log('Email:', req.body.email);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('Validation failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, employeeId: user.employeeId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { employeeId: user.employeeId, role: user.role });
    res.json({ token, user: { id: user._id, employeeId: user.employeeId, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    console.error('Error in signIn:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

module.exports = { signUp, signIn };