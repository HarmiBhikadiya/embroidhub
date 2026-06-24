const pool = require('../config/db');

class Production {
  static async getAll({ status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, o.Status as OrderStatus, o.CustomerID,
             c.Name as CustomerName,
             m.MachineName, m.Brand as MachineBrand,
             e.Name as EmployeeName
      FROM Production p
      LEFT JOIN Orders o ON p.OrderID = o.OrderID
      LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN Machine m ON p.MachineID = m.MachineID
      LEFT JOIN Employee e ON p.EmployeeID = e.EmployeeID
    `;
    let countQuery = 'SELECT COUNT(*) FROM Production p';
    const params = [];
    const countParams = [];

    if (status === 'ongoing') {
      query += ` WHERE p.EndDate IS NULL`;
      countQuery += ` WHERE p.EndDate IS NULL`;
    } else if (status === 'completed') {
      query += ` WHERE p.EndDate IS NOT NULL`;
      countQuery += ` WHERE p.EndDate IS NOT NULL`;
    }

    query += ` ORDER BY p.ProductionID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
      `SELECT p.*, o.Status as OrderStatus, o.TotalAmount,
              c.Name as CustomerName,
              m.MachineName, m.Brand as MachineBrand,
              e.Name as EmployeeName
       FROM Production p
       LEFT JOIN Orders o ON p.OrderID = o.OrderID
       LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
       LEFT JOIN Machine m ON p.MachineID = m.MachineID
       LEFT JOIN Employee e ON p.EmployeeID = e.EmployeeID
       WHERE p.ProductionID = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks }) {
    const result = await pool.query(
      `INSERT INTO Production (OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks]
    );
    return result.rows[0];
  }

  static async update(id, { OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks }) {
    const result = await pool.query(
      `UPDATE Production SET OrderID=$1, MachineID=$2, EmployeeID=$3, StartDate=$4, EndDate=$5, QuantityProduced=$6, Remarks=$7
       WHERE ProductionID=$8 RETURNING *`,
      [OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Production WHERE ProductionID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Production;
