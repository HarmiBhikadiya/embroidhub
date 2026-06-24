const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserLogin = require('../models/UserLogin');

const authController = {
  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
      }

      const user = await UserLogin.getByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      if (user.status !== 'Active') {
        return res.status(403).json({ success: false, message: 'Account is inactive. Contact admin.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordhash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Update last login
      await UserLogin.updateLastLogin(user.userid);

      // Generate JWT
      const token = jwt.sign(
        { userId: user.userid, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            userId: user.userid,
            username: user.username,
            role: user.role,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },



  
  // POST /api/auth/register (Public for Employee Registration)
  async register(req, res, next) {
    try {
      const { username, password, name, contactNumber } = req.body;
      const role = 'Employee'; // Force role to Employee for self-registration

      if (!username || !password || !name) {
        return res.status(400).json({ success: false, message: 'Username, password, and name are required.' });
      }

      // Check if username exists
      const existing = await UserLogin.getByUsername(username);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const PasswordHash = await bcrypt.hash(password, salt);

      // Create UserLogin record
      const user = await UserLogin.create({ Username: username, PasswordHash, Role: role });

      // Create Employee record explicitly
      const pool = require('../config/db');
      await pool.query(
        'INSERT INTO Employee (Name, ContactNumber, Role, Salary, JoinDate) VALUES ($1, $2, $3, $4, $5)',
        [name, contactNumber || null, 'Machine Operator', 15000.00, new Date()]
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/me
  async getMe(req, res, next) {
    try {
      const user = await UserLogin.getById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/users (Admin only)
  async getAllUsers(req, res, next) {
    try {
      const users = await UserLogin.getAll();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
