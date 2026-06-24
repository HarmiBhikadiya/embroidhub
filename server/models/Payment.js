const pool = require('../config/db');

class Payment {
  static async getAll({ orderid, mode, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, o.TotalAmount as OrderTotal, o.PaymentStatus,
             c.Name as CustomerName
      FROM Payment p
      LEFT JOIN Orders o ON p.OrderID = o.OrderID
      LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
    `;
    let countQuery = `SELECT COUNT(*) FROM Payment p`;
    const conditions = [];
    const params = [];

    if (orderid) {
      params.push(orderid);
      conditions.push(`p.OrderID = $${params.length}`);
    }
    if (mode) {
      params.push(mode);
      conditions.push(`p.PaymentMode = $${params.length}`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    const countParams = [...params];
    query += ` ORDER BY p.PaymentDate DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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

  static async getByOrderId(orderId) {
    const result = await pool.query(
      `SELECT * FROM Payment WHERE OrderID = $1 ORDER BY PaymentDate DESC`,
      [orderId]
    );
    return result.rows;
  }

  static async create({ OrderID, PaymentDate, AmountPaid, PaymentMode, TransactionReference }) {
    const result = await pool.query(
      `INSERT INTO Payment (OrderID, PaymentDate, AmountPaid, PaymentMode, TransactionReference)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [OrderID, PaymentDate, AmountPaid, PaymentMode, TransactionReference]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const existing = await pool.query('SELECT OrderID FROM Payment WHERE PaymentID = $1', [id]);
    const result = await pool.query('DELETE FROM Payment WHERE PaymentID = $1 RETURNING *', [id]);
    return { deleted: result.rows[0], orderId: existing.rows[0]?.orderid };
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM Payment WHERE PaymentID = $1', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Payment;
