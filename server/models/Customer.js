const pool = require('../config/db');

class Customer {
  static async getAll({ search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM Customer';
    let countQuery = 'SELECT COUNT(*) FROM Customer';
    const params = [];
    const countParams = [];

    if (search) {
      const whereClause = ` WHERE Name ILIKE $1 OR Phone ILIKE $1 OR GSTNumber ILIKE $1`;
      query += whereClause;
      countQuery += whereClause;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ` ORDER BY CustomerID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    const result = await pool.query('SELECT * FROM Customer WHERE CustomerID = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ Name, Phone, Email, Address, GSTNumber }) {
    const result = await pool.query(
      `INSERT INTO Customer (Name, Phone, Email, Address, GSTNumber)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [Name, Phone, Email, Address, GSTNumber]
    );
    return result.rows[0];
  }

  static async update(id, { Name, Phone, Email, Address, GSTNumber }) {
    const result = await pool.query(
      `UPDATE Customer SET Name=$1, Phone=$2, Email=$3, Address=$4, GSTNumber=$5
       WHERE CustomerID=$6 RETURNING *`,
      [Name, Phone, Email, Address, GSTNumber, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM Customer WHERE CustomerID = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }

  static async getOrderHistory(id) {
    const result = await pool.query(
      `SELECT o.*, 
        COALESCE(json_agg(
          json_build_object('DesignName', d.DesignName, 'Quantity', od.Quantity, 'SubTotal', od.SubTotal)
        ) FILTER (WHERE d.DesignID IS NOT NULL), '[]') as designs
       FROM Orders o
       LEFT JOIN OrderDesign od ON o.OrderID = od.OrderID
       LEFT JOIN Design d ON od.DesignID = d.DesignID
       WHERE o.CustomerID = $1
       GROUP BY o.OrderID
       ORDER BY o.OrderDate DESC`,
      [id]
    );
    return result.rows;
  }
}

module.exports = Customer;
