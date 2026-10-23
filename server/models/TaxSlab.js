import mongoose from 'mongoose';

const slabSchema = new mongoose.Schema({
  minIncome: { type: Number, required: true },
  maxIncome: { type: Number, default: null }, // null for "Above X"
  rate: { type: Number, required: true }, // percentage e.g. 5, 10, 20, 30
});

const taxSlabSchema = new mongoose.Schema(
  {
    regime: { type: String, enum: ['Old', 'New'], required: true },
    financialYear: { type: String, required: true },
    slabs: [slabSchema],
  },
  { timestamps: true }
);

export default mongoose.model('TaxSlab', taxSlabSchema);
