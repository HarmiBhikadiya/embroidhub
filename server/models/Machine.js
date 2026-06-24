const pool = require('../config/db');

class Machine {
  static async getAll({ search, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM Machine';
    let countQuery = 'SELECT COUNT(*) FROM Machine';
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(MachineName ILIKE $${params.length} OR Brand ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`Status = $${params.length}`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    const countParams = [...params];
    query += ` ORDER BY MachineID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    const result = await pool.query('SELECT * FROM Machine WHERE MachineID = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ MachineName, Brand, Model, Status, Location }) {
    const result = await pool.query(
      `INSERT INTO Machine (MachineName, Brand, Model, Status, Location)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [MachineName, Brand, Model, Status || 'Active', Location]
    );
    return result.rows[0];
  }

  static async update(id, { MachineName, Brand, Model, Status, Location }) {
    const result = await pool.query(
      `UPDATE Machine SET MachineName=$1, Brand=$2, Model=$3, Status=$4, Location=$5
       WHERE MachineID=$6 RETURNING *`,
      [MachineName, Brand, Model, Status, Location, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Machine WHERE MachineID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Machine;
