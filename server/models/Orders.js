const pool = require('../config/db');

class Orders {
  static async getAll({ status, customerid, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, c.Name as CustomerName, c.Phone as CustomerPhone
      FROM Orders o
      LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
    `;
    let countQuery = `SELECT COUNT(*) FROM Orders o LEFT JOIN Customer c ON o.CustomerID = c.CustomerID`;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`o.Status = $${params.length}`);
    }
    if (customerid) {
      params.push(customerid);
      conditions.push(`o.CustomerID = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(c.Name ILIKE $${params.length} OR CAST(o.OrderID AS TEXT) ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    const countParams = [...params];
    query += ` ORDER BY o.OrderID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  static async getById(id) {
    const orderResult = await pool.query(
      `SELECT o.*, c.Name as CustomerName, c.Phone as CustomerPhone, c.Email as CustomerEmail,
              c.Address as CustomerAddress, c.GSTNumber
       FROM Orders o
       LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
       WHERE o.OrderID = $1`,
      [id]
    );

    if (!orderResult.rows[0]) return null;

    const designsResult = await pool.query(
      `SELECT od.*, d.DesignName, d.StitchCount, d.ThreadColors
       FROM OrderDesign od
       LEFT JOIN Design d ON od.DesignID = d.DesignID
       WHERE od.OrderID = $1`,
      [id]
    );

    const paymentsResult = await pool.query(
      `SELECT * FROM Payment WHERE OrderID = $1 ORDER BY PaymentDate DESC`,
      [id]
    );

    return {
      ...orderResult.rows[0],
      designs: designsResult.rows,
      payments: paymentsResult.rows,
    };
  }

  static async create({ CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus }) {
    const result = await pool.query(
      `INSERT INTO Orders (CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [CustomerID, OrderDate, DueDate, TotalAmount || 0, Status || 'Pending', PaymentStatus || 'Unpaid']
    );
    return result.rows[0];
  }

  static async update(id, { CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus }) {
    const result = await pool.query(
      `UPDATE Orders SET CustomerID=$1, OrderDate=$2, DueDate=$3, TotalAmount=$4, Status=$5, PaymentStatus=$6
       WHERE OrderID=$7 RETURNING *`,
      [CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus, id]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE Orders SET Status=$1 WHERE OrderID=$2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async updatePaymentStatus(id) {
    // Auto-calculate payment status based on total payments vs order amount
    const result = await pool.query(
      `SELECT o.TotalAmount, COALESCE(SUM(p.AmountPaid), 0) as TotalPaid
       FROM Orders o
       LEFT JOIN Payment p ON o.OrderID = p.OrderID
       WHERE o.OrderID = $1
       GROUP BY o.OrderID, o.TotalAmount`,
      [id]
    );

    if (!result.rows[0]) return null;

    const { totalamount, totalpaid } = result.rows[0];
    let paymentStatus = 'Unpaid';
    if (parseFloat(totalpaid) >= parseFloat(totalamount)) {
      paymentStatus = 'Paid';
    } else if (parseFloat(totalpaid) > 0) {
      paymentStatus = 'Partial';
    }

    const updateResult = await pool.query(
      `UPDATE Orders SET PaymentStatus=$1 WHERE OrderID=$2 RETURNING *`,
      [paymentStatus, id]
    );
    return updateResult.rows[0];
  }

  static async recalculateTotal(orderId) {
    const result = await pool.query(
      `UPDATE Orders SET TotalAmount = (
         SELECT COALESCE(SUM(SubTotal), 0) FROM OrderDesign WHERE OrderID = $1
       ) WHERE OrderID = $1 RETURNING *`,
      [orderId]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM Orders WHERE OrderID = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = Orders;
