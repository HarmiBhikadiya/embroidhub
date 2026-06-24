const pool = require('../config/db');

class Employee {
  static async getAll({ search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM Employee';
    let countQuery = 'SELECT COUNT(*) FROM Employee';
    const params = [];
    const countParams = [];

    if (search) {
      query += ` WHERE Name ILIKE $1 OR Role ILIKE $1 OR ContactNumber ILIKE $1`;
      countQuery += ` WHERE Name ILIKE $1 OR Role ILIKE $1 OR ContactNumber ILIKE $1`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ` ORDER BY EmployeeID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    const result = await pool.query('SELECT * FROM Employee WHERE EmployeeID = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ Name, ContactNumber, Role, Salary, JoinDate }) {
    const result = await pool.query(
      `INSERT INTO Employee (Name, ContactNumber, Role, Salary, JoinDate)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [Name, ContactNumber, Role, Salary, JoinDate]
    );
    return result.rows[0];
  }

  static async update(id, { Name, ContactNumber, Role, Salary, JoinDate }) {
    const result = await pool.query(
      `UPDATE Employee SET Name=$1, ContactNumber=$2, Role=$3, Salary=$4, JoinDate=$5
       WHERE EmployeeID=$6 RETURNING *`,
      [Name, ContactNumber, Role, Salary, JoinDate, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Employee WHERE EmployeeID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Employee;
