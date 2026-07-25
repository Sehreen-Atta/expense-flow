const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Entertainment', 'Others'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
