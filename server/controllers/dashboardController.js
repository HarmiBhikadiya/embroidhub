const pool = require('../config/db');

const dashboardController = {
  // GET /api/dashboard/stats
  async getStats(req, res, next) {
    try {
      const [orders, revenue, pending, customers, employees] = await Promise.all([
        pool.query('SELECT COUNT(*) as total FROM Orders'),
        pool.query('SELECT COALESCE(SUM(TotalAmount), 0) as total FROM Orders WHERE Status IN (\'Completed\', \'Delivered\')'),
        pool.query('SELECT COUNT(*) as total FROM Orders WHERE Status = \'Pending\''),
        pool.query('SELECT COUNT(*) as total FROM Customer'),
        pool.query('SELECT COUNT(*) as total FROM Employee'),
      ]);

      res.json({
        success: true,
        data: {
          totalOrders: parseInt(orders.rows[0].total),
          totalRevenue: parseFloat(revenue.rows[0].total),
          pendingOrders: parseInt(pending.rows[0].total),
          totalCustomers: parseInt(customers.rows[0].total),
          totalEmployees: parseInt(employees.rows[0].total),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/dashboard/monthly-expenses?year=2024
  async getMonthlyExpenses(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const result = await pool.query(
        `SELECT 
          EXTRACT(MONTH FROM ExpenseDate) as month,
          SUM(Amount) as total
         FROM Expense
         WHERE EXTRACT(YEAR FROM ExpenseDate) = $1
         GROUP BY EXTRACT(MONTH FROM ExpenseDate)
         ORDER BY month`,
        [year]
      );

      // Fill in all 12 months
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: 0,
      }));

      result.rows.forEach((row) => {
        months[parseInt(row.month) - 1].total = parseFloat(row.total);
      });

      res.json({ success: true, data: months, year });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/dashboard/top-designs?limit=5
  async getTopDesigns(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const result = await pool.query(
        `SELECT d.DesignID, d.DesignName, d.DesignRate,
                SUM(od.Quantity) as total_quantity,
                SUM(od.SubTotal) as total_revenue,
                COUNT(DISTINCT od.OrderID) as order_count
         FROM Design d
         INNER JOIN OrderDesign od ON d.DesignID = od.DesignID
         GROUP BY d.DesignID, d.DesignName, d.DesignRate
         ORDER BY total_quantity DESC
         LIMIT $1`,
        [limit]
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/dashboard/monthly-revenue?year=2024
  async getMonthlyRevenue(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const result = await pool.query(
        `SELECT 
          EXTRACT(MONTH FROM OrderDate) as month,
          SUM(TotalAmount) as total
         FROM Orders
         WHERE EXTRACT(YEAR FROM OrderDate) = $1
           AND Status IN ('Completed', 'Delivered')
         GROUP BY EXTRACT(MONTH FROM OrderDate)
         ORDER BY month`,
        [year]
      );

      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: 0,
      }));

      result.rows.forEach((row) => {
        months[parseInt(row.month) - 1].total = parseFloat(row.total);
      });

      res.json({ success: true, data: months, year });
    } catch (err) {
      next(err);
    }
  },


  
  // GET /api/dashboard/order-status
  async getOrderStatusBreakdown(req, res, next) {
    try {
      const result = await pool.query(
        `SELECT Status, COUNT(*) as count
         FROM Orders
         GROUP BY Status`
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
