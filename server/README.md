# Embroidery Management System - Backend API

A complete RESTful backend API for managing embroidery business operations including customers, orders, designs, production, payments, invoicing, inventory, and expenses.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Architecture:** MVC (Model-View-Controller)

## Prerequisites

- Node.js v16+
- PostgreSQL v12+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE embroidery_db;
```

Or via command line:

```bash
psql -U postgres -c "CREATE DATABASE embroidery_db;"
```

### 3. Environment Variables

Copy the example env file and update if needed:

```bash
cp .env.example .env
```

Default configuration (`.env`):
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=embroidery_db
JWT_SECRET=embroidery_mgmt_secret_key_2024
JWT_EXPIRES_IN=24h
```

### 4. Run Schema & Seed Data

```bash
npm run seed
```

This will:
- Create all 14 tables with proper relationships
- Insert sample data (customers, orders, designs, etc.)
- Create default login users

### 5. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs at: `http://localhost:5000`

## Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| rahul_emp | emp123 | Employee |
| priya_acc | acc123 | Accountant |

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/register` | Register user | Admin |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/auth/users` | List all users | Admin |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all (search: `?search=name`) |
| GET | `/api/customers/:id` | Get by ID |
| GET | `/api/customers/:id/orders` | Order history |
| POST | `/api/customers` | Create |
| PUT | `/api/customers/:id` | Update |
| DELETE | `/api/customers/:id` | Delete |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List (filters: `?status=Pending&customerid=1`) |
| GET | `/api/orders/:id` | Get with designs & payments |
| POST | `/api/orders` | Create |
| PUT | `/api/orders/:id` | Update |
| PUT | `/api/orders/:id/status` | Update status |
| DELETE | `/api/orders/:id` | Delete |

### Designs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/designs` | List all |
| GET | `/api/designs/:id` | Get by ID |
| POST | `/api/designs` | Create |
| PUT | `/api/designs/:id` | Update |
| DELETE | `/api/designs/:id` | Delete |

### Order Designs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/order-designs/order/:orderId` | Designs for order |
| POST | `/api/order-designs` | Add design to order |
| PUT | `/api/order-designs/:id` | Update |
| DELETE | `/api/order-designs/:id` | Remove |

### Employees
Full CRUD at `/api/employees` (Create/Update/Delete: Admin only)

### Machines
Full CRUD at `/api/machines` (Create/Update/Delete: Admin only)

### Production
Full CRUD at `/api/production` (filter: `?status=ongoing` or `?status=completed`)

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List (filter: `?orderid=1&mode=UPI`) |
| GET | `/api/payments/order/:orderId` | Payments for order |
| POST | `/api/payments` | Record payment (auto-updates order) |
| DELETE | `/api/payments/:id` | Delete |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List all |
| GET | `/api/invoices/:id` | Get details |
| GET | `/api/invoices/:id/pdf` | Export as PDF |
| POST | `/api/invoices` | Generate |
| DELETE | `/api/invoices/:id` | Delete |

### Materials & Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials` | List (filter: `?lowstock=true`) |
| GET | `/api/materials/low-stock` | Low stock alerts |
| POST | `/api/materials/:id/use` | Deduct stock |
| GET | `/api/suppliers` | List suppliers |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List (filter: `?month=1&year=2024`) |
| GET | `/api/expenses/monthly-summary?year=2024` | Summary |
| POST | `/api/expenses` | Record expense |

### Backup Logs (Admin only)
Full CRUD at `/api/backup-logs`

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Total orders, revenue, pending |
| GET | `/api/dashboard/monthly-expenses?year=2024` | Monthly chart |
| GET | `/api/dashboard/monthly-revenue?year=2024` | Revenue chart |
| GET | `/api/dashboard/top-designs?limit=5` | Top designs |
| GET | `/api/dashboard/order-status` | Status breakdown |

## Pagination

All list endpoints support pagination:
```
GET /api/customers?page=1&limit=20
```

Response includes: `total`, `page`, `limit`, `totalPages`

## Project Structure

```
server/
├── config/
│   └── db.js              # PostgreSQL pool
├── controllers/            # Request handlers
├── database/
│   ├── schema.sql         # Table definitions
│   ├── seed.sql           # Sample data
│   └── runSeed.js         # Seed runner
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── roleCheck.js       # RBAC
│   ├── errorHandler.js    # Error handling
│   └── validate.js        # Validation
├── models/                # Database queries
├── routes/                # API route definitions
├── utils/
├── .env
├── .env.example
├── package.json
├── server.js              # Entry point
└── README.md
```

## Database Tables

14 tables with full foreign key relationships:
Customer, Orders, Design, OrderDesign, Employee, Machine, Production, Payment, Supplier, Material, UserLogin, Invoice, Expense, BackupLog
