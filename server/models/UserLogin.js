const pool = require('../config/db');

class UserLogin {
  static async getByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM UserLogin WHERE Username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  static async getById(id) {
    const result = await pool.query(
      'SELECT UserID, Username, Role, LastLogin, Status FROM UserLogin WHERE UserID = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ Username, PasswordHash, Role }) {
    const result = await pool.query(
      `INSERT INTO UserLogin (Username, PasswordHash, Role, Status)
       VALUES ($1, $2, $3, 'Active') RETURNING UserID, Username, Role, Status`,
      [Username, PasswordHash, Role || 'Employee']
    );
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    await pool.query(
      'UPDATE UserLogin SET LastLogin = NOW() WHERE UserID = $1',
      [id]
    );
  }

  static async getAll() {
    const result = await pool.query(
      'SELECT UserID, Username, Role, LastLogin, Status FROM UserLogin ORDER BY UserID'
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE UserLogin SET Status = $1 WHERE UserID = $2 RETURNING UserID, Username, Role, Status',
      [status, id]
    );
    return result.rows[0] || null;
  }
}

module.exports = UserLogin;
