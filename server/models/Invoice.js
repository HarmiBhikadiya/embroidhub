const pool = require('../config/db');

class Invoice {
  static async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT i.*, o.OrderDate, o.TotalAmount as OrderTotal, o.Status as OrderStatus,
             c.Name as CustomerName, c.GSTNumber,
             u.Username as GeneratedByUser
      FROM Invoice i
      LEFT JOIN Orders o ON i.OrderID = o.OrderID
      LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN UserLogin u ON i.GeneratedBy = u.UserID
      ORDER BY i.InvoiceID DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = 'SELECT COUNT(*) FROM Invoice';

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery),
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
    const result = await pool.query(
      `SELECT i.*, o.OrderDate, o.DueDate, o.TotalAmount as OrderTotal, o.Status as OrderStatus,
              c.Name as CustomerName, c.Phone as CustomerPhone, c.Email as CustomerEmail,
              c.Address as CustomerAddress, c.GSTNumber,
              u.Username as GeneratedByUser
       FROM Invoice i
       LEFT JOIN Orders o ON i.OrderID = o.OrderID
       LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
       LEFT JOIN UserLogin u ON i.GeneratedBy = u.UserID
       WHERE i.InvoiceID = $1`,
      [id]
    );

    if (!result.rows[0]) return null;

    // Get order designs for the invoice
    const designs = await pool.query(
      `SELECT od.*, d.DesignName, d.StitchCount, d.ThreadColors
       FROM OrderDesign od
       LEFT JOIN Design d ON od.DesignID = d.DesignID
       WHERE od.OrderID = $1`,
      [result.rows[0].orderid]
    );

    return {
      ...result.rows[0],
      designs: designs.rows,
    };
  }

  static async create({ OrderID, InvoiceDate, TaxAmount, Discount, NetTotal, Remarks, GeneratedBy }) {
    const result = await pool.query(
      `INSERT INTO Invoice (OrderID, InvoiceDate, TaxAmount, Discount, NetTotal, Remarks, GeneratedBy)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [OrderID, InvoiceDate, TaxAmount, Discount, NetTotal, Remarks, GeneratedBy]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Invoice WHERE InvoiceID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Invoice;
