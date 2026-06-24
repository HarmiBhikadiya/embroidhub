const pool = require('../config/db');

class Expense {
  static async getAll({ type, month, year, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT e.*, u.Username as RecordedByUser
      FROM Expense e
      LEFT JOIN UserLogin u ON e.RecordedBy = u.UserID
    `;
    let countQuery = 'SELECT COUNT(*) FROM Expense e';
    const conditions = [];
    const params = [];

    if (type) {
      params.push(type);
      conditions.push(`e.ExpenseType = $${params.length}`);
    }
    if (month && year) {
      params.push(parseInt(month));
      params.push(parseInt(year));
      conditions.push(`EXTRACT(MONTH FROM e.ExpenseDate) = $${params.length - 1}`);
      conditions.push(`EXTRACT(YEAR FROM e.ExpenseDate) = $${params.length}`);
    } else if (year) {
      params.push(parseInt(year));
      conditions.push(`EXTRACT(YEAR FROM e.ExpenseDate) = $${params.length}`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    const countParams = [...params];
    query += ` ORDER BY e.ExpenseDate DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
      `SELECT e.*, u.Username as RecordedByUser
       FROM Expense e
       LEFT JOIN UserLogin u ON e.RecordedBy = u.UserID
       WHERE e.ExpenseID = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ ExpenseDate, ExpenseType, Description, Amount, PaidTo, RecordedBy }) {
    const result = await pool.query(
      `INSERT INTO Expense (ExpenseDate, ExpenseType, Description, Amount, PaidTo, RecordedBy)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ExpenseDate, ExpenseType, Description, Amount, PaidTo, RecordedBy]
    );
    return result.rows[0];
  }

  static async update(id, { ExpenseDate, ExpenseType, Description, Amount, PaidTo }) {
    const result = await pool.query(
      `UPDATE Expense SET ExpenseDate=$1, ExpenseType=$2, Description=$3, Amount=$4, PaidTo=$5
       WHERE ExpenseID=$6 RETURNING *`,
      [ExpenseDate, ExpenseType, Description, Amount, PaidTo, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Expense WHERE ExpenseID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  static async getMonthlySummary(year) {
    const result = await pool.query(
      `SELECT 
        EXTRACT(MONTH FROM ExpenseDate) as month,
        EXTRACT(YEAR FROM ExpenseDate) as year,
        ExpenseType,
        SUM(Amount) as total
       FROM Expense
       WHERE EXTRACT(YEAR FROM ExpenseDate) = $1
       GROUP BY EXTRACT(MONTH FROM ExpenseDate), EXTRACT(YEAR FROM ExpenseDate), ExpenseType
       ORDER BY month`,
      [year]
    );
    return result.rows;
  }
}

module.exports = Expense;
