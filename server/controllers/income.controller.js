import Income, { computeFinancialYear } from '../models/Income.js';

export const getIncomes = async (req, res) => {
  try {
    const { query, category, month, year, startDate, endDate, financialYear } = req.query;
    const filter = { userId: req.user.id };

    if (financialYear && financialYear !== 'All') {
      filter.financialYear = financialYear;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { source: { $regex: query, $options: 'i' } },
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

    const incomes = await Income.find(filter).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: incomes.length,
      data: incomes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user.id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }
    res.status(200).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const createIncome = async (req, res) => {
  try {
    const { title, source, amount, category, description, paymentMethod, date, financialYear } = req.body;
    const resolvedTitle = title || source;
    const resolvedDate = date ? new Date(date) : new Date();
    const resolvedFY =
      financialYear && financialYear !== 'All'
        ? financialYear
        : computeFinancialYear(resolvedDate);

    const income = await Income.create({
      userId: req.user.id,
      title: resolvedTitle,
      source: source || resolvedTitle,
      amount: Number(amount),
      category,
      description,
      paymentMethod: paymentMethod || 'Bank Transfer',
      date: resolvedDate,
      financialYear: resolvedFY,
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    const payload = { ...req.body };
    if (payload.title && !payload.source) payload.source = payload.title;
    if (payload.source && !payload.title) payload.title = payload.source;
    if (payload.date && (!payload.financialYear || payload.financialYear === 'All')) {
      payload.financialYear = computeFinancialYear(payload.date);
    }

    const updated = await Income.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }
    if (income.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    await income.deleteOne();
    res.status(200).json({ success: true, id: req.params.id, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
