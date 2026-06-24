const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const designRoutes = require('./routes/designRoutes');
const orderDesignRoutes = require('./routes/orderDesignRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const machineRoutes = require('./routes/machineRoutes');
const productionRoutes = require('./routes/productionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const materialRoutes = require('./routes/materialRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/order-designs', orderDesignRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================================
// Health check
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Embroidery Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Embroidery Management System API',
    docs: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/login',
      customers: 'GET /api/customers',
      orders: 'GET /api/orders',
      designs: 'GET /api/designs',
      employees: 'GET /api/employees',
      machines: 'GET /api/machines',
      production: 'GET /api/production',
      payments: 'GET /api/payments',
      suppliers: 'GET /api/suppliers',
      materials: 'GET /api/materials',
      invoices: 'GET /api/invoices',
      expenses: 'GET /api/expenses',
      dashboard: 'GET /api/dashboard/stats',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================
// Start server
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🧵 ==========================================`);
  console.log(`   Embroidery Management System API`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Health:     http://localhost:${PORT}/api/health`);
  console.log(`🧵 ==========================================\n`);
});

module.exports = app;
