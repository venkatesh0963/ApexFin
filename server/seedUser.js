import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Income from './models/Income.js';
import Expense from './models/Expense.js';
import Deduction from './models/Deduction.js';
import TaxSlab from './models/TaxSlab.js';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/apex_tax_ledger';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    const salt = await bcrypt.genSalt(10);
    const password123 = await bcrypt.hash('password123', salt);

    const usersToCreate = [
      { name: 'Admin Boss', email: 'admin@example.com', password: password123, role: 'Admin' },
      { name: 'Accounting Pro', email: 'accountant@example.com', password: password123, role: 'Accountant' },
      { name: 'Tax Payer', email: 'user@example.com', password: password123, role: 'User' },
    ];

    let taxPayerUser = null;

    for (const u of usersToCreate) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`User already exists: ${u.email} (${existing.role})`);
      }
      if (u.role === 'User') taxPayerUser = existing;
    }

    // Seed Tax Slabs
    const years = ['2024-2025', '2025-2026', '2026-2027'];
    for (const fy of years) {
      const oldExists = await TaxSlab.findOne({ regime: 'Old', financialYear: fy });
      if (!oldExists) {
        await TaxSlab.create({
          regime: 'Old',
          financialYear: fy,
          slabs: [
            { minIncome: 0, maxIncome: 250000, rate: 0 },
            { minIncome: 250000, maxIncome: 500000, rate: 5 },
            { minIncome: 500000, maxIncome: 1000000, rate: 20 },
            { minIncome: 1000000, maxIncome: null, rate: 30 },
          ],
        });
        console.log(`Seeded Old Regime Tax Slab for ${fy}`);
      }

      const newExists = await TaxSlab.findOne({ regime: 'New', financialYear: fy });
      if (!newExists) {
        await TaxSlab.create({
          regime: 'New',
          financialYear: fy,
          slabs: [
            { minIncome: 0, maxIncome: 300000, rate: 0 },
            { minIncome: 300000, maxIncome: 700000, rate: 5 },
            { minIncome: 700000, maxIncome: 1000000, rate: 10 },
            { minIncome: 1000000, maxIncome: 1200000, rate: 15 },
            { minIncome: 1200000, maxIncome: 1500000, rate: 20 },
            { minIncome: 1500000, maxIncome: null, rate: 30 },
          ],
        });
        console.log(`Seeded New Regime Tax Slab for ${fy}`);
      }
    }

    // Seed Sample Ledger + Tax Data for Tax Payer
    if (taxPayerUser) {
      const existingIncomes = await Income.countDocuments({ userId: taxPayerUser._id });
      if (existingIncomes === 0) {
        await Income.insertMany([
          {
            userId: taxPayerUser._id,
            title: 'Monthly Tech Salary - Q1',
            source: 'Apex Technologies Pvt Ltd',
            amount: 450000,
            category: 'Salary',
            paymentMethod: 'Bank Transfer',
            description: 'April to June salary credit',
            date: new Date('2025-06-30'),
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            title: 'Monthly Tech Salary - Q2',
            source: 'Apex Technologies Pvt Ltd',
            amount: 450000,
            category: 'Salary',
            paymentMethod: 'Bank Transfer',
            description: 'July to September salary credit',
            date: new Date('2025-09-30'),
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            title: 'SaaS UI/UX Consulting',
            source: 'FinVerse Global',
            amount: 185000,
            category: 'Freelancing',
            paymentMethod: 'UPI / Bank Transfer',
            description: 'Product design & architecture retainer',
            date: new Date('2025-11-15'),
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            title: 'Equity Dividend & Gains',
            source: 'Zerodha Broking',
            amount: 95000,
            category: 'Investments',
            paymentMethod: 'Bank Transfer',
            description: 'Index fund & dividend payout',
            date: new Date('2026-01-20'),
            financialYear: '2025-2026',
          },
        ]);
        console.log('Seeded sample Income records for user@example.com');
      }

      const existingExpenses = await Expense.countDocuments({ userId: taxPayerUser._id });
      if (existingExpenses === 0) {
        await Expense.insertMany([
          {
            userId: taxPayerUser._id,
            title: 'Apartment & Workspace Rent',
            category: 'Rent',
            amount: 180000,
            paymentMethod: 'Bank Transfer',
            description: '6 months house & studio rent',
            date: new Date('2025-08-05'),
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            title: 'MacBook Pro & Monitor Setup',
            category: 'Equipment',
            amount: 145000,
            paymentMethod: 'Credit Card',
            description: 'Workstation hardware upgrade',
            date: new Date('2025-10-12'),
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            title: 'High-Speed Fiber & Cloud Hosting',
            category: 'Utilities',
            amount: 36000,
            paymentMethod: 'UPI',
            description: 'Annual internet and AWS bills',
            date: new Date('2025-12-01'),
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            title: 'Family Health Checkup & Medical',
            category: 'Medical',
            amount: 28000,
            paymentMethod: 'Credit Card',
            description: 'Preventive diagnostics & pharmacy',
            date: new Date('2026-02-10'),
            financialYear: '2025-2026',
          },
        ]);
        console.log('Seeded sample Expense records for user@example.com');
      }

      const existingDeductions = await Deduction.countDocuments({ userId: taxPayerUser._id });
      if (existingDeductions === 0) {
        await Deduction.insertMany([
          {
            userId: taxPayerUser._id,
            section: 'Section 80C',
            title: 'ELSS Mutual Funds & PPF Contribution',
            amount: 150000,
            status: 'Verified',
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            section: 'Section 80D',
            title: 'Comprehensive Family Health Insurance',
            amount: 25000,
            status: 'Verified',
            financialYear: '2025-2026',
          },
          {
            userId: taxPayerUser._id,
            section: 'NPS Contributions',
            title: 'Section 80CCD(1B) Tier-1 NPS',
            amount: 50000,
            status: 'Pending',
            financialYear: '2025-2026',
          },
        ]);
        console.log('Seeded sample Deduction records for user@example.com');
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit(0);
  }
};

seed();
