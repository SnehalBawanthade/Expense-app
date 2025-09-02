const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Expense = require('../models/Expense');
const { protect, authorize, canAccessExpense } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/invoices';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF, JPG, JPEG, PNG files
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'image/jpeg' || 
      file.mimetype === 'image/jpg' || 
      file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @desc    Submit new expense
// @route   POST /api/expenses
// @access  Private (Employee)
router.post('/', protect, authorize('Employee'), upload.single('invoice'), [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('category').isIn(['Travel', 'Meals', 'Office Supplies', 'Transportation', 'Accommodation', 'Entertainment', 'Training', 'Software', 'Equipment', 'Other']).withMessage('Invalid category'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be less than 500 characters'),
  body('vendor.name').trim().notEmpty().withMessage('Vendor name is required'),
  body('expenseDate').isISO8601().withMessage('Valid expense date is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Invoice file is required' });
    }

    const {
      title,
      category,
      amount,
      currency = 'USD',
      description,
      vendor,
      expenseDate
    } = req.body;

    // Parse vendor object if it's a string
    let vendorData;
    try {
      vendorData = typeof vendor === 'string' ? JSON.parse(vendor) : vendor;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid vendor data format' });
    }

    const expense = await Expense.create({
      title,
      category,
      amount: parseFloat(amount),
      currency,
      description,
      vendor: vendorData,
      invoice: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      submittedBy: req.user._id,
      expenseDate: new Date(expenseDate)
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Expense submission error:', error);
    res.status(500).json({ message: 'Server error during expense submission' });
  }
});

// @desc    Get all expenses for current user
// @route   GET /api/expenses/my
// @access  Private (Employee)
router.get('/my', protect, authorize('Employee'), async (req, res) => {
  try {
    const expenses = await Expense.find({ submittedBy: req.user._id })
      .sort({ submittedDate: -1 })
      .populate('reviewedBy', 'name email');

    res.json(expenses);
  } catch (error) {
    console.error('Get user expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all expenses (for managers and finance)
// @route   GET /api/expenses
// @access  Private (Manager, Finance)
router.get('/', protect, authorize('Manager', 'Finance'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const expenses = await Expense.find(query)
      .populate('submittedBy', 'name email department employeeId')
      .populate('reviewedBy', 'name email')
      .sort({ submittedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
router.get('/:id', protect, canAccessExpense, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('submittedBy', 'name email department employeeId')
      .populate('reviewedBy', 'name email');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update expense status (for managers and finance)
// @route   PUT /api/expenses/:id/status
// @access  Private (Manager, Finance)
router.put('/:id/status', protect, authorize('Manager', 'Finance'), [
  body('status').isIn(['Approved', 'Rejected', 'Under Review']).withMessage('Invalid status'),
  body('reviewComments').optional().trim().isLength({ max: 500 }).withMessage('Review comments must be less than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reviewComments } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.status = status;
    expense.reviewedBy = req.user._id;
    expense.reviewedDate = new Date();
    
    if (reviewComments) {
      expense.reviewComments = reviewComments;
    }

    await expense.save();

    const updatedExpense = await Expense.findById(req.params.id)
      .populate('submittedBy', 'name email department employeeId')
      .populate('reviewedBy', 'name email');

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Download invoice
// @route   GET /api/expenses/:id/invoice
// @access  Private
router.get('/:id/invoice', protect, canAccessExpense, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const filePath = expense.invoice.path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Invoice file not found' });
    }

    res.download(filePath, expense.invoice.originalName);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


