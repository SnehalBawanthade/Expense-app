const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Not authorized, account is deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this resource` 
      });
    }

    next();
  };
};

// Check if user can access expense (owner, manager, or finance)
const canAccessExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    // If user is Manager or Finance, they can access any expense
    if (userRole === 'Manager' || userRole === 'Finance') {
      return next();
    }

    // If user is Employee, they can only access their own expenses
    const Expense = require('../models/Expense');
    const expense = await Expense.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.submittedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this expense' });
    }

    next();
  } catch (error) {
    console.error('Expense access check error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, authorize, canAccessExpense };


