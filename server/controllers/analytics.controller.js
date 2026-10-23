import mongoose from 'mongoose';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Deduction from '../models/Deduction.js';
import TaxSlab from '../models/TaxSlab.js';

const DEFAULT_OLD_SLABS = [
  { minIncome: 0, maxIncome: 250000, rate: 0 },
  { minIncome: 250000, maxIncome: 500000, rate: 5 },
  { minIncome: 500000, maxIncome: 1000000, rate: 20 },
  { minIncome: 1000000, maxIncome: null, rate: 30 },
];

const DEFAULT_NEW_SLABS = [
  { minIncome: 0, maxIncome: 300000, rate: 0 },
  { minIncome: 300000, maxIncome: 700000, rate: 5 },
  { minIncome: 700000, maxIncome: 1000000, rate: 10 },
  { minIncome: 1000000, maxIncome: 1200000, rate: 15 },
  { minIncome: 1200000, maxIncome: 1500000, rate: 20 },
  { minIncome: 1500000, maxIncome: null, rate: 30 },
];

export const calculateSlabTax = (taxableIncome, slabs) => {
  if (taxableIncome <= 0) return 0;
  let totalTax = 0;
  for (const slab of slabs) {
    const min = slab.minIncome || 0;
    const max = slab.maxIncome !== null && slab.maxIncome !== undefined ? slab.maxIncome : Infinity;
    if (taxableIncome > min) {
      const taxableInSlab = Math.min(taxableIncome, max) - min;
      totalTax += (taxableInSlab * slab.rate) / 100;
    }
  }
  return Math.round(totalTax);
};

export const getSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { financialYear } = req.query;
    const matchFilter = { userId };

    if (financialYear && financialYear !== 'All') {
      matchFilter.financialYear = financialYear;
    }

    const [incomes, expenses, deductions] = await Promise.all([
      Income.aggregate([{ $match: matchFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: matchFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Deduction.aggregate([{ $match: matchFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const totalIncome = incomes.length > 0 ? incomes[0].total : 0;
    const totalExpenses = expenses.length > 0 ? expenses[0].total : 0;
    const totalDeductions = deductions.length > 0 ? deductions[0].total : 0;
    const netProfit = totalIncome - totalExpenses;
    const taxableIncomeOld = Math.max(0, netProfit - totalDeductions);
    const taxableIncomeNew = Math.max(0, netProfit - 75000); // Standard deduction in New Regime

    const slabQuery = financialYear && financialYear !== 'All' ? { financialYear } : {};
    const configuredSlabs = await TaxSlab.find(slabQuery);

    const oldSlabDoc = configuredSlabs.find((s) => s.regime === 'Old');
    const newSlabDoc = configuredSlabs.find((s) => s.regime === 'New');

    const estimatedTaxOld = calculateSlabTax(
      taxableIncomeOld,
      oldSlabDoc ? oldSlabDoc.slabs : DEFAULT_OLD_SLABS
    );
    const estimatedTaxNew = calculateSlabTax(
      taxableIncomeNew,
      newSlabDoc ? newSlabDoc.slabs : DEFAULT_NEW_SLABS
    );

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        totalDeductions,
        netProfit,
        isProfit: netProfit >= 0,
        profitMargin: totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0,
        taxableIncomeOld,
        taxableIncomeNew,
        estimatedTaxOld,
        estimatedTaxNew,
        recommendedRegime: estimatedTaxNew <= estimatedTaxOld ? 'New Regime' : 'Old Regime',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getMonthlyData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { financialYear, year } = req.query;
    const matchFilter = { userId };

    if (financialYear && financialYear !== 'All') {
      matchFilter.financialYear = financialYear;
    } else if (year) {
      const y = parseInt(year);
      matchFilter.date = {
        $gte: new Date(`${y}-01-01`),
        $lt: new Date(`${y + 1}-01-01`),
      };
    }

    const [incomes, expenses] = await Promise.all([
      Income.aggregate([
        { $match: matchFilter },
        { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Order months either Apr->Mar if financialYear is active, or Jan->Dec
    const monthIndices =
      financialYear && financialYear !== 'All'
        ? [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    const monthlyData = monthIndices.map((mIdx) => {
      const monthIncome = incomes.find((item) => item._id === mIdx);
      const monthExpense = expenses.find((item) => item._id === mIdx);
      const inc = monthIncome ? monthIncome.total : 0;
      const exp = monthExpense ? monthExpense.total : 0;
      return {
        month: new Date(2000, mIdx - 1, 1).toLocaleString('en-US', { month: 'short' }),
        income: inc,
        expense: exp,
        profit: inc - exp,
      };
    });

    res.status(200).json({ success: true, data: monthlyData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getCategoriesData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { financialYear } = req.query;
    const matchFilter = { userId };

    if (financialYear && financialYear !== 'All') {
      matchFilter.financialYear = financialYear;
    }

    const [incomeCategories, expenseCategories, deductionCategories] = await Promise.all([
      Income.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Deduction.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$section', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        income: incomeCategories.map((c) => ({ name: c._id, value: c.total })),
        expense: expenseCategories.map((c) => ({ name: c._id, value: c.total })),
        deduction: deductionCategories.map((c) => ({ name: c._id, value: c.total })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getYearlyData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [incomes, expenses, deductions] = await Promise.all([
      Income.aggregate([
        { $match: { userId } },
        { $group: { _id: '$financialYear', total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: '$financialYear', total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Deduction.aggregate([
        { $match: { userId } },
        { $group: { _id: '$financialYear', total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const yearsSet = new Set([
      ...incomes.map((i) => i._id),
      ...expenses.map((e) => e._id),
      ...deductions.map((d) => d._id),
    ]);
    const years = Array.from(yearsSet).filter(Boolean).sort();

    const yearlyData = years.map((fy) => {
      const yInc = incomes.find((item) => item._id === fy);
      const yExp = expenses.find((item) => item._id === fy);
      const yDed = deductions.find((item) => item._id === fy);
      return {
        financialYear: fy,
        income: yInc ? yInc.total : 0,
        expense: yExp ? yExp.total : 0,
        deductions: yDed ? yDed.total : 0,
      };
    });

    res.status(200).json({ success: true, data: yearlyData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getPublicTaxSlabs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.financialYear && req.query.financialYear !== 'All') {
      filter.financialYear = req.query.financialYear;
    }
    const slabs = await TaxSlab.find(filter).sort({ financialYear: -1, regime: 1 });
    res.status(200).json({ success: true, data: slabs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
