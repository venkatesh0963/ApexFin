import User from '../models/User.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Deduction from '../models/Deduction.js';

export const getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'User' }).select('-password').lean();

    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const [incomes, expenses, deductions] = await Promise.all([
          Income.find({ userId: client._id }),
          Expense.find({ userId: client._id }),
          Deduction.find({ userId: client._id }),
        ]);

        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
        const pendingDeductions = deductions.filter((d) => d.status === 'Pending').length;

        return {
          ...client,
          totalIncome,
          totalExpense,
          totalDeductions,
          pendingDeductions,
          recordCount: incomes.length + expenses.length + deductions.length,
        };
      })
    );

    res.status(200).json(enrichedClients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientRecords = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { financialYear } = req.query;

    const client = await User.findById(clientId).select('-password');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const filter = { userId: clientId };
    if (financialYear && financialYear !== 'All') {
      filter.financialYear = financialYear;
    }

    const [incomes, expenses, deductions] = await Promise.all([
      Income.find(filter).sort({ date: -1 }),
      Expense.find(filter).sort({ date: -1 }),
      Deduction.find(filter).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      client,
      incomes,
      expenses,
      deductions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeductionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const deduction = await Deduction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!deduction) {
      return res.status(404).json({ message: 'Deduction not found' });
    }

    res.status(200).json(deduction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
