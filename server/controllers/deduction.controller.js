import Deduction from '../models/Deduction.js';
import { computeFinancialYear } from '../models/Income.js';

export const getDeductions = async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.financialYear && req.query.financialYear !== 'All') {
      filter.financialYear = req.query.financialYear;
    }
    const deductions = await Deduction.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: deductions.length, data: deductions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDeduction = async (req, res) => {
  try {
    const { section, title, amount, financialYear, proofDocument } = req.body;

    if (!section || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide section and amount' });
    }

    const resolvedFY =
      financialYear && financialYear !== 'All' ? financialYear : computeFinancialYear(new Date());

    const deduction = await Deduction.create({
      userId: req.user.id,
      section,
      title: title || section,
      amount: Number(amount),
      financialYear: resolvedFY,
      proofDocument,
    });

    res.status(201).json({ success: true, data: deduction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeduction = async (req, res) => {
  try {
    const deduction = await Deduction.findById(req.params.id);
    if (!deduction) {
      return res.status(404).json({ success: false, message: 'Deduction not found' });
    }
    if (deduction.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    const updated = await Deduction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDeduction = async (req, res) => {
  try {
    const deduction = await Deduction.findById(req.params.id);
    if (!deduction) {
      return res.status(404).json({ success: false, message: 'Deduction not found' });
    }
    if (deduction.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    await deduction.deleteOne();
    res.status(200).json({ success: true, id: req.params.id, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
