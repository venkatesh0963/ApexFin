import User from '../models/User.js';
import TaxSlab from '../models/TaxSlab.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Deduction from '../models/Deduction.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['User', 'Admin', 'Accountant'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Promise.all([
      user.deleteOne(),
      Income.deleteMany({ userId: req.params.id }),
      Expense.deleteMany({ userId: req.params.id }),
      Deduction.deleteMany({ userId: req.params.id }),
    ]);
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const [totalUsers, activeRules, distinctYears, totalIncomes, totalExpenses] = await Promise.all([
      User.countDocuments(),
      TaxSlab.countDocuments(),
      TaxSlab.distinct('financialYear'),
      Income.countDocuments(),
      Expense.countDocuments(),
    ]);

    res.status(200).json({
      totalUsers,
      activeRules,
      financialYears: distinctYears.length,
      totalTransactions: totalIncomes + totalExpenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaxSlabs = async (req, res) => {
  try {
    const slabs = await TaxSlab.find({}).sort({ financialYear: -1, regime: 1 });
    res.status(200).json(slabs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTaxSlab = async (req, res) => {
  try {
    const { regime, financialYear, slabs } = req.body;
    if (!regime || !financialYear || !slabs || !slabs.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const taxSlab = await TaxSlab.create({ regime, financialYear, slabs });
    res.status(201).json(taxSlab);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaxSlab = async (req, res) => {
  try {
    const updatedSlab = await TaxSlab.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSlab) return res.status(404).json({ message: 'Tax Slab not found' });
    res.status(200).json(updatedSlab);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTaxSlab = async (req, res) => {
  try {
    const slab = await TaxSlab.findById(req.params.id);
    if (!slab) return res.status(404).json({ message: 'Tax Slab not found' });
    await slab.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
