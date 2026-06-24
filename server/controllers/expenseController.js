const Expense = require('../models/Expense');

const expenseController = {
  async getAll(req, res, next) {
    try {
      const { type, month, year, page, limit } = req.query;
      const result = await Expense.getAll({
        type,
        month,
        year,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const expense = await Expense.getById(req.params.id);
      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found.' });
      }
      res.json({ success: true, data: expense });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { ExpenseDate, ExpenseType, Description, Amount, PaidTo } = req.body;
      if (!ExpenseType || !Amount) {
        return res.status(400).json({ success: false, message: 'ExpenseType and Amount are required.' });
      }
      const expense = await Expense.create({
        ExpenseDate: ExpenseDate || new Date(),
        ExpenseType,
        Description,
        Amount,
        PaidTo,
        RecordedBy: req.user.userId,
      });
      res.status(201).json({ success: true, message: 'Expense recorded successfully', data: expense });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { ExpenseDate, ExpenseType, Description, Amount, PaidTo } = req.body;
      const expense = await Expense.update(req.params.id, { ExpenseDate, ExpenseType, Description, Amount, PaidTo });
      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found.' });
      }
      res.json({ success: true, message: 'Expense updated successfully', data: expense });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const expense = await Expense.delete(req.params.id);
      if (!expense) {
        return res.status(404).json({ success: false, message: 'Expense not found.' });
      }
      res.json({ success: true, message: 'Expense deleted successfully', data: expense });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/expenses/monthly-summary?year=2024
  async getMonthlySummary(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const summary = await Expense.getMonthlySummary(year);
      res.json({ success: true, data: summary, year });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = expenseController;
