import Expense from '../models/Expense.js';
import { computeFinancialYear } from '../models/Income.js';

export const getExpenses = async (req, res) => {
  try {
    const { query, category, month, year, startDate, endDate, financialYear } = req.query;
    const filter = { userId: req.user.id };

    if (financialYear && financialYear !== 'All') {
      filter.financialYear = financialYear;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (month && year) {
      const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const endMonth = String(month) === '12' ? '01' : String(Number(month) + 1).padStart(2, '0');
      const endYear = String(month) === '12' ? String(Number(year) + 1) : year;
      const endDateStr = `${endYear}-${endMonth}-01`;
      filter.date = {
        $gte: new Date(startDateStr),
        $lt: new Date(endDateStr),
      };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, description, paymentMethod, receipt, financialYear } = req.body;
    const resolvedDate = date ? new Date(date) : new Date();
    const resolvedFY =
      financialYear && financialYear !== 'All'
        ? financialYear
        : computeFinancialYear(resolvedDate);

    const expense = await Expense.create({
      userId: req.user.id,
      title: title || description || category,
      category,
      amount: Number(amount),
      date: resolvedDate,
      description,
      paymentMethod: paymentMethod || 'UPI / Bank Transfer',
      receipt,
      financialYear: resolvedFY,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    const payload = { ...req.body };
    if (payload.date && (!payload.financialYear || payload.financialYear === 'All')) {
      payload.financialYear = computeFinancialYear(payload.date);
    }

    const updated = await Expense.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    await expense.deleteOne();
    res.status(200).json({ success: true, id: req.params.id, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
