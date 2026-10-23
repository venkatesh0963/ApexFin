import mongoose from 'mongoose';
import { computeFinancialYear } from './Income.js';

const deductionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    section: {
      type: String,
      enum: [
        'Section 80C',
        'Section 80D',
        'Home Loan Interest',
        'Education Loan Interest',
        'HRA Exemption',
        'Donations',
        'NPS Contributions',
        'Other',
      ],
      required: [true, 'Section is required'],
    },
    title: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    proofDocument: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    financialYear: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

deductionSchema.pre('validate', function () {
  if (!this.financialYear) {
    this.financialYear = computeFinancialYear(new Date());
  }
});

export default mongoose.model('Deduction', deductionSchema);
