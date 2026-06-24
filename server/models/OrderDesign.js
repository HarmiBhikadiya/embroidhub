const pool = require('../config/db');

class OrderDesign {
  static async getByOrderId(orderId) {
    const result = await pool.query(
      `SELECT od.*, d.DesignName, d.StitchCount, d.ThreadColors, d.DesignRate
       FROM OrderDesign od
       LEFT JOIN Design d ON od.DesignID = d.DesignID
       WHERE od.OrderID = $1
       ORDER BY od.OrderDesignID`,
      [orderId]
    );
    return result.rows;
  }

  static async create({ OrderID, DesignID, Quantity, PricePerUnit }) {
    const SubTotal = Quantity * PricePerUnit;
    const result = await pool.query(
      `INSERT INTO OrderDesign (OrderID, DesignID, Quantity, PricePerUnit, SubTotal)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [OrderID, DesignID, Quantity, PricePerUnit, SubTotal]
    );
    return result.rows[0];
  }

  static async update(id, { Quantity, PricePerUnit }) {
    const SubTotal = Quantity * PricePerUnit;
    const result = await pool.query(
      `UPDATE OrderDesign SET Quantity=$1, PricePerUnit=$2, SubTotal=$3
       WHERE OrderDesignID=$4 RETURNING *`,
      [Quantity, PricePerUnit, SubTotal, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    // Get OrderID before deleting for recalculation
    const existing = await pool.query('SELECT OrderID FROM OrderDesign WHERE OrderDesignID = $1', [id]);
    const result = await pool.query('DELETE FROM OrderDesign WHERE OrderDesignID = $1 RETURNING *', [id]);
    return { deleted: result.rows[0], orderId: existing.rows[0]?.orderid };
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM OrderDesign WHERE OrderDesignID = $1', [id]);
    return result.rows[0] || null;
  }
}

module.exports = OrderDesign;
