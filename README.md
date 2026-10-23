# ApexFin — Unified Ledger + Tax Management Suite

A unified MERN stack platform (**ApexFin**) combining **Apex Ledger** (Income, Expenses, Unified Transactions, Profit/Loss Analytics) and **ApexTax** (JWT Authentication, Role-Based Portals for Taxpayer/Accountant/Admin, Section 80C/80D/NPS Deductions, and Old vs New Regime Tax Slab Calculations).

## Unified Structure

```text
TAX + LEDGER/
├── client/                 # Unified React + Vite + Redux + Tailwind v4 Frontend
│   ├── src/
│   │   ├── components/     # Sidebar & Header (with Global Financial Year selector)
│   │   ├── layouts/        # MainLayout wrapper
│   │   ├── pages/          # Login, Dashboard, Income, Expense, Transactions, Deductions, Analytics, AccountantDashboard, AdminDashboard
│   │   ├── services/       # Unified Axios API client & INR currency formatter
│   │   └── store/          # Redux Toolkit auth & financial year state
│   └── package.json
└── server/                 # Unified Node.js + Express + MongoDB Backend
    ├── config/             # MongoDB connection
    ├── controllers/        # Auth, Income, Expense, Deduction, Analytics, Accountant, Admin controllers
    ├── middleware/         # JWT protect & role authorize middleware
    ├── models/             # User, Income, Expense, Deduction, TaxSlab schemas
    ├── routes/             # Express API routes
    ├── seedUser.js         # Seeds demo users, tax slabs, and sample ledger/tax records
    └── server.js           # Backend entry point
```

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install
npm run seed    # Optional: Seeds Admin, Accountant, Taxpayer accounts + sample data
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Default Seeded Accounts (Password: `password123`)
- **Taxpayer / Business User:** `user@example.com`
- **Chartered Accountant:** `accountant@example.com`
- **System Admin:** `admin@example.com`
