const pool = require('../config/db');

class Design {
  static async getAll({ search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM Design';
    let countQuery = 'SELECT COUNT(*) FROM Design';
    const params = [];
    const countParams = [];

    if (search) {
      query += ` WHERE DesignName ILIKE $1 OR ThreadColors ILIKE $1`;
      countQuery += ` WHERE DesignName ILIKE $1 OR ThreadColors ILIKE $1`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ` ORDER BY DesignID DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    const result = await pool.query('SELECT * FROM Design WHERE DesignID = $1', [id]);
    return result.rows[0] || null;
  }

  static async create({ DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate }) {
    const result = await pool.query(
      `INSERT INTO Design (DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate]
    );
    return result.rows[0];
  }

  static async update(id, { DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate }) {
    const result = await pool.query(
      `UPDATE Design SET DesignName=$1, Description=$2, FilePath=$3, StitchCount=$4, ThreadColors=$5, DesignRate=$6
       WHERE DesignID=$7 RETURNING *`,
      [DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM Design WHERE DesignID = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Design;
