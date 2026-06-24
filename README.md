# EmbroidHub (Embroidery Management System)

EmbroidHub is a comprehensive, production-ready enterprise resource planning (ERP) and management system designed for embroidery businesses. It provides full-scale management of customers, orders, designs, machines, materials, expenses, employee tracking, payments, invoices, and active production status dashboards.

---

## Tech Stack

EmbroidHub is built as a modern, decoupled client-server web application:

- **Frontend**: React (Vite), TailwindCSS, Chart.js / Recharts for visualizations, React Router DOM.
- **Backend**: Node.js, Express, pg (node-postgres), JSON Web Tokens (JWT) for authentication.
- **Database**: PostgreSQL (relational structure for strict tracking constraints).

---

## Features

### 1. Unified Dashboard
- Visualizes key business metrics (Total Revenue, Active Orders, Pending Tasks, Machine Utilization).
- Displays graphical insights on sales trends, expense allocations, and production statuses.
- Lists the most recent active orders with live progress bars.

### 2. Order & Design Tracking
- Detailed management of custom embroidery orders.
- Maps multiple embroidery designs to a single order with itemized unit quantities, stitch count tracking, and pricing.
- Dynamic status tracking (Pending, In Progress, Completed, Shipped, Cancelled).

### 3. Live Production & Machine Management
- Manage machine states (Active, Idle, Under Maintenance).
- Assign specific orders and employees to active machines.
- Track production start and estimated/actual completion timestamps.

### 4. Billing & Financial Logs
- Generates itemized client invoices linked to order designs.
- Track payment logs (Paid, Unpaid, Partially Paid).
- Track operational expenses (Machine repairs, utility bills, raw material purchases) with full supplier matching.

### 5. Inventory & Staffing
- Keep tabs on raw material inventory (Thread cones, backing paper, needles) linked to suppliers.
- Monitor employee roles, shifts, and current production assignments.

---

## Project Structure

```text
embroidery-management-system/
├── client/                     # React Frontend
│   ├── public/                 # Static assets (logos, favicon)
│   ├── src/
│   │   ├── api/                # API client configuration
│   │   ├── components/         # Reusable UI components (Sidebar, Navbar, StatsCard)
│   │   ├── context/            # React Auth context
│   │   ├── pages/              # Main view screens (Dashboard, Login, Orders, Machines)
│   │   ├── App.jsx             # Route definitions and layout wrapper
│   │   └── main.jsx            # React root mount
│   ├── vite.config.js          # Vite config
│   └── package.json
│
├── server/                     # Node.js Express Backend
│   ├── config/                 # Database and environmental configs
│   ├── controllers/            # Route controllers (Auth, Dashboard, Orders, etc.)
│   ├── database/               # SQL Schema definition & Seed scripts
│   ├── middleware/             # Route guards (Auth verification, Error handling)
│   ├── models/                 # Database queries/models mappings
│   ├── routes/                 # API endpoints definition
│   ├── utils/                  # Helper scripts and database loaders
│   ├── server.js               # Express application entrypoint
│   └── package.json
```

---

## Installation Steps

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)
- npm or yarn

### 1. Database Setup
1. Create a database in PostgreSQL:
   ```sql
   CREATE DATABASE embroidery_db;
   ```
2. Import the schema and seed data located in the server repository:
   ```bash
   cd server/database
   psql -U postgres -d embroidery_db -f schema.sql
   psql -U postgres -d embroidery_db -f seed.sql
   ```

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file (see Environment Variables section below).
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Environment Variables

Create a `.env` file in the `/server` directory:

```env
# Server Configuration
PORT=5000

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=embroidery_db

# Security & JWT Tokens
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h
```

---

## API Overview

All API endpoints are prefixed with `/api`.

| Route | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Authenticates user & returns token | No |
| `/api/auth/register` | POST | Registers a new administrative user | No |
| `/api/dashboard/stats` | GET | Retrieve overall metrics & charts | Yes |
| `/api/orders` | GET/POST | Query or register client orders | Yes |
| `/api/designs` | GET/POST | Manage design items & rate cards | Yes |
| `/api/machines` | GET/PUT | List machines and update maintenance status | Yes |
| `/api/production` | GET/POST | Monitor live production lines & machine loads | Yes |
| `/api/payments` | GET/POST | Retrieve or record client payments | Yes |
| `/api/expenses` | GET/POST | Query operational business expense history | Yes |

---

## Future Enhancements

- **Barcoded Tracking**: Scan QR codes on order sheet printouts to update production status instantly.
- **Automated Database Backups**: Integrate automated daily `.sql` dumps to cloud storage.
- **Machine API Integration**: Pull telemetry data directly from digital embroidery machines to calculate true stitch speeds and thread utilization.
- **PDF Invoice Generation**: Allow one-click downloads of client invoices directly from the front end.
