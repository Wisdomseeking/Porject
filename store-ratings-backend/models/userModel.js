const pool = require('../db');

const User = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return res.rows;
  },
  getById: async (id) => {
    const res = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    return res.rows[0];
  },
  create: async ({ name, email, address, password, role }) => {
    const res = await pool.query(
      'INSERT INTO users (name,email,address,password,role) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [name, email, address, password, role]
    );
    return res.rows[0];
  },
  update: async (id, { name, email, address, password, role }) => {
    const res = await pool.query(
      'UPDATE users SET name=$1,email=$2,address=$3,password=$4,role=$5 WHERE id=$6 RETURNING *',
      [name, email, address, password, role, id]
    );
    return res.rows[0];
  },
  delete: async (id) => {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    return true;
  },
};

module.exports = User;
