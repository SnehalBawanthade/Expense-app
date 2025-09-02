const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the expense'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Travel',
      'Meals',
      'Office Supplies',
      'Transportation',
      'Accommodation',
      'Entertainment',
      'Training',
      'Software',
      'Equipment',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  description: {
    type: String,
    required: [true, 'Please provide a reason for the expense'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  vendor: {
    name: {
      type: String,
      required: [true, 'Please provide vendor name'],
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  invoice: {
    filename: {
      type: String,
      required: [true, 'Please upload an invoice']
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    }
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Under Review'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: {
    type: String,
    trim: true
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  expenseDate: {
    type: Date,
    required: [true, 'Please provide the date when the expense was incurred']
  }
}, {
  timestamps: true
});

// Index for better query performance
expenseSchema.index({ submittedBy: 1, status: 1 });
expenseSchema.index({ status: 1, submittedDate: -1 });

module.exports = mongoose.model('Expense', expenseSchema);


