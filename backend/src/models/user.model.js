// src/models/user.model.js

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const UserModel = {
  async create({ email, password, walletAddress, role = 'user' }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, wallet_address, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, email, wallet_address, role, created_at`,
      [email.toLowerCase(), passwordHash, walletAddress, role]
    );
    return rows[0];
  },

  async findById(userId) {
    const { rows } = await db.query(
      'SELECT id, email, wallet_address, role, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  },

  async updateLastLogin(userId) {
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
  },

  async deactivate(userId) {
    await db.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
  },
};

module.exports = UserModel;