const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expenses', error: error.message });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expense', error: error.message });
  }
});

// POST new expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;
    const newExpense = new Expense({ 
      title, 
      amount, 
      category, 
      date, 
      notes
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create expense', error: error.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update expense', error: error.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting expense', error: error.message });
  }
});

module.exports = router;
