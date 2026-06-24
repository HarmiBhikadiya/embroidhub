const pool = require('../config/db');

class Material {
  static async getAll({ search, lowstock, supplierid, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT m.*, s.Name as SupplierName, s.ContactNumber as SupplierContact
      FROM Material m
      LEFT JOIN Supplier s ON m.SupplierID = s.SupplierID
    `;
    let countQuery = `SELECT COUNT(*) FROM Material m`;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`m.MaterialName ILIKE $${params.length}`);
    }
    if (lowstock === 'true') {
      conditions.push(`m.QuantityAvailable < 100`);
    }
    if (supplierid) {
      params.push(supplierid);
      conditions.push(`m.SupplierID = $${params.length}`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    const countParams = [...params];
    query += ` ORDER BY m.MaterialID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    const result = await pool.query(
      `SELECT m.*, s.Name as SupplierName
       FROM Material m
       LEFT JOIN Supplier s ON m.SupplierID = s.SupplierID
       WHERE m.MaterialID = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID }) {
    const result = await pool.query(
      `INSERT INTO Material (MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID]
    );
    return result.rows[0];
  }

  static async update(id, { MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID }) {
    const result = await pool.query(
      `UPDATE Material SET MaterialName=$1, QuantityAvailable=$2, Unit=$3, CostPerUnit=$4, SupplierID=$5
       WHERE MaterialID=$6 RETURNING *`,
      [MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID, id]
    );
    return result.rows[0] || null;
  }

  static async updateStock(id, quantityUsed) {
    const result = await pool.query(
      `UPDATE Material SET QuantityAvailable = QuantityAvailable - $1
       WHERE MaterialID = $2 AND QuantityAvailable >= $1
       RETURNING *`,
      [quantityUsed, id]
    );
    return result.rows[0] || null;
  }

  static async getLowStock(threshold = 100) {
    const result = await pool.query(
      `SELECT m.*, s.Name as SupplierName, s.ContactNumber as SupplierContact
       FROM Material m
       LEFT JOIN Supplier s ON m.SupplierID = s.SupplierID
       WHERE m.QuantityAvailable < $1
       ORDER BY m.QuantityAvailable ASC`,
      [threshold]
    );
    return result.rows;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Material WHERE MaterialID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Material;
