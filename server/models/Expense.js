import mongoose from 'mongoose';
import { computeFinancialYear } from './Income.js';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Rent',
        'Utilities',
        'Salaries',
        'Marketing',
        'Travel',
        'Equipment',
        'Education',
        'Medical',
        'Insurance',
        'Business Expenses',
        'Taxes',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'UPI / Bank Transfer',
    },
    receipt: {
      type: String,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    financialYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

expenseSchema.pre('validate', function () {
  if (!this.title) {
    this.title = this.description || this.category || 'Expense';
  }
  if (!this.financialYear) {
    this.financialYear = computeFinancialYear(this.date);
  }
});

export default mongoose.model('Expense', expenseSchema);
