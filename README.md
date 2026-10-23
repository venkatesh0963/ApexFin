# ApexFin — Unified Financial Ledger & Tax Management Suite

**ApexFin** is a full-stack **MERN** (MongoDB, Express.js, React, Node.js) financial management and tax compliance platform. It unifies real-time **Income & Expense Bookkeeping**, **Cash-Flow & Profit/Loss Analytics**, and **Indian Income Tax Planning (Old vs. New Regime)** under a single role-based workspace for **Taxpayers**, **Chartered Accountants**, and **System Administrators**.

---

## ✨ Key Features

### 1. Unified Ledger & Bookkeeping
- **Dashboard Overview:** 6 real-time KPI cards displaying **Total Income**, **Total Expenses**, **Net Profit/Loss & Profit Margin**, **Declared Tax Deductions**, **Estimated Taxable Income**, and **Optimal Tax Liability** with automatic regime recommendation.
- **Income Management:** Full CRUD operations (`Create`, `Read`, `Update`, `Delete`) for income records across categories (*Salary, Sales, Business Income, Freelancing, Investments, Rental Income, Interest Income, Capital Gains, Commission, Other*), payment methods, and Indian Financial Years (`FY 2022-2023` to `FY 2026-2027`).
- **Expense Management:** Full CRUD operations for tracking operational and personal expenses (*Rent, Utilities, Salaries, Marketing, Travel, Equipment, Education, Medical, Insurance, Business Expenses, Taxes, Other*).
- **Unified Transactions Ledger:** Combined view of all income and expense entries with live search, type filtering (*All / Income / Expense*), and one-click **Export to CSV** (`ApexFin_Transactions_<FY>.csv`).
- **Global Financial Year Switcher:** Switch between specific financial years (e.g., `FY 2025-2026`) or `All Years` from the top header bar to filter the entire application instantaneously.

### 2. Tax Planning, Deductions & Regime Calculator
- **Deductions & Exemptions Tracking:** Declare tax-saving investments under **Section 80C**, **Section 80D**, **Home Loan Interest**, **Education Loan Interest**, **HRA Exemption**, **Donations (80G)**, **NPS Contributions (80CCD)**, and more.
- **Old vs. New Tax Regime Engine:** Automatically computes slab-by-slab tax liability for both the **Old Regime** (applying declared deductions) and the **New Regime** (applying the ₹75,000 standard deduction) and highlights your exact tax savings.
- **Verification Workflow:** Each declared deduction carries a live verification status (`Pending Review`, `Verified`, or `Rejected`) audited by Chartered Accountants.

### 3. Visual Analytics & Financial Reports
- **Monthly Cash Flow Bar Chart:** Month-by-month comparison of Income vs. Expenses (ordered April–March for Financial Years).
- **Net Profit Trend Line Chart:** Tracks monthly profitability and surplus/deficit trajectory.
- **Category Breakdown Pie Charts:** Interactive donut charts for both Income sources and Expense categories.
- **Multi-Year Financial Comparison:** Side-by-side comparison of Income, Expenses, and Tax Deductions across multiple Financial Years.

### 4. Role-Based Access Control (RBAC)
- **Taxpayer / Business User (`User`):** Full access to personal/business ledger, transactions, analytics, and tax deduction declarations.
- **Chartered Accountant (`Accountant`):**
  - Dedicated **Accountant Portal** displaying all assigned taxpayer clients, gross income volume, and pending verification counts.
  - Interactive **Client Audit Modal** to inspect any client's income ledger, expense ledger, and **Verify** or **Reject** their tax deduction claims in real time.
- **System Administrator (`Admin`):**
  - Dedicated **Admin Portal** with system-wide metrics (Total Users, Active Tax Rules, Configured Financial Years, Total Ledger Entries).
  - **User & Role Management:** Promote/demote users between `User`, `Accountant`, and `Admin`, or remove accounts and their associated records.
  - **Dynamic Tax Slab Configuration:** Create and manage statutory income tax brackets (`minIncome`, `maxIncome`, `rate %`) for both `Old` and `New` regimes across any Financial Year.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
| Technology | Purpose |
| :--- | :--- |
| **React 19 (Vite 8)** | Fast, component-driven UI framework & bundler |
| **Redux Toolkit & React-Redux** | Global state management for JWT Auth & Financial Year context |
| **React Router DOM v7** | Client-side routing & role-protected route guards |
| **Tailwind CSS v4** | Utility-first styling, glassmorphism cards & responsive layout |
| **Recharts** | Interactive Bar, Line, and Pie/Donut financial charts |
| **Lucide React & React Icons** | Crisp iconography + custom `ApexFinLogo` vector brand mark |
| **Axios** | HTTP client with automatic JWT Bearer token interceptor |
| **React Hot Toast** | Non-intrusive toast notifications for CRUD & auth actions |

### Backend (`server/`)
| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express 5** | RESTful API server (ES Modules) |
| **MongoDB & Mongoose 9** | Document database & schema modeling with aggregation pipelines |
| **JSON Web Tokens (`jsonwebtoken`)** | Stateless authentication & role verification |
| **bcrypt** | Secure password hashing & salting |
| **dotenv & cors** | Environment configuration & Cross-Origin Resource Sharing |

---

## 📁 Project Architecture

```text
ApexFin/
├── client/                                 # React + Vite Frontend
│   ├── public/
│   │   └── favicon.svg                     # Custom ApexFin SVG Favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApexFinLogo.jsx             # Custom SVG Brand Mark (Shield + Ledger Bars + Trend Arrow)
│   │   │   ├── Header.jsx                  # Global Search, Financial Year Selector & User Profile
│   │   │   └── Sidebar.jsx                 # Role-aware Sidebar Navigation
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx              # Authenticated App Shell
│   │   ├── pages/
│   │   │   ├── AccountantDashboard.jsx     # Client Directory & Deduction Audit/Verification Modal
│   │   │   ├── AdminDashboard.jsx          # System Stats, User Role Management & Tax Slab Builder
│   │   │   ├── Analytics.jsx               # Monthly, Category & Multi-Year Visual Reports
│   │   │   ├── Dashboard.jsx               # Unified 6-KPI Ledger + Tax Overview & Regime Comparison
│   │   │   ├── Deductions.jsx              # 80C/80D/NPS Declarations & Tax Slab Reference
│   │   │   ├── Expense.jsx                 # Expense CRUD Table & Modal
│   │   │   ├── Income.jsx                  # Income CRUD Table & Modal
│   │   │   ├── Login.jsx                   # Sign In, Registration & 1-Click Demo Login Portal
│   │   │   └── Transactions.jsx            # Unified Searchable Ledger & CSV Exporter
│   │   ├── services/
│   │   │   └── api.js                      # Axios Instance, API Helpers & INR (₹) Currency Formatter
│   │   ├── store/
│   │   │   ├── authSlice.js                # Auth Thunks (login/register) & Global Financial Year State
│   │   │   └── store.js                    # Redux Store Configuration
│   │   ├── App.jsx                         # Route Definitions & Role Guards
│   │   ├── index.css                       # Tailwind v4 Theme & Component Classes
│   │   └── main.jsx                        # React Entry Point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                                 # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                           # MongoDB Connection Handler
│   ├── controllers/
│   │   ├── accountant.controller.js        # Client listing, record inspection & deduction verification
│   │   ├── admin.controller.js             # User management, system stats & tax slab CRUD
│   │   ├── analytics.controller.js         # Aggregations & Old/New Regime slab tax calculation engine
│   │   ├── auth.controller.js              # Register, Login & current user profile
│   │   ├── deduction.controller.js         # Tax deduction CRUD controllers
│   │   ├── expense.controller.js           # Expense CRUD & filtering controllers
│   │   └── income.controller.js            # Income CRUD & filtering controllers
│   ├── middleware/
│   │   └── authMiddleware.js               # JWT `protect` & role-based `authorize` middleware
│   ├── models/
│   │   ├── Deduction.js                    # Deduction Schema (section, title, amount, status, FY)
│   │   ├── Expense.js                      # Expense Schema (title, category, amount, paymentMethod, FY)
│   │   ├── Income.js                       # Income Schema + Indian Financial Year auto-resolver
│   │   ├── TaxSlab.js                      # TaxSlab Schema (regime, financialYear, bracket array)
│   │   └── User.js                         # User Schema (name, email, password, role)
│   ├── routes/
│   │   ├── accountant.routes.js
│   │   ├── admin.routes.js
│   │   ├── analytics.routes.js
│   │   ├── auth.routes.js
│   │   ├── deduction.routes.js
│   │   ├── expense.routes.js
│   │   └── income.routes.js
│   ├── app.js                              # Express App & Route Mounting
│   ├── seedUser.js                         # Database Seeder (Users, Tax Slabs & Sample Records)
│   ├── server.js                           # Server Entry Point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schemas

1. **`User`**: `name`, `email` (unique), `password` (bcrypt hashed), `role` (`'User' | 'Accountant' | 'Admin'`).
2. **`Income`**: `userId`, `title`, `source`, `amount`, `category`, `paymentMethod`, `description`, `date`, `financialYear` (automatically computed as April–March Indian FY if omitted).
3. **`Expense`**: `userId`, `title`, `amount`, `category`, `paymentMethod`, `description`, `receipt`, `date`, `financialYear`.
4. **`Deduction`**: `userId`, `section` (`Section 80C`, `Section 80D`, `NPS Contributions`, `HRA Exemption`, etc.), `title`, `amount`, `proofDocument`, `status` (`'Pending' | 'Verified' | 'Rejected'`), `financialYear`.
5. **`TaxSlab`**: `regime` (`'Old' | 'New'`), `financialYear`, `slabs` (`[{ minIncome, maxIncome, rate }]`).

---

## 🔌 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Authenticate user and receive JWT token
- `GET /api/auth/me` — Get current logged-in user profile *(Protected)*

### Income Ledger (`/api/income`)
- `GET /api/income` — List user's income records (supports `financialYear`, `query`, `category`, `month`, `year`)
- `POST /api/income` — Create a new income entry
- `GET /api/income/:id` — Get single income entry
- `PUT /api/income/:id` — Update an income entry
- `DELETE /api/income/:id` — Delete an income entry

### Expense Ledger (`/api/expenses`)
- `GET /api/expenses` — List user's expense records (supports `financialYear`, `query`, `category`, `month`, `year`)
- `POST /api/expenses` — Create a new expense entry
- `GET /api/expenses/:id` — Get single expense entry
- `PUT /api/expenses/:id` — Update an expense entry
- `DELETE /api/expenses/:id` — Delete an expense entry

### Tax Deductions (`/api/deductions`)
- `GET /api/deductions` — List user's declared tax deductions (supports `financialYear`)
- `POST /api/deductions` — Declare a new tax deduction
- `PUT /api/deductions/:id` — Update a deduction declaration
- `DELETE /api/deductions/:id` — Delete a deduction declaration

### Analytics & Tax Engine (`/api/analytics`)
- `GET /api/analytics/summary` — Returns `totalIncome`, `totalExpenses`, `netProfit`, `profitMargin`, `totalDeductions`, `taxableIncomeOld`, `taxableIncomeNew`, `estimatedTaxOld`, `estimatedTaxNew`, and `recommendedRegime`
- `GET /api/analytics/monthly` — Monthly aggregated income, expense, and net profit
- `GET /api/analytics/categories` — Category-wise aggregation for incomes, expenses, and deductions
- `GET /api/analytics/yearly` — Multi-year comparison grouped by `financialYear`
- `GET /api/analytics/tax-slabs` — Fetch active tax slabs for display in the Taxpayer portal

### Accountant Portal (`/api/accountant`) *(Role: Accountant / Admin)*
- `GET /api/accountant/clients` — List all taxpayer clients with aggregated ledger & deduction stats
- `GET /api/accountant/clients/:clientId/records` — Inspect a specific client's incomes, expenses, and deductions
- `PUT /api/accountant/deductions/:id/status` — Approve (`Verified`) or reject (`Rejected`) a client's deduction claim

### Admin Portal (`/api/admin`) *(Role: Admin)*
- `GET /api/admin/stats` — System-wide counts for users, tax rules, financial years, and ledger transactions
- `GET /api/admin/users` — List all registered users
- `PUT /api/admin/users/:id/role` — Change a user's role (`User`, `Accountant`, `Admin`)
- `DELETE /api/admin/users/:id` — Delete a user and cascade-delete their ledger/tax records
- `GET /api/admin/tax-slabs` — List all configured tax slabs
- `POST /api/admin/tax-slabs` — Create a new tax slab configuration for a regime and financial year
- `PUT /api/admin/tax-slabs/:id` — Update a tax slab configuration
- `DELETE /api/admin/tax-slabs/:id` — Delete a tax slab configuration

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local MongoDB Community Server running on port `27017` or a MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/venkatesh0963/ApexFin.git
cd ApexFin
```

### 2. Configure & Start the Backend
```bash
cd server
npm install
```
Create a `.env` file inside `server/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/apex_tax_ledger
JWT_SECRET=apex_unified_super_secret_jwt_key_2026
```
Seed the database with demo accounts, statutory tax slabs (`2024-2025` to `2026-2027`), and sample ledger/tax records:
```bash
npm run seed
```
Start the backend server:
```bash
npm run dev
```
*The API will be live at `http://localhost:5000`.*

### 3. Configure & Start the Frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
*The frontend application will be live at `http://localhost:5173`.*

---

## 🔐 Seeded Demo Accounts

You can log in with **1-Click Demo Buttons** on the login page or enter these credentials manually:

| Role | Email | Password | Portal Capabilities |
| :--- | :--- | :--- | :--- |
| **Taxpayer / User** | `user@example.com` | `password123` | Pre-loaded with sample salaries, freelance income, rent/equipment expenses, and 80C/80D/NPS deductions |
| **Accountant** | `accountant@example.com` | `password123` | View client directory, audit client ledgers, and verify/reject tax deductions |
| **Administrator** | `admin@example.com` | `password123` | Manage users/roles, view system stats, and configure Old/New regime tax slabs |

---

## 🌐 Deployment Guide

- **Database (MongoDB Atlas):** Create a free cluster on MongoDB Atlas, whitelist `0.0.0.0/0`, and copy the connection string into `MONGO_URI`.
- **Backend (Render / Railway):** Set the root directory to `server`, build command to `npm install`, start command to `npm start`, and configure `MONGO_URI`, `JWT_SECRET`, and `PORT`.
- **Frontend (Vercel / Netlify):** Set the root directory to `client`, framework preset to `Vite`, build command to `npm run build`, output directory to `dist`, and add `VITE_API_URL=https://your-backend-url.onrender.com/api`.
