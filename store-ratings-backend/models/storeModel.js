const pool = require('../db');

const Store = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM stores ORDER BY id ASC');
    return res.rows;
  },
  getById: async (id) => {
    const res = await pool.query('SELECT * FROM stores WHERE id=$1', [id]);
    return res.rows[0];
  },
  create: async ({ name, email, address }) => {
    const res = await pool.query(
      'INSERT INTO stores (name,email,address,rating) VALUES($1,$2,$3,0) RETURNING *',
      [name, email, address]
    );
    return res.rows[0];
  },
  update: async (id, { name, email, address }) => {
    const res = await pool.query(
      'UPDATE stores SET name=$1,email=$2,address=$3 WHERE id=$4 RETURNING *',
      [name, email, address, id]
    );
    return res.rows[0];
  },
  delete: async (id) => {
    await pool.query('DELETE FROM stores WHERE id=$1', [id]);
    return true;
  },
};

module.exports = Store;
