const pool = require('../config/db');

class Supplier {
  static async getAll({ search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM Supplier';
    let countQuery = 'SELECT COUNT(*) FROM Supplier';
    const params = [];
    const countParams = [];

    if (search) {
      query += ` WHERE Name ILIKE $1 OR ContactNumber ILIKE $1 OR Email ILIKE $1`;
      countQuery += ` WHERE Name ILIKE $1 OR ContactNumber ILIKE $1 OR Email ILIKE $1`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ` ORDER BY SupplierID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    const result = await pool.query('SELECT * FROM Supplier WHERE SupplierID = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ Name, ContactNumber, Email, Address }) {
    const result = await pool.query(
      `INSERT INTO Supplier (Name, ContactNumber, Email, Address)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [Name, ContactNumber, Email, Address]
    );
    return result.rows[0];
  }

  static async update(id, { Name, ContactNumber, Email, Address }) {
    const result = await pool.query(
      `UPDATE Supplier SET Name=$1, ContactNumber=$2, Email=$3, Address=$4
       WHERE SupplierID=$5 RETURNING *`,
      [Name, ContactNumber, Email, Address, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Supplier WHERE SupplierID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Supplier;
