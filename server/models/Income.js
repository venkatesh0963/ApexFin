import mongoose from 'mongoose';

export const computeFinancialYear = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  // Indian Financial Year: April (4) to March (3)
  if (month >= 4) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
};

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title / Source is required'],
      trim: true,
    },
    source: {
      type: String,
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
        'Salary',
        'Sales',
        'Business Income',
        'Freelancing',
        'Investments',
        'Rental Income',
        'Interest Income',
        'Capital Gains',
        'Commission',
        'Other',
        'Other Income',
      ],
    },
    description: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Bank Transfer',
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

incomeSchema.pre('validate', function () {
  if (!this.title && this.source) {
    this.title = this.source;
  }
  if (!this.source && this.title) {
    this.source = this.title;
  }
  if (!this.financialYear) {
    this.financialYear = computeFinancialYear(this.date);
  }
});

export default mongoose.model('Income', incomeSchema);
